import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { canonicalJson, sha256 } from './lib/canonical.js';
import { arg, runAsCli } from './lib/cli.js';

const EXPECTED_GRAPH = '9cf060ab2f36fecfcf9f54903725ef86648b1fd43cdb8f57acedc66e89d8f9f0';
const AUTHORING = '1.0.0';
const MODULE = '19.0.1.0.1';
const CONTRACTS: Record<string, string> = { 'ds.presentation': '2.5.0', 'ds.google-reviews': '1.0.0' };

export type VersionState = 'current' | 'policy-stale' | 'structure-stale' | 'unknown';
export interface SavedCase { id: string; html: string }
export interface ScanEntry {
  caseId: string;
  index: number;
  contractId: string | null;
  state: VersionState;
  metadata: Record<string, string>;
}

const attrs = (tag: string): Record<string, string> => Object.fromEntries(
  [...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [match[1], match[2]]),
);

export function classify(attributes: Record<string, string>): VersionState {
  const id = attributes['data-ds-contract'];
  if (!id || !CONTRACTS[id] || !attributes['data-ds-contract-version'] || !attributes['data-ds-graph-digest']) return 'unknown';
  if (attributes['data-ds-contract-version'] !== CONTRACTS[id] || attributes['data-ds-graph-digest'] !== EXPECTED_GRAPH) return 'structure-stale';
  if (attributes['data-ds-authoring-version'] !== AUTHORING ||
    ['data-vcss', 'data-vxml', 'data-vjs'].some((name) => attributes[name] !== MODULE)) return 'policy-stale';
  return 'current';
}

export function scanCases(cases: SavedCase[]) {
  const entries: ScanEntry[] = cases.flatMap<ScanEntry>(({ id, html }) => {
    const tags = [...html.matchAll(/<(?:section|div)\b[^>]*(?:s_pqr_presentation|s_pqr_google_reviews)[^>]*>/g)].map((m) => m[0]);
    if (tags.length === 0) return [{ caseId: id, index: 0, contractId: null, state: 'unknown' as const, metadata: {} }];
    return tags.map((tag, index) => {
      const metadata = attrs(tag);
      return { caseId: id, index, contractId: metadata['data-ds-contract'] ?? null, state: classify(metadata), metadata };
    });
  }).sort((a, b) => `${a.caseId}:${a.index}`.localeCompare(`${b.caseId}:${b.index}`));
  const summary = Object.fromEntries(['current', 'policy-stale', 'structure-stale', 'unknown'].map((state) => [state, entries.filter((entry) => entry.state === state).length]));
  const payload = { schemaVersion: '1.0.0', snapshotId: 'odoo-019-foundation', expectedGraphDigest: EXPECTED_GRAPH, entries, summary };
  // Le champ s'appelle `canonicalDigest` : il se calcule donc sur la
  // sérialisation CANONIQUE du dépôt (clés triées, valeurs non représentables
  // refusées), pas sur l'ordre d'insertion que rend `JSON.stringify`.
  return { ...payload, canonicalDigest: sha256(canonicalJson(payload)) };
}

async function main() {
  const input = arg(process.argv, '--input');
  const output = arg(process.argv, '--out');
  if (!input || !output || !existsSync(input)) throw new Error('Usage: --input <cases.json> --out <report.json>');
  const cases = JSON.parse(readFileSync(input, 'utf8')) as SavedCase[];
  const report = scanCases(cases);
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`✔ ${report.entries.length} bloc(s) scanné(s) → ${path.relative(process.cwd(), output)}`);
  console.log(JSON.stringify(report.summary));
}

runAsCli(import.meta.url, main);
