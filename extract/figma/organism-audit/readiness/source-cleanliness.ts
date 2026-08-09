import { REQUIRED_SOURCE_DIMENSIONS, requireNodeIdentity, type ReadinessIssue } from './invariants.js';
import { SourceAuditSchema, type SourceAudit } from './schema.js';
import type { SectionId } from './scope.js';

/** Validates source receipts before any historical evidence enters candidate ranking. */
export function auditSourceCleanliness(sectionId: SectionId, receipt: SourceAudit): ReadinessIssue[] {
  const issues: ReadinessIssue[] = [];
  const parsed = SourceAuditSchema.safeParse(receipt);
  if (!parsed.success) {
    issues.push(...parsed.error.issues.map((issue) => ({ code: 'source-schema', path: `$.sourceAudit.${issue.path.join('.')}`, message: issue.message })));
  }
  if (receipt.sectionId !== sectionId) issues.push({ code: 'source-section', path: '$.sourceAudit.sectionId', message: `receipt belongs to ${receipt.sectionId}, expected ${sectionId}` });
  issues.push(...requireNodeIdentity(sectionId, receipt.masterNodeId, receipt.usagePositions));
  const masterIdentity = receipt.masterNodeId.trim().replace(/^node:/i, '');
  if (receipt.usagePositions.some((position) => position.trim().replace(/^node:/i, '') === masterIdentity)) {
    issues.push({ code: 'source-usage-master', path: '$.sourceAudit.usagePositions', message: 'a master node cannot stand in for its observed usage positions' });
  }
  for (const dimension of REQUIRED_SOURCE_DIMENSIONS) if (!receipt.checkedDimensions.includes(dimension)) issues.push({ code: 'source-dimension', path: '$.sourceAudit.checkedDimensions', message: `missing required source dimension: ${dimension}` });
  if (receipt.status === 'clean' && receipt.missingSources.length > 0) issues.push({ code: 'source-cleanliness', path: '$.sourceAudit', message: 'a clean receipt cannot conceal missing sources' });
  if ((receipt.status === 'dirty' || receipt.status === 'blocked') && receipt.evidenceRefs.length === 0) issues.push({ code: 'source-cleanliness', path: '$.sourceAudit.evidenceRefs', message: 'dirty or blocked source requires named evidence' });
  return issues;
}

export function isReferenceEligible(receipt: SourceAudit): boolean {
  return auditSourceCleanliness(receipt.sectionId, receipt).length === 0 && receipt.status === 'clean';
}
