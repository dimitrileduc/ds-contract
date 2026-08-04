# Tasks: Géométrie gouvernée (015)

**Input**: documents de conception de `/specs/015-geometrie-gouvernee/`
**Prerequisites**: plan.md (requis), spec.md (user stories), research.md (D1–D14), data-model.md, contracts/ (3 interfaces), quickstart.md

**Tests**: OUI — exigés explicitement par la spec et la constitution (§II Claims Rule ; FR-009 « le cas reproduit en échec d'abord » ; FR-005 « prouvée, pas supposée »). Chaque capacité nouvelle a sa fixture AVANT sa revendication, et trois d'entre elles passent au ROUGE d'abord.

**Organisation**: une phase par user story, pour que chacune soit implémentable et vérifiable seule.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers disjoints, aucune dépendance sur une tâche non finie)
- **[Story]** : US1 (angle mort), US2 (boîtes), US3 (réparations), US4 (logo)
- Chemins de fichiers exacts dans chaque description

## ⚠️ Ordre imposé par la spec — US2 (P2) passe AVANT US1 (P1)

FR-004 est explicite : « la question du modèle de boîte MUST être tranchée et appliquée AVANT toute conversion de dimension — convertir d'abord, c'est convertir deux fois ». La priorité produit reste P1 pour US1 ; l'**ordre d'exécution** est imposé par la dépendance technique, pas par la priorité. Le MVP livrable reste US1, mais il n'est atteignable qu'après US2.

## Conventions de mesure (valables partout ci-dessous)

- Aucun compte n'est recopié depuis la prose : `~260 littéraux`, `7 contract-geometry`, `6 attendu` sont des **relevés d'ouverture**. Le compte vif imprimé par la commande fait foi (SC-001, SC-005, FR-013). *(Repère de cadrage relevé le 2026-08-04 sur l'ensemble fermé de canaux de `geometry-gate.interface.md` §2 : 183 entrées dans 27 contrats — un ordre de grandeur, pas une cible : seule la porte compte.)*
- `grep -a` / `rg -a` ou Python systématiquement (octet NUL légitime dans `core/emit-html.ts` et `extract/figma/visual-parity/run.ts`).
- `evals/fixtures` est hors tsconfig : `tsc` vert ≠ eval vert — lancer `npm run eval` réellement après toute retouche de signature partagée.
- Figma en **LECTURE SEULE** de bout en bout (FR-010) : dumps et relevés existants, jamais une mutation du fichier client.
- **Où vont les reçus.** La porte de mesure lit son corpus de reçus dans `specs/014-…/proofs/recus/` (chemin figé, `run.ts:46`). Les reçus de **réparation cités par le registre de 014** (`named-repair:*` — T055, T056, T059, T060, T062) s'y publient donc, sinon C4 les cherche là et refuse. Les reçus de **campagne propres à 015** (box-model, gradient-carry, relevés, pointeurs re-testés) restent sous `specs/015-…/proofs/recus/`. Voir T003b.
- **Population de la porte géométrie.** L'ensemble fermé de `geometry-gate.interface.md` §2 couvre les canaux de mise en page — relevé du 2026-08-04 : **183 entrées dans 27 contrats**. Les 260 entrées `literals` du dépôt comprennent 77 valeurs de trait, peinture et typographie (`line-height` 33, `border-radius` 15, `border-width` 10, `color` 9, `letter-spacing` 4, `background-color` 4, `border-color` 1, `font-size` 1) qui sont **hors périmètre nommé** : elles restent invisibles au contrôle, et la clôture doit le dire (§V). `invisible: 0` ne se lit jamais « 260 → 0 ».

---

## Phase 1: Setup (infrastructure partagée)

**Purpose**: worktree autosuffisant et point de départ prouvé vert

- [ ] T001 [Worktree gates — F1] Rendre le worktree autosuffisant (constitution, Development Workflow: Worktree Gates) : `git worktree add ../ds-contract-015 015-geometrie-gouvernee`, puis `npm install` DANS le worktree (`npm run eval` symlinke le `node_modules` du checkout — il refuse sans), puis `npx playwright install chromium` (2 contrôles pilotent un vrai Chromium). La sweep COMPLÈTE — `npm run eval` compris — tourne dans ce worktree à chaque checkpoint et à la clôture. Le checkout principal ne peut pas sortir cette branche tant que le worktree la tient ; si un contrôle doit y tourner : `git -C <checkout-principal> checkout --detach <commit>`, sweep, restaurer.
- [ ] T002 Prouver le point de départ vert et créer l'arborescence de preuves : lancer la sweep complète (voir § Sweep) dans le worktree et archiver sa sortie dans `specs/015-geometrie-gouvernee/proofs/depart-sweep.txt` ; créer `specs/015-geometrie-gouvernee/proofs/registre/`, `specs/015-geometrie-gouvernee/proofs/recus/` et `specs/015-geometrie-gouvernee/fixtures/`.

---

## Phase 2: Foundational (prérequis bloquants)

**Purpose**: capturer l'« avant » AVANT tout changement (FR-011), et remodeler l'instrument de comptage qui mesure toutes les stories (FR-006, FR-013)

**⚠️ CRITIQUE** : aucune story ne démarre avant la fin de cette phase. Le premier changement d'émetteur (T013) est irréversible pour l'« avant » : une fois le CSS régénéré, l'état initial n'est plus mesurable.

- [ ] T003 [P] Ajouter un paramètre de dossier de sortie à `extract/figma/organism-audit/tools/build-registre.mts` (`--out-dir`, défaut inchangé = `specs/014-mesure-juste-triage/proofs/registre` — rétro-compatible, D11) pour que 015 écrive ses preuves sans réécrire celles de 014. **`--out-dir` déplace `REGISTRE_DIR` en entier** : l'outil y lit aussi `attributions.json` (l.359 ; sinon refus « écart non attribué », l.490) et, pour `--render`, `causes.json` (l.653). Semer les deux dans le dossier 015 avant T005 : `attributions.json` = `{"byKey":{}}`, et un `causes.json` propre à 015. **Le `causes.json` de 014 reste la donnée vivante de la porte de mesure** (T009/T010/T062 l'éditent là-bas) — les deux fichiers ne se confondent pas, et le `note` de chacun doit le dire.
- [ ] T003b [BLOQUANT SC-005] Paramétrer la mesure lue par `extract/figma/measure-gate/run.ts`. Constat du 2026-08-04 : le fichier lit **quatre chemins figés dans 014** — `apres.json` (l.44), `causes.json` (l.45), `recus/` (l.46), `RAPPORT-CLOTURE.md` (l.52). Tant qu'ils le restent, la porte évalue les mesures **figées de 014** : les lignes texte-seo, footer et coordonnees garderaient leurs écarts quoi que 015 répare, seuls les `resolvedBy` tomberaient, et `contract-geometry` plafonnerait à 3 — **SC-005 serait inatteignable**. Ajouter `--apres <chemin>` (défaut 014 inchangé, rétro-compatible, patron de T003) et l'utiliser en T063/T069 sur l'`apres.json` de 015. Ne PAS déplacer `causes.json` ni `recus/` : le registre vivant et son corpus de reçus restent en 014 (voir § Conventions, « Où vont les reçus »). Claims Rule : fixture d'abord — la porte lue sur une mesure de 015 compte les lignes de 015.
- [ ] T004 [P] Étendre la fixture `evals/fixtures/measure-gate-policy-check.ts` AU ROUGE d'abord (Claims Rule, ordre imposé par `contracts/measure-gate-counting-v2.md` §6) : cas `aggregateOf` (1 ligne + 3 faits → 3, jamais 4), cas `resolvedBy` (entrée résolue → hors `byCause`), cas mixte `dedupeKey`/`aggregateOf`, cas de refus de cohérence (une ligne ne peut pas être à la fois `aggregateOf` et `dedupeKey` de ses propres faits). Constater le ROUGE contre `gate.ts` v1 et l'archiver dans `specs/015-geometrie-gouvernee/proofs/recus/comptage-v2-rouge.txt`.
- [ ] T005 Capturer l'« avant » du registre (FR-011) AVANT tout changement : `npm run extract:figma:visual` (rows.json pleine précision) puis `npx tsx extract/figma/organism-audit/tools/build-registre.mts --phase avant --out-dir specs/015-geometrie-gouvernee/proofs/registre` ; enregistrer la révision de navigateur (le refus `browser-changed-between-phases` exige le même navigateur en phase `apres`).
- [ ] T006 Archiver l'état v1 de la porte de mesure avant remodelage : `npm run measure:gate` → `specs/015-geometrie-gouvernee/proofs/ouverture-measure-v1.json` (le 7 `contract-geometry` sous sémantique v1, daté).
- [ ] T007 Implémenter le comptage v2 dans `extract/figma/measure-gate/gate.ts` : `MeasuredLine.aggregateOf?: string[]` (la ligne contribue 0, ses N faits comptent 1 chacun), `ReclassifiedDwEntry.resolvedBy?: string | null` lu au comptage (non nul ⇒ hors `byCause`, reste sous C4), et le refus de cohérence si les deux directions de dédoublonnage visent la même paire. La fixture T004 passe au vert ; C1–C4 et le vocabulaire fermé des six causes sont inchangés.
- [ ] T008 Mapper les nouveaux champs dans `extract/figma/measure-gate/run.ts` : `organismLines[].aggregateOf` → `MeasuredLine.aggregateOf`, `entries[].resolvedBy` → `ReclassifiedDwEntry.resolvedBy`.
- [ ] T009 Modéliser la relation 1:N dans la donnée : `specs/014-mesure-juste-triage/proofs/registre/causes.json`, ligne `footer/footer-master-defaults` reçoit `"aggregateOf": ["DW-001", "DW-004", "DW-005"]` (dwIds, cohérents avec `sameDefectAs.kind: "deferredWork"`).
- [ ] T010 Fermer l'entrée orpheline du registre (D12, FR hors périmètre mais nommé) : dans `specs/014-mesure-juste-triage/proofs/registre/causes.json` § `deferredWork`, DW-014-001 passe de `destination: "à ordonnancer — sans spec assignée"` à la tinyspec nommée `select-option-emit` (ordonnancée immédiatement après la clôture de 015, avant ou en parallèle de 016 ; fixture d'abord, puis la branche d'émetteur + les 3 re-pins). 015 ne touche PAS `core/emit-html.ts`.
- [ ] T011 Publier le relevé d'ouverture v2, relu en direct : `npm run measure:gate` → `specs/015-geometrie-gouvernee/proofs/ouverture-measure-v2.json` (attendu `contract-geometry: 6`, `instrument: 0` — **le compte vif fait foi si le calcul contredit l'attendu**, et l'écart est consigné, jamais lissé).
- [ ] T012 Checkpoint : sweep constitution complète verte dans le worktree, `npm run measure:gate` inclus.

**Checkpoint**: l'« avant » est capturé et l'instrument de comptage dit la vérité en unité « travail à faire » — les stories peuvent démarrer.

---

## Phase 3: User Story 2 - Les mêmes boîtes partout (Priority: P2) — exécutée en premier (FR-004)

**Goal**: la bibliothèque livrée mesure les mêmes boîtes que la maquette et les trois autres surfaces ; les 9 composants concernés cessent de rendre plus larges chez les consommateurs.

**Independent Test**: rendre un des 9 composants avec la bibliothèque livrée et comparer sa boîte à la maquette et aux autres surfaces — mêmes dimensions ; chaque chiffre qui a bougé est re-mesuré et attribué à cette cause.

### Implémentation US2

- [ ] T013 [US2] Ajouter la règle de boîte dans `core/emit-react.ts` (fonction `generateCss`) : pour chaque part racine de premier niveau `r`, `.r, .r *, .r *::before, .r *::after { box-sizing: border-box }`, émise en tête de fichier — calque exact de `core/emit-html.ts:131-143` adapté aux classes de module (D1). Aucun changement de schéma, aucun changement de contrat. `core/` reste browser-pure (zéro `node:*`).
- [ ] T014 [US2] Régénérer les surfaces : `npm run build` — les 34 `src/components/**/*.module.css` changent d'octets (la règle s'ajoute partout) ; seuls 9 changeront de rendu, ce que T018 prouve au lieu de l'affirmer.
- [ ] T015 [US2] Re-pin n°1 (reçu d'octets des contrats) : `node scripts/update-golden.mjs` → `evals/golden.json`, revu diff en main (un reçu qui dérive se re-épingle en revue, jamais en réflexe).
- [ ] T016 [P] [US2] Re-pin n°2 (reçu du moteur du plugin) : `node scripts/build-plugin-zip.mjs --update-engine-receipt` → `figma-sync/plugin/engine.receipt.json`, puis `npm run plugin:check` vert. *(Correction de quickstart.md §2 : `npm run plugin:build` n'existe pas dans `package.json` — c'est cette commande-ci.)*
- [ ] T017 [P] [US2] Re-pin n°3 (vitrine Polaris) : `npx tsx examples/polaris/generate.ts` → `examples/polaris/figma/*.figma.js` + surfaces générées, vérifié par `npx tsx examples/polaris/generate.ts --check` (l'eval `polaris-showcase-reproducible` lance exactement ce contrôle).
- [ ] T018 [US2] Re-mesurer et attribuer : `npm run extract:figma:visual`, comparer aux `avant` rows de T005, écrire le reçu `specs/015-geometrie-gouvernee/proofs/recus/box-model-unification.md` — les 9 contrats du rayon (accordion-row, carte, coordonnees, faq, footer, google-reviews, review-card, sav, textarea) portent la cause `box-model-unification` ; **un chiffre qui bouge hors de ces 9 suspend la publication jusqu'à attribution** (FR-011, edge case spec).
- [ ] T019 [US2] Prouver SC-003 côté consommateur : pour chacun des 9, comparer la boîte rendue par la bibliothèque livrée à celle de la maquette et des trois autres surfaces (html, react-inline, canvas) ; consigner les mesures dans `specs/015-geometrie-gouvernee/proofs/recus/boites-9-surfaces.md`.
- [ ] T020 [US2] Checkpoint : sweep constitution complète verte dans le worktree — `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json` ; sortie archivée dans `specs/015-geometrie-gouvernee/proofs/sweep-us2.txt`.

**Checkpoint**: la règle décide désormais quelle boîte le nombre décrit — aucune dimension ne sera convertie deux fois.

---

## Phase 4: User Story 1 - La fin de l'angle mort (Priority: P1) 🎯 MVP

**Goal**: toute dimension géométrique des 34 contrats siège sur un axe surveillé (référence gouvernée) ou est un littéral nommé d'un canal déclaré — zéro valeur invisible, et la boucle de détection prouvée des deux côtés.

**Independent Test**: un réviseur énumère les dimensions géométriques de n'importe quel contrat et vérifie que chacune est gouvernée ou nommée ; puis il introduit une modification de géométrie en test de chaque côté de la boucle et constate que le contrôle la détecte et la signale.

### Tests US1 — écrits AVANT l'implémentation, ROUGE constaté d'abord ⚠️

- [ ] T021 [P] [US1] Écrire la fixture data-only `evals/fixtures/geometry-gate-policy-check.ts` (contrats synthétiques) couvrant le cas conforme et **chaque code de refus** de `contracts/geometry-gate.interface.md` §3 : `invisible-literal`, `unregistered-literal`, `registry-value-mismatch`, `registry-entry-orphaned`, `registry-entry-undocumented` — plus le déterminisme (deux exécutions, même JSON). ROUGE constaté avant T022.
- [ ] T022 [P] [US1] Écrire la fixture du canal dégradé (D5) dans `evals/fixtures/gradient-literal-channel.ts` : un littéral `background-image: linear-gradient(...)` rend sur les 4 surfaces (react, html, react-inline, figma-script) ; une grammaire hors borne (`radial-gradient`, `conic-gradient`) **refuse par nom**. ROUGE constaté avant T024.
- [ ] T023 [P] [US1] Écrire les 2 cas C3-detection de `evals/run.ts` (FR-005, D9) : **côté code** — dans le scratch, remplacer dans un `.module.css` généré une référence `var(--space-…)` par sa valeur brute, puis `npm run parity` doit sortir en 1 avec le sujet nommé (l'axe code lit la vraie source) ; **côté canvas** — muter une **copie** d'un dump commité (jamais le fichier client, FR-010) sur un canal géométrique déclaré par un fait, et affirmer que `compareFigmaExpectation` (`extract/figma/organism-audit/facts.ts`) rapporte la divergence localisée. Scratch en liste blanche : copier le fichier muté et ses dépendances, jamais un répertoire entier.

### Implémentation US1 — A. Le contrôle FR-001

- [ ] T024 [US1] Écrire l'évaluateur pur `extract/geometry-gate/gate.ts` (zéro I/O, patron `extract/figma/measure-gate/gate.ts`) : population = entrées `literals`/`literalsByProp` dont le canal appartient à l'ensemble fermé de `contracts/geometry-gate.interface.md` §2 ; **réutiliser `inventoryLiterals(contractsById)` de `extract/figma/organism-audit/baseline.ts`** (art antérieur 013 : pointeurs RFC 6901, ordre byte-stable) au lieu de réécrire un marcheur d'anatomie ; produire `GeometryGateResult` (data-model.md §5) avec `counts` et `refusals[]` jamais anonymes.
- [ ] T025 [US1] Écrire le CLI `extract/geometry-gate/run.ts` (fail-closed, exit 0|1|2 — 2 = `blocked`, artefact illisible, décidé par run.ts jamais par gate.ts), lecture EN DIRECT de `contracts/named-literals.registry.json` (jamais un cliché), mode `--json` + mode par défaut « Comptage (en direct, jamais figé) » ; ajouter le script `"geometry:gate": "tsx extract/geometry-gate/run.ts"` dans `package.json`.
- [ ] T026 [US1] Enregistrer le cas `geometry-gate-policy-check` dans `evals/run.ts` (famille C2/C3 selon le patron des portes existantes) — la fixture T021 passe au vert.
- [ ] T027 [US1] Publier le relevé d'ouverture géométrie T0 : `npx tsx extract/geometry-gate/run.ts --json > specs/015-geometrie-gouvernee/proofs/ouverture-geometrie.json` — le compte vif de `geometricEntries` / `invisible` fait foi (le « ~260 » du brief n'est jamais recopié).

### Implémentation US1 — B. Le canal des dégradés et le registre des littéraux nommés (FR-003)

- [ ] T028 [US1] Lift **additif** du schéma dans `packages/schema/src/contract-schema.ts` : ajouter `background-image` à `LITERAL_CHANNELS` avec une grammaire bornée **propre au canal** (`linear-gradient(...)` uniquement) ; `LITERAL_VALUE_RE` reste intact et le refus par nom subsiste pour radial/conic (Principe VI : additif, rien de repurposé).
- [ ] T029 [US1] Router le canal dans les 3 émetteurs code : `core/emit-react.ts`, `core/emit-html.ts`, `core/emit-react-inline.ts` (déclaration `background-image` telle quelle) — `core/` reste browser-pure.
- [ ] T030 [US1] Router le canal dans `core/emit-figma-script.ts` : chemin littéral → `parseCssGradient` → `GRADIENT_LINEAR`, en réutilisant le code **déjà écrit** pour la branche tokens (~`core/emit-figma-script.ts:807`), jamais une seconde implémentation.
- [ ] T031 [US1] Écrire les 2 dégradés relevés dans `contracts/hero.contract.json` — root `fills[2]` : `linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5) 100%)` ; part Titres `fills[0]` : `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 60%)` — **valeurs re-vérifiées sur le dump avant écriture** (la description datée du contrat v1.3.0 est la source, le dump est la confirmation).
- [ ] T032 [US1] Créer `contracts/named-literals.registry.json` (SSoT, forme de `contracts/named-literals.registry.schema.md`) amorcé aux 2 entrées du hero, chacune avec `contractId`, `pointer` RFC 6901, `channel`, `value` épinglée byte-à-byte, `reason`, `decidedOn: "2026-08-04"`, `receiptId: "hero-gradients-named-literal"` ; écrire le reçu `specs/015-geometrie-gouvernee/proofs/recus/hero-gradients-named-literal.md`.
- [ ] T033 [US1] Enregistrer le cas dégradé dans `evals/run.ts` — la fixture T022 passe au vert.
- [ ] T034 [US1] Bumper `docs/02-contract-spec.md` avec le canal `background-image` et sa grammaire bornée (Principe VI : une capacité de schéma se documente là où elle est revendiquée).
- [ ] T035 [US1] Re-trier la ligne hero : les deux voiles pèsent 28,07 % des pixels du master — la variation est une **réparation attribuée** `gradient-carry` (FR-012), consignée au registre avec un reçu **re-testé** dans `specs/015-geometrie-gouvernee/proofs/recus/hero-gradient-carry.md` (le résiduel attendu redevient le plan photo / le plancher de rastérisation).

### Implémentation US1 — C. La préservation des correctifs 013 (FR-009)

- [ ] T036 [US1] Construire `specs/015-geometrie-gouvernee/fixtures/corrections-013.json` (forme data-model.md §4) : inventaire des valeurs posées à la main en 013 — sources `specs/013-*/proofs/deferred/work.json` (DW-004 les nomme : `padding-left`/`padding-right` 89px, `padding-top` 128px, gaps 48/32/16 dans `ds.footer`, `ds.faq`, `ds.reassurances`) recoupées avec `git log` sur `contracts/` dans la fenêtre 013 ; le champ `provenance` **déclare que 013 n'a pas produit `proofs/closure/`** et que l'inventaire est reconstruit (honnêteté §V).
- [ ] T037 [US1] Reproduire l'écrasement AU ROUGE d'abord (exigence explicite de la spec) : cas d'eval où, dans le scratch, une « ré-extraction » remplace un contrat corrigé par sa proposition sans le correctif — **sans contrôle, rien ne le voit** ; archiver l'état rouge dans `specs/015-geometrie-gouvernee/proofs/recus/preservation-013-rouge.txt`. Deuxième scénario du même cas : la classe voisine documentée (une déclaration en retard qui efface `reactProps` en silence).
- [ ] T038 [US1] Écrire le contrôle pur de préservation `extract/geometry-gate/preservation.ts` (placement calqué sur D7 : pur, sans I/O ; appelé par le CLI et par l'eval) — il résout la valeur EFFECTIVE actuelle de chaque entrée (littéral OU référence résolue via l'inventaire de tokens) et refuse par nom toute entrée dont la valeur résolue a changé : `preserved` et `converted-preserved` passent, `clobbered` refuse. Le même scénario que T037 refuse désormais.

- [ ] T038b [US1] **Re-tester les 5 pointeurs de 013 avant d'y bâtir un lot** (« une décision du dépôt n'est pas un fait »). `specs/013-…/proofs/deferred/work.json` déclare : DW-001 `ds.piqueray-logo /anatomy/root/literals/width` · DW-002 `ds.carte /anatomy/root/literals/min-width` · DW-003 `ds.section-header /anatomy/root/literals/height` · DW-004 `ds.footer /anatomy/root/literals` · DW-005 `ds.footer /anatomy/root/literals/width`. **Relevé du 2026-08-04 : DW-002 et DW-003 NE RÉSOLVENT PAS** — la racine de `ds.carte` porte `width 364px`, `gap 24px`, `padding-bottom 24px` (aucun `min-width`) ; celle de `ds.section-header` porte `gap 8px` seul (le « 50px » du fichier est un `line-height`, canal hors population). Les trois autres résolvent. Pour chaque pointeur mort : soit re-localiser le littéral porteur, soit constater qu'**aucun littéral ne porte le fait** (défaut de source pur — ce que dit déjà la note de `causes.json` pour DW-003 : instance `2104:2907` figée dans le master faq). Consigner dans `specs/015-geometrie-gouvernee/proofs/recus/pointeurs-013-retestes.md`. **Le résultat conditionne T042 et T043.**

### Implémentation US1 — D. Les conversions (FR-001, FR-002, FR-012)

> Prérequis absolu : Phase 3 (US2) terminée — FR-004. Toute conversion est **pure** : valeur résolue identique, zéro changement de rendu ; une conversion qui change le rendu n'est pas une conversion, c'est une réparation non attribuée.

- [ ] T039 [US1] Minter les références manquantes from-dump dans `tokens/primitives.tokens.json` : espacements → échelle générique `space.N` (idiome 012 ; la plupart existent : 0,4,8,10,12,16,24,32,48,64,89,96,128,392,597) ; tailles intrinsèques → `size.<composant>.<usage|axe>` (idiome demo-51 ; précédent vivant `size.button.icon-only`), **obligatoirement sémantiques dès qu'une taille varie par variante**. Chaque feuille : `$type: "dimension"`, `$value` = valeur observée exacte (**jamais arrondie**), `$description` citant la provenance (dump/relevé, node id, date) — un mint sans provenance est refusé en revue.
- [ ] T040 [P] [US1] Lot A — convertir les organismes lourds : `contracts/google-reviews.contract.json`, `contracts/sav.contract.json`, `contracts/review-card.contract.json` (littéral → référence, valeur résolue identique ; pointeurs `/literals/` → `/tokens/`).
- [ ] T041 [P] [US1] Lot B — `contracts/coordonnees.contract.json`, `contracts/accordion-row.contract.json`, `contracts/hero.contract.json`, `contracts/footer.contract.json` — **exception** : les entrées du footer nommées par DW-004 sont traitées en Phase 6 (T057), où la valeur ET le `contractPointer` du fait se déplacent ensemble ; ici, tout le reste.
- [ ] T042 [P] [US1] Lot C — `contracts/carte.contract.json`, `member-picture`, `avantage`, `devis`, `faq`, `product-card`, `reassurances`, `tab`. **Frontière 016 (D14) — conditionnée par T038b** : le pointeur `ds.carte /anatomy/root/literals/min-width` (DW-002, `figma-source`) **ne résout pas** au relevé du 2026-08-04. Si T038b re-localise un littéral porteur, il est rendu **visible** par une référence from-dump à la valeur observée, **sans que le nombre soit corrigé** — l'arbitrage de design appartient au chantier canvas. Si aucun littéral ne le porte, il n'y a rien à rendre visible ici : le fait reste `figma-source` et part entier à 016 — la clause est retirée avec sa raison, jamais contournée.
- [ ] T043 [P] [US1] Lot D — `contracts/member-card.contract.json`, `presentation`, `textarea`, `checkbox`, `field`, `footer-column`, `input`, `nav-item`, `realisation`, `select`, `section-header`. **Frontière 016 — conditionnée par T038b** : le pointeur `ds.section-header /anatomy/root/literals/height` (50px, DW-003, `figma-source`) **ne résout pas** au relevé du 2026-08-04, et la note de `causes.json` décrit un fait de master (instance SectionHeader `2104:2907` figée dans le master faq), pas un littéral de contrat. Même règle que T042 : rendu visible s'il existe un littéral porteur, sinon la clause est retirée et le fait part entier à 016.
- [ ] T044 [US1] Produire la trace SC-007 (« retrouver valeur d'origine, provenance et cause en moins de 5 minutes ») : commiter le diff typé de `diffBaseline(...)` — `literalToTokenConversions` localise chaque conversion `{contractId, pointer, valeur, token}` — dans `specs/015-geometrie-gouvernee/proofs/conversions.json`. Le reçu de campagne est ce diff typé, pas une prose.
- [ ] T045 [US1] Vérifier la décroissance : `npm run geometry:gate` — `invisible` décroît vers 0, chaque refus résiduel est nommé et rattaché à un lot restant ; publier le compte vif intermédiaire.
- [ ] T045b [US1] **Lot de re-pins de la Phase 4** — obligatoire AVANT tout `npm run eval` de cette phase : le schéma, 4 émetteurs, ~28 contrats et les tokens ont bougé, donc les trois reçus dérivent. `node scripts/update-golden.mjs` → `evals/golden.json` ; `node scripts/build-plugin-zip.mjs --update-engine-receipt` puis `npm run plugin:check` ; `npx tsx examples/polaris/generate.ts` puis `npx tsx examples/polaris/generate.ts --check`. Les trois diffs revus en main. Sans ce lot, T046 et T047 partent rouges.
- [ ] T046 [US1] Prouver FR-012 : `npm run build && npm run parity && npm run eval` verts, et les conversions pures **ne produisent aucune variation** au registre avant/après (cause `pure-conversion` = aucune variation attendue). Toute variation constatée est requalifiée en réparation attribuée ou suspend la publication.
- [ ] T047 [US1] Checkpoint : sweep constitution complète verte dans le worktree (même commande qu'en T020) + `npm run geometry:gate` ; sortie archivée dans `specs/015-geometrie-gouvernee/proofs/sweep-us1.txt`.

**Checkpoint**: l'angle mort est fermé et prouvé fermé — la boucle détecte des deux côtés (T023), les correctifs 013 sont surveillés (T038), zéro valeur invisible hors réparations restantes.

---

## Phase 5: User Story 4 - Un composant, deux tailles, zéro nombre figé (Priority: P3)

**Goal**: le logo partagé par l'en-tête et le pied de page porte ses tailles de façon gouvernée ; chaque usage déclare la sienne comme il déclare déjà sa couleur.

**Independent Test**: le logo n'embarque plus de dimension figée unique, l'en-tête et le pied de page déclarent chacun leur taille, et les deux rendus sont fidèles à la maquette.

> Placée avant US3 : DW-001 (le logo) est l'un des trois faits que la ligne `footer` agrège (T009) — le compte `contract-geometry` de US3 ne peut atteindre 0 sans lui.

- [ ] T048 [US4] **Vérification préalable from-dump, avant toute décision** (D4) : relever dans les dumps `header` et `footer` les deux tailles d'usage réelles du logo et vérifier qu'elles sont bien des homothéties de 180×34 ; consigner le relevé dans `specs/015-geometrie-gouvernee/proofs/recus/logo-tailles-relevees.md`. **Si l'usage n'est pas proportionnel, la décision D4 est re-posée avec le relevé en main** — rien n'est supposé.
- [ ] T049 [P] [US4] Écrire la fixture « vecteurs proportionnels » dans `evals/fixtures/logo-vector-scaling.ts` AU ROUGE d'abord : pour chaque valeur de `taille`, le CSS généré du logo rend ses parts `vectorAsset` en pourcentages (géométrie ET positions), pas en px figés.
- [ ] T050 [US4] Lift moteur dans `core/emit-react.ts` : quand le root d'un contrat porte une taille pilotée par référence interpolée, les parts `vectorAsset` émettent leur géométrie et leurs positions en **pourcentages du root intrinsèque**, calculés à la compilation (ex. 25.96/180 → `14.4238…%` — arithmétique déterministe, octet-stable, zéro token supplémentaire). Le root généré est déjà `position: relative`. La fixture T049 passe au vert.
- [ ] T051 [US4] Minter `size.logo.<valeur>.width` et `size.logo.<valeur>.height` from-dump dans `tokens/primitives.tokens.json` (aucun token logo n'existe), `$description` citant le relevé de T048.
- [ ] T052 [US4] Modifier `contracts/piqueray-logo.contract.json` : ajouter la prop enum `taille` (valeurs nommées d'après les usages relevés, jamais inventées), remplacer `literals: {width: "180px", height: "34px"}` par `tokens: {width: "{size.logo.{taille}.width}", height: "{size.logo.{taille}.height}"}` (idiome exact de `docs/reference/demo-archive/avatar.contract.json:63-64`), binding Figma **`kind: "NONE"`** avec note pointant 016 (le master canvas n'a pas de variante Taille et 015 est en lecture seule — déclarer un VARIANT inexistant ferait mentir le contrat) ; version 0.1.0 → **0.2.0** (ajout de prop = minor).
- [ ] T053 [US4] Faire déclarer la taille par chaque usage : `contracts/header.contract.json` et `contracts/footer.contract.json` passent `taille` dans `component.props` exactement comme ils passent déjà `couleur` (semver minor chacun).
- [ ] T054 [US4] Enregistrer le cas vecteurs dans `evals/run.ts` ; régénérer (`npm run build`) et refaire le lot de re-pins ×3 (mêmes commandes qu'en T045b) — **lot de la Phase 5**, revu en diff.
- [ ] T055 [US4] Prouver les deux rendus : dimensions rendues conformes à la maquette côté en-tête ET côté pied de page ; écrire le reçu de réparation `named-repair:DW-001` dans **`specs/014-mesure-juste-triage/proofs/recus/named-repair-DW-001.md`** (le corpus que C4 lit — § Conventions, « Où vont les reçus »).

**Checkpoint**: un composant partagé porte deux tailles gouvernées, sans nombre figé ni capacité nouvelle inventée.

---

## Phase 6: User Story 3 - Les défauts mesurés sont réparés (Priority: P3)

**Goal**: les défauts que 014 a prouvés sont réparés — l'en-tête « Avec CTA » (8,78 %) et les trois sections divergentes (texte-seo 1,84 %, footer 1,04 %, coordonnees 0,52 %) — et le compte « géométrie du contrat » de la porte atteint 0.

**Independent Test**: relancer la mesure — « Avec CTA » repasse sous le seuil, les trois sections redeviennent conformes ou portent une attribution nouvelle prouvée, et le compte de la porte est à 0.

> Le devis vient du registre, jamais re-deviné. Aucun seuil, aucune région, aucun critère de preuve n'est assoupli (FR-010).

- [ ] T056 [US3] Réparer `section-header :: Avec CTA` (8,78 % — largeur rendue 2174 px contre 3093 attendus ; la règle TRIAGE dit « content/spacing gap in the contract's own geometry for this disposition ») : relever la géométrie juste **depuis le dump du master Avec-CTA** (from-dump) et la porter en références gouvernées dans `contracts/section-header.contract.json` ; re-mesurer → la ligne repasse sous le seuil de réussite existant.
- [ ] T057 [US3] Traiter DW-004 sur `contracts/footer.contract.json` : déplacer la valeur **ET** le `contractPointer` du fait (`/literals/` → `/tokens/`) **ensemble** — `{space.89}`, `{space.128}`, `{space.48}`, `{space.32}`, `{space.16}` existent déjà (mintés par 012), aucun mint requis.
- [ ] T058 [US3] Traiter DW-005 sur `contracts/footer.contract.json` : minter from-dump les largeurs de cadre relevées (1550 / 1385) dans `tokens/primitives.tokens.json` et les référencer — la doctrine mint est écrite dans `space.$description`, la valeur n'est jamais écrite à la main.
- [ ] T059 [P] [US3] Réparer `texte-seo` (1,84 %) dans `contracts/texte-seo.contract.json` depuis son relevé : exécuter les travaux de géométrie nommés au registre, puis re-mesure → conforme OU nouvelle attribution prouvée avec reçu re-testé, jamais un résiduel silencieux.
- [ ] T060 [P] [US3] Réparer `coordonnees` (0,52 %) dans `contracts/coordonnees.contract.json` : même discipline que T059.
- [ ] T060b [US3] **Lot de re-pins de la Phase 6** — les réparations T056–T060 ont édité contrats et tokens, donc les trois reçus dérivent à nouveau : mêmes trois commandes qu'en T045b, mêmes diffs revus en main. Sans ce lot, T070 part rouge.
- [ ] T061 [US3] Re-classer les règles de triage : dans `extract/figma/visual-parity/triage.ts`, retirer ou re-classer les règles des lignes réparées selon le résultat mesuré (patron `RETIRED_RULES` de 014) — une règle qui ne décrit plus rien se retire, elle ne s'accumule pas.
- [ ] T062 [US3] Clore les faits au registre : dans `specs/014-mesure-juste-triage/proofs/registre/causes.json`, `entries[DW-001].resolvedBy = "015"`, idem DW-004 et DW-005 — **chacun avec son reçu de réparation re-testé** (C4 l'exige, un reçu recopié ne compte pas).
- [ ] T063 [US3] Lire le compte en direct : `npm run measure:gate` **sur la mesure de 015** (`--apres specs/015-geometrie-gouvernee/proofs/registre/apres.json`, T003b — sans quoi la porte relit les chiffres figés de 014 et ne peut pas descendre sous 3) → `contract-geometry: 0`, verdict `pass`, exit 0 (SC-005). Si le compte remonte avant de descendre (une réparation a révélé un fait nouveau), la découverte est attribuée `discovered:<fait>` puis traitée ou consignée — **jamais absorbée en silence** (edge case spec).

**Checkpoint**: les quatre lignes mesurées sont réparées ou attribuées, et la porte de mesure ne réclame plus aucun travail de géométrie.

---

## Phase 7: Polish & clôture (transversal)

**Purpose**: publier les chiffres relus en direct, attribuer chaque variation, et ne revendiquer qu'après les fixtures

- [ ] T064 Re-mesure finale et registre après : `npm run extract:figma:visual` (même navigateur que T005 — le refus `browser-changed-between-phases` le vérifie), puis `npx tsx extract/figma/organism-audit/tools/build-registre.mts --phase apres --out-dir specs/015-geometrie-gouvernee/proofs/registre`, puis `--render` pour `REGISTRE.md`.
- [ ] T065 Attribuer intégralement : toute variation entre `avant.json` et `apres.json` porte exactement une cause du vocabulaire de data-model.md §8 (`box-model-unification` sur les 9 seuls, `gradient-carry` sur le hero, `named-repair:<id>`, `discovered:<fait>` ; `pure-conversion` = aucune variation) avec son reçu. **Une variation sans cause suspend la publication** (FR-011) ; hors périmètre attribué, 0 chiffre publié ne varie (SC-006).
- [ ] T066 Re-piner les instruments visuels avec attribution : `extract/figma/visual-parity/subjects.ts` et `extract/figma/visual-parity/baseline.json` (+ `REPORT.md` régénéré) — chaque re-pin porte sa cause, jamais un re-pin muet.
- [ ] T067 Vérifier la préservation 013 à la clôture : exécuter le contrôle de T038 sur `specs/015-geometrie-gouvernee/fixtures/corrections-013.json` — 100 % des entrées `preserved` ou `converted-preserved`, 0 `clobbered` (SC-006).
- [ ] T068 Lire SC-001 en direct : `npm run geometry:gate` → `counts.invisible === 0`, verdict `pass` ; archiver la sortie dans `specs/015-geometrie-gouvernee/proofs/cloture-geometrie.json` (ouverture T027 vs clôture, côte à côte).
- [ ] T069 Lire SC-005 / FR-013 en direct : `npm run measure:gate -- --apres specs/015-geometrie-gouvernee/proofs/registre/apres.json` (T003b — le `--` est nécessaire pour que npm transmette l'argument) → `contract-geometry: 0`, PASS exit 0 ; archiver dans `specs/015-geometrie-gouvernee/proofs/cloture-measure.json`. Les deux portes sont relues, jamais recopiées.
- [ ] T070 Sweep constitution complète et finale DANS le worktree : `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json` — plus `npm run geometry:gate` et `npm run measure:gate`. Le `N/N` d'eval imprimé est le seul compte autoritaire.
- [ ] T071 Revendiquer APRÈS les preuves (Claims Rule, ordre inverse interdit) : ajouter dans `README.md` / `docs/` les phrases de capacité — la porte géométrie, les littéraux nommés surveillés, le modèle de boîte unifié, le canal `background-image` — chacune pointant sa fixture et son eval. Aucune phrase avant que son eval soit verte.
- [ ] T072 Écrire la clôture : `specs/015-geometrie-gouvernee/RAPPORT-CLOTURE.md` (chiffres vifs, causes, limites nommées restantes → 016/017 et la tinyspec `select-option-emit`), mettre à jour `MILESTONES.md` (compte daté) et `docs/handoff/10-history.md` si le journal est rattrapé, puis `CLAUDE.md` § Recent Changes.

---

## Dependencies & Execution Order

### Dépendances de phase

- **Phase 1 (Setup)** : aucune dépendance.
- **Phase 2 (Foundational)** : dépend de Phase 1 — **BLOQUE toutes les stories**. T005 (l'« avant ») est irréversible : après T013, l'état initial n'est plus mesurable.
- **Phase 3 (US2, P2)** : dépend de Phase 2 — **BLOQUE US1, US3 et US4** par FR-004 (la boîte avant toute conversion).
- **Phase 4 (US1, P1)** : dépend de Phase 3. C'est le MVP livrable.
- **Phase 5 (US4, P3)** : dépend de Phase 3 (conversion ⇒ boîte d'abord). Indépendante de US1 sur les fichiers, mais partage le lot de re-pins.
- **Phase 6 (US3, P3)** : dépend de Phase 5 (DW-001 est l'un des 3 faits agrégés) et de T041 (le footer hors DW-004 est converti en US1, DW-004/005 le sont ici).
- **Phase 7 (Polish)** : dépend de tout ce qui précède.

### Dépendances entre stories

- **US2 (P2)** → prérequis dur de US1, US3, US4 (FR-004).
- **US1 (P1)** → autonome une fois US2 faite ; le footer partage un fichier avec US3 (frontière explicite dans T041/T057).
- **US4 (P3)** → autonome après US2 ; alimente le compte de US3 via DW-001.
- **US3 (P3)** → dernier maillon : son critère (compte à 0) agrège le travail des trois autres.

### À l'intérieur d'une story

- Les fixtures d'abord, ROUGE constaté (T004, T021, T022, T023, T037, T049) — puis l'implémentation.
- Schéma → émetteurs → contrats → registre (jamais l'inverse : un contrat qui référence un canal non lifté refuse).
- Mints avant conversions (T039 avant T040–T043).
- **T038b avant T042/T043** : deux des cinq pointeurs de 013 ne résolvent plus, et la clause « frontière 016 » de ces deux lots en dépend.
- Re-génération → re-pins ×3 → re-mesure → attribution (jamais de re-pin sans revue de diff). Un lot par phase qui touche émetteurs, contrats ou tokens : T015–T017, T045b, T054, T060b.
- **T003b avant T063 et T069** : sans le paramètre de mesure, la porte relit l'`apres.json` figé de 014 et SC-005 est inatteignable.

### Opportunités de parallélisation

- Phase 2 : T003 ∥ T003b ∥ T004 (trois fichiers distincts).
- Phase 3 : T016 ∥ T017 (deux reçus distincts, deux commandes).
- Phase 4 : T021 ∥ T022 ∥ T023 (trois fixtures, trois fichiers) ; puis **T040 ∥ T041 ∥ T042 ∥ T043** (lots de contrats disjoints — l'esprit de §XI appliqué au dépôt : partition par contrats, vérification globale propriété de l'orchestrateur).
- Phase 5 : T049 ∥ (T048 si le relevé est déjà en main).
- Phase 6 : T059 ∥ T060 (fichiers disjoints) ; T057 et T058 touchent le même contrat → séquentiels.

---

## Parallel Example: les conversions de US1

```bash
# Quatre lots de contrats disjoints, lancés ensemble (aucun fichier partagé) :
Tâche T040 : "Lot A — google-reviews, sav, review-card"
Tâche T041 : "Lot B — coordonnees, accordion-row, hero, footer (hors DW-004)"
Tâche T042 : "Lot C — carte (DW-002 visible, non réparé), member-picture, avantage, devis, faq, product-card, reassurances, tab"
Tâche T043 : "Lot D — member-card, presentation, textarea, checkbox, field, footer-column, input, nav-item, realisation, select, section-header (DW-003 visible, non réparé)"

# Puis UNE vérification globale, jamais par lot :
npm run build && npm run parity && npm run eval && npm run geometry:gate
```

---

## Implementation Strategy

### MVP d'abord (US1, mais US2 en prérequis)

1. Phase 1 (Setup) → Phase 2 (Foundational : l'« avant » capturé, le comptage v2 vert)
2. Phase 3 (US2) — **obligatoire avant toute conversion** (FR-004)
3. Phase 4 (US1) — **le MVP** : l'angle mort fermé et prouvé fermé
4. **STOP et VALIDER** : `npm run geometry:gate` publie son compte ; les 2 cas C3 démontrent la détection des deux côtés

### Livraison incrémentale

1. Setup + Foundational → l'instrument dit la vérité, l'« avant » est daté
2. + US2 → les boîtes sont justes sur les 4 surfaces (démo possible : un des 9 composants chez un consommateur)
3. + US1 → zéro valeur invisible, boucle prouvée (MVP)
4. + US4 → le logo à deux tailles gouvernées
5. + US3 → les défauts mesurés réparés, la porte à 0
6. + Polish → chiffres publiés, attribués, revendiqués après preuve

### Stratégie parallèle (plusieurs exécutants)

Après Phase 3, US1 et US4 peuvent avancer de front (fichiers disjoints hors les lots de re-pins, qui restent **un lot par phase, propriété de l'orchestrateur**). US3 attend US4. La partition se fait par **contrats disjoints** ; la vérification (sweep + registre avant/après) reste globale et n'appartient jamais à un exécutant isolé.

---

## Notes

- `[P]` = fichiers différents, aucune dépendance — jamais deux tâches sur le même contrat.
- Les fixtures qui doivent passer au ROUGE d'abord : T004, T021, T022, T023, T037, T049. Un vert du premier coup est un signal à investiguer, pas une bonne nouvelle.
- Re-pin ≠ contournement : `evals/golden.json`, `figma-sync/plugin/engine.receipt.json` et `examples/polaris/figma/*.figma.js` dérivent à chaque édition d'émetteur, de contrat ou de tokens, et se re-épinglent **en revue**. Il y a donc **quatre lots, un par phase qui touche ces sources** — T015/T016/T017 (Phase 3), T045b (Phase 4), T054 (Phase 5), T060b (Phase 6) — jamais un seul pour toute la feature.
- Aucun chiffre en dur dans la prose de clôture : les comptes se lisent dans les sorties archivées sous `proofs/`.
- Commit après chaque tâche ou groupe logique ; s'arrêter à n'importe quel checkpoint pour valider une story seule.
