# Initial campaign validation — T009

Date: 2026-08-26

No live mutation was performed. Validation used JSON parsing, the pure
`validateRepairCampaign` function, and a read-only REST topology inspection against
file version `2391982289745917433`.

| Campaign | Shape validation | Read-only topology | Result |
|---|---|---|---|
| `carte-categorie/run-001` | pass, zero issues | refused by current runner | expected capability gap |
| `categories-principales/run-001` | pass, zero issues | pass at pinned version | ready for H1 audit only |

## Expected card refusal

The current 028 runner reports `consumer cardinality drift`: it sees 25 instances of
the two card members while the campaign intentionally declares the seven section
usages as position-based read-only consumers rather than direct card write targets.
The fresh census separates 10 instances inside the four section master members from
15 propagated instances inside the seven Page usages. Treating all 25 as equivalent
write targets would erase the source/propagation boundary.

This refusal is retained as the baseline for T026/T029 and T031–T040. The campaign
must not pass preflight until the generic existing-set, composer and propagated-delta
vocabulary can classify every instance honestly.

## Deliberate initial non-executability

Both manifests contain a `pending-owner-responsive-plan` sentinel with an empty
property payload and H1/H2/H3 preconditions. This satisfies the v2 manifest rule that
an explicit operation slot exists while guaranteeing that no Bridge plan can be
emitted as a valid mutation before owner design and source GO. T046 replaces the
sentinel with the exact H2 decision only after the runner and mechanism spike pass.

## Boundaries confirmed

- Both runs are fresh; no prior execution artifact was copied.
- `pageMutationPolicy` is `forbid-direct` in both manifests.
- The seven usages are declared by node position and remain read-only.
- The card target is conditional on fresh exclusivity evidence.
- The section protects every direct card instance and all other shared children;
  `childWrites=[]` and `pageWrites=[]` are closed arrays.
- The current pin is for H1 only and must be refreshed again before any live phase.
