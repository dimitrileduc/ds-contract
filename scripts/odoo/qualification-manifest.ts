import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { sha256 } from './lib/canonical.js';
import { arg, runAsCli } from './lib/cli.js';
import { validateOrThrow } from './lib/schemas.js';

const REQUIRED = [
  'editability-boundary', 'google-reviews-functional', 'google-reviews-security', 'google-reviews-visual',
  'presentation-functional-security', 'presentation-visual', 'presentation-performance-security',
  'install-update', 'version-policy', 'authorization', 'combined-isolation', 'visual-summary', 'quickstart-run',
];
const ACCEPTED_LIMITS = new Set(['ODOO-LIMIT-PERFORMANCE-NON-MEASURED']);

interface Receipt { receiptId: string; scenarioId: string; snapshotId: string; status: 'pass' | 'fail' | 'skipped'; fixture: string; observations: string[]; artifacts: Array<{ path: string; sha256: string; kind?: string }>; limitCodes: string[]; durationMs?: number }

export function buildManifest(proofsDir: string) {
  const receipts: Receipt[] = [];
  for (const name of readdirSync(proofsDir).filter((name) => name.endsWith('.json')).sort()) {
    const file = path.join(proofsDir, name);
    let value: any;
    try { value = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
    if (!value?.receiptId || !value?.scenarioId || !['pass', 'fail', 'skipped'].includes(value.status)) continue;
    receipts.push(value as Receipt);
  }
  for (const receipt of receipts) {
    for (const artifact of receipt.artifacts) {
      if (!existsSync(artifact.path)) throw new Error(`${receipt.scenarioId}: artefact absent ${artifact.path}`);
      const actual = sha256(readFileSync(artifact.path));
      if (actual !== artifact.sha256) throw new Error(`${receipt.scenarioId}: hash incohérent ${artifact.path}`);
    }
  }
  const byScenario = new Map(receipts.map((receipt) => [receipt.scenarioId, receipt]));
  const missing = REQUIRED.filter((id) => !byScenario.has(id));
  const failed = receipts.filter((receipt) => receipt.status === 'fail');
  const skipped = receipts.filter((receipt) => receipt.status === 'skipped');
  const limitCodes = [...new Set(receipts.flatMap((receipt) => receipt.limitCodes))].sort();
  const limits = limitCodes.map((code) => ({ code, scope: code.includes('PERFORMANCE') ? 'interaction' : 'odoo', description: code === 'ODOO-LIMIT-PERFORMANCE-NON-MEASURED' ? 'Latence de geste non mesurée ; aucun p95 revendiqué.' : `Limite déclarée par un reçu : ${code}`, accepted: ACCEPTED_LIMITS.has(code) }));
  const hasUnaccepted = limits.some((limit) => !limit.accepted);
  const releaseStatus = failed.length || hasUnaccepted ? 'failed' : missing.length || skipped.length ? 'incomplete' : limits.length ? 'qualified-with-limits' : 'qualified';
  const manifest = {
    schemaVersion: '1.0.0', manifestId: 'odoo-019-qualification', snapshotId: 'odoo-019-foundation', moduleVersion: '19.0.1.0.1',
    environment: { odooImage: 'odoo:19.0-20260803', postgresImage: 'postgres:15', browser: 'Chromium 151.0.7922.34', viewport: { width: 1728, height: 504, deviceScaleFactor: 2 }, locale: 'fr-FR' },
    requiredScenarios: REQUIRED, receipts: receipts.sort((a, b) => a.scenarioId.localeCompare(b.scenarioId)), limits, releaseStatus,
  };
  validateOrThrow('qualification-manifest', manifest, 'qualification-manifest.json');
  return { manifest, missing, failed: failed.map((r) => r.scenarioId), skipped: skipped.map((r) => r.scenarioId) };
}

async function main() {
  const proofs = arg(process.argv, '--proofs') ?? 'specs/019-odoo-production-foundation/proofs';
  const output = arg(process.argv, '--out') ?? path.join(proofs, 'qualification-manifest.json');
  const result = buildManifest(proofs);
  const bytes = JSON.stringify(result.manifest, null, 2) + '\n';
  if (process.argv.includes('--check')) {
    if (!existsSync(output) || readFileSync(output, 'utf8') !== bytes) throw new Error(`${output} absent ou périmé`);
  } else writeFileSync(output, bytes);
  console.log(`✔ manifeste ${result.manifest.releaseStatus} · ${result.manifest.receipts.length}/${REQUIRED.length} reçus · manquants=${result.missing.join(',') || '0'} · fail=${result.failed.join(',') || '0'} · skipped=${result.skipped.join(',') || '0'}`);
  if (process.argv.includes('--require-qualified') && !['qualified', 'qualified-with-limits'].includes(result.manifest.releaseStatus)) process.exit(1);
}
runAsCli(import.meta.url, main);
