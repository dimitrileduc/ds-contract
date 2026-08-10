/** 021 / US4 — an accepted final receipt must refuse every open closure gate. */
import { buildRepairReceipt } from '../../../extract/figma/projection-repair/report.js';
import { classifyAllowedChanges, compareImageFingerprints, compareInstanceLinks } from '../../../extract/figma/projection-repair/verify.js';

const imageBefore = [
  { hostId: '1:1', structuralPath: '0/0', paintIndex: 0, imageHash: 'a', scaleMode: 'FILL' as const },
  { hostId: '1:2', structuralPath: '0/1', paintIndex: 0, imageHash: 'b', scaleMode: 'FILL' as const },
];
const imageAfter = structuredClone(imageBefore);
[imageAfter[0].imageHash, imageAfter[1].imageHash] = [imageAfter[1].imageHash, imageAfter[0].imageHash];
if (compareImageFingerprints(imageBefore, imageAfter).ok) throw new Error('permuted images were accepted');

const linksBefore = [{ instanceNodeId: '2:1', masterNodeId: '1:1', structuralPath: '0', overrideDigest: 'a' }];
if (compareInstanceLinks(linksBefore, [{ ...linksBefore[0], overrideDigest: 'b' }]).ok) {
  throw new Error('changed instance override was accepted');
}
const classified = classifyAllowedChanges([{ path: '$.children[0].characters', before: 'a', after: 'b' }], ['width', 'x']);
if (classified.unexpected.length !== 1) throw new Error('a diff outside the field allowlist was accepted');

const base = {
  targetId: 'hero' as const,
  referenceId: '020-reference-hero',
  appliedOperationIds: ['generated-hero'],
  expectedDiffs: [{ surfaceId: 'hero:master', kind: 'expected' as const, description: 'authorized geometry', diffCount: 1, evidenceRef: 'proofs/diff.json' }],
  unexpectedDiffs: [],
  captureValid: true,
  imagePreservation: 'pass' as const,
  instancePreservation: 'pass' as const,
  consumerVerdicts: [{ consumerId: 'ds.hero', dependencyId: 'absolute-lowering', usage: 'contract' as const, status: 'revalidated' as const, evidenceRefs: ['proofs/consumer.json'], decisionRef: 'proofs/consumer.json' }],
  idempotence: 'pass' as const,
  ownerDecision: 'accepted' as const,
  ownerRationale: 'Automated gates and owner review are green.',
  evidenceRefs: ['proofs/before.json', 'proofs/after.json', 'proofs/diff.json'],
  decidedAt: '2026-08-10T00:00:00.000Z',
};
if (!buildRepairReceipt(base).ok) throw new Error('a fully closed receipt was refused');

const refusals = [
  { name: 'invalid capture', patch: { captureValid: false } },
  { name: 'permuted image', patch: { imagePreservation: 'fail' } },
  { name: 'changed link/override', patch: { instancePreservation: 'fail' } },
  { name: 'outside allowlist', patch: { unexpectedDiffs: [{ surfaceId: 'hero:master', kind: 'unexpected', description: 'characters changed', diffCount: 1, evidenceRef: 'proofs/diff.json' }] } },
  { name: 'open consumer', patch: { consumerVerdicts: [{ ...base.consumerVerdicts[0], status: 'refused' }] } },
  { name: 'failed idempotence', patch: { idempotence: 'fail' } },
  { name: 'missing owner decision', patch: { ownerDecision: null } },
] as const;
for (const refusal of refusals) {
  const result = buildRepairReceipt({ ...base, ...refusal.patch } as never);
  if (result.ok) throw new Error(`${refusal.name}: accepted receipt was generated`);
}

console.log('✔ repair receipt gates: invalid capture, image permutation, link/override drift, outside diff, open consumer, red idempotence and absent owner are refused');
