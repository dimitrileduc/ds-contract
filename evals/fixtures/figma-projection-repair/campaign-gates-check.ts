/**
 * 021 — la campagne de réparation refuse ses préconditions avant toute
 * interaction avec Figma. Cette fixture est volontairement pure : aucun
 * fichier de preuve n'est créé et aucune mutation canvas n'est possible ici.
 */
import {
  CAMPAIGN_TARGET_IDS,
  transitionCampaign,
  validateRepairCampaign,
  validateRepairReceipt,
} from '../../../extract/figma/projection-repair/campaign.js';

const sha = 'a'.repeat(64);
const clone = <T>(value: T): T => structuredClone(value);

const target = (targetId: string, nodeId: string) => ({
  targetId,
  kind: targetId === 'categories-principales' || targetId === 'realisations' ? 'direct-canvas' : 'generated-master',
  masterNodeId: nodeId,
  reference: {
    referenceId: `020-${targetId}`,
    sourceKind: 'current-owner-approved',
    subjectNodeId: nodeId,
    visualFacts: ['fait mesuré'],
    decisionRef: 'specs/020-figma-contract-readiness/registry/owner-decisions.json',
  },
  affectedSurfaceIds: [`${targetId}:master`],
  projectionDefectIds: ['absolute-lowering'],
  allowedFields: ['layoutPositioning'],
  protectedFacts: ['images', 'overrides'],
});

const validCampaign = {
  schemaVersion: '1.0.0',
  campaignId: '021-figma-projection-repair',
  filePin: {
    fileKey: 'd9FYAUcqdcNtsuaMgLefvJ',
    versionId: '2385391614633344086',
    capturedAt: '2026-08-09T17:07:21.281Z',
  },
  authorityRefs: [
    'specs/020-figma-contract-readiness/proofs/visual-reference-review-2026-08-09.json',
  ],
  targets: CAMPAIGN_TARGET_IDS.map((id, index) => target(id, `211${index}:30${index}`)),
  affectedSurfaces: CAMPAIGN_TARGET_IDS.map((targetId, index) => ({
    surfaceId: `${targetId}:master`,
    targetId,
    role: 'master',
    nodeId: `211${index}:30${index}`,
    pageComposition: null,
    structuralPath: '0',
    expectedSize: { width: 1, height: 1 },
    impactStatus: 'pending',
  })),
  consumerImpacts: [],
  allowedOperations: [{
    operationId: 'generated-hero', targetId: 'hero', mechanism: 'generated-amend', nodeId: '2110:300',
    structuralPath: null, preconditions: [{ field: 'type', equals: 'COMPONENT' }],
    changes: { layoutPositioning: 'ABSOLUTE' }, expectedPostconditions: [{ field: 'applied', equals: true }],
  }],
  captureSets: {
    before: {
      captureSetId: 'before', phase: 'before', fileVersionId: '2385391614633344086',
      artifacts: CAMPAIGN_TARGET_IDS.flatMap((targetId) => [
        { artifactId: `${targetId}:png`, surfaceId: `${targetId}:master`, kind: 'png', path: `specs/021-figma-projection-repair/proofs/before/${targetId}.png`, sha256: sha, width: 1, height: 1, byteLength: 1, status: 'valid' },
        { artifactId: `${targetId}:structure`, surfaceId: `${targetId}:master`, kind: 'structure', path: `specs/021-figma-projection-repair/proofs/before/${targetId}.json`, sha256: sha, width: null, height: null, byteLength: 1, status: 'valid' },
      ]),
      imageFingerprints: [], instanceLinks: [], complete: true,
    },
  },
  state: 'draft',
  createdAt: '2026-08-09T17:07:21.281Z',
};

function expectAccepted(value: unknown, label: string): void {
  const result = validateRepairCampaign(value);
  if (!result.ok) throw new Error(`${label} refused: ${result.issues.map((issue) => issue.code).join(', ')}`);
}

function expectRejected(value: unknown, code: string, label: string): void {
  const result = validateRepairCampaign(value);
  if (result.ok || !result.issues.some((issue) => issue.code === code)) {
    throw new Error(`${label} must refuse ${code}; got ${result.ok ? 'accepted' : result.issues.map((issue) => issue.code).join(', ')}`);
  }
}

expectAccepted(validCampaign, 'complete seven-target campaign');

const missingTarget = clone(validCampaign);
missingTarget.targets.pop();
expectRejected(missingTarget, 'target-coverage', 'missing target');

const extraTarget = clone(validCampaign);
extraTarget.targets.push(clone(extraTarget.targets[0]));
expectRejected(extraTarget, 'target-coverage', 'duplicate target');

const floatingPin = clone(validCampaign);
floatingPin.filePin.versionId = '';
expectRejected(floatingPin, 'file-pin', 'floating file version');

const invalidCapture = clone(validCampaign);
invalidCapture.captureSets.before.artifacts[0].status = 'empty';
invalidCapture.state = 'ready-to-apply';
expectRejected(invalidCapture, 'capture-invalid', 'empty before capture');

const illegalTransition = transitionCampaign(validCampaign, 'verified');
if (illegalTransition.ok || !illegalTransition.issues.some((issue) => issue.code === 'state-transition')) {
  throw new Error('draft → verified must be refused before any mutation');
}

const failedVerification = { ...clone(validCampaign), state: 'verification-failed' as const };
const recoveredVerification = transitionCampaign(failedVerification, 'verified');
if (!recoveredVerification.ok) throw new Error('verification-failed → verified recovery was refused');
const illegalRecovery = transitionCampaign(failedVerification, 'applied');
if (illegalRecovery.ok || !illegalRecovery.issues.some((issue) => issue.code === 'state-transition')) {
  throw new Error('verification-failed → applied must remain refused');
}

const acceptedReceipt = {
  schemaVersion: '1.0.0', receiptId: 'hero', campaignId: '021-figma-projection-repair', targetId: 'hero', referenceId: '020-hero',
  appliedOperationIds: ['generated-hero'], expectedDiffs: [], unexpectedDiffs: [], imagePreservation: 'pass',
  instancePreservation: 'pass', consumerVerdicts: [], idempotence: 'pass', ownerDecision: 'accepted',
  ownerRationale: 'preuve complète', evidenceRefs: ['before.json', 'after.json', 'diff.json'], decidedAt: '2026-08-09T17:07:21.281Z',
};
if (!validateRepairReceipt(acceptedReceipt).ok) throw new Error('valid accepted receipt refused');
const openReceipt = clone(acceptedReceipt);
openReceipt.consumerVerdicts.push({ consumerId: 'ds.button', dependencyId: 'Button', status: 'pending', evidenceRefs: ['impact.json'] });
const receiptResult = validateRepairReceipt(openReceipt);
if (receiptResult.ok || !receiptResult.issues.some((issue) => issue.code === 'receipt-gate')) {
  throw new Error('accepted receipt with pending consumer must be refused');
}

console.log('✔ figma-projection-repair campaign gates refuse incomplete targets, pins, captures, transitions and owner receipts');
