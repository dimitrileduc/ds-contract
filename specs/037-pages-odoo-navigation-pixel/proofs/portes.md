# T069–T071 — Les portes, et la vérification du re-pin ZÉRO

Date : **2026-09-08** · worktree `comet-yogurt`.

## Les portes de la constitution

| Porte | Code de sortie |
|---|---|
| `npm run build` | **0** |
| `npm run parity` | **0** |
| `npm run plugin:check` | **0** |
| `npx tsx scripts/deterministic-roundtrip.mjs` | **0** |
| `node scripts/core-browser-check.mjs` | **0** |
| `npx tsc --noEmit` | **0** |
| `npx tsc -p tsconfig.build.json` | **0** |
| `npm run eval` | voir `RAPPORT-CLOTURE.md` (le compte vif est la seule autorité, jamais recopié en prose) |

## Les portes Odoo

| Porte | Code de sortie |
|---|---|
| `odoo:authoring:check` | **0** |
| `odoo:module:check` | **0** |
| `odoo:derivation:check` | **0** |
| `odoo:typecheck` | **0** |
| `odoo:visual:selftest` | **0** |
| `odoo:pages:check` (neuve) | **0** |
| `odoo:pages:selftest` (neuve) | **0** |

## Le re-pin ZÉRO, annoncé et vérifié (SC-010, D14)

`git status` après la séquence complète, restreint aux chemins que la spec s'interdisait de toucher :

```
evals/golden.json                     — inchangé
figma-sync/plugin/engine.receipt.json — inchangé
examples/polaris/                     — inchangé
src/                                  — inchangé
contracts/                            — inchangé
tokens/                               — inchangé
catalog/                              — inchangé
```

**Sept chemins sur sept, aucun changement.** L'arbre de travail est propre. Aucun contrat, aucun jeton, aucun bloc,
aucun émetteur, aucun généré du pipeline contrat→surfaces n'a bougé. `catalog/` non plus — la dérive non gardée
connue de la spec 018 ne s'est pas manifestée sur cette vague.

## FR-022 — aucune version Figma neuve datée de cette vague

Relevé en lecture (`figma_get_file_versions`) : la version la plus récente du fichier est
**« bafore v2 pages odoo » (2396817404458011167, 2026-09-08 11:13:50 Z)**, antérieure à l'exécution de cette vague
(premier geste de pont à 12:16 Z). Toutes les versions plus anciennes sont celles de la vague 031 et du montage
Contactez-nous, déjà tracées.

**Tous les gestes de pont de cette vague sont en LECTURE** : `getNodeByIdAsync`, `exportAsync`, `getImageByHash`,
`getStyledTextSegments`. Aucune écriture canevas, donc aucune version neuve — et rien à acquitter au titre de §X.
