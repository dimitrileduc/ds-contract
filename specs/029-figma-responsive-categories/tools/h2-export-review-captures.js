// Read-only export of the final H2 proposal state after content normalization.

await figma.loadAllPagesAsync();

const page = await figma.getNodeByIdAsync('2052:1146');
if (!page || page.type !== 'PAGE' || page.name !== 'DS · Organisms') throw new Error('H2 export refused: work page drift');
const areas = page.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData('ds_contracts', 'categoriesResponsiveWorkArea') === '029-figma-responsive-categories');
if (areas.length !== 1) throw new Error(`H2 export refused: expected one work area, got ${areas.length}`);
const workArea = areas[0];
const scenarioIds = [
  'matrix-390-c3-normal',
  'matrix-834-c3-long',
  'matrix-1200-c3-long',
  'matrix-1728-c2-normal',
  'orphan-preserve',
  'orphan-stretch',
  'odd-count-preserve',
  'media-edges',
];
const frames = workArea.children.filter((node) => node.type === 'FRAME' && scenarioIds.includes(node.getPluginData('scenarioId')));
if (frames.length !== scenarioIds.length) throw new Error(`H2 export refused: expected ${scenarioIds.length} review frames, got ${frames.length}`);
const byScenario = new Map(frames.map((node) => [node.getPluginData('scenarioId'), node]));
const responsiveImages = [];
const exportManifest = [];
for (const scenarioId of scenarioIds) {
  const frame = byScenario.get(scenarioId);
  const path = `specs/029-figma-responsive-categories/proofs/H2-options/${scenarioId}.png`;
  const bytes = await frame.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
  const bounds = frame.absoluteBoundingBox ? {
    x: frame.absoluteBoundingBox.x,
    y: frame.absoluteBoundingBox.y,
    width: frame.absoluteBoundingBox.width,
    height: frame.absoluteBoundingBox.height,
  } : null;
  responsiveImages.push({ path, base64: figma.base64Encode(bytes) });
  exportManifest.push({ scenarioId, frameId: frame.id, path, bounds, byteLength: bytes.byteLength });
}

return {
  schemaVersion: '1.0.0',
  featureId: '029-figma-responsive-categories',
  run: '029-h2-export-review-captures',
  inspectedAt: new Date().toISOString(),
  workArea: { nodeId: workArea.id, pageId: page.id, pageName: page.name },
  exportManifest,
  inspection: {
    scenarioChecks: exportManifest.map((entry) => ({
      scenarioId: entry.scenarioId,
      selectedPresentation: byScenario.get(entry.scenarioId).getPluginData('presentation'),
      captureRef: entry.path,
    })),
    bindingFacts: [],
    typographyFacts: [],
    memberFacts: [],
    childWrites: [],
  },
  figmaWrites: [],
  pageWrites: [],
  childWrites: [],
  responsiveImages,
  scriptResults: [{ operationId: 'export-h2-review-captures-read-only', status: 'exported' }],
};
