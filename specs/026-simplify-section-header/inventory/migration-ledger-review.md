# Migration-ledger review — pre-mutation

The ledger records all 45 source usages with the observed v2 facts, destination
candidate, valid before crop and seven preservation digests. Its JSON Schema
validation is recorded in `proofs/inventory-validation.json`.

Every row remains `blocked` at this stage. This is deliberate: the schema
requires an after capture for `preserve` or `authorized-product-delta`, and
there is neither a live Figma mutation nor an owner GO yet. A blocked row is
not a fallback and does not permit an implicit centred v3 rendering.

The structural routes are already explicit:

- generic standard → `section-header` (24);
- component ancestry Hero → `hero` (8);
- component ancestry Presentation → `presentation` (3);
- component ancestry TexteSEO → `texte-seo` (8);
- component ancestry ProduitsECommerce → `produits-ecommerce` (2).

The two Product rows may only become `authorized-product-delta` after the
owner-approved proposal names the intermediate-left/no-eyebrow/CTA delta and
after evidence is captured. All other rows require an identical after record.

