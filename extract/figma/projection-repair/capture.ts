/**
 * Read-only Figma REST preflight and evidence capture for campaign 021.
 * The module never calls a mutating Plugin API method; application lives in
 * apply.ts and remains gated by a complete `before` set.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { FIGMA_API_BASE } from '../rest/fetch.js';
import { figmaToken } from '../../fidelity-matrix/scripts/env.js';
import { collectSurfaceFacts } from './facts.js';
import { isObject as object, sha256Of as sha256, stableJson, walkStructural as walk, type JsonRecord as Json } from './json.js';
import type { AffectedSurface, CapturePhase, CaptureSet, EvidenceArtifact, ImageFingerprint, InstanceLink, RepairCampaign } from './types.js';

const safeName = (value: string): string => value.replace(/[^a-zA-Z0-9._-]+/g, '_');
/** Evidence files stay indented — they are read by humans during a repair. */
const stable = (value: unknown): string => stableJson(value, 2);

export { figmaToken };

async function getJson<T>(route: string, token: string): Promise<T> {
  const response = await fetch(`${FIGMA_API_BASE}${route}`, { headers: { 'X-Figma-Token': token } });
  if (!response.ok) throw new Error(`Figma API ${response.status} on ${route}: ${(await response.text()).slice(0, 240)}`);
  return response.json() as Promise<T>;
}

async function getBytes(url: string, token: string): Promise<Uint8Array> {
  const response = await fetch(url, { headers: { 'X-Figma-Token': token } });
  if (!response.ok) throw new Error(`Figma image download ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

/** Bounded fan-out. Results are returned in INPUT order, never completion
 *  order, so every downstream write and hash stays byte-identical. */
async function mapBounded<T, R>(items: T[], limit: number, run: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (let index = cursor++; index < items.length; index = cursor++) {
      results[index] = await run(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

export interface FigmaInspection { versionId: string; nodes: Map<string, Json>; file: Json; }

function dimensions(node: Json): { width: number; height: number } | null {
  const box = object(node.absoluteBoundingBox) ? node.absoluteBoundingBox : object(node.boundingBox) ? node.boundingBox : null;
  return box && typeof box.width === 'number' && box.width > 0 && typeof box.height === 'number' && box.height > 0
    ? { width: box.width, height: box.height } : null;
}

function pngDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24 || bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  return width > 0 && height > 0 ? { width, height } : null;
}

export async function inspectFigmaCampaign(
  campaign: RepairCampaign,
  token = figmaToken(),
  options: { enforceVersionPin?: boolean; enforceTopology?: boolean } = {},
): Promise<FigmaInspection> {
  const [versions, file] = await Promise.all([
    getJson<{ versions?: Array<{ id?: string }> }>(`/v1/files/${campaign.filePin.fileKey}/versions`, token),
    getJson<Json>(`/v1/files/${campaign.filePin.fileKey}`, token),
  ]);
  const versionId = versions.versions?.[0]?.id;
  if (!versionId || !/^\d+$/.test(versionId)) throw new Error('Figma versions response does not expose a current numeric version id');
  if (options.enforceVersionPin !== false && versionId !== campaign.filePin.versionId) throw new Error(`file pin drift: expected ${campaign.filePin.versionId}, observed ${versionId}`);
  const nodes = new Map<string, Json>();
  walk(file.document, (node) => { if (typeof node.id === 'string') nodes.set(node.id, node); });
  for (const target of campaign.targets) if (!nodes.has(target.masterNodeId)) throw new Error(`preflight: target ${target.targetId} node ${target.masterNodeId} is absent from the pinned file`);
  if (campaign.schemaVersion === '2.0.0' && options.enforceTopology !== false) assertComponentTopology(campaign, nodes);
  return { versionId, nodes, file };
}

/** Refuse duplicate masters, variant drift and undeclared consumers before a
 * writer can be created. Names are a duplicate/variant snapshot only; node ids
 * remain the mutation identity. */
export function assertComponentTopology(campaign: RepairCampaign, nodes: Map<string, Json>): void {
  // One pass builds both indices. The previous shape materialised the whole
  // node array twice per target — 14 full copies of a 10k+ node file for the
  // 7 live targets — to answer two O(1) questions. Insertion follows traversal
  // order and both consumers still sort, so the observed values are identical.
  const mastersByName = new Map<string, Json[]>();
  const instancesByComponentId = new Map<string, Json[]>();
  for (const node of nodes.values()) {
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      const name = String(node.name ?? '');
      const bucket = mastersByName.get(name);
      if (bucket) bucket.push(node); else mastersByName.set(name, [node]);
    } else if (node.type === 'INSTANCE' && typeof node.id === 'string') {
      const componentId = String(node.componentId);
      const bucket = instancesByComponentId.get(componentId);
      if (bucket) bucket.push(node); else instancesByComponentId.set(componentId, [node]);
    }
  }
  for (const target of campaign.targets) {
    const master = nodes.get(target.masterNodeId);
    if (!master) throw new Error(`preflight: master ${target.masterNodeId} is absent`);
    // v2 validation guarantees a non-empty name; an absent one matches nothing,
    // exactly as the previous `node.name === target.expectedMasterName` filter did.
    const expectedName = target.expectedMasterName;
    const sameNamedMasters = expectedName === undefined ? [] : mastersByName.get(expectedName) ?? [];
    if (sameNamedMasters.length !== 1 || sameNamedMasters[0]?.id !== target.masterNodeId) {
      throw new Error(`preflight: expected exactly one master ${target.expectedMasterName}, observed ${sameNamedMasters.length}`);
    }
    const actualVariantNames = master.type === 'COMPONENT_SET' && Array.isArray(master.children)
      ? master.children.filter((child) => object(child) && child.type === 'COMPONENT').map((child) => String((child as Json).name ?? '')).sort()
      : [];
    const expectedVariantNames = [...(target.expectedVariantNames ?? [])].sort();
    if (stable(actualVariantNames) !== stable(expectedVariantNames)) {
      throw new Error(`preflight: variant snapshot drift for ${target.targetId}: expected ${expectedVariantNames.join(' | ') || '(none)'}, observed ${actualVariantNames.join(' | ') || '(none)'}`);
    }
    const componentIds = new Set([target.masterNodeId, ...(target.variantNodeIds ?? [])]);
    const actualInstanceIds = [...componentIds]
      .flatMap((componentId) => instancesByComponentId.get(componentId) ?? [])
      .map((node) => String(node.id)).sort();
    const declaredInstanceIds = campaign.affectedSurfaces
      .filter((surface) => surface.targetId === target.targetId && ['page-instance', 'preview-instance', 'hidden-instance'].includes(surface.role) && surface.nodeId)
      .map((surface) => surface.nodeId!).sort();
    if (stable(actualInstanceIds) !== stable(declaredInstanceIds)) {
      throw new Error(`preflight: consumer cardinality drift for ${target.targetId}: expected ${declaredInstanceIds.join(',') || '(none)'}, observed ${actualInstanceIds.join(',') || '(none)'}`);
    }
  }
}

/** Adds every instance by component identity; names never participate. */
export function discoverAffectedSurfaces(campaign: RepairCampaign, inspection: FigmaInspection): RepairCampaign {
  const existing = new Set(campaign.affectedSurfaces.map((surface) => surface.nodeId).filter((id): id is string => id !== null));
  const added: AffectedSurface[] = [];
  for (const target of campaign.targets) {
    if (campaign.schemaVersion === '2.0.0') continue;
    const ids = new Set([target.masterNodeId, ...(target.variantNodeIds ?? [])]);
    for (const node of inspection.nodes.values()) {
      if (node.type !== 'INSTANCE' || typeof node.id !== 'string' || !ids.has(String(node.componentId)) || existing.has(node.id)) continue;
      const size = dimensions(node);
      if (!size) throw new Error(`preflight: instance ${node.id} has no positive dimensions`);
      added.push({
        surfaceId: `${target.targetId}:instance:${node.id}`,
        targetId: target.targetId,
        role: 'page-instance', nodeId: node.id, pageComposition: null, structuralPath: null,
        expectedSize: size, impactStatus: 'pending',
      });
      existing.add(node.id);
    }
  }
  const normalized = campaign.affectedSurfaces.map((surface) => {
    if (!surface.nodeId) return surface;
    const node = inspection.nodes.get(surface.nodeId);
    const size = node && dimensions(node);
    return size ? { ...surface, expectedSize: size } : surface;
  });
  return {
    ...campaign,
    targets: campaign.targets.map((target) => ({
      ...target,
      affectedSurfaceIds: [...new Set([...target.affectedSurfaceIds, ...added.filter((surface) => surface.targetId === target.targetId).map((surface) => surface.surfaceId)])],
    })),
    affectedSurfaces: [...normalized, ...added],
  };
}

function imageFingerprints(node: Json): ImageFingerprint[] {
  const fingerprints: ImageFingerprint[] = [];
  walk(node, (entry, structuralPath) => {
    for (const field of ['fills', 'backgrounds']) {
      const paints = entry[field];
      if (!Array.isArray(paints)) continue;
      paints.forEach((paint, paintIndex) => {
        if (!object(paint) || paint.type !== 'IMAGE' || typeof entry.id !== 'string') return;
        const imageHash = typeof paint.imageRef === 'string' ? paint.imageRef : typeof paint.imageHash === 'string' ? paint.imageHash : null;
        if (!imageHash) return;
        fingerprints.push({ hostId: entry.id, structuralPath, paintIndex, imageHash, scaleMode: typeof paint.scaleMode === 'string' ? paint.scaleMode as ImageFingerprint['scaleMode'] : 'FILL', imageTransformHash: paint.imageTransform ? sha256(JSON.stringify(paint.imageTransform)) : null });
      });
    }
  });
  return fingerprints.sort((left, right) => `${left.hostId}/${left.structuralPath}/${left.paintIndex}`.localeCompare(`${right.hostId}/${right.structuralPath}/${right.paintIndex}`));
}

function instanceLinks(node: Json): InstanceLink[] {
  const links: InstanceLink[] = [];
  walk(node, (entry, structuralPath) => {
    if (entry.type !== 'INSTANCE' || typeof entry.id !== 'string' || typeof entry.componentId !== 'string') return;
    links.push({ instanceNodeId: entry.id, masterNodeId: entry.componentId, structuralPath, overrideDigest: sha256(JSON.stringify(entry.componentProperties ?? {})) });
  });
  return links.sort((left, right) => left.instanceNodeId.localeCompare(right.instanceNodeId));
}

function properties(node: Json): Json {
  const entries: Json[] = [];
  walk(node, (entry, structuralPath) => {
    if (entry.componentPropertyDefinitions || entry.componentProperties || entry.componentPropertyReferences) {
      entries.push({ nodeId: entry.id ?? null, structuralPath, definitions: entry.componentPropertyDefinitions ?? {}, values: entry.componentProperties ?? {}, references: entry.componentPropertyReferences ?? {} });
    }
  });
  return { schemaVersion: '1.0.0', entries };
}

export async function captureCampaign(
  campaign: RepairCampaign,
  phase: CapturePhase,
  outputRoot: string,
  token = figmaToken(),
): Promise<{ campaign: RepairCampaign; capture: CaptureSet }> {
  const inspection = await inspectFigmaCampaign(campaign, token, { enforceVersionPin: phase === 'before' });
  const surfaces = campaign.affectedSurfaces.filter((surface) => surface.nodeId !== null);
  const ids = surfaces.map((surface) => surface.nodeId!);
  const response = await getJson<{ nodes?: Record<string, { document?: Json }> }>(`/v1/files/${campaign.filePin.fileKey}/nodes?ids=${encodeURIComponent(ids.join(','))}`, token);
  const images = await getJson<{ images?: Record<string, string | null> }>(`/v1/images/${campaign.filePin.fileKey}?ids=${encodeURIComponent(ids.join(','))}&format=png&scale=1`, token);
  const phaseRoot = path.resolve(outputRoot, phase);
  mkdirSync(phaseRoot, { recursive: true });
  const artifacts: EvidenceArtifact[] = [];
  const imageRows: ImageFingerprint[] = [];
  const links: InstanceLink[] = [];
  // The renders are independent pre-signed downloads (~850 KB × 24 per phase).
  // Fetching them serially inside the loop below spent the whole capture
  // waiting on one round trip at a time; the loop itself is unchanged and still
  // writes and hashes in surface order.
  const pngTargets = surfaces.filter((surface) =>
    surface.role !== 'hidden-instance' &&
    response.nodes?.[surface.nodeId!]?.document &&
    images.images?.[surface.nodeId!]);
  const pngBytes = new Map<string, Uint8Array>();
  const fetched = await mapBounded(pngTargets, 8, (surface) => getBytes(images.images![surface.nodeId!]!, token));
  pngTargets.forEach((surface, index) => pngBytes.set(surface.surfaceId, fetched[index]));
  for (const surface of surfaces) {
    const node = response.nodes?.[surface.nodeId!]?.document;
    const base = safeName(surface.surfaceId);
    if (!node) {
      artifacts.push({ artifactId: `${surface.surfaceId}:structure`, surfaceId: surface.surfaceId, kind: 'structure', path: path.relative(process.cwd(), path.join(phaseRoot, `${base}.structure.json`)), sha256: '0'.repeat(64), width: null, height: null, byteLength: 1, status: 'missing' });
      continue;
    }
    const size = dimensions(node);
    const structurePath = path.join(phaseRoot, `${base}.structure.json`);
    const structureBytes = `${stable(node)}\n`;
    writeFileSync(structurePath, structureBytes);
    artifacts.push({ artifactId: `${surface.surfaceId}:structure`, surfaceId: surface.surfaceId, kind: 'structure', path: path.relative(process.cwd(), structurePath), sha256: sha256(structureBytes), width: null, height: null, byteLength: Buffer.byteLength(structureBytes), status: 'valid' });
    const propertyPath = path.join(phaseRoot, `${base}.properties.json`);
    const propertyBytes = `${stable(properties(node))}\n`;
    writeFileSync(propertyPath, propertyBytes);
    artifacts.push({ artifactId: `${surface.surfaceId}:properties`, surfaceId: surface.surfaceId, kind: 'properties', path: path.relative(process.cwd(), propertyPath), sha256: sha256(propertyBytes), width: null, height: null, byteLength: Buffer.byteLength(propertyBytes), status: 'valid' });
    const factsPath = path.join(phaseRoot, `${base}.facts.json`);
    const factsBytes = `${stable(collectSurfaceFacts(node))}\n`;
    writeFileSync(factsPath, factsBytes);
    artifacts.push({ artifactId: `${surface.surfaceId}:facts`, surfaceId: surface.surfaceId, kind: 'facts', path: path.relative(process.cwd(), factsPath), sha256: sha256(factsBytes), width: null, height: null, byteLength: Buffer.byteLength(factsBytes), status: 'valid' });
    imageRows.push(...imageFingerprints(node));
    links.push(...instanceLinks(node));
    if (surface.role === 'hidden-instance') {
      if (node.visible !== false) throw new Error(`capture: hidden instance ${surface.nodeId} is no longer hidden`);
      continue;
    }
    const url = images.images?.[surface.nodeId!];
    const pngPath = path.join(phaseRoot, `${base}.png`);
    if (!url || !size) {
      artifacts.push({ artifactId: `${surface.surfaceId}:png`, surfaceId: surface.surfaceId, kind: 'png', path: path.relative(process.cwd(), pngPath), sha256: '0'.repeat(64), width: size?.width ?? null, height: size?.height ?? null, byteLength: 1, status: !url ? 'missing' : 'wrong-size' });
      continue;
    }
    const bytes = pngBytes.get(surface.surfaceId) ?? await getBytes(url, token);
    writeFileSync(pngPath, bytes);
    const raster = pngDimensions(bytes);
    // The Figma export can include overflow outside a component's layout box; capture that
    // real raster dimension as evidence instead of hiding the defect behind a false mismatch.
    artifacts.push({ artifactId: `${surface.surfaceId}:png`, surfaceId: surface.surfaceId, kind: 'png', path: path.relative(process.cwd(), pngPath), sha256: sha256(bytes), width: raster?.width ?? null, height: raster?.height ?? null, byteLength: bytes.length, status: bytes.length === 0 ? 'empty' : raster ? 'valid' : 'wrong-size' });
  }
  const complete = surfaces.length > 0 && surfaces.every((surface) => {
    const own = artifacts.filter((artifact) => artifact.surfaceId === surface.surfaceId);
    return (surface.role === 'hidden-instance' || own.some((artifact) => artifact.kind === 'png' && artifact.status === 'valid')) &&
      own.some((artifact) => artifact.kind === 'structure' && artifact.status === 'valid') &&
      (campaign.schemaVersion !== '2.0.0' || own.some((artifact) => artifact.kind === 'facts' && artifact.status === 'valid'));
  });
  const capture: CaptureSet = { captureSetId: `${campaign.campaignId}-${phase}-${campaign.filePin.versionId}`, phase, fileVersionId: inspection.versionId, artifacts, imageFingerprints: imageRows, instanceLinks: links, complete };
  const captureSets = { ...campaign.captureSets, [phase]: capture };
  const nextState = phase === 'before' && complete ? 'ready-to-apply' : campaign.state;
  return { campaign: { ...campaign, captureSets, state: nextState }, capture };
}
