# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A proof-of-concept (and candidate reference implementation) for a vendor-neutral **component contract** spec. The load-bearing idea: a component's source of truth is neither the design file nor the code, but a small versioned **JSON contract** that *generates both*. 51 contracts + 282 DTCG tokens generate a typed React library and a native Figma library, and a three-way differ continuously proves both still match the contracts.

Two non-negotiable principles govern every change here:

- **Determinism — no AI in the conversion.** The contract→surface pipeline is pure functions, byte-pinned against golden manifests. AI may *assist* (propose a contract, help author an emitter) but is **never** in the generation path. The guarantee is "byte-identical across two runs," which an AI-in-the-loop cannot make.
- **The claims rule — no capability claim without an eval behind it.** Order is always: fixture → eval → claim. Never add a capability sentence to README/docs before an adversarial check backs it in `npm run eval`. See `CONTRIBUTING.md`.
- **The source-cleanliness rule — clean the Figma BEFORE contracting it (owner rule, the Button lesson, 2026-07-23).** Step 0 of any component spec is an audit + cleanup of its Figma source: unofficial affordances made official (properties, not hidden-layer hacks), names telling the truth, structure consistent — THEN extract. Never model around a dirty source. Receipts: the Button shipped from an unclean set (icon visibility bricolée via hidden layers ×42, a STRING variable named `color/nav-state`) and it cost a full day of rework and nearly crashed the first push. Audit = source (masters: structure, constraints, variable bindings, sizes, descriptions) AND usage (every instance across every page, scanned by POSITION never by name). **Corollary (owner, 2026-07-24): for ANY discrepancy you MUST first decide "is this from Figma or not?"** — a fixed-width master vs FILL usage, a raw hex vs a bound variable, a missing property — before touching code. A Figma-source defect is fixed at the source (coordinate), never worked around in code.
- **The docs-first rule — READ the docs BEFORE deriving (owner rule, 2026-07-24: "la doc est là, vous la zappez à chaque fois").** `docs/` is the authoritative base, not an afterthought — it already answers most "how does X work here / should this be fixed or fluid / is this a Figma limit" questions. Consult it via **auggie MCP** (`mcp__auggie__codebase-retrieval`, natural-language `information_request`) FIRST — before re-deriving a rule from the code, before a modeling decision, before answering a capability question. Key docs: `docs/handoff/` (13-file AI-to-AI onboarding, most authoritative), **`docs/FIGMA-CAPABILITY-MATRIX.md`** (every CSS↔Figma capability + the FIXED/HUG/FILL sizing model, what's CARRY-BOTH vs CARRY-CODE-ONLY vs a named limit), `docs/00-…-15-*.md`. Re-deriving what a doc already states is the exact waste this rule exists to stop.

## Commands

```bash
npm install                # Node >= 20 required
npm run build              # tokens -> schema -> generate all 51 components (validated against contracts)
npm run dashboard          # Contract Hub app -> http://localhost:5180
npm run storybook          # the generated React library
npm run playground         # the browser playground (imports core/ unmodified)
```

**The gates — every change must leave all of these green:**

```bash
npm run build                              # tokens -> schema -> components, contract-validated
npm run parity                             # three-way differ: code, canvas, tokens vs contracts (clean = in sync)
npm run eval                               # the deterministic suite — 108 checks, 108/108 passing (see below)
npm run plugin:check                       # window.DSC builds correct anatomy; specHash mirror; drift refusal
npx tsx scripts/deterministic-roundtrip.mjs   # contract->canvas byte-identical x2; loop closes ("ZERO AI") — needs tsx (imports core/*.ts via .js specifiers), plain `node` cannot resolve them
node scripts/core-browser-check.mjs        # core/ barrel bundles browser-pure; 4 emitters run in a no-node VM
npx tsc --noEmit && npx tsc -p tsconfig.build.json   # types (src, scripts, core, extract, parity, evals + lib build)
```

**Targeted checks** (there is **no single-eval filter flag** — `npm run eval` runs the whole suite): use the granular npm scripts instead — `npm run emitters:check`, `npm run mint:check`, `npm run mint:code:check`, `npm run extract:figma:*:check` (dialog, composite, tooltip, theme, repeat, …), `npm run parity`. These are the "run one thing" equivalents.

Eval gotcha: `npm run eval` symlinks `ROOT/node_modules` into its scratch dir, so it **cannot run inside a git worktree** (worktrees have no `node_modules`) — run it on the main checkout. Two checks (one eval + the visual-parity instrument) drive real Chromium; if missing, the error names the fix (`npx playwright install chromium` or set `PLAYWRIGHT_CHROMIUM_PATH`).

Eval-count note: the current suite is **108** checks — **108/108 pass**. Spec 004 added **6** (category: C6 grouping, C2 unknown-value refusal, tolerance; native form controls: void/defaultValue input+textarea, checkbox+select; the D7 internal-glyph-consumed parity class) — all fixture→eval→claim before any doc relied on them. Before that, the 3 that were an *intentional* red block (baseline-parity-clean, baseline-acknowledges-without-failing, promotion-converges) went **green** when spec 002 landed the single master update on the real Figma file (`step(3-master)`, `c8512f7`) — `npm run parity` now reaches zero active findings, so the baseline/promotion cases pass. The count dropped from 146 during the Piqueray reconversion (2026-07-22/23) under the hybrid rule: demo-only cases with no Button equivalent were removed (named by id in the commit body, see `evals/REMOVED-CASES.md`); 49 are quarantined pending Piqueray features (slots, composites, dark theme, a second brand), not deleted. `npm run eval` prints the live `N/N` — trust that over this note; keep quoted counts in sync when you add/remove a case (`grep -rn` the number).

## Architecture

Flow is **outward from the contract to both surfaces, and back in as promotions** — surfaces never sync side-to-side. An engineer's new prop and a designer's color change take the same path: flagged by the differ → promoted into the contract as a reviewable diff → regenerated to the other surface.

- **`contracts/*.contract.json`** — the source of truth (51 components). A `Contract` (Zod-validated) has `id, name, version, props, anatomy, tokens, states, semantics, a11y, figma, modes, …`. Key concepts: `anatomy` is a `Record<string, Part>` so a component can be **multi-root** (a Modal is `{ dialog, backdrop }`, no wrapping root); props carry **dual bindings** (`bindings.figma` VARIANT/TEXT/BOOLEAN/INSTANCE_SWAP + `bindings.code`); composition via `component` (nested instance), `repeat + component` (collection), and `slot + accepts` (INSTANCE_SWAP slot).

- **`core/`** — the **engine as a pure browser-safe library**. Zero `node:*` imports anywhere in its module graph (receipted by `core-browser-check.mjs`). `core/index.ts` is the barrel: contracts go in as **data** (objects/maps, never paths), strings come out. Everything downstream is a thin shell over this:
  - **Emitters** (`core/emitter.ts` + `core/emit-*.ts`) — a pluggable registry `Emitter { name, label, emit(contract, ctx) }`. Four built-ins: `react` (the shipping generator, React + CSS Modules), `html` (static, no build), `react-inline` (tokens resolved to literals), `figma-script` (the canvas as an emit target). Only `react` is wired into `npm run generate`; its output is byte-guarded by `evals/golden.json`. `registerEmitter()` opens the registry to plugins. `validateContract` (in `emit-react.ts`) is the shared **refusal gate** — invalid/unresolvable contracts fail *by name*.
  - **Figma emit engine** (`emit-figma-script.ts`) — `createFigmaEngine(ctx)` splits a small deterministic per-component **spec** (`compileComponentData`) from a large shared **runtime** interpreter (`buildComponentScript`).
  - **Extractors** — code→contract (`propose-code.ts`, `extract-react-tsx.ts`, `extract-css-module.ts`) and canvas→contract (`propose-figma.ts`). Unmapped observed values mint provisional `imported.*` tokens (`mint-tokens.ts` / `mint-code.ts`) — never invented, always reported.

- **`packages/`** — npm workspaces. `schema/` is `@ds-contracts/schema`, the **single live Zod document** at `packages/schema/src/contract-schema.ts`; `scripts/contract-schema.ts` is a **re-export shim** over it (so every `../scripts/contract-schema.js` import keeps working). `cli/` is `@ds-contracts/cli` (bin `ds-contracts`: verbs `init, extract, generate, figma, diff, propose-pr`). `emitter-web-components/` is a plugin-emitter example.

- **`figma-sync/`** — generated transport-agnostic canvas scripts + the **Sync Runner plugin** (`figma-sync/plugin/`). The engine barrel is bundled into `window.DSC` (browser-pure IIFE) and injected into `ui.html` at build time; it is pure compute (contract text in, plain-words reports + Plugin-API script text out — never touches the `figma` global). `code.js` executes the scripts.

- **`scripts/plugin-engine-mock-figma.mjs`** — a faithful mock of the Figma Plugin API that runs the engine's scripts in a Node VM with no Figma/network. Its fidelity is **load-bearing and imperfect** — a lenient mock once let a real SVG bug through. **Mock-fidelity discipline:** when you find a bug that only appears on the live canvas, the fix has two parts — (1) fix the emitter, (2) teach the mock to catch that class headlessly forever.

- **`parity/`** — the three-way differ (classifies every contract/code/canvas difference as ahead/behind/mismatched with a proposed remedy), the adherence judge, and the brownfield `diagnose` referee.

- **`tokens/`** — 282 DTCG tokens: primitives → brand modes → semantic aliases → light/dark. One pipeline (`scripts/build-tokens.mjs`) compiles to CSS custom properties *and* Figma variable collections. Adding a brand touches ONLY this dir (eval-proven). Contracts bind parts by `{dot.path}`; a binding to a nonexistent token fails the build.

- **`evals/`** — `run.ts` copies a scratch workspace, runs the **real** pipeline, applies one mutation, asserts exact behavior, byte-compares against `golden.json`, writes `results.json`. Families: C1 determinism, C2 refusal, C3 detection, C4 convergence, C5 extraction, C6 theming, C7 cli, C8 journey.

## What to edit — and what is generated (never hand-edit)

| Change | Where |
|---|---|
| Component API / anatomy / token bindings / events | `contracts/*.contract.json` → then `npm run build` |
| Design tokens (incl. adding a brand) | `tokens/*.tokens.json` |
| Schema capabilities | `packages/schema/src/contract-schema.ts` — **add optional fields only, never repurpose**; bump `docs/02-contract-spec.md` |
| Generator behavior | `scripts/generate-components.ts`, `scripts/generate-figma.ts`, `core/emit-*.ts` |
| Extraction / brownfield | `extract/`, `core/propose-*.ts`, `core/extract-*.ts` |
| **Generated — NEVER by hand** | `src/components/`, `figma-sync/*.js`, `catalog/catalog.json`, `contracts/contract.schema.json` |

Hand-editing generated output *is* drift — the differ will flag it. That is the product working, not a bug to route around. Contract semver: added optional prop = minor; removed/renamed prop or value = major; widening a slot's `accepts` = minor, narrowing = major. The PR diff of a contract *is* the design-system change review.

## Honesty conventions

Degradation is named, never silent. Extraction marks every heuristic (`confidence: "inferred"`) and reports everything it can see but not read — silent omission is the highest-severity bug class here. If a check is skipped, the output must say so. Limits are documented where the capability is claimed, not in a footnote elsewhere.

## Documentation map

- `docs/handoff/` — a 13-file AI-to-AI onboarding package (concept, determinism, architecture, tooling, what-works / what-doesn't, testing-and-gates, history). **This is the most current and authoritative source** (verified against the codebase 2026-07-21) — prefer it over the README where they disagree (e.g. eval count).
- `docs/00-getting-started.md` … `docs/15-engine-as-library.md` — the working documents.
- `docs/reference/demo-archive/` — the 51 pre-reconversion demo contracts (tree `0e37de2`, tag `demo-51`; deleted at `8f462af`), materialized read-only. **Before modeling a new Piqueray component, read its INDEX.md row + file**: how did the demo model it — steal or reject with named reasons in the spec's research.md (002 precedent: reused the templated icon part, rejected the open slot). Only the contracts were deleted; the emitters/parity/schema machinery is the live code (dormant), and the demo's generated code/tokens/evals live at `demo-51` (recipes in the archive README). Never build input; demo-era schema+tokens — never copy into `contracts/` as-is.
- `MILESTONES.md` (dated proof log), `CHANGELOG.md` (releases), `ROADMAP.md`.

## Active Technologies
- TypeScript 5.x, Node ≥ 20, ESM (run via `tsx`) (001-piqueray-button)
- Zod (`@ds-contracts/schema`), React 18 + CSS Modules (the `react` emitter), Vite, Storybook, `playwright-core` (visual parity), Figma Plugin API (001-piqueray-button)
- JSON on disk — `contracts/*.contract.json` (SSoT), DTCG `tokens/*.tokens.json`, `catalog/`, byte-pinned `evals/golden.json` (001-piqueray-button)
- Figma REST API (dumps + PNG/SVG export, `FIGMA_TOKEN`) + figma-console MCP (lint, targeted master edits, version checks), pixelmatch state photography (002-governed-icons-button)
- JSON on disk — `contracts/icons.registry.json` (new SSoT document, v1.0.0: the governed icon set) + `contracts/button.contract.json` → v1.4.0; `assets/icons/*.svg` = extracted code-side set pruned to the registry (002-governed-icons-button)
- TypeScript (repo pin `typescript@^6`), Node ≥ 20, ESM exécuté via `tsx` + Zod (`@ds-contracts/schema` — la seule source du schéma), React 19 + CSS Modules (émetteur `react`), Storybook 10, Vite, `playwright-core` + `pixelmatch` (instrument visuel existant), Figma REST API en LECTURE (`FIGMA_TOKEN`) + pont figma-console en lecture (refresh snapshot, relevés) (004-input-atoms-categories)
- JSON sur disque — `contracts/*.contract.json` (+4), `contracts/icons.registry.json` (v1.1.0), `tokens/*.tokens.json` (inchangés), `evals/golden.json` (re-pin), `parity/snapshots/*` (refresh lecture), `parity/baseline.json` (acquittements owner éventuels) (004-input-atoms-categories)

## Recent Changes
- 004-input-atoms-categories (closed 2026-07-24): the 4 input atoms (Input/Textarea/Select/Checkbox) governed by contract, faithful on both surfaces + **accessible native controls**; a `category` schema field (`atom`/`molecule`/`section`, additive-optional) groups the 3 generated surfaces (Storybook/catalog/Contract Hub) via one `CATEGORY_LABELS`; Button → v1.5.0 (+category, icon enum 13→16); icon registry → v1.1.0 (**16**: +facebook/instagram/star; star is orange-fixed, does NOT recolor, D6) + `check.svg` **internal glyph** (parity's "consumed-by-a-fixed-icon.asset ⇒ not-orphan" class, D7). **Generator extended for NATIVE FORM CONTROLS at the root** (the demo only ever nested them in molecules): void/native-text root → self-close + value via `defaultValue`; native checkable → `defaultChecked` from its VARIANT even with no event; `<select>` content → wrapped in an `<option>`. **LECTURE-SEULE Figma** throughout (REST dumps + SVG exports + ONE read-only bridge inventory to refresh the parity snapshot; `/versions` before/after proves zero 004 edits — coexistence with spec 003 on the live file). Atoms are **content-width bricks** — the master's fixed 280px is a frame default; real usage is `layoutSizingHorizontal: FILL` (the Field molecule stretches them). `img.ts` never resamples (a size delta is a REAL mismatch), so at close the fluid atoms were NOT pixel subjects (only the fixed Checkbox). **Post-close QA (owner review) superseded that + fixed real bugs the gates missed**: (1) an additive `renderWidth` renders the code at the master's 280px frame → **Input/Textarea are now pixel subjects at 0.00%** (`<input>`/`<textarea>` render text headless), **Select excluded** (a native `<select>` drops its option text in headless Chromium — code is correct, the real-browser/dashboard render shows it), so 5 visual subjects (`7ddca00`/`ceb7882`); (2) the **Checkbox "freeze"** was an invisible native-checkable `<input>` overlay escaping to `<body>` and eating every click — root `position:relative` when a part is `isNativeCheckablePart` (`963d74e`); (3) the **dead playground controls** (uncontrolled atoms → a changed control never updated the DOM) fixed by a keyed remount on both surfaces (`1e1eb99` dashboard, `1bb3abd` Storybook, Polaris regen `c26c0a7`). 8/8 gates green, suite 108/108; branch open as **PR #3**.
- 002-governed-icons-button (closed — Steps 0–4, `step(4-closure)`): governed icon registry (`contracts/icons.registry.json`, verified registry ↔ code ↔ Figma by a new parity icons axis); Button icon-choice via INSTANCE_SWAP-bound enum props (extracted — propose-figma lowering closes the v1.2 named gap), then v1.4.0 rebinds the label to the real `Libellé` TEXT property; ONE targeted master update (label TEXT property + governed `preferredValues`) proven on the real client file by positional scan + 9-page state photography (0.000%) + restore points; the 3 intentional red evals are green (parity zero); suite live at 102/102. **The old demo icon set is gone, not reusable as-is**: the pre-reconversion `assets/icons/` (search/close/spinner/warning/… — 22-23 files) belonged to the deleted 51-component demo system, removed at `8f462af` (full history still in git, nothing destroyed) — a few filenames coincidentally matched real Piqueray icon names (e.g. `chevron-left.svg`) but drew completely different, non-Piqueray artwork under that name. The governed set (13 icons) was re-extracted from the real Figma file from scratch, never copied from the old demo.
- 001-piqueray-button: Reconversion to Piqueray — remove 51 demo contracts + multi-brand/dual-theme tokens; single-mode Piqueray foundation (14 vars + 8 Montserrat styles); Button contract extracted from a Figma dump; +2 additive-optional schema fields (`anchors.figma.dumpedAt`, a11y/semantics `provenance`); eval suite re-pointed via the hybrid rule; fidelity proven by determinism + parity + visual (≤2%) gates.
