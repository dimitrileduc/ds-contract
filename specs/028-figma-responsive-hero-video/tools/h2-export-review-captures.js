// Read-only H2 review exporter. It only exports selected proposal frames created
// by h2-create-work-frames.js and refuses any frame without the feature marker.

const INPUT = {
  featureId: '028-figma-responsive-hero-video',
  evidenceRoot: 'specs/028-figma-responsive-hero-video/proofs/H2-options',
  captures: [
    { nodeId: '2577:6021', optionId: 'option-a-balanced', caseId: 'control-320', fixtureId: 'long-title' },
    { nodeId: '2577:6069', optionId: 'option-a-balanced', caseId: 'witness-390', fixtureId: 'default' },
    { nodeId: '2577:6093', optionId: 'option-a-balanced', caseId: 'witness-390', fixtureId: 'long-title' },
    { nodeId: '2577:6117', optionId: 'option-a-balanced', caseId: 'witness-390', fixtureId: 'long-cta' },
    { nodeId: '2577:6141', optionId: 'option-a-balanced', caseId: 'witness-834', fixtureId: 'default' },
    { nodeId: '2577:6165', optionId: 'option-a-balanced', caseId: 'witness-834', fixtureId: 'long-title' },
    { nodeId: '2577:6213', optionId: 'option-a-balanced', caseId: 'witness-1200', fixtureId: 'default' },
    { nodeId: '2577:6237', optionId: 'option-a-balanced', caseId: 'witness-1200', fixtureId: 'long-title' },
    { nodeId: '2577:6261', optionId: 'option-a-balanced', caseId: 'witness-1200', fixtureId: 'long-cta' },
    { nodeId: '2577:6285', optionId: 'option-a-balanced', caseId: 'control-1440', fixtureId: 'default' },
    { nodeId: '2577:6357', optionId: 'option-a-balanced', caseId: 'witness-1728', fixtureId: 'default' },
    { nodeId: '2577:6429', optionId: 'option-a-balanced', caseId: 'control-short-landscape', fixtureId: 'default' },
    { nodeId: '2577:6453', optionId: 'option-a-balanced', caseId: 'control-short-landscape', fixtureId: 'long-title' },
    { nodeId: '2577:6501', optionId: 'option-b-expressive', caseId: 'witness-390', fixtureId: 'default' },
    { nodeId: '2577:6525', optionId: 'option-b-expressive', caseId: 'witness-1200', fixtureId: 'default' },
  ],
};

await figma.loadAllPagesAsync();

const responsiveImages = [];
const captures = [];
for (const expected of INPUT.captures) {
  const node = await figma.getNodeByIdAsync(expected.nodeId);
  if (!node || node.type !== 'FRAME') {
    throw new Error(`H2 capture refused: missing proposal frame ${expected.nodeId}`);
  }
  const marker = node.getSharedPluginData('ds_contracts', 'heroVideoResponsiveWorkArea');
  if (marker !== INPUT.featureId || node.getPluginData('authority') !== 'proposal-only') {
    throw new Error(`H2 capture refused: frame ${expected.nodeId} is not an authorized proposal`);
  }
  if (node.getPluginData('optionId') !== expected.optionId || node.getPluginData('fixtureId') !== expected.fixtureId) {
    throw new Error(`H2 capture refused: proposal identity drift for ${expected.nodeId}`);
  }
  const path = `${INPUT.evidenceRoot}/${expected.optionId}/${expected.caseId}-${expected.fixtureId}.png`;
  const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
  responsiveImages.push({ path, base64: figma.base64Encode(bytes) });
  captures.push({
    ...expected,
    path,
    width: node.width,
    height: node.height,
    byteLength: bytes.length,
    authority: 'read-only-export-of-proposal-frame',
  });
}

return {
  schemaVersion: '1.0.0',
  featureId: INPUT.featureId,
  run: 'h2-review-captures',
  fileKey: figma.fileKey,
  executedAt: new Date().toISOString(),
  captures,
  inspection: {
    exportedNodeIds: captures.map((capture) => capture.nodeId),
    figmaWrites: [],
    pageWrites: [],
    existingNodeWrites: [],
  },
  scriptResults: [
    {
      operationId: 'export-selected-h2-proposal-frames-read-only',
      result: { applied: false, captureCount: captures.length, changedNodeIds: [] },
    },
  ],
  responsiveImages,
};
