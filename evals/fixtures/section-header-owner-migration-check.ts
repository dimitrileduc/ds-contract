/** Preserve the title text carrier and layout facts while moving it to its real owner. */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (name: string) => JSON.parse(readFileSync(path.join(ROOT, 'contracts', name), 'utf8')) as any;
const failures: string[] = [];
for (const [file, label] of [
  ['hero.contract.json', 'Hero'],
  ['presentation.contract.json', 'Presentation'],
  ['texte-seo.contract.json', 'TexteSEO'],
  ['produits-ecommerce.contract.json', 'ProduitsECommerce'],
] as const) {
  const filename = path.join(ROOT, 'contracts', file);
  if (!existsSync(filename)) {
    failures.push(`${label} contract missing`);
    continue;
  }
  const contract = read(file);
  const prop = (contract.props ?? []).find((candidate: any) => candidate.name === 'titre');
  if (prop?.type !== 'rich-text' || prop?.bindings?.figma?.kind !== 'TEXT' || prop?.bindings?.figma?.property !== 'Titre') {
    failures.push(`${label} must keep title content as one rich-text Figma TEXT property`);
  }
  const serialised = JSON.stringify(contract.anatomy?.root);
  if (!serialised.includes('"align":"start"') || !serialised.includes('"width":"fill"')) {
    failures.push(`${label} direct title route must remain left-aligned and fill its owner width`);
  }
  if (label === 'Hero' && !serialised.includes('"font-weight":"300"')) {
    failures.push('Hero must preserve its observed light base weight under rich-text strong ranges');
  }
}
if (failures.length) {
  console.error('✘ section-header-owner-migration:');
  for (const failure of failures) console.error(`   - ${failure}`);
  process.exit(1);
}
console.log('section-header-owner-migration ok: direct title owners keep rich Figma text and the observed geometry facts');
