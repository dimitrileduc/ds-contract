# Interface Contract — Campaign Report v1

## Purpose

Définir le rapport humain généré depuis `proofs/result.json`, les douze dossiers
individuels et le reçu de revue. Le Markdown n'est jamais l'autorité du verdict.

## Required campaign report sections

1. **Provenance**
   - branche/commit de campagne ;
   - fileKey/version Figma read-only ;
   - hash campagne, contrats, assets, dépendances et bundle React ;
   - confirmation zéro commande Figma write/push/update.
2. **Twelve-verdict index**
   - douze lignes dans l'ordre exact des trois vagues ;
   - preuve/dossier et motif principal directement liés.
3. **Wave execution**
   - prérequis et état classifié de chaque vague ;
   - résultats de dépendance de la vague 3.
4. **Coverage summary**
   - faits/cas attendus, observés, manquants, inattendus ;
   - preuves non probantes, refus et skips.
5. **Traceability matrix**
6. **Per-organism verdicts**
7. **Named divergences and limits**
8. **Deferred hardcoded/token work**
9. **Repository and campaign gates**
10. **Review receipt**

Une section vide écrit explicitement `Aucun`.

## Twelve-verdict index

| wave | target | required facts | proved | divergent | limited | not proven | dependency | verdict | dossier |
|---:|---|---:|---:|---:|---:|---:|---|---|---|

Règles :

- exactement douze lignes ;
- ordre identique au manifeste ;
- compteurs dérivés des faits du résultat individuel ;
- `dossier` pointe vers `organisms/<id>/REPORT.md` ;
- un parent bloqué cite le reçu de dépendance, pas seulement son nom.

## Traceability matrix

Une ligne par fait obligatoire :

| Column | Required content |
|---|---|
| `wave` | 1, 2 ou 3 |
| `target` | organisme |
| `caseId` | cas ou `N/A` avec motif de blocage |
| `factId` / `kind` | ID stable et catégorie |
| `figmaReference` | fileVersion + node/layer/property/imageRef |
| `contractReference` | ID/version + JSON Pointer |
| `generatedReference` | fichier/export/selector + bundle hash |
| `inputs` | propriétés Figma et props React équivalentes |
| `visibility` | signal des deux côtés |
| `geometry` | verdict/deltas/justification |
| `pixels` | brut, diagnostic masqué et régions |
| `semantics` | assertions et résultat |
| `evidence` | liens vers les cinq artefacts |
| `localizedSource` | source d'écart ou `N/A` pour proved |
| `deferredWork` | item reporté ou `N/A` |
| `verdict` | outcome + raisons |

Aucune cellule vide. `N/A` requiert une raison typée.

## Individual organism report

Chaque `organisms/<id>/REPORT.md` contient :

1. identité/vague/contrat/node ;
2. audit refs de propreté ;
3. dépendance et reçu, si applicable ;
4. couverture exacte ;
5. tableau des faits ;
6. tableau des cas et artefacts ;
7. divergences/limites/travaux reportés ;
8. verdict et règle d'agrégation appliquée ;
9. historique initial→remédié, si correction locale.

Le verdict doit égaler `organisms/<id>/result.json` et la ligne de synthèse.

## Dependency table

| parent | dependency | result path | hash | contract version | Figma version | probative | receipt verdict | mapped verdict | open | effect |
|---|---|---|---|---|---|---|---|---|---|---|

Les trois lignes sont obligatoires, même si les trois sont bloquées. `receipt verdict`
est le verdict brut du reçu et `mapped verdict` sa dérivation par le mappage normatif
de l'interface de campagne ; les deux colonnes sont obligatoires.

## Deferred-work table

| id | target | fact | category | contract | contract pointer | observed cause | candidate token | evidence | verdict impact | status |
|---|---|---|---|---|---|---|---|---|---|---|

`contract` nomme le contrat porteur du littéral — la cible ou un **enfant composé**
(FR-020). Colonne additive v1 ; une entrée dont le porteur est un enfant exige une
divergence observée sur l'organisme.

Le tableau est égal à `result.deferredWork`. Une entrée reportée ne peut pas avoir
`verdict impact = proved`.

## Gates table

| Gate | Command | Exit | Evidence |
|---|---|---:|---|
| build | `npm run build` | 0 | reçu/hash |
| parity | `npm run parity` | 0 | `parity/report.json` |
| eval | `npm run eval` | 0 | sortie live `N/N` + résultats |
| plugin | `npm run plugin:check` | 0 | reçu |
| determinism | `npx tsx scripts/deterministic-roundtrip.mjs` | 0 | reçu |
| browser purity | `node scripts/core-browser-check.mjs` | 0 | reçu |
| types | `npx tsc --noEmit && npx tsc -p tsconfig.build.json` | 0 | reçu |
| emitters | `npm run emitters:check` | 0 | reçu |
| catalog | `npm run catalog && npm run verify:catalog` | 0 | reçu |
| images | `npm run images:selftest` | 0 | reçu |
| campaign preflight | CLI `--check --inventory` | 0 | reçu |
| organism audit | CLI campagne complète | 0 ou 1 | `proofs/result.json` |
| report consistency | CLI `--verify-report` | 0 | reçu |
| hardcoded/token scope | CLI `--verify-deferred-scope` | 0 | reçus baseline/final |

Le code 1 de la campagne est autorisé seulement si le résultat est
`complete-with-blocks` et toutes les portes techniques sont vertes.

## Non-conversion receipt

`proofs/baseline/hardcoded-values.json` et
`proofs/closure/hardcoded-values-final.json` contiennent :

- hash du tree `contracts/` et de `tokens/**` ;
- inventaire canonique des `literals`, `literalsByProp` et bindings tokens ;
- diff typé ;
- liste `literalToTokenConversions`, obligatoirement vide ;
- liste `tokenFoundationChanges`, obligatoirement vide ;
- éventuelles corrections contractuelles locales, séparées et justifiées.

Le rapport reprend ces deux listes vides et lie les travaux reportés.

## Result↔report consistency

Le vérificateur recalcule depuis JSON :

- ordre et ensemble des douze sujets ;
- compteurs de synthèse et par organisme ;
- verdicts et raisons ;
- trois dependency gates ;
- facts/cases/evidence paths et hashes ;
- deferred work ;
- exits et gates.

Toute divergence Markdown↔JSON rend la campagne `invalid`, code 2.

## Review receipt

`proofs/closure/review.json` :

```jsonc
{
  "schemaVersion": 1,
  "campaignId": "013-auditer-fidelite-organismes",
  "startedAt": "<informatif>",
  "elapsedSeconds": 0,
  "reviewedSubjectIds": ["<exactement 12, dans l'ordre>"],
  "openedPathsBySubject": {
    "<id>": ["organisms/<id>/REPORT.md", "<au moins une preuve ou reçu de blocage>"]
  },
  "verdicts": { "<id>": "<verdict>" },
  "complete": true
}
```

`elapsedSeconds <= 600`, douze IDs exacts et au moins un chemin consulté par organisme
sont requis pour SC-006.

## Compatibility

Les ajouts à v1 sont optionnels. Renommer/supprimer une section ou changer le sens d'un
verdict exige v2. Les rapports 011 restent des entrées historiques ; ils ne sont pas
réécrits pour imiter 013.
