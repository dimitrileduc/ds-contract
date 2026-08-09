# Modèle de données — Fondation Odoo de production

**Feature**: `019-odoo-production-foundation`  
**Date**: 2026-08-07

Ce modèle décrit les données versionnées et les états observables de la fondation. Les contrats DS
existants restent la source de vérité; ce document n'en crée pas de copie.

## 1. `InputSnapshot`

Verrou reproductible des entrées consommées par une qualification.

| Champ | Type | Règle |
|---|---|---|
| `schemaVersion` | version | Obligatoire, version du format de lock |
| `snapshotId` | identifiant | Stable, unique dans l'intégration |
| `odoo.image` | chaîne | Tag d'image exact, jamais flottant |
| `odoo.sourceCommit` | SHA Git | Commit de référence des APIs builder |
| `contracts[]` | `PinnedInput` | Exactement les 5 contrats du périmètre |
| `tokens[]` | `PinnedInput` | Sources de tokens réellement lues |
| `registries[]` | `PinnedInput` | Icônes et littéraux nommés utilisés |
| `assets[]` | `PinnedInput` | Fontes/images copiées par le build |
| `graphDigest` | SHA-256 | Digest canonique de la fermeture des 2 racines |

Un `PinnedInput` contient `path`, `kind`, `id`, `version` si la source est versionnée, et `sha256`.
Le chemin référence la source du dépôt, jamais une copie sous `integrations/odoo/`.

### Validation

- Les racines sont `ds.presentation@2.5.0` et `ds.google-reviews@1.0.0` au snapshot initial.
- La fermeture contient exactement `ds.presentation`, `ds.section-header`, `ds.button`,
  `ds.google-reviews` et `ds.review-card`.
- Tout hash ou version observé différent met le snapshot en état `drifted`.
- Un repin est une action explicite qui invalide les anciennes preuves affectées.

## 2. `AuthoringConfig`

Décisions owner pour une section racine et toutes ses occurrences imbriquées.

| Champ | Type | Règle |
|---|---|---|
| `schemaVersion` | version | Obligatoire |
| `configId` | identifiant | Unique et stable |
| `authoringVersion` | semver | Bump à chaque changement de politique |
| `rootContract` | `{id, version}` | Une des 2 sections posables |
| `snapshotId` | référence | Doit résoudre vers le lock actif |
| `rootActions` | `RootActionDecision[]` | Un verdict explicite par action connue |
| `controls` | `ControlDecision[]` | Décisions de props |
| `parts` | `PartDecision[]` | Décisions de parts rendues |

### `GraphAddress`

Adresse canonique d'une occurrence, jamais un nom court.

- `componentPath[]`: première entrée = contrat racine; chaque entrée suivante indique le contrat
  enfant et la part de composant qui y conduit;
- `prop`: présent seulement pour une `ControlDecision`;
- `partPath[]`: présent seulement pour une `PartDecision`, et peut inclure un segment de repeat
  wildcard pour toutes les cartes;
- `selector`: sélecteur DOM root-scoped attendu pour la part, distinct de son identité contractuelle.

Deux adresses canoniques identiques sont interdites. Deux parts homonymes restent distinctes si leur
`componentPath` diffère.

### `ControlDecision`

| Champ | Type | Règle |
|---|---|---|
| `address` | `GraphAddress` de prop | Doit résoudre vers exactement une prop |
| `verdict` | enum | `controlled`, `fixed-by-composition`, `not-editable`, `out-of-capacity` |
| `mechanism` | enum/null | Requis pour `controlled`, interdit si incohérent |
| `targetSelector` | chaîne/null | Requis si le contrôle agit sur le DOM |
| `label` | chaîne/null | Label du panneau si exposé |
| `reasonCode` | référence/null | Requis pour exception ou hors capacité |
| `visibleWhen` | expression structurée/null | Condition dérivée, jamais code libre |

Mécanismes initiaux : `plain-text`, `rich-text`, `boolean`, `enum`, `number`, `media`,
`ordered-repeat`, `computed-display`, `none`.

### `PartDecision`

| Champ | Type | Règle |
|---|---|---|
| `address` | `GraphAddress` de part | Doit résoudre vers exactement une occurrence |
| `verdict` | enum | `directly-editable`, `fixed-by-composition`, `not-editable`, `out-of-capacity` |
| `contentKind` | enum | Cohérent avec la part contractuelle |
| `allowedMarks[]` | enum | Seulement pour rich-text |
| `selector` | chaîne | Préfixé par la racine du snippet |
| `reasonCode` | référence/null | Requis si écart ou hors capacité |

### Couverture

Le validateur calcule la fermeture depuis le snapshot. Il attend un verdict unique pour chacune des
30 props et 61 parts locales, puis vérifie les occurrences imbriquées et les wildcards de repeat.
Une part conditionnelle absente au rendu courant reste obligatoire dans la config.

## 3. `AdaptationRegistry`

Inventaire exhaustif des zones manuelles spécifiques à Odoo.

| Champ | Type | Règle |
|---|---|---|
| `schemaVersion` | version | Obligatoire |
| `reasonCodes[]` | définition | Vocabulaire fini, description stable |
| `adaptations[]` | `Adaptation` | Un enregistrement par bloc manuel marqué |

Une `Adaptation` contient :

- `adaptationId`, identique aux marqueurs `BEGIN/END` du fichier;
- `path`, relatif au dépôt et limité aux zones manuelles déclarées;
- `rootContracts[]`, sections concernées;
- `reasonCode`, issu du registre;
- `decisionRefs[]`, adresses ou IDs de décisions justifiant le bloc;
- `mechanism`, catégorie factuelle (`qweb`, `builder-option`, `repeat-action`, `media`,
  `save-version`, `odoo-bridge`, `qualification`, `compatibility`) — `compatibility` couvre les
  blocs qui n'existent que pour franchir une frontière d'API interne Odoo (plan §3).

Il ne contient pas d'avis `derivable`. Un bloc sans registre, un registre sans bloc ou des marqueurs
chevauchants font échouer le contrôle.

## 4. `GeneratedArtifact`

Sortie reproductible du build Odoo.

| Champ | Type | Règle |
|---|---|---|
| `path` | chemin | Sous une zone `generated/` déclarée |
| `sourceInputs[]` | références | Entrées du snapshot ayant contribué |
| `sha256` | SHA-256 | Calculé après génération canonique |
| `bytes` | entier | Taille exacte |
| `generatorVersion` | version | Version de l'outil de production |

États : `clean` si identique à la régénération, `tampered` si le fichier diffère, `missing` s'il est
absent, `orphan` s'il n'est plus prédit. Seul `clean` est qualifiable.

## 5. `SavedSectionInstance`

État observable d'un bloc après insertion dans une page Odoo.

| Champ | Type | Règle |
|---|---|---|
| `rootContractId` | identifiant | Persisté dans `data-ds-contract` |
| `rootContractVersion` | semver | Version structurelle à l'insertion |
| `authoringVersion` | semver | Politique active lors de l'insertion |
| `graphDigest` | SHA-256 | Fermeture exacte ayant produit la structure |
| `instanceMarker` | identifiant local | Sert aux preuves d'isolation, pas au contenu métier |
| `content` | DOM Odoo sauvegardé | Structure et valeurs de l'instance |

### États de version

- `current`: version et digest identiques au snapshot actif;
- `policy-stale`: structure courante, politique d'authoring plus récente disponible; elle est
  réappliquée à la prochaine ouverture;
- `structure-stale`: version ou digest de structure différent; action explicite requise;
- `unknown`: métadonnées absentes/incohérentes; jamais traité comme courant.

Transition autorisée en 019 : `policy-stale → current-policy` par réouverture, sans modifier le
marqueur structurel. `structure-stale` ne transitionne jamais automatiquement vers `current`.

## 6. `ReviewItem`

Occurrence ordonnée de `ds.review-card` dans une instance Google Reviews.

| Champ | Origine | Règle |
|---|---|---|
| `position` | ordre DOM | Entier contigu calculé, non saisi |
| `author`, `initial`, `date`, `testimonial` | contrat | Éditables selon config |
| `photoVisible` | contrat | Booléen indépendant |
| `initialVisible` | contrat | Booléen indépendant |
| `avatarSource` | média Odoo | Requis seulement si l'état décidé l'exige |
| `avatarAlt` | texte simple | Non vide quand la photo est publiée |
| autres booléens/valeurs | contrat | Verdict explicite chacun |
| `itemMarker` | adaptateur | Identité technique locale, sans sémantique métier |

La collection accepte 0, 1, 5 et plus de 5 éléments. Le prototype inerte permettant l'ajout depuis
zéro n'est jamais rendu comme un avis public ni compté dans la collection.

Transitions : `sampled → edited`, `item-added`, `item-moved`, `item-removed`. Chaque transition ne
devient `persisted` qu'après save, fermeture/réouverture et observation publique concordante.

## 7. `DerivationReport`

Rapport produit, jamais édité manuellement.

| Champ | Type | Règle |
|---|---|---|
| `snapshotId` | référence | Entrées exactes |
| `generatedArtifacts[]` | mesures | Attendu/réel/hash/état |
| `coverage` | compteurs | Props, parts, chemins, verdicts manquants/extra |
| `manualDelta` | mesures | Fichiers, blocs, lignes, octets par reasonCode/mécanisme |
| `unclassified` | listes | Doit être vide pour qualifier |
| `canonicalDigest` | SHA-256 | Digest de la sérialisation canonique du rapport |

Deux exécutions sur le même snapshot produisent le même fichier à l'octet; le rapport ne contient
ni timestamp volatil, ni chemin absolu, ni ordre dépendant du système de fichiers.

## 8. `QualificationReceipt` et `QualificationManifest`

Le manifeste agrège les scénarios attendus pour un snapshot. Chaque reçu contient : `receiptId`,
`scenarioId`, `snapshotId`, version du module, environnement, fixture, étapes observables, statut
`pass|fail|skipped`, artefacts produits et limitations codifiées.

Règles :

- `skipped` n'est jamais agrégé comme `pass`;
- les reçus de pixel diff portent viewport, fontes, contenu, clip et hash des deux images;
- les reçus save/reopen distinguent éditeur et public;
- le manifeste retrouve les versions imbriquées depuis `graphDigest` et le snapshot;
- le manifeste porte un `releaseStatus` parmi `incomplete`, `failed`, `qualified` et
  `qualified-with-limits`. Il n'atteint `qualified` que si tous les scénarios obligatoires sont
  `pass` et que le delta manuel est classé ; il vaut `qualified-with-limits` si des limites
  subsistent et ont été explicitement acceptées.

## Relations

```text
InputSnapshot 1 ─── n AuthoringConfig
InputSnapshot 1 ─── n GeneratedArtifact
AuthoringConfig 1 ─── n ControlDecision
AuthoringConfig 1 ─── n PartDecision
AdaptationRegistry 1 ─── n Adaptation
SavedSectionInstance n ─── 1 InputSnapshot (via graphDigest)
SavedSectionInstance[GoogleReviews] 1 ─── n ReviewItem
InputSnapshot + AuthoringConfig + GeneratedArtifact + AdaptationRegistry
    └── 1 DerivationReport
QualificationManifest 1 ─── n QualificationReceipt
```
