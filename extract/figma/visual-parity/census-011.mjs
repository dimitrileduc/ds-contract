#!/usr/bin/env node
/**
 * 011 SOURCE CENSUS — a deliberately narrow, Figma-read-only receipt.
 *
 * Reads the pinned file/version from the 011 visual campaign, GETs the file
 * at that exact version, then walks the canvas page named "Pages".  Only
 * INSTANCE nodes whose `componentId` belongs to one of the campaign's seven
 * target masters/variants are retained.  The receipt records the exact main
 * component/variant, applied componentProperties, geometry, descendant TEXT
 * content, and every IMAGE paint reference beneath each instance.
 *
 * The normal mode is the ONLY network path and uses one explicit HTTP GET.
 * `--check [receipt]` never reads FIGMA_TOKEN or calls fetch: it rebuilds the
 * census from the receipt's retained source projection and requires bytewise
 * canonical equality.  This makes a supplied source receipt reproducible
 * offline while keeping the Figma access surface auditable.
 *
 * Local output is intentionally bounded to the one proof path below.  No
 * request headers, response URLs, or secret values are serialized.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const CAMPAIGN_RELATIVE = 'specs/011-fix-molecule-convergence/contracts/visual-campaign.json';
const RECEIPT_RELATIVE = 'specs/011-fix-molecule-convergence/proofs/visual/source-census.json';
const CAMPAIGN_PATH = path.join(ROOT, CAMPAIGN_RELATIVE);
const RECEIPT_PATH = path.join(ROOT, RECEIPT_RELATIVE);
const TOOL = 'extract/figma/visual-parity/census-011.mjs';
const TARGET_IDS = [
  'carte',
  'field',
  'member-card',
  'nav-item',
  'product-card',
  'realisation',
  'tab',
];

function fail(message) {
  throw new Error(`census-011: ${message}`);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function requiredString(value, label) {
  if (typeof value !== 'string' || value.length === 0) fail(`${label} must be a non-empty string`);
  return value;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (isRecord(value)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  if (typeof value === 'number' && !Number.isFinite(value)) fail('receipt cannot contain a non-finite number');
  return value;
}

function stableJson(value) {
  return `${JSON.stringify(stable(value), null, 2)}\n`;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function readJson(file, label) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`${label} cannot be read as JSON (${error instanceof Error ? error.message : String(error)})`);
  }
  if (!isRecord(parsed)) fail(`${label} must contain a JSON object`);
  return parsed;
}

/** Reject key names that could accidentally create a secret-bearing receipt.
 * Values remain ordinary Figma text/content and are never inspected here. */
function assertNoTokenKey(value, where = 'receipt') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoTokenKey(item, `${where}[${index}]`));
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (/token/i.test(key)) fail(`${where}.${key} is forbidden: receipts never serialize tokens`);
    assertNoTokenKey(child, `${where}.${key}`);
  }
}

function parseArgs(argv) {
  if (argv.length === 0) return { check: false, receiptPath: RECEIPT_PATH };
  if (argv[0] !== '--check' || argv.length > 2) {
    fail(`usage: node ${TOOL} [--check [source-receipt.json]]`);
  }
  const supplied = argv[1];
  if (supplied !== undefined && (typeof supplied !== 'string' || supplied.length === 0)) {
    fail('--check receipt path must be a non-empty string');
  }
  return { check: true, receiptPath: supplied ? path.resolve(process.cwd(), supplied) : RECEIPT_PATH };
}

function campaignInput() {
  const raw = readFileSync(CAMPAIGN_PATH, 'utf8');
  const campaign = readJson(CAMPAIGN_PATH, 'visual campaign');
  if (!isRecord(campaign.reference)) fail('visual campaign reference must be an object');
  const fileKey = requiredString(campaign.reference.fileKey, 'campaign.reference.fileKey');
  const fileVersion = requiredString(campaign.reference.fileVersion, 'campaign.reference.fileVersion');
  if (!/^\d+$/.test(fileVersion)) fail('campaign.reference.fileVersion must be a pinned numeric version');
  if (campaign.reference.readOnly !== true) fail('campaign.reference.readOnly must be true');
  if (!Array.isArray(campaign.subjects)) fail('campaign.subjects must be an array');

  const subjects = new Map();
  for (const subject of campaign.subjects) {
    if (!isRecord(subject)) fail('every campaign subject must be an object');
    const id = requiredString(subject.id, 'campaign subject id');
    if (subjects.has(id)) fail(`campaign has duplicate subject ${JSON.stringify(id)}`);
    subjects.set(id, {
      id,
      setNodeId: requiredString(subject.figmaSetNodeId, `campaign subject ${id}.figmaSetNodeId`),
    });
  }
  if (subjects.size !== TARGET_IDS.length || TARGET_IDS.some((id) => !subjects.has(id))) {
    fail(`campaign must contain exactly these seven targets: ${TARGET_IDS.join(', ')}`);
  }

  return {
    fileKey,
    fileVersion,
    campaignSha256: sha256(stableJson(campaign)),
    subjects: TARGET_IDS.map((id) => subjects.get(id)),
    // The campaign itself is intentionally not emitted.  Its canonical hash
    // binds the receipt to its semantic input without copying unrelated data.
    rawSha256: sha256(raw),
  };
}

function figmaToken() {
  if (process.env.FIGMA_TOKEN) return process.env.FIGMA_TOKEN;
  const candidates = [path.join(ROOT, '.env.local')];
  try {
    const commonDir = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (commonDir) candidates.push(path.join(path.dirname(commonDir), '.env.local'));
  } catch {
    // The direct workspace .env.local remains the only fallback outside git.
  }
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    const match = readFileSync(candidate, 'utf8').match(/^FIGMA_TOKEN\s*=\s*"?([^"\n]+)"?\s*$/m);
    if (match) return match[1].trim();
  }
  fail('FIGMA_TOKEN not found (environment or .env.local)');
}

function box(value) {
  if (!isRecord(value)) return null;
  const fields = ['x', 'y', 'width', 'height'];
  if (!fields.every((field) => typeof value[field] === 'number' && Number.isFinite(value[field]))) return null;
  return Object.fromEntries(fields.map((field) => [field, value[field]]));
}

function componentProperties(value) {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((property) => {
        const source = isRecord(value[property]) ? value[property] : {};
        return [
          property,
          {
            type: typeof source.type === 'string' ? source.type : null,
            value: Object.hasOwn(source, 'value') ? stable(source.value) : null,
          },
        ];
      }),
  );
}

function nodePathKey(indexPath) {
  return indexPath.map((index) => String(index).padStart(8, '0')).join('.');
}

function walk(node, indexPath, visit) {
  if (!isRecord(node)) return;
  visit(node, indexPath);
  if (!Array.isArray(node.children)) return;
  node.children.forEach((child, index) => walk(child, [...indexPath, index], visit));
}

function textStyle(value) {
  const style = isRecord(value) ? value : {};
  const fields = [
    'fontFamily',
    'fontPostScriptName',
    'fontSize',
    'fontWeight',
    'italic',
    'letterSpacing',
    'lineHeightPx',
    'textCase',
    'textDecoration',
  ];
  return Object.fromEntries(
    fields.flatMap((field) => {
      const candidate = style[field];
      return (
        typeof candidate === 'string' ||
        typeof candidate === 'boolean' ||
        (typeof candidate === 'number' && Number.isFinite(candidate))
      )
        ? [[field, candidate]]
        : [];
    }),
  );
}

/**
 * Collapse Figma's per-character override ids into bounded, inspectable style
 * runs. Rich-text campaign props can then preserve a real Bold range without
 * treating the master default as evidence for every overridden occurrence.
 */
function textStyleRuns(node) {
  const characters = typeof node.characters === 'string' ? node.characters : '';
  const base = textStyle(node.style);
  const overrides = Array.isArray(node.characterStyleOverrides)
    ? node.characterStyleOverrides
    : [];
  const table = isRecord(node.styleOverrideTable) ? node.styleOverrideTable : {};
  if (
    characters.length === 0 ||
    overrides.length !== characters.length ||
    overrides.some((entry) => !Number.isInteger(entry) || entry < 0)
  ) {
    return characters.length > 0
      ? [{ start: 0, end: characters.length, text: characters, style: base }]
      : [];
  }

  const effectiveStyle = (overrideId) => ({
    ...base,
    ...textStyle(table[String(overrideId)]),
  });
  const out = [];
  let start = 0;
  let previous = stableJson(effectiveStyle(overrides[0]));
  for (let index = 1; index <= characters.length; index += 1) {
    const next = index < characters.length
      ? stableJson(effectiveStyle(overrides[index]))
      : null;
    if (next === previous) continue;
    out.push({
      start,
      end: index,
      text: characters.slice(start, index),
      style: JSON.parse(previous),
    });
    start = index;
    previous = next;
  }
  return out;
}

function textFacts(instance) {
  const out = [];
  walk(instance, [], (node, indexPath) => {
    if (node.type !== 'TEXT') return;
    out.push({
      nodeId: requiredString(node.id, 'TEXT node id'),
      name: typeof node.name === 'string' ? node.name : null,
      indexPath,
      visible: node.visible !== false,
      characters: typeof node.characters === 'string' ? node.characters : null,
      styleRuns: textStyleRuns(node),
      bounds: {
        absoluteBoundingBox: box(node.absoluteBoundingBox),
        absoluteRenderBounds: box(node.absoluteRenderBounds),
      },
    });
  });
  return out.sort((a, b) => nodePathKey(a.indexPath).localeCompare(nodePathKey(b.indexPath)) || a.nodeId.localeCompare(b.nodeId));
}

function imageFacts(instance) {
  const out = [];
  const paintFields = ['fills', 'strokes', 'backgrounds'];
  walk(instance, [], (node, indexPath) => {
    for (const field of paintFields) {
      if (!Array.isArray(node[field])) continue;
      node[field].forEach((paint, paintIndex) => {
        if (!isRecord(paint) || paint.type !== 'IMAGE') return;
        out.push({
          nodeId: requiredString(node.id, 'IMAGE paint node id'),
          name: typeof node.name === 'string' ? node.name : null,
          indexPath,
          paintField: field,
          paintIndex,
          nodeVisible: node.visible !== false,
          paintVisible: paint.visible !== false,
          imageRef: typeof paint.imageRef === 'string' ? paint.imageRef : null,
          scaleMode: typeof paint.scaleMode === 'string' ? paint.scaleMode : null,
          imageTransform:
            Array.isArray(paint.imageTransform) &&
            paint.imageTransform.every((row) =>
              Array.isArray(row) &&
              row.every((entry) => typeof entry === 'number' && Number.isFinite(entry)),
            )
              ? stable(paint.imageTransform)
              : null,
          scalingFactor:
            typeof paint.scalingFactor === 'number' && Number.isFinite(paint.scalingFactor)
              ? paint.scalingFactor
              : null,
          rotation:
            typeof node.rotation === 'number' && Number.isFinite(node.rotation)
              ? node.rotation
              : null,
          opacity: typeof paint.opacity === 'number' && Number.isFinite(paint.opacity) ? paint.opacity : null,
          bounds: {
            absoluteBoundingBox: box(node.absoluteBoundingBox),
            absoluteRenderBounds: box(node.absoluteRenderBounds),
          },
        });
      });
    }
  });
  return out.sort((a, b) =>
    nodePathKey(a.indexPath).localeCompare(nodePathKey(b.indexPath)) ||
    a.paintField.localeCompare(b.paintField) ||
    a.paintIndex - b.paintIndex,
  );
}

function nestedInstanceFacts(instance) {
  const out = [];
  walk(instance, [], (node, indexPath) => {
    if (node.type !== 'INSTANCE' || indexPath.length === 0) return;
    out.push({
      nodeId: requiredString(node.id, 'nested INSTANCE node id'),
      name: typeof node.name === 'string' ? node.name : null,
      indexPath,
      visible: node.visible !== false,
      componentId: typeof node.componentId === 'string' ? node.componentId : null,
      componentProperties: componentProperties(node.componentProperties),
      bounds: {
        absoluteBoundingBox: box(node.absoluteBoundingBox),
        absoluteRenderBounds: box(node.absoluteRenderBounds),
      },
    });
  });
  return out.sort((a, b) =>
    nodePathKey(a.indexPath).localeCompare(nodePathKey(b.indexPath)) ||
    a.nodeId.localeCompare(b.nodeId),
  );
}

function findNodeById(document, wantedId) {
  let found = null;
  walk(document, [], (node) => {
    if (node.id === wantedId) found = node;
  });
  return found;
}

function targetComponents(document, input) {
  const byComponentId = new Map();
  const targets = input.subjects.map((subject) => {
    const set = findNodeById(document, subject.setNodeId);
    if (!set) fail(`Figma file has no target ${subject.id} at ${subject.setNodeId}`);
    if (set.type !== 'COMPONENT_SET' && set.type !== 'COMPONENT') {
      fail(`Figma target ${subject.id} ${subject.setNodeId} must be COMPONENT_SET or COMPONENT, got ${String(set.type)}`);
    }
    const components =
      set.type === 'COMPONENT_SET'
        ? (set.children ?? []).filter((child) => isRecord(child) && child.type === 'COMPONENT')
        : [set];
    if (components.length === 0) fail(`Figma target ${subject.id} has no COMPONENT variants`);
    const observed = {
      subjectId: subject.id,
      setNodeId: subject.setNodeId,
      setName: typeof set.name === 'string' ? set.name : null,
      setType: set.type,
      components: components
        .map((component) => ({
          nodeId: requiredString(component.id, `${subject.id} component id`),
          name: typeof component.name === 'string' ? component.name : null,
          type: component.type,
        }))
        .sort((a, b) => a.nodeId.localeCompare(b.nodeId)),
    };
    for (const component of observed.components) {
      if (byComponentId.has(component.nodeId)) fail(`component ${component.nodeId} is claimed by two census targets`);
      byComponentId.set(component.nodeId, { subject: observed, component });
    }
    return observed;
  });
  return { targets, byComponentId };
}

function scanPage(page, byComponentId) {
  const instances = [];
  walk(page, [], (node, indexPath) => {
    if (node.type !== 'INSTANCE' || typeof node.componentId !== 'string') return;
    const main = byComponentId.get(node.componentId);
    if (!main) return;
    instances.push({
      subjectId: main.subject.subjectId,
      nodeId: requiredString(node.id, 'INSTANCE node id'),
      name: typeof node.name === 'string' ? node.name : null,
      indexPath,
      visible: node.visible !== false,
      component: {
        setNodeId: main.subject.setNodeId,
        setName: main.subject.setName,
        setType: main.subject.setType,
        nodeId: main.component.nodeId,
        name: main.component.name,
        type: main.component.type,
      },
      componentProperties: componentProperties(node.componentProperties),
      bounds: {
        absoluteBoundingBox: box(node.absoluteBoundingBox),
        absoluteRenderBounds: box(node.absoluteRenderBounds),
      },
      texts: textFacts(node),
      imageRefs: imageFacts(node),
      nestedInstances: nestedInstanceFacts(node),
    });
  });
  return instances.sort((a, b) =>
    a.subjectId.localeCompare(b.subjectId) ||
    nodePathKey(a.indexPath).localeCompare(nodePathKey(b.indexPath)) ||
    a.nodeId.localeCompare(b.nodeId),
  );
}

function sourceProjection(body, input) {
  if (!isRecord(body.document)) fail('GET /v1/files response has no document');
  const observedVersion = requiredString(body.version, 'Figma response version');
  if (observedVersion !== input.fileVersion) {
    fail(`Figma response version ${observedVersion} does not equal campaign pin ${input.fileVersion}`);
  }
  const pages = (body.document.children ?? []).filter((node) => isRecord(node) && node.type === 'CANVAS' && node.name === 'Pages');
  if (pages.length !== 1) fail(`expected exactly one CANVAS named "Pages", found ${pages.length}`);
  const { targets, byComponentId } = targetComponents(body.document, input);
  const page = pages[0];
  return {
    file: {
      name: typeof body.name === 'string' ? body.name : null,
      version: observedVersion,
    },
    page: {
      id: requiredString(page.id, 'Pages canvas id'),
      name: 'Pages',
    },
    targetComponents: targets,
    instances: scanPage(page, byComponentId),
  };
}

function validateReplaySource(source, input) {
  if (!isRecord(source) || !isRecord(source.file) || !isRecord(source.page)) fail('source receipt has an invalid source projection');
  if (source.file.version !== input.fileVersion) fail('source receipt Figma version does not equal campaign pin');
  if (source.page.name !== 'Pages' || typeof source.page.id !== 'string') fail('source receipt must name the Pages canvas');
  if (!Array.isArray(source.targetComponents) || !Array.isArray(source.instances)) fail('source receipt is missing targets or instances');
  if (source.targetComponents.length !== TARGET_IDS.length) fail('source receipt must retain all seven target component catalogs');

  const allowed = new Map();
  source.targetComponents.forEach((target, targetIndex) => {
    if (!isRecord(target) || target.subjectId !== TARGET_IDS[targetIndex]) fail('source target catalog is not in canonical target order');
    const expected = input.subjects[targetIndex];
    if (target.setNodeId !== expected.setNodeId || !Array.isArray(target.components) || target.components.length === 0) {
      fail(`source target ${expected.id} does not match the current campaign`);
    }
    for (const component of target.components) {
      if (!isRecord(component) || typeof component.nodeId !== 'string') fail(`source target ${expected.id} has an invalid component`);
      if (allowed.has(component.nodeId)) fail(`source target component ${component.nodeId} is duplicated`);
      allowed.set(component.nodeId, target.subjectId);
    }
  });

  const ids = new Set();
  for (const instance of source.instances) {
    if (!isRecord(instance)) fail('source receipt has an invalid instance');
    if (typeof instance.nodeId !== 'string' || ids.has(instance.nodeId)) fail('source receipt has a missing or duplicate instance node id');
    ids.add(instance.nodeId);
    if (!isRecord(instance.component) || allowed.get(instance.component.nodeId) !== instance.subjectId) {
      fail(`source instance ${instance.nodeId} does not point to an exact target component`);
    }
    if (!TARGET_IDS.includes(instance.subjectId)) fail(`source instance ${instance.nodeId} has an unknown target`);
  }
}

function censusFromSource(source, input) {
  validateReplaySource(source, input);
  const targets = source.targetComponents.map((target) => {
    const instances = source.instances.filter((instance) => instance.subjectId === target.subjectId);
    return {
      subjectId: target.subjectId,
      setNodeId: target.setNodeId,
      setName: target.setName,
      setType: target.setType,
      components: target.components,
      instanceCount: instances.length,
      instances,
    };
  });
  const allInstances = targets.flatMap((target) => target.instances);
  const imageRefs = allInstances.flatMap((instance) => instance.imageRefs ?? []);
  const texts = allInstances.flatMap((instance) => instance.texts ?? []);
  return {
    targets,
    totals: {
      targetCount: targets.length,
      instanceCount: allInstances.length,
      textCount: texts.length,
      imagePaintCount: imageRefs.length,
      uniqueImageRefs: [...new Set(imageRefs.map((image) => image.imageRef).filter((imageRef) => typeof imageRef === 'string'))].sort(),
    },
  };
}

function receiptFromSource(source, input) {
  return {
    schemaVersion: 1,
    tool: TOOL,
    readOnly: {
      figma: {
        method: 'GET',
        endpoint: '/v1/files/:fileKey?version=:fileVersion',
        writeOperations: [],
      },
      checkUsesNetwork: false,
    },
    campaign: {
      path: CAMPAIGN_RELATIVE,
      sha256: input.campaignSha256,
      fileKey: input.fileKey,
      fileVersion: input.fileVersion,
    },
    source,
    census: censusFromSource(source, input),
  };
}

async function fetchSource(input, token) {
  const endpoint = `https://api.figma.com/v1/files/${encodeURIComponent(input.fileKey)}?version=${encodeURIComponent(input.fileVersion)}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { 'X-Figma-Token': token },
  });
  if (!response.ok) fail(`Figma GET /v1/files failed with HTTP ${response.status}`);
  let body;
  try {
    body = await response.json();
  } catch {
    fail('Figma GET /v1/files returned invalid JSON');
  }
  if (!isRecord(body)) fail('Figma GET /v1/files returned a non-object response');
  return sourceProjection(body, input);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = campaignInput();
  if (args.check) {
    const received = readJson(args.receiptPath, 'source receipt');
    assertNoTokenKey(received);
    if (!isRecord(received.campaign) || received.campaign.sha256 !== input.campaignSha256) {
      fail('source receipt is stale for the current visual campaign');
    }
    if (received.campaign.fileKey !== input.fileKey || received.campaign.fileVersion !== input.fileVersion) {
      fail('source receipt Figma reference does not equal the current visual campaign');
    }
    const replayed = receiptFromSource(received.source, input);
    const expected = stableJson(replayed);
    const actual = stableJson(received);
    if (actual !== expected) fail('source receipt is not the deterministic replay of its retained source projection');
    console.log(`census-011: check passed (${replayed.census.totals.instanceCount} instances, offline)`);
    return;
  }

  const token = figmaToken();
  const source = await fetchSource(input, token);
  const receipt = receiptFromSource(source, input);
  assertNoTokenKey(receipt);
  const serialized = stableJson(receipt);
  if (serialized.includes(token)) fail('refusing to write a receipt containing the Figma token');
  mkdirSync(path.dirname(RECEIPT_PATH), { recursive: true });
  writeFileSync(RECEIPT_PATH, serialized);
  console.log(`census-011: wrote ${RECEIPT_RELATIVE} (${receipt.census.totals.instanceCount} instances)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
});
