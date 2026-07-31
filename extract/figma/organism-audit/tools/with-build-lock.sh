#!/bin/bash
# Verrou global build+audit — plusieurs agents itèrent en parallèle mais un
# seul `npm run build` / audit à la fois : le build réécrit src/components/**
# et un audit qui lit pendant l'écriture mesurerait un arbre à moitié généré.
#
#   bash extract/figma/organism-audit/tools/with-build-lock.sh <commande…>
#
# mkdir est atomique ; le verrou expire au bout de 15 min (garde-fou si un
# détenteur meurt sans le rendre).
set -euo pipefail
LOCK=/tmp/ds-contract-013-build.lock
for i in $(seq 1 900); do
  if mkdir "$LOCK" 2>/dev/null; then
    trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT
    "$@"
    exit $?
  fi
  # verrou trop vieux = détenteur mort → on le casse (15 min)
  if [ -d "$LOCK" ] && [ "$(( $(date +%s) - $(stat -f %m "$LOCK" 2>/dev/null || echo 0) ))" -gt 900 ]; then
    rmdir "$LOCK" 2>/dev/null || true
    continue
  fi
  sleep 2
done
echo "with-build-lock: impossible d'obtenir le verrou après 30 min" >&2
exit 2
