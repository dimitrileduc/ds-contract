import { HistoricalStateSchema, type HistoricalState } from './schema.js';
import { compareStableText, evidenceCanSupportReference } from './evidence.js';

/** Normalization preserves what each source cannot prove; it never turns a PNG into structure. */
export function normalizeHistoricalStates(states: readonly HistoricalState[]): HistoricalState[] {
  const parsed = states.map((state) => HistoricalStateSchema.parse(state));
  if (new Set(parsed.map((state) => state.stateId)).size !== parsed.length) throw new Error('historical state ids must be unique within a dossier');
  return parsed
    .map((state) => ({ ...state, evidence: [...state.evidence].sort((left, right) => compareStableText(left.evidenceId, right.evidenceId)), contradictions: [...state.contradictions].sort(compareStableText), knownChanges: [...state.knownChanges].sort(compareStableText) }))
    .sort((left, right) => compareStableText(left.observedAt, right.observedAt) || compareStableText(left.stateId, right.stateId));
}

export function hasAvailableEvidence(state: HistoricalState): boolean {
  return state.evidence.some((item) => evidenceCanSupportReference(item.availability) && item.pathOrUri.trim() !== '');
}

export function historicalStateIsCandidateEligible(state: HistoricalState): boolean {
  return state.completeness !== 'unrecoverable' && state.contradictions.length === 0 && hasAvailableEvidence(state);
}

/** A recommendation requires corroboration across appearance and structure, not an isolated capture. */
export function historicalStateIsRecommendable(state: HistoricalState): boolean {
  if (!historicalStateIsCandidateEligible(state)) return false;
  const availableKinds = new Set(state.evidence.filter((item) => item.availability === 'available').map((item) => item.kind));
  const hasAppearance = ['visual', 'render', 'page', 'image'].some((kind) => availableKinds.has(kind as never));
  const hasStructure = ['structure', 'contract'].some((kind) => availableKinds.has(kind as never));
  return hasAppearance && hasStructure;
}
