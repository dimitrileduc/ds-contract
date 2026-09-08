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

# ── Résolution AVANT Docker (spec 037, D2) ──────────────────────────────────
# Le descripteur peut reprendre un contenu COMMUN par référence et poser des
# destinations ; `compose_page.py` ne connaît ni l'un ni l'autre — il tourne
# dans le conteneur, sans `commun/` sous la main. Le résolveur produit le
# descripteur RÉSOLU côté hôte et REFUSE en nommant (bloc inconnu, clé
# orpheline, destination hors grammaire, copie locale d'un bloc commun). Un
# refus doit coûter une seconde, pas un cycle Docker complet : rien n'est copié
# dans le conteneur tant que la résolution n'a pas réussi.
RESOLU="$(mktemp -t pqr-page-XXXXXX.json)"
trap 'rm -f "$RESOLU"' EXIT
echo "page> résolution de '$NAME'"
npx tsx "$HERE/../../../scripts/odoo/resolve-page.ts" "$NAME" --out "$RESOLU"

echo "page> construction de '$NAME' dans '$PROJECT'"
bash "$HERE/run-compose.sh" "$PROJECT" "$RESOLU" "$ASSETS"
