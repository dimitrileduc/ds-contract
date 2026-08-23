/**
 * VISUAL-PARITY GATE — pixels as receipts.
 *
 *   npm run extract:figma:visual [-- subject-id …] [--refresh]
 *                                [--summary] [--write-baseline]
 *
 * Per subject: render the emit-html preview per variant combo in headless
 * Chromium (2x), fetch Figma's own render of the matching variant COMPONENT
 * node (images API, scale=2, disk-cached by node+file version), perceptually
 * diff (pixelmatch), and write:
 *
 *   out/<subject>/<variant>.triptych.png   ours | figma | diff
 *   out/<subject>/<variant>.ours.png       raw screenshot (debugging)
 *   REPORT.md                              ranked WORST-FIRST
 *   report-assets/                         the worst-10 triptychs (committed)
 *
 * The authoritative unmasked score and the text-masked diagnostic both print
 * per variant next to mask coverage. A mask may explain glyph rasterization;
 * because it deletes evidence, it can never lower the pass/fail score. Skips,
 * refusals, and API declines are rows, not omissions. Every diffed row with a
 * STRICTLY POSITIVE authoritative raw score must match a NAMED cause in
 * triage.ts or the report prints it UNTRIAGED — loud, never a silent residue.
 * (014, FR-015/D8: the prior 3% dispense that let a small divergent row skip
 * causation is gone; a row exactly at 0% is not divergent and needs none.)
 *
 * STANDING-GATE MODES:
 *   --summary         no artifacts; every row's authoritative raw score
 *                     compares to the
 *                     committed baseline.json — a regression beyond
 *                     EPSILON_PP percentage points, a vanished row, or a row
 *                     the baseline has never seen FAILS the run (exit 1),
 *                     each with a named line. Reuses the disk PNG cache;
 *                     with a warm cache the run is render-only (no images
 *                     API calls). Without the cache it refetches — offline
 *                     WITHOUT a cache fails loudly on the first fetch, never
 *                     silently passes.
 *   --write-baseline  after a reviewed full run: writes baseline.json
 *                     (per-row scores + per-subject pinned render boxes for
 *                     the offline eval pin). Explicit by design — an
 *                     ordinary re-run can never move the gate.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { PNG } from "pngjs";
import { composeSubject, type RenderablePackage } from "./compose.js";
import {
  validateCampaignResult,
  validateCampaignOutputPath,
  validateVisualCampaign,
  type CampaignAssetManifest,
  type CampaignCase,
  type CampaignValidationIssue,
  type VisualCampaign,
} from "./campaign.js";
import {
  fetchNodePngs,
  fetchSetInfos,
  validateCampaignFigmaReference,
  type SetInfo,
} from "./figma-api.js";
import {
  createArtifactReceipt,
  createArtifactSetReceipt,
  createCampaignVerdictReceipt,
  createCaseVerdictReceipt,
  createGeometryReceipt,
  createImageReceipt,
  createPixelReceipt,
  createProbativeEvidenceReceipt,
  createSemanticReceipt,
  createSubjectVerdictReceipt,
  createVisibilityReceipt,
  type CaseEvidenceFailure,
  type SemanticAssertion,
  type SubjectVerdictReceipt,
} from "./evidence.js";
import {
  authoritativeScore,
  evaluateAuthoritativeGate,
  type AuthoritativeGateFailure,
  type AuthoritativeGateResult,
} from "./gate.js";
import {
  alignPair,
  diffPair,
  meanInk,
  readPng,
  scoreDeclaredRegions,
  writeTriptych,
  type Aligned,
  type DeclaredRegion,
  type DiffResult,
} from "./img.js";
import { planVariant, variantSlug } from "./match.js";
import {
  campaignCapturePageOptions,
  launchBrowser,
  renderCampaignVariant,
  renderVariant,
  // 017 — the SAME resolver the campaign path uses. Not a second mechanism:
  // the live gate finally borrows the one that was already written, proven and
  // SHA-256-verified.
  resolveComparisonOnlyProps,
  type DomSemanticReceipt,
  type Rect,
} from "./render.js";
import { PARITY_SUBJECTS, type ParitySubject } from "./subjects.js";
import { triageFor, CAUSE_LABELS, type TriageRule } from "./triage.js";
import { THRESHOLD_PCT } from "./tolerance.js";

const HERE = path.resolve(new URL(".", import.meta.url).pathname);
const REPOSITORY_ROOT = path.resolve(HERE, "../../..");
const OUT = path.join(HERE, "out");
const CACHE = path.join(OUT, "_cache");
const ASSETS = path.join(HERE, "report-assets");
const BASELINE = path.join(HERE, "baseline.json");
/** Summary mode: allowed per-row authoritative-score drift vs baseline.json, in
 *  percentage points. Absorbs antialiasing jitter only — same machine,
 *  same Chromium, scores reproduce byte-identically; this is NOT a fidelity
 *  tolerance (the scores themselves stay untouched). */
const EPSILON_PP = 0.1;

/** CLI/preflight failures are input blocks (campaign exit-code class 2), not
 * Figma/render failures.  Keeping this distinct lets malformed input fail
 * before a directory, API cache, or browser can be touched. */
class CampaignPreflightError extends Error {}

interface VisualRunArguments {
  refresh: boolean;
  summary: boolean;
  writeBaseline: boolean;
  legacySubjectFilters: string[];
  campaign: VisualCampaign | null;
  campaignOut: string | null;
  campaignPath: string | null;
  assetManifestPath: string | null;
}

interface Row {
  subject: string;
  variant: string;
  /** 017 (FR-007) — a fifth, ADDITIVE member: `incomparable`. It says the
   *  measure has NO MEANING for this row (no photo could be obtained for one
   *  side), which is a different axis from `cause`, which explains a measured
   *  gap. An incomparable row is VISIBLE and COUNTED in "Not diffed (named,
   *  never dropped)", carries NO gate score, and is never shown at 0% nor
   *  absorbed into a tolerance. It is the RECOURSE — never the first answer
   *  (FR-006a): the first answer is to lend our side the photo. */
  status: "diffed" | "skipped" | "refused" | "figma-declined" | "incomparable";
  /** 017 — MANDATORY and non-empty when status is "incomparable". Without a
   *  written reason the row refuses: an unexplained "not comparable" is exactly
   *  the silent omission this repo treats as its highest-severity bug class. */
  incomparableReason?: string;
  unmaskedPct?: number;
  maskedPct?: number | null;
  maskCoveragePct?: number;
  sizeOurs?: string;
  sizeFigma?: string;
  interaction?: string;
  comparisonSurface?: "light" | "dark";
  diagnosis: string;
  triptych?: string;
  notes: string[];
  /** Matched triage.ts rule — the row's committed named cause. */
  cause: TriageRule | null;
}

/** Committed per-row score baseline (written by --write-baseline, read by
 *  --summary and the offline eval render pin). */
interface Baseline {
  generatedAt: string;
  headCommit: string | null;
  epsilonPp: number;
  subjects: Record<
    string,
    {
      version: string;
      fontFamilies: string[];
      /** The subject's default (no-interaction) row — the offline render
       *  pin re-renders exactly this and compares the content box. */
      pinned: { variant: string; sizeOurs: string } | null;
    }
  >;
  rows: Record<
    string,
    {
      status: Row["status"];
      masked: number | null;
      unmasked: number | null;
      maskCoverage?: number | null;
      sizeOurs: string | null;
      causeClass: TriageRule["class"] | null;
    }
  >;
}

/** The browser that produced a run, recorded rather than guessed: the Playwright
 *  cache holds several revisions and chromiumExecutable() takes the highest,
 *  so a cause blaming the renderer must be able to name which one (014, FR-014). */
interface BrowserInfo {
  version: string;
  executablePath: string;
  revision: string | null;
}

const rowKey = (r: { subject: string; variant: string }) =>
  `${r.subject} :: ${r.variant}`;

const pct = (v: number | null | undefined): string =>
  v === undefined || v === null ? "—" : `${v.toFixed(2)}%`;

function diagnose(aligned: Aligned, diff: DiffResult): string {
  const parts: string[] = [];
  const dw = aligned.aContent.width - aligned.bContent.width;
  const dh = aligned.aContent.height - aligned.bContent.height;
  if (Math.abs(dw) > 4 || Math.abs(dh) > 4) {
    parts.push(
      `size ours ${aligned.aContent.width}×${aligned.aContent.height} vs figma ${aligned.bContent.width}×${aligned.bContent.height} (Δ${dw}, Δ${dh} device px)`,
    );
  }
  if (
    diff.maskedPct !== null &&
    diff.unmaskedPct - diff.maskedPct > Math.max(1.5, diff.maskedPct)
  ) {
    parts.push("text raster/family delta dominates");
  }
  const inkA = meanInk(aligned.a);
  const inkB = meanInk(aligned.b);
  const inkDelta =
    (Math.abs(inkA.r - inkB.r) +
      Math.abs(inkA.g - inkB.g) +
      Math.abs(inkA.b - inkB.b)) /
    3;
  if (inkDelta > 24) {
    const hex = (c: { r: number; g: number; b: number }) =>
      "#" +
      [c.r, c.g, c.b]
        .map((v) => Math.round(v).toString(16).padStart(2, "0"))
        .join("");
    parts.push(`overall ink differs (ours ${hex(inkA)} vs figma ${hex(inkB)})`);
  }
  if (diff.diffBox && diff.unmaskedPct > 0.05) {
    const b = diff.diffBox;
    const cx = (b.x + b.width / 2) / aligned.width;
    const cy = (b.y + b.height / 2) / aligned.height;
    const area = (b.width * b.height) / (aligned.width * aligned.height);
    if (area < 0.2) {
      const h = cx < 0.33 ? "left" : cx > 0.67 ? "right" : "center";
      const v = cy < 0.33 ? "top" : cy > 0.67 ? "bottom" : "middle";
      parts.push(`diff localized ${v}-${h} (${b.width}×${b.height}px)`);
    }
  }
  if (parts.length === 0) {
    parts.push(
      diff.unmaskedPct < 0.5
        ? "near-identical"
        : "diffuse delta — see triptych",
    );
  }
  return parts.join("; ");
}

function receiptsLine(pkg: RenderablePackage): string {
  const r = pkg.receipts;
  const bits: string[] = [];
  if (r.sessionContracts.length > 0)
    bits.push(`session scope: ${r.sessionContracts.join(", ")}`);
  if (r.capturedCount > 0) bits.push(`${r.capturedCount} captured variables`);
  if (r.capturedShadowed.length > 0)
    bits.push(`${r.capturedShadowed.length} shadowed by repo tokens`);
  if (r.mintedCount > 0) bits.push(`${r.mintedCount} minted imported.*`);
  if (r.childStubs.length > 0)
    bits.push(`child stubs: ${r.childStubs.join(", ")}`);
  if (r.proposalNotes > 0) bits.push(`${r.proposalNotes} proposal notes`);
  return bits.join("; ") || "repo tokens only";
}

function campaignIssues(issues: CampaignValidationIssue[]): string {
  return issues
    .map((issue) => `  - ${issue.code} at ${issue.path}: ${issue.message}`)
    .join("\n");
}

function isWithin(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

function readJsonPreflight(file: string, label: string): unknown {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new CampaignPreflightError(
      `${label} cannot be read as JSON (${file}): ${detail}`,
    );
  }
}

/**
 * Parse and validate the campaign entirely before main creates its output
 * directories.  This deliberately stays filesystem-read-only: the first
 * mkdir, Figma request, and Chromium launch remain below this preflight.
 */
function parseVisualRunArguments(args: string[]): VisualRunArguments {
  let refresh = false;
  let summary = false;
  let writeBaseline = false;
  let campaignArgument: string | null = null;
  let outArgument: string | null = null;
  const legacySubjectFilters: string[] = [];

  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    switch (argument) {
      case "--refresh":
        refresh = true;
        break;
      case "--summary":
        summary = true;
        break;
      case "--write-baseline":
        writeBaseline = true;
        break;
      case "--campaign":
      case "--out": {
        const value = args[++index];
        if (!value || value.startsWith("--")) {
          throw new CampaignPreflightError(
            `${argument} requires one path argument`,
          );
        }
        if (argument === "--campaign") {
          if (campaignArgument !== null)
            throw new CampaignPreflightError(
              "--campaign may be specified only once",
            );
          campaignArgument = value;
        } else {
          if (outArgument !== null)
            throw new CampaignPreflightError(
              "--out may be specified only once",
            );
          outArgument = value;
        }
        break;
      }
      default:
        if (argument.startsWith("--"))
          throw new CampaignPreflightError(
            `unknown visual-parity option: ${argument}`,
          );
        legacySubjectFilters.push(argument);
    }
  }

  if (campaignArgument === null && outArgument !== null) {
    throw new CampaignPreflightError("--out is only valid with --campaign");
  }
  if (campaignArgument !== null && outArgument === null) {
    throw new CampaignPreflightError(
      "--campaign requires a bounded --out destination",
    );
  }
  if (campaignArgument === null) {
    return {
      refresh,
      summary,
      writeBaseline,
      legacySubjectFilters,
      campaign: null,
      campaignOut: null,
      campaignPath: null,
      assetManifestPath: null,
    };
  }
  if (legacySubjectFilters.length > 0) {
    throw new CampaignPreflightError(
      "--campaign is mutually exclusive with legacy subject filters",
    );
  }

  if (outArgument === null) {
    throw new CampaignPreflightError(
      "--campaign requires a bounded --out destination",
    );
  }
  const campaignOut = outArgument;
  const campaignPath = path.resolve(process.cwd(), campaignArgument);
  if (!isWithin(REPOSITORY_ROOT, campaignPath)) {
    throw new CampaignPreflightError(
      "--campaign must name a repository-local campaign JSON file",
    );
  }
  const candidate = readJsonPreflight(campaignPath, "visual campaign");

  // Validate the document's shape and path declarations before using its
  // assetsManifest value to read any second file.
  const shape = validateVisualCampaign(candidate);
  if (!shape.ok) {
    throw new CampaignPreflightError(
      `invalid visual campaign:\n${campaignIssues(shape.issues)}`,
    );
  }
  const assetManifestPath = path.resolve(
    REPOSITORY_ROOT,
    shape.value.assetsManifest,
  );
  if (!isWithin(REPOSITORY_ROOT, assetManifestPath)) {
    // This should be impossible after validateVisualCampaign, but keeps the
    // boundary explicit if the validator's path policy ever changes.
    throw new CampaignPreflightError(
      "campaign assetsManifest resolves outside the repository",
    );
  }
  const assetManifest = readJsonPreflight(
    assetManifestPath,
    "campaign assets manifest",
  ) as CampaignAssetManifest;
  const campaignValidation = validateVisualCampaign(candidate, {
    assetManifest,
  });
  if (!campaignValidation.ok) {
    throw new CampaignPreflightError(
      `invalid visual campaign:\n${campaignIssues(campaignValidation.issues)}`,
    );
  }

  // A campaign id owns exactly one feature-proof root.  The optional output
  // path may select that root or a nested retry/scratch directory, never a
  // repository-wide or sibling campaign location.
  const campaignOutputRoot = path.join(
    REPOSITORY_ROOT,
    "specs",
    campaignValidation.value.id,
    "proofs",
    "visual",
  );
  const output = validateCampaignOutputPath(
    path.resolve(process.cwd(), campaignOut),
    campaignOutputRoot,
  );
  if (!output.ok) {
    throw new CampaignPreflightError(
      `invalid campaign --out:\n${campaignIssues(output.issues)}`,
    );
  }

  return {
    refresh,
    summary,
    writeBaseline,
    legacySubjectFilters,
    campaign: campaignValidation.value,
    campaignOut: output.outputPath,
    campaignPath,
    assetManifestPath,
  };
}

/**
 * Campaign receipt → process-status policy.
 *
 * This is deliberately pure and campaign-only.  The historical runner below
 * keeps its baseline/summary semantics exactly as they are; a campaign caller
 * can combine its case admission receipt with the independent authoritative
 * gate result and apply the resulting `exitCode` after it has written its own
 * proof artifacts.
 */
export interface CampaignEvidenceVerdictInput {
  /** Failures already classified by evidence.ts for one or more cases. */
  evidenceFailures?: readonly CaseEvidenceFailure[];
  /** The gate independently rechecks pixels, regions, visibility, geometry,
   * and semantics.  Its failures must not be ignored by an aggregate receipt. */
  gate?: Pick<AuthoritativeGateResult, "passed" | "failures"> | null;
}

export interface CampaignEvidenceVerdict {
  verdict: "pass" | "fail" | "blocked";
  exitCode: 0 | 1 | 2;
  /** Stable, sorted failure names suitable for a machine result/report. */
  reasons: string[];
}

const BLOCKING_EVIDENCE_FAILURES = new Set<CaseEvidenceFailure>([
  "coverage-incomplete",
  "stale-reference",
  "asset-missing",
  "asset-invalid",
  "render-refused",
  // A blank, invisible, or otherwise non-probative side is not an ordinary
  // visual miss: it cannot support a meaningful pixel verdict.
  "non-probative",
  "geometry-fail",
  "artifact-missing",
]);

const BLOCKING_GATE_FAILURES = new Set<AuthoritativeGateFailure>([
  "global-score-missing",
  "required-region-missing",
  "visibility-receipt-missing",
  "visibility-receipt-failed",
  "geometry-receipt-missing",
  "geometry-receipt-failed",
  "semantic-receipt-missing",
]);

/**
 * Map only receipt facts; this function neither touches Figma nor changes
 * artifacts.  A structural/proof refusal wins over a visual failure, so an
 * incomplete campaign is always `blocked` (2), never a misleading `fail`.
 */
export function mapCampaignEvidenceVerdict(
  input: CampaignEvidenceVerdictInput,
): CampaignEvidenceVerdict {
  const evidenceFailures = [...new Set(input.evidenceFailures ?? [])].sort();
  const gateFailures = [...new Set(input.gate?.failures ?? [])].sort();
  const reasons = [
    ...evidenceFailures,
    ...gateFailures,
    ...(input.gate && !input.gate.passed && gateFailures.length === 0
      ? ["gate-indeterminate"]
      : []),
  ].sort();

  const blocked =
    evidenceFailures.some((failure) =>
      BLOCKING_EVIDENCE_FAILURES.has(failure),
    ) ||
    gateFailures.some((failure) => BLOCKING_GATE_FAILURES.has(failure)) ||
    reasons.includes("gate-indeterminate");
  if (blocked) return { verdict: "blocked", exitCode: 2, reasons };
  if (reasons.length > 0) return { verdict: "fail", exitCode: 1, reasons };
  return { verdict: "pass", exitCode: 0, reasons };
}

// ---------------------------------------------------------------------------
// Versioned visual campaign — bounded feature-proof artifacts
// ---------------------------------------------------------------------------

/** campaign.ts intentionally validates the stable v1 core only.  These are
 * optional, additive fields owned by the 011 evidence contract, kept local so
 * a future v2 can evolve them without widening the generic validator. */
interface CampaignRegionDeclaration {
  id: string;
  source: "root" | "part" | "explicit-normalized-rect";
  partName?: string;
  rect?: { x: number; y: number; width: number; height: number };
  metric: "raw-pixel" | "signal-preserving-text";
  maxDiffPct: number;
  minSignalPixels: number;
}

interface CampaignCaseRuntime extends CampaignCase {
  figmaVariant?: string | null;
  observedProperties?: Record<string, string | boolean>;
  codeProps?: Record<string, unknown>;
  /** Captured content for a declared restricted slot, validated by render.ts
   * against the existing parent/child contracts before browser capture. */
  slotOverrides?: unknown;
  layoutContext?: {
    rootWidth?: "figma-root";
    rootHeight?: "figma-root";
    partWidths?: string[];
  };
  fixtureAssetIds?: string[];
  comparisonSurface?: "light" | "dark";
  requiredRegions?: CampaignRegionDeclaration[];
  requiredParts?: string[];
  semanticAssertions?: SemanticAssertion[];
  /** Optional Figma part geometry is accepted only when a later read-only
   * extractor has measured it.  Absent measurements remain a blocked receipt. */
  figmaParts?: Record<string, Rect>;
  /** Immutable Figma descendant ids resolved by the read-only reference GET. */
  figmaPartNodeIds?: Record<string, string>;
  geometryJustification?: {
    contractPointer?: string;
    reportExplanation?: string;
  };
  status?: string;
  blockedReason?: string;
}

interface CampaignSubjectRuntime {
  id: string;
  contractId: string;
  contractVersion: string;
  figmaSetNodeId: string;
  cases: CampaignCaseRuntime[];
  coverage?: { requiredFactIds?: string[] };
  requiredCaseIds?: string[];
}

interface CampaignBlockedCondition {
  id: string;
  subjectId?: string;
  reason?: string;
  verdict?: string;
  exitCode?: number;
  evidence?: unknown;
  resolution?: unknown;
}

interface CampaignRuntime extends Omit<VisualCampaign, "subjects"> {
  subjects: CampaignSubjectRuntime[];
  blockedConditions?: CampaignBlockedCondition[];
}

interface CampaignCaseOutput {
  id: string;
  subjectId: string;
  verdict: "pass" | "fail" | "blocked";
  probative: boolean;
  reasons: string[];
  namedBlockedConditions: string[];
  figma: Record<string, unknown>;
  contract: Record<string, unknown>;
  visibility: unknown;
  images: unknown[];
  geometry: unknown;
  pixels: unknown;
  semantics: unknown[];
  artifacts: unknown[];
  gate: unknown;
}

const CASE_EVIDENCE_FAILURES = new Set<CaseEvidenceFailure>([
  "coverage-incomplete",
  "stale-reference",
  "asset-missing",
  "asset-invalid",
  "render-refused",
  "non-probative",
  "geometry-fail",
  "pixel-fail",
  "semantic-fail",
  "artifact-missing",
]);

const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

const safeRelative = (root: string, file: string): string =>
  path.relative(root, file).split(path.sep).join("/");

function sha256(contents: string | Uint8Array): string {
  return createHash("sha256").update(contents).digest("hex");
}

/** A content-only tree hash: traversal order, paths, and bytes are explicit;
 * mtimes, permissions, and the campaign output itself never affect it. */
function hashTree(root: string): string {
  const hash = createHash("sha256");
  const visit = (directory: string): void => {
    for (const name of readdirSync(directory).sort()) {
      const file = path.join(directory, name);
      const stat = statSync(file);
      if (stat.isDirectory()) {
        visit(file);
      } else if (stat.isFile()) {
        hash.update(safeRelative(root, file));
        hash.update("\0");
        hash.update(readFileSync(file));
        hash.update("\0");
      }
    }
  };
  visit(root);
  return hash.digest("hex");
}

function hashCampaignInputs(
  campaignPath: string,
  assetManifestPath: string,
): Record<
  "campaign" | "contracts" | "assetsManifest" | "generatedTree",
  string
> {
  const generatedInputs = [
    path.join(REPOSITORY_ROOT, "core"),
    path.join(REPOSITORY_ROOT, "src", "styles"),
    path.join(REPOSITORY_ROOT, "extract", "figma", "visual-parity", "img.ts"),
    path.join(
      REPOSITORY_ROOT,
      "extract",
      "figma",
      "visual-parity",
      "render.ts",
    ),
  ];
  const generated = createHash("sha256");
  for (const input of generatedInputs) {
    generated.update(safeRelative(REPOSITORY_ROOT, input));
    generated.update("\0");
    generated.update(
      statSync(input).isDirectory()
        ? hashTree(input)
        : sha256(readFileSync(input)),
    );
    generated.update("\0");
  }
  return {
    campaign: sha256(readFileSync(campaignPath)),
    contracts: hashTree(path.join(REPOSITORY_ROOT, "contracts")),
    assetsManifest: sha256(readFileSync(assetManifestPath)),
    generatedTree: generated.digest("hex"),
  };
}

function declaredCaseFailure(
  value: string | undefined,
): CaseEvidenceFailure | null {
  return value && CASE_EVIDENCE_FAILURES.has(value as CaseEvidenceFailure)
    ? (value as CaseEvidenceFailure)
    : null;
}

function caseOutputDirectory(casesRoot: string, caseId: string): string {
  const directory = path.resolve(casesRoot, caseId);
  if (!isWithin(casesRoot, directory) || directory === casesRoot) {
    throw new CampaignPreflightError(
      `campaign case id resolves outside cases/: ${caseId}`,
    );
  }
  return directory;
}

function campaignConditions(
  campaign: CampaignRuntime,
  subjectId: string,
): CampaignBlockedCondition[] {
  return (campaign.blockedConditions ?? [])
    .filter(
      (condition) =>
        condition?.subjectId === subjectId && condition.verdict === "blocked",
    )
    .sort((left, right) => left.id.localeCompare(right.id));
}

function blankImage(): { width: number; height: number; data: Uint8Array } {
  return { width: 0, height: 0, data: new Uint8Array() };
}

function requiredRegionIds(campaignCase: CampaignCaseRuntime): string[] {
  return (campaignCase.requiredRegions ?? [])
    .map((region) => region.id)
    .filter((id) => typeof id === "string" && id.length > 0);
}

function semanticActual(
  assertion: SemanticAssertion,
  probe: DomSemanticReceipt | undefined,
): unknown {
  if (!probe || probe.selectorError || probe.matches.length !== 1)
    return undefined;
  const node = probe.matches[0];
  if (assertion.assertion === "element") return node.tagName;
  if (assertion.assertion === "attribute") {
    if (
      !assertion.expected ||
      typeof assertion.expected !== "object" ||
      Array.isArray(assertion.expected)
    )
      return undefined;
    return Object.fromEntries(
      Object.keys(assertion.expected as Record<string, unknown>)
        .sort()
        .map((name) => [
          name,
          name === "tabIndex"
            ? String(node.tabIndex)
            : (node.attributes[name] ?? null),
        ]),
    );
  }
  if (assertion.assertion === "relationship") {
    return {
      width:
        node.parent.box && node.box.width === node.parent.box.width
          ? "fill"
          : "hug",
    };
  }
  if (assertion.assertion === "keyboard-context") {
    const selected = node.tabStops.filter(
      (tab) => tab.ariaSelected === "true",
    ).length;
    const focusable = node.tabStops.filter((tab) => tab.tabIndex === 0).length;
    return {
      id: node.attributes.id ?? null,
      rovingFocus:
        node.tabStops.length > 0 && selected === 1 && focusable === 1,
    };
  }
  return undefined;
}

function alignedRect(aligned: Aligned, rect: Rect): Rect {
  return {
    x: rect.x - aligned.aTrimOrigin.x + aligned.aOffset.x,
    y: rect.y - aligned.aTrimOrigin.y + aligned.aOffset.y,
    width: rect.width,
    height: rect.height,
  };
}

function visibleAlignedRect(aligned: Aligned, rect: Rect): Rect {
  const left = Math.max(0, rect.x);
  const top = Math.max(0, rect.y);
  const right = Math.min(aligned.width, rect.x + rect.width);
  const bottom = Math.min(aligned.height, rect.y + rect.height);
  if (right <= left || bottom <= top) {
    throw new Error("declared region has no visible pixels inside the aligned comparison canvas");
  }
  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

/** Resolve only predeclared regions.  A missing generated part does not get
 * guessed from pixels: it leaves the authoritative gate blocked. */
function campaignRegions(
  campaignCase: CampaignCaseRuntime,
  aligned: Aligned,
  root: Rect,
  parts: Record<string, Rect> | undefined,
): { regions: DeclaredRegion[]; error: string | null } {
  const rootRect = alignedRect(aligned, root);
  const regions: DeclaredRegion[] = [];
  try {
    for (const declaration of campaignCase.requiredRegions ?? []) {
      let rect: Rect;
      if (declaration.source === "root") {
        // The global/root region is the exact aligned comparison artifact.
        // Root layout can include transparent CSS box area which content trim
        // legitimately removes; asking the scorer for pixels outside the PNG
        // used to turn otherwise valid cases into "rect outside canvas".
        rect = { x: 0, y: 0, width: aligned.width, height: aligned.height };
      } else if (declaration.source === "part") {
        const part = declaration.partName
          ? parts?.[declaration.partName]
          : undefined;
        if (!part)
          throw new Error(
            `${declaration.id}: generated required part "${declaration.partName ?? ""}" is absent`,
          );
        rect = visibleAlignedRect(aligned, alignedRect(aligned, part));
      } else if (declaration.source === "explicit-normalized-rect") {
        const normal = declaration.rect;
        if (!normal)
          throw new Error(`${declaration.id}: normalized rectangle is absent`);
        rect = visibleAlignedRect(aligned, {
          x: rootRect.x + normal.x * rootRect.width,
          y: rootRect.y + normal.y * rootRect.height,
          width: normal.width * rootRect.width,
          height: normal.height * rootRect.height,
        });
      } else {
        throw new Error(`${declaration.id}: unsupported region source`);
      }
      regions.push({
        id: declaration.id,
        rect,
        metric: declaration.metric,
        maxDiffPct: declaration.maxDiffPct,
        minSignalPixels: declaration.minSignalPixels,
      });
    }
    return { regions, error: null };
  } catch (error) {
    return {
      regions: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function writeCampaignMetadata(
  outputRoot: string,
  caseDirectory: string,
  metadata: Record<string, unknown>,
): ReturnType<typeof createArtifactReceipt> {
  const file = path.join(caseDirectory, "metadata.json");
  const contents = json(metadata);
  writeFileSync(file, contents);
  return createArtifactReceipt({
    kind: "metadata",
    path: safeRelative(outputRoot, file),
    contents,
  });
}

function pngArtifact(
  outputRoot: string,
  file: string,
  kind: "reference" | "generated" | "diff" | "triptych",
) {
  const contents = readFileSync(file);
  const png = readPng(contents);
  return createArtifactReceipt({
    kind,
    path: safeRelative(outputRoot, file),
    contents,
    width: png.width,
    height: png.height,
  });
}

function caseDetail(
  subject: CampaignSubjectRuntime,
  campaignCase: CampaignCaseRuntime,
  receipt: ReturnType<typeof createCaseVerdictReceipt>,
  gate: ReturnType<typeof evaluateAuthoritativeGate>,
  mapped: CampaignEvidenceVerdict,
  namedBlockedConditions: string[],
  figma: Record<string, unknown>,
): CampaignCaseOutput {
  return {
    id: campaignCase.id,
    subjectId: subject.id,
    verdict: mapped.verdict,
    probative: receipt.probative,
    reasons: mapped.reasons,
    namedBlockedConditions,
    figma,
    contract: {
      id: subject.contractId,
      version: subject.contractVersion,
      factIds: [...campaignCase.factIds],
      codeProps: campaignCase.codeProps ?? {},
      slotOverrides: campaignCase.slotOverrides ?? {},
    },
    visibility: receipt.visibility,
    images: receipt.images,
    geometry: receipt.geometry,
    pixels: receipt.pixels,
    semantics: receipt.semantics,
    artifacts: receipt.artifacts,
    gate,
  };
}

/** Write a reviewable blocked receipt rather than omitting a case when a
 * reference, render, or declared geometry cannot support evidence. */
function writeBlockedCampaignCase(
  outputRoot: string,
  subject: CampaignSubjectRuntime,
  campaignCase: CampaignCaseRuntime,
  admissionFailures: readonly CaseEvidenceFailure[],
  namedBlockedConditions: string[],
  figma: Record<string, unknown>,
): CampaignCaseOutput {
  const caseDirectory = caseOutputDirectory(
    path.join(outputRoot, "cases"),
    campaignCase.id,
  );
  mkdirSync(caseDirectory, { recursive: true });
  const figmaVisibility = createVisibilityReceipt({
    side: "figma",
    image: blankImage(),
    surface: campaignCase.comparisonSurface ?? "light",
  });
  const generatedVisibility = createVisibilityReceipt({
    side: "generated",
    image: blankImage(),
    surface: campaignCase.comparisonSurface ?? "light",
  });
  const probative = createProbativeEvidenceReceipt(
    figmaVisibility,
    generatedVisibility,
  );
  const geometry = createGeometryReceipt({
    rootFigma: null,
    rootGenerated: null,
    requiredParts: campaignCase.requiredParts ?? [],
  });
  const pixels = createPixelReceipt({
    diff: { unmaskedPct: Number.NaN, maskedPct: null, maskCoveragePct: 0 },
    regions: {},
    requiredRegionIds: requiredRegionIds(campaignCase),
    thresholdPct: THRESHOLD_PCT,
  });
  const gate = evaluateAuthoritativeGate({
    pixels,
    visibility: probative,
    geometry,
    requiredSemanticAssertionIds: (campaignCase.semanticAssertions ?? []).map(
      (assertion) => assertion.id,
    ),
    semantics: [],
  });
  const metadata = writeCampaignMetadata(outputRoot, caseDirectory, {
    schemaVersion: 1,
    caseId: campaignCase.id,
    subjectId: subject.id,
    status: "blocked-before-capture",
    admissionFailures: [...new Set(admissionFailures)].sort(),
    namedBlockedConditions,
    figma,
  });
  const artifacts = createArtifactSetReceipt([metadata]);
  const receipt = createCaseVerdictReceipt({
    id: campaignCase.id,
    subjectId: subject.id,
    admissionFailures,
    probative,
    geometry,
    pixels,
    semantics: [],
    artifacts,
  });
  const mapped = mapCampaignEvidenceVerdict({
    evidenceFailures: receipt.reasons,
    gate,
  });
  return caseDetail(
    subject,
    campaignCase,
    receipt,
    gate,
    mapped,
    namedBlockedConditions,
    figma,
  );
}

function campaignReport(
  campaign: CampaignRuntime,
  outputRoot: string,
  result: {
    coverage: {
      expected: string[];
      observed: string[];
      missing: string[];
      unexpected: string[];
    };
    subjects: SubjectVerdictReceipt[];
    cases: CampaignCaseOutput[];
    verdict: string;
    exitCode: number;
    reasons: string[];
  },
): void {
  const subjectRows = result.subjects
    .map(
      (subject) =>
        `| ${subject.id} | ${subject.requiredCaseIds?.length ?? 0} | ${subject.passing ?? 0} | ${subject.failing ?? 0} | ${subject.blocked ?? 0} | ${subject.verdict} |`,
    )
    .join("\n");
  const traceRows =
    result.cases
      .flatMap((campaignCase) => {
        const facts = (campaignCase.contract.factIds as string[]) ?? [];
        return facts.map((fact) => {
          const artifacts = campaignCase.artifacts as Array<{
            kind?: string;
            path?: string;
          }>;
          const evidence = ["reference", "generated", "diff", "triptych"]
            .map(
              (kind) =>
                artifacts.find((artifact) => artifact.kind === kind)?.path ??
                "missing",
            )
            .join(" · ");
          return `| ${campaignCase.subjectId} | ${campaignCase.id} | ${fact} | v${campaign.reference.fileVersion} / ${String(campaignCase.figma.nodeId ?? "missing")} | ${campaignCase.contract.id} v${campaignCase.contract.version} | ${evidence} | ${campaignCase.verdict}: ${campaignCase.reasons.join(", ") || "none"} |`;
        });
      })
      .join("\n") ||
    "| _none_ | _none_ | _none_ | _none_ | _none_ | _none_ | blocked |";
  const namedLimits =
    result.cases
      .filter((campaignCase) => campaignCase.namedBlockedConditions.length > 0)
      .map(
        (campaignCase) =>
          `- ${campaignCase.subjectId}/${campaignCase.id}: ${campaignCase.namedBlockedConditions.join(", ")}`,
      )
      .join("\n") || "_none_";
  const md = `# Visual campaign — ${campaign.id}

**Verdict:** \`${result.verdict}\` (exit ${result.exitCode})
**Machine receipt:** [result.json](result.json)

## Seven-verdict review index

| target | required cases | passing | failing | blocked | verdict |
|---|---:|---:|---:|---:|---|
${subjectRows}

## Coverage

- expected: ${result.coverage.expected.length}
- observed: ${result.coverage.observed.length}
- missing: ${result.coverage.missing.join(", ") || "_none_"}
- unexpected: ${result.coverage.unexpected.join(", ") || "_none_"}

## Traceability matrix

| target | caseId | figmaFactId | figmaReference | contractFact | evidence | verdict |
|---|---|---|---|---|---|---|
${traceRows}

## Named limits and unresolved failures

${namedLimits}

Campaign reasons: ${result.reasons.join(", ") || "_none_"}. Each case directory is bounded below [cases/](${safeRelative(outputRoot, path.join(outputRoot, "cases"))}/); missing artifacts are explicitly blocked in its metadata rather than replaced with a synthetic image.
`;
  writeFileSync(path.join(outputRoot, "REPORT.md"), md);
}

function campaignAdmissionFailures(
  campaignCase: CampaignCaseRuntime,
  conditions: readonly CampaignBlockedCondition[],
): CaseEvidenceFailure[] {
  const failures = conditions
    .map(
      (condition) =>
        declaredCaseFailure(condition.reason) ?? "coverage-incomplete",
    )
    .concat(declaredCaseFailure(campaignCase.blockedReason) ?? []);
  return [...new Set(failures)].sort();
}

function manifestAssets(
  manifest: unknown,
): Map<string, { sha256?: string; width?: number; height?: number }> {
  const assets =
    manifest && typeof manifest === "object" && !Array.isArray(manifest)
      ? (manifest as { assets?: unknown }).assets
      : undefined;
  if (!Array.isArray(assets)) return new Map();
  return new Map(
    assets
      .filter(
        (
          asset,
        ): asset is {
          id: string;
          sha256?: string;
          width?: number;
          height?: number;
        } =>
          !!asset &&
          typeof asset === "object" &&
          typeof (asset as { id?: unknown }).id === "string",
      )
      .map((asset) => [asset.id, asset]),
  );
}

/** Capture campaign cases one-by-one while retaining every refusal as a
 * complete blocked case receipt.  It deliberately has no legacy report or
 * baseline side effects. */
async function captureCampaignCases(
  campaign: CampaignRuntime,
  outputRoot: string,
  conditionsBySubject: Map<string, CampaignBlockedCondition[]>,
  outputCases: CampaignCaseOutput[],
  referenceValidation: Awaited<
    ReturnType<typeof validateCampaignFigmaReference>
  >,
): Promise<void> {
  const assetManifest = readJsonPreflight(
    path.resolve(REPOSITORY_ROOT, campaign.assetsManifest),
    "campaign assets manifest",
  );
  const assets = manifestAssets(assetManifest);
  const subjectById = new Map(
    PARITY_SUBJECTS.map((subject) => [subject.id, subject]),
  );
  const setInfos = new Map<string, SetInfo>();
  const setFailures = new Map<string, string>();

  for (const subject of campaign.subjects) {
    const paritySubject = subjectById.get(subject.id);
    if (!paritySubject) {
      setFailures.set(
        subject.id,
        "the campaign subject has no visual-parity renderer registration",
      );
      continue;
    }
    if (
      paritySubject.fileKey !== campaign.reference.fileKey ||
      paritySubject.setNodeId !== subject.figmaSetNodeId
    ) {
      setFailures.set(
        subject.id,
        "campaign Figma anchor does not match the renderer registration",
      );
      continue;
    }
    try {
      // Campaign mode always refreshes this small GET receipt.  A warm legacy
      // cache may accelerate PNG downloads, but can never override the pinned
      // Figma version that was just validated above.
      const infos = await fetchSetInfos(
        CACHE,
        campaign.reference.fileKey,
        [subject.figmaSetNodeId],
        true,
      );
      const info = infos.get(subject.figmaSetNodeId);
      if (!info) throw new Error("nodes API returned no set information");
      if (info.version !== campaign.reference.fileVersion) {
        throw new Error(
          `Figma set version ${info.version} does not equal pinned ${campaign.reference.fileVersion}`,
        );
      }
      setInfos.set(subject.id, info);
    } catch (error) {
      setFailures.set(
        subject.id,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  let launch: Awaited<ReturnType<typeof launchBrowser>> | null = null;
  let page: Awaited<
    ReturnType<Awaited<ReturnType<typeof launchBrowser>>["browser"]["newPage"]>
  > | null = null;
  try {
    if (setInfos.size > 0) {
      launch = await launchBrowser();
      page = await launch.browser.newPage(
        campaignCapturePageOptions({ width: 1600, height: 1200 }),
      );
    }
    for (const subject of campaign.subjects) {
      const conditions = conditionsBySubject.get(subject.id) ?? [];
      const namedConditions = conditions.map((condition) => condition.id);
      const admission = campaignAdmissionFailures(
        { id: "", figmaNodeId: "", factIds: [] },
        conditions,
      );
      const subjectFailure = setFailures.get(subject.id);
      const paritySubject = subjectById.get(subject.id);
      const info = setInfos.get(subject.id);
      if (subjectFailure || !paritySubject || !info || !page) {
        for (const campaignCase of subject.cases) {
          outputCases.push(
            writeBlockedCampaignCase(
              outputRoot,
              subject,
              campaignCase,
              [
                ...admission,
                subjectFailure?.includes("version")
                  ? "stale-reference"
                  : "render-refused",
              ],
              namedConditions,
              {
                nodeId: campaignCase.figmaNodeId,
                setNodeId: subject.figmaSetNodeId,
                error: subjectFailure ?? "browser unavailable",
              },
            ),
          );
        }
        continue;
      }

      let pkg: RenderablePackage;
      try {
        pkg = composeSubject(paritySubject);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        for (const campaignCase of subject.cases) {
          outputCases.push(
            writeBlockedCampaignCase(
              outputRoot,
              subject,
              campaignCase,
              [...admission, "render-refused"],
              namedConditions,
              {
                nodeId: campaignCase.figmaNodeId,
                setNodeId: subject.figmaSetNodeId,
                error: message,
              },
            ),
          );
        }
        continue;
      }

      let references: Map<string, string | null>;
      try {
        references = await fetchNodePngs(
          CACHE,
          campaign.reference.fileKey,
          subject.figmaSetNodeId,
          campaign.reference.fileVersion,
          [
            ...new Set(
              subject.cases.map((campaignCase) => campaignCase.figmaNodeId),
            ),
          ],
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        for (const campaignCase of subject.cases) {
          outputCases.push(
            writeBlockedCampaignCase(
              outputRoot,
              subject,
              campaignCase,
              [...admission, "stale-reference"],
              namedConditions,
              {
                nodeId: campaignCase.figmaNodeId,
                setNodeId: subject.figmaSetNodeId,
                version: info.version,
                error: message,
              },
            ),
          );
        }
        continue;
      }

      for (const campaignCase of subject.cases) {
        const figmaPngPath = references.get(campaignCase.figmaNodeId);
        const variantName =
          campaignCase.figmaVariant ??
          info.variants.find(
            (variant) => variant.nodeId === campaignCase.figmaNodeId,
          )?.name ??
          "";
        const plan = planVariant(pkg.contract, variantName);
        const caseAdmission = campaignAdmissionFailures(
          campaignCase,
          conditions,
        );
        const figma = {
          nodeId: campaignCase.figmaNodeId,
          setNodeId: subject.figmaSetNodeId,
          version: info.version,
          observedProperties: campaignCase.observedProperties ?? {},
        };
        const referenceReceipt = referenceValidation.nodes.find(
          (receipt) =>
            receipt.kind === "case" &&
            receipt.subjectId === subject.id &&
            receipt.caseId === campaignCase.id,
        );
        if (!figmaPngPath) {
          outputCases.push(
            writeBlockedCampaignCase(
              outputRoot,
              subject,
              campaignCase,
              [...caseAdmission, "non-probative"],
              namedConditions,
              {
                ...figma,
                error: "Figma images API declined to render the pinned node",
              },
            ),
          );
          continue;
        }
        if (!plan.ok) {
          outputCases.push(
            writeBlockedCampaignCase(
              outputRoot,
              subject,
              campaignCase,
              [...caseAdmission, "render-refused"],
              namedConditions,
              { ...figma, error: plan.reason },
            ),
          );
          continue;
        }
        let rendered: Awaited<ReturnType<typeof renderCampaignVariant>>;
        try {
          const contextRootWidth =
            campaignCase.layoutContext?.rootWidth === "figma-root"
              ? referenceReceipt?.geometry?.root?.width
              : undefined;
          if (campaignCase.layoutContext?.rootWidth === "figma-root" && (!contextRootWidth || contextRootWidth <= 0)) {
            throw new Error("layoutContext.rootWidth=figma-root requires a positive root geometry from the pinned GET receipt");
          }
          const contextRootHeight =
            campaignCase.layoutContext?.rootHeight === "figma-root"
              ? referenceReceipt?.geometry?.root?.height
              : undefined;
          if (campaignCase.layoutContext?.rootHeight === "figma-root" && (!contextRootHeight || contextRootHeight <= 0)) {
            throw new Error("layoutContext.rootHeight=figma-root requires a positive root geometry from the pinned GET receipt");
          }
          const requestedPartWidths = campaignCase.layoutContext?.partWidths ?? [];
          const contextPartWidths = Object.fromEntries(
            requestedPartWidths.map((partName) => {
              const width = referenceReceipt?.geometry?.parts[partName]?.width;
              if (!width || width <= 0) {
                throw new Error(
                  `layoutContext.partWidths includes "${partName}", but the pinned GET receipt has no positive geometry for that named part`,
                );
              }
              return [partName, width];
            }),
          );
          rendered = await renderCampaignVariant(
            page,
            pkg,
            plan.subst,
            plan.bools,
            plan.interaction,
            info.fontFamilies,
            {
              codeProps: campaignCase.codeProps,
              slotOverrides: campaignCase.slotOverrides,
              fixtureAssetIds: campaignCase.fixtureAssetIds,
              assetManifest,
              semanticAssertions: campaignCase.semanticAssertions,
              comparisonSurface: campaignCase.comparisonSurface,
            },
            contextRootWidth,
            contextPartWidths,
            contextRootHeight,
          );
        } catch (error) {
          rendered = {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
        if (!rendered.ok) {
          outputCases.push(
            writeBlockedCampaignCase(
              outputRoot,
              subject,
              campaignCase,
              [...caseAdmission, "render-refused"],
              namedConditions,
              { ...figma, error: rendered.error },
            ),
          );
          continue;
        }

        const caseDirectory = caseOutputDirectory(
          path.join(outputRoot, "cases"),
          campaignCase.id,
        );
        mkdirSync(caseDirectory, { recursive: true });
        const referenceFile = path.join(caseDirectory, "figma.png");
        const generatedFile = path.join(caseDirectory, "generated.png");
        const diffFile = path.join(caseDirectory, "diff.png");
        const triptychFile = path.join(caseDirectory, "triptych.png");
        copyFileSync(figmaPngPath, referenceFile);
        writeFileSync(generatedFile, rendered.png);

        const referencePng = readPng(figmaPngPath);
        const generatedPng = readPng(rendered.png);
        const surface = campaignCase.comparisonSurface ?? "light";
        const aligned = alignPair(
          generatedPng,
          referencePng,
          rendered.rootRect,
          surface,
        );
        const diff = diffPair(aligned, rendered.textRects);
        writeFileSync(diffFile, PNG.sync.write(diff.diff));
        writeTriptych(triptychFile, aligned, diff.diff);

        const resolvedRegions = campaignRegions(
          campaignCase,
          aligned,
          rendered.rootRect,
          rendered.parts,
        );
        let regions: Record<
          string,
          ReturnType<typeof scoreDeclaredRegions>[string]
        > = {};
        let regionError = resolvedRegions.error;
        if (!regionError) {
          try {
            regions = scoreDeclaredRegions(aligned, resolvedRegions.regions);
          } catch (error) {
            regionError =
              error instanceof Error ? error.message : String(error);
          }
        }
        const imageRegionIds = new Set(
          (campaignCase.requiredRegions ?? [])
            .filter(
              (region) => region.partName && /image|portrait/i.test(region.id),
            )
            .map((region) => region.id),
        );
        const referenceImagePixels = [...imageRegionIds].reduce(
          (sum, id) => sum + (regions[id]?.referenceSignalPixels ?? 0),
          0,
        );
        const generatedImagePixels = [...imageRegionIds].reduce(
          (sum, id) => sum + (regions[id]?.generatedSignalPixels ?? 0),
          0,
        );
        const imageRequired = (campaignCase.fixtureAssetIds ?? []).length > 0;
        const figmaVisibility = createVisibilityReceipt({
          side: "figma",
          image: referencePng,
          surface,
          imageRequired,
          imagePixels: imageRequired ? referenceImagePixels : null,
        });
        const generatedVisibility = createVisibilityReceipt({
          side: "generated",
          image: generatedPng,
          surface,
          imageRequired,
          imagePixels: imageRequired ? generatedImagePixels : null,
        });
        const imageReceipts = (
          rendered.requiredImages ??
          rendered.images ??
          []
        ).map((image) => {
          const asset = assets.get(image.assetId);
          return createImageReceipt({
            assetId: image.assetId,
            expectedSha256: asset?.sha256 ?? null,
            actualSha256: asset?.sha256 ?? null,
            complete:
              image.complete &&
              image.decodeOk &&
              image.cssVisible &&
              image.matches === 1,
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
            renderedWidth: image.renderedWidth,
            renderedHeight: image.renderedHeight,
            visiblePixels: image.visiblePixels,
            expectedWidth: asset?.width ?? null,
            expectedHeight: asset?.height ?? null,
          });
        });
        const probative = createProbativeEvidenceReceipt(
          figmaVisibility,
          generatedVisibility,
          imageReceipts,
        );
        const geometry = createGeometryReceipt({
          // Geometry comes from the same pinned GET which admitted the case,
          // not from PNG alpha bounds (effects such as shadows enlarge exports).
          rootFigma: referenceReceipt?.geometry?.root
            ? {
                x: rendered.rootRect.x,
                y: rendered.rootRect.y,
                width: referenceReceipt.geometry.root.width * 2,
                height: referenceReceipt.geometry.root.height * 2,
              }
            : null,
          rootGenerated: rendered.rootRect,
          // A case GET can measure the root while having no named children
          // (notably an IMAGE-filled instance).  Keep the campaign's pinned
          // child measurements in that situation; measured GET parts, when
          // present, remain authoritative and override the same-name entry.
          figmaParts: {
            ...(campaignCase.figmaParts ?? {}),
            ...(referenceReceipt?.geometry?.root
              ? Object.fromEntries(
                  Object.entries(referenceReceipt.geometry.parts).map(
                    ([name, part]) => [
                      name,
                      {
                        x:
                          rendered.rootRect.x +
                          (part.x - referenceReceipt.geometry!.root!.x) * 2,
                        y:
                          rendered.rootRect.y +
                          (part.y - referenceReceipt.geometry!.root!.y) * 2,
                        width: part.width * 2,
                        height: part.height * 2,
                      },
                    ],
                  ),
                )
              : {}),
          },
          generatedParts: rendered.parts,
          requiredParts: campaignCase.requiredParts ?? [],
          contract: pkg.contract,
          contractJustification:
            campaignCase.geometryJustification?.contractPointer ?? null,
          reportExplanation:
            campaignCase.geometryJustification?.reportExplanation ?? null,
        });
        const pixels = createPixelReceipt({
          diff,
          regions,
          requiredRegionIds: requiredRegionIds(campaignCase),
          thresholdPct: campaign.acceptance?.maxRawDiffPct ?? THRESHOLD_PCT,
        });
        const semantics = (campaignCase.semanticAssertions ?? []).map(
          (assertion) =>
            createSemanticReceipt(
              assertion,
              semanticActual(
                assertion,
                rendered.semantics?.find((probe) => probe.id === assertion.id),
              ),
              pkg.contract,
            ),
        );
        const gate = evaluateAuthoritativeGate({
          pixels,
          visibility: probative,
          geometry,
          requiredSemanticAssertionIds: (
            campaignCase.semanticAssertions ?? []
          ).map((assertion) => assertion.id),
          semantics,
        });
        const imageArtifacts = [
          pngArtifact(outputRoot, referenceFile, "reference"),
          pngArtifact(outputRoot, generatedFile, "generated"),
          pngArtifact(outputRoot, diffFile, "diff"),
          pngArtifact(outputRoot, triptychFile, "triptych"),
        ];
        const metadata = writeCampaignMetadata(outputRoot, caseDirectory, {
          schemaVersion: 1,
          caseId: campaignCase.id,
          subjectId: subject.id,
          figma,
          contract: {
            id: subject.contractId,
            version: subject.contractVersion,
            factIds: campaignCase.factIds,
          },
          visibility: {
            figma: figmaVisibility,
            generated: generatedVisibility,
          },
          images: imageReceipts,
          geometry,
          pixels,
          semantics,
          gate,
          namedBlockedConditions: namedConditions,
          regionError,
          artifactPaths: imageArtifacts.map((artifact) => artifact.path),
        });
        const artifacts = createArtifactSetReceipt([
          ...imageArtifacts,
          metadata,
        ]);
        const receipt = createCaseVerdictReceipt({
          id: campaignCase.id,
          subjectId: subject.id,
          admissionFailures: regionError
            ? [...caseAdmission, "non-probative"]
            : caseAdmission,
          probative,
          geometry,
          pixels,
          semantics,
          artifacts,
        });
        const mapped = mapCampaignEvidenceVerdict({
          evidenceFailures: receipt.reasons,
          gate,
        });
        outputCases.push(
          caseDetail(
            subject,
            campaignCase,
            receipt,
            gate,
            mapped,
            namedConditions,
            {
              ...figma,
              png: {
                sha256: sha256(readFileSync(referenceFile)),
                width: referencePng.width,
                height: referencePng.height,
              },
            },
          ),
        );
      }
    }
  } finally {
    await launch?.browser.close();
  }
}

async function runVisualCampaign(args: VisualRunArguments): Promise<void> {
  const campaign = args.campaign as CampaignRuntime;
  const outputRoot = args.campaignOut;
  const campaignPath = args.campaignPath;
  const assetManifestPath = args.assetManifestPath;
  if (!campaign || !outputRoot || !campaignPath || !assetManifestPath)
    throw new CampaignPreflightError(
      "campaign paths were lost after preflight",
    );

  mkdirSync(outputRoot, { recursive: true });
  mkdirSync(path.join(outputRoot, "cases"), { recursive: true });
  const inputHashes = hashCampaignInputs(campaignPath, assetManifestPath);
  const conditionsBySubject = new Map(
    campaign.subjects.map((subject) => [
      subject.id,
      campaignConditions(campaign, subject.id),
    ]),
  );

  let referenceValidation: Awaited<
    ReturnType<typeof validateCampaignFigmaReference>
  > | null = null;
  let referenceFailure: string | null = null;
  try {
    referenceValidation = await validateCampaignFigmaReference(
      campaign as VisualCampaign,
    );
    if (!referenceValidation.ok)
      referenceFailure = "pinned Figma reference is stale or incomplete";
  } catch (error) {
    referenceFailure = error instanceof Error ? error.message : String(error);
  }

  const outputCases: CampaignCaseOutput[] = [];
  if (referenceFailure !== null) {
    for (const subject of campaign.subjects) {
      const named = (conditionsBySubject.get(subject.id) ?? []).map(
        (condition) => condition.id,
      );
      for (const campaignCase of subject.cases) {
        outputCases.push(
          writeBlockedCampaignCase(
            outputRoot,
            subject,
            campaignCase,
            ["stale-reference"],
            named,
            {
              nodeId: campaignCase.figmaNodeId,
              setNodeId: subject.figmaSetNodeId,
              referenceValidation,
              error: referenceFailure,
            },
          ),
        );
      }
    }
  } else {
    await captureCampaignCases(
      campaign,
      outputRoot,
      conditionsBySubject,
      outputCases,
      referenceValidation!,
    );
  }

  const subjectReceipts = campaign.subjects.map((subject) =>
    createSubjectVerdictReceipt({
      id: subject.id,
      cases: outputCases
        .filter((campaignCase) => campaignCase.subjectId === subject.id)
        .map((campaignCase) => ({
          id: campaignCase.id,
          subjectId: campaignCase.subjectId,
          verdict: campaignCase.verdict,
          probative: campaignCase.probative,
          reasons: campaignCase.reasons.filter(
            (reason): reason is CaseEvidenceFailure =>
              CASE_EVIDENCE_FAILURES.has(reason as CaseEvidenceFailure),
          ),
        })) as ReturnType<typeof createCaseVerdictReceipt>[],
      requiredCaseIds:
        subject.requiredCaseIds ??
        subject.cases.map((campaignCase) => campaignCase.id),
    }),
  );
  const expectedFacts = campaign.subjects.flatMap(
    (subject) => subject.coverage?.requiredFactIds ?? [],
  );
  const observedFacts = campaign.subjects.flatMap((subject) =>
    subject.cases.flatMap((campaignCase) => campaignCase.factIds),
  );
  const campaignReceipt = createCampaignVerdictReceipt({
    coverage: { expected: expectedFacts, observed: observedFacts },
    subjects: subjectReceipts,
    requiredSubjectIds: campaign.subjects.map((subject) => subject.id),
  });
  const result = {
    schemaVersion: 1 as const,
    campaignId: campaign.id,
    reference: {
      fileKey: campaign.reference.fileKey,
      fileVersion: campaign.reference.fileVersion,
    },
    inputHashes,
    coverage: campaignReceipt.coverage,
    subjects: subjectReceipts,
    cases: outputCases,
    verdict: campaignReceipt.verdict,
    exitCode: campaignReceipt.exitCode,
    reasons: campaignReceipt.reasons,
    referenceValidation,
  };
  const validResult = validateCampaignResult(result);
  if (!validResult.ok) {
    result.verdict = "blocked";
    result.exitCode = 2;
    result.reasons = [
      ...new Set([
        ...result.reasons,
        ...validResult.issues.map((issue) => `result:${issue.code}`),
      ]),
    ].sort();
  }
  writeFileSync(path.join(outputRoot, "result.json"), json(result));
  campaignReport(campaign, outputRoot, result);
  process.exitCode = result.exitCode;
  console.log(
    `CAMPAIGN: ${path.join(outputRoot, "result.json")} — ${result.verdict} (exit ${result.exitCode})`,
  );
}

async function main(): Promise<void> {
  const parsed = parseVisualRunArguments(process.argv.slice(2));
  if (parsed.campaign) {
    await runVisualCampaign(parsed);
    return;
  }
  const {
    refresh,
    summary,
    writeBaseline: writeBaselineFlag,
    legacySubjectFilters,
  } = parsed;
  const only = legacySubjectFilters;
  const subjects = PARITY_SUBJECTS.filter(
    (s) => only.length === 0 || only.includes(s.id),
  );
  if (subjects.length === 0)
    throw new Error(`no subjects match: ${only.join(", ")}`);
  if (summary && only.length > 0) {
    throw new Error(
      "--summary compares the FULL baseline — subject filters would hide regressions",
    );
  }

  mkdirSync(OUT, { recursive: true });
  mkdirSync(CACHE, { recursive: true });

  // 017 — the pinned fixture manifest, read ONCE for the whole run. Same file,
  // same preflight and same receipts as the campaign path; only its consumer is
  // new. Every byte it hands out is re-verified (size, extension, SHA-256) at
  // render time, and no asset it carries may be a runtime default.
  const fixtureAssetManifest = readJsonPreflight(
    path.resolve(REPOSITORY_ROOT, "extract/figma/visual-parity/fixture-assets/manifest.json"),
    "fixture assets manifest",
  );

  // One nodes call per fileKey (batched set ids), cached.
  const byFile = new Map<string, ParitySubject[]>();
  for (const s of subjects)
    byFile.set(s.fileKey, [...(byFile.get(s.fileKey) ?? []), s]);
  const setInfos = new Map<string, SetInfo>(); // `${fileKey}:${setId}`
  for (const [fileKey, subs] of byFile) {
    const infos = await fetchSetInfos(
      CACHE,
      fileKey,
      subs.map((s) => s.setNodeId),
      refresh,
    );
    for (const [setId, info] of infos)
      setInfos.set(`${fileKey}:${setId}`, info);
  }

  const {
    browser,
    version: browserVersion,
    executablePath: browserExecutablePath,
  } = await launchBrowser();
  const browserInfo: BrowserInfo = {
    version: browserVersion,
    executablePath: browserExecutablePath,
    revision: /chromium-(\d+)/.exec(browserExecutablePath)?.[1] ?? null,
  };
  const page = await browser.newPage({
    // Piqueray sections use a 1728px reference width. A 1600px viewport
    // silently clipped their rightmost 128px while the receipt still reported
    // the intended root box, manufacturing a ~7% visual delta. Keep enough
    // room for the largest standing-gate subject plus body padding.
    viewport: { width: 1800, height: 1200 },
    deviceScaleFactor: 2,
  });

  const rows: Row[] = [];
  const subjectMeta: Array<{
    subject: ParitySubject;
    composition: string;
    fonts: string;
    version: string;
  }> = [];
  const fontAvailability = new Map<string, boolean>();

  for (const subject of subjects) {
    console.log(`\n── ${subject.label} (${subject.id}) ──`);
    const info = setInfos.get(`${subject.fileKey}:${subject.setNodeId}`);
    if (!info)
      throw new Error(`${subject.id}: no set info for ${subject.setNodeId}`);

    let pkg: RenderablePackage;
    try {
      pkg = composeSubject(subject);
    } catch (e) {
      const msg = e instanceof Error ? e.message.split("\n")[0] : String(e);
      console.log(`  compose/propose REFUSED — ${msg}`);
      rows.push({
        subject: subject.id,
        variant: "(all)",
        status: "refused",
        diagnosis: `proposal refused: ${msg}`,
        notes: [],
        cause: null,
      });
      subjectMeta.push({
        subject,
        composition: "REFUSED",
        fonts: info.fontFamilies.join(", ") || "(none)",
        version: info.version,
      });
      continue;
    }
    console.log(`  contract ${pkg.contract.id}; ${receiptsLine(pkg)}`);
    console.log(
      `  figma set "${info.setName}" v${info.version}: ${info.variants.length} variant(s); fonts: ${info.fontFamilies.join(", ") || "(none)"}`,
    );
    subjectMeta.push({
      subject,
      composition: receiptsLine(pkg),
      fonts: info.fontFamilies.join(", ") || "(none)",
      version: info.version,
    });

    // instanceOverride (D10/T048): compare against ONE real, already-
    // customized page instance instead of enumerating the set's variants —
    // a component SET's variant node only ever renders property DEFAULTS
    // via the images API, so a non-default combination (icons shown) has
    // no honest reference there. `variantNodes` — real set variants, or a
    // single synthetic entry naming the override instance — drives both the
    // PNG fetch (which node ids) and the render loop (which variant names).
    const override =
      subject.kind === "contract" ? subject.instanceOverride : undefined;
    const variantNodes = override
      ? [{ name: override.variantName, nodeId: override.nodeId }]
      : info.variants;

    const pngs = await fetchNodePngs(
      CACHE,
      subject.fileKey,
      override ? override.nodeId : subject.setNodeId,
      info.version,
      variantNodes.map((v) => v.nodeId),
    );
    const subjectOut = path.join(OUT, subject.id);
    mkdirSync(subjectOut, { recursive: true });

    for (const variant of variantNodes) {
      const slug = variantSlug(variant.name);
      const plan = planVariant(pkg.contract, variant.name);
      if (!plan.ok) {
        console.log(`  ✗ ${variant.name}: SKIPPED — ${plan.reason}`);
        rows.push({
          subject: subject.id,
          variant: variant.name,
          status: "skipped",
          diagnosis: plan.reason,
          notes: [],
          cause: null,
        });
        continue;
      }
      // Merge the override's REAL, scanned prop values — a variant NAME
      // alone cannot carry BOOLEAN visibility or INSTANCE_SWAP glyph state
      // (neither is a variant axis), so plan.subst/plan.bools would
      // otherwise stay at the contract's defaults (icons hidden).
      if (override) {
        for (const [k, v] of Object.entries(override.propPreset)) {
          if (typeof v === "boolean") plan.bools[k] = v;
          else plan.subst[k] = v;
        }
      }
      const figmaPngPath = pngs.get(variant.nodeId);
      if (!figmaPngPath) {
        console.log(
          `  ✗ ${variant.name}: images API declined to render the node`,
        );
        rows.push({
          subject: subject.id,
          variant: variant.name,
          status: "figma-declined",
          diagnosis: "images API returned null for the node",
          notes: plan.notes,
          cause: null,
        });
        continue;
      }
      // 017 (FR-006/FR-006a) — resolve this variant's comparison-only props.
      // Per-variant first (a master may paint a DIFFERENT photo per variant —
      // measured on `Carte`), subject-level otherwise. A resolution FAILURE is
      // a NAMED, VISIBLE, COUNTED row — never a silent fallback to the empty
      // image that produced the 99% scores in the first place.
      let comparisonProps: Record<string, unknown> = {};
      const declaredProps =
        subject.comparisonPropsByVariant?.[variant.name] ?? subject.comparisonProps;
      if (declaredProps) {
        // The resolver requires every DECLARED asset to be BOUND by a $asset in
        // the props it is given. A subject declaring one asset per variant
        // (Carte: two distinct photos) would therefore refuse on both lines. So
        // the ids passed for THIS call are exactly the ones this variant
        // references — and each one must still appear in the subject's own
        // `fixtureAssetIds`, or it is a NAMED refusal. The guarantee is
        // unchanged: nothing undeclared can enter the comparison.
        const referenced = new Set<string>();
        const collect = (v: unknown): void => {
          if (Array.isArray(v)) return void v.forEach(collect);
          if (!v || typeof v !== "object") return;
          const rec = v as Record<string, unknown>;
          if (typeof rec.$asset === "string") return void referenced.add(rec.$asset);
          Object.values(rec).forEach(collect);
        };
        collect(declaredProps);
        const declaredIds = subject.fixtureAssetIds ?? [];
        const undeclared = [...referenced].filter((id) => !declaredIds.includes(id));
        if (undeclared.length > 0) {
          const reason = `$asset ${undeclared.join(", ")} is referenced by this variant but not declared in the subject's fixtureAssetIds`;
          console.log(`  ⊘ ${variant.name}: incomparable — ${reason}`);
          rows.push({
            subject: subject.id,
            variant: variant.name,
            status: "incomparable",
            incomparableReason: reason,
            diagnosis: `no comparable measure: ${reason}`,
            notes: plan.notes,
            cause: null,
          });
          continue;
        }
        const resolvedProps = resolveComparisonOnlyProps({
          codeProps: declaredProps,
          fixtureAssetIds: [...referenced],
          assetManifest: fixtureAssetManifest,
        });
        if (!resolvedProps.ok) {
          const reason = resolvedProps.error;
          console.log(`  ⊘ ${variant.name}: incomparable — ${reason}`);
          rows.push({
            subject: subject.id,
            variant: variant.name,
            status: "incomparable",
            incomparableReason: reason,
            diagnosis: `no comparable measure: ${reason}`,
            notes: plan.notes,
            cause: null,
          });
          continue;
        }
        comparisonProps = resolvedProps.value.props;
      }
      let rendered: Awaited<ReturnType<typeof renderVariant>>;
      try {
        // 017 (FR-006) — THE 7th ARGUMENT. `renderVariant` has carried
        // `comparisonProps` since render.ts:816; the campaign path resolves and
        // passes it (render.ts:1341, :1351); THIS loop passed six and let the
        // parameter sit at its empty default. That single missing argument is
        // where the 99% scores were born: our side rendered `<img src="">`
        // against a real photo and the gate scored the ABSENCE OF DATA.
        //
        // Resolution goes through the SAME proven code as the campaign —
        // `resolveComparisonOnlyProps` re-verifies size, extension, bytes and
        // SHA-256 at render time, refuses any path outside fixture-assets/, and
        // clones the contract before injecting. A `$asset` not declared in the
        // subject's `fixtureAssetIds`, or absent from the manifest, is a NAMED
        // refusal, never a silent empty image.
        rendered = await renderVariant(
          page,
          pkg,
          plan.subst,
          plan.bools,
          plan.interaction,
          info.fontFamilies,
          comparisonProps,
        );
      } catch (e) {
        rendered = {
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        };
      }
      if (!rendered.ok) {
        const headline = rendered.error
          .split("\n")
          .slice(0, 2)
          .join(" ")
          .trim();
        console.log(`  ✗ ${variant.name}: render refused — ${headline}`);
        rows.push({
          subject: subject.id,
          variant: variant.name,
          status: "refused",
          diagnosis: `render refused: ${headline}`,
          notes: plan.notes,
          cause: null,
        });
        continue;
      }
      for (const [f, ok] of Object.entries(rendered.fontChecks))
        fontAvailability.set(f, ok);

      const aligned = alignPair(
        readPng(rendered.png),
        readPng(figmaPngPath),
        rendered.rootRect,
        subject.comparisonSurface ?? "light",
      );
      const diff = diffPair(aligned, rendered.textRects);
      const triptychPath = path.join(subjectOut, `${slug}.triptych.png`);
      if (!summary) {
        // Summary mode is score-only: no artifact churn, the committed
        // triptychs/REPORT stay the reviewed full-run truth.
        writeFileSync(path.join(subjectOut, `${slug}.ours.png`), rendered.png);
        writeTriptych(triptychPath, aligned, diff.diff);
      }

      const row: Row = {
        subject: subject.id,
        variant: variant.name,
        status: "diffed",
        unmaskedPct: diff.unmaskedPct,
        maskedPct: diff.maskedPct,
        maskCoveragePct: diff.maskCoveragePct,
        sizeOurs: `${aligned.aContent.width}×${aligned.aContent.height}`,
        sizeFigma: `${aligned.bContent.width}×${aligned.bContent.height}`,
        interaction: plan.interaction === "none" ? "" : plan.interaction,
        comparisonSurface: aligned.comparisonSurface ?? "light",
        diagnosis: diagnose(aligned, diff),
        triptych: path.relative(HERE, triptychPath),
        notes: plan.notes,
        cause: triageFor(subject.id, variant.name),
      };
      rows.push(row);
      const gate = authoritativeScore(diff);
      const verdict = gate.scorePct <= THRESHOLD_PCT ? "within" : "OVER";
      // D8 (014, FR-015): divergent means a strictly positive raw score — no
      // amplitude dispenses a row from carrying a cause.
      const causeTag =
        gate.scorePct > 0
          ? row.cause
            ? ` [cause: ${row.cause.class}]`
            : " [UNTRIAGED]"
          : "";
      console.log(
        `  ${verdict === "within" ? "·" : "✗"} ${variant.name}: gate/raw ${pct(gate.scorePct)} ` +
          `| masked diagnostic ${pct(diff.maskedPct)} | mask coverage ${pct(diff.maskCoveragePct)} ` +
          `| surface ${aligned.comparisonSurface ?? "light"} (threshold ${THRESHOLD_PCT}% — ${verdict})` +
          `${plan.interaction !== "none" ? ` [${plan.interaction}]` : ""} ` +
          `— ${row.diagnosis}${causeTag}`,
      );
    }
  }

  await browser.close();
  if (summary) {
    const failures = compareToBaseline(rows);
    if (failures > 0) {
      console.error(
        `\nSUMMARY GATE: ${failures} named failure(s) vs baseline.json — see lines above`,
      );
      process.exitCode = 1;
    } else {
      console.log(
        `\nSUMMARY GATE: all rows within ±${EPSILON_PP}pp of baseline.json (${new Date().toISOString()})`,
      );
    }
    return;
  }
  writeReport(rows, subjectMeta, fontAvailability, browserInfo);
  if (writeBaselineFlag) writeBaseline(rows, subjectMeta);
  console.log(`\nREPORT: ${path.join(HERE, "REPORT.md")}`);
  console.log(`RECEIPT: ${path.join(HERE, "out", "rows.json")}`);
}

// ---------------------------------------------------------------------------
// Baseline — the standing no-regression gate
// ---------------------------------------------------------------------------

function writeBaseline(
  rows: Row[],
  subjectMeta: Array<{
    subject: ParitySubject;
    composition: string;
    fonts: string;
    version: string;
  }>,
): void {
  let headCommit: string | null = null;
  try {
    headCommit = execSync("git rev-parse HEAD", {
      cwd: HERE,
      encoding: "utf8",
    }).trim();
  } catch {
    headCommit = null; // named in the file itself: null = git unavailable at write time
  }
  const baseline: Baseline = {
    generatedAt: new Date().toISOString(),
    headCommit,
    epsilonPp: EPSILON_PP,
    subjects: {},
    rows: {},
  };
  for (const m of subjectMeta) {
    const pinnedRow = rows.find(
      (r) =>
        r.subject === m.subject.id &&
        r.status === "diffed" &&
        (r.interaction ?? "") === "",
    );
    baseline.subjects[m.subject.id] = {
      version: m.version,
      fontFamilies: m.fonts === "(none)" ? [] : m.fonts.split(", "),
      pinned: pinnedRow
        ? { variant: pinnedRow.variant, sizeOurs: pinnedRow.sizeOurs! }
        : null,
    };
  }
  for (const r of rows) {
    baseline.rows[rowKey(r)] = {
      status: r.status,
      masked: r.maskedPct ?? null,
      unmasked: r.unmaskedPct ?? null,
      maskCoverage: r.maskCoveragePct ?? null,
      sizeOurs: r.sizeOurs ?? null,
      causeClass: r.cause?.class ?? null,
    };
  }
  writeFileSync(BASELINE, JSON.stringify(baseline, null, 1) + "\n");
  console.log(
    `baseline → ${path.relative(process.cwd(), BASELINE)} (${Object.keys(baseline.rows).length} rows)`,
  );
}

/** Compare a fresh run against the committed baseline. Every failure prints
 *  a named line; the count is returned (0 = gate passes). Regressions beyond
 *  EPSILON_PP fail; improvements beyond it are NAMED (re-baseline to lock
 *  them in) but do not fail. */
function compareToBaseline(rows: Row[]): number {
  if (!existsSync(BASELINE)) {
    console.error(
      `✗ no baseline.json at ${BASELINE} — run a full pass with --write-baseline first`,
    );
    return 1;
  }
  const baseline = JSON.parse(readFileSync(BASELINE, "utf8")) as Baseline;
  const eps = baseline.epsilonPp ?? EPSILON_PP;
  const current = new Map(rows.map((r) => [rowKey(r), r]));
  let failures = 0;
  console.log(
    `\n── summary vs baseline ${baseline.generatedAt} (${baseline.headCommit?.slice(0, 7) ?? "no commit recorded"}), ε ${eps}pp ──`,
  );
  for (const [key, base] of Object.entries(baseline.rows)) {
    const cur = current.get(key);
    if (!cur) {
      console.error(
        `✗ ${key}: in baseline, MISSING from this run (variant vanished / set edited?)`,
      );
      failures++;
      continue;
    }
    if (cur.status !== base.status) {
      console.error(`✗ ${key}: status ${base.status} → ${cur.status}`);
      failures++;
      continue;
    }
    if (base.status !== "diffed") continue;
    if (base.unmasked === null || cur.unmaskedPct === undefined) {
      console.error(
        `✗ ${key}: authoritative raw score missing (baseline/current) — review and re-baseline; masked evidence cannot substitute`,
      );
      failures++;
      continue;
    }
    const baseScore = base.unmasked;
    const curScore = cur.unmaskedPct;
    const delta = curScore - baseScore;
    if (delta > eps) {
      console.error(
        `✗ ${key}: gate/raw ${baseScore.toFixed(2)}% → ${curScore.toFixed(2)}% (+${delta.toFixed(2)}pp > ε ${eps})`,
      );
      failures++;
    } else if (delta < -eps) {
      console.log(
        `· ${key}: IMPROVED ${baseScore.toFixed(2)}% → ${curScore.toFixed(2)}% — re-baseline (--write-baseline) to lock it in`,
      );
    }
  }
  for (const r of rows) {
    if (!baseline.rows[rowKey(r)]) {
      console.error(
        `✗ ${rowKey(r)}: NEW row not in baseline — review the full report, then --write-baseline`,
      );
      failures++;
    }
  }
  return failures;
}

function writeReport(
  rows: Row[],
  subjectMeta: Array<{
    subject: ParitySubject;
    composition: string;
    fonts: string;
    version: string;
  }>,
  fontAvailability: Map<string, boolean>,
  browser: BrowserInfo,
): void {
  const diffed = rows.filter((r) => r.status === "diffed");
  const problem = rows.filter((r) => r.status !== "diffed");
  // 017 (FR-007) — FAIL-CLOSED, refusable BY NAME rather than merely true by
  // construction: an "incomparable" row without a written reason does not get
  // published. An unexplained "not comparable" would be a silent omission
  // wearing a status, which is the highest-severity bug class here.
  for (const r of problem) {
    if (r.status !== "incomparable") continue;
    if (typeof r.incomparableReason !== "string" || r.incomparableReason.trim() === "") {
      throw new Error(
        `row ${r.subject}/${r.variant} is marked incomparable with no written reason — ` +
          "FR-007 requires a non-empty incomparableReason; a row that measures nothing must say why",
      );
    }
  }
  // A mask deletes evidence and is diagnostic-only. Ranking, threshold,
  // triage and baseline all use the same authoritative raw score.
  const score = (r: Row) => r.unmaskedPct!;
  const ranked = [...diffed].sort((x, y) => score(y) - score(x));

  // Worst-10 triptychs → committed report-assets/.
  mkdirSync(ASSETS, { recursive: true });
  const worst = ranked.slice(0, 10);
  for (const r of worst) {
    if (!r.triptych) continue;
    const dest = path.join(
      ASSETS,
      `${r.subject}--${variantSlug(r.variant)}.triptych.png`,
    );
    copyFileSync(path.join(HERE, r.triptych), dest);
    r.triptych = path.relative(HERE, dest);
  }

  const buckets = [
    ["≤ 1%", diffed.filter((r) => score(r) <= 1).length],
    ["1–3%", diffed.filter((r) => score(r) > 1 && score(r) <= 3).length],
    ["3–10%", diffed.filter((r) => score(r) > 3 && score(r) <= 10).length],
    ["> 10%", diffed.filter((r) => score(r) > 10).length],
  ] as const;

  const fontLines =
    [...fontAvailability.entries()]
      .map(
        ([f, ok]) =>
          `  - "${f}": ${ok ? "available locally (same face used in the preview)" : "NOT available locally — text regions masked for the second score"}`,
      )
      .join("\n") || "  - (no font families named by the Figma sets)";

  const causeCell = (r: Row): string => {
    if (r.cause) return `${r.cause.class} (${CAUSE_LABELS[r.cause.class]}): ${r.cause.cause}`;
    // D8: divergent means raw score strictly > 0 — no amplitude dispense.
    return score(r) > 0 ? "**UNTRIAGED**" : "—";
  };
  const tableRow = (r: Row): string =>
    `| ${r.subject} | ${r.variant}${r.interaction ? ` [${r.interaction}]` : ""} | ${pct(score(r))} | ${pct(r.maskedPct)} | ${pct(r.maskCoveragePct)} | ${r.comparisonSurface ?? "light"} | ${r.sizeOurs} vs ${r.sizeFigma} | ${r.diagnosis}${r.notes.length > 0 ? ` (${r.notes.join("; ")})` : ""} | ${causeCell(r)} | ${r.triptych ?? "—"} |`;

  // Gate read: distribution by triage class + the standing invariants.
  const over = (lo: number, hi: number) =>
    diffed.filter((r) => score(r) > lo && score(r) <= hi);
  // D8 (014, FR-015): the population is every divergent row — raw score
  // strictly > 0 — not just those over the former 3% dispense line.
  const untriaged = diffed.filter((r) => score(r) > 0 && !r.cause);
  const classCounts = (rs: Row[]): string => {
    const m = new Map<string, number>();
    for (const r of rs)
      m.set(
        r.cause?.class ?? "UNTRIAGED",
        (m.get(r.cause?.class ?? "UNTRIAGED") ?? 0) + 1,
      );
    return (
      [...m.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([c, n]) => `${c} ×${n}`)
        .join(", ") || "(empty)"
    );
  };

  const causeClassList = Object.entries(CAUSE_LABELS)
    .map(([slug, label]) => `${slug} (${label})`)
    .join(" / ");
  const md = `# Visual-parity baseline — pixels as receipts

Generated by \`npm run extract:figma:visual\` (extract/figma/visual-parity/run.ts),
measured with Chromium ${browser.version}${browser.revision ? ` (Playwright revision ${browser.revision})` : ""}
— \`${browser.executablePath}\` (014, FR-014: a cause blaming the renderer names
which one). Ranked WORST-FIRST by the authoritative **raw** score. Gate line:
**${THRESHOLD_PCT}%** — printed per row without any masked substitution. Every row
with a STRICTLY POSITIVE raw score carries a NAMED cause from the committed
triage table (triage.ts, classed ${causeClassList}) or prints **UNTRIAGED**
(014, FR-015/D8 — the prior 3% dispense is gone; a row exactly at 0% is not
divergent and needs no cause). Standing gate: \`-- --summary\` re-scores every
row against the committed baseline.json and FAILS on any regression beyond
±${EPSILON_PP}pp (cached Figma PNGs — render-only when the cache is warm);
\`-- --write-baseline\` moves the gate, explicitly, after review.

## Known cross-renderer deltas (named, not tolerated away)

- **Font rasterization**: Chromium (CoreText on macOS) and Figma's renderer hint and
  rasterize glyphs differently even for the SAME face — sub-pixel widths shift.
  The text-masked score (text-node DOM rects excluded from numerator and
  denominator) is printed only as diagnosis. Because it deletes evidence, it
  never lowers the authoritative raw gate and never replaces the raw baseline.
- **Mask coverage**: the exact canvas share removed by the text mask is printed
  for every row. A 0% masked diagnostic therefore cannot masquerade as 0% parity.
- **Transparent ink**: both PNGs are alpha-flattened onto the same explicit
  inspection surface. The default is light; a subject whose component ink is
  white-on-transparent declares \`dark\`. This surface is capture context only,
  not component CSS and not a Figma mutation.
- **Text-hug metrics**: the SAME text also SIZES differently — Figma hugs an
  Inter 16px line at lineHeightPx 19.36 where the CSS line box is 20px, and
  glyph advance widths differ per rasterizer, so a hug-sized component's box
  lands ±1–2 CSS px off (receipt: Button node 83×35 vs ours 82×36). The size
  delta is REAL and stays in the score; rows whose residual is only this are
  triaged \`rendering\`.
- **Font availability** (checked in-page via \`document.fonts.check\`):
${fontLines}
- **Antialiasing**: edge pixels differ per renderer. pixelmatch's antialiasing
  detector is ON (its default) — a per-pixel classifier, not a tolerance knob.
- **Subpixel positioning**: Figma positions nodes on fractional pixels; CSS layout
  rounds differently at 2x. Expect ±1 device-px edge noise on every row.
- **Shadow/blur interpolation**: Figma and Skia blur with different kernels — dialog
  shadows will never be pixel-identical; the score isolates how far apart.
- **Color management**: both sides export/render sRGB; no profile conversion applied.
- **Alignment sensitivity**: the pair is content-cropped and CENTER-padded, never
  resampled — when the two content boxes differ in size, everything downstream of
  the size delta shifts and the mismatch compounds (and the text mask, computed
  from OUR DOM, may miss Figma's shifted text). A large size delta therefore
  dominates its row's score by design: fix the size first, re-run, then read the
  styling delta. On TRANSPARENT-INK rows (washed fills near the alpha-trim
  threshold) the two sides can trim to very different boxes and the compounding
  is extreme — triaged \`instrument\` by name. Anchoring both crops to one shared
  box was considered and rejected honestly: the two images have no shared
  coordinate frame (our screenshot clips a DOM union box + margin; Figma's PNG
  is the node render), and correlation-based registration would optimize the
  alignment against the very signal being measured.
- **Interaction states**: hover/active/focus rows are REAL browser states (mouse
  hover, mouse down, keyboard focus) screenshotted live — not simulated classes.

## Worst-first (all diffed variants)

| subject | variant | gate/raw | masked diagnostic | mask coverage | surface | size ours vs figma | diagnosis | named cause (triage.ts) | triptych |
|---|---|---|---|---|---|---|---|---|---|
${ranked.map(tableRow).join("\n")}

## Not diffed (named, never dropped)

${(() => {
  if (problem.length === 0) return "_none_";
  // Collapse identical (subject, status, reason) rows — 36 variants refusing
  // for the same 8 violations is ONE fact with a count, not 36 lines.
  const grouped = new Map<
    string,
    { subject: string; status: string; reason: string; variants: string[] }
  >();
  for (const r of problem) {
    const key = `${r.subject} ${r.status} ${r.diagnosis}`;
    const g = grouped.get(key) ?? {
      subject: r.subject,
      status: r.status,
      reason: r.diagnosis,
      variants: [],
    };
    g.variants.push(r.variant);
    grouped.set(key, g);
  }
  return `| subject | variants | status | reason |\n|---|---|---|---|\n${[
    ...grouped.values(),
  ]
    .map(
      (g) =>
        `| ${g.subject} | ${g.variants.length <= 2 ? g.variants.join(", ") : `${g.variants[0]} (+${g.variants.length - 1} more)`} | ${g.status} | ${g.reason} |`,
    )
    .join("\n")}`;
})()}

## Distribution (authoritative raw score)

${buckets.map(([label, n]) => `- ${label}: ${n} variant(s)`).join("\n")}

- diffed: ${diffed.length} · skipped/refused/declined: ${problem.length}

## Gate read (triage classes)

- **UNTRIAGED (raw score > 0%): ${untriaged.length}**${untriaged.length > 0 ? ` — ${untriaged.map((r) => rowKey(r)).join("; ")}` : " — the queue is empty"}
- > 10% by class: ${classCounts(over(10, Infinity))}
- 3–10% by class: ${classCounts(over(3, 10))}
- 0–3% by class: ${classCounts(over(0, 3))}
- open \`engine\`-class causes: ${diffed.filter((r) => r.cause?.class === "engine").length} (an engine row is a tracked defect, not an accepted delta)

## Subjects

| subject | figma set version | composition | fonts in set |
|---|---|---|---|
${subjectMeta.map((m) => `| ${m.subject.id} (${m.subject.kind}) | v${m.version} | ${m.composition} | ${m.fonts} |`).join("\n")}

## Reading a triptych

Left: our emit-html preview render (2x). Middle: Figma's own render of the same
variant node (images API, scale=2). Right: pixelmatch diff (red = mismatch,
yellow = antialiasing-classified). Both sides content-box-cropped and
center-padded onto a shared canvas — size deltas are real mismatches, reported
in device px, never resampled away.
`;
  writeFileSync(path.join(HERE, "REPORT.md"), md);
  writeMachineRows(rows, browser);
}

/**
 * The machine receipt beside the rendered report — same relationship 013 already
 * holds ("result.json is the AUTHORITY; REPORT.md is rendered from it").
 *
 * Scores are written at FULL precision on purpose. The authoritative score is
 * the number, never the two-decimal string the table prints: a row shown as
 * `0.00%` can be worth 0.004%, and anything reading the Markdown back would
 * silently round a real divergence to zero (014, decision D8).
 */
function writeMachineRows(rows: Row[], browser: BrowserInfo): void {
  const out = path.join(HERE, "out");
  mkdirSync(out, { recursive: true });
  const receipt = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    browser,
    rows: rows.map((r) => ({
      key: rowKey(r),
      subject: r.subject,
      variant: r.variant,
      status: r.status,
      rawPct: r.unmaskedPct ?? null,
      maskedPct: r.maskedPct ?? null,
      maskCoveragePct: r.maskCoveragePct ?? null,
      sizeOurs: r.sizeOurs ?? null,
      sizeFigma: r.sizeFigma ?? null,
      interaction: r.interaction ?? null,
      causeClass: r.cause?.class ?? null,
      cause: r.cause?.cause ?? null,
    })),
  };
  writeFileSync(
    path.join(out, "rows.json"),
    `${JSON.stringify(receipt, null, 1)}\n`,
  );
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = e instanceof CampaignPreflightError ? 2 : 1;
});
