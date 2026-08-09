import { normalizeHistoricalStates } from '../../../extract/figma/organism-audit/readiness/history.js';
import { assembleTimeline } from '../../../extract/figma/organism-audit/readiness/timeline.js';
import { state } from './helpers.js';

const old = state('old', { observedAt: '2026-01-01T00:00:00.000Z' });
const breakage = state('break', { observedAt: '2026-02-01T00:00:00.000Z', contradictions: ['visual says old intent; structure conflicts'] });
const line = assembleTimeline([breakage, old]);
if (line.states.map((entry) => entry.stateId).join(',') !== 'old,break') throw new Error('timeline order is not stable chronological order');
if (line.probableBreakStateId !== 'break') throw new Error('first contradictory state was not named as probable break');
if (assembleTimeline([]).reasons[0] !== 'historical-evidence-absent') throw new Error('absent history was turned into an implicit reference');
const brokenOnly = assembleTimeline([state('broken-1', { contradictions: ['broken'] }), state('broken-2', { observedAt: '2026-08-01T00:00:00.000Z', contradictions: ['still broken'] })]);
if (brokenOnly.probableBreakStateId !== null || brokenOnly.reasons[0] !== 'no-eligible-baseline-in-available-history') throw new Error('history with no healthy baseline invented a probable break');
if (normalizeHistoricalStates([state('same', { evidence: [{ evidenceId: 'z', kind: 'visual', pathOrUri: 'fixture://z', availability: 'available', proves: [], doesNotProve: [] }, { evidenceId: 'a', kind: 'structure', pathOrUri: 'fixture://a', availability: 'available', proves: [], doesNotProve: [] }] })])[0].evidence[0].evidenceId !== 'a') throw new Error('evidence ordering is not deterministic');
console.log('✔ timeline keeps contradictions and names the likely first break; absent history stays absent');
