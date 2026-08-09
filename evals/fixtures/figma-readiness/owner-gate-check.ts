import { appendDecision, decisionsFor } from '../../../extract/figma/organism-audit/readiness/owner-decisions.js';
import { referenceGate, postRepairGate } from '../../../extract/figma/organism-audit/readiness/gates.js';
import { decision, dossier, expectThrows } from './helpers.js';
import { validateOwnerDecision } from '../../../extract/figma/organism-audit/readiness/owner-decisions.js';

const first = decision('hero');
const final = decision('hero', 'post-repair', 'repair-accepted');
const log = appendDecision(appendDecision([], first), final);
if (decisionsFor(log, 'hero', 'reference').length !== 1 || !referenceGate(dossier('hero'), log).allowed || !postRepairGate(dossier('hero'), log).allowed) throw new Error('valid distinct owner gates were not resolved');
expectThrows(() => appendDecision(log, first), 'overwritten owner decision');
for (const outcome of ['reference-validated', 'voluntary-evolution', 'accepted-defect', 'out-of-contract', 'more-evidence-required', 'no-reference-recoverable'] as const) {
  if (validateOwnerDecision(decision('hero', 'reference', outcome)).decision !== outcome) throw new Error(`reference outcome was not schema validated: ${outcome}`);
}
for (const outcome of ['repair-accepted', 'repair-refused'] as const) {
  if (validateOwnerDecision(decision('hero', 'post-repair', outcome)).decision !== outcome) throw new Error(`post-repair outcome was not schema validated: ${outcome}`);
}
console.log('✔ owner decisions append immutably and reference/post-repair gates stay distinct');
