/**
 * Piqueray typography must compile its semantic recipes (18 historical + the 4
 * responsive styles of spec 031, marker-migrated on the canvas on 2026-09-02) to the existing
 * Figma Text Styles. Plain Hero/HeroVideo text rides an exact named style;
 * governed rich text keeps native character ranges and no whole-node style.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ContractSchema, type Contract } from '../../scripts/contract-schema.js';
import { createFigmaEngine, iconComponentsFromRegistry, type IconRegistryEntry, type NodeSpec } from '../../core/emit-figma-script.js';
import { createFigmaMock, seedMarkedTextStyles } from '../../scripts/plugin-engine-mock-figma.mjs';

const ROOT = process.cwd();
const readJson = (relative: string) => JSON.parse(readFileSync(path.join(ROOT, relative), 'utf8'));
const fail = (message: string): never => {
  console.error(`✘ figma-text-styles-piqueray: ${message}`);
  process.exit(1);
};

const brandNames = readdirSync(path.join(ROOT, 'tokens', 'modes'))
  .filter((name) => /^brand\.[a-z][a-z0-9-]*\.tokens\.json$/.test(name))
  .map((name) => name.replace(/^brand\.|\.tokens\.json$/g, ''));
const icons = new Map<string, string>();
for (const directory of ['icons', 'vectors']) {
  for (const name of readdirSync(path.join(ROOT, 'assets', directory))) {
    if (name.endsWith('.svg')) {
      // .trim() matches scripts/generate-figma.ts — the pipeline this fixture guards.
      icons.set(name.replace(/\.svg$/, ''), readFileSync(path.join(ROOT, 'assets', directory, name), 'utf8').trim());
    }
  }
}
const iconRegistry = readJson('contracts/icons.registry.json') as { icons: IconRegistryEntry[] };
const iconComponents = iconComponentsFromRegistry(iconRegistry);
const engine = createFigmaEngine({
  tokens: {
    primitives: readJson('tokens/primitives.tokens.json'),
    semantic: readJson('tokens/semantic.tokens.json'),
    light: readJson('tokens/modes/semantic.light.tokens.json'),
    dark: existsSync(path.join(ROOT, 'tokens/modes/semantic.dark.tokens.json'))
      ? readJson('tokens/modes/semantic.dark.tokens.json')
      : {},
    brands: Object.fromEntries(brandNames.map((name) => [name, readJson(`tokens/modes/brand.${name}.tokens.json`)])),
  },
  icons,
  iconComponents,
});

const contracts = readdirSync(path.join(ROOT, 'contracts'))
  .filter((name) => name.endsWith('.contract.json'))
  .map((name) => ContractSchema.parse(readJson(`contracts/${name}`)));
const byId = new Map(contracts.map((contract) => [contract.id, contract]));

const tokensScript = engine.buildTokensScript(null);
const encoded = /const TEXT_STYLES = (\[.*?\]);/s.exec(tokensScript)?.[1];
if (!encoded) fail('01-tokens does not expose TEXT_STYLES');
const styles = JSON.parse(encoded) as Array<Record<string, unknown>>;
const expectedStyles = readJson('evals/fixtures/figma-text-styles-piqueray.expected.json') as Array<Record<string, unknown>>;
const normalizeFontStyle = (value: unknown) => String(value).replace(/\s+/g, '').toLowerCase();
const comparableStyle = (style: Record<string, any>) => ({
  name: style.name,
  tokenPath: style.tokenPath,
  fontFamily: style.fontFamily,
  fontSize: style.fontSize,
  fontStyle: normalizeFontStyle(style.fontStyle),
  ...(style.lineHeight === undefined ? {} : { lineHeight: style.lineHeight }),
  letterSpacing: style.letterSpacing,
  textCase: style.textCase,
});
const actualCatalogue = styles.map(comparableStyle).sort((a, b) => a.name.localeCompare(b.name));
const expectedCatalogue = expectedStyles.map(comparableStyle).sort((a, b) => a.name.localeCompare(b.name));
if (JSON.stringify(actualCatalogue) !== JSON.stringify(expectedCatalogue)) {
  fail(`${expectedStyles.length}-style catalogue differs from the independent historical fixture:\nactual=${JSON.stringify(actualCatalogue)}\nexpected=${JSON.stringify(expectedCatalogue)}`);
}
if (styles.some((style) => style.requiresExistingMarker !== true)) {
  fail('every Piqueray style must require its pre-existing historical identity marker');
}

const findContract = (id: string): Contract => {
  const contract = byId.get(id);
  if (!contract) fail(`missing contract ${id}`);
  return contract;
};
const nodes = (id: string): NodeSpec[] => {
  const data = engine.compileComponentData(findContract(id), byId);
  const out: NodeSpec[] = [];
  const walk = (node: NodeSpec) => {
    out.push(node);
    for (const child of node.children ?? []) walk(child);
  };
  for (const variant of data.variants) walk(variant.spec);
  return out;
};
const named = (id: string, name: string) => nodes(id).filter((node) => node.name === name);

const heroVideoTitle = named('ds.hero-video', 'Accroche');
// 2026-09-02 (Odoo hero pilot): ds.hero-video 2.0.0 rides the RESPONSIVE style H1
// (typography.h1.*, spec 031), no longer the fixed « Titre Hero vidéo » 44/48.
// Four presentation variants since 2.0.0 ⇒ four Accroche nodes, every one on H1.
if (heroVideoTitle.length !== 4 || heroVideoTitle.some((node: any) => node.textStyle !== 'H1')) {
  fail(`HeroVideo.Accroche must ride H1, got ${JSON.stringify(heroVideoTitle)}`);
}

const sectionAccroches = named('ds.section-header', 'Accroche');
if (sectionAccroches.length === 0 || sectionAccroches.some((node) => node.textStyle !== 'Accroche')) {
  fail('every plain SectionHeader.Accroche must ride Accroche');
}
// 2026-09-02 (owner rule, Odoo hero pilot): a rich prop WITHOUT a strong segment
// in its default (break-only rich text) keeps its named style; only bold
// ranges drop the whole-node style. SectionHeader.titre defaults to one plain
// segment ⇒ it rides its style again.
const sectionTitles = named('ds.section-header', 'Titre');
if (sectionTitles.length === 0 || sectionTitles.some((node) => node.textStyle === undefined)) {
  fail(`SectionHeader.Titre is break-only rich text and must ride a named Text Style, got ${JSON.stringify(sectionTitles.map((n: any) => n.textStyle))}`);
}
const heroSubtitles = named('ds.hero', 'sousTitre');
if (heroSubtitles.length !== 1 || heroSubtitles[0].textStyle !== undefined || !heroSubtitles[0].richTextRanges?.length) {
  fail('Hero.sousTitre must keep native rich ranges without a whole-node Text Style');
}

if (tokensScript.includes('adoptExisting') || tokensScript.includes('adoptedStyles')) {
  fail('01-tokens still contains name-based brownfield adoption');
}
if (tokensScript.indexOf('Missing historical Text Style marker') > tokensScript.indexOf('createVariableCollection')) {
  fail('historical Text Style preflight must run before any variable creation');
}

const seedHistoricalStyles = (figma: any, omitMarkerFor?: string) =>
  seedMarkedTextStyles(figma, expectedStyles as any[], { omitMarkerFor });
const executeTokens = (figma: any) =>
  Function('figma', `return (async () => {\n${tokensScript}\n})()`)(figma);

// Once a reviewed marker-only migration has attached identities, 01-tokens
// preserves every seeded object and its second run performs no creation.
const brownfield = createFigmaMock();
seedHistoricalStyles(brownfield.figma);
const idsBefore = (await brownfield.figma.getLocalTextStylesAsync()).map((style: any) => style.id);
const firstApply = await executeTokens(brownfield.figma);
if (firstApply.textStyles.created !== 0) {
  fail(`marked historical styles must be kept in place, got ${JSON.stringify(firstApply.textStyles)}`);
}
const secondApply = await executeTokens(brownfield.figma);
const after = await brownfield.figma.getLocalTextStylesAsync();
if (secondApply.textStyles.created !== 0 || after.length !== expectedStyles.length) {
  fail(`second token apply must be a true style no-op, got ${JSON.stringify(secondApply.textStyles)} / ${after.length}`);
}
if (JSON.stringify(after.map((style: any) => style.id)) !== JSON.stringify(idsBefore)) {
  fail('historical Text Style ids changed during adoption');
}

// Without the reviewed marker migration, refuse before creating a variable.
const unmarked = createFigmaMock();
seedHistoricalStyles(unmarked.figma, 'Titre Hero');
let refused = '';
try {
  await executeTokens(unmarked.figma);
} catch (error) {
  refused = String(error);
}
if (!refused.includes('Missing historical Text Style marker') || !refused.includes('Titre Hero')) {
  fail(`an unmarked historical style was not refused: ${refused}`);
}
if ((await unmarked.figma.variables.getLocalVariableCollectionsAsync()).length !== 0) {
  fail('token variables changed before the historical Text Style preflight refused the run');
}

// Global restoration gate, measured over every compiled contract variant.
const textNodes: Array<{ key: string; node: NodeSpec; rich: boolean }> = [];
for (const contract of contracts) {
  const richProps = new Set(
    contract.props
      .filter((prop) => prop.type === 'rich-text' && prop.bindings.figma.kind === 'TEXT')
      .map((prop) => prop.bindings.figma.property),
  );
  const data = engine.compileComponentData(contract, byId);
  data.variants.forEach((variant, variantIndex) => {
    const walk = (node: NodeSpec, parents: string[]) => {
      const here = [...parents, node.name ?? node.type];
      if (node.type === 'text') {
        textNodes.push({
          key: `${contract.id}#${variantIndex}/${here.join('/')}`,
          node,
          rich: Boolean(node.contentProp && richProps.has(node.contentProp)),
        });
      }
      for (const child of node.children ?? []) walk(child, here);
    };
    walk(variant.spec, []);
  });
}
const rich = textNodes.filter((record) => record.rich);
const plain = textNodes.filter((record) => !record.rich);
const linked = plain.filter(({ node }) => Boolean(node.textStyle));
const custom = plain.filter(({ node }) => !node.textStyle);
// 2026-08-18 : 11 -> 15. ds.review-card est devenu un set de deux variantes
// (Avatar=Initiale | Avatar=Photo), donc quatre de ses textes — auteur, date,
// temoignage, lireLaSuite — sont comptés une fois par variante. Le cinquième
// (initialeTexte) n'existe que dans la variante Initiale. Aucun texte nouveau,
// aucun texte réparé : ces cinq-là restent des DÉFAUTS (typo brute, sans Text
// Style gouverné), relevés par l'audit du run
// specs/component-repairs/review-card/run-001/audit.json. Ce compte les
// dénombre, il ne les absout pas.
// 2026-09-02 (pilote Odoo hero) : 51 -> 54 linked. ds.hero-video 2.0.0 a quatre
// variantes Presentation : son titre (sur H1) est compté une fois par variante.
// 2026-08-20 (spec 023) : 62 -> 65 linked, 15 -> 16 custom. Les deux contrats
// gouvernés carte-categorie + categories-principales ajoutent quatre textes.
// TROIS rident un Text Style gouverné (Titre 2 majuscules 40/Regular/UPPER pour
// le titre superposé, Texte 18/Regular pour les deux corps) — d'où +3 linked. Le
// QUATRIÈME, `TitreCategorie` du style empilé (32px MEDIUM majuscules), n'a pas
// de recette : c'est EXACTEMENT le défaut que ds.carte porte déjà sur son propre
// TitreCategorie (le set n'a pas de « Titre 3 medium majuscules » ; « Titre 3
// majuscules » est Regular). ds.carte-categorie reprend ce texte au pixel depuis
// la source (§VIII : on ne corrige pas un défaut de source en code), donc il
// hérite du défaut — allowlisté comme ds.carte, jamais absous. Nettoyage de
// source (Medium -> Regular) = décision owner différée (Gate C).
//
// 2026-08-23 (spec 026) : 65 -> 51 linked et 21 -> 11 rich. Les quatre routes
// spécialisées possèdent maintenant leurs titres directs ; le jeu générique ne
// décline plus ses variantes Hero/Moyen/Compact ni le CTA. Ces comptes attestent
// donc l'API v3 locale, sans prétendre que le master Figma a déjà reçu la
// mutation soumise au GO owner.
// 2026-09-02 (vague 031, six composants portés) : 54 -> 73 linked, 16 -> 42 custom,
// 11 -> 10 rich. Trois mouvements, tous mesurés :
//  · +19 liés — les titres des sets 031 montent des styles DÉCLARÉS (H1 du hero,
//    H2 de SAV / Presentation / Reassurances, H4 des cartes de réassurance, Titre
//    carte des cartes catégorie), un nœud par variante ;
//  · +26 propres — les textes qui montent un groupe de jetons RESPONSIVE sans style
//    Figma déclaré : typography.overline (sur-titre de Reassurances, 12 nœuds),
//    typography.body (paragraphe de SAV, 4), typography.card-desc (description de
//    carte catégorie), plus les titres et textes de Presentation (8). Ces groupes
//    n'ont pas d'extension figmaTextStyle : la synchronisation pose leurs valeurs à
//    plat au lieu de lier un style. État nommé, à trancher — déclarer ces trois
//    groupes comme styles ferait retomber le compte ;
//  · -1 riche — le titre de Reassurances redevient du texte simple : le set 031 ne
//    dessine ni gras ni saut de ligne (règle owner du 2026-09-02).
if (linked.length !== 73 || custom.length !== 42 || rich.length !== 10) {
  fail(`global gate expected 73 linked / 42 historical custom / 10 rich; got ${linked.length} / ${custom.length} / ${rich.length}. Custom:\n${custom.map(({ key }) => key).join('\n')}`);
}
const customOwners = custom.reduce<Record<string, number>>((counts, { key }) => {
  const owner = key.split('#')[0];
  counts[owner] = (counts[owner] ?? 0) + 1;
  return counts;
}, {});
// Ordre = ordre de rencontre des nœuds custom (readdir des contrats) : "carte-categorie"
// trie AVANT "carte" ('-' 0x2D < '.' 0x2E), donc ds.carte-categorie précède ds.carte.
// 2026-09-02 (vague 031) : la liste suit les compteurs ci-dessus. Les nouveaux
// venus montent tous un groupe de jetons RESPONSIVE sans style Figma déclaré
// (overline, body, card-desc) — état nommé, pas une régression silencieuse.
const expectedCustomOwners = { 'ds.carte-categorie': 2, 'ds.carte': 2, 'ds.google-reviews': 5, 'ds.presentation': 8, 'ds.reassurances': 12, 'ds.review-card': 9, 'ds.sav': 4 };
if (JSON.stringify(customOwners) !== JSON.stringify(expectedCustomOwners)) {
  fail(`historical custom allowlist drifted: ${JSON.stringify(customOwners)}`);
}

console.log(`figma-text-styles-piqueray ok: ${expectedStyles.length} independent recipes; strict marker preflight; 73 linked / 42 historical custom / 10 rich; second token apply preserves ids`);
