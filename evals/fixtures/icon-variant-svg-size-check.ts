import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitReact } from '../../core/emit-react.js';
import { emitHtml } from '../../core/emit-html.js';

const fixture = ContractSchema.parse({
  id: 'fixture.variant-icon-size',
  name: 'VariantIconSize',
  version: '1.0.0',
  description: 'Independent fixture: a governed icon shrinks with a size axis.',
  semantics: { element: 'div' },
  props: [{
    name: 'size',
    type: { enum: ['large', 'small'] },
    default: 'large',
    bindings: {
      figma: {
        kind: 'VARIANT',
        property: 'Size',
        values: { large: 'Large', small: 'Small' },
      },
      code: { prop: 'size' },
    },
  }],
  states: [],
  anatomy: {
    root: {
      parts: {
        glyph: {
          icon: { asset: 'fixture-chevron', size: 32 },
          literalsByProp: [{
            prop: 'size',
            map: { small: { width: '24px', height: '24px' } },
          }],
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/VariantIconSize', export: 'VariantIconSize' },
  },
});

const svg = '<svg viewBox="0 0 32 32"><path d="M0 0"/></svg>';
const ctx = {
  tokens: new Set<string>(),
  icons: new Map([['fixture-chevron', svg]]),
  contracts: new Map([[fixture.id, fixture]]),
};
const surfaces = [
  ['React', emitReact(fixture, ctx).css, '.size-small .glyph svg'],
  ['HTML', emitHtml(fixture, ctx).css, '.variant-icon-size--size-small .variant-icon-size__glyph svg'],
] as const;

for (const [surface, css, selector] of surfaces) {
  const start = css.indexOf(selector);
  const rule = start < 0 ? '' : css.slice(start, css.indexOf('}', start) + 1);
  if (!rule.includes('width: 24px') || !rule.includes('height: 24px')) {
    throw new Error(`${surface}: ${selector} must resize the painted SVG, not only its wrapper`);
  }
}

console.log('✔ variant icon size reaches the painted SVG on React and HTML');
