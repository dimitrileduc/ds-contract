# Modèle de données : réparation de la projection Figma

## Vue d'ensemble

Une `RepairCampaign` ferme le périmètre et les pins. Elle contient exactement sept `RepairTarget`,
chacun lié à une `ValidatedReference`, un ensemble exhaustif de `AffectedSurface`, deux jeux de
captures et un `RepairReceipt`. Les défauts moteur passent par une `ProjectionDefect`; les effets
partagés sont recensés comme `ConsumerImpact`. Les preuves visuelles et les empreintes d'image ne
remplacent jamais les identités structurelles : elles se complètent.

## RepairCampaign

Représente l'unique lot atomique de cette feature.

| Champ | Type | Règle |
|---|---|---|
| `schemaVersion` | semver | `1.0.0` pour le format initial |
| `campaignId` | string | `021-figma-projection-repair` |
| `filePin` | `FigmaFilePin` | file key + version attendue, obligatoires |
| `authorityRefs` | path[] | décisions et preuves 020, toutes lisibles |
| `targets` | `RepairTarget[7]` | exactement les sept ids autorisés, sans doublon |
| `consumerImpacts` | `ConsumerImpact[]` | complet avant `ready-to-apply` |
| `allowedOperations` | `RepairOperation[]` | allowlist fermée; chaque opération cible un node id |
| `state` | enum | transition contrôlée ci-dessous |
| `createdAt` | date-time | stable dans le reçu source |

Validation : un pin de fichier/version différent, une cible manquante ou supplémentaire, une
référence non 020, ou une opération sans cible autorisée invalide le document.

## FigmaFilePin

| Champ | Type | Règle |
|---|---|---|
| `fileKey` | string | doit égaler le fichier autorisé par 020 |
| `versionId` | string | version observée au préflight; pas de mutation si elle dérive |
| `fileName` | string | informatif, jamais identité |
| `capturedAt` | date-time | moment de vérification du pin |

## RepairTarget

Une section, un contrôle partagé ou un groupe de propriétés composé.

| Champ | Type | Règle |
|---|---|---|
| `targetId` | enum | `hero`, `sav`, `categories-principales`, `realisations`, `produits-e-commerce`, `coordonnees`, `formulaire` |
| `kind` | enum | `generated-master`, `direct-canvas`, `shared-control`, `composed-properties` |
| `masterNodeId` | node id | identité actuelle attendue |
| `variantNodeIds` | node id[] | requis pour les variantes touchées |
| `referenceId` | string | relation vers une `ValidatedReference` |
| `affectedSurfaceIds` | string[] | au moins master + tous les usages connus |
| `projectionDefectIds` | string[] | une ou plusieurs causes nommées |
| `allowedFields` | string[] | champs/nœuds qui peuvent changer |
| `protectedFacts` | string[] | contenu, images, grille, ids, overrides selon la cible |
| `beforeCaptureIds` | string[] | exhaustifs avant application |
| `afterCaptureIds` | string[] | exhaustifs après application |
| `ownerDecision` | enum/null | `accepted`, `refused`; null avant gate |

Validation : `direct-canvas` est autorisé uniquement pour Catégories et Réalisations;
`generated-master`/`composed-properties` doivent référencer une source contractuelle. Un target ne
peut être vérifié si ses deux ensembles de surfaces diffèrent.

## ValidatedReference

État choisi par l'owner dans 020.

| Champ | Type | Règle |
|---|---|---|
| `referenceId` | string | unique |
| `targetId` | target id | relation 1:1 avec la cible |
| `sourceKind` | enum | `historical-version`, `current-owner-approved`, `contract-and-history` |
| `figmaVersionId` | string | requis pour une référence historique |
| `subjectNodeId` | node id | nœud rendu de référence |
| `render` | `EvidenceArtifact` | PNG + sha256 + largeur/hauteur |
| `visualFacts` | string[] | faits mesurés à restaurer |
| `decisionRef` | path | décision owner 020 |

Validation : un PNG historique absent reste une limite explicite; il ne peut pas être remplacé par
la seule structure. Les dimensions doivent égaler celles consignées dans 020.

## AffectedSurface

Un master, une variante, une instance de page ou un consommateur partagé susceptible de changer.

| Champ | Type | Règle |
|---|---|---|
| `surfaceId` | string | stable dans la campagne |
| `role` | enum | `master`, `variant`, `page-instance`, `shared-consumer`, `odoo-qualification` |
| `nodeId` | node id/null | requis pour une surface Figma |
| `pageComposition` | string/null | libellé humain seulement |
| `structuralPath` | string/null | chemin positionnel lorsque pertinent |
| `expectedSize` | `{width,height}` | dimensions de validation de capture |
| `impactStatus` | enum | `pending`, `unchanged`, `revalidated`, `refused`, `not-applicable` |

Validation : zéro `pending` à la clôture. Un changement partagé exige `revalidated` ou `refused`,
jamais `not-applicable`.

## BeforeCaptureSet / AfterCaptureSet

Les deux objets partagent la même structure et la même population de surfaces.

| Champ | Type | Règle |
|---|---|---|
| `captureSetId` | string | unique, phase incluse |
| `phase` | enum | `before`, `after`, `idempotence` |
| `fileVersionId` | string | pin réellement capturé |
| `artifacts` | `EvidenceArtifact[]` | un visuel + état structurel par surface requise |
| `imageFingerprints` | `ImageFingerprint[]` | toutes les peintures des hôtes affectés |
| `instanceLinks` | `InstanceLink[]` | master/instance et overrides |
| `complete` | boolean | dérivé; jamais saisi comme opinion |

`complete` vaut vrai seulement si chaque surface attendue possède des artefacts décodables, non
vides et aux dimensions attendues, et si aucune collecte n'a été marquée `skipped`.

## EvidenceArtifact

| Champ | Type | Règle |
|---|---|---|
| `artifactId` | string | unique |
| `surfaceId` | string | relation vers `AffectedSurface` |
| `kind` | enum | `png`, `structure`, `properties`, `diff`, `report` |
| `path` | repo-relative path | artefact accessible |
| `sha256` | hex-64 | obligatoire |
| `width` / `height` | integer/null | requis pour PNG |
| `byteLength` | integer | strictement positif |
| `status` | enum | `valid`, `missing`, `empty`, `wrong-size`, `unreadable` |

Seul `valid` peut participer à un gate vert.

## ImageFingerprint

| Champ | Type | Règle |
|---|---|---|
| `hostId` | node id | master ou instance porteur |
| `structuralPath` | string | chemin positionnel, jamais nom de calque |
| `paintIndex` | integer | index du paint dans l'hôte |
| `imageHash` | string | identité Figma de l'image |
| `scaleMode` | enum | mode observé |
| `imageTransformHash` | string/null | distingue les recadrages |

L'identité d'appariement est `(hostId, structuralPath, paintIndex)`. `imageHash` et transform doivent
rester identiques; un même nombre d'images ne suffit pas.

## InstanceLink

| Champ | Type | Règle |
|---|---|---|
| `instanceNodeId` | node id | identité de l'usage |
| `masterNodeId` | node id | identité du master attendu |
| `structuralPath` | string | position de l'instance dans son hôte |
| `overrideDigest` | sha256 | digest normalisé des overrides |

Après réparation, les ids du lien et les overrides hors changement autorisé doivent être conservés.

## ProjectionDefect

Classe générique qui transforme mal l'intention contractuelle.

| Champ | Type | Règle |
|---|---|---|
| `defectId` | string | unique |
| `class` | enum | `absolute-lowering`, `composed-prop-forwarding`, `icon-instance-swap`, `direct-geometry` |
| `sourcePaths` | path[] | moteurs/contrats/opérations concernés |
| `affectedTargetIds` | target id[] | non vide |
| `negativeFixture` | path | doit échouer sur ancien comportement |
| `registeredEvalId` | string | claim enregistré dans `evals/run.ts` |
| `resolutionStatus` | enum | `open`, `headless-fixed`, `live-verified`, `refused` |

## ConsumerImpact

| Champ | Type | Règle |
|---|---|---|
| `consumerId` | string | contrat, composant, page ou qualification |
| `dependencyId` | string | Button, SectionHeader ou mécanisme d'émetteur |
| `usage` | enum | `contract`, `figma`, `odoo` |
| `evidenceRefs` | path[] | inventaire et vérification |
| `status` | enum | `pending`, `unchanged`, `revalidated`, `refused` |
| `decisionRef` | path/null | requis si une qualification antérieure est affectée |

## RepairOperation

Instruction déterministe soumise au dry-run.

| Champ | Type | Règle |
|---|---|---|
| `operationId` | string | unique |
| `targetId` | target id | cible autorisée |
| `mechanism` | enum | `generated-amend`, `set-properties`, `resize`, `reposition`, `property-reference` |
| `nodeId` | node id | cible exacte |
| `structuralPath` | string/null | requis si l'opération descend sous la cible |
| `preconditions` | object[] | type, parent, dimensions, pin, valeur courante |
| `changes` | object | champs allowlistés uniquement |
| `expectedPostconditions` | object[] | faits à vérifier immédiatement |

Une précondition fausse bloque l'opération et le lot; aucun fallback par nom n'est autorisé.

## RepairReceipt

Conclusion machine et owner d'une cible.

| Champ | Type | Règle |
|---|---|---|
| `receiptId` | string | unique |
| `targetId` | target id | exactement un reçu par cible |
| `referenceId` | string | référence utilisée |
| `appliedOperationIds` | string[] | vide possible seulement pour refus/no-op expliqué |
| `expectedDiffs` | `DiffFinding[]` | zones autorisées |
| `unexpectedDiffs` | `DiffFinding[]` | doit être vide pour acceptation |
| `imagePreservation` | enum | `pass`, `fail`, `not-applicable` |
| `instancePreservation` | enum | `pass`, `fail` |
| `consumerVerdicts` | object[] | aucun statut ouvert |
| `idempotence` | enum | `pass`, `fail` |
| `ownerDecision` | enum | `accepted`, `refused` |
| `ownerRationale` | string | non vide |
| `evidenceRefs` | path[] | before, after, diff et décision |

Un receipt `accepted` exige : zéro diff inattendu, images/instances en pass, idempotence en pass,
tous consommateurs clos et décision owner explicite.

## Transitions d'état

```text
draft
  └─ preflight-valid
       └─ captured
            └─ ready-to-apply
                 └─ applied
                      └─ verified
                           ├─ owner-accepted
                           └─ owner-refused
```

- Toute erreur avant `applied` mène à `refused-before-mutation` sans écriture.
- Une erreur pendant l'application mène à `application-failed`; la campagne n'est jamais présentée
  comme réparée et exige inspection/reprise explicite.
- Un diff inattendu, une image déplacée, un consommateur ouvert ou une seconde reconstruction
  différente mène à `verification-failed`.
- Les décisions owner terminales ne remplacent jamais les décisions de référence de 020.

## Relations et cardinalités

```text
RepairCampaign 1 ── 7 RepairTarget
RepairTarget   1 ── 1 ValidatedReference
RepairTarget   1 ── 1..* AffectedSurface
RepairTarget   * ── * ProjectionDefect
ProjectionDefect 1 ── 1..* ConsumerImpact
RepairCampaign 1 ── 1 BeforeCaptureSet
RepairCampaign 1 ── 1 AfterCaptureSet
RepairCampaign 1 ── 1 IdempotenceCaptureSet
RepairTarget   1 ── 1 RepairReceipt
```
