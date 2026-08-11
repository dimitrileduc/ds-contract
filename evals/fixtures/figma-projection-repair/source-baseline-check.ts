import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { snapshotSourceBaseline, verifySourceBaseline } from '../../../extract/figma/projection-repair/source-baseline.js';

const root = mkdtempSync(path.join(tmpdir(), 'component-repair-source-fixture-'));
const git = (args: string[]): string => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

try {
  git(['init', '-q']);
  git(['config', 'user.name', 'Fixture']);
  git(['config', 'user.email', 'fixture@example.test']);
  writeFileSync(path.join(root, 'tracked.txt'), 'committed\n');
  git(['add', 'tracked.txt']);
  git(['commit', '-qm', 'initial']);
  writeFileSync(path.join(root, 'tracked.txt'), 'dirty tracked\n');
  writeFileSync(path.join(root, 'untracked.txt'), 'dirty untracked\n');
  const statusBefore = git(['status', '--short']);
  const baseline = snapshotSourceBaseline(root, 'refs/codex/backups/fixture-source-baseline', '2026-08-11T12:00:00.000Z');
  verifySourceBaseline(root, baseline);
  const statusAfter = git(['status', '--short']);
  if (statusAfter !== statusBefore) throw new Error('source snapshot changed the worktree or real index');
  const tracked = git(['show', `${baseline.backupRef}:tracked.txt`]);
  const untracked = git(['show', `${baseline.backupRef}:untracked.txt`]);
  if (tracked !== 'dirty tracked' || untracked !== 'dirty untracked') throw new Error('source snapshot did not archive exact tracked/untracked bytes');
  if (readFileSync(path.join(root, 'tracked.txt'), 'utf8') !== 'dirty tracked\n') throw new Error('tracked worktree file changed after snapshot');
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log('✔ source baseline archives tracked and untracked bytes in a recoverable ref without changing worktree/index');
