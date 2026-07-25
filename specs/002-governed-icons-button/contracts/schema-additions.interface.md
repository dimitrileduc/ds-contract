# Interface — Schema & Tooling Additions (all additive)

**Feature**: 002-governed-icons-button | **Decision**: research D1/D4/D5/D6/D7/D11

Everything this feature adds to shared machinery, per Principle VI (optional/additive only,
never repurpose) and the owner rule (capabilities land in the repo's common tooling at the
right place — zero throwaway scripts).

## 1. Schema (`packages/schema/src/contract-schema.ts`) — ONE new export

- **`IconRegistrySchema`** (+ inferred `IconRegistry` type): validates
  `contracts/icons.registry.json` (shape in `icon-registry.interface.md`). A **new document
  type** — no existing schema field is touched, repurposed or narrowed.
- **Explicitly NOT added**: any change to `PropSchema`/bindings — INSTANCE_SWAP `kind` and
  the generic `values` map already exist (contract-schema.ts:75–79). `SlotSchema` untouched.
- `docs/02-contract-spec.md` bumped: the registry document + the INSTANCE_SWAP
  enum-binding convention (`icon.asset: "{prop}"` + `bindings.figma.values`).

## 2. Build (`scripts/generate-components.ts` path) — registry validation

Load + Zod-validate the registry when present; refuse **by name** on: duplicate/illegal
names, missing `assets/icons/<asset>.svg`, a contract enum bound INSTANCE_SWAP whose values
don't match the registry. (The per-part missing-asset refusal already exists in
emit-react.ts:724–725 and stays the last line of defense.)

## 3. Parity (`parity/diff.ts`) — the **icons axis** (new dimension)

Registry ↔ code (`assets/icons/` inventory + Button enum) ↔ canvas (snapshot icon
inventory + the set's swap `preferredValues`). Findings use the existing
`ahead`/`behind`/`mismatch` classifications, the existing report/baseline/exit-code
mechanics, and plain-words remedies (FR-006/FR-007). Snapshot pull extended to record
`preferredValues` for swap properties if not already captured.

## 4. Extraction (`core/propose-figma.ts`) — the D5 lowering pass

`boolDefaults` → boolean props; `propRefs.visible` → `visibleWhen`;
`swapPreferredValues` + registry (passed **as data** — browser-purity preserved,
`core-browser-check.mjs` stays green) → INSTANCE_SWAP-bound enum props. Closes v1.2's
named extraction gap. Covered by a C5 eval on the committed fixture dump.

## 5. REST tooling (`extract/figma/rest/`) — SVG export step

`format=svg` per master node → `assets/icons/<name>.svg`. Deterministic acquisition
(source-refresh class, like dumping); documented alongside the existing REST verbs.

## 6. New committed runners (permanent tooling, not scripts-on-the-side)

| Runner | Home | Built from |
|---|---|---|
| Positional instance scan (E5) | `extract/figma/audit/` | `figma_execute` walk by position → `capture-receiver.mjs` sink → committed JSON |
| Page-state photography (E6) | `extract/figma/state-photo/` | `fetchNodePngs` (any node, version-keyed cache, `--refresh`) + `img.ts` diff/triptych |

Both reuse the visual instrument's tolerance and honesty conventions (named skips, named
divergences). npm scripts added for each (names decided at tasks).

## 7. Visual instrument (`extract/figma/visual-parity/`) — subjects + prop preset

Governed-icon subjects + a Button-with-icons subject. Small named extension: per-subject
**prop preset** (defaults render text-only — the repo's own SOUCIS gap). Existing
`THRESHOLD_PCT = 2.0` and baseline regression gate; **no new threshold**.

## 8. Evals (`evals/run.ts` + fixtures) — per research D9

Net-new cases (registry three-way sync C3, refusal C2, lowering C5), quarantine revivals
re-pointed to the Piqueray icon model, golden re-pin, and the **stale-attribution honesty
fix** ("pending the token push" → "pending the Button master rebuild", then removed at
closure; REMOVED-CASES.md "96 executed" re-synced). Counts re-synced everywhere at closure
(live `N/N` is authoritative).
