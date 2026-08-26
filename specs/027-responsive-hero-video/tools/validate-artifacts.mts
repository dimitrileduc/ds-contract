import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { PNG } from 'pngjs';

import { formatValidation, readJson, type JsonValue, type ValidationIssue, type ValidationResult } from './schema-validation.js';

type RecordValue = Record<string, JsonValue>;

export interface ArtifactValidationOptions {
  rootDir?: string;
  now?: Date;
}

const isRecord = (value: JsonValue | undefined): value is RecordValue => typeof value === 'object' && value !== null && !Array.isArray(value);
const asRecords = (value: JsonValue | undefined): RecordValue[] => Array.isArray(value) ? value.filter(isRecord) : [];
const text = (record: RecordValue, key: string): string | undefined => typeof record[key] === 'string' ? record[key] : undefined;
const number = (record: RecordValue, key: string): number | undefined => typeof record[key] === 'number' ? record[key] : undefined;
const issue = (errors: ValidationIssue[], path: string, message: string): void => { errors.push({ path, message }); };
const digest = /^[a-f0-9]{64}$/;
const CONDITION_KEYS = ['fixtureId', 'contentCase', 'mediaCase', 'fontFamily', 'locale', 'conditionsDigest'] as const;

function dimensions(bytes: Buffer): { width: number; height: number } | undefined {
  if (bytes.length >= 24 && bytes.subarray(1, 4).toString('ascii') === 'PNG') {
    try {
      const png = PNG.sync.read(bytes);
      return { width: png.width, height: png.height };
    } catch {
      return undefined;
    }
  }
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return undefined;
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return undefined;
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > bytes.length) return undefined;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return undefined;
}

function resolvedArtifactPath(rootDir: string, artifactPath: string): string {
  return isAbsolute(artifactPath) ? artifactPath : resolve(rootDir, artifactPath);
}

function conditionsOf(record: RecordValue): RecordValue | undefined {
  return isRecord(record.conditions) ? record.conditions : undefined;
}

function validateEnvelope(manifest: RecordValue | undefined, errors: ValidationIssue[]): {
  freshness?: RecordValue;
  conditions?: RecordValue;
  comparisons: RecordValue[];
} {
  if (!manifest) {
    issue(errors, '$', 'artifact evidence must be a manifest object');
    return { comparisons: [] };
  }
  const freshness = isRecord(manifest.freshness) ? manifest.freshness : undefined;
  if (!freshness) issue(errors, '$.freshness', 'is required');
  else {
    const capturedAfter = text(freshness, 'capturedAfter');
    if (!capturedAfter || Number.isNaN(Date.parse(capturedAfter))) issue(errors, '$.freshness.capturedAfter', 'must be an ISO timestamp');
    const maxAgeHours = number(freshness, 'maxAgeHours');
    if (maxAgeHours === undefined || !Number.isFinite(maxAgeHours) || maxAgeHours <= 0) issue(errors, '$.freshness.maxAgeHours', 'must be a positive number');
    if (!text(freshness, 'sourcePin')) issue(errors, '$.freshness.sourcePin', 'is required');
  }
  const conditions = conditionsOf(manifest);
  if (!conditions) issue(errors, '$.conditions', 'is required');
  else for (const key of CONDITION_KEYS) {
    const value = text(conditions, key);
    if (!value) issue(errors, `$.conditions.${key}`, 'is required');
    else if (key === 'conditionsDigest' && !digest.test(value)) issue(errors, `$.conditions.${key}`, 'must be a lowercase SHA-256 digest');
  }
  const comparisons = asRecords(manifest.comparisons);
  if (comparisons.length === 0) issue(errors, '$.comparisons', 'must contain at least one exact-viewport comparison');
  return { freshness, conditions, comparisons };
}

function validateFreshness(
  artifact: RecordValue,
  freshness: RecordValue | undefined,
  path: string,
  now: Date,
  errors: ValidationIssue[],
): void {
  const capturedAt = text(artifact, 'capturedAt');
  if (!capturedAt || Number.isNaN(Date.parse(capturedAt))) {
    issue(errors, `${path}.capturedAt`, 'must be an ISO capture timestamp');
    return;
  }
  const capturedMs = Date.parse(capturedAt);
  if (capturedMs > now.getTime()) issue(errors, `${path}.capturedAt`, 'cannot be in the future');
  if (!freshness) return;
  const capturedAfter = text(freshness, 'capturedAfter');
  if (capturedAfter && !Number.isNaN(Date.parse(capturedAfter)) && capturedMs < Date.parse(capturedAfter)) {
    issue(errors, `${path}.capturedAt`, `is older than freshness floor ${capturedAfter}`);
  }
  const maxAgeHours = number(freshness, 'maxAgeHours');
  if (maxAgeHours !== undefined && maxAgeHours > 0 && capturedMs < now.getTime() - maxAgeHours * 60 * 60 * 1000) {
    issue(errors, `${path}.capturedAt`, `is older than the ${maxAgeHours}-hour freshness window`);
  }
  const expectedPin = text(freshness, 'sourcePin');
  if (expectedPin && text(artifact, 'sourcePin') !== expectedPin) issue(errors, `${path}.sourcePin`, 'does not match the manifest source pin');
}

function validateConditions(
  artifact: RecordValue,
  expected: RecordValue | undefined,
  comparison: RecordValue | undefined,
  path: string,
  errors: ValidationIssue[],
): void {
  const actual = conditionsOf(artifact);
  if (!actual) issue(errors, `${path}.conditions`, 'is required');
  for (const key of CONDITION_KEYS) {
    const directValue = text(artifact, key);
    const nestedValue = actual && text(actual, key);
    const actualValue = directValue ?? nestedValue;
    const expectedValue = expected && text(expected, key);
    if (!actualValue) issue(errors, `${path}.${key}`, 'is required');
    else if (directValue && nestedValue && directValue !== nestedValue) issue(errors, `${path}.${key}`, 'conflicts with the nested artifact conditions');
    else if (expectedValue && actualValue !== expectedValue) issue(errors, `${path}.${key}`, `must equal manifest condition ${expectedValue}`);
  }
  if (comparison) {
    const artifactFixture = text(artifact, 'fixtureId') ?? (actual && text(actual, 'fixtureId'));
    const artifactDigest = text(artifact, 'conditionsDigest') ?? (actual && text(actual, 'conditionsDigest'));
    if (artifactFixture !== text(comparison, 'fixtureId')) issue(errors, `${path}.fixtureId`, 'does not match its comparison fixture');
    if (artifactDigest !== text(comparison, 'conditionsDigest')) issue(errors, `${path}.conditionsDigest`, 'does not match its comparison conditions digest');
  }
}

function comparisonKey(record: RecordValue): string | undefined {
  const from = text(record, 'fromSurface');
  const to = text(record, 'toSurface');
  const witness = text(record, 'witnessId') ?? text(record, 'comparisonId');
  const fixture = text(record, 'fixtureId');
  const width = number(record, 'viewportWidth') ?? (isRecord(record.viewport) ? number(record.viewport, 'width') : undefined);
  const height = number(record, 'viewportHeight') ?? (isRecord(record.viewport) ? number(record.viewport, 'height') : undefined);
  return from && to && witness && fixture && width !== undefined && height !== undefined ? [from, to, witness, fixture, width, height].join('|') : undefined;
}

export function validateArtifacts(manifestValue: JsonValue, options: ArtifactValidationOptions = {}): ValidationResult {
  const errors: ValidationIssue[] = [];
  const manifest = isRecord(manifestValue) ? manifestValue : undefined;
  const artifacts = manifest ? asRecords(manifest.artifacts) : [];
  const rootDir = options.rootDir ?? process.cwd();
  const now = options.now ?? new Date();
  const { freshness, conditions, comparisons } = validateEnvelope(manifest, errors);
  if (artifacts.length === 0) issue(errors, '$.artifacts', 'must contain at least one artifact');

  const comparisonsById = new Map<string, RecordValue>();
  const seenPairs = new Set<string>();
  comparisons.forEach((comparison, index) => {
    const comparisonId = text(comparison, 'comparisonId');
    if (!comparisonId) issue(errors, `$.comparisons.${index}.comparisonId`, 'is required');
    else if (comparisonsById.has(comparisonId)) issue(errors, `$.comparisons.${index}.comparisonId`, 'must be unique');
    else comparisonsById.set(comparisonId, comparison);
    const key = comparisonKey(comparison);
    if (!key) issue(errors, `$.comparisons.${index}`, 'must identify from/to surfaces, witness or comparison id, fixture, and exact viewport');
    else if (seenPairs.has(key)) issue(errors, `$.comparisons.${index}`, 'duplicates an existing matched-condition surface pair');
    else seenPairs.add(key);
    const comparisonDigest = text(comparison, 'conditionsDigest');
    if (!comparisonDigest || !digest.test(comparisonDigest)) {
      issue(errors, `$.comparisons.${index}.conditionsDigest`, 'must be a lowercase SHA-256 digest');
    }
  });

  const ids = new Set<string>();
  const usedComparisons = new Set<string>();
  artifacts.forEach((artifact, index) => {
    const artifactPath = `$.artifacts.${index}`;
    const artifactId = text(artifact, 'artifactId');
    if (!artifactId) issue(errors, `${artifactPath}.artifactId`, 'is required');
    else if (ids.has(artifactId)) issue(errors, `${artifactPath}.artifactId`, 'must be unique');
    else ids.add(artifactId);

    const comparisonId = text(artifact, 'comparisonId');
    const comparison = comparisonId ? comparisonsById.get(comparisonId) : undefined;
    if (!comparisonId) issue(errors, `${artifactPath}.comparisonId`, 'is required');
    else if (!comparison) issue(errors, `${artifactPath}.comparisonId`, 'does not identify a declared comparison');
    else usedComparisons.add(comparisonId);

    if (text(artifact, 'status') !== 'valid') issue(errors, `${artifactPath}.status`, 'must be valid before it can support a claim');
    if (!text(artifact, 'sourcePin')) issue(errors, `${artifactPath}.sourcePin`, 'is required');
    const filePath = text(artifact, 'path');
    if (!filePath) {
      issue(errors, `${artifactPath}.path`, 'is required');
      return;
    }
    const fullPath = resolvedArtifactPath(rootDir, filePath);
    let bytes: Buffer;
    try {
      if (statSync(fullPath).size === 0) {
        issue(errors, `${artifactPath}.path`, 'points to an empty artifact');
        return;
      }
      bytes = readFileSync(fullPath);
    } catch {
      issue(errors, `${artifactPath}.path`, `does not resolve from ${rootDir}`);
      return;
    }

    const expectedHash = text(artifact, 'sha256');
    const actualHash = createHash('sha256').update(bytes).digest('hex');
    if (!expectedHash || !digest.test(expectedHash)) issue(errors, `${artifactPath}.sha256`, 'must be a lowercase SHA-256 digest');
    else if (actualHash !== expectedHash) issue(errors, `${artifactPath}.sha256`, 'does not match artifact bytes');
    const expectedLength = number(artifact, 'byteLength');
    if (expectedLength === undefined || expectedLength <= 0) issue(errors, `${artifactPath}.byteLength`, 'must be a positive byte count');
    else if (expectedLength !== bytes.length) issue(errors, `${artifactPath}.byteLength`, 'does not match artifact bytes');

    const expectedWidth = number(artifact, 'width');
    const expectedHeight = number(artifact, 'height');
    const actualDimensions = dimensions(bytes);
    if (!actualDimensions) issue(errors, artifactPath, 'must be a readable PNG or JPEG raster');
    else {
      if (expectedWidth !== actualDimensions.width) issue(errors, `${artifactPath}.width`, `must equal exact raster width ${actualDimensions.width}`);
      if (expectedHeight !== actualDimensions.height) issue(errors, `${artifactPath}.height`, `must equal exact raster height ${actualDimensions.height}`);
    }
    if (comparison) {
      const viewportWidth = number(comparison, 'viewportWidth') ?? (isRecord(comparison.viewport) ? number(comparison.viewport, 'width') : undefined);
      const viewportHeight = number(comparison, 'viewportHeight') ?? (isRecord(comparison.viewport) ? number(comparison.viewport, 'height') : undefined);
      if (expectedWidth !== viewportWidth) issue(errors, `${artifactPath}.width`, `must equal comparison viewport width ${viewportWidth}`);
      if (expectedHeight !== viewportHeight) issue(errors, `${artifactPath}.height`, `must equal comparison viewport height ${viewportHeight}`);
    }
    validateFreshness(artifact, freshness, artifactPath, now, errors);
    validateConditions(artifact, conditions, comparison, artifactPath, errors);
  });

  for (const comparisonId of comparisonsById.keys()) {
    if (!usedComparisons.has(comparisonId)) issue(errors, '$.comparisons', `comparison ${comparisonId} has no linked artifact`);
  }
  return { valid: errors.length === 0, errors };
}

function main(): void {
  const args = process.argv.slice(2);
  const input = args.find((argument) => !argument.startsWith('--'));
  const rootFlag = args.indexOf('--root');
  if (!input || args.includes('--help') || (rootFlag >= 0 && !args[rootFlag + 1])) {
    console.error('Usage: npx tsx specs/027-responsive-hero-video/tools/validate-artifacts.mts <manifest.json> [--root <repository-root>]');
    process.exitCode = args.includes('--help') ? 0 : 2;
    return;
  }
  const result = validateArtifacts(readJson(input), { rootDir: rootFlag >= 0 ? resolve(args[rootFlag + 1]) : process.cwd() });
  console.log(formatValidation(result));
  if (!result.valid) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
