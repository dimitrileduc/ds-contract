# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., TypeScript 5.x / Node >= 20 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., Zod, tsx, React, Figma Plugin API or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., JSON contracts on disk, DTCG token files or N/A]  
**Testing**: [e.g., evals/run.ts deterministic suite, parity differ or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Node CLI, browser-pure core, Figma plugin or NEEDS CLARIFICATION]
**Project Type**: [e.g., library/cli/generator/plugin or NEEDS CLARIFICATION]  
**Performance Goals**: [domain-specific, e.g., byte-identical regen, sub-second build or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., zero `node:*` in core/, deterministic output or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., which contracts/registries this touches, token files affected, emitters in play or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.2.0). Every item MUST be true, or be
justified in Complexity Tracking below.

- [ ] **I. Determinism (NON-NEGOTIABLE)** — No AI/model sits in the contract→surface path;
      all generated output is reproducible by `npm run build` and byte-identical ×2 via
      `npx tsx scripts/deterministic-roundtrip.mjs`.
- [ ] **II. Claims Rule (NON-NEGOTIABLE)** — Every new capability is backed by an eval in
      `npm run eval` before it is claimed in docs (fixture → eval → claim).
- [ ] **III. Contract is the SSoT** — Changes flow through `contracts/*.contract.json`, not
      side-to-side between surfaces; `npm run parity` is clean.
- [ ] **IV. No hand-edited output** — `src/components/`, `figma-sync/*.js`,
      `catalog/catalog.json`, `contracts/contract.schema.json` are only ever regenerated.
- [ ] **V. Honesty** — Any degradation, skip, or heuristic is named in output
      (`confidence: "inferred"`); limits are documented where the capability is claimed.
- [ ] **VI. Additive evolution** — Schema adds optional fields only; contract version bump
      follows semver (minor = add; major = remove/rename/narrow); `docs/02` updated.
- [ ] **VII. Engine integrity** — `core/` stays browser-pure
      (`node scripts/core-browser-check.mjs`); any live-only canvas bug also gets a mock
      check so it fails headlessly forever.
- [ ] **VIII. Source cleanliness** — Any component work starts from an audited, cleaned
      Figma source (Step 0): affordances are official properties (no hidden-layer hacks),
      names tell the truth, structure is consistent — masters AND usage audited, every
      instance scanned by POSITION, never by name — BEFORE extraction/contracting.
      N/A only for features touching no Figma source.
- [ ] **IX. Docs-first** — `docs/` (especially `docs/handoff/` and
      `docs/FIGMA-CAPABILITY-MATRIX.md`) is consulted via auggie MCP BEFORE any modeling
      decision, coding choice, or capability question. Re-deriving what a doc already
      states is a violation.
- [ ] **X. Before-capture** — Before any live Figma-canvas replacement begins, the
      pre-change state of EVERY target that will be touched is captured, verified
      non-empty, and correctly sized before proceeding. N/A only for features with no
      canvas mutations.
- [ ] **XI. Multi-writer bridge** — Parallel canvas writes are allowed only when work is
      partitioned into DISJOINT zones (different masters/pages/nodes); exactly one global
      pixel-verification cycle wraps the parallel batch, owned by the orchestrator, never
      by individual agents. N/A for single-agent or non-canvas features.

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Specs executing in a git worktree run this sweep INSIDE the worktree (Constitution:
Worktree Gates F1) — `npm install` + `npx playwright install chromium` there first.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., contracts/, core/, scripts/, packages/). The delivered plan
  must not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
