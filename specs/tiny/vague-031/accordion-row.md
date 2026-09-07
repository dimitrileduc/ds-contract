# Journal de molécule — `ds.accordion-row` v2 (pilote TexteSEO, vague 031 suite)

**Date** : 2026-09-07. **Cible** : la LIGNE d'accordéon seule (enfant), avant son parent TexteSEO.
**Rôle de ce chantier** : pilote fait avec l'owner pour affiner le mode d'emploi destiné aux agents suivants.

## Étape 0 — audit de la source (lecture seule, 2026-09-07 matin)

### Le master

- Set `AccordionRow` **2059:1417**, clé `6b15207fffd75082f1f8c423eab771aa6709179d`, page « DS · Molécules »,
  section `Accordion-row`. Description : « generated from contract ds.accordion-row v1.2.0 † » — c'est une
  sortie de sync, pas un dessin à la main.
- 4 variantes `Taille{Grand,Petit} × Etat{Ferme,Ouvert}` : 1550×64 · 1550×40 · 1550×112 · 1550×80.
- Propriétés TEXT `Titre` et `Contenu`, liées aux nœuds texte des 4 variantes. OK.
- Racine : largeur FIXED 1550 liée à `size/accordion-row/root` (témoin de set, normal pour un set — les
  usages sont FILL) ; pad haut/bas `space/16` (Grand) · `space/8` (Petit) ; gap `space/24` (Grand,
  Petit fermé) · `space/8` (Petit ouvert) ; trait bas `border-width/1`. **Toutes les mesures sont liées.**
- Textes : Grand = style « Titre 5 » (Montserrat SemiBold 20/25) ; Petit = « Paragraphe gras »
  (Bold 14/24) ; Contenu = « Paragraphe » (Regular 14/24). Couleur liée `color/noir-bleute`.
  Ce sont les styles **v1**, pas les styles responsive « 031 provisoire ». (= le travail v2, pas un défaut.)

### Défauts de source relevés (à valider par l'owner avant toute écriture)

| # | Défaut | Où | Nature | Pixels à 1550 |
|---|---|---|---|---|
| 1 | Chevrons dessinés en cadres + vecteur brut (`#000000`), alors que les icônes gouvernées `ChevronDown` 226:373 et `ChevronUp` 226:374 existent dans « DS · Atomes / Icônes » (le Bouton, lui, instancie ses icônes) | 4 variantes | enfant gouverné copié au lieu d'instancié (règle de méthode n°6) | à vérifier (forme et couleur de l'icône gouvernée) |
| 2 | Trait de séparation en couleur brute : Grand = `#000000` 100 %, Petit = `#26282c` 32 %. Non lié. Incohérent avec le texte (noir-bleuté) | 4 variantes | valeur brute + décision design (noir pur voulu ?) | change si on lie Grand à noir-bleuté |
| 3 | Le titre ne se replie pas : texte `WIDTH_AND_HEIGHT`, cadre `Titre` HUG. Une question longue déborde dès que la ligne est plus étroite que 1550 | 4 variantes | structurel — bloque le mobile | aucun (titres courts) |
| 4 | `trigger` absolu FIXED 1550 : ne suit pas la largeur de la ligne | 4 variantes | structurel, invisible | aucun |
| 5 | Deux instances de page en FIXED au lieu de FILL : `I2106:3035;2351:38084` (Portes d'entrée › FAQ › ligne 3) et `I2106:3060;2351:38084` (Portes de garage résidentielles › FAQ › ligne 3) | usage | surcharge d'instance | aucun |

### Les usages (scan par position, 45 instances, 0 détachée, 0 calque masqué)

| Hôte | Taille | Nombre | Remarque |
|---|---|---|---|
| master `TexteSEO` 2108:3123 (DS · Organisms) | Petit | 3 | ligne 2 ouverte par défaut |
| 9 instances de TexteSEO (8 pages « Pages » + « Portes de garage » sur 031) | Petit | 27 | mêmes 3 lignes, textes surchargés |
| master `FAQ` 2104:2914 (DS · Organisms) | Grand | 3 | toutes fermées |
| 3 instances de FAQ (Portes d'entrée, Industrielles, Résidentielles) | Grand | 9 | ligne 2 ouverte par surcharge ; 2 lignes 3 en FIXED (défaut 5) |
| page Dépannage/SAV › « Hero et FAQ » › `FAQ` **cadre brut** | Grand | 3 | **le FAQ de cette page n'est pas une instance du master** — hors périmètre, à reporter à l'étape 0 du FAQ |

### Ce qui n'est PAS un défaut (et qu'on ne touche pas)

- La largeur fixe 1550 du master : un membre de set ne peut pas être FILL ; c'est un témoin.
- Le nommage `AccordionRow3` / `AccordionRow 3` dans les hôtes : cosmétique, sans effet.

### Question de référence (bloquante pour les valeurs par écran)

La molécule n'a pas d'axe Presentation : ses valeurs par écran (taille du titre, hauteurs, espacements)
se lisent dans les 4 variantes du **parent**. Or TexteSEO n'existe qu'à 1728. Aucun relevé Mobile /
Tablette / Desktop n'est possible tant que ces vues n'existent pas. À trancher : l'owner dessine, ou un
candidat est construit selon les conventions de la vague (gouttières 24/48/56/89, jetons `h2`/`h3`/`body`
par écran) puis validé à l'écran.

### Contrat actuel (pour mémoire)

`ds.accordion-row` 1.2.0, ancres = ce set. Il porte déjà : `width: fill` + `referenceWidth 1550`, les
littéraux de couleur du trait (`#000000`, `#26282c52`), les icônes par `icon.asset` (chevron-down /
chevron-up, 32 ; 24 en Petit), le `trigger` code-only absolu, le contenu ouvert en hauteur AUTO (016).

## Décisions owner

_(à remplir en séance)_

## À corriger à la source (Figma)

_(liste finale après décisions)_

## Bloqué / à trancher

- Référence par écran du parent (voir ci-dessus).
- Taille Grand : le FAQ n'a pas de design responsive ; Petit d'abord, Grand reste v1 et sera fait avec le FAQ.

## Candidat v2 sur le canevas (2026-09-07, GO owner « propose en séparé, on voit après »)

- Version nommée avant : « 031 — avant candidat AccordionRow v2 (2026-09-07) » (id 2396386099544201610).
- Section **2767:20197** « 031 · ACCORDION-ROW — molécule (candidat v2) », page 031, sous MENU MOBILE.
- Set candidat **2767:20198** (clé `7b4cc8de…`), cloné du set DS 2059:1417. **Original intact**, prouvé par
  relevé après coup : mêmes 4 identifiants de variantes, 45 instances, style « Titre 5 », chevron en FRAME,
  trait brut — rien n'a bougé.
- 4 témoins en cadres à mode Responsive posé : Mobile @342 (2767:20235), Tablette @738 (2767:20271),
  Desktop @1088 (2767:20307), Wide @1550 (2767:20343). 5 lignes chacun (Petit fermé / Petit ouvert long /
  Petit titre long / Grand fermé / Grand ouvert long), instances FILL. 20 instances témoins.

### Ce que le candidat change (aucune variable créée)

| | avant (DS v1) | candidat | Mobile | Tablette | Desktop | Wide |
|---|---|---|---|---|---|---|
| Titre Grand | « Titre 5 » 20/25 SemiBold fixe | style **H4** | 20/25 M | 20/25 M | 24/30 M | 24/30 M |
| Titre Petit | « Paragraphe gras » 14/24 Bold fixe | nœud lié `typography/body/*`, Bold | 16/24 | 16/24 | 18/27 | 18/27 |
| Contenu | « Paragraphe » 14/24 Regular fixe | nœud lié `typography/body/*`, Regular | 16/24 | 16/24 | 18/27 | 18/27 |
| Chevron | cadre + vecteur brut #000 | instance `ChevronDown` 226:373 / `ChevronUp` 226:374, fill lié `color/noir-bleute` | 24 (Petit) / 32 (Grand) | | | |
| Trait Grand | #000000 brut | lié `color/noir-bleute` | | | | |
| Trait Petit | #26282c 32 % brut | **inchangé, brut** (pas de variable d'opacité, pas de custom var) | | | | |
| Titre | HUG, ne se replie pas | cadre FILL/HUG, texte HEIGHT auto → **se replie** | 3 lignes | 2 | 1 | 1 |
| Zone de clic | FIXED 1550 | contrainte STRETCH → suit la largeur | 342 | 738 | 1088 | 1550 |

Mesuré après recalcul (appel séparé) : Petit fermé 342×40 · 738×40 · 1088×43 · 1550×43 ; Grand fermé 64 partout
sauf Mobile titre long 107 (3 lignes) ; contenu long 6 lignes à 342, 2 lignes à 1550 ; chevron à droite, centré
verticalement sur la hauteur de la ligne.

### Écarts à revoir avec l'owner

1. **À 1728 le Petit change** : 14 → 18 (titre et contenu). C'est l'effet de « typo hiérarchisée sur le DS » :
   aucun rôle responsive du DS ne vaut 14 en Wide. À accepter ou à refuser (alors : garder « Paragraphe » 14 fixe).
2. **Grand à 1728** : 20 SemiBold → 24 Medium (H4). Même cause.
3. **Graisse du contenu** : le jeton `typography.body.weight` (Regular ×2 / Medium ×2) existe dans `tokens/modes`
   mais **pas comme variable Figma** — le candidat reste Regular partout. Décision : Regular partout, ou poser la
   variable manquante (rôle DS, pas une custom var).
4. **Chevron sur titre replié** : centré verticalement. Alternative : aligné en haut de la première ligne.
5. **Trait Petit** : reste brut à 32 %.
6. **Zone de clic** : hauteur fixe 24/32 → ne couvre que la première ligne d'un titre replié. Code-only (contrat) ;
   à trancher au contrat, pas au canevas.

## Contrat 2.0.0 + Odoo (agent, 2026-09-07)

**Entrées** : dump v1.8 du set candidat `2767:20198` (clé `7b4cc8de…`), proposition d'extraction
`.page-parity/vague-031/proposals/AccordionRow/`, planches `planches-accordion/AccordionRow-{390,834,1200,1728}.png`.
**Aucun accès Figma, aucune écriture canevas.** Instance de déploiement : `piqueray-odoo-pilote` (8087) seulement.

### Classement de chaque note de `figma-proposals.md`

| Note de l'extraction | Classement | Ce qui a été fait |
|---|---|---|
| `semantics.element` par défaut `div` | adopté | comme en 1.2.0 (bouton natif et ARIA restent une capacité séparée, inchangé) |
| `root` : auto-layout varie selon `Etat` → `layoutByProp etat` (ouvert = colonne) | adopté | `direction: column`, `justify: start`, **`align: start`** (le dump dit `counter: MIN`) — 1.2.0 portait `stretch` ; sans effet visible car `title` et `Contenu` sont `width: fill` |
| `root padding-block` Grand `space.16` / Petit `space.8` | adopté | `tokensByProp taille` |
| `root itemSpacing` 24 vs 8 « sans corrélation à un axe » | décision | c'est une corrélation à DEUX axes (Petit **et** Ouvert = 8) : porté comme en 1.2.0, `taille=petit → space.8` puis `etat=ferme → space.24`, l'ordre CSS donne 24/24/24/8 |
| `title/TitreOuvert/Question` et `Titre/Question` : typographie variable, aucun style adopté, 12 mints `imported.*.font-size/weight/line-height.{grand,petit}` | **renommé vers jetons existants** (décision owner) | Grand → `typography.h4.{family,size,weight,line-height}` (20/25 puis 24/30 par écran, Medium) ; Petit → `typography.body.{size,line-height}` (16/24 puis 18/27) + `font.weight.bold`. Les valeurs par écran ne sont PAS recopiées : elles vivent dans `tokens/modes/viewport.*`. Le dump v1.8 ne porte pas les liaisons de variables des textes (trou d'instrument déjà nommé par review-card) : liaison à la main, nommée dans les descriptions |
| `Contenu` : « 16px Regular ne correspond à aucun style dérivé », 3 mints `imported.accordion-row.contenu.*` | renommé vers jetons existants (décision owner) | `typography.body.size` / `typography.body.line-height` + **`font.weight.regular` partout** (pas `typography.body.weight`, qui passe Medium au-dessus de 992) |
| `imported.shared.size-0` (letter-spacing) | littéral | `letter-spacing: 0px` comme en 1.2.0, sur les trois textes |
| `ChevronUp` / `ChevronDown` : icônes gouvernées, 32 avec surcharge Petit 24 en `literalsByProp` | adopté / renommé | `icon.asset` + `icon.size 32` ; la surcharge Petit passe par les jetons existants `size.accordion-row.chevron-{up,down}-petit` (24px) — le 24 littéral de la proposition aurait été refusé par `geometry:gate`. Couleur `color.noir-bleute` posée (décision owner ; le dump ne porte pas le remplissage d'une instance) |
| `trigger height` Grand/Petit → `tokensByProp` | adopté | `size.accordion-row.trigger` / `trigger-petit`, comme en 1.2.0 |
| `trigger width` FIXED 1550 → mint `imported.accordion-row.trigger.width` | **supprimé (témoin)** | le déclencheur reste absolu `left/right 0` : il suit la largeur de la ligne |
| `trigger height` FIXED 32/24 « carried » | adopté | idem ci-dessus |
| `Titre/Question` renommé `TitreQuestion` (collision de nom) | **déviation nommée** | le cadre `Titre` (FILL/HUG) + texte `Question` (FILL, hauteur auto) est **aplati en une seule part texte `Titre`** avec `layout.grow`, idem `TitreOuvert`. Raison : garder les 7 parts de 1.2.0 (`data-pqr-part` d'Odoo, verdicts d'authoring) ; antériorité : `ds.accordion-item` de l'archive démo (`titleText` avec `grow`). Écrit dans la description des deux parts |
| `max-width: {size.accordion-row.root}` sur la racine | **supprimé (témoin)** | racine `width: fill` + `referenceWidth: 1550`. Le jeton `size.accordion-row.root` reste dans `tokens/` (il lie la largeur du master Figma) |
| props `taille`, `etat` gardées en enum | adopté | inchangé |
| UNBOUND `root stroke = #26282c52` | décision owner, littéral gouverné | `literalsByProp taille=petit → border-color #26282c52` comme en 1.2.0 ; la base passe à **`color.noir-bleute`** (Grand, lié dans le dump — 1.2.0 portait `#000000` brut) |

### Ce que le contrat 2.0.0 porte (MAJEUR : ancres → set candidat `2767:20198`, `dumpedAt 2026-09-07`)

- Gardé de 1.2.0 : `semantics`, `events.toggle`, les 4 props et leurs liaisons, les `visibleWhen`, les 7 parts
  `title / TitreOuvert / ChevronUp / Contenu / Titre / ChevronDown / trigger`, le `trigger` code-only absolu.
- **Le titre se replie** : plus aucune `height` sur `title`, `Titre`, `TitreOuvert` ; `title` passe de `grow` + hauteur
  32 à `width: fill` (hauteur HUG) ; `Contenu` est `width: fill`, hauteur auto (016).
- **Jetons devenus inutilisés, laissés en place** (décision : on ne retire rien de `tokens/` dans ce chantier) :
  `size.accordion-row.titre`, `titre-petit`, `titre-ouvert`, `titre-ouvert-petit`, `title`, et déjà depuis 016
  `contenu`, `contenu-petit`. Aucun jeton minté : tout existait (`typography.h4.*`, `typography.body.*`,
  `font.weight.{regular,bold}`, `space.0/8/16/24`, `border-width.1`, `size.accordion-row.{trigger,trigger-petit,chevron-*-petit}`).
- Descriptions : chaque déviation (aplatissement des cadres de titre, liaisons typographiques à la main, couleur des
  chevrons, trait Petit brut, largeur témoin, limite du déclencheur) est écrite sur la part concernée.

### Odoo

- Épingles `ds.accordion-row` 1.2.0 → 2.0.0 : `texte-seo.authoring.json` (12), `faq.authoring.json` (24),
  `figma-panels.json` (2). Aucune prop ni part nouvelle → aucun verdict nouveau (`odoo:authoring:check` : 16/16).
- **QWeb inchangé** : le DOM de `texte_seo_row` et de `faq_accordion_row` sert tel quel. Le 24 du chevron Petit est
  porté par le CSS généré (`.accordion-row--taille-petit .accordion-row__ChevronDown svg { width/height: var(--pqr-size-accordion-row-chevron-down-petit) }`),
  pas par l'attribut `width="32"` du SVG inliné — mesuré 24×24.
- **Aucune feuille `responsive/accordion-row.pqr.css` créée** : tout ce qui varie par écran roule sur
  `--pqr-typography-h4-*` / `--pqr-typography-body-*`, dont `tokens.pqr.css` émet déjà les blocs `@media` (768/992/1400).
  Le repli du titre vient du CSS généré (`flex: 1 1 auto; min-width: 0`, `white-space: normal` mesuré), le contenu
  ouvert est `height: auto` (mesuré 144 px pour 6 lignes à 390). Le pont `odoo-bridge.css` (`display: contents` sur
  le groupe de titre à l'état fermé) reste nécessaire et inchangé.
- Page de mesure **`/texte-seo-test`** (`pages/texte-seo-test.json`) : bloc `s_pqr_texte_seo` seul, contenu de la
  page « Portes de garage » (titre, paragraphe, sous-titre, 3 lignes fermé / ouvert / fermé).
- **`compose_page.py` ne savait pas remplir des lignes d'accordéon** (seuls `cards` / `reviews` existaient ; `set_html`
  n'atteint que la PREMIÈRE part `titre`). Ajout d'une clé **`rows`** (`titre` / `contenu` / `etat`), générique
  (`data-pqr-accordion-list` ou `data-pqr-faq-list` + gabarit `blueprint`), qui pose l'état complet comme
  `setFaqRowState` (classe, `hidden` des deux plans, `aria-expanded`, `aria-label`). README : une ligne de table.
- Déployé sur le pilote : `-u piqueray_ds --stop-after-init`, restart, `odoo:page -- texte-seo-test piqueray-odoo-pilote` → `COMPOSE_OK`.

### Mesure (page `/texte-seo-test`, pilote 8087, 2026-09-07)

Le bloc TexteSEO est encore en v1 (gouttière fixe 89 du conteneur de page) : la ligne ne mesure 1550 qu'à 1728.
Aux trois autres largeurs elle fait 212 / 656 / 1022 au lieu des 342 / 738 / 1088 des planches — **c'est le parent**,
pas la ligne. Donc : sonde aux 4 largeurs, comparaison au pixel à 1728 seulement.

**Sonde (`.page-parity/probe-accordion.mts`), lignes 1 (Petit fermé) et 2 (Petit ouvert) — 0 écart sur 4 largeurs :**

| | 390 | 834 | 1200 | 1728 | attendu |
|---|---|---|---|---|---|
| titre (taille/interligne/graisse) | 16/24 700 | 16/24 700 | 18/27 700 | 18/27 700 | body Bold : 16/24 < 992, 18/27 ≥ 992 |
| contenu | 16/24 400 | 16/24 400 | 18/27 400 | 18/27 400 | body Regular |
| chevron (svg) | 24×24 | 24×24 | 24×24 | 24×24 | 24 |
| padding haut/bas · gap | 8/8 · 24 (ouvert 8) | idem | idem | idem | 8/8 · 24 / 8 |
| trait | 1 px rgba(38,40,44,.32) | idem | idem | idem | #26282c à 32 % |
| couleur chevron | rgb(38,40,44) | idem | idem | idem | noir-bleuté |
| largeur de ligne | **212** (planche 342) | **656** (738) | **1022** (1088) | **1550 = planche** | parent v1 |
| hauteur ligne 1 / ligne 2 | 64 (titre sur 2 lignes) / 216 (contenu 6 lignes) | 40 / 96 | 43 / 105 | 43 / 78 | planche 1728 : 43 / 105 |

- Le titre **se replie** (2 lignes à 390 dans 164 px, `white-space: normal`, `min-width: 0`) ; le chevron est
  centré sur la hauteur repliée (centre y = 32 sur 64), comme le candidat.
- Ligne 2 à 1728 : 78 chez nous, 105 sur la planche — **différence de CONTENU, pas de rendu** : la planche porte un
  contenu long (2 lignes), la page de test le texte de la garantie (1 ligne à 1550). À 1200 la ligne 2 fait 105 = planche.
- Taille **Grand** (hors périmètre de la page de test, relevée sur `/piqueray-harness/faq-visual` du pilote, bloc fixé à
  1550) : 20/25 500 à 390, **24/30 500 à 1728**, chevron 32, pad 16/16, ligne 64, trait `rgb(38,40,44)` — conforme
  au candidat (Grand fermé 64 partout). Non comparée au pixel.

**Pixel, ligne 1 à 1728** (`planche-1728-ligne1.png` = découpe y 39, 1550×43 ; Odoo = découpe 0,0,1550×43) :
**0,71 %** (470 px, `images:compare` : diffBox x 2..1544, y 14..31). Hauteur identique (43 = 43).
Cause du résidu, vérifiée aux bandes d'encre : les glyphes sont à y 13..31 sur la planche et **12..30** chez nous —
**1 px plus haut** (arrondi de boîte de ligne 27 px, même résidu que la carte catégorie) + lissage. Chevron : même
forme, même position. Zoom ×4 : `.page-parity/accordion-mesure/zoom-1728.png`.

### Édition (étape 10, `.page-parity/edit-accordion.mts`, session rédacteur `editor@example.test`, pilote)

Titre de la ligne 1 modifié dans l'éditeur → enregistrement **RPC 200** → relecture publique : `"Budget et Devis sur
mesure (édité)"` **conservé**. Remise à l'original par le même chemin (200, conservé) : la page de mesure est intacte.
**Constat annexe (préexistant, pas v2)** : l'`aria-label` du déclencheur n'est **pas** resynchronisé à l'enregistrement
(il reste « Budget et Devis sur mesure » pendant que le titre affiche « … (édité) ») — `faq_toggle.js` ne le
resynchronise qu'à la bascule. Le premier visiteur qui clique le corrige ; jusque-là le lecteur d'écran lit l'ancien titre.

### Déviations nommées (récapitulatif)

1. Cadres `Titre` / `TitreOuvert` aplatis en parts texte avec `grow` (structure Odoo conservée).
2. Liaisons typographiques posées à la main (le dump v1.8 ne lit pas `boundVariables` des textes).
3. Couleur des chevrons `color.noir-bleute` déclarée au contrat (fill d'instance absent du dump).
4. Trait Petit : littéral `#26282c52` (aucune variable d'opacité).
5. Contenu Regular partout (pas le jeton `typography.body.weight`).
6. `align: start` en ouvert (dump), là où 1.2.0 disait `stretch`.
7. **Limite nommée** : le déclencheur absolu (`top 0`, hauteur 24 en Petit / 32 en Grand) couvre y 0..24 d'une ligne
   dont la boîte de titre commence à y 8 — soit le padding haut et les 16 premiers pixels de la première ligne. Sur un
   titre replié, les lignes suivantes ne sont pas cliquables. À trancher au contrat (couvrir la rangée de titre ?).

### À corriger à la source (Figma)

- Rien de nouveau sur le candidat lui-même. Reste ouvert, de l'étape 0 : les 2 instances FIXED dans les FAQ des pages
  (`I2106:3035;2351:38084`, `I2106:3060;2351:38084`), et le FAQ en cadre brut de la page Dépannage/SAV.
- Le set DS `2059:1417` (v1) reste en place tant que le candidat n'est pas promu : les 45 instances pointent toujours
  sur v1. La promotion (remplacer/renommer, réancrer les instances) appartient à l'orchestrateur.

### Bloqué / à trancher (orchestrateur / owner)

- **Verrou Odoo** : `odoo:inputs:check` rouge sur `ds.accordion-row` (1.2.0 → 2.0.0, digest `f91b76…` → `357349…`) —
  re-pin global + 4 miroirs (`components.xml` ×14, `version_guard.js`, `scan-saved-versions.ts`, `cases.json`), pas touchés.
- **Parité** : `npm run parity` vert **sans rien dire de l'accordéon** — le cliché `figma-components.json` porte encore
  le set v1 `2059:1417` et l'apparie par nom ; l'axe canevas ne regarde pas le candidat. Rafraîchir le cliché.
- **`core/samples/ProductCard.inline.tsx` et `ReviewCard.inline.tsx`** ont bougé sous `emitters:check` : ils étaient
  périmés depuis la vague 033 (les échantillons ne sont pas régénérés par `npm run build`). Pas de mon fait, laissés.
- Le déclencheur sur titre replié (déviation 7).
- `aria-label` du déclencheur non resynchronisé à l'édition (constat d'édition ci-dessus).
- `figma-sync/NN-accordion-row.js` non régénéré (`figma:plan`, hors périmètre agent) : le script de sync porte 1.2.0.

### Portes (2026-09-07)

`npm run build` **vert** (derivation comprise) · `geometry:gate` **vert** (0 littéral invisible) · `odoo:authoring:check`
**vert** · `odoo:module:check` **23/23** · `tsc --noEmit` **vert** · `emitters:check` **vert** · `parity` vert
(27 acquittés, aucun constat neuf — mais cliché périmé, voir ci-dessus) · `odoo:inputs:check` **rouge** (verrou, attendu).
`npm run eval` **non lancé** (règle : worktree partagé).

### Fichiers touchés

`contracts/accordion-row.contract.json` (2.0.0) · `integrations/odoo/config/{texte-seo,faq}.authoring.json`,
`figma-panels.json` (épingles) · `integrations/odoo/authoring/pages/texte-seo-test.json` (nouveau) ·
`integrations/odoo/authoring/compose_page.py` (+`rows`) · `integrations/odoo/authoring/README.md` (1 ligne) ·
générés par le build : `src/components/AccordionRow/*`, `static/src/css/generated/components.pqr.css`,
`static/src/js/generated/figma_links.js`, `derivation-report.json`, `core/samples/*`, `parity/report.json` ·
outils (`.page-parity/`, ignoré par git) : `probe-accordion.mts`, `probe-accordion-grand.mts`, `capture-accordion.mts`,
`edit-accordion.mts`, `bandes-planche.mjs`, dossier `accordion-mesure/`.
Aucun jeton minté, aucun QWeb, aucun CSS manuel, aucun émetteur, aucun schéma, aucun verrou.

## Triptyques par mode (orchestrateur, 2026-09-07, à la demande de l'owner)

L'agent n'avait mesuré au pixel qu'à 1728 (parent v1, gouttière 89 : la ligne est trop étroite ailleurs). Contournement
exact, sans toucher au parent : choisir des **viewports qui donnent la largeur témoin ET restent dans la bonne bande
de breakpoint** — 390−48 = 342 s'obtient à un viewport de **520** (520−178, < 768 donc mode Mobile), 738 à **916**
(< 992, Tablette), 1088 à **1266** (< 1400, Desktop), 1550 à **1728**. Côté Figma, 4 témoins-instances avec
exactement les 3 lignes de `/texte-seo-test` (section ACCORDION-ROW, cadres `témoin-test · <mode>`), exportés à 1x.

| mode | boîte (Figma = Odoo) | lignes | diff |
|---|---|---|---|
| Mobile @342 | 342×224 = 342×224 | 40 / 144 / 40 | **5,83 %** |
| Tablette @738 | 738×176 = 738×176 | 40 / 96 / 40 | **3,50 %** |
| Desktop @1088 | 1088×191 = 1088×191 | 43 / 105 / 43 | **2,19 %** |
| Wide @1550 | 1550×164 = 1550×164 | 43 / 78 / 43 | **1,79 %** |

Hauteurs identiques partout, à la ligne près. Le nombre de pixels différents est constant (~4 500) : c'est le résidu
de rendu du texte (lissage + le pixel d'arrondi de boîte de ligne déjà vu), qui pèse plus quand la boîte est petite.
Fichiers : `.page-parity/accordion-mesure/triptyques/triptyque-{390,834,1200,1728}.png`, captures Odoo
`modes/accordion-{520,916,1266,1728}.png`, témoins `triptyques/AccordionTest-*.png`.

Deux pièges d'outillage vus en route (pour la recette) : un cadre témoin créé par script doit être remis en
`primaryAxisSizingMode = 'AUTO'` APRÈS `resize()` (sinon il reste figé à la hauteur donnée) ; et l'export se fait
dans un appel séparé de la construction (hauteurs fantômes, leçon Réassurances n°5).
