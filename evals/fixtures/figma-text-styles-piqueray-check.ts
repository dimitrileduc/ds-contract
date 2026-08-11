/**
 * Piqueray typography must compile its 18 semantic recipes to the existing
 * Figma Text Styles. Plain Hero/HeroVideo text rides an exact named style;
 * governed rich text keeps native character ranges and no whole-node style.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ContractSchema, type Contract } from '../../scripts/contract-schema.js';
import { createFigmaEngine, type FigmaIconComponent, type NodeSpec } from '../../core/emit-figma-script.js';
import { createFigmaMock } from '../../scripts/plugin-engine-mock-figma.mjs';

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
      icons.set(name.replace(/\.svg$/, ''), readFileSync(path.join(ROOT, 'assets', directory, name), 'utf8'));
    }
  }
}
const iconRegistry = readJson('contracts/icons.registry.json') as {
  icons: Array<{ name: string; asset: string; figma: { componentName: string; key: string; nodeId: string } }>;
};
const iconComponents = new Map<string, FigmaIconComponent>(
  iconRegistry.icons.map((icon) => [icon.name, {
    asset: icon.asset,
    componentName: icon.figma.componentName,
    key: icon.figma.key,
    nodeId: icon.figma.nodeId,
  }]),
);
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
  fail(`18-style catalogue differs from the independent historical fixture:\nactual=${JSON.stringify(actualCatalogue)}\nexpected=${JSON.stringify(expectedCatalogue)}`);
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
if (heroVideoTitle.length !== 1 || heroVideoTitle[0].textStyle !== 'Titre Hero vidéo') {
  fail(`HeroVideo.Accroche must ride Titre Hero vidéo, got ${JSON.stringify(heroVideoTitle)}`);
}

const sectionAccroches = named('ds.section-header', 'Accroche');
if (sectionAccroches.length === 0 || sectionAccroches.some((node) => node.textStyle !== 'Accroche')) {
  fail('every plain SectionHeader.Accroche must ride Accroche');
}
const sectionTitles = named('ds.section-header', 'Titre');
if (sectionTitles.length === 0 || sectionTitles.some((node) => node.textStyle !== undefined)) {
  fail('SectionHeader.Titre is rich-text and must not receive a whole-node Text Style');
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

const seedHistoricalStyles = (figma: any, omitMarkerFor?: string) => {
  for (const recipe of expectedStyles as any[]) {
    const style = figma.createTextStyle();
    style.name = recipe.name;
    style.fontName = { family: recipe.fontFamily, style: recipe.fontStyle };
    style.fontSize = recipe.fontSize;
    style.lineHeight = recipe.lineHeight === undefined
      ? { unit: 'AUTO' }
      : { unit: 'PIXELS', value: recipe.lineHeight };
    style.letterSpacing = recipe.letterSpacing;
    style.textCase = recipe.textCase;
    if (recipe.name !== omitMarkerFor) {
      style.setSharedPluginData('ds_contracts', 'textStyleToken', recipe.tokenPath);
    }
  }
};
const executeTokens = (figma: any) =>
  Function('figma', `return (async () => {\n${tokensScript}\n})()`)(figma);

// Once a reviewed marker-only migration has attached identities, 01-tokens
// preserves all 18 objects and its second run performs no creation.
const brownfield = createFigmaMock();
seedHistoricalStyles(brownfield.figma);
const idsBefore = (await brownfield.figma.getLocalTextStylesAsync()).map((style: any) => style.id);
const firstApply = await executeTokens(brownfield.figma);
if (firstApply.textStyles.created !== 0) {
  fail(`marked historical styles must be kept in place, got ${JSON.stringify(firstApply.textStyles)}`);
}
const secondApply = await executeTokens(brownfield.figma);
const after = await brownfield.figma.getLocalTextStylesAsync();
if (secondApply.textStyles.created !== 0 || after.length !== 18) {
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
if (linked.length !== 62 || custom.length !== 11 || rich.length !== 21) {
  fail(`global gate expected 62 linked / 11 historical custom / 21 rich; got ${linked.length} / ${custom.length} / ${rich.length}. Custom:\n${custom.map(({ key }) => key).join('\n')}`);
}
const customOwners = custom.reduce<Record<string, number>>((counts, { key }) => {
  const owner = key.split('#')[0];
  counts[owner] = (counts[owner] ?? 0) + 1;
  return counts;
}, {});
const expectedCustomOwners = { 'ds.carte': 1, 'ds.google-reviews': 5, 'ds.review-card': 5 };
if (JSON.stringify(customOwners) !== JSON.stringify(expectedCustomOwners)) {
  fail(`historical custom allowlist drifted: ${JSON.stringify(customOwners)}`);
}

console.log('figma-text-styles-piqueray ok: 18 independent recipes; strict marker preflight; 62 linked / 11 historical custom / 21 rich; second token apply preserves ids');
