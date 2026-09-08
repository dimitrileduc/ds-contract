#!/usr/bin/env bash
# instance-037.sh — l'instance Odoo JETABLE de la spec 037 (T002, D10).
#
# Jamais l'instance owner `piqueray-odoo-test` (8071), jamais le pilote (8087).
# Projet `piqueray-odoo-037`, port 8109 (8110 pour le bus) — libres au 2026-09-08.
#
#   bash specs/037-pages-odoo-navigation-pixel/tools/instance-037.sh up      # lève + base neuve + install
#   bash …/instance-037.sh shell   < script.py                               # odoo shell
#   bash …/instance-037.sh down                                              # détruit (jetable)
#
# Les variables d'environnement priment sur `qa/.env` (précédence docker compose).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
export COMPOSE_PROJECT_NAME=piqueray-odoo-037
export PQR_ODOO_PORT=8109
export PQR_ODOO_GEVENT_PORT=8110
export PQR_DB_NAME=piqueray_037
COMPOSE=("docker" "compose" "-f" "$HERE/integrations/odoo/qa/compose.yaml")

case "${1:-up}" in
  up)
    "${COMPOSE[@]}" up -d db odoo
    for i in $(seq 1 80); do curl -fsS -o /dev/null "http://localhost:8109/web/health" && break || sleep 3; done
    "${COMPOSE[@]}" exec -T db psql -U odoo -d postgres -c "DROP DATABASE IF EXISTS piqueray_037 WITH (FORCE);"
    "${COMPOSE[@]}" run --rm odoo odoo -d piqueray_037 -i piqueray_ds \
      --db_host=db --without-demo=True --stop-after-init --log-level=warn
    "${COMPOSE[@]}" restart odoo
    for i in $(seq 1 80); do curl -fsS -o /dev/null "http://localhost:8109/web/health" && break || sleep 3; done
    echo "037_UP http://localhost:8109"
    ;;
  shell)
    "${COMPOSE[@]}" run --rm -T odoo odoo shell -d piqueray_037 --db_host=db --no-http --log-level=error
    ;;
  down) "${COMPOSE[@]}" down -v ;;
  *) echo "usage: instance-037.sh [up|shell|down]" >&2; exit 1 ;;
esac
