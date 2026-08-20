import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { canonicalJson, sha256 } from './lib/canonical.js';
import { arg, runAsCli } from './lib/cli.js';

const EXPECTED_GRAPH = 'e8b7e2127b5eb8ffe626bea707b6698187412df7580900d04712ed958bdd8322';
const AUTHORING = '1.1.0';
const MODULE = '19.0.1.5.0';
const CONTRACTS: Record<string, string> = { 'ds.google-reviews': '2.0.0', 'ds.presentation': '2.6.0', 'ds.hero': '1.5.0', 'ds.equipe': '1.2.0', 'ds.faq': '1.3.0', 'ds.devis': '1.2.0', 'ds.sav': '1.4.0', 'ds.texte-seo': '2.1.0', 'ds.coordonnees': '2.2.0', 'ds.reassurances': '1.2.0' };

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
    const tags = [...html.matchAll(/<(?:section|div)\b[^>]*(?:s_pqr_google_reviews|s_pqr_presentation|s_pqr_hero|s_pqr_equipe|s_pqr_faq|s_pqr_devis|s_pqr_sav|s_pqr_texte_seo|s_pqr_coordonnees|s_pqr_reassurances)[^>]*>/g)].map((m) => m[0]);
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
