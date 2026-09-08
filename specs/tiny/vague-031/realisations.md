# Realisations — étape 0 + proposition v2 (2026-09-07)

**Contexte** : la page 3 « Portes de garage résidentielles » porte 9 blocs ; la démo v2 de la page 031
(`2770:21610`) n'en porte que 7. Les deux absents sont **Realisations** (1551 de haut, le plus gros bloc de la
page) et **FAQ**. Ce document ouvre Realisations.

**État de départ, mesuré (pas déduit)** :

| | valeur |
|---|---|
| Set Figma | `Realisations` **2117:4691**, page « DS · Organisms », 2 variantes `En-tete = Accroche \| Presentation` |
| Molécule | `Realisation` **2095:2484**, 2 variantes `Taille = Grand (743×743) \| Petit (339,5×339,5)` — **v1** |
| Contrat de section | **aucun** (`ds.realisation` 1.1.0 existe, c'est la tuile ; la section n'existe pas) |
| Bloc Odoo | **aucun** (aucun `data-ds-contract="ds.realisations"` dans `components.xml`) |
| Usages du set | **3** : Portes d'entrée (`Accroche`, 0 surcharge), Industrielles (`Presentation`, 1), Résidentielles (`Presentation`, 12) — + 1 sur la page 031 |

Donc trois chantiers et non un : la tuile v2, une section neuve de A à Z, un bloc Odoo neuf.

## Étape 0 — audit de la source (lecture seule)

Anatomie relevée (variante `En-tete=Presentation`, 1728×1550,5) : racine VERTICAL, gap 48,
padding **128 / 89 / 128 / 89**, fond plein › `Bloc en-tête` (1319, HORIZONTAL gap 64 : `SectionHeader` 628 +
`wrapper` 627 › `Texte`) › `grid` (1550, **GRID 4 colonnes FLEX 1fr × 3 lignes HUG, gaps 64/64**) › **9 tuiles** :
1 `Taille=Grand` ancrée (0,0) sur **2×2 cellules**, puis 4 petites en (0,2) (0,3) (1,2) (1,3) et 4 en ligne 3.

### Défauts de source relevés

| # | Défaut | Nature | Effet |
|---|---|---|---|
| 1 | **Les 9 photos sont invisibles.** Le cliché est bien posé (fill IMAGE sur la racine de chaque tuile, 9 hashes distincts sur la page 3) mais le cadre enfant `Image` porte un **aplat gris opaque de la même taille** qui le recouvre entièrement. | défaut évident | **la section n'a JAMAIS montré ses photos**, ni dans le master ni sur la vraie page 3 — vérifié par capture des deux |
| 2 | Les 9 tuiles sont **HUG/HUG** dans une grille à colonnes FLEX : elles portent leur taille figée de master au lieu de suivre la colonne. | structurel | c'est le blocage entier du responsive : la grille se resserre, les tuiles non |
| 3 | La molécule `Realisation` n'a qu'un **axe de géométrie** (`Taille` = 743 ou 339,5), pas de sens. L'enfant `Image` est FIXED/FIXED. | structurel | en v2 la taille vient de la grille : l'axe `Taille` n'a plus de raison d'être |
| 4 | **Aucune liaison de variable** sur la racine (padding 128/89, gap 48) ni sur la grille (gaps 64). | non lié | l'extraction ne porterait rien (règle « la géométrie roule sur les jetons ») |
| 5 | `Bloc en-tête` fait **1319 de large, FIXED**, dans une section dont la grille fait 1550 : ni aligné sur la grille, ni FILL. | structurel | l'en-tête ne suit pas la largeur de contenu |
| 6 | Les deux variantes ont des en-têtes **structurellement différents** (`Accroche` = un SectionHeader 1550 seul ; `Presentation` = 2 colonnes). | à modéliser | l'axe `En-tete` est un axe de présentation d'en-tête, pas une variante de contenu |
| 7 | Le paragraphe porte **2 plages en gras** (Montserrat Bold) — style « Paragraphe » présent. | à nommer | texte **riche** (règle owner 2026-09-02) |
| 8 | Demi-pixels 339,5 (= (1550 − 3×64) / 4). | connu | arrondi à surveiller à la projection |

Rien n'a été corrigé à la source : conformément à la règle, les défauts sont écrits ici et portés à l'owner.

## Proposition sur le canevas (page 031)

Version nommée avant : « **031 — avant proposition Realisations v2 (2026-09-07)** » (id 2396502653162034993).
Planche **`2773:26560`** — un **cadre auto-layout**, pas une SECTION (les enfants d'une section sortent du cadre).
**Set `2117:4691` et molécule `2095:2484` NON modifiés** (relevé après : 2 variantes chacun, tailles inchangées,
**4 instances du set avant, 4 après**, page 3 toujours à 9 enfants et 6576 de haut). Les 5 vues sont des cadres
détachés de la variante `Presentation`, photos et textes empruntés à la page 3 pour juger sur du vrai.

### Ce que la proposition garde de la source (rien d'inventé)
La mosaïque (1 grande carrée + 8 petites carrées), l'ordre des 9 photos, le gap 64, l'en-tête à 2 colonnes
au-dessus de 992. Corrections communes : **le cache gris est levé** (défaut 1), les tuiles suivent la colonne
(défaut 2), l'en-tête passe en FILL (défaut 5), paddings et gaps **liés aux variables** (défaut 4), et le
**padding vertical passe à 0** — le rythme vertical appartient à la page depuis la vague 031, comme pour
`Reassurances` et `TexteSEO`.

### Les 4 vues + le duel mobile

| | Mobile A 390 | Mobile B 390 | Tablette 834 | Desktop 1200 | Wide 1728 |
|---|---|---|---|---|---|
| gouttière | 24 | 24 | 48 | 56 | **89** |
| colonnes | **1** | **2** | **2** | 4 | 4 |
| gap de grille | 16 | 16 | 64 | 64 | 64 |
| grande tuile | 342 | 342 (2×2) | 738 (2×2) | 512 (2×2) | **743 (2×2)** |
| petite tuile | 342 | 163 | 337 | 224 | **339,5** |
| grille | 342×3206 | 342×1058 | 738×2342 | 1088×800 | **1550×1146,5** |
| bloc entier | **3638** | **1490** | 2578 | 968 | **1294,5** |

**Wide = la maquette d'aujourd'hui au pixel** (1550×1146,5). Desktop garde la même recette, seules les colonnes
se resserrent — c'est la demande owner « sur desktop c'est quasi pareil ».

### La seule question ouverte : le mobile
En **une colonne**, les 9 photos font **3638 px** — près de 2,5 m de défilement pour un seul bloc, et la grande
photo perd sa distinction (elle a la même largeur que les autres). En **deux colonnes**, le bloc tombe à
**1490 px** et la mosaïque garde son identité : la grande reste pleine largeur, les 8 petites par paires.
**Recommandation : Mobile B (2 colonnes).** Décision owner.

## Reste à faire après la décision
1. Poser l'axe `Presentation` (Mobile / Tablette / Desktop / Wide) sur le set `2117:4691`, corriger les 8 défauts
   à la source, instances comptées avant et après.
2. Trancher le sort de l'axe `Taille` de la molécule `Realisation` (défaut 3) : il disparaît si la tuile prend sa
   taille de la grille.
3. Contrat **neuf** `ds.realisations` (section) + `ds.realisation` en v2 ; le nombre de photos et l'axe `En-tete`
   à modéliser.
4. Bloc Odoo **neuf** (gabarit, config d'authoring, feuille responsive, page de test, mesure, test d'édition).
5. **Point de capacité à trancher avant le contrat** : la mosaïque n'est pas une grille régulière. Le schéma ne
   gouverne que des pistes égales (`layout.columns`) ; le **span 2×2** de la grande tuile est un
   **CARRY-CODE-ONLY** nommé (`docs/FIGMA-CAPABILITY-MATRIX.md`, ligne 62). Soit on l'assume en CSS et on le
   nomme, soit on ajoute un canal additif au schéma — décision orchestrateur.

---

## Décision owner et nettoyage de la source (2026-09-07)

**Option B retenue** (mot owner : « je valide ! B »), plus une correction posée par l'owner sur la proposition :
le **titre est centré en Mobile et Tablette, à gauche en Desktop et Wide** (le paragraphe reste à gauche partout).
Relevé au pixel sur les 5 vues avant de le porter, et porté sur la seule forme `presentation` — la forme `accroche`
reste centrée à toutes les largeurs, comme la source (mon premier passage l'avait alignée à gauche en Desktop et
Wide : changement non demandé, **annulé**).

### Corrections à la source (masters v1, servent les vraies pages)

Version nommée avant : « **031 — avant nettoyage source Realisations + set v2 (2026-09-07)** » (id 2396501501596011901).
Version après : id 2396505204361785889.

| défaut | correction | preuve |
|---|---|---|
| 1 — l'aplat gris opaque qui recouvrait les 9 photos de chaque tuile | `fills = []` sur le cadre `Image` des **2 variantes de la molécule** `Realisation` 2095:2484 | **27 caches → 0, 27 photos visibles**, capture de la vraie page 3 avant/après |
| 2 — tuiles HUG dans une grille à colonnes flexibles | racine de la tuile en FIXED, cadre `Image` en FILL/FILL | la tuile suit désormais sa cellule |

**Géométrie inchangée, vérifiée après** : molécule `Taille=Grand 743×743 | Taille=Petit 339,5×339,5`, set v1 2 variantes
3628×1551, les 4 instances toujours 4, page 3 toujours 9 enfants et 6576 de haut.

Les défauts 3 à 8 (axe `Taille` inerte, valeurs non liées, en-tête 1319 FIXED, en-têtes hétérogènes, texte riche,
demi-pixels) sont traités **dans le set v2**, pas dans le v1 — le v1 continue de servir les pages en production.

### Set v2 candidat

**`Realisations` `2773:27344`**, clé `043a3f9354464eebfbb274d5176a67c571e18f87`, **8 variantes** =
`En-tete` (Accroche | Presentation) × `Presentation` (Mobile | Tablette | Desktop | Wide), dans la section
« 031 · REALISATIONS — set v2 (8 variantes, candidat) » de la page 031. Le set v1 `2117:4691` **n'est pas modifié** :
même convention que les six autres doublons de nom déjà présents sur la page 031 (AccordionRow, CarteCategorie,
Reassurances, CategoriesPrincipales, Header, HeroVideo). Paddings, écarts et écarts de grille **liés aux variables**
(`space/24|48|56|89`, `space/16`, `space/64`), padding vertical **0**, chaque variante portant son mode responsive.

| | Mobile 390 | Tablette 834 | Desktop 1200 | Wide 1728 |
|---|---|---|---|---|
| colonnes | 2 | 2 | 4 | 4 |
| grille | 342×1058 | 738×2342 | 1088×800 | **1550×1146,5** |
| bloc (forme `presentation`) | 1514 | 2602 | 998 | **1294,5** |

**Wide = la maquette d'aujourd'hui au pixel.**

## Contrats (2026-09-07)

**`ds.realisation` 1.1.0 → 2.0.0** (MAJEUR) : la tuile ne porte plus sa taille (743 / 339,5 en jetons) — elle remplit
sa cellule et reste carrée (`width: fill` + `aspectRatio: 1` sur la racine et sur le plan image). L'axe `Taille` est
**conservé mais inerte** : il existe sur le set Figma, il ne pilote plus aucune géométrie. Son retrait toucherait
99 instances vivantes sur trois pages clientes — **décision owner en attente**.

**`ds.realisations` 1.0.0 — contrat NEUF.** 6 props : `presentation`, `enTete`, `accroche`, `titre`,
`texte` (**riche**, deux plages `strong` gouvernées par `font.weight.bold`), `photos`
(`arrayOf {imageUrl, imageAlt}`). En-tête modélisé **à plat** (comme `ds.reassurances` et `ds.sav`) pour que le
rédacteur Odoo puisse éditer sur-titre et titre. Mosaïque en `display: grid` + `columns` 2 → 4, tuiles en
`repeat` + `component` sur `ds.realisation`.

Le centrage du titre tombe juste dans le CSS généré, par l'ordre des règles à spécificité égale :
`.Titre` (centre) · `.presentation-desktop .Titre` (gauche) · `.presentation-wide .Titre` (gauche) ·
**`.enTete-accroche .Titre` (centre, en dernier, donc gagnante)**.

### Ce que le contrat ne peut PAS dire — limite nommée

**La grande tuile occupe 2×2 cellules.** `layout.columns` ne gouverne que des pistes égales ; les zones, spans et
chevauchements sont un **CARRY-CODE-ONLY déclaré** (`docs/FIGMA-CAPABILITY-MATRIX.md`, ligne 62). La règle
`grid-column: span 2 / grid-row: span 2` sur la première tuile devra être posée **en CSS Odoo**, bornée à la première
tuile, et nommée. **Conséquence à ne pas oublier : la surface React générée rend aujourd'hui 9 tuiles égales** — la
mosaïque n'existe que sur le canevas et (à venir) dans Odoo.

### Portes

| porte | état |
|---|---|
| `npm run build` | **vert** (42 contrats, dérivation comprise) |
| `npm run geometry:gate` | **vert** — 0 littéral invisible, 406 refs gouvernées |
| `npm run emitters:check` | **vert** — 42 contrats |
| `npx tsc --noEmit` | **vert** |
| `npm run odoo:authoring:check` | **vert** |
| `npm run odoo:module:check` | **vert** — 23/23 |
| `npm run mint:check` | **vert** |
| `npm run parity` | **8 constats, aucun de ce chantier** — voir ci-dessous |
| `npm run eval` | **non lancé** (règle : orchestrateur, worktree partagé avec une autre session) |

### Le rafraîchissement du cliché de parité a révélé 8 dérives cachées

`npm run parity` **rafraîchit `parity/snapshots/figma-components.json` depuis le canevas vif**. Le cliché commité
datait du 2026-09-02 : vert, mais sur un état qui n'était plus celui du fichier. Rafraîchi, il révèle **8 constats,
dont aucun ne vient de ce chantier** — `Realisations` et `Realisation` ne produisent **aucune dérive** (contrat et
canevas d'accord) :

- `AccordionRow.State` **ahead** — le canevas porte un axe `State` [Hover, Default] que le contrat ne déclare pas
  (posé par la vague 033/034 sur les masters).
- **7 jetons `Semantic/typography/etat/<style>/graisse-survol` behind** — présents dans `tokens/`, sans variable
  Figma (vague 032).

**Aucun patch de parité accepté, aucun acquittement ajouté** — ces 8 constats appartiennent à leurs chantiers.

## Reste à faire

1. **Le bloc Odoo, entier** : gabarit QWeb, déclaration de snippet, `realisations.authoring.json`, panneau Figma,
   feuille `responsive/realisations.pqr.css` (dont la règle de chevauchement 2×2), page de test, déploiement pilote,
   mesure aux 4 largeurs contre les planches, test d'édition. C'est le gros morceau restant.
2. La **FAQ** — l'autre bloc absent de la page 3. Beaucoup moins cher : contrat, bloc et molécule existent déjà,
   il ne manque que le responsive (et la dette « Taille Grand » laissée par `accordion-row`).
3. Le sort de l'axe `Taille` de `ds.realisation` (décision owner).
4. La promotion des 3 usages de page vers le set v2 (geste canvas, après validation).

---

## Bloc Odoo + mesure (2026-09-07)

Le bloc n'existait pas : `ds.realisations` est la **14ᵉ racine** de l'intégration (`scripts/odoo/lib/repo-data.ts`,
`ROOT_CONTRACT_IDS` + `ROOT_SELECTOR`) ; sa fermeture tire `ds.realisation` en plus.
Instance : **`piqueray-odoo-pilote` (8087)**. Page : **`/realisations-test`**.

### Ce qui a été écrit

`views/components.xml` : deux gabarits — `realisation` (la tuile) et `s_pqr_realisations` (la section, en-tête à plat
+ grille + `t-foreach` + gabarit inerte). Le vocabulaire de liste réutilise celui du composeur
(`data-pqr-carte-list` / `-blueprint` / `-marker`) au lieu d'en inventer un : `compose_page.py` ne connaît que
celui-là. `views/snippets.xml` : le bloc est posable. `config/realisations.authoring.json` (**NOUVEAU**, généré par
`.page-parity/gen-authoring-realisations.mjs` sur le modèle de celui des produits) : 9 contrôles, 10 parts.
`static/src/css/responsive/realisations.pqr.css` (**NOUVEAU**) + son entrée de bundle.
`authoring/pages/realisations-test.json` (**NOUVEAU**) + **9 photos exportées du candidat Figma** vers
`authoring/assets/rlz1..9.jpg` — sans elles, la comparaison aurait porté sur des contenus différents.

### Faits CODE-ONLY (feuille responsive, chacun commenté)

1. **L'axe `enTete`.** Le contrat le dit par `visibleWhen`, mais `emit-html` ne projette pas la visibilité
   conditionnelle : les deux formes vivent dans le DOM et la classe de composition en masque une.
2. **La grande tuile sur 2×2 cellules.** `layout.columns` ne gouverne que des pistes égales ; les spans sont un
   CARRY-CODE-ONLY déclaré. Règle bornée à `.realisations__Grille > .realisation:first-child`.
3. **L'axe `presentation` par viewport.** Aucun QWeb ne pose `.realisations--presentation-<mode>` : les valeurs par
   variante sont re-portées par leur **variable de jeton**, jamais par un chiffre.

### La mesure — bloc contre planche, MÊME contenu

| largeur | planche Figma | bloc Odoo | écart de hauteur | **diff** |
|---|---|---|---|---|
| 390 | 390×1500 | 390×1500 | **0** | **0,54 %** |
| 834 | 834×2660 | 834×2660 | **0** | **0,26 %** |
| 1200 | 1200×1146 | 1200×1146 | **0** | **0,16 %** |
| 1728 | 1728×1551 | 1728×1551 | **0** | **0,72 %** |

*(Chiffres après la reprise du padding vertical — voir la section suivante. Avant elle : 1404 / 2532 / 968 / 1295
et 0,58 · 0,27 · 0,19 · 0,91 %.)*

Boîtes identiques aux quatre largeurs, largeur ET hauteur. Triptyques relus avant d'annoncer le chiffre
(règle 017) : **les trois panneaux portent du contenu**, le rouge est du lissage de texte et des bords de photo.
Sonde (`.page-parity/probe-realisations.mts`) : gouttières 24/48/56/89, colonnes 2/2/4/4, écarts 16/64/64/64,
tuiles 342+163 · 738+337 · 512+224 · 743+339,5, titre 24/30 · 24/30 · 32/40 · 40/50, alignement centre/centre/
gauche/gauche — **conforme au contrat aux quatre largeurs**.

### Deux défauts trouvés par la MESURE, pas par la lecture

1. **Le titre du candidat Figma était figé à 40/50 sur les quatre écrans.** Symptôme : à 1728 le bloc tombait à
   1,19 % mais à 390 il montait à 60,18 %, uniquement par décalage de hauteur (−110 px). Cause : l'en-tête était une
   **instance de `SectionHeader`**, exactement le défaut que les autres sections de la vague 031 ont déjà corrigé en
   dessinant l'en-tête **à plat** (le commentaire est écrit noir sur blanc dans le QWeb de Réassurances). Les 8
   variantes ont été mises à plat, le style de texte **H2** posé et les liaisons `typography/h2/*` re-faites.
   **Fausse piste écartée par la mesure** : j'ai d'abord accusé les plages de gras (le piège consigné à la vague
   034 : « après `setRangeFontName`, la liaison de taille ne s'applique plus »). Rendre la police uniforme **n'a
   rien changé** — la taille restait 40. Le vrai manquant était le **style de texte**.
2. **`titre` était déclaré en texte plat alors que la source porte du gras.** Trouvé par le **test d'édition** :
   première passe, le rédacteur enregistre → `<strong>industrielles et installations</strong>` **déplié**, le gras
   perdu. La garde de saisie faisait son travail sur un type faux. `titre` passe en **`rich-text`** (marque `strong`
   gouvernée par `font.weight.bold`), `data-pqr-marks="strong"` posé sur le `h2`, mécanisme d'authoring aligné.
   Seconde passe : le gras **survit** (relu sur la page publique). Rouge puis vert.

### Le test d'édition (RPC 200)

Titre modifié → enregistré (**200**) → relu en public → conservé, **avec son gras**. Paragraphe : le rédacteur
**ajoute** une plage forte, elle survit (3 plages fortes relues en public). Original remis par recomposition,
page publique re-vérifiée.

### Déviations nommées

1. **`fill_list` ne pose pas l'`alt` par item** : les 9 tuiles servent l'alt du gabarit inerte
   (« Nouvelle réalisation »). Le contrat porte bien `imageAlt` par photo ; c'est le composeur qui ne le transporte
   pas. Défaut d'accessibilité réel, **non corrigé** (toucher `compose_page.py` sort du périmètre) — à reprendre.
2. **Pas de panneau Figma** pour ce bloc : `figma-panels.json` reste à 21 entrées. Un panneau demande une classe
   d'option et son gabarit dans l'addon ; aucune porte ne l'exige, et le bloc fonctionne sans.
3. **`ds.realisation` garde son axe `Taille`**, inerte. Décision owner en attente.

### État des portes

| porte | état |
|---|---|
| `npm run build` · `geometry:gate` · `emitters:check` | **vert** |
| `npm run odoo:authoring:check` · `odoo:module:check` (23/23) · `mint:check` | **vert** |
| `npx tsc --noEmit` | **vert** |
| `npm run parity` | **vert — « No new drift », 19 acquittements, aucun patch accepté** |
| `npm run odoo:inputs:check` | **rouge sur `contracts/realisations.contract.json`** — attendu, repin orchestrateur |
| `npm run eval` | **non lancé** (règle : orchestrateur, worktree partagé) |

### Worktree partagé — à ne pas confondre avec ce chantier

`contracts/{accordion-row,button,faq}.contract.json` et leurs surfaces générées sont modifiés par **une autre
session** (chantier FAQ, visible aussi sur la page 031 : section « 031 · FAQ — options » et set `FAQ` 2773:27504).
Non touchés ici, signalés.

### Piège de canevas à ne pas rediscover

**Dans une SECTION Figma, `node.x` / `node.y` d'un enfant sont RELATIFS au cadre, pas absolus.** Poser
`enfant.x = section.x + 120` envoie l'enfant à `section.x + (section.x + 120)` — mes deux sections sont restées
visuellement **vides** pendant plusieurs échanges alors que les relevés numériques semblaient bons. La vérification
qui l'a montré est une **capture**, jamais un compte : c'est la leçon 017 sous une autre forme.


---

## Le padding vertical, repris sur question owner (2026-09-07)

**Question owner** : « quid du padding vertical ? pour ce cas il en faut ? vu que bg color ? » — et la réponse est oui.

J'avais posé `padding-block: 0` en appliquant la règle de la vague 031 (« le rythme vertical appartient au conteneur
de page »). **Cette règle ne vaut pas quand la section PEINT une bande.** La preuve est dans le dépôt, pas dans mon
jugement :

| section | fond | padding vertical |
|---|---|---|
| `ds.coordonnees` | **bleu clair** | **48**, porté par son `wrapper` |
| `ds.faq` | blanc (= fond de page, bande invisible) | 0 |
| `ds.categories-principales`, `ds.presentation`, `ds.reassurances`, `ds.texte-seo` | aucun | 0 |

`ds.realisations` peint `{color.bleu-clair}` : sans padding, le titre colle au bord haut de la bande et la dernière
rangée de photos au bord bas. **Valeurs posées : 48 · 64 · 89 · 128** (Mobile → Wide), liées aux jetons `space.*` et
au canevas. **Seul le 128 de Wide a un témoin** — le master v1 porte 128 en haut et en bas ; les trois autres suivent
l'échelle du dépôt et sont réversibles d'un mot.

**Le contrôle qui valide la reprise** : avec 128, la variante Wide retombe à **1550,5** — la hauteur exacte du master
v1 `2117:4691`. Le padding n'a pas été inventé, il a été **remis**.

### Piège d'outil, à ne pas rediscover

`exportAsync` se cale par défaut sur les **bornes de RENDU** (`absoluteRenderBounds`), pas sur la boîte déclarée.
Sur le nœud le plus haut (Tablette, 2660 px) il rognait **18 px** : la planche sortait à 2642 et la mesure rapportait
un écart de hauteur qui n'existait pas dans le modèle. Les trois autres largeurs n'étaient pas touchées, ce qui rend
le défaut d'autant plus traître. **Correctif : `exportAsync({ …, useAbsoluteBounds: true })`.** Encore une fois :
c'était le test qui était faux, pas le rendu.

### Portes après la reprise

`build` · `geometry:gate` · `emitters:check` · `odoo:authoring:check` · `odoo:module:check` · `mint:check` ·
`npx tsc --noEmit` · **`parity` (« No new drift », 19 acquittements)** — **tous verts**.
`odoo:inputs:check` reste rouge sur le contrat : repin orchestrateur.
