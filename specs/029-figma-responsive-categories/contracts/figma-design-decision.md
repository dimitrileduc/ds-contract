# Interface Contract — H2 Figma Design Decision (029)

Ce contrat interne définit ce que l'owner accepte à H2. Il ne s'agit pas des
contrats produits `ds.categories-principales` / `ds.carte-categorie`.

## Required payload

| Field | Contract |
| --- | --- |
| `decisionId` | Unique, versionné et immuable après acceptation |
| `status` | `draft`, `approved`, `rejected` ou `blocked` |
| `baselineRef` | H1 frais approuvé (2 masters + exclusivité carte + 7 usages) |
| `historicalRefs` | 021 (apparence approuvée), 023 (gates A/B/C) — contexte, jamais décision |
| `behaviors` | Mobile, desktop et wide, pour les configurations 2 ET 3 colonnes |
| `witnesses` | Témoins par comportement; contrôles 320/390/834/1200/1440/1728 |
| `fixtures` | Contenu normal et contenu long au minimum; cas sans image et compte de cartes ≠ colonnes montrés |
| `orphanRowDecision` | OBLIGATOIRE — sort du 3 colonnes aux largeurs intermédiaires (ligne 2+1), tranché par l'owner sur maquettes |
| `cardExtentDecision` | OBLIGATOIRE — adaptation interne seule OU états explicites, sur preuve que l'interne ne suffit pas |
| `addedStatesJustification` | Une justification PAR état/variante ajouté; aucune combinaison sans usage ni décision owner |
| `desktopPreservation` | Rendu approuvé des 4 combinaisons préservé, ou changement explicitement accepté et consigné |
| `primitiveBindings` | Une entrée par gap/padding/dimension modifiée |
| `typographyOverrides` | Zéro ou plus, bornées, `pending-responsive-text-style` |
| `columnsSettingStatement` | Énuméré `{2,3}` conservé, intitulé desktop, mobile = 1 carte/ligne sans réglage |
| `childDecisions` | Enfants partagés hors carte inchangés; besoins inventoriés et différés |
| `workFrameRefs` | Captures et node ids des options présentées |
| `tradeoffs` | Compromis, limites et sujets différés visibles |
| `decisionMaker` / `decidedAt` | Owner et date explicites |

## Behavior contract

- Mobile: une carte par ligne, aucun réglage de colonnes exposé; texte entièrement
  visible, la carte grandit au lieu de couper; lisibilité du texte sur photo
  vérifiée explicitement pour le style superposé.
- Desktop: l'énuméré `{2,3}` pilote le nombre de cartes par ligne; les cartes d'une
  même ligne restent cohérentes entre elles avec contenu long.
- Wide: comportement montré et accepté; aucun variant nommé d'après une largeur.
- La sélection d'état est explicite dans Figma Design; aucun breakpoint automatique
  n'est revendiqué.

## Primitive binding contract

Chaque entrée fournit `behaviorId`, `nodeIdOrPath`, `figmaProperty`, `variableId`,
`variableName`, `resolvedValue`, `sourceCollection`, `evidenceRef`. La variable
doit préexister à 029 et être compatible avec la propriété. Une primitive absente
rend H2 `blocked`; elle n'autorise ni literal ni création de variable.

## Temporary typography contract

Chaque entrée conserve famille, poids, contenu et rôle métier; `fields` ⊆
{`fontSize`, `lineHeight`, `textAlignHorizontal`}; statut
`pending-responsive-text-style`; inventoriée avec son comportement et sa décision
owner. Aucun Text Style global créé, modifié, publié ou « validé ».

## Refusals

H2 est `blocked` — jamais approximé — si: l'orphanRowDecision ou la
cardExtentDecision manque; une primitive nécessaire n'existe pas; une option est
présentée comme déjà appliquée; un état ajouté n'a pas sa justification propre;
un enfant partagé hors carte serait modifié.
