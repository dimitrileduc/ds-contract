/**
 * page-parity SELFTEST — the "fixture → eval → claim" fixture half for the
 * zero-pixel page-proof instrument (R12, spec 003 research.md): proves the
 * COMPARATOR (cli.ts) is correct against committed, deterministic fixtures,
 * with no Figma canvas involved — `npm run pages:selftest`.
 *
 * WHY spawnSync the real `node_modules/.bin/tsx cli.ts`, not an in-process
 * import: this is the exact invocation the pinned interface documents
 * (`node_modules/.bin/tsx extract/figma/page-parity/cli.ts --before … --after
 * … --out …`, i.e. what `npm run pages:compare` actually runs) — spawning it
 * for real also exercises cli.ts's own argv parsing and its own
 * `process.exit` calls, which an `import()` of the module could never
 * observe correctly (a real exit code, not a return value).
 *
 * WHY each out dir is wiped before its run: `extract/figma/page-parity/out/`
 * is gitignored working state that can carry stale files across selftest
 * runs (e.g. a leftover crops/maquette-a.png from an earlier manual test).
 * Reading stale output instead of what THIS run just wrote would be a false
 * pass hiding a real regression — the one failure class this repo treats as
 * worse than a loud red line (see CLAUDE.md "Honesty conventions").
 *
 * WHY FLIP_X/FLIP_Y are re-declared here rather than imported from
 * fixtures/generate.ts: generate.ts is a standalone script whose module body
 * IS the generation side effect (it writes 8 PNGs the moment it's loaded) —
 * importing it just to read two constants would silently regenerate fixtures
 * on every selftest run. Both this file and generate.ts instead take the
 * pixel coordinate from the same source of truth: the pinned interface
 * (specs/003-externalize-figma-components/contracts/page-proof.md §3).
 *
 * cli.ts is authored by a parallel agent per the same pinned interface — this
 * file never imports it, only spawns it as a subprocess, so it typechecks
 * and this selftest can be inspected independently of whether cli.ts exists
 * yet. If a fixture PNG is missing, we fail loudly and name the exact fix
 * rather than let cli.ts's own error stand in for ours.
 */
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const HERE = path.resolve(new URL('.', import.meta.url).pathname);
/** Repo root — extract/figma/page-parity is 3 levels below it. */
const ROOT = path.resolve(HERE, '..', '..', '..');
const TSX = path.join(ROOT, 'node_modules', '.bin', 'tsx');
const CLI = path.join(HERE, 'cli.ts');
const FIXTURES = path.join(HERE, 'fixtures');
const OUT_ROOT = path.join(HERE, 'out', 'selftest');

/** The single maquette every fixture pair carries (pinned interface §3). */
const MAQUETTE = 'maquette-a';
/** The exact pixel the one-pixel fixture flips — mirrors fixtures/generate.ts
 *  (both derive from the pinned interface, not from each other; see header). */
const FLIP_X = 10;
const FLIP_Y = 7;

const FIXTURE_CASES = ['identical', 'one-pixel', 'empty-capture', 'dimension-mismatch'] as const;

// ---------------------------------------------------------------------------
// verdict.json shape — a local mirror of the pinned interface, not an import
// from cli.ts (see header). Kept minimal: only the fields this selftest reads.
// ---------------------------------------------------------------------------

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MaquetteVerdict {
  maquette: string;
  status: 'identical' | 'diff' | 'capture-failed' | 'dimension-mismatch';
  diffCount: number;
  diffBox: Box | null;
  cropTriptyque: string | null;
  refus: string | null;
}

interface Verdict {
  statutGlobal: 'identical' | 'diff' | 'refus';
  exitCode: 0 | 1 | 2;
  totaux: { identical: number; diff: number; captureFailed: number; dimensionMismatch: number };
  maquettes: MaquetteVerdict[];
}

// ---------------------------------------------------------------------------
// Fixture presence — a missing PNG must fail loudly, naming the exact fix,
// BEFORE any case attempts to run (a case failing on a missing fixture would
// read as a comparator bug, which it isn't).
// ---------------------------------------------------------------------------

function fixturePngPath(caseName: string, side: 'before' | 'after'): string {
  return path.join(FIXTURES, caseName, side, `${MAQUETTE}.png`);
}

function verifyFixturesPresent(): void {
  const missing: string[] = [];
  for (const c of FIXTURE_CASES) {
    for (const side of ['before', 'after'] as const) {
      const p = fixturePngPath(c, side);
      if (!existsSync(p)) missing.push(path.relative(ROOT, p));
    }
  }
  if (missing.length > 0) {
    console.error('✖ page-parity selftest: fixture PNG(s) missing — generate them first:');
    console.error('    npx tsx extract/figma/page-parity/fixtures/generate.ts');
    console.error('  missing:');
    for (const m of missing) console.error(`    - ${m}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Running the real CLI + reading its output
// ---------------------------------------------------------------------------

interface CliResult {
  status: number;
  stdout: string;
  stderr: string;
}

function runCli(beforeDir: string, afterDir: string, outDir: string): CliResult {
  // Wipe stale output from a previous run (see file header) — every check
  // below must only ever see what THIS invocation wrote.
  rmSync(outDir, { recursive: true, force: true });
  const res = spawnSync(TSX, [CLI, '--before', beforeDir, '--after', afterDir, '--out', outDir], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (res.error) {
    throw new Error(`could not spawn "${path.relative(ROOT, TSX)} ${path.relative(ROOT, CLI)}": ${res.error.message}`);
  }
  return { status: res.status ?? -1, stdout: res.stdout ?? '', stderr: res.stderr ?? '' };
}

function readVerdictJson(outDir: string, cli: CliResult): Verdict {
  const p = path.join(outDir, 'verdict.json');
  if (!existsSync(p)) {
    throw new Error(
      `${path.relative(ROOT, p)} was not written (cli exited ${cli.status}).\n` +
        `--- stdout ---\n${cli.stdout}\n--- stderr ---\n${cli.stderr}`,
    );
  }
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as Verdict;
  } catch (e) {
    throw new Error(`${path.relative(ROOT, p)} is not valid JSON: ${e instanceof Error ? e.message : String(e)}`);
  }
}

function findMaquette(verdict: Verdict, name: string): MaquetteVerdict {
  const entry = verdict.maquettes.find((m) => m.maquette === name);
  if (!entry) {
    const seen = verdict.maquettes.map((m) => m.maquette).join(', ') || '(none)';
    throw new Error(`verdict.json has no entry for maquette "${name}" (found: ${seen})`);
  }
  return entry;
}

function expect(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

// ---------------------------------------------------------------------------
// The 5 contract cases (page-proof.md §3 / data-model.md PixelVerdict)
// ---------------------------------------------------------------------------

function caseIdentical(): string {
  const out = path.join(OUT_ROOT, 'identical');
  const cli = runCli(fixtureDir('identical', 'before'), fixtureDir('identical', 'after'), out);
  expect(cli.status === 0, `expected process exit 0, got ${cli.status}\n${cli.stdout}${cli.stderr}`);
  const verdict = readVerdictJson(out, cli);
  expect(verdict.exitCode === 0, `verdict.json exitCode expected 0, got ${verdict.exitCode}`);
  expect(verdict.statutGlobal === 'identical', `statutGlobal expected "identical", got "${verdict.statutGlobal}"`);
  const entry = findMaquette(verdict, MAQUETTE);
  expect(entry.status === 'identical', `${MAQUETTE} status expected "identical", got "${entry.status}"`);
  expect(entry.diffCount === 0, `${MAQUETTE} diffCount expected 0, got ${entry.diffCount}`);
  return `exit 0, statutGlobal "identical", ${MAQUETTE} diffCount 0`;
}

function caseOnePixel(): string {
  const out = path.join(OUT_ROOT, 'one-pixel');
  const cli = runCli(fixtureDir('one-pixel', 'before'), fixtureDir('one-pixel', 'after'), out);
  expect(cli.status === 1, `expected process exit 1, got ${cli.status}\n${cli.stdout}${cli.stderr}`);
  const verdict = readVerdictJson(out, cli);
  expect(verdict.exitCode === 1, `verdict.json exitCode expected 1, got ${verdict.exitCode}`);
  expect(verdict.statutGlobal === 'diff', `statutGlobal expected "diff", got "${verdict.statutGlobal}"`);
  const entry = findMaquette(verdict, MAQUETTE);
  expect(entry.status === 'diff', `${MAQUETTE} status expected "diff", got "${entry.status}"`);
  expect(entry.diffCount >= 1, `${MAQUETTE} diffCount expected >= 1, got ${entry.diffCount}`);
  expect(entry.diffBox !== null, `${MAQUETTE} diffBox expected non-null`);
  const box = entry.diffBox as Box;
  const containsFlip = FLIP_X >= box.x && FLIP_X < box.x + box.w && FLIP_Y >= box.y && FLIP_Y < box.y + box.h;
  expect(containsFlip, `diffBox ${JSON.stringify(box)} does not contain the flipped pixel (${FLIP_X}, ${FLIP_Y})`);
  const cropPath = path.join(out, 'crops', `${MAQUETTE}.png`);
  expect(existsSync(cropPath), `expected crop triptych at ${path.relative(ROOT, cropPath)}`);
  return `exit 1, statutGlobal "diff", diffCount ${entry.diffCount}, diffBox ${JSON.stringify(box)} contains (${FLIP_X},${FLIP_Y}), crop written`;
}

function caseEmptyCapture(): string {
  const out = path.join(OUT_ROOT, 'empty-capture');
  const cli = runCli(fixtureDir('empty-capture', 'before'), fixtureDir('empty-capture', 'after'), out);
  expect(cli.status === 2, `expected process exit 2, got ${cli.status}\n${cli.stdout}${cli.stderr}`);
  const verdict = readVerdictJson(out, cli);
  expect(verdict.exitCode === 2, `verdict.json exitCode expected 2, got ${verdict.exitCode}`);
  expect(verdict.statutGlobal === 'refus', `statutGlobal expected "refus", got "${verdict.statutGlobal}"`);
  const entry = findMaquette(verdict, MAQUETTE);
  expect(entry.status === 'capture-failed', `${MAQUETTE} status expected "capture-failed", got "${entry.status}"`);
  expect(typeof entry.refus === 'string' && entry.refus.length > 0, `${MAQUETTE} refus expected a non-empty string, got ${JSON.stringify(entry.refus)}`);
  return `exit 2, statutGlobal "refus", ${MAQUETTE} "capture-failed", refus: "${entry.refus}"`;
}

function caseDimensionMismatch(): string {
  const out = path.join(OUT_ROOT, 'dimension-mismatch');
  const cli = runCli(fixtureDir('dimension-mismatch', 'before'), fixtureDir('dimension-mismatch', 'after'), out);
  expect(cli.status === 2, `expected process exit 2, got ${cli.status}\n${cli.stdout}${cli.stderr}`);
  const verdict = readVerdictJson(out, cli);
  expect(verdict.exitCode === 2, `verdict.json exitCode expected 2, got ${verdict.exitCode}`);
  expect(verdict.statutGlobal === 'refus', `statutGlobal expected "refus", got "${verdict.statutGlobal}"`);
  const entry = findMaquette(verdict, MAQUETTE);
  expect(entry.status === 'dimension-mismatch', `${MAQUETTE} status expected "dimension-mismatch", got "${entry.status}"`);
  const refus = entry.refus ?? '';
  expect(refus.length > 0, `${MAQUETTE} refus expected a non-empty string`);
  // Fixture is before 96x64 / after 100x64 (fixtures/generate.ts) — the
  // pinned interface requires the refus to name BOTH sizes, e.g.
  // "dimensions before 96x64 != after 100x64".
  expect(refus.includes('96x64'), `refus expected to name the before size "96x64", got: "${refus}"`);
  expect(refus.includes('100x64'), `refus expected to name the after size "100x64", got: "${refus}"`);
  return `exit 2, statutGlobal "refus", ${MAQUETTE} "dimension-mismatch", refus: "${entry.refus}"`;
}

function caseDeterminism(): string {
  // Reruns the "identical" fixture TWICE into two distinct out dirs — the
  // comparator itself must be a pure function of its inputs (no timestamps,
  // no absolute-path leakage into verdict.json/verdict.md).
  const before = fixtureDir('identical', 'before');
  const after = fixtureDir('identical', 'after');
  const outA = path.join(OUT_ROOT, 'determinism-a');
  const outB = path.join(OUT_ROOT, 'determinism-b');
  const cliA = runCli(before, after, outA);
  const cliB = runCli(before, after, outB);
  expect(cliA.status === 0, `run A: expected process exit 0, got ${cliA.status}\n${cliA.stdout}${cliA.stderr}`);
  expect(cliB.status === 0, `run B: expected process exit 0, got ${cliB.status}\n${cliB.stdout}${cliB.stderr}`);

  const jsonPathA = path.join(outA, 'verdict.json');
  const jsonPathB = path.join(outB, 'verdict.json');
  expect(existsSync(jsonPathA), `expected ${path.relative(ROOT, jsonPathA)} to exist`);
  expect(existsSync(jsonPathB), `expected ${path.relative(ROOT, jsonPathB)} to exist`);
  const jsonA = readFileSync(jsonPathA);
  const jsonB = readFileSync(jsonPathB);
  expect(jsonA.equals(jsonB), 'verdict.json differs byte-for-byte between two runs on the same inputs');

  const mdPathA = path.join(outA, 'verdict.md');
  const mdPathB = path.join(outB, 'verdict.md');
  expect(existsSync(mdPathA), `expected ${path.relative(ROOT, mdPathA)} to exist`);
  expect(existsSync(mdPathB), `expected ${path.relative(ROOT, mdPathB)} to exist`);
  const mdA = readFileSync(mdPathA);
  const mdB = readFileSync(mdPathB);
  expect(mdA.equals(mdB), 'verdict.md differs byte-for-byte between two runs on the same inputs');

  return `two runs -> verdict.json byte-identical (${jsonA.length}B), verdict.md byte-identical (${mdA.length}B)`;
}

function fixtureDir(caseName: string, side: 'before' | 'after'): string {
  return path.join(FIXTURES, caseName, side);
}

// ---------------------------------------------------------------------------
// Runner — every case runs regardless of earlier failures (full diagnostic
// picture for whoever reads this next, per this repo's honesty conventions:
// nothing silently skipped), one receipt line per case, exit 1 if any failed.
// ---------------------------------------------------------------------------

interface CaseSpec {
  name: string;
  run: () => string;
}

const CASES: CaseSpec[] = [
  { name: 'identical', run: caseIdentical },
  { name: 'one-pixel', run: caseOnePixel },
  { name: 'empty-capture', run: caseEmptyCapture },
  { name: 'dimension-mismatch', run: caseDimensionMismatch },
  { name: 'determinism', run: caseDeterminism },
];

verifyFixturesPresent();
console.log(`page-parity selftest — ${CASES.length} cases (npm run pages:selftest)`);

let failed = 0;
for (const c of CASES) {
  try {
    const receipt = c.run();
    console.log(`  ✔ ${c.name}: ${receipt}`);
  } catch (e) {
    failed++;
    const message = e instanceof Error ? e.message : String(e);
    console.error(`  ✖ ${c.name}: ${message}`);
  }
}

if (failed > 0) {
  console.error(`\n✖ page-parity selftest: ${failed}/${CASES.length} case(s) failed — see ✖ lines above.`);
  process.exit(1);
}
console.log(`\n✔ page-parity selftest: ${CASES.length}/${CASES.length} cases pass.`);
