// Mimics the stable result envelope of a generated amend-capable Figma script.
const master = await figma.getNodeByIdAsync('2151:5552');
if (master.__fixtureAmended === true) {
  return { createdNodeIds: [], results: [{ nodeId: master.id, skipped: true, reason: 'unchanged' }], fontFallbacks: [] };
}
master.__fixtureAmended = true;
return { createdNodeIds: [master.id], results: [{ nodeId: master.id, amended: true }], fontFallbacks: [] };
