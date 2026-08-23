# SectionHeader v3 migration summary

- Census: **45/45** audited Figma usages — 24 generic, 8 Hero, 3 Presentation, 8 Texte SEO and 2 Produits e-commerce.
- Generic destination: 24 rows map explicitly to `ds.section-header@3.0.0` with `titre`, `accroche`, `afficherAccroche ← accroche2` and `alignement`; legacy `disposition` and `emphase` are removed.
- Specialised destination: 21 rows are now direct owner title anatomy. Historic title text and rich-text segments were restored and live-verified.
- Approved visual delta: **2/45**, both Produits e-commerce (`section-header-v3-22`, `section-header-v3-43`): direct left title, no eyebrow, retained owner CTA; page frame height is 26 px shorter.
- Page evidence: six source frames are byte-identical; the two Products frames carry the same approved 26 px delta. Frame 08 contains an unrelated Reassurances image-set change already present in labelled Figma version `2390990230148701498` before reconciliation.
- Repeatability: the second Figma reconciliation preflight reported `writesApplied: 0` and no proposed changes.

See [after capture manifest](after/manifest.json), [page comparison](page-after/comparison.json), [first live receipt](../../component-repairs/section-header/run-002/live-receipt-first.json) and [second live receipt](../../component-repairs/section-header/run-002/live-receipt-second.json).
