---
description: "Task list — 037 · Les neuf pages du site sur Odoo"
---

# Tasks: Les neuf pages du site sur Odoo — contenu, navigation, mesure au pixel

**Input**: `specs/037-pages-odoo-navigation-pixel/` — plan.md, spec.md, research.md (D1–D14), data-model.md, contracts/, quickstart.md

**Tests**: OUI — la spec les exige nommément (FR-019, SC-007 : « tout mécanisme couvert par une vérification automatique **avant** qu'une phrase de documentation ne l'annonce »). Les trois cas d'éval de D11 sont donc des tâches de plein droit, et chacune précède la tâche de doc correspondante.

**Organization**: par histoire utilisateur (US1 → US4), chacune indépendamment testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, aucune dépendance non satisfaite)
- **[Story]** : US1 / US2 / US3 / US4
- Chemins de fichiers exacts dans chaque description

## Conventions de chemins (ce dépôt)

- Contenu : `integrations/odoo/authoring/{pages,commun,assets}/`
- Résolution : `scripts/odoo/resolve-page.ts`, `scripts/odoo/lib/pages.ts`
- Addon : `integrations/odoo/addons/piqueray_ds/`
- QA : `integrations/odoo/qa/scenarios/`
- Mesure : `extract/odoo-page-parity/`
- Évals : `evals/run.ts`, `evals/fixtures/odoo-pages/`
- Preuves : `specs/037-pages-odoo-navigation-pixel/proofs/`

**Règles de fer pour toute tâche ci-dessous** : jamais l'instance owner `piqueray-odoo-test` (8071) ; aucun contrat, jeton, bloc, émetteur ni généré touché (SC-010, D14) ; toute phrase de doc vient **après** son éval (§II).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: rendre ce worktree autonome et poser les points d'entrée, sans encore écrire de mécanisme.

- [X] T001 Rendre le worktree autonome (constitution Worktree Gates F1, `node_modules` vide au 2026-09-08) : `npm install && npx playwright install chromium` à la racine du worktree, puis `npm run build` et `npx tsc --noEmit` verts ; consigner la sortie dans `specs/037-pages-odoo-navigation-pixel/proofs/f1-worktree.md`
- [X] T002 [P] Créer l'instance Odoo **jetable** `piqueray-odoo-037` (compose QA `integrations/odoo/qa/compose.yaml`, image épinglée `odoo:19.0-20260803`, port libre — 8071/8087/8093/8085/8075/8099/8105/18069 pris au 2026-09-08) et écrire nom de projet + port dans `specs/037-pages-odoo-navigation-pixel/proofs/instance.md` (D10)
- [X] T003 [P] Déclarer les trois commandes neuves dans `package.json` (pointant vers des fichiers encore vides) : `odoo:pages:check` → `scripts/odoo/resolve-page.ts`, `odoo:pages:measure` → `extract/odoo-page-parity/cli.ts`, `odoo:pages:selftest` → `extract/odoo-page-parity/selftest.ts` (contrats/README.md § Commandes)
- [X] T004 [P] Créer l'arborescence de preuves `specs/037-pages-odoo-navigation-pixel/proofs/{mesure,navigation}/` et ignorer les PNG lourds en ajoutant `.page-parity/` à `.gitignore` s'il n'y est pas (décision owner 2026-08-27 : aucune image lourde committée)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: la liste des pages du site est l'identité partagée par le résolveur, le test de navigation et l'instrument de mesure. Rien ne peut commencer sans elle.

**⚠️ CRITICAL**: aucune histoire ne démarre avant la fin de cette phase.

- [X] T005 Créer `scripts/odoo/lib/pages.ts` : la liste des 9 pages du site (`url` ↔ fichier descripteur ↔ nom court), export typé consommé par le résolveur, `pages-navigation.spec.mts` et `extract/odoo-page-parity/` ; `/` = home. La liste est une **liste blanche des 9 URL écrite en dur**, jamais dérivée d'un motif de nom de fichier : `pages/` contient aussi des descripteurs qui ne sont pas des pages du site et **tous ne finissent pas par `-test.json`** — relevé du 2026-09-08, `hero-video-mesure.json` en est un. Le résolveur en `--check` **refuse en nommant le fichier** tout descripteur de `pages/` qui n'est ni dans la liste blanche ni un `*-test.json` : un nouveau fichier de travail doit être classé, jamais ignoré en silence (§V, data-model §1)
- [X] T006 Vérifier que `scripts/odoo/lib/pages.ts` est couvert par le tsconfig racine (`npx tsc --noEmit` vert) et que la liste correspond aux 9 URL du tableau R1 de research.md

**Checkpoint**: l'identité des 9 pages est unique et typée — US1, US2 et US3 peuvent démarrer (US3 en parallèle sur les 2 pages existantes).

---

## Phase 3: User Story 1 — Les sept pages existent, depuis leur fichier de contenu (Priority: P1) 🎯 MVP

**Goal**: neuf descripteurs de page, un contenu commun écrit une seule fois et surchargé champ par champ, une destination par bouton avec grammaire fermée et refus nommé, et les sept pages manquantes en ligne.

**Independent Test**: reconstruire les 9 pages sur `piqueray-odoo-037`, ouvrir les 9 adresses (sections dans l'ordre de la vue Figma, textes, photos, boutons) ; modifier un champ du commun, reconstruire : toutes les pages qui le reprennent l'affichent, la page qui le surcharge garde sa surcharge.

### Tests pour US1 (exigés par FR-019/SC-007) ⚠️

> Écrire la fixture et le cas d'éval **avant** de documenter le mécanisme ; le cas doit rougir sur un résolveur incomplet.

- [X] T007 [P] [US1] Créer les fixtures `evals/fixtures/odoo-pages/` : un commun minimal, une page qui reprend, une page qui surcharge (une part de `set_html` + la liste `cards`), une page à `commun` inconnu, une page à clé orpheline, une page à destination `javascript:`, une page à chemin interne inconnu, une page à externe hors liste, une page à bouton sans destination, **une page à `component` inconnu du module**, **un descripteur de `pages/` hors liste blanche et hors motif `*-test.json`** (D11, F5/F8)
- [X] T008 [US1] Ajouter le cas `odoo-pages-resolve-determinism-and-refusals` (famille C1+C2) dans `evals/run.ts` : deux résolutions byte-identiques ; part surchargée conservée ET part non surchargée qui suit une correction du commun (invariant SC-004 de data-model §4) ; **sept** refus nommés (fichier, section, clé/part, valeur) — commun inconnu, orphelin, `javascript:`, chemin interne inconnu, externe hors liste, **`component` inconnu du module**, **descripteur non classé** ; bouton sans destination → ligne de registre, `href` inchangé

### Implémentation US1

- [X] T009 [P] [US1] Écrire `integrations/odoo/authoring/commun/devis.json` — section propre complète du bloc Devis, extraite de la copie actuelle de `pages/home.json` (D1)
- [X] T010 [P] [US1] Écrire `integrations/odoo/authoring/commun/reassurances.json` — variante de référence (5 cartes, celle de la home corrigée le 2026-09-07), les 4 cartes d'À Propos restant une surcharge de page
- [X] T011 [P] [US1] Écrire `integrations/odoo/authoring/commun/avis-google.json` — bloc Avis Google commun (avis + `ecrire-avis`, `lire-la-suite` par avis)
- [X] T012 [P] [US1] Écrire `integrations/odoo/authoring/commun/destinations-externes.json` — liste **fermée** `{ "<url>": "<raison>" }` : avis Google et réseaux sociaux uniquement (D3)
- [X] T013 [US1] Implémenter la fusion dans `scripts/odoo/resolve-page.ts` : `{ "commun": "<bloc>" , "surcharge"?: … }` → section propre résolue ; scalaires remplacés, listes (`cards`/`reviews`/`rows`) remplacées **entières**, dictionnaires (`set_html`/`set_button`/`images`/`links`) fusionnés **par part**, listes de classes (`remove_class`/`add_class`/`set_empty`) en union (data-model §4)
- [X] T014 [US1] Implémenter les refus de fusion dans `scripts/odoo/resolve-page.ts` : `component` et `commun` ensemble, `commun` inconnu, **`component` inconnu du module** (liste des blocs lue par parse de `integrations/odoo/addons/piqueray_ds/views/components.xml` — pas de liste recopiée à la main, qui périmerait en silence), clé de surcharge orpheline, part surchargée absente du commun et du gabarit — chaque refus nomme fichier, section, clé/part, valeur puis `exit 1` (FR-006, data-model §2)
- [X] T015 [US1] Implémenter la grammaire des destinations dans `scripts/odoo/resolve-page.ts` : `#…`, `/` ou `/<slug>` **présent dans `pages.ts`**, `tel:`, `mailto:`, `https://` **présent dans `destinations-externes.json`** ; refus nommé pour `javascript:`, `data:`, `//hôte`, `http://`, chemin inconnu, valeur vide (D3, data-model §5)
- [X] T016 [US1] Implémenter le refus « copie locale interdite » dans `scripts/odoo/resolve-page.ts` : une section **propre** dont le `component` est `s_pqr_devis`, `s_pqr_reassurances` ou `s_pqr_google_reviews_section` est refusée (SC-004, data-model §2)
- [X] T017 [US1] Implémenter le registre des restes et le CLI dans `scripts/odoo/resolve-page.ts` : bouton/carte présent sans destination → `href="#"` conservé + entrée `{page, section, part}` ; mode `--check` sur les 9 pages (`npm run odoo:pages:check`), sortie texte et `--json`, exit 1 au premier refus (contracts/README § Commandes)
- [X] T018 [US1] Brancher le résolveur dans `integrations/odoo/authoring/page.sh` : résoudre **avant** tout appel Docker, écrire le descripteur résolu dans un fichier temporaire, n'appeler `run-compose.sh` qu'en cas de succès (D2 — `run-compose.sh` reste inchangé et reçoit un descripteur déjà résolu)
- [X] T019 [US1] Ajouter **la seule** addition à `integrations/odoo/authoring/compose_page.py` : `set_link` — pose `href` sur `[data-pqr-part="<part>"] a[data-pqr-part="button-root"]`, sinon sur `a[data-pqr-part="<part>"]`, et `data-pqr-cta-href` pour une carte (mêmes résolutions que `SetCtaHrefAction`/`SetLinkHrefAction`/`repeat_action.js`, D3) ; aucune autre branche
- [X] T020 [US1] Capturer l'**AVANT** de la reprise (D12) : composer `home` et `portes-de-garage` tels quels sur `piqueray-odoo-037`, capturer les 4 largeurs sous `.page-parity/037/avant/`. **Cette tâche est bloquée par T049** (`extract/odoo-page-parity/capture.ts`) : pas de repli improvisé — une fois `home.json` et `portes-de-garage.json` réécrits (T021/T022), l'état d'avant est perdu **définitivement**, et une capture faite par un autre chemin ne serait pas comparable à celle d'après (constitution §X : capturer tout ce qui sera touché, vérifier chaque capture non vide et à la bonne taille, **avant** la première mutation). Vérifier les 8 PNG (2 pages × 4 largeurs) non vides et à la largeur attendue avant de laisser démarrer T021
- [X] T021 [US1] Réécrire `integrations/odoo/authoring/pages/home.json` : les trois blocs communs par référence (`{"commun": …}`), suppression de toute copie locale, `links` sur chaque bouton tranché (FR-004)
- [X] T022 [US1] Réécrire `integrations/odoo/authoring/pages/portes-de-garage.json` dans le même modèle (commun par référence + `links`)
- [X] T023 [US1] Prouver la non-régression : recomposer les deux pages, capturer l'**APRÈS**, comparer avant ↔ après avec `npm run images:compare` (strict) aux 4 largeurs → `identical` attendu ; reçu sous `specs/037-pages-odoo-navigation-pixel/proofs/reprise-sans-regression.md` (scénario 5 de US1)
- [X] T024 [P] [US1] Page **Portes résidentielles** : relevé REST de la vue wide `2774:29331` (textes + plages gras → `<strong>`, `imageHash`), export des photos par leurs **octets d'origine** en JPEG ≤ 1728 dans `integrations/odoo/authoring/assets/`, puis écrire `integrations/odoo/authoring/pages/portes-residentielles.json` (ordre des sections du descripteur : Hero › CategoriesPrincipales › Devis › Reassurances › Realisations › FAQ › AvisGoogle › TexteSEO — **le Header et le Footer de la vue ne sont PAS des sections du descripteur** : ce sont les zones de `website.layout` posées par l'addon, cf. `home.json` qui porte 8 sections là où sa vue en liste 9 + Header) et composer sur `piqueray-odoo-037` → `COMPOSE_OK` + URL en 200
- [X] T025 [P] [US1] Page **Portes industrielles** — même procédé depuis la vue wide `2782:44768`, fichier `integrations/odoo/authoring/pages/portes-industrielles.json` (même ordre que résidentielles)
- [X] T026 [P] [US1] Page **Portes d'entrée** — vue wide `2778:33757`, fichier `integrations/odoo/authoring/pages/portes-entree.json` (même ordre que résidentielles)
- [X] T027 [P] [US1] Page **Motorisation** — vue wide `2777:32059`, fichier `integrations/odoo/authoring/pages/motorisation.json` (Hero › CategoriesPrincipales › Devis › ProduitsECommerce › TexteSEO — Header/Footer exclus, cf. T024)
- [X] T028 [P] [US1] Page **Dépannage/SAV** — vue wide `2782:37669`, fichier `integrations/odoo/authoring/pages/depannage-sav.json` (Hero › FAQ › CategoriesPrincipales › Devis › AvisGoogle › TexteSEO — Header/Footer exclus, cf. T024 ; Catégories en `variant` empilé, D9)
- [X] T029 [P] [US1] Page **À Propos** — vue wide `2782:41185`, fichier `integrations/odoo/authoring/pages/a-propos.json` (Hero › Presentation › Equipe › Devis › Reassurances › AvisGoogle › TexteSEO — Header/Footer exclus, cf. T024) avec la **surcharge** des Réassurances (titre propre + liste de 4 cartes) — exemple canonique de FR-003
- [X] T030 [P] [US1] Page **Contactez-nous** — vue wide `2782:48534` (section montée en session, D13), fichier `integrations/odoo/authoring/pages/contactez-nous.json` (Hero › Formulaire › Coordonnees › AvisGoogle › TexteSEO — Header/Footer exclus, cf. T024) ; l'envoi du formulaire est hors périmètre et l'écart de source (ni Adresse, ni Sujet, ni les deux boutons de la base v1) est noté pour le registre
- [X] T031 [US1] Vérifier les clés du composeur non encore exercées par une page réelle (Réalisations, Coordonnées — jamais composées hors `*-test.json`, D9) : si une part manque, la couvrir dans `integrations/odoo/authoring/compose_page.py` sur le modèle existant, sans nouveau bloc ni nouveau contrat (SC-010)
- [X] T032 [US1] `npm run odoo:pages:check` : **0 refus** sur les 9 pages, registre des restes imprimé ; `--json` produit `{pages, restes}` conforme à contracts/README
- [X] T033 [US1] Prouver la rejouabilité (FR-007 / SC-005) : relancer la composition des 9 pages sans changement, comparer les `arch_db` (ou les captures) passe 1 ↔ passe 2 → identiques ; reçu sous `proofs/rejouabilite-composition.md`
- [X] T034 [US1] Prouver la propagation du commun (scénario 2 et 3 de US1) : modifier un champ de `commun/devis.json`, reconstruire les 9 pages → le nouveau texte sur 100 % des pages qui reprennent, la surcharge d'À Propos intacte ; reçu conservé, puis revenir au texte d'origine

**Checkpoint**: les neuf adresses répondent, le commun est unique, les destinations sont posées ou listées. US1 livrable seule (MVP).

---

## Phase 4: User Story 2 — La navigation mène toujours quelque part, et sait où on est (Priority: P2)

**Goal**: l'arbre validé par l'owner est semé (Motorisation sous Portes de garage), chaque lien mène à une page existante, l'entrée active est exacte, et un test rejouable sur les **vraies** pages le prouve.

**Independent Test**: lancer `pages-navigation.spec.mts` sur l'instance où les 9 pages sont construites → 100 % des liens en 200, arbre = `contracts/menu-tree.json`, actif exact ; `--red` dépublie une page et exige l'échec nommé.

### Tests pour US2 (exigés par FR-019/SC-007) ⚠️

- [X] T035 [US2] Ajouter le cas `odoo-pages-navigation-tree` (famille C3) dans `evals/run.ts` : parser `integrations/odoo/addons/piqueray_ds/data/menu_seed.xml` et prouver l'égalité avec `specs/037-pages-odoo-navigation-pixel/contracts/menu-tree.json` (libellés, URL, parents, ordre) ; déplacer une entrée dans le semis fait rougir le cas (D11)

### Implémentation US2

- [X] T036 [US2] Corriger `integrations/odoo/addons/piqueray_ds/data/menu_seed.xml` : `menu_motorisation.parent_id → menu_portes_garage`, `sequence 30` (après résidentielles 10, industrielles 20) ; le `noupdate="1"` est conservé (FR-008, D4)
- [X] T037 [US2] Passer `integrations/odoo/addons/piqueray_ds/__manifest__.py` en version `19.0.1.17.0` et écrire `integrations/odoo/addons/piqueray_ds/migrations/19.0.1.17.0/post-migration.py` : re-parenter `piqueray_ds.menu_motorisation` **uniquement** si l'enregistrement existe encore **et** que son `parent_id` est encore `piqueray_ds.menu_portes_entree` (le placement inféré de 022) ; sinon ne rien faire (FR-012 : jamais réécrire un menu édité par le client)
- [X] T038 [US2] Mettre à jour la zone manuelle comptée `ODOO-022-MENU-SEED` dans `integrations/odoo/config/adaptation-registry.json` (mécanisme + `decisionRefs` vers FR-008 / D4) et vérifier `npm run odoo:derivation:check` toujours vert (la zone reste classée)
- [X] T039 [US2] Écrire `integrations/odoo/qa/scenarios/pages-navigation.spec.mts` (harnais 019 : `readQaEnv`, `baseUrl`, `odooShell`) : pour chacune des 9 URL de `scripts/odoo/lib/pages.ts`, `GET` public → 200 et `#wrap.o_pqr_page` présent ; cache Odoo contourné par `?pqr=<nonce>` (leçon `header-menu.spec`). **Assertion anti-souche, obligatoire** : chaque page doit porter **au moins une section `[data-snippet^="s_pqr_"]`**, et le nombre de sections doit être celui de son descripteur résolu. Raison : `header-nav.spec.mts` (022) **crée des pages-fixtures** aux mêmes 8 URL quand elles n'existent pas (`piqueray_ds_qa.nav_fixture`, une `<section class="s_text_block">` avec « Fixture QA ») — sans cette assertion, lancé après lui sur la même instance, ce scénario passerait au vert **sur des souches** et prouverait le contraire de ce qu'il annonce
- [X] T040 [US2] Compléter `pages-navigation.spec.mts` — énumération des liens : bureau (`.header__nav a[href]`, `.dropdown-menu .dropdown-item`), mobile (`[data-pqr-part="menu-entree-tete"]`, `[data-pqr-part="menu-entree-sous-entree"]`, logo, téléphone, CTA), en-tête (logo, CTA) et pied (logo, CTA, `tel:`/`mailto:`, sociaux) ; chaque interne suivi en `GET` → 200 (FR-009, SC-002)
- [X] T041 [US2] Compléter `pages-navigation.spec.mts` — arbre et état actif : l'arbre rendu (libellés, ordre, imbrication, URL) est égal à `contracts/menu-tree.json` ; `data-actif`/`aria-current` sur l'entrée attendue (enfant **et** parent pour une page enfant, **aucune** sur `/`) et sur aucune autre (FR-010, SC-003)
- [X] T042 [US2] Implémenter la **preuve rouge** dans `pages-navigation.spec.mts` : `--red <url>` dépublie la page via `odooShell` (`website.page.is_published = False`), rejoue, exige l'échec qui **nomme** le lien fautif et chaque page hôte, puis republie ; reçus JSON rouge **et** vert conservés sous `specs/037-pages-odoo-navigation-pixel/proofs/navigation/` (FR-011, SC-002)
- [X] T043 [US2] Mettre à jour `integrations/odoo/qa/scenarios/header-nav.spec.mts` (spec 022) : `motorisation` attend désormais le parent actif « Portes de garage » ; laisser le commentaire de `harness.xml` inchangé (il ne cite que les 4 tops)
- [X] T044 [US2] Exécuter la navigation sur `piqueray-odoo-037` avec les 9 pages construites : vert sur les 9 pages, rouge nommé sur `--red /motorisation`, page republiée à la fin. **Ne jamais lancer `header-nav.spec.mts` (022) sur `piqueray-odoo-037`** : il y poserait des pages-fixtures aux URL des vraies pages. Il garde son instance 022 ; si la fixture `piqueray_ds_qa.nav_fixture` apparaît sur 037, la supprimer et **relancer** la navigation avant de conserver le reçu

**Checkpoint**: US1 + US2 fonctionnent ensemble — les pages existent et la navigation y mène, prouvée.

---

## Phase 5: User Story 3 — Chaque page entière est mesurée contre ses quatre vues Figma, et le rapport reste (Priority: P3)

**Goal**: un instrument du dépôt capture chaque page aux 4 largeurs, la compare à sa vue Figma v2 (alignement en haut, hauteur commune, Δh en clair, diagnostic section par section) et conserve 36 rapports.

**Independent Test**: lancer l'outil sur Home et Portes de garage → 4 rapports par page, lisibles sans rien relancer ; relancer sans changement → scores identiques ; décaler une section → le score bouge et le rapport le montre.

**Note d'ordonnancement**: l'instrument (T045–T054) ne dépend que de la Phase 2 et des deux pages **existantes** — il peut être développé **en parallèle de US1** (spec, « Why this priority » de US3). Seules T057–T059 exigent US1 terminée.

### Tests pour US3 (exigés par FR-015/FR-019/SC-007) ⚠️

- [X] T045 [US3] Écrire `extract/odoo-page-parity/selftest.ts` — hors ligne, PNG synthétiques : identique → 0 % ; section décalée de 40 px → **pixel rouge** ; +64 px de hauteur à contenu identique → **hauteur rouge** + section d'origine nommée ; deux passes byte-identiques ; entrée manquante → `impossible` avec raison ; **cas d'appariement (F1) : une vue synthétique de 10 enfants dont le premier est un Header et le dernier un Footer, face à un `#wrap` de 8 sections → `structure: "égale"` et aucune section d'origine ; retirer le retrait du Footer fait rougir ce cas** (D6, D11)
- [X] T046 [US3] Ajouter le cas `odoo-page-parity-selftest` (famille C1+C3) dans `evals/run.ts`, adossé aux PNG synthétiques de `evals/fixtures/odoo-pages/` (aucun Docker, aucun réseau)

### Implémentation US3

- [X] T047 [P] [US3] Écrire `extract/odoo-page-parity/views.json` — manifeste des 36 vues : `fileKey d9FYAUcqdcNtsuaMgLefvJ`, `seuilPct: 5` et `toleranceHauteurPx: 10` (owner 2026-09-08, avec leur date et leur raison), `largeurs [390,834,1200,1728]`, et par page l'`url`, le `fichier` du descripteur, les 4 `nodeId` + hauteur au relevé du tableau R1 (D7, D8, contracts/views.schema.json)
- [X] T048 [P] [US3] Écrire `extract/odoo-page-parity/figma-views.ts` — export REST **lecture seule** (`FIGMA_TOKEN`) : `GET /v1/images/<file>?ids=…&format=png&scale=1` et `GET /v1/files/<file>/nodes?ids=…&depth=1` (boîtes des enfants) ; largeur exportée ≠ largeur attendue → `impossible — vue de mauvaise largeur` ; nœud absent → `impossible — vue introuvable` (D8)
- [X] T049 [US3] Écrire `extract/odoo-page-parity/capture.ts` — `launchBrowser()` du dépôt, un contexte neuf par largeur (viewport 390/834/1200/1728 × 1200, **DPR 1**, `colorScheme: light`, `locale fr-FR`), `domcontentloaded` + `document.fonts.ready` borné 5 s + défilement complet puis retour en haut + 1,2 s, `fullPage` ; **refus avant photo** : HTTP ≠ 200, `#wrap.o_pqr_page` absent, hauteur < 10 px, largeur du document ≠ viewport ; relevé des boîtes `#wrap > section` (`data-snippet`, y, h) dans le même contexte (D6)
- [X] T050 [US3] Écrire `extract/odoo-page-parity/compare.ts` — aplat alpha → blanc, **alignement en haut**, rognage à la hauteur commune, puis `compareDecodedImages` d'`extract/image-parity` **par la porte bibliothèque** (jamais le CLI) ; score = `diffCount / (largeur × hauteurCommune) × 100` ; `Δh = hOdoo − hFigma` écrit en clair avec la règle de cadrage ; verdicts `pixel` / `hauteur` (`bruit` si |Δh| ≤ 10, sinon `rouge` même si le pixel passe) / `page` (FR-014, D6)
- [X] T051 [US3] Écrire `extract/odoo-page-parity/sections.ts` — appariement **par position**, après avoir retiré du côté Figma **le Header ET le Footer** : côté Odoo, `#wrap > section` ne contient ni l'un ni l'autre (le pied de page est la zone `//div[@id='footer']` de `website.layout`, `views/footer.xml` l. 8 ; l'en-tête est au-dessus du `#wrap`), alors que les vues v2 les portent comme enfants (R1 : chaque ordre se termine par « › Footer », la home ajoute « (+Header) »). **Vérifié le 2026-09-08 : `home.json` porte 8 sections là où sa vue en liste 9 + Header — sans ce retrait, chaque page sortirait un faux `"8 vs 10 sections"` et un `sectionOrigineDecalage` faux.** Ensuite : Δh par section et Δy cumulé, `sectionOrigineDecalage` = première section dont le Δy cumulé dépasse la tolérance ; nombre de sections différent **après retrait** → écart de structure **nommé** (`"<n> vs <m> sections"`), jamais silencieux
- [X] T052 [US3] Écrire `extract/odoo-page-parity/report.ts` — un JSON par largeur conforme à `contracts/rapport-mesure.schema.json` (statut, figma/odoo + sha256, Δh, règle de cadrage, hauteur commune, score, seuil, trois verdicts, sections, `ecartsContenu`, `cause`/`justification` à `null`), triptyque **1:1** via `writeTriptych` sous `.page-parity/037/<page>/` (hors dépôt) avec son sha256 dans le JSON ; `impossible` toujours accompagné de sa raison (FR-017, §XII)
- [X] T053 [US3] Écrire `extract/odoo-page-parity/cli.ts` — `npm run odoo:pages:measure -- <page> [--base URL] [--out DIR] [--only-figma|--only-odoo]` ; **aucun drapeau** ne peut changer seuil ni tolérance (D7) ; exit 0 si 4 `mesurée`, 1 si un `rouge`, 2 si un `impossible` (jamais confondus)
- [X] T054 [US3] Faire passer `npm run odoo:pages:selftest` et le cas d'éval `odoo-page-parity-selftest` au vert (preuve que l'instrument voit ce qu'il doit voir, **avant** toute mesure réelle — FR-015)
- [X] T055 [US3] Mesurer **Portes de garage** sur `piqueray-odoo-037` : 4 rapports `mesurée`, scores du même ordre que la mesure manuelle du 2026-09-07 (3,67 · 2,41 · 1,71 · 1,90 %), `|Δh| ≤ 10` → `verdictHauteur: bruit`, `verdictPage: vert` (SC-006)
- [X] T056 [US3] Mesurer **Home** : `verdictHauteur: rouge` aux largeurs où Δh > 10 (mesuré 2026-09-04 : +128 +118 +34 +70), `sectionOrigineDecalage` nommée, score affiché **à côté** de Δh et jamais seul (SC-006, §XII)
- [X] T057 [US3] Prouver le rouge sur une **vraie** page : retirer la section Devis de `integrations/odoo/authoring/pages/motorisation.json`, recomposer, mesurer → `verdictPixel: rouge` + `structure: "6 vs 7 sections"` ; remettre, recomposer, re-mesurer → vert ; reçu conservé sous `proofs/mesure/` (scénario 5 de US3)
- [X] T058 [US3] Prouver le déterminisme de la mesure (SC-005) : relancer une mesure sans changement → `scorePct`, `ecartHauteurPx` et `sha256` identiques ; reçu dans `proofs/mesure/determinisme.md`
- [X] T059 [US3] Produire les **36 rapports** (9 pages × 4 largeurs) sous `specs/037-pages-odoo-navigation-pixel/proofs/mesure/<page>/<largeur>.json` : aucun manquant ; **noter au reçu la durée observée d'une mesure (4 largeurs) et de la reconstruction des 9 pages**, en regard des repères du plan (< 3 min / < 10 min) ; tout `impossible` porte sa raison et part au registre des restes ; **tout rapport au-dessus du seuil est recevable UNIQUEMENT avec sa cause dominante nommée (T060) et une décision owner datée — jamais corrigé en touchant un contrat, un jeton ou un bloc (SC-010)** (SC-001)
- [X] T060 [US3] Renseigner à la main `ecartsContenu` / `cause` / `justification` des rapports concernés et lister les écarts de **source** connus (double espace du hero Portes de garage, U+2028 du titre Devis v2, « portes de garage industrielles » dans les Réassurances d'À Propos, graisse Regular du titre hero de Motorisation/À Propos, Équipe Desktop 2652 px, formulaire v2 sans Adresse/Sujet) — nommés au rapport, **tranchés à la source par l'owner**, jamais contournés dans la page (FR-018, D9, D13)
- [X] T061 [US3] Écrire `specs/037-pages-odoo-navigation-pixel/proofs/RAPPORT-MESURE.md` — synthèse lisible des 36 rapports : par page et par largeur, verdict, score **et** Δh côte à côte, section d'origine du décalage le cas échéant (FR-013, scénario 6 de US3)

**Checkpoint**: les trois histoires sont indépendamment fonctionnelles ; les pages sont construites, atteignables et mesurées.

---

## Phase 6: User Story 4 — L'owner valide chaque page à l'écran, et ce qui reste à l'ancienne est écrit (Priority: P4)

**Goal**: neuf validations owner datées et un registre des restes sans exception.

**Independent Test**: le registre existe, chaque ligne nomme une page ou un mécanisme, et chaque page a une trace de validation (date, page, verdict).

- [ ] T062 **[NON FAIT — le pilote 8087 est levé par un autre worktree (`oceanic-oak`) et monte SES addons ; le mettre à jour ferait servir un module qui n'est pas celui de cette vague. Décision owner attendue (RAPPORT-CLOTURE §4).]** [US4] Passer le **pilote** `piqueray-odoo-pilote` (8087) au chemin update : `odoo -u piqueray_ds` avec identifiants (piège docs/16) → la migration `19.0.1.17.0` re-parente Motorisation seulement si elle est encore sous « Portes d'entrée » ; vérifier l'arbre rendu
- [X] T063 **[FAIT sur `piqueray-odoo-037` (8109) et non sur le pilote — celui-ci est levé par un autre worktree. Les neuf pages y sont construites et les liens éditeur fournis.]** [US4] Reconstruire les 9 pages sur le pilote (`npm run odoo:page -- <page> piqueray-odoo-pilote` ×9) et fournir à l'owner les liens **éditeur** `http://localhost:8087/odoo/website?path=<url>&enable_editor=1&with_loader=1` (mémoire projet : jamais le lien visiteur)
- [X] T064 [US4] Tenir `specs/037-pages-odoo-navigation-pixel/proofs/validations-owner.md` — une ligne datée par page (`date · page · verdict · lien éditeur`) ; zéro page « validée » sans ligne (SC-008)
- [X] T065 **[FAIT une fois : l'Équipe d'À propos est repassée par correction du descripteur → recomposition → re-mesure → nouveau verdict, dans cet ordre (2026-09-08).]** [US4] Boucler chaque page renvoyée « à corriger » : correction du descripteur → recomposition (US1) → re-mesure (US3) → nouveau verdict daté, jamais l'inverse (FR-020)
- [X] T066 [US4] Écrire `specs/037-pages-odoo-navigation-pixel/proofs/registre-restes.md` — lignes typées de data-model §9 : `destination-non-tranchée (page, section, part)` depuis `odoo:pages:check --json` ; `commun-figé-par-page` avec la commande qui rafraîchit (`npm run odoo:page -- <page> <projet>` ×9, Odoo ne propage rien) ; `vue-manquante (page, largeur)` (attendu : aucune) ; `écart-au-dessus-du-seuil (page, largeur, score, cause dominante)` ; **`hauteur-rouge (page, largeur, Δh, section d'origine, décision attendue)` — ligne distincte du précédent (l'un parle du pixel, l'autre de la hauteur) ; attendu au moins : la home aux 4 largeurs** ; `écart-de-source (fait, décision attendue)` dont ceux de D9/D13 (FR-021, SC-009)

**Checkpoint**: livrable clos et honnête — rien de « à peu près fini » qui ne soit écrit.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: la documentation vient **après** les évals (§II), et toutes les portes sont vertes.

- [X] T067 [P] Documenter dans `integrations/odoo/authoring/README.md` — le contenu commun, la surcharge par champ, la clé `links` et sa grammaire fermée, le registre des restes ; **uniquement après** T008, T035 et T046 verts (SC-007)
- [X] T068 [P] Documenter la mesure de page entière dans `docs/16-mode-emploi-composant-vers-odoo.md` (§Étape 8 ou une section « mesure de page ») : l'instrument, le seuil 5 %, la tolérance 10 px, la règle d'alignement en haut ; jamais un `N/N` d'éval en prose
- [X] T069 Exécuter les portes de la constitution : `npm run build`, `npm run parity`, `npm run eval`, `npm run plugin:check`, `npx tsx scripts/deterministic-roundtrip.mjs`, `node scripts/core-browser-check.mjs`, `npx tsc --noEmit`, `npx tsc -p tsconfig.build.json`
- [X] T070 Exécuter les portes Odoo : `npm run odoo:authoring:check`, `odoo:module:check`, `odoo:derivation:check`, `odoo:typecheck`, `odoo:visual:selftest`, `odoo:pages:check`, `odoo:pages:selftest`
- [X] T071 Vérifier le **re-pin zéro** annoncé (SC-010, D14) : `git status` ne montre aucun changement de `evals/golden.json`, `figma-sync/plugin/engine.receipt.json`, `examples/polaris/`, `src/`, `contracts/`, `tokens/` ; si `catalog/` bouge, **signaler** la dérive non gardée connue (018) sans la « corriger » ici. **Vérifier aussi FR-022** : aucune version Figma neuve datée de l'exécution de cette vague (`figma_get_file_versions` en lecture) — la seule mutation admise est le montage des vues de Contactez-nous du 2026-09-08, décidé par l'owner hors spec et déjà tracé ; toute autre est une violation à nommer, pas à absorber
- [X] T072 Rejouer `specs/037-pages-odoo-navigation-pixel/quickstart.md` de bout en bout (§0 à §8) et noter tout écart entre l'attendu écrit et l'observé
- [X] T073 Écrire `specs/037-pages-odoo-navigation-pixel/RAPPORT-CLOTURE.md` — ce qui est livré, ce qui reste (renvoi au registre), les faits neufs à ne pas re-découvrir, et une entrée datée dans `MILESTONES.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** : aucune dépendance
- **Foundational (Phase 2)** : dépend du Setup — **bloque toutes les histoires**
- **US1 (Phase 3)** : après Phase 2 ; **T020 y attend T049** (capture de l'AVANT, §X) — seul point où US1 dépend de la Phase 5
- **US2 (Phase 4)** : après Phase 2 ; ses **exécutions** (T044) exigent les 9 pages de US1
- **US3 (Phase 5)** : après Phase 2 ; l'instrument (T045–T054) se développe **en parallèle de US1** sur les 2 pages existantes ; **T049 est à livrer tôt : T020 l'attend** ; les 36 rapports (T059) exigent US1
- **US4 (Phase 6)** : après US1, US2 et US3
- **Polish (Phase 7)** : après tout le reste ; T067/T068 sont en outre bloquées par T008, T035, T046 (règle §II)

### Dépendances internes notables

- T005 → tout (identité des 9 pages)
- T013 → T014 → T015 → T016 → T017 (même fichier `resolve-page.ts`, séquentiel)
- T017 → T018 (page.sh appelle le résolveur) ; T019 indépendant de T013–T017 (fichier Python distinct)
- T009–T012 (commun) → T021/T022 (reprise) → T023 (preuve de non-régression)
- **T049 → T020 → T021/T022** : la capture de l'AVANT exige l'outil de capture (T049) et **doit** précéder la réécriture des descripteurs — une fois ceux-ci réécrits, l'avant est perdu définitivement (constitution §X). C'est la seule dépendance de US1 vers la Phase 5 : si les deux chantiers avancent en parallèle, T049 est la première tâche de mesure à livrer
- T045 → T046 → T054 → T055/T056 → T057 → T059 (l'instrument est prouvé avant de servir, FR-015)
- T036/T037 → T035 rougit puis verdit ; T038 après T036
- T059 + T060 → T061 ; T066 dépend de T032 (`--json`), T059 et T060

### Parallel Opportunities

- Phase 1 : T002, T003, T004 ensemble
- US1 : les quatre fichiers de commun (T009–T012) ensemble ; les **sept pages** (T024–T030) ensemble une fois T013–T019 posés
- US3 : T047 et T048 ensemble ; toute la Phase 5 en parallèle de la Phase 3 (équipe à deux)
- Polish : T067 et T068 ensemble

---

## Parallel Example: US1, les sept pages

```bash
# Une fois le résolveur et set_link posés (T013–T019), les sept pages sont indépendantes :
Task: "Portes résidentielles — relevé 2774:29331, assets, descripteur, compose"   # T024
Task: "Portes industrielles — relevé 2782:44768, …"                                # T025
Task: "Portes d'entrée — relevé 2778:33757, …"                                     # T026
Task: "Motorisation — relevé 2777:32059, …"                                        # T027
Task: "Dépannage/SAV — relevé 2782:37669, …"                                       # T028
Task: "À Propos — relevé 2782:41185, + surcharge Réassurances 4 cartes"            # T029
Task: "Contactez-nous — relevé 2782:48534 (section montée D13)"                    # T030
```

---

## Implementation Strategy

### MVP d'abord (US1 seule)

1. Phase 1 : Setup (worktree autonome, instance jetable)
2. Phase 2 : Foundational (`pages.ts`) — **bloquant**
3. Phase 3 : US1 — les neuf pages depuis leurs fichiers
4. **STOP et VALIDER** : ouvrir les 9 adresses, prouver la propagation du commun et la rejouabilité
5. Montrable à l'owner sur le pilote

### Livraison incrémentale

1. Setup + Foundational → base prête
2. US1 → sept adresses vides deviennent sept pages (MVP)
3. US2 → la navigation y mène et le prouve
4. US3 → chaque page est mesurée, 36 rapports conservés
5. US4 → validations datées + registre des restes → clôture

### Équipe à deux

Une fois la Phase 2 finie : un développeur sur US1 (contenu, résolveur, sept pages), l'autre sur US3 (instrument, prouvé sur Home et Portes de garage). Ils se rejoignent à T059 (les 36 rapports).

---

## Notes

- Instance owner `piqueray-odoo-test` (8071) **interdite** ; construire et mesurer sur `piqueray-odoo-037`, valider sur le pilote 8087.
- `npm run odoo:save` vise l'instance de l'owner par défaut : toujours `--project` (piège 032).
- Aucune image lourde committée : PNG sous `.page-parity/037/`, sha256 dans le JSON.
- Le compte d'évals `N/N` n'est jamais écrit en prose (sauf journal daté).
- `odoo:derivation` tourne **à l'intérieur** de `npm run build` (piège 032) : la zone `ODOO-022-MENU-SEED` doit rester classée avant le build.
- Commit après chaque tâche ou groupe logique ; s'arrêter à chaque checkpoint pour valider l'histoire seule.
