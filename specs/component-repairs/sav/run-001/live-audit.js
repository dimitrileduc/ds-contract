await figma.loadAllPagesAsync();
if (figma.fileKey !== 'd9FYAUcqdcNtsuaMgLefvJ') throw new Error('Wrong Figma file: ' + figma.fileKey);

const MASTER_ID = '2108:3105';
const PAGE_INSTANCE_ID = '2108:3135';
const master = await figma.getNodeByIdAsync(MASTER_ID);
const pageInstance = await figma.getNodeByIdAsync(PAGE_INSTANCE_ID);
if (!master || master.type !== 'COMPONENT') throw new Error('Pinned SAV master absent');
if (!pageInstance || pageInstance.type !== 'INSTANCE') throw new Error('Pinned SAV Page instance absent');

const box = (node) => ({ x: node.x, y: node.y, width: node.width, height: node.height });
const parentFact = (node) => node.parent ? {
  id: node.parent.id,
  name: node.parent.name,
  type: node.parent.type,
  layoutMode: 'layoutMode' in node.parent ? node.parent.layoutMode : null,
} : null;
const pageOf = (node) => {
  let current = node;
  while (current && current.type !== 'PAGE') current = current.parent;
  return current;
};
const imagePaints = (root) => root.findAll((node) => 'fills' in node && Array.isArray(node.fills))
  .flatMap((node) => node.fills
    .map((paint, paintIndex) => ({ nodeId: node.id, nodeName: node.name, paintIndex, paint }))
    .filter((entry) => entry.paint.type === 'IMAGE')
    .map((entry) => ({
      nodeId: entry.nodeId,
      nodeName: entry.nodeName,
      paintIndex: entry.paintIndex,
      imageHash: entry.paint.imageHash ?? null,
      scaleMode: entry.paint.scaleMode,
    })));

const textFacts = async (root) => {
  const facts = [];
  for (const node of root.findAll((child) => child.type === 'TEXT')) {
    const textStyleId = typeof node.textStyleId === 'string' ? node.textStyleId : null;
    const textStyle = textStyleId ? await figma.getStyleByIdAsync(textStyleId) : null;
    const segments = node.getStyledTextSegments([
      'fontName', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textCase',
    ]).map((segment) => ({
      start: segment.start,
      end: segment.end,
      characters: segment.characters,
      fontName: segment.fontName,
      fontSize: segment.fontSize,
      fontWeight: segment.fontWeight,
      lineHeight: segment.lineHeight,
      letterSpacing: segment.letterSpacing,
      textCase: segment.textCase,
    }));
    facts.push({
      id: node.id,
      name: node.name,
      characters: node.characters,
      textStyleId,
      textStyleName: textStyle?.name ?? null,
      componentPropertyReferences: node.componentPropertyReferences ?? {},
      segments,
    });
  }
  return facts;
};

const dependencyFacts = [];
for (const instance of master.findAll((node) => node.type === 'INSTANCE')) {
  const main = await instance.getMainComponentAsync();
  dependencyFacts.push({
    id: instance.id,
    name: instance.name,
    mainComponentId: main?.id ?? null,
    mainComponentName: main?.name ?? null,
    mainParentId: main?.parent?.id ?? null,
    mainParentName: main?.parent?.name ?? null,
    componentProperties: instance.componentProperties,
  });
}

const all = figma.root.children.flatMap((page) => page.findAll(() => true));
const sameNamedMasters = all.filter((node) =>
  (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') && node.name === 'SAV');
const pageInstances = [];
for (const node of all.filter((entry) => entry.type === 'INSTANCE')) {
  const main = await node.getMainComponentAsync();
  if (main?.id !== MASTER_ID) continue;
  pageInstances.push({
    id: node.id,
    page: pageOf(node)?.name ?? null,
    parent: parentFact(node),
    box: box(node),
    horizontal: node.layoutSizingHorizontal,
    vertical: node.layoutSizingVertical,
    componentProperties: node.componentProperties,
  });
}

const responsiveImages = [];
for (const [name, node] of [['master', master], ['page-instance', pageInstance]]) {
  const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
  responsiveImages.push({
    path: 'specs/component-repairs/sav/run-001/audit/sav-' + name + '.png',
    base64: figma.base64Encode(bytes),
  });
}

return {
  run: 'audit',
  scriptResults: [],
  responsiveImages,
  file: { key: figma.fileKey, name: figma.root.name },
  masterCardinality: sameNamedMasters.length,
  master: {
    id: master.id,
    key: master.key,
    name: master.name,
    type: master.type,
    page: pageOf(master)?.name ?? null,
    parent: parentFact(master),
    box: box(master),
    layoutMode: master.layoutMode,
    horizontal: master.layoutSizingHorizontal,
    vertical: master.layoutSizingVertical,
    clipsContent: master.clipsContent,
    children: master.children.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      box: box(node),
      layoutMode: 'layoutMode' in node ? node.layoutMode : null,
      horizontal: 'layoutSizingHorizontal' in node ? node.layoutSizingHorizontal : null,
      vertical: 'layoutSizingVertical' in node ? node.layoutSizingVertical : null,
    })),
    componentPropertyDefinitions: master.componentPropertyDefinitions,
    images: imagePaints(master),
    texts: await textFacts(master),
    dependencies: dependencyFacts,
  },
  pageInstances,
};
