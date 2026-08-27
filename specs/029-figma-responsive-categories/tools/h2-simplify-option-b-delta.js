// Owner-review cleanup: Option B keeps only the one screen that differs from
// Option A. Removed nodes are disposable review copies; their technical sources
// remain intact in the hidden archive.

await figma.loadAllPagesAsync();

const page = await figma.getNodeByIdAsync('2052:1146');
const sectionSet = await figma.getNodeByIdAsync('2115:4277');
const cardSet = await figma.getNodeByIdAsync('2495:6770');
if (!page || page.type !== 'PAGE' || page.name !== 'DS · Organisms') throw new Error('H2 simplify refused: work page drift');
if (!sectionSet || sectionSet.type !== 'COMPONENT_SET' || sectionSet.key !== '94f64a369a5db615d68935bb353614eaaadbffc2') throw new Error('H2 simplify refused: section identity drift');
if (!cardSet || cardSet.type !== 'COMPONENT_SET' || cardSet.key !== '0d1a03d07abf7225fb560b3d4163dd3575132c62') throw new Error('H2 simplify refused: card identity drift');
const workAreas = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveWorkArea') === '029-figma-responsive-categories');
const archives = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveTechnicalArchive') === '029-figma-responsive-categories');
if (workAreas.length !== 1 || archives.length !== 1) throw new Error('H2 simplify refused: grouped work area/archive topology drift');
const workArea = workAreas[0];
const archive = archives[0];
if (archive.visible !== false || archive.children.filter((node) => node.type === 'FRAME' && node.getPluginData('scenarioId')).length !== 28) throw new Error('H2 simplify refused: technical archive is not intact and hidden');
const boards = workArea.children.filter((node) => node.type === 'FRAME' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveReviewOption') === '029-figma-responsive-categories');
if (boards.length !== 2) throw new Error(`H2 simplify refused: expected two option boards, got ${boards.length}`);
const optionA = boards.find((node) => node.getPluginData('optionId') === 'option-a-preserve-track');
const optionB = boards.find((node) => node.getPluginData('optionId') === 'option-b-stretch-orphan');
if (!optionA || !optionB) throw new Error('H2 simplify refused: option identities drift');

const beforeProtected = JSON.stringify({
  section: { id: sectionSet.id, key: sectionSet.key, childIds: sectionSet.children.map((node) => node.id) },
  card: { id: cardSet.id, key: cardSet.key, childIds: cardSet.children.map((node) => node.id) },
});
const reviewCopies = optionB.children.filter((node) => node.type === 'FRAME' && node.getPluginData('reviewRole'));
const intermediate = reviewCopies.find((node) => node.getPluginData('reviewRole').startsWith('Intermédiaire'));
const redundant = reviewCopies.filter((node) => node.id !== intermediate?.id);
if (!intermediate || redundant.length !== 2) throw new Error('H2 simplify refused: Option B review-copy topology drift');
const removedReviewCopyNodeIds = redundant.map((node) => node.id);
const recoverySources = redundant.map((node) => ({ reviewCopyId: node.id, sourceScenarioId: node.getPluginData('sourceScenarioId') }));
for (const node of redundant) node.remove();

await figma.loadFontAsync({ family: 'Montserrat', style: 'Regular' });
const labels = optionB.children.filter((node) => node.type === 'TEXT').sort((a, b) => a.y - b.y);
if (labels.length < 2) throw new Error('H2 simplify refused: Option B labels drift');
labels[0].characters = 'OPTION B · Différence uniquement à 834 px';
labels[1].characters = 'La troisième carte prend toute la largeur. Mobile et desktop restent ceux de l’option A.';
optionB.name = 'OPTION B · Différence uniquement à 834 px · carte étirée';
intermediate.x = 64;
intermediate.y = 160;
optionB.resize(intermediate.width + 128, intermediate.height + 224);
optionB.x = 160;
optionB.y = optionA.y + optionA.height + 240;
workArea.resizeWithoutConstraints(optionA.width + 320, optionB.y + optionB.height + 320);
workArea.setPluginData('presentationMode', 'grouped-by-option-with-delta-only-option-b');
workArea.setPluginData('visibleReviewRule', 'Option A shows mobile/intermediate/desktop; Option B shows only its intermediate delta.');

const afterProtected = JSON.stringify({
  section: { id: sectionSet.id, key: sectionSet.key, childIds: sectionSet.children.map((node) => node.id) },
  card: { id: cardSet.id, key: cardSet.key, childIds: cardSet.children.map((node) => node.id) },
});
if (afterProtected !== beforeProtected) throw new Error('H2 simplify refused after cleanup: governed source drift');

const responsiveImages = [];
const exportManifest = [];
for (const board of [optionA, optionB]) {
  const optionId = board.getPluginData('optionId');
  const path = `specs/029-figma-responsive-categories/proofs/H2-owner-options/${optionId}.png`;
  const bytes = await board.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 0.5 } });
  responsiveImages.push({ path, base64: figma.base64Encode(bytes) });
  exportManifest.push({ optionId, boardId: board.id, path, byteLength: bytes.byteLength, sourceBounds: { width: board.width, height: board.height }, exportScale: 0.5 });
}

return {
  schemaVersion: '1.0.0',
  featureId: '029-figma-responsive-categories',
  run: '029-h2-simplify-option-b-delta',
  executedAt: new Date().toISOString(),
  workArea: {
    nodeId: workArea.id,
    name: workArea.name,
    visibleOptionCount: 2,
    optionAVisibleScreenCount: optionA.children.filter((node) => node.type === 'FRAME' && node.getPluginData('reviewRole')).length,
    optionBVisibleScreenCount: optionB.children.filter((node) => node.type === 'FRAME' && node.getPluginData('reviewRole')).length,
  },
  technicalArchive: { nodeId: archive.id, visible: archive.visible, frameCount: 28, recoverable: true },
  removedReviewCopyNodeIds,
  recoverySources,
  exportManifest,
  inspection: {
    protectedExistingFactsUnchanged: true,
    scenarioChecks: exportManifest.map((entry) => ({ scenarioId: entry.optionId, selectedPresentation: 'grouped-owner-option', captureRef: entry.path })),
    bindingFacts: [],
    typographyFacts: [],
    memberFacts: [],
    childWrites: [],
    masterWrites: [],
    pageWrites: [],
    sharedDependencyWrites: [],
  },
  figmaWrites: { changedWorkFrameNodeIds: [workArea.id, optionB.id, intermediate.id], removedReviewCopyNodeIds, changedExistingNodeIds: [] },
  pageWrites: [],
  childWrites: [],
  responsiveImages,
  scriptResults: [{ operationId: 'simplify-option-b-to-delta-only', status: 'applied', createdNodeIds: [], changedNodeIds: [workArea.id, optionB.id, intermediate.id], removedNodeIds: removedReviewCopyNodeIds }],
};
