/** Contract -> every target: bounded equal-track Grid, gaps and Fill children. */
import vm from 'node:vm';
import { emitFigmaScript, createFigmaEngine } from '../../../core/emit-figma-script.js';
import { emitHtml } from '../../../core/emit-html.js';
import { emitReactInline } from '../../../core/emit-react-inline.js';
import { emitReact } from '../../../core/emit-react.js';
import { ContractSchema } from '../../../packages/schema/src/contract-schema.js';
import { shadowCss } from '../../../packages/emitter-web-components/src/emit-wc.js';
import { createFigmaMock } from '../../../scripts/plugin-engine-mock-figma.mjs';

const tokens = {
  primitives: {
    fx: {
      gap: { $type: 'dimension', $value: '32px' },
      row: { $type: 'dimension', $value: '24px' },
    },
  },
  semantic: {}, light: {}, dark: {}, brands: { default: {} },
};

const boxes = Object.fromEntries(
  Array.from({ length: 5 }, (_, index) => [
    `box${index + 1}`,
    {
      layout: { width: 'fill', ...(index === 0 ? { aspectRatio: 1 } : {}) },
      literals: { height: '40px' },
    },
  ]),
);

const contract = ContractSchema.parse({
  id: 'ds.bounded-grid-fixture',
  name: 'BoundedGridFixture',
  version: '1.0.0',
  description: 'Four equal columns, two independent gaps and parent-owned children.',
  semantics: { element: 'div' },
  props: [],
  states: [],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'column' },
      parts: {
        grid: {
          layout: { display: 'grid', columns: 4, width: 'fill' },
          tokens: { gap: '{fx.gap}', 'row-gap': '{fx.row}' },
          parts: boxes,
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'fixture', export: 'BoundedGridFixture' },
  },
});

for (const invalidLayout of [
  { display: 'grid' },
  { display: 'grid', columns: 4, wrap: true },
  { display: 'flex', columns: 4 },
]) {
  const raw = structuredClone(contract) as any;
  raw.anatomy.root.parts.grid.layout = invalidLayout;
  if (ContractSchema.safeParse(raw).success) {
    throw new Error(`bounded grid schema accepted ${JSON.stringify(invalidLayout)}`);
  }
}

const byId = new Map([[contract.id, contract]]);
const tokenInventory = new Set(['fx.gap', 'fx.row']);
const cssCtx = { tokens: tokenInventory, icons: new Map<string, string>(), contracts: byId };
const expectedTrack = 'grid-template-columns: repeat(4, minmax(0, 1fr))';
for (const [surface, css] of [
  ['react', emitReact(contract, cssCtx).css],
  ['html', emitHtml(contract, cssCtx).css],
  ['web-component', shadowCss(contract)],
]) {
  if (!css.includes('display: grid') || !css.includes(expectedTrack)) {
    throw new Error(`${surface} did not emit the bounded four-column grid`);
  }
}
const inline = emitReactInline(contract, {
  tokens: tokens as never,
  icons: new Map(),
  contracts: byId,
  mode: 'light',
}).tsx;
if (!inline.includes('"gridTemplateColumns": "repeat(4, minmax(0, 1fr))"')) {
  throw new Error('react-inline did not emit the bounded four-column grid');
}

const engine = createFigmaEngine({ tokens: tokens as never, icons: new Map() });
const data = engine.compileComponentData(contract, byId);
const gridSpec = data.variants[0]?.spec.children?.find((node) => node.name === 'grid');
if (gridSpec?.layout?.mode !== 'GRID' || gridSpec.layout.columns !== 4) {
  throw new Error(`Figma compile did not preserve GRID/4: ${JSON.stringify(gridSpec?.layout)}`);
}
if (gridSpec.bindings?.gridColumnGap !== 'fx/gap' || gridSpec.bindings?.gridRowGap !== 'fx/row') {
  throw new Error(`Figma compile lost independent grid gaps: ${JSON.stringify(gridSpec.bindings)}`);
}
if (!gridSpec.children?.every((child) => child.fillWidth)) {
  throw new Error('Figma compile lost Fill on one or more grid children');
}

const script = emitFigmaScript(contract, { tokens: tokens as never, icons: new Map(), contracts: byId });
for (const marker of ["l.mode === 'GRID'", 'gridColumnCount = columns', 'gridColumnSizes = Array.from', "gridItemsPositioning = 'ROW_AUTO_FLOW'"]) {
  if (!script.includes(marker)) throw new Error(`Figma runtime is missing ${marker}`);
}

const { figma, root } = createFigmaMock();
const ctx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
await vm.runInContext(`(async () => {\n${engine.buildTokensScript(null)}\n})()`, ctx, { timeout: 120_000 });
await vm.runInContext(`(async () => {\n${script}\n})()`, ctx, { timeout: 120_000 });

const master = root.findOne((node: any) => node.type === 'COMPONENT' && node.name === contract.name) as any;
const grid = master?.findOne((node: any) => node.name === 'grid') as any;
if (!grid || grid.layoutMode !== 'GRID' || grid.gridColumnCount !== 4 || grid.gridRowCount !== 2) {
  throw new Error(`mock runtime did not build GRID 4x2: ${JSON.stringify({ mode: grid?.layoutMode, columns: grid?.gridColumnCount, rows: grid?.gridRowCount })}`);
}
if (grid.gridColumnSizes.length !== 4 || !grid.gridColumnSizes.every((track: any) => track.type === 'FLEX' && track.value === 1) ||
  grid.gridRowSizes.length !== 2 || !grid.gridRowSizes.every((track: any) => track.type === 'HUG' && track.value === undefined)) {
  throw new Error(`mock runtime did not build native equal/HUG tracks: ${JSON.stringify({ columns: grid.gridColumnSizes, rows: grid.gridRowSizes })}`);
}
if (!grid.boundVariables.gridColumnGap || !grid.boundVariables.gridRowGap) {
  throw new Error('mock runtime did not bind both native grid gap fields');
}
if (!grid.children.every((child: any) => child.layoutSizingHorizontal === 'FILL')) {
  throw new Error('mock runtime did not apply Fill to every grid child');
}
if (grid.children[0]?.constrainProportions !== true) {
  throw new Error('mock runtime did not lock the declared child aspect ratio');
}

const masterId = master.id;
await vm.runInContext(`(async () => {\n${script}\n})()`, ctx, { timeout: 120_000 });
const masters = root.findAll((node: any) => node.type === 'COMPONENT' && node.name === contract.name) as any[];
if (masters.length !== 1 || masters[0].id !== masterId) {
  throw new Error('second bounded-grid application was not an identity-preserving no-op');
}

console.log('✔ bounded grid: schema, React, inline, HTML, WC, native Figma, Fill, ratio and second apply are governed');
