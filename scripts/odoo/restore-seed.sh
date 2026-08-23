#!/usr/bin/env bash
#
# restore-seed.sh — spec 024, T005.
#
# Restore a seed bundle (db.dump + filestore.tar.gz) into a target Odoo instance,
# reconstituting the homepage exactly as it was saved.
#
# Default target is the QA instance (piqueray-odoo-qa) — that is where agents work.
# Restore is DESTRUCTIVE: it drops and recreates the target database and replaces
# its filestore. It therefore REFUSES to target the OWNER instance
# (piqueray-odoo-test) unless --owner is passed explicitly (FR-009). The save path
# reads from the owner; the restore path must never write to it by accident.
#
# The database NAME is taken from the filestore archive's top-level directory (the
# seed is self-describing), or overridden with --db.
#
# Steps: stop Odoo -> terminate connections -> drop+create DB -> pg_restore
#        -> replace filestore (docker cp) -> start Odoo -> chown -> wait healthy.
#
# Usage:
#   bash scripts/odoo/restore-seed.sh [--project <docker-project>] [--db <name>] [--owner] [--in <dir>]
#   npm run odoo:restore
#   npm run odoo:restore -- --project piqueray-odoo-agent7
#
# Exit codes: 0 ok · 1 bad usage / owner-refusal · 2 container not running · 3 seed missing · 4 restore failed

set -euo pipefail

# --- Defaults ---------------------------------------------------------------
PROJECT="piqueray-odoo-qa"            # agent territory: default restore target
OWNER_PROJECT="piqueray-odoo-test"    # protected: the owner instance
DB_NAME=""                            # empty => derive from filestore archive
ALLOW_OWNER=0
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
IN_DIR="$REPO_ROOT/integrations/odoo/qa/seed"
FILESTORE_BASE="/var/lib/odoo/.local/share/Odoo/filestore"

# --- Parse args -------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) PROJECT="${2:?--project needs a value}"; shift 2 ;;
    --db)      DB_NAME="${2:?--db needs a value}"; shift 2 ;;
    --in)      IN_DIR="${2:?--in needs a value}"; shift 2 ;;
    --owner)   ALLOW_OWNER=1; shift ;;
    -h|--help)
      grep -E '^#( |$)' "$0" | sed -E 's/^# ?//'
      exit 0 ;;
    *) echo "restore-seed: unknown argument '$1'" >&2; exit 1 ;;
  esac
done

# --- Owner protection (FR-009) ----------------------------------------------
if [[ "$PROJECT" == "$OWNER_PROJECT" && "$ALLOW_OWNER" -ne 1 ]]; then
  echo "restore-seed: REFUSING to restore into the owner instance '$OWNER_PROJECT'." >&2
  echo "              Restore is destructive. If you really mean it, pass --owner." >&2
  exit 1
fi

DUMP_FILE="$IN_DIR/db.dump"
FS_FILE="$IN_DIR/filestore.tar.gz"

# --- Seed present? ----------------------------------------------------------
if [[ ! -s "$DUMP_FILE" ]]; then
  echo "restore-seed: seed dump not found or empty: $DUMP_FILE" >&2
  echo "              run 'npm run odoo:save' first." >&2
  exit 3
fi
if [[ ! -s "$FS_FILE" ]]; then
  echo "restore-seed: seed filestore not found or empty: $FS_FILE" >&2
  exit 3
fi

# --- Derive DB name from the filestore archive's top-level dir ---------------
if [[ -z "$DB_NAME" ]]; then
  DB_NAME="$(tar -tzf "$FS_FILE" 2>/dev/null | head -n1 | cut -d/ -f1)"
  if [[ -z "$DB_NAME" ]]; then
    echo "restore-seed: could not derive DB name from $FS_FILE — pass --db <name>." >&2
    exit 1
  fi
fi

echo "restore> target project : $PROJECT"
echo "restore> database        : $DB_NAME"
[[ "$PROJECT" == "$OWNER_PROJECT" ]] && echo "restore> !!! OWNER OVERRIDE (--owner) — writing to the owner instance !!!"

# --- Resolve containers (--all: restore stops odoo, so tolerate stopped) ----
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/docker-project.sh"
DB_C="$(pqr_find_container "$PROJECT" db --all)"
ODOO_C="$(pqr_find_container "$PROJECT" odoo --all)"
if [[ -z "$DB_C" || -z "$ODOO_C" ]]; then
  echo "restore-seed: containers for project '$PROJECT' not found." >&2
  echo "              bring the instance up first (docker compose ... up -d)." >&2
  exit 2
fi

DB_USER="$(pqr_discover_db_user "$DB_C")"
echo "restore>   db container   : $DB_C"
echo "restore>   odoo container : $ODOO_C (user $DB_USER)"

START_TS=$(date +%s)

# --- 1) Clean stale filestore (while container is up), then stop Odoo --------
echo "restore> [1/6] clearing stale filestore + stopping Odoo container"
# -u root est OBLIGATOIRE : le conteneur exécute par défaut l'utilisateur `odoo`,
# qui ne peut pas supprimer un arbre appartenant à un autre uid (cas d'un filestore
# posé par un docker cp précédent). Sans root, le nettoyage échoue en silence et
# des fichiers périmés survivent à la restauration.
if ! docker exec -u root "$ODOO_C" rm -rf "$FILESTORE_BASE/$DB_NAME"; then
  echo "restore-seed: could not clear the stale filestore at $FILESTORE_BASE/$DB_NAME." >&2
  exit 4
fi
docker stop "$ODOO_C" >/dev/null

# --- 2) Terminate lingering connections, drop + recreate DB -----------------
echo "restore> [2/6] drop + recreate database '$DB_NAME'"
docker exec -i "$DB_C" psql -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 <<SQL
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS "$DB_NAME";
CREATE DATABASE "$DB_NAME" OWNER "$DB_USER";
SQL

# --- 3) pg_restore ----------------------------------------------------------
echo "restore> [3/6] pg_restore -> $DB_NAME"
if ! docker exec -i "$DB_C" pg_restore -U "$DB_USER" --no-owner --role="$DB_USER" -d "$DB_NAME" < "$DUMP_FILE"; then
  echo "restore-seed: pg_restore reported errors (often benign role/comment warnings)." >&2
  echo "              continuing — verify the page after restart." >&2
fi

# --- 4) Replace filestore ---------------------------------------------------
echo "restore> [4/6] replace filestore/$DB_NAME"
# docker cp works on a stopped container. Extract the archive locally, then copy
# the <db>/ tree into the container's filestore base. The stale copy was already
# removed in step 1 (while the container was still up).
TMP_EXTRACT="$(mktemp -d)"
tar -xzf "$FS_FILE" -C "$TMP_EXTRACT"
docker cp "$TMP_EXTRACT/$DB_NAME" "$ODOO_C:$FILESTORE_BASE/" 2>/dev/null \
  || { echo "restore-seed: docker cp of filestore failed." >&2; rm -rf "$TMP_EXTRACT"; exit 4; }
rm -rf "$TMP_EXTRACT"

# --- 5) Start Odoo ----------------------------------------------------------
echo "restore> [5/6] starting Odoo container"
docker start "$ODOO_C" >/dev/null
# Ownership. L'archive est extraite LOCALEMENT (hôte) avant le docker cp : les
# fichiers portent donc l'uid de l'utilisateur hôte, pas celui d'Odoo. Odoo tourne
# en `odoo` (uid 100) et doit POUVOIR ÉCRIRE dans ce répertoire — il y dépose les
# bundles d'assets qu'il génère à la volée. Un filestore non inscriptible ne casse
# pas la restauration : il casse le RENDU, et seulement au premier chargement de
# page (PermissionError sur /web/assets/… → 500 → page sans CSS ni JS).
#
# -u root est OBLIGATOIRE (un `docker exec` nu s'exécute en `odoo`, qui ne peut pas
# chown des fichiers d'un autre uid), et l'échec NE DOIT PAS être avalé : la panne
# qu'il produit est invisible jusqu'à ce qu'un humain regarde la page.
if ! docker exec -u root "$ODOO_C" chown -R odoo:odoo "$FILESTORE_BASE/$DB_NAME"; then
  echo "restore-seed: chown of the filestore failed — Odoo could not own $FILESTORE_BASE/$DB_NAME." >&2
  exit 4
fi
# Constat, pas confiance : le répertoire doit appartenir à odoo ET être inscriptible.
FS_OWNER="$(docker exec "$ODOO_C" stat -c '%U' "$FILESTORE_BASE/$DB_NAME" 2>/dev/null || echo '?')"
if [[ "$FS_OWNER" != "odoo" ]]; then
  echo "restore-seed: filestore owner is '$FS_OWNER', expected 'odoo' — assets would fail to render." >&2
  exit 4
fi
if ! docker exec "$ODOO_C" test -w "$FILESTORE_BASE/$DB_NAME"; then
  echo "restore-seed: filestore is not writable by the Odoo user — assets would fail to render." >&2
  exit 4
fi

# --- 6) Wait for healthy ----------------------------------------------------
echo "restore> [6/6] waiting for Odoo healthcheck"
STATUS="$(pqr_wait_healthy "$ODOO_C" 180)"

ELAPSED=$(( $(date +%s) - START_TS ))
echo ""
if [[ "$STATUS" == "healthy" || "$STATUS" == "nohealth" ]]; then
  echo "restore> OK — '$DB_NAME' restored into '$PROJECT' in ${ELAPSED}s."
  PORT="$(docker inspect --format '{{range $p, $conf := .NetworkSettings.Ports}}{{if eq $p "8069/tcp"}}{{(index $conf 0).HostPort}}{{end}}{{end}}' "$ODOO_C" 2>/dev/null || true)"
  [[ -n "${PORT:-}" ]] && echo "restore>   open: http://localhost:$PORT/"
  if [[ "$ELAPSED" -gt 120 ]]; then
    echo "restore>   NOTE: restore took longer than the 2 min target (SC-003)." >&2
  fi
else
  echo "restore-seed: Odoo did not become healthy within 180s (last status: $STATUS)." >&2
  exit 4
fi
