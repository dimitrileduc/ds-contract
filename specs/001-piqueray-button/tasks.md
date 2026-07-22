---
description: "Task list — Reconversion Piqueray, preuve Figma → code sur le Button"
---

# Tasks: Reconversion Piqueray — preuve Figma → code sur le Button

**Input**: Design documents from `/specs/001-piqueray-button/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅ (D1–D10), data-model.md ✅ (E1–E6), contracts/ ✅ (3 interfaces), quickstart.md ✅

**Tests**: NOT generated as separate TDD tasks. This repo's verification IS the deterministic
**eval suite** (`evals/run.ts`, families C1–C8) + the **fidelity gate arsenal** (determinism,
parity, contract↔Figma, visual). The spec requests no new unit tests; the eval/gate steps are
woven in as verification tasks (FR-002 proves the *engine*; the gates prove *Button fidelity*).

**Organization**: Grouped by user story. The reconversion is **subtractive + additive within
existing glob-driven mechanisms** — deleting the 51 demo contracts and regenerating auto-shrinks
every downstream surface, so most work concentrates in four hand-authored sources: `tokens/`,
`contracts/button.contract.json`, the schema (+2 optional fields), and the two hardcoded lists
(`evals/run.ts`, `extract/figma/visual-parity/subjects.ts`). Each story lands as one **git commit**
(the step named in the message) — git history *is* the auditable approval trail (FR-016, D10).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US5 (Setup / Foundational / Polish carry no story label)

## The load-bearing constraint — TOKENS-FIRST

A binding to a nonexistent token **fails the build by name** (FR-004). So the order is
non-negotiable: **dump → tokens (US1) → contract (US2) → gates (US3)**. Nothing generates before
the foundation it binds to exists. **No value is ever invented** — every Piqueray value is
`from-dump` or explicitly `authored`-marked (Honesty, Principle V).

---

## Phase 1: Setup (environment & baseline)

**Purpose**: Confirm the toolchain and record the pre-reconversion baseline so the before/after is
provable (the eval count *will* change under the hybrid rule — FR-002).

- [X] T001 [P] Verify toolchain & environment: Node ≥ 20, clean `npm install`; Chromium present for the visual gate (`npx playwright install chromium` or set `PLAYWRIGHT_CHROMIUM_PATH`); confirm you are on branch `001-piqueray-button` and on the **main checkout, not a git worktree** (evals symlink `ROOT/node_modules`, which worktrees lack — CLAUDE.md).
- [X] T002 [P] Capture the pre-reconversion baseline for the honesty record: run `npm run eval` and note the live `N/N` (expected ~146), and confirm the current full gate sweep is green today. Record both in the eventual Step-1 commit body (proves the count-change is intentional, not breakage).

**Checkpoint**: Environment sane, baseline recorded — reconversion can begin.

---

## Phase 2: Foundational (the two external/engine inputs — BLOCKING)

**Purpose**: Capture the single external input (the Figma **dump**) and land the two additive
schema fields the contract needs. These are inputs the stories *consume*, produced once, up front.

**⚠️ CRITICAL**: US1's token values are read from the dump → **US1 needs T003**. US2's contract
carries the new schema fields → **US2 needs T003–T008**. The dump is the one non-derivable input
and **MUST NOT be invented** (research "Open dependency", Honesty V).

- [X] T003 [P] Produce the Piqueray Figma dump and commit it as the ground-truth fixture `extract/figma/fixtures/piqueray-button.dump.json` — prefer the plugin/MCP path (`npm run extract:figma:mcp`, resolves real variable names), fall back to `npm run extract:figma:rest` which **degrades loudly** to minted `imported.*` tokens if the variables endpoint is unavailable. The dump must carry `_provenance` (fileKey, extractedAt, dumpVersion), `_variables` (the 14 values feeding US1), the Button component set (6 variants feeding US2), and any `_degradations` (D3, E3).
- [X] T004 [P] Add optional `dumpedAt` (ISO-8601) to the `anchors.figma` **strictObject** in `packages/schema/src/contract-schema.ts` — `dumpedAt: z.string().optional()` (D4, FR-007; strictObject rejects undeclared keys, so it must be declared).
- [X] T005 Add optional `provenance` marker to **both** `a11y` and `semantics` in `packages/schema/src/contract-schema.ts` — `provenance: z.enum(['authored','extracted']).optional()` (D5, FR-017). *(Same file as T004 → sequential.)*
- [X] T006 [P] Bump `docs/02-contract-spec.md` documenting both additive-optional fields (`anchors.figma.dumpedAt`; `a11y`/`semantics.provenance`) — Principle VI requires the doc move with the schema.
- [X] T007 Regenerate the JSON Schema mirror via `npm run schema` (rewrites `contracts/contract.schema.json` — **generated, never hand-edit**), then confirm `npx tsc --noEmit && tsc -p tsconfig.build.json` is green (depends on T004, T005).
- [X] T008 Add an engine-level eval case in `evals/run.ts` asserting both new optional fields **survive generate + round-trip** using a minimal committed fixture (fixture → eval → claim, Principle II / D4) — independent of the Button so it stays green from now on (depends on T004, T005).

**Checkpoint**: Dump committed + schema evolved. US2/US3 unblocked; **US1 may start as soon as T003 lands** (it needs only the dump).

---

## Phase 3: User Story 1 — Le dépôt devient Piqueray : les tokens remplacent la démo (Priority: P1) 🎯 First increment

**Goal**: Reconvert in place — remove all 51 demo components and lay the Piqueray mono-theme token
foundation (14 variables + 8 Montserrat styles, single mode), tiered primitives → semantic aliases,
**values from the dump only**. This is the foundation everything binds to (tokens-first).

**Independent Test**: An inventory shows **only Piqueray artifacts** — no demo contract, generated
surface, catalog entry, or golden ref remains; `npm run tokens` compiles the 14 variables + 8 styles
in a single `:root` (mono-theme) with **no component existing yet**.

*(Depends on Foundational T003 — the dump — for token values.)*

- [X] T009 [P] [US1] Rewrite `tokens/primitives.tokens.json` to the Piqueray primitives — the 12 colours + NavState colour + Opacity + Montserrat family/sizes/weights as DTCG `$type`/`$value` leaves, values read **exactly** from the dump's `_variables` (from-dump; no invented value — FR-003, E1).
- [X] T010 [P] [US1] Author `tokens/semantic.tokens.json` — the **alias layer the Button binds to**: `color.action.<variant>.{background,foreground,border}` for the 6 variants (default/orange/blanc/outlineBlanc/link/outlineNoir), `color.nav.state`, and `font.control.{family,weight,size}`, all as `{dot.path}` refs into the primitives (D2, token-foundation.interface).
- [X] T011 [P] [US1] Collapse `tokens/modes/` to a single mode: **delete** `tokens/modes/brand.aurora.tokens.json` and `tokens/modes/semantic.dark.tokens.json`; keep one brand/mode file (aliases → primitives only) (D1).
- [X] T012 [P] [US1] Make `scripts/build-tokens.mjs` single-mode: empty `dark` map and turn the light/dark parity check into a **no-op when `dark.size === 0`** (build-tokens.mjs:66-89) — leaves a single `:root` CSS block and single-mode Figma collections.
- [X] T013 [P] [US1] Delete the **51 demo contracts** under `contracts/` — the 50 non-Button demos **and** the demo `button.contract.json` (it is *replaced fresh* in US2, not evolved — D9). After this, `contracts/` holds no component.
- [X] T014 [P] [US1] Delete the 51 demo component directories under `src/components/` (generation does not prune stale dirs — quickstart Step 1; they are re-created empty on regenerate).
- [X] T015 [US1] Run `npm run build` (tokens → schema → generate; glob-driven, auto-shrinks to **zero components**) — must be green (depends on T009–T014).
- [X] T016 [US1] Regenerate the downstream glob-driven surfaces: `npm run catalog` (clears + rewrites shards) and `npm run figma:plan` (regenerates `figma-sync/*.js`) — both shrink to empty (depends on T015).
- [X] T017 [US1] Re-pin the golden manifest: `npm run golden:update` rewrites `evals/golden.json` to the new, smaller output (drops ~200 entries) — a **regeneration, never a hand-edit** (D7, Principle IV) (depends on T015, T016).
- [X] T018 [US1] **Verify Independent Test (US1 / SC-001 / SC-002)**: `ls contracts/*.contract.json` shows no demo residue; inventory confirms zero demo contract/surface/catalog entry/golden ref; `npm run tokens` compiles clean (14 vars + 8 Montserrat styles, single `:root`) with no component yet (depends on T015–T017).
- [X] T019 [US1] **Approve & commit** (US4 checkpoint — one commit per step, FR-016/D10): `git commit -am "step(remove-demo+tokens): repo is Piqueray — 51 demo removed, mono-theme foundation laid"`.

**Checkpoint**: Repo is Piqueray tokens only. Foundation ready for the Button to bind to.

---

## Phase 4: User Story 2 — Le Button est généré depuis un contrat extrait de Figma (Priority: P1)

**Goal**: Propose the Button contract from the committed dump, hand-review and author it (authored
a11y baseline, provenance markers, `dumpedAt`), adopt it as the SSoT, and **generate** the component
+ story deterministically — bound only to Piqueray aliases.

**Independent Test**: The contract captures the 6 variants, records `fileKey` + anchors + `dumpedAt`,
binds **only** to Piqueray semantic aliases, and generates a component + story that **build green**;
two generations are byte-identical.

*(Depends on: US1 — tokens exist; Foundational T003 — dump; T004–T007 — schema fields present.)*

- [ ] T020 [US2] Propose the contract from the committed dump: `npm run extract:figma -- extract/figma/fixtures/piqueray-button.dump.json` → `proposeFromDump` (`core/propose-figma.ts`) emits a schema-valid `button.contract.proposed.json` + a `figma-proposals.md` review report (D3).
- [ ] T021 [US2] **Human review** the proposal + every `figma-proposals.md` note (FR-009): confirm the 6-value `VARIANT` axis inverted correctly to the enum (default/orange/blanc/outlineBlanc/link/outlineNoir, default = first — FR-008), the TEXT label prop, anatomy parts, and anchors; each unbound/inferred value the extractor **named** is a review line item (Honesty V). Do not proceed on rejection.
- [ ] T022 [US2] Author the **a11y + semantics baseline**, marked authored, in the reviewed proposal (FR-017/D5): `semantics = { element:"button", role:"button", provenance:"authored" }`; `a11y = { focusVisible:true, minHitArea:44, contrast:"AA", provenance:"authored" }` (Figma does not encode a11y — marker makes "authored, not extracted" machine-checkable) (depends on T021, T005).
- [ ] T023 [US2] Fill `anchors.figma.dumpedAt` from the dump's `_provenance.extractedAt`, and confirm `fileKey` + `componentSetKey` + `nodeId` are all present on `anchors.figma` (FR-007/D4) (depends on T021, T004).
- [ ] T024 [US2] Verify every `anatomy.*.tokens` value is a `{dot.path}` into the Piqueray semantic aliases (E1) — substituted refs like `{color.action.{variant}.background}` (D2); **no literals, no orphan tokens** (FR-005) (depends on T021, US1).
- [ ] T025 [US2] Adopt the reviewed proposal as `contracts/button.contract.json` — `id:"ds.button"`, `version:"1.0.0"` (fresh line, new DS — D9), `name:"Button"` (depends on T022, T023, T024).
- [ ] T026 [US2] Generate + validate: `npm run build` green — a dangling token ref would fail **BY NAME** (FR-004) — then `npx tsc --noEmit && tsc -p tsconfig.build.json` green. Produces `src/components/Button/{Button.tsx,Button.module.css,Button.stories.tsx,index.ts}` with **no hand-editing of generated output** (FR-010, E4). Then **re-pin the golden** to include the Button: `npm run golden:update` (regeneration, never hand-edit — Principle IV/D7) (depends on T025).
- [ ] T027 [US2] **Approve & commit** (US4 checkpoint): `git commit -am "step(contract): Button contract extracted from Figma dump, reviewed, adopted (6 variants, authored a11y)"` (depends on T026).
- [ ] T028 [US2] Prove determinism: `node scripts/deterministic-roundtrip.mjs` — contract→surface **byte-identical ×2**, "ZERO AI" in the conversion (FR-011). The golden byte-pin was refreshed in T026; the C1 `golden-generated-output` case then guards it (depends on T026).
- [ ] T029 [US2] **Approve & commit** (US4 checkpoint): `git commit -am "step(generate): Button surfaces generated deterministically (byte-identical ×2)"` (depends on T028).

**Checkpoint**: The Button exists as code, generated from a reviewed contract, provably deterministic.

---

## Phase 5: User Story 3 — Les gates prouvent que le Button en code correspond au Figma (Priority: P1)

**Goal**: Turn the full arsenal green on the Button — determinism, code↔contract, contract↔Figma
(drift listed in plain language), and visual ≤ 2% — and keep the engine eval suite green under the
hybrid rule.

**Independent Test**: The four fidelity axes pass: (a) byte-identical ×2, (b) code faithful to
contract, (c) contract faithful to the Figma Button (any drift listed in plain language, never
silent), (d) render visually conforms within the repo's existing tolerance.

*(Depends on US2 — generated Button + contract + committed dump.)*

- [ ] T030 [P] [US3] Re-point the **hardcoded** visual-parity subject list in `extract/figma/visual-parity/subjects.ts` (source, not generated — D8): drop the demo `badge/checkbox/switch/heading` subjects; repoint the `button` subject's `fileKey`/`setNodeId` from the demo file (`8nim1d0IPnehMxA7B7SYxC` / `5:21`) to the Piqueray file + Button set node (subjects.ts:114-118).
- [ ] T031 [P] [US3] Apply the **hybrid rule** in `evals/run.ts` (FR-002/D6): **re-point** demo-Button-wired cases to Piqueray Button (C3 code/Figma drift detectors, C1 state/hit-area/typography probes, C4 promotion, and the **C8 journey** → the Piqueray Button dump); **remove, each named by `id` in the commit body**, demo-only cases with no Button equivalent (Card slots, Table multi-slot, Heading `elementByProp`, Checkbox/Progress native controls, Banner overlay, TextField `stylesWhen`, `.get('ds.heading'|'ds.token'|…)` lookups); **leave intact** content-agnostic engine cases (schema/circular-dep refusals, token validation, brand-layer determinism, all of C5 extraction). Then `npm run golden:update` (golden already refreshed at T026; re-run only if the hybrid-rule edits changed generated output) and let the live count settle.
- [ ] T032 [US3] Gate **(a) determinism** — re-confirm `node scripts/deterministic-roundtrip.mjs` byte-identical ×2 (green since T028).
- [ ] T033 [US3] Gates **(b) + (c)** — `npm run parity` (one three-way report): code↔contract **clean** (code faithful to contract — FR-012) AND contract↔Figma either **concords or lists every drift in plain language**, never omitted (FR-013/SC-007). Any drift is resolved **upstream** (contract/tokens), never by editing generated files (Edge Cases).
- [ ] T034 [US3] Gate **(d) render↔Figma** — `npm run extract:figma:visual -- button`: masked-diff ≤ `THRESHOLD_PCT 2.0%` (existing tolerance, no new threshold — D8); any row > `3.0%` carries a named triage cause or prints `[UNTRIAGED]`. Needs Chromium; absence fails **loudly with the fix named** (depends on T030).
- [ ] T035 [US3] Keep the rest of the arsenal green: `npm run eval` (live `N/N` authoritative — count may differ from the T002 baseline per the hybrid rule, stays green), `npm run plugin:check`, `node scripts/core-browser-check.mjs` (depends on T031).
- [ ] T035a [US3] Author an **a11y assertion eval** in `evals/run.ts`: from the generated Button, assert the output exposes `role="button"` (native `<button>` or explicit role) and a non-empty **accessible name** (from the TEXT `children` binding) — fixture → eval → claim (Principle II) backing FR-017's "the generated Button is accessible". Re-`golden:update` only if the case adds a fixture; let the live count settle (depends on T026, T035).
- [ ] T036 [US3] **Verify Independent Test (US3 / SC-004 / SC-007)**: all four axes green; every contract/code/Figma gap is either resolved or listed in plain language — **no drift passed in silence** (depends on T032–T035).
- [ ] T037 [US3] **Approve & commit** (US4 checkpoint): `git commit -am "step(gates): arsenal green on Button — determinism, parity, contract↔Figma, visual ≤2%"` (depends on T036).

**Checkpoint**: Fidelity is **proven**, not eyeballed. The headline P1 deliverable (US1+US2+US3) is complete.

---

## Phase 6: User Story 4 — Validation humaine à chaque étape (Priority: P2)

**Goal**: Guarantee each step is explicitly human-approved before the next starts, with an auditable
trail. **Realized by the per-step commits already in Phases 3–5** (T019, T027, T029, T037); this
phase formalizes the gating discipline and verifies the trail.

**Independent Test**: The process stops after each step and only advances on explicit approval; an
auditable, step-by-step approval trail exists (git log).

- [ ] T038 [US4] Enforce the checkpoint discipline across the whole reconversion: **do not start step N+1 until step N is committed & approved** (US4 scenario 1); on rejection at any gate, **hold at that step until re-validated** — no advance (US4 scenario 2). This governs the ordering T019 → T027 → T029 → T037.
- [ ] T039 [US4] **Verify the auditable approval trail (SC-005 / FR-016 / D10)**: `git log --oneline` on `001-piqueray-button` shows **one commit per approved step**, each step named in the message (`remove-demo+tokens → contract → generate → gates`) — git history *is* the trail, no new tooling.

**Checkpoint**: The reconversion is a sequence of human-approved, individually-reviewable steps.

---

## Phase 7: User Story 5 — Voir le Button dans le dashboard et Storybook (Priority: P3)

**Goal**: The owner sees the generated Button and its 6 variants in the Contract Hub and Storybook.
Both are **glob-driven** — no config edits; Button (and only Button) appears after US2.

**Independent Test**: The owner opens the dashboard and Storybook and sees the Button with its 6
variants (and no demo component).

*(Depends on US2 — the generated Button.)*

- [ ] T040 [P] [US5] Verify the dashboard: `npm run dashboard` → http://localhost:5180 shows the Piqueray Button and **only** it — no demo component (glob-driven `import.meta.glob('../../contracts/*.contract.json')`, no edit) (FR-015/SC-006).
- [ ] T041 [P] [US5] Verify Storybook: `npm run storybook` shows the Button story with its **6 variants** (stories glob `../src/**/*.stories.@(ts|tsx)`, no edit) (FR-015/SC-006).

**Checkpoint**: The result is visible and shareable in both surfaces.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: The merge gate + honesty/doc reconciliation across the whole change.

- [ ] T042 [P] Full gate sweep (must be green before merge): `npm run build && npm run parity && npm run eval && npm run plugin:check && node scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && tsc -p tsconfig.build.json && npm run extract:figma:visual -- button`.
- [ ] T043 [P] Sync every quoted eval count to the live `npm run eval N/N` wherever it is claimed (README, `docs/handoff/`, the CLAUDE.md eval-count note) — no stale count survives (Honesty; the count legitimately changed under the hybrid rule).
- [ ] T044 [P] Record the reconversion in `MILESTONES.md` (dated proof log) with the live gate results, and confirm the `docs/02-contract-spec.md` bump from T006 landed — **claims rule**: no capability sentence without the eval behind it (Principle II).
- [ ] T045 Final honesty pass: confirm **no invented token values** (every value is from-dump or `authored`-marked), **removed eval cases are named by id** in the Step-4 commit body, **contract↔Figma drift is listed not omitted** (SC-007), and **no silent demo residue** remains anywhere (SC-001).

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Ph1)**: no dependencies — start immediately.
- **Foundational (Ph2)**: after Setup. **T003 (dump) blocks US1**; **T003–T007 (dump + schema) block US2**; the schema fields (T004–T008) block US3's contract-carried assertions. *(Note: the schema fields do NOT block US1 — US1 needs only the dump.)*
- **US1 (Ph3, P1)**: after T003. The tokens-first foundation.
- **US2 (Ph4, P1)**: after US1 (tokens exist) **and** Foundational (dump + schema).
- **US3 (Ph5, P1)**: after US2 (generated Button + contract).
- **US4 (Ph6, P2)**: its checkpoints are the commits inside Ph3–Ph5; verified after US3.
- **US5 (Ph7, P3)**: after US2 (needs the generated Button). Independent of US3.
- **Polish (Ph8)**: after all desired stories complete.

### Story completion order (dependency-forced, not just priority)

```
Setup → Foundational(dump) → US1(tokens) → US2(contract+generate) → US3(gates) → Polish
                    └────────────────────→ US2 also needs schema(T004–T007)
                                                         └→ US5 (after US2) ─┘
                              US4 spans US1–US3 (commit per step), verified after US3
```

Tokens-first makes US1 → US2 → US3 a **hard chain** (a binding to a missing token fails the build),
so the three P1 stories cannot be parallelized with each other.

### Within a story

- US1: token/source edits (T009–T014) are parallel → then build → catalog/figma → golden → verify → commit.
- US2: propose → review → author (a11y/dumpedAt/bindings, same file, sequential) → adopt → build → commit → determinism → commit.
- US3: the two hardcoded-list edits (T030, T031) are parallel → then the four gates + the a11y eval (T035a) → verify → commit.

### Parallel opportunities

- **Setup**: T001, T002 together.
- **Foundational**: T003 (dump) ∥ T004 (schema edit 1) ∥ T006 (docs); T005 follows T004 (same file); T007/T008 follow T005.
- **US1**: T009, T010, T011, T012, T013, T014 all `[P]` (distinct files) — the biggest parallel batch.
- **US3**: T030 ∥ T031 (distinct hardcoded files).
- **US5**: T040 ∥ T041 (distinct surfaces).
- **Polish**: T042, T043, T044 `[P]`.

---

## Parallel Example: User Story 1 (the token-foundation batch)

```bash
# All six are different files with no interdependency — launch together:
T009  Rewrite tokens/primitives.tokens.json      (12 colours + NavState + Opacity + Montserrat)
T010  Author  tokens/semantic.tokens.json         (color.action.<variant>.* aliases)
T011  Delete  tokens/modes/brand.aurora + semantic.dark
T012  Edit    scripts/build-tokens.mjs            (single-mode, dark no-op)
T013  Delete  contracts/*.contract.json           (all 51 demo)
T014  Delete  src/components/<demo dirs>
# → then converge: T015 build → T016 catalog+figma:plan → T017 golden:update → T018 verify → T019 commit
```

---

## Implementation Strategy

### First increment (US1) — the visible foundation

1. Setup (Ph1) → Foundational **T003 dump** (Ph2).
2. US1 (Ph3): remove demo + lay Piqueray tokens → `npm run tokens` green, no component yet.
3. **STOP & VALIDATE** US1 independent test → commit `step(remove-demo+tokens)`.
4. Demo-able: "the repo is Piqueray now."

### Headline P1 deliverable (US1 + US2 + US3) — the actual proof

The thesis ("Figma → code, provably faithful") is only proven once all three P1 stories land. They
are a forced chain (tokens → contract → gates), each ending in its own approved commit:

1. Foundational schema (T004–T008) — land early, inert until US2 uses it.
2. US2: propose → review → author → adopt → generate → determinism (two commits).
3. US3: gates green (determinism, parity, contract↔Figma, visual ≤2%) → one commit.
4. **STOP & VALIDATE** the four fidelity axes (SC-004) — this is the differentiating value.

### Incremental delivery

- MVP checkpoint: **US1** (foundation visible).
- Proof checkpoint: **US1+US2+US3** (fidelity gates green).
- Comfort: **US5** (dashboard + Storybook) — independent of US3, can be verified any time after US2.
- Governance: **US4** — verified over the commit trail at the end; enforced throughout.

---

## Notes

- `[P]` = different files, no dependency on an incomplete task. `[Story]` maps a task to its user story for traceability.
- **One commit per step** is both FR-016 and the natural spine — the commit *is* the human approval (US4). Name the step in the message.
- **Never hand-edit generated output** (`src/components/`, `figma-sync/*.js`, `catalog/`, `contracts/contract.schema.json`, `evals/golden.json`): all are regenerated. A hand-edit is drift the differ flags (Principle IV).
- **No value is invented**: token values are `from-dump`; a11y/semantics are `authored` and *marked* as such. Degradation (REST fallback, unbound values, removed eval cases, contract↔Figma drift) is **named, never silent** (Principle V).
- The eval suite proves the **engine**; the gates prove **Button fidelity** — do not conflate them (FR-002).
- Run everything on the **main checkout** (evals symlink `node_modules`; worktrees break). The visual gate needs **Chromium**.

**Task count**: 46 total — Setup 2, Foundational 6, US1 11, US2 10, US3 9, US4 2, US5 2, Polish 4.
