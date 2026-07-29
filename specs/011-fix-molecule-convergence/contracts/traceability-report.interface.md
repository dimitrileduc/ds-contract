# Interface Contract — Traceability & Closure Report v1

## Purpose

Permettre à un reviewer de relier chaque fait Figma à sa cause contractuelle, sa
projection générée, sa preuve et son verdict, tout en distinguant le checkpoint, le WIP
hérité et le delta 011.

## Required report sections

1. **Attribution**
   - checkpoint historique ;
   - baseline WIP ;
   - status/hashes initiaux ;
   - fichiers attribuables à 011 ;
   - sorties régénérées et source causale ;
   - confirmation zéro mutation Figma.
2. **Coverage summary**
   - sept molécules ;
   - cas attendus/observés/manquants/inattendus ;
   - images attendues/prouvées ;
   - refus/skips/declines.
3. **Traceability matrix**
4. **Component verdicts**
5. **Repository gates**
6. **Named limits and unresolved failures**
7. **Review receipt**
   - checklist des sept verdicts ;
   - durée totale en secondes, inférieure ou égale à 600 ;
   - chemins ouverts pour chaque preuve et limites nommées.

## Traceability matrix

Une ligne par fait requis et par cas qui le prouve :

| Column | Required content |
|---|---|
| `target` | Une des sept molécules |
| `caseId` | ID du cas |
| `figmaFactId` | ObservableFact stable |
| `figmaReference` | fileVersion + nodeId + property/layer/imageRef |
| `contractFact` | contract id/version + JSON Pointer |
| `generatedFact` | surface + fichier/selector ou reçu d'émission |
| `fixture` | asset id/hash ou `N/A` |
| `visibility` | résumé des deux VisibilityReceipt |
| `geometry` | verdict + delta/justification |
| `pixels` | raw, masked diagnostic, mask coverage, régions |
| `semantics` | assertions et verdict |
| `evidence` | liens vers référence/généré/diff/triptyque |
| `verdict` | pass/fail/blocked + raisons |

Les colonnes ne peuvent pas être vides ; `N/A` est autorisé seulement avec une raison
typée.

## Component verdict table

| target | required cases | passing | failing | blocked | verdict |
|---|---:|---:|---:|---:|---|

`verdict=pass` seulement si `required=passing` et `failing=blocked=0`.

## Repository gates table

| Gate | Command | Exit | Evidence |
|---|---|---:|---|
| build | `npm run build` | 0 | receipt/log hash |
| parity | `npm run parity` | 0 | `parity/report.json` |
| eval | `npm run eval` | 0 | live N/N output + `evals/results.json` |
| emitters | `npm run emitters:check` | 0 | receipt |
| catalog | `npm run catalog && npm run verify:catalog` | 0 | receipt |
| plugin | `npm run plugin:check` | 0 | receipt |
| determinism | `npx tsx scripts/deterministic-roundtrip.mjs` | 0 | receipt |
| browser purity | `node scripts/core-browser-check.mjs` | 0 | receipt |
| types | `npx tsc --noEmit && npx tsc -p tsconfig.build.json` | 0 | receipt |
| image fixtures | `npm run images:selftest` | 0 | receipt |
| visual campaign | campaign CLI | 0 | `proofs/visual/result.json` |

Le compte d'évals n'est jamais copié comme constante dans un document vivant ; le reçu du
run est l'autorité.

## Attribution rules

- `checkpoint→WIP` est historique, non attribué à 011.
- `WIP→final` est le candidat delta 011.
- chaque sortie générée cite la source autorisée qui l'a modifiée.
- une sortie modifiée sans source causale rend le rapport `fail`.
- un fichier préexistant hors périmètre qui disparaît ou change sans justification rend
  le rapport `fail`.
- toute trace de commande Figma write/push/update rend le rapport `fail`.
- le snapshot terminal couvre tous les sources, sorties et preuves sauf ses deux fichiers
  auto-référentiels déclarés : `proofs/attribution/final.json` et
  `proofs/closure/gates.json`. Ces exclusions exactes restent listées dans les deux reçus ;
  toute autre exclusion rend le rapport `fail`.

## Named-limit rule

Une limite reste visible dans la section finale et dans la ligne concernée. Elle ne
change jamais `fail`/`blocked` en `pass`. Si ProductCard `bouton=true`, une image
Realisation ou un cas Field n'a pas de référence immuable, le rapport doit refuser la
clôture.

## Review-time objective

Le rapport trie d'abord les sept verdicts, puis permet de descendre vers chaque cas et
triptyque. Les identifiants sont stables et les preuves sont relatives au dossier de
feature. La clôture conserve `proofs/closure/review.json` avec les sept cibles cochées,
les chemins de preuve consultés et `elapsedSeconds <= 600`, afin qu'un reviewer puisse
expliquer les sept verdicts en moins de dix minutes.
