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
`contracts/button.contract.json`, the schema (+2 optional fields), and the three hardcoded lists
(`evals/run.ts`, `extract/figma/visual-parity/subjects.ts`, and — discovered in implementation —
`dashboard/src/samples.tsx`; see **CORRECTION #2**). Each story lands as one **git commit**
(the step named in the message) — git history *is* the auditable approval trail (FR-016, D10).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US5 (Setup / Foundational / Polish carry no story label)

## The load-bearing constraint — TOKENS-FIRST

A binding to a nonexistent token **fails the build by name** (FR-004). So the order is
non-negotiable: **dump → tokens (US1) → contract (US2) → gates (US3)**. Nothing generates before
the foundation it binds to exists. **No value is ever invented** — every Piqueray value is
`from-dump` or explicitly `authored`-marked (Honesty, Principle V).

> **⚠️ CORRECTION (2026-07-22, discovered in implementation).** (1) Piqueray's Figma is **flat
> primitives, no semantic layer** — the `color.action.*` layer authored in T010 was an
> **invention** and was removed (**primitives-only**, the sanctioned Polaris BYO pattern); the
> Button binds **primitives directly** via `tokensByProp`. (2) The repo joins Figma↔tokens **by
> name** and refuses names outside `[a-z0-9.-]`, so the 14 Figma variables were **renamed
> token-legal** (`Noir bleuté` → `color/noir-bleute`) — the prerequisite for automatic extraction
> (US2), the "no manual remap" the North Star demands. See research **D2 correction**.

> **⚠️ CORRECTION #2 (2026-07-22, discovered on first opening the dashboard after US2 generated
> the Button).** Four findings — none block US2; all are **recorded, not silently fixed**:
>
> 1. **The dashboard is NOT fully glob-driven.** `dashboard/src/samples.tsx` is a **hand-authored,
>    hardcoded registry** (`renderSample`) that imported all **51 demo components** to live-render
>    them; once US1 deleted the demo contracts it threw `does not provide an export named
>    'AccordionItem'` and **crashed the dashboard at load**. It is a **4th hardcoded surface** the
>    plan never counted (plan.md claimed "three", and marked `dashboard/` as "→ auto"). It is also
>    **demo residue**, so **SC-001 was violated** until fixed. Rewritten to sample the Button only,
>    `renderSample`/`SAMPLE_TEXT` API unchanged, 3 consuming views untouched (**T040a**).
> 2. **Regeneration debt is invisible.** `catalog/catalog.json` was regenerated in US1 while
>    `contracts/` was empty, so the dashboard listed **0 components** even after the Button
>    generated. Fixed by re-running `npm run catalog` + `npm run figma:plan` — a **missing
>    regeneration, not a bug**. Folded into **T026** (the golden must be re-pinned *after* these).
> 3. **Stale reports render as current — an Honesty (V) gap.** `parity/report.json` still lists the
>    51 demo contracts (incl. `ds.button@1.5.0`) and displays as "**Parity — Clean · 51 contracts
>    checked · 0 drift findings**"; `parity/snapshots/figma-*.json` are snapshots of the **demo**
>    Figma file (`8nim1d0IPnehMxA7B7SYxC`), not Piqueray (`d9FYAUcqdcNtsuaMgLefvJ`) — which is why
>    every Binding-map row reads ✗ (the lone `font/weight/medium` ✓ is a **false positive**: the
>    demo file happens to carry the same variable name, and the repo joins **by name**). T033
>    regenerates them, but **nothing marks a stale report as stale** — a silent-omission class bug,
>    the highest severity here (**T045b**).
> 4. **The adherence A/B was never re-planned.** `evals/adherence/results.json` (100 vs 69) is
>    demo-era and no task re-runs or retires it — a genuine **hole in the task list** (**T045c**).
>
> **The minted dimension tokens read ✗ "not in Figma" — that means "NOT YET SYNCED", not "fake".**
> *(Note itself CORRECTED 2026-07-22: an earlier draft called this ✗ "expected-permanent" and framed
> the mint as dishonest. Both were wrong, on two counts.)*
>
> - **(a) T024 offered a FALSE BINARY.** "Mint or omit" was wrong: the schema admits **`literals`**
>   for exactly these channels — `LITERAL_CHANNELS` contains `padding-block`/`padding-inline`, `gap`,
>   `border-radius`, `border-width`, `line-height`, documented as *"geometry and paint channels where
>   **foreign systems keep component-private literals**"*. A third, purpose-built option existed and
>   was not presented.
> - **(b) The ✗ is a to-do, not a lie.** The contract is the SSoT that generates **both** surfaces:
>   `figma-sync/01-tokens.js` **already** carries `space/{0,4,10,16,32}`, `radius/32`,
>   `border-width/{0,2}`, `font/line-height/22` with correct Figma scopes (`GAP`, `CORNER_RADIUS`,
>   `STROKE_FLOAT`) + `codeSyntax`. Running contract→Figma **creates** them and the ✗ become ✓.
>
> **OWNER DECISION — (A) keep the mint.** Piqueray *gains* a governed spacing/radius/border scale;
> that is the product's thesis (one contract, two surfaces, both governed). The ✗ is **"sync pending"**.
>
> **⛔ SYNC SAFETY — do NOT run contract→Figma yet:**
> 1. `figma-sync/02-button.js` **REDRAWS** the Bouton set from the contract (targets the existing set
>    by key `e6fa6786…`, guarded to fileKey `d9FYAUcqdcNtsuaMgLefvJ`). Our contract **deliberately
>    dropped the `cil:arrow-*` icons** → syncing now would **DELETE them from the designers' file**.
> 2. **Order is non-negotiable: prove fidelity FIRST (US3 — parity + visual ≤ 2%), sync AFTER.**
>    Never push an unverified contract into a production design file.
> 3. Verify Piqueray's 14 variables live in a collection literally named **"Primitives"** —
>    `01-tokens.js` upserts that name, so a differently-named existing collection would be **DUPLICATED**.
> 4. `border-width/0` is a **technical artefact** (it exists only so the emitter resolves
>    `border-style: solid`), **not** a design decision — revisit before engraving it in Figma.
>
> Contract→Figma sync is **out of scope for this feature** (data-model E3) → its own follow-up.

> **⚠️ CORRECTION #3 (2026-07-22, discovered running the Phase-4 gates).** US1's **mono-theme
> migration was INCOMPLETE**, and it — not "demo coupling" — is the single biggest cause of the red
> eval suite. Recorded, with numbers:
>
> 1. **Only 3 files were made dark-tolerant in US1** (`build-tokens.mjs`, `generate-figma.ts`,
>    `generate-components.ts`, each carrying a "Mono-theme (Piqueray)" comment). **~35 files
>    reference `tokens/modes/semantic.dark.tokens.json`**; every other one still read it
>    unconditionally and threw `ENOENT`. That is why `deterministic-roundtrip`, `plugin:check`,
>    `core-browser-check` and `parity` were red — **not** demo coupling.
> 2. **Fixed here (6 engine files)**, same sanctioned `existsSync ? read : {}` pattern:
>    `scripts/build-plugin-zip.mjs`, `scripts/core-browser-check.mjs`, `parity/diff.ts`,
>    `core/emitters-check.ts`, `core/mint-check.ts`, `core/mint-code-check.ts`.
> 3. **STILL BROKEN — 36 eval cases** fail on the same `ENOENT` (e.g.
>    `examples/depth-composite/emit-composite-receipt.ts`, many `extract/figma/*-check.ts`).
>    Finishing this sweep belongs to **T031**.
> 4. **The determinism harness was built on a DEMO COMPOSITE.**
>    `scripts/deterministic-roundtrip.mjs` bundled `ds.composite-modal` + the `card/badge/avatar/
>    button` demo contracts **and** needed the demo token set (`buildEngineBundle()` bakes the
>    repo's `tokens/`, and takes no override). Keeping it would have meant maintaining a **parallel
>    fake design system** forever, so it is **re-pointed onto the Piqueray Button** (the hybrid rule
>    the spec already applies to evals: re-point, don't delete). **NAMED DEGRADATION**: composite
>    depth (nested instances, repeated collections, slots, multi-root anatomy) is **no longer
>    exercised**; restore it when Piqueray gains a composite component. The limit is printed by the
>    script itself and documented in its header. **T028 passes**: byte-identical ×2, 6 variants
>    built, API recovered from the canvas, `<button>` host emitted.
> 5. **The documented gate command is STALE.** `CLAUDE.md` and `docs/handoff/` say
>    `node scripts/deterministic-roundtrip.mjs`; it imports `core/emit-react.js` (a TS module) so
>    plain `node` cannot resolve it — it requires **`npx tsx`**. Pre-existing, not caused here.
>
> **Eval baseline, measured (the honest before/after):** last **committed** green run = **146/146**
> (demo era) → **50/147** now. The 97 failures: **36** `semantic.dark` ENOENT · **18** deleted demo
> contract refs · **10** demo drift expectations (`Card`, `Table`, `Button.Size`) · **6** eval
> mutations targeting demo props (`size`, `loading` — they now hit the *Piqueray* Button and miss) ·
> **27** other. **~70 of 97 are direct reconversion residue** → that is T031's real size, now known
> instead of guessed. *(Caveat: `npm run eval` OVERWRITES `evals/results.json`; snapshot it first if
> you need an intermediate before/after — one was lost this way.)*

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
- [X] T010 [P] [US1] Author `tokens/semantic.tokens.json` — **CORRECTED to primitives-only**: it holds ONLY the 8 real Montserrat typography styles (`typography.titre-1..6`, `paragraphe`, `lead`) as aliases into primitives. The `color.action.*` / `color.nav.state` / `font.control.*` alias layer was an **invention** and was **removed** — Piqueray's Figma is flat primitives with no semantic layer, so the Button binds **primitives directly** (`{color.noir-bleute}` via `tokensByProp`), per the Polaris BYO precedent. See research **D2 correction**.
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

- [X] T020 [US2] Propose the contract from the committed dump: `npm run extract:figma -- extract/figma/fixtures/piqueray-button.dump.json` → `proposeFromDump` (`core/propose-figma.ts`) emits a schema-valid `button.contract.proposed.json` + a `figma-proposals.md` review report (D3).
- [X] T021 [US2] **Human review** the proposal + every `figma-proposals.md` note (FR-009): confirm the 6-value `VARIANT` axis inverted correctly to the enum (default/orange/blanc/outlineBlanc/link/outlineNoir, default = first — FR-008), the TEXT label prop, anatomy parts, and anchors; each unbound/inferred value the extractor **named** is a review line item (Honesty V). Do not proceed on rejection.
- [X] T022 [US2] Author the **a11y + semantics baseline**, marked authored, in the reviewed proposal (FR-017/D5): `semantics = { element:"button", role:"button", provenance:"authored" }`; `a11y = { focusVisible:true, minHitArea:44, contrast:"AA", provenance:"authored" }` (Figma does not encode a11y — marker makes "authored, not extracted" machine-checkable) (depends on T021, T005).
- [X] T023 [US2] Fill `anchors.figma.dumpedAt` from the dump's `_provenance.extractedAt`, and confirm `fileKey` + `componentSetKey` + `nodeId` are all present on `anchors.figma` (FR-007/D4) (depends on T021, T004).
- [X] T024 [US2] Verify every `anatomy.*.tokens` value is a `{dot.path}` into the Piqueray **PRIMITIVES** (E1) — **per-variant primitive refs via `tokensByProp`** (e.g. text `color` base `{color.blanc}`, `tokensByProp` property1 → `{color.noir-bleute}`; per-variant `background`: default `{color.noir-bleute}`, orange `{color.orange}`, blanc `{color.blanc}`, outline/link transparent). **NOT** `{color.action.{variant}.background}` (see D2 correction — Piqueray has no semantic layer). **No literals, no orphan tokens** (FR-005) (depends on T021, US1).
- [X] T025 [US2] Adopt the reviewed proposal as `contracts/button.contract.json` — `id:"ds.button"`, `version:"1.0.0"` (fresh line, new DS — D9), `name:"Button"` (depends on T022, T023, T024).
- [X] T026 [US2] Generate + validate: `npm run build` green — a dangling token ref would fail **BY NAME** (FR-004) — then `npx tsc --noEmit && tsc -p tsconfig.build.json` green. Produces `src/components/Button/{Button.tsx,Button.module.css,Button.stories.tsx,index.ts}` with **no hand-editing of generated output** (FR-010, E4). Then **re-pin the golden** to include the Button: `npm run golden:update` (regeneration, never hand-edit — Principle IV/D7) (depends on T025).
- [X] T027 [US2] **Approve & commit** (US4 checkpoint): `git commit -am "step(contract): Button contract extracted from Figma dump, reviewed, adopted (6 variants, authored a11y)"` (depends on T026).
- [X] T028 [US2] Prove determinism: `node scripts/deterministic-roundtrip.mjs` — contract→surface **byte-identical ×2**, "ZERO AI" in the conversion (FR-011). The golden byte-pin was refreshed in T026; the C1 `golden-generated-output` case then guards it (depends on T026).
- [X] T029 [US2] **Approve & commit** (US4 checkpoint): `git commit -am "step(generate): Button surfaces generated deterministically (byte-identical ×2)"` (depends on T028).

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

- [X] T030 [P] [US3] Re-point the **hardcoded** visual-parity subject list in `extract/figma/visual-parity/subjects.ts` (source, not generated — D8): drop the demo `badge/checkbox/switch/heading` subjects; repoint the `button` subject's `fileKey`/`setNodeId` from the demo file (`8nim1d0IPnehMxA7B7SYxC` / `5:21`) to the Piqueray file + Button set node (subjects.ts:114-118).
- [X] T031 [P] [US3] Apply the **hybrid rule** in `evals/run.ts` (FR-002/D6): **re-point** demo-Button-wired cases to Piqueray Button (C3 code/Figma drift detectors, C1 state/hit-area/typography probes, C4 promotion, and the **C8 journey** → the Piqueray Button dump); **remove, each named by `id` in the commit body**, demo-only cases with no Button equivalent (Card slots, Table multi-slot, Heading `elementByProp`, Checkbox/Progress native controls, Banner overlay, TextField `stylesWhen`, `.get('ds.heading'|'ds.token'|…)` lookups); **leave intact** content-agnostic engine cases (schema/circular-dep refusals, token validation, brand-layer determinism, all of C5 extraction). Then `npm run golden:update` (golden already refreshed at T026; re-run only if the hybrid-rule edits changed generated output) and let the live count settle.
- [X] T032 [US3] Gate **(a) determinism** — re-confirm `node scripts/deterministic-roundtrip.mjs` byte-identical ×2 (green since T028).
- [X] T033 [US3] Gates **(b) + (c)** — `npm run parity` (one three-way report): code↔contract **clean** (code faithful to contract — FR-012) AND contract↔Figma either **concords or lists every drift in plain language**, never omitted (FR-013/SC-007). Any drift is resolved **upstream** (contract/tokens), never by editing generated files (Edge Cases).
- [ ] T034 [US3] Gate **(d) render↔Figma** — `npm run extract:figma:visual -- button`: masked-diff ≤ `THRESHOLD_PCT 2.0%` (existing tolerance, no new threshold — D8); any row > `3.0%` carries a named triage cause or prints `[UNTRIAGED]`. Needs Chromium; absence fails **loudly with the fix named** (depends on T030).
- [X] T035 [US3] Keep the rest of the arsenal green: `npm run eval` (live `N/N` authoritative — count may differ from the T002 baseline per the hybrid rule, stays green), `npm run plugin:check`, `node scripts/core-browser-check.mjs` (depends on T031).
- [ ] T035a [US3] Author an **a11y assertion eval** in `evals/run.ts`: from the generated Button, assert the output exposes `role="button"` (native `<button>` or explicit role) and a non-empty **accessible name** (from the TEXT `children` binding) — fixture → eval → claim (Principle II) backing FR-017's "the generated Button is accessible". Re-`golden:update` only if the case adds a fixture; let the live count settle (depends on T026, T035).
- [ ] T036 [US3] **Verify Independent Test (US3 / SC-004 / SC-007)**: all four axes green; every contract/code/Figma gap is either resolved or listed in plain language — **no drift passed in silence** (depends on T032–T035).
- [ ] T037 [US3] **Approve & commit** (US4 checkpoint): `git commit -am "step(gates): arsenal green on Button — determinism, parity, contract↔Figma, visual ≤2%"` (depends on T036).

**Checkpoint**: Fidelity is **proven**, not eyeballed. The headline P1 deliverable (US1+US2+US3) is complete.

---

## Phase 5b: Make the Button safe to sync back to Figma (OWNER PRIORITY — do immediately after Phase 5)

**Why this exists**: added 2026-07-22 on the owner's instruction, after reading what
`figma-sync/02-button.js` actually does. It is **amend-capable**, not create-only (the parity
remedy string saying "CREATE-only" is stale): it finds the existing set by identity marker,
**preserves** the set node + key, every variant node id, and the componentProperty ids (so the
Header nav instance and any instance-level overrides survive) — but it **wipes and rebuilds the
INTERIOR of every variant** from the contract (`child.remove()` then rebuild). Extra variants are
reported, never deleted.

**Consequence**: the `cil:arrow-left` / `cil:arrow-right` instances live *inside* the Bouton
variants, and the contract does not carry them. First sync ⇒ they vanish from the variants. (The
icon master components elsewhere in the file are untouched.) Nothing may be pushed to Figma until
this is resolved.

- [ ] T037a **Decide and record the icon question** — the Figma Bouton set nests `cil:arrow-left` and `cil:arrow-right` (`nestedInstances` in `parity/snapshots/figma-components.json`); the extracted contract dropped them. Two legitimate outcomes, and the choice is the owner's: **(a) carry them in the contract** — model the icon as an `INSTANCE_SWAP` slot or an optional icon prop, so the generated variants keep them and code gains the same affordance; or **(b) accept the removal** — the icons were decoration the code does not need, in which case say so *in the contract description* and expect the sync to strip them. Record the decision and its reason; do not let it be settled by default.
- [ ] T037b **If (a): extend the contract** to express the nested icons, regenerate (`npm run build`), re-pin the golden (`npm run golden:update`), and confirm `npm run parity` no longer reports the nested-instance difference. Contract semver: added optional prop/slot = **minor** → `ds.button@1.1.0`.
- [ ] T037c **Neutralise the collections the token sync would invent.** `figma-sync/01-tokens.js` unconditionally upserts **three** collections. `Primitives` is correct (it now matches the file). But `BRAND = []` still creates an **empty `Brand` collection**, and `SEMANTIC` creates a `Semantic` collection carrying a **`Dark` mode** — both demo-era shapes in a single-brand, single-theme system. Fix in `scripts/generate-figma.ts` (the generator, never the generated script): skip a collection whose token list is empty, and emit only the modes that exist. Otherwise the first sync pollutes the designers' file with two collections nobody asked for.
- [ ] T037d **Pre-flight checklist before the first push**, run in order and recorded: (1) the icon decision is landed; (2) T037c done; (3) `npm run parity` reviewed finding-by-finding — the sync **overwrites variable values**, so any Figma-side change the repo has not adopted is lost; (4) a **named version saved in Figma** (file menu → *Save to version history*) as the restore point; (5) the visual gate (T034) green, which still needs `FIGMA_TOKEN`.

**Checkpoint**: the contract can be pushed to the designers' file without destroying anything they own.

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

- [X] T040a [US5] **De-demo the dashboard's hardcoded sample registry** (CORRECTION #2.1, done 2026-07-22): `dashboard/src/samples.tsx` imported all **51 demo components** and crashed the dashboard at load once US1 deleted them (`does not provide an export named 'AccordionItem'`). Rewritten to sample the **Button only**; `renderSample`/`SAMPLE_TEXT` API unchanged so `ComponentsList` / `ComponentDetail` / `CodeEditorSim` are untouched; header comment now **names it a hand-maintained hardcoded list**. Verified: no other dashboard file imports `src/components`; `tsc` green (root, lib, dashboard). **Blocks T040.**
- [ ] T040 [P] [US5] Verify the dashboard: `npm run dashboard` → http://localhost:5180 shows the Piqueray Button and **only** it — no demo component (FR-015/SC-006). ⚠️ **CORRECTED**: the dashboard is glob-driven for the contract data (`import.meta.glob('../../contracts/*.contract.json')`) **but NOT for live previews** — `dashboard/src/samples.tsx` is hand-maintained (T040a) — **and the component list reads the generated `catalog/catalog.json`**, so `npm run catalog` must have run *after* the contract exists (CORRECTION #2.2), else the list shows zero components.
- [ ] T041 [P] [US5] Verify Storybook: `npm run storybook` shows the Button story with its **6 variants** (stories glob `../src/**/*.stories.@(ts|tsx)`, no edit) (FR-015/SC-006).

**Checkpoint**: The result is visible and shareable in both surfaces.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: The merge gate + honesty/doc reconciliation across the whole change.

- [ ] T042 [P] Full gate sweep (must be green before merge): `npm run build && npm run parity && npm run eval && npm run plugin:check && node scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && tsc -p tsconfig.build.json && npm run extract:figma:visual -- button`.
- [ ] T043 [P] Sync every quoted eval count to the live `npm run eval N/N` wherever it is claimed (README, `docs/handoff/`, the CLAUDE.md eval-count note) — no stale count survives (Honesty; the count legitimately changed under the hybrid rule).
- [ ] T044 [P] Record the reconversion in `MILESTONES.md` (dated proof log) with the live gate results, and confirm the `docs/02-contract-spec.md` bump from T006 landed — **claims rule**: no capability sentence without the eval behind it (Principle II).
- [ ] T045 Final honesty pass: confirm **no invented token values** (every value is from-dump or `authored`-marked), **removed eval cases are named by id** in the Step-4 commit body, **contract↔Figma drift is listed not omitted** (SC-007), and **no silent demo residue** remains anywhere (SC-001).
- [ ] T045b **Stale reports must not render as current** (CORRECTION #2.3 — Honesty V, silent-omission class). The dashboard displays `parity/report.json` and `parity/snapshots/figma-*.json` with **no staleness marker**: after US1 it showed "Parity — Clean · 51 contracts checked · 0 drift findings" about **deleted** contracts, and the Binding map compared the Piqueray contract against a snapshot of the **demo** Figma file. T033 regenerates the content, but the **latent bug is the missing marker**. Decide and implement the honest minimum: surface each report's `fileKey`/timestamp/contract-set and **flag it stale** when it does not match the current contracts + `anchors.figma.fileKey` (never present a stale report as a clean verdict).
- [ ] T045c **Decide the fate of the adherence A/B** (CORRECTION #2.4 — hole in the plan). `evals/adherence/results.json` (100 vs 69, 5 screens, demo-era) is displayed as a headline stat but was **never re-planned for Piqueray**; no task re-runs or retires it. Choose explicitly: (a) **re-run** the A/B against the Piqueray catalog (fixture → eval → claim, Principle II), or (b) **retire/label** the tile as a demo-era artifact. **Claims rule**: the score must not be quoted as a Piqueray capability while it measures the demo.

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
