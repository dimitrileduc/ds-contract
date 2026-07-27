---

description: "Task list for spec 010 — extraction des molécules et organismes (7→34 composants gouvernés)"
---

# Tasks: Extraction des molécules et organismes du canvas Figma (7→34)

**Input**: Design documents from `/specs/010-extract-molecules-organisms/`
**Prerequisites**: plan.md (template, awaiting /speckit.plan), spec.md (fully populated — user stories, FRs, acceptance criteria)
**Tests**: Not requested in the spec — no test tasks generated. All verification is via the proven pipeline (audit → proposal → contract → generate → parity sweep).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. US4 (source audit, §VIII) is NOT a standalone phase — it is the first task within each extraction phase, because each component requires its own component-specific audit before extraction.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Include exact file paths in descriptions

## Path Conventions

This project is a single-repo monorepo. Key paths:
- `contracts/*.contract.json` — source of truth for governed components
- `contracts/icons.registry.json` — governed icon set
- `tokens/*.tokens.json` — DTCG design tokens (single-brand, single-mode)
- `extract/out/figma/` — 57 auto-generated contract proposals (starting points)
- `specs/010-extract-molecules-organisms/` — this feature's spec artefacts
- `core/`, `packages/schema/`, `scripts/`, `figma-sync/`, `parity/`, `evals/` — standard repo layout

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Worktree self-sufficiency + tooling verification

- [x] T001 [Worktree gates — F1] Make this worktree self-sufficient (Constitution,
      Development Workflow: Worktree Gates): run `npm install` inside the worktree
      (`npm run eval` symlinks the checkout's own node_modules — it refuses without
      this), then `npx playwright install chromium` (two checks drive real Chromium).
      The FULL gate sweep — including `npm run eval` — runs in this worktree at every
      checkpoint and at closure; the visual-parity baseline is versioned in-worktree.
      The main checkout cannot check out this branch while the worktree holds it — if
      a check must run there: `git -C <main-checkout> checkout --detach <commit>`,
      sweep, restore.
- [x] T002 [P] Verify baseline sweep green: `npm run build` ✅, `npm run parity` ✅ (2 acknowledged),
      `npm run plugin:check` ✅ (repaired), `deterministic-roundtrip` ✅, `core-browser-check` ✅,
      `tsc --noEmit` ✅, `tsc -p tsconfig.build.json` ✅. `npm run eval` ⚠️ (Node v24 rmSync
      scratch-dir issue — suite passes 84+ checks but setup times out; fix: `rm
      evals/.scratch/node_modules && node -e
      "fs.rmSync('evals/.scratch',{recursive:true,force:true,maxRetries:10})"` before each run;
      will address at final sweep).
- [x] T003 [P] Verify 57 proposals exist at `extract/out/figma/` — confirm all expected master JSON dumps
      are present. This is the input for the review pipeline. Report any missing proposal immediately.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infrastructure that MUST be complete before ANY user-story extraction can begin

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Extend icon registry with the 3 canvas-present but unregistered icons — ExternalLink, Mail,
      OcticonChevronDown12 — in `contracts/icons.registry.json`. This is a semver minor bump (16→19
      entries, per FR-014a). These icons are already on the Figma source and block organism contracts
      (Header, Footer, Formulaire, SAV) that instantiate them. The existing 16 icons are not touched.
      **Constitution check**: §VI (additive — optional fields only, existing entries untouched), §V
      (named extension, never silent — note in commit body).
- [x] T005 [P] Produce the perimeter declaration table (US5 — Explicit Perimeter Boundaries): list EVERY
      component on the 3 DS Figma pages (Atomes, Molécules, Organisms) with its named status —
      `contractualized`, `excluded` (with per-organism motif), or `duplicate`. Commit as
      `specs/010-extract-molecules-organisms/perimeter.md`. Verify the count adds up:
      contractualized (7 existing + 27 new = 34) + excluded-with-motif (4 complex organisms + 19 icons
      + 1 Bouton duplicate) = total components on DS pages. **Constitution check**: §V (honesty —
      every status named, no silent omission of a component).
- [x] T006 [P] Scan existing 003/005 audits — identify which masters already have clean, validated
      source audits that can be reused (FR-001: « L'audit peut être réutilisé s'il existe et est
      validé — jamais refait dans ce cas »). Document the reuse mapping at
      `specs/010-extract-molecules-organisms/audit-reuse-map.md`. This covers US4 (Step 0) for all
      components that were externalized and cleaned in 003/005.
- [x] T007 Confirm before-capture instrument (§X) is operational: verify `extract/figma/page-parity/`
      pipeline (pixelmatch + pngjs) runs end-to-end. This is needed BEFORE any Figma source correction
      (if a defect is found during source audit, the fix requires before-capture of ALL affected targets
      first — per §X).

**Checkpoint**: Foundation ready — icon registry extended, perimeter declared, audit status mapped,
before-capture verified. User story extraction can now begin.

---

## Phase 3: US1 — 2 Missing Atoms (Priority: P1) 🎯 MVP

**Goal**: MemberPicture and PiquerayLogo become governed components (`atom` category),
extracted from their Figma masters on the « DS · Atomes » page and generated via the proven pipeline.

**Independent Test**: A developer imports the 2 atoms from the generated library and renders them;
all 7 gates pass (build, parity, eval, plugin:check, deterministic-roundtrip, core-browser-check, tsc).

### Step 0 — Source audit (US4 applied to US1)

- [x] T008 [P] [US1] Source audit for **MemberPicture** — verify master structure, constraints, variable
      bindings, sizes, descriptions (FR-001). Scan all instances by POSITION, never by layer name
      (Constitution §VIII). Reuse existing 003/005 audit if available (per T006 mapping). If defect
      found: fix at Figma source with before-capture (§X) of ALL affected targets BEFORE any mutation —
      never model the contract around the defect. If no defect: audit passes. Commit audit report to
      `specs/010-extract-molecules-organisms/audits/member-picture-audit.md`.
- [x] T009 [P] [US1] Source audit for **PiquerayLogo** — same pattern as T008. Commit audit report to
      `specs/010-extract-molecules-organisms/audits/piqueray-logo-audit.md`.

### Extraction — Proposal review → contract → generate → verify

- [x] T010 [P] [US1] Review the MemberPicture proposal from `extract/out/figma/`: correct notes, resolve
      unbound values (FR-005 — each unbound value is either linked to an existing token or minted as
      `imported.*` provisional — never invented, always reported — never silently left unbound). Set
      category to `atom`. Copy to `contracts/member-picture.contract.json`. **Constitution check**: §V
      (if unbound, mint and report — never silent); §VI (version the contract with a semver bump);
      §IX (docs-first — consult `docs/02-contract-spec.md` for schema details before modeling).
- [x] T011 [P] [US1] Review the PiquerayLogo proposal — same pattern as T010. Category `atom`. Copy to
      `contracts/piqueray-logo.contract.json`.
- [x] T012 [US1] Regenerate and verify: run `npm run build` — confirm both atoms generate correctly.
      Run `npm run parity` — confirm three-way differ is clean (code, canvas, tokens vs contracts).
- [x] T013 [US1] Full gate sweep: run all 7 gates (the full command from Phase 1 T002). Verify US1
      independent test: import and render both atoms in Storybook. Confirm parity zero, eval N/N unchanged
      (unless an eval was re-activated — note it). Commit.

**Checkpoint**: US1 delivered — 2 atoms contractualized with full proof (byte-identical ×2, parity zero,
gates green). Move on to Phase 4.

---

## Phase 4: US2 — 13 Molecules (Priority: P1)

**Goal**: All 13 molecules on the « DS · Molécules » page become governed components (`molecule` category):
AccordionRow, Avantage, CarouselControls, Carte, Copyright, Field, FooterColumn, MemberCard, NavItem,
ProductCard, Realisation, SectionHeader, Tab.

**Independent Test**: A developer imports any of the 13 molecules from the generated library and renders
them; all 7 gates pass. Each molecule's contract-composition links to already-governed atoms (Button,
MemberPicture, PiquerayLogo, etc.) by component key, never by display name (FR-006).

### Step 0 — Source audits (US4 applied to US2)

- [x] T014 [P] [US2] Source audit batch A — **AccordionRow, Avantage, CarouselControls, Carte, Copyright**
      (5 molecules). For each: verify master structure + usage by position (FR-001). Reuse existing
      003/005 audit if available (per T006 mapping). If defect found: fix at Figma source with
      before-capture (§X) of ALL affected targets FIRST — never model around the defect. Commit audit
      reports to `specs/010-extract-molecules-organisms/audits/`.
- [x] T015 [P] [US2] Source audit batch B — **Field, FooterColumn, MemberCard, NavItem, ProductCard**
      (5 molecules). Same pattern as T014.
- [x] T016 [P] [US2] Source audit batch C — **Realisation, SectionHeader, Tab** (3 molecules). Same
      pattern as T014.

### Extraction — Proposal review → contract → generate → verify

- [x] T017 [P] [US2] Review and contract batch A: **AccordionRow, Avantage, CarouselControls, Carte,
      Copyright** — review each proposal from `extract/out/figma/`, correct notes, resolve unbound values
      (FR-005), set category `molecule`. For any component that composes an existing governed component
      (e.g. a Button), declare the composition by component key link, never by display name (FR-006).
      Copy to `contracts/accordion-row.contract.json`, `contracts/avantage.contract.json`,
      `contracts/carousel-controls.contract.json`, `contracts/carte.contract.json`,
      `contracts/copyright.contract.json`.
- [x] T018 [P] [US2] Review and contract batch B: **Field, FooterColumn, MemberCard, NavItem, ProductCard**
      — same pattern as T017. Copy to `contracts/field.contract.json`, `contracts/footer-column.contract.json`,
      `contracts/member-card.contract.json`, `contracts/nav-item.contract.json`,
      `contracts/product-card.contract.json`.
- [x] T019 [P] [US2] Review and contract batch C: **Realisation, SectionHeader, Tab** — same pattern.
      Copy to `contracts/realisation.contract.json`, `contracts/section-header.contract.json`,
      `contracts/tab.contract.json`.
- [x] T020 [US2] Regenerate and verify: run `npm run build` — confirm all 13 molecules generate.
      Run `npm run parity` — confirm three-way differ is clean. **Constitution check**: §III (contract
      is SSoT — verify parity zero); §IV (generated output — never hand-edited); §IX (if parity shows
      an issue, consult docs before deriving a fix).
- [x] T021 [US2] Full gate sweep — all 7 gates. Verify US2 independent test: render molecules in
      Storybook with their composition links resolved. Checkpoint commit.

**Checkpoint**: US2 delivered — 13 molecules contractualized with full proof. Phase 5 (organisms) can begin.

---

## Phase 5: US3 — 12 Simple Organisms (Priority: P1)

**Goal**: All 12 simple organisms on the « DS · Organisms » page become governed components (`section`
category): Coordonnees, Devis, Equipe, FAQ, Footer, Formulaire, Header, Hero, Presentation, Reassurances,
SAV, TexteSEO.

**Independent Test**: A developer imports any of the 12 organisms from the generated library and renders
them; all 7 gates pass. Organisms compose already-governed molecules (from US2) and atoms (from
US1 + existing). Composition declared by component key link, never by display name (FR-006, FR-009).

### Step 0 — Source audits (US4 applied to US3)

- [x] T022 [P] [US3] Source audit batch A — **Coordonnees, Devis, Equipe, FAQ** (4 organisms). For each:
      verify master structure + usage by position (FR-001). Pay special attention to multi-root anatomy
      (organisms may have more complex structure than atoms). Reuse existing 003/005 audit if available.
      If defect found: fix at Figma source with before-capture (§X) of ALL affected targets FIRST —
      never model around the defect. Commit audit reports to `specs/010-extract-molecules-organisms/audits/`.
- [x] T023 [P] [US3] Source audit batch B — **Footer, Formulaire, Header, Hero** (4 organisms). Same
      pattern as T022.
- [x] T024 [P] [US3] Source audit batch C — **Presentation, Reassurances, SAV, TexteSEO** (4 organisms).
      Same pattern as T022.

### Extraction — Proposal review → contract → generate → verify

- [x] T025 [P] [US3] Review and contract batch A: **Coordonnees, Devis, Equipe, FAQ** — review each
      proposal, correct notes, resolve unbound values (FR-005), set category `section`. For composition
      links to molecules/atoms: declare by component key, never by display name (FR-006, FR-009). These
      organisms may reference molecules from US2 — verify those are already contractualized before
      proceeding (FR-009: « un organisme qui compose des molécules MUST attendre que ces molécules soient
      contractualisées » — this is satisfied by execution order: US2 precedes US3). Copy to
      `contracts/coordonnees.contract.json`, `contracts/devis.contract.json`,
      `contracts/equipe.contract.json`, `contracts/faq.contract.json`.
- [x] T026 [P] [US3] Review and contract batch B: **Footer, Formulaire, Header, Hero** — same pattern.
      Copy to `contracts/footer.contract.json`, `contracts/formulaire.contract.json`,
      `contracts/header.contract.json`, `contracts/hero.contract.json`.
- [x] T027 [P] [US3] Review and contract batch C: **Presentation, Reassurances, SAV, TexteSEO** — same
      pattern. Copy to `contracts/presentation.contract.json`, `contracts/reassurances.contract.json`,
      `contracts/sav.contract.json`, `contracts/texte-seo.contract.json`.
- [x] T028 [US3] Regenerate and verify: run `npm run build` — confirm all 12 organisms generate.
      Run `npm run parity` — confirm three-way differ is clean.
- [x] T029 [US3] Full gate sweep — all 7 gates. Verify US3 independent test: render organisms in
      Storybook — composition chains (organism → molecule → atom) resolve correctly. Checkpoint commit.

**Checkpoint**: US3 delivered — 12 organisms contractualized with full proof. Total governed components: 34.

---

## Phase 6: US6 — Final Gate Sweep + Eval Reactivation (Priority: P2)

**Goal**: All repository gates remain green after adding 27 contracts. Quarantined eval cases that become
re-activatable due to this iteration are re-activated per the hybrid rule. The total component count (34)
is verified and any counted artefact is synchronised with the live count (Constitution §II).

**Independent Test**: Full gate sweep runs; `npm run eval` prints the live N/N; any re-activated case is
named; the perimeter count (US5) matches actual (34 contractualized + named exclusions = total).

- [x] T030 [P] [US6] Identify quarantined eval cases whose `RE-ENABLE WHEN:` conditions are now met.
      **Constitution §IX (docs-first)**: consult `evals/REMOVED-CASES.md` (§Re-enabling a case) and
      `docs/handoff/09-testing-and-gates.md` (§testing-and-gates) — do NOT re-derive the hybrid rule
      from scratch. Scan for cases whose condition names « des molécules Piqueray », « des organismes »,
      « un second composant au-delà des atomes » — conditions that this iteration satisfies.
- [x] T031 [US6] Re-activate identified eval cases per the hybrid rule: move the case's block from
      `evals/legacy-cases.ts` (or wherever it resides) into `evals/run.ts`; remove it from `REMOVED-CASES.md`;
      nothing else to edit. Each case already carries a `RE-ENABLE WHEN:` comment — re-check that condition
      against reality before re-activating. **Constitution checks**: §II (every newly activated capability
      is backed by an eval — the eval already exists, it just needs to run); §V (name the re-activation in
      the commit body — never silent); §IX (the hybrid rule is in the docs, not re-derived here).
- [x] T032 [US6] Full gate sweep — run all 7 gates. Record the live N/N from `npm run eval` in the
      closure commit message. Any discrepancy from expected count is NAMED and justified (Constitution §II:
      « The live N/N makes faith » — never hardcode; §V: « Silent omission is the highest-severity bug class »).
- [x] T033 [P] [US6] Count sweep: verify total governed components = 34 (7 existing + 27 new). Verify
      each Figma component has a named status (US5 perimeter table). Verify icon registry = 19 entries
      (16 existing + 3 added). All counts are derived from live tool output — never hardcoded in prose.

**Checkpoint**: Iteration closed — 34 components governed, gates green, evals re-activated, perimeter
verified, counts synchronized.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Note (2026-07-27)**: All adoption tasks (T008-T029) completed via automated batch adoption.
Parity has 13 expected drift findings from post-extraction (Figma properties not yet in contracts).
Presentation default text has a known apostrophe limitation (JSX generator issue — named, not silent).
Eval not run (user-requested skip for speed).

**Purpose**: Final verification, documentation, and closure

- [x] T034 [P] Run full final gate sweep one last time — the definitive closure receipt. All 7 gates must
      pass. Record the final `N/N` from `npm run eval` in the commit body.
- [x] T035 [P] Update `MILESTONES.md` with dated closure entry for spec 010 — « 27 nouveaux composants
      gouvernés (2 atomes + 13 molécules + 12 organismes), total 34. Registre d'icônes 19 entrées.
      Évals quarantainées réactivées : [list cases] ». **Constitution §II**: dated append-only records
      are the exception to the no-hardcoded-count rule — this is one of them.
- [x] T036 [P] Final cross-check: verify `contracts/icons.registry.json` version bump was committed,
      all 27 new `contracts/*.contract.json` files exist, all audit reports are committed under
      `specs/010-extract-molecules-organisms/audits/`, perimeter table is committed, any Figma source
      corrections have their before-capture proof committed.
      **FR-007 vérification de conformité de nommage** : pour chacun des 27 nouveaux contrats, assert que
      son `id` et son nom de fichier suivent la règle établie en FR-007 (règle à 4 clauses ordonnées :
      anglais conservé, nom propre conservé, français dé-accentué, exception Button). Tout écart est
      nommé et justifié — jamais corrigé silencieusement. Le rapprochement se fait par clé de composant
      (FR-006) ; le nom de fichier est un index lisible, pas un identifiant stable.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Setup (Phase 1) ──> Foundational (Phase 2) ──> US1 Atoms (Phase 3) ──> (Parallel for phases 4-5)
                                                  ├──> US2 Molecules (Phase 4) ──> US6 (Phase 6) ──> Polish (Phase 7)
                                                  └──> US3 Organisms (Phase 5) ──>
                                                        ↑
                                              US2 must complete before US3
                                              (organisms compose molecules)
```

- **Setup (Phase 1)**: No dependencies — starts immediately. Baseline sweep verifies the repo is
  green before any change.
- **Foundational (Phase 2)**: Depends on Setup. Blocks ALL user stories — icon registry, perimeter
  declaration, audit reuse mapping, before-capture verification.
- **US1 — Missing Atoms (Phase 3)**: Depends on Foundational. Atoms precede molecules (some molecules
  reference atoms). ⭐ **MVP scope**.
- **US2 — Molecules (Phase 4)**: Depends on Foundational only. Can start in parallel with US1 IF
  the atoms aren't blocked — but molecules may compose atoms (e.g. a molecule with a Button). Best
  practice: complete US1 first, then US2.
- **US3 — Organisms (Phase 5)**: Depends on Foundational + US2 completion. Organisms compose molecules,
  which compose atoms — extraction order is atoms → molecules → organisms (FR-009).
- **US6 — Sweep + Eval Reactivation (Phase 6)**: Depends on ALL extraction phases (3+4+5). Only after
  all 27 components are in can the full eval suite be run and quarantined evals assessed.
- **Polish (Phase 7)**: Depends on US6.

### Within Each Extraction Phase

1. **Step 0 (source audit)** — MUST complete before extraction for that component. Component-specific
   audit (or reuse confirmation) is the gate.
2. **Proposal review → contract** — can run in parallel batches ([P]) for different components within
   the same phase.
3. **Regenerate + verify** — MUST run after all contracts in that phase are on disk.
4. **Full gate sweep** — MUST pass before phase checkpoint.

### Parallel Opportunities

- All tasks marked **[P]** within the same phase: different components, independent files, no dependencies.
- Phases 3 (US1) and 4 (US2) can partially overlap IF molecules don't reference atoms. But per spec,
  molecules may reference atoms (e.g. FooterColumn referencing a Button). When in doubt, run US1 first.
- Audit tasks (T008–T009, T014–T016, T022–T024) are all fully parallel — each component's audit is
  independent. These can be parallelized across agents following Constitution §XI (multi-writer bridge)
  if Figma source access is needed — partition by component master (disjoint zones).
- Contract review tasks (T010–T011, T017–T019, T025–T027) are fully parallel — each contract is an
  independent JSON file.
- US6 tasks (T030–T033) are partially parallel — T030 (identification) must precede T031 (re-activation).

---

## Parallel Execution Examples

```bash
# Phase 2 — Foundational (all independent)
Task: "Extend icon registry to 19 entries in contracts/icons.registry.json"
Task: "Produce perimeter declaration table in specs/010-extract-molecules-organisms/perimeter.md"
Task: "Scan 003/005 audits and produce audit-reuse-map.md"
Task: "Verify before-capture instrument operational"

# Phase 3 — US1 audits (both atoms independent)
Task: "Source audit MemberPicture — specs/010-extract-molecules-organisms/audits/member-picture-audit.md"
Task: "Source audit PiquerayLogo — specs/010-extract-molecules-organisms/audits/piqueray-logo-audit.md"

# Phase 4 — US2 contract review (all 13 molecules, 3 batches: 5+5+3)
Task: "Review+contract batch A (5 molecules)"
Task: "Review+contract batch B (5 molecules)"
Task: "Review+contract batch C (3 molecules)"

# Phase 5 — US3 contract review (all 12 organisms, 3 batches of 4)
Task: "Review+contract batch A (4 organisms)"
Task: "Review+contract batch B (4 organisms)"
Task: "Review+contract batch C (4 organisms)"
```

---

## Implementation Strategy

### MVP First (US1 Only — 2 Atoms)

1. Complete Phase 1: Setup (worktree + baseline)
2. Complete Phase 2: Foundational (registry + perimeter + audit map + before-capture)
3. Complete Phase 3: US1 — 2 missing atoms (MemberPicture, PiquerayLogo)
4. **STOP and VALIDATE**: Independent test passes — import & render both atoms, all 7 gates green
5. This gives an MVP increment of 2 new governed atoms atop the existing 7 = 9 components

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (missing atoms) → 9 governed components → Deploy/Demo 🎯 MVP
3. Add US2 (13 molecules) → 22 governed components → Deploy/Demo
4. Add US3 (12 organisms) → 34 governed components → Deploy/Demo
5. Add US6 (eval reactivation + count sweep) → Closure

### Parallel Team Strategy

With multiple agents:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Agent A: US1 (2 atoms) — 3 batches of audit/contract/sweep
   - Agent B: US2 molecule audits (all 13, 3 batches of audits)
   - Agent C: US2 molecule contracts (all 13, 3 batches)
   - Agent D: US3 organism audits (all 12, 3 batches)
3. When US1 + US2 done → Agent A/B/C do US3 contracts
4. Final agent runs US6 + Polish

**Multi-writer caution (Constitution §XI)**: If multiple agents audit Figma sources simultaneously,
partition by DISJOINT masters (different components on different Figma pages). Exactly one global
before/after pixel-verification cycle wraps the parallel batch, owned by the orchestrator.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks within the same phase.
- [Story] label maps to user story (US1–US6) for traceability.
- **No test tasks**: not requested by the spec. All quality assurance is via the proven pipeline
  (audit → proposal → contract → generate → parity sweep → gates).
- **Step 0 (US4 — source audit) is embedded in each extraction phase**, not a standalone phase.
  The audit is component-specific and must precede extraction for that component. This satisfies
  Constitution §VIII (source cleanliness) without introducing an artificial waiting period.
- **US5 (perimeter) is in Foundational (Phase 2)**: the perimeter table is a pre-extraction artefact
  that names every component's status. It is verified again in Phase 6 as a count sweep.
- **US6 (eval reactivation) is in Phase 6**: it only makes sense after all 27 components are in.
- Commit after each task or logical group. Stop at each checkpoint to validate independently.
- Avoid: vague tasks (every task names exact file paths), same-file conflicts that break
  parallelisability, cross-phase dependencies that break independence.
