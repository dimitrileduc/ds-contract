#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  VOIR LE RÉSULTAT — un seul script, rien à comprendre.
#
#    ./voir.sh          monte le site Odoo et affiche les adresses à ouvrir
#    ./voir.sh stop     détruit tout (il ne reste rien sur la machine)
#
#  Durée du premier montage : ~2 minutes. Les images Docker sont déjà en cache.
# ─────────────────────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")"

# Contournement d'un souci de CETTE machine : l'assistant d'identifiants de
# Docker Desktop ne répond jamais, ce qui fait pendre docker indéfiniment.
# On lui donne une configuration sans cet assistant. Rien d'autre ne change.
CFG="$(pwd)/.docker-cfg"
mkdir -p "$CFG"
echo '{"auths":{}}' > "$CFG/config.json"
ln -sfn ~/.docker/cli-plugins "$CFG/cli-plugins" 2>/dev/null || true
cp -r ~/.docker/contexts "$CFG/" 2>/dev/null || true
export DOCKER_CONFIG="$CFG"

if [ "$1" = "stop" ]; then
  echo "→ destruction de l'instance…"
  docker compose -p odoo19 down -v --remove-orphans
  echo
  echo "✓ Terminé. Il ne reste rien : ni conteneur, ni base, ni réseau."
  echo "  (Les images Docker sont gardées, c'est ce qui rend le prochain montage rapide.)"
  exit 0
fi

echo "→ 1/3  démarrage de la base de données…"
docker compose -p odoo19 up -d db >/dev/null

LOG=/tmp/odoo-install.log
echo "→ 2/3  installation d'Odoo et du module (~2 min, c'est le plus long)…"
if ! docker compose -p odoo19 run --rm web \
  odoo -d odoo -i base,website,piqueray_ds --stop-after-init >"$LOG" 2>&1; then
  echo
  echo "✖ L'installation a ÉCHOUÉ. Les 30 dernières lignes de $LOG :"
  echo
  tail -30 "$LOG"
  exit 1
fi

echo "→ 3/3  démarrage du site…"
docker compose -p odoo19 up -d >/dev/null
pret=non
for _ in $(seq 1 40); do
  if [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://localhost:8069/web/login 2>/dev/null)" = "200" ]; then
    pret=oui
    break
  fi
  sleep 3
done

# Ne JAMAIS annoncer « c'est prêt » sans l'avoir vérifié : la boucle ci-dessus
# peut s'épuiser, et le message de succès s'imprimait quand même.
if [ "$pret" != "oui" ]; then
  echo
  echo "✖ Le site n'a pas répondu 200 sur http://localhost:8069/web/login après ~2 min."
  echo "  L'installation, elle, s'est bien terminée — le journal est dans $LOG."
  echo "  À essayer :  docker compose -p odoo19 logs --tail 50 web"
  exit 1
fi

cat <<'FIN'

════════════════════════════════════════════════════════════════════════════
  C'EST PRÊT.  Identifiants :  admin  /  admin
════════════════════════════════════════════════════════════════════════════

  ▸ LE BLOC, TEL QU'UN VISITEUR LE VOIT
      http://localhost:8069/
    (il faut d'abord le poser une fois — voir ci-dessous)

  ▸ LES 3 COMPOSANTS SÉPARÉMENT, pour comparer avec notre référence
      http://localhost:8069/piqueray-mesure/button
      http://localhost:8069/piqueray-mesure/section-header
      http://localhost:8069/piqueray-mesure/presentation

  ▸ POSER LE BLOC SUR LA PAGE D'ACCUEIL
      1. ouvrir  http://localhost:8069/odoo/action-website.website_preview?path=/&enable_editor=1
      2. dans le panneau de droite, cliquer la catégorie « Content »
      3. taper « Piqueray » dans la recherche
      4. cliquer la vignette qui apparaît
      5. cliquer « Save » en haut à droite

  ▸ CE QU'IL FAUT ESSAYER (c'est là que ça coince, voir le rapport)
      · cliquer dans le TEXTE de droite et taper → ça marche, c'est voulu
      · cliquer dans le TITRE de gauche et taper → ÇA MARCHE AUSSI, ce n'est PAS voulu
      · cliquer n'importe où sur le bloc → le panneau montre des réglages
        d'Odoo (couleur de fond, largeur, hauteur) qu'on n'a jamais demandés

  ▸ QUAND TU AS FINI
      ./voir.sh stop

════════════════════════════════════════════════════════════════════════════
FIN
