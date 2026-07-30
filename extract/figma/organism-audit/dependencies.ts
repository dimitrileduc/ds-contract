/**
 * The normative dependency gate of the organism audit (013).
 *
 * `Equipe`, `Formulaire` and `Header` compose molecules whose own proof lives in
 * a `Visual Campaign v1` receipt.  That receipt speaks `pass` / `fail` /
 * `blocked` at subject level and carries `probative` only per case — `proved`
 * never appears in it literally.  So this module DERIVES both values from the
 * receipt's own required cases and maps the vocabulary normatively.  Two rules
 * do the load bearing:
 *
 *   1. `probative` is derived, never read.  A receipt that writes
 *      `probative: true` on itself does not get to keep it.
 *   2. only a fresh, probative `pass` maps to `proved`, and only a mapped
 *      `proved` opens a parent.  Absence of evidence — an unreadable receipt, an
 *      absent subject, an unknown verdict — is never evidence of fidelity.
 *
 * The module is pure: bytes come in, a receipt goes out.  It never reads the
 * filesystem, so the caller owns (and can be refused for) the path it opened.
 *
 * Reference: contracts/audit-campaign.interface.md (normative mapping),
 * contracts/audit-result.interface.md (Dependency gate result), data-model.md
 * §4, research.md D9.
 */
import { createHash } from 'node:crypto';

import type { DependencyGateDeclaration, ReceiptSchema } from './campaign.js';
import type { OrganismVerdict } from './verdict.js';

export type RawReceiptVerdict = 'pass' | 'fail' | 'blocked';

const RAW_VERDICTS = new Set<string>(['pass', 'fail', 'blocked']);

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/** `ds.nav-item` names the contract; the receipt files it under `nav-item`. */
export const receiptSubjectIdFor = (dependencyContractId: string): string =>
  dependencyContractId.replace(/^ds\./, '');

export interface ReceiptProbativeInput {
  receipt: unknown;
  subjectId: string;
  requiredCaseIds: string[];
}

export interface ReceiptProbativeResult {
  probative: boolean;
  reasons: string[];
}

/**
 * Derive whether a receipt's subject actually proves anything:
 *
 *   probative = subject.missing == []
 *               AND every requiredCaseId resolves to a case OF THAT SUBJECT
 *               AND every one of those cases carries probative == true
 *
 * The subject's own `probative` field, if it has one, is deliberately ignored.
 */
export function deriveReceiptProbative(input: ReceiptProbativeInput): ReceiptProbativeResult {
  const { receipt, subjectId, requiredCaseIds } = input;
  const reasons: string[] = [];

  if (!isRecord(receipt)) return { probative: false, reasons: ['receipt-unreadable'] };
  const subjects = receipt.subjects;
  const cases = receipt.cases;
  if (!Array.isArray(subjects)) return { probative: false, reasons: ['receipt-has-no-subjects'] };

  const subject = subjects.filter(isRecord).find((entry) => entry.id === subjectId);
  if (subject === undefined) {
    return { probative: false, reasons: [`subject-absent-from-receipt:${subjectId}`] };
  }

  // A receipt-side coverage hole is a hole in the evidence, whatever its cases say.
  const missing = subject.missing;
  if (!Array.isArray(missing)) {
    reasons.push(`subject-missing-not-reported:${subjectId}`);
  } else if (missing.length > 0) {
    reasons.push(`receipt-coverage-hole:${missing.map(String).join('+')}`);
  }

  // Required cases are the gate's scope: a non-probative case OUTSIDE that set
  // does not poison the derivation, but every case inside it must hold.
  const scoped = Array.isArray(cases) ? cases.filter(isRecord) : [];
  for (const caseId of requiredCaseIds) {
    const found = scoped.find((entry) => entry.id === caseId && entry.subjectId === subjectId);
    if (found === undefined) {
      reasons.push(`required-case-unresolved:${caseId}`);
      continue;
    }
    if (found.probative !== true) reasons.push(`required-case-not-probative:${caseId}`);
  }

  return { probative: reasons.length === 0, reasons };
}

export interface MappedVerdict {
  actualVerdict: OrganismVerdict;
  reasons: string[];
}

/**
 * The normative v1 → 013 mapping.
 *
 *   pass    → proved   (ONLY when the derived probative holds)
 *   fail    → divergent
 *   blocked → blocked
 *   anything else (absent, unknown, wrong type) → not-proven
 *
 * `proved`, `divergent` and friends are not v1 vocabulary: a receipt writing one
 * of them into its own verdict field is producing an *unknown* value, and an
 * unknown value proves nothing.
 */
export function mapReceiptVerdict(
  raw: RawReceiptVerdict | string | null | undefined,
  probative: boolean,
): MappedVerdict {
  if (typeof raw !== 'string' || !RAW_VERDICTS.has(raw)) {
    return {
      actualVerdict: 'not-proven',
      reasons: [`receipt-verdict-unknown:${typeof raw === 'string' && raw !== '' ? raw : String(raw)}`],
    };
  }
  if (raw === 'fail') return { actualVerdict: 'divergent', reasons: ['receipt-verdict-fail'] };
  if (raw === 'blocked') return { actualVerdict: 'blocked', reasons: ['receipt-verdict-blocked'] };
  if (!probative) {
    return { actualVerdict: 'not-proven', reasons: ['pass-without-derived-probative'] };
  }
  return { actualVerdict: 'proved', reasons: [] };
}

export interface DependencyGateResult {
  parentSubjectId: string;
  dependencyContractId: string;
  receiptSchema: ReceiptSchema;
  resultPath: string;
  /** Recomputed over the bytes actually read — never the manifest's wish. */
  resultSha256: string;
  contractVersion: string;
  figmaFileVersion: string;
  receiptVerdict: string;
  probative: boolean;
  actualVerdict: OrganismVerdict;
  staleReasons: string[];
  open: boolean;
  reasons: string[];
}

export interface DependencyGateInput {
  gate: DependencyGateDeclaration;
  /** `null` when the receipt could not be read at all. */
  receiptBytes: Uint8Array | string | null;
  actualContractVersion: string | null;
  currentFigmaFileVersion: string;
}

/**
 * Evaluate one dependency gate end to end.
 *
 *   open = hash matches
 *          AND contract version matches
 *          AND reference is fresh
 *          AND derived probative
 *          AND mapped actualVerdict == proved
 *
 * Anything less leaves the parent `blocked` with a typed reason and the receipt
 * path travelling alongside, so a reader can go and check rather than trust.
 */
export function evaluateDependencyGate(input: DependencyGateInput): DependencyGateResult {
  const { gate, receiptBytes, actualContractVersion, currentFigmaFileVersion } = input;
  const staleReasons: string[] = [];
  const reasons: string[] = [];

  const bytesRead = receiptBytes === null ? null : Buffer.from(receiptBytes as never);
  const resultSha256 =
    bytesRead === null ? '' : createHash('sha256').update(bytesRead).digest('hex');

  if (bytesRead === null) {
    staleReasons.push('receipt-unreadable');
  } else if (gate.resultSha256 !== resultSha256) {
    // Report the hash of what was actually read, so a mismatch is visible
    // rather than papered over by echoing the declared value.
    staleReasons.push(`receipt-hash-mismatch:${gate.resultSha256}!=${resultSha256}`);
  }

  if (actualContractVersion === null) {
    staleReasons.push(`dependency-contract-version-unreadable:${gate.dependencyContractId}`);
  } else if (actualContractVersion !== gate.expectedContractVersion) {
    staleReasons.push(
      `dependency-contract-version-moved:${gate.expectedContractVersion}->${actualContractVersion}`,
    );
  }

  if (currentFigmaFileVersion !== gate.expectedFigmaFileVersion) {
    staleReasons.push(
      `figma-file-version-moved:${gate.expectedFigmaFileVersion}->${currentFigmaFileVersion}`,
    );
  }

  let receipt: unknown = null;
  if (bytesRead !== null) {
    try {
      receipt = JSON.parse(bytesRead.toString('utf8')) as unknown;
    } catch {
      receipt = null;
      staleReasons.push('receipt-unparsable');
    }
  }

  const subjectId = receiptSubjectIdFor(gate.dependencyContractId);
  const subjects = isRecord(receipt) && Array.isArray(receipt.subjects) ? receipt.subjects : [];
  const subject = subjects.filter(isRecord).find((entry) => entry.id === subjectId);
  const requiredCaseIds = Array.isArray(subject?.requiredCaseIds)
    ? (subject.requiredCaseIds as unknown[]).filter(isNonEmptyString)
    : [];

  const { probative, reasons: probativeReasons } = deriveReceiptProbative({
    receipt,
    subjectId,
    requiredCaseIds,
  });
  reasons.push(...probativeReasons);

  const rawVerdict = isNonEmptyString(subject?.verdict) ? subject.verdict : null;
  const mapped = mapReceiptVerdict(rawVerdict, probative);
  reasons.push(...mapped.reasons);

  // A stale receipt cannot speak to the CURRENT state, so it can never carry a
  // positive verdict forward.  Staleness never erases an already-reported
  // defect (`divergent`/`blocked` stay as observed, which is more informative);
  // it only refuses to let a pass survive its own evidence going out of date.
  let actualVerdict = mapped.actualVerdict;
  if (staleReasons.length > 0 && actualVerdict === 'proved') {
    actualVerdict = 'not-proven';
    reasons.push('proved-receipt-is-stale');
  }

  const open = staleReasons.length === 0 && probative && actualVerdict === 'proved';
  if (!open) {
    reasons.push(`dependency-not-proved:${gate.dependencyContractId}`);
    reasons.push(...staleReasons);
  }

  return {
    parentSubjectId: gate.parentSubjectId,
    dependencyContractId: gate.dependencyContractId,
    receiptSchema: gate.receiptSchema,
    resultPath: gate.resultPath,
    resultSha256,
    contractVersion: actualContractVersion ?? gate.expectedContractVersion,
    figmaFileVersion: currentFigmaFileVersion,
    receiptVerdict: rawVerdict ?? '',
    probative,
    actualVerdict,
    staleReasons,
    open,
    reasons: [...new Set(reasons)],
  };
}
