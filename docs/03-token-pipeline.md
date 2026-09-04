# 3 · Token Pipeline

Tokens are the aesthetic half of the contract. They live in `tokens/` as DTCG JSON and compile to CSS custom properties that the generated CSS Modules consume.

## File layout & layering

```
tokens/
├── primitives.tokens.json           # raw values: color ramps, spacing, radii, type scale
├── semantic.tokens.json             # mode-INDEPENDENT aliases (spacing insets, radii, type)
└── modes/
    ├── semantic.light.tokens.json   # mode-VARYING color semantics (aliases into primitives)
    ├── semantic.dark.tokens.json
    ├── brand.<name>.tokens.json     # brand dimension (see below)
    ├── viewport.tablette.tokens.json  # viewport dimension (spec 031): overrides ≥ {breakpoint.tablette}
    ├── viewport.desktop.tokens.json   #   … ≥ {breakpoint.desktop}
    └── viewport.wide.tokens.json      #   … ≥ {breakpoint.wide}  — mobile = the :root default in semantic
```

Components only ever bind to **semantic** tokens (`color.action.primary.background`), never to primitives (`color.blue.600`). Primitives are the palette; semantics are the decisions.

## The DTCG dialect decision (read this before "fixing" the format)

This repo intentionally uses the **legacy/draft DTCG dialect** — hex-string colors (`"$value": "#2563EB"`) and unit-string dimensions (`"$value": "16px"`) — *not* the DTCG 2025.10 stable object forms (`{colorSpace, components, hex}` / `{value, unit}`). Two reasons:

1. **The design-tool sync bridge speaks this dialect.** The bridge's token import/export pipeline converts colors via hex and would not convert object-colors (verified against its source, July 2026). Since that bridge is the phase-2 path to the design tool, matching its dialect keeps the round-trip lossless. (Bridge specifics live in the internal appendix, docs/internal/figma-sync.md.)
2. **The dialect is trivial to compile.** Values are already CSS-ready strings and single-level aliases, so the build needs no token framework at all (see below).

Migration to 2025.10 object forms is mechanical (a value-shape transform) and should happen when the bridge supports it. Track it; don't preempt it.

**Modes** are handled as separate files per mode, mirroring the mental model of the DTCG Resolver Module (still a draft; explicitly not implementable yet). When the resolver stabilizes, these files become resolver `contexts` without restructuring.

## The build (`npm run tokens`)

`scripts/build-tokens.mjs` is a **zero-dependency ~90-line emitter** (deliberately: the fewer moving parts between the source of truth and its outputs, the stronger the demo — and this repo's dialect doesn't need a framework). Style Dictionary was used initially and removed once it was clear the dialect never exercises anything a flatten-resolve-emit pass can't do. If the token set later needs composite types, transforms, or more platforms, Style Dictionary v4 (Node 20) or v5 (Node ≥ 22) drops back in without changing the token files.

| Pass | Sources | Output |
|---|---|---|
| light | primitives + `brand.default` + semantic + `semantic.light` | `src/styles/tokens.css` → everything under `:root` |
| dark | `semantic.dark` only | `src/styles/tokens.dark.css` → **only mode-varying tokens** under `[data-theme="dark"]` |
| brands | every `brand.<name>` except `default` | `src/styles/tokens.brands.css` → one `[data-brand="<name>"]` block each |
| **viewport** (spec 031) | `viewport.tablette` / `.desktop` / `.wide` — overrides only; the mobile value is the `:root` default in `semantic` | appended to **the same** `src/styles/tokens.css` → one `@media (min-width: {breakpoint.<mode>}) { :root { … } }` block per mode, ascending |
| **odoo** (spec 018) | the same compiled map as `:root` **+ the same viewport blocks** | `specs/018-odoo-replique-manuelle/module/piqueray_ds/static/src/css/tokens.pqr.css` → `:root` + `@media` blocks, **every name prefixed `--pqr-`** |

The emitter enforces two integrity rules at build time: every alias must resolve to a real token, and the light/dark mode files must define **identical token sets** (a token present in one mode but not the other is drift inside the source of truth itself). Alias chains are preserved as `var()` references, so the generated CSS reads like the token architecture:

```css
:root {
  --color-blue-600: #2563eb;                                    /* primitive */
  --color-action-primary-background: var(--color-blue-600);     /* semantic decision */
}
[data-theme="dark"] {
  --color-action-primary-background: var(--color-blue-500);     /* dark overrides ONLY the decision */
}
```

Theme switching is one attribute: `document.documentElement.dataset.theme = 'dark'`. The Storybook toolbar toggle does exactly this, so every story exercises the full pipeline.

Note the dark block's `var()` references point at primitives that live only in `:root` — resolved correctly at runtime by the cascade. Don't "fix" this by duplicating primitives into the dark block.

### Naming convention

CSS custom property = token path joined with `-`: `color.action.primary.background` → `--color-action-primary-background`. The generator computes variable names with the same rule, which is what lets it validate contract bindings against the token inventory. In phase 2, the same names are written into each design-tool variable's web code-syntax metadata, so the tool's developer view shows the real CSS variable for every design-tool variable.

### The fourth output — a prefixed sheet for a third-party host page

The `odoo` pass exists because two requirements cross, and only one shape satisfies both.

Spec 018 replicates three governed components by hand as Odoo 19 blocks, to **measure what that costs**. The module must carry **no invisible style value** — retyping ~230 properties by hand would reintroduce exactly the drift spec 015 closed on the code side. But its variable names must also be unable to collide with the ones Odoo publishes: Odoo 19 forces `$variable-prefix: ''` in three independent `bootstrap_overridden.scss` files, so on an Odoo page Bootstrap's custom properties are named **bare** — `--primary`, `--body-bg`, `--border-radius` — alongside Odoo's own `--base-100…900`, `--header-font-size`, `--palette-names`. Our names are generic (`--color-*`, `--space-*`, `--font-size-*`); publishing them unprefixed onto that page is a bet you cannot win.

So the pipeline gains a fourth target rather than the module gaining hand-typed numbers. The pass reuses the same compiled map and the same `cssName()` rule with a prefix added, so it is **generated, not transcribed**. Three properties are load-bearing:

- **Strictly additive.** The three outputs above do not move one byte. Adding the pass changed no existing file.
- **Prefixed in full.** Every declaration *and* every alias reference reads `--pqr-…`. One bare name is a refusal.
- **The whole vocabulary**, not only what those three components consume — so a fourth component needs no pipeline change.

There are **no theme or brand blocks**: Piqueray is mono-brand and mono-theme, and emitting empty `[data-theme]` / `[data-brand]` blocks would manufacture a capability that does not exist. Since 2026-09-02 the sheet **does** carry the viewport dimension's `@media` blocks (next section), prefixed like everything else — because that capability exists and Odoo is exactly where it is consumed.

## The viewport dimension (spec 031 → Odoo hero pilot, 2026-09-02)

A third mode axis, orthogonal to theme and brand: **theme picks the step, brand picks the ramp, viewport picks the size.** It mirrors, one for one, the Figma collection **« Responsive »** that spec 031 created on the canvas (modes Mobile / Tablette / Desktop / Wide) and the text styles bound to it (H1, H2, H4, « Titre carte »).

- **Mobile is the default.** Its values live in `semantic.tokens.json` like any other decision (`typography.h1.size = {font.size.32}`, `spacing.card-categorie.pad-h = {space.24}`), so they land in `:root` and every reader of the token inventory — generators, extractors, parity, the Hub — sees the responsive tokens **without knowing modes exist**. Same trick as `semantic.light` for the theme axis.
- **The three other modes are override files**, `tokens/modes/viewport.<mode>.tokens.json`, read only by the token build. They must define **identical token sets** and every override must have a `:root` default — both refused by name.
- **The thresholds are tokens**: `breakpoint.tablette = 768px`, `breakpoint.desktop = 992px`, `breakpoint.wide = 1400px` (primitives) — the Odoo 19 / Bootstrap 5.3 grid steps md/lg/xxl (992 and 1400 decided in spec 027 R6; 768 added for the Tablette planche validated by 031). The build **inlines** them into the `@media` conditions and never emits them as custom properties: CSS cannot read a `var()` inside a media query. A language limit, named.
- **Output shape** (mobile-first, ascending, appended to the same sheet so import sites never change):

```css
:root { --typography-h1-size: var(--font-size-32); … }
@media (min-width: 768px)  { :root { --typography-h1-size: var(--font-size-32); … } }
@media (min-width: 992px)  { :root { --typography-h1-size: var(--font-size-40); … } }
@media (min-width: 1400px) { :root { --typography-h1-size: var(--font-size-54); … } }
```

- A component that binds `{typography.h1.size}` is therefore responsive **by construction**, on every surface that consumes the sheet — the generated CSS Modules, the HTML reference, and the Odoo addon (whose `tokens.pqr.css` is derived from this file). Structure that changes with the viewport (a column becoming a row, a CTA moving) is NOT a token: it rides the contract's `layoutByProp` / `tokensByProp` on the `presentation` axis.

**Parity.** `npm run parity` reads the viewport files: every viewport-varying token is checked against the canvas collection **« Responsive »** (four modes, resolved literals — the canvas stores `32` and `"SemiBold"`, tokens/ stores `{font.size.32}` and `{font.weight.semibold}`), the `breakpoint.*` primitives are excluded by name (never variables), and both reroutings are printed on every run. All 33 canvas variables of the collection are carried, one for one (the last twelve — `spacing/carte-reassurance/photo-h` and `typography/review/*` — needed `font.line-height.18` and the `size.carte-reassurance.photo-h.{192,240,364}` scale, minted from the snapshot). The three primitives 031 minted on the canvas (`space/56`, `space/288`, `space/418`) are adopted the same way.

**What this does NOT cover yet, by name.** (1) The design-tool projection: `figma-sync/01-tokens.js` does not create the Responsive collection or its modes — the canvas already has it (hand-built in 031), the sync does not own it yet; the four responsive text styles (H1, H2, H4, « Titre carte ») exist on the canvas **without** the `ds_contracts/textStyleToken` marker, so the tokens step refuses them by name until the reviewed marker-only migration stamps them (a canvas write). **Corrected 2026-09-04 (spec 032, états du Bouton): those four were the WRONG styles to name here.** A live probe of the 25 local text styles found H1, H2, H4 and « Titre carte » already carrying their markers (`typography.h1.size`, `typography.h2.size`, `typography.h4.size`, `typography.h3.size`) — 22 of the 25 styles were stamped. The two that were NOT, and that actually blocked `01-tokens.js`, are **« Entrée menu »** and **« Sous-entrée menu »** (the mobile-menu pair added by spec 031). Spec 032 stamped them with `typography.menu-entree.size` and `typography.menu-sous-entree.size` after verifying their live recipes matched the token definitions exactly (Montserrat Medium 24/30 uppercase, Montserrat Regular 18/27) — a metadata-only write, no pixel moved. Receipt: `specs/032-etats-bouton/proofs/etape1/marqueurs.json`. The mechanism this paragraph describes is right; only the two style names were wrong. (2) The seven `typography.h{1,2,3,4}.{family,weight}` semantic tokens and the four minted primitives have no canvas variable yet — `behind` until the token sync runs. (3) `extract/figma/dump.plugin.js` does not yet capture variable *bindings* on text (node or style level). **Corrected 2026-09-04 (accessibilite-home-odoo): the clause that used to follow — "so the extractor still cannot recognise H1 from a dump" — was FALSE.** The dump does capture the applied style's NAME (`dump.plugin.js`, `text.style = style.name`), and real dumps on disk carry it (`"style":"Titre 5"`). The gap is one step later: `core/propose-figma.ts` never reads that field — zero occurrences — so the name arrives and is dropped. Reading it is what would let a NEW component propose its own heading level; the ten titles of the 031 family did not need it, their level being already deducible from the `typography.hN` token their part binds.

`evals/run.ts` case `odoo-tokens-output` (C1) refuses seven invariants by name — additivity, byte-identical determinism, total prefixing, a **bijection** with `:root` (never a hardcoded count, which would rot as the vocabulary grows), the generated-file header, and the refusal of an unresolvable alias. The seventh is adversarial and the reason the case is worth its weight: mutating a value in `tokens/*.tokens.json` **must** move this output. A file copied once would sail through all the others and die there.

The output has **no entry in `evals/golden.json`**, and that is mechanical rather than an oversight: `scripts/update-golden.mjs` walks only `src/` and `figma-sync/*.js`. Its determinism is proven by its own eval.

> **Consequence to carry.** This pipeline now writes into a spec folder. If `specs/018-odoo-replique-manuelle/` is archived or moved, `npm run tokens` does **not** fail — the recursive `mkdirSync` simply recreates the path and leaves an orphan directory behind. Whoever retires that spec deletes the block in `scripts/build-tokens.mjs` too.

## Design-tool mapping (phase 2 preview)

| Token layer | Canvas structure |
|---|---|
| `primitives.tokens.json` | Collection **Primitives**, single mode |
| `semantic.tokens.json` + `modes/*` | Collection **Semantic**, modes **Light**/**Dark**, values as variable aliases into Primitives |

Note: the reference design tool gates per-collection mode counts by plan tier; light + dark in one collection requires a paid tier. Details in the internal sync appendix.

## The brand dimension (v7 — multi-brand)

Brands are a second mode axis, orthogonal to light/dark: **theme picks the step, brand picks the ramp.**

- `tokens/modes/brand.<name>.tokens.json` — one file per brand, discovered dynamically. Each holds only the brand DECISIONS (an accent ramp `brand.accent.*` and `brand.radius.control`), expressed strictly as aliases into primitives. `default` is required.
- Accent-role semantic tokens alias `{brand.accent.*}`; literal-color semantics (`feedback.info`, `color.token.blue`) deliberately stay on their named ramps.
- CSS: the default brand lands in `:root`; every other brand becomes a `[data-brand="<name>"]` block in `src/styles/tokens.brands.css` — one file, so import sites never change.
- Design tool: a `Brand` variable collection with one mode per brand; semantic variables alias through it. Switching a frame's Brand mode rebrands every instance inside it.
- Guarantees, eval-enforced (`brand-added-token-layer-only`): adding a brand leaves every generated component **byte-identical**; an incomplete brand file (missing tokens vs `default`) is refused naming the brand.

Adding a brand is therefore a one-file operation: write `tokens/modes/brand.acme.tokens.json`, run `npm run build`, re-run the token sync. Nothing else in the repository changes.
