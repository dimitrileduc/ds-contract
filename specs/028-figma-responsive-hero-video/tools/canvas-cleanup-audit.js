// Read-only audit for the post-H3 HeroVideo canvas cleanup.

const INPUT = {
  featureId: '028-figma-responsive-hero-video',
  fileKey: 'd9FYAUcqdcNtsuaMgLefvJ',
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

const fact = async (node) => ({
  id: node.id,
  type: node.type,
  name: node.name,
  parentId: node.parent?.id || null,
  x: 'x' in node ? node.x : null,
  y: 'y' in node ? node.y : null,
  width: 'width' in node ? node.width : null,
  height: 'height' in node ? node.height : null,
  bounds: box(node),
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
  throw new Error('Canvas cleanup audit refused: DS · Organisms page drift');
}
if (!heroSection || heroSection.type !== 'SECTION' || heroSection.name !== 'Hero vidéo') {
  throw new Error('Canvas cleanup audit refused: Hero vidéo section drift');
}
if (!container || container.type !== 'FRAME' || container.name !== 'Container · HeroVideo') {
  throw new Error('Canvas cleanup audit refused: governed Container drift');
}
if (!componentSet || componentSet.type !== 'COMPONENT_SET' || componentSet.parent?.id !== container.id) {
  throw new Error('Canvas cleanup audit refused: HeroVideo component set drift');
}
if (JSON.stringify(componentSet.children.map((child) => child.id).sort()) !==
    JSON.stringify([...INPUT.memberIds].sort())) {
  throw new Error('Canvas cleanup audit refused: responsive member identity drift');
}

const workArea = await figma.getNodeByIdAsync(INPUT.workAreaId);
let workAreaState;
if (workArea) {
  if (workArea.type !== 'SECTION' ||
      workArea.getSharedPluginData('ds_contracts', 'heroVideoResponsiveWorkArea') !== INPUT.featureId ||
      workArea.getPluginData('reviewMode') !== 'approved-option-three-screens' ||
      JSON.stringify(workArea.children.map((node) => node.id).sort()) !==
        JSON.stringify([...INPUT.retainedFrameIds].sort())) {
    throw new Error('Canvas cleanup audit refused: retired H2 work area identity drift');
  }
  workAreaState = {
    status: 'retained-duplicate',
    node: await fact(workArea),
    marker: workArea.getSharedPluginData('ds_contracts', 'heroVideoResponsiveWorkArea'),
    reviewMode: workArea.getPluginData('reviewMode'),
  };
} else {
  const orphaned = [];
  for (const nodeId of INPUT.retainedFrameIds) {
    if (await figma.getNodeByIdAsync(nodeId)) orphaned.push(nodeId);
  }
  if (orphaned.length > 0) {
    throw new Error(`Canvas cleanup audit refused: orphaned H2 frames ${orphaned.join(', ')}`);
  }
  workAreaState = { status: 'retired', node: null, marker: null, reviewMode: null };
}

const isOriginalPlacement = heroSection.parent?.id === page.id &&
  heroSection.children.length === 0 && container.parent?.id === page.id;
const isOrganizedPlacement = heroSection.parent?.id === page.id &&
  heroSection.children.length === 1 && heroSection.children[0].id === container.id &&
  container.x === INPUT.inset && container.y === INPUT.inset &&
  heroSection.width === container.width + INPUT.inset * 2 &&
  heroSection.height === container.height + INPUT.inset * 2;
if (!isOriginalPlacement && !isOrganizedPlacement) {
  throw new Error('Canvas cleanup audit refused: HeroVideo presentation placement drift');
}

const protectedFacts = [];
for (const nodeId of [...INPUT.memberIds, INPUT.componentSetId, ...INPUT.protectedIds]) {
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Canvas cleanup audit refused: protected node missing ${nodeId}`);
  protectedFacts.push(await fact(node));
}

return {
  schemaVersion: '1.0.0',
  featureId: INPUT.featureId,
  run: 'canvas-cleanup-audit',
  fileKey: figma.fileKey,
  executedAt: new Date().toISOString(),
  state: {
    workArea: workAreaState,
    placement: isOrganizedPlacement ? 'organized' : 'original',
    heroSection: await fact(heroSection),
    container: await fact(container),
    componentSet: await fact(componentSet),
    protectedFacts,
  },
  inspection: {
    readOnly: true,
    createdNodeIds: [],
    removedNodeIds: [],
    changedNodeIds: [],
    pageWrites: [],
    childWrites: [],
  },
  scriptResults: [{
    operationId: 'audit-hero-video-canvas-cleanup',
    result: {
      applied: false,
      workAreaStatus: workAreaState.status,
      placement: isOrganizedPlacement ? 'organized' : 'original',
    },
  }],
};
