# Quickstart — Validate SectionHeader Simplification

## Prerequisites

Implement only in a clean dedicated worktree; the active checkout is unsuitable. In that worktree:

```bash
npm install
npx playwright install chromium
```

Live work requires the Figma Desktop bridge on the intended file and a disposable Odoo QA instance configured by `integrations/odoo/README.md`. Never target the owner instance. The owner must explicitly GO after the complete before-capture and before a Figma mutation.

## 1. Audit and before-capture

Use a fresh `run-002` campaign rather than reusing the preview-only run. Follow `docs/internal/component-repair-workflow.md` and run:

```bash
npm run component:repair -- --campaign specs/component-repairs/section-header/run-002/campaign.json --audit
npm run component:repair -- --campaign specs/component-repairs/section-header/run-002/campaign.json --snapshot-source --backup-ref refs/codex/backups/<run-id>
npm run component:repair -- --campaign specs/component-repairs/section-header/run-002/campaign.json --preflight
npm run component:repair -- --campaign specs/component-repairs/section-header/run-002/campaign.json --capture-before
npm run component:repair -- --campaign specs/component-repairs/section-header/run-002/campaign.json --dry-run
npm run pages:selftest
```

Also run page-parity calibration and the position-based 45-use scan. Validate its ledger against [contracts/migration-ledger.schema.json](contracts/migration-ledger.schema.json).

Expected: zero source writes; 45 unique records (24 generic plus 8 Hero, 3 Presentation, 8 Texte SEO, 2 Products); all before images/contexts are valid and version-pinned; the dry run names no implicit mapping. Bridge unavailability, a missing capture or a calibration/dimension failure blocks mutation.

## 2. Contract and reference validation

After the canonical changes, run:

```bash
npm run generate
npm run build
npm run parity
npm run eval
npm run plugin:check
npx tsx scripts/deterministic-roundtrip.mjs
node scripts/core-browser-check.mjs
npx tsc --noEmit
npx tsc -p tsconfig.build.json
npm run build-storybook
npm run extract:figma:visual -- section-header
```

Expected: v3 generated references contain only four generic props and two alignment variants; special owners render direct titles; fixtures reject removed v2 props and preserve rich-text marks; intentional Figma snapshot refresh is paired with fresh live evidence, never justified by a green stale snapshot alone.

## 3. Apply and prove Figma migration

After owner GO, emit/apply the Figma reconciliation, capture after, verify, then run a second apply/capture-idempotence/verify-idempotence using the same campaign. Compare the identical page set:

```bash
npm run pages:compare -- --before <before-captures> --after <after-captures> --out specs/026-simplify-section-header/proofs/page-after
```

Expected: the whole-frame report discloses the product-page differences rather than hiding them. A versioned product-region/crop comparison then proves every non-authorised region is identical; every non-product record is identical in content, rich text, styles, media, geometry, instance link and context. Product records carry only the reviewed intermediate-left/no-eyebrow/CTA delta. Any unclassified usage, capture failure, dimension mismatch or extra changed region fails the feature.

## 4. Odoo qualification

Regenerate and validate the new Product root plus all affected existing roots:

```bash
npm run odoo:inputs:check -- --repin
npm run odoo:authoring:check
npm run odoo:assets -- --check
npm run odoo:figma-links:check
npm run odoo:module:check
npm run odoo:derivation:check
npm run odoo:typecheck
npx tsx integrations/odoo/qa/scenarios/hero.spec.mts
npx tsx integrations/odoo/qa/scenarios/presentation.spec.mts
npx tsx integrations/odoo/qa/scenarios/texte-seo.spec.mts
npx tsx integrations/odoo/qa/scenarios/faq.spec.mts
npx tsx integrations/odoo/qa/scenarios/sav.spec.mts
npx tsx integrations/odoo/qa/scenarios/coordonnees.spec.mts
npx tsx integrations/odoo/qa/scenarios/reassurances.spec.mts
npx tsx integrations/odoo/qa/scenarios/versioning.spec.mts
```

Add and run the new Products scenario plus a seeded saved-v2 page upgrade test. Expected: new snippets expose only their own role; public/editor/save/reopen/isolation/visual results are qualified; `odoo -u` leaves old stored DOM/content untouched and reports it stale rather than rewrites it. A skipped live test does not qualify the feature.

## 5. Closure

Run the repository gates again and repeat generation, Figma reconciliation, page/use scan and ledger validation with unchanged inputs. Archive the after and no-op receipts in `specs/026-simplify-section-header/proofs/`.

Expected: the second run changes no contract, generated file, Figma node, page-use record or proof payload.
