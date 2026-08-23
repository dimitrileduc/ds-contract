# Inventory conventions

This directory holds read-only facts obtained from the source Figma file before
the v3 contract or any canvas node changes.

## Sources of truth

- `source-audit.json` records the SectionHeader master and the four specialised
  owners: properties, variants, text styles, token bindings, dimensions,
  instances and component links.
- `usages.json` is the position-based census. It obtains each candidate from
  structural position and `getMainComponentAsync`; layer names are documentary
  only and cannot classify a record.
- `migration-ledger.json` contains one reviewed destination decision for each
  census record. It may name a record `blocked`; no generic fallback is valid.

## Record discipline

Use stable `usageId` values and preserve raw Figma page, frame and node IDs.
Every record stores the source version, structural signature, old API facts,
content/rich-text/style/media/geometry/instance-link/page-context digests and
the corresponding before-capture reference. The census must contain exactly
45 unique records: 24 `generic-standard`, 8 `hero`, 3 `presentation`, 8
`texte-seo` and 2 `produits-ecommerce`.

The migration-ledger schema is the validation authority. Generated scans and
captures are evidence, never a reason to infer a role from a node name.
