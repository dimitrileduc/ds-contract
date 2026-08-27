# Tasks: Outillage de la vague responsive

**Input**: Design documents from `/specs/030-outillage-vague-responsive/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: OBLIGATOIRES par la constitution (claims rule / FR-010) : chaque capacité suit fixture ROUGE → eval enregistré → implémentation. La fixture d'une capacité précède toujours son code dans l'ordre des tâches — et son état rouge est PROUVÉ (exécutée et échouante) avant d'implémenter.

**Organization**: 3 user stories indépendamment testables. AUCUNE mutation du canvas Figma vif dans toute la feature (Assumption 1 de la spec) — preuves en fixtures, mock (`scripts/plugin-engine-mock-figma.mjs`) et rejeu des artefacts 029 committés.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers distincts, aucune dépendance sur une tâche non finie du même bloc).
- **[US1]** préparer une section en minutes · **[US2]** appliquer en une commande · **[US3]** planche owner fidèle.
- Chaque tâche nomme le(s) fichier(s) exact(s) et, si applicable, le refus nommé qu'elle introduit.

---

## Phase 1: Setup

**Purpose**: Worktree prêt, autorités lues — léger, pas de cérémonie (leçon rétro).

- [X] T001 Vérifier `pwd`/branche/statut/worktrees (worktree Superset actif = copie isolée), rendre le worktree autosuffisant si besoin (`npm install`, `npx playwright install chromium` — F1), et consigner le pin dans `specs/030-outillage-vague-responsive/inventory/worktree-pin.json`
- [X] T002 Lire les autorités dans l'ordre constitution → `docs/internal/component-repair-workflow.md` → `specs/029-figma-responsive-categories/RETRO-PROCESS.md` (P1–P7) → `specs/029-figma-responsive-categories/inventory/runner-capability-plan.md` (conventions de fixtures du runner) et consigner le reçu docs-first dans `specs/030-outillage-vague-responsive/inventory/docs-first-receipt.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Les types et validations additifs dont les trois stories dépendent. Additif SEULEMENT — jamais de champ repurposé (data-model.md).

- [X] T003 Étendre `extract/figma/projection-repair/types.ts` (additif) : `captureMode`, `lockWaivers[]`, `generated{by,sourceReleve,nonDeductible[]}` sur la campagne ; types du rapport de verrous (`preflight-locks`) ; types de décision étendue (`pickerConsequence`, `acceptedFacts` forme longue `{fact,nature,witnessRef}`) ; types du journal driver — conformes à `data-model.md`
- [X] T004 Étendre la validation de campagne dans `extract/figma/projection-repair/campaign.ts` (additif) : accepter/valider les nouveaux champs optionnels (`captureMode`, `lockWaivers` avec `decisionRef` obligatoire, `generated`), sans changer un seul verdict existant — `npx tsc --noEmit` vert et `npm run eval` inchangé comme preuve de non-régression

**Checkpoint**: Les types existent, aucune campagne existante ne change de verdict.

---

## Phase 3: User Story 1 - Préparer une section en minutes, pas en heures (Priority: P1) 🎯 MVP

**Goal**: Manifeste généré depuis un relevé existant (plus jamais 25–30 Ko écrits main) + verrous hérités détectés AVANT toute application.

**Independent Test**: Rejouer `categories-principales` (029) : manifeste généré < 2 min, validé, zéro invention (quickstart §2) ; verrou classe-744px refusé par nom avant dry-run (fixture T006, quickstart §1).

### Fixtures rouges d'abord (FR-010)

- [X] T005 [P] [US1] Écrire la fixture ROUGE du générateur de manifeste (relevé 029 réel en entrée ; asserte : manifeste validé par `validateRepairCampaign`, byte-stable ×2, `nonDeductible[]` nommés, refus `releve-unreadable`/`component-not-found-in-releve`/`generated-campaign-invalid`) dans `evals/fixtures/figma-projection-repair/manifest-generator-check.ts` (ID `figma-projection-repair-manifest-generator`), l'enregistrer dans `evals/run.ts` et PROUVER son rouge (exécution échouante consignée)
- [X] T006 [P] [US1] Écrire la fixture ROUGE du preflight verrous (surface cible avec min-width hérité type 744px ⇒ refus nommé `inherited-size-lock` AVANT dry-run, avec nœud/propriété/valeur/héritage ; verrou couvert par `lockWaivers` référencé ⇒ passe) dans `evals/fixtures/figma-projection-repair/inherited-lock-preflight-check.ts` (ID `figma-projection-repair-inherited-lock-preflight`), l'enregistrer dans `evals/run.ts` et prouver son rouge

### Implémentation

- [X] T007 [US1] Implémenter le générateur pur `extract/figma/projection-repair/manifest-generator.ts` : `(relevé JSON, options) → {campaign, report}` — inversion de `facts.ts` (research R2), tout champ non déductible marqué + reporté, jamais inventé ; la fixture T005 passe au vert
- [X] T008 [US1] Ajouter l'entrée CLI `component:repair:manifest` (nouveau script npm dans `package.json` + entrée dans `extract/figma/projection-repair/cli.ts` — pas de wrapper séparé) au contrat de `contracts/cli-commands.md` §1, refus cités verbatim
- [X] T009 [US1] Étendre le relevé des faits `extract/figma/projection-repair/facts.ts` : min/max/dimensions figées de chaque surface cible et de ses ancêtres porteurs (research R5), sans changer les faits existants
- [X] T010 [US1] Brancher le refus `inherited-size-lock` dans le chemin de preflight existant (`extract/figma/projection-repair/cli.ts` + module concerné), produire `preflight-locks.json` (`locks/waived/blocking` — data-model.md) ; la fixture T006 passe au vert
- [X] T011 [US1] Preuve SC-001 : rejouer la génération sur `specs/component-repairs/categories-principales/run-001/audit.json`, chronométrer, diff sémantique contre le `campaign.json` écrit main de 029 (zéro invention), consigner dans `specs/030-outillage-vague-responsive/proofs/SC-001-manifest-replay.md`

**Checkpoint**: US1 livrable seule — un opérateur génère un manifeste valide et connaît ses verrous avant d'appliquer.

---

## Phase 4: User Story 2 - Appliquer une section en une commande, refus compris (Priority: P1)

**Goal**: Fix E8 (clôture multi-campagnes), capture allégée à verdicts identiques, driver une-invocation avec reprise, et la branche « créations déclarées en set existant » répétée sur mock.

**Independent Test**: Rejeu clôture 029 (2 campagnes, 1 dossier de décisions, zéro déplacement de fichiers) ; chaîne driver complète sur mock < 25 min avec interruption/reprise (quickstart §3).

### Fixtures rouges d'abord (FR-010)

- [X] T012 [P] [US2] Écrire la fixture ROUGE E8 (rejeu des artefacts 029 committés : les deux campagnes se clôturent avec le dossier partagé `specs/029-figma-responsive-categories/decisions/` sans déplacement ; doublon interne et décision manquante toujours refusés) dans `evals/fixtures/figma-projection-repair/shared-decision-root-check.ts` (ID `figma-projection-repair-shared-decision-root`), l'enregistrer dans `evals/run.ts` et prouver son rouge
- [X] T013 [P] [US2] Écrire la fixture ROUGE capture-light (même scénario mock joué en `full` et en `light` ⇒ verdicts de TOUTES les portes identiques ; volume light ≥ −80 % ; `capture-mode-mismatch` refusé si changement de mode en cours de run ; surface déclarée vide ⇒ refus §X inchangé) dans `evals/fixtures/figma-projection-repair/capture-light-verdicts-check.ts` (ID `figma-projection-repair-capture-light-verdicts`), l'enregistrer dans `evals/run.ts` et prouver son rouge
- [X] T014 [P] [US2] Écrire la fixture ROUGE driver (chaîne complète sur mock avec `expectedCreates > 0` en set existant : créations déclarées appliquées, `unexpected-created-node` refusé, second passage no-op ; arrêt au premier refus avec citation verbatim ; `--resume` ne rejoue pas les étapes vertes ; jamais d'écriture sans son dry-run) dans `evals/fixtures/figma-projection-repair/driver-chain-resume-check.ts` (ID `figma-projection-repair-driver-chain-resume`), l'enregistrer dans `evals/run.ts` et prouver son rouge

### Implémentation

- [X] T015 [US2] Fixer E8 dans `extract/figma/projection-repair/campaign.ts` (`selectFinalOwnerDecisions` : `targetId` étranger → `continue`, comme les fichiers sans `targetId` ; doublon interne et « missing final owner decision » conservés — research R1) ; la fixture T012 passe au vert
- [X] T016 [US2] Implémenter le mode light dans `extract/figma/projection-repair/capture.ts` + flag `--capture-mode` dans `cli.ts` (persisté dans la campagne au premier usage, `capture-mode-mismatch` ensuite — research R3, contrat §2) ; PNG déclarées/changées seulement, zéro PNG idempotence
- [X] T017 [US2] Ajuster la sélection de surfaces dans `extract/figma/projection-repair/verify.ts` pour que les portes rendent les MÊMES verdicts en light (FR-005) ; la fixture T013 passe au vert
- [X] T018 [US2] Implémenter le driver `scripts/component-repair-drive.mjs` : enchaîne les actions CLI existantes + `scripts/component-repair-bridge.mjs`, journal `drive-journal.jsonl` (une ligne/étape, verdict, refus verbatim), `--until`, `--resume` depuis `campaign.state` + journal, codes retour 0/2/3 (contrat §3) — AUCUNE porte dupliquée dans le driver (research R4) ; la fixture T014 passe au vert
- [X] T019 [US2] Preuves SC-002/SC-003/SC-004 : chrono de la chaîne mock complète, rejeu E8 réel, mesure du volume full vs light — consignées dans `specs/030-outillage-vague-responsive/proofs/SC-002-004-driver-e8-volume.md`. Honnêteté : le chrono mock est un PLAFOND (il prouve « une invocation, journal complet »), pas la mesure du gain réel de 25 min/section — celle-là appartient au pilote live de 031 ; le dire tel quel dans la preuve

**Checkpoint**: US2 livrable seule — une campagne s'applique en une commande et une vague multi-campagnes peut se clôturer.

---

## Phase 5: User Story 3 - Donner à l'owner une surface de décision fidèle, générée (Priority: P2)

**Goal**: Planche 7 zones générée (§XII + corollaire E2), `pickerConsequence` et natures VISUEL/STRUCTUREL imposés par une porte.

**Independent Test**: Générer la planche de la section 029 rejouée : 7 zones présentes, mentions négatives en français, fait structurel sans témoin refusé par nom (quickstart §1, dernière fixture).

### Fixture rouge d'abord (FR-010)

- [X] T020 [US3] Écrire la fixture ROUGE de la planche (décisions 029 rejouées : `zones.json` avec les 7 zones et checks `structuralFactsAllWitnessed`/`negativeStatementsInFrench`/`noScaledThumbnails` ; script `board.bridge.js` exécutable sur mock ; fait structurel sans témoin ⇒ `structural-fact-unwitnessed` ; témoin manquant pour une largeur ⇒ `witness-missing-for-width` ; mentions négatives absentes ⇒ `negative-statements-missing`) dans `evals/fixtures/figma-projection-repair/board-structural-witness-check.ts` (ID `figma-projection-repair-board-structural-witness`), l'enregistrer dans `evals/run.ts` et prouver son rouge

### Implémentation

- [X] T021 [US3] Implémenter le générateur pur `extract/figma/projection-repair/board-generator.ts` : `(décisions, témoins, inventaire d'usages) → {board.bridge.js, zones.json}` — même partage spec/runtime que `emit-figma-script` (research R6), déterministe byte-stable
- [X] T022 [US3] Implémenter la porte de décision étendue (validation `pickerConsequence` obligatoire + `nature`/`witnessRef` par fait accepté, forme courte 029 lue mais jamais écrite — `contracts/decision-design.md`) dans `extract/figma/projection-repair/campaign.ts` (à côté de `selectFinalOwnerDecisions`, un seul module de décision), refus `structural-fact-unwitnessed`
- [X] T023 [US3] Ajouter l'entrée CLI `component:repair:board` (`package.json` + entrée dans `extract/figma/projection-repair/cli.ts`, pas de wrapper séparé) au contrat de `contracts/cli-commands.md` §5 ; la fixture T020 passe au vert
- [X] T024 [US3] Preuve SC-006 : planche générée pour la section 029 rejouée (zones vérifiées sur mock, cas de refus exercé), consignée dans `specs/030-outillage-vague-responsive/proofs/SC-006-board-replay.md`

**Checkpoint**: US3 livrable — la surface de décision de 031 est générée, plus jamais artisanale.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T025 Mettre à jour `docs/internal/component-repair-workflow.md` (mode light, driver, deux générateurs, `pickerConsequence`, verrous hérités — limites documentées où la capacité est revendiquée, FR-013) — APRÈS le vert des evals concernés, jamais avant (claims rule)
- [X] T026 Vérifier l'ordre fixture→eval→capacité tenu pour les 6 capacités (preuves de rouge datées AVANT chaque implémentation) et la preuve adverse SC-005 (retirer une capacité ⇒ suite rouge, testé sur E8 au minimum), consigner dans `specs/030-outillage-vague-responsive/proofs/SC-005-adversarial.md`
- [X] T027 Sweep constitutionnel complet dans le worktree (`npm run build`, `npm run parity`, `npm run eval`, `npm run plugin:check`, `npx tsx scripts/deterministic-roundtrip.mjs`, `node scripts/core-browser-check.mjs`, 2 typechecks) + `git status --porcelain src/ figma-sync/ catalog/` VIDE (re-pin zéro, FR-012 ; seul rouge toléré : dette golden 028 STRICTEMENT inchangée) — consigner dans `specs/030-outillage-vague-responsive/proofs/sweep-final.md`
- [X] T028 Entrée datée dans `MILESTONES.md` (les 6 capacités, le N/N vivant imprimé par `npm run eval`, la dette 028 inchangée) + relecture de clôture : tout écart découvert en route a son entrée datée dans `specs/030-outillage-vague-responsive/inventory/ecarts.md` (créer le registre au premier écart, jamais après coup)

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2 → stories** : T003/T004 bloquent tout (types partagés).
- **US1, US2, US3 sont indépendantes entre elles** après la Phase 2 — trois agents peuvent les mener en parallèle (fichiers disjoints : US1 = manifest-generator/facts/preflight ; US2 = campaign-E8/capture/verify/driver ; US3 = board-generator/porte décision). Seul point de contact : `cli.ts` (T008/T010/T016/T023) et `campaign.ts` (T004/T015/T022) — séquencer CES tâches-là si parallélisation (pas de worktree-isolation nécessaire si un seul writer par fichier).
- **Dans chaque story** : fixtures rouges PROUVÉES avant l'implémentation correspondante ; preuve SC en dernier.
- **Phase 6** après les trois stories (T025 exige les evals verts).

### Parallel opportunities

- T005 ∥ T006 (fixtures US1, fichiers distincts) ; T012 ∥ T013 ∥ T014 (fixtures US2) ; T007 ∥ T009 (modules distincts).
- Après Phase 2 : US1 ∥ US2 ∥ US3 avec la règle un-writer-par-fichier sur `cli.ts`/`campaign.ts`.

## Implementation Strategy

**MVP = Phase 3 (US1)** : le générateur de manifeste + preflight verrous suffisent à dérisquer la préparation de la vague — même sans driver, un opérateur gagne les heures du manifeste main. Ensuite US2 (le gain batch), puis US3 (la surface owner). Livraison incrémentale possible après chaque checkpoint ; la feature n'est « claim-able » (docs, T025) qu'après les evals verts de la capacité concernée.
