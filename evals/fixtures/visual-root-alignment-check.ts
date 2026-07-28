import { PNG } from 'pngjs';
import { alignPair } from '../../extract/figma/visual-parity/img.js';

const ours = new PNG({ width: 14, height: 14 });
const figma = new PNG({ width: 10, height: 8 });
ours.data.fill(0);
figma.data.fill(0);

const paint = (png: PNG, x: number, y: number, r = 0) => {
  const i = (y * png.width + x) * 4;
  png.data[i] = png.data[i + 1] = png.data[i + 2] = r;
  png.data[i + 3] = 255;
};

// Identical full-width bottom stroke in the shared root coordinate system.
for (let x = 0; x < 10; x++) {
  paint(ours, x + 2, 10);
  paint(figma, x, 7);
}
// Deliberately different text-like ink bboxes. Alpha-content centering would
// move the identical stroke; root-box alignment must not.
paint(ours, 3, 4);
paint(ours, 3, 5);
paint(figma, 1, 2);

const aligned = alignPair(ours, figma, { x: 2, y: 3, width: 10, height: 8 });
if (
  aligned.width !== 10 ||
  aligned.height !== 8 ||
  aligned.aTrimOrigin.x !== 2 ||
  aligned.aTrimOrigin.y !== 3 ||
  aligned.aOffset.x !== 0 ||
  aligned.aOffset.y !== 0
) {
  throw new Error(`exact root geometry was not used as the alignment anchor: ${JSON.stringify(aligned)}`);
}
for (let x = 0; x < 10; x++) {
  const a = ((7 * aligned.width + x) * 4);
  if (aligned.a.data[a] !== aligned.b.data[a]) {
    throw new Error(`identical bottom stroke shifted at x=${x}`);
  }
}

console.log('✔ exact DOM/Figma root geometry anchors image parity without moving the border');
