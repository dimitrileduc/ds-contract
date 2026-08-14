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

const child = (parent, index, name, type) => {
  const node = parent.children?.[index];
  if (!node || node.name !== name || (type && node.type !== type)) {
    throw new Error('Avis Google anatomy drift at ' + index + ': expected ' + name + '/' + type);
  }
  return node;
};
const resume = child(root, 0, 'resume', 'FRAME');
const cartes = child(root, 1, 'cartes', 'FRAME');
const left = child(cartes, 0, 'flecheGauche', 'FRAME');
const grid = child(cartes, 1, 'groupeCartes', 'FRAME');
const right = child(cartes, 2, 'flecheDroite', 'FRAME');
if (root.children.length !== 2 || cartes.children.length !== 3 || grid.children.length !== 5) {
  throw new Error('Avis Google cardinality drift');
}
const cards = [...grid.children];
for (const [index, card] of cards.entries()) {
  if (card.type !== 'INSTANCE') throw new Error('Grid child is not Review-card at index ' + index);
  const main = await card.getMainComponentAsync();
  if (!main || main.id !== '2178:7349') throw new Error('Review-card link drift at index ' + index);
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
    instances.push({
      path: nodePath(node, host), nodeId: node.id, mainId: main?.id ?? null,
      properties: node.componentProperties,
    });
  }
  return stable({ hostId: host.id, texts, images, instances });
};
const rootBefore = await signature(root);
const pagesBefore = await Promise.all(pages.map(signature));
const rootIdentity = stable({ id: root.id, key: root.key, name: root.name, properties: root.componentPropertyDefinitions });

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
const gap = variables.get('space/8');
if (!gap) throw new Error('Governed gap variable space/8 absent');
const bind = (node, field, variable) => {
  if (node.boundVariables?.[field]?.id === variable.id) return;
  node.setBoundVariable(field, variable);
  changed.add(node.id);
};

set(cartes, 'clipsContent', false);
set(grid, 'layoutMode', 'GRID');
set(grid, 'gridColumnCount', 5);
set(grid, 'gridRowCount', 1);
set(grid, 'gridColumnSizes', Array.from({ length: 5 }, () => ({ type: 'FLEX', value: 1 })));
if (grid.gridRowSizes.length !== 1 || grid.gridRowSizes[0]?.type !== 'HUG') {
  grid.gridRowSizes = [{ type: 'HUG' }];
  changed.add(grid.id);
}
set(grid, 'gridAutoTracks', 'ROWS');
set(grid, 'gridItemsPositioning', 'ROW_AUTO_FLOW');
bind(grid, 'gridColumnGap', gap);
bind(grid, 'gridRowGap', gap);
set(grid, 'layoutSizingHorizontal', 'FILL');
for (const card of cards) {
  if ('gridPositioning' in card) set(card, 'gridPositioning', 'AUTO');
  set(card, 'layoutSizingHorizontal', 'FILL');
}

const placeArrow = (arrow, side) => {
  unbind(arrow, 'width');
  unbind(arrow, 'minWidth');
  set(arrow, 'primaryAxisSizingMode', 'AUTO');
  set(arrow, 'counterAxisSizingMode', 'AUTO');
  set(arrow, 'layoutPositioning', 'ABSOLUTE');
  set(arrow, 'constraints', { horizontal: side === 'left' ? 'MIN' : 'MAX', vertical: 'CENTER' });
  set(arrow, 'x', side === 'left' ? -15 : cartes.width + 15 - arrow.width);
  set(arrow, 'y', (cartes.height - arrow.height) / 2);
};
placeArrow(left, 'left');
placeArrow(right, 'right');

if (root.getSharedPluginData('ds_contracts', 'specHash') !== '2915154185') {
  root.setSharedPluginData('ds_contracts', 'specHash', '2915154185');
  changed.add(root.id);
}
const description = 'GoogleReviews — generated from contract ds.google-reviews v1.0.1';
set(root, 'description', description);

const rootAfter = await signature(root);
const pagesAfter = await Promise.all(pages.map(signature));
const identityAfter = stable({ id: root.id, key: root.key, name: root.name, properties: root.componentPropertyDefinitions });
if (rootBefore !== rootAfter) throw new Error('Protected master content/media/instance signature changed');
if (stable(pagesBefore) !== stable(pagesAfter)) throw new Error('Protected Page instance signature changed');
if (rootIdentity !== identityAfter) throw new Error('Protected master identity/name/property surface changed');
if (grid.layoutMode !== 'GRID' || grid.gridColumnCount !== 5 || grid.children.some((card) => card.layoutSizingHorizontal !== 'FILL')) {
  throw new Error('Five-column Fill Grid postcondition failed');
}
if (left.layoutPositioning !== 'ABSOLUTE' || right.layoutPositioning !== 'ABSOLUTE' ||
    Math.abs(left.x + 15) > 0.01 || Math.abs(right.x - (cartes.width + 15 - right.width)) > 0.01) {
  throw new Error('Overlay arrow postcondition failed');
}

return {
  results: [{
    name: 'Avis Google', nodeId: root.id, key: root.key,
    ...(changed.size === 0
      ? { skipped: true, reason: 'unchanged' }
      : { amended: true, changedNodeIds: [...changed] }),
  }],
};
