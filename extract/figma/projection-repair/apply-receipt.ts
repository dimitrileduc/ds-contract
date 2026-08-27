import { isObject as object } from './json.js';
import type { DryRun } from './apply.js';
import { comparableResponsiveMemberFacts, validateResponsiveFacts } from './facts.js';
import { canonicalVariantSelection, memberVariantSelection, responsiveTopologyMembers } from './types.js';
import type { ExpectedPropagatedDelta, PrimitiveBindingDeclaration, RepairCampaign, VariantSelection } from './types.js';
import { validatePresentationScenarioResults } from './verify.js';

/**
 * What a member the manifest declares as CREATED must show to be accepted: a real node
 * id, a real component key, and an id that is NOT one a preserved member already holds.
 * The manifest cannot pin the id — Figma assigns it at creation time — so identity is
 * proven by freshness instead of by a match. One spelling, read by both the master
 * identity check and the protected-fact check, so the two gates cannot drift apart.
 */
function createdIdentityInvalid(row: Record<string, unknown> | undefined, pinnedIds: ReadonlySet<string>): boolean {
  return !row || typeof row.nodeId !== 'string' || row.nodeId.length === 0 || pinnedIds.has(row.nodeId) ||
    typeof row.componentKey !== 'string' || row.componentKey.length === 0;
}

export interface LiveOperationReceipt {
  operationId: string;
  targetId: string;
  nodeId: string;
  status: 'applied' | 'amended' | 'no-op';
  createdNodeIds: string[];
  createdNodes: Array<{ nodeId: string; role: string; declaredName: string; presentationValue?: string }>;
  changedNodeIds: string[];
}

export interface LiveMasterCheck {
  targetId: string;
  nodeId: string;
  componentKey: string;
  masterCount: number;
  variantNames: string[];
  setNodeId?: string;
  setKey?: string;
  setName?: string;
  propertyName?: string;
  defaultPresentationValue?: string;
  variantProperties?: Record<string, string[]>;
  defaultVariantSelection?: VariantSelection;
  memberIdentities?: Array<{ nodeId: string; componentKey: string; variantSelection: VariantSelection }>;
}

export interface PresentationScenarioResult {
  targetId?: string;
  scenarioId: string;
  selectedPresentation: string;
  selectedVariantSelection?: VariantSelection;
  width: number;
  height: number;
  fixtureId: string;
  rootBounds: unknown;
  descendantBounds: unknown[];
  overflow: boolean;
  clippedBy: string[];
  contentAccessible: boolean;
  posterCoverage: string;
  captureRef: string;
  cardsPerRow?: number;
}

export interface PrimitiveBindingFact extends PrimitiveBindingDeclaration {
  boundVariableId: string | null;
  status: 'attached' | 'detached';
}

export interface TypographyOverrideFact {
  presentationValue: string;
  variantSelection?: VariantSelection;
  nodePath: string;
  sourceRole: string;
  sourceTextStyleId: string;
  appliedFields: Record<string, unknown>;
  family: string;
  weight: number;
  characters: string;
  debtStatus: string;
  status: 'allowlisted' | 'drifted';
}

export interface ResponsiveMemberFact {
  targetId?: string;
  presentationValue: string;
  variantSelection?: VariantSelection;
  nodeId?: string;
  componentKey?: string;
  authoringPreview: { width: number; layoutSizingHorizontal: string | null };
  namesAndRoles: unknown[];
  media: unknown[];
  texts: unknown[];
  componentProperties: unknown[];
  sharedChildren: unknown[];
}

export interface PropagatedDeltaFact extends ExpectedPropagatedDelta {
  status: 'attributed' | 'unattributed';
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
  childWrites: string[];
  responsiveChecks: Array<{
    targetId: string;
    width: number;
    overflow: boolean;
    overflowNodeIds?: string[];
    overflowIssues?: Array<{ nodeId: string; reason: string }>;
    screenshotRef: string;
  }>;
  scenarioChecks: PresentationScenarioResult[];
  bindingFacts: PrimitiveBindingFact[];
  typographyFacts: TypographyOverrideFact[];
  memberFacts: ResponsiveMemberFact[];
  propagatedDeltas: PropagatedDeltaFact[];
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
    childWrites?: string[];
    scenarioChecks?: PresentationScenarioResult[];
    bindingFacts?: PrimitiveBindingFact[];
    typographyFacts?: TypographyOverrideFact[];
    memberFacts?: ResponsiveMemberFact[];
    propagatedDeltas?: PropagatedDeltaFact[];
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
    const createdNodes = Array.isArray(result.createdNodes) ? result.createdNodes.filter(object).map((entry) => ({
      nodeId: String(entry.nodeId ?? ''),
      role: String(entry.role ?? ''),
      declaredName: String(entry.declaredName ?? ''),
      ...(typeof entry.presentationValue === 'string' ? { presentationValue: entry.presentationValue } : {}),
    })) : [];
    const changedNodeIds = stringArray(result.changedNodeIds)
      ? result.changedNodeIds
      : noOp ? [] : [expected.nodeId];
    return {
      operationId: expected.operationId,
      targetId: expected.targetId,
      nodeId: expected.nodeId,
      status: noOp ? 'no-op' : amended ? 'amended' : 'applied',
      createdNodeIds,
      createdNodes,
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
    childWrites: stringArray(candidate.inspection.childWrites) ? candidate.inspection.childWrites : [],
    responsiveChecks: candidate.inspection.responsiveChecks as LiveApplyReceipt['responsiveChecks'],
    scenarioChecks: Array.isArray(candidate.inspection.scenarioChecks) ? candidate.inspection.scenarioChecks as PresentationScenarioResult[] : [],
    bindingFacts: Array.isArray(candidate.inspection.bindingFacts) ? candidate.inspection.bindingFacts as PrimitiveBindingFact[] : [],
    typographyFacts: Array.isArray(candidate.inspection.typographyFacts) ? candidate.inspection.typographyFacts as TypographyOverrideFact[] : [],
    memberFacts: Array.isArray(candidate.inspection.memberFacts) ? candidate.inspection.memberFacts as ResponsiveMemberFact[] : [],
    propagatedDeltas: Array.isArray(candidate.inspection.propagatedDeltas) ? candidate.inspection.propagatedDeltas as PropagatedDeltaFact[] : [],
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
  if (!stringArray(candidate.pageWrites) || candidate.pageWrites.length !== 0) issues.push('page-writes', 'page-write-forbidden');
  const responsiveCampaign = campaign.targets.some((target) => target.responsive !== undefined);
  if ((candidate.childWrites !== undefined || responsiveCampaign) && (!stringArray(candidate.childWrites) || candidate.childWrites.length !== 0)) issues.push('child-writes', 'shared-child-write-forbidden');
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
    const createdNodes = Array.isArray(operation.createdNodes) ? operation.createdNodes.filter(object) : [];
    const changedNodeIds = stringArray(operation.changedNodeIds) ? operation.changedNodeIds : null;
    if (!['applied', 'amended', 'no-op'].includes(String(operation.status)) || !createdNodeIds || !changedNodeIds) {
      issues.push(`operation-shape:${operation.operationId}`);
    }
    if (expectedRun === 'second' && (operation.status !== 'no-op' || (createdNodeIds?.length ?? 1) > 0 || createdNodes.length > 0 || (changedNodeIds?.length ?? 1) > 0)) {
      issues.push(`second-pass-not-noop:${operation.operationId}`);
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
    const expectedVariants = target.responsive?.componentSetTopology.expectedMemberNames ?? target.expectedVariantNames ?? [];
    const responsiveIdentityInvalid = target.responsive ? (() => {
      const topology = target.responsive!.componentSetTopology;
      const members = responsiveTopologyMembers(topology);
      const existing = topology.setIdentityPolicy === 'existing';
      const legacyExisting = existing && topology.preservedMembers === undefined && topology.createdMembers.length > 0 && topology.createdMembers.every((member) => member.nodeId !== undefined);
      const expectedComponentKey = existing && !legacyExisting ? topology.setComponentKey : topology.historicalMember.componentKey;
      const observedMembers = Array.isArray(check.memberIdentities) ? check.memberIdentities.filter(object) : [];
      // A member the manifest PINS is matched by that pinned id and key. A member the
      // manifest declares as CREATED has no pinned identity to match — Figma assigns
      // the id at creation time, which is exactly why `ResponsiveComponentMember.nodeId`
      // is optional. Matching it against `undefined` refused every truthful receipt for
      // a declared create in an existing set: the branch 029 built and never ran, found
      // by rehearsing it (030 / FR-011). What it is held to instead is stricter where
      // it counts: addressed by its exact axis pair, carrying a real id and key, and
      // never re-using a preserved member's identity.
      const pinnedMemberIds = new Set(members.map((member) => member.nodeId).filter((id): id is string => typeof id === 'string'));
      const memberIdentityInvalid = existing && (observedMembers.length !== members.length || members.some((member) => {
        if (member.nodeId === undefined) {
          const created = observedMembers.find((entry) => canonicalVariantSelection(entry.variantSelection as VariantSelection) ===
            canonicalVariantSelection(memberVariantSelection(topology, member)));
          return createdIdentityInvalid(created, pinnedMemberIds);
        }
        const row = observedMembers.find((entry) => entry.nodeId === member.nodeId);
        return !row || (!legacyExisting && row.componentKey !== member.componentKey) || canonicalVariantSelection(row.variantSelection as VariantSelection) !==
          canonicalVariantSelection(memberVariantSelection(topology, member));
      }));
      return check.componentKey !== expectedComponentKey || check.setNodeId !== topology.setNodeId && existing ||
        typeof check.setNodeId !== 'string' || check.setNodeId.length === 0 || check.setName !== topology.setName ||
        check.propertyName !== topology.propertyName || check.defaultPresentationValue !== topology.defaultPresentationValue || memberIdentityInvalid ||
        (topology.variantProperties !== undefined && (canonicalVariantSelection(check.defaultVariantSelection as VariantSelection) !== canonicalVariantSelection(topology.defaultVariantSelection) ||
          JSON.stringify(check.variantProperties) !== JSON.stringify(topology.variantProperties)));
    })() : false;
    if (check.nodeId !== target.masterNodeId || check.masterCount !== 1 || typeof check.componentKey !== 'string' || check.componentKey.length === 0 ||
      !stringArray(check.variantNames) || stableStrings(check.variantNames) !== stableStrings(expectedVariants) || responsiveIdentityInvalid) {
      issues.push(`master-drift:${target.targetId}`);
    }
    if (target.responsive) {
      const expectedCreates = (plan.expectedCreates ?? []).filter((entry) => entry.operationId && plan.operations.some((operation) => operation.operationId === entry.operationId && operation.targetId === target.targetId));
      const targetOperations = operations.filter((operation) => object(operation) && operation.targetId === target.targetId);
      const createdNodes = targetOperations.flatMap((operation) => object(operation) && Array.isArray(operation.createdNodes) ? operation.createdNodes.filter(object) : []);
      const createdIds = targetOperations.flatMap((operation) => object(operation) && stringArray(operation.createdNodeIds) ? operation.createdNodeIds : []);
      const changedIds = targetOperations.flatMap((operation) => object(operation) && stringArray(operation.changedNodeIds) ? operation.changedNodeIds : []);
      const expectedChangedIds = campaign.writeBoundary?.expectedChangedNodeIds ?? campaign.writeBoundary?.allowedExistingNodeIds ?? [];
      const undeclaredChangedIds = changedIds.filter((nodeId) => !expectedChangedIds.includes(nodeId) && !createdIds.includes(nodeId));
      if (expectedRun === 'first') {
        const expectedRoles = expectedCreates.flatMap((entry) => Array.from({ length: entry.count }, () => `${entry.role}\0${entry.declaredName}\0${entry.presentationValue ?? ''}`)).sort();
        const actualRoles = createdNodes.map((entry) => `${String(entry.role)}\0${String(entry.declaredName)}\0${String(entry.presentationValue ?? '')}`).sort();
        const nodeIds = createdNodes.map((entry) => String(entry.nodeId));
        if (stableStrings(expectedRoles) !== stableStrings(actualRoles) || new Set(nodeIds).size !== nodeIds.length || stableStrings(nodeIds) !== stableStrings(createdIds)) {
          issues.push(`unexpected-created-node:${target.targetId}`);
        }
        if (stableStrings(changedIds) !== stableStrings(expectedChangedIds) || undeclaredChangedIds.length > 0) {
          issues.push(`responsive-operation-not-allowlisted:${target.targetId}:changed-nodes`);
        }
      } else if (createdNodes.length > 0 || createdIds.length > 0) issues.push(`second-pass-not-noop:${target.targetId}`);
      const scenarioChecks = Array.isArray(candidate.scenarioChecks)
        ? candidate.scenarioChecks.filter((entry) => object(entry) && (entry.targetId === undefined || entry.targetId === target.targetId))
        : [];
      const scenarios = validatePresentationScenarioResults(target.responsive.presentationScenarios, scenarioChecks as never);
      if (!scenarios.ok) issues.push(...scenarios.issues.map((entry) => `${entry}:${target.targetId}`));
      const facts = validateResponsiveFacts(target.responsive, Array.isArray(candidate.bindingFacts) ? candidate.bindingFacts : [], Array.isArray(candidate.typographyFacts) ? candidate.typographyFacts : []);
      if (!facts.ok) issues.push(...facts.issues.map((entry) => `${entry}:${target.targetId}`));
      const memberFacts = Array.isArray(candidate.memberFacts)
        ? candidate.memberFacts.filter((entry) => object(entry) && (entry.targetId === undefined || entry.targetId === target.targetId))
        : [];
      const topologyMembers = responsiveTopologyMembers(target.responsive.componentSetTopology);
      const expectedPresentations = topologyMembers.map((entry) => entry.presentationValue);
      if (memberFacts.length !== expectedPresentations.length || expectedPresentations.some((presentation) =>
        memberFacts.filter((entry) => object(entry) && entry.presentationValue === presentation).length !== 1)) {
        issues.push(`responsive-member-facts-cardinality:${target.targetId}`);
      } else {
        const previewWidths = new Map(topologyMembers.map((entry) => [entry.presentationValue, entry.authoringPreviewWidth] as const));
        if (memberFacts.some((entry) => {
          if (!object(entry) || !object(entry.authoringPreview)) return true;
          return entry.authoringPreview.layoutSizingHorizontal !== 'FIXED' ||
            Math.abs(Number(entry.authoringPreview.width) - Number(previewWidths.get(String(entry.presentationValue)))) > 0.01;
        })) issues.push(`responsive-authoring-preview-drift:${target.targetId}`);
        const legacyExisting = target.responsive.componentSetTopology.setIdentityPolicy === 'existing' &&
          target.responsive.componentSetTopology.preservedMembers === undefined && target.responsive.componentSetTopology.createdMembers.length > 0 &&
          target.responsive.componentSetTopology.createdMembers.every((member) => member.nodeId !== undefined);
        const pinnedFactIds = new Set(topologyMembers.map((member) => member.nodeId).filter((id): id is string => typeof id === 'string'));
        if (target.responsive.componentSetTopology.setIdentityPolicy === 'existing' && topologyMembers.some((member) => {
          const fact = memberFacts.find((entry) => object(entry) && entry.presentationValue === member.presentationValue) as Record<string, unknown> | undefined;
          if (!fact) return true;
          if (canonicalVariantSelection(fact.variantSelection as VariantSelection) !== canonicalVariantSelection(memberVariantSelection(target.responsive!.componentSetTopology, member))) return true;
          // Same rule as the master identity check above: a declared create is proven
          // by carrying a NEW identity that the first run actually reported creating,
          // never by matching an id the manifest could not know in advance.
          if (member.nodeId === undefined) {
            return createdIdentityInvalid(fact, pinnedFactIds) ||
              (expectedRun === 'first' && !createdIds.includes(String(fact.nodeId)));
          }
          return fact.nodeId !== member.nodeId || (!legacyExisting && fact.componentKey !== member.componentKey);
        })) issues.push(`responsive-member-identity-drift:${target.targetId}`);
        // Additive members are clones and must remain structurally equivalent
        // to their historical source. Existing multi-axis sets legitimately
        // contain different Style/Colonnes structures; their preservation is
        // proven per identity/path by before→after protected-fact captures.
        if (target.responsive.componentSetTopology.setIdentityPolicy !== 'existing') {
          const baseline = comparableResponsiveMemberFacts(memberFacts.find((entry) => object(entry) && entry.presentationValue === target.responsive!.componentSetTopology.historicalMember.presentationValue) as Record<string, unknown>);
          if (memberFacts.some((entry) => !object(entry) || comparableResponsiveMemberFacts(entry) !== baseline)) issues.push(`responsive-member-facts-drift:${target.targetId}`);
        }
      }
      const propagated = Array.isArray(candidate.propagatedDeltas) ? candidate.propagatedDeltas.filter(object) : [];
      const expectedPropagated = target.responsive.expectedPropagatedDeltas ?? [];
      const propagatedKey = (entry: Record<string, unknown> | ExpectedPropagatedDelta): string =>
        `${String(entry.surfaceId)}\0${String(entry.nodeId)}\0${String(entry.sourceNodeId)}\0${String(entry.fact)}\0${String(entry.attribution)}`;
      const expectedKeys = expectedPropagated.map((entry) => propagatedKey(entry)).sort();
      const actualKeys = propagated.map((entry) => propagatedKey(entry)).sort();
      if (JSON.stringify(expectedKeys) !== JSON.stringify(actualKeys) || propagated.some((entry) => entry.status !== 'attributed')) {
        issues.push(`propagated-delta-unattributed:${target.targetId}`);
      }
      continue;
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
