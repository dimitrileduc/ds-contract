/**
 * 030 US1 — inherited size locks are named at PREFLIGHT, not discovered at apply.
 *
 * The 029 receipt this pins: a 744 px inherited width floor on the Superpose member
 * cost 33 minutes and a manual restore, because the runner only met it AFTER the
 * mutation was posed (retro, puits secondaire B). The gate moves the meeting earlier.
 *
 * Three claims, each adversarial:
 *   1. a floor/ceiling on a target surface or one of its ancestors BLOCKS, and the
 *      refusal names node, property, value and the node the lock is inherited from;
 *   2. the same lock covered by a `lockWaivers[]` entry that references an owner
 *      decision passes — and a waiver WITHOUT that reference is refused by the
 *      campaign validation itself, so the runner can never exempt itself;
 *   3. `layoutSizingHorizontal: FIXED` on a variant's OWN authoring root is not a
 *      lock. It is the catalogue convention the runner already validates
 *      (`responsive-authoring-preview-required`), and a gate that refused it would
 *      refuse every responsive campaign in the repository.
 */
import {
  buildPreflightLockReport,
  preflightLockRefusal,
  validateRepairCampaign,
} from '../../../extract/figma/projection-repair/campaign.js';
import { collectNodeSizeLocks } from '../../../extract/figma/projection-repair/facts.js';
import { REQUIRED_COMPONENT_PROTECTION_FACTS } from '../../../extract/figma/projection-repair/types.js';

const clone = <T>(value: T): T => structuredClone(value);
const INSPECTED_AT = '2026-08-27T09:00:00.000Z';

/* ------------------------------------------------------------------ relevé */
// A REST node exposing the two shapes the retro measured: an explicit width floor,
// and a FIXED authoring root. `collectNodeSizeLocks` reads a node, never a tree —
// the ancestor walk belongs to preflight, which owns the tree.
const memberWithFloor = {
  id: '2115:4273', type: 'COMPONENT', name: 'Style=Superpose, Colonnes=2',
  layoutMode: 'HORIZONTAL', layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'HUG',
  minWidth: 744,
  absoluteBoundingBox: { x: 0, y: 0, width: 1728, height: 468 },
};
const observedLocks = collectNodeSizeLocks(memberWithFloor);
if (!observedLocks.some((lock) => lock.property === 'minWidth' && lock.value === 744 && lock.nodeId === '2115:4273')) {
  throw new Error(`the 744 px width floor was not read from the node: ${JSON.stringify(observedLocks)}`);
}
if (!observedLocks.some((lock) => lock.property === 'fixedWidth' && lock.value === 1728)) {
  throw new Error('a FIXED authoring root was not reported as a fixed-width fact');
}
const cleanMember = { ...memberWithFloor, minWidth: undefined, layoutSizingHorizontal: 'FILL' };
if (collectNodeSizeLocks(cleanMember).length !== 0) {
  throw new Error('a FILL member with no floor reported a lock out of thin air');
}

/* ---------------------------------------------------------------- campaign */
const campaign = {
  schemaVersion: '2.0.0',
  campaignId: 'lock-preflight-fixture',
  workflow: {
    mode: 'single-component', subjectKind: 'organism',
    evidenceRoot: 'specs/component-repairs/fixture/run-001',
    ownerDecisionRoot: 'specs/component-repairs/fixture/run-001/owner',
    comparisonPath: 'specs/component-repairs/fixture/run-001/comparison.json',
    applyReceiptPaths: {
      first: 'specs/component-repairs/fixture/run-001/apply-first.json',
      second: 'specs/component-repairs/fixture/run-001/apply-second.json',
    },
    pageMutationPolicy: 'forbid-direct', directDependencies: [], sharedDependencies: [],
  },
  filePin: { fileKey: 'd9FYAUcqdcNtsuaMgLefvJ', versionId: '2392091518820622154', capturedAt: INSPECTED_AT },
  authorityRefs: ['specs/029-figma-responsive-categories/RETRO-PROCESS.md'],
  targets: [{
    targetId: 'fixture-section', kind: 'generated-master', masterNodeId: '2115:4277',
    reference: {
      referenceId: 'fixture-reference', sourceKind: 'historical-version', subjectNodeId: '2115:4277',
      visualFacts: ['four-member existing set'], decisionRef: 'specs/029-figma-responsive-categories/RETRO-PROCESS.md',
    },
    affectedSurfaceIds: ['fixture-section:master', 'fixture-section:variant:superpose-2'],
    projectionDefectIds: ['responsive-fill'], allowedFields: ['layoutSizingHorizontal'],
    protectedFacts: [...REQUIRED_COMPONENT_PROTECTION_FACTS],
    allowedFactChanges: ['geometry', 'responsive-overflow'],
    expectedMasterName: 'FixtureSection', expectedVariantNames: ['Style=Superpose, Colonnes=2'],
    responsiveWidths: [1440],
  }],
  affectedSurfaces: [
    { surfaceId: 'fixture-section:master', targetId: 'fixture-section', role: 'master', nodeId: '2115:4277', pageComposition: null, structuralPath: '0', expectedSize: { width: 1728, height: 2504 }, impactStatus: 'pending' },
    { surfaceId: 'fixture-section:variant:superpose-2', targetId: 'fixture-section', role: 'variant', nodeId: '2115:4273', pageComposition: null, structuralPath: 'Style=Superpose, Colonnes=2', expectedSize: { width: 1728, height: 468 }, impactStatus: 'pending' },
  ],
  consumerImpacts: [],
  allowedOperations: [{
    operationId: 'fixture-op', targetId: 'fixture-section', mechanism: 'set-properties', nodeId: '2115:4273',
    structuralPath: '0', preconditions: [{ field: 'structuralPath', equals: '0' }],
    changes: { layoutSizingHorizontal: 'FILL' }, expectedPostconditions: [{ field: 'layoutSizingHorizontal', equals: 'FILL' }],
  }],
  captureSets: { before: { captureSetId: 'before', phase: 'before', fileVersionId: '2392091518820622154', artifacts: [], imageFingerprints: [], instanceLinks: [], complete: false } },
  state: 'draft',
  createdAt: INSPECTED_AT,
};

const baseline = validateRepairCampaign(campaign);
if (!baseline.ok) throw new Error(`fixture campaign is not valid: ${baseline.issues.map((entry) => `${entry.code}@${entry.path}`).join(', ')}`);

/* --------------------------------------------------------- 1. it blocks */
// The lock is carried by an ANCESTOR of the variant: exactly the 029 shape, where the
// floor lived above the member and the verification met it only after the pose.
const observed = [{
  surfaceId: 'fixture-section:variant:superpose-2',
  nodeId: '2115:4273',
  locks: [
    { nodeId: '2115:4270', property: 'minWidth' as const, value: 744 },
    { nodeId: '2115:4273', property: 'fixedWidth' as const, value: 1728 },
  ],
}];

const blocked = buildPreflightLockReport(campaign as never, observed, INSPECTED_AT);
if (blocked.blocking.length !== 1) {
  throw new Error(`expected exactly one blocking lock, got ${blocked.blocking.length}: ${JSON.stringify(blocked)}`);
}
if (blocked.locks.length !== 1 || blocked.locks[0].property !== 'minWidth' || blocked.locks[0].value !== 744 ||
  blocked.locks[0].inheritedFrom !== '2115:4270' || blocked.locks[0].nodeId !== '2115:4273' ||
  blocked.locks[0].surfaceId !== 'fixture-section:variant:superpose-2') {
  throw new Error(`the lock report does not name node/property/value/inheritance: ${JSON.stringify(blocked.locks)}`);
}
const refusal = preflightLockRefusal(blocked);
if (!refusal) throw new Error('a blocking lock produced no refusal');
for (const fragment of ['inherited-size-lock', '2115:4273', 'minWidth', '744', '2115:4270']) {
  if (!refusal.includes(fragment)) throw new Error(`refusal does not quote ${fragment}: ${refusal}`);
}

/* ------------------------------------------- 3. an own FIXED root is not a lock */
// Reported as observed, classified as no lock at all. A gate that blocked here would
// block every campaign in the repository, since the authoring catalogue REQUIRES it.
const onlyOwnFixed = buildPreflightLockReport(campaign as never, [{
  surfaceId: 'fixture-section:variant:superpose-2', nodeId: '2115:4273',
  locks: [{ nodeId: '2115:4273', property: 'fixedWidth' as const, value: 1728 }],
}], INSPECTED_AT);
if (onlyOwnFixed.locks.length !== 0 || onlyOwnFixed.blocking.length !== 0) {
  throw new Error('a variant root FIXED by the authoring catalogue convention was reported as an inherited lock');
}
if (preflightLockRefusal(onlyOwnFixed) !== null) throw new Error('a campaign with no inherited lock was refused anyway');

// A fixed size carried by an ANCESTOR is a different fact and does block — that is the
// "cartes re-fixées par héritage" sub-defect the 029 section apply hit.
const inheritedFixed = buildPreflightLockReport(campaign as never, [{
  surfaceId: 'fixture-section:variant:superpose-2', nodeId: '2115:4273',
  locks: [{ nodeId: '2115:4270', property: 'fixedWidth' as const, value: 744 }],
}], INSPECTED_AT);
if (inheritedFixed.blocking.length !== 1) throw new Error('a width fixed by an ancestor did not block');

/* ------------------------------------------------- 2. a referenced waiver passes */
const waived = clone(campaign) as typeof campaign & { lockWaivers?: unknown[] };
waived.lockWaivers = [{
  nodeId: '2115:4270', property: 'minWidth', value: 744,
  reason: 'Le plancher est conservé sur ce lot, la section n’est pas encore full-width.',
  decisionRef: 'specs/029-figma-responsive-categories/decisions/H3-mutation.json',
}];
const waivedValidation = validateRepairCampaign(waived);
if (!waivedValidation.ok) throw new Error(`a referenced waiver was refused: ${waivedValidation.issues.map((entry) => `${entry.code}@${entry.path}`).join(', ')}`);
const waivedReport = buildPreflightLockReport(waived as never, observed, INSPECTED_AT);
if (waivedReport.locks.length !== 1 || waivedReport.blocking.length !== 0 || waivedReport.waived.length !== 1) {
  throw new Error(`a covered lock still blocked: ${JSON.stringify(waivedReport)}`);
}
if (waivedReport.waived[0].waiverRef !== 'specs/029-figma-responsive-categories/decisions/H3-mutation.json') {
  throw new Error('the waived entry does not point at the owner decision that grants it');
}
if (preflightLockRefusal(waivedReport) !== null) throw new Error('a fully waived report still refused');

// The runner never exempts itself: a waiver with no owner decision behind it is
// refused by the campaign validation, before the lock gate is even consulted.
const unreferenced = clone(waived);
delete (unreferenced.lockWaivers as Array<Record<string, unknown>>)[0].decisionRef;
const unreferencedValidation = validateRepairCampaign(unreferenced);
if (unreferencedValidation.ok || !unreferencedValidation.issues.some((entry) => entry.path.endsWith('.decisionRef'))) {
  throw new Error('a lock waiver with no owner decision reference was accepted');
}

// A waiver for a DIFFERENT lock does not cover this one.
const mismatched = clone(waived);
(mismatched.lockWaivers as Array<Record<string, unknown>>)[0].value = 320;
const mismatchedReport = buildPreflightLockReport(mismatched as never, observed, INSPECTED_AT);
if (mismatchedReport.blocking.length !== 1) throw new Error('a waiver for another value silently covered the lock');

/* --------------------------- a declared removal is a declaration, not a blocker */
// `presentationLayouts[].properties.minWidth: null` is the closed removal-only
// capability the workflow doc already describes. A campaign that declares it is
// already planning to shed the floor, so the gate records it as declared instead of
// refusing the very repair that fixes it.
const removes = clone(campaign) as typeof campaign & {
  targets: Array<Record<string, unknown>>;
  writeBoundary?: unknown;
};
removes.targets[0].responsive = {
  componentSetTopology: {
    propertyName: 'Style', setName: 'FixtureSection', setIdentityPolicy: 'existing',
    setNodeId: '2115:4277', setComponentKey: 'k'.repeat(40), defaultPresentationValue: 'Superpose',
    authoringLayout: { direction: 'VERTICAL', gap: 0, order: ['Superpose'] },
    historicalMember: { presentationValue: 'Superpose', nodeId: '2115:4273', componentKey: 'm'.repeat(40), declaredName: 'Style=Superpose, Colonnes=2', authoringPreviewWidth: 1728 },
    preservedMembers: [], createdMembers: [], expectedMemberNames: ['Style=Superpose, Colonnes=2'],
  },
  expectedCreates: [],
  contentFixtures: [{ fixtureId: 'normal', textValues: {} }],
  presentationScenarios: [{ scenarioId: 's1', presentationValue: 'Superpose', width: 1440, height: 900, fixtureId: 'normal', expectedOverflow: false }],
  presentationLayouts: [{ presentationValue: 'Superpose', nodePath: '', properties: { layoutSizingHorizontal: 'FIXED', minWidth: null } }],
  primitiveBindings: [], typographyOverrides: [],
};
removes.allowedOperations = [{
  operationId: 'fixture-op', targetId: 'fixture-section', mechanism: 'responsive-component-set', nodeId: '2115:4277',
  structuralPath: '', preconditions: [{ field: 'nodeId', equals: '2115:4277' }],
  changes: { capability: 'responsive-component-set' },
  expectedPostconditions: [{ field: 'pageWrites', equals: [] }],
}] as never;
removes.writeBoundary = {
  allowedExistingNodeIds: ['2115:4277', '2115:4273'], expectedChangedNodeIds: ['2115:4277', '2115:4273'],
  readOnlySurfaceNodeIds: [], protectedDependencyNodeIds: [], protectedChildNodeIds: [],
  protectedChildPaths: [], allowedCreateRoles: [], pageWrites: [], childWrites: [],
};
const removesValidation = validateRepairCampaign(removes);
if (!removesValidation.ok) throw new Error(`declared-removal fixture is not valid: ${removesValidation.issues.map((entry) => `${entry.code}@${entry.path}`).join(', ')}`);
const removesReport = buildPreflightLockReport(removes as never, [{
  surfaceId: 'fixture-section:variant:superpose-2', nodeId: '2115:4273',
  locks: [{ nodeId: '2115:4273', property: 'minWidth' as const, value: 744 }],
}], INSPECTED_AT);
if (removesReport.blocking.length !== 0 || removesReport.waived.length !== 1) {
  throw new Error(`a floor the campaign declares it removes was still blocking: ${JSON.stringify(removesReport)}`);
}
if (!removesReport.waived[0].waiverRef.startsWith('presentationLayouts:')) {
  throw new Error('a declared removal was not attributed to the layout that declares it');
}

console.log('✔ inherited size locks: floors/ceilings and ancestor-fixed sizes named at preflight with node/property/value/inheritance BEFORE any dry-run, a variant root FIXED by the catalogue convention is not a lock, a declared minWidth:null removal is recorded as declared, and a waiver only lifts a lock when it references an owner decision');
