# Data Model — 027 Rendre HeroVideo responsive

## BaselineHeroVideo

État XL/wide 1728 protégé et soumis à H1. Une nouvelle capture est obligatoire même si les reçus historiques sont verts.

| Champ                             | Type                     | Validation                                                                       |
| --------------------------------- | ------------------------ | -------------------------------------------------------------------------------- |
| `baselineId`                      | string                   | Unique, stable pour la campagne.                                                 |
| `gitHead` / `worktreeTree`        | sha                      | Pins du worktree d’implémentation.                                               |
| `figmaFileKey` / `figmaVersionId` | string                   | Fichier et version lus avant toute mutation.                                     |
| `masterNodeId`                    | node id                  | `2151:5552` tant que le préflight le confirme.                                   |
| `historicalComponentKey`          | string                   | `36011e51…c4490`, jamais remplacée par une key de set.                           |
| `homeInstanceNodeId`              | node id                  | `2170:6351` tant que la lecture live le confirme.                                |
| `contractRef`                     | contract id/version/hash | Baseline candidate `ds.hero-video@1.0.0`.                                        |
| `geometry`                        | object                   | Root 1728×720, Container et continuité wide à 1440.                              |
| `protectedFacts`                  | `ProtectedFact[]`        | Identité, média, propriétés, textes, styles, variables, CTA, liens et overrides. |
| `captures`                        | `EvidenceArtifact[]`     | Master, instance et contexte, toutes valides et non vides.                       |
| `status`                          | enum                     | `draft`, `owner-accepted`, `owner-refused`, `superseded`.                        |

Un baseline ne devient `owner-accepted` que par un reçu H1 complet. Un id live divergent ou une image illisible bloque ; il n’est pas remplacé par un nom de calque.

## ResponsiveStructureOption

Option Mobile/Desktop comparable proposée avant H2 dans un harness non autoritatif. Le baseline wide reste protégé.

| Champ                    | Type     | Validation                                                                                                                                                             |
| ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `optionId`               | string   | Unique dans le packet ; au moins deux options.                                                                                                                         |
| `label` / `summary`      | string   | Lisibles par l’owner.                                                                                                                                                  |
| `compositions`           | object   | Valeurs complètes `compact` et `desktop`; chaque entrée porte parts, ordre, layout, hauteur, spacing, Text Style gouverné, CTA et média. `wide` référence le baseline. |
| `boundaryProbeRefs`      | path[]   | Preuves 991/992/993 et 1399/1400/1401.                                                                                                                                 |
| `shortLandscapeFallback` | string   | Croissance/compaction/scroll explicitement proposé.                                                                                                                    |
| `evidenceRefs`           | path[]   | Probes par défaut/long/320/390/834/1200/1728/paysage.                                                                                                                  |
| `tradeoffs` / `limits`   | string[] | Non vides.                                                                                                                                                             |

Une option ne modifie ni le master ni une Page. Son rendu est une aide à la décision, pas une nouvelle vérité.

## OwnerResponsiveDecision

Document autoritatif produit par H2 et validé par [responsive-decision.schema.json](contracts/responsive-decision.schema.json).

| Champ                               | Type                          | Validation                                                         |
| ----------------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| `decisionId`                        | string                        | Unique et versionné.                                               |
| `baselineRef`                       | string                        | Pointe vers le baseline H1 accepté.                                |
| `options`                           | `ResponsiveStructureOption[]` | Deux options au minimum, toutes comparables.                       |
| `selectedOptionId`                  | string                        | Référence une option du même document.                             |
| `breakpoints`                       | object[2]                     | `desktop-start=992`, `wide-start=1400`, opérateur `min-width`.     |
| `designWitnesses`                   | object[4]                     | 390→compact, 834→compact, 1200→desktop, 1728→wide.                 |
| `approvedCompositions`              | object                        | Valeurs Mobile/compact et Desktop ; wide référence le baseline H1. |
| `decisionMaker` / `decidedAt`       | string/date-time              | Obligatoires.                                                      |
| `evidenceRefs`                      | path[]                        | Preuves réellement consultées.                                     |
| `acceptedTradeoffs`                 | string[]                      | Au moins une entrée ou justification explicite `none`.             |
| `rejectedTopics` / `deferredTopics` | string[]                      | Présents même si vides.                                            |
| `status`                            | enum                          | `draft`, `approved`, `rejected`, `superseded`.                     |

Une décision `approved` ne contient aucun champ Mobile/Desktop indécis. Toute nouvelle observation qui invalide un champ ou le profil 992/1400 la fait passer à `superseded` et impose un nouveau H2.

## ResponsiveComposition

État compact, Desktop ou wide du même composant métier, issu de la décision owner puis promu au contrat.

| Champ              | Type                   | Validation                                                          |
| ------------------ | ---------------------- | ------------------------------------------------------------------- |
| `compositionId`    | string                 | Pour HeroVideo : `compact`, `desktop`, `wide`; aucun `tablet`.      |
| `minWidthPx`       | integer                | `0`, `992`, `1400`; unique et strictement croissant après tri.      |
| `figmaStrategy`    | enum                   | `auto-layout`, `modes`, `variant`, selon la nature du delta.        |
| `partOverrides`    | map part path→override | Chemins existants seulement ; vocabulaires gouvernés seulement.     |
| `contentOrder`     | part path[]            | Optionnel, complet si présent.                                      |
| `runtimeOnlyFacts` | object[]               | Chaque fait nomme sa projection canvas `annotate`/`reference-size`. |
| `figmaAnchor`      | object                 | Node/key du membre lorsqu’une composition devient variant.          |

Wide reste le membre historique et conserve sa node/key. Une key de component set est additive. Les breakpoints ne deviennent jamais une prop de `ds.hero-video`.

## DesignWitness

Frame de revue explicite, séparé de la composition et du breakpoint runtime.

| Champ           | Type         | Validation                                                           |
| --------------- | ------------ | -------------------------------------------------------------------- |
| `witnessId`     | string       | Unique et stable.                                                    |
| `widthPx`       | integer      | Largeur exacte de Figma et du viewport navigateur de comparaison.    |
| `compositionId` | string       | Référence une composition existante.                                 |
| `figmaNodeId`   | node id/null | Obligatoire à partir de H3.                                          |
| `fixtureId`     | string       | Contenu, média, police et locale partagés par les deux comparaisons. |

HeroVideo exige `mobile-390→compact`, `tablet-834→compact`, `desktop-1200→desktop` et `wide-1728→wide`. Le témoin 1728 n’est jamais un seuil CSS.

## ResponsiveContractCapability

Extension générique de schéma et d’émetteurs.

| Champ                     | Type                          | Validation                                                                   |
| ------------------------- | ----------------------------- | ---------------------------------------------------------------------------- |
| `schemaVersion`           | semver                        | Évolution additive/optionnelle uniquement.                                   |
| `basis`                   | `viewport-width`              | La media query lit le viewport ; aucun glissement vers la largeur root.      |
| `sourceProfile`           | object                        | Provenance Odoo/Bootstrap 19 et copie vérifiée des valeurs utilisées.        |
| `compositions`            | `ResponsiveComposition[2..n]` | Base `minWidthPx: 0`, seuils uniques et états adjacents effectifs.           |
| `designWitnesses`         | `DesignWitness[]`             | Références de revue distinctes des seuils runtime.                           |
| `allowedOverrideChannels` | string[]                      | Sous-ensemble explicite des canaux existants + ajouts génériques documentés. |
| `publicPropExposure`      | `none`                        | Invariant.                                                                   |
| `codeProjection`          | enum                          | `media-query`, automatique.                                                  |
| `figmaProjection`         | enum                          | Explicite, non automatique au resize.                                        |
| `evalIds`                 | string[]                      | Fixtures négatives et positives enregistrées avant claim.                    |

Un chemin de part inconnu, un seuil dupliqué, une base absente, un état adjacent sans delta, une valeur/Text Style brute interdite, une composition Tablet ou une prop `viewport` invalide la génération.

## ProtectedFact

Invariant à comparer avant/après/no-op.

| Champ                                         | Type        | Validation                                                                                                                            |
| --------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `factId`                                      | string      | Unique.                                                                                                                               |
| `category`                                    | enum        | `identity`, `property`, `content`, `text-style`, `variable`, `media`, `crop`, `nested-instance`, `override`, `geometry`, `authoring`. |
| `surface`                                     | enum        | `figma-master`, `figma-home`, `contract`, `web`, `odoo`.                                                                              |
| `address`                                     | object      | Node/part/property/selector positionnel.                                                                                              |
| `beforeDigest` / `afterDigest` / `noOpDigest` | sha256      | Égaux sauf delta explicitement approuvé.                                                                                              |
| `allowedDeltaRef`                             | string/null | Décision H2/H3 uniquement.                                                                                                            |
| `status`                                      | enum        | `preserved`, `approved-delta`, `missing`, `changed`, `unverifiable`.                                                                  |

`missing`, `changed` non approuvé ou `unverifiable` est bloquant. Un simple compte d’images ou d’instances ne remplace pas l’appariement par adresse.

## SavedHeroVideoInstance

Occurrence Odoo COW sauvegardée et contenu éditorial à préserver.

| Champ                                               | Type   | Validation                                               |
| --------------------------------------------------- | ------ | -------------------------------------------------------- |
| `recordId` / `pageId` / `instanceId`                | string | Identité QA stable.                                      |
| `rootSelector`                                      | string | `.s_pqr_hero_video`.                                     |
| `contractVersion` / `graphDigest`                   | string | Métadonnées avant update.                                |
| `outerHtmlDigest`                                   | sha256 | Doit être identique avant/après `odoo -u`.               |
| `poster` / `alt` / `title` / `ctaLabel` / `ctaHref` | string | Valeurs éditées et relues.                               |
| `responsiveCssVersion`                              | string | Version d’asset réellement chargée.                      |
| `status`                                            | enum   | `current`, `policy-stale`, `structure-stale`, `unknown`. |

La feature peut faire agir une nouvelle CSS sur le DOM existant ; elle ne change jamais `outerHtmlDigest`. Si le DOM approuvé n’est pas compatible, `structure-stale` est un arrêt honnête, pas une transition vers `current`.

## EvidenceArtifact et ResponsiveProbe

`EvidenceArtifact` contient id, surface, `witnessId` éventuel, `compositionId`, viewport exact, largeur root, fixture, contenu, média, police/état, chemin, SHA-256, dimensions, timestamp, version source et statut (`valid`, `missing`, `empty`, `wrong-size`, `unreadable`, `stale`). Seul `valid` entre dans une décision.

`ResponsiveProbe` lie un viewport à des mesures :

| Champ                                       | Validation                                                     |
| ------------------------------------------- | -------------------------------------------------------------- |
| `width` / `height`                          | Valeurs réelles ; le paysage court porte sa hauteur.           |
| `boundaryId`                                | `none`, `desktop-start±1/0` ou `wide-start±1/0`.               |
| `witnessId`                                 | Présent seulement pour 390/834/1200/1728.                      |
| `expectedComposition` / `activeComposition` | Égales ; chaque largeur n’active qu’un seul état.              |
| `contentCase`                               | `default`, `long-title`, `long-cta`.                           |
| `mediaCase`                                 | `poster`, `video-unavailable`.                                 |
| `rootBounds` / `descendantBounds`           | Tous les descendants visibles contenus.                        |
| `horizontalOverflow`                        | `0`.                                                           |
| `unintendedCrop` / `overlap`                | `false`.                                                       |
| `groupCenterDeltaX/Y`                       | `<= 2` lorsque le contenu tient.                               |
| `contentAccessible`                         | `true` même en faible hauteur.                                 |
| `artifactRefs`                              | Au moins une mesure fraîche et, pour les témoins, une capture. |

## SurfaceComparison

Comparaison appariée Figma↔référence ou référence↔Odoo.

| Champ                         | Validation                                                               |
| ----------------------------- | ------------------------------------------------------------------------ |
| `fromSurface` / `toSurface`   | Paire autorisée seulement.                                               |
| `witnessId` / `compositionId` | Un des quatre témoins et son état attendu.                               |
| `fixtureId` / `conditions`    | Contenu, média, police, locale, viewport et état strictement identiques. |
| `rawDeltaPercent`             | `< 2`, sauf décision owner refusante.                                    |
| `excludedRegions`             | Chaque région a raison et approval ref ; jamais implicite.               |
| `status`                      | `pass`, `fail`, `capture-failed`, `dimension-mismatch`.                  |

Ces comparaisons restent limitées aux quatre témoins de design ; le ledger exige exactement huit lignes, une par direction et témoin.

## WideContinuityCheck

Contrôle visuel additionnel de la continuité `wide` à 1440 px. Il complète SC-002 mais ne devient ni un cinquième témoin de design ni une quatrième composition.

| Champ | Validation |
| --- | --- |
| `checkId` | Constante `wide-1440-continuity`. |
| `fromSurface` / `toSurface` | Exactement `figma` → `reference-web`. |
| `compositionId` / `viewportWidth` | Exactement `wide` et `1440`. |
| `fixtureId` / `conditionsDigest` | Contenu, média, police, locale, viewport et état identiques. |
| `thresholdPercent` / `rawDeltaPercent` | Seuil `2`; delta `< 2`, sauf exclusion explicitement approuvée. |
| `artifacts` / `status` | Captures fraîches valides ; `pass` à la clôture. |

Un ledger accepté porte un `wideContinuityCheck`, séparé des huit `SurfaceComparison` des témoins 390/834/1200/1728 ; le champ est absent des états de travail antérieurs à la clôture.

## HumanGateReceipt

| Champ                                                     | Validation                                                      |
| --------------------------------------------------------- | --------------------------------------------------------------- |
| `gateId`                                                  | `H1`, `H2`, `H3` ou `H4`; exactement un reçu terminal par gate. |
| `decision`                                                | `accepted`, `refused`, `superseded`.                            |
| `decisionMaker` / `decidedAt`                             | Obligatoires.                                                   |
| `optionsReviewed`                                         | Non vide pour H2 ; explicite pour les autres gates.             |
| `evidenceRefs`                                            | Non vides et valides.                                           |
| `acceptedTradeoffs` / `rejectedTopics` / `deferredTopics` | Toujours présents.                                              |
| `authorizes`                                              | Étape suivante exacte.                                          |

Les transitions sont strictes :

```text
audited → H1 accepted
  → options-complete → H2 accepted
    → figma-applied-and-verified → H3 accepted
      → contract/web/odoo-converged → H4 accepted
        → closed
```

Un gate refusé n’est jamais sauté par une porte mécanique verte.

## ReconciliationRun

| Champ                                                    | Validation                               |
| -------------------------------------------------------- | ---------------------------------------- |
| `runId`                                                  | Identifie `first` ou `second`.           |
| `decisionDigest` / `contractDigest` / `schemaDigest`     | Identiques entre les deux runs.          |
| `generatedManifestDigest`                                | Stable au second passage.                |
| `createdNodeIds` / `changedNodeIds` / `duplicateNodeIds` | Vides au second passage.                 |
| `pageWrites`                                             | Toujours vide.                           |
| `protectedFactResults`                                   | Tous `preserved`/`approved-delta`.       |
| `status`                                                 | `applied`, `no-op`, `blocked`, `failed`. |

La clôture exige un premier run accepté, puis un second run `no-op` avec des preuves complètes.

## CapitalizationDossier

Dossier final qui référence baseline, options, décision H2, H1–H4, capability diff, générations, matrices, parités, Odoo, refus, no-op et limites. Il sépare :

- décisions humaines non automatisables ;
- contrôles mécaniques et leurs entrées/sorties ;
- conditions d’arrêt ;
- enseignements candidats pour une future spécification.

Il ne porte aucun statut prétendant que `component-to-responsive` existe ou est généralisée.

## Relations

```text
BaselineHeroVideo ──accepted by──> H1
BaselineHeroVideo ──feeds──> ResponsiveStructureOption[2..3]
ResponsiveStructureOption ──selected by──> OwnerResponsiveDecision ──accepted by──> H2
OwnerResponsiveDecision ──defines──> ResponsiveComposition[compact, desktop, wide]
ResponsiveComposition ──presented by──> DesignWitness[390, 834, 1200, 1728]
ResponsiveComposition ──encoded by──> ResponsiveContractCapability
ResponsiveComposition ──protects──> ProtectedFact[*]
H2 ──authorizes──> Figma source adaptation ──accepted by──> H3
H3 ──authorizes promotion──> Contract ──projects to──> Web + Odoo
SavedHeroVideoInstance ──qualified by──> ResponsiveProbe + update proof
ResponsiveProbe[*] + SurfaceComparison[*] + ReconciliationRun(no-op) ──support──> H4
H1..H4 + all evidence ──assemble──> CapitalizationDossier
```
