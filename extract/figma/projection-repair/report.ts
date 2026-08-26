/** Deterministic receipts and terminal reporting for campaign 021. */
import { canonicalize, sha256Of, stableJson } from './json.js';
import type { LiveApplyReceipt } from './apply-receipt.js';
import { type IdempotenceComparison } from './verify.js';
import { validateRepairReceipt } from './campaign.js';
import type { DiffFinding, RepairCampaign, RepairReceipt, RepairTargetId } from './types.js';

export interface ResponsiveCapabilityReport {
  schemaVersion: '1.0.0';
  campaignId: string;
  status: 'pass' | 'fail' | 'not-applicable';
  topology: Array<{ targetId: string; setNodeId: string | null; historicalMemberNodeId: string; historicalMemberKey: string; memberNames: string[] }>;
  createdNodes: LiveApplyReceipt['operations'][number]['createdNodes'];
  selectedPresentations: Array<{ scenarioId: string; selectedPresentation: string }>;
  primitiveBindings: LiveApplyReceipt['bindingFacts'];
  typographyOverrides: LiveApplyReceipt['typographyFacts'];
  boundaryViolations: string[];
}

export function buildResponsiveCapabilityReport(campaign: RepairCampaign, receipt: LiveApplyReceipt): ResponsiveCapabilityReport {
  const responsiveTargets = campaign.targets.filter((target) => target.responsive);
  if (responsiveTargets.length === 0) return {
    schemaVersion: '1.0.0', campaignId: campaign.campaignId, status: 'not-applicable', topology: [], createdNodes: [],
    selectedPresentations: [], primitiveBindings: [], typographyOverrides: [], boundaryViolations: [],
  };
  const boundaryViolations = [
    ...receipt.pageWrites.map((nodeId) => `page-write-forbidden:${nodeId}`),
    ...receipt.childWrites.map((nodeId) => `shared-child-write-forbidden:${nodeId}`),
  ];
  const topology = responsiveTargets.map((target) => {
    const check = receipt.masters.find((entry) => entry.targetId === target.targetId);
    return {
      targetId: target.targetId,
      setNodeId: check?.setNodeId ?? null,
      historicalMemberNodeId: check?.nodeId ?? target.masterNodeId,
      historicalMemberKey: check?.componentKey ?? '',
      memberNames: check?.variantNames ?? [],
    };
  });
  const status = boundaryViolations.length === 0 && topology.every((entry) => entry.setNodeId && entry.historicalMemberKey) &&
    receipt.bindingFacts.every((entry) => entry.status === 'attached') && receipt.typographyFacts.every((entry) => entry.status === 'allowlisted') &&
    receipt.scenarioChecks.every((entry) => entry.overflow === false && entry.clippedBy.length === 0 && entry.contentAccessible)
    ? 'pass' : 'fail';
  return {
    schemaVersion: '1.0.0', campaignId: campaign.campaignId, status, topology,
    createdNodes: receipt.operations.flatMap((operation) => operation.createdNodes),
    selectedPresentations: receipt.scenarioChecks.map((scenario) => ({ scenarioId: scenario.scenarioId, selectedPresentation: scenario.selectedPresentation })),
    primitiveBindings: receipt.bindingFacts,
    typographyOverrides: receipt.typographyFacts,
    boundaryViolations,
  };
}

export interface ApplyOperationVerdict {
  operationId: string;
  status: string;
  nodeId: string;
  [key: string]: unknown;
}
export interface IdempotenceReceipt {
  schemaVersion: '1.0.0';
  campaignId: string;
  status: 'pass';
  comparisonHash: string;
  operations: ApplyOperationVerdict[];
}

/** A green idempotence receipt is impossible unless every second-run operation is a no-op. */
export function buildIdempotenceReceipt(
  comparison: IdempotenceComparison,
  operations: ApplyOperationVerdict[],
  campaignId = '021-figma-projection-repair',
): IdempotenceReceipt {
  if (!comparison.ok) {
    throw new Error(`idempotence refused — ${comparison.differences.map((difference) => difference.category).join(', ')}`);
  }
  const normalizedOperations = operations
    .map((operation) => canonicalize(operation) as ApplyOperationVerdict)
    .sort((left, right) => left.operationId.localeCompare(right.operationId));
  const nonNoOps = normalizedOperations.filter((operation) => operation.status !== 'no-op');
  if (nonNoOps.length > 0) {
    throw new Error(`idempotence refused — second apply changed ${nonNoOps.map((operation) => operation.operationId).join(', ')}`);
  }
  const comparisonHash = sha256Of(stableJson({
    after: comparison.normalizedAfter,
    idempotence: comparison.normalizedIdempotence,
    operations: normalizedOperations,
  }));
  return {
    schemaVersion: '1.0.0',
    campaignId,
    status: 'pass',
    comparisonHash,
    operations: normalizedOperations,
  };
}

export interface RepairReceiptInput {
  schemaVersion?: '1.0.0' | '2.0.0';
  campaignId?: string;
  targetId: RepairTargetId;
  referenceId: string;
  appliedOperationIds: string[];
  expectedDiffs: DiffFinding[];
  unexpectedDiffs: DiffFinding[];
  captureValid: boolean;
  imagePreservation: RepairReceipt['imagePreservation'];
  instancePreservation: RepairReceipt['instancePreservation'];
  consumerVerdicts: Array<{
    consumerId: string; dependencyId: string; status: 'unchanged' | 'revalidated' | 'refused';
    evidenceRefs: string[]; decisionRef?: string | null; [key: string]: unknown;
  }>;
  idempotence: RepairReceipt['idempotence'];
  ownerDecision: RepairReceipt['ownerDecision'] | null;
  ownerRationale: string;
  evidenceRefs: string[];
  limits?: string[];
  decidedAt: string;
}
export type RepairReceiptBuild = { ok: true; value: RepairReceipt } | { ok: false; issues: string[] };

/** Schema-shaped receipt builder with all acceptance gates applied before emission. */
export function buildRepairReceipt(input: RepairReceiptInput): RepairReceiptBuild {
  const issues: string[] = [];
  if (!input.captureValid) issues.push('capture-invalid');
  if (!input.ownerDecision) issues.push('owner-decision-missing');
  if (input.ownerDecision === 'accepted') {
    if (input.unexpectedDiffs.length > 0) issues.push('unexpected-diff');
    if (input.imagePreservation === 'fail') issues.push('image-preservation');
    if (input.instancePreservation !== 'pass') issues.push('instance-preservation');
    if (input.idempotence !== 'pass') issues.push('idempotence');
    if (input.consumerVerdicts.some((consumer) => !['unchanged', 'revalidated'].includes(consumer.status))) issues.push('consumer-open');
  }
  if (!Number.isFinite(Date.parse(input.decidedAt))) issues.push('decided-at');
  if (new Set(input.evidenceRefs).size !== input.evidenceRefs.length || input.evidenceRefs.length < 3) issues.push('evidence-refs');
  if (issues.length > 0) return { ok: false, issues };
  const receipt: RepairReceipt = {
    schemaVersion: input.schemaVersion ?? '1.0.0',
    receiptId: `${input.campaignId ?? '021'}-${input.targetId}-${input.ownerDecision}`,
    campaignId: input.campaignId ?? '021-figma-projection-repair',
    targetId: input.targetId,
    referenceId: input.referenceId,
    appliedOperationIds: [...new Set(input.appliedOperationIds)].sort(),
    expectedDiffs: input.expectedDiffs,
    unexpectedDiffs: input.unexpectedDiffs,
    imagePreservation: input.imagePreservation,
    instancePreservation: input.instancePreservation,
    consumerVerdicts: input.consumerVerdicts.map((consumer) => ({
      consumerId: consumer.consumerId,
      dependencyId: consumer.dependencyId,
      status: consumer.status,
      evidenceRefs: consumer.evidenceRefs,
      ...(consumer.decisionRef === undefined ? {} : { decisionRef: consumer.decisionRef }),
    })) as RepairReceipt['consumerVerdicts'],
    idempotence: input.idempotence,
    ownerDecision: input.ownerDecision!,
    ownerRationale: input.ownerRationale,
    evidenceRefs: input.evidenceRefs,
    ...(input.limits && input.limits.length > 0 ? { limits: input.limits } : {}),
    decidedAt: input.decidedAt,
  };
  const validation = validateRepairReceipt(receipt);
  return validation.ok ? { ok: true, value: validation.value } : {
    ok: false,
    issues: validation.issues.map((issue) => `${issue.code}@${issue.path}`),
  };
}
