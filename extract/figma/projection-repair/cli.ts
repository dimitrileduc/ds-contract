/** Node shell for the governed 021 campaign. Every command is explicit. */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { captureCampaign, discoverAffectedSurfaces, figmaToken, inspectFigmaCampaign, observeSurfaceLocks } from './capture.js';
import { dryRunCampaign } from './apply.js';
import { normalizeBridgeApplyEnvelope, validateLiveApplyReceipt } from './apply-receipt.js';
import { buildPreflightLockReport, preflightLockRefusal, selectFinalOwnerDecisions, transitionCampaign, validateRepairCampaign } from './campaign.js';
import { generateRepairCampaign, linkedReferencesOf } from './manifest-generator.js';
import { generateDecisionBoard } from './board-generator.js';
import { buildImpactInventory, impactInventoryIsComplete, mergeConsumerImpacts } from './impact.js';
import { buildIdempotenceReceipt, buildRepairReceipt } from './report.js';
import { CAPTURE_MODES } from './types.js';
import type { CapturePhase, RepairCampaign } from './types.js';
import { compareReconstructionIdempotence, consumersForTarget, loadReconstructionMaterial, verifyCampaignClosure } from './verify.js';
import { snapshotSourceBaseline, verifySourceBaseline } from './source-baseline.js';
import { workflowPaths } from './workflow.js';
import { auditComponentCampaign } from './audit.js';
import { emitBridgeApplyScript } from './bridge-script.js';

const usage = `Usage: npm run component:repair -- --campaign <campaign.json> <action> [options]
Generation: npm run component:repair:manifest -- --releve <audit.json|dump.json> --out <campaign.json> [--component <id>]
            npm run component:repair:board -- --decisions <dir> --witnesses <manifest.json> --usages <inventaire.json> --out <dir>
Actions: --audit | --snapshot-source --backup-ref <ref> | --preflight | --dry-run |
         --capture-before | --capture-after | --capture-idempotence  [--capture-mode full|light] |
         --emit-bridge-script --run first|second |
         --normalize-apply --run first|second --bridge-result <raw.json> --receipt <receipt.json> |
         --record-apply --run first|second --receipt <receipt.json> |
         --verify | --verify-idempotence | --finalize`;

const actions = ['--audit', '--snapshot-source', '--preflight', '--capture-before', '--dry-run', '--emit-bridge-script', '--normalize-apply', '--record-apply', '--capture-after', '--verify', '--capture-idempotence', '--verify-idempotence', '--finalize'] as const;

function fail(message: string, code = 2): never {
  console.error(`projection:repair refused — ${message}`);
  console.error(usage);
  process.exit(code);
}

/** Read one bounded JSON document or refuse BY NAME. `prefix` is the caller's refusal
 *  code (`board-input-unreadable`, `releve-unreadable`, …) so one implementation of
 *  "resolve, exist, parse" serves every action without flattening their refusals. */
function readJsonOrFail(relative: string, label: string, prefix = ''): unknown {
  const named = prefix ? `${prefix}: ` : '';
  const absolute = path.resolve(process.cwd(), relative);
  if (!existsSync(absolute)) fail(`${named}${label} not found: ${relative}`);
  try { return JSON.parse(readFileSync(absolute, 'utf8')); }
  catch { fail(`${named}${label} is not valid JSON: ${relative}`); }
}

/** Every `*.json` of a decision directory, sorted, read. The shared-directory rule of
 *  E8 makes this the one spelling `finalize` and `--generate-board` both read. */
function readDecisionDirectory(directory: string, prefix = ''): Array<{ name: string; value: unknown }> {
  const named = prefix ? `${prefix}: ` : '';
  const root = path.resolve(process.cwd(), directory);
  if (!existsSync(root)) fail(`${named}decisions directory not found: ${directory}`);
  return readdirSync(root).filter((name) => name.endsWith('.json')).sort()
    .map((name) => ({ name, value: readJsonOrFail(path.join(directory, name), name, prefix) }));
}

function readCampaign(campaignPath: string): RepairCampaign {
  const validation = validateRepairCampaign(readJsonOrFail(campaignPath, 'campaign'));
  if (!validation.ok) fail(validation.issues.map((issue) => `${issue.code}@${issue.path}`).join(', '));
  return validation.value;
}

function writeCampaign(campaignPath: string, campaign: RepairCampaign): void {
  writeFileSync(path.resolve(process.cwd(), campaignPath), `${JSON.stringify(campaign, null, 2)}\n`);
}

function snapshotSource(campaignPath: string, backupRef: string): void {
  const raw = readJsonOrFail(campaignPath, 'campaign');
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || (raw as { schemaVersion?: unknown }).schemaVersion !== '2.0.0') {
    fail('snapshot-source is available only for a component workflow v2 manifest');
  }
  const sourceBaseline = snapshotSourceBaseline(process.cwd(), backupRef);
  const next = { ...(raw as Record<string, unknown>), sourceBaseline };
  const validation = validateRepairCampaign(next);
  if (!validation.ok) fail(validation.issues.map((entry) => `${entry.code}@${entry.path}`).join(', '));
  writeCampaign(campaignPath, validation.value);
  console.log(`component:repair source snapshotted — ${sourceBaseline.backupRef} tree ${sourceBaseline.worktreeTree}`);
}

function requireAuthorityFiles(campaign: RepairCampaign): void {
  const absent = campaign.authorityRefs.filter((reference) => !existsSync(path.resolve(process.cwd(), reference)));
  if (absent.length) fail(`missing authority reference(s): ${absent.join(', ')}`);
}

async function audit(campaignPath: string): Promise<void> {
  const current = readCampaign(campaignPath);
  requireAuthorityFiles(current);
  const report = await auditComponentCampaign(current);
  const output = path.resolve(process.cwd(), workflowPaths(current).auditPath);
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`component:repair audit ${report.verdict} — ${report.findings.length} finding(s), figmaWrites=0, report ${path.relative(process.cwd(), output)}`);
}

function emitBridgeScript(campaignPath: string, run: 'first' | 'second'): void {
  const current = readCampaign(campaignPath);
  if (run === 'first' && current.state !== 'ready-to-apply') fail(`first bridge emission requires ready-to-apply, got ${current.state}`);
  if (run === 'second') {
    if (!['applied', 'verified'].includes(current.state)) fail(`second bridge emission requires applied or verified, got ${current.state}`);
    requireConfiguredApplyReceipt(current, 'first');
  }
  const plan = dryRunCampaign({ ...current, state: 'ready-to-apply' }, process.cwd());
  const paths = workflowPaths(current);
  const output = path.resolve(process.cwd(), run === 'first' ? paths.bridgeScriptPaths.first : paths.bridgeScriptPaths.second);
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, emitBridgeApplyScript(current, plan, run));
  console.log(`component:repair bridge script emitted — ${run}, ${plan.operations.length} bounded operation(s), ${path.relative(process.cwd(), output)}`);
}

async function preflight(campaignPath: string): Promise<void> {
  const current = readCampaign(campaignPath);
  requireAuthorityFiles(current);
  if (current.schemaVersion === '2.0.0') {
    if (!current.sourceBaseline) fail('component workflow is missing its source baseline');
    verifySourceBaseline(process.cwd(), current.sourceBaseline);
  }
  const inspection = await inspectFigmaCampaign(current, figmaToken());
  const discovered = discoverAffectedSurfaces(current, inspection);
  const discoveredImpacts = current.schemaVersion === '2.0.0' && (current.workflow?.sharedDependencies.length ?? 0) === 0
    ? []
    : buildImpactInventory().filter((impact) => current.schemaVersion !== '2.0.0' || current.workflow!.sharedDependencies.includes(impact.dependencyId));
  const impacts = current.schemaVersion === '2.0.0'
    ? mergeConsumerImpacts(discoveredImpacts, current.consumerImpacts)
    : discoveredImpacts;
  if (impacts.length > 0 && !impactInventoryIsComplete(impacts)) fail('shared impact inventory is incomplete');

  // 030 — inherited size locks are met HERE, before the dry-run, instead of after the
  // pose. 029 paid 33 minutes and a manual restore for a 744 px floor the verification
  // discovered once the mutation was already on the canvas.
  const lockReport = buildPreflightLockReport(discovered, observeSurfaceLocks(discovered, inspection), new Date().toISOString());
  const lockPath = path.resolve(process.cwd(), workflowPaths(current).evidenceRoot, 'preflight-locks.json');
  mkdirSync(path.dirname(lockPath), { recursive: true });
  writeFileSync(lockPath, `${JSON.stringify(lockReport, null, 2)}\n`);
  const lockRefusal = preflightLockRefusal(lockReport);
  if (lockRefusal) {
    console.error(`component:repair lock report — ${path.relative(process.cwd(), lockPath)}`);
    fail(lockRefusal, 1);
  }
  const next = { ...discovered, consumerImpacts: impacts, state: 'preflight-valid' as const };
  const validation = transitionCampaign({ ...next, state: 'draft' }, 'preflight-valid');
  if (!validation.ok) fail(validation.issues.map((issue) => `${issue.code}@${issue.path}`).join(', '));
  writeCampaign(campaignPath, next);
  console.log(`component:repair preflight-valid — ${next.targets.length} target(s), ${next.affectedSurfaces.length} surfaces, ${next.consumerImpacts.length} consumers, pin ${inspection.versionId}`);
}

/**
 * Resolve the capture mode for this invocation and pin it into the campaign.
 *
 * The mode is opt-in and written on FIRST use, then it is the campaign's. A run that
 * changes its mind halfway would leave a before capture and an after capture with
 * different notions of what "complete" means, and the comparison would be reading two
 * different experiments — so the second spelling is refused by name.
 */
function resolveCaptureMode(current: RepairCampaign, requested?: string): RepairCampaign {
  if (requested !== undefined && !(CAPTURE_MODES as readonly string[]).includes(requested)) {
    fail(`--capture-mode must be ${CAPTURE_MODES.join(' or ')}, got ${requested}`);
  }
  const pinned = current.captureMode;
  if (requested === undefined) return current;
  if (pinned !== undefined && pinned !== requested) {
    fail(`capture-mode-mismatch: this campaign already captured in ${pinned}; a run does not change capture mode halfway`, 1);
  }
  return pinned === requested ? current : { ...current, captureMode: requested as RepairCampaign['captureMode'] };
}

async function capture(campaignPath: string, phase: CapturePhase, requestedMode?: string): Promise<void> {
  const current = resolveCaptureMode(readCampaign(campaignPath), requestedMode);
  if (phase === 'before' && !['preflight-valid', 'ready-to-apply'].includes(current.state)) fail(`capture-before requires preflight-valid or ready-to-apply, got ${current.state}`);
  if (phase === 'after' && current.schemaVersion === '2.0.0') {
    if (current.state !== 'applied') fail(`capture-after requires applied, got ${current.state}`);
    requireConfiguredApplyReceipt(current, 'first');
  }
  if (phase === 'idempotence' && current.schemaVersion === '2.0.0') {
    if (current.state !== 'verified') fail(`capture-idempotence requires verified, got ${current.state}`);
    requireConfiguredApplyReceipt(current, 'second');
  }
  const captured = await captureCampaign(current, phase, workflowPaths(current).captureRoot, figmaToken());
  if (!captured.capture.complete) fail(`capture-${phase} is incomplete; no transition or mutation is allowed`, 1);
  writeCampaign(campaignPath, captured.campaign);
  const mode = captured.campaign.captureMode ?? 'full';
  console.log(`projection:repair ${phase} capture complete (${mode}) — ${captured.capture.artifacts.length} artifacts, ${captured.capture.imageFingerprints.length} image fingerprints, ${captured.capture.instanceLinks.length} instance links`);
}

async function dryRun(campaignPath: string, targets?: string[]): Promise<void> {
  const current = readCampaign(campaignPath);
  const unknown = (targets ?? []).filter((target) => !current.targets.some((entry) => entry.targetId === target));
  if (unknown.length) fail(`unknown dry-run target(s): ${unknown.join(', ')}`);
  const plan = dryRunCampaign(current, process.cwd(), targets as RepairCampaign['targets'][number]['targetId'][] | undefined);
  const output = path.resolve(process.cwd(), workflowPaths(current).dryRunPath);
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(plan, null, 2)}\n`);
  console.log(`component:repair dry-run — ${plan.operations.length} bounded operations, no canvas writer invoked`);
}

function requireConfiguredApplyReceipt(current: RepairCampaign, run: 'first' | 'second', explicitPath?: string) {
  const configuredPath = run === 'first' ? workflowPaths(current).firstApplyReceiptPath : workflowPaths(current).secondApplyReceiptPath;
  if (explicitPath) {
    const normalizedGiven = path.relative(process.cwd(), path.resolve(process.cwd(), explicitPath));
    if (normalizedGiven !== configuredPath) fail(`apply receipt path must equal configured path ${configuredPath}`);
  }
  const absolute = path.resolve(process.cwd(), configuredPath);
  if (!existsSync(absolute)) fail(`apply receipt not found: ${configuredPath}`);
  const plan = dryRunCampaign({ ...current, state: 'ready-to-apply' }, process.cwd());
  let raw: unknown;
  try { raw = JSON.parse(readFileSync(absolute, 'utf8')); } catch { fail(`apply receipt is not valid JSON: ${configuredPath}`); }
  const validation = validateLiveApplyReceipt(raw, current, plan, run);
  if (!validation.ok) fail(`apply receipt refused: ${validation.issues.join(', ')}`, 1);
  for (const check of validation.value.responsiveChecks) {
    const screenshotPath = path.resolve(process.cwd(), check.screenshotRef);
    if (!existsSync(screenshotPath) || statSync(screenshotPath).size === 0) {
      fail(`responsive screenshot proof missing or empty: ${check.screenshotRef}`, 1);
    }
  }
  return validation.value;
}

function recordApply(campaignPath: string, receiptPath: string, run: 'first' | 'second'): void {
  const current = readCampaign(campaignPath);
  if (run === 'first' && current.state !== 'ready-to-apply') fail(`first apply receipt requires ready-to-apply, got ${current.state}`);
  if (run === 'second' && !['applied', 'verified'].includes(current.state)) fail(`second apply receipt requires applied or verified, got ${current.state}`);
  const receipt = requireConfiguredApplyReceipt(current, run, receiptPath);
  if (run === 'first') {
    const applied = transitionCampaign(current, 'applied');
    if (!applied.ok) fail(applied.issues.map((entry) => `${entry.code}@${entry.path}`).join(', '));
    writeCampaign(campaignPath, applied.value);
  }
  console.log(`component:repair ${run} apply receipt accepted — ${receipt.operations.length} operations, pageWrites=0`);
}

function normalizeApply(campaignPath: string, bridgeResultPath: string, receiptPath: string, run: 'first' | 'second'): void {
  const current = readCampaign(campaignPath);
  const expectedPath = run === 'first' ? workflowPaths(current).firstApplyReceiptPath : workflowPaths(current).secondApplyReceiptPath;
  const normalizedOutput = path.relative(process.cwd(), path.resolve(process.cwd(), receiptPath));
  if (normalizedOutput !== expectedPath) fail(`normalized receipt path must equal configured path ${expectedPath}`);
  if (!existsSync(path.resolve(process.cwd(), bridgeResultPath))) fail(`bridge result not found: ${bridgeResultPath}`);
  const plan = dryRunCampaign({ ...current, state: 'ready-to-apply' }, process.cwd());
  let raw: unknown;
  try { raw = JSON.parse(readFileSync(path.resolve(process.cwd(), bridgeResultPath), 'utf8')); } catch { fail(`bridge result is not valid JSON: ${bridgeResultPath}`); }
  let normalized;
  try { normalized = normalizeBridgeApplyEnvelope(raw, current, plan, run); }
  catch (error) { fail(error instanceof Error ? error.message : String(error), 1); }
  const validation = validateLiveApplyReceipt(normalized, current, plan, run);
  if (!validation.ok) fail(`normalized apply receipt refused: ${validation.issues.join(', ')}`, 1);
  mkdirSync(path.dirname(path.resolve(process.cwd(), receiptPath)), { recursive: true });
  writeFileSync(path.resolve(process.cwd(), receiptPath), `${JSON.stringify(validation.value, null, 2)}\n`);
  console.log(`component:repair bridge result normalized — ${run}, ${validation.value.operations.length} operation(s), receipt ${expectedPath}`);
}

async function verifyIdempotence(campaignPath: string): Promise<void> {
  const current = readCampaign(campaignPath);
  const after = current.captureSets.after;
  const idempotence = current.captureSets.idempotence;
  if (!after?.complete || !idempotence?.complete) fail('verify-idempotence requires complete after and idempotence captures');
  const paths = workflowPaths(current);
  const livePath = path.resolve(process.cwd(), paths.secondApplyReceiptPath);
  if (!existsSync(livePath)) fail('verify-idempotence requires the two-run live receipt');
  const live = JSON.parse(readFileSync(livePath, 'utf8')) as {
    operations?: Array<{ operationId: string; status: string; nodeId: string }>;
    runs?: Array<{ operations?: Array<{ operationId: string; status: string; nodeId: string }> }>;
  };
  const firstLive = current.schemaVersion === '2.0.0'
    ? JSON.parse(readFileSync(path.resolve(process.cwd(), paths.firstApplyReceiptPath), 'utf8')) as { operations?: Array<{ operationId: string; status: string; nodeId: string }> }
    : live;
  const first = current.schemaVersion === '2.0.0' ? firstLive.operations : live.runs?.[0]?.operations;
  const second = current.schemaVersion === '2.0.0' ? live.operations : live.runs?.[1]?.operations;
  if (!first || !second) fail('live rebuild receipt does not contain the required operation run(s)');
  const comparableFirst = current.schemaVersion === '2.0.0'
    ? first.map((operation) => ({ operationId: operation.operationId, nodeId: operation.nodeId }))
    : first;
  const comparableSecond = current.schemaVersion === '2.0.0'
    ? second.map((operation) => ({ operationId: operation.operationId, nodeId: operation.nodeId }))
    : second;
  const comparison = compareReconstructionIdempotence(
    loadReconstructionMaterial(after, process.cwd(), { operations: comparableFirst }),
    loadReconstructionMaterial(idempotence, process.cwd(), { operations: comparableSecond }),
  );
  if (!comparison.ok) fail(`idempotence drift: ${comparison.differences.map((difference) => difference.category).join(', ')}`, 1);
  const receipt = buildIdempotenceReceipt(comparison, second, current.campaignId);
  const root = path.resolve(process.cwd(), paths.evidenceRoot);
  mkdirSync(root, { recursive: true });
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
  if (!['applied', 'verification-failed'].includes(current.state)) {
    fail(`verify requires applied or verification-failed state, got ${current.state}`);
  }
  const comparison = verifyCampaignClosure(current, process.cwd());
  const output = path.resolve(process.cwd(), workflowPaths(current).comparisonPath);
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(comparison, null, 2)}\n`);
  if (!comparison.ok) {
    if (current.state === 'applied') {
      const failed = transitionCampaign(current, 'verification-failed');
      if (failed.ok) writeCampaign(campaignPath, failed.value);
    }
    fail('comparison contains an unexpected diff or an open preservation gate', 1);
  }
  const verified = transitionCampaign(current, 'verified');
  if (!verified.ok) fail(verified.issues.map((issue) => `${issue.code}@${issue.path}`).join(', '));
  writeCampaign(campaignPath, verified.value);
  console.log(`component:repair verified — ${comparison.targetCount} target(s), zero unexpected diff, images/instances/consumers closed`);
}

async function finalize(campaignPath: string): Promise<void> {
  const current = readCampaign(campaignPath);
  if (current.state !== 'verified') fail(`finalize requires verified state, got ${current.state}`);
  const paths = workflowPaths(current);
  const comparisonPath = path.resolve(process.cwd(), paths.comparisonPath);
  const idempotencePath = path.resolve(process.cwd(), paths.evidenceRoot, 'idempotence-receipt.json');
  const decisionRoot = path.resolve(process.cwd(), paths.ownerDecisionRoot);
  if (!existsSync(comparisonPath) || !existsSync(idempotencePath) || !existsSync(decisionRoot)) fail('finalize requires comparison, idempotence and owner decisions');
  const comparison = JSON.parse(readFileSync(comparisonPath, 'utf8')) as ReturnType<typeof verifyCampaignClosure>;
  const idempotence = JSON.parse(readFileSync(idempotencePath, 'utf8')) as { status?: string };
  if (!comparison.ok || idempotence.status !== 'pass') fail('finalize requires green comparison and idempotence');
  const selection = selectFinalOwnerDecisions(
    readDecisionDirectory(paths.ownerDecisionRoot),
    current.targets.map((target) => target.targetId));
  if (!selection.ok) fail(selection.issues.map((entry) => `${entry.code}@${entry.path}: ${entry.message}`).join(', '));
  const decisions = new Map(selection.value.map((decision) => [decision.targetId, decision]));
  const receiptRoot = path.resolve(process.cwd(), paths.finalReceiptRoot);
  mkdirSync(receiptRoot, { recursive: true });
  const receipts = [];
  for (const target of current.targets) {
    const decision = decisions.get(target.targetId);
    const verdict = comparison.targets.find((entry) => entry.targetId === target.targetId);
    if (!decision || !verdict) fail(`missing closure package for ${target.targetId}`);
    const consumers = consumersForTarget(current, target);
    const beforeEvidence = current.captureSets.before.artifacts.find((artifact) => target.affectedSurfaceIds.includes(artifact.surfaceId))?.path;
    const afterEvidence = current.captureSets.after?.artifacts.find((artifact) => target.affectedSurfaceIds.includes(artifact.surfaceId))?.path;
    if (!beforeEvidence || !afterEvidence) fail(`missing before/after evidence for ${target.targetId}`);
    const operationIds = current.allowedOperations.filter((operation) => operation.targetId === target.targetId).map((operation) => operation.operationId);
    if (target.kind === 'direct-canvas') operationIds.push(`direct-${target.targetId}`);
    const built = buildRepairReceipt({
      schemaVersion: current.schemaVersion,
      campaignId: current.campaignId,
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
        paths.comparisonPath,
        path.posix.join(paths.ownerDecisionRoot, decision.sourceName),
        path.posix.join(paths.evidenceRoot, 'idempotence-receipt.json'),
      ],
      limits: verdict.limits,
      decidedAt: decision.decidedAt,
    });
    if (!built.ok) fail(`${target.targetId} receipt refused: ${built.issues.join(', ')}`);
    writeFileSync(path.join(receiptRoot, `${target.targetId}.json`), `${JSON.stringify(built.value, null, 2)}\n`);
    receipts.push(built.value);
  }
  if (receipts.length !== current.targets.length) fail(`finalize produced ${receipts.length}/${current.targets.length} receipts`);
  const allAccepted = receipts.every((receipt) => receipt.ownerDecision === 'accepted');
  const updated = {
    ...current,
    targets: current.targets.map((target) => ({ ...target, ownerDecision: decisions.get(target.targetId)!.decision })),
  };
  const terminal = transitionCampaign(updated, allAccepted ? 'owner-accepted' : 'owner-refused');
  if (!terminal.ok) fail(terminal.issues.map((issue) => `${issue.code}@${issue.path}`).join(', '));
  writeCampaign(campaignPath, terminal.value);
  const closurePath = path.resolve(process.cwd(), paths.closurePath);
  writeFileSync(closurePath, [
    `# Clôture — ${current.campaignId}`, '',
    `État terminal : **${terminal.value.state}**.`, '',
    `- Reçus conformes : ${receipts.length}/${current.targets.length}.`,
    `- Comparaison : ${receipts.length}/${current.targets.length} cible(s), zéro diff inattendu.`,
    '- Idempotence : verte, second apply intégralement no-op.',
    `- Décisions owner : ${receipts.filter((receipt) => receipt.ownerDecision === 'accepted').length} accepted, ${receipts.filter((receipt) => receipt.ownerDecision === 'refused').length} refused.`,
    `- Consommateurs partagés : ${current.consumerImpacts.length}/${current.consumerImpacts.length} clos.`, '',
    ...receipts.map((receipt) => `- \`${receipt.targetId}\` — ${receipt.ownerDecision} — \`${receipt.receiptId}\``), '',
  ].join('\n'));
  console.log(`component:repair finalized — ${receipts.length}/${current.targets.length} schema-valid receipt(s), state ${terminal.value.state}`);
}

/**
 * Generate a campaign manifest from an existing relevé.
 *
 * The generator is pure, so this is where the filesystem lives: read the relevé, read
 * the bounded documents the relevé NAMES, hand both to the generator, write what comes
 * back. A reference that is not on disk is simply not linked — the generator then
 * names whatever it could not deduce from it, which is the honest outcome.
 */
function generateManifest(relevePath: string, outPath: string, componentId?: string): void {
  const releve = readJsonOrFail(relevePath, 'relevé', 'releve-unreadable');
  const absolute = path.resolve(process.cwd(), relevePath);

  const linked: Record<string, unknown> = {};
  for (const reference of linkedReferencesOf(releve)) {
    const linkedPath = path.resolve(process.cwd(), reference);
    if (!existsSync(linkedPath)) continue;
    try { linked[reference] = JSON.parse(readFileSync(linkedPath, 'utf8')); } catch { /* an unreadable reference is not a linked document */ }
  }

  const normalizedReleve = path.relative(process.cwd(), absolute);
  const generated = generateRepairCampaign(releve, { sourceReleve: normalizedReleve, componentId }, linked);
  if (!generated.ok) fail(`${generated.refusal}: ${generated.message}`, 1);

  const output = path.resolve(process.cwd(), outPath);
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(generated.campaign, null, 2)}\n`);
  const reportPath = path.join(path.dirname(output), 'manifest-report.json');
  writeFileSync(reportPath, `${JSON.stringify(generated.report, null, 2)}\n`);

  console.log(`component:repair manifest generated — ${generated.report.targetId}, set ${generated.report.setNodeId}, ${generated.report.memberCount} member(s), ${generated.report.usageCount} usage(s) by position, ${path.relative(process.cwd(), output)}`);
  console.log(`component:repair manifest report — ${generated.report.nonDeductible.length} field(s) NOT deducible from the relevé, named in ${path.relative(process.cwd(), reportPath)}:`);
  for (const entry of generated.report.nonDeductible) console.log(`  · ${entry}`);
}

/**
 * Generate the owner decision board of one section: `board.bridge.js` + `zones.json`.
 *
 * Reads every `*.json` of the decision directory that carries a `pickerConsequence` —
 * the shared-directory rule of E8 applies here too, so a wave's directory holding
 * twelve sections' decisions is normal and the neighbours are simply not this board's.
 * Executing the script is out of scope by design: 030 mutates no canvas.
 */
function generateBoard(decisionsDir: string, witnessesPath: string, usagesPath: string, outDir: string): void {
  const decisions = readDecisionDirectory(decisionsDir, 'board-input-unreadable')
    .map((entry) => entry.value)
    .filter((value): value is Record<string, unknown> =>
      typeof value === 'object' && value !== null && typeof (value as Record<string, unknown>).pickerConsequence === 'string');
  if (decisions.length === 0) fail(`board-input-unreadable: no design decision in ${decisionsDir} carries a pickerConsequence`);

  const board = generateDecisionBoard({
    decisions: decisions as never,
    witnesses: readJsonOrFail(witnessesPath, 'witness manifest', 'board-input-unreadable') as never,
    usages: readJsonOrFail(usagesPath, 'usage inventory', 'board-input-unreadable') as never,
  });
  if (!board.ok) fail(`${board.refusal}: ${board.message}`, 1);

  const root = path.resolve(process.cwd(), outDir);
  mkdirSync(root, { recursive: true });
  writeFileSync(path.join(root, 'zones.json'), `${JSON.stringify(board.zones, null, 2)}\n`);
  writeFileSync(path.join(root, 'board.bridge.js'), board.script);
  const zoneCount = Object.keys(board.zones.zones).length;
  console.log(`component:repair board generated — ${board.zones.boardName}, ${zoneCount} zones, ${decisions.length} decision(s), ${path.relative(process.cwd(), root)}`);
  console.log('component:repair board checks — ' + Object.entries(board.zones.checks).map(([check, value]) => `${check}=${String(value)}`).join(', '));
  console.log('component:repair board — the script is NOT executed here; the live pass belongs to the wave spec (§X applies there).');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { console.log(usage); return; }
  const actionMatches = actions.filter((candidate) => args.includes(candidate));
  const action = actionMatches[0];
  const take = (name: string): string | undefined => {
    const index = args.indexOf(name);
    if (index < 0) return undefined;
    const value = args[index + 1];
    args.splice(index, 2);
    return value;
  };
  const campaignPath = take('--campaign');
  const targets = take('--targets')?.split(',').filter(Boolean);
  const receiptPath = take('--receipt');
  const bridgeResultPath = take('--bridge-result');
  const run = take('--run');
  const backupRef = take('--backup-ref');
  const captureMode = take('--capture-mode');
  const relevePath = take('--releve');
  const outPath = take('--out');
  const componentId = take('--component');
  const decisionsDir = take('--decisions');
  const witnessesPath = take('--witnesses');
  const usagesPath = take('--usages');
  // Generation runs BEFORE a campaign exists, so it is the one action with no
  // --campaign. It stays in this binary rather than behind a wrapper script: the
  // manifest it writes is read back by `readCampaign` two lines below in the workflow.
  if (args.length === 1 && args[0] === '--generate-manifest') {
    if (!relevePath || !outPath) fail('generate-manifest requires --releve and --out');
    return generateManifest(relevePath, outPath, componentId);
  }
  // The board is computed from decisions and witnesses, not from a campaign: it is the
  // surface the owner decides ON, so it exists before the campaign is applied.
  if (args.length === 1 && args[0] === '--generate-board') {
    if (!decisionsDir || !witnessesPath || !usagesPath || !outPath) fail('generate-board requires --decisions, --witnesses, --usages and --out');
    return generateBoard(decisionsDir, witnessesPath, usagesPath, outPath);
  }
  if (!campaignPath || !action || actionMatches.length !== 1 || args.length !== 1 || args[0] !== action) fail('exactly one action and --campaign are required');
  if (action === '--audit') return audit(campaignPath);
  if (action === '--snapshot-source') {
    if (!backupRef) fail('snapshot-source requires --backup-ref');
    return snapshotSource(campaignPath, backupRef);
  }
  if (action === '--record-apply') {
    if (!receiptPath || !['first', 'second'].includes(String(run))) fail('record-apply requires --run first|second and --receipt');
    return recordApply(campaignPath, receiptPath, run as 'first' | 'second');
  }
  if (action === '--emit-bridge-script') {
    if (!['first', 'second'].includes(String(run))) fail('emit-bridge-script requires --run first|second');
    return emitBridgeScript(campaignPath, run as 'first' | 'second');
  }
  if (action === '--normalize-apply') {
    if (!bridgeResultPath || !receiptPath || !['first', 'second'].includes(String(run))) fail('normalize-apply requires --run first|second, --bridge-result and --receipt');
    return normalizeApply(campaignPath, bridgeResultPath, receiptPath, run as 'first' | 'second');
  }
  if (action === '--preflight') return preflight(campaignPath);
  if (action === '--capture-before') return capture(campaignPath, 'before', captureMode);
  if (action === '--capture-after') return capture(campaignPath, 'after', captureMode);
  if (action === '--capture-idempotence') return capture(campaignPath, 'idempotence', captureMode);
  if (action === '--verify-idempotence') return verifyIdempotence(campaignPath);
  if (action === '--verify') return verify(campaignPath);
  if (action === '--finalize') return finalize(campaignPath);
  if (action === '--dry-run') return dryRun(campaignPath, targets);
  // Every member of `actions` is dispatched above; this is the defensive
  // backstop for an action added to the tuple without its handler.
  fail(`unhandled action ${action}`, 1);
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error), 1));
