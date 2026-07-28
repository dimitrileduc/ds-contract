import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitFigmaScript } from '../../core/emit-figma-script.js';
import { emitHtml } from '../../core/emit-html.js';
import { emitReact } from '../../core/emit-react.js';
import { emitReactInline } from '../../core/emit-react-inline.js';

const fixture = ContractSchema.parse({
  id: 'fixture.structured-rich-text',
  name: 'StructuredRichText',
  version: '1.0.0',
  description: 'Independent fixture: one Figma TEXT property carries structured strong ranges in code.',
  semantics: { element: 'div' },
  props: [{
    name: 'body',
    type: 'rich-text',
    default: [
      { text: 'Measured ' },
      { text: 'emphasis', strong: true },
      { text: ' stays structured.' },
    ],
    bindings: {
      figma: { kind: 'TEXT', property: 'Body' },
      code: { prop: 'body' },
    },
  }],
  states: [],
  anatomy: {
    root: {
      parts: {
        Body: {
          content: {
            prop: 'body',
            marks: { strong: '{fixture.weight.bold}' },
          },
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/StructuredRichText', export: 'StructuredRichText' },
  },
});

const tokenTree = {
  primitives: {
    fixture: {
      weight: {
        bold: { $value: 700, $type: 'fontWeight' },
      },
    },
  },
  semantic: {},
  light: {},
  dark: {},
  brands: { default: {} },
};
const tokens = new Set(['fixture.weight.bold']);
const contracts = new Map([[fixture.id, fixture]]);
const ctx = { tokens, icons: new Map<string, string>(), contracts };

const react = emitReact(fixture, ctx);
if (!react.tsx.includes("body?: Array<{ text: string; strong?: boolean }>")) {
  throw new Error('React prop did not preserve structured rich-text segments');
}
if (!react.tsx.includes('body.map((segment, index)')) {
  throw new Error('React content flattened rich-text instead of rendering segments');
}
if (!react.css.includes('.Body > strong') || !react.css.includes('font-weight: var(--fixture-weight-bold)')) {
  throw new Error('React CSS did not govern the strong mark with its declared token');
}

const inline = emitReactInline(fixture, {
  tokens: tokenTree,
  icons: new Map(),
  contracts,
  mode: 'light',
}).tsx;
if (!inline.includes('body.map((segment, index)') || !inline.includes('fontWeight: 700')) {
  throw new Error('React inline did not render structured strong segments with the resolved token');
}

const html = emitHtml(fixture, ctx);
if (!html.html.includes('Measured <strong>emphasis</strong> stays structured.')) {
  throw new Error('HTML flattened or escaped the structured strong segment');
}
if (!html.css.includes('.structured-rich-text__Body > strong') || !html.css.includes('font-weight: var(--fixture-weight-bold)')) {
  throw new Error('HTML CSS did not govern the strong mark with its declared token');
}

const figma = emitFigmaScript(fixture, {
  tokens: tokenTree,
  icons: new Map(),
  contracts,
});
if (!figma.includes('"characters":"Measured emphasis stays structured."')) {
  throw new Error('Figma TEXT default did not flatten structured segments to its native string value');
}
if (figma.includes('[object Object]')) {
  throw new Error('Figma projection stringified structured segments unsafely');
}

console.log('✔ structured rich-text stays typed and marked in code, and flattens honestly to one Figma TEXT value');
