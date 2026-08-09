import type { CurrentPins } from './preflight.js';
import type { HistoricalState, SectionReadinessDossier, SourceAudit } from './schema.js';
import type { SectionId } from './scope.js';
import { rankCandidates } from './candidates.js';
import { assembleTimeline } from './timeline.js';
import { isReferenceEligible } from './source-cleanliness.js';

export function createHistoryDossier(input: { sectionId: SectionId; sourceAudit: SourceAudit; currentPins: CurrentPins; historicalStates: HistoricalState[] }): SectionReadinessDossier {
  const sourceEligible = isReferenceEligible(input.sourceAudit);
  const timeline = sourceEligible
    ? assembleTimeline(input.historicalStates)
    : { states: [], probableBreakStateId: null, reasons: ['source-audit-not-clean', ...input.sourceAudit.missingSources.map((source) => `missing-source:${source}`)] };
  const candidates = sourceEligible ? rankCandidates(timeline.states, input.currentPins.figma.versionId) : [];
  const blocked = !sourceEligible || candidates.length === 0;
  return {
    schemaVersion: '1.0.0', sectionId: input.sectionId, sourceAudit: input.sourceAudit, currentPins: input.currentPins as unknown as Record<string, unknown>,
    timeline: { probableBreakStateId: timeline.probableBreakStateId, reasons: timeline.reasons },
    historicalStates: timeline.states, candidates, ownerDecisionRefs: [], findings: [],
    impactGraph: { nodes: [], edges: [], completeness: 'partial', missingSources: ['diagnosis-not-run'] },
    status: blocked ? 'blocked-history' : 'awaiting-owner',
  };
}

export function unavailableHistoryDossier(input: { sectionId: SectionId; sourceAudit: SourceAudit; currentPins: CurrentPins; reason: string }): SectionReadinessDossier {
  return createHistoryDossier({
    ...input,
    sourceAudit: { ...input.sourceAudit, missingSources: [...new Set([...input.sourceAudit.missingSources, input.reason])] },
    historicalStates: [],
  });
}
