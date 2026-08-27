/**
 * 030 US2 — the campaign driver, and the dress rehearsal FR-011 asks for.
 *
 * Two halves, because the driver has two kinds of claim:
 *
 *  A. THE DRIVER'S OWN CONTRACT — order, journal, stop at the first refusal quoting it
 *     verbatim, resume without replaying green steps, `--until`, and the property those
 *     three combine into: a write is never reached before a green dry-run. None of that
 *     needs a canvas to be wrong, so the runner is injected and the fixture measures
 *     sequencing alone. The driver implements NO gate (research R4): every refusal below
 *     is the runner's, passed through untouched.
 *
 *  B. FR-011 — « créations déclarées dans un set existant », the branch 029 BUILT and
 *     never ran: run-002 short-circuited it with manual bridge gestures, so it has no
 *     live receipt and no automated no-op (RAPPORT-CLOTURE §4.2). Twelve sections are
 *     about to depend on it. Here it is driven through the real receipt gates with
 *     `expectedCreates > 0`, in an existing multi-axis set — declared creates accepted,
 *     an undeclared one refused by name, second pass a strict no-op.
 */
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { driveSteps, greenActions, runDrive, campaignPaths } from '../../../scripts/component-repair-drive.mjs';
import { dryRunCampaign } from '../../../extract/figma/projection-repair/apply.js';
import { normalizeBridgeApplyEnvelope, validateLiveApplyReceipt } from '../../../extract/figma/projection-repair/apply-receipt.js';
import { validateRepairCampaign } from '../../../extract/figma/projection-repair/campaign.js';
import { existingSetBridgeEnvelope, existingSetCampaign } from '../figma-responsive-existing-set-topology-check.js';

const clone = <T>(value: T): T => structuredClone(value);

/* ════════════════════════════════ A. the driver's own contract ═════════════ */

const campaign = JSON.parse(JSON.stringify(existingSetCampaign));
const CAMPAIGN_PATH = 'specs/component-repairs/fixture/run-001/campaign.json';
const scratch = mkdtempSync(path.join(tmpdir(), 'drive-'));
const journalPath = path.join(scratch, 'drive-journal.jsonl');

let tick = 0;
const now = () => `2026-08-27T09:${String(tick++).padStart(2, '0')}:00.000Z`;

const chain = driveSteps({
  campaignPath: CAMPAIGN_PATH,
  paths: campaignPaths(campaign),
  fileKey: campaign.filePin.fileKey,
  captureMode: 'light',
});

// The order is the workflow document's, not one this script invents.
const ORDER = [
  'audit', 'preflight', 'capture-before', 'dry-run',
  'emit-bridge-script-first', 'bridge-first', 'normalize-apply-first', 'record-apply-first',
  'capture-after', 'verify',
  'emit-bridge-script-second', 'bridge-second', 'normalize-apply-second', 'record-apply-second',
  'capture-idempotence', 'verify-idempotence', 'finalize',
];
const observed = chain.map((step: { action: string }) => step.action);
if (JSON.stringify(observed) !== JSON.stringify(ORDER)) {
  throw new Error(`the chain does not follow the mandatory order:\n  expected ${ORDER.join(' → ')}\n  got      ${observed.join(' → ')}`);
}
// The mode is carried into every capture, never re-decided per step.
for (const action of ['capture-before', 'capture-after', 'capture-idempotence']) {
  const step = chain.find((entry: { action: string }) => entry.action === action);
  if (!JSON.stringify(step.command).includes('"--capture-mode","light"')) {
    throw new Error(`${action} did not carry the run's capture mode`);
  }
}
// Every write step really does invoke the runner or the bridge, never a local shortcut.
for (const step of chain) {
  const [bin] = step.command;
  if (!['npm', 'node'].includes(bin)) throw new Error(`step ${step.action} invokes ${bin} instead of the runner or the bridge transport`);
}

/** A scripted runner. `refuseAt` names the step that fails and the exact text it prints. */
function scriptedExec(refuseAt?: string, refusalText = '') {
  const calls: string[] = [];
  return {
    calls,
    exec: ({ action }: { action: string }) => {
      calls.push(action);
      if (action === refuseAt) return { status: 2, output: refusalText };
      return { status: 0, output: `${action} ok` };
    },
  };
}

/* ---- the whole chain runs, in order, and the journal has one line per step ---- */
const complete = scriptedExec();
const green = runDrive({
  campaignPath: CAMPAIGN_PATH, campaign, fileKey: campaign.filePin.fileKey,
  captureMode: 'light', journalPath, exec: complete.exec, now,
});
if (green.code !== 0) throw new Error(`a chain with no refusal exited ${green.code}`);
if (JSON.stringify(complete.calls) !== JSON.stringify(ORDER)) {
  throw new Error(`steps were not executed in chain order: ${complete.calls.join(' → ')}`);
}
const journalLines = readFileSync(journalPath, 'utf8').trim().split('\n').map((line) => JSON.parse(line));
if (journalLines.length !== ORDER.length) throw new Error(`journal holds ${journalLines.length} lines for ${ORDER.length} steps`);
for (const [index, entry] of journalLines.entries()) {
  if (entry.action !== ORDER[index] || entry.verdict !== 'green' || entry.step !== index + 1) {
    throw new Error(`journal line ${index} is not the green record of ${ORDER[index]}: ${JSON.stringify(entry)}`);
  }
  if (typeof entry.startedAt !== 'string' || typeof entry.endedAt !== 'string') {
    throw new Error(`journal line ${index} does not carry its interval`);
  }
}

/* ------------------- it stops at the FIRST refusal, quoting it verbatim ------ */
const REFUSAL = 'projection:repair refused — inherited-size-lock: 2115:4273.minWidth=744 (hérité de 2115:4270) — corriger à la source ou déclarer une dérogation référencée';
const stopped = scriptedExec('preflight', REFUSAL);
const refused = runDrive({
  campaignPath: CAMPAIGN_PATH, campaign, fileKey: campaign.filePin.fileKey,
  journalPath: path.join(scratch, 'refused.jsonl'), exec: stopped.exec, now,
});
if (refused.code !== 2) throw new Error(`a refused chain exited ${refused.code}, expected 2`);
if (stopped.calls.length !== 2 || stopped.calls[1] !== 'preflight') {
  throw new Error(`the chain did not stop at the refusing step: ${stopped.calls.join(' → ')}`);
}
if (refused.refusal !== REFUSAL) throw new Error(`the refusal was reworded:\n  runner: ${REFUSAL}\n  driver: ${refused.refusal}`);
const refusedJournal = readFileSync(path.join(scratch, 'refused.jsonl'), 'utf8').trim().split('\n').map((line) => JSON.parse(line));
if (refusedJournal.at(-1).verdict !== 'refused' || refusedJournal.at(-1).refusal !== REFUSAL) {
  throw new Error('the journal did not record the refusal verbatim');
}

/* --------------------------- --resume replays nothing that was green -------- */
const resumeJournal = path.join(scratch, 'resume.jsonl');
const partial = scriptedExec('verify', 'projection:repair refused — comparison contains an unexpected diff');
const firstPass = runDrive({
  campaignPath: CAMPAIGN_PATH, campaign, fileKey: campaign.filePin.fileKey,
  journalPath: resumeJournal, exec: partial.exec, now,
});
if (firstPass.code !== 2 || partial.calls.at(-1) !== 'verify') throw new Error('the interrupted run did not stop at verify');

const resumed = scriptedExec();
const secondPass = runDrive({
  campaignPath: CAMPAIGN_PATH, campaign, fileKey: campaign.filePin.fileKey,
  journalPath: resumeJournal, resume: true, exec: resumed.exec, now,
});
if (secondPass.code !== 0) throw new Error(`the resumed run exited ${secondPass.code}`);
const replayed = resumed.calls.filter((action) => ORDER.indexOf(action) < ORDER.indexOf('verify'));
if (replayed.length !== 0) throw new Error(`--resume replayed steps that were already green: ${replayed.join(', ')}`);
if (resumed.calls[0] !== 'verify') throw new Error(`--resume restarted at ${resumed.calls[0]} instead of the first non-green step`);
const resumedEntries = secondPass.entries.filter((entry: { verdict: string }) => entry.verdict === 'skipped-already-green');
if (resumedEntries.length !== ORDER.indexOf('verify')) {
  throw new Error(`the resumed journal marked ${resumedEntries.length} steps already-green, expected ${ORDER.indexOf('verify')}`);
}
// The journal is a TRACE, not an authority: reading it back must give the same answer.
if (greenActions(readFileSync(resumeJournal, 'utf8')).size !== ORDER.length) {
  throw new Error('after the resumed run the journal does not report the whole chain green');
}

/* ----------- the dry-run gates every write, and a refusal stops the chain ---- */
// A DRY-RUN THAT REFUSES STOPS THE CHAIN BEFORE ANY WRITE.
//
// Said precisely, because the precision is the point: the invariant is not carried by
// the driver's explicit guard — that branch is an unreachable backstop and the driver
// says so. It is carried by two properties this fixture DOES exercise: the chain puts
// `dry-run` before every write, and the loop returns at the first refusal. Testing the
// backstop instead of the two properties would be testing dead code and calling it a
// guarantee.
const refusedPlanCalls: string[] = [];
const refusedPlan = runDrive({
  campaignPath: CAMPAIGN_PATH, campaign, fileKey: campaign.filePin.fileKey,
  journalPath: path.join(scratch, 'refused-plan.jsonl'),
  exec: ({ action }: { action: string }) => {
    refusedPlanCalls.push(action);
    return action === 'dry-run'
      ? { status: 2, output: 'projection:repair refused — dry-run requires a complete before capture and ready-to-apply state' }
      : { status: 0, output: '' };
  },
  now,
});
if (refusedPlan.code !== 2) throw new Error('a chain whose dry-run refuses did not exit 2');
for (const write of ['bridge-first', 'normalize-apply-first', 'record-apply-first', 'bridge-second', 'finalize']) {
  if (refusedPlanCalls.includes(write)) throw new Error(`${write} ran despite a refused dry-run`);
}
// Same on a RESUME: a journal that stops mid-chain must still put the dry-run back in
// front of the writes rather than restarting wherever it happens to have stopped.
const forged = path.join(scratch, 'forged.jsonl');
writeFileSync(forged, [
  { step: 1, action: 'audit', verdict: 'green' },
  { step: 2, action: 'preflight', verdict: 'green' },
  { step: 3, action: 'capture-before', verdict: 'green' },
  { step: 5, action: 'emit-bridge-script-first', verdict: 'refused', refusal: 'x' },
].map((entry) => JSON.stringify({ ...entry, startedAt: now(), endedAt: now() })).join('\n'));
const forgedCalls: string[] = [];
const forgedResult = runDrive({
  campaignPath: CAMPAIGN_PATH, campaign, fileKey: campaign.filePin.fileKey,
  journalPath: forged, resume: true,
  exec: ({ action }: { action: string }) => { forgedCalls.push(action); return { status: 0, output: '' }; },
  now,
});
if (!forgedCalls.includes('dry-run')) throw new Error('a resume skipped the dry-run entirely');
if (forgedCalls.indexOf('dry-run') > forgedCalls.indexOf('bridge-first')) {
  throw new Error('a resume reached the bridge write before its dry-run');
}
if (forgedResult.code !== 0) throw new Error(`the repaired resume exited ${forgedResult.code}`);

/* --------------------------------- --until stops where it is told ----------- */
const bounded = scriptedExec();
const untilResult = runDrive({
  campaignPath: CAMPAIGN_PATH, campaign, fileKey: campaign.filePin.fileKey,
  journalPath: path.join(scratch, 'until.jsonl'), until: 'dry-run', exec: bounded.exec, now,
});
if (untilResult.code !== 0) throw new Error(`--until dry-run exited ${untilResult.code}`);
if (bounded.calls.at(-1) !== 'dry-run' || bounded.calls.includes('bridge-first')) {
  throw new Error(`--until dry-run did not stop the chain: ${bounded.calls.join(' → ')}`);
}
const unknownUntil = runDrive({
  campaignPath: CAMPAIGN_PATH, campaign, fileKey: campaign.filePin.fileKey,
  until: 'poser-la-section', exec: scriptedExec().exec, now,
});
if (unknownUntil.code !== 2 || !String(unknownUntil.refusal).startsWith('drive-unknown-action')) {
  throw new Error('an --until naming no step of the chain was accepted');
}

/* ═══════════════ B. FR-011 — declared creates in an EXISTING set ════════════ */

// The 029 four-member set gains a fifth member the campaign DECLARES. Nothing about
// this shape is hypothetical: it is what every section of the wave will do when it
// gains its Presentation axis.
const CREATED_NAME = 'Style=Superpose, Colonnes=4';
const CREATED_PRESENTATION = 'Superpose-4';
const CREATED_NODE_ID = '9:99';
const CREATED_KEY = 'created-superpose-4-key';

const creating = clone(existingSetCampaign) as any;
const topology = creating.targets[0].responsive.componentSetTopology;
topology.variantProperties.Colonnes = ['2', '3', '4'];
topology.createdMembers = [{
  presentationValue: CREATED_PRESENTATION,
  variantSelection: { Style: 'Superpose', Colonnes: '4' },
  declaredName: CREATED_NAME,
  sourcePresentationValue: 'Superpose-2',
  authoringPreviewWidth: 1728,
}];
topology.expectedMemberNames = [...topology.expectedMemberNames, CREATED_NAME];
topology.authoringLayout.order = [...topology.authoringLayout.order, CREATED_PRESENTATION];
creating.targets[0].expectedVariantNames = [...creating.targets[0].expectedVariantNames, CREATED_NAME];
creating.targets[0].responsive.expectedCreates = [{
  role: 'responsive-member', operationId: 'adapt-existing-set', count: 1,
  declaredName: CREATED_NAME, presentationValue: CREATED_PRESENTATION,
}];
creating.targets[0].responsive.presentationLayouts = [...creating.targets[0].responsive.presentationLayouts, {
  presentationValue: CREATED_PRESENTATION,
  variantSelection: { Style: 'Superpose', Colonnes: '4' },
  nodePath: '',
  properties: { layoutMode: 'VERTICAL', layoutWrap: 'WRAP', layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'HUG', clipsContent: false },
}];
creating.targets[0].responsive.presentationScenarios = [...creating.targets[0].responsive.presentationScenarios, {
  scenarioId: '1440-superpose-4-normal', presentationValue: CREATED_PRESENTATION,
  variantSelection: { Style: 'Superpose', Colonnes: '4' },
  width: 1440, height: 900, fixtureId: 'normal', expectedOverflow: false, expectedCardsPerRow: 4,
}];
creating.writeBoundary.allowedCreateRoles = ['responsive-member'];

const creatingValidation = validateRepairCampaign(creating);
if (!creatingValidation.ok) {
  throw new Error(`a declared create in an existing set was refused by the manifest gate: ${creatingValidation.issues.map((entry) => `${entry.code}@${entry.path}: ${entry.message}`).join(' | ')}`);
}
const creatingPlan = dryRunCampaign(creatingValidation.value);
if (creatingPlan.expectedCreates.length !== 1 || creatingPlan.expectedCreates[0].declaredName !== CREATED_NAME) {
  throw new Error(`the dry-run did not carry the declared create: ${JSON.stringify(creatingPlan.expectedCreates)}`);
}

/** The bridge envelope a truthful first run reports: the fifth member exists now, so
 *  it has a node id and a key, and it is reported as CREATED, not as changed. */
function creatingEnvelope(run: 'first' | 'second', overrides: (envelope: any) => void = () => {}): any {
  const envelope = clone(existingSetBridgeEnvelope(run)) as any;
  const master = envelope.inspection.masters[0];
  master.variantProperties = { Style: ['Superpose', 'Empile'], Colonnes: ['2', '3', '4'] };
  master.variantNames = [...master.variantNames, CREATED_NAME];
  master.memberIdentities = [...master.memberIdentities, {
    nodeId: CREATED_NODE_ID, componentKey: CREATED_KEY, variantSelection: { Style: 'Superpose', Colonnes: '4' },
  }];
  envelope.inspection.memberFacts = [...envelope.inspection.memberFacts, {
    targetId: 'responsive-component', presentationValue: CREATED_PRESENTATION,
    variantSelection: { Style: 'Superpose', Colonnes: '4' },
    nodeId: CREATED_NODE_ID, componentKey: CREATED_KEY,
    authoringPreview: { width: 1728, layoutSizingHorizontal: 'FIXED' },
    namesAndRoles: [{ structuralPath: '', type: 'COMPONENT', name: CREATED_NAME }],
    media: [], texts: [], componentProperties: [], sharedChildren: [],
  }];
  envelope.inspection.scenarioChecks = [...envelope.inspection.scenarioChecks, {
    scenarioId: '1440-superpose-4-normal', selectedPresentation: CREATED_PRESENTATION,
    selectedVariantSelection: { Style: 'Superpose', Colonnes: '4' },
    width: 1440, height: 900, fixtureId: 'normal',
    rootBounds: { x: 0, y: 0, width: 1440, height: 900 },
    descendantBounds: [{ nodeId: '9:20', x: 0, y: 0, width: 1440, height: 100 }],
    overflow: false, clippedBy: [], contentAccessible: true, posterCoverage: 'cover',
    cardsPerRow: 4, captureRef: 'proofs/1440-superpose-4-normal.png',
  }];
  if (run === 'first') {
    envelope.scriptResults[0].result.createdNodeIds = [CREATED_NODE_ID];
    envelope.scriptResults[0].result.createdNodes = [{
      nodeId: CREATED_NODE_ID, role: 'responsive-member', declaredName: CREATED_NAME, presentationValue: CREATED_PRESENTATION,
    }];
  }
  overrides(envelope);
  return envelope;
}

const createFirst = normalizeBridgeApplyEnvelope(creatingEnvelope('first'), creatingValidation.value, creatingPlan, 'first');
const createFirstGate = validateLiveApplyReceipt(createFirst, creatingValidation.value, creatingPlan, 'first');
if (!createFirstGate.ok) {
  throw new Error(`FR-011: a truthful declared create in an existing set was refused — ${createFirstGate.issues.join(', ')}`);
}
if (createFirst.operations.flatMap((operation) => operation.createdNodeIds).length !== 1) {
  throw new Error('the receipt lost the declared create');
}

// An UNDECLARED create is still refused by name. This is the gate the wave leans on.
const undeclared = normalizeBridgeApplyEnvelope(
  creatingEnvelope('first', (envelope) => {
    envelope.scriptResults[0].result.createdNodeIds = [CREATED_NODE_ID, '9:98'];
    envelope.scriptResults[0].result.createdNodes = [
      ...envelope.scriptResults[0].result.createdNodes,
      { nodeId: '9:98', role: 'responsive-member', declaredName: 'Style=Empile, Colonnes=4', presentationValue: 'Empile-4' },
    ];
  }),
  creatingValidation.value, creatingPlan, 'first',
);
const undeclaredGate = validateLiveApplyReceipt(undeclared, creatingValidation.value, creatingPlan, 'first');
if (undeclaredGate.ok || !undeclaredGate.issues.some((issue) => issue.startsWith('unexpected-created-node'))) {
  throw new Error(`an undeclared created node was accepted: ${undeclaredGate.issues.join(', ') || '(no issue)'}`);
}

// A create that goes MISSING is refused just as loudly — the gate is two-sided.
const missing = normalizeBridgeApplyEnvelope(
  creatingEnvelope('first', (envelope) => {
    envelope.scriptResults[0].result.createdNodeIds = [];
    envelope.scriptResults[0].result.createdNodes = [];
  }),
  creatingValidation.value, creatingPlan, 'first',
);
const missingGate = validateLiveApplyReceipt(missing, creatingValidation.value, creatingPlan, 'first');
if (missingGate.ok || !missingGate.issues.some((issue) => issue.startsWith('unexpected-created-node'))) {
  throw new Error('a declared create that never happened was accepted');
}

// Second pass: a strict no-op. Creating the member twice is the failure this catches.
const createSecond = normalizeBridgeApplyEnvelope(creatingEnvelope('second'), creatingValidation.value, creatingPlan, 'second');
const createSecondGate = validateLiveApplyReceipt(createSecond, creatingValidation.value, creatingPlan, 'second');
if (!createSecondGate.ok) throw new Error(`FR-011 second pass refused: ${createSecondGate.issues.join(', ')}`);
if (createSecond.operations.some((operation) => operation.status !== 'no-op')) {
  throw new Error('the second pass over a created member was not a no-op');
}
const recreated = normalizeBridgeApplyEnvelope(
  creatingEnvelope('second', (envelope) => {
    envelope.scriptResults[0].result = {
      applied: true, createdNodeIds: ['9:97'],
      createdNodes: [{ nodeId: '9:97', role: 'responsive-member', declaredName: CREATED_NAME, presentationValue: CREATED_PRESENTATION }],
      changedNodeIds: [],
    };
  }),
  creatingValidation.value, creatingPlan, 'second',
);
const recreatedGate = validateLiveApplyReceipt(recreated, creatingValidation.value, creatingPlan, 'second');
if (recreatedGate.ok || !recreatedGate.issues.some((issue) => issue.startsWith('second-pass-not-noop'))) {
  throw new Error('a second pass that created the member AGAIN was accepted');
}

console.log(`✔ campaign driver: ${ORDER.length} steps in the workflow document's order, one journal line each, stop at the first refusal quoted verbatim, --until, --resume replaying none of the ${ORDER.indexOf('verify')} green steps, and no write reachable before a green dry-run (carried by the order + the stop, not by the backstop) — plus FR-011: a DECLARED create in an existing multi-axis set accepted through the real receipt gates, an undeclared one and a missing one both refused by unexpected-created-node, and the second pass a strict no-op`);
