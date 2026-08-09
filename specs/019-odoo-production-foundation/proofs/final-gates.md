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
