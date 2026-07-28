import { PNG } from 'pngjs';
import { alignPair, diffPair } from '../../extract/figma/visual-parity/img.js';

const ours = new PNG({ width: 4, height: 2 });
const figma = new PNG({ width: 4, height: 2 });
ours.data.fill(0);
figma.data.fill(0);

const paintWhite = (png: PNG, x: number): void => {
  const i = x * 4;
  png.data[i] = png.data[i + 1] = png.data[i + 2] = png.data[i + 3] = 255;
};

// Same white ink, deliberately different positions, on transparent canvases.
paintWhite(ours, 0);
paintWhite(figma, 3);
const root = { x: 0, y: 0, width: 4, height: 2 };

const flattenedOnLight = diffPair(alignPair(ours, figma, root, 'light'), []);
if (flattenedOnLight.unmaskedPct !== 0) {
  throw new Error(`fixture must reproduce white-on-white invisibility, got ${flattenedOnLight.unmaskedPct}%`);
}

const visibleOnDark = diffPair(alignPair(ours, figma, root, 'dark'), []);
if (visibleOnDark.unmaskedPct <= 0) {
  throw new Error('dark inspection surface did not expose displaced transparent white ink');
}

console.log(
  `✔ explicit dark inspection surface exposes transparent white-ink drift ` +
    `(light ${flattenedOnLight.unmaskedPct.toFixed(2)}%, dark ${visibleOnDark.unmaskedPct.toFixed(2)}%)`,
);
