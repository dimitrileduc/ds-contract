const set = await figma.getNodeByIdAsync('2495:6770');
const superpose = await figma.getNodeByIdAsync('2495:6762');
const empile = await figma.getNodeByIdAsync('2495:6763');
if (!set || set.type !== 'COMPONENT_SET' || !superpose || superpose.type !== 'COMPONENT' || !empile || empile.type !== 'COMPONENT') {
  throw new Error('Rollback target identity drift');
}
if (Math.abs(set.width - 744) > 0.01 || Math.abs(set.height - 1104) > 0.01 || superpose.minWidth !== 744) {
  throw new Error(`Rollback precondition drift: set=${set.width}x${set.height}, superpose.minWidth=${superpose.minWidth}`);
}
const empileText = empile.children[1];
const empileButton = empile.children[2];
if (!empileText || empileText.id !== '2495:6765' || !empileButton || empileButton.id !== '2495:6768') {
  throw new Error('Rollback child identity drift');
}

superpose.layoutSizingVertical = 'FIXED';
empileText.clipsContent = true;
empileButton.clipsContent = true;
superpose.x = 0;
superpose.y = 0;
empile.x = 3000;
empile.y = 3400;
set.resize(3743, 4022);
if (typeof figma.commitUndo === 'function') figma.commitUndo();

return {
  schemaVersion: '1.0.0',
  campaignId: 'figma-responsive-carte-categorie-run-001',
  fileKey: 'd9FYAUcqdcNtsuaMgLefvJ',
  fileVersionId: '2392037050570222783',
  run: 'rollback-attempt-1',
  scriptResults: [{
    operationId: 'rollback-unreceipted-attempt-1',
    targetId: 'carte-categorie',
    nodeId: set.id,
    result: { applied: true, createdNodeIds: [], changedNodeIds: [set.id, superpose.id, empile.id] },
  }],
  inspection: { pageWrites: [], childWrites: [] },
  responsiveImages: [],
};
