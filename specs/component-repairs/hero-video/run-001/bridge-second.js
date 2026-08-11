const INPUT = {"schemaVersion":"1.0.0","campaignId":"repair-hero-video-calibration","fileKey":"d9FYAUcqdcNtsuaMgLefvJ","fileVersionId":"2386482317851487818","run":"second","evidenceRoot":"specs/component-repairs/hero-video/run-001","operations":[{"operationId":"ensure-hero-video-container","targetId":"hero-video","mechanism":"ensure-organism-container","nodeId":"2151:5552","structuralPath":"0","changes":{"containerName":"Container · HeroVideo","layoutMode":"HORIZONTAL","referenceWidth":1728,"referenceHeight":720,"layoutSizingHorizontal":"FILL"},"preconditions":[{"field":"nodeId","equals":"2151:5552"},{"field":"parentNodeId","equals":"2170:6360"},{"field":"parentType","equals":"SECTION"}],"postconditions":[{"field":"masterNodeId","equals":"2151:5552"},{"field":"parentName","equals":"Container · HeroVideo"},{"field":"layoutSizingHorizontal","equals":"FILL"}],"source":"campaign.allowlist"}],"targets":[{"targetId":"hero-video","masterNodeId":"2151:5552","expectedMasterName":"HeroVideo","expectedVariantNames":[],"responsiveWidths":[1440]}]};
await figma.loadAllPagesAsync();
const MARK_NS = 'ds_contracts';
const MARK_KEY = 'organismContainerFor';
const all = [];
for (const page of figma.root.children) all.push(...page.findAll(() => true));
const byId = new Map(all.map((node) => [node.id, node]));
const pageOf = (node) => { let cursor = node; while (cursor && cursor.type !== 'PAGE') cursor = cursor.parent; return cursor; };
const componentLike = (node) => node && (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET' || node.type === 'INSTANCE');
const masterLike = (node) => node && (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET');
const markedContainers = (targetId) => all.filter((node) => node.type === 'FRAME' && node.getSharedPluginData(MARK_NS, MARK_KEY) === targetId);
const scriptResults = [];
const containerByTarget = new Map();
for (const operation of INPUT.operations) {
  const target = INPUT.targets.find((entry) => entry.targetId === operation.targetId);
  if (!target) throw new Error('Missing target for ' + operation.operationId);
  const master = await figma.getNodeByIdAsync(operation.nodeId);
  if (!master || (master.type !== 'COMPONENT' && master.type !== 'COMPONENT_SET')) throw new Error('Pinned master absent: ' + operation.nodeId);
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
    if (!master.parent || master.parent.id !== expectedParentId || master.parent.type !== expectedParentType) {
      throw new Error('Master parent precondition drift: ' + master.id);
    }
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
    createdNodeIds.push(container.id);
    changedNodeIds.push(master.id, container.id);
  } else {
    if (master.parent?.id !== container.id) throw new Error('Governed Container does not own pinned master: ' + container.id);
    const siblings = container.children.filter(componentLike);
    if (siblings.length !== 1 || siblings[0].id !== master.id) throw new Error('Governed Container contains another organism presentation');
    let changed = false;
    if (container.name !== changes.containerName) { container.name = String(changes.containerName); changed = true; }
    if (container.layoutMode !== changes.layoutMode) { container.layoutMode = String(changes.layoutMode); changed = true; }
    if (container.width !== Number(changes.referenceWidth) || container.height !== Number(changes.referenceHeight)) {
      container.resize(Number(changes.referenceWidth), Number(changes.referenceHeight)); changed = true;
    }
    if (master.layoutSizingHorizontal !== 'FILL') { master.layoutSizingHorizontal = 'FILL'; changed = true; }
    if (changed) changedNodeIds.push(master.id, container.id);
  }
  containerByTarget.set(operation.targetId, container);
  const noOp = createdNodeIds.length === 0 && changedNodeIds.length === 0;
  scriptResults.push({
    operationId: operation.operationId,
    targetId: operation.targetId,
    nodeId: operation.nodeId,
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
  const container = containerByTarget.get(target.targetId);
  for (const width of target.responsiveWidths) {
    const original = { width: container.width, height: container.height };
    const screenshotRef = INPUT.evidenceRoot + '/responsive-' + width + '-' + INPUT.run + '.png';
    try {
      container.resize(width, original.height);
      const overflow = master.x < 0 || master.y < 0 || master.x + master.width > container.width + 0.01 || master.y + master.height > container.height + 0.01;
      const bytes = await container.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
      responsiveChecks.push({ targetId: target.targetId, width, overflow, screenshotRef });
      responsiveImages.push({ path: screenshotRef, base64: figma.base64Encode(bytes) });
    } finally {
      container.resize(original.width, original.height);
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
