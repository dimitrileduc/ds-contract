# Interface — Button v1.3 (`contracts/button.contract.json`)

**Feature**: 002-governed-icons-button | **Decision**: research D2/D5/D11

The shape the **extracted** v1.3 contract must satisfy at review. v1.3 is produced by the
propose-figma lowering pass (D5) over the **post-cleanup** dump — closing v1.2's named
extraction gap — then reviewed and adopted. Strictly additive over v1.2: **1.2.0 → 1.3.0**.

## Delta over v1.2 (everything else unchanged)

```jsonc
{
  "version": "1.3.0",
  "props": [
    // … variant, children, iconLeft, iconRight — UNCHANGED from v1.2 …
    {
      "name": "iconLeftGlyph",                    // working name — final name reviewed at adoption
      "description": "Which governed icon fills the leading slot (registry ds.icons).",
      "type": { "enum": ["arrow-left", "…"] },    // = registry names EXACTLY, no more no less (FR-011)
      "default": "arrow-left",                    // v1.2's fixed glyph — rendering preserved
      "bindings": {
        "figma": {
          "kind": "INSTANCE_SWAP",
          "property": "<the master's real swap-property name — from-dump, e.g. « Glyphe gauche »>",
          "values": { "arrow-left": "cil:arrow-left" /* canonical → figma.componentName, per registry */ }
        },
        "code": { "prop": "iconLeftGlyph" }
      }
    },
    { /* iconRightGlyph — symmetric, default "arrow-right" */ }
  ],
  "anatomy": {
    "root": {
      "parts": {
        "iconLeft":  { "icon": { "asset": "{iconLeftGlyph}",  "size": 20 }, "visibleWhen": { "prop": "iconLeft" } },
        "iconRight": { "icon": { "asset": "{iconRightGlyph}", "size": 20 }, "visibleWhen": { "prop": "iconRight" } }
      }
    }
  },
  "anchors": { "figma": { "dumpedAt": "<post-cleanup dump date — refreshed>" } }
}
```

## Rules

1. **No schema change needed on props** — `bindings.figma.values` is the existing generic
   canonical→Figma map (contract-schema.ts:75–79); INSTANCE_SWAP is an existing kind.
2. **Enum = registry, mechanically** — the enum values must equal `ds.icons` names; the
   parity icons axis and a C3 eval verify it (a one-sided edit is a listed divergence).
3. **Code surface** — the generated `Button.tsx` gains the typed enum props and an `ICONS`
   map expanded to **all** registry glyphs (existing emit-react machinery, 2015–2024); the
   emit refusal guarantees every enum value has its SVG. `Button.stories.tsx` /
   dashboard sample must show a button with icons in both placements (FR-020).
4. **Backward compatibility (the minor bump proven)** — with the new props at their
   defaults, v1.3 renders **byte-identically** to v1.2 usage: same glyphs, same toggles.
   Golden is re-pinned in the same reviewed change (`npm run golden:update`).
5. **Both sides steer the same settings** (US2 sc.3) — designer: the swap menu +
   visibility toggle on the master; developer: the enum + boolean props. Same choices,
   verified by parity (contract ↔ re-pulled snapshot: swap property present, its
   `preferredValues` = the enum's mapped values).
6. **Review readability** (Principle VI) — the PR diff of the contract is the
   design-system change review: the two new props + refreshed `dumpedAt` and nothing else.
7. **Description updated honestly** — v1.2's "known extraction gap" paragraph is replaced
   by the v1.3 reality (gap closed by D5); the deferred-INSTANCE_SWAP note goes away.

## Gates that must stay green on v1.3

`npm run build` (contract-validated generation) · `golden-generated-output` (re-pinned) ·
`deterministic-roundtrip.mjs` (byte-identical ×2; VARIANT axis assertions untouched; icon
props ride the same contract) · `plugin:check` (specHash mirror changes as expected —
it hashes the contract) · parity clean after Step 3's snapshot re-pull.
