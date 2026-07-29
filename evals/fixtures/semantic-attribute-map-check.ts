/**
 * semantic-attribute-map regression — contract-declared stateful DOM
 * attributes must travel through every code-facing emitter. This is
 * deliberately independent of NavItem and Tab's adopted contracts: it pins
 * the generic vocabulary before those contracts consume it.
 *
 * The two real consumer shapes are intentionally different:
 *
 *   - NavItem: the boolean `actif` emits `aria-current="page"` only in the
 *     true plane. The false plane must OMIT the attribute, not claim
 *     `aria-current="false"`.
 *   - Tab: enum `etat` selects `aria-selected` and the roving `tabIndex`;
 *     its `aria-controls` value is a `{panelId}` reference, proving map
 *     values may use an independently declared code prop.
 *
 * attrs is already sufficient for unconditional literal / `{prop}`
 * attributes. attrsByProp is the additive, constrained selector map for the
 * semantic attributes whose value or presence changes with a boolean/enum.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { ContractSchema } from '../../scripts/contract-schema.js';
import { emitHtml } from '../../core/emit-html.js';
import { emitReact, validateContract } from '../../core/emit-react.js';
import { emitReactInline } from '../../core/emit-react-inline.js';

const fail = (message: string): never => {
  console.error(`✘ semantic-attribute-map: ${message}`);
  process.exit(1);
};

const navItem = ContractSchema.parse({
  id: 'fixture.semantic-nav-item',
  name: 'SemanticNavItem',
  version: '0.1.0',
  status: 'draft',
  description: 'Independent NavItem-shaped attribute mapping fixture.',
  semantics: { element: 'a' },
  props: [
    {
      name: 'href',
      type: 'text',
      default: '/portes',
      bindings: { figma: { kind: 'NONE' }, code: { prop: 'href' } },
    },
    {
      name: 'actif',
      type: 'boolean',
      default: false,
      bindings: { figma: { kind: 'BOOLEAN', property: 'Actif' }, code: { prop: 'actif' } },
    },
  ],
  states: [],
  anatomy: {
    root: {
      attrs: { href: '{href}' },
      attrsByProp: [
        {
          prop: 'actif',
          map: {
            true: { 'aria-current': 'page' },
          },
        },
      ],
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/SemanticNavItem', export: 'SemanticNavItem' },
  },
});

const tab = ContractSchema.parse({
  id: 'fixture.semantic-tab',
  name: 'SemanticTab',
  version: '0.1.0',
  status: 'draft',
  description: 'Independent Tab-shaped attribute mapping fixture.',
  semantics: { element: 'button', role: 'tab' },
  props: [
    {
      name: 'etat',
      type: { enum: ['defaut', 'selectionne'] },
      default: 'defaut',
      bindings: {
        figma: { kind: 'VARIANT', property: 'Etat', values: { defaut: 'Defaut', selectionne: 'Selectionne' } },
        code: { prop: 'etat' },
      },
    },
    {
      name: 'panelId',
      type: 'text',
      default: 'overview-panel',
      bindings: { figma: { kind: 'NONE' }, code: { prop: 'panelId' } },
    },
  ],
  states: [],
  anatomy: {
    root: {
      attrsByProp: [
        {
          prop: 'etat',
          map: {
            defaut: {
              'aria-selected': 'false',
              'aria-controls': '{panelId}',
              tabIndex: '-1',
            },
            selectionne: {
              'aria-selected': 'true',
              'aria-controls': '{panelId}',
              tabIndex: '0',
            },
          },
        },
      ],
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/SemanticTab', export: 'SemanticTab' },
  },
});

const contracts = new Map([
  [navItem.id, navItem],
  [tab.id, tab],
]);
const reactCtx = { tokens: new Set<string>(), icons: new Map<string, string>(), contracts };
const inlineCtx = {
  tokens: { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } },
  icons: new Map<string, string>(),
  contracts,
  mode: 'light' as const,
};

function assertRefuses(label: string, contract: typeof navItem): void {
  const errors: string[] = [];
  validateContract(contract, contracts, errors, new Map());
  if (errors.length === 0) fail(`${label}: malformed attrsByProp declaration was accepted`);
}

// The selector is deliberately bounded to boolean/enum props: mapping an
// arbitrary runtime string would turn this compact contract fact into an
// unreviewable free-form attribute template.
const textSelector = structuredClone(navItem);
(textSelector.anatomy.root as any).attrsByProp = [
  { prop: 'href', map: { '/portes': { 'aria-current': 'page' } } },
];
assertRefuses('attrsByProp selector', textSelector);

// `{prop}` values remain useful (Tab's panel identity) but cannot become an
// undeclared interpolation channel.
const unknownValueRef = structuredClone(tab);
(unknownValueRef.anatomy.root as any).attrsByProp[0].map.defaut['aria-controls'] = '{missingPanelId}';
assertRefuses('attrsByProp value reference', unknownValueRef as typeof navItem);

/** Compile an emitted TSX module in memory so the assertions inspect the
 * actual DOM attributes, rather than accepting an unused map constant. CSS
 * modules are deliberately mocked: class names are irrelevant to this
 * semantics-only fixture. */
function emittedComponent(source: string, exportName: string): React.ComponentType<Record<string, unknown>> {
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} as Record<string, unknown> };
  const localRequire = (id: string): unknown => {
    if (id === 'react') return React;
    if (id.endsWith('.module.css')) return {};
    fail(`emitted module unexpectedly imports ${JSON.stringify(id)}`);
  };
  new Function('require', 'exports', 'module', 'React', compiled)(localRequire, module.exports, module, React);
  const component = module.exports[exportName];
  if (typeof component !== 'object' && typeof component !== 'function') {
    fail(`emitted module did not export ${exportName}`);
  }
  return component as React.ComponentType<Record<string, unknown>>;
}

const render = (component: React.ComponentType<Record<string, unknown>>, props: Record<string, unknown>) =>
  renderToStaticMarkup(React.createElement(component, props));

const hasAttr = (markup: string, name: string, value: string) =>
  new RegExp(`\\s${name}="${value}"`, 'i').test(markup);

function assertNavItem(
  surface: string,
  Component: React.ComponentType<Record<string, unknown>>,
): void {
  const inactive = render(Component, { href: '/portes', actif: false });
  if (!hasAttr(inactive, 'href', '/portes')) fail(`${surface}: root attrs did not preserve href={href}`);
  if (/\saria-current=/i.test(inactive)) {
    fail(`${surface}: inactive NavItem emitted aria-current instead of omitting it`);
  }

  const active = render(Component, { href: '/portes', actif: true });
  if (!hasAttr(active, 'aria-current', 'page')) {
    fail(`${surface}: active NavItem did not emit aria-current="page"`);
  }
  if (hasAttr(active, 'aria-current', 'true') || hasAttr(active, 'aria-current', 'false')) {
    fail(`${surface}: NavItem serialized its selector boolean instead of the declared aria value`);
  }
}

function assertTab(
  surface: string,
  Component: React.ComponentType<Record<string, unknown>>,
): void {
  const defaut = render(Component, { etat: 'defaut', panelId: 'pricing-panel' });
  if (!hasAttr(defaut, 'role', 'tab')) fail(`${surface}: Tab lost role="tab"`);
  if (!hasAttr(defaut, 'aria-selected', 'false')) fail(`${surface}: default Tab lacks aria-selected="false"`);
  if (!hasAttr(defaut, 'aria-controls', 'pricing-panel')) {
    fail(`${surface}: default Tab did not resolve aria-controls from {panelId}`);
  }
  if (!hasAttr(defaut, 'tabIndex', '-1')) fail(`${surface}: default Tab lacks roving tabIndex=-1`);

  const selectionne = render(Component, { etat: 'selectionne', panelId: 'pricing-panel' });
  if (!hasAttr(selectionne, 'aria-selected', 'true')) fail(`${surface}: selected Tab lacks aria-selected="true"`);
  if (!hasAttr(selectionne, 'aria-controls', 'pricing-panel')) {
    fail(`${surface}: selected Tab did not retain aria-controls from {panelId}`);
  }
  if (!hasAttr(selectionne, 'tabIndex', '0')) fail(`${surface}: selected Tab lacks roving tabIndex=0`);
}

for (const [surface, emit] of [
  ['React', (contract: typeof navItem) => emitReact(contract, reactCtx).tsx],
  ['React inline', (contract: typeof navItem) => emitReactInline(contract, inlineCtx).tsx],
] as const) {
  assertNavItem(surface, emittedComponent(emit(navItem), navItem.name));
  assertTab(surface, emittedComponent(emit(tab), tab.name));
}

const navHtml = emitHtml(navItem, reactCtx).html;
if ((navHtml.match(/\saria-current="page"/gi) ?? []).length !== 1) {
  fail('HTML: NavItem must emit aria-current="page" exactly for the actif=true showcase item');
}
if (/\saria-current="(?:true|false)"/i.test(navHtml)) {
  fail('HTML: NavItem serialized its selector boolean instead of the declared aria value');
}

const tabHtml = emitHtml(tab, reactCtx).html;
for (const [name, value] of [
  ['aria-selected', 'false'],
  ['aria-selected', 'true'],
  ['aria-controls', 'overview-panel'],
  ['tabIndex', '-1'],
  ['tabIndex', '0'],
] as const) {
  if (!hasAttr(tabHtml, name, value)) fail(`HTML: Tab lacks ${name}=${JSON.stringify(value)}`);
}

console.log('✔ semantic attribute mappings preserve NavItem aria-current and Tab selected/controls/roving semantics across React, inline React, and HTML');
