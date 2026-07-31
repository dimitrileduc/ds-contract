/**
 * Adversarial vectors for the 013 pixel rule and the minimum admission bar its
 * score is allowed to speak about (research.md D7).
 *
 * The authoritative expression is exactly:
 *
 *   pixelPass = rawPct <= thresholdPct
 *               AND every(requiredRegion.score <= requiredRegion.maxDiffPct)
 *
 * `maskedDiagnosticPct` is diagnostic output.  It is not a term of that
 * expression, and this fixture proves it by moving it across its whole range
 * without ever moving a verdict.  The fixture is data-only: no Chromium, no
 * Figma, no filesystem.  It names the pure API the evidence layer consumes:
 *
 *   evaluatePixelRule({ rawPct, thresholdPct, regions, maskedDiagnosticPct? })
 *   evaluateProbative({ …visibility, equivalence and fallback receipts })
 *
 * The 011 instrument already carries the same law — `createPixelReceipt`
 * (extract/figma/visual-parity/evidence.ts:518) and `scoreDeclaredRegion`
 * (extract/figma/visual-parity/img.ts:367) — and 013 inherits it unwidened.
 */
import {
  deriveFactOutcome,
  evaluatePixelRule,
  evaluateProbative,
} from "../../extract/figma/organism-audit/verdict.js";

/** D7 — 013 keeps the historical comparator ceiling; it is never widened. */
const THRESHOLD_PCT = 2.5;

interface PixelRegionInput {
  id: string;
  score: number;
  maxDiffPct: number;
  signalPixels: number;
}

interface PixelRuleInput {
  rawPct: number;
  thresholdPct: number;
  regions: PixelRegionInput[];
  maskedDiagnosticPct?: number;
}

interface ProbativeInput {
  figmaSignalPixels: number;
  generatedSignalPixels: number;
  contrastOk: boolean;
  equivalentInputs: boolean;
  imagesDecoded: boolean;
  emptyRegions: string[];
  usedEmitHtmlFallback: boolean;
}

// ---------------------------------------------------------------------------
// The pixel rule
// ---------------------------------------------------------------------------

/** A comparison whose global score and both required regions are all inside
 *  their own budgets, on rectangles that actually carry ink. */
const passingComparison = (): PixelRuleInput => ({
  rawPct: 0.42,
  thresholdPct: THRESHOLD_PCT,
  regions: [
    { id: "titre", score: 0.31, maxDiffPct: 1, signalPixels: 3_204 },
    { id: "media", score: 0.08, maxDiffPct: 1.5, signalPixels: 12_880 },
  ],
});

function expectPixel(label: string, input: PixelRuleInput, expected: boolean): void {
  const actual = evaluatePixelRule(input);
  if (actual.pixelPass !== expected) {
    throw new Error(
      `${label}: expected pixelPass=${expected}, got ${actual.pixelPass} ` +
        `(${actual.reasons.join(", ") || "no reason given"})`,
    );
  }
  if (!expected && actual.reasons.length === 0) {
    throw new Error(`${label}: a refused comparison must name its reasons`);
  }
}

expectPixel("a comparison inside every budget", passingComparison(), true);

// THE dilution false green.  0.42 % global is a comfortable pass on its own,
// and it is exactly what hides a title block that moved: the region term is a
// hard AND, never a tiebreak a good average can outvote.
const dilution = passingComparison();
dilution.regions[0] = { id: "titre", score: 1.9, maxDiffPct: 1, signalPixels: 3_204 };
expectPixel("a local region over its own budget under a green global score", dilution, false);

// ...and the mirror: clean regions cannot rescue a global score that failed.
const globalOver = passingComparison();
globalOver.rawPct = 2.51;
expectPixel("a global score over threshold with every region clean", globalOver, false);

// Both comparisons are inclusive (`<=`), and both are exact.
const atCeiling = passingComparison();
atCeiling.rawPct = THRESHOLD_PCT;
atCeiling.regions = [{ id: "titre", score: 1, maxDiffPct: 1, signalPixels: 3_204 }];
expectPixel("a comparison sitting exactly on both ceilings", atCeiling, true);

const regionJustOver = passingComparison();
regionJustOver.regions = [{ id: "titre", score: 1.01, maxDiffPct: 1, signalPixels: 3_204 }];
expectPixel("a region one hundredth over its own budget", regionJustOver, false);

// A malformed score is not a pass.  `NaN <= threshold` is already false, so
// this vector exists to catch an inverted `!(raw > threshold)` guard.
const malformed = passingComparison();
malformed.rawPct = Number.NaN;
expectPixel("a non-finite raw score", malformed, false);

// An empty rectangle proves nothing about the pixels inside it, and it is the
// exact shape a region *chosen after observation* takes: a rectangle drawn
// around blank canvas so the divergence falls outside it.  A region is
// declared before the diff, over real ink, or it is not evidence.
const emptyRegion = passingComparison();
emptyRegion.regions = [
  { id: "titre", score: 0.31, maxDiffPct: 1, signalPixels: 3_204 },
  { id: "post-hoc", score: 0, maxDiffPct: 1, signalPixels: 0 },
];
expectPixel("a required region with no signal pixels", emptyRegion, false);

// A perfect 0 % over nothing at all is the purest false green in the suite:
// two blank surfaces agree completely.  A score never admits its own evidence.
expectPixel(
  "a flawless 0 % over regions that carry no signal",
  {
    rawPct: 0,
    thresholdPct: THRESHOLD_PCT,
    regions: [
      { id: "titre", score: 0, maxDiffPct: 1, signalPixels: 0 },
      { id: "media", score: 0, maxDiffPct: 1.5, signalPixels: 0 },
    ],
  },
  false,
);

// `maskedDiagnosticPct` is printed, never read.  Sweeping it across its whole
// range — including the 0 % a text mask manufactures and the 100 % a red
// baseline would carry — must not move a single verdict in either direction.
for (const maskedDiagnosticPct of [0, 12.5, 50, 97.5, 100]) {
  expectPixel(
    `a passing comparison reported with a masked diagnostic of ${maskedDiagnosticPct} %`,
    { ...passingComparison(), maskedDiagnosticPct },
    true,
  );
  expectPixel(
    `the region divergence reported with a masked diagnostic of ${maskedDiagnosticPct} %`,
    { ...dilution, maskedDiagnosticPct },
    false,
  );
  expectPixel(
    `the global divergence reported with a masked diagnostic of ${maskedDiagnosticPct} %`,
    { ...globalOver, maskedDiagnosticPct },
    false,
  );
}

// ---------------------------------------------------------------------------
// Probative admission
// ---------------------------------------------------------------------------

/** Both sides painted, contrasted against the shared inspection surface, fed
 *  equivalent inputs, images decoded, every declared region carrying ink, and
 *  captured from the real generated React — never an emit-html stand-in. */
const admissibleEvidence = (): ProbativeInput => ({
  figmaSignalPixels: 18_442,
  generatedSignalPixels: 17_903,
  contrastOk: true,
  equivalentInputs: true,
  imagesDecoded: true,
  emptyRegions: [],
  usedEmitHtmlFallback: false,
});

function expectProbative(label: string, input: ProbativeInput, expected: boolean): void {
  const actual = evaluateProbative(input);
  if (actual.probative !== expected) {
    throw new Error(
      `${label}: expected probative=${expected}, got ${actual.probative} ` +
        `(${actual.reasons.join(", ") || "no reason given"})`,
    );
  }
  if (!expected && actual.reasons.length === 0) {
    throw new Error(`${label}: non-probative evidence must name its reasons`);
  }
  if (expected && actual.reasons.length > 0) {
    throw new Error(
      `${label}: admissible evidence must carry no refusal reason, got ` +
        actual.reasons.join(", "),
    );
  }
}

expectProbative("visible, contrasted, equivalent evidence", admissibleEvidence(), true);

const NON_PROBATIVE_VECTORS: ReadonlyArray<readonly [string, Partial<ProbativeInput>]> = [
  ["an empty Figma reference", { figmaSignalPixels: 0 }],
  ["an empty generated render", { generatedSignalPixels: 0 }],
  ["ink that is invisible against the shared surface", { contrastOk: false }],
  ["sides fed non-equivalent inputs", { equivalentInputs: false }],
  ["an expected image that never decoded", { imagesDecoded: false }],
  ["a declared region that carries no ink", { emptyRegions: ["media"] }],
  ["a capture that fell back to emit-html", { usedEmitHtmlFallback: true }],
];

for (const [label, overrides] of NON_PROBATIVE_VECTORS) {
  const input: ProbativeInput = { ...admissibleEvidence(), ...overrides };
  expectProbative(label, input, false);

  // ...and the clause that makes the refusal matter: non-probative evidence
  // lands the fact on `not-proven`.  It is never silently dropped, and it is
  // never allowed to ride an agreeing comparison into a pass.
  const outcome = deriveFactOutcome({
    legs: { figma: true, contract: true, generated: true },
    agreement: "agree",
    evidenceProbative: evaluateProbative(input).probative,
    representability: "carry-both",
    localizedSource: null,
    deferredWorkId: null,
  }).outcome;
  if (outcome !== "not-proven") {
    throw new Error(
      `${label}: non-probative evidence must leave the fact not-proven, got ${outcome}`,
    );
  }
}

console.log(
  "✔ pixelPass is rawPct <= threshold AND every required region <= its own maxDiffPct — " +
    "a local divergence survives a green global score, the masked diagnostic never enters " +
    "the expression, a signal-free region is refused, 0 % over nothing is never enough, " +
    "and non-probative evidence lands on not-proven",
);
