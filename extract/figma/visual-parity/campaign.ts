/**
 * Versioned, side-effect-free validation for Visual Campaign v1.
 *
 * This module deliberately does not fetch Figma, launch Chromium, or create
 * directories.  The runner validates the campaign and its output boundary
 * through these functions before it can perform any of those operations.
 */
import path from 'node:path';

export const VISUAL_CAMPAIGN_SCHEMA_VERSION = 1 as const;
export const REQUIRED_CAMPAIGN_SUBJECT_IDS = [
  'carte',
  'field',
  'member-card',
  'nav-item',
  'product-card',
  'realisation',
  'tab',
] as const;

export type CampaignSubjectId = (typeof REQUIRED_CAMPAIGN_SUBJECT_IDS)[number];

export type CampaignValidationIssueCode =
  | 'campaign-shape'
  | 'schema-version'
  | 'campaign-id'
  | 'reference-file-key'
  | 'reference-file-version'
  | 'reference-read-only'
  | 'reference-device-scale-factor'
  | 'acceptance-threshold'
  | 'assets-manifest'
  | 'subject-id'
  | 'subject-contract'
  | 'subject-set-node'
  | 'case-shape'
  | 'case-id'
  | 'case-node'
  | 'case-facts'
  | 'required-parts'
  | 'asset-reference-invalid'
  | 'alias-facts-not-equal'
  | 'alias-image-hash-not-equal'
  | 'alias-geometry-fingerprint-not-equal'
  | 'alias-semantic-fingerprint-not-equal'
  | 'alias-fingerprint-required'
  | 'coverage-missing'
  | 'coverage-unexpected'
  | 'result-shape'
  | 'result-reference'
  | 'result-hash'
  | 'result-verdict'
  | 'output-path-invalid'
  | 'output-path-outside-campaign-root';

export interface CampaignValidationIssue {
  code: CampaignValidationIssueCode;
  path: string;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T; issues: [] }
  | { ok: false; issues: CampaignValidationIssue[] };

export interface CampaignAssetManifest {
  assets: Array<{ id: string; sha256?: string }>;
}

export interface VisualCampaignValidationOptions {
  assetManifest?: CampaignAssetManifest | null;
}

export interface VisualCampaign {
  schemaVersion: typeof VISUAL_CAMPAIGN_SCHEMA_VERSION;
  id: string;
  reference: {
    fileKey: string;
    fileVersion: string;
    readOnly: true;
    deviceScaleFactor?: number;
  };
  assetsManifest: string;
  subjects: CampaignSubject[];
  attribution?: { checkpointCommit: string; wipCommit: string };
  acceptance?: {
    maxRawDiffPct: number;
    maxRegionDiffPct: number;
    baselineEpsilonPp: number;
    requireExactCoverage: boolean;
    requireVisibleEvidence: boolean;
    requireGeometryPass: boolean;
    requireSemanticPass: boolean;
  };
}

export interface CampaignSubject {
  id: CampaignSubjectId;
  contractId: string;
  contractVersion: string;
  figmaSetNodeId: string;
  auditRefs?: string[];
  coverage?: {
    deriveFromFigmaProperties?: boolean;
    deriveFromContract?: boolean;
    requiredFactIds?: string[];
  };
  cases: CampaignCase[];
}

export interface CampaignCase {
  id: string;
  figmaNodeId: string;
  factIds: string[];
  fixtureAssetIds?: string[];
  codeProps?: Record<string, unknown>;
  requiredParts?: string[];
  aliases?: CampaignAlias[];
  /** Canonical equality receipts required when aliases deduplicate cases. */
  equality?: CampaignEquality;
  [key: string]: unknown;
}

export interface CampaignEquality {
  imageSha256: string;
  geometryFingerprint: string;
  semanticFingerprint: string;
}

export interface CampaignAlias extends CampaignEquality {
  figmaNodeId: string;
  factIds: string[];
}

export interface Coverage {
  expected: string[];
  observed: string[];
  missing: string[];
  unexpected: string[];
}

export interface CampaignResult {
  schemaVersion: typeof VISUAL_CAMPAIGN_SCHEMA_VERSION;
  campaignId: string;
  reference: { fileKey: string; fileVersion: string };
  inputHashes: Record<'campaign' | 'contracts' | 'assetsManifest' | 'generatedTree', string>;
  coverage: Coverage;
  subjects: Array<{ id: string; verdict: CampaignVerdict }>;
  cases: Array<{ id: string; subjectId: string; verdict: CampaignVerdict; probative: boolean; reasons: string[] }>;
  verdict: CampaignVerdict;
  exitCode: 0 | 1 | 2;
  reasons: string[];
}

export type CampaignVerdict = 'pass' | 'fail' | 'blocked';

type JsonRecord = Record<string, unknown>;
const SHA256 = /^[a-f0-9]{64}$/i;
const SUBJECT_IDS = new Set<string>(REQUIRED_CAMPAIGN_SUBJECT_IDS);

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isNonEmptyString);
const unique = (values: readonly string[]): boolean => new Set(values).size === values.length;
const isSafeRelativePath = (value: unknown): value is string =>
  isNonEmptyString(value) && !path.isAbsolute(value) && !value.split(/[\\/]+/).includes('..');

function push(issues: CampaignValidationIssue[], code: CampaignValidationIssueCode, issuePath: string, message: string): void {
  issues.push({ code, path: issuePath, message });
}

function validation<T>(value: T, issues: CampaignValidationIssue[]): ValidationResult<T> {
  return issues.length === 0 ? { ok: true, value, issues: [] } : { ok: false, issues };
}

function assetIds(manifest: CampaignAssetManifest | null | undefined): Set<string> | null {
  if (!manifest || !Array.isArray(manifest.assets)) return null;
  const ids = new Set<string>();
  for (const asset of manifest.assets) if (isRecord(asset) && isNonEmptyString(asset.id)) ids.add(asset.id);
  return ids;
}

function scanAssetRefs(value: unknown, refs: Array<{ id: string | null; validShape: boolean }>): void {
  if (Array.isArray(value)) {
    for (const item of value) scanAssetRefs(item, refs);
    return;
  }
  if (!isRecord(value)) return;
  if ('$asset' in value) {
    const keys = Object.keys(value);
    refs.push({ id: isNonEmptyString(value.$asset) ? value.$asset : null, validShape: keys.length === 1 });
    return;
  }
  for (const nested of Object.values(value)) scanAssetRefs(nested, refs);
}

function factsEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && new Set(a).size === a.length && a.every((fact) => b.includes(fact));
}

function validateAliases(value: unknown, canonicalFacts: string[], issuePath: string, issues: CampaignValidationIssue[]): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    push(issues, 'case-shape', issuePath, 'aliases must be an array');
    return;
  }
  for (const [index, alias] of value.entries()) {
    const aliasPath = `${issuePath}[${index}]`;
    if (!isRecord(alias) || !isNonEmptyString(alias.figmaNodeId) || !isStringArray(alias.factIds)) {
      push(issues, 'case-shape', aliasPath, 'alias must declare a node id and fact ids');
      continue;
    }
    if (!factsEqual(canonicalFacts, alias.factIds)) {
      push(issues, 'alias-facts-not-equal', `${aliasPath}.factIds`, 'alias facts must equal canonical case facts');
    }
  }
}

/**
 * Validates the campaign document without reading the filesystem.  Callers
 * provide the already-read asset manifest, keeping the preflight testable and
 * free of any output or Figma side effect.
 */
export function validateVisualCampaign(
  candidate: unknown,
  options: VisualCampaignValidationOptions = {},
): ValidationResult<VisualCampaign> {
  const issues: CampaignValidationIssue[] = [];
  if (!isRecord(candidate)) {
    push(issues, 'campaign-shape', '$', 'campaign must be an object');
    return validation(candidate as VisualCampaign, issues);
  }

  if (candidate.schemaVersion !== VISUAL_CAMPAIGN_SCHEMA_VERSION) {
    push(issues, 'schema-version', '$.schemaVersion', `schemaVersion must equal ${VISUAL_CAMPAIGN_SCHEMA_VERSION}`);
  }
  if (!isNonEmptyString(candidate.id) || !/^[a-z0-9][a-z0-9-]*$/.test(candidate.id)) {
    push(issues, 'campaign-id', '$.id', 'campaign id must be a stable kebab-case identifier');
  }

  const reference = candidate.reference;
  if (!isRecord(reference)) {
    push(issues, 'campaign-shape', '$.reference', 'reference must be an object');
  } else {
    if (!isNonEmptyString(reference.fileKey)) push(issues, 'reference-file-key', '$.reference.fileKey', 'fileKey is required');
    if (!isNonEmptyString(reference.fileVersion) || !/^\d+$/.test(reference.fileVersion)) {
      push(issues, 'reference-file-version', '$.reference.fileVersion', 'fileVersion must be a pinned numeric version');
    }
    if (reference.readOnly !== true) push(issues, 'reference-read-only', '$.reference.readOnly', 'readOnly must be true');
    const deviceScaleFactor = reference.deviceScaleFactor;
    if (deviceScaleFactor !== undefined && (typeof deviceScaleFactor !== 'number' || !Number.isInteger(deviceScaleFactor) || deviceScaleFactor < 1)) {
      push(issues, 'reference-device-scale-factor', '$.reference.deviceScaleFactor', 'deviceScaleFactor must be a positive integer');
    }
  }

  if (!isSafeRelativePath(candidate.assetsManifest)) {
    push(issues, 'assets-manifest', '$.assetsManifest', 'assetsManifest must be a bounded repository-relative path');
  }
  const manifestIds = assetIds(options.assetManifest);
  if (options.assetManifest !== undefined && manifestIds === null) {
    push(issues, 'assets-manifest', '$.assetsManifest', 'asset manifest must contain an assets array');
  }

  const acceptance = candidate.acceptance;
  if (acceptance !== undefined) {
    if (!isRecord(acceptance)) {
      push(issues, 'acceptance-threshold', '$.acceptance', 'acceptance must be an object');
    } else {
      for (const key of ['maxRawDiffPct', 'maxRegionDiffPct'] as const) {
        const threshold = acceptance[key];
        if (typeof threshold !== 'number' || !Number.isFinite(threshold) || threshold < 0 || threshold > 2.5) {
          push(issues, 'acceptance-threshold', `$.acceptance.${key}`, `${key} must be in [0, 2.5]`);
        }
      }
    }
  }

  const subjects = candidate.subjects;
  if (!Array.isArray(subjects)) {
    push(issues, 'subject-id', '$.subjects', 'subjects must be the exact seven-target array');
  } else {
    const ids = subjects.map((subject) => (isRecord(subject) && isNonEmptyString(subject.id) ? subject.id : ''));
    const exactSubjects =
      ids.length === REQUIRED_CAMPAIGN_SUBJECT_IDS.length &&
      unique(ids) &&
      ids.every((id) => SUBJECT_IDS.has(id));
    if (!exactSubjects) {
      push(issues, 'subject-id', '$.subjects', 'subjects must contain each required target exactly once');
    }

    const allCaseIds = new Set<string>();
    for (const [subjectIndex, subject] of subjects.entries()) {
      const subjectPath = `$.subjects[${subjectIndex}]`;
      if (!isRecord(subject)) {
        push(issues, 'subject-id', subjectPath, 'subject must be an object');
        continue;
      }
      const subjectId = isNonEmptyString(subject.id) ? subject.id : '';
      if (!isNonEmptyString(subject.contractId) || subject.contractId !== `ds.${subjectId}` || !isNonEmptyString(subject.contractVersion)) {
        push(issues, 'subject-contract', subjectPath, 'subject contract id/version must match its campaign id');
      }
      if (!isNonEmptyString(subject.figmaSetNodeId)) {
        push(issues, 'subject-set-node', `${subjectPath}.figmaSetNodeId`, 'figmaSetNodeId is required');
      }
      if (!Array.isArray(subject.cases) || subject.cases.length === 0) {
        push(issues, 'case-shape', `${subjectPath}.cases`, 'each subject must declare at least one canonical case');
        continue;
      }

      for (const [caseIndex, campaignCase] of subject.cases.entries()) {
        const casePath = `${subjectPath}.cases[${caseIndex}]`;
        if (!isRecord(campaignCase)) {
          push(issues, 'case-shape', casePath, 'case must be an object');
          continue;
        }
        if (!isNonEmptyString(campaignCase.id) || allCaseIds.has(campaignCase.id)) {
          push(issues, 'case-id', `${casePath}.id`, 'case id must be globally unique and non-empty');
        } else {
          allCaseIds.add(campaignCase.id);
        }
        if (!isNonEmptyString(campaignCase.figmaNodeId)) {
          push(issues, 'case-node', `${casePath}.figmaNodeId`, 'case must reference an immutable Figma node');
        }
        if (!isStringArray(campaignCase.factIds) || campaignCase.factIds.length === 0 || !unique(campaignCase.factIds)) {
          push(issues, 'case-facts', `${casePath}.factIds`, 'case must declare a non-empty unique fact set');
        }
        if (campaignCase.requiredParts !== undefined && (!isStringArray(campaignCase.requiredParts) || !campaignCase.requiredParts.includes('root'))) {
          push(issues, 'required-parts', `${casePath}.requiredParts`, 'requiredParts must include root');
        }

        const declaredAssets = isStringArray(campaignCase.fixtureAssetIds) ? campaignCase.fixtureAssetIds : [];
        if (campaignCase.fixtureAssetIds !== undefined && (!isStringArray(campaignCase.fixtureAssetIds) || !unique(declaredAssets))) {
          push(issues, 'asset-reference-invalid', `${casePath}.fixtureAssetIds`, 'fixtureAssetIds must be a unique string array');
        }
        for (const assetId of declaredAssets) {
          if (manifestIds !== null && !manifestIds.has(assetId)) {
            push(issues, 'asset-reference-invalid', `${casePath}.fixtureAssetIds`, `asset ${assetId} is absent from the manifest`);
          }
        }
        const refs: Array<{ id: string | null; validShape: boolean }> = [];
        scanAssetRefs(campaignCase.codeProps, refs);
        for (const ref of refs) {
          if (!ref.validShape || ref.id === null || !declaredAssets.includes(ref.id) || (manifestIds !== null && !manifestIds.has(ref.id))) {
            push(issues, 'asset-reference-invalid', `${casePath}.codeProps`, '$asset must be declared by the case and resolve in the manifest');
          }
        }

        const aliases = campaignCase.aliases;
        if (aliases !== undefined && Array.isArray(aliases) && aliases.length > 0) {
          const equality = campaignCase.equality;
          if (!isRecord(equality)) {
            push(issues, 'alias-fingerprint-required', `${casePath}.equality`, 'canonical equality fingerprints are required for aliases');
          } else {
            if (!isNonEmptyString(equality.imageSha256) || !SHA256.test(equality.imageSha256)) {
              push(issues, 'alias-fingerprint-required', `${casePath}.equality.imageSha256`, 'canonical image hash must be SHA-256');
            }
            if (!isNonEmptyString(equality.geometryFingerprint)) {
              push(issues, 'alias-fingerprint-required', `${casePath}.equality.geometryFingerprint`, 'canonical geometry fingerprint is required');
            }
            if (!isNonEmptyString(equality.semanticFingerprint)) {
              push(issues, 'alias-fingerprint-required', `${casePath}.equality.semanticFingerprint`, 'canonical semantic fingerprint is required');
            }
            for (const [aliasIndex, alias] of aliases.entries()) {
              const aliasPath = `${casePath}.aliases[${aliasIndex}]`;
              if (!isRecord(alias)) continue;
              if (isStringArray(campaignCase.factIds) && (!isStringArray(alias.factIds) || !factsEqual(campaignCase.factIds, alias.factIds))) {
                push(issues, 'alias-facts-not-equal', `${aliasPath}.factIds`, 'alias facts must equal canonical case facts');
              }
              if (!isNonEmptyString(alias.imageSha256) || !isNonEmptyString(alias.geometryFingerprint) || !isNonEmptyString(alias.semanticFingerprint)) {
                push(issues, 'alias-fingerprint-required', aliasPath, 'every alias must repeat image, geometry, and semantic fingerprints');
              }
              if (isNonEmptyString(alias.imageSha256) && alias.imageSha256 !== equality.imageSha256) {
                push(issues, 'alias-image-hash-not-equal', `${aliasPath}.imageSha256`, 'alias image hash must equal canonical image hash');
              }
              if (isNonEmptyString(alias.geometryFingerprint) && alias.geometryFingerprint !== equality.geometryFingerprint) {
                push(issues, 'alias-geometry-fingerprint-not-equal', `${aliasPath}.geometryFingerprint`, 'alias geometry fingerprint must equal canonical geometry fingerprint');
              }
              if (isNonEmptyString(alias.semanticFingerprint) && alias.semanticFingerprint !== equality.semanticFingerprint) {
                push(issues, 'alias-semantic-fingerprint-not-equal', `${aliasPath}.semanticFingerprint`, 'alias semantic fingerprint must equal canonical semantic fingerprint');
              }
            }
          }
        }
        if (isStringArray(campaignCase.factIds)) validateAliases(campaignCase.aliases, campaignCase.factIds, `${casePath}.aliases`, issues);
      }
    }
  }

  return validation(candidate as unknown as VisualCampaign, issues);
}

/** Compute the declared coverage delta without treating a baseline as proof. */
export function validateExactCoverage(expected: readonly string[], observed: readonly string[]): ValidationResult<Coverage> {
  const expectedSet = new Set(expected);
  const observedSet = new Set(observed);
  const coverage: Coverage = {
    expected: [...expectedSet].sort(),
    observed: [...observedSet].sort(),
    missing: [...expectedSet].filter((fact) => !observedSet.has(fact)).sort(),
    unexpected: [...observedSet].filter((fact) => !expectedSet.has(fact)).sort(),
  };
  const issues: CampaignValidationIssue[] = [];
  if (coverage.missing.length > 0) push(issues, 'coverage-missing', '$.coverage.missing', `missing facts: ${coverage.missing.join(', ')}`);
  if (coverage.unexpected.length > 0) push(issues, 'coverage-unexpected', '$.coverage.unexpected', `unexpected facts: ${coverage.unexpected.join(', ')}`);
  return validation(coverage, issues);
}

/**
 * Validates a deterministic Campaign Result v1 receipt.  It is intentionally
 * shallow on per-case measurement detail: evidence.ts adds those receipts,
 * while this guard protects the aggregate truth table and provenance pins.
 */
export function validateCampaignResult(candidate: unknown): ValidationResult<CampaignResult> {
  const issues: CampaignValidationIssue[] = [];
  if (!isRecord(candidate)) {
    push(issues, 'result-shape', '$', 'result must be an object');
    return validation(candidate as CampaignResult, issues);
  }
  if (candidate.schemaVersion !== VISUAL_CAMPAIGN_SCHEMA_VERSION || !isNonEmptyString(candidate.campaignId)) {
    push(issues, 'result-shape', '$', 'result schema version and campaign id are required');
  }
  const reference = candidate.reference;
  if (!isRecord(reference) || !isNonEmptyString(reference.fileKey) || !isNonEmptyString(reference.fileVersion)) {
    push(issues, 'result-reference', '$.reference', 'result must retain its pinned Figma file key and version');
  }
  const inputHashes = candidate.inputHashes;
  if (!isRecord(inputHashes) || !['campaign', 'contracts', 'assetsManifest', 'generatedTree'].every((key) => isNonEmptyString(inputHashes[key]) && SHA256.test(inputHashes[key] as string))) {
    push(issues, 'result-hash', '$.inputHashes', 'result must contain SHA-256 hashes for every deterministic input');
  }
  const coverageCandidate = candidate.coverage;
  if (!isRecord(coverageCandidate) || !isStringArray(coverageCandidate.expected) || !isStringArray(coverageCandidate.observed)) {
    push(issues, 'result-shape', '$.coverage', 'result coverage must declare expected and observed fact sets');
  } else {
    const coverage = validateExactCoverage(coverageCandidate.expected, coverageCandidate.observed);
    if (!coverage.ok) issues.push(...coverage.issues);
    const expectedSet = new Set(coverageCandidate.expected);
    const observedSet = new Set(coverageCandidate.observed);
    const computedMissing = [...expectedSet].filter((fact) => !observedSet.has(fact)).sort();
    const computedUnexpected = [...observedSet].filter((fact) => !expectedSet.has(fact)).sort();
    if (!isStringArray(coverageCandidate.missing) || !isStringArray(coverageCandidate.unexpected) ||
      coverageCandidate.missing.join('\u0000') !== computedMissing.join('\u0000') ||
      coverageCandidate.unexpected.join('\u0000') !== computedUnexpected.join('\u0000')) {
      push(issues, 'result-shape', '$.coverage', 'reported coverage deltas must equal the computed fact delta');
    }
  }
  const verdict = candidate.verdict;
  const exitCode = candidate.exitCode;
  const correctExit = (verdict === 'pass' && exitCode === 0) || (verdict === 'fail' && exitCode === 1) || (verdict === 'blocked' && exitCode === 2);
  if (!correctExit) push(issues, 'result-verdict', '$.verdict', 'verdict and exitCode must use the campaign exit-code table');
  if (verdict === 'pass' && (issues.some((issue) => issue.code === 'coverage-missing' || issue.code === 'coverage-unexpected') || !Array.isArray(candidate.subjects) || candidate.subjects.length !== REQUIRED_CAMPAIGN_SUBJECT_IDS.length)) {
    push(issues, 'result-verdict', '$.verdict', 'pass requires exact coverage and exactly seven subjects');
  }
  return validation(candidate as unknown as CampaignResult, issues);
}

/** Resolve an output path and prove it is contained by the campaign-owned root. */
export type CampaignOutputPathValidation =
  | { ok: true; outputPath: string; issues: [] }
  | { ok: false; issues: CampaignValidationIssue[] };

export function validateCampaignOutputPath(requestedOutput: string, campaignOutputRoot: string): CampaignOutputPathValidation {
  const issues: CampaignValidationIssue[] = [];
  if (!isNonEmptyString(requestedOutput) || !isNonEmptyString(campaignOutputRoot) || !path.isAbsolute(requestedOutput) || !path.isAbsolute(campaignOutputRoot)) {
    push(issues, 'output-path-invalid', '$.out', 'campaign output and root must be absolute paths');
    return { ok: false, issues };
  }
  const outputPath = path.resolve(requestedOutput);
  const root = path.resolve(campaignOutputRoot);
  const relative = path.relative(root, outputPath);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    push(issues, 'output-path-outside-campaign-root', '$.out', 'campaign output must stay inside its owned proof root');
  }
  return issues.length === 0 ? { ok: true, outputPath, issues: [] } : { ok: false, issues };
}
