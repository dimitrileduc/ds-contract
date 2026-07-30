/**
 * A `false` boolean in a component ref must be PASSED, not omitted.
 *
 * JSX shorthand makes `true` and "absent" look alike, so an emitter that
 * renders booleans as `value ? ' name' : ''` silently drops every `false`.
 * That is not a cosmetic difference: an omitted prop falls back to the CHILD's
 * own default, so a child defaulting to `true` renders TRUE where the contract
 * declared FALSE.  The contract fact is inverted, and nothing reports it.
 *
 * Receipt: ds.presentation/ds.hero/ds.sav/ds.texte-seo each declare
 * `accroche2: false` on their ds.section-header instance, whose own default is
 * `true` — the accroche rendered on all four until this was fixed.  The bug was
 * latent before that only by coincidence: the pre-existing `false` values
 * (ds.button iconLeft/iconRight, ds.nav-item actif) all matched their child's
 * `false` default, so omitting them happened to be harmless.
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitReact } from '../../core/emit-react.js';
import { emitReactInline } from '../../core/emit-react-inline.js';

const fail = (message: string): never => {
  console.error(`✘ component-boolean-false-propagation: ${message}`);
  process.exit(1);
};

/** The child's default is deliberately `true` — that is what makes omission lossy. */
const child = ContractSchema.parse({
  id: 'fixture.bool-child',
  name: 'BoolChild',
  version: '1.0.0',
  status: 'draft',
  description: 'Child whose boolean prop defaults to true, so omission is not neutral.',
  semantics: { element: 'div' },
  props: [
    {
      name: 'shown',
      type: 'boolean',
      default: true,
      bindings: { figma: { kind: 'BOOLEAN', property: 'Shown' }, code: { prop: 'shown' } },
    },
    {
      name: 'hidden',
      type: 'boolean',
      default: false,
      bindings: { figma: { kind: 'BOOLEAN', property: 'Hidden' }, code: { prop: 'hidden' } },
    },
  ],
  states: [],
  events: [],
  anatomy: {
    root: {
      parts: {
        label: { element: 'span', visibleWhen: { prop: 'shown' } },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/BoolChild', export: 'BoolChild' },
  },
});

const parent = ContractSchema.parse({
  id: 'fixture.bool-parent',
  name: 'BoolParent',
  version: '1.0.0',
  status: 'draft',
  description: 'Parent that turns the child default OFF and another ON.',
  semantics: { element: 'section' },
  props: [],
  states: [],
  events: [],
  anatomy: {
    root: {
      parts: {
        // `shown: false` fights the child's `true` default — the load-bearing case.
        // `hidden: true` guards the opposite direction against a regression.
        composed: { component: { id: child.id, props: { shown: false, hidden: true } } },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/BoolParent', export: 'BoolParent' },
  },
});

const contracts = new Map([[child.id, child], [parent.id, parent]]);
const tokens = { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } };

const surfaces = [
  ['React', emitReact(parent, { tokens: new Set(), icons: new Map(), contracts }).tsx],
  [
    'React inline',
    emitReactInline(parent, { tokens, icons: new Map(), contracts, mode: 'light' }).tsx,
  ],
] as const;

for (const [surface, source] of surfaces) {
  const instance = /<BoolChild[^/>]*\/?>/.exec(source);
  if (instance === null) fail(`${surface} did not render the composed child at all`);
  const jsx = instance[0];

  // The declared `false` must survive as an explicit value.
  if (!/\bshown=\{false\}/.test(jsx)) {
    fail(
      `${surface} dropped the declared \`shown: false\`: rendered ${JSON.stringify(jsx)} — ` +
        'an omitted prop falls back to the child default (true), inverting the contract fact',
    );
  }
  // Bare `shown` would mean TRUE — the exact inversion this guards.
  if (/\bshown(?!=)/.test(jsx)) {
    fail(`${surface} emitted bare \`shown\` (JSX shorthand for true) instead of shown={false}: ${jsx}`);
  }
  // The opposite direction must keep working.
  if (!/\bhidden(=\{true\}|\s|\/|>)/.test(jsx)) {
    fail(`${surface} lost the declared \`hidden: true\`: ${jsx}`);
  }
}

console.log(
  'component-boolean-false-propagation ok: a declared `false` reaches the child explicitly on both React surfaces, so a child default of `true` cannot silently win',
);
