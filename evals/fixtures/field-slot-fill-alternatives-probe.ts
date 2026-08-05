/**
 * PROBE (not a gate) — measures the REAL `ds.field` contract at the parity
 * instrument's own render width (280 CSS px) under three shapes, to decide
 * whether the "slot wrapper does not stretch" defect needs an ENGINE fix or
 * is a contract-side regression introduced by hand.
 *
 *   A. as committed today                     (root layout.align = "start")
 *   B. root `align: "start"` REMOVED          (the shape `extract/out/figma/
 *                                              field.contract.proposed.json`
 *                                              actually proposes)
 *   C. as committed + `align-self: stretch`   (the engine remedy, injected
 *      appended to the .field__Saisie rule      as raw CSS so core/ is untouched)
 *
 * Read-only: emits through the pristine `core/` in the checkout and writes
 * nothing. Prints measurements; never asserts.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitHtml } from '../../core/emit-html.js';
import { launchBrowser, renderContextSizeCss } from '../../extract/figma/visual-parity/render.js';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const WIDTH = 280;
const read = (p: string) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));

const contracts = new Map<string, ReturnType<typeof ContractSchema.parse>>();
for (const f of readdirSync(path.join(ROOT, 'contracts')).filter((f) => f.endsWith('.contract.json'))) {
  const c = ContractSchema.parse(read(`contracts/${f}`));
  contracts.set(c.id, c);
}
const icons = new Map<string, string>();
for (const name of Object.keys(read('contracts/icons.registry.json').icons ?? {})) {
  try { icons.set(name, readFileSync(path.join(ROOT, 'assets', 'icons', `${name}.svg`), 'utf8')); } catch { /* absent */ }
}

const build = (
  mutate: (raw: Record<string, never>) => void,
  mutateInput?: (raw: Record<string, never>) => void,
) => {
  const raw = read('contracts/field.contract.json');
  mutate(raw as never);
  const c = ContractSchema.parse(raw);
  const map = new Map(contracts);
  map.set(c.id, c);
  if (mutateInput) {
    const rawIn = read('contracts/input.contract.json');
    mutateInput(rawIn as never);
    const ci = ContractSchema.parse(rawIn);
    map.set(ci.id, ci);
  }
  return emitHtml(c, { tokens: new Set<string>(), icons, contracts: map });
};

const A = build(() => {});
const B = build((raw) => { delete (raw as never as { anatomy: { root: { layout: { align?: string } } } }).anatomy.root.layout.align; });
const C = { ...A, css: `${A.css}\n.field__Saisie { align-self: stretch; }` };
// D. contract untouched on Field; the SOURCE fact restored on ds.input — the
//    Figma Input master is FIXED 280x48 (extract/out/figma/input.rest-dump.json
//    variants[0].bbox + layout.primarySizing "FIXED") and the contract carries
//    no width at all.
const D = build(() => {}, (raw) => {
  const r = raw as never as { anatomy: { root: { literals?: Record<string, string> } } };
  (r.anatomy.root.literals ??= {}).width = '280px';
});

const { browser } = await launchBrowser();
const measure = async (label: string, out: { html: string; css: string }) => {
  const page = await browser.newPage();
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>${out.css}</style>${renderContextSizeCss(WIDTH, undefined)}</head><body>${out.html}</body></html>`,
  );
  const m = await page.evaluate(`(() => {
    const item = document.querySelector('.showcase__item');
    const w = (sel) => { const el = item.querySelector(sel); return el ? +el.getBoundingClientRect().width.toFixed(2) : null; };
    return { root: w('[data-part="root"]'), label: w('[data-part="label"]'), saisie: w('[data-part="Saisie"]'), control: w('[data-part="Saisie"] input'), erreur: w('[data-part="messageErreur"]') };
  })()`);
  await page.close();
  console.log(label, JSON.stringify(m));
};
try {
  await measure('A committed        ', A);
  await measure('B no root align    ', B);
  await measure('C engine remedy    ', C);
  await measure('D input 280 source ', D);
} finally {
  await browser.close();
}
