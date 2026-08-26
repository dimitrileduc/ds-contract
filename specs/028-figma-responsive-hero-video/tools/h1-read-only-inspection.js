// Phase 3 / H1 instrument: read current HeroVideo facts and local FLOAT variables.
// This script runs inside the Figma Desktop Bridge and is strictly read-only.
await figma.loadAllPagesAsync();

  const ids = {
    master: '2151:5552',
    container: '2448:4731',
    home: '2170:6351',
    header: '210:473',
    button: '6:135',
  };

  const requiredNodes = {};
  for (const [role, id] of Object.entries(ids)) {
    const node = await figma.getNodeByIdAsync(id);
    if (!node) throw new Error(`H1 read-only inspection: missing ${role} node ${id}`);
    requiredNodes[role] = node;
  }

  const serial = (value) => {
    if (typeof value === 'symbol') return 'mixed';
    if (value === undefined) return null;
    return value;
  };

  const bounds = (node) => node.absoluteBoundingBox
    ? {
        x: node.absoluteBoundingBox.x,
        y: node.absoluteBoundingBox.y,
        width: node.absoluteBoundingBox.width,
        height: node.absoluteBoundingBox.height,
      }
    : null;

  const paints = (node) => {
    const rows = [];
    for (const field of ['fills', 'strokes']) {
      const value = node[field];
      if (!Array.isArray(value)) continue;
      value.forEach((paint, index) => {
        if (!paint || typeof paint !== 'object') return;
        if (paint.type === 'IMAGE') {
          rows.push({
            field,
            index,
            type: paint.type,
            imageHash: paint.imageHash || null,
            scaleMode: paint.scaleMode || null,
            imageTransform: paint.imageTransform || null,
          });
        } else if (String(paint.type || '').startsWith('GRADIENT_')) {
          rows.push({
            field,
            index,
            type: paint.type,
            gradientStops: paint.gradientStops || [],
            gradientTransform: paint.gradientTransform || null,
          });
        }
      });
    }
    return rows;
  };

  const textStyle = async (node) => {
    if (node.type !== 'TEXT') return null;
    const raw = node.characters.length > 0
      ? node.getRangeTextStyleId(0, node.characters.length)
      : node.textStyleId;
    const id = typeof raw === 'string' ? raw : null;
    const style = id ? await figma.getStyleByIdAsync(id) : null;
    return {
      characters: node.characters,
      textStyleId: id,
      textStyleName: style && style.type === 'TEXT' ? style.name : null,
      fontName: serial(node.fontName),
      fontSize: serial(node.fontSize),
      lineHeight: serial(node.lineHeight),
      textAlignHorizontal: serial(node.textAlignHorizontal),
    };
  };

  const walk = async (root) => {
    const rows = [];
    const visit = async (node, path) => {
      let mainComponent = null;
      if (node.type === 'INSTANCE') {
        const main = await node.getMainComponentAsync();
        mainComponent = main ? { id: main.id, key: main.key || null, name: main.name } : null;
      }
      rows.push({
        path,
        id: node.id,
        name: node.name,
        type: node.type,
        bounds: bounds(node),
        visible: node.visible,
        layoutMode: serial(node.layoutMode),
        layoutSizingHorizontal: serial(node.layoutSizingHorizontal),
        layoutSizingVertical: serial(node.layoutSizingVertical),
        primaryAxisAlignItems: serial(node.primaryAxisAlignItems),
        counterAxisAlignItems: serial(node.counterAxisAlignItems),
        itemSpacing: serial(node.itemSpacing),
        paddingTop: serial(node.paddingTop),
        paddingRight: serial(node.paddingRight),
        paddingBottom: serial(node.paddingBottom),
        paddingLeft: serial(node.paddingLeft),
        clipsContent: serial(node.clipsContent),
        boundVariables: serial(node.boundVariables),
        componentProperties: serial(node.componentProperties),
        componentPropertyDefinitions: serial(node.componentPropertyDefinitions),
        mainComponent,
        paints: paints(node),
        text: await textStyle(node),
      });
      if ('children' in node) {
        for (let index = 0; index < node.children.length; index += 1) {
          const childPath = path === '' ? String(index) : `${path}/${index}`;
          await visit(node.children[index], childPath);
        }
      }
    };
    await visit(root, '');
    return rows;
  };

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const collectionsById = Object.fromEntries(collections.map((collection) => [
    collection.id,
    {
      id: collection.id,
      name: collection.name,
      modes: collection.modes.map((mode) => ({ modeId: mode.modeId, name: mode.name })),
      defaultModeId: collection.defaultModeId,
      hiddenFromPublishing: collection.hiddenFromPublishing,
    },
  ]));
  const floatVariables = await figma.variables.getLocalVariablesAsync('FLOAT');
  const compatibleScopes = new Set(['ALL_SCOPES', 'GAP', 'WIDTH_HEIGHT']);
  const primitives = floatVariables
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
      },
    }))
    .sort((left, right) => `${left.collection?.name || ''}/${left.name}`.localeCompare(`${right.collection?.name || ''}/${right.name}`));

  const master = requiredNodes.master;
  const home = requiredNodes.home;
  const homeMain = home.type === 'INSTANCE' ? await home.getMainComponentAsync() : null;

return {
    schemaVersion: '1.0.0',
    run: 'h1-read-only-inspection',
    fileKey: figma.fileKey,
    fileName: figma.root.name,
    inspectedAt: new Date().toISOString(),
    figmaWrites: [],
    pageWrites: [],
    identities: {
      master: { id: master.id, name: master.name, type: master.type, key: master.key || null, bounds: bounds(master) },
      container: { id: requiredNodes.container.id, name: requiredNodes.container.name, type: requiredNodes.container.type, bounds: bounds(requiredNodes.container) },
      home: { id: home.id, name: home.name, type: home.type, mainComponentId: homeMain ? homeMain.id : null, bounds: bounds(home) },
      header: { id: requiredNodes.header.id, name: requiredNodes.header.name, type: requiredNodes.header.type, bounds: bounds(requiredNodes.header) },
      button: { id: requiredNodes.button.id, name: requiredNodes.button.name, type: requiredNodes.button.type, key: requiredNodes.button.key || null, bounds: bounds(requiredNodes.button) },
    },
    trees: {
      master: await walk(master),
      home: await walk(home),
    },
    primitives: {
      restVariablesEndpoint: 'unavailable-403-or-404',
      transport: 'Figma Plugin API read-only via Desktop Bridge',
      localFloatVariableCount: floatVariables.length,
      compatiblePrimitiveCount: primitives.length,
      values: primitives,
    },
    scriptResults: [{ operationId: 'h1-read-only-inspection', status: 'inspected' }],
};
