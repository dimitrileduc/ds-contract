/**
 * The non-conversion receipt of the organism audit (D12).
 *
 * 013 audits fidelity; it is explicitly forbidden from *fixing* fidelity by
 * converting an inventoried hardcoded value into a token binding, and from
 * touching the token foundation at all.
 *
 * Proving that honestly needs more than prose and more than `git diff
 * contracts/`.  A textual diff cannot tell a forbidden literal→token conversion
 * apart from a legitimate local contract correction — both read as "one line
 * removed, one line added" — and forbidding every contract diff would outlaw the
 * bounded corrections the spec explicitly allows.  Only a diff typed over an
 * inventory of anatomy SITES can separate them:
 *
 *   a literal that disappears while a token binding appears at the SAME site
 *     -> literalToTokenConversions  (refused)
 *   a literal replaced by another literal, revalued, or newly added
 *     -> localContractCorrections   (allowed, still reported)
 *   any change under tokens/**
 *     -> tokenFoundationChanges     (refused)
 *
 * Pure module: it consumes already-read contracts and an already-computed
 * `tokens/**` fingerprint, so it never reads the filesystem itself.
 *
 * Reference: research.md D12, quickstart.md §3,
 * contracts/campaign-report.interface.md (Non-conversion receipt).
 */

export interface LiteralEntry {
  contractId: string;
  pointer: string;
  value: string;
}

export interface TokenBindingEntry {
  contractId: string;
  pointer: string;
  token: string;
}

export interface LiteralInventory {
  literalInventory: LiteralEntry[];
  tokenBindingInventory: TokenBindingEntry[];
}

/** A baseline is an inventory plus the token foundation it was taken against. */
export interface Baseline extends LiteralInventory {
  tokenFoundation: Record<string, string>;
}

export interface ConversionFinding {
  contractId: string;
  pointer: string;
  value: string;
  tokenPointer: string;
  token: string;
}

export interface FoundationFinding {
  path: string;
  change: 'changed' | 'added' | 'removed';
  before: string | null;
  after: string | null;
}

export interface CorrectionFinding {
  contractId: string;
  pointer: string;
  change: 'added' | 'removed' | 'revalued';
  before: string | null;
  after: string | null;
}

export interface BaselineDiff {
  literalToTokenConversions: ConversionFinding[];
  tokenFoundationChanges: FoundationFinding[];
  localContractCorrections: CorrectionFinding[];
}

const TOKEN_REFERENCE = /^\{[a-z0-9.-]+\}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** RFC 6901 escaping, so a `/` inside a CSS property name cannot break a pointer. */
const escapeToken = (token: string): string => token.replace(/~/g, '~0').replace(/\//g, '~1');

/** Stable site order. The receipts are COMMITTED, so the inventory and the diff
 *  must order identically — as two copies they could be tie-broken apart with
 *  nothing failing to show it. */
const bySite = <T extends { contractId: string; pointer: string }>(a: T, b: T): number =>
  a.contractId === b.contractId
    ? a.pointer.localeCompare(b.pointer)
    : a.contractId.localeCompare(b.contractId);

/**
 * Inventory the two protected surfaces of one contract set.
 *
 * Deliberately scoped: `declared` CSS is a third category and an `attrs`
 * `{prop}` reference is a prop binding, not a token binding.  Sweeping either in
 * would inflate the protected surface and make the receipt unfalsifiable.
 */
export function inventoryLiterals(contractsById: Record<string, unknown>): LiteralInventory {
  const literalInventory: LiteralEntry[] = [];
  const tokenBindingInventory: TokenBindingEntry[] = [];

  const walk = (contractId: string, node: unknown, pointer: string): void => {
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(contractId, item, `${pointer}/${index}`));
      return;
    }
    if (!isRecord(node)) return;

    for (const [key, value] of Object.entries(node)) {
      const here = `${pointer}/${escapeToken(key)}`;

      if (key === 'literals' && isRecord(value)) {
        for (const [property, literal] of Object.entries(value)) {
          if (typeof literal !== 'string') continue;
          literalInventory.push({
            contractId,
            pointer: `${here}/${escapeToken(property)}`,
            value: literal,
          });
        }
        continue;
      }

      if (key === 'tokens' && isRecord(value)) {
        for (const [property, token] of Object.entries(value)) {
          if (typeof token !== 'string' || !TOKEN_REFERENCE.test(token)) continue;
          tokenBindingInventory.push({
            contractId,
            pointer: `${here}/${escapeToken(property)}`,
            token,
          });
        }
        continue;
      }

      // `literalsByProp: [{ prop, map: { <value>: { <css>: <literal> } } }]`
      if (key === 'literalsByProp' && Array.isArray(value)) {
        value.forEach((rule, index) => {
          if (!isRecord(rule) || !isRecord(rule.map)) return;
          for (const [propValue, declarations] of Object.entries(rule.map)) {
            if (!isRecord(declarations)) continue;
            for (const [property, literal] of Object.entries(declarations)) {
              if (typeof literal !== 'string') continue;
              literalInventory.push({
                contractId,
                pointer: `${here}/${index}/map/${escapeToken(propValue)}/${escapeToken(property)}`,
                value: literal,
              });
            }
          }
        });
        continue;
      }

      // `declared` and `attrs` are out of scope by design — not recursed for
      // harvesting, though nested anatomy elsewhere still is.
      if (key === 'declared' || key === 'attrs') continue;

      walk(contractId, value, here);
    }
  };

  for (const contractId of Object.keys(contractsById).sort()) {
    walk(contractId, contractsById[contractId], '');
  }

  return {
    literalInventory: literalInventory.sort(bySite),
    tokenBindingInventory: tokenBindingInventory.sort(bySite),
  };
}

const siteKey = (entry: { contractId: string; pointer: string }): string =>
  `${entry.contractId}${entry.pointer}`;

/** The token pointer that would replace a given literal pointer at the same site. */
const mirroredTokenPointer = (literalPointer: string): string =>
  literalPointer.replace(/\/literals\//, '/tokens/');

/**
 * Produce the typed diff the receipt is checked with.
 *
 * The key move is the *site* comparison: a token binding only counts as a
 * conversion when a baseline literal previously occupied the mirrored site.  A
 * token appearing where nothing was inventoried converts nothing — and that
 * distinction is precisely the one a textual diff structurally cannot make.
 */
export function diffBaseline(before: Baseline, after: Baseline): BaselineDiff {
  const literalToTokenConversions: ConversionFinding[] = [];
  const localContractCorrections: CorrectionFinding[] = [];
  const tokenFoundationChanges: FoundationFinding[] = [];

  const beforeLiterals = new Map(before.literalInventory.map((entry) => [siteKey(entry), entry]));
  const afterLiterals = new Map(after.literalInventory.map((entry) => [siteKey(entry), entry]));
  const afterTokens = new Map(after.tokenBindingInventory.map((entry) => [siteKey(entry), entry]));

  for (const [site, entry] of beforeLiterals) {
    const stillLiteral = afterLiterals.get(site);
    if (stillLiteral !== undefined) {
      if (stillLiteral.value !== entry.value) {
        localContractCorrections.push({
          contractId: entry.contractId,
          pointer: entry.pointer,
          change: 'revalued',
          before: entry.value,
          after: stillLiteral.value,
        });
      }
      continue;
    }

    // The literal is gone. Did a token binding take its place at the same site?
    const tokenPointer = mirroredTokenPointer(entry.pointer);
    const token = afterTokens.get(`${entry.contractId}${tokenPointer}`);
    if (token !== undefined) {
      literalToTokenConversions.push({
        contractId: entry.contractId,
        pointer: entry.pointer,
        value: entry.value,
        tokenPointer,
        token: token.token,
      });
      continue;
    }
    localContractCorrections.push({
      contractId: entry.contractId,
      pointer: entry.pointer,
      change: 'removed',
      before: entry.value,
      after: null,
    });
  }

  for (const [site, entry] of afterLiterals) {
    if (beforeLiterals.has(site)) continue;
    localContractCorrections.push({
      contractId: entry.contractId,
      pointer: entry.pointer,
      change: 'added',
      before: null,
      after: entry.value,
    });
  }

  // `tokens/**` is not a source 013 may modify, in any direction.
  const paths = new Set([
    ...Object.keys(before.tokenFoundation ?? {}),
    ...Object.keys(after.tokenFoundation ?? {}),
  ]);
  for (const filePath of [...paths].sort()) {
    const previous = before.tokenFoundation?.[filePath] ?? null;
    const current = after.tokenFoundation?.[filePath] ?? null;
    if (previous === current) continue;
    tokenFoundationChanges.push({
      path: filePath,
      change: previous === null ? 'added' : current === null ? 'removed' : 'changed',
      before: previous,
      after: current,
    });
  }

  return {
    literalToTokenConversions: literalToTokenConversions.sort(bySite),
    tokenFoundationChanges,
    localContractCorrections: localContractCorrections.sort(bySite),
  };
}

/**
 * The check `proofs/baseline/hardcoded-values.json` is verified with: both
 * forbidden lists must be empty, and every refusal names its offender so the
 * finding can be routed to deferred work rather than argued about.
 */
export function verifyNonConversion(diff: BaselineDiff): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  for (const conversion of diff.literalToTokenConversions) {
    reasons.push(
      `literal-to-token-conversion:${conversion.contractId}${conversion.pointer}:${conversion.value}->${conversion.token}`,
    );
  }
  for (const change of diff.tokenFoundationChanges) {
    reasons.push(`token-foundation-${change.change}:${change.path}`);
  }
  return { ok: reasons.length === 0, reasons };
}
