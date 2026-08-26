// Exact recovery for the interrupted 028 H3 first run on 2026-08-26.
// Refuses every state except the observed partial topology, then restores the
// fresh standalone baseline without touching Pages, consumers or children.
await figma.loadAllPagesAsync();
if (figma.fileKey !== 'd9FYAUcqdcNtsuaMgLefvJ') throw new Error('H3 recovery refused: wrong Figma file');

const historical = await figma.getNodeByIdAsync('2151:5552');
const host = await figma.getNodeByIdAsync('2448:4731');
if (!historical || historical.type !== 'COMPONENT' || historical.key !== '36011e51b8bc0b221a1ba6f9108709b5bd1c4490') {
  throw new Error('H3 recovery refused: historical Wide identity drift');
}
if (!host || host.type !== 'FRAME' || !('children' in host)) throw new Error('H3 recovery refused: governed host absent');
const set = historical.parent;
if (!set || set.type !== 'COMPONENT_SET' || set.id !== '2578:6551' || set.name !== 'HeroVideo' || set.parent?.id !== host.id) {
  throw new Error('H3 recovery refused: interrupted set signature absent');
}
const members = set.children.filter((node) => node.type === 'COMPONENT');
const expectedCreatedMembers = new Map([
  ['2578:6537', 'Presentation=Compact'],
  ['2578:6544', 'Presentation=Desktop'],
]);
const memberIds = new Set(members.map((node) => node.id));
const createdMembersMatch = members.filter((node) => node.id !== historical.id)
  .every((node) => expectedCreatedMembers.get(node.id) === node.name);
const historicalInterruptedName = ['Presentation=Wide', 'Presentation=Compact'].includes(historical.name);
if (members.length !== 3 || !memberIds.has(historical.id) || !createdMembersMatch || !historicalInterruptedName ||
    host.children.length !== 1 || host.children[0].id !== set.id) {
  throw new Error('H3 recovery refused: partial topology no longer matches the observed failure');
}

const setIndex = host.children.indexOf(set);
host.insertChild(setIndex, historical);
historical.name = 'HeroVideo';
historical.x = 0;
historical.y = 0;
historical.layoutSizingHorizontal = 'FILL';
historical.layoutSizingVertical = 'FIXED';
set.remove();

if (historical.parent?.id !== host.id || host.children.length !== 1 || host.children[0].id !== historical.id ||
    historical.name !== 'HeroVideo' || historical.layoutSizingHorizontal !== 'FILL' || historical.layoutSizingVertical !== 'FIXED') {
  throw new Error('H3 recovery postcondition failed');
}

return {
  schemaVersion: '1.0.0',
  run: 'interrupted-first-recovery',
  fileKey: figma.fileKey,
  recoveredAt: new Date().toISOString(),
  scriptResults: [{
    operationId: 'recover-interrupted-install-owner-approved-responsive-presentations',
    status: 'recovered-to-fresh-standalone-baseline',
    historicalNodeId: historical.id,
    historicalComponentKey: historical.key,
    hostNodeId: host.id,
    removedCreatedNodeIds: ['2578:6551', '2578:6537', '2578:6544'],
  }],
  inspection: {
    master: { nodeId: historical.id, name: historical.name, componentKey: historical.key, parentNodeId: historical.parent.id },
    hostChildren: host.children.map((node) => ({ nodeId: node.id, type: node.type, name: node.name })),
    figmaWrites: ['2151:5552', '2448:4731'],
    removedCreatedNodeIds: ['2578:6551', '2578:6537', '2578:6544'],
    pageWrites: [],
    childWrites: [],
  },
};
