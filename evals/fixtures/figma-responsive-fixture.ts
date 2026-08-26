import { REQUIRED_COMPONENT_PROTECTION_FACTS } from '../../extract/figma/projection-repair/types.js';

const objectId = 'a'.repeat(40);
const sha = 'b'.repeat(64);

export const expectedPresentationScenarios = [
  ...[320, 390, 834].flatMap((width) => ['default', 'long-title', 'long-cta'].map((fixtureId) => ({
    scenarioId: `${width}-compact-${fixtureId}`,
    presentationValue: 'Compact',
    width,
    height: 720,
    fixtureId,
    expectedOverflow: false as const,
  }))),
  ...[1200].flatMap((width) => ['default', 'long-title', 'long-cta'].map((fixtureId) => ({
    scenarioId: `${width}-desktop-${fixtureId}`,
    presentationValue: 'Desktop',
    width,
    height: 720,
    fixtureId,
    expectedOverflow: false as const,
  }))),
  ...[1440, 1728].flatMap((width) => ['default', 'long-title', 'long-cta'].map((fixtureId) => ({
    scenarioId: `${width}-wide-${fixtureId}`,
    presentationValue: 'Wide',
    width,
    height: 720,
    fixtureId,
    expectedOverflow: false as const,
  }))),
  {
    scenarioId: '844x390-compact-short-landscape',
    presentationValue: 'Compact',
    width: 844,
    height: 390,
    fixtureId: 'short-landscape',
    expectedOverflow: false as const,
  },
];

const artifacts = ['card:master', 'card:page', 'card:page-context'].flatMap((surfaceId) => [
  { artifactId: `${surfaceId}:structure`, surfaceId, kind: 'structure', path: `proofs/${surfaceId}.structure.json`, sha256: sha, width: null, height: null, byteLength: 10, status: 'valid' },
  { artifactId: `${surfaceId}:facts`, surfaceId, kind: 'facts', path: `proofs/${surfaceId}.facts.json`, sha256: sha, width: null, height: null, byteLength: 10, status: 'valid' },
  { artifactId: `${surfaceId}:png`, surfaceId, kind: 'png', path: `proofs/${surfaceId}.png`, sha256: sha, width: 100, height: 100, byteLength: 10, status: 'valid' },
]);

export const responsiveCampaign = {
  schemaVersion: '2.0.0',
  campaignId: 'responsive-component-pilot',
  sourceBaseline: {
    gitHead: objectId,
    worktreeTree: objectId,
    backupRef: 'refs/codex/backups/responsive-component-pilot',
    capturedAt: '2026-08-25T12:00:00.000Z',
  },
  workflow: {
    mode: 'single-component',
    subjectKind: 'organism',
    evidenceRoot: 'proofs/responsive-component-pilot',
    ownerDecisionRoot: 'proofs/responsive-component-pilot/decisions',
    comparisonPath: 'proofs/responsive-component-pilot/comparison.json',
    applyReceiptPaths: {
      first: 'proofs/responsive-component-pilot/apply-first.json',
      second: 'proofs/responsive-component-pilot/apply-second.json',
    },
    pageMutationPolicy: 'forbid-direct',
    directDependencies: ['shared-button'],
    sharedDependencies: [],
  },
  filePin: { fileKey: 'responsive-file-key', versionId: '123456', capturedAt: '2026-08-25T12:00:00.000Z' },
  authorityRefs: ['proofs/responsive-component-pilot/owner-h2.json'],
  targets: [{
    targetId: 'responsive-component',
    kind: 'generated-master',
    masterNodeId: '1:1',
    reference: {
      referenceId: 'responsive-component-wide',
      sourceKind: 'current-owner-approved',
      subjectNodeId: '1:1',
      visualFacts: ['historical Wide member'],
      decisionRef: 'proofs/responsive-component-pilot/owner-h2.json',
    },
    affectedSurfaceIds: ['card:master', 'card:page', 'card:page-context'],
    projectionDefectIds: ['responsive-component-set'],
    allowedFields: ['componentSetTopology', 'boundVariables', 'fontSize', 'lineHeight', 'textAlignHorizontal'],
    protectedFacts: [
      ...REQUIRED_COMPONENT_PROTECTION_FACTS.filter((fact) => !['variant-cardinality', 'variant-names'].includes(fact)),
      'component-set-topology',
      'historical-member-identity',
      'component-properties',
      'primitive-bindings',
      'temporary-typography',
      'shared-child-facts',
    ],
    allowedFactChanges: ['variant-cardinality', 'variant-names', 'geometry'],
    expectedMasterName: 'Card',
    expectedVariantNames: [],
    responsiveWidths: [320, 390, 834, 1200, 1440, 1728],
    responsive: {
      componentSetTopology: {
        propertyName: 'Presentation',
        setName: 'Card',
        setIdentityPolicy: 'additive',
        defaultPresentationValue: 'Wide',
        authoringLayout: { direction: 'VERTICAL', gap: 48, order: ['Wide', 'Compact', 'Desktop'] },
        historicalMember: {
          presentationValue: 'Wide',
          nodeId: '1:1',
          componentKey: 'historical-key',
          declaredName: 'Presentation=Wide',
          authoringPreviewWidth: 1728,
        },
        createdMembers: [
          { presentationValue: 'Compact', declaredName: 'Presentation=Compact', sourcePresentationValue: 'Wide', authoringPreviewWidth: 390 },
          { presentationValue: 'Desktop', declaredName: 'Presentation=Desktop', sourcePresentationValue: 'Wide', authoringPreviewWidth: 1200 },
        ],
        expectedMemberNames: ['Presentation=Compact', 'Presentation=Desktop', 'Presentation=Wide'],
      },
      expectedCreates: [
        { role: 'component-set', operationId: 'install-responsive', count: 1, declaredName: 'Card' },
        { role: 'presentation-compact', operationId: 'install-responsive', count: 1, declaredName: 'Presentation=Compact', presentationValue: 'Compact' },
        { role: 'presentation-desktop', operationId: 'install-responsive', count: 1, declaredName: 'Presentation=Desktop', presentationValue: 'Desktop' },
      ],
      contentFixtures: [
        { fixtureId: 'default', textValues: {} },
        { fixtureId: 'long-title', textValues: { '0/0': 'A deliberately long title used only in the proof instance' } },
        { fixtureId: 'long-cta', textValues: { '0/1': 'A deliberately long call to action' } },
        { fixtureId: 'short-landscape', textValues: {} },
      ],
      presentationScenarios: expectedPresentationScenarios,
      presentationLayouts: [
        { presentationValue: 'Compact', nodePath: '', properties: { layoutMode: 'VERTICAL', layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'HUG', primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER', clipsContent: false } },
        { presentationValue: 'Desktop', nodePath: '', properties: { layoutMode: 'VERTICAL', layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'HUG', primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER', clipsContent: false } },
        { presentationValue: 'Wide', nodePath: '', properties: { layoutMode: 'HORIZONTAL', layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED', primaryAxisAlignItems: 'MAX', counterAxisAlignItems: 'MIN', clipsContent: false } },
      ],
      primitiveBindings: [
        { presentationValue: 'Compact', nodePath: '', property: 'itemSpacing', variableId: 'VariableID:1:10', variableName: 'space/24', resolvedValue: 24 },
        { presentationValue: 'Desktop', nodePath: '', property: 'paddingLeft', variableId: 'VariableID:1:11', variableName: 'space/48', resolvedValue: 48 },
        { presentationValue: 'Wide', nodePath: '', property: 'height', variableId: 'VariableID:1:12', variableName: 'size/720', resolvedValue: 720 },
      ],
      typographyOverrides: [
        {
          presentationValue: 'Compact', nodePath: '0/0', sourceRole: 'Title', sourceTextStyleId: 'S:title',
          allowedFields: ['fontSize', 'lineHeight', 'textAlignHorizontal'],
          before: { fontSize: 44, lineHeight: 48, textAlignHorizontal: 'LEFT' },
          after: { fontSize: 32, lineHeight: 40, textAlignHorizontal: 'CENTER' },
          family: 'Montserrat', weight: 400, characters: 'Default title',
          debtStatus: 'pending-responsive-text-style', ownerDecisionRef: 'proofs/responsive-component-pilot/owner-h2.json',
        },
      ],
    },
  }],
  affectedSurfaces: [
    { surfaceId: 'card:master', targetId: 'responsive-component', role: 'master', nodeId: '1:1', pageComposition: null, structuralPath: '0', expectedSize: { width: 1728, height: 720 }, impactStatus: 'pending' },
    { surfaceId: 'card:page', targetId: 'responsive-component', role: 'page-instance', nodeId: '2:1', pageComposition: 'Page', structuralPath: '0', expectedSize: { width: 1728, height: 720 }, impactStatus: 'pending' },
    { surfaceId: 'card:page-context', targetId: 'responsive-component', role: 'page-context', nodeId: '2:2', pageComposition: 'Page', structuralPath: '0', contextForSurfaceId: 'card:page', expectedSize: { width: 1728, height: 1080 }, impactStatus: 'pending' },
  ],
  consumerImpacts: [],
  writeBoundary: {
    allowedExistingNodeIds: ['1:0', '1:1'],
    readOnlySurfaceNodeIds: ['2:1', '2:2'],
    protectedDependencyNodeIds: ['3:1'],
    protectedChildNodeIds: ['1:2'],
    protectedChildPaths: ['0'],
    allowedCreateRoles: ['component-set', 'presentation-compact', 'presentation-desktop'],
    pageWrites: [],
    childWrites: [],
  },
  allowedOperations: [{
    operationId: 'install-responsive',
    targetId: 'responsive-component',
    mechanism: 'responsive-component-set',
    nodeId: '1:1',
    structuralPath: '0',
    preconditions: [{ field: 'nodeId', equals: '1:1' }],
    changes: { capability: 'responsive-component-set' },
    expectedPostconditions: [{ field: 'memberNames', equals: ['Presentation=Compact', 'Presentation=Desktop', 'Presentation=Wide'] }],
  }],
  captureSets: {
    before: {
      captureSetId: 'before', phase: 'before', fileVersionId: '123456', artifacts,
      imageFingerprints: [], instanceLinks: [], complete: true,
    },
  },
  state: 'ready-to-apply',
  createdAt: '2026-08-25T12:00:00.000Z',
} as const;

export const expectedScenarioResults = expectedPresentationScenarios.map((scenario) => ({
  scenarioId: scenario.scenarioId,
  selectedPresentation: scenario.presentationValue,
  width: scenario.width,
  height: scenario.height,
  fixtureId: scenario.fixtureId,
  rootBounds: { x: 0, y: 0, width: scenario.width, height: scenario.height },
  descendantBounds: [{ nodeId: '9:1', x: 0, y: 0, width: Math.min(400, scenario.width), height: 100 }],
  overflow: false,
  clippedBy: [],
  contentAccessible: true,
  posterCoverage: 'cover',
  captureRef: `proofs/${scenario.scenarioId}.png`,
}));

export const expectedBindingFacts = responsiveCampaign.targets[0].responsive.primitiveBindings.map((binding) => ({
  ...binding,
  boundVariableId: binding.variableId,
  status: 'attached' as const,
}));

export const expectedTypographyFacts = responsiveCampaign.targets[0].responsive.typographyOverrides.map((override) => ({
  presentationValue: override.presentationValue,
  nodePath: override.nodePath,
  sourceRole: override.sourceRole,
  sourceTextStyleId: override.sourceTextStyleId,
  appliedFields: override.after,
  family: override.family,
  weight: override.weight,
  characters: override.characters,
  debtStatus: override.debtStatus,
  status: 'allowlisted' as const,
}));

const commonMemberFacts = {
  namesAndRoles: [{ structuralPath: '0', type: 'TEXT', name: 'Title' }, { structuralPath: '1', type: 'INSTANCE', name: 'Action' }],
  media: [{ structuralPath: '2', field: 'fills', index: 0, paint: { type: 'IMAGE', imageHash: 'poster', scaleMode: 'FILL' } }],
  texts: [{ structuralPath: '0', name: 'Title', characters: 'Default title' }],
  componentProperties: [],
  sharedChildren: [{ structuralPath: '1', componentId: '3:1', componentProperties: { Label: { type: 'TEXT', value: 'Action' } } }],
};

const authoringPreviewWidths: Record<string, number> = { Compact: 390, Desktop: 1200, Wide: 1728 };
export const expectedMemberFacts = ['Compact', 'Desktop', 'Wide'].map((presentationValue) => ({
  targetId: 'responsive-component',
  presentationValue,
  authoringPreview: { width: authoringPreviewWidths[presentationValue], layoutSizingHorizontal: 'FIXED' },
  ...structuredClone(commonMemberFacts),
}));

export function bridgeEnvelope(run: 'first' | 'second') {
  const first = run === 'first';
  return {
    schemaVersion: '1.0.0', campaignId: responsiveCampaign.campaignId,
    fileKey: responsiveCampaign.filePin.fileKey, fileVersionId: responsiveCampaign.filePin.versionId, run,
    scriptResults: [{
      operationId: 'install-responsive', targetId: 'responsive-component', nodeId: '1:1',
      result: first ? {
        applied: true,
        createdNodeIds: ['9:10', '9:11', '9:12'],
        createdNodes: [
          { nodeId: '9:10', role: 'component-set', declaredName: 'Card' },
          { nodeId: '9:11', role: 'presentation-compact', declaredName: 'Presentation=Compact', presentationValue: 'Compact' },
          { nodeId: '9:12', role: 'presentation-desktop', declaredName: 'Presentation=Desktop', presentationValue: 'Desktop' },
        ],
        changedNodeIds: ['1:0', '1:1'],
      } : { skipped: true, reason: 'unchanged', createdNodeIds: [], createdNodes: [], changedNodeIds: [] },
    }],
    inspection: {
      masters: [{
        targetId: 'responsive-component', nodeId: '1:1', componentKey: 'historical-key', masterCount: 1,
        setNodeId: '9:10', setName: 'Card', propertyName: 'Presentation',
        defaultPresentationValue: 'Wide',
        variantNames: ['Presentation=Compact', 'Presentation=Desktop', 'Presentation=Wide'],
      }],
      pageWrites: [], childWrites: [],
      responsiveChecks: [],
      scenarioChecks: expectedScenarioResults,
      bindingFacts: expectedBindingFacts,
      typographyFacts: expectedTypographyFacts,
      memberFacts: expectedMemberFacts,
    },
  };
}

export function createResponsiveFigmaMock() {
  let serial = 10;
  const nextId = () => `9:${serial++}`;
  const detach = (node: any) => {
    if (node.parent?.children) node.parent.children = node.parent.children.filter((child: any) => child !== node);
    node.parent = null;
  };
  const attach = (parent: any, node: any, index = parent.children.length) => {
    detach(node);
    parent.children.splice(index, 0, node);
    node.parent = parent;
    if (node.layoutSizingHorizontal === 'FILL' && typeof node.resize === 'function') node.resize(parent.width, node.height);
  };
  const descendants = (node: any): any[] => (node.children ?? []).flatMap((child: any) => [child, ...descendants(child)]);
  const pluginData = (node: any) => {
    node._pluginData ??= {};
    node.getSharedPluginData = (namespace: string, key: string) => node._pluginData[`${namespace}/${key}`] ?? '';
    node.setSharedPluginData = (namespace: string, key: string, value: string) => { node._pluginData[`${namespace}/${key}`] = value; };
    return node;
  };
  const withBounds = (node: any) => {
    Object.defineProperty(node, 'absoluteBoundingBox', {
      configurable: true,
      get() {
        const parent = this.parent?.absoluteBoundingBox ?? { x: 0, y: 0 };
        return { x: parent.x + (this.x ?? 0), y: parent.y + (this.y ?? 0), width: this.width, height: this.height };
      },
    });
    return node;
  };
  const decorate = (node: any): any => {
    node.children ??= [];
    node.x ??= 0; node.y ??= 0; node.width ??= 100; node.height ??= 100;
    node.visible ??= true;
    pluginData(withBounds(node));
    node.findAll = (test: (candidate: any) => boolean) => descendants(node).filter(test);
    node.resize = (width: number, height: number) => {
      node.width = width; node.height = height;
      for (const child of node.children) if (child.layoutSizingHorizontal === 'FILL') child.resize(width, child.height);
    };
    node.appendChild = (child: any) => attach(node, child);
    node.insertChild = (index: number, child: any) => attach(node, child, index);
    node.remove = () => detach(node);
    node.exportAsync = async () => new Uint8Array([137, 80, 78, 71]);
    return node;
  };
  const cloneNode = (source: any, rootType = source.type): any => {
    const clone: any = decorate({
      ...Object.fromEntries(Object.entries(source).filter(([key, value]) =>
        !['id', 'parent', 'children', 'findAll', 'clone', 'createInstance', 'appendChild', 'insertChild', 'remove', 'resize', 'exportAsync', 'getSharedPluginData', 'setSharedPluginData', '_pluginData'].includes(key) && typeof value !== 'function')),
      id: nextId(), type: rootType, parent: null, children: [], _pluginData: { ...(source._pluginData ?? {}) },
      boundVariables: structuredClone(source.boundVariables ?? {}),
    });
    for (const child of source.children ?? []) attach(clone, cloneNode(child));
    if (clone.type === 'TEXT') {
      clone.getRangeAllFontNames = () => [clone.fontName];
    }
    if (clone.type === 'COMPONENT') {
      clone.key = `created-key-${clone.id}`;
      clone.clone = () => {
        const copy = cloneNode(clone);
        if (clone.parent) attach(clone.parent, copy, clone.parent.children.indexOf(clone) + 1);
        return copy;
      };
      clone.createInstance = () => cloneNode(clone, 'INSTANCE');
      clone.setBoundVariable = (field: string, variable: any) => { clone.boundVariables[field] = { id: variable.id }; };
    }
    return clone;
  };

  const page: any = decorate({ id: '0:1', type: 'PAGE', name: 'DS', parent: null, children: [], width: 2000, height: 1200 });
  const homePage: any = decorate({ id: '2:2', type: 'PAGE', name: 'Pages', parent: null, children: [], width: 2000, height: 1200 });
  const container: any = decorate({
    id: '1:0', type: 'FRAME', name: 'Container', parent: page, children: [], width: 1728, height: 720,
    layoutMode: 'VERTICAL', primaryAxisSizingMode: 'FIXED', counterAxisSizingMode: 'AUTO', fills: [], clipsContent: false,
  });
  const historical: any = decorate({
    id: '1:1', type: 'COMPONENT', name: 'Card', key: 'historical-key', parent: container, children: [], width: 1728, height: 720,
    layoutMode: 'HORIZONTAL', layoutSizingHorizontal: 'FILL', layoutSizingVertical: 'FIXED', primaryAxisAlignItems: 'MAX',
    counterAxisAlignItems: 'MIN', clipsContent: false, itemSpacing: 24, paddingLeft: 48, boundVariables: {}, componentPropertyDefinitions: {},
  });
  historical.boundVariables = { size: { y: { id: 'VariableID:1:12' } } };
  historical.setBoundVariable = (field: string, variable: any) => {
    if (field === 'height') historical.boundVariables.size = { ...(historical.boundVariables.size ?? {}), y: { id: variable.id } };
    else historical.boundVariables[field] = { id: variable.id };
  };
  historical.clone = () => {
    const copy = cloneNode(historical);
    attach(container, copy, container.children.indexOf(historical) + 1);
    return copy;
  };
  historical.createInstance = () => cloneNode(historical, 'INSTANCE');
  const content: any = decorate({ id: '1:3', type: 'FRAME', name: 'Content', parent: historical, children: [], width: 500, height: 200, layoutMode: 'VERTICAL', layoutSizingHorizontal: 'FILL', clipsContent: false });
  const title: any = decorate({
    id: '1:4', type: 'TEXT', name: 'Title', parent: content, children: [], width: 400, height: 60, layoutSizingHorizontal: 'FILL',
    characters: 'Default title', textStyleId: 'S:title', fontName: { family: 'Montserrat', style: 'Regular' }, fontWeight: 400,
    fontSize: 44, lineHeight: { unit: 'PIXELS', value: 48 }, textAlignHorizontal: 'LEFT', textAutoResize: 'NONE',
  });
  title.getRangeAllFontNames = () => [title.fontName];
  const cta: any = decorate({
    id: '1:5', type: 'TEXT', name: 'Action', parent: content, children: [], width: 300, height: 40,
    characters: 'Action', textStyleId: 'S:button', fontName: { family: 'Montserrat', style: 'Medium' }, fontWeight: 500,
    fontSize: 16, lineHeight: { unit: 'PIXELS', value: 22 }, textAlignHorizontal: 'LEFT',
  });
  cta.getRangeAllFontNames = () => [cta.fontName];
  const poster: any = decorate({ id: '1:6', type: 'RECTANGLE', name: 'Poster', parent: historical, children: [], width: 1728, height: 720, layoutSizingHorizontal: 'FILL', fills: [{ type: 'IMAGE', imageHash: 'poster', scaleMode: 'FILL' }] });
  attach(content, title); attach(content, cta); attach(historical, content); attach(historical, poster); attach(container, historical); attach(page, container);
  const homeInstance: any = historical.createInstance();
  homeInstance.id = '2:1';
  homeInstance.name = 'Card · Home witness';
  homeInstance.mainComponent = historical;
  homeInstance.componentProperties = {
    'Title#1:4': { type: 'TEXT', value: 'Home-specific title' },
    'Action#1:5': { type: 'TEXT', value: 'Home-specific action' },
  };
  homeInstance.overrides = [{ id: '2:1;1:4', overriddenFields: ['characters'] }];
  attach(homePage, homeInstance);

  const figma: any = {
    fileKey: responsiveCampaign.filePin.fileKey,
    root: { children: [page, homePage] },
    currentPage: page,
    variables: {
      async getVariableByIdAsync(id: string) {
        const names: Record<string, string> = { 'VariableID:1:10': 'space/24', 'VariableID:1:11': 'space/48', 'VariableID:1:12': 'size/720' };
        return names[id] ? { id, name: names[id] } : null;
      },
    },
    async loadAllPagesAsync() {},
    async loadFontAsync() {},
    async getNodeByIdAsync(id: string) {
      return [page, homePage, ...descendants(page), ...descendants(homePage)].find((node: any) => node.id === id) ?? null;
    },
    createFrame() {
      const frame = decorate({
        id: nextId(), type: 'FRAME', name: 'Frame', parent: null, children: [], width: 100, height: 100,
        layoutMode: 'NONE', layoutSizingHorizontal: 'FIXED', primaryAxisSizingMode: 'FIXED', counterAxisSizingMode: 'FIXED',
        fills: [], clipsContent: false,
      });
      attach(page, frame);
      return frame;
    },
    combineAsVariants(components: any[], host: any) {
      const firstIndex = Math.min(...components.map((component) => component.parent === host ? host.children.indexOf(component) : host.children.length));
      const presentationValues = components.map((component) => String(component.name).split('=')[1]);
      const set = decorate({
        id: nextId(), type: 'COMPONENT_SET', name: 'Component Set', parent: null, children: [], width: 1728, height: 720,
        layoutMode: 'NONE', primaryAxisSizingMode: 'FIXED', counterAxisSizingMode: 'FIXED',
        primaryAxisAlignItems: 'MIN', counterAxisAlignItems: 'MIN', layoutSizingHorizontal: 'FIXED',
        paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, itemSpacing: 0,
        componentPropertyDefinitions: { Presentation: { type: 'VARIANT', defaultValue: presentationValues[0], variantOptions: presentationValues } },
      });
      for (const component of components) attach(set, component);
      for (const component of components) {
        let y = component.y;
        Object.defineProperty(component, 'y', {
          configurable: true,
          get: () => y,
          set(value) {
            y = value;
            const top = [...set.children].sort((left, right) => left.y - right.y)[0];
            set.componentPropertyDefinitions.Presentation.defaultValue = String(top.name).split('=')[1];
          },
        });
      }
      for (const component of components) {
        delete component.componentPropertyDefinitions;
        Object.defineProperty(component, 'componentPropertyDefinitions', {
          configurable: true,
          get() { throw new Error('Can only get component property definitions of a component set or non-variant component'); },
        });
      }
      // Native combineAsVariants detaches the historical dimension binding and
      // temporarily makes the preserved member fill the set's primary axis.
      const historicalMember = components.find((component) => component.id === '1:1');
      if (historicalMember) {
        historicalMember.boundVariables = {};
        historicalMember.layoutSizingVertical = 'FILL';
        historicalMember.height = 370;
      }
      // Mirror the native Plugin API constraint that exposed the live gap:
      // FILL is invalid until the member's parent component set owns auto-layout.
      for (const component of components) {
        let sizing = component.layoutSizingHorizontal;
        Object.defineProperty(component, 'layoutSizingHorizontal', {
          configurable: true,
          get: () => sizing,
          set(value) {
            if (value === 'FILL' && component.parent?.layoutMode === 'NONE') {
              throw new Error('FILL can only be set on children of auto-layout frames');
            }
            sizing = value;
          },
        });
      }
      attach(host, set, firstIndex);
      return set;
    },
    base64Encode(bytes: Uint8Array) { return Buffer.from(bytes).toString('base64'); },
  };
  return { figma, historical, page, homePage, homeInstance };
}
