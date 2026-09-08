# Research — 037 · Les neuf pages du site sur Odoo

Date : 2026-09-08. Toutes les décisions ci-dessous s'appuient sur une lecture du dépôt (docs, journaux, code) et sur des
relevés **en lecture** du canevas (REST + pont), sauf le montage Contactez-nous demandé par l'owner en session (D13).

## Relevés qui fondent le plan

### R1 — Les vues Figma v2 des neuf pages (REST, `files/…?depth=2` + `nodes?depth=1`, 2026-09-08)

Page `2613:18825` « 031 · Planches de validation », 44 enfants. Sections « 4 vues (instances v2) » trouvées : **sept**,
plus les quatre vues home qui sont des FRAMES directs (pas une section). **Contactez-nous n'en avait pas** : seule la base
v1 `2782:44493` (1728×3901, ordre Hero › Formulaire › Coordonnées › Avis Google › Texte SEO › Footer+Devis › Header nav).

| Page | Section | Mobile 390 | Tablette 834 | Desktop 1200 | Wide 1728 | Ordre (vue wide) |
|---|---|---|---|---|---|---|
| Home | — (frames) | `2617:55170` 9140 | `2674:14994` 8261 | `2647:6734` 6233 | `2624:57624` 6460 | HeroVideo › CategoriesPrincipales › Presentation › SAV › ProduitsECommerce › Devis › Reassurances › AvisGoogle › Footer (+Header) |
| Portes de garage | `2770:21610` | `2770:21611` 8147 | `2770:22101` 7298 | `2770:22591` 5209 | `2770:23107` 5250 | Hero › CategoriesPrincipales › Presentation › Devis › Reassurances › AvisGoogle › TexteSEO › Footer |
| Portes résidentielles | `2774:27923` | `2774:27924` 9602 | `2774:28384` 10498 | `2774:28844` 6884 | `2774:29331` 7432 | Hero › CategoriesPrincipales › Devis › Reassurances › Realisations › FAQ › AvisGoogle › TexteSEO › Footer |
| Portes industrielles | `2782:44734` | `2782:44735` 10326 | `2782:44746` 10816 | `2782:44757` 7185 | `2782:44768` 7693 | idem résidentielles |
| Portes d'entrée | `2778:32307` | `2778:32308` 9346 | `2778:32782` 10386 | `2778:33256` 6851 | `2778:33757` 7466 | idem résidentielles |
| Motorisation | `2777:31389` | `2777:31390` 4896 | `2777:31604` 5219 | `2777:31818` 3564 | `2777:32059` 4000 | Hero › CategoriesPrincipales › Devis › ProduitsECommerce › TexteSEO › Footer |
| Dépannage/SAV | `2782:36219` | `2782:36220` 6355 | `2782:36694` 6001 | `2782:37168` 4175 | `2782:37669` 4804 | Hero › FAQ › CategoriesPrincipales › Devis › AvisGoogle › TexteSEO › Footer |
| À Propos | `2782:39568` | `2782:39569` 9092 | `2782:40099` 8267 | `2782:40629` 7573 | `2782:41185` 6750 | Hero › Presentation › Equipe › Devis › Reassurances › AvisGoogle › TexteSEO › Footer |
| **Contactez-nous** | **`2782:46963`** (montée D13) | `2782:46964` 6730 | `2782:47477` 5729 | `2782:47992` 4063 | `2782:48534` 4343 | Hero › Formulaire › Coordonnees › AvisGoogle › TexteSEO › Footer |

Les hauteurs sont celles du relevé du jour ; celles des journaux 031 (2026-09-07) ont déjà bougé (Portes de garage mobile
8274 → 8147 : le canevas vit). **L'instrument relit toujours la vue vive**, il ne lit jamais une hauteur écrite ici.

### R2 — Ce que le dépôt fait déjà (docs-first, §IX)

- **Composition** : `integrations/odoo/authoring/{page.sh,run-compose.sh,compose_page.py}` — un descripteur par page, copié tel
  quel dans le conteneur, rendu des gabarits gouvernés, injection par `data-pqr-part`, `write_arch` toutes langues, `COMPOSE_OK`.
  Clés : `component, set_html, set_button, images, variant, disposition, cards, reviews, rows, remove_class, add_class, set_empty,
  meta_title, header_overlay, key, view_tname`. **Aucune notion de lien** : tous les CTA des blocs sortent avec `link_href='#'`.
- **Lien = adaptation d'hôte** : matrice de capacité l. 180 (`<a href>` HOST-ONLY, absent-by-decision) ; panneau éditeur
  `SetCtaHrefAction` (`[data-pqr-part=<part>] a[data-pqr-part=button-root]`) et `SetLinkHrefAction` (`a[data-pqr-part=<part>]`),
  grammaire `CTA_HREF_AUTORISE = /^(#|\/(?!\/)|https?:\/\/|mailto:|tel:)/i`, repli même origine, refus silencieux au champ.
  Les cartes conservent le lien dans `data-pqr-cta-href` (`repeat_action.js`). Décision owner 2026-08-18 : registre
  `ODOO-019-CTA-LIEN-BRIDGE`, pas un `*.authoring.json`.
- **Menu** : `data/menu_seed.xml` (`noupdate="1"`, 7 entrées, Motorisation sous Portes d'entrée « placement INFÉRÉ »),
  `hooks.py` (`_finalize_shell`, drapeau `piqueray_ds.shell_finalized`, ne retourne jamais), `header.xml` (état actif natif
  `website.menu._is_active()`, `data-actif`, `aria-current`, `.dropdown-item.active`, menu mobile `aria-current`).
  Tests 022 : `header-nav.spec.mts` sur **fixtures** (`piqueray_ds_qa.nav_fixture`), attend `motorisation → « Portes d'entrée »`.
- **Mesure** : `extract/image-parity/` (strict, refuse `dimension-mismatch`), `integrations/odoo/qa/visual/` (clip épinglé par
  sujet, `capturePage` refuse 404 et sujet absent), `docs/16` §Étape 8 (« regarde le triptyque », « compare à contenu égal »,
  résidu 1–5 %). La mesure **page entière** vivait hors dépôt : `oceanic-oak/.page-parity/{capture-page.mts, mesure-bloc.mjs,
  cmp-sections.mjs}` (fullPage DPR 1, `networkidle`, défilement, planche complétée en blanc à la hauteur max, section par
  section à sa propre position). Journaux : `page-portes-de-garage.md` (3,67 · 2,41 · 1,71 · 1,90 %, +4 +4 +2 +8) et
  `home-page-layout.md` (+128 +118 +34 +70, score non rapporté).
- **Instances** : `piqueray-odoo-test` 8071 = owner, interdit ; pilote `piqueray-odoo-pilote` 8087 (validation owner, lien
  éditeur `…/odoo/website?path=<url>&enable_editor=1&with_loader=1`) ; QA `compose.yaml` jetable (`withInstance`).
- **Portes Odoo** : `odoo:authoring:check`, `odoo:module:check`, `odoo:derivation` (dans `build` ; scanne `views/`, `static/src/js`,
  `static/src/xml`, `odoo-bridge.css`, **`data/`** — donc le semis), `odoo:inputs:check`, `odoo:typecheck`, `odoo:visual:selftest`.
- **Évals Odoo** existantes (`evals/run.ts`) : `odoo-figma-links-governance`, `odoo-production-generated-output`,
  `odoo-authoring-coverage-refusal`, `odoo-production-derivation-report`, `odoo-production-version-drift`, `odoo-tokens-output` —
  toutes sans Docker, sur fixtures ; c'est le modèle des cas neufs.

## Décisions

### D1 — Le contenu commun est un fichier par bloc, repris **par référence** et surchargé **par champ**

- **Decision** : `integrations/odoo/authoring/commun/<bloc>.json` = une section complète sans `component` implicite
  (`{ "component": "s_pqr_reassurances", "disposition": "5Cartes", "cards": […], "set_html": {…} }`). Dans un descripteur de
  page, une section s'écrit `{ "commun": "reassurances" }` ou `{ "commun": "reassurances", "surcharge": { "disposition": "4Cartes",
  "cards": […], "set_html": { "reassurances-title": "…" } } }`. Règle de fusion : **un champ = une clé de premier niveau de la
  section**, sauf `set_html`, `set_button`, `images`, `links` qui fusionnent **par part** (la page ne réécrit que la part qu'elle
  change) ; une liste (`cards`, `reviews`, `rows`) est **un** champ : surchargée entière ou pas du tout (Réassurances à 4 cartes
  = la liste des 4). Tout champ absent de `surcharge` suit le commun, y compris après correction du commun (SC-004).
- **Rationale** : c'est la lecture littérale de la clarification FR-003 (« surcharge par champ ») ; la fusion par part pour les
  dictionnaires garde le fichier de page minimal (À Propos : titre + 4 cartes, rien d'autre) ; une liste fusionnée élément par
  élément inventerait une identité de carte que le DOM gouverné n'a pas (les cartes sont adressées par position).
- **Alternatives** : (a) surcharge du bloc entier — rejetée par la clarification ; (b) fusion profonde des listes par index —
  rejetée : cinq cartes du commun + quatre de la page donneraient cinq cartes, silencieusement ; (c) héritage par
  `"extends"` de descripteurs — plus général, mais rien ne le demande et il ouvrirait des chaînes.
- **Refus (FR-006)** : `commun` inconnu → refus (fichier, section, nom) ; clé de `surcharge` qui n'existe pas dans le commun ni
  dans les clés autorisées du composeur → **orphelin**, refus ; part surchargée absente du commun **et** du gabarit → refus.

### D2 — La résolution est un script TS pur, exécuté AVANT Docker, et c'est lui qui refuse

- **Decision** : `scripts/odoo/resolve-page.ts` — entrée `pages/<page>.json` + `commun/*.json`, sortie le **descripteur résolu**
  (même format que celui que `compose_page.py` lit aujourd'hui, donc **le composeur ne connaît ni `commun` ni `surcharge`**), plus
  le **registre des restes** de la page (boutons sans destination : page, section, part). `page.sh` l'appelle, écrit le résolu
  dans un fichier temporaire et ne lance `run-compose.sh` qu'en cas de succès. `npm run odoo:pages:check` résout **toutes** les
  pages du site (liste `scripts/odoo/lib/pages.ts`), refuse à la première faute et imprime le registre agrégé (`--json`).
- **Rationale** : le composeur tourne dans le conteneur, sans les fichiers `commun/` ; résoudre côté hôte garde `compose_page.py`
  petit (une seule addition : `set_link`) et rend la résolution **évaluable sans Docker** (déterminisme C1, refus C2). Le TS est
  typé par le tsconfig racine (`scripts/` y est), contrairement au Python de l'addon.
- **Alternatives** : résolution dans `compose_page.py` en copiant `commun/` dans le conteneur — rejetée : non évaluable hors
  Docker, et deux langages pour une seule règle de fusion.

### D3 — Les destinations viennent du fichier, avec la grammaire de l'éditeur **restreinte**

- **Decision** : clé de section `"links": { "<part-hôte>": "<destination>" }` (ex. `"hero-cta": "/contactez-nous"`,
  `"presentation-cta": "/a-propos"`) et, dans une carte de `cards`, `"lien": "/portes-residentielles"`. Le composeur pose
  `href` sur `[data-pqr-part=<part>] a[data-pqr-part=button-root]` sinon sur `a[data-pqr-part=<part>]` (cartes catégorie
  `carte-root`, produit `produit-card`, icônes sociales) — **les deux mêmes résolutions que le panneau** — et, pour une carte,
  `data-pqr-cta-href` comme `repeat_action.js`. Grammaire du résolveur (plus stricte que l'éditeur) : `#…` ; **interne**
  `/chemin` qui DOIT être l'URL d'une page du site (liste `pages.ts`, plus `/`) ; `tel:` et `mailto:` ; **externe**
  `https://…` seulement si présente dans `commun/destinations-externes.json` (liste fermée : avis Google, réseaux) ;
  tout le reste (`javascript:`, `data:`, `//hôte`, `http://`, chemin inconnu) → **refus nommé**. Destination **absente** →
  `href` reste `#` (comportement actuel, « bouton sans lien ») + ligne au registre des restes.
- **Rationale** : la spec impose « page qui existe » (scénario 6 de US1) et « adresse externe non prévue » refusée ; la liste
  fermée matérialise « prévue ». Réutiliser les sélecteurs du panneau garantit qu'un lien posé par le fichier et un lien édité
  ensuite atterrissent au même endroit (le panneau relit l'`href` de la même ancre).
- **Alternatives** : porter le lien dans `set_button` (`{label, href}`) — rejetée : casse la forme existante des descripteurs ;
  ajouter une prop de contrat — interdit (HOST-ONLY, matrice l. 180).

### D4 — Le menu validé : semis corrigé + migration gardée, sans jamais réécrire un menu édité

- **Decision** : `menu_seed.xml` : `menu_motorisation.parent_id → menu_portes_garage`, `sequence 30` (après résidentielles 10,
  industrielles 20) — vaut pour toute **installation fraîche** (`noupdate` crée sans écraser). Chemin **update** : version
  `19.0.1.17.0` + `migrations/19.0.1.17.0/post-migration.py` qui re-parente **uniquement** l'enregistrement `piqueray_ds.menu_motorisation`
  s'il existe encore **et** si son `parent_id` est encore `piqueray_ds.menu_portes_entree` (= le placement inféré de 022,
  jamais touché) ; sinon rien. Registre : `ODOO-022-MENU-SEED` (mécanisme et `decisionRefs` complétés), pas de zone neuve.
  `header-nav.spec.mts` (022) : `motorisation → active « Portes de garage »` ; commentaire de `harness.xml` inchangé (il ne
  cite que les 4 tops). Pilote : `-u piqueray_ds` avec identifiants (piège docs/16).
- **Rationale** : FR-008 exige l'arbre validé, FR-012 interdit de réécrire le menu d'un client ; la garde « encore à sa place
  inférée » est exactement la frontière entre les deux — on corrige **notre** inférence, jamais **son** rangement. Le
  `_finalize_shell` ne convient pas (drapeau posé, ne retourne jamais).
- **Alternatives** : shell manuel sur le pilote seulement — rejetée : une installation fraîche continuerait de semer l'erreur ;
  retirer le `noupdate` — rejetée : réécrirait tout le menu à chaque update.

### D5 — Le test de navigation parcourt les neuf vraies pages, et dérive ses attentes de l'arbre validé

- **Decision** : `integrations/odoo/qa/scenarios/pages-navigation.spec.mts` (harnais 019 : `readQaEnv`, `baseUrl`, `odooShell`,
  reçu JSON sous `specs/037-…/proofs/navigation/`). Pour chacune des 9 URL (`pages.ts`) : `GET` public → 200 et
  `#wrap.o_pqr_page` présent ; énumération des liens **bureau** (`.header__nav a[href]`, `.dropdown-menu .dropdown-item`),
  **mobile** (`[data-pqr-part="menu-entree-tete"]`, `[data-pqr-part="menu-entree-sous-entree"]`, logo, téléphone, CTA),
  **en-tête** (logo, CTA) et **pied** (logo, CTA, `tel:`/`mailto:`, sociaux) ; chaque interne → `GET` 200 (une 404 d'Odoo
  répond 404 : c'est le signal, jamais un texte) ; **arbre rendu = `contracts/menu-tree.json`** (libellés, ordre, imbrication,
  URL) ; **actif** : `data-actif`/`aria-current` sur l'entrée attendue (enfant ET parent pour une page enfant, aucune sur `/`),
  et sur **aucune autre**. Cache par URL d'Odoo : clé `?pqr=<nonce>` (leçon `header-menu.spec`). **Preuve rouge** : le
  scénario accepte `--red <url>` qui dépublie la page via `odooShell` (`website.page.is_published=False`), rejoue, exige
  l'échec qui **nomme** le lien et la page hôte, puis republie ; le reçu rouge est conservé.
- **Rationale** : FR-011 (vraies pages, échec nommé), SC-002/003 ; les tests 022 dépendent de fixtures et d'un ordre (limite 14).
- **Alternatives** : étendre `header-nav.spec` — rejetée : il crée des fixtures aux mêmes URL que les vraies pages (collision).

### D6 — L'instrument de mesure : `extract/odoo-page-parity/`, réutilise `image-parity` par la bibliothèque

- **Decision** : capture (`capture.ts`) = `launchBrowser()` du dépôt, contexte neuf par largeur (viewport 390/834/1200/1728 ×
  1200, **DPR 1** comme la mesure manuelle et comme l'export Figma `scale=1`, `colorScheme: light`, `locale fr-FR`), `goto`
  `domcontentloaded` + `document.fonts.ready` borné (5 s) + **défilement complet** puis retour en haut + 1,2 s (le carrousel,
  les images paresseuses et le fond vidéo doivent s'être posés — le hero vidéo est photographié sur son affiche, `poster`,
  puisque la vue Figma montre une image), `fullPage`. Refus **avant** photo : HTTP ≠ 200, `#wrap.o_pqr_page` absent,
  hauteur < 10 px, largeur du document ≠ viewport (débordement horizontal = défaut, leçon home 2026-09-04). Relevé des
  **boîtes des sections** (`#wrap > section` : `data-snippet`, y, h) dans le même contexte. Vues (`figma-views.ts`) =
  `GET /v1/images/<file>?ids=…&format=png&scale=1` + `GET /v1/files/<file>/nodes?ids=…&depth=1` (boîtes des enfants) ; token
  `FIGMA_TOKEN` (comme `extract/figma/rest/cli.ts`). Comparaison (`compare.ts`) : aplat alpha → blanc, **alignement en haut,
  rognage à la hauteur commune**, puis `compareDecodedImages` d'`extract/image-parity` (tailles égales par construction,
  pixelmatch 0.1, AA), score = `diffCount / (w × hCommune)` ; **Δh = hOdoo − hFigma** écrit en clair avec la règle. Verdicts :
  `pixel` vert si ≤ 5 % ; `hauteur` = `bruit` si |Δh| ≤ 10 px, `rouge` sinon (même si pixel vert) ; `page` vert seulement si
  les deux ; `impossible` (raison) si une entrée manque. Diagnostic (`sections.ts`) : appariement **par position** après
  retrait, **du côté Figma, du Header ET du Footer** (i-ème enfant restant de la vue ↔ i-ème `section` du `#wrap`) —
  côté Odoo ni l'en-tête ni le pied ne sont dans le `#wrap` (le pied est la zone `//div[@id='footer']` de `website.layout`,
  `views/footer.xml` l. 8), alors que les vues v2 les portent comme enfants (R1). Puis Δh par section et Δy cumulé ; la
  **première** section dont le Δy cumulé dépasse 10 px est **nommée** ; un nombre de sections différent **après retrait**
  est un écart de structure nommé (jamais silencieux). Rapport (`report.ts`) : JSON par largeur (schéma
  `rapport-mesure.schema.json`), triptyque 1:1 (`writeTriptych`), PNG sous `.page-parity/037/<page>/` (gitignoré) avec
  **sha256** dans le JSON, `cause` et `justification` à `null` (écrits à la main après lecture, comme `compare.mts` 019).
- **Rationale** : FR-013/014/017 littéralement ; la mesure manuelle complétait en blanc **à la hauteur max**, ce qui compte
  le bas manquant comme différence — la spec choisit la hauteur commune et rapporte Δh à côté : le score mesure le rendu,
  Δh mesure la hauteur, aucun des deux ne cache l'autre. Réutiliser `compareDecodedImages` (et non le CLI) : même raison
  qu'en 019 (« par la porte bibliothèque, pas par la porte processus »).
- **Alternatives** : étendre `extract/figma/page-parity` — rejetée : il compare deux captures **canvas** ; étendre
  `integrations/odoo/qa/visual` — rejetée : clip épinglé par sujet, pas de pleine page ni de section.
- **Prouvé d'abord** (FR-015) : `selftest.ts` hors ligne (PNG synthétiques : identique → 0 %, section décalée de 40 px → pixel
  rouge, +64 px de hauteur avec contenu identique → hauteur rouge et section nommée, **vue de 10 enfants Header+Footer compris face à 8 sections → `structure: "égale"`**, deux passes byte-identiques) → cas d'éval
  `odoo-page-parity-selftest` ; puis Home et Portes de garage **sur la jetable `piqueray-odoo-037`** — jamais le pilote, qui ne sert qu'à la validation owner à l'écran (D10 fait foi) — (SC-006 : Portes de garage attendu 1–4 %, Δh ≤ 10 ;
  Home Δh > 10 → rouge sur la hauteur avec sa section) ; puis un cas volontairement rouge sur une vraie page (section retirée
  du descripteur, recomposée, mesurée, remise).

### D7 — Seuil et tolérance : constantes déclarées avec leur date, jamais des options

- **Decision** : `extract/odoo-page-parity/views.json` porte `seuilPct: 5` (owner 2026-09-08, raison : bruit de rendu du texte)
  et `toleranceHauteurPx: 10` (owner 2026-09-08) ; le CLI n'a **aucun** drapeau pour les changer ; ils sont recopiés dans chaque
  rapport. Une décision owner datée modifie le fichier, pas la ligne de commande.
- **Rationale** : FR-016 (« jamais après lecture des scores sans décision owner datée »).

### D8 — Le manifeste des vues est commité, la hauteur est relue à chaque mesure

- **Decision** : `views.json` : par page, `url`, `fichier` du descripteur, les 4 `nodeId` (R1) et la taille **au relevé** (date) ;
  l'instrument refuse une vue dont la largeur exportée ≠ largeur attendue, et écrit la hauteur **vive** au rapport. Une vue
  introuvable (nœud supprimé) → rapport `impossible — vue introuvable` (FR-017), jamais fabriquée.
- **Rationale** : la spec l'exige ; les hauteurs des journaux 031 sont déjà périmées (R1).

### D9 — Contenu des sept pages : lu dans la vue wide, images exportées par leurs octets

- **Decision** : pour chaque page, un relevé REST (`nodes?depth=…`) des textes (avec plages en gras → `<strong>`) et des
  `imageHash` des sections de la vue **wide** (contenu identique aux 4 vues, par construction des instances) ; photos
  exportées par leurs octets d'origine (REST `images` du nœud ou `getImageByHash` via pont en lecture — piège 2026-09-04 :
  `exportAsync` d'un nœud image a rendu 149 octets), converties en **JPEG ≤ 1728 de large** (règle 2026-09-07), nommées
  `<page>_<section>.jpg` dans `assets/`. Les blocs : Hero (`s_pqr_hero`), Catégories (`variant` superposé ou empilé selon la
  vue : SAV = `Empile`), Réassurances (`disposition` 4/5 cartes), Réalisations (`s_pqr_realisations`, liste de photos),
  FAQ (`rows` + `etat`), Équipe (`s_pqr_equipe`, membres + `images` par plan), Produits (`cards` + `prix`), Formulaire,
  Coordonnées, Texte SEO — **tous existants**, clés du composeur déjà couvertes (`KEY_TO_PARTS`, `fill_list`, `fill_rows`).
  Si une clé manque pour une page (à vérifier à l'exécution : Réalisations et Coordonnées n'ont jamais été composées depuis un
  descripteur de page réelle, seulement `*-test.json`), l'ajout suit le modèle « ses parts sont simplement couvertes ici ».
- **Rationale** : « le contenu de chaque page suit sa vue Figma » (Assumptions) ; SC-010 (zéro bloc nouveau).
- **Écarts de copie à la source déjà connus, à nommer au rapport (FR-018), jamais corrigés dans la page** : double espace du
  titre hero de Portes de garage ; U+2028 dans le titre du Devis v2 (toutes les pages) ; « portes de garage industrielles »
  dans les Réassurances d'À Propos ; **graisse Regular** sur le titre hero des vues Motorisation et À Propos alors que le set
  et le contrat (`typography.h1.weight`) sont SemiBold — la page Odoo rend le contrat, la mesure montrera l'écart ; **Équipe
  Desktop 2652 px** (dessin du set) ; **formulaire v2 sans Adresse/Sujet** ni les deux boutons de la base (D13).

### D10 — Instances : jetable pour construire et mesurer, pilote pour valider

- **Decision** : construction + navigation + mesure sur une instance **jetable dédiée** `piqueray-odoo-037` (compose QA,
  `COMPOSE_PROJECT_NAME` + port libre, ex. 8109 ; `docker ps` du 2026-09-08 montre 8071 owner, 8087 pilote, 8093 carrousel,
  8085, 8075, 8099, 8105, 18069 pris) ; le nom de l'instance est écrit dans chaque rapport. Validation owner à l'écran sur le
  **pilote** 8087 après reconstruction des 9 pages, par le lien éditeur. `odoo:save` ne vise **jamais** l'owner par défaut sans
  `--project` (piège 032).
- **Rationale** : Assumptions (« instance jetable ou pilote ; jamais l'owner ») ; mémoire projet.

### D11 — Les évals neuves, sans Docker, avant toute phrase de doc

| Cas | Famille | Ce qu'il prouve |
|---|---|---|
| `odoo-pages-resolve-determinism-and-refusals` | C1 + C2 | deux résolutions byte-identiques ; surcharge par champ (part surchargée gardée, part non surchargée suit une correction du commun) ; refus nommés : commun inconnu, orphelin, destination `javascript:`, chemin interne inconnu, externe hors liste ; destination absente → registre |
| `odoo-page-parity-selftest` | C1 + C3 | identique → 0 %, section décalée → pixel rouge, Δh 64 → hauteur rouge + section nommée, ×2 identiques, entrée manquante → `impossible` |
| `odoo-pages-navigation-tree` | C3 | `menu-tree.json` = arbre du semis (parse de `menu_seed.xml`) ; une entrée déplacée dans le semis rougit |

Le README d'authoring et `docs/16` (§A4bis ou une section « mesure de page ») ne citent le commun, les destinations et
l'instrument qu'après ces cas (SC-007). Le compte `N/N` n'est jamais écrit en prose.

### D12 — Reprise de Home et Portes de garage sans régression

- **Decision** : avant toute édition, **composer les deux pages telles quelles** sur l'instance 037 et capturer (4 largeurs, via
  l'instrument) ; puis réécrire les descripteurs (commun par référence, destinations) ; recomposer ; **comparer Odoo-avant ↔
  Odoo-après** avec `extract/image-parity` strict (mêmes tailles attendues) : 0 pixel de différence hors les `href` (invisibles).
  Les fichiers ne contiennent plus aucune copie locale (SC-004 : vérifié par le résolveur en `--check` : une section d'un bloc
  commun écrite en clair dans une page est **refusée** — le commun est obligatoire pour Devis, Réassurances, Avis Google).
- **Rationale** : FR-004 / scénario 5.

### D13 — Contactez-nous : vues montées en session, écart de formulaire ouvert

- **Decision** : fait le 2026-09-08 sur demande owner (journal `specs/tiny/vague-031/page-contactez-nous.md`) : version nommée
  avant, capture de la base, section `2782:46963`, clone des 4 vues SAV, Formulaire v2 (`2782:38403`, 0 → 4 instances) et
  Coordonnees v2 (`2778:34448`) insérés, contenus de la base posés, +4 sur chaque set et rien d'autre, **validées par l'owner**.
  La spec (Assumptions, FR-017) redevient exacte : 36 rapports exigibles. À trancher (registre des restes si non tranché à la
  clôture) : le formulaire v2 n'a ni Adresse ni Sujet ni « Appeler pour une urgence » / « Voir la FAQ » — vague composant, pas
  reprise de page.

### D14 — Ce que cette spec ne touche pas (nommé)

- Aucun contrat, jeton, bloc, émetteur, schéma ; aucun `figma-sync`, `catalog`, `golden.json` → re-pins attendus **zéro** ; si
  `catalog/` bouge, c'est la dérive non gardée connue (018), à signaler, pas à corriger ici.
- L'envoi du formulaire, le bloc Avis Google partagé, la boutique, les PDF, les réalisations cliquables, toute promotion Figma.
- `DW-014-002` (l'instrument de parité visuelle rend `emit-html`, pas la surface livrée) : cette spec mesure la **page Odoo
  livrée**, ce qui est une autre chose — elle ne ferme pas DW-014-002 et ne le prétend pas.

## NEEDS CLARIFICATION — état

Aucun. Les cinq clarifications de la spec (seuil, arbre, vues, hauteur, surcharge) sont encodées en D1, D4, D6, D7, D8/D13.
