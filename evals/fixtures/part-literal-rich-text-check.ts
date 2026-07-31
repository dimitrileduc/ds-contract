/**
 * A LITERAL part text must be able to carry its observed strong ranges.
 *
 * Two Piqueray paragraphs are drawn with mid-sentence bold on masters that
 * expose NO component property at all — ds.hero's sub-title (2111:3380,
 * « performance » and « la solution idéale » bold) and ds.sav's card copy
 * (2108:3103, three bold ranges around a real "\n"). With no Figma TEXT
 * property there is nothing to bind a prop to, and the schema is right to
 * refuse a rich-text prop for them: the text is a literal, not an API.
 *
 * So the LITERAL grows the marks instead, additively and with a referee that
 * makes divergence impossible:
 *   - `text` stays the flat canonical string — what the canvas draws, what
 *     every existing reader (parity, catalog, spec sheet) already reads,
 *     unchanged byte for byte;
 *   - `textSegments` splits THAT SAME string into marked ranges for the code
 *     emitters, and the referee holds `join('') === text`;
 *   - `textMarks.strong` governs the marked weight — same refusal as
 *     content.marks ("marked weight is governed, never UA-default");
 *   - a "\n" INSIDE a segment survives to the DOM (the string-expression
 *     spelling, see literal-text-newline-preservation).
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitFigmaScript } from '../../core/emit-figma-script.js';
import { emitHtml } from '../../core/emit-html.js';
import { emitReact } from '../../core/emit-react.js';
import { emitReactInline } from '../../core/emit-react-inline.js';

const fail = (message: string): never => {
  console.error(`✘ part-literal-rich-text: ${message}`);
  process.exit(1);
};

// The "\n" sits INSIDE the third segment, exactly as ds.sav draws it: the
// paragraph break is not a segment boundary.
const SEGMENTS = [
  { text: 'La ' },
  { text: 'performance', strong: true },
  { text: ' sans compromis.\nPas de panique, ' },
  { text: 'la solution idéale', strong: true },
  { text: '.' },
];
const FLAT = SEGMENTS.map((s) => s.text).join('');

const build = (over: Record<string, unknown>) => ({
  id: 'fixture.literal-rich',
  name: 'LiteralRich',
  version: '1.0.0',
  status: 'draft',
  description: 'Literal paragraph copy whose Figma source carries mixed-style bold ranges.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  events: [],
  anatomy: {
    root: {
      parts: {
        copy: {
          element: 'p',
          text: FLAT,
          declared: { 'white-space': 'pre-line' },
          tokens: { 'font-weight': '{fixture.weight.regular}' },
          // ds.hero's sub-title declares exactly this on its literal paragraph
          // (FILL width, `flex: 1 1 auto` + a measured literal). It is the
          // shape that turned the marked copy into flex ITEMS and ate every
          // space around <strong> — see the flex assertions below.
          layout: { grow: true },
          ...over,
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/LiteralRich', export: 'LiteralRich' },
  },
});

const parsed = ContractSchema.safeParse(
  build({ textSegments: SEGMENTS, textMarks: { strong: '{fixture.weight.bold}' } }),
);
if (!parsed.success) {
  fail(
    'the schema refused a literal part text with segments:\n' +
      parsed.error.issues.map((i) => `    ${i.path.join('.')}: ${i.message}`).join('\n'),
  );
}
const contract = parsed.data!;

const tokenTree = {
  primitives: {
    fixture: {
      weight: {
        regular: { $value: 400, $type: 'fontWeight' },
        bold: { $value: 700, $type: 'fontWeight' },
      },
    },
  },
  semantic: {},
  light: {},
  dark: {},
  brands: { default: {} },
};
const tokens = new Set(['fixture.weight.regular', 'fixture.weight.bold']);
const contracts = new Map([[contract.id, contract]]);

// ── React: marked ranges become semantic <strong>, the "\n" survives ─────────
const react = emitReact(contract, { tokens, icons: new Map(), contracts });
const inline = emitReactInline(contract, {
  tokens: tokenTree,
  icons: new Map(),
  contracts,
  mode: 'light',
}).tsx;

for (const [surface, source] of [['React', react.tsx], ['React inline', inline]] as const) {
  if (!source.includes('<strong')) {
    fail(
      `${surface} rendered the literal flat — no <strong> for the marked ranges` +
        (source.includes(JSON.stringify(FLAT))
          ? ' (the whole paragraph came out as one unmarked string)'
          : ''),
    );
  }
  // The bytes of the newline-bearing segment must reach the DOM as a string
  // EXPRESSION — raw JSX children collapse "\n" at compile time.
  if (!source.includes(JSON.stringify(' sans compromis.\nPas de panique, '))) {
    fail(
      `${surface} lost the "\\n" inside a segment — it must be emitted as a JSX string expression`,
    );
  }
  if (!source.includes('>performance<') && !source.includes('{"performance"}')) {
    fail(`${surface} dropped the text of a strong segment`);
  }
}
if (
  !react.css.includes('.copy > strong') ||
  !react.css.includes('font-weight: var(--fixture-weight-bold)')
) {
  fail('React CSS did not govern the literal <strong> weight with its declared token');
}

// ── A part hosting inline marks must NOT be a flex CONTAINER ─────────────────
// `display: flex` makes each inline run a flex item, so every space around
// <strong> collapses to nothing: "La " + <strong>performance</strong> renders
// "Laperformance", and the runs stack as blocks instead of flowing. The part
// still has to be a flex ITEM of its parent, so `grow` must survive.
const copyRule = react.css.slice(react.css.indexOf('.copy {'));
const copyDecls = copyRule.slice(0, copyRule.indexOf('}'));
if (copyDecls.includes('display: flex')) {
  fail(
    'the marked literal part became a flex CONTAINER — every inline run turns into a flex item and the spaces around <strong> vanish ("La performance" → "Laperformance")',
  );
}
if (!copyDecls.includes('flex: 1 1 auto')) {
  fail('the part stopped being a flex ITEM of its parent — layout.grow must still be emitted');
}
if (!inline.includes('fontWeight: 700') && !inline.includes('fontWeight: "700"')) {
  fail('React inline did not resolve the governed strong weight into its inline style');
}

// ── HTML: same marks, escaped once, never doubled ────────────────────────────
const html = emitHtml(contract, { tokens, icons: new Map(), contracts }).html;
if (!html.includes('<strong>performance</strong>')) {
  fail('HTML did not render the marked range as semantic <strong>');
}
if (html.includes('&lt;strong&gt;')) {
  fail('HTML escaped its own <strong> markup');
}

// ── Canvas: ONE flat TEXT value — the declared, unchanged limit ──────────────
const figma = emitFigmaScript(contract, { tokens: tokenTree, icons: new Map(), contracts });
if (!figma.includes(JSON.stringify(FLAT))) {
  fail('the Figma projection lost the flat literal string it has always drawn');
}
if (figma.includes('[object Object]')) {
  fail('the Figma projection stringified the segments unsafely');
}

// ── Refusal 1: marked segments with no governed weight ───────────────────────
const refuse = (label: string, raw: unknown, ...needles: string[]) => {
  const p = ContractSchema.safeParse(raw);
  let message = p.success
    ? ''
    : p.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
  if (p.success) {
    try {
      emitReact(p.data!, { tokens, icons: new Map(), contracts: new Map([[p.data!.id, p.data!]]) });
    } catch (error) {
      message = String((error as Error).message);
    }
  }
  if (!message) fail(`${label} was accepted silently`);
  for (const needle of needles) {
    if (!message.includes(needle)) {
      fail(
        `${label} refused without naming "${needle}" — got:\n    ` +
          message.split('\n').slice(0, 4).join('\n    '),
      );
    }
  }
};

refuse(
  'strong segments with no declared textMarks.strong',
  build({ textSegments: SEGMENTS }),
  'copy',
  'textMarks.strong',
);

// ── Refusal 2: segments that do not spell the canonical text ─────────────────
refuse(
  'segments whose concatenation differs from `text`',
  build({
    text: FLAT,
    textSegments: [{ text: 'La ' }, { text: 'performance', strong: true }],
    textMarks: { strong: '{fixture.weight.bold}' },
  }),
  'copy',
  'textSegments',
);

// ── Refusal 3: segments with no literal text to split ────────────────────────
refuse(
  'segments on a part with no `text`',
  {
    ...build({}),
    anatomy: {
      root: {
        parts: {
          copy: {
            element: 'p',
            textSegments: SEGMENTS,
            textMarks: { strong: '{fixture.weight.bold}' },
          },
        },
      },
    },
  },
  'copy',
  'text',
);

// ── Mark UNDERLINE: the second bounded mark ──────────────────────────────────
// Observed ranges: coordonnees' contact value underlines the phone number and
// the email, never their labels (node 2104:2891, styleOverrideTable key 20 =
// UNDERLINE). The field is ADDITIVE on segments and the render is a <u>, which
// nests under <strong> so the two marks compose.
//
// Unlike weight, `text-decoration-line` has NO token — it is a keyword channel.
// So each surface must DECLARE the decoration instead of leaning on <u>'s UA
// default: the CSS surfaces emit a `.part u` rule, and the inline surface —
// which has no stylesheet at all — carries it on the element, exactly as it
// already does for the governed strong weight.
{
  const segments = [
    { text: 'Tél : ' },
    { text: '+32 87', underline: true },
    { text: ' Email: ' },
    // Both marks on one range.
    { text: 'info@x.be', underline: true, strong: true },
  ];
  const c = ContractSchema.parse({
    id: 'fixture.underline-ranges', name: 'UnderlineRanges', version: '1.0.0', status: 'draft',
    description: 'Literal part with underline ranges.',
    semantics: { element: 'div' }, props: [], states: [], events: [],
    anatomy: { root: { parts: { copy: {
      text: segments.map((s) => s.text).join(''),
      textSegments: segments,
      textMarks: { strong: '{fixture.weight.bold}' },
      declared: { 'white-space': 'pre-line' },
    } } } },
    anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/UnderlineRanges', export: 'UnderlineRanges' } },
  });
  const map = new Map([[c.id, c]]);
  const react = emitReact(c, { tokens, icons: new Map(), contracts: map });
  const inline = emitReactInline(c, { tokens: tokenTree, icons: new Map(), contracts: map, mode: 'light' }).tsx;
  const htmlOut = emitHtml(c, { tokens, icons: new Map(), contracts: map });
  const html = htmlOut.html;

  // The ranges are exact on every code surface. The inline surface opens its
  // <u> with the declared decoration, so match the tag, not a bare "<u>".
  for (const [surface, source] of [['React', react.tsx], ['React inline', inline]] as const) {
    for (const marked of ['+32 87', 'info@x.be']) {
      if (!new RegExp(`<u[^>]*>\\{"${marked.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\}</u>`).test(source)) {
        fail(`${surface} did not render the underlined range ${JSON.stringify(marked)} as a <u> element`);
      }
    }
    if (/<u[^>]*>\{"Tél : "\}<\/u>/.test(source)) {
      fail(`${surface} underlined an unmarked range — ranges must be exact`);
    }
    if (!/<strong[^>]*><u/.test(source)) {
      fail(`${surface} did not compose both marks on one range (<u> nested inside <strong>)`);
    }
  }

  // Declared, never inherited from the UA.
  if (!react.css.includes('.copy u') || !react.css.includes('text-decoration-line: underline')) {
    fail(
      'React CSS did not DECLARE the underline — <u> would fall back to the UA default, the one thing marks here are never allowed to inherit',
    );
  }
  // A DESCENDANT selector: the bold+underlined range nests <u> inside <strong>,
  // so a child selector would silently drop its decoration.
  if (react.css.includes('.copy > u')) {
    fail('the underline rule used a CHILD selector — a range that is also bold nests <u> inside <strong> and would lose it');
  }
  if (!inline.includes("textDecorationLine: 'underline'")) {
    fail('React inline did not carry the declared decoration (it has no stylesheet to hold a rule)');
  }
  if (!html.includes('<u>+32 87</u>')) fail('HTML did not render the underlined range as <u>');
  if (!/__copy u \{[^}]*text-decoration-line: underline/.test(htmlOut.css)) {
    fail('HTML CSS did not DECLARE the underline for its <u> ranges');
  }
  if (html.includes('<u>Tél')) fail('HTML underlined the label, which the source leaves plain');
}

// ── A break run that STRADDLES a marked-range boundary ───────────────────────
// Range boundaries and break runs are independent in the source: node
// 2104:2891 closes its underlined phone range with "\r" and opens the next
// range with U+2028. Normalizing per segment would emit TWO breaks (the blank
// line again); and a glyphless break is not a range of text to decorate, so it
// is hoisted OUT of the mark rather than left to the engine's sizing of a
// forced break inside <u>.
{
  const segments = [
    { text: 'Tél : ' },
    { text: '+32 87\r', underline: true },
    { text: ' Email: ' },
  ];
  const c = ContractSchema.parse({
    id: 'fixture.underline-straddle', name: 'UnderlineStraddle', version: '1.0.0', status: 'draft',
    description: 'Underlined range whose trailing break continues into the next range.',
    semantics: { element: 'div' }, props: [], states: [], events: [],
    anatomy: { root: { parts: { copy: {
      text: segments.map((s) => s.text).join(''),
      textSegments: segments,
      declared: { 'white-space': 'pre-line' },
    } } } },
    anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/UnderlineStraddle', export: 'UnderlineStraddle' } },
  });
  const map = new Map([[c.id, c]]);
  const src = emitReact(c, { tokens, icons: new Map(), contracts: map }).tsx;

  const breaks = (src.match(/\\n/g) ?? []).length;
  if (breaks !== 1) {
    fail(
      `a break run straddling a range boundary produced ${breaks} break(s), not 1 — Figma draws that node 54 px tall (2 × 27), so two breaks invent a blank line`,
    );
  }
  if (/<u[^>]*>[^<]*\\n/.test(src)) {
    fail(
      "the break stayed INSIDE <u> — a glyphless newline is not a range of text to decorate, and its extent would depend on how the engine sizes a forced break",
    );
  }
  if (!src.includes('<u>{"+32 87"}</u>')) {
    fail('hoisting the break also stripped the visible text of the underlined range');
  }
}

console.log(
  'part-literal-rich-text ok: a literal part text carries its observed strong AND underline ranges (governed weight, declared decoration, composed marks, "\\n" preserved, one flat canvas value) and refuses ungoverned marks, drifting segments, and segments with nothing to split',
);
