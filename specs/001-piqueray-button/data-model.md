# Phase 1 — Data Model

**Feature**: Reconversion Piqueray — preuve Figma → code sur le Button
**Branch**: `001-piqueray-button` | **Date**: 2026-07-22

Six entities, lifted from the spec's *Key Entities* and grounded in the real on-disk shapes.
"Validation" = the executable rule that already enforces it (or the additive rule this feature
introduces). Nothing here invents Piqueray values — value-bearing fields are marked
**from-dump** (filled at implementation) or **authored** (hand-written, honesty-marked).

---

## E1 — Piqueray Token Foundation

The repo's entire token set after reconversion: 14 variables (12 colours + NavState + Opacity)
+ 8 Montserrat typography styles, **single mode**, tiered primitives → semantic aliases.

| Field / tier | Location | Type | Source | Validation |
|---|---|---|---|---|
| primitives (colours, opacity, font family/size/weight) | `tokens/primitives.tokens.json` | DTCG `$type`/`$value` leaves | **from-dump** (exact values) | DTCG parse; hex/dimension/number types |
| semantic aliases (what the Button binds to) | `tokens/semantic.tokens.json` | `{dot.path}` refs | authored structure over from-dump values | every ref resolvable (build-tokens.mjs:34-46) |
| `color.action.<variant>.{background,foreground,border}` | `tokens/semantic.tokens.json` | alias per variant | from-dump values | one segment == variant axis (D2) |
| NavState, Opacity | primitives + alias | color / number | from-dump | present, single mode |
| 8 Montserrat styles (family + size + weight triples) | primitives → semantic | 3 tokens per style | from-dump | family = Montserrat; no composite type |
| mode | `tokens/modes/` (one brand file, no light/dark) | single mode | authored (collapse) | dark map empty ⇒ parity check no-op |

**Relationships.** The **single foundation** every component binds to; the Button (E2) is its
only consumer this iteration. **Invariants** — only Piqueray tokens exist (SC-002); no orphan
or invented token (FR-005); a binding to a missing token fails the build by name (FR-004).
**State.** Static once built; rebuilt by `npm run tokens`. **Emitted artifacts** (generated,
never hand-edited): `src/styles/tokens.css` (single `:root`), single-mode Figma collections.

---

## E2 — Button Contract

The versioned single source of truth for the Button, authored fresh from the dump.

| Field | Type | Source | Validation / rule |
|---|---|---|---|
| `id` | `"ds.button"` | authored (D9) | schema; unique |
| `version` | `"1.0.0"` | authored (D9) | semver; fresh line |
| `props[]` | Prop[] | **from-dump** (inverted) | Zod `PropSchema` |
| `props.variant` | enum(6): Default, Orange, Blanc, Outline blanc, Link, Outline noir → camelCase | from-dump | `VARIANT` binding; default = first (FR-008) |
| other props (label TEXT, boolean states) | Prop[] | from-dump | binding kinds match dump |
| `anatomy` | Record<string, Part> | from-dump (inverted) | multi-part allowed; tokens resolvable |
| `anatomy.*.tokens` | `{dot.path}` refs → E1 | from-dump + alias (D2) | every ref exists in E1 (FR-004/005) |
| `semantics` | `{ element, role, provenance:"authored" }` | **authored** (D5) | `strictObject`; marker declared (Principle VI) |
| `a11y` | `{ focusVisible, minHitArea, contrast, provenance:"authored" }` | **authored** (FR-017) | optional; marker = authored, not extracted; accessible-name ← TEXT `children`, keyboard ← native `element:"button"` |
| `anchors.figma.fileKey` | string | from-dump `_provenance.fileKey` | present (FR-007) |
| `anchors.figma.componentSetKey` | string | from-dump `set.key` | present |
| `anchors.figma.nodeId` | string | from-dump `set.nodeId` | optional-present |
| `anchors.figma.dumpedAt` | ISO-8601 string | from-dump `_provenance.extractedAt` | **new optional field** (D4) |
| `anchors.code` | `{ importPath, export }` | authored | `src/components/Button`, `Button` |

**Relationships.** Consumes **E1**; derived from **E3**; generates **E4**; judged by **E5**.
**State machine** — `proposed` (extractor output) → **human review/approve** (US4) → `adopted`
(moved to `contracts/button.contract.json`, FR-009) → `generated` (E4 built) → `proven` (E5
green). Rejection at review holds it at `proposed` (no generation).

---

## E3 — Figma Dump

The instant-T photo of the Piqueray Figma component set the contract is derived from.

| Field | Type | Notes |
|---|---|---|
| `_provenance.fileKey` | string | → `anchors.figma.fileKey` |
| `_provenance.extractedAt` | ISO-8601 | → `anchors.figma.dumpedAt` (D4) |
| `_provenance.dumpVersion` | string | e.g. "1.6" |
| `_variables` | map name→{type,value,modes?} | real token names (plugin/MCP) or degraded |
| `_degradations` | named gaps | honesty channel |
| component set (variants, nodes, fills, text, layout, bounds) | `DumpSet`/`DumpNode` | captures the 6 variants + text layers + paints |

**Storage.** Committed fixture `extract/figma/fixtures/piqueray-button.dump.json` (D3).
**Relationships.** Input to `proposeFromDump` → **E2**. **State.** Immutable snapshot; not
live-synced (FR-007, Edge Cases). If Figma later diverges, the drift is detected against *this*
dump and listed in plain language — never auto-resynced (contract→Figma sync is out of scope).

---

## E4 — Generated Button Surfaces

Code artifacts produced from E2 — never hand-edited (Principle IV).

| Artifact | Path | Generator | Guard |
|---|---|---|---|
| React component | `src/components/Button/Button.tsx` | `npm run generate` | golden.json SHA |
| CSS module | `src/components/Button/Button.module.css` | `npm run generate` | golden.json SHA |
| Storybook story (6 variants) | `src/components/Button/Button.stories.tsx` | `npm run generate` | golden.json SHA |
| barrel | `src/components/Button/index.ts` + `src/components/index.ts` | `npm run generate` | golden.json SHA |
| Figma sync script | `figma-sync/NN-button.js` | `npm run figma:plan` | golden.json SHA |
| catalog shard | `catalog/components/button.json` | `npm run catalog` | regenerated |

**Relationships.** Generated from **E2**, bound to **E1**; surfaced in dashboard + Storybook
(US5 — glob-driven surfaces, not modeled as a separate entity). **Invariant.** Byte-identical across two runs (FR-011); any hand-edit is drift the
differ flags (FR-012, Edge Cases). **State.** Regenerated on every build; deterministic.

---

## E5 — Fidelity Report (gate results)

The green/red verdict + drift list from the arsenal — the *proof*, distinct from the eval
suite (which proves the engine, FR-002).

| Axis | Instrument | Pass condition | Output |
|---|---|---|---|
| (a) determinism | `deterministic-roundtrip.mjs` + golden | byte-identical ×2 | receipt / SHA match |
| (b) code↔contract | `npm run parity` | clean | `parity/report.json` |
| (c) contract↔Figma | parity differ vs dump | concord **or** drift listed in plain language | plain-words diff (FR-013) |
| (d) render↔Figma | `extract:figma:visual -- button` | masked-diff ≤ `THRESHOLD_PCT 2.0%` | triptych PNG + REPORT.md (D8) |

**Relationships.** Judges **E2**/**E4** against **E1**/**E3**. **Invariant (SC-007).** No drift
passed in silence — every contract/code/Figma gap is resolved or listed. **State.** Recomputed
per run; a red axis blocks "done" (Edge Cases). Requires Chromium for axis (d); missing ⇒ loud
failure naming the fix.

---

## E6 — Reconversion Step Log

The auditable trail of human approvals — git history (FR-016, D10).

| Field | Value |
|---|---|
| medium | git commits on `001-piqueray-button` |
| granularity | **one commit per approved step** |
| steps (ordered) | remove-demo+tokens → contract → generate → gates (**4 commits** — remove-demo & tokens share US1's commit) |
| readable via | `git log` |
| approval semantics | step N+1 does not start until step N is committed/approved (US4) |

**State machine (per step).** `pending` → owner reviews → **approved** ⇒ commit ⇒ next step
unlocks; **rejected** ⇒ stays at this step until re-validated (no advance). **Relationship.**
Spans the whole feature; its five checkpoints coincide with US1–US5 independent-test
boundaries and with the Phase-2 task groupings.

---

## Cross-entity invariants (from Success Criteria)

- **SC-001 / FR-001** — after reconversion, an inventory shows only Piqueray artifacts (E1 +
  E2 + E4); zero demo residue (contracts, generated surfaces, catalog entries, golden refs).
- **Tokens-first** — E1 MUST exist before E2 binds; a dangling binding fails the build by name.
- **No invented values** — every value in E1/E2 is from-dump or explicitly authored-marked.
- **Determinism** — E2 → E4 is pure; two runs are byte-identical; no AI in the path.
- **Honesty** — E3 degradations, E2 authored markers, and E5 drift are all named, never silent.
