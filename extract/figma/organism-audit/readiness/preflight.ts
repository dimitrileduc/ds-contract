import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { compareStableText, sha256 } from './evidence.js';
import type { ReadinessCampaign } from './schema.js';

export interface AffectedTarget { sectionId: string; nodeId: string; }
export interface BeforeCaptureTarget extends AffectedTarget { width: number; height: number; bytes: number; captureRef: string; sha256: string; }
export interface BeforeCaptureManifest { schemaVersion: '1.0.0'; campaignId: string; verified: boolean; targets: BeforeCaptureTarget[]; }
export interface CurrentPins { figma: { versionId: string; nodeId: string }; contract: { path: string; sha256: string }; render: { ref: string }; odoo019: { path: string; sha256: string }; }

export function pinCurrentInputs(campaign: ReadinessCampaign, root: string): Record<string, CurrentPins> {
  const odooPath = path.resolve(root, campaign.odoo019InputLock);
  if (!existsSync(odooPath)) throw new Error(`019 input lock is missing: ${campaign.odoo019InputLock}`);
  const odooHash = sha256(readFileSync(odooPath));
  return Object.fromEntries(campaign.sections.map((section) => {
    const contract = path.resolve(root, section.contractPath);
    if (!existsSync(contract)) throw new Error(`contract pin is missing: ${section.contractPath}`);
    return [section.sectionId, { figma: { versionId: section.current.figmaVersionId, nodeId: section.masterNodeId }, contract: { path: section.contractPath, sha256: sha256(readFileSync(contract)) }, render: { ref: section.current.renderRef }, odoo019: { path: campaign.odoo019InputLock, sha256: odooHash } }];
  }));
}

const targetKey = (target: AffectedTarget): string => `${target.sectionId}\u0000${target.nodeId}`;

/** Verifies an exact affected-target set against real, hashed, correctly sized PNG files. */
export function verifyBeforeCaptureManifest(
  manifest: BeforeCaptureManifest,
  campaign: ReadinessCampaign,
  affectedTargets: readonly AffectedTarget[],
  root: string,
): string[] {
  const campaignSections = new Set<string>(campaign.sections.map((section) => section.sectionId));
  const expectedKeys = affectedTargets.map(targetKey);
  const observedKeys = manifest.targets.map(targetKey);
  const expected = new Set(expectedKeys);
  const observed = new Set(observedKeys);
  const reasons: string[] = [];
  if (manifest.campaignId !== campaign.campaignId) reasons.push('before-capture-campaign-mismatch');
  if (!manifest.verified) reasons.push('manifest-not-verified');
  if (affectedTargets.length === 0) reasons.push('affected-targets-empty');
  if (expected.size !== expectedKeys.length) reasons.push('affected-targets-duplicate');
  if (observed.size !== observedKeys.length) reasons.push('before-capture-targets-duplicate');
  for (const target of affectedTargets) {
    if (!campaignSections.has(target.sectionId)) reasons.push(`affected-target-out-of-scope:${target.sectionId}`);
    if (!target.nodeId.trim() || /^name:/i.test(target.nodeId.trim())) reasons.push(`affected-target-invalid:${target.sectionId}`);
  }
  for (const key of expected) if (!observed.has(key)) reasons.push(`before-capture-missing:${key.replace('\u0000', ':')}`);
  for (const key of observed) if (!expected.has(key)) reasons.push(`before-capture-unexpected:${key.replace('\u0000', ':')}`);
  for (const target of manifest.targets) {
    if (!target.nodeId || !target.captureRef || !/^[a-f0-9]{64}$/.test(target.sha256) || target.width <= 0 || target.height <= 0 || target.bytes <= 0) {
      reasons.push(`before-capture-invalid:${target.sectionId}:${target.nodeId}`);
      continue;
    }
    const absolute = path.resolve(root, target.captureRef);
    const rootPrefix = `${path.resolve(root)}${path.sep}`;
    if (!absolute.startsWith(rootPrefix) || !existsSync(absolute)) {
      reasons.push(`before-capture-file-missing:${target.sectionId}:${target.nodeId}`);
      continue;
    }
    const bytes = readFileSync(absolute);
    if (bytes.length !== target.bytes) reasons.push(`before-capture-byte-mismatch:${target.sectionId}:${target.nodeId}`);
    if (sha256(bytes) !== target.sha256) reasons.push(`before-capture-hash-mismatch:${target.sectionId}:${target.nodeId}`);
    try {
      const png = PNG.sync.read(bytes);
      if (png.width !== target.width || png.height !== target.height) reasons.push(`before-capture-dimension-mismatch:${target.sectionId}:${target.nodeId}`);
    } catch {
      reasons.push(`before-capture-not-png:${target.sectionId}:${target.nodeId}`);
    }
  }
  return [...new Set(reasons)].sort(compareStableText);
}

/** Builds a manifest only when every explicitly affected target has a verified before PNG. */
export function createBeforeCaptureManifest(
  campaign: ReadinessCampaign,
  affectedTargets: readonly AffectedTarget[],
  targets: BeforeCaptureTarget[],
  root: string,
): BeforeCaptureManifest {
  const draft: BeforeCaptureManifest = {
    schemaVersion: '1.0.0',
    campaignId: campaign.campaignId,
    verified: true,
    targets: [...targets].sort((left, right) => compareStableText(left.sectionId, right.sectionId) || compareStableText(left.nodeId, right.nodeId)),
  };
  const reasons = verifyBeforeCaptureManifest(draft, campaign, affectedTargets, root);
  if (reasons.length > 0) throw new Error(`before-capture manifest refused: ${reasons.join(', ')}`);
  return draft;
}
