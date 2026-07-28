import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitReact } from '../../core/emit-react.js';
import { emitReactInline } from '../../core/emit-react-inline.js';
import { emitHtml } from '../../core/emit-html.js';

const fixture = ContractSchema.parse({
  id: 'fixture.native-button',
  name: 'NativeButton',
  version: '1.0.0',
  description: 'Independent native button fixture.',
  semantics: { element: 'button' },
  props: [],
  states: [],
  anatomy: { root: { text: 'Action' } },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/NativeButton', export: 'NativeButton' },
  },
});
const contracts = new Map([[fixture.id, fixture]]);
const react = emitReact(fixture, { tokens: new Set(), icons: new Map(), contracts }).tsx;
const inline = emitReactInline(fixture, {
  tokens: { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } },
  icons: new Map(),
  contracts,
  mode: 'light',
}).tsx;
const html = emitHtml(fixture, { tokens: new Set(), icons: new Map(), contracts }).html;
for (const [surface, source] of [['React', react], ['React inline', inline], ['HTML', html]] as const) {
  if (!source.includes('type="button"')) throw new Error(`${surface}: native button defaults to form submit`);
}
console.log('✔ native button roots are type=button on every generated surface');
