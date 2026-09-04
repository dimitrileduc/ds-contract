# Journal — Home de démonstration : mise en page de page + contenu aligné sur les 4 vues 031

**Date** : 2026-09-04. **Décision owner** : « Figma 031 fait foi ».
**Instance** : pilote jetable `piqueray-odoo-pilote`, port 8087. **Aucun contrat de section modifié.**

## Le relevé qui déclenche tout

Les quatre vues home de la page `031 · Planches de validation` (mobile `2617:55170`, tablette
`2674:14994`, desktop `2647:6734`, wide `2624:57624`) :

| Vue | Conteneur | Sections |
|---|---|---|
| 390 | gap **80**, padding **0** | 9, toutes x 0 et pleine largeur ; padding intérieur 24 |
| 834 | gap **80**, padding **0** | idem ; padding intérieur 48 |
| 1200 | gap **128**, padding **0** | idem ; padding intérieur 56 |
| 1728 | gap **192**, padding **0** | idem ; padding intérieur 89 |

Exceptions dessinées : `ProduitsECommerce` et `Devis` à padding 0 (bord à bord) ;
`Presentation` bornée à 1287 et centrée en wide.

## 1. Renversement du modèle de mise en page

La zone `ODOO-024-PAGE-LAYOUT` d'`odoo-bridge.css` (2026-08-23, tinyspec `odoo-page-gutter-gap.md`)
posait la gouttière **sur le conteneur** : content-grid à trois colonnes, 89 px de chaque côté,
`row-gap` fixe de 128. C'était juste à l'époque — les sections étaient pleine largeur sans padding
et Figma portait le 89 sur un cadre `Container` non gouverné (`2496:7189`).

La vague 031 a mis la gouttière **dans chaque contrat** (`padding-inline` 24 · 48 · 56 · 89) sans
que la page suive. Les deux se cumulaient. Mesuré sur le pilote avant correction :

- colonne de contenu à **212 px** pour un écran de 390 (89 + 89 de page, plus 24 de section) ;
- écart vertical **128 partout** au lieu de 80 · 80 · 128 · 192 ;
- page servie ne portant plus que **2 classes `s_pqr_bleed` sur 6** — HTML figé, composé avant
  les derniers changements du descripteur.

**Corrigé** : le conteneur ne porte plus qu'une colonne (`minmax(0, 1fr)`), un `row-gap` et un
`padding-bottom` responsives 80 · 80 · 128 · 192, et plus aucune gouttière. `grid-column: content`
et `.s_pqr_bleed { grid-column: full }` supprimés. `s_pqr_bleed` retiré des **8 descripteurs**
(13 occurrences) : sans gouttière de page, la pleine largeur est le défaut.

Jetons mintés from-dump : `space.80` et `space.192` (relevés sur l'`itemSpacing` des conteneurs),
côté `tokens/` **et** côté Figma (collection Primitives), l'axe des jetons reste fermé.

Documentation datée, pas effacée : `integrations/odoo/authoring/README.md` § « Layout de page »
(l'ancienne règle « ne jamais cuire le gutter dans un contrat » passe en bloc dépliable historique)
et le pointeur de `CLAUDE.md`.

## 2. Contenu du descripteur aligné sur les vues

`integrations/odoo/authoring/pages/home.json` — 7 → **8 sections**.

| Section | Écart trouvé | Traitement |
|---|---|---|
| Produits e-commerce | **absente** du descripteur, présente dans les 4 vues entre SAV et Devis | ajoutée ; titre, 4 produits et prix venaient déjà du bloc, seuls les **4 visuels** manquaient |
| Réassurances | contenu **entièrement différent** (Conseil personnalisé, Produits de qualité, Peinture, SAV, Expérience) | aligné : sur-titre « Plus de 50 ans d'expérience », titre « Pourquoi choisir nos portes de garage industrielles ? », 5 cartes des vues |
| Avis Google | sur-titre, note et volume absents ; auteurs en graphie longue | sur-titre « Nos avis Google vérifiés », note 4.8, volume 93 avis, auteurs en graphie des vues (p. syster, P. Nicole, A. Bukhari, T. Picard, m. martinez) |
| Hero, Catégories, Présentation, SAV, Devis | conformes | inchangés |

**Images produit** : les quatre photos ont été récupérées par leurs octets d'origine
(`getImageByHash` puis `getBytesAsync` — l'`exportAsync` du nœud rendait 149 octets sur deux des
quatre, piège à retenir), redimensionnées à 480 px et déposées en `assets/produit1..4.png`.

**Limite d'instrument levée au passage.** `compose_page.fill_list` ne remplit que les collections
marquées `data-pqr-carte-list` ou `data-pqr-review-list`. Le bloc Produits n'en avait aucune : ses
cartes étaient un `t-foreach` nu et l'`<img>` n'avait pas de `src`. Le bloc reçoit donc le contrat
de DOM commun aux quatre autres collections gouvernées (`data-pqr-carte-list` + gabarit inerte
`template[data-pqr-carte-blueprint]` + parts `produit-image` / `produit-titre` / `produit-prix`),
et le composeur apprend la clé `prix`. Zone `ODOO-031-PRODUITS-COLLECTION`, classée
`odoo-repeat-dom`. Effet de bord bienvenu : la collection devient éditable comme les autres.

## 3. Défaut trouvé par la mesure : débordement horizontal

Première capture pleine page : le document faisait **657 px de large pour un écran de 390**. Cause :
quatre cartes produit de 364 px côte à côte. `ds.produits-ecommerce` 1.0.0 est la **seule section de
la home sans round 031** — pas d'axe `presentation`, pas de feuille par écran, cartes figées à 364.

Les vues montrent pourtant un carrousel qui **rogne** (`clipsContent: true`) aux quatre largeurs :

| Vue | Cartes | Écart | Visibles |
|---|---|---|---|
| 390 | 4 × 260 | 16 | 1 |
| 834 | 4 × 322 | 16 | 2 |
| 1200 | 4 × 326 | 16 | 4 |
| 1728 | **5** × 363 | 24 | 5 |

Porté ici, **et rien d'autre** : le rognage du cadre de carrousel
(`responsive/produits-ecommerce.pqr.css`, zone `ODOO-031-PRODUITS-CARROUSEL-CLIP`). Le document ne
déborde plus. **Non porté, à faire au round 031 de la section** : largeur de carte et écart par
écran, cinquième carte en wide, et le mécanisme du carrousel (les contrôles sont dans le DOM mais
restent inertes — limite déjà nommée avant ce jour).

## 4. Mesures

**Le rythme, par les nombres** (`.page-parity/probe-home.mts`) — c'est la mesure décisive :

| Écran | Écarts relevés | Attendu | Sections | x = 0 et pleine largeur |
|---|---|---|---|---|
| 390 | 80 partout | 80 | 8 | oui |
| 834 | 80 partout | 80 | 8 | oui |
| 1200 | 128 partout | 128 | 8 | oui |
| 1728 | 192 partout | 192 | 8 | oui, sauf `Presentation` à x 221 / 1287 — conforme aux vues |

Padding bas de page égal à l'écart de son écran, aux quatre largeurs.

**La page entière** (`.page-parity/home-mesure/triptyques/`), vue Figma contre capture Odoo :

| Écran | Hauteur Figma | Hauteur Odoo | Écart |
|---|---|---|---|
| 390 | 9135 | 9263 | +128 |
| 834 | 8256 | 8374 | +118 |
| 1200 | 6233 | 6267 | +34 |
| 1728 | 6460 | 6530 | +70 |

Le pourcentage global n'est **pas** rapporté comme un score : deux pages de hauteurs différentes se
décalent section après section, et le chiffre mesure ce décalage, pas la fidélité (leçon 017).
Lecture des triptyques : même page, même ordre, même contenu ; le résidu est le décalage vertical
cumulé et la section Produits non portée.

**Les blocs, par le pixel** : chaque section garde sa mesure de la vague 031 (0 à 3 %), aucun
contrat n'ayant bougé.

## Portes

`build` ✔ · `odoo:assets --check` ✔ · `odoo:module:check` ✔ · `odoo:authoring:check` ✔ ·
`odoo:inputs:check` re-piné ✔ · `parity` ✔ (« No new drift », cliché rafraîchi après création de
`space/80` et `space/192` côté Figma) · golden re-piné.
`odoo:derivation:check` ne cite plus que `ODOO-031-GOOGLE-REVIEWS-PANEL`, chantier d'une autre session.

## À trancher / reste ouvert

- **Round 031 de `ds.produits-ecommerce`** : la seule section de la home encore sans axe responsive.
- **Cinquième carte produit en wide** : dessinée dans la vue, absente du bloc (4 en dur).
- **Contrôles de carrousel inertes** : présents dans le DOM, sans mécanisme.
- **Décalage vertical cumulé** de 34 à 128 px selon l'écran : à imputer section par section si
  l'owner veut le fermer.
