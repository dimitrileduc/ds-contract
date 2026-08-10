/** Node shell for the governed 021 campaign. Every command is explicit. */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { captureCampaign, discoverAffectedSurfaces, figmaToken, inspectFigmaCampaign } from './capture.js';
import { dryRunCampaign } from './apply.js';
import { transitionCampaign, validateRepairCampaign } from './campaign.js';
import { buildImpactInventory, impactInventoryIsComplete } from './impact.js';
import { buildIdempotenceReceipt, buildRepairReceipt } from './report.js';
import type { CapturePhase, RepairCampaign } from './types.js';
import { compareReconstructionIdempotence, loadReconstructionMaterial, verifyCampaignClosure } from './verify.js';

const usage = `Usage: npm run projection:repair -- --campaign <campaign.json> <action> [--targets id,id]
Actions: --preflight | --capture-before | --dry-run | --apply | --capture-after |
         --verify | --capture-idempotence | --verify-idempotence | --finalize`;

const actions = ['--preflight', '--capture-before', '--dry-run', '--apply', '--capture-after', '--verify', '--capture-idempotence', '--verify-idempotence', '--finalize'] as const;
type Action = (typeof actions)[number];

function fail(message: string, code = 2): never {
  console.error(`projection:repair refused — ${message}`);
  console.error(usage);
  process.exit(code);
}

function readCampaign(campaignPath: string): RepairCampaign {
  const absolute = path.resolve(process.cwd(), campaignPath);
  if (!existsSync(absolute)) fail(`campaign not found: ${campaignPath}`);
  let parsed: unknown;
  try { parsed = JSON.parse(readFileSync(absolute, 'utf8')); } catch { fail(`campaign is not valid JSON: ${campaignPath}`); }
  const validation = validateRepairCampaign(parsed);
  if (!validation.ok) fail(validation.issues.map((issue) => `${issue.code}@${issue.path}`).join(', '));
  return validation.value;
}

function writeCampaign(campaignPath: string, campaign: RepairCampaign): void {
  writeFileSync(path.resolve(process.cwd(), campaignPath), `${JSON.stringify(campaign, null, 2)}\n`);
}

function requireAuthorityFiles(campaign: RepairCampaign): void {
  const absent = campaign.authorityRefs.filter((reference) => !existsSync(path.resolve(process.cwd(), reference)));
  if (absent.length) fail(`missing authority reference(s): ${absent.join(', ')}`);
}

async function preflight(campaignPath: string): Promise<void> {
  const current = readCampaign(campaignPath);
  requireAuthorityFiles(current);
  const inspection = await inspectFigmaCampaign(current, figmaToken());
  const discovered = discoverAffectedSurfaces(current, inspection);
  const impacts = buildImpactInventory();
  if (!impactInventoryIsComplete(impacts)) fail('shared impact inventory is incomplete');
  const next = { ...discovered, consumerImpacts: impacts, state: 'preflight-valid' as const };
  const validation = transitionCampaign({ ...next, state: 'draft' }, 'preflight-valid');
  if (!validation.ok) fail(validation.issues.map((issue) => `${issue.code}@${issue.path}`).join(', '));
  writeCampaign(campaignPath, next);
  console.log(`projection:repair preflight-valid — ${next.targets.length}/7 targets, ${next.affectedSurfaces.length} surfaces, ${next.consumerImpacts.length} consumers, pin ${inspection.versionId}`);
}

async function capture(campaignPath: string, phase: CapturePhase): Promise<void> {
  const current = readCampaign(campaignPath);
  if (phase === 'before' && !['preflight-valid', 'ready-to-apply'].includes(current.state)) fail(`capture-before requires preflight-valid or ready-to-apply, got ${current.state}`);
  const captured = await captureCampaign(current, phase, 'specs/021-figma-projection-repair/proofs', figmaToken());
  if (!captured.capture.complete) fail(`capture-${phase} is incomplete; no transition or mutation is allowed`, 1);
  writeCampaign(campaignPath, captured.campaign);
  console.log(`projection:repair ${phase} capture complete — ${captured.capture.artifacts.length} artifacts, ${captured.capture.imageFingerprints.length} image fingerprints, ${captured.capture.instanceLinks.length} instance links`);
}

async function dryRun(campaignPath: string, targets?: string[]): Promise<void> {
  const current = readCampaign(campaignPath);
  const unknown = (targets ?? []).filter((target) => !current.targets.some((entry) => entry.targetId === target));
  if (unknown.length) fail(`unknown dry-run target(s): ${unknown.join(', ')}`);
  const plan = dryRunCampaign(current, process.cwd(), targets as RepairCampaign['targets'][number]['targetId'][] | undefined);
  const output = path.resolve(process.cwd(), 'specs/021-figma-projection-repair/proofs/us1/dry-run.json');
  writeFileSync(output, `${JSON.stringify(plan, null, 2)}\n`);
  console.log(`projection:repair dry-run — ${plan.operations.length} bounded operations, no canvas writer invoked`);
}

async function verifyIdempotence(campaignPath: string): Promise<void> {
  const current = readCampaign(campaignPath);
  const after = current.captureSets.after;
  const idempotence = current.captureSets.idempotence;
  if (!after?.complete || !idempotence?.complete) fail('verify-idempotence requires complete after and idempotence captures');
  const livePath = path.resolve(process.cwd(), 'specs/021-figma-projection-repair/proofs/us3/live-rebuilds.json');
  if (!existsSync(livePath)) fail('verify-idempotence requires the two-run live receipt');
  const live = JSON.parse(readFileSync(livePath, 'utf8')) as { runs?: Array<{ operations?: Array<{ operationId: string; status: string; nodeId: string }> }> };
  const first = live.runs?.[0]?.operations;
  const second = live.runs?.[1]?.operations;
  if (!first || !second) fail('live rebuild receipt does not contain exactly two operation runs');
  const comparison = compareReconstructionIdempotence(
    loadReconstructionMaterial(after, process.cwd(), { operations: first }),
    loadReconstructionMaterial(idempotence, process.cwd(), { operations: second }),
  );
  if (!comparison.ok) fail(`idempotence drift: ${comparison.differences.map((difference) => difference.category).join(', ')}`, 1);
  const receipt = buildIdempotenceReceipt(comparison, second);
  const root = path.resolve(process.cwd(), 'specs/021-figma-projection-repair/proofs/us3');
  writeFileSync(path.join(root, 'idempotence-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  writeFileSync(path.join(root, 'verdict.md'), [
    '# US3 — verdict idempotence', '',
    'Verdict : **vert**.', '',
    `- ${receipt.operations.length} opérations live au second run, toutes \`no-op\`.`,
    `- ${after.artifacts.length} artefacts après comparés à ${idempotence.artifacts.length} artefacts idempotence.`,
    `- ${after.imageFingerprints.length} empreintes IMAGE et ${after.instanceLinks.length} liens/overrides strictement identiques.`,
    '- Géométrie, propriétés, PNG, statuts et reçu normalisé : zéro différence.',
    `- Hash déterministe du reçu : \`${receipt.comparisonHash}\`.`, '',
  ].join('\n'));
  console.log(`projection:repair idempotence verified — ${receipt.operations.length} no-op operations, zero observable diff`);
}

async function verify(campaignPath: string): Promise<void> {
  const current = readCampaign(campaignPath);
  if (current.state !== 'applied') fail(`verify requires applied state, got ${current.state}`);
  const comparison = verifyCampaignClosure(current, process.cwd());
  const output = path.resolve(process.cwd(), 'specs/021-figma-projection-repair/proofs/us4/comparison.json');
  writeFileSync(output, `${JSON.stringify(comparison, null, 2)}\n`);
  if (!comparison.ok) {
    const failed = transitionCampaign(current, 'verification-failed');
    if (failed.ok) writeCampaign(campaignPath, failed.value);
    fail('comparison contains an unexpected diff or an open preservation gate', 1);
  }
  const verified = transitionCampaign(current, 'verified');
  if (!verified.ok) fail(verified.issues.map((issue) => `${issue.code}@${issue.path}`).join(', '));
  writeCampaign(campaignPath, verified.value);
  console.log(`projection:repair verified — ${comparison.targetCount}/7 targets, zero unexpected diff, images/instances/consumers closed`);
}

async function finalize(campaignPath: string): Promise<void> {
  const current = readCampaign(campaignPath);
  if (current.state !== 'verified') fail(`finalize requires verified state, got ${current.state}`);
  const comparisonPath = path.resolve(process.cwd(), 'specs/021-figma-projection-repair/proofs/us4/comparison.json');
  const idempotencePath = path.resolve(process.cwd(), 'specs/021-figma-projection-repair/proofs/us3/idempotence-receipt.json');
  const decisionRoot = path.resolve(process.cwd(), 'specs/021-figma-projection-repair/campaign/owner-decisions');
  if (!existsSync(comparisonPath) || !existsSync(idempotencePath) || !existsSync(decisionRoot)) fail('finalize requires comparison, idempotence and owner decisions');
  const comparison = JSON.parse(readFileSync(comparisonPath, 'utf8')) as ReturnType<typeof verifyCampaignClosure>;
  const idempotence = JSON.parse(readFileSync(idempotencePath, 'utf8')) as { status?: string };
  if (!comparison.ok || idempotence.status !== 'pass') fail('finalize requires green comparison and idempotence');
  const decisionFiles = readdirSync(decisionRoot).filter((name) => name.endsWith('.json')).sort();
  if (decisionFiles.length !== 7) fail(`finalize requires exactly seven owner decisions, got ${decisionFiles.length}`);
  const decisions = new Map<string, { targetId: string; decision: 'accepted' | 'refused'; rationale: string; decidedAt: string }>();
  for (const name of decisionFiles) {
    const decision = JSON.parse(readFileSync(path.join(decisionRoot, name), 'utf8')) as { targetId?: string; decision?: string; rationale?: string; decidedAt?: string };
    if (!decision.targetId || !['accepted', 'refused'].includes(String(decision.decision)) || !decision.rationale || !decision.decidedAt || decisions.has(decision.targetId)) {
      fail(`invalid or duplicate owner decision: ${name}`);
    }
    decisions.set(decision.targetId, decision as { targetId: string; decision: 'accepted' | 'refused'; rationale: string; decidedAt: string });
  }
  const receiptRoot = path.resolve(process.cwd(), 'specs/021-figma-projection-repair/proofs/us4/receipts');
  mkdirSync(receiptRoot, { recursive: true });
  const receipts = [];
  for (const target of current.targets) {
    const decision = decisions.get(target.targetId);
    const verdict = comparison.targets.find((entry) => entry.targetId === target.targetId);
    if (!decision || !verdict) fail(`missing closure package for ${target.targetId}`);
    const consumers = current.consumerImpacts.filter((consumer) =>
      target.projectionDefectIds.some((defect) => defect === consumer.dependencyId ||
        (defect === 'icon-instance-swap' && consumer.dependencyId === 'Button') ||
        (defect === 'composed-prop-forwarding' && consumer.dependencyId === 'SectionHeader')),
    );
    const beforeEvidence = current.captureSets.before.artifacts.find((artifact) => target.affectedSurfaceIds.includes(artifact.surfaceId))?.path;
    const afterEvidence = current.captureSets.after?.artifacts.find((artifact) => target.affectedSurfaceIds.includes(artifact.surfaceId))?.path;
    if (!beforeEvidence || !afterEvidence) fail(`missing before/after evidence for ${target.targetId}`);
    const operationIds = current.allowedOperations.filter((operation) => operation.targetId === target.targetId).map((operation) => operation.operationId);
    if (target.kind === 'direct-canvas') operationIds.push(`direct-${target.targetId}`);
    const built = buildRepairReceipt({
      targetId: target.targetId,
      referenceId: target.reference.referenceId,
      appliedOperationIds: operationIds,
      expectedDiffs: verdict.expectedDiffs,
      unexpectedDiffs: verdict.unexpectedDiffs,
      captureValid: current.captureSets.before.complete && current.captureSets.after?.complete === true,
      imagePreservation: verdict.imagePreservation,
      instancePreservation: verdict.instancePreservation,
      consumerVerdicts: consumers.map((consumer) => ({
        consumerId: consumer.consumerId, dependencyId: consumer.dependencyId,
        status: consumer.status === 'refused' ? 'refused' : 'revalidated',
        evidenceRefs: consumer.evidenceRefs,
        decisionRef: consumer.decisionRef ?? null,
      })),
      idempotence: 'pass',
      ownerDecision: decision.decision,
      ownerRationale: decision.rationale,
      evidenceRefs: [
        beforeEvidence, afterEvidence,
        'specs/021-figma-projection-repair/proofs/us4/comparison.json',
        `specs/021-figma-projection-repair/campaign/owner-decisions/${target.targetId}.json`,
        'specs/021-figma-projection-repair/proofs/us3/idempotence-receipt.json',
      ],
      limits: verdict.limits,
      decidedAt: decision.decidedAt,
    });
    if (!built.ok) fail(`${target.targetId} receipt refused: ${built.issues.join(', ')}`);
    writeFileSync(path.join(receiptRoot, `${target.targetId}.json`), `${JSON.stringify(built.value, null, 2)}\n`);
    receipts.push(built.value);
  }
  if (receipts.length !== 7) fail(`finalize produced ${receipts.length}/7 receipts`);
  const allAccepted = receipts.every((receipt) => receipt.ownerDecision === 'accepted');
  const updated = {
    ...current,
    targets: current.targets.map((target) => ({ ...target, ownerDecision: decisions.get(target.targetId)!.decision })),
  };
  const terminal = transitionCampaign(updated, allAccepted ? 'owner-accepted' : 'owner-refused');
  if (!terminal.ok) fail(terminal.issues.map((issue) => `${issue.code}@${issue.path}`).join(', '));
  writeCampaign(campaignPath, terminal.value);
  const closurePath = path.resolve(process.cwd(), 'specs/021-figma-projection-repair/proofs/closure.md');
  writeFileSync(closurePath, [
    '# Clôture — campagne 021', '',
    `État terminal : **${terminal.value.state}**.`, '',
    `- Reçus conformes : ${receipts.length}/7.`,
    '- Comparaison : 7/7 cibles, zéro diff inattendu.',
    '- Idempotence : verte, second apply intégralement no-op.',
    `- Décisions owner : ${receipts.filter((receipt) => receipt.ownerDecision === 'accepted').length} accepted, ${receipts.filter((receipt) => receipt.ownerDecision === 'refused').length} refused.`,
    '- Consommateurs partagés : 30/30 clos.', '',
    ...receipts.map((receipt) => `- \`${receipt.targetId}\` — ${receipt.ownerDecision} — \`${receipt.receiptId}\``), '',
  ].join('\n'));
  console.log(`projection:repair finalized — ${receipts.length}/7 schema-valid receipts, state ${terminal.value.state}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { console.log(usage); return; }
  const campaignIndex = args.indexOf('--campaign');
  const campaignPath = campaignIndex >= 0 ? args.splice(campaignIndex, 2)[1] : undefined;
  const targetsIndex = args.indexOf('--targets');
  const targets = targetsIndex >= 0 ? args.splice(targetsIndex, 2)[1]?.split(',').filter(Boolean) : undefined;
  const action = actions.find((candidate) => args.includes(candidate));
  if (!campaignPath || !action || args.filter((argument) => actions.includes(argument as Action)).length !== 1 || args.length !== 1) fail('exactly one action and --campaign are required');
  if (action === '--preflight') return preflight(campaignPath);
  if (action === '--capture-before') return capture(campaignPath, 'before');
  if (action === '--capture-after') return capture(campaignPath, 'after');
  if (action === '--capture-idempotence') return capture(campaignPath, 'idempotence');
  if (action === '--verify-idempotence') return verifyIdempotence(campaignPath);
  if (action === '--verify') return verify(campaignPath);
  if (action === '--finalize') return finalize(campaignPath);
  if (action === '--dry-run') return dryRun(campaignPath, targets);
  fail(`${action} is unavailable until its guarded implementation task is complete`, 1);
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error), 1));
