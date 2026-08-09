import type { HistoricalState } from './schema.js';
import { normalizeHistoricalStates, historicalStateIsCandidateEligible } from './history.js';

export interface Timeline { states: HistoricalState[]; probableBreakStateId: string | null; reasons: string[]; }

/** First incomplete, contradictory, or unavailable state after an eligible state is the likely break. */
export function assembleTimeline(states: readonly HistoricalState[]): Timeline {
  const normalized = normalizeHistoricalStates(states);
  if (normalized.length === 0) return { states: [], probableBreakStateId: null, reasons: ['historical-evidence-absent'] };
  const firstEligibleIndex = normalized.findIndex(historicalStateIsCandidateEligible);
  const breakIndex = firstEligibleIndex < 0
    ? -1
    : normalized.findIndex((state, index) => index > firstEligibleIndex && !historicalStateIsCandidateEligible(state));
  const reasons = firstEligibleIndex < 0
    ? ['no-eligible-baseline-in-available-history']
    : breakIndex >= 0
      ? [`probable-break:${normalized[breakIndex].stateId}`]
      : ['no-probable-break-in-available-history'];
  return {
    states: normalized,
    probableBreakStateId: breakIndex >= 0 ? normalized[breakIndex].stateId : null,
    reasons,
  };
}
