// composed-child-slot-content-check.ts — une part `component` peut dire ce que le
// SLOT de l'enfant composé porte (`component.slots`), et l'émetteur figma pose ce
// contenu par la prop INSTANCE_SWAP de l'enfant — jamais par un override manuel (016).
//
// LE DÉFAUT MESURÉ SUR LE CANVAS RÉEL (Formulaire, 2026-08-06) : l'origine du master
//   porte, dans row5, un Field dont le slot contient un TEXTAREA (« Message »,
//   h=161 = label 25 + gap 8 + textarea 128). Le contrat ne sait dire que
//   `component: {id: 'ds.field', props: {label: 'Message'}}` — aucun canal pour le
//   contenu du slot. Le swap d'origine était un override d'instance DANS un master
//   gouverné : chaque amend du parent le reperd (famille D7 — INSTANCE_SWAP perdu,
//   TEXT survit). Mesuré : row5 h=81 (l'input par défaut), page contactez-nous −58.
//   Un fait que le contrat ne porte pas est un fait que la régénération efface.
//
// CE QUE LA FIXTURE EXIGE (rouge tant que le canal n'existe pas) :
//   1. le schéma accepte `component.slots` (strictObject : aujourd'hui c'est un
//      parse REFUSÉ — le rouge commence ici) ;
//   2. le script émis porte le swap résolu par MARQUEUR (depSlots: property +
//      depId + props mappées via les bindings de l'enfant slotté) ;
//   3. exécuté dans le mock : l'instance composée porte la prop INSTANCE_SWAP
//      du slot avec l'ID du composant slotté (la valeur que le vrai Figma
//      enregistre — le mock rend les instances creuses, le niveau componentProperties
//      est exactement ce qu'il sait porter fidèlement) ;
//   4. témoin : une composition SANS `slots` ne pose aucune prop de swap.

import vm from 'node:vm';
import { createFigmaEngine } from '../../core/emit-figma-script.js';
import { ContractSchema } from '../../packages/schema/src/contract-schema.js';
import { createFigmaMock } from '../../scripts/plugin-engine-mock-figma.mjs';

const tokenTree = { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } };

const optionA = ContractSchema.parse({
  id: 'ds.fx-slot-a',
  name: 'FxSlotA',
  version: '1.0.0',
  description: 'Fixture 016 : le contenu par défaut du slot.',
  props: [],
  anatomy: { root: { layout: { display: 'inline-flex', direction: 'row', align: 'center' }, parts: { T: { text: 'A' } } } },
  states: [],
  semantics: { element: 'span' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/FxSlotA', export: 'FxSlotA' } },
});

const optionB = ContractSchema.parse({
  id: 'ds.fx-slot-b',
  name: 'FxSlotB',
  version: '1.0.0',
  description: 'Fixture 016 : le contenu demandé par le parent (le textarea du Formulaire).',
  props: [
    { name: 'valeur', type: 'text', default: 'B', bindings: { figma: { kind: 'TEXT', property: 'Valeur' }, code: { prop: 'valeur' } } },
  ],
  anatomy: { root: { layout: { display: 'inline-flex', direction: 'row', align: 'center' }, parts: { T: { content: { prop: 'valeur' } } } } },
  states: [],
  semantics: { element: 'span' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/FxSlotB', export: 'FxSlotB' } },
});

// L'hôte : un slot `children` (defaultContent = A) — le rôle du Field.
const hote = ContractSchema.parse({
  id: 'ds.fx-hote',
  name: 'FxHote',
  version: '1.0.0',
  description: 'Fixture 016 : le composant a slot (le Field).',
  props: [],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'column', align: 'start' },
      parts: {
        Zone: {
          layout: { display: 'flex', direction: 'column', align: 'stretch' },
          slot: { name: 'children', accepts: ['ds.fx-slot-a', 'ds.fx-slot-b'], acceptsMode: 'restrict', defaultContent: [{ id: 'ds.fx-slot-a' }] },
        },
      },
    },
  },
  states: [],
  semantics: { element: 'div' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/FxHote', export: 'FxHote' } },
});

// Le parent : compose l'hôte en demandant B dans le slot — le geste row5/textarea.
const parent = ContractSchema.parse({
  id: 'ds.fx-slot-parent',
  name: 'FxSlotParent',
  version: '1.0.0',
  description: 'Fixture 016 : le parent dit ce que le slot du compose porte.',
  props: [],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'column', align: 'start' },
      parts: {
        Sujet: { component: { id: 'ds.fx-hote', slots: { children: { id: 'ds.fx-slot-b', props: { valeur: 'Écrivez votre message ici...' } } } } },
        Temoin: { component: { id: 'ds.fx-hote' } },
      },
    },
  },
  states: [],
  semantics: { element: 'div' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/FxSlotParent', export: 'FxSlotParent' } },
});

const byId = new Map([[optionA.id, optionA], [optionB.id, optionB], [hote.id, hote], [parent.id, parent]]);
const engine = createFigmaEngine({ tokens: tokenTree as never, icons: new Map() });
const scriptParent = engine.buildComponentScript(parent, byId);

const echecs: string[] = [];

// 2. le SPEC émis porte le swap : property du slot + identité par marqueur + props mappées.
if (!/"depSlots":\s*\[/.test(scriptParent)) {
  echecs.push('le script émis du parent ne porte AUCUN depSlots — le contenu du slot du composé reste inexprimable, le canvas régénéré retombe sur le defaultContent (row5 h=81 au lieu de 161)');
} else {
  if (!/"depSlots":[\s\S]{0,400}?"depId":\s*"ds\.fx-slot-b"/.test(scriptParent)) {
    echecs.push('depSlots ne porte pas depId "ds.fx-slot-b" — la résolution doit rider le marqueur, jamais le nom de calque (§VIII)');
  }
  if (!/"depSlots":[\s\S]{0,400}?"Valeur":\s*"Écrivez votre message ici\.\.\."/.test(scriptParent)) {
    echecs.push('les props du slotté ne sont pas mappées via les bindings de l\'enfant (attendu la clé figma "Valeur")');
  }
}

// 3. exécution dans le mock : ordre deps réel (A, B, hôte, parent — tokens d'abord).
const { figma, root } = createFigmaMock();
const ctx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
const run = (code: string) => vm.runInContext(`(async () => {\n${code}\n})()`, ctx, { timeout: 120_000 });
try {
  await run(engine.buildTokensScript(null));
  await run(engine.buildComponentScript(optionA, byId));
  await run(engine.buildComponentScript(optionB, byId));
  await run(engine.buildComponentScript(hote, byId));
  await run(scriptParent);
} catch (e) {
  echecs.push('les scripts émis ne s\'exécutent pas dans le mock : ' + String((e as Error).message).slice(0, 200));
}
{
  // l'ID que le swap doit porter : le composant construit pour FxSlotB.
  let idB: string | null = null;
  const walkB = (n: any) => {
    if ((n.type === 'COMPONENT' || n.type === 'COMPONENT_SET') && n.name === 'FxSlotB' && !idB) idB = n.type === 'COMPONENT_SET' ? (n.children?.[0]?.id ?? n.id) : n.id;
    (n.children || []).forEach(walkB);
  };
  walkB(root);
  const sujets: any[] = [];
  const temoins: any[] = [];
  const walk = (n: any) => {
    if (n.type === 'INSTANCE' && n.name === 'Sujet') sujets.push(n);
    if (n.type === 'INSTANCE' && n.name === 'Temoin') temoins.push(n);
    (n.children || []).forEach(walk);
  };
  walk(root);
  if (!sujets.length) echecs.push('aucune instance Sujet construite dans le mock');
  for (const s of sujets) {
    const cle = Object.keys(s.componentProperties ?? {}).find((k) => k === 'Children' || k.startsWith('Children#'));
    const val = cle ? s.componentProperties[cle]?.value : undefined;
    if (!cle || !idB || val !== idB) {
      echecs.push(`l'instance composée ne porte pas le swap du slot : Children=${JSON.stringify(val)} attendu id de FxSlotB (${idB}) — c'est l'override perdu de row5`);
      break;
    }
  }
  for (const t of temoins) {
    const cle = Object.keys(t.componentProperties ?? {}).find((k) => k === 'Children' || k.startsWith('Children#'));
    // le TÉMOIN garde le défaut du set (posé par addComponentProperty) — ce qui est
    // interdit, c'est qu'un swap EXPLICITE apparaisse sans `slots` au contrat.
    if (cle && t._depSlotsApplied) {
      echecs.push('le témoin (sans `slots`) a reçu un swap explicite — le canal déborde de sa cible');
      break;
    }
  }
}

if (echecs.length) {
  console.error('✘ composed-child-slot-content:');
  for (const e of echecs) console.error('   - ' + e);
  process.exit(1);
}
console.log('composed-child-slot-content ok : le contrat porte le contenu du slot du composé, le script le pose par INSTANCE_SWAP (marqueur), le témoin reste au défaut');
