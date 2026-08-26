// Exact recovery for the second interrupted 028 H3 first-run attempt.
await figma.loadAllPagesAsync();
if (figma.fileKey !== 'd9FYAUcqdcNtsuaMgLefvJ') throw new Error('H3 binding recovery refused: wrong Figma file');

const historical = await figma.getNodeByIdAsync('2151:5552');
const host = await figma.getNodeByIdAsync('2448:4731');
if (!historical || historical.type !== 'COMPONENT' || historical.key !== '36011e51b8bc0b221a1ba6f9108709b5bd1c4490') {
  throw new Error('H3 binding recovery refused: historical identity drift');
}
if (!host || host.type !== 'FRAME' || !('children' in host)) throw new Error('H3 binding recovery refused: governed host absent');
const set = historical.parent;
if (!set || set.type !== 'COMPONENT_SET' || set.id !== '2580:6576' || set.name !== 'HeroVideo' || set.parent?.id !== host.id ||
    set.layoutMode !== 'VERTICAL' || host.children.length !== 1 || host.children[0].id !== set.id) {
  throw new Error('H3 binding recovery refused: interrupted set signature absent');
}
const expectedMembers = new Map([
  ['2151:5552', 'Presentation=Wide'],
  ['2580:6562', 'Presentation=Compact'],
  ['2580:6569', 'Presentation=Desktop'],
]);
const members = set.children.filter((node) => node.type === 'COMPONENT');
if (members.length !== 3 || members.some((node) => expectedMembers.get(node.id) !== node.name)) {
  throw new Error('H3 binding recovery refused: partial members drifted');
}

const heightVariable = await figma.variables.getVariableByIdAsync('VariableID:2434:5919');
if (!heightVariable || heightVariable.name !== 'size/hero-video/root') throw new Error('H3 binding recovery refused: historical height variable absent');
const setIndex = host.children.indexOf(set);
host.insertChild(setIndex, historical);
historical.name = 'HeroVideo';
historical.layoutSizingHorizontal = 'FILL';
historical.layoutSizingVertical = 'FIXED';
historical.resize(1728, 720);
historical.setBoundVariable('height', heightVariable);
historical.layoutSizingHorizontal = 'FILL';
historical.x = 0;
historical.y = 0;
set.remove();

const sizeBinding = historical.boundVariables?.height || historical.boundVariables?.size?.y;
const sizeBindingId = sizeBinding && (sizeBinding.id || sizeBinding.variableId);
if (historical.parent?.id !== host.id || host.children.length !== 1 || host.children[0].id !== historical.id || historical.name !== 'HeroVideo' ||
    historical.width !== 1728 || historical.height !== 720 || historical.layoutSizingHorizontal !== 'FILL' || historical.layoutSizingVertical !== 'FIXED' ||
    sizeBindingId !== 'VariableID:2434:5919') {
  throw new Error('H3 binding recovery postcondition failed');
}

return {
  schemaVersion: '1.0.0',
  run: 'interrupted-binding-recovery',
  fileKey: figma.fileKey,
  recoveredAt: new Date().toISOString(),
  scriptResults: [{
    operationId: 'recover-interrupted-historical-height-binding',
    status: 'recovered-to-fresh-standalone-baseline',
    historicalNodeId: historical.id,
    historicalComponentKey: historical.key,
    historicalHeightVariableId: sizeBindingId,
    hostNodeId: host.id,
    removedCreatedNodeIds: ['2580:6576', '2580:6562', '2580:6569'],
  }],
  inspection: {
    master: { nodeId: historical.id, name: historical.name, componentKey: historical.key, parentNodeId: historical.parent.id, width: historical.width, height: historical.height, heightVariableId: sizeBindingId },
    hostChildren: host.children.map((node) => ({ nodeId: node.id, type: node.type, name: node.name })),
    figmaWrites: ['2151:5552', '2448:4731'],
    removedCreatedNodeIds: ['2580:6576', '2580:6562', '2580:6569'],
    pageWrites: [],
    childWrites: [],
  },
};
