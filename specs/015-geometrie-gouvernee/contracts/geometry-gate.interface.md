# Interface — geometry-gate (le contrôle FR-001)

**Fichiers** : `extract/geometry-gate/gate.ts` (pur, zéro I/O) + `extract/geometry-gate/run.ts` (CLI) · script npm `geometry:gate` · fixture d'eval data-only `evals/fixtures/geometry-gate-policy-check.ts`. Patron : `extract/figma/measure-gate/` (la forme prouvée trois fois dans le dépôt).

## 1. Entrées

| Entrée | Source | Lecture |
|---|---|---|
| Contrats gouvernés | `contracts/*.contract.json` (34, comptés en direct) | `inventoryLiterals(contractsById)` de `extract/figma/organism-audit/baseline.ts` — l'énumérateur existant (pointeurs RFC 6901, ordre byte-stable), jamais réécrit |
| Registre des littéraux nommés | `contracts/named-literals.registry.json` | lu EN DIRECT à chaque exécution (FR-003) — jamais un cliché |

## 2. Population : les canaux géométriques (ensemble fermé)

```
width · height · min-width · min-height · gap ·
padding-block · padding-inline · padding-top · padding-right · padding-bottom · padding-left ·
background-image   (admis UNIQUEMENT au titre d'exception déclarée — le canal des dégradés)
```

Une entrée d'inventaire (`literals`/`literalsByProp`) dont le canal appartient à cet ensemble est une **dimension géométrique portée en littéral**. Les canaux de trait (`border-*`), de peinture (`color`, `background-color`) et de typo (`font-*`, `line-height`, `letter-spacing`) sont hors population — la spec 015 gouverne la géométrie de mise en page ; élargir l'ensemble est une évolution versionnée de cette interface, pas un réglage silencieux.

## 3. Verdict par entrée

| Situation | Verdict |
|---|---|
| Canal géométrique porté par `tokens`/`tokensByProp` (référence) | comptée `governedRefs` — conforme |
| Littéral géométrique + entrée de registre au même `(contractId, pointer)` + `value` byte-identique | comptée `namedLiterals` — conforme |
| Littéral géométrique sans entrée de registre | **`invisible-literal`** — refus |
| Littéral + entrée de registre mais valeurs différentes | **`registry-value-mismatch`** — refus (le littéral nommé est SURVEILLÉ, pas seulement recensé) |
| Entrée de registre dont le pointeur ne résout plus | **`registry-entry-orphaned`** — refus (une exception morte se retire) |
| Entrée de registre sans `reason`/`decidedOn`/`receiptId` | **`registry-entry-undocumented`** — refus (une addition silencieuse n'existe pas) |

## 4. Sortie

`GeometryGateResult` (voir data-model.md §5) : `verdict pass|fail`, exit 0|1 (2 = `blocked`, artefact illisible — décidé par run.ts, jamais par gate.ts), `counts { contracts, geometricEntries, governedRefs, namedLiterals, invisible, byContract, byChannel }`, `refusals[]` jamais anonymes. `--json` imprime le résultat machine ; le mode par défaut imprime le compte vif (« Comptage (en direct, jamais figé) », comme measure-gate).

**SC-001 se lit ici** : `counts.invisible === 0` et verdict `pass` à la clôture. Le relevé d'ouverture (~260 attendu) est publié par la même commande à T0 — le chiffre du brief n'est jamais recopié.

## 5. Discipline Claims Rule

Ordre imposé : fixture data-only (contrats synthétiques couvrant chaque code de refus + le cas conforme) → cas d'eval enregistré dans `evals/run.ts` → seulement ensuite la phrase de capacité dans README/docs. La fixture prouve aussi le déterminisme (deux exécutions, même JSON).
