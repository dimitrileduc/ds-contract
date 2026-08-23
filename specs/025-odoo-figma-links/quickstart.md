# Quickstart — Validate Odoo Figma Links

## Prerequisites

Node.js ≥20 with dependencies installed; the Docker QA instance from `integrations/odoo/qa/compose.yaml`; a Website editor user; and a qualification page containing every root plus one instance of each child panel.

## 1. Build and static coverage

```bash
npm run odoo:figma-links
npm run odoo:figma-links:check
npm run odoo:inputs:check
npm run odoo:authoring:check
npm run odoo:module:check
npm run odoo:derivation:check
npm run odoo:typecheck
```

Expected: generated output is byte-current; every registered Piqueray business panel has exactly one mapping and precise anchor; check mode accepts no unavailable entry.

## 2. Deterministic refusals

```bash
npm run eval
```

Expected: named cases cover missing/duplicate panels, contract/version errors, malformed anchors, generic fallback and third-party leakage. The live printed total is authoritative.

## 3. Real editor qualification

After starting QA per `integrations/odoo/README.md` and upgrading the addon:

```bash
npx tsx integrations/odoo/qa/scenarios/figma-links.mts
```

For every generated root/child type: the panel shows the action once; it opens a distinct page at the expected file and node; the page has no opener; selection, edited HTML and dirty/save state are unchanged; repeated instances share a destination; native/third-party panels show no control. Simulating `window.open` returning `null` must leave the editor in place and unchanged.

## 4. Repository gates

```bash
npm run build
npm run parity
npm run plugin:check
npx tsx scripts/deterministic-roundtrip.mjs
node scripts/core-browser-check.mjs
npx tsc --noEmit
npx tsc -p tsconfig.build.json
```

All commands must exit zero. A skipped live scenario is reported as skipped and does not satisfy qualification. Archive coverage and editor receipts under `specs/025-odoo-figma-links/proofs/`.
