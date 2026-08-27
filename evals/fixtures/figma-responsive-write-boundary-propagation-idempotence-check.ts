import { dryRunCampaign } from '../../extract/figma/projection-repair/apply.js';
import { normalizeBridgeApplyEnvelope, validateLiveApplyReceipt } from '../../extract/figma/projection-repair/apply-receipt.js';
import { validateRepairCampaign } from '../../extract/figma/projection-repair/campaign.js';
import { existingSetBridgeEnvelope, existingSetCampaign } from './figma-responsive-existing-set-topology-check.js';

const validation = validateRepairCampaign(existingSetCampaign);
if (!validation.ok) throw new Error(`valid two-run campaign refused: ${validation.issues.map((entry) => entry.message).join(', ')}`);
const plan = dryRunCampaign(validation.value);

const hiddenCreate = existingSetBridgeEnvelope('first');
hiddenCreate.scriptResults[0].result.createdNodeIds = ['9:99'];
hiddenCreate.scriptResults[0].result.createdNodes = [{ nodeId: '9:99', role: 'hidden-member', declaredName: 'Style=Ghost, Colonnes=4' }];
const hiddenCreateReceipt = normalizeBridgeApplyEnvelope(hiddenCreate, validation.value, plan, 'first');
const hiddenCreateGate = validateLiveApplyReceipt(hiddenCreateReceipt, validation.value, plan, 'first');
if (hiddenCreateGate.ok || !hiddenCreateGate.issues.some((entry) => entry.includes('unexpected-created-node'))) {
  throw new Error('unexpected-created-node was not reported for a hidden existing-set member');
}

const childWrite = existingSetBridgeEnvelope('first');
childWrite.inspection.childWrites = ['3:1'];
const childWriteReceipt = normalizeBridgeApplyEnvelope(childWrite, validation.value, plan, 'first');
const childWriteGate = validateLiveApplyReceipt(childWriteReceipt, validation.value, plan, 'first');
if (childWriteGate.ok || !childWriteGate.issues.some((entry) => entry.includes('child-writes'))) {
  throw new Error('shared-child-write-forbidden was not enforced for the section run');
}

const unattributed = existingSetBridgeEnvelope('first');
unattributed.inspection.propagatedDeltas[0].status = 'unattributed';
const unattributedReceipt = normalizeBridgeApplyEnvelope(unattributed, validation.value, plan, 'first');
const unattributedGate = validateLiveApplyReceipt(unattributedReceipt, validation.value, plan, 'first');
if (unattributedGate.ok || !unattributedGate.issues.some((entry) => entry.includes('propagated-delta-unattributed'))) {
  throw new Error('an unattributed propagated delta escaped receipt validation');
}

const mutatingSecond = existingSetBridgeEnvelope('second');
mutatingSecond.scriptResults[0].result = { applied: true, createdNodeIds: [], createdNodes: [], changedNodeIds: ['9:10'] };
const secondReceipt = normalizeBridgeApplyEnvelope(mutatingSecond, validation.value, plan, 'second');
const secondGate = validateLiveApplyReceipt(secondReceipt, validation.value, plan, 'second');
if (secondGate.ok || !secondGate.issues.some((entry) => entry.includes('second-pass-not-noop'))) {
  throw new Error('second-pass-not-noop was not enforced across the two-run context');
}

console.log('✔ existing-set creates, shared children, propagated deltas and two-run idempotence fail closed');
