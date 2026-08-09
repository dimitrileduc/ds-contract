import type { SectionReadinessDossier } from './schema.js';

export interface OwnerPacket { sectionId: string; currentPins: unknown; probableBreak: string | null; candidates: unknown[]; recommendation: string | null; unavailableEvidence: string[]; }

/** The packet contains evidence and a recommendation, never a hidden approval. */
export function renderOwnerPacket(dossier: SectionReadinessDossier): OwnerPacket {
  const unavailableEvidence = [
    ...dossier.historicalStates.flatMap((state) => state.evidence.filter((evidence) => evidence.availability !== 'available').map((evidence) => `${evidence.evidenceId}:${evidence.availability}:${evidence.reason ?? 'reason-not-recorded'}`)),
    ...dossier.sourceAudit.missingSources.map((source) => `source-audit:missing:${source}`),
  ].sort();
  return {
    sectionId: dossier.sectionId, currentPins: dossier.currentPins,
    probableBreak: dossier.timeline.probableBreakStateId,
    candidates: [...dossier.candidates].sort((left, right) => left.rank - right.rank),
    recommendation: dossier.candidates.find((candidate) => candidate.recommendation === 'recommended')?.candidateId ?? null,
    unavailableEvidence,
  };
}
