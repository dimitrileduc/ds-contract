# Tasks: Readiness Figma–contrat des sections

**Input**: Design documents from specs/020-figma-contract-readiness/

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, and contracts/

**Tests**: Required: the plan explicitly requires adversarial evals, comparator self-tests, deterministic output, and the full constitutional sweep.

**Organization**: Tasks are grouped by user story so each increment is independently verifiable after the shared foundation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Make the worktree runnable and establish the versioned feature inputs.

- [X] T001 Install the worktree dependencies and Chromium and record reproducible setup in specs/020-figma-contract-readiness/proofs/setup.md
- [X] T002 [P] Add the audit:readiness script invoking the readiness CLI in package.json
- [X] T003 [P] Create the exact eleven-section campaign input and empty immutable-decision registry layout in specs/020-figma-contract-readiness/registry/campaign.json
- [X] T004 [P] Document the registry, dossiers, and immutable proof locations in specs/020-figma-contract-readiness/registry/README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Provide deterministic schema-validated campaign primitives that block every user story until scope, evidence, and workflow invariants are enforced.

**⚠️ CRITICAL**: No story work can begin until this phase is complete.

- [X] T005 Encode docs-first, source-cleanliness, claims-order, and before-capture readiness invariants in extract/figma/organism-audit/readiness/invariants.ts
- [X] T006 [P] Define Zod representations of the three versioned readiness schemas and enums in extract/figma/organism-audit/readiness/schema.ts
- [X] T007 [P] Define the fixed eleven-section inventory and the complete FR-026 verdict/destination matrix including Header/Footer shell routing in extract/figma/organism-audit/readiness/scope.ts
- [X] T008 [P] Implement stable JSON serialization, SHA-256 pinning, and evidence availability helpers in extract/figma/organism-audit/readiness/evidence.ts
- [X] T009 Implement campaign loading that rejects missing, duplicate, or out-of-scope sections in extract/figma/organism-audit/readiness/campaign.ts
- [X] T010 Implement no-mutation preflight that pins current inputs and creates verified before-capture manifests in extract/figma/organism-audit/readiness/preflight.ts
- [X] T011 Wire audit:readiness --campaign <path> [--check] into the existing CLI in extract/figma/organism-audit/run.ts
- [X] T012 Add hermetic fixtures for 11-section scope, invalid schema, deterministic serialization, failed preflight, dirty masters, missing usage scans, and name-based identity rejection in evals/fixtures/figma-readiness/foundation-check.ts
- [X] T013 Register the readiness-foundation adversarial check in evals/run.ts
- [X] T014 Implement the blocking master-and-usage source-cleanliness audit by position/node id and emit complete receipts in extract/figma/organism-audit/readiness/source-cleanliness.ts

**Checkpoint**: The CLI accepts only a fully pinned valid 11-section campaign and refuses unverified preconditions without touching Figma.

---

## Phase 3: User Story 1 - Retrouver une référence saine (Priority: P1) 🎯 MVP

**Goal**: Build a truthful evidence timeline and at most three ranked historical candidates for every section; current Figma is never authoritative by default.

**Independent Test**: Provide a known historical regression and verify the likely first break, no more than three evidence-backed candidates, and blocked-history where evidence cannot support a candidate.

### Tests for User Story 1

- [X] T015 [P] [US1] Add adversarial timeline fixtures for contradictory visual/structural evidence, missing images, and historical regression in evals/fixtures/figma-readiness/timeline-check.ts
- [X] T016 [P] [US1] Add candidate-ranking fixtures that reject a fourth candidate and current-state auto-promotion in evals/fixtures/figma-readiness/candidate-ranking-check.ts
- [X] T017 [US1] Register timeline and candidate-ranking evals in evals/run.ts

### Implementation for User Story 1

- [X] T018 [P] [US1] Normalize Figma versions, captures, pages, contracts, and renders into typed historical evidence while refusing normalization of dirty/blocked sources and preserving their routed audit receipts outside candidate evidence in extract/figma/organism-audit/readiness/history.ts
- [X] T019 [US1] Implement stable chronology assembly, contradiction preservation, and probable-break detection in extract/figma/organism-audit/readiness/timeline.ts
- [X] T020 [US1] Implement deterministic candidate ranking capped at three in extract/figma/organism-audit/readiness/candidates.ts
- [X] T021 [US1] Generate per-section history dossiers with named unavailable evidence and blocked-history status in extract/figma/organism-audit/readiness/dossier.ts
- [X] T022 [US1] Write the eleven history/candidate dossiers beneath specs/020-figma-contract-readiness/dossiers/<section>/dossier.json

**Checkpoint**: Every section has a stable timeline and truthful candidate set or explicit historical block.

---

## Phase 4: User Story 2 - Décider avec l’owner avant réparation (Priority: P1)

**Goal**: Present a short immutable owner packet and make approval a hard gate before a repair or ready outcome.

**Independent Test**: Record an owner verdict for a dossier with alternatives, then prove repairs and ready are refused without it and both decisions survive a post-repair gate.

### Tests for User Story 2

- [X] T023 [P] [US2] Add immutable owner-decision fixtures for every reference and post-repair outcome, including active/excluded review timing, in evals/fixtures/figma-readiness/owner-gate-check.ts
- [X] T024 [P] [US2] Add refusal fixtures for repair-before-decision, ready-without-decision, and overwritten decisions in evals/fixtures/figma-readiness/owner-gate-refusal-check.ts
- [X] T025 [US2] Register owner-gate evals in evals/run.ts

### Implementation for User Story 2

- [X] T026 [US2] Render an owner packet with current state, break, candidates, recommendation, evidence, and gaps in extract/figma/organism-audit/readiness/owner-packet.ts
- [X] T027 [US2] Validate, append, and resolve immutable owner decisions and auditable review timing against the feature schema in extract/figma/organism-audit/readiness/owner-decisions.ts
- [X] T028 [US2] Enforce reference approval before repair/ready and distinct post-repair gate in extract/figma/organism-audit/readiness/gates.ts
- [X] T029 [US2] Store packets and append-only decision receipts in specs/020-figma-contract-readiness/dossiers/<section>/owner/
- [X] T030 [US2] Hold and time the first owner gate for all eleven packets, recording a decision or explicit block for every section in specs/020-figma-contract-readiness/dossiers/<section>/owner/reference-decision.json

**Checkpoint**: All eleven sections have an immutable timed first-gate receipt; no repair, diagnosis, or ready result bypasses the owner, and post-repair acceptance never replaces the reference decision.

---

## Phase 5: User Story 3 - Attribuer la panne au bon niveau (Priority: P2)

**Goal**: Attribute every significant difference and distinguish a faulty shared dependency from a local composition error, including 019 implications.

**Independent Test**: Diagnose a faulty composed child across consumers, then a correct child configured wrongly locally; verify impacts and revalidation differ accordingly.

### Tests for User Story 3

- [X] T031 [P] [US3] Add fixtures for all cause enums, three-surface comparisons, and FR-025 significant/informational boundary cases in evals/fixtures/figma-readiness/findings-check.ts
- [X] T032 [P] [US3] Add shared-dependency, local-composition, unrevalidated-consumer, and 019-repin fixtures in evals/fixtures/figma-readiness/impact-graph-check.ts
- [X] T033 [US3] Register findings and impact-graph evals in evals/run.ts

### Implementation for User Story 3

- [X] T034 [US3] Compare validated reference evidence against Figma, contract, and render separately in extract/figma/organism-audit/readiness/compare.ts
- [X] T035 [US3] Classify differences under FR-025, require informational no-impact justification, and attribute every significant difference to one allowed cause in extract/figma/organism-audit/readiness/findings.ts
- [X] T036 [US3] Build dependency-to-consumer impacts from contracts, Figma, render, and Odoo-019 pins in extract/figma/organism-audit/readiness/impact.ts
- [X] T037 [US3] Require consumer revalidation and explicit 019 repin decisions in extract/figma/organism-audit/readiness/revalidation.ts
- [X] T038 [US3] Persist comparison receipts, graphs, and named 019 repin impacts in specs/020-figma-contract-readiness/dossiers/<section>/diagnosis/

**Checkpoint**: Shared faults cannot be silently repaired locally, and local composition errors do not cause cross-consumer changes.

---

## Phase 6: User Story 4 - Orienter chaque section vers la bonne suite (Priority: P2)

**Goal**: Close with one truthful verdict and one destination per section, routing non-local work to a named repair spec rather than expanding 020.

**Independent Test**: Consolidate all eleven dossier outcomes and prove rejection of missing/duplicate sections, invalid routing, unrevalidated consumers, missing 019 repins, and prohibited local repair.

### Tests for User Story 4

- [X] T039 [P] [US4] Add consolidation fixtures for every FR-026 verdict/destination combination, Header/Footer shell routing, timed owner review, and zero-repair SC-008 handling in evals/fixtures/figma-readiness/consolidation-check.ts
- [X] T040 [P] [US4] Add routing-refusal fixtures for shared/schema/engine/image repairs, missing 019 repins, and incomplete revalidation in evals/fixtures/figma-readiness/routing-refusal-check.ts
- [X] T041 [US4] Register consolidation and routing-refusal evals in evals/run.ts

### Implementation for User Story 4

- [X] T042 [US4] Classify authorized reversible local repairs and route broader changes to named repair specs in extract/figma/organism-audit/readiness/routing.ts
- [X] T043 [US4] Enforce the complete FR-026 verdict/destination matrix, repair assignments, shell routing, and closure guards in extract/figma/organism-audit/readiness/close.ts
- [X] T044 [US4] Produce deterministic consolidated readiness JSON with SC-003 timings and SC-008 numerator, denominator, rate, and not-applicable handling in extract/figma/organism-audit/readiness/consolidate.ts
- [X] T045 [US4] Write consolidation, quality metrics, repair-spec list, and final receipts in specs/020-figma-contract-readiness/registry/consolidated-readiness.json
- [X] T046 [US4] Verify all eleven owner timings and the first-pass repair acceptance result and record failures or not-applicable status in specs/020-figma-contract-readiness/proofs/quality-metrics.md

**Checkpoint**: The report accounts for 11/11 sections with one outcome/destination each, and no prohibited repair escapes into 020.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verify the executable workflow, deterministic evidence, and documentation handoff.

- [X] T047 [P] Add an end-to-end hermetic campaign fixture covering all eleven ids in evals/fixtures/figma-readiness/end-to-end-check.ts
- [X] T048 Register the end-to-end readiness eval and run the feature-specific subset through evals/run.ts
- [X] T049 Run audit:readiness --check and record its 11/11 receipt and named skips in specs/020-figma-contract-readiness/proofs/closure.md
- [X] T050 Run full build, parity, eval, plugin, determinism, browser-core, and TypeScript gates and record results in specs/020-figma-contract-readiness/proofs/final-gates.md
- [X] T051 Document only eval-backed owner gates, diagnosis, local repair, quality metrics, and closure commands in specs/020-figma-contract-readiness/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup has no dependencies.
- Foundational depends on Setup and blocks all user stories.
- US1 depends on Foundation; US2 consumes US1 dossiers.
- US3 depends on T030 completing the eleven first-gate receipts; an explicit block is a valid receipt but cannot authorize diagnosis for that section.
- US4 depends on US3 findings, impacts, and revalidation state.
- Polish follows desired stories; T047 precedes T048, T049 precedes T050, and claims/documentation T051 follows the successful eval and gate evidence from T048–T050.

### User Story Dependency Graph

~~~text
Setup → Foundation → US1 (historical truth) → US2 (owner gate) → US3 (cause + impact) → US4 (route + close) → Polish
~~~

### Parallel Opportunities

- T002–T004, T006–T008, and each paired fixture task can proceed in parallel.
- T015/T016, T023/T024, T031/T032, and T039/T040 modify separate files.
- After T021, dossier entries can be prepared concurrently when each writer owns a distinct dossiers/<section>/ directory; consolidation remains single-writer.

## Parallel Example: User Story 3

~~~text
Task: "Add cause fixtures in evals/fixtures/figma-readiness/findings-check.ts"
Task: "Add impact fixtures in evals/fixtures/figma-readiness/impact-graph-check.ts"
Task: "Compare surfaces in extract/figma/organism-audit/readiness/compare.ts"
Task: "Build impacts in extract/figma/organism-audit/readiness/impact.ts"
~~~

## Implementation Strategy

### MVP First

1. Complete Setup and Foundation.
2. Complete US1 and produce all eleven historical dossiers.
3. Validate US1 independently before holding owner gates.

### Incremental Delivery

1. US1 establishes truthful evidence and candidates.
2. US2 records owner authority without mutation.
3. US3 diagnoses against that authority and protects shared consumers.
4. US4 routes each section to wave A, wave B, shell, or a named repair spec.
5. Polish runs deterministic feature and repository closure gates before finalizing capability documentation.

## Notes

- [P] means separate files with no incomplete-task dependency.
- Story tasks carry their [US#] label; setup, foundation, and polish deliberately do not.
- No task authorizes hand-editing generated outputs or canonical contract sources.
