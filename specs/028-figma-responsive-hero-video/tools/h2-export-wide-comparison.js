// Read-only, same-renderer comparison between the governed historical master
// and the proposal's Wide witness.

await figma.loadAllPagesAsync();
const master = await figma.getNodeByIdAsync('2151:5552');
const wide = await figma.getNodeByIdAsync('2577:6357');
if (!master || master.type !== 'COMPONENT' || master.key !== '36011e51b8bc0b221a1ba6f9108709b5bd1c4490') {
  throw new Error('H2 Wide comparison refused: historical master identity drift');
}
if (!wide || wide.type !== 'FRAME' || wide.getPluginData('optionId') !== 'option-a-balanced') {
  throw new Error('H2 Wide comparison refused: proposal witness identity drift');
}

const sources = [
  { node: master, role: 'historical-master', path: 'specs/028-figma-responsive-hero-video/proofs/H2-wide-comparison/historical-master.png' },
  { node: wide, role: 'proposal-wide-1728', path: 'specs/028-figma-responsive-hero-video/proofs/H2-wide-comparison/proposal-wide-1728.png' },
];
const responsiveImages = [];
const captures = [];
for (const source of sources) {
  const bytes = await source.node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
  responsiveImages.push({ path: source.path, base64: figma.base64Encode(bytes) });
  captures.push({ role: source.role, nodeId: source.node.id, path: source.path, width: source.node.width, height: source.node.height, byteLength: bytes.length });
}

return {
  schemaVersion: '1.0.0',
  featureId: '028-figma-responsive-hero-video',
  run: 'h2-wide-same-renderer-comparison',
  fileKey: figma.fileKey,
  executedAt: new Date().toISOString(),
  captures,
  inspection: { figmaWrites: [], pageWrites: [], existingNodeWrites: [] },
  scriptResults: [{ operationId: 'export-historical-and-proposal-wide-read-only', result: { applied: false, changedNodeIds: [] } }],
  responsiveImages,
};
