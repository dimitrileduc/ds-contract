/** The bounded Figma text-align repair must be executable twice. */
import { emitBridgeApplyScript } from '../../extract/figma/projection-repair/bridge-script.js';

const campaign = {
  schemaVersion: '2.0.0',
  campaignId: 'section-header-text-align-fixture',
  filePin: { fileKey: 'd9FYAUcqdcNtsuaMgLefvJ', versionId: '2390986664230741536', capturedAt: '2026-08-23T20:00:00Z' },
  state: 'ready-to-apply',
  authorityRefs: ['contracts/section-header.contract.json'],
  workflow: {
    mode: 'single-component', subjectKind: 'shared-component', pageMutationPolicy: 'forbid-direct',
    evidenceRoot: 'evals/fixtures/tmp', ownerDecisionRoot: 'evals/fixtures/tmp/owner', comparisonPath: 'evals/fixtures/tmp/comparison.json',
    applyReceiptPaths: { first: 'evals/fixtures/tmp/first.json', second: 'evals/fixtures/tmp/second.json' },
    directDependencies: [], sharedDependencies: [],
  },
  targets: [{
    targetId: 'section-header', kind: 'shared-control', masterNodeId: '2090:2397', variantNodeIds: ['2090:2385'],
    reference: { referenceId: 'fixture', sourceKind: 'contract-and-history', subjectNodeId: '2090:2397', visualFacts: ['fixture'], decisionRef: 'contracts/section-header.contract.json' },
    affectedSurfaceIds: ['master'], projectionDefectIds: ['text-align'], allowedFields: ['textAlignHorizontal'],
    protectedFacts: ['master-identity', 'variant-cardinality', 'variant-names', 'image-paints', 'gradient-paints', 'text-content', 'text-ranges', 'instance-links', 'instance-overrides', 'page-node-identity', 'geometry', 'responsive-overflow'],
    allowedFactChanges: ['text-styles'], expectedMasterName: 'SectionHeader', expectedVariantNames: ['Alignement=Centre'], responsiveWidths: [768],
  }],
  affectedSurfaces: [{ surfaceId: 'master', targetId: 'section-header', role: 'master', nodeId: '2090:2397', pageComposition: null, structuralPath: '', expectedSize: { width: 1550, height: 83 }, impactStatus: 'pending' }],
  consumerImpacts: [],
  allowedOperations: [],
  captureSets: { before: { captureSetId: 'before', phase: 'before', fileVersionId: '2390986664230741536', artifacts: [], imageFingerprints: [], instanceLinks: [], complete: false } },
} as any;
const plan = {
  campaignId: campaign.campaignId,
  filePin: campaign.filePin.versionId,
  state: 'ready-to-apply',
  operations: [{
    operationId: 'centre-title', targetId: 'section-header', mechanism: 'set-properties', nodeId: '2090:2397', structuralPath: '0/1',
    preconditions: [{ field: 'textAlignHorizontal', equals: 'LEFT' }], changes: { textAlign: { value: 'CENTER' } }, postconditions: [], source: 'fixture',
  }],
} as any;

const script = emitBridgeApplyScript(campaign, plan, 'second');
for (const expected of [
  "const textAlignAlreadyApplied = INPUT.run === 'second'",
  'node.textAlignHorizontal === changes.textAlign.value',
  'if (!textAlignAlreadyApplied) assertOperationPreconditions(node, root, operation);',
]) {
  if (!script.includes(expected)) throw new Error(`text-align bridge second-run guard missing: ${expected}`);
}
console.log('section-header-text-align-bridge-idempotence ok: a satisfied text-align postcondition is a bounded second-run no-op');
