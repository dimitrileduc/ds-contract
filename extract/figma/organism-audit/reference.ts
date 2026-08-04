/**
 * The case reference — the single Figma node every measurement derivation of
 * FR-001 must cite (DW-006). `resolveCaseReference` decides the authority
 * once; `checkReferenceProvenance` makes the property observable and
 * testable without Chromium or Figma (FR-002).
 *
 * The subject's SET node stays legitimate for exactly two things, neither of
 * which reads from this module: the contract's own anchor (`run.ts:199`,
 * `contract.anchors.figma.nodeId`) and the file-version check
 * (`pilot.ts:211-222`) — both properties of the set/file, never of the
 * measurement (data-model.md §3).
 *
 * Reference: data-model.md §3, research.md D2/D3/D4,
 * contracts/receipts.schema.md §1.
 */

/** The minimal shape `resolveCaseReference` needs from a manifest subject. */
export interface CaseReferenceSubject {
  id: string;
  figmaSetNodeId: string;
}

/** The minimal shape `resolveCaseReference` needs from a manifest case. */
export interface CaseReferenceCase {
  id: string;
  figmaNodeId: string;
}

export interface CaseReference {
  caseNodeId: string;
  setNodeId: string;
}

/**
 * The one place that decides which node is the measurement authority: the
 * CASE, never the set that contains it. Pure — no I/O. For the eight
 * organisms whose set and case already coincide, both fields simply resolve
 * to the same id (research §0.2, invariant I-3.3) — nothing to special-case.
 */
export function resolveCaseReference(
  subject: CaseReferenceSubject,
  auditCase: CaseReferenceCase,
): CaseReference {
  return { caseNodeId: auditCase.figmaNodeId, setNodeId: subject.figmaSetNodeId };
}

/** One entry per FR-001 derivation — the node id it actually cited. */
export interface ReferenceDerivations {
  capture: string;
  nodeValues: string;
  imposedWidth: string;
  alignmentFrame: string;
  receiptCitation: string;
}

export interface ReferenceProvenance {
  /** The authority — the case node this comparison must be measured against. */
  caseNodeId: string;
  /** Retained for traceability only — never a valid derivation target. */
  setNodeId: string;
  derivations: ReferenceDerivations;
}

/**
 * The refusal vocabulary, and it is a CONTRACT: these codes are the ones
 * `contracts/measure-gate.interface.md` §3 publishes for condition C3. A code
 * this module emits that the gate does not know — or the reverse — is the same
 * defect the cause vocabulary refuses (FR-004), one layer down.
 */
export type ReferenceRefusalCode =
  /** A derivation cites a node that is not the case node — typically the set. */
  | 'reference-not-case-node'
  /** A derivation is absent: the block does not cover all five. */
  | 'reference-provenance-incomplete';

export interface ReferenceProvenanceReason {
  code: ReferenceRefusalCode;
  derivation: keyof ReferenceDerivations;
  message: string;
}

export interface ReferenceProvenanceCheck {
  ok: boolean;
  /** One entry per offending derivation, each carrying its own refusal code. */
  reasons: ReferenceProvenanceReason[];
}

const DERIVATION_KEYS: readonly (keyof ReferenceDerivations)[] = [
  "capture",
  "nodeValues",
  "imposedWidth",
  "alignmentFrame",
  "receiptCitation",
];

/**
 * FR-002's verification: every one of the five named derivations must cite
 * `caseNodeId`. A derivation still citing the set — even just one — is a
 * refusal, not a partial pass; comparing rendered PNG dimensions after the
 * fact (the alternative research D2 rejected) would miss exactly this case,
 * because a set whose sole variant happens to share the case's size would
 * pass while still photographing the wrong node.
 */
export function checkReferenceProvenance(
  provenance: ReferenceProvenance,
): ReferenceProvenanceCheck {
  const reasons: ReferenceProvenanceReason[] = [];
  for (const derivation of DERIVATION_KEYS) {
    const cited = provenance.derivations?.[derivation];
    // Absent is its OWN refusal, distinct from "cites the wrong node": a block
    // that does not cover the five has not been checked, it has been skipped.
    if (typeof cited !== 'string' || cited === '') {
      reasons.push({
        code: 'reference-provenance-incomplete',
        derivation,
        message: `reference-provenance-incomplete: derivation "${derivation}" is absent — the block must cover all five`,
      });
      continue;
    }
    if (cited !== provenance.caseNodeId) {
      reasons.push({
        code: 'reference-not-case-node',
        derivation,
        message: `reference-not-case-node: derivation "${derivation}" cites ${cited}, expected the case node ${provenance.caseNodeId}`,
      });
    }
  }
  return { ok: reasons.length === 0, reasons };
}
