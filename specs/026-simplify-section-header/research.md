# Research — 026 Simplify Section Header

**Date**: 2026-08-23

## R1. Canonical direction

**Decision**: use Figma as audited evidence, promote the approved model into canonical contracts, then regenerate reference surfaces and apply the approved Figma reconciliation from those contracts.

**Rationale**: the constitution makes contracts the source of truth and prohibits direct edits of generated React, catalog and Figma-sync output. Current `ds.section-header@2.2.0` is overloaded; the green repair audit only validates that existing source is readable.

**Alternatives considered**: Figma-only patch (surface drift); consumer CSS overrides (ambiguous API remains); hand-edit generated output (forbidden drift).

## R2. Generic API

**Decision**: publish v3 with `titre: rich-text`, `accroche: text`, `afficherAccroche: boolean = true`, `alignement: centre|gauche = centre`; `Alignement=Centre|Gauche` is the complete Figma variant surface and both variants use dark 40/50.

**Rationale**: v2 exposes `disposition`, `emphase`, `accroche2` and a Button, which represent unrelated section responsibilities. Their removal/rename is necessarily major under Constitution VI.

**Alternatives considered**: deprecated aliases (silent legacy interpretation); a 16-combination compatibility matrix (recreates the problem); default left alignment (contradicts the historical standard stated in the specification).

## R3. Specialised ownership

**Decision**: Hero, Presentation, Texte SEO and Produits e-commerce render direct owned title anatomy. Product owns its CTA and title at 32/40 left without an eyebrow.

**Rationale**: `hero`, `presentation` and `texte-seo` currently compose SectionHeader only to achieve their special typography. Source-backed mappings are Hero master `2111:3382` (eight recorded instances, 54/68 light white left), Presentation `2103:2824` (32/40 left), Texte SEO `2108:3123` (eight recorded instances, 24/30 left), and products master `2116:4475` (Motorisation/Accueil, 32/40 CTA context).

**Alternatives considered**: preserve generic emphasis/CTA variants; create parallel generic header families; page-level styling of a generic product header.

## R4. Page evidence

**Decision**: create a fresh 45-entry position-based ledger, with full-page and per-use before evidence prior to mutation, and compare the same targets afterwards.

**Rationale**: `run-001/audit.json` covers 59 preview surfaces but zero `page-instance/page-context` entries, so it cannot prove FR-009/010. The page-parity contract validates capture presence/dimensions and refuses name-based classification.

**Alternatives considered**: reuse preview facts; sample representative pages; identify uses by layer names; accept percentage pixel change.

## R5. Declared visual delta

**Decision**: the only `authorized-product-delta` is a product title becoming intermediate/left/no-eyebrow with a section-owned CTA. All other non-identical records fail until an explicit specification amendment.

**Rationale**: this directly implements FR-011 and the audited product master, while a ledger makes the exception reviewable per affected use.

**Alternatives considered**: broad visual tolerance; image-diff threshold as approval; centring specialised headings.

## R6. Figma mutation protocol

**Decision**: fresh audit, calibration, complete capture, proposal and owner GO precede one coordinated live write; immediate after-capture follows it.

**Rationale**: Constitution VIII/X and the specification forbid a pilot-first mutation. The Desktop bridge was unavailable in planning, so a live inventory/capture remains an execution prerequisite, not a claimed result.

**Alternatives considered**: capture remaining pages after a pilot; reconstruct before pixels from Figma history; concurrent overlapping writers.

## R7. Generated reference outputs

**Decision**: change contract/source inputs and registered manual adaptations only, then regenerate React, catalog, Figma and Odoo assets.

**Rationale**: generated `src/components/*`, `figma-sync/*.js`, catalog and Odoo CSS visibly propagate v2's classes. `core/samples/` are reference outputs but not a sufficient current-canvas proof because they are not refreshed by `npm run build`.

**Alternatives considered**: direct TSX/CSS/QWeb generated edits; Storybook-only test; live-only fix without mock/eval coverage.

## R8. Odoo scope and persistence

**Decision**: align existing supported roots and add the explicitly required product root to Odoo. New snippets express only actual responsibilities; saved markup is reported stale and not rewritten.

**Rationale**: `integrations/odoo/README.md` separates canonical inputs, authoring decisions, generated output and manual adaptations. Product currently has no canonical root/QWeb/config/QA, so FR-012 requires a real port rather than a helper tweak. Odoo saves cloned HTML and the existing version guard is intentionally detection-only for structural drift.

**Alternatives considered**: omit product from Odoo (violates FR-012); pretend a draft proposal is production support; addon-update DOM rewrite (violates FR-013).

## R9. Idempotence

**Decision**: rerun generation, reconciliation, position scan and ledger validation with unchanged inputs and require an evidence-backed no-op.

**Rationale**: FR-014/SC-006 require no further source, output, usage or proof mutation, not merely a green build.

**Alternatives considered**: claim idempotence from inspection; rerun build only; accept a harmless-looking second diff.
