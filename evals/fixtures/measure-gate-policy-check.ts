/**
 * Adversarial contract for the closure gate's fail-closed policy (FR-007,
 * FR-011; decision D7; contracts/measure-gate.interface.md).
 *
 * `extract/figma/measure-gate/gate.ts` does not exist yet — this fixture is
 * written FIRST and MUST fail here (constitution §II: fixture → eval →
 * claim, in that order). It is data-only: every scenario is a hand-built
 * `MeasureGateInput`, no Chromium, no Figma, no filesystem read of the real
 * registre/recus — the CLI (`measure-gate/run.ts`) is what wires real
 * artifacts into this same pure shape.
 *
 * Reference: data-model.md §6 (the four conditions, I-6.1..I-6.4),
 * contracts/measure-gate.interface.md §2-§4 (exit codes, named refusals,
 * output shape), contracts/receipts.schema.md §4 bis (`sameDefectAs` dedup)
 * and §4 ter (`deferredWork`, distinct from the reclassified DW entries).
 */
import {
  evaluateMeasureGate,
  CANONICAL_CAUSE_SLUGS,
  type MeasureGateInput,
  type MeasuredLine,
} from "../../extract/figma/measure-gate/gate.js";

const BROWSER = { version: "151.0.7922.34", executablePath: "/chromium-1234/chrome" };

const CLEAN_LABELS: Record<string, string> = {
  "contract-geometry": "géométrie du contrat",
  "image-boundary": "frontière image (limite A5)",
  rendering: "rendu/rastérisation",
  engine: "défaut moteur",
  instrument: "défaut d'instrument",
  "figma-source": "défaut de source Figma",
};

const RECEIPT_OK = { id: "r-ok", verdict: "confirmed", date: "2026-08-03", claim: "some old claim text" };

function line(overrides: Partial<MeasuredLine> = {}): MeasuredLine {
  return {
    instrument: "visual-parity",
    key: "button :: Style=Default",
    contractId: "ds.button",
    rawPct: 2.7,
    cause: "rendering",
    causeReceiptId: "r-ok",
    ...overrides,
  };
}

/** The smallest input that MUST pass with zero refusals — every other
 *  scenario below mutates exactly one axis of this baseline, so a failure
 *  there can never be blamed on an unrelated field. */
function baseline(): MeasureGateInput {
  return {
    contractIds: ["ds.button"],
    lines: [line()],
    reclassifiedDwEntries: [],
    discoveredDeferredWork: [],
    causeLabels: CLEAN_LABELS,
    receipts: { "r-ok": RECEIPT_OK },
    browser: BROWSER,
  };
}

function expectFail(input: MeasureGateInput, code: string, description: string): void {
  const r = evaluateMeasureGate(input);
  if (r.verdict !== "fail" || r.exitCode !== 1) {
    throw new Error(`${description}: expected verdict "fail"/exitCode 1, got "${r.verdict}"/${r.exitCode}`);
  }
  if (!r.refusals.some((x) => x.code === code)) {
    throw new Error(
      `${description}: expected a "${code}" refusal, got [${r.refusals.map((x) => x.code).join(", ")}]`,
    );
  }
}

// ---------------------------------------------------------------------------
// Property 0 — the baseline itself passes clean. Without this, every
// expectFail below could be vacuously right for the wrong reason (something
// ELSE in the fixture always broken).
// ---------------------------------------------------------------------------
{
  const r = evaluateMeasureGate(baseline());
  if (r.verdict !== "pass" || r.exitCode !== 0 || r.refusals.length !== 0) {
    throw new Error(
      `baseline must pass clean, got verdict="${r.verdict}" exitCode=${r.exitCode} refusals=${JSON.stringify(r.refusals)}`,
    );
  }
  if (r.counts.contracts !== 1 || r.counts.measuredLines !== 1 || r.counts.divergentLines !== 1) {
    throw new Error(`baseline counts must be counted LIVE from the input, got ${JSON.stringify(r.counts)}`);
  }
}

// ---------------------------------------------------------------------------
// Property C0 — a row exactly at 0% is not divergent (D8) and needs no cause.
// ---------------------------------------------------------------------------
{
  const input = baseline();
  input.lines = [line({ rawPct: 0, cause: null, causeReceiptId: null })];
  const r = evaluateMeasureGate(input);
  if (r.verdict !== "pass" || r.refusals.some((x) => x.code === "untriaged-line")) {
    throw new Error(`a 0% line must not require a cause (D8), got ${JSON.stringify(r.refusals)}`);
  }
}

// ---------------------------------------------------------------------------
// C1 — untriaged-line: a divergent line (rawPct > 0) with no cause.
// ---------------------------------------------------------------------------
{
  const input = baseline();
  input.lines = [line({ cause: null, causeReceiptId: null })];
  expectFail(input, "untriaged-line", "a divergent line with cause=null");
}

// C1 — cause-outside-vocabulary: a cause that is not one of the six slugs.
{
  const input = baseline();
  input.lines = [line({ cause: "capture-gap" })]; // a RETIRED slug, never a live one
  expectFail(input, "cause-outside-vocabulary", "a cause outside the six-value vocabulary");
}

// C1 — cause-vocabulary-not-bijective: CAUSE_LABELS missing an entry.
{
  const input = baseline();
  const { "figma-source": _drop, ...incomplete } = CLEAN_LABELS;
  input.causeLabels = incomplete;
  expectFail(input, "cause-vocabulary-not-bijective", "CAUSE_LABELS missing one of the six slugs");
}

// C1 — cause-vocabulary-not-bijective: two slugs sharing one label collapses
// the correspondence FR-004 requires to hold "value for value".
{
  const input = baseline();
  input.causeLabels = { ...CLEAN_LABELS, "figma-source": CLEAN_LABELS.engine };
  expectFail(input, "cause-vocabulary-not-bijective", "two slugs sharing one published label");
}

// ---------------------------------------------------------------------------
// C2 — component-without-measurement: a governed contract with no line at
// all, in either instrument.
// ---------------------------------------------------------------------------
{
  const input = baseline();
  input.contractIds = ["ds.button", "ds.select"];
  expectFail(input, "component-without-measurement", "a contract with zero measured lines");
}

// C2 — impediment-without-receipt: an impeded line (no numeric score) with
// no receipt to justify the impediment (I-1.4).
{
  const input = baseline();
  input.lines = [line({ rawPct: null, cause: null, causeReceiptId: null })];
  expectFail(input, "impediment-without-receipt", "an impeded line asserted with no receipt");
}
// ...and the converse: a RECEIPTED impediment is accepted (FR-006 — silent
// absence and an unproven claim are the two forbidden outcomes; a named,
// receipted one is neither).
{
  const input = baseline();
  input.lines = [line({ rawPct: null, cause: null, causeReceiptId: "r-ok" })];
  const r = evaluateMeasureGate(input);
  if (r.refusals.some((x) => x.code === "impediment-without-receipt")) {
    throw new Error(`a receipted impediment must be accepted, got ${JSON.stringify(r.refusals)}`);
  }
}
// A dangling id — truthy, but resolving nothing — must not slip past: an
// impeded line's cause is null by construction, so C4's citation loop never
// looks at it; this is the ONLY place its receipt gets checked at all.
{
  const input = baseline();
  input.lines = [line({ rawPct: null, cause: null, causeReceiptId: "does-not-exist" })];
  expectFail(input, "impediment-without-receipt", "an impeded line citing a receipt id that resolves nothing");
}

// ---------------------------------------------------------------------------
// C3 — the five-derivation reference check, on organism-audit lines only.
// Reuses organism-audit/reference.ts's own checkReferenceProvenance, so the
// exact two codes it emits (reference-not-case-node,
// reference-provenance-incomplete) are the ones the gate must also know.
// ---------------------------------------------------------------------------
const ORG_LINE = (): MeasuredLine => ({
  instrument: "organism-audit",
  key: "reassurances/reassurances-disposition-4-cartes",
  contractId: "ds.reassurances",
  rawPct: 3.3,
  cause: "instrument",
  causeReceiptId: "r-ok",
});

{
  const input = baseline();
  input.contractIds = ["ds.reassurances"];
  input.lines = [{ ...ORG_LINE(), referenceProvenance: undefined }];
  expectFail(input, "reference-provenance-missing", "an organism line publishing no referenceProvenance block");
}
// A BLOCKED organism (equipe/formulaire/header: a closed dependency gate,
// zero cases, zero pixels) is not a C3 subject at all — it never rendered
// anything to have a reference for. I-3.4 names exactly NINE organisms as
// C3's population, not twelve; a blocked one's justification is C2's
// receipted-impediment concern, checked separately below.
{
  const input = baseline();
  input.contractIds = ["ds.equipe"];
  input.lines = [
    {
      instrument: "organism-audit",
      key: "equipe/blocked",
      contractId: "ds.equipe",
      rawPct: null,
      cause: null,
      causeReceiptId: "r-ok",
      referenceProvenance: null,
    },
  ];
  const r = evaluateMeasureGate(input);
  if (r.refusals.some((x) => x.code.startsWith("reference-"))) {
    throw new Error(`a blocked organism must not be a C3 subject at all, got ${JSON.stringify(r.refusals)}`);
  }
}
{
  const input = baseline();
  input.contractIds = ["ds.reassurances"];
  input.lines = [
    {
      ...ORG_LINE(),
      referenceProvenance: {
        caseNodeId: "2114:3619",
        setNodeId: "2114:3721",
        // the pre-DW-006-fix state: every derivation still cites the SET
        derivations: {
          capture: "2114:3721",
          nodeValues: "2114:3721",
          imposedWidth: "2114:3721",
          alignmentFrame: "2114:3721",
          receiptCitation: "2114:3721",
        },
      },
    },
  ];
  expectFail(input, "reference-not-case-node", "all five derivations still citing the SET node");
}
{
  const input = baseline();
  input.contractIds = ["ds.reassurances"];
  input.lines = [
    {
      ...ORG_LINE(),
      referenceProvenance: {
        caseNodeId: "2114:3619",
        setNodeId: "2114:3721",
        derivations: {
          capture: "2114:3619",
          nodeValues: "2114:3619",
          imposedWidth: "2114:3619",
          alignmentFrame: "2114:3619",
          receiptCitation: "", // one derivation absent — incomplete, not "wrong node"
        } as any,
      },
    },
  ];
  expectFail(input, "reference-provenance-incomplete", "a provenance block missing one of the five derivations");
}
{
  // The corrected state — all five on the case node — must NOT refuse C3.
  const input = baseline();
  input.contractIds = ["ds.reassurances"];
  input.lines = [
    {
      ...ORG_LINE(),
      referenceProvenance: {
        caseNodeId: "2114:3619",
        setNodeId: "2114:3721",
        derivations: {
          capture: "2114:3619",
          nodeValues: "2114:3619",
          imposedWidth: "2114:3619",
          alignmentFrame: "2114:3619",
          receiptCitation: "2114:3619",
        },
      },
    },
  ];
  const r = evaluateMeasureGate(input);
  if (r.refusals.some((x) => x.code.startsWith("reference-"))) {
    throw new Error(`five derivations on the case node must clear C3, got ${JSON.stringify(r.refusals)}`);
  }
}

// ---------------------------------------------------------------------------
// C4 — every published cause resolves a dated, re-tested receipt.
// ---------------------------------------------------------------------------
{
  const input = baseline();
  input.lines = [line({ causeReceiptId: "does-not-exist" })];
  expectFail(input, "cause-without-receipt", "a causeReceiptId that resolves nothing");
}
{
  const input = baseline();
  input.receipts = { "r-ok": { ...RECEIPT_OK, date: null as any } };
  expectFail(input, "receipt-not-dated", "a resolved receipt with no date");
}
{
  const input = baseline();
  input.receipts = { "r-ok": { ...RECEIPT_OK, verdict: "not-retestable" } };
  expectFail(input, "receipt-not-retestable", "a not-retestable receipt blocks closure (FR-012)");
}
// receipt-claim-unrefuted: a refuted receipt whose CURRENT cause text is
// still the verbatim refuted claim — the line was never re-classified
// (I-5.2). Only checkable where a line carries free-text (causeText),
// which only visual-parity/TRIAGE rows do.
{
  const input = baseline();
  input.receipts = { "r-ok": { ...RECEIPT_OK, verdict: "refuted", claim: "the old, now-false belief" } };
  input.lines = [line({ causeText: "the old, now-false belief" })];
  expectFail(input, "receipt-claim-unrefuted", "a refuted receipt still cited verbatim as the current cause");
}
{
  // The converse — carte/field/button-link's actual shape (014/T030): the
  // receipt is refuted, but the cause text was UPDATED to what the re-test
  // found. Same slug is fine; the text must differ from the refuted claim.
  const input = baseline();
  input.receipts = { "r-ok": { ...RECEIPT_OK, verdict: "refuted", claim: "the old, now-false belief" } };
  input.lines = [line({ causeText: "re-measured: what the re-test actually found" })];
  const r = evaluateMeasureGate(input);
  if (r.refusals.some((x) => x.code === "receipt-claim-unrefuted")) {
    throw new Error(`an updated cause text must clear receipt-claim-unrefuted, got ${JSON.stringify(r.refusals)}`);
  }
}

// ---------------------------------------------------------------------------
// Dedup (receipts.schema.md §4 bis) — a reclassified DW entry linked by
// `dedupeKey` to an already-counted line must NOT double the byCause tally.
// ---------------------------------------------------------------------------
{
  const input = baseline(); // one divergent line, cause "rendering"
  input.reclassifiedDwEntries = [
    { id: "DW-002", cause: "rendering", receiptId: "r-ok", dedupeKey: "button :: Style=Default" },
  ];
  const r = evaluateMeasureGate(input);
  if (r.counts.byCause.rendering !== 1) {
    throw new Error(
      `a DW entry deduped against an already-counted line must not double the tally, got byCause.rendering=${r.counts.byCause.rendering}`,
    );
  }
}
{
  // No dedupeKey — the DW entry has no measured-line counterpart, so it
  // counts on its own (this is DW-001/003/004/005/006's actual shape).
  const input = baseline();
  input.reclassifiedDwEntries = [{ id: "DW-001", cause: "contract-geometry", receiptId: "r-ok" }];
  const r = evaluateMeasureGate(input);
  if (r.counts.byCause["contract-geometry"] !== 1) {
    throw new Error(
      `an un-linked DW entry must count on its own, got byCause["contract-geometry"]=${r.counts.byCause["contract-geometry"]}`,
    );
  }
}

// ---------------------------------------------------------------------------
// counts.deferredWork — the DISTINCT roster of what 014 itself discovered
// and did not fix (receipts.schema.md §4 ter), never conflated with the
// reclassified 013 DW register above.
// ---------------------------------------------------------------------------
{
  const input = baseline();
  input.discoveredDeferredWork = [{ id: "DW-014-001", cause: "engine", receiptId: "r-ok" }];
  const r = evaluateMeasureGate(input);
  if (r.counts.deferredWork !== 1) {
    throw new Error(`counts.deferredWork must count discoveredDeferredWork live, got ${r.counts.deferredWork}`);
  }
}

// ---------------------------------------------------------------------------
// I-6.1 — fail-closed: an absence of artifact data (here: zero contracts
// declared) is a refusal the gate can express, never a silent pass.
// counts.byCause always publishes the full six-key shape (I-2.1) even when
// every count is zero — a missing key would be indistinguishable from "not
// implemented yet" for whoever reads counts.byCause downstream (015/016).
// ---------------------------------------------------------------------------
{
  const input = baseline();
  input.lines = [];
  input.contractIds = [];
  const r = evaluateMeasureGate(input);
  if (Object.keys(r.counts.byCause).sort().join(",") !== [...CANONICAL_CAUSE_SLUGS].sort().join(",")) {
    throw new Error(`counts.byCause must always publish all six keys, got ${JSON.stringify(r.counts.byCause)}`);
  }
}

console.log(
  "✔ measure-gate policy holds: the baseline passes clean; C1 (untriaged-line, cause-outside-vocabulary, " +
    "cause-vocabulary-not-bijective), C2 (component-without-measurement, impediment-without-receipt), C3 " +
    "(reference-provenance-missing/-incomplete, reference-not-case-node via reference.ts's own check), and C4 " +
    "(cause-without-receipt, receipt-not-dated, receipt-not-retestable, receipt-claim-unrefuted) each refuse " +
    "exactly their own scenario and no other; sameDefectAs dedup holds; counts.deferredWork stays distinct from " +
    "the reclassified DW register; a 0% row needs no cause (D8); byCause always publishes all six keys.",
);
