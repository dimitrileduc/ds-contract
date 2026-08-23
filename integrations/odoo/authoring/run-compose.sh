#!/usr/bin/env bash
# run-compose.sh — compose une page Odoo depuis un descripteur, dans une instance cible.
#
# Usage: bash integrations/odoo/authoring/run-compose.sh <docker-project> <descriptor.json> <images-dir>
# Ex:    bash integrations/odoo/authoring/run-compose.sh piqueray-odoo-home integrations/odoo/authoring/pages/home.json /path/to/imgs
#
# Copie le composeur + descripteur + images dans le conteneur, exécute
# compose_page.py via `odoo shell`, puis redémarre Odoo (cache vues).
set -euo pipefail

PROJECT="${1:?projet docker requis}"
DESCRIPTOR="${2:?descripteur JSON requis}"
IMAGES_DIR="${3:?dossier images requis}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/../../../scripts/odoo/lib/docker-project.sh"

ODOO_C="$(pqr_find_container "$PROJECT" odoo)"
DB_C="$(pqr_find_container "$PROJECT" db)"
[ -z "$ODOO_C" ] && { echo "compose: conteneur odoo introuvable pour $PROJECT" >&2; exit 2; }
[ -z "$DB_C" ] && { echo "compose: conteneur db introuvable pour $PROJECT" >&2; exit 2; }

# Nom de la base : fourni, sinon la première base applicative découverte.
DB_USER="$(pqr_discover_db_user "$DB_C")"
DB="${PQR_DB_NAME:-$(pqr_list_dbs "$DB_C" "$DB_USER" | head -n1)}"
[ -z "$DB" ] && { echo "compose: aucune base applicative trouvée dans $PROJECT" >&2; exit 2; }

echo "compose> projet=$PROJECT db=$DB (user $DB_USER)"
docker exec "$ODOO_C" sh -c 'rm -rf /tmp/pqr_compose /tmp/pqr_imgs && mkdir -p /tmp/pqr_compose /tmp/pqr_imgs'
docker cp "$HERE/compose_page.py" "$ODOO_C:/tmp/pqr_compose/compose_page.py"
docker cp "$DESCRIPTOR"           "$ODOO_C:/tmp/pqr_compose/descriptor.json"
docker cp "$IMAGES_DIR/."         "$ODOO_C:/tmp/pqr_imgs/"

docker exec -e PQR_DESCRIPTOR=/tmp/pqr_compose/descriptor.json -e PQR_IMG_DIR=/tmp/pqr_imgs -i "$ODOO_C" \
  odoo shell -d "$DB" --no-http --db_host=db --db_user="$DB_USER" --db_password="${PQR_DB_PASSWORD:-odoo}" --log-level=error \
  < "$HERE/compose_page.py" 2>&1 | grep -E 'COMPOSE_OK|Error|Traceback|error:' | tail -20

echo "compose> restart odoo"
docker restart "$ODOO_C" >/dev/null
echo "compose> odoo: $(pqr_wait_healthy "$ODOO_C" 120)"
