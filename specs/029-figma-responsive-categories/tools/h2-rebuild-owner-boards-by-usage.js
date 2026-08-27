// Rebuilds the H2 owner-review surface after owner feedback:
// - every option shows every reviewed width;
// - 2 columns is presented as the primary path (6 of 7 Page usages);
// - 3 columns is presented as the exceptional path (1 of 7, Empile only).
// Technical sources stay intact in the hidden archive. Governed masters and
// product Pages stay read-only.

await figma.loadAllPagesAsync();

const INPUT = {
  featureId: '029-figma-responsive-categories',
  pageId: '2052:1146',
  widths: [320, 390, 834, 1200, 1440, 1728],
  usages: [
    { id: '2115:4392', style: 'Superpose', columns: 2 },
    { id: '2115:4278', style: 'Superpose', columns: 2 },
    { id: '2115:4438', style: 'Empile', columns: 2 },
    { id: '2115:4297', style: 'Empile', columns: 2 },
    { id: '2115:4411', style: 'Empile', columns: 2 },
    { id: '2115:4324', style: 'Empile', columns: 3 },
    { id: '2115:4364', style: 'Empile', columns: 2 },
  ],
  source: {
    sectionSet: { id: '2115:4277', key: '94f64a369a5db615d68935bb353614eaaadbffc2' },
    cardSet: { id: '2495:6770', key: '0d1a03d07abf7225fb560b3d4163dd3575132c62' },
    protectedDependencies: ['6:104', '9:206', '230:585', '230:599'],
  },
  options: [
    {
      optionId: 'option-a-preserve-track',
      title: 'OPTION A · DERNIÈRE CARTE À LARGEUR DE PISTE · RECOMMANDÉE',
      description: 'Tous les breakpoints sont montrés. La différence avec B se situe à 834 px dans le cas exceptionnel 3 colonnes.',
      orphanScenarioId: 'orphan-preserve',
      orphanLabel: 'À 834 px, la troisième carte garde la largeur d’une piste.',
    },
    {
      optionId: 'option-b-stretch-orphan',
      title: 'OPTION B · DERNIÈRE CARTE ÉTIRÉE À 834 PX',
      description: 'Tous les breakpoints sont montrés. À 834 px dans le cas exceptionnel 3 colonnes, la troisième carte prend toute la largeur.',
      orphanScenarioId: 'orphan-stretch',
      orphanLabel: 'À 834 px, la troisième carte prend toute la largeur.',
    },
  ],
};

const get = async (id, role) => {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`H2 owner-board rebuild refused: missing ${role} ${id}`);
  return node;
};
const page = await get(INPUT.pageId, 'work page');
const sectionSet = await get(INPUT.source.sectionSet.id, 'section set');
const cardSet = await get(INPUT.source.cardSet.id, 'card set');
if (page.type !== 'PAGE' || page.name !== 'DS · Organisms') throw new Error('H2 owner-board rebuild refused: work page drift');
if (sectionSet.type !== 'COMPONENT_SET' || sectionSet.key !== INPUT.source.sectionSet.key) throw new Error('H2 owner-board rebuild refused: section identity drift');
if (cardSet.type !== 'COMPONENT_SET' || cardSet.key !== INPUT.source.cardSet.key) throw new Error('H2 owner-board rebuild refused: card identity drift');

const usageNodes = await Promise.all(INPUT.usages.map((usage) => get(usage.id, 'Page usage')));
const protectedDependencies = await Promise.all(INPUT.source.protectedDependencies.map((id) => get(id, 'protected dependency')));
const usageFacts = [];
for (let index = 0; index < usageNodes.length; index += 1) {
  const node = usageNodes[index];
  if (node.type !== 'INSTANCE') throw new Error(`H2 owner-board rebuild refused: usage type drift ${node.id}`);
  const main = await node.getMainComponentAsync();
  const expected = INPUT.usages[index];
  const actualColumns = Number(node.componentProperties?.Colonnes?.value || expected.columns);
  const actualStyle = String(node.componentProperties?.Style?.value || expected.style);
  if (actualColumns !== expected.columns || actualStyle !== expected.style) throw new Error(`H2 owner-board rebuild refused: usage configuration drift ${node.id}`);
  usageFacts.push({ id: node.id, style: expected.style, columns: expected.columns, mainComponentId: main?.id || null, parentId: node.parent?.id || null });
}
const usageDistribution = {
  columns2: usageFacts.filter((usage) => usage.columns === 2).length,
  columns3: usageFacts.filter((usage) => usage.columns === 3).length,
  columns2Superpose: usageFacts.filter((usage) => usage.columns === 2 && usage.style === 'Superpose').length,
  columns2Empile: usageFacts.filter((usage) => usage.columns === 2 && usage.style === 'Empile').length,
  columns3Superpose: usageFacts.filter((usage) => usage.columns === 3 && usage.style === 'Superpose').length,
  columns3Empile: usageFacts.filter((usage) => usage.columns === 3 && usage.style === 'Empile').length,
};
if (JSON.stringify(usageDistribution) !== JSON.stringify({ columns2: 6, columns3: 1, columns2Superpose: 2, columns2Empile: 4, columns3Superpose: 0, columns3Empile: 1 })) {
  throw new Error(`H2 owner-board rebuild refused: unexpected current usage distribution ${JSON.stringify(usageDistribution)}`);
}

const workAreas = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveWorkArea') === INPUT.featureId);
const archives = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveTechnicalArchive') === INPUT.featureId);
if (workAreas.length !== 1 || archives.length !== 1) throw new Error('H2 owner-board rebuild refused: work area/archive topology drift');
const workArea = workAreas[0];
const archive = archives[0];
const sourceFrames = archive.children.filter((node) => node.type === 'FRAME' && node.getPluginData('scenarioId'));
if (archive.visible !== false || sourceFrames.length !== 28) throw new Error('H2 owner-board rebuild refused: technical archive is not intact and hidden');
const sourceByScenario = new Map(sourceFrames.map((node) => [node.getPluginData('scenarioId'), node]));
const requiredScenarioIds = [];
for (const width of INPUT.widths) {
  requiredScenarioIds.push(`matrix-${width}-c2-normal`);
  if (width !== 834) requiredScenarioIds.push(`matrix-${width}-c3-normal`);
}
requiredScenarioIds.push('orphan-preserve', 'orphan-stretch');
for (const scenarioId of requiredScenarioIds) if (!sourceByScenario.has(scenarioId)) throw new Error(`H2 owner-board rebuild refused: missing source ${scenarioId}`);

const boards = workArea.children.filter((node) => node.type === 'FRAME' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveReviewOption') === INPUT.featureId);
if (boards.length !== 2) throw new Error(`H2 owner-board rebuild refused: expected two option boards, got ${boards.length}`);
const boardByOption = new Map(boards.map((node) => [node.getPluginData('optionId'), node]));
for (const option of INPUT.options) if (!boardByOption.has(option.optionId)) throw new Error(`H2 owner-board rebuild refused: missing board ${option.optionId}`);

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
const technicalSnapshot = () => sourceFrames.map((node) => ({ id: node.id, name: node.name, scenarioId: node.getPluginData('scenarioId'), width: node.width, height: node.height, parentId: node.parent?.id || null }));
const beforeProtected = JSON.stringify(await protectedSnapshot());
const beforeTechnical = JSON.stringify(technicalSnapshot());

await figma.loadFontAsync({ family: 'Montserrat', style: 'Regular' });
const createdNodeIds = [];
const removedDirectChildIds = [];
const addText = (parent, characters, x, y, fontSize) => {
  const node = figma.createText();
  node.name = 'H2 owner annotation';
  node.fontName = { family: 'Montserrat', style: 'Regular' };
  node.fontSize = fontSize;
  node.lineHeight = { unit: 'AUTO' };
  node.characters = characters;
  node.textAutoResize = 'WIDTH_AND_HEIGHT';
  parent.appendChild(node);
  node.x = x;
  node.y = y;
  createdNodeIds.push(node.id);
  return node;
};
const createFrame = (parent, name, x, y, width, height, fill) => {
  const node = figma.createFrame();
  node.name = name;
  node.resize(width, height);
  node.x = x;
  node.y = y;
  node.clipsContent = false;
  node.fills = [fill];
  parent.appendChild(node);
  createdNodeIds.push(node.id);
  return node;
};

const BOARD_WIDTH = 3040;
const BOARD_PADDING = 64;
const LANE_WIDTH = BOARD_WIDTH - BOARD_PADDING * 2;
const CELL_WIDTH = 900;
const CELL_GAP = 48;
const THUMB_SCALE = 0.42;
const ROW_GAP = 64;
const LANE_PADDING = 48;
const laneFillMain = { type: 'SOLID', color: { r: 0.975, g: 0.975, b: 0.975 } };
const laneFillExceptional = { type: 'SOLID', color: { r: 0.945, g: 0.955, b: 0.98 } };

const presentationForWidth = (width) => width <= 390 ? 'Mobile' : width <= 1200 ? 'Desktop' : 'Wide';
const buildLane = ({ board, option, columns, y }) => {
  const isMain = columns === 2;
  const laneTitle = isMain
    ? 'PARCOURS PRINCIPAL · 2 COLONNES · 6 USAGES SUR 7'
    : 'CAS EXCEPTIONNEL · 3 COLONNES · 1 USAGE SUR 7 · EMPILÉ UNIQUEMENT';
  const laneDescription = isMain
    ? 'Les 6 breakpoints montrent les styles réellement présents : 2 usages Superposé et 4 usages Empilé.'
    : `${option.orphanLabel} Les autres breakpoints sont identiques entre A et B.`;
  const lane = createFrame(board, laneTitle, BOARD_PADDING, y, LANE_WIDTH, 100, isMain ? laneFillMain : laneFillExceptional);
  lane.setPluginData('usageLane', isMain ? '2-columns-main-6-of-7' : '3-columns-exception-1-of-7');
  addText(lane, laneTitle, LANE_PADDING, 32, 22);
  addText(lane, laneDescription, LANE_PADDING, 72, 16);

  const previews = [];
  let rowY = 132;
  for (let rowIndex = 0; rowIndex < 2; rowIndex += 1) {
    const rowWidths = INPUT.widths.slice(rowIndex * 3, rowIndex * 3 + 3);
    let rowHeight = 0;
    for (let columnIndex = 0; columnIndex < rowWidths.length; columnIndex += 1) {
      const width = rowWidths[columnIndex];
      const scenarioId = columns === 2
        ? `matrix-${width}-c2-normal`
        : (width === 834 ? option.orphanScenarioId : `matrix-${width}-c3-normal`);
      const source = sourceByScenario.get(scenarioId);
      const clone = source.clone();
      lane.appendChild(clone);
      if (columns === 3) {
        const superposeGrid = clone.children.find((child) => child.type === 'FRAME' && child.name === 'H2 Superpose grid');
        const empileGrid = clone.children.find((child) => child.type === 'FRAME' && child.name === 'H2 Empile grid');
        if (!superposeGrid || !empileGrid) throw new Error(`H2 owner-board rebuild refused: style-grid drift in ${scenarioId}`);
        superposeGrid.remove();
      }
      if (typeof clone.rescale !== 'function') throw new Error('H2 owner-board rebuild refused: Figma rescale API unavailable');
      const sourceWidth = source.width;
      const sourceHeight = source.height;
      clone.rescale(THUMB_SCALE);
      const cellX = LANE_PADDING + columnIndex * (CELL_WIDTH + CELL_GAP);
      addText(lane, `${width} px · ${presentationForWidth(width)}${width === 834 && columns === 3 ? ' · DÉCISION A/B' : ''}`, cellX, rowY, 18);
      clone.x = cellX + (CELL_WIDTH - clone.width) / 2;
      clone.y = rowY + 40;
      clone.name = `${option.optionId} · ${columns} colonnes · ${width}px`;
      clone.setPluginData('scenarioId', '');
      clone.setPluginData('sourceScenarioId', scenarioId);
      clone.setPluginData('optionId', option.optionId);
      clone.setPluginData('reviewRole', isMain ? 'primary-2-columns' : 'exceptional-3-columns-empile-only');
      clone.setPluginData('viewportWidth', String(width));
      clone.setPluginData('configuredColumns', String(columns));
      clone.setPluginData('currentUsageCount', String(isMain ? 6 : 1));
      clone.setPluginData('authority', 'owner-review-thumbnail-before-H2');
      createdNodeIds.push(clone.id);
      previews.push({
        viewportWidth: width,
        presentation: presentationForWidth(width),
        configuredColumns: columns,
        currentUsageCount: isMain ? 6 : 1,
        currentStyles: isMain ? ['Superpose', 'Empile'] : ['Empile'],
        sourceScenarioId: scenarioId,
        sourceFrameId: source.id,
        reviewFrameId: clone.id,
        sourceBounds: { width: sourceWidth, height: sourceHeight },
        reviewBounds: { width: clone.width, height: clone.height },
        reviewScale: THUMB_SCALE,
      });
      rowHeight = Math.max(rowHeight, clone.height + 40);
    }
    rowY += rowHeight + ROW_GAP;
  }
  lane.resize(LANE_WIDTH, rowY + LANE_PADDING - ROW_GAP);
  return { nodeId: lane.id, name: lane.name, y: lane.y, width: lane.width, height: lane.height, columns, currentUsageCount: isMain ? 6 : 1, previews };
};

const optionRecords = [];
let boardY = 160;
for (const option of INPUT.options) {
  const board = boardByOption.get(option.optionId);
  const oldChildren = [...board.children];
  removedDirectChildIds.push(...oldChildren.map((node) => node.id));
  for (const child of oldChildren) child.remove();

  board.name = option.title;
  board.resize(BOARD_WIDTH, 400);
  board.x = 160;
  board.y = boardY;
  board.clipsContent = false;
  board.setPluginData('presentationMode', 'all-breakpoints-weighted-by-current-usage');
  board.setPluginData('usageDistribution', '2-columns=6;3-columns=1;3-columns-current-style=Empile');
  board.setPluginData('visibleBreakpointCountPerLane', '6');
  addText(board, option.title, BOARD_PADDING, 36, 28);
  addText(board, option.description, BOARD_PADDING, 82, 17);
  addText(board, 'LECTURE DES PAGES ACTUELLES · 6 usages en 2 colonnes · 1 usage en 3 colonnes', BOARD_PADDING, 124, 18);
  addText(board, 'Contenus longs, variantes négatives et médias restent vérifiés dans l’archive technique masquée.', BOARD_PADDING, 158, 15);

  const mainLane = buildLane({ board, option, columns: 2, y: 210 });
  const exceptionalLane = buildLane({ board, option, columns: 3, y: mainLane.y + mainLane.height + 64 });
  board.resize(BOARD_WIDTH, exceptionalLane.y + exceptionalLane.height + BOARD_PADDING);
  optionRecords.push({
    optionId: option.optionId,
    boardId: board.id,
    boardName: board.name,
    x: board.x,
    y: board.y,
    width: board.width,
    height: board.height,
    visibleBreakpointCount: mainLane.previews.length + exceptionalLane.previews.length,
    lanes: [mainLane, exceptionalLane],
  });
  boardY += board.height + 240;
}

workArea.name = '029 · Categories responsive · 2 OPTIONS · USAGES RÉELS';
workArea.resizeWithoutConstraints(BOARD_WIDTH + 320, boardY + 160);
workArea.setPluginData('presentationMode', 'grouped-by-option-all-breakpoints-weighted-by-current-usage');
workArea.setPluginData('visibleReviewRule', 'Each option: six 2-column primary breakpoints plus six 3-column exceptional breakpoints; 3-column lane is Empile only.');
workArea.setPluginData('usageDistribution', '2-columns=6;3-columns=1');

const afterProtected = JSON.stringify(await protectedSnapshot());
const afterTechnical = JSON.stringify(technicalSnapshot());
if (afterProtected !== beforeProtected) throw new Error('H2 owner-board rebuild refused after write: governed source drift');
if (afterTechnical !== beforeTechnical) throw new Error('H2 owner-board rebuild refused after write: technical archive source drift');

const responsiveImages = [];
const exportManifest = [];
for (const option of optionRecords) {
  const board = await figma.getNodeByIdAsync(option.boardId);
  const path = `specs/029-figma-responsive-categories/proofs/H2-owner-options/${option.optionId}.png`;
  const bytes = await board.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 0.45 } });
  responsiveImages.push({ path, base64: figma.base64Encode(bytes) });
  exportManifest.push({ optionId: option.optionId, boardId: board.id, path, byteLength: bytes.byteLength, sourceBounds: { width: board.width, height: board.height }, exportScale: 0.45 });
}

return {
  schemaVersion: '1.0.0',
  featureId: INPUT.featureId,
  run: '029-h2-rebuild-owner-boards-by-usage',
  executedAt: new Date().toISOString(),
  ownerFeedback: [
    'Each option must show every breakpoint, including Option B.',
    'The owner surface must reflect that six current Page usages are 2 columns and only one is 3 columns.',
  ],
  usageFacts,
  usageDistribution,
  workArea: { nodeId: workArea.id, name: workArea.name, pageId: page.id, pageName: page.name, visibleOptionCount: optionRecords.length },
  options: optionRecords,
  technicalArchive: { nodeId: archive.id, name: archive.name, visible: archive.visible, frameCount: sourceFrames.length, recoverable: true, unchanged: true },
  exportManifest,
  inspection: {
    protectedExistingFactsUnchanged: true,
    technicalArchiveSourcesUnchanged: true,
    optionCount: optionRecords.length,
    allOptionsShowEveryWidthTwice: optionRecords.every((option) => option.visibleBreakpointCount === 12),
    allPrimaryLanesUseTwoColumns: optionRecords.every((option) => option.lanes[0].columns === 2 && option.lanes[0].currentUsageCount === 6),
    allExceptionalLanesUseThreeColumnsEmpileOnly: optionRecords.every((option) => option.lanes[1].columns === 3 && option.lanes[1].currentUsageCount === 1 && option.lanes[1].previews.every((preview) => JSON.stringify(preview.currentStyles) === JSON.stringify(['Empile']))),
    masterWrites: [],
    pageWrites: [],
    childWrites: [],
    sharedDependencyWrites: [],
  },
  figmaWrites: {
    changedWorkFrameNodeIds: [workArea.id, ...optionRecords.map((option) => option.boardId)],
    createdReviewNodeIds: createdNodeIds,
    removedPriorReviewDirectChildIds: removedDirectChildIds,
    changedExistingNodeIds: [],
  },
  pageWrites: [],
  childWrites: [],
  responsiveImages,
  scriptResults: [{
    operationId: 'rebuild-h2-owner-boards-by-current-usage',
    status: 'applied',
    createdNodeIds,
    changedNodeIds: [workArea.id, ...optionRecords.map((option) => option.boardId)],
    removedNodeIds: removedDirectChildIds,
  }],
};
