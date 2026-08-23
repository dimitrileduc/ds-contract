# Data Model — 026 Simplify Section Header

## SectionHeaderV3

The reusable molecule after migration.

| Field | Type | Validation |
|---|---|---|
| `titre` | rich-text | Required content carrier; all text ranges/marks survive. |
| `accroche` | text | Eyebrow content; empty/hidden must not change title typography. |
| `afficherAccroche` | boolean | Default `true`; false removes the eyebrow from layout. |
| `alignement` | `centre \| gauche` | Default `centre`; the only Figma variant axis. |

Its title is dark 40/50 for both alignments. `disposition`, `emphase`, `accroche2`, old enum values and generic CTA anatomy do not exist in v3.

## SpecializedTitleOwner

An owning section's direct title anatomy, never an emphasis of the generic molecule.

| Owner | Title | Eyebrow / CTA | Source |
|---|---|---|---|
| Hero | light white 54/68, left | no generic eyebrow; Hero owns existing CTA | `ds.hero` |
| Presentation | dark 32/40, left | no generic eyebrow; Presentation CTA stays owned | `ds.presentation` |
| TexteSEO | dark 24/30, left | no generic eyebrow or CTA | `ds.texte-seo` |
| ProduitsECommerce | dark 32/40, left | hidden eyebrow; section owns CTA | `ds.produits-ecommerce` |

Existing rich-text ranges, style identity and parent geometry are preserved. A new owner prop is optional/additive only when the source and authoring policy intentionally expose it.

## PageUsage

A historical target found by position and structural signature, never a layer-name match. It includes `usageId`, page/frame/node identity, main-component/instance link, bounds, structural signature, old property facts, content/rich-text/style/media digests, and valid before capture/context records.

`role` is `generic-standard`, `hero`, `presentation`, `texte-seo`, `produits-ecommerce` or `exception`. The implementation baseline is exactly 45 records: 24 generic and 21 specialised (`8 + 3 + 8 + 2`). A missing or duplicate record fails the campaign.

## MigrationDecision

The reviewed relation between a `PageUsage` and its future owner.

| Field | Meaning |
|---|---|
| `destination` | `section-header`, `hero`, `presentation`, `texte-seo`, `produits-ecommerce`, or `blocked`. |
| `status` | `preserve`, `authorized-product-delta`, or `blocked`. |
| `oldApi` | Observed v2 fields preserved only as evidence. |
| `newConfiguration` | v3/owner state; removed fields are forbidden. |
| `preservation` | Content, marks, styles, media, geometry, instance link and page-context digests. |
| `approvalRef` | Required for delta or any later saved-page migration. |

`blocked` is an honest stop, not an implicit successful conversion.

## CaptureRecord and ComparisonResult

`CaptureRecord` has source file/version, target, dimensions, SHA-256, timestamp and transport. Its before capture must precede the Figma write. Hidden/off-viewport targets keep complete structural/context facts and a named reason if a PNG cannot be meaningful.

`ComparisonResult` joins before/after evidence. Its status is `identical`, `authorized-product-delta`, `diff`, `capture-failed` or `dimension-mismatch`. `identical` requires zero measured pixel differences under the established strict policy; a product delta must name its exact allowed region/effect and cannot carry an extra change.

## OdooComposition and SavedPageState

`OdooComposition` is a current/new root with contract/version/hash, root selector, exhaustive authoring verdicts, manual adaptation marker/registry entry and generated-asset proof. Product becomes such a root; each changed current consumer gets re-addressed decisions.

`SavedPageState` holds page/record identity, structure/version/digest and one state: `current`, `policy-stale`, `structure-stale` or `unknown`. This feature can report `structure-stale`; it cannot auto-transition one to migrated.

## ReconciliationRun

A run joins contract hashes, source version, ledger hash, generated hashes, gates and after captures. Its state is `applied`, `rejected`, `blocked` or `no-op`. Closure needs an accepted `applied` run followed by a matching `no-op` run.

## Relationships

```text
SectionHeaderV3 ──used by──> PageUsage(generic-standard)
SpecializedTitleOwner ──owns──> PageUsage(specialised)
PageUsage ──before/after──> CaptureRecord ──compared as──> ComparisonResult
PageUsage ──reviewed through──> MigrationDecision ──recorded in──> MigrationLedger
Contract + AuthoringDecision ──projects to──> OdooComposition
OdooComposition ──never rewrites──> SavedPageState
MigrationLedger + hashes ──prove──> ReconciliationRun(applied → no-op)
```
