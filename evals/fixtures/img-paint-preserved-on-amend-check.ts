/**
 * A real IMAGE paint on the canvas must SURVIVE an in-place amend.
 *
 * Doctrine (FIGMA-CAPABILITY-MATRIX row 91 + 2026-07-26 addendum): the real
 * photo pixel is an OUT-OF-CONTRACT Figma override — the contract carries the
 * img part and its runtime URL prop, never the bytes. Both amend paths
 * (amendSet / amendComponent) rebuild every child from the spec, so without a
 * harvest/restore pass the client's photos are destroyed and replaced by the
 * #D9D9D9 placeholder wash on every re-sync — regeneration would be
 * DESTRUCTIVE on all 9 image-bearing Piqueray components.
 *
 * Three cases:
 *   A — paint sits on the img-part node itself → survives, matched BY NAME;
 *   B — paint sits on the component ROOT (hero's real shape: the photo is a
 *       root fill while the contract models a Background child) → REHOUSED
 *       onto the first unclaimed img part, in document order;
 *   C — fresh create with no pre-existing paint → the gray placeholder stays
 *       (current doctrine, unchanged).
 * Every preserved/rehoused/unplaced paint is REPORTED by the amend — never
 * silent.
 */
import vm from 'node:vm';
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitFigmaScript } from '../../core/emit-figma-script.js';
// @ts-expect-error — the mock ships as untyped .mjs (the plugin-check harness imports it the same way)
import { createFigmaMock } from '../../scripts/plugin-engine-mock-figma.mjs';

const fail = (message: string): never => {
  console.error(`✘ img-paint-preserved-on-amend: ${message}`);
  process.exit(1);
};

const tokenTree = { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } };

const mk = (id: string, name: string, gap: string) =>
  ContractSchema.parse({
    id, name, version: '1.0.0', status: 'draft',
    description: 'Section with a photo plane (runtime URL prop) and text content.',
    semantics: { element: 'div' },
    props: [
      { name: 'photoUrl', type: 'text', default: '', bindings: { figma: { kind: 'NONE' }, code: { prop: 'photoUrl' } } },
      { name: 'photoAlt', type: 'text', default: '', bindings: { figma: { kind: 'NONE' }, code: { prop: 'photoAlt' } } },
    ],
    states: [], events: [],
    anatomy: {
      root: {
        layout: { display: 'flex', direction: 'column' },
        literals: { gap },
        parts: {
          Photo: {
            element: 'img',
            attrs: { src: '{photoUrl}', alt: '{photoAlt}' },
            declared: { 'object-fit': 'cover' },
            literals: { width: '120px', height: '80px' },
          },
          Contenu: { text: 'Bonjour' },
        },
      },
    },
    anchors: {
      figma: { fileKey: null, componentSetKey: null },
      code: { importPath: `src/components/${name}`, export: name },
    },
  });

const { figma, root } = createFigmaMock();
const scriptCtx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
const runScript = (code: string): Promise<unknown> =>
  vm.runInContext(`(async () => {\n${code}\n})()`, scriptCtx, { timeout: 120_000 });

const emit = (contract: ReturnType<typeof mk>) =>
  emitFigmaScript(contract, { tokens: tokenTree, icons: new Map(), contracts: new Map([[contract.id, contract]]) });

const marker = (contractId: string) =>
  root.findOne(
    (n: any) =>
      (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') &&
      n.getSharedPluginData('ds_contracts', 'contractId') === contractId,
  );
const findByName = (node: any, name: string): any => {
  if (node.name === name) return node;
  for (const ch of node.children ?? []) {
    const hit = findByName(ch, name);
    if (hit) return hit;
  }
  return null;
};
const imagePaints = (node: any): any[] =>
  (Array.isArray(node.fills) ? node.fills : []).filter((f: any) => f && f.type === 'IMAGE');
const isGrayPlaceholder = (node: any): boolean =>
  (Array.isArray(node.fills) ? node.fills : []).some(
    (f: any) => f && f.type === 'SOLID' && Math.round(f.color.r * 255) === 217,
  );

// ---------------------------------------------------------------------------
// CASE A — the paint lives on the img node itself (name match).
// ---------------------------------------------------------------------------
await runScript(emit(mk('fixture.imgkeep-a', 'ImgKeepA', '8px')));
const compA = marker('fixture.imgkeep-a');
if (!compA) fail('A: create did not produce a marked component');
const photoA = findByName(compA, 'Photo');
if (!photoA) fail('A: no "Photo" node after create');
// CASE C (piggybacked): fresh create shows the doctrine placeholder.
if (!isGrayPlaceholder(photoA)) fail('C: fresh create must keep the #D9D9D9 placeholder (doctrine unchanged)');

// The client pastes the real photo on the canvas — an out-of-contract override.
photoA.fills = [{ type: 'IMAGE', imageHash: 'HASH-A', scaleMode: 'FILL', visible: true }];

const reportA = (await runScript(emit(mk('fixture.imgkeep-a', 'ImgKeepA', '12px')))) as any;
const photoA2 = findByName(marker('fixture.imgkeep-a'), 'Photo');
if (!photoA2) fail('A: no "Photo" node after amend');
const keptA = imagePaints(photoA2);
if (keptA.length !== 1 || keptA[0].imageHash !== 'HASH-A') {
  fail(
    `A: the img node's real IMAGE paint did not survive the amend — got ${JSON.stringify(photoA2.fills)} ` +
      '(the rebuild replaced the photo with the placeholder wash; the out-of-contract override must be harvested and restored)',
  );
}

// ---------------------------------------------------------------------------
// CASE B — the paint lives on the component ROOT (hero's shape) → rehoused.
// ---------------------------------------------------------------------------
await runScript(emit(mk('fixture.imgkeep-b', 'ImgKeepB', '8px')));
const compB = marker('fixture.imgkeep-b');
if (!compB) fail('B: create did not produce a marked component');
compB.fills = [{ type: 'IMAGE', imageHash: 'HASH-B', scaleMode: 'FILL', visible: true }];

await runScript(emit(mk('fixture.imgkeep-b', 'ImgKeepB', '12px')));
const photoB = findByName(marker('fixture.imgkeep-b'), 'Photo');
if (!photoB) fail('B: no "Photo" node after amend');
const keptB = imagePaints(photoB);
if (keptB.length !== 1 || keptB[0].imageHash !== 'HASH-B') {
  fail(
    `B: the ROOT's IMAGE paint was not rehoused onto the img part — got ${JSON.stringify(photoB.fills)} ` +
      "(hero's photo is a root fill while the contract models a Background child; order-fallback must place it)",
  );
}

// ---------------------------------------------------------------------------
// The amend REPORTS what it preserved — honesty, never silent.
// ---------------------------------------------------------------------------
const resultsA = reportA && reportA.results ? reportA.results : Array.isArray(reportA) ? reportA : [];
const lineA = JSON.stringify(resultsA);
if (!lineA.includes('preservedImages') && !lineA.includes('HASH-A')) {
  fail(`A: the amend report does not name the preserved paint — got ${lineA.slice(0, 200)}`);
}

console.log(
  'img-paint-preserved-on-amend ok: an out-of-contract IMAGE paint survives both amend shapes (name-matched on the img node, rehoused from the root), the fresh-create placeholder is unchanged, and the amend report names every preserved paint',
);
