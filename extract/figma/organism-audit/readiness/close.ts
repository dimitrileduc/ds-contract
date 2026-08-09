import type { OwnerDecision, SectionReadinessDossier } from './schema.js';
import { destinationFor, type FinalVerdict } from './scope.js';
import { referenceGate, postRepairGate } from './gates.js';
import { requireRevalidation, type Repin019Decision } from './revalidation.js';
import type { DependencyImpactGraph } from './impact.js';
import { verdictRequiresRepairSpec, type RepairAssignment } from './routing.js';

export function closeDossier(input: { dossier: SectionReadinessDossier; verdict: FinalVerdict; decisions: readonly OwnerDecision[]; impactGraph: DependencyImpactGraph; repins: readonly Repin019Decision[]; repairAssignment?: RepairAssignment; repaired?: boolean }): SectionReadinessDossier {
  const gate = referenceGate(input.dossier, input.decisions);
  if (!gate.allowed) throw new Error(`cannot close ${input.dossier.sectionId}: ${gate.reasons.join(', ')}`);
  if (input.repaired) {
    const finalGate = postRepairGate(input.dossier, input.decisions);
    if (!finalGate.allowed) throw new Error(`cannot close repaired ${input.dossier.sectionId}: ${finalGate.reasons.join(', ')}`);
  }
  const revalidation = requireRevalidation(input.impactGraph, input.repins);
  if (revalidation.length > 0) throw new Error(`cannot close ${input.dossier.sectionId}: ${revalidation.join(', ')}`);
  if (verdictRequiresRepairSpec(input.verdict) && (!input.repairAssignment || input.repairAssignment.scope !== 'sub-spec' || !input.repairAssignment.subSpecSlug)) throw new Error(`cannot close ${input.dossier.sectionId}: ${input.verdict} requires a named sub-spec assignment`);
  const destination = destinationFor(input.dossier.sectionId, input.verdict, input.repairAssignment?.subSpecSlug);
  return { ...input.dossier, impactGraph: input.impactGraph, finalVerdict: input.verdict, destination, repairAssignment: input.repairAssignment, status: 'closed' };
}
