/** Pure validation and state algebra for the 021 repair campaign. */
import path from 'node:path';
import {
  REPAIR_CAMPAIGN_ID,
  REPAIR_SCHEMA_VERSION,
  REPAIR_TARGET_IDS,
  type CampaignState,
  type CaptureSet,
  type RepairCampaign,
  type RepairReceipt,
} from './types.js';

export const CAMPAIGN_TARGET_IDS = REPAIR_TARGET_IDS;

export type RepairIssueCode =
  | 'campaign-shape' | 'schema-version' | 'campaign-id' | 'file-pin' | 'authority-ref'
  | 'target-coverage' | 'target-shape' | 'direct-target' | 'surface-coverage'
  | 'operation-allowlist' | 'capture-shape' | 'capture-invalid' | 'state'
  | 'state-transition' | 'receipt-shape' | 'receipt-gate';

export interface RepairValidationIssue { code: RepairIssueCode; path: string; message: string; }
export type RepairValidation<T> =
  | { ok: true; value: T; issues: [] }
  | { ok: false; value?: T; issues: RepairValidationIssue[] };

type RecordValue = Record<string, unknown>;
const nodeId = /^[0-9]+:[0-9]+$/;
const sha256 = /^[a-f0-9]{64}$/;
const states = new Set<CampaignState>([
  'draft', 'preflight-valid', 'captured', 'ready-to-apply', 'applied', 'verified',
  'owner-accepted', 'owner-refused', 'refused-before-mutation', 'application-failed', 'verification-failed',
]);
const targetIds = new Set<string>(REPAIR_TARGET_IDS);
const safePath = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && !path.isAbsolute(value) && !value.split(/[\\/]+/).includes('..');
const record = (value: unknown): value is RecordValue => typeof value === 'object' && value !== null && !Array.isArray(value);
const stringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((entry) => typeof entry === 'string' && entry.length > 0);
const issue = (issues: RepairValidationIssue[], code: RepairIssueCode, issuePath: string, message: string): void => {
  issues.push({ code, path: issuePath, message });
};
const result = <T>(value: T, issues: RepairValidationIssue[]): RepairValidation<T> =>
  issues.length === 0 ? { ok: true, value, issues: [] } : { ok: false, value, issues };

function completeCapture(value: unknown, surfaceIds: Set<string>): boolean {
  if (!record(value) || value.complete !== true || !Array.isArray(value.artifacts)) return false;
  const bySurface = new Map<string, Set<string>>();
  for (const artifact of value.artifacts) {
    if (!record(artifact) || artifact.status !== 'valid' || typeof artifact.surfaceId !== 'string') return false;
    if (typeof artifact.byteLength !== 'number' || artifact.byteLength <= 0 || !safePath(artifact.path) ||
      typeof artifact.sha256 !== 'string' || !sha256.test(artifact.sha256)) return false;
    if (artifact.kind === 'png' && (typeof artifact.width !== 'number' || artifact.width <= 0 || typeof artifact.height !== 'number' || artifact.height <= 0)) return false;
    const kinds = bySurface.get(artifact.surfaceId) ?? new Set<string>();
    kinds.add(String(artifact.kind));
    bySurface.set(artifact.surfaceId, kinds);
  }
  return [...surfaceIds].every((surfaceId) => bySurface.get(surfaceId)?.has('png') && bySurface.get(surfaceId)?.has('structure'));
}

function validateCapture(value: unknown, issuePath: string, issues: RepairValidationIssue[]): void {
  if (!record(value) || typeof value.captureSetId !== 'string' || !['before', 'after', 'idempotence'].includes(String(value.phase)) ||
    typeof value.fileVersionId !== 'string' || !Array.isArray(value.artifacts) || !Array.isArray(value.imageFingerprints) ||
    !Array.isArray(value.instanceLinks) || typeof value.complete !== 'boolean') {
    issue(issues, 'capture-shape', issuePath, 'capture set must declare its phase, pin, artifacts, image fingerprints, instance links and derived completeness');
  }
}

export function validateRepairCampaign(candidate: unknown): RepairValidation<RepairCampaign> {
  const issues: RepairValidationIssue[] = [];
  if (!record(candidate)) {
    issue(issues, 'campaign-shape', '$', 'campaign must be an object');
    return result(candidate as RepairCampaign, issues);
  }
  if (candidate.schemaVersion !== REPAIR_SCHEMA_VERSION) issue(issues, 'schema-version', '$.schemaVersion', 'schemaVersion must equal 1.0.0');
  if (candidate.campaignId !== REPAIR_CAMPAIGN_ID) issue(issues, 'campaign-id', '$.campaignId', 'campaignId must equal 021-figma-projection-repair');
  if (!record(candidate.filePin) || candidate.filePin.fileKey !== 'd9FYAUcqdcNtsuaMgLefvJ' ||
    typeof candidate.filePin.versionId !== 'string' || !/^\d+$/.test(candidate.filePin.versionId) ||
    typeof candidate.filePin.capturedAt !== 'string' || Number.isNaN(Date.parse(candidate.filePin.capturedAt))) {
    issue(issues, 'file-pin', '$.filePin', 'file pin must name the authorized key, a numeric version and a capture timestamp');
  }
  if (!stringArray(candidate.authorityRefs) || candidate.authorityRefs.length === 0 || !candidate.authorityRefs.every(safePath)) {
    issue(issues, 'authority-ref', '$.authorityRefs', 'authority references must be non-empty bounded repository paths');
  }

  const targets = candidate.targets;
  if (!Array.isArray(targets) || targets.length !== REPAIR_TARGET_IDS.length || new Set(targets.map((entry) => record(entry) ? entry.targetId : undefined)).size !== REPAIR_TARGET_IDS.length ||
    !REPAIR_TARGET_IDS.every((targetId) => targets.some((entry) => record(entry) && entry.targetId === targetId))) {
    issue(issues, 'target-coverage', '$.targets', 'targets must contain exactly the seven authorized target ids once each');
  }
  for (const [index, target] of (Array.isArray(targets) ? targets : []).entries()) {
    const targetPath = `$.targets[${index}]`;
    if (!record(target) || !targetIds.has(String(target.targetId)) || !nodeId.test(String(target.masterNodeId)) ||
      !record(target.reference) || !nodeId.test(String(target.reference.subjectNodeId)) || !stringArray(target.reference.visualFacts) ||
      !safePath(target.reference.decisionRef) || !stringArray(target.affectedSurfaceIds) || !stringArray(target.projectionDefectIds) ||
      !stringArray(target.allowedFields) || !stringArray(target.protectedFacts)) {
      issue(issues, 'target-shape', targetPath, 'target must have pinned ids, a 020 reference, surfaces, defects, allowlist and protected facts');
      continue;
    }
    const isDirect = target.kind === 'direct-canvas';
    if (isDirect !== ['categories-principales', 'realisations'].includes(String(target.targetId))) {
      issue(issues, 'direct-target', `${targetPath}.kind`, 'only Catégories principales and Réalisations may be direct-canvas repairs');
    }
  }

  const surfaces = candidate.affectedSurfaces;
  const surfaceIds = new Set<string>();
  if (!Array.isArray(surfaces) || surfaces.length < REPAIR_TARGET_IDS.length) {
    issue(issues, 'surface-coverage', '$.affectedSurfaces', 'every target must have at least one affected surface');
  } else {
    for (const [index, surface] of surfaces.entries()) {
      if (!record(surface) || typeof surface.surfaceId !== 'string' || surfaceIds.has(surface.surfaceId) || !targetIds.has(String(surface.targetId)) ||
        !record(surface.expectedSize) || typeof surface.expectedSize.width !== 'number' || surface.expectedSize.width <= 0 ||
        typeof surface.expectedSize.height !== 'number' || surface.expectedSize.height <= 0) {
        issue(issues, 'surface-coverage', `$.affectedSurfaces[${index}]`, 'surfaces must be unique, target-bound and have positive expected dimensions');
      } else surfaceIds.add(surface.surfaceId);
    }
    for (const targetId of REPAIR_TARGET_IDS) {
      if (!surfaces.some((surface) => record(surface) && surface.targetId === targetId && surface.role === 'master')) {
        issue(issues, 'surface-coverage', '$.affectedSurfaces', `${targetId} is missing its master surface`);
      }
    }
  }

  if (!Array.isArray(candidate.allowedOperations) || candidate.allowedOperations.length === 0) {
    issue(issues, 'operation-allowlist', '$.allowedOperations', 'at least one explicit operation is required');
  } else for (const [index, operation] of candidate.allowedOperations.entries()) {
    if (!record(operation) || typeof operation.operationId !== 'string' || !targetIds.has(String(operation.targetId)) ||
      !nodeId.test(String(operation.nodeId)) || !Array.isArray(operation.preconditions) || operation.preconditions.length === 0 ||
      !record(operation.changes) || Object.keys(operation.changes).length === 0 || !Array.isArray(operation.expectedPostconditions) || operation.expectedPostconditions.length === 0) {
      issue(issues, 'operation-allowlist', `$.allowedOperations[${index}]`, 'operations must be target-bound with named preconditions, changes and postconditions');
    }
  }

  const captures = candidate.captureSets;
  if (!record(captures) || !('before' in captures)) {
    issue(issues, 'capture-shape', '$.captureSets.before', 'a campaign must declare its before capture set');
  } else {
    validateCapture(captures.before, '$.captureSets.before', issues);
    if (captures.after !== undefined) validateCapture(captures.after, '$.captureSets.after', issues);
    if (captures.idempotence !== undefined) validateCapture(captures.idempotence, '$.captureSets.idempotence', issues);
  }

  if (!states.has(candidate.state as CampaignState)) issue(issues, 'state', '$.state', 'state is not part of the campaign state machine');
  const state = candidate.state as CampaignState;
  const beforeComplete = record(captures) && completeCapture(captures.before, surfaceIds);
  if (['captured', 'ready-to-apply', 'applied', 'verified', 'owner-accepted', 'owner-refused'].includes(state) && !beforeComplete) {
    issue(issues, 'capture-invalid', '$.captureSets.before', 'a complete valid before capture is required before the campaign can leave preflight');
  }
  if (['owner-accepted'].includes(state) &&
    Array.isArray(candidate.consumerImpacts) && candidate.consumerImpacts.some((impact) => record(impact) && impact.status === 'pending')) {
    issue(issues, 'capture-invalid', '$.consumerImpacts', 'a campaign cannot be ready with pending shared consumers');
  }
  return result(candidate as unknown as RepairCampaign, issues);
}

const normalTransitions: Record<CampaignState, CampaignState[]> = {
  draft: ['preflight-valid', 'refused-before-mutation'],
  'preflight-valid': ['captured', 'refused-before-mutation'],
  captured: ['ready-to-apply', 'refused-before-mutation'],
  'ready-to-apply': ['applied', 'refused-before-mutation'],
  applied: ['verified', 'application-failed', 'verification-failed'],
  verified: ['owner-accepted', 'owner-refused', 'verification-failed'],
  'owner-accepted': [], 'owner-refused': [], 'refused-before-mutation': [], 'application-failed': [], 'verification-failed': [],
};

export function transitionCampaign(candidate: unknown, nextState: CampaignState): RepairValidation<RepairCampaign> {
  const current = validateRepairCampaign(candidate);
  if (!current.ok) return current;
  if (!normalTransitions[current.value.state].includes(nextState)) {
    return { ok: false, issues: [{ code: 'state-transition', path: '$.state', message: `${current.value.state} cannot transition to ${nextState}` }] };
  }
  return validateRepairCampaign({ ...current.value, state: nextState });
}

export function validateRepairReceipt(candidate: unknown): RepairValidation<RepairReceipt> {
  const issues: RepairValidationIssue[] = [];
  if (!record(candidate)) {
    issue(issues, 'receipt-shape', '$', 'receipt must be an object');
    return result(candidate as unknown as RepairReceipt, issues);
  }
  if (candidate.schemaVersion !== REPAIR_SCHEMA_VERSION || candidate.campaignId !== REPAIR_CAMPAIGN_ID ||
    typeof candidate.receiptId !== 'string' || !targetIds.has(String(candidate.targetId)) || typeof candidate.referenceId !== 'string' ||
    !Array.isArray(candidate.appliedOperationIds) || !Array.isArray(candidate.expectedDiffs) || !Array.isArray(candidate.unexpectedDiffs) ||
    !Array.isArray(candidate.consumerVerdicts) || !['pass', 'fail', 'not-applicable'].includes(String(candidate.imagePreservation)) ||
    !['pass', 'fail'].includes(String(candidate.instancePreservation)) || !['pass', 'fail'].includes(String(candidate.idempotence)) ||
    !['accepted', 'refused'].includes(String(candidate.ownerDecision)) || typeof candidate.ownerRationale !== 'string' || candidate.ownerRationale.length === 0 ||
    !stringArray(candidate.evidenceRefs) || candidate.evidenceRefs.length < 3 || !candidate.evidenceRefs.every(safePath) || typeof candidate.decidedAt !== 'string') {
    issue(issues, 'receipt-shape', '$', 'receipt is missing a required schema field');
    return result(candidate as unknown as RepairReceipt, issues);
  }
  if (candidate.ownerDecision === 'accepted' && (candidate.unexpectedDiffs.length > 0 || candidate.imagePreservation === 'fail' ||
    candidate.instancePreservation !== 'pass' || candidate.idempotence !== 'pass' || candidate.consumerVerdicts.some((item) => !record(item) || !['unchanged', 'revalidated'].includes(String(item.status))))) {
    issue(issues, 'receipt-gate', '$', 'an accepted receipt cannot have an open diff, preservation failure, failed idempotence or open consumer');
  }
  return result(candidate as unknown as RepairReceipt, issues);
}

export function isCaptureSetComplete(capture: CaptureSet, surfaces: readonly string[]): boolean {
  return completeCapture(capture, new Set(surfaces));
}
