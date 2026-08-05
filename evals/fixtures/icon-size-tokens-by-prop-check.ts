// icon-size-tokens-by-prop-check.ts — une part `icon` dont la taille varie PAR PROP
// (tokensByProp width/height) doit émettre cette taille-là pour la combo, pas le
// `icon.size` de base (016, résidu AccordionRow).
//
// LE DÉFAUT MESURÉ SUR LE CANVAS RÉEL (2026-08-05) : AccordionRow.ChevronDown porte
//   icon.size 32 ET tokensByProp { taille: { petit: { width/height {size.accordion-row.
//   chevron-down-petit} = 24 } } }. Après régénération, le chevron fait 32 dans les
//   variantes petites — la rangée fermée petite mesure 48 au lieu des 40 d'origine
//   (max(Titre 24, Chevron 32) + 8 + 8). Le compile icon ne lit que `part.icon.size`.

import { createFigmaEngine } from '../../core/emit-figma-script.js';
import { ContractSchema } from '../../packages/schema/src/contract-schema.js';

const tokenTree = {
  primitives: {
    size: { fx: { 'chevron-petit': { $value: '24px', $type: 'dimension' } } },
  },
  semantic: {}, light: {}, dark: {}, brands: { default: {} },
};

const contrat = ContractSchema.parse({
  id: 'ds.fx-icon-size',
  name: 'FxIconSize',
  version: '1.0.0',
  description: 'Fixture 016 : la taille par-prop d une part icon doit atteindre le canvas.',
  props: [
    { name: 'taille', type: { enum: ['grand', 'petit'] }, default: 'grand',
      bindings: { figma: { kind: 'VARIANT', property: 'Taille', values: { grand: 'Grand', petit: 'Petit' } }, code: { prop: 'taille' } } },
  ],
  anatomy: {
    root: {
      layout: { display: 'flex', direction: 'row', align: 'center' },
      parts: {
        Glyphe: {
          icon: { asset: 'fx-chevron', size: 32 },
          tokensByProp: { prop: 'taille', map: { petit: { width: '{size.fx.chevron-petit}', height: '{size.fx.chevron-petit}' } } },
        },
      },
    },
  },
  states: [],
  semantics: { element: 'div' },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/FxIconSize', export: 'FxIconSize' },
  },
});

const icons = new Map([['fx-chevron', '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M4 12l12 8 12-8" fill="#26282C"/></svg>']]);
const engine = createFigmaEngine({ tokens: tokenTree as never, icons });
const script = engine.buildComponentScript(contrat, new Map([[contrat.id, contrat]]));

const echecs: string[] = [];
// La variante PETITE doit porter iconSize 24 ; la GRANDE garde 32.
const specs = [...script.matchAll(/"name":\s*"Taille=(Grand|Petit)"[\s\S]{0,1200}?"iconSize":\s*(\d+)/g)]
  .map((m) => ({ variante: m[1], iconSize: Number(m[2]) }));
const grand = specs.find((s) => s.variante === 'Grand');
const petit = specs.find((s) => s.variante === 'Petit');
if (!grand || grand.iconSize !== 32) echecs.push(`variante Grand : iconSize=${grand?.iconSize ?? 'absent'} — attendu 32 (icon.size de base)`);
if (!petit || petit.iconSize !== 24) echecs.push(`variante Petit : iconSize=${petit?.iconSize ?? 'absent'} — attendu 24 (tokensByProp petit) ; c'est le chevron à 32 mesuré sur le canvas (rangée 48 au lieu de 40)`);

if (echecs.length) {
  console.error('✘ icon-size-tokens-by-prop:');
  for (const e of echecs) console.error('   - ' + e);
  process.exit(1);
}
console.log('icon-size-tokens-by-prop ok : la taille par-prop atteint le spec émis (Grand 32, Petit 24)');
