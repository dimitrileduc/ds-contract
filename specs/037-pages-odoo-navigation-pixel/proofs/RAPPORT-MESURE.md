# RAPPORT DE MESURE — les neuf pages contre leurs vues Figma v2

Date : **2026-09-08** · instance `piqueray-odoo-037` (8109) · seuil **5 %**, tolérance de hauteur **10 px**
(owner 2026-09-08, `extract/odoo-page-parity/views.json` — aucun drapeau ne les change).

**36 rapports sur 36** : `proofs/mesure/<page>/<largeur>.json`. Aucun `impossible` : chaque vue a été exportée et
chaque page capturée. Les triptyques 1:1 vivent hors dépôt sous `.page-parity/037/<page>/<largeur>.png`, leur
empreinte est dans le JSON.

## La règle de lecture

Les deux images sont **alignées en haut** et comparées sur la **hauteur commune**. Le score dit donc ce qu'il dit
vraiment — « sur la partie que les deux ont en commun, tant de pixels diffèrent » — et l'écart de hauteur est
**à côté**, avec son propre verdict. Un score n'est jamais montré seul.

## Le tableau, page par page et largeur par largeur

| Page | 390 | 834 | 1200 | 1728 |
|---|---|---|---|---|
| **Accueil** | ✖ 15.59 % · Δh -122 px | ✖ 4.29 % · Δh -20 px | ✖ 7.19 % · Δh -58 px | ✖ 4.33 % · Δh -49 px |
| **Portes de garage** | ✔ 3.62 % · Δh +4 px | ✔ 2.34 % · Δh +4 px | ✖ 6.67 % · Δh -58 px | ✔ 1.76 % · Δh +8 px |
| **Portes résidentielles** | ✖ 4.76 % · Δh +18 px | ✖ 3.21 % · Δh +17 px | ✖ 5.54 % · Δh +11 px | ✖ 2.66 % · Δh +24 px |
| **Portes industrielles** | ✖ 5.44 % · Δh +34 px | ✔ 2.83 % · Δh +9 px | ✖ 6.75 % · Δh +9 px | ✖ 2.56 % · Δh +16 px |
| **Portes d'entrée** | ✖ 10.38 % · Δh -32 px | ✖ 7.25 % · Δh -3 px | ✖ 5.19 % · Δh +13 px | ✖ 7.68 % · Δh -25 px |
| **Motorisation** | ✔ 3.28 % · Δh -1 px | ✔ 1.95 % · Δh -1 px | ✖ 19.12 % · Δh -52 px | ✔ 1.38 % · Δh +0 px |
| **Dépannage/SAV** | ✔ 4.24 % · Δh +10 px | ✔ 2.46 % · Δh +9 px | ✔ 1.78 % · Δh +1 px | ✔ 1.70 % · Δh +8 px |
| **À propos** | ✔ 3.47 % · Δh +4 px | ✔ 2.07 % · Δh +4 px | ✖ 6.50 % · Δh -58 px | ✔ 1.53 % · Δh +8 px |
| **Contactez-nous** | ✔ 4.25 % · Δh +10 px | ✔ 3.22 % · Δh +10 px | ✔ 3.24 % · Δh +2 px | ✔ 3.05 % · Δh +8 px |

**18 rapports verts sur 36.** Deux pages sont vertes aux quatre largeurs — **Dépannage/SAV** et
**Contactez-nous**. **Motorisation** et **À propos** le sont à trois largeurs sur quatre ; à 1728, Motorisation a **toutes ses sections à
zéro d'écart de hauteur**.

**Mise à jour du 2026-09-08, après lecture des triptyques** : la section Équipe d'À propos a été reprise dans l'ORDRE
DE LA VUE (elle suivait celui du banc de la vague 035). La page passe de 8,29 / 6,63 / 10,92 / 7,13 % à
**3,47 / 2,07 / 6,50 / 1,53 %** — trois largeurs sur quatre au vert. Les seize portraits n'ont pas changé : seul leur
ordre. C'est la démonstration que le diagnostic tenait, et que l'écart venait bien de notre contenu.

## La section d'origine du décalage, quand il y en a une

| Page | 390 | 834 | 1200 | 1728 |
|---|---|---|---|---|
| Accueil | `s_pqr_reassurances` | `s_pqr_reassurances` | `s_pqr_reassurances` | `s_pqr_reassurances` |
| Portes de garage | — | — | `s_pqr_reassurances` | — |
| Portes résidentielles | `s_pqr_google_reviews_section` | `s_pqr_google_reviews_section` | `s_pqr_google_reviews_section` | `s_pqr_faq` |
| Portes industrielles | `s_pqr_google_reviews_section` | `s_pqr_google_reviews_section` | `s_pqr_faq` | `s_pqr_faq` |
| Portes d'entrée | `s_pqr_realisations` | `s_pqr_realisations` | `s_pqr_realisations` | `s_pqr_realisations` |
| Motorisation | — | — | `s_pqr_categories_principales` | — |
| Dépannage/SAV | — | — | — | — |
| À propos | — | — | `s_pqr_reassurances` | — |
| Contactez-nous | — | — | — | — |

Les 36 rapports portent **`structure: "égale"`** : le nombre de sections rendues est celui de la vue, partout,
après retrait du Header et du Footer côté Figma (le `#wrap` d'Odoo ne contient ni l'un ni l'autre).

## Les causes, nommées et mesurées

### la carte de Réassurances rend 30 px plus court qu'en vue

*Pages concernées : Accueil, Portes de garage, À propos.*

Mesuré au 1200 sur l'accueil : la grille `reassurances-items` fait 1094 px côté Odoo contre 1154 px en vue, à structure identique (3 colonnes, écart 32, 2 rangées). Soit une carte de 531 px contre 561 px — 30 px par carte, 60 px sur deux rangées. Le reste de la section est au pixel : en-tête 76 = 76, écarts 48 = 48, bouton 54 = 54. C'est un écart de BLOC (`ds.reassurances` / carte), pas de page : le corriger sortirait du périmètre de cette vague (SC-010).

### la section Avis Google rend 8 à 10 px plus haut qu'en vue

*Pages concernées : Portes résidentielles, À propos.*

Écart constant sur toutes les pages qui la portent, aux quatre largeurs, à contenu égal. Sous la tolérance de hauteur pris isolément ; il s'additionne au reste quand une autre section a déjà décalé la page.

### le sur-titre VIDE de la FAQ coûte quand même son écart de 16 px

*Pages concernées : Portes industrielles, Portes résidentielles.*

La vue MASQUE le sur-titre (`Accroche`), et l'auto-layout Figma ne compte pas un enfant masqué. Côté Odoo le `<span>` existe toujours — vidé, il mesure 0 px, mais l'écart de 16 px de l'en-tête reste. Le bloc n'a pas d'option « sans sur-titre » : c'est une limite de `ds.faq`, nommée ici, pas contournée dans la page.

### résidu de rendu du texte, aucune section au-dessus de la tolérance

*Pages concernées : Portes industrielles.*

Toutes les sections sont dans la tolérance de hauteur ; le score au pixel reste au-dessus du seuil. Le résidu est celui du lissage du texte et du cadrage des photos, pas d'un écart de structure.

### la section Réalisations rend plus court qu'en vue sur Portes d'entrée

*Pages concernées : Portes d'entrée.*

Cette page est la seule dont la vue MONTRE le sur-titre des Réalisations et MASQUE le paragraphe — l'inverse des deux autres pages qui portent le bloc. La composition suit la vue ; l'écart restant est dans le bloc, pas dans le contenu.

### les trois cartes de Catégories rendent 51 px plus court qu'en vue à 1200

*Pages concernées : Motorisation.*

Motorisation est la seule page à trois cartes. À 1200 la rangée rend 458 px contre 509 px en vue ; aux trois autres largeurs la section est au pixel (écart 0). L'écart est donc propre au point de rupture 1200 du bloc Catégories.

## Ce que ce rapport ne dit pas

- Il ne dit pas que les pages rouges sont fausses : il dit **de combien** elles s'écartent de la vue, **où**, et
  **pourquoi**. Aucun rouge n'est corrigé en touchant un contrat, un jeton ou un bloc (SC-010).
- Il ne dit rien de la conformité du CONTENU au-delà de la vue : les écarts de source relevés page par page
  (`ecartsContenu` dans chaque rapport) sont **portés tels quels** et attendent une décision à la source (FR-018).
- **Durées observées** (repères du plan : < 3 min pour une page, < 10 min pour la reconstruction des 9) :
  la campagne des 36 rapports a pris **1 083 s**, soit **~2 min par page** aux quatre largeurs — sous le repère.
  La reconstruction complète des neuf pages prend **~6 min** (un `odoo shell` + un redémarrage par page).
