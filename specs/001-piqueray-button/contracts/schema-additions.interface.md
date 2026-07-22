# Interface Contract — Additive Schema Fields

**What this pins.** The two schema changes this feature needs, both **optional additive fields**
per Constitution Principle VI ("add optional fields only, never repurpose"). Source of truth:
`packages/schema/src/contract-schema.ts` (the single live Zod document). Both changes MUST bump
`docs/02-contract-spec.md`, and each MUST be backed by an eval before any doc claims it
(Principle II).

## Addition 1 — dump timestamp on the Figma anchor (research D4, FR-007)

`anchors.figma` is today a **`strictObject`** (contract-schema.ts:882-892) — it rejects unknown
keys, so the dump timestamp cannot ride along without being declared.

```diff
  anchors: z.strictObject({
    figma: z.strictObject({
      fileKey: z.string().nullable(),
      componentSetKey: z.string().nullable(),
      nodeId: z.string().nullable().optional(),
+     /** vNN: ISO-8601 timestamp of the Figma dump this contract was derived from.
+      *  Populated from the dump's _provenance.extractedAt. Photo-at-instant-T, not live. */
+     dumpedAt: z.string().optional(),
    }),
    code: z.strictObject({ importPath: z.string(), export: z.string() }),
  }),
```

- **Backward-compatible**: optional ⇒ every existing contract still validates.
- **Populated from**: dump `_provenance.extractedAt` at extraction.

## Addition 2 — authored-vs-extracted provenance marker (research D5, FR-017)

The a11y/semantics baseline is **authored** (Figma does not encode a11y). The spec requires this
be *explicitly marked in the contract*, not merely implied. `semantics` is a `strictObject`
(contract-schema.ts:817) and `a11y` strips unknown keys, so the marker must be a declared field.

```diff
  a11y: z
    .object({
      focusVisible: z.boolean().optional(),
      minHitArea: z.number().optional(),
      contrast: z.enum(['AA', 'AAA']).optional(),
+     /** vNN: origin of this a11y baseline. "authored" = hand-written, NOT extracted from the
+      *  canvas (Figma does not encode a11y semantics). Preserves the no-invented-values rule. */
+     provenance: z.enum(['authored', 'extracted']).optional(),
    })
    .optional(),

  semantics: z.strictObject({
    // …existing element / role / roleByProp / elementByProp …
+   /** vNN: origin of these semantics (see a11y.provenance). */
+   provenance: z.enum(['authored', 'extracted']).optional(),
  }),
```

- **Backward-compatible**: optional ⇒ existing contracts unaffected; absent ⇒ unmarked (legacy).
- **Honesty**: makes "authored, not extracted" a machine-checkable fact on the artifact (V).

## Required follow-through (per constitution)

| Obligation | Where | Principle |
|---|---|---|
| Optional-only, no repurpose/narrow | both diffs above | VI |
| Bump the spec doc | `docs/02-contract-spec.md` | VI |
| Regenerate the JSON Schema mirror | `contracts/contract.schema.json` via `npm run schema` (generated — never hand-edit) | IV |
| Eval before claim | engine-level check that each field survives generate + round-trip; C8 journey carries it end-to-end | II |
| Types green | `npx tsc --noEmit && tsc -p tsconfig.build.json` | Gates |
