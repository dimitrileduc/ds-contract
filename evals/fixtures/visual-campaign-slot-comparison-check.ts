/**
 * Comparison-only slot composition regression.
 *
 * A visual campaign may render a real immutable occurrence whose parent has a
 * restricted slot (Field → Input/Select/Textarea).  The occurrence-specific
 * child and its text are evidence inputs, not new defaults written into the
 * shipping parent contract.  This guard proves that the preview clone accepts
 * only an existing accepted child and scalar child props, and refuses every
 * attempt to smuggle an unrelated component or arbitrary object into it.
 */
import { ContractSchema, emitHtml } from '../../core/index.js';
import { applyCampaignSlotOverrides } from '../../extract/figma/visual-parity/render.js';

const problems: string[] = [];
const expect = (condition: unknown, message: string): void => {
  if (!condition) problems.push(message);
};

const input = ContractSchema.parse({
  id: 'fixture.slot-input',
  name: 'FixtureSlotInput',
  version: '1.0.0',
  description: 'A real native input used only by the campaign-slot fixture.',
  semantics: { element: 'input' },
  props: [
    {
      name: 'value',
      type: 'text',
      default: 'Default value',
      bindings: { figma: { kind: 'TEXT', property: 'Valeur' }, code: { prop: 'value' } },
    },
  ],
  states: [],
  anatomy: { root: { attrs: { type: 'text' }, parts: { Value: { content: { prop: 'value' } } } } },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'fixture', export: 'FixtureSlotInput' } },
});

const textarea = ContractSchema.parse({
  id: 'fixture.slot-textarea',
  name: 'FixtureSlotTextarea',
  version: '1.0.0',
  description: 'A second legal child to prove the override keeps slot restrictions.',
  semantics: { element: 'textarea' },
  props: [
    {
      name: 'value',
      type: 'text',
      default: 'Default message',
      bindings: { figma: { kind: 'TEXT', property: 'Valeur' }, code: { prop: 'value' } },
    },
  ],
  states: [],
  anatomy: { root: { parts: { Value: { content: { prop: 'value' } } } } },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'fixture', export: 'FixtureSlotTextarea' } },
});

const foreign = ContractSchema.parse({
  id: 'fixture.foreign',
  name: 'FixtureForeign',
  version: '1.0.0',
  description: 'Not accepted by the Field-like slot.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  anatomy: { root: { text: 'Foreign' } },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'fixture', export: 'FixtureForeign' } },
});

const field = ContractSchema.parse({
  id: 'fixture.slot-field',
  name: 'FixtureSlotField',
  version: '1.0.0',
  description: 'A Field-like parent with a restricted Saisie slot.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  anatomy: {
    root: {
      parts: {
        Saisie: {
          slot: {
            name: 'children',
            accepts: [input.id, textarea.id],
            acceptsMode: 'restrict',
            min: 1,
            max: 1,
            required: true,
            defaultContent: [{ id: input.id, props: { value: 'Default value' } }],
          },
        },
      },
    },
  },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'fixture', export: 'FixtureSlotField' } },
});

const contracts = new Map([
  [field.id, field],
  [input.id, input],
  [textarea.id, textarea],
  [foreign.id, foreign],
]);

const applied = applyCampaignSlotOverrides(field, contracts, {
  Saisie: { contractId: textarea.id, props: { value: 'Observed immutable message' } },
});
expect(applied.ok, `accepted immutable slot override was refused: ${applied.ok ? '' : applied.error}`);
if (applied.ok) {
  expect(
    applied.contract.anatomy.root.parts.Saisie.slot?.defaultContent?.[0]?.id === textarea.id,
    'preview clone did not replace the Saisie default with the observed accepted child',
  );
  expect(
    applied.contract.anatomy.root.parts.Saisie.slot?.defaultContent?.[0]?.props?.value === 'Observed immutable message',
    'preview clone did not carry the observed child value',
  );
  expect(
    field.anatomy.root.parts.Saisie.slot?.defaultContent?.[0]?.id === input.id,
    'comparison-only slot override mutated the shipping Field contract',
  );
  const html = emitHtml(applied.contract, { tokens: new Set(), icons: new Map(), contracts }).html;
  expect(html.includes('Observed immutable message'), 'comparison HTML did not render the observed child value');
}

for (const [label, overrides] of [
  ['unknown part', { Missing: { contractId: input.id, props: { value: 'x' } } }],
  ['unaccepted child', { Saisie: { contractId: foreign.id, props: {} } }],
  ['unknown child prop', { Saisie: { contractId: input.id, props: { madeUp: 'x' } } }],
  ['structured child prop', { Saisie: { contractId: input.id, props: { value: { injected: true } } } }],
] as const) {
  const result = applyCampaignSlotOverrides(field, contracts, overrides);
  expect(!result.ok, `${label} override must be refused before preview rendering`);
}

if (problems.length > 0) {
  throw new Error(`✘ visual-campaign-slot-comparison:\n- ${problems.join('\n- ')}`);
}

console.log('visual-campaign-slot-comparison ok: immutable accepted slot children render only in a cloned campaign preview');
