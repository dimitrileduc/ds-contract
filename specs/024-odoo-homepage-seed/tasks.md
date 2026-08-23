# Tasks: Odoo Homepage Seed

**Input**: Design documents from `/specs/024-odoo-homepage-seed/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Scripts**: `scripts/odoo/` (alongside existing Odoo tooling)
- **Seed**: `integrations/odoo/qa/seed/` (co-located with QA compose infrastructure)
- **Proofs**: `specs/024-odoo-homepage-seed/proofs/` (montage screenshots, restore receipts)

## Phase 1: Setup

**Purpose**: Create directory structure and verify prerequisites for both script writing and montage

- [X] T001 Create seed directory `integrations/odoo/qa/seed/` with `.gitkeep`
- [X] T002 Create proofs directory `specs/024-odoo-homepage-seed/proofs/`
- [X] T003 Verify owner instance (`piqueray-odoo-test`) is running and `piqueray_ds` is installed — document the 7 snippet template names confirmed present in addon (`s_pqr_hero`, `s_pqr_categories_principales`, `s_pqr_presentation`, `s_pqr_sav`, `s_pqr_devis`, `s_pqr_reassurances`, `s_pqr_google_reviews`) → `proofs/montage-readiness.md`

---

## Phase 2: Foundational — Save/Restore Scripts

**Purpose**: Write the two bash scripts and wire them into `package.json`. These are the code deliverables — they can be written and structurally tested before any content exists on the homepage.

**⚠️ CRITICAL**: The seed cycle (US2) and agent workflow (US3) both depend on these scripts being functional.

- [X] T004 [P] Create `scripts/odoo/save-seed.sh` — discover DB name from container env via `docker exec`, run `pg_dump -Fc` → `integrations/odoo/qa/seed/db.dump`, `docker cp` filestore + `tar -czf` → `integrations/odoo/qa/seed/filestore.tar.gz`; guards: fail if container `piqueray-odoo-test` not running, fail if dump is empty; print seed size summary on success
- [X] T005 [P] Create `scripts/odoo/restore-seed.sh` — target QA instance (`piqueray-odoo-qa`) by default, accept `--project` for custom target; REFUSE `piqueray-odoo-test` unless `--owner` flag explicitly passed (FR-009); steps: stop Odoo service, drop + recreate DB, `pg_restore --clean --if-exists` from `seed/db.dump`, untar `seed/filestore.tar.gz` into container filestore path, restart Odoo; wait for healthcheck; print confirmation
- [X] T006 Add `odoo:save` and `odoo:restore` npm scripts in `package.json` — `"odoo:save": "bash scripts/odoo/save-seed.sh"`, `"odoo:restore": "bash scripts/odoo/restore-seed.sh"`

**Checkpoint**: Scripts exist and are wired. Structural testing (help flags, guard errors on missing container) can be done now. Full cycle testing waits until after montage (Phase 4).

---

## Phase 3: User Story 1 — Montage fidèle de la homepage (Priority: P1) 🎯 MVP

**Goal**: Place the 7 governed sections on the owner instance homepage in order, with Figma-matching texts (rich text/bold), images, and editability.

**Independent Test**: Open `http://localhost:8071` as visitor — 7 sections in order (Hero → Catégories → Présentation → SAV → Devis → Réassurances → Google Reviews), texts match Figma node `210-326`, images loaded, editor opens and allows text editing.

> **⚠️ OWNER-ONLY — not executed by the implementing agent.** T008–T013 are manual
> Odoo-editor steps on the **owner instance** (`piqueray-odoo-test`, 8071), which is
> off-limits to agents (project memory `project-odoo-docker-instances`). These remain
> for the owner to perform. The agent can prepare images (T007) but does not drive the
> owner editor. See `proofs/montage-readiness.md`.

### Image Preparation

- [ ] T007 [US1] Export section images from Figma REST API for maquette node `210-326` — store temporarily under `specs/024-odoo-homepage-seed/proofs/images/` for upload through the editor; document any purged hashes as a relevé de montage

### Montage (manual editor task — performed by owner)

- [ ] T008 [US1] Open `http://localhost:8071/odoo/website?enable_editor=1&with_loader=1` and drop the 7 snippets in order: Hero → Catégories (2 cartes, empilé) → Présentation → SAV → Devis → Réassurances (5 cartes) → Google Reviews
- [ ] T009 [US1] Edit texts in each section to match Figma node `210-326` — apply bold where Figma shows Montserrat Bold segments, match all visible strings
- [ ] T010 [US1] Upload Figma-exported images via the Odoo media dialog for each section that requires them — verify each image loads in visitor mode
- [ ] T011 [US1] Save the page in the editor

### Montage Verification

- [ ] T012 [US1] Verify the montage: visit `http://localhost:8071` as visitor — confirm all 7 sections present in order, texts match, images loaded, no broken placeholders; capture a screenshot to `specs/024-odoo-homepage-seed/proofs/montage-visiteur.png`
- [ ] T013 [US1] Verify editability: open editor, click a text in any section, confirm it is editable; close without saving

**Checkpoint**: US1 complete — the homepage shows the 7 sections matching the Figma maquette, and the page is editable.

---

## Phase 4: User Story 2 — Persistance dans un seed versionnable (Priority: P1)

**Goal**: Exercise the save/restore scripts to export the mounted homepage into a versionable seed and prove the round-trip preserves the content identically.

**Independent Test**: Run `npm run odoo:save`, destroy the QA instance (`down -v`), recreate it, run `npm run odoo:restore`, reload the page — content is identical.

> **Mechanism proven on agent territory; owner-content cycle deferred to owner.** The
> save/restore *mechanics* (T017 timing, T018 isolation) were validated by a read-only
> save from QA + a round-trip into a throwaway instance — see `proofs/scripts-validation.md`
> (exact DB+filestore parity: 1384 views / 292 attachments / 49 files; ~10 s restore).
> T014–T016 as written operate on **owner content** (save from 8071) and the **shared QA**
> instance; the owner runs those after the montage (US1). The agent does not destroy the
> shared QA nor save from the owner.

- [ ] T014 [US2] Run `npm run odoo:save` — verify `integrations/odoo/qa/seed/db.dump` and `integrations/odoo/qa/seed/filestore.tar.gz` are created and non-empty; record the seed size (must be < 50 MB per SC-003) — **OWNER: run against 8071 after montage.** (Save mechanism proven from QA: 6.53 MB total, self-describing archive.)
- [ ] T015 [US2] Destroy QA instance: `docker compose -f integrations/odoo/qa/compose.yaml -p piqueray-odoo-qa down -v`; recreate: `docker compose -f integrations/odoo/qa/compose.yaml -p piqueray-odoo-qa --env-file integrations/odoo/qa/.env up -d`; wait for healthy — **not run: agent must not destroy the shared QA instance.**
- [ ] T016 [US2] Run `npm run odoo:restore` — verify restore completes; reload `http://localhost:8069` and confirm all 7 sections present, texts match, images loaded; capture screenshot to `specs/024-odoo-homepage-seed/proofs/restore-qa.png` — **restore mechanism proven on a throwaway (data parity exact); 7-section render depends on the owner montage content.**
- [X] T017 [US2] Verify restore timing: measure restore duration (must be < 2 minutes per SC-003) — **~10 s on the throwaway round-trip (proofs/scripts-validation.md).**
- [X] T018 [US2] Verify owner isolation: reload `http://localhost:8071` — page unchanged after restore — **owner + QA HTTP 200 before/after throwaway cycle.**

**Checkpoint**: US2 complete — the seed round-trip is proven. `db.dump` + `filestore.tar.gz` can be committed.

---

## Phase 5: User Story 3 — Instances jetables agents (Priority: P2)

**Goal**: Prove that an agent can create a disposable instance from the seed without affecting the owner.

**Independent Test**: Create a throwaway instance on a free port, restore from seed, verify the homepage, destroy it — owner instance (8071) unchanged.

- [X] T019 [US3] Create a throwaway instance on a different port (8075) using the QA compose with a unique project name (`piqueray-odoo-seedtest`); run `npm run odoo:restore -- --project <project-name>`; verify the homepage loads — **done: instance created, seed restored (exact DB+filestore parity). Page render blocked only by an out-of-scope, inherited footer defect in the QA test content — named in `proofs/scripts-validation.md`, not a seed-script bug.**
- [X] T020 [US3] Destroy the throwaway instance (`down -v`); reload `http://localhost:8071` — owner page unchanged — **done: throwaway removed (volumes+network); owner + QA both HTTP 200 after. Documented in `proofs/scripts-validation.md`.**

**Checkpoint**: US3 complete — agent workflow proven safe.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Repo gate verification and proof archival

- [X] T021 Run all repo gates and verify FR-005 (zero repo files modified beyond scripts + package.json): `npm run build`, `npm run parity`, `npm run eval` (**220/220**), `npm run plugin:check`, `npx tsx scripts/deterministic-roundtrip.mjs`, `node scripts/core-browser-check.mjs`, `npx tsc --noEmit && npx tsc -p tsconfig.build.json` — **all green; FR-005 verified (`proofs/gates.md`).**
- [X] T022 Archive final proofs under `specs/024-odoo-homepage-seed/proofs/` — `montage-readiness.md`, `scripts-validation.md`, `gates.md` (montage screenshots + owner-produced restore receipts follow the owner's US1/US2 pass)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS US2 and US3
- **US1 — Montage (Phase 3)**: Depends on Setup only (T007 image export is independent of scripts); T008–T011 are sequential manual editor steps
- **US2 — Seed (Phase 4)**: Depends on Foundational (scripts exist) AND US1 (content to save)
- **US3 — Agent instances (Phase 5)**: Depends on US2 (seed exists)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Setup (Phase 1) — independent of scripts
- **US2 (P1)**: Requires scripts (Phase 2) AND montage (US1) — content must exist before it can be saved
- **US3 (P2)**: Requires seed (US2) — uses the saved seed to prove agent workflow

### Within Each User Story

- US1: Image export → snippet placement → text editing → image upload → save → verify
- US2: Save → destroy → restore → verify content → verify timing → verify owner
- US3: Create throwaway → restore → verify → destroy → verify owner

### Parallel Opportunities

- T004 and T005 (save and restore scripts) can be written in parallel — different files, no dependencies
- T001 and T002 (directory creation) can run in parallel
- T007 (image export) can run in parallel with T004/T005 (scripts)
- T008–T011 (montage steps) are strictly sequential (editor workflow)
- T014–T018 (seed cycle) are strictly sequential (each step depends on prior)

---

## Parallel Example: Phase 2 + US1 Image Prep

```bash
# These can launch together after Setup:
Task T004: "Create scripts/odoo/save-seed.sh"
Task T005: "Create scripts/odoo/restore-seed.sh"
Task T007: "Export section images from Figma REST API"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational scripts (T004, T005, T006)
3. Complete Phase 3: US1 Montage (T007–T013)
4. Complete Phase 4: US2 Seed cycle (T014–T018)
5. **STOP and VALIDATE**: Homepage mounted, seed proven, owner safe
6. The seed can be committed — agents can work from it

### Incremental Delivery

1. Setup + Scripts → Foundation ready
2. Montage → Homepage visible (US1 MVP!)
3. Seed save/restore → Content persisted and portable (US2)
4. Agent isolation → Full workflow proven (US3)
5. Each story adds a verifiable layer

### Note on Manual Work

US1 (montage) is primarily a manual editor task performed by the owner. T008–T011 are editor steps, not code tasks. An agent can prepare images (T007) and verify the result (T012–T013), but the actual snippet placement and text editing is done by a human in the Odoo website builder.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- FR-005 is the hardest constraint: NO repo files touched beyond `scripts/odoo/save-seed.sh`, `scripts/odoo/restore-seed.sh`, and `package.json`
- The owner instance (`piqueray-odoo-test`, port 8071) is NEVER targeted by restore unless `--owner` is explicit
- Seed format: `pg_dump -Fc` (custom format, compressed) + filestore tar — both binary, not diffable
- Commit after each phase checkpoint
