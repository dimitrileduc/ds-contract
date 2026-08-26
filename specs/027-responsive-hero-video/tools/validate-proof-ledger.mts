import { fileURLToPath } from 'node:url';
import { statSync, writeFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

import { formatValidation, readJson, type JsonSchema, type JsonValue, type ValidationIssue, type ValidationResult, validateJsonSchema } from './schema-validation.js';
import { validateArtifacts, type ArtifactValidationOptions } from './validate-artifacts.mjs';

const ledgerSchemaPath = fileURLToPath(new URL('../contracts/proof-ledger.schema.json', import.meta.url));
const ledgerSchema = readJson(ledgerSchemaPath) as JsonSchema;

type RecordValue = Record<string, JsonValue>;

const isRecord = (value: JsonValue | undefined): value is RecordValue => typeof value === 'object' && value !== null && !Array.isArray(value);
const records = (value: JsonValue | undefined): RecordValue[] => Array.isArray(value) ? value.filter(isRecord) : [];
const string = (record: RecordValue, key: string): string | undefined => typeof record[key] === 'string' ? record[key] : undefined;
const numeric = (record: RecordValue, key: string): number | undefined => typeof record[key] === 'number' ? record[key] : undefined;
const error = (errors: ValidationIssue[], path: string, message: string): void => { errors.push({ path, message }); };

const witnessProfile = new Map<string, { width: number; composition: string }>([
  ['mobile-390', { width: 390, composition: 'compact' }],
  ['tablet-834', { width: 834, composition: 'compact' }],
  ['desktop-1200', { width: 1200, composition: 'desktop' }],
  ['wide-1728', { width: 1728, composition: 'wide' }],
]);

function widthOf(record: RecordValue): number | undefined {
  return numeric(record, 'viewportWidth') ?? numeric(record, 'width') ?? (isRecord(record.viewport) ? numeric(record.viewport, 'width') : undefined);
}

function heightOf(record: RecordValue): number | undefined {
  return numeric(record, 'viewportHeight') ?? numeric(record, 'height') ?? (isRecord(record.viewport) ? numeric(record.viewport, 'height') : undefined);
}

function expectedComposition(width: number): string {
  if (width >= 1400) return 'wide';
  if (width >= 992) return 'desktop';
  return 'compact';
}

function expectedBoundaryCase(width: number): string {
  return new Map<number, string>([
    [991, 'desktop-start-1'], [992, 'desktop-start'], [993, 'desktop-start+1'],
    [1399, 'wide-start-1'], [1400, 'wide-start'], [1401, 'wide-start+1'],
  ]).get(width) ?? 'none';
}

function readableNonEmpty(filePath: string, rootDir: string): boolean {
  try {
    return statSync(isAbsolute(filePath) ? filePath : resolve(rootDir, filePath)).size > 0;
  } catch {
    return false;
  }
}

function validateNestedArtifacts(
  owner: RecordValue,
  ownerPath: string,
  comparisonId: string,
  fixtureId: string,
  conditionsDigest: string,
  freshAfter: string,
  validationNow: Date,
  allowedSourcePins: Set<string>,
  options: ArtifactValidationOptions,
  errors: ValidationIssue[],
  seenArtifactIds: Set<string>,
): void {
  const artifacts = records(owner.artifacts);
  for (const [index, artifact] of artifacts.entries()) {
    const artifactId = string(artifact, 'artifactId');
    if (artifactId) {
      if (seenArtifactIds.has(artifactId)) error(errors, `${ownerPath}.artifacts.${index}.artifactId`, 'must be unique across the ledger');
      seenArtifactIds.add(artifactId);
    }
    const sourcePin = string(artifact, 'sourcePin') ?? '';
    if (!allowedSourcePins.has(sourcePin)) {
      error(errors, `${ownerPath}.artifacts.${index}.sourcePin`, 'must identify a source pin declared by this ledger or reconciliation run');
    }
    const contentCase = string(artifact, 'contentCase') ?? '';
    const mediaCase = string(artifact, 'mediaCase') ?? '';
    const fontFamily = string(artifact, 'fontFamily') ?? '';
    const locale = string(artifact, 'locale') ?? '';
    const width = widthOf(owner) ?? 0;
    const height = heightOf(owner) ?? 0;
    const conditions = { fixtureId, contentCase, mediaCase, fontFamily, locale, conditionsDigest };
    const nested = validateArtifacts({
      freshness: {
        capturedAfter: freshAfter,
        maxAgeHours: Math.max(1, (validationNow.getTime() - Date.parse(freshAfter)) / (60 * 60 * 1000)),
        sourcePin,
      },
      conditions,
      comparisons: [{
        comparisonId,
        fromSurface: string(owner, 'fromSurface') ?? string(owner, 'surface') ?? 'evidence',
        toSurface: string(owner, 'toSurface') ?? 'measurement',
        witnessId: string(owner, 'witnessId') ?? comparisonId,
        fixtureId,
        viewportWidth: width,
        viewportHeight: height,
        conditionsDigest,
      }],
      artifacts: [{ ...artifact, comparisonId, conditions }],
    }, { rootDir: options.rootDir, now: validationNow });
    for (const nestedError of nested.errors) {
      error(errors, `${ownerPath}.artifacts.${index}`, `${nestedError.path}: ${nestedError.message}`);
    }
  }
}

function ledgerInvariantErrors(ledger: JsonValue, options: ArtifactValidationOptions = {}): ValidationIssue[] {
  const errors: ValidationIssue[] = [];
  if (!isRecord(ledger)) return errors;
  const rootDir = options.rootDir ?? process.cwd();

  const gates = records(ledger.gates);
  const seenGates = new Set<string>();
  for (const gate of gates) {
    const id = string(gate, 'gateId');
    if (!id) continue;
    if (seenGates.has(id)) error(errors, '$.gates', `contains duplicate ${id}`);
    seenGates.add(id);
  }
  for (const gate of ['H1', 'H2', 'H3', 'H4']) if (!seenGates.has(gate)) error(errors, '$.gates', `requires gate ${gate}`);

  const protectedFacts = records(ledger.protectedFacts);
  const categories = new Set(protectedFacts.map((fact) => string(fact, 'category')));
  const surfaces = new Set(protectedFacts.map((fact) => string(fact, 'surface')));
  for (const category of ['identity', 'media', 'nested-instance', 'override']) {
    if (!categories.has(category)) error(errors, '$.protectedFacts', `requires at least one ${category} protected fact`);
  }
  for (const surface of ['figma-master', 'figma-home']) {
    if (!surfaces.has(surface)) error(errors, '$.protectedFacts', `requires a protected fact for ${surface}`);
  }
  const factIds = protectedFacts.map((fact) => string(fact, 'factId')).filter((id): id is string => Boolean(id));
  if (new Set(factIds).size !== factIds.length) error(errors, '$.protectedFacts', 'factId values must be unique');
  protectedFacts.forEach((fact, index) => {
    const before = string(fact, 'beforeDigest');
    const after = string(fact, 'afterDigest');
    const noOp = string(fact, 'noOpDigest');
    if (string(fact, 'status') === 'preserved' && (before !== after || after !== noOp)) {
      error(errors, `$.protectedFacts.${index}`, 'preserved facts require identical before, after, and no-op digests');
    }
    if (string(fact, 'status') === 'approved-delta' && (!string(fact, 'allowedDeltaRef') || after !== noOp)) {
      error(errors, `$.protectedFacts.${index}`, 'approved deltas require an approval reference and a stable no-op digest');
    }
  });

  const probes = records(ledger.probes);
  const requiredWidths = [320, 390, 834, 991, 992, 993, 1024, 1200, 1399, 1400, 1401, 1440, 1728];
  const widths = new Set(probes.map(widthOf).filter((width): width is number => width !== undefined));
  requiredWidths.forEach((width) => {
    if (!widths.has(width)) error(errors, '$.probes', `requires a ${width}px probe`);
  });
  const probeIds = probes.map((probe) => string(probe, 'probeId')).filter((id): id is string => Boolean(id));
  if (new Set(probeIds).size !== probeIds.length) error(errors, '$.probes', 'probeId values must be unique');
  probes.forEach((probe, index) => {
    const width = widthOf(probe);
    if (width === undefined) return;
    const expected = expectedComposition(width);
    if (string(probe, 'expectedComposition') !== expected || string(probe, 'activeComposition') !== expected) {
      error(errors, `$.probes.${index}`, `${width}px must expect and activate ${expected}`);
    }
    if (string(probe, 'boundaryCase') !== expectedBoundaryCase(width)) {
      error(errors, `$.probes.${index}.boundaryCase`, `must identify the exact ${width}px boundary position`);
    }
    if (numeric(probe, 'rootWidth') !== width) error(errors, `$.probes.${index}.rootWidth`, 'must equal the exact viewport width');
  });
  if (!probes.some((probe) => string(probe, 'probeId') === 'short-landscape-844x390' && widthOf(probe) === 844 && heightOf(probe) === 390 && string(probe, 'activeComposition') === 'compact')) {
    error(errors, '$.probes', 'requires the named short-landscape-844x390 compact probe');
  }

  const comparisons = records(ledger.comparisons);
  const pairKeys = new Set<string>();
  for (const [witnessId, profile] of witnessProfile) {
    const witnessLegs: RecordValue[] = [];
    for (const [fromSurface, toSurface] of [['figma', 'reference-web'], ['reference-web', 'odoo']] as const) {
      const found = comparisons.filter((comparison) => string(comparison, 'witnessId') === witnessId && string(comparison, 'fromSurface') === fromSurface && string(comparison, 'toSurface') === toSurface);
      if (found.length !== 1) error(errors, '$.comparisons', `requires exactly one ${fromSurface} → ${toSurface} pair for ${witnessId}`);
      witnessLegs.push(...found);
      found.forEach((comparison) => {
        if (widthOf(comparison) !== profile.width || string(comparison, 'compositionId') !== profile.composition) {
          error(errors, '$.comparisons', `${witnessId} must use ${profile.width}px and ${profile.composition}`);
        }
        const fixture = string(comparison, 'fixtureId');
        const height = heightOf(comparison);
        const key = [fromSurface, toSurface, witnessId, fixture, profile.width, height].join('|');
        if (pairKeys.has(key)) error(errors, '$.comparisons', `contains duplicate matched-condition pair ${key}`);
        pairKeys.add(key);
      });
    }
    if (witnessLegs.length === 2 && (string(witnessLegs[0], 'fixtureId') !== string(witnessLegs[1], 'fixtureId') ||
      string(witnessLegs[0], 'conditionsDigest') !== string(witnessLegs[1], 'conditionsDigest') || heightOf(witnessLegs[0]) !== heightOf(witnessLegs[1]))) {
      error(errors, '$.comparisons', `${witnessId} legs must share fixtureId, conditionsDigest, and exact viewport height`);
    }
  }

  const continuity = ledger.wideContinuityCheck;
  if (isRecord(continuity)) {
    if (string(continuity, 'checkId') !== 'wide-1440-continuity' || widthOf(continuity) !== 1440 || string(continuity, 'compositionId') !== 'wide') {
      error(errors, '$.wideContinuityCheck', 'must be the separate 1440px wide continuity check');
    }
  } else if (ledger.closureStatus === 'accepted') {
    error(errors, '$.wideContinuityCheck', 'is required for an accepted closure');
  }

  const runs = records(ledger.runs);
  const first = runs.filter((run) => string(run, 'run') === 'first');
  const second = runs.filter((run) => string(run, 'run') === 'second');
  if (first.length !== 1 || second.length !== 1) error(errors, '$.runs', 'requires one first run and one second run');
  second.forEach((run) => {
    if (string(run, 'status') !== 'no-op') error(errors, '$.runs', 'second run must be a no-op');
    for (const field of ['createdNodeIds', 'changedNodeIds', 'duplicateNodeIds', 'pageWrites']) {
      if (Array.isArray(run[field]) && run[field].length !== 0) error(errors, `$.runs.${field}`, 'must be empty on the second run');
    }
  });
  if (first.length === 1 && second.length === 1) {
    for (const field of ['decisionDigest', 'contractDigest', 'schemaDigest', 'generatedManifestDigest']) {
      if (string(first[0], field) !== string(second[0], field)) error(errors, `$.runs.${field}`, 'must be identical between first and second runs');
    }
  }
  runs.forEach((run) => {
    if (Array.isArray(run.pageWrites) && run.pageWrites.length !== 0) error(errors, '$.runs.pageWrites', 'must remain empty for the single-writer campaign');
  });

  if (ledger.closureStatus === 'accepted') {
    for (const gate of gates) {
      if (string(gate, 'decision') !== 'accepted') error(errors, '$.gates', 'all human gates must be accepted at closure');
    }
    if (!isRecord(ledger.odooQualification) || string(ledger.odooQualification, 'status') !== 'pass') {
      error(errors, '$.odooQualification', 'accepted closure requires passing Odoo qualification');
    }

    const h2 = gates.find((gate) => string(gate, 'gateId') === 'H2');
    const h4 = gates.find((gate) => string(gate, 'gateId') === 'H4');
    const freshAfter = h2 && string(h2, 'decidedAt');
    const closureTime = h4 && string(h4, 'decidedAt');
    if (freshAfter && closureTime && !Number.isNaN(Date.parse(freshAfter)) && !Number.isNaN(Date.parse(closureTime))) {
      const validationNow = new Date(closureTime);
      const sourcePins = isRecord(ledger.sourcePins) ? ledger.sourcePins : {};
      const allowedSourcePins = new Set<string>([
        ...Object.values(sourcePins).filter((value): value is string => typeof value === 'string'),
        ...runs.flatMap((run) => ['decisionDigest', 'contractDigest', 'schemaDigest', 'generatedManifestDigest']
          .map((field) => string(run, field)).filter((value): value is string => Boolean(value))),
      ]);
      const seenArtifactIds = new Set<string>();
      probes.forEach((probe, index) => validateNestedArtifacts(
        probe,
        `$.probes.${index}`,
        `probe-${string(probe, 'probeId') ?? index}`,
        string(probe, 'fixtureId') ?? '',
        string(probe, 'conditionsDigest') ?? '',
        freshAfter,
        validationNow,
        allowedSourcePins,
        options,
        errors,
        seenArtifactIds,
      ));
      comparisons.forEach((comparison, index) => validateNestedArtifacts(
        comparison,
        `$.comparisons.${index}`,
        string(comparison, 'comparisonId') ?? `comparison-${index}`,
        string(comparison, 'fixtureId') ?? '',
        string(comparison, 'conditionsDigest') ?? '',
        freshAfter,
        validationNow,
        allowedSourcePins,
        options,
        errors,
        seenArtifactIds,
      ));
      if (isRecord(continuity)) validateNestedArtifacts(
        continuity,
        '$.wideContinuityCheck',
        string(continuity, 'checkId') ?? 'wide-1440-continuity',
        string(continuity, 'fixtureId') ?? '',
        string(continuity, 'conditionsDigest') ?? '',
        freshAfter,
        validationNow,
        allowedSourcePins,
        options,
        errors,
        seenArtifactIds,
      );
    }
    runs.forEach((run, index) => {
      const receiptRef = string(run, 'receiptRef');
      if (receiptRef && !readableNonEmpty(receiptRef, rootDir)) error(errors, `$.runs.${index}.receiptRef`, 'must resolve to a non-empty receipt');
    });
  }
  return errors;
}

export function validateProofLedger(ledger: JsonValue, options: ArtifactValidationOptions = {}): ValidationResult {
  const schemaResult = validateJsonSchema(ledger, ledgerSchema);
  const errors = [...schemaResult.errors, ...ledgerInvariantErrors(ledger, options)];
  return { valid: errors.length === 0, errors };
}

/** Combines non-overlapping ledger fragments and refuses competing facts. */
export function assembleProofLedger(fragments: JsonValue[]): { ledger: RecordValue; errors: ValidationIssue[] } {
  const ledger: RecordValue = { schemaVersion: '2.1.0', featureId: '027-responsive-hero-video', closureStatus: 'draft' };
  const errors: ValidationIssue[] = [];
  for (const fragment of fragments) {
    if (!isRecord(fragment)) {
      error(errors, '$', 'each assembly fragment must be a JSON object');
      continue;
    }
    const source = isRecord(fragment.ledger) ? fragment.ledger : fragment;
    for (const [key, value] of Object.entries(source)) {
      if (key === 'ledger') continue;
      if (!(key in ledger)) {
        ledger[key] = value;
        continue;
      }
      if (JSON.stringify(ledger[key]) !== JSON.stringify(value)) error(errors, `$.${key}`, 'assembly fragments disagree on this fact');
    }
  }
  return { ledger, errors };
}

function main(): void {
  const args = process.argv.slice(2);
  if (args[0] === '--assemble') {
    const outputIndex = args.indexOf('--out');
    const output = outputIndex >= 0 ? args[outputIndex + 1] : undefined;
    const inputs = args.slice(1).filter((argument, index, list) => argument !== '--out' && list[index - 1] !== '--out');
    if (!output || inputs.length === 0) {
      console.error('Usage: …/validate-proof-ledger.mts --assemble --out <ledger.json> <fragment.json>…');
      process.exitCode = 2;
      return;
    }
    const assembled = assembleProofLedger(inputs.map(readJson));
    const validation = validateProofLedger(assembled.ledger);
    const allErrors = [...assembled.errors, ...validation.errors];
    console.log(formatValidation({ valid: allErrors.length === 0, errors: allErrors }));
    if (allErrors.length > 0) {
      process.exitCode = 1;
      return;
    }
    writeFileSync(output, `${JSON.stringify(assembled.ledger, null, 2)}\n`);
    return;
  }
  const [input] = args;
  if (!input || input === '--help') {
    console.error('Usage: npx tsx specs/027-responsive-hero-video/tools/validate-proof-ledger.mts <ledger.json>');
    process.exitCode = input === '--help' ? 0 : 2;
    return;
  }
  const result = validateProofLedger(readJson(input));
  console.log(formatValidation(result));
  if (!result.valid) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
