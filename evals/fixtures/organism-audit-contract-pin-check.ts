/**
 * Adversarial contract for the audit's CONTRACT PIN (013).
 *
 * A dossier states which contract it audited: `contract: { id, version }`.
 * That line came from the MANIFEST, while every JSON Pointer was resolved
 * against the contract file on DISK.  So the moment the two disagree, the
 * dossier is signed with a version it never read — the audit measured 2.2.0 and
 * published "audited ds.coordonnees@2.1.0".  Nothing is red, nothing is missing,
 * and the receipt is false.  That is the highest-severity bug class here: a
 * silent mislabel, not an absence.
 *
 * The CLI already refuses this (`verifyAgainstDisk`, issue `subject-contract`),
 * but the capture tools call `auditOrganism` directly and never pass through it.
 * A guard that only one of two entry points honours is not a guard, so the
 * refusal has to live where the contract bytes are actually read.
 *
 * This fixture pins:
 *   - the pure check refuses a version drift, an id drift and a missing
 *     version, BY NAME, and accepts an exact match;
 *   - the refusal is wired into the capture path itself, so the tools cannot
 *     bypass it the way they bypass the CLI.
 *
 * Read-only: no Chromium, no Figma call, no writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { assertContractPinFresh } from "../../extract/figma/organism-audit/facts.js";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

const subject = {
  id: "coordonnees",
  contractId: "ds.coordonnees",
  contractVersion: "2.1.0",
  contractPath: "contracts/coordonnees.contract.json",
};

// ---- an exact match is the only thing that passes ------------------------
const exact = assertContractPinFresh({
  subject: { ...subject, contractVersion: "2.2.0" },
  contract: { id: "ds.coordonnees", version: "2.2.0" },
});
if (!exact.ok) {
  throw new Error(
    `an exact pin must be accepted; got: ${exact.reasons.join("; ")}`,
  );
}

// ---- version drift: the case that actually happened ----------------------
const drift = assertContractPinFresh({
  subject,
  contract: { id: "ds.coordonnees", version: "2.2.0" },
});
if (drift.ok) {
  throw new Error(
    "a manifest pinning v2.1.0 against a v2.2.0 contract on disk must be refused",
  );
}
if (!drift.reasons.some((r) => r.includes("2.1.0") && r.includes("2.2.0"))) {
  throw new Error(
    `the refusal must name BOTH versions, so the drift is readable; got: ${drift.reasons.join("; ")}`,
  );
}
if (!drift.reasons.some((r) => r.includes("ds.coordonnees"))) {
  throw new Error(
    `the refusal must name the contract; got: ${drift.reasons.join("; ")}`,
  );
}

// ---- id drift: a manifest pointing at the wrong contract file ------------
const wrongId = assertContractPinFresh({
  subject,
  contract: { id: "ds.devis", version: "2.1.0" },
});
if (wrongId.ok) {
  throw new Error("a contract whose id differs from the manifest must be refused");
}
if (!wrongId.reasons.some((r) => r.includes("ds.devis"))) {
  throw new Error(
    `the id refusal must name what it found on disk; got: ${wrongId.reasons.join("; ")}`,
  );
}

// ---- an absent version is never "close enough" ---------------------------
for (const missing of [undefined, null, "", "   "]) {
  const verdict = assertContractPinFresh({
    subject,
    contract: { id: "ds.coordonnees", version: missing as string | undefined },
  });
  if (verdict.ok) {
    throw new Error(
      `a contract with version ${JSON.stringify(missing)} must be refused, never assumed to match`,
    );
  }
  if (verdict.reasons.length === 0) {
    throw new Error(
      `version ${JSON.stringify(missing)} was refused without naming a reason`,
    );
  }
}

// ---- the guard must live on the capture path, not only in the CLI --------
// The CLI's own `verifyAgainstDisk` never runs for `tools/run-wave.mts`, which
// calls `auditOrganism` directly.  Checking the wiring here is what stops the
// refusal from being re-bypassed the next time a tool is added.
const pilotSource = fs.readFileSync(
  path.join(REPO_ROOT, "extract/figma/organism-audit/pilot.ts"),
  "utf8",
);
if (!pilotSource.includes("assertContractPinFresh")) {
  throw new Error(
    "pilot.ts must call assertContractPinFresh — a guard only the CLI honours lets every capture tool publish a mislabelled dossier",
  );
}
if (!/assertContractPinFresh\(/.test(pilotSource)) {
  throw new Error("pilot.ts imports the guard but never calls it");
}

console.log(
  "✔ organism audit refuses a stale contract pin by name (version drift, id drift, absent version) and enforces it on the capture path, so a dossier can never be signed with a version it did not read",
);
