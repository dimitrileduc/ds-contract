# Audit — Molécule Member-card (T049)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — recherche par nom (`member`/`membre`/`équipe`),
confirmée structurellement.
**Inspiration structurelle (recherche legacy déléguée à un agent en arrière-plan)** :
`card.contract.json` (l'avatar comme `component: {id:"ds.avatar"}` **fixe**, pas un
slot — un ancrage d'identité toujours peuplé ne se modélise pas en swappable) +
`list-item.contract.json`/`typeahead-item.contract.json` (empilement label gras +
description couleur secondaire) pour le nom/rôle. Zéro précédent legacy pour la
photo elle-même (grep-vérifié sur les 51, même constat que Product-card).

## Usage — localisation (1 des 9 maquettes)

**16 occurrences, 1 maquette** : `À Propos`, grille « Équipe » (4×4). Layer name
`member`, enfants `member-picture` (instance) + `text` (frame).

## Trouvaille — la photo est déjà un vrai composant gouverné

`member-picture` (`274:2388`/`274:2390`) est un **COMPONENT_SET existant**, 2
variantes (`Default`/`hover` — état d'interaction web, jamais utilisé autrement que
`Default` sur les 16 occurrences). Réutilisé tel quel comme instance imbriquée, pas
reconstruit — même logique que le Bouton pour Carte/Product-card.

**Propreté de source notée, pas corrigée** : chaque `member-picture` contient 2
rectangles empilés à la même position — `normal` (la vraie photo, au-dessus, visible
au rendu) et `fun-ia` (un essai de génération IA abandonné, caché dessous,
`visible:true` mais totalement occulté). Reproduit automatiquement en instanciant le
composant existant — aucune action requise, le calque mort ne pèse pas sur le pixel.

## Structure

| Partie | Détail |
|---|---|
| Racine `member` | `VERTICAL`, `itemSpacing` 16, `layoutSizingHorizontal: FILL`, `primaryAxisSizingMode: AUTO` (hug), **`counterAxisAlignItems: CENTER`** (déjà correcte dès la 1re construction — leçon Product-card appliquée d'emblée) |
| `member-picture` | instance existante, 364×364, `cornerRadius` 500 (cercle plein) |
| `text` | `VERTICAL`, `itemSpacing` 8, hug les deux axes, `counterAxisAlignItems: CENTER` (centrage par bloc-hug, pas par `textAlignHorizontal`) |
| `Nom` | Montserrat **Regular 32**, `lineHeight` PIXELS 40, couleur `color/noir-bleute` (`VariableID:5:40`) |
| `Poste` | Montserrat **SemiBold 16**, `lineHeight` PIXELS 20, couleur **orange accent** (`VariableID:4:28`) — différente du texte gris habituel |

## Contenu — trous de source réels, reproduits pas comblés

13 membres réels + **3 occurrences placeholder** (`Prénom`/`Poste`, texte littéral,
photos réelles mais anonymisées côté nom) — un vrai manque dans la source (recrutement
en cours ?), reproduit tel quel, jamais inventé.

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Member-card` |
| Variants | aucun |
| Propriétés | `Nom` (TEXTE), `Poste` (TEXTE) |
| Dépendances | `member-picture` (composant existant, `Property 1=Default`) |
| Page | `DS · Molécules` |
| nodeId | `2074:2072` |

**Preuve** : pixel-diff complet sur les 16/16 occurrences (seule maquette concernée),
résidu 4163px/(1728×5928)=0,041% — bruit habituel, aucune anomalie par occurrence
(vérifié visuellement sur la grille complète, pas juste le pilote). Premier master de
cette spec sans écart réel à corriger après le pilote — la grille d'audit (centrage
via `counterAxisAlignItems`, `.visible`, `effects`, `textAlignHorizontal`) commence à
converger.
