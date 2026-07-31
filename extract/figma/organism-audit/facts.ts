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
import { flattenTokens } from '../../../core/tokens.js';

import type { FactOutcome, LocalizedSource } from './verdict.js';

// ---------------------------------------------------------------------------
// Contract pin
// ---------------------------------------------------------------------------

export interface ContractPinInput {
  subject: { id: string; contractId: string; contractVersion: string };
  contract: { id?: unknown; version?: unknown };
}

export interface ContractPinVerdict {
  ok: boolean;
  reasons: string[];
}

/**
 * The manifest DECLARES which contract version a dossier audits; only the file
 * on disk can confirm it.  When the two disagree the audit still runs — every
 * JSON Pointer resolves against the parsed contract — and the dossier is then
 * signed `ds.coordonnees@2.1.0` while having measured 2.2.0.  Nothing is red
 * and nothing is missing; the receipt is simply false, which is worse than a
 * refusal.
 *
 * The CLI catches this in `verifyAgainstDisk`, but the capture tools call
 * `auditOrganism` directly, so the check has to live where the contract bytes
 * are read.  Fail-closed: an absent or blank version is refused, never read as
 * "close enough".
 */
export function assertContractPinFresh(input: ContractPinInput): ContractPinVerdict {
  const { subject, contract } = input;
  const reasons: string[] = [];

  const onDiskId = typeof contract.id === 'string' ? contract.id : null;
  if (onDiskId !== subject.contractId) {
    reasons.push(
      `contract-id-drift:${subject.id}: manifest declares "${subject.contractId}", disk holds "${String(onDiskId)}"`,
    );
  }

  const onDiskVersion =
    typeof contract.version === 'string' && contract.version.trim() !== ''
      ? contract.version.trim()
      : null;
  if (onDiskVersion === null) {
    reasons.push(
      `contract-version-absent:${subject.contractId}: manifest pins v${subject.contractVersion}, disk carries no readable version`,
    );
  } else if (onDiskVersion !== subject.contractVersion) {
    reasons.push(
      `contract-version-drift:${subject.contractId}: manifest pins v${subject.contractVersion}, disk is at v${onDiskVersion} — re-pin the manifest and re-audit before publishing a dossier`,
    );
  }

  return { ok: reasons.length === 0, reasons };
}

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
// Token resolution
// ---------------------------------------------------------------------------

/**
 * A `{dot.path}` reference, and nothing that merely resembles one.
 *
 * Anchored end to end, one pair of braces, no whitespace: `"{"`, `"{}"`,
 * `"{a b}"`, `"texte {avec} accolades"` and `"{font.size.24} et autre"` are
 * plain strings, not tokens.
 */
const TOKEN_REFERENCE = /^\{([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*)\}$/;

export type TokenResolutionKind =
  | 'literal'
  | 'resolved'
  | 'unresolved'
  | 'cycle'
  | 'depth-exceeded';

export interface TokenResolution {
  kind: TokenResolutionKind;
  /** The reference that was followed — `null` for a plain literal. */
  reference: string | null;
  /** The resolved literal; the untouched input when `kind === 'literal'`. */
  value: unknown;
  hops: number;
  /** Named failure, `null` on success.  Never a silent pass-through. */
  reason: string | null;
}

export type TokenResolver = (value: unknown) => TokenResolution;

/** The reference a value carries, or `null` when it is a plain literal. */
export function tokenReferenceOf(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return TOKEN_REFERENCE.exec(value)?.[1] ?? null;
}

/**
 * Build a resolver over parsed DTCG trees (primitives + semantic + modes).
 *
 * Objects in, never paths: this module stays pure, and the caller that owns a
 * filesystem hands over what it read.  Aliases are followed — a token whose
 * `$value` is itself `{another.ref}` — under a hard depth bound, because a
 * cyclic token file must produce a NAMED error rather than wedge an audit.
 */
export function buildTokenResolver(
  trees: readonly unknown[],
  options: { maxAliasDepth?: number } = {},
): TokenResolver {
  const maxAliasDepth = options.maxAliasDepth ?? 8;
  const table = new Map<string, { value: unknown; type: string }>();
  for (const tree of trees) {
    if (isRecord(tree)) flattenTokens(tree, [], '', table);
  }

  return (value: unknown): TokenResolution => {
    const entry = tokenReferenceOf(value);
    if (entry === null) {
      return { kind: 'literal', reference: null, value, hops: 0, reason: null };
    }

    const chain: string[] = [];
    let reference = entry;
    let hops = 0;
    for (;;) {
      if (chain.includes(reference)) {
        return {
          kind: 'cycle',
          reference: entry,
          value: null,
          hops,
          reason: `token-alias-cycle:${[...chain, reference].map((r) => `{${r}}`).join('→')}`,
        };
      }
      chain.push(reference);
      hops += 1;

      const found = table.get(reference);
      if (found === undefined) {
        const path = chain.length > 1 ? chain.map((r) => `{${r}}`).join('→') : `{${reference}}`;
        return {
          kind: 'unresolved',
          reference: entry,
          value: null,
          hops,
          reason: `token-unresolved:${path}:absent-from-the-DTCG-source`,
        };
      }

      const next = tokenReferenceOf(found.value);
      if (next === null) {
        return { kind: 'resolved', reference: entry, value: found.value, hops, reason: null };
      }
      if (hops >= maxAliasDepth) {
        return {
          kind: 'depth-exceeded',
          reference: entry,
          value: null,
          hops,
          reason: `token-alias-depth-exceeded:{${entry}}:more-than-${maxAliasDepth}-hops`,
        };
      }
      reference = next;
    }
  };
}

/**
 * Is this contract JSON Pointer a TOKEN channel?
 *
 * `{ref}` means a token only inside a part's `tokens` map — the schema types it
 * that way (`tokens: z.record(z.string(), TokenRefSchema)`).  Everywhere else
 * the same syntax means something else entirely: `{titre}` under
 * `component/props` is a PROP reference, and resolving it as a token would
 * fabricate a divergence on facts that are correct today.
 *
 * A part may itself be NAMED `tokens` (`/anatomy/root/parts/tokens/…`); the
 * `parts` parent is what tells the two apart.
 *
 * Named limit: `tokensByProp` overrides are not a token channel here — no
 * declared fact points into one, and inventing a resolution rule for a shape
 * nothing exercises would be a claim without an eval behind it.
 */
export function isTokenChannelPointer(jsonPointer: string): boolean {
  const segments = jsonPointer.split('/');
  return segments.some(
    (segment, index) =>
      segment === 'tokens' && index < segments.length - 1 && segments[index - 1] !== 'parts',
  );
}

export interface FigmaExpectationInput {
  /** The Figma-side channel, for the reason strings. */
  channel: string;
  /** Where the contract leg was read — decides whether `{x}` is a token. */
  jsonPointer: string;
  /** Did the contract pointer resolve to something at all? */
  carried: boolean;
  contractValue: unknown;
  expectedValue: unknown;
  /** Absent ⇒ raw comparison only; a missing token source is never guessed at. */
  resolve?: TokenResolver | null;
}

export interface FigmaExpectationVerdict {
  agrees: boolean;
  reasons: string[];
  /** Receipt for a pass obtained BY RESOLUTION — never silent. */
  notes: string[];
}

const display = (resolution: TokenResolution): string =>
  resolution.reference === null
    ? JSON.stringify(resolution.value)
    : `{${resolution.reference}}→${JSON.stringify(resolution.value)}`;

/**
 * Compare the contract leg to the pinned Figma expectation.
 *
 * The comparison used to be a raw string equality, which counted a contract
 * binding `{font.size.24}` as DIVERGENT from a Figma expectation of `"24px"` —
 * penalising the governed path and pushing contract authors toward raw
 * literals, the exact opposite of the doctrine the audit enforces.
 *
 * Inside a token channel the comparison is therefore made on RESOLVED values.
 * It is fail-closed on both legs: a reference that cannot be resolved, or that
 * cycles, is a typed divergence NAMING the token — never a pass, not even when
 * both legs carry the same broken string, and never a silent fall-back to the
 * raw text.
 */
export function compareFigmaExpectation(input: FigmaExpectationInput): FigmaExpectationVerdict {
  const { channel, jsonPointer, carried, contractValue, expectedValue } = input;

  if (!carried) {
    return {
      agrees: false,
      reasons: [`contract-does-not-carry-figma-fact:${channel}=${JSON.stringify(expectedValue)}`],
      notes: [],
    };
  }

  const rawEqual = JSON.stringify(contractValue) === JSON.stringify(expectedValue);
  const rawDivergence = `contract-value-differs:${channel}:${JSON.stringify(contractValue)}!=${JSON.stringify(expectedValue)}`;

  const resolve = input.resolve ?? null;
  if (resolve === null || !isTokenChannelPointer(jsonPointer)) {
    // Outside a token channel — and with no token source at all — the pre-013
    // raw comparison stands, reason string included.
    return { agrees: rawEqual, reasons: rawEqual ? [] : [rawDivergence], notes: [] };
  }

  const contractSide = resolve(contractValue);
  const expectedSide = resolve(expectedValue);

  // Fail-closed FIRST, before any equality: two identical unresolvable
  // references agree on their text and on nothing else.
  const refusals: string[] = [];
  if (contractSide.kind !== 'literal' && contractSide.kind !== 'resolved') {
    refusals.push(`contract-token-unresolved:${channel}:${contractSide.reason}`);
  }
  if (expectedSide.kind !== 'literal' && expectedSide.kind !== 'resolved') {
    refusals.push(`figma-expectation-token-unresolved:${channel}:${expectedSide.reason}`);
  }
  if (refusals.length > 0) return { agrees: false, reasons: refusals, notes: [] };

  if (JSON.stringify(contractSide.value) !== JSON.stringify(expectedSide.value)) {
    return {
      agrees: false,
      reasons: [
        // The reference alone is unreadable in a report: cite what it resolved to.
        `contract-value-differs:${channel}:${display(contractSide)}!=${display(expectedSide)}`,
      ],
      notes: [],
    };
  }

  const resolved = contractSide.reference !== null || expectedSide.reference !== null;
  return {
    agrees: true,
    reasons: [],
    notes: resolved
      ? [`token-resolved:${channel}:${display(contractSide)}==${display(expectedSide)}`]
      : [],
  };
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
