# Owner gates H1–H4 — order and acceptance contract

Mechanical success never implies owner acceptance. Each approved decision is
immutable; a later decision must name the one it supersedes.

## Required order

```text
H1 fresh audit approved
  → work frames only, outside masters and Pages
H2 responsive design approved
  → runner/spike/two-run mutation plan preparation only
H3 exact card-then-section mutation plan approved
  → one first live pass per campaign only
H4 final Figma source, parity posture and handoff approved
  → finalize only
```

## Common required fields

Every `H*.json` decision contains `schemaVersion`, `featureId`, `gateId`, a unique
`decisionId`, `status`, `decisionMaker`, `decidedAt`, `evidenceRefs`,
`acceptedFacts`, `rejectedOptions`, `deferredTopics`, `authorizes`, `forbids`,
`supersedes` and `conversationEvidence`.

Allowed statuses are `draft`, `ready-for-review`, `approved`, `rejected` and
`blocked`. An approved/rejected/blocked decision must identify the human owner and
UTC date. `decisionMaker` may never be `agent`, `inferred` or empty. Evidence must
be fresh, repository-relative and sufficient for that gate.

## H1 — fresh audit

File: `H1-audit.json`.

Required facts: current file pin, section set and four member ids/keys, card set and
two member ids/keys, whole-file card composer census by position, all seven Page
usages by position, texts, media, variables, properties, overrides, shared children,
pre-existing defects and every contradiction with 021/023. `figmaWrites`,
`pageWrites` and `childWrites` are empty.

Approval confirms only the current source, card exclusivity and bounded scope. It
authorizes work frames outside governed masters and Pages. It does not authorize a
source snapshot for application or any master mutation. A second card composer or
an unresolved historical contradiction makes H1 `blocked` or moves the card to
`out-of-scope/owner-decision`.

## H2 — responsive design

File: `H2-design.json`, validated against
`contracts/figma-design-decision.md`.

Required fields include the approved mobile/desktop/wide behaviors, witnesses at
320/390/834/1200/1440/1728, 2- and 3-column selections, normal/long fixtures, media
edge cases, internal-adaptation-first proof, primitive bindings, bounded typography,
desktop preservation, child decisions and final work-frame disposition.

The following are mandatory owner decisions and may never be inferred:

- `orphanRowDecision`: exact treatment of the intermediate 3-column 2+1 row;
- `cardExtentDecision`: internal card adaptation only, or explicitly justified
  states after proof that internal adaptation is insufficient;
- `columnsSettingStatement`: enum 2|3 retained and labelled as desktop-only;
  mobile renders one card per row with no exposed column control.

H2 authorizes capability/spike/mutation-plan preparation. It still forbids master
and Page writes.

## H3 — source GO

File: `H3-mutation.json`.

Required facts: approved H1/H2, fresh pin, recoverable source snapshots for both
runs, targeted and full runner gates, two-pass mechanism spike, complete and
verified before captures for both masters and all seven usages, exact card-then-
section operations, creations (including honest zero), expected propagated deltas,
protected facts, rollback, blast radius, `pageWrites=[]`, and section
`childWrites=[]`.

Approval authorizes exactly one first application of each presented plan in order.
Any pin, operation, creation or blast-radius drift invalidates the approval.

## H4 — Figma acceptance and parity posture

File: `H4-acceptance.json`.

Required facts: approved H3, both first receipts and verifies, complete after and
idempotence captures, the 6×2×2 matrix, pixel comparison of all seven usages,
protected facts, `pageWrites=[]`, section `childWrites=[]`, both strict second-pass
no-op receipts, handoff/deviation refs, accepted limits and regeneration guard.

`parityPosture` is mandatory and must name its mechanism based on the measured drift:

- owner acknowledgements recorded in `parity/baseline.json`, following 015/016; or
- a Governance-approved, time-boxed waiver recorded in the PR.

H4 records `figma-ahead/pending-home-responsive-promotion` and explicitly sets
contract/code/HTML/Odoo/automatic-breakpoint claims to false. It authorizes only
`finalize` (section then card), not promotion to another surface.

## Common refusal

Missing, stale, empty or wrong-pin evidence; an inferred owner choice; a Page/child
write; an undeclared creation; a detached primitive; an unattributed propagated
delta; or a non-no-op second pass forces `blocked` or `rejected`.
