// Owner-requested H2 presentation cleanup. Keeps one recommended proposal in
// exactly three review frames and removes only proposal frames created by 028.

const INPUT = {
  featureId: '028-figma-responsive-hero-video',
  workAreaId: '2577:5984',
  protectedIds: {
    master: '2151:5552',
    container: '2448:4731',
    home: '2170:6351',
    header: '210:473',
    buttonMaster: '6:135',
  },
  originalProposalFrameIds: [
    '2577:5997', '2577:6021', '2577:6045',
    '2577:6069', '2577:6093', '2577:6117',
    '2577:6141', '2577:6165', '2577:6189',
    '2577:6213', '2577:6237', '2577:6261',
    '2577:6285', '2577:6309', '2577:6333',
    '2577:6357', '2577:6381', '2577:6405',
    '2577:6429', '2577:6453', '2577:6477',
    '2577:6501', '2577:6525',
  ],
  retained: [
    { nodeId: '2577:6069', caseId: 'witness-390', name: 'À VALIDER · 1/3 · MOBILE 390', x: 160, y: 180 },
    { nodeId: '2577:6213', caseId: 'witness-1200', name: 'À VALIDER · 2/3 · DESKTOP 1200', x: 710, y: 180 },
    { nodeId: '2577:6357', caseId: 'witness-1728', name: 'À VALIDER · 3/3 · LARGE ACTUEL 1728', x: 2070, y: 180 },
  ],
};

await figma.loadAllPagesAsync();
const required = {};
for (const [role, id] of Object.entries(INPUT.protectedIds)) {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`H2 review cleanup refused: missing protected ${role} ${id}`);
  required[role] = node;
}
const workArea = await figma.getNodeByIdAsync(INPUT.workAreaId);
if (!workArea || workArea.type !== 'SECTION') throw new Error('H2 review cleanup refused: work area missing');
if (workArea.getSharedPluginData('ds_contracts', 'heroVideoResponsiveWorkArea') !== INPUT.featureId) {
  throw new Error('H2 review cleanup refused: work area marker drift');
}
const pageOf = (node) => {
  let cursor = node;
  while (cursor && cursor.type !== 'PAGE') cursor = cursor.parent;
  return cursor;
};
const dsPage = pageOf(workArea);
if (!dsPage || dsPage.name !== 'DS · Organisms') throw new Error('H2 review cleanup refused: unexpected page');

const master = required.master;
const container = required.container;
const home = required.home;
const header = required.header;
const buttonMaster = required.buttonMaster;
if (master.type !== 'COMPONENT' || master.key !== '36011e51b8bc0b221a1ba6f9108709b5bd1c4490') {
  throw new Error('H2 review cleanup refused: historical master identity drift');
}
if (container.type !== 'FRAME' || master.parent?.id !== container.id || container.children.length !== 1) {
  throw new Error('H2 review cleanup refused: governed Container topology drift');
}
if (home.type !== 'INSTANCE' || (await home.getMainComponentAsync())?.id !== master.id) {
  throw new Error('H2 review cleanup refused: Home link drift');
}
if (header.type !== 'INSTANCE' || buttonMaster.type !== 'COMPONENT') {
  throw new Error('H2 review cleanup refused: protected context identity drift');
}

const box = (node) => node.absoluteBoundingBox
  ? { x: node.absoluteBoundingBox.x, y: node.absoluteBoundingBox.y, width: node.absoluteBoundingBox.width, height: node.absoluteBoundingBox.height }
  : null;
const protectedSnapshot = async () => ({
  master: {
    id: master.id,
    key: master.key,
    name: master.name,
    parentId: master.parent?.id || null,
    bounds: box(master),
    childIds: master.children.map((node) => node.id),
    boundVariables: master.boundVariables,
  },
  container: { id: container.id, bounds: box(container), childIds: container.children.map((node) => node.id) },
  home: {
    id: home.id,
    mainComponentId: (await home.getMainComponentAsync())?.id || null,
    bounds: box(home),
    componentProperties: home.componentProperties,
  },
  header: { id: header.id, bounds: box(header), componentProperties: header.componentProperties },
  buttonMaster: { id: buttonMaster.id, key: buttonMaster.key, name: buttonMaster.name },
});

const beforeProtected = await protectedSnapshot();
const expectedIds = [...INPUT.originalProposalFrameIds].sort();
const actualIds = workArea.children.map((node) => node.id).sort();
if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
  throw new Error(`H2 review cleanup refused: work area children drift (${workArea.children.length} observed, 23 expected)`);
}
for (const child of workArea.children) {
  if (child.type !== 'FRAME' || child.getSharedPluginData('ds_contracts', 'heroVideoResponsiveWorkArea') !== INPUT.featureId) {
    throw new Error(`H2 review cleanup refused: undeclared child ${child.id}`);
  }
}

const retainedIds = new Set(INPUT.retained.map((entry) => entry.nodeId));
for (const expected of INPUT.retained) {
  const node = await figma.getNodeByIdAsync(expected.nodeId);
  if (!node || node.type !== 'FRAME' || node.parent?.id !== workArea.id) {
    throw new Error(`H2 review cleanup refused: retained frame ${expected.nodeId} missing`);
  }
  if (node.getPluginData('optionId') !== 'option-a-balanced' ||
      node.getPluginData('fixtureId') !== 'default' ||
      !node.name.includes(expected.caseId)) {
    throw new Error(`H2 review cleanup refused: retained frame identity drift for ${expected.nodeId}`);
  }
}

const removedNodeIds = [];
for (const child of [...workArea.children]) {
  if (retainedIds.has(child.id)) continue;
  removedNodeIds.push(child.id);
  child.remove();
}
for (const expected of INPUT.retained) {
  const node = await figma.getNodeByIdAsync(expected.nodeId);
  node.name = expected.name;
  node.x = expected.x;
  node.y = expected.y;
  node.setPluginData('ownerReviewState', 'single-option-awaiting-validation');
}
workArea.name = 'À VALIDER · HeroVideo · OPTION RECOMMANDÉE · 3 ÉCRANS';
workArea.resizeWithoutConstraints(3960, 1060);
workArea.setPluginData('reviewMode', 'single-option-three-screens');
workArea.setPluginData('ownerInstruction', 'validate-or-reject-this-single-proposal');

const afterProtected = await protectedSnapshot();
if (JSON.stringify(afterProtected) !== JSON.stringify(beforeProtected)) {
  throw new Error('H2 review cleanup refused after mutation: a protected existing fact changed');
}
const remainingIds = workArea.children.map((node) => node.id);
if (remainingIds.length !== 3 || remainingIds.some((id) => !retainedIds.has(id))) {
  throw new Error('H2 review cleanup refused after mutation: review surface is not exactly three frames');
}

return {
  schemaVersion: '1.0.0',
  featureId: INPUT.featureId,
  run: 'h2-simplify-owner-review',
  fileKey: figma.fileKey,
  executedAt: new Date().toISOString(),
  workArea: {
    nodeId: workArea.id,
    name: workArea.name,
    pageId: dsPage.id,
    pageName: dsPage.name,
    reviewMode: workArea.getPluginData('reviewMode'),
  },
  retainedFrames: INPUT.retained.map((entry) => ({ nodeId: entry.nodeId, name: entry.name, caseId: entry.caseId })),
  removedProposalFrameIds: removedNodeIds,
  inspection: {
    protectedExistingFactsUnchanged: JSON.stringify(afterProtected) === JSON.stringify(beforeProtected),
    beforeProtected,
    afterProtected,
    masterWrites: [],
    containerWrites: [],
    homeWrites: [],
    headerWrites: [],
    sharedDependencyWrites: [],
    pageWrites: [],
    changedExistingNodeIds: [],
    changedProposalNodeIds: INPUT.retained.map((entry) => entry.nodeId),
    removedCreatedProposalNodeIds: removedNodeIds,
  },
  figmaWrites: {
    createdNodeIds: [],
    changedExistingNodeIds: [],
    changedProposalNodeIds: [workArea.id, ...INPUT.retained.map((entry) => entry.nodeId)],
    removedCreatedProposalNodeIds: removedNodeIds,
  },
  scriptResults: [{
    operationId: 'simplify-owner-review-to-one-option-three-screens',
    result: {
      applied: true,
      retainedCount: 3,
      removedCount: removedNodeIds.length,
      changedExistingNodeIds: [],
      protectedExistingFactsUnchanged: true,
    },
  }],
};
