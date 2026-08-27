# SC-001 — le manifeste de `categories-principales` regénéré depuis son relevé (T011)

**SC-001** : « Le manifeste d'une section est généré en moins de 2 minutes machine, sans
édition manuelle sur le cas nominal — mesuré en rejouant `categories-principales` et
comparé au manifeste écrit main de 029. »

Date : 2026-08-27. Worktree `just-euphonium`.

## La commande

```bash
npm run component:repair:manifest -- \
  --releve specs/component-repairs/categories-principales/run-001/audit.json \
  --out <sortie>/campaign.generated.json
```

Aucune lecture Figma vive. L'entrée est l'`audit.json` que le runner avait déjà produit
le 2026-08-26 à 14:46, plus les six documents que ce relevé **nomme** lui-même
(`usageInventoryRef`, `sourceRef`, `surfaceManifestRef`, `primitiveInventoryRef`,
`dependencyRef`, `detailedTreeRef`) et que le CLI lit pour le générateur — le générateur,
lui, reste une fonction pure sans système de fichiers.

## Chronométrage

```
0.68s user  0.08s system  130% cpu  0.584 total
```

**0,58 s de mur**, contre un plafond de 120 s. Le poste que la rétro chiffrait à 60–90 min
par section (« écriture manuelle du manifeste, ~25–30 Ko ») est désormais sous la seconde.

Sortie : **24 655 octets** de manifeste (l'écrit-main fait 44 651 octets hors `captureSets` —
il porte en plus les scénarios de vague, les layouts complets et les bindings, qui sont
justement les décisions que le générateur refuse d'inventer).

## Déterminisme

Deux exécutions sur le même relevé :

```
cmp a.json b.json  → BYTE-IDENTICAL x2
```

Le générateur n'a pas d'horloge : `createdAt` et `filePin.capturedAt` sont lus dans le
relevé. C'est ce qui rend le byte-à-byte possible.

## Diff sémantique contre le manifeste écrit main — **23 / 28 identiques**

Comparaison faite sur les faits d'identité, ceux qu'un humain avait tapés à la main
depuis le même relevé :

| Identique (23) |
|---|
| `filePin.fileKey` · `targetId` · `masterNodeId` · `variantNodeIds` (4) · `expectedMasterName` · `expectedVariantNames` (4) |
| `setNodeId` · `setComponentKey` · `setName` · `setIdentityPolicy` · `propertyName` |
| `variantProperties` (Style × Colonnes, valeurs et ordre) · `defaultVariantSelection` · `defaultPresentationValue` · `authoringLayout.order` |
| `historicalMember` (nodeId + key + nom + sélection d'axes) · `preservedMembers` (les 3, idem) · `createdMembers` · `expectedMemberNames` |
| **`usageSurfaces` — les 7 usages, `nodeId` ET `positionPath`, au caractère près** |
| `writeBoundary.readOnlySurfaceNodeIds` (les 14) · mécanisme + nœud de l'opération · l'ensemble `(role, nodeId)` des 19 surfaces |

Les 5 écarts, **un par un** :

| Écart | Écrit main | Généré | Verdict |
|---|---|---|---|
| `filePin.versionId` | `2392091518820622154` | `2391982289745917433` | **Pas une invention** : le généré est exactement la version que le relevé pointé épingle. L'humain a re-épinglé à 17:41 après d'autres travaux. L'apply live revalide de toute façon le pin exact. |
| `authoringLayout.gap` | `64` | `0` | **NOMMÉ** dans `nonDeductible` : « espacement d'authoring du catalogue : décision de mise en page, absente du relevé — émis à 0 ». Le 64 de 029 ne se lit nulle part dans le relevé. |
| `responsiveWidths` | `[320, 390, 834, 1200, 1440, 1728]` | `[1728]` | **NOMMÉ** : largeurs témoins de la vague = décision owner (fiche D9). Seule la largeur d'authoring observée est émise. |
| `writeBoundary.allowedExistingNodeIds` | 15 ids | 5 ids (set + 4 membres) | **NOMMÉ** : squelette ; les 10 hôtes de traversée supplémentaires (instances de cartes) sont une décision de périmètre. |
| `writeBoundary.protectedDependencyNodeIds` | 7 ids | **8 ids — sur-ensemble strict** | Voir ci-dessous : c'est le généré qui est plus juste. |

**Zéro invention** : aucun des 5 écarts n'est une valeur inventée. Trois sont nommés dans
`nonDeductible`, un est la version que le relevé déclare, et le dernier est une correction.

## Ce que la comparaison a trouvé — deux défauts du générateur, corrigés en route

Le diff n'a pas servi qu'à cocher SC-001 ; il a attrapé deux vrais défauts avant la
clôture (leçon 018 : « lu mais non confirmé » a un taux d'erreur élevé).

1. **Le générateur sous-protégeait.** Sa première version collapsait chaque dépendance
   inventoriée sur son *set* (`componentSetId ?? componentId`) — `Style=Superpose` et
   `Style=Empile` disparaissaient au profit de `CarteCategorie`. Une frontière de
   protection qui rétrécit en silence est exactement le mauvais sens de l'erreur.
   Corrigé : les **deux** adresses sont protégées.
2. **Et l'écrit-main, lui, en oubliait une.** Après correction, le généré protège
   `6:122` — le component set **`Bouton`** qui possède `9:206` (`Style=Link`) — que le
   manifeste de 029 ne listait pas, alors que le relevé le nomme
   (`protectedDependencySets[5].componentSetId`). L'ensemble généré est un **sur-ensemble
   strict** de l'écrit-main : rien de manquant, une protection de plus.

## Les 17 champs que le générateur refuse de deviner

Ils sont écrits dans le manifeste (`generated.nonDeductible`) **et** dans
`manifest-report.json`, et la fixture `figma-projection-repair-manifest-generator`
échoue si l'un des quatre principaux disparaît :

```
componentSetTopology.authoringLayout.gap · componentSetTopology.authoringLayout.order
writeBoundary.allowedExistingNodeIds · writeBoundary.expectedChangedNodeIds
writeBoundary.protectedChildPaths · reference.decisionRef · responsiveWidths
contentFixtures · presentationScenarios · primitiveBindings · typographyOverrides
target.allowedFields · target.allowedFactChanges · target.kind
workflow.subjectKind · workflow.ownerDecisionRoot
workflow.directDependencies / sharedDependencies
```

## « Sans édition manuelle sur le cas nominal » — ce que ça veut dire exactement

Le manifeste généré est **accepté tel quel par `validateRepairCampaign`** : aucune
édition n'est nécessaire pour qu'il soit un manifeste légal (FR-002/FR-003, vérifié par
la fixture). Ce n'est PAS la même chose que « prêt à poser » : les 17 champs ci-dessus
sont des décisions, et un manifeste dont `responsiveWidths` vaut `[1728]` ne prouve rien
sur du mobile. Le gain mesuré est le poste que la rétro chiffrait — la saisie des
identités — **pas** la décision de design, qui reste owner et qui est le sujet d'US3.

## Limite nommée : un dump de pont ne suffit pas seul

`specs/029-…/proofs/H1-bridge-read-only.json` inventorie les nœuds mais **n'épingle
aucune version de fichier**. Comme relevé unique il est donc refusé — `releve-unreadable`,
en nommant la version manquante — plutôt que de se voir inventer un pin. Associé à un
document qui en épingle une, il produit exactement le même set et les mêmes membres que
l'audit. La fixture pin les deux comportements.
