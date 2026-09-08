#!/usr/bin/env bash
# poser-photo.sh — une photo exportée du canevas → un asset d'authoring nommé.
#
#   bash …/poser-photo.sh <hash> <nom-asset>
#
# Règle du 2026-09-07, appliquée ici sans exception : **JPEG, 1728 px de large au
# plus**. Un hero PNG de 5,6 Mo a déjà été servi tel quel ; le JPEG à la taille du
# cadre pèse dix fois moins, et la page se charge dix fois plus vite.
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
DEST="$REPO/integrations/odoo/authoring/assets/$NOM.jpg"

L=$(sips -g pixelWidth "$SRC" | awk '/pixelWidth/{print $2}')
if [ "$L" -gt 1728 ]; then
  sips -s format jpeg -s formatOptions 85 --resampleWidth 1728 "$SRC" --out "$DEST" >/dev/null
else
  sips -s format jpeg -s formatOptions 85 "$SRC" --out "$DEST" >/dev/null
fi
TAILLE=$(du -h "$DEST" | cut -f1)
LFIN=$(sips -g pixelWidth "$DEST" | awk '/pixelWidth/{print $2}')
printf '%-28s %s (source %s px -> %s px)\n' "$NOM.jpg" "$TAILLE" "$L" "$LFIN"
