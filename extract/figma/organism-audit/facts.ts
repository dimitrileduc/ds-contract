/**
 * Fact-level reasoning for the organism audit (013): the chain
 *
 *   pinned Figma fact → contract id/version/JSON Pointer → generated React fact
 *
 * and the two places where that chain is most easily faked.
 *
 * A screenshot cannot see a prop that is exposed but never projected — the
 * component renders its hard-coded literal and looks perfect.  And a pixel
 * comparison is trivially winnable by putting the reference bytes on screen
 * through a back door.  Both are refused here, by construction.
 *
 * Pure module: no Chromium, no Figma call, no filesystem.
 *
 * Reference: research.md D1 (contract at the centre), D6 (coverage is the union
 * of Figma + contract + projection), D10 (images are comparison fixtures, never
 * defaults); contracts/audit-campaign.interface.md (Case/Fact declaration).
 */
import type { FactOutcome, LocalizedSource } from './verdict.js';

// ---------------------------------------------------------------------------
// Coverage
// ---------------------------------------------------------------------------

export interface CoverageDelta {
  expected: string[];
  observed: string[];
  missing: string[];
  unexpected: string[];
}

/** Exact set delta — `missing` and `unexpected` must both be empty to be positive. */
export function computeCoverageDelta(
  expected: readonly string[],
  observed: readonly string[],
): CoverageDelta {
  const expectedSet = new Set(expected);
  const observedSet = new Set(observed);
  return {
    expected: [...expectedSet].sort(),
    observed: [...observedSet].sort(),
    missing: [...expectedSet].filter((id) => !observedSet.has(id)).sort(),
    unexpected: [...observedSet].filter((id) => !expectedSet.has(id)).sort(),
  };
}

/**
 * Resolve a contract JSON Pointer (RFC 6901).  An unresolvable pointer is a
 * typed absence — never silently treated as an empty-but-conforming value.
 */
export function resolveContractPointer(
  contract: unknown,
  jsonPointer: string,
): { ok: true; value: unknown } | { ok: false; reason: string } {
  if (jsonPointer === '') return { ok: true, value: contract };
  if (!jsonPointer.startsWith('/')) {
    return { ok: false, reason: `pointer-not-rooted:${jsonPointer}` };
  }
  let cursor: unknown = contract;
  for (const rawToken of jsonPointer.slice(1).split('/')) {
    const token = rawToken.replace(/~1/g, '/').replace(/~0/g, '~');
    if (Array.isArray(cursor)) {
      const index = Number(token);
      if (!Number.isInteger(index) || index < 0 || index >= cursor.length) {
        return { ok: false, reason: `pointer-index-out-of-range:${jsonPointer}` };
      }
      cursor = cursor[index];
      continue;
    }
    if (typeof cursor === 'object' && cursor !== null && token in (cursor as object)) {
      cursor = (cursor as Record<string, unknown>)[token];
      continue;
    }
    return { ok: false, reason: `pointer-unresolved:${jsonPointer}` };
  }
  return { ok: true, value: cursor };
}

// ---------------------------------------------------------------------------
// Prop projection
// ---------------------------------------------------------------------------

export interface PropProjectionInput {
  /** A value no generated default can accidentally equal. */
  probeValue: string;
  /** What the DOM actually rendered; `null` when nothing was observed. */
  observedDomValue: string | null;
  interfaceExposesProp: boolean;
  /** `"NONE"` means the contract declares no Figma binding for this channel. */
  figmaBindingKind?: string;
  bindingJustified?: boolean;
}

export interface PropProjectionResult {
  outcome: FactOutcome;
  localizedSource: LocalizedSource | null;
  reasons: string[];
}

/**
 * Decide whether a declared prop actually reaches the rendered output.
 *
 * The defect this exists to catch is live in the repository: `Presentation`
 * exposes `titre`, destructures it with a default, and then passes a hard-coded
 * literal to its `SectionHeader` child.  A TypeScript interface is a
 * declaration, not an observation — so interface-only evidence can never be a
 * pass, and neither can a screenshot of the defaults.
 */
export function evaluatePropProjection(input: PropProjectionInput): PropProjectionResult {
  const { probeValue, observedDomValue, interfaceExposesProp } = input;
  const bindingIsNone = input.figmaBindingKind === 'NONE';
  const bindingJustified = input.bindingJustified === true;

  // A declared projection whose prop the component never exposes is an
  // established defect of the generated surface, not an untested unknown.
  if (!interfaceExposesProp) {
    return {
      outcome: 'divergent',
      localizedSource: 'generated',
      reasons: ['prop-not-exposed-by-interface'],
    };
  }

  if (observedDomValue === null) {
    return {
      outcome: 'not-proven',
      localizedSource: null,
      reasons: ['no-dom-observation:interface-declaration-is-not-evidence'],
    };
  }
  if (observedDomValue === '') {
    return {
      outcome: 'not-proven',
      localizedSource: null,
      reasons: ['observed-value-empty'],
    };
  }

  // The probe was driven through the prop and something else came out: the
  // child is still receiving its literal.
  if (observedDomValue !== probeValue) {
    return {
      outcome: 'divergent',
      localizedSource: 'generated',
      reasons: ['probe-not-projected:child-renders-a-literal'],
    };
  }

  // The projection works.  A `NONE` Figma binding that nothing justifies is an
  // unproven claim about the canvas side, never a conformance by default.
  if (bindingIsNone && !bindingJustified) {
    return {
      outcome: 'not-proven',
      localizedSource: null,
      reasons: ['figma-binding-none-unjustified:no-anatomy-sample-or-occurrence-cited'],
    };
  }

  return { outcome: 'proved', localizedSource: null, reasons: [] };
}

// ---------------------------------------------------------------------------
// Image facts (D10)
// ---------------------------------------------------------------------------

export type ImageInjectionKind =
  | 'declared-prop-path'
  | 'campaign-css'
  | 'placeholder'
  | 'runtime-default'
  | 'empty-div';

export interface ImageInjectionInput {
  /** The comparison prop path the case declared, e.g. `codeProps.imageUrl`. */
  propPath: string | null;
  value: unknown;
  assetManifest: unknown;
  injectionKind: ImageInjectionKind;
}

export interface ImageInjectionResult {
  ok: boolean;
  assetId: string | null;
  /** `null` only when admitted: the comparison, not this layer, settles the fact. */
  outcome: FactOutcome | null;
  reasons: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const refuse = (...reasons: string[]): ImageInjectionResult => ({
  ok: false,
  assetId: null,
  // A refusal settles the fact rather than leaving it null for the runner to
  // fill in — an undecided image fact is exactly where a false green grows.
  outcome: 'not-proven',
  reasons,
});

/**
 * Admit IMAGE bytes into a comparison only through a declared prop path.
 *
 * Campaign CSS, a placeholder, a runtime default and an empty tinted box all
 * make the generated screenshot *resemble* the reference while proving nothing
 * about the shipping library, because none of them travels the path a real
 * consumer would use.  Each is refused here even when the asset reference
 * itself is perfectly valid.
 *
 * This bites `hero`, `coordonnees` and `sav`, whose Figma sources carry IMAGE
 * paints with no contractual or React projection at all — `SAV.tsx` renders an
 * empty `<div className={styles.img}>`.  Those facts stay unproven; the runner
 * never makes them look right.
 */
export function resolveImageInjection(input: ImageInjectionInput): ImageInjectionResult {
  const { propPath, value, assetManifest, injectionKind } = input;

  if (injectionKind !== 'declared-prop-path') {
    return refuse(`image-injection-route-refused:${injectionKind}`);
  }
  if (typeof propPath !== 'string' || propPath.trim() === '') {
    return refuse('image-injection-without-declared-prop-path');
  }
  if (!isRecord(value)) {
    return refuse(
      value === undefined
        ? 'image-prop-path-carries-nothing'
        : `image-value-is-not-an-asset-reference:${typeof value}`,
    );
  }

  const keys = Object.keys(value);
  if (!keys.includes('$asset')) return refuse('image-value-has-no-$asset-reference');
  // A sibling key alongside `$asset` is an escape hatch (a raw url smuggled in
  // next to the declared reference), so the shape is exact, not merely present.
  if (keys.length !== 1) {
    return refuse(`image-asset-reference-carries-sibling-keys:${keys.filter((k) => k !== '$asset').join('+')}`);
  }
  const assetId = value.$asset;
  if (typeof assetId !== 'string' || assetId.trim() === '') {
    return refuse('image-asset-id-not-a-non-empty-string');
  }

  const assets =
    isRecord(assetManifest) && Array.isArray(assetManifest.assets) ? assetManifest.assets : null;
  if (assets === null) return refuse('image-asset-manifest-unreadable');

  const entry = assets.filter(isRecord).find((candidate) => candidate.id === assetId);
  if (entry === undefined) return refuse(`image-asset-absent-from-manifest:${assetId}`);
  // Provenance is the point of the manifest: an unhashed entry cannot pin the
  // bytes that were compared.
  if (typeof entry.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(entry.sha256)) {
    return refuse(`image-asset-not-hashed-in-manifest:${assetId}`);
  }

  return { ok: true, assetId, outcome: null, reasons: [] };
}
