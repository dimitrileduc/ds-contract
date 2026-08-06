/**
 * A slot's `control.fill: "width"` must actually WIDEN the control — the
 * declaration is inert unless the slot WRAPPER is full-width too.
 *
 * Why this fixture exists (016, T064/T065). The `field` visual-parity subject
 * is classified `engine` with the cause "the SLOTTED Input still keeps its
 * intrinsic width inside that identically-sized box". Re-derived live
 * (2026-08-05) the mechanism is one layer above where that prose points:
 *
 *   - `contracts/field.contract.json` root declares `layout.align: "start"`
 *     → every emitter writes `align-items: flex-start` on the Field root;
 *   - the `Saisie` slot wrapper declares no width of its own, so as a flex
 *     item under `flex-start` it SHRINK-TO-FITS;
 *   - `slot.control.fill === 'width'` is honoured — `core/emit-html.ts`
 *     puts `width: 100%` on the actual `<input>` (`slotControlAttrs`) and
 *     `core/emit-react.ts` clones it onto the supplied child — but a
 *     percentage resolved against a shrink-to-fit parent is a NO-OP.
 *
 * Measured on the emitted `ds.field` surface with the root forced to the
 * Figma render width (280 CSS px, the parity instrument's own context):
 * root 280, wrapper 170, control 170. Adding `align-self: stretch` to the
 * wrapper alone takes both to 280. So the engine emits a declaration whose
 * declared meaning ("the control occupies the parent's available width")
 * it never reaches — that is the defect, and it is an ENGINE defect: the
 * slot wrapper is generated plumbing that no contract authors.
 *
 * The contract-side alternative — `declared: { 'align-self': 'stretch' }` on
 * the wrapper — is rejected on evidence, not taste: `align-self` is
 * `canvas: 'annotate'` in the declared-facts table
 * (`packages/schema/src/contract-schema.ts:431`), i.e. CARRY-CODE-ONLY. It
 * would widen the two code surfaces and leave the canvas hugging, splitting
 * the very axis 016 exists to restore.
 *
 * Four properties, in the order that makes a failure name its own cause:
 *   1. MEASURED (Chromium, the html surface the parity instrument renders):
 *      with the root forced to a known width, both the slot wrapper and the
 *      slotted control measure that width. This is the property the `field`
 *      row fails on; asserting the pixels rather than the CSS text keeps the
 *      fixture from merely mirroring whatever the emitter happens to write.
 *   2. NEGATIVE CONTROL (measured in the same page): a sibling slot that
 *      declares NO `control.fill` still hugs. A blanket "stretch every slot
 *      wrapper" fix would pass property 1 and fail here — the rule has to
 *      stay conditional on the declaration.
 *   3. CROSS-SURFACE: the delivered React CSS declares the same fill on the
 *      wrapper as the measured html surface. DW-014-002 is exactly the shape
 *      where those two drift apart unwatched (the instrument renders
 *      emit-html, never the React library consumers install).
 *   4. CANVAS: the compiled Figma spec marks the wrapper FILL, so the canvas
 *      does not hug either. Today `stretchChildren` is derived from the
 *      PARENT's `align` (`core/emit-figma-script.ts:881`), and a parent
 *      declaring `align: "start"` stretches nothing — the canvas reproduces
 *      the same inert-fill shape as the CSS surfaces. Asserted through the
 *      existing per-child `grow → layoutSizingHorizontal = 'FILL'` carrier
 *      (`core/emit-figma-script.ts:85`, runtime at 3479-3486) rather than a
 *      new spec flag.
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitFigmaScript } from '../../core/emit-figma-script.js';
import { emitHtml } from '../../core/emit-html.js';
import { generateCss, validateContract } from '../../core/emit-react.js';
import { launchBrowser, renderContextSizeCss } from '../../extract/figma/visual-parity/render.js';

/** The forced root width. Any value works; 280 is the `field` subject's own
 *  render width, so a failure reads against the numbers in REPORT.md. */
const ROOT_WIDTH = 280;

const problems: string[] = [];
const expect = (condition: unknown, message: string) => {
  if (!condition) problems.push(message);
};

const anchors = (name: string) => ({
  figma: { fileKey: null, componentSetKey: null },
  code: { importPath: `src/components/${name}`, export: name },
});

/** A native text control with a visible text anatomy — the production shape
 *  (`ds.input`): a void host whose value is drawn as a part. Its intrinsic
 *  width must be comfortably under ROOT_WIDTH so "hug" and "fill" cannot be
 *  confused by coincidence. */
const control = ContractSchema.parse({
  id: 'fixture.slot-fill-control',
  name: 'SlotFillControl',
  version: '1.0.0',
  description: 'Native input accepted by the slot-fill fixture.',
  semantics: { element: 'input' },
  props: [
    {
      name: 'value',
      type: 'text',
      default: 'abc',
      bindings: { figma: { kind: 'TEXT', property: 'Value' }, code: { prop: 'value' } },
    },
  ],
  states: [],
  anatomy: {
    root: {
      attrs: { type: 'text' },
      literals: { 'border-width': '1px', 'padding-left': '12px', 'padding-right': '12px' },
      parts: { Value: { element: 'span', content: { prop: 'value' } } },
    },
  },
  anchors: anchors('SlotFillControl'),
});

/** The defect shape, minimal: a COLUMN root that aligns its children to the
 *  cross-axis START (so nothing stretches by default), holding two slots —
 *  one that declares `control.fill`, one that does not. */
const field = ContractSchema.parse({
  id: 'fixture.slot-fill-field',
  name: 'SlotFillField',
  version: '1.0.0',
  description: 'Column root aligned to start, holding a filled and an unfilled slot.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'column', align: 'start' },
      parts: {
        Filled: {
          layout: { display: 'flex', direction: 'column', align: 'stretch' },
          slot: {
            name: 'children',
            accepts: [control.id],
            acceptsMode: 'restrict',
            control: { fill: 'width' },
            defaultContent: [{ id: control.id }],
          },
        },
        Plain: {
          layout: { display: 'flex', direction: 'column', align: 'stretch' },
          slot: {
            name: 'extra',
            accepts: [control.id],
            acceptsMode: 'restrict',
            defaultContent: [{ id: control.id }],
          },
        },
      },
    },
  },
  anchors: anchors('SlotFillField'),
});

const contracts = new Map([
  [control.id, control],
  [field.id, field],
]);
const ctx = { tokens: new Set<string>(), icons: new Map<string, string>(), contracts };

const refusals: string[] = [];
validateContract(field, contracts, refusals, ctx.icons);
expect(refusals.length === 0, `the slot-fill fixture was refused: ${refusals.join(' | ')}`);

const html = emitHtml(field, ctx);

// ---------------------------------------------------------------------------
// Properties 1 + 2 — MEASURED on the surface the parity instrument renders
// ---------------------------------------------------------------------------
const { browser } = await launchBrowser();
try {
  const page = await browser.newPage();
  await page.setContent(
    [
      '<!doctype html><html><head><meta charset="utf-8">',
      `<style>${html.css}</style>`,
      // The instrument's OWN forcing helper, not a hand-rolled equivalent:
      // the fixture must measure the context the failing row measures.
      renderContextSizeCss(ROOT_WIDTH, undefined),
      '</head><body>',
      html.html,
      '</body></html>',
    ].join('\n'),
  );
  const measured = (await page.evaluate(`(() => {
    const item = document.querySelector('.showcase__item');
    const box = (sel) => {
      const el = item.querySelector(sel);
      return el ? +el.getBoundingClientRect().width.toFixed(2) : null;
    };
    return {
      root: box('[data-part="root"]'),
      filledWrapper: box('[data-part="Filled"]'),
      filledControl: box('[data-part="Filled"] input'),
      plainWrapper: box('[data-part="Plain"]'),
      plainControl: box('[data-part="Plain"] input'),
    };
  })()`)) as Record<string, number | null>;

  expect(
    measured.root === ROOT_WIDTH,
    `the forced render context did not apply: root measured ${measured.root}, expected ${ROOT_WIDTH}`,
  );
  expect(
    measured.filledWrapper === ROOT_WIDTH,
    `slot wrapper declaring control.fill "width" does not fill its parent: measured ${measured.filledWrapper}, expected ${ROOT_WIDTH} (it shrink-to-fits under the root's align-items: flex-start)`,
  );
  expect(
    measured.filledControl === ROOT_WIDTH,
    `the slotted control does not fill its parent: measured ${measured.filledControl}, expected ${ROOT_WIDTH} — its width: 100% resolves against a hugging wrapper, so the declaration is inert`,
  );
  // Negative control: the rule is conditional on the declaration.
  expect(
    typeof measured.plainWrapper === 'number' && measured.plainWrapper < ROOT_WIDTH,
    `a slot WITHOUT control.fill was stretched anyway: measured ${measured.plainWrapper} — the fill must follow the declaration, not every slot wrapper`,
  );
  expect(
    typeof measured.plainControl === 'number' && measured.plainControl < ROOT_WIDTH,
    `a control in a slot WITHOUT control.fill was widened anyway: measured ${measured.plainControl}`,
  );
} finally {
  await browser.close();
}

// ---------------------------------------------------------------------------
// Property 3 — the delivered React surface must not drift from the measured one
// ---------------------------------------------------------------------------
const cssErrors: string[] = [];
const reactCss = generateCss(field, new Set<string>(), cssErrors);
expect(cssErrors.length === 0, `React CSS generation refused the fixture: ${cssErrors.join(' | ')}`);

const block = (css: string, selector: string) =>
  css.match(new RegExp(`\\${selector}\\s*\\{[^}]*\\}`))?.[0] ?? '';
const fills = (decls: string) => /align-self:\s*stretch/.test(decls) || /width:\s*100%/.test(decls);

const htmlFilled = block(html.css, '.slot-fill-field__Filled');
const reactFilled = block(reactCss, '.Filled');
expect(
  fills(htmlFilled),
  `html surface leaves the filled slot wrapper hugging:\n${htmlFilled}`,
);
expect(
  fills(reactFilled),
  `delivered React surface leaves the filled slot wrapper hugging (DW-014-002 shape: the instrument never renders it):\n${reactFilled}`,
);
expect(
  !fills(block(html.css, '.slot-fill-field__Plain')) && !fills(block(reactCss, '.Plain')),
  'a slot wrapper WITHOUT control.fill received a fill declaration on one of the code surfaces',
);

// ---------------------------------------------------------------------------
// Property 4 — the canvas leg: the wrapper must not hug on the canvas either
// ---------------------------------------------------------------------------
const figma = emitFigmaScript(field, {
  tokens: { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } } as never,
  icons: new Map(),
  contracts,
});
const filledSpec =
  figma.match(/\{[^{}]*"type": "slot",\s*"name": "Filled",[\s\S]*?"slotProperty": "Children"[\s\S]*?\}/)?.[0] ?? '';
expect(
  /"grow": true/.test(filledSpec),
  `Figma spec leaves the filled slot wrapper HUG — the parent declares align "start", so stretchChildren never fires and the canvas reproduces the same inert fill:\n${filledSpec}`,
);
expect(
  /childSpec\.grow && 'layoutSizingHorizontal' in childNode/.test(figma),
  'the emitted Figma runtime no longer carries the grow → layoutSizingHorizontal FILL branch this property relies on',
);

if (problems.length > 0) {
  console.error(`✘ slot-control-fill-reaches-wrapper:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}

console.log(
  `slot-control-fill-reaches-wrapper ok: a slot declaring control.fill "width" fills its parent on all three surfaces (measured ${ROOT_WIDTH}px), and a slot without it still hugs`,
);
