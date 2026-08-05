/**
 * `npm run geometry:gate` — the thin CLI around `gate.ts`'s pure policy
 * (015, FR-001; contracts/geometry-gate.interface.md).
 *
 *   npx tsx extract/geometry-gate/run.ts             # human-readable
 *   npx tsx extract/geometry-gate/run.ts --json       # machine verdict
 *   npx tsx extract/geometry-gate/run.ts --preservation <corrections.json>
 *     # T038 (D10, FR-009) — a SEPARATE mode: checks 013's hand-set
 *     # corrections against the CURRENT contracts, never mixed into the
 *     # geometry population above (corrections-013.json is a 015-specific
 *     # fixture, not part of this gate's general, spec-agnostic contract).
 *
 * All the I/O lives here, none of it in gate.ts: read the 34 governed
 * contracts and the named-literals registry, flatten them into gate.ts's
 * `GeometryGateInput` shape (reusing `inventoryLiterals` — prior art 013,
 * never a second anatomy walker), and apply the exit code.
 *
 * Exit codes (contracts/geometry-gate.interface.md §4):
 *   0 pass    — counts.invisible === 0 and every registry entry is clean.
 *   1 fail    — at least one refusal (gate.ts's own verdict).
 *   2 blocked — the artifacts themselves are unusable (missing file,
 *               invalid JSON) — decided HERE, before gate.ts is ever
 *               called, same discipline as measure-gate/run.ts.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { evaluateGeometryGate, type GeometryGateInput, type GeometryGateResult, type NamedLiteralRegistryEntry } from './gate.js';
import { checkPreservation, type CorrectionEntry } from './preservation.js';
import { inventoryLiterals } from '../figma/organism-audit/baseline.js';
import { buildTokenResolver } from '../figma/organism-audit/facts.js';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTRACTS_DIR = path.join(REPO, 'contracts');
const REGISTRY_PATH = path.join(REPO, 'contracts/named-literals.registry.json');

const JSON_MODE = process.argv.includes('--json');

const readJson = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));

// ---------------------------------------------------------------------------
// --preservation <corrections.json> — T038, a separate mode entirely.
// ---------------------------------------------------------------------------
const preservationIdx = process.argv.indexOf('--preservation');
if (preservationIdx !== -1) {
  const correctionsPath = process.argv[preservationIdx + 1];
  if (!correctionsPath || !existsSync(correctionsPath)) {
    console.error(`✗ geometry:gate --preservation BLOCKED — corrections file missing or not given: ${correctionsPath ?? '(none)'}`);
    process.exit(2);
  }
  const contractsById: Record<string, unknown> = {};
  for (const f of readdirSync(CONTRACTS_DIR).filter((f) => f.endsWith('.contract.json'))) {
    const c = readJson(path.join(CONTRACTS_DIR, f));
    contractsById[c.id] = c;
  }
  const { literalInventory, tokenBindingInventory } = inventoryLiterals(contractsById);
  const resolveToken = buildTokenResolver([
    readJson(path.join(REPO, 'tokens/primitives.tokens.json')),
    readJson(path.join(REPO, 'tokens/semantic.tokens.json')),
  ]);
  const corrections: CorrectionEntry[] = readJson(correctionsPath).entries;
  const findings = checkPreservation({ corrections, literalEntries: literalInventory, tokenBindingEntries: tokenBindingInventory, resolveToken });
  const clobbered = findings.filter((f) => f.state === 'clobbered');
  const verdict = clobbered.length === 0 ? 'pass' : 'fail';

  if (JSON_MODE) {
    console.log(JSON.stringify({ schemaVersion: 1, verdict, findings }, null, 2));
  } else {
    console.log(`geometry:gate --preservation — verdict: ${verdict.toUpperCase()}`);
    for (const f of findings) console.log(`  · [${f.state}] ${f.contractId}${f.pointer} — ${f.message}`);
    if (clobbered.length > 0) console.error(`\n✗ ${clobbered.length} clobbered correction(s) — see above`);
    else console.log(`\n✓ all ${findings.length} corrections preserved or converted-preserved`);
  }
  process.exit(verdict === 'pass' ? 0 : 1);
}

interface BlockedReason {
  code: string;
  subject: string;
  message: string;
}

function blocked(reasons: BlockedReason[]): never {
  const result = { schemaVersion: 1, verdict: 'blocked' as const, exitCode: 2 as const, refusals: reasons };
  if (JSON_MODE) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.error('✗ geometry:gate BLOCKED — the entries themselves are unusable:');
    for (const r of reasons) console.error(`  · ${r.code}: ${r.subject} — ${r.message}`);
  }
  process.exit(2);
}

if (!existsSync(CONTRACTS_DIR)) {
  blocked([{ code: 'artifact-missing', subject: 'contracts/', message: 'the governed contract directory is missing entirely' }]);
}
// Read EN DIRECT — never a snapshot (FR-003): a registry entry authored a
// second ago must be visible to the very next run.
if (!existsSync(REGISTRY_PATH)) {
  blocked([{ code: 'artifact-missing', subject: 'contracts/named-literals.registry.json', message: 'the named-literals registry does not exist' }]);
}

let contractsById: Record<string, unknown>;
let registry: any;

try {
  contractsById = {};
  for (const file of readdirSync(CONTRACTS_DIR).filter((f) => f.endsWith('.contract.json'))) {
    const c = readJson(path.join(CONTRACTS_DIR, file));
    contractsById[c.id] = c;
  }
  registry = readJson(REGISTRY_PATH);
} catch (err) {
  blocked([{ code: 'artifact-unreadable', subject: 'preflight', message: err instanceof Error ? err.message : String(err) }]);
}

if (!Array.isArray(registry.entries)) {
  blocked([{ code: 'schema-unknown', subject: 'named-literals.registry.json', message: 'expected an "entries" array' }]);
}

const { literalInventory, tokenBindingInventory } = inventoryLiterals(contractsById);

const registryEntries: NamedLiteralRegistryEntry[] = (registry.entries as any[]).map((e) => ({
  contractId: e.contractId,
  pointer: e.pointer,
  channel: e.channel,
  value: e.value,
  reason: e.reason ?? null,
  decidedOn: e.decidedOn ?? null,
  receiptId: e.receiptId ?? null,
}));

const input: GeometryGateInput = {
  contractIds: Object.keys(contractsById),
  literalEntries: literalInventory,
  tokenBindingEntries: tokenBindingInventory,
  registryEntries,
};

const result = evaluateGeometryGate(input);
const exitCode = result.verdict === 'pass' ? 0 : 1;

if (JSON_MODE) {
  console.log(JSON.stringify({ ...result, exitCode }, null, 2));
} else {
  console.log(`geometry:gate — verdict: ${result.verdict.toUpperCase()} (exit ${exitCode})`);
  console.log('Comptage (en direct, jamais figé) :');
  console.log(
    `  contracts ${result.counts.contracts} · geometric entries ${result.counts.geometricEntries} · governed refs ${result.counts.governedRefs} · named literals ${result.counts.namedLiterals} · invisible ${result.counts.invisible}`,
  );
  if (result.refusals.length === 0) {
    console.log('✓ zero invisible literal, zero registry refusal');
  } else {
    console.error(`\n✗ ${result.refusals.length} refusal(s):`);
    for (const r of result.refusals) console.error(`  · [${r.code}] ${r.subject} — ${r.message}`);
  }
}

process.exit(exitCode);
