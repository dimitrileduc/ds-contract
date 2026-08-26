/** Strict, deterministic comparison gates for campaign 021. */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { compareProtectedFacts, compareResponsiveTransitionProtectedFacts, comparableResponsiveMemberFacts, validateResponsiveFacts, type SurfaceFacts } from './facts.js';
import { canonicalize, isObject, stableJson, type JsonRecord } from './json.js';
import type { CaptureSet, ConsumerImpact, DiffFinding, ImageFingerprint, InstanceLink, PresentationScenario, RepairCampaign, RepairTarget, RepairTargetId } from './types.js';

const record = isObject;
export { canonicalize, stableJson };

export interface PresentationScenarioValidation {
  ok: boolean;
  issues: string[];
}

/** Scenario identity includes the explicitly selected presentation. Resizing a
 * single active root cannot satisfy this gate, even when its outer bounds fit. */
export function validatePresentationScenarioResults(
  expected: readonly PresentationScenario[],
  actual: readonly unknown[],
): PresentationScenarioValidation {
  const issues: string[] = [];
  const expectedById = new Map(expected.map((scenario) => [scenario.scenarioId, scenario]));
  const actualRows = actual.filter(record);
  const actualIds = actualRows.map((result) => String(result.scenarioId ?? ''));
  if (actualRows.length !== actual.length || actualRows.length !== expected.length || new Set(actualIds).size !== actualIds.length) {
    issues.push('presentation-scenario-cardinality');
  }
  for (const result of actualRows) {
    const scenarioId = String(result.scenarioId ?? '');
    const scenario = expectedById.get(scenarioId);
    if (!scenario) { issues.push(`presentation-scenario-undeclared:${scenarioId}`); continue; }
    if (result.selectedPresentation !== scenario.presentationValue) issues.push(`presentation-not-selected:${scenarioId}`);
    if (result.width !== scenario.width || result.height !== scenario.height || result.fixtureId !== scenario.fixtureId) {
      issues.push(`presentation-scenario-drift:${scenarioId}`);
    }
    if (!record(result.rootBounds) || Math.abs(Number(result.rootBounds.width) - scenario.width) > 0.01 ||
      !Array.isArray(result.descendantBounds) || result.descendantBounds.length === 0 ||
      result.overflow !== scenario.expectedOverflow || !Array.isArray(result.clippedBy) || result.clippedBy.length !== 0 ||
      result.contentAccessible !== true || result.posterCoverage !== 'cover' || typeof result.captureRef !== 'string' || result.captureRef.length === 0) {
      issues.push(`presentation-scenario-inaccessible:${scenarioId}`);
    }
  }
  for (const scenarioId of expectedById.keys()) if (!actualIds.includes(scenarioId)) issues.push(`presentation-scenario-missing:${scenarioId}`);
  return { ok: issues.length === 0, issues: [...new Set(issues)] };
}

export function validateResponsiveClosureEvidence(
  campaign: RepairCampaign,
  receipt: unknown,
): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!record(receipt)) return { ok: false, issues: ['responsive-receipt-missing'] };
  if (!Array.isArray(receipt.pageWrites) || receipt.pageWrites.length !== 0) issues.push('page-write-forbidden');
  if (!Array.isArray(receipt.childWrites) || receipt.childWrites.length !== 0) issues.push('shared-child-write-forbidden');
  const masters = Array.isArray(receipt.masters) ? receipt.masters.filter(record) : [];
  const scenarios = Array.isArray(receipt.scenarioChecks) ? receipt.scenarioChecks : [];
  const bindings = Array.isArray(receipt.bindingFacts) ? receipt.bindingFacts : [];
  const typography = Array.isArray(receipt.typographyFacts) ? receipt.typographyFacts : [];
  const members = Array.isArray(receipt.memberFacts) ? receipt.memberFacts.filter(record) : [];
  for (const target of campaign.targets.filter((entry) => entry.responsive)) {
    const responsive = target.responsive!;
    const topology = responsive.componentSetTopology;
    const master = masters.filter((entry) => entry.targetId === target.targetId);
    if (master.length !== 1 || master[0].nodeId !== target.masterNodeId || master[0].componentKey !== topology.historicalMember.componentKey ||
      typeof master[0].setNodeId !== 'string' || master[0].setName !== topology.setName || master[0].propertyName !== topology.propertyName ||
      master[0].defaultPresentationValue !== topology.defaultPresentationValue ||
      stableJson([...(master[0].variantNames as unknown[] ?? [])].sort()) !== stableJson([...topology.expectedMemberNames].sort())) {
      issues.push(`responsive-topology-drift:${target.targetId}`);
    }
    const targetScenarios = scenarios.filter((entry) => !record(entry) || entry.targetId === undefined || entry.targetId === target.targetId);
    const scenarioGate = validatePresentationScenarioResults(responsive.presentationScenarios, targetScenarios);
    issues.push(...scenarioGate.issues.map((entry) => `${entry}:${target.targetId}`));
    const factGate = validateResponsiveFacts(responsive, bindings, typography);
    issues.push(...factGate.issues.map((entry) => `${entry}:${target.targetId}`));
    const expectedPresentations = [topology.historicalMember.presentationValue, ...topology.createdMembers.map((entry) => entry.presentationValue)];
    const targetMembers = members.filter((entry) => entry.targetId === undefined || entry.targetId === target.targetId);
    if (targetMembers.length !== expectedPresentations.length) issues.push(`responsive-member-facts-cardinality:${target.targetId}`);
    const previewWidths = new Map([
      [topology.historicalMember.presentationValue, topology.historicalMember.authoringPreviewWidth],
      ...topology.createdMembers.map((entry) => [entry.presentationValue, entry.authoringPreviewWidth] as const),
    ]);
    if (targetMembers.some((entry) => !record(entry.authoringPreview) || entry.authoringPreview.layoutSizingHorizontal !== 'FIXED' ||
      Math.abs(Number(entry.authoringPreview.width) - Number(previewWidths.get(String(entry.presentationValue)))) > 0.01)) {
      issues.push(`responsive-authoring-preview-drift:${target.targetId}`);
    }
    const historical = targetMembers.find((entry) => entry.presentationValue === topology.historicalMember.presentationValue);
    const baseline = historical ? comparableResponsiveMemberFacts(historical) : null;
    if (!historical || expectedPresentations.some((presentation) => {
      const rows = targetMembers.filter((entry) => entry.presentationValue === presentation);
      return rows.length !== 1 || comparableResponsiveMemberFacts(rows[0]) !== baseline;
    })) issues.push(`responsive-member-facts-drift:${target.targetId}`);
  }
  return { ok: issues.length === 0, issues: [...new Set(issues)] };
}

export interface ReconstructionMaterial {
  capture: CaptureSet;
  /** Parsed structure/properties artifacts, keyed by stable artifactId. */
  payloads?: Record<string, unknown>;
  /** Normalized writer receipt for the run that produced the capture. */
  applyReceipt?: unknown;
}

export type IdempotenceCategory = 'geometry' | 'properties' | 'render' | 'images' | 'instances' | 'statuses' | 'receipt';
export interface IdempotenceDifference {
  category: IdempotenceCategory;
  path: string;
  before: unknown;
  after: unknown;
}
export interface IdempotenceComparison {
  ok: boolean;
  differences: IdempotenceDifference[];
  normalizedAfter: unknown;
  normalizedIdempotence: unknown;
}

/** Load only governed JSON payloads. PNG bytes are represented by their SHA-256 metadata. */
export function loadReconstructionMaterial(
  capture: CaptureSet,
  root = process.cwd(),
  applyReceipt?: unknown,
): ReconstructionMaterial {
  const payloads: Record<string, unknown> = {};
  for (const artifact of capture.artifacts) {
    if (artifact.kind !== 'structure' && artifact.kind !== 'properties') continue;
    const absolute = path.resolve(root, artifact.path);
    if (!existsSync(absolute)) continue;
    try { payloads[artifact.artifactId] = JSON.parse(readFileSync(absolute, 'utf8')); }
    catch { payloads[artifact.artifactId] = { unreadable: true }; }
  }
  return { capture, payloads, ...(applyReceipt === undefined ? {} : { applyReceipt }) };
}

function normalizeArtifacts(material: ReconstructionMaterial, kind: 'structure' | 'properties' | 'png'): unknown[] {
  return material.capture.artifacts
    .filter((artifact) => artifact.kind === kind)
    .map((artifact) => ({
      artifactId: artifact.artifactId,
      surfaceId: artifact.surfaceId,
      kind: artifact.kind,
      sha256: artifact.sha256,
      width: artifact.width,
      height: artifact.height,
      byteLength: artifact.byteLength,
      status: artifact.status,
      ...(kind === 'structure' || kind === 'properties'
        ? { payload: material.payloads?.[artifact.artifactId] ?? null }
        : {}),
    }))
    .sort((left, right) => `${left.surfaceId}/${left.artifactId}`.localeCompare(`${right.surfaceId}/${right.artifactId}`));
}

export function normalizeReconstruction(material: ReconstructionMaterial): Record<IdempotenceCategory, unknown> {
  return {
    geometry: normalizeArtifacts(material, 'structure'),
    properties: normalizeArtifacts(material, 'properties'),
    render: normalizeArtifacts(material, 'png'),
    images: [...material.capture.imageFingerprints].sort((left, right) =>
      `${left.hostId}/${left.structuralPath}/${left.paintIndex}`.localeCompare(`${right.hostId}/${right.structuralPath}/${right.paintIndex}`)),
    instances: [...material.capture.instanceLinks].sort((left, right) =>
      `${left.instanceNodeId}/${left.structuralPath}`.localeCompare(`${right.instanceNodeId}/${right.structuralPath}`)),
    statuses: {
      complete: material.capture.complete,
      artifacts: material.capture.artifacts.map((artifact) => ({
        // Report ids carry their capture phase (`after`/`idempotence`) while
        // the governed surface and kind remain the same comparison address.
        artifactId: artifact.kind === 'report' ? `${artifact.surfaceId}:report` : artifact.artifactId,
        status: artifact.status,
      })).sort((left, right) => left.artifactId.localeCompare(right.artifactId)),
    },
    receipt: material.applyReceipt ?? null,
  };
}

export function compareReconstructionIdempotence(
  after: ReconstructionMaterial,
  idempotence: ReconstructionMaterial,
): IdempotenceComparison {
  const normalizedAfter = normalizeReconstruction(after);
  const normalizedIdempotence = normalizeReconstruction(idempotence);
  const differences: IdempotenceDifference[] = [];
  for (const category of ['geometry', 'properties', 'render', 'images', 'instances', 'statuses', 'receipt'] as const) {
    if (stableJson(normalizedAfter[category]) === stableJson(normalizedIdempotence[category])) continue;
    differences.push({
      category,
      path: `$.${category}`,
      before: normalizedAfter[category],
      after: normalizedIdempotence[category],
    });
  }
  return { ok: differences.length === 0, differences, normalizedAfter, normalizedIdempotence };
}

export interface FieldChange { path: string; before: unknown; after: unknown }
export interface ClassifiedChanges { expected: FieldChange[]; unexpected: FieldChange[] }

/** Field-level allowlist. A field is authorized only by an exact path segment. */
export function classifyAllowedChanges(changes: FieldChange[], allowedFields: readonly string[]): ClassifiedChanges {
  const allowed = new Set(allowedFields);
  const expected: FieldChange[] = [];
  const unexpected: FieldChange[] = [];
  for (const change of changes) {
    const segments = [...change.path.matchAll(/(?:^|\.|\[)([^.\[\]]+)/g)].map((match) => match[1].replace(/^['"]|['"]$/g, ''));
    (segments.some((segment) => allowed.has(segment)) ? expected : unexpected).push(change);
  }
  return { expected, unexpected };
}

export interface PreservationComparison<T> { ok: boolean; missing: T[]; extra: T[]; changed: Array<{ before: T; after: T }> }

/**
 * Preservation is one comparison in both cases: pair by ADDRESS, then require
 * the paired values to be byte-equal. Only the address spelling differs, so
 * only the address spelling is passed in — a fix to `changed` detection now
 * lands on both gates at once.
 */
function comparePreserved<T>(
  before: T[],
  after: T[],
  address: (item: T) => string,
): PreservationComparison<T> {
  const left = new Map(before.map((item) => [address(item), item]));
  const right = new Map(after.map((item) => [address(item), item]));
  const missing = [...left].filter(([key]) => !right.has(key)).map(([, item]) => item);
  const extra = [...right].filter(([key]) => !left.has(key)).map(([, item]) => item);
  const changed = [...left].flatMap(([key, item]) => {
    const other = right.get(key);
    return other && stableJson(item) !== stableJson(other) ? [{ before: item, after: other }] : [];
  });
  return { ok: missing.length === 0 && extra.length === 0 && changed.length === 0, missing, extra, changed };
}

const imageAddress = (image: ImageFingerprint): string => `${image.hostId}\0${image.structuralPath}\0${image.paintIndex}`;
/** Exact positional IMAGE gate; equal hashes at exchanged addresses are a failure. */
export const compareImageFingerprints = (
  before: ImageFingerprint[],
  after: ImageFingerprint[],
): PreservationComparison<ImageFingerprint> => comparePreserved(before, after, imageAddress);

const linkAddress = (link: InstanceLink): string => `${link.instanceNodeId}\0${link.structuralPath}`;
/** Exact identity + override gate for stable instance addresses. */
export const compareInstanceLinks = (
  before: InstanceLink[],
  after: InstanceLink[],
): PreservationComparison<InstanceLink> => comparePreserved(before, after, linkAddress);

export interface TargetClosureVerdict {
  targetId: RepairTargetId;
  surfaceCount: number;
  expectedDiffs: DiffFinding[];
  unexpectedDiffs: DiffFinding[];
  unchangedArtifactCount: number;
  imagePreservation: 'pass' | 'fail' | 'not-applicable';
  imageComparison: { mode: 'exact-address' | 'authorized-rehost'; beforeUnique: number; afterUnique: number };
  instancePreservation: 'pass' | 'fail';
  consumerCount: number;
  consumersClosed: boolean;
  limits: string[];
}
export interface CampaignClosureComparison {
  schemaVersion: '1.0.0';
  campaignId: string;
  filePins: { before: string; after: string; idempotence: string | null };
  ok: boolean;
  targetCount: number;
  targets: TargetClosureVerdict[];
  global: {
    beforeArtifacts: number; afterArtifacts: number;
    beforeImageFingerprints: number; afterImageFingerprints: number;
    uniqueImageHashesPreserved: boolean;
    beforeInstanceLinks: number; afterInstanceLinks: number;
    pendingConsumers: number;
  };
}

/**
 * `artifactFor` runs ~14 times per surface across the closure loop, over a list
 * that holds every artifact of the campaign (~180). Indexing once per capture
 * set keeps every call site unchanged and makes the lookup O(1). The WeakMap is
 * keyed by the capture set itself, so the index dies with it.
 */
const artifactIndexes = new WeakMap<CaptureSet, Map<string, CaptureSet['artifacts'][number]>>();

function artifactFor(capture: CaptureSet, surfaceId: string, kind: 'structure' | 'properties' | 'facts' | 'png') {
  let index = artifactIndexes.get(capture);
  if (!index) {
    index = new Map();
    // First writer wins, matching the `.find()` this replaces.
    for (const artifact of capture.artifacts) {
      const key = `${artifact.surfaceId}\0${artifact.kind}`;
      if (!index.has(key)) index.set(key, artifact);
    }
    artifactIndexes.set(capture, index);
  }
  return index.get(`${surfaceId}\0${kind}`);
}

function readFacts(capture: CaptureSet, surfaceId: string, root: string): SurfaceFacts | null {
  const artifact = artifactFor(capture, surfaceId, 'facts');
  if (!artifact || artifact.status !== 'valid') return null;
  try {
    const parsed = JSON.parse(readFileSync(path.resolve(root, artifact.path), 'utf8'));
    return record(parsed) && record(parsed.digests) ? parsed as unknown as SurfaceFacts : null;
  } catch { return null; }
}

function readStructure(capture: CaptureSet, surfaceId: string, root: string): JsonRecord | null {
  const artifact = artifactFor(capture, surfaceId, 'structure');
  if (!artifact || artifact.status !== 'valid') return null;
  try {
    const parsed = JSON.parse(readFileSync(path.resolve(root, artifact.path), 'utf8'));
    return record(parsed) ? parsed : null;
  } catch { return null; }
}

function rootIdentity(node: JsonRecord | null): { id: unknown; type: unknown; componentId: unknown; props: unknown } | null {
  if (!node) return null;
  return { id: node.id, type: node.type, componentId: node.componentId ?? null, props: node.componentProperties ?? {} };
}

/** The one home of the defect-class → scanner-dependency aliasing. The two
 * alias rows are the only classes any current campaign declares; a defect
 * class outside this table selects no consumers (open enum — the receipt then
 * closes vacuously, a named limit of the current vocabulary). */
export function consumersForTarget(campaign: RepairCampaign, target: RepairTarget): ConsumerImpact[] {
  return campaign.consumerImpacts.filter((consumer) =>
    target.projectionDefectIds.some((defect) => defect === consumer.dependencyId ||
      (defect === 'icon-instance-swap' && consumer.dependencyId === 'Button') ||
      (defect === 'composed-prop-forwarding' && consumer.dependencyId === 'SectionHeader')));
}

/** Full campaign comparison. Generated descendants may be rehosted, but image
 *  content remains globally complete and direct-canvas IMAGE addresses remain exact. */
export function verifyCampaignClosure(campaign: RepairCampaign, root = process.cwd()): CampaignClosureComparison {
  const before = campaign.captureSets.before;
  const after = campaign.captureSets.after;
  if (!after) throw new Error('verification requires an after capture');
  const beforeHashes = new Set(before.imageFingerprints.map((image) => image.imageHash));
  const afterHashes = new Set(after.imageFingerprints.map((image) => image.imageHash));
  const uniqueImageHashesPreserved = beforeHashes.size === afterHashes.size && [...beforeHashes].every((hash) => afterHashes.has(hash));
  const pendingConsumers = campaign.consumerImpacts.filter((consumer) => consumer.status === 'pending').length;
  let responsiveClosureIssues: string[] = [];
  if (campaign.targets.some((target) => target.responsive)) {
    const receiptPath = campaign.workflow?.applyReceiptPaths.first;
    if (!receiptPath || !existsSync(path.resolve(root, receiptPath))) responsiveClosureIssues = ['responsive-receipt-missing'];
    else {
      try {
        const receipt = JSON.parse(readFileSync(path.resolve(root, receiptPath), 'utf8'));
        responsiveClosureIssues = validateResponsiveClosureEvidence(campaign, receipt).issues;
      } catch { responsiveClosureIssues = ['responsive-receipt-unreadable']; }
    }
  }
  const targets: TargetClosureVerdict[] = campaign.targets.map((target) => {
    const surfaces = campaign.affectedSurfaces.filter((surface) => surface.targetId === target.targetId);
    const expectedDiffs: DiffFinding[] = [];
    const unexpectedDiffs: DiffFinding[] = [];
    let unchangedArtifactCount = 0;
    if (target.responsive) for (const responsiveIssue of responsiveClosureIssues) unexpectedDiffs.push({
      surfaceId: `${target.targetId}:responsive`, kind: 'unexpected', description: responsiveIssue, diffCount: 1,
      evidenceRef: campaign.workflow?.applyReceiptPaths.first ?? campaign.workflow?.comparisonPath ?? 'proofs/comparison.json',
    });
    for (const surface of surfaces) {
      const artifactKinds = surface.role === 'hidden-instance' ? ['structure', 'properties'] as const : ['structure', 'properties', 'png'] as const;
      for (const kind of artifactKinds) {
        const left = artifactFor(before, surface.surfaceId, kind);
        const right = artifactFor(after, surface.surfaceId, kind);
        if (!left || !right || left.status !== 'valid' || right.status !== 'valid') {
          unexpectedDiffs.push({
            surfaceId: surface.surfaceId, kind: 'unexpected', description: `${kind} capture missing or invalid`, diffCount: 1,
            evidenceRef: right?.path ?? left?.path ?? 'specs/021-figma-projection-repair/proofs/us4/comparison.json',
          });
        } else if (left.sha256 === right.sha256) {
          unchangedArtifactCount++;
        } else {
          expectedDiffs.push({
            surfaceId: surface.surfaceId, kind: 'expected', description: `${kind} changed inside the authorized ${target.kind} repair surface`, diffCount: 1,
            evidenceRef: right.path,
          });
        }
      }
      if (surface.nodeId) {
        const leftIdentity = rootIdentity(readStructure(before, surface.surfaceId, root));
        const rightIdentity = rootIdentity(readStructure(after, surface.surfaceId, root));
        if (!leftIdentity || !rightIdentity || leftIdentity.id !== rightIdentity.id || leftIdentity.type !== rightIdentity.type ||
          leftIdentity.componentId !== rightIdentity.componentId) {
          unexpectedDiffs.push({
            surfaceId: surface.surfaceId, kind: 'unexpected', description: 'root master/instance identity changed', diffCount: 1,
            evidenceRef: artifactFor(after, surface.surfaceId, 'structure')?.path ?? 'specs/021-figma-projection-repair/proofs/us4/comparison.json',
          });
        }
      }
      if (campaign.schemaVersion === '2.0.0') {
        const leftFacts = readFacts(before, surface.surfaceId, root);
        const rightFacts = readFacts(after, surface.surfaceId, root);
        if (!leftFacts || !rightFacts) {
          unexpectedDiffs.push({
            surfaceId: surface.surfaceId, kind: 'unexpected', description: 'protected-facts capture missing or invalid', diffCount: 1,
            evidenceRef: artifactFor(after, surface.surfaceId, 'facts')?.path ?? campaign.workflow?.comparisonPath ?? 'proofs/comparison.json',
          });
        } else {
          const differences = target.responsive
            ? compareResponsiveTransitionProtectedFacts(leftFacts, rightFacts, target.protectedFacts, target.responsive)
            : compareProtectedFacts(leftFacts, rightFacts, target.protectedFacts);
          for (const difference of differences) unexpectedDiffs.push({
            surfaceId: surface.surfaceId,
            kind: 'unexpected',
            description: `protected fact changed: ${difference.fact}`,
            diffCount: 1,
            evidenceRef: artifactFor(after, surface.surfaceId, 'facts')?.path ?? campaign.workflow?.comparisonPath ?? 'proofs/comparison.json',
          });
        }
      }
    }
    const consumers = consumersForTarget(campaign, target);
    const consumersClosed = consumers.every((consumer) => consumer.status !== 'pending' && consumer.status !== 'refused');
    if (!consumersClosed) unexpectedDiffs.push({
      surfaceId: `${target.targetId}:consumers`, kind: 'unexpected', description: 'one or more shared consumers remain open', diffCount: 1,
      evidenceRef: 'specs/021-figma-projection-repair/proofs/us2/consumer-verdicts.json',
    });
    // Both target kinds close on the same global hash gate: exact positional
    // equality implies hash-set equality, so a stricter per-address pass could
    // never flip this verdict. `imageComparison.mode` below records which
    // preservation regime (exact-address vs authorized-rehost) the target ran under.
    const imagePreservation = beforeHashes.size === 0 ? 'not-applicable'
      : uniqueImageHashesPreserved ? 'pass' : 'fail';
    if (imagePreservation === 'fail') unexpectedDiffs.push({
      surfaceId: `${target.targetId}:images`, kind: 'unexpected', description: 'IMAGE content preservation failed', diffCount: 1,
      evidenceRef: 'specs/021-figma-projection-repair/proofs/us4/comparison.json',
    });
    return {
      targetId: target.targetId,
      surfaceCount: surfaces.length,
      expectedDiffs,
      unexpectedDiffs,
      unchangedArtifactCount,
      imagePreservation,
      imageComparison: {
        mode: target.kind === 'direct-canvas' ? 'exact-address' : 'authorized-rehost',
        beforeUnique: beforeHashes.size,
        afterUnique: afterHashes.size,
      },
      instancePreservation: unexpectedDiffs.some((finding) => finding.description.includes('identity')) ? 'fail' : 'pass',
      consumerCount: consumers.length,
      consumersClosed,
      limits: target.kind === 'generated-master' ? ['Generated descendant node IDs are normalized; root component IDs and keys remain authoritative.'] : [],
    };
  });
  const idempotenceReady = campaign.schemaVersion === '2.0.0' || campaign.captureSets.idempotence?.complete === true;
  const ok = before.complete && after.complete && idempotenceReady &&
    uniqueImageHashesPreserved && pendingConsumers === 0 && targets.every((target) => target.unexpectedDiffs.length === 0);
  return {
    schemaVersion: '1.0.0', campaignId: campaign.campaignId,
    filePins: { before: before.fileVersionId, after: after.fileVersionId, idempotence: campaign.captureSets.idempotence?.fileVersionId ?? null },
    ok, targetCount: targets.length, targets,
    global: {
      beforeArtifacts: before.artifacts.length, afterArtifacts: after.artifacts.length,
      beforeImageFingerprints: before.imageFingerprints.length, afterImageFingerprints: after.imageFingerprints.length,
      uniqueImageHashesPreserved,
      beforeInstanceLinks: before.instanceLinks.length, afterInstanceLinks: after.instanceLinks.length,
      pendingConsumers,
    },
  };
}
