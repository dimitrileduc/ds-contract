#!/usr/bin/env node
/**
 * Campaign driver — the eighteen steps of the component-repair workflow in ONE
 * invocation, with a journal, a stop at the first refusal, and a resume.
 *
 * 029 ran the chain by hand: thirteen CLI invocations plus the bridge round trips, for
 * one section. Twelve sections is ~156 of them. This script types them for you.
 *
 * What it does NOT do, deliberately (research R4): implement a single gate. Every
 * refusal in the chain belongs to the runner — the state machine, the preflight, the
 * receipt gates, the no-op gate, finalize. The driver invokes them and reports their
 * verdicts verbatim. Two authorities on the same question is how they drift apart.
 *
 * The one thing that IS the driver's own: the order, and the rule that a write step is
 * never reached without its dry-run. That is sequencing, and sequencing is the job.
 *
 * The chain is the one written in `docs/internal/component-repair-workflow.md`
 * § "Ordre obligatoire". It is not re-derived here.
 */
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * The ordered chain for one campaign. Pure: paths in, steps out, no filesystem.
 * `backupRef` is optional — a campaign that already carries its source baseline does
 * not re-snapshot, and the step is simply absent from the chain rather than faked.
 */
export function driveSteps({ campaignPath, paths, fileKey, captureMode, backupRef }) {
  const repair = (...argv) => ['npm', ['run', '--silent', 'component:repair', '--', '--campaign', campaignPath, ...argv]];
  const bridge = (script, output) => ['node', ['scripts/component-repair-bridge.mjs', '--script', script, '--output', output, '--file-key', fileKey]];
  const mode = captureMode ? ['--capture-mode', captureMode] : [];

  const chain = [];
  chain.push({ action: 'audit', kind: 'read', command: repair('--audit') });
  if (backupRef) chain.push({ action: 'snapshot-source', kind: 'write', command: repair('--snapshot-source', '--backup-ref', backupRef) });
  chain.push({ action: 'preflight', kind: 'read', command: repair('--preflight') });
  chain.push({ action: 'capture-before', kind: 'read', command: repair('--capture-before', ...mode) });
  chain.push({ action: 'dry-run', kind: 'dry-run', command: repair('--dry-run') });
  for (const run of ['first', 'second']) {
    const script = run === 'first' ? paths.bridgeScripts.first : paths.bridgeScripts.second;
    const raw = `${script.replace(/\.js$/, '')}.raw.json`;
    const receipt = run === 'first' ? paths.applyReceipts.first : paths.applyReceipts.second;
    chain.push({ action: `emit-bridge-script-${run}`, kind: 'dry-run', command: repair('--emit-bridge-script', '--run', run) });
    chain.push({ action: `bridge-${run}`, kind: 'write', command: bridge(script, raw) });
    chain.push({ action: `normalize-apply-${run}`, kind: 'write', command: repair('--normalize-apply', '--run', run, '--bridge-result', raw, '--receipt', receipt) });
    chain.push({ action: `record-apply-${run}`, kind: 'write', command: repair('--record-apply', '--run', run, '--receipt', receipt) });
    if (run === 'first') {
      chain.push({ action: 'capture-after', kind: 'read', command: repair('--capture-after', ...mode) });
      chain.push({ action: 'verify', kind: 'read', command: repair('--verify') });
    } else {
      chain.push({ action: 'capture-idempotence', kind: 'read', command: repair('--capture-idempotence', ...mode) });
      chain.push({ action: 'verify-idempotence', kind: 'read', command: repair('--verify-idempotence') });
    }
  }
  chain.push({ action: 'finalize', kind: 'write', command: repair('--finalize') });
  return chain.map((entry, index) => ({ step: index + 1, ...entry }));
}

/**
 * Read the paths the campaign DECLARES. The runner validates the manifest; this only
 *  needs to know where it puts things, so a parse is enough and a second validation
 *  would be a second authority.
 *
 * It invents nothing. `workflowPaths` (extract/figma/projection-repair/workflow.ts) is
 * the one router, and the only default it applies that this driver can safely restate
 * is the bridge-script pair under the evidence root — everything else the CLI reads
 * from `workflow`, so a driver that guessed `.` or `receipts/apply-first.json` would
 * hand the bridge a path the CLI never wrote and fail on a path mismatch instead of on
 * a gate. A campaign that does not declare its route is refused BY NAME here.
 */
export function campaignPaths(campaign) {
  const roots = campaign.artifactRoots;
  const workflow = campaign.workflow;
  const evidenceRoot = workflow?.evidenceRoot;
  if (!evidenceRoot || !workflow.applyReceiptPaths?.first || !workflow.applyReceiptPaths?.second) {
    throw new Error('drive-campaign-unroutable: the driver chains a component-workflow v2 manifest, which declares workflow.evidenceRoot and workflow.applyReceiptPaths');
  }
  return {
    evidenceRoot,
    bridgeScripts: roots?.bridgeScripts ?? {
      first: path.posix.join(evidenceRoot, 'bridge-first.js'),
      second: path.posix.join(evidenceRoot, 'bridge-second.js'),
    },
    applyReceipts: workflow.applyReceiptPaths,
  };
}

/** The steps already green in a journal, newest entry winning. */
export function greenActions(journalText) {
  const verdicts = new Map();
  for (const line of journalText.split('\n')) {
    if (!line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    if (entry && typeof entry.action === 'string') verdicts.set(entry.action, entry.verdict);
  }
  return new Set([...verdicts].filter(([, verdict]) => verdict === 'green' || verdict === 'skipped-already-green').map(([action]) => action));
}

const defaultExec = ({ command }) => {
  const [bin, argv] = command;
  const result = spawnSync(bin, argv, { encoding: 'utf8', cwd: process.cwd(), env: process.env });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  if (result.error) return { status: 1, output: String(result.error.message ?? result.error) };
  return { status: result.status ?? 1, output };
};

/**
 * Run the chain.
 *
 * `exec` and `now` are injected so the whole thing is testable without a Figma bridge:
 * the driver's own contract is the ordering, the journal and the refusal handling, and
 * none of those need a canvas to be wrong.
 *
 * Returns `{ code, entries }` — 0 green, 2 a named refusal, 3 an interruption.
 */
export function runDrive({
  campaignPath,
  campaign,
  fileKey,
  captureMode,
  backupRef,
  until,
  resume = false,
  journalPath,
  exec = defaultExec,
  now = () => new Date().toISOString(),
  log = () => {},
}) {
  const paths = campaignPaths(campaign);
  const steps = driveSteps({ campaignPath, paths, fileKey, captureMode, backupRef });
  if (until && !steps.some((step) => step.action === until)) {
    return { code: 2, entries: [], refusal: `drive-unknown-action: --until ${until} names no step of the chain (${steps.map((step) => step.action).join(', ')})` };
  }

  const alreadyGreen = resume && journalPath && existsSync(journalPath)
    ? greenActions(readFileSync(journalPath, 'utf8'))
    : new Set();
  if (journalPath) mkdirSync(path.dirname(journalPath), { recursive: true });
  if (journalPath && !resume) writeFileSync(journalPath, '');

  const entries = [];
  const record = (entry) => {
    entries.push(entry);
    if (journalPath) appendFileSync(journalPath, `${JSON.stringify(entry)}\n`);
    log(entry);
  };

  // The driver's own invariant: no write without its dry-run. On a resume this is what
  // stops a chain from restarting straight at a bridge run because the journal happened
  // to end there.
  let dryRunGreen = false;

  for (const step of steps) {
    if (step.kind === 'dry-run' && alreadyGreen.has(step.action)) dryRunGreen = true;
    // A DEFENSIVE BACKSTOP, and named as one rather than sold as the guarantee.
    //
    // "No write without its dry-run" is actually carried by two things above it: the
    // chain puts `dry-run` before every write, and the loop returns at the first
    // refusal. Between them, no reachable path arrives at a write with `dryRunGreen`
    // false — either the dry-run ran green, or it was already green, or the chain
    // stopped there. So this branch is unreachable today, on purpose: it exists so that
    // a future reordering of the chain fails CLOSED instead of quietly posing a
    // mutation whose plan was never accepted. It sits before the already-green skip for
    // the same reason — a journal claiming a write is green must not walk past it.
    //
    // `snapshot-source` is the one write that legitimately precedes the plan: it is what
    // makes the source recoverable in the first place.
    if (step.kind === 'write' && !dryRunGreen && step.action !== 'snapshot-source') {
      const refusal = `drive-write-without-dry-run: ${step.action} was reached with no green dry-run before it`;
      record({ step: step.step, action: step.action, startedAt: now(), endedAt: now(), verdict: 'refused', refusal });
      return { code: 2, entries, refusal };
    }
    if (alreadyGreen.has(step.action)) {
      record({ step: step.step, action: step.action, startedAt: now(), endedAt: now(), verdict: 'skipped-already-green' });
      if (until && step.action === until) return { code: 0, entries };
      continue;
    }

    const startedAt = now();
    let result;
    try { result = exec(step); }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      record({ step: step.step, action: step.action, startedAt, endedAt: now(), verdict: 'refused', refusal: message });
      return { code: 3, entries, refusal: message };
    }
    const endedAt = now();

    if (result.status === 0) {
      if (step.kind === 'dry-run') dryRunGreen = true;
      record({ step: step.step, action: step.action, startedAt, endedAt, verdict: 'green' });
      if (until && step.action === until) return { code: 0, entries };
      continue;
    }
    // The refusal is the runner's, quoted verbatim. The driver adds nothing to it and
    // does not try to classify it: naming refusals is the runner's job.
    const refusal = (result.output ?? '').trim() || `${step.action} exited ${result.status} with no output`;
    record({ step: step.step, action: step.action, startedAt, endedAt, verdict: 'refused', refusal });
    return { code: 2, entries, refusal };
  }

  return { code: 0, entries };
}

/* ------------------------------------------------------------------ shell */

function main() {
  const args = process.argv.slice(2);
  const take = (name) => {
    const index = args.indexOf(name);
    if (index < 0) return undefined;
    const value = args[index + 1];
    args.splice(index, 2);
    return value;
  };
  const flag = (name) => {
    const index = args.indexOf(name);
    if (index < 0) return false;
    args.splice(index, 1);
    return true;
  };
  const campaignPath = take('--campaign');
  const captureMode = take('--capture-mode');
  const until = take('--until');
  const backupRef = take('--backup-ref');
  const journalOverride = take('--journal');
  const resume = flag('--resume');
  if (!campaignPath || args.length !== 0) {
    console.error('Usage: node scripts/component-repair-drive.mjs --campaign <campaign.json> [--capture-mode full|light] [--until <action>] [--backup-ref <ref>] [--resume] [--journal <path>]');
    process.exit(2);
  }
  const absolute = path.resolve(process.cwd(), campaignPath);
  if (!existsSync(absolute)) { console.error(`component:repair drive refused — campaign not found: ${campaignPath}`); process.exit(2); }
  const campaign = JSON.parse(readFileSync(absolute, 'utf8'));
  const paths = campaignPaths(campaign);
  const journalPath = path.resolve(process.cwd(), journalOverride ?? path.posix.join(paths.evidenceRoot, 'drive-journal.jsonl'));

  const { code, entries, refusal } = runDrive({
    campaignPath, campaign, fileKey: campaign.filePin?.fileKey, captureMode, backupRef, until, resume, journalPath,
    log: (entry) => {
      const mark = entry.verdict === 'green' ? '✔' : entry.verdict === 'skipped-already-green' ? '·' : '✖';
      console.log(`${mark} ${String(entry.step).padStart(2, ' ')} ${entry.action} — ${entry.verdict}`);
    },
  });

  console.log(`component:repair drive — ${entries.filter((entry) => entry.verdict === 'green').length} green, ${entries.filter((entry) => entry.verdict === 'skipped-already-green').length} already green, journal ${path.relative(process.cwd(), journalPath)}`);
  if (refusal) console.error(refusal);
  process.exit(code);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) main();
