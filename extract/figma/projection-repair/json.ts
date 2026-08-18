/**
 * Shared JSON primitives for campaign 021.
 *
 * These four helpers were written once per module across the subsystem, and
 * two of them are load-bearing beyond their size:
 *  - `stableJson` feeds every sha256 pinned into a campaign receipt, so two
 *    spellings of "canonical" silently produce two different digests;
 *  - `walkStructural` spells the structural path (`"0/1/2"`) that the whole
 *    identity model rests on — pairing is by POSITION, never by name, so a
 *    walker that spells the path differently makes before/after addresses
 *    stop matching with nothing to flag it.
 * One definition each is the point.
 */
import { createHash } from 'node:crypto';

export type JsonRecord = Record<string, unknown>;

export const isObject = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Canonical JSON retains identities and values while removing object-order noise. */
export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isObject(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

/** `indent` omitted reproduces `JSON.stringify(x)` exactly — digests do not move. */
export function stableJson(value: unknown, indent?: number): string {
  return JSON.stringify(canonicalize(value), null, indent);
}

export const sha256Of = (value: Uint8Array | string): string =>
  createHash('sha256').update(value).digest('hex');

/** Depth-first walk yielding each node with its structural path (`""`, `"0"`, `"0/1"`). */
export function walkStructural(
  node: unknown,
  visit: (entry: JsonRecord, path: string) => void,
  path = '',
): void {
  if (!isObject(node)) return;
  visit(node, path);
  if (Array.isArray(node.children)) {
    node.children.forEach((child, index) =>
      walkStructural(child, visit, path ? `${path}/${index}` : String(index)),
    );
  }
}
