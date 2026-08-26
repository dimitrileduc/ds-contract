// Idempotent post-H3 cleanup approved by the owner on 2026-08-26.
// Retires only the marked H2 proposal area and reuses the empty Hero vidéo
// section as the presentation wrapper for the governed Container.

const INPUT = {
  featureId: '028-figma-responsive-hero-video',
  pageId: '2052:1146',
  workAreaId: '2577:5984',
  retainedFrameIds: ['2577:6069', '2577:6213', '2577:6357'],
  heroSectionId: '2170:6360',
  containerId: '2448:4731',
  componentSetId: '2580:7392',
  memberIds: ['2151:5552', '2580:7378', '2580:7385'],
  protectedIds: ['2167:5842', '210:473', '6:135', '2170:6351'],
  inset: 40,
};

await figma.loadAllPagesAsync();

const box = (node) => node.absoluteBoundingBox
  ? {
      x: node.absoluteBoundingBox.x,
      y: node.absoluteBoundingBox.y,
      width: node.absoluteBoundingBox.width,
      height: node.absoluteBoundingBox.height,
    }
  : null;

const protectedFact = async (node) => ({
  id: node.id,
  type: node.type,
  name: node.name,
  parentId: node.parent?.id || null,
  bounds: box(node),
  width: 'width' in node ? node.width : null,
  height: 'height' in node ? node.height : null,
  layoutMode: 'layoutMode' in node ? node.layoutMode : null,
  layoutSizingHorizontal: 'layoutSizingHorizontal' in node ? node.layoutSizingHorizontal : null,
  childIds: 'children' in node ? node.children.map((child) => child.id) : [],
  mainComponentId: node.type === 'INSTANCE' ? (await node.getMainComponentAsync())?.id || null : null,
  componentProperties: 'componentProperties' in node ? node.componentProperties : null,
});

const page = await figma.getNodeByIdAsync(INPUT.pageId);
const heroSection = await figma.getNodeByIdAsync(INPUT.heroSectionId);
const container = await figma.getNodeByIdAsync(INPUT.containerId);
const componentSet = await figma.getNodeByIdAsync(INPUT.componentSetId);
if (!page || page.type !== 'PAGE' || page.name !== 'DS · Organisms') {
  throw new Error('Canvas cleanup refused: DS · Organisms page drift');
}
if (!heroSection || heroSection.type !== 'SECTION' || heroSection.name !== 'Hero vidéo') {
  throw new Error('Canvas cleanup refused: Hero vidéo section drift');
}
if (!container || container.type !== 'FRAME' || container.name !== 'Container · HeroVideo') {
  throw new Error('Canvas cleanup refused: governed Container drift');
}
if (!componentSet || componentSet.type !== 'COMPONENT_SET' || componentSet.parent?.id !== container.id ||
    JSON.stringify(componentSet.children.map((child) => child.id).sort()) !==
      JSON.stringify([...INPUT.memberIds].sort())) {
  throw new Error('Canvas cleanup refused: responsive set topology drift');
}

const protectedNodes = [];
for (const nodeId of [...INPUT.memberIds, INPUT.componentSetId, ...INPUT.protectedIds]) {
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Canvas cleanup refused: protected node missing ${nodeId}`);
  protectedNodes.push(node);
}
const snapshotProtected = async () => {
  const rows = [];
  for (const node of protectedNodes) rows.push(await protectedFact(node));
  return rows;
};
const beforeProtected = await snapshotProtected();

let workArea = await figma.getNodeByIdAsync(INPUT.workAreaId);
const alreadyOrganized = heroSection.parent?.id === page.id &&
  heroSection.children.length === 1 && heroSection.children[0].id === container.id &&
  container.x === INPUT.inset && container.y === INPUT.inset &&
  heroSection.width === container.width + INPUT.inset * 2 &&
  heroSection.height === container.height + INPUT.inset * 2;

if (!workArea && alreadyOrganized) {
  const afterProtected = await snapshotProtected();
  if (JSON.stringify(afterProtected) !== JSON.stringify(beforeProtected)) {
    throw new Error('Canvas cleanup no-op refused: protected facts drifted during inspection');
  }
  return {
    schemaVersion: '1.0.0',
    featureId: INPUT.featureId,
    run: 'canvas-cleanup-second',
    fileKey: figma.fileKey,
    executedAt: new Date().toISOString(),
    inspection: {
      protectedFactsUnchanged: true,
      createdNodeIds: [],
      removedNodeIds: [],
      changedNodeIds: [],
      pageWrites: [],
      childWrites: [],
    },
    scriptResults: [{
      operationId: 'retire-h2-and-organize-hero-video',
      status: 'no-op',
      result: { applied: false, removedCount: 0, changedCount: 0 },
    }],
  };
}

if (!workArea || workArea.type !== 'SECTION' ||
    workArea.getSharedPluginData('ds_contracts', 'heroVideoResponsiveWorkArea') !== INPUT.featureId ||
    workArea.getPluginData('reviewMode') !== 'approved-option-three-screens' ||
    JSON.stringify(workArea.children.map((node) => node.id).sort()) !==
      JSON.stringify([...INPUT.retainedFrameIds].sort())) {
  throw new Error('Canvas cleanup refused: H2 work area identity drift');
}
if (heroSection.parent?.id !== page.id || heroSection.children.length !== 0 || container.parent?.id !== page.id) {
  throw new Error('Canvas cleanup refused: expected empty section and page-level Container');
}

const originalContainerBounds = box(container);
if (!originalContainerBounds) throw new Error('Canvas cleanup refused: Container has no absolute bounds');

heroSection.x = originalContainerBounds.x - INPUT.inset;
heroSection.y = originalContainerBounds.y - INPUT.inset;
heroSection.resizeWithoutConstraints(container.width + INPUT.inset * 2, container.height + INPUT.inset * 2);
heroSection.appendChild(container);
container.x = INPUT.inset;
container.y = INPUT.inset;
workArea.remove();
workArea = null;

const organized = heroSection.children.length === 1 && heroSection.children[0].id === container.id &&
  container.x === INPUT.inset && container.y === INPUT.inset &&
  heroSection.width === container.width + INPUT.inset * 2 &&
  heroSection.height === container.height + INPUT.inset * 2;
if (!organized) throw new Error('Canvas cleanup refused after mutation: organized placement missing');
if (await figma.getNodeByIdAsync(INPUT.workAreaId)) {
  throw new Error('Canvas cleanup refused after mutation: H2 work area still exists');
}
for (const nodeId of INPUT.retainedFrameIds) {
  if (await figma.getNodeByIdAsync(nodeId)) {
    throw new Error(`Canvas cleanup refused after mutation: retained H2 frame still exists ${nodeId}`);
  }
}

const afterProtected = await snapshotProtected();
if (JSON.stringify(afterProtected) !== JSON.stringify(beforeProtected)) {
  throw new Error('Canvas cleanup refused after mutation: a protected responsive/Header/Home fact changed');
}
if (JSON.stringify(box(container)) !== JSON.stringify(originalContainerBounds)) {
  throw new Error('Canvas cleanup refused after mutation: Container absolute bounds changed');
}

return {
  schemaVersion: '1.0.0',
  featureId: INPUT.featureId,
  run: 'canvas-cleanup-first',
  fileKey: figma.fileKey,
  executedAt: new Date().toISOString(),
  inspection: {
    protectedFactsUnchanged: true,
    containerAbsoluteBoundsUnchanged: true,
    createdNodeIds: [],
    removedNodeIds: [INPUT.workAreaId, ...INPUT.retainedFrameIds],
    changedNodeIds: [INPUT.heroSectionId, INPUT.containerId],
    pageWrites: [],
    childWrites: [],
  },
  placement: {
    sectionId: heroSection.id,
    sectionBounds: box(heroSection),
    containerId: container.id,
    containerBounds: box(container),
    inset: INPUT.inset,
  },
  scriptResults: [{
    operationId: 'retire-h2-and-organize-hero-video',
    status: 'applied',
    result: { applied: true, removedCount: 4, changedCount: 2 },
  }],
};
