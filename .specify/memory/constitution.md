<!--
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
be reproducible by `npm run build` and provable by `node scripts/deterministic-roundtrip.mjs`
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

## Quality Gates

"Green" is defined executably, not by opinion. Every change MUST leave all of the following
green before merge. A red gate blocks the merge — no exceptions without a
Governance-approved, time-boxed waiver recorded in the PR.

```bash
npm run build                                    # tokens → schema → components, contract-validated
npm run parity                                   # three-way differ: code, canvas, tokens vs contracts
npm run eval                                     # the deterministic suite (currently 146 checks)
npm run plugin:check                             # window.DSC anatomy; specHash mirror; drift refusal
node scripts/deterministic-roundtrip.mjs         # contract→canvas byte-identical ×2; loop closes
node scripts/core-browser-check.mjs              # core/ barrel bundles browser-pure
npx tsc --noEmit && tsc -p tsconfig.build.json   # types across src, scripts, core, extract, parity, evals
```

The eval count is authoritative from the live `N/N` printed by `npm run eval`; any count
quoted in prose MUST be kept in sync when a case is added or removed (Principle II).

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

**Version**: 1.0.0 | **Ratified**: 2026-07-22 | **Last Amended**: 2026-07-22
