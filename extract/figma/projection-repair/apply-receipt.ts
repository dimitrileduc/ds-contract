import { isObject as object } from './json.js';
import type { DryRun } from './apply.js';
import type { RepairCampaign } from './types.js';

export interface LiveOperationReceipt {
  operationId: string;
  targetId: string;
  nodeId: string;
  status: 'applied' | 'amended' | 'no-op';
  createdNodeIds: string[];
  changedNodeIds: string[];
}

export interface LiveMasterCheck {
  targetId: string;
  nodeId: string;
  componentKey: string;
  masterCount: number;
  variantNames: string[];
}

export interface LiveApplyReceipt {
  schemaVersion: '1.0.0';
  campaignId: string;
  fileKey: string;
  fileVersionId: string;
  run: 'first' | 'second';
  operations: LiveOperationReceipt[];
  masters: LiveMasterCheck[];
  pageWrites: string[];
  responsiveChecks: Array<{
    targetId: string;
    width: number;
    overflow: boolean;
    overflowNodeIds?: string[];
    overflowIssues?: Array<{ nodeId: string; reason: string }>;
    screenshotRef: string;
  }>;
}

export interface BridgeApplyEnvelope {
  schemaVersion: '1.0.0';
  campaignId: string;
  fileKey: string;
  fileVersionId: string;
  run: 'first' | 'second';
  scriptResults: Array<{
    operationId: string;
    targetId?: string;
    nodeId?: string;
    result: Record<string, unknown>;
  }>;
  inspection: {
    masters: LiveMasterCheck[];
    pageWrites: string[];
    responsiveChecks: LiveApplyReceipt['responsiveChecks'];
  };
}

/** Deliberately looser than `campaign.ts`'s: a receipt may carry empty ids. */
const stringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((entry) => typeof entry === 'string');
const stableStrings = (values: readonly string[]): string => JSON.stringify([...values].sort());

/** Convert the generated component script's native amend/skip result plus one
 * post-apply inspection into the stable receipt consumed by the gates. */
export function normalizeBridgeApplyEnvelope(
  candidate: unknown,
  campaign: RepairCampaign,
  plan: DryRun,
  expectedRun: 'first' | 'second',
): LiveApplyReceipt {
  if (!object(candidate) || candidate.schemaVersion !== '1.0.0' || candidate.campaignId !== campaign.campaignId ||
    candidate.fileKey !== campaign.filePin.fileKey || candidate.fileVersionId !== campaign.filePin.versionId || candidate.run !== expectedRun ||
    !Array.isArray(candidate.scriptResults) || !object(candidate.inspection) || !Array.isArray(candidate.inspection.masters) ||
    !Array.isArray(candidate.inspection.pageWrites) || !Array.isArray(candidate.inspection.responsiveChecks)) {
    throw new Error('bridge apply envelope has an invalid identity or inspection shape');
  }
  const byOperation = new Map<string, { operationId: string; targetId?: unknown; nodeId?: unknown; result: Record<string, unknown> }>();
  for (const entry of candidate.scriptResults) {
    if (!object(entry) || typeof entry.operationId !== 'string' || !object(entry.result)) continue;
    byOperation.set(entry.operationId, {
      operationId: entry.operationId,
      targetId: entry.targetId,
      nodeId: entry.nodeId,
      result: entry.result,
    });
  }
  const operations: LiveOperationReceipt[] = plan.operations.map((expected) => {
    const raw = byOperation.get(expected.operationId);
    if (!raw) throw new Error(`bridge apply envelope is missing operation ${expected.operationId}`);
    if (raw.targetId !== undefined && raw.targetId !== expected.targetId) throw new Error(`bridge operation target drift: ${expected.operationId}`);
    if (raw.nodeId !== undefined && raw.nodeId !== expected.nodeId) throw new Error(`bridge operation node drift: ${expected.operationId}`);
    const result = raw.result;
    const noOp = result.skipped === true || result.reason === 'unchanged' || result.status === 'no-op';
    const amended = result.amended === true || result.status === 'amended';
    const applied = result.applied === true || result.status === 'applied';
    if (!noOp && !amended && !applied) throw new Error(`bridge operation has no explicit amend/apply/no-op verdict: ${expected.operationId}`);
    const createdNodeIds = stringArray(result.createdNodeIds) ? result.createdNodeIds : [];
    const changedNodeIds = stringArray(result.changedNodeIds)
      ? result.changedNodeIds
      : noOp ? [] : [expected.nodeId];
    return {
      operationId: expected.operationId,
      targetId: expected.targetId,
      nodeId: expected.nodeId,
      status: noOp ? 'no-op' : amended ? 'amended' : 'applied',
      createdNodeIds,
      changedNodeIds,
    };
  });
  if (byOperation.size !== plan.operations.length) throw new Error('bridge apply envelope contains an undeclared operation');
  return {
    schemaVersion: '1.0.0',
    campaignId: campaign.campaignId,
    fileKey: campaign.filePin.fileKey,
    fileVersionId: campaign.filePin.versionId,
    run: expectedRun,
    operations,
    masters: candidate.inspection.masters as LiveMasterCheck[],
    pageWrites: candidate.inspection.pageWrites as string[],
    responsiveChecks: candidate.inspection.responsiveChecks as LiveApplyReceipt['responsiveChecks'],
  };
}

/** Validate the bridge/plugin result rather than trusting a prose handoff. The
 * second run is materially stricter: every operation must be a real no-op. */
export function validateLiveApplyReceipt(
  candidate: unknown,
  campaign: RepairCampaign,
  plan: DryRun,
  expectedRun: 'first' | 'second',
): { ok: true; value: LiveApplyReceipt } | { ok: false; issues: string[] } {
  const issues: string[] = [];
  if (!object(candidate)) return { ok: false, issues: ['shape'] };
  if (candidate.schemaVersion !== '1.0.0') issues.push('schema-version');
  if (candidate.campaignId !== campaign.campaignId) issues.push('campaign-id');
  if (candidate.fileKey !== campaign.filePin.fileKey) issues.push('file-key');
  if (candidate.fileVersionId !== campaign.filePin.versionId) issues.push('file-version');
  if (candidate.run !== expectedRun) issues.push('run');
  if (!stringArray(candidate.pageWrites) || candidate.pageWrites.length !== 0) issues.push('page-writes');
  if (!Array.isArray(candidate.responsiveChecks)) issues.push('responsive-checks-shape');
  if (!Array.isArray(candidate.operations)) issues.push('operations-shape');
  if (!Array.isArray(candidate.masters)) issues.push('masters-shape');

  const operations = Array.isArray(candidate.operations) ? candidate.operations : [];
  const expectedOperations = new Map(plan.operations.map((operation) => [operation.operationId, operation]));
  if (operations.length !== expectedOperations.size) issues.push('operation-cardinality');
  const observedIds = new Set<string>();
  for (const operation of operations) {
    if (!object(operation) || typeof operation.operationId !== 'string' || observedIds.has(operation.operationId)) {
      issues.push('operation-identity');
      continue;
    }
    observedIds.add(operation.operationId);
    const expected = expectedOperations.get(operation.operationId);
    if (!expected || operation.targetId !== expected.targetId || operation.nodeId !== expected.nodeId) issues.push(`operation-target:${operation.operationId}`);
    const createdNodeIds = stringArray(operation.createdNodeIds) ? operation.createdNodeIds : null;
    const changedNodeIds = stringArray(operation.changedNodeIds) ? operation.changedNodeIds : null;
    if (!['applied', 'amended', 'no-op'].includes(String(operation.status)) || !createdNodeIds || !changedNodeIds) {
      issues.push(`operation-shape:${operation.operationId}`);
    }
    if (expectedRun === 'second' && (operation.status !== 'no-op' || (createdNodeIds?.length ?? 1) > 0 || (changedNodeIds?.length ?? 1) > 0)) {
      issues.push(`second-run-mutated:${operation.operationId}`);
    }
  }
  for (const operationId of expectedOperations.keys()) if (!observedIds.has(operationId)) issues.push(`operation-missing:${operationId}`);

  const masters = Array.isArray(candidate.masters) ? candidate.masters : [];
  if (masters.length !== campaign.targets.length) issues.push('master-cardinality');
  for (const target of campaign.targets) {
    const checks = masters.filter((entry) => object(entry) && entry.targetId === target.targetId);
    if (checks.length !== 1) { issues.push(`master-check:${target.targetId}`); continue; }
    const check = checks[0] as Record<string, unknown>;
    if (check.nodeId !== target.masterNodeId || check.masterCount !== 1 || typeof check.componentKey !== 'string' || check.componentKey.length === 0 ||
      !stringArray(check.variantNames) || stableStrings(check.variantNames) !== stableStrings(target.expectedVariantNames ?? [])) {
      issues.push(`master-drift:${target.targetId}`);
    }
    const responsiveChecks = Array.isArray(candidate.responsiveChecks)
      ? candidate.responsiveChecks.filter((entry) => object(entry) && entry.targetId === target.targetId)
      : [];
    const expectedWidths = [...(target.responsiveWidths ?? [])].sort((left, right) => left - right);
    const observedWidths = responsiveChecks
      .filter(object)
      .map((entry) => typeof entry.width === 'number' ? entry.width : Number.NaN)
      .sort((left, right) => left - right);
    const allowsDocumentedOverflow = target.allowedFactChanges?.includes('responsive-overflow') === true;
    const invalidResponsiveCheck = (entry: unknown): boolean => {
      if (!object(entry) || typeof entry.screenshotRef !== 'string' || entry.screenshotRef.length === 0) return true;
      if (entry.overflow === true) {
        const ids = stringArray(entry.overflowNodeIds) ? entry.overflowNodeIds : [];
        return !allowsDocumentedOverflow || ids.length === 0 || !Array.isArray(entry.overflowIssues) || entry.overflowIssues.length === 0 ||
          entry.overflowIssues.some((issue) => !object(issue) || typeof issue.nodeId !== 'string' || !ids.includes(issue.nodeId) ||
            typeof issue.reason !== 'string' || issue.reason.length === 0);
      }
      return entry.overflow !== false || (entry.overflowNodeIds !== undefined && (!stringArray(entry.overflowNodeIds) || entry.overflowNodeIds.length > 0));
    };
    if (JSON.stringify(expectedWidths) !== JSON.stringify(observedWidths) || responsiveChecks.some(invalidResponsiveCheck)) {
      issues.push(`responsive-check:${target.targetId}`);
    }
  }
  return issues.length === 0
    ? { ok: true, value: candidate as unknown as LiveApplyReceipt }
    : { ok: false, issues: [...new Set(issues)] };
}
