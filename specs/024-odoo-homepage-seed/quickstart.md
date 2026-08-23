# Quickstart Validation — 024-odoo-homepage-seed

**Date**: 2026-08-23

## Prerequisites

- Docker Desktop running
- Owner instance (`piqueray-odoo-test`) up on port 8071 with `piqueray_ds` installed
- `npm install` done at repo root
- `FIGMA_TOKEN` set (for image export during montage)

## Validation Scenarios

### V1. Montage — homepage matches Figma

1. Open `http://localhost:8071` in a browser
2. Verify the 7 sections appear in order: Hero → Catégories (2 cartes) → Présentation → SAV → Devis → Réassurances (5 cartes) → Google Reviews
3. Compare texts with Figma node `210-326` — bold segments must match
4. Verify all images load (no broken placeholders)
5. Open `http://localhost:8071/odoo/website?enable_editor=1&with_loader=1`
6. Click a text in any section — it must be editable
7. Close editor without saving

**Pass**: All 7 sections visible in order, texts match, images loaded, editor opens.

### V2. Save cycle

```bash
npm run odoo:save
```

**Expected**:
- `integrations/odoo/qa/seed/db.dump` created (PostgreSQL custom format)
- `integrations/odoo/qa/seed/filestore.tar.gz` created
- Script prints the seed size and a summary

**Pass**: Both files exist and are non-empty.

### V3. Destroy and restore

```bash
# Destroy the QA instance (NOT the owner!)
docker compose -f integrations/odoo/qa/compose.yaml -p piqueray-odoo-qa down -v

# Recreate
docker compose -f integrations/odoo/qa/compose.yaml -p piqueray-odoo-qa --env-file integrations/odoo/qa/.env up -d

# Wait for healthy
# Restore
npm run odoo:restore
```

**Expected**:
- The QA instance at port 8069 shows the same homepage as the owner
- All 7 sections present, texts match, images loaded

**Pass**: Visual comparison shows identical content.

### V4. Owner isolation

1. Note the current state of `http://localhost:8071` (the owner)
2. Create and destroy a throwaway agent instance on another port
3. Reload `http://localhost:8071`

**Pass**: Owner page unchanged.

### V5. Editor round-trip on restored instance

1. Open editor on the restored QA instance
2. Modify a text in any section
3. Save
4. Reload the page

**Pass**: The modification persists after reload.

## Repo gate check

```bash
npm run build
npm run parity
npm run eval
npm run plugin:check
npx tsx scripts/deterministic-roundtrip.mjs
node scripts/core-browser-check.mjs
npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

**Pass**: All gates green. FR-005 verified: no repo file modified.
