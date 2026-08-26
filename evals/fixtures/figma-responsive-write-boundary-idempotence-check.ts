import { dryRunCampaign } from '../../extract/figma/projection-repair/apply.js';
import { normalizeBridgeApplyEnvelope, validateLiveApplyReceipt } from '../../extract/figma/projection-repair/apply-receipt.js';
import { validateRepairCampaign } from '../../extract/figma/projection-repair/campaign.js';
import { compareReconstructionIdempotence } from '../../extract/figma/projection-repair/verify.js';
import { bridgeEnvelope, responsiveCampaign } from './figma-responsive-fixture.js';

const clone = <T>(value: T): T => structuredClone(value);
const validation = validateRepairCampaign(responsiveCampaign);
if (!validation.ok) throw new Error('valid boundary campaign refused');
const plan = dryRunCampaign(validation.value);

const pageWriteCampaign = clone(responsiveCampaign) as any;
pageWriteCampaign.allowedOperations[0].nodeId = '2:1';
const pageWrite = validateRepairCampaign(pageWriteCampaign);
if (pageWrite.ok || !pageWrite.issues.some((issue) => issue.message.includes('page-write-forbidden'))) {
  throw new Error('page-write-forbidden was not reported');
}

const childWriteCampaign = clone(responsiveCampaign) as any;
childWriteCampaign.allowedOperations[0].nodeId = '1:2';
const childWrite = validateRepairCampaign(childWriteCampaign);
if (childWrite.ok || !childWrite.issues.some((issue) => issue.message.includes('shared-child-write-forbidden'))) {
  throw new Error('shared-child-write-forbidden was not reported');
}

const second = normalizeBridgeApplyEnvelope(bridgeEnvelope('second'), validation.value, plan, 'second');
if (!validateLiveApplyReceipt(second, validation.value, plan, 'second').ok) throw new Error('strict second no-op was refused');

const mutatingSecond = bridgeEnvelope('second');
mutatingSecond.scriptResults[0].result = {
  applied: true,
  createdNodeIds: [],
  createdNodes: [],
  changedNodeIds: ['1:1'],
} as never;
const normalizedMutation = normalizeBridgeApplyEnvelope(mutatingSecond, validation.value, plan, 'second');
const mutation = validateLiveApplyReceipt(normalizedMutation, validation.value, plan, 'second');
if (mutation.ok || !mutation.issues.some((issue) => issue.includes('second-pass-not-noop'))) {
  throw new Error('second-pass-not-noop was not reported');
}

const pageReceipt = bridgeEnvelope('first');
pageReceipt.inspection.pageWrites = ['2:1'];
let receiptRefused = false;
try {
  const normalized = normalizeBridgeApplyEnvelope(pageReceipt, validation.value, plan, 'first');
  receiptRefused = !validateLiveApplyReceipt(normalized, validation.value, plan, 'first').ok;
} catch { receiptRefused = true; }
if (!receiptRefused) throw new Error('Page mutation escaped receipt validation');

const undeclaredExistingMutation = bridgeEnvelope('first');
undeclaredExistingMutation.scriptResults[0].result.changedNodeIds.push('9:99');
const normalizedUndeclaredMutation = normalizeBridgeApplyEnvelope(undeclaredExistingMutation, validation.value, plan, 'first');
const undeclaredMutation = validateLiveApplyReceipt(normalizedUndeclaredMutation, validation.value, plan, 'first');
if (undeclaredMutation.ok || !undeclaredMutation.issues.some((issue) => issue.includes('responsive-operation-not-allowlisted'))) {
  throw new Error('an undeclared existing-node mutation escaped receipt validation');
}

const underreportedHostMutation = bridgeEnvelope('first');
underreportedHostMutation.scriptResults[0].result.changedNodeIds = ['1:1'];
const normalizedUnderreportedHost = normalizeBridgeApplyEnvelope(underreportedHostMutation, validation.value, plan, 'first');
const underreportedHost = validateLiveApplyReceipt(normalizedUnderreportedHost, validation.value, plan, 'first');
if (underreportedHost.ok || !underreportedHost.issues.some((issue) => issue.includes('responsive-operation-not-allowlisted'))) {
  throw new Error('the component-set host mutation was allowed to stay hidden');
}

const phaseReportCapture = (phase: 'after' | 'idempotence') => ({
  captureSetId: `capture-${phase}`, phase, fileVersionId: 'version-1', complete: true,
  artifacts: [{
    artifactId: `hero:master:presentation-scenarios:${phase}`,
    surfaceId: 'hero:master', kind: 'report', path: `${phase}/presentation-scenarios.json`,
    sha256: 'same-report', width: null, height: null, byteLength: 42, status: 'valid',
  }],
  imageFingerprints: [], instanceLinks: [],
} as any);
const phaseOnlyReportDifference = compareReconstructionIdempotence(
  { capture: phaseReportCapture('after'), applyReceipt: { operations: [] } },
  { capture: phaseReportCapture('idempotence'), applyReceipt: { operations: [] } },
);
if (!phaseOnlyReportDifference.ok) throw new Error('phase-qualified report id produced false idempotence drift');

console.log('✔ responsive write boundary refuses Page/shared-child writes and requires a genuinely no-op second pass');
