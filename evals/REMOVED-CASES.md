# Quarantined eval cases

These 51 cases were taken out of the live suite during the **Piqueray
reconversion (2026-07-22)**, when the repo went from a 51-component demo design
system with two themes and two brands to Piqueray: **one component (Button),
one theme, one brand, no slots, no nested instances, no repeat collections, no
multi-root anatomy.**

**The removal is deliberate, and the suite is smaller by design.** Every case
below asserted something real, and none of them can assert it against what
Piqueray ships today. The alternative — keeping them alive by re-pointing them
at foreign fixtures (the Polaris showcase, a fabricated dark mode, a second
brand invented for the test) — would have produced a large suite of tests that
no longer describe this design system. A small suite of true tests is worth
more.

**Nothing was deleted.** The code lives in [`evals/legacy-cases.ts`](./legacy-cases.ts),
preserved **verbatim** — same `id`, same `claim`, same `run()` body, the same
assertions byte-for-byte. `evals/run.ts` imports them and does **not** execute
them, and the runner prints the quarantine count on every run so it can never
go quiet:

```
N/101 evals passed — evals/results.json
50 legacy cases quarantined (not run) — …
```

The live `N/N` counts executed cases only, so the pass rate stays honest. **Trust the live `npm run eval` output over this file** — it prints the count on every run; update this note when it drifts (`grep -rn` the number, per CLAUDE.md).

**Counts:** 147 cases before the reconversion → 96 executed at the reconversion, **101 executed** as of 002-governed-icons-button (+2 new: `detect-icon-registry-divergence`, `refuse-unregistered-icon-enum`; +1 new: `lower-icon-swap-and-visibility-into-props`; +1 revived: `figma-script-referees-invalid-contracts`, re-homed onto `ds.button` in its own standalone script — see `extract/figma/gauntlet/figma-script-referee-check.ts`), **50 quarantined**.

## What quarantine does NOT mean

Quarantine means *Piqueray structurally cannot run this yet*. It is not a
parking space for anything red.

Three executed cases — `baseline-parity-clean`,
`baseline-acknowledges-without-failing` and `promotion-converges` — are
**failing on purpose** and stay in the live suite. They need a clean parity
baseline, and `npm run parity` is red because the Piqueray token set has not
been pushed to Figma yet. That is a live, temporary state, not an absent
capability. Quarantining them would claim Piqueray cannot do this; baselining
them in `parity/baseline.json` would turn a real pending gap into a green tick.
Both would hide something true, so they stay red and named.

## Re-enabling a case

1. Find its block in `evals/legacy-cases.ts` (each carries a `RE-ENABLE WHEN:`
   comment — the same condition as the last column below).
2. Move the block back into the `cases` array in `evals/run.ts`.
3. Delete it from `evals/legacy-cases.ts` and from the table below.

Nothing else should need editing. The shared harness (`evals/harness.ts`) is
imported by both files, which is why the assertions could stay untouched — a
restore is a move, not a rewrite.

## The list

| id | claim | what it proved | why it cannot run on Piqueray today | what Piqueray would need for it to come back |
|---|---|---|---|---|
| `refuse-incomplete-mode-set` | C2-refusal | the token build refuses a light/dark mode gap by name | Piqueray is mono-theme: tokens/modes/semantic.dark.tokens.json does not exist, so there is no mode set to leave incomplete | a second token mode (a real dark theme in tokens/modes/) |
| `detect-figma-missing-slot-property` | C3-detection | a slot's INSTANCE_SWAP property missing from the canvas surfaces as figma BEHIND | Piqueray has no component with a slot | a Piqueray component with a slot (INSTANCE_SWAP) drawn on its Figma set |
| `detect-figma-missing-nested-instance` | C3-detection | a nested instance missing from the canvas surfaces as figma BEHIND | Piqueray has no component that nests another component | a Piqueray component with a nested instance (component ref in its anatomy) |
| `detect-figma-accepts-drift` | C3-detection | a slot's `accepts` set narrowing on the canvas (preferredValues) surfaces as figma MISMATCH | Piqueray has no slot, so there is no accepts set to drift — confirmed still true post-002-governed-icons-button: that spec's own INSTANCE_SWAP preferredValues (Button's icon choice) deliberately resolve through the new icon registry as a plain enum prop, never `slot.accepts` (D2: no per-icon contract to resolve `accepts` ids against, by design) | a Piqueray component with a slot carrying `accepts` |
| `detect-code-removed-slot-prop` | C3-detection | deleting a slot's ReactNode prop from the generated code surfaces as code BEHIND | Piqueray has no slot-bearing component | a Piqueray component with a slot |
| `brand-added-token-layer-only` | C6-theming | adding a brand is a TOKEN-LAYER-ONLY operation: generated components stay byte-identical, a [data-brand] block is emitted, a Brand mode reaches the canvas, and an incomplete brand file is refused by name | Piqueray is mono-brand: brand.default.tokens.json is empty and there is no second brand to add alongside it | a second brand file in tokens/modes/ (brand.<name>.tokens.json) with real brand-layer tokens |
| `detect-default-and-kind-drift` | C3-detection | boolean/text canvas defaults, numeric code defaults, a DELETED code default, and property KIND changes on either surface are all caught | needs a Figma set with BOOLEAN and TEXT properties and a component with a numeric prop default (the demo Button.Loading/Label and Slider.value); the Piqueray Bouton set has one VARIANT property and the Button has no numeric or boolean prop | a Piqueray component with a boolean and/or numeric prop, drawn as BOOLEAN/TEXT properties on its Figma set |
| `naxis-full-cartesian-product` | C1-determinism | every enum prop is a variant axis: a 4-axis contract compiles the full 36-cell cartesian product with per-axis {prop} token substitution, and the existing 2-axis set keeps its names | the fixture binds demo tokens ({color.action.{variant}.*}, {space.inset-x.{size}}, {font.control.size.{size}}) and the second half asserts the DEMO Button's 2-axis 12-variant grid; the Piqueray Button has ONE axis and 6 variants | a Piqueray component with two or more enum axes (and the fixture re-authored against Piqueray tokens) |
| `detect-code-removed-event` | C3-detection | deleting a contract-declared event callback from the code surfaces as code BEHIND | no Piqueray contract declares an event | a Piqueray contract with a declared event (contract.events) |
| `refuse-defaultContent-outside-accepts` | C2-refusal | defaultContent naming a contract outside the slot's `accepts` set is refused by name | Piqueray has no slot, so no accepts/defaultContent pair exists | a Piqueray component with a slot carrying accepts + defaultContent |
| `detect-figma-missing-multislot-content` | C3-detection | a multi-slot component's nested-instance content missing from the canvas surfaces as figma BEHIND | Piqueray has no multi-slot component | a Piqueray component with more than one slot and declared defaultContent |
| `judge-passes-canonical-screen` | C3-detection | the adherence judge passes a canonical, fully compliant screen | evals/fixtures/good-screen.tsx composes demo components (Stack, Inline, Avatar, Card, Badge...) against the demo catalog | a Piqueray screen fixture built from the shipping catalogue |
| `judge-catches-all-violation-classes` | C3-detection | the judge catches every violation class: components-from-catalog, no-raw-equivalents, no-style-overrides, tokens-only, one-primary-action | evals/fixtures/bad-screen.tsx seeds its violations with demo components; with one shipping component several classes cannot be expressed | a Piqueray screen fixture (and enough shipping components to express each violation class) |
| `refuse-elementByProp-gaps` | C2-refusal | a partial semantics.elementByProp map and an unknown mapped element are each refused by name | no Piqueray contract uses elementByProp (the demo Heading did) | a Piqueray contract whose host element varies by prop (elementByProp) |
| `layoutByProp-flip-both-surfaces` | C1-determinism | a layoutByProp direction flip lands on BOTH surfaces: reversed CSS in code and reversed compiled child order on the canvas | no Piqueray contract uses layoutByProp (the demo ChatMessage did) | a Piqueray contract using layoutByProp |
| `refuse-stylesWhen-outside-whitelist` | C2-refusal | a stylesWhen property outside the literal whitelist, and a token-shaped stylesWhen value, are each refused by name | no Piqueray contract uses stylesWhen (the demo TextField did) | a Piqueray contract using stylesWhen |
| `refuse-overlay-inflow-conflicts` | C2-refusal | an out-of-flow overlay part that also claims in-flow growth is refused by name | no Piqueray contract uses overlay (the demo Banner did) | a Piqueray contract with an overlay part |
| `array-prop-code-only-skipped-everywhere` | C3-detection | an arrayOf (kind NONE) prop is code-only: skipped by every design-side consumer, never reported as drift; a scalar NONE prop is refused by name | the fixture contract binds demo tokens ({color.text.secondary}, {font.control.*}, {space.gap.sm}) that no longer exist, and Piqueray has no structured prop | a Piqueray component with an arrayOf prop (or the fixture re-authored against Piqueray tokens) |
| `pending-first-sync-not-drift` | C3-detection | null Figma anchors are workflow state (routed to `pending`), while an ANCHORED but missing set stays a hard BEHIND | it edits contracts/heading.contract.json — a deleted demo contract — so it needs a SECOND component to null-anchor while the first stays synced; a clean parity baseline alone would not restore it | a second Piqueray component (plus a clean parity baseline) |
| `refuse-hollow-state-previews` | C2-refusal | figmaStatePreviews with no declared states, and a state with no token overrides, are each refused by name | the Piqueray Button declares `states: []` — there is no state vocabulary to make hollow | a Piqueray component with interaction states (hover/active/focus-visible/disabled) and figmaStatePreviews |
| `state-previews-bounded-canvas-only` | C1-determinism | state previews multiply ONLY the primary enum axis, overrides land on the compiled specs, disabled carries a LITERAL node opacity (never a bound 0-1 variable), and the base cartesian stays the pure enum API | the Piqueray Button declares no states, so no preview overlay is generated | a Piqueray component with interaction states + figmaStatePreviews |
| `state-axis-drift-both-directions` | C3-detection | a drawn State axis is declared surface when opted in and kit-rot drift when not, with adoption proposed via figmaStatePreviews | the Piqueray Button declares no states and its Figma set has no State axis | a Piqueray component with interaction states |
| `text-styles-from-typography-tokens` | C1-determinism | Figma text styles are minted from semantic typography tokens, upserted by identity marker (never by name), and ridden by exactly-matching text nodes | core/token-corpus.ts derives text styles ONLY from semantic paths matching `font.<group>.size`; Piqueray's typography lives at `typography.<role>.{family,size,weight}`, so ZERO text styles are derived and the emitted token script carries none | either the typography token paths reshaped to font.<role>.size, or core/token-corpus.ts taught to derive styles from typography.<role>.size (Piqueray's 8 Montserrat styles are real and currently reach no surface) |
| `design-roundtrip-anatomy-zero-mismatch` | C5-extraction | live node-tree dumps of contract-generated sets re-propose contracts with ZERO MISMATCH | the fixture dumps are the demo Badge/Switch/Card canvases and their contracts are gone; the Piqueray Button dump cannot substitute because its contract is deliberately AUTHORED away from the drawn set (Bouton->Button, "Property 1"->variant, static text promoted to a children prop) — 14 differences by design | a Piqueray component whose contract was GENERATED to the canvas (not authored away from it), so the round trip is an identity |
| `design-roundtrip-uncorrelated-binding-is-mismatch-not-guess` | C5-extraction | a cross-variant binding that correlates with no axis is reported as drift, never guessed into a token | rides the same design roundtrip receipt (see above) | the design roundtrip receipt runnable again |
| `design-rest-roundtrip-zero-mismatch` | C5-extraction | a REST-mapped dump round-trips to the shipping contract with zero mismatch and zero map degradations, with no plugin involved | the fixtures render the demo Badge and Card canvases; contracts/{badge,card}.contract.json are gone, so there is nothing to compare the proposals against | a Piqueray component captured through the REST path |
| `design-rest-degraded-variables-never-fabricates` | C5-extraction | with the Enterprise variables endpoint absent, degradations are named exactly, raw values surface as UNBOUND with nearest-token candidates, and nothing is fabricated | the REST fixture is a rendition of the demo Badge canvas: its raw fills map to the deleted demo colour ramp and its text style to a deleted demo typography token, so two of the eight degraded bars cannot hold | a Piqueray component captured through the REST path (fixtures under extract/figma/rest/fixtures/) |
| `design-rest-degraded-minting-binds-styles` | C5-extraction | degraded imports mint provisional imported.* tokens that keep every style at literal fidelity, and minted names never leave the imported namespace | rides the same demo-Badge REST fixture and cannot run until its full-path section does | a Piqueray REST fixture (see above) |
| `design-mcp-roundtrip-fixture-replay` | C5-extraction | recorded live desktop-MCP responses replay to plugin-dump name fidelity: Badge zero-mismatch against its shipping contract, Eventz foreign names, and the U+2024 token-ref refusal | the Badge half compares against contracts/badge.contract.json (gone) and its 12px "badge" text style has no counterpart in Piqueray's typography scale | a Piqueray component recorded through the desktop-MCP path with its own shipping contract |
| `key-based-linking` | C5-extraction | nested instances resolve by componentSetKey FIRST (rename-safe), and a NAME match whose keys contradict is refused by name with a suffixed stub id | the receipt needs two in-scope contracts (button + badge) to argue key-vs-name linking against, and the whole claim is about nested instances | a Piqueray component that nests another, plus a second contract to collide names against |
| `stub-geometry-render` | C5-extraction | a nested child with no contract in scope renders its OBSERVED bounding box and primary paint as minted imported.stub-* tokens, never a hollow nothing and never invented anatomy | child stubs only arise for nested instances; Piqueray has none | a Piqueray component with a nested instance |
| `preferred-values-accepts` | C5-extraction | INSTANCE_SWAP preferredValues resolve through the session key index into slot `accepts` (acceptsMode prefer); unresolvable keys stay a NAMED note | needs a slot with preferredValues and a second in-scope contract to resolve the key against — confirmed still true post-002-governed-icons-button: that spec DID land INSTANCE_SWAP preferredValues resolution (Button's icon choice), but through a NEW, separate path (`proposeIconEnum` in core/propose-figma.ts, resolving against the icon registry into a plain enum prop) that this case's assertions don't exercise at all — the slot/`contractIdByKey` path this case pins remains genuinely untested by Piqueray | a Piqueray component with an INSTANCE_SWAP slot |
| `design-census-unmappable-child-props-dropped` | C5-extraction | an applied Figma prop on a nested instance that does not map through the child contract's bindings.figma is DROPPED with a named note, never guessed | the fixture nests an Avatar instance and needs ds.avatar in scope; that contract went with the reconversion | a Piqueray component with a nested instance whose child contract ships here |
| `design-census-boolean-visiblewhen-truthy-form` | C5-extraction | presence riding a true/false axis spells the TRUTHY visibleWhen form (never equals:"true"), and the inexpressible false side is a NAMED note kept unconditional | rides the same class-fix receipt, whose first section needs a nested-instance child contract in scope | the class-fix receipt runnable again (see design-census-unmappable-child-props-dropped) |
| `design-census-digit-led-prop-binding-prefixed` | C5-extraction | a digit-led Figma property spelling gets the deterministic "p" prefix on its code binding with a named note, while the figma binding keeps the original spelling | rides the same class-fix receipt (see above) | the class-fix receipt runnable again |
| `checkbox-native-input` | C4-convergence | the checkbox renders a real focusable <input type=checkbox>, checked rides the DOM, indeterminate is the DOM PROPERTY via a ref, and the Switch is input[type=checkbox][role=switch] | Piqueray ships no checkbox or switch | a Piqueray checkbox and switch |
| `refuse-role-recreating-native-control` | C2-refusal | a role that re-creates a control the platform ships (<button role=checkbox>) refuses BY NAME at generation, a DECLARED exception passes, and a dangling exception refuses too | needs the checkbox contract to reintroduce the shape on, and ds.progress-bar to carry the declared exception | a Piqueray component whose role claim could shadow a native control, plus one with a declared roleException |
| `playground-caption-consistency` | C3-detection | every countable claim in the Examples gallery captions is DERIVED from a real contract, and reintroduced hardcoded counts are refused | playground/src/engine/examples.ts still references ds.badge, ds.switch and other deleted demo contracts | the playground examples re-authored against the Piqueray catalogue |
| `switch-canvas-thumb` | C1-determinism | a styled static-text part (the Switch thumb) keeps its fill, 16px box and radius binding in the compiled spec, and the canvas renderer's text branch renders them | Piqueray ships no switch | a Piqueray component with a styled static-text part carrying box channels |
| `focus-not-pressed-browser-probe` | C1-determinism | real keyboard focus renders the DEFAULT fill under the ring in a real browser, never the hover/pressed fill | the Piqueray Button declares `states: []`, so the emitted CSS carries no :hover/:focus-visible rules and there is no fill to compare | a Piqueray component with interaction states |
| `slot-empty-not-placeholder` | C1-determinism | an empty slot is ABSENT and NAMED in a comment, never painted placeholder text, while declared defaultContent still renders | Piqueray has no slots (the demo Token and Breadcrumbs carried them) | a Piqueray component with a slot, and one with slot defaultContent |
| `heading-margin-reset` | C1-determinism | a root that can render as a UA-margined element carries margin:0 on both CSS surfaces, and a root that cannot carries none | Piqueray ships no block-level component (the demo Heading/Blockquote/Divider/List carried the rule; Badge was the negative case) | a Piqueray component whose root is a UA-margined element (h1-h6, p, blockquote, ul, hr) |
| `token-size-live` | C1-determinism | an enum size axis is LIVE: each non-default value emits a distinct, non-empty override rule (the dead-prop class) | Piqueray ships no component with a size axis | a Piqueray component with a size (or other secondary) enum axis |
| `repeated-children-collection` | C5-extraction | three or more adjacent sibling instances with a carriable per-item field propose as ONE repeat template + an arrayOf prop; per-item enum differences and ambiguous keys stay NAMED receipts | repeat collections require a nested child contract in scope; Piqueray has no composed component | a Piqueray component that repeats a child (repeat + component in its anatomy) |
| `plugin-engine-bundle` | C1-determinism | the plugin engine bundle matches its committed drift receipt, the headless harness EXECUTES the generate flow against a mocked figma global with the specHash mirror intact, dependencies are planned in order, and a core mutation makes the next zip build refuse BY NAME | `scripts/plugin-engine-check.mjs` has since been re-pointed onto the shipping contract and is GREEN, but its **dependency-ordering** flow is skipped by name (no composite to order), and this case asserts that flow's exact line | a Piqueray composite (a contract that nests others). The bundle/receipt/generate half is already exercised — this case could be restored today with the bundle-order assertion split out |
| `plugin-update-report` | C3-detection | the Update-library tab renders the EXACT plain-words change report before anything applies (version->version with +prop, new-with-variant-count, unchanged-skip, counts, nothing-applied tail), a duplicate id refuses by name, and Apply amends IN PLACE | `plugin-engine-check` now runs this flow green against the Button, but the **"new — will be created"** row is skipped by name (needs a second contract), and this case's expected strings still name Badge/Switch | a second Piqueray component for the "new" row. Everything else it asserts is exercised today — re-pointing its expected strings onto the Button would restore most of it now |
| `plugin-propose-dry-run` | C4-convergence | the ui.html-embedded dump script reads the mock-generated set back, proposeDiff yields a bounded API-level diff naming a missing prop, and the PR flow prints its exact 4-step REST plan with zero network | nothing structural — `plugin-engine-check` runs this flow green against the Button today; only the case's expected strings still name Badge | **nothing.** Re-point its expected strings onto the Button (`+prop property1`, `ds-contracts/propose-ds.button-fixture`) and it comes back immediately |
| `wc-emitter-roundtrip` | C7-cli | the emitter plugin interface PRESERVES TRUTH: five contracts emit as Web Components, custom-elements.json is generated from them, the repo's own CEM adapter reads it back, and every prop/enum/default/event survives with each non-survivor NAMED | the receipt's five subjects are the demo Badge/Button/Switch/Card plus the Polaris badge pilot | a Piqueray catalogue large enough to exercise the round trip (or the receipt re-pointed at the shipping contract alone) |
| `wc-emitter-css-parity` | C1-determinism | the emitted Web Component demo and core/emit-html's render of the SAME contracts compute IDENTICALLY in real Chromium across 165 channel comparisons (enum x boolean x state chrome) | its three subjects are the demo Badge/Button/Switch, and the state-chrome comparisons need disabled/loading/checked states Piqueray does not have | Piqueray components with boolean props and interaction states |
| `depth-composite-child-collection` | C8-journey | a multi-root Modal whose body holds a composed child AND a repeated collection emits and EXECUTES on all four surfaces, and the built canvas node tree lines up with the contract anatomy PART-FOR-PART | examples/depth-composite/composite-modal.contract.json composes ds.card, ds.badge, ds.avatar and ds.button, all deleted; multi-root + nested instances + repeat are all shapes Piqueray does not have | a Piqueray multi-root composite with nested instances and a repeat collection |

## Frozen coverage outside the eval suite

Not all frozen coverage is an eval case. `npm run plugin:check`
(`scripts/plugin-engine-check.mjs`) drives the packaged plugin engine against a
mocked Figma global; it is **green**, and it **prints** every flow it cannot
exercise rather than dropping it. The skipped flows sit here with the rest.

| flow | what it proved | why it cannot run on Piqueray today | what Piqueray would need |
|---|---|---|---|
| dependency ordering | a bundle whose contract references others plans the dependency scripts FIRST and the composite LAST (`sortByDependencies`) | needs a contract whose anatomy carries a `component` ref; Piqueray ships a flat Button | a composite (one contract nesting another) |
| the update report's "new — will be created" row | a contract the bundle carries but the canvas has never seen is reported as new, with its variant count, and counted in the "N new" total | needs a SECOND contract, so the bundle can carry one the canvas has not seen | a second Piqueray component |
| packaged-engine composition | the packaged `window.DSC` — not just the raw emitter — parses a CONTRACTS-BUNDLE, plans deps-first, executes in the mock, and builds a multi-root Modal with a nested INSTANCE and a repeated collection (code ≡ canvas) | needs a multi-root composite with nested instances and a repeat collection | a Piqueray composite |
| the reverse journey for that composite | dumping the built composite off the canvas and proposing back recovers BOTH roots, the composed INSTANCE and the repeated collection — advanced composition round-trips in both directions | same missing shape; it reads the artifact the previous flow builds | a Piqueray composite |

The two composite flows' original code is preserved verbatim in the session
scratchpad and in git history (`scripts/plugin-engine-check.mjs` before the
Piqueray re-point) — they are ~90 lines and restore as a block.

## Reading the list as a shopping list

The last column is the point. Grouped, the quarantine says Piqueray would get
these capabilities back by gaining:

- **a second component** — `pending-first-sync-not-drift`, `plugin-update-report`
- **a composed component** (one contract nesting another) — `key-based-linking`,
  `stub-geometry-render`, `detect-figma-missing-nested-instance`,
  `design-census-*`, `plugin-engine-bundle`, `plugin-propose-dry-run`
- **a slot (INSTANCE_SWAP)** — `preferred-values-accepts`,
  `detect-figma-missing-slot-property`, `detect-figma-accepts-drift`,
  `detect-code-removed-slot-prop`, `refuse-defaultContent-outside-accepts`,
  `slot-empty-not-placeholder`
- **interaction states** — `refuse-hollow-state-previews`,
  `state-previews-bounded-canvas-only`, `state-axis-drift-both-directions`,
  `focus-not-pressed-browser-probe`, `wc-emitter-css-parity`
- **a boolean or numeric prop** — `detect-default-and-kind-drift`
- **a second enum axis** — `naxis-full-cartesian-product`, `token-size-live`
- **a second token mode or brand** — `refuse-incomplete-mode-set`,
  `brand-added-token-layer-only`
- **repeat collections / multi-root anatomy** — `repeated-children-collection`,
  `depth-composite-child-collection`

One entry is **not** waiting on a Piqueray feature and is worth reading
separately:

- `text-styles-from-typography-tokens` — blocked on a **live gap**:
  `core/token-corpus.ts` derives Figma text styles only from semantic paths
  matching `font.<group>.size`, and Piqueray's typography lives at
  `typography.<role>.{family,size,weight}`. Zero text styles are derived, so
  Piqueray's 8 Montserrat styles currently reach no surface.
