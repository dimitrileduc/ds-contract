/**
 * Per-item ENUM field on a repeat collection (schema v12 `repeat` + arrayOf).
 *
 * A collection's records may differ by more than text: the Piqueray TexteSEO
 * accordion draws its SECOND row open and the other two closed. Before this
 * capability an arrayOf field could only be `text | number | boolean`, so a
 * per-item enum was inexpressible — the generated collection rendered every
 * row in the child's default state and silently lost the observed geometry.
 *
 * The point is the TYPE: an enum field emits a literal union
 * (`'ferme' | 'ouvert'`), never a widened `string`. A free string would type
 * every collection record as "any text" and hand the enum's whole guarantee
 * back — the union is what makes a per-item state checkable in code, mappable
 * through the child's `bindings.figma.values` on the canvas, and refusable by
 * name when a record carries a value the child does not declare.
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitFigmaScript } from '../../core/emit-figma-script.js';
import { emitHtml } from '../../core/emit-html.js';
import { emitReact, generateStories, validateContract } from '../../core/emit-react.js';
import { emitReactInline } from '../../core/emit-react-inline.js';

const fail = (message: string): never => {
  console.error(`✘ repeat-enum-item-field: ${message}`);
  process.exit(1);
};

const parse = (label: string, doc: unknown) => {
  try {
    return ContractSchema.parse(doc);
  } catch (error) {
    return fail(
      `the schema refused ${label} — a per-item enum field is not expressible in arrayOf: ${
        error instanceof Error ? error.message.split('\n').slice(0, 6).join(' ') : String(error)
      }`,
    );
  }
};

/** The child owns the state: one enum prop with a real VARIANT binding, and a
 *  part that only exists in the `ouvert` value (the geometry the state buys). */
const row = parse('the child contract', {
  id: 'fixture.enum-row',
  name: 'EnumRow',
  version: '1.0.0',
  status: 'draft',
  description: 'Child row whose open/closed state is an enum prop bound to a Figma VARIANT.',
  semantics: { element: 'div' },
  props: [
    {
      name: 'etat',
      type: { enum: ['ferme', 'ouvert'] },
      default: 'ferme',
      bindings: {
        figma: { kind: 'VARIANT', property: 'Etat', values: { ferme: 'Ferme', ouvert: 'Ouvert' } },
        code: { prop: 'etat' },
      },
    },
    {
      name: 'titre',
      type: 'text',
      default: 'Question',
      required: true,
      bindings: { figma: { kind: 'TEXT', property: 'Titre' }, code: { prop: 'titre' } },
    },
  ],
  states: [],
  events: [],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'column', align: 'stretch' },
      parts: {
        Titre: { content: { prop: 'titre' } },
        // The open row's extra geometry: present ONLY when etat is ouvert.
        Contenu: {
          text: 'Réponse',
          visibleWhen: { prop: 'etat', equals: 'ouvert' },
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/EnumRow', export: 'EnumRow' },
  },
});

/** The parent repeats the row over an arrayOf prop with a per-item enum field. */
const listDoc = {
  id: 'fixture.enum-list',
  name: 'EnumList',
  version: '1.0.0',
  status: 'draft',
  description: 'Parent collection whose records carry a per-item state, not only text.',
  semantics: { element: 'div' },
  props: [
    {
      name: 'items',
      type: { arrayOf: { titre: 'text', etat: { enum: ['ferme', 'ouvert'] } } },
      bindings: { figma: { kind: 'NONE' }, code: { prop: 'items' } },
    },
  ],
  states: [],
  events: [],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'column', align: 'stretch' },
      parts: {
        Row: {
          component: { id: 'fixture.enum-row' },
          repeat: {
            itemsProp: 'items',
            sample: [
              { titre: 'Fermée', etat: 'ferme' },
              { titre: 'Ouverte', etat: 'ouvert' },
            ],
          },
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/EnumList', export: 'EnumList' },
  },
};

// (a) the schema expresses a per-item enum field at all.
const list = parse('the parent contract', listDoc);

const contracts = new Map([
  [row.id, row],
  [list.id, list],
]);
const tokens = { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } };

const errors: string[] = [];
validateContract(list, contracts, errors, new Map());
if (errors.length > 0) fail(`a valid per-item enum field was refused: ${errors.join('; ')}`);

// (b) the emitted TS type is a literal union — never a widened string.
const react = emitReact(list, { tokens: new Set(), icons: new Map(), contracts }).tsx;
const inline = emitReactInline(list, { tokens, icons: new Map(), contracts, mode: 'light' }).tsx;
for (const [surface, source] of [
  ['React', react],
  ['React inline', inline],
] as const) {
  if (!source.includes(`items?: Array<{ titre: string; etat: 'ferme' | 'ouvert' }>;`)) {
    fail(`${surface} did not type the per-item enum field as a literal union`);
  }
  if (source.includes('etat: string')) {
    fail(`${surface} widened the per-item enum field to a free string — the union IS the capability`);
  }
  if (source.includes('[object Object]')) {
    fail(`${surface} stringified the field's enum object into the record type`);
  }
}

// (c) the per-item value reaches the child's own prop on the live React surface.
if (!react.includes('<EnumRow key={index} titre={item.titre} etat={item.etat} />')) {
  fail('React did not thread the per-item enum value into the child instance');
}
// The generated story feeds the observed sample through that same type.
const stories = generateStories(list, contracts);
if (!stories.includes('"etat":"ouvert"')) {
  fail('the generated story dropped the per-item state from the observed sample');
}

// (d) the static surfaces render the sample WITH each record's own state.
if (!inline.includes('etat="ferme"') || !inline.includes('etat="ouvert"')) {
  fail('React inline rendered the sample without each record\'s own state');
}
const html = emitHtml(list, { tokens: new Set(), icons: new Map(), contracts }).html;
const openOnly = html.split('Réponse').length - 1;
if (openOnly !== 1) {
  fail(
    `HTML rendered the open row's extra geometry ${openOnly}× — the per-item state must select it exactly once (once per "ouvert" record)`,
  );
}

// The canvas maps the per-item value through the CHILD's declared bindings.
// (The emitted spec is pretty-printed, so compare on collapsed whitespace.)
const figma = emitFigmaScript(list, { tokens, icons: new Map(), contracts }).replace(/\s+/g, '');
if (!figma.includes('"Etat":"Ferme"') || !figma.includes('"Etat":"Ouvert"')) {
  fail('the Figma projection did not map per-item enum values through the child\'s bindings.figma.values');
}
if (figma.includes('"Etat":"ferme"') || figma.includes('"Etat":"ouvert"')) {
  fail('the Figma projection leaked canonical contract values onto the canvas instead of the mapped variant values');
}

// (e) refusals BY NAME — the union is enforced, not decorative.
const outOfEnumSample = structuredClone(listDoc);
outOfEnumSample.anatomy.root.parts.Row.repeat.sample[1].etat = 'entrouvert';
const sampleErrors: string[] = [];
validateContract(parse('the out-of-enum sample', outOfEnumSample), contracts, sampleErrors, new Map());
if (!sampleErrors.some((e) => e.includes('sample[1].etat') && e.includes('entrouvert'))) {
  fail(`a sample value outside the field's enum was not refused by name: ${sampleErrors.join('; ') || '(no error)'}`);
}

const widerThanChild = structuredClone(listDoc);
widerThanChild.props[0].type.arrayOf.etat = { enum: ['ferme', 'ouvert', 'plie'] };
const widthErrors: string[] = [];
validateContract(parse('the over-wide field enum', widerThanChild), contracts, widthErrors, new Map());
if (!widthErrors.some((e) => e.includes('"etat"') && e.includes('fixture.enum-row'))) {
  fail(
    `a field enum wider than the child's own enum was not refused by name: ${widthErrors.join('; ') || '(no error)'}`,
  );
}

console.log(
  '✔ repeat-enum-item-field ok: a per-item enum field types as a literal union, reaches the child prop in React, selects each record\'s own state on the static surfaces, maps through the child\'s variant values on the canvas, and refuses out-of-enum values by name',
);
