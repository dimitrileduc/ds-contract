# Phase 0 — Research & Decisions

**Feature**: Reconversion Piqueray — preuve Figma → code sur le Button
**Branch**: `001-piqueray-button` | **Date**: 2026-07-22

The spec arrived with 4 clarifications already resolved (eval resolution rule, token model,
a11y scope, approval trace). This document resolves the remaining *technical* unknowns by
grounding each against the existing codebase, so nothing here is invented. **Status: all
NEEDS CLARIFICATION resolved.** The single non-derivable input — the actual Piqueray Figma
dump (fileKey, node anchors, the 14 variable values, the 8 typography styles) — is a
documented **dependency**, captured as extraction sub-step 1, and MUST NOT be invented during
planning or authored from memory.

---

## D1 — Piqueray token foundation: single mode over the existing tiered architecture

**Decision.** Model the 14 Piqueray variables as the repo's existing tiers — **primitives**
(`tokens/primitives.tokens.json`) → **semantic aliases** (`tokens/semantic.tokens.json`) —
collapsed to **one mode**. Put the 12 colours + Opacity as primitives (raw hex/number, exactly
as read from the dump), and structure semantic aliases (the layer the Button binds to) on top.
Reduce `tokens/modes/` to a single brand file and **no light/dark split**: delete
`brand.aurora.tokens.json` and `semantic.dark.tokens.json`, keep one semantic-mode file. Edit
`scripts/build-tokens.mjs` so the dark map is empty and the light/dark parity check is a no-op
when `dark.size === 0` (build-tokens.mjs:66-89), leaving a single `:root` CSS block and
single-mode Figma collections.

**Rationale.** FR-003 mandates the tiered architecture and "no invented values". The pipeline
already resolves `{dot.path}` refs across tiers (build-tokens.mjs:19-46) and already fails the
build on a ref to a nonexistent token (build-tokens.mjs:34-46) — that *is* the tokens-first
guarantee (FR-004), reused, not rebuilt. Brand discovery is dynamic regex over filenames
(build-tokens.mjs:73-78), so removing `brand.aurora` needs no manifest edit. Mono-theme is the
smallest honest expression of "Piqueray has one mode" (Assumptions → Mono-thème).

**Alternatives considered.** (a) *Flat mirror of the 14 Figma variables* — rejected by the
spec's own clarification (semantic tiers chosen so the Button binds to aliases, not raw
variables). (b) *Keep light/dark scaffolding inert* — rejected: dead dual-mode structure
violates Honesty (V) by implying a capability that isn't exercised; delete it.

---

## D2 — The 6 variants → a single VARIANT axis mapped to ~~semantic colour aliases~~ **primitives (corrected)**

> **⚠️ IMPLEMENTATION CORRECTION (2026-07-22).** The premise below — that the Button binds
> **semantic colour aliases** `color.action.{variant}.*` and that the extractor emits a
> **substituted ref** `{color.action.{variant}.background}` — is **WRONG for Piqueray** and was
> corrected during implementation. Verified against the live file: Piqueray has **one flat
> collection of 14 primitives** named by colour (`Noir bleuté`, `Orange`, `Blanc`…), **no
> semantic layer**, and the Button binds those **primitives directly** (Default→`Noir bleuté`,
> Orange→`Orange`, Blanc→`Blanc`…). The `color.action.*` layer authored in US1 was an
> **invention** and has been removed → **primitives-only**, exactly the sanctioned Polaris BYO
> pattern (a flat foreign set maps to a Primitives collection with empty semantic/brand —
> `examples/polaris/generate.ts`; and `core/tokens.ts` confirms a primitive path is a bindable
> `{token.ref}`). The Figma variables were **renamed to token-legal slash names** (`Noir bleuté`
> → `color/noir-bleute`) because the repo joins Figma↔tokens **by name** and refuses names
> outside `[a-z0-9.-]`. The Button contract now binds **per-variant primitive refs**
> (`{color.noir-bleute}`, `{color.blanc}`… via `tokensByProp`), **not**
> `{color.action.{variant}.background}`. Everything else here (the single `variant` enum prop +
> `VARIANT` binding, camelCased values, default = first) **still holds** — only the token tier
> changed: primitives, not invented semantic aliases.

**Decision (original, superseded on the tier).** Represent Piqueray's six variants (Default, Orange, Blanc, Outline blanc, Link,
Outline noir) as **one `variant` enum prop** with a Figma `VARIANT` binding, exactly as the
demo Button models `variant` (button.contract.json:13-40). Give each variant its semantic
colour aliases under `color.action.<variant>.{background,foreground,border,…}` in
`semantic.tokens.json`, resolving to Piqueray primitives. The extractor already inverts a
Figma variant axis into an enum prop and, when one node binds different tokens across the axis
differing in exactly one name-segment, emits a **substituted ref**
(`{color.action.{variant}.background}`) — the mechanism the demo Button uses at
button.contract.json:121-131. Canonical enum values are camelCased from the variant names
(e.g. `outlineBlanc`, `outlineNoir`, `link`), default = first variant.

**Rationale.** This is the established pattern (propose-figma inversion rule 3 / 5), so the
generated code and the contract stay on the beaten path and the visual gate has the best
chance of matching. Outline/Link variants differ by border + background/transparent rather
than a fill swap; those become per-variant alias values (background = transparent/`Blanc`,
border = the outline colour), still bound, never literal.

**Alternatives considered.** Separate boolean props (`outlined`, `link`) — rejected: the Figma
source is a single 6-value variant axis; splitting it would invent an API Figma does not
encode and break the contract↔Figma parity (FR-013).

---

## D3 — Dump production and the dump → proposed-contract path

**Decision.** Produce the Piqueray dump as extraction **sub-step 1** (Assumptions → Production
du dump) and **commit it as a fixture** under `extract/figma/fixtures/piqueray-button.dump.json`
(the repo's ground-truth convention). Prefer the plugin/MCP path (`npm run extract:figma:mcp`)
which resolves real variable names; fall back to REST (`npm run extract:figma:rest`) which
degrades loudly to minted `imported.*` tokens when the Enterprise variables endpoint is
unavailable. Then run `npm run extract:figma -- <dump>` → `proposeFromDump`
(`core/propose-figma.ts`) → a schema-valid `*.contract.proposed.json` + a `figma-proposals.md`
report whose every note is a review line item.

**Rationale.** The extractor already captures variants, VARIANT/BOOLEAN/TEXT/INSTANCE_SWAP
bindings, anatomy, and anchors (`fileKey`, `componentSetKey`, `nodeId`) into a proposal
(propose-figma.ts anchors block ≈:4345-4352), and already **names** unbound values with
nearest-token candidates rather than guessing (Honesty, V). Committing the dump makes the
extraction reproducible and gives the C8 journey eval a stable fixture (D6, Principle II).

**Alternatives considered.** Live REST at gate time — rejected: non-deterministic and network-
bound; the dump is explicitly "a photo at instant T", not a live sync (FR-007, Edge Cases).

---

## D4 — Dump timestamp provenance (FR-007): one additive-optional schema field

**Decision.** Add **`anchors.figma.dumpedAt`** (an optional ISO-8601 string) to the schema and
populate it from the dump's `_provenance.extractedAt`. Today `anchors.figma` is a Zod
`strictObject` with `fileKey`, `componentSetKey`, `nodeId?` (contract-schema.ts:882-892) — it
**rejects unknown keys**, so the timestamp cannot ride along without a schema change. Make it
`z.string().optional()` (additive, Principle VI) and bump `docs/02-contract-spec.md`.

**Rationale.** FR-007 requires the contract to record fileKey + anchors **+ the dump
timestamp**. `fileKey`/`componentSetKey`/`nodeId` already exist; only the timestamp is missing.
`strictObject` forces the field to be declared — this is the sanctioned optional-field
evolution, not a workaround. Coverage: an engine-level eval asserts the field survives
generate + round-trip (fixture → eval → claim).

**Alternatives considered.** (a) Stuff the timestamp into `description` prose — rejected:
unstructured, unqueryable, and dishonest about provenance. (b) A separate sidecar file —
rejected: splits the source of truth; the contract must *self-describe* its provenance.

---

## D5 — Authored-vs-extracted a11y marker (FR-017): a named provenance annotation

**Decision.** Carry the a11y baseline (role button, accessible name, keyboard) in the existing
`a11y` + `semantics` blocks, and mark it **explicitly authored** via a small additive-optional
provenance annotation (e.g. `a11y.provenance: "authored"` / `semantics.provenance: "authored"`,
`z.enum(["authored","extracted"]).optional()`). Because `semantics` is a `strictObject`
(contract-schema.ts:817) and `a11y` is a plain object that strips unknown keys, the marker must
be a declared optional field (Principle VI); bump `docs/02`.

**Rationale.** FR-017 demands the a11y/semantics be "explicitly marked authored (not extracted
from Figma, which does not encode it)". The extractor **provably never fills a11y/semantics**
(it emits the note "Semantics, a11y, events… are not canvas-recoverable; review before
adoption"), so authored-ness is true by construction — but the spec wants it *named in the
artifact*, not just implied. A typed marker satisfies Honesty (V) and is machine-checkable.

**Alternatives considered.** (a) Rely on the extractor's report note alone — rejected: the note
lives outside the committed contract; FR-017 wants the marker *on the contract*. (b) A
free-text comment — rejected: not enforceable, drifts silently.

---

## D6 — Eval suite hybrid resolution (FR-002): re-point, remove-by-name, or leave intact

**Decision.** Apply the documented hybrid rule case-by-case in `evals/run.ts` (cases are a flat
`Case[]` array of `{id, claim, run}`, families C1–C8; live `N/N` is authoritative). Three
buckets:

- **Re-point to Piqueray Button** — cases hard-wired to the demo Button by name/anchor:
  the C3 code/Figma drift detectors, the C1 state/hit-area/typography probes, C4 promotion,
  and the **C8 journey** (its fixture becomes the Piqueray Button dump).
- **Remove, named explicitly** — cases hard-wired to demo components with **no** Button
  equivalent (Card slots, Table multi-slot, Heading `elementByProp`, Checkbox/Progress native
  controls, Banner overlay, TextField `stylesWhen`, `.get('ds.heading'|'ds.token'|…)` lookups).
  Each removal is listed by `id` in the PR (Honesty, V).
- **Leave intact** — content-agnostic engine cases: schema/circular-dep refusals, token
  validation, brand-layer determinism, and the entire C5 extraction family (it runs on committed
  `extract/fixtures/*`, not on `contracts/`).

Then **`npm run golden:update`** (D7) and let the live count settle; FR-002 permits the total
to change while staying green.

**Rationale.** The suite validates the **engine**, not Button fidelity (FR-002) — so engine
cases stay and demo-content cases resolve. Generation/parity/catalog/dashboard/Storybook all
glob `contracts/`, so they auto-shrink; only `evals/run.ts` and `subjects.ts` hardcode the set.
Re-pointing preserves engine coverage on the one surviving component; removal-by-name preserves
Honesty.

**Alternatives considered.** (a) Delete every demo-touching case — rejected: throws away engine
coverage that Button can carry. (b) Keep dead references to removed components — rejected:
silent dangling refs are exactly the highest-severity bug class (V).

---

## D7 — Golden manifest regeneration

**Decision.** After deleting all 51 contracts + component dirs and regenerating, run
**`npm run golden:update`** (`scripts/update-golden.mjs`) to rewrite `evals/golden.json` (it
SHA-256s every file under `src/components/**`, `figma-sync/**`, `src/styles/**`). The C1
`golden-generated-output` case then re-pins the new, smaller output.

**Rationale.** `golden.json` byte-guards ~52 components × 4 files + per-component figma-sync
scripts; removing all 51 components drops ~200 entries. This is a **regeneration**, never a
hand-edit (Principle IV) — the guarantee stays "the golden reflects what the pipeline emits".

**Alternatives considered.** Hand-trim `golden.json` — rejected: Principle IV forbids editing a
generated manifest; regenerate from real output.

---

## D8 — Visual-parity gate (FR-014): reuse the existing tolerance; edit the hardcoded subject

**Decision.** Prove render↔Figma with the **existing** instrument at its **existing** tolerance:
`npm run extract:figma:visual -- button`, masked-diff gate **`THRESHOLD_PCT = 2.0%`**
(`extract/figma/visual-parity/run.ts:56`); rows over `3.0%` (`TRIAGE_LINE_PCT`) must carry a
named triage cause or print `[UNTRIAGED]`. **Edit the hardcoded subject list**
(`extract/figma/visual-parity/subjects.ts:114-118`): drop the demo `badge/checkbox/switch/
heading` catalog subjects, and repoint the `button` subject's `fileKey`/`setNodeId` from the
demo file (`8nim1d0IPnehMxA7B7SYxC` / `5:21`) to the Piqueray file + Button set node. Requires
**Chromium** (`npx playwright install chromium` or `PLAYWRIGHT_CHROMIUM_PATH`); if absent the
tool fails **loudly with the fix named** (never a silent skip).

**Rationale.** The spec forbids inventing a threshold (Assumptions → Tolérance) — reuse
`THRESHOLD_PCT`. `subjects.ts` is hand-authored **source** (not generated output), so editing
it is legitimate and necessary — it's one of the two files that hardcode the component set. The
tool already center-pads content-box crops and reports size/ink deltas in plain language,
satisfying "drift listed, never silent" for the visual axis.

**Alternatives considered.** A new pixel-diff harness or a looser custom threshold — rejected:
reinvents a working instrument and would let the fidelity bar drift.

---

## D9 — Button contract identity and version

**Decision.** Author the Button **fresh** as `contracts/button.contract.json`, keeping the
repo's `ds.` namespace (**`id: "ds.button"`**) and resetting the version to **`1.0.0`** (a new
design system's first Button), *not* bumping the demo's `1.5.0`. Treat it as a replacement, not
an evolution: the demo contract is deleted, the Piqueray contract is a new authored artifact.

**Rationale.** This is an in-place *reconversion* (FR-001) — the repo *becomes* Piqueray — so
the Button is a new component from a new source, not a semver evolution of the demo. Keeping the
`ds.` namespace avoids churn in anchors/imports and the emitter's id→path mapping; resetting to
`1.0.0` honestly signals "first release of the Piqueray Button". (Principle VI's semver governs
*evolution of a living contract*; here we start a fresh line, which is the honest label.)

**Alternatives considered.** (a) Keep `1.5.0` and bump major to `2.0.0` — rejected: implies
continuity with the demo API that doesn't exist. (b) Rename id to `piqueray.button` — rejected:
needless churn across anchors, emitter path logic, dashboard, and the visual subject; the
namespace is the repo's, and the repo is Piqueray now.

---

## D10 — Human-approval trace (FR-016): one git commit per approved step

**Decision.** Materialize the auditable approval trace as the spec clarified: **one git commit
per approved step** on this feature branch, the step named in the message
(remove-demo+tokens → contract → generate → gates = **4 commits**; remove-demo and tokens land together as US1), readable via `git log`. No new tooling.
This is the natural spine of the phased implementation and maps directly onto the five user
stories' independent-test boundaries.

**Rationale.** FR-016 + the 2026-07-22 clarification pick git history as the trace; it is
durable, reviewable, and already present. Each commit is a checkpoint the owner approves before
the next step starts (US4), and the reconversion is irreversible in place, so the checkpoints
matter.

**Alternatives considered.** A bespoke approvals ledger file — rejected by the clarification (no
new tooling; git log *is* the trace).

---

## Open dependency (not a clarification gap)

- **The Piqueray Figma source** (fileKey + node anchors + the 12 colours + NavState + Opacity +
  8 Montserrat styles) is an **external input**, produced by the dump at extraction sub-step 1.
  Planning does not — and must not — invent these values. Everything above specifies the
  *structure* and *process*; the *values* are filled from the dump during implementation, under
  the no-invented-values rule (Honesty, V; FR-003).
