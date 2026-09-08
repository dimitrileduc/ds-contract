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
| `npm run eval` | **1 rouge introduit par cette vague, corrigé** ; 3 rouges ANTÉRIEURS, nommés ci-dessous. Le compte vif de `npm run eval` est la seule autorité, jamais recopié en prose. |

### Les rouges de `npm run eval`, un par un

**Celui de cette vague, et il est corrigé.** `reassurances-grid-variant-isolation` lisait le bloc Réassurances dans le
FICHIER de `pages/home.json`. La home ne le recopie plus : elle le REPREND du commun. Ce que l'éval vérifie n'a pas
changé — « la composition fixe exactement cinq cartes en 5Cartes » — mais elle doit le lire **là où le composeur le
lit**, dans le descripteur **résolu**. Lire le fichier brut reviendrait à exiger la copie locale que SC-004 interdit
désormais. L'éval a été corrigée en ce sens, pas contournée.

**Les trois autres sont ANTÉRIEURS à cette vague et déjà nommés** dans `specs/tiny/vague-033-etats-cartes.md` § « les
trois rouges sont nommés » (2026-09-07) :

| Cas | Pourquoi il n'est pas de cette vague |
|---|---|
| `figma-text-styles-piqueray` | recensement de styles de texte déplacé par des chantiers concurrents dans ce worktree ; aucun contrat n'a été touché ici. |
| `preservation-013-clobber-detected` | porte sur `ds.footer`, `ds.faq`, `ds.reassurances` — **aucun contrat de cette vague** (re-pin ZÉRO vérifié). |
| `computed-floor-gate` | plancher d'égalité du replay calculé, sans rapport avec les pages Odoo ni avec l'instrument de mesure. |

Aucun n'est masqué, aucun n'est « corrigé » ici : les toucher demanderait de modifier des contrats, ce que SC-010
interdit à cette vague.

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
