import { normalizeBridgeApplyEnvelope, validateLiveApplyReceipt } from '../../../extract/figma/projection-repair/apply-receipt.js';

const campaign = {
  schemaVersion: '2.0.0', campaignId: 'repair-hero-video-pilot',
  filePin: { fileKey: 'd9FYAUcqdcNtsuaMgLefvJ', versionId: '2386120715962664149' },
  targets: [{ targetId: 'hero-video', masterNodeId: '2151:5552', expectedVariantNames: [], responsiveWidths: [1440] }],
} as never;
const plan = {
  campaignId: 'repair-hero-video-pilot', filePin: '2386120715962664149', state: 'ready-to-apply',
  operations: [{
    operationId: 'amend-hero-video', targetId: 'hero-video', mechanism: 'generated-amend', nodeId: '2151:5552',
    structuralPath: null, changes: {}, preconditions: [], postconditions: [], source: 'campaign.allowlist',
  }],
} as never;

const first = {
  schemaVersion: '1.0.0', campaignId: 'repair-hero-video-pilot', fileKey: 'd9FYAUcqdcNtsuaMgLefvJ',
  fileVersionId: '2386120715962664149', run: 'first', pageWrites: [],
  operations: [{ operationId: 'amend-hero-video', targetId: 'hero-video', nodeId: '2151:5552', status: 'amended', createdNodeIds: ['9:1'], changedNodeIds: ['2151:5552'] }],
  masters: [{ targetId: 'hero-video', nodeId: '2151:5552', componentKey: 'historical-key', masterCount: 1, variantNames: [] }],
  responsiveChecks: [{ targetId: 'hero-video', width: 1440, overflow: false, screenshotRef: 'proofs/hero-video-1440.png' }],
};

const second = {
  ...structuredClone(first), run: 'second',
  operations: [{ operationId: 'amend-hero-video', targetId: 'hero-video', nodeId: '2151:5552', status: 'no-op', createdNodeIds: [], changedNodeIds: [] }],
};

if (!validateLiveApplyReceipt(first, campaign, plan, 'first').ok) throw new Error('valid first apply receipt refused');
if (!validateLiveApplyReceipt(second, campaign, plan, 'second').ok) throw new Error('valid second no-op receipt refused');

const nativeFirst = {
  schemaVersion: '1.0.0', campaignId: first.campaignId, fileKey: first.fileKey, fileVersionId: first.fileVersionId, run: 'first',
  scriptResults: [{ operationId: 'amend-hero-video', targetId: 'hero-video', nodeId: '2151:5552', result: { amended: true, createdNodeIds: ['9:1'] } }],
  inspection: { masters: first.masters, pageWrites: [], responsiveChecks: first.responsiveChecks },
};
const normalizedFirst = normalizeBridgeApplyEnvelope(nativeFirst, campaign, plan, 'first');
if (!validateLiveApplyReceipt(normalizedFirst, campaign, plan, 'first').ok || normalizedFirst.operations[0].status !== 'amended') {
  throw new Error('native amended bridge result did not normalize');
}
const nativeSecond = structuredClone(nativeFirst);
nativeSecond.run = 'second';
nativeSecond.scriptResults[0].result = { skipped: true, reason: 'unchanged', createdNodeIds: [] };
const normalizedSecond = normalizeBridgeApplyEnvelope(nativeSecond, campaign, plan, 'second');
if (!validateLiveApplyReceipt(normalizedSecond, campaign, plan, 'second').ok || normalizedSecond.operations[0].status !== 'no-op') {
  throw new Error('native unchanged bridge result did not normalize to a strict no-op');
}

function refuse(label: string, value: unknown, run: 'first' | 'second', issue: string): void {
  const result = validateLiveApplyReceipt(value, campaign, plan, run);
  if (result.ok || !result.issues.some((entry) => entry.includes(issue))) throw new Error(`${label}: ${issue} was not refused`);
}

refuse('Page mutation', { ...structuredClone(first), pageWrites: ['2170:6351'] }, 'first', 'page-writes');
refuse('duplicate master', { ...structuredClone(first), masters: [{ ...first.masters[0], masterCount: 2 }] }, 'first', 'master-drift');
refuse('variant drift', { ...structuredClone(first), masters: [{ ...first.masters[0], variantNames: ['Width=1440'] }] }, 'first', 'master-drift');
refuse('missing operation', { ...structuredClone(first), operations: [] }, 'first', 'operation-cardinality');
refuse('responsive overflow', { ...structuredClone(first), responsiveChecks: [{ ...first.responsiveChecks[0], overflow: true }] }, 'first', 'responsive-check');
const documentedOverflowCampaign = structuredClone(campaign) as any;
documentedOverflowCampaign.targets[0].allowedFactChanges = ['responsive-overflow'];
const documentedOverflow = structuredClone(first) as any;
documentedOverflow.responsiveChecks[0] = {
  ...documentedOverflow.responsiveChecks[0], overflow: true,
  overflowNodeIds: ['12:34'], overflowIssues: [{ nodeId: '12:34', reason: 'container' }],
};
if (!validateLiveApplyReceipt(documentedOverflow, documentedOverflowCampaign, plan, 'first').ok) {
  throw new Error('explicitly allowed and fully documented responsive overflow was refused');
}
const undocumentedOverflow = structuredClone(documentedOverflow);
undocumentedOverflow.responsiveChecks[0].overflowIssues = [];
const undocumentedResult = validateLiveApplyReceipt(undocumentedOverflow, documentedOverflowCampaign, plan, 'first');
if (undocumentedResult.ok || !undocumentedResult.issues.includes('responsive-check:hero-video')) {
  throw new Error('allowed but undocumented responsive overflow was accepted');
}
refuse('second apply created node', {
  ...structuredClone(second), operations: [{ ...second.operations[0], status: 'amended', createdNodeIds: ['9:2'] }],
}, 'second', 'second-run-mutated');

console.log('✔ live apply receipts refuse Page writes, duplicate/variant drift, missing operations, undocumented overflow and any non-no-op second run');
