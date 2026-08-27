# Data model — 030 (additif uniquement, jamais de champ repurposé)

Cinq entités, toutes JSON sur disque. Les champs existants du runner ne changent pas de sens.

## Manifeste de campagne (existant, étendu)

`specs/component-repairs/<comp>/run-N/campaign.json` — schéma `RepairCampaign` existant, plus :

- `captureMode?: "full" | "light"` — écrit par le premier usage du flag CLI ; défaut `"full"` (comportement inchangé). Un run ne change pas de mode en cours (refus nommé).
- `lockWaivers?: Array<{ nodeId, property, value, reason, decisionRef }>` — dérogations déclarées aux verrous hérités ; toute entrée référence une décision owner.
- `generated?: { by: "manifest-generator", sourceReleve: <chemin>, nonDeductible: string[] }` — provenance d'un manifeste généré ; `nonDeductible` NOMME ce que le générateur n'a pas su déduire (honnêteté, jamais de valeur inventée).

Validation : `validateRepairCampaign` existant, étendu additivement ; un manifeste généré non conforme est refusé comme un manifeste main.

## Rapport de verrous hérités (nouveau)

Produit par le preflight, dans le dossier de run (`preflight-locks.json`) :

- `locks: Array<{ surfaceId, nodeId, property: "minWidth"|"maxWidth"|"minHeight"|"maxHeight"|"fixedWidth"|"fixedHeight", value, inheritedFrom }>`
- `waived: Array<{ lockRef, waiverRef }>` · `blocking: Array<lockRef>`
- Règle : `blocking.length > 0` ⇒ refus nommé `inherited-size-lock` avant dry-run.

## Décision de design (schéma 029 étendu — vit dans contracts/decision-design.md)

Champs 029 conservés tels quels, plus :

- `pickerConsequence: string` — OBLIGATOIRE, français, décrit l'état du sélecteur de variantes après application.
- `acceptedFacts[]` passe de `string` à `{ fact: string, nature: "visuel"|"structurel", witnessRef: string }` (forme longue ; la forme courte string reste lue pour l'histoire 029, jamais écrite par 030+).
- Porte : fait `structurel` sans `witnessRef` de sélecteur ⇒ refus nommé `structural-fact-unwitnessed`.

## Manifeste de planche (nouveau — `zones.json`)

Sortie du générateur de planche, contrat vérifiable machine :

- `zones: { usage, youWillSee, youWillNotGet, pickerBeforeAfter, witnesses, decisions, footer }` — les 7 zones, chacune avec ses nœuds/textes attendus.
- `checks: { structuralFactsAllWitnessed: bool, negativeStatementsInFrench: bool, noScaledThumbnails: bool, archiveRef: string }`
- Règle : un check faux ⇒ la planche n'est pas présentable (refus, jamais de zone vide silencieuse).

## Journal du driver (nouveau — `drive-journal.jsonl`)

Une ligne par étape : `{ step, action, startedAt, endedAt, verdict: "green"|"refused"|"skipped-already-green", refusal?: <texte du refus nommé cité verbatim> }`.

- Reprise : les étapes `green` du journal + l'état `campaign.state` font autorité ; aucune étape d'écriture rejouée sans son dry-run.
- Le journal est une TRACE, pas une autorité de gate — les portes restent dans le runner.
