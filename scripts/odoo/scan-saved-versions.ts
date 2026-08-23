import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { canonicalJson, sha256 } from './lib/canonical.js';
import { arg, runAsCli } from './lib/cli.js';
import { ROOT_CLASSES } from './lib/repo-data.js';

const EXPECTED_GRAPH = '9e6dbbe26e12d42cb1331704f62c05011b7c771c141d79fd0f88dd12f3402274';
const AUTHORING = '1.2.0';
const MODULE = '19.0.1.8.0';
const CONTRACTS: Record<string, string> = { 'ds.google-reviews': '2.0.0', 'ds.presentation': '2.6.0', 'ds.hero': '1.6.0', 'ds.equipe': '1.2.0', 'ds.faq': '1.3.0', 'ds.devis': '1.2.0', 'ds.sav': '1.4.1', 'ds.texte-seo': '2.1.0', 'ds.coordonnees': '2.2.0', 'ds.reassurances': '1.2.0', 'ds.categories-principales': '1.0.0' };

export type VersionState = 'current' | 'policy-stale' | 'structure-stale' | 'unknown';
export interface SavedCase { id: string; html: string }
export interface ScanEntry {
  caseId: string;
  index: number;
  contractId: string | null;
  state: VersionState;
  metadata: Record<string, string>;
}

/** Une balise de section/div portant l'une des classes de racine gouvernées.
 *  L'alternative est DÉRIVÉE de `ROOT_SELECTOR` : une racine ajoutée au dépôt
 *  entre dans le scan sans qu'on pense à l'écrire ici (une liste recopiée qui
 *  oublie une racine classe ses blocs `unknown` — un trou vert). */
const ROOT_TAG_RE = new RegExp(`<(?:section|div)\\b[^>]*(?:${ROOT_CLASSES.join('|')})[^>]*>`, 'g');

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
    const tags = [...html.matchAll(ROOT_TAG_RE)].map((m) => m[0]);
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
