/**
 * Figma REST access for the visual-parity harness — variant enumeration
 * (nodes API) and ground-truth PNGs (images API), disk-cached so a re-run is
 * resumable and an unchanged file costs zero image renders.
 *
 * Cache layout (under out/_cache/, gitignored):
 *   nodes-<fileKey>-<setId>.json          full set subtree + file version
 *   png-<fileKey>-<setId>-<nodeId>@v<version>@2x.png
 *
 * PNGs are keyed by node + FILE VERSION (the nodes response carries it), so
 * an edited file re-fetches and an untouched one replays from disk. Pass
 * --refresh to re-fetch the nodes JSON (and thereby pick up a new version).
 *
 * Politeness: node ids are batched per call (comma-separated ids — one nodes
 * call and one images call per file per run, chunked at 30 ids), with a
 * fixed inter-call delay and one retry on 429.
 *
 * The token comes from .env.local / env (fidelity-matrix env.ts) — node-side
 * only, NEVER printed, never written into any artifact.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { figmaToken } from '../../fidelity-matrix/scripts/env.js';
import type {
  CampaignAlias,
  CampaignCase,
  CampaignSubject,
  VisualCampaign,
} from './campaign.js';

const API_DELAY_MS = 700;
const IDS_PER_CALL = 30;
/** A 429 past this gets refused, never slept through — a real quota reset
 *  can be hours-to-days; sleeping through it silently just LOOKS like a
 *  hung process. Fail loudly with the requested duration named instead. */
const RETRY_AFTER_CAP_MS = 60_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** REST node subtree — only the fields the harness reads. */
export interface RestNode {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /**
   * Bounds Figma used for the PNG export.  Unlike the layout box this can
   * include paint outside the component (for example an absolute underline),
   * and can begin on a fractional coordinate.
   */
  absoluteRenderBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  style?: { fontFamily?: string };
  /** Applied instance values returned by the REST nodes endpoint. */
  componentProperties?: Record<string, { type?: string; value?: string | boolean }>;
  children?: RestNode[];
}

export interface SetInfo {
  fileKey: string;
  setId: string;
  setName: string;
  /** File version the subtree was fetched at (PNG cache key component). */
  version: string;
  /** The set's variant COMPONENT children, canvas order. */
  variants: Array<{ nodeId: string; name: string }>;
  /** Every distinct fontFamily on TEXT nodes inside the set. */
  fontFamilies: string[];
}

async function figmaFetch(url: string): Promise<Response> {
  const headers = { 'X-Figma-Token': figmaToken() };
  // This module is deliberately a read-only Figma client.  Declare GET even
  // though it is fetch's default so a future call-site cannot turn a receipt
  // request into a mutation by accident.
  let res = await fetch(url, { method: 'GET', headers });
  if (res.status === 429) {
    const wait = Number(res.headers.get('retry-after') ?? '5') * 1000;
    if (wait > RETRY_AFTER_CAP_MS) {
      throw new Error(
        `figma API 429 — server asked to wait ${Math.round(wait / 1000)}s, over the ${RETRY_AFTER_CAP_MS / 1000}s cap. Refusing to sleep through it silently: wait for the quota to reset, then re-run.`,
      );
    }
    console.log(`    figma API 429 — backing off ${wait}ms`);
    await sleep(wait);
    res = await fetch(url, { method: 'GET', headers });
  }
  return res;
}

const collectFonts = (node: RestNode, into: Set<string>): void => {
  if (node.type === 'TEXT' && node.style?.fontFamily) into.add(node.style.fontFamily);
  for (const c of node.children ?? []) collectFonts(c, into);
};

/**
 * Enumerate the variant COMPONENT children (and font families) of each set,
 * one nodes call per fileKey. Cached per set; `refresh` re-fetches.
 */
export async function fetchSetInfos(
  cacheDir: string,
  fileKey: string,
  setIds: string[],
  refresh: boolean,
): Promise<Map<string, SetInfo>> {
  mkdirSync(cacheDir, { recursive: true });
  const out = new Map<string, SetInfo>();
  const cachePath = (setId: string) =>
    path.join(cacheDir, `nodes-${fileKey}-${setId.replace(/:/g, '_')}.json`);

  const missing = setIds.filter((id) => refresh || !existsSync(cachePath(id)));
  if (missing.length > 0) {
    const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(missing.join(','))}`;
    const res = await figmaFetch(url);
    if (!res.ok) throw new Error(`nodes API ${res.status} for file ${fileKey} (ids ${missing.join(', ')})`);
    const body = (await res.json()) as {
      version?: string;
      nodes: Record<string, { document: RestNode } | null>;
    };
    for (const setId of missing) {
      const entry = body.nodes[setId];
      if (!entry) throw new Error(`nodes API returned no node for ${fileKey} ${setId} — anchor stale?`);
      writeFileSync(
        cachePath(setId),
        JSON.stringify({ version: body.version ?? 'unversioned', document: entry.document }, null, 1),
      );
    }
    await sleep(API_DELAY_MS);
  }

  for (const setId of setIds) {
    const { version, document } = JSON.parse(readFileSync(cachePath(setId), 'utf8')) as {
      version: string;
      document: RestNode;
    };
    const fonts = new Set<string>();
    collectFonts(document, fonts);
    const variants =
      document.type === 'COMPONENT_SET'
        ? (document.children ?? [])
            .filter((c) => c.type === 'COMPONENT')
            .map((c) => ({ nodeId: c.id, name: c.name }))
        : [{ nodeId: document.id, name: document.name }]; // standalone COMPONENT
    out.set(setId, {
      fileKey,
      setId,
      setName: document.name,
      version,
      variants,
      fontFamilies: [...fonts].sort(),
    });
  }
  return out;
}

/** Values that Figma exposes for a component property on a concrete node. */
export type FigmaObservedPropertyValue = string | boolean;
export type FigmaObservedProperties = Readonly<
  Record<string, FigmaObservedPropertyValue>
>;

/**
 * The campaign projection required to validate immutable Figma references.
 *
 * `observedProperties` is deliberately optional while the case matrix is
 * being populated: an absent map means "check this concrete node exists",
 * never "invent its defaults".  Once declared, every value is compared to
 * the GET response exactly.
 */
export interface FigmaCampaignAliasReference extends Pick<
  CampaignAlias,
  "figmaNodeId"
> {
  observedProperties?: FigmaObservedProperties;
}

export interface FigmaCampaignCaseReference extends Pick<
  CampaignCase,
  "id" | "figmaNodeId"
> {
  observedProperties?: FigmaObservedProperties;
  /** Explicit immutable descendant ids for required geometry parts. */
  figmaPartNodeIds?: Readonly<Record<string, string>>;
  aliases?: readonly FigmaCampaignAliasReference[];
}

export interface FigmaCampaignSubjectReference extends Pick<
  CampaignSubject,
  "id" | "figmaSetNodeId"
> {
  cases: readonly FigmaCampaignCaseReference[];
}

export interface FigmaCampaignReferenceInput extends Pick<
  VisualCampaign,
  "reference"
> {
  subjects: readonly FigmaCampaignSubjectReference[];
}

export type FigmaReferenceNodeKind = "subject-set" | "case" | "alias";
export type FigmaReferenceNodeStatus =
  "valid" | "missing" | "property-mismatch";
export type FigmaReferenceIssueCode =
  | "file-version-mismatch"
  | "node-missing"
  | "part-node-missing"
  | "property-missing"
  | "property-mismatch";

export interface FigmaReferencePropertyMismatch {
  property: string;
  expected: FigmaObservedPropertyValue;
  actual: FigmaObservedPropertyValue | null;
}

export interface FigmaReferenceNodeReceipt {
  kind: FigmaReferenceNodeKind;
  subjectId: string;
  caseId: string | null;
  aliasIndex: number | null;
  nodeId: string;
  status: FigmaReferenceNodeStatus;
  expectedProperties: Record<string, FigmaObservedPropertyValue>;
  actualProperties: Record<string, FigmaObservedPropertyValue> | null;
  propertyMismatches: FigmaReferencePropertyMismatch[];
  geometry: {
    root: RestNode["absoluteBoundingBox"] | null;
    renderBounds: RestNode["absoluteRenderBounds"] | null;
    parts: Record<string, NonNullable<RestNode["absoluteBoundingBox"]>>;
  } | null;
}

export interface FigmaReferenceValidationIssue {
  code: FigmaReferenceIssueCode;
  nodeId: string | null;
  property: string | null;
  expected: string | FigmaObservedPropertyValue | null;
  actual: string | FigmaObservedPropertyValue | null;
}

/**
 * A serializable receipt for one validation pass.  It contains only public
 * identifiers and observed values; headers and the Figma token are never
 * retained.  Arrays and property maps are canonicalized so persisting this
 * value later produces byte-stable JSON for identical Figma input.
 */
export interface FigmaReferenceValidationReceipt {
  api: { method: "GET"; endpoint: "/v1/files/:fileKey/nodes" };
  fileKey: string;
  expectedFileVersion: string;
  observedFileVersions: string[];
  missingVersionResponses: number;
  requestedNodeIds: string[];
  nodes: FigmaReferenceNodeReceipt[];
  issues: FigmaReferenceValidationIssue[];
  ok: boolean;
}

interface FigmaReferenceNode {
  kind: FigmaReferenceNodeKind;
  subjectId: string;
  caseId: string | null;
  aliasIndex: number | null;
  nodeId: string;
  observedProperties?: FigmaObservedProperties;
  figmaPartNodeIds?: Readonly<Record<string, string>>;
}

type RestNodesResponse = {
  version?: string;
  nodes?: Record<string, { document: RestNode } | null>;
};

const propertyName = (name: string): string =>
  name.split("#", 1)[0]?.trim() ?? "";

const sortedProperties = (
  properties: FigmaObservedProperties | undefined,
): Record<string, FigmaObservedPropertyValue> =>
  Object.fromEntries(
    Object.entries(properties ?? {})
      .filter(([name]) => propertyName(name).length > 0)
      .map(([name, value]) => [propertyName(name), value] as const)
      .sort(([a], [b]) => a.localeCompare(b)),
  );

/** Component names encode variant axes as `Axis=value, Other=value`. */
function propertiesFromVariantName(
  name: string,
): Record<string, FigmaObservedPropertyValue> {
  const entries: Array<[string, FigmaObservedPropertyValue]> = [];
  for (const segment of name.split(",")) {
    const equals = segment.indexOf("=");
    if (equals < 1) continue;
    const property = segment.slice(0, equals).trim();
    const value = segment.slice(equals + 1).trim();
    if (property.length > 0 && value.length > 0)
      entries.push([property, value]);
  }
  return Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * Figma puts VARIANT values in component names and applied BOOLEAN / TEXT /
 * INSTANCE_SWAP values in `componentProperties`.  The latter wins when both
 * name the same property because it is the node's applied value.
 */
function observedPropertiesFromNode(
  node: RestNode,
): Record<string, FigmaObservedPropertyValue> {
  const properties: Record<string, FigmaObservedPropertyValue> =
    propertiesFromVariantName(node.name);
  for (const [rawName, definition] of Object.entries(
    node.componentProperties ?? {},
  ).sort(([a], [b]) => a.localeCompare(b))) {
    const name = propertyName(rawName);
    if (
      !name ||
      !definition ||
      (typeof definition.value !== "string" &&
        typeof definition.value !== "boolean")
    )
      continue;
    properties[name] = definition.value;
  }
  return Object.fromEntries(
    Object.entries(properties).sort(([a], [b]) => a.localeCompare(b)),
  );
}

function referenceNodes(
  campaign: FigmaCampaignReferenceInput,
): FigmaReferenceNode[] {
  const nodes: FigmaReferenceNode[] = [];
  for (const subject of campaign.subjects) {
    nodes.push({
      kind: "subject-set",
      subjectId: subject.id,
      caseId: null,
      aliasIndex: null,
      nodeId: subject.figmaSetNodeId,
    });
    for (const campaignCase of subject.cases) {
      nodes.push({
        kind: "case",
        subjectId: subject.id,
        caseId: campaignCase.id,
        aliasIndex: null,
        nodeId: campaignCase.figmaNodeId,
        observedProperties: campaignCase.observedProperties,
        figmaPartNodeIds: campaignCase.figmaPartNodeIds,
      });
      for (const [aliasIndex, alias] of (
        campaignCase.aliases ?? []
      ).entries()) {
        nodes.push({
          kind: "alias",
          subjectId: subject.id,
          caseId: campaignCase.id,
          aliasIndex,
          nodeId: alias.figmaNodeId,
          observedProperties: alias.observedProperties,
        });
      }
    }
  }
  return nodes;
}

/**
 * Validate a campaign's pinned Figma version and every concrete reference.
 *
 * This is intentionally a network-only preflight: it never writes a cache or
 * a receipt.  A caller may persist the returned deterministic receipt in its
 * campaign-owned output directory, while this module remains incapable of
 * making a Figma mutation.  Transport failures still throw; stale references
 * return `ok: false` with all observed mismatches named.
 */
export async function validateCampaignFigmaReference(
  campaign: FigmaCampaignReferenceInput,
): Promise<FigmaReferenceValidationReceipt> {
  const references = referenceNodes(campaign);
  const requestedNodeIds = [
    ...new Set(references.map((reference) => reference.nodeId)),
  ].sort();
  const fetchedNodes = new Map<string, RestNode | null>();
  const observedVersions = new Set<string>();
  let missingVersionResponses = 0;

  for (let index = 0; index < requestedNodeIds.length; index += IDS_PER_CALL) {
    const nodeIds = requestedNodeIds.slice(index, index + IDS_PER_CALL);
    const url = `https://api.figma.com/v1/files/${encodeURIComponent(campaign.reference.fileKey)}/nodes?ids=${encodeURIComponent(nodeIds.join(","))}`;
    const response = await figmaFetch(url);
    if (!response.ok) {
      throw new Error(
        `nodes API ${response.status} for file ${campaign.reference.fileKey} (ids ${nodeIds.join(", ")})`,
      );
    }
    const body = (await response.json()) as RestNodesResponse;
    if (typeof body.version === "string") observedVersions.add(body.version);
    else missingVersionResponses++;
    for (const nodeId of nodeIds)
      fetchedNodes.set(nodeId, body.nodes?.[nodeId]?.document ?? null);
    if (index + IDS_PER_CALL < requestedNodeIds.length)
      await sleep(API_DELAY_MS);
  }

  const issues: FigmaReferenceValidationIssue[] = [];
  const observedFileVersions = [...observedVersions].sort();
  if (
    missingVersionResponses > 0 ||
    observedFileVersions.length !== 1 ||
    observedFileVersions[0] !== campaign.reference.fileVersion
  ) {
    issues.push({
      code: "file-version-mismatch",
      nodeId: null,
      property: null,
      expected: campaign.reference.fileVersion,
      actual:
        observedFileVersions.length === 1
          ? observedFileVersions[0]
          : observedFileVersions.join(",") || null,
    });
  }

  const nodes = references.map((reference): FigmaReferenceNodeReceipt => {
    const expectedProperties = sortedProperties(reference.observedProperties);
    const node = fetchedNodes.get(reference.nodeId) ?? null;
    const base = {
      kind: reference.kind,
      subjectId: reference.subjectId,
      caseId: reference.caseId,
      aliasIndex: reference.aliasIndex,
      nodeId: reference.nodeId,
      expectedProperties,
    };
    if (!node) {
      issues.push({
        code: "node-missing",
        nodeId: reference.nodeId,
        property: null,
        expected: null,
        actual: null,
      });
      return {
        ...base,
        status: "missing",
        actualProperties: null,
        propertyMismatches: [],
        geometry: null,
      };
    }

    const actualProperties = observedPropertiesFromNode(node);
    const propertyMismatches = Object.entries(expectedProperties)
      .filter(([property, expected]) => actualProperties[property] !== expected)
      .map(([property, expected]) => ({
        property,
        expected,
        actual: actualProperties[property] ?? null,
      }));
    for (const mismatch of propertyMismatches) {
      issues.push({
        code:
          mismatch.actual === null ? "property-missing" : "property-mismatch",
        nodeId: reference.nodeId,
        property: mismatch.property,
        expected: mismatch.expected,
        actual: mismatch.actual,
      });
    }
    const descendants = new Map<string, RestNode>();
    const visit = (current: RestNode): void => {
      descendants.set(current.id, current);
      for (const child of current.children ?? []) visit(child);
    };
    visit(node);
    const parts: Record<
      string,
      NonNullable<RestNode["absoluteBoundingBox"]>
    > = {};
    for (const [partName, partNodeId] of Object.entries(
      reference.figmaPartNodeIds ?? {},
    ).sort(([left], [right]) => left.localeCompare(right))) {
      const partNode = descendants.get(partNodeId);
      if (!partNode?.absoluteBoundingBox) {
        issues.push({
          code: "part-node-missing",
          nodeId: partNodeId,
          property: partName,
          expected: partNodeId,
          actual: null,
        });
        continue;
      }
      parts[partName] = { ...partNode.absoluteBoundingBox };
    }
    return {
      ...base,
      status:
        propertyMismatches.length === 0 &&
        Object.keys(parts).length ===
          Object.keys(reference.figmaPartNodeIds ?? {}).length
          ? "valid"
          : "property-mismatch",
      actualProperties,
      propertyMismatches,
      geometry: {
        root: node.absoluteBoundingBox
          ? { ...node.absoluteBoundingBox }
          : null,
        renderBounds: node.absoluteRenderBounds
          ? { ...node.absoluteRenderBounds }
          : null,
        parts,
      },
    };
  });

  return {
    api: { method: "GET", endpoint: "/v1/files/:fileKey/nodes" },
    fileKey: campaign.reference.fileKey,
    expectedFileVersion: campaign.reference.fileVersion,
    observedFileVersions,
    missingVersionResponses,
    requestedNodeIds,
    nodes,
    issues,
    ok: issues.length === 0,
  };
}

/**
 * Fetch scale=2 PNGs for the given nodes (all in one file), disk-cached by
 * node + file version. Returns nodeId → absolute PNG path (null when the
 * images API declined to render the node — reported, never guessed).
 */
export async function fetchNodePngs(
  cacheDir: string,
  fileKey: string,
  setId: string,
  version: string,
  nodeIds: string[],
): Promise<Map<string, string | null>> {
  mkdirSync(cacheDir, { recursive: true });
  const pngPath = (nodeId: string) =>
    path.join(
      cacheDir,
      `png-${fileKey}-${setId.replace(/:/g, '_')}-${nodeId.replace(/[:;]/g, '_')}@v${version}@2x.png`,
    );

  const out = new Map<string, string | null>();
  const missing = nodeIds.filter((id) => !existsSync(pngPath(id)));

  for (let i = 0; i < missing.length; i += IDS_PER_CALL) {
    const chunk = missing.slice(i, i + IDS_PER_CALL);
    const url = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(chunk.join(','))}&format=png&scale=2`;
    const res = await figmaFetch(url);
    if (!res.ok) throw new Error(`images API ${res.status} for file ${fileKey}`);
    const body = (await res.json()) as { images: Record<string, string | null> };
    for (const nodeId of chunk) {
      const imageUrl = body.images[nodeId];
      if (!imageUrl) {
        out.set(nodeId, null);
        continue;
      }
      const png = await fetch(imageUrl, { method: 'GET' });
      if (!png.ok) throw new Error(`image download ${png.status} for ${fileKey} ${nodeId}`);
      writeFileSync(pngPath(nodeId), Buffer.from(await png.arrayBuffer()));
    }
    await sleep(API_DELAY_MS);
  }

  for (const nodeId of nodeIds) {
    if (out.get(nodeId) === null) continue; // declined above
    out.set(nodeId, existsSync(pngPath(nodeId)) ? pngPath(nodeId) : null);
  }
  return out;
}
