# Audit — Molécule Copyright (T059)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — repéré comme sibling direct de `Row`
(Footer-column) dans `Footer`, lors de la capture spot-check de Footer-column.
**Inspiration structurelle (recherche legacy déléguée à un agent en arrière-plan)** :
**aucun bon précédent** dans les 51 contrats legacy — dit explicitement par l'agent
plutôt que d'étirer une analogie faible (les candidats les plus proches,
`breadcrumb-item`/`chat-message-metadata`, ne correspondent pas). Confirmé à l'audit
live : la molécule réelle est encore plus simple que prévu — une seule chaîne de
texte plate, aucun lien réellement interactif (pas de soulignement sur CGV/Politique
de confidentialité), pas de slot de liens séparés.

## Usage — localisation (9 des 9 maquettes)

**9 occurrences, les 9 maquettes** : sibling de `Row` dans `Footer`, sous le séparateur
horizontal. Contenu strictement identique sur les 9 pages (vérifié).

## Structure

Une seule `TEXT` : `Montserrat Regular 14`, `lineHeight` PIXELS 24, couleur blanc
littéral non lié (`{r:1,g:1,b:1}`, comme le texte de Footer-column), aucun
soulignement, `textAlignHorizontal: LEFT`.

**Détail trouvé par lecture `charCodeAt`** (leçon Footer-column appliquée
immédiatement) : le caractère entre « © » et « 2025 » est un **espace insécable
`U+00A0`**, pas un espace ordinaire — reproduit à l'identique.

## Piège Figma (récurrent, anticipé) — GROUP sans origine stable

`Copyright` vit dans le `GROUP` « Footer », sibling de `Background` (rectangle),
`Separator` (ligne) et `Row` (Footer-column). Technique lecture-tout/écriture-tout
appliquée d'emblée sur les 4 siblings — `maxErr: 0` en 1 passe, sur les 9 pages,
comme Footer-column.

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Copyright` |
| Variants | aucun |
| Propriétés | `Texte` (TEXTE) |
| Page | `DS · Molécules` |
| nodeId | `2086:2330` |

**Preuve** : pixel-diff sur la maquette pilote (`Motorisation`) — résidu
1680px/(1728×3334)=0,029%, bruit habituel (texte visuellement identique, même
police/taille/couleur/position). 8 pages restantes : positions vérifiées
convergées exactement (`maxErr: 0`), contenu identique vérifié avant remplacement
— pas de preuve pixel avant/après formelle sur ces 8, même limite documentée que
les molécules précédentes.
