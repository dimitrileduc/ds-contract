# Data Model — audit de fidélité des organismes

**Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md) |
**Research**: [research.md](./research.md)

Le modèle sépare la déclaration de campagne, les faits observés, les preuves et les
verdicts. Les contrats de composants existants restent les sources gouvernantes ; les
entités ci-dessous sont des données d'audit, pas un nouveau modèle de composant.

## 1. AuditCampaign

Document versionné qui fixe le périmètre avant toute capture.

| Champ | Type | Validation |
|---|---|---|
| `schemaVersion` | entier | `1` ; version inconnue refusée par nom |
| `id` | kebab-case | `013-auditer-fidelite-organismes` |
| `reference` | `FigmaReference` | lecture seule, version pinée |
| `generatedSurface` | enum | `react-storybook` pour la preuve autoritaire |
| `acceptance` | objet | seuils absolus ≤2,5 %, gates signal/géométrie/sémantique actifs |
| `expectedSubjectIds` | `string[12]` | exactement les douze IDs, uniques |
| `waves` | `AuditWave[3]` | numéros 1, 2, 3 uniques et ordonnés |
| `dependencyGates` | `DependencyGate[3]` | mappings exacts de la vague 3 |
| `assetsManifest` | chemin relatif | borné, sans `..`, hashé |
| `subjects` | `OrganismTarget[12]` | même ensemble et même ordre que les vagues |
| `deferredPolicy` | objet | interdit toute conversion d'une valeur en dur inventoriée et toute mutation `tokens/**` |

### FigmaReference

| Champ | Type | Validation |
|---|---|---|
| `fileKey` | string | égale aux ancres des contrats |
| `fileVersion` | chiffres | pin live validé par GET |
| `readOnly` | bool | exactement `true` |
| `deviceScaleFactor` | entier >0 | identique pour les deux côtés |
| `capturedAt` | ISO-8601 | informatif, exclu du hash déterministe |

## 2. AuditWave

| Champ | Type | Validation |
|---|---|---|
| `number` | `1 \| 2 \| 3` | ordre croissant |
| `subjectIds` | string[] | aucune cible répétée entre vagues |
| `startsAfter` | `null \| 1 \| 2` | vague 1=`null`, vague 2=`1`, vague 3=`2` |
| `entryRule` | enum | `previous-wave-classified` ou `dependencies-proved` |

`previous-wave-classified` signifie que chaque sujet précédent possède un verdict final
honnête, pas nécessairement positif. La vague 3 ajoute son gate par dépendance.

## 3. OrganismTarget

L'un des douze organismes soumis à l'audit.

| Champ | Type | Validation |
|---|---|---|
| `id` | enum des 12 | correspond au contrat après normalisation explicite |
| `displayName` | string | libellé humain |
| `wave` | `1 \| 2 \| 3` | cohérent avec `waves` |
| `contractId` | string | ID exact du JSON existant |
| `contractVersion` | semver | égale au contrat parsé au lancement |
| `contractPath` | chemin | sous `contracts/` |
| `figmaSetNodeId` | node ID | égale à l'ancre ou justification typée |
| `auditRefs` | chemins[] | au moins une preuve 003/005/007/010 ; noms réels résolus via `audit-reuse-map.md` (010) |
| `knownLimits` | limite[] | caveats **déjà nommés** par les audits 003/005/007/010, transcrits avec leur effet attendu sur le verdict (FR-015) ; vide seulement si la carte 010 n'en nomme aucun pour ce sujet |
| `dependencyId` | string/null | null hors vague 3 |
| `requiredFactIds` | string[] | non vide, unique, couverture exacte |
| `cases` | `AuditCase[]` | au moins un cas ou dossier bloqué par dépendance |

### Inventaire stable

| Vague | Sujet | Contrat courant | Node master | Dépendance |
|---:|---|---|---|---|
| 1 | Coordonnees | `ds.coordonnees@1.0.0` | `2104:2904` | — |
| 1 | Devis | `ds.devis@1.0.0` | `2096:2524` | — |
| 1 | Hero | `ds.hero@1.0.0` | `2111:3382` | — |
| 1 | Presentation | `ds.presentation@1.0.0` | `2103:2824` | — |
| 1 | SAV | `ds.sav@1.0.0` | `2108:3105` | — |
| 1 | TexteSEO | `ds.texte-seo@1.0.0` | `2108:3123` | — |
| 2 | FAQ | `ds.faq@1.0.0` | `2104:2914` | — |
| 2 | Footer | `ds.footer@1.0.0` | `2120:4785` | — |
| 2 | Reassurances | `ds.reassurances@1.0.0` | `2114:3721` | — |
| 3 | Equipe | `ds.equipe@1.0.0` | `2115:3947` | MemberCard |
| 3 | Formulaire | `ds.formulaire@1.0.0` | `2096:2564` | Field |
| 3 | Header | `ds.header@1.0.0` | `84:285` | NavItem |

Les versions sont vérifiées à l'exécution ; une évolution légitime met à jour le
manifeste avant capture au lieu d'être ignorée.

## 4. DependencyGate

Preuve qu'une composition obligatoire peut ou non être conclue.

| Champ | Type | Validation |
|---|---|---|
| `parentSubjectId` | enum | `equipe`, `formulaire` ou `header` |
| `dependencyContractId` | enum | `ds.member-card`, `ds.field`, `ds.nav-item` |
| `dependencyContractVersion` | semver | correspond au reçu et au contrat courant |
| `requiredVerdict` | literal | `proved` (après mappage normatif du reçu) |
| `receiptSchema` | enum | `visual-campaign-v1` ou `organism-audit-v1` ; inconnu refusé par nom |
| `resultPath` | chemin relatif | résultat machine existant |
| `resultSha256` | SHA-256 | bytes du reçu |
| `figmaFileVersion` | string | même version ou justification de fraîcheur |
| `receiptVerdict` | string | verdict brut lu dans le reçu (`pass`/`fail`/`blocked` en v1) |
| `probative` | bool | dérivé des cas requis du reçu, jamais saisi |
| `actualVerdict` | verdict 013 | dérivé de `receiptVerdict` par le mappage normatif, jamais saisi |
| `staleReasons` | string[] | vide pour une dépendance utilisable |

### Mappage normatif des reçus

Un reçu `Visual Campaign v1` parle `pass`/`fail`/`blocked` au niveau sujet et ne porte
`probative` que par cas ; `proved` n'y apparaît jamais littéralement. Le gate dérive :

| `receiptVerdict` (v1) | `actualVerdict` (013) |
|---|---|
| `pass` | `proved` — uniquement si le `probative` dérivé est `true` |
| `fail` | `divergent` |
| `blocked` | `blocked` |
| sujet absent, valeur inconnue, reçu illisible | `not-proven` |

```text
probative (dérivé) =
  subject.missing == []
  AND chaque requiredCaseId du sujet résout vers un cas du reçu
  AND chaque cas requis a probative == true
```

Un reçu `organism-audit-v1` (dépendance re-prouvée au format 013) est mappé à
l'identité, avec la même dérivation de `probative` depuis ses cas. Le manifeste ne
peut surcharger ni le verdict ni la dérivation.

### Règle

```text
dependencyOpen =
  hash matches
  AND contract version matches
  AND reference is fresh
  AND derived probative == true
  AND mapped actualVerdict == proved
```

Sinon le parent reçoit `blocked` avec le motif et le chemin du reçu.

### DependencyGateResult

`OrganismAuditResult.dependency` porte le **résultat évalué** du gate — l'entité que la
fixture de parent bloqué asservit et que la table Dependency du rapport rend. Elle reprend
les champs déclarés du `DependencyGate` (parent, dépendance, version, `receiptSchema`,
`resultPath`) et y ajoute ceux qui n'existent qu'après exécution :

| Champ | Type | Validation |
|---|---|---|
| `resultSha256` | SHA-256 | relu sur les octets du reçu, jamais recopié du manifeste |
| `receiptVerdict` | string | verdict brut du reçu, jamais saisi |
| `probative` | bool | dérivé des cas requis du reçu, jamais saisi |
| `actualVerdict` | verdict 013 | dérivé par le mappage normatif, jamais saisi |
| `staleReasons` | string[] | vide pour une dépendance utilisable |
| `open` | bool | dérivé de la règle `dependencyOpen` ci-dessus, jamais saisi |
| `reasons` | code[] | typées, non vides dès que `open == false` |

Les trois résultats existent même quand les trois portes sont fermées, et `open == false`
impose `blocked` au parent (§10).

## 5. AuditCase

Entrées équivalentes utilisées pour prouver un sous-ensemble de faits.

| Champ | Type | Validation |
|---|---|---|
| `id` | string | unique dans la campagne |
| `subjectId` | enum | cible existante |
| `figmaNodeId` | node ID | présent dans la version pinée |
| `observedProperties` | objet | relu et égal au node |
| `reactProps` | objet | valide contre le contrat et le composant |
| `factIds` | string[] | non vide, tous déclarés par le sujet |
| `fixtureAssetIds` | string[] | résolvent dans le manifest |
| `requiredParts` | string[] | contient `root` |
| `requiredRegions` | région[] | déclarées avant le diff |
| `semanticAssertions` | assertion[] | chacune cite un JSON Pointer contractuel |
| `aliases` | alias[] | égalité image/géométrie/sémantique recalculée |

Les props non-défaut sont obligatoires lorsque le défaut ne suffit pas à prouver la
propagation. Un cas BOOLEAN/INSTANCE_SWAP côté Figma cite une occurrence réelle ; aucun
node n'est muté pour produire le cas.

## 6. AuditedFact

Unité de traçabilité et de verdict.

| Champ | Type | Validation |
|---|---|---|
| `id` | stable string | unique, préfixé par le sujet |
| `subjectId` | enum | cible existante |
| `caseId` | string | cas existant ou null si dépendance bloquée |
| `kind` | enum | `content`, `structure`, `property`, `composition`, `visual`, `semantic` |
| `required` | bool | `true` pour la couverture de verdict |
| `representability` | enum | `carry-both`, `carry-with-named-limit`, `carry-code-only` |
| `figma` | `FactLeg` | référence pinée ou absence typée |
| `contract` | `FactLeg` | id/version/JSON Pointer |
| `generated` | `FactLeg` | fichier/export/selector/valeur/hash |
| `evidenceIds` | string[] | au moins un si résultat prouvé/divergent |
| `outcome` | `FactOutcome` | dérivé, jamais libre |
| `localizedSource` | enum/null | requis pour `divergent` |
| `reasons` | code[] | non vide sauf `proved` |
| `deferredWorkId` | string/null | requis si exclusion tokens/valeurs en dur |

### FactLeg

| Champ | Type | Exemples |
|---|---|---|
| `reference` | string | node/layer, JSON Pointer, fichier/selector |
| `observedValue` | JSON | contenu, prop, structure ou mesure |
| `sourceHash` | SHA-256 | capture, contrat ou bundle |
| `available` | bool | false n'est jamais assimilé à conforme |
| `notes` | string[] | limites et provenance |

### FactOutcome

`proved | divergent | limited | not-proven`

```text
proved =
  all three legs available
  AND values/structure agree under declared mapping
  AND all evidence is probative/pass
  AND representability introduces no unresolved limit

divergent =
  an observed mismatch exists
  AND localizedSource in {figma, contract, generated, dependency, comparison}

limited =
  the chain reaches a named representability/comparison boundary
  AND the boundary prevents complete proof

not-proven =
  any required reference/evidence is missing, stale, invisible, invalid or non-equivalent
```

## 7. VisualEvidence

Reçu probant réutilisant le modèle 011.

| Bloc | Contenu requis |
|---|---|
| `visibility` | alpha, contraste, bounds peints et signal image des deux côtés |
| `geometry` | rectangles racine/parts, deltas normalisés, justification contractuelle |
| `pixels` | score brut, diagnostic masqué, régions et seuils |
| `semantics` | sélecteur, attendu contractuel, observé React, verdict |
| `images` | asset IDs, hashes, décodage, taille naturelle et pixels visibles |
| `artifacts` | chemins + SHA-256 des cinq fichiers |
| `verdict` | `pass`, `fail` ou `blocked` |

Le diagnostic masqué n'entre jamais dans le calcul autoritaire.

## 8. ArtifactReceipt

| Champ | Type | Validation |
|---|---|---|
| `id` | string | stable |
| `kind` | enum | `figma`, `generated`, `diff`, `triptych`, `metadata`, `report` |
| `path` | chemin relatif | sous le dossier exact de l'organisme/cas |
| `sha256` | SHA-256 | vérifié après écriture |
| `mediaType` | string | conforme à l'extension |
| `width`/`height` | int/null | >0 pour images |
| `bytes` | int | >0 |

## 9. DeferredWorkItem

Écart correctement localisé mais interdit dans 013.

| Champ | Type | Validation |
|---|---|---|
| `id` | string | unique |
| `subjectId` | enum | organisme affecté |
| `factId` | string | fait existant |
| `category` | enum | `hardcoded-value-conversion`, `global-token-correction` |
| `contractId` | string | contrat porteur du littéral — cible **ou enfant composé** (FR-020) |
| `contractPointer` | JSON Pointer/null | présent lorsque connu |
| `observedCause` | string | factuel, non solution présumée |
| `candidateToken` | string/null | informatif seulement |
| `evidenceIds` | string[] | non vide |
| `verdictImpact` | enum | `divergent`, `limited` ou `not-proven` |
| `status` | literal | `deferred` |

Un item reporté ne rend jamais son fait ou organisme `proved`.

Une valeur en dur portée par un contrat **enfant** composé par la cible n'est consignée
que si elle cause une divergence **observée** sur l'organisme (FR-020) ; `contractId`
nomme alors le contrat porteur. Sans divergence observée, ce n'est pas un constat de la
campagne — et cette absence n'est jamais présentée comme une preuve de fidélité.

## 10. OrganismAuditResult

| Champ | Type | Validation |
|---|---|---|
| `subject` | snapshot du target | ID/version/node/vague |
| `coverage` | expected/observed/missing/unexpected | listes exactes |
| `dependency` | résultat/null | requis en vague 3 |
| `facts` | `AuditedFact[]` | tous les IDs attendus exactement une fois |
| `cases` | résultats visuels[] | tous les cas attendus |
| `artifacts` | receipts[] | complets et hashés |
| `verdict` | `OrganismVerdict` | dérivé |
| `reasons` | string[] | non vide si non positif |

### OrganismVerdict

`proved | divergent | limited | not-proven | blocked`

Priorité d'agrégation :

```text
blocked    si dependencyOpen == false
divergent  sinon si au moins un fait/cas est divergent/fail
not-proven sinon si coverage non exacte ou preuve non probante
limited    sinon si au moins un fait est limited
proved     sinon si tous les faits requis et cas sont proved/pass
```

## 11. CampaignAuditResult

| Champ | Type | Validation |
|---|---|---|
| `schemaVersion` | entier | `1` |
| `campaignId` | string | correspond au manifeste |
| `inputHashes` | objet | campagne, contrats, assets, bundle React, dépendances |
| `waves` | résultats[3] | ordre conservé |
| `subjects` | résultats[12] | exactement douze |
| `deferredWork` | items[] | exhaustif, peut être vide explicitement |
| `summary` | compteurs | dérivés des résultats |
| `repositoryGates` | receipts[] | commandes/exit/hash |
| `verdict` | enum | `complete`, `complete-with-blocks`, `invalid` |
| `exitCode` | `0 \| 1 \| 2` | selon interface |

`complete-with-blocks` est une campagne honnêtement terminée avec des organismes rouges ou
bloqués ; ce n'est pas une déclaration de fidélité globale.

## 12. State transitions

### Campagne

```text
draft
  → preflighted
  → wave-1-running → wave-1-classified
  → wave-2-running → wave-2-classified
  → dependency-checked
  → wave-3-running-or-blocked → wave-3-classified
  → reported
  → gated
  → complete | complete-with-blocks
```

Toute référence stale, sortie hors bornes ou incohérence résultat↔rapport mène à
`invalid` et code 2.

### Organisme

```text
queued
  → preflighted
  → blocked                              (dépendance non positive)
  → auditing → classified
  → remediating → regenerating → auditing  (correction locale autorisée)
  → final
```

Les résultats initial et final d'une remédiation sont tous deux conservés pour
l'attribution.

## 13. Relationship summary

```text
AuditCampaign 1 ──3 AuditWave
AuditCampaign 1 ──12 OrganismTarget
OrganismTarget 1 ──* AuditCase
OrganismTarget 1 ──* AuditedFact
AuditCase 1 ──* VisualEvidence
VisualEvidence 1 ──5 ArtifactReceipt
OrganismTarget 0..1 ──1 DependencyGate
AuditedFact 0..1 ──1 DeferredWorkItem
OrganismTarget 1 ──1 OrganismAuditResult
AuditCampaign 1 ──1 CampaignAuditResult
```
