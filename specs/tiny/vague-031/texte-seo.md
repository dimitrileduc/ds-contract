# Journal de section — `ds.texte-seo` v2 (pilote, vague 031 suite)

**Date** : 2026-09-07. **Parent** de `ds.accordion-row` (journal `accordion-row.md`). Pilote fait avec l'owner.

## Étape 0 — audit de la source (lecture seule, 2026-09-07)

### Le master

- `TexteSEO` **2108:3123**, COMPONENT simple (pas de set), page « DS · Organisms », section « Texte SEO »,
  dans un cadre `Container · TexteSEO` 1728×383. Description : « generated from contract ds.texte-seo v2.1.0 † »
  (le contrat est en 3.0.0 : le master a une version de retard sur la description).
- Racine : colonne, **pad 0/89** liés `space/89`, **gap 32** lié `space/32`, FILL/HUG. Une seule propriété
  TEXT : `Titre`. Le paragraphe et le sous-titre n'ont **pas** de propriété (les instances les surchargent en brut).
- Enfants, dans l'ordre :
  1. `h2` › `Titre direct` › **Titre** — style « Titre 4 » (24/30 Regular), `color/noir-bleute`, FILL/HUG, se replie.
  2. `p` › **Paragraphe** — **texte riche** (Regular + segments Bold), 14/24, **aucun style** (nœud libre),
     couleur `color/noir` (#37373b — pas noir-bleuté, seul texte du DS dans cette couleur ?), FILL/HUG.
  3. `h3` › **SousTitre** — style « Titre 5 » (20/25 SemiBold), HUG/HUG **ne se replie pas**.
  4. `accordion` — colonne, gap 0, FILL/HUG, 3 instances `AccordionRow` Petit (ligne 2 ouverte).
- Toutes les mesures de boîte sont liées. Le seul brut : le trait des lignes (défaut porté par la molécule).

### Défauts de source

| # | Défaut | Nature |
|---|---|---|
| 1 | Paragraphe et SousTitre sans propriété TEXT : les 9 instances les surchargent en brut (paragraphes de 401 à 813 caractères). Le contrat ne peut pas les lier. | propriétés manquantes |
| 2 | Paragraphe sans style de texte (14/24, Regular + gras) — nœud libre ; aucun rôle DS ne vaut 14 en Wide. | typo hors hiérarchie |
| 3 | SousTitre en HUG : une ligne longue déborde sous 1550 (« Performance et isolation thermique des portes… » fait 40 caractères sur Industrielles). | structurel |
| 4 | Couleur du paragraphe `color/noir` (#37373b) alors que titres et lignes sont `color/noir-bleute` (#26282c). À confirmer comme voulu. | cohérence |
| 5 | Description du master en retard (v2.1.0 vs contrat 3.0.0). | cosmétique |

### Les usages (par position)

9 instances, toutes **FIXED 1728 / HUG**, toutes avec 3 lignes, aucun calque masqué : 8 sur « Pages »
(Motorisation, Résidentielles, Portes d'entrée, Portes de garage, Industrielles 487 de haut, À Propos,
Contactez-nous, Dépannage/SAV) + 1 sur la page 031 (« Portes de garage » de référence). Hauteurs 359 / 383 / 487
selon la longueur du paragraphe. **Aucune référence Mobile / Tablette / Desktop n'existe** : les 4 variantes
seront un candidat construit selon les conventions de la vague.

### Ce que le contrat porte aujourd'hui

`ds.texte-seo` 3.0.0 : props `titre` (rich-text) et `items` (liste titre/contenu/etat) ; anatomie h2 / p / h3 /
accordion avec `repeat` de `ds.accordion-row` en Petit. Bloc Odoo `s_pqr_texte_seo` avec ajout de question.

## Candidat 4 variantes — conventions à appliquer (à valider)

| | Mobile 390 | Tablette 834 | Desktop 1200 | Wide 1728 |
|---|---|---|---|---|
| gouttière (pad-inline) | 24 | 48 | 56 | 89 |
| largeur contenu | 342 | 738 | 1088 | 1550 |
| Titre | H2 24/30 | H2 24/30 | H2 32/40 | H2 40/50 |
| Paragraphe | body 16/24 | body 16/24 | body 18/27 | body 18/27 |
| SousTitre | H4 20/25 | H4 20/25 | H4 24/30 | H4 24/30 |
| gap | 32 (à relever) | 32 | 32 | 32 |
| lignes | AccordionRow v2 Petit | idem | idem | idem |

Question ouverte : Titre en H2 (titre de section) ou H4 (24 aujourd'hui = H4 Wide) ? Aujourd'hui 24 Regular
partout ; H2 le monterait à 40 en Wide, H4 le garderait à 24 en Desktop/Wide et 20 sous 992.

## Candidat v2 sur le canevas (2026-09-07, GO owner « prépare TexteSEO »)

- Version nommée avant : « 031 — avant candidat TexteSEO v2 (2026-09-07) » (id 2396404177620307600).
- Section **2768:20379** « 031 · TEXTE-SEO — 4 variantes (candidat v2) », page 031, sous le candidat AccordionRow.
- Set candidat **2768:20428** (clé `3a13552df8…`), 4 variantes `Presentation=Mobile|Tablette|Desktop|Wide`
  (2768:20380 / 20392 / 20404 / 20416), clonées du master DS 2108:3123 puis combinées. **Mode Responsive posé
  par variante** (règle Figma n°2 : le mode voyage avec le composant). **Original intact**, prouvé après coup :
  master 1728×383, pad 89, « Titre 4 » / « Titre 5 », 1 propriété, 9 instances ; set AccordionRow v1 toujours à 45.
- Sous le set : une **instance de test** (2768:20578, basculer Presentation dans le panneau) et le **duel 1728**
  (option B, 2768:20608).

### Ce que le candidat porte (aucune variable créée)

| | Mobile 390 | Tablette 834 | Desktop 1200 | Wide 1728 |
|---|---|---|---|---|
| pad-inline (lié `space/24·48·56·89`) | 24 | 48 | 56 | 89 |
| largeur contenu | 342 | 738 | 1088 | 1550 |
| gap (lié `space/32`, valeur source) | 32 | 32 | 32 | 32 |
| Titre → style **H2** (SemiBold) | 24/30, 3 lignes | 24/30 | 32/40 | 40/50 |
| Paragraphe → nœud lié `typography/body/*`, gras conservé par plage | 16/24 Regular, 13 l. | 16/24 Regular, 6 l. | 18/27 **Medium**, 5 l. | 18/27 **Medium**, 3 l. |
| SousTitre → style **H4**, FILL + repli | 20/25 | 20/25 | 24/30 | 24/30 |
| lignes → instances **AccordionRow v2** (Petit), FILL | 40 / 168 / 40 | 40 / 96 / 40 | 43 / 105 / 43 | 43 / 105 / 43 |
| hauteur de la variante | 771 | 471 | 492 | 448 |

- Propriété TEXT **`SousTitre`** ajoutée au set (défaut « Infos pratiques ») — défaut de source n°1 corrigé sur le
  candidat. Le **Paragraphe reste sans propriété** (texte riche : règle owner du 2026-09-02, liaison `NONE`).
- Graisse du paragraphe par variante = le jeton `typography.body.weight` (Regular ×2 / Medium ×2), posé par plage
  sur les segments non gras, comme SAV. Les segments gras restent Bold.
- Couleur du paragraphe `color/noir` (#37373b) **conservée** telle que la source (à confirmer, défaut n°4).

### Écarts à revoir avec l'owner

1. **Titre : H2 ou H4 ?** A (dans le set) = H2 → 40/50 SemiBold en Wide (aujourd'hui 24/30 Regular, « Titre 4 »).
   B (témoin 2768:20608) = H4 → 24/30 Medium en Wide, sous-titre body 18/27 Bold. A est la hiérarchie du DS
   (titre de section, comme SAV / Presentation) ; B reste proche du 1728 validé. **Duel 1:1 posé sous le set.**
2. **Gap 32 partout**, valeur source : aucune référence mobile n'existe. Ajustable sur la variante Mobile si trop grand.
3. **Paragraphe Medium en Desktop/Wide** (jeton DS body) : le 1728 validé est Regular 14. Même cause que la ligne :
   la hiérarchie DS n'a pas de rôle à 14.
4. **Couleur du paragraphe** #37373b vs noir-bleuté : source conservée, à trancher.

## Décisions owner (2026-09-07)

- **Titre : A = H2** — mot owner : « ok pr A », sur duel 1:1 à 1728 (A titre H2 40/50 vs B titre H4 24/30). Le duel a
  été retiré du canevas après décision ; le set porte A.
- Gap 32, paragraphe Medium en Desktop/Wide, couleur #37373b : **non contestés** lors de la revue — conservés tels
  quels sur le candidat (à re-signaler si un triptyque Odoo les met en cause).
- Conséquence sur le sélecteur (`pickerConsequence`) : le set TexteSEO gagne l'axe `Presentation{Mobile,Tablette,
  Desktop,Wide}` ; aucune autre variante. Propriétés : `Titre`, `SousTitre` (nouvelle), `Presentation`.

## Entrées préparées pour le portage Odoo (orchestrateur, 2026-09-07)

- Relevé du set candidat : `.page-parity/vague-031/dumps-accordion/TexteSEO.live.dump.json` (dump v1.8, 0 dégradation).
- Proposition : `.page-parity/vague-031/proposals/TexteSEO/` — **25 notes, 0 valeur non liée**. H2 et H4 reconnus
  comme styles responsive (jetons `typography.h2.*` / `h4.*`) ; le paragraphe, lié au nœud sans style, est minté
  (`imported.texte-seo.p-paragraphe.*`) → à renommer vers `typography.body.*` ; les largeurs de racine proposées
  comme jetons sont des témoins (racine `fill`, `referenceWidth 1728`) ; les 3 lignes reconnues comme `repeat` de
  `ds.accordion-row` par clé de set (`7b4cc8de…`).
- Planches : `.page-parity/vague-031/planches-texteseo/TexteSEO-{390,834,1200,1728}.png` (390×771 · 834×471 ·
  1200×492 · 1728×448).

**Leçon (coûteuse, à porter au mode d'emploi)** : l'export PNG d'une VARIANTE dans un set peut rendre une géométrie
périmée — la variante Mobile exportait 683 px (accordéon rendu à 160, la hauteur v1) alors que l'API disait 771,
et six remèdes (nudge de gap, re-création des instances, resize, clip, visibilité, reconstruction depuis Tablette)
n'y ont rien changé. **Une INSTANCE de la même variante rend juste (771, lignes 40/168/40).** Règle : exporter les
planches depuis des instances témoins, jamais depuis les variantes du set. L'instance témoin Mobile est laissée
sous le set (2768:20801) à côté de l'instance de test.

## Contrat 4.0.0 + Odoo (agent, 2026-09-07)

**Entrées** : dump v1.8 du set candidat `2768:20428` (clé `3a13552d…`), proposition `.page-parity/vague-031/proposals/TexteSEO/`
(25 notes, 0 valeur non liée), planches `planches-texteseo/TexteSEO-{390,834,1200,1728}.png`. **Aucun accès Figma, aucune
écriture canevas.** Enfant `ds.accordion-row` **2.0.0** réutilisé tel quel (non modifié). Instance : `piqueray-odoo-pilote` (8087) seulement.

### Classement de chaque note de `figma-proposals.md`

| Note de l'extraction | Classement | Ce qui a été fait |
|---|---|---|
| `semantics.element` par défaut `div` | adopté (comme 3.0.0) | conservé `div` — 3.0.0 disait déjà `div` ; promotion en `section` (SAV, Presentation) non faite ici, à trancher |
| `root padding-inline` fonction de `presentation` (24 / 48 / 56 / 89) → `tokensByProp` | adopté | `space.24` en base + `tokensByProp` tablette/desktop/wide ; gap `space.32` sur les 4 variantes |
| `Titre` roule le style responsive **H2** (24/32/40) | adopté | `typography.h2.{family,size,weight,line-height}` ; SemiBold sur les 4 variantes (dump) |
| `Paragraphe` : typographie variable (16/18, Medium), aucun style, 4+4+1+1 mints `imported.texte-seo.p-paragraphe.*` | **renommé vers jetons existants** (décision owner) | `typography.body.size` / `line-height` / **`typography.body.weight`** (Regular ×2 / Medium ×2 par écran — le mint uniforme 500 était faux pour Mobile/Tablette) ; `letter-spacing 0` non porté (défaut UA, comme 3.0.0) |
| `SousTitre` roule le style responsive **H4** (20/24) | adopté | `typography.h4.*`, Medium (dump) — 3.0.0 portait « Titre 5 » SemiBold de l'ancien master |
| `AccordionRow` : prop `Etat` varie par frère (P10, pas de vocabulaire repeat) | adopté comme 3.0.0 | `etat` dans `arrayOf` + `sample` (Ferme / Ouvert / Ferme), limite « ligne contrôlée » déjà nommée sur la prop |
| `AccordionRow` lié à `ds.accordion-row` par clé de set `7b4cc8de…` | adopté | l'ancre de `ds.accordion-row` 2.0.0 |
| prop `items` code-only (NONE) | adopté | inchangé |
| 3 instances → une part `repeat` | adopté | inchangé |
| largeur racine FIXED → 4 mints `imported.texte-seo.root.width.*` | **supprimé (témoins)** | racine `width: fill` + `referenceWidth: 1728` |
| prop `soustitre` TEXT `SousTitre` | adopté, renommée `sousTitre` (consigne) | liée TEXT `SousTitre` (nouvelle propriété du set) |
| `titre` proposé `text` | **décision** | gardé **`rich-text`** (marks `strong`) comme 3.0.0 pour laisser le gras au rédacteur ; **défaut sans segment gras** — le candidat dessine le titre uniforme SemiBold (`fontStyle: SemiBold` sur tout le nœud), le « showroom à Pepinster » en gras de 3.0.0 venait de l'ancien master |
| `Paragraphe` texte statique | **décision** | devient la prop riche **`texte`** liée `NONE` (règle owner 2026-09-02), défaut = texte du candidat avec ses 6 plages en gras, espaces collés aux bornes reproduits tels quels |
| cadres `h2` › `Titre direct` (gap `space.8`) › `Titre` | **déviation nommée** (comme 3.0.0 et Presentation 4.0.0) | aplatis en une part texte `Titre` `width: fill` (deux enveloppes à enfant unique, le gap n'espace rien) — le DOM Odoo garde son `div.texte-seo__h2` |
| `root counter: MIN` | déviation mineure nommée | porté `align: stretch` (tous les enfants sont FILL, rendu identique) ; `declared.align-self` de 3.0.0 retiré (porté par `width: fill`) |

**Aucun jeton minté** : tout existait (`typography.h2/h4/body.*`, `space.24/32/48/56/89`, `color.noir`, `color.noir-bleute`,
`font.family.montserrat`, `font.weight.bold`). Ancres → set `2768:20428`, `componentSetKey 3a13552df8319a513d0ee623f27c7b571013d96b`,
`dumpedAt 2026-09-07`. Version **3.0.0 → 4.0.0** (MAJEUR : ancres).

### Ce que le contrat porte (par mode)

| | Mobile (base) | Tablette | Desktop | Wide |
|---|---|---|---|---|
| padding-inline | `space.24` | `space.48` | `space.56` | `space.89` |
| gap | `space.32` | idem | idem | idem |
| Titre (H2, SemiBold, noir-bleuté) | 24/30 | 24/30 | 32/40 | 40/50 — par `tokens/modes/viewport.*` |
| Paragraphe (body, `color.noir`, gras = `font.weight.bold`) | 16/24 **Regular** | 16/24 Regular | 18/27 **Medium** | 18/27 Medium — `typography.body.weight` par écran |
| SousTitre (H4, Medium, FILL → se replie) | 20/25 | 20/25 | 24/30 | 24/30 |
| lignes | `ds.accordion-row` 2.0.0 Petit ×3 (repeat `items`) | idem | idem | idem |

Seule la gouttière change par mode côté CSS Odoo : `responsive/texte-seo.pqr.css` (3 blocs `@media`, une déclaration chacun),
ajoutée au bundle après `footer.pqr.css`. La typographie roule sur `tokens.pqr.css`. **Aucun fait code-only** sur cette section.

### Odoo

- `texte-seo.authoring.json` : épingles `ds.texte-seo` → 4.0.0 (rootContract + 16 adresses) ; contrôles nouveaux
  `presentation` (`fixed-by-composition` / `none`), `texte` (`controlled` / `rich-text` → `texte-seo-text`), `sousTitre`
  (`controlled` / `plain-text` → `texte-seo-subtitle`) ; parts `p/Paragraphe` → `directly-editable` rich-text `[strong]`,
  `h3/SousTitre` → `directly-editable` plain-text (3.0.0 les disait `not-editable` alors que le QWeb les posait déjà `o_pqr_editable` —
  contradiction préexistante, levée). `odoo:authoring:check` : 9/9 · 16/16.
- `figma-panels.json` : 2 épingles → 4.0.0. `components.xml` : `data-ds-contract-version="4.0.0"` ; **QWeb changé** sur deux points
  seulement : titre par défaut sans `<strong>` (candidat uniforme), paragraphe `data-pqr-marks="strong"` avec les 6 plages du candidat
  (3.0.0 le posait `data-pqr-marks=""` : le gras du rédacteur y était déplié à l'enregistrement). Digest **non touché**.
- Page `/texte-seo-test` : contenu des planches (titre, paragraphe riche, sous-titre, 3 lignes fermé / ouvert / fermé par `rows`),
  bloc seul, pleine largeur, pas de `s_pqr_bleed`, pas de container.
- Déployé sur le pilote : `-u piqueray_ds` (**exige `--db_host=db --db_user=odoo --db_password=odoo`** — sans eux : « no password
  supplied », et la page composée ensuite l'a été sur l'ANCIEN gabarit), restart, `odoo:page` → `COMPOSE_OK`.

**Défaut trouvé et corrigé dans le composeur (`compose_page.py`)** : `arch_db` est un champ TRADUIT (JSON par langue) ; `write` sans
contexte n'écrivait que `en_US`, alors que le site sert `fr_BE` et que la vue 1413 (copie COW du site 1) portait une clé `fr_BE`
depuis le premier enregistrement de l'éditeur. La page servie restait celle d'AVANT la recomposition (`data-pqr-marks=""` servi,
`strong` en base) — silencieusement. Correctif : écriture dans chaque langue installée (`res.lang.get_installed()`), commentée.
Toute page recomposée après une édition rédacteur était concernée.

### Mesure (bloc contre planche, même boîte, `.page-parity/texte-seo-mesure/`)

| largeur | Odoo vs planche | diff | cause |
|---|---|---|---|
| 390 | 390×771 = 390×771 | **5,11 %** (15 353 px) | résidu de rendu texte : mêmes coupures de ligne (titre 3 l., paragraphe 13 l., contenu 5 l.), mêmes boîtes ; le diff est le contour des glyphes (lissage Figma vs Chromium), qui pèse plus sur une petite boîte |
| 834 | 834×471 = 834×471 | **3,94 %** (15 468 px) | idem (paragraphe 6 l.) |
| 1200 | 1200×492 = 1200×492 | **2,55 %** (15 058 px) | idem (paragraphe 5 l.) |
| 1728 | 1728×448 = 1728×448 | **1,94 %** (15 011 px) | idem (paragraphe 3 l.) |

Compte de pixels quasi constant (~15 000) aux quatre largeurs = même résidu que l'accordéon (cause 7 du mode d'emploi), aucun
écart de géométrie. Re-mesuré après le test d'édition : chiffres identiques. Triptyques : `triptyques/texte-seo-<w>-figma-odoo-diff.png`.

**Sonde (`.page-parity/probe-texte-seo.mts`), 4 largeurs :** padding-inline 24/48/56/89, contenu 342/738/1088/1550 (bloc `h2`,
paragraphe, sous-titre, 3 lignes), titre 24/30/600 · 24/30/600 · 32/40/600 · 40/50/600, paragraphe **16/24/400 · 16/24/400 ·
18/27/500 · 18/27/500**, gras 700, sous-titre 20/25/500 ×2 puis 24/30/500 ×2, lignes 40/168/40 · 40/96/40 · 43/105/43 · 43/105/43,
section 771/471/492/448, couleur paragraphe rgb(55,55,59) = `#37373B` — **0 écart** sur ces mesures. Le seul « écart » brut de la
sonde (largeur du `.texte-seo__Titre` 314/676/901/1127) est un artefact : ce nœud est un `<span>` inline dans le DOM Odoo, son rect
est l'encre du texte ; le bloc parent `.texte-seo__h2` fait 342/738/1088/1550.

### Édition (`.page-parity/edit-texte-seo.mts`, rédacteur `editor@example.test`, pilote)

Sous-titre « Infos pratiques » → « Infos pratiques (édité) » ET un mot en gras « showroom » → « showroomX » (frappe en fin de
`<strong>`), enregistrement **RPC 200**, relecture publique : les deux conservés, **6/6 plages en gras conservées**. Remise à
l'original par le même chemin (200) : page de mesure intacte.

### Déviations nommées (récapitulatif)

1. Cadres `h2` / `Titre direct` aplatis en une part `Titre` (comme 3.0.0 / Presentation).
2. Liaisons typographiques du paragraphe posées à la main (dump v1.8 sans `boundVariables` de texte) — vers `typography.body.*`.
3. `titre` reste riche avec un défaut sans gras (candidat uniforme).
4. `align: stretch` sur la racine là où le dump dit `counter: MIN` (sans effet, enfants FILL).
5. `letter-spacing 0` non porté.
6. Élément hôte `div` conservé (3.0.0), pas promu en `section`.

### Faits code-only

Aucun.

### Questions tranchées seule (à relire)

- `titre` : `rich-text` conservé (défaut sans gras) plutôt que `text` comme proposé.
- `texte` : nom de la nouvelle prop riche du paragraphe (comme `ds.sav`), liée `NONE`.
- Parts `Paragraphe` et `SousTitre` passées `directly-editable` dans l'authoring (elles l'étaient déjà dans le QWeb).
- QWeb : titre par défaut sans `<strong>`, paragraphe `data-pqr-marks="strong"` (sans quoi le gras du rédacteur était déplié).
- `compose_page.py` : écriture de l'arch dans toutes les langues (défaut trouvé en route).
- `semantics.element` laissé à `div`.
- `width: fill` posé sur `p`, `h3`, `accordion` (le dump les dit FILL ; 3.0.0 ne le disait pas).

### À corriger à la source (Figma)

- Rien de nouveau sur le candidat. Reste ouvert de l'étape 0 : le master DS `2108:3123` et ses 9 instances restent en v1 tant que
  le candidat n'est pas promu (promotion = orchestrateur) ; défaut n°4 (couleur `color/noir` du paragraphe) conservé sur décision.

### Bloqué / à trancher (orchestrateur / owner)

- **Verrou Odoo** : `odoo:inputs:check` rouge (`ds.texte-seo` 3.0.0 → 4.0.0 + `ds.accordion-row`, digest `f91b76…` → `9f64b1…`) ;
  `odoo:module:check` **22/23** — le seul échec : `components.xml : ds.texte-seo 4.0.0 ≠ lock 3.0.0` (attendu, re-pin global +
  4 miroirs non touchés : `inputs.lock.json`, `version_guard.js`, `scan-saved-versions.ts`, `cases.json`).
- **Parité** : 2 constats `[figma BEHIND] TexteSEO.Presentation` / `TexteSEO.SousTitre` — le cliché `figma-components.json`
  apparie par nom l'ancien master `2108:3123` (sans axe, sans propriété `SousTitre`). Cliché périmé, à rafraîchir ; **aucun patch
  appliqué**.
- `figma-sync/NN-texte-seo.js` non régénéré (`figma:plan`, hors périmètre) ; `evals/golden.json` non re-pinné (`npm run eval` interdit
  en worktree partagé).
- `core/samples/{TexteSEO.inline.tsx,texte-seo.css,texte-seo.html}` régénérés par `emitters:check` (conséquence attendue du contrat) ;
  `ProductCard.inline.tsx` / `ReviewCard.inline.tsx` bougent depuis 033 (pas de mon fait).
- Fichiers étrangers dans le worktree, pas de mon fait : `v9.js` (bundle Embla, 11:07), `extract/figma/page-parity/bridge/_tmp-dump-hero.js`.
- Le mode d'emploi donne `odoo -d … -u piqueray_ds --stop-after-init` sans identifiants de base : à compléter (`--db_host=db
  --db_user=odoo --db_password=odoo`), sinon la mise à jour échoue et la composition qui suit se fait sur l'ancien gabarit.

### Portes (2026-09-07)

`npm run build` **vert** (derivation comprise) · `geometry:gate` **PASS** (0 littéral invisible) · `odoo:authoring:check` **vert**
(9/9 · 16/16) · `odoo:module:check` **22/23** (verrou, attendu) · `tsc --noEmit` et `tsc -p tsconfig.build.json` **verts** ·
`emitters:check` **vert** · `parity` **2 constats** (cliché périmé, ci-dessus), 27 acquittés inchangés · `odoo:inputs:check` **rouge**
(verrou, attendu). `npm run eval` **non lancé** (règle).

### Fichiers touchés

`contracts/texte-seo.contract.json` (4.0.0) · `integrations/odoo/config/{texte-seo.authoring.json, figma-panels.json}` ·
`integrations/odoo/addons/piqueray_ds/{views/components.xml, __manifest__.py, static/src/css/responsive/texte-seo.pqr.css (nouveau)}` ·
`integrations/odoo/authoring/pages/texte-seo-test.json` (contenu remplacé) · `integrations/odoo/authoring/compose_page.py` (langues) ·
générés : `src/components/TexteSEO/*`, `static/src/css/generated/components.pqr.css`, `static/src/js/generated/figma_links.js`,
`derivation-report.json`, `core/samples/*`, `parity/report.json` · outils (`.page-parity/`, ignoré) : `probe-texte-seo.mts`,
`probe-texte-seo-h2.mts`, `edit-texte-seo.mts`, dossier `texte-seo-mesure/`.
Aucun jeton, aucun émetteur, aucun schéma, aucun verrou, `contracts/accordion-row.contract.json` non touché.
