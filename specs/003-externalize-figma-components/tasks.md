# Tasks: Externalisation des maquettes Piqueray — ~35 blocs recopiés → composants gouvernés, preuve zéro-pixel

**Input**: Design documents from `/specs/003-externalize-figma-components/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: aucun test unitaire demandé par la spec. L'équivalent ici est le **selftest à fixtures** de l'instrument de preuve (`npm run pages:selftest`, R12) — il figure comme tâche d'implémentation, pas comme suite de tests TDD.

**Organization**: le programme est un graphe de dépendances bottom-up (tokens → atomes → molécules → sections), pas 5 chantiers parallèles. Les user stories **se croisent à chaque incrément** : US1 (preuve), US4 (ledger) et US5 (rollback) sont d'abord **construites une fois comme outillage** (phases 3–5), puis **exercées à chaque adoption** des phases 7–8. Voir le mapping ci-dessous.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallélisable (fichiers différents, aucune dépendance)
- **[Story]**: user story couverte (US1…US5)
- Chemins exacts dans chaque description

## Mapping user stories ↔ phases

| Story | Construite en | Exercée en | Tâches |
|---|---|---|---|
| **US1** — preuve zéro-pixel mesurée (P1) | Phase 3 (instrument + étalonnage) | chaque tâche « Adoption » des phases 7–8 | T011–T019 |
| **US2** — copies → masters + instances (P1) | — | Phases 7–8 (31 adoptions) | 31 tâches |
| **US3** — source propre AVANT externalisation (P2) | Phase 6 (tokens + atomes) | chaque tâche « Master » des phases 7–8 | 44 tâches |
| **US4** — personnalisations retrouvées/préservées (P2) | Phase 5 (détection + ledger) | chaque adoption (ledger bloquant) | T023–T025 |
| **US5** — retour arrière intégral (P2) | Phase 4 (checkpoint + répétition) | checkpoint avant chaque geste mutant | T020–T022 |

## Conventions de l'environnement (valables pour toute tâche canvas)

- **Fichier** : `Piqueray (Copy)`, fileKey `d9FYAUcqdcNtsuaMgLefvJ` ; page cible `Pages` (`210:325`), 9 maquettes 1728px.
- **Route unique** : pont desktop figma-console (`figma_execute` + `figma.loadAllPagesAsync()`) — les vues serveur/REST sont **aveugles** à la page `Pages` (R1).
- **Avant tout geste mutant** : checkpoint `saveVersionHistoryAsync("003/<increment>/<étape>")` (FR-017).
- **Aucune tâche canvas n'est `[P]`** : un seul fichier client, un seul opérateur, discipline de checkpoint — la concurrence y est un risque, pas un gain.
- **Boucle d'incrément** (référence normative) : [quickstart.md](./quickstart.md) §« La boucle d'un incrément ».

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: plomberie repo de l'instrument et des artefacts de preuve — aucun geste Figma.

- [X] T001 Créer l'arborescence de l'instrument `extract/figma/page-parity/` (sous-dossiers `bridge/`, `fixtures/`, `README.md` en stub) à la racine du repo
- [X] T002 [P] Ajouter `extract/figma/page-parity/out/` et `.page-parity/` à `.gitignore` (PNG de travail jamais commités)
- [X] T003 [P] Ajouter les scripts `pages:compare` (`tsx extract/figma/page-parity/cli.ts`), `pages:selftest` (`tsx extract/figma/page-parity/selftest.ts`) et `pages:ledger:check` (`tsx extract/figma/page-parity/ledger-check.ts`) dans `package.json`
- [X] T004 [P] Créer les dossiers runtime `specs/003-externalize-figma-components/{inventory,audits,ledger,proofs}/` avec un `.gitkeep` chacun
- [X] T005 [P] Copier `COMPONENT-INVENTORY.md` depuis le checkout principal (`/Users/dlstudio/.superset/projects/ds-contracts-poc/COMPONENT-INVENTORY.md`) vers la racine du repo et le commiter en baseline T0
- [X] T006 [P] Scaffolder `specs/003-externalize-figma-components/decisions.md` (en-tête + rappel du format append-only défini dans `contracts/decisions-journal.md`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: accès au canevas live et re-mesure par position — tout le reste en dépend.

**⚠️ CRITICAL**: aucun travail de user story ne commence avant la fin de cette phase.

- [X] T007 Sonder la connectivité du pont : `figma_execute` + `figma.loadAllPagesAsync()`, atteindre la page `Pages` (`210:325`), énumérer les 9 frames maquettes (nom, nodeId, bounds, dimensions) → écrire `specs/003-externalize-figma-components/proofs/T0-calibration/bridge-probe.json`
- [X] T008 Implémenter le scan read-only `extract/figma/page-parity/bridge/scan.js` conforme à `contracts/inventory-scan.md` : classification par **bounds absolus + signature structurelle, jamais par nom** ; `getMainComponentAsync()` pour l'état `copie-brute | instance-existante | instance-nouveau-master` ; `nonClasses[]` et `introuvables[]` toujours renseignés (jamais d'omission silencieuse) ; rapporter la provenance de chaque main component (`remote: true` = bibliothèque externe) dans `dependancesTierces[]` — attendu vide (preuve FR-019/SC-008)
- [X] T009 Exécuter le scan T0 via le pont → `specs/003-externalize-figma-components/inventory/scan-<date>.json` (schéma complet de `contracts/inventory-scan.md`, y compris `dejaInstancie` et `totaux`) — **fait** : 26 blocs, 236 occurrences copie-brute, 11 introuvables nommés, `dependancesTierces: []` ; mesure bridge/scan.js (2 passes recon) + classification `assemble-scan.mjs` (re-runnable sans pont)
- [X] T010 Réconcilier le scan T0 avec `COMPONENT-INVENTORY.md` (mise à jour + note datée en cas de divergence — le dernier scan fait foi), vérifier l'acyclicité du DAG et figer l'ordre d'exécution dans `specs/003-externalize-figma-components/inventory/dag.md` — **fait** : divergences majeures notées (category-card 41 vs ~15, footer-column 27 vs 9, gallery-item confirmé, composites plus riches), DAG acyclique, ordre figé

**Checkpoint**: le canevas live est lisible et re-mesuré ; l'ordre d'exécution est arrêté.

---

## Phase 3: User Story 1 - Preuve mesurée qu'aucun pixel n'a bougé (Priority: P1) 🎯 MVP

**Goal**: l'instrument déterministe qui prouve, par mesure, que les 9 maquettes sont identiques avant/après — et qui refuse les captures vides.

**Independent Test**: sur une paire de captures des 9 maquettes prise sans aucune opération entre les deux, `npm run pages:compare` rend 9/9 `identical` et exit 0 ; sur des fixtures dégradées, il rend `diff`/`capture-failed`/`dimension-mismatch` avec les bons codes de sortie.

**⚠️ STOP-GATE**: si T018 (étalonnage) ne donne pas 9/9 `identical`, le programme s'arrête — le modèle de seuil est faux, retour owner avant toute opération.

- [X] T011 [P] [US1] Créer les fixtures PNG committées dans `extract/figma/page-parity/fixtures/` : paire identique, paire à 1 pixel modifié au-delà du seuil, capture vide (0×0 / intégralement transparente), paire de dimensions différentes
- [X] T012 [US1] Implémenter `extract/figma/page-parity/compare.ts` : `pixelmatch { threshold: 0.1, détecteur anti-aliasing actif }`, **dimensions strictes** (aucune normalisation), réutilisation de `readPng` depuis `extract/figma/visual-parity/img.ts` — **jamais `alignPair`** (R2 : sa normalisation content-box masquerait des décalages réels)
- [X] T013 [US1] Implémenter `extract/figma/page-parity/report.ts` : `verdict.json` (`PixelVerdict[9]` + statut global, schéma data-model), `verdict.md` (tableau 9 lignes lisible owner), crop-triptyques du `diffBox` via `writeTriptych` de `extract/figma/visual-parity/img.ts` (jamais le triptyque pleine page — une maquette fait 1728×~8000 px) ; `writeTriptych` consomme le type `Aligned` : construire la struct à la main depuis les crops (mêmes dimensions) — ne PAS réintroduire `alignPair` pour l'obtenir (R2)
- [X] T014 [US1] Implémenter la CLI `extract/figma/page-parity/cli.ts` (`--before <dir> --after <dir> --out <dir>`) avec les **codes de sortie distincts** de `contracts/page-proof.md` : `0` = 9/9 identical, `1` = ≥1 `diff` chiffré, `2` = refus (`capture-failed` / `dimension-mismatch` / entrée manquante — la preuve n'a PAS eu lieu)
- [X] T015 [US1] Implémenter `extract/figma/page-parity/selftest.ts` couvrant les 5 cas obligatoires de `contracts/page-proof.md` §3, dont le **déterminisme byte-identique** de `verdict.json` sur deux exécutions ; `npm run pages:selftest` doit sortir en 0
- [X] T016 [US1] Implémenter la capture `extract/figma/page-parity/bridge/capture.js` : `figma.loadAllPagesAsync()` puis `exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } })` sur le **node frame** de chaque maquette + `manifest.json` par capture (maquette, nodeId, width, height, scale 1, sha256, capturedAt, transport, statut `ok|vide|echec`)
- [X] T017 [US1] Sonder le transport des octets dans l'ordre R3 — (a) outil MCP de capture nodale, (b) base64 par tranches via globale persistée entre appels `figma_execute`, (c) bandes par `SliceNode`s temporaires — et consigner le transport retenu **avec sa preuve** dans `specs/003-externalize-figma-components/proofs/T0-calibration/transport.md` (jamais supposé en silence) ; T016/T017 forment une **paire itérative** — le transport retenu peut remodeler `capture.js` (en (a), l'export transite par l'outil MCP et le manifeste est complété côté Node) — **retenu : (b-fetch)** exportAsync @1x + POST localhost vers `receiver.mjs` :9227, aller-retour byte-exact prouvé (sha256, 1728×3335) ; (a) rejeté sur receipt (plafond 1568px silencieux) ; (b-tranches) = fallback nommé
- [X] T018 [US1] Étalonner l'instrument : **double capture des 9 maquettes sans aucune opération entre les deux** → `npm run pages:compare` → exiger 9/9 `identical`, receipt commité dans `specs/003-externalize-figma-components/proofs/T0-calibration/` ; bruit propre ≠ 0 → **STOP programme** + entrée `report-bloc` dans `decisions.md` — **PASSÉ 9/9 identical exit 0** (2026-07-23) ; sha256 identiques deux à deux (rendu byte-reproductible) ; incident nonce consigné + capture.js durci (`expectNonce` obligatoire) → `proofs/T0-calibration/calibration.md`
- [X] T019 [P] [US1] Écrire `extract/figma/page-parity/README.md` avec les **limites nommées là où la capacité vit** : capture live-only (non évaluable headless, non exécutable en CI), périmètre = rendu des 9 frames clippées à leurs bounds, aucun câblage `evals/run.ts` et aucune claim de capacité en docs tant qu'un eval ne la porte pas (R12)

**Checkpoint**: US1 est autoportante — l'instrument se prouve sur fixtures ET sur le canevas live. Le reste du programme peut être gaté par la mesure.

---

## Phase 4: User Story 5 - Retour arrière intégral (Priority: P2 — séquencée ici par dépendance)

**Goal**: le filet de sécurité qui rend acceptables des opérations en place sur un vrai fichier client.

**Independent Test**: un checkpoint est pris, une modification réversible est faite sur une page bac à sable, la restauration manuelle ramène le fichier à son état antérieur — vérifié par une **preuve positive** (la modification bac à sable a DISPARU après restore) + la preuve pixel en contrôle collatéral (9/9 `identical` sur les 9 maquettes).

> **Pourquoi avant US2/US3/US4** : P2 par valeur, mais **bloquante par dépendance** — aucun geste mutant sur le fichier client sans filet éprouvé.

- [X] T020 [US5] Implémenter `extract/figma/page-parity/bridge/checkpoint.js` : `figma.saveVersionHistoryAsync("003/<increment>/<étape>")`, nommage systématique, retour du label + de l'horodatage pour journalisation
- [X] T021 [US5] Répéter le rollback de bout en bout : checkpoint → modification anodine sur une page bac à sable (jamais sur les 9 maquettes) → restauration **manuelle** via l'historique de versions natif (UI Figma) → **preuve positive du restore : relire le node modifié via le pont et constater que la modification a DISPARU** (sans elle le drill ne peut pas échouer : les 9 maquettes n'ayant pas été touchées, leur 9/9 passerait même si le restore avait silencieusement échoué) → puis capture fraîche + `pages:compare` vs les `before/` → 9/9 `identical` (contrôle collatéral) ; receipt dans `specs/003-externalize-figma-components/proofs/T0-rollback-drill/` + entrée `decisions.md` — **PASSÉ 2026-07-24** (restore owner ; témoin disparu par id+nom ; 9/9 identical exit 0 ; + dérive nocturne 23→24 sur 2 heros détectée et consignée en anomalie en attente, `derive-nocturne/`)
- [X] T022 [P] [US5] Documenter la procédure de rollback dans `extract/figma/page-parity/README.md` en nommant la limite : **aucune API de restore programmatique n'existe** (vérifié 2026-07-23) — c'est un geste humain guidé, pas un bouton script

**Checkpoint**: tout geste mutant est désormais réversible et la réversibilité est prouvée, pas supposée.

---

## Phase 5: User Story 4 - Chaque personnalisation retrouvée, nommée, préservée (Priority: P2 — séquencée ici par dépendance)

**Goal**: la machinerie qui empêche la perte silencieuse d'**intention** (le pixel-gate n'attrape que la perte visuelle).

**Independent Test**: sur un bloc porteur de personnalisations, le relevé liste chaque perso par instance (texte, image, icône, visibilité) et chacune est présente sur l'instance correspondante ; une perso non portable ressort en `non-portable-signalee`, jamais absente.

- [X] T023 [US4] Implémenter `extract/figma/page-parity/bridge/customizations.js` : diff structurel **copie ↔ master par position** (textes, fills d'image, icônes swappées, visibilités) exécuté **AVANT** tout remplacement, pré-remplissant le ledger au format `contracts/customization-ledger.md`
- [X] T024 [US4] Implémenter le validateur `extract/figma/page-parity/ledger-check.ts` (script `pages:ledger:check`) : `statut: reportee` exige `portePar` ; `non-portable-signalee` exige `signalement` + réf journal ; `type: autre` exige une description ; une adoption sans perso écrit un **ledger vide explicite** (`entrees: []`, totaux à 0) ; sortie non-zéro si incomplet
- [X] T025 [P] [US4] Documenter la **complétude bloquante** dans `extract/figma/page-parity/README.md` et `specs/003-externalize-figma-components/quickstart.md` : une adoption n'est « faite » que si ledger complet **ET** preuve pixel passée — les deux, jamais l'un des deux

**Checkpoint**: US1 (pixel), US4 (ledger) et US5 (rollback) forment le harnais complet d'un incrément.

---

## Phase 6: User Story 3 - Fondation propre AVANT externalisation : tokens + atomes net-new (Priority: P2)

**Goal**: la règle du Button appliquée à la base — tokens propres, puis les 6 atomes manquants créés propres de zéro (aucune copie à remplacer, donc aucune adoption).

**Independent Test**: pour chaque master livré, un audit de source existe (structure + usage par position), les couleurs sont branchées à des variables (zéro valeur brute), les affordances sont des propriétés officielles (zéro hack par calque caché), le nom est vrai, la description non vide — et une entrée `validation-master` de l'owner existe au journal.

**Cadence de validation (FR-013)** : **par composant** pour tous les net-new de cette phase.

### Phase T — odeurs de tokens (fondation : 14 variables + 8 styles Montserrat)

- [X] T026 [US3] Auditer les odeurs de tokens sur la fondation live via le pont → `specs/003-externalize-figma-components/audits/tokens.md` : `space`/`radius` nommés par valeur, `orange-12` / `orange-42` mintés, `color/nav-state` en STRING — **audité 2026-07-24 via `figma_get_variables`/`figma_get_text_styles` (live, 35 variables + 8 styles) : 2 odeurs actives confirmées (`space`/`radius` nommés par valeur ; `orange-12`/`orange-42` nommés par valeur d'opacité, inutilisés côté `semantic.tokens.json`/contrats) ; `color/nav-state` déjà RÉSOLU avant 003 (renommé `nav/state` + typé STRING, commit `38aee13` du 2026-07-23 16:45, spec 001 pré-flight) — vérifié live, pas une supposition**
- [X] T027 [US3] Présenter les 2 odeurs actives à l'owner comme **propositions** (jamais de correction silencieuse, FR-010) et consigner sa décision dans `specs/003-externalize-figma-components/decisions.md` — **fait 2026-07-24** : `space`/`radius` → proposition « échelle nommée » (`none/xs/sm/md/lg` + `radius/pill`) **déclinée, différée** ; `orange-12`/`orange-42` → owner a demandé un scan d'usage avant de trancher, scan fait (2314 nœuds, 2 hits = swatches de référence seules dans `Assets > Couleurs`, zéro usage fonctionnel), proposition « suffixe alpha neutre » représentée avec ce fait à l'appui → **toujours déclinée, différée** ; `nav/state` déjà traité hors 003 → entrée de constat
- [X] T028 [US3] Exécuter les gestes acceptés **source-side d'abord** — **rien à exécuter** : les 2 seules odeurs actives (space/radius, orange-12/42) ont été explicitement déclinées par l'owner (voir `decisions.md`, entrées `anomalie-tranchee` du 2026-07-24) ; aucun geste mutant, aucun checkpoint requis pour cette tâche
- [X] T029 [US3] Prouver le geste token — **n/a, nommé plutôt qu'omis** : aucun geste n'a été exécuté en T028 (tout décliné), donc rien à prouver pixel-par-pixel ; la fondation reste dans son état T0 inchangé, `npm run parity` reste au statu quo déjà établi (aucune nouvelle mutation à mesurer)
- [X] T029a [US3] Checkpoint `003/tokens/page-ds-tokens` puis créer la page `DS · Tokens` (amendement-orga 2026-07-24, R9) — page vide à ce stade, avant peuplement — **fait 2026-07-24** : checkpoint versionId `2379706504047594643`, page créée `2051:951` (fichier passe de 2 à 3 pages) → `proofs/tokens-page/page-creation.md`
- [X] T029b [US3] Peupler `DS · Tokens` : swatches des 14 variables (couleurs + `nav/state` + opacity) avec les noms **finaux** post-T028, échelle `space`/`radius` légendée, les 8 styles Montserrat appliqués à un exemple de texte chacun ; description de page non vide → validation owner **par lot** (une entrée `validation-master` couvrant la page) → entrée `decisions.md` — **fait 2026-07-24** : swatches bindés aux variables (pas des copies), 1 bug corrigé en cours (légende typo), validé par l'owner sur capture → entrée `decisions.md`
- [X] T029c [US3] Prouver l'ajout de page : capture fraîche des 9 maquettes + `npm run pages:compare` → **9/9 identical** attendu (une page neuve ne touche aucune maquette — mesuré, pas supposé) → `proofs/tokens-page/verdict.json` + entrée journal — **fait 2026-07-24** : 9/9 identical, exit 0 ; before réutilisé de `drill-after` (T021, même jour) faute de before dédié pré-geste — limite nommée dans `proofs/tokens-page/README.md` + entrée `ecart-accepte` au journal

### Phase A — lot 1 : atomes de formulaire (net-new)

- [ ] T030 [US3] Créer les 3 pages de rangement `DS · Atomes`, `DS · Molécules`, `DS · Sections` (R9 — les 5 masters existants ne bougent pas) ; checkpoint `003/setup/pages-ds` avant le geste ; noms amendables par l'owner → entrée `amendement-orga` si modifiés
- [ ] T031 [US3] Auditer les saisies brutes par position (input brut ×6, champ Message 161px, `input` contenant un `chevron-down`, consentement RGPD en simple texte) → `specs/003-externalize-figma-components/audits/atomes-formulaire.md` (structure + usage sur les 9 maquettes)
- [ ] T032 [US3] Construire le master **Input** sur `DS · Atomes` (nom vrai, couleurs aux variables, propriétés officielles, description, zéro dépendance tierce) → validation owner **par composant** → entrée `validation-master` dans `decisions.md`
- [ ] T033 [US3] Construire le master **Textarea** sur `DS · Atomes` (même exigence de propreté) → validation owner par composant → entrée `decisions.md`
- [ ] T034 [US3] Construire le master **Select** sur `DS · Atomes` avec une instance du `chevron-down` existant (jamais une copie) → validation owner par composant → entrée `decisions.md`
- [ ] T035 [US3] Construire le master **Checkbox** sur `DS · Atomes` (net-new intégral — aucun existant dans les maquettes) → validation owner par composant → entrée `decisions.md`

### Phase A — lot 2 : icônes (net-new + inféré)

- [ ] T036 [US3] Auditer par position les groupes bruts d'icônes sociales (bloc `Suivez-nous`) et l'icône étoile inférée (bloc Avis Google) → `specs/003-externalize-figma-components/audits/atomes-icones.md` ; si l'étoile est introuvable → `introuvables[]` + statut `reporte`, jamais abandonnée en silence
- [ ] T037 [US3] Construire les masters **icônes sociales** sur `DS · Atomes`, alignés sur le jeu d'icônes existant → validation owner **par composant** → entrée `decisions.md`
- [ ] T038 [US3] Construire le master **icône étoile** sur `DS · Atomes` (bloc inféré, confirmé in-scope par l'owner) → validation owner par composant → entrée `decisions.md` ; si introuvable au moment de l'externalisation → entrée `report-bloc` (FR-009/FR-018), jamais un abandon muet

**Checkpoint**: la fondation (tokens + 6 atomes) est propre et validée. Les molécules peuvent s'y brancher.

---

## Phase 7: Molécules — 15 masters, 1 bloc = 1 incrément prouvé (US3 → US2, US4 + US1 à chaque adoption)

**Goal**: les molécules recopiées deviennent des masters gouvernés et les maquettes des assemblages d'instances.

**Independent Test (par bloc)**: un master unique existe ; un scan des 9 maquettes ne montre **aucune copie brute restante** de ce bloc ; le ledger est complet ; le verdict est 9/9 `identical` (ou l'écart est chiffré, expliqué et accepté au journal).

**Chiffres**: 13 lignes d'inventaire → **14 masters** (Footer-column et Copyright partagent une ligne) **+ gallery-item inféré = 15**. Comptes d'occurrences = mesures 2026-07-23, **re-mesurés au scan avant chaque extraction** (FR-002) — les chiffres re-mesurés font foi.

**Cadence de validation (FR-013, arbitrage owner 2026-07-23 — valable Phases 7–8)**: **petits lots** pour les extractions simples — 2 à 3 tâches « Master » consécutives PEUVENT être exécutées d'affilée, une session owner valide le petit lot (une entrée `validation-master` le couvre, chaque master nommé), puis leurs adoptions se déroulent **une par une** (checkpoint + preuve pixel par adoption, inchangés, DAG respecté) ; **par composant** pour les inférés (review-card, gallery-item).

**Chaque tâche « Master »** = re-mesure + audit (structure ET usage par position) + checkpoint + construction propre + validation owner.
**Chaque tâche « Adoption »** = ledger AVANT remplacement + checkpoint + capture before + copies→instances + overrides + capture after + `pages:compare` + commit conjoint (verdict + ledger + entrée journal + inventaire).

- [ ] T039 [US3] Master **Field** (label + saisie + erreur ; dépend d'Input/Select/Textarea) → `audits/field.md` + entrée `decisions.md`
- [ ] T040 [US2] Adoption **Field** — `field` brut ×7 → `ledger/field.json` + `proofs/field/verdict.{json,md}`
- [ ] T041 [US3] Master **Accordion-row** (ligne FAQ, états ouvert/fermé en propriété officielle ; instance des chevrons existants) → `audits/accordion-row.md` + entrée `decisions.md`
- [ ] T042 [US2] Adoption **Accordion-row** — `item` / `item open` ~34 → `ledger/accordion-row.json` + `proofs/accordion-row/verdict.{json,md}`
- [ ] T043 [US3] Master **Tabs / Tab** → `audits/tabs.md` + entrée `decisions.md`
- [ ] T044 [US2] Adoption **Tabs** — `tab` brut ×4 → `ledger/tabs.json` + `proofs/tabs/verdict.{json,md}`
- [ ] T045 [US3] Master **Category-card** (image + titre + CTA ; instance Bouton existant) — un des 3 blocs cachés sous le nom `item`, nom vrai obligatoire (FR-008) → `audits/category-card.md` + entrée `decisions.md`
- [ ] T046 [US2] Adoption **Category-card** — `item` ~15 → `ledger/category-card.json` + `proofs/category-card/verdict.{json,md}`
- [ ] T047 [US3] Master **Product-card** (`Thumbnail produit` ; instance Bouton) → `audits/product-card.md` + entrée `decisions.md`
- [ ] T048 [US2] Adoption **Product-card** — brut ×8 → `ledger/product-card.json` + `proofs/product-card/verdict.{json,md}`
- [ ] T049 [US3] Master **Member-card** (photo + nom + rôle ; instance `member-picture` existant) → `audits/member-card.md` + entrée `decisions.md`
- [ ] T050 [US2] Adoption **Member-card** — `member` brut ×16 → `ledger/member-card.json` + `proofs/member-card/verdict.{json,md}`
- [ ] T051 [US3] Master **Reassurance-item** (icône + texte ; 3e bloc caché sous `item`) → `audits/reassurance-item.md` + entrée `decisions.md`
- [ ] T052 [US2] Adoption **Reassurance-item** — `item` ~26 → `ledger/reassurance-item.json` + `proofs/reassurance-item/verdict.{json,md}`
- [ ] T053 [US3] Master **Review-card** (avatar + étoiles + texte ; dépend de l'icône étoile T038) — bloc **inféré** → validation owner **par composant** ; introuvable → `report-bloc` → `audits/review-card.md` + entrée `decisions.md`
- [ ] T054 [US2] Adoption **Review-card** — occurrences Avis Google localisées par position → `ledger/review-card.json` + `proofs/review-card/verdict.{json,md}`
- [ ] T055 [US3] Master **Carousel-controls** (prev / next ; instances Bouton) → `audits/carousel-controls.md` + entrée `decisions.md`
- [ ] T056 [US2] Adoption **Carousel-controls** — `Controls` brut ×2 → `ledger/carousel-controls.json` + `proofs/carousel-controls/verdict.{json,md}`
- [ ] T057 [US3] Master **Footer-column** → `audits/footer-column.md` + entrée `decisions.md`
- [ ] T058 [US2] Adoption **Footer-column** — brut ×9 → `ledger/footer-column.json` + `proofs/footer-column/verdict.{json,md}`
- [ ] T059 [US3] Master **Copyright** → `audits/copyright.md` + entrée `decisions.md`
- [ ] T060 [US2] Adoption **Copyright** — brut ×9 → `ledger/copyright.json` + `proofs/copyright/verdict.{json,md}`
- [ ] T061 [US3] Master **Contact-info-row** (adresse / horaires / … ; dépend des icônes sociales T037) → `audits/contact-info-row.md` + entrée `decisions.md`
- [ ] T062 [US2] Adoption **Contact-info-row** — brut ×4 → `ledger/contact-info-row.json` + `proofs/contact-info-row/verdict.{json,md}`
- [ ] T063 [US3] Master **Section-header** (surtitre + titre + CTA ; instance Bouton) → `audits/section-header.md` + entrée `decisions.md`
- [ ] T064 [US2] Adoption **Section-header** — `Titres` brut ×9 → `ledger/section-header.json` + `proofs/section-header/verdict.{json,md}`
- [ ] T065 [US3] Master **Gallery-item** (bloc **inféré**, attendu dans Réalisations) → validation owner **par composant** ; si non localisé au scan → entrée `report-bloc` + `introuvables[]`, l'adoption T066 est alors annulée explicitement → `audits/gallery-item.md`
- [ ] T066 [US2] Adoption **Gallery-item** — occurrences Réalisations localisées par position → `ledger/gallery-item.json` + `proofs/gallery-item/verdict.{json,md}`
- [ ] T067 [US3] Master **Accordion** (groupe de lignes ; **exige T042 adopté-prouvé** — invariant DAG) → `audits/accordion.md` + entrée `decisions.md`
- [ ] T068 [US2] Adoption **Accordion** — `accordion` brut ×12 → `ledger/accordion.json` + `proofs/accordion/verdict.{json,md}`

**Checkpoint**: toutes les molécules sont des masters adoptés et prouvés. Les sections peuvent les composer.

---

## Phase 8: Sections — 16 masters, triviales d'abord, composites en dernier (US3 → US2, US4 + US1 à chaque adoption)

**Goal**: les 16 sections recopiées page par page deviennent des masters ; les 9 maquettes deviennent des assemblages d'instances.

**Independent Test (par bloc)**: identique à la Phase 7 — master unique, zéro copie brute restante au scan, ledger complet, 9/9 `identical` ou écart accepté au journal.

**Ordre imposé (FR-004)**: aucune section avant que **toutes** ses molécules soient `adopte-prouve`. Les composites (`Hero et catégories`, `Footer + Devis`) ferment la marche.

**Cadence de validation (FR-013)** : comme en Phase 7 — petits lots de 2-3 masters simples possibles avant leurs adoptions ; preuve pixel par adoption inchangée.

- [ ] T069 [US3] Master **Devis / CTA** (trivial : instance Bouton) → `audits/devis-cta.md` + entrée `decisions.md`
- [ ] T070 [US2] Adoption **Devis / CTA** — 8 pages → `ledger/devis-cta.json` + `proofs/devis-cta/verdict.{json,md}`
- [ ] T071 [US3] Master **Présentation** (trivial : instance Bouton) → `audits/presentation.md` + entrée `decisions.md`
- [ ] T072 [US2] Adoption **Présentation** — 5 pages → `ledger/presentation.json` + `proofs/presentation/verdict.{json,md}`
- [ ] T073 [US3] Master **SAV** (trivial : Bouton + image) → `audits/sav.md` + entrée `decisions.md`
- [ ] T074 [US2] Adoption **SAV** — 1 page → `ledger/sav.json` + `proofs/sav/verdict.{json,md}`
- [ ] T075 [US3] Master **Hero** (exige Section-header T064 adopté) → `audits/hero.md` + entrée `decisions.md`
- [ ] T076 [US2] Adoption **Hero** — 8 pages → `ledger/hero.json` + `proofs/hero/verdict.{json,md}`
- [ ] T077 [US3] Master **Réassurances** (exige Reassurance-item T052 adopté + Bouton) → `audits/reassurances.md` + entrée `decisions.md`
- [ ] T078 [US2] Adoption **Réassurances** — 6 pages → `ledger/reassurances.json` + `proofs/reassurances/verdict.{json,md}`
- [ ] T079 [US3] Master **Catégories principales** (+ variante `alt` portée par une propriété officielle, pas un second master ; exige Category-card T046 adopté) → `audits/categories-principales.md` + entrée `decisions.md`
- [ ] T080 [US2] Adoption **Catégories principales** — 7 pages → `ledger/categories-principales.json` + `proofs/categories-principales/verdict.{json,md}`
- [ ] T081 [US3] Master **Texte SEO** (exige Accordion T068 adopté) → `audits/texte-seo.md` + entrée `decisions.md`
- [ ] T082 [US2] Adoption **Texte SEO** — 8 pages → `ledger/texte-seo.json` + `proofs/texte-seo/verdict.{json,md}`
- [ ] T083 [US3] Master **FAQ** (exige Tabs T044 + Accordion T068 adoptés + Bouton) → `audits/faq.md` + entrée `decisions.md`
- [ ] T084 [US2] Adoption **FAQ** — 4 pages → `ledger/faq.json` + `proofs/faq/verdict.{json,md}`
- [ ] T085 [US3] Master **Produits e-commerce** (exige Product-card T048 + Carousel-controls T056 adoptés) → `audits/produits-ecommerce.md` + entrée `decisions.md`
- [ ] T086 [US2] Adoption **Produits e-commerce** — 2 pages → `ledger/produits-ecommerce.json` + `proofs/produits-ecommerce/verdict.{json,md}`
- [ ] T087 [US3] Master **Équipe** (exige Member-card T050 adopté) → `audits/equipe.md` + entrée `decisions.md`
- [ ] T088 [US2] Adoption **Équipe** — 1 page → `ledger/equipe.json` + `proofs/equipe/verdict.{json,md}`
- [ ] T089 [US3] Master **Avis Google** (exige Review-card T054 adopté) → `audits/avis-google.md` + entrée `decisions.md`
- [ ] T090 [US2] Adoption **Avis Google** — 8 pages → `ledger/avis-google.json` + `proofs/avis-google/verdict.{json,md}`
- [ ] T091 [US3] Master **Formulaire** (exige Field T040 adopté + Checkbox T035 validé + Bouton) → `audits/formulaire.md` + entrée `decisions.md`
- [ ] T092 [US2] Adoption **Formulaire** — 1 page → `ledger/formulaire.json` + `proofs/formulaire/verdict.{json,md}`
- [ ] T093 [US3] Master **Coordonnées** (exige Contact-info-row T062 adopté + icônes sociales ; la carte reste une image, zéro dépendance tierce FR-019) → `audits/coordonnees.md` + entrée `decisions.md`
- [ ] T094 [US2] Adoption **Coordonnées** — 1 page → `ledger/coordonnees.json` + `proofs/coordonnees/verdict.{json,md}`
- [ ] T095 [US3] Master **Réalisations** (exige Gallery-item T066 adopté ; si gallery-item a été reporté en T065 → cette section est reportée avec sa raison, jamais externalisée à moitié) → `audits/realisations.md` + entrée `decisions.md`
- [ ] T096 [US2] Adoption **Réalisations** — 3 pages → `ledger/realisations.json` + `proofs/realisations/verdict.{json,md}`
- [ ] T097 [US3] Master **Hero et catégories** (composite : instances de Hero T076 + Catégories T080, jamais des copies) → `audits/hero-et-categories.md` + entrée `decisions.md`
- [ ] T098 [US2] Adoption **Hero et catégories** — 6 pages → `ledger/hero-et-categories.json` + `proofs/hero-et-categories/verdict.{json,md}`
- [ ] T099 [US3] Master **Footer (+ Devis)** (composite : logo existant + Footer-column T058 + Copyright T060 + Bouton ; le Footer est bien un bloc à externaliser, contrairement au `Header nav` qui **est** déjà un composant) → `audits/footer-devis.md` + entrée `decisions.md`
- [ ] T100 [US2] Adoption **Footer (+ Devis)** — 9 pages → `ledger/footer-devis.json` + `proofs/footer-devis/verdict.{json,md}`

**Checkpoint**: les ~35 blocs sont des masters gouvernés ; les 9 maquettes sont des assemblages d'instances.

---

## Phase 9: Clôture & preuves transverses

**Purpose**: prouver les critères de succès, ne rien laisser en silence, rendre les gates au statu quo.

- [ ] T101 Scan final via le pont → `specs/003-externalize-figma-components/inventory/scan-final-<date>.json` : **zéro occurrence `copie-brute`** pour tout bloc externalisé (SC-003) **et `dependancesTierces[]` vide** (SC-008) ; toute copie restante est nommée avec sa raison
- [ ] T102 [P] Rédiger le rapport d'honnêteté SC-009 → `specs/003-externalize-figma-components/proofs/honesty-report.md` : blocs reportés, personnalisations `non-portable-signalee`, écarts pixel acceptés (chiffres + raison), captures refusées, anomalies hors périmètre tranchées, `nonClasses[]` du scan final
- [ ] T103 [P] Mettre `COMPONENT-INVENTORY.md` à jour depuis le scan final (note datée sur chaque divergence — jamais silencieuse)
- [ ] T104 [P] Vérifier SC-001 … SC-009 un par un, chacun adossé à sa preuve → `specs/003-externalize-figma-components/proofs/success-criteria.md`
- [ ] T105 Sweep des gates **au statu quo sur le checkout principal** (`npm run eval` ne tourne pas en worktree) : `npm run build && npm run parity && npm run eval && npm run plugin:check && node scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && tsc -p tsconfig.build.json` — attendu : 94/97 evals (bloc intentionnel connu), parity 1 finding déclaré, le reste vert ; joindre la **dérogation écrite** (plan.md § Constitution Check) au corps de la PR au merge — tout rouge non couvert par elle bloque
- [ ] T106 Revoir `specs/003-externalize-figma-components/decisions.md` : chaque transition `valide-owner`, `ecart-accepte` et `reporte` a son entrée committée (pas d'entrée = pas de transition) ; le journal est append-only, aucune entrée réécrite
- [ ] T107 [P] Ajouter l'entrée datée de milestone dans `MILESTONES.md` (chiffres réels : masters livrés, copies remplacées, verdicts, écarts acceptés, blocs reportés)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** : aucune dépendance
- **Phase 2 (Foundational)** : dépend de Phase 1 — **BLOQUE tout le reste**
- **Phase 3 (US1)** : dépend de Phase 2 — **STOP-GATE T018** : sans étalonnage 9/9, le programme s'arrête
- **Phase 4 (US5)** : dépend de Phase 3 (la vérification post-restore utilise l'instrument)
- **Phase 5 (US4)** : dépend de Phase 2 (pont) ; indépendante de Phase 4 côté code
- **Phase 6 (US3 — tokens + atomes)** : dépend de Phases 3, 4, 5 (premier geste mutant sur le fichier client)
- **Phase 7 (Molécules)** : dépend de Phase 6 (Field exige les atomes ; Review-card exige l'icône étoile)
- **Phase 8 (Sections)** : dépend de Phase 7, bloc par bloc (aucune section avant que ses molécules soient `adopte-prouve`)
- **Phase 9 (Clôture)** : dépend de tout ce qui précède

### Dépendances internes notables (DAG)

- T067 (Master Accordion) **exige** T042 (Accordion-row adopté-prouvé) — invariant 1 du data-model
- T053/T054 (Review-card) **exigent** T038 (icône étoile)
- T039/T040 (Field) **exigent** T032–T034 (Input / Textarea / Select)
- T061/T062 (Contact-info-row) **exigent** T037 (icônes sociales)
- T075 (Hero) → T064 ; T081 (Texte SEO) → T068 ; T083 (FAQ) → T044 + T068 ; T091 (Formulaire) → T040 + T035
- T097 (Hero et catégories) → T076 + T080 ; T099 (Footer + Devis) → T058 + T060
- T095/T096 (Réalisations) → T066 ; si gallery-item est reporté en T065, la section est reportée **avec sa raison**

### Parallel Opportunities (honnêtement : peu)

Le programme est **structurellement séquentiel** — un seul fichier client, un seul opérateur, un checkpoint avant chaque geste. Deux opérations canvas concurrentes sont un risque, pas un gain. Les seules parallélisations réelles :

- **Phase 1** : T002, T003, T004, T005, T006 (fichiers repo distincts)
- **Phase 3** : T011 (fixtures) et T019 (README) en parallèle du code de comparaison T012–T015
- **Phases 4–5** : T022 et T025 (documentation) pendant les implémentations
- **Phase 9** : T102, T103, T104, T107 (artefacts distincts) ; T105 sur le checkout principal pendant la rédaction

À l'intérieur d'un incrément d'adoption, **rien** n'est parallélisable : ledger avant remplacement, capture before avant adoption, capture after avant verdict.

---

## Implementation Strategy

### MVP (Phases 1–3)

1. Phase 1 (Setup) + Phase 2 (Foundational) → le canevas live est lisible et re-mesuré
2. Phase 3 (US1) → **l'instrument de preuve existe et s'est prouvé lui-même**
3. **STOP et VALIDER** : `npm run pages:selftest` exit 0 **et** étalonnage double-capture 9/9 `identical`
4. Bruit propre ≠ 0 → **le programme s'arrête ici**, retour owner. Sans preuve fiable, aucune externalisation ne vaut d'être faite.

### Livraison incrémentale

1. Phases 1–3 → harnais de preuve (MVP)
2. Phases 4–5 → filet (rollback) + garde-fou d'intention (ledger) : le harnais d'incrément est complet
3. Phase 6 → fondation propre (tokens + 6 atomes), zéro risque pixel (aucune adoption)
4. Phase 7 → 15 molécules, **une par incrément prouvé** — chaque incrément est committable et démontrable seul
5. Phase 8 → 16 sections, triviales d'abord, composites en dernier
6. Phase 9 → clôture : SC-001…SC-009, honnêteté, gates au statu quo

Chaque incrément des phases 7–8 est un point d'arrêt sûr : le fichier client est cohérent, la preuve est commitée, le rollback est ciblé.

### Stratégie d'équipe

Un seul opérateur sur le canevas (contrainte du fichier client). Une seconde personne peut travailler en parallèle sur l'outillage repo (phases 1, 3, 5, et la documentation) et sur la relecture des audits/journaux — jamais sur des gestes Figma concurrents.

---

## Notes

- **[P]** = fichiers repo distincts, sans dépendance. Aucune tâche canvas n'est `[P]`.
- Une adoption n'est « faite » que si **ledger complet ET verdict passé** — les deux.
- Exit `2` de `pages:compare` = **la preuve n'a pas eu lieu** (refus), ce n'est jamais un « identique ».
- Un écart pixel sans **chiffres + raison + acceptation owner** au journal fait échouer l'étape (FR-015).
- Commit d'incrément = verdict + ledger + entrée journal + inventaire à jour, ensemble.
- Les comptes d'occurrences de ce fichier sont des mesures 2026-07-23 : **re-mesurer au scan avant chaque extraction**, les chiffres re-mesurés font foi.
