import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = 'specs/component-repairs/google-reviews/run-001/campaign.json';
const outputPath = 'specs/component-repairs/google-reviews/run-002/campaign.json';
const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
const pin = '2386730476747356856';

const campaign = {
  schemaVersion: '2.0.0',
  campaignId: 'repair-google-reviews-height-auto',
  filePin: {
    ...source.filePin,
    versionId: pin,
    capturedAt: '2026-08-12T10:26:00.000Z',
  },
  authorityRefs: [
    'contracts/google-reviews.contract.json',
    'contracts/review-card.contract.json',
    'docs/organisms-responsive-decisions.md',
    'specs/006-google-reviews-block/decisions.md',
    'specs/component-repairs/google-reviews/run-001/apply-first.json',
    'specs/component-repairs/google-reviews/run-001/after/google-reviews_master.facts.json',
    'integrations/odoo/config/google-reviews.authoring.json',
    'integrations/odoo/config/inputs.lock.json',
    'specs/019-odoo-production-foundation/proofs/google-reviews-functional.json',
    'specs/component-repairs/google-reviews/run-002/repair-height-auto.js',
  ],
  workflow: {
    ...source.workflow,
    evidenceRoot: 'specs/component-repairs/google-reviews/run-002',
    ownerDecisionRoot: 'specs/component-repairs/google-reviews/run-002/owner',
    comparisonPath: 'specs/component-repairs/google-reviews/run-002/comparison.json',
    applyReceiptPaths: {
      first: 'specs/component-repairs/google-reviews/run-002/apply-first.json',
      second: 'specs/component-repairs/google-reviews/run-002/apply-second.json',
    },
  },
  targets: [{
    ...source.targets[0],
    reference: {
      ...source.targets[0].reference,
      visualFacts: [
        'the owner-approved Avis Google master keeps its 1552x328 nominal desktop appearance',
        'the root height is Auto/Hug with governed minimum height 328',
        'five equal native Grid columns remain intact and every Review-card fills its cell',
        'left and right controls remain absolute overlays outside the column calculation',
        'all eight Page instances preserve identity, content, media, component links and overrides',
        'the Odoo 19 ordered repeat can add a sixth card and the root grows to a second row',
        'the qualified Odoo consumer is repinned to ds.google-reviews 1.0.2',
      ],
    },
    projectionDefectIds: ['height-auto-root'],
    allowedFields: [
      'height',
      'minHeight',
      'primaryAxisSizingMode',
      'layoutSizingVertical',
      'specHash',
      'description',
    ],
    allowedFactChanges: ['geometry', 'responsive-overflow'],
  }],
  affectedSurfaces: source.affectedSurfaces.map((surface) => ({
    ...surface,
    impactStatus: 'pending',
  })),
  consumerImpacts: source.consumerImpacts.map((consumer) => ({
    ...consumer,
    status: 'pending',
    decisionRef: null,
  })),
  allowedOperations: [{
    operationId: 'repair-google-reviews-height-auto-in-place',
    targetId: 'google-reviews',
    mechanism: 'generated-amend',
    nodeId: '2178:7381',
    structuralPath: '',
    preconditions: [
      { field: 'nodeId', equals: '2178:7381' },
      { field: 'nodeName', equals: 'Avis Google' },
      { field: 'gridColumnCount', equals: 5 },
      { field: 'pageWrites', equals: 0 },
    ],
    changes: {
      generatedScriptRef: 'specs/component-repairs/google-reviews/run-002/repair-height-auto.js',
    },
    expectedPostconditions: [
      { field: 'primaryAxisSizingMode', equals: 'AUTO' },
      { field: 'layoutSizingVertical', equals: 'HUG' },
      { field: 'minHeightVariable', equals: 'size/google-reviews/root-h' },
      { field: 'nominalHeight', equals: 328 },
      { field: 'pageWrites', equals: 0 },
    ],
  }],
  captureSets: {
    before: {
      captureSetId: `repair-google-reviews-height-auto-before-${pin}`,
      phase: 'before',
      fileVersionId: pin,
      artifacts: [],
      imageFingerprints: [],
      instanceLinks: [],
      complete: false,
    },
  },
  state: 'draft',
  createdAt: '2026-08-12T10:26:00.000Z',
};

writeFileSync(outputPath, `${JSON.stringify(campaign, null, 2)}\n`);
