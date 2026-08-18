import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ContractSchema } from '../../scripts/contract-schema.js';
import { proposeBatchFromDump, type IconRegistryLike } from '../../core/propose-figma.js';
import { loadContracts } from './propose.js';
import { loadTokenCorpus } from './tokens.js';
import type { DumpFile, DumpNode, DumpSet } from './types.js';

const ROOT = process.cwd();
const read = <T>(relative: string) =>
  JSON.parse(readFileSync(path.join(ROOT, relative), 'utf8')) as T;
const dump = read<DumpFile>('extract/figma/fixtures/accordion-row-source-cleanup.dump.json');
const set = dump.AccordionRow as DumpSet | undefined;
if (!set) throw new Error('fixture must contain the live AccordionRow set');

const failures: string[] = [];
const check = (label: string, condition: boolean) => {
  console.log(`  ${condition ? '✔' : '✖'} ${label}`);
  if (!condition) failures.push(label);
};
const variant = (name: string) => set.variants.find((entry) => entry.name === name);
const text = (node: DumpNode | undefined, name: string) =>
  node?.children?.find((child) => child.name === name || child.name === 'title') as DumpNode | undefined;

console.log('AccordionRow source-cleanup extraction receipt');

console.log('\n1. Live fixture facts (the source is the oracle)');
check('exactly four master variants', set.variants.length === 4);
for (const [name, width, height] of [
  ['Taille=Grand, Etat=Ferme', 1550, 64],
  ['Taille=Grand, Etat=Ouvert', 1550, 120],
  ['Taille=Petit, Etat=Ferme', 1550, 40],
  ['Taille=Petit, Etat=Ouvert', 1550, 80],
] as const) {
  const item = variant(name);
  check(`${name}: ${width}×${height}`, item?.bbox?.width === width && item?.bbox?.height === height);
  check(`${name}: bottom border is bound to border-width/1`, item?.bound?.strokeBottomWeight === 'border-width/1');
}
check('Grand padding is exactly 16px block', variant('Taille=Grand, Etat=Ferme')?.layout?.padding.join(',') === '16,0,16,0');
check('Petit padding is exactly 8px block', variant('Taille=Petit, Etat=Ferme')?.layout?.padding.join(',') === '8,0,8,0');
check('Grand root gap is 24px', variant('Taille=Grand, Etat=Ouvert')?.layout?.spacing === 24);
check('Petit open root gap is 8px', variant('Taille=Petit, Etat=Ouvert')?.layout?.spacing === 8);
check('Petit closed remains the documented structural asymmetry (horizontal title/chevron gap 24px)', variant('Taille=Petit, Etat=Ferme')?.layout?.spacing === 24);
check('Grand chevrons are 32px', (variant('Taille=Grand, Etat=Ferme')?.children?.find((n) => n.type === 'INSTANCE')?.bbox?.width === 32) && (text(variant('Taille=Grand, Etat=Ouvert'), 'title')?.children?.find((n) => n.type === 'INSTANCE')?.bbox?.width === 32));
check('Petit chevrons are 24px', (variant('Taille=Petit, Etat=Ferme')?.children?.find((n) => n.type === 'INSTANCE')?.bbox?.width === 24) && (text(variant('Taille=Petit, Etat=Ouvert'), 'title')?.children?.find((n) => n.type === 'INSTANCE')?.bbox?.width === 24));
const grandTitle = variant('Taille=Grand, Etat=Ferme')?.children?.find((n) => n.type === 'TEXT')?.text;
const smallTitle = variant('Taille=Petit, Etat=Ferme')?.children?.find((n) => n.type === 'TEXT')?.text;
const content = variant('Taille=Grand, Etat=Ouvert')?.children?.find((n) => n.name === 'Contenu')?.text;
check('Grand title typography is exact Montserrat SemiBold 20/25, tracking 0', grandTitle?.fontFamily === 'Montserrat' && grandTitle.fontStyle === 'SemiBold' && grandTitle.fontSize === 20 && grandTitle.lineHeight === 25 && grandTitle.letterSpacing === 0);
check('Petit title typography is exact Montserrat Bold 14/24, tracking 0', smallTitle?.fontFamily === 'Montserrat' && smallTitle.fontStyle === 'Bold' && smallTitle.fontSize === 14 && smallTitle.lineHeight === 24 && smallTitle.letterSpacing === 0);
check('Content typography is exact Montserrat Regular 14/24, tracking 0', content?.fontFamily === 'Montserrat' && content.fontStyle === 'Regular' && content.fontSize === 14 && content.lineHeight === 24 && content.letterSpacing === 0);
check('Grand border is opaque black', variant('Taille=Grand, Etat=Ferme')?.stroke?.var === 'color/noir-pur' && variant('Taille=Grand, Etat=Ferme')?.stroke?.alpha === undefined);
check('Petit border keeps noir-bleute binding and exact alpha', variant('Taille=Petit, Etat=Ferme')?.stroke?.var === 'color/noir-bleute' && variant('Taille=Petit, Etat=Ferme')?.stroke?.alpha === 0.32156863808631897);

console.log('\n2. Proposal retains the captured source facts');
const corpus = loadTokenCorpus(ROOT);
const contracts = loadContracts(path.resolve(ROOT, 'contracts'));
const iconRegistry = read<IconRegistryLike>('contracts/icons.registry.json');
const batch = proposeBatchFromDump(dump, {
  corpus,
  contractIdByName: contracts.byName,
  contractsById: contracts.byId,
  contractIdByKey: contracts.byKey,
  fileKey: dump._provenance?.fileKey ?? null,
  iconRegistry,
  mintUnbound: true,
});
check('one proposal and no skip', batch.proposals.length === 1 && batch.skipped.length === 0);
const result = batch.proposals[0]!;
const proposal = ContractSchema.parse(result.contract);
const root = proposal.anatomy.root;
const rootTokens = root.tokens ?? {};
const minted = new Map((result.mintedTokens?.entries ?? []).map((entry) => [entry.ref, entry.value]));
check('zero unbound value remains after literal-fidelity minting', result.unbound.length === 0);
check('bound bottom-only border is proposed as border-bottom-width {border-width.1}', rootTokens['border-bottom-width'] === '{border-width.1}');
check('the per-side border capture is not a stroke-weights-nonuniform degradation', !(dump._degradations ?? []).some((d) => d.code === 'stroke-weights-nonuniform'));
check('Grand/Petit open layouts survive as row/column', root.layout?.direction === 'row' && root.layoutByProp?.map?.ouvert?.direction === 'column');
check('title and content preserve FILL evidence (closed title grow; open vertical parent stretch)', root.parts?.title?.layout?.grow === true && root.layoutByProp?.map?.ouvert?.align === 'stretch');
check('padding Grand 16 / Petit 8 is carried by a taille-derived token', rootTokens['padding-block'] === '{imported.accordion-row.root.padding-block.{taille}}' && minted.get('{imported.accordion-row.root.padding-block.grand}') === '16px' && minted.get('{imported.accordion-row.root.padding-block.petit}') === '8px');
check('gap matrix 24/24/24/8 is carried without flattening the Fermé/Ouvert asymmetry', rootTokens.gap === '{imported.accordion-row.root.gap.{taille}.{etat}}' && ['grand.ferme', 'grand.ouvert', 'petit.ferme'].every((cell) => minted.get(`{imported.accordion-row.root.gap.${cell}}`) === '24px') && minted.get('{imported.accordion-row.root.gap.petit.ouvert}') === '8px');
check('border colors + alpha are carried exactly', rootTokens['border-color'] === '{imported.accordion-row.root.border-color.{taille}}' && minted.get('{imported.accordion-row.root.border-color.grand}') === '#000000' && minted.get('{imported.accordion-row.root.border-color.petit}') === '#26282c52');
check('fixed master width 1550 is carried from bbox', rootTokens.width === '{imported.accordion-row.root.width}' && minted.get('{imported.accordion-row.root.width}') === '1550px');
check('open trigger row keeps its authored 32px fixed height', root.parts?.title?.tokens?.height === '{imported.accordion-row.title.height}' && minted.get('{imported.accordion-row.title.height}') === '32px');
check('content text box keeps Grand 32 / Petit 24, so open heights remain 120/80', root.parts?.Contenu?.tokens?.height === '{imported.accordion-row.contenu.height.{taille}}' && minted.get('{imported.accordion-row.contenu.height.grand}') === '32px' && minted.get('{imported.accordion-row.contenu.height.petit}') === '24px');
for (const partName of ['Titre', 'TitreOuvert'] as const) {
  const part = partName === 'Titre' ? root.parts?.Titre : root.parts?.title?.parts?.TitreOuvert;
  check(`${partName}: family, size, weight, line-height and tracking all carry`, part?.tokens?.['font-family'] === '{font.family.montserrat}' && part.tokens['font-size']?.includes('{taille}') === true && part.tokens['font-weight']?.includes('{taille}') === true && part.tokens['line-height']?.includes('{taille}') === true && part.tokens['letter-spacing'] === '{imported.shared.size-0}');
}
// 2026-08-12 : la campagne projection-repair a minté les tokens typography.* ;
// l'extraction lie désormais size/weight du Contenu aux porteurs GOUVERNÉS
// ({typography.paragraphe.*} = 14px/400, vérifié dans tokens/semantic) au lieu
// de frapper des imported.* — mêmes valeurs, meilleur porteur (lier avant de
// frapper). line-height reste minté (la liaison typo couvre size/weight
// aujourd'hui) et le tracking partagé reste {imported.shared.size-0}.
check('Contenu typography carries 14/400/24 with Montserrat and tracking 0', root.parts?.Contenu?.tokens?.['font-family'] === '{font.family.montserrat}' && root.parts.Contenu.tokens['font-size'] === '{typography.paragraphe.size}' && root.parts.Contenu.tokens['font-weight'] === '{typography.paragraphe.weight}' && minted.get(root.parts.Contenu.tokens['line-height']!) === '24px' && minted.get(root.parts.Contenu.tokens['letter-spacing']!) === '0px');
for (const [partName, asset] of [['ChevronDown', 'chevron-down'], ['ChevronUp', 'chevron-up']] as const) {
  const part = partName === 'ChevronDown' ? root.parts?.ChevronDown : root.parts?.title?.parts?.ChevronUp;
  check(`${partName}: governed asset is 32px with Petit 24px override`, part?.icon?.asset === asset && part.icon.size === 32 && part.literalsByProp?.[0]?.map?.petit?.width === '24px' && part.literalsByProp?.[0]?.map?.petit?.height === '24px');
}

if (failures.length > 0) {
  console.error(`\n✖ ${failures.length} AccordionRow extraction invariant(s) failed`);
  process.exit(1);
}
console.log('\n✔ AccordionRow source-cleanup extraction receipt holds');
