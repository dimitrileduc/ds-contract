/**
 * Adversarial closure-audit vectors for Visual Campaign 011.
 *
 * This fixture intentionally contains a tiny, in-memory oracle rather than
 * importing the pending terminal auditor.  It fixes the observable contract
 * before T047 exists: checkpoint→WIP history is not feature attribution,
 * generated files require a named authorized cause and local regeneration
 * command, only the two terminal receipts may self-exclude, and a recorded
 * Figma write command refuses closure.  It performs no filesystem, network,
 * process, or Figma activity.
 */

type FailureCode =
  | "attribution-boundary"
  | "unattributed-final-change"
  | "preexisting-wip-mutated"
  | "generated-output-direct-edit"
  | "generated-output-provenance"
  | "self-receipt-exclusions"
  | "figma-write-command";

type FileHashes = Record<string, string>;
type ChangeKind = "source" | "proof" | "generated";

interface DeclaredChange {
  path: string;
  kind: ChangeKind;
  /** Source paths that caused a generated artifact to be regenerated. */
  causalSources?: readonly string[];
  /** The local regeneration command recorded in the terminal receipt. */
  generatorCommand?: string;
}

interface AttributionAuditInput {
  /** Immutable historical checkpoint, used only to classify prior history. */
  checkpoint: FileHashes;
  /** Shared committed WIP baseline; it must never be restored or overwritten. */
  wip: FileHashes;
  /** Worktree snapshot taken before the 011 implementation starts. */
  initial: FileHashes;
  /** Worktree snapshot at terminal closure, before receipt self-exclusions. */
  final: FileHashes;
  /** Initial dirty paths outside this feature which must remain byte-identical. */
  protectedWipPaths: readonly string[];
  /** Every WIP→final change claimed by this feature. */
  changes: readonly DeclaredChange[];
  /** Commands actually recorded as having run during the feature. */
  executedCommands: readonly string[];
  /** Snapshot exclusions declared by both terminal receipts. */
  selfReceiptExclusions: readonly string[];
}

interface AuditResult {
  failures: FailureCode[];
  /** checkpoint→WIP only: useful context, never attributable to 011. */
  historicalPaths: string[];
  /** WIP→initial only: shared work that must not be silently claimed. */
  preexistingWipPaths: string[];
  /** initial→final only: the candidate 011 delta. */
  attributablePaths: string[];
}

const FEATURE_ROOT = "specs/011-fix-molecule-convergence/";
const PROOF_ROOT = `${FEATURE_ROOT}proofs/`;
const SELF_RECEIPTS = [
  `${FEATURE_ROOT}proofs/attribution/final.json`,
  `${FEATURE_ROOT}proofs/closure/gates.json`,
] as const;

const GENERATED_OUTPUT_PREFIXES = [
  "src/components/",
  "figma-sync/",
  "catalog/",
  "core/samples/",
] as const;

const LOCAL_GENERATION_COMMANDS = [
  "npm run build",
  "npm run generate",
  "npm run figma:plan",
  "npm run catalog",
  "npm run emitters:check",
] as const;

const sameMembers = (
  left: readonly string[],
  right: readonly string[],
): boolean =>
  left.length === right.length &&
  new Set(left).size === left.length &&
  new Set(right).size === right.length &&
  [...left].every((entry) => right.includes(entry));

const changedPaths = (before: FileHashes, after: FileHashes): string[] =>
  [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((path) => before[path] !== after[path])
    .sort();

const isGeneratedOutput = (path: string): boolean =>
  path === "contracts/contract.schema.json" ||
  GENERATED_OUTPUT_PREFIXES.some((prefix) => path.startsWith(prefix));

const isAuthorizedSource = (path: string): boolean =>
  (path.startsWith("contracts/") &&
    path !== "contracts/contract.schema.json") ||
  path.startsWith("packages/schema/src/") ||
  (path.startsWith("core/") && !path.startsWith("core/samples/")) ||
  path.startsWith("extract/figma/visual-parity/") ||
  path.startsWith("evals/") ||
  path.startsWith("scripts/");

const isRecordedLocalGeneration = (
  command: string | undefined,
  executedCommands: readonly string[],
): boolean =>
  command !== undefined &&
  LOCAL_GENERATION_COMMANDS.includes(
    command as (typeof LOCAL_GENERATION_COMMANDS)[number],
  ) &&
  executedCommands.includes(command);

/**
 * A command receipt is data, not source text: only commands that were run are
 * inspected.  GET Figma access and local `figma:plan` generation stay valid;
 * Figma-mutating HTTP requests, write-oriented Figma tasks, and bridge calls
 * carrying a mutation verb do not.
 */
function isForbiddenFigmaWrite(command: string): boolean {
  const mentionsFigma = /(?:api\.)?figma\.com\b|\bfigma(?:[:/._-]|\s)/i.test(
    command,
  );
  const hasHttpWriteMethod =
    /(?:--request(?:=|\s+)|-X\s*)(?:POST|PUT|PATCH|DELETE)\b/i.test(command);
  const hasFigmaWriteTask =
    /\bfigma:(?:push|write|writeback|update|create|delete|mutate)\b/i.test(
      command,
    );
  const hasMutatingBridgeCall =
    /\bfigma(?:_|-)execute\b/i.test(command) &&
    /\b(?:push|write|writeback|update|create|delete|mutate|set|remove)\b/i.test(
      command,
    );

  return (
    (mentionsFigma && hasHttpWriteMethod) ||
    hasFigmaWriteTask ||
    hasMutatingBridgeCall
  );
}

/**
 * The production implementation in T047 must retain these transition rules
 * while replacing these fixtures with real read-only Git/path-hash receipts.
 */
function auditAttribution(input: AttributionAuditInput): AuditResult {
  const failures = new Set<FailureCode>();
  const historicalPaths = changedPaths(input.checkpoint, input.wip);
  const preexistingWipPaths = changedPaths(input.wip, input.initial);
  const attributablePaths = changedPaths(input.initial, input.final);
  const attributableSet = new Set(attributablePaths);
  const protectedSet = new Set(input.protectedWipPaths);
  const changesByPath = new Map<string, DeclaredChange>();

  for (const change of input.changes) {
    if (!attributableSet.has(change.path) || changesByPath.has(change.path)) {
      failures.add("attribution-boundary");
      continue;
    }
    changesByPath.set(change.path, change);
  }

  for (const path of attributablePaths) {
    const change = changesByPath.get(path);

    // A dirty file that predates the feature is shared WIP, not evidence that
    // 011 owns it.  Preserve it before considering any declaration.
    if (protectedSet.has(path)) {
      failures.add("preexisting-wip-mutated");
      continue;
    }

    if (isGeneratedOutput(path)) {
      if (!change || change.kind !== "generated") {
        failures.add("generated-output-direct-edit");
        continue;
      }

      if (
        !change.causalSources ||
        change.causalSources.length === 0 ||
        !change.causalSources.every(isAuthorizedSource) ||
        !isRecordedLocalGeneration(
          change.generatorCommand,
          input.executedCommands,
        )
      ) {
        failures.add("generated-output-provenance");
      }
      continue;
    }

    if (!change) {
      failures.add("unattributed-final-change");
      continue;
    }

    if (
      (change.kind === "source" && !isAuthorizedSource(path)) ||
      (change.kind === "proof" && !path.startsWith(PROOF_ROOT)) ||
      change.kind === "generated"
    ) {
      failures.add("attribution-boundary");
    }
  }

  if (!sameMembers(input.selfReceiptExclusions, SELF_RECEIPTS)) {
    failures.add("self-receipt-exclusions");
  }

  if (input.executedCommands.some(isForbiddenFigmaWrite)) {
    failures.add("figma-write-command");
  }

  return {
    failures: [...failures].sort(),
    historicalPaths,
    preexistingWipPaths,
    attributablePaths,
  };
}

const sha = (character: string): string => character.repeat(64);
const clone = <T>(value: T): T => structuredClone(value);

const baseline = (): AttributionAuditInput => ({
  checkpoint: {
    "contracts/nav-item.contract.json": sha("a"),
    "contracts/carte.contract.json": sha("b"),
    "docs/legacy-handoff.md": sha("c"),
  },
  wip: {
    // This checkpoint→WIP correction is historical context, not 011 work.
    "contracts/nav-item.contract.json": sha("d"),
    "contracts/carte.contract.json": sha("b"),
    "docs/legacy-handoff.md": sha("c"),
  },
  initial: {
    "contracts/nav-item.contract.json": sha("d"),
    "contracts/carte.contract.json": sha("b"),
    "docs/legacy-handoff.md": sha("c"),
    // The initial worktree contains unrelated WIP which must survive intact.
    "docs/reviewer-notes.md": sha("e"),
  },
  final: {
    "contracts/nav-item.contract.json": sha("d"),
    "contracts/carte.contract.json": sha("f"),
    "docs/legacy-handoff.md": sha("c"),
    "docs/reviewer-notes.md": sha("e"),
    "src/components/Carte/Carte.tsx": sha("1"),
    "specs/011-fix-molecule-convergence/proofs/visual/result.json": sha("2"),
  },
  protectedWipPaths: ["docs/reviewer-notes.md"],
  changes: [
    { path: "contracts/carte.contract.json", kind: "source" },
    {
      path: "src/components/Carte/Carte.tsx",
      kind: "generated",
      causalSources: ["contracts/carte.contract.json"],
      generatorCommand: "npm run build",
    },
    {
      path: "specs/011-fix-molecule-convergence/proofs/visual/result.json",
      kind: "proof",
    },
  ],
  executedCommands: [
    "npm run build",
    "curl --request GET https://api.figma.com/v1/files/d9FYAUcqdcNtsuaMgLefvJ",
    "npm run figma:plan",
  ],
  selfReceiptExclusions: [...SELF_RECEIPTS],
});

function expectAudit(
  name: string,
  input: AttributionAuditInput,
  expectedFailures: readonly FailureCode[],
): AuditResult {
  const result = auditAttribution(input);
  const expected = [...expectedFailures].sort();
  if (result.failures.join(",") !== expected.join(",")) {
    throw new Error(
      `${name}: expected ${expected.join(", ") || "pass"}, got ${result.failures.join(", ") || "pass"}`,
    );
  }
  return result;
}

// The three snapshots deliberately disagree in different places.  Only
// initial→final paths are attributable; checkpoint→WIP remains historical.
{
  const result = expectAudit("complete terminal receipt", baseline(), []);
  const expectedHistorical = ["contracts/nav-item.contract.json"];
  const expectedPreexisting = ["docs/reviewer-notes.md"];
  const expectedAttributable = [
    "contracts/carte.contract.json",
    "specs/011-fix-molecule-convergence/proofs/visual/result.json",
    "src/components/Carte/Carte.tsx",
  ];
  if (
    result.historicalPaths.join(",") !== expectedHistorical.join(",") ||
    result.preexistingWipPaths.join(",") !== expectedPreexisting.join(",") ||
    result.attributablePaths.join(",") !== expectedAttributable.join(",")
  ) {
    throw new Error(
      `attribution boundary was collapsed: ${JSON.stringify(result)}`,
    );
  }
}

{
  const input = clone(baseline());
  input.final["docs/reviewer-notes.md"] = sha("9");
  expectAudit("pre-existing unrelated WIP is preserved", input, [
    "preexisting-wip-mutated",
  ]);
}

{
  const input = clone(baseline());
  input.changes = [
    ...input.changes,
    { path: "contracts/nav-item.contract.json", kind: "source" },
  ];
  expectAudit("checkpoint-to-WIP history cannot be claimed as 011", input, [
    "attribution-boundary",
  ]);
}

{
  const input = clone(baseline());
  input.final["docs/legacy-handoff.md"] = sha("9");
  input.changes = [
    ...input.changes,
    { path: "docs/legacy-handoff.md", kind: "source" },
  ];
  expectAudit(
    "out-of-scope source cannot cross the attribution boundary",
    input,
    ["attribution-boundary"],
  );
}

{
  const input = clone(baseline());
  input.changes = input.changes.filter(
    (change) =>
      change.path !==
      "specs/011-fix-molecule-convergence/proofs/visual/result.json",
  );
  expectAudit("unexplained non-generated terminal path", input, [
    "unattributed-final-change",
  ]);
}

{
  const input = clone(baseline());
  const generated = input.changes.find((change) => change.kind === "generated");
  if (!generated) throw new Error("fixture lost generated-output declaration");
  generated.kind = "source";
  expectAudit("hand-editing generated output", input, [
    "generated-output-direct-edit",
  ]);
}

{
  const input = clone(baseline());
  const generated = input.changes.find((change) => change.kind === "generated");
  if (!generated) throw new Error("fixture lost generated-output declaration");
  generated.causalSources = ["src/components/Carte/Carte.tsx"];
  expectAudit("generated output cannot cite itself as its cause", input, [
    "generated-output-provenance",
  ]);
}

{
  const input = clone(baseline());
  const generated = input.changes.find((change) => change.kind === "generated");
  if (!generated) throw new Error("fixture lost generated-output declaration");
  generated.generatorCommand = "touch src/components/Carte/Carte.tsx";
  expectAudit("generated output needs a recorded regeneration command", input, [
    "generated-output-provenance",
  ]);
}

{
  const input = clone(baseline());
  input.selfReceiptExclusions = [SELF_RECEIPTS[0]];
  expectAudit("missing terminal self-receipt exclusion", input, [
    "self-receipt-exclusions",
  ]);
}

{
  const input = clone(baseline());
  input.selfReceiptExclusions = [
    ...SELF_RECEIPTS,
    `${FEATURE_ROOT}proofs/visual/result.json`,
  ];
  expectAudit("third self-receipt exclusion", input, [
    "self-receipt-exclusions",
  ]);
}

for (const command of [
  "curl -X POST https://api.figma.com/v1/files/d9FYAUcqdcNtsuaMgLefvJ",
  "curl --request=PATCH https://api.figma.com/v1/files/d9FYAUcqdcNtsuaMgLefvJ",
  "npm run figma:push",
  "figma_execute update node 2063:1606",
] as const) {
  const input = clone(baseline());
  input.executedCommands = [...input.executedCommands, command];
  expectAudit(`forbidden Figma write command: ${command}`, input, [
    "figma-write-command",
  ]);
}

console.log(
  "✔ attribution audit preserves checkpoint/WIP boundaries, requires generated provenance, permits only two self-receipts, and rejects Figma writes",
);
