import { PNG } from 'pngjs';
import { alignPair, diffPair } from '../../extract/figma/visual-parity/img.js';
import { authoritativeScore } from '../../extract/figma/visual-parity/gate.js';
import { THRESHOLD_PCT } from '../../extract/figma/visual-parity/tolerance.js';

const ours = new PNG({ width: 40, height: 20 });
const figma = new PNG({ width: 40, height: 20 });
ours.data.fill(255);
figma.data.fill(255);

// A deliberately wrong, text-shaped plane. The DOM text mask (including the
// instrument's fixed inflation) covers every changed pixel while leaving a
// narrow strip of identical canvas available to the masked denominator.
for (let y = 5; y < 15; y++) {
  for (let x = 5; x < 35; x++) {
    const i = (y * ours.width + x) * 4;
    ours.data[i] = ours.data[i + 1] = ours.data[i + 2] = 0;
  }
}

const aligned = alignPair(ours, figma);
const diff = diffPair(aligned, [{ x: 5, y: 5, width: 30, height: 10 }]);

if (diff.maskedPct !== 0) {
  throw new Error(`fixture must reproduce a masked false green, got ${diff.maskedPct}`);
}
if (diff.unmaskedPct <= THRESHOLD_PCT) {
  throw new Error(`fixture raw score must be over the real gate, got ${diff.unmaskedPct}`);
}
if (diff.maskCoveragePct <= 50) {
  throw new Error(`fixture must prove a non-probative majority mask, got ${diff.maskCoveragePct}%`);
}

const gate = authoritativeScore(diff);
if (gate.scorePct !== diff.unmaskedPct || gate.basis !== 'unmasked') {
  throw new Error(
    `masked 0% incorrectly overrode raw ${diff.unmaskedPct}% at ${diff.maskCoveragePct}% mask coverage: ${JSON.stringify(gate)}`,
  );
}
if (gate.scorePct <= THRESHOLD_PCT) {
  throw new Error(`false green survived: authoritative score is ${gate.scorePct}%`);
}

console.log(
  `✔ masked ${diff.maskedPct.toFixed(2)}% cannot hide raw ${diff.unmaskedPct.toFixed(2)}% ` +
    `(${diff.maskCoveragePct.toFixed(2)}% mask coverage); gate remains raw`,
);
