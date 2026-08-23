/**
 * SectionHeader v3 is deliberately a smaller generic contract.  This fixture
 * is the refusal boundary for legacy CTA/hierarchy axes: specialised sections
 * own those concerns instead of smuggling them through the generic header.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const contract = JSON.parse(
  readFileSync(path.join(ROOT, 'contracts/section-header.contract.json'), 'utf8'),
) as Record<string, any>;

const failures: string[] = [];
const props = Array.isArray(contract.props) ? contract.props : [];
const byName = new Map(props.map((prop: Record<string, any>) => [prop.name, prop]));
const names = [...byName.keys()].sort();
const expectedNames = ['accroche', 'afficherAccroche', 'alignement', 'titre'];

if (contract.id !== 'ds.section-header' || contract.version !== '3.0.0') {
  failures.push(`expected ds.section-header@3.0.0, got ${String(contract.id)}@${String(contract.version)}`);
}
if (JSON.stringify(names) !== JSON.stringify(expectedNames)) {
  failures.push(`v3 exposes exactly ${expectedNames.join(', ')}, got ${names.join(', ') || '(none)'}`);
}
for (const legacy of ['disposition', 'emphase', 'accroche2']) {
  if (byName.has(legacy)) failures.push(`legacy prop ${legacy} still leaks through the generic API`);
}

const titre = byName.get('titre');
if (titre?.type !== 'rich-text' || titre?.bindings?.figma?.kind !== 'TEXT' || titre?.bindings?.figma?.property !== 'Titre') {
  failures.push('titre must remain one governed rich-text Figma TEXT property named Titre');
}
const accroche = byName.get('accroche');
if (accroche?.type !== 'text' || accroche?.bindings?.figma?.kind !== 'TEXT' || accroche?.bindings?.figma?.property !== 'Accroche') {
  failures.push('accroche must remain the governed eyebrow TEXT property');
}
const afficherAccroche = byName.get('afficherAccroche');
if (afficherAccroche?.type !== 'boolean' || afficherAccroche?.default !== true ||
    afficherAccroche?.bindings?.figma?.kind !== 'BOOLEAN' || afficherAccroche?.bindings?.figma?.property !== 'Afficher accroche') {
  failures.push('afficherAccroche must be the default-true Figma BOOLEAN property "Afficher accroche"');
}

const alignement = byName.get('alignement');
const alignmentValues = alignement?.type?.enum;
if (JSON.stringify(alignmentValues) !== JSON.stringify(['centre', 'gauche']) || alignement?.default !== 'centre') {
  failures.push(`alignement must offer only centre/gauche with centre by default, got ${JSON.stringify(alignmentValues)} default=${String(alignement?.default)}`);
}
if (alignement?.bindings?.figma?.kind !== 'VARIANT' ||
    alignement?.bindings?.figma?.property !== 'Alignement' ||
    JSON.stringify(alignement?.bindings?.figma?.values) !== JSON.stringify({ centre: 'Centre', gauche: 'Gauche' })) {
  failures.push('Figma must expose exactly Alignement=Centre|Gauche');
}

const root = contract.anatomy?.root;
const title = root?.parts?.Titre;
if (title?.content?.prop !== 'titre' ||
    title?.tokens?.color !== '{color.noir-bleute}' ||
    title?.tokens?.['font-size'] !== '{font.size.40}' ||
    title?.literals?.['line-height'] !== '50px') {
  failures.push('the generic title must be dark {font.size.40}/50px and retain its rich titre binding');
}
if (root?.parts?.Bouton) failures.push('generic SectionHeader v3 must not own a CTA part');
if (root?.parts?.Accroche?.visibleWhen?.prop !== 'afficherAccroche') {
  failures.push('the eyebrow visibility must be driven only by afficherAccroche');
}
const leftRule = (root?.stylesWhen ?? []).find((rule: Record<string, any>) =>
  rule.prop === 'alignement' && rule.equals === 'gauche',
);
if (root?.declared?.['text-align'] !== 'center') {
  failures.push('Alignement=Centre must produce the explicit centred text rule');
}
if (leftRule?.styles?.['align-items'] !== 'start' || leftRule?.styles?.['text-align'] !== 'left') {
  failures.push('Alignement=Gauche must produce the explicit left/start text rule');
}

if (failures.length) {
  console.error('✘ section-header-v3-api:');
  for (const failure of failures) console.error(`   - ${failure}`);
  process.exit(1);
}
console.log('section-header-v3-api ok: four-prop generic API, dark 40/50 title, centre/gauche Figma alignment only');
