import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const feature = 'specs/029-figma-responsive-categories';
const bridgePath = `${feature}/proofs/H1-bridge-read-only.json`;
const bridge = JSON.parse(readFileSync(path.join(root, bridgePath), 'utf8'));

const writeJson = (relativePath, value) => {
  const absolute = path.join(root, relativePath);
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`);
};

const pngSize = (bytes) => {
  if (bytes.length < 24 || bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const treeSummary = (rows) => ({
  nodeCount: rows.length,
  textFactCount: rows.filter((row) => row.text).length,
  imagePaintCount: rows.flatMap((row) => row.paints || []).filter((paint) => paint.type === 'IMAGE').length,
  gradientPaintCount: rows.flatMap((row) => row.paints || []).filter((paint) => String(paint.type || '').startsWith('GRADIENT_')).length,
  boundVariableFactCount: rows.filter((row) => row.boundVariables && Object.keys(row.boundVariables).length > 0).length,
  componentPropertyFactCount: rows.filter((row) => row.componentProperties && Object.keys(row.componentProperties).length > 0).length,
});

writeJson(`${feature}/inventory/H1-card-exclusivity.json`, {
  schemaVersion: '1.0.0',
  featureId: '029-figma-responsive-categories',
  inspectedAt: bridge.inspectedAt,
  sourceRef: bridgePath,
  method: 'whole-file position census through the read-only Figma Plugin API',
  ...bridge.cardExclusivity,
  acceptance: {
    expectedOnlyComposerSetId: bridge.identities.sectionSet.id,
    exclusive: bridge.cardExclusivity.exclusive,
    mutableScope: bridge.cardExclusivity.mutableScope,
    onFailure: 'out-of-scope/owner-decision',
  },
  figmaWrites: [],
  pageWrites: [],
  childWrites: [],
});

writeJson(`${feature}/inventory/H1-usages.json`, {
  schemaVersion: '1.0.0',
  featureId: '029-figma-responsive-categories',
  inspectedAt: bridge.inspectedAt,
  sourceRef: bridgePath,
  page: { id: '210:325', name: 'Pages' },
  censusMethod: ['position', 'main-component-identity', 'nested-card-identity'],
  expectedCount: 7,
  observedCount: bridge.usages.length,
  uniqueInstanceNodeIds: new Set(bridge.usages.map((usage) => usage.instanceNodeId)).size === bridge.usages.length,
  configurationSummary: {
    twoColumns: bridge.usages.filter((usage) => usage.configuration.Colonnes === '2').length,
    threeColumns: bridge.usages.filter((usage) => usage.configuration.Colonnes === '3').length,
    superpose: bridge.usages.filter((usage) => usage.configuration.Style === 'Superpose').length,
    empile: bridge.usages.filter((usage) => usage.configuration.Style === 'Empile').length,
    totalCards: bridge.usages.reduce((sum, usage) => sum + usage.cardCount, 0),
  },
  usages: bridge.usages,
  figmaWrites: [],
  pageWrites: [],
  childWrites: [],
});

writeJson(`${feature}/inventory/H1-primitives.json`, {
  schemaVersion: '1.0.0',
  featureId: '029-figma-responsive-categories',
  inspectedAt: bridge.inspectedAt,
  sourceRef: bridgePath,
  policy: 'existing local FLOAT variables only; inventory is not an approval or a new responsive token set',
  localFloatVariableCount: bridge.primitives.localFloatVariableCount,
  compatiblePrimitiveCount: bridge.primitives.compatiblePrimitiveCount,
  values: bridge.primitives.values,
  createdVariables: [],
  modifiedVariables: [],
  figmaWrites: [],
});

const surfaces = bridge.exportManifest.map((entry) => {
  const bytes = readFileSync(path.join(root, entry.path));
  const actualDimensions = pngSize(bytes);
  return {
    ...entry,
    byteLength: bytes.length,
    sha256: sha256(bytes),
    actualDimensions,
    nonEmpty: bytes.length > 0,
    positiveDimensions: Boolean(actualDimensions && actualDimensions.width > 0 && actualDimensions.height > 0),
    renderDimensionDelta: actualDimensions ? {
      width: actualDimensions.width - entry.expectedBounds.width,
      height: actualDimensions.height - entry.expectedBounds.height,
      note: 'PNG export follows Figma render bounds; fractional layout bounds and transparent outer space may round or crop differently.',
    } : null,
  };
});

writeJson(`${feature}/proofs/H1-surface-manifest.json`, {
  schemaVersion: '1.0.0',
  featureId: '029-figma-responsive-categories',
  inspectedAt: bridge.inspectedAt,
  sourceRef: bridgePath,
  expectedSurfaceCount: 13,
  observedSurfaceCount: surfaces.length,
  roleCounts: {
    sectionMembers: surfaces.filter((surface) => surface.role === 'section-member').length,
    cardMembers: surfaces.filter((surface) => surface.role === 'card-member').length,
    pageUsages: surfaces.filter((surface) => surface.role === 'page-usage').length,
  },
  allNonEmpty: surfaces.every((surface) => surface.nonEmpty),
  allPositiveDimensions: surfaces.every((surface) => surface.positiveDimensions),
  surfaces,
  figmaWrites: [],
  pageWrites: [],
  childWrites: [],
});

const enrichAudit = (auditPath, identityKey, treeKey, extra) => {
  const absolute = path.join(root, auditPath);
  const audit = JSON.parse(readFileSync(absolute, 'utf8'));
  audit.feature029Evidence = {
    sourceRef: bridgePath,
    inspectedAt: bridge.inspectedAt,
    identity: bridge.identities[identityKey],
    treeSummary: treeSummary(bridge.trees[treeKey]),
    detailedTreeRef: `${bridgePath}#/trees/${treeKey}`,
    dependencyRef: `${bridgePath}#/dependencies`,
    primitiveInventoryRef: `${feature}/inventory/H1-primitives.json`,
    surfaceManifestRef: `${feature}/proofs/H1-surface-manifest.json`,
    ...extra,
    figmaWrites: [],
    pageWrites: [],
    childWrites: [],
  };
  writeFileSync(absolute, `${JSON.stringify(audit, null, 2)}\n`);
};

enrichAudit(
  'specs/component-repairs/categories-principales/run-001/audit.json',
  'sectionSet',
  'sectionSet',
  {
    usageInventoryRef: `${feature}/inventory/H1-usages.json`,
    observedUsageCount: bridge.usages.length,
    axes: bridge.identities.sectionSet.componentPropertyDefinitions,
    protectedDependencySets: bridge.dependencies.find((entry) => entry.rootId === bridge.identities.sectionSet.id)?.values || [],
  },
);

enrichAudit(
  'specs/component-repairs/carte-categorie/run-001/audit.json',
  'cardSet',
  'cardSet',
  {
    exclusivityRef: `${feature}/inventory/H1-card-exclusivity.json`,
    exclusivity: {
      totalInstances: bridge.cardExclusivity.totalInstances,
      sourceComposerInstanceCount: bridge.cardExclusivity.sourceComposerInstanceCount,
      pagePropagatedInstanceCount: bridge.cardExclusivity.pagePropagatedInstanceCount,
      otherComposerInstanceCount: bridge.cardExclusivity.otherComposerInstanceCount,
      exclusive: bridge.cardExclusivity.exclusive,
      mutableScope: bridge.cardExclusivity.mutableScope,
      legacyCandidate: bridge.cardExclusivity.legacyCandidate,
    },
    axes: bridge.identities.cardSet.componentPropertyDefinitions,
    protectedDependencies: bridge.dependencies.find((entry) => entry.rootId === bridge.identities.cardSet.id)?.values || [],
  },
);

console.log(JSON.stringify({
  cardExclusive: bridge.cardExclusivity.exclusive,
  usages: bridge.usages.length,
  primitives: bridge.primitives.compatiblePrimitiveCount,
  surfaces: surfaces.length,
  allNonEmpty: surfaces.every((surface) => surface.nonEmpty),
  allPositiveDimensions: surfaces.every((surface) => surface.positiveDimensions),
}, null, 2));
