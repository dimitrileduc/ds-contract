#!/usr/bin/env node

/**
 * Read-only attribution gate for feature 011.
 *
 * The historical checkpoint and the shared WIP commit are context, never
 * feature ownership.  This script deliberately has no write API: it reads
 * Git objects and the worktree, then prints a deterministic ledger that the
 * terminal closure orchestrator may embed in its two self-referential
 * receipts.
 *
 * Usage:
 *   node scripts/verify-011-attribution.mjs
 *   node scripts/verify-011-attribution.mjs --receipt \
 *     specs/011-fix-molecule-convergence/proofs/attribution/final.json
 *
 * A receipt is optional only for inspection.  To pass the gate it must name
 * every attributable path, its kind, generated-output causal source(s), the
 * recorded local generation command, and the commands executed during the
 * feature.  The only receipt paths accepted as input are the two fixed
 * self-receipts; arbitrary manifests would create an exclusion escape hatch.
 */

import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  readlinkSync,
} from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FEATURE_ROOT = "specs/011-fix-molecule-convergence/";
const INITIAL_RECEIPT = `${FEATURE_ROOT}proofs/attribution/initial.json`;
const SELF_RECEIPTS = Object.freeze([
  `${FEATURE_ROOT}proofs/attribution/final.json`,
  `${FEATURE_ROOT}proofs/closure/gates.json`,
]);
const GENERATED_OUTPUT_PREFIXES = Object.freeze([
  "src/components/",
  "figma-sync/",
  "catalog/",
  "core/samples/",
]);
const LOCAL_GENERATION_COMMANDS = Object.freeze([
  "npm run build",
  "npm run generate",
  "npm run figma:plan",
  "npm run catalog",
  "npm run emitters:check",
]);

function usage() {
  return [
    "Usage: node scripts/verify-011-attribution.mjs [--receipt <terminal-receipt>]",
    "",
    "The optional receipt must be exactly one of:",
    ...SELF_RECEIPTS.map((receipt) => `  ${receipt}`),
  ].join("\n");
}

function parseArgs(argv) {
  let receipt;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      process.stdout.write(`${usage()}\n`);
      process.exit(0);
    }
    if (argument === "--receipt") {
      if (receipt || index + 1 >= argv.length) {
        throw new Error("--receipt must be supplied exactly once with a path");
      }
      receipt = argv[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }

  if (!receipt) return undefined;
  const normalized = normalizeRepoPath(receipt);
  if (!SELF_RECEIPTS.includes(normalized)) {
    throw new Error(
      `--receipt must be one of the fixed terminal receipts, not ${normalized}`,
    );
  }
  return normalized;
}

function normalizeRepoPath(value) {
  if (typeof value !== "string" || value.length === 0 || path.isAbsolute(value)) {
    throw new Error("A repository-relative path is required");
  }
  const normalized = path.posix.normalize(value.replaceAll(path.sep, "/"));
  if (normalized === "." || normalized === ".." || normalized.startsWith("../")) {
    throw new Error(`Path escapes the repository: ${value}`);
  }
  return normalized.replace(/^\.\//, "");
}

function absolutePath(repoPath) {
  const normalized = normalizeRepoPath(repoPath);
  const resolved = path.resolve(ROOT, normalized);
  if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) {
    throw new Error(`Path escapes the repository: ${repoPath}`);
  }
  return resolved;
}

function runGit(arguments_, options = {}) {
  return execFileSync("git", arguments_, {
    cwd: ROOT,
    encoding: options.encoding === undefined ? "utf8" : options.encoding,
    maxBuffer: 128 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function isSha256(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function sameMembers(left, right) {
  return (
    Array.isArray(left) &&
    left.length === right.length &&
    new Set(left).size === left.length &&
    left.every((entry) => right.includes(entry))
  );
}

function readJson(repoPath) {
  const source = readFileSync(absolutePath(repoPath), "utf8");
  return JSON.parse(source);
}

function resolveCommit(commit, label) {
  if (typeof commit !== "string" || !/^[a-f0-9]{7,64}$/i.test(commit)) {
    throw new Error(`${label} must be a Git commit id`);
  }
  return runGit(["rev-parse", "--verify", `${commit}^{commit}`]).trim();
}

function gitBlobHash(commit, repoPath) {
  return gitBlobHashes(commit, [repoPath]).get(repoPath) ?? null;
}

/**
 * `git show` once per file made the otherwise read-only verifier painfully
 * slow for the committed PNG evidence.  Batch the object reads instead, while
 * continuing to hash raw bytes rather than Git's SHA-1 object ids.
 */
function gitBlobHashes(commit, repoPaths) {
  const result = new Map();
  const paths = uniqueSorted(repoPaths);
  const chunkSize = 64;

  for (let start = 0; start < paths.length; start += chunkSize) {
    const chunk = paths.slice(start, start + chunkSize);
    const processResult = spawnSync("git", ["cat-file", "--batch"], {
      cwd: ROOT,
      input: Buffer.from(chunk.map((entry) => `${commit}:${entry}`).join("\n") + "\n"),
      encoding: null,
      maxBuffer: 256 * 1024 * 1024,
      stdio: ["pipe", "pipe", "pipe"],
    });
    if (processResult.error) throw processResult.error;
    if (processResult.status !== 0 || !processResult.stdout) {
      const stderr = processResult.stderr?.toString("utf8").trim();
      throw new Error(`git cat-file failed${stderr ? `: ${stderr}` : ""}`);
    }

    const output = processResult.stdout;
    let offset = 0;
    for (const repoPath of chunk) {
      const lineEnd = output.indexOf(0x0a, offset);
      if (lineEnd === -1) throw new Error("git cat-file returned an incomplete header");
      const header = output.subarray(offset, lineEnd).toString("utf8");
      offset = lineEnd + 1;
      const fields = header.split(" ");
      if (fields.at(-1) === "missing") {
        result.set(repoPath, null);
        continue;
      }
      const size = Number(fields[2]);
      if (fields.length !== 3 || fields[1] !== "blob" || !Number.isSafeInteger(size) || size < 0) {
        throw new Error(`git cat-file returned an invalid object header: ${header}`);
      }
      const contentEnd = offset + size;
      if (contentEnd >= output.length || output[contentEnd] !== 0x0a) {
        throw new Error("git cat-file returned an incomplete object body");
      }
      result.set(repoPath, sha256(output.subarray(offset, contentEnd)));
      offset = contentEnd + 1;
    }
    if (offset !== output.length) throw new Error("git cat-file returned unexpected trailing data");
  }

  return result;
}

function currentPathHash(repoPath) {
  const target = absolutePath(repoPath);
  if (!existsSync(target)) return null;

  const stat = lstatSync(target);
  if (stat.isFile()) return sha256(readFileSync(target));
  // Git stores a symbolic link's target as its blob bytes.
  if (stat.isSymbolicLink()) return sha256(readlinkSync(target));
  throw new Error(`Expected a file at ${repoPath}`);
}

function gitPathsUnder(commit, repoPath) {
  const raw = runGit(["ls-tree", "-r", "--name-only", "-z", commit, "--", repoPath]);
  return raw.split("\0").filter(Boolean).sort();
}

/**
 * The start receipt's scope hashes are SHA-256 digests of the canonical
 * `sha256sum`-style path list: `${fileHash}  ${repoPath}\n`, sorted by path.
 * Keep that exact shape so the baseline proof remains independently checkable.
 */
function gitScopeHash(commit, repoPath) {
  const paths = gitPathsUnder(commit, repoPath);
  const hashes = gitBlobHashes(commit, paths);
  if (paths.length === 1 && paths[0] === repoPath) {
    return hashes.get(repoPath);
  }
  const lines = paths.map((entry) => {
    const hash = hashes.get(entry);
    if (!hash) throw new Error(`Git object disappeared while hashing ${entry}`);
    return `${hash}  ${entry}\n`;
  });
  return sha256(lines.join(""));
}

function walkFiles(repoPath) {
  const result = [];
  const visit = (relative) => {
    const target = absolutePath(relative);
    const stat = lstatSync(target);
    if (stat.isFile() || stat.isSymbolicLink()) {
      result.push(relative);
      return;
    }
    if (!stat.isDirectory()) {
      throw new Error(`Unsupported filesystem entry at ${relative}`);
    }
    for (const entry of readdirSync(target).sort()) {
      visit(`${relative}/${entry}`);
    }
  };

  const target = absolutePath(repoPath);
  if (!existsSync(target)) return result;
  visit(repoPath);
  return result.sort();
}

function worktreeScopeHash(repoPath) {
  const target = absolutePath(repoPath);
  if (existsSync(target) && !lstatSync(target).isDirectory()) {
    return currentPathHash(repoPath);
  }
  const entries = walkFiles(repoPath);
  const lines = entries.map((entry) => `${currentPathHash(entry)}  ${entry}\n`);
  return sha256(lines.join(""));
}

function diffNames(before, after) {
  const raw = runGit([
    "diff",
    "--name-only",
    "--no-renames",
    "-z",
    before,
    after,
  ]);
  return raw.split("\0").filter(Boolean);
}

function diffNameStatus(before, after) {
  const raw = runGit([
    "diff",
    "--name-status",
    "--no-renames",
    "-z",
    before,
    after,
  ]).split("\0").filter(Boolean);
  const result = [];
  for (let index = 0; index < raw.length; index += 2) {
    const status = raw[index];
    const repoPath = raw[index + 1];
    if (!status || !repoPath) {
      throw new Error("Git returned an incomplete name-status diff");
    }
    result.push({ path: normalizeRepoPath(repoPath), status });
  }
  return result.sort((left, right) => left.path.localeCompare(right.path));
}

function worktreeChangedPaths(wipCommit) {
  const paths = new Set(diffNames(wipCommit, "--"));
  const raw = runGit([
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=all",
    "--ignored=no",
  ]).split("\0");

  for (let index = 0; index < raw.length; index += 1) {
    const entry = raw[index];
    if (!entry) continue;
    if (entry.length < 4) throw new Error("Git returned a malformed status entry");
    const code = entry.slice(0, 2);
    const repoPath = entry.slice(3);
    paths.add(normalizeRepoPath(repoPath));

    // In -z porcelain format, the source path of a rename/copy follows its
    // destination. Include it so a disappearance cannot evade the ledger.
    if (code.includes("R") || code.includes("C")) {
      const source = raw[index + 1];
      if (!source) throw new Error("Git returned a rename/copy without its source path");
      paths.add(normalizeRepoPath(source));
      index += 1;
    }
  }

  return uniqueSorted([...paths]);
}

function parseInitialWorkingTree(entries) {
  if (!Array.isArray(entries) || !entries.every((entry) => typeof entry === "string")) {
    throw new Error("initial.workingTree must be an array of Git status strings");
  }
  return entries.map((entry) => {
    const match = /^(?<status>[ MADRCU?!]{1,2})\s+(?<path>.+)$/.exec(entry);
    if (!match?.groups?.path) {
      throw new Error(`Invalid initial working-tree entry: ${entry}`);
    }
    const original = match.groups.path;
    const directory = original.endsWith("/");
    return {
      raw: entry,
      status: match.groups.status.trim(),
      path: normalizeRepoPath(directory ? original.slice(0, -1) : original),
      directory,
    };
  });
}

function isInitialWipPath(repoPath, initialWorkingTree) {
  return initialWorkingTree.some(
    (entry) =>
      entry.path === repoPath || (entry.directory && repoPath.startsWith(`${entry.path}/`)),
  );
}

function isGeneratedOutput(repoPath) {
  return (
    repoPath === "contracts/contract.schema.json" ||
    GENERATED_OUTPUT_PREFIXES.some((prefix) => repoPath.startsWith(prefix))
  );
}

function isAuthorizedSource(repoPath) {
  return (
    (repoPath.startsWith("contracts/") && repoPath !== "contracts/contract.schema.json") ||
    repoPath.startsWith("packages/schema/src/") ||
    (repoPath.startsWith("core/") && !repoPath.startsWith("core/samples/")) ||
    repoPath.startsWith("extract/figma/visual-parity/") ||
    repoPath.startsWith("evals/") ||
    repoPath.startsWith("scripts/")
  );
}

function isForbiddenFigmaWrite(command) {
  const mentionsFigma = /(?:api\.)?figma\.com\b|\bfigma(?:[:/._-]|\s)/i.test(command);
  const hasHttpWriteMethod = /(?:--request(?:=|\s+)|-X\s*)(?:POST|PUT|PATCH|DELETE)\b/i.test(command);
  const hasFigmaWriteTask = /\bfigma:(?:push|write|writeback|update|create|delete|mutate)\b/i.test(command);
  const hasMutatingBridgeCall =
    /\bfigma(?:_|-)execute\b/i.test(command) &&
    /\b(?:push|write|writeback|update|create|delete|mutate|set|remove)\b/i.test(command);
  return (mentionsFigma && hasHttpWriteMethod) || hasFigmaWriteTask || hasMutatingBridgeCall;
}

function normalizeReceipt(receiptPath) {
  if (!receiptPath) {
    return {
      changes: [],
      executedCommands: undefined,
      selfReceiptExclusions: undefined,
      receiptPath: null,
      pendingSelfReceipt: false,
    };
  }
  if (!existsSync(absolutePath(receiptPath))) {
    // The closure coordinator audits before it creates gates.json.  That file
    // is one of the two fixed self-receipts, so its absence at this exact
    // point is expected rather than an alternate manifest or an exclusion.
    if (receiptPath === SELF_RECEIPTS[1]) {
      return {
        changes: [],
        executedCommands: [],
        selfReceiptExclusions: [...SELF_RECEIPTS],
        receiptPath,
        pendingSelfReceipt: true,
      };
    }
    throw new Error(`Terminal receipt does not exist: ${receiptPath}`);
  }
  const document = readJson(receiptPath);
  if (!document || typeof document !== "object" || Array.isArray(document)) {
    throw new Error(`${receiptPath} must contain a JSON object`);
  }

  return {
    changes: document.changes,
    executedCommands: document.executedCommands,
    selfReceiptExclusions: document.selfReceiptExclusions,
    receiptPath,
    pendingSelfReceipt: false,
  };
}

function addFailure(failures, code, message, repoPath) {
  const key = `${code}\0${repoPath ?? ""}\0${message}`;
  if (!failures.has(key)) failures.set(key, { code, ...(repoPath ? { path: repoPath } : {}), message });
}

function audit({ initial, receipt, checkpointCommit, wipCommit }) {
  const failures = new Map();
  const initialWorkingTree = parseInitialWorkingTree(initial.workingTree);
  const declaredChanges = new Map();

  if (!sameMembers(initial.selfReceiptExclusions, SELF_RECEIPTS)) {
    addFailure(
      failures,
      "self-receipt-exclusions",
      "The initial proof must declare exactly the two terminal self-receipts.",
    );
  }
  if (receipt.receiptPath && !sameMembers(receipt.selfReceiptExclusions, SELF_RECEIPTS)) {
    addFailure(
      failures,
      "self-receipt-exclusions",
      "The terminal receipt must declare exactly the two terminal self-receipts.",
    );
  }

  if (!Array.isArray(receipt.changes)) {
    addFailure(
      failures,
      "attribution-boundary",
      "A terminal receipt must provide a changes array; attribution cannot be inferred from history.",
    );
  } else {
    for (const declaration of receipt.changes) {
      if (!declaration || typeof declaration !== "object" || Array.isArray(declaration)) {
        addFailure(failures, "attribution-boundary", "Each declared change must be an object.");
        continue;
      }
      let repoPath;
      try {
        repoPath = normalizeRepoPath(declaration.path);
      } catch (error) {
        addFailure(failures, "attribution-boundary", error.message);
        continue;
      }
      if (declaredChanges.has(repoPath)) {
        addFailure(
          failures,
          "attribution-boundary",
          "A path may be declared only once.",
          repoPath,
        );
        continue;
      }
      declaredChanges.set(repoPath, declaration);
    }
  }

  if (!Array.isArray(receipt.executedCommands) || !receipt.executedCommands.every((entry) => typeof entry === "string")) {
    addFailure(
      failures,
      "figma-write-command",
      "A terminal receipt must contain the complete executedCommands array; Figma read-only status cannot otherwise be audited.",
    );
  } else if (receipt.executedCommands.some(isForbiddenFigmaWrite)) {
    addFailure(
      failures,
      "figma-write-command",
      "The executed command receipt contains a forbidden Figma mutation.",
    );
  }

  const scopeHashes = Object.entries(initial.scopeHashes ?? {}).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  if (scopeHashes.length === 0 || scopeHashes.some(([, hash]) => !isSha256(hash))) {
    addFailure(
      failures,
      "attribution-boundary",
      "The initial proof must contain SHA-256 scopeHashes.",
    );
  }
  const baselineScopeHashes = Object.fromEntries(
    scopeHashes.map(([scope, expected]) => {
      const actual = gitScopeHash(wipCommit, scope);
      // The scope hashes freeze the dirty starting worktree.  They are not
      // required to equal the committed WIP tree: a mismatch is exactly how
      // a pre-existing shared edit is distinguished from checkpoint history.
      return [scope, { initialSha256: expected, wipSha256: actual, matchesWip: actual === expected }];
    }),
  );

  const historicalDiff = diffNameStatus(checkpointCommit, wipCommit);
  const historicalPaths = historicalDiff.map((entry) => entry.path);
  const checkpointHashes = gitBlobHashes(checkpointCommit, historicalPaths);
  const historicalWipHashes = gitBlobHashes(wipCommit, historicalPaths);
  const historicalChanges = historicalDiff.map((entry) => ({
    ...entry,
    checkpointSha256: checkpointHashes.get(entry.path) ?? null,
    wipSha256: historicalWipHashes.get(entry.path) ?? null,
  }));

  const changedPaths = worktreeChangedPaths(wipCommit);
  const finalWipHashes = gitBlobHashes(wipCommit, changedPaths);
  const candidateChanges = changedPaths.map((repoPath) => ({
    path: repoPath,
    wipSha256: finalWipHashes.get(repoPath) ?? null,
    finalSha256: currentPathHash(repoPath),
    preexistingWip: isInitialWipPath(repoPath, initialWorkingTree),
  }));
  const attributableChanges = candidateChanges.filter((entry) => !entry.preexistingWip);
  const attributablePaths = new Set(attributableChanges.map((entry) => entry.path));

  for (const [repoPath] of declaredChanges) {
    if (!attributablePaths.has(repoPath)) {
      addFailure(
        failures,
        "attribution-boundary",
        "The receipt claims a path outside the initial→final attributable delta.",
        repoPath,
      );
    }
  }

  for (const entry of attributableChanges) {
    const declaration = declaredChanges.get(entry.path);
    if (isGeneratedOutput(entry.path)) {
      if (!declaration || declaration.kind !== "generated") {
        addFailure(
          failures,
          "generated-output-direct-edit",
          "A generated output changed without a generated declaration.",
          entry.path,
        );
        continue;
      }
      const causalSources = declaration.causalSources;
      const generatorCommand = declaration.generatorCommand;
      const commandRecorded =
        typeof generatorCommand === "string" &&
        LOCAL_GENERATION_COMMANDS.includes(generatorCommand) &&
        Array.isArray(receipt.executedCommands) &&
        receipt.executedCommands.includes(generatorCommand);
      if (
        !Array.isArray(causalSources) ||
        causalSources.length === 0 ||
        !causalSources.every((source) => {
          try {
            return typeof source === "string" && isAuthorizedSource(normalizeRepoPath(source));
          } catch {
            return false;
          }
        }) ||
        !commandRecorded
      ) {
        addFailure(
          failures,
          "generated-output-provenance",
          "A generated output requires authorized causal source(s) and a recorded local regeneration command.",
          entry.path,
        );
      }
      continue;
    }

    if (!declaration) {
      addFailure(
        failures,
        "unattributed-final-change",
        "The final delta contains a path absent from the terminal receipt.",
        entry.path,
      );
      continue;
    }
    if (
      (declaration.kind === "source" && !isAuthorizedSource(entry.path)) ||
      (declaration.kind === "proof" && !entry.path.startsWith(`${FEATURE_ROOT}proofs/`)) ||
      declaration.kind === "generated" ||
      !["source", "proof"].includes(declaration.kind)
    ) {
      addFailure(
        failures,
        "attribution-boundary",
        "The declared kind does not authorize this final path.",
        entry.path,
      );
    }
  }

  // The start receipt records the status of shared WIP.  It has no per-file
  // hashes for those entries, so only pre-existing paths outside the feature
  // are protected here: feature planning artefacts are deliberately part of
  // the starting 011 WIP, while any external dirty path must remain untouched.
  for (const entry of candidateChanges.filter(
    (change) =>
      change.preexistingWip && !change.path.startsWith(FEATURE_ROOT),
  )) {
    addFailure(
      failures,
      "preexisting-wip-mutated",
      "A pre-existing shared-WIP path outside feature 011 appears in the final delta.",
      entry.path,
    );
  }

  const finalScopeHashes = Object.fromEntries(
    scopeHashes.map(([scope]) => [scope, worktreeScopeHash(scope)]),
  );
  const finalHead = runGit(["rev-parse", "HEAD"]).trim();

  return {
    schemaVersion: 1,
    verifier: "scripts/verify-011-attribution.mjs",
    status: failures.size === 0 ? "pass" : "fail",
    receipt: {
      path: receipt.receiptPath,
      pendingSelfReceipt: receipt.pendingSelfReceipt,
    },
    checkpoint: checkpointCommit,
    wip: wipCommit,
    initial: {
      head: initial.head,
      initialTreeSha256: initial.initialTreeSha256,
      workingTree: initialWorkingTree.map((entry) => entry.raw),
    },
    final: { head: finalHead },
    selfReceiptExclusions: [...SELF_RECEIPTS],
    failures: [...failures.values()].sort(
      (left, right) =>
        left.code.localeCompare(right.code) ||
        (left.path ?? "").localeCompare(right.path ?? "") ||
        left.message.localeCompare(right.message),
    ),
    historicalChanges,
    preexistingWipPaths: candidateChanges
      .filter((entry) => entry.preexistingWip)
      .map((entry) => entry.path),
    attributableChanges,
    baselineScopeHashes,
    finalScopeHashes,
  };
}

function main() {
  const receiptPath = parseArgs(process.argv.slice(2));
  const initial = readJson(INITIAL_RECEIPT);
  if (!initial || typeof initial !== "object" || Array.isArray(initial)) {
    throw new Error(`${INITIAL_RECEIPT} must contain a JSON object`);
  }
  if (initial.schemaVersion !== 1) {
    throw new Error(`${INITIAL_RECEIPT} must use schemaVersion 1`);
  }
  if (!isSha256(initial.initialTreeSha256)) {
    throw new Error(`${INITIAL_RECEIPT} must contain initialTreeSha256`);
  }
  const checkpointCommit = resolveCommit(initial.checkpointCommit, "checkpointCommit");
  const wipCommit = resolveCommit(initial.wipCommit, "wipCommit");
  if (initial.head !== initial.wipCommit) {
    throw new Error(`${INITIAL_RECEIPT}.head must equal its WIP baseline`);
  }

  const result = audit({
    initial,
    receipt: normalizeReceipt(receiptPath),
    checkpointCommit,
    wipCommit,
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = result.status === "pass" ? 0 : 1;
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stdout.write(
    `${JSON.stringify(
      {
        schemaVersion: 1,
        verifier: "scripts/verify-011-attribution.mjs",
        status: "fail",
        failures: [{ code: "attribution-boundary", message }],
      },
      null,
      2,
    )}\n`,
  );
  process.exitCode = 1;
}
