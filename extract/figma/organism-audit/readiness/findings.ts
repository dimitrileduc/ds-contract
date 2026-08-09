import type { SurfaceComparison } from './compare.js';

export type FindingCause = 'design-regression' | 'contract-regression' | 'design-and-contract-regression' | 'renderer-fault' | 'missing-image' | 'voluntary-evolution' | 'accepted-defect' | 'out-of-contract' | 'insufficient-history';
export type Finding = { findingId: string; surface: 'figma' | 'contract' | 'render'; significance: 'significant' | 'informational'; description: string; cause: FindingCause; informationalJustification?: string; dependencyId?: string; };
export const FINDING_CAUSES: readonly FindingCause[] = ['design-regression', 'contract-regression', 'design-and-contract-regression', 'renderer-fault', 'missing-image', 'voluntary-evolution', 'accepted-defect', 'out-of-contract', 'insufficient-history'];

export function classifyFinding(finding: Finding): string[] {
  const issues: string[] = [];
  if (!FINDING_CAUSES.includes(finding.cause)) issues.push(`finding-cause-invalid:${finding.findingId}`);
  if (!finding.description.trim()) issues.push(`finding-description-missing:${finding.findingId}`);
  if (finding.significance === 'informational' && !finding.informationalJustification?.trim()) issues.push(`informational-justification-missing:${finding.findingId}`);
  return issues;
}

export function findingsFromComparisons(comparisons: readonly SurfaceComparison[], cause: FindingCause): Finding[] {
  return comparisons.filter((comparison) => !comparison.equal).map((comparison, index) => ({ findingId: `surface:${comparison.surface}:${index + 1}`, surface: comparison.surface, significance: 'significant', description: comparison.differences.join('; '), cause }));
}
