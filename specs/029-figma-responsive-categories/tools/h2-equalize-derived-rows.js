// H2 proposal-only refinement. Measures the natural HUG height of each card in
// long-content rows, fixes the work row to the derived maximum, then lets every
// card FILL that row. The value is content-derived, never a hard-coded token.

await figma.loadAllPagesAsync();

const page = await figma.getNodeByIdAsync('2052:1146');
const sectionSet = await figma.getNodeByIdAsync('2115:4277');
const cardSet = await figma.getNodeByIdAsync('2495:6770');
if (!page || page.type !== 'PAGE' || page.name !== 'DS · Organisms') throw new Error('H2 equalize refused: work page drift');
if (!sectionSet || sectionSet.type !== 'COMPONENT_SET' || sectionSet.key !== '94f64a369a5db615d68935bb353614eaaadbffc2') throw new Error('H2 equalize refused: section identity drift');
if (!cardSet || cardSet.type !== 'COMPONENT_SET' || cardSet.key !== '0d1a03d07abf7225fb560b3d4163dd3575132c62') throw new Error('H2 equalize refused: card identity drift');
const areas = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveWorkArea') === '029-figma-responsive-categories');
if (areas.length !== 1) throw new Error(`H2 equalize refused: expected one work area, got ${areas.length}`);
const workArea = areas[0];

const beforeProtected = JSON.stringify({
  section: { id: sectionSet.id, key: sectionSet.key, childIds: sectionSet.children.map((node) => node.id) },
  card: { id: cardSet.id, key: cardSet.key, childIds: cardSet.children.map((node) => node.id) },
});
const rows = [];
const changedNodeIds = [];

for (const witness of workArea.children.filter((node) => node.type === 'FRAME' && node.getPluginData('fixtureId') === 'long')) {
  for (const row of witness.findAll((node) => node.type === 'FRAME' && node.name.startsWith('H2 row '))) {
    const cards = row.children.filter((node) => node.type === 'FRAME' && node.name.startsWith('H2 Card ·'));
    if (cards.length < 2) continue;
    row.counterAxisSizingMode = 'AUTO';
    for (const card of cards) {
      card.layoutSizingVertical = 'HUG';
      card.primaryAxisSizingMode = 'AUTO';
    }
    const naturalHeights = cards.map((card) => card.height);
    const derivedRowHeight = Math.max(...naturalHeights);
    row.resize(row.width, derivedRowHeight);
    row.counterAxisSizingMode = 'FIXED';
    for (const card of cards) {
      card.layoutSizingVertical = 'FILL';
      changedNodeIds.push(card.id);
    }
    const finalHeights = cards.map((card) => card.height);
    rows.push({
      witnessId: witness.id,
      scenarioId: witness.getPluginData('scenarioId'),
      rowNodeId: row.id,
      cardNodeIds: cards.map((card) => card.id),
      naturalHeights,
      derivedRowHeight,
      finalHeights,
      equalAfter: Math.max(...finalHeights) - Math.min(...finalHeights) <= 1,
      mechanism: 'natural HUG measurement → content-derived fixed row → card cross-axis FILL',
    });
  }
}

const afterProtected = JSON.stringify({
  section: { id: sectionSet.id, key: sectionSet.key, childIds: sectionSet.children.map((node) => node.id) },
  card: { id: cardSet.id, key: cardSet.key, childIds: cardSet.children.map((node) => node.id) },
});
if (afterProtected !== beforeProtected) throw new Error('H2 equalize refused after work-frame adjustment: governed source drift');
const allEqualAfter = rows.every((row) => row.equalAfter);

return {
  schemaVersion: '1.0.0',
  featureId: '029-figma-responsive-categories',
  run: '029-h2-equalize-derived-rows',
  executedAt: new Date().toISOString(),
  workAreaId: workArea.id,
  rows,
  allEqualAfter,
  mechanism: 'internal-auto-layout-with-content-derived-row-height',
  hardCodedDimensionValuesIntroduced: [],
  figmaWrites: { changedWorkFrameNodeIds: [...new Set(changedNodeIds)], changedExistingNodeIds: [] },
  pageWrites: [],
  childWrites: [],
  responsiveImages: [],
  scriptResults: [{ operationId: 'equalize-h2-content-derived-rows', status: allEqualAfter ? 'applied' : 'mechanism-insufficient', createdNodeIds: [], changedNodeIds: [...new Set(changedNodeIds)] }],
};
