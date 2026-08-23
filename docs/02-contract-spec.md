# 2 · Contract Specification

One contract per component, at `contracts/<component>.contract.json`. The authoritative schema is defined in Zod at `scripts/contract-schema.ts`; `npm run schema` emits `contracts/contract.schema.json` so editors validate contracts inline (every contract's `$schema` field points at it).

## Top-level fields

| Field | Type | Purpose |
|---|---|---|
| `id` | `ds.<kebab-name>` | **Stable canonical identity. Never renamed.** Display names can change on either side; the `id` is what survives. |
| `name` | string | Display/export name (`Button`). Drives the code export and the canvas component set name. |
| `version` | semver string | Bumped when the contract changes. The unit of change management. |
| `status` | `draft` \| `stable` \| `deprecated` | Governance lifecycle. |
| `category` | `atom` \| `molecule` \| `section` — optional (v17) | Organizational tier mirrored **structurally** from the Figma DS pages. Optional: a contract without one stays valid and the surfaces fall back to a `Components/` group; an unknown value is refused by name at build. The three generated surfaces (Storybook titles, catalog, Contract Hub) derive their grouping from it, with English labels from the single source `CATEGORY_LABELS` (`atom → Atoms`, `molecule → Molecules`, `section → Sections`). |
| `description` | string | Usage intent. Flows into Storybook autodocs and (phase 2) the canvas component description — the same sentence in both surfaces, from one source. |
| `semantics` | `{ element, role?, provenance? }` | The HTML element the code renderer uses, the ARIA role if it differs, and (v16) an optional `authored`/`extracted` provenance marker. |
| `props` | `Prop[]` | The canonical API. See below. |
| `states` | `("hover" \| "focus-visible" \| "disabled")[]` | Interaction states the component must support. Drives CSS pseudo-class rules (code) and, in phase 2, variant pseudo-state frames (canvas). |
| `anatomy` | `Record<partName, Part>` | Named internal parts with **token bindings** — where all styling decisions live. |
| `a11y` | object | Executable accessibility requirements (`focusVisible`, `minHitArea`, `contrast`) plus (v16) an optional `authored`/`extracted` provenance marker. Phase 1 records them; later phases enforce them. |
| `anchors` | object | Per-side identity anchors. See below. |

## Props

Each prop declares its canonical name, type, default — and **bindings**, which describe how the one canonical prop manifests on each side. This is the Code Connect idea folded into the source of truth:

```jsonc
{
  "name": "variant",
  "description": "Visual prominence of the action.",
  "type": { "enum": ["primary", "secondary", "danger"] },   // or "boolean" or "text"
  "default": "primary",
  "bindings": {
    "design": {
      "kind": "VARIANT",                    // variant | boolean | text | instance-swap
      "property": "Variant",                // canvas component property name
      "values": { "primary": "Primary", "secondary": "Secondary", "danger": "Danger" }
    },                                      //  ^ canonical value → canvas variant value
    "code": { "prop": "variant" }           // React prop name
  }
}
```

Rules of thumb:

- **The canonical value set lives here and only here.** Canvas spelling (`"Primary"`) and code spelling (`"primary"`) are *renderings* of the canonical value.
- `"text"` props map to `children` in code and a text property on the canvas.
- `"boolean"` props map to the native attribute where the element supports it (`disabled` on `<button>`), otherwise a `data-*` attribute.

### SectionHeader v3 migration

`ds.section-header@3.0.0` is a breaking, intentionally smaller generic API. It exposes only `titre` (rich text), `accroche` (text), `afficherAccroche` (boolean, default `true`) and `alignement` (`centre | gauche`, default `centre`). Its Figma set contains exactly `Alignement=Centre` and `Alignement=Gauche`; both render the standard dark 40/50 title.

The v2 `disposition`, `emphase` and `accroche2` properties were removed with no compatibility alias. Migrate `accroche2` explicitly to `afficherAccroche`. A former Hero, Presentation, Texte SEO or Products combination must route to its named owner; generic SectionHeader never receives an inferred hierarchy or CTA fallback. This contract migration changes generated references only—existing saved Odoo page markup is detected as stale, never rewritten.

## Anatomy & token bindings (v2 — composition)

Anatomy is a **nested tree** of named parts (CEM's slots/parts, Curtis's anatomy). Every part can carry **token bindings** (CSS property → DTCG token reference — the CSS Module and the canvas node styling are both generated from these; there is no handwritten style layer), a **layout** block (`display`/`direction`/`align`/`justify` → flexbox on the code side, auto-layout on the canvas side), and one of three composition roles:

| Part field | Meaning | Code output | Canvas output |
|---|---|---|---|
| `component: { id, props? }` | Fixed instance of another contract; `props` uses canonical child prop names and scalar literal or `{parentProp}` values | imported `<Child prop="…">` | nested instance with properties set through the child's bindings |
| `slot: { name, accepts?, acceptsMode?, min?, max?, required?, figmaProperty?, control? }` | Constrained insertion point; `accepts` lists contract IDs resolved via anchors; optional `control` describes the supplied form control, not the wrapper | `children` / `ReactNode` prop | instance-swap slot property (Slot-utility default) whose preferred values are the accepted contracts' component keys; optional parts get a `Show X` boolean |
| `content: { prop }` | Text bound to a declared text prop | `{title}` in the part's element | text node linked to the text property |
| `vectorAsset: { asset, width, height, position? }` | Governed arbitrary SVG (logo/illustration), not an icon | inline SVG asset; token `color` drives `currentColor` | `createNodeFromSvg`, resized to the declared rectangle; monochrome paint is rebound to the token variable |

Parts with none of these are structural (frames/elements containing `parts`). `optional: true` renders conditionally in code and toggles visibility on the canvas. `visibleWhen` includes a part for a matching prop; its enum-only inverse, `hiddenWhen: { prop, equals }`, omits a part for that variant on every renderer. This is used when a variant removes anatomy entirely — for example Button `iconOnly` has no label node — rather than merely applying `display: none`. Composition rules: part names are unique per contract; cycles and unknown contract refs **fail the build**; sync scripts emit in dependency order. See [docs/08](08-composition-and-spec.md) for the design rationale.

```jsonc
"anatomy": {
  "root": {
    "tokens": {
      "background-color": "{color.action.{variant}.background}",
      "padding-inline":  "{space.inset-x.{size}}",
      "border-radius":   "{radius.control}"
    },
    "states": {
      "hover":  { "background-color": "{color.action.{variant}.background-hover}" },
      "disabled": { "opacity": "{opacity.disabled}" }
    }
  },
  "icon": { "slot": true, "optional": true }
}
```

**Bounded literal styling (`Part.literals` / `literalsByProp`, v14).** A part may also carry `literals: { <css-prop>: <value> }` — a value with no token vocabulary to bind (a component-private pixel geometry, a foreign-system literal), scoped to a fixed, versioned set of channels (`LITERAL_CHANNELS`): geometry (`width`/`height`/`min-width`/`min-height`, `padding-*` incl. longhands, `gap`), paint (`background`/`background-color`/`color`/`border-color`), and trait (`border-radius`/`border-width`, per-corner/per-side). Every channel shares one bounded value grammar (`LITERAL_VALUE_RE`: px/rem/em/number, hex or `rgb()`/`rgba()` color, `transparent`/`inherit`/`currentColor`) — **except `background-image` (v15/015)**, admitted only for the `linear-gradient(...)` gradient grammar (`GRADIENT_LITERAL_RE`), never a widening of `LITERAL_VALUE_RE` itself. A channel outside this set, or a value outside its channel's grammar, refuses **at schema validation**, never merely at emit time. `literalsByProp: [{ prop, map: { <value>: { <css>: <literal> } } }]` is the per-enum-value sibling, same grammar per channel. Every geometric literal (the layout subset of `LITERAL_CHANNELS`, `contracts/geometry-gate.interface.md` §2) must additionally resolve through `contracts/named-literals.registry.json` or `npm run geometry:gate` refuses it by name (015, FR-001/FR-003) — a literal is a documented, surveilled exception, never an invisible number.

### Conditional semantics and scalar composition

These optional fields are additive: contracts that omit them retain their existing shape and output.

**`attrsByProp`.** A part may select DOM attributes from one boolean or enum prop with `{ prop, map }`; use an ordered non-empty array when independent selectors contribute attributes. Each `map` key is a selector value and each value is an attribute-name → string map. An absent selector value or attribute means omission; attribute strings may reference another declared prop as `{prop}`. Code emitters apply the resolved attributes; the canvas has no DOM-attribute equivalent.

```jsonc
"attrsByProp": {
  "prop": "actif",
  "map": { "true": { "aria-current": "page" } }
}
```

The build refuses an unknown selector or referenced prop, a non-boolean/non-enum selector, or a map key outside the selector's values.

**`slot.control`.** A constrained slot may declare semantics for the element supplied to it, without reaching into child anatomy. `fill: "width"` makes that control fill the slot's available width. `attributes` maps each attribute to `{ prop, values }`, where `prop` is a boolean or enum on the owning contract and `values` covers every selector value; `null` deliberately omits the attribute. A control declaration requires a non-empty `accepts` list. Code emitters forward these facts to the supplied control rather than its presentational slot wrapper.

**`tabContext`.** A root with native `role: "tab"` may declare the *external* composition boundary that owns roving focus: `{ owner: "external", role: "tablist", rovingFocus: true, idProp, minTabs }`. `idProp` must name a text prop and the Tab root must bind it as `data-tablist-id`. This does not create a TabList component, wrapper, or keyboard handler inside generated Tab output. The visual campaign may render the declared controller context solely to inspect the relationship, using the explicitly supplied `idProp` value; a missing id fails the receipt rather than receiving a harness default.

**`geometryJustification`.** Root-only receipt metadata can name the narrow `typographic-subpixel-rounding` exception when Figma and the browser round the same observed glyph advances differently. It requires a non-empty reason plus non-negative absolute bounds for the root and every affected named part. It emits no CSS and cannot change HUG/FILL behavior, width, spacing, transforms, pixels, thresholds, or masks. A campaign must point to the object and publish an explanation; the geometry gate accepts it only if every actual mismatch is inside its own bound. Any unbounded or non-typographic mismatch still fails.

**Rich text and `marks.strong`.** A `rich-text` prop is a non-empty array of `{ text, strong? }` segments and still binds to one native Figma `TEXT` property; the canvas receives the concatenated text while code preserves segment boundaries as semantic `<strong>` ranges. A content part may govern those ranges with `marks.strong` as either a legacy weight token reference or `{ "font-weight": token-ref | "100"…"900", "font-size"?, "line-height"? }`. The optional size and leading are bounded literals; the weight is always required, so browser-default bold is never an unstated style fact.

**Declared image crop focus.** `declared: { "object-fit": "cover", "object-position": "50% 51%" }` carries an observed Figma IMAGE FILL scale mode and non-default focal point on the emitted HTML image. `object-position` accepts only one or two basic position keywords or numeric `px`/`%` values; it is code-rendered and canvas-annotated because Figma retains the native fill transform. Omit it for FILL's observed centered default rather than using it as a pixel-alignment offset.

**Scalar composed-child props.** `component.props` fixes or forwards only text, number, boolean, or enum child props. A literal fixes the child value; `"{parentProp}"` is a live parent-to-child mapping. Both props must exist and have compatible scalar types (a forwarded enum's values must be accepted by the child); structured child props are refused. The child remains a component instance—its anatomy is never flattened—and a code-only child prop is forwarded only on code surfaces.

**Substitution:** a `{propName}` placeholder inside a token path expands over that enum prop's values. `{color.action.{variant}.background}` with `variant: primary|secondary|danger` produces three CSS rules (`.variant-primary { … }` etc.). One placeholder per reference in phase 1.

**The integrity gate:** at generation time, every reference — *after* expansion — must resolve to a real token in `tokens/`. A binding to a nonexistent token fails the build with the exact contract path and missing token named. The contract and the token set cannot silently disagree.

## Events (v6 — the interaction surface)

A contract can declare **what interactions exist** without ever describing how they're implemented:

```jsonc
"events": [{
  "name": "toggle",
  "bindings": { "code": { "prop": "onToggle" } },   // code-only, by declared fidelity limit
  "trigger": "trigger",                              // the anatomy part that fires it
  "toggles": {                                       // optional: a generatable toggle
    "prop": "state",                                 // enum prop being flipped
    "between": ["closed", "open"],                   // activation flips within this pair
    "aria": "expanded"                               // → aria-expanded on the trigger
  }
}]
```

What each surface does with this:

- **Code (generated):** an optional callback prop (`onToggle?: () => void`), and — when `toggles` is present — the complete toggle: an uncontrolled `useState` fallback (so the component is interactive out of the box), the controlled/uncontrolled resolution (`stateProp ?? internal`), a click handler on the trigger, and the ARIA state attribute. Values of the toggled enum *outside* the pair render `aria-*="mixed"` and resolve to the pair's second value on activation — exactly Checkbox's `indeterminate`.
- **Design (description only):** the canvas cannot run behavior, so events surface as component-description text (`Event (code): onToggle — …`) in the properties panel. A declared fidelity limit, like animation.
- **Differ:** the callback is contract API. Deleting `onToggle` from code is `code BEHIND` (eval: `detect-code-removed-event`); a handwritten `onX` prop the contract doesn't declare is `code AHEAD` like any other prop.

Guardrails, enforced at build time: a trigger part must be a `<button>` (keyboard activation comes from the platform, not a bolted-on handler), `toggles.prop` must be an enum containing both `between` values, and event prop names must be `on*` and collision-free.

**What events deliberately do NOT cover:** drag, typeahead, focus trapping, animation timing — behavior whose truth can't be verified on both surfaces. That stays a hand-written layer, and the contract refuses to pretend otherwise.

## v7 additions — the expressiveness round

Five features from the second schema gauntlet, each shipped with a consuming contract and eval coverage.

**Element by prop.** `semantics.elementByProp: { prop, map }` lets the rendered HTML element follow an enum prop. Heading's `level` maps `"2" → h2`; code emits an `ELEMENT_MAP` lookup and renders a dynamic tag (`semantics.element` is the fallback). The canvas is unaffected — text nodes carry no element semantics, a declared fidelity boundary. The element vocabulary now includes `h1`–`h6`. Build-time guardrails: the prop must be a declared enum, the map must cover every value, and every mapped element must be in the vocabulary.

**`grow` and `width: "fill"` are DIFFERENT AXES — and only agree under a row parent.** `layout.grow: true` emits `flex: 1 1 auto` in CSS, which grows along the parent's MAIN axis; on the canvas the same field sets `layoutSizingHorizontal = FILL`, which is always HORIZONTAL (`core/emit-figma-script.ts`, ChildSpec.grow). Under a `direction: "row"` parent the two coincide and nothing is wrong. Under a `direction: "column"` parent they name **different axes**: Figma fills the width while CSS stretches the HEIGHT, and the two surfaces drift while every gate stays green — `parity` compares props and nested instances, not layout mode. Cross-axis width fill is `layout.width: "fill"` (CSS `width: 100%`; canvas `layoutAlign: STRETCH`), which means the same thing on both surfaces whatever the parent's direction. **Rule: under a column parent, use `width: "fill"` for width and never `grow`; reserve `grow` for a child that genuinely takes the remaining space along its parent's main axis.** Receipt (2026-08-22, spec 023): `ds.carte-categorie/categorieImage` carried `grow` under a column root, so its photo absorbed the card's leftover height — a card whose neighbour had two extra lines of text rendered its photo at 472px instead of 418. Measured on a live Odoo instance, not inferred. See `specs/023-categories-gouvernees/proofs/amendement-2026-08-22.md`.

**A parent-owned width plus a fixed height is usually a lie — use `layout.aspectRatio`.** An image plane whose width is owned by the parent (`width: "fill"`, a grid cell, a resized instance) keeps its PROPORTIONS on the canvas: the Figma emitter sets `constrainProportions` on an image placeholder that fills its width and carries a master height. A `tokens.height` on such a part is therefore only true at the master's own width, and false at every other one. Carry the fact as `layout.aspectRatio` instead — the ratio is width-independent, and it is what both surfaces mean. Same receipt: the same photo was pinned at 418px while the source scaled it 418 → 468 → 300 across three card widths.

**Layout by prop.** `Part.layoutByProp: { prop, map }` applies per-enum-value layout overrides merged over the base `layout`. Partial coverage is the point — only deviating values appear (ChatMessage: `sender=user` flips `direction: row-reverse` on the root and `align: end` on the body → right-aligned user messages). Code emits the override under the root's enum class; the canvas resolves it per variant at compile time — reversed directions, which have no auto-layout equivalent, render as the same children in reversed order. Overrides are limited to display/direction/align/justify/columns — `grow` and `overlap` stay per-part invariants — and component-instance parts refuse overrides (the child contract owns its layout). Spec 023 added the `columns` channel: on a part whose base `layout` is `display: grid`, a per-enum-value `columns` re-sets the fixed track count (the section `colonnes` {2,3} enum drives a 2- or 3-column grid). It is CARRY-BOTH — code emits `grid-template-columns: repeat(N, minmax(0, 1fr))` under the enum class, the canvas sets `gridColumnCount` per compiled combo — and a `columns` override on a non-grid part is refused by name, the value-level mirror of the base `columns` ⇔ `grid` rule.

**Conditional literal styles.** `Part.stylesWhen: [{ prop, equals?, styles }]` applies literal CSS — never tokens — when a prop matches. Boolean conditions ride the per-boolean data attribute the generator already emits (`.root[data-is-disabled] { … }`; native `disabled` uses `:disabled`); enum conditions ride the root's enum class. The whitelist is deliberately tight (position/insets/z-index/overflow/text-overflow/white-space/display/opacity/pointer-events/transform/transition/flex-direction/justify-content/align-items/cursor/text-decoration): anything with a token vocabulary belongs in `tokens`, and a brace-wrapped value here is refused by name. Fidelity: v1 applies nothing on the canvas — boolean properties can bind visibility, not style — a declared code-side surface, like events.

**Overlay parts.** `Part.overlay: { placement: top | bottom | start | end }` renders the part out of flow, attached to one edge of the root — Tooltip bubbles, Combobox popups. Code: `position: absolute` with placement-derived insets and `position: relative` on the root. Canvas: `layoutPositioning: 'ABSOLUTE'` with placement-derived constraints, including through the amend path. Guardrails: the root cannot be an overlay, and an overlay part cannot also `grow` or `overlap`.

**Structured props.** `type: { arrayOf: Record<field, 'text' | 'number' | 'boolean'> }` declares a list-of-records prop (Breadcrumbs items, Select options). Code-only by declared fidelity limit — the canvas has no list-of-records property type — so the design binding is `{ "kind": "NONE" }` with no `property`, and every design-side consumer (figma generator, differ, diagnose) skips the prop rather than reporting it behind. Code renders `items?: Array<{ … }>`: no default destructure (undefined means "not provided", never a silent `[]`) and excluded from `...rest`. Guardrails: `arrayOf` ⇔ `kind: "NONE"` in both directions, no defaults, at least one field.

## State previews (`figmaStatePreviews`, v8)

Interaction states are declared once (`states` + per-state token overrides on `anatomy.root.states`) and rendered per surface at that surface's fidelity: code gets real `:hover`/`:focus-visible`/`:disabled` CSS; the canvas — which cannot run pseudo-classes — gets nothing by default. Real systems hand-build "State=Hover" variant axes to fill that gap, and those rot (all four drift-research pilots carry them). `figmaStatePreviews: true` makes the design generator own that axis instead: a `State` variant axis (`Default`, `Hover`, `Focus Visible`, …) where each non-default state applies the state's token overrides on top of the variant's base bindings. This is the mirror image of code-only events: events are code-only, state previews are canvas-only, and the code surface is completely unaffected.

Bounds and refusals: previews multiply only the *primary* enum axis (the one the overrides substitute — `{color.action.{variant}.background-hover}` names `variant`); every other axis sits at its default. The opt-in is refused by name when the contract declares no states, when any declared state has no root token overrides (its preview would render identically to Default), when overrides substitute more than one enum prop, or when a prop already binds the design property `State`. Fidelity notes: `opacity` binds directly; the focus outline renders as a bound stroke (outline-offset has no canvas equivalent).

## Anchors

```jsonc
"anchors": {
  "design": { /* the design tool's stable file/component-set/node identifiers */ },
  "code":   { "importPath": "src/components/Button", "export": "Button" }
}
```

This is the DTCG `$extensions` dual-ID pattern applied to components. After phase 2 first generates the canvas component set, its stable identifiers are written back here. From then on, renames on either side never fork identity — parity checks match by anchor, not by name. (In the reference implementation the design-side keys — here and in prop bindings — are namespaced after the bound commercial design tool; the concrete key shapes are documented in docs/internal/figma-sync.md.)

**Dump provenance (v16).** `anchors.figma.dumpedAt` is an optional ISO-8601 string recording *when* the Figma dump this contract was extracted from was taken — a photo at instant-T, not a live sync (populated from the dump's `_provenance.extractedAt`). It lets the differ report contract↔Figma drift against a named baseline instead of an unmarked "sometime".

**Authored-vs-extracted markers (v16).** `a11y.provenance` and `semantics.provenance` are optional `"authored" | "extracted"` enums. Figma does not encode accessibility or element semantics, so a Button's `a11y`/`semantics` baseline is **authored**, never canvas-recovered — the marker makes that a machine-checkable fact on the artifact rather than an implied one (Honesty: no invented value passes unlabelled). Both are additive-optional; an absent marker means unmarked (legacy), and every existing contract still validates.

## Vector assets (`assets/vectors/`, v18)

`vectorAsset` is additive anatomy vocabulary for arbitrary SVG geometry whose source is governed as a file rather than copied as path data into a contract. It deliberately differs from `icon.asset`: its intrinsic `width` and `height` are independent, it is not registry-backed or assumed square, and a child may carry explicit `{ x, y }` coordinates through `position`.

```jsonc
"wordmark": {
  "vectorAsset": {
    "asset": "brand-wordmark",
    "width": 145.67,
    "height": 25.004,
    "position": { "x": 34.33, "y": 5.96 }
  },
  "tokens": { "color": "{color.brand}" }
}
```

Assets live at `assets/vectors/<asset>.svg`; the build refuses a missing asset by name. SVGs must be acquired from the source design, not redrawn. Dump v1.8 promotes a monochrome `VECTOR`, or a `GROUP` composed only of uniform-painted vector leaves, to a `vectorAsset` extraction record. `extract:figma` decodes and normalizes the captured bytes into `<out>/assets/vectors/`, writes `vector-assets.manifest.json` with deterministic SHA-256 hashes, and refuses mixed, non-solid, absent, or empty geometry. Use `--promote-assets` only after review to write the governed `assets/vectors/` directory; promotion refuses to overwrite differing files. The contract contains only the asset reference and geometry, never base64 or path data. The React/HTML/inline emitters inject the SVG, while the Figma emitter imports it through `createNodeFromSvg`, applies the declared non-square bounds, and rebinds a monochrome `currentColor` paint to the part's `color` token. The C5 fixture `vector-asset-figma-capture-proposes-external-geometry` pins capture, normalization, hashing, and proposal; the C3 fixture `vector-asset-non-square-token-bound` executes both generated React/Figma paths and requires drawable vector geometry in the mock.

## Icon Registry (`contracts/icons.registry.json`, v1.0.0+)

A **separate, additive document type** (`IconRegistrySchema`, `packages/schema/src/contract-schema.ts`) — not a Contract, and no existing Contract field is touched or repurposed to make room for it. One versioned document the designer's Figma menu and the developer's code list both derive from and are mechanically verified against (the parity differ's `icons` axis: registry ↔ `assets/icons/` inventory ↔ the committed canvas snapshot).

```jsonc
{
  "id": "ds.icons",
  "version": "1.0.0",
  "source": { "fileKey": "d9FYAUcqdcNtsuaMgLefvJ", "zoneNodeId": "6:111", "dumpedAt": "2026-07-23" },
  "icons": [
    {
      "name": "arrow-left",                             // canonical kebab id — shared by designer + developer
      "figma": { "componentName": "arrow-left", "key": "8a405ce4…", "nodeId": "6:99" },
      "asset": "arrow-left",                             // assets/icons/<asset>.svg
      "size": 20,
      "description": "Arrow pointing left — the Button's leading icon default."
    }
  ]
}
```

Evolution follows Contract's own semver discipline: widening `icons[]` = minor, narrowing or renaming a `name` = major.

### The INSTANCE_SWAP enum-binding convention

A prop that lets a component's user choose **which** governed icon fills a slot (as opposed to a `boolean` prop answering "shown or not") uses the **existing** generic binding shape — no schema change:

```jsonc
{
  "name": "iconLeftGlyph",
  "type": { "enum": ["arrow-left", "cart", "chevron-down", "…"] },   // = the registry's names, exactly (FR-011)
  "default": "arrow-left",
  "bindings": {
    "figma": {
      "kind": "INSTANCE_SWAP",
      "property": "Glyphe gauche",                       // the master's real swap-property name, from-dump
      "values": { "arrow-left": "arrow-left", "cart": "cart" }   // canonical name → figma.componentName, per the registry
    },
    "code": { "prop": "iconLeftGlyph" }
  }
}
```

The anatomy side reuses the **existing** enum-substitution convention (`icon.asset: "{prop}"`) — no new machinery: `"{iconLeftGlyph}"` pulls *every* enum value into the generated `ICONS` map, and the emitter's existing missing-asset refusal enforces "every enum value has a code asset" for free.

```jsonc
"anatomy": { "root": { "parts": {
  "iconLeft": { "icon": { "asset": "{iconLeftGlyph}", "size": 20 }, "visibleWhen": { "prop": "iconLeft" } }
} } }
```

`kind: "INSTANCE_SWAP"`, the generic `values` map, and `{prop}` asset-substitution all already existed before this document type — an icon-choice prop is that machinery used exactly as declared, never a new capability.

**Named limitation — the icon byte-proof is headless.** On the *code* surface the enum resolves to a real asset and the choice is byte-guarded by the golden manifest. On the *canvas* surface the emitter **bakes each glyph as a vector** (SVG paint is not bindable at import), **not** as a swappable local-master `INSTANCE_SWAP` instance — so the contract→canvas determinism proof for icon choice runs **headless** (`deterministic-roundtrip` + the faithful mock), never against live swap instances. Live alignment between the contract's governed menu and the master's real `Glyphe gauche` / `Glyphe droite` swap properties is proven instead by the **re-pulled, committed parity snapshot** (`parity/snapshots/figma-components.json`, the differ's `icons` axis — D8), which the single master update refreshed to exactly the 13 governed keys.

## Versioning & change policy

- Any change to `props`, `states`, `anatomy`, or `a11y` bumps `version`. Additive optional API or vocabulary (including a non-restrictive `attrsByProp`, `slot.control`, `tabContext`, `geometryJustification`, rich-text mark styling, declared crop facts, or scalar child mapping) is minor; removing, renaming, narrowing, or making a prop, enum value, slot acceptance/arity, or scalar mapping incompatible is major. A prop-shape change (for example `text` → `rich-text`) is major; patch is reserved for a backwards-compatible correction with no declared API or semantic change.
- Contract changes land as PRs. The PR diff *is* the design-system change review — one artifact, reviewable by designers and engineers alike.
- Phase 3's promotion flow generates these PRs from drift detected on either surface.

## Schema evolution

The schema itself will grow (composition/nesting, layout block, behavior/events, multi-placeholder substitution are known gaps — see [architecture doc](01-architecture.md)). Schema changes happen in `scripts/contract-schema.ts`, are reflected by `npm run schema`, and must keep existing contracts parsing (add optional fields; never repurpose existing ones).
