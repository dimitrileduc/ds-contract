/** 021 / US3 — a second reconstruction may not drift in any observable channel. */
import { compareReconstructionIdempotence } from '../../../extract/figma/projection-repair/verify.js';
import { buildIdempotenceReceipt } from '../../../extract/figma/projection-repair/report.js';

const artifact = (kind: 'structure' | 'properties' | 'png', sha256: string) => ({
  artifactId: `surface:${kind}`,
  surfaceId: 'hero:master',
  kind,
  path: `proofs/${kind}`,
  sha256,
  width: kind === 'png' ? 1728 : null,
  height: kind === 'png' ? 640 : null,
  byteLength: 10,
  status: 'valid' as const,
});
const material = (phase: 'after' | 'idempotence') => ({
  capture: {
    captureSetId: `021-${phase}`,
    phase,
    fileVersionId: '1',
    complete: true,
    artifacts: [artifact('structure', 'a'.repeat(64)), artifact('properties', 'b'.repeat(64)), artifact('png', 'c'.repeat(64))],
    imageFingerprints: [{ hostId: '1:1', structuralPath: '0', paintIndex: 0, imageHash: 'image-a', scaleMode: 'FILL' as const }],
    instanceLinks: [{ instanceNodeId: '1:2', masterNodeId: '1:1', structuralPath: '0', overrideDigest: 'override-a' }],
  },
  payloads: {
    'surface:structure': { absoluteBoundingBox: { x: 0, y: 0, width: 1728, height: 640 } },
    'surface:properties': { entries: [{ structuralPath: '0', values: { 'Titre#1:1': { type: 'TEXT', value: 'Titre' } } }] },
  },
  applyReceipt: { operations: [{ operationId: 'generated-hero', status: 'no-op', nodeId: '1:1' }] },
});

const after = material('after');
const identical = material('idempotence');
const clean = compareReconstructionIdempotence(after, identical);
if (!clean.ok || clean.differences.length !== 0) throw new Error('identical reconstructions were refused');
const receipt = buildIdempotenceReceipt(clean, identical.applyReceipt.operations);
if (receipt.status !== 'pass' || receipt.operations.some((operation) => operation.status !== 'no-op')) {
  throw new Error('deterministic no-op receipt was not accepted');
}

const mutations: Array<{ category: string; mutate(value: ReturnType<typeof material>): void }> = [
  { category: 'geometry', mutate: (value) => { value.payloads['surface:structure'].absoluteBoundingBox.width = 1727; } },
  { category: 'properties', mutate: (value) => { value.payloads['surface:properties'].entries[0].values['Titre#1:1'].value = 'Dérive'; } },
  { category: 'images', mutate: (value) => { value.capture.imageFingerprints[0].imageHash = 'image-b'; } },
  { category: 'instances', mutate: (value) => { value.capture.instanceLinks[0].overrideDigest = 'override-b'; } },
  { category: 'receipt', mutate: (value) => { value.applyReceipt.operations[0].status = 'applied'; } },
];
for (const test of mutations) {
  const divergent = structuredClone(identical);
  test.mutate(divergent);
  const result = compareReconstructionIdempotence(after, divergent);
  if (result.ok || !result.differences.some((difference) => difference.category === test.category)) {
    throw new Error(`${test.category}: divergence was not refused and classified`);
  }
}

let refusedNonNoOp = false;
try {
  buildIdempotenceReceipt(clean, [{ operationId: 'generated-hero', status: 'applied', nodeId: '1:1' }]);
} catch {
  refusedNonNoOp = true;
}
if (!refusedNonNoOp) throw new Error('a non-no-op second apply received a green receipt');

console.log('✔ reconstruction idempotence: geometry, properties, images, instances/overrides and normalized receipt drift are refused');
