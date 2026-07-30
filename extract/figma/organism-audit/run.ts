/**
 * CLI of the organism audit (013) — `npm run audit:organisms`.
 *
 * Two properties are structural rather than promised:
 *
 *   1. There is NO Figma write path anywhere in this module tree.  Every Figma
 *      route is an HTTP GET; no `POST`/`PUT`/`PATCH`/`DELETE`, no
 *      `figma_execute`, no writeback, no push (FR-009, receipted by T026).
 *   2. Every output resolves under the campaign's own `proofs/` root, checked
 *      before a single directory is created.
 *
 * Modes that are not implemented yet REFUSE by name with exit 2.  Silently
 * succeeding on an unimplemented capture would be the exact failure this whole
 * feature exists to prevent: an absence presented as a conformity.
 *
 * Reference: contracts/audit-campaign.interface.md (CLI), quickstart.md,
 * tasks.md T020/T021/T025/T026.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  validateAuditCampaign,
  validateAuditOutputPath,
  type AuditCampaign,
  type AuditIssue,
  type DependencyGateDeclaration,
} from './campaign.js';
import { evaluateDependencyGate, type DependencyGateResult } from './dependencies.js';
import { diffBaseline, inventoryLiterals, verifyNonConversion } from './baseline.js';
import { resolveGeneratedComponent } from './render-react.js';

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..');
const CAMPAIGN_PROOF_ROOT = path.join(
  REPO_ROOT,
  'specs',
  '013-auditer-fidelite-organismes',
  'proofs',
);

interface Cli {
  campaign: string | null;
  out: string | null;
  check: boolean;
  inventory: boolean;
  wave: 1 | 2 | 3 | null;
  refresh: boolean;
  checkDependencies: boolean;
  captureBaseline: boolean;
  verifyReport: boolean;
  verifyDeferredScope: boolean;
}

function parseArgs(argv: string[]): Cli {
  const cli: Cli = {
    campaign: null,
    out: null,
    check: false,
    inventory: false,
    wave: null,
    refresh: false,
    checkDependencies: false,
    captureBaseline: false,
    verifyReport: false,
    verifyDeferredScope: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--campaign':
        cli.campaign = argv[++index] ?? null;
        break;
      case '--out':
        cli.out = argv[++index] ?? null;
        break;
      case '--check':
        cli.check = true;
        break;
      case '--inventory':
        cli.inventory = true;
        break;
      case '--wave': {
        const value = Number(argv[++index]);
        if (value !== 1 && value !== 2 && value !== 3) fail(`--wave must be 1, 2 or 3; got ${String(value)}`);
        cli.wave = value;
        break;
      }
      case '--refresh':
        cli.refresh = true;
        break;
      case '--check-dependencies':
        cli.checkDependencies = true;
        break;
      case '--capture-baseline':
        cli.captureBaseline = true;
        break;
      case '--verify-report':
        cli.verifyReport = true;
        break;
      case '--verify-deferred-scope':
        cli.verifyDeferredScope = true;
        break;
      default:
        // Legacy subject filters belong to the 011 runner and are incompatible
        // with a declared campaign perimeter.
        fail(`unknown or incompatible option: ${arg}`);
    }
  }
  return cli;
}

function fail(message: string): never {
  process.stderr.write(`REFUSED — ${message}\n`);
  process.exit(2);
}

const sha256 = (bytes: Buffer | string): string =>
  createHash('sha256').update(bytes).digest('hex');

function readJson(absolute: string): unknown {
  return JSON.parse(readFileSync(absolute, 'utf8')) as unknown;
}

/** Every file under a directory, sorted, for a stable tree hash. */
function filesUnder(absolute: string, filter: (name: string) => boolean): string[] {
  const found: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (filter(entry.name)) found.push(full);
    }
  };
  if (existsSync(absolute)) walk(absolute);
  return found.sort();
}

function treeSha256(files: string[]): string {
  const digest = createHash('sha256');
  for (const file of files) {
    digest.update(path.relative(REPO_ROOT, file));
    digest.update('\0');
    digest.update(readFileSync(file));
    digest.update('\0');
  }
  return digest.digest('hex');
}

function writeReceipt(outRoot: string, relative: string, body: unknown): string {
  const target = path.join(outRoot, relative);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(body, null, 2)}\n`);
  return path.relative(REPO_ROOT, target);
}

/**
 * Cross-check the manifest against what is actually on disk.  The document can
 * declare a contract version; only the parsed contract can confirm it.
 */
function verifyAgainstDisk(campaign: AuditCampaign): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const [index, subject] of campaign.subjects.entries()) {
    const at = `$.subjects[${index}]`;
    const contractPath = path.join(REPO_ROOT, subject.contractPath);
    if (!existsSync(contractPath)) {
      issues.push({ code: 'subject-contract', path: at, message: `contract not found: ${subject.contractPath}` });
      continue;
    }
    const contract = readJson(contractPath) as {
      id?: string;
      version?: string;
      anchors?: { figma?: { fileKey?: string; nodeId?: string } };
    };
    if (contract.id !== subject.contractId) {
      issues.push({
        code: 'subject-contract',
        path: at,
        message: `contract id on disk is "${String(contract.id)}", manifest says "${subject.contractId}"`,
      });
    }
    if (contract.version !== subject.contractVersion) {
      issues.push({
        code: 'subject-contract',
        path: at,
        message: `${subject.contractId} is at v${String(contract.version)} on disk, manifest pins v${subject.contractVersion}`,
      });
    }
    const anchor = contract.anchors?.figma;
    if (anchor?.fileKey !== campaign.reference.fileKey) {
      issues.push({
        code: 'subject-set-node',
        path: at,
        message: `${subject.contractId} anchors to fileKey ${String(anchor?.fileKey)}, campaign pins ${campaign.reference.fileKey}`,
      });
    }
    if (anchor?.nodeId !== subject.figmaSetNodeId) {
      issues.push({
        code: 'subject-set-node',
        path: at,
        message: `${subject.contractId} anchors to node ${String(anchor?.nodeId)}, manifest declares ${subject.figmaSetNodeId}`,
      });
    }
    for (const ref of subject.auditRefs) {
      if (!existsSync(path.join(REPO_ROOT, ref))) {
        issues.push({ code: 'subject-audit-refs', path: at, message: `audit ref not found: ${ref}` });
      }
    }
    // D4 — the proved surface must actually exist under src/components.
    const resolved = resolveGeneratedComponent({
      contractId: subject.contractId,
      sourceRoot: path.join(REPO_ROOT, campaign.generatedSurface.sourceRoot),
    });
    if (!resolved.ok) {
      issues.push({
        code: 'generated-surface',
        path: at,
        message: `no generated React component for ${subject.contractId}: ${resolved.reasons.join('; ')}`,
      });
    }
  }
  if (!existsSync(path.join(REPO_ROOT, campaign.assetsManifest))) {
    issues.push({ code: 'assets-manifest', path: '$.assetsManifest', message: `not found: ${campaign.assetsManifest}` });
  }
  return issues;
}

/**
 * The census gate.  A subject with no required facts and no cases has declared
 * nothing to prove, so the campaign cannot be run against it — refusing here is
 * the fail-closed behaviour, and it is a receipt in its own right.
 */
function inventoryGaps(campaign: AuditCampaign): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const [index, subject] of campaign.subjects.entries()) {
    const at = `$.subjects[${index}]`;
    if (subject.coverage.requiredFactIds.length === 0) {
      issues.push({
        code: 'coverage-missing',
        path: `${at}.coverage.requiredFactIds`,
        message: `${subject.id} declares no required fact — nothing would be proved`,
      });
    }
    // A wave-3 subject may legitimately carry no case while its gate is closed;
    // waves 1 and 2 have no such excuse.
    if (subject.cases.length === 0 && subject.dependencyId === null) {
      issues.push({
        code: 'case-shape',
        path: `${at}.cases`,
        message: `${subject.id} declares no audit case`,
      });
    }
  }
  return issues;
}

function checkDependencies(campaign: AuditCampaign, outRoot: string, write: boolean): {
  results: DependencyGateResult[];
  paths: string[];
} {
  const results: DependencyGateResult[] = [];
  const paths: string[] = [];
  for (const gate of campaign.dependencyGates as DependencyGateDeclaration[]) {
    const receiptPath = path.join(REPO_ROOT, gate.resultPath);
    const receiptBytes = existsSync(receiptPath) ? readFileSync(receiptPath) : null;

    const dependencyContract = path.join(
      REPO_ROOT,
      'contracts',
      `${gate.dependencyContractId.replace(/^ds\./, '')}.contract.json`,
    );
    const actualContractVersion = existsSync(dependencyContract)
      ? ((readJson(dependencyContract) as { version?: string }).version ?? null)
      : null;

    const result = evaluateDependencyGate({
      gate,
      receiptBytes,
      actualContractVersion,
      currentFigmaFileVersion: campaign.reference.fileVersion,
    });
    results.push(result);
    if (write) {
      paths.push(writeReceipt(outRoot, path.join('dependencies', `${gate.parentSubjectId}.json`), result));
    }
  }
  return { results, paths };
}

function captureBaseline(campaign: AuditCampaign, outRoot: string): string[] {
  const written: string[] = [];

  // Every governed contract, not only the twelve targets: a literal held by a
  // composed CHILD is in scope when it causes an observed divergence (FR-020).
  const contractFiles = filesUnder(path.join(REPO_ROOT, 'contracts'), (name) =>
    name.endsWith('.contract.json'),
  );
  const contractsById: Record<string, unknown> = {};
  for (const file of contractFiles) {
    const parsed = readJson(file) as { id?: string };
    if (typeof parsed.id === 'string') contractsById[parsed.id] = parsed;
  }

  const tokenFiles = filesUnder(path.join(REPO_ROOT, 'tokens'), (name) => name.endsWith('.json'));
  const tokenFoundation: Record<string, string> = {};
  for (const file of tokenFiles) {
    tokenFoundation[path.relative(REPO_ROOT, file)] = sha256(readFileSync(file));
  }

  const inventory = inventoryLiterals(contractsById);
  const baseline = { ...inventory, tokenFoundation };
  // Diffed against itself: the receipt must publish the three lists the
  // quickstart asserts with `jq -e`, and at baseline they are all empty.
  const diff = diffBaseline(baseline, baseline);
  const verdict = verifyNonConversion(diff);

  written.push(
    writeReceipt(outRoot, path.join('baseline', 'hardcoded-values.json'), {
      schemaVersion: 1,
      campaignId: campaign.id,
      contractsTreeSha256: treeSha256(contractFiles),
      tokensTreeSha256: treeSha256(tokenFiles),
      literalInventory: inventory.literalInventory,
      tokenBindingInventory: inventory.tokenBindingInventory,
      tokenFoundation,
      literalToTokenConversions: diff.literalToTokenConversions,
      tokenFoundationChanges: diff.tokenFoundationChanges,
      localContractCorrections: diff.localContractCorrections,
      nonConversionOk: verdict.ok,
      reasons: verdict.reasons,
      note:
        'The live inventory is authoritative. The prose figure 89 is never used to conceal an inventory mismatch.',
    }),
  );

  const bundles = campaign.subjects.map((subject) => {
    const resolved = resolveGeneratedComponent({
      contractId: subject.contractId,
      sourceRoot: path.join(REPO_ROOT, campaign.generatedSurface.sourceRoot),
    });
    return resolved.ok
      ? { subjectId: subject.id, contractId: subject.contractId, ...resolved.ref }
      : { subjectId: subject.id, contractId: subject.contractId, unresolved: resolved.reasons };
  });

  written.push(
    writeReceipt(outRoot, path.join('baseline', 'react-bundle.json'), {
      schemaVersion: 1,
      campaignId: campaign.id,
      sourceRoot: campaign.generatedSurface.sourceRoot,
      generatedTreeSha256: treeSha256(
        filesUnder(path.join(REPO_ROOT, 'src', 'components'), (name) => /\.(tsx|ts|css)$/.test(name)),
      ),
      components: bundles,
    }),
  );

  return written;
}

// ---------------------------------------------------------------------------

const cli = parseArgs(process.argv.slice(2));
if (cli.campaign === null) fail('--campaign <path> is required');

const campaignPath = path.resolve(REPO_ROOT, cli.campaign);
if (!existsSync(campaignPath)) fail(`campaign manifest not found: ${cli.campaign}`);

const outRequested = cli.out === null ? CAMPAIGN_PROOF_ROOT : path.resolve(REPO_ROOT, cli.out);
const bounded = validateAuditOutputPath(outRequested, CAMPAIGN_PROOF_ROOT);
if (!bounded.ok) {
  for (const issue of bounded.issues) process.stderr.write(`REFUSED — ${issue.code}: ${issue.message}\n`);
  process.exit(2);
}
const outRoot = bounded.outputPath;

const campaignBytes = readFileSync(campaignPath);
let parsed: unknown;
try {
  parsed = JSON.parse(campaignBytes.toString('utf8')) as unknown;
} catch (error) {
  fail(`campaign manifest is not valid JSON: ${(error as Error).message}`);
}

const assetManifestPath = path.join(REPO_ROOT, 'extract/figma/visual-parity/fixture-assets/manifest.json');
const assetManifest = existsSync(assetManifestPath)
  ? (readJson(assetManifestPath) as { assets: Array<{ id: string; sha256?: string }> })
  : null;

const validation = validateAuditCampaign(parsed, { assetManifest });
const issues: AuditIssue[] = validation.ok ? [] : [...validation.issues];
const campaign = parsed as AuditCampaign;

// Shape, perimeter, waves, thresholds, receipt schemas and output bounding are
// all proven BEFORE anything touches the disk or the network.
if (issues.length === 0) issues.push(...verifyAgainstDisk(campaign));

const censusIssues = cli.inventory ? inventoryGaps(campaign) : [];

// Modes whose implementation does not exist yet refuse by name rather than
// reporting a success they did not earn.
const unimplemented: string[] = [];
if (cli.wave !== null) unimplemented.push('--wave');
if (cli.refresh) unimplemented.push('--refresh');
if (cli.verifyReport) unimplemented.push('--verify-report');
if (cli.verifyDeferredScope) unimplemented.push('--verify-deferred-scope');

const writtenPaths: string[] = [];
let dependencyResults: DependencyGateResult[] = [];

// `--check` writes no proof artifact, by contract.
const mayWrite = !cli.check && issues.length === 0;

if (cli.checkDependencies && issues.length === 0) {
  const outcome = checkDependencies(campaign, outRoot, mayWrite);
  dependencyResults = outcome.results;
  writtenPaths.push(...outcome.paths);
}
if (cli.captureBaseline && mayWrite) {
  writtenPaths.push(...captureBaseline(campaign, outRoot));
}

const allIssues = [...issues, ...censusIssues];
const exitCode = allIssues.length > 0 || unimplemented.length > 0 ? 2 : 0;

const report = {
  schemaVersion: 1,
  campaignId: campaign.id ?? null,
  mode: {
    check: cli.check,
    inventory: cli.inventory,
    wave: cli.wave,
    refresh: cli.refresh,
    checkDependencies: cli.checkDependencies,
    captureBaseline: cli.captureBaseline,
    verifyReport: cli.verifyReport,
    verifyDeferredScope: cli.verifyDeferredScope,
  },
  reference: {
    fileKey: campaign.reference?.fileKey ?? null,
    fileVersion: campaign.reference?.fileVersion ?? null,
    readOnly: campaign.reference?.readOnly ?? null,
    httpMethodsUsed: [],
    figmaWriteCommands: [],
  },
  inputHashes: { campaign: sha256(campaignBytes) },
  outputRoot: path.relative(REPO_ROOT, outRoot),
  validation: {
    shapeAndPerimeter: validation.ok,
    issues: allIssues,
  },
  dependencyGates: dependencyResults,
  unimplementedModes: unimplemented,
  writtenPaths,
  exitCode,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

for (const issue of allIssues) {
  process.stderr.write(`REFUSED — ${issue.code} @ ${issue.path}: ${issue.message}\n`);
}
for (const mode of unimplemented) {
  process.stderr.write(
    `REFUSED — ${mode} is not implemented yet: the capture layer (Figma GET census + Chromium render) is not built. ` +
      'Refusing rather than reporting an unearned success.\n',
  );
}
process.exit(exitCode);
