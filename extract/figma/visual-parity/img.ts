/**
 * Pixel plumbing — pngjs + pixelmatch, no engine code.
 *
 * Normalization is CONTENT-BOX cropping when no stronger source anchor is
 * available: both PNGs arrive with transparent backgrounds (our screenshot
 * omits the body background; Figma's component export is transparent outside
 * the node), so trimming alpha≤16 edges aligns their painted content.  When
 * a pinned GET receipt supplies the root's position inside Figma's
 * `absoluteRenderBounds`, that full render-bounds image is the stronger
 * anchor: it preserves export phase for paint that lies outside the root box.
 * The pair is never resampled; it is center-padded only on the content-crop
 * path, onto a light or dark shared inspection surface, so a size delta stays
 * visible as a real mismatch and is reported in device px.
 *
 * Two legacy diagnostics per pair, both printed, no silent tolerance:
 *   · unmasked — every pixel counts (pixelmatch threshold 0.1, its
 *     antialiasing detector ON — a principled per-pixel classifier, not a
 *     fudge factor).
 *   · masked   — the SAME diff with text-node regions (DOM client rects,
 *     inflated 4 device px) excluded from numerator AND denominator: the
 *     honest "everything but text rasterization" number for families the
 *     local renderer cannot reproduce. It is diagnostic only and cannot
 *     lower any acceptance score.
 *
 * Required regions are scored separately from explicit, predeclared
 * rectangles. Their raw-pixel numerator and denominator retain every pixel;
 * in particular a signal-preserving text region never consumes the DOM mask.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import type { Rect } from './render.js';

const ALPHA_TRIM = 16;
const MASK_INFLATE = 4; // device px around each text rect
const PIXELMATCH_OPTIONS = { threshold: 0.1 } as const;

/** Neutral inspection surface used only to alpha-flatten both PNGs equally.
 * It is measurement context, never component styling or a Figma design fact. */
export type ComparisonSurface = 'light' | 'dark';
const SURFACE_RGB: Record<ComparisonSurface, { r: number; g: number; b: number }> = {
  light: { r: 255, g: 255, b: 255 },
  dark: { r: 32, g: 32, b: 32 },
};

export const readPng = (source: string | Buffer): PNG =>
  PNG.sync.read(typeof source === 'string' ? readFileSync(source) : source);

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Absolute Figma geometry in the coordinate system returned by the nodes GET. */
export interface FigmaAbsoluteRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Convert the pinned GET root box into the exact coordinate system of the
 * images-API PNG.  The PNG's actual dimensions, rather than an assumed DPR,
 * are authoritative because Figma rounds fractional render bounds outward.
 */
export function rootInReferenceRenderBounds(
  root: FigmaAbsoluteRect | null | undefined,
  renderBounds: FigmaAbsoluteRect | null | undefined,
  referenceImage: Pick<PNG, 'width' | 'height'>,
): Rect | null {
  if (
    !root || !renderBounds ||
    !Number.isFinite(root.x) || !Number.isFinite(root.y) ||
    !Number.isFinite(root.width) || !Number.isFinite(root.height) ||
    !Number.isFinite(renderBounds.x) || !Number.isFinite(renderBounds.y) ||
    !Number.isFinite(renderBounds.width) || !Number.isFinite(renderBounds.height) ||
    root.width <= 0 || root.height <= 0 ||
    renderBounds.width <= 0 || renderBounds.height <= 0 ||
    referenceImage.width <= 0 || referenceImage.height <= 0
  ) return null;
  const scaleX = referenceImage.width / renderBounds.width;
  const scaleY = referenceImage.height / renderBounds.height;
  return {
    x: (root.x - renderBounds.x) * scaleX,
    y: (root.y - renderBounds.y) * scaleY,
    width: root.width * scaleX,
    height: root.height * scaleY,
  };
}

/** Bounding box of pixels with alpha > ALPHA_TRIM (full image when none). */
export function contentBox(png: PNG): Box {
  let minX = png.width, minY = png.height, maxX = -1, maxY = -1;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      if (png.data[(y * png.width + x) * 4 + 3] > ALPHA_TRIM) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return { x: 0, y: 0, width: png.width, height: png.height };
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

export interface Aligned {
  a: PNG;
  b: PNG;
  width: number;
  height: number;
  /** Content size of each side BEFORE padding (device px) — the size-delta receipt. */
  aContent: { width: number; height: number };
  bContent: { width: number; height: number };
  /** Where a's trimmed content landed on the shared canvas. */
  aOffset: { x: number; y: number };
  /** a's trim origin in its ORIGINAL image (for mask-rect transforms). */
  aTrimOrigin: { x: number; y: number };
  /** Shared alpha-flattening context used for both sides. */
  comparisonSurface?: ComparisonSurface;
}

/** Copy src's box at (dx, dy), alpha-flattened on the shared surface. */
function blitOnSurface(
  dst: PNG,
  src: PNG,
  box: Box,
  dx: number,
  dy: number,
  surface: ComparisonSurface,
): void {
  const bg = SURFACE_RGB[surface];
  for (let y = 0; y < box.height; y++) {
    for (let x = 0; x < box.width; x++) {
      const si = ((box.y + y) * src.width + (box.x + x)) * 4;
      const di = ((dy + y) * dst.width + (dx + x)) * 4;
      const alpha = src.data[si + 3] / 255;
      dst.data[di] = Math.round(src.data[si] * alpha + bg.r * (1 - alpha));
      dst.data[di + 1] = Math.round(src.data[si + 1] * alpha + bg.g * (1 - alpha));
      dst.data[di + 2] = Math.round(src.data[si + 2] * alpha + bg.b * (1 - alpha));
      dst.data[di + 3] = 255;
    }
  }
}

const surfaceCanvas = (width: number, height: number, surface: ComparisonSurface): PNG => {
  const png = new PNG({ width, height });
  const bg = SURFACE_RGB[surface];
  for (let p = 0; p < width * height; p++) {
    const i = p * 4;
    png.data[i] = bg.r;
    png.data[i + 1] = bg.g;
    png.data[i + 2] = bg.b;
    png.data[i + 3] = 255;
  }
  return png;
};

export function alignPair(
  ours: PNG,
  figma: PNG,
  oursRoot?: Rect,
  comparisonSurface: ComparisonSurface = 'light',
  /**
   * Root layout box in the Figma export PNG's device-pixel coordinate system.
   * It is derived from the pinned GET absoluteBoundingBox and
   * absoluteRenderBounds; callers must not infer it from painted pixels.
   */
  referenceRoot?: Rect,
): Aligned {
  const anchoredRenderBounds =
    oursRoot !== undefined &&
    referenceRoot !== undefined &&
    Number.isFinite(referenceRoot.x) &&
    Number.isFinite(referenceRoot.y) &&
    referenceRoot.width > 0 &&
    referenceRoot.height > 0;
  const anchoredBox = anchoredRenderBounds
    ? {
        x: Math.round(oursRoot.x - referenceRoot.x),
        y: Math.round(oursRoot.y - referenceRoot.y),
        width: figma.width,
        height: figma.height,
      }
    : null;
  const validAnchoredBox =
    anchoredBox !== null &&
    anchoredBox.x >= 0 &&
    anchoredBox.y >= 0 &&
    anchoredBox.x + anchoredBox.width <= ours.width &&
    anchoredBox.y + anchoredBox.height <= ours.height;
  // When the browser root box is exactly the Figma node export size, that
  // shared geometry is the strongest possible anchor. Alpha-content cropping
  // is inappropriate in this case: a font rasterization delta changes the
  // painted text bbox and center-padding then moves an otherwise identical
  // full-width border (AccordionRow exposed this as a false 4.65% diff).
  const roundedRoot = oursRoot
    ? {
        x: Math.round(oursRoot.x),
        y: Math.round(oursRoot.y),
        width: Math.round(oursRoot.width),
        height: Math.round(oursRoot.height),
      }
    : null;
  const exactRoot =
    roundedRoot !== null &&
    roundedRoot.width === figma.width &&
    roundedRoot.height === figma.height;
  const boxA = validAnchoredBox ? anchoredBox! : exactRoot ? roundedRoot! : contentBox(ours);
  const boxB = validAnchoredBox
    ? { x: 0, y: 0, width: figma.width, height: figma.height }
    : exactRoot
    ? { x: 0, y: 0, width: figma.width, height: figma.height }
    : contentBox(figma);
  const width = Math.max(boxA.width, boxB.width);
  const height = Math.max(boxA.height, boxB.height);
  const a = surfaceCanvas(width, height, comparisonSurface);
  const b = surfaceCanvas(width, height, comparisonSurface);
  const aOffset = validAnchoredBox
    ? { x: 0, y: 0 }
    : { x: Math.floor((width - boxA.width) / 2), y: Math.floor((height - boxA.height) / 2) };
  const bOffset = validAnchoredBox
    ? { x: 0, y: 0 }
    : { x: Math.floor((width - boxB.width) / 2), y: Math.floor((height - boxB.height) / 2) };
  blitOnSurface(a, ours, boxA, aOffset.x, aOffset.y, comparisonSurface);
  blitOnSurface(b, figma, boxB, bOffset.x, bOffset.y, comparisonSurface);
  return {
    a,
    b,
    width,
    height,
    aContent: { width: boxA.width, height: boxA.height },
    bContent: { width: boxB.width, height: boxB.height },
    aOffset,
    aTrimOrigin: { x: boxA.x, y: boxA.y },
    comparisonSurface,
  };
}

export interface DiffResult {
  /** Mismatched pixels / all pixels, percent. */
  unmaskedPct: number;
  /** Mismatched non-text pixels / non-text pixels, percent (null when the
   *  mask covers everything). */
  maskedPct: number | null;
  /** Share of the canvas the text mask covers, percent. */
  maskCoveragePct: number;
  diff: PNG;
  diffCount: number;
  /** Bounding box of mismatched pixels (unmasked run), null when clean. */
  diffBox: Box | null;
}

/**
 * A useful region declared before a comparison is made.  Its rectangle is in
 * device-pixel coordinates on the already-aligned inspection canvas; callers
 * must resolve campaign root/part/normalised declarations before calling this
 * module.  We deliberately do not infer a rectangle from observed diffs.
 */
export type DeclaredRegionMetric = 'raw-pixel' | 'signal-preserving-text';

export interface DeclaredRegion {
  id: string;
  rect: Rect;
  metric: DeclaredRegionMetric;
  maxDiffPct: number;
  minSignalPixels: number;
}

export type DeclaredRegionFailure =
  | 'reference-signal-below-minimum'
  | 'generated-signal-below-minimum'
  | 'region-threshold-exceeded';

/**
 * A per-region receipt.  `diffPct` always measures every pixel in `rect`.
 * In particular, `signal-preserving-text` has no text-mask input: glyph ink
 * remains in both the numerator and denominator, so missing, changed, or
 * differently-cased text cannot become a masked false green.
 */
export interface DeclaredRegionScore {
  id: string;
  metric: DeclaredRegionMetric;
  /** Integer device-pixel rectangle actually measured. */
  rect: Rect;
  totalPixels: number;
  mismatchedPixels: number;
  diffPct: number;
  referenceSignalPixels: number;
  generatedSignalPixels: number;
  maxDiffPct: number;
  minSignalPixels: number;
  failures: DeclaredRegionFailure[];
}

function requireMeasuredRect(aligned: Aligned, region: DeclaredRegion): Rect {
  if (typeof region.id !== 'string' || region.id.trim().length === 0) {
    throw new Error('Declared region must have a non-empty id');
  }
  if (region.metric !== 'raw-pixel' && region.metric !== 'signal-preserving-text') {
    throw new Error(`${region.id}: unsupported declared-region metric`);
  }
  if (!Number.isFinite(region.maxDiffPct) || region.maxDiffPct < 0) {
    throw new Error(`${region.id}: maxDiffPct must be a finite non-negative number`);
  }
  if (!Number.isSafeInteger(region.minSignalPixels) || region.minSignalPixels <= 0) {
    throw new Error(`${region.id}: minSignalPixels must be a positive integer`);
  }

  const { x, y, width, height } = region.rect;
  if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
    throw new Error(`${region.id}: rect must have finite positive width and height`);
  }

  // Include every device pixel touched by a declared fractional DOM rectangle.
  // Clamping would silently discard an invalid or shifted region, so reject it
  // instead.  Geometry is deliberately judged elsewhere.
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.ceil(x + width);
  const y1 = Math.ceil(y + height);
  if (x0 < 0 || y0 < 0 || x1 > aligned.width || y1 > aligned.height || x1 <= x0 || y1 <= y0) {
    throw new Error(`${region.id}: rect must be wholly inside the aligned comparison canvas`);
  }
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

function cropPixels(png: PNG, rect: Rect): Uint8Array {
  const pixels = new Uint8Array(rect.width * rect.height * 4);
  const rowBytes = rect.width * 4;
  for (let y = 0; y < rect.height; y++) {
    const sourceStart = ((rect.y + y) * png.width + rect.x) * 4;
    pixels.set(png.data.subarray(sourceStart, sourceStart + rowBytes), y * rowBytes);
  }
  return pixels;
}

function isVisibleSignal(data: Uint8Array, index: number, surface: ComparisonSurface): boolean {
  const background = SURFACE_RGB[surface];
  return data[index + 3] > 0 && (
    data[index] !== background.r ||
    data[index + 1] !== background.g ||
    data[index + 2] !== background.b
  );
}

function signalPixels(png: PNG, rect: Rect, surface: ComparisonSurface): number {
  let count = 0;
  for (let y = rect.y; y < rect.y + rect.height; y++) {
    for (let x = rect.x; x < rect.x + rect.width; x++) {
      if (isVisibleSignal(png.data, (y * png.width + x) * 4, surface)) count++;
    }
  }
  return count;
}

/**
 * Score one predeclared region.  This is intentionally independent from
 * `diffPair`: its legacy unmasked/masked diagnostics remain byte-for-byte in
 * behaviour, while an evidence runner can demand this stronger receipt for
 * every required region.
 */
export function scoreDeclaredRegion(aligned: Aligned, region: DeclaredRegion): DeclaredRegionScore {
  const rect = requireMeasuredRect(aligned, region);
  const totalPixels = rect.width * rect.height;
  const generatedPixels = cropPixels(aligned.a, rect);
  const referencePixels = cropPixels(aligned.b, rect);
  // Do not reuse the DOM text mask here. Both region metrics use the raw
  // pixel classifier over the declared rectangle; the metric records why the
  // caller declared it, not a request to suppress any of its pixels.
  const mismatchedPixels = pixelmatch(
    generatedPixels,
    referencePixels,
    undefined,
    rect.width,
    rect.height,
    PIXELMATCH_OPTIONS,
  );
  const surface = aligned.comparisonSurface ?? 'light';
  const referenceSignalPixels = signalPixels(aligned.b, rect, surface);
  const generatedSignalPixels = signalPixels(aligned.a, rect, surface);
  const diffPct = (mismatchedPixels / totalPixels) * 100;
  const failures: DeclaredRegionFailure[] = [];
  if (referenceSignalPixels < region.minSignalPixels) {
    failures.push('reference-signal-below-minimum');
  }
  if (generatedSignalPixels < region.minSignalPixels) {
    failures.push('generated-signal-below-minimum');
  }
  if (diffPct > region.maxDiffPct) failures.push('region-threshold-exceeded');

  return {
    id: region.id,
    metric: region.metric,
    rect,
    totalPixels,
    mismatchedPixels,
    diffPct,
    referenceSignalPixels,
    generatedSignalPixels,
    maxDiffPct: region.maxDiffPct,
    minSignalPixels: region.minSignalPixels,
    failures,
  };
}

/** Score every required region, preserving its declaration order in the JSON-safe map. */
export function scoreDeclaredRegions(
  aligned: Aligned,
  regions: readonly DeclaredRegion[],
): Record<string, DeclaredRegionScore> {
  const scores = Object.create(null) as Record<string, DeclaredRegionScore>;
  for (const region of regions) {
    if (Object.hasOwn(scores, region.id)) {
      throw new Error(`Duplicate declared region id: ${region.id}`);
    }
    scores[region.id] = scoreDeclaredRegion(aligned, region);
  }
  return scores;
}

/** Boolean mask (width×height) from text rects in OUR image's original
 *  coordinates, transformed onto the aligned canvas and inflated. */
function buildMask(aligned: Aligned, textRects: Rect[]): Uint8Array {
  const mask = new Uint8Array(aligned.width * aligned.height);
  for (const r of textRects) {
    const x0 = Math.max(0, Math.floor(r.x - aligned.aTrimOrigin.x + aligned.aOffset.x - MASK_INFLATE));
    const y0 = Math.max(0, Math.floor(r.y - aligned.aTrimOrigin.y + aligned.aOffset.y - MASK_INFLATE));
    const x1 = Math.min(aligned.width, Math.ceil(x0 + r.width + 2 * MASK_INFLATE));
    const y1 = Math.min(aligned.height, Math.ceil(y0 + r.height + 2 * MASK_INFLATE));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) mask[y * aligned.width + x] = 1;
  }
  return mask;
}

export function diffPair(aligned: Aligned, textRects: Rect[]): DiffResult {
  const { a, b, width, height } = aligned;
  const total = width * height;

  const diff = new PNG({ width, height });
  const diffCount = pixelmatch(a.data, b.data, diff.data, width, height, PIXELMATCH_OPTIONS);

  // Diff bounding box from the diff bitmap (pixelmatch paints mismatches red
  // #ff0000; anti-aliased detections yellow — excluded from the box).
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (diff.data[i] === 255 && diff.data[i + 1] === 0 && diff.data[i + 2] === 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const diffBox: Box | null =
    maxX >= 0 ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null;

  // Masked run: paint text regions identical mid-gray on COPIES, re-diff,
  // and take masked pixels out of the denominator too.
  const mask = buildMask(aligned, textRects);
  let maskPixels = 0;
  const am = new PNG({ width, height });
  const bm = new PNG({ width, height });
  a.data.copy(am.data);
  b.data.copy(bm.data);
  for (let p = 0; p < total; p++) {
    if (mask[p] === 0) continue;
    maskPixels++;
    const i = p * 4;
    am.data[i] = bm.data[i] = 127;
    am.data[i + 1] = bm.data[i + 1] = 127;
    am.data[i + 2] = bm.data[i + 2] = 127;
    am.data[i + 3] = bm.data[i + 3] = 255;
  }
  const maskedDenom = total - maskPixels;
  const maskedCount =
    maskPixels === 0
      ? diffCount
      : pixelmatch(am.data, bm.data, undefined, width, height, PIXELMATCH_OPTIONS);

  return {
    unmaskedPct: (diffCount / total) * 100,
    maskedPct: maskedDenom > 0 ? (maskedCount / maskedDenom) * 100 : null,
    maskCoveragePct: (maskPixels / total) * 100,
    diff,
    diffCount,
    diffBox,
  };
}

/** ours | figma | diff on one white canvas, 12px gutters, no resampling. */
export function writeTriptych(outPath: string, aligned: Aligned, diff: PNG): void {
  const gutter = 12;
  const { width, height } = aligned;
  const canvas = surfaceCanvas(width * 3 + gutter * 2, height, aligned.comparisonSurface ?? 'light');
  const blit = (src: PNG, dx: number) => {
    for (let y = 0; y < height; y++) {
      const si = y * width * 4;
      src.data.copy(canvas.data, (y * canvas.width + dx) * 4, si, si + width * 4);
    }
  };
  blit(aligned.a, 0);
  blit(aligned.b, width + gutter);
  blit(diff, (width + gutter) * 2);
  writeFileSync(outPath, PNG.sync.write(canvas));
}

/** Mean RGB of non-white-ish pixels — the "overall ink" heuristic input. */
export function meanInk(png: PNG): { r: number; g: number; b: number; n: number } {
  let r = 0, g = 0, b = 0, n = 0;
  for (let p = 0; p < png.width * png.height; p++) {
    const i = p * 4;
    if (png.data[i] > 245 && png.data[i + 1] > 245 && png.data[i + 2] > 245) continue;
    r += png.data[i];
    g += png.data[i + 1];
    b += png.data[i + 2];
    n++;
  }
  return n === 0 ? { r: 255, g: 255, b: 255, n } : { r: r / n, g: g / n, b: b / n, n };
}
