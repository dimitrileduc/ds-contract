# Produits e-commerce — vague 031, de Figma à Odoo

**Date** : 2026-09-04 · **Contrats** : `ds.produits-ecommerce` 1.0.0 → **2.0.0**,
`ds.product-card` 2.x → **3.0.0**, `ds.carousel-controls` 1.0.2 → **1.1.0**
· **Set Figma** : `ProduitsECommerce` `2694:21337` (4 variantes)
· **Audit de source** : `produits-ecommerce-audit-source.md`

## Pourquoi ce round

C'était la **dernière section de la home restée hors de la vague**. Son contrat
tenait encore l'ancien master DS à une seule variante : les cartes étaient figées à
364 px à toutes les largeurs, et la page débordait horizontalement en mobile
(document 657 px pour une fenêtre de 390). Un rognage temporaire masquait le
symptôme ; ce round supprime la cause.

## Ce qui a été réparé à la source (§VIII)

| Défaut | Correction sur le canevas |
|---|---|
| `CarouselControls` master `2077:2191` en `SPACE_BETWEEN`, `itemSpacing` 0 | Alignement au début, écart 8 (104 → 112 px). **Dixième occurrence du défaut E-031-023** : l'alignement réparti annule silencieusement l'écart. Les 15 instances du fichier sont redevenues uniformes. |
| Le set n'exposait **aucune propriété TEXT** : le titre n'était qu'un texte dessiné | Propriété `Titre` (TEXT) posée sur le set, référencée par les quatre variantes. Le titre est maintenant une donnée liée. |

Deux versions nommées dans l'historique Figma, une par geste.

## Ce que le contrat porte maintenant

- **Axe `presentation`** à quatre valeurs, comme les autres sections de la vague.
- **Deux formes** : sous 992 le titre seul puis le bouton pleine largeur en pied,
  contrôles masqués ; au-delà titre et bouton sur une ligne, contrôles sous la piste.
- **Le titre remplit** (`layout.grow`) — c'est lui, et non un `justify`, qui pousse
  le bouton à droite en Wide. Le fait est porté UNE fois : sous 992 l'en-tête est une
  colonne de hauteur au contenu, où la croissance n'a aucun effet.
- **La piste** est bornée par le cadre sous 992 et libre au-delà : elle déborde
  volontairement du cadre rognant, c'est le carrousel.
- **Cinq cartes** en Wide, quatre ailleurs (le descripteur de page en fournit cinq ;
  la cinquième sort du cadre aux autres largeurs).

## Deux limites d'émetteur rencontrées, et ce qu'on en a fait

1. **Un jeton posé sur une part `component` n'est émis par AUCUN émetteur.** La
   largeur par écran (260 · 322 · 326 · 363) avait d'abord été écrite sur la part
   `ProductCard` de la section : zéro règle générée, silencieusement. Vérifié le
   2026-09-04. Elle est désormais sur la **racine de `ds.product-card`**, patron
   d'art antérieur du dépôt (`ds.avatar-group`), avec `min-width` en écho — la carte
   est dans une piste flex et le rétrécissement par défaut la ferait passer sous la
   largeur dessinée.
2. **`flex-shrink` n'est pas un canal `declared`** (refus du schéma). D'où le choix
   du `min-width` ci-dessus plutôt qu'un fait code-only.

## Le fait qui valait 20 px

Le titre de carte est **sur une ligne, tronqué** (`maxLines: 1`,
`textTruncation: ENDING` sur le master `2693:21081` **et** sur les quatre variantes).
Sans lui, un nom sur deux lignes ajoutait 20 px à la carte, donc à la piste, donc à
la section — à trois largeurs sur quatre. Porté par les canaux `declared`
`white-space` / `overflow-x` / `overflow-y` / `text-overflow` ; `text-overflow` est
**dessiné** sur le canevas, les autres y sont annotés.

## La leçon de la feuille responsive

Une première version de `responsive/produits-ecommerce.pqr.css` ne recopiait que les
bascules d'affichage, en supposant que les marges vivaient déjà dans la feuille
générée. **Faux** : la feuille générée porte ces règles sur des classes de
présentation (`--presentation-tablette`, …) qu'**Odoo ne pose jamais**. Mesurée, la
section rendait ses marges mobiles (24 px) aux quatre largeurs et gardait son
en-tête en colonne au-dessus de 992. Règle : **toute** règle portée par une classe
de présentation doit être recopiée en `@media`. Rien n'est « déjà là ».

## Mesures — bloc contre planche Figma, quatre largeurs

| Largeur | Hauteur planche → Odoo | Écart | Différence |
|---|---|---|---|
| 390 | 490 → 490 | +0 | **1,33 %** |
| 834 | 460 → 460 | +0 | **0,99 %** |
| 1200 | 490 → 490 | +0 | **0,83 %** |
| 1728 | 490 → 490 | +0 | **0,96 %** |

Boîtes intérieures vérifiées une à une contre le canevas : en-tête, titre, bouton,
piste, cadre rognant, contrôles et conteneur de pied tombent au pixel aux quatre
largeurs (relevé `.page-parity/probe-produits.mts`).

## Résidu nommé, non corrigé

Le bouton « précédent » est **gris (désactivé) sur la planche Figma** et **noir
(actif) chez nous**. Sur le canevas c'est une surcharge de couleur brute (`#E0E0E0`)
posée sur les instances de la section, pas un état gouverné : le master
`CarouselControls` porte un trait sombre, et **`ds.button` n'a aucun état
`disabled`** — ni état déclaré, ni variante `Etat` sur son master Figma. L'exprimer
proprement demande d'ajouter un axe d'état au bouton, à la source puis au contrat :
c'est un round à soi seul, pas un ajout de CSS. C'est la part visible du résidu de
~1 % mesuré ci-dessus. Le mécanisme du carrousel étant de toute façon **différé**
(décision owner 2026-09-04, glissement au doigt plus tard), les contrôles sont
inertes et l'état désactivé n'a pas encore de sens fonctionnel.

## Autres réparations emportées par ce round

Le dépôt était **rouge avant** (237/243 évaluations). Cinq cas cassés par les rounds
précédents ont été réparés au passage, aucun en abaissant une attente :

- `deterministic-roundtrip` : le mock ne semait aucune icône gouvernée et l'aller
  refusait sur `arrow-left` ; et la portée de l'émission React était figée à deux
  contrats alors que la section en compose quatre. Le semis reproduit la
  précondition, la portée lit `contracts/` en entier.
- `detect-figma-missing-nested-instance` : la sonde sabotait l'**ancien** ensemble
  « Avis Google », que la parité ne joint plus. Re-pointée sur le set ancré, par sa clé.
- `google-reviews-repeat-renders-sample-on-static-surfaces` : chemin d'anatomie écrit
  en dur, devenu un plantage `undefined.parts`. Remplacé par une recherche de la part
  qui répète.
- `odoo-authoring-coverage-refusal` : la fixture d'adresse invalide pinnait
  `ds.review-card@3.0.0`, devenu faux ; le refus sortait « version épinglée » au lieu
  de « chemin sans occurrence ». Re-pinnée à la version courante.
- `odoo-figma-links-governance` : quatre panneaux pinnaient des versions périmées et
  un `viaPart` renommé (`carte` → `ReviewCard`).

Un défaut du dépôt corrigé en chemin : les cinq entrées de `sample` de
`ds.google-reviews` omettaient trois clés du type de l'élément, et l'histoire générée
ne compilait pas (`tsc` rouge, à HEAD). Complétées → contrat **3.0.1**, quatre
miroirs de version propagés.

**Après : 243/243.**
