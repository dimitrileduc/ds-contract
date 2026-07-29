/** A visual icon correction must move its SVG, never its measured wrapper. */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitHtml } from '../../core/emit-html.js';
import { generateCss, validateContract } from '../../core/emit-react.js';
import { launchBrowser } from '../../extract/figma/visual-parity/render.js';

const fixture = ContractSchema.parse({
  id: 'fixture.icon-glyph-geometry', name: 'GlyphGeometry', version: '1.0.0', status: 'draft',
  description: 'SVG-only optical correction.', semantics: { element: 'div' },
  props: [{ name: 'shift', type: 'boolean', default: false, bindings: { figma: { kind: 'BOOLEAN', property: 'Shift' }, code: { prop: 'shift' } } }],
  states: [],
  anatomy: { root: { layout: { display: 'flex', direction: 'row', align: 'center' }, parts: {
    Chevron: { icon: { asset: 'fixture-chevron', size: 16 }, glyphStylesWhen: [{ prop: 'shift', styles: { transform: 'translateY(-1px)' } }] },
  } } },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/GlyphGeometry', export: 'GlyphGeometry' } },
});
const contracts = new Map([[fixture.id, fixture]]);
const icons = new Map([['fixture-chevron', '<svg viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>']]);
const errors: string[] = [];
validateContract(fixture, contracts, errors, icons);
if (errors.length) throw new Error(`valid glyph adjustment was refused: ${errors.join('; ')}`);

const cssErrors: string[] = [];
const reactCss = generateCss(fixture, new Set(), cssErrors);
if (cssErrors.length || !reactCss.includes('.root[data-shift] .Chevron svg') || reactCss.includes('.root[data-shift] .Chevron {\n  transform')) {
  throw new Error(`React CSS did not isolate correction to the SVG:\n${[...cssErrors, reactCss].join('\n')}`);
}

const invalidWrapper = structuredClone(fixture);
invalidWrapper.anatomy.root.parts.Chevron.glyphStylesWhen = undefined;
invalidWrapper.anatomy.root.parts.Chevron.stylesWhen = [{ prop: 'shift', styles: { transform: 'translateY(-1px)' } }];
const wrapperErrors: string[] = [];
validateContract(invalidWrapper, new Map([[invalidWrapper.id, invalidWrapper]]), wrapperErrors, icons);
if (!wrapperErrors.some((error) => error.includes('must not transform an icon/vector wrapper'))) {
  throw new Error(`wrapper translation was accepted: ${wrapperErrors.join('; ')}`);
}

const emitted = emitHtml(fixture, { tokens: new Set(), icons, contracts });
const browser = await launchBrowser();
try {
  const page = await browser.newPage();
  await page.setContent(`<style>${emitted.css}</style>${emitted.html}`, { waitUntil: 'load' });
  const receipt = await page.evaluate(`(() => {
    const inspect = (root) => {
      const wrapper = root?.querySelector('[data-part="Chevron"]');
      const svg = wrapper?.querySelector('svg');
      if (!wrapper || !svg) return null;
      const box = wrapper.getBoundingClientRect();
      return { width: box.width, height: box.height, wrapperTransform: getComputedStyle(wrapper).transform, svgTransform: getComputedStyle(svg).transform, glyphOffsetY: svg.getBoundingClientRect().y - box.y };
    };
    return {
      shifted: inspect(document.querySelector('.glyph-geometry[data-shift="true"]')),
      unshifted: inspect(document.querySelector('.glyph-geometry:not([data-shift])')),
    };
  })()`);
  if (!receipt.shifted || !receipt.unshifted || receipt.shifted.wrapperTransform !== 'none' || receipt.shifted.svgTransform === 'none' || receipt.shifted.width !== receipt.unshifted.width || receipt.shifted.height !== receipt.unshifted.height || Math.abs(receipt.shifted.glyphOffsetY + 1) > 0.01) {
    throw new Error(`glyph correction moved the wrapper or missed its SVG: ${JSON.stringify(receipt)}`);
  }
} finally {
  await browser.close();
}

console.log('icon-glyph-geometry ok: SVG optical correction leaves the measured wrapper bbox stable');
