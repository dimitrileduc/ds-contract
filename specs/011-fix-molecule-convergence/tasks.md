---
description: "Executable task list for the 011 molecule-convergence campaign"
---

# Tasks: Réparer la convergence des dernières molécules

**Input**: Design documents from /specs/011-fix-molecule-convergence/
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, and contracts/

**Tests**: Tests are required where the feature adds or changes a generic emitter, comparison, campaign-validation, attribution mechanism, or inherited parity recovery. They must be written and registered before the implementation that makes them pass.

**Organization**: Tasks are grouped by user story so the evidence campaign, contract cause, measurement integrity, and safe closure can be implemented and reviewed separately.

## Path Conventions

- Contract sources: contracts/*.contract.json; schema source: packages/schema/src/contract-schema.ts.
- Generated output: src/components/, figma-sync/, catalog/, core/samples/, and contracts/contract.schema.json; never edit these by hand.
- Visual-campaign source: extract/figma/visual-parity/; feature evidence: specs/011-fix-molecule-convergence/proofs/.
- Figma access is GET-only. The campaign may write only its bounded feature proof directory and test-only fixture assets.
- The terminal provenance snapshot excludes only its own receipts, specs/011-fix-molecule-convergence/proofs/attribution/final.json and specs/011-fix-molecule-convergence/proofs/closure/gates.json.

## Phase 1: Setup (Worktree, Attribution, and Inherited-Gate Recovery)

**Purpose**: Make the feature worktree independently testable, preserve a non-destructive record of the shared WIP, and clear the known global-token drift before any 011 source change.

- [X] T001 Provision this worktree from package.json with npm install and Playwright Chromium, then record the exact gate environment and receipts in specs/011-fix-molecule-convergence/proofs/attribution/worktree-gates.md
- [X] T002 Capture HEAD, the complete worktree status, checkpoint/WIP commits, and in-scope path hashes without modifying tracked work in specs/011-fix-molecule-convergence/proofs/attribution/initial.json
- [X] T003 Reproduce baseline-parity-clean, baseline-acknowledges-without-failing, promotion-converges, and detect-icon-registry-divergence and record their parity findings, commands, and source hypotheses in specs/011-fix-molecule-convergence/proofs/attribution/inherited-gates.json
- [X] T004 [P] Create a fixture that fails when the immutable Figma token reference omits Primitives/border-width/1 in evals/fixtures/primitives-border-width-parity-check.ts
- [X] T005 Register the border-width recovery fixture before its reference refresh in evals/run.ts
- [X] T006 Refresh parity/snapshots/figma-tokens.json only from a pinned Figma GET receipt, then prove all named evals pass and append the receipt hashes to specs/011-fix-molecule-convergence/proofs/attribution/inherited-gates.json

**Checkpoint**: The worktree baseline is preserved, the Figma token reference is GET-derived, and every named inherited eval is green without a waiver or canvas mutation.

---

## Phase 2: Foundational (Campaign Contracts and Shared Guards)

**Purpose**: Establish the reusable campaign input model and failure guards that block all four stories until invalid coverage, unsafe output paths, or false evidence is rejected.

**⚠️ CRITICAL**: Complete this phase before starting feature evidence, contract changes, measurement changes, or closure work.

- [X] T007 [P] Create adversarial campaign-schema and output-boundary checks in evals/fixtures/visual-campaign-schema-check.ts
- [X] T008 [P] Create adversarial evidence-integrity checks for missing coverage, stale references, invalid assets, and incomplete artifact sets in evals/fixtures/visual-evidence-integrity-check.ts
- [X] T009 Implement the versioned campaign, coverage, receipt, and result validation model from the feature interfaces in extract/figma/visual-parity/campaign.ts
- [X] T010 Register the new foundational campaign and evidence fixtures in evals/run.ts
- [X] T011 Add --campaign and bounded --out argument validation, mutual exclusion with legacy subject filters, and legacy-mode preservation in extract/figma/visual-parity/run.ts

**Checkpoint**: The runner can refuse malformed campaigns, unsafe destinations, and incomplete evidence before it touches Figma or writes artifacts.

---

## Phase 3: User Story 1 - Valider chaque molécule sur une preuve visuelle probante (Priority: P1) 🎯 MVP

**Goal**: Produce a deterministic, exact-coverage visual campaign for Carte, Field, MemberCard, NavItem, ProductCard, Realisation, and Tab, with inspectable evidence for every required case.

**Independent Test**: Run the 011 campaign and inspect proofs/visual/result.json: it contains exactly seven subjects, no missing or unexpected facts, every alias declares equality fingerprints, and every passing case supplies visible Figma/generated images, a diff, a triptych, metadata, and a score at or below 2.5%.

### Tests for User Story 1

- [X] T012 [P] [US1] Create the exact-seven-subject, fact-union, asset-reference, immutable-node, and alias-equality coverage test in evals/fixtures/visual-campaign-011-coverage-check.ts
- [X] T013 [US1] Register the 011 coverage fixture in evals/run.ts

### Implementation for User Story 1

- [ ] T014 [US1] Populate the immutable seven-subject case matrix, canonical case IDs, explicit aliases with fact/image/geometry/semantic equality fingerprints, observed Figma properties, code presets, required regions, semantic assertions, and attribution pins in specs/011-fix-molecule-convergence/contracts/visual-campaign.json
  - Census reconciliation: all real Carte (36), MemberCard (16), ProductCard (8, all Bouton=false), and Realisation (27) occurrences are explicit cases and all 74 subject/image refs are materialized from bounded GET receipts. Carte’s nested CTA labels and glyphs are now projected from the read-only occurrence census through contract code-only props. T014 remains open for eight absent Field combinations, unproved observed Saisie content, MemberPicture’s non-bindable shared base plane, and ProductCard Bouton=true without an immutable instance. Nav/Tab references are pinned; no unproved aliases are declared.
- [X] T015 [P] [US1] Validate the pinned Figma file version, concrete node IDs, and observed case properties with read-only GET receipts in extract/figma/visual-parity/figma-api.ts
- [X] T016 [P] [US1] Extend the test-only image receipt inventory for every required Carte, MemberCard, ProductCard, and Realisation case in extract/figma/visual-parity/fixture-assets/manifest.json
- [X] T017 [US1] Verify byte length, media type, SHA-256, decoded dimensions, and bounded writes while materializing only campaign fixture assets in extract/figma/visual-parity/fixture-assets/fetch.mjs
- [X] T018 [US1] Resolve campaign $asset values into comparison-only props and reject absent, undecodable, or invisible required images in extract/figma/visual-parity/render.ts
- [X] T019 [US1] Compute the declared Figma/contract fact union and reject missing or unexpected cases plus aliases without exact equality fingerprints in extract/figma/visual-parity/campaign.ts
- [X] T020 [US1] Write per-case reference, generated, diff, triptych, metadata, deterministic result.json, the traceability REPORT.md, and the seven-verdict review index under specs/011-fix-molecule-convergence/proofs/visual/ from extract/figma/visual-parity/run.ts
- [X] T021 [US1] Execute the initial read-only feature campaign and retain its exact coverage, evidence, and named blocked conditions in specs/011-fix-molecule-convergence/proofs/visual/result.json

**Checkpoint**: The seven targets have a complete, inspectable proof campaign; missing Figma instances such as ProductCard bouton=true remain explicitly blocked rather than silently waived.

---

## Phase 4: User Story 2 - Faire du contrat la cause vérifiable du rendu généré (Priority: P1)

**Goal**: Promote each visual and semantic fact into contract sources or a named limit, then regenerate all affected surfaces without hand-editing generated output.

**Independent Test**: For each target, regenerate from its changed contract and verify that the emitted DOM, HTML, React-inline projection, Figma plan, and visual-campaign props derive from the contract rather than from a capture-specific patch.

### Tests for User Story 2

- [X] T022 [P] [US2] Create a fixture-first regression for a Field slotted control receiving fill width and state-derived ARIA attributes in evals/fixtures/field-slotted-control-semantics-check.ts
- [X] T023 [P] [US2] Create a fixture-first regression for contract-declared attribute mappings used by NavItem and Tab in evals/fixtures/semantic-attribute-map-check.ts
- [X] T024 [P] [US2] Create a fixture-first regression for scalar parent-to-child propagation while preserving the child component boundary in evals/fixtures/component-scalar-propagation-check.ts
- [X] T025 [US2] Register the new emitter and semantic fixtures in evals/run.ts

### Implementation for User Story 2

- [X] T026 [US2] Add only optional schema vocabulary for typed attribute mappings and scalar composed-child props in packages/schema/src/contract-schema.ts
- [X] T027 [US2] Emit validated attribute mappings, slotted-control semantics, and scalar composed-child props consistently across core/emit-react.ts, core/emit-react-inline.ts, core/emit-html.ts, and core/emit-figma-script.ts
- [X] T028 [P] [US2] Promote Carte’s two dispositions, fluid geometry, CTA content, and typed rich-text segments with a semver-major version change in contracts/carte.contract.json
- [X] T029 [P] [US2] Promote Field’s restricted child slot, FILL behavior, state semantics, and 12-case inputs in contracts/field.contract.json
- [X] T030 [P] [US2] Preserve MemberPicture composition while adding explicit code-only photo props and parent-to-child propagation in contracts/member-card.contract.json and contracts/member-picture.contract.json
- [X] T031 [P] [US2] Define NavItem’s href, active-state aria-current, chevron/active facts, and dark-surface-compatible composition in contracts/nav-item.contract.json
- [X] T032 [P] [US2] Define ProductCard’s image and alt facts with bouton=false as the observed default and no runtime fixture default in contracts/product-card.contract.json
- [X] T033 [P] [US2] Define Realisation’s size-specific image/alt facts and preserve its image-bearing anatomy in contracts/realisation.contract.json
- [X] T034 [P] [US2] Define Tab’s selected state, panel identity, aria-selected, aria-controls, tabIndex, and bounded tablist/roving-focus context in contracts/tab.contract.json
- [X] T035 [US2] Document the new public optional schema vocabulary and semver rules in docs/02-contract-spec.md
- [X] T036 [US2] Regenerate the schema and all contract-derived outputs from sources only in contracts/contract.schema.json, src/components/, figma-sync/, catalog/, and core/samples/

**Checkpoint**: Contract diffs, not generated-file edits, fully explain the component and semantic changes needed by the campaign.

---

## Phase 5: User Story 3 - Mesurer fidèlement les cas difficiles sans faux vert (Priority: P1)

**Goal**: Make the comparison instrument reject invisible, geometry-mismatched, region-failing, masked, and incomplete cases without using any diagnostic score as acceptance.

**Independent Test**: Run the adversarial visual fixtures and confirm that blank/blank images, missing image signal, text removed by a mask, a shifted root, a failing required region, or an omitted expected fact cannot yield a passing case.

### Tests for User Story 3

- [X] T037 [P] [US3] Create a blank-or-invisible-side and missing-image-signal rejection fixture in evals/fixtures/visual-probative-evidence-check.ts
- [X] T038 [P] [US3] Create a signal-preserving text-region, required-region threshold, and geometry-justification fixture in evals/fixtures/visual-regions-geometry-check.ts
- [X] T039 [US3] Register the new measurement fixtures in evals/run.ts

### Implementation for User Story 3

- [X] T040 [US3] Add declared-region scoring and signal-preserving text measurement while retaining masked values as diagnostic-only in extract/figma/visual-parity/img.ts
- [X] T041 [US3] Implement visibility, image, root/part geometry, pixel-region, semantic, artifact-hash, and aggregate verdict receipts in extract/figma/visual-parity/evidence.ts
- [X] T042 [US3] Make the authoritative gate require a non-masked global score and every required region, visibility, geometry, and semantic receipt in extract/figma/visual-parity/gate.ts
- [X] T043 [US3] Capture root and named-part rectangles, DOM semantics, image decode state, and visible signal from the generated comparison page in extract/figma/visual-parity/render.ts
- [X] T044 [US3] Map evidence failures to deterministic pass, fail, or blocked results and exit codes 0, 1, or 2 without modifying legacy baseline policy in extract/figma/visual-parity/run.ts

**Checkpoint**: The visual score cannot hide a missing signal, bad geometry, omitted case, stale reference, or invalid asset.

---

## Phase 6: User Story 4 - Clore sans altérer Figma ni écraser le WIP (Priority: P2)

**Goal**: Attribute the final delta honestly, prove GET-only Figma usage and generated-output provenance, and refuse closure on any unexplained or red gate.

**Independent Test**: Compare the terminal worktree with the recorded WIP baseline and historical checkpoint; the closure ledger identifies every attributable source/proof change, names every generated artifact’s causal source, records no Figma write operation or unrelated loss, and excludes only its declared self-receipts.

### Tests for User Story 4

- [X] T045 [P] [US4] Create a regression fixture for attribution boundaries, generated-output provenance, terminal self-receipt exclusions, and forbidden Figma-write command detection in evals/fixtures/visual-attribution-audit-check.ts
- [X] T046 [US4] Register the attribution-audit fixture in evals/run.ts

### Implementation for User Story 4

- [X] T047 [US4] Implement a read-only checkpoint/WIP/final diff and path-hash auditor with a fixed two-path self-receipt allowlist in scripts/verify-011-attribution.mjs
- [X] T048 [US4] Implement a deterministic terminal closure orchestrator that runs gates then attribution from one frozen manifest in scripts/verify-011-closure.mjs

**Checkpoint**: Closure machinery refuses unexplained changes, Figma writes, direct generated-output edits, red inherited gates, and any self-exclusion outside its two declared receipt files.

---

## Phase 7: Polish, Final Evidence, and Terminal Closure

**Purpose**: Reproduce derived artifacts deterministically, execute the campaign against final sources, make the review evidence ready, then create the only final attribution and closure receipts.

- [X] T049 Regenerate all approved derived artifacts through their source commands and verify no direct edits remain in src/components/, figma-sync/, catalog/, core/samples/, and contracts/contract.schema.json
- [X] T050 Update approved deterministic expectations only through the repository generator in evals/golden.json
- [ ] T051 Execute the final read-only 011 campaign after T036, T044, T049, and T050; require exit 0 and retain the final result.json plus all case artifacts under specs/011-fix-molecule-convergence/proofs/visual/
  - Final authoritative replay captured and scored all 98 cases with exact 227/227 fact coverage and no missing artifact, but remains exit 2: Carte and NavItem have honest pixel failures; Field, MemberCard, and ProductCard retain named immutable-reference limits. Realisation and Tab pass.
- [X] T052 Run the feature’s post-campaign reviewer walkthrough, record its ≤10-minute checklist, seven verdicts, evidence paths, result.json verdicts, and named blocked limits in specs/011-fix-molecule-convergence/proofs/visual/REPORT.md and specs/011-fix-molecule-convergence/proofs/closure/review.json
- [ ] T053 Execute the terminal closure orchestrator only after T052; write the final attribution ledger to specs/011-fix-molecule-convergence/proofs/attribution/final.json and gate receipt to specs/011-fix-molecule-convergence/proofs/closure/gates.json, then verify no further source/output changes occur

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately and must preserve the existing WIP, establish the inherited-gate baseline, and clear the named drift before any 011 source change.
- **Foundational (Phase 2)**: Depends on Setup and blocks every story because it validates campaign inputs, output boundaries, and evidence shape.
- **US1 (Phase 3)**: Starts after Foundation; its initial campaign inventories read-only Figma evidence, while its final campaign run is T051 after the contract and instrument work from US2 and US3.
- **US2 (Phase 4)**: Starts after Foundation; its fixture-first generic changes may proceed while US1 inventories read-only Figma evidence.
- **US3 (Phase 5)**: Starts after Foundation; it supplies the trustworthy verdict conditions consumed by the final US1 evidence run.
- **US4 (Phase 6)**: Implements audit/closure machinery after Foundation; T053 alone executes the terminal audit after all final evidence is written.
- **Final Evidence and Closure (Phase 7)**: Depends on all requested stories; it must not turn any red or blocked outcome into a pass.

### User Story Dependencies

- **US1 (P1)**: Campaign inventory and fixture receipts are independent after Foundation; final 7/7 evidence depends on the contract corrections in US2 and the receipt gates in US3.
- **US2 (P1)**: Can start after Foundation; generic mechanisms require their own fixtures before emitter changes and contract changes before regeneration.
- **US3 (P1)**: Can start after Foundation; it supplies the trustworthy verdict conditions consumed by US1.
- **US4 (P2)**: Its source scripts can start after Foundation, but its terminal receipt depends on the Phase 1 baseline, final generated state, final campaign, and reviewer report.

### Within Each User Story

- Complete and register fixture tasks before the generic mechanism they exercise.
- Update contract/schema sources before regenerating any derived output.
- Keep Figma requests read-only and retain a typed blocked result when a required immutable reference is unavailable.
- Treat a failing or blocked case as evidence to resolve, never as an omission from the report.
- Declare every deduplicated Figma occurrence as an alias with fact, image, geometry, and semantic equality fingerprints.
- Do not write sources or generated outputs after the terminal closure manifest is frozen.

## Parallel Opportunities

- T004 and the WIP/provenance snapshot can proceed independently after T001; T007 and T008 can be created independently once Phase 1 is green.
- In US1, T015 and T016 can be prepared independently once campaign types exist.
- In US2, T022–T024 and T028–T034 each touch separate fixture or contract files and can run in parallel after their prerequisites.
- In US3, T037 and T038 can run in parallel before their common registration task.
- The US4 attribution fixture can be prepared independently of the closure script while P1 work is in progress.

## Parallel Example: User Story 2

~~~text
Task: "Create Field slotted-control semantics fixture in evals/fixtures/field-slotted-control-semantics-check.ts"
Task: "Create semantic attribute mapping fixture in evals/fixtures/semantic-attribute-map-check.ts"
Task: "Create scalar composition propagation fixture in evals/fixtures/component-scalar-propagation-check.ts"

Task: "Update contracts/carte.contract.json"
Task: "Update contracts/field.contract.json"
Task: "Update contracts/member-card.contract.json and contracts/member-picture.contract.json"
Task: "Update contracts/nav-item.contract.json"
Task: "Update contracts/product-card.contract.json"
Task: "Update contracts/realisation.contract.json"
Task: "Update contracts/tab.contract.json"
~~~

## Implementation Strategy

### MVP First (US1 Evidence Foundation)

1. Complete Setup and Foundational phases, including the initial attribution ledger and the inherited-gate recovery.
2. Create the campaign model, exact seven-target inventory, alias receipts, and hash-verified fixture receipts.
3. Add the instrument’s non-probative and bounded-output guards.
4. Validate the campaign fails loudly for every missing reference, asset, alias fingerprint, or coverage fact.
5. Use the corrected contracts and measurement receipts to run the final complete US1 evidence pass in T051.

### Incremental Delivery

1. Deliver the inherited token-reference recovery, campaign input validation, and immutable reference inventory.
2. Deliver fixture-proven generic emitter capabilities and seven contract changes, then regenerate.
3. Deliver visibility, geometry, region, semantic, and artifact receipt gates.
4. Produce the full final evidence campaign and time-boxed traceability report.
5. Run the terminal attribution and repository closure gates; publish only an evidence-backed result.

### Format Validation

- All 53 implementation tasks use - [ ], a sequential T001–T053 ID, an optional [P] marker only for independent files, a [US#] label only in user-story phases, and one or more explicit file paths.
