// dep-resolved-by-marker-check.ts — une DÉPENDANCE de composition se résout par son
// MARQUEUR d'identité (ds_contracts/contractId), jamais par son nom de calque (016).
//
// LE DÉFAUT MESURÉ SUR LE CANVAS RÉEL (2026-08-05) : le master du bouton s'appelle
//   « Bouton » (nom français posé par le designer) et porte le marqueur ds.button.
//   Le script principal le retrouve par MARQUEUR (doctrine écrite dans le runtime :
//   « Identity is the ds_contracts/contractId marker, NOT the set name »). Mais
//   findComponentByName — le résolveur des DÉPENDANCES — cherche par nom littéral :
//   les 7 composants qui composent ds.button (formulaire, header, footer, faq,
//   section-header, devis, carousel-controls) échouent tous sur
//   « Dependency component not found in file: Button (sync it first) ».
//   Un renommage de calque ne doit jamais casser la composition (§VIII).
//
// LA FIXTURE : un contrat Enfant + un Parent qui le compose. Le set de l'Enfant est
//   construit puis RENOMMÉ (le geste du designer). Le script du Parent doit encore
//   le trouver — rouge aujourd'hui, vert quand la résolution passe par le marqueur.

import vm from 'node:vm';
import { createFigmaEngine } from '../../core/emit-figma-script.js';
import { ContractSchema } from '../../packages/schema/src/contract-schema.js';
import { createFigmaMock } from '../../scripts/plugin-engine-mock-figma.mjs';

const tokenTree = { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } };

const enfant = ContractSchema.parse({
  id: 'ds.fx-enfant',
  name: 'FxEnfant',
  version: '1.0.0',
  description: 'Fixture 016 : le composant compose.',
  props: [],
  anatomy: { root: { layout: { display: 'inline-flex', direction: 'row', align: 'center' }, parts: { T: { text: 'ok' } } } },
  states: [],
  semantics: { element: 'span' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/FxEnfant', export: 'FxEnfant' } },
});

const parent = ContractSchema.parse({
  id: 'ds.fx-parent',
  name: 'FxParent',
  version: '1.0.0',
  description: 'Fixture 016 : compose FxEnfant — la résolution doit passer par le marqueur.',
  props: [],
  anatomy: { root: { layout: { display: 'flex', direction: 'column', align: 'start' }, parts: { Slot: { component: { id: 'ds.fx-enfant' } } } } },
  states: [],
  semantics: { element: 'div' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/FxParent', export: 'FxParent' } },
});

const byId = new Map([[enfant.id, enfant], [parent.id, parent]]);
const engine = createFigmaEngine({ tokens: tokenTree as never, icons: new Map() });
const scriptEnfant = engine.buildComponentScript(enfant, byId);
const scriptParent = engine.buildComponentScript(parent, byId);

const { figma, root } = createFigmaMock();
const ctx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
const run = (code: string) => vm.runInContext(`(async () => {\n${code}\n})()`, ctx, { timeout: 120_000 });

const echecs: string[] = [];
try {
  await run(engine.buildTokensScript(null));
  await run(scriptEnfant);
  // LE GESTE DU DESIGNER : renommage du set — l'identité (marqueur) ne change pas.
  const trouve: any[] = [];
  const walk = (n: any) => { if (n.name === 'FxEnfant') trouve.push(n); (n.children || []).forEach(walk); };
  walk(root);
  if (!trouve.length) throw new Error('set FxEnfant non construit');
  for (const n of trouve) n.name = 'EnfantRenommeParLeDesigner';
  await run(scriptParent);
  // le Parent doit contenir une INSTANCE de l'enfant
  let instances = 0;
  const walk2 = (n: any) => { if (n.type === 'INSTANCE') instances++; (n.children || []).forEach(walk2); };
  walk2(root);
  if (instances === 0) echecs.push('le Parent a été construit mais sans instance de l’Enfant');
} catch (e) {
  echecs.push('la composition casse sur un simple renommage de calque : ' + String((e as Error).message).slice(0, 160));
}

if (echecs.length) {
  console.error('✘ dep-resolved-by-marker:');
  for (const e of echecs) console.error('   - ' + e);
  process.exit(1);
}
console.log('dep-resolved-by-marker ok : la dépendance se résout par son marqueur — le renommage de calque ne casse rien');
