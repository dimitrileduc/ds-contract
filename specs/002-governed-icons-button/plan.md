# Implementation Plan: Icônes gouvernées + finalisation du Bouton (choix d'icône et mise à jour du master)

**Branch**: `002-governed-icons-button` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-governed-icons-button/spec.md`

## Summary

Give the Piqueray icons a **governed existence** — one versioned registry
(`contracts/icons.registry.json`, research D1) that the designer's Figma menu and the
developer's code list both derive from and are **mechanically verified against** (a new
"icons axis" in the three-way differ, D4) — then finish the Button: its two icon placements
become steerable on both sides ("which icon" + "shown or not") via **two enum props bound
INSTANCE_SWAP** over the registry names (D2), riding machinery that already exists (the
schema's generic `values` map; the React emitter's `asset: "{prop}"` enum expansion), and
close the contract/code/Figma alignment with **ONE minimal targeted master update** (D8):
the label becomes a Figma TEXT property (extinguishing the 001 declared parity finding) and
the icon menus get their governed `preferredValues` — proven harmless to the 9 mockup pages
by **measured before/after state photography** (D7), a **positional customization scan**
(43 texts + 26 glyphs, D6), and **restore points** with a verified rollback path.

The load-bearing sequence is the spec's own: **Step 0 first and blocking** — audit + clean
the icon source in Figma (the 4 owner-decided items; every further anomaly proposed to the
owner, never silently fixed), owner validation, **then** extraction. All capability gaps are
closed **inside the repo's common tooling** (owner rule, zero throwaway): the propose-figma
lowering pass that v1.2 names as its own known gap (D5), a REST SVG-export step (D3), two
thin committed runners over existing primitives (positional scan, page photography), parity's
icons axis, and the eval suite's new cases — including turning the 3 intentional reds green
(their block's stale "pending token push" attribution gets an honesty fix: the real blocker
is the master rebuild, D9).

## Technical Context

**Language/Version**: TypeScript 5.x, Node ≥ 20, ESM (run via `tsx`)
**Primary Dependencies**: Zod (`@ds-contracts/schema`), React 18 + CSS Modules (the `react`
emitter), Vite, Storybook, `playwright-core` + pixelmatch (visual parity & state
photography, real Chromium), Figma REST API (dumps, PNG/SVG export — `FIGMA_TOKEN`),
figma-console MCP (lint, targeted master edits, version checks; the 001 gesture transport)
**Storage**: JSON on disk — `contracts/button.contract.json` (SSoT, → v1.3.0),
**`contracts/icons.registry.json` (new SSoT document, v1.0.0)**, DTCG `tokens/` (untouched),
`assets/icons/*.svg` (extracted code-side set, pruned to the registry), dump fixtures under
`extract/figma/fixtures/`, byte-pinned `evals/golden.json`, committed
`parity/snapshots/figma-components.json` (re-pulled after the master update)
**Testing**: `evals/run.ts` (live count authoritative; 94/97 today — the 3 intentional reds
turn green at Step 3; net-new icon cases raise the total), `npm run parity` (+ new icons
axis), `deterministic-roundtrip.mjs`, `plugin:check`, `core-browser-check.mjs`,
`extract:figma:visual` (+ icon subjects & Button-with-icons preset), the new state-photo and
positional-scan runners
**Target Platform**: Node CLI + browser-pure `core/` engine + generated React library +
Figma plugin/MCP transports
**Project Type**: Generator / candidate reference implementation (single repo, npm workspaces)
**Performance Goals**: Byte-identical regeneration ×2 (the product guarantee); parity **zero
findings** at closure (SC-001); 9 pages photo-identical within the **existing**
`THRESHOLD_PCT = 2.0` tolerance — no new threshold (spec assumption)
**Constraints**: Zero `node:*` in `core/` (registry passed **as data** to the lowering
pass); no AI in the contract→surface path; **no invented values** — counts, swap-property
names, `preferredValues` state and SVG bodies are all **measured** (Step 0 re-dump/re-scan);
schema grows by **one additive document type only**; degradation named, never silent (the
canvas emitter's baked-vector limitation stays documented, D8)
**Scale/Scope**: 15 icon masters (2 sizes by design), 268 icon instances observed / only the
Button contracted, 1 contract bumped minor + 1 new registry, 9 mockup pages / 43 texts /
26 glyphs preserved, 3 red evals extinguished + new icon evals added (final count = live
`N/N`), 4 Figma cleanup items + owner-arbitrated proposals. No NEEDS CLARIFICATION remain —
the spec's 2 deliberate gaps were clarified in session (registry form; keep-001 slot
mechanism); research resolved the rest against real mechanisms (D1–D11).

## Constitution Check

*GATE: passed before Phase 0 research. Re-checked after Phase 1 design — still green.*

Derived from `.specify/memory/constitution.md` (v1.0.0). Every item true; no Complexity
Tracking entry needed.

- [x] **I. Determinism (NON-NEGOTIABLE)** — AI may run the *audit* and
      *propose* registry/contract (Step 0–2 review flow), but generation stays pure:
      registry + contract in as data, surfaces out byte-identical ×2
      (`deterministic-roundtrip.mjs`, golden re-pinned via `npm run golden:update` in the
      reviewed change). SVG bodies are **acquired** deterministically (REST export, D3), a
      source-refresh like dumping — never model-produced. The master update is a scripted
      Plugin-API operation, not generation. ✅
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — fixture → eval → claim for every new
      capability: registry three-way sync (C3), out-of-registry refusal (C2), the D5
      lowering (C5), v1.3 determinism (C1/C8 + golden), icon visual coverage (instrument
      baseline). The 3 reds' green flip is *proven* by the re-pulled committed snapshot,
      not asserted. No count quoted without the live `N/N`; stale "pending token push"
      attribution fixed as an honesty defect (D9). ✅
- [x] **III. Contract is the SSoT** — the registry is itself a versioned SSoT document in
      `contracts/`; flow stays outward (registry/contract → code + canvas) and back only as
      promotions (v1.3 is *extracted* from the cleaned source, D5; the master update
      realizes the contract on the canvas — no side-to-side sync). `npm run parity` zero
      findings at closure. ✅
- [x] **IV. No hand-edited output** — `src/components/`, `figma-sync/*.js`, `catalog/`
      (incl. the stale v1.1.0 Button shard — regenerated, named housekeeping),
      `contracts/contract.schema.json`, `evals/golden.json` only ever regenerated.
      Hand-edited files are all source: the registry (reviewed adoption), the schema, the
      differ, the extractors, eval sources, `subjects.ts`, docs. `assets/icons/*.svg` are
      **acquired source** (tool-written at Step 0/1, then read-only inputs to pure emit). ✅
- [x] **V. Honesty** — the audit reports masters AND usage by position and what it cannot
      read; every anomaly beyond the 4 items is a named owner proposal; non-restorable
      customizations are named one by one (SC-008); the 3 reds stay **visibly red and
      correctly attributed** until Step 3 (banner fix, D9); the canvas emitter's
      baked-vector limitation is documented where the capability is claimed (D8);
      `confidence: "inferred"` marking preserved in extraction. ✅
- [x] **VI. Additive evolution** — schema gains exactly one additive document type
      (`IconRegistrySchema`); **zero existing field repurposed** (INSTANCE_SWAP kind and the
      generic `values` map pre-exist — verified contract-schema.ts:75–79);
      `docs/02-contract-spec.md` bumped. Contract semver: ds.button 1.2.0 → **1.3.0**
      (minor — two additive enum props with v1.2-preserving defaults); registry starts
      1.0.0, widen=minor / narrow=major (FR-006). The contract PR diff stays the readable
      design-system review. ✅
- [x] **VII. Engine integrity** — `core/` stays browser-pure: the lowering pass receives
      the registry as data (no `node:*`), receipted by `core-browser-check.mjs`. Any
      live-canvas-only defect found during the master update gets the two-part fix
      (emitter/tool + mock/gate class-check) per the mock-fidelity discipline. ✅

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && tsc -p tsconfig.build.json
```

*(Feature-specific instruments on top: `npm run extract:figma:visual:summary` — icon
subjects + Button-with-icons preset; the state-photo and positional-scan runners' reports;
needs Chromium + `FIGMA_TOKEN`. Until Step 3 the 3 intentional reds stay red — named and
correctly attributed in every sweep.)*

## Project Structure

### Documentation (this feature)

```text
specs/002-governed-icons-button/
├── plan.md              # This file (/speckit.plan)
├── research.md          # Phase 0 — D1–D11, all unknowns resolved against real mechanisms
├── data-model.md        # Phase 1 — E1–E8 (registry, icon, v1.3, the operation, scans, photos, restore, audit)
├── quickstart.md        # Phase 1 — the 5 human-approved steps (0→4) + gate commands
├── contracts/           # Phase 1 — interface contracts:
│   ├── icon-registry.interface.md          #   the registry document + its 7 enforcement rules
│   ├── button-v1.3.interface.md            #   the extracted v1.3 delta + compatibility proof
│   ├── master-update-operation.interface.md#   the ONE operation: preconditions → payload → postconditions → rollback
│   └── schema-additions.interface.md       #   everything added to shared machinery (all additive)
└── tasks.md             # Phase 2 — /speckit.tasks (NOT created here)
```

### Source Code (repository root) — what this feature touches

```text
contracts/
├── icons.registry.json             # NEW SSoT document (proposed → reviewed → adopted, v1.0.0)
└── button.contract.json            # v1.2.0 → v1.3.0 (extracted via the D5 lowering, reviewed)

packages/schema/src/contract-schema.ts   # ADD IconRegistrySchema (additive document type only)
docs/02-contract-spec.md                 # BUMP: registry + INSTANCE_SWAP enum-binding convention

core/propose-figma.ts               # D5 lowering: boolDefaults/propRefs.visible/swapPreferredValues → props
parity/diff.ts                      # NEW icons axis (registry ↔ code ↔ canvas, incl. preferredValues)
parity/snapshots/figma-components.json   # RE-PULLED + committed after the master update (evals read this)

extract/figma/rest/                 # ADD SVG-export step (format=svg per master) — reusable
extract/figma/audit/                # NEW committed runner: positional instance scan (capture-receiver pattern)
extract/figma/state-photo/          # NEW committed runner: 9-page before/after photography (fetchNodePngs + img.ts)
extract/figma/visual-parity/subjects.ts  # ADD icon subjects + Button-with-icons preset (small prop-preset extension)
extract/figma/fixtures/             # REFRESHED dumps post-cleanup (dumpedAt new)

assets/icons/                       # extracted governed SVGs; PRUNED to the registry exactly

evals/run.ts                        # new cases (C2/C3/C5), revivals re-pointed, reds' banner honesty fix
evals/legacy-cases.ts, REMOVED-CASES.md  # revival moves + "96 executed"/attribution re-sync
evals/golden.json                   # REGENERATED (npm run golden:update, reviewed change)

# GENERATED — never by hand (regenerate via build/catalog/figma:plan):
src/components/Button/*             # typed enum props + full ICONS map + icons story
figma-sync/*.js                     # regenerated (NOT run against the client file — D8 limitation named)
catalog/                            # regenerated (fixes stale v1.1.0 Button shard)

# Figma side (not in git — receipted by dumps/photos/scans/reports):
#   Step 0: 4 cleanup items + local chevron master swapped on 22 uses (by position)
#   Step 3: the ONE master update (« Libellé » TEXT property + icon preferredValues)

README.md, CLAUDE.md, docs/handoff/, MILESTONES.md   # closure count-sync + honesty sweep
```

**Structure Decision**: Single existing repo, everything lands **inside the repo's existing
mechanisms** (owner rule: zero throwaway tooling): the registry beside the contract it
governs, the lowering inside the extractor that owns canvas→contract, the icons comparison
inside the differ that owns comparisons, the two new runners inside `extract/figma/` beside
the primitives they compose, visual coverage as subjects of the existing instrument. The
only new *document type* is the registry; the only schema growth is its validator. Each of
the five steps (0–4) is an independently-verifiable, owner-approved commit, and Step 0 is a
hard gate in front of everything else.

## Complexity Tracking

> No Constitution violations. No entries required.

The feature closes gaps rather than adding parallel machinery: the extractor's own named
gap (D5), the differ's missing axis (D4), the instrument's missing subjects (D10), and two
runners composed from committed primitives (D6/D7). The single genuinely new artifact — the
registry — is the spec's explicit deliverable, and it enters through the sanctioned
additive-schema path (Principle VI).
