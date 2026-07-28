import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitReact } from '../../core/emit-react.js';
import { emitReactInline } from '../../core/emit-react-inline.js';

const child = ContractSchema.parse({
  id: 'fixture.child-action',
  name: 'ChildAction',
  version: '1.0.0',
  description: 'Independent composed child.',
  semantics: { element: 'button' },
  props: [],
  states: [],
  anatomy: { root: { text: 'Action' } },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/ChildAction', export: 'ChildAction' },
  },
});
const parent = ContractSchema.parse({
  id: 'fixture.gated-composition',
  name: 'GatedComposition',
  version: '1.0.0',
  description: 'Independent fixture: a composed child is governed by a boolean.',
  semantics: { element: 'div' },
  props: [{
    name: 'showAction',
    type: 'boolean',
    default: false,
    bindings: {
      figma: { kind: 'BOOLEAN', property: 'Show action' },
      code: { prop: 'showAction' },
    },
  }],
  states: [],
  anatomy: {
    root: {
      parts: {
        Action: {
          component: { id: child.id },
          visibleWhen: { prop: 'showAction' },
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/GatedComposition', export: 'GatedComposition' },
  },
});

const contracts = new Map([[child.id, child], [parent.id, parent]]);
const react = emitReact(parent, { tokens: new Set(), icons: new Map(), contracts }).tsx;
const inline = emitReactInline(parent, {
  tokens: { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } },
  icons: new Map(),
  contracts,
  mode: 'light',
}).tsx;
for (const [surface, source] of [['React', react], ['React inline', inline]] as const) {
  if (!source.includes('{showAction ? (<ChildAction />) : null}')) {
    throw new Error(`${surface}: composed child ignores visibleWhen`);
  }
}

console.log('✔ visibleWhen gates composed children on both React surfaces');
