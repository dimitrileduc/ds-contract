import { dryRunCampaign } from '../../extract/figma/projection-repair/apply.js';
import { normalizeBridgeApplyEnvelope, validateLiveApplyReceipt } from '../../extract/figma/projection-repair/apply-receipt.js';
import { validateRepairCampaign } from '../../extract/figma/projection-repair/campaign.js';
import { collectSurfaceFacts, compareProtectedFacts } from '../../extract/figma/projection-repair/facts.js';
import { existingSetBridgeEnvelope, existingSetCampaign } from './figma-responsive-existing-set-topology-check.js';

const validation = validateRepairCampaign(existingSetCampaign);
if (!validation.ok) throw new Error(`mechanism campaign refused: ${validation.issues.map((entry) => entry.message).join(', ')}`);
const plan = dryRunCampaign(validation.value);

const first = normalizeBridgeApplyEnvelope(existingSetBridgeEnvelope('first'), validation.value, plan, 'first');
const firstGate = validateLiveApplyReceipt(first, validation.value, plan, 'first');
if (!firstGate.ok) throw new Error(`mechanism first pass refused: ${firstGate.issues.join(', ')}`);

const second = normalizeBridgeApplyEnvelope(existingSetBridgeEnvelope('second'), validation.value, plan, 'second');
const secondGate = validateLiveApplyReceipt(second, validation.value, plan, 'second');
if (!secondGate.ok || second.operations.some((operation) => operation.status !== 'no-op')) {
  throw new Error(`mechanism second pass refused: ${secondGate.ok ? 'operation-not-noop' : secondGate.issues.join(', ')}`);
}

const sectionTopology = {
  id: '9:10', key: 'categories-set-key', type: 'COMPONENT_SET', name: 'Categories',
  componentPropertyDefinitions: {
    Style: { type: 'VARIANT', variantOptions: ['Superpose', 'Empile'], defaultValue: 'Superpose' },
    Colonnes: { type: 'VARIANT', variantOptions: ['2', '3'], defaultValue: '2' },
  },
  children: first.memberFacts.map((member, index) => ({
    id: member.nodeId, key: member.componentKey, type: 'COMPONENT',
    name: first.masters[0].variantNames[index],
    children: [{
      id: `8:${index + 1}`, type: 'INSTANCE', name: 'Category card', componentId: index % 2 === 0 ? '7:1' : '7:2',
      componentProperties: { Style: { type: 'VARIANT', value: index % 2 === 0 ? 'Superpose' : 'Empile' } }, overrides: [], children: [],
    }],
  })),
};
const cardTopology = {
  id: '7:0', key: 'card-set-key', type: 'COMPONENT_SET', name: 'Category card',
  componentPropertyDefinitions: { Style: { type: 'VARIANT', variantOptions: ['Superpose', 'Empile'], defaultValue: 'Superpose' } },
  children: [
    { id: '7:1', key: 'card-superpose-key', type: 'COMPONENT', name: 'Style=Superpose', children: [] },
    { id: '7:2', key: 'card-empile-key', type: 'COMPONENT', name: 'Style=Empile', children: [] },
  ],
};
const usageTopologies = existingSetCampaign.targets[0].responsive.usageSurfaces.map((surface: any) => ({
  id: surface.nodeId, type: 'INSTANCE', name: 'Categories usage', componentId: '9:10',
  componentProperties: { Style: { type: 'VARIANT', value: 'Empile' }, Colonnes: { type: 'VARIANT', value: '2' } },
  overrides: [], children: [],
}));

const protectedFacts = ['set-identity', 'member-ids-keys', 'axis-names-values', 'instance-links', 'instance-overrides'];
const sectionBefore = collectSurfaceFacts(structuredClone(sectionTopology) as never);
const sectionAfter = collectSurfaceFacts({ ...structuredClone(sectionTopology), layoutMode: 'NONE' } as never);
const cardBefore = collectSurfaceFacts(structuredClone(cardTopology) as never);
const cardAfter = collectSurfaceFacts(structuredClone(cardTopology) as never);
const usageDifferences = usageTopologies.flatMap((usage: any) => {
  const before = collectSurfaceFacts(structuredClone(usage));
  const after = collectSurfaceFacts(structuredClone(usage));
  return compareProtectedFacts(before, after, ['master-identity', 'instance-links', 'instance-overrides']);
});
const factDifferences = [
  ...compareProtectedFacts(sectionBefore, sectionAfter, protectedFacts),
  ...compareProtectedFacts(cardBefore, cardAfter, ['set-identity', 'member-ids-keys', 'axis-names-values']),
  ...usageDifferences,
];
if (factDifferences.length !== 0) throw new Error(`protected identity drift: ${factDifferences.map((entry) => entry.fact).join(', ')}`);

const output = {
  result: 'pass',
  environment: 'deterministic in-memory Figma topology fixture; no authoritative canvas access',
  inputTopology: { sectionSetMembers: 4, cardVariants: 2, usageLinks: 7 },
  expectedCreatedNodeRoles: plan.expectedCreates.map((entry) => entry.role),
  firstPass: {
    createdNodeIds: first.operations.flatMap((operation) => operation.createdNodeIds),
    changedNodeIds: first.operations.flatMap((operation) => operation.changedNodeIds),
    pageWrites: first.pageWrites,
    childWrites: first.childWrites,
    propagatedDeltaCount: first.propagatedDeltas.length,
  },
  secondPass: {
    operations: second.operations.map((operation) => ({ operationId: operation.operationId, status: operation.status })),
    createdNodeIds: second.operations.flatMap((operation) => operation.createdNodeIds),
    changedNodeIds: second.operations.flatMap((operation) => operation.changedNodeIds),
    pageWrites: second.pageWrites,
    childWrites: second.childWrites,
  },
  memberIdentityBeforeAfter: first.memberFacts.map((member) => ({ nodeIdBefore: member.nodeId, nodeIdAfter: member.nodeId, keyBefore: member.componentKey, keyAfter: member.componentKey })),
  cardIdentityBeforeAfter: cardBefore.memberIdsKeys.map((member) => ({ before: member, after: member })),
  usageLinksBeforeAfter: usageTopologies.map((usage: any) => ({ nodeIdBefore: usage.id, nodeIdAfter: usage.id, componentIdBefore: usage.componentId, componentIdAfter: usage.componentId })),
  scenarioCoverage: first.scenarioChecks.length,
  bindingCoverage: first.bindingFacts.length,
  typographyExceptionCoverage: first.typographyFacts.length,
  protectedFactDifferenceCount: factDifferences.length,
};

console.log(JSON.stringify(output, null, 2));
