# Interface Contract — Button Contract Shape

**What this pins.** The shape the extracted-then-authored `contracts/button.contract.json`
MUST satisfy to pass `npm run build` + `npm run parity` and drive the fidelity gates. This is
the *interface* the generator and the differ consume. Value-bearing fields are **from-dump**
(never invented in planning); provenance-marked fields are **authored**.

Validated by: `@ds-contracts/schema` (`ContractSchema`, Zod) at build time.

```jsonc
{
  "$schema": "./contract.schema.json",
  "id": "ds.button",                 // authored — keep repo namespace (research D9)
  "name": "Button",
  "version": "1.0.0",                // authored — fresh line, new DS (D9)
  "status": "draft",
  "description": "…",                // authored

  "semantics": {                     // strictObject
    "element": "button",             // authored (Figma does not encode it)
    "role": "button",                // authored
    "provenance": "authored"         // NEW optional marker (research D5) — FR-017
  },

  "props": [
    {
      "name": "variant",             // from-dump: the 6-value VARIANT axis
      "type": { "enum": ["default","orange","blanc","outlineBlanc","link","outlineNoir"] },
      "default": "default",          // first variant in the set
      "bindings": {
        "figma": { "kind": "VARIANT", "property": "<axis name from dump>",
                   "values": { "default": "Default", "orange": "Orange", "blanc": "Blanc",
                               "outlineBlanc": "Outline blanc", "link": "Link",
                               "outlineNoir": "Outline noir" } },
        "code":  { "prop": "variant" }
      }
    },
    { "name": "children", "type": "text", "default": "…",   // from-dump TEXT layer
      "bindings": { "figma": { "kind": "TEXT", "property": "<label layer>" },
                    "code": { "prop": "children" } } }
    // + any BOOLEAN/state props present IN THE DUMP only (no invented states — Assumptions)
  ],

  "anatomy": {
    "root": {
      "tokens": {
        // EVERY value is a {dot.path} into the Piqueray semantic aliases (E1). No literals.
        "background-color": "{color.action.{variant}.background}",   // substituted ref (D2)
        "color":            "{color.action.{variant}.foreground}",
        "border-color":     "{color.action.{variant}.border}",       // outline/link variants
        "font-family":      "{font.control.family}"                  // → Montserrat
        // …padding / radius / gap / font-size, all from-dump, all bound
      }
      // parts (label, optional icon) as inverted from the dump
    }
  },

  "a11y": {                          // authored baseline (FR-017)
    "focusVisible": true,
    "minHitArea": 44,
    "contrast": "AA",
    "provenance": "authored"         // NEW optional marker (research D5)
  },

  "anchors": {
    "figma": {
      "fileKey":         "<Piqueray fileKey>",        // from-dump _provenance.fileKey (FR-007)
      "componentSetKey": "<set key>",                 // from-dump set.key
      "nodeId":          "<set node id>",             // from-dump set.nodeId
      "dumpedAt":        "<ISO-8601>"                 // NEW optional field (D4) — from-dump extractedAt
    },
    "code": { "importPath": "src/components/Button", "export": "Button" }
  }
}
```

## Acceptance (maps to spec)

- **FR-008** — exactly the 6 variants captured on the `variant` axis, default = first.
- **FR-004 / FR-005** — every `anatomy.*.tokens` value resolves into the Piqueray foundation
  (E1); a dangling ref fails the build **by name**. No invented/orphan token.
- **FR-007** — `anchors.figma` carries `fileKey` + `componentSetKey` + `nodeId` + `dumpedAt`.
- **FR-017** — `a11y`/`semantics` carry an authored baseline **and** the `provenance:"authored"`
  marker; nothing here is claimed as extracted from Figma. Accessible-name comes from the TEXT `children` binding, keyboard from native `element:"button"`; focus/hit-area/contrast are authored hardening. The generated Button's accessibility (role + accessible name) is **asserted by an eval** (Principle II).
- **FR-009** — this file becomes real only after human review/approval of the proposal.
- **FR-011** — feeding this file to `npm run generate` twice yields byte-identical output.
