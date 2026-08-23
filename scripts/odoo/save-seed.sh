#!/usr/bin/env bash
#
# save-seed.sh — spec 024, T004.
#
# Export an Odoo instance's homepage state into a versionable seed bundle:
#   integrations/odoo/qa/seed/db.dump          (pg_dump -Fc, custom compressed format)
#   integrations/odoo/qa/seed/filestore.tar.gz (gzip tar of the Odoo filestore for that DB)
#
# The DB holds ir_ui_view (COW views), ir_attachment metadata, website.page/menu.
# The filestore holds the actual uploaded image bytes referenced by ir_attachment —
# a DB-only dump renders broken <img> tags on restore (research R3). Both are required.
#
# Default target is the OWNER instance (piqueray-odoo-test) — that is where the
# montaged content lives, and save only READS (pg_dump + tar), never writes. Pass
# --project to save from a different instance (e.g. the QA instance, for a
# structural test of this script).
#
# Usage:
#   bash scripts/odoo/save-seed.sh [--project <docker-project>] [--db <name>] [--out <dir>]
#   npm run odoo:save
#
# Exit codes: 0 ok · 1 bad usage · 2 container not running · 3 dump/tar empty or failed

set -euo pipefail

# --- Defaults ---------------------------------------------------------------
PROJECT="piqueray-odoo-test"          # owner instance: where the content lives
DB_NAME=""                            # empty => auto-discover
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="$REPO_ROOT/integrations/odoo/qa/seed"
FILESTORE_BASE="/var/lib/odoo/.local/share/Odoo/filestore"

# --- Parse args -------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) PROJECT="${2:?--project needs a value}"; shift 2 ;;
    --db)      DB_NAME="${2:?--db needs a value}"; shift 2 ;;
    --out)     OUT_DIR="${2:?--out needs a value}"; shift 2 ;;
    -h|--help)
      grep -E '^#( |$)' "$0" | sed -E 's/^# ?//'
      exit 0 ;;
    *) echo "save-seed: unknown argument '$1'" >&2; exit 1 ;;
  esac
done

echo "seed> saving from Docker project '$PROJECT'"

# --- Resolve containers via compose labels (robust to naming scheme) --------
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/docker-project.sh"
DB_C="$(pqr_find_container "$PROJECT" db)"
ODOO_C="$(pqr_find_container "$PROJECT" odoo)"

if [[ -z "$DB_C" ]]; then
  echo "save-seed: db container for project '$PROJECT' is not running." >&2
  echo "           start it first, or pass --project <name> for the right instance." >&2
  exit 2
fi
if [[ -z "$ODOO_C" ]]; then
  echo "save-seed: odoo container for project '$PROJECT' is not running." >&2
  exit 2
fi

# --- Discover DB user + name ------------------------------------------------
DB_USER="$(pqr_discover_db_user "$DB_C")"

if [[ -z "$DB_NAME" ]]; then
  # Portable (bash 3.2 — macOS): no mapfile. Read newline-separated names.
  DB_LIST="$(pqr_list_dbs "$DB_C" "$DB_USER")"
  DB_COUNT="$(printf '%s\n' "$DB_LIST" | grep -c . || true)"
  if [[ "${DB_COUNT:-0}" -eq 0 ]]; then
    echo "save-seed: no application database found in project '$PROJECT'." >&2
    exit 3
  elif [[ "${DB_COUNT:-0}" -gt 1 ]]; then
    echo "save-seed: multiple databases found:" >&2
    printf '%s\n' "$DB_LIST" | sed 's/^/  - /' >&2
    echo "           disambiguate with --db <name>." >&2
    exit 1
  fi
  DB_NAME="$(printf '%s\n' "$DB_LIST" | grep . | head -n1)"
fi

echo "seed>   db container   : $DB_C"
echo "seed>   odoo container : $ODOO_C"
echo "seed>   database       : $DB_NAME (user $DB_USER)"

mkdir -p "$OUT_DIR"
DUMP_FILE="$OUT_DIR/db.dump"
FS_FILE="$OUT_DIR/filestore.tar.gz"

# --- 1) pg_dump (custom, compressed) ----------------------------------------
echo "seed> [1/2] pg_dump -Fc $DB_NAME -> $DUMP_FILE"
if ! docker exec "$DB_C" pg_dump -U "$DB_USER" -Fc "$DB_NAME" > "$DUMP_FILE"; then
  echo "save-seed: pg_dump failed." >&2
  rm -f "$DUMP_FILE"
  exit 3
fi
DUMP_SIZE=$(wc -c < "$DUMP_FILE" | tr -d ' ')
if [[ "$DUMP_SIZE" -lt 1024 ]]; then
  echo "save-seed: dump is suspiciously small ($DUMP_SIZE bytes) — aborting." >&2
  rm -f "$DUMP_FILE"
  exit 3
fi

# --- 2) filestore tar -------------------------------------------------------
echo "seed> [2/2] tar filestore/$DB_NAME -> $FS_FILE"
if docker exec "$ODOO_C" test -d "$FILESTORE_BASE/$DB_NAME"; then
  if ! docker exec "$ODOO_C" tar -czf - -C "$FILESTORE_BASE" "$DB_NAME" > "$FS_FILE"; then
    echo "save-seed: filestore tar failed." >&2
    rm -f "$FS_FILE"
    exit 3
  fi
else
  echo "save-seed: WARNING — filestore/$DB_NAME does not exist (no uploaded images yet)." >&2
  echo "           writing an empty (but valid) filestore archive." >&2
  docker exec "$ODOO_C" sh -c "mkdir -p '$FILESTORE_BASE/$DB_NAME' && tar -czf - -C '$FILESTORE_BASE' '$DB_NAME'" > "$FS_FILE"
fi
FS_SIZE=$(wc -c < "$FS_FILE" | tr -d ' ')

# --- Summary ----------------------------------------------------------------
human() { awk -v b="$1" 'BEGIN{ split("B KB MB GB",u); s=b; i=1; while(s>=1024 && i<4){s/=1024;i++} printf "%.2f %s", s, u[i] }'; }
TOTAL=$(( DUMP_SIZE + FS_SIZE ))
echo ""
echo "seed> OK — seed written to $OUT_DIR"
echo "seed>   db.dump          : $(human "$DUMP_SIZE")"
echo "seed>   filestore.tar.gz : $(human "$FS_SIZE")"
echo "seed>   total            : $(human "$TOTAL")"
if [[ "$TOTAL" -gt $(( 50 * 1024 * 1024 )) ]]; then
  echo "seed>   NOTE: seed exceeds the 50 MB target (SC-003)." >&2
fi
echo "seed>   restore with     : npm run odoo:restore   (targets piqueray-odoo-qa by default)"
