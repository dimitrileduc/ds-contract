/** 021 / US1 — every declared absolute plane leaves auto-layout generically. */
import vm from 'node:vm';
import { createFigmaEngine } from '../../../core/emit-figma-script.js';
import { ContractSchema } from '../../../packages/schema/src/contract-schema.js';
import { createFigmaMock } from '../../../scripts/plugin-engine-mock-figma.mjs';

const contract = ContractSchema.parse({
  id: 'ds.absolute-lowering-fixture', name: 'AbsoluteLoweringFixture', version: '1.0.0',
  description: 'US1 fixture: absolute planes must not participate in an auto-layout flow.',
  props: [],
  anatomy: { root: {
    layout: { display: 'flex', direction: 'row', justify: 'center', align: 'start' },
    literals: { width: '200px', height: '100px' },
    parts: {
      ImagePlane: { element: 'img', declared: { position: 'absolute', 'object-fit': 'cover' } },
      SavRow: {
        layout: { direction: 'row' }, literals: { width: '80px', height: '40px' },
        declared: { position: 'absolute', 'align-self': 'flex-end' },
        parts: {
          NestedPlane: { literals: { width: '80px', height: '40px' }, declared: { position: 'absolute', 'align-self': 'flex-start' } },
          FlowWitness: { literals: { width: '20px', height: '20px' } },
        },
      },
      RootWitness: { literals: { width: '20px', height: '20px' } },
    },
  } },
  states: [], semantics: { element: 'div' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'fixture', export: 'Fixture' } },
});

const engine = createFigmaEngine({ tokens: { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } } as never, icons: new Map() });
const script = engine.buildComponentScript(contract, new Map([[contract.id, contract]]));
const errors: string[] = [];
const encoded = /const COMPONENTS = ([\s\S]+?);\nconst ROW_H/.exec(script)?.[1];
if (!encoded) throw new Error('emitted script does not expose COMPONENTS');
const specs: Record<string, any> = {};
const indexSpec = (spec: any) => { specs[spec.name] = spec; (spec.children ?? []).forEach(indexSpec); };
for (const component of JSON.parse(encoded)) for (const variant of component.variants) indexSpec(variant.spec);

if (specs.ImagePlane?.insetOverlay !== true) {
  errors.push('ImagePlane declared position:absolute must become a full-parent out-of-flow plane');
}
if (specs.SavRow?.absolute?.h !== 'CENTER' || specs.SavRow?.absolute?.v !== 'MAX') {
  errors.push('SavRow must use its parent static alignment (center / flex-end) after leaving flow');
}
if (!specs.NestedPlane?.absolute) {
  errors.push('nested declared position:absolute plane is still in flow');
}
if (specs.RootWitness?.absolute || specs.RootWitness?.insetOverlay) {
  errors.push('in-flow witness was incorrectly made absolute');
}

const { figma, root } = createFigmaMock();
try {
  const ctx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
  await vm.runInContext(`(async () => {\n${engine.buildTokensScript(null)}\n})()`, ctx, { timeout: 120_000 });
  await vm.runInContext(`(async () => {\n${script}\n})()`, ctx, { timeout: 120_000 });
  const nodes: Record<string, any> = {};
  const walk = (node: any) => { nodes[node.name] = node; (node.children ?? []).forEach(walk); };
  walk(root);
  if (nodes.ImagePlane?.layoutPositioning !== 'ABSOLUTE' || nodes.ImagePlane?.width !== 200 || nodes.ImagePlane?.height !== 100) {
    errors.push('ImagePlane did not become a parent-sized ABSOLUTE plane after append');
  }
  if (nodes.SavRow?.layoutPositioning !== 'ABSOLUTE' || nodes.SavRow?.x !== 60 || nodes.SavRow?.y !== 60) {
    errors.push(`SavRow static position is ${nodes.SavRow?.x},${nodes.SavRow?.y}; expected 60,60`);
  }
  if (nodes.NestedPlane?.layoutPositioning !== 'ABSOLUTE' || nodes.FlowWitness?.layoutPositioning !== 'AUTO') {
    errors.push('nested absolute plane or in-flow witness did not keep its intended layout mode');
  }
} catch (error) {
  errors.push(`emitted absolute script did not execute: ${String(error)}`);
}

if (errors.length) throw new Error(errors.join('\n'));
console.log('✔ absolute lowering: image plane, static alignment, nested SAV plane and flow witness are distinct');
