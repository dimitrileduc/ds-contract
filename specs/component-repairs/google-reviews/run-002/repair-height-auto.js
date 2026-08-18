const root = await figma.getNodeByIdAsync('2178:7381');
if (!root || root.type !== 'COMPONENT' || root.name !== 'Avis Google') {
  throw new Error('Pinned Avis Google master absent, renamed or wrong type');
}
if (root.getSharedPluginData('ds_contracts', 'contractId') !== 'ds.google-reviews') {
  throw new Error('Avis Google contract identity marker drift');
}

const PAGE_INSTANCE_IDS = [
  '2183:8026', '2184:8218', '2185:8410', '2186:8602',
  '2187:8794', '2188:9013', '2188:9205', '2188:9397',
];
const pages = [];
for (const id of PAGE_INSTANCE_IDS) {
  const instance = await figma.getNodeByIdAsync(id);
  if (!instance || instance.type !== 'INSTANCE') throw new Error('Pinned Page instance absent: ' + id);
  const main = await instance.getMainComponentAsync();
  if (!main || main.id !== root.id) throw new Error('Page instance link drift: ' + id);
  pages.push(instance);
}

const cartes = root.children?.[1];
const grid = cartes?.children?.[1];
if (!cartes || cartes.name !== 'cartes' || cartes.type !== 'FRAME' ||
    !grid || grid.name !== 'groupeCartes' || grid.type !== 'FRAME') {
  throw new Error('Avis Google governed grid anatomy drift');
}
if (grid.layoutMode !== 'GRID' || grid.gridColumnCount !== 5 || grid.children.length !== 5 ||
    grid.children.some((card) => card.type !== 'INSTANCE' || card.layoutSizingHorizontal !== 'FILL')) {
  throw new Error('Five-column Fill Grid prerequisite failed');
}
const [left, right] = [cartes.children[0], cartes.children[2]];
if (left?.layoutPositioning !== 'ABSOLUTE' || right?.layoutPositioning !== 'ABSOLUTE') {
  throw new Error('Overlay control prerequisite failed');
}

const stable = (value) => JSON.stringify(value, (_key, item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return item;
  return Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)));
});
const nodePath = (node, stop) => {
  const out = [];
  for (let cursor = node; cursor && cursor !== stop; cursor = cursor.parent) {
    if (!cursor.parent || !('children' in cursor.parent)) break;
    out.unshift(cursor.parent.children.indexOf(cursor));
  }
  return out.join('/');
};
const signature = async (host) => {
  const nodes = [host, ...host.findAll(() => true)];
  const texts = nodes.filter((node) => node.type === 'TEXT').map((node) => ({
    path: nodePath(node, host), name: node.name, characters: node.characters,
    textStyleId: typeof node.textStyleId === 'string' ? node.textStyleId : null,
    ranges: node.characters.length > 0 ? node.getStyledTextSegments(['fontName', 'fontSize', 'fontWeight']).map((segment) => ({
      start: segment.start, end: segment.end, fontName: segment.fontName,
      fontSize: segment.fontSize, fontWeight: segment.fontWeight,
    })) : [],
  }));
  const images = nodes.flatMap((node) =>
    'fills' in node && Array.isArray(node.fills)
      ? node.fills.filter((paint) => paint.type === 'IMAGE').map((paint) => ({ path: nodePath(node, host), imageHash: paint.imageHash, scaleMode: paint.scaleMode }))
      : []);
  const instances = [];
  for (const node of nodes.filter((candidate) => candidate.type === 'INSTANCE')) {
    const main = await node.getMainComponentAsync();
    instances.push({ path: nodePath(node, host), nodeId: node.id, mainId: main?.id ?? null, properties: node.componentProperties });
  }
  return stable({ hostId: host.id, texts, images, instances });
};

const rootBefore = await signature(root);
const pagesBefore = await Promise.all(pages.map(signature));
const identityBefore = stable({ id: root.id, key: root.key, name: root.name, properties: root.componentPropertyDefinitions });
const changed = new Set();
const set = (node, field, value) => {
  if (stable(node[field]) === stable(value)) return;
  node[field] = value;
  changed.add(node.id);
};
const unbind = (node, field) => {
  if (!node.boundVariables?.[field]) return;
  node.setBoundVariable(field, null);
  changed.add(node.id);
};
const variables = new Map((await figma.variables.getLocalVariablesAsync()).map((variable) => [variable.name, variable]));
const minHeight = variables.get('size/google-reviews/root-h');
if (!minHeight) throw new Error('Governed min-height variable size/google-reviews/root-h absent');

unbind(root, 'height');
set(root, 'primaryAxisSizingMode', 'AUTO');
set(root, 'layoutSizingVertical', 'HUG');
if (root.boundVariables?.minHeight?.id !== minHeight.id) {
  root.setBoundVariable('minHeight', minHeight);
  changed.add(root.id);
}
if (root.getSharedPluginData('ds_contracts', 'specHash') !== '922655855') {
  root.setSharedPluginData('ds_contracts', 'specHash', '922655855');
  changed.add(root.id);
}
set(root, 'description', 'GoogleReviews — generated from contract ds.google-reviews v1.0.2');

const rootAfter = await signature(root);
const pagesAfter = await Promise.all(pages.map(signature));
const identityAfter = stable({ id: root.id, key: root.key, name: root.name, properties: root.componentPropertyDefinitions });
if (rootBefore !== rootAfter) throw new Error('Protected master content/media/instance signature changed');
if (stable(pagesBefore) !== stable(pagesAfter)) throw new Error('Protected Page instance signature changed');
if (identityBefore !== identityAfter) throw new Error('Protected master identity/name/property surface changed');
if (root.primaryAxisSizingMode !== 'AUTO' || root.layoutSizingVertical !== 'HUG' ||
    root.boundVariables?.minHeight?.id !== minHeight.id || root.boundVariables?.height) {
  throw new Error('Auto/Hug plus governed min-height postcondition failed');
}
if (Math.abs(root.height - 328) > 0.01) {
  throw new Error('Nominal five-card appearance height drift: ' + root.height);
}

return {
  results: [{
    name: 'Avis Google', nodeId: root.id, key: root.key,
    ...(changed.size === 0
      ? { skipped: true, reason: 'unchanged' }
      : { amended: true, changedNodeIds: [...changed] }),
  }],
};
