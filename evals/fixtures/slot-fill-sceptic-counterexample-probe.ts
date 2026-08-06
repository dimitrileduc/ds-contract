/**
 * SCEPTIC PASS — counter-example hunt for the proposed `slot.control.fill`
 * remedy (spec 016, ds.field).
 *
 * NOT a fixture (no assertions, no exit code): a MEASURING probe. It renders
 * the emit-html surface of the two contracts the byte-diff says are touched
 * (ds.field, ds.formulaire) in three containment contexts and prints the
 * measured widths, so a pristine run and a patched run can be compared.
 *
 *   1. Field with the parity instrument's forced 280px context (the ONE
 *      context the visual-parity row measures).
 *   2. Field with NO forced context, inside a WIDE (900px) block — the shape
 *      a real page gives it. Figma pins `Saisie` FIXED 280 / layoutGrow 0, so
 *      any measurement above 280 here is the remedy diverging from the source.
 *   3. Formulaire as emitted (its own nested Field instances).
 *
 * Read-only. Writes nothing; drives headless Chromium via the instrument's
 * own launcher.
 *   npx tsx evals/fixtures/slot-fill-sceptic-counterexample-probe.ts
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ContractSchema } from '../../scripts/contract-schema.js';
import { tokenInventoryFromJson } from '../../core/tokens.js';
import { emitHtml } from '../../core/emit-html.js';
import { launchBrowser, renderContextSizeCss } from '../../extract/figma/visual-parity/render.js';

const ROOT = process.cwd();
const read = (p: string) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));

const tokenFiles: string[] = [];
const walkTokens = (dir: string) => {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walkTokens(p);
    else if (f.name.endsWith('.tokens.json')) tokenFiles.push(p);
  }
};
walkTokens(path.join(ROOT, 'tokens'));
tokenFiles.sort();
const inventory = tokenInventoryFromJson(tokenFiles.map((f) => JSON.parse(readFileSync(f, 'utf8'))));

const icons = new Map<string, string>();
for (const subdir of ['icons', 'vectors']) {
  const dir = path.join(ROOT, 'assets', subdir);
  try {
    for (const f of readdirSync(dir).sort()) {
      if (f.endsWith('.svg')) icons.set(f.replace(/\.svg$/, ''), readFileSync(path.join(dir, f), 'utf8').trim());
    }
  } catch { /* optional */ }
}

const contracts = new Map(
  readdirSync(path.join(ROOT, 'contracts'))
    .filter((f) => f.endsWith('.contract.json'))
    .map((f) => ContractSchema.parse(read(path.join('contracts', f))))
    .map((c) => [c.id, c] as const),
);
const ctx = { tokens: inventory, icons, contracts };

const field = emitHtml(contracts.get('ds.field')!, ctx);
const formulaire = emitHtml(contracts.get('ds.formulaire')!, ctx);

const page1 = [
  '<!doctype html><html><head><meta charset="utf-8">',
  `<style>${field.css}</style>`,
  renderContextSizeCss(280, undefined),
  '</head><body>', field.html, '</body></html>',
].join('\n');

const page2 = [
  '<!doctype html><html><head><meta charset="utf-8">',
  `<style>${field.css}</style>`,
  '<style>body{margin:0} .wide{width:900px}</style>',
  '</head><body><div class="wide">', field.html, '</div></body></html>',
].join('\n');

const page3 = [
  '<!doctype html><html><head><meta charset="utf-8">',
  `<style>${formulaire.css}</style>`,
  '<style>body{margin:0}</style>',
  '</head><body>', formulaire.html, '</body></html>',
].join('\n');

const { browser } = await launchBrowser();
try {
  const measure = async (html: string, script: string) => {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
    await page.setContent(html);
    const out = await page.evaluate(script);
    await page.close();
    return out;
  };

  const fieldBoxes = `(() => {
    const w = (el) => el ? +el.getBoundingClientRect().width.toFixed(2) : null;
    const item = document.querySelector('.showcase__item') || document.body;
    const root = item.querySelector('[data-part="root"]');
    return {
      root: w(root),
      label: w(item.querySelector('[data-part="label"]')),
      Saisie: w(item.querySelector('[data-part="Saisie"]')),
      control: w(item.querySelector('[data-part="Saisie"] .input, [data-part="Saisie"] input')),
      messageErreur: w(item.querySelector('[data-part="messageErreur"]')),
    };
  })()`;

  console.log('1. FIELD, forced 280 context (the parity row):');
  console.log('   ', JSON.stringify(await measure(page1, fieldBoxes)));

  console.log('2. FIELD, NO forced context, inside a 900px block:');
  console.log('   ', JSON.stringify(await measure(page2, fieldBoxes)));

  const formBoxes = `(() => {
    const w = (el) => el ? +el.getBoundingClientRect().width.toFixed(2) : null;
    const item = document.querySelector('.showcase__item') || document.body;
    const fields = [...item.querySelectorAll('[data-part="FormRow1FieldA"], [data-part="FormRow3Field"]')];
    const saisies = [...item.querySelectorAll('[class*="field__Saisie"], [data-part="Saisie"]')];
    return {
      formColumn: w(item.querySelector('[data-part="form"]')),
      row1: w(item.querySelector('[data-part="row"]')),
      fieldInstances: fields.map(w),
      saisieBoxes: saisies.map(w),
      saisieCount: saisies.length,
    };
  })()`;
  console.log('3. FORMULAIRE as emitted:');
  console.log('   ', JSON.stringify(await measure(page3, formBoxes)));
} finally {
  await browser.close();
}
