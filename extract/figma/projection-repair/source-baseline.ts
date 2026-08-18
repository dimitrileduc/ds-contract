import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import type { SourceBaseline } from './types.js';

const safeBackupRef = /^refs\/codex\/backups\/[a-z0-9][a-z0-9._/-]*$/;

function git(root: string, args: string[], env?: NodeJS.ProcessEnv, input?: string): string {
  return execFileSync('git', args, {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
}
/** Store tracked and untracked worktree bytes in a reachable Git ref without
 * touching the real index or cleaning the worktree. */
export function snapshotSourceBaseline(
  root: string,
  backupRef: string,
  capturedAt = new Date().toISOString(),
): SourceBaseline {
  if (!safeBackupRef.test(backupRef) || backupRef.includes('..')) throw new Error(`unsafe backup ref: ${backupRef}`);
  const gitHead = git(root, ['rev-parse', 'HEAD']);
  const scratch = mkdtempSync(path.join(tmpdir(), 'component-repair-index-'));
  const indexPath = path.join(scratch, 'index');
  const env = { GIT_INDEX_FILE: indexPath };
  try {
    git(root, ['read-tree', 'HEAD'], env);
    git(root, ['add', '-A'], env);
    const worktreeTree = git(root, ['write-tree'], env);
    const backupCommit = git(root, ['commit-tree', worktreeTree, '-p', gitHead], undefined, `backup: component repair source baseline ${capturedAt}\n`);
    git(root, ['update-ref', backupRef, backupCommit]);
    return { gitHead, worktreeTree, backupRef, capturedAt };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

export function verifySourceBaseline(root: string, baseline: SourceBaseline): void {
  if (!safeBackupRef.test(baseline.backupRef) || baseline.backupRef.includes('..')) throw new Error(`unsafe backup ref: ${baseline.backupRef}`);
  const ref = `${baseline.backupRef}^{commit}`;
  const [tree, parent] = git(root, ['rev-parse', `${ref}^{tree}`, `${ref}^`]).split('\n');
  if (tree !== baseline.worktreeTree) throw new Error(`source baseline tree drift: expected ${baseline.worktreeTree}, observed ${tree}`);
  if (parent !== baseline.gitHead) throw new Error(`source baseline parent drift: expected ${baseline.gitHead}, observed ${parent}`);
}
