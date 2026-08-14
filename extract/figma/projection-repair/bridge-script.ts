import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { DryRun, PlannedOperation } from './apply.js';
import { isObject as object, type JsonRecord as Json } from './json.js';
import type { RepairCampaign } from './types.js';

/** The component bridge owns only reusable, bounded operations. Component
 * anatomy stays in the campaign structural paths; names and node ids never
 * enter this emitter. */
export function validateBridgeOperation(operation: PlannedOperation): string[] {
  if (operation.mechanism === 'ensure-organism-container') return [];
  if (operation.mechanism === 'generated-amend') {
    const ref = operation.changes.generatedScriptRef;
    return typeof ref === 'string' && ref.length > 0 && !path.isAbsolute(ref) && !ref.split(/[\\/]+/).includes('..') && ref.endsWith('.js')
      ? []
      : ['generated-amend requires one bounded generated JavaScript artifact'];
  }
  if (operation.mechanism !== 'set-properties') return [`unsupported mechanism ${operation.mechanism}`];
  if (!operation.structuralPath) return ['set-properties requires a structural path'];
  const changes = operation.changes;
  const keys = Object.keys(changes);
  if (keys.length === 1 && keys[0] === 'layoutSizingHorizontal' &&
    ['FILL', 'HUG', 'FIXED'].includes(String(changes.layoutSizingHorizontal))) return [];
  if (keys.length === 1 && keys[0] === 'layout' && object(changes.layout)) {
    const layout = changes.layout;
    // Each disjunct pins its own key name, so the disjunction IS the allowlist.
    const entries = Object.entries(layout);
    if (entries.length > 0 && entries.every(([key, value]) => (
      (['layoutSizingHorizontal', 'layoutSizingVertical'].includes(key) && ['FILL', 'HUG', 'FIXED'].includes(String(value))) ||
      (key === 'layoutMode' && ['HORIZONTAL', 'VERTICAL'].includes(String(value))) ||
      (key === 'primaryAxisAlignItems' && ['MIN', 'CENTER', 'MAX', 'SPACE_BETWEEN'].includes(String(value))) ||
      (key === 'layoutPositioning' && ['AUTO', 'ABSOLUTE'].includes(String(value))) ||
      (['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].includes(key) && typeof value === 'number' && Number.isFinite(value) && value >= 0) ||
      (key === 'horizontalConstraint' && ['MIN', 'CENTER', 'MAX', 'STRETCH', 'SCALE'].includes(String(value))) ||
      (key === 'verticalConstraint' && ['MIN', 'CENTER', 'MAX', 'STRETCH', 'SCALE'].includes(String(value))) ||
      (key === 'width' && value === 'parent') ||
      (['x', 'y'].includes(key) && typeof value === 'number' && Number.isFinite(value))
    ))) return [];
  }
  if (keys.length === 1 && keys[0] === 'textStyle' && object(changes.textStyle) &&
    typeof changes.textStyle.tokenPath === 'string' && changes.textStyle.tokenPath.length > 0 &&
    typeof changes.textStyle.name === 'string' && changes.textStyle.name.length > 0) return [];
  if (keys.length === 1 && keys[0] === 'richText' && object(changes.richText) && object(changes.richText.baseFont) &&
    typeof changes.richText.baseFont.family === 'string' && typeof changes.richText.baseFont.style === 'string' &&
    Array.isArray(changes.richText.ranges) && changes.richText.ranges.every((range) => object(range) &&
      Number.isInteger(range.start) && Number.isInteger(range.end) && Number(range.start) >= 0 && Number(range.end) > Number(range.start) &&
      object(range.font) && typeof range.font.family === 'string' && typeof range.font.style === 'string')) return [];
  return ['set-properties changes are not a governed layout, Text Style, or rich-range operation'];
}

export function emitBridgeApplyScript(campaign: RepairCampaign, plan: DryRun, run: 'first' | 'second'): string {
  const invalid = plan.operations.flatMap((operation) => validateBridgeOperation(operation).map((issue) => `${operation.operationId}: ${issue}`));
  if (invalid.length > 0) throw new Error(`bridge emitter refused: ${invalid.join(', ')}`);
  const generatedRunners = plan.operations
    .filter((operation) => operation.mechanism === 'generated-amend')
    .map((operation) => {
      const ref = String(operation.changes.generatedScriptRef);
      const source = readFileSync(path.resolve(process.cwd(), ref), 'utf8');
      return `${JSON.stringify(operation.operationId)}: async () => {\n${source}\n}`;
    })
    .join(',\n');
  const payload = {
    schemaVersion: '1.0.0',
    campaignId: campaign.campaignId,
    fileKey: campaign.filePin.fileKey,
    fileVersionId: campaign.filePin.versionId,
    run,
    evidenceRoot: campaign.workflow?.evidenceRoot,
    operations: plan.operations,
    targets: campaign.targets.map((target) => ({
    targetId: target.targetId,
    masterNodeId: target.masterNodeId,
    expectedMasterName: target.expectedMasterName,
    expectedVariantNames: target.expectedVariantNames ?? [],
    responsiveWidths: target.responsiveWidths ?? [],
    subjectKind: campaign.workflow?.subjectKind ?? 'organism',
    })),
  };
  return `const INPUT = ${JSON.stringify(payload)};
const GENERATED_RUNNERS = {${generatedRunners}};
await figma.loadAllPagesAsync();
if (figma.fileKey !== INPUT.fileKey) throw new Error('Wrong Figma file: expected ' + INPUT.fileKey + ', got ' + figma.fileKey);
const MARK_NS = 'ds_contracts';
const MARK_KEY = 'organismContainerFor';
const TEXT_STYLE_MARK = 'textStyleToken';
const all = [];
for (const page of figma.root.children) for (const node of page.findAll(() => true)) all.push(node);
const pageOf = (node) => { let cursor = node; while (cursor && cursor.type !== 'PAGE') cursor = cursor.parent; return cursor; };
const componentLike = (node) => node && (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET' || node.type === 'INSTANCE');
const masterLike = (node) => node && (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET');
// One pass over the script-start snapshot builds both lookups. Operations keep
// resolving against pre-mutation state exactly as the per-operation filters
// over \`all\` did — a container created mid-run was never visible to either.
const mastersByName = new Map();
const markedContainersByTarget = new Map();
for (const node of all) {
  if (masterLike(node)) {
    const bucket = mastersByName.get(node.name);
    if (bucket) bucket.push(node); else mastersByName.set(node.name, [node]);
  } else if (node.type === 'FRAME') {
    const mark = node.getSharedPluginData(MARK_NS, MARK_KEY);
    if (mark) {
      const bucket = markedContainersByTarget.get(mark);
      if (bucket) bucket.push(node); else markedContainersByTarget.set(mark, [node]);
    }
  }
}
const sameNamedMasters = (name) => mastersByName.get(name) ?? [];
const markedContainers = (targetId) => markedContainersByTarget.get(targetId) ?? [];
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
    const sameNamed = sameNamedMasters(target.expectedMasterName);
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
  const sameNamed = sameNamedMasters(target.expectedMasterName);
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
  const sameNamed = sameNamedMasters(target.expectedMasterName);
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
`;
}
