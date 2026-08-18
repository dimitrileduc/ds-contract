await figma.loadAllPagesAsync();
if (figma.fileKey !== 'd9FYAUcqdcNtsuaMgLefvJ' || figma.root.name !== 'Piqueray (Copy)') {
  throw new Error('Wrong Figma file');
}

const IDS = {
  equipe: '2115:3947',
  memberCard: '2074:2072',
  memberPicture: '274:2389',
  pageInstance: '2115:4044',
};
const HASHES = {
  equipe: '72713914',
  memberCard: '4135690577',
  memberPicture: '3223689735',
};
const ORDER = [
  'Cécilia Piqueray', 'Florian Piqueray', 'Sandra Magermans', 'Arnaud Dahmen',
  'Ricardo', 'Quentin', 'Marc', 'André',
  'Grégory', 'Laurent', 'Jordan', 'Florian',
  'Hervé', 'Prénom', 'Prénom', 'Prénom',
];
const NS = 'ds_contracts';
const CONTAINER_KEY = 'organismContainerFor';
const changed = new Set();
const created = new Set();
const changedVariables = new Set();

const get = async (id, types) => {
  const node = await figma.getNodeByIdAsync(id);
  if (!node || !types.includes(node.type)) throw new Error('Pinned node absent or wrong type: ' + id);
  return node;
};
const equipe = await get(IDS.equipe, ['COMPONENT']);
const memberCard = await get(IDS.memberCard, ['COMPONENT']);
const memberPicture = await get(IDS.memberPicture, ['COMPONENT_SET']);
const pageInstance = await get(IDS.pageInstance, ['INSTANCE']);

const all = [];
for (const page of figma.root.children) all.push(...page.findAll(() => true));
for (const [name, node] of [['Equipe', equipe], ['MemberCard', memberCard], ['MemberPicture', memberPicture]]) {
  const matches = all.filter((candidate) =>
    (candidate.type === 'COMPONENT' || candidate.type === 'COMPONENT_SET') && candidate.name === name
  );
  if (matches.length !== 1 || matches[0].id !== node.id) throw new Error('Master cardinality drift: ' + name);
}
const pageMain = await pageInstance.getMainComponentAsync();
if (!pageMain || pageMain.id !== equipe.id) throw new Error('Pinned Page instance no longer targets Equipe');

const variableMap = new Map((await figma.variables.getLocalVariablesAsync()).map((variable) => [variable.name, variable]));
const variable = (name) => {
  const found = variableMap.get(name);
  if (!found) throw new Error('Missing variable: ' + name);
  return found;
};
const setVariableAllModes = (token, value) => {
  for (const modeId of Object.keys(token.valuesByMode)) {
    if (token.valuesByMode[modeId] === value) continue;
    token.setValueForMode(modeId, value);
    changedVariables.add(token.id);
  }
};
const styleMap = new Map();
for (const style of await figma.getLocalTextStylesAsync()) {
  if (!style.getSharedPluginData(NS, 'textStyleToken')) continue;
  if (styleMap.has(style.name)) throw new Error('Duplicate governed Text Style: ' + style.name);
  styleMap.set(style.name, style);
}
const exactStyle = (name) => {
  const style = styleMap.get(name);
  if (!style) throw new Error('Missing governed Text Style: ' + name);
  return style;
};

const baseProp = (key) => String(key).split('#')[0];
const textProp = (instance, name) => {
  const entry = Object.entries(instance.componentProperties || {}).find(([key]) => baseProp(key) === name);
  return entry ? String(entry[1].value) : null;
};
const imageHashes = (root) => root.findAll((node) =>
  'fills' in node && Array.isArray(node.fills) && node.fills.some((paint) => paint.type === 'IMAGE')
).flatMap((node) => node.fills.filter((paint) => paint.type === 'IMAGE').map((paint) => paint.imageHash));
const portraitMap = (root) => {
  const out = {};
  for (const card of root.findAll((node) => node.type === 'INSTANCE')) {
    const nom = textProp(card, 'Nom');
    if (!nom || out[nom]) continue;
    out[nom] = imageHashes(card);
  }
  return out;
};
const beforePortraits = portraitMap(equipe);
const beforePagePortraits = portraitMap(pageInstance);
const beforeImageMultiset = imageHashes(equipe).slice().sort();
const beforePageImageMultiset = imageHashes(pageInstance).slice().sort();

setVariableAllModes(variable('size/equipe/gap-colonnes'), 32);
setVariableAllModes(variable('size/equipe/gap-rangees'), 32);

const mark = (node) => changed.add(node.id);
const set = (node, field, value) => {
  if (JSON.stringify(node[field]) === JSON.stringify(value)) return;
  node[field] = value;
  mark(node);
};
const bind = (node, field, token) => {
  if (node.boundVariables?.[field]?.id === token.id) return;
  node.setBoundVariable(field, token);
  mark(node);
};
const unbind = (node, field) => {
  if (!node.boundVariables?.[field]) return;
  node.setBoundVariable(field, null);
  mark(node);
};
const lockSquare = (node) => {
  if (node.constrainProportions === true && Math.abs(node.width / node.height - 1) < 0.0001) return;
  if (Math.abs(node.width / node.height - 1) >= 0.0001) node.resize(node.width, node.width);
  if (typeof node.lockAspectRatio === 'function') node.lockAspectRatio();
  else node.constrainProportions = true;
  mark(node);
};

// Shared dependencies: preserve their identities/interiors, change only the
// responsive layout facts and restore the two exact governed Text Styles.
for (const variant of memberPicture.children) {
  if (variant.type !== 'COMPONENT') continue;
  lockSquare(variant);
}
const pictureInstance = memberCard.findOne((node) => node.type === 'INSTANCE' && node.name === 'MemberPicture');
if (!pictureInstance) throw new Error('MemberCard.MemberPicture missing');
set(pictureInstance, 'layoutSizingHorizontal', 'FILL');
lockSquare(pictureInstance);

for (const [nodeName, styleName] of [['Nom', 'Titre 3'], ['Poste', 'Titre 6']]) {
  const text = memberCard.findOne((node) => node.type === 'TEXT' && node.name === nodeName);
  if (!text) throw new Error('MemberCard text missing: ' + nodeName);
  const style = exactStyle(styleName);
  if (text.textStyleId !== style.id) {
    await text.setTextStyleIdAsync(style.id);
    mark(text);
  }
}

// One local organism Container. It presents the historical master itself;
// there is no duplicate demo instance.
let container = all.find((node) => node.type === 'FRAME' && node.getSharedPluginData(NS, CONTAINER_KEY) === 'equipe') || null;
if (!container) {
  if (!equipe.parent || equipe.parent.type !== 'SECTION' || equipe.parent.id !== '2115:3928') {
    throw new Error('Equipe parent precondition drift');
  }
  const host = equipe.parent;
  const index = host.children.indexOf(equipe);
  const origin = { x: equipe.x, y: equipe.y, width: equipe.width, height: equipe.height };
  container = figma.createFrame();
  container.name = 'Container · Equipe';
  container.layoutMode = 'HORIZONTAL';
  container.primaryAxisSizingMode = 'FIXED';
  container.counterAxisSizingMode = 'AUTO';
  container.paddingTop = 0;
  container.paddingRight = 0;
  container.paddingBottom = 0;
  container.paddingLeft = 0;
  container.itemSpacing = 0;
  container.fills = [];
  container.clipsContent = false;
  container.resize(origin.width, origin.height);
  container.x = origin.x;
  container.y = origin.y;
  container.setSharedPluginData(NS, CONTAINER_KEY, 'equipe');
  host.insertChild(index, container);
  container.appendChild(equipe);
  created.add(container.id);
  mark(container);
  mark(equipe);
} else if (equipe.parent?.id !== container.id) {
  throw new Error('Governed Equipe Container does not own the pinned master');
}
const componentChildren = container.children.filter((node) => node.type === 'COMPONENT' || node.type === 'COMPONENT_SET' || node.type === 'INSTANCE');
if (componentChildren.length !== 1 || componentChildren[0].id !== equipe.id) throw new Error('Duplicate organism presentation in Container');
set(container, 'name', 'Container · Equipe');
set(container, 'layoutMode', 'HORIZONTAL');
set(container, 'primaryAxisSizingMode', 'FIXED');
set(container, 'counterAxisSizingMode', 'AUTO');
if (Math.abs(container.width - 1728) > 0.01) { container.resize(1728, container.height); mark(container); }

// Root owns the historical 89px gutters; the child owns the native 4×4 Grid.
set(equipe, 'layoutMode', 'HORIZONTAL');
set(equipe, 'primaryAxisAlignItems', 'CENTER');
set(equipe, 'counterAxisAlignItems', 'MIN');
set(equipe, 'primaryAxisSizingMode', 'FIXED');
set(equipe, 'counterAxisSizingMode', 'AUTO');
set(equipe, 'layoutSizingHorizontal', 'FILL');
unbind(equipe, 'paddingLeft');
unbind(equipe, 'paddingRight');
set(equipe, 'paddingLeft', 0);
set(equipe, 'paddingRight', 0);
set(equipe, 'paddingTop', 0);
set(equipe, 'paddingBottom', 0);

const grid = equipe.children.find((node) => node.type === 'FRAME' && node.name === 'grid');
if (!grid || equipe.children.length !== 1) throw new Error('Equipe grid anatomy drift');
const cards = grid.children.filter((node) => node.type === 'INSTANCE');
if (cards.length !== 16 || cards.length !== grid.children.length) throw new Error('Equipe must contain exactly 16 MemberCard instances');
const queues = new Map();
for (const card of cards) {
  const nom = textProp(card, 'Nom');
  if (!nom) throw new Error('MemberCard without Nom property: ' + card.id);
  if (!queues.has(nom)) queues.set(nom, []);
  queues.get(nom).push(card);
}
const ordered = ORDER.map((nom) => {
  const queue = queues.get(nom);
  if (!queue || queue.length === 0) throw new Error('Missing expected member: ' + nom);
  return queue.shift();
});
if ([...queues.values()].some((queue) => queue.length > 0)) throw new Error('Unexpected member remained after visual-order mapping');
for (let index = 0; index < ordered.length; index++) {
  const card = ordered[index];
  if (grid.children[index]?.id !== card.id) {
    grid.insertChild(index, card);
    mark(grid);
  }
  set(card, 'name', index === 0 ? 'MemberCard' : 'MemberCard ' + (index + 1));
  set(card, 'layoutSizingHorizontal', 'FILL');
  set(card, 'layoutSizingVertical', 'HUG');
}
set(grid, 'layoutMode', 'GRID');
set(grid, 'gridColumnCount', 4);
set(grid, 'gridRowCount', 4);
set(grid, 'gridColumnSizes', Array.from({ length: 4 }, () => ({ type: 'FLEX', value: 1 })));
if (grid.gridRowSizes.length !== 4 || !grid.gridRowSizes.every((track) => track.type === 'HUG')) {
  grid.gridRowSizes = Array.from({ length: 4 }, () => ({ type: 'HUG' }));
  mark(grid);
}
set(grid, 'gridAutoTracks', 'ROWS');
set(grid, 'gridItemsPositioning', 'ROW_AUTO_FLOW');
for (const card of ordered) {
  if ('gridPositioning' in card) set(card, 'gridPositioning', 'AUTO');
}
bind(grid, 'gridColumnGap', variable('size/equipe/gap-colonnes'));
bind(grid, 'gridRowGap', variable('size/equipe/gap-rangees'));
set(grid, 'layoutSizingHorizontal', 'FILL');
set(grid, 'layoutSizingVertical', 'HUG');

// Mark the in-place structure as the exact current contract projection. The
// generated scripts will consequently no-op instead of destructively rebuilding
// photo-bearing composite instances.
for (const [node, contractId, hash, description] of [
  [memberPicture, 'ds.member-picture', HASHES.memberPicture, 'MemberPicture — generated from contract ds.member-picture v1.3.0 · image frame: runtime slot, photo shown is a mockup sample †'],
  [memberCard, 'ds.member-card', HASHES.memberCard, 'MemberCard — generated from contract ds.member-card v1.3.0'],
  [equipe, 'ds.equipe', HASHES.equipe, 'Equipe — generated from contract ds.equipe v1.2.0'],
]) {
  if (node.getSharedPluginData(NS, 'contractId') !== contractId) { node.setSharedPluginData(NS, 'contractId', contractId); mark(node); }
  if (node.getSharedPluginData(NS, 'specHash') !== hash) { node.setSharedPluginData(NS, 'specHash', hash); mark(node); }
  set(node, 'description', description);
}

const afterPortraits = portraitMap(equipe);
const afterPagePortraits = portraitMap(pageInstance);
const afterImageMultiset = imageHashes(equipe).slice().sort();
const afterPageImageMultiset = imageHashes(pageInstance).slice().sort();
if (JSON.stringify(beforeImageMultiset) !== JSON.stringify(afterImageMultiset) ||
    JSON.stringify(beforePageImageMultiset) !== JSON.stringify(afterPageImageMultiset)) {
  throw new Error('IMAGE paint multiset changed');
}
for (const [nom, hashes] of Object.entries(beforePortraits)) {
  if (JSON.stringify(hashes) !== JSON.stringify(afterPortraits[nom])) throw new Error('Portrait changed for ' + nom);
}
for (const [nom, hashes] of Object.entries(beforePagePortraits)) {
  if (JSON.stringify(hashes) !== JSON.stringify(afterPagePortraits[nom])) throw new Error('Page portrait changed for ' + nom);
}

const responsiveImages = [];
const capture = async (path, node) => {
  const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
  responsiveImages.push({ path, base64: figma.base64Encode(bytes) });
};
await capture('specs/component-repairs/equipe/run-001/after/equipe-master.png', container);
await capture('specs/component-repairs/equipe/run-001/after/equipe-page.png', pageInstance);
const originalWidth = container.width;
container.resize(1440, container.height);
const overflow1440 = [];
for (const card of ordered) {
  const cardBox = card.absoluteBoundingBox;
  if (!cardBox) continue;
  for (const text of card.findAll((node) => node.type === 'TEXT')) {
    const textBox = text.absoluteBoundingBox;
    if (!textBox) continue;
    if (textBox.x < cardBox.x - 0.01 || textBox.x + textBox.width > cardBox.x + cardBox.width + 0.01) {
      overflow1440.push({ card: textProp(card, 'Nom'), text: text.characters, cardWidth: cardBox.width, textWidth: textBox.width });
    }
  }
}
await capture('specs/component-repairs/equipe/run-001/after/equipe-1440.png', container);
container.resize(originalWidth, container.height);

return {
  run: 'repair-in-place',
  scriptResults: [{
    operationId: 'repair-equipe-grid-and-dependencies',
    targetId: 'equipe',
    result: changed.size === 0 && created.size === 0 && changedVariables.size === 0
      ? { skipped: true, reason: 'unchanged', createdNodeIds: [], changedNodeIds: [] }
      : { applied: true, createdNodeIds: [...created], changedNodeIds: [...changed], changedVariableIds: [...changedVariables] },
  }],
  inspection: {
    masters: [{ targetId: 'equipe', nodeId: equipe.id, componentKey: equipe.key, masterCount: 1, variantNames: [] }],
    pageWrites: [],
    grid: {
      nodeId: grid.id,
      mode: grid.layoutMode,
      columns: grid.gridColumnCount,
      rows: grid.gridRowCount,
      columnSizes: grid.gridColumnSizes,
      rowSizes: grid.gridRowSizes,
      columnGap: grid.gridColumnGap,
      rowGap: grid.gridRowGap,
      order: ordered.map((card) => textProp(card, 'Nom')),
      cardWidths: ordered.map((card) => card.width),
      pictureSizes: ordered.map((card) => {
        const picture = card.findOne((node) => node.type === 'INSTANCE' && node.name === 'MemberPicture');
        return picture ? { width: picture.width, height: picture.height, ratioLocked: picture.constrainProportions } : null;
      }),
      overflow1440,
    },
    textStyles: memberCard.findAll((node) => node.type === 'TEXT').map((node) => ({ name: node.name, textStyleId: node.textStyleId })),
    imageHashes: { master: afterImageMultiset, page: afterPageImageMultiset },
    changedVariableIds: [...changedVariables],
  },
  responsiveImages,
};
