import { createHash } from 'node:crypto';

/** Locale-independent ordering for byte-stable proof material. */
export function compareStableText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

/** JSON serialization with key ordering made explicit: proof IDs are byte reproducible. */
export function stableJson(value: unknown): string {
  const visit = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(visit);
    if (input !== null && typeof input === 'object') {
      return Object.fromEntries(
        Object.entries(input as Record<string, unknown>)
          .sort(([left], [right]) => compareStableText(left, right))
          .map(([key, child]) => [key, visit(child)]),
      );
    }
    return input;
  };
  return `${JSON.stringify(visit(value), null, 2)}\n`;
}

export function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

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
