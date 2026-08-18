const INPUT = {"schemaVersion":"1.0.0","campaignId":"repair-google-reviews","fileKey":"d9FYAUcqdcNtsuaMgLefvJ","fileVersionId":"2386730476747356856","run":"first","evidenceRoot":"specs/component-repairs/google-reviews/run-001","operations":[{"operationId":"repair-google-reviews-grid-in-place","targetId":"google-reviews","mechanism":"generated-amend","nodeId":"2178:7381","structuralPath":"","changes":{"generatedScriptRef":"specs/component-repairs/google-reviews/run-001/repair-in-place.js"},"preconditions":[{"field":"nodeId","equals":"2178:7381"},{"field":"nodeName","equals":"Avis Google"},{"field":"pageWrites","equals":0}],"postconditions":[{"field":"layoutMode","equals":"GRID"},{"field":"gridColumnCount","equals":5},{"field":"reviewCardSizing","equals":"FILL"},{"field":"controls","equals":"ABSOLUTE_OVERLAY"},{"field":"pageWrites","equals":0}],"source":"campaign.allowlist"},{"operationId":"ensure-google-reviews-container","targetId":"google-reviews","mechanism":"ensure-organism-container","nodeId":"2178:7381","structuralPath":"","changes":{"containerName":"Container · Avis Google","layoutMode":"HORIZONTAL","referenceWidth":1552,"referenceHeight":328,"layoutSizingHorizontal":"FILL"},"preconditions":[{"field":"nodeId","equals":"2178:7381"},{"field":"parentNodeId","equals":"2182:7951"},{"field":"parentType","equals":"SECTION"}],"postconditions":[{"field":"masterNodeId","equals":"2178:7381"},{"field":"parentName","equals":"Container · Avis Google"},{"field":"layoutSizingHorizontal","equals":"FILL"}],"source":"campaign.allowlist"}],"targets":[{"targetId":"google-reviews","masterNodeId":"2178:7381","expectedMasterName":"Avis Google","expectedVariantNames":[],"responsiveWidths":[1262],"subjectKind":"organism"}]};
const GENERATED_RUNNERS = {"repair-google-reviews-grid-in-place": async () => {
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

}};
await figma.loadAllPagesAsync();
if (figma.fileKey !== INPUT.fileKey) throw new Error('Wrong Figma file: expected ' + INPUT.fileKey + ', got ' + figma.fileKey);
const MARK_NS = 'ds_contracts';
const MARK_KEY = 'organismContainerFor';
const TEXT_STYLE_MARK = 'textStyleToken';
const all = [];
for (const page of figma.root.children) all.push(...page.findAll(() => true));
const pageOf = (node) => { let cursor = node; while (cursor && cursor.type !== 'PAGE') cursor = cursor.parent; return cursor; };
const componentLike = (node) => node && (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET' || node.type === 'INSTANCE');
const masterLike = (node) => node && (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET');
const markedContainers = (targetId) => all.filter((node) => node.type === 'FRAME' && node.getSharedPluginData(MARK_NS, MARK_KEY) === targetId);
const resolvePath = (root, structuralPath) => {
  let node = root;
  for (const raw of String(structuralPath || '').split('/').filter(Boolean)) {
    const index = Number(raw);
    if (!Number.isInteger(index) || !node || !('children' in node) || !node.children[index]) throw new Error('Structural path drift: ' + structuralPath);
    node = node.children[index];
  }
  return node;
};
const readPrecondition = (node, root, operation, field) => {
  if (field === 'nodeId' || field === 'masterNodeId') return root.id;
  if (field === 'resolvedNodeId') return node.id;
  if (field === 'nodeType') return node.type;
  if (field === 'structuralPath') return operation.structuralPath;
  if (field === 'characters') return node.type === 'TEXT' ? node.characters : undefined;
  if (field === 'layoutSizingHorizontal') return 'layoutSizingHorizontal' in node ? node.layoutSizingHorizontal : undefined;
  if (field === 'layoutSizingVertical') return 'layoutSizingVertical' in node ? node.layoutSizingVertical : undefined;
  if (field === 'primaryAxisAlignItems') return 'primaryAxisAlignItems' in node ? node.primaryAxisAlignItems : undefined;
  if (field === 'nodeName') return node.name;
  if (field === 'width') return node.width;
  if (field === 'height') return node.height;
  if (['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].includes(field)) return field in node ? node[field] : undefined;
  if (field === 'textStyleId') return node.type === 'TEXT' && typeof node.textStyleId === 'string' ? node.textStyleId : null;
  throw new Error('Unsupported set-properties precondition: ' + field);
};
const assertOperationPreconditions = (node, root, operation) => {
  for (const precondition of operation.preconditions) {
    const actual = readPrecondition(node, root, operation, precondition.field);
    if (actual !== precondition.equals) throw new Error('Precondition drift ' + operation.operationId + '/' + precondition.field + ': expected ' + JSON.stringify(precondition.equals) + ', got ' + JSON.stringify(actual));
  }
};
const loadTextFonts = async (node) => {
  if (node.characters.length === 0) return;
  for (const font of node.getRangeAllFontNames(0, node.characters.length)) await figma.loadFontAsync(font);
};
let governedStyleByToken = null;
const governedTextStyle = async (tokenPath, expectedName) => {
  if (!governedStyleByToken) {
    governedStyleByToken = new Map();
    for (const style of await figma.getLocalTextStylesAsync()) {
      const token = style.getSharedPluginData(MARK_NS, TEXT_STYLE_MARK);
      if (!token) continue;
      if (governedStyleByToken.has(token)) throw new Error('Duplicate governed Text Style token: ' + token);
      governedStyleByToken.set(token, style);
    }
  }
  const style = governedStyleByToken.get(tokenPath);
  if (!style || style.name !== expectedName) throw new Error('Governed Text Style missing or renamed: ' + tokenPath + '/' + expectedName);
  return style;
};
const fontKey = (font) => font.family + '|' + font.style;
const richTextMatches = (node, rich) => {
  const expected = Array(node.characters.length).fill(fontKey(rich.baseFont));
  for (const range of rich.ranges) {
    if (range.start < 0 || range.end > node.characters.length || range.end <= range.start) throw new Error('Rich range outside text bounds: ' + range.start + '..' + range.end);
    expected.fill(fontKey(range.font), range.start, range.end);
  }
  const actual = Array(node.characters.length).fill('');
  for (const segment of node.getStyledTextSegments(['fontName'])) actual.fill(fontKey(segment.fontName), segment.start, segment.end);
  return expected.every((value, index) => actual[index] === value);
};
const applySetProperties = async (operation) => {
  const root = await figma.getNodeByIdAsync(operation.nodeId);
  if (!root || !masterLike(root)) throw new Error('Pinned set-properties master absent: ' + operation.nodeId);
  if (pageOf(root)?.name === 'Pages') throw new Error('Refused Page master write: ' + root.id);
  const node = resolvePath(root, operation.structuralPath);
  assertOperationPreconditions(node, root, operation);
  const changes = operation.changes;
  let changed = false;
  if (Object.prototype.hasOwnProperty.call(changes, 'layoutSizingHorizontal')) {
    if (!('layoutSizingHorizontal' in node)) throw new Error('Layout sizing unsupported at ' + operation.structuralPath);
    if (node.layoutSizingHorizontal !== changes.layoutSizingHorizontal) { node.layoutSizingHorizontal = changes.layoutSizingHorizontal; changed = true; }
  } else if (changes.layout) {
    const layout = changes.layout;
    for (const field of ['layoutMode', 'primaryAxisAlignItems']) {
      if (Object.prototype.hasOwnProperty.call(layout, field)) {
        if (!(field in node)) throw new Error('Auto-layout property unsupported at ' + operation.structuralPath + '/' + field);
        if (node[field] !== layout[field]) { node[field] = layout[field]; changed = true; }
      }
    }
    for (const field of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) {
      if (Object.prototype.hasOwnProperty.call(layout, field)) {
        if (!(field in node)) throw new Error('Layout padding unsupported at ' + operation.structuralPath + '/' + field);
        if (node[field] !== layout[field]) { node[field] = layout[field]; changed = true; }
      }
    }
    if (Object.prototype.hasOwnProperty.call(layout, 'width')) {
      if (layout.width !== 'parent' || !node.parent || !('width' in node.parent) || !('resize' in node)) throw new Error('Parent-owned width unsupported at ' + operation.structuralPath);
      if (Math.abs(node.width - node.parent.width) > 0.01) { node.resize(node.parent.width, node.height); changed = true; }
    }
    if (Object.prototype.hasOwnProperty.call(layout, 'horizontalConstraint') || Object.prototype.hasOwnProperty.call(layout, 'verticalConstraint')) {
      if (!('constraints' in node)) throw new Error('Constraints unsupported at ' + operation.structuralPath);
      const next = { ...node.constraints,
        ...(Object.prototype.hasOwnProperty.call(layout, 'horizontalConstraint') ? { horizontal: layout.horizontalConstraint } : {}),
        ...(Object.prototype.hasOwnProperty.call(layout, 'verticalConstraint') ? { vertical: layout.verticalConstraint } : {}) };
      if (node.constraints?.horizontal !== next.horizontal || node.constraints?.vertical !== next.vertical) { node.constraints = next; changed = true; }
    }
    if (Object.prototype.hasOwnProperty.call(layout, 'layoutPositioning')) {
      if (!('layoutPositioning' in node)) throw new Error('Layout positioning unsupported at ' + operation.structuralPath);
      if (node.layoutPositioning !== layout.layoutPositioning) { node.layoutPositioning = layout.layoutPositioning; changed = true; }
    }
    for (const field of ['x', 'y']) if (Object.prototype.hasOwnProperty.call(layout, field) && node[field] !== layout[field]) { node[field] = layout[field]; changed = true; }
    for (const field of ['layoutSizingHorizontal', 'layoutSizingVertical']) {
      if (Object.prototype.hasOwnProperty.call(layout, field)) {
        if (!(field in node)) throw new Error('Layout sizing unsupported at ' + operation.structuralPath + '/' + field);
        if (node[field] !== layout[field]) { node[field] = layout[field]; changed = true; }
      }
    }
  } else if (changes.textStyle) {
    if (node.type !== 'TEXT') throw new Error('Text Style target is not TEXT at ' + operation.structuralPath);
    const style = await governedTextStyle(changes.textStyle.tokenPath, changes.textStyle.name);
    if (node.textStyleId !== style.id) {
      await loadTextFonts(node);
      await node.setTextStyleIdAsync(style.id);
      changed = true;
    }
  } else if (changes.richText) {
    if (node.type !== 'TEXT') throw new Error('Rich-range target is not TEXT at ' + operation.structuralPath);
    if (typeof node.textStyleId === 'string' && node.textStyleId) throw new Error('Rich-range target unexpectedly owns a whole-node Text Style: ' + node.id);
    const rich = changes.richText;
    if (!richTextMatches(node, rich)) {
      await loadTextFonts(node);
      await figma.loadFontAsync(rich.baseFont);
      for (const range of rich.ranges) await figma.loadFontAsync(range.font);
      node.setRangeFontName(0, node.characters.length, rich.baseFont);
      for (const range of rich.ranges) node.setRangeFontName(range.start, range.end, range.font);
      changed = true;
    }
  } else throw new Error('Unsupported set-properties change: ' + operation.operationId);
  if (Object.prototype.hasOwnProperty.call(changes, 'layoutSizingHorizontal') && node.layoutSizingHorizontal !== changes.layoutSizingHorizontal) throw new Error('Layout postcondition failed: ' + operation.operationId);
  if (changes.layout) {
    for (const field of ['layoutMode', 'primaryAxisAlignItems', 'layoutPositioning', 'layoutSizingHorizontal', 'layoutSizingVertical', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'x', 'y']) {
      if (Object.prototype.hasOwnProperty.call(changes.layout, field) && node[field] !== changes.layout[field]) throw new Error('Layout postcondition failed: ' + operation.operationId + '/' + field);
    }
    if (changes.layout.width === 'parent' && Math.abs(node.width - node.parent.width) > 0.01) throw new Error('Layout postcondition failed: ' + operation.operationId + '/width');
    if (Object.prototype.hasOwnProperty.call(changes.layout, 'horizontalConstraint') && node.constraints?.horizontal !== changes.layout.horizontalConstraint) throw new Error('Layout postcondition failed: ' + operation.operationId + '/horizontalConstraint');
    if (Object.prototype.hasOwnProperty.call(changes.layout, 'verticalConstraint') && node.constraints?.vertical !== changes.layout.verticalConstraint) throw new Error('Layout postcondition failed: ' + operation.operationId + '/verticalConstraint');
  }
  if (changes.textStyle) {
    const expected = await governedTextStyle(changes.textStyle.tokenPath, changes.textStyle.name);
    if (node.textStyleId !== expected.id) throw new Error('Text Style postcondition failed: ' + operation.operationId);
  }
  if (changes.richText && !richTextMatches(node, changes.richText)) throw new Error('Rich-range postcondition failed: ' + operation.operationId);
  return { node, changed };
};
const boundsOutside = (inner, outer) => !inner || !outer || inner.x < outer.x - 0.01 || inner.y < outer.y - 0.01 || inner.x + inner.width > outer.x + outer.width + 0.01 || inner.y + inner.height > outer.y + outer.height + 0.01;
const effectivelyVisible = (node, stop) => {
  for (let cursor = node; cursor && cursor !== stop; cursor = cursor.parent) if (cursor.visible === false) return false;
  return true;
};
const descendantOverflow = (master, container) => {
  const issues = [];
  const nodes = [master, ...master.findAll(() => true)].filter((node) => effectivelyVisible(node, container));
  for (const node of nodes) {
    const box = node.absoluteBoundingBox;
    if (boundsOutside(box, container.absoluteBoundingBox)) { issues.push({ nodeId: node.id, reason: 'container' }); continue; }
    for (let ancestor = node.parent; ancestor && ancestor !== container; ancestor = ancestor.parent) {
      if (ancestor.clipsContent === true && boundsOutside(box, ancestor.absoluteBoundingBox)) {
        issues.push({ nodeId: node.id, reason: 'clipped-by:' + ancestor.id });
        break;
      }
    }
  }
  return issues;
};
const scriptResults = [];
const containerByTarget = new Map();
for (const operation of INPUT.operations) {
  const target = INPUT.targets.find((entry) => entry.targetId === operation.targetId);
  if (!target) throw new Error('Missing target for ' + operation.operationId);
  if (operation.mechanism === 'generated-amend') {
    const root = await figma.getNodeByIdAsync(operation.nodeId);
    if (!root || !masterLike(root)) throw new Error('Pinned generated-amend master absent: ' + operation.nodeId);
    if (pageOf(root)?.name === 'Pages') throw new Error('Refused Page master write: ' + root.id);
    const sameNamed = all.filter((node) => masterLike(node) && node.name === target.expectedMasterName);
    if (sameNamed.length !== 1 || sameNamed[0].id !== root.id) throw new Error('Master cardinality drift: ' + target.expectedMasterName);
    const generatedRunner = GENERATED_RUNNERS[operation.operationId];
    if (typeof generatedRunner !== 'function') throw new Error('Missing generated runner: ' + operation.operationId);
    const generated = await generatedRunner();
    const entry = Array.isArray(generated?.results) ? generated.results.find((result) => result && result.nodeId === operation.nodeId) : null;
    if (!entry) throw new Error('Generated amend did not report pinned master: ' + operation.nodeId);
    const noOp = entry.skipped === true && entry.reason === 'unchanged';
    if (entry.skipped === true && !noOp) throw new Error('Generated amend refused: ' + String(entry.reason || 'unknown'));
    scriptResults.push({
      operationId: operation.operationId, targetId: operation.targetId, nodeId: operation.nodeId,
      result: noOp
        ? { skipped: true, reason: 'unchanged', createdNodeIds: [], changedNodeIds: [] }
        : { applied: true, amended: entry.amended === true, createdNodeIds: [], changedNodeIds: [operation.nodeId] },
    });
    continue;
  }
  if (operation.mechanism === 'set-properties') {
    const result = await applySetProperties(operation);
    scriptResults.push({
      operationId: operation.operationId, targetId: operation.targetId, nodeId: operation.nodeId,
      result: result.changed
        ? { applied: true, createdNodeIds: [], changedNodeIds: [result.node.id] }
        : { skipped: true, reason: 'unchanged', createdNodeIds: [], changedNodeIds: [] },
    });
    continue;
  }
  const master = await figma.getNodeByIdAsync(operation.nodeId);
  if (!master || !masterLike(master)) throw new Error('Pinned master absent: ' + operation.nodeId);
  if (pageOf(master)?.name === 'Pages') throw new Error('Refused Page master write: ' + master.id);
  const sameNamed = all.filter((node) => masterLike(node) && node.name === target.expectedMasterName);
  if (sameNamed.length !== 1 || sameNamed[0].id !== master.id) throw new Error('Master cardinality drift: ' + target.expectedMasterName);
  const changes = operation.changes;
  const expectedParentId = operation.preconditions.find((entry) => entry.field === 'parentNodeId')?.equals;
  const expectedParentType = operation.preconditions.find((entry) => entry.field === 'parentType')?.equals;
  const marked = markedContainers(operation.targetId);
  if (marked.length > 1) throw new Error('Duplicate governed organism Containers: ' + operation.targetId);
  let container = marked[0] || null;
  const createdNodeIds = [];
  const changedNodeIds = [];
  if (!container) {
    if (master.parent?.type === 'FRAME') throw new Error('Refused unmarked Container adoption: ' + master.parent.id);
    if (!master.parent || master.parent.id !== expectedParentId || master.parent.type !== expectedParentType) throw new Error('Master parent precondition drift: ' + master.id);
    const host = master.parent;
    const index = host.children.indexOf(master);
    const origin = { x: master.x, y: master.y, width: master.width, height: master.height };
    container = figma.createFrame();
    container.name = String(changes.containerName);
    container.layoutMode = String(changes.layoutMode);
    container.primaryAxisSizingMode = 'FIXED';
    container.counterAxisSizingMode = 'FIXED';
    container.paddingTop = 0; container.paddingRight = 0; container.paddingBottom = 0; container.paddingLeft = 0;
    container.itemSpacing = 0;
    container.fills = [];
    container.clipsContent = false;
    container.resize(Number(changes.referenceWidth), Number(changes.referenceHeight));
    container.x = origin.x; container.y = origin.y;
    container.setSharedPluginData(MARK_NS, MARK_KEY, operation.targetId);
    host.insertChild(index, container);
    container.appendChild(master);
    master.x = 0; master.y = 0;
    master.layoutSizingHorizontal = 'FILL';
    container.counterAxisSizingMode = 'AUTO';
    createdNodeIds.push(container.id);
    changedNodeIds.push(master.id, container.id);
  } else {
    if (master.parent?.id !== container.id) throw new Error('Governed Container does not own pinned master: ' + container.id);
    const siblings = container.children.filter(componentLike);
    if (siblings.length !== 1 || siblings[0].id !== master.id) throw new Error('Governed Container contains another organism presentation');
    let changed = false;
    if (container.name !== changes.containerName) { container.name = String(changes.containerName); changed = true; }
    if (container.layoutMode !== changes.layoutMode) { container.layoutMode = String(changes.layoutMode); changed = true; }
    if (container.width !== Number(changes.referenceWidth)) { container.resize(Number(changes.referenceWidth), container.height); changed = true; }
    if (container.counterAxisSizingMode !== 'AUTO') { container.counterAxisSizingMode = 'AUTO'; changed = true; }
    if (master.layoutSizingHorizontal !== 'FILL') { master.layoutSizingHorizontal = 'FILL'; changed = true; }
    if (changed) changedNodeIds.push(master.id, container.id);
  }
  containerByTarget.set(operation.targetId, container);
  const noOp = createdNodeIds.length === 0 && changedNodeIds.length === 0;
  scriptResults.push({
    operationId: operation.operationId, targetId: operation.targetId, nodeId: operation.nodeId,
    result: noOp
      ? { skipped: true, reason: 'unchanged', createdNodeIds: [], changedNodeIds: [] }
      : { applied: true, createdNodeIds, changedNodeIds },
  });
}
const masters = [];
const responsiveChecks = [];
const responsiveImages = [];
for (const target of INPUT.targets) {
  const master = await figma.getNodeByIdAsync(target.masterNodeId);
  if (!master) throw new Error('Post-apply master absent: ' + target.masterNodeId);
  const sameNamed = all.filter((node) => masterLike(node) && node.name === target.expectedMasterName);
  const variantNames = master.type === 'COMPONENT_SET' ? master.children.filter((node) => node.type === 'COMPONENT').map((node) => node.name).sort() : [];
  masters.push({ targetId: target.targetId, nodeId: master.id, componentKey: master.key, masterCount: sameNamed.length, variantNames });
  let container = containerByTarget.get(target.targetId) || markedContainers(target.targetId)[0] || null;
  let responsiveRoot = master;
  let transientContainer = null;
  if (target.subjectKind === 'shared-component') {
    const source = master.type === 'COMPONENT_SET' ? master.children.find((node) => node.type === 'COMPONENT') : master;
    if (!source || source.type !== 'COMPONENT') throw new Error('Shared responsive source missing: ' + target.targetId);
    transientContainer = figma.createFrame();
    transientContainer.name = 'Component repair responsive proof · ' + target.targetId;
    transientContainer.layoutMode = 'VERTICAL';
    transientContainer.primaryAxisSizingMode = 'AUTO';
    transientContainer.counterAxisSizingMode = 'FIXED';
    transientContainer.paddingTop = 0; transientContainer.paddingRight = 0; transientContainer.paddingBottom = 0; transientContainer.paddingLeft = 0;
    transientContainer.itemSpacing = 0; transientContainer.fills = []; transientContainer.clipsContent = false;
    transientContainer.resize(source.width, source.height);
    responsiveRoot = source.createInstance();
    transientContainer.appendChild(responsiveRoot);
    responsiveRoot.layoutSizingHorizontal = 'FILL';
    container = transientContainer;
  }
  if (!container) throw new Error('Responsive Container missing: ' + target.targetId);
  const originalWidth = container.width;
  try {
    for (const width of target.responsiveWidths) {
      const screenshotRef = INPUT.evidenceRoot + '/responsive-' + width + '-' + INPUT.run + '.png';
      container.resize(width, container.height);
      const overflowIssues = descendantOverflow(responsiveRoot, container);
      const bytes = await container.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
      responsiveChecks.push({ targetId: target.targetId, width, overflow: overflowIssues.length > 0, overflowNodeIds: overflowIssues.map((issue) => issue.nodeId), overflowIssues, screenshotRef });
      responsiveImages.push({ path: screenshotRef, base64: figma.base64Encode(bytes) });
    }
  } finally {
    if (transientContainer) transientContainer.remove();
    else container.resize(originalWidth, container.height);
  }
}
return {
  schemaVersion: INPUT.schemaVersion,
  campaignId: INPUT.campaignId,
  fileKey: INPUT.fileKey,
  fileVersionId: INPUT.fileVersionId,
  run: INPUT.run,
  scriptResults,
  inspection: { masters, pageWrites: [], responsiveChecks },
  responsiveImages,
};
