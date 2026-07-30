/**
 * Dossier emission for the organism audit (013).
 *
 * This module owns the shape of what a reviewer opens.  Its first
 * responsibility is the least glamorous and the most important: the dossier of
 * an organism whose dependency gate is CLOSED.
 *
 * `Equipe`, `Formulaire` and `Header` compose molecules whose own proof is not
 * positive, and the tempting shortcuts are all false greens — skip the parent so
 * absence of a test reads as validation; fabricate a parent case so the dossier
 * looks complete; or let the parent's own aggregate score outvote its child's
 * defect.  A blocked parent instead gets a COMPLETE dossier: its full
 * DependencyGateResult, its facts still declared (that is what makes the block
 * legible rather than an empty folder), zero fabricated cases, and no route to a
 * positive verdict.
 *
 * Reference: contracts/audit-result.interface.md (Organism result, Dependency
 * gate result), contracts/campaign-report.interface.md, data-model.md §4/§10.
 */
import type { AuditIssue } from './campaign.js';
import type { DependencyGateResult } from './dependencies.js';
import type { FactOutcome, LocalizedSource, OrganismVerdict } from './verdict.js';

export interface OrganismTargetSnapshot {
  id: string;
  displayName: string;
  wave: 1 | 2 | 3;
  contractId: string;
  contractVersion: string;
  contractPath: string;
  figmaSetNodeId: string;
  dependencyId: string | null;
  requiredFactIds: string[];
}

export interface AuditedFactResult {
  id: string;
  subjectId: string;
  caseId: string | null;
  kind: string;
  required: boolean;
  representability: string;
  figma: FactLegResult;
  contract: FactLegResult;
  generated: FactLegResult;
  evidenceIds: string[];
  outcome: FactOutcome;
  localizedSource: LocalizedSource | null;
  reasons: string[];
  deferredWorkId: string | null;
}

export interface FactLegResult {
  reference: string | null;
  observedValue: unknown;
  sourceHash: string | null;
  available: boolean;
  notes: string[];
}

export interface OrganismCoverage {
  expected: string[];
  observed: string[];
  missing: string[];
  unexpected: string[];
}

export interface OrganismAuditResult {
  id: string;
  displayName: string;
  wave: 1 | 2 | 3;
  contract: { id: string; version: string; path: string };
  figmaSetNodeId: string;
  coverage: OrganismCoverage;
  dependency: DependencyGateResult | null;
  facts: AuditedFactResult[];
  cases: unknown[];
  artifacts: unknown[];
  verdict: OrganismVerdict;
  reasons: string[];
}

export interface BlockedParentInput {
  target: OrganismTargetSnapshot;
  gateResult: DependencyGateResult;
  /** Present only in adversarial exercises — a forced verdict is refused, never honoured. */
  forcedVerdict?: OrganismVerdict;
  /** Parent-level signals, deliberately unable to outvote a closed gate. */
  parentSignals?: { coverageExact: boolean; allFactsProved: boolean; allCasesPass: boolean };
}

/** A leg that was never gathered, typed as absent rather than left blank. */
function unavailableLeg(note: string): FactLegResult {
  return { reference: null, observedValue: null, sourceHash: null, available: false, notes: [note] };
}

/**
 * Build the dossier of a dependency-blocked parent.
 *
 * The verdict is not an argument: it is `blocked`, derived from the gate.  A
 * caller asking for anything else — or routing an OPEN gate through here, which
 * would manufacture a block where the evidence path should have run — gets a
 * typed issue back and the blocked dossier anyway.
 */
export function buildBlockedParentDossier(input: BlockedParentInput): {
  result: OrganismAuditResult;
  issues: AuditIssue[];
} {
  const { target, gateResult } = input;
  const issues: AuditIssue[] = [];

  if (gateResult.open) {
    issues.push({
      code: 'dependency-gate',
      path: `$.subjects.${target.id}.dependency.open`,
      message:
        'an open dependency gate must run the full audit path; the blocked-parent dossier would manufacture a block',
    });
  }
  if (input.forcedVerdict !== undefined && input.forcedVerdict !== 'blocked') {
    issues.push({
      code: 'dependency-gate',
      path: `$.subjects.${target.id}.verdict`,
      message: `a closed dependency gate cannot yield "${input.forcedVerdict}" — the verdict is derived, never supplied`,
    });
  }

  // The required facts stay DECLARED under a closed gate.  Dropping them would
  // turn a legible block into an empty dossier, and an empty dossier is exactly
  // what "absence of a test reads as validation" looks like.
  const facts: AuditedFactResult[] = target.requiredFactIds.map((factId) => ({
    id: factId,
    subjectId: target.id,
    caseId: null,
    kind: 'composition',
    required: true,
    representability: 'carry-both',
    figma: unavailableLeg('not-captured:dependency-gate-closed'),
    contract: unavailableLeg('not-resolved:dependency-gate-closed'),
    generated: unavailableLeg('not-rendered:dependency-gate-closed'),
    evidenceIds: [],
    outcome: 'not-proven' satisfies FactOutcome,
    localizedSource: null,
    reasons: [`dependency-gate-closed:${gateResult.dependencyContractId}`],
    deferredWorkId: null,
  }));

  const reasons = [
    `dependency:${gateResult.dependencyContractId}:${gateResult.actualVerdict}`,
    ...gateResult.reasons,
  ];

  return {
    issues,
    result: {
      id: target.id,
      displayName: target.displayName,
      wave: target.wave,
      contract: {
        id: target.contractId,
        version: target.contractVersion,
        path: target.contractPath,
      },
      figmaSetNodeId: target.figmaSetNodeId,
      coverage: {
        expected: [...target.requiredFactIds].sort(),
        observed: [],
        missing: [...target.requiredFactIds].sort(),
        unexpected: [],
      },
      // The whole gate travels with the dossier — path, hash, both verdicts —
      // so the report can cite the receipt rather than merely name the child.
      dependency: gateResult,
      facts,
      // No fabricated parent case: inventing one would produce measurements that
      // look like evidence for a component whose prerequisite was never proven.
      cases: [],
      artifacts: [],
      verdict: 'blocked',
      reasons: [...new Set(reasons)],
    },
  };
}
