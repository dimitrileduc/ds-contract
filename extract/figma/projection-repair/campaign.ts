/** Pure validation and state algebra for the 021 repair campaign. */
import path from 'node:path';
import {
  COMPONENT_REPAIR_SCHEMA_VERSION,
  REQUIRED_COMPONENT_PROTECTION_FACTS,
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
const gitObject = /^[a-f0-9]{40,64}$/;
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const knownProtectedFacts = new Set<string>([
  ...REQUIRED_COMPONENT_PROTECTION_FACTS,
  'video-paints', 'geometry', 'responsive-overflow',
]);
const states = new Set<CampaignState>([
  'draft', 'preflight-valid', 'captured', 'ready-to-apply', 'applied', 'verified',
  'owner-accepted', 'owner-refused', 'refused-before-mutation', 'application-failed', 'verification-failed',
]);
const targetIds = new Set<string>(REPAIR_TARGET_IDS);
const safePath = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && !path.isAbsolute(value) && !value.split(/[\\/]+/).includes('..');
const record = (value: unknown): value is RecordValue => typeof value === 'object' && value !== null && !Array.isArray(value);
const stringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((entry) => typeof entry === 'string' && entry.length > 0);
const stringArrayOrEmpty = (value: unknown): value is string[] => Array.isArray(value) && value.every((entry) => typeof entry === 'string' && entry.length > 0);
const issue = (issues: RepairValidationIssue[], code: RepairIssueCode, issuePath: string, message: string): void => {
  issues.push({ code, path: issuePath, message });
};
const result = <T>(value: T, issues: RepairValidationIssue[]): RepairValidation<T> =>
  issues.length === 0 ? { ok: true, value, issues: [] } : { ok: false, value, issues };

function completeCapture(value: unknown, surfaceIds: Set<string>, hiddenSurfaceIds = new Set<string>()): boolean {
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
  return [...surfaceIds].every((surfaceId) => bySurface.get(surfaceId)?.has('structure') &&
    (hiddenSurfaceIds.has(surfaceId) || bySurface.get(surfaceId)?.has('png')));
}

function completeFactCapture(value: unknown, surfaceIds: Set<string>): boolean {
  if (!record(value) || !Array.isArray(value.artifacts)) return false;
  const facts = new Set(value.artifacts
    .filter((artifact) => record(artifact) && artifact.kind === 'facts' && artifact.status === 'valid')
    .map((artifact) => String((artifact as RecordValue).surfaceId)));
  return [...surfaceIds].every((surfaceId) => facts.has(surfaceId));
}

function validateCapture(value: unknown, issuePath: string, issues: RepairValidationIssue[]): void {
  if (!record(value) || typeof value.captureSetId !== 'string' || !['before', 'after', 'idempotence'].includes(String(value.phase)) ||
    typeof value.fileVersionId !== 'string' || !Array.isArray(value.artifacts) || !Array.isArray(value.imageFingerprints) ||
    !Array.isArray(value.instanceLinks) || typeof value.complete !== 'boolean') {
    issue(issues, 'capture-shape', issuePath, 'capture set must declare its phase, pin, artifacts, image fingerprints, instance links and derived completeness');
  }
}

function validateComponentWorkflow(
  candidate: RecordValue,
  declaredTargetIds: Set<string>,
  issues: RepairValidationIssue[],
): void {
  const baseline = candidate.sourceBaseline;
  if (baseline !== undefined && (!record(baseline) || typeof baseline.gitHead !== 'string' || !gitObject.test(baseline.gitHead) ||
    typeof baseline.worktreeTree !== 'string' || !gitObject.test(baseline.worktreeTree) ||
    typeof baseline.backupRef !== 'string' || !baseline.backupRef.startsWith('refs/') ||
    typeof baseline.capturedAt !== 'string' || Number.isNaN(Date.parse(baseline.capturedAt)))) {
    issue(issues, 'campaign-shape', '$.sourceBaseline', 'source baseline, when present, must be a recoverable Git snapshot');
  }
  const workflow = candidate.workflow;
  if (!record(workflow) || workflow.mode !== 'single-component' || !['organism', 'shared-component'].includes(String(workflow.subjectKind)) || workflow.pageMutationPolicy !== 'forbid-direct' ||
    !safePath(workflow.evidenceRoot) || !safePath(workflow.ownerDecisionRoot) || !safePath(workflow.comparisonPath) ||
    !record(workflow.applyReceiptPaths) || !safePath(workflow.applyReceiptPaths.first) || !safePath(workflow.applyReceiptPaths.second) ||
    !stringArrayOrEmpty(workflow.directDependencies) || !stringArrayOrEmpty(workflow.sharedDependencies)) {
    issue(issues, 'campaign-shape', '$.workflow', 'component workflow must target one organism or shared component, configure bounded evidence/receipt paths and forbid direct Page writes');
    return;
  }
  if (workflow.directRepairRefs !== undefined) {
    if (!record(workflow.directRepairRefs) || Object.entries(workflow.directRepairRefs).some(([targetId, value]) =>
      !declaredTargetIds.has(targetId) || !safePath(value))) {
      issue(issues, 'campaign-shape', '$.workflow.directRepairRefs', 'direct repair references must be target-bound repository paths');
    }
  }
  if (workflow.historicalTextDecisions !== undefined) {
    if (!record(workflow.historicalTextDecisions) || Object.entries(workflow.historicalTextDecisions).some(([textNodeId, value]) =>
      !nodeId.test(textNodeId) || !safePath(value) || !Array.isArray(candidate.authorityRefs) || !candidate.authorityRefs.includes(value))) {
      issue(issues, 'campaign-shape', '$.workflow.historicalTextDecisions', 'historical text decisions must map pinned text node ids to declared authority references');
    }
  }
  const pageNodeIds = new Set(
    (Array.isArray(candidate.affectedSurfaces) ? candidate.affectedSurfaces : [])
      .filter((surface) => record(surface) && ['page-instance', 'page-context'].includes(String(surface.role)) && typeof surface.nodeId === 'string')
      .map((surface) => String((surface as RecordValue).nodeId)),
  );
  const surfaces = Array.isArray(candidate.affectedSurfaces) ? candidate.affectedSurfaces.filter(record) : [];
  for (const pageSurface of surfaces.filter((surface) => surface.role === 'page-instance')) {
    const surfaceId = String(pageSurface.surfaceId ?? '');
    const contexts = surfaces.filter((surface) => surface.role === 'page-context' && surface.contextForSurfaceId === surfaceId && typeof surface.nodeId === 'string');
    if (contexts.length !== 1) {
      issue(issues, 'surface-coverage', '$.affectedSurfaces', `Page instance ${surfaceId} requires exactly one captured page-context`);
    }
  }
  for (const [index, operation] of (Array.isArray(candidate.allowedOperations) ? candidate.allowedOperations : []).entries()) {
    if (record(operation) && pageNodeIds.has(String(operation.nodeId))) {
      issue(issues, 'operation-allowlist', `$.allowedOperations[${index}].nodeId`, 'direct operations on Page instances are forbidden');
    }
    if (record(operation) && operation.mechanism === 'generated-amend' &&
      (!record(operation.changes) || !safePath(operation.changes.generatedScriptRef) || !String(operation.changes.generatedScriptRef).endsWith('.js'))) {
      issue(issues, 'operation-allowlist', `$.allowedOperations[${index}].changes.generatedScriptRef`, 'generated amend requires one bounded generated JavaScript artifact');
    }
    if (workflow.subjectKind === 'shared-component' && record(operation) && operation.mechanism === 'ensure-organism-container') {
      issue(issues, 'operation-allowlist', `$.allowedOperations[${index}].mechanism`, 'shared components cannot receive an organism Container operation');
    }
  }
}

export function validateRepairCampaign(candidate: unknown): RepairValidation<RepairCampaign> {
  const issues: RepairValidationIssue[] = [];
  if (!record(candidate)) {
    issue(issues, 'campaign-shape', '$', 'campaign must be an object');
    return result(candidate as RepairCampaign, issues);
  }
  const legacy = candidate.schemaVersion === REPAIR_SCHEMA_VERSION;
  const component = candidate.schemaVersion === COMPONENT_REPAIR_SCHEMA_VERSION;
  if (!legacy && !component) issue(issues, 'schema-version', '$.schemaVersion', 'schemaVersion must equal 1.0.0 or 2.0.0');
  if (legacy && candidate.campaignId !== REPAIR_CAMPAIGN_ID) issue(issues, 'campaign-id', '$.campaignId', 'legacy campaignId must equal 021-figma-projection-repair');
  if (component && (typeof candidate.campaignId !== 'string' || !slug.test(candidate.campaignId))) {
    issue(issues, 'campaign-id', '$.campaignId', 'component campaignId must be a lowercase slug');
  }
  if (!record(candidate.filePin) || (legacy && candidate.filePin.fileKey !== 'd9FYAUcqdcNtsuaMgLefvJ') ||
    (component && (typeof candidate.filePin.fileKey !== 'string' || candidate.filePin.fileKey.length < 10)) ||
    typeof candidate.filePin.versionId !== 'string' || !/^\d+$/.test(candidate.filePin.versionId) ||
    typeof candidate.filePin.capturedAt !== 'string' || Number.isNaN(Date.parse(candidate.filePin.capturedAt))) {
    issue(issues, 'file-pin', '$.filePin', 'file pin must name the authorized key, a numeric version and a capture timestamp');
  }
  if (!stringArray(candidate.authorityRefs) || candidate.authorityRefs.length === 0 || !candidate.authorityRefs.every(safePath)) {
    issue(issues, 'authority-ref', '$.authorityRefs', 'authority references must be non-empty bounded repository paths');
  }

  const targets = candidate.targets;
  const declaredTargetIds = Array.isArray(targets)
    ? targets.map((entry) => record(entry) && typeof entry.targetId === 'string' ? entry.targetId : '').filter(Boolean)
    : [];
  const dynamicTargetIds = new Set(declaredTargetIds);
  if (legacy && (!Array.isArray(targets) || targets.length !== REPAIR_TARGET_IDS.length || dynamicTargetIds.size !== REPAIR_TARGET_IDS.length ||
    !REPAIR_TARGET_IDS.every((targetId) => dynamicTargetIds.has(targetId)))) {
    issue(issues, 'target-coverage', '$.targets', 'legacy targets must contain exactly the seven authorized target ids once each');
  }
  if (component && (!Array.isArray(targets) || targets.length !== 1 || dynamicTargetIds.size !== 1 || !slug.test(declaredTargetIds[0] ?? ''))) {
    issue(issues, 'target-coverage', '$.targets', 'component workflow must contain exactly one slug-named target');
  }
  for (const [index, target] of (Array.isArray(targets) ? targets : []).entries()) {
    const targetPath = `$.targets[${index}]`;
    if (!record(target) || !dynamicTargetIds.has(String(target.targetId)) || !nodeId.test(String(target.masterNodeId)) ||
      !record(target.reference) || !nodeId.test(String(target.reference.subjectNodeId)) || !stringArray(target.reference.visualFacts) ||
      !safePath(target.reference.decisionRef) || !stringArray(target.affectedSurfaceIds) || !stringArray(target.projectionDefectIds) ||
      !stringArray(target.allowedFields) || !stringArray(target.protectedFacts)) {
      issue(issues, 'target-shape', targetPath, 'target must have pinned ids, a 020 reference, surfaces, defects, allowlist and protected facts');
      continue;
    }
    const isDirect = target.kind === 'direct-canvas';
    if (legacy && isDirect !== ['categories-principales', 'realisations'].includes(String(target.targetId))) {
      issue(issues, 'direct-target', `${targetPath}.kind`, 'only Catégories principales and Réalisations may be direct-canvas repairs');
    }
    if (component) {
      if (typeof target.expectedMasterName !== 'string' || target.expectedMasterName.length === 0 || !stringArrayOrEmpty(target.expectedVariantNames) ||
        !Array.isArray(target.responsiveWidths) || target.responsiveWidths.length === 0 || target.responsiveWidths.some((width) => typeof width !== 'number' || !Number.isFinite(width) || width <= 0)) {
        issue(issues, 'target-shape', targetPath, 'component target must pin master/variant snapshots and at least one reduced responsive width');
      }
      const protectedFacts = new Set(stringArray(target.protectedFacts) ? target.protectedFacts : []);
      const allowedFacts = new Set(stringArrayOrEmpty(target.allowedFactChanges) ? target.allowedFactChanges : []);
      if ([...protectedFacts, ...allowedFacts].some((fact) => !knownProtectedFacts.has(fact)) || [...protectedFacts].some((fact) => allowedFacts.has(fact))) {
        issue(issues, 'target-shape', `${targetPath}.protectedFacts`, 'protected and allowed fact names must be known and disjoint');
      }
      for (const fact of REQUIRED_COMPONENT_PROTECTION_FACTS) {
        if (!protectedFacts.has(fact) && !allowedFacts.has(fact)) {
          issue(issues, 'target-shape', `${targetPath}.protectedFacts`, `required fact ${fact} must be protected or explicitly allowed to change`);
        }
      }
    }
  }

  const surfaces = candidate.affectedSurfaces;
  const surfaceIds = new Set<string>();
  const hiddenSurfaceIds = new Set<string>();
  if (!Array.isArray(surfaces) || surfaces.length < dynamicTargetIds.size) {
    issue(issues, 'surface-coverage', '$.affectedSurfaces', 'every target must have at least one affected surface');
  } else {
    for (const [index, surface] of surfaces.entries()) {
      if (!record(surface) || typeof surface.surfaceId !== 'string' || surfaceIds.has(surface.surfaceId) || !dynamicTargetIds.has(String(surface.targetId)) ||
        !record(surface.expectedSize) || typeof surface.expectedSize.width !== 'number' || surface.expectedSize.width <= 0 ||
        typeof surface.expectedSize.height !== 'number' || surface.expectedSize.height <= 0) {
        issue(issues, 'surface-coverage', `$.affectedSurfaces[${index}]`, 'surfaces must be unique, target-bound and have positive expected dimensions');
      } else {
        surfaceIds.add(surface.surfaceId);
        if (surface.role === 'hidden-instance') hiddenSurfaceIds.add(surface.surfaceId);
      }
    }
    for (const targetId of dynamicTargetIds) {
      if (!surfaces.some((surface) => record(surface) && surface.targetId === targetId && surface.role === 'master')) {
        issue(issues, 'surface-coverage', '$.affectedSurfaces', `${targetId} is missing its master surface`);
      }
    }
  }

  if (!Array.isArray(candidate.allowedOperations) || candidate.allowedOperations.length === 0) {
    issue(issues, 'operation-allowlist', '$.allowedOperations', 'at least one explicit operation is required');
  } else for (const [index, operation] of candidate.allowedOperations.entries()) {
    if (!record(operation) || typeof operation.operationId !== 'string' || !dynamicTargetIds.has(String(operation.targetId)) ||
      !nodeId.test(String(operation.nodeId)) || !Array.isArray(operation.preconditions) || operation.preconditions.length === 0 ||
      !record(operation.changes) || Object.keys(operation.changes).length === 0 || !Array.isArray(operation.expectedPostconditions) || operation.expectedPostconditions.length === 0) {
      issue(issues, 'operation-allowlist', `$.allowedOperations[${index}]`, 'operations must be target-bound with named preconditions, changes and postconditions');
    }
  }

  if (component) validateComponentWorkflow(candidate, dynamicTargetIds, issues);

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
  const beforeComplete = record(captures) && completeCapture(captures.before, surfaceIds, hiddenSurfaceIds);
  if (['captured', 'ready-to-apply', 'applied', 'verified', 'owner-accepted', 'owner-refused'].includes(state) && !beforeComplete) {
    issue(issues, 'capture-invalid', '$.captureSets.before', 'a complete valid before capture is required before the campaign can leave preflight');
  }
  if (component && ['captured', 'ready-to-apply', 'applied', 'verified', 'owner-accepted', 'owner-refused'].includes(state) &&
    (!record(captures) || !completeFactCapture(captures.before, surfaceIds))) {
    issue(issues, 'capture-invalid', '$.captureSets.before', 'component workflow requires a protected-facts artifact for every surface');
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
  'owner-accepted': [], 'owner-refused': [], 'refused-before-mutation': [], 'application-failed': [],
  // A failed comparison may be rerun after correcting a non-canvas gate or
  // manifest classification. The CLI recomputes the complete comparison
  // before this sole recovery transition; it cannot return to apply.
  'verification-failed': ['verified'],
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
  const legacy = candidate.schemaVersion === REPAIR_SCHEMA_VERSION;
  const component = candidate.schemaVersion === COMPONENT_REPAIR_SCHEMA_VERSION;
  const identityValid = legacy
    ? candidate.campaignId === REPAIR_CAMPAIGN_ID && targetIds.has(String(candidate.targetId))
    : component && typeof candidate.campaignId === 'string' && slug.test(candidate.campaignId) && typeof candidate.targetId === 'string' && slug.test(candidate.targetId);
  if (!identityValid ||
    typeof candidate.receiptId !== 'string' || typeof candidate.referenceId !== 'string' ||
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

export function isCaptureSetComplete(capture: CaptureSet, surfaces: readonly string[], hiddenSurfaces: readonly string[] = []): boolean {
  return completeCapture(capture, new Set(surfaces), new Set(hiddenSurfaces));
}
