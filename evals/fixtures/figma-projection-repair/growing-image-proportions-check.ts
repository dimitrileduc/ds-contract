/** 021 / US1 — a growing image keeps its master aspect when a card narrows. */
import vm from 'node:vm';
import { createFigmaEngine } from '../../../core/emit-figma-script.js';
import { ContractSchema } from '../../../packages/schema/src/contract-schema.js';
import { createFigmaMock } from '../../../scripts/plugin-engine-mock-figma.mjs';

const tokenTree = {
  primitives: { size: { fixture: { image: { $value: '418px', $type: 'dimension' } } } },
  semantic: {}, light: {}, dark: {}, brands: { default: {} },
};

const contract = ContractSchema.parse({
  id: 'ds.growing-image-proportions-fixture',
  name: 'GrowingImageProportionsFixture',
  version: '1.0.0',
  description: 'A category-card image grows in its master and scales proportionally in narrower instances.',
  props: [],
  anatomy: { root: {
    layout: { display: 'flex', direction: 'column', align: 'stretch' },
    literals: { width: '743px' },
    parts: {
      categorieImage: {
        element: 'img',
        layout: { grow: true },
        tokens: { height: '{size.fixture.image}' },
        declared: { 'object-fit': 'cover' },
      },
      fixedWitness: {
        element: 'img',
        tokens: { height: '{size.fixture.image}' },
        declared: { 'object-fit': 'cover' },
      },
    },
  } },
  states: [],
  semantics: { element: 'div' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'fixture', export: 'Fixture' } },
});

const engine = createFigmaEngine({ tokens: tokenTree as never, icons: new Map() });
const script = engine.buildComponentScript(contract, new Map([[contract.id, contract]]));
const { figma, root } = createFigmaMock();
const ctx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
await vm.runInContext(`(async () => {\n${engine.buildTokensScript(null)}\n})()`, ctx, { timeout: 120_000 });
await vm.runInContext(`(async () => {\n${script}\n})()`, ctx, { timeout: 120_000 });

const find = (name: string): any => {
  let result: any = null;
  const walk = (node: any) => {
    if (!result && node.name === name) result = node;
    for (const child of node.children ?? []) walk(child);
  };
  walk(root);
  return result;
};

const image = find('categorieImage');
const witness = find('fixedWitness');
if (!image || image.constrainProportions !== true) {
  throw new Error('a growing fixed-basis image must enable Figma constrainProportions');
}
if (!witness || witness.constrainProportions !== false) {
  throw new Error('a non-growing fixed-height image must remain independently resizable');
}

console.log('✔ growing image proportions: category image scales with width; fixed-height witness does not');
