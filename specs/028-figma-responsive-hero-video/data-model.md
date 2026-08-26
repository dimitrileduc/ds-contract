# Data Model — HeroVideo responsive Figma

Ce modèle décrit les décisions et preuves de la campagne. Il ne constitue ni un
contrat produit HeroVideo ni un schéma responsive global.

## 1. FreshAudit

Relevé live read-only qui ouvre H1.

| Field | Type | Rules |
| --- | --- | --- |
| `auditId` | string | Unique dans 028 |
| `fileKey` | string | Doit être le fichier Piqueray autorisé |
| `fileVersionId` | string | Numérique, frais et repinné avant chaque phase live |
| `capturedAt` | datetime | UTC |
| `master` | `MasterIdentity` | Unique par id, key, nom et position |
| `container` | object | Container local unique, parent direct, master en Fill |
| `pageUsages` | `PageUsage[]` | Toutes les occurrences trouvées par position |
| `dependencies` | object | `ds.button` direct; dépendances partagées séparées |
| `texts` | `TextFact[]` | Copy, ranges, métriques, style id et classification |
| `primitiveInventory` | `PrimitiveCandidate[]` | Variables numériques disponibles et propriétés compatibles |
| `mediaFacts` | object | Poster, crop/FILL, gradients, VideoPaint |
| `findings` | `AuditFinding[]` | Chaque écart classé à sa source la plus basse |
| `figmaWrites` | string[] | Toujours vide |
| `pageWrites` | string[] | Toujours vide |

Validation: un pin absent, deux masters homonymes, un usage non inventorié ou un
fait historique contradictoire rend H1 `blocked`, jamais approximatif.

## 2. MasterIdentity

Identité protégée du composant Wide historique.

| Field | Expected baseline |
| --- | --- |
| `nodeId` | `2151:5552` jusqu'à preuve fraîche contraire acceptée |
| `componentKey` | `36011e51b8bc0b221a1ba6f9108709b5bd1c4490` |
| `name` | `HeroVideo` avant transition |
| `subjectKind` | `organism` |
| `referenceSize` | 1728×720 |
| `containerNodeId` | `2448:4731` |
| `homeInstanceNodeId` | `2170:6351` |

Transition: le nœud historique peut devenir le membre `Presentation=Wide`, mais son
id et sa key ne changent pas. Le nouveau component set possède sa propre identité
additive; il ne remplace pas rétroactivement l'identité protégée.

## 3. HistoricalEvidenceLink

Lien vers un fait H1/H2 de 027 réutilisable comme contexte.

Fields: `evidenceRef`, `decisionId`, `reusedFact`, `freshAuditRef`, `status`.

`status` vaut `confirmed`, `drifted` ou `superseded`. Aucune valeur de preview de
027 ne peut être `confirmed` comme valeur source sans une nouvelle décision H2.

## 4. PageUsage

Surface de contrôle en lecture seule.

| Field | Rules |
| --- | --- |
| `instanceNodeId` | Identifié par position, pas seulement par nom |
| `mainComponentId` | Doit rester lié au master historique |
| `contextNodeId` | Capture séparée Home+Header |
| `overrides` | Contenu, propriétés, styles et liens digérés |
| `ctaTextStyleStatus` | Toujours `observed-read-only/non-blocking` dans 028 |
| `writePolicy` | Toujours `read-only` |

Le CTA est inventorié pour l'honnêteté historique, mais n'entre dans aucune
précondition de H3 et ne reçoit aucune opération.

## 5. WorkFrame

Surface Figma d'exploration séparée du master et des Pages.

| Field | Rules |
| --- | --- |
| `frameId` | Stable pendant H2 |
| `compositionId` | `compact`, `desktop` ou `wide-reference` |
| `witnessWidth` | 390, 834, 1200 ou 1728 pour les témoins; contrôles séparés |
| `fixtureId` | `default`, `long-title`, `long-cta`, `short-landscape` |
| `authority` | Toujours `proposal` avant H2 |
| `masterMutation` | Toujours `false` |
| `pageMutation` | Toujours `false` |
| `disposition` | `retained`, `archived` ou `removed` après H2 |

Une frame refusée ne peut rester ambiguë à côté de la proposition retenue.

## 6. ResponsiveComposition

État Figma explicite du même HeroVideo.

| Field | Compact | Desktop | Wide |
| --- | --- | --- | --- |
| `presentationValue` | `Compact` | `Desktop` | `Wide` |
| `axis` | vertical | vertical | horizontal historique |
| `contentAlign` | center/center | center/center | alignement bas historique |
| `titleAlign` | center | center | historique |
| `heightStrategy` | min + grow | min + grow | 1728×720 historique |
| `selection` | explicit | explicit | explicit |
| `tablet834` | uses Compact | N/A | N/A |

Chaque composition référence des `PrimitiveBinding[]`, zéro ou un
`TemporaryTypographyOverride`, les mêmes médias, les mêmes rôles de calques et le
même Button imbriqué.

## 7. PrimitiveCandidate

Primitive existante disponible pour H2.

Fields: `variableId`, `name`, `resolvedValue`, `scope`, `supportedProperties`,
`sourceCollection`, `observedAtVersion`.

Une candidate n'est pas une décision. Elle doit exister dans le pin frais, accepter
la propriété Figma visée et ne pas être une nouvelle variable créée par 028.

## 8. PrimitiveBinding

Liaison approuvée entre une propriété et une primitive.

| Field | Rules |
| --- | --- |
| `compositionId` | Compact ou Desktop; Wide reste historique sauf fait explicitement protégé |
| `nodeIdOrPath` | Résolution non ambiguë |
| `property` | Gap, padding ou dimension d'espacement allowlistée |
| `variableId` / `variableName` | Doivent pointer vers un `PrimitiveCandidate` |
| `resolvedValue` | Doit correspondre au pin H2 |
| `ownerDecisionRef` | H2 approuvé |
| `boundAfter` | Vrai après application et au second passage |

Une valeur correcte sans `boundVariables` exact est un échec.

## 9. TemporaryTypographyOverride

Dette locale autorisée pour juger une nouvelle composition.

| Field | Rules |
| --- | --- |
| `compositionId` | Compact ou Desktop seulement |
| `sourceRole` | Toujours `Titre Hero vidéo` |
| `sourceTextStyleId` | Text Style historique enregistré |
| `fields` | Sous-ensemble de `fontSize`, `lineHeight`, `textAlignHorizontal` |
| `family` / `weight` / `characters` | Inchangés |
| `before` / `after` | Valeurs exactes |
| `debtStatus` | Toujours `pending-responsive-text-style` |
| `ownerDecisionRef` | H2 approuvé |
| `handoffRef` | Obligatoire avant H4 |

Wide ne possède jamais cet override. 028 ajoute et teste le support mécanique borné
de cette exception avant H3.

## 10. ProtectedFact

Fait qui doit rester identique ou dont le changement attendu est nommé.

Catégories minimales: `master-identity`, `wide-key`, `set-identity-additive`,
`variant-cardinality`, `variant-names`, `image-paints`, `gradient-paints`,
`text-content`, `text-ranges`, `wide-text-style`, `instance-links`,
`instance-overrides`, `component-properties`, `button-anatomy`, `page-node-identity`,
`page-structure`, `primitive-bindings`, `responsive-overflow`.

`responsive-overflow` est toujours protégé à `false`; il ne peut pas figurer dans
une liste de changements tolérés.

## 11. HumanGateDecision

| Gate | Required status and authorization |
| --- | --- |
| H1 | `approved` autorise uniquement les WorkFrames |
| H2 | `approved` fige la proposition exacte, sans autoriser le master |
| H3 | `approved` autorise le plan de mutation exact après tous prérequis |
| H4 | `approved` accepte la source finale, les limites et le handoff |

Fields communs: `gateId`, `status`, `decisionMaker`, `decidedAt`, `evidenceRefs`,
`acceptedFacts`, `rejectedOptions`, `deferredTopics`, `authorizes`, `supersedes`.

Transitions: `draft → ready-for-review → approved|rejected|blocked`. Une décision
`approved` est immuable; une nouvelle disposition la supersède par référence.

## 12. RunnerCapability

Extension générique minimale livrée par 028 avant toute application live.

Fields: `capabilityId`, `supportedTopology`, `createdNodeReporting`,
`scenarioSelection`, `bindingInspection`, `temporaryTypographyPolicy`,
`forbiddenWrites`, `negativeFixtureRefs`, `registeredEvalIds`, `status`.

`status` suit `red-fixtures → implemented → targeted-green → full-suite-green`.
H3 exige `full-suite-green`. `forbiddenWrites` contient toujours Page, Header et
enfants partagés. La capacité ne contient aucun id ou nom propre à HeroVideo.

## 13. MechanismSpike

Preuve préalable de la transition non destructive.

Fields: `spikeId`, `environment`, `inputTopology`, `outputTopology`,
`expectedCreatedNodeRoles`, `reportedCreatedNodeIds`, `wideIdentityBeforeAfter`,
`homeLinkBeforeAfter`, `overrideBeforeAfter`, `variantScenarioCoverage`,
`bindingCoverage`, `typographyExceptionCoverage`, `result`, `evidenceRefs`.

`result=pass` exige que créations et modifications soient déclarées honnêtement et
que le second passage soit no-op. Un spike qui modifie le master autoritatif avant
H3 est invalide.

## 14. MutationPlan

Plan exact présenté à H3.

Fields: `campaignRef`, `filePin`, `sourceBaselineRef`, `operations`,
`expectedCreatedNodes`, `expectedChangedNodes`, `protectedFacts`, `pageWrites`,
`rollbackRef`, `runnerCapabilityRef`, `spikeRef`, `h2DecisionRef`.

`pageWrites` est toujours vide. Le plan ne peut contenir une opération sur le Button,
le Header, l'instance Home ou une dépendance partagée non autorisée.

## 15. ProofCaptureSet et ScenarioResult

Un `ProofCaptureSet` correspond à `before`, `after` ou `idempotence` et contient,
pour chaque surface, PNG, structure, propriétés et faits, avec dimensions et digest.

Un `ScenarioResult` contient: `compositionId`, `width`, `height`, `fixtureId`,
`rootBounds`, `descendantBounds`, `overflow`, `clippedBy`, `contentAccessible`,
`posterCoverage`, `captureRef`, `run`.

La matrice minimale couvre 320, 390, 834, 1200, 1440, 1728 et un paysage court;
les fixtures couvrent normal, titre long et CTA long. Chaque ligne a
`overflow=false`, `clippedBy=[]` et `contentAccessible=true`.

## 16. ApplyReceipt et NoOpReceipt

Le premier reçu enregistre toutes les opérations, créations et modifications
attendues ainsi que `pageWrites=[]`. Le second contient les mêmes operation ids avec
statut `no-op`, `createdNodeIds=[]`, `changedNodeIds=[]` et les mêmes faits protégés.

## 17. HomeHandoff

Inventaire final destiné à la campagne responsive Home.

Fields: `compositionObservations`, `primitiveObservations`,
`typographyDebts`, `deferredChildNeeds`, `mediaLimits`, `ownerDecisions`,
`nonConvergenceStatus`, `regenerationGuard`, `futurePromotionScope`.

`nonConvergenceStatus` vaut
`figma-ahead/pending-home-responsive-promotion`. Aucune observation n'est nommée
variable ou Text Style global validé.

## Relationships

```text
FreshAudit ──confirms──> MasterIdentity + PageUsage + PrimitiveCandidate
     │
     └──authorizes H1──> WorkFrame ──proposes──> ResponsiveComposition
                                           │
                                           ├── PrimitiveBinding
                                           └── TemporaryTypographyOverride

H2 + RunnerCapability(full-suite-green) + MechanismSpike(pass)
     └──authorize review──> MutationPlan ──H3──> ApplyReceipt
                                              ├── ProofCaptureSet(after)
                                              └── NoOpReceipt + idempotence
                                                     └──H4──> HomeHandoff
```
