// Read-only verification of the H2 proposal area. This script never repairs the
// work frames: any inconsistent row or protected-source fact is reported.

await figma.loadAllPagesAsync();

const INPUT = {
  featureId: '029-figma-responsive-categories',
  workPageId: '2052:1146',
  source: {
    sectionSet: { id: '2115:4277', key: '94f64a369a5db615d68935bb353614eaaadbffc2' },
    cardSet: { id: '2495:6770', key: '0d1a03d07abf7225fb560b3d4163dd3575132c62' },
    cardMembers: [
      { id: '2495:6762', key: '715ab63ed657ce8217be6b55bbcc5f3101912fbd' },
      { id: '2495:6763', key: 'a65093a506e9250af2afecbe142e1a368fea1256' },
    ],
    usages: ['2115:4392', '2115:4278', '2115:4438', '2115:4297', '2115:4411', '2115:4324', '2115:4364'],
  },
};

const get = async (id, role) => {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`H2 verify refused: missing ${role} ${id}`);
  return node;
};
const page = await get(INPUT.workPageId, 'work page');
if (page.type !== 'PAGE' || page.name !== 'DS · Organisms') throw new Error('H2 verify refused: work page drift');
const workAreas = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveWorkArea') === INPUT.featureId);
if (workAreas.length !== 1) throw new Error(`H2 verify refused: expected one marked work area, got ${workAreas.length}`);
const workArea = workAreas[0];
const archives = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveTechnicalArchive') === INPUT.featureId);
if (archives.length !== 1) throw new Error(`H2 verify refused: expected one marked technical archive, got ${archives.length}`);
const archive = archives[0];
const approvedBoards = workArea.children.filter((node) => node.type === 'FRAME' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveApprovedOption') === INPUT.featureId);
const legacyOptionBoards = workArea.children.filter((node) => node.type === 'FRAME' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveReviewOption') === INPUT.featureId);
const approvedBoard = approvedBoards[0] || null;
const approvedWitnesses = approvedBoard ? approvedBoard.children.filter((node) => node.type === 'FRAME' && node.getPluginData('reviewRole') === 'approved-real-size-decision-witness') : [];
const approvedWitness = approvedWitnesses[0] || null;

const sectionSet = await get(INPUT.source.sectionSet.id, 'section set');
const cardSet = await get(INPUT.source.cardSet.id, 'card set');
if (sectionSet.type !== 'COMPONENT_SET' || sectionSet.key !== INPUT.source.sectionSet.key) throw new Error('H2 verify refused: section identity drift');
if (cardSet.type !== 'COMPONENT_SET' || cardSet.key !== INPUT.source.cardSet.key) throw new Error('H2 verify refused: card identity drift');
for (const expected of INPUT.source.cardMembers) {
  const member = await get(expected.id, 'card member');
  if (member.type !== 'COMPONENT' || member.key !== expected.key || member.parent?.id !== cardSet.id) throw new Error(`H2 verify refused: card member drift ${expected.id}`);
}
const usageFacts = [];
for (const id of INPUT.source.usages) {
  const usage = await get(id, 'Page usage');
  if (usage.type !== 'INSTANCE') throw new Error(`H2 verify refused: usage type drift ${id}`);
  const main = await usage.getMainComponentAsync();
  usageFacts.push({ id, mainComponentId: main?.id || null, pageId: usage.parent?.parent?.parent?.id || null });
}

const bounds = (node) => node.absoluteBoundingBox ? {
  x: node.absoluteBoundingBox.x,
  y: node.absoluteBoundingBox.y,
  width: node.absoluteBoundingBox.width,
  height: node.absoluteBoundingBox.height,
} : null;
const inside = (outer, inner, tolerance = 0.75) => outer && inner &&
  inner.x >= outer.x - tolerance && inner.y >= outer.y - tolerance &&
  inner.x + inner.width <= outer.x + outer.width + tolerance &&
  inner.y + inner.height <= outer.y + outer.height + tolerance;

const frames = [];
for (const frame of archive.children.filter((node) => node.type === 'FRAME' && node.getPluginData('scenarioId'))) {
  const scenarioId = frame.getPluginData('scenarioId');
  const presentation = frame.getPluginData('presentation');
  const configuredColumns = Number(frame.getPluginData('configuredColumns'));
  const fixtureId = frame.getPluginData('fixtureId');
  const rowFacts = [];
  const textFacts = [];
  const roleNames = new Set();
  const visit = (node, path, clippingAncestors, currentCard) => {
    roleNames.add(node.name);
    const nodeBounds = bounds(node);
    const frameBounds = bounds(frame);
    const nextCard = node.type === 'FRAME' && node.name.startsWith('H2 Card ·') ? node : currentCard;
    if (node.type === 'TEXT') textFacts.push({
      path,
      nodeId: node.id,
      name: node.name,
      characters: node.characters,
      bounds: nodeBounds,
      insideFrame: inside(frameBounds, nodeBounds),
      cardId: nextCard?.id || null,
      cardBounds: nextCard ? bounds(nextCard) : null,
      insideCard: nextCard ? inside(bounds(nextCard), nodeBounds) : true,
      clippedBy: clippingAncestors.filter((ancestor) => !inside(bounds(ancestor), nodeBounds)).map((ancestor) => ancestor.id),
    });
    const nextClipping = node.clipsContent === true ? [...clippingAncestors, node] : clippingAncestors;
    if ('children' in node) node.children.forEach((child, index) => visit(child, path ? `${path}/${index}` : String(index), nextClipping, nextCard));
  };
  visit(frame, '', [], null);
  for (const row of frame.findAll((node) => node.type === 'FRAME' && node.name.startsWith('H2 row '))) {
    const cards = row.children.filter((node) => node.type === 'FRAME' && node.name.startsWith('H2 Card ·'));
    const heights = cards.map((node) => node.height);
    rowFacts.push({
      rowNodeId: row.id,
      style: cards[0]?.name.split(' · ')[1] || null,
      cardNodeIds: cards.map((node) => node.id),
      widths: cards.map((node) => node.width),
      heights,
      heightDelta: heights.length ? Math.max(...heights) - Math.min(...heights) : null,
      equalHeightWithinOnePixel: heights.length > 0 && Math.max(...heights) - Math.min(...heights) <= 1,
      cardsInsideRow: cards.every((node) => inside(bounds(row), bounds(node))),
    });
  }
  const requiredRoles = ['Item1Titre', 'Item1Texte', 'TitreCategorie', 'TexteCategorie', 'Bouton'];
  frames.push({
    scenarioId,
    frameId: frame.id,
    presentation,
    configuredColumns,
    fixtureId,
    bounds: bounds(frame),
    rows: rowFacts,
    allRowsEqualHeight: rowFacts.every((row) => row.equalHeightWithinOnePixel),
    allCardsInsideRows: rowFacts.every((row) => row.cardsInsideRow),
    allTextInsideFrame: textFacts.every((text) => text.insideFrame),
    allTextInsideCards: textFacts.every((text) => text.insideCard),
    textHasNoClippingAncestor: textFacts.every((text) => text.clippedBy.length === 0),
    requiredRolesPresent: requiredRoles.every((role) => roleNames.has(role)),
    textFacts,
  });
}

const matrixFrames = frames.filter((frame) => frame.scenarioId.startsWith('matrix-'));
const expectedMatrixIds = [];
for (const width of [320, 390, 834, 1200, 1440, 1728]) {
  for (const columns of [2, 3]) {
    for (const fixture of ['normal', 'long']) expectedMatrixIds.push(`matrix-${width}-c${columns}-${fixture}`);
  }
}
const observedMatrixIds = new Set(matrixFrames.map((frame) => frame.scenarioId));
const missingMatrixIds = expectedMatrixIds.filter((id) => !observedMatrixIds.has(id));
const duplicateScenarioIds = frames.map((frame) => frame.scenarioId).filter((id, index, all) => all.indexOf(id) !== index);

return {
  schemaVersion: '1.0.0',
  featureId: INPUT.featureId,
  run: '029-h2-read-only-verify',
  inspectedAt: new Date().toISOString(),
  workArea: { nodeId: workArea.id, name: workArea.name, pageId: page.id, pageName: page.name },
  ownerSurface: {
    approvedBoardCount: approvedBoards.length,
    legacyOptionBoardCount: legacyOptionBoards.length,
    approvedBoard: approvedBoard ? {
      optionId: approvedBoard.getPluginData('optionId'),
      nodeId: approvedBoard.id,
      name: approvedBoard.name,
      visible: approvedBoard.visible !== false,
      decisionScale: approvedBoard.getPluginData('decisionScale'),
      decisionViewportWidth: Number(approvedBoard.getPluginData('decisionViewportWidth')),
    } : null,
    approvedWitness: approvedWitness ? {
      nodeId: approvedWitness.id,
      name: approvedWitness.name,
      sourceScenarioId: approvedWitness.getPluginData('sourceScenarioId'),
      rejectedScenarioId: approvedWitness.getPluginData('rejectedScenarioId'),
      reviewScale: approvedWitness.getPluginData('reviewScale'),
      viewportWidth: Number(approvedWitness.getPluginData('viewportWidth')),
      actualWidth: approvedWitness.width,
      configuredColumns: Number(approvedWitness.getPluginData('configuredColumns')),
      currentUsageCount: Number(approvedWitness.getPluginData('currentUsageCount')),
      currentStyle: approvedWitness.getPluginData('currentStyle'),
    } : null,
  },
  technicalArchive: {
    nodeId: archive.id,
    name: archive.name,
    visible: archive.visible !== false,
    frameCount: frames.length,
  },
  matrix: {
    expectedCount: 24,
    observedCount: matrixFrames.length,
    missingMatrixIds,
    duplicateScenarioIds,
  },
  frames,
  checks: {
    matrixComplete: matrixFrames.length === 24 && missingMatrixIds.length === 0 && duplicateScenarioIds.length === 0,
    allRowsEqualHeight: frames.every((frame) => frame.allRowsEqualHeight),
    allCardsInsideRows: frames.every((frame) => frame.allCardsInsideRows),
    allTextInsideFrames: frames.every((frame) => frame.allTextInsideFrame),
    allTextInsideCards: frames.every((frame) => frame.allTextInsideCards),
    textHasNoClippingAncestor: frames.every((frame) => frame.textHasNoClippingAncestor),
    requiredCardRolesPresent: frames.every((frame) => frame.requiredRolesPresent),
    ownerSurfaceHasOneApprovedBoard: approvedBoards.length === 1 && approvedBoard?.visible !== false,
    ownerSurfaceHasNoLegacyOptionBoards: legacyOptionBoards.length === 0,
    approvedOptionIsA: approvedBoard?.getPluginData('optionId') === 'option-a-preserve-track',
    approvedSurfaceHasOneWitness: approvedWitnesses.length === 1,
    approvedWitnessIs834AtOneToOne: approvedWitness?.width === 834 && approvedWitness.getPluginData('reviewScale') === '1' && approvedWitness.getPluginData('viewportWidth') === '834',
    approvedWitnessMatchesRealUsage: approvedWitness?.getPluginData('configuredColumns') === '3' && approvedWitness.getPluginData('currentUsageCount') === '1' && approvedWitness.getPluginData('currentStyle') === 'Empile',
    rejectedOptionIsNotVisible: workArea.children.every((node) => node.getPluginData('optionId') !== 'option-b-stretch-orphan'),
    visibleScaledBreakpointThumbnailCountIsZero: workArea.findAll((node) => node.type === 'FRAME' && node.getPluginData('reviewScale') && node.getPluginData('reviewScale') !== '1').filter((node) => node.visible !== false).length === 0,
    technicalArchiveIsHidden: archive.visible === false,
    technicalArchiveHasAllProposalFrames: frames.length === 28,
  },
  protectedSource: {
    sectionSet: { id: sectionSet.id, key: sectionSet.key },
    cardSet: { id: cardSet.id, key: cardSet.key },
    usageFacts,
  },
  figmaWrites: [],
  pageWrites: [],
  childWrites: [],
  responsiveImages: [],
  scriptResults: [{ operationId: 'verify-h2-proposal-read-only', status: 'inspected' }],
};
