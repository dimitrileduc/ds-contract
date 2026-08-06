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
 * Four cases:
 *   A — paint sits on the img-part node itself → survives, matched BY POSITION
 *       (spec 017: the pairing key moved from the layer NAME to the path of
 *       indices — a rename is not a loss, two homonyms do not merge, §VIII);
 *   B — paint sits on the component ROOT (hero's real shape: the photo is a
 *       root fill while the contract models a Background child) → REHOUSED
 *       onto the next free img accueil, in document order. Spec 017 narrowed
 *       this: the arbitrary "first unclaimed paint" fallback is gone, replaced
 *       by an ORDER-PRESERVING bijection that cannot produce an interversion,
 *       and every such move is reported in `rehebergees`. Deleting the fallback
 *       outright would have lost hero's photo on every regeneration — the exact
 *       damage class 017 exists to prevent;
 *   C — fresh create with no pre-existing paint → the gray placeholder stays
 *       (current doctrine, unchanged);
 *   D — spec 017, the INSTANCE axis: a paint sitting on a PAGE INSTANCE's
 *       mirrored node survives too. 255 of the 349 live photos on the client
 *       file are instance overrides — the three quarters the master-only
 *       rescue never saw. Extended here rather than duplicated into a second
 *       case; the adversarial depth (loss, interversion, no-accueil,
 *       determinism) lives in photos-instance-overrides-preserved-check.ts.
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
// CASE D (spec 017) — the paint sits on a PAGE INSTANCE, not on the master.
// ---------------------------------------------------------------------------
await runScript(emit(mk('fixture.imgkeep-d', 'ImgKeepD', '8px')));
const compD = marker('fixture.imgkeep-d');
if (!compD) fail('D: create did not produce a marked component');
const instD = (compD as any).createInstance();
(figma as any).currentPage.appendChild(instD);
const photoInstD = findByName(instD, 'Photo');
if (!photoInstD) {
  fail('D: the page instance does not mirror its master\'s subtree — an instance with no children has nothing to override, so the instance-override loss class is unreachable headless (FR-002a)');
}
photoInstD.fills = [{ type: 'IMAGE', imageHash: 'HASH-D-INST', scaleMode: 'FILL', visible: true }];
// the master keeps its own, distinct photo — the two must not be confused
findByName(compD, 'Photo').fills = [{ type: 'IMAGE', imageHash: 'HASH-D-MASTER', scaleMode: 'FILL', visible: true }];

await runScript(emit(mk('fixture.imgkeep-d', 'ImgKeepD', '12px')));
const keptDInst = imagePaints(findByName(instD, 'Photo') ?? {});
const keptDMaster = imagePaints(findByName(marker('fixture.imgkeep-d'), 'Photo'));
if (keptDInst.length !== 1 || keptDInst[0].imageHash !== 'HASH-D-INST') {
  fail(
    `D: the PAGE INSTANCE's own IMAGE override did not survive the amend — got ${JSON.stringify(keptDInst)}. ` +
      'Figma propagates the teardown to instances; the harvest must descend to the rebuilt master\'s instances (spec 017, FR-001/FR-002).',
  );
}
if (keptDMaster.length !== 1 || keptDMaster[0].imageHash !== 'HASH-D-MASTER') {
  fail(`D: the master's own photo was confused with the instance's — got ${JSON.stringify(keptDMaster)}`);
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
  'img-paint-preserved-on-amend ok: an out-of-contract IMAGE paint survives both amend shapes (matched BY POSITION on the img node, order-rehoused from the root), survives on a PAGE INSTANCE without being confused with the master\'s own photo, the fresh-create placeholder is unchanged, and the amend report names every preserved paint',
);
