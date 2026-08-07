# `photos-verify.mts` a déménagé

`specs/016-canvas-vrai/tools/photos-verify.mts` → **`extract/figma/photo-parity/photos-verify.mts`**

Promu par la spec 017 (T006), sur la décision que 016 avait elle-même parquée pour 017
(`specs/016-canvas-vrai/plan.md:101`). **Un déplacement, pas une réécriture** : sa CLI est restée
la sienne — deux recensements en arguments **positionnels**, plus `--out` et `--selftest`.

Il se lance maintenant par `npm run photos:verify`. Voir `extract/figma/photo-parity/README.md`.

**Un détail à connaître** : son `--out` par défaut pointe toujours vers
`specs/016-canvas-vrai/proofs/photos/photos-report.json`. C'est volontairement inchangé — modifier
la CLI aurait fait de la promotion une réécriture. Passer `--out` explicitement.

`revue-visuelle.mts` et `serve-scripts.mjs` n'ont pas bougé : ils restent locaux à 016.
