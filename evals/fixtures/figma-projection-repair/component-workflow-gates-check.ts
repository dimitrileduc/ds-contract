import { validateRepairCampaign } from '../../../extract/figma/projection-repair/campaign.js';
import { assertComponentTopology } from '../../../extract/figma/projection-repair/capture.js';
import { REQUIRED_COMPONENT_PROTECTION_FACTS } from '../../../extract/figma/projection-repair/types.js';
import { organismContainerIssues } from '../../../extract/figma/projection-repair/audit.js';

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
    preconditions: [{ field: 'nodeId', equals: '2151:5552' }], changes: { layoutSizingHorizontal: 'FILL' },
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

const containedMaster = { id: '1:1', type: 'COMPONENT', layoutSizingHorizontal: 'FILL' };
const localContainer = { id: '1:2', type: 'FRAME', name: 'Container · HeroVideo', layoutMode: 'HORIZONTAL', children: [containedMaster] };
if (organismContainerIssues(containedMaster, localContainer).length !== 0) throw new Error('valid organism Container was refused');
const missingContainer = organismContainerIssues({ ...containedMaster, layoutSizingHorizontal: 'FIXED' }, { id: '1:3', type: 'SECTION', name: 'Hero vidéo', children: [containedMaster] });
if (missingContainer.length < 3) throw new Error('missing Container/FILL gates were not reported');

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
refuse(noBackup, 'campaign-shape', 'missing source baseline');

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

console.log('✔ component workflow gates: one organism, local Container/FILL, source backup, protected facts, Page denylist, master uniqueness and consumer cardinality');
