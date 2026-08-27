const ids = ['2495:6770', '2495:6762', '2495:6763'];
const nodes = [];
for (const id of ids) {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`Missing diagnostic node ${id}`);
  nodes.push({
    id: node.id,
    name: node.name,
    type: node.type,
    width: node.width,
    height: node.height,
    layoutMode: 'layoutMode' in node ? node.layoutMode : null,
    layoutSizingHorizontal: 'layoutSizingHorizontal' in node ? node.layoutSizingHorizontal : null,
    layoutSizingVertical: 'layoutSizingVertical' in node ? node.layoutSizingVertical : null,
    minWidth: 'minWidth' in node ? node.minWidth : null,
    maxWidth: 'maxWidth' in node ? node.maxWidth : null,
    minHeight: 'minHeight' in node ? node.minHeight : null,
    maxHeight: 'maxHeight' in node ? node.maxHeight : null,
    targetAspectRatio: 'targetAspectRatio' in node ? node.targetAspectRatio : null,
    inferredAutoLayout: 'inferredAutoLayout' in node ? node.inferredAutoLayout : null,
  });
}
return {
  schemaVersion: '1.0.0',
  campaignId: 'figma-responsive-carte-categorie-run-001',
  fileKey: 'd9FYAUcqdcNtsuaMgLefvJ',
  fileVersionId: '2392037050570222783',
  run: 'diagnostic',
  scriptResults: [],
  inspection: { nodes, pageWrites: [], childWrites: [] },
  responsiveImages: [],
};
