import { isObject as object, sha256Of, stableJson, walkStructural as walk, type JsonRecord as Json } from './json.js';
import type { ProtectedFact } from './types.js';

const digest = (value: unknown): string => sha256Of(stableJson(value));

function paints(entry: Json): Array<{ field: string; index: number; paint: Json }> {
  const rows: Array<{ field: string; index: number; paint: Json }> = [];
  for (const field of ['fills', 'backgrounds', 'strokes']) {
    const value = entry[field];
    if (!Array.isArray(value)) continue;
    value.forEach((paint, index) => { if (object(paint)) rows.push({ field, index, paint }); });
  }
  return rows;
}

export interface SurfaceFacts {
  schemaVersion: '1.0.0';
  root: { id: unknown; type: unknown; name: unknown; componentId: unknown };
  variants: Array<{ id: unknown; name: unknown }>;
  imagePaints: unknown[];
  videoPaints: unknown[];
  gradientPaints: unknown[];
  textContent: unknown[];
  textRanges: unknown[];
  textStyles: unknown[];
  instanceLinks: unknown[];
  instanceOverrides: unknown[];
  geometry: unknown[];
  responsiveOverflow: unknown[];
  digests: Record<ProtectedFact, string>;
}

/** Extract the exact channels that Hero/HeroVideo showed can regress while a
 * broad "component amended" report remains green. */
export function collectSurfaceFacts(node: Json): SurfaceFacts {
  const imagePaints: unknown[] = [];
  const videoPaints: unknown[] = [];
  const gradientPaints: unknown[] = [];
  const textContent: unknown[] = [];
  const textRanges: unknown[] = [];
  const textStyles: unknown[] = [];
  const instanceLinks: unknown[] = [];
  const instanceOverrides: unknown[] = [];
  const geometry: unknown[] = [];
  const responsiveOverflow: unknown[] = [];
  const rootBox = object(node.absoluteBoundingBox) ? node.absoluteBoundingBox : null;

  walk(node, (entry, structuralPath) => {
    for (const { field, index, paint } of paints(entry)) {
      const address = { structuralPath, field, index };
      if (paint.type === 'IMAGE') imagePaints.push({ ...address, paint });
      else if (paint.type === 'VIDEO') videoPaints.push({ ...address, paint });
      else if (typeof paint.type === 'string' && paint.type.startsWith('GRADIENT_')) gradientPaints.push({ ...address, paint });
    }
    if (entry.type === 'TEXT') {
      textContent.push({ structuralPath, characters: entry.characters ?? '' });
      textRanges.push({
        structuralPath,
        characterStyleOverrides: entry.characterStyleOverrides ?? [],
        styleOverrideTable: entry.styleOverrideTable ?? {},
      });
      const style = object(entry.style) ? entry.style : {};
      const styles = object(entry.styles) ? entry.styles : {};
      textStyles.push({
        structuralPath,
        textStyleId: styles.text ?? entry.textStyleId ?? null,
        fontFamily: style.fontFamily ?? null,
        fontPostScriptName: style.fontPostScriptName ?? null,
        fontWeight: style.fontWeight ?? null,
        fontSize: style.fontSize ?? null,
        lineHeightPx: style.lineHeightPx ?? null,
        letterSpacing: style.letterSpacing ?? null,
        textAlignHorizontal: style.textAlignHorizontal ?? null,
      });
    }
    if (entry.type === 'INSTANCE') {
      // Descendant instance ids may be regenerated inside an amended master.
      // The stable semantic link is its structural address + main component;
      // the Page/root identity is protected separately.
      instanceLinks.push({ structuralPath, componentId: entry.componentId ?? null });
      instanceOverrides.push({
        structuralPath,
        componentProperties: entry.componentProperties ?? {},
        overrides: entry.overrides ?? [],
      });
    }
    const box = object(entry.absoluteBoundingBox) ? entry.absoluteBoundingBox : null;
    geometry.push({
      structuralPath,
      id: entry.id ?? null,
      type: entry.type ?? null,
      x: box?.x ?? null,
      y: box?.y ?? null,
      width: box?.width ?? null,
      height: box?.height ?? null,
      layoutMode: entry.layoutMode ?? null,
      layoutSizingHorizontal: entry.layoutSizingHorizontal ?? null,
      layoutSizingVertical: entry.layoutSizingVertical ?? null,
      clipsContent: entry.clipsContent ?? null,
    });
    if (rootBox && box && typeof rootBox.x === 'number' && typeof rootBox.y === 'number' && typeof rootBox.width === 'number' && typeof rootBox.height === 'number' &&
      typeof box.x === 'number' && typeof box.y === 'number' && typeof box.width === 'number' && typeof box.height === 'number') {
      const overflow = {
        left: box.x < rootBox.x,
        top: box.y < rootBox.y,
        right: box.x + box.width > rootBox.x + rootBox.width,
        bottom: box.y + box.height > rootBox.y + rootBox.height,
      };
      if (overflow.left || overflow.top || overflow.right || overflow.bottom) responsiveOverflow.push({ structuralPath, overflow });
    }
  });

  const variants = node.type === 'COMPONENT_SET' && Array.isArray(node.children)
    ? node.children.filter((child) => object(child) && child.type === 'COMPONENT').map((child) => ({ id: (child as Json).id ?? null, name: (child as Json).name ?? null }))
    : [];
  const values: Record<ProtectedFact, unknown> = {
    'master-identity': { id: node.id ?? null, type: node.type ?? null, componentId: node.componentId ?? null },
    'variant-cardinality': variants.length,
    'variant-names': variants.map((variant) => variant.name),
    'image-paints': imagePaints,
    'video-paints': videoPaints,
    'gradient-paints': gradientPaints,
    'text-content': textContent,
    'text-ranges': textRanges,
    'text-styles': textStyles,
    'instance-links': instanceLinks,
    'instance-overrides': instanceOverrides,
    'page-node-identity': { id: node.id ?? null, type: node.type ?? null, componentId: node.componentId ?? null },
    geometry,
    'responsive-overflow': responsiveOverflow,
  };
  const digests = Object.fromEntries(Object.entries(values).map(([fact, value]) => [fact, digest(value)])) as Record<ProtectedFact, string>;
  return {
    schemaVersion: '1.0.0',
    root: { id: node.id ?? null, type: node.type ?? null, name: node.name ?? null, componentId: node.componentId ?? null },
    variants,
    imagePaints,
    videoPaints,
    gradientPaints,
    textContent,
    textRanges,
    textStyles,
    instanceLinks,
    instanceOverrides,
    geometry,
    responsiveOverflow,
    digests,
  };
}

export interface ProtectedFactDifference {
  fact: ProtectedFact;
  before: string;
  after: string;
}

export function compareProtectedFacts(
  before: SurfaceFacts,
  after: SurfaceFacts,
  protectedFacts: readonly string[],
): ProtectedFactDifference[] {
  return protectedFacts.flatMap((fact) => {
    const typed = fact as ProtectedFact;
    const left = before.digests[typed];
    const right = after.digests[typed];
    return left === right ? [] : [{ fact: typed, before: left ?? '(missing)', after: right ?? '(missing)' }];
  });
}
