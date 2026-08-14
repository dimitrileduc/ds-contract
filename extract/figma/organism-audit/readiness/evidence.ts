import { canonicalize, sha256Of } from '../../projection-repair/json.js';

/** Locale-independent ordering for byte-stable proof material. */
export function compareStableText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

/** Byte-reproducible proof material in the evidence format (2-space indent +
 * trailing newline). The canonical key ordering itself has ONE definition —
 * extract/figma/projection-repair/json.ts — and its code-unit sort is the
 * same ordering `compareStableText` spells; two spellings of "canonical"
 * would silently produce two digest families. */
export function stableJson(value: unknown): string {
  return `${JSON.stringify(canonicalize(value), null, 2)}\n`;
}

export const sha256 = sha256Of;

export type EvidenceAvailability = 'available' | 'missing' | 'refused' | 'unrecoverable';
export const EVIDENCE_AVAILABILITY: readonly EvidenceAvailability[] = [
  'available', 'missing', 'refused', 'unrecoverable',
] as const;

export function evidenceCanSupportReference(availability: EvidenceAvailability): boolean {
  return availability === 'available';
}

export function unavailableEvidenceReason(availability: EvidenceAvailability, reason: string): string {
  if (evidenceCanSupportReference(availability)) throw new Error('available evidence cannot carry an unavailable reason');
  if (reason.trim() === '') throw new Error(`unavailable evidence (${availability}) must name its reason`);
  return `${availability}:${reason.trim()}`;
}
