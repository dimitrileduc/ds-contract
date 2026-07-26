/**
 * aplat-parity selftest — 2 fixture cases (T014), proving the CROP + DIFF
 * plumbing before any real probe number is trusted (fixture → eval → claim).
 * Synthetic PNGs built in-memory (pngjs) — no committed binaries, no
 * Chromium, no Figma: this proves alignPair/diffPair/cropAplat's own math,
 * not the live render (the T015 probe run is the render's proof).
 *
 *   npm run aplat:selftest
 */
import { PNG } from 'pngjs';
import { alignPair, diffPair } from '../visual-parity/img.js';

function solidPng(width: number, height: number, r: number, g: number, b: number): PNG {
  const png = new PNG({ width, height });
  for (let i = 0; i < width * height; i++) {
    png.data[i * 4] = r;
    png.data[i * 4 + 1] = g;
    png.data[i * 4 + 2] = b;
    png.data[i * 4 + 3] = 255;
  }
  return png;
}

/** Mirrors run.ts's cropAplat (kept independent here — selftest proves the
 *  DIFF plumbing; a duplicated 8-line crop is cheaper to keep honest than an
 *  import coupling the selftest to run.ts's CLI module). */
function crop(png: PNG, x: number, y: number, w: number, h: number): PNG {
  const out = new PNG({ width: w, height: h });
  for (let yy = 0; yy < h; yy++) {
    const srcStart = ((y + yy) * png.width + x) << 2;
    const dstStart = (yy * w) << 2;
    png.data.copy(out.data, dstStart, srcStart, srcStart + w * 4);
  }
  return out;
}

let failures = 0;
function check(name: string, cond: boolean, detail: string): void {
  if (cond) {
    console.log(`  ✔ ${name}: ${detail}`);
  } else {
    console.log(`  ✘ ${name}: ${detail}`);
    failures++;
  }
}

console.log('aplat-parity selftest — 2 cases (npm run aplat:selftest)');

// Case 1: identical — crop the SAME region from two copies of one canvas.
{
  const canvas = solidPng(40, 40, 240, 240, 240);
  const a = crop(canvas, 5, 5, 20, 20);
  const b = crop(canvas, 5, 5, 20, 20);
  const aligned = alignPair(a, b);
  const diff = diffPair(aligned, []);
  check(
    'identical',
    diff.diffCount === 0,
    `diffCount ${diff.diffCount}, region 20×20=400px, regionPct ${((diff.diffCount / 400) * 100).toFixed(3)}%`,
  );
}

// Case 2: one-pixel — crop, then flip ONE pixel beyond pixelmatch's threshold.
{
  const canvasA = solidPng(40, 40, 240, 240, 240);
  const canvasB = solidPng(40, 40, 240, 240, 240);
  const flipIdx = ((5 + 7) * 40 + (5 + 10)) << 2; // one pixel inside the 20×20 crop at (10,7)
  canvasB.data[flipIdx] = 10;
  canvasB.data[flipIdx + 1] = 10;
  canvasB.data[flipIdx + 2] = 10;
  const a = crop(canvasA, 5, 5, 20, 20);
  const b = crop(canvasB, 5, 5, 20, 20);
  const aligned = alignPair(a, b);
  const diff = diffPair(aligned, []);
  check(
    'one-pixel',
    diff.diffCount === 1 && diff.diffBox !== null && diff.diffBox.x === 10 && diff.diffBox.y === 7,
    `diffCount ${diff.diffCount}, diffBox ${JSON.stringify(diff.diffBox)} (attendu x:10,y:7)`,
  );
}

if (failures > 0) {
  console.error(`\n✘ aplat-parity selftest: ${failures} case(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('\n✔ aplat-parity selftest: 2/2 cases pass.');
}
