import type { SectionId } from './scope.js';

export type ReadinessInvariant =
  | 'docs-first'
  | 'source-cleanliness'
  | 'claims-order'
  | 'before-capture'
  | 'position-node-identity'
  | 'no-shared-repair';

export interface ReadinessIssue {
  code: string;
  path: string;
  message: string;
}

export const REQUIRED_SOURCE_DIMENSIONS = [
  'structure', 'constraints', 'properties', 'variable-bindings', 'sizes', 'descriptions',
] as const;

export function requireDocsFirst(consultedDocs: readonly string[]): ReadinessIssue[] {
  const required = ['docs/handoff/', 'docs/FIGMA-CAPABILITY-MATRIX.md', 'docs/STYLE-FIDELITY.md'];
  const issues: ReadinessIssue[] = [];
  for (const expected of required) {
    if (!consultedDocs.some((entry) => entry.includes(expected))) {
      issues.push({ code: 'docs-first', path: '$.consultedDocs', message: `missing required documentation acknowledgement: ${expected}` });
    }
  }
  return issues;
}

export function requireNodeIdentity(sectionId: SectionId, masterNodeId: string, usagePositions: readonly string[]): ReadinessIssue[] {
  const issues: ReadinessIssue[] = [];
  if (masterNodeId.trim() === '') issues.push({ code: 'source-node', path: `$.sections.${sectionId}.masterNodeId`, message: 'master node id is required; names are never identities' });
  if (/^name:/i.test(masterNodeId.trim())) issues.push({ code: 'name-identity', path: `$.sections.${sectionId}.masterNodeId`, message: 'a master must use a node id, never a layer name' });
  if (usagePositions.length === 0) issues.push({ code: 'usage-scan', path: `$.sections.${sectionId}.usagePositions`, message: 'every section must name its observed usage positions/node ids' });
  if (usagePositions.some((usage) => usage.trim() === '' || /^name:/i.test(usage))) {
    issues.push({ code: 'name-identity', path: `$.sections.${sectionId}.usagePositions`, message: 'a usage must be a positional path/node id, never a layer name' });
  }
  return issues;
}

export function requireBeforeCapture(sectionId: SectionId, manifest: { verified: boolean; targets: readonly { nodeId: string; width: number; height: number; bytes: number; captureRef?: string; sha256?: string }[] } | null): ReadinessIssue[] {
  if (manifest === null) return [{ code: 'before-capture', path: `$.sections.${sectionId}.beforeCapture`, message: 'no verified before-capture manifest exists' }];
  if (!manifest.verified || manifest.targets.length === 0 || manifest.targets.some((target) => !target.nodeId || !target.captureRef || !/^[a-f0-9]{64}$/.test(target.sha256 ?? '') || target.width <= 0 || target.height <= 0 || target.bytes <= 0)) {
    return [{ code: 'before-capture', path: `$.sections.${sectionId}.beforeCapture`, message: 'before-capture must contain only non-empty, correctly sized targets' }];
  }
  return [];
}
