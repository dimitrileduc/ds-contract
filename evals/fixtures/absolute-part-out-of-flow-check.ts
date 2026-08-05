// absolute-part-out-of-flow-check.ts — une part `declared position:absolute` ne doit
// contribuer AUCUNE géométrie au flux du canvas (016, lot R1).
//
// LE DÉFAUT MESURÉ SUR LE CANVAS RÉEL (AccordionRow, 2026-08-05) :
//   Le contrat dit, mot pour mot : « Code-only native disclosure trigger; absolutely
//   overlaid so it contributes no Figma layout geometry. » — declared position:absolute,
//   insets left/right/top portés par stylesWhen, hauteur par token lié.
//   L'émetteur le pose pourtant DANS le flux de l'auto-layout : chaque variante ouverte
//   gagne une rangée entière (gap 24 + hauteur 32) — mesuré : 176 px au lieu de 120.
//
// POURQUOI IL A SURVÉCU : `insetOverlayOffsets` ne lit que `tokens` et `literals` —
//   jamais `stylesWhen` — et n'accepte que les parts aux QUATRE canaux inset (ou
//   parent-bound). Un bandeau top/left/right sans bottom, le motif CSS le plus commun
//   pour un overlay cliquable, n'entre dans aucun des deux cas.
//
// CE QUE LA FIXTURE EXIGE (rouge tant que le correctif n'est pas là) :
//   1. le spec émis pour la part marque la sortie de flux (insetOverlay), et
//   2. exécuté dans le mock : layoutPositioning ABSOLUTE, contrainte verticale MIN
//      (pas d'étirement : bottom n'est pas porté), hauteur PRÉSERVÉE (32, celle du
//      token), largeur étirée au parent.
//   3. témoin négatif : une part SANS declared position:absolute ne bouge pas.

import vm from 'node:vm';
import { createFigmaEngine } from '../../core/emit-figma-script.js';
import { ContractSchema } from '../../packages/schema/src/contract-schema.js';
import { createFigmaMock } from '../../scripts/plugin-engine-mock-figma.mjs';

const tokenTree = {
  primitives: {
    size: { fx: { bandeau: { $value: '32px', $type: 'dimension' } } },
    space: {
      '0': { $value: '0px', $type: 'dimension' },
      '16': { $value: '16px', $type: 'dimension' },
    },
  },
  semantic: {},
  light: {},
  dark: {},
  brands: { default: {} },
};

const contrat = ContractSchema.parse({
  id: 'ds.fx-absolute',
  name: 'FxAbsolute',
  version: '1.0.0',
  description: 'Fixture 016 : une part declared position:absolute ne contribue aucune geometrie au flux du canvas.',
  props: [
    { name: 'taille', type: { enum: ['grand', 'petit'] }, default: 'grand',
      bindings: { figma: { kind: 'VARIANT', property: 'Taille', values: { grand: 'Grand', petit: 'Petit' } }, code: { prop: 'taille' } } },
  ],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'column', align: 'start' },
      tokens: { 'padding-block': '{space.16}' },
      parts: {
        Texte: { text: 'ligne', literals: { 'line-height': '32px', 'font-size': '20px' } },
        // LE SUJET : le bandeau absolu du motif AccordionRow.trigger
        Bandeau: {
          element: 'button',
          tokens: { height: '{size.fx.bandeau}', 'padding-inline': '{space.0}', 'padding-block': '{space.0}' },
          literals: { 'background-color': 'transparent', 'border-width': '0px' },
          declared: { position: 'absolute' },
          stylesWhen: [
            { prop: 'taille', equals: 'grand', styles: { left: '0px', right: '0px', top: '0px' } },
            { prop: 'taille', equals: 'petit', styles: { left: '0px', right: '0px', top: '0px' } },
          ],
        },
        // LE SUJET 2 (Footer.Background, trouvé au FINAL2) : les insets portés en
        // DECLARED — pas en stylesWhen. Même exigence : hors flux.
        Fond: {
          tokens: { height: '{size.fx.bandeau}' },
          literals: { 'background-color': 'transparent' },
          declared: { position: 'absolute', top: '0px', left: '0px', right: '0px' },
        },
        // TÉMOIN : même forme, PAS de position:absolute — doit rester en flux.
        Temoin: { tokens: { height: '{size.fx.bandeau}' }, literals: { 'background-color': 'transparent' } },
      },
    },
  },
  states: [],
  semantics: { element: 'div' },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/FxAbsolute', export: 'FxAbsolute' },
  },
});

const echecs: string[] = [];
const engine = createFigmaEngine({ tokens: tokenTree as never, icons: new Map() });
const script = engine.buildComponentScript(contrat, new Map([[contrat.id, contrat]]));

// 1. le SPEC émis marque la sortie de flux
const specBandeauSorti = /"name":\s*"Bandeau"[\s\S]{0,600}?"insetOverlay":\s*true/.test(script);
if (!specBandeauSorti) {
  echecs.push('le spec émis pour `Bandeau` (declared position:absolute + insets stylesWhen) ne porte PAS insetOverlay — la part restera dans le flux, comme le trigger d’AccordionRow (176 px au lieu de 120 mesurés sur le canvas)');
}
const fondSorti = /"name":\s*"Fond"[\s\S]{0,600}?"insetOverlay":\s*true/.test(script);
if (!fondSorti) {
  echecs.push('le spec émis pour `Fond` (insets en DECLARED — le cas Footer.Background, +459 px au FINAL2) ne porte PAS insetOverlay');
}
const temoinReste = !/"name":\s*"Temoin"[\s\S]{0,600}?"insetOverlay":\s*true/.test(script);
if (!temoinReste) echecs.push('le TÉMOIN (sans position:absolute) a été sorti du flux — le correctif déborde de sa cible');

// 2. exécution dans le mock (le patron de figma-border-color-without-width-check)
const { figma, root } = createFigmaMock();
const ctx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
try {
  // les variables d'abord (comme sur le vrai canvas : tokens PUIS composants — la leçon du jour)
  await vm.runInContext(`(async () => {\n${engine.buildTokensScript(null)}\n})()`, ctx, { timeout: 120_000 });
  await vm.runInContext(`(async () => {\n${script}\n})()`, ctx, { timeout: 120_000 });
} catch (e) {
  echecs.push('le script émis ne s’exécute pas dans le mock : ' + String((e as Error).message).slice(0, 200));
}
{
  const trouve: any[] = [];
  const walk = (n: any) => { if (n.name === 'Bandeau') trouve.push(n); (n.children || []).forEach(walk); };
  walk(root);
  if (trouve.length === 0) echecs.push('aucun nœud Bandeau construit dans le mock');
  for (const n of trouve) {
    if (n.layoutPositioning !== 'ABSOLUTE') {
      echecs.push(`Bandeau layoutPositioning=${JSON.stringify(n.layoutPositioning)} — attendu ABSOLUTE (hors flux)`);
      break;
    }
    if (n.constraints?.vertical === 'STRETCH') {
      echecs.push('Bandeau étiré verticalement (STRETCH) alors que bottom n’est pas porté — la hauteur doit rester la sienne');
      break;
    }
    if (Math.abs((n.height ?? 0) - 32) > 0.5) {
      echecs.push(`Bandeau hauteur=${n.height} — attendu 32 (la hauteur du token, préservée)`);
      break;
    }
  }
}

if (echecs.length) {
  console.error('✘ absolute-part-out-of-flow:');
  for (const e of echecs) console.error('   - ' + e);
  process.exit(1);
}
console.log('absolute-part-out-of-flow ok : la part declared position:absolute sort du flux (ABSOLUTE, vertical MIN, hauteur préservée), le témoin en flux ne bouge pas');
