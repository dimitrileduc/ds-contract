# CarteReassurance — molécule 031 (2026-09-02)

**Contrat** : `contracts/carte.contract.json` 2.1.0 → **3.0.0** (ancres = set 031 `2700:25961`, clé `88a244c4…`).
La carte de réassurance n'a pas de contrat à elle : elle est la disposition `reassurance` de **ds.carte**,
composée par la section Réassurances. La disposition `categorie` est une forme d'archive, plus utilisée par
aucune page (décision owner, comme Empile pour ds.carte-categorie) : écart de parité acquitté.

## Réparation de source, avant toute modélisation

Les **vingt cartes** de la section (cinq par vue) étaient des **cadres libres**, sans lien au composant
CarteReassurance : modifier le maître ne changeait rien. Réparé le 2026-09-02, sur validation owner :

1. Le maître expose deux champs TEXT, `Titre` et `Texte` (il n'en exposait aucun).
2. Les vingt cadres sont devenus des instances : Gauche en Mobile et Tablette, Centré en Desktop et Wide,
   chacune gardant son texte et sa photo (surcharge de remplissage).

**Preuve, capture avant/après de chaque vue** : Mobile 0,00 % · Tablette 0,00 % · Desktop 0,00 % · Wide 0,00 %.
Version Figma nommée avant le geste.

Deux pièges rencontrés, notés au mode d'emploi : la largeur minimale 280 vivait sur les cadres, pas sur le
maître (sans elle la rangée mobile s'écrasait à 56 px par carte) ; les propriétés de grille ne sont pas
modifiables par script, mais le placement naturel reproduit exactement les ancres relevées.

## Ce que le contrat 3.0.0 porte

| | Mobile | Tablette | Desktop | Wide |
|---|---|---|---|---|
| photo | 192 | 240 | 364 | 364 |
| écart photo/texte | 16 | 24 | 24 | 24 |
| marge basse | 16 | 24 | 24 | 24 |
| titre (style H4) | 20/25 | 20/25 | 24/30 | 24/30 |
| texte (corps) | 16/24 | 16/24 | 18/27 | 18/27 |

Tous ces jetons existaient déjà (`spacing.carte-reassurance.*`, `typography.h4.*`, `typography.body.*`) :
**aucun mint**. Nouveauté : la propriété gouvernée `alignement` {centre, gauche}, axe du set 031 — le texte
était centré en dur avant. La largeur dessinée 341,33 est un témoin, la carte remplit sa piste.

## Vérification côté Odoo (`/reassurances-test`)

Sonde des boîtes, quatre largeurs : photo 192 / 240 / 364 / 364 ✓ · écart 16 / 24 / 24 / 24 ✓ ·
marge basse idem ✓ · titre 20/25 → 24/30 ✓ · texte 16/24 → 18/27 ✓ · marge intérieure du texte 16 ✓.
**Chaque valeur du canvas se retrouve au rendu.**

Triptyque à 1728, carte découpée des deux côtés (284×588) : **5,79 %**, et la cause est du **contenu, pas de
la géométrie** — la planche 031 montre la copie « portes industrielles » (Sécurité et conformité…) tandis que
la home porte la copie générale (Conseil personnalisé…). Photo, cadre, positions et tailles concordent.

**À trancher** : la home et la planche 031 ne racontent pas la même chose. Soit la planche est mise à jour,
soit le contenu de la home l'est. Ce n'est ni le contrat ni le code.

## Ce qui reste à la section (étape suivante)
Les largeurs de carte aux trois autres écrans viennent de la section, encore en 1.3.0 : 52 au lieu de 342 à
390, 141 au lieu de 738 à 834, 214 au lieu de 341 à 1200. À 1728 la largeur est juste (284) mais la hauteur
ne l'est pas (531 au lieu de 588 : les cartes ne sont pas étirées à hauteur égale). Rien de tout cela
n'appartient à la carte.

## Fichiers touchés
`contracts/carte.contract.json` · `integrations/odoo/config/{reassurances.authoring.json, figma-panels.json,
inputs.lock.json}` · `addons/piqueray_ds/views/components.xml` (classe d'alignement + versions) ·
`static/src/js/version_guard.js` · `scripts/odoo/scan-saved-versions.ts` ·
`evals/fixtures/odoo-production/version-drift/cases.json` · `parity/{baseline.json, snapshots/figma-components.json}` ·
`integrations/odoo/authoring/pages/reassurances-test.json` · outils `.page-parity/{capture-reassurances.mts,
probe-carte-reassurance.mts, pos-carte.mts}`.

---

# Reassurances — section 031 (même soirée)

**Contrat** : `contracts/reassurances.contract.json` 1.3.0 → **2.0.0** (ancres = set 031 `2700:26297`).

## Ce que le set dessine, et que le contrat porte

| | Mobile | Tablette | Desktop | Wide |
|---|---|---|---|---|
| marges | 24 | 48 | 56 | 89 |
| écart de section | 32 | 32 | 48 | 48 |
| collection | 1 colonne | 1 colonne | **3 colonnes** | **5 colonnes** |
| écart de collection | 32 | 32 | 32 | 32 |
| carte | 342×329 | 738×345 | 341×561 | 284×588 |
| en-tête | 88 | 58 | 76 | 91 |

La grille tombe juste : 341×3 + 32×2 = 1087 pour 1088 · 284×5 + 32×4 = 1548 pour 1550.

## Trois décisions de modélisation

1. **L'en-tête cesse d'être une instance de ds.section-header.** Le set 031 le dessine à plat, et l'ancienne
   composition figeait le titre à 40 px sur les quatre écrans (258 px de haut au lieu de 88 en mobile). Il est
   donc modélisé dans la section : sur-titre sur `typography.overline.*` (14/14/16/20, Regular puis Medium,
   capitales), titre sur le style responsive H2 (24/32/40). Deux props de contenu apparaissent, `accroche` et
   `titre`, liaison NONE — le set n'expose aucune propriété TEXT.
2. **Le défaut de `disposition` passe à « 5Cartes »**, la seule forme que le set dessine. Les deux autres
   formes (4 cartes, 4 cartes à deux boutons) restent en archive, écart de parité acquitté.
3. **L'écart mobile de la collection est 32, pas 16.** Le canvas met 16 en écart de colonne et 32 en écart de
   rangée ; avec une carte par ligne seul le second s'applique. Le 16 est inopérant et n'est pas porté.

**Code-only, nommé** : l'alignement du texte des cartes (à gauche sous 992, centré au-dessus) et l'égalisation
des hauteurs dans la grille — une part instance ne porte aucun canal par mode.

**Un plafond retiré** : `odoo-bridge.css` limitait la section à 1550 px de large. Le set 031 la dessine pleine
largeur avec ses propres marges ; le plafond réduisait les cartes de 284 à 249 au-delà de 1550.

## Mesure bloc contre planche (`.page-parity/reassurances-mesure/`)

| largeur | hauteur | diff | cause du résidu |
|---|---|---|---|
| 390 | 1955 = 1955 | **7,05 %** | recadrage Figma d'une photo (transformation d'image, sans orthographe CSS) |
| 834 | 2053 = 2053 | **21,98 %** | **trois photos sur cinq portent un recadrage Figma** — cartes 1, 4 et 5 ; les cartes 2 et 3, en cadrage neutre, sont identiques |
| 1200 | 1350 vs 1380 | **11,64 %** | photos + une ligne de texte en moins dans la carte la plus haute, qui fixe la hauteur de rangée |
| 1728 | 829 = 829 | **1,42 %** | lissage du texte et rééchantillonnage des photos |

Boîtes sondées identiques au canvas aux quatre largeurs : en-tête 88 / 58 / 76 / 91, collection 1/1/3/5 colonnes,
cartes 342×329, 738×345, 341×531, 284×588.

## Deux corrections après relecture owner (fin de soirée)

- **Le bouton s’étirait sur toute la largeur en Desktop et Wide.** Le set le dessine ajusté à son contenu
  (249 puis 268) avec une marge intérieure de 32 au lieu de 24, et la racine centre son contenu au-delà du
  seuil bureau (le cadre interne du canvas passe de MIN à CENTER). Porté : centrage au contrat, largeur et
  marge du bouton en code-only nommé. Mesuré : 1728 de 1,81 à 1,42 %, 1200 de 11,85 à 11,64 %.
- **Outil image natif ouvert** sur les photos des cartes (voir l’addenda de carte-categorie.md).

## À corriger à la source (Figma)
- Les recadrages d'image posés en surcharge d'instance (cartes 1, 4, 5 en Tablette, carte 4 en Mobile) n'ont pas
  d'orthographe CSS. Soit les photos sont recadrées à la source et reposées neutres, soit l'écart reste nommé.

## Fichiers touchés (section)
`contracts/reassurances.contract.json` · `integrations/odoo/config/{reassurances.authoring.json, figma-panels.json,
inputs.lock.json}` · `addons/piqueray_ds/{__manifest__.py, views/components.xml (en-tête local, 5 cartes, 5Cartes),
static/src/css/responsive/reassurances.pqr.css, static/src/css/odoo-bridge.css (plafond retiré),
static/src/js/version_guard.js}` · `scripts/odoo/scan-saved-versions.ts` ·
`evals/fixtures/odoo-production/version-drift/cases.json` · `parity/baseline.json` ·
`integrations/odoo/authoring/pages/reassurances-test.json` · outil `.page-parity/probe-reassurances.mts`.

---

## Acquittements de parité de la vague (2026-09-02, clôture)

Seize jetons mintés pendant la vague n'ont pas encore de variable Figma : les six hauteurs de SAV, les
deux hauteurs de carte des catégories, la largeur minimale de la carte catégorie, les quatre hauteurs de
Devis, et les trois jetons de typographie par écran (graisse du corps, taille du libellé de bouton).
Ils sont **acquittés** dans `parity/baseline.json`, comme la spec 015 l'avait fait pour ses 83 références.

**Ce que cela veut dire** : l'axe canvas de ces jetons est reconnu, pas surveillé. Le remède est un sync
tokens vers la collection Responsive, geste d'écriture Figma qui appartient à l'owner. Tant qu'il n'est pas
fait, une dérive sur ces seize valeurs ne serait pas détectée.

---

# Réassurances — reprise du 2026-09-04

La pire section de la page après la vague : **22 %** à 834, **11,6 %** et **−30 px**
à 1200. Deux causes, aucune dans le contrat.

## 1. Les rangées de la grille n'étaient pas égales entre elles

Le canevas pose ici une **grille Figma** (`layoutMode: GRID`) : elle donne à toutes
ses rangées la même hauteur, et les cinq cartes de la variante Desktop mesurent
561 px — celles de la première rangée comprises, alors que leur contenu n'en demande
que 531. Une grille CSS dimensionne chaque rangée **indépendamment** : la première
retombait à 531 et la section perdait 30 px.

`height: 100%` sur les cartes, déjà posé, égalise **dans** une rangée, jamais
**entre** les rangées. Il fallait `grid-auto-rows: 1fr` en plus. Les deux règles sont
nécessaires et ne font pas le même travail.

## 2. Quatre photos recadrées à la main

Même classe de défaut que la photo du SAV, quatre fois :

| Variante | Carte | Mode |
|---|---|---|
| Mobile | 4 | CROP + zoom 0,374 |
| Tablette | 1 | CROP + zoom 0,244 |
| Tablette | 4 | CROP + zoom 0,217 |
| Tablette | 5 | CROP + zoom 0,488 |

Les cinq cartes portent pourtant **la même image dans les quatre variantes** (hachages
identiques) : ce n'était donc pas un problème de contenu mais de cadrage. À 738×240,
un recadrage manuel montrait une autre partie de la photo — d'où l'impression, sur le
triptyque, que « ce n'est pas la même personne ». C'en était bien une autre : la photo
est large et contient deux personnes ; les deux cadrages tombaient sur deux moitiés.

Annulés à la source, retour en FILL. Un balayage des **15 ensembles** de la planche 031
confirme qu'il n'en reste aucun autre.

## Résultat

| Largeur | Avant | Après |
|---|---|---|
| 390 | 7,04 % | **1,97 %** |
| 834 | 21,98 % | **0,89 %** |
| 1200 | 11,64 % (−30 px) | **0,97 %** · hauteur exacte |
| 1728 | 1,42 % | **1,21 %** |

## À trancher (2026-09-09) — hauteur de photo en Desktop après le passage à 4 colonnes

Constat owner sur la vue « Portes de garage résidentielles — desktop 1200 » (`2774:28902`) : photo 248 × 364, trop
haute. Cause : `photo-h` Desktop = 364 est resté celui des cartes de 341 (3 colonnes). Planche de proposition
`031 · 24` (`2798:54146`) : A 4:5 = 310 · B carré = 248 (recommandée) · C 4:3 = 186. Rangée figée 561 → HUG (défaut
Figma seulement). Correction du journal ci-dessus : les propriétés de grille (`gridRowSizes`) SONT modifiables par
script — vérifié. Rien n'a été changé sur le set ni sur le contrat en attendant la décision.

**Tranché (2026-09-09, owner) : option B.** Canevas fait : variable Desktop 364 → 248, rangées HUG (master + 6 instances
de vues), versions nommées avant/après, 26 cibles Mobile/Tablette/Wide identiques à l'octet, planche `031 · 24` retirée.
**Dépôt à faire** : primitif `size.carte-reassurance.photo-h.248` (from-dump, variable `2699:25925` mode Desktop),
`tokens/modes/viewport.desktop.tokens.json` l. 190 → `.248`, description de `reassuranceImage` dans `ds.carte`
(192 / 240 / **248** / 364) + bump, cinq miroirs Odoo, `figma:plan`, mesure du bloc à 1200 (carte 526, section 752).
**Dépôt fait (2026-09-09, même matin)** : `ds.carte` **3.1.1**, jeton `photo-h.248` (primitif + mode desktop), 33 épingles,
digest `4afa8f18…` dans les 4 miroirs, figma-sync régénéré, cliché jetons rafraîchi (empreinte = extraction vive), golden
et reçu moteur re-pinnés. Mesure sur 037 (`/portes-residentielles`) : 390 → 1666 · 834 → 1748 · **1200 → 752 (photo 248,
carte 526)** · 1728 → 799, identiques aux vues Figma. Portes : build, geometry:gate, authoring, module 23/23,
derivation:check, emitters:check, parity (0 neuf), tsc ×2, plugin:check, core-browser, roundtrip — vertes.
