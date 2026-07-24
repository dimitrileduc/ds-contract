# Audit — Molécule Carte (T045/T051, fusion Category-card + Reassurance-item)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — signature structurelle (`item` + enfant `img`
avec fill IMAGE + enfant `text`), jamais par nom (leçon constitution : `item` couvre au
moins 3 molécules distinctes — Accordion-row, Category-card, Reassurance-item).
**Inspiration structurelle** : `git show demo-51:contracts/card.contract.json` (slot
`footer/actions` optionnel, `accepts: ["ds.button","ds.badge"]`, composition de
l'avatar via `component: {id:"ds.avatar"}`) — mais surtout `pagination.contract.json`
et `citation.contract.json` (un seul prop `variant`, `visibleWhen` posé sur des **parts
entières**, pas juste des tokens — le vrai précédent pour une anatomie qui change par
variante, pas `button.contract.json` qui ne change jamais d'anatomie).

## Découverte — un seul bloc, pas deux

L'inventaire initial (`dag.md`, scan T0) comptait Category-card à part et
Reassurance-item comme "non isolé à cette passe". Un audit live plus poussé a montré
que les deux vivent sous le **même nom de layer `item`**, avec la **même anatomie de
base** (`img` + `text`), et ne se distinguent que par la présence ou non d'un `Bouton`
enfant — un cas texte-book pour un slot optionnel plutôt que deux masters séparés.

**Comptage réel (scan complet des 9 maquettes, signature structurelle)** : **36**
occurrences, pas les 41 (« 3 formes ») du scan T0 — **26 sans CTA** (Réassurance,
correspond exactement au compte attendu de Reassurance-item) et **10 avec CTA**
(Catégorie).

## Largeur — contextuelle, pas une propriété du master

Hypothèse de l'owner vérifiée : `layoutSizingHorizontal` de la carte = `FILL` dans les
36 occurrences, sans exception. Le parent est une rangée `HORIZONTAL` à largeur fixe
divisée en N colonnes égales (5 col → 285px, 4 col → 364px, 3 col → 474px, 2 col →
743px, calcul au pixel près avec les gaps). **Aucune variante de taille codée** — le
master est juste FILL, le contexte fait le reste.

## Les 2 vraies dispositions (pas 3)

Un premier passage de regroupement par signature (CTA + ratio image) faisait
apparaître 3 buckets, à cause d'un artefact : l'image "sans CTA" a une **hauteur
fixe de 364px** peu importe la largeur — un ratio différent à 285 vs 364px n'est que
le même calcul (hauteur constante, largeur variable), pas une 3e forme.

| | Réassurance (sans CTA) | Catégorie (avec CTA) |
|---|---|---|
| Occurrences | 26 | 10 |
| Fill carte | blanc (`VariableID:4:29`) | aucun (transparent) |
| Ombre portée | `DROP_SHADOW` radius 10, `rgba(0,0,0,.2)`, offset (0,5) | aucune |
| Image | hauteur **fixe 364px**, largeur FILL | ratio **~16:9**, hauteur = espace restant (voir Piège Figma ci-dessous) |
| Titre | 24 Regular, casse normale, **centré** | 32 Medium, **MAJUSCULES**, aligné gauche |
| Texte | 14 Regular, couleur `VariableID:24:52` (plus clair), **centré** | 18, couleur `VariableID:5:40` (même que le titre), 1re phrase en **Bold** puis Regular, aligné gauche |
| Gaps | carte 24 / titre↔texte 8 | carte 32 / titre↔texte 16 |
| Padding texte | 16 gauche/droite | aucun |
| Bouton | absent | présent — instance réelle du master Bouton existant |
| Bordure | **aucune** (vérifié `strokes:[]` — pas de bordure malgré l'apparence de contour) | aucune |

## Piège Figma trouvé (bloquant, résolu)

`resize()` **et** `resizeWithoutConstraints()` sur un enfant hérité d'instance
(`img`) refusent de s'appliquer — testé sur 5 configurations différentes, y compris
une instance neuve jamais touchée, posée hors de tout contexte FILL. Confirmé : ce
n'est pas un effet de bord de l'auto-layout, c'est un blocage dur sur le geste
"redimensionner un enfant imbriqué" en post-hoc.

**Solution retenue** (rejette l'option "une variante par nombre de colonnes",
jugée à raison inélégante par l'owner) : `img.layoutSizingVertical = 'FILL'` (elle
absorbe l'espace restant dans la carte) + redimensionnement explicite de
**l'instance de haut niveau** (`inst.resize(w, h)` — ça, ça marche). Zéro variante
supplémentaire, s'adapte à n'importe quelle hauteur de texte réelle par occurrence.

## Bugs trouvés en comparant le pilote avant/après (page-parity, pas en survolant)

1. **Ombre portée manquante** — jamais vérifié `effects`, seulement `fills`/`strokes`.
2. **Icônes du bouton par défaut au lieu des vraies** — `Icône gauche/droite` (booléen
   visibilité) réglé, mais `Glyphe gauche/droite` (INSTANCE_SWAP, quel glyphe) jamais
   réappliqué → flèches génériques au lieu de pdf/download.
3. **Gras aplati** — `instance.setProperties()` sur une propriété TEXT remplace tout
   le texte par un style **uniforme**, perdant un span Bold existant. Doit être
   réappliqué (`setRangeFontName`) après chaque override de texte contenant un
   segment gras.
4. **Alignement centré manquant sur Réassurance** — jamais réglé, resté au défaut
   Figma `LEFT` alors que la source centre le titre et le texte.

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Carte` |
| Variants | `Disposition` (Réassurance / Catégorie) |
| Propriétés | `Titre` (TEXTE), `Texte` (TEXTE) |
| Dépendances | Bouton existant (`componentSetKey e6fa6786ed…`, instance réelle, seulement en Catégorie) |
| Page | `DS · Molécules` |
| nodeId | `2063:1622` |

**Limite de preuve documentée** (voir `decisions.md`) : preuve pixel `page-parity`
complète uniquement sur les 2 maquettes pilotes (Accueil, Motorisation). Les 7 autres
maquettes touchées par l'adoption batch n'ont pas de capture "avant" (mutées
directement) — vérifiées structurellement (0 erreur `analyze_component_set`,
dimensions/contenu conformes au ledger) et visuellement (captures spot-check), pas
par comparaison pixel avant/après.
