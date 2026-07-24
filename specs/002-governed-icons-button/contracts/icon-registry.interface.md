# Interface — The Icon Registry (`contracts/icons.registry.json`)

**Feature**: 002-governed-icons-button | **Decision**: research D1/D3/D4

The single versioned document the designer's Figma menu and the developer's code list both
derive from and are mechanically verified against (FR-006/FR-007). Proposed by extraction
from the **cleaned** source (Step 0 gate), hand-reviewed, adopted — never hand-invented.

## Shape (validated by the new additive `IconRegistrySchema`)

```jsonc
{
  "id": "ds.icons",
  "version": "1.0.0",                      // widen set = minor, narrow = major (FR-006)
  "source": {
    "fileKey": "d9FYAUcqdcNtsuaMgLefvJ",   // Piqueray (Copy)
    "zoneNodeId": "6:111",                 // the owner-named icons zone
    "dumpedAt": "<ISO-8601>"               // photo-at-instant-T, same convention as anchors.figma.dumpedAt
  },
  "icons": [                               // 15 at session count — Step 0 re-measures
    {
      "name": "arrow-left",                // canonical kebab id — THE shared designer/developer name
      "figma": {
        "componentName": "cil:arrow-left", // as it reads in the file (from-dump; renaming = owner proposal)
        "key": "8a405ce4…",                // library component key — stable across renames
        "nodeId": "<from-dump>"
      },
      "asset": "arrow-left",               // assets/icons/<asset>.svg — extracted, never hand-drawn
      "size": 20,                          // 20 | 32 — both by design, never harmonized (FR-005)
      "description": "<from the master's description, cleanup item c>"
    }
    // … one entry per governed master
  ]
}
```

## Rules the implementation must enforce

1. **Uniqueness & format** — `icons[].name` unique, `[a-z][a-z0-9-]*` (they become enum
   values and `ICONS` map keys in generated code).
2. **Asset existence** — `assets/icons/<asset>.svg` exists for every entry; the SVG body is
   acquired by the new deterministic REST export step (`format=svg` per master node), and
   `assets/icons/` is **pruned to exactly the registry** (no demo leftovers).
3. **Canvas existence** — `figma.key`/`componentName` must resolve in the committed canvas
   snapshot (`parity/snapshots/figma-components.json`).
4. **Zero third-party dependency** — every entry's master is **local** to the file
   (SC-007; the external chevron is replaced in Step 0 before the registry is proposed).
5. **Three-way verification (the new parity icons axis)** — `npm run parity` compares, and
   lists every divergence as a named `ahead`/`behind`/`mismatch` finding (FR-007):
   - registry ↔ `assets/icons/*.svg` inventory (code list),
   - registry ↔ canvas icon-component inventory (masters),
   - registry ↔ the Button set's INSTANCE_SWAP `preferredValues` (the designer's menu),
   - registry ↔ the Button contract's enum values (E3 — FR-011 "ni plus ni moins").
6. **Figma-first refusal** — an icon present code-side with no Figma master is a finding,
   never silently kept (FR-008).
7. **Semver** — widening `icons[]` = minor; narrowing or renaming a `name` = major.

## Consumers

| Consumer | Uses |
|---|---|
| Button v1.3 contract (E3) | enum values + `name → figma.componentName` binding map |
| `core/propose-figma.ts` lowering (D5) | key → canonical name resolution (registry passed **as data** — core stays browser-pure) |
| parity icons axis (D4) | the pivot of the three-way comparison |
| visual-parity subjects (D10) | the governed set to photograph |
| evals (D9) | fixture for the sync/refusal cases |
