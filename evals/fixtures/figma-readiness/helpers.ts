import type { HistoricalState, OwnerDecision, SectionReadinessDossier, SourceAudit } from '../../../extract/figma/organism-audit/readiness/schema.js';
import type { SectionId } from '../../../extract/figma/organism-audit/readiness/scope.js';

export const state = (id = 'v1', overrides: Partial<HistoricalState> = {}): HistoricalState => ({
  stateId: id, observedAt: '2026-07-01T00:00:00.000Z', figmaVersionId: id,
  evidence: [
    { evidenceId: `${id}:structure`, kind: 'structure', pathOrUri: `fixture://history/${id}/structure`, sha256: 'a'.repeat(64), availability: 'available', proves: ['structure'], doesNotProve: ['pixels'] },
    { evidenceId: `${id}:visual`, kind: 'visual', pathOrUri: `fixture://history/${id}/visual`, sha256: 'b'.repeat(64), availability: 'available', proves: ['pixels'], doesNotProve: ['structure'] },
  ],
  completeness: 'complete', contradictions: [], knownChanges: [], ...overrides,
});

export const audit = (sectionId: SectionId, overrides: Partial<SourceAudit> = {}): SourceAudit => ({
  sectionId, masterNodeId: `node:${sectionId}`, usagePositions: [`node:${sectionId}:usage`],
  checkedDimensions: ['structure', 'constraints', 'properties', 'variable-bindings', 'sizes', 'descriptions'], missingSources: [], status: 'clean', evidenceRefs: ['source-audit:fixture'], ...overrides,
});

export const decision = (sectionId: SectionId, gate: OwnerDecision['gate'] = 'reference', kind: OwnerDecision['decision'] = 'reference-validated'): OwnerDecision => ({
  schemaVersion: '1.0.0', decisionId: `${sectionId}:${gate}:${kind}`, sectionId, gate, decision: kind, subjectId: gate === 'reference' ? 'candidate:v1' : 'repair:v1',
  rationale: 'fixture owner decision', decidedBy: 'fixture-owner', decidedAt: '2026-08-09T12:00:00.000Z',
  reviewTiming: { startedAt: '2026-08-09T11:59:00.000Z', completedAt: '2026-08-09T12:00:00.000Z', activeSeconds: 60, excludedExplorationSeconds: 0 }, acceptedConsequences: [], receiptRefs: ['fixture-receipt'],
});

export const dossier = (sectionId: SectionId): SectionReadinessDossier => ({
  schemaVersion: '1.0.0', sectionId, sourceAudit: audit(sectionId),
  currentPins: { figma: { nodeId: `node:${sectionId}` }, contract: { sha256: 'a'.repeat(64) }, render: { ref: `render:${sectionId}` } },
  timeline: { probableBreakStateId: null, reasons: ['fixture-history-stable'] },
  historicalStates: [state()], candidates: [{ candidateId: 'candidate:v1', historicalStateId: 'v1', rank: 1, recommendation: 'recommended', rationale: 'fixture', supportingEvidenceIds: ['v1:structure'], missingEvidence: [], contradictions: [] }],
  ownerDecisionRefs: [], findings: [], impactGraph: { nodes: [], edges: [], completeness: 'complete', missingSources: [] }, status: 'awaiting-owner',
});

export function expectThrows(fn: () => unknown, label: string): void {
  try { fn(); } catch { return; }
  throw new Error(`${label} must throw/refuse`);
}
