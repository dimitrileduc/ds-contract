/**
 * Geometry exceptions are evidence, not waivers. A typography-engine delta
 * may be accepted only when the contract pins both its named cause and a
 * bound for every measured root/part delta; an arbitrary prose reason must
 * never turn a geometry failure green.
 */
import { createGeometryReceipt } from '../../extract/figma/visual-parity/evidence.js';

const contract = {
  anatomy: {
    root: {
      geometryJustification: {
        cause: 'typographic-subpixel-rounding',
        reason: 'Chromium and Figma round the same observed Montserrat glyph advances on different sub-pixel grids.',
        bounds: {
          root: { x: 0, y: 0, width: 1.25, height: 0 },
          parts: {
            label: { x: 0, y: 0, width: 0.001, height: 0 },
          },
        },
      },
    },
  },
};

const base = {
  rootFigma: { x: 64, y: 64, width: 388, height: 32 },
  rootGenerated: { x: 64, y: 64, width: 386.78125, height: 32 },
  figmaParts: { label: { x: 64, y: 64, width: 340, height: 32 } },
  generatedParts: { label: { x: 64, y: 64, width: 338.78125, height: 32 } },
  requiredParts: ['root', 'label'],
  contract,
  contractJustification: '/anatomy/root/geometryJustification',
  reportExplanation: 'The receipt exposes the bounded typography-engine delta; it does not alter HUG sizing or pixels.',
};

const bounded = createGeometryReceipt(base);
if (bounded.verdict !== 'justified' || bounded.contractJustification !== base.contractJustification) {
  throw new Error(`bounded typography delta must be justified, got ${bounded.verdict}`);
}

const wrongCause = structuredClone(base);
(wrongCause.contract.anatomy.root.geometryJustification as any).cause = 'unspecified';
if (createGeometryReceipt(wrongCause).verdict !== 'fail') {
  throw new Error('an arbitrary geometry reason was accepted without the bounded typography cause');
}

const exceeds = structuredClone(base);
exceeds.rootGenerated.width = 386.5;
if (createGeometryReceipt(exceeds).verdict !== 'fail') {
  throw new Error('a root delta beyond the contract bound was accepted');
}

const missingPartBound = structuredClone(base);
delete (missingPartBound.contract.anatomy.root.geometryJustification as any).bounds.parts.label;
if (createGeometryReceipt(missingPartBound).verdict !== 'fail') {
  throw new Error('a required-part delta was accepted without its own contract bound');
}

console.log('bounded-typography-geometry-justification ok: only declared, fully bounded typography deltas can be justified');
