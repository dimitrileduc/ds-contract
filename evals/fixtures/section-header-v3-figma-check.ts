/** Generated Figma projection must expose only the two intentional v3 variants. */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ContractSchema } from '../../scripts/contract-schema.js';
import { createFigmaEngine, iconComponentsFromRegistry, type IconRegistryEntry, type NodeSpec } from '../../core/emit-figma-script.js';

const ROOT = process.cwd();
const json = (relative: string) => JSON.parse(readFileSync(path.join(ROOT, relative), 'utf8'));
const brandNames = readdirSync(path.join(ROOT, 'tokens/modes'))
  .filter((name) => /^brand\.[a-z][a-z0-9-]*\.tokens\.json$/.test(name))
  .map((name) => name.replace(/^brand\.|\.tokens\.json$/g, ''));
const icons = new Map<string, string>();
for (const directory of ['icons', 'vectors']) {
  for (const name of readdirSync(path.join(ROOT, 'assets', directory))) {
    if (name.endsWith('.svg')) icons.set(name.replace(/\.svg$/, ''), readFileSync(path.join(ROOT, 'assets', directory, name), 'utf8').trim());
  }
}
const engine = createFigmaEngine({
  tokens: {
    primitives: json('tokens/primitives.tokens.json'),
    semantic: json('tokens/semantic.tokens.json'),
    light: json('tokens/modes/semantic.light.tokens.json'),
    dark: existsSync(path.join(ROOT, 'tokens/modes/semantic.dark.tokens.json')) ? json('tokens/modes/semantic.dark.tokens.json') : {},
    brands: Object.fromEntries(brandNames.map((name) => [name, json(`tokens/modes/brand.${name}.tokens.json`)])),
  },
  icons,
  iconComponents: iconComponentsFromRegistry(json('contracts/icons.registry.json') as { icons: IconRegistryEntry[] }),
});
const all = readdirSync(path.join(ROOT, 'contracts'))
  .filter((name) => name.endsWith('.contract.json'))
  .map((name) => ContractSchema.parse(json(`contracts/${name}`)));
const byId = new Map(all.map((contract) => [contract.id, contract]));
const sectionHeader = byId.get('ds.section-header');
if (!sectionHeader) throw new Error('missing ds.section-header contract');
const data = engine.compileComponentData(sectionHeader, byId);
const walk = (node: NodeSpec, result: NodeSpec[] = []): NodeSpec[] => {
  result.push(node);
  for (const child of node.children ?? []) walk(child, result);
  return result;
};
const failures: string[] = [];
const names = data.variants.map((variant) => variant.name);
if (!data.isSet || JSON.stringify(names) !== JSON.stringify(['Alignement=Centre', 'Alignement=Gauche'])) {
  failures.push(`generated set must contain exactly Alignement=Centre|Gauche, got ${JSON.stringify(names)}`);
}
if (JSON.stringify(data.boolProps) !== JSON.stringify([{ property: 'Afficher accroche', default: true }])) {
  failures.push(`generated BOOLEAN surface must be only Afficher accroche=true, got ${JSON.stringify(data.boolProps)}`);
}
if (data.textProps.length || data.forwardedProps.length || data.swapProps.length) {
  failures.push('v3 has no unbound, forwarded or swap property escape hatch');
}
for (const variant of data.variants) {
  const nodes = walk(variant.spec);
  const title = nodes.find((node) => node.name === 'Titre');
  const eyebrow = nodes.find((node) => node.name === 'Accroche');
  if (title?.fontSize !== 40 || title?.lineHeight !== 50 || title?.contentProp !== 'Titre') {
    failures.push(`${variant.name}: title is not the governed 40/50 Titre text node`);
  }
  if (eyebrow?.contentProp !== 'Accroche' || eyebrow?.visibleProp !== 'Afficher accroche') {
    failures.push(`${variant.name}: eyebrow does not bind Accroche plus Afficher accroche`);
  }
  if (nodes.some((node) => node.name === 'Bouton')) failures.push(`${variant.name}: generic Figma variant still contains CTA anatomy`);
}
if (failures.length) {
  console.error('✘ section-header-v3-figma:');
  for (const failure of failures) console.error(`   - ${failure}`);
  process.exit(1);
}
console.log('section-header-v3-figma ok: exactly two alignment variants, 40/50 title, explicit eyebrow visibility, no generic CTA');
