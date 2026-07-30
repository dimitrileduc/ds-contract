/**
 * A parent must be able to give a composed child's RICH-TEXT prop its segments.
 *
 * `component.props` only ever carried scalars, so the mixed-style facts a
 * molecule's TEXT property actually holds were inexpressible from its
 * consumers: the child could be rich-text, but every parent could only hand it
 * one flat string, and the bold ranges Figma draws vanished.
 *
 * Receipt: ds.section-header's `titre` (a real Figma TEXT property) is drawn
 * « Piqueray, » BOLD + « une histoire de famille » regular on ds.presentation,
 * « showroom à Pepinster » BOLD mid-sentence on ds.texte-seo. Nine consumers,
 * one child prop, three of them mixed.
 *
 * The extension is ADDITIVE and bounded:
 *   - a `component.props` value may ALSO be a non-empty segment array;
 *   - React/React-inline pass it through as `prop={[…]}`;
 *   - the static HTML surface renders the parent's segments (not the child's
 *     default) with semantic <strong>;
 *   - the canvas keeps ONE native TEXT value — the flat concatenation, the
 *     projection rule rich-text props already follow;
 *   - a plain string on a text prop still works (every existing contract);
 *   - segments aimed at a NON rich-text child prop refuse BY NAME.
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitFigmaScript } from '../../core/emit-figma-script.js';
import { emitHtml } from '../../core/emit-html.js';
import { emitReact } from '../../core/emit-react.js';
import { emitReactInline } from '../../core/emit-react-inline.js';

const fail = (message: string): never => {
  console.error(`✘ component-rich-text-prop-value: ${message}`);
  process.exit(1);
};

const SEGMENTS = [
  { text: 'Piqueray, ', strong: true },
  { text: 'une histoire de famille' },
];
const FLAT = 'Piqueray, une histoire de famille';

const parseOrFail = (label: string, raw: unknown) => {
  const parsed = ContractSchema.safeParse(raw);
  if (!parsed.success) {
    fail(
      `the schema refused ${label} — a component.props value may be a segment array:\n` +
        parsed.error.issues.map((i) => `    ${i.path.join('.')}: ${i.message}`).join('\n'),
    );
  }
  return parsed.data!;
};

const child = parseOrFail('the rich-text child', {
  id: 'fixture.rich-child',
  name: 'RichChild',
  version: '1.0.0',
  status: 'draft',
  description: 'Child molecule whose title is ONE Figma TEXT property with structured strong ranges.',
  semantics: { element: 'div' },
  props: [
    {
      name: 'titre',
      type: 'rich-text',
      default: [{ text: 'Titre par défaut' }],
      bindings: { figma: { kind: 'TEXT', property: 'Titre' }, code: { prop: 'titre' } },
    },
    {
      name: 'accroche',
      type: 'text',
      default: 'Accroche par défaut',
      bindings: { figma: { kind: 'TEXT', property: 'Accroche' }, code: { prop: 'accroche' } },
    },
  ],
  states: [],
  events: [],
  anatomy: {
    root: {
      parts: {
        Titre: {
          content: { prop: 'titre', marks: { strong: '{fixture.weight.bold}' } },
          tokens: { 'font-weight': '{fixture.weight.regular}' },
        },
        Accroche: { content: { prop: 'accroche' } },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/RichChild', export: 'RichChild' },
  },
});

const parent = parseOrFail('the parent passing segments', {
  id: 'fixture.rich-parent',
  name: 'RichParent',
  version: '1.0.0',
  status: 'draft',
  description: 'Organism consumer that fixes the child title to its observed mixed-style ranges.',
  semantics: { element: 'section' },
  props: [],
  states: [],
  events: [],
  anatomy: {
    root: {
      parts: {
        Header: {
          component: {
            id: 'fixture.rich-child',
            props: { titre: SEGMENTS, accroche: 'Plus de 50 ans' },
          },
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/RichParent', export: 'RichParent' },
  },
});

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
const contracts = new Map([
  [child.id, child],
  [parent.id, parent],
]);

// ── The parent's React surfaces hand the segments over as prop DATA ──────────
const expectedAttr = `titre={${JSON.stringify(SEGMENTS)}}`;
const react = emitReact(parent, { tokens, icons: new Map(), contracts }).tsx;
const inline = emitReactInline(parent, {
  tokens: tokenTree,
  icons: new Map(),
  contracts,
  mode: 'light',
}).tsx;

for (const [surface, source] of [['React', react], ['React inline', inline]] as const) {
  if (!source.includes(expectedAttr)) {
    fail(
      `${surface} did not pass the segment array to the child — expected ${expectedAttr}` +
        (source.includes('[object Object]')
          ? ', got a stringified "[object Object]" (the fact silently destroyed)'
          : ''),
    );
  }
  // Retro-compatibility: a flat string on a flat text prop is untouched.
  if (!source.includes('accroche="Plus de 50 ans"')) {
    fail(`${surface} stopped passing a plain string to a flat text child prop`);
  }
  if (source.includes('[object Object]')) {
    fail(`${surface} stringified segments somewhere else in the output`);
  }
}

// ── The child governs the marked weight; it is never a UA default ────────────
const childReact = emitReact(child, { tokens, icons: new Map(), contracts });
if (!childReact.tsx.includes('titre.map((segment, index)')) {
  fail('the child stopped rendering its rich-text prop as segments');
}
if (
  !childReact.css.includes('.Titre > strong') ||
  !childReact.css.includes('font-weight: var(--fixture-weight-bold)')
) {
  fail('the child did not govern its <strong> weight with the declared token');
}

// ── The static HTML surface renders the PARENT's segments, marked ────────────
const html = emitHtml(parent, { tokens, icons: new Map(), contracts }).html;
if (html.includes('[object Object]')) {
  fail('HTML stringified the parent segment array into the child instance');
}
if (!html.includes('<strong>Piqueray, </strong>')) {
  fail(
    'HTML did not render the parent-supplied strong range' +
      (html.includes('Titre par défaut')
        ? " — it fell back to the child's own default, silently dropping the parent's fact"
        : ''),
  );
}
if (!html.includes('une histoire de famille')) {
  fail('HTML dropped the unmarked remainder of the parent segments');
}

// ── The canvas keeps ONE native TEXT value: the flat concatenation ───────────
const figma = emitFigmaScript(parent, { tokens: tokenTree, icons: new Map(), contracts });
if (figma.includes('[object Object]')) {
  fail('the Figma projection stringified the segment array unsafely');
}
if (!figma.includes(JSON.stringify(FLAT))) {
  fail(`the Figma projection did not flatten the segments to its native TEXT value ${JSON.stringify(FLAT)}`);
}

// ── A parent may also THREAD its own rich-text prop into the child ───────────
// ds.coordonnees forwards its own `titre` Figma TEXT property into the
// SectionHeader instance, so the parent property reaches the rendered surface
// instead of a frozen literal. That mapping must survive on every surface —
// including the canvas plan, where only CODE-ONLY prop defaults used to be
// resolvable: a prop bound to the parent's own TEXT property threw "Cannot
// resolve parent prop mapping" and took the entire figma plan down with it.
const THREADED_DEFAULT = [{ text: 'Nos ' }, { text: 'coordonnées', strong: true }];
const threading = parseOrFail('the parent threading its own rich-text prop', {
  id: 'fixture.rich-threading',
  name: 'RichThreading',
  version: '1.0.0',
  status: 'draft',
  description: 'Organism consumer that forwards its own TEXT property into the child instance.',
  semantics: { element: 'section' },
  props: [
    {
      name: 'titre',
      type: 'rich-text',
      default: THREADED_DEFAULT,
      bindings: { figma: { kind: 'TEXT', property: 'Titre' }, code: { prop: 'titre' } },
    },
  ],
  states: [],
  events: [],
  anatomy: {
    root: {
      parts: {
        Header: { component: { id: 'fixture.rich-child', props: { titre: '{titre}' } } },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/RichThreading', export: 'RichThreading' },
  },
});
const threadingContracts = new Map([...contracts, [threading.id, threading]]);
for (const [surface, source] of [
  ['React', emitReact(threading, { tokens, icons: new Map(), contracts: threadingContracts }).tsx],
  [
    'React inline',
    emitReactInline(threading, {
      tokens: tokenTree,
      icons: new Map(),
      contracts: threadingContracts,
      mode: 'light',
    }).tsx,
  ],
] as const) {
  if (!source.includes('titre={titre}')) {
    fail(`${surface} did not thread the parent's own rich-text prop into the child instance`);
  }
}
let threadedFigma = '';
try {
  threadedFigma = emitFigmaScript(threading, {
    tokens: tokenTree,
    icons: new Map(),
    contracts: threadingContracts,
  });
} catch (error) {
  fail(
    `the Figma projection could not resolve a threaded parent prop: ${(error as Error).message}` +
      " — the canvas plan is static, so the parent's default is what it must draw",
  );
}
if (!threadedFigma.includes(JSON.stringify('Nos coordonnées'))) {
  fail("the Figma projection did not draw the threaded parent's flattened default");
}

// A FLAT text parent prop threaded into a rich-text child prop refuses: it
// would silently strip the marks the child is now able to carry.
const flatThreading = ContractSchema.parse({
  ...threading,
  id: 'fixture.rich-threading-flat',
  name: 'RichThreadingFlat',
  props: [
    {
      name: 'titre',
      type: 'text',
      default: 'Nos coordonnées',
      bindings: { figma: { kind: 'TEXT', property: 'Titre' }, code: { prop: 'titre' } },
    },
  ],
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/RichThreadingFlat', export: 'RichThreadingFlat' },
  },
});
let flatRefusal = '';
try {
  emitReact(flatThreading, {
    tokens,
    icons: new Map(),
    contracts: new Map([...contracts, [flatThreading.id, flatThreading]]),
  });
} catch (error) {
  flatRefusal = String((error as Error).message);
}
if (!flatRefusal.includes('rich-text') || !flatRefusal.includes('titre')) {
  flatRefusal
    ? fail(`threading a flat text prop into a rich-text child refused without naming why:\n    ${flatRefusal.split('\n').slice(0, 3).join('\n    ')}`)
    : fail('threading a FLAT text prop into a rich-text child prop was accepted — the marks would be stripped silently');
}

// ── Segments aimed at a NON rich-text child prop refuse BY NAME ──────────────
const misdirected = ContractSchema.parse({
  ...parent,
  id: 'fixture.rich-parent-misdirected',
  name: 'RichParentMisdirected',
  anatomy: {
    root: {
      parts: {
        Header: {
          component: {
            id: 'fixture.rich-child',
            // `accroche` is a FLAT text prop — segments cannot land there.
            props: { accroche: SEGMENTS },
          },
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/RichParentMisdirected', export: 'RichParentMisdirected' },
  },
});
let refusal = '';
try {
  emitReact(misdirected, {
    tokens,
    icons: new Map(),
    contracts: new Map([...contracts, [misdirected.id, misdirected]]),
  });
} catch (error) {
  refusal = String((error as Error).message);
}
if (!refusal) {
  fail('segments aimed at a flat text child prop were accepted silently');
}
if (!refusal.includes('accroche') || !refusal.includes('rich-text')) {
  fail(
    `the refusal did not name the prop and the reason — got:\n    ${refusal.split('\n').slice(0, 4).join('\n    ')}`,
  );
}

console.log(
  'component-rich-text-prop-value ok: a parent hands a child\'s rich-text prop its segments (React/HTML keep the marks, the canvas keeps one flat TEXT value), plain strings still work, and misdirected segments refuse by name',
);
