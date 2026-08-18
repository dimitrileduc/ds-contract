/** 021 / US2 — only an INSTANCE_SWAP-driven glyph becomes a governed icon instance. */
import vm from 'node:vm';
import { createFigmaEngine, type FigmaIconComponent } from '../../../core/emit-figma-script.js';
import { ContractSchema } from '../../../packages/schema/src/contract-schema.js';
import { createFigmaMock } from '../../../scripts/plugin-engine-mock-figma.mjs';

const button = ContractSchema.parse({
  id: 'ds.swap-button', name: 'SwapButton', version: '1.0.0',
  description: 'Button with one governed swap glyph and one static SVG witness.',
  props: [{
    name: 'glyph', type: { enum: ['chevron-left', 'chevron-right'] }, default: 'chevron-left',
    bindings: {
      figma: { kind: 'INSTANCE_SWAP', property: 'Glyph', values: { 'chevron-left': 'ChevronLeft', 'chevron-right': 'ChevronRight' } },
      code: { prop: 'glyph' },
    },
  }],
  anatomy: { root: { parts: {
    DynamicGlyph: { icon: { asset: '{glyph}', size: 20 } },
    StaticGlyph: { icon: { asset: 'static-dot', size: 20 } },
  } } },
  states: [], semantics: { element: 'button' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'fixture', export: 'Button' } },
});

const controls = ContractSchema.parse({
  id: 'ds.swap-controls', name: 'SwapControls', version: '1.0.0',
  description: 'Two consumers requesting visibly opposed governed glyphs.', props: [],
  anatomy: { root: { parts: {
    Previous: { component: { id: button.id, props: { glyph: 'chevron-left' } } },
    Next: { component: { id: button.id, props: { glyph: 'chevron-right' } } },
  } } },
  states: [], semantics: { element: 'nav' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'fixture', export: 'Controls' } },
});

const { figma, root, firstPage } = createFigmaMock();
const left = figma.createComponent(); left.name = 'ChevronLeft'; firstPage.appendChild(left);
const right = figma.createComponent(); right.name = 'ChevronRight'; firstPage.appendChild(right);
const iconComponents = new Map<string, FigmaIconComponent>([
  ['chevron-left', { asset: 'chevron-left', componentName: 'ChevronLeft', key: left.key, nodeId: left.id }],
  ['chevron-right', { asset: 'chevron-right', componentName: 'ChevronRight', key: right.key, nodeId: right.id }],
]);
const engine = createFigmaEngine({
  tokens: { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } } as never,
  icons: new Map([
    ['chevron-left', '<svg viewBox="0 0 20 20"><path d="M12 4 6 10l6 6"/></svg>'],
    ['chevron-right', '<svg viewBox="0 0 20 20"><path d="m8 4 6 6-6 6"/></svg>'],
    ['static-dot', '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="4"/></svg>'],
  ]),
  iconComponents,
});
const contracts = new Map([[button.id, button], [controls.id, controls]]);
const buttonScript = engine.buildComponentScript(button, contracts);
if (!/"type"\s*:\s*"icon-instance"/.test(buttonScript)) throw new Error('INSTANCE_SWAP glyph was still compiled as a static SVG');

const ctx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
await vm.runInContext(`(async () => {\n${engine.buildTokensScript(null)}\n})()`, ctx, { timeout: 120_000 });
await vm.runInContext(`(async () => {\n${buttonScript}\n})()`, ctx, { timeout: 120_000 });
await vm.runInContext(`(async () => {\n${engine.buildComponentScript(controls, contracts)}\n})()`, ctx, { timeout: 120_000 });

const buttonMaster = root.findOne((node: any) =>
  node.type === 'COMPONENT' && node.getSharedPluginData('ds_contracts', 'contractId') === button.id,
);
const glyphKey = Object.keys(buttonMaster?.componentPropertyDefinitions ?? {}).find((key) => key.startsWith('Glyph#'));
const glyphDef = glyphKey ? buttonMaster.componentPropertyDefinitions[glyphKey] : null;
if (!glyphKey || glyphDef?.type !== 'INSTANCE_SWAP') throw new Error('governed glyph has no native INSTANCE_SWAP property');
const preferredKeys = (glyphDef.preferredValues ?? []).map((value: any) => value.key).sort();
if (JSON.stringify(preferredKeys) !== JSON.stringify([left.key, right.key].sort())) {
  throw new Error(`preferred values do not come from the governed registry: ${JSON.stringify(preferredKeys)}`);
}
const dynamicMaster = buttonMaster.findOne((node: any) => node.name === 'DynamicGlyph');
const staticMaster = buttonMaster.findOne((node: any) => node.name === 'StaticGlyph');
if (dynamicMaster?.type !== 'INSTANCE' || dynamicMaster.componentPropertyReferences?.mainComponent !== glyphKey) {
  throw new Error('dynamic glyph is not a live instance linked to the swap property');
}
if (staticMaster?.type === 'INSTANCE') throw new Error('static glyph witness was incorrectly converted to an instance');

const controlsMaster = root.findOne((node: any) =>
  node.type === 'COMPONENT' && node.getSharedPluginData('ds_contracts', 'contractId') === controls.id,
);
const previousGlyph = controlsMaster?.findOne((node: any) => node.name === 'Previous')?.findOne((node: any) => node.name === 'DynamicGlyph');
const nextGlyph = controlsMaster?.findOne((node: any) => node.name === 'Next')?.findOne((node: any) => node.name === 'DynamicGlyph');
if (previousGlyph?._mainComponent?.id !== left.id || nextGlyph?._mainComponent?.id !== right.id) {
  throw new Error(`opposed controls are not visibly swapped: previous=${previousGlyph?._mainComponent?.id}, next=${nextGlyph?._mainComponent?.id}`);
}

console.log('✔ icon instance swap: dynamic glyph is governed, preferred registry values are exact, controls point left/right, static SVG stays static');
