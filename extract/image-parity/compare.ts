/**
 * Strict PNG-to-PNG comparison engine.
 *
 * This is deliberately renderer-agnostic: it does not know about Figma,
 * manifests, pages, or React. Consumers decide how their images were made.
 * There is no resize, crop, or alignment here: a dimension change is a
 * refusal because it would otherwise hide a visual change.
 */
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { readPng } from '../figma/visual-parity/img.js';

export interface DiffBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ImageParityStatus = 'identical' | 'diff' | 'input-invalid' | 'dimension-mismatch';

export type DecodedImage = { ok: true; png: PNG } | { ok: false; reason: string };

export interface ImageParityResult {
  status: ImageParityStatus;
  diffCount: number;
  diffBox: DiffBox | null;
  reason: string | null;
  width: number | null;
  height: number | null;
  images?: {
    before: PNG;
    after: PNG;
    diff: PNG;
  };
}

/** Decode and validate one PNG. A fully transparent image is not evidence. */
export function decodeImage(path: string | null, side: 'before' | 'after'): DecodedImage {
  if (path === null) return { ok: false, reason: `${side}: PNG manquant` };
  try {
    const png = readPng(path);
    if (png.width <= 0 || png.height <= 0) {
      return { ok: false, reason: `${side}: dimensions PNG invalides (${png.width}x${png.height})` };
    }
    for (let i = 3; i < png.data.length; i += 4) {
      if (png.data[i] !== 0) return { ok: true, png };
    }
    return { ok: false, reason: `${side}: image entièrement transparente (alpha 0 sur tous les pixels)` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: `${side}: PNG illisible (${message})` };
  }
}

/** Bounding box of pixelmatch's counted (pure-red) pixels. */
export function diffBoundingBox(diff: PNG, width: number, height: number): DiffBox | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
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
  return maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Compare already-validated PNGs with pixelmatch's AA detector enabled. */
export function compareDecodedImages(before: PNG, after: PNG): ImageParityResult {
  if (before.width !== after.width || before.height !== after.height) {
    return {
      status: 'dimension-mismatch',
      diffCount: 0,
      diffBox: null,
      reason: `dimensions before ${before.width}x${before.height} != after ${after.width}x${after.height}`,
      width: null,
      height: null,
    };
  }

  const { width, height } = before;
  const diff = new PNG({ width, height });
  // includeAA stays omitted: pixelmatch's anti-aliasing detector remains on.
  const diffCount = pixelmatch(before.data, after.data, diff.data, width, height, { threshold: 0.1 });
  if (diffCount === 0) {
    return { status: 'identical', diffCount, diffBox: null, reason: null, width, height };
  }
  return {
    status: 'diff',
    diffCount,
    diffBox: diffBoundingBox(diff, width, height),
    reason: null,
    width,
    height,
    images: { before, after, diff },
  };
}

/** Compare two paths. Both failures are reported together; neither is hidden. */
export function compareImageFiles(beforePath: string | null, afterPath: string | null): ImageParityResult {
  const before = decodeImage(beforePath, 'before');
  const after = decodeImage(afterPath, 'after');
  if (!before.ok || !after.ok) {
    const reasons: string[] = [];
    if (!before.ok) reasons.push(before.reason);
    if (!after.ok) reasons.push(after.reason);
    return { status: 'input-invalid', diffCount: 0, diffBox: null, reason: reasons.join(' ; '), width: null, height: null };
  }
  return compareDecodedImages(before.png, after.png);
}
