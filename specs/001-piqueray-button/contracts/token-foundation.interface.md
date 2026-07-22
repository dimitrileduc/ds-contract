# Interface Contract — Piqueray Token Foundation Shape

**What this pins.** The shape of the single-mode Piqueray token foundation (E1) that the Button
binds to. Tiered per the repo's existing architecture (primitives → semantic aliases); **all
values are from-dump** (never invented — FR-003). Compiled by `scripts/build-tokens.mjs`, which
**fails the build on any unresolvable `{dot.path}`** (the tokens-first guarantee, FR-004).

> **⚠️ CORRECTED (2026-07-22) — primitives-only, no semantic alias layer.** Piqueray's Figma is a
> single flat collection of 14 primitives named by colour — **no `color.action.*`**.
> `tokens/semantic.tokens.json` now holds **only the 8 real Montserrat typography styles** (as
> aliases). The `color.action.*` / `color.nav.state` / `font.control.*` aliases shown below were an
> **invention** and have been **removed**; the Button binds **primitives directly**
> (`{color.noir-bleute}`…). This is the sanctioned Polaris BYO shape (a flat foreign set → a
> Primitives collection with empty semantic/brand). Figma variables were renamed token-legal
> (`Noir bleuté` → `color/noir-bleute`). See research **D2 correction**.

## Inventory (SC-002) — exactly this, nothing more

- **14 variables**: 12 colours + **NavState** + **Opacity**
- **8 typography styles**: Montserrat (each = family + size + weight, three leaf tokens — the
  repo uses no DTCG composite type)
- **1 mode** (mono-theme): no light/dark, one brand file

## Tier layout

```jsonc
// tokens/primitives.tokens.json  — raw values, exactly as read from the dump
{
  "color": { "$type": "color",
    /* the 12 Piqueray colours + NavState colour as hex leaves */ },
  "opacity": { "$type": "number", /* Opacity value */ },
  "font": {
    "family": { "montserrat": { "$type": "fontFamily", "$value": "Montserrat, …" } },
    "size":   { "$type": "dimension", /* per the 8 styles */ },
    "weight": { "$type": "fontWeight", /* per the 8 styles */ }
  }
}
```

```jsonc
// tokens/semantic.tokens.json  — the ALIAS layer the Button binds to (authored structure,
//                                from-dump values underneath)
{
  "color": {
    "action": {
      "default":     { "background": {"$value":"{color.…}"}, "foreground": {"$value":"{color.…}"} },
      "orange":      { "background": {"$value":"{color.…}"}, "foreground": {"$value":"{color.…}"} },
      "blanc":       { "background": {"$value":"{color.…}"}, "foreground": {"$value":"{color.…}"} },
      "outlineBlanc":{ "background": {"$value":"transparent-or-blanc"}, "border": {"$value":"{color.…}"} },
      "link":        { "foreground": {"$value":"{color.…}"} },
      "outlineNoir": { "background": {"$value":"transparent"}, "border": {"$value":"{color.…}"} }
    },
    "nav": { "state": { "$value": "{color.…NavState}" } }
  },
  "font": {
    "control": { "family": {"$value":"{font.family.montserrat}"},
                 "weight": {"$value":"{font.weight.…}"},
                 "size":   { /* per size the Button uses */ } }
  }
}
```

```jsonc
// tokens/modes/  — collapse to ONE mode:
//   • keep a single brand file (aliases → primitives only)
//   • DELETE brand.aurora.tokens.json and semantic.dark.tokens.json
```

## Build-pipeline contract

- `scripts/build-tokens.mjs` reads primitives + semantic + the single brand/mode and emits
  **`src/styles/tokens.css`** as a single `:root` block (no `tokens.dark.css`, no brand
  overrides file) and single-mode Figma variable collections.
- Edit point: the `dark` map is empty; the light/dark **parity check becomes a no-op** when
  `dark.size === 0` (build-tokens.mjs:66-89).
- Brand discovery is dynamic regex over `tokens/modes/brand.*.tokens.json` — deleting
  `brand.aurora` needs **no manifest edit**.

## Acceptance (maps to spec)

- **FR-003** — 14 variables + 8 Montserrat styles, single mode, tiered (primitives → aliases),
  values preserved exactly from Figma, alias layer structured on top.
- **FR-004** — a Button binding to a token absent here fails the build, naming the token.
- **FR-005** — the Button binds **only** to these aliases; no invented/orphan token.
- **SC-002** — an inventory shows exactly 12 colours + NavState + Opacity + 8 Montserrat
  styles, and these are the only tokens in the repo.
