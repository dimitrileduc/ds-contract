/**
 * The closure gate's fail-closed policy (014, FR-007, FR-011).
 *
 * Pure, side-effect-free — no fs, no fetch, no Chromium — so `npm run
 * measure:gate` and the eval fixture exercise the IDENTICAL policy. This is
 * the form already proven twice in the repo (`visual-parity/gate.ts`,
 * `organism-audit/campaign.ts` + `verdict.ts`): a typed input, a typed
 * refusal vocabulary, and a pure evaluator that recomputes from raw facts
 * rather than trusting a producer's own verdict.
 *
 * The four conditions of FR-007 (contracts/measure-gate.interface.md §3):
 *
 *   C1 — zero measured line, on EITHER instrument, diverges without a cause.
 *   C2 — every governed contract has a measured line, or a receipted
 *        impediment (never a silent absence, never an unproven claim).
 *   C3 — every organism-audit line's reference is the CASE node, on all
 *        five FR-001 derivations (reuses organism-audit/reference.ts's own
 *        pure check — the two are one vocabulary, not two).
 *   C4 — every published cause resolves a dated, re-tested receipt; a
 *        `not-retestable` receipt is an honest answer that still blocks.
 *
 * What this module deliberately does NOT decide: `blocked` (exit 2) is an
 * I/O-level verdict — "the artifacts themselves are unusable" (missing
 * file, invalid JSON, unknown schema version) — and belongs to `run.ts`,
 * the thin CLI that reads real files. A pure function that never touches a
 * filesystem cannot itself observe "the filesystem is unusable"; asking it
 * to would just move the same guess one layer down. `evaluateMeasureGate`
 * only ever returns `pass` or `fail`.
 */
import { checkReferenceProvenance, type ReferenceProvenance } from '../organism-audit/reference.js';

/** cause-vocabulary.md §1 — the six-value closed vocabulary, restated here
 *  rather than imported from `visual-parity/triage.ts`: this IS the contract
 *  the gate enforces, independent of any one instrument's own copy of it
 *  (triage-vocabulary-check.ts cross-checks triage.ts's copy already; this
 *  fixture cross-checks this one). Two independent copies of a closed,
 *  six-value, rarely-changing vocabulary is the cheap redundancy; importing
 *  triage.ts here would couple the gate to visual-parity's internals for no
 *  reason organism-audit lines would ever need. */
export const CANONICAL_CAUSE_SLUGS = [
  'contract-geometry',
  'image-boundary',
  'rendering',
  'engine',
  'instrument',
  'figma-source',
] as const;

export type CauseSlug = (typeof CANONICAL_CAUSE_SLUGS)[number];

const isCauseSlug = (value: string): value is CauseSlug =>
  (CANONICAL_CAUSE_SLUGS as readonly string[]).includes(value);

export type MeasureGateRefusalCode =
  | 'untriaged-line'
  | 'cause-outside-vocabulary'
  | 'cause-vocabulary-not-bijective'
  | 'component-without-measurement'
  | 'impediment-without-receipt'
  | 'reference-not-case-node'
  | 'reference-provenance-missing'
  | 'reference-provenance-incomplete'
  | 'cause-without-receipt'
  | 'receipt-not-dated'
  | 'receipt-not-retestable'
  | 'receipt-claim-unrefuted'
  // 015 — measure-gate-counting-v2.md §3: a line's aggregateOf and a DW
  // entry's dedupeKey must never target the same pair (the two dedup
  // directions applied to one relationship at once).
  | 'aggregate-dedupe-conflict';

export interface MeasureGateRefusal {
  code: MeasureGateRefusalCode;
  /** The line key, contract id, or cause id at fault — never anonymous
   *  (I-6.2: an unnamed refusal is the same fault the gate exists to
   *  refuse). */
  subject: string;
  message: string;
}

/**
 * One measured line, from EITHER instrument (data-model.md §1). The CLI is
 * responsible for flattening `visual-parity/out/rows.json` rows (joined
 * against `triageFor()` for the full rule incl. `receiptId`) and
 * `causes.json`'s `organismLines` into this one shape.
 */
export interface MeasuredLine {
  instrument: 'visual-parity' | 'organism-audit';
  /** `"<subject> :: <variant>"` or `"<subjectId>/<caseId>"` — the registry's
   *  own key shape (receipts.schema.md §2). */
  key: string;
  /** The `ds.*` contract id this line measures — null only if a subject
   *  genuinely maps to none (should not happen for a governed subject; a
   *  null here simply cannot satisfy C2 for any contract, by construction). */
  contractId: string | null;
  /** The authoritative raw score. `null` means impeded (skipped / refused /
   *  figma-declined / blocked — no numeric score was ever produced). Read as
   *  the NUMBER, never a two-decimal display string (D8). */
  rawPct: number | null;
  /** The published cause slug, or null if untriaged. Deliberately typed
   *  `string | null`, not `CauseSlug | null`: a bad value must be an
   *  OBSERVED refusal (cause-outside-vocabulary), not a compile-time
   *  impossibility the fixture could never construct. */
  cause: string | null;
  /** The one-line free-text cause description, where the source carries
   *  one (TRIAGE rules do; `causes.json`'s `organismLines` do not — they
   *  publish only the slug). Used solely by C4's receipt-claim-unrefuted
   *  check; absent elsewhere is not a defect. */
  causeText?: string | null;
  /** Resolves an entry in `MeasureGateInput.receipts`. */
  causeReceiptId: string | null;
  /** organism-audit lines only (C3). Absent/undefined on visual-parity
   *  lines and on `avant.json`'s pre-fix snapshot, both legitimately. */
  referenceProvenance?: ReferenceProvenance | null;
  /** 015 — measure-gate-counting-v2.md §2: dwIds. This line is the
   *  CONSEQUENCE of N registry facts (`causes.json § organismLines`) — it
   *  contributes 0 to `counts.byCause`; its N facts count 1 each. The
   *  inverse direction of `ReclassifiedDwEntry.dedupeKey` below (which
   *  erases the FACT when its LINE counts, 1:1) — the two never apply to
   *  the same pair (checked, `aggregate-dedupe-conflict`). Still divergent,
   *  still requires cause + receipt (C1/C4 see it) — only the COUNT
   *  delegates to its facts. */
  aggregateOf?: string[];
}

/** `causes.json § entries` — the 013 deferred-work register, re-classified
 *  into the six-value vocabulary (013's own files are never rewritten). */
export interface ReclassifiedDwEntry {
  /** e.g. "DW-006". */
  id: string;
  cause: string;
  /** `causes.json`'s own field name — kept as-is rather than renamed, so the
   *  CLI can spread a parsed entry in with no field-mapping to get wrong. */
  receiptId: string;
  /** The measured-line key this entry is `sameDefectAs`, when the DW entry
   *  and a line describe ONE underlying defect from two angles
   *  (receipts.schema.md §4 bis) — required for the dedup that keeps
   *  `counts.byCause` from dimensioning 015/016 on a doubled defect. */
  dedupeKey?: string | null;
  /** 015 — measure-gate-counting-v2.md §2: non-null ⇒ this entry is no
   *  longer a work item (a spec resolved it) ⇒ excluded from
   *  `counts.byCause`. It stays in the register and under C4 (a resolved
   *  entry still cites a dated, re-tested receipt — resolving it is itself
   *  a claim). DW-006's actual shape: `resolvedBy: "014"`. */
  resolvedBy?: string | null;
}

/** `causes.json § deferredWork` — what 014 ITSELF discovered and did not
 *  fix (receipts.schema.md §4 ter). Distinct from `ReclassifiedDwEntry`
 *  above: that register is 013's, re-classified; this one is 014's own,
 *  freshly surfaced by this feature's own re-tests. Never conflated —
 *  `counts.deferredWork` counts only this roster. */
export interface DiscoveredDeferredWork {
  /** e.g. "DW-014-001". */
  id: string;
  cause: string;
  receiptId: string;
  /** tinyspec select-option-emit — the closure mechanism
   *  measure-gate-counting-v2.md §2 gave `entries` (`resolvedBy`, non-null ⇒
   *  no longer a work item), extended to this roster: a resolved discovery
   *  leaves `counts.deferredWork` while the entry STAYS in the register and
   *  under C4 (a resolved entry still cites a dated, re-tested receipt).
   *  The printed count reflects closure; a prose note alone never does. */
  resolvedBy?: string | null;
}

export interface ReceiptRecord {
  id: string;
  verdict: 'confirmed' | 'refuted' | 'not-retestable' | string;
  date: string | null;
  /** The claim as it read when the receipt was written — only
   *  receipt-claim-unrefuted reads this, and only against a line's
   *  `causeText`. */
  claim?: string | null;
}

export interface MeasureGateInput {
  /** Every id in `contracts/*.contract.json` — C2's population, counted
   *  live by the CLI, never hardcoded (I-6.3). */
  contractIds: string[];
  lines: MeasuredLine[];
  reclassifiedDwEntries: ReclassifiedDwEntry[];
  discoveredDeferredWork: DiscoveredDeferredWork[];
  /** `CAUSE_LABELS` as published by `visual-parity/triage.ts` — checked
   *  here as DATA (I-2.1), not trusted because it typechecked there. */
  causeLabels: Record<string, string>;
  receipts: Record<string, ReceiptRecord>;
  browser: { version: string | null; executablePath: string | null };
}

export type MeasureGateVerdict = 'pass' | 'fail';

export interface MeasureGateCounts {
  contracts: number;
  measuredLines: number;
  divergentLines: number;
  /** Always all six keys, even at zero (I-2.1) — a missing key would read
   *  as "this cause doesn't exist" to whatever reads it downstream
   *  (015/016 dimension on `byCause`, contracts/measure-gate.interface.md
   *  §4). */
  byCause: Record<CauseSlug, number>;
  /** The UNRESOLVED discoveredDeferredWork entries (`resolvedBy` null) —
   *  never mixed into `byCause` (§4 ter): a separate roster of "found, not
   *  fixed, not yet scheduled." A resolved entry stays in the register (and
   *  under C4) but no longer counts as work to do. */
  deferredWork: number;
}

export interface MeasureGateResult {
  schemaVersion: 1;
  verdict: MeasureGateVerdict;
  exitCode: 0 | 1;
  counts: MeasureGateCounts;
  /** In evaluation order — C1, then C2, then C3, then C4. Not sorted or
   *  deduplicated beyond what the checks themselves naturally produce. */
  refusals: MeasureGateRefusal[];
  browser: { version: string | null; executablePath: string | null };
}

const emptyByCause = (): Record<CauseSlug, number> =>
  Object.fromEntries(CANONICAL_CAUSE_SLUGS.map((slug) => [slug, 0])) as Record<CauseSlug, number>;

export function evaluateMeasureGate(input: MeasureGateInput): MeasureGateResult {
  const refusals: MeasureGateRefusal[] = [];
  const refuse = (code: MeasureGateRefusalCode, subject: string, message: string): void => {
    refusals.push({ code, subject, message });
  };

  // ---- vocabulary shape (I-2.1) — a bijection over the six canonical slugs,
  // checked as data. Feeds C1's cause-outside-vocabulary population below,
  // but is reported once, not once per offending line. --------------------
  const labelKeys = Object.keys(input.causeLabels).sort();
  const expectedKeys = [...CANONICAL_CAUSE_SLUGS].sort();
  const distinctLabels = new Set(Object.values(input.causeLabels));
  const bijective =
    labelKeys.length === 6 &&
    JSON.stringify(labelKeys) === JSON.stringify(expectedKeys) &&
    distinctLabels.size === labelKeys.length;
  if (!bijective) {
    refuse(
      'cause-vocabulary-not-bijective',
      'CAUSE_LABELS',
      `expected a bijection over the six canonical slugs (${CANONICAL_CAUSE_SLUGS.join(', ')}), got keys [${labelKeys.join(', ')}]`,
    );
  }

  // ---- C1 — zero divergent line without a cause --------------------------
  // A line is divergent iff its raw score is STRICTLY positive — the number,
  // never the two-decimal display string (D8): a row printed 0.00% can be
  // 0.004%, and reading the string would silently wave it through.
  const divergent = input.lines.filter((l) => l.rawPct !== null && l.rawPct > 0);
  for (const l of divergent) {
    if (l.cause === null) {
      refuse('untriaged-line', l.key, `${l.instrument} line "${l.key}" has a positive raw score (${l.rawPct}) and no cause`);
      continue;
    }
    if (!isCauseSlug(l.cause)) {
      refuse(
        'cause-outside-vocabulary',
        l.key,
        `"${l.key}" cites cause "${l.cause}", which is not one of the six canonical slugs`,
      );
    }
  }

  // ---- C2 — every governed contract has a measured line, or a receipted
  // impediment. -------------------------------------------------------------
  const contractsWithLine = new Set(input.lines.map((l) => l.contractId).filter((id): id is string => id !== null));
  for (const id of input.contractIds) {
    if (!contractsWithLine.has(id)) {
      refuse('component-without-measurement', id, `contract "${id}" has no measured line in either instrument`);
    }
  }
  for (const l of input.lines.filter((l) => l.rawPct === null)) {
    // Resolution, not mere truthiness: an impeded line citing a receipt id
    // that does not resolve has NOT proven its impediment any more than one
    // citing none at all — impeded lines carry `cause: null` by construction
    // (TRIAGE explains score divergence; an impediment has no score), so C4's
    // citation loop below never sees them. This is the only place their
    // receipt gets checked, and a truthy-but-dangling id must not slip past.
    if (!l.causeReceiptId || !input.receipts[l.causeReceiptId]) {
      refuse('impediment-without-receipt', l.key, `impeded line "${l.key}" (no numeric score) publishes no resolvable receipt`);
    }
  }

  // ---- C3 — the reference is the case node, on all five FR-001
  // derivations. organism-audit lines that were actually MEASURED only
  // (rawPct !== null) — a blocked organism (equipe/formulaire/header: a
  // closed dependency gate, zero cases, zero pixels) has no reference to
  // check at all; asking it for referenceProvenance would be a category
  // error, not a stricter check (I-3.4 names exactly NINE organisms as C3's
  // population, not twelve). An impeded organism line's justification is a
  // C2 concern (a receipted impediment), never a C3 one. Re-derived here by
  // calling reference.ts's own pure check, never re-implemented (the two
  // refusal codes below ARE its vocabulary, one layer up). -----------------
  for (const l of input.lines.filter((l) => l.instrument === 'organism-audit' && l.rawPct !== null)) {
    if (!l.referenceProvenance) {
      refuse('reference-provenance-missing', l.key, `"${l.key}" publishes no referenceProvenance block`);
      continue;
    }
    for (const reason of checkReferenceProvenance(l.referenceProvenance).reasons) {
      refuse(reason.code, l.key, `${l.key}: ${reason.message}`);
    }
  }

  // ---- C4 — every published cause resolves a dated, re-tested receipt. ---
  // Population: every line that publishes a cause, plus every reclassified
  // DW entry and every 014-discovered deferred-work item — "toute cause
  // publiée", not just the ones C1 already looked at.
  const citations: Array<{ subject: string; receiptId: string | null; causeText?: string | null }> = [
    ...input.lines.filter((l) => l.cause !== null).map((l) => ({ subject: l.key, receiptId: l.causeReceiptId, causeText: l.causeText })),
    ...input.reclassifiedDwEntries.map((d) => ({ subject: d.id, receiptId: d.receiptId, causeText: null })),
    ...input.discoveredDeferredWork.map((d) => ({ subject: d.id, receiptId: d.receiptId, causeText: null })),
  ];
  for (const c of citations) {
    if (!c.receiptId) {
      refuse('cause-without-receipt', c.subject, `"${c.subject}" publishes a cause with no receipt id`);
      continue;
    }
    const receipt = input.receipts[c.receiptId];
    if (!receipt) {
      refuse('cause-without-receipt', c.subject, `"${c.subject}" cites receipt "${c.receiptId}", which does not resolve`);
      continue;
    }
    if (!receipt.date) {
      refuse('receipt-not-dated', c.subject, `receipt "${c.receiptId}" (cited by "${c.subject}") has no date`);
    }
    if (receipt.verdict === 'not-retestable') {
      refuse(
        'receipt-not-retestable',
        c.subject,
        `receipt "${c.receiptId}" is not-retestable — an inherited cause never passes for a verified one (FR-012)`,
      );
    }
    if (
      receipt.verdict === 'refuted' &&
      c.causeText != null &&
      receipt.claim != null &&
      c.causeText === receipt.claim
    ) {
      refuse(
        'receipt-claim-unrefuted',
        c.subject,
        `receipt "${c.receiptId}" is refuted but "${c.subject}" still asserts the refuted claim verbatim — I-5.2 requires it be re-classified on what the re-test established`,
      );
    }
  }

  // ---- 015 — consistency: aggregateOf and dedupeKey must never target the
  // same pair (measure-gate-counting-v2.md §3). Checked independently of the
  // counting below — a conflict is a refusal regardless of which direction
  // the counter would have picked. -----------------------------------------
  for (const d of input.reclassifiedDwEntries) {
    if (!d.dedupeKey) continue;
    const partner = input.lines.find((l) => l.key === d.dedupeKey);
    if (partner?.aggregateOf?.includes(d.id)) {
      refuse(
        'aggregate-dedupe-conflict',
        d.id,
        `"${d.id}" is both aggregated INTO line "${d.dedupeKey}" (that line's aggregateOf) AND dedupeKey'd to it (this entry's own dedupeKey) — the two dedup directions must never target the same pair`,
      );
    }
  }

  // ---- counts, always live (I-6.3 — never a number fixed in prose) -------
  const byCause = emptyByCause();
  for (const l of divergent) {
    // 015 — aggregateOf (D8): this line is the CONSEQUENCE of N registry
    // facts, counted individually below — the line itself contributes 0
    // (never N+1: 1 line + N facts counts N, not N+1).
    if (l.aggregateOf && l.aggregateOf.length > 0) continue;
    if (l.cause !== null && isCauseSlug(l.cause)) byCause[l.cause] += 1;
  }
  for (const d of input.reclassifiedDwEntries) {
    // sameDefectAs dedup (receipts.schema.md §4 bis): a DW entry linked to an
    // already-counted divergent line describes the SAME defect, not a second
    // one — count it only when its partner line isn't itself divergent
    // (either absent from `lines`, or not counted because it scored 0).
    const partnerAlreadyCounted = d.dedupeKey != null && divergent.some((l) => l.key === d.dedupeKey);
    if (partnerAlreadyCounted) continue;
    // 015 — resolvedBy (D8): no longer a work item — excluded from byCause,
    // even though it stayed a valid C4 citation above.
    if (d.resolvedBy) continue;
    if (isCauseSlug(d.cause)) byCause[d.cause] += 1;
  }

  const verdict: MeasureGateVerdict = refusals.length === 0 ? 'pass' : 'fail';

  return {
    schemaVersion: 1,
    verdict,
    exitCode: verdict === 'pass' ? 0 : 1,
    counts: {
      contracts: input.contractIds.length,
      measuredLines: input.lines.length,
      divergentLines: divergent.length,
      byCause,
      deferredWork: input.discoveredDeferredWork.filter((d) => !d.resolvedBy).length,
    },
    refusals,
    browser: input.browser,
  };
}
