# Runner capability plan — FR-032 / FR-033

This plan qualifies generic runner vocabulary before it is used on either live
master. No component name or node id may enter runner code.

## Required capability matrix

| Capability | Generic model to add | Stable refusals | Red fixture | Registered eval |
|---|---|---|---|---|
| Existing component-set topology | Preserve the set and every declared member identity/key; distinguish `preservedMembers` from `createdMembers`; allow `expectedCreates=[]` and report zero honestly | `responsive-operation-not-allowlisted`, `unexpected-created-node` | `evals/fixtures/figma-responsive-existing-set-topology-check.ts` | `figma-responsive-existing-set-topology-preserved` |
| Multi-axis scenario selection | Select a closed property map per scenario (minimum two axes), compare the full active pair, and carry the 6×2×2 scenario matrix without inferring state from width | `presentation-not-selected`, `responsive-operation-not-allowlisted` | `evals/fixtures/figma-responsive-multiaxis-scenarios-check.ts` | `figma-responsive-multiaxis-scenarios-explicit` |
| Authorized card target versus protected children | Allow one campaign to mutate its own declared card set while the section campaign refuses every child write, including a card instance; classify declared master→instance propagation separately from writes | `shared-child-write-forbidden`, `unexpected-created-node`, `responsive-operation-not-allowlisted` | `evals/fixtures/figma-responsive-write-boundary-propagation-idempotence-check.ts` | `figma-responsive-boundary-propagation-idempotence` |
| Seven usage surfaces by position | Carry a closed position-based usage list through campaign, captures, facts, receipts, reports and verify; account for every expected propagated delta and refuse an unattributed one | `propagated-delta-unattributed`, `page-write-forbidden`, `second-pass-not-noop` | propagation/idempotence fixture above, plus the multi-axis scenario matrix | `figma-responsive-boundary-propagation-idempotence` |
| Primitive bindings and local typography in multi-axis selections | Keep variable id/name/value/property attached to the selected axis pair; allow only font size, line height and horizontal alignment locally | `primitive-binding-detached`, `typography-field-not-allowlisted` | extend `evals/fixtures/figma-responsive-bindings-and-typography-check.ts` without recreating it | existing `figma-responsive-bindings-typography-allowlisted` |

## Fixture-first sequence

1. Add T026–T029 without extending the runner.
2. Register exactly the three new IDs above while preserving the existing binding /
   typography ID once.
3. Run the four targeted evals and retain their red diagnostics as the baseline.
4. Extend types → campaign validation → apply planning → Bridge transport → facts /
   capture / receipts / audit / report → verify.
5. Re-run the targeted evals, then the full suite and both TypeScript configurations.
6. Only after green evidence, execute the off-source mechanism spike. No live master
   may use a capability that has not passed this sequence.

## Current-code findings at planning time

- `ResponsiveComponentSetTopology` still models one `propertyName` and one
  `presentationValue`; it cannot express a Style×Colonnes pair.
- Existing-topology validation already permits zero expected creates in principle,
  but member roles are still expressed through the old historical/created transition
  vocabulary and need explicit preserved-versus-created facts.
- `assertComponentTopology` currently compares every card instance against one flat
  target-instance list. On the fresh file it honestly refuses the card campaign:
  10 instances compose the four section members and 15 additional instances are
  propagated inside the seven Page usages. The new capability must classify these
  groups without treating Page propagation as a direct child write.
- Current receipts expose `pageWrites`/`childWrites`, but do not carry a closed ledger
  of expected versus attributed propagated deltas across two ordered runs.
- Capture accepts several surfaces, yet scenario requests still select one
  `presentationValue`; usage position and content fixture are not carried together.

## FR-033 deviation discipline

Every newly observed difference from 028 is appended immediately to
`handoff/ecarts-028.md` with phase, dated cause and future-skill disposition. The
three initial deviations are existing-set mutation, two masters/two runs under one
global proof cycle, and multi-axis scenario selection.
