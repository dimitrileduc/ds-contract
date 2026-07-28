import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitReact, generateStories, validateContract } from '../../core/emit-react.js';

const fixture = ContractSchema.parse({
  id: 'fixture.code-only-image',
  name: 'CodeOnlyImage',
  version: '1.0.0',
  description: 'Independent fixture: runtime image metadata has no Figma component property.',
  semantics: { element: 'div' },
  props: [
    {
      name: 'src',
      type: 'text',
      required: true,
      bindings: { figma: { kind: 'NONE' }, code: { prop: 'src' } },
    },
    {
      name: 'alt',
      type: 'text',
      default: '',
      bindings: { figma: { kind: 'NONE' }, code: { prop: 'alt' } },
    },
  ],
  states: [],
  anatomy: {
    root: {
      parts: {
        image: { element: 'img', attrs: { src: '{src}', alt: '{alt}' } },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/CodeOnlyImage', export: 'CodeOnlyImage' },
  },
});
const contracts = new Map([[fixture.id, fixture]]);
const errors: string[] = [];
validateContract(fixture, contracts, errors, new Map());
if (errors.length > 0) throw new Error(`code-only scalar props were refused: ${errors.join('; ')}`);
const { tsx } = emitReact(fixture, { tokens: new Set(), icons: new Map(), contracts });
if (!tsx.includes('src={String(src)}') || !tsx.includes('alt={String(alt)}')) {
  throw new Error('code-only image metadata did not reach the generated DOM');
}
if (!tsx.includes('src: string;')) throw new Error('required code-only prop became optional');
const stories = generateStories(fixture, contracts);
if (!stories.includes("src: ''")) throw new Error('required code-only prop left Storybook untypeable');

console.log('✔ scalar props can be explicitly code-only and still drive DOM attributes');
