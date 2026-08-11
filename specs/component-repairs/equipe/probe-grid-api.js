await figma.loadAllPagesAsync();
const grid = await figma.getNodeByIdAsync('2351:36547');
if (!grid || grid.type !== 'FRAME') throw new Error('Equipe grid missing');
const card = grid.children[0];
const picture = card?.type === 'INSTANCE' ? card.findOne((node) => node.type === 'INSTANCE') : null;
const fields = [
  'gridRowCount', 'gridColumnCount', 'gridRowGap', 'gridColumnGap',
  'gridRowSizes', 'gridColumnSizes', 'gridChildHorizontalAlign',
  'gridChildVerticalAlign', 'gridColumnAnchorIndex', 'gridColumnSpan',
];
return {
  nodeId: grid.id,
  layoutMode: grid.layoutMode,
  supportedFields: Object.fromEntries(fields.map((field) => [field, field in grid])),
  card: card ? {
    id: card.id,
    type: card.type,
    width: card.width,
    height: card.height,
    constrainProportionsSupported: 'constrainProportions' in card,
    constrainProportions: 'constrainProportions' in card ? card.constrainProportions : null,
    targetAspectRatioSupported: 'targetAspectRatio' in card,
    targetAspectRatio: 'targetAspectRatio' in card ? card.targetAspectRatio : null,
  } : null,
  picture: picture ? {
    id: picture.id,
    width: picture.width,
    height: picture.height,
    constrainProportionsSupported: 'constrainProportions' in picture,
    constrainProportions: 'constrainProportions' in picture ? picture.constrainProportions : null,
    targetAspectRatioSupported: 'targetAspectRatio' in picture,
    targetAspectRatio: 'targetAspectRatio' in picture ? picture.targetAspectRatio : null,
  } : null,
};
