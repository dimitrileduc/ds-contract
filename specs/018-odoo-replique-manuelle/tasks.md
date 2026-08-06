# Tasks: Répliquer à la main une chaîne gouvernée en blocs Odoo 19 (018)

**Input**: documents de conception de `/specs/018-odoo-replique-manuelle/`
**Prerequisites**: plan.md (requis), spec.md (user stories), research.md (D1–D16), data-model.md, contracts/ (**5** interfaces), quickstart.md

**Tests**: OUI — exigés explicitement par la spec et la constitution. Trois seulement, et chacun est nommé par un document : (1) **1 eval C1** pour la 4ᵉ sortie de jetons (Principe II, ordre `fixture → eval → claim` — l'eval est écrite ROUGE d'abord) ; (2) le **self-test hors ligne** du harnais de mesure (D6 : `specs/` est hors du `tsconfig` racine, donc un instrument que rien ne typecheck **et** que rien n'exécute est un instrument dont on ne sait rien) ; (3) la **suite de contrôles standard du dépôt** à chaque point de contrôle. Aucun test n'est ajouté pour le module Odoo lui-même : il est écrit à la main, hors de toute porte, et **c'est la définition de l'artefact** (FR-004/FR-015), pas un trou.

**Organisation**: une phase par user story, pour que chacune soit implémentable et vérifiable seule.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers disjoints, aucune dépendance sur une tâche non finie)
- **[Story]** : US1 (la chaîne existe), US2 (la gouvernance tient), US3 (l'écart d'image), US4 (la décision)
- Chemins de fichiers exacts dans chaque description

---

## Conventions de mesure et pièges nommés (valables partout ci-dessous)

Chaque point ci-dessous a été **vérifié sur ce dépôt le 2026-08-06**, pas supposé.

- **Statut de tout ce qui concerne Odoo : LU, jamais CONFIRMÉ** (research.md §II). SC-009 en fait une exigence : aucun fait établi par lecture du code d'Odoo ne peut être présenté comme acquis avant qu'une instance le confirme, et ce qui ne l'aura pas été reste marqué « non confirmé » dans le rapport.
- **`specs/` n'est PAS recopié dans `evals/.scratch`.** Vérifié : `evals/harness.ts:73` liste `contracts, tokens, scripts, core, parity, src, catalog, context, assets, extract, playground, workers, packages, figma-sync` — `specs` n'y est pas. La 4ᵉ sortie sera donc **créée** dans le scratch par le `mkdirSync(…, { recursive: true })` du pipeline, jamais copiée. L'eval doit lire son chemin **sous `SCRATCH`**, et c'est aussi la raison mécanique pour laquelle la sortie n'a **aucune** entrée golden.
- **`specs/` est hors du `include` du `tsconfig` racine** (`["src","scripts","core",".storybook","extract","parity","evals","figma-sync/plugin/engine"]`). Le harnais y est **invisible à `npx tsc --noEmit`** — même trou que `evals/fixtures`, qui a déjà mordu ce dépôt. D'où un `tsconfig.json` spec-local **et** un self-test hors ligne : les deux, jamais l'un des deux.
- **Deux sweeps d'eval en parallèle = faux rouges.** `evals/.scratch` est un chemin unique. Vérifier qu'aucune eval ne tourne avant d'en lancer une.
- **`Grep` / `Glob` sont refusés par un hook** : utiliser `rg` / `find` via Bash. Et `rg -a` systématiquement (octets NUL légitimes dans `core/emit-html.ts` et `extract/figma/visual-parity/run.ts` — sans `-a`, `grep` répond vide **sans erreur**).
- **Les 19 glyphes viennent du REGISTRE, jamais du répertoire.** `contracts/icons.registry.json` v1.2.0 porte **19** icônes ; `assets/icons/` contient **23** SVG — `check`, `close`, `google`, `google-wordmark` ne sont **pas gouvernés**. Embarquer le répertoire donnerait 23 glyphes et ferait **rater** SC-002 tout en ayant l'air de le dépasser.
- **Surface de re-pin attendue : ZÉRO**, et c'est vérifié par exécution (T012), jamais supposé. `scripts/update-golden.mjs` ne parcourt que `src/` et `figma-sync/*.js` ; `engine.receipt.json` ne dérive que sur édition tokens/contracts/icons (tous inchangés) ; `examples/polaris/figma/*.figma.js` ne dérive que sur édition d'émetteur (aucun touché). Si l'une des trois tombe, elle est **consignée avec sa cause**, jamais absorbée par un re-pin silencieux.
- **Aucune instance Odoo n'entre sur le chemin de la suite de contrôles standard** (invariant C6). La preuve Odoo se lance à la demande et se consigne — le patron des cycles de pont Figma des specs 003, 005 et 007.
- **Trou trouvé à la génération des tâches, et nommé plutôt que comblé en silence** : `contracts/odoo-tokens-output.md` §3 renvoyait vers un choix de préfixe que `research.md` §D11/P2 ne **nomme** jamais (il exclut `o-` et `bs-`, rien de plus). Le renvoi est corrigé ; **T006 tranche explicitement `--pqr-`** et consigne son relevé de non-collision : la décision est prise dans le chantier, pas héritée d'une phrase qui n'existe pas.
- **Classer en écrivant, jamais en comptant** (invariant M5 de `contracts/volumes.schema.md`, FR-017b). Chaque tâche qui **écrit** une ligne du module (T020–T024, T030–T033, T042) déclare au passage son poste dans `proofs/volumes.json` : `mecanique` avec l'**origine** d'où un émetteur l'aurait tirée, ou `cas-particulier` avec **le jugement rendu**. T048 agrège et vérifie que le compte ferme — il ne classe pas. Un classement reconstitué en relisant un fichier fini classerait ce qu'on a envie de classer, et comme **aucun seuil de décision n'est préétabli**, rien d'autre ne retiendrait ce chiffre.
- **Tout compte relevé avant T002 est périmé par construction.** La fusion `main` fait passer le vocabulaire de **222 à 231** propriétés `:root` et les trois contrats de version. Les nombres cités dans les documents de conception portent leur date ; T004 les re-relève. Ne jamais recopier — re-relever.

## La sweep (référence unique — citée par ID partout ci-dessous)

Elle tourne **dans le worktree**, et **sans aucune instance Odoo** :

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Plus, à partir de la Phase 5, le contrôle typé que le `tsconfig` racine ne voit pas :

```bash
npx tsc -p specs/018-odoo-replique-manuelle/harness/tsconfig.json --noEmit
```

---

## Phase 1: Setup (infrastructure partagée)

**Purpose**: worktree autosuffisant, **remis à niveau sur `main`**, et point de départ prouvé vert

**⚠️ T002 est la première tâche du chantier, avant toute ligne de module** (research.md §D1). Relevé du 2026-08-06 : `git merge-base --is-ancestor main HEAD` → **NON**. `HEAD` = `3c63c05` (post-015) ; `main` = `51cab06` (toute la spec 016). Les trois contrats de la chaîne diffèrent — `ds.button` **1.6.0 → 2.0.0** (bump MAJEUR, variant `outilneNoir` → `outlineNoir`), `ds.presentation` 2.1.0 → 2.2.0, `ds.section-header` 2.0.0 → 2.1.1 — et `tokens/primitives.tokens.json` gagne 2 tokens consommés par la chaîne. Monter ici graverait **la coquille corrigée** dans l'artefact de référence, et FR-017 mesurerait les volumes du mauvais montage.

- [X] T001 [Worktree gates — F1] Rendre ce worktree autosuffisant (constitution, Development Workflow: Worktree Gates) : `npm install` **dans** `/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/soapy-duckling` (`node_modules` y est **absent** — vérifié ; `npm run eval` symlinke le `node_modules` du checkout et refuse sans), puis `npx playwright install chromium` (deux contrôles pilotent un vrai Chromium). La sweep COMPLÈTE tourne dans ce worktree à chaque point de contrôle et à la clôture.
- [X] T002 Fusionner `main` dans `018-odoo-replique-manuelle` (research.md §D1) depuis la racine du worktree : `git merge main`, résoudre les conflits éventuels, puis **vérifier par exécution** que les trois contrats portent bien `ds.button` 2.0.0 / `ds.presentation` 2.2.0 / `ds.section-header` 2.1.1 et que le variant passé au bouton s'écrit `outlineNoir`. Archiver la sortie dans `specs/018-odoo-replique-manuelle/proofs/merge-main.txt`.
- [X] T003 Prouver le point de départ vert sur l'état fusionné : lancer la sweep (voir § La sweep) et archiver sa sortie intégrale dans `specs/018-odoo-replique-manuelle/proofs/depart-sweep.txt`. Le `N/N` de `npm run eval` imprimé par la commande fait foi — ne jamais le recopier depuis une prose. Créer au passage `specs/018-odoo-replique-manuelle/{proofs,zones,harness,instance}/`.
- [X] T004 Re-relever l'inventaire de la chaîne **sur l'état fusionné** et le consigner dans `specs/018-odoo-replique-manuelle/proofs/inventaire-chaine.md` : pour chacun des 3 contrats — version exacte, props et leurs valeurs, parts d'anatomie, références de tokens consommées, `literals` portés (canal + valeur + pointeur), et le chemin d'imbrication réellement emprunté (`ds.presentation` → `ds.section-header` → `ds.button`, avec les valeurs de props transmises). C'est l'**entrée de FR-009 (tableaux des zones), de FR-014 (non-portés) et de FR-017 (volumes)** : tout ce que le chantier compte ensuite se compte contre ce relevé. Confirmer ou infirmer les 4 littéraux actifs de research.md §D4 sur l'état fusionné — **ne pas les recopier**, les re-relever.

**Checkpoint**: le worktree est autosuffisant, à jour, vert, et la chaîne est inventoriée sur le bon état.

---

## Phase 2: Foundational (prérequis bloquants)

**Purpose**: la 4ᵉ sortie de jetons prouvée (le seul code de dépôt que 018 touche), le squelette du module, et les 3 tableaux des zones — **décidés avant tout montage** (invariant Z4)

**⚠️ CRITIQUE** : aucune user story ne démarre avant la fin de cette phase. Deux raisons distinctes, et les deux sont des ordres imposés, pas des préférences :

1. **Principe II** — « le pipeline de jetons a une 4ᵉ sortie additive et préfixée » est une **phrase de capacité**. Ordre non négociable : eval ROUGE (T005) → implémentation (T006) → eval VERTE (T007) → **puis seulement** la phrase de doc (T011). Écrire la doc avant l'eval serait une revendication sans preuve.
2. **Invariant Z4** — le tableau des zones d'un composant s'écrit **avant** son montage. Le montage l'exécute, il ne le justifie pas après coup. Le champ `mecanisme` reste `null` jusqu'à la Phase 4.

- [ ] T005 Écrire le cas d'eval **AU ROUGE d'abord** dans `evals/run.ts`, famille `claim: 'C1-determinism'`, id `odoo-tokens-output` : il vérifie les **7 invariants I1–I7** de `contracts/odoo-tokens-output.md` §4 — I1 additivité stricte (`src/styles/tokens.css`, `tokens.dark.css`, `tokens.brands.css` inchangés **au byte près**), I2 déterminisme ×2, I3 préfixe total (une seule déclaration sans préfixe = refus), I4 couverture (bijection avec les propriétés `:root` de `tokens.css`), I5 **dérivation et non transcription** (muter une valeur dans `tokens/*.tokens.json` DOIT changer la sortie Odoo — c'est le contrôle adversarial, celui qui distingue « généré » de « recopié une fois »), I6 en-tête `GENERATED — DO NOT EDIT` + commande de régénération, I7 alias non résolvable toujours refusé. **Piège structurel à respecter** : `resetScratch()` ne copie pas `specs/` — le cas lit son chemin sous `SCRATCH` (`path.join(SCRATCH, 'specs', '018-odoo-replique-manuelle', 'module', 'piqueray_ds', 'static', 'src', 'css', 'tokens.pqr.css')`), créé par le `mkdirSync` récursif du pipeline. Constater le ROUGE (fichier absent) et l'archiver dans `specs/018-odoo-replique-manuelle/proofs/eval-tokens-rouge.txt`.
- [ ] T006 Implémenter la 4ᵉ écriture dans `scripts/build-tokens.mjs` : même carte compilée `base` que `:root` (le vocabulaire **en entier**, pas seulement ce que les 3 composants consomment — 222 propriétés avant la fusion, **231 après**, donc ne pas coder le nombre : l'invariant I4 est une **bijection** avec `:root`, il se vérifie, il ne se compte pas à la main), même fonction `cssName()` **avec préfixe en plus**, alias préservés en `var(--pqr-…)`, **aucun bloc de mode** (Piqueray est mono-marque mono-mode — ajouter des blocs vides fabriquerait une capacité qui n'existe pas), en-tête `GENERATED FILE — DO NOT EDIT.` nommant `npm run tokens`. Destination : `specs/018-odoo-replique-manuelle/module/piqueray_ds/static/src/css/tokens.pqr.css` (`mkdirSync` récursif). **Trancher ici le préfixe** — `--pqr-` — et consigner son relevé de non-collision dans `specs/018-odoo-replique-manuelle/proofs/prefixe-non-collision.md` : ni `o-` (convention d'Odoo), ni `bs-` (nom que Bootstrap portait avant qu'Odoo ne force `$variable-prefix: ''`, le réintroduire serait un piège de lecture), et vérifié absent de la surface non préfixée qu'Odoo publie (`--primary`, `--body-bg`, `--base-100…900`, `--header-font-size`, `--headings-font`, `--palette-names`). Le pipeline reste **sans dépendance**.
- [ ] T007 Passer l'eval au VERT : `npm run eval` (vérifier qu'aucune autre eval ne tourne — `evals/.scratch` est un chemin unique). Le `N/N` imprimé fait foi. Archiver dans `specs/018-odoo-replique-manuelle/proofs/eval-tokens-vert.txt`.
- [ ] T008 Vérifier l'additivité et le déterminisme **à la main aussi**, comme quickstart.md §2 le prescrit : `git diff --stat src/styles/tokens.css src/styles/tokens.dark.css src/styles/tokens.brands.css` doit être **VIDE** ; puis deux `npm run tokens` consécutifs suivis de `shasum -a 256` sur la sortie Odoo doivent donner **la même empreinte**. Archiver les deux sorties dans `specs/018-odoo-replique-manuelle/proofs/tokens-additivite.txt`. Une eval verte et une vérification manuelle verte ne prouvent pas la même chose au même endroit — les deux sont demandées.
- [ ] T009 Vérifier **par exécution** les trois non-dérives attendues (research.md §D2) : `git diff --stat evals/golden.json figma-sync/plugin/engine.receipt.json examples/polaris/figma/` doit être **VIDE**. Archiver dans `specs/018-odoo-replique-manuelle/proofs/non-derives.txt`. Si l'une tombe, la consigner avec sa cause dans le même fichier — **jamais** l'absorber par un re-pin.
- [ ] T010 Sweep complète (voir § La sweep) → `specs/018-odoo-replique-manuelle/proofs/sweep-phase2.txt`. C'est le point de contrôle qui prouve que le seul changement de code de dépôt de la spec ne casse rien.
- [ ] T011 **APRÈS** T007 et jamais avant (Principe II) : bumper `docs/03-token-pipeline.md` — décrire la 4ᵉ sortie, sa destination, son préfixe, son caractère additif, et **la conséquence assumée** nommée en Complexity Tracking : `npm run tokens` acquiert une écriture permanente dans le dossier d'une spec, donc archiver ou déplacer 018 cassera `npm run build` tant que `build-tokens.mjs` ne sera pas mis à jour.
- [ ] T012 [P] Écrire `specs/018-odoo-replique-manuelle/instance/compose.yaml` d'après quickstart.md §1 : `postgres:15` (Odoo 19 exige PostgreSQL **≥ 13**) + `odoo:19.0-<date>` — **tag DATÉ**, jamais le tag flottant `odoo:19.0` qui est reconstruit chaque nuit ; healthcheck sur la base ; `../module` monté sur `/mnt/extra-addons` (déjà dans l'`addons_path` de l'image) ; `--dev=xml,reload` (**il n'y a pas de fonction `assets`** dans la liste 19.0 : `all|xml|reload|qweb|werkzeug|replica|access`). Consigner le tag daté réellement épinglé dans le fichier lui-même.
- [ ] T013 [P] Écrire le squelette du module dans `specs/018-odoo-replique-manuelle/module/piqueray_ds/` : `__init__.py`, `__manifest__.py` (`depends: ['website']` — `html_builder` arrive par transitivité, vérifié : `addons/website/__manifest__.py` en 19.0 dépend de `html_editor` **et** `html_builder`), déclaration des bundles `web.assets_frontend` (page publique : `tokens.pqr.css`, `components.css`, faces de police) et `website.website_builder_assets` (JS/XML des réglages, Phase 4). Ajouter un `README.md` de module qui dit **ce que l'artefact est** (FR-015) : une référence écrite à la main, gouvernée par personne, sur aucun axe du différentiel, et qui ne va sur aucun site.
- [ ] T014 [P] Embarquer les **19** glyphes dans `specs/018-odoo-replique-manuelle/module/piqueray_ds/static/src/img/icons/`, résolus **depuis `contracts/icons.registry.json`** (`icons[].name` → `assets/icons/<icons[].asset>.svg`), jamais depuis le contenu de `assets/icons/` qui en contient 23. Consigner la liste des 19 noms retenus et des 4 écartés (`check`, `close`, `google`, `google-wordmark` — non gouvernés) dans `specs/018-odoo-replique-manuelle/proofs/glyphes-19.md`.
- [ ] T015 [P] Servir **les mêmes faces Montserrat** que le harnais embarque, dans `specs/018-odoo-replique-manuelle/module/piqueray_ds/static/src/fonts/`, déclarées dans `web.assets_frontend`. **Invariant C7 du protocole de comparaison** : si le module ne sert pas la police, la mesure de la US3 oppose un repli système à la vraie police — elle n'est pas approximative, elle est **fausse**. C'est le bug daté du 2026-07-23, où Chromium substituait silencieusement une police système pendant que `document.fonts.check` répondait « disponible ».
- [ ] T016 [P] Écrire `specs/018-odoo-replique-manuelle/zones/ds-presentation.json` d'après `contracts/zone-table.schema.md` — **avant** le montage de ce composant (Z4). Couverture **totale** de ce que le contrat porte (Z1, relevé T004) ; `raison` non vide **des deux côtés** (Z2 : « figé » sans raison est aussi faux que « modifiable » sans raison) ; `contractVersion` = la version exacte lue sur l'état fusionné (Z3) ; `mecanisme: null` partout. Règle de décision unique : *un réglage est offert au rédacteur s'il a une raison métier de le changer sur son site* — corollaire : le contenu se modifie, le design se fige. Écrire avec la référence rendue sous les yeux (`core/samples/presentation.html`), jamais depuis le seul JSON.
- [ ] T017 [P] Écrire `specs/018-odoo-replique-manuelle/zones/ds-section-header.json` — mêmes règles et mêmes invariants Z1–Z3, référence `core/samples/section-header.html`. Décider explicitement le statut de `accroche`, `titre`, `emphase`, `disposition`, `alignement`.
- [ ] T018 [P] Écrire `specs/018-odoo-replique-manuelle/zones/ds-button.json` — mêmes règles, référence `core/samples/button.html`. Décider explicitement le statut du **libellé**, de la **variante**, de la **présence d'icône** et du **choix de glyphe** (FR-004b : le choix de glyphe est la seule liaison par échange d'instance de toute la chaîne — s'il est figé ici, SC-002 devient inatteignable, donc la décision se prend en connaissant sa conséquence).

**Checkpoint**: la 4ᵉ sortie est prouvée et documentée, le module a son squelette, ses 19 glyphes et sa police, et les 3 tableaux des zones sont **décidés**. Les stories peuvent démarrer.

---

## Phase 3: User Story 1 — La chaîne de trois composants existe sur une page Odoo (Priority: P1) 🎯 MVP

**Goal**: installer le module sur une instance Odoo 19 neuve, poser la section `Présentation`, et obtenir à l'écran ce que les trois contrats décrivent — sans qu'aucune valeur de style n'ait été écrite à la main.

**Independent Test**: sur une instance jetable et neuve, installer le module, ouvrir l'éditeur, poser la section depuis le panneau, enregistrer, recharger la page publique — et constater que les trois composants sont rendus, imbriqués, habillés par les jetons.

**Ce que cette story ferme** : SC-001 (0 erreur d'installation), SC-002 partiellement (3 composants, 3 niveaux, 1 entrée, 19 glyphes embarqués — l'**exercice** du choix de glyphe est fermé en US2, T036), SC-003 (0 valeur de style **invisible**, les littéraux nommés comptés à part).

- [ ] T019 [US1] Écrire le registre local des **littéraux nommés** dans `specs/018-odoo-replique-manuelle/module/piqueray_ds/named-literals.registry.json`, de la même forme que `contracts/named-literals.registry.json` : `{ contractId, pointer, channel, value, reason, decidedOn, receiptId }`, la `value` **épinglée byte-à-byte** contre celle du contrat. Une seule entrée attendue d'après research.md §D4 — `letter-spacing: 3px` sur `ds.section-header/Accroche`, le seul des 4 littéraux actifs sans token de même valeur (`font.letter-spacing` ne contient que `15`) — **à re-vérifier** contre le relevé T004, jamais recopiée. La doctrine du dépôt est écrite mot pour mot : *« la doctrine vise zéro valeur INVISIBLE, pas zéro littéral »* — un littéral nommé, épinglé et comparé est conforme. **FR-005 et SC-003 portent désormais cette formulation** (amendés le 2026-08-06, spec.md § Clarifications) : SC-003 se rapporte **0 valeur invisible ; 1 littéral nommé, hérité du contrat, épinglé**, les deux comptes donnés séparément.
- [ ] T020 [US1] Écrire `specs/018-odoo-replique-manuelle/module/piqueray_ds/static/src/css/components.css` **à la main, avec zéro valeur littérale** : uniquement des `var(--pqr-…)` et les entrées du registre T019. Nos **propres classes** (FR-006) — leur spécificité `0-1-0` l'emporte sur les sélecteurs de type du reboot Bootstrap `0-0-1`, ce qui suffit sans bataille globale (FR-007). **PAS de `@layer`** : Odoo 19 n'en emploie nulle part (0 occurrence) et les déclarations non superposées l'emportent sur toute couche — nous mettre dans une couche nous ferait **perdre** contre le reboot. Poser explicitement les propriétés **héritées** (famille, hauteur de ligne, couleur) sur la racine de chaque composant, ce que les contrats font déjà. Référence de départ : `core/samples/{presentation,section-header,button}.css` (231/197/118 lignes) — le passage vers `--pqr-` est un **renommage mécanique**, à compter comme tel pour FR-017.
- [ ] T021 [US1] Écrire le modèle QWeb de `ds.button` dans `specs/018-odoo-replique-manuelle/module/piqueray_ds/views/templates.xml` : `<template id="…" name="…">`, la classe racine qui nous appartient, l'étiquette, la variante, la présence d'icône et le glyphe. **Non déclaré comme bloc** (FR-003) — il reste un modèle appelé.
- [ ] T022 [US1] Ajouter le modèle QWeb de `ds.section-header` dans le même `views/templates.xml`, qui **appelle** celui du bouton par `<t t-call="piqueray_ds.<id_bouton>"/>` avec ses paramètres (`name.f="…"` pour une chaîne formatée, `name="…"` pour une expression). **Jamais de duplication de balisage** (FR-002, invariant 2 du modèle de composant) : l'imbrication se vérifie en lisant les appels.
- [ ] T023 [US1] Ajouter le modèle QWeb de `ds.presentation` dans le même fichier, qui appelle celui de l'en-tête. Structurer en `<section class="s_…"><div class="container">…</div></section>` — research.md §D13 : un texte placé sous `section > .container` est éditable **automatiquement, sans aucun attribut ni JavaScript**, et ce choix de balisage **achète une réduction de coût réelle** (donc mesurable, donc elle appartient au rapport). Vérifier que la chaîne compte bien **3 niveaux** (la limite moteur est de 50 cadres de rendu — aucun risque, et le chiffre est connu au lieu d'être supposé).
- [ ] T024 [US1] Écrire `specs/018-odoo-replique-manuelle/module/piqueray_ds/views/snippets.xml` : **LA seule** déclaration de bloc posable (FR-003, cardinalité **1**), par héritage `xpath` de `website.snippets`, `<t t-snippet="piqueray_ds.<id_presentation>" string="…" group="…"/>` + sa vignette. Un deuxième bloc posable serait un **échec** de FR-003, pas un bonus.
- [ ] T025 [US1] Écrire le registre des **non-portés nommés** dans `specs/018-odoo-replique-manuelle/module/piqueray_ds/NON-PORTES.md` (FR-014) : `contractId` + pointeur, le fait en clair, la raison, et **où un lecteur de l'artefact le trouve depuis l'artefact lui-même** — pas seulement depuis cette spec. Lier ce fichier depuis le `README.md` du module. Candidats connus, **à confirmer ou infirmer, jamais à supposer** : les états interactifs (les contrats Piqueray portent `states: []`, donc il n'y a peut-être rien à ne pas porter — à vérifier plutôt qu'à affirmer) ; la non-alimentation des variables de thème d'Odoo (non-porté nommé déclaré par `contracts/odoo-tokens-output.md` §5) ; tout fait du relevé T004 que le montage n'exprime pas. **Figé ≠ non porté** : un réglage figé est exprimé et fermé, un non-porté n'est pas exprimé du tout — les deux se déclarent, et pas au même endroit.
- [ ] T026 [US1] Monter l'instance jetable et installer, d'après quickstart.md §1 : `docker compose -p odoo19 up -d db`, puis `docker compose -p odoo19 run --rm web odoo -d odoo -i base,website,piqueray_ds --stop-after-init` (**`-i` exige `-d`**), puis `docker compose -p odoo19 up -d`. **SC-001 se lit ici** : capturer la sortie **intégrale** du conteneur dans `specs/018-odoo-replique-manuelle/proofs/installation.txt` — **0 erreur**, jamais résumé de mémoire. Consigner la date de montée pour `verdicts-leviers.json`.
- [ ] T027 [US1] Poser la section depuis le panneau, enregistrer, recharger la **page publique** ; capturer l'écran dans `specs/018-odoo-replique-manuelle/proofs/us1-chaine-rendue.png` et consigner le relevé dans `specs/018-odoo-replique-manuelle/proofs/us1-receipt.md` : **3** composants rendus, **3** niveaux d'imbrication portés par des appels entre modèles, **1 seule** entrée dans le panneau, **19** glyphes embarqués (acceptations US1-1, US1-2 ; SC-002 hors exercice du glyphe).
- [ ] T028 [US1] Vérifier l'acceptation **US1-4** sur l'instance : chercher `ds.section-header` et `ds.button` **comme entrées posables** dans le panneau de blocs — ils ne doivent **pas** y figurer. Consigner le geste et son résultat dans `proofs/us1-receipt.md`. Un relevé fait par lecture du XML ne compte pas (FR-013).
- [ ] T029 [US1] Auditer **SC-003** par exécution sur tout ce que le module produit à la main : `rg -a` sur `module/piqueray_ds/` pour toute valeur de style écrite en dur (couleur hex/rgb, longueur `px`/`rem`/`em`, `%` de taille) hors des entrées du registre T019 et hors du fichier généré `tokens.pqr.css`. Attendu : **0**. Rapporter les **deux comptes séparément**, jamais agrégés en un « 0 » qui cacherait le second (SC-003) : *N valeurs invisibles = 0* **et** *M littéraux nommés au registre = 1 attendu*. Archiver la commande et sa sortie dans `specs/018-odoo-replique-manuelle/proofs/sc003-audit.txt`.

**Checkpoint**: la tranche entière tient en un geste — un modèle par composant, l'appel sur trois niveaux, un seul bloc posable, et nos jetons comme source de tout le style. **Si cette story seule est faite, on sait déjà si le projet est possible.**

---

## Phase 4: User Story 2 — Le rédacteur ne peut faire que ce qui a été décidé (Priority: P2)

**Goal**: un rédacteur posé devant ce bloc peut modifier exactement ce qui a été décidé — et rien d'autre.

**Independent Test**: poser le bloc, puis tenter méthodiquement chaque geste — taper dans chaque texte, cliquer chaque élément, ouvrir le panneau à chaque niveau, essayer de supprimer, déplacer, dupliquer — et comparer ce qui répond à ce qui a été déclaré dans les tableaux des zones.

**⚠️ C'est la partie la moins certaine de tout le dossier.** Les quatre leviers existent tous, vérifiés un par un dans le code d'Odoo 19 — mais **leur combinaison n'est attestée nulle part** : c'est un montage, pas un patron éprouvé. Cette story est la seule qui puisse le confirmer ou l'infirmer, et **un levier qui lâche est un résultat**, pas un échec de spec (FR-016).

**Ce que cette story ferme** : SC-002 (l'exercice du choix de glyphe), SC-004, SC-005, SC-007.

- [ ] T030 [US2] **L1 — verrouiller la structure**, dans `views/templates.xml` : `o_not_editable` sur le conteneur (ferme les réglages **et** l'usage comme zone de dépôt sur tout le **sous-arbre**) **plus** `oe_unremovable oe_unmovable` sur **chaque élément intérieur** que les tableaux des zones ne déclarent pas modifiable. **La prémisse « un seul marqueur » est RÉFUTÉE** (research.md §D11/P1) : `oe_unremovable` (suppression + duplication) et `oe_unmovable` (déplacement) sont **par élément**, pas par sous-arbre — Odoo compose exactement ces trois classes sur son propre `s_dynamic_snippet`. Ce balisage est **entièrement mécanique** (dérivable du tableau des zones) : compter les lignes ajoutées séparément pour FR-017, c'est un chiffre **en faveur** d'un émetteur. Fait favorable à ne pas sur-payer : rien n'est zone de dépôt par défaut (`dropzone_selector` est une **liste blanche**) — ne pas imiter `.oe_structure` ni `.row > div` suffit, `o_not_editable` est la ceinture.
- [ ] T031 [US2] Écrire le réglage de `ds.presentation` dans `module/piqueray_ds/static/src/js/` : un `BaseOptionComponent` + un `Plugin` enregistré dans `registry.category("website-plugins")`, plus son gabarit OWL XML, branché par `static selector` sur **notre** classe racine. Fait de gouvernance **vérifié** : le noyau d'Odoo et un module tiers s'inscrivent dans le **même registre, sans aucun filtrage par origine** (`website_sale` et `mass_mailing` emploient l'appel du noyau à l'identique) ; l'ordre relatif ne dépend que de `withSequence`. N'exposer **que** ce que `zones/ds-presentation.json` déclare `modifiable`.
- [ ] T032 [P] [US2] Écrire le réglage de `ds.section-header` (même patron, fichier distinct) : la **disposition** si `zones/ds-section-header.json` la déclare modifiable, via `BuilderSelect`/`BuilderSelectItem` avec l'action intégrée `ClassAction` (énumération → classe CSS). N'exposer **que** ce que le tableau déclare.
- [ ] T033 [P] [US2] Écrire le réglage de `ds.button` (même patron, fichier distinct) : la **variante** et le **choix de glyphe** — ce dernier par un `BuilderSelect` dont chaque `BuilderSelectItem` porte un `classAction`, **19 valeurs dérivées du registre**, une classe par glyphe. C'est **massivement mécanique** — 19 entrées dérivées d'un registre gouverné — donc précisément le chiffre que FR-017 cherche : le compter à part. (Le patron natif le plus proche d'un échange d'instance visuel est `ShapeSelector` ; Odoo n'a **aucun** terme pour « échange d'instance », et le rapprochement est le nôtre, pas le sien — à dire ainsi dans le rapport.)
- [ ] T034 [US2] **L2 — empêcher un réglage natif d'apparaître, sans le neutraliser** : vérifier sur l'instance quels réglages natifs remontent sur nos blocs, et les fermer par la **voie passive** d'abord (ne pas correspondre à leur `static selector`), puis par les classes d'exclusion documentées si nécessaire (`s_col_no_resize`, `s_nb_column_fixed`, `s_col_no_bgcolor`, `o_not-animable`, `o_snippet_not_selectable`). Consigner chaque réglage natif observé et le moyen employé dans `specs/018-odoo-replique-manuelle/proofs/l2-reglages-natifs.md`.
- [ ] T035 [US2] **L3 — tronquer ce qui remonte du parent** : le panneau empile **un bloc de réglages par ancêtre correspondant** (`getClosestElements` remonte tout `closest(selector)`). Tronquer = ne pas imiter les sélecteurs larges du noyau (`section`, `.row > div`). **En dernier recours seulement** : `patch_builder_options` pour ajouter notre sélecteur à l'`exclude` d'une option existante, par son nom — il est marqué `@deprecated` dans les types **tout en étant livré et employé** par `website_sale` et `mass_mailing` ; **s'il est employé, le consigner comme tel** dans `proofs/l3-troncature.md`, jamais en silence.
- [ ] T036 [US2] Exécuter les gestes de gouvernance sur l'instance, **un par un**, d'après quickstart.md §3, et consigner chacun (geste tenté + résultat observé) dans `specs/018-odoo-replique-manuelle/proofs/gestes-us2.md` : (1) poser la section et vérifier qu'il n'y a **qu'une** entrée ; (2) cliquer **chaque** partie et relever **tout** ce que le panneau affiche, comparé ligne à ligne aux tableaux des zones — un réglage affiché mais non déclaré est un **échec de SC-004**, pas un détail cosmétique ; (3) tenter de **supprimer, déplacer, dupliquer** chaque élément intérieur ; (4) modifier chaque zone déclarée modifiable, enregistrer, recharger la page publique ; (5) **changer le glyphe** depuis le panneau — la seule liaison par échange d'instance de toute la chaîne, qui doit être **exercée**, pas seulement exprimée (FR-004b, SC-002) ; (6) changer la variante du bouton et la disposition de l'en-tête et vérifier qu'elles changent **sur place, sans remplacer le bloc** (US2-5).
- [ ] T037 [US2] Vérifier **FR-012 / SC-005 (100 %)** : enregistrer la page, la **rouvrir en édition**, et vérifier que **100 %** des zones déclarées modifiables le sont encore. C'est l'étape qui tue FR-012 si elle tue — `contenteditable` **et** `.o_editable` sont **tous deux** effacés à chaque enregistrement (le sélecteur de nettoyage est littéralement `[contenteditable]`, et `cleanForSave()` retire `.o_editable` de la racine et de tous ses descendants). Le mécanisme durable retenu est le balisage `section > .container` de T023 ; si un texte tombe hors des défauts, le point d'extension supporté est `resources = { content_editable_selectors: [...] }` depuis un `Plugin` — et s'il faut y recourir, c'est une **découverte à consigner**, pas à contourner. Reçu dans `proofs/gestes-us2.md`.
- [ ] T038 [US2] Compléter le champ `mecanisme` dans les **3** fichiers `specs/018-odoo-replique-manuelle/zones/*.json` — **après** le montage, jamais avant (invariant Z4 : le tableau décide, le montage câble ; l'inverse serait justifier après coup ce qu'Odoo a bien voulu donner). Pas « c'est géré », mais **le levier nommé** (`L1`…`L4`) et le moyen Odoo réellement employé. Si un mécanisme prévu a lâché et qu'un autre l'a remplacé, `mecanisme` porte le **remplaçant** et le levier concerné recevra son verdict `lâché` en T039.
- [ ] T039 [US2] Écrire `specs/018-odoo-replique-manuelle/proofs/verdicts-leviers.json` d'après `contracts/governance-verdicts.schema.md` : **4 verdicts sur 4**, `tenu` | `lâché` | `non exercé`. Invariants refusés **par nom** : V1 4/4 (une absence de verdict **est** un défaut ; un verdict négatif n'en est pas un) ; V2 `lâché ⇒ remplacant` ; V3 `non exercé ⇒ raison` ; V4 `tenu`/`lâché` ⇒ **preuve en fonctionnement**, un verdict établi par lecture de code est **interdit** (FR-013, SC-009) ; V5 **pas de 4/4 par élargissement** — `L4` ne peut pas être marqué `tenu` grâce à un bloc d'essai hors chaîne ; V6 la `preuve` nomme **le geste tenté et le résultat observé**, jamais « ça a l'air de marcher ». **`L4` est connu d'avance comme `non exercé`** — aucun des trois contrats ne porte d'image — avec sa raison écrite. Renseigner `instance.montéeLe` (T026).

**Checkpoint**: on sait si la combinaison des leviers tient, et **par quelles preuves**. Un tableau des zones parfait avec un levier lâché est un résultat parfaitement lisible : la décision était bonne, le moyen n'a pas suivi.

---

## Phase 5: User Story 3 — Le rendu Odoo coïncide avec notre surface existante (Priority: P3)

**Goal**: savoir si nos jetons traversent réellement Odoo — le même contrat, rendu par notre surface HTML existante et rendu dans Odoo, donne-t-il la même chose ?

**Independent Test**: rendre les trois contrats par la surface HTML du dépôt, rendre la page Odoo, comparer les deux images composant par composant — et nommer la cause dominante de chaque ligne qui dépasse le plancher de tolérance déclaré.

**Ce que cette story ferme** : SC-006.

**Hermétisme (invariant C6, non négociable)** : l'instrument de parité visuelle gated n'est **ni étendu ni modifié**, et **aucune instance Odoo n'entre sur le chemin de la suite de contrôles standard**. Le harnais de 018 est le **troisième** du même patron que `extract/figma/aplat-parity/render.ts` (spec 006) — pas une invention.

- [ ] T040 [US3] Écrire `specs/018-odoo-replique-manuelle/harness/tsconfig.json` : étend le `tsconfig` racine, n'inclut que `harness/`. **Mitigation obligatoire** du piège nommé en D6 — `specs/` est hors du `include` racine, donc `npx tsc --noEmit` ne voit rien ici. Vérifier immédiatement que `npx tsc -p specs/018-odoo-replique-manuelle/harness/tsconfig.json --noEmit` s'exécute.
- [ ] T041 [US3] Écrire `specs/018-odoo-replique-manuelle/harness/render-html.mts` : rend chaque contrat par `emitHtml` du barrel `core/`, avec les valeurs de props de la chaîne, la feuille `src/styles/tokens.css` **incluse dans la page** (condition documentée de cet émetteur : « the page must include the token stylesheet or the custom properties resolve to nothing »), viewport et `deviceScaleFactor` **épinglés**, `clip` de taille **fixe**, fond opaque, animations/transitions neutralisées. **Importer `chromiumExecutable()` et `embeddedFontFaces()` depuis `extract/figma/visual-parity/render.ts` sans les modifier** — ils sont exportés avec cette intention écrite (« for reuse … never re-implemented ») ; en ré-implémenter une version raccourcie retombe dans le bug de police du 2026-07-23, et le cache Playwright nomme ses répertoires par architecture (`chrome-mac-arm64` / `chrome-mac-x64` / `chrome-mac`), qu'une découverte maison rate **en silence**.
- [ ] T042 [US3] Ajouter `specs/018-odoo-replique-manuelle/module/piqueray_ds/views/harness.xml` : **3 pages de mesure** appelant chacune un modèle, pour que les trois composants soient capturables **séparément** alors qu'un seul est posable. Ce sont des **pages, pas des blocs** — elles n'ajoutent **aucune** entrée au panneau et ne touchent pas à FR-003. Même fond opaque et même origine de composant que le côté HTML.
- [ ] T043 [US3] Écrire `specs/018-odoo-replique-manuelle/harness/capture-odoo.mts` : capture les 3 pages de mesure avec **exactement le même** viewport, `deviceScaleFactor` et `clip` que T041. Deux pièges obligatoires : capturer la page **publique dans un contexte de navigateur neuf, sans cookie** (connecté en `admin`, Odoo superpose sa barre de backoffice et son panneau latéral, et la mise en page n'est plus celle que voit un visiteur) ; et **ne jamais attendre sans borne** — le client web d'Odoo garde une connexion longue ouverte, donc `waitUntil: 'networkidle'` peut ne jamais rendre la main : borner l'attente et faire courir `document.fonts.ready` contre un délai.
- [ ] T044 [US3] Écrire `specs/018-odoo-replique-manuelle/harness/selftest.mts` : le harnais se prouve **hors ligne, sans instance**, sur fixtures — égalité des dimensions produites par les deux chemins de capture, présence effective des faces Montserrat des deux côtés (invariant **C7** : un côté en police réelle et l'autre en repli rend la mesure **fausse**, à refaire et non à trier), et refus attendu quand les dimensions divergent. Un instrument que rien ne typecheck **et** que rien n'exécute est un instrument dont on ne sait rien.
- [ ] T045 [US3] Écrire `specs/018-odoo-replique-manuelle/harness/compare.mts` : appelle `npm run images:compare` (`extract/image-parity/cli.ts`) **sans le modifier** — CLI générique, renderer-agnostique, qui **refuse** deux images de tailles différentes (`dimension-mismatch`, code 2) plutôt que de les redimensionner, « because it would otherwise hide a visual change ». Le `clip` épinglé rend les tailles égales **par construction** : la comparaison stricte s'applique telle quelle et une différence de géométrie se lit **en pixels de diff**, jamais en refus qui aurait dissimulé la mesure. Sortie : 1 ligne par composant, au schéma de `contracts/visual-comparison.md` §4.
- [ ] T046 [US3] Lancer les 3 comparaisons (quickstart.md §4) et **déclarer le plancher de tolérance** dans `specs/018-odoo-replique-manuelle/proofs/comparaison-image.json` (`plancherDeTolerance`) **avec sa raison**, à la **première** mesure — invariant **C3** : un plancher implicite, ou choisi **après** avoir vu les scores, est un refus. Archiver les 6 PNG et les 3 triptyques sous `specs/018-odoo-replique-manuelle/proofs/{html,odoo,compare}/`.
- [ ] T047 [US3] Compléter les **3 lignes** de `proofs/comparaison-image.json` : `score` mesuré (**jamais** estimé — invariant C4, 0 verdict rendu à l'œil), et **exactement une** cause dominante par ligne au-dessus du plancher (invariant C2 : zéro cause ou deux causes sont des refus), prise au **vocabulaire fermé de 014** — `contract-geometry`, `image-boundary`, `rendering`, `engine`, `instrument`, `figma-source`. **Aucune cause nouvelle n'est inventée pour Odoo** : si aucune des six ne convient, c'est un **résultat à consigner et à discuter**, pas une septième à ajouter en passant. Un écart dû au cadre CSS d'Odoo qui traverse notre portée se lit `engine` ou `rendering` selon qu'il vient de notre CSS ou de la rastérisation — le choix **se justifie sur la ligne**, il ne se devine pas. Une comparaison impossible porte `statut: "impossible"` **et** `raisonImpossible` (invariant C5) — jamais comptée réussie.

**Checkpoint**: on sait, en trois lignes chiffrées, si nos jetons traversent Odoo. On ne sait **rien** de la conformité à la maquette — et c'est écrit pour qu'on ne fasse pas dire davantage à cette mesure.

---

## Phase 6: User Story 4 — La décision sur l'émetteur est prise sur des chiffres (Priority: P4)

**Goal**: décider si construire un générateur vaut le coup — sur ce qu'a réellement coûté le montage à la main, pas sur une intuition.

**Independent Test**: lire le rapport de décision et pouvoir répondre oui ou non **sans rouvrir le code**.

**Ce que cette story ferme** : SC-008, et la raison d'être de la spec.

- [ ] T048 [US4] **Agréger et refermer** `specs/018-odoo-replique-manuelle/proofs/volumes.json` — les postes y ont été déclarés **en écrivant** par T020–T024, T030–T033 et T042 (invariant M5) ; cette tâche ne classe pas, elle vérifie. D'après `contracts/volumes.schema.md` : pour chacun des 3 composants, le **volume écrit** (lignes, par type de fichier — XML QWeb / JS+XML OWL / CSS, les **trois** types qu'Odoo demande), la **part mécanique** et la **part cas particulier**, chacune tranchée par le test en 4 questions du §1 (*origine nommable → règle écrivable → transposable à un autre composant*). Invariants à vérifier par nom : **M1** (`nonClassees` vide — 0 ligne écrite sans poste), **M2** (le compte ferme : `mecanique + casParticulier == lignes` sur chaque fichier), **M3** (tout poste mécanique nomme son origine — « c'est évident » n'en est pas une), **M4** (tout cas particulier nomme le jugement rendu), **M6** (compté par exécution, la commande consignée), **M7** (règle inchangée, sinon tout est reclassé et `regleVersion` bumpée). Les trois postes mécaniques connus d'avance restent comptés **séparément** parce que ce sont les chiffres qui portent l'argument : le balisage `oe_unremovable oe_unmovable` par élément (T030), les 19 entrées du sélecteur de glyphe (T033), le renommage `var(--…)` → `var(--pqr-…)` de la CSS (T020, dénominateur mesuré : `core/samples/` = 231 + 197 + 118 lignes). **Compter par relevé, jamais de mémoire.**
- [ ] T049 [US4] Écrire les trois sections de faits de `specs/018-odoo-replique-manuelle/RAPPORT-DECISION.md` : **Volumes** (les 3 composants, part mécanique, part cas particulier — repris de T048), **Leviers** (les 4 verdicts repris **tels quels** de `proofs/verdicts-leviers.json`), **Écart visuel** (les 3 lignes reprises **telles quelles** de `proofs/comparaison-image.json`). Y ajouter la section **SC-009** : la liste des mécanismes utilisés qui ont été **confirmés sur l'instance**, et de ceux qui restent **marqués non confirmés** — `L4` en tête. Aucun fait lu-dans-le-code ne reste présenté comme acquis.
- [ ] T050 [US4] Écrire la section **Recommandation** de `RAPPORT-DECISION.md` : **1** recommandation argumentée parmi trois — construire l'émetteur, écrire les blocs à la main et les gouverner autrement, ou arrêter. **Le rapport fournit de quoi décider, il ne rend pas un verdict** : aucun seuil n'a été préétabli, c'est un choix assumé (spec.md § Clarifications Q1) et la décision appartient à l'owner. Si la recommandation est « construire » : un **ordre de grandeur** adossé aux volumes T048 **et** au précédent interne mesuré — `packages/emitter-web-components/src/emit-wc.ts` = **1353 lignes** (+196 et +255 pour ses deux contrôles) — avec la réserve à écrire en toutes lettres : il produit **un seul** type de fichier, là où Odoo en demande **trois**. Et si « construire » : rappeler FR-019 — l'émetteur reste une **transformation déterministe, aucun modèle de langage dans le chemin de génération** ; rouvrir cette règle serait une décision explicite, jamais un repli.
- [ ] T051 [US4] Écrire la section **Angles morts** de `RAPPORT-DECISION.md` — **au moins 2**, et c'est le contrepoids obligatoire de l'absence de seuil : sans elle, une décision à l'humeur se déguiserait en décision informée (FR-018b). Deux sont connus d'avance et ne suffisent pas à eux seuls s'il en existe d'autres : (1) ce que vaut l'extrapolation de **3 composants à 34** ; (2) ce que la chaîne retenue **n'a pas exercé** — la **répétition d'un élément** (aucun des 3 contrats n'en porte, alors que **8** sections du catalogue en dépendent) et le **levier L4** (aucun des 3 contrats ne porte d'image, donc son coût reste inconnu et c'est la **première** chose qu'une chaîne à photo aurait à instruire). Ajouter tout angle mort découvert en chemin.

**Checkpoint**: le livrable réel de la spec existe, et il contient de quoi décider — jamais quoi décider.

---

## Phase 7: Polish & clôture

**Purpose**: reprouver que rien n'a dérivé, détruire l'instance, et vérifier les 9 critères de succès un par un

- [ ] T052 Sweep complète finale (voir § La sweep) **plus** `npx tsc -p specs/018-odoo-replique-manuelle/harness/tsconfig.json --noEmit` **plus** `npx tsx specs/018-odoo-replique-manuelle/harness/selftest.mts` → `specs/018-odoo-replique-manuelle/proofs/sweep-cloture.txt`. Le `N/N` de `npm run eval` imprimé fait foi.
- [ ] T053 Re-vérifier les trois non-dérives **à la clôture** : `git diff --stat evals/golden.json figma-sync/plugin/engine.receipt.json examples/polaris/figma/` → **VIDE** (`proofs/non-derives-cloture.txt`). Vérifier aussi que **aucun** `contracts/*.contract.json`, **aucun** `tokens/*.tokens.json`, **aucun** `src/`, **aucun** `figma-sync/` n'a été touché : `git diff --stat contracts/ tokens/ src/ figma-sync/` → **VIDE**. Le périmètre de code de dépôt de 018 est **exactement** `scripts/build-tokens.mjs`, `evals/run.ts`, `docs/03-token-pipeline.md`.
- [ ] T054 Détruire l'instance (quickstart.md §5) : `docker compose -p odoo19 down -v --remove-orphans`, puis **vérifier qu'il ne reste rien** — `docker ps -a | grep odoo19`, `docker volume ls | grep odoo19`, `docker network ls | grep odoo19` doivent être **vides**. Ne **pas** retirer les images (~3,9 Go, c'est ce qui rend le prochain montage rapide). Renseigner `instance.détruiteLe` dans `proofs/verdicts-leviers.json` et archiver la vérification dans `proofs/destruction.txt`.
- [ ] T055 Auditer les **9 critères de succès** un par un dans `specs/018-odoo-replique-manuelle/proofs/sc-audit.md`, chacun avec le reçu qui l'établit et son verdict : SC-001 (T026), SC-002 (T027 + T036), SC-003 (T029), SC-004 (T036), SC-005 (T037), SC-006 (T046 + T047), SC-007 (T039), SC-008 (T049–T051), SC-009 (T049). **Un critère non atteint est consigné avec sa cause** — une mesure sautée n'est jamais comptée réussie, et un résultat défavorable est un résultat, pas un échec de spec.
- [ ] T056 Mettre à jour `CLAUDE.md` § Recent Changes et `ROADMAP.md` avec la clôture de 018 : ce qui est prouvé (les reçus, par leur chemin), ce qui ne l'est pas (L4 non exercé, la répétition non instruite, la fidélité à la maquette hors périmètre), et la **conséquence permanente** qu'il ne faut pas redécouvrir plus tard — `npm run tokens` écrit désormais dans `specs/018-…/module/`, donc archiver ou déplacer cette spec cassera `npm run build` tant que `scripts/build-tokens.mjs` ne sera pas mis à jour.

---

## Dependencies & Execution Order

### Dépendances de phase

- **Phase 1 (Setup)** — aucune dépendance. **T002 (fusion `main`) avant tout le reste** : monter sur la base actuelle graverait une coquille corrigée dans l'artefact de référence.
- **Phase 2 (Foundational)** — dépend de la Phase 1. **BLOQUE toutes les user stories.** Deux chaînes strictement ordonnées à l'intérieur : `T005 → T006 → T007 → T011` (Principe II : eval avant la phrase de doc) et `T016/T017/T018 → Phase 3` (invariant Z4 : le tableau décide, le montage câble).
- **Phase 3 (US1)** — dépend de la Phase 2 en entier. C'est le **MVP**.
- **Phase 4 (US2)** — dépend de la Phase 3 : il faut un bloc posé pour tenter un geste dessus.
- **Phase 5 (US3)** — dépend de la Phase 3 (les modèles doivent exister pour être capturés) ; **indépendante de la Phase 4** — la comparaison d'image ne dépend d'aucun réglage.
- **Phase 6 (US4)** — dépend des Phases 3, 4 et 5 : elle **mesure** les trois précédentes. Sans elles, il n'y a rien à chiffrer.
- **Phase 7 (Polish)** — dépend de tout.

### Dépendances entre user stories

- **US1 (P1)** — démarre après la Phase 2. Aucune dépendance sur une autre story. **Seule story qui livre à elle seule un résultat exploitable** : si elle seule est faite, on sait déjà si le projet est possible.
- **US2 (P2)** — a besoin du montage d'US1. Ferme au passage la part d'US1 que la structure ne pouvait pas fermer seule (l'**exercice** du choix de glyphe, SC-002).
- **US3 (P3)** — a besoin des modèles d'US1, **pas** des réglages d'US2. **US2 et US3 sont parallélisables** une fois US1 finie.
- **US4 (P4)** — a besoin des trois autres. En dernier **parce qu'elle les mesure**, pas parce qu'elle est moins importante : c'est la raison d'être de la spec.

### À l'intérieur de chaque story

- L'eval passe au ROUGE **avant** l'implémentation, et la phrase de doc vient **après** le vert (Principe II).
- Le tableau des zones s'écrit **avant** le montage ; `mecanisme` se remplit **après** (Z4).
- Le plancher de tolérance se déclare **à la première mesure**, jamais après avoir vu les scores (C3).
- Un verdict de levier exige un **geste sur l'instance**, jamais une lecture de code (V4, FR-013, SC-009).

### Opportunités de parallélisme

- **Phase 2** : T012 (compose), T013 (squelette), T014 (glyphes), T015 (police) sont sur des fichiers disjoints — parallélisables entre eux et avec la chaîne T005→T007. Les 3 tableaux des zones (T016, T017, T018) sont 3 fichiers distincts — parallélisables.
- **Phase 4** : T031, T032, T033 sont 3 fichiers de réglages distincts — parallélisables une fois T030 posé.
- **Phases 4 et 5** : parallélisables entre elles une fois la Phase 3 finie (équipes distinctes, aucun fichier commun sauf `views/` — T042 ajoute `harness.xml`, un fichier neuf).
- **Non parallélisable, et c'est structurel** : T021→T022→T023 (même fichier `views/templates.xml`, et chacun appelle le précédent) ; toute la chaîne d'eval T005→T006→T007 ; tous les gestes sur l'instance (une seule instance, un seul écran).

---

## Parallel Example: Phase 2

```bash
# Une fois T004 fini, ces quatre-là ne se touchent pas :
Task: "T012 — instance/compose.yaml, tag Odoo DATÉ"
Task: "T013 — squelette du module piqueray_ds (manifest, bundles, README)"
Task: "T014 — 19 glyphes résolus DEPUIS contracts/icons.registry.json"
Task: "T015 — faces Montserrat servies par le module (invariant C7)"

# Et les trois tableaux des zones, trois fichiers distincts :
Task: "T016 — zones/ds-presentation.json"
Task: "T017 — zones/ds-section-header.json"
Task: "T018 — zones/ds-button.json"
```

---

## Implementation Strategy

### MVP d'abord (US1 seule)

1. Phase 1 — worktree autosuffisant, **fusionné sur `main`**, départ vert prouvé
2. Phase 2 — la 4ᵉ sortie prouvée, le squelette, les zones décidées (**CRITIQUE, bloque tout**)
3. Phase 3 — US1
4. **STOP et VALIDER** : installation à 0 erreur, chaîne rendue, 0 valeur de style invisible (+ le compte des littéraux nommés, donné à part)
5. À ce point, la question « est-ce possible ? » a déjà sa réponse — même si la spec s'arrêtait là

### Livraison incrémentale

1. Setup + Foundational → la seule capacité de dépôt de la spec est prouvée et documentée
2. + US1 → **on sait si c'est possible** (MVP)
3. + US2 → **on sait si ça se gouverne** (le risque n°1 : la combinaison des leviers n'est attestée nulle part)
4. + US3 → **on sait si les jetons traversent**
5. + US4 → **on sait quoi décider** — et sur quoi on ne peut rien conclure

### Si une story tombe

Aucune de ces trois issues n'est un échec de spec — chacune est un **résultat**, et c'est écrit ici pour que ça ne se relise pas plus tard comme un dérapage :

- **Un levier lâche** (US2) → il est consigné avec son remplaçant (FR-016), le rapport le chiffre, et la spec continue.
- **Le mécanisme de réglages coûte plus cher que lu** → c'est un **résultat** de la spec, pas un dépassement. Il alimente FR-017 tel quel.
- **Une comparaison est impossible** (US3) → `statut: "impossible"` + `raisonImpossible`, jamais comptée réussie.

---

## Notes

- **56 tâches.** Setup 4 · Foundational 14 · US1 11 · US2 10 · US3 8 · US4 4 · Polish 5.
- `[P]` = fichiers disjoints, aucune dépendance sur une tâche non finie.
- Commiter après chaque tâche ou groupe logique cohérent ; s'arrêter à chaque checkpoint pour valider la story seule.
- **Le seul code de dépôt touché** est `scripts/build-tokens.mjs`, `evals/run.ts` et `docs/03-token-pipeline.md`. Tout le reste vit sous `specs/018-odoo-replique-manuelle/` et n'est gouverné par personne — délibérément, et dit comme tel (FR-015).
- L'artefact **ne va sur aucun site**. `docs/06-parity-loop.md` n'a que **trois** axes (`code ⟷ contract`, `canvas ⟷ contract`, `canvas variables ⟷ tokens/`) : une quatrième surface n'en a **aucun**. Ce n'est pas une prudence de rédaction, c'est le fait qui **fonde** FR-015.
