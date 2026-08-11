# Portes finales — 2026-08-09

| Commande | Statut | Résultat live |
|---|---:|---|
| `npm run build` | pass | tokens, schéma, 34 composants, 8 assets Odoo, dérivation 16 blocs |
| `npm run parity` | pass | aucun nouveau drift; 3 constats baselinés |
| `npm run eval` | pass | 199/199, 48 legacy quarantined et nommés |
| `npm run plugin:check` | pass | flux applicables verts; 3 skips propres au périmètre Piqueray nommés |
| `npx tsx scripts/deterministic-roundtrip.mjs` | pass | boucle déterministe complète, repeat 5 instances |
| `node scripts/core-browser-check.mjs` | pass | 4 emitters dans une VM sans globals Node |
| `npx tsc --noEmit` | pass | aucune erreur |
| `npx tsc -p tsconfig.build.json` | pass | aucune erreur |
| `npm run odoo:qualification -- --require-qualified` | pass | qualified-with-limits, 0 manquant/fail/skipped |

Le premier sweep a révélé que les diagnostics de marqueurs imbriqués n'étaient pas sérialisables par le schéma. Après correction vers des identifiants canoniques, la relance propre a passé 199/199. Une tentative intermédiaire n'a pas démarré (`ENOTEMPTY`) parce que le premier scratch était encore actif; elle ne constitue pas un run d'evals.

## Replay du repin — 2026-08-11

| Porte | Statut | Résultat |
|---|---:|---|
| inputs / authoring / module | pass | 5 contrats au graphDigest `9cf060ab…`, couverture 36/36 props et 66/66 parts, module `19.0.1.0.1` |
| assets / dérivation | pass | 8 sorties propres et déterministes, 16 blocs, 0 adaptation non classée |
| Foundation / sections / sécurité | pass | éditabilité 44/44, Presentation 11/11, Google Reviews 15/15, sécurité Google Reviews 14/14 |
| responsive | pass | SectionHeader Fill et Button Hug/nowrap sans overflow à 1728 et 1440 px |
| isolation / install-update / versions | pass | 2+2 instances isolées, update intact, états current/stale/unknown reconnus |
| visuel | pass mesuré | Presentation 2.6093 %, Google Reviews 1.5961 %, géométrie/contenu alignés et résidus attribués |
| `npm run odoo:qualification -- --check --require-qualified` | pass | `qualified-with-limits`, 0 manquant/fail/skipped; seule la latence de geste reste non mesurée |
