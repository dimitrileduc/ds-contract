/**
 * SCOPE RE-COUNT (sceptic pass, spec 016 — field `slot.control.fill`).
 *
 * NOT a fixture: a measuring instrument. Emits the FOUR surfaces
 * (emit-html CSS, emit-react CSS, emit-react-inline TSX, emit-figma-script)
 * for EVERY contract in contracts/, into the directory given as argv[2], so a
 * pristine tree and a patched tree can be diffed byte-for-byte.
 *
 * Read-only on the repo: the only writes go to argv[2].
 *   npx tsx evals/fixtures/slot-fill-sceptic-scope-dump.ts <outDir>
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ContractSchema } from '../../scripts/contract-schema.js';
import { tokenInventoryFromJson } from '../../core/tokens.js';
import { emitHtml } from '../../core/emit-html.js';
import { generateCss } from '../../core/emit-react.js';
import { emitReactInline } from '../../core/emit-react-inline.js';
import { emitFigmaScript } from '../../core/emit-figma-script.js';

const ROOT = process.cwd();
const OUT = process.argv[2];
if (!OUT) throw new Error('usage: slot-fill-sceptic-scope-dump.ts <outDir>');
mkdirSync(OUT, { recursive: true });

const read = (p: string) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));

const brandNames = readdirSync(path.join(ROOT, 'tokens', 'modes'))
  .filter((f) => /^brand\.[a-z][a-z0-9-]*\.tokens\.json$/.test(f))
  .map((f) => f.replace(/^brand\.|\.tokens\.json$/g, ''));

const tokenTrees = {
  primitives: read('tokens/primitives.tokens.json'),
  semantic: read('tokens/semantic.tokens.json'),
  light: read('tokens/modes/semantic.light.tokens.json'),
  dark: existsSync(path.join(ROOT, 'tokens', 'modes', 'semantic.dark.tokens.json'))
    ? read('tokens/modes/semantic.dark.tokens.json')
    : {},
  brands: Object.fromEntries(brandNames.map((n) => [n, read(`tokens/modes/brand.${n}.tokens.json`)])),
};

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
  } catch { /* optional source directory */ }
}

const files = readdirSync(path.join(ROOT, 'contracts')).filter((f) => f.endsWith('.contract.json')).sort();
const contracts = files.map((f) => ContractSchema.parse(read(path.join('contracts', f))));
const byId = new Map(contracts.map((c) => [c.id, c]));

for (const c of contracts) {
  const record = (suffix: string, body: string) =>
    writeFileSync(path.join(OUT, `${c.name}.${suffix}`), body);
  try {
    record('html.css', emitHtml(c, { tokens: inventory, icons, contracts: byId }).css);
  } catch (e) { record('html.css', `THROW: ${(e as Error).message}`); }
  try {
    const errs: string[] = [];
    const css = generateCss(c, inventory, errs);
    record('react.css', `${css}\n/* errors: ${errs.join(' | ')} */`);
  } catch (e) { record('react.css', `THROW: ${(e as Error).message}`); }
  try {
    record('inline.tsx', emitReactInline(c, { tokens: tokenTrees as never, icons, contracts: byId }).tsx);
  } catch (e) { record('inline.tsx', `THROW: ${(e as Error).message}`); }
  try {
    record('figma.js', emitFigmaScript(c, { tokens: tokenTrees as never, icons, contracts: byId }));
  } catch (e) { record('figma.js', `THROW: ${(e as Error).message}`); }
}
console.log(`dumped ${contracts.length} contracts × 4 surfaces → ${OUT}`);
