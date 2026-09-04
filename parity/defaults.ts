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
  /** v19 : la seconde marque bornée. Lue et COMPARÉE comme `strong` — sans quoi
   *  l'axe code laisserait passer une décoration ajoutée d'un côté seulement
   *  (ajouté le 2026-09-04 avec le portage de la marque aux émetteurs). */
  underline?: boolean;
}

export type ExtractedDefault = string | boolean | number | RichTextSegment[];

export function normalizeRichTextDefault(value: unknown): RichTextSegment[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const segments: RichTextSegment[] = [];
  for (const segment of value) {
    if (!segment || typeof segment !== 'object' || typeof segment.text !== 'string') return undefined;
    if ('strong' in segment && typeof segment.strong !== 'boolean') return undefined;
    if ('underline' in segment && typeof segment.underline !== 'boolean') return undefined;
    const normalized: RichTextSegment = { text: segment.text };
    if (segment.strong) normalized.strong = true;
    if (segment.underline) normalized.underline = true;
    segments.push(normalized);
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
