import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitFigmaScript } from '../../core/emit-figma-script.js';
import { emitReact } from '../../core/emit-react.js';
import { emitReactInline } from '../../core/emit-react-inline.js';

const child = ContractSchema.parse({
  id: 'fixture.child-action',
  name: 'ChildAction',
  version: '1.0.0',
  description: 'A composed child whose text API is JSX children.',
  semantics: { element: 'button' },
  props: [{
    name: 'label',
    type: 'text',
    default: 'Contactez-nous',
    bindings: {
      figma: { kind: 'TEXT', property: 'Label' },
      code: { prop: 'children' },
    },
  }],
  states: [],
  anatomy: {
    root: {
      parts: {
        label: { content: { prop: 'children' } },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/ChildAction', export: 'ChildAction' },
  },
});

const parent = ContractSchema.parse({
  id: 'fixture.children-prop-composition',
  name: 'ChildrenPropComposition',
  version: '1.0.0',
  description: 'A parent both maps and omits a child children prop.',
  semantics: { element: 'div' },
  props: [{
    name: 'ctaLabel',
    type: 'text',
    default: 'Demander un devis',
    bindings: {
      figma: { kind: 'NONE' },
      code: { prop: 'ctaLabel' },
    },
  }],
  states: [],
  anatomy: {
    root: {
      parts: {
        mappedAction: {
          component: {
            id: child.id,
            props: { label: '{ctaLabel}' },
          },
        },
        defaultAction: {
          component: { id: child.id },
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/ChildrenPropComposition', export: 'ChildrenPropComposition' },
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
  if (!source.includes('<ChildAction>{ctaLabel}</ChildAction>')) {
    throw new Error(`${surface}: mapped children prop was not emitted as JSX child content`);
  }
  if (source.includes('children={ctaLabel}')) {
    throw new Error(`${surface}: mapped children prop is duplicated as a children attribute`);
  }
  if (!source.includes('<ChildAction>Contactez-nous</ChildAction>')) {
    throw new Error(`${surface}: an unmapped child no longer receives its declared default`);
  }
}

const figma = emitFigmaScript(parent, {
  tokens: { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } },
  icons: new Map(),
  contracts,
});
const data = JSON.parse(figma.match(/const COMPONENTS = (\[[\s\S]*?\n\]);/)![1])[0];
const mappedInstance = data.variants[0].spec.children.find((spec: { name: string }) => spec.name === 'mappedAction');
if (mappedInstance?.depProps?.Label !== 'Demander un devis') {
  throw new Error('Figma: code-only parent default was not propagated to the child TEXT property');
}
if (JSON.stringify(mappedInstance.depProps).includes('{ctaLabel}')) {
  throw new Error('Figma: unresolved code-only parent placeholder reached child depProps');
}
if (data.textProps.length !== 0) {
  throw new Error('Figma: code-only parent prop incorrectly created a canvas TEXT property');
}

console.log('✔ composed children prop mappings emit one JSX child and static Figma child defaults');
