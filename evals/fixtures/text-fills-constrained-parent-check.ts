// text-fills-constrained-parent-check.ts — un TEXT dans un parent à largeur
// CONTRAINTE remplit le parent et wrappe (FILL + HEIGHT) ; dans un parent HUG
// il reste auto-width (016).
//
// LE DÉFAUT MESURÉ SUR LE CANVAS RÉEL (2026-08-06, Presentation/SectionHeader) :
//   en CSS, TOUT texte wrappe à la largeur de son bloc — l'auto-width de Figma
//   n'a pas d'équivalent CSS. L'émetteur posait tous les TEXT en
//   WIDTH_AND_HEIGHT : le Titre du SectionHeader (master racine HUG rebuilt,
//   origine 1550 FIXED) débordait de la colonne 628 de Presentation en UNE
//   ligne (origine : deux lignes, 628×80) — la page accueil perdait 16 px et
//   chaque titre long du fichier s'étirait au lieu de wrapper. Même famille
//   que Devis.Titre (réparé localement par fixedWidth) : ceci est la règle
//   GÉNÉRIQUE.
//
// CE QUE LA FIXTURE EXIGE :
//   1. un TEXT enfant d'un frame à largeur FIXE (width token) → dans le mock :
//      layoutSizingHorizontal FILL et textAutoResize HEIGHT ;
//   2. TÉMOIN : un TEXT dans un frame HUG (le label d'un bouton) reste
//      auto-width (WIDTH_AND_HEIGHT) — FILL-dans-HUG est un cercle que Figma
//      refuse, et le HUG des boutons est la sémantique inline correcte.

import vm from 'node:vm';
import { createFigmaEngine } from '../../core/emit-figma-script.js';
import { ContractSchema } from '../../packages/schema/src/contract-schema.js';
import { createFigmaMock } from '../../scripts/plugin-engine-mock-figma.mjs';

const tokenTree = {
  primitives: {
    size: { fx: { bloc: { $value: '628px', $type: 'dimension' } } },
  },
  semantic: {}, light: {}, dark: {}, brands: { default: {} },
};

const contrat = ContractSchema.parse({
  id: 'ds.fx-text-fill',
  name: 'FxTextFill',
  version: '1.0.0',
  description: 'Fixture 016 : le texte remplit un parent contraint et wrappe ; il reste auto dans un parent HUG.',
  props: [],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'column', align: 'start' },
      parts: {
        Bloc: {
          layout: { direction: 'column' },
          tokens: { width: '{size.fx.bloc}' },
          parts: {
            Titre: { text: 'Un titre assez long pour devoir se replier sur plusieurs lignes dans sa colonne de six cent vingt-huit pixels' },
          },
        },
        BoutonHug: {
          layout: { display: 'inline-flex', direction: 'row', align: 'center' },
          parts: {
            Label: { text: 'Contactez-nous' },
          },
        },
      },
    },
  },
  states: [],
  semantics: { element: 'div' },
  anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/FxTextFill', export: 'FxTextFill' } },
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
    const walk = (n: any) => { if (n.name === nom && n.type === 'TEXT') hits.push(n); (n.children || []).forEach(walk); };
    walk(root);
    return hits;
  };
  const titres = trouve('Titre');
  if (!titres.length) echecs.push('aucun TEXT Titre construit');
  for (const t of titres) {
    if (t.layoutSizingHorizontal !== 'FILL' || t.textAutoResize !== 'HEIGHT') {
      echecs.push(`Titre (parent à largeur fixe 628) : sizingH=${t.layoutSizingHorizontal} autoResize=${t.textAutoResize} — attendu FILL/HEIGHT : en CSS le texte wrappe à la largeur de son bloc ; l'auto-width le fait déborder (Presentation accueil −16, le titre en une ligne)`);
      break;
    }
  }
  const labels = trouve('Label');
  if (!labels.length) echecs.push('aucun TEXT Label construit');
  for (const l of labels) {
    if (l.layoutSizingHorizontal === 'FILL') {
      echecs.push('le TÉMOIN Label (parent HUG, sémantique inline du bouton) a été mis en FILL — la règle déborde de sa cible et casserait le HUG de tous les boutons');
      break;
    }
  }
}

if (echecs.length) {
  console.error('✘ text-fills-constrained-parent:');
  for (const e of echecs) console.error('   - ' + e);
  process.exit(1);
}
console.log('text-fills-constrained-parent ok : le texte remplit et wrappe dans un parent contraint, reste auto dans un parent HUG');
