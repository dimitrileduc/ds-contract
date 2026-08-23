/**
 * compare.ts — the PURE pixel-comparison layer for the page-parity
 * instrument (spec 003, T012). Given a before/after PNG pair for one
 * maquette (plus whatever sidecar capture manifests exist), it decides that
 * maquette's verdict: identical | diff | capture-failed | dimension-mismatch.
 *
 * Deliberately READS ONLY — no fs writes here (report.ts owns every write:
 * verdict.json, verdict.md, crops/). cli.ts owns argv, directory listing and
 * manifest-sidecar discovery; this file only ever sees paths + already
 * -parsed manifest objects, so it stays trivially unit-testable and, more
 * importantly, USABLE WITHOUT a live Figma canvas — the fixture half of
 * "fixture -> eval -> claim" (R12 in research.md; see fixtures/ + selftest.ts,
 * owned by another task).
 *
 * Detection order per maquette (contracts/page-proof.md §2, restated in the
 * pinned T012 task brief):
 *   1. capture-failed — missing PNG, a manifest whose "statut" isn't "ok",
 *      an unreadable/zero-byte/corrupt PNG, or one that's fully transparent.
 *      Per side, the MANIFEST is checked before we even try to decode the
 *      PNG: the manifest is the capture step's own self-report and, per
 *      contracts/page-proof.md §1, "le manifeste porte le refus" — it stays
 *      authoritative even when a diagnostic PNG is still sitting on disk
 *      next to it ("le PNG éventuel est conservé pour diagnostic mais le
 *      manifeste porte le refus"). Deciding from the manifest first also
 *      avoids decoding bytes the capture step has already disowned. If BOTH
 *      sides fail, both causes are reported — never just the first one
 *      found (silent omission is the highest-severity bug class here).
 *   2. dimension-mismatch — both sides decoded fine, but width/height
 *      differ. A frame resize is a REAL difference, never normalized away.
 *   3. identical / diff — pixelmatch({ threshold: 0.1 }), default
 *      anti-aliasing detector ON (includeAA is never passed), so AA-only
 *      pixels are excluded from diffCount — same semantics as
 *      visual-parity/img.ts's diffPair. diffBox is the bounding box of PURE
 *      RED mismatch pixels in the diff bitmap (same technique as diffPair,
 *      hand-rolled here rather than imported: diffPair also does DOM
 *      text-rect masking, which has no meaning for a raw page screenshot).
 *
 * What this file deliberately does NOT do: call alignPair (R2, research.md).
 * alignPair's content-box crop + white-canvas centering exists to compare
 * two DIFFERENT renderers (our headless code render vs a Figma REST export)
 * that can legitimately differ in canvas padding. Here both PNGs are
 * Figma exportAsync output, of the SAME node, in the SAME coordinate space —
 * normalizing them would HIDE a real positional regression instead of
 * catching one.
 */
import { statSync } from 'node:fs';
import { PNG } from 'pngjs';
import { readPng } from '../visual-parity/img.js';
import { compareDecodedImages } from '../../image-parity/compare.js';

// ---------------------------------------------------------------------------
// Types. PixelVerdict's field order matches verdict.json's per-maquette
// shape EXACTLY (specs/003-externalize-figma-components/contracts/page-proof.md
// and data-model.md's PixelVerdict entity) because JSON.stringify serializes
// plain-object keys in insertion order: this declaration order IS the
// on-disk byte order report.ts produces. Do not reorder these fields.
// ---------------------------------------------------------------------------

export type PixelVerdictStatus = 'identical' | 'diff' | 'capture-failed' | 'dimension-mismatch';

/** Bounding box in the image's own pixel coordinates (never normalized/aligned — see file header). */
export interface DiffBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A region rectangle, in the frame's OWN capture-pixel coordinates (spec 006, contracts/region-proof.md). */
export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PixelVerdict {
  maquette: string;
  status: PixelVerdictStatus;
  diffCount: number;
  diffBox: DiffBox | null;
  /** Relative "crops/<maquette>.png" — always null out of compareEntry; report.ts fills it in once the crop is actually written. */
  cropTriptyque: string | null;
  /** Explicit French reason naming the side(s) and cause(s); set only for capture-failed / dimension-mismatch. */
  refus: string | null;
  // ---- spec 006 additions (contracts/region-proof.md §3) — ADDED AT THE END,
  // all four optional: absent when --regions wasn't passed, so JSON.stringify
  // (which omits undefined-valued keys) makes verdict.json byte-identical to
  // today whenever this flag is unused (region-proof.md §3's byte-determinism
  // rule; selftest case "byte-identity" asserts this — T028/T029). Populated
  // together, only when a region was supplied AND both sides decoded to
  // same-dimension images (i.e. status is 'identical' or 'diff' — never for
  // capture-failed/dimension-mismatch, which never reach the pixelmatch call
  // at all).
  /** The rectangle applied (echoed back for review) — same coordinates for before/after: a dimension mismatch between the two captures already refuses upstream (dimension-mismatch), so "regionAvant ≠ regionAprès" can only arise from a moved/resized frame, which that existing check already catches (R20/R2 — never re-derived here). */
  region?: Region;
  /** Mismatched pixels strictly INSIDE `region`, read off the SAME diff bitmap as `diffCount` — never a second pixelmatch call (R2). */
  regionDiffCount?: number;
  /** regionDiffCount / (region.w * region.h) * 100 — the FR-016 number. */
  regionPct?: number;
  /** Mismatched pixels OUTSIDE `region` — MUST be 0 (SC-003): any non-zero value means the adoption touched pixels outside its own block. */
  outsideDiffCount?: number;
}

/**
 * Parsed "<name>.manifest.json" sidecar (contracts/page-proof.md §1). Only
 * "statut" is ever inspected here; everything else (nodeId, sha256,
 * capturedAt, transport…) is opaque passthrough this layer doesn't need to
 * interpret. Typed loosely (statut: unknown) because it comes from parsed
 * JSON off disk — cli.ts hands us whatever it found; validating its shape
 * is not this layer's job.
 */
export interface ManifestSidecar {
  statut?: unknown;
  [key: string]: unknown;
}

export interface CompareEntryInput {
  maquette: string;
  /** null = no PNG with this basename was found on this side (pair discovery is cli.ts's job). */
  beforePath: string | null;
  afterPath: string | null;
  beforeManifest?: ManifestSidecar | null;
  afterManifest?: ManifestSidecar | null;
  /** spec 006 (contracts/region-proof.md) — optional, absent by default (additive). */
  region?: Region;
}

export interface CompareEntryResult {
  verdict: PixelVerdict;
  /**
   * Present ONLY when verdict.status === 'diff': the full-frame decoded
   * before/after PNGs plus the pixelmatch diff bitmap, all three the same
   * width×height. report.ts crops these (padded 24px, clamped to bounds) to
   * build the triptych — handing them back here means report.ts never has
   * to re-read the PNGs from disk.
   */
  images?: {
    before: PNG;
    after: PNG;
    diff: PNG;
  };
}

/**
 * Spec 026's page gate is deliberately narrower than the generic region
 * instrument: outside the single separately-reviewed Products allowance,
 * every captured page and use must be strictly identical.  Keeping this
 * verdict reduction next to the pixel comparator makes capture failures and
 * dimension changes impossible to accidentally treat as a clean comparison.
 */
export function strictParityFailures(verdicts: readonly PixelVerdict[]): string[] {
  if (verdicts.length === 0) return ['no captures were supplied'];
  return verdicts
    .filter((verdict) => verdict.status !== 'identical')
    .map((verdict) => `${verdict.maquette}: ${verdict.status}`);
}

// ---------------------------------------------------------------------------
// Per-side evaluation.
// ---------------------------------------------------------------------------

type SideEval = { ok: true; png: PNG } | { ok: false; cause: string };

function decodePng(pngPath: string): { png: PNG } | { cause: string } {
  let size: number;
  try {
    size = statSync(pngPath).size;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { cause: `fichier PNG introuvable (${msg})` };
  }
  if (size === 0) {
    return { cause: 'fichier PNG vide (0 octet)' };
  }
  try {
    const png = readPng(pngPath);
    if (png.width <= 0 || png.height <= 0) {
      // Defensive: pngjs should refuse to parse a degenerate IHDR itself,
      // but a 0-dimension image would break every downstream loop below —
      // name it explicitly rather than let it produce a confusing crash.
      return { cause: `dimensions PNG invalides (${png.width}x${png.height})` };
    }
    return { png };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { cause: `PNG illisible (${msg})` };
  }
}

/** True only if EVERY pixel has alpha === 0 (contracts/page-proof.md: capture "vide" = "intégralement transparent"). */
function isFullyTransparent(png: PNG): boolean {
  const { data } = png;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 0) return false;
  }
  return true;
}

function evalSide(pngPath: string | null, manifest: ManifestSidecar | null | undefined): SideEval {
  if (pngPath === null) {
    return { ok: false, cause: 'PNG manquant (aucune contrepartie trouvée)' };
  }
  // Manifest checked BEFORE decode — see the file-header comment: the
  // manifest is the capture step's own authoritative self-report.
  if (manifest && manifest.statut !== 'ok') {
    return { ok: false, cause: `manifeste indique statut "${String(manifest.statut)}" (attendu "ok")` };
  }
  const decoded = decodePng(pngPath);
  if ('cause' in decoded) {
    return { ok: false, cause: decoded.cause };
  }
  if (isFullyTransparent(decoded.png)) {
    return { ok: false, cause: 'image entièrement transparente (alpha 0 sur tous les pixels)' };
  }
  return { ok: true, png: decoded.png };
}

/**
 * Bounding box of PURE RED (255,0,0) pixels in a pixelmatch diff bitmap —
 * same technique as visual-parity/img.ts's diffPair, minus its text-mask
 * concerns (a raw page screenshot has no DOM text rects to exclude, and
 * pixelmatch's default diffColorAlt falls back to diffColor, so every
 * counted mismatch — regardless of "lighter" or "darker" direction — is
 * painted this same red; yellow AA-only pixels are excluded by construction).
 */
function redPixelBoundingBox(diff: PNG, width: number, height: number): DiffBox | null {
  const { data } = diff;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/**
 * Count pure-RED (255,0,0) mismatch pixels strictly inside `rect`, clamped to
 * the bitmap's own bounds — read off the SAME diff bitmap `redPixelBoundingBox`
 * already scans (region-proof.md §3: "un seul pixelmatch pleine planche…les
 * deux compteurs se lisent sur le même bitmap de diff", never a second diff).
 */
function countRedInRect(diff: PNG, width: number, height: number, rect: Region): number {
  const x0 = Math.max(0, Math.floor(rect.x));
  const y0 = Math.max(0, Math.floor(rect.y));
  const x1 = Math.min(width, Math.ceil(rect.x + rect.w));
  const y1 = Math.min(height, Math.ceil(rect.y + rect.h));
  const { data } = diff;
  let count = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4;
      if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) count++;
    }
  }
  return count;
}

/** Adds the four spec-006 region fields to an already-built verdict, mutating
 *  nothing — returns a new object so callers stay explicit about when the
 *  fields exist. Only called when `region` is defined (additive by construction). */
function withRegion(verdict: PixelVerdict, diff: PNG, width: number, height: number, region: Region): PixelVerdict {
  const regionDiffCount = countRedInRect(diff, width, height, region);
  const denom = region.w * region.h;
  return {
    ...verdict,
    region,
    regionDiffCount,
    regionPct: denom > 0 ? (regionDiffCount / denom) * 100 : 0,
    outsideDiffCount: verdict.diffCount - regionDiffCount,
  };
}

function captureFailedVerdict(maquette: string, causes: string[]): PixelVerdict {
  return {
    maquette,
    status: 'capture-failed',
    diffCount: 0,
    diffBox: null,
    cropTriptyque: null,
    refus: causes.join(' ; '),
  };
}

// ---------------------------------------------------------------------------
// The one export cli.ts/report.ts actually call.
// ---------------------------------------------------------------------------

export function compareEntry(input: CompareEntryInput): CompareEntryResult {
  const { maquette, beforePath, afterPath, beforeManifest, afterManifest, region } = input;

  const before = evalSide(beforePath, beforeManifest);
  const after = evalSide(afterPath, afterManifest);

  if (!before.ok || !after.ok) {
    const causes: string[] = [];
    if (!before.ok) causes.push(`before : ${before.cause}`);
    if (!after.ok) causes.push(`after : ${after.cause}`);
    return { verdict: captureFailedVerdict(maquette, causes) };
  }

  // Past the guard above, TypeScript narrows both to the { ok: true } arm.
  const beforePng = before.png;
  const afterPng = after.png;

  if (beforePng.width !== afterPng.width || beforePng.height !== afterPng.height) {
    return {
      verdict: {
        maquette,
        status: 'dimension-mismatch',
        diffCount: 0,
        diffBox: null,
        cropTriptyque: null,
        refus: `dimensions before ${beforePng.width}x${beforePng.height} != after ${afterPng.width}x${afterPng.height}`,
      },
    };
  }

  // The renderer-agnostic image-parity engine owns the actual pixelmatch
  // decision. This wrapper only adds page manifests, batch naming and regions.
  const comparison = compareDecodedImages(beforePng, afterPng);
  if (comparison.status === 'identical') {
    // comparison dimensions are the already-guarded shared dimensions.
    const diff = new PNG({ width: beforePng.width, height: beforePng.height });
    let verdict: PixelVerdict = { maquette, status: 'identical', diffCount: 0, diffBox: null, cropTriptyque: null, refus: null };
    if (region) verdict = withRegion(verdict, diff, beforePng.width, beforePng.height, region);
    return { verdict };
  }
  if (comparison.status !== 'diff' || !comparison.images || !comparison.diffBox) {
    throw new Error(`page-parity/compare: image-parity returned unexpected status "${comparison.status}" after validated same-size PNGs`);
  }

  let verdict: PixelVerdict = {
    maquette,
    status: 'diff',
    diffCount: comparison.diffCount,
    // Keep page-parity's established local helper for the report contract;
    // it reads the exact diff bitmap supplied by image-parity.
    diffBox: redPixelBoundingBox(comparison.images.diff, beforePng.width, beforePng.height),
    cropTriptyque: null, // report.ts sets this once the crop file is actually written
    refus: null,
  };
  if (region) verdict = withRegion(verdict, comparison.images.diff, beforePng.width, beforePng.height, region);
  return {
    verdict,
    images: { before: beforePng, after: afterPng, diff: comparison.images.diff },
  };
}
