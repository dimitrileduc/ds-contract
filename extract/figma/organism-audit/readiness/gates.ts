import type { OwnerDecision, SectionReadinessDossier } from './schema.js';

const REFERENCE_APPROVALS = new Set<OwnerDecision['decision']>(['reference-validated', 'voluntary-evolution', 'accepted-defect', 'out-of-contract', 'no-reference-recoverable']);

export function referenceGate(dossier: SectionReadinessDossier, decisions: readonly OwnerDecision[]): { allowed: boolean; reasons: string[] } {
  const receipt = decisions.find((decision) => decision.sectionId === dossier.sectionId && decision.gate === 'reference');
  if (!receipt) return { allowed: false, reasons: ['reference-owner-decision-missing'] };
  if (!REFERENCE_APPROVALS.has(receipt.decision)) return { allowed: false, reasons: [`reference-owner-decision-blocks:${receipt.decision}`] };
  return { allowed: true, reasons: [] };
}

export function postRepairGate(dossier: SectionReadinessDossier, decisions: readonly OwnerDecision[]): { allowed: boolean; reasons: string[] } {
  const reference = referenceGate(dossier, decisions);
  if (!reference.allowed) return reference;
  const receipt = decisions.find((decision) => decision.sectionId === dossier.sectionId && decision.gate === 'post-repair');
  if (!receipt) return { allowed: false, reasons: ['post-repair-owner-decision-missing'] };
  if (receipt.decision !== 'repair-accepted') return { allowed: false, reasons: [`post-repair-owner-decision-blocks:${receipt.decision}`] };
  return { allowed: true, reasons: [] };
}
