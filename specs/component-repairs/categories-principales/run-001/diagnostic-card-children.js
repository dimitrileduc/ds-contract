const ids = ['2495:6779','2495:6788','2115:4177','2115:4178','2115:4204','2115:4205','2115:4206','2495:7123','2495:7124','2495:7125'];
const nodes = [];
for (const id of ids) {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`Missing ${id}`);
  nodes.push({
    id: node.id,
    parentId: node.parent?.id ?? null,
    width: node.width,
    height: node.height,
    layoutSizingHorizontal: 'layoutSizingHorizontal' in node ? node.layoutSizingHorizontal : null,
    layoutAlign: 'layoutAlign' in node ? node.layoutAlign : null,
    layoutGrow: 'layoutGrow' in node ? node.layoutGrow : null,
    minWidth: 'minWidth' in node ? node.minWidth : null,
    maxWidth: 'maxWidth' in node ? node.maxWidth : null,
  });
}
return { schemaVersion:'1.0.0', campaignId:'figma-responsive-categories-principales-run-001', fileKey:'d9FYAUcqdcNtsuaMgLefvJ', fileVersionId:'2392091518820622154', run:'diagnostic', scriptResults:[], inspection:{nodes,pageWrites:[],childWrites:[]}, responsiveImages:[] };
