// Final bounded postcondition for the second recovery: resize() restored every
// fact but natively reset horizontal sizing to FIXED. Refuse any other state.
await figma.loadAllPagesAsync();
if (figma.fileKey !== 'd9FYAUcqdcNtsuaMgLefvJ') throw new Error('H3 recovery finalizer refused: wrong file');
const historical = await figma.getNodeByIdAsync('2151:5552');
const host = await figma.getNodeByIdAsync('2448:4731');
if (!historical || historical.type !== 'COMPONENT' || historical.name !== 'HeroVideo' ||
    historical.key !== '36011e51b8bc0b221a1ba6f9108709b5bd1c4490' || historical.parent?.id !== host?.id ||
    !host || host.type !== 'FRAME' || !('children' in host) || host.children.length !== 1 || host.children[0].id !== historical.id ||
    historical.width !== 1728 || historical.height !== 720 || historical.layoutMode !== 'HORIZONTAL' ||
    historical.layoutSizingHorizontal !== 'FIXED' || historical.layoutSizingVertical !== 'FIXED') {
  throw new Error('H3 recovery finalizer refused: state is not the single observed sizing delta');
}
const heightBinding = historical.boundVariables?.height || historical.boundVariables?.size?.y;
const heightBindingId = heightBinding && (heightBinding.id || heightBinding.variableId);
if (heightBindingId !== 'VariableID:2434:5919') throw new Error('H3 recovery finalizer refused: height binding drift');
historical.layoutSizingHorizontal = 'FILL';
if (historical.layoutSizingHorizontal !== 'FILL') throw new Error('H3 recovery finalizer postcondition failed');
return {
  schemaVersion: '1.0.0',
  run: 'interrupted-binding-recovery-finalizer',
  fileKey: figma.fileKey,
  recoveredAt: new Date().toISOString(),
  scriptResults: [{ operationId: 'restore-historical-horizontal-fill', status: 'recovered-to-fresh-standalone-baseline', changedNodeIds: [historical.id] }],
  inspection: {
    master: { nodeId: historical.id, name: historical.name, componentKey: historical.key, parentNodeId: historical.parent.id, width: historical.width, height: historical.height, layoutSizingHorizontal: historical.layoutSizingHorizontal, layoutSizingVertical: historical.layoutSizingVertical, heightVariableId: heightBindingId },
    figmaWrites: [historical.id],
    pageWrites: [],
    childWrites: [],
  },
};
