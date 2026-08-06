// zero-height-line-part-check.ts — une part à hauteur NULLE portant un trait
// per-side est une LIGNE, pas une boîte : sa géométrie doit rester ~0 (016).
//
// LE DÉFAUT MESURÉ SUR LE CANVAS RÉEL (Footer.Separator, 2026-08-06) : l'origine
//   est une LINE 1550×0 (le trait est un habillage, contribution au flux : 0).
//   Notre frame émis portait height {space.0} + border-top-width 1px, et Figma
//   CLAMPE la hauteur d'un frame au total de ses strokes horizontaux quand
//   strokeAlign est INSIDE (la doctrine border-box de 015 — juste pour les
//   boîtes) : mesuré h=2 avec les poids uniformes hérités, h=1 au mieux. CENTER
//   (l'align du trait d'une LINE) ne clampe pas : h≈0, trait à cheval, comme
//   l'origine. Chaque page portait +2 px invisibles.
//
// CE QUE LA FIXTURE EXIGE : height {space.0} + border-top-width → exécuté dans
//   le mock (qui reproduit le clamp INSIDE mesuré, dans resize ET à la pose du
//   poids), le node fait < 0.5 de haut. Témoin : une part à hauteur non nulle
//   avec le même trait garde l'align INSIDE (border-box) et sa hauteur.

import vm from 'node:vm';
import { createFigmaEngine } from '../../core/emit-figma-script.js';
import { ContractSchema } from '../../packages/schema/src/contract-schema.js';
import { createFigmaMock } from '../../scripts/plugin-engine-mock-figma.mjs';

const tokenTree = {
  primitives: {
    space: { '0': { $value: '0px', $type: 'dimension' } },
    size: { fx: { barre: { $value: '8px', $type: 'dimension' } } },
    color: { blanc: { $value: '#ffffff', $type: 'color' } },
  },
  semantic: {}, light: {}, dark: {}, brands: { default: {} },
};

const contrat = ContractSchema.parse({
  id: 'ds.fx-ligne',
  name: 'FxLigne',
  version: '1.0.0',
  description: 'Fixture 016 : une part hauteur 0 + trait per-side reste une ligne de geometrie nulle.',
  props: [],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'column', align: 'start' },
      parts: {
        Separateur: {
          tokens: { 'border-color': '{color.blanc}', height: '{space.0}' },
          literals: { 'border-top-width': '1px' },
        },
        // TÉMOIN : hauteur non nulle, même trait — reste une boîte border-box.
        Barre: {
          tokens: { 'border-color': '{color.blanc}', height: '{size.fx.barre}' },
          literals: { 'border-top-width': '1px' },
        },
      },
    },
  },
  states: [],
  semantics: { element: 'div' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/FxLigne', export: 'FxLigne' } },
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
  const trouve = (nom: string) => {
    const hits: any[] = [];
    const walk = (n: any) => { if (n.name === nom) hits.push(n); (n.children || []).forEach(walk); };
    walk(root);
    return hits;
  };
  const seps = trouve('Separateur');
  if (!seps.length) echecs.push('aucun nœud Separateur construit dans le mock');
  for (const s of seps) {
    if ((s.height ?? 99) >= 0.5) {
      echecs.push(`Separateur h=${s.height} — attendu ~0 : hauteur nulle + trait = LIGNE ; le clamp INSIDE de Figma (mesuré : 2) gonfle chaque page qui porte le Footer`);
      break;
    }
    if (s.strokeAlign !== 'CENTER') {
      echecs.push(`Separateur strokeAlign=${s.strokeAlign} — attendu CENTER (le trait d'une LINE chevauche, il n'occupe pas la boîte)`);
      break;
    }
  }
  const barres = trouve('Barre');
  if (!barres.length) echecs.push('aucun nœud Barre (témoin) construit');
  for (const b of barres) {
    if (Math.abs((b.height ?? 0) - 8) > 0.5) {
      echecs.push(`témoin Barre h=${b.height} — attendu 8 : la règle ligne ne doit pas toucher les boîtes à hauteur non nulle`);
      break;
    }
    if (b.strokeAlign === 'CENTER') {
      echecs.push('témoin Barre en strokeAlign CENTER — la doctrine border-box (INSIDE) doit rester celle des boîtes');
      break;
    }
  }
}

if (echecs.length) {
  console.error('✘ zero-height-line-part:');
  for (const e of echecs) console.error('   - ' + e);
  process.exit(1);
}
console.log('zero-height-line-part ok : hauteur 0 + trait per-side → géométrie ~0 en CENTER, le témoin boîte reste INSIDE à sa hauteur');
