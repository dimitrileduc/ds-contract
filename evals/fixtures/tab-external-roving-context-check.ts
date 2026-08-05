/**
 * A Tab is not a TabList. This fixture pins the narrow bridge between a Tab
 * contract that requires an external roving-focus controller and the visual
 * campaign preview that supplies that controller for inspection.
 *
 * The wrapper is not component output: it is a comparison-only context,
 * derived from a declared contract fact and an explicit code-only id. It must
 * never manufacture an id or a selected state in the harness.
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { validateContract } from '../../core/emit-react.js';
import { inspectDomSemantics, launchBrowser, previewDoc } from '../../extract/figma/visual-parity/render.js';

const fail = (message: string): never => {
  console.error(`✘ tab-external-roving-context: ${message}`);
  process.exit(1);
};

const tab = ContractSchema.parse({
  id: 'fixture.external-tab',
  name: 'ExternalTab',
  version: '1.0.0',
  description: 'Independent Tab whose controller is external to the component.',
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
      default: 'fixture-panel',
      bindings: { figma: { kind: 'NONE' }, code: { prop: 'panelId' } },
    },
    {
      name: 'tablistId',
      type: 'text',
      default: 'fixture-tablist',
      bindings: { figma: { kind: 'NONE' }, code: { prop: 'tablistId' } },
    },
  ],
  states: [],
  anatomy: {
    root: {
      attrs: { type: 'button', 'data-tablist-id': '{tablistId}' },
      attrsByProp: {
        prop: 'etat',
        map: {
          defaut: { 'aria-selected': 'false', 'aria-controls': '{panelId}', tabIndex: '-1' },
          selectionne: { 'aria-selected': 'true', 'aria-controls': '{panelId}', tabIndex: '0' },
        },
      },
      // This is a contract requirement on the composition boundary, not a
      // request for Tab itself to emit a wrapper or keyboard handler.
      tabContext: {
        owner: 'external',
        role: 'tablist',
        rovingFocus: true,
        idProp: 'tablistId',
        minTabs: 2,
      },
      parts: { label: { content: { prop: 'panelId' } } },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: 'src/components/ExternalTab', export: 'ExternalTab' },
  },
});

const pkg = {
  subject: { kind: 'contract' },
  contract: tab,
  tokensCss: '',
  inventory: new Set<string>(),
  icons: new Map<string, string>(),
  contracts: new Map([[tab.id, tab]]),
} as any;

const errors: string[] = [];
validateContract(tab, pkg.contracts, errors, pkg.icons);
if (errors.length > 0) fail(`valid external tab context was refused: ${errors.join(' | ')}`);
const invalidContext = structuredClone(tab);
invalidContext.anatomy.root.tabContext!.idProp = 'missingTablistId';
const invalidErrors: string[] = [];
validateContract(invalidContext, pkg.contracts, invalidErrors, pkg.icons);
if (!invalidErrors.some((error) => error.includes('tabContext.idProp'))) {
  fail(`missing external tablist identity was accepted: ${invalidErrors.join(' | ')}`);
}

async function main(): Promise<void> {
  const doc = previewDoc(pkg, tab, null);
  const wrappers = doc.match(/<div role="tablist" id="fixture-tablist" data-context-owner="external">/g) ?? [];
  if (wrappers.length !== 1) {
    fail(`comparison preview must expose exactly one declared external tablist, got ${wrappers.length}`);
  }
  if (!doc.includes('<button class="external-tab external-tab--etat-defaut"')) {
    fail('comparison preview lost the Tab itself while adding its external controller context');
  }
  if (doc.includes('data-context-owner="harness"') || doc.includes('id="generated-tablist"')) {
    fail('comparison preview manufactured a tablist identity instead of using the contract-bound prop');
  }

  const { browser } = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(doc, { waitUntil: 'load' });
    const [context, ordinaryScope] = await inspectDomSemantics(page, [
      {
        id: 'external-tab-context',
        selector: '[role="tablist"]',
        assertion: 'keyboard-context',
        expected: { id: 'fixture-tablist', rovingFocus: true },
      },
      {
        id: 'ordinary-assertion-stays-root-scoped',
        selector: '[role="tablist"]',
        assertion: 'attribute',
        expected: { id: 'fixture-tablist' },
      },
    ]);
    if (context.matches.length !== 1) {
      fail(`keyboard-context probe must find exactly one external owner, got ${context.matches.length}`);
    }
    const owner = context.matches[0];
    if (owner.attributes.id !== 'fixture-tablist' || owner.role !== 'tablist') {
      fail(`keyboard-context probe read the wrong external owner: ${JSON.stringify(owner)}`);
    }
    const selectedStops = owner.tabStops.filter((stop) => stop.ariaSelected === 'true');
    const focusableStops = owner.tabStops.filter((stop) => stop.tabIndex === 0);
    if (owner.tabStops.length < 2 || selectedStops.length !== 1 || focusableStops.length !== 1) {
      fail(`keyboard-context probe did not receive the declared roving tab set: ${JSON.stringify(owner.tabStops)}`);
    }
    if (ordinaryScope.matches.length !== 0) {
      fail('ordinary semantic assertions must not escape the component root to an external tablist');
    }
  } finally {
    await browser.close();
  }

  console.log('tab-external-roving-context ok: browser receipt finds the declared external roving owner while other assertions stay root-scoped');
}

await main();
