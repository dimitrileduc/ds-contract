# Implementation Plan: Simplify Section Header

**Branch**: `026-simplify-section-header` | **Date**: 2026-08-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/026-simplify-section-header/spec.md`

## Summary

Replace `ds.section-header@2.2.0` with a major-version generic header that has exactly two alignment variants (`Centre`, `Gauche`), default-centred dark 40/50 title, rich title, eyebrow and explicit eyebrow visibility (`afficherAccroche`). Transfer Hero, medium, compact and CTA responsibilities to Hero, Presentation, Texte SEO and Produits e-commerce. The migration is evidence-led: a fresh position-based inventory and capture of all 45 uses precede any Figma write; every use receives an explicit ledger decision; reference outputs and Odoo are aligned from contracts; existing saved Odoo markup is never rewritten.

FR-008 and FR-012 explicitly require Produits e-commerce on Figma, HTML and Odoo. This plan therefore promotes its existing audited Figma master (`2116:4475`) to a canonical Odoo-supported root. That deliberately expands the previously excluded product-section boundary; it is not silently treated as an existing Odoo capability.

## Technical Context

**Language/Version**: TypeScript 6 / Node.js >=20; generated React/TSX and HTML/CSS; generated Figma JS; Odoo 19 XML/QWeb, browser JS and CSS

**Primary Dependencies**: JSON contracts and DTCG tokens; deterministic generators; Figma Plugin API through the bridge; Odoo Website Builder 19; Playwright, page-parity and image-parity; no new runtime dependency planned

**Storage**: versioned contracts/tokens/configs/receipts/captures plus disposable Odoo QA data; no new production data store

**Testing**: repository gates; contract fixtures for the v3 API and migration ledger; Figma live source audit and strict page comparison; Odoo static, public, editor, save/reopen and update qualification

**Target Platform**: Figma desktop; generated React/HTML references; Odoo 19 Website Builder and current desktop browsers

**Project Type**: contract-driven multi-surface design-system migration plus Odoo CMS integration

**Performance Goals**: no new generic-header client runtime work; deterministic local generation; bounded 45-row evidence ledger; no build/parity/eval network dependency

**Constraints**: contract SSoT; never edit generated output; fresh complete before-capture and explicit owner GO before Figma writes; product-header delta only; legacy mappings fail visibly; saved Odoo page HTML is never auto-migrated

**Scale/Scope**: 45 page uses (24 generic standard, 21 specialised/context uses), four title owners, nine Figma maquette frames, and a new canonical Odoo product root with its existing card/carousel dependencies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Determinism** — contract/fixture/ledger/generated surfaces are local deterministic inputs; a second full run must be a no-op.
- [x] **II. Claims Rule** — fixtures/evals for two variants, removed-prop rejection, exhaustive ledger coverage, product-delta accounting and saved-page immutability land before a success claim.
- [x] **III. Contract SSoT** — accepted Figma facts are promoted into canonical contracts before React/HTML/Figma/Odoo projection; no side-sync is permitted.
- [x] **IV. Generated Output** — edit only contracts, tokens, generators and registered manual Odoo adaptations; regenerate `src/components/`, catalog, Figma scripts and Odoo assets.
- [x] **V. Honesty** — every use records a destination and complete evidence; an ambiguous v2 combination is `blocked`, never coerced. The product delta is named per use.
- [x] **VI. Semver** — removing `disposition`, `emphase`, `accroche2` and generic CTA is `ds.section-header@3.0.0`; document it in `docs/02-contract-spec.md`, review/bump affected parent contracts, and add `ds.produits-ecommerce@1.0.0`.
- [x] **VII. Engine Integrity** — intended work is declarative. Any discovered live-only emitter defect must extend the mock/eval and preserve browser-pure `core/`.
- [x] **VIII. Source Cleanliness** — a fresh read-only master audit and position-based use census are required. `specs/component-repairs/section-header/run-001/audit.json` is supporting evidence only: it inspected the existing 16-variant master, not the required page migration.
- [x] **IX. Docs-First** — handoff architecture/gates, the Figma capability matrix, page-parity contract and Odoo README define this plan's boundaries.
- [x] **X. Before-Capture** — capture all nine frames and a valid record for every affected use before a live mutation; capture validity/dimensions gate the write.
- [x] **XI. Multi-Writer Bridge** — use a single Figma owner unless disjoint nodes are explicitly partitioned; one orchestrator owns the entire proof cycle.

**Post-design re-check**: passed. The design keeps a contract-first major migration, names degradation, preserves saved pages, and keeps output downstream of sources. Implementation must use a dedicated self-sufficient worktree: this checkout is on `main` with unrelated dirty state and is not an implementation target. The Desktop Figma bridge was unavailable during planning, so no unverified 45-node inventory is claimed here.

## Project Structure

### Documentation (this feature)

```text
specs/026-simplify-section-header/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── section-header-v3.interface.md
│   ├── migration-ledger.schema.json
│   └── odoo-transition.md
├── inventory/                 # implementation: source census
├── proofs/                    # implementation: captures/comparisons/no-op
└── tasks.md                   # created by /speckit-tasks
```

### Source Code (repository root)

```text
contracts/
├── section-header.contract.json
├── {hero,presentation,texte-seo,produits-ecommerce}.contract.json
└── {coordonnees,faq,formulaire,reassurances,sav}.contract.json
scripts/{generate-components.ts,generate-figma.ts,odoo/}
figma-sync/{10-sectionheader,32-hero,33-presentation,39-texteseo}.js
src/components/                          # generated
core/samples/                            # generated/reference only
evals/
extract/figma/{page-parity,projection-repair}/
integrations/odoo/
├── config/{inputs.lock.json,*.authoring.json,adaptation-registry.json}
├── addons/piqueray_ds/{views,static}/
└── qa/{scenarios,visual}/
docs/02-contract-spec.md
```

**Structure Decision**: retain the established contract-first and explicitly-adapted Odoo architecture. `ds.section-header` stays one reusable molecule; the four specialised title presentations are direct owner anatomy. `ds.produits-ecommerce` becomes a first-class section contract/root, reusing the already canonical ProductCard and CarouselControls rather than generalising them.

## Design Phases

### Phase A — Freeze the migration basis

1. In the dedicated worktree, audit SectionHeader and the specialised sources read-only: property definitions, text styles, token bindings, dimensions and instance links.
2. Scan by position/structure and `getMainComponentAsync`, never layer name. Create exactly 45 use records (24 generic, 21 specialised) with page context and a destination candidate.
3. Calibrate page-parity, then capture all nine frames and a non-empty, dimensioned use/crop record before any Figma write. Save an explicit Figma version checkpoint.
4. Freeze a `MigrationLedger` record for every use: old API, new destination, content/rich-text/style/media/geometry/instance-link evidence and approval requirement.

### Phase B — Promote the coherent model

1. Make `ds.section-header@3.0.0` contain only `titre`, `accroche`, `afficherAccroche`, `alignement`; bind only `Alignement=Centre|Gauche`, defaulting to centre, dark 40/50.
2. Delete generic CTA and all emphasis axes instead of retaining aliases or hidden variants.
3. Move title anatomy into Hero (left light 54/68), Presentation (left 32/40), Texte SEO (left 24/30), and Produits e-commerce (left 32/40, no eyebrow, own CTA). Preserve title rich-text marks and geometry.
4. Promote audited `ProduitsECommerce` to canonical `ds.produits-ecommerce@1.0.0`, add it to the Odoo root/lock/config/QA model, and keep its card/carousel composition bounded to the section.
5. Migrate every remaining generic consumer to v3 field names and explicit values. A removed property without a reviewed specialised role is an error.

### Phase C — Regenerate and apply approved source changes

1. Add adversarial fixtures first: only two generic variants, centre default, fixed generic 40/50, removed-prop rejection, rich-text preservation, exhaustive ledger coverage and product-only-delta checks.
2. Change canonical contracts, required tokens/generator inputs, input locks and documentation; regenerate all reference artifacts. Never edit generated TSX/CSS/HTML/catalog/Figma scripts.
3. Present fresh captures and the complete proposal to the owner. Apply Figma only after explicit GO, then immediately re-capture masters, uses and pages.

### Phase D — Align Odoo with no implicit content migration

1. Narrow the shared QWeb helper to the generic v3 interface and remove CTA/emphasis branches. Hero, Presentation, Texte SEO and Produits e-commerce render own title parts; migrate authoring decisions for all current SectionHeader Odoo consumers (`hero`, `presentation`, `texte-seo`, `faq`, `sav`, `coordonnees`, `reassurances`).
2. Create the product section's root registration, input pin, exhaustive authoring config, registered manual QWeb/JS/XML adaptations and QA scenarios; regenerate assets and Figma-link data.
3. Repin contract graph hashes/versions and update all controlled metadata/version-guard fixtures. An addon update may signal `structure-stale`, never rewrite saved `outerHTML`.

### Phase E — Prove closure

1. Run strict whole-frame comparison to disclose every change, then use versioned product regions/crops to prove every non-authorised region is identical. Non-product records must be identical; Product records may show only the ledger-approved intermediate-left/no-eyebrow/CTA delta.
2. Run repository and Odoo static gates plus live Figma and Odoo public/editor/save-reopen/isolation/visual qualification. A skipped live check is not success.
3. Re-run generation, reconciliation, inventory and validation with unchanged inputs. Require no source, output, usage or proof change; archive the no-op receipt.

## Complexity Tracking

No constitution waiver is needed. Owner GO for a live Figma write and a disposable Odoo QA instance are execution gates required by the feature, not shortcuts.
