import { validateRepairCampaign } from '../../../extract/figma/projection-repair/campaign.js';
import { assertComponentTopology } from '../../../extract/figma/projection-repair/capture.js';
import { REQUIRED_COMPONENT_PROTECTION_FACTS } from '../../../extract/figma/projection-repair/types.js';
import { expectedChildOrderIssues, organismContainerIssues } from '../../../extract/figma/projection-repair/audit.js';
import { validateBridgeOperation } from '../../../extract/figma/projection-repair/bridge-script.js';

const clone = <T>(value: T): T => structuredClone(value);
const objectId = 'a'.repeat(40);

const campaign = {
  schemaVersion: '2.0.0',
  campaignId: 'repair-hero-video-pilot',
  sourceBaseline: {
    gitHead: objectId,
    worktreeTree: 'b'.repeat(40),
    backupRef: 'refs/codex/backups/repair-hero-video-pilot',
    capturedAt: '2026-08-11T12:00:00.000Z',
  },
  workflow: {
    mode: 'single-component',
    subjectKind: 'organism',
    evidenceRoot: 'specs/component-repairs/hero-video/run-001',
    ownerDecisionRoot: 'specs/component-repairs/hero-video/run-001/owner',
    comparisonPath: 'specs/component-repairs/hero-video/run-001/comparison.json',
    applyReceiptPaths: {
      first: 'specs/component-repairs/hero-video/run-001/apply-first.json',
      second: 'specs/component-repairs/hero-video/run-001/apply-second.json',
    },
    pageMutationPolicy: 'forbid-direct',
    directDependencies: [],
    sharedDependencies: [],
  },
  filePin: { fileKey: 'd9FYAUcqdcNtsuaMgLefvJ', versionId: '2386120715962664149', capturedAt: '2026-08-11T12:00:00.000Z' },
  authorityRefs: ['specs/021-figma-projection-repair/proofs/hero-video-recovery.json'],
  targets: [{
    targetId: 'hero-video',
    kind: 'generated-master',
    masterNodeId: '2151:5552',
    reference: {
      referenceId: 'hero-video-owner-reference', sourceKind: 'contract-and-history', subjectNodeId: '2151:5552',
      visualFacts: ['1728×720', 'poster and two gradients'], decisionRef: 'specs/021-figma-projection-repair/proofs/hero-video-recovery.json',
    },
    affectedSurfaceIds: ['hero-video:master', 'hero-video:page:2170-6351', 'hero-video:page-context:210-328'],
    projectionDefectIds: ['responsive-fill'],
    allowedFields: ['layoutSizingHorizontal', 'itemSpacing'],
    protectedFacts: [...REQUIRED_COMPONENT_PROTECTION_FACTS],
    allowedFactChanges: ['geometry', 'responsive-overflow', 'video-paints'],
    expectedMasterName: 'HeroVideo',
    expectedVariantNames: [],
    responsiveWidths: [1440],
  }],
  affectedSurfaces: [
    { surfaceId: 'hero-video:master', targetId: 'hero-video', role: 'master', nodeId: '2151:5552', pageComposition: null, structuralPath: '0', expectedSize: { width: 1728, height: 720 }, impactStatus: 'pending' },
    { surfaceId: 'hero-video:page:2170-6351', targetId: 'hero-video', role: 'page-instance', nodeId: '2170:6351', pageComposition: 'Hero et catégories', structuralPath: '0', expectedSize: { width: 1728, height: 720 }, impactStatus: 'pending' },
    { surfaceId: 'hero-video:page-context:210-328', targetId: 'hero-video', role: 'page-context', nodeId: '210:328', pageComposition: 'Hero et catégories', structuralPath: '0', contextForSurfaceId: 'hero-video:page:2170-6351', expectedSize: { width: 1728, height: 1200 }, impactStatus: 'pending' },
  ],
  consumerImpacts: [],
  allowedOperations: [{
    operationId: 'amend-hero-video', targetId: 'hero-video', mechanism: 'generated-amend', nodeId: '2151:5552',
    preconditions: [{ field: 'nodeId', equals: '2151:5552' }], changes: { generatedScriptRef: 'figma-sync/35-hero-video.js' },
    expectedPostconditions: [{ field: 'masterNodeId', equals: '2151:5552' }],
  }],
  captureSets: { before: { captureSetId: 'before', phase: 'before', fileVersionId: '2386120715962664149', artifacts: [], imageFingerprints: [], instanceLinks: [], complete: false } },
  state: 'draft',
  createdAt: '2026-08-11T12:00:00.000Z',
};

function accept(value: unknown, label: string): void {
  const result = validateRepairCampaign(value);
  if (!result.ok) throw new Error(`${label}: ${result.issues.map((entry) => `${entry.code}@${entry.path}`).join(', ')}`);
}
function refuse(value: unknown, code: string, label: string): void {
  const result = validateRepairCampaign(value);
  if (result.ok || !result.issues.some((entry) => entry.code === code)) throw new Error(`${label}: ${code} was not refused`);
}

accept(campaign, 'valid single-component campaign');

const sharedComponent = clone(campaign);
sharedComponent.workflow.subjectKind = 'shared-component' as never;
sharedComponent.workflow.historicalTextDecisions = { '1:9': campaign.authorityRefs[0] };
sharedComponent.targets[0].kind = 'shared-control';
sharedComponent.allowedOperations = [{
  operationId: 'hug-shared-component', targetId: 'hero-video', mechanism: 'set-properties', nodeId: '2151:5552',
  structuralPath: '0', changes: { layout: { layoutSizingVertical: 'HUG' } },
  preconditions: [{ field: 'structuralPath', equals: '0' }], expectedPostconditions: [{ field: 'layoutSizingVertical', equals: 'HUG' }],
}];
accept(sharedComponent, 'valid shared-component campaign');

const ungovernedHistoricalText = clone(sharedComponent);
ungovernedHistoricalText.workflow.historicalTextDecisions['1:9'] = 'specs/absent-decision.json';
refuse(ungovernedHistoricalText, 'campaign-shape', 'undeclared historical text decision');

const sharedContainer = clone(sharedComponent);
sharedContainer.allowedOperations[0].mechanism = 'ensure-organism-container';
refuse(sharedContainer, 'operation-allowlist', 'shared component Container');

const genericLayoutOperation = {
  operationId: 'fill-local-dependency', targetId: 'hero-video', mechanism: 'set-properties', nodeId: '2151:5552',
  structuralPath: '3/0', changes: { layoutSizingHorizontal: 'FILL' },
  preconditions: [{ field: 'structuralPath', equals: '3/0' }], postconditions: [{ field: 'layoutSizingHorizontal', equals: 'FILL' }], source: 'campaign.allowlist',
} as const;
if (validateBridgeOperation(genericLayoutOperation as never).length !== 0) throw new Error('generic structural-path layout operation was refused');
const genericTextStyleOperation = {
  ...genericLayoutOperation, operationId: 'link-governed-style', structuralPath: '2/0',
  changes: { textStyle: { tokenPath: 'typography.titre-5.size', name: 'Titre 5' } },
} as const;
if (validateBridgeOperation(genericTextStyleOperation as never).length !== 0) throw new Error('marker-bound Text Style operation was refused');
const genericRichOperation = {
  ...genericLayoutOperation, operationId: 'restore-rich-ranges', structuralPath: '1/0',
  changes: { richText: { baseFont: { family: 'Montserrat', style: 'Regular' }, ranges: [{ start: 2, end: 5, font: { family: 'Montserrat', style: 'Bold' } }] } },
} as const;
if (validateBridgeOperation(genericRichOperation as never).length !== 0) throw new Error('bounded rich-range operation was refused');
const genericTextAlignOperation = {
  ...genericLayoutOperation, operationId: 'center-governed-text', structuralPath: '1/1',
  changes: { textAlign: { value: 'CENTER' } },
} as const;
if (validateBridgeOperation(genericTextAlignOperation as never).length !== 0) throw new Error('bounded text-align operation was refused');
if (validateBridgeOperation({ ...genericTextAlignOperation, changes: { textAlign: { value: 'MIDDLE' } } } as never).length === 0) throw new Error('unbounded text-align value was accepted');
if (validateBridgeOperation({ ...genericLayoutOperation, mechanism: 'generated-amend' } as never).length === 0) throw new Error('component-specific bridge mechanism was accepted');
const reorderChildrenOperation = {
  ...genericLayoutOperation, operationId: 'reorder-pinned-children', mechanism: 'reorder-children', structuralPath: '',
  changes: { childOrder: ['1:1', '1:2', '1:3'] },
} as const;
if (validateBridgeOperation(reorderChildrenOperation as never).length !== 0) throw new Error('bounded child reorder was refused');
if (validateBridgeOperation({ ...reorderChildrenOperation, changes: { childOrder: ['1:1', '1:1'] } } as never).length === 0) throw new Error('duplicate child ids were accepted');

const containedMaster = { id: '1:1', type: 'COMPONENT', layoutSizingHorizontal: 'FILL' };
const localContainer = { id: '1:2', type: 'FRAME', name: 'Container · HeroVideo', layoutMode: 'HORIZONTAL', children: [containedMaster] };
if (organismContainerIssues(containedMaster, localContainer).length !== 0) throw new Error('valid organism Container was refused');
const missingContainer = organismContainerIssues({ ...containedMaster, layoutSizingHorizontal: 'FIXED' }, { id: '1:3', type: 'SECTION', name: 'Hero vidéo', children: [containedMaster] });
if (missingContainer.length < 3) throw new Error('missing Container/FILL gates were not reported');

const orderedCampaign = clone(campaign);
orderedCampaign.allowedOperations[0].expectedPostconditions = [
  { field: 'childOrder', equals: ['Background', 'Voile', 'Container'] },
] as never;
const wrongBackdropOrder = { children: [{ name: 'Voile' }, { name: 'Background' }, { name: 'Container' }] };
if (expectedChildOrderIssues(orderedCampaign as never, 'hero-video', wrongBackdropOrder).length !== 1) {
  throw new Error('declared childOrder drift was not reported by the audit gate');
}
const correctBackdropOrder = { children: [{ name: 'Background' }, { name: 'Voile' }, { name: 'Container' }] };
if (expectedChildOrderIssues(orderedCampaign as never, 'hero-video', correctBackdropOrder).length !== 0) {
  throw new Error('declared childOrder was refused after convergence');
}

const batch = clone(campaign);
batch.targets.push({ ...clone(batch.targets[0]), targetId: 'footer', masterNodeId: '1:2' });
refuse(batch, 'target-coverage', 'batch mutation');

const pageWrite = clone(campaign);
pageWrite.allowedOperations[0].nodeId = '2170:6351';
refuse(pageWrite, 'operation-allowlist', 'direct Page write');

const missingFact = clone(campaign);
missingFact.targets[0].protectedFacts = missingFact.targets[0].protectedFacts.filter((fact) => fact !== 'gradient-paints');
refuse(missingFact, 'target-shape', 'unaccounted gradient protection');

const noBackup = clone(campaign) as typeof campaign & { sourceBaseline?: typeof campaign.sourceBaseline };
delete noBackup.sourceBaseline;
accept(noBackup, 'draft audit before source snapshot');

const unsafeGeneratedRef = clone(campaign);
unsafeGeneratedRef.allowedOperations[0].changes.generatedScriptRef = '../figma-sync/35-hero-video.js';
refuse(unsafeGeneratedRef, 'operation-allowlist', 'unsafe generated amend reference');

const liveNodes = new Map<string, Record<string, unknown>>([
  ['2151:5552', { id: '2151:5552', type: 'COMPONENT', name: 'HeroVideo' }],
  ['2170:6351', { id: '2170:6351', type: 'INSTANCE', name: 'HeroVideo usage', componentId: '2151:5552' }],
  ['210:328', { id: '210:328', type: 'FRAME', name: 'Hero et catégories' }],
]);
assertComponentTopology(campaign as never, liveNodes);

const duplicateNodes = new Map(liveNodes);
duplicateNodes.set('9:9', { id: '9:9', type: 'COMPONENT', name: 'HeroVideo' });
let duplicateRefused = false;
try { assertComponentTopology(campaign as never, duplicateNodes); } catch { duplicateRefused = true; }
if (!duplicateRefused) throw new Error('duplicate master was not refused');

const missingUsageNodes = new Map(liveNodes);
missingUsageNodes.delete('2170:6351');
let usageRefused = false;
try { assertComponentTopology(campaign as never, missingUsageNodes); } catch { usageRefused = true; }
if (!usageRefused) throw new Error('consumer cardinality drift was not refused');

console.log('✔ component workflow gates: one organism or shared component, audit-before-backup, bounded generated amend, scoped Container/FILL, protected facts, Page denylist, master uniqueness and consumer cardinality');
