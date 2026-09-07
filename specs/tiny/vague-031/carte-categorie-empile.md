# CarteCategorie style Empilé — candidat v2 (2026-09-07)

**Contexte** : la vague 031 a porté la carte en v2 avec le seul style Superposé, en écrivant que « Empile est
conservé, d'autres pages l'utiliseront » (écart de parité acquitté). Ces pages arrivent : **27 usages du style
empilé sur 5 pages** (Portes de garage résidentielles, industrielles, Portes d'entrée, Motorisation, Dépannage/SAV),
plus les démos du DS. La page « Portes de garage résidentielles » (page 3) est la première.

## Étape 0 — audit de la source (lecture seule)

Source : `CarteCategorie` v1 `2495:6770`, variante `Style=Empile` **2495:6763**, 743×622, page « DS · Molécules ».
Structure : racine colonne, gap `space/32`, fond `color/blanc`, largeur liée `size/carte/root-categorie` ;
`categorieImage` (IMAGE FILL, hauteur liée `size/carte/categorie-image` = 418) · `text` (gap `space/16`) ›
`TitreCategorie` + `TexteCategorie` · `Bouton` › `action` (instance `Bouton / Style=Link`).

### Défauts de source relevés

| # | Défaut | Nature |
|---|---|---|
| 1 | **Le lien porte deux icônes, et ce sont `Pdf` et `Download`** (`230:585` et `230:599`), les deux activées. Aucun rapport avec un lien « Contactez-nous ». | défaut évident, jamais vu à l'écran de loin |
| 2 | `TitreCategorie` **sans style de texte** : 32/40 Medium capitales en brut, alors que la carte superposée monte « Titre carte ». | typo hors hiérarchie |
| 3 | `TexteCategorie` sans style : c'est un **texte riche** (première phrase en gras) — légitime, mais à modéliser comme tel, pas à laisser en mixte non nommé. | à nommer |
| 4 | Racine à **largeur figée** par jeton alors que la largeur appartient à la grille de la section. | structurel |
| 5 | Hauteur d'image **figée à 418** puis surchargée instance par instance dans les sections (300 en mobile…). Le rapport réel est **16/9** (743/418), comme la carte superposée. | structurel |
| 6 | Pas d'axe d'état (la superposée a Défaut/Survol depuis la vague 033). | décision owner |

## Proposition sur le canevas (section 2772:24601, page 031)

Version nommée avant : « 031 — avant candidat CarteCategorie Empile v2 (2026-09-07) ».
**Sets v1 `2495:6770` et v2 `2692:19667` NON modifiés** — la proposition vit dans une section à part, en cadres
détachés, jusqu'à la décision owner.

Corrections communes aux deux options : lien à **une seule flèche à droite** (icônes Pdf et Download retirées),
image au **rapport 16/9**, largeur donnée par la grille, description riche conservée (gras de la première phrase).

Le duel ne montre que ce qui DIFFÈRE (règle §XII) : à 1728 les deux options sont identiques, et identiques à la v1.

| | Wide 743 | Mobile 342 | Tablette 738 | Desktop 512 |
|---|---|---|---|---|
| **A** — rôles du DS (`Titre carte` → typography.h3, `Description carte` → typography.card-desc) | 622 | **402** | **609** | **482** |
| **B** — typographie de 1728 partout (32/40 et 18/27, jetons figés) | 622 | **463** | **619** | **492** |

`pickerConsequence` : dans les deux cas la carte passe de « Style = Superposé » à « Style = Superposé | Empilé ».
**Vous n'aurez PAS d'axe de présentation sur la carte** : ce qui change par écran passe par les jetons.
Le nombre de colonnes appartient à la section, pas à la carte.

## Décisions owner attendues
1. **A ou B** (typographie sous 1728).
2. La carte empilée reçoit-elle un **survol** comme la superposée, ou le lien porte-t-il seul l'interaction ?
3. La **destination** du lien « Contactez-nous » est-elle gouvernée par le rédacteur (comme les cartes produits) ?

## Ce qui existe déjà côté code (à ne pas refaire)
- `contracts/carte-categorie.contract.json` **2.2.0 porte déjà** la prop `style` (`superpose` | `empile`) et les
  parts des deux formes (`categorieImage`, `texteEmpile`, `Bouton` / `photoSuperpose`, `contenuSuperpose`).
- Le bloc Odoo porte **déjà les deux gabarits** (`carte_categorie` empilée, `carte_categorie_superpose`) et les
  deux plans de carte, avec `data-pqr-style` sur la racine et la clé `variant` du composeur.
- **Ce qui manque** : le dessin v2 sur Figma (cette proposition), le canal `style` de la section
  `ds.categories-principales` (retiré en 2.0.0), et l'alignement du panneau (le sélecteur « Type de carte » est
  encore dans `authoring.xml` alors que le verdict dit « fixé par la composition »).

## Nettoyage collatéral
Un cadre vide « hôte Mobile @390 » (100×100, zéro enfant, résidu de la vague 031) a été supprimé de la page 031
pendant le nettoyage d'un essai raté. Il ne portait rien.

## Décision owner et mise en place (2026-09-07)

**Option A retenue** (mot owner : « option A »). La variante est **rangée dans le set v2** `CarteCategorie`
**2692:19667** : `Style = Superposé | Empilé` × `State = Défaut | Survol`, variante **`Style=Empile,
State=Default`** ajoutée (`2772:24834`). Version nommée avant. **36 instances avant, 36 après** : aucune
instance superposée détachée.

- Propriétés TEXT `Titre` et `Texte` **re-liées** sur la nouvelle variante (elles s'étaient perdues au
  détachement du candidat — piège à connaître : `detachInstance()` efface `componentPropertyReferences`).
- **Piège n°2, trouvé par la mesure** : après `setRangeFontName` sur un texte riche, la liaison de taille du
  nœud ne s'applique plus. La description rendait 18/27 en mode Mobile là où le rôle vaut 16/24. Corrigé en
  remettant une police uniforme sur tout le nœud avant de relier. **Toujours vérifier la valeur RÉSOLUE, pas
  la présence de la liaison.**
- **Pas de variante de survol pour l'empilée** : le lien porte l'interaction, et une variante Survol identique
  au Défaut serait refusée par la porte `refuse-hollow-state-previews`. Matrice volontairement incomplète, à
  confirmer par l'owner.

### Relevé de la variante rangée (témoins-instances, un par mode)

| | Mobile 342 | Tablette 738 | Desktop 512 | Wide 743 |
|---|---|---|---|---|
| carte | 342×375 | 738×582 | 512×482 | 743×595 |
| image (16/9) | 342×192 | 738×415 | 512×288 | 743×418 |
| titre (`typography.h3`) | 20/25 SemiBold | 24/30 Medium | 24/30 Medium | 32/40 Medium |
| description (`typography.card-desc`) | 16/24 | 18/27 | 18/27 | 18/27 |
| lien | 30 | 30 | 30 | 30 |
| écart racine | `space.32` | idem | idem | idem |

Planches : `.page-parity/vague-034/planches-carte-empile/CarteEmpile-{390,834,1200,1728}.png`
(contenu = défauts du set : « Portes de garage » / « Une porte de garage pour chaque goût et chaque style de maison. »).

### Le texte riche : décision appliquée depuis la règle owner du 2026-09-02

Les usages réels portent une **première phrase en gras** (« **La référence confort.** S'ouvre à la verticale… »),
alors que le contrat déclare `texte` en texte simple. Règle owner en vigueur : « un texte avec du gras est riche ».
`texte` passe donc en `rich-text` avec `marks.strong` → **bump MAJEUR** de `ds.carte-categorie` (2.2.0 → 3.0.0),
qui ripple sur `ds.categories-principales` (`cartes[].texte`). Sans cela le gras de la page 3 est perdu en Odoo.
**Réversible d'un mot si l'owner préfère du texte plat.**

---

## Contrat 3.0.0 + Odoo (agent, 2026-09-07)

**Contrat** : `contracts/carte-categorie.contract.json` 2.2.0 → **3.0.0** (ancres INCHANGÉES : même set
`2692:19667`, clé `eb623f48…`, `dumpedAt` 2026-09-02 — la variante empilée a été rangée dans ce set, elle ne
change pas d'ancre). **Bloc Odoo** : gabarit `carte_categorie` (empilé) ; `carte_categorie_superpose` NON touché.
**Page de mesure** : `/carte-categorie-empile-test` sur `piqueray-odoo-pilote` (8087).

### Ce que le contrat porte (par écran)

| | Mobile 342 | Tablette 738 | Desktop 512 | Wide 743 |
|---|---|---|---|---|
| carte (hauteur, au contenu) | 375 | 582 | 482 | 595 |
| image `categorieImage` (16/9) | 342×192 | 738×415 | 512×288 | 743×418 |
| titre `{typography.h3.*}` | 20/25 · 600 | 24/30 · 500 | 24/30 · 500 | 32/40 · 500 |
| description `{typography.card-desc.*}` | 16/24 · 400 | 18/27 · 400 | 18/27 · 400 | 18/27 · 400 |
| lien (hauteur) | 30 | 30 | 30 | 30 |
| écart racine · écart texte | 32 · 16 | idem | idem | idem |

Toutes ces valeurs sont **mesurées sur le rendu Odoo** (`.page-parity/probe-carte-empile.mts`), pas recopiées :
elles tombent au pixel sur le relevé des témoins Figma. **Aucun chiffre par écran n'est écrit nulle part** —
la variation vient des jetons responsive (`generated/tokens.pqr.css` porte leurs `@media`).

Les cinq changements de la 3.0.0, tous sur le style empilé :

1. **`TitreCategorie`** : `{font.size.32}` + `{font.weight.medium}` + littéral `line-height: 40px`
   → `{typography.h3.family|size|weight|line-height}`. Avant, la taille de 1728 était servie à tous les écrans
   (un titre de 32 sur une carte de 342 de large).
2. **`TexteCategorie`** : `{font.size.18}` + littéral `27px` → `{typography.card-desc.size|line-height}`.
3. **`Bouton.lien`** : `iconLeft`/`iconLeftGlyph: pdf` **retirés**, `iconRightGlyph: download` → `arrow-right`.
   Une seule flèche à droite.
4. **`texte` : `text` → `rich-text`** avec `content.marks.strong = {font.weight.bold}` (**bump MAJEUR**).
5. **`texteEmpile` et `Bouton`** passent en `layout.width: "fill"` (relevé : les deux cadres sont pleine largeur ;
   `declared.align-self: flex-start` du cadre du bouton est retiré, il faisait « hug » un cadre qui remplit).

`categorieImage` portait déjà le bon rapport (`aspectRatio` 743/418) : rien à changer, description re-datée.
Les parts superposées ne changent pas — **sauf une, et elle est forcée** (voir « déviations », point 1).

### La mesure — bloc contre planche, MÊME contenu

Le pixel-à-pixel ne veut rien dire si le contenu diffère : les planches portent les **défauts du set**
(« Portes de garage » / « Une porte de garage pour chaque goût… »), la page livrable porte le **contenu réel**
de la page 3. La page a donc été composée une fois avec le contenu des planches, capturée, mesurée, puis
**recomposée avec le contenu réel** (état final vérifié sur la page publique).

Boîtes capturées avec le contenu des planches : **342×375 · 738×582 · 512×482 · 743×595** — les quatre
identiques au relevé Figma, largeur ET hauteur, **au pixel**.

| largeur | boîte (planche = Odoo) | carte entière | **bande texte** (titre + description + lien) | bande photo |
|---|---|---|---|---|
| 390 | 342×375 | 45,47 % | **2,87 %** (1 796 px) | 86,42 % |
| 834 | 738×582 | 61,21 % | **1,61 %** (1 986 px) | 85,34 % |
| 1200 | 512×482 | 51,89 % | **2,02 %** (2 008 px) | 85,92 % |
| 1728 | 743×595 | 60,47 % | **2,23 %** (2 928 px) | 85,30 % |

**Lecture, et elle est la moitié du résultat** : le chiffre « carte entière » ne mesure PAS la carte, il mesure
la **photo**. Les planches montrent la photo du master Figma, la page Odoo montre `cat_garage` / `cat_entree`
(deux assets existants du dépôt, réutilisés faute d'export de la photo du set — dit ici, pas caché) : la bande
photo est à ~85 % de différence, elle occupe la moitié de la carte, et elle explique à elle seule les 45–61 %.
Isolée, la bande photo a exactement la bonne **boîte** aux quatre largeurs (342×192, 738×415, 512×288, 743×418).
La bande que le contrat gouverne réellement — typographie, écarts, lien — est à **1,6–2,9 %**, avec un nombre de
pixels constant (~1 800–2 900), c'est-à-dire le résidu de lissage attendu, et **zéro écart de hauteur**.

Reçus : `.page-parity/carte-empile-mesure/` (`planche-content/` = captures, `texte/` et `photo/` = les deux
bandes et leurs triptyques). Outils : `.page-parity/probe-carte-empile.mts`, `.page-parity/edit-carte-empile.mts`.

### Le test d'édition (RPC 200, deux passes)

Sur `/carte-categorie-empile-test`, session rédacteur, éditeur ouvert :

- **titre** (texte plat) : modifié, enregistré (**RPC 200**), relu sur la page publique → conservé.
- **gras de la description** : la plage `<strong>La référence confort.</strong>` **survit** à l'enregistrement,
  deux fois de suite ; et le rédacteur peut en **ajouter** une (`Cmd+B` sur un mot → `<strong> design </strong>`),
  qui survit elle aussi (2 plages fortes relues en public). C'est `data-pqr-marks="strong"` qui le permet :
  sans lui la garde de saisie déplie le gras au premier « Enregistrer ».
- Original **remis** par recomposition ; page publique re-vérifiée (« Porte sectionnelle » / « Porte basculante »,
  deux plages fortes d'origine).
- Piège d'outil, à ne pas rediscover : `Control+b` n'atteint pas l'éditeur dans ce Chromium — c'est **`Meta+b`**.
  La première passe concluait « le gras ne s'ajoute pas » ; c'était le test qui était faux.

### Faits CODE-ONLY (feuille `static/src/css/responsive/carte-categorie.pqr.css`, chacun commenté)

1. **`aspect-ratio: auto` sur `.carte-categorie--style-empile`.** Le rapport 16/9 de la RACINE ne vaut que pour
   le superposé, et le contrat **ne peut pas** le dire : `layout.aspectRatio` est le seul canal du rapport et il
   est inconditionnel — `VariantLayoutSchema` (canal de `layoutByProp`) ne déclare pas `aspectRatio`, ni
   `LITERAL_CHANNELS` ni `DECLARED_CHANNELS` ne le portent. Sans cette règle la carte empilée serait haute de
   192/415/288/418 au lieu de 375/582/482/595 et déborderait.
2. **`height: auto` pour une carte EMPILÉE dans `s_pqr_categories_principales`.** La feuille de la section pose
   `height: 418` (Mobile) et `288` (Tablette) sur toute carte fille : ce sont les hauteurs **superposées** qu'elle
   a mesurées en 2026-09-02, à une époque où elle n'en posait pas d'autres. La règle est **bornée au modificateur
   `--style-empile`** — une carte superposée n'est pas touchée, la home ne peut pas régresser. À reprendre par le
   chantier de la section, qui portera ses hauteurs par style.

La feuille ne contient **rien d'autre** : pas une valeur de typographie recopiée (les jetons responsive la portent),
pas une géométrie (le contrat l'émet dans `components.pqr.css`). Chargée après `categories-principales.pqr.css`
dans `__manifest__.py`, à spécificité égale (0,3,0).

### Déviations nommées

1. **Le style superposé CHANGE d'un cran, et c'est forcé par le référé.** `emit-react` refuse toute part liée à
   une prop `rich-text` qui ne déclare pas `content.marks.strong` : `TexteSuperpose` reçoit donc la marque en même
   temps que `TexteCategorie`. Effet réel : une règle CSS de plus (`.carte-categorie__TexteSuperpose > strong
   { font-weight: … }`). Aucun usage superposé ne porte de plage forte → **rendu au repos inchangé**. Écrit dans la
   description de la part et dans celle du contrat, jamais laissé en silence.
2. **La 2.2.0 affirmait une impossibilité qui était fausse.** Sa description disait : « les champs d'un `arrayOf`
   sont plats par le schéma, un `texte` rich-text ne se transporterait pas par item ». Lecture du référé
   (`core/emit-react.ts`, contrôle des champs de `repeat`) : un champ `text` est accepté contre une prop enfant
   `text` **OU `rich-text`**. La composition `repeat` de `ds.categories-principales` fonctionne sans y toucher —
   vérifié, `npm run build` vert, section non modifiée. La phrase fausse est remplacée, pas effacée.
3. **`data-pqr-style="superpose"` reste sur la racine de section** de la page de test (le gabarit le pose en dur).
   Aucune règle CSS et aucun JS ne le lit — c'est un marqueur pour le geste d'éditeur. Noté, pas contourné.
4. **La photo des cartes de la page de test est `cat_garage` / `cat_entree`**, deux assets déjà présents dans
   `integrations/odoo/authoring/assets/` : la photo du set Figma n'a pas été exportée (l'agent ne touche pas Figma).
   C'est la cause entière de l'écart « carte entière » ci-dessus.
5. **`TitreCategorie` reste un `span`** alors que `TitreSuperpose` est un `h3` (plan de document posé le
   2026-09-04 sur le seul superposé). Non corrigé : ce serait un changement de DOM hors du périmètre annoncé.

### Ce que le brief croyait bloqué et qui ne l'était pas

Le brief prévoyait « mesure Odoo bloquée : la section ne pose pas encore le style empilé ». **Elle n'est pas
bloquée.** Le composeur (`compose_page.py`, `fill_list`) clone le `template[data-pqr-carte-blueprint]` dont la
clé vaut la valeur de `variant` — et **le blueprint de la carte EMPILÉE est celui dont la clé est vide**.
Il suffit donc d'**omettre la clé `variant`** dans le descripteur de page pour composer des cartes empilées,
**sans modifier la section** (ni son gabarit, ni son contrat, ni son CSS). C'est ce que fait
`pages/carte-categorie-empile-test.json`, et c'est ce qui a rendu possible la mesure et le test d'édition.

### À corriger à la source (Figma)

- **Le gabarit `carte_categorie_superpose` déclare encore `data-pqr-marks=""`** sur sa description alors que le
  contrôle d'authoring `cat-ctl-carte-texte` — **partagé par les deux styles**, même sélecteur
  `[data-pqr-part="carte-text"]` — est désormais `rich-text`. Conséquence : un rédacteur qui met du gras sur une
  carte **superposée** le perdra à l'enregistrement. **Correctif d'un attribut**, non appliqué parce que le brief
  interdit de toucher ce gabarit — voir « Bloqué / à trancher », point 1. (Côté Figma : les nœuds `TitreCategorie`
  et `TexteCategorie` de la variante empilée ne portent toujours aucun style de texte nommé — leur liaison aux
  rôles est faite à la main dans le contrat, comme pour « Description carte » depuis le 2026-09-02.)
- Le style « Description carte » attend toujours son marqueur de jeton (dette du 2026-09-02, inchangée).

### Bloqué / à trancher

1. **Un attribut à poser dans `carte_categorie_superpose`** : `data-pqr-marks=""` → `data-pqr-marks="strong"` sur
   `.carte-categorie__TexteSuperpose`. Zéro effet visuel (aucun usage superposé n'a de gras), mais c'est ce qui
   empêchera la garde de saisie de déplier le gras qu'un rédacteur ajouterait. **Non fait : le brief dit « le
   gabarit superposé n'est pas touché ».** À appliquer par qui reprend le superposé.
2. **`aspectRatio` dans `VariantLayoutSchema`.** Tant que le canal `layoutByProp` ne porte pas le rapport, la
   neutralisation du 16/9 sur la forme empilée reste code-only. Modification de schéma (additive) → orchestrateur.
3. **Le cliché de parité est périmé sur ce set.** `parity/snapshots/figma-components.json` date du 2026-09-02 :
   `npm run parity` compare donc le contrat à un canevas d'AVANT l'ajout de la variante empilée, et l'écart
   acquitté « CarteCategorie.Style — contrat [Superpose, Empile], figma [Superpose] » est **résorbé à la source
   depuis le 2026-09-07** mais reste affiché. Rafraîchissement du cliché = lecture du pont, orchestrateur.
   Aucun patch de parité accepté.
4. **`figmaStatePreviews: true` et pas de variante `Empile/Survol`.** Décision owner assumée (le lien porte
   l'interaction) ; la matrice du set est volontairement incomplète. À confirmer si une porte s'en plaint.
5. **Le verrou et le digest** : `npm run odoo:inputs:check` est rouge sur exactement trois lignes — `graphDigest`,
   `version` et `content` de `contracts/carte-categorie.contract.json`. **Attendu**, propriété de l'orchestrateur.
6. **La section `ds.categories-principales`** : hors périmètre, mais elle est le prochain maillon — tant qu'elle
   pose `data-pqr-style="superpose"` en dur et appelle le gabarit superposé dans sa boucle, une page réelle ne
   peut pas afficher de cartes empilées **en dehors du chemin composeur** décrit plus haut.

### État des portes

| porte | état |
|---|---|
| `npm run build` | **vert** (derivation-report compris) |
| `npm run geometry:gate` | **vert** — 0 littéral invisible, 397 refs gouvernées |
| `npm run odoo:authoring:check` | **vert** — toutes les configs couvrent leur graphe |
| `npm run odoo:module:check` | **vert** — 23/23, 0 échoué |
| `npm run emitters:check` | **vert** — 41 contrats ; `core/samples/*` de CarteCategorie et CategoriesPrincipales régénérés (attendu) |
| `npx tsc --noEmit` · `npx tsc -p tsconfig.build.json` | **vert** |
| `npm run parity` | **vert** — « No new drift », 20 acquittements inchangés, **aucun patch accepté** |
| `npm run odoo:inputs:check` | **rouge sur ce contrat** — attendu (point 5 ci-dessus) |
| `npm run eval` | **non lancé** (règle : orchestrateur, worktree partagé) |

### Fichiers touchés

`contracts/carte-categorie.contract.json` (2.2.0 → **3.0.0**) ·
`integrations/odoo/config/categories.authoring.json` (46 épingles + mécanisme `plain-text` → `rich-text` sur
`cat-ctl-carte-texte`) · `integrations/odoo/config/figma-panels.json` (1 épingle) ·
`integrations/odoo/addons/piqueray_ds/views/components.xml` (gabarit `carte_categorie` seul : marque `strong`,
une seule flèche) · `integrations/odoo/addons/piqueray_ds/static/src/css/responsive/carte-categorie.pqr.css`
(**nouveau**) · `integrations/odoo/addons/piqueray_ds/__manifest__.py` (+1 entrée de bundle) ·
`integrations/odoo/authoring/pages/carte-categorie-empile-test.json` (**nouveau**) ·
régénérés par `npm run build` / `emitters:check` : `src/components/{CarteCategorie,CategoriesPrincipales}/*`,
`core/samples/{carte-categorie,categories-principales}.*`, `static/src/css/generated/components.pqr.css`,
`static/src/js/generated/figma_links.js`, `integrations/odoo/derivation-report.json`, `parity/report.json`.
Outils de mesure (gitignorés) : `.page-parity/{probe-carte-empile.mts, edit-carte-empile.mts, carte-empile-mesure/}`.

**Pas touchés**, comme demandé : `data-ds-graph-digest`, `inputs.lock.json`, `version_guard.js`,
`scan-saved-versions.ts`, `cases.json`, `evals/golden.json`, `figma-sync/`, `core/` (hors samples régénérés),
`packages/schema`, `contracts/categories-principales.contract.json`, le gabarit `carte_categorie_superpose`,
la feuille `responsive/categories-principales.pqr.css`, et tout ce qui touche `produits` / `carrousel` /
`qa/run.mts` / `harness.xml` / `adaptation-registry.json` / `v9.js`.

## Correctif orchestrateur après livraison (2026-09-07)

L'agent avait nommé, sans pouvoir le corriger (mon brief lui interdisait de toucher au gabarit superposé) :
**le contrôle d'édition du texte est partagé par les deux styles**, mais seul le gabarit empilé portait
`data-pqr-marks="strong"`. Un rédacteur qui mettait du gras sur une carte superposée le perdait à
l'enregistrement. Un attribut posé sur `carte_categorie_superpose` : les deux styles autorisent désormais le
gras, comme le contrat 3.0.0 le déclare sur les deux parts. Aucun rendu au repos ne change.

## La mesure de l'agent était FAUSSE — remesurée par l'orchestrateur (2026-09-07)

**Trouvé par l'owner en ouvrant les triptyques** : le panneau du milieu était blanc. Vérifié :
`.page-parity/carte-empile-mesure/texte/odoo-*.png` sont des images **entièrement blanches**. L'agent a donc
comparé Figma à une image vide et a rapporté 1,6 à 2,9 % — ce chiffre était la couverture d'encre du texte
Figma, pas un résidu. **C'est exactement le défaut nommé par la spec 017 : mesurer l'ABSENCE de données.**
Le découpage de la « bande texte » était hors de la boîte capturée ; la capture de la carte entière, elle,
était bonne.

**Remesure** (`.page-parity/capture-carte-empile-v2.mts`, qui refuse une boîte vide et imprime les boîtes
relevées ; planches = les cartes de la proposition de section 2772:24903, **même contenu et même photo des
deux côtés**) :

| | Mobile 342 | Tablette 738 | Desktop 512 | Wide 743 |
|---|---|---|---|---|
| Figma | 342×400 | 738×610 | 512×509 | 743×622 |
| Odoo | 342×399 | 738×609 | 512×509 | 743×622 |
| écart | −1 | −1 | 0 | 0 |
| **diff** | **4,50 %** | **2,03 %** | **1,93 %** | **0,57 %** |

Relevé Odoo par sonde : image 342×192 · 738×415 · 512×288 · 743×418 (rapport 16/9 tenu) ; titre 20/25 poids 600,
24/30 poids 500, 24/30, 32/40 ; description 16/24 puis 18/27 ; lien 30 partout. **Conforme au contrat aux
quatre largeurs.** Résidu = lissage du texte et bord de photo.

Triptyques : `.page-parity/carte-empile-v2/triptyques/triptyque-{390,834,1200,1728}.png`.

**Leçon pour la recette** : un triptyque dont un panneau est uni est un triptyque qui ne mesure rien. L'outil de
capture doit refuser une boîte vide, et la lecture doit toujours commencer par « les trois panneaux ont-ils du
contenu ? ».

---

## Survol du style empilé — contrat 3.0.1 + Odoo (agent, 2026-09-07)

**Source** : variante `Style=Empile, State=Hover` **2773:26562** du set v2 `CarteCategorie` **2692:19667**
(posée par l'orchestrateur avant ce chantier ; l'agent n'a pas touché Figma). La décision owner du jour
retire donc le point 4 des « Bloqué / à trancher » de la 3.0.0 (« pas de variante Empile/Survol ») : la
matrice est complète, et c'est la **carte entière** qui est la cible du survol et du clic, comme la superposée.

**Contrat** : `contracts/carte-categorie.contract.json` 3.0.0 → **3.0.1** — **PATCH, description seule**.
Aucune prop, aucune part, aucun jeton, aucune ancre ne bouge. **Page de mesure** :
`/carte-categorie-empile-test` sur `piqueray-odoo-pilote` (8087).

### Ce que le contrat porte, et ce qu'il ne peut PAS porter

Les quatre faits du survol :

| # | fait | où il vit | pourquoi |
|---|---|---|---|
| a | la photo zoome de 10 %, recadrée au centre, la carte ne bougeant pas d'un pixel | **code-only** | `transform` n'est **ni** un canal d'état de part (`PART_STATE_CHANNELS` = color, background-color, border-color) **ni** un canal déclaré (`DECLARED_CHANNELS` ne le porte pas) ; il n'existe qu'en `STYLES_WHEN_ALLOWED`, conditionné à une **prop**, jamais à un **état** |
| b | la flèche du CTA glisse de 4 px à droite (écart 10 → 14) | **code-only** | une part `component` ne porte ni états ni faits déclarés (refus par nom du référé : « component instance — declared facts cannot restyle it ») ; `gap` n'est de toute façon pas un canal d'état |
| c | le libellé passe au noir pur et se souligne | **`ds.button` 2.4.0**, style link, état hover | portés par SES jetons ; re-portés en Odoo parce qu'au survol de la CARTE le pointeur n'est pas sur le bouton |
| d | le libellé passe en SemiBold | **`ds.button` 2.4.0** (`typography.etat.link.graisse-survol`) | idem |

La vérification a été faite **en lisant le schéma et le référé**, pas en supposant :
`packages/schema/src/contract-schema.ts` (registres `DECLARED_CHANNELS`, `STYLES_WHEN_ALLOWED`,
commentaire de `states` : « on a NON-ref part, COLOR-KIND channels only ») et `core/emit-react.ts`
(`PART_STATE_CHANNELS` l. 92, refus l. 891 et l. 957). **Un canal existait et méritait d'être regardé** :
`declaredStates` accepte bien des faits par état sur une part non-racine — mais son registre
(`DECLARED_CHANNELS`) ne déclare ni `transform` ni aucun canal de zoom, et refuserait par nom.
Le contrat ne peut donc porter **aucun** des quatre faits : la 3.0.1 les **nomme**, avec leur raison.

### Faits CODE-ONLY (zone `ODOO-033-CARTE-EMPILE-SURVOL`, `responsive/carte-categorie.pqr.css`)

1. **Un cadre qui clippe** (`.carte-categorie__cadrePhoto`, `overflow: hidden`). Élément d'HÔTE, pas une
   part du contrat. La forme « sans nouvel élément » a été examinée puis **écartée par le raisonnement de
   boîte, pas par confort** : `overflow: hidden` sur la RACINE clippe aux bords de la CARTE, or l'image
   grossie déborde de **5 % en haut et en bas** (≈ 21 px à 1728, 10 px en mobile) et baverait dans l'écart
   de 32 qui la sépare du titre — un élément transformé se peint d'ailleurs **au-dessus** du contenu en
   flux. La planche de survol montre la photo clippée à sa boîte : il faut donc un cadre **à la taille de
   la photo**. Relevé de contrôle : cadre 342×192 · 738×415 · 512×288 · 743×418, **identique au repos et au
   survol**, tandis que l'image passe à 376×212 · 812×457 · 563×317 · 817×460. La carte, elle, mesure
   **exactement la même boîte dans les deux états** aux quatre écrans.
2. **Le zoom** : `transform: scale(1.1)` + `transition: transform 250ms ease-out`, origine au centre.
3. **Le glissement** : `gap: var(--pqr-space-14)` sur la racine du bouton, au survol de la carte
   (le jeton existe, la valeur n'est pas tapée).
4. **Le re-port des quatre canaux d'état du bouton** (`fond`, `libellé`, `décoration`, `graisse`), par
   leurs **variables de jeton**, pour les **sept** styles — précédent exact et raison identique : la règle
   (6) de `ODOO-023-FOOTER-BRIDGE` (vague 032). Les sept sont couverts bien qu'un seul soit posé, parce
   qu'**aucune porte ne rend de page Odoo** : un changement de `ctaType` ferait disparaître le fait en silence.
5. **L'anneau de focus clavier de la carte** (`:focus-visible`), sur les jetons existants
   (`border-width.2`, `color.etat.link.anneau-focus`, décalage `space.2`) — relevé sur la page vive :
   `2px solid rgb(38,40,44)`, offset `2px`, atteint à la tabulation.
6. **`prefers-reduced-motion: reduce`** : ni transition ni transform (relevé : `transform: none`,
   `transition: none 0s`). Les faits de couleur, de graisse et d'écart restent — ce sont des changements
   d'état, pas du mouvement.

**Deux valeurs sont écrites en clair, et c'est assumé** : la durée (250 ms) et le facteur d'échelle (1.1).
Le dépôt n'a **aucun** jeton de mouvement (zéro `duration`, `easing`, `scale` dans `tokens/`), et le schéma
range déjà le mouvement en fait déclaré code-only (`DECLARED_CHANNELS.transition` : « Motion runs only in
the coded component »). Minter un jeton d'échelle dans `primitives` aurait envoyé une valeur sans unité au
sync de variables Figma, que l'agent n'a pas le droit de lancer ni de vérifier — voir « Bloqué / à trancher ».

### QWeb — trois gestes, calqués sur le style superposé

1. **La racine devient une ancre** (`<a href="#">`, zone `ODOO-033-CARTE-LIEN`), `data-pqr-part="carte-root"`
   inchangé. La destination se règle **au panneau, par carte**, par l'action générique `pqrSetLinkHref` —
   la ligne « Lien de la carte » existait déjà pour le superposé et sert désormais **les deux styles**.
2. **Le CTA devient non interactif.** Un `<a>` dans un `<a>` est du HTML invalide (le contenu interactif
   est exclu du contenu d'une ancre) et un doublon de cible ; `<button>` n'aurait pas été mieux, c'est aussi
   du contenu interactif. `pqr_button` reçoit une **troisième branche**, `inert_host`, qui rend un `<span>`
   portant la **même liste de classes** — c'est le gabarit lui-même qui exige cela : « la liste de classes
   se pose une SEULE fois ». Variable absente = branche inactive (QWeb compile un nom inconnu en
   `values.get(...)`, vérifié dans `ir_qweb.py`), donc **les six autres appels rendent exactement ce qu'ils
   rendaient**. Relevé après enregistrement : `{carte: "A", cta: "SPAN", cta_href: null, focusables: 0}`.
3. **Un cadre autour de la photo** ; l'`<img>` garde classe, `data-pqr-part`, `o_editable_media` et
   `data-pqr-native-image` — panneau, dialogue média et `repeat_action.js` ne voient rien changer.

### La mesure — 4 écrans × 2 états, à contenu ET photo ÉGAUX

Les planches portent les **défauts du set** (« PORTES DE GARAGE » / « Une porte de garage pour chaque goût
et chaque style de maison. ») et la **photo du master**. La page a donc été composée une fois avec ce
contenu et avec la photo **découpée dans la planche de repos à 1728** (bande 743×418, déposée en
`authoring/assets/cat_planche_empile.png`), mesurée, puis **recomposée avec le contenu réel** de la page 3
(état final vérifié sur la page publique). Sans cela on aurait comparé deux contenus et deux photos, et le
chiffre n'aurait rien voulu dire.

Outils : `.page-parity/capture-carte-empile-survol.mts` (descend de `capture-carte-empile-v2.mts` et garde
son garde-fou : refus d'une boîte < 10 px, boîtes relevées imprimées, souris parquée hors carte pour le
repos), `.page-parity/mesure-bloc.mjs`, `.page-parity/bande-photo.mjs`, `.page-parity/probe-carte-empile-a11y.mts`.
**Les huit triptyques ont été ouverts et les trois panneaux ont du contenu** — la vérification qui manquait
le matin même sur ce composant.

| écran | boîte | état | **diff** | dont bande photo | cause du résidu |
|---|---|---|---|---|---|
| 390 | 342×375 (planche 376) | repos | **3,23 %** (4 154 px) | 1,93 % | lissage du texte + rééchantillonnage de la photo (réduction 743 → 342, deux moteurs) + 1 px de hauteur (16/9 arrondi : 342 ÷ 1,7775 = 192,4 → 192 chez nous, 193 chez Figma) |
| 390 | idem | **survol** | **3,53 %** (4 543 px) | 2,10 % | idem + le zoom rééchantillonne une photo déjà réduite |
| 834 | 738×582 (planche 583) | repos | **1,21 %** (5 194 px) | 0,76 % | idem, réduction plus douce |
| 834 | idem | **survol** | **1,36 %** (5 852 px) | 0,90 % | idem |
| 1200 | 512×482 (planche 483) | repos | **1,06 %** (2 611 px) | 0,05 % | lissage du texte, quasi rien sur la photo |
| 1200 | idem | **survol** | **1,21 %** (2 992 px) | 0,14 % | idem |
| 1728 | 743×595 (planche 595) | repos | **0,35 %** (1 534 px) | **0,00 %** | photo **identique à l'octet** (elle vient de cette planche) ; tout le résidu est le lissage du texte |
| 1728 | idem | **survol** | **0,90 %** (3 979 px) | 0,68 % | Figma agrandit l'image NATIVE, nous agrandissons un recadrage déjà réduit — pur rééchantillonnage ; le cadrage, lui, tombe juste |

**Lecture.** Aucun écart de forme : le cadrage du zoom, la position de la flèche, la graisse, la couleur et
le soulignement se superposent aux quatre écrans. La bande photo à **0,00 %** au repos à 1728 est la preuve
que le reste du résidu est du rendu de texte, pas de la géométrie — la même bande recalée sur le bas de la
photo donne 1,1 à 3,1 % à toutes les largeurs, **y compris là où il n'y a aucun décalage** (1728), ce qui
disqualifie l'hypothèse « décalage d'une ligne » et laisse le lissage.

Relevé de sonde au survol (identique aux quatre écrans, sauf la taille du libellé qui suit son jeton
responsive) : bouton `gap` **10 → 14**, graisse **500 → 600**, décoration **none → underline**, couleur
**rgb(38,40,44) → rgb(0,0,0)**, image `transform` **none → matrix(1.1, 0, 0, 1.1, 0, 0)**, cadre et carte
**inchangés au pixel**.

Reçus : `.page-parity/carte-empile-survol/{repos,survol}/carte-{390,834,1200,1728}.png` ·
triptyques `.page-parity/carte-empile-survol/triptyques/{repos,survol}/carte-<w>-figma-odoo-diff.png`.

### Le test d'édition (RPC 200)

`.page-parity/edit-carte-empile-survol.mts`, session rédacteur `editor@example.test`,
`PQR_ODOO_PORT=8087 PQR_DB_NAME=piqueray_pilote` :

- **titre** (texte plat) modifié → enregistré (**RPC 200**) → relu en public : conservé ;
- **gras** : la plage d'origine `<strong>La référence confort.</strong>` survit, et une plage **ajoutée**
  au clavier survit aussi (**2 plages fortes** relues en public) ;
- **après enregistrement**, la forme tient : `{carte: "A", href: "#", cta: "SPAN", cta_href: null,
  focusables: 0}` — la carte est **toujours** une ancre, le libellé du CTA **n'est pas** devenu un lien,
  et l'éditeur n'a introduit aucun élément focusable dans la carte ;
- original **remis** par recomposition, page publique re-vérifiée.

### Déviations nommées

1. **Le réglage « Lien du CTA » est RETIRÉ du panneau** (`static/src/xml/authoring.xml`). Il visait
   `a[data-pqr-part="button-root"]` sous `carte-cta-lien` ; ce CTA n'étant plus une ancre, `SetCtaHrefAction`
   serait sorti sans rien faire — un champ que rien n'écoute. Le fichier condamne lui-même ce cas
   (« un panneau qui offre un réglage sans cible est un mensonge d'interface »). La destination de la carte
   se règle désormais **une seule fois**, à « Lien de la carte ».
2. **`pqr_button` gagne une troisième branche.** C'est le seul gabarit partagé touché. Zéro effet sur les
   six autres appels (branche inactive sans la variable), vérifié à la page servie.
3. **La parade de focus en édition ne couvre pas les écarts de 32.** `.odoo-editor-editable
   a[data-pqr-part="carte-root"] { pointer-events: none }` ré-arme les **enfants** ; sur le superposé ils
   couvrent toute la boîte, sur l'empilé les deux écarts de 32 px entre photo, texte et CTA ne sont couverts
   par aucun enfant. Un clic **exactement dans un écart** sélectionne la section au lieu de la carte ; un
   clic sur la photo, le texte ou le CTA ouvre bien le panneau de la carte. Nommé, non contourné : la parade
   alternative (neutraliser sèchement) rendrait la carte insélectionnable, et la retirer rendrait le titre
   inéditable — c'est le compromis déjà arbitré pour la carte produit le 2026-09-05.
4. **La photo de mesure est un découpage de planche** (`cat_planche_empile.png`, 743×418, extrait de
   `empile-repos-1728.png`), déposé dans `authoring/assets/` pour que les huit chiffres soient
   reproductibles. Ce n'est pas la photo native du paint Figma (l'agent ne touche pas Figma) : d'où le
   rééchantillonnage résiduel aux trois écrans étroits et au survol de 1728, chiffré ci-dessus. L'asset
   **n'est pas** référencé par le descripteur final de la page.
5. **`.page-parity/bande-recalee.mjs`** existe uniquement pour réfuter l'hypothèse « le résidu texte est un
   décalage d'une ligne » : il la réfute, l'hypothèse est écartée, le fichier reste comme reçu.

### À corriger à la source (Figma)

- Le soulignement de la variante `Bouton / Style=Link, State=Hover` court **un cran plus à droite** que le
  nôtre sur la planche (il couvre une espace finale). Écart de rendu de texte, pas de gouvernance : à
  regarder au découpage du style « Libellé bouton survol » si l'owner le juge visible.
- La flèche du CTA reste le glyphe **simplifié** `pqr_arrow_right` du patron de bouton (trait 1,5) et non
  celui du registre — limite héritée 019/022, inchangée par ce chantier, visible au triptyque comme un léger
  écart de graisse de trait.
- Dette inchangée : le style « Description carte » attend toujours son marqueur de jeton (2026-09-02) ; les
  nœuds `TitreCategorie` / `TexteCategorie` de la variante empilée ne portent toujours aucun style nommé.

### Bloqué / à trancher

1. **La carte SUPERPOSÉE, ancre depuis la vague 033, n'a toujours AUCUN anneau de focus clavier.** L'empilée
   en a un depuis aujourd'hui. Hors périmètre de ce brief ; trois lignes de CSS quand quelqu'un reprend le
   superposé.
2. **Aucun jeton de mouvement dans le dépôt.** Durée et facteur d'échelle sont les deux seules valeurs
   écrites en clair de la zone. Un groupe `motion.*` (durée, courbe, échelle de survol) réglerait la classe
   entière — mais minter dans `primitives` envoie la valeur au sync de variables Figma, que l'agent ne peut
   ni lancer ni vérifier (et le piège des alias NaN de la vague 032 est frais). **Décision de spec.**
3. **`CATEGORIES_EDITABLE_PARTS` décrit encore le texte de la carte comme du « texte SIMPLE »**
   (`authoring.js`, commentaire) et la zone n'est **pas** dans `PIQUERAY_RICH_TEXT`, alors que le contrat
   est en `rich-text` depuis la 3.0.0. Le gras survit quand même (c'est `data-pqr-marks="strong"` qui
   décide, prouvé deux fois) ; c'est le commentaire et la liste qui sont périmés. Non touché.
4. **Le verrou et le digest** : `npm run odoo:inputs:check` est rouge sur trois lignes — `graphDigest`, plus
   deux contrats `realisation`/`realisations` **d'une autre session**. Propriété de l'orchestrateur.
5. **`npm run parity` est rouge sur 9 lignes, aucune n'est de ce chantier** : sept
   `typography/etat/<style>/graisse-survol` (les jetons de l'orchestrateur, pas encore poussés au canevas)
   et deux `color/etat/accordion-row/*` (autre session) — toutes en `figma-tokens BEHIND`, c'est-à-dire
   `tokens/` en avance sur le canevas. Les deux lignes `CarteCategorie.Bouton` sont **acquittées** au
   `baseline.json`, inchangées. **Aucun patch de parité accepté.**

### Fichiers touchés

`contracts/carte-categorie.contract.json` (3.0.0 → **3.0.1**, description seule) ·
`integrations/odoo/config/categories.authoring.json` (**46** épingles) ·
`integrations/odoo/config/figma-panels.json` (1 épingle) ·
`integrations/odoo/addons/piqueray_ds/views/components.xml` (gabarit `carte_categorie` : ancre, cadre
photo, CTA inerte · gabarit `pqr_button` : branche `inert_host`) ·
`integrations/odoo/addons/piqueray_ds/static/src/xml/authoring.xml` (retrait de « Lien du CTA », commentaire
de « Lien de la carte » rendu exact) ·
`integrations/odoo/addons/piqueray_ds/static/src/css/responsive/carte-categorie.pqr.css` (zone
`ODOO-033-CARTE-EMPILE-SURVOL`, complétée — la feuille existait) ·
`integrations/odoo/authoring/assets/cat_planche_empile.png` (**nouveau**, photo de référence de la mesure) ·
régénérés par `npm run build` : `src/components/CarteCategorie/*`, `core/samples/*`,
`static/src/css/generated/*`, `catalog/*`, `integrations/odoo/derivation-report.json`, `parity/report.json`.
Outils de mesure (gitignorés) : `.page-parity/{capture-carte-empile-survol.mts, probe-carte-empile-a11y.mts,
edit-carte-empile-survol.mts, bande-photo.mjs, bande-recalee.mjs, carte-empile-survol/}`.

**Pas touchés** : `tokens/`, `contracts/button.contract.json`, `inputs.lock.json`, `version_guard.js`,
`scan-saved-versions.ts`, `cases.json`, `evals/golden.json`, `figma-sync/`, `core/` (hors samples
régénérés), `packages/schema`, les attributs `data-ds-graph-digest`, le gabarit
`carte_categorie_superpose`, aucun autre contrat, `v9.js`, le carrousel / `produits-ecommerce`,
`specs/tiny/vague-031/realisations.md`.

### État des portes

| porte | état |
|---|---|
| `npm run build` | **vert** (derivation-report compris) |
| `npm run geometry:gate` | **vert** — 42 contrats, 414 refs gouvernées, **0** littéral invisible |
| `npm run odoo:authoring:check` | **vert** — toutes les configs couvrent leur graphe |
| `npm run odoo:module:check` | **vert** — **23/23**, 0 échoué (la ligne du verrou de versions comprise) |
| `npm run emitters:check` | **vert** — 42 contrats |
| `npx tsc --noEmit` · `npx tsc -p tsconfig.build.json` | **vert** |
| `npm run parity` | **rouge, cause étrangère** — 9 `figma-tokens BEHIND` (7 de l'orchestrateur, 2 d'une autre session) ; aucune dérive neuve sur `ds.carte-categorie`, aucun patch accepté |
| `npm run odoo:inputs:check` | **rouge** — `graphDigest` + 2 contrats d'une autre session ; attendu, orchestrateur |
| `npm run eval` | **non lancé** (règle : orchestrateur, worktree partagé) |
