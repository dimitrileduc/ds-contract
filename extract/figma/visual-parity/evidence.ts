/**
 * Deterministic evidence receipts for the versioned visual campaign.
 *
 * This module deliberately has no browser, Figma, or output-directory
 * behaviour.  Renderers supply measurements, img.ts supplies raw region
 * scores, and the runner supplies already-written artifact bytes.  Keeping
 * those concerns outside this file makes every verdict reproducible from its
 * inputs and prevents a diagnostic (notably the text-masked diff) from being
 * mistaken for acceptance evidence.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type {
  ComparisonSurface,
  DeclaredRegionScore,
  DiffResult,
} from './img.js';
import type { Rect } from './render.js';

export type EvidenceVerdict = 'pass' | 'fail' | 'blocked';
export type VisibilitySide = 'figma' | 'generated';
export type GeometryVerdict = 'pass' | 'fail' | 'justified';
export type PixelVerdict = 'pass' | 'fail';
export type SemanticVerdict = 'pass' | 'fail';
export type ArtifactVerdict = 'pass' | 'fail';

/** A PNG-shaped value is enough for visibility measurement; pngjs is not a
 * runtime dependency of this receipt module. */
export interface PixelImage {
  width: number;
  height: number;
  data: Uint8Array;
}

export interface PaintedBounds extends Rect {}

export type VisibilityFailure =
  | 'figma-blank'
  | 'generated-blank'
  | 'figma-invisible'
  | 'generated-invisible'
  | 'figma-image-missing'
  | 'generated-image-missing';

export interface VisibilityReceipt {
  side: VisibilitySide;
  surface: ComparisonSurface;
  /** Pixels with alpha before compositing on the common inspection surface. */
  alphaPixels: number;
  /** Pixels whose composited RGB differs from that common surface. */
  contrastPixels: number;
  paintedBounds: PaintedBounds | null;
  /** Visible pixels in a required image region, or null when none is required. */
  imagePixels: number | null;
  probative: boolean;
  /** First machine-readable failure for compact reports; `failures` is complete. */
  reason: VisibilityFailure | null;
  failures: VisibilityFailure[];
}

export interface VisibilityReceiptInput {
  side: VisibilitySide;
  image: PixelImage;
  surface?: ComparisonSurface;
  imageRequired?: boolean;
  imagePixels?: number | null;
}

const SURFACE_RGB: Record<ComparisonSurface, readonly [number, number, number]> = {
  light: [255, 255, 255],
  dark: [32, 32, 32],
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const SHA256 = /^[a-f0-9]{64}$/i;

function cloneRect(rect: Rect): Rect {
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}

function positiveRect(value: Rect | undefined | null): value is Rect {
  return !!value &&
    [value.x, value.y, value.width, value.height].every(isFiniteNumber) &&
    value.width > 0 && value.height > 0;
}

function finiteRect(value: Rect | undefined | null): value is Rect {
  return !!value && [value.x, value.y, value.width, value.height].every(isFiniteNumber);
}

/**
 * Measure the visible (pre-flattening) signal of one capture side.  White
 * opaque pixels on a white surface intentionally have alpha but no contrast,
 * so a blank/blank 0% pixel diff cannot become probative.
 */
export function createVisibilityReceipt(input: VisibilityReceiptInput): VisibilityReceipt {
  const surface = input.surface ?? 'light';
  const background = SURFACE_RGB[surface];
  const image = input.image;
  let alphaPixels = 0;
  let contrastPixels = 0;
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;

  if (isPositiveInteger(image.width) && isPositiveInteger(image.height) && image.data.length >= image.width * image.height * 4) {
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const index = (y * image.width + x) * 4;
        const alphaByte = image.data[index + 3];
        if (alphaByte === 0) continue;
        alphaPixels++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        const alpha = alphaByte / 255;
        const red = Math.round(image.data[index] * alpha + background[0] * (1 - alpha));
        const green = Math.round(image.data[index + 1] * alpha + background[1] * (1 - alpha));
        const blue = Math.round(image.data[index + 2] * alpha + background[2] * (1 - alpha));
        if (red !== background[0] || green !== background[1] || blue !== background[2]) contrastPixels++;
      }
    }
  }

  const paintedBounds: PaintedBounds | null =
    maxX >= 0
      ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
      : null;
  const imagePixels = isNonNegativeInteger(input.imagePixels) ? input.imagePixels : null;
  const failures: VisibilityFailure[] = [];
  if (alphaPixels === 0 || paintedBounds === null) {
    failures.push(`${input.side}-blank` as VisibilityFailure);
  } else {
    if (contrastPixels === 0) failures.push(`${input.side}-invisible` as VisibilityFailure);
    if (input.imageRequired === true && !isPositiveInteger(imagePixels)) {
      failures.push(`${input.side}-image-missing` as VisibilityFailure);
    }
  }

  return {
    side: input.side,
    surface,
    alphaPixels,
    contrastPixels,
    paintedBounds,
    imagePixels,
    probative: failures.length === 0,
    reason: failures[0] ?? null,
    failures,
  };
}

/** Alias with a measurement-oriented name for render integrations. */
export const measureVisibility = createVisibilityReceipt;

export type ImageFailure =
  | 'image-id-invalid'
  | 'expected-hash-invalid'
  | 'actual-hash-invalid'
  | 'image-hash-mismatch'
  | 'image-not-complete'
  | 'image-not-decoded'
  | 'image-dimensions-mismatch'
  | 'image-not-visible';

export interface ImageReceiptInput {
  assetId: string;
  expectedSha256: string | null | undefined;
  actualSha256: string | null | undefined;
  complete: boolean | undefined;
  naturalWidth: number | null | undefined;
  naturalHeight: number | null | undefined;
  renderedWidth: number | null | undefined;
  renderedHeight: number | null | undefined;
  visiblePixels: number | null | undefined;
  expectedWidth?: number | null;
  expectedHeight?: number | null;
}

/** Browser-decode and visible-region receipt for one required fixture image. */
export interface ImageReceipt {
  assetId: string;
  expectedSha256: string | null;
  actualSha256: string | null;
  complete: boolean;
  decoded: boolean;
  naturalWidth: number | null;
  naturalHeight: number | null;
  renderedWidth: number | null;
  renderedHeight: number | null;
  visiblePixels: number | null;
  verdict: PixelVerdict;
  failures: ImageFailure[];
}

const nullablePositiveInteger = (value: unknown): number | null =>
  isPositiveInteger(value) ? value : null;
// Natural decoded dimensions and sampled source pixels are integers, but a
// CSS layout box can legitimately be fractional (for example Figma's 339.5px
// Petit Realisation and the 363.5px MemberCard portrait).  Refusing those
// observed browser boxes mislabels a painted, decoded fixture as undecodable.
const nullablePositiveDimension = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
const nullableHash = (value: unknown): string | null =>
  typeof value === 'string' && SHA256.test(value) ? value.toLowerCase() : null;

export function createImageReceipt(input: ImageReceiptInput): ImageReceipt {
  const expectedSha256 = nullableHash(input.expectedSha256);
  const actualSha256 = nullableHash(input.actualSha256);
  const naturalWidth = nullablePositiveInteger(input.naturalWidth);
  const naturalHeight = nullablePositiveInteger(input.naturalHeight);
  const renderedWidth = nullablePositiveDimension(input.renderedWidth);
  const renderedHeight = nullablePositiveDimension(input.renderedHeight);
  const visiblePixels = nullablePositiveInteger(input.visiblePixels);
  const failures: ImageFailure[] = [];

  if (!isNonEmptyString(input.assetId)) failures.push('image-id-invalid');
  if (expectedSha256 === null) failures.push('expected-hash-invalid');
  if (actualSha256 === null) failures.push('actual-hash-invalid');
  if (expectedSha256 !== null && actualSha256 !== null && expectedSha256 !== actualSha256) {
    failures.push('image-hash-mismatch');
  }
  if (input.complete !== true) failures.push('image-not-complete');
  if (naturalWidth === null || naturalHeight === null || renderedWidth === null || renderedHeight === null) {
    failures.push('image-not-decoded');
  }
  const expectedWidth = nullablePositiveInteger(input.expectedWidth);
  const expectedHeight = nullablePositiveInteger(input.expectedHeight);
  if (
    (expectedWidth !== null && naturalWidth !== null && expectedWidth !== naturalWidth) ||
    (expectedHeight !== null && naturalHeight !== null && expectedHeight !== naturalHeight)
  ) {
    failures.push('image-dimensions-mismatch');
  }
  if (visiblePixels === null) failures.push('image-not-visible');

  return {
    assetId: input.assetId,
    expectedSha256,
    actualSha256,
    complete: input.complete === true,
    decoded: naturalWidth !== null && naturalHeight !== null && renderedWidth !== null && renderedHeight !== null,
    naturalWidth,
    naturalHeight,
    renderedWidth,
    renderedHeight,
    visiblePixels,
    verdict: failures.length === 0 ? 'pass' : 'fail',
    failures,
  };
}

export const measureImage = createImageReceipt;

export interface ProbativeEvidenceReceipt {
  figma: VisibilityReceipt;
  generated: VisibilityReceipt;
  images: ImageReceipt[];
  probative: boolean;
  failures: Array<VisibilityFailure | ImageFailure>;
}

/**
 * A case is probative only when both visual sides and every required image
 * carry useful signal.  Pixel equality is deliberately absent from this rule.
 */
export function createProbativeEvidenceReceipt(
  figma: VisibilityReceipt,
  generated: VisibilityReceipt,
  images: readonly ImageReceipt[] = [],
): ProbativeEvidenceReceipt {
  const failures: Array<VisibilityFailure | ImageFailure> = [
    ...figma.failures,
    ...generated.failures,
    ...images.flatMap((image) => image.failures),
  ];
  return {
    figma,
    generated,
    images: [...images],
    probative: failures.length === 0,
    failures: [...new Set(failures)].sort(),
  };
}

export interface RectDelta {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NormalizedRect extends Rect {}

export interface PartGeometryReceipt {
  figma: NormalizedRect | null;
  generated: NormalizedRect | null;
  delta: RectDelta | null;
  verdict: PixelVerdict;
}

export type GeometryMismatch = 'root' | `part:${string}`;

export interface GeometryReceiptInput {
  rootFigma: Rect | null | undefined;
  rootGenerated: Rect | null | undefined;
  figmaParts?: Readonly<Record<string, Rect | undefined>>;
  generatedParts?: Readonly<Record<string, Rect | undefined>>;
  requiredParts: readonly string[];
  /** Contract object used solely to resolve an explicit RFC 6901 pointer. */
  contract?: unknown;
  contractJustification?: string | null;
  /** The human-readable explanation which will be exposed in the report. */
  reportExplanation?: string | null;
}

export interface GeometryReceipt {
  rootFigma: Rect | null;
  rootGenerated: Rect | null;
  rootDelta: RectDelta | null;
  parts: Record<string, PartGeometryReceipt>;
  mismatches: GeometryMismatch[];
  verdict: GeometryVerdict;
  /** Present only when a mismatch is expressly contract-justified. */
  contractJustification: string | null;
}

function rectDelta(figma: Rect, generated: Rect): RectDelta {
  return {
    x: generated.x - figma.x,
    y: generated.y - figma.y,
    width: generated.width - figma.width,
    height: generated.height - figma.height,
  };
}

function sameRect(figma: Rect | null, generated: Rect | null): boolean {
  return figma !== null && generated !== null &&
    figma.x === generated.x && figma.y === generated.y &&
    figma.width === generated.width && figma.height === generated.height;
}

function normalizePart(part: Rect | undefined, root: Rect | null): NormalizedRect | null {
  if (!positiveRect(part) || !positiveRect(root)) return null;
  return {
    x: (part.x - root.x) / root.width,
    y: (part.y - root.y) / root.height,
    width: part.width / root.width,
    height: part.height / root.height,
  };
}

function sameNormalizedRect(figma: NormalizedRect | null, generated: NormalizedRect | null): boolean {
  return sameRect(figma, generated);
}

type GeometryDeltaBound = { x: number; y: number; width: number; height: number };

function isGeometryDeltaBound(value: unknown): value is GeometryDeltaBound {
  return typeof value === 'object' && value !== null && !Array.isArray(value) &&
    ['x', 'y', 'width', 'height'].every((key) => {
      const candidate = (value as Record<string, unknown>)[key];
      return typeof candidate === 'number' && Number.isFinite(candidate) && candidate >= 0;
    });
}

function withinGeometryDeltaBound(delta: RectDelta | null, bound: GeometryDeltaBound | undefined): boolean {
  return delta !== null && bound !== undefined &&
    Math.abs(delta.x) <= bound.x &&
    Math.abs(delta.y) <= bound.y &&
    Math.abs(delta.width) <= bound.width &&
    Math.abs(delta.height) <= bound.height;
}

/**
 * A geometry exception is deliberately narrower than a prose waiver.  The
 * only accepted cause is the known Figma/Chromium sub-pixel text-metric
 * difference, and every mismatch must be named and bounded in the contract.
 * This function does not fit, translate, round, or otherwise alter a receipt.
 */
function isBoundedTypographyGeometryJustification(
  value: unknown,
  rootDelta: RectDelta | null,
  parts: Readonly<Record<string, PartGeometryReceipt>>,
  mismatches: readonly GeometryMismatch[],
): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const justification = value as Record<string, unknown>;
  if (
    justification.cause !== 'typographic-subpixel-rounding' ||
    !isNonEmptyString(justification.reason) ||
    typeof justification.bounds !== 'object' ||
    justification.bounds === null ||
    Array.isArray(justification.bounds)
  ) return false;
  const bounds = justification.bounds as Record<string, unknown>;
  const rootBound = isGeometryDeltaBound(bounds.root) ? bounds.root : undefined;
  const partBounds =
    typeof bounds.parts === 'object' && bounds.parts !== null && !Array.isArray(bounds.parts)
      ? bounds.parts as Record<string, unknown>
      : {};
  return mismatches.every((mismatch) => {
    if (mismatch === 'root') return withinGeometryDeltaBound(rootDelta, rootBound);
    const partName = mismatch.slice('part:'.length);
    const bound = isGeometryDeltaBound(partBounds[partName]) ? partBounds[partName] : undefined;
    return withinGeometryDeltaBound(parts[partName]?.delta ?? null, bound);
  });
}

/** Resolve RFC 6901 pointers without treating an arbitrary string as proof. */
export function resolveJsonPointer(document: unknown, pointer: string | null | undefined): unknown {
  if (pointer === '') return document;
  if (typeof pointer !== 'string' || !pointer.startsWith('/')) return undefined;
  let current = document;
  for (const rawSegment of pointer.slice(1).split('/')) {
    if (/~(?:[^01]|$)/.test(rawSegment)) return undefined;
    const segment = rawSegment.replace(/~1/g, '/').replace(/~0/g, '~');
    if (Array.isArray(current)) {
      if (!/^(0|[1-9][0-9]*)$/.test(segment)) return undefined;
      current = current[Number(segment)];
    } else if (typeof current === 'object' && current !== null && Object.hasOwn(current, segment)) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Root boxes are compared in their measured coordinates.  Named parts are
 * compared only after expressing each against *its own* root box; no fitted
 * registration, crop offset, resampling, or tolerance is applied.
 */
export function createGeometryReceipt(input: GeometryReceiptInput): GeometryReceipt {
  const rootFigma = positiveRect(input.rootFigma) ? cloneRect(input.rootFigma) : null;
  const rootGenerated = positiveRect(input.rootGenerated) ? cloneRect(input.rootGenerated) : null;
  const rootDelta = rootFigma !== null && rootGenerated !== null ? rectDelta(rootFigma, rootGenerated) : null;
  const figmaParts = input.figmaParts ?? {};
  const generatedParts = input.generatedParts ?? {};
  const requested = [...new Set(input.requiredParts)].filter(isNonEmptyString);
  const parts = Object.create(null) as Record<string, PartGeometryReceipt>;
  const mismatches: GeometryMismatch[] = [];

  if (!sameRect(rootFigma, rootGenerated)) mismatches.push('root');
  for (const partName of requested) {
    const figmaPart = partName === 'root' ? rootFigma ?? undefined : figmaParts[partName];
    const generatedPart = partName === 'root' ? rootGenerated ?? undefined : generatedParts[partName];
    const figma = normalizePart(figmaPart, rootFigma);
    const generated = normalizePart(generatedPart, rootGenerated);
    const delta = figma !== null && generated !== null ? rectDelta(figma, generated) : null;
    const matches = sameNormalizedRect(figma, generated);
    parts[partName] = { figma, generated, delta, verdict: matches ? 'pass' : 'fail' };
    // The root is already compared in direct coordinates.  Do not disguise a
    // shifted root as a second part failure merely because its normalised box
    // is always {0,0,1,1}.
    if (partName !== 'root' && !matches) mismatches.push(`part:${partName}`);
  }

  const pointer = input.contractJustification ?? null;
  const resolvedJustification = resolveJsonPointer(input.contract, pointer);
  const explained = isNonEmptyString(input.reportExplanation);
  const justified = mismatches.length > 0 &&
    isBoundedTypographyGeometryJustification(resolvedJustification, rootDelta, parts, mismatches) && explained;
  return {
    rootFigma,
    rootGenerated,
    rootDelta,
    parts,
    mismatches,
    verdict: mismatches.length === 0 ? 'pass' : justified ? 'justified' : 'fail',
    contractJustification: justified ? pointer : null,
  };
}

export const measureGeometry = createGeometryReceipt;

export interface PixelReceiptInput {
  diff: Pick<DiffResult, 'unmaskedPct' | 'maskedPct' | 'maskCoveragePct'>;
  regions: Readonly<Record<string, DeclaredRegionScore>>;
  requiredRegionIds: readonly string[];
  thresholdPct: number;
}

export type PixelFailure =
  | 'raw-score-invalid'
  | 'raw-threshold-exceeded'
  | `region:${string}:missing`
  | `region:${string}:${string}`;

export interface PixelReceipt {
  rawPct: number;
  /** Printed for diagnosis only; never read when deriving `verdict`. */
  maskedDiagnosticPct: number | null;
  maskCoveragePct: number;
  thresholdPct: number;
  regions: Record<string, DeclaredRegionScore>;
  requiredRegionIds: string[];
  verdict: PixelVerdict;
  failures: PixelFailure[];
}

/**
 * Turn img.ts measurements into an acceptance receipt.  Its expression is
 * exactly: raw global score <= threshold AND every declared required region
 * passes.  `maskedDiagnosticPct` is intentionally not mentioned below.
 */
export function createPixelReceipt(input: PixelReceiptInput): PixelReceipt {
  const requiredRegionIds = [...new Set(input.requiredRegionIds)].filter(isNonEmptyString);
  const regions = Object.create(null) as Record<string, DeclaredRegionScore>;
  for (const id of Object.keys(input.regions).sort()) regions[id] = input.regions[id];
  const failures: PixelFailure[] = [];
  const rawPct = input.diff.unmaskedPct;
  const thresholdPct = input.thresholdPct;
  if (!isFiniteNumber(rawPct) || !isFiniteNumber(thresholdPct) || thresholdPct < 0) {
    failures.push('raw-score-invalid');
  } else if (rawPct > thresholdPct) {
    failures.push('raw-threshold-exceeded');
  }
  for (const id of requiredRegionIds) {
    const score = regions[id];
    if (!score) {
      failures.push(`region:${id}:missing`);
      continue;
    }
    for (const failure of score.failures) failures.push(`region:${id}:${failure}`);
    // `score.failures` carries the threshold decision from T040. Retaining
    // this explicit comparison protects this aggregator if a caller supplies
    // a serialised score instead of the live img.ts object.
    if (!isFiniteNumber(score.diffPct) || score.diffPct > score.maxDiffPct) {
      const thresholdFailure = `region:${id}:region-threshold-exceeded` as PixelFailure;
      if (!failures.includes(thresholdFailure)) failures.push(thresholdFailure);
    }
  }

  return {
    rawPct,
    maskedDiagnosticPct: input.diff.maskedPct ?? null,
    maskCoveragePct: input.diff.maskCoveragePct,
    thresholdPct,
    regions,
    requiredRegionIds,
    verdict: failures.length === 0 ? 'pass' : 'fail',
    failures: [...new Set(failures)].sort(),
  };
}

export const measurePixels = createPixelReceipt;

export type SemanticAssertionKind = 'element' | 'attribute' | 'relationship' | 'keyboard-context';

export interface SemanticAssertion {
  id: string;
  contractPointer: string;
  selector: string;
  assertion: SemanticAssertionKind;
  expected: unknown;
}

export type SemanticFailure =
  | 'semantic-id-invalid'
  | 'semantic-selector-invalid'
  | 'semantic-assertion-invalid'
  | 'contract-pointer-unresolved'
  | 'semantic-value-mismatch';

export interface SemanticReceipt {
  id: string;
  selector: string;
  assertion: SemanticAssertionKind | null;
  contractPointer: string;
  contractResolved: boolean;
  expected: unknown;
  actual: unknown;
  verdict: SemanticVerdict;
  failures: SemanticFailure[];
}

const SEMANTIC_ASSERTIONS = new Set<SemanticAssertionKind>([
  'element', 'attribute', 'relationship', 'keyboard-context',
]);

function jsonEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (typeof left !== 'object' || left === null || typeof right !== 'object' || right === null) return false;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) &&
      left.length === right.length && left.every((entry, index) => jsonEqual(entry, right[index]));
  }
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord).sort();
  const rightKeys = Object.keys(rightRecord).sort();
  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key, index) => key === rightKeys[index] && jsonEqual(leftRecord[key], rightRecord[key]));
}

/**
 * The caller measures `actual` in the live generated DOM.  Resolving the
 * pointer here makes a dangling contract citation a receipt failure rather
 * than an unreviewed string in campaign JSON.
 */
export function createSemanticReceipt(
  assertion: SemanticAssertion,
  actual: unknown,
  contract: unknown,
): SemanticReceipt {
  const contractValue = resolveJsonPointer(contract, assertion.contractPointer);
  const assertionKind = SEMANTIC_ASSERTIONS.has(assertion.assertion) ? assertion.assertion : null;
  const failures: SemanticFailure[] = [];
  if (!isNonEmptyString(assertion.id)) failures.push('semantic-id-invalid');
  if (!isNonEmptyString(assertion.selector)) failures.push('semantic-selector-invalid');
  if (assertionKind === null) failures.push('semantic-assertion-invalid');
  if (contractValue === undefined) failures.push('contract-pointer-unresolved');
  if (!jsonEqual(assertion.expected, actual)) failures.push('semantic-value-mismatch');
  return {
    id: assertion.id,
    selector: assertion.selector,
    assertion: assertionKind,
    contractPointer: assertion.contractPointer,
    contractResolved: contractValue !== undefined,
    expected: assertion.expected,
    actual,
    verdict: failures.length === 0 ? 'pass' : 'fail',
    failures,
  };
}

export const measureSemantic = createSemanticReceipt;

export type ArtifactKind = 'reference' | 'generated' | 'diff' | 'triptych' | 'metadata';
export const REQUIRED_ARTIFACT_KINDS: readonly ArtifactKind[] = [
  'reference', 'generated', 'diff', 'triptych', 'metadata',
];
const IMAGE_ARTIFACT_KINDS = new Set<ArtifactKind>(['reference', 'generated', 'diff', 'triptych']);

export type ArtifactFailure =
  | 'artifact-kind-invalid'
  | 'artifact-path-invalid'
  | 'artifact-hash-invalid'
  | 'artifact-image-dimensions-invalid';

export interface ArtifactReceiptInput {
  kind: ArtifactKind | string;
  /** Repository/campaign-relative path stored in the machine-readable result. */
  path: string;
  contents?: string | Uint8Array;
  sha256?: string;
  bytes?: number;
  width?: number | null;
  height?: number | null;
}

export interface ArtifactReceipt {
  kind: ArtifactKind | null;
  path: string;
  sha256: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
  verdict: ArtifactVerdict;
  failures: ArtifactFailure[];
}

function isArtifactKind(value: unknown): value is ArtifactKind {
  return typeof value === 'string' && (REQUIRED_ARTIFACT_KINDS as readonly string[]).includes(value);
}

function isSafeRelativeArtifactPath(value: unknown): value is string {
  return isNonEmptyString(value) && !value.startsWith('/') && !value.startsWith('\\') &&
    !value.split(/[\\/]+/).includes('..');
}

/** Return a lower-case SHA-256 for exact post-write artifact bytes. */
export function hashArtifact(contents: string | Uint8Array): string {
  return createHash('sha256').update(contents).digest('hex');
}

/**
 * Build an artifact receipt from bytes the caller has just written (or read).
 * Passing `contents` is preferred: the receipt derives both byte count and
 * hash instead of trusting an asserted value.
 */
export function createArtifactReceipt(input: ArtifactReceiptInput): ArtifactReceipt {
  const kind = isArtifactKind(input.kind) ? input.kind : null;
  const contents = input.contents;
  const bytes = contents === undefined
    ? isNonNegativeInteger(input.bytes) ? input.bytes : null
    : typeof contents === 'string' ? Buffer.byteLength(contents) : contents.byteLength;
  const sha256 = contents === undefined ? nullableHash(input.sha256) : hashArtifact(contents);
  const width = nullablePositiveInteger(input.width);
  const height = nullablePositiveInteger(input.height);
  const failures: ArtifactFailure[] = [];
  if (kind === null) failures.push('artifact-kind-invalid');
  if (!isSafeRelativeArtifactPath(input.path)) failures.push('artifact-path-invalid');
  if (sha256 === null || bytes === null) failures.push('artifact-hash-invalid');
  if (kind !== null && IMAGE_ARTIFACT_KINDS.has(kind) && (width === null || height === null)) {
    failures.push('artifact-image-dimensions-invalid');
  }
  return {
    kind,
    path: input.path,
    sha256,
    bytes,
    width,
    height,
    verdict: failures.length === 0 ? 'pass' : 'fail',
    failures,
  };
}

/** Convenience boundary for a runner that needs to hash an already-written file. */
export function readArtifactReceipt(
  input: Omit<ArtifactReceiptInput, 'contents' | 'sha256' | 'bytes'> & { file: string },
): ArtifactReceipt {
  return createArtifactReceipt({ ...input, contents: readFileSync(input.file) });
}

export interface ArtifactSetReceipt {
  artifacts: ArtifactReceipt[];
  requiredKinds: ArtifactKind[];
  verdict: ArtifactVerdict;
  failures: string[];
}

/** Require one valid receipt for every artifact needed to review a case. */
export function createArtifactSetReceipt(
  artifacts: readonly ArtifactReceipt[],
  requiredKinds: readonly ArtifactKind[] = REQUIRED_ARTIFACT_KINDS,
): ArtifactSetReceipt {
  const required = [...new Set(requiredKinds)];
  const failures: string[] = [];
  for (const kind of required) {
    const matches = artifacts.filter((artifact) => artifact.kind === kind);
    if (matches.length !== 1) {
      failures.push(`artifact:${kind}:${matches.length === 0 ? 'missing' : 'duplicate'}`);
      continue;
    }
    for (const failure of matches[0].failures) failures.push(`artifact:${kind}:${failure}`);
  }
  return {
    artifacts: [...artifacts],
    requiredKinds: required,
    verdict: failures.length === 0 ? 'pass' : 'fail',
    failures: [...new Set(failures)].sort(),
  };
}

export type CaseEvidenceFailure =
  | 'coverage-incomplete'
  | 'stale-reference'
  | 'asset-missing'
  | 'asset-invalid'
  | 'render-refused'
  | 'non-probative'
  | 'geometry-fail'
  | 'pixel-fail'
  | 'semantic-fail'
  | 'artifact-missing';

const BLOCKING_CASE_FAILURES = new Set<CaseEvidenceFailure>([
  'coverage-incomplete', 'stale-reference', 'asset-missing', 'asset-invalid',
  'render-refused', 'non-probative', 'geometry-fail', 'artifact-missing',
]);

export interface CaseVerdictReceiptInput {
  id: string;
  subjectId: string;
  /** Pins, coverage, or render refusals established before measurement. */
  admissionFailures?: readonly CaseEvidenceFailure[];
  probative: ProbativeEvidenceReceipt;
  geometry: GeometryReceipt;
  pixels: PixelReceipt;
  semantics?: readonly SemanticReceipt[];
  artifacts: ArtifactSetReceipt;
}

export interface CaseVerdictReceipt {
  id: string;
  subjectId: string;
  verdict: EvidenceVerdict;
  probative: boolean;
  reasons: CaseEvidenceFailure[];
  visibility: { figma: VisibilityReceipt; generated: VisibilityReceipt };
  images: ImageReceipt[];
  geometry: GeometryReceipt;
  pixels: PixelReceipt;
  semantics: SemanticReceipt[];
  artifacts: ArtifactReceipt[];
}

function verdictForFailures(failures: readonly CaseEvidenceFailure[]): EvidenceVerdict {
  if (failures.length === 0) return 'pass';
  return failures.some((failure) => BLOCKING_CASE_FAILURES.has(failure)) ? 'blocked' : 'fail';
}

/**
 * Aggregate all independently measured receipts for one case.  A justified
 * geometry delta is admissible; an unmasked pixel failure or semantic failure
 * remains a normal visual failure.  Missing/invalid proof is blocked rather
 * than converted into a plausible pass or fail score.
 */
export function createCaseVerdictReceipt(input: CaseVerdictReceiptInput): CaseVerdictReceipt {
  const semantics = [...(input.semantics ?? [])];
  const reasons = new Set<CaseEvidenceFailure>(input.admissionFailures ?? []);
  if (!input.probative.probative) {
    reasons.add('non-probative');
    if (input.probative.images.some((image) => image.verdict === 'fail')) reasons.add('asset-invalid');
  }
  if (input.geometry.verdict === 'fail') reasons.add('geometry-fail');
  if (input.pixels.verdict === 'fail') reasons.add('pixel-fail');
  if (semantics.some((receipt) => receipt.verdict === 'fail')) reasons.add('semantic-fail');
  if (input.artifacts.verdict === 'fail') reasons.add('artifact-missing');
  const sortedReasons = [...reasons].sort();
  return {
    id: input.id,
    subjectId: input.subjectId,
    verdict: verdictForFailures(sortedReasons),
    probative: input.probative.probative,
    reasons: sortedReasons,
    visibility: { figma: input.probative.figma, generated: input.probative.generated },
    images: input.probative.images,
    geometry: input.geometry,
    pixels: input.pixels,
    semantics,
    artifacts: input.artifacts.artifacts,
  };
}

export interface SubjectVerdictReceiptInput {
  id: string;
  cases: readonly CaseVerdictReceipt[];
  requiredCaseIds: readonly string[];
}

export interface SubjectVerdictReceipt {
  id: string;
  requiredCaseIds: string[];
  passing: number;
  failing: number;
  blocked: number;
  missing: string[];
  verdict: EvidenceVerdict;
  reasons: string[];
}

/** Subject pass is an AND over every declared required case, never an average. */
export function createSubjectVerdictReceipt(input: SubjectVerdictReceiptInput): SubjectVerdictReceipt {
  const requiredCaseIds = [...new Set(input.requiredCaseIds)].filter(isNonEmptyString);
  const byId = new Map<string, CaseVerdictReceipt[]>();
  for (const receipt of input.cases) byId.set(receipt.id, [...(byId.get(receipt.id) ?? []), receipt]);
  const missing = requiredCaseIds.filter((id) => (byId.get(id)?.length ?? 0) !== 1).sort();
  const requiredCases = requiredCaseIds.flatMap((id) => byId.get(id)?.length === 1 ? byId.get(id)! : []);
  const passing = requiredCases.filter((receipt) => receipt.verdict === 'pass').length;
  const failing = requiredCases.filter((receipt) => receipt.verdict === 'fail').length;
  const blocked = requiredCases.filter((receipt) => receipt.verdict === 'blocked').length;
  const reasons = [
    ...missing.map((id) => `case:${id}:missing-or-duplicate`),
    ...requiredCases.filter((receipt) => receipt.verdict !== 'pass').map((receipt) => `case:${receipt.id}:${receipt.verdict}`),
  ].sort();
  const verdict: EvidenceVerdict =
    missing.length > 0 || blocked > 0 ? 'blocked' : failing > 0 ? 'fail' : 'pass';
  return { id: input.id, requiredCaseIds, passing, failing, blocked, missing, verdict, reasons };
}

export interface EvidenceCoverage {
  expected: readonly string[];
  observed: readonly string[];
  /** Accepted only when they equal the set difference recalculated below. */
  missing?: readonly string[];
  unexpected?: readonly string[];
}

export interface CampaignVerdictReceiptInput {
  coverage: EvidenceCoverage;
  subjects: readonly SubjectVerdictReceipt[];
  /** The campaign contract's expected seven subject IDs, in declared order. */
  requiredSubjectIds: readonly string[];
}

export interface CampaignVerdictReceipt {
  coverage: { expected: string[]; observed: string[]; missing: string[]; unexpected: string[] };
  subjects: SubjectVerdictReceipt[];
  verdict: EvidenceVerdict;
  exitCode: 0 | 1 | 2;
  reasons: string[];
}

const sortedUnique = (values: readonly string[]): string[] => [...new Set(values)].sort();

export function exitCodeForVerdict(verdict: EvidenceVerdict): 0 | 1 | 2 {
  return verdict === 'pass' ? 0 : verdict === 'fail' ? 1 : 2;
}

/**
 * Aggregate the campaign's exact coverage and seven subject receipts.  The
 * coverage delta is recalculated instead of trusting fields copied into a
 * JSON result, so stale or hand-edited deltas cannot produce a campaign pass.
 */
export function createCampaignVerdictReceipt(input: CampaignVerdictReceiptInput): CampaignVerdictReceipt {
  const expected = sortedUnique(input.coverage.expected);
  const observed = sortedUnique(input.coverage.observed);
  const expectedSet = new Set(expected);
  const observedSet = new Set(observed);
  const missing = expected.filter((fact) => !observedSet.has(fact));
  const unexpected = observed.filter((fact) => !expectedSet.has(fact));
  const requiredSubjectIds = [...new Set(input.requiredSubjectIds)].filter(isNonEmptyString);
  const byId = new Map<string, SubjectVerdictReceipt[]>();
  for (const receipt of input.subjects) byId.set(receipt.id, [...(byId.get(receipt.id) ?? []), receipt]);
  const subjectMissing = requiredSubjectIds.filter((id) => (byId.get(id)?.length ?? 0) !== 1).sort();
  const subjectUnexpected = [...byId.keys()].filter((id) => !requiredSubjectIds.includes(id)).sort();
  const requiredSubjects = requiredSubjectIds.flatMap((id) => byId.get(id)?.length === 1 ? byId.get(id)! : []);
  const reasons: string[] = [];
  if (missing.length > 0 || unexpected.length > 0) reasons.push('coverage-incomplete');
  reasons.push(...subjectMissing.map((id) => `subject:${id}:missing-or-duplicate`));
  reasons.push(...subjectUnexpected.map((id) => `subject:${id}:unexpected`));
  reasons.push(...requiredSubjects.filter((subject) => subject.verdict !== 'pass').map((subject) => `subject:${subject.id}:${subject.verdict}`));

  const hasStructuralBlock = missing.length > 0 || unexpected.length > 0 ||
    requiredSubjectIds.length !== 7 || subjectMissing.length > 0 || subjectUnexpected.length > 0;
  const hasBlockedSubject = requiredSubjects.some((subject) => subject.verdict === 'blocked');
  const hasFailedSubject = requiredSubjects.some((subject) => subject.verdict === 'fail');
  const verdict: EvidenceVerdict = hasStructuralBlock || hasBlockedSubject
    ? 'blocked'
    : hasFailedSubject
      ? 'fail'
      : 'pass';
  return {
    coverage: { expected, observed, missing, unexpected },
    subjects: [...input.subjects],
    verdict,
    exitCode: exitCodeForVerdict(verdict),
    reasons: [...new Set(reasons)].sort(),
  };
}
