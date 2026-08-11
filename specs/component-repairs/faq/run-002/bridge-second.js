const INPUT = {"schemaVersion":"1.0.0","campaignId":"repair-faq-local-fill","fileKey":"d9FYAUcqdcNtsuaMgLefvJ","fileVersionId":"2386548683709062472","run":"second","evidenceRoot":"specs/component-repairs/faq/run-002","operations":[{"operationId":"fill-faq-section-header-instance","targetId":"faq","mechanism":"set-properties","nodeId":"2104:2914","structuralPath":"0","changes":{"layoutSizingHorizontal":"FILL"},"preconditions":[{"field":"masterNodeId","equals":"2104:2914"},{"field":"resolvedNodeId","equals":"2351:38059"},{"field":"nodeType","equals":"INSTANCE"},{"field":"structuralPath","equals":"0"}],"postconditions":[{"field":"layoutSizingHorizontal","equals":"FILL"}],"source":"campaign.allowlist"},{"operationId":"fill-faq-accordion-row-1","targetId":"faq","mechanism":"set-properties","nodeId":"2104:2914","structuralPath":"1/0","changes":{"layoutSizingHorizontal":"FILL"},"preconditions":[{"field":"masterNodeId","equals":"2104:2914"},{"field":"resolvedNodeId","equals":"2351:38072"},{"field":"nodeType","equals":"INSTANCE"},{"field":"structuralPath","equals":"1/0"}],"postconditions":[{"field":"layoutSizingHorizontal","equals":"FILL"}],"source":"campaign.allowlist"},{"operationId":"fill-faq-accordion-row-2","targetId":"faq","mechanism":"set-properties","nodeId":"2104:2914","structuralPath":"1/1","changes":{"layoutSizingHorizontal":"FILL"},"preconditions":[{"field":"masterNodeId","equals":"2104:2914"},{"field":"resolvedNodeId","equals":"2351:38078"},{"field":"nodeType","equals":"INSTANCE"},{"field":"structuralPath","equals":"1/1"}],"postconditions":[{"field":"layoutSizingHorizontal","equals":"FILL"}],"source":"campaign.allowlist"},{"operationId":"fill-faq-accordion-row-3","targetId":"faq","mechanism":"set-properties","nodeId":"2104:2914","structuralPath":"1/2","changes":{"layoutSizingHorizontal":"FILL"},"preconditions":[{"field":"masterNodeId","equals":"2104:2914"},{"field":"resolvedNodeId","equals":"2351:38084"},{"field":"nodeType","equals":"INSTANCE"},{"field":"structuralPath","equals":"1/2"}],"postconditions":[{"field":"layoutSizingHorizontal","equals":"FILL"}],"source":"campaign.allowlist"}],"targets":[{"targetId":"faq","masterNodeId":"2104:2914","expectedMasterName":"FAQ","expectedVariantNames":[],"responsiveWidths":[1440]}]};
const GENERATED_RUNNERS = {};
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
  const container = containerByTarget.get(target.targetId) || markedContainers(target.targetId)[0];
  if (!container) throw new Error('Responsive Container missing: ' + target.targetId);
  for (const width of target.responsiveWidths) {
    const originalWidth = container.width;
    const screenshotRef = INPUT.evidenceRoot + '/responsive-' + width + '-' + INPUT.run + '.png';
    try {
      container.resize(width, container.height);
      const overflowIssues = descendantOverflow(master, container);
      const bytes = await container.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
      responsiveChecks.push({ targetId: target.targetId, width, overflow: overflowIssues.length > 0, overflowNodeIds: overflowIssues.map((issue) => issue.nodeId), overflowIssues, screenshotRef });
      responsiveImages.push({ path: screenshotRef, base64: figma.base64Encode(bytes) });
    } finally {
      container.resize(originalWidth, container.height);
    }
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
