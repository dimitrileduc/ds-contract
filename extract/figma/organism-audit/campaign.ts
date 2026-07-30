/**
 * Versioned, side-effect-free validation for Organism Audit Campaign v1 (013).
 *
 * The campaign document fixes the audited perimeter BEFORE anything is read,
 * captured or compared.  A campaign that can quietly shrink, reorder, or
 * reconcile a subject by its human label is a campaign that can present a
 * partial audit as a complete one, so every perimeter defect is refused here
 * with its own typed code — and named, so the refusal is actionable.
 *
 * Like `visual-parity/campaign.ts`, this module deliberately does not fetch
 * Figma, launch Chromium, read the filesystem or create directories: the runner
 * must be able to prove its perimeter before it earns the right to do any of
 * those things.
 *
 * Reference: contracts/audit-campaign.interface.md, data-model.md §1-§5,
 * research.md D2 (perimeter declared, stable, ordered — ids and keys are the
 * only authority, never a display name).
 */
import path from 'node:path';

export const ORGANISM_AUDIT_SCHEMA_VERSION = 1 as const;

/** data-model §3 — the twelve organisms, in wave order.  The order is meaning. */
export const EXPECTED_SUBJECT_IDS = [
  'coordonnees',
  'devis',
  'hero',
  'presentation',
  'sav',
  'texte-seo',
  'faq',
  'footer',
  'reassurances',
  'equipe',
  'formulaire',
  'header',
] as const;

export type OrganismSubjectId = (typeof EXPECTED_SUBJECT_IDS)[number];

export const KNOWN_RECEIPT_SCHEMAS = ['visual-campaign-v1', 'organism-audit-v1'] as const;
export type ReceiptSchema = (typeof KNOWN_RECEIPT_SCHEMAS)[number];

export const WAVE_ENTRY_RULES = ['previous-wave-classified', 'dependencies-proved'] as const;
export type WaveEntryRule = (typeof WAVE_ENTRY_RULES)[number];

export type AuditIssueCode =
  | 'campaign-shape'
  | 'schema-version'
  | 'campaign-id'
  | 'reference-file-key'
  | 'reference-file-version'
  | 'reference-read-only'
  | 'reference-device-scale-factor'
  | 'generated-surface'
  | 'acceptance-threshold'
  | 'expected-subject-ids'
  | 'subject-id'
  | 'subject-contract'
  | 'subject-set-node'
  | 'subject-audit-refs'
  | 'subject-coverage'
  | 'subject-known-limits'
  | 'wave-shape'
  | 'wave-partition'
  | 'wave-order'
  | 'wave-entry-rule'
  | 'dependency-gate'
  | 'dependency-receipt-schema'
  | 'dependency-mapping'
  | 'case-shape'
  | 'case-id'
  | 'case-node'
  | 'case-facts'
  | 'required-parts'
  | 'required-regions'
  | 'semantic-assertion'
  | 'asset-reference-invalid'
  | 'assets-manifest'
  | 'fact-declaration'
  | 'fact-representability'
  | 'coverage-missing'
  | 'coverage-unexpected'
  | 'deferred-policy'
  | 'display-name-matching'
  | 'output-path-invalid'
  | 'output-path-outside-campaign-root';

export interface AuditIssue {
  code: AuditIssueCode;
  path: string;
  message: string;
}

export type AuditValidation<T> =
  | { ok: true; value: T; issues: [] }
  | { ok: false; issues: AuditIssue[] };

export interface AuditWaveDeclaration {
  number: 1 | 2 | 3;
  subjectIds: string[];
  startsAfter: null | 1 | 2;
  entryRule: WaveEntryRule;
}

export interface AuditCampaign {
  schemaVersion: typeof ORGANISM_AUDIT_SCHEMA_VERSION;
  id: string;
  reference: {
    fileKey: string;
    fileVersion: string;
    readOnly: true;
    deviceScaleFactor?: number;
  };
  generatedSurface: { kind: 'react-storybook'; sourceRoot: string; bundleReceipt: string };
  acceptance: {
    maxRawDiffPct: number;
    maxRegionDiffPct: number;
    baselineEpsilonPp: number;
    requireExactCoverage: boolean;
    requireVisibleEvidence: boolean;
    requireGeometryPass: boolean;
    requireSemanticPass: boolean;
  };
  expectedSubjectIds: string[];
  waves: AuditWaveDeclaration[];
  dependencyGates: DependencyGateDeclaration[];
  assetsManifest: string;
  deferredPolicy: {
    forbidHardcodedValueConversion: true;
    forbidTokenFoundationChanges: true;
    baselineReceipt: string;
  };
  subjects: OrganismTargetDeclaration[];
}

export interface DependencyGateDeclaration {
  parentSubjectId: string;
  dependencyContractId: string;
  receiptSchema: ReceiptSchema;
  requiredVerdict: 'proved';
  resultPath: string;
  resultSha256: string;
  expectedContractVersion: string;
  expectedFigmaFileVersion: string;
  requireProbative: boolean;
}

export interface OrganismTargetDeclaration {
  id: string;
  displayName: string;
  wave: 1 | 2 | 3;
  contractId: string;
  contractVersion: string;
  contractPath: string;
  figmaSetNodeId: string;
  auditRefs: string[];
  knownLimits: unknown[];
  dependencyId: string | null;
  coverage: {
    deriveFromFigma: boolean;
    deriveFromContract: boolean;
    deriveFromGeneratedProjection: boolean;
    requiredFactIds: string[];
  };
  cases: unknown[];
}

export interface AuditCampaignValidationOptions {
  assetManifest?: { assets: Array<{ id: string; sha256?: string }> } | null;
}

type JsonRecord = Record<string, unknown>;
const SHA256 = /^[a-f0-9]{64}$/i;
const SUBJECT_ID_SET = new Set<string>(EXPECTED_SUBJECT_IDS);
const RECEIPT_SCHEMA_SET = new Set<string>(KNOWN_RECEIPT_SCHEMAS);
const ENTRY_RULE_SET = new Set<string>(WAVE_ENTRY_RULES);

/** data-model §4 — the three wave-3 pairings are fixed. */
const DEPENDENCY_BY_PARENT: Record<string, string> = {
  equipe: 'ds.member-card',
  formulaire: 'ds.field',
  header: 'ds.nav-item',
};

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isNonEmptyString);
const unique = (values: readonly string[]): boolean => new Set(values).size === values.length;
const segments = (value: string): string[] => value.split(/[\\/]+/);
const isBoundedRelativePath = (value: unknown): value is string =>
  isNonEmptyString(value) && !path.isAbsolute(value) && !segments(value).includes('..');

function push(issues: AuditIssue[], code: AuditIssueCode, issuePath: string, message: string): void {
  issues.push({ code, path: issuePath, message });
}

function validation<T>(value: T, issues: AuditIssue[]): AuditValidation<T> {
  return issues.length === 0 ? { ok: true, value, issues: [] } : { ok: false, issues };
}

/**
 * Distinguish "this is a human label" from "this is simply unknown".  A gate
 * naming `Equipe` instead of `equipe` is not a typo to be normalised away: it
 * is reconciliation by display name, and normalising it is exactly how a
 * renamed master silently satisfies another organism's slot (D2).
 */
function looksLikeDisplayName(candidate: string, declaredDisplayNames: Set<string>): boolean {
  if (declaredDisplayNames.has(candidate)) return true;
  const normalised = candidate.toLowerCase().replace(/[\s_]+/g, '-');
  return SUBJECT_ID_SET.has(normalised) && !SUBJECT_ID_SET.has(candidate);
}

/**
 * Validate the campaign document without touching the filesystem.  The caller
 * supplies the already-read asset manifest, keeping the preflight testable and
 * free of any output or Figma side effect.
 */
export function validateAuditCampaign(
  candidate: unknown,
  options: AuditCampaignValidationOptions = {},
): AuditValidation<AuditCampaign> {
  const issues: AuditIssue[] = [];
  if (!isRecord(candidate)) {
    push(issues, 'campaign-shape', '$', 'campaign must be an object');
    return validation(candidate as AuditCampaign, issues);
  }

  if (candidate.schemaVersion !== ORGANISM_AUDIT_SCHEMA_VERSION) {
    push(
      issues,
      'schema-version',
      '$.schemaVersion',
      `schemaVersion must equal ${ORGANISM_AUDIT_SCHEMA_VERSION}`,
    );
  }
  if (!isNonEmptyString(candidate.id) || !/^[a-z0-9][a-z0-9-]*$/.test(candidate.id)) {
    push(issues, 'campaign-id', '$.id', 'campaign id must be a stable kebab-case identifier');
  }

  // Reconciliation is by id/contract key only.  An explicit opt-in to label
  // matching is refused rather than honoured.
  if (candidate.matchBy !== undefined && candidate.matchBy !== 'id') {
    push(
      issues,
      'display-name-matching',
      '$.matchBy',
      `subjects are reconciled by id only; got matchBy="${String(candidate.matchBy)}"`,
    );
  }

  const reference = candidate.reference;
  if (!isRecord(reference)) {
    push(issues, 'campaign-shape', '$.reference', 'reference must be an object');
  } else {
    if (!isNonEmptyString(reference.fileKey)) {
      push(issues, 'reference-file-key', '$.reference.fileKey', 'fileKey is required');
    }
    if (!isNonEmptyString(reference.fileVersion) || !/^\d+$/.test(reference.fileVersion)) {
      push(
        issues,
        'reference-file-version',
        '$.reference.fileVersion',
        'fileVersion must be a pinned numeric version',
      );
    }
    if (reference.readOnly !== true) {
      push(
        issues,
        'reference-read-only',
        '$.reference.readOnly',
        'readOnly must be exactly true — 013 never writes to Figma (FR-009)',
      );
    }
    const dsf = reference.deviceScaleFactor;
    if (dsf !== undefined && (typeof dsf !== 'number' || !Number.isInteger(dsf) || dsf < 1)) {
      push(
        issues,
        'reference-device-scale-factor',
        '$.reference.deviceScaleFactor',
        'deviceScaleFactor must be a positive integer applied identically to both sides',
      );
    }
  }

  // D4 — the proved surface is the generated React.  `emit-html` is a
  // diagnostic and may never be declared as the campaign's authority.
  const surface = candidate.generatedSurface;
  if (!isRecord(surface) || surface.kind !== 'react-storybook') {
    push(
      issues,
      'generated-surface',
      '$.generatedSurface.kind',
      `generatedSurface.kind must be "react-storybook"; got "${String(isRecord(surface) ? surface.kind : surface)}"`,
    );
  } else if (!isBoundedRelativePath(surface.sourceRoot)) {
    push(
      issues,
      'generated-surface',
      '$.generatedSurface.sourceRoot',
      'sourceRoot must be a bounded repository-relative path',
    );
  }

  // D7 — 013 accepts 2.5 % and not a hair more, on both terms.
  const acceptance = candidate.acceptance;
  if (!isRecord(acceptance)) {
    push(issues, 'acceptance-threshold', '$.acceptance', 'acceptance must be an object');
  } else {
    for (const key of ['maxRawDiffPct', 'maxRegionDiffPct'] as const) {
      const threshold = acceptance[key];
      if (
        typeof threshold !== 'number' ||
        !Number.isFinite(threshold) ||
        threshold < 0 ||
        threshold > 2.5
      ) {
        push(
          issues,
          'acceptance-threshold',
          `$.acceptance.${key}`,
          `${key} must be a finite number in [0, 2.5]; got ${String(threshold)}`,
        );
      }
    }
  }

  if (!isBoundedRelativePath(candidate.assetsManifest)) {
    push(
      issues,
      'assets-manifest',
      '$.assetsManifest',
      `assetsManifest must be a bounded repository-relative path without ".."; got "${String(candidate.assetsManifest)}"`,
    );
  }
  if (options.assetManifest !== undefined && options.assetManifest !== null) {
    if (!Array.isArray(options.assetManifest.assets)) {
      push(issues, 'assets-manifest', '$.assetsManifest', 'asset manifest must contain an assets array');
    }
  }

  // Both deferral prohibitions are load-bearing for SC-005; neither is optional.
  const deferredPolicy = candidate.deferredPolicy;
  if (!isRecord(deferredPolicy)) {
    push(issues, 'deferred-policy', '$.deferredPolicy', 'deferredPolicy must be an object');
  } else {
    for (const key of ['forbidHardcodedValueConversion', 'forbidTokenFoundationChanges'] as const) {
      if (deferredPolicy[key] !== true) {
        push(
          issues,
          'deferred-policy',
          `$.deferredPolicy.${key}`,
          `${key} must be exactly true`,
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Perimeter: exactly the twelve declared ids, in wave order.
  // ---------------------------------------------------------------------------
  const perimeter = candidate.expectedSubjectIds;
  let perimeterOk = false;
  if (!isStringArray(perimeter)) {
    push(
      issues,
      'expected-subject-ids',
      '$.expectedSubjectIds',
      'expectedSubjectIds must be the exact twelve-organism array',
    );
  } else if (
    perimeter.length !== EXPECTED_SUBJECT_IDS.length ||
    perimeter.some((id, index) => id !== EXPECTED_SUBJECT_IDS[index])
  ) {
    const width = Math.max(perimeter.length, EXPECTED_SUBJECT_IDS.length);
    for (let index = 0; index < width; index += 1) {
      const expected = EXPECTED_SUBJECT_IDS[index];
      const observed = perimeter[index];
      if (expected === observed) continue;
      push(
        issues,
        'expected-subject-ids',
        `$.expectedSubjectIds[${index}]`,
        expected === undefined
          ? `subject "${observed}" is outside the declared twelve-organism perimeter`
          : observed === undefined
            ? `declared subject "${expected}" is missing from the perimeter`
            : `expected "${expected}" at position ${index}, found "${observed}"`,
      );
    }
    if (!unique(perimeter)) {
      push(issues, 'expected-subject-ids', '$.expectedSubjectIds', 'perimeter contains a duplicate');
    }
  } else {
    perimeterOk = true;
  }
  const declaredPerimeter: readonly string[] = perimeterOk
    ? (perimeter as string[])
    : EXPECTED_SUBJECT_IDS;

  // ---------------------------------------------------------------------------
  // Waves: a lossless, ordered partition of the perimeter.
  // ---------------------------------------------------------------------------
  const waves = candidate.waves;
  if (!Array.isArray(waves)) {
    push(issues, 'wave-shape', '$.waves', 'waves must be an array of three wave declarations');
  } else {
    const covered: string[] = [];
    for (const [index, wave] of waves.entries()) {
      const wavePath = `$.waves[${index}]`;
      if (!isRecord(wave)) {
        push(issues, 'wave-shape', wavePath, 'wave must be an object');
        continue;
      }
      if (wave.number !== index + 1) {
        push(
          issues,
          'wave-order',
          `${wavePath}.number`,
          `waves must be declared in ascending order; expected number ${index + 1}, got ${String(wave.number)}`,
        );
      }
      // Wave 1 starts after nothing, 2 after 1, 3 after 2.  A campaign able to
      // reorder its own gates could audit a composed organism before its
      // dependency was ever classified.
      const expectedStartsAfter = index === 0 ? null : index;
      if (wave.startsAfter !== expectedStartsAfter) {
        push(
          issues,
          'wave-order',
          `${wavePath}.startsAfter`,
          `wave ${index + 1} must declare startsAfter=${String(expectedStartsAfter)}; got ${String(wave.startsAfter)}`,
        );
      }
      if (!isNonEmptyString(wave.entryRule) || !ENTRY_RULE_SET.has(wave.entryRule)) {
        push(
          issues,
          'wave-entry-rule',
          `${wavePath}.entryRule`,
          `entryRule must be one of ${WAVE_ENTRY_RULES.join(' | ')}; got "${String(wave.entryRule)}"`,
        );
      }
      if (!isStringArray(wave.subjectIds) || wave.subjectIds.length === 0) {
        push(issues, 'wave-shape', `${wavePath}.subjectIds`, 'wave must declare a non-empty subject list');
        continue;
      }
      covered.push(...wave.subjectIds);
    }

    // Set-level defects are `wave-partition`; sequencing defects are `wave-order`.
    const coveredSet = new Set(covered);
    const missing = declaredPerimeter.filter((id) => !coveredSet.has(id));
    const surplus = covered.filter((id) => !declaredPerimeter.includes(id));
    const duplicated = covered.filter((id, index) => covered.indexOf(id) !== index);
    if (missing.length > 0) {
      push(issues, 'wave-partition', '$.waves', `waves do not cover: ${missing.join(', ')}`);
    }
    if (surplus.length > 0) {
      push(issues, 'wave-partition', '$.waves', `waves cover undeclared subjects: ${surplus.join(', ')}`);
    }
    if (duplicated.length > 0) {
      push(issues, 'wave-partition', '$.waves', `subjects claimed by more than one wave: ${[...new Set(duplicated)].join(', ')}`);
    }
    // The concatenated waves must reproduce the perimeter order exactly: waves
    // and reports read these arrays positionally.
    if (missing.length === 0 && surplus.length === 0 && duplicated.length === 0) {
      const flattened = covered.join(' ');
      if (flattened !== declaredPerimeter.join(' ')) {
        push(
          issues,
          'wave-order',
          '$.waves',
          `wave subject order must follow the declared perimeter: expected ${declaredPerimeter.join(', ')}, got ${covered.join(', ')}`,
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Dependency gates: the three fixed pairings, derived verdicts only.
  // ---------------------------------------------------------------------------
  const declaredDisplayNames = new Set<string>(
    Array.isArray(candidate.subjects)
      ? candidate.subjects
          .filter(isRecord)
          .map((subject) => subject.displayName)
          .filter(isNonEmptyString)
      : [],
  );

  const gates = candidate.dependencyGates;
  if (!Array.isArray(gates)) {
    push(issues, 'dependency-gate', '$.dependencyGates', 'dependencyGates must be an array');
  } else {
    for (const [index, gate] of gates.entries()) {
      const gatePath = `$.dependencyGates[${index}]`;
      if (!isRecord(gate)) {
        push(issues, 'dependency-gate', gatePath, 'dependency gate must be an object');
        continue;
      }
      const parentId = gate.parentSubjectId;
      if (!isNonEmptyString(parentId) || !SUBJECT_ID_SET.has(parentId)) {
        if (isNonEmptyString(parentId) && looksLikeDisplayName(parentId, declaredDisplayNames)) {
          push(
            issues,
            'display-name-matching',
            `${gatePath}.parentSubjectId`,
            `dependency gate must name its parent by id, not display name; got "${parentId}"`,
          );
        } else {
          push(
            issues,
            'dependency-gate',
            `${gatePath}.parentSubjectId`,
            `unknown parent subject "${String(parentId)}"`,
          );
        }
      } else {
        const expectedDependency = DEPENDENCY_BY_PARENT[parentId];
        if (expectedDependency === undefined) {
          push(
            issues,
            'dependency-gate',
            `${gatePath}.parentSubjectId`,
            `"${parentId}" declares no dependency in the 013 inventory`,
          );
        } else if (gate.dependencyContractId !== expectedDependency) {
          push(
            issues,
            'dependency-gate',
            `${gatePath}.dependencyContractId`,
            `${parentId} must depend on ${expectedDependency}; got "${String(gate.dependencyContractId)}"`,
          );
        }
      }

      if (!isNonEmptyString(gate.receiptSchema) || !RECEIPT_SCHEMA_SET.has(gate.receiptSchema)) {
        push(
          issues,
          'dependency-receipt-schema',
          `${gatePath}.receiptSchema`,
          `unknown receiptSchema "${String(gate.receiptSchema)}" — must be one of ${KNOWN_RECEIPT_SCHEMAS.join(' | ')}`,
        );
      }

      // The manifest declares WHICH receipt to read; it can never declare what
      // the receipt says (data-model §4).
      if (gate.requiredVerdict !== 'proved') {
        push(
          issues,
          'dependency-mapping',
          `${gatePath}.requiredVerdict`,
          `requiredVerdict must be "proved"; got "${String(gate.requiredVerdict)}"`,
        );
      }
      for (const derived of ['probative', 'actualVerdict', 'receiptVerdict'] as const) {
        if (gate[derived] !== undefined) {
          push(
            issues,
            'dependency-mapping',
            `${gatePath}.${derived}`,
            `${derived} is derived from the receipt and cannot be declared by the manifest`,
          );
        }
      }
      if (!isBoundedRelativePath(gate.resultPath)) {
        push(issues, 'dependency-gate', `${gatePath}.resultPath`, 'resultPath must be a bounded relative path');
      }
      if (!isNonEmptyString(gate.resultSha256) || !SHA256.test(gate.resultSha256)) {
        push(issues, 'dependency-gate', `${gatePath}.resultSha256`, 'resultSha256 must be a SHA-256 digest');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Subjects mirror the perimeter 1:1, in order.
  // ---------------------------------------------------------------------------
  const subjects = candidate.subjects;
  if (!Array.isArray(subjects)) {
    push(issues, 'subject-id', '$.subjects', 'subjects must mirror the declared perimeter');
  } else {
    const ids = subjects.map((subject) =>
      isRecord(subject) && isNonEmptyString(subject.id) ? subject.id : '',
    );
    const width = Math.max(ids.length, declaredPerimeter.length);
    for (let index = 0; index < width; index += 1) {
      const expected = declaredPerimeter[index];
      const observed = ids[index];
      if (expected === observed) continue;
      push(
        issues,
        'subject-id',
        `$.subjects[${index}]`,
        expected === undefined
          ? `subject "${observed}" is not part of the declared perimeter`
          : observed === undefined || observed === ''
            ? `declared subject "${expected}" has no audited entry`
            : `expected declared subject "${expected}" at position ${index}, found "${observed}"`,
      );
    }

    for (const [index, subject] of subjects.entries()) {
      const subjectPath = `$.subjects[${index}]`;
      if (!isRecord(subject)) continue;
      const subjectId = isNonEmptyString(subject.id) ? subject.id : '';

      if (subject.matchBy !== undefined && subject.matchBy !== 'id') {
        push(
          issues,
          'display-name-matching',
          `${subjectPath}.matchBy`,
          `a subject is reconciled by id only; got matchBy="${String(subject.matchBy)}"`,
        );
      }
      if (subject.contractId !== `ds.${subjectId}` || !isNonEmptyString(subject.contractVersion)) {
        push(
          issues,
          'subject-contract',
          subjectPath,
          `subject contract id/version must match its id (expected "ds.${subjectId}")`,
        );
      }
      if (!isBoundedRelativePath(subject.contractPath)) {
        push(issues, 'subject-contract', `${subjectPath}.contractPath`, 'contractPath must be a bounded relative path');
      }
      if (!isNonEmptyString(subject.figmaSetNodeId)) {
        push(issues, 'subject-set-node', `${subjectPath}.figmaSetNodeId`, 'figmaSetNodeId is required');
      }
      if (!isStringArray(subject.auditRefs) || subject.auditRefs.length === 0) {
        push(issues, 'subject-audit-refs', `${subjectPath}.auditRefs`, 'at least one cleanliness audit ref is required');
      } else if (!subject.auditRefs.every(isBoundedRelativePath)) {
        push(issues, 'subject-audit-refs', `${subjectPath}.auditRefs`, 'audit refs must be bounded relative paths');
      }
      if (!Array.isArray(subject.knownLimits)) {
        push(issues, 'subject-known-limits', `${subjectPath}.knownLimits`, 'knownLimits must be an array (possibly empty)');
      }

      const coverage = subject.coverage;
      if (!isRecord(coverage)) {
        push(issues, 'subject-coverage', `${subjectPath}.coverage`, 'coverage must be an object');
      } else {
        for (const key of [
          'deriveFromFigma',
          'deriveFromContract',
          'deriveFromGeneratedProjection',
        ] as const) {
          if (coverage[key] !== true) {
            push(
              issues,
              'subject-coverage',
              `${subjectPath}.coverage.${key}`,
              `${key} must be true — coverage is the union of all three derivations (D6)`,
            );
          }
        }
        if (!Array.isArray(coverage.requiredFactIds)) {
          push(issues, 'subject-coverage', `${subjectPath}.coverage.requiredFactIds`, 'requiredFactIds must be an array');
        } else if (!unique(coverage.requiredFactIds as string[])) {
          push(issues, 'subject-coverage', `${subjectPath}.coverage.requiredFactIds`, 'requiredFactIds must be unique');
        }
      }

      // Only wave-3 organisms carry a dependency, and it must be the fixed one.
      const expectedDependency = DEPENDENCY_BY_PARENT[subjectId] ?? null;
      if (subject.dependencyId !== undefined && subject.dependencyId !== expectedDependency) {
        push(
          issues,
          'dependency-gate',
          `${subjectPath}.dependencyId`,
          `expected dependencyId ${String(expectedDependency)}; got ${String(subject.dependencyId)}`,
        );
      }
      if (!Array.isArray(subject.cases)) {
        push(issues, 'case-shape', `${subjectPath}.cases`, 'cases must be an array');
      }
    }
  }

  return validation(candidate as unknown as AuditCampaign, issues);
}

export type AuditOutputPathValidation =
  | { ok: true; outputPath: string; issues: [] }
  | { ok: false; issues: AuditIssue[] };

/**
 * Resolve an output path and prove it is contained by the campaign-owned root.
 *
 * Stricter than mere containment: a `..` segment is refused even when it would
 * normalise back inside the root.  An owned proof path is *declared*, not
 * computed, and letting normalisation decide would make the boundary depend on
 * a resolver detail rather than on the document.
 */
export function validateAuditOutputPath(
  requestedOutput: string,
  campaignOutputRoot: string,
): AuditOutputPathValidation {
  const issues: AuditIssue[] = [];
  if (!isNonEmptyString(requestedOutput) || !isNonEmptyString(campaignOutputRoot)) {
    push(issues, 'output-path-invalid', '$.out', 'campaign output and root must be non-empty paths');
    return { ok: false, issues };
  }
  if (!path.isAbsolute(requestedOutput) || !path.isAbsolute(campaignOutputRoot)) {
    push(
      issues,
      'output-path-invalid',
      '$.out',
      `campaign output and root must be absolute paths; got "${requestedOutput}"`,
    );
    return { ok: false, issues };
  }
  if (segments(requestedOutput).includes('..')) {
    push(
      issues,
      'output-path-invalid',
      '$.out',
      `campaign output must not contain a ".." segment; got "${requestedOutput}"`,
    );
    return { ok: false, issues };
  }

  const outputPath = path.resolve(requestedOutput);
  const root = path.resolve(campaignOutputRoot);
  const relative = path.relative(root, outputPath);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    push(
      issues,
      'output-path-outside-campaign-root',
      '$.out',
      'campaign output must stay inside its owned proof root',
    );
    return { ok: false, issues };
  }
  return { ok: true, outputPath, issues: [] };
}

export interface WaveEntryInput {
  waveNumber: 1 | 2 | 3;
  waves: AuditWaveDeclaration[];
  priorSubjectStates: Array<{ id: string; classified: boolean; verdict: string | null }>;
}

export interface WaveEntryResult {
  allowed: boolean;
  exitCode: 0 | 2;
  reasons: string[];
}

/**
 * Enforce the wave-entry rule in the TOOL rather than by convention — a
 * convention cannot refuse anything.
 *
 * `previous-wave-classified` means every prior subject reached an HONEST FINAL
 * verdict.  It emphatically does not mean the prior wave passed: the expected
 * 013 result carries at least three blocked organisms, so reading this as "all
 * green" would deadlock the campaign before it could ever report them.
 */
export function evaluateWaveEntry(input: WaveEntryInput): WaveEntryResult {
  const { waveNumber, waves, priorSubjectStates } = input;
  const reasons: string[] = [];

  const requiredIds = waves
    .filter((wave) => wave.number < waveNumber)
    .flatMap((wave) => wave.subjectIds);
  if (requiredIds.length === 0) return { allowed: true, exitCode: 0, reasons: [] };

  const byId = new Map(priorSubjectStates.map((state) => [state.id, state]));
  for (const id of requiredIds) {
    const state = byId.get(id);
    if (state === undefined) {
      reasons.push(`missing-dossier:${id}`);
      continue;
    }
    if (!state.classified) {
      reasons.push(`unclassified:${id}`);
      continue;
    }
    // A classification IS a verdict; claiming one without the other would let
    // an empty dossier open the next wave.
    if (state.verdict === null || state.verdict.trim() === '') {
      reasons.push(`classified-without-verdict:${id}`);
    }
  }

  return reasons.length === 0
    ? { allowed: true, exitCode: 0, reasons: [] }
    : { allowed: false, exitCode: 2, reasons };
}
