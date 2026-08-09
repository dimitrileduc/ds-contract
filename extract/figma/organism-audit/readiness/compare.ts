export type Surface = 'figma' | 'contract' | 'render';
export interface SurfaceComparison { surface: Surface; referenceId: string; currentId: string; equal: boolean; differences: string[]; }

/** Comparisons are intentionally separate: agreement on one surface cannot erase drift on another. */
export function compareSurfaces(input: { reference: Record<Surface, unknown>; current: Record<Surface, unknown> }): SurfaceComparison[] {
  return (['figma', 'contract', 'render'] as const).map((surface) => {
    const expected = JSON.stringify(input.reference[surface]);
    const observed = JSON.stringify(input.current[surface]);
    return { surface, referenceId: expected, currentId: observed, equal: expected === observed, differences: expected === observed ? [] : [`${surface}-surface-differs`] };
  });
}
