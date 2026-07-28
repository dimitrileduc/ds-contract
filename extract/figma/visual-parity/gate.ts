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
import type { DiffResult } from './img.js';

export interface AuthoritativeScore {
  scorePct: number;
  basis: 'unmasked';
}

export function authoritativeScore(
  diff: Pick<DiffResult, 'unmaskedPct' | 'maskedPct' | 'maskCoveragePct'>,
): AuthoritativeScore {
  return {
    scorePct: diff.unmaskedPct,
    basis: 'unmasked',
  };
}
