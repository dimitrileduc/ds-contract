# Data Model: Readiness Figma–contrat des sections

## SectionReadinessDossier

Agrégat racine, exactement un par section.

| Field | Type | Rules |
|---|---|---|
| `schemaVersion` | semver | `1.0.0` initial |
| `sectionId` | enum | une des 11 sections, unique dans la campagne |
| `currentPins` | object | contrat, Figma, rendu et éventuel pin Odoo; hash/version requis |
| `timeline` | object | rupture probable et raisons conservées, jamais recalculées différemment par le packet owner |
| `historicalStates` | `HistoricalState[]` | ordre chronologique stable |
| `candidates` | `ReferenceCandidate[]` | 0..3, rangs uniques |
| `ownerDecisionRefs` | `OwnerDecisionRef[]` | décision initiale requise avant diagnostic ou mutation; finale après réparation |
| `sourceAudit` | `SourceCleanlinessReceipt` | audit complet du master et des usages par position, requis avant normalisation/extraction |
| `findings` | `DifferenceFinding[]` | tout écart significatif possède une cause |
| `impactGraph` | `DependencyImpactGraph` | présent, même vide et justifié |
| `repairAssignment` | `RepairAssignment?` | requis pour tout verdict de réparation |
| `finalVerdict` | enum? | exactement une valeur à clôture |
| `destination` | destination? | exactement une valeur à clôture |

États: `inventory → source-audited → history-ready|blocked-history → awaiting-owner → diagnosed → awaiting-final-gate? → closed`.
Transitions interdites: toute mutation avant `owner-approved`; `ready` avant cause/graphe/gate final;
`closed` sans verdict et destination uniques.

## HistoricalState

| Field | Type | Rules |
|---|---|---|
| `stateId` | string | stable, unique dans le dossier |
| `observedAt` | ISO date/date-time | date de la preuve, pas date supposée du design |
| `figmaVersionId` | string? | requis pour toute preuve Figma historique récupérable |
| `evidence` | `EvidenceRef[]` | au moins une preuve |
| `completeness` | enum | `complete`, `partial`, `unrecoverable` |
| `contradictions` | string[] | explicites, jamais absorbées dans une note positive |
| `knownChanges` | string[] | différences avec l'état précédent |

## EvidenceRef

Champs: `evidenceId`, `kind` (`visual|structure|contract|render|page|image|decision`), `pathOrUri`,
`sha256?`, `capturedAt?`, `availability` (`available|missing|refused|unrecoverable`), `proves[]`,
`doesNotProve[]`. Une preuve indisponible doit nommer `reason`.

## ReferenceCandidate

Champs: `candidateId`, `historicalStateId`, `rank` (1..3), `recommendation`
(`recommended|plausible|fallback`), `supportingEvidenceIds[]`, `missingEvidence[]`,
`contradictions[]`, `rationale`. Un candidat ne devient autoritaire que via `OwnerDecision`.

## OwnerDecision

Champs: `decisionId`, `sectionId`, `gate` (`reference|post-repair`), `decision`
(`reference-validated|voluntary-evolution|accepted-defect|out-of-contract|more-evidence-required|no-reference-recoverable|repair-accepted|repair-refused`),
`subjectId`, `rationale`, `decidedBy`, `decidedAt`, `reviewTiming`, `acceptedConsequences[]`, `receiptRefs[]`.
`reviewTiming` conserve `startedAt`, `completedAt`, `activeSeconds` et `excludedExplorationSeconds`;
la consolidation vérifie le seuil SC-003 sans empêcher de conserver un gate qui dépasse dix minutes.
Immuable: une correction produit une nouvelle décision, jamais l'écrasement de l'ancienne.

## SourceCleanlinessReceipt

Champs: `sectionId`, `masterNodeId`, `usagePositions[]`, `checkedDimensions[]`, `missingSources[]`,
`status` (`clean|dirty|blocked`) et `evidenceRefs[]`. `checkedDimensions` doit couvrir structure,
contraintes, propriétés, bindings de variables, tailles et descriptions. Le reçu existe avant tout
`HistoricalState`; une source `dirty` ou `blocked` ne peut pas être promue comme référence saine.

## DifferenceFinding

Champs: `findingId`, `surface` (`figma|contract|render`), `referenceEvidenceIds[]`,
`currentEvidenceIds[]`, `significance` (`significant|informational`), `description`, `cause`,
`dependencyId?`, `status`. Causes significatives: `design-regression`, `contract-regression`,
`design-and-contract-regression`, `renderer-fault`, `missing-image`, `voluntary-evolution`,
`accepted-defect`, `out-of-contract`, `insufficient-history`.
`significant` est obligatoire si le finding change l’intention, la structure, le contenu, le
comportement, une dépendance, la disponibilité d’une image ou le verdict possible. Un finding
`informational` porte une justification d’absence d’impact.

## DependencyImpactGraph

Champs: `nodes[]`, `edges[]`, `builtFrom[]`, `completeness`, `missingSources[]`. Un nœud porte
`id`, `kind` (`section|dependency|odoo-qualification`), `pin?`, `revalidationStatus`
(`not-required|required|passed|failed|blocked`). Une arête porte `consumerId`, `dependencyId`,
`usage` (`contract|figma|render|odoo`) et ses preuves. Aucune clôture après changement partagé si un
consommateur connu reste `required`.

## RepairAssignment

Champs: `scope` (`local-020|sub-spec`), `target`, `reason`, `authorizedByDecisionId`,
`affectedTargets[]`, `beforeCaptureManifest?`, `subSpecSlug?`, `repin019Decision?`.
`local-020` interdit schema, moteur, dépendance partagée, restauration massive et image transversale.

## ConsolidatedReadiness

Champs: `schemaVersion`, `campaignId`, `expectedSections` (constante des 11 ids), `dossiers[]`,
`dependencySummary[]`, `ownerDecisionSummary[]`, `repairSpecs[]`, `odoo019Repins[]`, `generatedAt?`.
La sortie déterministe omet le temps ou reçoit un temps épinglé. Validation: 11 dossiers exactement,
aucun doublon/manquant, verdict et destination uniques, Header/Footer vers `shell-workstream`, toute
autre destination suit la matrice FR-026. `qualityMetrics` conserve les onze durées actives du premier
gate et le résultat SC-008 (`passed|failed|not-applicable`) avec numérateur et dénominateur.
