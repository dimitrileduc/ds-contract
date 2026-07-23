# Tasks: Icônes gouvernées + finalisation du Bouton (choix d'icône et mise à jour du master)

**Input**: Design documents from `/specs/002-governed-icons-button/`
**Prerequisites**: plan.md, spec.md, research.md (D1–D11), data-model.md (E1–E8), contracts/ (4 interfaces), quickstart.md

**Tests**: This project's testing discipline is the **eval suite** (Principle II: fixture → eval → claim). Eval tasks (C2/C3/C5, revivals, golden re-pin) are therefore **required implementation tasks**, not optional TDD — every new capability lands its adversarial check before any doc claims it.

---

## ⚠️ Execution order — READ FIRST (this feature is strictly sequential)

Unlike the template's default (independent stories, parallelizable), these user stories are **strictly sequential** and gated by the spec's own rule: **never contract a dirty source** (source-cleanliness, "the Button lesson"). Do **not** start step N+1 until step N is committed and owner-approved. The git log is the auditable approval trail (001 precedent).

Priorities (P1/P2) describe **value/risk**; the **steps** describe the **mandated execution order** — they differ:

| Execution | Step (quickstart) | User story | Priority | Closes with commit |
|---|---|---|---|---|
| 1st (blocking) | Step 0 — audit + clean source | **US3** | P2 | `step(0-source)` |
| 2nd | Step 1 — governed registry + code assets | **US2** (part 1) | P1 | `step(1-registry)` |
| 3rd | Step 2 — Button v1.3 extracted | **US2** (part 2) | P1 | `step(2-button-v1.3)` |
| 4th (max risk) | Step 3 — the single master update | **US1** | P1 | `step(3-master)` |
| 5th (closure) | Step 4 — proofs the owner can see | **US4** | P2 | `step(4-closure)` |

Setup (Phase 1) is verification only (no commit). Foundational runners (Phase 2) are committed **within** the `step(0-source)` commit — they are Step 0's instruments.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task). Note: `evals/run.ts` is a serialization point — eval-case tasks that all edit it are logically parallel but must be applied one at a time.
- **[Story]**: US1 (master update), US2 (registry + Button v1.3), US3 (clean source), US4 (closure).
- All paths are repo-root-relative. Owner-in-the-loop Figma gestures are marked 🖐️. Hard gates are marked ⛔.

---

## Phase 1: Setup (verification only — no commit)

**Purpose**: Confirm the environment and the known-good starting state before any change.

- [X] T001 Verify prerequisites on the **main checkout** (evals symlink `node_modules` — no git worktree): Node ≥ 20 + `npm install`; Chromium available (`npx playwright install chromium` or `PLAYWRIGHT_CHROMIUM_PATH`); `FIGMA_TOKEN` in `.env.local`; figma-console MCP connected to the open « Piqueray (Copy) » file (`d9FYAUcqdcNtsuaMgLefvJ`); confirm branch `002-governed-icons-button`. **Verified 2026-07-23**: Node v24.14.0, npm 11.9.0, node_modules present (147 entries), Chromium cached, FIGMA_TOKEN in `.env.local`, figma-console connected (probe 3ms), branch confirmed.
- [X] T002 Baseline gate sweep to pin the known-good start: `npm run build && npm run parity && npm run eval && npm run plugin:check && node scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && tsc -p tsconfig.build.json`. Confirm the live eval `N/N` shows **exactly the 3 intentional reds** (`baseline-parity-clean`, `baseline-acknowledges-without-failing`, `promotion-converges`) and parity shows **exactly the 1 declared finding** (`Button.children` has no TEXT property). Record this as the pre-feature baseline. **Confirmed 2026-07-23**: build clean; parity = exactly 1 finding (`Button.Contactez-nous` / children has no TEXT property); eval = 94/97, the 3 reds are exactly the named 3 (stale "pending token push" attribution still present, per D9 — T027 will fix); 51 legacy quarantined; plugin:check/core-browser-check/tsc all clean. NOTE: `deterministic-roundtrip.mjs` needs `tsx` (not plain `node` — no global TS loader in this shell) and `tsc -p tsconfig.build.json` needs the `npx` prefix (bare `tsc` not on PATH) — doc nit, not a regression; both gates pass once invoked that way.

---

## Phase 2: Foundational (Blocking Prerequisites — the two committed runners)

**Purpose**: Permanent tooling that BLOCKS the Step 0 audit and is **reused** by Step 3 (per `schema-additions.interface.md` §6). Zero throwaway scripts (owner rule). **Committed within the `step(0-source)` commit.**

**⚠️ CRITICAL**: The Step 0 audit (Phase 3) cannot run until both runners exist.

- [X] T003 [P] Create the **positional instance scan** runner in `extract/figma/audit/`: walks every instance on every page **by POSITION, never by name** (CLAUDE.md rule; 001 near-deletion receipt) via a `figma_execute` walk → streams `{page, position, nodeId, text?, glyph?}` records to the existing `capture-receiver.mjs` sink → writes committed JSON (E5 artifact). Add an npm script. Honesty conventions: named skips. **Built + smoke-tested live 2026-07-23**: `walk-code.ts` (generic walk payload generator, run via figma_execute — dumps raw facts, never assumes property names) + `assemble.ts` (classification, committed/iterable). Live test on the "Accueil" page: 52 instances found, 14 Button + 38 other-instance, correctly split text/icon overrides once the set's real defaults were fetched (`buildFetchSetDefaultsCode`). Real finding en route: current icon census is "non-Button instances", not yet "only governed icons" — will need scoping to zone 6:111's actual masters once T005 enumerates them (named limitation in code). npm scripts: `extract:figma:audit:receiver`, `extract:figma:audit:assemble`.
- [X] T004 [P] Create the **page-state photography** runner in `extract/figma/state-photo/`: captures a scale-2 PNG per page frame via `fetchNodePngs` (cache keyed node + **file version**, `--refresh`-aware — never compare against a stale photo), diffs before↔after via `img.ts` `alignPair`/`diffPair`/`writeTriptych` within the **existing** `THRESHOLD_PCT = 2.0` (no new threshold), writes a committed score report + keeps divergent triptychs as evidence (E6 artifact). Add an npm script. **Built + smoke-tested live 2026-07-23**: `run.ts` (capture/compare CLI) + `tolerance.ts` (THRESHOLD_PCT extracted from visual-parity's `run.ts` into its own side-effect-free module — importing `run.ts` directly for the constant was ALSO running its entire CLI against this script's own argv). Fixed a second real bug: requesting all 9 mockup frames in one images-API call made Figma's render backend hang past 2 minutes with no response (these are full pages, up to ~6700px tall) — fixed by fetching one frame per images-API call. Live end-to-end proof: captured all 9 real pages twice, compared, all 9 at exactly 0.000% (identical), report written, exit 0. npm script: `extract:figma:state-photo`.

**Checkpoint**: Both instruments exist and run headless-then-live. Audit can begin.

---

## Phase 3: User Story 3 — Un jeu d'icônes propre, audité AVANT toute contractualisation (P2 — sequentially FIRST, BLOCKING) 🎯

**Goal**: A clean, owner-validated icon source (colors bound to variables, scale rules, descriptions, zero third-party dependency) — extracted from **nothing** until the owner signs off.

**Independent Test**: The committed audit report covers masters AND usage **by position**; the 4 decided items are applied; every extra anomaly is arbitrated by the owner; the owner validates the cleaned source; and **no contract/registry file exists in git** before that validation.

**Commit that closes this phase**: `step(0-source)` (includes the Phase 2 runners).

- [X] T005 [P] [US3] **Masters audit** of zone `6:111` (15 masters): 🖐️ `figma_lint_design` + dump; report structure, constraints, **variable bindings AND variable TYPES** (the 001 `nav-state` lesson — a STRING variable nearly crashed the push), sizes (**20 and 32 both respected as designed** — FR-005, never "harmonized"), descriptions. Feeds the E8 report. **Done 2026-07-23**: all 15 clean COLOR bindings (no nav-state-style STRING issue); mail icon's 2 hardcoded fills confirmed (`263:2126`/`263:2127`); all 15 already have MIN/MIN constraints (discrepancy vs. "4 lacking them" — flagged in step-0-audit.md §4); all 15 lack descriptions (matches item c); all 15 confirmed `remote: false` (locally-defined, despite vendor-style names).
- [X] T006 [P] [US3] **Usage audit by POSITION**: run the T003 scan over all instances on all pages; **re-measure** the session counts (268 instances / 22 external-chevron uses / 43 texts / 26 chosen glyphs / 9 pages — the re-measured numbers become authoritative) and record per-instance overrides to committed JSON. **Done 2026-07-23**, live, all 9 pages: 362 instances scanned → `extract/figma/audit/step-0-usage-scan.json`. Re-measured: 77 Button instances, 43 text overrides (exact match), 29 glyph overrides across 7 distinct icons (was 26), 224 true icon-master instances (was 268 — 4 raw false-positives identified and excluded: logo/member-photo/header-nav/nested-nav-chevron, none icon-registry concerns), **zero remote (third-party) components found anywhere** (SC-007 discrepancy — flagged in step-0-audit.md §4.1).
- [X] T007 [P] [US3] **Before-photo** of the 9 pages: run T004 with `--refresh` (fresh, pristine capture — taken before any cleanup); commit the baseline photo set. **Done 2026-07-23**, live: all 9 pages captured fresh (file v2379438000793455518) → `extract/figma/state-photo/out/snapshots/step0-before-cleanup.json`.
- [X] T008 [US3] Write the committed **Step-0 audit report** (E8) at `specs/002-governed-icons-button/step-0-audit.md`: masters findings (T005) + usage-by-position (T006), the 4 decided items with slots for application receipts, and a section for owner-arbitrated proposals. (depends on T005, T006) **Done 2026-07-23** — written with 6 named anomalies for owner arbitration (§4) including the SC-007/constraints discrepancies above.
- [X] T009 [US3] 🖐️ Cleanup item **(a)**: bind the **mail** icon color to its Piqueray variable (the only frozen fill) via figma-console; checkpoint the edit. **Applied 2026-07-23** via `figma_set_fills` on `263:2126`+`263:2127` → `VariableID:5:40` (`color/noir-bleute`); re-read confirms binding; screenshot shows no visible defect. Owner decision: applied regardless of registry scope (Option A).
- [X] T010 [US3] ~~Cleanup item (b): add scale rules to the 4 masters lacking them~~ — **N/A, owner-confirmed 2026-07-23**: live audit found all 15 masters already have `{horizontal: MIN, vertical: MIN}` constraints (contradicts the "4 lacking them" assumption). No edit made.
- [X] T011 [US3] 🖐️ Cleanup item **(c)**: add a **description** to each of the 15 masters via figma-console; checkpoint. **Applied 2026-07-23** via `figma_set_description` ×15; re-read confirms all 15 descriptions match exactly (table in step-0-audit.md §4a).
- [X] T012 [US3] ~~Cleanup item (d): create a local master reproducing the external chevron's drawing, swap its 22 uses~~ — **N/A, owner-confirmed 2026-07-23**: live audit found zero `remote` (third-party) components anywhere across 362 scanned instances — SC-007 was already satisfied, no external dependency existed to replace. **Additional owner-decided cleanup performed instead**: renamed all 15 masters from vendor-prefixed names (`cil:`, `lucide:`, `iconoir:`, etc.) to clean canonical ids via `figma_rename_node` ×15; re-read confirms all 15.
- [X] T013 [US3] **After-photo** (T004, `--refresh`): verify the pixel diff is **nil or explicitly owner-accepted** (SC-003, measured never by eye) — any residue goes to the owner as a named, accepted change. (depends on T007, T012) **Done 2026-07-23**: captured `step0-after-icon-cleanup`, compared vs `step0-before-cleanup` → **all 9 pages at exactly 0.000%, zero residue** (report: `extract/figma/state-photo/reports/step0-before-cleanup-vs-step0-after-icon-cleanup.md`).
- [X] T014 [US3] Surface **every anomaly beyond the 4 items** (e.g. the `cil:`/`lucide:` vendor-prefix names vs clean canonical names) as a **named proposal** in the E8 report; 🖐️ owner arbitrates **BEFORE** contracting (FR-003) — never a silent fix, never modeled-around. **Done 2026-07-23**: 6 anomalies named in step-0-audit.md §4, all arbitrated by the owner (decisions recorded).
- [X] T015 [US3] ⛔ **GATE (FR-004/SC-006)**: 🖐️ owner **validates the cleaned source**, recorded in the E8 report. No extraction / contracting may precede this sign-off. **SIGNED OFF 2026-07-23** — owner explicit "Oui, je valide" in this conversation, recorded in step-0-audit.md §5.
- [ ] T016 [US3] Post-validation refresh: re-dump zone `6:111` → refresh fixtures under `extract/figma/fixtures/` (`dumpedAt` new); run visual `--refresh` so nothing downstream compares against a stale photo. (depends on T015)
- [ ] T017 [US3] Commit `step(0-source)`. **Verify nothing was extracted before the gate**: `contracts/icons.registry.json` and a v1.3 `button.contract.json` must **not** exist in git yet. (depends on T016)

**Checkpoint**: Source is clean and owner-validated; the re-measured counts are authoritative; the audit/scan/photo instruments are committed. Extraction may now begin.

---

## Phase 4: User Story 2 (part 1) — Le développeur a exactement le menu d'icônes du designer — the governed registry (P1)

**Goal**: One versioned registry (`ds.icons` v1.0.0) that the designer menu and the code list both derive from, with a mechanical three-way guarantee (the new parity icons axis).

**Independent Test (first half)**: `npm run parity` shows the code icon list = the canvas masters, element by element, via the registry pivot (the designer-menu axis lands at Step 3).

**Commit that closes this phase**: `step(1-registry)`.

- [ ] T018 [P] [US2] Add **`IconRegistrySchema`** (+ inferred `IconRegistry` type) as a **new additive document export** in `packages/schema/src/contract-schema.ts` — validates the shape in `icon-registry.interface.md`; **no existing field touched, repurposed, or narrowed** (Principle VI; INSTANCE_SWAP `kind` + generic `values` map already exist at ~75–79 and stay untouched).
- [ ] T019 [P] [US2] Add the REST **`format=svg` export step** to `extract/figma/rest/` (Figma images API per master node) — deterministic acquisition (source-refresh class, like dumping); document alongside the existing REST verbs.
- [ ] T020 [US2] Acquire the 15 governed SVG bodies via T019 → `assets/icons/<name>.svg`, then **prune `assets/icons/` to exactly the registry** (remove demo leftovers `search`, `close`, `spinner`, `warning`, … referenced by no contract) so the directory **is** the code-side derivation of the registry. (depends on T019, T016)
- [ ] T021 [US2] **Propose → review → adopt the registry**: extract from the cleaned dump (zone `6:111` + REST component inventory), review the mapping (canonical `name` ↔ `figma.componentName`/`key`/`nodeId` ↔ `asset` ↔ `size` ↔ `description`), adopt `contracts/icons.registry.json` **v1.0.0** (never hand-invented). (depends on T018, T016)
- [ ] T022 [P] [US2] Add **registry build validation** in the `scripts/generate-components.ts` path: refuse **by name** on duplicate/illegal `name` (`[a-z][a-z0-9-]*`), a missing `assets/icons/<asset>.svg`, or a contract enum bound INSTANCE_SWAP whose values ≠ the registry. (The per-part missing-asset refusal at `emit-react.ts:724–725` stays the last line of defense.) (depends on T018)
- [ ] T023 [US2] Implement the **parity icons axis** in `parity/diff.ts`: registry ↔ code (`assets/icons/` inventory + Button enum) ↔ canvas (snapshot icon inventory + the Button set's swap `preferredValues`); extend the snapshot pull to record `preferredValues`; findings use the existing `ahead`/`behind`/`mismatch` classifications + baseline/exit-code mechanics + plain-words remedies (FR-006/FR-007). (depends on T021)
- [ ] T024 [P] [US2] Bump `docs/02-contract-spec.md`: document the **registry document type** + the **INSTANCE_SWAP enum-binding convention** (`icon.asset: "{prop}"` + `bindings.figma.values`).
- [ ] T025 [US2] Eval **C3** (registry three-way sync): a seeded divergence on **any** side is detected and listed in clear language (FR-007) — add case + fixture in `evals/`. (depends on T023)
- [ ] T026 [US2] Eval **C2** (refusal): an icon name **outside** the registry/enum fails **by name** at build (FR-008 edge) — add case + fixture in `evals/`. (depends on T022; serializes with T025 on `run.ts`)
- [ ] T027 [US2] **Honesty fix now** (Principle V, Step-1 hygiene): re-attribute the 3 reds' block from "pending the token-set push" → **"pending the Button master rebuild"** in `evals/run.ts` (the reds' banner ~53–106 + closing message ~43–52 / ~3697–3699) and `evals/REMOVED-CASES.md` (also fix "96 executed" vs the live 97). The token push is done — the master rebuild is the real remaining blocker (D9.2).
- [ ] T028 [US2] Verify Step 1 gates + commit `step(1-registry)`: `npm run build` (registry validated; assets complete; refusals by name) · `npm run parity` (icons axis live: registry = code = canvas masters; menu axis expected pending until Step 3) · `npm run eval` (C2/C3 green; the 3 reds **still red** — named/expected, now correctly attributed).

**Checkpoint**: One governed list exists, code assets = registry exactly, and the differ proves registry ↔ code ↔ canvas. The 3 reds remain red (honest, pending Step 3).

---

## Phase 5: User Story 2 (part 2) — reproduce any mockup button by naming its icon — Button v1.3, extracted (P1)

**Goal**: The two Button placements become steerable both sides (which icon + shown/not) via two INSTANCE_SWAP-bound enum props — **extracted** (D5 closes v1.2's named gap), not authored. Strictly additive: **1.2.0 → 1.3.0**.

**Independent Test (second half)**: a mockup button is reproduced in code by **naming its icon** — no hand-made SVG; the typed enum in `Button.tsx` = the registry list.

**Commit that closes this phase**: `step(2-button-v1.3)`.

- [ ] T029 [US2] Implement the **D5 lowering pass** in `core/propose-figma.ts`: `boolDefaults` → boolean props; `propRefs.visible` → `visibleWhen`; `swapPreferredValues` + registry (passed **as data** — core stays browser-pure, `core-browser-check.mjs` green) resolving component key → canonical name → **INSTANCE_SWAP-bound enum props**. Closes the extraction gap v1.2's description names.
- [ ] T030 [US2] Eval **C5** (the D5 pass recovers bool + swap props from the committed fixture dump) — add case + fixture in `evals/` (rides the same fixture as D9). (pairs with T029; serializes with T025/T026 on `run.ts`)
- [ ] T031 [US2] **Propose → review → adopt Button v1.3**: run the T029 lowering over the **post-cleanup** dump, review against `button-v1.3.interface.md` (props `iconLeftGlyph`/`iconRightGlyph`, `type.enum` = registry names **exactly**; `bindings.figma` INSTANCE_SWAP with the **from-dump** property names + `values` mapping canonical → `figma.componentName`; defaults `arrow-left`/`arrow-right`; anatomy `icon.asset: "{iconLeftGlyph}"` + `visibleWhen`; `anchors.figma.dumpedAt` refreshed), adopt `contracts/button.contract.json` **v1.3.0**. **Replace** v1.2's "known extraction gap" description paragraph with the v1.3 reality. (depends on T029, T021)
- [ ] T032 [US2] Regenerate + re-pin: `npm run build && npm run catalog && npm run figma:plan && npm run golden:update`. `Button.tsx` gains the typed enum props + an `ICONS` map over **all** registry glyphs (existing emit machinery ~2015–2024); `catalog` also fixes the **stale v1.1.0 Button shard** (named housekeeping, D11); golden re-pinned **in the reviewed change**. Never hand-edit `src/components/Button/*` or `figma-sync/*.js`. (depends on T031)
- [ ] T033 [P] [US2] Ensure a **button with icons in BOTH placements** is visible in the generated Storybook story **and** the dashboard sample (FR-020) — driven by the contract's example/preset so **regeneration** produces it (do not hand-edit generated output). (depends on T032)
- [ ] T034 [P] [US2] **Revive re-pointable quarantined evals** (D9.4): `preferred-values-accepts`, `detect-figma-accepts-drift`, `detect-default-and-kind-drift`, `figma-script-referees-invalid-contracts` — move per `evals/REMOVED-CASES.md` discipline, re-point fixtures to the Piqueray icon model; leave cases inseparable from `slot.accepts` semantics quarantined with the reason updated. (depends on T031)
- [ ] T035 [US2] Verify Step 2 gates + commit `step(2-button-v1.3)`: `npm run build && npm run eval && npm run plugin:check && node scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && tsc -p tsconfig.build.json`. Confirm v1.3-at-defaults renders **byte-identically** to v1.2 (golden + C1/C8) and the typed enum = the registry list.

**Checkpoint**: The central promise is real in code — one governed list, choosable in both Button placements, byte-compatible with v1.2. Code side is ready before any Figma write.

---

## Phase 6: User Story 1 — La mise à jour du master ne casse rien des maquettes (P1 — the maximal-risk step) 🎯

**Goal**: ONE targeted master update — the label becomes a Figma TEXT property (extinguishing the 001 finding) + governed icon `preferredValues` — proven to break **nothing** across the 9 mockup pages.

**Independent Test**: before/after state photography of the 9 pages is **identical within the existing tolerance** (measured, not by eye), and all 43 texts + 26 chosen glyphs are fully restored (any non-restorable one named + owner-validated).

**Follow `master-update-operation.interface.md` to the letter.** State machine: pre-flight → applied → re-measured → verified → closed (rollback on any mid-operation failure). **Commit that closes this phase**: `step(3-master)`.

- [ ] T036 [US1] Pre-flight **P1–P2**: confirm Step 0 is owner-validated (E8 sign-off) **and** Button v1.3 is adopted + generated with all gates green (code side ready **before** any Figma write).
- [ ] T037 [US1] Pre-flight **P3**: fresh positional **before-scan** (T003 runner) — all instances, all 9 pages, by POSITION; re-measure the 43 texts + 26 glyphs; commit the before-scan JSON.
- [ ] T038 [US1] Pre-flight **P4**: fresh **before-photo** of the 9 pages (T004, `--refresh`); commit.
- [ ] T039 [US1] Pre-flight **P5**: 🖐️ restore points — owner saves a **named version** + downloads a local `.fig`; verify the checkpoint via `figma_get_file_versions`; record version id + timestamp in the operation report.
- [ ] T040 [US1] Pre-flight **P6–P7**: re-verify target identity (set node `6:122` + key `e6fa6786…` match anchors) and re-audit **live variable/property TYPES** (nav-state lesson) in the operation script.
- [ ] T041 [US1] ⛔ 🖐️ **The single `figma_execute` operation** (NOT `figma-sync/02-button.js` — documented orphaning risk, D8): **(a)** create the « Libellé » **TEXT property** bound to the label node in **all 6 variants** (default « Contactez-nous ») → closes the 001 declared finding; **(b)** verify/complete the two icon **swap properties** + set `preferredValues` to **exactly** the governed menu on both placements. **Delete nothing**; preserve node ids, property ids, variant structure, and all page instances. (depends on T036–T040)
- [ ] T042 [US1] Post **Q3**: re-dump the set + `--refresh` the visual caches (new dump fixture). (depends on T041)
- [ ] T043 [US1] Post **Q1**: **after-photo** of the 9 pages (T004); compare before↔after — **identical within `THRESHOLD_PCT = 2.0`**; any residue **named + explicitly owner-accepted** or the operation **FAILS** (SC-003, measured never by eye). (depends on T038, T042)
- [ ] T044 [US1] Post **Q2**: **after-scan** vs before-scan (T037) — all **43 texts + 26 glyphs restored**; every non-restorable customization **named one-by-one**, 🖐️ treatment owner-validated (SC-008 — silent omission is the gravest fault). (depends on T037, T042)
- [ ] T045 [US1] Post **Q4**: re-pull + **commit** `parity/snapshots/figma-components.json` (the evals read the **committed** snapshot — pushing to Figma is necessary but **not** sufficient). (depends on T042)
- [ ] T046 [US1] Verify **Q5–Q6** (Independent Test US1): `npm run parity` → **ZERO findings** (the 001 declared finding is gone — SC-001); `npm run eval` → the **3 intentional reds are green**, suite fully green (live N/N). (depends on T043, T044, T045)
- [ ] T047 [US1] Post **Q7**: commit the **operation report** (checkpoint id, payload receipts, scan/photo refs) at `specs/002-governed-icons-button/master-update-report.md` + the `step(3-master)` commit. **Rollback path** (any mid-operation failure): 🖐️ restore the owner's named version, verify full return with `figma_diff_versions` + a fresh photo vs the before-photo, write it up; a retry is a **NEW full pre-flight**, never a touch-up series (FR-017). (depends on T046)

**Checkpoint**: The system is proven on a real client file — the master updated once, nothing broken, alignment closed (parity zero). This is the point where the feature's guarantee fully lands.

---

## Phase 7: User Story 4 — L'owner constate lui-même que c'est fini (P2 — closure + cross-cutting)

**Goal**: The owner sees the proof unaided — zero-écart comparison + a button with icons in the dashboard and Storybook, and a fully-green suite. This phase also carries the feature's cross-cutting closure (count-sync, honesty sweep, named limitation).

**Independent Test**: the owner opens the dashboard (zero écart, icons visible), opens Storybook (icons example), runs the suite (fully green, live count).

**Commit that closes this phase**: `step(4-closure)`.

- [ ] T048 [P] [US4] **FR-021 visual coverage**: register the governed icons as subjects + a **Button-with-icons** subject in `extract/figma/visual-parity/subjects.ts` (small named **per-subject prop preset**, e.g. `iconRight: true` + a chosen glyph, since defaults render text-only); `--write-baseline` records the restored coverage; existing `THRESHOLD_PCT = 2.0` + `baseline.json` gate, **no new threshold**. (This is the icon proof 001 deferred to v1.3, commit `38aee13`.)
- [ ] T049 [US4] **Honesty sweep**: **delete** the 3 reds' "FAILING ON PURPOSE" block in `evals/run.ts` (they pass now); document the **named limitation** where the icon capability is claimed — the canvas emitter still **bakes glyph vectors** (not local-master instances), so the contract→canvas byte-proof stays **headless** (deterministic-roundtrip + the faithful mock); live alignment is proven by the re-pulled parity snapshot (D8).
- [ ] T050 [P] [US4] **Count-sync**: propagate the live eval `N/N` and the Step-0 re-measured counts into `README.md`, `CLAUDE.md`, `docs/handoff/`, `MILESTONES.md`, `evals/REMOVED-CASES.md`, and `specs/002-governed-icons-button/spec.md` (FR-019 — the live count is authoritative; keep every quoted count in sync).
- [ ] T051 [US4] **Full closure gate sweep**: `npm run build && npm run parity && npm run eval && npm run plugin:check && node scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && tsc -p tsconfig.build.json && npm run extract:figma:visual:summary` — all green, live N/N. (depends on T048, T049, T050)
- [ ] T052 [US4] **Owner-verifiable close-out** (Independent Test US4): confirm the dashboard shows ZERO écart + a button with icons, Storybook shows the icons example in both placements, and the suite is fully green; add the dated `MILESTONES.md` entry; commit `step(4-closure)`. (depends on T051)

**Checkpoint**: Spec 002 closes — suite fully green (live N/N), parity zero findings, icon coverage restored, counts synced, the owner can see it all.

---

## Dependencies & Execution Order

### Phase (step) dependencies — strictly linear

```
Setup (P1) → Foundational runners (P2) → US3/Step0 → US2/Step1 → US2/Step2 → US1/Step3 → US4/Step4
                                          └── each closes with ONE owner-approved git commit ──┘
```

- **This feature has NO parallel-story path.** US3 must complete (owner-validated clean source) before US2 extracts anything (FR-004). US2 (registry + v1.3, code side) must be green before US1 writes to the master (P2 pre-flight). US4 is pure closure over a landed US1.
- The only reason US3 is P2 yet goes first: priority ranks value/risk; the source-cleanliness rule ranks execution. They are not in conflict — see the table up top.

### Key cross-phase dependencies

- **T003/T004 (runners)** → used by T005–T007 (US3 audit) **and** T037/T038/T043/T044 (US1 pre-flight & verification).
- **T016 (cleaned re-dump)** → gates T020/T021 (registry) and T031 (v1.3 extraction). Nothing extracts before T015 (owner gate).
- **T021 (registry adopted)** → T023 (parity axis), T029/T031 (lowering + v1.3).
- **T031 → T032 → T033** (contract → regenerate → visible in Storybook/dashboard).
- **T041 (the one operation)** → T042 → {T043, T044, T045} → T046 (parity zero + reds green) → T047.
- **T027 (attribution fix, Step 1)** and **T049 (delete the block, Step 4)** are the two honesty touchpoints on the same reds.

### Within-phase parallel opportunities

- **Phase 2**: T003 ∥ T004 (different directories).
- **Phase 3**: T005 ∥ T006 ∥ T007 (independent pre-cleanup reads/captures). The 4 cleanup gestures T009–T012 are **sequential** (checkpoint-each discipline, single-file safety), not parallel.
- **Phase 4**: T018 ∥ T019 ∥ T024 (schema, REST export, docs — different files). T022 ∥ T021 (different files). Eval tasks T025/T026 serialize on `evals/run.ts`.
- **Phase 5**: T033 ∥ T034 (stories/dashboard vs eval revivals). Eval tasks T030/T034 serialize with T025/T026 on `evals/run.ts`.
- **Phase 6**: none — a gated state machine, fully sequential.
- **Phase 7**: T048 ∥ T050 (subjects vs docs). T049 touches `run.ts`.

---

## Parallel Example: Phase 4 (US2 part 1) kickoff

```bash
# After T017 (Step 0 committed), launch the independent-file starters together:
Task: "T018 Add IconRegistrySchema to packages/schema/src/contract-schema.ts"
Task: "T019 Add the format=svg REST export step to extract/figma/rest/"
Task: "T024 Bump docs/02-contract-spec.md with the registry + INSTANCE_SWAP convention"
# Then converge: T020 (prune assets) and T021 (adopt registry) once T016 + T018/T019 land.
```

---

## Implementation Strategy

### Increment boundaries = the 5 commits (not an MVP subset)

Because the stories are strictly sequential, there is no "US1-only MVP." The deliverable grows one owner-approved commit at a time:

1. **`step(0-source)`** — clean, validated source (the precondition for everything).
2. **`step(1-registry)`** — earliest standalone value: one governed list, mechanically verified registry ↔ code ↔ canvas. (3 reds still red, honestly.)
3. **`step(2-button-v1.3)`** — the central promise in code: choose any governed icon in either placement, byte-compatible with v1.2.
4. **`step(3-master)`** — the guarantee proven on the real client file: one master update, nothing broken, parity zero, the 3 reds green. **← the feature's promise fully lands here.**
5. **`step(4-closure)`** — the owner sees it: visual coverage restored, counts synced, honesty sweep, MILESTONES entry.

### Stop-and-validate gates

- After **T015**: owner sign-off — do not extract before it.
- After **T028 / T035**: code side green before touching the master.
- After **T041**: the maximal-risk write — immediately re-measure (T042–T046); on any failure, roll back (T047) and re-pre-flight from scratch.

### Discipline

- One git commit per step; the commit message names the step (see quickstart for exact messages). The git log is the approval trail.
- Never hand-edit generated output (`src/components/`, `figma-sync/*.js`, `catalog/`, `golden.json`) — regenerate.
- Every non-derivable value is **measured** (Step 0 re-dump/re-scan), never invented.
- Degradation is **named**, never silent (the baked-vector limitation, any non-restorable customization, any anomaly beyond the 4 items).

---

## Notes

- **[P]** = different files, no dependency on an incomplete task. `evals/run.ts` is a serialization point — treat eval-case tasks (T025, T026, T030, T034, T027, T049) as one-at-a-time even where logically independent.
- **[Story]** maps each task to US1/US2/US3/US4 for traceability; Setup + Foundational carry no story label.
- 🖐️ = owner-in-the-loop Figma gesture (audit, cleanup, named-version restore points, sign-offs, rollback). ⛔ = hard gate.
- Total: **52 tasks** — Setup 2, Foundational 2, US3 13, US2 18 (part 1: 11, part 2: 7), US1 12, US4 5.
