# Research — 024-odoo-homepage-seed

**Date**: 2026-08-23

## R1. Snippet readiness

**Decision**: All 7 sections have QWeb templates in the addon — no new templates needed.

**Evidence**: `components.xml` defines `s_pqr_hero`, `s_pqr_categories_principales`, `s_pqr_presentation`, `s_pqr_sav`, `s_pqr_devis`, `s_pqr_reassurances`, `s_pqr_google_reviews`. All registered in `snippets.xml`. All 7 have authoring configs and locked contracts in `inputs.lock.json`.

**Implication**: The montage is a manual editor task (drag-and-drop + edit texts + upload images), not a code task.

## R2. Owner instance topology

**Decision**: The owner instance (`piqueray-odoo-test`, port 8071) is NOT defined in the repo. The owner runs it manually from the QA compose with overridden project name and port.

**Evidence**: `grep -r "piqueray-odoo-test\|8071"` across repo returns nothing in compose files. Memory `project-odoo-docker-instances` confirms: port 8071 = owner, interdit aux agents.

**Implication**: Save/restore scripts must target the owner instance by its Docker project name (`piqueray-odoo-test`), not by port. The compose file is the QA one — no new compose needed for the owner.

## R3. Filestore gotcha

**Decision**: The seed must include BOTH the pg_dump AND the Odoo filestore. A DB-only dump loses uploaded images.

**Rationale**: Odoo 19 stores `ir_attachment` files on disk at `/var/lib/odoo/.local/share/Odoo/filestore/<dbname>/`. The DB holds only metadata (file path, checksum, name). A `pg_dump` without the filestore produces a page with broken `<img>` tags — the `web/image/…` URLs resolve to nothing.

**Alternatives considered**:
- Force `--db-storage` in Odoo config: rejected — changes runtime behavior for all attachments, non-standard, and existing owner data may already be on disk.
- Store only the DB: rejected — images would be missing on restore.
- Store a Docker volume snapshot: rejected — not portable, not versionnable.

**Chosen approach**: `pg_dump -Fc` (custom format, compressed) + `tar` of the filestore directory. Both bundled under `integrations/odoo/qa/seed/`. The combined size should stay well under 50 MB for 7 sections with a handful of images.

## R4. pg_dump format

**Decision**: Custom format (`-Fc`), not plain SQL.

**Rationale**: Custom format is compressed (typically 3-5× smaller than plain SQL), supports `pg_restore --clean --if-exists` for idempotent restore, and handles schema ordering automatically. Plain SQL would be git-diffable but the seed is binary content (images in filestore, Odoo's serialized HTML in `ir_ui_view`) — diffability adds no practical value. The `.dump` file is treated as a binary artifact.

## R5. Restore safety

**Decision**: `odoo:restore` operates on a target instance identified by Docker project name. It refuses to target `piqueray-odoo-test` unless an explicit `--owner` flag is passed, protecting the owner from accidental overwrites.

**Rationale**: Memory rule: agents must NEVER touch the owner instance. The save script reads FROM owner (safe), the restore script writes TO a target (destructive). The asymmetry demands a guard on the destructive side.

**Corollary**: `odoo:save` targets the owner by default (that's where the content lives). `odoo:restore` targets the QA instance by default (that's where agents work).

## R6. Montage content source

**Decision**: Texts come from the Figma maquette (node `210-326`). Images are exported from Figma via REST API and uploaded through the Odoo editor's media dialog.

**Rationale**: The spec says "les textes sont ceux du Figma, rich text compris (bold)" and "les images sont celles du Figma". The authoring configs already govern which fields are editable. The montage operator (owner) places snippets, then edits each text field and uploads each image using the Odoo editor — no programmatic insertion.

**Open question resolved**: Rich text (bold segments) is handled by the Odoo editor's native formatting toolbar. The operator applies bold manually to match the Figma layout. No `setRangeFontName`-style automation needed — this is a CMS editor operation, not a canvas script.
