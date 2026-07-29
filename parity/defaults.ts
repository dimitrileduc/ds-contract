/**
 * Default-value projections shared by the local three-way parity reader.
 *
 * Rich text is structured in React so marks survive generation, while Figma
 * owns one native TEXT value.  These functions make that representation
 * boundary explicit instead of relying on Array#toString().
 */

export interface RichTextSegment {
  text: string;
  strong?: boolean;
}

export type ExtractedDefault = string | boolean | number | RichTextSegment[];

export function normalizeRichTextDefault(value: unknown): RichTextSegment[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const segments: RichTextSegment[] = [];
  for (const segment of value) {
    if (!segment || typeof segment !== 'object' || typeof segment.text !== 'string') return undefined;
    if ('strong' in segment && typeof segment.strong !== 'boolean') return undefined;
    segments.push(segment.strong ? { text: segment.text, strong: true } : { text: segment.text });
  }
  return segments;
}

/** Structural code defaults preserve marks; compare the normalized shape. */
export function richTextDefaultsEqual(left: unknown, right: unknown): boolean {
  const normalizedLeft = normalizeRichTextDefault(left);
  const normalizedRight = normalizeRichTextDefault(right);
  return normalizedLeft !== undefined
    && normalizedRight !== undefined
    && JSON.stringify(normalizedLeft) === JSON.stringify(normalizedRight);
}

/** Native Figma TEXT has no marked ranges, so its honest projection is text. */
export function richTextDefaultText(value: unknown): string | undefined {
  return normalizeRichTextDefault(value)?.map((segment) => segment.text).join('');
}
