/** Preserve the title text carrier and layout facts while moving it to its real owner. */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (name: string) => JSON.parse(readFileSync(path.join(ROOT, 'contracts', name), 'utf8')) as any;
const failures: string[] = [];
// Vague 031 (2026-09-02) : la liaison Figma attendue est NOMMÉE contrat par contrat.
// « NONE » n'est légitime que là où le set 031 dessine le titre SUR LE NŒUD, sans
// propriété TEXT (Presentation). Partout ailleurs la liaison TEXT « Titre » reste
// exigée : une liaison perdue doit continuer à faire rougir cette porte.
for (const [file, label, liaisonAttendue] of [
  ['hero.contract.json', 'Hero', 'TEXT'],
  ['presentation.contract.json', 'Presentation', 'NONE'],
  ['texte-seo.contract.json', 'TexteSEO', 'TEXT'],
  ['produits-ecommerce.contract.json', 'ProduitsECommerce', 'TEXT'],
] as const) {
  const filename = path.join(ROOT, 'contracts', file);
  if (!existsSync(filename)) {
    failures.push(`${label} contract missing`);
    continue;
  }
  const contract = read(file);
  const prop = (contract.props ?? []).find((candidate: any) => candidate.name === 'titre');
  const liaison = prop?.bindings?.figma?.kind;
  const liaisonValide = liaisonAttendue === 'NONE'
    ? liaison === 'NONE'
    : liaison === 'TEXT' && prop?.bindings?.figma?.property === 'Titre';
  if (prop?.type !== 'rich-text' || !liaisonValide) {
    failures.push(`${label} must keep title content as one rich-text prop bound ${liaisonAttendue === 'NONE' ? 'NONE (the set draws the title on the node)' : "to the set's TEXT property « Titre »"}, got ${liaison ?? 'nothing'}`);
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
