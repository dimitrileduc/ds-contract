# Implementation Plan: Odoo Homepage Seed

**Branch**: `incongruous-ski` | **Date**: 2026-08-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/024-odoo-homepage-seed/spec.md`

## Summary

Mount the 7 governed Piqueray sections on the owner Odoo instance homepage (port 8071) to match the Figma maquette, then create `npm run odoo:save` / `npm run odoo:restore` scripts that export and restore the DB + filestore as a versionable seed. The seed enables agents to spin up disposable instances with the owner's content without touching the owner.

## Technical Context

**Language/Version**: Bash (save/restore scripts), TypeScript / Node ≥ 20 (existing Odoo scripts in `scripts/odoo/`), Python 3 / XML QWeb (existing addon — NOT modified by this spec)

**Primary Dependencies**: Docker + Compose (container orchestration), PostgreSQL 15 (`pg_dump` / `pg_restore`), Odoo 19.0-20260803 (CMS editor), Figma REST API (image export for montage)

**Storage**: PostgreSQL (Odoo DB — COW views, `ir_attachment`) + Odoo filestore on disk (`/var/lib/odoo/.local/share/Odoo/filestore/`)

**Testing**: Manual visual comparison (montage), script round-trip test (save → destroy → restore → verify), repo gates (`npm run build/parity/eval/…`)

**Target Platform**: macOS (development), Docker containers (Odoo + PostgreSQL)

**Project Type**: Operational tooling (seed scripts) + manual CMS content (homepage montage)

**Performance Goals**: Seed restore completes in under 2 minutes; seed file under 50 MB

**Constraints**: FR-005 — zero repo files modified (contracts, tokens, core, src, figma-sync, evals untouched). Owner instance (port 8071) never targeted by restore unless explicit `--owner` flag.

**Scale/Scope**: 7 sections × 1 homepage. ~10 images from Figma. 2 new npm scripts.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Determinism** — N/A. This spec adds no generation-path code. The save/restore scripts are operational tooling, not emitters.
- [x] **II. Claims Rule** — N/A. No capability claims added to README/docs. The seed scripts are internal tooling.
- [x] **III. Contract SSoT** — Respected. The montage uses existing snippets generated from contracts. No side-sync.
- [x] **IV. No Hand-Edit of Generated Output** — Respected. FR-005 explicitly forbids modifying any repo file. The content lives in the DB only.
- [x] **V. Honesty** — Respected. Edge cases in spec name what happens when images are missing (placeholder + named relevé).
- [x] **VI. Additive Evolution** — N/A. No contract or schema changes.
- [x] **VII. Engine Integrity** — N/A. No `core/` changes.
- [x] **VIII. Source Cleanliness** — N/A. No Figma source manipulation — this spec reads from Figma (image export), never writes.
- [x] **IX. Docs-First** — Consulted. `integrations/odoo/README.md` read for addon structure, authoring rules, and media conventions. No modeling decisions made against docs.
- [x] **X. Before-Capture** — N/A. No canvas mutations.
- [x] **XI. Multi-Writer Bridge** — N/A. No Figma writes.

**Post-design re-check**: All gates remain green. The plan adds two bash scripts and manual editor content — no constitution principle is challenged.

## Project Structure

### Documentation (this feature)

```text
specs/024-odoo-homepage-seed/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 validation guide
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── proofs/              # Montage screenshots, restore receipts (created during implementation)
```

### Source Code (repository root)

```text
scripts/odoo/
├── save-seed.sh         # NEW — pg_dump + filestore tar → seed directory
└── restore-seed.sh      # NEW — pg_restore + filestore untar from seed

integrations/odoo/qa/
├── seed/                # NEW — versionable seed directory
│   ├── db.dump          # PostgreSQL custom-format dump
│   └── filestore.tar.gz # Odoo filestore archive
├── compose.yaml         # EXISTING — used as-is
└── .env.example         # EXISTING — used as-is

package.json             # MODIFIED — two new script entries only
```

**Structure Decision**: The scripts live in `scripts/odoo/` alongside existing Odoo tooling. The seed directory lives in `integrations/odoo/qa/seed/` — co-located with the QA compose infrastructure. No new directories outside these two locations.

## Complexity Tracking

No constitution violations to justify.

## Work Phases

### Phase A — Save/Restore Scripts

**Goal**: Create `npm run odoo:save` and `npm run odoo:restore` as reliable, guarded seed tooling.

**`scripts/odoo/save-seed.sh`**:
- Target: owner instance (`piqueray-odoo-test`) by default
- Steps: (1) discover DB name from container env, (2) `docker exec` → `pg_dump -Fc` → `seed/db.dump`, (3) `docker cp` filestore → `tar -czf` → `seed/filestore.tar.gz`
- Guards: fail if container not running, fail if dump is empty
- Output: print seed size summary

**`scripts/odoo/restore-seed.sh`**:
- Target: QA instance (`piqueray-odoo-qa`) by default, configurable via `--project`
- Guard: REFUSE `piqueray-odoo-test` unless `--owner` flag is explicitly passed
- Steps: (1) stop Odoo service, (2) drop + recreate DB, (3) `pg_restore` from `seed/db.dump`, (4) untar `seed/filestore.tar.gz` into the container's filestore path, (5) restart Odoo
- Post-restore: wait for healthcheck, print confirmation

**`package.json`** additions:
```
"odoo:save": "bash scripts/odoo/save-seed.sh",
"odoo:restore": "bash scripts/odoo/restore-seed.sh"
```

### Phase B — Montage

**Goal**: Place the 7 sections on the owner instance homepage and populate with Figma-matching content.

This is a **manual editor task** performed by the owner in the Odoo website builder:

1. Open `http://localhost:8071/odoo/website?enable_editor=1&with_loader=1`
2. Drop each snippet in order: Hero → Catégories → Présentation → SAV → Devis → Réassurances → Google Reviews
3. For each section, edit texts to match Figma node `210-326` (apply bold where needed)
4. For each section with images, upload the Figma-exported images via the media dialog
5. Save

**Image preparation** (can be scripted or manual):
- Export images from Figma REST API for nodes in the maquette
- Store temporarily for upload through the editor

### Phase C — Seed & Validation

**Goal**: Exercise the full save → destroy → restore cycle and verify.

1. Run `npm run odoo:save` — verify seed files created
2. Destroy the QA instance (`down -v`), recreate, run `npm run odoo:restore`
3. Compare the restored page with the owner — all 7 sections present, texts match, images loaded
4. Verify owner instance (8071) untouched
5. Run repo gates — all must be green (FR-005: no repo files modified beyond the two scripts and package.json)
6. Archive proofs (screenshots, script output) under `specs/024-odoo-homepage-seed/proofs/`
