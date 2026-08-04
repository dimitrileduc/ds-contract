/**
 * Adversarial contract for the case-reference provenance check (DW-006,
 * FR-001/FR-002).
 *
 * The organism-audit pilot must derive every one of FIVE measurement
 * artefacts — capture, node values, imposed width, alignment frame, receipt
 * citation — from the CASE node, never the SET that contains it (research.md
 * §0.2). This fixture is data-only: no Chromium, no Figma, no filesystem. It
 * reconstructs the antecedent defective state (all five derivations citing
 * the set) and requires a named refusal, then the corrected state (all five
 * citing the case) and requires agreement.
 *
 * A green fixture before `reference.ts` exists would be a fixture defect,
 * not good news — constitution §II: fixture → eval → claim, in that order.
 *
 * Reference: data-model.md §3 (Référence de cas), research.md D2/D3/D4,
 * contracts/receipts.schema.md §1.
 */
import {
  checkReferenceProvenance,
  resolveCaseReference,
  type ReferenceProvenance,
} from "../../extract/figma/organism-audit/reference.js";

const CASE_NODE_ID = "2114:3619"; // reassurances-disposition-4-cartes
const SET_NODE_ID = "2114:3721"; // reassurances' set — the ONE subject where they differ

// ---------------------------------------------------------------------------
// resolveCaseReference — the single place that decides the authority
// ---------------------------------------------------------------------------

const resolved = resolveCaseReference(
  { id: "reassurances", figmaSetNodeId: SET_NODE_ID },
  { id: "reassurances-disposition-4-cartes", figmaNodeId: CASE_NODE_ID },
);
if (resolved.caseNodeId !== CASE_NODE_ID) {
  throw new Error(
    `resolveCaseReference must resolve the CASE node as the authority, got ${resolved.caseNodeId}`,
  );
}
if (resolved.setNodeId !== SET_NODE_ID) {
  throw new Error(
    `resolveCaseReference must retain the set node for traceability, got ${resolved.setNodeId}`,
  );
}

// The eight other organisms (research §0.2) have a set and case that already
// coincide. The correction must leave that invariant (I-3.3) alone: both
// sides resolve to the same shared node, nothing more.
const coincident = resolveCaseReference(
  { id: "hero", figmaSetNodeId: "2104:2904" },
  { id: "hero-master-defaults", figmaNodeId: "2104:2904" },
);
if (coincident.caseNodeId !== "2104:2904" || coincident.setNodeId !== "2104:2904") {
  throw new Error("a subject whose set and case coincide must resolve both to the same node");
}

// ---------------------------------------------------------------------------
// checkReferenceProvenance — the class of error FR-002 requires caught
// ---------------------------------------------------------------------------

const DERIVATION_KEYS = [
  "capture",
  "nodeValues",
  "imposedWidth",
  "alignmentFrame",
  "receiptCitation",
] as const;

/** Reconstruct a provenance where every derivation cites `nodeId`. */
const provenanceCiting = (nodeId: string): ReferenceProvenance => ({
  caseNodeId: CASE_NODE_ID,
  setNodeId: SET_NODE_ID,
  derivations: {
    capture: nodeId,
    nodeValues: nodeId,
    imposedWidth: nodeId,
    alignmentFrame: nodeId,
    receiptCitation: nodeId,
  },
});

// The antecedent defective state (DW-006): all five derivations cite the
// SET. A fixture that let this pass would not measure the bug it claims to
// cover.
const defective = checkReferenceProvenance(provenanceCiting(SET_NODE_ID));
if (defective.ok) {
  throw new Error(
    "a provenance whose five derivations all cite the SET node must be refused, not accepted",
  );
}
if (defective.reasons.length === 0) {
  throw new Error("a refused provenance must name its reasons");
}
// The refusal VOCABULARY is a contract: these codes are the ones
// contracts/measure-gate.interface.md §3 publishes for condition C3. A code
// this module emits that the gate does not know is the same defect the cause
// vocabulary refuses (FR-004), one layer down.
if (!defective.reasons.every((reason) => reason.code === "reference-not-case-node")) {
  throw new Error(
    `a derivation citing the set must be refused as reference-not-case-node, got: ${defective.reasons.map((r) => r.code).join(", ")}`,
  );
}
if (!defective.reasons.every((reason) => reason.message.startsWith(reason.code))) {
  throw new Error("each reason's message must lead with its own refusal code");
}
// FR-002: the check covers each of the five NAMED derivations, not only the
// capture — a partial check would let the other four leak the set through.
if (defective.reasons.length !== DERIVATION_KEYS.length) {
  throw new Error(
    `a provenance with all five derivations wrong must name all five, got ${defective.reasons.length}: ${defective.reasons.join(", ")}`,
  );
}

// The corrected state: all five derivations cite the CASE. This must agree.
const corrected = checkReferenceProvenance(provenanceCiting(CASE_NODE_ID));
if (!corrected.ok) {
  throw new Error(
    `a provenance whose five derivations all cite the case node must be accepted, got: ${corrected.reasons.map((r) => r.message).join(", ")}`,
  );
}
if (corrected.reasons.length !== 0) {
  throw new Error("an accepted provenance must not carry reasons");
}

// A single derivation left on the set — half-fixed — must still be refused,
// and must name exactly the offending derivation. This is what makes the
// check a PER-DERIVATION guard rather than a capture-only one: research D2's
// rejected alternative (comparing rendered PNG dimensions after the fact)
// would miss exactly this case, since a set whose sole variant happens to
// share the case's size would pass while still photographing the wrong node.
for (const strayKey of DERIVATION_KEYS) {
  const partial = provenanceCiting(CASE_NODE_ID);
  partial.derivations = { ...partial.derivations, [strayKey]: SET_NODE_ID };
  const result = checkReferenceProvenance(partial);
  if (result.ok) {
    throw new Error(`a provenance with only "${strayKey}" left on the set must still be refused`);
  }
  if (result.reasons.length !== 1 || result.reasons[0].derivation !== strayKey) {
    throw new Error(
      `a single-derivation defect must name exactly "${strayKey}", got: ${result.reasons.map((r) => r.derivation).join(", ")}`,
    );
  }
  if (result.reasons[0].code !== "reference-not-case-node") {
    throw new Error(`a stray derivation must be reference-not-case-node, got ${result.reasons[0].code}`);
  }
}

// A MISSING derivation is its own refusal, distinct from one citing the wrong
// node: a block that does not cover the five has not been checked, it has been
// skipped. The gate names the two separately (`reference-provenance-incomplete`
// vs `reference-not-case-node`) and so must this module — a check that conflated
// them would report "wrong node: undefined", which names nothing.
for (const missingKey of DERIVATION_KEYS) {
  const truncated = provenanceCiting(CASE_NODE_ID);
  const derivations: Record<string, string> = { ...truncated.derivations };
  delete derivations[missingKey];
  truncated.derivations = derivations as unknown as typeof truncated.derivations;
  const result = checkReferenceProvenance(truncated);
  if (result.ok) {
    throw new Error(`a provenance missing "${missingKey}" must be refused, not accepted`);
  }
  if (result.reasons.length !== 1 || result.reasons[0].derivation !== missingKey) {
    throw new Error(
      `a missing derivation must name exactly "${missingKey}", got: ${result.reasons.map((r) => r.derivation).join(", ")}`,
    );
  }
  if (result.reasons[0].code !== "reference-provenance-incomplete") {
    throw new Error(
      `a missing derivation must be reference-provenance-incomplete, got ${result.reasons[0].code}`,
    );
  }
}

console.log(
  "✔ case-reference provenance is fail-closed: resolveCaseReference authorises the case node " +
    "(never the set) while retaining it for traceability, and checkReferenceProvenance refuses " +
    "any of the five FR-001 derivations left on the set — named per derivation, not just the " +
    "capture, and under the refusal code the gate publishes: reference-not-case-node for a stray " +
    "node, reference-provenance-incomplete for an absent one.",
);
