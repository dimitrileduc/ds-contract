import type { HistoricalState, ReferenceCandidate } from './schema.js';
import { compareStableText } from './evidence.js';
import { historicalStateIsCandidateEligible, historicalStateIsRecommendable, normalizeHistoricalStates } from './history.js';

function evidenceScore(state: HistoricalState): number {
  const evidenceKinds = new Set(state.evidence.filter((item) => item.availability === 'available').map((item) => item.kind));
  return evidenceKinds.size * 100 + (state.completeness === 'complete' ? 10 : 0);
}

/** Deterministic, bounded ranking. The caller must explicitly identify the current Figma pin. */
export function rankCandidates(states: readonly HistoricalState[], currentFigmaVersionId: string | null): ReferenceCandidate[] {
  const ranked = normalizeHistoricalStates(states).filter((state) =>
    historicalStateIsCandidateEligible(state)
      && (currentFigmaVersionId === null || state.figmaVersionId !== currentFigmaVersionId),
  ).sort((left, right) =>
    Number(historicalStateIsRecommendable(right)) - Number(historicalStateIsRecommendable(left))
      || evidenceScore(right) - evidenceScore(left)
      || compareStableText(right.observedAt, left.observedAt)
      || compareStableText(left.stateId, right.stateId),
  ).slice(0, 3);
  const recommendedIndex = ranked.findIndex(historicalStateIsRecommendable);
  return ranked.map((state, index) => ({
    candidateId: `candidate:${state.stateId}`, historicalStateId: state.stateId, rank: index + 1,
    recommendation: index === recommendedIndex ? 'recommended' : index < 2 ? 'plausible' : 'fallback',
    rationale: `ranked from ${state.completeness} evidence with ${state.evidence.length} typed evidence record(s)`,
    supportingEvidenceIds: state.evidence.filter((item) => item.availability === 'available').map((item) => item.evidenceId).sort(),
    missingEvidence: state.evidence.filter((item) => item.availability !== 'available').map((item) => `${item.evidenceId}:${item.availability}`).sort(),
    contradictions: [...state.contradictions],
  }));
}

export function rejectCandidateOverflow(candidates: readonly ReferenceCandidate[]): string[] {
  const issues: string[] = [];
  if (candidates.length > 3) issues.push(`candidate-overflow:${candidates.length}`);
  if (new Set(candidates.map((candidate) => candidate.rank)).size !== candidates.length) issues.push('candidate-ranks-duplicate');
  if (candidates.some((candidate) => candidate.rank < 1 || candidate.rank > 3)) issues.push('candidate-rank-out-of-range');
  return issues;
}
