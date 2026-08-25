# Quickstart — Validate Responsive HeroVideo

This is the execution and validation guide for the completed feature. It does not authorize any owner gate or live mutation by itself. Model details are in [data-model.md](data-model.md); interface and persistence rules are in [contracts/](contracts/).

## Prerequisites

Implementation must run in a clean dedicated `027-responsive-hero-video` worktree, not the current dirty `main` checkout. Inside that worktree:

```bash
npm install
npx playwright install chromium
```

Before creating a fixture, modeling a capability, or making a coding decision, complete and retain `inventory/docs-first-receipt.md`: it records the applicable handoffs, responsive/Figma capability guidance, page-parity route, Odoo guidance, and the auggie answers that govern the work.

Live Figma work requires the intended Piqueray file open in Figma Desktop with the bridge available. Odoo work requires the pinned disposable QA stack from `integrations/odoo/README.md`; never use the owner database or `piqueray-odoo-test:8071`.

## 1. Freeze the XL/wide baseline and close H1

Create a fresh feature campaign; historical `run-001` is supporting evidence only:

```bash
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --audit
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --snapshot-source --backup-ref refs/codex/backups/027-hero-video-responsive-h1
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --preflight
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --capture-before
npm run pages:selftest
```

Expected before H1:

- live file/version, master `2151:5552`, historical key, Home instance `2170:6351` and Container are pinned or a divergence is named;
- master, Home and context captures are non-empty and correctly sized;
- poster façade/crop, both scrims, title/style/variables, Button, properties, links and overrides have position-addressed digests;
- no Figma write and no Page write occurred.

Record the owner decision in `specs/027-responsive-hero-video/decisions/H1-baseline.json`. A refusal or missing fact stops here.

## 2. Compare Mobile/Desktop options and close H2

Generate the local, non-authoritative option packet and its width probes with the feature tool created during implementation:

```bash
npx tsx specs/027-responsive-hero-video/tools/build-option-packet.ts
npx tsx specs/027-responsive-hero-video/tools/validate-decision.ts \
  specs/027-responsive-hero-video/decisions/H2-responsive.json
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --snapshot-source --backup-ref refs/codex/backups/027-hero-video-responsive-apply
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --preflight
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --capture-before
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --dry-run
```

Expected:

- two or three options cover compact and Desktop parts, order, axis, alignments, height, spacing, governed Text Style, CTA, media and short landscape while wide remains the baseline;
- default and long content are rendered at 320, 390, 834, 1200 and 1728 plus short landscape, with probes at 991/992/993 and 1399/1400/1401;
- the approved decision validates against [responsive-decision.schema.json](contracts/responsive-decision.schema.json), names one option and resolves every Mobile/Desktop value under the fixed 992/1400 profile;
- the authoritative Figma source is still unchanged.

Do not proceed without explicit H2 acceptance.

## 3. Prove and apply the Figma transition; close H3

Run the registered headless fixtures first:

```bash
npm run eval
```

Expected named coverage: standalone→set preservation when required, internal responsive axis, image/override preservation, boundary exclusivity and pre-mutation refusal. Existing `ds.hero` responsive fixtures do not qualify `ds.hero-video`.

Then execute the approved campaign. The bridge script is transported through the configured Figma Desktop bridge between emission and receipt normalization:

```bash
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --emit-bridge-script --run first
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --normalize-apply --run first --bridge-result specs/component-repairs/hero-video/run-002/bridge-first.raw.json --receipt specs/component-repairs/hero-video/run-002/apply-first.json
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --record-apply --run first --receipt specs/component-repairs/hero-video/run-002/apply-first.json
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --capture-after
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --verify
```

Expected:

- wide/XL member keeps historic node/key; a set key, if needed, is additive;
- poster, properties, Button, Home main-component link and overrides are preserved;
- wide 1728 is unchanged and 1440 does not overflow;
- frames Mobile 390, Tablet 834 using compact, Desktop 1200 and XL 1728 show exactly H2 and name Figma’s manual mode/variant limit;
- `pageWrites: []` and no extra component/Container exists.

Record H3 only after the owner reviews the valid after captures and limitations.

## 4. Validate the contract capability and generated references

After H3, promote the responsive facts and run the full deterministic stack:

```bash
npm run schema
npm run generate
npm run figma:plan
npm run catalog
npm run build
npm run emitters:check
npm run parity
npm run eval
npm run plugin:check
npx tsx scripts/deterministic-roundtrip.mjs
node scripts/core-browser-check.mjs
npx tsc --noEmit
npx tsc -p tsconfig.build.json
npm run build-storybook
```

Expected:

- the schema accepts the optional generic responsive model and rejects unknown parts, missing/duplicate thresholds, no-op states, raw ungoverned Text Styles and public `viewport` props;
- `ds.hero-video` keeps its public content API and carries compact/Desktop/wide behavior with a reviewed minor bump;
- HTML, React CSS, inline reference, Web Components and generated Odoo CSS select compact `<992`, Desktop `992–1399` and wide `>=1400` automatically;
- Figma output exposes only the explicit presentation mechanism approved by H2;
- generated files are clean after the build and deterministic roundtrip.

Reconcile the generated Figma program against the accepted H3 source. It should already match; any mutation means the promotion is incomplete or wrong.

## 5. Run the responsive matrix and visual chains

```bash
npx tsx specs/027-responsive-hero-video/tools/validate-responsive.mts --surface reference-web
npm run extract:figma:visual -- hero-video
npm run pages:compare -- \
  --before specs/027-responsive-hero-video/proofs/figma/before \
  --after specs/027-responsive-hero-video/proofs/figma/after \
  --out specs/027-responsive-hero-video/proofs/figma/page-comparison
```

The feature validator must cover 320, 390, 834, 991/992/993, 1024, 1200, 1399/1400/1401, 1440, 1728 and a short landscape viewport with default/long content and unavailable video.

Expected for every probe: the browser `window.innerWidth` equals the case width, one correct active composition, zero horizontal overflow/crop/overlap, full media/scrim cover, complete title and CTA, and content accessibility. When content fits, approved centring is within 2 px. The four witnesses 390/834/1200/1728 each produce a fresh Figma↔reference comparison under identical fixture conditions. A separate Figma↔reference continuity comparison at 1440 must also remain below 2%; it is a wide continuity check, not a fifth design witness. Changing only the root width in a fixed large viewport is a failed test setup.

The visual runners must produce captures during this run, never merely assert old files. The semantic validator requires exactly two rows per `witnessId`, identical `fixtureId`/condition digests across both legs, the expected active composition, valid artifact dimensions and no missing or duplicate pair, plus one valid `wide-1440-continuity` record.

## 6. Qualify Odoo without rewriting saved pages

First run static gates:

```bash
npm run odoo:inputs:check
npm run odoo:authoring:check
npm run odoo:assets -- --check
npm run odoo:figma-links:check
npm run odoo:module:check
npm run odoo:derivation:check
npm run odoo:typecheck
```

Then run the new functional and update scenarios on the disposable database:

```bash
npx tsx integrations/odoo/qa/scenarios/hero-video.spec.mts
npx tsx integrations/odoo/qa/scenarios/hero-video-update.spec.mts
npx tsx integrations/odoo/qa/scenarios/hero-video-visual.mts
```

Expected:

- two instances retain isolated poster/alt/title/CTA label/href edits after save and reopen;
- public and editor iframe surfaces pass the full responsive matrix automatically, with their own exact `window.innerWidth` and no viewport control;
- a missing video still displays the owner poster covering the section;
- `odoo -u piqueray_ds` leaves saved HeroVideo `outerHTML` byte-identical while the regenerated CSS supplies responsive layout;
- Mobile, Tablet, Desktop and XL reference↔Odoo comparisons stay below the approved threshold, completing exactly eight paired visual comparisons across the two witness chains; the separate 1440-wide continuity check is also below 2% and does not alter that witness count.

If H2 required incompatible anatomy, the update scenario must stop at `structure-stale`; it cannot be reported as successful convergence without a separate migration approval.

## 7. Prove the second run and close H4

With unchanged pins and decisions, rerun build and Figma reconciliation, then capture idempotence:

```bash
npm run build
npm run figma:plan
npm run catalog
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --emit-bridge-script --run second
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --normalize-apply --run second --bridge-result specs/component-repairs/hero-video/run-002/bridge-second.raw.json --receipt specs/component-repairs/hero-video/run-002/apply-second.json
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --record-apply --run second --receipt specs/component-repairs/hero-video/run-002/apply-second.json
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --capture-idempotence
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --verify-idempotence
npm run component:repair -- --campaign specs/component-repairs/hero-video/run-002/campaign.json --finalize
```

Validate the assembled ledger against [proof-ledger.schema.json](contracts/proof-ledger.schema.json).

Expected second run: zero changed/generated file, created/changed/duplicate Figma node or Page write; identical anchors, poster, properties, links and overrides. H4 can be accepted only after all matrix, parities, authoring, persistence and no-op evidence is linked.

Finally generate `specs/027-responsive-hero-video/capitalization/README.md`, distinguishing human gates, mechanical checks, refusal conditions and named limits. It is evidence for a future specification, not a `component-to-responsive` skill.
