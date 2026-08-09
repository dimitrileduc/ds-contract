import { rankCandidates, rejectCandidateOverflow } from '../../../extract/figma/organism-audit/readiness/candidates.js';
import { expectThrows, state } from './helpers.js';

const states = ['a', 'b', 'c', 'd'].map((id, index) => state(id, { observedAt: `2026-07-0${index + 1}T00:00:00.000Z` }));
const ranked = rankCandidates(states, null);
if (ranked.length !== 3 || ranked.map((candidate) => candidate.rank).join(',') !== '1,2,3') throw new Error('candidate ranking did not cap at three stable ranks');
if (rejectCandidateOverflow([...ranked, ranked[0]]).length === 0) throw new Error('a fourth candidate was not refused');
const current = rankCandidates([state('current', { figmaVersionId: 'current-pin' })], 'current-pin');
if (current.length !== 0) throw new Error('a clean-looking current state auto-promoted into a candidate');
expectThrows(() => rankCandidates([state('current-unpinned', { figmaVersionId: undefined })], 'current-pin'), 'available current-looking Figma evidence without a version pin');
const visualOnly = rankCandidates([state('visual-only', { completeness: 'partial', evidence: [{ evidenceId: 'visual-only', kind: 'visual', pathOrUri: 'fixture://visual-only', sha256: 'c'.repeat(64), availability: 'available', proves: ['pixels'], doesNotProve: ['structure'] }] })], null);
if (visualOnly.some((candidate) => candidate.recommendation === 'recommended')) throw new Error('an isolated visual capture became a recommendation');
console.log('✔ candidates are deterministic, capped at three, exclude the current pin, and do not recommend isolated captures');
