#!/usr/bin/env node

/**
 * Terminal closure coordinator for feature 011.
 *
 * This file has one deliberate write surface: after every fixed gate and the
 * attribution audit succeeds, it creates the closure receipt.  In particular,
 * it never calls a Figma write endpoint or executes a generated Figma script;
 * `figma:plan` produces a local plan only.
 */

import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FEATURE_ROOT = "specs/011-fix-molecule-convergence";
const VISUAL_RESULT = `${FEATURE_ROOT}/proofs/visual/result.json`;
const REVIEW = `${FEATURE_ROOT}/proofs/closure/review.json`;
const RECEIPT = `${FEATURE_ROOT}/proofs/closure/gates.json`;
const ATTRIBUTION = "scripts/verify-011-attribution.mjs";

// Keep the closure contract inspectable and immune to command-line input.
// These commands do not execute a Figma plugin or make a Figma write request.
const GATE_COMMANDS = Object.freeze([
  Object.freeze(["npm", "run", "build"]),
  Object.freeze(["npm", "run", "figma:plan"]),
  Object.freeze(["npm", "run", "emitters:check"]),
  Object.freeze(["npm", "run", "catalog"]),
  Object.freeze(["npm", "run", "verify:catalog"]),
  Object.freeze(["npm", "run", "parity"]),
  Object.freeze(["npm", "run", "eval"]),
  Object.freeze(["npm", "run", "plugin:check"]),
  Object.freeze(["npx", "tsx", "scripts/deterministic-roundtrip.mjs"]),
  Object.freeze(["node", "scripts/core-browser-check.mjs"]),
  Object.freeze(["npx", "tsc", "--noEmit"]),
  Object.freeze(["npx", "tsc", "-p", "tsconfig.build.json"]),
  Object.freeze(["npm", "run", "images:selftest"]),
]);

const ATTRIBUTION_COMMAND = Object.freeze([
  "node",
  ATTRIBUTION,
  "--receipt",
  RECEIPT,
]);

function repositoryPath(relative) {
  const resolved = path.resolve(ROOT, relative);
  if (!resolved.startsWith(`${ROOT}${path.sep}`)) {
    throw new Error(`Path escapes repository: ${relative}`);
  }
  return resolved;
}

function isRegularFile(relative) {
  const target = repositoryPath(relative);
  return existsSync(target) && lstatSync(target).isFile();
}

function commandText(command) {
  return command.join(" ");
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function refuse(message, exitCode = 1) {
  print({
    schemaVersion: 1,
    verifier: "scripts/verify-011-closure.mjs",
    status: "refused",
    message,
  });
  process.exitCode = exitCode;
}

function run(command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: ROOT,
    stdio: "inherit",
  });
  return result.error ? null : result.status;
}

function closureReceipt() {
  return {
    schemaVersion: 1,
    verifier: "scripts/verify-011-closure.mjs",
    status: "pass",
    visualResult: VISUAL_RESULT,
    review: REVIEW,
    gateCommands: GATE_COMMANDS.map(commandText),
    attributionCommand: commandText(ATTRIBUTION_COMMAND),
    executedCommands: [
      ...GATE_COMMANDS.map(commandText),
      commandText(ATTRIBUTION_COMMAND),
    ],
    selfReceiptExclusions: [
      `${FEATURE_ROOT}/proofs/attribution/final.json`,
      RECEIPT,
    ],
  };
}

function main() {
  const arguments_ = process.argv.slice(2);
  if (arguments_.length !== 1 || arguments_[0] !== "--execute") {
    refuse("Refusing closure without exact --execute; no writes were performed.", 2);
    return;
  }

  const missing = [VISUAL_RESULT, REVIEW].filter((proof) => !isRegularFile(proof));
  if (missing.length > 0) {
    refuse(`Required proof file is missing: ${missing.join(", ")}`);
    return;
  }
  if (existsSync(repositoryPath(RECEIPT))) {
    refuse(`Closure receipt already exists: ${RECEIPT}`);
    return;
  }

  for (const command of GATE_COMMANDS) {
    if (run(command) !== 0) {
      refuse(`Gate failed: ${commandText(command)}`);
      return;
    }
  }

  if (run(ATTRIBUTION_COMMAND) !== 0) {
    refuse(`Attribution audit failed: ${commandText(ATTRIBUTION_COMMAND)}`);
    return;
  }

  const receipt = closureReceipt();
  writeFileSync(repositoryPath(RECEIPT), `${JSON.stringify(receipt, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  print(receipt);
}

try {
  main();
} catch (error) {
  refuse(error instanceof Error ? error.message : String(error));
}
