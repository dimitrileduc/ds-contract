/**
 * Scalar component-prop propagation regression.
 *
 * A MemberCard-like parent owns runtime image data, while MemberPicture owns
 * the image DOM.  The parent must pass its scalar values to the child through
 * the component reference; it must not flatten the child's anatomy into the
 * parent just to reach the <img> attributes.
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitFigmaScript } from '../../core/emit-figma-script.js';
import { emitHtml } from '../../core/emit-html.js';
import { emitReact } from '../../core/emit-react.js';
import { emitReactInline } from '../../core/emit-react-inline.js';

const fail = (message: string): never => {
  console.error(`✘ component-scalar-propagation: ${message}`);
  process.exit(1);
};

const child = ContractSchema.parse({
  id: 'fixture.scalar-picture',
  name: 'ScalarPicture',
  version: '1.0.0',
  status: 'draft',
  description: 'Child image component whose runtime data comes from its parent.',
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
  events: [],
  anatomy: {
    root: {
      parts: {
        image: { element: 'img', attrs: { src: '{src}', alt: '{alt}' } },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/ScalarPicture', export: 'ScalarPicture' },
  },
});

const parent = ContractSchema.parse({
  id: 'fixture.scalar-card',
  name: 'ScalarCard',
  version: '1.0.0',
  status: 'draft',
  description: 'Parent that owns runtime image data but composes the picture child.',
  semantics: { element: 'article' },
  props: [
    {
      name: 'imageUrl',
      type: 'text',
      required: true,
      default: '/fixtures/parent-photo.jpg',
      bindings: { figma: { kind: 'NONE' }, code: { prop: 'imageUrl' } },
    },
    {
      name: 'imageAlt',
      type: 'text',
      default: 'Fixture portrait',
      bindings: { figma: { kind: 'NONE' }, code: { prop: 'imageAlt' } },
    },
  ],
  states: [],
  events: [],
  anatomy: {
    root: {
      parts: {
        picture: {
          component: {
            id: child.id,
            props: { src: '{imageUrl}', alt: '{imageAlt}' },
          },
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/ScalarCard', export: 'ScalarCard' },
  },
});

const contracts = new Map([[child.id, child], [parent.id, parent]]);
const tokens = { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } };

const react = emitReact(parent, { tokens: new Set(), icons: new Map(), contracts }).tsx;
const inline = emitReactInline(parent, { tokens, icons: new Map(), contracts, mode: 'light' }).tsx;

for (const [surface, source] of [['React', react], ['React inline', inline]] as const) {
  if (!source.includes('import { ScalarPicture }')) {
    fail(`${surface} did not retain the composed child import`);
  }
  if (!source.includes('<ScalarPicture src={imageUrl} alt={imageAlt} />')) {
    fail(`${surface} did not thread both parent text scalars into the child instance`);
  }
  if (source.includes('<img')) {
    fail(`${surface} flattened the child image anatomy into the parent`);
  }
}

const html = emitHtml(parent, { tokens: new Set(), icons: new Map(), contracts }).html;
if (!html.includes('src="/fixtures/parent-photo.jpg"') || !html.includes('alt="Fixture portrait"')) {
  fail('HTML did not resolve the parent scalar defaults before rendering the child');
}

const figma = emitFigmaScript(parent, { tokens, icons: new Map(), contracts });
if (!figma.includes('"type":"instance"') || !figma.includes('"dep":"ScalarPicture"')) {
  fail('Figma projection flattened the composed child instead of retaining an instance boundary');
}
if (figma.includes('"src":"{imageUrl}"') || figma.includes('"alt":"{imageAlt}"')) {
  fail('Figma projection leaked code-only scalar placeholders into its instance payload');
}

console.log('component-scalar-propagation ok: text scalars reach the child on code/static surfaces while ScalarPicture remains a component instance');
