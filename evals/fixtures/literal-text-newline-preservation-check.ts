/**
 * A literal part text containing "\n" must SURVIVE to the DOM.
 *
 * The React emitters interpolate `part.text` as raw JSX children. JSX
 * whitespace semantics then collapse every newline at COMPILE time — so a
 * Figma paragraph break carried faithfully by the contract silently becomes a
 * single space, and `white-space: pre-line` on the part has nothing left to
 * break on. The defect is invisible on single-paragraph texts and eats every
 * multi-paragraph one.
 *
 * Receipt: ds.sav's card copy — ONE Figma TEXT node with a real "\n" before
 * « Pas de panique » (paragraphSpacing 8). The contract carried the "\n", the
 * part declared pre-line, and the generated DOM still glued both paragraphs.
 *
 * The honest spelling is a JSX string EXPRESSION — {"line1\nline2"} — which
 * preserves the bytes exactly.
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitReact } from '../../core/emit-react.js';
import { emitReactInline } from '../../core/emit-react-inline.js';

const fail = (message: string): never => {
  console.error(`✘ literal-text-newline-preservation: ${message}`);
  process.exit(1);
};

const TEXT = 'Première question ?\nPas de panique, seconde ligne.';
/** Figma épèle ses séparateurs de TROIS façons dans le même fichier (relevés
 * réels 013) : \n (sav 2108:3094), \r (coordonnees contact 2104:2891) et
 * U+2028 LINE SEPARATOR (coordonnees adresse 2104:2885). Le contrat garde les
 * octets source ; l'émission NORMALISE tout en \n — la seule forme que
 * `white-space: pre-line` sait casser. */
const TEXT_CR = 'Tél : ligne un\rEmail: ligne deux';
const TEXT_LS = 'Rue ligne un,\u2028Ville ligne deux';
/** Et il les COMBINE : le node 2104:2891 pose \r PUIS U+2028 cote a cote.
 * Figma dessine ce node en 54 px = exactement 2 x sa hauteur de ligne de
 * 27 px — UN seul saut, et son paragraphSpacing 8 non applique. Normaliser
 * chaque separateur separement emettrait \n\n et inventerait une troisieme
 * ligne vide. Une SUITE de separateurs adjacents vaut donc UN saut. */
const TEXT_CR_LS = 'T\u00e9l : ligne un\r\u2028Email: ligne deux';

const mk = (id: string, name: string, text: string) => ContractSchema.parse({
  id, name, version: '1.0.0', status: 'draft',
  description: 'Part with a literal multi-paragraph text and pre-line.',
  semantics: { element: 'div' },
  props: [], states: [], events: [],
  anatomy: { root: { parts: { copy: { text, declared: { 'white-space': 'pre-line' } } } } },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: `src/components/${name}`, export: name },
  },
});

const contract = ContractSchema.parse({
  id: 'fixture.newline-text',
  name: 'NewlineText',
  version: '1.0.0',
  status: 'draft',
  description: 'Part with a literal multi-paragraph text (real \\n) and pre-line.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  events: [],
  anatomy: {
    root: {
      parts: {
        copy: {
          text: TEXT,
          declared: { 'white-space': 'pre-line' },
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/NewlineText', export: 'NewlineText' },
  },
});

const contracts = new Map([[contract.id, contract]]);
const tokens = { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } };

const surfaces = [
  ['React', emitReact(contract, { tokens: new Set(), icons: new Map(), contracts }).tsx],
  ['React inline', emitReactInline(contract, { tokens, icons: new Map(), contracts, mode: 'light' }).tsx],
] as const;

for (const [surface, source] of surfaces) {
  // The exact bytes must appear as a JSX string expression — the only spelling
  // JSX cannot collapse. JSON.stringify is the canonical escaped form.
  if (!source.includes(JSON.stringify(TEXT))) {
    const rawInterpolated = source.includes('Première question ?');
    fail(
      `${surface} did not emit the multi-line literal as a string expression` +
        (rawInterpolated
          ? ' — the text is interpolated as raw JSX children, so JSX collapses the "\\n" to a space at compile time and pre-line has nothing to break on'
          : ' — the text is missing entirely'),
    );
  }
}

// \r et U+2028 : normalisés en \n à l'émission — jamais laissés bruts (CR et
// LS ne cassent pas sous pre-line), jamais PERDUS, et une suite adjacente vaut
// UN saut (mesure 54 px sur 2104:2891).
for (const [label, raw] of [['CR', TEXT_CR], ['LS', TEXT_LS], ['CR+LS', TEXT_CR_LS]] as const) {
  const slug = label.toLowerCase().replace('+', '-');
  const c = mk(`fixture.newline-${slug}`, `Newline${slug.replace('-', '')}`, raw);
  const map = new Map([[c.id, c]]);
  const normalized = raw.replace(/[\n\r\u2028\u2029]+/g, '\n');
  const out = [
    ['React', emitReact(c, { tokens: new Set(), icons: new Map(), contracts: map }).tsx],
    ['React inline', emitReactInline(c, { tokens, icons: new Map(), contracts: map, mode: 'light' }).tsx],
  ] as const;
  for (const [surface, source] of out) {
    if (!source.includes(JSON.stringify(normalized))) {
      fail(
        `${surface} did not normalize the ${label} separator to \\n — Figma spells line breaks three ways ` +
          '(\\n, \\r, U+2028) and pre-line only breaks on LF; raw or collapsed separators both lose the break',
      );
    }
    // A RUN of adjacent separators is ONE break. Two LFs here would paint a
    // blank line Figma does not draw (2104:2891 measures 54 px = 2 × 27).
    if (label === 'CR+LS' && source.includes('\\n\\n')) {
      fail(
        `${surface} turned the adjacent \\r + U+2028 pair into TWO breaks — that invents a blank third line; Figma draws that node 54 px tall, exactly 2 × its 27 px line height`,
      );
    }
  }
}

console.log(
  'literal-text-newline-preservation ok: literal "\\n" reaches the DOM as an expression, and CR / U+2028 separators are normalized to \\n on both React surfaces',
);
