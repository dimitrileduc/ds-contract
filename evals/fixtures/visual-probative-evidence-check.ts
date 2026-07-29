/**
 * Adversarial vectors for the minimum visual-evidence admission rule.
 *
 * This fixture is deliberately fixture-first: it owns a small, deterministic
 * oracle instead of importing the pending evidence runner.  It must stay free
 * of Figma, browser, network, and filesystem activity.  T041/T042 promote
 * these observable refusals into the campaign evidence and gate layers.
 */

type Side = "reference" | "generated";
type FailureCode =
  | "reference-blank"
  | "generated-blank"
  | "reference-invisible"
  | "generated-invisible"
  | "reference-image-missing"
  | "generated-image-missing";

interface PaintedBounds {
  width: number;
  height: number;
}

interface VisibilityReceipt {
  /** Pixels with alpha before flattening onto the shared inspection surface. */
  alphaPixels: number;
  /** Pixels that remain visible against that common surface. */
  contrastPixels: number;
  paintedBounds: PaintedBounds | null;
  /** Visible pixels in the expected image region, when an image is required. */
  imagePixels: number | null;
}

interface EvidencePair {
  reference: VisibilityReceipt;
  generated: VisibilityReceipt;
  expectedImage: boolean;
  /** A 0% diff is diagnostic only; it cannot admit non-probative evidence. */
  pixelDiffPct: number;
}

interface ProbativeVerdict {
  probative: boolean;
  reasons: FailureCode[];
}

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

const hasPaintedBounds = (bounds: PaintedBounds | null): boolean =>
  bounds !== null &&
  isPositiveInteger(bounds.width) &&
  isPositiveInteger(bounds.height);

function inspectSide(
  side: Side,
  receipt: VisibilityReceipt,
  expectedImage: boolean,
): FailureCode[] {
  const failures: FailureCode[] = [];

  // Empty alpha or no non-zero painted area means the side is blank.  Check
  // this before contrast so a blank canvas has one precise rejection reason.
  if (
    !isPositiveInteger(receipt.alphaPixels) ||
    !hasPaintedBounds(receipt.paintedBounds)
  ) {
    failures.push(`${side}-blank` as FailureCode);
    return failures;
  }

  // Opaque white ink on a white inspection surface has alpha but no useful
  // signal.  It must be refused independently of a zero pixel-diff score.
  if (!isPositiveInteger(receipt.contrastPixels))
    failures.push(`${side}-invisible` as FailureCode);

  if (expectedImage && !isPositiveInteger(receipt.imagePixels)) {
    failures.push(`${side}-image-missing` as FailureCode);
  }

  return failures;
}

function evaluateProbativeEvidence(evidence: EvidencePair): ProbativeVerdict {
  const reasons = [
    ...inspectSide("reference", evidence.reference, evidence.expectedImage),
    ...inspectSide("generated", evidence.generated, evidence.expectedImage),
  ];

  return { probative: reasons.length === 0, reasons };
}

const baseline = (): EvidencePair => ({
  reference: {
    alphaPixels: 4_096,
    contrastPixels: 2_048,
    paintedBounds: { width: 120, height: 96 },
    imagePixels: null,
  },
  generated: {
    alphaPixels: 4_096,
    contrastPixels: 2_048,
    paintedBounds: { width: 120, height: 96 },
    imagePixels: null,
  },
  expectedImage: false,
  pixelDiffPct: 0,
});

function assertVerdict(
  name: string,
  evidence: EvidencePair,
  expectedProbative: boolean,
  expectedReasons: readonly FailureCode[],
): void {
  const actual = evaluateProbativeEvidence(evidence);
  if (
    actual.probative !== expectedProbative ||
    actual.reasons.join(",") !== expectedReasons.join(",")
  ) {
    throw new Error(
      `${name}: expected probative=${expectedProbative}, reasons=${expectedReasons.join(",") || "none"}; ` +
        `got probative=${actual.probative}, reasons=${actual.reasons.join(",") || "none"}`,
    );
  }
}

assertVerdict("visible non-image evidence", baseline(), true, []);

{
  const evidence = baseline();
  evidence.reference = {
    alphaPixels: 0,
    contrastPixels: 0,
    paintedBounds: null,
    imagePixels: null,
  };
  assertVerdict("blank reference with a zero diff", evidence, false, [
    "reference-blank",
  ]);
}

{
  const evidence = baseline();
  evidence.generated = {
    alphaPixels: 0,
    contrastPixels: 0,
    paintedBounds: null,
    imagePixels: null,
  };
  assertVerdict("blank generated side with a zero diff", evidence, false, [
    "generated-blank",
  ]);
}

{
  const evidence = baseline();
  // White ink on white has an alpha footprint but is not visible evidence.
  evidence.reference.contrastPixels = 0;
  assertVerdict("invisible reference with a zero diff", evidence, false, [
    "reference-invisible",
  ]);
}

{
  const evidence = baseline();
  evidence.generated.contrastPixels = 0;
  assertVerdict("invisible generated side with a zero diff", evidence, false, [
    "generated-invisible",
  ]);
}

{
  const evidence = baseline();
  evidence.expectedImage = true;
  evidence.reference.imagePixels = 0;
  evidence.generated.imagePixels = 1_024;
  assertVerdict("missing expected reference image signal", evidence, false, [
    "reference-image-missing",
  ]);
}

{
  const evidence = baseline();
  evidence.expectedImage = true;
  evidence.reference.imagePixels = 1_024;
  evidence.generated.imagePixels = null;
  assertVerdict("missing expected generated image signal", evidence, false, [
    "generated-image-missing",
  ]);
}

console.log(
  "✔ probative evidence rejects blank/invisible reference or generated sides and missing expected image signal",
);
