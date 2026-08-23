/**
 * The layout→CSS vocabulary, in ONE place.
 *
 * The three CSS-producing emitters (`emit-react`, `emit-html`,
 * `emit-react-inline`) render the same `VariantLayout` grammar into three
 * shapes: a declaration list, a declaration list, and a style object. Only the
 * SHAPE differs — the field list and the values are one fact, and this module
 * is where that fact lives.
 *
 * Receipt (spec 023, E1): `columns` was added to `VariantLayout` and threaded
 * into the override path by hand-copying the field list into all three
 * emitters. Two of the three copies were missed on the first pass, so the enum
 * rendered without its track count on every non-React surface. The eval case
 * `columns-override-grid-only` pins the repair; this module removes the shape
 * of the bug — a new field is now added once, not three times.
 */

/** Flexbox `align-items` values, keyed by the contract's `align` enum. */
export const ALIGN_CSS: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

/** Flexbox `justify-content` values, keyed by the contract's `justify` enum. */
export const JUSTIFY_CSS: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
};

/** The grid track template for an N-column layout. Equal, zero-basis tracks:
 *  `minmax(0, 1fr)` rather than `1fr` so a wide child cannot blow the track. */
export const gridTracks = (columns: number) => `repeat(${columns}, minmax(0, 1fr))`;

/** The subset of a resolved layout that a layoutByProp override may re-declare. */
export interface LayoutOverride {
  display?: string;
  direction?: string;
  align?: string;
  justify?: string;
  width?: 'fill';
  columns?: number;
}

/** CSS property/value pairs for a layoutByProp override (v7), in emission
 *  order. Reversed directions are plain CSS here; the canvas resolves them by
 *  reversing child order instead.
 *
 *  This is the single field list. Adding a field to `VariantLayout` means
 *  adding one line HERE — every CSS surface picks it up. */
export function layoutOverridePairs(o: LayoutOverride): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  if (o.display) pairs.push(['display', o.display]);
  if (o.direction) pairs.push(['flex-direction', o.direction]);
  if (o.align) pairs.push(['align-items', ALIGN_CSS[o.align]]);
  if (o.justify) pairs.push(['justify-content', JUSTIFY_CSS[o.justify]]);
  if (o.width === 'fill') pairs.push(['width', '100%'], ['min-width', '0']);
  // v16 (spec 023, E1): a per-enum `columns` override re-emits the grid track
  // template under the enum class — the same shape the base layout emits.
  if (o.columns) pairs.push(['grid-template-columns', gridTracks(o.columns)]);
  return pairs;
}

/** The same pairs as `prop: value` declarations, for the two stylesheet
 *  emitters (`emit-react` CSS Modules, `emit-html` inline `<style>`). */
export const layoutOverrideDecls = (o: LayoutOverride): string[] =>
  layoutOverridePairs(o).map(([prop, value]) => `${prop}: ${value}`);
