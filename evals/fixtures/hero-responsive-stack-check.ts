/** Hero pilot — the photo, mandatory navigation veil and content keep one
 * explicit stack, while parent-owned widths project as Fill without turning
 * the neighbouring Button into Fill. This fixture uses the real contracts
 * and generated CSS so it guards both target surfaces. */
import { readFileSync } from 'node:fs';
import { createFigmaEngine, type NodeSpec } from '../../core/emit-figma-script.js';
import { ContractSchema } from '../../packages/schema/src/contract-schema.js';

const readJson = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));
const names = ['button', 'section-header', 'hero'];
const contracts = names.map((name) =>
  ContractSchema.parse(readJson(`contracts/${name}.contract.json`)),
);
const byId = new Map(contracts.map((contract) => [contract.id, contract]));
const hero = byId.get('ds.hero');
const sectionHeader = byId.get('ds.section-header');
if (!hero || !sectionHeader) throw new Error('Hero pilot contracts are missing');

const engine = createFigmaEngine({
  tokens: {
    primitives: readJson('tokens/primitives.tokens.json'),
    semantic: readJson('tokens/semantic.tokens.json'),
    light: readJson('tokens/modes/semantic.light.tokens.json'),
    dark: {},
    brands: { default: readJson('tokens/modes/brand.default.tokens.json') },
  } as never,
  icons: new Map(),
});

const heroRoot = engine.compileComponentData(hero, byId).variants[0]?.spec;
const sectionRoot = engine.compileComponentData(sectionHeader, byId).variants[0]?.spec;
if (!heroRoot || !sectionRoot) throw new Error('Hero pilot emitted no Figma spec');

const failures: string[] = [];
const children = heroRoot.children ?? [];
const child = (name: string): NodeSpec | undefined => children.find((node) => node.name === name);
const background = child('Background');
const veil = child('VoileNavigation');
const content = child('blocTexte');
const titles = content?.children?.find((node) => node.name === 'Titres');
const sectionInstance = titles?.children?.find((node) => node.name === 'SectionHeader');
const wrapper = titles?.children?.find((node) => node.name === 'wrapper');
const subtitle = wrapper?.children?.find((node) => node.name === 'sousTitre');
const button = wrapper?.children?.find((node) => node.name === 'Bouton');

if (!heroRoot.fillWidth || heroRoot.lits?.width !== 1728) {
  failures.push('Hero root must be Fill with a 1728 canvas reference width');
}
if (heroRoot.lits?.fillClear !== true || heroRoot.gradient) {
  failures.push('Hero root must explicitly clear legacy fills; its gradient belongs to VoileNavigation');
}
if (!sectionRoot.fillWidth || sectionRoot.lits?.width !== 1550) {
  failures.push('SectionHeader root must be Fill with a 1550 canvas reference width');
}
if (children.slice(0, 3).map((node) => node.name).join(' > ') !== 'Background > VoileNavigation > blocTexte') {
  failures.push('Hero stack order must be Background > VoileNavigation > blocTexte');
}
if (background?.zIndex !== 0 || veil?.zIndex !== 1 || content?.zIndex !== 2) {
  failures.push('Hero stack levels must remain 0 / 1 / 2');
}
if (!background?.insetOverlay || !veil?.insetOverlay) {
  failures.push('Background and VoileNavigation must cover the complete Hero');
}
if (veil?.gradient?.stops?.[0]?.position !== 0.75 || veil.gradient.stops[1]?.color.a !== 0.5) {
  failures.push('VoileNavigation must keep the historical 75% transparent → 50% black gradient');
}
if (!content?.fillWidth || !titles?.fillWidth || !sectionInstance?.fillWidth || !wrapper?.fillWidth || !subtitle?.fillWidth) {
  failures.push('Hero content width chain must remain Fill');
}
if (button?.fillWidth) failures.push('Hero Button must remain Hug, never Fill');

const heroCss = readFileSync('src/components/Hero/Hero.module.css', 'utf8');
const sectionCss = readFileSync('src/components/SectionHeader/SectionHeader.module.css', 'utf8');
const buttonCss = readFileSync('src/components/Button/Button.module.css', 'utf8');
if (!/\.root \{[\s\S]*?width: 100%;/.test(heroCss) || /width: 1728px;/.test(heroCss)) {
  failures.push('Generated Hero CSS must be fluid and must not restore width: 1728px');
}
if (!/\.VoileNavigation[\s\S]*?z-index: 1;/.test(heroCss)) {
  failures.push('Generated CSS lost the explicit navigation veil');
}
if (!/\.root \{[\s\S]*?width: 100%;/.test(sectionCss) || /width: var\(--size-section-header-root\)/.test(sectionCss)) {
  failures.push('Generated SectionHeader CSS must be fluid and must not restore the old fixed token width');
}
if (!/\.root \{[\s\S]*?white-space: nowrap;/.test(buttonCss)) {
  failures.push('Generated Button CSS must keep Hug labels on one line');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('✔ Hero responsive stack: master reference widths, Fill chain, mandatory veil and Hug Button are governed');
