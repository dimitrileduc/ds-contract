/**
 * 030 US2 / FR-004 + FR-005 — `--capture-mode light` cuts proof VOLUME, never a
 * guarantee.
 *
 * 029's run-001 wrote 299 files and 104 MB for one section, ~105 of them PNG, across
 * three full capture cycles. The retro's measurement: the pixel was never the
 * instrument of the idempotence verdict — the receipt gate was (`second-pass-not-noop`,
 * structural, documented as such in `docs/internal/component-repair-workflow.md`). So
 * the shots can go and the verdicts must not move.
 *
 * "Same verdicts" is asserted the only way that means anything: the SAME scenario is
 * played twice, once in each mode, and every gate is compared.
 */
import {
  isCaptureSetComplete,
  pngRequiredSurfaceIds,
  validateRepairCampaign,
} from '../../../extract/figma/projection-repair/campaign.js';
import { REQUIRED_COMPONENT_PROTECTION_FACTS } from '../../../extract/figma/projection-repair/types.js';
import type { CaptureSet, CapturePhase, EvidenceArtifact, RepairCampaign } from '../../../extract/figma/projection-repair/types.js';

const clone = <T>(value: T): T => structuredClone(value);
const AT = '2026-08-27T09:00:00.000Z';
const hash = (seed: string): string => seed.padEnd(64, '0').slice(0, 64).replace(/[^a-f0-9]/g, 'a');

/* --------------------------------------------------------------- a campaign */
// 029's ACTUAL surface census, because the 80 % in SC-004 is measured against 029 and a
// toy would measure nothing: 1 master + 4 members + 7 Page usages, each usage doubled by
// its visual context = 19 surfaces, of which 14 are read-only. Those doubled context
// shots are the bulk of what full mode spends, and exactly what the retro names as
// cuttable.
const MEMBERS = 4;
const USAGES = 7;
const surfaces = [
  { surfaceId: 's:master', role: 'master', nodeId: '10:1', size: { width: 1728, height: 2504 } },
  ...Array.from({ length: MEMBERS }, (_unused, index) => ({
    surfaceId: `s:variant:${index}`, role: 'variant', nodeId: `10:${index + 2}`,
    size: { width: 1728, height: 400 + index },
  })),
  ...Array.from({ length: USAGES }, (_unused, index) => ([
    { surfaceId: `s:usage:${index}`, role: 'page-instance', nodeId: `20:${index + 1}`, size: { width: 1550, height: 418 } },
    {
      surfaceId: `s:context:${index}`, role: 'page-context', nodeId: `21:${index + 1}`,
      size: { width: 1728, height: 1200 }, contextFor: `s:usage:${index}`,
    },
  ])).flat(),
] as ReadonlyArray<{
  surfaceId: string; role: string; nodeId: string;
  size: { width: number; height: number }; contextFor?: string;
}>;

const campaign = {
  schemaVersion: '2.0.0',
  campaignId: 'capture-light-fixture',
  workflow: {
    mode: 'single-component', subjectKind: 'organism',
    evidenceRoot: 'specs/component-repairs/fixture/run-001',
    ownerDecisionRoot: 'specs/component-repairs/fixture/run-001/owner',
    comparisonPath: 'specs/component-repairs/fixture/run-001/comparison.json',
    applyReceiptPaths: {
      first: 'specs/component-repairs/fixture/run-001/apply-first.json',
      second: 'specs/component-repairs/fixture/run-001/apply-second.json',
    },
    pageMutationPolicy: 'forbid-direct', directDependencies: [], sharedDependencies: [],
  },
  filePin: { fileKey: 'd9FYAUcqdcNtsuaMgLefvJ', versionId: '2392091518820622154', capturedAt: AT },
  authorityRefs: ['specs/029-figma-responsive-categories/RETRO-PROCESS.md'],
  targets: [{
    targetId: 'fixture-section', kind: 'generated-master', masterNodeId: '10:1',
    reference: {
      referenceId: 'r', sourceKind: 'historical-version', subjectNodeId: '10:1',
      visualFacts: [`${MEMBERS} members`, `${USAGES} usages by position`], decisionRef: 'specs/029-figma-responsive-categories/RETRO-PROCESS.md',
    },
    affectedSurfaceIds: surfaces.map((surface) => surface.surfaceId),
    projectionDefectIds: [], allowedFields: ['layoutSizingHorizontal'],
    protectedFacts: [...REQUIRED_COMPONENT_PROTECTION_FACTS],
    allowedFactChanges: ['geometry'],
    expectedMasterName: 'FixtureSection',
    expectedVariantNames: Array.from({ length: MEMBERS }, (_unused, index) => `M${index}`),
    responsiveWidths: [1440],
  }],
  affectedSurfaces: surfaces.map((surface) => ({
    surfaceId: surface.surfaceId, targetId: 'fixture-section', role: surface.role, nodeId: surface.nodeId,
    pageComposition: null, structuralPath: '0',
    ...('contextFor' in surface ? { contextForSurfaceId: surface.contextFor } : {}),
    expectedSize: surface.size, impactStatus: 'pending',
  })),
  consumerImpacts: [],
  allowedOperations: [{
    operationId: 'op', targetId: 'fixture-section', mechanism: 'set-properties', nodeId: '10:2',
    structuralPath: '0', preconditions: [{ field: 'structuralPath', equals: '0' }],
    changes: { layoutSizingHorizontal: 'FILL' }, expectedPostconditions: [{ field: 'layoutSizingHorizontal', equals: 'FILL' }],
  }],
  writeBoundary: {
    allowedExistingNodeIds: ['10:1', ...Array.from({ length: MEMBERS }, (_unused, index) => `10:${index + 2}`)],
    expectedChangedNodeIds: ['10:1', ...Array.from({ length: MEMBERS }, (_unused, index) => `10:${index + 2}`)],
    readOnlySurfaceNodeIds: surfaces.filter((surface) => surface.role !== 'master' && surface.role !== 'variant').map((surface) => surface.nodeId),
    protectedDependencyNodeIds: [], protectedChildNodeIds: [], protectedChildPaths: [],
    allowedCreateRoles: [], pageWrites: [], childWrites: [],
  },
  captureSets: { before: { captureSetId: 'b', phase: 'before', fileVersionId: '2392091518820622154', artifacts: [], imageFingerprints: [], instanceLinks: [], complete: false } },
  state: 'draft',
  createdAt: AT,
} as unknown as RepairCampaign;

/* -------------------- the simulated capture: the ONE authority decides shots */
// Stands in for `captureCampaign`: facts, structure and properties everywhere, a PNG
// exactly where `pngRequiredSurfaceIds` says one is owed. That is the same call the
// real capture makes, so the fixture measures the real policy, not a copy of it.
function captureLike(subject: RepairCampaign, phase: CapturePhase): { capture: CaptureSet; pngCount: number; bytes: number } {
  const required = pngRequiredSurfaceIds(subject, phase);
  const artifacts: EvidenceArtifact[] = [];
  let bytes = 0;
  let pngCount = 0;
  for (const surface of subject.affectedSurfaces) {
    for (const kind of ['structure', 'properties', 'facts'] as const) {
      const size = 4_000;
      bytes += size;
      artifacts.push({
        artifactId: `${surface.surfaceId}:${kind}`, surfaceId: surface.surfaceId, kind,
        path: `specs/component-repairs/fixture/run-001/captures/${phase}/${surface.surfaceId}.${kind}.json`,
        sha256: hash(`${phase}${surface.surfaceId}${kind}`), width: null, height: null, byteLength: size, status: 'valid',
      });
    }
    if (surface.role === 'hidden-instance' || !required.has(surface.surfaceId)) continue;
    // A real PNG dwarfs the JSON: 029's run-001 averaged ~850 KB a shot.
    const size = 850_000;
    bytes += size;
    pngCount += 1;
    artifacts.push({
      artifactId: `${surface.surfaceId}:png`, surfaceId: surface.surfaceId, kind: 'png',
      path: `specs/component-repairs/fixture/run-001/captures/${phase}/${surface.surfaceId}.png`,
      sha256: hash(`${phase}${surface.surfaceId}png`),
      width: surface.expectedSize.width, height: surface.expectedSize.height, byteLength: size, status: 'valid',
    });
  }
  const complete = subject.affectedSurfaces.every((surface) => {
    const own = artifacts.filter((artifact) => artifact.surfaceId === surface.surfaceId);
    return own.some((artifact) => artifact.kind === 'structure' && artifact.status === 'valid') &&
      own.some((artifact) => artifact.kind === 'facts' && artifact.status === 'valid') &&
      (!required.has(surface.surfaceId) || own.some((artifact) => artifact.kind === 'png' && artifact.status === 'valid'));
  });
  return {
    capture: { captureSetId: `${phase}`, phase, fileVersionId: subject.filePin.versionId, artifacts, imageFingerprints: [], instanceLinks: [], complete },
    pngCount,
    bytes,
  };
}

/** Every gate this fixture can reach without a canvas, as one comparable verdict row. */
function verdicts(mode: 'full' | 'light'): Record<string, unknown> {
  const subject = { ...clone(campaign), captureMode: mode } as RepairCampaign;
  const before = captureLike(subject, 'before');
  const after = captureLike(subject, 'after');
  const idempotence = captureLike(subject, 'idempotence');
  const captured = { ...subject, captureSets: { before: before.capture, after: after.capture, idempotence: idempotence.capture } } as RepairCampaign;

  const surfaceIds = captured.affectedSurfaces.map((surface) => surface.surfaceId);
  const requiredBefore = pngRequiredSurfaceIds(captured, 'before');
  const exemptBefore = surfaceIds.filter((surfaceId) => !requiredBefore.has(surfaceId));

  const draft = validateRepairCampaign(captured);
  const readyToApply = validateRepairCampaign({ ...captured, state: 'ready-to-apply' });
  const verified = validateRepairCampaign({ ...captured, state: 'verified' });

  // §X does not weaken in light: a surface that DOES owe a shot and comes back empty
  // is still refused. Emptying a REQUIRED png is the test; the mode chooses which.
  const emptiedId = [...requiredBefore][0];
  const emptied = clone(captured);
  emptied.captureSets.before = {
    ...emptied.captureSets.before,
    artifacts: emptied.captureSets.before.artifacts.map((artifact) =>
      artifact.surfaceId === emptiedId && artifact.kind === 'png'
        ? { ...artifact, status: 'empty' as const, byteLength: 1 }
        : artifact),
  };

  return {
    draftValid: draft.ok,
    readyToApplyValid: readyToApply.ok,
    verifiedValid: verified.ok,
    beforeComplete: before.capture.complete,
    afterComplete: after.capture.complete,
    idempotenceComplete: idempotence.capture.complete,
    dryRunGate: isCaptureSetComplete(before.capture, surfaceIds, exemptBefore),
    emptyDeclaredSurfaceRefused: !isCaptureSetComplete(emptied.captureSets.before, surfaceIds, exemptBefore),
    factsEverywhere: captured.affectedSurfaces.every((surface) =>
      before.capture.artifacts.some((artifact) => artifact.surfaceId === surface.surfaceId && artifact.kind === 'facts' && artifact.status === 'valid') &&
      before.capture.artifacts.some((artifact) => artifact.surfaceId === surface.surfaceId && artifact.kind === 'structure' && artifact.status === 'valid')),
    _volume: { png: before.pngCount + after.pngCount + idempotence.pngCount, bytes: before.bytes + after.bytes + idempotence.bytes },
  };
}

const full = verdicts('full');
const light = verdicts('light');

/* ------------------------------------------------------ FR-005: same verdicts */
const compare = (row: Record<string, unknown>): Record<string, unknown> => {
  const { _volume, ...gates } = row;
  return gates;
};
if (JSON.stringify(compare(full)) !== JSON.stringify(compare(light))) {
  throw new Error(`light and full do not render the same verdicts:\n  full : ${JSON.stringify(compare(full))}\n  light: ${JSON.stringify(compare(light))}`);
}
for (const [gate, value] of Object.entries(compare(full))) {
  if (value !== true) throw new Error(`fixture setup: gate ${gate} is not true in full mode, so comparing it proves nothing`);
}

/* ------------------------------------------------------- FR-004: less volume */
const fullVolume = full._volume as { png: number; bytes: number };
const lightVolume = light._volume as { png: number; bytes: number };
const saved = 1 - lightVolume.bytes / fullVolume.bytes;
if (saved < 0.8) {
  throw new Error(`light mode saved only ${(saved * 100).toFixed(1)} % of the proof volume; SC-004 requires at least 80 %`);
}
if (lightVolume.png >= fullVolume.png) throw new Error('light mode did not reduce the shot count');

/* --------------------------------------- the shape of what light drops, exactly */
const lightSubject = { ...clone(campaign), captureMode: 'light' as const } as RepairCampaign;
const beforeShots = pngRequiredSurfaceIds(lightSubject, 'before');
const afterShots = pngRequiredSurfaceIds(lightSubject, 'after');
const idempotenceShots = pngRequiredSurfaceIds(lightSubject, 'idempotence');
if (idempotenceShots.size !== 0) throw new Error('light mode still shoots the idempotence cycle');
for (let index = 0; index < USAGES; index += 1) {
  if (beforeShots.has(`s:usage:${index}`) || beforeShots.has(`s:context:${index}`)) {
    throw new Error('light before-capture still shoots the read-only Page usages and their doubled contexts');
  }
}
for (const declared of ['s:master', ...Array.from({ length: MEMBERS }, (_unused, index) => `s:variant:${index}`)]) {
  if (!beforeShots.has(declared)) throw new Error(`light before-capture dropped a DECLARED write surface: ${declared}`);
  if (!afterShots.has(declared)) throw new Error(`light after-capture dropped a surface the campaign says will change: ${declared}`);
}

// Default is untouched: a campaign that names no mode captures exactly as it always did.
const untouched = pngRequiredSurfaceIds(campaign, 'idempotence');
if (untouched.size !== campaign.affectedSurfaces.length) {
  throw new Error('a campaign with no declared capture mode stopped behaving as full');
}

/* -------------------------------------------- capture-mode-mismatch is refused */
// The pin lives in the campaign, so a run cannot change its mind halfway; the CLI
// refuses the second spelling by name. What the schema guarantees is the pin itself.
const pinned = { ...clone(campaign), captureMode: 'light' } as unknown as Record<string, unknown>;
if (!validateRepairCampaign(pinned).ok) throw new Error('a campaign pinned to light was refused');
const bogus = { ...clone(campaign), captureMode: 'moitie' } as unknown as Record<string, unknown>;
const bogusResult = validateRepairCampaign(bogus);
if (bogusResult.ok || !bogusResult.issues.some((issue) => issue.path === '$.captureMode')) {
  throw new Error('an unknown capture mode was accepted');
}

console.log(`✔ capture light: every gate renders the identical verdict in both modes (${Object.keys(compare(full)).length} compared), facts+structure captured on all ${campaign.affectedSurfaces.length} surfaces either way, ${fullVolume.png} shots → ${lightVolume.png} (${(saved * 100).toFixed(1)} % less volume), zero shot at idempotence, and a DECLARED surface that comes back empty is still refused`);
