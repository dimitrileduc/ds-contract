/**
 * Declared image crop focus is bounded, emitted, and rejectable.  Figma IMAGE
 * FILL has an independent transform from the frame geometry; `object-fit`
 * carries its scale mode while this narrow declared fact carries the focal
 * point on the actual HTML image.
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitHtml } from '../../core/emit-html.js';
import { generateCss, validateContract } from '../../core/emit-react.js';

const fixture = ContractSchema.parse({
  id: 'fixture.object-position',
  name: 'ObjectPosition',
  version: '1.0.0',
  status: 'draft',
  description: 'Bounded IMAGE FILL crop-focus fixture.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  anatomy: {
    root: {
      parts: {
        image: {
          element: 'img',
          attrs: { src: 'data:image/png;base64,AA==' },
          declared: { 'object-fit': 'cover', 'object-position': '50% 51%' },
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/ObjectPosition', export: 'ObjectPosition' },
  },
});

const errors: string[] = [];
validateContract(fixture, new Map([[fixture.id, fixture]]), errors, new Map());
if (errors.length > 0) throw new Error(`valid object-position was refused: ${errors.join('; ')}`);

const cssErrors: string[] = [];
const css = generateCss(fixture, new Set(), cssErrors);
if (cssErrors.length > 0 || !css.includes('object-position: 50% 51%')) {
  throw new Error(`React CSS did not preserve object-position: ${[...cssErrors, css].join('\n')}`);
}
const html = emitHtml(fixture, { tokens: new Set(), icons: new Map(), contracts: new Map([[fixture.id, fixture]]) });
if (!html.css.includes('object-position: 50% 51%')) {
  throw new Error(`HTML CSS did not preserve object-position:\n${html.css}`);
}

const invalid = structuredClone(fixture);
invalid.anatomy.root.parts.image.declared!['object-position'] = 'javascript:alert(1)';
const invalidErrors: string[] = [];
validateContract(invalid, new Map([[invalid.id, invalid]]), invalidErrors, new Map());
if (!invalidErrors.some((error) => error.includes('"object-position"') && error.includes('bounded grammar'))) {
  throw new Error(`invalid object-position was accepted: ${invalidErrors.join('; ')}`);
}

console.log('✔ declared object-position is bounded and emitted on React + HTML');
