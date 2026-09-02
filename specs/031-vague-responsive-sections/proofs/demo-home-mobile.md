# Home mobile — maquette de démonstration au contenu réel

**Date** : 2026-08-27 · **Page** : `031 · Planches de validation`
**Section** : `031 · DEMO HOME MOBILE` · **Écran** : nœud `2617:55170`, 390 × 8168 px

Différence avec les quatre colonnes de contrôle : cette page n'assemble pas les
**masters** mais les **instances réelles de la maquette Accueil** (`210:326`) —
vrais titres, vrais textes, vraies photos, dans l'ordre exact de la page. Elle se
lit comme un téléphone, pas comme un catalogue.

**Aucun master n'a été touché.** Chaque bloc est une copie détachée récursivement.

---

## Composition, dans l'ordre de la page

| # | Bloc | Source (instance de la maquette) | Hauteur |
|---|---|---|---|
| 1 | header | `210:472` | 100 |
| 2 | hero vidéo | `2170:6351` | 420 |
| 3 | catégories | `2496:7189` | 924 |
| 4 | présentation | `2106:3000` | 602 |
| 5 | SAV | `2108:3135` | 1265 |
| 6 | produits e-commerce | `2116:4595` | 596 |
| 7 | devis | `2096:2705` | 279 |
| 8 | réassurances | `2115:3892` | 1449 |
| 9 | avis Google | `210:441` | 1706 |
| 10 | footer | `210:446` | 827 |

`header` et `footer` sont **hors périmètre de la vague** (décision owner du
2026-08-26) ; ils sont présents parce qu'une page d'accueil sans eux n'est pas une
page d'accueil, et traités comme le reste pour que la lecture soit juste.

---

## Quatre arbitrages de conception, pris et assumés

### 1. Réassurances — deux colonnes, photos en 4:3 · **2914 → 1449 px**

Cinq cartes photo + titre + texte empilées occupaient **plus du quart de la
page**. Passées à deux colonnes (largeur minimale de carte 155), photos en 4:3 au
lieu de carrées, titres de carte à 17 px pour qu'aucun mot ne se coupe
(« SAV & maintena/nce » se cassait à 20 px). La cinquième carte reste seule sur sa
ligne, à pleine largeur — elle referme la section proprement.

### 2. Produits — vrai carrousel horizontal · **1528 → 596 px**

Quatre fiches empilées verticalement n'ont pas de sens sur un téléphone : ce n'est
plus un carrousel, c'est une liste. Remis en **piste horizontale** : une fiche
visible à 300 px, la suivante **amorcée en bord d'écran** pour donner l'envie de
glisser, contrôles `‹ ›` replacés **sous** la carte et non sur la photo.

*Note : c'est le seul endroit où un débordement horizontal est **voulu**. La passe
« aucun enfant plus large que son parent » l'exclut explicitement.*

### 3. Catégories — voile de lisibilité

Le texte blanc de la deuxième carte (« Bienvenue chez vous ! ») était posé sur une
porte claire : illisible. Ajout d'un **dégradé noir vertical** (0 % en haut → 88 %
en bas) entre la photo et le texte.

**⚠️ Réserve, et elle compte** : c'est un **nœud nouveau**. Les trois autres
arbitrages sont de la mise en page et de la typographie — le runner sait les poser
sur les masters. **Celui-ci, non** : il exige une modification du master. Il sort
du périmètre de la vague et doit être traité comme une évolution de composant.

### 4. Footer — respiration entre les groupes

Deux défauts : un espaceur desktop de 121 px (réduit à 32) et surtout un
`primaryAxisAlignItems: SPACE_BETWEEN` qui **annulait silencieusement** l'écart
demandé — « 4860 Pepinster » touchait « Horaires ». Passé en `MIN` avec un écart
de 24 : les quatre groupes respirent.

---

## Résultat

**La page passe de 10 565 à 8 168 px — 23 % de défilement en moins**, sans rien
retirer du contenu.

---

## Ce que je n'ai PAS touché, et pourquoi

Trois remarques de la revue indépendante portent sur **le contenu de vos masters**,
pas sur la transposition mobile. Les corriger serait modifier votre design :

- les **deux boutons « Contactez-nous » identiques** empilés dans le formulaire ;
- le bloc **Équipe sans surtitre ni titre**, là où réassurances, coordonnées et FAQ
  en ont un ;
- les **trois fiches « Prénom / Poste »** non renseignées de l'équipe.

Elles sont remontées, elles ne sont pas décidées.
