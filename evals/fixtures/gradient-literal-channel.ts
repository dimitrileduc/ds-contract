/**
 * Adversarial contract for the `background-image` literal channel (015, D5,
 * FR-003). `LITERAL_CHANNELS` does not carry `background-image` yet — this
 * fixture is written FIRST and MUST fail here (constitution §II).
 *
 * Two properties, both from the contract hero's own datedescription (v1.3.0,
 * quoted in research.md D5): (1) a `linear-gradient(...)` literal on
 * `background-image` renders on all 4 surfaces (react, html, react-inline,
 * figma-script) — the channel routes, it does not merely parse; (2) a
 * gradient grammar outside the bound (`radial-gradient`, `conic-gradient`)
 * refuses BY NAME at the schema level — `LITERAL_VALUE_RE` stays intact for
 * every other channel (Principle VI).
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitFigmaScript } from '../../core/emit-figma-script.js';
import { emitHtml } from '../../core/emit-html.js';
import { emitReact } from '../../core/emit-react.js';
import { emitReactInline } from '../../core/emit-react-inline.js';

const GRADIENT = 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 60%)';

function buildContract(backgroundImage: string) {
  return {
    id: 'fixture.gradient-channel',
    name: 'GradientChannel',
    version: '1.0.0',
    description: 'Synthetic contract exercising the background-image literal channel.',
    semantics: { element: 'div' },
    props: [],
    states: [],
    anatomy: {
      root: {
        literals: { 'background-image': backgroundImage },
      },
    },
    anchors: {
      figma: { fileKey: null, componentSetKey: null },
      code: { importPath: 'src/components/GradientChannel', export: 'GradientChannel' },
    },
  };
}

// ---------------------------------------------------------------------------
// Property 1 — a bounded linear-gradient() literal is schema-valid and
// routes on all 4 surfaces (renders, not merely parses).
// ---------------------------------------------------------------------------
const contract = ContractSchema.parse(buildContract(GRADIENT));
const contracts = new Map([[contract.id, contract]]);

const react = emitReact(contract, { tokens: new Set(), icons: new Map(), contracts }).css;
if (!react.includes(`background-image: ${GRADIENT}`)) {
  throw new Error(`react: literal background-image was not emitted verbatim in the generated CSS, got:\n${react}`);
}

const html = emitHtml(contract, { tokens: new Set(), icons: new Map(), contracts }).css;
if (!html.includes(`background-image: ${GRADIENT}`)) {
  throw new Error(`html: literal background-image was not emitted verbatim in the generated CSS, got:\n${html}`);
}

const inline = emitReactInline(contract, {
  tokens: { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } },
  icons: new Map(),
  contracts,
  mode: 'light',
}).tsx;
if (!inline.includes(GRADIENT)) {
  throw new Error(`react-inline: literal background-image was not emitted in the inline style, got:\n${inline}`);
}

const figma = emitFigmaScript(contract, {
  tokens: { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } },
  icons: new Map(),
  contracts,
});
if (!figma.includes('GRADIENT_LINEAR')) {
  throw new Error(`figma-script: literal background-image did not compile to a native GRADIENT_LINEAR paint`);
}

// ---------------------------------------------------------------------------
// Property 2 — the grammar is bounded to linear-gradient(...) BY NAME: a
// radial or conic gradient refuses at schema validation, not at emit time
// (a contract with an out-of-bound gradient must never even LOAD).
// ---------------------------------------------------------------------------
for (const outOfBound of [
  'radial-gradient(circle, #000000 0%, #ffffff 100%)',
  'conic-gradient(from 90deg, #000000 0%, #ffffff 100%)',
]) {
  const result = ContractSchema.safeParse(buildContract(outOfBound));
  if (result.success) {
    throw new Error(`schema: "${outOfBound}" must refuse by name (bounded per-channel grammar), but the contract parsed`);
  }
}

// ---------------------------------------------------------------------------
// Property 3 — LITERAL_VALUE_RE stays intact for every other channel
// (Principle VI: additive, nothing repurposed) — a plain px literal on an
// unrelated geometric channel is unaffected by the gradient lift.
// ---------------------------------------------------------------------------
{
  const stillWorks = ContractSchema.safeParse({
    ...buildContract(GRADIENT),
    anatomy: { root: { literals: { width: '180px' } } },
  });
  if (!stillWorks.success) {
    throw new Error(`schema: a plain px literal on an unrelated channel must still validate, got ${JSON.stringify(stillWorks.error?.issues)}`);
  }
  // ...and background-image itself still refuses a bare CSS length or color
  // (the gradient grammar does not accidentally widen to accept everything).
  const badGradientChannel = ContractSchema.safeParse(buildContract('16px'));
  if (badGradientChannel.success) {
    throw new Error(`schema: "16px" on background-image must still refuse (not a linear-gradient), but parsed`);
  }
}

console.log(
  '✔ background-image literal channel holds: a bounded linear-gradient() literal is schema-valid and renders on ' +
    'all 4 surfaces (react CSS, html CSS, react-inline style, figma-script GRADIENT_LINEAR); radial/conic ' +
    'gradients refuse by name at schema validation; LITERAL_VALUE_RE is untouched for every other channel.',
);
