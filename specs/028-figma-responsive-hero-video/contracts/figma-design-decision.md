# Interface Contract — H2 Figma Design Decision

Ce contrat interne définit ce que l'owner accepte à H2. Il ne s'agit pas du
contrat produit HeroVideo.

## Required payload

| Field | Contract |
| --- | --- |
| `decisionId` | Unique, versionné et immuable après acceptation |
| `status` | `draft`, `approved`, `rejected` ou `blocked` |
| `baselineRef` | H1 frais approuvé |
| `historicalDirectionRef` | H2 `centre-immersif` de 027 |
| `compositions` | Exactement Compact, Desktop et Wide |
| `witnesses` | 390→Compact, 834→Compact, 1200→Desktop, 1728→Wide |
| `controlCases` | 320, 1440 et paysage court |
| `fixtures` | Défaut, titre long et CTA long au minimum |
| `primitiveBindings` | Une entrée par gap/padding/dimension modifiée |
| `typographyOverrides` | Zéro ou une entrée bornée par nouvelle composition |
| `mediaDecision` | Poster/crop/voiles conservés; conflit de point focal nommé |
| `childDecisions` | Button inchangé; toute capacité absente différée |
| `workFrameRefs` | Captures et node ids des options présentées |
| `tradeoffs` | Compromis et limites visibles |
| `decisionMaker` / `decidedAt` | Owner et date explicites |

## Composition contract

- Compact: colonne, groupe centré horizontalement et verticalement, titre centré,
  CTA après le titre, min-height + grow.
- Desktop: même direction centrée, valeurs locales distinctes possibles, min-height
  + grow.
- Wide: membre historique 1728×720 inchangé, organisation horizontale basse et Text
  Style exact.
- La propriété se nomme `Presentation`; aucune largeur ne devient une valeur de
  variant.
- La sélection est explicite dans Figma Design; aucun breakpoint automatique n'est
  revendiqué.

## Primitive binding contract

Chaque entrée fournit:

```text
compositionId
nodeIdOrPath
figmaProperty
variableId
variableName
resolvedValue
sourceCollection
evidenceRef
```

La variable doit préexister à 028 et être compatible avec la propriété. Une valeur
résolue correcte sans binding exact est invalide. Une primitive absente rend H2
`blocked`; elle n'autorise ni literal ni création de variable.

## Temporary typography contract

Chaque entrée fournit le rôle `Titre Hero vidéo`, le Text Style source, la
composition, les métriques avant/après et un sous-ensemble de `fontSize`,
`lineHeight`, `textAlignHorizontal`. Famille, poids et contenu doivent être
identiques. `debtStatus` vaut toujours `pending-responsive-text-style`.

## Acceptance and authorization

`status=approved` autorise seulement la préparation de la transition et de H3.
Il n'autorise ni écriture du master, ni Page write, ni promotion contrat/code.

