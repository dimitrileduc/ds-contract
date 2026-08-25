---

description: "Actionable implementation tasks for governed responsive HeroVideo"
---

# Tasks: Rendre HeroVideo responsive

**Input**: Design documents from `/specs/027-responsive-hero-video/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [quickstart.md](quickstart.md), and [contracts/](contracts/)

**Tests**: Required. The specification demands adversarial contract/evaluator coverage, responsive geometry and visual comparisons, Odoo authoring/update scenarios, and deterministic second-run evidence. Create tests before their implementation task and make them fail first where a code path is new.

**Organization**: Tasks are grouped by user story. Human-gate tasks require an explicit owner decision and block the downstream phase; they are not approvals an implementer may self-grant.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes different files and has no unfinished prerequisite.
- **[Story]**: User story traceability label.
- Every task names the precise file that is created, changed, or recorded.

## Path Conventions

- Contract and generator sources are rooted at the repository root.
- Generated web, Figma, catalog, and Odoo files are regenerated; do not hand-edit them.
- Feature decisions, inventories, proofs, and reusable validation tools live under `specs/027-responsive-hero-video/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish a clean, pinned implementation boundary and the common artifacts used by all gates and validation runners.

- [ ] T001 Create a clean dedicated `027-responsive-hero-video` worktree, run `npm install` and `npx playwright install chromium` inside it, verify the versioned visual-parity baseline is available there, and record the Git/Figma source pins, bootstrap results, master `2151:5552`, historical key, and Home instance `2170:6351` in `specs/027-responsive-hero-video/inventory/worktree-pin.json`
- [ ] T001A Before any fixture, modeling, or coding decision, consult the applicable handoffs, `docs/responsive-figma.md`, `docs/FIGMA-CAPABILITY-MATRIX.md`, page-parity, and Odoo documentation through auggie; record the consulted documents, questions, verbatim governing answers, and applicability in `specs/027-responsive-hero-video/inventory/docs-first-receipt.md`
- [ ] T002 Create the single-writer HeroVideo campaign with the allowlist, `pageWrites: []`, before/after/idempotence capture targets, and bridge receipt locations in `specs/component-repairs/hero-video/run-002/campaign.json`
- [ ] T003 [P] Define the canonical default, long-title, long-CTA, poster, unavailable-video, four-witness, thirteen-width, and short-landscape fixtures in `specs/027-responsive-hero-video/tools/responsive-fixtures.ts`
- [ ] T004 [P] Document the required artifact naming, exact-viewport, SHA-256, freshness, and surface-pair conventions in `specs/027-responsive-hero-video/proofs/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Supply deterministic decision, artifact, and evidence tooling before any responsive design or source mutation.

**⚠️ CRITICAL**: No user-story implementation begins until this phase is complete. These tools enforce the claims rule and preserve one evidence vocabulary across Figma, web, and Odoo.

- [ ] T005 Implement JSON-schema validation plus feature/profile invariants for H2 owner decisions in `specs/027-responsive-hero-video/tools/validate-decision.ts`
- [ ] T006 [P] Implement freshness, SHA-256, exact-dimension, fixture-condition, and duplicate-pair checks for captured artifacts in `specs/027-responsive-hero-video/tools/validate-artifacts.mts`
- [ ] T007 [P] Implement the proof-ledger assembler/validator that requires H1–H4, protected facts, probes, eight witness comparisons, the 1440-wide continuity check, Odoo qualification, and first/second runs in `specs/027-responsive-hero-video/tools/validate-proof-ledger.mts`
- [ ] T008 Add reproducible `hero-video:options`, `hero-video:decision:check`, `hero-video:responsive:check`, and `hero-video:ledger:check` commands that invoke the feature tools in `package.json`

**Checkpoint**: A clean self-sufficient feature worktree, a Docs-First receipt, a page-write-free campaign, fixed fixtures, and deterministic validators exist before the owner is asked to review any design decision.

---

## Phase 3: User Story 1 — Co-concevoir et valider Mobile et Desktop (Priority: P1) 🎯 MVP

**Goal**: Protect the accepted 1728 XL baseline, present comparable Mobile/Desktop options without source mutation, and obtain authoritative H1 and H2 decisions.

**Independent Test**: A separate designer can use the H2 record and its option packet to reproduce compact, Desktop, and unchanged wide behavior at 390, 834, 1200, and 1728 without inferring undecided values.

### Tests for User Story 1

- [ ] T009 [P] [US1] Add an evaluator fixture that rejects an option packet missing a composition field, fixed breakpoint probe, long-content case, or explicit tradeoff in `evals/fixtures/responsive-hero-video/option-packet-check.ts`
- [ ] T010 [US1] Register the option-packet fixture in the deterministic evaluator manifest in `evals/run.ts`

### Implementation for User Story 1

- [ ] T011 [US1] Run the read-only master/Home/Container audit and store identity-, position-, property-, media-, link-, and override-addressed findings in `specs/027-responsive-hero-video/inventory/H1-fresh-audit.json`
- [ ] T012 [US1] Capture non-empty master, Home-instance, and Home-plus-Header before evidence with their protected-fact digests in `specs/027-responsive-hero-video/proofs/H1-before.manifest.json`
- [ ] T013 [US1] Classify all differences between the new audit and supporting historical evidence as preserved baseline, approved delta, or pre-existing defect in `specs/027-responsive-hero-video/inventory/H1-baseline-delta.md`
- [ ] T014 [US1] Obtain and record the explicit owner H1 acceptance/refusal, evidence consulted, tradeoffs, rejected/deferred topics, and next authorized step in `specs/027-responsive-hero-video/decisions/H1-baseline.json`
- [ ] T015 [US1] Implement the non-authoritative Mobile/Desktop option renderer that consumes the fixed fixtures and never writes Figma in `specs/027-responsive-hero-video/tools/build-option-packet.ts`
- [ ] T016 [US1] Generate two or three comparable options with 320/390/834/1200/1728, short-landscape, 991/992/993, and 1399/1400/1401 probes in `specs/027-responsive-hero-video/inventory/H2-option-packet.md`
- [ ] T017 [US1] Validate the selected profile, witnesses, compact/Desktop values, governed styles, CTA/media choices, and rejected alternatives against the decision schema in `specs/027-responsive-hero-video/decisions/H2-responsive.json`
- [ ] T018 [US1] Obtain and record the explicit owner H2 acceptance/refusal that authorizes only the selected Figma-source adaptation in `specs/027-responsive-hero-video/decisions/H2-responsive.json`

**Checkpoint**: H1 and H2 are accepted, the 992/1400 profile is fixed, Tablet 834 is explicitly compact, and no contract, Figma, web, or Odoo mutation has happened before this point.

---

## Phase 4: User Story 2 — Préserver le HeroVideo XL et ajouter un vrai Desktop (Priority: P1)

**Goal**: Safely introduce the owner-approved Desktop composition in Figma while retaining the historical wide member, identity, Home linkage, and all protected facts.

**Independent Test**: The source shows approved Desktop at 1200 and unchanged wide at 1728/1440; the historic key/node, poster, scrims, Button, properties, Home main-component link, and overrides retain their recorded addresses.

### Tests for User Story 2

- [ ] T019 [P] [US2] Add an adversarial fixture for standalone-component-to-set migration that rejects historical-key/node loss, unplaced image paint, lost nested Button, relinked Home instance, override drift, duplicate Container, or Page write in `evals/fixtures/figma-projection-repair/hero-video-responsive-set-preservation-check.ts`
- [ ] T020 [US2] Register the HeroVideo migration-preservation fixture in `evals/run.ts`

### Implementation for User Story 2

- [ ] T020A [US2] After H2 and immediately before any Figma write, re-audit the historical master and every usage by identity and position; record the clean result or an owner-approved cleanup plus re-audit, and refuse the campaign while any source fact remains unclean in `specs/027-responsive-hero-video/inventory/H2-pre-mutation-source-cleanliness.json`
- [ ] T021 [US2] Configure the approved wide member and Desktop composition, their anchors, and only their allowlisted transition operations in `specs/component-repairs/hero-video/run-002/campaign.json`
- [ ] T022 [US2] Implement the isolated, non-authoritative migration spike that proves a standalone-to-set transition keeps all recorded protected facts in `specs/027-responsive-hero-video/tools/prove-figma-transition.mts`
- [ ] T023 [US2] Run the campaign snapshot/preflight/dry-run and store the no-Page-write, protected-fact, and expected-transition receipt in `specs/027-responsive-hero-video/proofs/US2-figma-preflight.json`
- [ ] T024 [US2] Emit, bridge, normalize, and record the first allowlisted Desktop/wide Figma application in `specs/component-repairs/hero-video/run-002/apply-first.json`
- [ ] T025 [US2] Capture and review 1200 Desktop plus 1440/1728 wide geometry, media/scrim coverage, overflow, and protected-fact continuity in `specs/027-responsive-hero-video/proofs/US2-desktop-wide-review.json`

**Checkpoint**: The historical component remains the live wide member and Desktop has a reviewed 1200 witness; the shared Figma write zone remains reserved for the compact work in US3.

---

## Phase 5: User Story 3 — Offrir une vraie composition mobile (Priority: P1)

**Goal**: Complete the owner-approved compact composition in the same controlled Figma campaign and accept its four explicit design witnesses without inventing a Tablet variant.

**Independent Test**: Compact renders as approved at 320, 390, and 834 for default/long content and short landscape; title/CTA remain accessible and centered within 2 px when content fits, with poster fallback when video is unavailable.

### Tests for User Story 3

- [ ] T026 [P] [US3] Add an adversarial compact-composition fixture that rejects a fourth Tablet state, hidden/cropped long content, ungoverned text style, unsafe CTA placement, and missing poster fallback in `evals/fixtures/figma-projection-repair/hero-video-responsive-compact-check.ts`
- [ ] T027 [US3] Register the compact-composition fixture in `evals/run.ts`

### Implementation for User Story 3

- [ ] T025A [US3] Before the compact Figma write, repeat the identity/position audit of the master and every usage, record a clean result or an owner-approved cleanup plus re-audit, and refuse the compact operation while any source fact remains unclean in `specs/027-responsive-hero-video/inventory/H3-pre-compact-source-cleanliness.json`
- [ ] T028 [US3] Add the approved compact composition and explicit Mobile-390/Tablet-834 witness presentation rules to `specs/component-repairs/hero-video/run-002/campaign.json`
- [ ] T029 [US3] Implement exact viewport, active-composition, bounds, coverage, crop, overflow, overlap, accessibility, and centering measurement for the local reference harness in `specs/027-responsive-hero-video/tools/validate-responsive.mts`
- [ ] T030 [US3] Capture the four post-mutation Figma witnesses, including default and long-content/short-height checks, and document Figma's explicit mode/variant limitation in `specs/027-responsive-hero-video/proofs/H3-figma-witnesses.manifest.json`
- [ ] T031 [US3] Obtain and record the explicit owner H3 acceptance/refusal of Mobile-390, Tablet-834 compact, Desktop-1200, XL-1728, and the named Figma limitation in `specs/027-responsive-hero-video/decisions/H3-figma-source.json`

**Checkpoint**: H3 is accepted only after all four witnesses are valid. Contract promotion and every generated-surface change remain forbidden until then.

---

## Phase 6: User Story 4 — Maintenir une seule décision responsive sur toutes les surfaces (Priority: P2)

**Goal**: Promote only approved H2/H3 facts into an additive generic contract capability and deterministically lower it into every visitor surface without a public `viewport` prop.

**Independent Test**: One reviewed `ds.hero-video` responsive block yields compact `<992`, Desktop `992–1399`, and wide `>=1400` in React, HTML, inline React, Web Components, Figma projection, and Odoo CSS; a second reconciliation of accepted H3 is a strict no-op.

### Tests for User Story 4

- [ ] T032 [P] [US4] Add schema fixtures for optional generic responsive blocks, base `0`, sorted unique 992/1400 thresholds, effective adjacent deltas, governed parts/styles, witnesses, and rejection of public `viewport`/device props in `evals/fixtures/responsive-contract-schema-check.ts`
- [ ] T033 [P] [US4] Add lowering fixtures for 991/992/993 and 1399/1400/1401 selection, mobile-first scoped media rules, and inline-style refusal or extraction in `evals/fixtures/responsive-lowering-check.ts`
- [ ] T034 [P] [US4] Add Figma projection fixtures that require an explicit approved Auto Layout/mode/variant presentation and reject a claimed resize breakpoint or unprojected code-only channel in `evals/fixtures/hero-video-responsive-figma-projection-check.ts`
- [ ] T035 [US4] Register the responsive schema, lowering, and Figma projection fixtures in `evals/run.ts`

### Implementation for User Story 4

- [ ] T036 [US4] Extend the generic contract types and Zod validation with the optional `responsive` capability, bounded part overrides, source profile, ordered compositions, witnesses, and semantic refusals in `packages/schema/src/contract-schema.ts`
- [ ] T037 [US4] Implement the pure shared responsive lowering compiler for compact base rules and deterministic 992/1400 media deltas in `core/compile-responsive.ts`
- [ ] T038 [US4] Apply the shared lowering to HTML, React CSS Modules, and inline React (using scoped deterministic `<style>` or refusing unsupported output) in `core/emit-html.ts`, `core/emit-react.ts`, and `core/emit-react-inline.ts`
- [ ] T039 [US4] Apply the shared lowering to the Shadow-DOM stylesheet and reject unrepresentable responsive output in `packages/emitter-web-components/src/emit-wc.ts`
- [ ] T040 [US4] Project the accepted Design mechanism and anchors without claiming automatic resize behavior in `core/emit-figma-script.ts` and `scripts/generate-figma.ts`
- [ ] T041 [US4] Promote only H2/H3-approved compact/Desktop/wide facts, retain the existing public content API, preserve the historical wide anchor, and apply the minor contract version bump in `contracts/hero-video.contract.json`
- [ ] T042 [US4] Document the additive responsive vocabulary, projection limits, and semver rule in `docs/02-contract-spec.md`, `docs/responsive-figma.md`, and `docs/FIGMA-CAPABILITY-MATRIX.md`
- [ ] T043 [US4] Regenerate the contract schema, web references, component source, Figma sync, catalog, and Odoo derived CSS in `contracts/contract.schema.json`, `src/components/HeroVideo/HeroVideo.module.css`, `core/samples/hero-video.css`, `figma-sync/32-herovideo.js`, `catalog/components/hero-video.json`, and `integrations/odoo/addons/piqueray_ds/static/src/css/generated/components.pqr.css`
- [ ] T044 [US4] Run `schema`, `generate`, `figma:plan`, `catalog`, `build`, emitter checks, `parity`, `eval`, `plugin:check`, deterministic roundtrip, `core-browser-check`, both TypeScript checks, and Storybook from the pinned worktree; record generated-file cleanliness plus H3-source reconciliation results in `specs/027-responsive-hero-video/proofs/US4-contract-projection.json`
- [ ] T044A [US4] Execute the generated-reference matrix at 320, 390, 834, 991, 992, 993, 1024, 1200, 1399, 1400, 1401, 1440, and 1728 plus short landscape with default/long and unavailable-video fixtures; persist exact viewport, root width, active composition, bounds, coverage, crop, overflow, overlap, CTA accessibility, and centering results in `specs/027-responsive-hero-video/proofs/US4-reference-responsive-matrix.json`
- [ ] T044B [US4] Produce fresh matched-condition Figma↔reference visual pairs for 390/834/1200/1728 and a separate 1440-wide continuity comparison, require each delta to stay below 2% or carry an owner-approved exclusion, and record them in `specs/027-responsive-hero-video/proofs/US4-figma-reference-visual.json` and `specs/027-responsive-hero-video/proofs/US4-wide-1440-continuity.json`

**Checkpoint**: The contract is the sole reviewed source of responsive behavior, all generated visitor surfaces select by browser viewport, the complete reference matrix and Figma↔reference chain are fresh, and reconciliation makes no unapproved mutation to the accepted Figma source.

---

## Phase 7: User Story 5 — Conserver l’édition et le rendu dans le site administrable (Priority: P3)

**Goal**: Apply generated scoped responsive CSS to the current saved Odoo HeroVideo DOM while preserving its authoring controls, instance isolation, and update safety.

**Independent Test**: On a disposable Odoo QA database, two instances retain isolated poster/alt/title/CTA edits after save/reopen; public and editor iframe both pass the responsive matrix, and `odoo -u` leaves saved `outerHTML` byte-identical.

### Tests for User Story 5

- [ ] T045 [P] [US5] Add functional authoring/save/reopen/two-instance-isolation and public/editor exact-viewport matrix coverage in `integrations/odoo/qa/scenarios/hero-video.spec.mts`
- [ ] T046 [P] [US5] Add update coverage that hashes saved HeroVideo DOM before/after `odoo -u`, distinguishes `structure-stale`, and rejects silent migration in `integrations/odoo/qa/scenarios/hero-video-update.spec.mts`
- [ ] T047 [P] [US5] Extend the hero-video visual scenario and subject with four exact witnesses, fixture digests, reference-to-Odoo comparisons, and the <2% limit in `integrations/odoo/qa/scenarios/hero-video-visual.mts` and `integrations/odoo/qa/visual/subjects/hero-video.mts`

### Implementation for User Story 5

- [ ] T048 [US5] Preserve the one-root, one-poster, two-scrim, one-title, and one-focusable-Button QWeb anatomy; add only any H2-approved stable placement marker needed by generated CSS in `integrations/odoo/addons/piqueray_ds/views/components.xml`
- [ ] T049 [US5] Keep authoring limited to poster/alt/title/CTA label/href and explicitly omit video, responsive selection, duplicate content, and structural controls in `integrations/odoo/config/hero-video.authoring.json`
- [ ] T050 [US5] Update the Odoo contract-root pin, graph digest, version metadata, and 1:1 manual-adaptation registry entries only after the reviewed H3 contract change in `integrations/odoo/config/inputs.lock.json`, `integrations/odoo/config/adaptation-registry.json`, and `integrations/odoo/addons/piqueray_ds/__manifest__.py`
- [ ] T051 [US5] Generate and verify root-scoped HeroVideo media rules without editing the generated asset or global bridge/grid/container selectors in `scripts/odoo/build-assets.ts` and `integrations/odoo/addons/piqueray_ds/static/src/css/generated/components.pqr.css`
- [ ] T052 [US5] Run static Odoo gates plus disposable public/editor, persistence, isolation, update, and visual scenarios; store their exact viewports, captures, comparisons, and classification in `specs/027-responsive-hero-video/proofs/US5-odoo-qualification.json`

**Checkpoint**: Odoo remains content-editable but never composition-configurable; its saved markup is unchanged by update, or the work honestly stops as `structure-stale` pending a separate migration decision.

---

## Phase 8: User Story 6 — Capitaliser le pilote pour un futur workflow réutilisable (Priority: P4)

**Goal**: Close only on linked H1–H4 evidence and produce a reusable, non-generalizing account of the HeroVideo pilot.

**Independent Test**: A maintainer without oral context can locate each human decision, mechanical check, refusal condition, protected fact, visual pair, Odoo qualification, second-run result, and documented limit, without finding a claim that a `component-to-responsive` skill already exists.

### Tests for User Story 6

- [ ] T053 [P] [US6] Add ledger fixtures that reject a missing H1–H4 gate, probe-matrix case, Figma↔reference pair, 1440-wide continuity check, stale/missing/repeated visual pair, invalid protected fact, failed Odoo qualification, non-empty second-run mutation, or unapproved exclusion in `evals/fixtures/responsive-proof-ledger-check.ts`
- [ ] T054 [US6] Register the proof-ledger fixture in `evals/run.ts`

### Implementation for User Story 6

- [ ] T055 [US6] Assemble source pins, decisions, protected facts, the complete reference matrix, eight witness visual comparisons, the separate 1440-wide continuity check, Odoo qualification, and first-run evidence into the schema-valid ledger in `specs/027-responsive-hero-video/proofs/proof-ledger.json`
- [ ] T056 [US6] Rerun deterministic build and Figma reconciliation with unchanged inputs, capture zero generated-file/node/duplicate/Page-write deltas, and record the required second-run no-op in `specs/027-responsive-hero-video/proofs/idempotence-second-run.json`
- [ ] T057 [US6] Obtain and record explicit H4 acceptance/refusal, reviewed evidence, accepted tradeoffs, deferred topics, and closure authorization in `specs/027-responsive-hero-video/decisions/H4-convergence.json`
- [ ] T058 [US6] Write the pilot dossier separating human gates, mechanical controls, inputs/outputs, stop conditions, refusals, limits, and future-specification candidates (without creating a skill) in `specs/027-responsive-hero-video/capitalization/README.md`

**Checkpoint**: H4 is accepted only after all ledgers and no-op receipts are valid; the capitalization dossier is evidence for a later specification, not an implementation of a new skill.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Execute the complete closure sweep, make scope compliance reviewable, and preserve the final receipts.

- [ ] T059 From the pinned worktree, rerun the complete constitutional suite: `schema`, `generate`, `figma:plan`, `catalog`, `build`, emitter checks, `parity`, `eval`, `plugin:check`, deterministic roundtrip, `core-browser-check`, both TypeScript checks, and Storybook; record commands, pins, digests, and outcomes in `specs/027-responsive-hero-video/proofs/final-gates.json`
- [ ] T060 [P] Verify that only `ds.hero-video`, its direct `ds.button` dependency where owner-approved, the protected Home usage, and their declared generated outputs changed; record all exclusions in `specs/027-responsive-hero-video/proofs/scope-and-protected-facts-review.md`
- [ ] T061 Validate every referenced decision, ledger, artifact manifest, and capitalization link from the completed quickstart flow in `specs/027-responsive-hero-video/proofs/quickstart-validation.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts by making the dedicated worktree self-sufficient and recording the Docs-First consultation.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user-story work.
- **US1 (Phase 3)**: Depends on Foundational; H1 must precede the local option packet, and H2 must be accepted before any source mutation.
- **US2 (Phase 4)**: Depends on accepted H2 and a fresh clean-source receipt from T020A; owns the first portion of the sole Figma write zone.
- **US3 (Phase 5)**: Depends on US2's protected migration and the repeated clean-source receipt from T025A; it owns the remaining compact/witness work in that same write zone, and H3 closes only after both stories' Figma evidence is valid.
- **US4 (Phase 6)**: Depends on accepted H3; contract promotion and all generated surfaces start here.
- **US5 (Phase 7)**: Depends on US4's reviewed contract, generated Odoo CSS, and its completed reference matrix/Figma↔reference evidence.
- **US6 (Phase 8)**: Depends on US5 and all required proofs, including the 1440 continuity check; H4 follows a valid ledger and strict second run.
- **Polish (Phase 9)**: Depends on every desired story and an accepted H4.

### User Story Dependencies

```text
Setup → Foundation → US1 (H1 → H2)
                      ↓
             US2 clean-source gate + Desktop/wide Figma
                      ↓  (one Figma write zone)
                 US3 clean-source gate + compact + H3
                      ↓
                 US4 contract + generated surfaces
                      ↓
                 US5 Odoo qualification
                      ↓
                 US6 ledger + no-op + H4 → Polish
```

The equal P1 stories are deliberately serial: H2 authorizes source work, US2 protects the historical wide transition, and US3 completes the same single-writer Figma campaign before H3. Contract and Odoo work may not bypass those human gates.

### Within Each User Story

- Test/evaluator fixture tasks precede the implementation task they protect.
- Capture/audit evidence precedes the gate that relies on it.
- A human-gate receipt must be accepted before the task it authorizes.
- Generated files are regenerated from contract sources and never hand-edited.

## Parallel Opportunities

- Setup: T003 and T004 can proceed in parallel after T001, T001A, and T002 establish scope.
- Foundation: T006 and T007 can proceed in parallel after fixtures exist; T005 and T008 are sequential integration points.
- US4: T032, T033, and T034 can be written independently; T036–T041 then converge on the shared schema/compiler/emitter chain; T044A/T044B run after successful regeneration and gates.
- US5: T045, T046, and T047 are independent test files; they must finish before T048–T051 change the Odoo implementation/derivation path.
- US6: T053 can proceed while final US5 captures are collected; T054–T058 remain sequential.
- No parallel Page/Figma writer is permitted: T020A/T021/T024/T025A/T028/T030 are serialized by the single HeroVideo campaign.

## Parallel Example: User Story 5

```text
# Independent test files, written before Odoo implementation:
Task: "Add editor/public/responsive matrix coverage in integrations/odoo/qa/scenarios/hero-video.spec.mts"
Task: "Add non-destructive update coverage in integrations/odoo/qa/scenarios/hero-video-update.spec.mts"
Task: "Extend exact-witness visual coverage in integrations/odoo/qa/scenarios/hero-video-visual.mts and integrations/odoo/qa/visual/subjects/hero-video.mts"

# Then serially preserve DOM, authoring, pins, and generated CSS:
Task: "Preserve QWeb anatomy in integrations/odoo/addons/piqueray_ds/views/components.xml"
Task: "Limit authoring in integrations/odoo/config/hero-video.authoring.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational phases.
2. Complete US1 through an accepted H1 baseline and H2 owner decision.
3. Stop: the responsive design is authoritative but no live source has been mutated.
4. Validate that the option packet independently reproduces the three intended compositions and gives a clear refusal path for unresolved values.

### Incremental Delivery

1. H1/H2 establish a safe baseline and selected design.
2. US2 + US3 establish accepted Figma Desktop, compact, and wide witnesses (H3).
3. US4 produces one deterministic contract and generated reference surfaces.
4. US5 qualifies the non-destructive Odoo projection.
5. US6 assembles evidence, proves no-op behavior, obtains H4, and captures reusable lessons.

### Parallel Team Strategy

1. One owner/reviewer and one Figma writer handle the gated source campaign.
2. After H3, separate contributors can prepare schema/lowering fixtures, Odoo QA fixtures, and documentation, but contract/emitter integration stays coordinated through the shared compiler.
3. Run final generation, validation, reconciliation, and ledger assembly serially from the same pinned inputs.

## Notes

- `[P]` tasks touch distinct files and can be worked independently only after their listed dependencies are satisfied.
- H1–H4 are explicit human decisions; an absent or refused receipt stops the corresponding downstream phase. T020A is an additional non-negotiable source-cleanliness stop before any Figma write.
- Tablet 834 remains a compact witness, not a fourth composition.
- Browser `window.innerWidth`, not a root width or padded clip, is authoritative for every responsive case.
- The task list does not authorize Page writes, modification of Header/global Bootstrap/grid/container behavior, silent saved-markup migration, or creation of the future `component-to-responsive` skill.
