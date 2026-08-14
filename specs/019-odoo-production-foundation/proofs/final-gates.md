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

## Replay du repin Équipe — 2026-08-11

| Porte | Statut | Résultat |
|---|---:|---|
| inputs / authoring / module | pass | 9 contrats au graphDigest `96f4b959…`, couverture 66/66 props et 100/100 parts, module `19.0.1.2.0` |
| assets / dérivation | pass | 8 sorties propres et déterministes; 10 fichiers, 25 blocs, 1 298 lignes et 72 706 octets manuels; 0 adaptation non classée |
| Foundation / sections / sécurité | pass | éditabilité 44/44, Presentation 11/11, Google Reviews 15/15 + sécurité 14/14, Hero 11/11, Équipe 16/16 |
| responsive | pass | Presentation, Hero et Équipe sans overflow à 1728 et 1440 px; Équipe conserve 4 colonnes |
| isolation / install-update / versions | pass | 2×4 instances isolées, update quatre racines intact, états current/stale/unknown reconnus |
| visuel | pass mesuré | Équipe 0 %, Hero 0.0074 %, Presentation 2.6093 %, Google Reviews 1.5961 %; résidus non nuls attribués |
| `npm run odoo:qualification -- --check --require-qualified` | pass | `qualified-with-limits`, 0 manquant/fail/skipped; seule la latence de geste reste non mesurée |
