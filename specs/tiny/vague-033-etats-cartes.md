# Vague 033 — les trois cartes répondent au geste

**Date** : 2026-09-05 · **Branche** : `oceanic-oak` · **Décision owner** : A3 · B2 · C3, prise sur planche Figma.

## Ce qui a été livré

| Contrat | Version | Survol |
|---|---|---|
| `ds.carte-categorie` | 2.1.0 → **2.2.0** | voile noir 55 % **sous** le dégradé, style superposé uniquement |
| `ds.product-card` | 3.0.0 → **3.1.0** | `0 8px 24px rgba(0,0,0,.12)` sur la racine |
| `ds.review-card` | 4.0.0 → **4.1.0** | `0 12px 32px rgba(0,0,0,.20)` sur la racine |

Jetons : `color.noir-voile-55` (littéral, **primitives**), `shadow.etat.product-card.survol` et
`shadow.etat.review-card.survol` (`$type: string`, primitives, même forme que `decoration.etat.*` de
la vague 032), `color.etat.carte-categorie.voile-survol` (**alias, semantic**).

Le placement des couches n'est pas décoratif : un alias posé dans `primitives` est passé à `hexToRgb`
par le script de sync et peint une variable **NaN, en silence** — piège nommé par la vague 032, respecté ici.

## Mesures — page Odoo rendue, pas déduites

| | repos | survol |
|---|---|---|
| CarteCategorie (`contenuSuperpose`, background-color) | `rgba(0,0,0,0)` | `rgba(0,0,0,0.55)` |
| ProductCard (racine, box-shadow) | `none` | `0 8px 24px rgba(0,0,0,0.12)` |
| ReviewCard (racine, box-shadow) | `none` | `0 12px 32px rgba(0,0,0,0.20)` |

Contraste du texte de la CarteCategorie **au repos** : 17,3:1 (description), 18,3:1 (titre). AAA
commence à 7:1. **Le survol n'est donc pas une correction de lisibilité** — c'est un signal
d'interactivité, et c'est écrit dans le contrat pour qu'aucune relecture ne le justifie autrement.

## Les deux choses que la mesure a corrigées

**1. Une hypothèse tirée du code, démentie par l'exécution.** La lecture du CSS généré montrait la
bordure de `ds.review-card` dessinée en `box-shadow: inset 0 0 0 <w> <c>` ; on en a conclu qu'une
ombre de survol la remplacerait et ferait disparaître le contour. Le jeton a d'abord porté une couche
inset pour le re-déclarer, avec un `#F4F6FA` figé en dur. **Faux** : dès que le canal `box-shadow` est
utilisé par un état, l'émetteur bascule de lui-même la bordure en `border` réel. Relevé sur la page :
au repos `border: 1px solid rgb(244,246,250)`, `box-shadow: none`. Couche inset retirée.

*La lecture avait raison sur le mécanisme et tort sur la conséquence. Seule l'exécution a tranché.*

**2. L'effet de bord de ce basculement, quantifié — et il touche le repos.** Avec `border: 0` + ombre
inset, le 1px ne consommait pas de place ; avec un `border` réel en `border-box`, il en consomme. La
boîte extérieure de la carte ne bouge pas (posée par la grille, `width: 100%`) donc **rien ne se
décale dans la page**, mais la boîte de contenu passe de **198 à 196 px**. C'est le seul changement au
repos de la vague, il est inscrit dans le contrat, au même endroit que la phrase « le repos ne bouge
pas » des deux autres cartes.

## La limite qui a décidé de la forme

Le dégradé lui-même **ne peut pas varier par état** : il vit sur une part NON-racine
(`contenuSuperpose`), et le canal d'états d'une part non-racine n'accepte que de la couleur
(`PART_STATE_CHANNELS` : `color`, `background-color`, `border-color`). Accentuer ses arrêts au survol
aurait demandé d'élargir ce canal au `background-image` — modification d'émetteur touchant les 39
contrats. Écartée par l'owner au profit du voile. **Limite nommée, pas un oubli.**

## Canevas — geste d'écriture sur le fichier client

Trois masters amendés **en place**, sur la page « 031 · Planches de validation ».

| Master | avant | après | instances avant | instances après |
|---|---|---|---|---|
| `CarteCategorie` `2692:19667` | `Style=Superpose` | + `Etat=Defaut\|Survol` | **30** | **30** |
| `ReviewCard` `2731:9375` | `Avatar=Initiale\|Photo` | + `Etat=Defaut\|Survol` (4 variantes) | **66** | **66** |
| `ProductCard` `2693:21081` | COMPONENT simple | **COMPONENT_SET** `2763:10149`, axe `Etat` | **52** | **52** |

Méthode, et c'est ce qui protège les instances : les variantes existantes sont **complétées** au
défaut du nouvel axe (renommage, nœud et identifiant conservés), jamais recréées. Le composant
`2693:21081` devient la variante `Etat=Defaut` et **garde son identifiant** ; les 52 instances y
restent attachées. Comptes relevés avant et après chaque geste — c'est la §X appliquée aux instances,
pas seulement aux pixels.

4 variables créées : `color/noir-voile-55`, `shadow/etat/product-card/survol`,
`shadow/etat/review-card/survol` (Primitives) et `color/etat/carte-categorie/voile-survol` (Semantic,
alias de la première).

`contracts/product-card.contract.json` change d'ancre en conséquence :
`nodeId 2693:21081 → 2763:10149`, `componentSetKey` mis à jour.

## Ce qui reste ouvert, nommé

**`parity/snapshots/figma-components.json` et `figma-tokens.json` n'ont pas été rafraîchis.** Le
rafraîchissement passe par `parity/extract-figma.plugin.js` et le pont **figma-console**, tombé en
cours de session et jamais revenu. Les gestes canevas ci-dessus ont donc été faits par l'autre route
(MCP Figma officiel), qui sait écrire mais ne produit pas le cliché de parité.

Conséquence exacte : `npm run parity` compare le contrat à un **canevas périmé**. Les sept constats
ouverts par la vague sont acquittés par leur nom dans `parity/baseline.json` (40 → 47) — précédent
spec 015. Ils décriront la réalité **jusqu'au prochain rafraîchissement**, où ils devront être
**retirés** de la baseline, pas reconduits. C'est la dette de cette vague, et elle a un nom.

## Portes

`build` · `parity` · `eval` **248/248** · `plugin:check` · `roundtrip` · `geometry:gate` ·
`core-browser-check` · `tsc` (× 2) · les six portes `odoo:*` — toutes vertes.

Module `19.0.1.13.0 → 19.0.1.14.0`, `graphDigest` repiné, 5 miroirs suivis.

## Note de coordination

Une autre spec (**033 — pied de page contact**) travaillait dans le **même worktree** pendant cette
vague. Seuls les fichiers de cette vague ont été commités ; `models/website.py`, `views/footer.xml`,
`footer.authoring.json`, les scénarios QA du footer et `specs/033-*` sont restés intacts. L'entrée
« Recent Changes » de `CLAUDE.md` n'a **délibérément pas** été écrite, pour ne pas écraser la sienne :
à poser au merge.

---

# Le survol du lien prend une graisse — et l'écart de source du soulignement est refermé (2026-09-07)

## D'où ça vient

La carte catégorie **empilée** n'avait aucun survol. Son seul signal de cible cliquable est le CTA
« CONTACTEZ-NOUS ». L'owner a écarté trois pistes successives avant de trancher : pas de soulignement
du titre (« c'est le texte du CTA qui doit se souligner »), pas de couleur orange sur le libellé, et
un voile photo jugé « pas assez visible du tout ». Décision finale : **zoom photo 10 %** et
**graisse sur le libellé**.

## Deux faits mesurés avant d'écrire, et ils ont changé la réponse

**Le noir pur était déjà là.** `color.etat.link.libelle-survol` pointe sur `{color.noir-pur}` depuis
la vague 032. « Jouer sur le noir » n'ajoutait donc rien : le survol du lien passait déjà de
`#26282C` à `#000000`. Ce relevé a réduit la question de l'owner à une seule inconnue, la graisse.

**Le décalage du gras est d'1 px, pas d'une mise en page.** L'argument classique (Baymard : changer
la graisse au survol décale la mise en page) ne s'applique pas ici. Relevé sur le canevas, libellé
« CONTACTEZ-NOUS » : Medium 155 px, SemiBold 156 px, bouton 189 → 190 px. Ce qui coûte, ce n'est pas
le pixel, c'est la gouvernance — et c'est le fait suivant.

## Le piège : poser une graisse détache le libellé de son style de texte

Première tentative, `lbl.fontName = SemiBold` sur le libellé : **rien ne se passe, en silence**, quand
le nœud est dans une instance ; et sur le master, la graisse s'applique **mais détache le nœud du
style de texte « Libellé bouton »**. Or c'est ce style qui porte la liaison `fontSize →
typography/button/size` : détaché, le libellé de survol aurait cessé de suivre la taille responsive
(16 → 18 en Wide) sans que rien ne le signale.

Correctif : un **style de texte dédié**, `Libellé bouton survol` — Montserrat SemiBold, casse UPPER,
soulignement, `fontSize` lié à la **même** variable responsive que le repos. Le canevas garde donc son
axe typographique.

**Second piège dans le premier** : appliquer un style de texte neuf écrase **tous** les champs du
nœud, `textCase` compris. Le libellé est tombé de 156 à 130 px parce que le nouveau style était en
`ORIGINAL` là où « Libellé bouton » est en `UPPER`. À copier champ par champ depuis le style source,
jamais à supposer.

## Ce qui est posé

**Jetons** (`tokens/semantic.tokens.json`) : `typography.etat.<style>.graisse-survol`, sept styles,
même forme que `decoration.etat.<style>.survol` de la vague 032 — six styles reprennent la graisse du
repos (`font.weight.medium`, leur survol ne bouge pas d'un octet), `link` passe à
`font.weight.semibold`. La matrice est complète parce qu'un jeton manquant est un refus par nom au
build.

**Contrat** `ds.button` **2.3.0 → 2.4.0** (MINEUR, additif) : l'état `hover` de la racine gagne
`font-weight: {typography.etat.{variant}.graisse-survol}`. 264 épingles propagées, `graphDigest`
global repiné (`cac4ddb8… → 67bb51e9…`) dans `version_guard.js`, `scan-saved-versions.ts`, les 14
blocs de `components.xml` et la fixture `version-drift/cases.json`.

**Canevas** : la variante `Bouton / Style=Link, State=Hover` (`2749:17111`) **dessine enfin le
soulignement** que le contrat déclarait depuis la 2.3.0 — écart de source ouvert, refermé ici (§VIII).
449 instances du set Bouton avant le geste, 449 après.

**Carte** : la variante `Style=Empile, State=Hover` (`2773:26562`) est créée dans le set
`2692:19667`, qui n'en portait que trois sur quatre. 52 instances avant, 52 après. Quatre témoins de
survol rangés dans la section `031 · CARTE-CATEGORIE — molécule`, un par écran, alignés sur la rangée
de repos ; les onze nœuds d'étude des propositions v1 à v3 ont été supprimés.

## Limite nommée

Le zoom de la photo est simulé sur le canevas par un paint `CROP` dont la matrice conserve le cadrage
`FILL` : Figma n'a pas de `transform`. La projection Odoo, elle, zoome par `transform: scale`. Les
deux disent le même fait, ils ne l'écrivent pas de la même façon — c'est pourquoi la mesure se fait
planche contre bloc, et pas par lecture de propriété.

## État des portes au 2026-09-07 17h40, et ce qui reste ouvert

Vertes : `build` · `geometry:gate` (0 invisible) · `odoo:authoring:check` · `odoo:module:check`
**23/23** · `emitters:check` · `tsc` ×2 · `plugin:check` · `deterministic-roundtrip` ·
`core-browser-check` · **`parity`** (« No new drift », 19 acquittements inchangés, **aucun ajout à la
baseline**).

Les 7 jetons de graisse ont été **posés sur le canevas**, en variables FLOAT de la collection
Semantic aliasant `font/weight/medium|semibold`, à la forme exacte des 26 jetons de graisse déjà
présents. C'est ce qui rend la parité verte sans acquittement neuf, plutôt que de reconduire une
dette que la vague 033 s'était engagée à retirer.

**`npm run eval` : 245/248, et les trois rouges sont nommés.**

1. **`golden-generated-output`** — 35 fichiers générés divergent du manifeste. Le nôtre est
   `Button.module.css` (la règle de graisse au survol), et sa ré-épingle est LÉGITIME. Elle est
   **bloquée** : le même manifeste contient `src/components/Realisations/`, généré depuis un contrat
   d'une **autre session** écrit dans ce worktree à 17h17. Lancer `golden:update` épinglerait son
   travail en cours dans notre changement. À rejouer quand le worktree est calme.
2. **`figma-text-styles-piqueray`** — le recensement attendait 85 liés / 61 propres / 22 riches, il
   mesure 97 / 71 / 24. Les **+2 riches sont à nous** : `ds.carte-categorie` 3.0.0 a fait passer
   `texte` en rich-text ce matin, ses deux parts de texte entrent au compte riche. Le reste vient des
   contrats `realisation` / `realisations` de l'autre session. Précédent explicite dans le
   commentaire même de la fixture (2026-09-05, chantier Avis Google) : un chantier concurrent qui
   déplace le recensement est **nommé**, et **sa clôture re-mesure**.
3. **`preservation-013-clobber-detected`** — attend 3 écrasements injectés, en trouve 6, sur
   `ds.footer`, `ds.faq`, `ds.reassurances`. **Aucun contrat de cette vague.**

**Le digest de graphe est disputé.** Deux sessions écrivent des contrats dans ce worktree : il est
passé de `cac4ddb8` à `67bb51e9` (nous), puis `a290ca83` (elle), puis `4e9098f5` (verrou repiné et
réaligné sur les 19 emplacements). Il rebougera à sa clôture. **À revérifier au merge**, ce n'est pas
un chiffre à recopier depuis ce document.

## Rangement de la page « 031 · Planches de validation » (2026-09-07, fin de journée)

Demande owner : les trois chantiers du jour (survol de la carte, FAQ, Réalisations) étant finis,
rendre la page lisible. Version Figma nommée posée avant le geste.

**Ce que le rangement a RÉVÉLÉ, et qui n'était pas visible à l'œil :**

- **`031 · HERO — 4 variantes` ne contenait pas le Hero.** Elle contient le set `HeroVideo`
  (`2689:15832`, ancré par `ds.hero-video` 2.1.0). Le vrai Hero v2 (`2770:20976`, `ds.hero` 3.0.0)
  vivait dans une section appelée « HERO IMAGE ». Deux étiquettes fausses, corrigées.
- **La section `PRESENTATION` était MASQUÉE et imbriquée DANS la section
  `CATEGORIES-PRINCIPALES`.** Son set (`2693:20805`) est pourtant l'ancre de `ds.presentation`
  4.2.0, un composant gouverné à part entière. Sortie à la page, rendue visible, placée à son rang.
- **Deux nœuds de texte vides** (largeur 0, chaîne vide) traînaient à l'origine de la page. Supprimés.
- Cinq sections portaient encore « (candidat v2) » alors que leur set est ancré par un contrat
  adopté. Le suffixe est retiré partout.

**La règle de nommage retenue** : `031 · NN · NOM — ds.<contrat>`, plus ` · molécule` quand c'en est
une. Le numéro donne l'ordre de lecture du site (header → menu → hero → … → footer), et une molécule
précède la section qui la compose. Le nom du contrat est dans l'étiquette, PAS sa version : une
version dans un nom de calque devient fausse au premier bump et personne ne la corrige.

Colonne unique à x = −12000, écart 300, chaque cadre réajusté à son contenu. **Zéro chevauchement**,
vérifié dans la colonne ET contre le reste de la page. Les 21 sets sont là, avec leurs variantes et
leurs instances : Header 4, MenuEntree 2, MenuMobile 2, Hero 4, HeroVideo 4, CarteCategorie 4,
CategoriesPrincipales 4, Presentation 4, ProduitsECommerce 4, ProductCard 2, SAV 4, Devis 4,
CarteReassurance 2, Reassurances 4, ReviewCard 4, AvisGoogle 4, AccordionRow 8, TexteSEO 4, FAQ 4,
Realisations 8, Footer 4.

**Fait notable : `Realisations` a 0 instance.** Le set est neuf et n'est encore posé nulle part —
ni maquette, ni témoin. À vérifier à sa clôture.

**Pas touché, et pourquoi** : le grand rectangle gris (`Rectangle 1`, 7294 × 11017) est un fond
VERROUILLÉ et volontaire derrière les démos, pas un débris. Les quatre maquettes de référence
(`Accueil`, `Base -`, `Portes de garage`, `Portes de garage résidentielles`) flottent encore à la
page au lieu d'être dans une section ; les regrouper déplacerait des cadres qui ne sont pas de cette
vague, c'est une décision owner et non un rangement.

## La section Catégories retrouve son axe Style, et la page 3 monte en 4 vues (2026-09-07)

**Pourquoi le réglage revient.** La 2.0.0 avait RETIRÉ `style` le 2026-09-02, et le motif était exact
à sa date : le set 031 ne dessinait que du superposé. La page « Portes de garage résidentielles »
compose ses deux catégories en EMPILÉ. Le set dessine maintenant les deux — passé de 4 à 8 variantes
(Style × Presentation), **12 instances avant le geste, 12 après** — et la carte porte sa variante
empilée depuis la 3.0.0. Le contrat passe donc en **2.1.0, MINEUR additif**, défaut `superpose` :
un consommateur qui ne passe rien ne voit aucun changement.

Le style descend aux cartes par le canal `{style}` du schéma (une prop scalaire du parent
cartographiée dans l'enfant). Le verdict Odoo reste `fixed-by-composition` côté carte : les deux
cartes d'une section portent toujours le même style, ce n'est pas un choix carte par carte.

**Ce qui existait déjà côté Odoo, et qu'il ne fallait pas réécrire.** Le gabarit pose
`data-pqr-style` sur la racine, le panneau offre déjà « Type de carte » avec ses deux entrées
(`pqrSetStyleCarte`), et la feuille `responsive/carte-categorie.pqr.css` neutralise déjà les deux
hauteurs que la section impose au superposé, pour le seul style empilé. **Rien à écrire côté Odoo :
seul le contrat manquait.** La configuration d'authoring portait elle aussi tous ses verdicts, y
compris ceux du Bouton atteint par le CTA empilé ; il manquait UNE ligne, le contrôle de la prop
`style` de la section elle-même, posé en `controlled` / `enum` puisque le rédacteur le choisit.

**Décision owner du 2026-09-07 sur la tablette.** Deux cartes empilées y font 1228 px de haut contre
640 en superposé. La consigne était « que ça reste pareil mais propre » : la tablette garde UNE
colonne, comme le superposé. Basculer à deux colonnes plus tard est une variante à rejouer, pas une
rupture de contrat.

**Le montage de la page 3.** Section `031 · DEMO PORTES DE GARAGE RESIDENTIELLES — 4 vues
(instances v2)`, même recette que les pages 1 et 2 : quatre cadres de 390 / 834 / 1200 / 1728, en
colonne, sans gouttière propre, écarts entre blocs **80 · 80 · 128 · 192**, et le header posé EN
ABSOLU par-dessus (contraintes STRETCH / MIN). Neuf blocs en flux : Hero, Catégories (Style=Empile),
Devis, Réassurances, Réalisations (En-tête=Presentation), FAQ, Avis Google, Texte SEO, Footer.
Hauteurs obtenues : 10008 · 10835 · 6957 · 7568.

**Écart de source qui reste ouvert, nommé.** Le contrat `ds.reassurances` 2.1.0 porte un réglage
`disposition` à trois valeurs (`4Cartes`, `quatrecartesdeuxcta`, `5Cartes`) que **le set Figma v2 ne
déclare pas** : il dessine toujours cinq cartes, aux quatre écrans. La maquette de la page 3 en
montre quatre. Le contrat est en AVANCE sur le canevas — les quatre vues montrent donc cinq cartes.
À refermer à la source, pas à contourner dans la démo.

### Correctif : la démo de la page 3 montait sans son contenu (2026-09-07)

Défaut de ma part, relevé par l'owner. J'avais instancié chaque set à sa variante `Presentation`
et je m'étais arrêté là. Une instance neuve porte le contenu PAR DÉFAUT de son set, et les défauts
des sets ont été relevés sur la maquette **industrielle** : la démo annonçait donc « Portes de garage
industrielles » en hero et « Portes de garage » / « Portes d'entrée » en catégories. Pas un texte
neutre — le contenu d'une autre page. La démo de la page 2, elle, porte bien son vrai contenu : la
marche existait, je l'ai sautée.

Contenu relevé sur la maquette `Portes de garage résidentielles` (2771:23633) et posé sur les quatre
vues, **plages de gras comprises** : titre et sous-titre du hero, les deux cartes catégories
(« Porte sectionnelle » / « Porte basculante », première phrase en gras), titre et texte des
Réalisations, et le bloc Texte SEO en entier.

**Le piège du gras n'a PAS mordu, vérifié plutôt que supposé.** `setRangeFontName` peut faire cesser
la liaison de taille au niveau du nœud (leçon du 2026-09-07 sur la carte empilée). Relevé après coup
sur les quatre vues : le titre du hero fait 32 · 32 · 40 · 54, la description de carte 16 · 18 · 18 ·
18, le paragraphe SEO 16 · 16 · 18 · 18. Les liaisons responsive tiennent.

**Ce qui diffère encore de la maquette, et c'est voulu :**
- Les **Réassurances affichent cinq cartes** là où la maquette en montre quatre — l'axe `Disposition`
  du contrat n'existe pas sur le set Figma. Écart de source déjà nommé.
- Le titre des Réassurances dit « nos portes de garage **industrielles** ». Ce n'est pas un reste de
  défaut : **la maquette elle-même le dit**. Copie à trancher côté rédaction, pas côté composant.
- Les **photos ont été transférées elles aussi**, dans un second passage : 16 paints IMAGE par vue,
  relevés sur la maquette et reposés en `scaleMode` FILL — le fond du hero, les deux cartes
  catégories, les quatre cartes de réassurance et les neuf tuiles de réalisations. Le fond du bloc
  Devis était déjà le bon. La CINQUIÈME carte de réassurance garde la photo du set, faute de source :
  la maquette n'en montre que quatre. Rappel : une photo est hors contrat (route A5), ce transfert
  vaut pour la planche Figma ; côté Odoo elle entrera par le dialogue média au montage de la page.

## Le colonnage des Réassurances : une ligne au lieu d'une grille figée (2026-09-07)

**Le défaut.** En Wide, `columns: 5` était calculé pour le cas à cinq cartes. Avec quatre cartes, la
grille gardait une piste vide et le bloc ne remplissait plus la largeur.

**Ce qu'on n'a PAS fait, et l'owner a eu raison deux fois.** D'abord j'ai proposé de rendre au set son
axe `Disposition` : refusé, et à juste titre — le nombre de cartes est du CONTENU (la collection
`items`, clonée par item au montage, sans plafond), aucun composant du système ne compte ses items
par un axe, et un énuméré aurait créé deux sources pour un seul fait. Ensuite j'ai écrit six règles
CSS de comptage (`quantity queries`) : ça marchait, mais c'était un fait code-only de plus, que Figma
ne pouvait pas dire. L'owner a insisté pour que le composant v2 reflète Odoo. Il avait raison.

**Le correctif, et il tient en une ligne de contrat.** En Wide, la part `items` passe de
`columns: 5` à `display: flex, direction: row`. Les cartes portent déjà `width: 100 %`, donc leur base
de flex est égale, donc le retrait se fait au prorata et **les colonnes sortent exactement égales**.
Le nombre de cartes fait le nombre de colonnes, sans qu'aucun compte ne soit déclaré nulle part.

**J'avais affirmé le contraire, et c'était faux.** J'avais écarté cette piste en invoquant la leçon du
dépôt sur `flex: 1 1 auto` et sa base liée au contenu. Mesuré dans le navigateur : grille et flex
donnent 284,4 à cinq cartes et 363,5 à quatre, au dixième. La leçon ne s'appliquait pas ici, parce que
la largeur à 100 % égalise les bases.

**CARRY-BOTH, et c'est tout l'intérêt.** Le conteneur du Wide passe de la grille Figma à un
auto-layout HORIZONTAL à enfants Fill, qui répartit lui aussi à parts égales. Géométrie du master
identique au centième après le geste : variante 1728×829, cartes 284,4 ×5. Et surtout, **le canevas
reflue maintenant comme le site** : masquer une carte sur une instance donne quatre cartes de 363,5.

Les quatre vues de la démo page 3 et les quatre captures Odoo donnent désormais les **mêmes boîtes** :

| Écran | Figma | Odoo |
|---|---|---|
| 390 | 390×1618 | 390×1618 |
| 834 | 834×1676 | 834×1676 |
| 1200 | 1200×1380 | 1200×1380 |
| 1728 | 1728×772 | 1728×772 |

**PORTÉE : le Wide seulement**, décision owner. Le Desktop garde sa grille de trois colonnes en toutes
circonstances : quatre cartes s'y rangent en 3 + 1, des deux côtés.

**Piège attrapé par la mesure, à ne pas rediscover.** Le générateur émet la règle sous
`.reassurances--presentation-wide`, mais **aucun QWeb ne pose les classes de présentation sur le DOM
Odoo** : c'est la feuille par écran qui les traduit en `@media`. Ma première version supprimait la
règle Wide de cette feuille en croyant le générateur suffisant — le bloc retombait alors sur la grille
à trois colonnes du Desktop, encore active à 1728, et grandissait de 829 à 1281 px. La règle est donc
recopiée dans la feuille, à l'identique du contrat, avec `grid-auto-rows: auto` pour neutraliser le
reliquat de grille.

**La non-régression sur les pages en ligne.** Photographié avant et après sur le pilote, home et
« Portes de garage », quatre largeurs :

| Page | 390 | 834 | 1200 | 1728 |
|---|---|---|---|---|
| Home | 0,0000 % | 0,0000 % | 0,0000 % | **0,0061 %** |
| Portes de garage | 0,0000 % | 0,0000 % | 0,0000 % | **0,0061 %** |

Le résidu de 1728 est nommé, pas balayé : **88 pixels sur 1,43 million**, tous de l'anticrénelage de
texte à l'intérieur des cartes. Les cartes sont aux mêmes abscisses et aux mêmes largeurs à **0,02 px**
près — grille et flex n'arrondissent pas la distribution fractionnaire de la même façon. Aucune
différence de structure ; l'image de différence est archivée.

**Portes** : `build`, `geometry:gate`, `odoo:authoring:check`, `odoo:module:check` 23/23,
`emitters:check`, `tsc`, `parity` — toutes vertes.

**Reste, nommé** : le réglage `disposition` du contrat est inerte des deux côtés (Odoo rend un seul
bouton, Figma en dessine un seul). Reste de v1, à RETIRER par une rupture majeure, pas à brancher.

