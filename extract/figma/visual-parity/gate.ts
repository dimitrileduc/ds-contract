/**
 * Pass/fail policy for visual parity.
 *
 * The raw score is the only authoritative score. A DOM-derived text mask is
 * useful for diagnosing cross-renderer glyph noise, but it removes pixels
 * from both the numerator and denominator. It therefore cannot prove parity
 * for the evidence it excludes and must never lower the pass/fail score.
 *
 * Keeping this policy side-effect-free lets deterministic eval fixtures test
 * it without importing run.ts (which executes the live visual CLI).
 */
import type {
  GeometryReceipt,
  PixelReceipt,
  ProbativeEvidenceReceipt,
  SemanticReceipt,
} from './evidence.js';
import type { DiffResult } from './img.js';

export interface AuthoritativeScore {
  scorePct: number;
  basis: 'unmasked';
}

/**
 * The smallest Evidence Result v1 surface the final acceptance gate needs.
 * These are type-only imports: receipt construction remains in evidence.ts,
 * while the gate independently rechecks the pass conditions it relies on.
 *
 * The input mirrors the case receipts:
 *
 * - the global pixel score is raw/unmasked;
 * - every declared required region has an independent score;
 * - both rendered sides are probative;
 * - geometry either matches or has a contract-backed justification; and
 * - every declared semantic assertion has a passing receipt.
 */
export interface AuthoritativeGateInput {
  pixels: Pick<
    PixelReceipt,
    | 'rawPct'
    | 'maskedDiagnosticPct'
    | 'maskCoveragePct'
    | 'thresholdPct'
    | 'regions'
    | 'requiredRegionIds'
  >;
  visibility: Pick<ProbativeEvidenceReceipt, 'figma' | 'generated'> | null | undefined;
  geometry: Pick<GeometryReceipt, 'verdict'> | null | undefined;
  requiredSemanticAssertionIds: readonly string[];
  semantics: readonly Pick<SemanticReceipt, 'id' | 'verdict'>[];
}

export type AuthoritativeGateFailure =
  | 'global-score-missing'
  | 'global-score-exceeds-threshold'
  | 'required-region-missing'
  | 'required-region-failed'
  | 'visibility-receipt-missing'
  | 'visibility-receipt-failed'
  | 'geometry-receipt-missing'
  | 'geometry-receipt-failed'
  | 'semantic-receipt-missing'
  | 'semantic-receipt-failed';

export interface AuthoritativeGateResult extends AuthoritativeScore {
  passed: boolean;
  verdict: 'pass' | 'fail';
  /** Deterministic requirement-level refusals, in evaluation order. */
  failures: AuthoritativeGateFailure[];
}

export function authoritativeScore(
  diff: Pick<DiffResult, 'unmaskedPct' | 'maskedPct' | 'maskCoveragePct'>,
): AuthoritativeScore {
  return {
    scorePct: diff.unmaskedPct,
    basis: 'unmasked',
  };
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isNonNegativeFiniteNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value >= 0;

const hasUniqueIds = (ids: readonly string[]): boolean =>
  new Set(ids).size === ids.length;

/**
 * Evaluate the documented case-level acceptance rule.
 *
 * This intentionally recomputes the pixel conditions from raw receipts
 * rather than trusting a producer's aggregate `pixels.verdict`.  A masked
 * diagnostic score is accepted as report data but is never read here.
 */
export function evaluateAuthoritativeGate(
  input: AuthoritativeGateInput,
): AuthoritativeGateResult {
  const score = authoritativeScore({
    unmaskedPct: input.pixels.rawPct,
    maskedPct: input.pixels.maskedDiagnosticPct ?? null,
    maskCoveragePct: input.pixels.maskCoveragePct ?? 0,
  });
  const failures: AuthoritativeGateFailure[] = [];

  if (
    !isNonNegativeFiniteNumber(score.scorePct) ||
    !isNonNegativeFiniteNumber(input.pixels.thresholdPct)
  ) {
    failures.push('global-score-missing');
  } else if (score.scorePct > input.pixels.thresholdPct) {
    failures.push('global-score-exceeds-threshold');
  }

  const uniqueRegionIds = hasUniqueIds(input.pixels.requiredRegionIds);
  if (input.pixels.requiredRegionIds.length === 0) {
    failures.push('required-region-missing');
  }
  for (const id of input.pixels.requiredRegionIds) {
    const region = input.pixels.regions[id];
    if (
      !uniqueRegionIds ||
      !region ||
      !isNonNegativeFiniteNumber(region.diffPct) ||
      !isNonNegativeFiniteNumber(region.maxDiffPct) ||
      !Array.isArray(region.failures)
    ) {
      failures.push('required-region-missing');
      continue;
    }
    if (region.diffPct > region.maxDiffPct || region.failures.length > 0) {
      failures.push('required-region-failed');
    }
  }

  const visibility = input.visibility;
  if (!visibility?.figma || !visibility.generated) {
    failures.push('visibility-receipt-missing');
  } else if (visibility.figma.probative !== true || visibility.generated.probative !== true) {
    failures.push('visibility-receipt-failed');
  }

  if (!input.geometry) {
    failures.push('geometry-receipt-missing');
  } else if (input.geometry.verdict !== 'pass' && input.geometry.verdict !== 'justified') {
    failures.push('geometry-receipt-failed');
  }

  const semanticReceipts = new Map<string, Array<Pick<SemanticReceipt, 'id' | 'verdict'>>>();
  for (const receipt of input.semantics) {
    const receipts = semanticReceipts.get(receipt.id) ?? [];
    receipts.push(receipt);
    semanticReceipts.set(receipt.id, receipts);
  }
  const uniqueSemanticIds = hasUniqueIds(input.requiredSemanticAssertionIds);
  for (const id of input.requiredSemanticAssertionIds) {
    const receipts = semanticReceipts.get(id);
    if (!uniqueSemanticIds || !receipts || receipts.length !== 1) {
      failures.push('semantic-receipt-missing');
    } else if (receipts[0].verdict !== 'pass') {
      failures.push('semantic-receipt-failed');
    }
  }

  return {
    ...score,
    passed: failures.length === 0,
    verdict: failures.length === 0 ? 'pass' : 'fail',
    failures,
  };
}
