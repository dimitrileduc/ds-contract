import { ContractSchema } from '../../scripts/contract-schema.js';
import {
  BOTTOM_INSET_BORDER_SHADOW,
  emitReact,
  rootBorderPlan,
} from '../../core/emit-react.js';
import { emitHtml } from '../../core/emit-html.js';

const fixture = ContractSchema.parse({
  id: 'fixture.bottom-inset-border',
  name: 'BottomInsetBorder',
  version: '1.0.0',
  description: 'Independent fixture: a Figma-style bottom stroke must not grow an auto-sized root.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  anatomy: {
    root: {
      tokens: {
        'border-bottom-width': '{fixture.border-width}',
        'border-color': '{fixture.border-color}',
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/BottomInsetBorder', export: 'BottomInsetBorder' },
  },
});

const plan = rootBorderPlan(fixture.anatomy.root);
if (!plan.inset || plan.side !== 'bottom') {
  throw new Error(`bottom-only root stroke must select the inset plan; got ${JSON.stringify(plan)}`);
}

const ctx = {
  tokens: new Set(['fixture.border-width', 'fixture.border-color']),
  icons: new Map<string, string>(),
  contracts: new Map([[fixture.id, fixture]]),
};
for (const [surface, css] of [
  ['React', emitReact(fixture, ctx).css],
  ['HTML', emitHtml(fixture, ctx).css],
] as const) {
  for (const expected of [
    'border: 0',
    '--dsc-border-bottom-width: var(--fixture-border-width)',
    '--dsc-border-color: var(--fixture-border-color)',
    BOTTOM_INSET_BORDER_SHADOW,
  ]) {
    if (!css.includes(expected)) throw new Error(`${surface}: missing ${expected}`);
  }
  if (css.includes('border-style: solid')) {
    throw new Error(`${surface}: bottom-only stroke fell back to the box-growing border path`);
  }
}

console.log('✔ bottom-only Figma stroke is painted inset on React and HTML');
