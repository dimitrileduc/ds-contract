import { dryRunCampaign } from '../../extract/figma/projection-repair/apply.js';
import { readFileSync } from 'node:fs';
import { normalizeBridgeApplyEnvelope, validateLiveApplyReceipt } from '../../extract/figma/projection-repair/apply-receipt.js';
import { emitBridgeApplyScript } from '../../extract/figma/projection-repair/bridge-script.js';
import { validateRepairCampaign } from '../../extract/figma/projection-repair/campaign.js';
import { collectSurfaceFacts, compareResponsiveTransitionProtectedFacts } from '../../extract/figma/projection-repair/facts.js';
import { bridgeEnvelope, createResponsiveFigmaMock, responsiveCampaign } from './figma-responsive-fixture.js';

const validation = validateRepairCampaign(responsiveCampaign);
const captureSource = readFileSync('extract/figma/projection-repair/capture.ts', 'utf8');
if (!captureSource.includes("enforceTopology: phase === 'before'")) {
  throw new Error('post-transition capture still enforces the standalone preflight topology');
}
if (!validation.ok) throw new Error(`responsive component-set campaign refused: ${validation.issues.map((issue) => issue.message).join(', ')}`);
const plan = dryRunCampaign(validation.value);
if (plan.expectedCreates.length !== 3) throw new Error('dry-run did not expose the three declared creates');

const first = normalizeBridgeApplyEnvelope(bridgeEnvelope('first'), validation.value, plan, 'first');
const firstValidation = validateLiveApplyReceipt(first, validation.value, plan, 'first');
if (!firstValidation.ok) throw new Error(`declared component-set transition refused: ${firstValidation.issues.join(', ')}`);
if (first.operations[0].createdNodes.length !== 3) throw new Error('created nodes were hidden by normalization');

const historicalCheck = first.masters[0];
if (historicalCheck.nodeId !== '1:1' || historicalCheck.componentKey !== 'historical-key' || historicalCheck.setNodeId !== '9:10') {
  throw new Error('historical Wide identity was not preserved under the additive set');
}

const hiddenCreate = bridgeEnvelope('first');
hiddenCreate.scriptResults[0].result.createdNodeIds.push('9:99');
let hiddenCreateRefused = false;
try {
  const normalized = normalizeBridgeApplyEnvelope(hiddenCreate, validation.value, plan, 'first');
  hiddenCreateRefused = !validateLiveApplyReceipt(normalized, validation.value, plan, 'first').ok;
} catch { hiddenCreateRefused = true; }
if (!hiddenCreateRefused) throw new Error('unexpected-created-node was accepted');

const { figma, historical, homeInstance } = createResponsiveFigmaMock();
const homeBefore = {
  nodeId: homeInstance.id,
  mainComponentNodeId: homeInstance.mainComponent.id,
  componentProperties: structuredClone(homeInstance.componentProperties),
  overrides: structuredClone(homeInstance.overrides),
};
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (...args: string[]) => (...values: unknown[]) => Promise<any>;
const execute = async (run: 'first' | 'second') => new AsyncFunction('figma', emitBridgeApplyScript(validation.value, plan, run))(figma);
const liveFirstEnvelope = await execute('first');
const liveFirst = normalizeBridgeApplyEnvelope(liveFirstEnvelope, validation.value, plan, 'first');
const liveFirstGate = validateLiveApplyReceipt(liveFirst, validation.value, plan, 'first');
if (!liveFirstGate.ok) throw new Error(`generic Bridge first pass failed: ${liveFirstGate.issues.join(', ')}`);
if (historical.id !== '1:1' || historical.key !== 'historical-key' || historical.name !== 'Presentation=Wide') {
  throw new Error('generic Bridge replaced or misnamed the historical Wide member');
}
const set = historical.parent;
if (set?.type !== 'COMPONENT_SET' || set.layoutMode !== 'NONE' || set.layoutSizingHorizontal !== 'FILL') {
  throw new Error('generic Bridge did not keep the component set as a freeform authoring catalogue that fills its governed Container');
}
const previewWidths = Object.fromEntries(set.children.map((member: any) => [member.name, member.width]));
if (previewWidths['Presentation=Compact'] !== 390 || previewWidths['Presentation=Desktop'] !== 1200 || previewWidths['Presentation=Wide'] !== 1728 ||
  set.children.some((member: any) => member.layoutSizingHorizontal !== 'FIXED')) {
  throw new Error('generic Bridge conflated authoring preview widths with FILL instance sizing');
}
if (historical.height !== 720 || historical.layoutSizingVertical !== 'FIXED' || historical.boundVariables?.size?.y?.id !== 'VariableID:1:12') {
  throw new Error('generic Bridge did not restore the native size.y binding detached by combineAsVariants');
}
const homeAfterFirst = {
  nodeId: homeInstance.id,
  mainComponentNodeId: homeInstance.mainComponent.id,
  componentProperties: structuredClone(homeInstance.componentProperties),
  overrides: structuredClone(homeInstance.overrides),
};
if (JSON.stringify(homeAfterFirst) !== JSON.stringify(homeBefore)) {
  throw new Error('generic Bridge changed the Home witness link or overrides during the first pass');
}
const liveSecondEnvelope = await execute('second');
const liveSecond = normalizeBridgeApplyEnvelope(liveSecondEnvelope, validation.value, plan, 'second');
const liveSecondGate = validateLiveApplyReceipt(liveSecond, validation.value, plan, 'second');
if (!liveSecondGate.ok || liveSecond.operations.some((operation) => operation.status !== 'no-op')) {
  throw new Error(`generic Bridge second pass was not no-op: ${liveSecondGate.ok ? 'operation status' : liveSecondGate.issues.join(', ')}`);
}
const homeAfterSecond = {
  nodeId: homeInstance.id,
  mainComponentNodeId: homeInstance.mainComponent.id,
  componentProperties: structuredClone(homeInstance.componentProperties),
  overrides: structuredClone(homeInstance.overrides),
};
if (JSON.stringify(homeAfterSecond) !== JSON.stringify(homeBefore)) {
  throw new Error('generic Bridge changed the Home witness link or overrides during the second pass');
}

// Reproduce the live authoring defect from run-003: a 1728-wide auto-layout
// set stretches every direct variant member. The same bounded capability must
// repair an existing topology without recreating anything.
set.layoutMode = 'VERTICAL';
for (const member of set.children) {
  member.layoutSizingHorizontal = 'FILL';
  member.resize(1728, member.height);
}
set.resize(1728, set.children.reduce((height: number, member: any) => height + member.height, 0));

const correctionCampaign: any = structuredClone(responsiveCampaign);
correctionCampaign.campaignId = 'responsive-component-existing-layout-correction';
correctionCampaign.targets[0].responsive.componentSetTopology.setIdentityPolicy = 'existing';
correctionCampaign.targets[0].responsive.componentSetTopology.setNodeId = set.id;
for (const declaration of correctionCampaign.targets[0].responsive.componentSetTopology.createdMembers) {
  declaration.nodeId = set.children.find((member: any) => member.name === declaration.declaredName)?.id;
}
correctionCampaign.targets[0].responsive.expectedCreates = [];
correctionCampaign.writeBoundary.allowedCreateRoles = [];
correctionCampaign.writeBoundary.allowedExistingNodeIds = ['1:0', set.id, ...set.children.map((member: any) => member.id)];
correctionCampaign.writeBoundary.expectedChangedNodeIds = [...correctionCampaign.writeBoundary.allowedExistingNodeIds];
const correctionValidation = validateRepairCampaign(correctionCampaign);
if (!correctionValidation.ok) throw new Error(`existing component-set correction refused: ${correctionValidation.issues.map((issue) => issue.message).join(', ')}`);
const correctionPlan = dryRunCampaign(correctionValidation.value);
const executeCorrection = async (run: 'first' | 'second') => new AsyncFunction('figma', emitBridgeApplyScript(correctionValidation.value, correctionPlan, run))(figma);
const correctionFirst = normalizeBridgeApplyEnvelope(await executeCorrection('first'), correctionValidation.value, correctionPlan, 'first');
const correctionFirstGate = validateLiveApplyReceipt(correctionFirst, correctionValidation.value, correctionPlan, 'first');
if (!correctionFirstGate.ok || correctionFirst.operations.some((operation) => operation.createdNodeIds.length > 0)) {
  throw new Error(`existing component-set correction failed: ${correctionFirstGate.ok ? 'unexpected create' : correctionFirstGate.issues.join(', ')}`);
}
const correctedWidths = Object.fromEntries(set.children.map((member: any) => [member.name, member.width]));
if (set.layoutMode !== 'NONE' || correctedWidths['Presentation=Compact'] !== 390 || correctedWidths['Presentation=Desktop'] !== 1200 || correctedWidths['Presentation=Wide'] !== 1728) {
  throw new Error('existing component-set correction did not restore explicit authoring previews');
}
const correctionSecond = normalizeBridgeApplyEnvelope(await executeCorrection('second'), correctionValidation.value, correctionPlan, 'second');
const correctionSecondGate = validateLiveApplyReceipt(correctionSecond, correctionValidation.value, correctionPlan, 'second');
if (!correctionSecondGate.ok || correctionSecond.operations.some((operation) => operation.status !== 'no-op')) {
  throw new Error(`existing component-set correction was not no-op: ${correctionSecondGate.ok ? 'operation status' : correctionSecondGate.issues.join(', ')}`);
}

const topologyTree = (defaultValue: string) => ({
  id: '9:10', type: 'COMPONENT_SET', name: 'Card',
  componentPropertyDefinitions: { Presentation: { type: 'VARIANT', defaultValue, variantOptions: ['Wide', 'Compact', 'Desktop'] } },
  children: [
    { id: '1:1', type: 'COMPONENT', name: 'Presentation=Wide', children: [] },
    { id: '9:11', type: 'COMPONENT', name: 'Presentation=Compact', children: [] },
    { id: '9:12', type: 'COMPONENT', name: 'Presentation=Desktop', children: [] },
  ],
});
const beforeDefaultCorrection = collectSurfaceFacts(topologyTree('Compact'));
const afterDefaultCorrection = collectSurfaceFacts(topologyTree('Wide'));
if (compareResponsiveTransitionProtectedFacts(beforeDefaultCorrection, afterDefaultCorrection, ['component-set-topology'], correctionValidation.value.targets[0].responsive).length !== 0) {
  throw new Error('declared existing-set default correction was not semantically normalized');
}
const wrongDefaultCorrection = collectSurfaceFacts(topologyTree('Desktop'));
if (compareResponsiveTransitionProtectedFacts(beforeDefaultCorrection, wrongDefaultCorrection, ['component-set-topology'], correctionValidation.value.targets[0].responsive).length !== 1) {
  throw new Error('undeclared existing-set default correction escaped the topology gate');
}

console.log('✔ responsive component set preserves identity, separates authoring previews from FILL instances, and repairs existing topology idempotently');
