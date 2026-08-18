await figma.loadAllPagesAsync();
if (figma.root.name !== 'Piqueray (Copy)') throw new Error('Wrong Figma file: ' + figma.root.name);

const pageOf = (node) => {
  let current = node;
  while (current && current.type !== 'PAGE') current = current.parent;
  return current;
};
const box = (node) => ({ x: node.x, y: node.y, width: node.width, height: node.height });
const componentLike = (node) => node.type === 'COMPONENT' || node.type === 'COMPONENT_SET';
const all = [];
for (const page of figma.root.children) all.push(...page.findAll(() => true));
const named = (name) => all.filter((node) => componentLike(node) && node.name === name);
const master = await figma.getNodeByIdAsync('2115:3947');
if (!master || !componentLike(master)) throw new Error('Pinned Equipe master absent');

const textFacts = (root) => root.findAll((node) => node.type === 'TEXT').map((node) => ({
  id: node.id,
  name: node.name,
  characters: node.characters,
  textStyleId: typeof node.textStyleId === 'string' ? node.textStyleId : 'mixed',
  fontName: node.fontName === figma.mixed ? 'mixed' : node.fontName,
  fontSize: node.fontSize === figma.mixed ? 'mixed' : node.fontSize,
  fontWeight: node.fontWeight === figma.mixed ? 'mixed' : node.fontWeight,
  lineHeight: node.lineHeight === figma.mixed ? 'mixed' : node.lineHeight,
}));
const instanceFacts = async (root) => {
  const facts = [];
  for (const node of root.findAll((child) => child.type === 'INSTANCE')) {
    const main = await node.getMainComponentAsync();
    facts.push({
      id: node.id,
      name: node.name,
      mainComponentId: main?.id ?? null,
      box: box(node),
      horizontal: node.layoutSizingHorizontal,
      vertical: node.layoutSizingVertical,
      constrainProportions: node.constrainProportions,
      componentProperties: node.componentProperties,
      imagePaints: node.findAll((child) => 'fills' in child && Array.isArray(child.fills) && child.fills.some((paint) => paint.type === 'IMAGE')).length,
    });
  }
  return facts;
};

const masters = named('Equipe');
const memberCards = named('MemberCard');
const memberPictures = named('MemberPicture');
const instances = [];
for (const node of all.filter((entry) => entry.type === 'INSTANCE')) {
  const main = await node.getMainComponentAsync();
  if (main && (main.id === master.id || main.parent?.id === master.id)) instances.push(node);
}

const responsiveImages = [];
for (const [label, node] of [['master', master], ['page', instances[0]]]) {
  if (!node) continue;
  const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
  responsiveImages.push({
    path: 'specs/component-repairs/equipe/run-001/before/equipe-' + label + '.png',
    base64: figma.base64Encode(bytes),
  });
}

return {
  run: 'audit',
  scriptResults: [],
  responsiveImages,
  file: { name: figma.root.name },
  masterCardinality: masters.length,
  master: {
    id: master.id,
    key: master.key,
    type: master.type,
    name: master.name,
    page: pageOf(master)?.name ?? null,
    parent: master.parent ? { id: master.parent.id, type: master.parent.type, name: master.parent.name } : null,
    box: box(master),
    layoutMode: master.layoutMode,
    horizontal: master.layoutSizingHorizontal,
    vertical: master.layoutSizingVertical,
    padding: { top: master.paddingTop, right: master.paddingRight, bottom: master.paddingBottom, left: master.paddingLeft },
    gridApi: Object.fromEntries([
      'gridColumnCount', 'gridRowCount', 'gridColumnGap', 'gridRowGap',
      'gridColumnSizes', 'gridRowSizes', 'gridColumnsSizing', 'gridRowsSizing',
      'gridAutoTracks', 'gridItemsPositioning',
    ].map((field) => [field, { supported: field in master, value: field in master ? master[field] : null }])),
    children: master.children.map((node) => ({ id: node.id, type: node.type, name: node.name, box: box(node), layoutMode: 'layoutMode' in node ? node.layoutMode : null })),
    instances: await instanceFacts(master),
    texts: textFacts(master),
  },
  memberCardMasters: memberCards.map((node) => ({ id: node.id, key: node.key, type: node.type, box: box(node), texts: textFacts(node) })),
  memberPictureMasters: memberPictures.map((node) => ({ id: node.id, key: node.key, type: node.type, box: box(node) })),
  pageInstances: instances.map((node) => ({
    id: node.id,
    page: pageOf(node)?.name ?? null,
    parent: node.parent ? { id: node.parent.id, type: node.parent.type, name: node.parent.name } : null,
    box: box(node),
    componentProperties: node.componentProperties,
  })),
};
