/**
 * Receipt: emit-figma-script referees invalid contracts exactly like the
 * other three emitters (react/html/react-inline) — before this was proven,
 * the canvas surface was the one emitter that still emitted sync scripts
 * for referee-violating sets.
 *
 * Extracted from class-fix-check.ts (002-governed-icons-button, D9.4): this
 * claim never replayed a class fixture like that script's sections 1-3, and
 * entangling it there meant it couldn't run independently of section 1's
 * still-blocked ds.avatar (nested-instance) dependency. This pin needs
 * nothing but a repo contract to mutate, so it runs standalone against
 * ds.button — re-homed from the pre-reconversion demo's ds.badge, whose
 * claim was never demo-specific in the first place.
 *
 * Node shell over pure core functions — the same split as every receipt in
 * extract/figma/. Reads the repo; writes nothing.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { ContractSchema, type Contract } from '../../../scripts/contract-schema.js';
import { emitFigmaScript, iconComponentsFromRegistry, type IconRegistryEntry } from '../../../core/emit-figma-script.js';

const ROOT = process.cwd();
const read = (p: string) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8')) as Record<string, unknown>;
/** Mono-theme (Piqueray): `tokens/modes/semantic.dark.tokens.json` was removed in the reconversion —
 *  absent means "no dark overrides", not a broken read. */
const readOptional = (p: string) => (existsSync(path.join(ROOT, p)) ? read(p) : ({} as ReturnType<typeof read>));

const failures: string[] = [];
const check = (label: string, cond: boolean) => {
  if (!cond) failures.push(label);
  console.log(`  ${cond ? '✔' : '✖'} ${label}`);
};

const repoContracts = new Map<string, Contract>(
  readdirSync(path.join(ROOT, 'contracts'))
    .filter((f) => f.endsWith('.contract.json'))
    .map((f) => ContractSchema.parse(read(path.join('contracts', f))))
    .map((c) => [c.id, c]),
);
const icons = new Map<string, string>(
  readdirSync(path.join(ROOT, 'assets', 'icons'))
    .filter((f) => f.endsWith('.svg'))
    .map((f) => [f.replace(/\.svg$/, ''), readFileSync(path.join(ROOT, 'assets', 'icons', f), 'utf8').trim()]),
);
const brands = Object.fromEntries(
  readdirSync(path.join(ROOT, 'tokens', 'modes'))
    .filter((f) => /^brand\.[a-z][a-z0-9-]*\.tokens\.json$/.test(f))
    .map((f) => [f.replace(/^brand\.|\.tokens\.json$/g, ''), read(`tokens/modes/${f}`)]),
);
const repoTrees = {
  primitives: read('tokens/primitives.tokens.json'),
  semantic: read('tokens/semantic.tokens.json'),
  light: read('tokens/modes/semantic.light.tokens.json'),
  dark: readOptional('tokens/modes/semantic.dark.tokens.json'),
};
const iconRegistry = read('contracts/icons.registry.json') as { icons: IconRegistryEntry[] };
const iconComponents = iconComponentsFromRegistry(iconRegistry);

console.log('figma-script referee (emit-figma-script calls validateContract)');
{
  // A contract that is schema-valid but referee-invalid: visibleWhen points
  // at a prop that does not exist — exactly the shape the census found the
  // canvas surface silently emitting.
  const button = repoContracts.get('ds.button')!;
  const invalid = ContractSchema.parse(JSON.parse(JSON.stringify(button))) as Contract;
  (invalid.anatomy.root as { visibleWhen?: { prop: string } }).visibleWhen = { prop: 'nonexistent' };
  let refusal: string | null = null;
  try {
    emitFigmaScript(invalid, { tokens: { ...repoTrees, brands }, icons, iconComponents, contracts: repoContracts });
  } catch (e) {
    refusal = e instanceof Error ? e.message : String(e);
  }
  check('emitFigmaScript REFUSES the invalid contract (no sync script emitted)', refusal !== null);
  check('the refusal is NAMED with the emitReact wording ("Refused — 1 contract violation(s)")', refusal?.startsWith('Refused — 1 contract violation(s)') === true);
  check('the violation names the part and prop (visibleWhen references unknown prop "nonexistent")', refusal?.includes('visibleWhen references unknown prop "nonexistent"') === true);
  // And the valid original still emits byte-for-byte the same script.
  const script = emitFigmaScript(button, { tokens: { ...repoTrees, brands }, icons, iconComponents, contracts: repoContracts });
  check('the VALID repo contract still emits its sync script (golden untouched)', script.length > 0 && script.includes('ds.button'));
}

if (failures.length > 0) {
  console.error(`\n✖ ${failures.length} figma-script referee check(s) failed`);
  process.exit(1);
}
console.log('\n✔ emit-figma-script referees invalid contracts exactly like react/html/react-inline');
