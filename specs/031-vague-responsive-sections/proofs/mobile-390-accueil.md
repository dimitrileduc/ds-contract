# Étage Mobile 390 px — les 15 blocs, vérifiés à l'écran un par un

**Date** : 2026-08-27 · **Page** : `031 · Planches de validation` (page **nouvelle**)
**Section unique** : `031 · MOBILE 390 · Toutes sections`

**Aucun master n'a été touché.** Chaque bloc est une **copie détachée** dans un
cadre de 390 px. Les masters, leurs membres et leurs parents sont intacts.

**Chaque bloc a été jugé sur une capture d'écran relue**, jamais sur une mesure.
Six blocs ont demandé plusieurs itérations ; les régressions sont listées plus bas.

---

## Les 15 blocs et leur verdict

| # | Bloc | Rendu 390 | Verdict visuel |
|---|---|---|---|
| 01 | **HeroVideo** | 390 × 420 | ✅ titre pleine largeur, « HÖRMANN » **non coupé**, CTA dessous |
| 02 | **Hero** | 390 × 420 | ✅ titre, chapô avec gras, CTA pleine largeur sur la photo |
| 03 | **CategoriesPrincipales** | 390 × 900 | ✅ 2 cartes empilées, titre + description + flèche lisibles |
| 04 | **Presentation** | 390 × 280 | ✅ titre en tête, paragraphe pleine largeur, gras conservés |
| 05 | **SAV** | 390 × 1048 | ✅ carte blanche pleine largeur, texte entier, photo, fond couvrant |
| 06 | **ProduitsECommerce** | 390 × 456 | ✅ titre, CTA pleine largeur, fiche produit entière, contrôles en haut à droite |
| 07 | **Devis** | 390 × 279 | ✅ titre centré sur la photo, CTA pleine largeur |
| 08 | **Reassurances** | 390 × 2791 | ✅ en-tête + **5 cartes empilées** avec photo/titre/texte + CTA |
| 09 | **Avis Google (molécule)** | 390 × 1369 | ✅ bandeau complet sur 2 lignes (**★★★★★ 4,8 · 93 avis**), bouton, 5 avis |
| 10 | **Section Avis Google** | 390 × 1526 | ✅ titre de section + bandeau + 5 avis |
| 11 | **Formulaire** | 390 × 1693 | ✅ 4 arguments, 2 CTA empilés **avec écart**, **7 champs pleine largeur**, consentement, envoi |
| 12 | **Coordonnees** | 390 × 1151 | ✅ carte pleine largeur, puis adresse / horaires / téléphone / e-mail / réseaux |
| 13 | **FAQ** | 390 × 466 | ✅ titre, 3 lignes d'accordéon avec chevrons, CTA |
| 14 | **TexteSEO** | 390 × 635 | ✅ titre, paragraphe riche, « Infos pratiques », accordéon |
| 15 | **Equipe** | 390 × 2366 | ✅ **2 colonnes**, portraits ronds correctement cadrés, nom + poste |

---

## La recette, corrigée par l'art antérieur

Le bac à sable **`TEST — Responsive Reassurances`** (page `2563:5416`) porte deux
solutions comparées, et fixe la barre de qualité : les cartes se replient
**4 → 2 → 1**, l'en-tête et le CTA restent identiques.

- **Solution A** — `layoutWrap: WRAP` + `minWidth` sur les cartes. Reflow naturel.
  **Les deux champs sont dans le vocabulaire déclarable du runner** : c'est la
  route retenue.
- **Solution B** — un set `Viewport` avec une grille à nombre de colonnes explicite
  par étage. Plus exact, mais `gridColumnCount` **n'est pas** déclarable par le
  runner.

Recette appliquée, en **remontant depuis les feuilles** :

1. **Cartes** → `WRAP` + `minWidth` (280 px pour les cartes à texte, **160 px**
   pour les cartes-portraits de l'équipe, qui passent ainsi à 2 colonnes).
2. **Rangée → colonne** pour tout conteneur horizontal de plus d'un enfant et de
   plus de 80 px de haut. Le seuil épargne les contrôles (un bouton garde son
   icône et son libellé en ligne).
3. **Enfant d'une colonne** → `FILL` en largeur **et** `HUG` en hauteur.
4. **Aucune hauteur figée** sur un conteneur d'auto-layout.
5. **Verrous de largeur retirés** (`minWidth` / `maxWidth` hérités).
6. **Plans de fond** (absolus, à remplissage) → boîte **entière** du parent,
   **marges non déduites** : un enfant absolu n'y est pas soumis.
7. **Enfant HUG bien plus étroit que la place disponible** → `FILL`, sauf boutons,
   icônes, logos et pastilles.
8. **Aucun enfant plus large que son parent** : `FILL` si possible, sinon
   redimensionnement proportionnel.
9. **Marges et typographie** : latérales ≥ 24 → 24 · verticales ≥ 48 → 48 ·
   gouttières ≥ 24 → 24 · corps ≥ 48 → 32, ≥ 40 → 28, ≥ 32 → 26, ≥ 24 → 20,
   interligne 1,25 ×. **Une seule passe typo**, sur les tailles d'origine.

Les valeurs 24 / 48 et l'échelle typographique correspondent aux jetons
`space/*` et `font/size|line-height/*` **qui existent déjà comme variables
Figma** — donc déclarables dans un manifeste.

---

## Sept pièges rencontrés — chacun aurait produit un faux témoin

1. **Figma ignore en silence un changement d'empilement sur une INSTANCE.**
   Aucune erreur levée, rendu identique, **même hauteur**. Détecté en relisant la
   position des enfants. → toujours passer par une copie **détachée**.
2. **Deux passes de typographie réduisent deux fois** (44 → 28 → 20). → relever
   les tailles d'origine, appliquer **une** fois.
3. **Juger un parent avant ses enfants** donne une décision fausse : le bloc titre
   du Hero mesurait déjà 129 px, la règle concluait « rien à empiler », et
   « HÖRMANN » se coupait en trois. → traiter en **post-ordre**.
4. **Un enfant empilé garde sa demi-largeur** si l'on ne fixe pas les deux axes.
5. **Les instances imbriquées verrouillent leurs enfants** : la section Avis
   Google gardait 5 cartes côte à côte, une lettre par ligne, parce que la
   molécule interne était restée une instance. → **détacher récursivement**.
6. **Les marges du parent ne s'appliquent pas à un enfant absolu** : la carte
   blanche du SAV s'est retrouvée 48 px trop étroite, texte coupé à droite.
7. **Une règle de débordement trop large casse ce qu'elle touche** : les flèches
   de carrousel, absolues mais sans fond, ont été étirées sur toute la carte, et
   le bandeau Avis Google a perdu ses étoiles et sa note. → restreindre aux
   **plans de fond** et faire **passer à la ligne** plutôt que compresser.


---

## Contrôle à 320 px — la plus petite largeur témoin (D9)

Une seconde section, `031 · CONTRÔLE 320`, rejoue les 15 blocs à **320 px**.
Cinq défauts n'apparaissaient qu'à cette largeur, tous corrigés :

| Bloc | Défaut à 320 | Correction |
|---|---|---|
| **Equipe** | tombait à 1 colonne (7832 px de haut) puis « Sandra Magerm/ans » coupé en deux | largeur minimale de carte **140** (2 colonnes tiennent) + nom à **18 px** |
| **Categories** | « RÉSIDENTIEL/LES » coupé en deux | titre de carte à **22 px** |
| **SAV** | le titre sortait de la carte blanche, posé sur la photo | plans de fond renormalisés après redimensionnement |
| **Hero** | le libellé « DEMANDER UN DEVIS GRATUIT » débordait de son bouton | libellé en pleine largeur + retour à la ligne |
| **Produits** | « HSE4-868BS » tronqué, flèches hors cadre | titre produit à **14 px**, contrôles replacés dans le cadre |

**Leçon** : un redimensionnement de cadre **ne recalcule pas** les plans absolus.
Toute copie clonée puis élargie/rétrécie doit repasser la normalisation des fonds,
sinon un titre se retrouve hors de son bloc — sans erreur, sans alerte.

Les 15 blocs sont vérifiés **à 390 et à 320**, capture relue à chaque fois.


---

## Contrôle à 834 px — et ce qu'il a révélé

Troisième section, `031 · CONTRÔLE 834`. Deux défauts structurels, invisibles
aux deux largeurs étroites :

**1. Les listes de cartes ne se repliaient jamais.** `items` (Réassurances) et
`groupeCartes` (Avis Google) étaient restés en **colonne fixe** : 1 carte par
ligne à 390, à 320 **et à 834**. La règle « rangée → colonne » les avait attrapés
avant la règle « cartes → retour à la ligne ». Corrigé : ces conteneurs passent en
`WRAP` **et** `layoutSizingHorizontal: FILL` — sans le FILL, le conteneur hugue
ses 5 cartes côte à côte et fait 4266 px de large. Résultat mesuré à 834 :
**2 cartes par ligne**, cartes de 405 px.

**2. La carte orpheline s'étirait sur toute la rangée.** Avec 5 cartes sur 2
colonnes, la 5ᵉ occupait les 834 px. C'est **la limite nommée par votre bac à
sable** (« le cas 3 + 1 montre aussi la limite de la dernière carte étirée »), et
vous l'aviez déjà tranchée en 029 : *la carte orpheline garde une largeur de
piste*. Appliqué par un plafond de largeur (1,45 × la largeur minimale) : la 5ᵉ
carte reste à 405 px et s'aligne à gauche.

| Bloc | 320 | 390 | 834 |
|---|---|---|---|
| Réassurances | 1 colonne | 1 colonne | **2 colonnes + orpheline à sa piste** |
| Avis Google | 1 colonne | 1 colonne | **2 colonnes** |
| Équipe | 2 colonnes | 2 colonnes | **plus large** |

---

## Limite de portée de ce document, à ne pas oublier

Ces trois contrôles éprouvent **l'étage Mobile** à trois largeurs. Or la vague
prévoit **trois étages** : `Wide`, `Desktop`, `Mobile`. **L'étage `Desktop`
(1200 px) n'est pas construit** — ni ici, ni ailleurs. 834 px est une largeur de
tablette : sur le site réel c'est vraisemblablement `Desktop` qui s'y applique,
pas `Mobile`. Ce que ce document prouve, c'est que l'étage Mobile **tient** de
320 à 834 ; il ne dit rien de ce que `Desktop` doit être.

---

## Ce qui reste une décision, pas un défaut

Les points que j'avais d'abord rangés ici comme « décisions » se sont révélés
être des défauts, et ils sont corrigés :

- **Hauteur du HeroVideo** : passée de 265 à **420 px**, alignée sur le Hero.
  Un hero de téléphone à 265 px n'en était pas un.
- **Flèches de carrousel sur une pile verticale** : **masquées** sur les deux
  blocs d'avis. Des contrôles de carrousel au-dessus de cartes empilées sont des
  boutons morts. Elles restent visibles sur `Produits`, où le carrousel a
  toujours un sens.
- **Deux CTA du formulaire** : **12 px d'écart** posés, ils ne se touchent plus.

Restent de véritables choix :

- **Marges latérales à 0** sur `Presentation` : conforme à la doctrine du dépôt —
  la gouttière de page vit une fois sur le conteneur de page, jamais dans une
  section.
- **Équipe à 2 colonnes** : choix de lisibilité (2208 px au lieu de 7832 en une
  colonne). Une colonne reste possible.
- **Les deux CTA du formulaire portent le même libellé** (« Contactez-nous »
  deux fois) : c'est le contenu du master, pas la mise en page.

## Ce que ce document ne prétend pas

Ces quinze blocs sont des **aperçus de proposition**, pas des membres `Mobile`
posés. Rien n'est appliqué sur un master. La traduction de cette recette en
`presentationLayouts`, `primitiveBindings` et `typographyOverrides` dans les
manifestes reste à faire, et passera par le test à blanc avant toute pose.
