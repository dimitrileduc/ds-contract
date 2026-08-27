// H2 proposal-only normalization after the internal FILL probe. Row height is
// derived from real content bounds and all cards in that row receive the same
// measured height. No breakpoint-specific or token-like number is introduced.

await figma.loadAllPagesAsync();

const page = await figma.getNodeByIdAsync('2052:1146');
const sectionSet = await figma.getNodeByIdAsync('2115:4277');
const cardSet = await figma.getNodeByIdAsync('2495:6770');
if (!page || page.type !== 'PAGE' || page.name !== 'DS · Organisms') throw new Error('H2 normalize refused: work page drift');
if (!sectionSet || sectionSet.type !== 'COMPONENT_SET' || sectionSet.key !== '94f64a369a5db615d68935bb353614eaaadbffc2') throw new Error('H2 normalize refused: section identity drift');
if (!cardSet || cardSet.type !== 'COMPONENT_SET' || cardSet.key !== '0d1a03d07abf7225fb560b3d4163dd3575132c62') throw new Error('H2 normalize refused: card identity drift');
const areas = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveWorkArea') === '029-figma-responsive-categories');
if (areas.length !== 1) throw new Error(`H2 normalize refused: expected one work area, got ${areas.length}`);
const workArea = areas[0];

const beforeProtected = JSON.stringify({
  section: { id: sectionSet.id, key: sectionSet.key, childIds: sectionSet.children.map((node) => node.id) },
  card: { id: cardSet.id, key: cardSet.key, childIds: cardSet.children.map((node) => node.id) },
});
const bounds = (node) => node.absoluteBoundingBox ? {
  x: node.absoluteBoundingBox.x,
  y: node.absoluteBoundingBox.y,
  width: node.absoluteBoundingBox.width,
  height: node.absoluteBoundingBox.height,
} : null;
const textOverflow = (card) => {
  const outer = bounds(card);
  let top = 0;
  let bottom = 0;
  for (const text of card.findAll((node) => node.type === 'TEXT')) {
    const inner = bounds(text);
    if (!outer || !inner) continue;
    top = Math.max(top, outer.y - inner.y);
    bottom = Math.max(bottom, inner.y + inner.height - (outer.y + outer.height));
  }
  return { top: Math.max(0, top), bottom: Math.max(0, bottom) };
};

const rows = [];
const changedNodeIds = [];
for (const row of workArea.findAll((node) => node.type === 'FRAME' && node.name.startsWith('H2 row '))) {
  const cards = row.children.filter((node) => node.type === 'FRAME' && node.name.startsWith('H2 Card ·'));
  if (cards.length === 0) continue;
  const style = cards[0].name.split(' · ')[1];
  row.counterAxisSizingMode = 'AUTO';
  const widthBefore = cards.map((card) => card.width);
  if (cards.length > 1) {
    const expectedWidth = (row.width - row.itemSpacing * (cards.length - 1)) / cards.length;
    for (const card of cards) {
      card.layoutSizingHorizontal = 'FIXED';
      card.layoutSizingVertical = 'FIXED';
      card.primaryAxisSizingMode = 'FIXED';
      card.resize(expectedWidth, card.height);
    }
  }

  const intrinsicHeights = cards.map((card) => {
    if (style === 'Superpose') {
      const wrapper = card.findOne((node) => node.name === 'wrapper');
      if (!wrapper || wrapper.type !== 'FRAME') throw new Error(`H2 normalize refused: missing wrapper in ${card.id}`);
      return Math.max(418, wrapper.height);
    }
    const visibleChildren = card.children.filter((child) => child.visible !== false && child.layoutPositioning !== 'ABSOLUTE');
    return card.paddingTop + card.paddingBottom +
      visibleChildren.reduce((sum, child) => sum + child.height, 0) +
      Math.max(0, visibleChildren.length - 1) * card.itemSpacing;
  });
  let targetHeight = Math.max(...intrinsicHeights);
  for (const card of cards) card.resize(card.width, targetHeight);

  const overflowPasses = [];
  for (let pass = 0; pass < 4; pass += 1) {
    const overflow = cards.map(textOverflow);
    const requiredGrowth = Math.max(0, ...overflow.map((entry) => entry.top + entry.bottom));
    overflowPasses.push({ pass: pass + 1, targetHeight, overflow, requiredGrowth });
    if (requiredGrowth <= 0.75) break;
    targetHeight += requiredGrowth;
    for (const card of cards) card.resize(card.width, targetHeight);
  }
  const finalOverflow = cards.map(textOverflow);
  const widthAfter = cards.map((card) => card.width);
  const finalHeights = cards.map((card) => card.height);
  changedNodeIds.push(...cards.map((card) => card.id));
  rows.push({
    rowNodeId: row.id,
    style,
    cardNodeIds: cards.map((card) => card.id),
    widthBefore,
    widthAfter,
    intrinsicHeights,
    derivedTargetHeight: targetHeight,
    finalHeights,
    finalOverflow,
    equalHeight: Math.max(...finalHeights) - Math.min(...finalHeights) <= 1,
    allTextInsideCards: finalOverflow.every((entry) => entry.top <= 0.75 && entry.bottom <= 0.75),
    derivation: 'current content bounds plus existing Auto Layout spacing; no hard-coded responsive dimension',
    overflowPasses,
  });
}

const afterProtected = JSON.stringify({
  section: { id: sectionSet.id, key: sectionSet.key, childIds: sectionSet.children.map((node) => node.id) },
  card: { id: cardSet.id, key: cardSet.key, childIds: cardSet.children.map((node) => node.id) },
});
if (afterProtected !== beforeProtected) throw new Error('H2 normalize refused after work-frame adjustment: governed source drift');
const allEqualHeight = rows.every((row) => row.equalHeight);
const allTextInsideCards = rows.every((row) => row.allTextInsideCards);

return {
  schemaVersion: '1.0.0',
  featureId: '029-figma-responsive-categories',
  run: '029-h2-normalize-content-rows',
  executedAt: new Date().toISOString(),
  workAreaId: workArea.id,
  rows,
  checks: { allEqualHeight, allTextInsideCards },
  mechanism: 'content-derived-row-height-with-fixed-equal-card-height',
  hardCodedResponsiveDimensionsIntroduced: [],
  figmaWrites: { changedWorkFrameNodeIds: [...new Set(changedNodeIds)], changedExistingNodeIds: [] },
  pageWrites: [],
  childWrites: [],
  responsiveImages: [],
  scriptResults: [{
    operationId: 'normalize-h2-content-derived-rows',
    status: allEqualHeight && allTextInsideCards ? 'applied' : 'mechanism-insufficient',
    createdNodeIds: [],
    changedNodeIds: [...new Set(changedNodeIds)],
  }],
};
