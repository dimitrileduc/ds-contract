<!--
SYNC IMPACT REPORT — 1.2.0 (2026-07-26, MINOR)
==============================================
Version change: 1.1.0 → 1.2.0

Bump rationale:
  MINOR — three new principles added (IX. Docs-First, X. Before-Capture,
  XI. Multi-Writer Bridge), all owner rules elevated from CLAUDE.md. No principle
  renamed, removed, or redefined; I–VIII untouched and unrenumbered.

Modified principles: none.

Added sections:
  - Core Principles: IX. Docs-First — Read the Docs Before Deriving
    (owner rule 2026-07-24, elevated from CLAUDE.md; CLAUDE.md now
    summarizes and points here)
  - Core Principles: X. Before-Capture — Capture Every Affected Target Before
    Any Live Canvas Mutation Starts (owner rule, Gallery-item lesson, 2026-07-24,
    elevated from CLAUDE.md; CLAUDE.md now summarizes and points here)
  - Core Principles: XI. Multi-Writer Bridge — Parallel Canvas Writes Allowed;
    Partition Work Into Disjoint Zones (owner rule, 2026-07-25, elevated from
    CLAUDE.md; CLAUDE.md now summarizes and points here)

Removed sections: none

Templates requiring updates:
  - .specify/templates/plan-template.md   ✅ updated (constitution ref → v1.2.0;
    three new checkboxes for Principles IX, X, XI)
  - .specify/templates/spec-template.md   ✅ no change required
  - .specify/templates/tasks-template.md  ✅ no change required
  - CLAUDE.md                             ✅ updated (docs-first, before-capture,
    multi-writer bridge condensed to summaries pointing to §IX/X/XI; canonical
    note updated)

Follow-up TODOs: none

SYNC IMPACT REPORT — 1.1.0 (2026-07-24, MINOR)
==============================================
Version change: 1.0.1 → 1.1.0

Bump rationale:
  MINOR — one new principle added (VIII. Source Cleanliness), one new workflow
  subsection added (Worktree Gates — F1, doctrine settled in spec 004), and the
  Quality Gates block corrected to the commands as they actually run. No principle
  renamed, removed, or redefined; I–VII untouched and unrenumbered.

Modified principles: none redefined. One content correction: Principle I's proof
  command `node scripts/deterministic-roundtrip.mjs` →
  `npx tsx scripts/deterministic-roundtrip.mjs` (the script imports core/*.ts via
  .js specifiers; plain node cannot resolve them — same correction as Quality Gates).

Added sections:
  - Core Principles: VIII. Source Cleanliness — Audit and Clean the Figma Source
    Before Contracting It (owner rule 2026-07-23, elevated from CLAUDE.md;
    CLAUDE.md now summarizes and points here)
  - Development Workflow & Change Policy: Worktree Gates (F1)

Removed sections: none

Content corrections carried in this amendment:
  - Quality Gates: `node scripts/deterministic-roundtrip.mjs` →
    `npx tsx scripts/deterministic-roundtrip.mjs`, and
    `tsc -p tsconfig.build.json` → `npx tsc -p tsconfig.build.json`.
  (The hardcoded eval-count annotation was already removed by 1.0.1, below.)

Templates requiring updates:
  - .specify/templates/plan-template.md   ✅ updated (constitution ref → v1.1.0;
    8th checkbox for Principle VIII; corrected "All gates green" block + F1
    worktree note; Scale/Scope placeholder de-staled)
  - .specify/templates/tasks-template.md  ✅ updated (standard F1 first task for
    specs executing in git worktrees)
  - .specify/templates/spec-template.md   ✅ no change required
  - .specify/templates/constitution-template.md ✅ no change required

Follow-up TODOs:
  - Some docs/handoff pages still quote dated demo-era counts (e.g.
    00-README.md); resync under the zero-hardcoded-count rule at the next
    feature closure. README and handoff 07/09 were corrected alongside this
    amendment; CLAUDE.md was rewritten to the current Piqueray state.

SYNC IMPACT REPORT — 1.0.1 (2026-07-23, PATCH)
==============================================
Quality Gates: removed the hardcoded eval-count annotation "(currently 146 checks)",
stale since the Piqueray reconversion re-pointed the suite to 97 — it violated this
document's own sync rule (the live `N/N` is authoritative, per the paragraph below
the gate list and Principle II). No principle changed; no template impact.

SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0   (INITIAL RATIFICATION)

Bump rationale:
  First constitution for this repository. The project had no `.specify/`
  scaffolding — Spec-Kit was never initialized here — so this is a ground-up
  ratification, not an amendment. The principles are not invented: they are
  lifted verbatim in intent from the two governance documents already in the
  repo (CLAUDE.md and CONTRIBUTING.md) and elevated to constitutional law.

Principles defined (7):
  I.   Determinism — No AI in the Conversion (NON-NEGOTIABLE)
  II.  The Claims Rule — Fixture → Eval → Claim (NON-NEGOTIABLE)
  III. The Contract Is the Single Source of Truth
  IV.  Generated Output Is Never Hand-Edited
  V.   Honesty — Degradation Is Named, Never Silent
  VI.  Additive Evolution & Contract Semver
  VII. Engine Integrity — Browser-Pure Core, Load-Bearing Mock Fidelity

Added sections:
  - Purpose & Scope
  - Core Principles (I–VII)
  - Quality Gates
  - Development Workflow & Change Policy
  - Governance

Removed sections: none (initial version)

Templates requiring updates:
  - .specify/templates/constitution-template.md  ✅ created (pristine source for re-runs)
  - .specify/templates/plan-template.md          ✅ created; Constitution Check wired to the 7 principles
  - .specify/templates/spec-template.md          ✅ created (pristine — no constitution-mandated sections to add)
  - .specify/templates/tasks-template.md         ✅ created (pristine — gate discipline lives in plan's Constitution Check)

Follow-up TODOs:
  - ✅ RESOLVED (same session): `.specify/scripts/bash/*` scaffolded from the pristine
    Spec-Kit core pack (byte-identical to the proven delhez setup) — check-prerequisites,
    common, setup-plan, create-new-feature, update-agent-context. The installed
    `.claude/commands/speckit.*` already provide per-command wiring. PowerShell variants
    and optional add-ons (linear/sync integrations) were intentionally NOT copied.
  - ✅ RESOLVED (same session): README eval count synced 129 → 146 in all four places.
    Count verified by static analysis of `evals/run.ts` (146 case-level `id:`/`run:`
    entries — two independent counts agree). A live `npm run eval` receipt was NOT
    produced: `node_modules` is not installed in this checkout, and the count of
    registered checks is authoritative from source regardless. Run `npm install &&
    npm run eval` for a live 146/146 receipt.
-->

# DS Contracts Constitution

## Purpose & Scope

This constitution governs all work in the `ds-contracts-poc` repository — a proof of
concept, and candidate reference implementation, for a vendor-neutral **component
contract** specification. The load-bearing idea: a component's source of truth is neither
its design file nor its code, but a small versioned JSON contract that *generates both*.
Contracts plus DTCG tokens generate a typed React library and a native Figma library, and
a three-way differ continuously proves both still match the contracts.

The repository's credibility — and the spec's — rests on the rules below. They bind every
contributor, human or AI, and every change, from a one-line token edit to a new emitter.
Two principles are marked **NON-NEGOTIABLE**: they are the reason the project exists and
MUST NOT be suspended for expedience — only amended through Governance.

## Core Principles

### I. Determinism — No AI in the Conversion (NON-NEGOTIABLE)

The contract→surface pipeline MUST be pure functions: the same contract MUST produce
byte-identical output across two runs, pinned against golden manifests
(`evals/golden.json`). AI MAY assist authorship — propose a contract, draft an emitter,
suggest a token — but MUST NEVER sit in the generation path. Every generated artifact MUST
be reproducible by `npm run build` and provable by `npx tsx scripts/deterministic-roundtrip.mjs`
with no model in the loop.

**Rationale:** the guarantee the project sells is "byte-identical across two runs," and
that is precisely the guarantee an AI-in-the-loop cannot make. Determinism is the product;
trading it away to save effort forfeits the thesis.

### II. The Claims Rule — Fixture → Eval → Claim (NON-NEGOTIABLE)

No capability claim enters the README, docs, or any user-facing surface until an
adversarial check backs it in `npm run eval`. The order is always fixture first, eval
second, claim last. A capability sentence with no named eval behind it MUST be treated as a
defect, not a documentation gap.

**Rationale:** the project's own audits found the same failure three times — confident
claims written in the identical voice whether or not they had been tested. The eval suite,
not prose, is the unit of truth here.

### III. The Contract Is the Single Source of Truth

`contracts/*.contract.json` — never the design file, never the code — is the source of
truth. Flow is **outward** from the contract to both surfaces (React and Figma) and back
**inward** as promotions; the two surfaces MUST NEVER sync side-to-side. An engineer's new
prop and a designer's color change take the same path: the three-way differ flags it → it
is promoted into the contract as a reviewable diff → it is regenerated to the other
surface. `npm run parity` MUST be clean before merge.

**Rationale:** a single generating source is what keeps design and code from drifting into
two divergent truths; side-channel edits reintroduce exactly the divergence the contract
abolishes.

### IV. Generated Output Is Never Hand-Edited

`src/components/`, `figma-sync/*.js`, `catalog/catalog.json`, and
`contracts/contract.schema.json` are generated artifacts. They MUST NEVER be edited by
hand. To change them, change their source — the contract, the tokens, the schema, or the
generator — and regenerate. When the differ flags a hand-edit as drift, that is the product
working as designed; the remedy is to move the change upstream, never to suppress the flag.

**Rationale:** hand-editing generated output *is* drift by definition; tolerating it would
dissolve the guarantee that the contract generates the surfaces.

### V. Honesty — Degradation Is Named, Never Silent

Silent omission is the highest-severity bug class in this repository. Extraction and
inference MUST mark every heuristic (`confidence: "inferred"`) and MUST report everything
they can see but cannot read. If a check is skipped, the output MUST say so. Limits MUST be
documented where the capability is claimed, not deferred to a footnote elsewhere.

**Rationale:** a tool that quietly drops what it cannot handle is worse than one that fails
loudly — the user trusts a false-complete result. Named degradation preserves the trust the
contract model depends on.

### VI. Additive Evolution & Contract Semver

Schema changes MUST add optional fields only; existing fields MUST NEVER be repurposed or
narrowed in place, and `docs/02-contract-spec.md` MUST be bumped with the change. Contract
versions follow strict semver: adding an optional prop is a **minor**; removing or renaming
a prop or value is a **major**; widening a slot's `accepts` is a **minor**, narrowing it is
a **major**. The PR diff of a contract *is* the design-system change review and MUST be
written to be read by a designer and an engineer on the same page.

**Rationale:** consumers of a shared spec can rely on it only if evolution is
backward-compatible by default and breaking changes are loudly versioned.

### VII. Engine Integrity — Browser-Pure Core, Load-Bearing Mock Fidelity

The engine in `core/` MUST remain browser-safe: zero `node:*` imports anywhere in its
module graph, receipted by `node scripts/core-browser-check.mjs`. The Figma Plugin API mock
(`scripts/plugin-engine-mock-figma.mjs`) is load-bearing and imperfect: when a bug appears
only on the live canvas, the fix has **two** mandatory parts — (1) fix the emitter, and
(2) teach the mock to catch that class of bug headlessly forever.

**Rationale:** the core is only reusable if it never assumes Node; the mock is only
trustworthy if every live-only failure it lets through is subsequently closed — a lenient
mock once let a real SVG bug reach the canvas.

### VIII. Source Cleanliness — Audit and Clean the Figma Source Before Contracting It

Step 0 of any component spec MUST be an audit and cleanup of the component's Figma
source, completed BEFORE extraction. Unofficial affordances MUST be made official
component properties — never hidden-layer hacks. Layer, property, and variable names
MUST tell the truth about what they hold. Structure MUST be consistent across the set.
Only then is the source extracted; a contract MUST NEVER be modeled around a dirty
source. The audit covers the source (masters: structure, constraints, variable
bindings, sizes, descriptions) AND the usage (every instance on every page), and
instances MUST be scanned by POSITION, never by layer name.

**Rationale:** a contract formalizes its source, so extracting a dirty source launders
hacks into law. The Button shipped from an unclean set — icon visibility improvised via
hidden layers ×42, a STRING variable named `color/nav-state` — costing a full day of
rework and nearly crashing the first push (owner rule, 2026-07-23).

### IX. Docs-First — Read the Docs Before Deriving

Before any modeling decision, coding choice, or capability question, the `docs/` folder
MUST be consulted first — via auggie MCP (`codebase-retrieval`, natural-language
`information_request`). Key entry points: `docs/handoff/` (13-file AI-to-AI onboarding,
most authoritative), `docs/FIGMA-CAPABILITY-MATRIX.md` (every CSS↔Figma capability, the
FIXED/HUG/FILL sizing model, CARRY-BOTH vs CARRY-CODE-ONLY vs named limits), and
`docs/00-…-15-*.md`. Re-deriving what a doc already states is wasted effort and the
exact failure mode this rule exists to stop. When a doc answers the question, that answer
is used verbatim — never overridden by in-context inference.

**Rationale:** the same re-derivation failure occurred across multiple specs (owner note,
2026-07-24: "la doc est là, vous la zappez à chaque fois"). The docs encode settled
decisions that took effort to reach; re-deriving them from code is slower, error-prone,
and disrespects that investment.

### X. Before-Capture — Capture Every Affected Target Before Any Live Canvas Mutation

Before any live Figma-canvas replacement begins, the pre-change state of EVERY target
that will be touched MUST be captured — not a pilot subset, not a first page only. Each
capture MUST be verified non-empty and correctly sized before the mutation proceeds. This
is non-negotiable because once a raw copy is replaced on canvas, its pre-change state is
gone for good: no tool renders an image at a past Figma version (`figma_get_file_at_version`
returns structure, not pixels; version-diff tools do not track canvas instance changes),
and rolling a shared live file back is disruptive and unreliable as a reconstruction path.

**Rationale:** several spec-003 molecules shipped with pixel-proof on only 1–2 of many
maquettes each; checked afterward, the gap was genuinely unrecoverable (owner rule,
Gallery-item lesson, 2026-07-24). A pilot-first approach is too late: by the time the
pilot succeeds, the remaining targets' before-states are already gone.

### XI. Multi-Writer Bridge — Parallel Canvas Writes Are Allowed; Partition Into Disjoint Zones

The figma-console bridge DOES accept several concurrent writers over several ports;
multiple bridge server instances coexist (e.g. ports 9223 + 9224, observed live), so
multi-agent parallel writes to the canvas are ALLOWED — the old "one session on the bridge
at a time" rule (specs 003/005) is superseded. The condition: work MUST be partitioned
into DISJOINT zones (different masters/pages/nodes) so no two agents ever touch the same
node. Exactly one global pixel-verification cycle (before/after, all targets) MUST wrap
the entire parallel batch, owned by the orchestrator, never by an individual agent.

**Rationale:** the constraint is not the bridge but coordination — two writers touching the
same node corrupt each other's work in ways that are hard to detect and hard to undo.
Disjoint partitioning plus a single orchestrator-owned verification cycle preserves the
safety guarantee while unlocking the speed benefit (owner rule, 2026-07-25).

## Quality Gates

"Green" is defined executably, not by opinion. Every change MUST leave all of the following
green before merge. A red gate blocks the merge — no exceptions without a
Governance-approved, time-boxed waiver recorded in the PR.

```bash
npm run build                                        # tokens → schema → components, contract-validated
npm run parity                                       # three-way differ: code, canvas, tokens vs contracts
npm run eval                                         # the deterministic suite — prints the live N/N
npm run plugin:check                                 # window.DSC anatomy; specHash mirror; drift refusal
npx tsx scripts/deterministic-roundtrip.mjs          # contract→canvas byte-identical ×2 (needs tsx: imports core/*.ts via .js specifiers)
node scripts/core-browser-check.mjs                  # core/ barrel bundles browser-pure
npx tsc --noEmit && npx tsc -p tsconfig.build.json   # types across src, scripts, core, extract, parity, evals
```

Eval counts are never hardcoded in living documents: `npm run eval` prints the live
`N/N`, and that output is the only authoritative count. A number MAY be cited only in
dated, append-only records (MILESTONES.md entries, commit bodies,
`evals/REMOVED-CASES.md`); an undated count in a living document is a defect
(Principle II).

## Development Workflow & Change Policy

- **Edit the source, not the output.** Component API / anatomy / token bindings / events →
  `contracts/*.contract.json`; design tokens (including a new brand) → `tokens/*.tokens.json`;
  schema capabilities → `packages/schema/src/contract-schema.ts` (optional fields only);
  generator behavior → `scripts/generate-*.ts` and `core/emit-*.ts`. Then regenerate.
- **Promotions, not side-syncs.** A change observed on one surface enters the system only by
  promotion into the contract (Principle III), reviewed as a contract diff (Principle VI).
- **Mock-fidelity discipline.** A live-only defect is not fixed until the mock also rejects
  it (Principle VII).
- **Claims discipline.** A new capability lands as fixture → eval → claim, never claim first
  (Principle II).

### Worktree Gates (F1)

Feature specs execute in dedicated git worktrees, and the worktree MUST be made
self-sufficient before implementation starts: run `npm install` and
`npx playwright install chromium` INSIDE the worktree, so the full gate sweep —
including `npm run eval`, whose runner symlinks the checkout's own `node_modules`
into its scratch workspace — runs there at every checkpoint and at closure. The
visual-parity baseline is versioned in-worktree. The main checkout cannot check out
a branch a worktree holds; if a check must run on the main checkout, the named
fallback is `git checkout --detach <commit>` there, then sweep. (Doctrine settled in
spec 004; supersedes the spec-003 practice of "eval on the main checkout plus a
written waiver".)

## Governance

This constitution supersedes ad-hoc practice. Where a habit, a convenience, or a prior doc
conflicts with it, the constitution wins and the conflicting artifact MUST be corrected.

- **Amendments.** Any change to this document MUST be a pull request that (1) states the
  rationale, (2) updates the version and dates per the policy below, (3) records a Sync
  Impact Report at the top, and (4) propagates to dependent templates
  (`.specify/templates/plan-template.md` Constitution Check first; spec/tasks templates as
  needed).
- **Versioning policy (semver for governance).**
  - **MAJOR** — a principle is removed or redefined in a backward-incompatible way, or
    governance is materially restructured.
  - **MINOR** — a new principle or section is added, or existing guidance is materially
    expanded.
  - **PATCH** — clarifications, wording, and non-semantic refinements.
- **Compliance review.** Every PR review MUST verify compliance with these principles; the
  Quality Gates are the automated portion of that review. A reviewer MUST reject a PR that
  suppresses a gate rather than fixing its cause (Principle IV).
- **Runtime guidance.** `CLAUDE.md` and `CONTRIBUTING.md` are the day-to-day operating
  guides and MUST stay consistent with this constitution; on conflict, this document is
  authoritative and they are updated to match.

**Version**: 1.2.0 | **Ratified**: 2026-07-22 | **Last Amended**: 2026-07-26
