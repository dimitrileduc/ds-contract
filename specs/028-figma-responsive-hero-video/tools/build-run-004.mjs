import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(root, 'specs/component-repairs/hero-video/run-003/campaign.json');
const outputRoot = path.join(root, 'specs/component-repairs/hero-video/run-004');
const outputPath = path.join(outputRoot, 'campaign.json');
const versionId = '2391931922674193920';
const capturedAt = '2026-08-26T08:10:00.000Z';

const campaign = JSON.parse(readFileSync(sourcePath, 'utf8'));
campaign.campaignId = 'figma-responsive-hero-video-run-004';
campaign.createdAt = capturedAt;
campaign.state = 'draft';
campaign.filePin = {
  fileKey: 'd9FYAUcqdcNtsuaMgLefvJ',
  versionId,
  fileName: 'Piqueray (Copy)',
  capturedAt,
  pinStatus: 'fresh read-only pin for owner-approved authoring-preview correction',
};
campaign.authorityRefs = [...new Set([
  ...campaign.authorityRefs,
  'specs/028-figma-responsive-hero-video/decisions/H3-authoring-preview-correction.json',
])];

const replaceRunPath = (value) => typeof value === 'string' ? value.replaceAll('run-003', 'run-004') : value;
campaign.workflow.evidenceRoot = replaceRunPath(campaign.workflow.evidenceRoot);
campaign.workflow.comparisonPath = replaceRunPath(campaign.workflow.comparisonPath);
campaign.workflow.applyReceiptPaths.first = replaceRunPath(campaign.workflow.applyReceiptPaths.first);
campaign.workflow.applyReceiptPaths.second = replaceRunPath(campaign.workflow.applyReceiptPaths.second);

const target = campaign.targets[0];
target.reference.figmaVersionId = versionId;
target.reference.sourceKind = 'current-owner-approved-correction';
target.reference.decisionRef = 'specs/028-figma-responsive-hero-video/decisions/H3-authoring-preview-correction.json';
target.projectionDefectIds = ['responsive-authoring-preview-widths'];
const topology = target.responsive.componentSetTopology;
topology.setIdentityPolicy = 'existing';
topology.setNodeId = '2580:7392';
topology.defaultPresentationValue = 'Wide';
topology.authoringLayout = {
  direction: 'VERTICAL',
  gap: 48,
  order: ['Wide', 'Compact', 'Desktop'],
};
topology.historicalMember.authoringPreviewWidth = 1728;
for (const member of topology.createdMembers) {
  if (member.presentationValue === 'Compact') {
    member.nodeId = '2580:7378';
    member.authoringPreviewWidth = 390;
  } else if (member.presentationValue === 'Desktop') {
    member.nodeId = '2580:7385';
    member.authoringPreviewWidth = 1200;
  } else {
    throw new Error(`Unexpected responsive member ${member.presentationValue}`);
  }
}
target.responsive.expectedCreates = [];
for (const layout of target.responsive.presentationLayouts) {
  if (layout.nodePath === '') layout.properties.layoutSizingHorizontal = 'FIXED';
}

campaign.writeBoundary.allowedExistingNodeIds = [
  '2448:4731',
  '2580:7392',
  '2580:7378',
  '2580:7385',
  '2151:5552',
];
campaign.writeBoundary.expectedChangedNodeIds = [...campaign.writeBoundary.allowedExistingNodeIds];
campaign.writeBoundary.allowedCreateRoles = [];
campaign.allowedOperations = [{
  ...campaign.allowedOperations[0],
  operationId: 'correct-responsive-authoring-previews',
  expectedPostconditions: [
    { field: 'set.layoutMode', equals: 'NONE' },
    { field: 'Compact.authoringPreviewWidth', equals: 390 },
    { field: 'Desktop.authoringPreviewWidth', equals: 1200 },
    { field: 'Wide.authoringPreviewWidth', equals: 1728 },
    { field: 'pageWrites', equals: [] },
    { field: 'childWrites', equals: [] },
  ],
}];

const masterSurface = campaign.affectedSurfaces.find((surface) => surface.surfaceId === 'hero-video:master');
masterSurface.nodeId = '2580:7392';
masterSurface.expectedSize = { width: 1728, height: 1914 };
masterSurface.writePolicy = 'set-and-member-roots-only-after-owner-go';
campaign.captureSets = {
  before: {
    captureSetId: `figma-responsive-hero-video-run-004-before-${versionId}`,
    phase: 'before',
    fileVersionId: versionId,
    artifacts: [],
    imageFingerprints: [],
    instanceLinks: [],
    complete: false,
  },
};
campaign.consumerImpacts = [];

for (const directory of ['audit', 'before', 'after', 'idempotence', 'receipts', 'verify']) {
  mkdirSync(path.join(outputRoot, directory), { recursive: true });
}
writeFileSync(outputPath, `${JSON.stringify(campaign, null, 2)}\n`);
console.log(path.relative(root, outputPath));
