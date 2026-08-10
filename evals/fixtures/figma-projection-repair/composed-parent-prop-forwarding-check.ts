/** 021 / US2 — an exact {parentProp} mapping must remain live through a composed instance. */
import vm from 'node:vm';
import { createFigmaEngine } from '../../../core/emit-figma-script.js';
import { ContractSchema } from '../../../packages/schema/src/contract-schema.js';
import { createFigmaMock } from '../../../scripts/plugin-engine-mock-figma.mjs';

const child = ContractSchema.parse({
  id: 'ds.forwarding-child', name: 'ForwardingChild', version: '1.0.0',
  description: 'Child exposing one native TEXT property.',
  props: [{
    name: 'titre', type: 'rich-text', default: [{ text: 'Child default' }],
    bindings: { figma: { kind: 'TEXT', property: 'Titre enfant' }, code: { prop: 'titre' } },
  }],
  anatomy: { root: { parts: { VisibleTitle: { content: { prop: 'titre', marks: { strong: '{font.weight.bold}' } } } } } },
  states: [], semantics: { element: 'div' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'fixture', export: 'Child' } },
});

const parent = ContractSchema.parse({
  id: 'ds.forwarding-parent', name: 'ForwardingParent', version: '1.0.0',
  description: 'Parent forwarding one property while keeping a literal witness static.',
  props: [{
    name: 'titre', type: 'rich-text', default: [{ text: 'Parent default' }],
    bindings: { figma: { kind: 'TEXT', property: 'Titre parent' }, code: { prop: 'titre' } },
  }],
  anatomy: { root: { parts: {
    MappedHeader: { component: { id: child.id, props: { titre: '{titre}' } } },
    LiteralHeader: { component: { id: child.id, props: { titre: [{ text: 'Literal witness' }] } } },
  } } },
  states: [], semantics: { element: 'div' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'fixture', export: 'Parent' } },
});

const contracts = new Map([[child.id, child], [parent.id, parent]]);
const engine = createFigmaEngine({
  tokens: {
    primitives: { font: { weight: { bold: { $value: 700, $type: 'number' } } } },
    semantic: {}, light: {}, dark: {}, brands: { default: {} },
  } as never,
  icons: new Map(),
});
const parentScript = engine.buildComponentScript(parent, contracts);
if (!/"depPropRefs"/.test(parentScript)) {
  throw new Error('the emitted parent plan carries no exact parent→child property reference');
}

const { figma, root } = createFigmaMock();
const ctx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
await vm.runInContext(`(async () => {\n${engine.buildTokensScript(null)}\n})()`, ctx, { timeout: 120_000 });
await vm.runInContext(`(async () => {\n${engine.buildComponentScript(child, contracts)}\n})()`, ctx, { timeout: 120_000 });
await vm.runInContext(`(async () => {\n${parentScript}\n})()`, ctx, { timeout: 120_000 });

const parentMaster = root.findOne((node: any) =>
  node.type === 'COMPONENT' && node.getSharedPluginData('ds_contracts', 'contractId') === parent.id,
);
if (!parentMaster) throw new Error('parent master was not generated');
const parentKey = Object.keys(parentMaster.componentPropertyDefinitions).find((key) => key.startsWith('Titre parent#'));
if (parentKey) throw new Error('an inert duplicate parent TEXT property was generated instead of native nested exposure');

const mappedMaster = parentMaster.findOne((node: any) => node.name === 'MappedHeader');
const literalMaster = parentMaster.findOne((node: any) => node.name === 'LiteralHeader');
if (mappedMaster?.isExposedInstance !== true) throw new Error('mapped child instance is not exposed natively');
if (literalMaster?.isExposedInstance === true) throw new Error('literal witness instance was incorrectly exposed');

const instance = parentMaster.createInstance();
const beforeSize = { width: instance.width, height: instance.height };
const mappedInstance = instance.findOne((node: any) => node.name === 'MappedHeader');
const literalInstance = instance.findOne((node: any) => node.name === 'LiteralHeader');
const childKey = Object.keys(mappedInstance?.componentProperties ?? {}).find((key) => key.startsWith('Titre enfant#'));
if (!childKey) throw new Error('exposed child TEXT property did not keep its suffixed identity');
if (!instance.exposedInstances?.includes(mappedInstance)) throw new Error('mapped child is absent from exposedInstances');
mappedInstance.setProperties({ [childKey]: 'Live parent value' });
const mappedText = mappedInstance?.findOne((node: any) => node.type === 'TEXT');
const literalText = literalInstance?.findOne((node: any) => node.type === 'TEXT');
if (mappedText?.characters !== 'Live parent value') {
  throw new Error(`parent setProperties did not reach visible child text; got ${JSON.stringify(mappedText?.characters)}`);
}
if (literalText?.characters !== 'Literal witness') {
  throw new Error(`literal witness changed unexpectedly; got ${JSON.stringify(literalText?.characters)}`);
}
if (instance.width !== beforeSize.width || instance.height !== beforeSize.height) {
  throw new Error('property forwarding changed the parent geometry');
}

console.log('✔ composed parent property forwarding: exposed suffixed child key drives visible text; literal witness and geometry stay unchanged');
