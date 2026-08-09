import type { OwnerDecision, SectionReadinessDossier } from './schema.js';
import { ConsolidatedReadinessSchema } from './schema.js';
import { READINESS_SECTION_IDS } from './scope.js';

export function consolidateReadiness(input: { campaignId: string; dossiers: readonly SectionReadinessDossier[]; ownerDecisions: readonly OwnerDecision[]; odoo019Repins?: unknown[] }): unknown {
  if (input.dossiers.length !== READINESS_SECTION_IDS.length || new Set(input.dossiers.map((dossier) => dossier.sectionId)).size !== READINESS_SECTION_IDS.length) throw new Error('consolidation requires exactly eleven unique dossiers');
  for (const dossier of input.dossiers) if (dossier.status !== 'closed' || !dossier.finalVerdict || !dossier.destination) throw new Error(`dossier is not closed: ${dossier.sectionId}`);
  const reviews = READINESS_SECTION_IDS.map((sectionId) => {
    const decision = input.ownerDecisions.find((item) => item.sectionId === sectionId && item.gate === 'reference');
    if (!decision) throw new Error(`owner reference decision is missing: ${sectionId}`);
    return { sectionId, activeSeconds: decision.reviewTiming.activeSeconds, excludedExplorationSeconds: decision.reviewTiming.excludedExplorationSeconds, withinTarget: decision.reviewTiming.activeSeconds <= 600 };
  });
  const finalRepairs = input.ownerDecisions.filter((decision) => decision.gate === 'post-repair');
  const accepted = finalRepairs.filter((decision) => decision.decision === 'repair-accepted').length;
  const quality = finalRepairs.length === 0 ? { acceptedFirstPass: 0, presentedRepairs: 0, rate: null, status: 'not-applicable' as const } : { acceptedFirstPass: accepted, presentedRepairs: finalRepairs.length, rate: accepted / finalRepairs.length, status: accepted / finalRepairs.length >= 0.9 ? 'passed' as const : 'failed' as const };
  return ConsolidatedReadinessSchema.parse({ schemaVersion: '1.0.0', campaignId: input.campaignId, expectedSections: READINESS_SECTION_IDS, dossiers: input.dossiers.map((dossier) => `dossiers/${dossier.sectionId}/dossier.json`).sort(), dependencySummary: input.dossiers.flatMap((dossier) => dossier.impactGraph.nodes), ownerDecisionSummary: input.ownerDecisions.map((decision) => ({ sectionId: decision.sectionId, decisionId: decision.decisionId, gate: decision.gate })).sort((left, right) => `${left.sectionId}:${left.decisionId}`.localeCompare(`${right.sectionId}:${right.decisionId}`)), repairSpecs: input.dossiers.flatMap((dossier) => dossier.repairAssignment && typeof dossier.repairAssignment === 'object' && 'subSpecSlug' in dossier.repairAssignment && typeof dossier.repairAssignment.subSpecSlug === 'string' ? [dossier.repairAssignment.subSpecSlug] : []).sort(), odoo019Repins: input.odoo019Repins ?? [], qualityMetrics: { ownerPacketReviews: reviews, firstPassRepairAcceptance: quality } });
}
