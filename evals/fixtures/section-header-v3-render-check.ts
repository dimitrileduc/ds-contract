/** Runtime-surface assertions for the generic v3 header. */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitHtml } from '../../core/emit-html.js';
import { emitReact } from '../../core/emit-react.js';

const ROOT = process.cwd();
const json = (relative: string) => JSON.parse(readFileSync(path.join(ROOT, relative), 'utf8'));
const contracts = new Map(
  readdirSync(path.join(ROOT, 'contracts'))
    .filter((name) => name.endsWith('.contract.json'))
    .map((name) => {
      const contract = ContractSchema.parse(json(`contracts/${name}`));
      return [contract.id, contract] as const;
    }),
);
const sectionHeader = contracts.get('ds.section-header');
if (!sectionHeader) throw new Error('missing ds.section-header contract');
const tokens = new Set([
  'color.blanc', 'color.noir-bleute', 'font.family.montserrat', 'font.size.20', 'font.size.24', 'font.size.32', 'font.size.40', 'font.size.54',
  'font.weight.bold', 'font.weight.regular', 'space.8',
]);
const ctx = { tokens, icons: new Map<string, string>(), contracts };
const react = emitReact(sectionHeader, ctx);
const html = emitHtml(sectionHeader, ctx);
const failures: string[] = [];

for (const [surface, source] of [['React', react.tsx], ['HTML', html.html]] as const) {
  for (const legacy of ['disposition', 'emphase', 'accroche2', 'Button']) {
    if (source.includes(legacy)) failures.push(`${surface} still renders legacy ${legacy}`);
  }
}
for (const expected of [
  "alignement = 'centre'",
  'afficherAccroche = true',
  'titre?: Array<{ text: string; strong?: boolean }>',
  'afficherAccroche ? (<span className={styles.Accroche}>{accroche}</span>) : null',
  'titre.map((segment, index)',
]) {
  if (!react.tsx.includes(expected)) failures.push(`React misses ${expected}`);
}
if (!html.html.includes('data-afficher-accroche="true"') || !html.html.includes('section-header--alignement-gauche') || !html.html.includes('section-header__Titre')) {
  failures.push('HTML does not expose the governed eyebrow, rich-title and alignment reference surface');
}
for (const [surface, css] of [['React CSS', react.css], ['HTML CSS', html.css]] as const) {
  for (const expected of ['font-size: var(--font-size-40)', 'line-height: 50px', 'color: var(--color-noir-bleute)']) {
    if (!css.includes(expected)) failures.push(`${surface} misses the dark 40/50 title fact ${expected}`);
  }
  if (!css.includes('text-align: center')) {
    failures.push(`${surface} does not render the Centre alignment selection`);
  }
  if (!css.includes('alignement-gauche') || !css.includes('align-items: start') || !css.includes('text-align: left')) {
    failures.push(`${surface} does not render the Gauche alignment selection`);
  }
  if (css.includes('disposition-') || css.includes('emphase-')) failures.push(`${surface} retains legacy layout axes`);
}

if (failures.length) {
  console.error('✘ section-header-v3-render:');
  for (const failure of failures) console.error(`   - ${failure}`);
  process.exit(1);
}
console.log('section-header-v3-render ok: rich title and optional eyebrow preserve spacing; generic rendering stays dark 40/50');
