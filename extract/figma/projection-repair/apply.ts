/** Guarded operation planning for campaign 021. This module has no Figma I/O. */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { isCaptureSetComplete } from './campaign.js';
import { isObject } from './json.js';
import type { ExpectedNodeCreate, RepairCampaign, RepairOperation, RepairTargetId, ResponsiveWriteBoundary } from './types.js';

export interface DirectRepairInput {
  pin: string;
  targetId: 'categories-principales' | 'realisations';
  nodeId: string;
  structuralPath: string;
  allowedFields: string[];
  protectedDigests: { content: string; grid: string };
  changes: Array<{ field: string; value: number }>;
}
export type DirectRepairValidation = { ok: true } | { ok: false; reasons: string[] };

const DIRECT_TARGETS = {
  'categories-principales': { nodeId: '2115:4275', structuralPath: '0', allowed: ['width', 'x'] },
  realisations: { nodeId: '2117:4690', structuralPath: '0', allowed: ['width', 'x'] },
} as const;

/** Pure gate exercised by the adversarial eval fixture (direct-geometry-repair-check).
 * The file-backed plan path is `loadDirect` below, which re-validates from campaign data. */
export function validateDirectRepair(value: unknown): DirectRepairValidation {
  const input = value as Partial<DirectRepairInput>;
  const reasons: string[] = [];
  if (!input || typeof input !== 'object') return { ok: false, reasons: ['shape'] };
  const target = input.targetId && DIRECT_TARGETS[input.targetId];
  if (!target) reasons.push('target');
  if (input.pin !== '2385747041460798575') reasons.push('pin');
  if (!target || input.nodeId !== target.nodeId) reasons.push('node');
  if (!target || input.structuralPath !== target.structuralPath) reasons.push('structural-path');
  if (!Array.isArray(input.allowedFields) || !target || input.allowedFields.some((field) => !target.allowed.includes(field as 'width' | 'x'))) reasons.push('allowlist');
  if (input.protectedDigests?.content !== 'content-ok' || input.protectedDigests?.grid !== 'grid-ok') reasons.push('protected-facts');
  if (!Array.isArray(input.changes) || input.changes.length === 0) reasons.push('changes');
  for (const change of input.changes ?? []) {
    if (!target?.allowed.includes(change.field as 'width' | 'x') || !input.allowedFields?.includes(change.field) || typeof change.value !== 'number') reasons.push(`field:${change.field}`);
  }
  return reasons.length === 0 ? { ok: true } : { ok: false, reasons: [...new Set(reasons)] };
}

interface DirectRepairFile {
  schemaVersion: '1.0.0'; targetId: string; filePin: string;
  targetNodeId: string; targetStructuralPath: string; allowedFields: string[]; protectedPaths: string[];
  operations: Array<{ nodeId: string; structuralPath: string; changes: Record<string, number> }>;
  postconditions: string[];
}
export interface PlannedOperation {
  operationId: string; targetId: RepairTargetId; mechanism: RepairOperation['mechanism']; nodeId: string;
  structuralPath: string | null; changes: Record<string, unknown>; preconditions: Record<string, unknown>[];
  postconditions: Record<string, unknown>[]; source: string;
}
export interface DryRun {
  campaignId: string;
  filePin: string;
  state: string;
  operations: PlannedOperation[];
  expectedCreates: ExpectedNodeCreate[];
  writeBoundary: ResponsiveWriteBoundary | null;
}

const directFiles: Record<'categories-principales' | 'realisations', string> = {
  'categories-principales': 'specs/021-figma-projection-repair/repairs/categories-principales.json',
  realisations: 'specs/021-figma-projection-repair/repairs/realisations.json',
};
function loadDirect(file: string, campaign: RepairCampaign): PlannedOperation[] {
  if (!existsSync(file)) throw new Error(`direct repair declaration is missing: ${file}`);
  const repair = JSON.parse(readFileSync(file, 'utf8')) as DirectRepairFile;
  const target = campaign.targets.find((item) => item.targetId === repair.targetId);
  if (!target || target.kind !== 'direct-canvas') throw new Error(`direct repair target is not authorized: ${repair.targetId}`);
  if (repair.schemaVersion !== '1.0.0' || repair.filePin !== campaign.filePin.versionId ||
    repair.targetNodeId !== target.masterNodeId || repair.targetStructuralPath !== '0' ||
    !Array.isArray(repair.protectedPaths) || repair.protectedPaths.length === 0) {
    throw new Error(`direct repair declaration failed pin/target/protection gate: ${repair.targetId}`);
  }
  if (repair.allowedFields.some((field) => !target.allowedFields.includes(field))) throw new Error(`direct repair allowlist exceeds target grant: ${repair.targetId}`);
  return repair.operations.flatMap((operation, operationIndex) => Object.entries(isObject(operation.changes) ? operation.changes : {}).map(([field, value]) => {
    if (!repair.allowedFields.includes(field) || !target.allowedFields.includes(field) || typeof value !== 'number') {
      throw new Error(`direct repair operation ${repair.targetId}/${operationIndex} changes forbidden field ${field}`);
    }
    return {
      operationId: `direct-${repair.targetId}-${operationIndex}-${field}`,
      targetId: repair.targetId,
      mechanism: field === 'width' ? 'resize' : 'reposition',
      nodeId: operation.nodeId,
      structuralPath: operation.structuralPath,
      changes: { [field]: value },
      preconditions: [
        { field: 'fileVersionId', equals: campaign.filePin.versionId },
        { field: 'targetNodeId', equals: repair.targetNodeId },
        { field: 'structuralPath', equals: operation.structuralPath },
      ],
      postconditions: [{ field, equals: value }],
      source: path.relative(process.cwd(), file),
    } satisfies PlannedOperation;
  }));
}

/** Creates an executable-authority plan but deliberately does not invoke a canvas writer. */
export function dryRunCampaign(campaign: RepairCampaign, root = process.cwd(), targetFilter?: readonly RepairTargetId[]): DryRun {
  const hiddenSurfaces = campaign.affectedSurfaces.filter((surface) => surface.role === 'hidden-instance').map((surface) => surface.surfaceId);
  if (campaign.state !== 'ready-to-apply' || !isCaptureSetComplete(campaign.captureSets.before, campaign.affectedSurfaces.map((surface) => surface.surfaceId), hiddenSurfaces)) {
    throw new Error('dry-run requires a complete before capture and ready-to-apply state');
  }
  const includes = (targetId: RepairTargetId): boolean => !targetFilter || targetFilter.includes(targetId);
  const operations: PlannedOperation[] = campaign.allowedOperations.filter((operation) => includes(operation.targetId)).map((operation) => ({
    operationId: operation.operationId, targetId: operation.targetId, mechanism: operation.mechanism,
    nodeId: operation.nodeId, structuralPath: operation.structuralPath ?? null, changes: operation.changes,
    preconditions: operation.preconditions, postconditions: operation.expectedPostconditions, source: 'campaign.allowlist',
  }));
  const configuredDirectFiles: Record<string, string> = campaign.schemaVersion === '2.0.0'
    ? (campaign.workflow?.directRepairRefs ?? {})
    : directFiles;
  for (const [targetId, file] of Object.entries(configuredDirectFiles)) {
    if (includes(targetId)) operations.push(...loadDirect(path.resolve(root, file), campaign));
  }
  const operationIds = new Set(operations.map((operation) => operation.operationId));
  const expectedCreates = campaign.targets
    .filter((target) => includes(target.targetId))
    .flatMap((target) => target.responsive?.expectedCreates ?? [])
    .filter((expected) => operationIds.has(expected.operationId));
  return {
    campaignId: campaign.campaignId,
    filePin: campaign.filePin.versionId,
    state: campaign.state,
    operations,
    expectedCreates,
    writeBoundary: campaign.writeBoundary ?? null,
  };
}
