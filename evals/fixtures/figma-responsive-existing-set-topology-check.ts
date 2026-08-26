import { dryRunCampaign } from '../../extract/figma/projection-repair/apply.js';
import { emitBridgeApplyScript } from '../../extract/figma/projection-repair/bridge-script.js';
import { validateRepairCampaign } from '../../extract/figma/projection-repair/campaign.js';
import { responsiveCampaign } from './figma-responsive-fixture.js';

const clone = <T>(value: T): T => structuredClone(value);
const sha = 'c'.repeat(64);
const memberSelections = [
  { nodeId: '1:1', componentKey: 'member-superpose-2', declaredName: 'Style=Superpose, Colonnes=2', presentationValue: 'Superpose-2', variantSelection: { Style: 'Superpose', Colonnes: '2' }, authoringPreviewWidth: 1728 },
  { nodeId: '9:11', componentKey: 'member-empile-2', declaredName: 'Style=Empile, Colonnes=2', presentationValue: 'Empile-2', variantSelection: { Style: 'Empile', Colonnes: '2' }, authoringPreviewWidth: 1728 },
  { nodeId: '9:12', componentKey: 'member-superpose-3', declaredName: 'Style=Superpose, Colonnes=3', presentationValue: 'Superpose-3', variantSelection: { Style: 'Superpose', Colonnes: '3' }, authoringPreviewWidth: 1728 },
  { nodeId: '9:13', componentKey: 'member-empile-3', declaredName: 'Style=Empile, Colonnes=3', presentationValue: 'Empile-3', variantSelection: { Style: 'Empile', Colonnes: '3' }, authoringPreviewWidth: 1728 },
] as const;

export const existingSetScenarios = [320, 390, 834, 1200, 1440, 1728].flatMap((width) =>
  [2, 3].flatMap((columns) => ['normal', 'long'].map((fixtureId) => {
    const style = fixtureId === 'normal' ? 'Superpose' : 'Empile';
    return {
      scenarioId: `${width}-${style.toLowerCase()}-${columns}-${fixtureId}`,
      presentationValue: `${style}-${columns}`,
      variantSelection: { Style: style, Colonnes: String(columns) },
      width,
      height: 900,
      fixtureId,
      expectedOverflow: false as const,
      expectedCardsPerRow: width <= 390 ? 1 : width === 834 && columns === 3 ? 2 : columns,
    };
  })),
);

const usageSurfaces = Array.from({ length: 7 }, (_, index) => ({
  surfaceId: `categories:usage:${index + 1}`,
  nodeId: `2:${index + 10}`,
  positionPath: `Pages/frame-${index + 1}/instance`,
  writePolicy: 'read-only' as const,
}));

const surfaceRows = [
  {
    surfaceId: 'categories:master', targetId: 'responsive-component', role: 'master', nodeId: '9:10',
    pageComposition: null, structuralPath: '0', expectedSize: { width: 1728, height: 2504 }, impactStatus: 'pending',
  },
  ...usageSurfaces.map((usage) => ({
    surfaceId: usage.surfaceId, targetId: 'responsive-component', role: 'shared-consumer', nodeId: usage.nodeId,
    pageComposition: 'Pages', structuralPath: usage.positionPath, expectedSize: { width: 1550, height: 700 }, impactStatus: 'pending',
  })),
];

const artifacts = surfaceRows.flatMap((surface) => [
  { artifactId: `${surface.surfaceId}:structure`, surfaceId: surface.surfaceId, kind: 'structure', path: `proofs/${surface.surfaceId}.structure.json`, sha256: sha, width: null, height: null, byteLength: 10, status: 'valid' },
  { artifactId: `${surface.surfaceId}:facts`, surfaceId: surface.surfaceId, kind: 'facts', path: `proofs/${surface.surfaceId}.facts.json`, sha256: sha, width: null, height: null, byteLength: 10, status: 'valid' },
  { artifactId: `${surface.surfaceId}:png`, surfaceId: surface.surfaceId, kind: 'png', path: `proofs/${surface.surfaceId}.png`, sha256: sha, width: 100, height: 100, byteLength: 10, status: 'valid' },
]);

export const existingSetCampaign: any = clone(responsiveCampaign);
existingSetCampaign.campaignId = 'responsive-existing-set-topology';
existingSetCampaign.targets[0].masterNodeId = '9:10';
existingSetCampaign.targets[0].variantNodeIds = memberSelections.map((member) => member.nodeId);
existingSetCampaign.targets[0].reference.subjectNodeId = '9:10';
existingSetCampaign.targets[0].expectedVariantNames = memberSelections.map((member) => member.declaredName);
existingSetCampaign.targets[0].affectedSurfaceIds = surfaceRows.map((surface) => surface.surfaceId);
existingSetCampaign.targets[0].responsive = {
  componentSetTopology: {
    propertyName: 'Style',
    setName: 'Categories',
    setIdentityPolicy: 'existing',
    setNodeId: '9:10',
    setComponentKey: 'categories-set-key',
    defaultPresentationValue: 'Superpose-2',
    defaultVariantSelection: { Style: 'Superpose', Colonnes: '2' },
    variantProperties: { Style: ['Superpose', 'Empile'], Colonnes: ['2', '3'] },
    authoringLayout: { direction: 'VERTICAL', gap: 48, order: memberSelections.map((member) => member.presentationValue) },
    historicalMember: memberSelections[0],
    preservedMembers: memberSelections.slice(1),
    createdMembers: [],
    expectedMemberNames: memberSelections.map((member) => member.declaredName),
  },
  expectedCreates: [],
  authorizedTargetNodeIds: ['9:10', ...memberSelections.map((member) => member.nodeId)],
  usageSurfaces,
  expectedPropagatedDeltas: usageSurfaces.map((surface) => ({
    surfaceId: surface.surfaceId,
    nodeId: surface.nodeId,
    sourceNodeId: '9:10',
    fact: 'responsive-layout',
    attribution: 'component-master-propagation',
  })),
  contentFixtures: [
    { fixtureId: 'normal', textValues: {} },
    {
      fixtureId: 'long',
      textValues: { '0/0': 'A deliberately long category title used only by the proof instance' },
      textValuesByPresentation: {
        'Empile-2': { '0/1': 'A presentation-specific long description on a structurally different existing member' },
      },
    },
  ],
  presentationScenarios: existingSetScenarios,
  presentationLayouts: memberSelections.map((member) => ({
    presentationValue: member.presentationValue,
    variantSelection: member.variantSelection,
    nodePath: '',
    properties: {
      layoutMode: 'VERTICAL', layoutWrap: 'WRAP', layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'HUG', clipsContent: false,
      ...(member.presentationValue === 'Superpose-2' ? { minWidth: null } : {}),
    },
  })),
  primitiveBindings: [{
    presentationValue: 'Empile-2', variantSelection: { Style: 'Empile', Colonnes: '2' }, nodePath: '', property: 'itemSpacing',
    variableId: 'VariableID:1:10', variableName: 'space/24', resolvedValue: 24,
  }],
  typographyOverrides: [{
    presentationValue: 'Empile-2', variantSelection: { Style: 'Empile', Colonnes: '2' }, nodePath: '0/0', sourceRole: 'Title', sourceTextStyleId: 'S:title',
    allowedFields: ['fontSize', 'lineHeight', 'textAlignHorizontal'],
    before: { fontSize: 44, lineHeight: 48, textAlignHorizontal: 'LEFT' },
    after: { fontSize: 32, lineHeight: 40, textAlignHorizontal: 'CENTER' },
    family: 'Montserrat', weight: 400, characters: 'Default title',
    debtStatus: 'pending-responsive-text-style', ownerDecisionRef: 'proofs/responsive-component-pilot/owner-h2.json',
  }],
};
existingSetCampaign.affectedSurfaces = surfaceRows;
existingSetCampaign.allowedOperations = [{
  operationId: 'adapt-existing-set', targetId: 'responsive-component', mechanism: 'responsive-component-set', nodeId: '9:10', structuralPath: '0',
  preconditions: [{ field: 'nodeId', equals: '9:10' }], changes: { capability: 'responsive-component-set' },
  expectedPostconditions: [{ field: 'memberNames', equals: memberSelections.map((member) => member.declaredName) }],
}];
existingSetCampaign.writeBoundary = {
  allowedExistingNodeIds: ['1:0', '9:10', ...memberSelections.map((member) => member.nodeId)],
  expectedChangedNodeIds: ['9:10', ...memberSelections.map((member) => member.nodeId)],
  readOnlySurfaceNodeIds: usageSurfaces.map((surface) => surface.nodeId),
  protectedDependencyNodeIds: [], protectedChildNodeIds: ['3:1'], protectedChildPaths: ['**/Button'],
  allowedCreateRoles: [], pageWrites: [], childWrites: [],
};
existingSetCampaign.captureSets.before = {
  captureSetId: 'existing-set-before', phase: 'before', fileVersionId: existingSetCampaign.filePin.versionId,
  artifacts, imageFingerprints: [], instanceLinks: [], complete: true,
};
existingSetCampaign.state = 'ready-to-apply';

export const expectedExistingSetScenarioResults = existingSetScenarios.map((scenario) => ({
  scenarioId: scenario.scenarioId,
  selectedPresentation: scenario.presentationValue,
  selectedVariantSelection: scenario.variantSelection,
  width: scenario.width,
  height: scenario.height,
  fixtureId: scenario.fixtureId,
  rootBounds: { x: 0, y: 0, width: scenario.width, height: scenario.height },
  descendantBounds: [{ nodeId: '9:20', x: 0, y: 0, width: scenario.width, height: 100 }],
  overflow: false,
  clippedBy: [],
  contentAccessible: true,
  posterCoverage: 'cover',
  cardsPerRow: scenario.width <= 390 ? 1 : scenario.width === 834 && scenario.variantSelection.Colonnes === '3' ? 2 : Number(scenario.variantSelection.Colonnes),
  captureRef: `proofs/${scenario.scenarioId}.png`,
}));

export const expectedExistingSetBindingFacts = existingSetCampaign.targets[0].responsive.primitiveBindings.map((binding: any) => ({
  ...binding, boundVariableId: binding.variableId, status: 'attached',
}));

export const expectedExistingSetTypographyFacts = existingSetCampaign.targets[0].responsive.typographyOverrides.map((override: any) => ({
  presentationValue: override.presentationValue,
  variantSelection: override.variantSelection,
  nodePath: override.nodePath,
  sourceRole: override.sourceRole,
  sourceTextStyleId: override.sourceTextStyleId,
  appliedFields: override.after,
  family: override.family,
  weight: override.weight,
  characters: override.characters,
  debtStatus: override.debtStatus,
  status: 'allowlisted',
}));

export function existingSetBridgeEnvelope(run: 'first' | 'second') {
  const first = run === 'first';
  return {
    schemaVersion: '1.0.0', campaignId: existingSetCampaign.campaignId,
    fileKey: existingSetCampaign.filePin.fileKey, fileVersionId: existingSetCampaign.filePin.versionId, run,
    scriptResults: [{
      operationId: 'adapt-existing-set', targetId: 'responsive-component', nodeId: '9:10',
      result: first
        ? { applied: true, createdNodeIds: [], createdNodes: [], changedNodeIds: existingSetCampaign.writeBoundary.expectedChangedNodeIds }
        : { skipped: true, reason: 'unchanged', createdNodeIds: [], createdNodes: [], changedNodeIds: [] },
    }],
    inspection: {
      masters: [{
        targetId: 'responsive-component', nodeId: '9:10', componentKey: 'categories-set-key', masterCount: 1,
        setNodeId: '9:10', setKey: 'categories-set-key', setName: 'Categories',
        propertyName: 'Style', defaultPresentationValue: 'Superpose-2',
        variantProperties: { Style: ['Superpose', 'Empile'], Colonnes: ['2', '3'] },
        defaultVariantSelection: { Style: 'Superpose', Colonnes: '2' },
        variantNames: memberSelections.map((member) => member.declaredName),
        memberIdentities: memberSelections.map((member) => ({ nodeId: member.nodeId, componentKey: member.componentKey, variantSelection: member.variantSelection })),
      }],
      pageWrites: [], childWrites: [], responsiveChecks: [],
      scenarioChecks: expectedExistingSetScenarioResults,
      bindingFacts: expectedExistingSetBindingFacts,
      typographyFacts: expectedExistingSetTypographyFacts,
      memberFacts: memberSelections.map((member) => ({
        targetId: 'responsive-component', presentationValue: member.presentationValue, variantSelection: member.variantSelection,
        nodeId: member.nodeId, componentKey: member.componentKey,
        authoringPreview: { width: member.authoringPreviewWidth, layoutSizingHorizontal: 'FIXED' },
        namesAndRoles: [{ structuralPath: '', type: 'COMPONENT', name: member.declaredName }],
        media: [], texts: [], componentProperties: [], sharedChildren: [],
      })),
      propagatedDeltas: existingSetCampaign.targets[0].responsive.expectedPropagatedDeltas.map((delta: any) => ({ ...delta, status: 'attributed' })),
    },
  };
}

const validation = validateRepairCampaign(existingSetCampaign);
if (!validation.ok) throw new Error(`existing set topology refused: ${validation.issues.map((entry) => entry.message).join(', ')}`);
const plan = dryRunCampaign(validation.value);
if (plan.expectedCreates.length !== 0) throw new Error('existing set dry-run invented created members');
const bridge = emitBridgeApplyScript(validation.value, plan, 'first');
if (!bridge.includes('hostIsTraversalOnlyExistingParent') ||
  !bridge.includes("if (topology.setIdentityPolicy === 'additive') changedNodeIds.add(host.id);") ||
  !bridge.includes('textValuesByPresentation') || !bridge.includes('"layoutWrap":"WRAP"') ||
  !bridge.includes('"minWidth":null')) {
  throw new Error('existing-set bridge omitted traversal-only parent handling, presentation-specific fixtures or wrap authoring');
}
if (validation.value.targets[0].responsive?.componentSetTopology.preservedMembers?.length !== 3) {
  throw new Error('existing set did not preserve all four member identities');
}

console.log('✔ existing four-member set topology is explicit, identity-preserving and honest about zero creates');
