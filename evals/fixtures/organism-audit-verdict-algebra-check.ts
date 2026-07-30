/**
 * Adversarial contract for the fail-closed verdict algebra of the organism
 * audit (013).
 *
 * A verdict is *derived* from observations, never declared.  This fixture is
 * data-only — no Chromium, no Figma, no filesystem — and pins the one property
 * that keeps the campaign honest: severity always wins.  It names the small
 * pure API the runner and the reporter both consume:
 *
 *   deriveFactOutcome(factVerdictInput)
 *   aggregateOrganismVerdict(organismVerdictInput)
 *   deriveCampaignVerdict({ subjectVerdicts, dossiersValid, invalidReasons })
 *
 * Reference: data-model.md §6 (FactOutcome), §9 (DeferredWorkItem), §10
 * (OrganismVerdict priority) and §11 (CampaignAuditResult); research.md D8.
 */
import {
  ORGANISM_VERDICT_PRIORITY,
  aggregateOrganismVerdict,
  deriveCampaignVerdict,
  deriveFactOutcome,
  type CampaignVerdict,
  type FactOutcome,
  type FactVerdictInput,
  type OrganismVerdict,
  type OrganismVerdictInput,
} from "../../extract/figma/organism-audit/verdict.js";

/** data-model §10 — most severe first.  A tie is impossible by construction. */
const EXPECTED_PRIORITY: readonly OrganismVerdict[] = [
  "blocked",
  "divergent",
  "not-proven",
  "limited",
  "proved",
];

/** data-model §11 — a campaign result carries exactly twelve organisms. */
const EXPECTED_SUBJECT_COUNT = 12;

const EXIT_CODE_BY_VERDICT: Record<CampaignVerdict, 0 | 1 | 2> = {
  complete: 0,
  "complete-with-blocks": 1,
  invalid: 2,
};

// ---------------------------------------------------------------------------
// Facts
// ---------------------------------------------------------------------------

/**
 * The only shape that may earn `proved`: three *available* legs (Figma pin,
 * contract pointer, generated React), agreeing under the declared mapping,
 * carried by probative evidence, with no representability boundary and no
 * deferred work outstanding.
 */
const provedFact = (): FactVerdictInput => ({
  legs: { figma: true, contract: true, generated: true },
  agreement: "agree",
  evidenceProbative: true,
  representability: "carry-both",
  localizedSource: null,
  deferredWorkId: null,
});

const fact = (overrides: Partial<FactVerdictInput>): FactVerdictInput => ({
  ...provedFact(),
  ...overrides,
});

function expectFactOutcome(
  label: string,
  input: FactVerdictInput,
  expected: FactOutcome,
): void {
  const actual = deriveFactOutcome(input);
  if (actual.outcome !== expected) {
    throw new Error(
      `${label}: expected fact outcome ${expected}, got ${actual.outcome} ` +
        `(${actual.reasons.join(", ") || "no reason given"})`,
    );
  }
  // Degradation is named, never silent: anything short of `proved` must say why.
  if (expected !== "proved" && actual.reasons.length === 0) {
    throw new Error(`${label}: a ${expected} fact must name its reasons`);
  }
}

function expectFactRefused(label: string, input: FactVerdictInput): void {
  let derived: string | null = null;
  try {
    derived = deriveFactOutcome(input).outcome;
  } catch {
    return;
  }
  throw new Error(
    `${label}: an internally inconsistent fact input must throw, not derive ${derived}`,
  );
}

expectFactOutcome("three agreeing probative legs", fact({}), "proved");

// A leg that is unavailable is typed absent — it is never read as conforming.
for (const legs of [
  { figma: false, contract: true, generated: true },
  { figma: true, contract: false, generated: true },
  { figma: true, contract: true, generated: false },
] as const) {
  expectFactOutcome(
    `an unavailable leg ${JSON.stringify(legs)}`,
    fact({ legs }),
    "not-proven",
  );
}

// Not knowing whether the legs agree is not agreement, and evidence that is
// not probative proves nothing whatever its score claimed.
expectFactOutcome("an unknown agreement", fact({ agreement: "unknown" }), "not-proven");
expectFactOutcome(
  "non-probative evidence",
  fact({ evidenceProbative: false }),
  "not-proven",
);

// A mismatch is only a divergence once it is localized.  An unlocalized
// mismatch is an incoherent input: it would let the report assert a defect
// without naming which surface carries it.
expectFactOutcome(
  "a mismatch localized to the generated surface",
  fact({ agreement: "mismatch", localizedSource: "generated" }),
  "divergent",
);
expectFactRefused(
  "a mismatch with a null localizedSource",
  fact({ agreement: "mismatch", localizedSource: null }),
);
expectFactRefused(
  "a mismatch with an omitted localizedSource",
  fact({ agreement: "mismatch", localizedSource: undefined }),
);

// A named representability boundary is an honest answer, never a pass.
expectFactOutcome(
  "a named representability boundary",
  fact({ representability: "carry-with-named-limit" }),
  "limited",
);
const codeOnly = deriveFactOutcome(
  fact({
    representability: "carry-code-only",
    legs: { figma: false, contract: true, generated: true },
  }),
);
if (codeOnly.outcome === "proved") {
  throw new Error("a carry-code-only fact has no Figma leg to prove and must not be proved");
}

// The ladder inside a single fact: a real mismatch and a missing leg both
// outrank a named boundary.  A limit never absorbs a stronger signal.
expectFactOutcome(
  "a mismatch observed inside a named representability limit",
  fact({
    agreement: "mismatch",
    localizedSource: "comparison",
    representability: "carry-with-named-limit",
  }),
  "divergent",
);
expectFactOutcome(
  "a missing leg under a named representability limit",
  fact({
    legs: { figma: true, contract: true, generated: false },
    representability: "carry-with-named-limit",
  }),
  "not-proven",
);

// Deferred work is deferred *work*, never a granted pass (data-model §9).  An
// otherwise perfect chain that still carries one is incoherent, and on a
// non-positive fact the deferral never upgrades the outcome.
expectFactRefused("a proved fact carrying a deferredWorkId", fact({ deferredWorkId: "dw-001" }));
for (const [expected, input] of [
  [
    "divergent",
    fact({
      agreement: "mismatch",
      localizedSource: "contract",
      deferredWorkId: "dw-002",
    }),
  ],
  [
    "limited",
    fact({ representability: "carry-with-named-limit", deferredWorkId: "dw-003" }),
  ],
  ["not-proven", fact({ evidenceProbative: false, deferredWorkId: "dw-004" })],
] as const) {
  expectFactOutcome(`a deferred item on a ${expected} fact`, input, expected);
}

// ---------------------------------------------------------------------------
// Organisms
// ---------------------------------------------------------------------------

if (ORGANISM_VERDICT_PRIORITY.join(" > ") !== EXPECTED_PRIORITY.join(" > ")) {
  throw new Error(
    `fail-closed priority must be ${EXPECTED_PRIORITY.join(" > ")}, got ` +
      `${ORGANISM_VERDICT_PRIORITY.join(" > ")}`,
  );
}

const provedOrganism = (): OrganismVerdictInput => ({
  dependencyOpen: null,
  factOutcomes: ["proved", "proved", "proved"],
  caseVerdicts: ["pass", "pass"],
  caseProbative: [true, true],
  coverageExact: true,
});

const organism = (overrides: Partial<OrganismVerdictInput>): OrganismVerdictInput => ({
  ...provedOrganism(),
  ...overrides,
});

function expectOrganismVerdict(
  label: string,
  input: OrganismVerdictInput,
  expected: OrganismVerdict,
): void {
  const actual = aggregateOrganismVerdict(input);
  if (actual.verdict !== expected) {
    throw new Error(
      `${label}: expected organism verdict ${expected}, got ${actual.verdict} ` +
        `(${actual.reasons.join(", ") || "no reason given"})`,
    );
  }
  if (expected !== "proved" && actual.reasons.length === 0) {
    throw new Error(`${label}: a ${expected} organism must name its reasons`);
  }
}

expectOrganismVerdict("no declared dependency, everything positive", organism({}), "proved");
expectOrganismVerdict(
  "a declared dependency whose gate is open",
  organism({ dependencyOpen: true }),
  "proved",
);

// blocked outranks the whole ladder: a wave-3 parent whose dependency receipt
// is not fresh and positive cannot report anything about itself.
expectOrganismVerdict(
  "a closed dependency over an otherwise perfect organism",
  organism({ dependencyOpen: false }),
  "blocked",
);
expectOrganismVerdict(
  "a closed dependency over a divergent, uncovered, limited organism",
  organism({
    dependencyOpen: false,
    factOutcomes: ["divergent", "not-proven", "limited"],
    caseVerdicts: ["fail", "blocked"],
    caseProbative: [false, false],
    coverageExact: false,
  }),
  "blocked",
);
expectOrganismVerdict(
  "a blocked visual case",
  organism({ caseVerdicts: ["pass", "blocked"] }),
  "blocked",
);

// divergent outranks not-proven and limited: an established defect is louder
// than a coverage hole and than a named boundary.
expectOrganismVerdict(
  "a divergent fact over an inexact coverage and a named limit",
  organism({
    factOutcomes: ["divergent", "not-proven", "limited"],
    coverageExact: false,
  }),
  "divergent",
);
expectOrganismVerdict(
  "a failing visual case",
  organism({ caseVerdicts: ["pass", "fail"] }),
  "divergent",
);

// not-proven outranks limited.  An inexact coverage (a `missing` or an
// `unexpected` fact) is the classic false green: the facts that *were* audited
// all passed, so an averaging aggregate would report success.
expectOrganismVerdict(
  "an inexact coverage over an otherwise perfect organism",
  organism({ coverageExact: false }),
  "not-proven",
);
expectOrganismVerdict(
  "an inexact coverage over a named limit",
  organism({
    coverageExact: false,
    factOutcomes: ["proved", "limited", "proved"],
  }),
  "not-proven",
);
expectOrganismVerdict(
  "a non-probative visual case",
  organism({ caseProbative: [true, false] }),
  "not-proven",
);
expectOrganismVerdict(
  "a not-proven fact",
  organism({ factOutcomes: ["proved", "not-proven", "proved"] }),
  "not-proven",
);

// limited outranks proved: one named boundary keeps the whole organism limited.
expectOrganismVerdict(
  "one limited fact among proved ones",
  organism({ factOutcomes: ["proved", "limited", "proved"] }),
  "limited",
);

// An organism that audited nothing has proved nothing.  Vacuous truth is the
// cheapest false green there is; the exact non-positive verdict is the
// implementation's to choose, but `proved` is not available to it.
const vacuous = aggregateOrganismVerdict(
  organism({ factOutcomes: [], caseVerdicts: [], caseProbative: [] }),
);
if (vacuous.verdict === "proved") {
  throw new Error("an organism with no audited fact and no visual case must not be proved");
}

// ---------------------------------------------------------------------------
// Campaign
// ---------------------------------------------------------------------------

const allProved = (): OrganismVerdict[] =>
  Array.from({ length: EXPECTED_SUBJECT_COUNT }, (): OrganismVerdict => "proved");

function expectCampaign(
  label: string,
  input: {
    subjectVerdicts: OrganismVerdict[];
    dossiersValid: boolean;
    invalidReasons?: string[];
  },
  expected: CampaignVerdict,
  expectedExitCode: 0 | 1 | 2,
): void {
  const actual = deriveCampaignVerdict(input);
  if (actual.verdict !== expected || actual.exitCode !== expectedExitCode) {
    throw new Error(
      `${label}: expected ${expected}/exit ${expectedExitCode}, got ` +
        `${actual.verdict}/exit ${actual.exitCode} ` +
        `(${actual.reasons.join(", ") || "no reason given"})`,
    );
  }
  // The exit code is the verdict, mechanically — a caller reading only the
  // process status must never learn something the report contradicts.
  if (actual.exitCode !== EXIT_CODE_BY_VERDICT[actual.verdict]) {
    throw new Error(
      `${label}: exit ${actual.exitCode} does not map to verdict ${actual.verdict}`,
    );
  }
  if (expected !== "complete" && actual.reasons.length === 0) {
    throw new Error(`${label}: a ${expected} campaign must name its reasons`);
  }
}

expectCampaign(
  "twelve proved organisms with valid dossiers",
  { subjectVerdicts: allProved(), dossiersValid: true },
  "complete",
  0,
);

// `complete` is a fidelity claim, so every one of the twelve must carry it.
// Anything else is an honestly finished campaign with red organisms — exit 1,
// never exit 0 and never `invalid`.
for (const verdict of ["blocked", "divergent", "not-proven", "limited"] as const) {
  const subjectVerdicts = allProved();
  subjectVerdicts[7] = verdict;
  expectCampaign(
    `eleven proved organisms and one ${verdict}`,
    { subjectVerdicts, dossiersValid: true },
    "complete-with-blocks",
    1,
  );
}

// A dossier that cannot be trusted invalidates the campaign even when every
// organism is green: the proof is the dossier, not the verdict field.
expectCampaign(
  "twelve proved organisms with invalid dossiers",
  { subjectVerdicts: allProved(), dossiersValid: false },
  "invalid",
  2,
);
expectCampaign(
  "a stale reference reported through invalidReasons",
  {
    subjectVerdicts: allProved(),
    dossiersValid: true,
    invalidReasons: ["reference-file-version-stale"],
  },
  "invalid",
  2,
);

// A short or padded roster is not a campaign result.  Twelve `proved` is the
// claim; eleven `proved` is a different, quieter claim wearing its badge.
for (const count of [0, 11, 13]) {
  expectCampaign(
    `a roster of ${count} organisms instead of ${EXPECTED_SUBJECT_COUNT}`,
    {
      subjectVerdicts: Array.from({ length: count }, (): OrganismVerdict => "proved"),
      dossiersValid: true,
    },
    "invalid",
    2,
  );
}

console.log(
  "✔ verdict algebra is fail-closed: blocked > divergent > not-proven > limited > proved, " +
    "a limit or a deferred item is never a pass, an inexact coverage forces not-proven, " +
    "an unlocalized mismatch is refused, and exit 0 needs all twelve proved with valid dossiers",
);
