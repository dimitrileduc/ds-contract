import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PNG } from 'pngjs';
import { stableJson, sha256, unavailableEvidenceReason } from '../../../extract/figma/organism-audit/readiness/evidence.js';
import { sameInventory, READINESS_SECTION_IDS } from '../../../extract/figma/organism-audit/readiness/scope.js';
import { auditSourceCleanliness, isReferenceEligible } from '../../../extract/figma/organism-audit/readiness/source-cleanliness.js';
import { requireBeforeCapture, requireNodeIdentity } from '../../../extract/figma/organism-audit/readiness/invariants.js';
import { createBeforeCaptureManifest } from '../../../extract/figma/organism-audit/readiness/preflight.js';
import { HistoricalStateSchema } from '../../../extract/figma/organism-audit/readiness/schema.js';
import { audit, expectThrows } from './helpers.js';

if (!sameInventory([...READINESS_SECTION_IDS])) throw new Error('the exact eleven-section campaign is not accepted');
if (sameInventory(READINESS_SECTION_IDS.slice(1))) throw new Error('a campaign missing a section was accepted');
if (sameInventory([...READINESS_SECTION_IDS.slice(0, 10), 'hero'])) throw new Error('a duplicate campaign section was accepted');
if (stableJson({ z: 1, a: { y: 2, x: 3 } }) !== stableJson({ a: { x: 3, y: 2 }, z: 1 })) throw new Error('stable JSON is not key-order deterministic');
if (sha256('pins') !== sha256('pins')) throw new Error('pinning is not deterministic');
expectThrows(() => unavailableEvidenceReason('missing', ''), 'unnamed unavailable evidence');
if (requireNodeIdentity('hero', 'node:1', ['name:Hero']).length === 0) throw new Error('name-based identity was accepted');
if (isReferenceEligible(audit('hero', { masterNodeId: 'name:Hero', usagePositions: ['name:Hero usage'] }))) throw new Error('name-based source receipt became reference eligible');
if (requireBeforeCapture('hero', null).length === 0) throw new Error('missing before capture was accepted');
if (requireBeforeCapture('hero', { verified: true, targets: [{ nodeId: '1', width: 0, height: 1, bytes: 1, captureRef: 'before.png', sha256: 'a'.repeat(64) }] }).length === 0) throw new Error('empty before capture was accepted');
const campaign = { campaignId: 'fixture', sections: READINESS_SECTION_IDS.map((sectionId) => ({ sectionId })) } as any;
const captureRoot = mkdtempSync(path.join(tmpdir(), 'readiness-before-'));
try {
  const png = new PNG({ width: 1, height: 1 });
  png.data.set([255, 255, 255, 255]);
  const bytes = PNG.sync.write(png);
  const affected = [...READINESS_SECTION_IDS.map((sectionId) => ({ sectionId, nodeId: `node:${sectionId}` })), { sectionId: 'hero', nodeId: 'node:hero:usage-2' }];
  const targets = affected.map((target) => {
    const captureRef = `${target.sectionId}-${target.nodeId.replaceAll(':', '-')}.png`;
    writeFileSync(path.join(captureRoot, captureRef), bytes);
    return { ...target, width: 1, height: 1, bytes: bytes.length, captureRef, sha256: sha256(bytes) };
  });
  const capture = createBeforeCaptureManifest(campaign, affected, targets, captureRoot);
  if (!capture.verified || capture.targets.length !== affected.length) throw new Error('complete capture manifest was not verified');
  expectThrows(() => createBeforeCaptureManifest(campaign, affected, targets.slice(0, -1), captureRoot), 'missing affected before-capture target');
  expectThrows(() => createBeforeCaptureManifest(campaign, affected, targets.map((target, index) => index === 0 ? { ...target, captureRef: 'missing.png' } : target), captureRoot), 'missing before-capture file');
} finally {
  rmSync(captureRoot, { recursive: true, force: true });
}
const parsedEvidence = HistoricalStateSchema.parse({ stateId: 'proof', observedAt: '2026-08-09T00:00:00.000Z', figmaVersionId: 'figma-proof-version', evidence: [{ evidenceId: 'proof:visual', kind: 'visual', pathOrUri: 'proofs/visual.png', sha256: 'd'.repeat(64), capturedAt: '2026-08-09T00:00:00.000Z', availability: 'available', proves: ['pixels'], doesNotProve: ['structure'] }], completeness: 'partial', contradictions: [], knownChanges: [] });
if (parsedEvidence.evidence[0].pathOrUri !== 'proofs/visual.png' || parsedEvidence.evidence[0].sha256 !== 'd'.repeat(64)) throw new Error('evidence provenance was stripped by schema parsing');
expectThrows(() => HistoricalStateSchema.parse({ stateId: 'bad-date', observedAt: 'someday', evidence: parsedEvidence.evidence, completeness: 'partial', contradictions: [] }), 'non-ISO historical date');
expectThrows(() => HistoricalStateSchema.parse({ stateId: 'missing-version', observedAt: '2026-08-09T00:00:00.000Z', evidence: parsedEvidence.evidence, completeness: 'partial', contradictions: [] }), 'available Figma evidence without version pin');
const clean = audit('hero');
if (auditSourceCleanliness('hero', clean).length !== 0 || !isReferenceEligible(clean)) throw new Error('complete clean source receipt was rejected');
const dirty = audit('hero', { status: 'dirty', evidenceRefs: [] });
if (auditSourceCleanliness('hero', dirty).length === 0 || isReferenceEligible(dirty)) throw new Error('dirty source was allowed to become reference evidence');
console.log('✔ readiness foundation refuses incomplete scope, unnamed or unpinned evidence, name identity, incomplete before-capture sets, invalid PNG receipts, and dirty sources');
