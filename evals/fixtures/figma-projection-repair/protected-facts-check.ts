import { collectSurfaceFacts, compareProtectedFacts } from '../../../extract/figma/projection-repair/facts.js';

const base = {
  id: '2151:5552', type: 'COMPONENT', name: 'HeroVideo',
  absoluteBoundingBox: { x: 0, y: 0, width: 1728, height: 720 },
  fills: [
    { type: 'IMAGE', imageRef: 'poster-hash', scaleMode: 'FILL' },
    { type: 'VIDEO', videoRef: 'video-hash', scaleMode: 'FILL' },
  ],
  children: [
    {
      id: '1:1', type: 'RECTANGLE', name: 'VoileNavigation',
      absoluteBoundingBox: { x: 0, y: 0, width: 1728, height: 720 },
      fills: [{
        type: 'GRADIENT_LINEAR',
        gradientStops: [
          { position: 0.55, color: { r: 0, g: 0, b: 0, a: 0 } },
          { position: 1, color: { r: 0, g: 0, b: 0, a: 0.7 } },
        ],
        gradientHandlePositions: [{ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 1 }],
      }],
    },
    {
      id: '1:2', type: 'TEXT', name: 'Titre', characters: 'Le numéro 1 des portes HÖRMANN',
      characterStyleOverrides: [0, 0, 0, 1, 1],
      styleOverrideTable: { 1: { fontWeight: 700 } },
      styles: { text: 'S:heading' },
      style: { fontFamily: 'Montserrat', fontPostScriptName: 'Montserrat-Regular', fontWeight: 400, fontSize: 44, lineHeightPx: 48 },
      absoluteBoundingBox: { x: 89, y: 600, width: 900, height: 48 },
    },
    {
      id: '1:3', type: 'INSTANCE', name: 'Button', componentId: '6:122',
      componentProperties: { 'Label#1:0': { type: 'TEXT', value: 'En savoir plus' }, 'IconRight#1:1': { type: 'BOOLEAN', value: true } },
      overrides: [{ id: 'I1:3;1:4', overriddenFields: ['characters'] }],
      absoluteBoundingBox: { x: 1400, y: 610, width: 232, height: 54 },
    },
  ],
} as Record<string, unknown>;

const before = collectSurfaceFacts(base);

function mustCatch(label: string, fact: Parameters<typeof compareProtectedFacts>[2][number], mutate: (node: any) => void): void {
  const changed: any = structuredClone(base);
  mutate(changed);
  const differences = compareProtectedFacts(before, collectSurfaceFacts(changed), [fact]);
  if (!differences.some((difference) => difference.fact === fact)) throw new Error(`${label}: ${fact} drift was not caught`);
}

mustCatch('lost gradient', 'gradient-paints', (node) => { node.children[0].fills = []; });
mustCatch('gradient stop changed', 'gradient-paints', (node) => { node.children[0].fills[0].gradientStops[1].color.a = 0.5; });
mustCatch('page copy changed', 'text-content', (node) => { node.children[1].characters = 'Mauvais copy'; });
mustCatch('rich text flattened', 'text-ranges', (node) => { node.children[1].characterStyleOverrides = []; node.children[1].styleOverrideTable = {}; });
mustCatch('title weight changed', 'text-styles', (node) => { node.children[1].style.fontWeight = 500; });
mustCatch('text token detached', 'text-styles', (node) => { node.children[1].styles.text = null; });
mustCatch('poster changed', 'image-paints', (node) => { node.fills[0].imageRef = 'other-poster'; });
mustCatch('video projection changed', 'video-paints', (node) => { node.fills = node.fills.filter((paint: any) => paint.type !== 'VIDEO'); });
mustCatch('nested CTA override changed', 'instance-overrides', (node) => { node.children[2].componentProperties['Label#1:0'].value = 'Contactez-nous'; });
mustCatch('instance relinked', 'instance-links', (node) => { node.children[2].componentId = '6:999'; });

const unchanged = compareProtectedFacts(before, collectSurfaceFacts(structuredClone(base)), [
  'gradient-paints', 'text-content', 'text-ranges', 'text-styles', 'image-paints', 'video-paints', 'instance-overrides',
]);
if (unchanged.length !== 0) throw new Error('byte-equivalent facts were reported as drift');

console.log('✔ protected facts catch gradients, poster/video paints, Page copy, rich-text ranges, text style/weight/token and nested overrides');
