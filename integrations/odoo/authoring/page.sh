#!/usr/bin/env bash
# page.sh — construit UNE page Odoo depuis son fichier de contenu.
#
# Usage : npm run odoo:page -- <nom-de-page> [projet-docker]
#   <nom-de-page>  = le fichier integrations/odoo/authoring/pages/<nom>.json
#   [projet-docker]= l'instance cible (défaut: $PQR_PROJECT ou piqueray-odoo-qa)
#
# Exemple : npm run odoo:page -- home piqueray-odoo-home
set -euo pipefail

NAME="${1:-}"
PROJECT="${2:-${PQR_PROJECT:-piqueray-odoo-qa}}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESC="$HERE/pages/$NAME.json"
ASSETS="$HERE/assets"

if [ -z "$NAME" ] || [ ! -f "$DESC" ]; then
  echo "usage: npm run odoo:page -- <nom-de-page> [projet-docker]" >&2
  echo "pages disponibles :" >&2
  ls "$HERE/pages" 2>/dev/null | sed 's/\.json$//; s/^/  - /' >&2
  exit 1
fi

echo "page> construction de '$NAME' dans '$PROJECT'"
bash "$HERE/run-compose.sh" "$PROJECT" "$DESC" "$ASSETS"
