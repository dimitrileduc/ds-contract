# Tasks: Rendre CategoriesPrincipales responsive dans Figma

**Input**: Design documents from `/specs/029-figma-responsive-categories/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Les fixtures négatives, evals, typechecks et preuves de second passage no-op sont obligatoires : la feature étend le runner `component:repair` avant toute mutation Figma live (FR-032, Principe II). Ordre imposé : fixture rouge → eval → capacité.

**Organization**: Les tâches sont groupées par user story pour permettre une implémentation et un test indépendants. La campagne s'exécute en DEUX runs séquentiels — carte PUIS section — sous UN seul cycle global de captures et de vérification (§X/§XI). Tout enfant partagé autre que la carte reste en lecture seule pendant toute la feature ; son état n'empêche pas les décisions réalisables sur le parent.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut être exécutée en parallèle avec les autres tâches `[P]` du même bloc (fichiers distincts, aucune dépendance).
- **[US1]**, **[US2]**, **[US3]**: User story couverte par la tâche.
- Chaque tâche nomme le fichier ou dossier où sa preuve doit être enregistrée.

**Chemins de campagne** :

- **Carte** (feuille, en premier) : `specs/component-repairs/carte-categorie/run-001/`
- **Section** (composite, ensuite) : `specs/component-repairs/categories-principales/run-001/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Préparer deux runs neufs et traçables dans le worktree Superset actif, sans réutiliser de preuve d'exécution existante.

- [X] T001 Vérifier `pwd`, la branche, le statut Git et la liste des worktrees, confirmer que le worktree actif est bien la copie isolée, puis enregistrer le pin dans `specs/029-figma-responsive-categories/inventory/worktree-pin.json`
- [X] T002 Rendre le worktree autosuffisant (`npm install` puis `npx playwright install chromium`, Worktree Gates F1) et consigner versions, commandes et sortie dans `specs/029-figma-responsive-categories/inventory/environment-receipt.md`
- [X] T003 Lire les autorités documentaires dans l'ordre constitution → `docs/internal/component-repair-workflow.md` → `docs/responsive-figma.md` → `docs/FIGMA-CAPABILITY-MATRIX.md` → spec/plan/contracts 029 → gabarit et handoff 028 → historique 021/023, puis consigner le reçu docs-first dans `specs/029-figma-responsive-categories/inventory/docs-first-receipt.md`
- [X] T004 [P] Créer la campagne carte fraîche `run-001` (racines audit, captures, receipts, verify ; `pageMutationPolicy: forbid-direct` ; version Figma à repinner en phase live) dans `specs/component-repairs/carte-categorie/run-001/campaign.json`
- [X] T005 [P] Créer la campagne section fraîche `run-001` (mêmes racines ; `pageMutationPolicy: forbid-direct` ; interdiction de tout child write y compris instances de carte) dans `specs/component-repairs/categories-principales/run-001/campaign.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fixer les frontières d'écriture, les preuves attendues et les gates avant tout design ou extension du runner.

**⚠️ CRITICAL**: Aucun travail sur les masters ni aucune extension live du runner ne commence avant la fin de cette phase.

- [X] T006 Mapper FR-032/FR-033 aux quatre capacités génériques (topologie de set existant, sélection multi-axes Style×Colonnes, cible carte autorisée vs enfants refusés, 7 surfaces d'usage), à leurs refus stables et à leurs fixtures/evals attendus dans `specs/029-figma-responsive-categories/inventory/runner-capability-plan.md`
- [X] T007 Déclarer dans les deux `campaign.json` (carte + section) les masters cibles, les 7 usages en lecture seule par position, la carte comme mutable-sous-condition-d'exclusivité, tous les autres enfants partagés comme protégés, et interdire toute écriture Page ou enfant hors carte
- [X] T008 [P] Définir les champs obligatoires, l'ordre et les critères d'acceptation des gates H1 à H4 — dont `orphanRowDecision`, `cardExtentDecision` (H2) et `parityPosture` (H4, qui DOIT nommer son mécanisme : acquittements owner dans `parity/baseline.json` comme en 015/016, ou waiver Governance enregistré dans la PR) — dans `specs/029-figma-responsive-categories/decisions/README.md`
- [X] T009 [P] Valider la forme initiale des deux `campaign.json` sans mutation live et enregistrer les erreurs ou refus attendus dans `specs/029-figma-responsive-categories/inventory/campaign-validation.md`

**Checkpoint**: Les deux runs sont neufs, les écritures autorisées sont bornées (carte mutable sous condition, section sans child write, Pages hors zone) et la future extension du runner possède un plan de test explicite.

---

## Phase 3: User Story 1 - Chercher le vrai comportement responsive dans Figma (Priority: P1) 🎯 MVP

**Goal**: À partir d'un audit frais des deux masters, de l'exclusivité de la carte et des 7 usages, obtenir dans des frames Figma de travail une proposition responsive (grille + carte) pour les configurations 2 et 3 colonnes, liée aux primitives existantes et explicitement validée par l'owner, sans toucher aux masters ni aux Pages.

**Independent Test**: L'owner peut comparer des témoins mobile/desktop/wide pour les configurations 2 et 3 colonnes, avec contenus normal et long, retrouver les bindings proposés, trancher la ligne orpheline et l'étendue de la carte, et accepter H1 puis H2 sans qu'aucun nœud de master n'ait été modifié.

### Audit frais et H1

- [X] T010 [US1] Exécuter un audit Figma frais et read-only de la section (set `CategoriesPrincipales`, 4 combinaisons Style×Colonnes, ids/keys, axes, propriétés, textes, médias, variables, overrides) via `npm run component:repair -- --campaign specs/component-repairs/categories-principales/run-001/campaign.json --audit` et enregistrer dans `specs/component-repairs/categories-principales/run-001/audit.json`
- [X] T011 [US1] Exécuter un audit Figma frais et read-only de la carte (`Carte/Categorie`, variantes Style, ids/keys, propriétés, calques, médias) via `npm run component:repair -- --campaign specs/component-repairs/carte-categorie/run-001/campaign.json --audit` et enregistrer dans `specs/component-repairs/carte-categorie/run-001/audit.json`
- [X] T012 [US1] Prouver PAR POSITION sur tout le fichier l'exclusivité de la carte (composeurs recensés) ; si un second composeur existe, marquer la carte `out-of-scope/owner-decision` et remonter la décision. Enregistrer dans `specs/029-figma-responsive-categories/inventory/H1-card-exclusivity.json`
- [X] T013 [US1] Recenser les 7 usages PAR POSITION sur la page `Pages` `210:325` (instanceNodeId, frame hôte, mainComponentId, configuration Style/Colonnes, nombre de cartes, taille, overrides, rendu de référence) dans `specs/029-figma-responsive-categories/inventory/H1-usages.json`
- [X] T014 [P] [US1] Comparer l'audit frais aux preuves historiques 021/023 en séparant baseline, dérive et défauts préexistants non bloquants ; nommer chaque contradiction et la marquer « retour à H1 » dans `specs/029-figma-responsive-categories/inventory/H1-baseline-delta.md`
- [X] T015 [P] [US1] Inventorier les primitives numériques existantes utilisables pour gaps, paddings et dimensions (id, valeur, propriétés compatibles), sans créer de variable, dans `specs/029-figma-responsive-categories/inventory/H1-primitives.json`
- [X] T016 [P] [US1] Produire les exports read-only utiles à H1 pour les 2 masters (par variante) et les 7 usages, puis relier leurs identités et dimensions dans `specs/029-figma-responsive-categories/proofs/H1-surface-manifest.json`
- [X] T017 [US1] Présenter le delta H1 à l'owner (source, variantes, exclusivité carte, usages, défauts préexistants, périmètre) et enregistrer son acceptation, refus ou réorientation explicite — H1 n'autorise que les frames de travail hors masters et hors Pages — dans `specs/029-figma-responsive-categories/decisions/H1-audit.json`

### Design dans Figma et H2

- [X] T018 [US1] Après H1 accepté, créer hors des masters des témoins de travail mobile/desktop/wide pour les configurations 2 ET 3 colonnes, sans les présenter comme appliqués, puis enregistrer leurs node IDs et présentations explicites dans `specs/029-figma-responsive-categories/inventory/H2-work-frames.md`
- [X] T019 [US1] Éprouver sur les témoins les contenus normal et long, ajouter les contrôles 320/390/834/1200/1440/1728, et démontrer d'abord si l'adaptation interne (Auto Layout, wrap, Fill/Hug, min/max) de la grille et de la carte suffit avant tout état explicite ; consigner chaque couple largeur/fixture et la démonstration interne-d'abord dans `specs/029-figma-responsive-categories/inventory/H2-fixtures.md`
- [X] T020 [US1] Montrer explicitement à l'owner, comme décisions ou cas à valider jamais résolus silencieusement : la ligne orpheline 2+1 du 3 colonnes aux largeurs intermédiaires, le remplissage quand cartes ≠ colonnes, les cartes sans image / rapport atypique, et la lisibilité du texte sur photo en mobile (style superposé) ; consigner dans `specs/029-figma-responsive-categories/inventory/H2-grid-cases.md`
- [X] T021 [P] [US1] Relier chaque gap, padding et dimension proposés à une primitive existante (`composition → node/path → propriété → variableId/nom → valeur résolue`) et s'arrêter devant l'owner si une primitive manque, dans `specs/029-figma-responsive-categories/inventory/H2-bindings.json`
- [X] T022 [P] [US1] Limiter tout override typographique aux compositions approuvables (rôle/famille/poids/contenu préservés, `fields` ⊆ fontSize/lineHeight/textAlignHorizontal) et inventorier la dette `pending-responsive-text-style` dans `specs/029-figma-responsive-categories/inventory/H2-typography.json`
- [X] T023 [US1] Capturer les options Figma avec leurs limites, cas média et comparaisons wide, puis les relier aux décisions candidates dans `specs/029-figma-responsive-categories/proofs/H2-option-manifest.json`
- [X] T024 [US1] Présenter à l'owner la topologie retenue, les compositions, primitives, overrides typographiques, `columnsSettingStatement` (énuméré 2|3, intitulé desktop, mobile = 1 carte/ligne), et — OBLIGATOIRES — `orphanRowDecision` et `cardExtentDecision`, chaque état ajouté justifié un par un, puis enregistrer H2 (validé contre `contracts/figma-design-decision.md`) dans `specs/029-figma-responsive-categories/decisions/H2-design.json`
- [X] T025 [US1] Après H2, conserver uniquement les frames acceptées et nettoyer ou archiver explicitement les options rejetées, avec état final et node IDs, dans `specs/029-figma-responsive-categories/inventory/H2-work-frames.md`

**Checkpoint**: La proposition responsive existe et est approuvée dans Figma pour les deux configurations de colonnes, mais aucun master n'a encore été modifié.

---

## Phase 4: User Story 2 - Installer le responsive sans casser les sept usages ni la couche livrée (Priority: P1)

**Goal**: Étendre génériquement le runner (topologie de set existant, sélection multi-axes, cible carte autorisée vs enfants refusés, 7 surfaces d'usage), prouver la capacité par tests et par spike, puis installer le responsive sur la carte PUIS la section en conservant identités, liens des 7 usages, apparence desktop approuvée et couche Odoo 023.

**Independent Test**: Une première application ne réalise que les créations/modifications déclarées ; aucun usage, enfant hors carte ou nœud de Page n'est écrit ; les contrôles de composition passent ; une seconde application produit zéro création, zéro modification et aucun changement de fait protégé.

### Tests for User Story 2 ⚠️

> Écrire et observer l'échec de ces fixtures AVANT d'implémenter la nouvelle capacité (fixture rouge → eval → capacité).

- [X] T026 [P] [US2] Ajouter une fixture rouge couvrant la topologie de set existant (4 membres, `createdMembers` possiblement vide, identités des 4 membres et du set protégées, reporting honnête des créations nulles) dans `evals/fixtures/figma-responsive-existing-set-topology-check.ts`
- [X] T027 [P] [US2] Ajouter une fixture rouge couvrant la sélection multi-axes (paire Style×Colonnes correcte par scénario, refus `presentation-not-selected` sur mauvaise paire) et la matrice 320/390/834/1200/1440/1728 × {2,3} × {normal,long} dans `evals/fixtures/figma-responsive-multiaxis-scenarios-check.ts`
- [X] T028 [P] [US2] ÉTENDRE la fixture rouge EXISTANTE héritée de 028 (le fichier existe déjà et son eval `figma-responsive-bindings-typography-allowlisted` est déjà enregistré — ne pas la recréer ni dupliquer son ID) avec les cas 029 : bindings de primitives en sélection multi-axes, binding détaché refusé (`primitive-binding-detached`) et overrides typographiques locaux allowlistés (`typography-field-not-allowlisted`), sans casser les cas 028 verts, dans `evals/fixtures/figma-responsive-bindings-and-typography-check.ts`
- [X] T029 [P] [US2] Ajouter une fixture rouge NOUVELLE, limitée aux classes propres à 029 : création cachée dans un set existant (`unexpected-created-node`), écriture d'enfant partagé et d'instance de carte côté section (`shared-child-write-forbidden`), delta propagé non attribué, et second passage non no-op en contexte deux runs (`second-pass-not-noop`) — la fixture 028 `figma-responsive-write-boundary-idempotence-check.ts` reste intacte et continue de couvrir `page-write-forbidden` et l'idempotence mono-master — dans `evals/fixtures/figma-responsive-write-boundary-propagation-idempotence-check.ts`
- [X] T030 [US2] Enregistrer dans `evals/run.ts` les fixtures de T026–T029 : trois IDs NOUVEAUX et stables (T026, T027, T029) et l'ID EXISTANT `figma-responsive-bindings-typography-allowlisted` conservé pour la fixture étendue de T028 (aucun doublon d'ID), avec des messages de diagnostic explicites

### Runner implementation for User Story 2

- [X] T031 [US2] Étendre les types génériques pour topologie de set existant, membres préservés vs créés, sélection multi-axes, cible carte autorisée, deltas propagés attendus et attribués, et 7 surfaces d'usage dans `extract/figma/projection-repair/types.ts`
- [X] T032 [US2] Étendre la validation de campagne pour exiger allowlists, expected creates (possiblement zéro), identités des 4 membres préservées, sélection de paire Style×Colonnes et interdictions Page/enfant (dont instance de carte côté section) dans `extract/figma/projection-repair/campaign.ts`
- [X] T033 [US2] Étendre la préparation dry-run/apply pour planifier honnêtement créations, mutations internes et deltas propagés, et refuser toute opération absente de la campagne, dans `extract/figma/projection-repair/apply.ts`
- [X] T034 [US2] Étendre le bridge-script d'une opération générique et allowlistée qui mute à l'intérieur d'un set existant (adaptation interne + états explicites déclarés), préserve identités/keys/axes/calques/médias/textes, applique uniquement bindings/overrides déclarés, et n'écrit jamais d'instance de carte ni de Page, dans `extract/figma/projection-repair/bridge-script.ts`
- [X] T035 [US2] Faire transiter sans perte les nouveaux champs (topologie set existant, sélection multi-axes, binding, typographie, deltas propagés) dans l'enveloppe bridge de `scripts/component-repair-bridge.mjs`
- [X] T036 [US2] Étendre l'extraction des faits protégés aux set existant, 4 membres, component keys, axes, carte + variantes, propriétés, médias, textes, calques, liens des 7 usages et bindings dans `extract/figma/projection-repair/facts.ts`
- [X] T037 [US2] Étendre les captures pour sélectionner explicitement chaque paire Style×Colonnes et chaque fixture de contenu, et couvrir les 7 usages par position sans modifier de Page, dans `extract/figma/projection-repair/capture.ts`
- [X] T038 [US2] Étendre les reçus pour distinguer created/changed/noop/propagated, lister chaque node ID créé, exiger `pageWrites=[]` (et `childWrites=[]` côté section) et signaler toute création ou mutation non déclarée dans `extract/figma/projection-repair/apply-receipt.ts`
- [X] T039 [US2] Étendre audit et rapport pour exposer topologie de set existant, sélection multi-axes, bindings effectifs, overrides typographiques locaux, deltas propagés attribués et violations de frontières dans `extract/figma/projection-repair/audit.ts` et `extract/figma/projection-repair/report.ts`
- [X] T040 [US2] Étendre la vérification pour contrôler identité du set + 4 membres, carte + variantes, axes, noms/rôles de calques, médias/textes/propriétés, matrice responsive, classification des deltas propagés (attribué vs interdit), zéro Page/enfant write et idempotence stricte dans `extract/figma/projection-repair/verify.ts`
- [X] T041 [US2] Documenter la capacité générique (topologie set existant, multi-axes, cible carte, propagation attribuée, 7 usages), ses allowlists, refus, receipts et séquence de double passage dans `docs/internal/component-repair-workflow.md`
- [X] T042 [US2] Exécuter les quatre evals ciblés de T030 (trois nouveaux, un étendu) jusqu'au vert (`npm run eval`) et consigner commandes, IDs et résultats dans `specs/029-figma-responsive-categories/proofs/runner-targeted-gates.md`
- [X] T043 [US2] Exécuter l'intégralité des evals et les deux typechecks (`npx tsc --noEmit && npx tsc -p tsconfig.build.json`) sans régression, toute dette préexistante nommée jamais renommée verte, puis consigner dans `specs/029-figma-responsive-categories/proofs/runner-full-gates.md`

### Figma application for User Story 2

- [X] T044 [US2] Exécuter un mechanism spike hors source autoritative prouvant, pour un set 4 membres + carte 2 variantes + liens de 7 usages : identités préservées, propagation carte→instances attribuée, sélection multi-axes, bindings, typographie bornée, créations honnêtes (possiblement zéro) et refus des écritures interdites, dans `specs/029-figma-responsive-categories/proofs/mechanism-spike-first.json`
- [X] T045 [US2] Rejouer exactement le mechanism spike et exiger zéro création/modification avant de qualifier la capacité, dans `specs/029-figma-responsive-categories/proofs/mechanism-spike-second-noop.json`
- [X] T046 [US2] Reprendre les décisions H2 dans les deux campagnes fraîches (topologie, états créés, bindings, typographie, scénarios, deltas propagés attendus, faits protégés) et repinner la source dans les deux `campaign.json` (carte + section)
- [X] T047 [US2] Cycle global §X : exécuter `snapshot-source` + `preflight` pour les deux runs, puis capturer les captures BEFORE de TOUTES les surfaces — 2 masters (par variante) et 7 usages — vérifiées non vides et correctement dimensionnées AVANT la première écriture du premier run, dans `specs/component-repairs/carte-categorie/run-001/captures/` et `specs/component-repairs/categories-principales/run-001/captures/`
- [X] T048 [US2] Exécuter les dry-runs des deux campagnes sans écriture et normaliser les artefacts (créations attendues comptées, deltas propagés déclarés côté section, `pageWrites=[]`) dans `specs/component-repairs/carte-categorie/run-001/receipts/` et `specs/component-repairs/categories-principales/run-001/receipts/`
- [X] T049 [US2] Présenter à l'owner les plans exacts de mutation des DEUX campagnes, les diffs dry-run, les créations attendues, les captures before complètes, le plan de rollback et le blast radius, puis enregistrer H3 dans `specs/029-figma-responsive-categories/decisions/H3-mutation.json`

> H3 accepté (2026-08-26, owner « GO PUT1 ») : le brouillon bloqué a été invalidé parce qu'il confondait largeur de référence du master et largeur d'exécution. Le plan exécuté supprime le `minWidth=744` hérité du master Carte, conserve les dix cartes directes de section en `FILL` et borne leur repli par un seuil section-owned de 320 px ; aucun `maxWidth`, aucune largeur runtime fixe, aucune Page ni aucun enfant partagé n'est écrit.
- [X] T050 [US2] Après H3 accepté, exécuter la première application live de la campagne CARTE via un seul Desktop Bridge (emit-bridge-script → bridge → normalize-apply → record-apply), capturer après et vérifier, dans `specs/component-repairs/carte-categorie/run-001/verify/first-pass.json`
- [X] T051 [US2] Exécuter la première application live de la campagne SECTION (ordre carte→section) via le même pont, capturer après et vérifier, en classant chaque delta d'instance de carte comme « propagé attendu et attribué » et non comme écriture, dans `specs/component-repairs/categories-principales/run-001/verify/first-pass.json`
- [X] T052 [US2] Dérouler la matrice responsive 320/390/834/1200/1440/1728 × configurations {2,3} × contenus {normal,long}, sélection explicite, en enregistrant `overflow=false`, `clippedBy=[]`, `contentAccessible=true`, `cardsPerRow=1` sur les témoins mobiles sans réglage exposé, et le rendu réel du 3 colonnes aux largeurs intermédiaires, dans `specs/029-figma-responsive-categories/proofs/responsive-matrix.json`
- [X] T053 [US2] Comparer chaque usage (×7) à sa capture before — écart zéro, ou chiffré et attribué à une cause nommée acceptée — et vérifier identités, keys, axes, propriétés, `boundVariables`, calques, liens et overrides des 2 masters, avec zéro Page/enfant write et couche Odoo 023 intacte, dans `specs/029-figma-responsive-categories/proofs/protected-facts.json`
- [X] T054 [US2] Rejouer exactement les mêmes plans (carte puis section), capturer l'idempotence de toutes les surfaces, et exiger opérations `no-op`, `createdNodeIds=[]`, `changedNodeIds=[]`, `pageWrites=[]` (et `childWrites=[]` côté section) et zéro variation des faits protégés, dans `specs/component-repairs/carte-categorie/run-001/verify/second-pass-noop.json` et `specs/component-repairs/categories-principales/run-001/verify/second-pass-noop.json`

**Checkpoint**: La carte et la section sont responsive dans Figma, les 7 usages rendent comme leur capture before (ou écart attribué accepté), aucune Page ni enfant hors carte n'a été écrit, et une seconde application est un no-op strict.

---

## Phase 5: User Story 3 - Livrer une source vérifiable et le relevé des écarts avec 028 (Priority: P2)

**Goal**: Produire une source Figma responsive vérifiable, des preuves avant/après/idempotence, un inventaire lisible des choix locaux, le registre des écarts au gabarit 028, et clore en figma-ahead non convergé après décision owner sur la posture parité.

**Independent Test**: Un mainteneur distinct retrouve sans aide orale, pour chaque comportement retenu, ses primitives, ses adaptations typographiques temporaires, ses sujets différés, ses faits protégés — et la liste datée des points où ce composant a demandé autre chose que HeroVideo.

- [X] T055 [P] [US3] Consigner dans le registre les écarts au gabarit 028, chacun avec sa cause AU MOMENT de son apparition — dont les trois écarts structurels connus (set existant vs standalone→set, deux masters/deux runs vs un, sélection multi-axes vs `Presentation` seule) — dans `specs/029-figma-responsive-categories/handoff/ecarts-028.md` — FAIT (clôture 2026-08-26 soir) : `inventory/ecarts-028.md`, 8 écarts datés dont le malentendu E2, le geste hors-runner E3 et le bug runner E8.
- [X] T056 [P] [US3] Inventorier par comportement retenu la structure, chaque primitive liée, chaque override `pending-responsive-text-style`, les limites média et les enfants différés, chaque valeur marquée « observation candidate » et non variable/mode/Text Style global, dans `specs/029-figma-responsive-categories/handoff/campaign-handoff.md` — FAIT : `inventory/comportements-retenus.md` (état final 12 membres, renvois H2 + run-002).
- [X] T057 [US3] Rafraîchir d'abord EN LECTURE le cliché canvas consommé par le différentiel (`parity/snapshots/figma-components.json`, périmé depuis 017 — sans refresh le rapport comparerait le contrat au canevas d'AVANT-mutation et sous-estimerait la dérive introduite), puis produire le rapport de dérive réel vis-à-vis de `ds.categories-principales` v1.0.0 et `ds.carte-categorie` v1.1.0 (base de la décision `parityPosture`) dans `specs/029-figma-responsive-categories/proofs/parity-drift-report.md` — FAIT : cliché `parity/snapshots/figma-components.json` rafraîchi en lecture via le pont (CategoriesPrincipales : 3 axes, 12 variantes) ; parité verte avec 2 acquittements owner nouveaux (`figma|ahead|CategoriesPrincipales.Presentation`, `figma|ahead|HeroVideo.Presentation`).
- [X] T058 [US3] Présenter à l'owner les preuves finales (captures after/idempotence, comparaison pixel des 7 usages, contrôles d'overflow, faits protégés, zéro écriture de Page, second passage no-op, rapport de dérive) et enregistrer H4 avec la décision `parityPosture` dans `specs/029-figma-responsive-categories/decisions/H4-acceptance.json` — FAIT : GO owner explicite en session (« valide tout », 2026-08-26 soir) après inspection canvas ; H4 enregistrés par cible (`decisions/H4-*.json`), parityPosture = acquittements baseline.
- [X] T059 [US3] Après H4 accepté, exécuter `--finalize` sur les deux campagnes (section puis carte) et enregistrer `figma-ahead/pending-home-responsive-promotion`, la dérive nommée, la garde contre une régénération Figma non coordonnée, et la déclaration explicite que contrats, code, HTML, Odoo, couche rédacteur 023 et breakpoints automatiques ne sont pas qualifiés, dans `specs/029-figma-responsive-categories/handoff/closure-ledger.md` — FAIT : `--finalize` vert sur les deux campagnes, état `owner-accepted`, reçus schema-valid. Bug runner contourné et consigné (E8 : ownerDecisionRoot partagé refuse le H4 de l’autre cible).

**Checkpoint**: La source finale est acceptée, ses limites et sa non-convergence sont nommées, et le handoff est prêt pour la future campagne responsive transverse.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Vérifications transverses et journal, sans nouvelle capacité ni nouvelle mutation.

- [X] T060 [P] Vérifier de bout en bout `pageWrites=[]` et l'absence de tout child write hors carte à travers les reçus des deux campagnes, et confirmer que la couche Odoo 023 n'a été ni modifiée ni migrée ni déclarée convergente, dans `specs/029-figma-responsive-categories/proofs/boundary-audit.md` — FAIT : 6/6 reçus (dry-run/first/second × 2 campagnes) avec `pageWrites=[]` et `childWrites=[]`.
- [X] T061 [P] Consigner l'entrée datée de la feature 029 (deux campagnes, figma-ahead) dans `MILESTONES.md`, en nommant le gap de journal existant plutôt qu'en le masquant — FAIT : entrée datée 2026-08-26 dans `MILESTONES.md` (nomme la dette golden 028 conservée).
- [X] T062 Relire le registre écarts-028 et le handoff pour confirmer qu'aucun écart n'a été découvert à la clôture sans entrée datée (un tel écart est un défaut du déroulé), et clore le reçu docs-first dans `specs/029-figma-responsive-categories/inventory/docs-first-receipt.md` — FAIT : relecture à la clôture, aucun écart sans entrée datée ; E8 ajouté à sa découverte. Voir RAPPORT-CLOTURE §5.
- [X] T063 Exécuter le sweep constitutionnel complet dans le worktree (F1) — `npm run build`, `npm run parity`, `npm run eval`, `npm run plugin:check`, `npx tsx scripts/deterministic-roundtrip.mjs`, `node scripts/core-browser-check.mjs`, `npx tsc --noEmit && npx tsc -p tsconfig.build.json` — et consigner les sorties dans `specs/029-figma-responsive-categories/proofs/constitution-gates.md` ; si `npm run parity` est rouge du fait de la dérive figma-ahead, appliquer le mécanisme décidé à H4 (acquittements `parity/baseline.json` ou waiver enregistré) au lieu de masquer le gate — FAIT : build/tsc×2/plugin/roundtrip/core-browser verts ; parité verte (7 acquittements nommés) ; eval 236/237, unique rouge = dette golden préexistante 028 (25 sorties), conservée nommée.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Aucune dépendance — démarre immédiatement.
- **Foundational (Phase 2)**: Dépend de Phase 1 — BLOQUE toutes les user stories.
- **User Story 1 (Phase 3)**: Dépend de Phase 2. H1 avant les frames de travail ; H2 avant toute application live sur les masters (T046+) — l'extension CODE du runner (T026–T043) n'attend pas H2.
- **User Story 2 (Phase 4)**: Dépend de Phase 2 ; l'application live (T046+) dépend de H2 accepté (T024). Les fixtures/runner (T026–T043) peuvent commencer dès la fin de Phase 2, en parallèle du design US1.
- **User Story 3 (Phase 5)**: Dépend de l'application et vérification US2 (jusqu'à T054) ; H4 clôt la feature.
- **Polish (Phase 6)**: Dépend de H4 (T058).

### User Story Dependencies

- **US1 (P1)**: Fournit H1 (audit) et H2 (design) — prérequis de toute mutation.
- **US2 (P1)**: Runner + application ; ses tests (T026–T030) sont indépendants du design mais son application (T046+) exige H2.
- **US3 (P2)**: Handoff + clôture — dépend des preuves US2.

### Within Each User Story

- Fixtures rouges (T026–T029) écrites et en échec AVANT l'implémentation runner (T031+).
- Types avant validation avant apply avant bridge avant facts/capture/verify.
- Captures before (T047) AVANT toute première écriture (§X) ; carte (T050) AVANT section (T051).
- Second passage no-op (T054) après la première application et sa vérification.

### Parallel Opportunities

- Phase 1 : T004 et T005 en parallèle (deux campagnes distinctes).
- Phase 2 : T008 et T009 en parallèle.
- US1 : T014, T015, T016 en parallèle ; T021, T022 en parallèle.
- US2 : les quatre fixtures T026–T029 en parallèle ; le design US1 et les tests runner US2 peuvent avancer en parallèle après Phase 2.
- US3 : T055, T056 en parallèle.
- Polish : T060, T061 en parallèle.

---

## Parallel Example: User Story 2 (fixtures rouges)

```bash
# Écrire les quatre fixtures négatives ensemble (fichiers distincts) :
Task: "Fixture topologie de set existant → evals/fixtures/figma-responsive-existing-set-topology-check.ts"
Task: "Fixture sélection multi-axes + matrice → evals/fixtures/figma-responsive-multiaxis-scenarios-check.ts"
Task: "Fixture bindings + typographie → evals/fixtures/figma-responsive-bindings-and-typography-check.ts"
Task: "Fixture frontières d'écriture + propagation + idempotence → evals/fixtures/figma-responsive-write-boundary-propagation-idempotence-check.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 (Setup) + Phase 2 (Foundational).
2. Phase 3 (US1) : audit frais → H1 → frames de travail → H2.
3. **STOP et VALIDER** : la proposition responsive est vue et acceptée par l'owner, aucun master modifié. C'est le cœur de la valeur — la décision existe et est prouvée avant toute mutation.

### Incremental Delivery

1. Setup + Foundational → frontières et gates fixés.
2. US1 → décision design approuvée (H1, H2) — MVP.
3. US2 → runner étendu et prouvé, application carte→section, 7 usages préservés (H3).
4. US3 → source vérifiable, handoff, écarts-028, clôture figma-ahead (H4).

### Notes

- Les quatre gates humains (H1–H4) sont des points d'arrêt réels : aucune décision de design ni mutation de source n'est attribuée implicitement à l'agent (SC-001).
- Un seul writer, un seul pont, un seul cycle global de captures (§X/§XI) ; les Pages restent hors zone (SC-007).
- Aucun id/nom `CategoriesPrincipales`/`Carte/Categorie` codé dans le runner (capacité générique, FR-032).
- Commit après chaque tâche ou groupe logique ; toute dette préexistante est nommée, jamais renommée verte.
