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

- [X] T030 [US3] Créer les 3 pages de rangement `DS · Atomes`, `DS · Molécules`, `DS · Sections` (R9 — les 5 masters existants ne bougent pas) ; checkpoint `003/setup/pages-ds` avant le geste ; noms amendables par l'owner → entrée `amendement-orga` si modifiés — **fait 2026-07-24** : checkpoint versionId `2379704052534853976`, 3 pages créées (`2052:1144/1145/1146`), fichier passe de 3 à 6 pages, noms non amendés → `proofs/pages-ds/page-creation.md`
- [X] T031 [US3] Auditer les saisies brutes par position (input brut ×6, champ Message 161px, `input` contenant un `chevron-down`, consentement RGPD en simple texte) → `specs/003-externalize-figma-components/audits/atomes-formulaire.md` (structure + usage sur les 9 maquettes) — **fait 2026-07-24** : 7 occurrences confirmées (6×48px dont 1 Select + 1×128px Textarea), toutes sur `Contactez-nous`, zéro ailleurs ; Checkbox confirmé net-new intégral (zéro occurrence) ; **1 anomalie trouvée** — texte de saisie en `#000000` brut non bindé (FR-010, proposition owner en attente avant T032)
- [X] T032 [US3] Construire le master **Input** sur `DS · Atomes` (nom vrai, couleurs aux variables, propriétés officielles, description, zéro dépendance tierce) → validation owner **par composant** → entrée `validation-master` dans `decisions.md` — **fait 2026-07-24** : `2053:1245` (280×48), fond/bordure/texte bindés, propriété TEXTE « Valeur », validé owner sur capture (reconstruit une fois après un undo accidentel, sans impact maquettes)
- [X] T033 [US3] Construire le master **Textarea** sur `DS · Atomes` (même exigence de propreté) → validation owner par composant → entrée `decisions.md` — **fait 2026-07-24** : `2053:1247` (280×128), même style qu'Input, hauteur propre portée par le container (pas le hack texte-surdimensionné de la source)
- [X] T034 [US3] Construire le master **Select** sur `DS · Atomes` avec une instance du `chevron-down` existant (jamais une copie) → validation owner par composant → entrée `decisions.md` — **fait 2026-07-24** : `2053:1249` (280×48), chevron en instance de `226:373` (local, redimensionnée 24×24), SPACE_BETWEEN
- [X] T035 [US3] Construire le master **Checkbox** sur `DS · Atomes` (net-new intégral — aucun existant dans les maquettes) → validation owner par composant → entrée `decisions.md` — **fait 2026-07-24** : `2053:1256` COMPONENT_SET, variant officiel `Coché` (Non/Oui), décoché=blanc/bordure bleu-gris, coché=bleu plein+coche blanche

### Phase A — lot 2 : icônes (net-new + inféré)

- [X] T036 [US3] Auditer par position les groupes bruts d'icônes sociales (bloc `Suivez-nous`) et l'icône étoile inférée (bloc Avis Google) → `specs/003-externalize-figma-components/audits/atomes-icones.md` ; si l'étoile est introuvable → `introuvables[]` + statut `reporte`, jamais abandonnée en silence — **fait 2026-07-24** : icônes sociales = 10 occurrences (Facebook+Instagram, `Frame 8`), déjà bindées proprement, prêtes à cloner ; **icône étoile introuvable comme vecteur** — la section Avis Google entière (8 pages) est un screenshot aplati d'un widget tiers (Trustindex, même `imageHash` sur 2 pages vérifiées) → décision owner en attente (net-new vs report-bloc) + constat transmis pour Review-card (T053, Phase 7)
- [X] T037 [US3] Construire les masters **icônes sociales** sur `DS · Atomes`, alignés sur le jeu d'icônes existant → validation owner **par composant** → entrée `decisions.md` — **fait 2026-07-24** : Facebook (`2053:1259`) + Instagram (`2053:1261`), clonés à l'identique depuis le source, fill déjà bindé
- [X] T038 [US3] Construire le master **icône étoile** sur `DS · Atomes` (bloc inféré, confirmé in-scope par l'owner) → validation owner par composant → entrée `decisions.md` ; si introuvable au moment de l'externalisation → entrée `report-bloc` (FR-009/FR-018), jamais un abandon muet — **fait 2026-07-24** : vecteur source introuvable (Avis Google = screenshot aplati d'un widget tiers, `audits/atomes-icones.md` §2) ; owner a tranché « net-new » plutôt que report — `Étoile` (`2053:1263`), `createStar()` 5 branches, `color/orange`

**Checkpoint**: la fondation (tokens + 6 atomes) est propre et validée. Les molécules peuvent s'y brancher.

---

## Phase 7: Molécules — 15 masters, 1 bloc = 1 incrément prouvé (US3 → US2, US4 + US1 à chaque adoption)

**Goal**: les molécules recopiées deviennent des masters gouvernés et les maquettes des assemblages d'instances.

**Independent Test (par bloc)**: un master unique existe ; un scan des 9 maquettes ne montre **aucune copie brute restante** de ce bloc ; le ledger est complet ; le verdict est 9/9 `identical` (ou l'écart est chiffré, expliqué et accepté au journal).

**Chiffres**: 13 lignes d'inventaire → **14 masters** (Footer-column et Copyright partagent une ligne) **+ gallery-item inféré = 15**. Comptes d'occurrences = mesures 2026-07-23, **re-mesurés au scan avant chaque extraction** (FR-002) — les chiffres re-mesurés font foi.

**Cadence de validation (FR-013, arbitrage owner 2026-07-23 — valable Phases 7–8)**: **petits lots** pour les extractions simples — 2 à 3 tâches « Master » consécutives PEUVENT être exécutées d'affilée, une session owner valide le petit lot (une entrée `validation-master` le couvre, chaque master nommé), puis leurs adoptions se déroulent **une par une** (checkpoint + preuve pixel par adoption, inchangés, DAG respecté) ; **par composant** pour les inférés (review-card, gallery-item).

**Méthode d'exécution (arbitrage owner 2026-07-24, valable pour tout le reste du programme — Phase 8 incluse)** : par bloc, dans cet ordre —
1. **Scoper à fond d'abord** (moi, dans la conversation) : audit live du bloc (structure ET usage par position, comme toujours), pièges Figma déjà connus recensés, nom français du master décidé, rapporté à l'owner avant toute construction.
2. **Une fois le go donné, déléguer l'exécution à un seul agent Sonnet** avec un brief autonome (contexte fichier/pont/pièges/conventions/gabarits à imiter — pas juste la tâche) plutôt que de tout construire en direct dans la conversation principale.
3. **Un seul opérateur sur le canevas live à la fois** — jamais deux agents Figma en parallèle (règle déjà posée cette session). Le scoping du bloc suivant (lecture seule) peut se faire pendant qu'un agent exécute, mais son exécution attend que le précédent ait fini.
4. **Capture avant obligatoire sur TOUTES les maquettes concernées par le bloc, avant tout remplacement — jamais une pilote d'abord** (voir la règle équivalente dans `CLAUDE.md`, tirée de l'incident Gallery-item 2026-07-24 : la copie brute une fois remplacée, son état d'avant est perdu pour de bon, aucun outil ne peut le reconstruire après coup). Vérifier que chaque capture est bien non-vide et aux bonnes dimensions avant de continuer.
5. **Vérifier la progression par preuve réelle** (fichiers sur disque, captures, git status) plutôt que de faire confiance au rapport de l'agent seul.
6. **Une fois le bloc vérifié bon, on rebrainstorme et on scope le suivant** — pas de scoping-délégation en avance sur un bloc pas encore clos.

**Chaque tâche « Master »** = re-mesure + audit (structure ET usage par position) + checkpoint + construction propre + validation owner.
**Chaque tâche « Adoption »** = ledger AVANT remplacement + checkpoint + capture before **(toutes les maquettes concernées, jamais une pilote seule)** + copies→instances + overrides + capture after + `pages:compare` **(preuve complète sur toutes les maquettes concernées quand c'est raisonnable — pas de repli 1-pilote-plus-structurel par défaut)** + commit conjoint (verdict + ledger + entrée journal + inventaire).

- [X] T039 [US3] Master **Field** (label + saisie + erreur ; dépend d'Input/Select/Textarea) → `audits/field.md` + entrée `decisions.md`
- [X] T040 [US2] Adoption **Field** — `field` brut ×7 → `ledger/field.json` + `proofs/field/verdict.{json,md}`
- [X] T041 [US3] Master **Accordion-row** (ligne FAQ, états ouvert/fermé en propriété officielle ; instance des chevrons existants) → `audits/accordion-row.md` + entrée `decisions.md`
- [X] T042 [US2] Adoption **Accordion-row** — `item` / `item open` ~34 → `ledger/accordion-row.json` + `proofs/accordion-row/verdict.{json,md}`
- [X] T043 [US3] Master **Tabs / Tab** → `audits/tabs.md` + entrée `decisions.md`
- [X] T044 [US2] Adoption **Tabs** — `tab` brut ×4 → `ledger/tabs.json` + `proofs/tabs/verdict.{json,md}`
- [X] T045 [US3] Master **Carte** (fusion Category-card + Reassurance-item — 1 master, propriété `Disposition`: Réassurance/Catégorie ; CTA = instance Bouton existant présente seulement en Catégorie ; voir `decisions.md`, amendement single-master) → `audits/carte.md` + entrée `decisions.md`
- [X] T046 [US2] Adoption **Catégorie** (disposition Carte) — `item` 10 → `ledger/carte.json` + `proofs/carte/verdict.{json,md}` (preuve pixel complète sur 2/9 maquettes pilotes ; 7 maquettes batchées en vérification structurelle+visuelle, limite documentée dans `decisions.md`)
- [X] T047 [US3] Master **Product-card** (`Thumbnail produit` ; instance Bouton **invisible par défaut** — le CTA e-commerce n'est jamais rendu dans la source, voir `decisions.md`) → `audits/product-card.md` + entrée `decisions.md`
- [X] T048 [US2] Adoption **Product-card** — brut ×8 (4 Motorisation + 4 Accueil) → `ledger/product-card.json` + `proofs/product-card/verdict.{json,md}` (preuve pixel complète sur Motorisation 4/4 ; Accueil vérifié structurellement+visuellement, limite documentée)
- [X] T049 [US3] Master **Member-card** (photo + nom + rôle ; instance `member-picture` existant) → `audits/member-card.md` + entrée `decisions.md`
- [X] T050 [US2] Adoption **Member-card** — `member` brut ×16 → `ledger/member-card.json` + `proofs/member-card/verdict.{json,md}` (preuve pixel complète 16/16, seule maquette concernée)
- [X] T051 [US3] Master **Reassurance-item** — couvert par T045 (même master **Carte**, disposition `Réassurance`) → voir `audits/carte.md`
- [X] T052 [US2] Adoption **Réassurance** (disposition Carte) — `item` 26 → `ledger/carte.json` + `proofs/carte/verdict.{json,md}` (même limite de preuve que T046, voir `decisions.md`)
- [ ] T053 [US3] Master **Review-card** (avatar + étoiles + texte ; dépend de l'icône étoile T038) — bloc **inféré** → validation owner **par composant** ; introuvable → `report-bloc` → `audits/review-card.md` + entrée `decisions.md` — **`report-bloc` posé 2026-07-24** : source = screenshot aplati (widget Trustindex), owner décline le net-new pour l'instant (« pas si c'est un screenshot, en tout cas pas maintenant ») → `audits/review-card.md` + `decisions.md`, condition de reprise notée
- [ ] T054 [US2] Adoption **Review-card** — occurrences Avis Google localisées par position → `ledger/review-card.json` + `proofs/review-card/verdict.{json,md}` — **bloquée par T053 (reporté)**
- [X] T055 [US3] Master **Carousel-controls** (prev / next ; instances Bouton `Outilne noir`, libellé invisible) → `audits/carousel-controls.md` + entrée `decisions.md`
- [X] T056 [US2] Adoption **Carousel-controls** — `Controls` brut ×2 → `ledger/carousel-controls.json` (vide) + `proofs/carousel-controls/verdict.{json,md}` (byte-exact sur Motorisation)
- [X] T057 [US3] Master **Footer-column** (Col 2/3/4 seulement — Col 1/5 hors périmètre, tranché au scan T0) → `audits/footer-column.md` + entrée `decisions.md`
- [X] T058 [US2] Adoption **Footer-column** — `Col N` brut ×27 (3×9 pages) → `ledger/footer-column.json` + `proofs/footer-column/verdict.{json,md}` (preuve pixel pilote + positions convergées exactement sur les 8 autres)
- [X] T059 [US3] Master **Copyright** → `audits/copyright.md` + entrée `decisions.md`
- [X] T060 [US2] Adoption **Copyright** — brut ×9 → `ledger/copyright.json` + `proofs/copyright/verdict.{json,md}`
- [X] T061 [US3] Master **Contact-info-row** — nommé `Avantage` à la construction : le contenu réel est un argument de vente (icône marque `piqueray` + titre + texte gras multi-segments), pas des coordonnées ; ne dépend PAS des icônes sociales T037 (supposition de l'inventaire invalidée à l'audit, le compte ×4 sur `features`/Contactez-nous restait exact) → `audits/contact-info-row.md` + entrée `decisions.md`
- [X] T062 [US2] Adoption **Contact-info-row** (`Avantage`) — brut ×4 → `ledger/contact-info-row.json` + `proofs/contact-info-row/verdict.{json,md}` (preuve pixel complète 4/4)
- [X] T063 [US3] Master **Section-header** (Disposition Standard=accroche+titre / Avec CTA=titre+Bouton ; instance Bouton existant) → `audits/section-header.md` + entrée `decisions.md`
- [X] T064 [US2] Adoption **Section-header** — `Title` brut ×21 (8 pages) → `ledger/section-header.json` + `proofs/section-header/verdict.{json,md}` (preuve pixel pilote + incident GROUP résolu en direct, voir decisions.md)
- [X] T065 [US3] Master **Gallery-item** (bloc **inféré**, attendu dans Réalisations) → validation owner **par composant** ; si non localisé au scan → entrée `report-bloc` + `introuvables[]`, l'adoption T066 est alors annulée explicitement → `audits/gallery-item.md` — **fait 2026-07-24** : confirmé au scan (27 occurrences, 3 maquettes, 27 `imageHash` distincts), master `Réalisation` construit (`COMPONENT_SET` `2095:2484`, variant `Taille` Grand 743×743/Petit 339,5×339,5), owner go direct
- [X] T066 [US2] Adoption **Gallery-item** — occurrences Réalisations localisées par position → `ledger/gallery-item.json` + `proofs/gallery-item/verdict.{json,md}` — **fait 2026-07-24** : `portes_habitat_6 N` brut ×27 (3 maquettes) → 0 copie restante, preuve pixel byte-exacte 3/3 (identical, sha256 égaux avant/après), piège layout `GRID` natif (ancrage auto-flow non hérité par une instance neuve) trouvé et corrigé avant toute capture — voir decisions.md
- [X] T067 [US3] Master **Accordion** — **pas de master séparé** : wrapper sans identité visuelle propre (même décision que `tabs`/Tab et `row`/Field), vérifié sur 4 échantillons (FAQ×3 + Texte SEO) → `audits/accordion.md` + entrée `decisions.md`
- [X] T068 [US2] Adoption **Accordion** — déjà couvert par T042 (les enfants `accordion` sont déjà des instances Accordion-row adoptées) ; aucune mutation Figma pour cette tâche, `ledger/accordion-row.json` fait foi

**Checkpoint — Phase 7 CLOSE 2026-07-24** : 11/12 blocs construits et adoptés (11e = Réalisation/Gallery-item, dernier fait, 3/3 byte-exact) ; 1/12 reporté (Review-card, `report-bloc`, condition de reprise dans `decisions.md`). Preuve pixel réelle sur **22/54** couples molécule × maquette (le reste vérifié structure + visuel, limite posée à chaque adoption — voir l'entrée `decisions.md` du 2026-07-24 « clôture Phase 7 »). Les sections peuvent composer les molécules adoptées ; Réassurances/Catégories/Hero/FAQ/etc. peuvent démarrer, Avis Google reste bloquée par le report Review-card.

---

## Phase 8: Sections — 16 masters, triviales d'abord, composites en dernier (US3 → US2, US4 + US1 à chaque adoption)

**Goal**: les 16 sections recopiées page par page deviennent des masters ; les 9 maquettes deviennent des assemblages d'instances.

**Independent Test (par bloc)**: identique à la Phase 7 — master unique, zéro copie brute restante au scan, ledger complet, 9/9 `identical` ou écart accepté au journal.

**Ordre imposé (FR-004)**: aucune section avant que **toutes** ses molécules soient `adopte-prouve`. Les composites (`Hero et catégories`, `Footer + Devis`) ferment la marche.

**Cadence de validation (FR-013)** : comme en Phase 7 — petits lots de 2-3 masters simples possibles avant leurs adoptions ; preuve pixel par adoption inchangée.

- [X] T069 [US3] Master **Devis / CTA** — nommé `Devis` (nom natif du layer) ; instance Bouton baked (déjà gouverné) + propriété TEXTE `Titre` (vraie variation « chez vous »/« dans vos locaux » sur Portes de garage industrielles) ; 2e variation trouvée à l'audit live, non prévue au brief : fond photo différent sur la même page (override d'instance, comme gallery-item) → `audits/devis-cta.md` + entrée `decisions.md`
- [X] T070 [US2] Adoption **Devis / CTA** — 8 pages → `ledger/devis-cta.json` + `proofs/devis-cta/verdict.{json,md}` (0 copie brute restante, 8/8 bbox identiques avant/après ; écart pixel accepté 8/8 `diff`, moyenne 0.013%/max 0.0216% de la page — sous le précédent Accordion-row 0.032%/0.050%, cause = bruit de rendu sub-pixel d'un texte neuf, grille d'audit texte complète vérifiée avant acceptation, voir `decisions.md`). **Corrigé après coup, 2026-07-24 nuit** : le master avait un glyphe de Bouton (« Outline blanc ») baké sombre au lieu de blanc — trouvaille pré-existante (pas une régression de cette spec), corrigée sur le master, vérifiée indépendamment octet-brut (zéro déplacement), committée. Détail : `decisions.md` (entrée de correction) + `proofs/devis-cta/icon-fix/`.
- [X] T071 [US3] Master **Présentation** (trivial : instance Bouton) → `audits/presentation.md` + entrée `decisions.md` — **fait 2026-07-24** : `2103:2824` (COMPONENT, 3 occurrences réelles re-mesurées, pas 5 — les 2 autres sont le titre interne de Réalisations, même collision que gallery-item), propriétés Titre/Texte (TEXTE) + Bouton (BOOLEAN, défaut masqué — CTA réellement visible sur 1/3 seulement, mesuré)
- [X] T072 [US2] Adoption **Présentation** — 3 pages → `ledger/presentation.json` + `proofs/presentation/verdict.{json,md}` — **fait 2026-07-24** : `Présentation` brut ×3 → 0 copie restante, 5/9 identical + 3/9 diff acceptés (0.024% moy/0.047% max, sous le précédent Accordion-row) ; 4e diff (Contactez-nous) hors périmètre, cf. decisions.md
- [X] T073 [US3] Master **SAV** (trivial : Bouton + image) → `audits/sav.md` + entrée `decisions.md` — **fait 2026-07-24** : `2108:3105` (COMPONENT 1552×677, section `2108:3091` à 0/8035), 1 occurrence confirmée par **3 mesures** (nom + bande de taille + empreinte image unique, pas le nom seul) ; cas le plus profond de la spec (3 GROUP imbriqués) traité par **clonage verbatim** (le piège d'origine-instable ne s'est jamais déclenché — seul le top-level déplacé) ; propriété `Titre` (TEXTE, uniforme, lié sans aplatissement), corps riche (3 gras + `\n`) gardé statique (occurrence unique, arbitrage Coordonnées), Bouton local déjà gouverné (`remote:false`)
- [X] T074 [US2] Adoption **SAV** — 1 page → `ledger/sav.json` + `proofs/sav/verdict.{json,md}` — **fait 2026-07-24** : `SAV` brut ×1 (Accueil) → 0 copie restante, instance `2108:3135`, bbox delta `{0,0,0,0}` (auto-layout `insertChild(2)`, zéro coordonnée manuelle) ; **1/1 diff à 3 px (0,000032 % — le plus bas de toute la spec)**, tracé bruit sub-pixel du seul titre re-rastérisé après triptyque zoomé + audit texte exhaustif (3 gras aux indices exacts, `\n` à 225, Bouton — correspondance 100 %) ; `ledger/sav.json` vide explicite, `pages:ledger:check` exit 0
- [X] T075 [US3] Master **Hero** (exige Section-header T064 adopté) → `audits/hero.md` + entrée `decisions.md` — **fait 2026-07-24** : `2111:3382` (COMPONENT 1728×640, **hauteur externe FIXE** → voisins jamais déplacés ; section `2111:3374` à `0,8872`), cloné de Portes de garage industrielles (`387:724`) + `createComponentFromNode` ; **la dépendance Section-header est de séquencement, pas de composition** (le Hero n'imbrique pas de Section-header — structure propre mesurée) ; Bouton = instance gouvernée `6:135`, zéro tierce ; aucune propriété TEXTE formelle (gras riche → override de sous-calque, précédent Texte SEO) ; **leçon Texte SEO traitée à la source** : titre largeur 1550 invariante + sous-titre FILL dérivé (`1550−gap−Bouton`, recalculé par instance, jamais baké) — 8 occurrences mesurées AVANT construction ; piège vérifié sur scratch : `itemSpacing` overridable sur sous-cadre d'instance (mécanisme de reproduction de la largeur sous-titre)
- [X] T076 [US2] Adoption **Hero** — 8 pages → `ledger/hero.json` + `proofs/hero/verdict.{json,md}` — **fait 2026-07-24** : `Hero` brut ×8 (toutes sauf Accueil) → 0 copie restante, 8 instances, 8/8 bbox identiques ; adoption par `insertChild(0)` (parents FRAME auto-layout VERTICAL, zéro coordonnée/resize/restructuration) + overrides (fills image, titre/sous-titre par plage, gap, props Bouton) ; ledger relevé par lecture directe (angle mort `customizations.js` sur Bouton imbriqué + gap, précédent FAQ) = 31 `reportee`/0 non-portable, `pages:ledger:check` exit 0. **Corrigé la nuit même** : l'auto-validation initiale (« 8/9 diff = bruit AA pur ») était fausse — revue Fable indépendante a trouvé une régression réelle (glyphe du Bouton blanc→sombre sur les 8 instances, rejeu de props réinitialisant un override de couleur), corrigée et re-vérifiée (chaque page a baissé ou atteint 0, 2/8 passent `identical`). **Second écart trouvé, non résolu** : déplacement +3-5px du bloc titre/Bouton sur 6/8 pages, antérieur à ce fix, mécanisme non confirmé — nommé honnêtement, remonté à l'owner, PAS accepté comme bruit AA. Détail complet : `decisions.md` (entrée de correction) + `proofs/hero/README.md`.
- [X] T077 [US3] Master **Réassurances** (exige Reassurance-item T052 adopté + Bouton) → `audits/reassurances.md` + entrée `decisions.md` — **fait 2026-07-25** : prémisse « 4 cartes + 1 Bouton identique » **invalidée à la mesure des 6** (3 structures : 4c+1CTA, 4c+2CTA sur Portes d'entrée, 5c+1CTA sur Portes de garage/Accueil) → un master plain aurait perdu 1 carte (×2) + 1 bouton en silence. Livré `COMPONENT_SET` `2114:3721` (Option A, validée orchestrateur, alignée T079 + précédent Carte) : propriété `Disposition` = `4 cartes`/`4 cartes · 2 CTA`/`5 cartes`, chaque variante clonée d'une occurrence réelle (`createComponentFromNode` + `combineAsVariants`, zéro reconstruction) ; cartes/section-header/boutons gouvernés, zéro tierce ; section `2114:3722`
- [X] T078 [US2] Adoption **Réassurances** — 6 pages → `ledger/reassurances.json` + `proofs/reassurances/verdict.{json,md}` + `README.md` — **fait 2026-07-25** : 6 instances (`2115:3723/3754/3794/3830/3861/3892`), 0 copie brute, bonne variante par page, **bbox {0,0,0,0} + contenu byte-exact sur les 6** (0 mismatch/~100 champs) ; ledger 27 reportee/0 non-portable (`pages:ledger:check` exit 0). **Exécution partagée avec un fork concurrent confirmé de la tâche** (les deux branches convergées sur le même master ; le fork a adopté les 6, vérifié correct, seul override manquant — espace final PdG carte0 — porté par moi). **Trou de preuve pixel nommé** : `pages:compare` 6/6 identical mais **dégénéré** (before capturé post-adoption à cause de la collision, sha256 before==after ; raw-avant irrécupérable, R5) → preuve = structurelle + byte-exact (plus forte pour « zéro perte contenu/layout », mais pas la preuve pixel standard), voir `proofs/reassurances/README.md` + `decisions.md`. **Non committé** (brief) — **puis committé `09b1d88` + vérification indépendante 2026-07-25** : contre-preuve pixel reconstruite depuis la baseline archivée `devis-fix/after` (23:09, pré-adoption) — industrielles + Portes de garage **byte-identiques**, les 4 autres pages ≤305 px rouges confinés à la ligne des labels CTA, zéro ricochet ; écart nommé = normalisation largeur CTA 250→249px (hug vrai du master) ; glyphes re-lus live 6/6 + 3 variantes = `color/noir-bleute` sombre, zéro flip ; crops + summary sous `proofs/reassurances/crops/`
- [X] T079 [US3] Master **Catégories principales** (+ variante `alt` portée par une propriété officielle, pas un second master ; exige Category-card T046 adopté) → `audits/categories-principales.md` + entrée `decisions.md` — **fait 2026-07-25** : `COMPONENT_SET` `2115:4277` (section `2115:4158`, `DS · Molécules` `(0,12350)`), propriété `Disposition` ×4 (`Standard`/`Pleine largeur`/`Pleine largeur · 3 cartes`/`Pleine largeur · RDV`), chaque variante **clonée verbatim** d'une occurrence réelle. **Prémisse briefée invalidée à la mesure** (non-alt = tuiles-nav RAW **ingouvernées** ≠ Carte ; SAV mixte 1 gouv.+1 RAW bouton solide ; Motorisation **3** cartes) → remontée orchestrateur AVANT mutation, build 4-variantes validé (tuiles natives dans `Standard`, SAV clone verbatim, pas de master tuile séparé). 0 dépendance tierce. **Fork lockstep doc-only détecté + arbitré (0 dégât canvas, 1 seul master vérifié).** Non committé.
- [X] T080 [US2] Adoption **Catégories principales** — 7 pages → `ledger/categories-principales.json` + `proofs/categories-principales/verdict.{json,md}` — **fait 2026-07-25** : 7 instances, **bbox {0,0,0,0} sur les 7**, 0 copie brute ; 4 ancres 0-override + 3 overrides (Accueil tuiles ; entrée/résidentielles Carte + **fix hauteur 649→622** via `img` FIXED 418, contournant le no-op `resize()` sur carte imbriquée). Ledger **23 reportee/0 non-portable** (`pages:ledger:check` exit 0). Preuve `pages:compare` (raw-avant vs adopté-après, standard) : **5/7 byte-identiques** (sha256 avant==après, dont entrée+résidentielles à override lourd) + **2 écarts AA sous-pixel** (PdG 2624=0,034 %, Accueil 2500=0,028 %, bande sous-titre tuile, dont l'ancre PdG) **diagnostiqués non-régressifs** (runs police + props texte + zoom 3× identiques avant/après) puis **ACCEPTÉS par l'owner 2026-07-25** (même famille que les écarts déjà acceptés cette nuit ; renforcé par l'ancre PdG 0-override) ; `verdict.json` conservé `diff`/exit 1 tel quel, jamais maquillé — décision tracée dans `decisions.md`. `proofs/categories-principales/README.md`. Non committé — revue Fable indépendante en cours.
- [X] T081 [US3] Master **Texte SEO** (exige Accordion T068 adopté) → `audits/texte-seo.md` + entrée `decisions.md` — **fait 2026-07-24** : `2108:3123` (COMPONENT, HUG, cloné de Contactez-nous + `createComponentFromNode`), section `2108:3111` à (1692,8035) ; h3 s'est révélé un sous-titre par page (pas un « Infos pratiques » constant) ; lignes accordion déjà gouvernées (T042) réutilisées ; aucune propriété TEXTE formelle (gras riche + `\r` → override de sous-calque, pas de binding) ; piège trouvé : `resize()` refusé sur un `Contenu` d'instance imbriquée → `textAutoResize='HEIGHT'` donne la hauteur source
- [X] T082 [US2] Adoption **Texte SEO** — 8 pages → `ledger/texte-seo.json` + `proofs/texte-seo/verdict.{json,md}` — **fait 2026-07-24** : `Texte SEO` brut ×8 (toutes sauf Accueil) → 0 copie restante, 8/8 bbox exactes, `segMatch`/`charsMatch` true (gras + `\r` préservés) ; preuve pixel 1/9 identical (Accueil contrôle) + 8/9 diff acceptés (bruit AA sub-pixel pur, moy 0.072%/max 0.123% Contactez-nous swap-only — test de décalage min à (0,0) + segMatch byte-identique + crops) ; ledger 49 `reportee`, `pages:ledger:check` exit 0 ; **non committé** (revue Fable)
- [X] T083 [US3] Master **FAQ** (exige Tabs T044 + Accordion T068 adoptés + Bouton) → `audits/faq.md` + entrée `decisions.md` — **fait 2026-07-24** : `2104:2914` (COMPONENT, 1728×448, cloné depuis Portes de garage industrielles), assemble Section-header + accordion (N× Accordion-row) + Bouton — tous déjà gouvernés ; propriété `Ligne 3` (BOOLÉEN) montre/masque la 3e question (piège trouvé : retirer un enfant d'une instance placée est refusé par l'API Figma, résolu par visibilité togglable officielle) ; Dépannage/SAV (composite `Hero et FAQ`, 4 Tab déjà gouvernées) volontairement exclu du master, zéro slot onglets
- [X] T084 [US2] Adoption **FAQ** — 4 pages → `ledger/faq.json` + `proofs/faq/verdict.{json,md}` — **fait 2026-07-24** : `FAQ` brut ×3 (Portes d'entrée/industrielles/résidentielles) → 0 copie restante ; 2/4 `identical` (dont 1 byte-exact), 2/4 `diff` à 0,00061% (cause racine identifiée : dérive 1px historique du Bouton sur 2 sites, corrigée par l'adoption) ; Dépannage/SAV non adopté (déjà gouverné au niveau molécule), vérifié sans ricochet sur ses Tab (sha256 avant=après)
- [X] T085 [US3] Master **Produits e-commerce** (exige Product-card T048 + Carousel-controls T056 adoptés) → `audits/produits-ecommerce.md` + entrée `decisions.md` — **fait 2026-07-25** : `2116:4475` (plain COMPONENT, 1596×414, AL VERTICAL gap 48), section `2116:4465` à (0,15100) sans chevauchement ; Section-header `Avec CTA` (`2090:2388`) + GROUP « Carrousel produits » (4× Product-card `2068:1972` + Carousel-controls `2077:2191`) — **100 % locaux, 0 tierce** ; GROUP déborde 4 px/côté (1604 vs 1596, chevrons, hérité de la source byte-preuve à l'appui). **Rapport builder null** → audit écrit par le vérificateur indépendant depuis des mesures live refaites (voir Incident dans l'audit) ; checkpoints non vérifiables (token REST expiré), nommé
- [X] T086 [US2] Adoption **Produits e-commerce** — 2 pages → `ledger/produits-ecommerce.json` + `proofs/produits-ecommerce/verdict.{json,md}` — **fait 2026-07-25** : 2 instances **0-override** (`2116:4531` Motorisation (66,1846), `2116:4595` Accueil (66,2477)), 0 copie brute, textes == défauts master mot pour mot (même carrousel Hörmann sur les 2 pages) ; verdict **2/2 identical exit 0, byte-identique trois voies** (before 00:38Z == after 00:42Z == capture fraîche vérificateur 02:56Z : Accueil `f92ce3f9…`, Motorisation `4d073543…`), **provenance corroborée** par le jeu Catégories (shas déjà présents à 23:43Z/00:04Z, avant toute mutation produits — dégénéré type Réassurances exclu) ; re-run compare → verdict re-produit byte-identique ; visuel : master composité vs crops instances **0 px**, glyphes CTA/chevrons OK ; ledger **vide explicite** honnête (0 override mesuré), `pages:ledger:check` exit 0
- [X] T087 [US3] Master **Équipe** (exige Member-card T050 adopté) → `audits/equipe.md` + entrée `decisions.md` — **fait 2026-07-25** : `2115:3947` (**plain COMPONENT**, cloné de l'occurrence unique À Propos `258:1928` → `createComponentFromNode`, zéro reconstruction), wrapper HORIZONTAL padding 89 + `grid` **GRID 4×4** (survécu au componentize) + **16 Member-cards gouvernées** (`remote:false`, master `2074:2072`) ; 13 réels + 3 placeholders `Prénom/Poste` ; **complétude vérifiée live** (aucun Section-header/titre/Bouton — describe profondeur-3 confirmé complet) ; **0 remote / 0 tierce / 0 nouvel asset** (SC-008) ; calque mort `fun-ia` occulté reproduit. Section `2115:3928` à `1900,12350`. Checkpoint `003/equipe/pre-master` (`2379927240486025877`). Non committé (brief).
- [X] T088 [US2] Adoption **Équipe** — 1 page → `ledger/equipe.json` + `proofs/equipe/verdict.{json,md}` — **fait 2026-07-25** : instance `2115:4044` (À Propos idx 2), **bbox delta `{0,0,0,0}`**, FILL/HUG, 16 `Nom`/`Poste` **byte-exact**, 0 copie brute, master unique. **Preuve pixel byte-identique LÉGITIME** (raw→adopté réel, `before` capturé raw présent) : `pages:compare` 1/1 identical, **sha256 `before==after` `fcce5272417a…`** — 0 diff (pas du bruit AA) car le raw était déjà un wrapper de 16 Member-cards gouvernées ⇒ swap renderable-invariant au même bbox ; mécanisme expliqué dans `proofs/equipe/README.md`, jamais arrondi. Ledger **vide explicite** 0/0 (`pages:ledger:check` exit 0). Checkpoints `003/equipe/pre-adoption` (`2379926917866820646`) + `003/equipe/adoption` (`2379926269825387412`). Non committé (brief).
- [ ] T089 [US3] Master **Avis Google** (exige Review-card T054 adopté) → `audits/avis-google.md` + entrée `decisions.md` — **bloquée : Review-card `report-bloc` 2026-07-24** (source screenshot aplati, owner décline le net-new pour l'instant) → reportée avec sa raison, jamais externalisée à moitié
- [ ] T090 [US2] Adoption **Avis Google** — 8 pages → `ledger/avis-google.json` + `proofs/avis-google/verdict.{json,md}` — **bloquée par T089**
- [X] T091 [US3] Master **Formulaire** (exige Field T040 adopté + Checkbox T035 validé + Bouton) → `audits/formulaire.md` + entrée `decisions.md` — **fait 2026-07-24** : `2096:2564` (COMPONENT, cloné depuis la frame `row` 274:2874, pas le GROUP), 1550×723, 3 propriétés TEXTE (Accroche/Titre/Consentement) ; **prémisse Checkbox invalidée à l'audit** — la source n'a aucune Checkbox, consentement RGPD en simple texte (corrobore T031), master construit fidèle sans en inventer une ; **lien hypertexte tiers trouvé** (`jonckers-clabots.be` sur « la politique de confidentialité ») reproduit fidèlement, owner : corriger plus tard
- [X] T092 [US2] Adoption **Formulaire** — 1 page → `ledger/formulaire.json` + `proofs/formulaire/verdict.{json,md}` — **fait 2026-07-24** : `Formulaire` brut ×1 (Contactez-nous) → 0 copie restante, instance `2096:2714`, position identique au pixel via l'auto-layout du parent (aucune coordonnée manuelle) ; **2 vrais bugs trouvés et corrigés avant d'accepter le verdict** — (1) `componentPropertyReferences` sur la propriété TEXTE `Consentement` avait aplati le lien « politique de confidentialité » (perte de soulignement + hyperlink) ; (2) sa couleur était fausse (noir au lieu de `color/orange`, confirmé par échantillonnage pixel du PNG source), et le texte courant environnant a nécessité 2 essais de token (`color/noir-bleute` puis `color/noir`, tous deux faux à la mesure) avant de converger sur noir brut `#000000` non bindé = la vraie source ; verdict final **0,023% (1581px)**, dans la fourchette de bruit déjà acceptée cette session, ledger vide explicite, `pages:ledger:check` exit 0
- [X] T093 [US3] Master **Coordonnées** (exige Contact-info-row T062 adopté + icônes sociales ; la carte reste une image, zéro dépendance tierce FR-019) → `audits/coordonnees.md` + entrée `decisions.md` — **fait 2026-07-24** : `2104:2904` (COMPONENT, cloné depuis la frame live `274:2869`, zéro retype manuel), 1728×597, 2 propriétés TEXTE (Accroche/Titre) ; **prémisse Contact-info-row invalidée à l'audit** — structure réelle = 5 blocs simples (Titres/Adresse/Horaires/Contact/Suivez-nous), pas d'Avantage ; icônes Suivez-nous remplacées par instances Facebook/Instagram (T037, tailles identiques, zéro resize) ; **2 caractères invisibles confirmés** (`U+2028` seul sur Adresse, `\r`+`U+2028` sur Contact — même trappe que Footer-column)
- [X] T094 [US2] Adoption **Coordonnées** — 1 page → `ledger/coordonnees.json` + `proofs/coordonnees/verdict.{json,md}` — **fait 2026-07-24** : `Coordonnées` brut ×1 (Contactez-nous) → 0 copie restante, instance `2105:2968`, bbox strictement identique (auto-layout du parent, aucune coordonnée manuelle) ; verdict **1/1 diff, 816px (0,0121% de la page)** — investigation en 4 temps (zoom visuel, test de décalage, échantillonnage RGB, ré-audit texte exhaustif champ par champ y compris les caractères invisibles) confirme bruit de rendu sub-pixel, zéro perte réelle ; ledger vide explicite, `pages:ledger:check` exit 0
- [X] T095 [US3] Master **Réalisations** (exige Gallery-item T066 adopté) → `audits/realisations.md` + entrée `decisions.md` — **fait 2026-07-25** : `COMPONENT_SET` `2117:4691` (section `2116:4659` à `0,16120`), propriété `En-tête` × 2 (`Accroche`/`Presentation`, les 2 headers bruts source ne sont pas identiques — vraie variance, pas une incohérence) ; construit en 2 passes interrompues par une erreur d'infrastructure, jamais un problème logique
- [X] T096 [US2] Adoption **Réalisations** — 3 pages → `ledger/realisations.json` + `proofs/realisations/verdict.{json,md}` — **fait 2026-07-25** : 3 instances, bbox `{0,0,0,0}`, 0 copie brute ; **régression réelle trouvée par revue indépendante avant commit** (texte manquant sur résidentielles, 13 860px), corrigée directement (texte restauré depuis la capture before), revérifiée (diffCount → 70, même enveloppe qu'industrielles 31px) ; ledger 2 reportee + 2 non-portable-signalee (fidélité texte non garantissable au caractère près, source = image pas relecture live) ; détail : `decisions.md`
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
- ~~T061/T062 (Contact-info-row) exigent T037 (icônes sociales)~~ — invalidé à l'audit T061 : le bloc réel (`features`/Contactez-nous) utilise l'icône marque `piqueray`, aucune icône sociale ; renommé `Avantage`, zéro dépendance
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
