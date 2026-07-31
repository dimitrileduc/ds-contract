/**
 * Adversarial contract for the normative receipt mapping (013 / T007).
 *
 * A `visual-campaign-v1` receipt speaks `pass` / `fail` / `blocked` at subject
 * level and carries `probative` only per case — `proved` never appears in it
 * literally.  The 013 dependency gate must therefore DERIVE both `probative`
 * and the 013 verdict from the receipt's own cases, and a manifest must never
 * be able to hand either of them to itself.
 *
 * This fixture is data-only on purpose: no Chromium, no Figma call, no mkdir,
 * and no disk read.  `evals/run.ts` copies contracts/tokens/scripts/core/
 * parity/src/extract/... into its scratch workspace but NOT `specs/`, so the
 * real dependency receipt cannot be opened from a fixture.  The receipts below
 * are synthetic, but they mirror
 *
 *   specs/011-fix-molecule-convergence/proofs/visual/result.json
 *
 * field for field and pin its real retained values:
 *
 *   nav-item     verdict "fail"     1 passing / 3 failing, missing []   ds.nav-item@1.1.0
 *   field        verdict "blocked"  5 blocked,             missing []   ds.field@2.0.0
 *   member-card  verdict "blocked"  16 blocked,            missing []   ds.member-card@1.2.0
 *   reference    fileKey d9FYAUcqdcNtsuaMgLefvJ @ fileVersion 2381568261081914456
 *
 * Every case in that real receipt carries `probative: true`, which is exactly
 * why the derivation is additionally exercised here against synthetic
 * non-probative cases: the one shape the real receipt cannot demonstrate is the
 * one that must never buy a `proved`.
 */
import { createHash } from "node:crypto";
import {
  deriveReceiptProbative,
  evaluateDependencyGate,
  mapReceiptVerdict,
  type DependencyGateResult,
} from "../../extract/figma/organism-audit/dependencies.js";

const RECEIPT_PATH =
  "specs/011-fix-molecule-convergence/proofs/visual/result.json";
const FIGMA_FILE_KEY = "d9FYAUcqdcNtsuaMgLefvJ";
const FIGMA_FILE_VERSION = "2381568261081914456";

/** Verdicts a parent may never be handed off the back of a closed gate. */
const POSITIVE_VERDICTS = ["proved", "limited"] as const;

type RawVerdict = "pass" | "fail" | "blocked";

type CaseSpec = { id: string; verdict: RawVerdict; probative: boolean };

type SubjectSpec = {
  id: string;
  contractId: string;
  contractVersion: string;
  cases: CaseSpec[];
  /** Cases the subject requires; defaults to every case it declares. */
  requiredCaseIds?: string[];
  /** Receipt-side coverage hole. */
  missing?: string[];
  /** Overrides the derived subject verdict — used to build dishonest receipts. */
  verdict?: string;
  /** A subject-level `probative` a receipt has no business carrying. */
  declaredProbative?: boolean;
};

/** Mirrors the `visual-campaign-v1` receipt envelope byte-shape for byte-shape. */
function buildReceipt(subjects: SubjectSpec[]): Record<string, unknown> {
  const cases = subjects.flatMap((subject) =>
    subject.cases.map((entry) => ({
      id: entry.id,
      subjectId: subject.id,
      verdict: entry.verdict,
      probative: entry.probative,
      reasons: entry.verdict === "pass" ? [] : [`${entry.verdict}-synthetic`],
      namedBlockedConditions: [],
      contract: {
        id: subject.contractId,
        version: subject.contractVersion,
        factIds: [`${subject.id}.synthetic`],
        codeProps: {},
        slotOverrides: {},
      },
    })),
  );

  const receiptSubjects = subjects.map((subject) => {
    const requiredCaseIds = subject.requiredCaseIds ?? subject.cases.map((entry) => entry.id);
    const required = subject.cases.filter((entry) => requiredCaseIds.includes(entry.id));
    const blocked = required.filter((entry) => entry.verdict === "blocked").length;
    const failing = required.filter((entry) => entry.verdict === "fail").length;
    const passing = required.filter((entry) => entry.verdict === "pass").length;
    const derived = blocked > 0 ? "blocked" : failing > 0 ? "fail" : "pass";
    const entry: Record<string, unknown> = {
      id: subject.id,
      requiredCaseIds,
      passing,
      failing,
      blocked,
      missing: subject.missing ?? [],
      verdict: subject.verdict ?? derived,
      reasons: derived === "pass" ? [] : [`subject:${subject.id}:${derived}`],
    };
    if (subject.declaredProbative !== undefined) entry.probative = subject.declaredProbative;
    return entry;
  });

  const expected = subjects.flatMap((subject) => [`${subject.id}.synthetic`]);
  return {
    schemaVersion: 1,
    campaignId: "011-fix-molecule-convergence",
    reference: { fileKey: FIGMA_FILE_KEY, fileVersion: FIGMA_FILE_VERSION },
    inputHashes: {
      campaign: "0".repeat(64),
      contracts: "1".repeat(64),
      assetsManifest: "2".repeat(64),
      generatedTree: "3".repeat(64),
    },
    coverage: { expected, observed: expected, missing: [], unexpected: [] },
    subjects: receiptSubjects,
    cases,
    verdict: "blocked",
    exitCode: 2,
    reasons: receiptSubjects
      .filter((subject) => subject.verdict !== "pass")
      .map((subject) => `subject:${String(subject.id)}:${String(subject.verdict)}`),
  };
}

function serialize(receipt: unknown): { bytes: string; sha256: string } {
  const bytes = JSON.stringify(receipt);
  return { bytes, sha256: createHash("sha256").update(bytes, "utf8").digest("hex") };
}

const navItemCases = (probativeOverrides: Record<string, boolean> = {}): CaseSpec[] =>
  (
    [
      ["nav-item-chevron-false-actif-false", "pass"],
      ["nav-item-chevron-true-actif-false", "fail"],
      ["nav-item-chevron-false-actif-true", "fail"],
      ["nav-item-chevron-true-actif-true", "fail"],
    ] as const
  ).map(([id, verdict]) => ({
    id,
    verdict: verdict as RawVerdict,
    probative: probativeOverrides[id] ?? true,
  }));

/** The three real 011 subjects, at their retained values. */
const RETAINED_RECEIPT = buildReceipt([
  {
    id: "nav-item",
    contractId: "ds.nav-item",
    contractVersion: "1.1.0",
    cases: navItemCases(),
  },
  {
    id: "field",
    contractId: "ds.field",
    contractVersion: "2.0.0",
    cases: [
      "field-master-normal-input",
      "field-normal-input-required",
      "field-normal-input-optionnel",
      "field-normal-select-required",
      "field-normal-textarea-required",
    ].map((id) => ({ id, verdict: "blocked" as RawVerdict, probative: true })),
  },
  {
    id: "member-card",
    contractId: "ds.member-card",
    contractVersion: "1.2.0",
    cases: Array.from({ length: 16 }, (_unused, index) => ({
      id: `member-card-occurrence-${String(index + 1).padStart(2, "0")}`,
      verdict: "blocked" as RawVerdict,
      probative: true,
    })),
  },
]);

// ---------------------------------------------------------------------------
// 1. `probative` is derived from the receipt's required cases, never supplied.
// ---------------------------------------------------------------------------

function expectProbative(
  receipt: unknown,
  subjectId: string,
  requiredCaseIds: string[],
  expected: boolean,
  label: string,
): void {
  const result = deriveReceiptProbative({ receipt, subjectId, requiredCaseIds });
  if (result.probative !== expected) {
    throw new Error(
      `${label}: derived probative must be ${expected}, got ${result.probative} (reasons: ${result.reasons.join(", ") || "none"})`,
    );
  }
  if (!expected && result.reasons.length === 0) {
    throw new Error(`${label}: a non-probative derivation must name why, silently returning false is not honest`);
  }
  for (const reason of result.reasons) {
    if (typeof reason !== "string" || reason.trim() === "") {
      throw new Error(`${label}: derivation reasons must be non-empty strings, got ${JSON.stringify(reason)}`);
    }
  }
}

const NAV_ITEM_REQUIRED = [
  "nav-item-chevron-false-actif-false",
  "nav-item-chevron-true-actif-false",
  "nav-item-chevron-false-actif-true",
  "nav-item-chevron-true-actif-true",
];

expectProbative(
  RETAINED_RECEIPT,
  "nav-item",
  NAV_ITEM_REQUIRED,
  true,
  "the retained 011 nav-item subject (missing [], four probative cases)",
);

// A receipt-side coverage hole is a hole in the evidence, whatever the cases say.
expectProbative(
  buildReceipt([
    {
      id: "nav-item",
      contractId: "ds.nav-item",
      contractVersion: "1.1.0",
      cases: navItemCases(),
      missing: ["nav-item-chevron-true-actif-true"],
    },
  ]),
  "nav-item",
  NAV_ITEM_REQUIRED,
  false,
  "a receipt whose subject.missing is not empty",
);

// A required case with no case in the receipt cannot be assumed conformant.
expectProbative(
  buildReceipt([
    {
      id: "nav-item",
      contractId: "ds.nav-item",
      contractVersion: "1.1.0",
      cases: navItemCases().slice(0, 3),
    },
  ]),
  "nav-item",
  NAV_ITEM_REQUIRED,
  false,
  "a required case id that resolves to nothing",
);

// One non-probative required case poisons the whole derivation.
expectProbative(
  buildReceipt([
    {
      id: "nav-item",
      contractId: "ds.nav-item",
      contractVersion: "1.1.0",
      cases: navItemCases({ "nav-item-chevron-true-actif-true": false }),
    },
  ]),
  "nav-item",
  NAV_ITEM_REQUIRED,
  false,
  "one required case carrying probative: false",
);

// ... but a NON-required case does not: the derivation is scoped to what the
// gate actually needs, not to everything the campaign happened to run.
expectProbative(
  buildReceipt([
    {
      id: "nav-item",
      contractId: "ds.nav-item",
      contractVersion: "1.1.0",
      cases: [
        ...navItemCases(),
        { id: "nav-item-exploratory", verdict: "pass", probative: false },
      ],
      requiredCaseIds: NAV_ITEM_REQUIRED,
    },
  ]),
  "nav-item",
  NAV_ITEM_REQUIRED,
  true,
  "a non-probative case outside the required set",
);

// Case ids resolve within their own subject.  A same-named case filed under a
// different subject is not the evidence this gate asked for.
expectProbative(
  buildReceipt([
    {
      id: "nav-item",
      contractId: "ds.nav-item",
      contractVersion: "1.1.0",
      cases: navItemCases().slice(0, 3),
    },
    {
      id: "tab",
      contractId: "ds.tab",
      contractVersion: "1.0.0",
      cases: [{ id: "nav-item-chevron-true-actif-true", verdict: "pass", probative: true }],
    },
  ]),
  "nav-item",
  NAV_ITEM_REQUIRED,
  false,
  "a required case that only exists under another subject",
);

// The headline: a receipt that writes `probative: true` on itself does not get
// to keep it.  The derivation reads the cases, always.
expectProbative(
  buildReceipt([
    {
      id: "nav-item",
      contractId: "ds.nav-item",
      contractVersion: "1.1.0",
      cases: navItemCases({ "nav-item-chevron-false-actif-false": false }),
      verdict: "pass",
      declaredProbative: true,
    },
  ]),
  "nav-item",
  NAV_ITEM_REQUIRED,
  false,
  "a receipt declaring subject-level probative: true over a non-probative case",
);

// An absent subject, and an unparsable receipt, derive nothing rather than
// defaulting to trust.
expectProbative(RETAINED_RECEIPT, "equipe", NAV_ITEM_REQUIRED, false, "a subject absent from the receipt");
expectProbative(null, "nav-item", NAV_ITEM_REQUIRED, false, "a null receipt");
expectProbative({ schemaVersion: 1 }, "nav-item", NAV_ITEM_REQUIRED, false, "a receipt with no subjects");

// ---------------------------------------------------------------------------
// 2. The normative v1 -> 013 verdict mapping.
// ---------------------------------------------------------------------------

function expectMapped(
  raw: unknown,
  probative: boolean,
  expected: string,
  label: string,
): void {
  const result = mapReceiptVerdict(raw as never, probative);
  if (result.actualVerdict !== expected) {
    throw new Error(
      `${label}: ${JSON.stringify(raw)} + probative=${probative} must map to ${expected}, got ${result.actualVerdict}`,
    );
  }
  if (expected !== "proved" && result.reasons.length === 0) {
    throw new Error(`${label}: a non-proved mapping must name its reason`);
  }
}

function expectNeverProved(raw: unknown, probative: boolean, label: string): void {
  const result = mapReceiptVerdict(raw as never, probative);
  if ((POSITIVE_VERDICTS as readonly string[]).includes(result.actualVerdict)) {
    throw new Error(
      `${label}: ${JSON.stringify(raw)} + probative=${probative} was mapped to the positive verdict ${result.actualVerdict}`,
    );
  }
}

expectMapped("pass", true, "proved", "a probative pass");
expectMapped("fail", true, "divergent", "the retained nav-item fail");
expectMapped("blocked", true, "blocked", "the retained field/member-card blocked");

// THE assertion this fixture exists for: a receipt that says `pass` over
// evidence that does not prove anything is not a proof.  `proved` is reserved
// for pass AND a derived probative — nothing else may reach it.
expectMapped("pass", false, "not-proven", "a pass whose derived probative is false");
expectNeverProved("pass", false, "a pass whose derived probative is false");
expectNeverProved("fail", false, "a non-probative fail");
expectNeverProved("blocked", false, "a non-probative blocked");

// A v1 receipt cannot smuggle a 013 verdict through its own verdict field:
// `proved`, `divergent` and friends are not v1 vocabulary, so they are unknown
// values — and an unknown value proves nothing.
for (const unknownRaw of [
  "proved",
  "divergent",
  "limited",
  "not-proven",
  "PASS",
  "Pass",
  "passed",
  "ok",
  "",
  null,
  undefined,
  0,
  true,
  { verdict: "pass" },
]) {
  for (const probative of [true, false]) {
    expectMapped(unknownRaw, probative, "not-proven", "an unknown v1 receipt verdict");
    expectNeverProved(unknownRaw, probative, "an unknown v1 receipt verdict");
  }
}

// ---------------------------------------------------------------------------
// 3. The gate: freshness, derivation and the `open` rule, end to end.
// ---------------------------------------------------------------------------

type GateDeclaration = Record<string, unknown>;

function gateFor(
  parentSubjectId: string,
  dependencyContractId: string,
  expectedContractVersion: string,
  resultSha256: string,
  overrides: GateDeclaration = {},
): GateDeclaration {
  return {
    parentSubjectId,
    dependencyContractId,
    receiptSchema: "visual-campaign-v1",
    requiredVerdict: "proved",
    resultPath: RECEIPT_PATH,
    resultSha256,
    expectedContractVersion,
    expectedFigmaFileVersion: FIGMA_FILE_VERSION,
    requireProbative: true,
    ...overrides,
  };
}

const REQUIRED_GATE_FIELDS = [
  "parentSubjectId",
  "dependencyContractId",
  "receiptSchema",
  "resultPath",
  "resultSha256",
  "contractVersion",
  "figmaFileVersion",
  "receiptVerdict",
  "probative",
  "actualVerdict",
  "staleReasons",
  "open",
  "reasons",
] as const;

function assertCompleteGateResult(result: DependencyGateResult, label: string): void {
  for (const field of REQUIRED_GATE_FIELDS) {
    if (!(field in (result as unknown as Record<string, unknown>))) {
      throw new Error(`${label}: DependencyGateResult is missing the field ${field}`);
    }
  }
  if (!Array.isArray(result.staleReasons) || !Array.isArray(result.reasons)) {
    throw new Error(`${label}: staleReasons and reasons must both be arrays`);
  }
  if (!result.open && result.reasons.length === 0) {
    throw new Error(`${label}: a closed gate must carry typed reasons, an unexplained refusal is not auditable`);
  }
  for (const reason of [...result.reasons, ...result.staleReasons]) {
    if (typeof reason !== "string" || reason.trim() === "" || /\s/.test(reason)) {
      throw new Error(
        `${label}: gate reasons must be typed codes without whitespace, got ${JSON.stringify(reason)}`,
      );
    }
  }
}

const retained = serialize(RETAINED_RECEIPT);

const RETAINED_EXPECTATIONS = [
  {
    parent: "header",
    dependency: "ds.nav-item",
    version: "1.1.0",
    receiptVerdict: "fail",
    actualVerdict: "divergent",
  },
  {
    parent: "formulaire",
    dependency: "ds.field",
    version: "2.0.0",
    receiptVerdict: "blocked",
    actualVerdict: "blocked",
  },
  {
    parent: "equipe",
    dependency: "ds.member-card",
    version: "1.2.0",
    receiptVerdict: "blocked",
    actualVerdict: "blocked",
  },
] as const;

for (const expectation of RETAINED_EXPECTATIONS) {
  const result = evaluateDependencyGate({
    gate: gateFor(expectation.parent, expectation.dependency, expectation.version, retained.sha256) as never,
    receiptBytes: retained.bytes,
    actualContractVersion: expectation.version,
    currentFigmaFileVersion: FIGMA_FILE_VERSION,
  });
  const label = `the retained 011 gate ${expectation.parent} -> ${expectation.dependency}`;
  assertCompleteGateResult(result, label);
  if (result.receiptVerdict !== expectation.receiptVerdict) {
    throw new Error(
      `${label}: the raw receipt verdict must be reported as ${expectation.receiptVerdict}, got ${result.receiptVerdict}`,
    );
  }
  if (result.actualVerdict !== expectation.actualVerdict) {
    throw new Error(
      `${label}: must map to ${expectation.actualVerdict}, got ${result.actualVerdict}`,
    );
  }
  if (result.probative !== true) {
    throw new Error(`${label}: every retained 011 case is probative, the derivation must say so`);
  }
  if (result.staleReasons.length !== 0) {
    throw new Error(`${label}: a matching hash/version pair is fresh, got ${result.staleReasons.join(", ")}`);
  }
  if (result.open !== false) {
    throw new Error(`${label}: only a mapped 'proved' opens a gate, ${result.actualVerdict} must not`);
  }
  if (result.resultSha256 !== retained.sha256) {
    throw new Error(`${label}: resultSha256 must be recomputed over the receipt bytes`);
  }
  if (result.resultPath !== RECEIPT_PATH) {
    throw new Error(`${label}: the receipt path must travel with the result so the reader can go and check`);
  }
}

// A gate that can never open would prove nothing about the rule, so pin the
// one shape that DOES open: fresh hash, matching versions, probative pass.
const GREEN_RECEIPT = buildReceipt([
  {
    id: "nav-item",
    contractId: "ds.nav-item",
    contractVersion: "1.1.0",
    cases: NAV_ITEM_REQUIRED.map((id) => ({ id, verdict: "pass" as RawVerdict, probative: true })),
  },
]);
const green = serialize(GREEN_RECEIPT);

const greenResult = evaluateDependencyGate({
  gate: gateFor("header", "ds.nav-item", "1.1.0", green.sha256) as never,
  receiptBytes: green.bytes,
  actualContractVersion: "1.1.0",
  currentFigmaFileVersion: FIGMA_FILE_VERSION,
});
assertCompleteGateResult(greenResult, "a fresh, probative, passing dependency");
if (greenResult.actualVerdict !== "proved" || greenResult.open !== true) {
  throw new Error(
    `a fresh probative pass must open the gate as proved, got ${greenResult.actualVerdict} / open=${greenResult.open}`,
  );
}

function expectClosed(
  input: Parameters<typeof evaluateDependencyGate>[0],
  label: string,
  options: { stale?: boolean; actualVerdict?: string } = {},
): DependencyGateResult {
  const result = evaluateDependencyGate(input);
  assertCompleteGateResult(result, label);
  if (result.open !== false) throw new Error(`${label}: the gate must stay closed`);
  if ((POSITIVE_VERDICTS as readonly string[]).includes(result.actualVerdict) && options.actualVerdict !== result.actualVerdict) {
    throw new Error(`${label}: a closed gate must not carry the positive verdict ${result.actualVerdict}`);
  }
  if (options.stale && result.staleReasons.length === 0) {
    throw new Error(`${label}: a stale reference must name what went stale`);
  }
  if (options.actualVerdict && result.actualVerdict !== options.actualVerdict) {
    throw new Error(`${label}: expected ${options.actualVerdict}, got ${result.actualVerdict}`);
  }
  return result;
}

// A declared hash that does not match the bytes is not a receipt this gate can
// stand on — and the reported hash is the one recomputed from the bytes, never
// the one the manifest wished for.
const wrongHash = expectClosed(
  {
    gate: gateFor("header", "ds.nav-item", "1.1.0", "f".repeat(64)) as never,
    receiptBytes: green.bytes,
    actualContractVersion: "1.1.0",
    currentFigmaFileVersion: FIGMA_FILE_VERSION,
  },
  "a declared resultSha256 that does not match the receipt bytes",
  { stale: true },
);
if (wrongHash.resultSha256 !== green.sha256) {
  throw new Error("the gate reported the manifest's hash instead of the hash of the bytes it read");
}

expectClosed(
  {
    gate: gateFor("header", "ds.nav-item", "1.1.0", green.sha256) as never,
    receiptBytes: green.bytes,
    actualContractVersion: "1.2.0",
    currentFigmaFileVersion: FIGMA_FILE_VERSION,
  },
  "a contract that moved past the version the receipt proved",
  { stale: true },
);

expectClosed(
  {
    gate: gateFor("header", "ds.nav-item", "1.1.0", green.sha256) as never,
    receiptBytes: green.bytes,
    actualContractVersion: null,
    currentFigmaFileVersion: FIGMA_FILE_VERSION,
  },
  "an unreadable current contract version",
  { stale: true },
);

expectClosed(
  {
    gate: gateFor("header", "ds.nav-item", "1.1.0", green.sha256) as never,
    receiptBytes: green.bytes,
    actualContractVersion: "1.1.0",
    currentFigmaFileVersion: "2999999999999999999",
  },
  "a Figma file that moved past the version the receipt was captured against",
  { stale: true },
);

// Unreadable / unparsable / silent-about-the-subject receipts all resolve the
// same way: not-proven.  Absence of evidence is never evidence of fidelity.
expectClosed(
  {
    gate: gateFor("header", "ds.nav-item", "1.1.0", green.sha256) as never,
    receiptBytes: null,
    actualContractVersion: "1.1.0",
    currentFigmaFileVersion: FIGMA_FILE_VERSION,
  },
  "an unreadable receipt",
  { actualVerdict: "not-proven" },
);

expectClosed(
  {
    gate: gateFor("header", "ds.nav-item", "1.1.0", green.sha256) as never,
    receiptBytes: "{ not json",
    actualContractVersion: "1.1.0",
    currentFigmaFileVersion: FIGMA_FILE_VERSION,
  },
  "an unparsable receipt",
  { actualVerdict: "not-proven" },
);

expectClosed(
  {
    gate: gateFor("header", "ds.ghost-item", "1.1.0", green.sha256) as never,
    receiptBytes: green.bytes,
    actualContractVersion: "1.1.0",
    currentFigmaFileVersion: FIGMA_FILE_VERSION,
  },
  "a dependency the receipt never covered",
  { actualVerdict: "not-proven" },
);

// The same green receipt, one required case demoted to non-probative while the
// subject still announces `pass`: the gate must derive, not read.
const DISHONEST_RECEIPT = buildReceipt([
  {
    id: "nav-item",
    contractId: "ds.nav-item",
    contractVersion: "1.1.0",
    cases: NAV_ITEM_REQUIRED.map((id, index) => ({
      id,
      verdict: "pass" as RawVerdict,
      probative: index !== 0,
    })),
    verdict: "pass",
    declaredProbative: true,
  },
]);
const dishonest = serialize(DISHONEST_RECEIPT);

const dishonestResult = expectClosed(
  {
    gate: gateFor("header", "ds.nav-item", "1.1.0", dishonest.sha256) as never,
    receiptBytes: dishonest.bytes,
    actualContractVersion: "1.1.0",
    currentFigmaFileVersion: FIGMA_FILE_VERSION,
  },
  "a passing subject standing on one non-probative required case",
);
if (dishonestResult.probative !== false) {
  throw new Error(
    "the gate trusted the receipt's own probative flag instead of deriving it from the required cases",
  );
}
if (dishonestResult.actualVerdict === "proved") {
  throw new Error(
    "a pass whose derived probative is false was mapped to proved — the central refusal of T007",
  );
}

// ---------------------------------------------------------------------------
// 4. The manifest may not override the verdict or the derivation.
// ---------------------------------------------------------------------------

/**
 * "Cannot override" is satisfied two ways: refusing the declaration outright,
 * or ignoring it and reporting the derived values.  Both are accepted here;
 * quietly adopting the declared value is not.
 */
function expectNoOverride(
  input: Parameters<typeof evaluateDependencyGate>[0],
  label: string,
  derived: { receiptVerdict: string; probative: boolean; notVerdict: string },
): void {
  let result: DependencyGateResult;
  try {
    result = evaluateDependencyGate(input);
  } catch {
    return; // refused by name at the gate: also a valid "cannot override"
  }
  if (result.receiptVerdict !== derived.receiptVerdict) {
    throw new Error(
      `${label}: the manifest rewrote receiptVerdict to ${result.receiptVerdict}, the receipt says ${derived.receiptVerdict}`,
    );
  }
  if (result.probative !== derived.probative) {
    throw new Error(
      `${label}: the manifest rewrote the derived probative to ${result.probative}`,
    );
  }
  if (result.actualVerdict === derived.notVerdict) {
    throw new Error(
      `${label}: the manifest bought itself ${derived.notVerdict} — the derivation is not the manifest's to write`,
    );
  }
  if (result.open !== false) {
    throw new Error(`${label}: a self-declared gate must not open`);
  }
}

const SELF_DECLARED = {
  probative: true,
  actualVerdict: "proved",
  receiptVerdict: "pass",
  open: true,
  staleReasons: [],
  reasons: [],
};

expectNoOverride(
  {
    gate: gateFor("header", "ds.nav-item", "1.1.0", retained.sha256, SELF_DECLARED) as never,
    receiptBytes: retained.bytes,
    actualContractVersion: "1.1.0",
    currentFigmaFileVersion: FIGMA_FILE_VERSION,
  },
  "a manifest declaring pass/probative/proved over the retained nav-item fail",
  { receiptVerdict: "fail", probative: true, notVerdict: "proved" },
);

expectNoOverride(
  {
    gate: gateFor("header", "ds.nav-item", "1.1.0", dishonest.sha256, SELF_DECLARED) as never,
    receiptBytes: dishonest.bytes,
    actualContractVersion: "1.1.0",
    currentFigmaFileVersion: FIGMA_FILE_VERSION,
  },
  "a manifest declaring probative: true over a non-probative required case",
  { receiptVerdict: "pass", probative: false, notVerdict: "proved" },
);

expectNoOverride(
  {
    gate: gateFor("equipe", "ds.member-card", "1.2.0", retained.sha256, {
      ...SELF_DECLARED,
      requiredVerdict: "blocked",
    }) as never,
    receiptBytes: retained.bytes,
    actualContractVersion: "1.2.0",
    currentFigmaFileVersion: FIGMA_FILE_VERSION,
  },
  "a manifest lowering requiredVerdict to match a blocked dependency",
  { receiptVerdict: "blocked", probative: true, notVerdict: "proved" },
);

// Freshness is not the manifest's to waive either.
expectNoOverride(
  {
    gate: gateFor("header", "ds.nav-item", "1.1.0", "f".repeat(64), {
      ...SELF_DECLARED,
      staleReasons: [],
      expectedFigmaFileVersion: "2999999999999999999",
    }) as never,
    receiptBytes: green.bytes,
    actualContractVersion: "9.9.9",
    currentFigmaFileVersion: "2999999999999999999",
  },
  "a manifest declaring an empty staleReasons over a stale hash and version",
  { receiptVerdict: "pass", probative: true, notVerdict: "proved" },
);

console.log(
  "✔ dependency mapping derives probative from the receipt's required cases, maps pass/fail/blocked/unknown to proved-only-if-probative/divergent/blocked/not-proven, closes the gate on a stale hash or version, and refuses every manifest-declared verdict or derivation",
);
