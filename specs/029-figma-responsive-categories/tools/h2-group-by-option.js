// Owner-requested H2 presentation cleanup. Keeps only two visible option boards
// and moves the exhaustive matrix to a separate hidden technical archive.
// Governed masters, Page usages and shared dependencies remain read-only.

await figma.loadAllPagesAsync();

const INPUT = {
  featureId: '029-figma-responsive-categories',
  pageId: '2052:1146',
  source: {
    sectionSet: { id: '2115:4277', key: '94f64a369a5db615d68935bb353614eaaadbffc2' },
    cardSet: { id: '2495:6770', key: '0d1a03d07abf7225fb560b3d4163dd3575132c62' },
    usages: ['2115:4392', '2115:4278', '2115:4438', '2115:4297', '2115:4411', '2115:4324', '2115:4364'],
    protectedDependencies: ['6:104', '9:206', '230:585', '230:599'],
  },
  options: [
    {
      optionId: 'option-a-preserve-track',
      title: 'OPTION A · La dernière carte garde sa largeur · RECOMMANDÉE',
      description: 'Mobile et desktop sont identiques. À 834 px, la troisième carte reste alignée sur une colonne.',
      sources: [
        { role: 'Mobile · 390 px', scenarioId: 'matrix-390-c3-normal' },
        { role: 'Intermédiaire · 834 px', scenarioId: 'orphan-preserve' },
        { role: 'Desktop · 1200 px · contenu long', scenarioId: 'matrix-1200-c3-long' },
      ],
      fill: { type: 'SOLID', color: { r: 0.91, g: 0.965, b: 0.92 } },
    },
    {
      optionId: 'option-b-stretch-orphan',
      title: 'OPTION B · La dernière carte prend toute la largeur',
      description: 'Mobile et desktop sont identiques. À 834 px, la troisième carte s’étire sur toute la ligne.',
      sources: [
        { role: 'Mobile · 390 px', scenarioId: 'matrix-390-c3-normal' },
        { role: 'Intermédiaire · 834 px', scenarioId: 'orphan-stretch' },
        { role: 'Desktop · 1200 px · contenu long', scenarioId: 'matrix-1200-c3-long' },
      ],
      fill: { type: 'SOLID', color: { r: 0.91, g: 0.94, b: 0.985 } },
    },
  ],
};

const get = async (id, role) => {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`H2 grouping refused: missing ${role} ${id}`);
  return node;
};
const page = await get(INPUT.pageId, 'work page');
const sectionSet = await get(INPUT.source.sectionSet.id, 'section set');
const cardSet = await get(INPUT.source.cardSet.id, 'card set');
if (page.type !== 'PAGE' || page.name !== 'DS · Organisms') throw new Error('H2 grouping refused: work page drift');
if (sectionSet.type !== 'COMPONENT_SET' || sectionSet.key !== INPUT.source.sectionSet.key) throw new Error('H2 grouping refused: section identity drift');
if (cardSet.type !== 'COMPONENT_SET' || cardSet.key !== INPUT.source.cardSet.key) throw new Error('H2 grouping refused: card identity drift');
const usages = await Promise.all(INPUT.source.usages.map((id) => get(id, 'Page usage')));
const protectedDependencies = await Promise.all(INPUT.source.protectedDependencies.map((id) => get(id, 'protected dependency')));
const workAreas = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveWorkArea') === INPUT.featureId);
if (workAreas.length !== 1) throw new Error(`H2 grouping refused: expected one proposal work area, got ${workAreas.length}`);
const workArea = workAreas[0];
const priorArchives = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveTechnicalArchive') === INPUT.featureId);
if (priorArchives.length > 0) throw new Error('H2 grouping refused: technical archive already exists; inspect instead of duplicating');
if (workArea.getPluginData('presentationMode') === 'grouped-by-option') throw new Error('H2 grouping refused: work area is already grouped by option');

const directProposalFrames = workArea.children.filter((node) => node.type === 'FRAME' && node.getPluginData('scenarioId'));
if (directProposalFrames.length !== 28) throw new Error(`H2 grouping refused: expected 28 direct proposal frames, got ${directProposalFrames.length}`);
const sourceByScenario = new Map(directProposalFrames.map((node) => [node.getPluginData('scenarioId'), node]));
for (const option of INPUT.options) {
  for (const source of option.sources) if (!sourceByScenario.has(source.scenarioId)) throw new Error(`H2 grouping refused: missing source scenario ${source.scenarioId}`);
}

const mainIdentity = async (node) => {
  if (node.type !== 'INSTANCE') return null;
  const main = await node.getMainComponentAsync();
  return main ? { id: main.id, key: main.key || null } : null;
};
const protectedSnapshot = async () => ({
  section: { id: sectionSet.id, key: sectionSet.key, childIds: sectionSet.children.map((node) => node.id) },
  card: { id: cardSet.id, key: cardSet.key, childIds: cardSet.children.map((node) => node.id) },
  usages: await Promise.all(usages.map(async (node) => ({ id: node.id, main: await mainIdentity(node), parentId: node.parent?.id || null }))),
  dependencies: await Promise.all(protectedDependencies.map(async (node) => ({ id: node.id, key: 'key' in node ? node.key || null : null, parentId: node.parent?.id || null, main: await mainIdentity(node) }))),
});
const beforeProtected = await protectedSnapshot();
const beforeProtectedJson = JSON.stringify(beforeProtected);

await figma.loadFontAsync({ family: 'Montserrat', style: 'Regular' });
const createdNodeIds = [];
const changedWorkFrameNodeIds = [];
const optionRecords = [];
const addText = (parent, text, x, y, fontSize) => {
  const node = figma.createText();
  node.fontName = { family: 'Montserrat', style: 'Regular' };
  node.fontSize = fontSize;
  node.lineHeight = { unit: 'AUTO' };
  node.characters = text;
  node.textAutoResize = 'WIDTH_AND_HEIGHT';
  parent.appendChild(node);
  node.x = x;
  node.y = y;
  createdNodeIds.push(node.id);
  return node;
};

const boardGap = 64;
const boardPadding = 64;
const screenTop = 160;
let boardY = 160;
for (const option of INPUT.options) {
  const sources = option.sources.map((entry) => ({ ...entry, node: sourceByScenario.get(entry.scenarioId) }));
  const contentWidth = sources.reduce((sum, entry) => sum + entry.node.width, 0) + boardGap * (sources.length - 1);
  const boardWidth = contentWidth + boardPadding * 2;
  const boardHeight = Math.max(...sources.map((entry) => entry.node.height)) + screenTop + boardPadding;
  const board = figma.createFrame();
  board.name = option.title;
  board.resize(boardWidth, boardHeight);
  board.x = 160;
  board.y = boardY;
  board.fills = [option.fill];
  board.clipsContent = false;
  board.setSharedPluginData('ds_contracts', 'categoriesResponsiveReviewOption', INPUT.featureId);
  board.setPluginData('optionId', option.optionId);
  board.setPluginData('authority', 'owner-review-only-before-H2');
  workArea.appendChild(board);
  createdNodeIds.push(board.id);
  addText(board, option.title, boardPadding, 36, 24);
  addText(board, option.description, boardPadding, 80, 16);

  let x = boardPadding;
  const screenRecords = [];
  for (const source of sources) {
    const clone = source.node.clone();
    board.appendChild(clone);
    clone.x = x;
    clone.y = screenTop;
    clone.name = `${option.title.split(' · ')[0]} · ${source.role}`;
    clone.setPluginData('scenarioId', '');
    clone.setPluginData('sourceScenarioId', source.scenarioId);
    clone.setPluginData('reviewRole', source.role);
    clone.setPluginData('optionId', option.optionId);
    clone.setPluginData('authority', 'owner-review-copy-before-H2');
    createdNodeIds.push(clone.id);
    screenRecords.push({ role: source.role, sourceScenarioId: source.scenarioId, sourceFrameId: source.node.id, reviewFrameId: clone.id, width: clone.width, height: clone.height });
    x += clone.width + boardGap;
  }
  optionRecords.push({ optionId: option.optionId, boardId: board.id, boardName: board.name, x: board.x, y: board.y, width: board.width, height: board.height, screens: screenRecords });
  boardY += board.height + 240;
}

const archive = figma.createSection();
archive.name = '029 · ARCHIVE TECHNIQUE H2 · 28 TESTS · MASQUÉE';
archive.x = workArea.x + 4200;
archive.y = workArea.y;
archive.resizeWithoutConstraints(3900, 30000);
archive.setSharedPluginData('ds_contracts', 'categoriesResponsiveTechnicalArchive', INPUT.featureId);
archive.setPluginData('authority', 'technical-evidence-not-owner-review');
archive.setPluginData('sourceWorkAreaId', workArea.id);
createdNodeIds.push(archive.id);
const columnY = [120, 120];
for (const frame of directProposalFrames) {
  const column = columnY[0] <= columnY[1] ? 0 : 1;
  archive.appendChild(frame);
  frame.x = 120 + column * 1900;
  frame.y = columnY[column];
  columnY[column] += frame.height + 120;
  changedWorkFrameNodeIds.push(frame.id);
}
archive.resizeWithoutConstraints(3900, Math.max(...columnY) + 120);
archive.visible = false;

workArea.name = '029 · Categories responsive · CHOIX H2 · 2 OPTIONS';
workArea.resizeWithoutConstraints(Math.max(...optionRecords.map((option) => option.width)) + 320, boardY + 160);
workArea.setPluginData('presentationMode', 'grouped-by-option');
workArea.setPluginData('technicalArchiveId', archive.id);
workArea.setPluginData('ownerRequest', 'group by option instead of screen; hide exhaustive technical matrix');
changedWorkFrameNodeIds.push(workArea.id);

const afterProtected = await protectedSnapshot();
if (JSON.stringify(afterProtected) !== beforeProtectedJson) throw new Error('H2 grouping refused after presentation cleanup: governed source changed');

const responsiveImages = [];
const exportManifest = [];
for (const option of optionRecords) {
  const board = await figma.getNodeByIdAsync(option.boardId);
  const path = `specs/029-figma-responsive-categories/proofs/H2-owner-options/${option.optionId}.png`;
  const bytes = await board.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 0.5 } });
  responsiveImages.push({ path, base64: figma.base64Encode(bytes) });
  exportManifest.push({ optionId: option.optionId, boardId: option.boardId, path, byteLength: bytes.byteLength, sourceBounds: { width: board.width, height: board.height }, exportScale: 0.5 });
}

return {
  schemaVersion: '1.0.0',
  featureId: INPUT.featureId,
  run: '029-h2-group-by-option',
  executedAt: new Date().toISOString(),
  ownerRequest: 'Group by option instead of screen and remove the exhaustive matrix from the decision surface.',
  workArea: { nodeId: workArea.id, name: workArea.name, pageId: page.id, pageName: page.name, visibleOptionCount: optionRecords.length, directVisibleChildren: workArea.children.filter((node) => node.visible !== false).map((node) => ({ id: node.id, name: node.name, type: node.type })) },
  options: optionRecords,
  technicalArchive: { nodeId: archive.id, name: archive.name, visible: archive.visible, frameCount: directProposalFrames.length, recoverable: true },
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
  figmaWrites: { createdNodeIds, changedWorkFrameNodeIds: [...new Set(changedWorkFrameNodeIds)], changedExistingNodeIds: [] },
  pageWrites: [],
  childWrites: [],
  responsiveImages,
  scriptResults: [{ operationId: 'group-h2-owner-review-by-option', status: 'applied', createdNodeIds, changedNodeIds: [...new Set(changedWorkFrameNodeIds)] }],
};
