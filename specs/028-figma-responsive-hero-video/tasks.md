# Tasks: Finaliser HeroVideo responsive dans Figma

**Input**: Design documents from `/specs/028-figma-responsive-hero-video/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Les fixtures négatives, evals, typechecks et preuves de second passage no-op sont obligatoires, car la feature étend le runner avant toute mutation Figma live.

**Organization**: Les tâches sont groupées par user story. Le CTA, le Button partagé et tous les enfants restent en lecture seule pendant toute la feature ; leur état ne bloque pas les décisions réalisables sur le parent HeroVideo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut être exécutée en parallèle avec les autres tâches `[P]` du même bloc, car elle touche des fichiers distincts.
- **[US1]**, **[US2]**, **[US3]**: User story couverte par la tâche.
- Chaque tâche nomme le fichier ou dossier où sa preuve doit être enregistrée.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Préparer un run neuf et traçable dans le worktree Superset actif, sans réutiliser ni modifier `run-002`.

- [X] T001 Vérifier `pwd`, la branche, le statut Git et la liste des worktrees, puis enregistrer le pin du worktree actif dans `specs/028-figma-responsive-hero-video/inventory/worktree-pin.json`
- [X] T002 Installer les dépendances du dépôt et Chromium conformément aux gates du projet, puis consigner versions et commandes dans `specs/028-figma-responsive-hero-video/inventory/environment-receipt.md`
- [X] T003 Lire les autorités documentaires dans l’ordre constitution → workflow → spec/plan/contracts 028 → historique 027, puis consigner le reçu docs-first dans `specs/028-figma-responsive-hero-video/inventory/docs-first-receipt.md`
- [X] T004 Créer la campagne fraîche `run-003` avec ses racines audit, captures, receipts et verify, sans copier de preuve d’exécution de `run-002`, dans `specs/component-repairs/hero-video/run-003/campaign.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fixer les frontières d’écriture, les preuves attendues et les gates avant le design ou l’extension du runner.

**⚠️ CRITICAL**: Aucun travail sur le master HeroVideo ne commence avant que cette phase soit terminée.

- [X] T005 Mapper FR-032/FR-033 aux capacités, refus, fixtures et evals attendus dans `specs/028-figma-responsive-hero-video/inventory/runner-capability-plan.md`
- [X] T006 Déclarer dans `specs/component-repairs/hero-video/run-003/campaign.json` le master HeroVideo, l’usage Home et le Header en lecture seule, le CTA et tous les enfants comme protégés, et interdire toute écriture Page ou enfant
- [X] T007 [P] Définir les champs obligatoires, l’ordre et les critères d’acceptation des gates H1 à H4 dans `specs/028-figma-responsive-hero-video/decisions/README.md`
- [X] T008 Valider la forme initiale de `specs/component-repairs/hero-video/run-003/campaign.json` sans mutation live et enregistrer les erreurs ou refus attendus dans `specs/component-repairs/hero-video/run-003/campaign-validation.md`

**Checkpoint**: Le run est neuf, les écritures autorisées sont bornées au parent HeroVideo et la future extension du runner possède un plan de test explicite.

---

## Phase 3: User Story 1 - Concevoir le vrai HeroVideo responsive dans Figma (Priority: P1) 🎯 MVP

**Goal**: Obtenir dans des frames Figma de travail une proposition Compact, Desktop et Wide réellement évaluée, liée aux primitives existantes et explicitement validée par l’owner, sans toucher au master.

**Independent Test**: L’owner peut comparer les trois compositions avec contenus normal, long et faible hauteur, retrouver les bindings proposés et accepter H2 avant toute mutation du master.

### Implementation for User Story 1

- [X] T009 [US1] Exécuter un audit Figma frais et read-only du master, du Container, de l’usage Home, du Header, du Button, des médias, textes, propriétés, variables et overrides dans `specs/component-repairs/hero-video/run-003/audit.json`
- [X] T010 [P] [US1] Comparer l’audit frais aux preuves historiques 027 en séparant baseline, dérive et défaut CTA préexistant non bloquant dans `specs/028-figma-responsive-hero-video/inventory/H1-baseline-delta.md`
- [X] T011 [P] [US1] Inventorier les primitives existantes utilisables pour gaps, paddings et dimensions, sans créer de variable, dans `specs/028-figma-responsive-hero-video/inventory/H1-primitives.json`
- [X] T012 [P] [US1] Produire les exports read-only utiles à H1 pour le master, l’usage Home et le contexte Header, puis relier leurs identités dans `specs/028-figma-responsive-hero-video/proofs/H1-surface-manifest.json`
- [X] T013 [US1] Présenter le delta H1 à l’owner et enregistrer son acceptation, refus ou réorientation explicite avant les frames de travail dans `specs/028-figma-responsive-hero-video/decisions/H1-audit.json`
- [X] T014 [US1] Après H1 accepté, créer hors du master les quatre témoins Figma Compact 390, Tablet 834 utilisant Compact, Desktop 1200 et Wide 1728, puis enregistrer leurs node IDs et présentations explicites dans `specs/028-figma-responsive-hero-video/inventory/H2-work-frames.md`
- [X] T015 [US1] Éprouver sur les quatre témoins les contenus par défaut, titre long et CTA long, ajouter les contrôles 320, 1440 et paysage mobile court, puis consigner chaque couple largeur/fixture dans `specs/028-figma-responsive-hero-video/inventory/H2-fixtures.md`
- [X] T016 [P] [US1] Relier chaque gap, padding et dimension proposés à une primitive existante et enregistrer propriété, variable ID et composition dans `specs/028-figma-responsive-hero-video/inventory/H2-bindings.json`
- [X] T017 [P] [US1] Limiter tout override typographique aux nouvelles compositions approuvables, préserver rôle/famille/poids/contenu et inventorier la dette `pending-responsive-text-style` dans `specs/028-figma-responsive-hero-video/inventory/H2-typography.json`
- [X] T018 [US1] Capturer les options Figma avec leurs limites, recouvrements média et comparaisons Wide, puis les relier aux décisions candidates dans `specs/028-figma-responsive-hero-video/proofs/H2-option-manifest.json`
- [X] T019 [US1] Présenter à l’owner la topologie, les compositions, primitives, overrides typographiques et limites exactes, puis enregistrer H2 explicitement dans `specs/028-figma-responsive-hero-video/decisions/H2-design.json`
- [X] T020 [US1] Après H2, conserver uniquement les frames acceptées et nettoyer ou archiver les options rejetées, avec état final et node IDs dans `specs/028-figma-responsive-hero-video/inventory/H2-work-frames.md`

**Checkpoint**: La proposition responsive existe et est approuvée dans Figma, mais le master n’a pas encore été modifié.

---

## Phase 4: User Story 2 - Installer les variantes sans casser l’existant (Priority: P1)

**Goal**: Étendre génériquement le runner dans 028, prouver cette capacité par tests, puis installer les variantes Compact, Desktop et Wide en conservant l’identité historique, l’usage Home et tous les enfants.

**Independent Test**: Une première application ne réalise que les créations/modifications déclarées sur le parent ; les contrôles de composition passent ; une seconde application produit zéro création, zéro modification, zéro Page write et aucun changement de fait protégé.

### Tests for User Story 2 ⚠️

> Écrire et observer l’échec de ces fixtures avant d’implémenter la nouvelle capacité.

- [X] T021 [P] [US2] Ajouter une fixture rouge couvrant component set, créations Compact/Desktop déclarées, membre Wide historique et reporting honnête des créations dans `evals/fixtures/figma-responsive-component-set-check.ts`
- [X] T022 [P] [US2] Ajouter une fixture rouge couvrant sélection explicite Compact/Desktop/Wide et matrices 320/390/834/1200/1440/1728 plus paysage court dans `evals/fixtures/figma-responsive-presentation-scenarios-check.ts`
- [X] T023 [P] [US2] Ajouter une fixture rouge couvrant bindings de primitives, binding détaché refusé et overrides typographiques locaux allowlistés dans `evals/fixtures/figma-responsive-bindings-and-typography-check.ts`
- [X] T024 [P] [US2] Ajouter une fixture rouge refusant création cachée, Page write, mutation/reconfiguration d’enfant partagé et second passage non no-op dans `evals/fixtures/figma-responsive-write-boundary-idempotence-check.ts`
- [X] T025 [US2] Enregistrer les quatre nouvelles fixtures avec des IDs stables et des messages de diagnostic explicites dans `evals/run.ts`

### Runner implementation for User Story 2

- [X] T026 [US2] Étendre les types génériques pour topologie de component set, membres créés/préservés, scénarios, bindings, overrides typographiques et créations attendues dans `extract/figma/projection-repair/types.ts`
- [X] T027 [US2] Étendre la validation de campagne pour exiger allowlists, expected creates, état Wide préservé, sélection de composition et interdictions Page/enfant dans `extract/figma/projection-repair/campaign.ts`
- [X] T028 [US2] Étendre la préparation dry-run/apply pour planifier honnêtement créations et mutations, et refuser toute opération absente de la campagne, dans `extract/figma/projection-repair/apply.ts`
- [X] T029 [US2] Ajouter au bridge une opération générique et allowlistée qui crée Compact/Desktop, conserve le composant historique comme Wide, forme le component set, maintient les noms/rôles communs ainsi que médias/textes/propriétés, et applique uniquement bindings/overrides déclarés dans `extract/figma/projection-repair/bridge-script.ts`
- [X] T030 [US2] Faire transiter sans perte les nouveaux champs de topologie, création, scénario, binding et typographie dans l’enveloppe bridge de `scripts/component-repair-bridge.mjs`
- [X] T031 [US2] Étendre l’extraction des faits protégés aux component sets, membres, component key, propriétés, médias, textes, enfants et bindings dans `extract/figma/projection-repair/facts.ts`
- [X] T032 [US2] Étendre les captures pour sélectionner explicitement chaque composition et chaque fixture de contenu sans modifier de Page dans `extract/figma/projection-repair/capture.ts`
- [X] T033 [US2] Étendre les reçus pour distinguer created/changed/noop, lister chaque node ID créé et signaler toute création ou mutation non déclarée dans `extract/figma/projection-repair/apply-receipt.ts`
- [X] T034 [US2] Étendre audit et rapport pour exposer topologie, sélection de composition, bindings effectifs, overrides typographiques locaux et violations de frontières dans `extract/figma/projection-repair/audit.ts` et `extract/figma/projection-repair/report.ts`
- [X] T035 [US2] Étendre la vérification pour contrôler structure du set, membre Wide, noms/rôles communs, médias/textes/propriétés identiques dans les trois compositions, matrice responsive, zéro Page/enfant write et idempotence stricte dans `extract/figma/projection-repair/verify.ts`
- [X] T036 [US2] Documenter la capacité responsive générique, ses allowlists, refus, receipts et séquence de double passage dans `docs/internal/component-repair-workflow.md`
- [X] T037 [US2] Exécuter les quatre nouvelles evals jusqu’au vert et consigner commandes, IDs et résultats dans `specs/028-figma-responsive-hero-video/proofs/runner-targeted-gates.md`
- [X] T038 [US2] Exécuter l’intégralité des evals et les deux typechecks sans régression, puis consigner les résultats dans `specs/028-figma-responsive-hero-video/proofs/runner-full-gates.md`

### Figma application for User Story 2

- [X] T039 [US2] Exécuter un premier mechanism spike sur une source jetable avec la capacité générique, en prouvant créations déclarées, node id/key Wide, lien et overrides d’une instance témoin Home, médias, propriétés, scénarios, bindings, typographie bornée et refus, dans `specs/028-figma-responsive-hero-video/proofs/mechanism-spike-first.json`
- [X] T040 [US2] Rejouer exactement le mechanism spike et exiger zéro création/modification avant de qualifier la capacité, dans `specs/028-figma-responsive-hero-video/proofs/mechanism-spike-second-noop.json`
- [X] T041 [US2] Reprendre les décisions H2 dans la campagne fraîche, repinner la source et déclarer topologie, composants créés, bindings, typographie, scénarios et faits protégés dans `specs/component-repairs/hero-video/run-003/campaign.json`
- [X] T042 [US2] Exécuter snapshot-source, preflight, captures avant vérifiées et dry-run sans écriture, puis normaliser les artefacts dans `specs/component-repairs/hero-video/run-003/receipts/`
- [X] T043 [US2] Présenter à l’owner le plan exact de mutation, le diff dry-run, les créations attendues et les preuves avant, puis enregistrer H3 explicitement dans `specs/028-figma-responsive-hero-video/decisions/H3-mutation.json`
- [X] T044 [US2] Après H3 accepté, exécuter une seule première application live, normaliser le reçu, capturer après et vérifier le résultat dans `specs/component-repairs/hero-video/run-003/verify/first-pass.json`
- [X] T045 [US2] Vérifier à chacune des largeurs 320, 390, 834, 1200, 1440 et 1728 les fixtures contenu normal, titre long et CTA long, plus le paysage mobile court, avec présentation explicitement sélectionnée, puis enregistrer overflow, clipping, accessibilité, recouvrement et couverture poster dans `specs/028-figma-responsive-hero-video/proofs/responsive-matrix.json`
- [X] T046 [US2] Comparer avant/après l’identité Wide, key et Container, vérifier dans les trois compositions les noms/rôles communs, poster/crop, voiles, textes et propriétés, puis confirmer instance Home, Header, CTA et enfants read-only avec zéro Page/enfant write dans `specs/component-repairs/hero-video/run-003/verify/protected-facts.json`
- [X] T047 [US2] Rejouer la même campagne live, capturer l’état d’idempotence de toutes les surfaces, puis exiger zéro création, zéro modification et zéro variation des captures ou faits protégés dans `specs/component-repairs/hero-video/run-003/verify/second-pass-noop.json`

**Correction owner après revue du canvas (2026-08-26)** : `run-004` a identifié
et corrigé l'égalisation erronée des trois membres à 1728, puis son verify a
refusé le changement implicite de valeur par défaut. `run-005` clôt la correction
en conservant `Presentation=Wide` par défaut, avec des aperçus `FIXED` 390/1200/1728,
des instances de scénario `FILL`, zéro création/Page/enfant write et un second
passage strictement no-op. Preuves :
`specs/028-figma-responsive-hero-video/proofs/phase-4-authoring-layout-correction.md`.

**Checkpoint**: Le HeroVideo est un component set responsive explicite, l’état Wide historique et tous les faits protégés sont conservés, et la seconde application est réellement no-op.

---

## Phase 5: User Story 3 - Livrer une source Figma vérifiable pour la campagne Home (Priority: P2)

**Goal**: Fournir un dossier compréhensible sans contexte oral, sans présenter les observations locales comme des fondations responsive globales.

**Independent Test**: Un mainteneur distinct retrouve chaque composition, primitive, dette typographique, limite, sujet différé, gate et preuve de non-régression depuis le dossier 028.

### Implementation for User Story 3

- [X] T048 [US3] Relier gates, snapshots, captures, receipts, verifies et contrôles responsive avec identités et hashes dans `specs/028-figma-responsive-hero-video/proofs/ledger.json`
- [X] T049 [P] [US3] Documenter pour Compact, Desktop et Wide la structure, la sélection explicite, les fixtures et les limites dans `specs/028-figma-responsive-hero-video/handoff/compositions.md`
- [X] T050 [P] [US3] Documenter par composition chaque primitive/propriété et chaque override `pending-responsive-text-style` comme observation candidate dans `specs/028-figma-responsive-hero-video/handoff/primitives-and-typography.md`
- [X] T051 [P] [US3] Documenter CTA/enfants read-only, médias, recouvrements, limites Figma et sujets futurs sans les déclarer bloquants ou résolus dans `specs/028-figma-responsive-hero-video/handoff/deferred-and-limits.md`
- [X] T052 [US3] Faire rejouer le parcours de lecture et de vérification par un mainteneur distinct à partir de `specs/028-figma-responsive-hero-video/quickstart.md`, puis enregistrer son constat dans `specs/028-figma-responsive-hero-video/proofs/maintainer-rehearsal.md`
- [X] T053 [US3] Présenter le dossier complet à l’owner et enregistrer H4 avec acceptation, refus ou suites explicites dans `specs/028-figma-responsive-hero-video/decisions/H4-closure.json`
- [X] T054 [US3] Après H4 accepté, finaliser le runner et le ledger sans étendre le scope produit, puis enregistrer la clôture dans `specs/component-repairs/hero-video/run-003/finalize.json`

**Checkpoint**: La source Figma et son dossier de preuve peuvent être repris par la campagne responsive Home sans dépendre d’un contexte oral.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Vérifier la cohérence finale du code interne, des artefacts Spec Kit et des frontières de scope.

- [X] T055 Exécuter `npm run build`, `npm run parity`, `npm run eval`, `npm run plugin:check`, `npx tsx scripts/deterministic-roundtrip.mjs`, `node scripts/core-browser-check.mjs`, `npx tsc --noEmit` et `npx tsc -p tsconfig.build.json`, puis consigner les sorties dans `specs/028-figma-responsive-hero-video/proofs/final-constitution-gates.md`
- [X] T056 Vérifier liens, IDs, absence de placeholder, diff, statut Git du worktree actif et absence de modification contrat/HTML/Odoo/Page/enfants, puis enregistrer le contrôle final dans `specs/028-figma-responsive-hero-video/proofs/final-scope-and-status.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: démarre immédiatement.
- **Foundational (Phase 2)**: dépend du Setup et bloque tout travail sur le master.
- **US1 (Phase 3)**: dépend de Foundational ; H1 autorise les frames de travail et H2 fige la proposition.
- **US2 (Phase 4)**: les fixtures runner peuvent être préparées après Foundational, mais l’implémentation live dépend de H2 ; H3 est obligatoire avant T044.
- **US3 (Phase 5)**: dépend de la première application vérifiée et du second passage no-op ; H4 est obligatoire avant la finalisation.
- **Polish (Phase 6)**: dépend de toutes les user stories.

### User Story Dependencies

- **US1 (P1)**: indépendante pour produire et valider la proposition visuelle.
- **US2 (P1)**: dépend des décisions exactes de US1 pour l’application Figma ; les tests génériques du runner peuvent avancer en parallèle.
- **US3 (P2)**: dépend des preuves produites par US1 et US2.

### Within Each User Story

- Les gates humains sont des arrêts réels : aucune étape qu’ils autorisent ne peut les précéder.
- Les fixtures rouges précèdent l’implémentation du runner.
- Les evals ciblées et complètes précèdent le mechanism spike.
- Le mechanism spike vert et no-op précède toute mutation du HeroVideo.
- Snapshot, preflight, captures avant et dry-run précèdent H3.
- Première application, captures après et verify précèdent le second passage no-op.
- Le CTA et tous les enfants restent read-only à chaque étape et ne conditionnent pas l’avancement du parent.

### Parallel Opportunities

- Après T009, T010 à T012 peuvent avancer en parallèle.
- Après T015, T016 et T017 peuvent avancer en parallèle.
- T021 à T024 peuvent être écrites en parallèle, puis sont enregistrées ensemble par T025.
- T049 à T051 peuvent être rédigées en parallèle après T048.

---

## Parallel Example: User Story 2

```text
Task T021: fixture topologie et créations dans evals/fixtures/figma-responsive-component-set-check.ts
Task T022: fixture scénarios responsive dans evals/fixtures/figma-responsive-presentation-scenarios-check.ts
Task T023: fixture bindings et typographie dans evals/fixtures/figma-responsive-bindings-and-typography-check.ts
Task T024: fixture frontières et idempotence dans evals/fixtures/figma-responsive-write-boundary-idempotence-check.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Terminer Setup et Foundational.
2. Réaliser l’audit H1.
3. Concevoir et éprouver les frames Figma.
4. Obtenir H2.
5. **STOP and VALIDATE**: le design est validé, sans mutation du master.

### End-to-End Delivery

1. Livrer le MVP US1.
2. Ajouter les fixtures rouges et intégrer la capacité runner dans 028.
3. Passer evals, typechecks et mechanism spike, y compris le second passage no-op.
4. Préparer la campagne exacte et obtenir H3.
5. Appliquer, vérifier la matrice et prouver le second passage no-op.
6. Produire le handoff, obtenir H4 et exécuter les gates finales.

### Scope Guard

- Le résultat métier reste Figma-only.
- L’évolution de code se limite au runner Figma, son transport, ses modèles de campagne, ses fixtures, evals et documentation interne.
- Aucun contrat HeroVideo, HTML, code produit, Odoo, token global, variable responsive, Text Style global, Page ou enfant partagé n’est modifié.

---

## Notes

- `[P]` signifie fichiers distincts et absence de dépendance directe.
- Chaque tâche terminée doit être cochée dans ce fichier.
- Une preuve historique 027 sert de contexte, jamais de remplacement à l’audit frais ou aux preuves `run-003`.
- `run-002` est conservé intact ; toute exécution de 028 utilise `specs/component-repairs/hero-video/run-003/`.
