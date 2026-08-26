// Exact rollback of the fully verified layout probe before the canonical run.
await figma.loadAllPagesAsync();
if (figma.fileKey !== 'd9FYAUcqdcNtsuaMgLefvJ') throw new Error('H3 layout-probe recovery refused: wrong file');
const historical = await figma.getNodeByIdAsync('2151:5552');
const host = await figma.getNodeByIdAsync('2448:4731');
if (!historical || historical.type !== 'COMPONENT' || historical.key !== '36011e51b8bc0b221a1ba6f9108709b5bd1c4490' ||
    !host || host.type !== 'FRAME' || !('children' in host)) throw new Error('H3 layout-probe recovery refused: historical/host identity drift');
const set = historical.parent;
if (!set || set.type !== 'COMPONENT_SET' || set.id !== '2580:6873' || set.name !== 'HeroVideo' || set.parent?.id !== host.id ||
    set.layoutMode !== 'VERTICAL' || host.children.length !== 1 || host.children[0].id !== set.id) {
  throw new Error('H3 layout-probe recovery refused: set signature absent');
}
const expectedMembers = new Map([
  ['2151:5552', 'Presentation=Wide'],
  ['2580:6859', 'Presentation=Compact'],
  ['2580:6866', 'Presentation=Desktop'],
]);
const members = set.children.filter((node) => node.type === 'COMPONENT');
if (members.length !== 3 || members.some((node) => expectedMembers.get(node.id) !== node.name)) {
  throw new Error('H3 layout-probe recovery refused: members drifted');
}
const heightVariable = await figma.variables.getVariableByIdAsync('VariableID:2434:5919');
if (!heightVariable || heightVariable.name !== 'size/hero-video/root') throw new Error('H3 layout-probe recovery refused: height variable absent');
const setIndex = host.children.indexOf(set);
host.insertChild(setIndex, historical);
historical.name = 'HeroVideo';
historical.layoutSizingVertical = 'FIXED';
historical.resize(1728, 720);
historical.setBoundVariable('height', heightVariable);
historical.layoutSizingHorizontal = 'FILL';
historical.x = 0;
historical.y = 0;
set.remove();
const heightBinding = historical.boundVariables?.height || historical.boundVariables?.size?.y;
const heightBindingId = heightBinding && (heightBinding.id || heightBinding.variableId);
if (historical.parent?.id !== host.id || host.children.length !== 1 || host.children[0].id !== historical.id || historical.name !== 'HeroVideo' ||
    historical.width !== 1728 || historical.height !== 720 || historical.layoutMode !== 'HORIZONTAL' ||
    historical.layoutSizingHorizontal !== 'FILL' || historical.layoutSizingVertical !== 'FIXED' || heightBindingId !== 'VariableID:2434:5919') {
  throw new Error('H3 layout-probe recovery postcondition failed');
}
return {
  schemaVersion: '1.0.0',
  run: 'layout-probe-recovery',
  fileKey: figma.fileKey,
  recoveredAt: new Date().toISOString(),
  scriptResults: [{
    operationId: 'recover-verified-layout-probe',
    status: 'recovered-to-fresh-standalone-baseline',
    historicalNodeId: historical.id,
    historicalComponentKey: historical.key,
    hostNodeId: host.id,
    removedCreatedNodeIds: ['2580:6873', '2580:6859', '2580:6866'],
  }],
  inspection: {
    master: { nodeId: historical.id, name: historical.name, componentKey: historical.key, parentNodeId: historical.parent.id, width: historical.width, height: historical.height, layoutSizingHorizontal: historical.layoutSizingHorizontal, layoutSizingVertical: historical.layoutSizingVertical, heightVariableId: heightBindingId },
    hostChildren: host.children.map((node) => ({ nodeId: node.id, type: node.type, name: node.name })),
    figmaWrites: ['2151:5552', '2448:4731'],
    removedCreatedNodeIds: ['2580:6873', '2580:6859', '2580:6866'],
    pageWrites: [],
    childWrites: [],
  },
};
