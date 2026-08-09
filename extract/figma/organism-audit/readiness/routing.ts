import type { FinalVerdict } from './scope.js';

export interface RepairAssignment { scope: 'local-020' | 'sub-spec'; target: string; reason: string; authorizedByDecisionId?: string; affectedTargets: string[]; beforeCaptureManifest?: string; subSpecSlug?: string; repin019Decision?: string; }

export function classifyRepair(input: { target: string; reason: string; affectsSharedDependency?: boolean; changesSchema?: boolean; changesEngine?: boolean; massRestore?: boolean; crossImage?: boolean; authorizedByDecisionId?: string; beforeCaptureManifest?: string; }): RepairAssignment {
  const broad = Boolean(input.affectsSharedDependency || input.changesSchema || input.changesEngine || input.massRestore || input.crossImage);
  if (broad) return { scope: 'sub-spec', target: input.target, reason: input.reason, affectedTargets: [input.target], subSpecSlug: `repair-${input.target.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}` };
  if (!input.authorizedByDecisionId || !input.beforeCaptureManifest) throw new Error('local 020 repair requires an owner decision and a verified before-capture manifest');
  return { scope: 'local-020', target: input.target, reason: input.reason, authorizedByDecisionId: input.authorizedByDecisionId, affectedTargets: [input.target], beforeCaptureManifest: input.beforeCaptureManifest };
}

export function verdictRequiresRepairSpec(verdict: FinalVerdict): boolean {
  return ['repair-figma', 'repair-contract', 'repair-renderer', 'blocked-history'].includes(verdict);
}
