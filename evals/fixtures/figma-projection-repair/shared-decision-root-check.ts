/**
 * 030 US2 / FR-001 — écart E8 of 029: two campaigns sharing one owner-decision
 * directory could not both finalize.
 *
 * `--finalize` reads EVERY `*.json` in `workflow.ownerDecisionRoot`. The selector
 * already ignored a file with no `targetId` (the H1/H2/H3 gate records). It did NOT
 * ignore a file whose `targetId` belonged to the OTHER campaign: that raised
 * `owner-decision`, so `carte-categorie` and `categories-principales` — which both
 * declare `specs/029-figma-responsive-categories/decisions` — blocked each other. 029
 * worked around it by moving a file out of the directory by hand. A wave of 12 sections
 * sharing one directory cannot do that twelve times.
 *
 * This fixture replays the REAL committed 029 artifacts, in place, with nothing moved.
 * What it must NOT do is weaken the gate: the three refusals that make a shared
 * directory safe are asserted right after.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { selectFinalOwnerDecisions } from '../../../extract/figma/projection-repair/campaign.js';

const ROOT = process.cwd();
const DECISION_ROOT = 'specs/029-figma-responsive-categories/decisions';
const CAMPAIGNS = [
  'specs/component-repairs/carte-categorie/run-001/campaign.json',
  'specs/component-repairs/categories-principales/run-001/campaign.json',
];

const readJson = (relative: string): unknown => JSON.parse(readFileSync(path.resolve(ROOT, relative), 'utf8'));

// Exactly what cli.ts `finalize` does: every *.json in the declared directory, sorted.
const entries = readdirSync(path.resolve(ROOT, DECISION_ROOT))
  .filter((name) => name.endsWith('.json'))
  .sort()
  .map((name) => ({ name, value: readJson(path.posix.join(DECISION_ROOT, name)) }));

if (entries.length < 4) throw new Error(`fixture setup: expected the 029 decision directory to carry the gate records and both H4 files, found ${entries.map((entry) => entry.name).join(', ')}`);

const targetless = entries.filter((entry) => !(entry.value as { targetId?: unknown }).targetId);
const targetBound = entries.filter((entry) => (entry.value as { targetId?: unknown }).targetId);
if (targetless.length === 0 || targetBound.length < 2) {
  throw new Error('fixture setup: the 029 directory must hold both targetless gate records and at least two target-bound closures — that is the shape E8 is about');
}

/* ------------------------------------------------- the two campaigns close */
const closed: string[] = [];
for (const campaignPath of CAMPAIGNS) {
  const campaign = readJson(campaignPath) as {
    workflow: { ownerDecisionRoot: string };
    targets: Array<{ targetId: string }>;
  };
  if (campaign.workflow.ownerDecisionRoot !== DECISION_ROOT) {
    throw new Error(`fixture setup: ${campaignPath} no longer declares the shared decision root (${campaign.workflow.ownerDecisionRoot})`);
  }
  const targetIds = campaign.targets.map((target) => target.targetId);
  const selection = selectFinalOwnerDecisions(entries, targetIds);
  if (!selection.ok) {
    throw new Error(`E8: ${targetIds.join(', ')} cannot close from the shared directory: ${selection.issues.map((issue) => `${issue.code}@${issue.path}: ${issue.message}`).join(' | ')}`);
  }
  if (selection.value.length !== targetIds.length) {
    throw new Error(`E8: ${targetIds.join(', ')} selected ${selection.value.length} decision(s) for ${targetIds.length} target(s)`);
  }
  for (const decision of selection.value) {
    if (!targetIds.includes(decision.targetId)) throw new Error(`a foreign decision was SELECTED, not merely tolerated: ${decision.sourceName}`);
    closed.push(`${decision.targetId}←${decision.sourceName}`);
  }
}
if (closed.length !== 2) throw new Error(`expected both 029 campaigns to close, got ${closed.join(', ')}`);
// Each campaign took its OWN file. Ignoring the neighbour must not mean picking it.
if (new Set(closed.map((entry) => entry.split('←')[1])).size !== 2) {
  throw new Error(`both campaigns closed on the same decision file: ${closed.join(', ')}`);
}

/* --------------------------------------------- and the gate is not weakened */
const sample = targetBound[0].value as Record<string, unknown>;
const own = String(sample.targetId);

// 1. A duplicate decision for a target of THIS campaign is still an error.
const duplicate = selectFinalOwnerDecisions([
  { name: 'a.json', value: sample },
  { name: 'b.json', value: sample },
], [own]);
if (duplicate.ok || !duplicate.issues.some((issue) => issue.message.includes('duplicate'))) {
  throw new Error('a duplicate final owner decision inside the campaign was accepted');
}

// 2. A missing decision is still an error.
const missing = selectFinalOwnerDecisions(entries, [own, 'une-cible-sans-decision']);
if (missing.ok || !missing.issues.some((issue) => issue.message.includes('missing final owner decision for une-cible-sans-decision'))) {
  throw new Error('a target with no final owner decision was accepted');
}

// 3. A MALFORMED decision for a declared target is still an error — ignoring the
//    neighbour's file must not become ignoring a broken file of our own.
const malformed = selectFinalOwnerDecisions([
  { name: 'broken.json', value: { targetId: own, decision: 'accepted' } },
], [own]);
if (malformed.ok || !malformed.issues.some((issue) => issue.message.includes(`invalid final owner decision for ${own}`))) {
  throw new Error('a malformed decision for a declared target was accepted');
}

// 4. A non-string targetId is a broken file, not a neighbour's file.
const nonString = selectFinalOwnerDecisions([{ name: 'weird.json', value: { targetId: 42 } }], [own]);
if (nonString.ok || !nonString.issues.some((issue) => issue.code === 'owner-decision')) {
  throw new Error('a decision whose targetId is not a string was silently ignored instead of refused');
}

// 5. The targetless gate records stay ignored, as they always were.
const onlyGateRecords = selectFinalOwnerDecisions(targetless, []);
if (!onlyGateRecords.ok || onlyGateRecords.value.length !== 0) {
  throw new Error('the targetless H1/H2/H3 gate records stopped being ignored');
}

console.log(`✔ shared owner-decision root: the two real 029 campaigns (${closed.join(', ')}) both close from ${DECISION_ROOT} with nothing moved, ${targetless.length} targetless gate record(s) still ignored, and duplicate / missing / malformed / non-string decisions still refused by name`);
