/**
 * The fail-closed verdict algebra of the organism audit (013).
 *
 * Every verdict here is DERIVED from observations; none is ever supplied.  That
 * is the whole point: a campaign that could be handed its own conclusion would
 * prove nothing.  Three rules carry the honesty of the whole instrument:
 *
 *   1. severity always wins — `blocked > divergent > not-proven > limited > proved`;
 *   2. an absence is never a conformity — a missing leg, an inexact coverage or
 *      non-probative evidence lands on `not-proven`, never on a quiet pass;
 *   3. a named limit and a deferred work item are honest answers, never passes.
 *
 * This module is pure and dependency-free (no fs, no fetch, no Chromium) so the
 * algebra can be exercised exhaustively by fixtures without any I/O.
 *
 * Reference: data-model.md §6 (FactOutcome), §10 (OrganismVerdict), §11
 * (CampaignAuditResult); research.md D7 (pixel/probative gates) and D8.
 */

export type FactOutcome = 'proved' | 'divergent' | 'limited' | 'not-proven';
export type OrganismVerdict = FactOutcome | 'blocked';
export type CampaignVerdict = 'complete' | 'complete-with-blocks' | 'invalid';

export type Representability = 'carry-both' | 'carry-with-named-limit' | 'carry-code-only';
export type LocalizedSource = 'figma' | 'contract' | 'generated' | 'dependency' | 'comparison';

/** data-model §10 — most severe first.  Ties are impossible by construction. */
export const ORGANISM_VERDICT_PRIORITY: readonly OrganismVerdict[] = [
  'blocked',
  'divergent',
  'not-proven',
  'limited',
  'proved',
] as const;

/** The campaign roster is exactly twelve; a shorter or padded one is not a result. */
export const EXPECTED_ORGANISM_COUNT = 12;

const EXIT_CODE_BY_CAMPAIGN_VERDICT: Record<CampaignVerdict, 0 | 1 | 2> = {
  complete: 0,
  'complete-with-blocks': 1,
  invalid: 2,
};

export interface FactVerdictInput {
  /** Whether each leg of the chain was actually available (never "assumed conforming"). */
  legs: { figma: boolean; contract: boolean; generated: boolean };
  agreement: 'agree' | 'mismatch' | 'unknown';
  evidenceProbative: boolean;
  representability: Representability;
  localizedSource?: LocalizedSource | null;
  deferredWorkId?: string | null;
}

export interface FactVerdict {
  outcome: FactOutcome;
  reasons: string[];
}

/**
 * Derive one fact's outcome.
 *
 * Throws — rather than returning a verdict — on an input that cannot mean
 * anything coherent, because silently picking an outcome for it would put an
 * unattributable claim into the report:
 *
 *   - a mismatch with no localized source would assert a defect without naming
 *     which surface carries it;
 *   - an otherwise-perfect chain that still carries deferred work would claim a
 *     pass for something explicitly left undone.
 */
export function deriveFactOutcome(input: FactVerdictInput): FactVerdict {
  const { legs, agreement, evidenceProbative, representability } = input;
  const localizedSource = input.localizedSource ?? null;
  const deferredWorkId = input.deferredWorkId ?? null;

  if (agreement === 'mismatch' && localizedSource === null) {
    throw new Error(
      'incoherent fact: an observed mismatch must name its localizedSource (figma|contract|generated|dependency|comparison)',
    );
  }

  const reasons: string[] = [];

  // An established defect outranks every softer signal — a divergence hidden
  // behind a named limit is still a divergence.
  if (agreement === 'mismatch') {
    reasons.push(`observed-mismatch:${localizedSource}`);
    if (deferredWorkId !== null) reasons.push(`deferred-work:${deferredWorkId}`);
    return { outcome: 'divergent', reasons };
  }

  // A CARRY-CODE-ONLY channel has no canvas leg by definition: its absence is
  // the named boundary itself, not evidence we failed to collect.  Every other
  // missing leg is a genuine hole.
  const missingLegs: string[] = [];
  if (!legs.figma && representability !== 'carry-code-only') missingLegs.push('figma');
  if (!legs.contract) missingLegs.push('contract');
  if (!legs.generated) missingLegs.push('generated');

  if (missingLegs.length > 0) reasons.push(`leg-unavailable:${missingLegs.join('+')}`);
  if (agreement === 'unknown') reasons.push('agreement-unknown');
  if (!evidenceProbative) reasons.push('evidence-not-probative');
  if (reasons.length > 0) {
    if (deferredWorkId !== null) reasons.push(`deferred-work:${deferredWorkId}`);
    return { outcome: 'not-proven', reasons };
  }

  if (representability !== 'carry-both') {
    reasons.push(`representability:${representability}`);
    if (deferredWorkId !== null) reasons.push(`deferred-work:${deferredWorkId}`);
    return { outcome: 'limited', reasons };
  }

  if (deferredWorkId !== null) {
    throw new Error(
      `incoherent fact: a proved chain cannot carry deferred work (${deferredWorkId}) — a deferred item is never a granted pass`,
    );
  }

  return { outcome: 'proved', reasons };
}

export interface OrganismVerdictInput {
  /** `null` when the organism declares no dependency (waves 1 and 2). */
  dependencyOpen: boolean | null;
  /** Outcomes of the REQUIRED facts only. */
  factOutcomes: FactOutcome[];
  caseVerdicts: Array<'pass' | 'fail' | 'blocked'>;
  caseProbative: boolean[];
  coverageExact: boolean;
}

export interface OrganismVerdictResult {
  verdict: OrganismVerdict;
  reasons: string[];
}

/**
 * Aggregate one organism.  Deliberately NOT an average: averaging is precisely
 * how a composed organism's global score hides its child's defect.
 */
export function aggregateOrganismVerdict(input: OrganismVerdictInput): OrganismVerdictResult {
  const { dependencyOpen, factOutcomes, caseVerdicts, caseProbative, coverageExact } = input;
  const reasons: string[] = [];

  // A parent whose prerequisite is not fresh, positive and probative cannot
  // report anything about itself, however good its own measurements look.
  if (dependencyOpen === false) {
    reasons.push('dependency-gate-closed');
    return { verdict: 'blocked', reasons };
  }
  if (caseVerdicts.includes('blocked')) {
    reasons.push('case-blocked');
    return { verdict: 'blocked', reasons };
  }

  const divergentFacts = factOutcomes.filter((outcome) => outcome === 'divergent').length;
  const failedCases = caseVerdicts.filter((verdict) => verdict === 'fail').length;
  if (divergentFacts > 0 || failedCases > 0) {
    if (divergentFacts > 0) reasons.push(`divergent-facts:${divergentFacts}`);
    if (failedCases > 0) reasons.push(`failed-cases:${failedCases}`);
    return { verdict: 'divergent', reasons };
  }

  const notProvenFacts = factOutcomes.filter((outcome) => outcome === 'not-proven').length;
  const nonProbativeCases = caseProbative.filter((probative) => !probative).length;
  // Vacuous truth is the cheapest false green there is: an organism that
  // audited nothing has proved nothing.
  const auditedNothing = factOutcomes.length === 0 && caseVerdicts.length === 0;
  if (!coverageExact || notProvenFacts > 0 || nonProbativeCases > 0 || auditedNothing) {
    if (!coverageExact) reasons.push('coverage-not-exact');
    if (notProvenFacts > 0) reasons.push(`not-proven-facts:${notProvenFacts}`);
    if (nonProbativeCases > 0) reasons.push(`non-probative-cases:${nonProbativeCases}`);
    if (auditedNothing) reasons.push('no-fact-and-no-case-audited');
    return { verdict: 'not-proven', reasons };
  }

  const limitedFacts = factOutcomes.filter((outcome) => outcome === 'limited').length;
  if (limitedFacts > 0) {
    reasons.push(`limited-facts:${limitedFacts}`);
    return { verdict: 'limited', reasons };
  }

  return { verdict: 'proved', reasons };
}

export interface CampaignVerdictInput {
  subjectVerdicts: OrganismVerdict[];
  dossiersValid: boolean;
  invalidReasons?: string[];
}

export interface CampaignVerdictResult {
  verdict: CampaignVerdict;
  exitCode: 0 | 1 | 2;
  reasons: string[];
}

/**
 * Derive the campaign verdict and its process exit code together, so a caller
 * reading only the exit status can never learn something the report contradicts.
 *
 * Exit 0 is a fidelity claim over all twelve organisms.  Exit 1 is an honestly
 * finished campaign carrying red or blocked organisms — an actionable result,
 * explicitly NOT a statement of global fidelity.
 */
export function deriveCampaignVerdict(input: CampaignVerdictInput): CampaignVerdictResult {
  const { subjectVerdicts, dossiersValid } = input;
  const invalidReasons = input.invalidReasons ?? [];
  const reasons: string[] = [];

  if (subjectVerdicts.length !== EXPECTED_ORGANISM_COUNT) {
    reasons.push(`subject-roster:${subjectVerdicts.length}/${EXPECTED_ORGANISM_COUNT}`);
  }
  if (!dossiersValid) reasons.push('dossiers-invalid');
  reasons.push(...invalidReasons);
  if (reasons.length > 0) {
    return { verdict: 'invalid', exitCode: EXIT_CODE_BY_CAMPAIGN_VERDICT.invalid, reasons };
  }

  const nonPositive = subjectVerdicts.filter((verdict) => verdict !== 'proved');
  if (nonPositive.length > 0) {
    const counts = new Map<OrganismVerdict, number>();
    for (const verdict of nonPositive) counts.set(verdict, (counts.get(verdict) ?? 0) + 1);
    return {
      verdict: 'complete-with-blocks',
      exitCode: EXIT_CODE_BY_CAMPAIGN_VERDICT['complete-with-blocks'],
      reasons: [...counts.entries()].map(([verdict, count]) => `${verdict}:${count}`),
    };
  }

  return { verdict: 'complete', exitCode: EXIT_CODE_BY_CAMPAIGN_VERDICT.complete, reasons: [] };
}

export interface PixelRegionScore {
  id: string;
  score: number;
  maxDiffPct: number;
  signalPixels: number;
}

export interface PixelRuleInput {
  rawPct: number;
  thresholdPct: number;
  regions: PixelRegionScore[];
  /** Diagnostic output only — deliberately not a term of the rule below. */
  maskedDiagnosticPct?: number;
}

export interface PixelRuleResult {
  pixelPass: boolean;
  reasons: string[];
}

/**
 * The authoritative pixel rule (research.md D7, audit-result.interface.md):
 *
 *   pixelPass = rawPct <= thresholdPct
 *               AND every(requiredRegion.score <= requiredRegion.maxDiffPct)
 *
 * `maskedDiagnosticPct` is printed, never read: a text mask can manufacture a
 * 0 % and a red baseline can carry a 100 %, and neither may move a verdict.
 *
 * The region term is a hard AND, not a tiebreak a good global average can
 * outvote — that dilution is exactly how a small local divergence disappears
 * inside a large component.  A region carrying no ink is refused outright:
 * it proves nothing about the pixels inside it, and it is the shape a region
 * *chosen after observation* takes.
 */
export function evaluatePixelRule(input: PixelRuleInput): PixelRuleResult {
  const { rawPct, thresholdPct, regions } = input;
  const reasons: string[] = [];

  if (!Number.isFinite(rawPct)) {
    reasons.push(`raw-score-not-finite:${String(rawPct)}`);
  } else if (rawPct > thresholdPct) {
    reasons.push(`raw-over-threshold:${rawPct}>${thresholdPct}`);
  }

  if (regions.length === 0) {
    reasons.push('no-required-region-declared');
  }
  for (const region of regions) {
    if (region.signalPixels <= 0) {
      reasons.push(`region-without-signal:${region.id}`);
      continue;
    }
    if (!Number.isFinite(region.score)) {
      reasons.push(`region-score-not-finite:${region.id}`);
      continue;
    }
    if (region.score > region.maxDiffPct) {
      reasons.push(`region-over-budget:${region.id}:${region.score}>${region.maxDiffPct}`);
    }
  }

  return { pixelPass: reasons.length === 0, reasons };
}

export interface ProbativeInput {
  figmaSignalPixels: number;
  generatedSignalPixels: number;
  contrastOk: boolean;
  equivalentInputs: boolean;
  imagesDecoded: boolean;
  emptyRegions: string[];
  usedEmitHtmlFallback: boolean;
}

export interface ProbativeResult {
  probative: boolean;
  reasons: string[];
}

/**
 * The admission bar a score must clear before it is allowed to speak at all.
 *
 * A perfect 0 % over two blank surfaces is the purest false green in the suite,
 * so a score never admits its own evidence.  A capture that fell back to
 * `core/emit-html` is refused here rather than downgraded later: emit-html is a
 * diagnostic surface, and the proved surface is the generated React (D4).
 */
export function evaluateProbative(input: ProbativeInput): ProbativeResult {
  const reasons: string[] = [];
  if (input.figmaSignalPixels <= 0) reasons.push('figma-reference-carries-no-signal');
  if (input.generatedSignalPixels <= 0) reasons.push('generated-render-carries-no-signal');
  if (!input.contrastOk) reasons.push('ink-not-contrasted-against-inspection-surface');
  if (!input.equivalentInputs) reasons.push('sides-fed-non-equivalent-inputs');
  if (!input.imagesDecoded) reasons.push('expected-image-did-not-decode');
  if (input.emptyRegions.length > 0) {
    reasons.push(`declared-region-without-ink:${input.emptyRegions.join('+')}`);
  }
  if (input.usedEmitHtmlFallback) reasons.push('capture-fell-back-to-emit-html');
  return { probative: reasons.length === 0, reasons };
}
