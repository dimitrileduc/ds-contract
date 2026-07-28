/** Offline fixtures for the generic strict PNG-to-PNG CLI. */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const HERE = path.resolve(new URL('.', import.meta.url).pathname);
const ROOT = path.resolve(HERE, '..', '..');
const TSX = path.join(ROOT, 'node_modules', '.bin', 'tsx');
const CLI = path.join(HERE, 'cli.ts');
const FIXTURES = path.join(ROOT, 'extract', 'figma', 'page-parity', 'fixtures');
const OUT = path.join(ROOT, '.image-parity', 'selftest');
const PNG = (name: string, side: 'before' | 'after') => path.join(FIXTURES, name, side, 'maquette-a.png');

interface Report {
  status: 'identical' | 'diff' | 'input-invalid' | 'dimension-mismatch';
  exitCode: 0 | 1 | 2;
  diffCount: number;
  diffBox: { x: number; y: number; w: number; h: number } | null;
  reason: string | null;
  triptych: string | null;
}

function expect(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function run(name: string, before: string, after: string): { status: number; report: Report; out: string } {
  const out = path.join(OUT, name);
  rmSync(out, { recursive: true, force: true });
  const res = spawnSync(TSX, [CLI, '--before', before, '--after', after, '--out', out], { cwd: ROOT, encoding: 'utf8' });
  if (res.error) throw new Error(`could not start image-parity CLI: ${res.error.message}`);
  const reportPath = path.join(out, 'result.json');
  expect(existsSync(reportPath), `missing result.json for ${name}: ${res.stdout}\n${res.stderr}`);
  return { status: res.status ?? -1, report: JSON.parse(readFileSync(reportPath, 'utf8')) as Report, out };
}

function testIdentical(): string {
  const r = run('identical', PNG('identical', 'before'), PNG('identical', 'after'));
  expect(r.status === 0 && r.report.status === 'identical' && r.report.diffCount === 0, `expected identical / 0, got ${JSON.stringify(r.report)}`);
  expect(r.report.triptych === null && !existsSync(path.join(r.out, 'triptych.png')), 'identical comparison wrote a diagnostic image');
  return 'identical -> exit 0, no triptych';
}

function testDiffAndBox(): string {
  const r = run('one-pixel', PNG('one-pixel', 'before'), PNG('one-pixel', 'after'));
  expect(r.status === 1 && r.report.status === 'diff' && r.report.diffCount >= 1, `expected diff / 1, got ${JSON.stringify(r.report)}`);
  const box = r.report.diffBox;
  expect(box !== null && 10 >= box.x && 10 < box.x + box.w && 7 >= box.y && 7 < box.y + box.h, `bbox does not contain flipped pixel: ${JSON.stringify(box)}`);
  expect(r.report.triptych === 'triptych.png' && existsSync(path.join(r.out, 'triptych.png')), 'diff did not write triptych');
  return `one pixel -> exit 1, bbox ${JSON.stringify(box)}, cropped triptych`;
}

function testRefusals(): string {
  const dimensions = run('dimensions', PNG('dimension-mismatch', 'before'), PNG('dimension-mismatch', 'after'));
  expect(dimensions.status === 2 && dimensions.report.status === 'dimension-mismatch', `dimension refusal failed: ${JSON.stringify(dimensions.report)}`);
  const transparent = run('transparent', PNG('empty-capture', 'before'), PNG('empty-capture', 'after'));
  expect(transparent.status === 2 && transparent.report.status === 'input-invalid', `transparent refusal failed: ${JSON.stringify(transparent.report)}`);
  const missing = run('missing', PNG('identical', 'before'), path.join(OUT, 'does-not-exist.png'));
  expect(missing.status === 2 && missing.report.status === 'input-invalid' && missing.report.reason?.includes('after:') === true, `missing refusal failed: ${JSON.stringify(missing.report)}`);
  return 'dimension mismatch, transparent PNG, and missing PNG -> exit 2';
}

function testDeterminismAndCleanup(): string {
  const a = run('determinism-a', PNG('identical', 'before'), PNG('identical', 'after'));
  const b = run('determinism-b', PNG('identical', 'before'), PNG('identical', 'after'));
  expect(readFileSync(path.join(a.out, 'result.json')).equals(readFileSync(path.join(b.out, 'result.json'))), 'result.json differs across identical runs');

  const reused = path.join(OUT, 'reuse');
  const diff = spawnSync(TSX, [CLI, '--before', PNG('one-pixel', 'before'), '--after', PNG('one-pixel', 'after'), '--out', reused], { cwd: ROOT });
  expect(diff.status === 1 && existsSync(path.join(reused, 'triptych.png')), 'setup diff did not create triptych');
  const clean = spawnSync(TSX, [CLI, '--before', PNG('identical', 'before'), '--after', PNG('identical', 'after'), '--out', reused], { cwd: ROOT });
  expect(clean.status === 0 && !existsSync(path.join(reused, 'triptych.png')), 'stale triptych survived a clean comparison');
  return 'byte-deterministic JSON; stale triptych removed on clean rerun';
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const cases = [testIdentical, testDiffAndBox, testRefusals, testDeterminismAndCleanup];
let failed = 0;
for (const test of cases) {
  try {
    console.log(`  ✔ ${test()}`);
  } catch (error) {
    failed++;
    console.error(`  ✖ ${error instanceof Error ? error.message : String(error)}`);
  }
}
if (failed > 0) {
  console.error(`✖ image-parity selftest: ${failed}/${cases.length} failed`);
  process.exit(1);
}
console.log(`✔ image-parity selftest: ${cases.length}/${cases.length} pass`);
