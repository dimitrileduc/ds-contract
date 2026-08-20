# Audit US1a — Copies locales de carte-catégorie (T008)

**Date** : 2026-08-20 · **Méthode** : §VIII — recensement **PAR POSITION** (lecture seule).

## Résultat : 3 copies locales, toutes À L'INTÉRIEUR des variantes du master section

Aucune carte-catégorie détachée sur la page comme nœud de premier niveau (`carteHits: 0`). Les
copies locales vivent **dans les 4 variantes** du master `CategoriesPrincipales` (`2115:4277`) :
comme les 7 usages sont des **instances** de ce master, ces copies **se propagent** dans les usages.

| # | node copie | Style | Master hôte (variante) | Structure | Nature |
|---|---|---|---|---|---|
| 1 | `2115:4160` (« item ») | superposé | `2115:4273` `Disposition=Standard` | Décor (vecteur absolu) + wrapper > inner > [BlocTexte + **ArrowRight**] ; photo en **fill** du frame | **FRAME détachée** (pas une instance) |
| 2 | `2115:4168` (« item ») | superposé | `2115:4273` `Disposition=Standard` | idem #1 (« Item2Decor / Item2Wrapper / Item2Inner ») | **FRAME détachée** |
| 3 | `2115:4245` (« item ») | empilé (Rdv) | `2115:4276` `Disposition=PleineLargeurRdv` | img + wrapper > Bloc texte + **Bouton** (`Style=Outline noir`, `28:114`) | **FRAME détachée** |

## Deux faits qui décident du modèle cible

1. **Le style SUPERPOSÉ n'existe qu'en copies locales** — il n'a **aucun composant gouverné**.
   Les copies #1 et #2 sont les **seules** définitions du style. Le master `Standard` les contient
   en dur. → À l'extraction, le style `Superpose` de la molécule est **officialisé À PARTIR de ces
   copies** (T014 : plan photo `position:absolute` + contenu `relative` + flèche = icône
   `arrow-right` du registre) — le pixel est préservé **par construction**.

2. **La copie « Rdv » (#3) est un doublon de la carte empilée** avec un seul écart réel : le
   **Bouton** est `Style=Outline noir` et le libellé est **« Prendre rendez-vous »** (au lieu du
   lien « Contactez-nous » de la carte gouvernée voisine `2115:4244`). La carte « Maintenance » est
   par ailleurs **grisée** dans le rendu. → À décider au Gate A : re-modeler en **instance empilée
   renseignée** (CTA « Prendre rendez-vous ») ; le **grisé** et le **bouton Outline noir** sont un
   écart d'apparence à trancher (préserver le pixel, ou re-caler sur le bouton lien de la molécule).

## Objectif de réparation (FR-010)

Après réparation : **zéro copie locale**. Les copies #1/#2 deviennent le style `Superpose` gouverné ;
la copie #3 devient une instance `Empile` renseignée. Chaque décision par copie est portée au
**Gate A** ([../gates/gate-a-modele-cible.json](../gates/gate-a-modele-cible.json)), et le résultat
pixel est prouvé au **Gate B**.
