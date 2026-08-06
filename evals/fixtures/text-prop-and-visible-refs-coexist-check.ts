// text-prop-and-visible-refs-coexist-check.ts — une part qui est À LA FOIS
// content-prop (TEXT) et à visibilité pilotée (BOOLEAN) doit porter LES DEUX
// références de propriété — le runtime les posait en deux passes qui
// s'ÉCRASAIENT (016).
//
// LE DÉFAUT MESURÉ SUR LE CANVAS RÉEL (SectionHeader.Accroche, 2026-08-06) :
//   l'instance 2094:2468 portait l'override `Accroche: "Nos avis Google
//   vérifiés"` dans ses componentProperties — et RENDAIT le défaut du master.
//   Relevé vif : le TEXT Titre avait `ref: characters` ; le TEXT Accroche
//   n'avait QUE `ref: visible`. La passe registry.texts posait
//   { characters }, puis la passe registry.visibles réassignait { visible } —
//   un assignment complet, pas un merge : la seconde référence tuait la
//   première, et l'override texte de CHAQUE instance en aval n'atteignait
//   plus rien.
//
// CE QUE LA FIXTURE EXIGE : construit dans le mock, le node de la part
//   Accroche porte componentPropertyReferences avec `characters` ET `visible`.

import vm from 'node:vm';
import { createFigmaEngine } from '../../core/emit-figma-script.js';
import { ContractSchema } from '../../packages/schema/src/contract-schema.js';
import { createFigmaMock } from '../../scripts/plugin-engine-mock-figma.mjs';

const tokenTree = { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } };

const contrat = ContractSchema.parse({
  id: 'ds.fx-refs',
  name: 'FxRefs',
  version: '1.0.0',
  description: 'Fixture 016 : une part content-prop ET visible-toggled garde ses deux references.',
  props: [
    { name: 'accroche', type: 'text', default: 'Accroche par défaut', bindings: { figma: { kind: 'TEXT', property: 'Accroche' }, code: { prop: 'accroche' } } },
    { name: 'accroche2', type: 'boolean', default: true, bindings: { figma: { kind: 'BOOLEAN', property: 'Accroche2' }, code: { prop: 'accroche2' } } },
  ],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'column', align: 'start' },
      parts: {
        Accroche: { content: { prop: 'accroche' }, visibleWhen: { prop: 'accroche2' } },
        Titre: { text: 'Titre fixe' },
      },
    },
  },
  states: [],
  semantics: { element: 'div' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/FxRefs', export: 'FxRefs' } },
});

const engine = createFigmaEngine({ tokens: tokenTree as never, icons: new Map() });
const script = engine.buildComponentScript(contrat, new Map([[contrat.id, contrat]]));

const echecs: string[] = [];
const { figma, root } = createFigmaMock();
const ctx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
try {
  await vm.runInContext(`(async () => {\n${engine.buildTokensScript(null)}\n})()`, ctx, { timeout: 120_000 });
  await vm.runInContext(`(async () => {\n${script}\n})()`, ctx, { timeout: 120_000 });
} catch (e) {
  echecs.push('le script émis ne s\'exécute pas dans le mock : ' + String((e as Error).message).slice(0, 200));
}
{
  const hits: any[] = [];
  const walk = (n: any) => { if (n.name === 'Accroche' && n.type === 'TEXT') hits.push(n); (n.children || []).forEach(walk); };
  walk(root);
  if (!hits.length) echecs.push('aucun TEXT Accroche construit dans le mock');
  for (const n of hits) {
    const refs = n.componentPropertyReferences || {};
    const cles = Object.keys(refs).sort().join(',');
    if (!refs.characters || !refs.visible) {
      echecs.push(`Accroche componentPropertyReferences={${cles}} — attendu characters ET visible : la référence manquante rend les overrides d'instance muets (le défaut 2094:2468, l'accroche "Nos avis Google vérifiés" jamais rendue)`);
      break;
    }
  }
}

if (echecs.length) {
  console.error('✘ text-prop-and-visible-refs-coexist:');
  for (const e of echecs) console.error('   - ' + e);
  process.exit(1);
}
console.log('text-prop-and-visible-refs-coexist ok : characters et visible coexistent sur la part double — les overrides d\'instance atteignent le rendu');
