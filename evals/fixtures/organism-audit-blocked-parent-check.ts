/**
 * Adversarial contract for the dossier of a DEPENDENCY-BLOCKED parent (013).
 *
 * `Equipe`, `Formulaire` and `Header` compose molecules whose own proof is not
 * positive.  The tempting shortcuts are all false-greens, and this fixture
 * refuses each of them:
 *
 *   - skipping the parent entirely, so absence of a test reads as validation;
 *   - fabricating a parent case so the dossier "looks" complete;
 *   - letting a parent's own aggregate score outvote its child's defect.
 *
 * A blocked parent gets a COMPLETE dossier: its DependencyGateResult, no
 * invented cases, a typed reason, and no positive verdict available to it.
 *
 *   buildBlockedParentDossier({ target, gateResult })
 *
 * Reference: contracts/audit-result.interface.md (Dependency gate result,
 * Organism result), data-model.md §4/§10, research.md D9, tasks.md T019/T056.
 */
import {
  buildBlockedParentDossier,
  type BlockedParentInput,
} from "../../extract/figma/organism-audit/report.js";
import type { DependencyGateResult } from "../../extract/figma/organism-audit/dependencies.js";

const RECEIPT_PATH = "specs/011-fix-molecule-convergence/proofs/visual/result.json";
const RECEIPT_SHA = "c".repeat(64);

/** The three real wave-3 pairings (data-model §3). */
const TARGETS: Record<string, BlockedParentInput["target"]> = {
  equipe: {
    id: "equipe",
    displayName: "Equipe",
    wave: 3,
    contractId: "ds.equipe",
    contractVersion: "1.0.0",
    contractPath: "contracts/equipe.contract.json",
    figmaSetNodeId: "2115:3947",
    dependencyId: "ds.member-card",
    requiredFactIds: ["equipe.composition.member-card", "equipe.structure.root"],
  },
  formulaire: {
    id: "formulaire",
    displayName: "Formulaire",
    wave: 3,
    contractId: "ds.formulaire",
    contractVersion: "1.0.0",
    contractPath: "contracts/formulaire.contract.json",
    figmaSetNodeId: "2096:2564",
    dependencyId: "ds.field",
    requiredFactIds: ["formulaire.composition.field"],
  },
  header: {
    id: "header",
    displayName: "Header",
    wave: 3,
    contractId: "ds.header",
    contractVersion: "1.0.0",
    contractPath: "contracts/header.contract.json",
    figmaSetNodeId: "84:285",
    dependencyId: "ds.nav-item",
    requiredFactIds: ["header.composition.nav-item"],
  },
};

/** A closed gate, exactly as the evaluator derives it — nothing hand-entered. */
function closedGate(
  parentSubjectId: string,
  dependencyContractId: string,
  contractVersion: string,
  receiptVerdict: string,
  actualVerdict: DependencyGateResult["actualVerdict"],
): DependencyGateResult {
  return {
    parentSubjectId,
    dependencyContractId,
    receiptSchema: "visual-campaign-v1",
    resultPath: RECEIPT_PATH,
    resultSha256: RECEIPT_SHA,
    contractVersion,
    figmaFileVersion: "2381568261081914456",
    receiptVerdict,
    probative: true,
    actualVerdict,
    staleReasons: [],
    open: false,
    reasons: [`dependency-not-proved:${dependencyContractId}`],
  };
}

// The three retained 011 verdicts, mapped normatively (research.md D9).
const GATES: Record<string, DependencyGateResult> = {
  equipe: closedGate("equipe", "ds.member-card", "1.2.0", "blocked", "blocked"),
  formulaire: closedGate("formulaire", "ds.field", "2.0.0", "blocked", "blocked"),
  // NavItem's raw receipt says `fail`; the mapped verdict is `divergent`.
  header: closedGate("header", "ds.nav-item", "1.1.0", "fail", "divergent"),
};

function build(id: string, overrides: Partial<BlockedParentInput> = {}) {
  return buildBlockedParentDossier({
    target: TARGETS[id],
    gateResult: GATES[id],
    ...overrides,
  } as BlockedParentInput);
}

// ---------------------------------------------------------------------------
// A blocked parent still gets a COMPLETE dossier.
// ---------------------------------------------------------------------------
for (const id of ["equipe", "formulaire", "header"]) {
  const { result, issues } = build(id);
  const gate = GATES[id];

  if (issues.length > 0) {
    throw new Error(
      `${id}: a correctly blocked parent must build without issues; got ${issues
        .map((i) => `${i.code}@${i.path}`)
        .join(", ")}`,
    );
  }
  if (result.verdict !== "blocked") {
    throw new Error(`${id}: expected verdict blocked, got ${result.verdict}`);
  }

  // "l'absence de test ne vaut jamais validation" — the dossier must EXIST and
  // must carry the whole gate, not merely name the dependency.
  const dependency = result.dependency;
  if (!dependency) throw new Error(`${id}: a blocked parent must carry its DependencyGateResult`);

  for (const [field, expected] of [
    ["resultPath", gate.resultPath],
    ["resultSha256", gate.resultSha256],
    ["contractVersion", gate.contractVersion],
    ["figmaFileVersion", gate.figmaFileVersion],
    ["receiptVerdict", gate.receiptVerdict],
    ["actualVerdict", gate.actualVerdict],
  ] as const) {
    if ((dependency as Record<string, unknown>)[field] !== expected) {
      throw new Error(
        `${id}: dependency.${field} must be carried verbatim from the gate ` +
          `(expected ${String(expected)}, got ${String((dependency as Record<string, unknown>)[field])})`,
      );
    }
  }
  if (dependency.probative !== true) throw new Error(`${id}: derived probative must be carried`);
  if (dependency.open !== false) throw new Error(`${id}: a blocked parent's gate must be closed`);
  if (!Array.isArray(dependency.staleReasons)) {
    throw new Error(`${id}: staleReasons must be present (possibly empty), never absent`);
  }
  if (dependency.reasons.length === 0) {
    throw new Error(`${id}: a closed gate must carry typed reasons`);
  }

  // The reason must name the dependency — "blocked" alone is not actionable,
  // and the report must be able to cite the receipt rather than just the name.
  const namesDependency = result.reasons.some((reason) =>
    reason.includes(gate.dependencyContractId),
  );
  if (!namesDependency) {
    throw new Error(
      `${id}: the organism reason must name its dependency; got ${result.reasons.join("; ") || "none"}`,
    );
  }

  // No fabricated parent case.  Inventing one would produce measurements that
  // look like evidence for a component whose prerequisite was never proven.
  if (result.cases.length !== 0) {
    throw new Error(
      `${id}: a blocked parent must fabricate no parent case; got ${result.cases.length}`,
    );
  }

  // The required facts stay DECLARED — that is what makes the block legible
  // rather than an empty dossier — but none of them may be positive.
  const declared = new Set(result.facts.map((f) => f.id));
  for (const factId of TARGETS[id].requiredFactIds) {
    if (!declared.has(factId)) {
      throw new Error(`${id}: required fact ${factId} must remain declared under a closed gate`);
    }
  }
  for (const fact of result.facts) {
    if (fact.outcome === "proved") {
      throw new Error(`${id}: fact ${fact.id} cannot be proved while the dependency gate is closed`);
    }
  }

  // Coverage must be honest: the facts are expected but not observed.
  if (result.coverage.expected.length === 0) {
    throw new Error(`${id}: a blocked dossier must still declare its expected coverage`);
  }
}

// Header carries BOTH values: the raw receipt verdict and its mapped form.
// Collapsing them would hide that `fail` was interpreted, not read.
{
  const { result } = build("header");
  if (result.dependency?.receiptVerdict !== "fail") {
    throw new Error("header must retain the raw receipt verdict `fail`");
  }
  if (result.dependency?.actualVerdict !== "divergent") {
    throw new Error("header must retain the mapped verdict `divergent`");
  }
}

// ---------------------------------------------------------------------------
// No positive verdict is reachable while the gate is closed.
// ---------------------------------------------------------------------------
for (const forced of ["proved", "limited"] as const) {
  const { result, issues } = build("equipe", { forcedVerdict: forced } as Partial<BlockedParentInput>);
  const refused = issues.length > 0;
  if (!refused && result.verdict === forced) {
    throw new Error(
      `a closed dependency gate must refuse a forced ${forced} verdict; got ${result.verdict}`,
    );
  }
  if (result.verdict !== "blocked") {
    throw new Error(`a blocked parent must stay blocked, got ${result.verdict}`);
  }
}

// A parent's own aggregate cannot outvote its child's defect: even if every
// parent-level signal is perfect, the closed gate still decides.
{
  const { result } = build("equipe", {
    parentSignals: { coverageExact: true, allFactsProved: true, allCasesPass: true },
  } as Partial<BlockedParentInput>);
  if (result.verdict !== "blocked") {
    throw new Error(
      `a perfect parent score must not mask a blocked dependency; got ${result.verdict}`,
    );
  }
}

// An OPEN gate must not be routed through the blocked-dossier builder at all —
// that would manufacture a block where the evidence path should have run.
{
  const openGate: DependencyGateResult = { ...GATES.equipe, open: true, reasons: [] };
  const { issues } = buildBlockedParentDossier({
    target: TARGETS.equipe,
    gateResult: openGate,
  } as BlockedParentInput);
  if (issues.length === 0) {
    throw new Error("an open gate must not be accepted by the blocked-parent dossier builder");
  }
}

console.log(
  "✔ a dependency-blocked parent receives a complete dossier — full DependencyGateResult (raw and mapped verdicts), " +
    "declared-but-unproved facts, zero fabricated cases, typed reasons naming the dependency — and no parent-level " +
    "score, forced verdict or open gate can turn it positive",
);
