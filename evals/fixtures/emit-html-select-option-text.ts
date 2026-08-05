/**
 * A part that IS the `<select>` tag emits its text inside an `<option>` on
 * the html surface (tinyspec select-option-emit — DW-014-001).
 *
 * The HTML5 content model permits only `<option>`/`<optgroup>` inside a
 * `<select>`: bare text is dropped by the parser at tree construction, so it
 * never reaches the render tree — the exact mechanism behind 014's empty
 * select capture and its maskCoveragePct 0 (receipt select-exclusion.json:
 * confirmed NOT a headless-Chromium limitation by an isolated same-browser
 * repro). renderPart()'s existing `<option>` default only covers a CHILD
 * part with no authored element under a select parent — not the part that
 * authors `element: "select"` itself, which is ds.select's real shape.
 *
 * Mirror discipline: the shipping React surface (core/emit-react.ts, pinned
 * by native-checkbox-and-select-render-correctly) emits
 * `<select …><option>{value}</option></select>` — the option carries the
 * ONE visible text and no attribute at all (ds.select: `states: []`). The
 * html surface must say exactly that much and no more, on BOTH text-bearing
 * branches (`content` and `text`).
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitHtml } from '../../core/emit-html.js';

const anchors = {
  figma: { fileKey: null, componentSetKey: null },
  code: { importPath: 'src/components/SelectOption', export: 'SelectOption' },
};

/** ds.select's exact shape: a div wrapper whose `valeur` part authors
 *  `element: "select"` and carries a `content` prop. */
const contentShape = ContractSchema.parse({
  id: 'fixture.select-option-content',
  name: 'SelectOptionContent',
  version: '1.0.0',
  description: 'Synthetic ds.select shape — content prop inside an element:"select" part.',
  semantics: { element: 'div' },
  props: [
    {
      name: 'value',
      type: 'text',
      default: 'Texte de saisie',
      bindings: { figma: { kind: 'TEXT', property: 'Valeur' }, code: { prop: 'value' } },
    },
  ],
  states: [],
  anatomy: {
    root: {
      parts: {
        valeur: { element: 'select', content: { prop: 'value' } },
      },
    },
  },
  anchors,
});

/** Same defect, second branch: a literal `text` part that IS the select. */
const textShape = ContractSchema.parse({
  id: 'fixture.select-option-text',
  name: 'SelectOptionText',
  version: '1.0.0',
  description: 'Synthetic contract — literal text inside an element:"select" part.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  anatomy: {
    root: {
      parts: {
        valeur: { element: 'select', text: 'Choisir' },
      },
    },
  },
  anchors,
});

const html = (c: typeof contentShape) =>
  emitHtml(c, { tokens: new Set<string>(), icons: new Map(), contracts: new Map([[c.id, c]]) }).html;

for (const [contract, branch, text] of [
  [contentShape, 'content', 'Texte de saisie'],
  [textShape, 'text', 'Choisir'],
] as const) {
  const out = html(contract);
  const select = out.match(/<select[^>]*>([\s\S]*?)<\/select>/);
  if (!select) {
    throw new Error(`${branch} branch: no <select> element emitted at all. Got:\n${out}`);
  }
  // The one visible text, wrapped — never a bare child the parser would drop.
  if (select[1] !== `<option>${text}</option>`) {
    throw new Error(
      `${branch} branch: <select> must contain exactly \`<option>${text}</option>\` — the React mirror's shape, text only, no state attribute (ds.select carries states: []). ` +
        `A bare text child is dropped by the HTML5 parser at tree construction (DW-014-001: empty capture, maskCoveragePct 0). Got inner content:\n${select[1]}\nFull html:\n${out}`,
    );
  }
}

console.log(
  'emit-html select option: a part that IS the <select> wraps its text in a bare <option> on both branches (content and text) — mirror of the shipping React surface, no state attributes.',
);
