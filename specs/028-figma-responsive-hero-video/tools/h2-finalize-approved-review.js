// Final H2 disposition after explicit owner approval. Renames only the marked
// proposal work area and its three retained frames; governed nodes stay read-only.

const INPUT = {
  featureId: '028-figma-responsive-hero-video',
  decisionRef: 'specs/028-figma-responsive-hero-video/decisions/H2-design.json',
  decidedAt: '2026-08-25T21:19:31Z',
  workAreaId: '2577:5984',
  retained: [
    { nodeId: '2577:6069', name: 'VALIDÉ · 1/3 · MOBILE 390' },
    { nodeId: '2577:6213', name: 'VALIDÉ · 2/3 · DESKTOP 1200' },
    { nodeId: '2577:6357', name: 'VALIDÉ · 3/3 · LARGE ACTUEL 1728' },
  ],
  protectedIds: ['2151:5552', '2448:4731', '2170:6351', '210:473', '6:135'],
};

await figma.loadAllPagesAsync();
const workArea = await figma.getNodeByIdAsync(INPUT.workAreaId);
if (!workArea || workArea.type !== 'SECTION') throw new Error('H2 finalize refused: work area missing');
if (workArea.getSharedPluginData('ds_contracts', 'heroVideoResponsiveWorkArea') !== INPUT.featureId) {
  throw new Error('H2 finalize refused: work area marker drift');
}
if (workArea.getPluginData('reviewMode') !== 'single-option-three-screens') {
  throw new Error('H2 finalize refused: simplified review state missing');
}
const retainedIds = INPUT.retained.map((entry) => entry.nodeId);
if (workArea.children.length !== 3 ||
    JSON.stringify(workArea.children.map((node) => node.id).sort()) !== JSON.stringify([...retainedIds].sort())) {
  throw new Error('H2 finalize refused: expected exactly the three retained proposal frames');
}

const protectedNodes = [];
for (const id of INPUT.protectedIds) {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`H2 finalize refused: missing protected node ${id}`);
  protectedNodes.push(node);
}
const box = (node) => node.absoluteBoundingBox
  ? { x: node.absoluteBoundingBox.x, y: node.absoluteBoundingBox.y, width: node.absoluteBoundingBox.width, height: node.absoluteBoundingBox.height }
  : null;
const snapshot = async () => {
  const rows = [];
  for (const node of protectedNodes) {
    let mainComponentId = null;
    if (node.type === 'INSTANCE') mainComponentId = (await node.getMainComponentAsync())?.id || null;
    rows.push({
      id: node.id,
      type: node.type,
      name: node.name,
      key: 'key' in node ? node.key : null,
      parentId: node.parent?.id || null,
      bounds: box(node),
      childIds: 'children' in node ? node.children.map((child) => child.id) : [],
      mainComponentId,
      componentProperties: 'componentProperties' in node ? node.componentProperties : null,
      boundVariables: 'boundVariables' in node ? node.boundVariables : null,
    });
  }
  return rows;
};
const beforeProtected = await snapshot();

for (const expected of INPUT.retained) {
  const node = await figma.getNodeByIdAsync(expected.nodeId);
  if (!node || node.type !== 'FRAME' || node.parent?.id !== workArea.id ||
      node.getPluginData('optionId') !== 'option-a-balanced') {
    throw new Error(`H2 finalize refused: retained proposal identity drift ${expected.nodeId}`);
  }
  node.name = expected.name;
  node.setPluginData('ownerReviewState', 'retained-accepted-H2');
  node.setPluginData('h2DecisionRef', INPUT.decisionRef);
  node.setPluginData('h2DecidedAt', INPUT.decidedAt);
}
workArea.name = 'VALIDÉ · HeroVideo · OPTION RETENUE · 3 ÉCRANS';
workArea.setPluginData('reviewMode', 'approved-option-three-screens');
workArea.setPluginData('h2DecisionRef', INPUT.decisionRef);
workArea.setPluginData('h2DecidedAt', INPUT.decidedAt);

const afterProtected = await snapshot();
if (JSON.stringify(afterProtected) !== JSON.stringify(beforeProtected)) {
  throw new Error('H2 finalize refused after mutation: a protected existing fact changed');
}

return {
  schemaVersion: '1.0.0',
  featureId: INPUT.featureId,
  run: 'h2-finalize-approved-review',
  fileKey: figma.fileKey,
  executedAt: new Date().toISOString(),
  workArea: {
    nodeId: workArea.id,
    name: workArea.name,
    reviewMode: workArea.getPluginData('reviewMode'),
  },
  retainedFrames: INPUT.retained,
  decisionRef: INPUT.decisionRef,
  inspection: {
    protectedExistingFactsUnchanged: JSON.stringify(afterProtected) === JSON.stringify(beforeProtected),
    changedExistingNodeIds: [],
    changedProposalNodeIds: [workArea.id, ...retainedIds],
    masterWrites: [],
    containerWrites: [],
    homeWrites: [],
    headerWrites: [],
    sharedDependencyWrites: [],
    pageWrites: [],
  },
  figmaWrites: {
    createdNodeIds: [],
    removedNodeIds: [],
    changedExistingNodeIds: [],
    changedProposalNodeIds: [workArea.id, ...retainedIds],
  },
  scriptResults: [{
    operationId: 'finalize-approved-H2-review-surface',
    result: { applied: true, retainedCount: 3, changedExistingNodeIds: [], protectedExistingFactsUnchanged: true },
  }],
};
