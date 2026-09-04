# Audit de source — set `ProduitsECommerce` (2694:21337), avant le round section

**Date** : 2026-09-04. **Méthode** : relevé du canevas vif, 4 variantes, tous niveaux, lecture seule.
**But** : sortir TOUS les gestes Figma nécessaires MAINTENANT, pour n'avoir aucun aller-retour
pendant l'écriture du contrat et la projection Odoo.

## Pourquoi cette section, et pourquoi maintenant

`ds.produits-ecommerce` est la **seule des huit sections de la home sans round 031**. Son contrat
1.0.0 est resté ancré sur l'ANCIEN master DS `2116:4475` (1 variante, `dumpedAt` 2026-08-23), alors
que le set 031 `2694:21337` existe avec ses **4 variantes** et son axe `Presentation`. Le dump et une
proposition d'extraction avaient même été produits, puis abandonnés : aucun journal, aucun contrat,
aucune feuille Odoo.

Conséquence mesurée le 2026-09-04 sur la home du pilote : cartes figées à 364 px à toutes les
largeurs, section 64 à 104 px trop haute, et **débordement horizontal du document** (657 px de large
pour un écran de 390). Scores de la section : **26,8 % · 25,8 % · 14,8 % · 11,1 %** — de loin le pire
de la page, toutes les autres sections étant entre 0,4 et 4,8 % hors SAV et Réassurances.

## Ce qui est propre

- **Zéro géométrie brute** hors deux valeurs (voir A3). Gouttières et écarts tous liés.
- **Une seule liste de produits par variante** — la « double collection » lue dans l'ancienne
  proposition d'extraction était un artefact du dump PRÉ-nettoyage, pas un défaut du set actuel.
- Les cartes sont de vraies **instances** d'un même maître dans les 4 variantes.
- Typographie du titre sur les jetons `typography.h2.*`, couleurs sur les jetons du système.

## A — Défauts de source à corriger (gestes Figma)

| # | Fait relevé | Vues | Geste |
|---|---|---|---|
| A1 | **Deux maîtres pour la même carte.** Le set 031 instancie `ProductCard` **2693:21081** (page 031, 50 usages vivants) ; le contrat `ds.product-card` 2.0.0 est ancré sur `ProductCard` **2068:1972** (page DS · Molécules, 12 usages vivants sur les pages `Pages`). Même nom, même taille 364×312, mêmes props TEXT ; seule diffère la largeur des textes (319 vs 364 — le 031 les passe en FILL). | les 4 | **Décision owner** : re-ancrer `ds.product-card` sur le maître 031 (patron déjà appliqué à ReviewCard, CarteCategorie, CarteReassurance dans cette vague, bump MAJEUR) — ou fusionner les deux maîtres. Sans ce geste, l'extraction invente un second contrat `ds.product-card-2`. |
| A2 | **Enfants gouvernés détachés hors Wide.** `Bouton` et `CarouselControls` sont des INSTANCES en Wide, des **cadres copiés** en Mobile, Tablette et Desktop. | Mobile, Tablette, Desktop | re-lier en instances (`Bouton/Style=Outline noir`, `CarouselControls`), en répliquant sizing et surcharges |
| A3 | **Deux valeurs brutes** : `Bouton — conteneur` porte `paddingLeft` / `paddingRight` = 24 non liés. | Mobile | lier à `space/24` |

## B — Faits relevés, NON défauts, à porter tels quels

| Fait | Mobile | Tablette | Desktop | Wide |
|---|---|---|---|---|
| Forme de l'en-tête | titre seul (colonne) | titre seul (colonne) | **titre + bouton sur une ligne** | idem |
| Bouton | pleine largeur, **en pied** | pleine largeur, en pied | dans l'en-tête, au contenu | idem |
| Contrôles du carrousel | **masqués** | **masqués** | visibles, alignés à droite sous la piste | idem |
| Gouttière de section | 24 | 48 | 48 | 89 |
| Écart de section | 32 | 32 | 48 | 48 |
| Cartes dessinées | 4 | 4 | 4 | **5** |
| Largeur de carte | 260 | 322 | 326 | 363 |
| Écart entre cartes | 16 | 16 | 16 | **24** |
| Piste (`Produits`) | FILL 366 | FILL 738 | **HUG 1352** | **HUG 1911** |
| Cadre de carrousel | rogne, padding gauche 24 | rogne, padding 48 | rogne, padding gauche 48 | rogne, padding gauche 89 |

Lecture : sous 992 la piste tient dans le cadre (les cartes rétrécissent) ; au-delà elle est libre et
**déborde volontairement** du cadre rognant — c'est le carrousel. Les cartes visibles sont donc
1 · 2 · 4 · 5.

## C — Décisions owner

**C1 — Contrôles du carrousel.** Masqués en Mobile/Tablette, visibles en Desktop/Wide, et inertes
partout côté site (aucun mécanisme).
→ **Réponse owner 2026-09-04** : « c'est voulu ; en mobile et tablette ce sera du glissement au doigt
plus tard, pas maintenant. » Donc : présence par écran portée au contrat, **mécanisme différé** —
ni contrôles actifs ni glissement dans ce round, écart nommé.

**C2 — Maître de carte (A1).** Re-ancrer `ds.product-card` sur le maître 031, ou fusionner ?
→ **à trancher avant l'extraction.** Recommandation : re-ancrer, c'est le patron des trois autres
molécules de la vague, et le maître DS n'a que 12 usages, tous sur des pages secondaires non encore
passées en 031.

## D — Conséquences déjà connues pour le contrat et Odoo

- L'en-tête change de FORME selon l'écran (colonne → rangée) : `layoutByProp` sur l'axe, et le bouton
  existe à deux endroits (pied en Mobile/Tablette, en-tête en Desktop/Wide) → deux parts avec
  `visibleWhen`, comme le double bouton du menu mobile.
- La largeur de carte par écran ne peut pas vivre sur la part instance (aucun canal par mode sur une
  instance) : elle passe par un jeton responsive de largeur de carte, comme
  `spacing.carte-reassurance.*` l'a fait pour la carte de réassurance.
- Le rognage du cadre est déjà posé côté Odoo, en zone manuelle minimale
  (`responsive/produits-ecommerce.pqr.css`, `ODOO-031-PRODUITS-CARROUSEL-CLIP`, 2026-09-04) : à
  absorber dans la feuille responsive complète de la section lors du round.
- Le bloc Odoo a reçu le contrat de DOM des collections gouvernées le 2026-09-04
  (`ODOO-031-PRODUITS-COLLECTION`) : les 4 cartes sont remplissables et leurs images éditables.
- La **cinquième carte en Wide** n'existe ni dans le bloc (4 en dur) ni dans le descripteur : à
  ajouter au round.
