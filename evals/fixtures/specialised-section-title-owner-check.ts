/** Specialised hierarchy must be owned by the consuming section, never by a hidden generic variant. */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (name: string) => JSON.parse(readFileSync(path.join(ROOT, 'contracts', name), 'utf8')) as any;
const walk = (part: any, hits: any[] = []): any[] => {
  if (!part || typeof part !== 'object') return hits;
  if (part.component?.id === 'ds.section-header') hits.push(part);
  for (const child of Object.values(part.parts ?? {})) walk(child, hits);
  return hits;
};
const title = (contract: any) => {
  const found: any[] = [];
  const descend = (part: any) => {
    if (!part || typeof part !== 'object') return;
    if (part.content?.prop === 'titre') found.push(part);
    for (const child of Object.values(part.parts ?? {})) descend(child);
  };
  descend(contract.anatomy?.root);
  return found;
};
const failures: string[] = [];
const expectations = [
  ['hero.contract.json', 'Hero', '{color.blanc}', '{font.size.54}', '68px'],
  ['presentation.contract.json', 'Presentation', '{color.noir-bleute}', '{font.size.32}', '40px'],
  ['texte-seo.contract.json', 'TexteSEO', '{color.noir-bleute}', '{font.size.24}', '30px'],
] as const;
for (const [file, label, color, size, lineHeight] of expectations) {
  const contract = read(file);
  if (walk(contract.anatomy?.root).length) failures.push(`${label} still delegates its hierarchy to ds.section-header`);
  const titles = title(contract);
  if (titles.length !== 1) failures.push(`${label} must own exactly one direct titre part, got ${titles.length}`);
  else {
    const own = titles[0];
    if (own.tokens?.color !== color || own.tokens?.['font-size'] !== size || own.literals?.['line-height'] !== lineHeight) {
      failures.push(`${label} direct title must be ${color} ${size}/${lineHeight}`);
    }
  }
}
const productPath = path.join(ROOT, 'contracts/produits-ecommerce.contract.json');
if (!existsSync(productPath)) failures.push('ProduitsECommerce must become a canonical direct owner contract');
else {
  const product = read('produits-ecommerce.contract.json');
  if (walk(product.anatomy?.root).length) failures.push('ProduitsECommerce still delegates to ds.section-header');
  const titles = title(product);
  if (titles.length !== 1 || titles[0].tokens?.['font-size'] !== '{font.size.32}' || titles[0].literals?.['line-height'] !== '40px') {
    failures.push('ProduitsECommerce must own a direct dark 32/40 titre');
  }
  const serialised = JSON.stringify(product.anatomy?.root);
  if (!serialised.includes('ds.button') || !serialised.includes('ds.product-card') || !serialised.includes('ds.carousel-controls')) {
    failures.push('ProduitsECommerce must own its CTA, product cards and carousel controls');
  }
}
if (failures.length) {
  console.error('✘ specialised-section-title-owner:');
  for (const failure of failures) console.error(`   - ${failure}`);
  process.exit(1);
}
console.log('specialised-section-title-owner ok: each owner carries its own title hierarchy and Products owns the CTA');
