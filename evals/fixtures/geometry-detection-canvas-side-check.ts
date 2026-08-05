/**
 * Canvas-side half of FR-005's two-sided detection proof (015, D9, SC-002).
 *
 * `compareFigmaExpectation` (extract/figma/organism-audit/facts.ts) is the
 * pure comparator `pilot.ts` calls per captured fact — already exercised
 * data-only, exhaustively, by `organism-audit-token-resolution-check.ts`
 * (D9 cites it directly: "déjà exercé data-only"). This fixture adds the
 * ONE property that one doesn't: a captured value on a GEOMETRIC channel
 * (gap — the closed set of contracts/geometry-gate.interface.md §2),
 * mutated exactly as a fresh dump COPY would read after a real change on
 * the canvas, reports a divergence localized to that fact — never the
 * live Figma file (FR-010), never a Chromium render, pure data in.
 *
 * Reference: research.md D9, contracts/geometry-gate.interface.md §2.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildTokenResolver, compareFigmaExpectation } from '../../extract/figma/organism-audit/facts.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const readJson = (rel: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8')) as Record<string, unknown>;

// The REAL token source, same discipline as the sibling fixture: pinning
// against tokens/** is pinning against the same bytes the audit reads.
const resolve = buildTokenResolver([readJson('tokens/primitives.tokens.json'), readJson('tokens/semantic.tokens.json')]);

const fail = (message: string): never => {
  throw new Error(message);
};

// A geometric fact as pilot.ts would capture it from a dump: Button's root
// gap, contract-bound to {space.10}, Figma's itemSpacing formatted as a CSS
// length (the shape compareFigmaExpectation expects — see the sibling
// fixture's font-size cases; an un-formatted raw number is a SEPARATE,
// pre-existing pilot.ts extraction concern, out of 015's scope).
const CAPTURED_DUMP_COPY = {
  channel: 'root.gap',
  jsonPointer: '/anatomy/root/tokens/gap',
  carried: true,
  contractValue: '{space.10}',
  expectedValue: '10px', // the dump COPY, as originally captured
};

// ---------------------------------------------------------------------------
// 1. The original capture agrees — the baseline this fixture mutates away
// from, so the divergence below is provably CAUSED by the mutation.
// ---------------------------------------------------------------------------
const before = compareFigmaExpectation({ ...CAPTURED_DUMP_COPY, resolve });
if (!before.agrees) {
  fail(`the un-mutated dump copy must agree ({space.10} resolves to 10px), got ${before.reasons.join('; ')}`);
}

// ---------------------------------------------------------------------------
// 2. Mutate a COPY of the captured value on the geometric channel (never
// the live file — this IS the copy) — exactly what a re-dumped master with
// a changed itemSpacing would produce.
// ---------------------------------------------------------------------------
const mutatedDumpCopy = { ...CAPTURED_DUMP_COPY, expectedValue: '24px' };
const after = compareFigmaExpectation({ ...mutatedDumpCopy, resolve });

if (after.agrees) {
  fail('a mutated geometric expectation (10px -> 24px) must diverge, but it agreed');
}
// Localized: the reason names the fact's own channel, the contract's
// resolved value, AND the mutated expectation — never an anonymous refusal.
const reason = after.reasons.join(' | ');
for (const fragment of ['root.gap', '10px', '24px']) {
  if (!reason.includes(fragment)) {
    fail(`the divergence must localize to "${fragment}"; got ${reason}`);
  }
}

// ---------------------------------------------------------------------------
// 3. The mutation is isolated to its own fact — a SIBLING fact (an
// unrelated geometric channel) captured from the same dump is unaffected,
// exactly as mutating one property of one copied file would leave every
// other fact untouched.
// ---------------------------------------------------------------------------
const sibling = compareFigmaExpectation({
  channel: 'root.padding-inline',
  jsonPointer: '/anatomy/root/tokens/padding-inline',
  carried: true,
  contractValue: '{space.32}',
  expectedValue: '32px',
  resolve,
});
if (!sibling.agrees) {
  fail(`an unrelated geometric fact must be untouched by the mutation above, got ${sibling.reasons.join('; ')}`);
}

console.log(
  '✔ geometry canvas-side detection holds: a captured geometric fact (gap) agrees pre-mutation, a dump-copy ' +
    'mutation on that SAME channel produces a divergence localized to it (channel + resolved contract value + ' +
    'mutated expectation all named), and a sibling geometric fact from the same capture is unaffected.',
);
