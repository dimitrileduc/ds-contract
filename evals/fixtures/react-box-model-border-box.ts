/**
 * The delivered React surface measures the SAME boxes as the surface the
 * parity instrument renders (015, US2, FR-004 — T013).
 *
 * Why this fixture exists, and why it exists LATE (honesty §V): T013 shipped
 * the rule into `core/emit-react.ts` with two committed receipts
 * (`box-model-unification.md`, `boites-9-surfaces.md`) but WITHOUT a fixture —
 * the only automated check touching box-sizing was `s4-canvas-channel-lifts`,
 * which asserts it on the CANVAS stylesheet only. The surface that actually
 * diverged (the one consumers install) was covered by receipts alone. Written
 * in the Phase 7 review so the capability sentence in README.md has an eval
 * behind it, per the Claims Rule (constitution §II).
 *
 * Three properties:
 *   1. every top-level root gets the rule, self AND descendants — `box-sizing`
 *      is not inherited, so a rule on the root alone leaves nested parts
 *      content-box (this is the shape that made `ds.sav`/`ds.footer`/`ds.faq`
 *      render a width authored as bbox − padding);
 *   2. on a single-root contract — what all 34 Piqueray contracts are today —
 *      `react` and `html` both declare it: the delivered library and the
 *      surface the visual-parity harness renders agree on the box model;
 *   3. the rule is emitted once per ROOT, not once per part — a regression
 *      re-emitting it per part would still pass property 1.
 *
 * NAMED LIMIT, found by this very fixture (2026-08-05, registered as
 * DW-015-001, receipt `emit-html-multiroot-box-sizing.md`): `core/emit-html.ts`
 * hooks its rule on the shared BEM prefix `.<name>`, which no element carries
 * in a MULTI-ROOT composite (each root compiles to its own `.<name>__<root>`
 * sibling class) — so the html surface declares border-box for nothing there.
 * Latent, not live: zero Piqueray contract is multi-root today, which is why
 * property 2 below is asserted on the single-root shape and the multi-root
 * gap is registered rather than silently asserted away.
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitHtml } from '../../core/emit-html.js';
import { emitReact } from '../../core/emit-react.js';

const anchors = {
  figma: { fileKey: null, componentSetKey: null },
  code: { importPath: 'src/components/BoxModel', export: 'BoxModel' },
};

/** `panel` carries a size AND a padding on the same axis — the shape that
 *  renders wider than Figma when box-sizing is content-box. */
const singleRoot = ContractSchema.parse({
  id: 'fixture.box-model',
  name: 'BoxModel',
  version: '1.0.0',
  description: 'Synthetic single-root contract exercising the border-box rule.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  anatomy: {
    root: {
      literals: { width: '400px', 'padding-left': '24px', 'padding-right': '24px' },
      parts: { panel: { literals: { width: '200px', 'padding-left': '16px' } } },
    },
  },
  anchors,
});

const multiRoot = ContractSchema.parse({
  id: 'fixture.box-model-multi',
  name: 'BoxModelMulti',
  version: '1.0.0',
  description: 'Synthetic multi-root contract — each root needs its own rule.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  anatomy: {
    root: { literals: { width: '400px', 'padding-left': '24px' } },
    trailer: { literals: { height: '48px', 'padding-top': '8px' } },
  },
  anchors,
});

const css = (c: typeof singleRoot, emit: typeof emitReact | typeof emitHtml) =>
  emit(c, { tokens: new Set<string>(), icons: new Map(), contracts: new Map([[c.id, c]]) }).css;
const countRule = (s: string) => (s.match(/box-sizing:\s*border-box/g) ?? []).length;

// --------------------------------------------------------------------------
// Property 1 — every top-level root declares the rule for itself AND its
// descendants, in both the single-root and multi-root shapes.
// --------------------------------------------------------------------------
for (const [contract, roots] of [
  [singleRoot, ['root']],
  [multiRoot, ['root', 'trailer']],
] as const) {
  const out = css(contract, emitReact);
  for (const rootClass of roots) {
    for (const selector of [`.${rootClass}`, `.${rootClass} *`, `.${rootClass} *::before`, `.${rootClass} *::after`]) {
      if (!out.includes(selector)) {
        throw new Error(
          `react/${contract.id}: the border-box rule is missing the selector \`${selector}\` — a part nested under .${rootClass} would size content-box while Figma sizes border-box. Got:\n${out}`,
        );
      }
    }
  }
}

// --------------------------------------------------------------------------
// Property 2 — on the shape Piqueray actually ships, the delivered library and
// the surface the parity instrument renders agree: both declare the rule.
// --------------------------------------------------------------------------
const reactSingle = css(singleRoot, emitReact);
const htmlSingle = css(singleRoot, emitHtml);
if (countRule(reactSingle) < 1 || countRule(htmlSingle) < 1) {
  throw new Error(
    `single-root: react and html must BOTH declare the box model — react ${countRule(reactSingle)}×, html ${countRule(htmlSingle)}×. The delivered surface may not measure boxes differently from the one the parity instrument renders.`,
  );
}

// --------------------------------------------------------------------------
// Property 3 — once per top-level root, never once per part.
// --------------------------------------------------------------------------
if (countRule(reactSingle) !== 1 || countRule(css(multiRoot, emitReact)) !== 2) {
  throw new Error(
    `react: expected exactly 1 declaration for the single-root contract and 2 for the two-root contract, got ${countRule(reactSingle)} and ${countRule(css(multiRoot, emitReact))} — the rule must be emitted per ROOT, not per part.`,
  );
}

console.log(
  'react-box-model: every top-level root declares border-box for self + descendants (single-root and multi-root); react and html agree on the single-root shape Piqueray ships; emitted once per root. Multi-root html gap named as DW-015-001, latent (0 multi-root contracts today).',
);
