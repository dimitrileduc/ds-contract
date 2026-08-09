---
title: "Status — what works (proven / gated / live-validated)"
doc_id: 07-status-what-works
audience: "Another AI platform with ZERO prior knowledge of this project"
status: authoritative
last_updated: 2026-08-09
reading_order: 7
prerequisites: [03-determinism, 05-architecture]
related: [08-status-what-doesnt-work, 09-testing-and-gates]
---

# What works

## Fondation Odoo 19 (spec 019, 2026-08-09)

- L'addon `piqueray_ds` livre exactement deux snippets gouvernés, Presentation et Google Reviews, qualifiés sur Odoo 19 épinglé.
- Deux instances de chaque section restent isolées dans l'éditeur, après sauvegarde, en public et après réouverture.
- Les blocs sauvegardés portent contrat, versions, digest et versions d'assets; la politique périmée est réappliquée sans prétendre migrer une structure ancienne.
- Clean install puis `-u` conservent contenu et métadonnées. Le public est non éditable; un rédacteur standard conserve l'éditeur.
- Le manifeste de qualification est `qualified-with-limits`; preuves et index : `specs/019-odoo-production-foundation/proofs/`.

Read this together with `08-status-what-doesnt-work.md`. Green gates are **not**
"it works" — they are "these checks pass." Each item below states its evidence
level: **[gated headless]** (an eval/gate proves it in Node against the mock),
**[live]** (validated on a real Figma canvas), **[CLI]** (a command proves it).

## The suite

- **The eval suite passes in full** (`npm run eval`; the live `N/N` is the only authoritative count).
  The 3 that were an intentional red block went green once spec 002 pushed the
  master update to Figma. 49 further cases are quarantined (not run) under the reconversion's
  hybrid rule — Piqueray has no slots/composites/dark-theme/second-brand yet.
  Claim families: `C1-determinism`, `C2-refusal`, `C3-detection`,
  `C4-convergence`, `C5-extraction` (the largest), `C7-cli`, `C8-journey`
  (`C6-theming` is at 0 — quarantined, one brand/one theme today). See
  `09-testing-and-gates.md` for the live breakdown.
- Standing gates: `golden-generated-output` (byte hash of `src/` + `figma-sync/`,
  265 files), the 1,618-set census, `plugin-engine-bundle`, both `tsc`
  (root + `tsconfig.build.json`), `core:browser-check`, `emitters:check`,
  site build byte-reproducible.

## Determinism (the core claim)

- **The full round-trip is a pure function, byte-reproducible.** [gated headless]
  Gate `deterministic-roundtrip`: `contract → canvas` run twice → **byte-identical
  node trees**; `canvas → contract` recovers the anatomy; `contract → code`
  emits. No AI in the conversion.

## contract → code

- **React / HTML / inline-React** emit deterministically from contracts, byte-
  guarded by golden. [gated headless]
- **All repo contracts** emit; the differ detects code-ahead/behind/mismatch,
  figma-ahead/behind, token drift. [gated headless] (the `C3-detection` family)
- **Refusals are named**: invalid contracts, unknown token refs, circular deps,
  unknown component refs, enum/default violations — all refuse *by name*.
  [gated headless] (`C2-refusal`)

## contract → canvas

- **The plugin engine builds correct anatomy from a pasted contract.**
  [gated headless] (`plugin-engine-check` / `composite-plugin-path`): the exact
  bundle the plugin loads (`window.DSC`) parses a contract, plans tokens-first +
  dependency-ordered, executes in the mock, and builds the correct node tree.
- **LIVE, on a real Figma canvas (2026-07-21):** pasting a contract into the
  plugin's Generate tab built these components correctly, deterministically, from
  contracts, with no AI: **[live]**
  - **Avatar** — circular avatars (radius from `radius.pill`, correct).
  - **Button** — the **full 24-variant set** (Variant × Size × State), correct
    colors, `loadingSpinner` + `label` per variant.
  - **Badge** — 5 pill variants (Info/Success/Warning/Danger/Error).
  - **Card** — avatar + title header, real body/footer **Slots**.
  These are genuine passes and are the strongest evidence the core PoC is real.

## canvas → contract (design → code capture)

- **Dump + propose recovers a contract** from a drawn set, including advanced
  composition (multi-root, composed instance, repeated collection).
  [gated headless] (`composite-reverse-journey`).
- The recovered contract uses a single `root` wrapper convention (COMPONENT-as-
  root) vs the top-level multi-root author form — same structure, no info lost.
- The 1,618-set census proposes every set with zero skips (after sanitize).
  [gated headless]

## code → contract (design-led capture)

- `extract:code` / `roundtrip:code` recover contracts from TSX/CEM with zero
  round-trip mismatch on the tested components. [CLI]

## Advanced composition (the depth build)

- A **multi-root** component (`{dialog, backdrop}` with no wrapping root) emits on
  all four surfaces and its built canvas anatomy lines up with the contract
  **part-for-part**. [gated headless] (`depth-composite-child-collection`)
- **Both journey directions** for advanced composition are gated headless
  (code→design and design→code). This required generalizing the emitters/validator
  to consume multi-root anatomy — with single-root output byte-identical.
  Notably it needed **zero new emitter code** for the composition itself; the
  `component` + `repeat` channels were already latent in the multi-root work.

## Packaging / distribution

- `@ds-contracts/cli` and `@ds-contracts/schema` are published and stranger-
  verified. The web-components emitter is built (not published). The plugin
  builds to a drift-guarded zip with a clean-install + publishing guide.

## The Piqueray canvas round (spec 016, added 2026-08-06)

The sections above are the demo-era record (last full pass 2026-07-21); the
Piqueray reconversion's spec-by-spec record lives in `specs/NNN-*/` (see the
journal-gap note in `10-history.md`). What spec 016 makes claimable today, each
sentence with its check. The fixtures below are **registered in `evals/run.ts`'s
sweep** (016 closure, adversarial-review finding 2: a fixture nothing runs
protects nothing) — they are part of the live `193/193`, and each also runs
standalone (`npx tsx evals/fixtures/<name>.ts`).

- **A composed child's slot content is a contract fact** (`component.slots`,
  schema v20): the canvas emitter poses it through the child's INSTANCE_SWAP
  property — resolved by the `ds_contracts/contractId` marker, with the child's
  props mapped through the slotted contract's own bindings, never a manual
  instance override; a witness composition without `slots` sets no swap prop.
  [gated headless] (`evals/fixtures/composed-child-slot-content-check.ts`; live
  origin: the Formulaire master's Field slot held a textarea by manual override
  and every parent amend erased it — `specs/016-canvas-vrai/decisions.md` O-12.)
- **A part that is BOTH content-prop (TEXT) and visibility-piloted (BOOLEAN)
  keeps BOTH `componentPropertyReferences`** (`characters` AND `visible`) — the
  runtime used to set them in two overwriting passes, which muted every
  downstream instance TEXT override. [gated headless]
  (`evals/fixtures/text-prop-and-visible-refs-coexist-check.ts`; live witness:
  instance 2094:2468's own text override relit once the references merged.)
- **Height-0 + per-side stroke = a LINE, not a box**: `strokeAlign: CENTER` +
  re-resize after the weights, geometry stays ~0; the witness box with the same
  stroke keeps the INSIDE border-box doctrine and its height. The mock learned
  Figma's measured INSIDE height clamp (at resize AND at weight pose).
  [gated headless] (`evals/fixtures/zero-height-line-part-check.ts`; live
  origin: Footer.Separator, a 1550×0 LINE emitted as an h=2 frame.)
- **Composition dependencies resolve by the `ds_contracts/contractId` marker,
  never by layer name** — a designer's rename cannot break composition (§VIII):
  the fixture builds the child's set, renames it, and the parent script still
  finds it. [gated headless] (`evals/fixtures/dep-resolved-by-marker-check.ts`;
  live origin 2026-08-05: the master renamed « Bouton » broke all 7 composers
  through the name-based dependency resolver.)
- **A per-prop icon size reaches the emitted canvas**: an `icon` part whose
  size varies by prop (`tokensByProp` width/height) emits the combo's size, not
  the base `icon.size` (Grand 32 / Petit 24 in the fixture). [gated headless]
  (`evals/fixtures/icon-size-tokens-by-prop-check.ts`; live origin: the
  AccordionRow chevron drew 32 in small variants — closed small row 48 vs 40.)
- **A `declared position:absolute` part contributes no geometry to the canvas
  flow**: `layoutPositioning: ABSOLUTE`, vertical constraint MIN when `bottom`
  is not carried, height preserved from its token, width stretched to the
  parent — and inset channels riding `stylesWhen` or covering only three sides
  (top/left/right) now lower too; the in-flow witness does not move.
  [gated headless] (`evals/fixtures/absolute-part-out-of-flow-check.ts`; live
  origin: each open AccordionRow variant gained a full flow row, 176 vs 120.)

Beyond the fixtures, the round's headline is receipted in
`specs/016-canvas-vrai/RAPPORT-CLOTURE.md` (§1–2, with `proofs/`): the geometry
watch is rebranched **[live]** — 83 variables created in the client file, 562
variable bindings on 31 masters (10 on 3 at opening), `parity/baseline.json`
down from 89 acknowledgements to 3 named ones, and the watch *proven* by a
sentinel drift (364→999) caught, classified, remedied and cancelled with
byte-identical double verification. Two further canvas mappings (VARIANT-axis
gain on amend; width-on-text = wrap) are live-receipted but have **no dedicated
fixture yet** — see the 2026-08-06 addendum of `docs/FIGMA-CAPABILITY-MATRIX.md`
for the exact claim level of each.

## The honest headline

**The deterministic pipeline is real and proven; individual components build
correctly on a live canvas from contracts with no AI.** That is the core thesis,
demonstrated. Now read `08` for exactly where it still fails.
