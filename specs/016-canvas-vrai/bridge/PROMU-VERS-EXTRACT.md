# `photos-census.js` a déménagé

`specs/016-canvas-vrai/bridge/photos-census.js` → **`extract/figma/photo-parity/photos-census.js`**

Promu par la spec 017 (T006), sur la décision que 016 avait elle-même parquée pour 017
(`specs/016-canvas-vrai/plan.md:101`). **Un déplacement, pas une réécriture** : même code, même
usage, même sortie.

Motif : un instrument de porte qui vit dans le dossier d'une spec close rouille. Il est désormais
lancé depuis le dépôt, aux côtés de son comparateur `photos-verify.mts` (même déménagement) et
d'un script npm, `npm run photos:verify`.

Voir `extract/figma/photo-parity/README.md` — le partage des rôles entre les deux outils et leur
CLI réelle y sont écrits.

`bindings-audit.js` n'a pas bougé : il reste local à 016.
