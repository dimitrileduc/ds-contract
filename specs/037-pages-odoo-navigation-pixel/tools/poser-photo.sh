#!/usr/bin/env bash
# poser-photo.sh — une photo exportée du canevas → un asset d'authoring nommé.
#
#   bash …/poser-photo.sh <hash> <nom-asset>
#
# Règle du 2026-09-15 (elle REMPLACE celle du 2026-09-07, « JPEG 1728 px au
# plus ») : **WebP, à la largeur d'affichage de sa famille**. Ce script ne
# décide plus de la taille — il dépose les octets d'origine en WebP, et
# `scripts/odoo/optimize-images.ts` applique la règle de famille derrière.
#
# Pourquoi ce n'est plus du JPEG, et pourquoi ça compte ici précisément :
# `compose_page.py::IMG_EXTENSIONS` cherche `.jpg .jpeg .png .webp` et prend LE
# PREMIER TROUVÉ. Un `.jpg` déposé à côté du `.webp` du même nom masquerait ce
# dernier sans qu'un seul message ne le dise — le dossier est entièrement en
# WebP depuis la passe d'optimisation.
#
# Les octets d'entrée sont ceux d'ORIGINE (`getImageByHash().getBytesAsync()`),
# jamais un `exportAsync` du nœud — piège daté du 2026-09-04, où l'export d'un
# nœud image avait rendu 149 octets.
set -euo pipefail
HASH="${1:?hash requis}"
# NB : pas d apostrophe dans ce message — bash traite le quote simple d un
# ${var:?message} comme une ouverture de chaîne, et le script meurt sur un
# « unexpected EOF » qui ne pointe pas la vraie ligne (2026-09-08).
NOM="${2:?nom asset requis}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SRC="$REPO/.page-parity/037/vues/img-$HASH.jpg"
[ -f "$SRC" ] || SRC="$REPO/.page-parity/037/vues/img-$HASH.png"
[ -f "$SRC" ] || { echo "photo non exportée : img-$HASH.(jpg|png)" >&2; exit 1; }
DEST="$REPO/integrations/odoo/authoring/assets/$NOM.webp"

command -v cwebp >/dev/null || { echo "cwebp absent (brew install webp)" >&2; exit 1; }

# Qualité 82 et métadonnées réduites au profil couleur : les mêmes réglages que
# l outil d optimisation, pour que la passe suivante ne trouve rien à refaire.
cwebp -quiet -q 82 -m 6 -alpha_q 100 -metadata icc "$SRC" -o "$DEST"

TAILLE=$(du -h "$DEST" | cut -f1)
printf '%-28s %s\n' "$NOM.webp" "$TAILLE"
echo "  → applique la règle de famille : npx tsx scripts/odoo/optimize-images.ts --write"
echo "  → puis vérifie                 : npm run odoo:images:check"
