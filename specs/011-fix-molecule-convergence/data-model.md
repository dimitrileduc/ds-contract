# Phase 1 — Data Model: campagne de convergence des molécules

**Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md) |
**Research**: [research.md](./research.md)

Le schéma des composants reste l'autorité pour le produit. Ce document décrit aussi les
entités de preuve nécessaires à la campagne 011. Les interfaces sérialisées sont définies
dans [`contracts/`](./contracts/).

## 1. HistoricalBaseline

État immuable utilisé pour l'attribution, jamais comme worktree à restaurer.

| Champ | Type | Règle |
|---|---|---|
| `checkpointCommit` | SHA Git | Exactement `45e2a7d5a950e3d6ccc2a0dd62982b7c288210c5` |
| `wipCommit` | SHA Git | Baseline initiale `29d70187cdb7c7e45ca3bbc4f2d75da64bcd31b5`, ou nouvelle valeur explicitement acceptée si le WIP avance avant implémentation |
| `wipTree` | SHA Git tree | Doit correspondre à `wipCommit` |
| `initialStatus` | liste path/status | Capture du worktree avant toute source 011 |
| `pathHashes` | map path→SHA-256 | Sources et sorties dans le blast radius |
| `capturedAt` | ISO-8601 | Informatif, non utilisé dans les calculs déterministes |

**Validation**: les commits doivent être résolvables ; aucun fichier n'est restauré depuis
ces SHAs. Le rapport final distingue checkpoint→WIP et WIP→011.

## 2. TargetMolecule

Une des sept unités dont le verdict est exigé.

| Champ | Type | Règle |
|---|---|---|
| `id` | enum | `carte`, `field`, `member-card`, `nav-item`, `product-card`, `realisation`, `tab` |
| `contractId` | string | ID stable `ds.*` existant |
| `contractVersion` | semver | Version réellement utilisée par la campagne |
| `figmaSetNodeId` | string | Node master audité |
| `auditRefs` | path[] | Au moins un reçu 003/005/007 |
| `affectedDependents` | contractId[] | Composants à regater si la correction les affecte |
| `requiredCaseIds` | string[] | Non vide, sans doublon |
| `verdict` | `pending|pass|fail|blocked` | Dérivé, jamais saisi manuellement |
| `reasons` | string[] | Obligatoire hors `pass` |

**Validation**: il y a exactement sept TargetMolecule et aucun autre composant n'obtient
un verdict cible. Une dépendance modifiée (par exemple MemberPicture) est testée mais ne
devient pas une huitième cible.

## 3. ObservableFact

Fait visible, structurel ou sémantique observé dans Figma ou exigé explicitement par la
spec.

| Champ | Type | Règle |
|---|---|---|
| `id` | string | Stable dans la campagne |
| `targetId` | TargetMolecule.id | Référence valide |
| `channel` | enum | `variant`, `boolean`, `swap`, `text`, `rich-text`, `image`, `layout`, `style`, `anatomy`, `semantic` |
| `figmaPath` | string/null | Node/layer/property audité ; null seulement pour une sémantique authored nommée |
| `figmaValue` | JSON | Valeur observée sans interprétation silencieuse |
| `sourceNodeId` | string | Node concret portant le fait |
| `sourceVersion` | string | Version Figma pinée |
| `auditRef` | path | Reçu historique ou capture de census |
| `required` | boolean | Toujours `true` dans le périmètre final |

**Validation**: tout fait requis est couvert par au moins un ComparisonCase et par un
ContractFact. Un fait non lisible reste présent avec une raison de blocage ; il n'est pas
omis.

## 4. ContractFact

Lien vérifiable entre un ObservableFact et le contrat source.

| Champ | Type | Règle |
|---|---|---|
| `factId` | ObservableFact.id | Un fait existant |
| `contractId` | string | Contrat source ou dépendance autorisée |
| `contractVersion` | semver | Version de campagne |
| `jsonPointer` | JSON Pointer | Doit résoudre dans le contrat parsé |
| `projection` | enum | `react`, `html`, `react-inline`, `figma-script`, `all` |
| `semverImpact` | enum | `patch`, `minor`, `major`, `none` |
| `provenance` | enum | `extracted`, `authored`, `comparison-only` |

**Validation**: aucune référence vers `src/components/`, `figma-sync/` ou `catalog/`
comme source. Un changement `text`→`rich-text` est `major`; un champ de schéma est
optionnel et documenté.

## 5. ComparisonCase

Combinaison atomique évaluée contre une référence Figma immuable.

| Champ | Type | Règle |
|---|---|---|
| `id` | string | Unique globalement |
| `targetId` | TargetMolecule.id | Cible valide |
| `figmaNodeId` | string | Node existant, jamais synthétique |
| `aliases` | AliasOccurrence[] | Occurrences Figma dédupliquées, vide si aucune |
| `figmaVariant` | string/null | Nom exact si applicable |
| `observedProperties` | map | Valeurs lues sur le node de référence |
| `codeProps` | map | Entrées équivalentes du contrat généré |
| `factIds` | string[] | Tous les faits prouvés par le cas |
| `fixtureAssetIds` | string[] | Vide seulement si le cas n'a aucune image |
| `comparisonSurface` | `light|dark` | Commune aux deux côtés |
| `requiredRegions` | RegionExpectation[] | Au moins une région utile |
| `requiredParts` | string[] | Parts dont la géométrie doit être mesurée |
| `semanticAssertions` | SemanticAssertion[] | Non vide pour Field/NavItem/Tab et tout contrôle |
| `status` | CaseStatus | Transition définie plus bas |

**Validation**:

- l'union des cas égale le census Figma ∪ contrat ;
- une propriété non-défaut a un node concret ;
- toute image visible a un ImageReceipt ;
- aucun case ne peut être `pass` avec un skip/refus/API decline ;
- les cas connus incluent au minimum :
  - Field : `etat(2) × optionnel(2) × saisie(3)` = 12 ;
  - NavItem : `chevron(2) × actif(2)` = 4 ;
  - ProductCard : `image(4) × bouton(2)` = 8 ;
  - MemberCard : 16 portraits/contenus ;
  - Realisation : 27 instances (3 Grand, 24 Petit) ;
  - Carte : 26 images uniques et toute occurrence dont les autres faits diffèrent ;
  - Tab : 2 états.

Une déduplication est légale seulement si deux références ont les mêmes faits, image hash,
géométrie et sémantique. Chaque `AliasOccurrence` conserve son `figmaNodeId`, ses
`factIds`, son `imageSha256`, ses empreintes de géométrie et de sémantique, puis pointe vers
le `id` canonique du cas de preuve ; une empreinte manquante ou différente rend la
couverture incomplète.

### AliasOccurrence

| Champ | Type | Règle |
|---|---|---|
| `canonicalCaseId` | ComparisonCase.id | Cas auquel l'occurrence est dédupliquée |
| `figmaNodeId` | string | Occurrence Figma distincte, existante dans la version pinée |
| `factIds` | string[] | Égalité exacte avec le cas canonique |
| `imageSha256` | hex 64/null | Égalité exacte ; `null` seulement sans image obligatoire |
| `geometryFingerprint` | string | Empreinte calculée de la géométrie requise |
| `semanticFingerprint` | string | Empreinte calculée des assertions sémantiques |

**Validation**: les empreintes sont recalculées par le runner, pas seulement fournies par
le manifeste. Un alias n'est jamais utilisé pour réduire une combinaison dont un fait
observable diffère.

## 6. ImageReceipt

Asset de preuve obtenu en lecture seule.

| Champ | Type | Règle |
|---|---|---|
| `id` | string | Stable, référencé par les cases |
| `fileKey` | string | Fichier Figma attendu |
| `fileVersion` | string | Même version que la campagne |
| `instanceNodeId` | string | Instance visible concernée |
| `paintNodeId` | string | Nœud portant le paint |
| `imageRef` | string | Identité Figma observée |
| `scaleMode` | string | Valeur observée |
| `file` | path relatif | Sous le répertoire fixture autorisé |
| `mediaType` | string | PNG/JPEG accepté |
| `width`,`height` | int >0 | Dimensions décodées |
| `bytes` | int >0 | Taille exacte |
| `sha256` | hex 64 | Hash exact |
| `alt` | string | Valeur d'accessibilité fournie au rendu de test |
| `runtimeDefault` | boolean | Doit être `false` |

**Validation**: le fetch refuse tout octet dont le hash diffère. Le navigateur doit
confirmer `complete`, `naturalWidth/Height > 0` et des pixels visibles dans la région
attendue. URL signée et token Figma ne sont jamais persistés.

## 7. RegionExpectation

Région utile définie avant la comparaison.

| Champ | Type | Règle |
|---|---|---|
| `id` | string | Unique dans le cas |
| `source` | enum | `part`, `root`, `explicit-normalized-rect` |
| `partName` | string/null | Requis pour `part` |
| `rect` | `{x,y,width,height}`/null | Valeurs 0..1 pour une région explicite |
| `kind` | enum | `image`, `text`, `geometry`, `decoration`, `whole` |
| `metric` | enum | `raw-pixel`, `signal-preserving-text` |
| `maxDiffPct` | number | ≤2,5 |
| `minSignalPixels` | int >0 | Refus des régions vides |

**Validation**: une région n'est jamais dérivée du diff observé. La métrique texte garde
toute l'encre et possède une fixture adversariale. Une image a obligatoirement sa région.

## 8. VisibilityReceipt

Preuve qu'un côté contient un signal utile.

| Champ | Type | Règle |
|---|---|---|
| `side` | `figma|generated` | Deux reçus par cas |
| `alphaPixels` | int | >0 avant flattening |
| `contrastPixels` | int | >0 contre la surface commune |
| `paintedBounds` | rect | Aire non nulle |
| `imagePixels` | int/null | >0 si image obligatoire |
| `surface` | `light|dark` | Identique aux deux côtés |
| `probative` | boolean | Dérivé |
| `reason` | string/null | Obligatoire si false |

**Validation**: blank/blank, transparent/transparent, blanc invisible sur blanc ou image
absente est non probant même si le diff vaut 0.

## 9. GeometryReceipt

Mesure indépendante du score pixel.

| Champ | Type | Règle |
|---|---|---|
| `rootFigma`,`rootGenerated` | rect | Coordonnées CSS/device explicites |
| `rootDelta` | rect-delta | Calculé sans resampling |
| `parts` | map part→pair rect normalisé | Chaque `requiredPart` présent |
| `verdict` | `pass|fail|justified` | Dérivé |
| `contractJustification` | JSON Pointer/null | Obligatoire pour `justified` |

**Validation**: aucune corrélation automatique, translation optimisée, mise à l'échelle ou
normalisation arbitraire. Un écart n'est accepté que s'il est explicitement porté par le
contrat et visible dans le rapport.

## 10. PixelReceipt

| Champ | Type | Règle |
|---|---|---|
| `rawPct` | number | Score global non masqué |
| `maskedDiagnosticPct` | number/null | Diagnostic uniquement |
| `maskCoveragePct` | number | Toujours imprimé |
| `regions` | map id→score | Toutes les régions requises |
| `thresholdPct` | number | 2,5 pour 011 |
| `verdict` | `pass|fail` | `rawPct` et toutes régions ≤ seuil |

**Validation**: aucun agrégat par molécule. Le masque ne contribue jamais au verdict.

## 11. SemanticAssertion et SemanticReceipt

| Champ | Type | Règle |
|---|---|---|
| `id` | string | Stable |
| `contractPointer` | JSON Pointer | Fait sémantique |
| `selector` | string | Cible DOM générée |
| `assertion` | enum | `element`, `attribute`, `relationship`, `keyboard-context` |
| `expected` | JSON | Valeur attendue |
| `actual` | JSON | Valeur mesurée |
| `verdict` | `pass|fail` | Dérivé |

Exigences minimales : Field applique `aria-invalid`/`aria-describedby` au contrôle ;
NavItem applique `aria-current=page` quand actif ; Tab expose `role=tab`,
`aria-selected`, `aria-controls` et le tabIndex roving attendu dans un contexte
`tablist` gouverné.

## 12. ArtifactReceipt

| Champ | Type | Règle |
|---|---|---|
| `kind` | enum | `figma`, `generated`, `diff`, `triptych`, `metadata` |
| `path` | path relatif | Sous le répertoire de campagne |
| `sha256` | hex 64 | Hash après écriture |
| `width`,`height` | int/null | Images uniquement |

Chaque cas possède au minimum référence, généré, diff et triptyque.

## 13. CaseVerdict, TargetVerdict et CampaignVerdict

### CaseVerdict

`pass` si et seulement si :

1. couverture et référence sont valides ;
2. les deux côtés sont probants ;
3. toutes les images passent ;
4. la géométrie passe ou est justifiée par contrat ;
5. le score global et chaque région sont ≤2,5 % ;
6. toutes les assertions sémantiques passent ;
7. tous les artefacts attendus existent et sont hashés.

### TargetVerdict

`pass = all(required cases pass)`. Un seul cas manquant/non probant/fail donne `fail` ou
`blocked`.

### CampaignVerdict

`pass` si exactement sept TargetVerdict passent, que la couverture n'a aucun
missing/unexpected, que les gates du dépôt sont verts et que l'attribution ne montre
aucune mutation Figma ni édition manuelle de généré.

## 14. Transitions d'état

```text
inventoried
  → source-pinned
  → contract-covered
  → regenerated
  → captured
  → probative
  → measured
  → semantically-verified
  → pass
```

Transitions d'échec possibles à toute étape :

- `coverage-incomplete`
- `stale-reference`
- `asset-invalid`
- `render-refused`
- `non-probative`
- `geometry-fail`
- `pixel-fail`
- `semantic-fail`
- `artifact-missing`

Tout changement de contrat, version Figma, prop preset, image hash, rendu généré ou
commande invalide les reçus en aval et ramène le cas à l'état correspondant.

## 15. Relations

```text
HistoricalBaseline ──attribue──▶ CampaignVerdict
TargetMolecule 1 ──* ObservableFact
ObservableFact 1 ──1..* ContractFact
TargetMolecule 1 ──* ComparisonCase
ComparisonCase * ──* ObservableFact
ComparisonCase * ──* ImageReceipt
ComparisonCase 1 ──2 VisibilityReceipt
ComparisonCase 1 ──1 GeometryReceipt
ComparisonCase 1 ──1 PixelReceipt
ComparisonCase 1 ──* SemanticReceipt
ComparisonCase 1 ──4..* ArtifactReceipt
TargetVerdict = AND(ComparisonCase verdicts)
CampaignVerdict = AND(7 TargetVerdicts, coverage, repo gates, attribution)
```
