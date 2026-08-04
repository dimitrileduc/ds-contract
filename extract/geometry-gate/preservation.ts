/**
 * Preservation control for 013's hand-set corrections (015, D10, FR-009).
 *
 * Pure, side-effect-free — resolves each correction's CURRENT EFFECTIVE
 * value (a literal still in place, OR migrated to a token reference at the
 * MIRRORED /literals/ -> /tokens/ pointer, the exact discipline T057 uses:
 * "déplacer la valeur ET le contractPointer du fait ensemble") and refuses
 * BY NAME any entry whose resolved value changed. A pure conversion that
 * moves the value+pointer together while the resolved number stays
 * identical is `converted-preserved`, never flagged — only a genuine
 * change (a different value, or the fact dropped entirely) is `clobbered`.
 *
 * Reuses `TokenResolver`/`TokenResolution` (extract/figma/organism-audit/
 * facts.ts, already exercised by organism-audit-token-resolution-check) —
 * never a second token resolver.
 */
import type { TokenResolution, TokenResolver } from '../figma/organism-audit/facts.js';

export interface CorrectionEntry {
  contractId: string;
  pointer: string;
  channel: string;
  expectedResolvedPx: string;
  setBy: string;
}

export type PreservationState = 'preserved' | 'converted-preserved' | 'clobbered';

export interface PreservationFinding {
  contractId: string;
  pointer: string;
  channel: string;
  state: PreservationState;
  /** Where the value was actually found — the original pointer for a
   *  preserved literal, the mirrored /tokens/ pointer for a pure
   *  conversion, `null` when the fact resolves nowhere at all. */
  resolvedAtPointer: string | null;
  actualValue: string | null;
  message: string;
}

export interface PreservationInput {
  corrections: CorrectionEntry[];
  /** Same shape as `inventoryLiterals(...).literalInventory` (prior art 013). */
  literalEntries: Array<{ contractId: string; pointer: string; value: string }>;
  /** Same shape as `inventoryLiterals(...).tokenBindingInventory`. */
  tokenBindingEntries: Array<{ contractId: string; pointer: string; token: string }>;
  resolveToken: TokenResolver;
}

const siteKey = (contractId: string, pointer: string): string => `${contractId}${pointer}`;
const mirrorToTokenPointer = (literalPointer: string): string => literalPointer.replace('/literals/', '/tokens/');

export function checkPreservation(input: PreservationInput): PreservationFinding[] {
  const literalBySite = new Map(input.literalEntries.map((e) => [siteKey(e.contractId, e.pointer), e.value]));
  const tokenBySite = new Map(input.tokenBindingEntries.map((e) => [siteKey(e.contractId, e.pointer), e.token]));

  return input.corrections.map((c): PreservationFinding => {
    const base = { contractId: c.contractId, pointer: c.pointer, channel: c.channel };

    const literalValue = literalBySite.get(siteKey(c.contractId, c.pointer));
    if (literalValue !== undefined) {
      return literalValue === c.expectedResolvedPx
        ? { ...base, state: 'preserved', resolvedAtPointer: c.pointer, actualValue: literalValue, message: `preserved as a literal, unchanged (${literalValue})` }
        : { ...base, state: 'clobbered', resolvedAtPointer: c.pointer, actualValue: literalValue, message: `expected ${c.expectedResolvedPx}, found literal ${literalValue}` };
    }

    // Not a literal anymore — check the MIRRORED token pointer: a pure
    // conversion moves value AND pointer together (D8).
    const tokenPointer = mirrorToTokenPointer(c.pointer);
    const tokenRef = tokenBySite.get(siteKey(c.contractId, tokenPointer));
    if (tokenRef !== undefined) {
      const resolved: TokenResolution = input.resolveToken(tokenRef);
      const resolvedValue = resolved.kind === 'resolved' ? String(resolved.value) : null;
      return resolvedValue === c.expectedResolvedPx
        ? { ...base, state: 'converted-preserved', resolvedAtPointer: tokenPointer, actualValue: resolvedValue, message: `converted to ${tokenRef} (resolves to ${resolvedValue}) — same value preserved` }
        : {
            ...base,
            state: 'clobbered',
            resolvedAtPointer: tokenPointer,
            actualValue: resolvedValue,
            message: `expected ${c.expectedResolvedPx}, found ${tokenRef} resolving to ${resolvedValue ?? `(${resolved.kind}: ${resolved.reason ?? 'unresolvable'})`}`,
          };
    }

    // Neither a literal at the original pointer nor a token at the mirrored
    // one — the fact was dropped entirely (T037 scenario 2).
    return {
      ...base,
      state: 'clobbered',
      resolvedAtPointer: null,
      actualValue: null,
      message: `expected ${c.expectedResolvedPx}, found NOTHING at ${c.pointer} or ${tokenPointer} — the correction was dropped`,
    };
  });
}
