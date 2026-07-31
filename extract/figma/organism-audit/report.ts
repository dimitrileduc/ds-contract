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

export interface ArtifactReceipt {
  id: string;
  kind: 'figma' | 'generated' | 'diff' | 'triptych' | 'metadata' | 'report';
  /** Repository-relative path, under the organism/case dossier. */
  path: string;
  sha256: string;
  mediaType: string;
  width: number | null;
  height: number | null;
  bytes: number;
}

export interface CaseAuditResult {
  id: string;
  subjectId: string;
  verdict: 'pass' | 'fail' | 'blocked';
  probative: boolean;
  reasons: string[];
  figma: {
    nodeId: string;
    setNodeId: string;
    fileVersion: string;
    observedProperties: Record<string, unknown>;
    pngSha256: string;
    width: number;
    height: number;
  };
  contract: {
    id: string;
    version: string;
    factIds: string[];
    reactProps: Record<string, unknown>;
  };
  generated: {
    componentFile: string;
    export: string;
    bundleSha256: string;
    harnessConfigSha256: string;
    fontsLoaded: boolean;
  };
  visibility: {
    figma: { signalPixels: number; width: number; height: number };
    generated: { signalPixels: number; width: number; height: number };
    contrastOk: boolean;
  };
  geometry: {
    figmaRoot: { width: number; height: number };
    generatedRoot: { width: number; height: number };
    deltaPx: { width: number; height: number };
    verdict: 'pass' | 'fail';
  };
  pixels: {
    rawPct: number;
    maskedDiagnosticPct: number | null;
    thresholdPct: number;
    regions: Array<{ id: string; score: number; maxDiffPct: number; signalPixels: number }>;
    verdict: 'pass' | 'fail';
  };
  semantics: Array<{
    id: string;
    selector: string;
    contractPointer: string;
    expected: unknown;
    observed: unknown;
    verdict: 'pass' | 'fail';
  }>;
  /** Non-default prop probes driven through the SAME built harness (D6). */
  domProbes: Array<{
    factId: string;
    prop: string;
    probeValue: unknown;
    observedDomValue: string | null;
    projected: boolean;
  }>;
  artifacts: ArtifactReceipt[];
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
  cases: CaseAuditResult[];
  artifacts: ArtifactReceipt[];
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

// ---------------------------------------------------------------------------
// Individual organism REPORT.md — generated FROM result.json, never authored.
// ---------------------------------------------------------------------------

export interface OrganismReportContext {
  reference: { fileKey: string; fileVersion: string };
  auditRefs: string[];
  knownLimits: Array<{ id: string; statement: string; expectedVerdictImpact: string }>;
  deferredWork: Array<{ id: string; factId: string; category: string; verdictImpact: string }>;
  /** Initial→final history when a bounded local remediation happened. */
  remediation: Array<{ stage: 'initial' | 'final'; verdict: string; resultPath: string }> | null;
}

const cell = (value: unknown): string =>
  String(value ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 120) || '—';

const short = (sha: string): string => (sha.length >= 12 ? sha.slice(0, 12) : sha);

/**
 * Render `organisms/<id>/REPORT.md` from the machine result — the Markdown is
 * never the authority (D13), which is what makes result↔report consistency a
 * checkable property instead of a hope.  The nine sections follow
 * campaign-report.interface.md § Individual organism report; an empty section
 * writes `Aucun` explicitly rather than disappearing.
 */
export function renderOrganismReportMd(
  result: OrganismAuditResult,
  context: OrganismReportContext,
): string {
  const lines: string[] = [];
  const push = (text = ''): void => {
    lines.push(text);
  };

  push(`# Dossier d'audit — ${result.displayName} (\`${result.contract.id}\`)`);
  push();
  push('> Généré depuis `result.json` — le Markdown n\'est jamais l\'autorité du verdict.');
  push();

  push('## 1. Identité');
  push();
  push('| Champ | Valeur |');
  push('|---|---|');
  push(`| Sujet | \`${result.id}\` (${result.displayName}) |`);
  push(`| Vague | ${result.wave} |`);
  push(`| Contrat | \`${result.contract.id}\` v${result.contract.version} — \`${result.contract.path}\` |`);
  push(`| Node master Figma | \`${result.figmaSetNodeId}\` |`);
  push(`| Référence Figma | \`${context.reference.fileKey}\` @ version \`${context.reference.fileVersion}\` (lecture seule) |`);
  push();

  push('## 2. Audits de propreté réutilisés (Step 0)');
  push();
  if (context.auditRefs.length === 0) push('Aucun');
  for (const ref of context.auditRefs) push(`- \`${ref}\``);
  push();

  push('## 3. Dépendance');
  push();
  if (result.dependency === null) {
    push('Aucune — cet organisme ne déclare pas de dépendance de clôture.');
  } else {
    const d = result.dependency;
    push('| Champ | Valeur |');
    push('|---|---|');
    push(`| Dépendance | \`${d.dependencyContractId}\` v${d.contractVersion} |`);
    push(`| Reçu | \`${d.resultPath}\` (sha256 \`${short(d.resultSha256)}\`) |`);
    push(`| Verdict brut du reçu | \`${d.receiptVerdict}\` |`);
    push(`| Verdict mappé (013) | \`${d.actualVerdict}\` |`);
    push(`| Probant (dérivé) | ${d.probative} |`);
    push(`| Porte ouverte | ${d.open} |`);
    push(`| Motifs | ${d.reasons.map((r) => `\`${r}\``).join(', ') || '—'} |`);
  }
  push();

  push('## 4. Couverture exacte');
  push();
  push(`- attendus : ${result.coverage.expected.length}`);
  push(`- observés : ${result.coverage.observed.length}`);
  push(
    `- manquants : ${result.coverage.missing.length === 0 ? '**aucun**' : result.coverage.missing.map((m) => `\`${m}\``).join(', ')}`,
  );
  push(
    `- inattendus : ${result.coverage.unexpected.length === 0 ? '**aucun**' : result.coverage.unexpected.map((u) => `\`${u}\``).join(', ')}`,
  );
  push();

  push('## 5. Faits');
  push();
  push('| Fait | Catégorie | Représentabilité | Jambe Figma | Jambe contrat | Jambe générée | Verdict | Source localisée | Motifs |');
  push('|---|---|---|---|---|---|---|---|---|');
  for (const fact of result.facts) {
    push(
      `| \`${fact.id}\` | ${fact.kind} | ${fact.representability} | ${cell(fact.figma.reference)} | ${cell(fact.contract.reference)} | ${cell(fact.generated.reference)} | **${fact.outcome}** | ${cell(fact.localizedSource)} | ${cell(fact.reasons.join('; '))} |`,
    );
  }
  if (result.facts.length === 0) push('| Aucun | | | | | | | | |');
  push();

  push('## 6. Cas et artefacts');
  push();
  if (result.cases.length === 0) {
    push('Aucun cas — aucun cas parent n\'est fabriqué sous une porte de dépendance fermée.');
  }
  for (const caseResult of result.cases) {
    push(`### Cas \`${caseResult.id}\``);
    push();
    push('| Mesure | Valeur |');
    push('|---|---|');
    push(`| Verdict | **${caseResult.verdict}** (probant : ${caseResult.probative}) |`);
    push(`| Node Figma | \`${caseResult.figma.nodeId}\` @ v\`${caseResult.figma.fileVersion}\` — PNG ${caseResult.figma.width}×${caseResult.figma.height}, sha \`${short(caseResult.figma.pngSha256)}\` |`);
    push(`| Rendu généré | \`${caseResult.generated.componentFile}\` export \`${caseResult.generated.export}\`, bundle \`${short(caseResult.generated.bundleSha256)}\`, fonts ${caseResult.generated.fontsLoaded ? 'chargées' : 'NON CHARGÉES'} |`);
    push(`| Pixels | brut ${caseResult.pixels.rawPct.toFixed(3)} % (seuil ${caseResult.pixels.thresholdPct} %) — diagnostic masqué ${caseResult.pixels.maskedDiagnosticPct === null ? '—' : `${caseResult.pixels.maskedDiagnosticPct.toFixed(3)} %`} (hors calcul autoritaire) |`);
    push(`| Régions | ${caseResult.pixels.regions.map((r) => `\`${r.id}\` ${r.score.toFixed(3)} %/${r.maxDiffPct} % (${r.signalPixels} px signal)`).join(' · ') || '—'} |`);
    push(`| Géométrie racine | Figma ${caseResult.geometry.figmaRoot.width}×${caseResult.geometry.figmaRoot.height} vs généré ${caseResult.geometry.generatedRoot.width}×${caseResult.geometry.generatedRoot.height} (Δ ${caseResult.geometry.deltaPx.width}×${caseResult.geometry.deltaPx.height}) — ${caseResult.geometry.verdict} |`);
    push(`| Visibilité | signal Figma ${caseResult.visibility.figma.signalPixels} px · généré ${caseResult.visibility.generated.signalPixels} px · contraste ${caseResult.visibility.contrastOk ? 'ok' : 'KO'} |`);
    push(`| Motifs | ${caseResult.reasons.map((r) => `\`${r}\``).join(', ') || '—'} |`);
    push();
    if (caseResult.semantics.length > 0) {
      push('| Assertion sémantique | Sélecteur | Pointeur contractuel | Verdict |');
      push('|---|---|---|---|');
      for (const s of caseResult.semantics) {
        push(`| \`${s.id}\` | \`${cell(s.selector)}\` | \`${s.contractPointer}\` | ${s.verdict} |`);
      }
      push();
    }
    if (caseResult.domProbes.length > 0) {
      push('| Probe de projection (D6) | Prop | Valeur injectée | Valeur observée dans le DOM | Projetée |');
      push('|---|---|---|---|---|');
      for (const probe of caseResult.domProbes) {
        push(`| \`${probe.factId}\` | \`${probe.prop}\` | ${cell(JSON.stringify(probe.probeValue))} | ${cell(probe.observedDomValue)} | ${probe.projected ? 'oui' : '**non**'} |`);
      }
      push();
    }
    push('| Artefact | Chemin | sha256 | Taille |');
    push('|---|---|---|---|');
    for (const artifact of caseResult.artifacts) {
      push(`| ${artifact.kind} | \`${artifact.path}\` | \`${short(artifact.sha256)}\` | ${artifact.width !== null ? `${artifact.width}×${artifact.height}, ` : ''}${artifact.bytes} o |`);
    }
    push();
  }

  push('## 7. Divergences, limites nommées et travaux reportés');
  push();
  const divergent = result.facts.filter((f) => f.outcome === 'divergent');
  const limited = result.facts.filter((f) => f.outcome === 'limited');
  const notProven = result.facts.filter((f) => f.outcome === 'not-proven');
  if (divergent.length === 0 && limited.length === 0 && notProven.length === 0 && context.knownLimits.length === 0 && context.deferredWork.length === 0) {
    push('Aucun');
  }
  for (const fact of divergent) {
    push(`- **Divergence** \`${fact.id}\` — source : **${fact.localizedSource}** — ${fact.reasons.join(' ; ')}`);
  }
  for (const fact of limited) {
    push(`- **Limite** \`${fact.id}\` — ${fact.reasons.join(' ; ')}`);
  }
  for (const fact of notProven) {
    push(`- **Non prouvé** \`${fact.id}\` — ${fact.reasons.join(' ; ')}`);
  }
  for (const limit of context.knownLimits) {
    push(`- **Limite déclarée d'avance** \`${limit.id}\` (impact attendu : ${limit.expectedVerdictImpact}) — ${limit.statement}`);
  }
  for (const item of context.deferredWork) {
    push(`- **Travail reporté** \`${item.id}\` (fait \`${item.factId}\`, catégorie \`${item.category}\`, impact \`${item.verdictImpact}\`)`);
  }
  push();

  push('## 8. Verdict');
  push();
  push(`**\`${result.verdict}\`** — motifs : ${result.reasons.map((r) => `\`${r}\``).join(', ') || 'aucun'}`);
  push();
  push('Règle d\'agrégation appliquée (fail-closed, data-model §10) :');
  push();
  push('```text');
  push('blocked    si dependencyOpen == false');
  push('divergent  sinon si au moins un fait/cas est divergent/fail');
  push('not-proven sinon si couverture inexacte ou preuve non probante');
  push('limited    sinon si au moins un fait est limited');
  push('proved     sinon si tous les faits requis et cas sont proved/pass');
  push('```');
  push();

  push('## 9. Historique initial → remédié');
  push();
  if (context.remediation === null || context.remediation.length === 0) {
    push('Aucun — aucune remédiation locale n\'a été appliquée à cet organisme.');
  } else {
    for (const stage of context.remediation) {
      push(`- ${stage.stage} : \`${stage.verdict}\` (\`${stage.resultPath}\`)`);
    }
  }
  push();

  return lines.join('\n');
}
