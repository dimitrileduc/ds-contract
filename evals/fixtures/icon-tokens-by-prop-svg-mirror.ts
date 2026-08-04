/**
 * Regression for a real bug found while converting accordion-row's chevron
 * icons (015, T040-043 prep): `literalsByProp` on an icon part mirrors its
 * width/height into a `<part> svg` rule (core/emit-react.ts, core/emit-
 * html.ts — the injected <svg> can't be reached by the wrapper's own class
 * alone), but the parallel `tokensByProp` path never had the same mirror.
 * A literal->token conversion on an icon part's per-variant size therefore
 * silently regressed the glyph itself to the BASE icon.size — the wrapper
 * shrank, the svg inside it didn't. Caught by diffing AccordionRow's
 * generated CSS before/after converting ChevronUp/ChevronDown's `petit`
 * variant (T040-043), not by any existing eval.
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitHtml } from '../../core/emit-html.js';
import { emitReact } from '../../core/emit-react.js';

const contract = ContractSchema.parse({
  id: 'fixture.icon-tokens-by-prop',
  name: 'IconTokensByProp',
  version: '1.0.0',
  description: 'Synthetic contract exercising an icon part sized via tokensByProp.',
  semantics: { element: 'div' },
  props: [
    {
      name: 'taille',
      type: { enum: ['grand', 'petit'] },
      default: 'grand',
      bindings: { figma: { kind: 'VARIANT', property: 'Taille', values: { grand: 'Grand', petit: 'Petit' } }, code: { prop: 'taille' } },
    },
  ],
  states: [],
  anatomy: {
    root: {
      parts: {
        Chevron: {
          icon: { asset: 'chevron-down', size: 32 },
          tokensByProp: {
            prop: 'taille',
            map: {
              petit: { width: '{space.24}', height: '{space.24}' },
            },
          },
        },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/IconTokensByProp', export: 'IconTokensByProp' },
  },
});
const contracts = new Map([[contract.id, contract]]);
const icons = new Map([['chevron-down', '<svg viewBox="0 0 32 32"><path d="M0 0"/></svg>']]);

const react = emitReact(contract, { tokens: new Set(['space.24']), icons, contracts }).css;
if (!react.includes('.taille-petit .Chevron {') || !/\.taille-petit \.Chevron \{\s*width: var\(--space-24\);/.test(react)) {
  throw new Error(`react: the wrapper rule for the petit variant is missing width, got:\n${react}`);
}
if (!/\.taille-petit \.Chevron svg \{\s*width: var\(--space-24\);/.test(react)) {
  throw new Error(`react: the injected <svg> did not receive the mirrored width rule, got:\n${react}`);
}
if (!/\.taille-petit \.Chevron svg \{\s*height: var\(--space-24\);/.test(react)) {
  throw new Error(`react: the injected <svg> did not receive the mirrored height rule, got:\n${react}`);
}

const html = emitHtml(contract, { tokens: new Set(['space.24']), icons, contracts }).css;
if (!/--taille-petit \.[\w-]*Chevron svg \{[^}]*width: var\(--space-24\)/.test(html)) {
  throw new Error(`html: the injected <svg> did not receive the mirrored width rule, got:\n${html}`);
}
if (!/--taille-petit \.[\w-]*Chevron svg \{[^}]*height: var\(--space-24\)/.test(html)) {
  throw new Error(`html: the injected <svg> did not receive the mirrored height rule, got:\n${html}`);
}

console.log(
  '✔ tokensByProp on an icon part mirrors width/height into the injected <svg> rule, on both react and html — ' +
    'a literal-to-token conversion of an icon\'s per-variant size no longer silently regresses the glyph to its base size.',
);
