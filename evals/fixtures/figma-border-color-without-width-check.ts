/**
 * A border COLOUR with no border WIDTH applicable to the current state must
 * paint NOTHING on the canvas.
 *
 * CSS is the reference behaviour and it is unambiguous:
 *   · a `border-color` with no `border-width` draws nothing (the generated
 *     root path spells it `border: 0` + `box-shadow: inset 0 0 0
 *     var(--dsc-border-width, 0) var(--dsc-border-color)` — a 0-spread inset
 *     shadow paints zero pixels);
 *   · a `border-bottom-width` alone draws ONLY the bottom rule (`box-shadow:
 *     inset 0 calc(-1 * var(--dsc-border-bottom-width)) 0 <colour>`), never a
 *     ring on the other three sides.
 * Figma disagrees by default: a freshly created FRAME carries
 * `strokeWeight = 1`, so the moment a paint lands in `node.strokes` the canvas
 * manufactures a 1px ring the web surface never draws.
 *
 * The emitter already knows this rule and applies it in TWO other places —
 * `hasWidthSource` guards the border-SIDE-colour longhands
 * (core/emit-figma-script.ts:919-923: "a border-color with border-width 0 is
 * INVISIBLE in CSS ... would let the renderer's 1px default manufacture a
 * ring the real component never draws") and `translateStateOverrides` guards
 * the lone outline-colour override (core/emit-figma-script.ts:1465-1470). The
 * `border-color` SHORTHAND channel carries no such guard, on either the token
 * branch (`spec.stroke`, line 939-941) or the literal branch
 * (`lits.strokeColor`, line 1264-1267); and no branch ever zeroes the three
 * sides a per-side width leaves untouched.
 *
 * Three cases, mirroring the three shapes the live contracts carry:
 *   A — ds.tab: a token border-colour, the width living ONLY in a
 *       literalsByProp override. The unselected variant must draw NOTHING;
 *       the selected variant must draw its 2px bottom rule and NOTHING else.
 *   B — ds.accordion-row: a literal border-colour with a token
 *       border-bottom-width. Bottom rule only, no ring on the other sides.
 *   C — CONTROL (ds.input / ds.button shape): a border-colour WITH a uniform
 *       width. This must keep painting exactly as it does today — the fix
 *       must not disarm the legitimate case.
 */
import vm from 'node:vm';
import { ContractSchema } from '../../scripts/contract-schema.js';
import { createFigmaEngine } from '../../core/emit-figma-script.js';
// @ts-expect-error — the mock ships as untyped .mjs (the plugin-check harness imports it the same way)
import { createFigmaMock } from '../../scripts/plugin-engine-mock-figma.mjs';

const failures: string[] = [];
const note = (message: string): void => {
  failures.push(message);
};

const tokenTree = {
  primitives: {
    color: {
      'noir-bleute': { $value: '#26282C', $type: 'color' },
      'bleu-gris': { $value: '#9BA4B5', $type: 'color' },
    },
    'border-width': {
      '1': { $value: '1px', $type: 'dimension' },
      '2': { $value: '2px', $type: 'dimension' },
    },
  },
  semantic: {},
  light: {},
  dark: {},
  brands: { default: {} },
};

// --- the three contract shapes ---------------------------------------------

/** A — ds.tab: token border-colour, width only inside a literalsByProp map.
 *  Parameterised on `gap` so case D can re-sync a spec that genuinely CHANGED
 *  — amendSet/amendComponent short-circuit on an unchanged specHash
 *  (core/emit-figma-script.ts:3559-3561, 3732-3735), so an identical re-run
 *  never touches the node and would prove nothing about the clear. */
const mkTab = (gap: string) =>
  ContractSchema.parse({
    id: 'fixture.borderwidthless-tab',
    name: 'BorderWidthlessTab',
    version: '1.0.0',
    description: 'ds.tab shape: a permanent border-colour whose width exists only in the selected state.',
    semantics: { element: 'button' },
    props: [
      {
        name: 'etat',
        type: { enum: ['defaut', 'selectionne'] },
        default: 'defaut',
        bindings: {
          figma: { kind: 'VARIANT', property: 'Etat', values: { defaut: 'Defaut', selectionne: 'Selectionne' } },
          code: { prop: 'etat' },
        },
      },
    ],
    states: [],
    anatomy: {
      root: {
        layout: { display: 'inline-flex', direction: 'row', align: 'center' },
        tokens: { 'border-color': '{color.noir-bleute}' },
        literals: { gap },
        literalsByProp: [{ prop: 'etat', map: { selectionne: { 'border-bottom-width': '2px' } } }],
        parts: { libell: { text: 'Onglet' } },
      },
    },
    anchors: {
      figma: { fileKey: null, componentSetKey: null },
      code: { importPath: 'src/components/BorderWidthlessTab', export: 'BorderWidthlessTab' },
    },
  });
const tabShape = mkTab('8px');

/** B — ds.accordion-row: literal border-colour, token border-bottom-width. */
const accordionShape = ContractSchema.parse({
  id: 'fixture.borderwidthless-row',
  name: 'BorderWidthlessRow',
  version: '1.0.0',
  description: 'ds.accordion-row shape: a literal border-colour with a bottom-only width.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'row', align: 'center' },
      tokens: { 'border-bottom-width': '{border-width.1}' },
      literals: { 'border-color': '#000000' },
      parts: { title: { text: 'Titre' } },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/BorderWidthlessRow', export: 'BorderWidthlessRow' },
  },
});

/** C — CONTROL: colour WITH a uniform width. Must keep painting. */
const uniformShape = ContractSchema.parse({
  id: 'fixture.borderwidthless-control',
  name: 'BorderWidthlessControl',
  version: '1.0.0',
  description: 'ds.input shape: a border-colour with a real uniform width — the legitimate case.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'row', align: 'center' },
      tokens: { 'border-color': '{color.bleu-gris}', 'border-width': '{border-width.1}' },
      parts: { label: { text: 'Champ' } },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/BorderWidthlessControl', export: 'BorderWidthlessControl' },
  },
});

// --- drive the emitted scripts through the mock canvas ----------------------

const engine = createFigmaEngine({ tokens: tokenTree, icons: new Map() });
const { figma, root, variables } = createFigmaMock();
const ctx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
const runScript = (code: string): Promise<unknown> =>
  vm.runInContext(`(async () => {\n${code}\n})()`, ctx, { timeout: 120_000 });

await runScript(engine.buildTokensScript(null));
for (const contract of [tabShape, accordionShape, uniformShape]) {
  await runScript(engine.buildComponentScript(contract, new Map([[contract.id, contract]])));
}

const marked = (contractId: string): any =>
  root.findOne(
    (n: any) =>
      (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') &&
      n.getSharedPluginData('ds_contracts', 'contractId') === contractId,
  );

/** The node the contract's ROOT part became, for one variant (or the only one). */
const rootNode = (contractId: string, variantName?: string): any => {
  const node = marked(contractId);
  if (!node) throw new Error(`no marked node for ${contractId}`);
  if (node.type !== 'COMPONENT_SET') return node;
  const hit = (node.children ?? []).find((c: any) => c.name === variantName);
  if (!hit) throw new Error(`variant "${variantName}" not found among [${(node.children ?? []).map((c: any) => c.name).join(', ')}]`);
  return hit;
};

/** MOCK-FIDELITY NOTE (named, not silent): the mock's `setBoundVariable`
 *  records the alias in `boundVariables` and does NOT materialize a number on
 *  the field (scripts/plugin-engine-mock-figma.mjs:133-135). Reading the raw
 *  field alone would therefore report a token-bound 1px rule as the frame
 *  DEFAULT 1 — a coincidence that would keep this fixture green for the wrong
 *  reason once a fix starts writing `strokeWeight = 0`. So a bound field is
 *  resolved through the variable it points at, and the frame default is only
 *  consulted when neither a literal nor a binding governs the side. */
const boundValue = (n: any, field: string): number | undefined => {
  const alias = n.boundVariables?.[field];
  if (!alias) return undefined;
  const v = variables.find((x: any) => x.id === alias.id);
  const resolved = v?.resolveForConsumer?.()?.value;
  return typeof resolved === 'number' ? resolved : undefined;
};

/** Figma's real semantics: an unset per-side weight falls back to strokeWeight,
 *  and strokeWeight itself defaults to 1 on every freshly created frame. */
const weightOf = (n: any, side: 'Top' | 'Right' | 'Bottom' | 'Left'): number => {
  const perSide = n[`stroke${side}Weight`] ?? boundValue(n, `stroke${side}Weight`);
  if (typeof perSide === 'number') return perSide;
  const uniform = boundValue(n, 'strokeWeight');
  if (typeof uniform === 'number') return uniform;
  return n.strokeWeight; // Figma's frame default: 1
};
const sideWeights = (n: any) => ({
  top: weightOf(n, 'Top'),
  right: weightOf(n, 'Right'),
  bottom: weightOf(n, 'Bottom'),
  left: weightOf(n, 'Left'),
});
const paints = (n: any) => (Array.isArray(n.strokes) ? n.strokes : []);
const describe = (n: any) =>
  `strokes=${paints(n).length} weights=${JSON.stringify(sideWeights(n))}`;

// --- A: ds.tab -------------------------------------------------------------

const tabDefaut = rootNode(tabShape.id, 'Etat=Defaut');
const wD = sideWeights(tabDefaut);
if (paints(tabDefaut).length > 0 && (wD.top > 0 || wD.right > 0 || wD.bottom > 0 || wD.left > 0)) {
  note(
    `A/defaut: the UNSELECTED tab paints a border the CSS surface never draws — ${describe(tabDefaut)}. ` +
      'The contract carries border-color but NO width applicable to this state; CSS paints zero pixels.',
  );
}

const tabSelect = rootNode(tabShape.id, 'Etat=Selectionne');
const wS = sideWeights(tabSelect);
if (paints(tabSelect).length === 0 || wS.bottom !== 2) {
  note(`A/selectionne: the selected tab LOST its legitimate 2px bottom rule — ${describe(tabSelect)}.`);
}
if (wS.top > 0 || wS.right > 0 || wS.left > 0) {
  note(
    `A/selectionne: the selected tab paints a ring on the three sides the contract gives no width — ` +
      `${describe(tabSelect)}. CSS draws the bottom rule only.`,
  );
}

// --- B: ds.accordion-row ---------------------------------------------------

const rowNode = rootNode(accordionShape.id);
const wR = sideWeights(rowNode);
if (paints(rowNode).length === 0 || wR.bottom !== 1) {
  note(`B: the row LOST its legitimate 1px bottom rule — ${describe(rowNode)}.`);
}
if (wR.top > 0 || wR.right > 0 || wR.left > 0) {
  note(
    `B: the row paints a ring on the three sides the contract gives no width — ${describe(rowNode)}. ` +
      'CSS draws the bottom rule only.',
  );
}

// --- D: a stale ring on a REUSED node must not outlive the re-sync ---------
// Both amend paths reuse the variant node (amendSet keeps `existingByName`,
// amendComponent keeps `comp`) and only rebuild its children, and the frame
// path — unlike fills, cleared unconditionally — never clears strokes. So a
// canvas already regenerated by the current emitter keeps its phantom ring
// through every later sync unless the drop is paired with an explicit clear.
// This is the honest cost too: an out-of-contract stroke a designer added to a
// governed frame is cleared, exactly as an out-of-contract fill already is.
tabDefaut.strokes = [{ type: 'SOLID', color: { r: 0.15, g: 0.16, b: 0.17 }, opacity: 1 }];
const tabV2 = mkTab('12px');
await runScript(engine.buildComponentScript(tabV2, new Map([[tabV2.id, tabV2]])));
const tabDefaut2 = rootNode(tabShape.id, 'Etat=Defaut');
if (paints(tabDefaut2).length > 0) {
  note(
    `D: a stale border paint survived the re-sync — ${describe(tabDefaut2)}. ` +
      'Amend reuses the variant node, so dropping the paint at compile time is not enough on its own.',
  );
}

// --- C: the legitimate uniform case must be untouched ----------------------

const ctrlNode = rootNode(uniformShape.id);
const wC = sideWeights(ctrlNode);
if (paints(ctrlNode).length === 0 || wC.top !== 1 || wC.right !== 1 || wC.bottom !== 1 || wC.left !== 1) {
  note(
    `C (CONTROL): a border-colour WITH a uniform width must keep painting its full 1px ring — ${describe(ctrlNode)}. ` +
      'A fix that silences this case has over-reached.',
  );
}

// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error('✘ figma-border-color-without-width:');
  for (const f of failures) console.error(`   · ${f}`);
  process.exit(1);
}

console.log(
  'figma-border-color-without-width ok: a border-colour with no width applicable to the current state paints nothing, ' +
    'a per-side width paints that side only, and a uniform width still paints its full ring',
);
