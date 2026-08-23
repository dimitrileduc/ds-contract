# Data Model — 025 Odoo Figma Links

## PanelDescriptor

Panneau métier Piqueray visible : `panelId` unique, `kind` (`root|child|shell`), `optionClass`, `optionTemplate`, sélecteur CSS root-scopé et `componentPath` non vide. `RootPolicyOption` est exclu car il s’agit d’une infrastructure partagée, pas d’un panneau métier distinct.

## ContractSegment

Chaque segment porte `contract.id`, `contract.version`, puis facultativement `viaPart` et `repeat`. Le contrat doit exister, sa version doit correspondre, et chaque paire adjacente doit représenter une composition atteignable.

## GovernedFigmaReference

Lu exclusivement depuis `contract.anchors.figma` :

- `fileKey`: non vide et sûr comme segment d’URL ;
- `nodeId`: forme précise Figma `digits:digits` ;
- `componentSetKey`: preuve supplémentaire facultative, non requise pour l’URL.

## PanelFigmaEntry

Projection générée consommée par le navigateur : `panelId`, `selector`, `contractId`, `contractVersion` et union discriminée :

- `status: available` exige `fileKey` et `nodeId` ;
- `status: unavailable` exige une raison parmi `missing-contract`, `version-mismatch`, `missing-anchor`, `invalid-file-key`, `invalid-node-id`, `ambiguous-panel` et interdit toute destination.

## FigmaDestination

Valeur éphémère construite au clic : origine fixe `https://www.figma.com`, chemin `/design/{fileKey}`, paramètre `node-id` dérivé du `nodeId`. Elle n’est jamais persistée comme source.

## Relationships

```text
PanelDescriptor ──componentPath──> Contract
Contract ──anchors.figma──> GovernedFigmaReference
PanelDescriptor + GovernedFigmaReference ──build──> PanelFigmaEntry
PanelFigmaEntry(available) ──click──> FigmaDestination
```

## State transitions

```text
declared → resolving → available → opened
                    ↘ unavailable → rendered-disabled → qualification-failed
```

`opened` ne change aucun état Odoo. Un popup bloqué ne déclenche jamais de navigation courante.
