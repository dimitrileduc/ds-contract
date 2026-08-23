#!/usr/bin/env bash
# docker-project.sh — helpers Docker/Odoo partagés (spec 024 + authoring).
#
# SOURCÉ, jamais exécuté. Résout conteneurs, base et attente de santé pour une
# instance Odoo identifiée par son PROJET Docker (pas par le compose.yaml du
# dépôt) — c'est pourquoi ces helpers ne réutilisent pas ceux de run.mts, liés
# au compose QA. Un seul point pour les 3 scripts (save / restore / compose).

# pqr_find_container <project> <service> [--all]
#   --all inclut les conteneurs arrêtés (docker ps -aq). Sinon, en cours seulement.
pqr_find_container() {
  local project="$1" service="$2" q="-q"
  [ "${3:-}" = "--all" ] && q="-aq"
  docker ps $q \
    --filter "label=com.docker.compose.project=$project" \
    --filter "label=com.docker.compose.service=$service" | head -n1
}

# pqr_discover_db_user <db_container>  → nom d'utilisateur PG (défaut: odoo)
pqr_discover_db_user() {
  local u; u="$(docker exec "$1" printenv POSTGRES_USER 2>/dev/null || true)"
  printf '%s' "${u:-odoo}"
}

# pqr_list_dbs <db_container> <db_user>  → bases applicatives, une par ligne
pqr_list_dbs() {
  docker exec "$1" psql -U "$2" -d postgres -tAc \
    "select datname from pg_database where datname not in ('template0','template1','postgres') order by datname;"
}

# pqr_wait_healthy <container> [timeout_s]  → imprime le dernier statut ; 0 si sain
pqr_wait_healthy() {
  local c="$1" timeout="${2:-180}" deadline status
  deadline=$(( $(date +%s) + timeout ))
  while [ "$(date +%s)" -lt "$deadline" ]; do
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}nohealth{{end}}' "$c" 2>/dev/null || echo unknown)"
    case "$status" in healthy|nohealth) printf '%s' "$status"; return 0 ;; esac
    sleep 3
  done
  printf '%s' "${status:-unknown}"; return 1
}
