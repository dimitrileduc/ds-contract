# Data Model — 024-odoo-homepage-seed

**Date**: 2026-08-23

This spec introduces no new data entities in the application sense. The "data" is Odoo's own persisted state — COW views, attachments, and menus — created through the editor and exported wholesale via pg_dump.

## Entities

### Seed Bundle

A directory containing the two files needed to reconstitute the owner's homepage state:

| Artifact | Format | Content |
|----------|--------|---------|
| `db.dump` | PostgreSQL custom format (`pg_dump -Fc`) | Full DB: schema + data (COW views, `ir_attachment` metadata, `ir_ui_view`, `website.page`, `website.menu`, user/session data) |
| `filestore.tar.gz` | gzip-compressed tar | Odoo filestore: uploaded images referenced by `ir_attachment` rows |

**Location**: `integrations/odoo/qa/seed/`

**Lifecycle**: Created by `npm run odoo:save`, consumed by `npm run odoo:restore`. Versionned in git (binary, not diffable). Replaced in full on each save — no incremental updates.

### Persisted Page State (Odoo-internal, not repo-managed)

The homepage content lives in Odoo's DB as COW (Copy-On-Write) views. Each placed snippet becomes a frozen HTML copy in `ir_ui_view` with `key = website.page_homepage`. Editing a text or image through the editor modifies this copy, not the QWeb template.

Key Odoo tables involved (for reference, not for direct manipulation):

| Table | Role |
|-------|------|
| `ir_ui_view` | COW views — the saved HTML of each page |
| `ir_attachment` | Uploaded images metadata (name, checksum, store_fname) |
| `website_page` | Page registry (URL, menu, published status) |
| `website_menu` | Navigation tree |

### Instance Identity

| Instance | Docker Project | Port | Role |
|----------|---------------|------|------|
| Owner | `piqueray-odoo-test` | 8071 | Source of truth for content. Save reads from here. |
| QA | `piqueray-odoo-qa` | 8069 | Default restore target. Agents work here. |
| Jetable | `piqueray-odoo-<suffix>` | any free | Agent-created, restored from seed, disposable. |
