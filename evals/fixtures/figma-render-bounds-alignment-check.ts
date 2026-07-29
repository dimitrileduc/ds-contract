/**
 * A Figma component PNG is bounded by `absoluteRenderBounds`, which may
 * extend outside its layout `absoluteBoundingBox` (for example, an absolute
 * underline below a HUG NavItem).  Alignment must retain that image-space
 * phase instead of alpha-trimming and recentering it.
 */
import { PNG } from 'pngjs';
import { alignPair, rootInReferenceRenderBounds } from '../../extract/figma/visual-parity/img.js';

const ours = new PNG({ width: 256, height: 128 });
// Pinned images-API dimensions for NavItem « À propos » at 2×.
const figma = new PNG({ width: 177, height: 49 });
const FIGMA_ROOT = { x: 16827, y: 35, width: 88, height: 16 };
const FIGMA_RENDER_BOUNDS = {
  x: 16826.984375,
  y: 34.80799865722656,
  width: 88.015625,
  height: 24.192001342773438,
};
const wrapperPhase = {
  x: FIGMA_ROOT.x - FIGMA_RENDER_BOUNDS.x,
  y: FIGMA_ROOT.y - FIGMA_RENDER_BOUNDS.y,
};
if (wrapperPhase.x !== 0.015625 || Math.abs(wrapperPhase.y - 0.1920013427734375) > 1e-12) {
  throw new Error(`GET render-origin phase changed: ${JSON.stringify(wrapperPhase)}`);
}

// The browser root sits inside a larger transparent screenshot.  The Figma
// root begins fractionally inside its render-bounds PNG; neither value may be
// rounded by an alpha-content crop.
const generatedRoot = { x: 32, y: 32, width: 176, height: 32 };
const referenceRoot = rootInReferenceRenderBounds(
  FIGMA_ROOT,
  FIGMA_RENDER_BOUNDS,
  figma,
);
if (!referenceRoot) throw new Error('valid GET geometry did not produce a render-bounds root anchor');

// Keep one visible pixel so the legacy content-crop path is observably wrong.
for (const [image, x, y] of [[ours, 35, 36], [figma, 3, 5]] as const) {
  const i = (y * image.width + x) * 4;
  image.data[i] = 255;
  image.data[i + 1] = 255;
  image.data[i + 2] = 255;
  image.data[i + 3] = 255;
}

const aligned = alignPair(ours, figma, generatedRoot, 'dark', referenceRoot);
if (aligned.width !== 177 || aligned.height !== 49) {
  throw new Error(`render-bounds canvas was alpha-trimmed: ${aligned.width}×${aligned.height}`);
}
if (aligned.aTrimOrigin.x !== 32 || aligned.aTrimOrigin.y !== 32) {
  throw new Error(`generated crop did not preserve the root/render offset: ${JSON.stringify(aligned.aTrimOrigin)}`);
}
if (aligned.aOffset.x !== 0 || aligned.aOffset.y !== 0) {
  throw new Error(`render-bounds crop must not center-pad: ${JSON.stringify(aligned.aOffset)}`);
}

console.log('✔ Figma absoluteRenderBounds alignment receipt holds');
