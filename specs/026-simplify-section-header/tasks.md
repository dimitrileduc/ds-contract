---

description: "Actionable task list for the SectionHeader v3 migration"
---

# Tasks: Simplify Section Header

**Input**: Design documents in `/specs/026-simplify-section-header/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`

**Tests**: Contract, ledger, parity, Figma, and Odoo qualification tests are required by the specification and plan.

**Organization**: Tasks are grouped by user story so each increment has an independent acceptance gate. Never edit generated outputs under `src/components/`, `figma-sync/`, `catalog/`, or Odoo generated assets directly.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the isolated execution context and durable evidence locations before modifying canonical sources.

- [ ] T001 Create a clean dedicated feature worktree and record its immutable starting revision in `specs/026-simplify-section-header/proofs/worktree-baseline.json`
- [ ] T002 Create the run-002 campaign manifest with the 45-use scope, nine page frames, source pin, approved operations, and separate live receipts in `specs/component-repairs/section-header/run-002/campaign.json`
- [ ] T003 [P] Create the feature inventory and proof directory layout with README conventions in `specs/026-simplify-section-header/inventory/README.md`
- [ ] T004 [P] Document the implementation gate sequence, owner-GO boundary, and no-saved-page-migration rule in `specs/026-simplify-section-header/proofs/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Freeze factual baselines and add gates that every subsequent story relies on.

**⚠️ CRITICAL**: No contract, generated-output, Odoo, or Figma mutation may start until the before-capture, source pin, and complete ledger basis are valid.

- [ ] T005 Run the read-only source audit of SectionHeader and the four specialised owners; save master/property/style/token/instance facts in `specs/026-simplify-section-header/inventory/source-audit.json`
- [ ] T006 Scan Figma by position, structural signature, and `getMainComponentAsync`; record exactly 45 unique destinations (24 generic, 8 Hero, 3 Presentation, 8 Texte SEO, 2 Products) in `specs/026-simplify-section-header/inventory/usages.json`
- [ ] T007 [P] Calibrate strict page-parity for the nine source frames and archive the calibration receipt in `specs/026-simplify-section-header/proofs/page-parity-calibration.json`
- [ ] T008 Capture every source frame plus valid per-use/crop/context evidence before mutation in `specs/026-simplify-section-header/proofs/before/manifest.json`
- [ ] T009 Validate the 45-record inventory, before-capture dimensions, and no-name-classification rule against `specs/026-simplify-section-header/contracts/migration-ledger.schema.json`
- [ ] T010 Create one reviewed migration decision per usage, including old API facts, destination candidate, preservation digests, and blocked ambiguity handling in `specs/026-simplify-section-header/inventory/migration-ledger.json`
- [ ] T011 [P] Add adversarial v3 API fixtures for the two alignments, centre default, dark 40/50 title, and rejected legacy props in `evals/fixtures/section-header-v3-api-check.ts`
- [ ] T012 [P] Add fixtures that reject incomplete/duplicate ledger rows and unauthorised visual deltas in `evals/fixtures/section-header-migration-ledger-check.ts`
- [ ] T013 Extend the eval runner with the SectionHeader v3 API and migration-ledger fixtures in `evals/run.ts`
- [ ] T014 Record the pre-mutation Figma source checkpoint and backup reference in `specs/026-simplify-section-header/proofs/figma-version-checkpoint.json`

**Checkpoint**: The source baseline is read-only, complete, version-pinned, and validation fails for missing evidence or implicit legacy mapping.

---

## Phase 3: User Story 1 - Composer un titre de section lisible (Priority: P1) 🎯 MVP

**Goal**: Publish a generic SectionHeader with only a rich title, eyebrow, explicit eyebrow visibility, and two alignment values with a centred default.

**Independent Test**: The v3 fixture accepts only `titre`, `accroche`, `afficherAccroche`, and `alignement`; new generic references render dark 40/50 at `centre` by default or at `gauche` when selected.

### Tests for User Story 1

- [ ] T015 [P] [US1] Add render assertions for v3 rich-text preservation and hidden/empty eyebrow spacing in `evals/fixtures/section-header-v3-render-check.ts`
- [ ] T016 [P] [US1] Add generated Figma-surface assertions for exactly `Alignement=Centre|Gauche` in `evals/fixtures/section-header-v3-figma-check.ts`

### Implementation for User Story 1

- [ ] T017 [US1] Replace the canonical generic API with `ds.section-header@3.0.0`, four props, two alignment values, and dark 40/50 standard title styling in `contracts/section-header.contract.json`
- [ ] T018 [US1] Update the SectionHeader generation rules to project the v3 field names, defaults, and two Figma variants from `scripts/generate-components.ts`
- [ ] T019 [US1] Document the breaking semver migration, removed generic CTA/emphasis axes, and explicit `accroche2` rename in `docs/02-contract-spec.md`
- [ ] T020 [US1] Regenerate the React, HTML, catalog, and Figma projections from canonical sources with `scripts/generate-components.ts`
- [ ] T021 [US1] Run generation, build, parity, v3 evals, TypeScript checks, and deterministic round-trip; archive command outputs in `specs/026-simplify-section-header/proofs/us1-reference-gates.json`

**Checkpoint**: A designer can create a standard generic header without choosing a specialised hierarchy or CTA layout.

---

## Phase 4: User Story 2 - Conserver des pages cohérentes après simplification (Priority: P1)

**Goal**: Migrate the 45 audited Figma usages only through reviewed ledger decisions and prove all non-product visual/content facts are unchanged.

**Independent Test**: Every ledger usage has a valid after record; non-product comparisons are identical and any Product difference is the sole reviewed intermediate-left/no-eyebrow/CTA delta.

### Tests for User Story 2

- [ ] T022 [P] [US2] Add strict comparison coverage that fails any changed non-product region, capture error, or dimension mismatch in `extract/figma/page-parity/compare.ts`
- [ ] T023 [P] [US2] Add product-region allowance coverage that rejects any delta beyond the ledger-approved area in `extract/figma/page-parity/ledger-check.ts`

### Implementation for User Story 2

- [ ] T024 [US2] Classify every generic-standard page use with explicit v2-to-v3 field mapping and no fallback for removed properties in `specs/026-simplify-section-header/inventory/migration-ledger.json`
- [ ] T025 [US2] Prepare the complete Figma reconciliation proposal, including each specialised route and named product delta, in `specs/026-simplify-section-header/proofs/figma-change-proposal.md`
- [ ] T026 [US2] Obtain and record explicit owner approval of the complete capture and reconciliation proposal before live mutation in `specs/026-simplify-section-header/proofs/owner-go.json`
- [ ] T027 [US2] Apply the owner-approved Figma reconciliation with the single designated writer and store the first live receipt in `specs/component-repairs/section-header/run-002/live-receipt-first.json`
- [ ] T028 [US2] Capture masters, uses, crops, and the same nine frames after application in `specs/026-simplify-section-header/proofs/after/manifest.json`
- [ ] T029 [US2] Compare before/after pages and use records, requiring identity except reviewed Products regions, in `specs/026-simplify-section-header/proofs/page-after/comparison.json`
- [ ] T030 [US2] Reconcile after facts into every ledger row, including content/rich-text/style/media/geometry/instance-link/page-context digests, in `specs/026-simplify-section-header/inventory/migration-ledger.json`

**Checkpoint**: The page migration is proof-backed; no unclassified or silently changed use remains.

---

## Phase 5: User Story 3 - Retrouver les rôles propres à chaque section (Priority: P2)

**Goal**: Give Hero, Presentation, Texte SEO, and Produits e-commerce their own title anatomy and preserve generic SectionHeader for standard headings only.

**Independent Test**: Generated references and Figma show direct owner titles at Hero 54/68, Presentation/Products 32/40, and Texte SEO 24/30, all left-aligned; only Products owns its CTA and has no eyebrow.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add contract/render fixtures proving each specialised owner no longer depends on a generic emphasis or CTA variant in `evals/fixtures/specialised-section-title-owner-check.ts`
- [ ] T032 [P] [US3] Add rich-text and geometry preservation fixtures for the four owner routes in `evals/fixtures/section-header-owner-migration-check.ts`

### Implementation for User Story 3

- [ ] T033 [P] [US3] Move Hero to a direct left light 54/68 title while retaining Hero-owned CTA anatomy in `contracts/hero.contract.json`
- [ ] T034 [P] [US3] Move Presentation to a direct left dark 32/40 title while retaining its owned composition in `contracts/presentation.contract.json`
- [ ] T035 [P] [US3] Move Texte SEO to a direct left dark 24/30 title without generic header anatomy in `contracts/texte-seo.contract.json`
- [ ] T036 [P] [US3] Create canonical `ds.produits-ecommerce@1.0.0` with direct left 32/40 title, absent eyebrow, and section CTA in `contracts/produits-ecommerce.contract.json`
- [ ] T037 [US3] Update contract references and supported consumer versions for the four direct owner routes in `contracts/section-header.contract.json`
- [ ] T038 [US3] Regenerate the specialised reference and Figma projections from the owner contracts with `scripts/generate-figma.ts`
- [ ] T039 [US3] Map the 21 specialised page records to direct owners and mark only Product rows as `authorized-product-delta` with approval references in `specs/026-simplify-section-header/inventory/migration-ledger.json`
- [ ] T040 [US3] Run specialised-owner visual/reference checks and archive the result in `specs/026-simplify-section-header/proofs/us3-specialised-owner-gates.json`

**Checkpoint**: Specialised title hierarchy is owned by the actual section, not by hidden generic-header variants.

---

## Phase 6: User Story 4 - Publier sans surprendre les administrateurs du site (Priority: P3)

**Goal**: Align Odoo’s supported current/new snippets with the new responsibilities while guaranteeing addon updates never rewrite saved page markup.

**Independent Test**: Odoo authoring exposes only each section’s role, Products is a real root, and a seeded saved-v2 page remains byte-for-byte intact after update while reported stale.

### Tests for User Story 4

- [ ] T041 [P] [US4] Add Odoo input/authoring fixtures that reject legacy SectionHeader decisions and require exhaustive Products decisions in `evals/fixtures/odoo-production/section-header-v3-cases.json`
- [ ] T042 [P] [US4] Add a seeded old-v2 saved-page update scenario that asserts unchanged stored DOM and `structure-stale` reporting in `integrations/odoo/qa/scenarios/section-header-v3-update.spec.mts`
- [ ] T043 [P] [US4] Add public, editor, save/reopen, isolation, responsive, and visual qualification for Products in `integrations/odoo/qa/scenarios/produits-ecommerce.spec.mts`
- [ ] T044 [P] [US4] Add the Products reference/Odoo visual subject with an allowed CTA/title composition in `integrations/odoo/qa/visual/subjects/produits-ecommerce.mts`

### Implementation for User Story 4

- [ ] T045 [US4] Narrow the generic QWeb helper to v3 title/eyebrow/visibility/alignment and remove generic CTA/emphasis branches in `integrations/odoo/addons/piqueray_ds/views/components.xml`
- [ ] T046 [US4] Render direct owner title anatomy for Hero, Presentation, Texte SEO, and Products in `integrations/odoo/addons/piqueray_ds/views/components.xml`
- [ ] T047 [US4] Register `ds.produits-ecommerce` as a canonical Odoo root and repin its version/hash with all affected contracts in `integrations/odoo/config/inputs.lock.json`
- [ ] T048 [US4] Create exhaustive Products authoring decisions and replace stale nested v2 decisions for existing consumers in `integrations/odoo/config/produits-ecommerce.authoring.json`
- [ ] T049 [US4] Re-address the generic/owner title decisions for Hero, Presentation, Texte SEO, FAQ, SAV, Coordonnées, and Réassurances in `integrations/odoo/config/hero.authoring.json`
- [ ] T050 [US4] Register every manual QWeb, editor JS, and XML adaptation marker for the migration and Products root in `integrations/odoo/config/adaptation-registry.json`
- [ ] T051 [US4] Update Odoo snippet registration and editor controls for Products without exposing removed generic controls in `integrations/odoo/addons/piqueray_ds/views/snippets.xml`
- [ ] T052 [US4] Keep version guard detection-only and report stale legacy structure without calling a replacement or DOM rewrite in `integrations/odoo/addons/piqueray_ds/static/src/js/version_guard.js`
- [ ] T053 [US4] Regenerate Odoo assets and Figma-link data from the repinned contracts with `scripts/odoo/build-assets.ts`
- [ ] T054 [US4] Run Odoo static gates plus all affected public/editor/save-reopen/visual scenarios; archive non-skipped receipts in `specs/026-simplify-section-header/proofs/odoo-qualification.json`

**Checkpoint**: New Odoo compositions have clear responsibilities, and persisted editor content remains untouched.

---

## Phase 7: Polish & Cross-Cutting Closure

**Purpose**: Prove the complete migration, documentation, and repeatability criteria.

- [ ] T055 [P] Update the migration contract and Odoo support boundary documentation in `specs/026-simplify-section-header/contracts/odoo-transition.md`
- [ ] T056 [P] Add the completed 45-use census, destination summary, and approved-delta count to `specs/026-simplify-section-header/proofs/migration-summary.md`
- [ ] T057 Run all repository gates (generate, build, parity, eval, plugin check, browser-core, TypeScript, Storybook, and visual extraction) and archive results in `specs/026-simplify-section-header/proofs/final-repository-gates.json`
- [ ] T058 Rerun generation, Figma reconciliation, use scan, ledger validation, page comparison, and Odoo derivation with unchanged inputs; record zero source/output/use/proof mutations in `specs/026-simplify-section-header/proofs/no-op-receipt.json`
- [ ] T059 Finalise the component-repair campaign only after successful no-op verification and archive the campaign decision in `specs/component-repairs/section-header/run-002/finalize-receipt.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: starts immediately in the dedicated worktree.
- **Foundational (Phase 2)**: depends on Setup and blocks all source/Figma/Odoo mutation.
- **US1 (Phase 3)**: depends on T005–T014; establishes the generic contract and generated reference.
- **US2 (Phase 4)**: depends on the frozen baseline and US1; T026 is an explicit owner gate before T027.
- **US3 (Phase 5)**: depends on US1 and the ledger; it supplies specialised contracts before their approved Figma reconciliation.
- **US4 (Phase 6)**: depends on US1 and US3 canonical contracts; it does not migrate saved Odoo pages.
- **Closure (Phase 7)**: depends on all desired stories and their successful qualification.

### User Story Dependencies

- **US1 (P1)**: prerequisite generic API; independently testable by contract and generated references.
- **US2 (P1)**: uses US1’s v3 mapping and is independently testable from its ledger/capture comparison.
- **US3 (P2)**: uses v3 only as the boundary; direct owner contracts may be implemented in parallel after the foundation.
- **US4 (P3)**: needs the settled generic and owner contracts, then qualifies Odoo independently with disposable QA data.

### Parallel Opportunities

- T003–T004, T007–T008, and T011–T012 affect separate evidence/test files.
- Within US1, T015–T016 can run together; within US3, T033–T036 can run together.
- Within US4, T041–T044 can run together; after contracts are settled, T045–T052 can be divided by QWeb, configuration, and version-guard ownership.
- Figma live application remains deliberately single-writer and must never be parallelised.

## Parallel Example: User Story 3

```text
Task: "Move Hero direct title anatomy in contracts/hero.contract.json"
Task: "Move Presentation direct title anatomy in contracts/presentation.contract.json"
Task: "Move Texte SEO direct title anatomy in contracts/texte-seo.contract.json"
Task: "Create Products owner in contracts/produits-ecommerce.contract.json"
```

## Implementation Strategy

### MVP First (US1)

1. Complete Setup and the evidence/test foundation.
2. Complete US1 to publish and prove the smaller generic API.
3. Validate v3 generation, parity, and contract fixtures before any live Figma write.

### Incremental Delivery

1. Add US2 only after a complete before-capture and owner approval; it delivers the audited page migration proof.
2. Add US3 to eliminate specialised generic variants in all reference surfaces.
3. Add US4 to qualify new/current Odoo snippets without touching persisted pages.
4. Close only after the second full no-op run is receipted.

## Notes

- Every task follows the required checkbox, sequential ID, optional `[P]`, story-label, and exact-path format.
- A blocked or ambiguous legacy combination remains `blocked` in the ledger; it must never default to centred generic output.
- Saved Odoo page migration is a separate, owner-approved feature and is not authorised by these tasks.
