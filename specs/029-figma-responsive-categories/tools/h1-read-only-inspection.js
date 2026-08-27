// H1 instrument for 029. Runs inside the Figma Desktop Bridge and performs
// reads/exports only: no node, variable, style, property, Page or master write.
await figma.loadAllPagesAsync();

const ids = {
  sectionSet: '2115:4277',
  sectionMembers: ['2115:4273', '2115:4274', '2115:4275', '2495:7122'],
  cardSet: '2495:6770',
  cardMembers: ['2495:6762', '2495:6763'],
  legacyCard: '2063:1611',
  page: '210:325',
  usages: [
    '2115:4392', '2115:4278', '2115:4438', '2115:4297',
    '2115:4411', '2115:4324', '2115:4364',
  ],
};

const get = async (id, role) => {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`H1 read-only inspection: missing ${role} ${id}`);
  return node;
};

const sectionSet = await get(ids.sectionSet, 'section set');
const cardSet = await get(ids.cardSet, 'card set');
const legacyCard = await get(ids.legacyCard, 'legacy standalone card');
const page = await get(ids.page, 'Pages canvas');
const sectionMembers = await Promise.all(ids.sectionMembers.map((id) => get(id, 'section member')));
const cardMembers = await Promise.all(ids.cardMembers.map((id) => get(id, 'card member')));
const usages = await Promise.all(ids.usages.map((id) => get(id, 'Page usage')));

const plain = (value) => typeof value === 'symbol' ? 'mixed' : value === undefined ? null : value;
const bounds = (node) => node.absoluteBoundingBox ? {
  x: node.absoluteBoundingBox.x,
  y: node.absoluteBoundingBox.y,
  width: node.absoluteBoundingBox.width,
  height: node.absoluteBoundingBox.height,
} : null;

const ancestors = (node) => {
  const rows = [];
  let current = node.parent;
  while (current && current.type !== 'DOCUMENT') {
    rows.push({ id: current.id, name: current.name, type: current.type });
    current = current.parent;
  }
  return rows;
};

const paints = (node) => {
  const rows = [];
  for (const field of ['fills', 'strokes']) {
    const value = node[field];
    if (!Array.isArray(value)) continue;
    value.forEach((paint, index) => {
      if (!paint || typeof paint !== 'object') return;
      if (paint.type === 'IMAGE') rows.push({
        field, index, type: paint.type,
        imageHash: paint.imageHash || null,
        scaleMode: paint.scaleMode || null,
        imageTransform: paint.imageTransform || null,
      });
      if (String(paint.type || '').startsWith('GRADIENT_')) rows.push({
        field, index, type: paint.type,
        gradientStops: paint.gradientStops || [],
        gradientTransform: paint.gradientTransform || null,
      });
    });
  }
  return rows;
};

const textFact = async (node) => {
  if (node.type !== 'TEXT') return null;
  const rawStyleId = node.characters.length > 0
    ? node.getRangeTextStyleId(0, node.characters.length)
    : node.textStyleId;
  const textStyleId = typeof rawStyleId === 'string' ? rawStyleId : null;
  const textStyle = textStyleId ? await figma.getStyleByIdAsync(textStyleId) : null;
  return {
    characters: node.characters,
    textStyleId,
    textStyleName: textStyle && textStyle.type === 'TEXT' ? textStyle.name : null,
    fontName: plain(node.fontName),
    fontSize: plain(node.fontSize),
    fontWeight: plain(node.fontWeight),
    lineHeight: plain(node.lineHeight),
    textAlignHorizontal: plain(node.textAlignHorizontal),
    textAutoResize: plain(node.textAutoResize),
    characterStyleOverrides: plain(node.characterStyleOverrides),
    styleOverrideTable: plain(node.styleOverrideTable),
  };
};

const nodeFact = async (node, path) => {
  let mainComponent = null;
  if (node.type === 'INSTANCE') {
    const main = await node.getMainComponentAsync();
    mainComponent = main ? {
      id: main.id,
      key: main.key || null,
      name: main.name,
      parentSetId: main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent.id : null,
    } : null;
  }
  return {
    path,
    id: node.id,
    key: 'key' in node ? node.key || null : null,
    name: node.name,
    type: node.type,
    bounds: bounds(node),
    visible: node.visible,
    layoutMode: plain(node.layoutMode),
    layoutWrap: plain(node.layoutWrap),
    layoutSizingHorizontal: plain(node.layoutSizingHorizontal),
    layoutSizingVertical: plain(node.layoutSizingVertical),
    primaryAxisAlignItems: plain(node.primaryAxisAlignItems),
    counterAxisAlignItems: plain(node.counterAxisAlignItems),
    itemSpacing: plain(node.itemSpacing),
    counterAxisSpacing: plain(node.counterAxisSpacing),
    paddingTop: plain(node.paddingTop),
    paddingRight: plain(node.paddingRight),
    paddingBottom: plain(node.paddingBottom),
    paddingLeft: plain(node.paddingLeft),
    minWidth: plain(node.minWidth),
    maxWidth: plain(node.maxWidth),
    minHeight: plain(node.minHeight),
    maxHeight: plain(node.maxHeight),
    clipsContent: plain(node.clipsContent),
    boundVariables: plain(node.boundVariables),
    variantProperties: plain(node.variantProperties),
    componentProperties: plain(node.componentProperties),
    componentPropertyDefinitions: (node.type === 'COMPONENT_SET' ||
      (node.type === 'COMPONENT' && (!node.parent || node.parent.type !== 'COMPONENT_SET')))
      ? plain(node.componentPropertyDefinitions) : null,
    overrides: plain(node.overrides),
    mainComponent,
    paints: paints(node),
    text: await textFact(node),
  };
};

const walk = async (root) => {
  const rows = [];
  const visit = async (node, path) => {
    rows.push(await nodeFact(node, path));
    if ('children' in node) {
      for (let index = 0; index < node.children.length; index += 1) {
        await visit(node.children[index], path === '' ? String(index) : `${path}/${index}`);
      }
    }
  };
  await visit(root, '');
  return rows;
};

const memberIdentity = (node) => ({
  id: node.id,
  key: node.key || null,
  name: node.name,
  type: node.type,
  bounds: bounds(node),
  variantProperties: plain(node.variantProperties),
  componentPropertyDefinitions: (node.type === 'COMPONENT_SET' ||
    (node.type === 'COMPONENT' && (!node.parent || node.parent.type !== 'COMPONENT_SET')))
    ? plain(node.componentPropertyDefinitions) : null,
});

const allInstances = figma.root.findAllWithCriteria({ types: ['INSTANCE'] });
const cardMemberIds = new Set(ids.cardMembers);
const cardInstanceRows = [];
const legacyCardInstanceRows = [];
for (const instance of allInstances) {
  const main = await instance.getMainComponentAsync();
  if (main && main.id === legacyCard.id) {
    legacyCardInstanceRows.push({
      instanceNodeId: instance.id,
      mainComponentId: main.id,
      mainComponentKey: main.key || null,
      bounds: bounds(instance),
      ancestors: ancestors(instance),
    });
  }
  if (!main || !cardMemberIds.has(main.id)) continue;
  const chain = ancestors(instance);
  const sourceMember = chain.find((entry) => entry.type === 'COMPONENT' && ids.sectionMembers.includes(entry.id)) || null;
  const pageUsage = chain.find((entry) => entry.type === 'INSTANCE' && ids.usages.includes(entry.id)) || null;
  cardInstanceRows.push({
    instanceNodeId: instance.id,
    mainComponentId: main.id,
    mainComponentKey: main.key || null,
    mainComponentName: main.name,
    bounds: bounds(instance),
    classification: sourceMember ? 'section-source-composer' : pageUsage ? 'page-propagated-instance' : 'other-composer',
    sourceSectionMemberId: sourceMember ? sourceMember.id : null,
    pageUsageId: pageUsage ? pageUsage.id : null,
    ancestors: chain,
  });
}
cardInstanceRows.sort((left, right) => left.instanceNodeId.localeCompare(right.instanceNodeId));

const otherComposerRows = cardInstanceRows.filter((row) => row.classification === 'other-composer');
const sourceComposerRows = cardInstanceRows.filter((row) => row.classification === 'section-source-composer');
const propagatedRows = cardInstanceRows.filter((row) => row.classification === 'page-propagated-instance');
const sourceComposerSetIds = [...new Set(sourceComposerRows.map((row) => ids.sectionSet))];

const usageRows = [];
for (const usage of usages) {
  if (usage.type !== 'INSTANCE') throw new Error(`H1 usage ${usage.id} is not an INSTANCE`);
  const main = await usage.getMainComponentAsync();
  const nestedCards = cardInstanceRows.filter((row) => row.pageUsageId === usage.id);
  usageRows.push({
    instanceNodeId: usage.id,
    pageId: page.id,
    pageName: page.name,
    position: ancestors(usage),
    hostFrame: usage.parent ? { id: usage.parent.id, name: usage.parent.name, type: usage.parent.type, bounds: bounds(usage.parent) } : null,
    mainComponentId: main ? main.id : null,
    mainComponentKey: main ? main.key || null : null,
    mainComponentName: main ? main.name : null,
    configuration: {
      Style: usage.componentProperties?.Style?.value || null,
      Colonnes: usage.componentProperties?.Colonnes?.value || null,
    },
    cardCount: nestedCards.length,
    cardInstanceIds: nestedCards.map((row) => row.instanceNodeId),
    bounds: bounds(usage),
    componentProperties: plain(usage.componentProperties),
    overrides: plain(usage.overrides),
    referenceRenderPath: `specs/029-figma-responsive-categories/proofs/H1-read-only-exports/usage-${usage.id.replace(':', '-')}.png`,
    writePolicy: 'read-only',
  });
}

const dependencyRows = [];
for (const root of [cardSet, sectionSet]) {
  const instances = root.findAllWithCriteria({ types: ['INSTANCE'] });
  const dependencies = new Map();
  for (const instance of instances) {
    const main = await instance.getMainComponentAsync();
    if (!main) continue;
    const parentSet = main.parent && main.parent.type === 'COMPONENT_SET' ? main.parent : null;
    dependencies.set(main.id, {
      componentId: main.id,
      componentKey: main.key || null,
      componentName: main.name,
      componentSetId: parentSet ? parentSet.id : null,
      componentSetName: parentSet ? parentSet.name : null,
      policy: cardMemberIds.has(main.id) ? 'card-target-or-propagated-read-only' : 'protected-read-only',
    });
  }
  dependencyRows.push({ rootId: root.id, values: [...dependencies.values()].sort((a, b) => a.componentId.localeCompare(b.componentId)) });
}

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const collectionsById = Object.fromEntries(collections.map((collection) => [collection.id, {
  id: collection.id,
  name: collection.name,
  modes: collection.modes.map((mode) => ({ modeId: mode.modeId, name: mode.name })),
  defaultModeId: collection.defaultModeId,
  hiddenFromPublishing: collection.hiddenFromPublishing,
}]));
const floats = await figma.variables.getLocalVariablesAsync('FLOAT');
const compatibleScopes = new Set(['ALL_SCOPES', 'GAP', 'WIDTH_HEIGHT', 'FONT_SIZE', 'LINE_HEIGHT']);
const primitives = floats
  .filter((variable) => (variable.scopes || []).some((scope) => compatibleScopes.has(scope)))
  .map((variable) => ({
    id: variable.id,
    key: variable.key,
    name: variable.name,
    variableCollectionId: variable.variableCollectionId,
    collection: collectionsById[variable.variableCollectionId] || null,
    scopes: variable.scopes || [],
    valuesByMode: variable.valuesByMode,
    remote: variable.remote,
    hiddenFromPublishing: variable.hiddenFromPublishing,
    compatibleProperties: {
      gapAndPadding: (variable.scopes || []).some((scope) => scope === 'ALL_SCOPES' || scope === 'GAP'),
      widthHeightAndMinMax: (variable.scopes || []).some((scope) => scope === 'ALL_SCOPES' || scope === 'WIDTH_HEIGHT'),
      fontSize: (variable.scopes || []).some((scope) => scope === 'ALL_SCOPES' || scope === 'FONT_SIZE'),
      lineHeight: (variable.scopes || []).some((scope) => scope === 'ALL_SCOPES' || scope === 'LINE_HEIGHT'),
    },
  }))
  .sort((left, right) => `${left.collection?.name || ''}/${left.name}`.localeCompare(`${right.collection?.name || ''}/${right.name}`));

const exports = [
  ...sectionMembers.map((node) => ({ node, role: 'section-member', path: `specs/029-figma-responsive-categories/proofs/H1-read-only-exports/section-${node.id.replace(':', '-')}.png` })),
  ...cardMembers.map((node) => ({ node, role: 'card-member', path: `specs/029-figma-responsive-categories/proofs/H1-read-only-exports/card-${node.id.replace(':', '-')}.png` })),
  ...usages.map((node) => ({ node, role: 'page-usage', path: `specs/029-figma-responsive-categories/proofs/H1-read-only-exports/usage-${node.id.replace(':', '-')}.png` })),
];
const responsiveImages = [];
const exportManifest = [];
for (const entry of exports) {
  const bytes = await entry.node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
  responsiveImages.push({ path: entry.path, base64: figma.base64Encode(bytes) });
  exportManifest.push({
    nodeId: entry.node.id,
    nodeName: entry.node.name,
    role: entry.role,
    path: entry.path,
    expectedBounds: bounds(entry.node),
    byteLength: bytes.byteLength,
  });
}

return {
  schemaVersion: '1.0.0',
  run: '029-h1-read-only-inspection',
  fileKey: figma.fileKey,
  fileName: figma.root.name,
  inspectedAt: new Date().toISOString(),
  figmaWrites: [],
  pageWrites: [],
  childWrites: [],
  identities: {
    sectionSet: {
      ...memberIdentity(sectionSet),
      componentPropertyDefinitions: plain(sectionSet.componentPropertyDefinitions),
      members: sectionMembers.map(memberIdentity),
    },
    cardSet: {
      ...memberIdentity(cardSet),
      componentPropertyDefinitions: plain(cardSet.componentPropertyDefinitions),
      members: cardMembers.map(memberIdentity),
    },
    legacyCard: memberIdentity(legacyCard),
  },
  cardExclusivity: {
    cardSetId: cardSet.id,
    cardMemberIds: ids.cardMembers,
    totalInstances: cardInstanceRows.length,
    sourceComposerInstanceCount: sourceComposerRows.length,
    pagePropagatedInstanceCount: propagatedRows.length,
    otherComposerInstanceCount: otherComposerRows.length,
    sourceComposerSetIds,
    exclusive: sourceComposerSetIds.length === 1 && sourceComposerSetIds[0] === sectionSet.id && otherComposerRows.length === 0,
    mutableScope: sourceComposerSetIds.length === 1 && sourceComposerSetIds[0] === sectionSet.id && otherComposerRows.length === 0
      ? 'in-scope' : 'out-of-scope/owner-decision',
    legacyCandidate: {
      id: legacyCard.id,
      key: legacyCard.key || null,
      name: legacyCard.name,
      type: legacyCard.type,
      instanceCount: legacyCardInstanceRows.length,
      instances: legacyCardInstanceRows,
      disposition: legacyCardInstanceRows.length === 0
        ? 'historical-orphan-read-only; not the governed card set targeted by 029'
        : 'historical-contradiction-return-to-H1',
    },
    instances: cardInstanceRows,
  },
  usages: usageRows,
  dependencies: dependencyRows,
  trees: {
    sectionSet: await walk(sectionSet),
    cardSet: await walk(cardSet),
  },
  primitives: {
    transport: 'Figma Plugin API read-only via Desktop Bridge',
    localFloatVariableCount: floats.length,
    compatiblePrimitiveCount: primitives.length,
    values: primitives,
  },
  exportManifest,
  responsiveImages,
  scriptResults: [{ operationId: '029-h1-read-only-inspection', status: 'inspected-and-exported' }],
};
