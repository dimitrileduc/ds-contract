/**
 * The geometry gate's fail-closed policy (015, FR-001; decision D7;
 * contracts/geometry-gate.interface.md).
 *
 * Pure, side-effect-free — no fs, no fetch, no Chromium — so `npm run
 * geometry:gate` and the eval fixture exercise the IDENTICAL policy. Same
 * form as `extract/figma/measure-gate/gate.ts` (prior art, D7): a typed
 * input, a typed refusal vocabulary, a pure evaluator that recomputes from
 * raw facts rather than trusting a producer's own verdict.
 *
 * SC-001 reads `counts.invisible === 0` and `verdict === 'pass'` here.
 *
 * What this module deliberately does NOT decide: `blocked` (exit 2) is an
 * I/O-level verdict and belongs to `run.ts` — a pure function that never
 * touches a filesystem cannot itself observe "the registry is unreadable".
 */

/** contracts/geometry-gate.interface.md §2 — the closed set of geometric
 *  (layout) channels this gate governs. Paint (color, background-color,
 *  border-color), trait (border-width, border-radius) and typography
 *  (font-*, line-height, letter-spacing) channels are OUT OF POPULATION —
 *  widening this set is a versioned evolution of the interface, never a
 *  silent adjustment. `background-image` enters only as the declared
 *  exception for gradients (D5) — a literal on it is still a NAMED
 *  exception, never an invisible one. */
export const GEOMETRIC_CHANNELS = new Set([
  'width',
  'height',
  'min-width',
  'min-height',
  'gap',
  'padding-block',
  'padding-inline',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'background-image',
]);

export type GeometryGateRefusalCode =
  | 'invisible-literal'
  | 'registry-value-mismatch'
  | 'registry-entry-orphaned'
  | 'registry-entry-undocumented';

export interface GeometryGateRefusal {
  code: GeometryGateRefusalCode;
  /** "<contractId><pointer>" — never anonymous (I-6.2 discipline, carried
   *  over from measure-gate). */
  subject: string;
  message: string;
}

/** One `literals`/`literalsByProp` site, as `inventoryLiterals` (prior art
 *  013, `extract/figma/organism-audit/baseline.ts`) already produces it. */
export interface LiteralSite {
  contractId: string;
  /** RFC 6901 JSON Pointer, e.g. "/anatomy/root/literals/width". The
   *  channel is the pointer's own last (unescaped) segment — never a
   *  separately-carried field, so it cannot drift from what the contract
   *  itself says. */
  pointer: string;
  value: string;
}

/** One `tokens`/`tokensByProp` site, same source as `LiteralSite`. */
export interface TokenBindingSite {
  contractId: string;
  pointer: string;
  token: string;
}

/** `contracts/named-literals.registry.json` § entries (schema.md). */
export interface NamedLiteralRegistryEntry {
  contractId: string;
  pointer: string;
  channel: string;
  value: string;
  reason?: string | null;
  decidedOn?: string | null;
  receiptId?: string | null;
}

export interface GeometryGateInput {
  /** Every id in `contracts/*.contract.json` — counted live, never
   *  hardcoded. */
  contractIds: string[];
  literalEntries: LiteralSite[];
  tokenBindingEntries: TokenBindingSite[];
  registryEntries: NamedLiteralRegistryEntry[];
}

export type GeometryGateVerdict = 'pass' | 'fail';

export interface GeometryGateCounts {
  contracts: number;
  /** Total geometric LITERAL sites — the population SC-001 governs (named +
   *  invisible + mismatched; token-bound references are `governedRefs`,
   *  counted separately, informational). */
  geometricEntries: number;
  /** Geometric channels carried by a token reference — conforme by
   *  construction (information only, not part of `geometricEntries`). */
  governedRefs: number;
  /** Geometric literals with a byte-identical registry match. */
  namedLiterals: number;
  /** SC-001: must be 0 at closure. */
  invisible: number;
  byContract: Record<string, number>;
  byChannel: Record<string, number>;
}

export interface GeometryGateResult {
  schemaVersion: 1;
  verdict: GeometryGateVerdict;
  counts: GeometryGateCounts;
  /** Never anonymous (I-6.2). */
  refusals: GeometryGateRefusal[];
}

/** RFC 6901 unescaping of one already-split path segment (`~1` -> `/`,
 *  `~0` -> `~`) — the pointer's last segment IS the channel, so this is the
 *  only extraction geometry-gate ever performs. */
const channelOf = (pointer: string): string => {
  const last = pointer.slice(pointer.lastIndexOf('/') + 1);
  return last.replace(/~1/g, '/').replace(/~0/g, '~');
};

const siteKey = (contractId: string, pointer: string): string => `${contractId}${pointer}`;

export function evaluateGeometryGate(input: GeometryGateInput): GeometryGateResult {
  const refusals: GeometryGateRefusal[] = [];
  const refuse = (code: GeometryGateRefusalCode, subject: string, message: string): void => {
    refusals.push({ code, subject, message });
  };

  const byContract: Record<string, number> = {};
  const byChannel: Record<string, number> = {};
  const bump = (map: Record<string, number>, key: string): void => {
    map[key] = (map[key] ?? 0) + 1;
  };

  // ---- population: geometric literals only (§2) --------------------------
  const geometricLiterals = input.literalEntries.filter((e) => GEOMETRIC_CHANNELS.has(channelOf(e.pointer)));

  const registryBySite = new Map<string, NamedLiteralRegistryEntry>();
  for (const e of input.registryEntries) registryBySite.set(siteKey(e.contractId, e.pointer), e);

  let namedLiterals = 0;
  let invisible = 0;

  for (const lit of geometricLiterals) {
    const subject = siteKey(lit.contractId, lit.pointer);
    const channel = channelOf(lit.pointer);
    const registryEntry = registryBySite.get(subject);

    if (!registryEntry) {
      refuse('invisible-literal', subject, `"${subject}" (channel "${channel}") carries a geometric literal with no matching entry in the named-literals registry`);
      invisible += 1;
      bump(byContract, lit.contractId);
      bump(byChannel, channel);
      continue;
    }

    if (registryEntry.value !== lit.value) {
      refuse(
        'registry-value-mismatch',
        subject,
        `"${subject}" — registry pins "${registryEntry.value}" but the contract carries "${lit.value}"`,
      );
      continue;
    }

    namedLiterals += 1;
  }

  // ---- registry-level checks — independent of whether a matching literal
  // exists right now (an entry can be orphaned or undocumented on its own).
  for (const entry of input.registryEntries) {
    const subject = siteKey(entry.contractId, entry.pointer);
    const resolves = input.literalEntries.some((e) => e.contractId === entry.contractId && e.pointer === entry.pointer);
    if (!resolves) {
      refuse('registry-entry-orphaned', subject, `"${subject}" — the registry entry's pointer resolves no literal in the contract`);
    }
    const missing = (['reason', 'decidedOn', 'receiptId'] as const).filter((field) => !entry[field]);
    if (missing.length > 0) {
      refuse(
        'registry-entry-undocumented',
        subject,
        `"${subject}" — missing required field(s): ${missing.join(', ')}`,
      );
    }
  }

  // ---- governedRefs — geometric channels carried by a token reference,
  // informational, never mixed into geometricEntries/invisible. ------------
  const governedRefs = input.tokenBindingEntries.filter((e) => GEOMETRIC_CHANNELS.has(channelOf(e.pointer))).length;

  const verdict: GeometryGateVerdict = refusals.length === 0 ? 'pass' : 'fail';

  return {
    schemaVersion: 1,
    verdict,
    counts: {
      contracts: input.contractIds.length,
      geometricEntries: geometricLiterals.length,
      governedRefs,
      namedLiterals,
      invisible,
      byContract,
      byChannel,
    },
    refusals,
  };
}
