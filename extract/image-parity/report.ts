/** Deterministic disk report for one strict image-parity comparison. */
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { writeTriptych, type Aligned } from '../figma/visual-parity/img.js';
import type { DiffBox, ImageParityResult } from './compare.js';

const CROP_PAD = 24;

export interface ImageParityReport {
  status: ImageParityResult['status'];
  exitCode: 0 | 1 | 2;
  diffCount: number;
  diffPct: number | null;
  diffBox: DiffBox | null;
  reason: string | null;
  triptych: string | null;
}

function crop(src: PNG, box: DiffBox): PNG {
  const x0 = Math.max(0, box.x - CROP_PAD);
  const y0 = Math.max(0, box.y - CROP_PAD);
  const x1 = Math.min(src.width, box.x + box.w + CROP_PAD);
  const y1 = Math.min(src.height, box.y + box.h + CROP_PAD);
  const out = new PNG({ width: x1 - x0, height: y1 - y0 });
  PNG.bitblt(src, out, x0, y0, x1 - x0, y1 - y0, 0, 0);
  return out;
}

function asAligned(before: PNG, after: PNG): Aligned {
  return {
    a: before,
    b: after,
    width: before.width,
    height: before.height,
    aContent: { width: before.width, height: before.height },
    bContent: { width: after.width, height: after.height },
    aOffset: { x: 0, y: 0 },
    aTrimOrigin: { x: 0, y: 0 },
  };
}

/** Writes only a cropped triptych on diff; stale diagnostic files are removed. */
export function writeImageParityReport(outDir: string, result: ImageParityResult): ImageParityReport {
  mkdirSync(outDir, { recursive: true });
  const triptychPath = path.join(outDir, 'triptych.png');
  let triptych: string | null = null;

  if (result.status === 'diff') {
    if (!result.images || !result.diffBox) {
      throw new Error('image-parity/report: diff sans images ou diffBox');
    }
    const before = crop(result.images.before, result.diffBox);
    const after = crop(result.images.after, result.diffBox);
    const diff = crop(result.images.diff, result.diffBox);
    writeTriptych(triptychPath, asAligned(before, after), diff);
    triptych = 'triptych.png';
  } else if (existsSync(triptychPath)) {
    rmSync(triptychPath);
  }

  const exitCode: 0 | 1 | 2 = result.status === 'identical' ? 0 : result.status === 'diff' ? 1 : 2;
  const diffPct = result.width && result.height ? (result.diffCount / (result.width * result.height)) * 100 : null;
  const report: ImageParityReport = {
    status: result.status,
    exitCode,
    diffCount: result.diffCount,
    diffPct,
    diffBox: result.diffBox,
    reason: result.reason,
    triptych,
  };
  writeFileSync(path.join(outDir, 'result.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}
