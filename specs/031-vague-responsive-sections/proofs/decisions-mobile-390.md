# Étage Mobile 390 — décisions appliquées sur la planche de démonstration

**Date** : 2026-08-27 · **Cible** : `031 · DEMO HOME MOBILE`, écran `2617:55170`
**Portée** : une copie détachée. **Aucun master, aucune instance de maquette, aucun
fichier de dépôt n'a été touché.**

---

## La règle appliquée, telle qu'énoncée par l'owner

> « On met les variables existantes ; si ça n'existe pas on met brut **et on
> notifie**. La mise à jour du DS n'est pas cette spec. »

Trois conséquences tenues à la lettre :

1. **Aucun Text Style créé, aucune variable créée, aucun jeton ajouté.**
2. Chaque valeur numérique est passée par une recherche automatique dans les
   collections `Primitives` / `Semantic` : liée si une variable porte exactement
   cette valeur, brute sinon — et alors journalisée.
3. La demande d'extension du DS remontée par la revue typographique
   (`Paragraphe L` 16/24 Regular + Bold) **n'a pas été instruite**. Le corps est
   passé à 16/24 par liaison de `font/size/16` + `font/line-height/24`, deux
   variables **qui existent déjà** ; ce qui manque est le *style* qui les nomme,
   et c'est une autre spec.

---

## Ce qui a été appliqué — 206 actions, 4 passes

| Passe | Objet | Actions | Liées à une variable | Brutes |
|---|---|---|---|---|
| 1 | Espacement, rythme, valeurs mortes | 91 | **91** | 0 |
| 2 | Typographie + accidents de composition | 62 | 55 typo + 7 copies | 0 |
| 3 | Mise en page et hauteurs | 53 | 39 | **14** |
| 4 | Renormalisation des plans de fond | 4 | — | — |

### Passe 1 — le rythme cesse d'être un accident arithmétique

Le relevé montrait `itemSpacing = 0` sur l'écran : les 64 px de respiration entre
blocs étaient **la somme fortuite de deux paddings voisins**.

**Premier correctif, et il était faux** — corrigé le 2026-08-28 après relevé owner.
J'avais posé l'écart *sur chaque section* (48 en haut et en bas, donc 96 entre deux
sections blanches). Cela produisait un rythme **non uniforme** : 96 entre deux
sections blanches mais seulement **48 autour de `devis`**, `footer` et
`hero-video`, qui ne peuvent pas porter de padding externe sans que leur photo se
retrouve rentrée.

**Le modèle gouverné dit l'inverse, et la home Wide le prouve :**

| | Home Wide (`210:326`) |
|---|---|
| `itemSpacing` du conteneur de page | **128** |
| Écart entre chaque paire de sections | **128, sans exception** |
| Padding vertical externe des sections | **0 partout** |
| Header | **absolu**, hors du flux — l'écart ne s'y applique pas |

C'est aussi la doctrine écrite du dépôt pour Odoo : *« la gouttière horizontale
(89) et l'écart vertical (128) vivent une fois sur le conteneur de page »*.

**Règle rétablie** : *l'écart vertical vit UNE FOIS sur le conteneur de page ; les
sections ne portent aucun padding vertical externe ; une section pleine largeur
porte son padding à l'intérieur de sa surface peinte.* La gouttière horizontale de
24 reste sur les sections blanches, faute d'un autre porteur en mobile (sur Wide
elle est absorbée par la largeur et le `x` de chaque section).

**Le modèle est confirmé par la mesure, pas par principe.** Sur le Wide, la
distance **encre à encre** entre deux sections vaut 128 à 144, et la respiration
interne des sections vaut 0 à 16 px : *le gap est toute la séparation*. Combiner
gap et padding serait s'éloigner de la source.

### La valeur : 80 px, et il faudra minter `space/80`

Deux dérivations précédentes étaient fausses et sont rétractées ici.

| Source | Ce qu'elle donne |
|---|---|
| **GOV.UK Design System** — seule échelle publiant les paires mobile/desktop (20/30, 25/40, 30/50, 40/60) | mobile = **60–67 %** du desktop au haut de l'échelle → 128 ÷ 1,5–1,67 = **77 à 85** |
| **Utopia** — méthode fluide | un pas simple varie de 1,1–1,2× ; les **paires d'un cran**, prescrites pour les écarts dramatiques, donnent **~1,5×** — même ordre |
| **IBM Carbon** — échelle de mise en page `16·24·32·48·64·**80**·96·160` | **80 est un barreau canonique** de la grille 8 pt ; notre échelle le saute (`48·64·89·96·128`, le 89 venant de la gouttière horizontale desktop) |

**Rétractations.** Le **64** venait d'un rapport 2:1 que rien ne justifie, appuyé
sur deux citations qui ne survivent pas à la vérification : la page Red Hat **ne
contient pas** le « 64 par défaut » que le résumé de recherche m'avait servi, et
le fil Client-First **ne publie aucune échelle officielle**. Le **96** venait de
mon propre raisonnement sur le poids relatif à l'écran, non sourcé.

Contrôle croisé conservé : 80 / 746 = **10,7 %** de la hauteur visible contre
128 / 900 = 14 % sur desktop — plus léger, ce qui est la pratique, mais plus du
simple au double comme avec 64.

Écarts réels mesurés : **80 sur les huit jonctions**, `devis` compris. Page à
**8 653 px**. Valeur **brute** : aucune variable du dépôt ne porte 80.

Hiérarchie d'écarts posée : **96 : 32 : 16 : 8** — chaque niveau double le
suivant, la proximité redevient lisible sans mesurer.

Valeurs hors jeton éliminées, chacune mesurée avant : `20` ×3 (en-tête produits,
rangées de réassurances, espaceur de footer), `11` (gouttière du panneau Avis),
`14` (écart interne des cartes d'avis), `minHeight 239` ×5, `itemSpacing 392`
(résidu desktop sur une nav à un seul enfant visible).

Gouttières empilées supprimées : la carte de réassurance rentrait son texte de 8
de plus que son image ; le bloc Avis emboîtait trois boîtes et faisait passer le
titre de section de 24 du bord à 59 pour le corps d'un avis.

### Passe 2 — la typographie sur les crans du DS

| Rôle | Avant | Après | Cran |
|---|---|---|---|
| Titre de section | 24/30 | **32/40** | `Titre 3` |
| Accroche | 14/24 | **20/25** | `Accroche` |
| Titre de carte / colonne | 18/24 | **20/25 SemiBold** | `Titre 5` |
| Prix | 14/24 | **20/25 SemiBold** | `Titre 5` |
| Auteur d'avis | 18/24 SemiBold | **16/20 SemiBold** | `Titre 6` |
| Corps, témoignage | 14/24 (et 19,6 · 16,8 · AUTO) | **16/24 Regular** | variables existantes, style à créer |
| Méta (date, « Lire la suite ») | 14 · AUTO · 16,8 | **14/24 Regular** | `Paragraphe` |

Deux règles qui rendent leur métier aux coupes : **Regular = lire · Medium =
agir · SemiBold = repérer · Bold = insister**, et **UPPER réservé aux actions et
aux accroches**. Le retrait des majuscules sur les titres de catégories fait
tenir « Portes de garage » sur une ligne : **les deux cartes retrouvent la même
hauteur**, sans rien ajouter au système.

Accidents de composition corrigés : espaces insécables avant `?` et `!` et sauts
de ligne manuels dans le paragraphe SAV ; espace parasite en tête de la ligne
« Email » ; espaces doubles dans l'adresse et les horaires.

Deux libellés touchés, et seulement parce que la mesure les rendait intenables :
les accroches passées à 20 px n'acceptent plus que ~24 caractères sur une ligne,
d'où « Plus de 50 ans d'expérience » → « **50 ans d'expérience** » et « Nos avis
Google vérifiés » → « **Avis Google vérifiés** ».

### Passe 3 — la mise en page

- **Réassurances en une colonne pleine largeur.** À deux colonnes, la colonne de
  texte faisait 151 px, soit **22 caractères par ligne** pour un minimum lisible
  de 35. Le plancher de carte passe de 155 à 280 : une seule piste tient à 390.
  Textes ferrés à gauche, comme les cinq autres sections de contenu ; les
  panneaux pleine largeur (hero, devis) gardent le centrage.
  **Retrait du texte dans la carte** (relevé owner, 2026-08-27) : une fois la
  photo passée pleine largeur, le texte affleurait exactement le même bord —
  la carte ne se lisait plus comme une unité. Retrait de 16 (`space/16`) à
  gauche, à droite et en bas ; l'écart entre deux cartes reste à 32, soit le
  double, donc la proximité se lit.
- **Avis : 3 cartes visibles au lieu de 5**, le reste porté par le lien.
- **Hero : contenu posé en bas** au lieu d'être centré dans 2 × 199 px de vide.
- **Photo SAV** de 504 à 320.
- **Séparateur de footer** : il avait une hauteur de 0 — un séparateur invisible
  encadré de deux espaceurs en dur. Il a maintenant un filet réel.
- **Cibles tactiles** : le lien « En savoir plus » passe de 30 à 54 px de haut,
  le burger de 28 à 44.
- **`SPACE_BETWEEN` retiré des contrôles de carrousel** — il annulait
  silencieusement l'écart demandé (neuvième occurrence de cette panne, `E-031-023`).

---

## Typographie — la panne des segments

**Dixième panne silencieuse de la vague, et c'est l'owner qui l'a vue.**

`setBoundVariable('fontSize')` sur un nœud de texte à styles multiples **ne descend
pas dans les segments**. La passe typographique s'est donc appliquée à moitié :

| Nœud | Ce qui a bougé | Ce qui est resté |
|---|---|---|
| Titre `presentation` | « Piqueray, votre distributeur… » → 32 Regular | « en Province de Liège » → **resté 24 Bold** |
| Corps `presentation` | passages Regular → 16 | **les 4 passages en gras → restés 14** |

L'interligne du titre était resté à **30 pour un texte à 32** — plus serré que la
taille. Le nœud relit « MIXTE » au niveau global et **aucune erreur n'est levée**.

**Correctif** : passer par `setRangeFontSize` / `setRangeLineHeight` sur `0..L`,
qui écrase les segments, **puis** lier la variable au niveau du nœud. Balayage des
**72 textes** de la planche : **seuls 2 étaient touchés**, les deux de
`presentation` ; les 70 autres étaient déjà uniformes.

**Aggravant de méthode** : le `MIX` figurait dans mon **tout premier relevé
d'arbre** et je ne l'ai pas creusé. Une valeur relue comme MIXTE est un signal,
pas un détail. Registre : `E-031-034`.

## SAV — ordre photo / texte

Sur mobile, le bloc ouvrait sur un pavé de texte et posait la photo en dessous —
ordre hérité de la composition desktop en deux colonnes, où il ne se voit pas.
**Photo remontée en première position** (décision owner). Hauteur inchangée :
894 px.

**Classe d'écart à surveiller ailleurs** : un ordre de lecture correct en rangée
peut être faux une fois empilé. Les trois sections concernées de la vague sont
`presentation`, `formulaire` et `coordonnees`. Registre : `E-031-035`.

---

## Les 14 valeurs brutes, nommées

Aucune variable ne porte ces valeurs. Elles sont posées telles quelles et
inscrites ici — c'est la moitié « et on notifie » de la règle.

| Valeur | Où | Pourquoi | Jeton qu'il faudrait |
|---|---|---|---|
| `280` ×5 | plancher de carte de réassurance | force une seule piste à 390 | `size.reassurance.carte.min` |
| `192` ×5 | photo de carte de réassurance | 16:9 sur 342 de large | `size.reassurance.image.h` |
| `320` ×2 | photo SAV (`imgGroup`, `img`) | 504 était surdimensionné | `size.sav.image.h` |
| `1` | filet du footer | épaisseur de séparateur | `border-width.100` |
| `44` | cible tactile du burger | plancher tactile usuel | `size.cible-tactile.min` |

**Ces cinq références sont à minter from-dump dans une spec ultérieure**, jamais à
écrire en dur dans un contrat : la règle « la géométrie chevauche les jetons » du
dépôt fait qu'une valeur non liée est invisible pour le différentiel.

---

## Ce que la mesure a démenti

**La proposition typographique du hero est fausse à 390 px.** La revue proposait
de réveiller `Titre Hero vidéo` 44/48, jamais employé. Appliqué, il coupe
« HÖRMANN » en deux (« HÖRMA / NN »). Descendu à 40 : coupe encore
(« HÖRMAN / N »). Mesure du groupe le plus long, « portes HÖRMANN », par sonde :

| Taille | Largeur du groupe | Disponible |
|---|---|---|
| 32 | **293 px** | 342 |
| 40 | 366 px | 342 |
| 44 | 402 px | 342 |

**32 est le plafond du hero à 390 avec ce texte.** Le geste typographique
réclamé par la revue n'est pas atteignable sans toucher au copy — ce qui est une
décision owner, pas une décision de transposition. Le hero est resté à 32/40.

C'est la troisième fois dans cette vague qu'une proposition lue comme acquise est
renversée par l'exécution. La règle du dépôt tient : **on conclut sur une
capture, jamais sur un calcul.**

---

## Un débordement de périmètre, corrigé

La revue globale proposait de donner sa couleur à l'action : les trois CTA de
conversion en aplat orange. **Cela a été appliqué, puis intégralement annulé.**

C'est une décision de charte, pas un défaut de transposition mobile ; le rôle de
la 031 est l'étage `Mobile` des douze sections, rien d'autre. Les quatre boutons
(`sav`, `devis`, `reassurances`, `footer`) ont été relus sur **leurs instances
sources de la maquette Accueil** (`2108:3135`, `2096:2705`, `2115:3892`,
`210:446`) et restaurés à l'identique, liaisons de variables comprises :

| Bloc | Fond | Contour | Libellé |
|---|---|---|---|
| `sav` | `#26282c` (lié) | aucun | `#ffffff` (lié) |
| `devis` | `#ffffff` (lié) | `#ffffff` (lié) | `#ffffff` (lié) |
| `reassurances` | `#ffffff` (lié) | `#26282c` (lié) | `#26282c` (lié) |
| `footer` | `#ffffff` (lié) | `#ffffff` (lié) | `#ffffff` (lié) |

Vérifié à la capture sur les quatre.

---

## Le budget de hauteur, dit honnêtement

**La page a grandi : 7 969 → 8 634 px, soit 10,7 → 11,6 premiers écrans** (746 px,
la hauteur visible dans Safari sur la référence 390 × 844).

| Bloc | Avant | Après | Delta |
|---|---|---|---|
| réassurances | 1 427 | **2 116** | **+689** |
| avis Google | 1 660 | 1 246 | −414 |
| SAV | 1 044 | 894 | −150 |
| produits | 626 | 738 | +112 |
| présentation | 560 | 673 | +113 |
| devis | 264 | 374 | +110 |
| catégories | 924 | 948 | +24 |
| footer | 802 | 899 | +97 |
| header | 64 | **0** (flotte sur le hero) | −64 |
| hero | 597 | **746** (décision owner) | **+149** |
| **total** | **7 969** | **8 634** | **+665** |

La cause est unique et assumée : **passer les réassurances de deux colonnes à une
échange de la hauteur contre de la lisibilité** — 22 caractères par ligne
devenaient 49. Le reste du budget est financé (avis et SAV rendent 564 px), et le
passage de 32 à 48 de padding de section coûte 192 px pour un rythme enfin
gouverné.

**Le seul levier qui reste est le nombre de cartes de réassurance : cinq cartes
photo occupent 2 012 px, soit 24 % de la page. C'est une décision de contenu,
donc la vôtre — je ne l'ai pas prise.**

---

## Hauteur du hero mobile

**Personne n'avait choisi 597.** Relevé sur le set gouverné `HeroVideo`
(`2580:7392`) :

| Membre | Largeur | Hauteur | Ratio |
|---|---|---|---|
| `Presentation=Wide` | 1728 | 720 | 2,40:1 |
| `Presentation=Desktop` | 1200 | **597** | 2,01:1 |
| `Presentation=Compact` | **390** | **597** | **0,65:1** |

`Compact` a **hérité la hauteur de `Desktop`** : la largeur est divisée par trois,
la hauteur ne bouge pas. Le ratio s'effondre de 2,01:1 à 0,65:1 — une bande large
devient un bloc portrait, par omission. `space/597` a été mintée *après coup* pour
habiller ce nombre ; elle n'a aucune description et ne justifie rien.

**Une valeur gouvernée n'est pas une valeur décidée.** C'est ce qui m'a fait
passer à côté : la hauteur était liée à une variable, donc elle avait l'air
tranchée.

**Décision owner du 2026-08-27 : hauteur du membre Mobile = 746 px**, soit 100 %
du premier écran sur la référence 390 × 844 (844 − 47 de barre d'état − 51 de
barre Safari). Répartition obtenue : 476 px de vidéo, 206 px de contenu ancré en
bas, 64 px de marge basse. Ratio **0,52:1**.

**Deux réserves à porter au contrat, et elles comptent :**

1. **746 est brut** — aucune variable ne porte cette valeur. Quinzième valeur
   brute de la planche.
2. **746 est l'épinglage statique d'une règle relative.** Côté code cela
   s'exprime en `100dvh`, jamais en pixels : à 746 fixes, un iPhone 16 Pro Max
   (956) reçoit un hero qui ne remplit pas, un iPhone SE (667) un hero qui
   déborde. Le pixel est la *projection Figma* d'une règle — si le contrat porte
   746 sans le dire, la règle est perdue.

Registre : `E-031-031`. La campagne `hero-video` reste bloquée par `E-031-002`
(le renommage `Compact` → `Mobile` n'a aucun chemin runner) ; la décision de
hauteur est prise et l'attend.

## Composition du hero

Cinq options montées à hauteur et voile égaux — planche `031 · HERO — OPTIONS`,
nœud `2624:56797` : A bas/centré · B tout centré · C bas/gauche · D texte centré
avec CTA en pied · E bas/gauche avec CTA pleine largeur.

**Décision owner : option D.** Texte centré verticalement (42–58 %), CTA pleine
largeur 342 px ancré en pied (84–91 %), marge basse 64.

L'option E était la recommandation de l'agent — elle groupe titre et CTA sur un
même bord gauche, rentre dans le rang de `Wide` et enchaîne avec le reste de la
page, qui est ferré à gauche. Elle reste consultable sur la planche (`2624:57084`).
La variante de home complète en E a été supprimée sur demande owner, **après
vérification que E survivait sur la planche** — pas avant.

**Conséquence technique à porter au manifeste** : le CTA devient un enfant
**ABSOLU** pour être ancré en pied, donc il **ignore le padding du parent**
(sixième panne silencieuse de la vague). Sa gouttière de 24 est posée à la main et
devra être **déclarée explicitement**, jamais héritée. Registre : `E-031-033`.

## Voile de lisibilité

**Le voile ne couvrait pas le titre.** `VoileBas` n'avait que **deux arrêts** —
alpha 0 à 80 % de la hauteur, alpha 0,5 à 100 % — alors que le titre était à
64–80 %. **Il recevait une opacité de zéro.** `VoileNavigation` avait le même
défaut à l'autre bout : 2,6:1 pour le logo blanc sur ciel clair, sous le seuil de
3:1.

Refait en **dégradé étagé** — 12 arrêts en bas, 9 en haut — calé sur la position
réelle du texte. Contrastes calculés sur brique jaune claire (luminance 0,45) :

| Zone | Opacité | Contraste | Seuil WCAG 2.2 AA |
|---|---|---|---|
| Haut du titre (42 %) | 0,52 | **3,9:1** | 3:1 (grand texte) |
| Bas du titre (58 %) | 0,64 | **5,0:1** | 3:1 |
| CTA (84–91 %) | 0,75 | **6,5:1** | 4,5:1 (libellé 16 px) |
| Logo et burger (0–10 %) | 0,65 | **3,6:1** | 3:1 |

**Trois enseignements, et le premier est un piège de conception :**

1. **Changer la composition invalide le calage du voile.** Le passage de l'option
   A à l'option D a déplacé le titre de 64–80 % à 42–58 %, où l'ancien dégradé ne
   donnait que 0,26 — soit **2,7:1, sous le seuil**. Recalibré. Aucune alerte ne
   se serait déclenchée.
2. **Un dégradé à deux arrêts produit une bande visible et ne protège rien.** La
   pratique de référence est un dégradé étagé de 12–13 arrêts approchant une
   courbe d'atténuation.
3. **Figma ne sait pas lier un arrêt de dégradé à une variable.** Les 21 arrêts
   sont bruts *par nécessité* — limite d'outil, pas oubli.

Registre : `E-031-032`.

---

## Le fond du header

La planche peignait un aplat `#26282c` **brut** sous le header. Relevé aux trois
niveaux :

| Niveau | État réel |
|---|---|
| COMPONENT_SET gouverné `Header` (`84:285`) | **un seul membre, `Fond=Transparent`**, remplissage racine « aucun » — la variante `Fond=Solid` a été supprimée sans usage en spec 022 |
| Instance de la maquette Accueil (`210:472`) | aucun remplissage, et enfant **ABSOLU à y = 0 posé sur le bloc hero** |
| Lisibilité du logo | assurée par `VoileNavigation`, un dégradé 390 × 597 **déjà présent et visible** dans le hero |

La planche, elle, empilait le header comme un bloc normal dans la colonne
verticale — ce qui posait un logo blanc sur du blanc — et **un aplat noir avait
été peint pour compenser**. C'est le contournement que §VIII interdit, et il a
tenu deux jours sans être vu.

**Corrigé à la structure** : le header redevient enfant ABSOLU du bloc hero à
y = 0, remplissage retiré. La page passe de 8 561 à **8 485 px**. Vérifié à la
capture. Registre : `E-031-030`.

Triple faute, et c'est ce qui la rend instructive : elle contredisait le master,
elle était **brute donc invisible pour le différentiel**, et elle dupliquait un
mécanisme qui existait déjà.

---

## Ombre portée des cartes

Le halo gris sous chaque carte de réassurance n'est pas une addition de la vague :
c'est un effet **DROP_SHADOW radius 10, décalage y +5, noir à 20 %**, relevé sur
**13 nœuds du COMPONENT_SET gouverné** (`2114:3721`) et sur les **5 cartes de
l'instance Accueil** (`2115:3892`). Il vient de la source.

Ce qui change à 390, c'est le contexte : à 284 px de large en desktop l'ombre est
discrète ; à **342 px sur fond blanc, étalée sur toute la largeur, elle devient le
seul marqueur de la limite de carte** — et 10 px de flou à 20 % ne font pas une
limite, ils font une salissure.

**Non corrigé, et c'est délibéré.** §VIII : pour tout écart on tranche d'abord
« est-ce du Figma ou pas ? » — c'en est, donc cela se répare à la source, jamais
dans la copie. Et c'est une propriété d'**apparence**, de la même classe que la
couleur des CTA : hors du périmètre de transposition responsive. Deux issues
possibles, toutes deux owner : retirer l'ombre et donner à la carte une limite
franche (filet `color/gris-clair`, ou fond `color/bleu-clair` `#f4f6fa` comme le
panneau SAV), ou la garder et l'assumer sur mobile. Registre : `E-031-029`.

---

## Ce qui n'est PAS décidé, et qui reste à vous

Les propositions des trois revues qui touchent au contenu ou à la charte ont été
**remontées, pas appliquées** :

- la couleur de l'action (orange sur les CTA de conversion) ;
- l'ordre des blocs (remonter `devis`, poser un bandeau de preuve sous le hero) ;
- la photo du hero (façade vs équipe vs technicien) ;
- la troisième carte catégorie « Motorisations » ;
- le nombre de cartes de réassurance et leur ciblage (le titre parle
  d'« industrielles » au-dessus de deux cartes résidentielles) ;
- la zone d'intervention, absente de la page ;
- la barre d'action fixe et le téléphone cliquable.

---

## Ce que ce document ne prétend pas

Ces quinze blocs restent des **aperçus de proposition**. Rien n'est posé sur un
master. La traduction en `presentationLayouts`, `primitiveBindings` et
`typographyOverrides` dans les onze manifestes reste à faire, et passera par le
test à blanc avant toute pose.
