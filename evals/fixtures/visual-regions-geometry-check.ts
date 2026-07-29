/**
 * Adversarial vectors for declared visual regions and independent geometry.
 *
 * This is deliberately an in-memory contract oracle: it performs no Figma,
 * browser, network, or filesystem work.  T040--T042 must preserve these
 * refusals when they promote the rules into the visual-parity runner.
 *
 * In particular, a text region has no mask input.  A mask can remain useful
 * diagnostic data elsewhere, but it must not replace this score because it
 * could erase the very glyph differences the region is required to measure.
 */
import { PNG } from "pngjs";

type Rect = { x: number; y: number; width: number; height: number };
type RegionMetric = "raw-pixel" | "signal-preserving-text";
type RegionFailure =
  | "reference-signal-below-minimum"
  | "generated-signal-below-minimum"
  | "region-threshold-exceeded";

interface RequiredRegion {
  id: string;
  rect: Rect;
  metric: RegionMetric;
  maxDiffPct: number;
  minSignalPixels: number;
}

interface RegionMeasurement {
  id: string;
  metric: RegionMetric;
  diffPct: number;
  referenceSignalPixels: number;
  generatedSignalPixels: number;
  failures: RegionFailure[];
}

const WHITE = 255;
const BLACK = 0;
const REGION_THRESHOLD_PCT = 2.5;

const makeCanvas = (width: number, height: number): PNG => {
  const png = new PNG({ width, height });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = WHITE;
    png.data[i + 1] = WHITE;
    png.data[i + 2] = WHITE;
    png.data[i + 3] = WHITE;
  }
  return png;
};

const indexFor = (png: PNG, x: number, y: number): number =>
  (y * png.width + x) * 4;

const paintBlack = (png: PNG, x: number, y: number): void => {
  const index = indexFor(png, x, y);
  png.data[index] = BLACK;
  png.data[index + 1] = BLACK;
  png.data[index + 2] = BLACK;
  png.data[index + 3] = WHITE;
};

const paintWhite = (png: PNG, x: number, y: number): void => {
  const index = indexFor(png, x, y);
  png.data[index] = WHITE;
  png.data[index + 1] = WHITE;
  png.data[index + 2] = WHITE;
  png.data[index + 3] = WHITE;
};

const GLYPHS: Record<string, readonly string[]> = {
  T: ["111", "010", "010", "010", "010"],
  a: ["000", "011", "001", "111", "101"],
  b: ["100", "100", "110", "101", "110"],
  g: ["000", "011", "101", "011", "001"],
  t: ["010", "111", "010", "010", "011"],
};

function paintText(png: PNG, text: string, x: number, y: number): void {
  for (let characterIndex = 0; characterIndex < text.length; characterIndex++) {
    const glyph = GLYPHS[text[characterIndex]];
    if (!glyph)
      throw new Error(`fixture has no glyph for ${text[characterIndex]}`);
    for (let glyphY = 0; glyphY < glyph.length; glyphY++) {
      for (let glyphX = 0; glyphX < glyph[glyphY].length; glyphX++) {
        if (glyph[glyphY][glyphX] === "1") {
          paintBlack(png, x + characterIndex * 4 + glyphX, y + glyphY);
        }
      }
    }
  }
}

const rectIsInside = (rect: Rect, png: PNG): boolean =>
  Number.isInteger(rect.x) &&
  Number.isInteger(rect.y) &&
  Number.isInteger(rect.width) &&
  Number.isInteger(rect.height) &&
  rect.width > 0 &&
  rect.height > 0 &&
  rect.x >= 0 &&
  rect.y >= 0 &&
  rect.x + rect.width <= png.width &&
  rect.y + rect.height <= png.height;

const isSignalPixel = (png: PNG, x: number, y: number): boolean => {
  const index = indexFor(png, x, y);
  return (
    png.data[index + 3] > 0 &&
    (png.data[index] !== WHITE ||
      png.data[index + 1] !== WHITE ||
      png.data[index + 2] !== WHITE)
  );
};

const pixelsMatch = (a: PNG, b: PNG, x: number, y: number): boolean => {
  const aIndex = indexFor(a, x, y);
  const bIndex = indexFor(b, x, y);
  return (
    a.data[aIndex] === b.data[bIndex] &&
    a.data[aIndex + 1] === b.data[bIndex + 1] &&
    a.data[aIndex + 2] === b.data[bIndex + 2] &&
    a.data[aIndex + 3] === b.data[bIndex + 3]
  );
};

/**
 * The required region score includes every pixel in the declared rectangle.
 * There is intentionally no text-mask argument for signal-preserving text.
 */
function measureRequiredRegion(
  reference: PNG,
  generated: PNG,
  region: RequiredRegion,
): RegionMeasurement {
  if (
    !rectIsInside(region.rect, reference) ||
    !rectIsInside(region.rect, generated)
  ) {
    throw new Error(
      `${region.id} must be a valid, predeclared region on both images`,
    );
  }

  let referenceSignalPixels = 0;
  let generatedSignalPixels = 0;
  let mismatchedPixels = 0;
  for (let y = region.rect.y; y < region.rect.y + region.rect.height; y++) {
    for (let x = region.rect.x; x < region.rect.x + region.rect.width; x++) {
      if (isSignalPixel(reference, x, y)) referenceSignalPixels++;
      if (isSignalPixel(generated, x, y)) generatedSignalPixels++;
      if (!pixelsMatch(reference, generated, x, y)) mismatchedPixels++;
    }
  }

  const diffPct =
    (mismatchedPixels / (region.rect.width * region.rect.height)) * 100;
  const failures: RegionFailure[] = [];
  if (referenceSignalPixels < region.minSignalPixels) {
    failures.push("reference-signal-below-minimum");
  }
  if (generatedSignalPixels < region.minSignalPixels) {
    failures.push("generated-signal-below-minimum");
  }
  if (diffPct > region.maxDiffPct) failures.push("region-threshold-exceeded");

  return {
    id: region.id,
    metric: region.metric,
    diffPct,
    referenceSignalPixels,
    generatedSignalPixels,
    failures,
  };
}

/** A diagnostic-only mask score, included to reproduce the tempting false green. */
function maskedDiagnosticPct(
  reference: PNG,
  generated: PNG,
  inspectionRect: Rect,
  mask: Rect,
): number {
  if (
    !rectIsInside(inspectionRect, reference) ||
    !rectIsInside(inspectionRect, generated) ||
    !rectIsInside(mask, reference)
  ) {
    throw new Error("fixture mask must be inside the inspection canvas");
  }

  let comparedPixels = 0;
  let mismatchedPixels = 0;
  for (
    let y = inspectionRect.y;
    y < inspectionRect.y + inspectionRect.height;
    y++
  ) {
    for (
      let x = inspectionRect.x;
      x < inspectionRect.x + inspectionRect.width;
      x++
    ) {
      const masked =
        x >= mask.x &&
        x < mask.x + mask.width &&
        y >= mask.y &&
        y < mask.y + mask.height;
      if (masked) continue;
      comparedPixels++;
      if (!pixelsMatch(reference, generated, x, y)) mismatchedPixels++;
    }
  }
  if (comparedPixels === 0)
    throw new Error("fixture diagnostic mask covered its entire denominator");
  return (mismatchedPixels / comparedPixels) * 100;
}

function expectRegion(
  label: string,
  measurement: RegionMeasurement,
  expectedFailures: readonly RegionFailure[],
): void {
  if (measurement.failures.join(",") !== expectedFailures.join(",")) {
    throw new Error(
      `${label}: expected ${expectedFailures.join(",") || "pass"}, got ${measurement.failures.join(",") || "pass"}; ` +
        `diff=${measurement.diffPct.toFixed(2)}%, referenceSignal=${measurement.referenceSignalPixels}, generatedSignal=${measurement.generatedSignalPixels}`,
    );
  }
}

// The text is deliberately contained in a slightly wider declared region.
// A text mask can erase all glyph differences yet leave matching blank pixels
// in its denominator, producing a diagnostic 0%.  The required text score
// must still inspect all of its declared area.
const textRegion: RequiredRegion = {
  id: "tab-label",
  rect: { x: 2, y: 2, width: 14, height: 5 },
  metric: "signal-preserving-text",
  maxDiffPct: REGION_THRESHOLD_PCT,
  minSignalPixels: 1,
};

const referenceText = makeCanvas(20, 10);
paintText(referenceText, "Tab", 2, 2);

{
  const generated = makeCanvas(20, 10);
  paintText(generated, "Tab", 2, 2);
  expectRegion(
    "identical required text",
    measureRequiredRegion(referenceText, generated, textRegion),
    [],
  );
}

for (const [label, text] of [
  ["different text", "Tag"],
  ["wrong text case", "tab"],
] as const) {
  const generated = makeCanvas(20, 10);
  paintText(generated, text, 2, 2);
  const measurement = measureRequiredRegion(
    referenceText,
    generated,
    textRegion,
  );
  expectRegion(label, measurement, ["region-threshold-exceeded"]);
  if (measurement.diffPct <= REGION_THRESHOLD_PCT) {
    throw new Error(
      `${label}: text difference was diluted below the required-region threshold`,
    );
  }

  const masked = maskedDiagnosticPct(
    referenceText,
    generated,
    { x: 0, y: 0, width: 20, height: 10 },
    { x: 2, y: 2, width: 11, height: 5 },
  );
  if (masked !== 0)
    throw new Error(
      `${label}: fixture must reproduce a masked 0%, got ${masked}%`,
    );
}

{
  const generated = makeCanvas(20, 10);
  expectRegion(
    "missing required text",
    measureRequiredRegion(referenceText, generated, textRegion),
    ["generated-signal-below-minimum", "region-threshold-exceeded"],
  );
}

// A global score can be perfectly acceptable while a small required region is
// not.  The region threshold is therefore a gate, never a diagnostic average.
const largeReference = makeCanvas(100, 100);
const largeGenerated = makeCanvas(100, 100);
for (let y = 40; y < 50; y++) {
  for (let x = 40; x < 50; x++) {
    paintBlack(largeReference, x, y);
    paintBlack(largeGenerated, x, y);
  }
}
paintWhite(largeGenerated, 40, 40);
paintWhite(largeGenerated, 41, 40);
paintWhite(largeGenerated, 42, 40);

let globalMismatches = 0;
for (let y = 0; y < largeReference.height; y++) {
  for (let x = 0; x < largeReference.width; x++) {
    if (!pixelsMatch(largeReference, largeGenerated, x, y)) globalMismatches++;
  }
}
const globalPct =
  (globalMismatches / (largeReference.width * largeReference.height)) * 100;
if (globalPct >= REGION_THRESHOLD_PCT) {
  throw new Error(
    `fixture setup requires a passing global score, got ${globalPct}%`,
  );
}

expectRegion(
  "failing required region despite passing global score",
  measureRequiredRegion(largeReference, largeGenerated, {
    id: "required-image",
    rect: { x: 40, y: 40, width: 10, height: 10 },
    metric: "raw-pixel",
    maxDiffPct: REGION_THRESHOLD_PCT,
    minSignalPixels: 90,
  }),
  ["region-threshold-exceeded"],
);

expectRegion(
  "empty required region",
  measureRequiredRegion(largeReference, largeGenerated, {
    id: "required-decoration",
    rect: { x: 0, y: 0, width: 10, height: 10 },
    metric: "raw-pixel",
    maxDiffPct: REGION_THRESHOLD_PCT,
    minSignalPixels: 1,
  }),
  ["reference-signal-below-minimum", "generated-signal-below-minimum"],
);

type GeometryVerdict = "pass" | "fail" | "justified";
type GeometryMismatch = "root" | `part:${string}`;

interface GeometryInput {
  rootFigma: Rect;
  rootGenerated: Rect;
  figmaParts: Readonly<Record<string, Rect>>;
  generatedParts: Readonly<Record<string, Rect>>;
  requiredParts: readonly string[];
  contract: unknown;
  contractJustification: string | null;
  reportExplanation: string | null;
}

interface GeometryResult {
  verdict: GeometryVerdict;
  mismatches: GeometryMismatch[];
}

const sameRect = (a: Rect | undefined, b: Rect | undefined): boolean =>
  a !== undefined &&
  b !== undefined &&
  a.x === b.x &&
  a.y === b.y &&
  a.width === b.width &&
  a.height === b.height;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Resolve only RFC 6901 JSON Pointers; an ordinary string is never proof. */
function resolveJsonPointer(
  document: unknown,
  pointer: string | null,
): unknown {
  if (!pointer || !pointer.startsWith("/")) return undefined;
  let current = document;
  for (const rawSegment of pointer.slice(1).split("/")) {
    const segment = rawSegment.replace(/~1/g, "/").replace(/~0/g, "~");
    if (Array.isArray(current)) {
      if (!/^(0|[1-9][0-9]*)$/.test(segment)) return undefined;
      current = current[Number(segment)];
    } else if (isRecord(current) && Object.hasOwn(current, segment)) {
      current = current[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

const isExplicitGeometryJustification = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.reason === "string" &&
  value.reason.trim().length > 0;

function measureGeometry(input: GeometryInput): GeometryResult {
  const mismatches: GeometryMismatch[] = [];
  // Root coordinates are measured directly.  Center padding, alpha crops,
  // translation fitting, scaling, and normalizing away a delta are forbidden.
  if (!sameRect(input.rootFigma, input.rootGenerated)) mismatches.push("root");
  for (const part of input.requiredParts) {
    if (!sameRect(input.figmaParts[part], input.generatedParts[part])) {
      mismatches.push(`part:${part}`);
    }
  }
  if (mismatches.length === 0) return { verdict: "pass", mismatches };

  const justification = resolveJsonPointer(
    input.contract,
    input.contractJustification,
  );
  const reportExplainsIt =
    typeof input.reportExplanation === "string" &&
    input.reportExplanation.trim().length > 0;
  return {
    verdict:
      isExplicitGeometryJustification(justification) && reportExplainsIt
        ? "justified"
        : "fail",
    mismatches,
  };
}

function expectGeometry(
  label: string,
  actual: GeometryResult,
  expectedVerdict: GeometryVerdict,
  expectedMismatches: readonly GeometryMismatch[],
): void {
  if (
    actual.verdict !== expectedVerdict ||
    actual.mismatches.join(",") !== expectedMismatches.join(",")
  ) {
    throw new Error(
      `${label}: expected ${expectedVerdict} (${expectedMismatches.join(",") || "no deltas"}), ` +
        `got ${actual.verdict} (${actual.mismatches.join(",") || "no deltas"})`,
    );
  }
}

const geometryContract = {
  geometry: {
    intentionalOffset: {
      reason:
        "The contract explicitly declares the published offset for this variant.",
    },
  },
};

const geometryBaseline = (): GeometryInput => ({
  rootFigma: { x: 10, y: 20, width: 120, height: 48 },
  rootGenerated: { x: 10, y: 20, width: 120, height: 48 },
  figmaParts: { icon: { x: 0.1, y: 0.25, width: 0.2, height: 0.5 } },
  generatedParts: { icon: { x: 0.1, y: 0.25, width: 0.2, height: 0.5 } },
  requiredParts: ["icon"],
  contract: geometryContract,
  contractJustification: null,
  reportExplanation: null,
});

expectGeometry(
  "exact root and required part geometry",
  measureGeometry(geometryBaseline()),
  "pass",
  [],
);

{
  const input = geometryBaseline();
  input.rootGenerated = { ...input.rootGenerated, x: 15 };
  expectGeometry(
    "shifted root cannot be automatically registered",
    measureGeometry(input),
    "fail",
    ["root"],
  );
}

{
  const input = geometryBaseline();
  input.generatedParts = {
    icon: { ...input.generatedParts.icon, width: 0.21 },
  };
  expectGeometry(
    "shifted required part cannot be normalized away",
    measureGeometry(input),
    "fail",
    ["part:icon"],
  );
}

{
  const input = geometryBaseline();
  input.generatedParts = {};
  expectGeometry("missing required part", measureGeometry(input), "fail", [
    "part:icon",
  ]);
}

{
  const input = geometryBaseline();
  input.rootGenerated = { ...input.rootGenerated, y: 19 };
  input.contractJustification = "/geometry/not-present";
  input.reportExplanation =
    "The report tries to describe an unresolvable pointer.";
  expectGeometry(
    "unresolvable contract pointer",
    measureGeometry(input),
    "fail",
    ["root"],
  );
}

{
  const input = geometryBaseline();
  input.rootGenerated = { ...input.rootGenerated, y: 19 };
  input.contractJustification = "/geometry/intentionalOffset";
  expectGeometry(
    "hidden geometry explanation",
    measureGeometry(input),
    "fail",
    ["root"],
  );
}

{
  const input = geometryBaseline();
  input.rootGenerated = { ...input.rootGenerated, y: 19 };
  input.contractJustification = "/geometry/intentionalOffset";
  input.reportExplanation =
    "The report exposes the intentional, contract-defined one-pixel offset.";
  expectGeometry(
    "explicit contract geometry justification",
    measureGeometry(input),
    "justified",
    ["root"],
  );
}

console.log(
  "✔ signal-preserving text regions, every required-region threshold, and explicit geometry justifications reject false greens",
);
