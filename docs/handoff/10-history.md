---
title: "History — how we got here"
doc_id: 10-history
audience: "Another AI platform with ZERO prior knowledge of this project"
status: authoritative
last_updated: 2026-07-24
reading_order: 10
prerequisites: [00-readme, 02-thesis-and-north-star]
related: [03-determinism, 08-status-what-doesnt-work, 11-roadmap]
---

# How we got here

A narrative spine so you understand the *why* behind current decisions. Dates are
approximate where not exact; the git log is the precise record.

## Phase 0 — the engine and the corpus

Built the contract schema, the four emitters (`react`, `html`, `react-inline`,
`figma-script`) with an extensible registry, the token layer (DTCG), and 51
component contracts. Established the **computed-capture floor** (renders real
components headless, reads `getComputedStyle`, fuses with static bindings, mints
provisional `imported.*` tokens) and canvas pixel gates. The eval suite grew as a
receipts culture: no capability without an executable check.

## Phase 1 — the two-journeys product

Defined the product as two mirror journeys (see `04`): developer (code→contract→
plugin builds Figma) and designer (Figma→contract→CLI generates code). Converted
to npm workspaces; published `@ds-contracts/cli` and `@ds-contracts/schema`
(stranger-verified). Built plugin v2 with the engine baked in and six tabs. Built
the web-components emitter with a "closure receipt" (extract the emitted WC back
to a contract and diff — convergence proof).

## Phase 2 — the depth build (advanced composition)

The owner pushed hard on advanced composition: *"We need to be able to build
high-complexity components with advanced composition. This is key to the contract
proof of concept. I know we can line up the anatomy of a coded component with the
anatomy of a canvas-based Figma component."*

This produced:

- **Multi-root anatomy** — the emitters + validator generalized to consume
  `anatomy` as `Record<string, Part>` (a Modal is `{dialog, backdrop}`), with
  single-root output byte-identical. Key finding: advanced composition needed
  **zero new emitter code** — the `component` + `repeat` channels were already
  latent; the depth build was a *proof*, not new engine code.
- **The composite exhibit** `ds.composite-modal` — a Modal whose body composes a
  Card instance and a repeated Badge collection.
- **North-star anatomy parity** — the built canvas node tree matches the contract
  part-for-part (gated headless).
- **Both journey directions gated** for the composite (code→design and
  design→code).

## The determinism correction (a pivotal moment — read `03`)

While chasing a live render, the assistant hand-built the composite on the canvas
via a raw Figma-API call, and it drifted (an oval avatar it had to patch). The
assistant then proposed running `contract → canvas` through the native Figma MCP
(`use_figma`) for practitioner reach. **The owner corrected this sharply:** that
reintroduces AI into the conversion and defeats the entire premise —
*"doesn't this defeat the purpose of this whole concept of being deterministic?
... the whole idea was that we can do all of this without AI in the mix."*

This is the load-bearing principle now (`03-determinism.md`): AI builds tooling,
never runs the conversion. The plugin — engine inside Figma, fed a small contract
— is the deterministic vehicle, and that is *why* it exists (the payload can't be
agent-shuttled anyway). The `deterministic-roundtrip` gate was added to prove the
loop is byte-reproducible with zero AI.

## The live validation (and a real bug caught live)

The owner ran the deterministic plugin path on a real Figma file:

- **Win:** individual components (Avatar, the 24-variant Button, Badge, Card)
  built correctly, deterministically, from contracts, no AI. The core thesis,
  demonstrated on a real canvas.
- **Bug caught live that 146 gates missed:** stroke-based icons got a duplicate
  `fill` attribute → invalid SVG → real Figma refused. The mock had been lenient.
  Fixed the emitter **and** taught the mock to validate SVG so the class fails
  headlessly forever. This was treated as a *win* — live testing earning its keep
  and the mock-fidelity discipline getting sharper.
- **Frontier exposed:** the composite Modal fails live (collapsed layout, tag
  text not binding on a COMPONENT_SET, unstyled footer). See `08`.

## The clean-install push

To make the deterministic path the *easy* path, the plugin got a user-facing
`GET-STARTED.md`, a `PUBLISHING.md` (Figma Community submission kit), and a
128×128 icon. Confirmed you can paste a single contract and it resolves deps from
the baked repo contracts.

## The Piqueray reconversion (spec 001)

The project pivoted from the 51-component demo corpus to a real client system:
Piqueray. Spec 001 removed the 51 demo contracts and the multi-brand/dual-theme
tokens, laid a single-mode Piqueray foundation (14 variables + 8 Montserrat text
styles), and extracted the first real contract — the Button — from a Figma REST
dump. Schema evolution stayed additive (+2 optional fields:
`anchors.figma.dumpedAt`, a11y/semantics `provenance`). The eval suite was
re-pointed under the **hybrid rule**: demo-only cases with no Button equivalent
were removed (named by id in `evals/REMOVED-CASES.md`), a larger set quarantined
pending Piqueray features (slots, composites, dark theme, a second brand).
Fidelity was proven by the determinism + parity + visual (≤2%) gates. The demo
corpus was later materialized read-only at `docs/reference/demo-archive/`
(tag `demo-51`) so future component specs can consult it without git archaeology.

## Governed icons and the first master write (spec 002)

Spec 002 put the icon set under governance: `contracts/icons.registry.json`
(registry ↔ code ↔ Figma verified by a new parity icons axis), and the Button's
icon choice modeled as INSTANCE_SWAP-bound enum props — extracted, with a
propose-figma lowering closing the gap v1.2 had named; v1.4.0 then rebound the
label to the real `Libellé` TEXT property. The spec's ONE targeted master update
(label TEXT property + governed `preferredValues`) was proven safe on the real
client file by a positional scan + 9-page state photography (0.000% diff) +
restore points. With parity at zero active findings, the three intentionally-red
baseline/promotion evals went green for the first time. A trap worth remembering:
the pre-reconversion `assets/icons/` (search/close/spinner/… — deleted at
`8f462af`, full history still in git) was **not Piqueray artwork** — a few
filenames coincidentally matched real Piqueray icon names (e.g.
`chevron-left.svg`) but drew completely different glyphs under that name. The
governed set was re-extracted from the real Figma file from scratch, never
copied from the old demo.

## Cultural throughline

Throughout: **receipts-first** (no claim without a check), **defect-first** (lead
with what's broken; green ≠ done), **determinism above convenience** (the whole
point). The owner explicitly values honest failure reporting over polished
optimism. Inherit this.

## Guiding constraints stated by the owner (carry these)

- 100% open source, community-supported, **never monetized**.
- An **official open spec** for components is the aspiration; Figma could adopt it
  internally.
- The conversion is **deterministic only** — no AI filling gaps.

Continue to `11-roadmap.md`.
