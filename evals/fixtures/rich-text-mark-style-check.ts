/** A rich-text mark retains Figma's observed local typography without
 * falling back to browser-default <strong> styling. */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitHtml } from '../../core/emit-html.js';
import { generateCss, validateContract } from '../../core/emit-react.js';

const fixture = ContractSchema.parse({
  id: 'fixture.rich-text-mark-style',
  name: 'RichTextMarkStyle',
  version: '1.0.0',
  status: 'draft',
  description: 'A governed strong range with Figma-observed size and leading.',
  semantics: { element: 'div' },
  props: [{
    name: 'body', type: 'rich-text',
    default: [{ text: 'Lead-in', strong: true }, { text: ' body.' }],
    bindings: { figma: { kind: 'TEXT', property: 'Body' }, code: { prop: 'body' } },
  }],
  states: [],
  anatomy: { root: { parts: {
    body: {
      content: {
        prop: 'body',
        marks: { strong: { 'font-weight': '700', 'font-size': '18px', 'line-height': '27px' } },
      },
    },
  } } },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/RichTextMarkStyle', export: 'RichTextMarkStyle' } },
});

const context = new Map([[fixture.id, fixture]]);
const errors: string[] = [];
validateContract(fixture, context, errors, new Map());
if (errors.length > 0) throw new Error(`valid strong mark style was refused: ${errors.join('; ')}`);

const cssErrors: string[] = [];
const css = generateCss(fixture, new Set(), cssErrors);
const expected = ['font-weight: 700', 'font-size: 18px', 'line-height: 27px'];
if (cssErrors.length > 0 || !expected.every((declaration) => css.includes(declaration))) {
  throw new Error(`React CSS did not project governed strong style:\n${[...cssErrors, css].join('\n')}`);
}
const html = emitHtml(fixture, { tokens: new Set(), icons: new Map(), contracts: context });
if (!expected.every((declaration) => html.css.includes(declaration)) || !html.html.includes('<strong>Lead-in</strong>')) {
  throw new Error(`HTML did not project semantic strong style:\n${html.css}\n${html.html}`);
}

let missingWeightRefused = false;
try {
  ContractSchema.parse({ ...fixture, anatomy: { root: { parts: { body: {
    content: { prop: 'body', marks: { strong: { 'font-size': '18px' } } },
  } } } } });
} catch {
  missingWeightRefused = true;
}
if (!missingWeightRefused) throw new Error('strong mark without governed font-weight was accepted');

let outOfRangeWeightRefused = false;
try {
  ContractSchema.parse({ ...fixture, anatomy: { root: { parts: { body: {
    content: { prop: 'body', marks: { strong: { 'font-weight': '950' } } },
  } } } } });
} catch {
  outOfRangeWeightRefused = true;
}
if (!outOfRangeWeightRefused) throw new Error('out-of-range strong font-weight was accepted');

console.log('✔ rich-text strong mark styles are governed, emitted, and bounded');
