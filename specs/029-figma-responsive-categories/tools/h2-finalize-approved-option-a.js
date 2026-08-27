// Final H2 owner surface after explicit owner selection of Option 1 / A.
// Shows only the accepted, genuinely different 834 px state at true 1:1 size.
// Exhaustive breakpoint coverage stays in the hidden technical archive.

await figma.loadAllPagesAsync();

const INPUT = {
  featureId: '029-figma-responsive-categories',
  pageId: '2052:1146',
  acceptedScenarioId: 'orphan-preserve',
  rejectedScenarioId: 'orphan-stretch',
  source: {
    sectionSet: { id: '2115:4277', key: '94f64a369a5db615d68935bb353614eaaadbffc2' },
    cardSet: { id: '2495:6770', key: '0d1a03d07abf7225fb560b3d4163dd3575132c62' },
    usages: ['2115:4392', '2115:4278', '2115:4438', '2115:4297', '2115:4411', '2115:4324', '2115:4364'],
    protectedDependencies: ['6:104', '9:206', '230:585', '230:599'],
  },
};

const get = async (id, role) => {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`H2 finalize refused: missing ${role} ${id}`);
  return node;
};
const page = await get(INPUT.pageId, 'work page');
const sectionSet = await get(INPUT.source.sectionSet.id, 'section set');
const cardSet = await get(INPUT.source.cardSet.id, 'card set');
if (page.type !== 'PAGE' || page.name !== 'DS · Organisms') throw new Error('H2 finalize refused: work page drift');
if (sectionSet.type !== 'COMPONENT_SET' || sectionSet.key !== INPUT.source.sectionSet.key) throw new Error('H2 finalize refused: section identity drift');
if (cardSet.type !== 'COMPONENT_SET' || cardSet.key !== INPUT.source.cardSet.key) throw new Error('H2 finalize refused: card identity drift');

const usageNodes = await Promise.all(INPUT.source.usages.map((id) => get(id, 'Page usage')));
const protectedDependencies = await Promise.all(INPUT.source.protectedDependencies.map((id) => get(id, 'protected dependency')));
const usageFacts = [];
for (const node of usageNodes) {
  if (node.type !== 'INSTANCE') throw new Error(`H2 finalize refused: usage type drift ${node.id}`);
  const main = await node.getMainComponentAsync();
  usageFacts.push({
    id: node.id,
    style: String(node.componentProperties?.Style?.value || ''),
    columns: Number(node.componentProperties?.Colonnes?.value || 0),
    mainComponentId: main?.id || null,
    parentId: node.parent?.id || null,
  });
}
const usageDistribution = {
  columns2: usageFacts.filter((usage) => usage.columns === 2).length,
  columns3: usageFacts.filter((usage) => usage.columns === 3).length,
  columns3Empile: usageFacts.filter((usage) => usage.columns === 3 && usage.style === 'Empile').length,
};
if (usageDistribution.columns2 !== 6 || usageDistribution.columns3 !== 1 || usageDistribution.columns3Empile !== 1) {
  throw new Error(`H2 finalize refused: usage distribution drift ${JSON.stringify(usageDistribution)}`);
}

const workAreas = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveWorkArea') === INPUT.featureId);
const archives = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveTechnicalArchive') === INPUT.featureId);
if (workAreas.length !== 1 || archives.length !== 1) throw new Error('H2 finalize refused: work area/archive topology drift');
const workArea = workAreas[0];
const archive = archives[0];
const technicalFrames = archive.children.filter((node) => node.type === 'FRAME' && node.getPluginData('scenarioId'));
if (archive.visible !== false || technicalFrames.length !== 28) throw new Error('H2 finalize refused: technical archive is not intact and hidden');
const sourceByScenario = new Map(technicalFrames.map((node) => [node.getPluginData('scenarioId'), node]));
const acceptedSource = sourceByScenario.get(INPUT.acceptedScenarioId);
const rejectedSource = sourceByScenario.get(INPUT.rejectedScenarioId);
if (!acceptedSource || !rejectedSource || acceptedSource.width !== 834 || rejectedSource.width !== 834) throw new Error('H2 finalize refused: decision sources missing or not 834 px');

const mainIdentity = async (node) => {
  if (node.type !== 'INSTANCE') return null;
  const main = await node.getMainComponentAsync();
  return main ? { id: main.id, key: main.key || null } : null;
};
const protectedSnapshot = async () => ({
  section: { id: sectionSet.id, key: sectionSet.key, childIds: sectionSet.children.map((node) => node.id) },
  card: { id: cardSet.id, key: cardSet.key, childIds: cardSet.children.map((node) => node.id) },
  usages: await Promise.all(usageNodes.map(async (node) => ({ id: node.id, main: await mainIdentity(node), parentId: node.parent?.id || null }))),
  dependencies: await Promise.all(protectedDependencies.map(async (node) => ({ id: node.id, key: 'key' in node ? node.key || null : null, parentId: node.parent?.id || null, main: await mainIdentity(node) }))),
});
const technicalSnapshot = () => technicalFrames.map((node) => ({
  id: node.id,
  scenarioId: node.getPluginData('scenarioId'),
  name: node.name,
  width: node.width,
  height: node.height,
  parentId: node.parent?.id || null,
}));
const beforeProtected = JSON.stringify(await protectedSnapshot());
const beforeTechnical = JSON.stringify(technicalSnapshot());

const priorReviewRoots = workArea.children.filter((node) => node.type === 'FRAME' && (
  node.getSharedPluginData('ds_contracts', 'categoriesResponsiveReviewOption') === INPUT.featureId ||
  node.getSharedPluginData('ds_contracts', 'categoriesResponsiveApprovedOption') === INPUT.featureId
));
const removedPriorReviewRootIds = priorReviewRoots.map((node) => node.id);
for (const node of priorReviewRoots) node.remove();

await figma.loadFontAsync({ family: 'Montserrat', style: 'Regular' });
const createdNodeIds = [];
const addText = (parent, characters, x, y, width, fontSize) => {
  const node = figma.createText();
  node.name = 'H2 final annotation';
  node.fontName = { family: 'Montserrat', style: 'Regular' };
  node.fontSize = fontSize;
  node.lineHeight = { unit: 'AUTO' };
  node.characters = characters;
  node.textAutoResize = 'HEIGHT';
  node.resize(width, Math.max(32, fontSize * 2));
  parent.appendChild(node);
  node.x = x;
  node.y = y;
  createdNodeIds.push(node.id);
  return node;
};

const board = figma.createFrame();
board.name = 'OPTION 1 RETENUE · 834 PX RÉELS · 3 COLONNES EMPILÉ';
board.resize(962, 400);
board.x = 160;
board.y = 160;
board.layoutMode = 'NONE';
board.clipsContent = false;
board.fills = [{ type: 'SOLID', color: { r: 0.91, g: 0.965, b: 0.92 } }];
board.setSharedPluginData('ds_contracts', 'categoriesResponsiveApprovedOption', INPUT.featureId);
board.setPluginData('optionId', 'option-a-preserve-track');
board.setPluginData('authority', 'owner-approved-h2-work-frame');
board.setPluginData('decisionScale', '1');
board.setPluginData('decisionViewportWidth', '834');
board.setPluginData('usageDistribution', '2-columns=6 unchanged;3-columns=1 decision case;style=Empile');
workArea.appendChild(board);
createdNodeIds.push(board.id);

addText(board, 'OPTION 1 RETENUE', 64, 36, 834, 28);
addText(board, '834 PX RÉELS · ÉCHELLE 1:1 · 3 COLONNES · EMPILÉ · 1 USAGE SUR 7', 64, 82, 834, 17);
addText(board, 'La troisième carte garde la largeur d’une piste. Les 6 usages en 2 colonnes sont identiques et ne sont pas dupliqués ici.', 64, 118, 834, 16);
addText(board, 'Les autres breakpoints et les contenus longs restent vérifiés dans l’archive technique masquée.', 64, 156, 834, 14);

const acceptedClone = acceptedSource.clone();
board.appendChild(acceptedClone);
const superposeGrid = acceptedClone.children.find((child) => child.type === 'FRAME' && child.name === 'H2 Superpose grid');
const empileGrid = acceptedClone.children.find((child) => child.type === 'FRAME' && child.name === 'H2 Empile grid');
if (!superposeGrid || !empileGrid) throw new Error('H2 finalize refused: style-grid drift in accepted source');
superposeGrid.remove();
acceptedClone.x = 64;
acceptedClone.y = 210;
acceptedClone.name = 'OPTION 1 RETENUE · TÉMOIN 834 PX RÉELS · EMPILÉ';
acceptedClone.setPluginData('scenarioId', '');
acceptedClone.setPluginData('sourceScenarioId', INPUT.acceptedScenarioId);
acceptedClone.setPluginData('rejectedScenarioId', INPUT.rejectedScenarioId);
acceptedClone.setPluginData('reviewRole', 'approved-real-size-decision-witness');
acceptedClone.setPluginData('viewportWidth', '834');
acceptedClone.setPluginData('configuredColumns', '3');
acceptedClone.setPluginData('currentUsageCount', '1');
acceptedClone.setPluginData('currentStyle', 'Empile');
acceptedClone.setPluginData('reviewScale', '1');
acceptedClone.setPluginData('authority', 'owner-approved-h2-work-frame');
createdNodeIds.push(acceptedClone.id);
if (acceptedClone.width !== 834) throw new Error(`H2 finalize refused: accepted witness width is ${acceptedClone.width}, expected 834`);
board.resize(962, acceptedClone.y + acceptedClone.height + 64);

workArea.name = '029 · H2 VALIDÉ · OPTION 1 · 834 PX RÉELS';
workArea.resizeWithoutConstraints(board.width + 320, board.height + 320);
workArea.setPluginData('presentationMode', 'approved-delta-only-real-size');
workArea.setPluginData('visibleReviewRule', 'Only accepted Option 1 at the genuinely different 834 px state, rendered 1:1.');
workArea.setPluginData('approvedOptionId', 'option-a-preserve-track');
workArea.setPluginData('rejectedOptionId', 'option-b-stretch-orphan');

const afterProtected = JSON.stringify(await protectedSnapshot());
const afterTechnical = JSON.stringify(technicalSnapshot());
if (afterProtected !== beforeProtected) throw new Error('H2 finalize refused after write: governed source drift');
if (afterTechnical !== beforeTechnical) throw new Error('H2 finalize refused after write: technical archive source drift');

const capturePath = 'specs/029-figma-responsive-categories/proofs/H2-owner-approved/option-a-834-real-size.png';
const bytes = await board.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });

return {
  schemaVersion: '1.0.0',
  featureId: INPUT.featureId,
  run: '029-h2-finalize-approved-option-a',
  executedAt: new Date().toISOString(),
  ownerDecision: {
    selectedOption: 'option-a-preserve-track',
    selectedLabel: 'Option 1',
    orphanRowDecision: 'preserve-track',
    cardExtentDecision: 'internal-adaptation-only',
  },
  usageFacts,
  usageDistribution,
  workArea: { nodeId: workArea.id, name: workArea.name, pageId: page.id, pageName: page.name, visibleReviewRootCount: 1 },
  approvedBoard: {
    nodeId: board.id,
    name: board.name,
    width: board.width,
    height: board.height,
    acceptedFrameNodeId: acceptedClone.id,
    acceptedFrameWidth: acceptedClone.width,
    reviewScale: 1,
    sourceScenarioId: INPUT.acceptedScenarioId,
    captureRef: capturePath,
  },
  rejectedOptionDisposition: {
    optionId: 'option-b-stretch-orphan',
    visible: false,
    preservedInTechnicalArchive: true,
    sourceScenarioId: INPUT.rejectedScenarioId,
    sourceFrameNodeId: rejectedSource.id,
  },
  technicalArchive: { nodeId: archive.id, name: archive.name, visible: archive.visible, frameCount: technicalFrames.length, recoverable: true, unchanged: true },
  inspection: {
    protectedExistingFactsUnchanged: true,
    technicalArchiveSourcesUnchanged: true,
    approvedWitnessIsTrueSize: acceptedClone.width === 834 && acceptedClone.getPluginData('reviewScale') === '1',
    visibleScaledBreakpointThumbnails: 0,
    visibleRejectedOptionCount: 0,
    masterWrites: [],
    pageWrites: [],
    childWrites: [],
    sharedDependencyWrites: [],
  },
  figmaWrites: {
    createdWorkFrameNodeIds: createdNodeIds,
    changedWorkFrameNodeIds: [workArea.id],
    removedPriorReviewRootIds,
    changedExistingNodeIds: [],
  },
  pageWrites: [],
  childWrites: [],
  responsiveImages: [{ path: capturePath, base64: figma.base64Encode(bytes) }],
  exportManifest: [{ path: capturePath, nodeId: board.id, byteLength: bytes.byteLength, sourceBounds: { width: board.width, height: board.height }, exportScale: 1 }],
  scriptResults: [{
    operationId: 'finalize-h2-approved-option-a-real-size',
    status: 'applied',
    createdNodeIds,
    changedNodeIds: [workArea.id],
    removedNodeIds: removedPriorReviewRootIds,
  }],
};
