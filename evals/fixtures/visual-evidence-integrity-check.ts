/**
 * Adversarial receipt vectors for Visual Campaign v1.
 *
 * This fixture intentionally owns a tiny, in-memory integrity checker rather
 * than importing the pending campaign implementation.  It makes the evidence
 * contract executable before T009 exists, without a network, Figma token, or
 * a proof-directory write.  T009 must preserve these observable refusals when
 * it promotes the model into extract/figma/visual-parity/campaign.ts.
 *
 * The vectors cover the failure states which must never turn into a visual
 * pass: incomplete coverage, stale Figma pins, invalid or absent image asset
 * receipts, invisible evidence, and incomplete case artifact sets.
 */

type FailureCode =
  | 'coverage-incomplete'
  | 'stale-reference'
  | 'asset-missing'
  | 'asset-invalid'
  | 'non-probative'
  | 'artifact-missing';

type ArtifactKind = 'reference' | 'generated' | 'diff' | 'triptych' | 'metadata';

interface SourcePin {
  fileKey?: string;
  fileVersion?: string;
  nodeId?: string;
  /** Canonical hash of the properties reread from the pinned Figma node. */
  observedPropertiesHash?: string;
}

interface AssetManifestEntry {
  id: string;
  sha256?: string;
  mediaType?: string;
  width?: number;
  height?: number;
}

interface AssetReceipt {
  assetId: string;
  sha256?: string;
  mediaType?: string;
  width?: number;
  height?: number;
  decoded?: boolean;
  visiblePixels?: number;
}

interface VisibleSignal {
  alphaPixels: number;
  contrastPixels: number;
  paintedBounds: { width: number; height: number } | null;
}

interface ArtifactReceipt {
  kind: ArtifactKind;
  path?: string;
  sha256?: string;
  width?: number;
  height?: number;
}

interface CaseEvidence {
  expectedFacts: string[];
  observedFacts: string[];
  pinnedReference?: SourcePin;
  observedReference?: SourcePin;
  requiredAssetIds: string[];
  assetsManifest: AssetManifestEntry[];
  assetReceipts: AssetReceipt[];
  visibility: { figma: VisibleSignal; generated: VisibleSignal };
  artifacts: ArtifactReceipt[];
}

const SHA256 = /^[a-f0-9]{64}$/i;
const IMAGE_MEDIA_TYPE = /^image\/(?:png|jpeg|webp|avif)$/;
const REQUIRED_ARTIFACTS: readonly ArtifactKind[] = [
  'reference',
  'generated',
  'diff',
  'triptych',
  'metadata',
];
const IMAGE_ARTIFACTS = new Set<ArtifactKind>(['reference', 'generated', 'diff', 'triptych']);

const hasPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

const validVisibleSignal = (signal: VisibleSignal): boolean =>
  hasPositiveInteger(signal.alphaPixels) &&
  hasPositiveInteger(signal.contrastPixels) &&
  signal.paintedBounds !== null &&
  hasPositiveInteger(signal.paintedBounds.width) &&
  hasPositiveInteger(signal.paintedBounds.height);

/**
 * Minimal contract oracle used only by this adversarial fixture.  Its error
 * names are the stable transition names from evidence-result.interface.md.
 */
function validateEvidence(input: CaseEvidence): FailureCode[] {
  const failures = new Set<FailureCode>();

  const expected = new Set(input.expectedFacts);
  const observed = new Set(input.observedFacts);
  if (
    expected.size === 0 ||
    [...expected].some((fact) => !observed.has(fact)) ||
    [...observed].some((fact) => !expected.has(fact))
  ) {
    failures.add('coverage-incomplete');
  }

  const pin = input.pinnedReference;
  const reread = input.observedReference;
  if (
    !pin ||
    !reread ||
    !pin.fileKey ||
    !pin.fileVersion ||
    !pin.nodeId ||
    !pin.observedPropertiesHash ||
    pin.fileKey !== reread.fileKey ||
    pin.fileVersion !== reread.fileVersion ||
    pin.nodeId !== reread.nodeId ||
    pin.observedPropertiesHash !== reread.observedPropertiesHash
  ) {
    failures.add('stale-reference');
  }

  for (const assetId of input.requiredAssetIds) {
    const manifest = input.assetsManifest.find((entry) => entry.id === assetId);
    const receipt = input.assetReceipts.find((entry) => entry.assetId === assetId);
    if (!manifest || !receipt) {
      failures.add('asset-missing');
      continue;
    }

    if (
      !manifest.sha256 ||
      !receipt.sha256 ||
      !SHA256.test(manifest.sha256) ||
      !SHA256.test(receipt.sha256) ||
      manifest.sha256 !== receipt.sha256 ||
      !manifest.mediaType ||
      !receipt.mediaType ||
      !IMAGE_MEDIA_TYPE.test(manifest.mediaType) ||
      manifest.mediaType !== receipt.mediaType ||
      !hasPositiveInteger(manifest.width) ||
      !hasPositiveInteger(manifest.height) ||
      !hasPositiveInteger(receipt.width) ||
      !hasPositiveInteger(receipt.height) ||
      manifest.width !== receipt.width ||
      manifest.height !== receipt.height ||
      receipt.decoded !== true
    ) {
      failures.add('asset-invalid');
    }

    // An image can decode correctly and still be an empty plane.  That is a
    // probative-evidence failure, not a score that may be waived.
    if (!hasPositiveInteger(receipt.visiblePixels)) failures.add('non-probative');
  }

  if (!validVisibleSignal(input.visibility.figma) || !validVisibleSignal(input.visibility.generated)) {
    failures.add('non-probative');
  }

  for (const kind of REQUIRED_ARTIFACTS) {
    const matching = input.artifacts.filter((artifact) => artifact.kind === kind);
    if (matching.length !== 1) {
      failures.add('artifact-missing');
      continue;
    }
    const artifact = matching[0];
    if (
      !artifact.path ||
      artifact.path.startsWith('/') ||
      artifact.path.split(/[\\/]+/).includes('..') ||
      !artifact.sha256 ||
      !SHA256.test(artifact.sha256) ||
      (IMAGE_ARTIFACTS.has(kind) && (!hasPositiveInteger(artifact.width) || !hasPositiveInteger(artifact.height)))
    ) {
      failures.add('artifact-missing');
    }
  }

  return [...failures].sort();
}

const sha = (character: string): string => character.repeat(64);

const baseline = (): CaseEvidence => ({
  expectedFacts: ['carte.disposition.reassurance', 'carte.image.reassurance'],
  observedFacts: ['carte.disposition.reassurance', 'carte.image.reassurance'],
  pinnedReference: {
    fileKey: 'd9FYAUcqdcNtsuaMgLefvJ',
    fileVersion: '2381229993207753432',
    nodeId: '2063:1606',
    observedPropertiesHash: sha('b'),
  },
  observedReference: {
    fileKey: 'd9FYAUcqdcNtsuaMgLefvJ',
    fileVersion: '2381229993207753432',
    nodeId: '2063:1606',
    observedPropertiesHash: sha('b'),
  },
  requiredAssetIds: ['carte-reassurance'],
  assetsManifest: [
    {
      id: 'carte-reassurance',
      sha256: sha('a'),
      mediaType: 'image/jpeg',
      width: 3024,
      height: 4032,
    },
  ],
  assetReceipts: [
    {
      assetId: 'carte-reassurance',
      sha256: sha('a'),
      mediaType: 'image/jpeg',
      width: 3024,
      height: 4032,
      decoded: true,
      visiblePixels: 1_024,
    },
  ],
  visibility: {
    figma: { alphaPixels: 4_096, contrastPixels: 2_048, paintedBounds: { width: 120, height: 96 } },
    generated: { alphaPixels: 4_096, contrastPixels: 2_048, paintedBounds: { width: 120, height: 96 } },
  },
  artifacts: [
    { kind: 'reference', path: 'cases/carte/figma.png', sha256: sha('c'), width: 240, height: 192 },
    { kind: 'generated', path: 'cases/carte/generated.png', sha256: sha('d'), width: 240, height: 192 },
    { kind: 'diff', path: 'cases/carte/diff.png', sha256: sha('e'), width: 240, height: 192 },
    { kind: 'triptych', path: 'cases/carte/triptych.png', sha256: sha('f'), width: 720, height: 192 },
    { kind: 'metadata', path: 'cases/carte/metadata.json', sha256: sha('0') },
  ],
});

const assertFailures = (name: string, evidence: CaseEvidence, expected: FailureCode[]): void => {
  const actual = validateEvidence(evidence);
  const sortedExpected = [...expected].sort();
  if (actual.join(',') !== sortedExpected.join(',')) {
    throw new Error(`${name}: expected ${sortedExpected.join(', ') || 'pass'}, got ${actual.join(', ') || 'pass'}`);
  }
};

// A complete, visible, pinned case must remain admissible; every following
// vector changes one integrity property and demands a named refusal.
assertFailures('complete evidence', baseline(), []);

{
  const evidence = baseline();
  evidence.observedFacts = ['carte.disposition.reassurance'];
  assertFailures('missing required coverage fact', evidence, ['coverage-incomplete']);
}

{
  const evidence = baseline();
  evidence.observedFacts.push('carte.uninventoried.fact');
  assertFailures('unexpected coverage fact', evidence, ['coverage-incomplete']);
}

{
  const evidence = baseline();
  evidence.observedReference!.fileVersion = 'new-live-version';
  assertFailures('stale Figma file-version pin', evidence, ['stale-reference']);
}

{
  const evidence = baseline();
  evidence.observedReference!.nodeId = '2063:other-node';
  assertFailures('stale Figma node reference', evidence, ['stale-reference']);
}

{
  const evidence = baseline();
  evidence.observedReference!.observedPropertiesHash = sha('1');
  assertFailures('stale observed-property reference', evidence, ['stale-reference']);
}

{
  const evidence = baseline();
  evidence.assetsManifest = [];
  assertFailures('missing required asset manifest entry', evidence, ['asset-missing']);
}

{
  const evidence = baseline();
  evidence.assetReceipts = [];
  assertFailures('missing required asset receipt', evidence, ['asset-missing']);
}

{
  const evidence = baseline();
  evidence.assetsManifest[0].sha256 = 'not-a-sha256';
  assertFailures('malformed asset hash', evidence, ['asset-invalid']);
}

{
  const evidence = baseline();
  evidence.assetReceipts[0].sha256 = sha('9');
  assertFailures('asset hash mismatch', evidence, ['asset-invalid']);
}

{
  const evidence = baseline();
  evidence.assetsManifest[0].mediaType = undefined;
  assertFailures('missing asset media type', evidence, ['asset-invalid']);
}

{
  const evidence = baseline();
  evidence.assetReceipts[0].mediaType = 'application/json';
  assertFailures('invalid asset media type', evidence, ['asset-invalid']);
}

{
  const evidence = baseline();
  evidence.assetsManifest[0].width = 0;
  assertFailures('invalid asset dimensions', evidence, ['asset-invalid']);
}

{
  const evidence = baseline();
  evidence.assetReceipts[0].height = undefined;
  assertFailures('missing decoded asset dimensions', evidence, ['asset-invalid']);
}

{
  const evidence = baseline();
  evidence.assetReceipts[0].visiblePixels = 0;
  assertFailures('decoded but invisible required image', evidence, ['non-probative']);
}

{
  const evidence = baseline();
  evidence.visibility.generated = { alphaPixels: 0, contrastPixels: 0, paintedBounds: null };
  assertFailures('invisible generated comparison side', evidence, ['non-probative']);
}

{
  const evidence = baseline();
  evidence.artifacts = evidence.artifacts.filter((artifact) => artifact.kind !== 'diff');
  assertFailures('incomplete artifact set', evidence, ['artifact-missing']);
}

{
  const evidence = baseline();
  const metadata = evidence.artifacts.find((artifact) => artifact.kind === 'metadata');
  if (!metadata) throw new Error('fixture setup lost metadata artifact');
  metadata.sha256 = undefined;
  assertFailures('unhashed metadata artifact', evidence, ['artifact-missing']);
}

console.log(
  '✔ visual evidence integrity rejects missing coverage, stale Figma references, invalid/missing assets, invisible evidence, and incomplete artifact sets',
);
