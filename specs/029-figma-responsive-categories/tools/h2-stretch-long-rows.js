// H2 proposal-only adjustment. Uses Auto Layout cross-axis FILL on cards in a
// row so content-long cards and their neighbours share the row height. No
// numeric dimension is introduced and governed source remains read-only.

await figma.loadAllPagesAsync();

const page = await figma.getNodeByIdAsync('2052:1146');
const sectionSet = await figma.getNodeByIdAsync('2115:4277');
const cardSet = await figma.getNodeByIdAsync('2495:6770');
if (!page || page.type !== 'PAGE' || page.name !== 'DS · Organisms') throw new Error('H2 stretch refused: work page drift');
if (!sectionSet || sectionSet.type !== 'COMPONENT_SET' || sectionSet.key !== '94f64a369a5db615d68935bb353614eaaadbffc2') throw new Error('H2 stretch refused: section identity drift');
if (!cardSet || cardSet.type !== 'COMPONENT_SET' || cardSet.key !== '0d1a03d07abf7225fb560b3d4163dd3575132c62') throw new Error('H2 stretch refused: card identity drift');

const areas = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveWorkArea') === '029-figma-responsive-categories');
if (areas.length !== 1) throw new Error(`H2 stretch refused: expected one work area, got ${areas.length}`);
const workArea = areas[0];
const before = {
  section: { id: sectionSet.id, key: sectionSet.key, childIds: sectionSet.children.map((node) => node.id) },
  card: { id: cardSet.id, key: cardSet.key, childIds: cardSet.children.map((node) => node.id) },
};

const changedNodeIds = [];
const rows = [];
for (const row of workArea.findAll((node) => node.type === 'FRAME' && node.name.startsWith('H2 row '))) {
  const cards = row.children.filter((node) => node.type === 'FRAME' && node.name.startsWith('H2 Card ·'));
  if (cards.length < 2) continue;
  const beforeHeights = cards.map((node) => node.height);
  if (Math.max(...beforeHeights) - Math.min(...beforeHeights) <= 1) continue;
  for (const card of cards) {
    card.primaryAxisSizingMode = 'AUTO';
    card.layoutSizingVertical = 'FILL';
    changedNodeIds.push(card.id);
  }
  const afterHeights = cards.map((node) => node.height);
  rows.push({
    rowNodeId: row.id,
    cardNodeIds: cards.map((node) => node.id),
    beforeHeights,
    afterHeights,
    equalAfter: Math.max(...afterHeights) - Math.min(...afterHeights) <= 1,
    mechanism: 'row cross-axis FILL; card internal axis remains AUTO',
  });
}

const after = {
  section: { id: sectionSet.id, key: sectionSet.key, childIds: sectionSet.children.map((node) => node.id) },
  card: { id: cardSet.id, key: cardSet.key, childIds: cardSet.children.map((node) => node.id) },
};
if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('H2 stretch refused after work-frame adjustment: governed source drift');
const allEqualAfter = rows.every((row) => row.equalAfter);

return {
  schemaVersion: '1.0.0',
  featureId: '029-figma-responsive-categories',
  run: '029-h2-stretch-long-rows',
  executedAt: new Date().toISOString(),
  workAreaId: workArea.id,
  rows,
  mechanism: 'internal-auto-layout-cross-axis-fill',
  allEqualAfter,
  numericValuesIntroduced: [],
  figmaWrites: { changedWorkFrameNodeIds: changedNodeIds, changedExistingNodeIds: [] },
  pageWrites: [],
  childWrites: [],
  responsiveImages: [],
  scriptResults: [{ operationId: 'stretch-h2-long-content-rows', status: allEqualAfter ? 'applied' : 'mechanism-insufficient', createdNodeIds: [], changedNodeIds }],
};
