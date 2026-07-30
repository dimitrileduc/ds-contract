/**
 * Adversarial contract for the React capture leg of the organism audit (D4).
 *
 * The audit's "generated" leg is only evidence when it observes the component
 * this repository actually ships: a real file under `src/components/**`, its
 * real export, and a pinned bundle hash.  The cheap escape hatch is to render
 * the contract through `core/emit-html` instead — that string is HTML the audit
 * itself just produced, so comparing it to Figma proves nothing about the
 * library.  This fixture pins both halves of the refusal:
 *
 *   resolveGeneratedComponent({ contractId, sourceRoot })
 *   assertReactSurfaceAuthoritative(surface)
 *
 * It stays read-only: no Chromium, no Figma call, no directory creation.  The
 * only filesystem access is reading a generated component to prove the returned
 * reference is not a fabricated string.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertReactSurfaceAuthoritative,
  resolveGeneratedComponent,
} from "../../extract/figma/organism-audit/render-react.js";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const GENERATED_ROOT = path.join(REPO_ROOT, "src", "components");

/** The authoritative surface: the generated React library rendered as it ships. */
const AUTHORITATIVE_SURFACE = "react-storybook";

const SHA256 = /^[0-9a-f]{64}$/;

function resolved(contractId: string, sourceRoot: string, label: string) {
  const result = resolveGeneratedComponent({ contractId, sourceRoot });
  if (!result.ok) {
    throw new Error(
      `${label} must resolve a generated component: ${result.reasons.join("; ") || "no reason given"}`,
    );
  }
  return result.ref;
}

function expectResolutionRefused(
  contractId: string,
  sourceRoot: string,
  label: string,
): void {
  const result = resolveGeneratedComponent({ contractId, sourceRoot });
  if (result.ok) {
    throw new Error(
      `${label} must be refused; got componentFile=${result.ref.componentFile}`,
    );
  }
  // Degradation is named, never silent: a refusal without a reason is a
  // refusal the operator cannot act on.
  if (result.reasons.length === 0) {
    throw new Error(`${label} was refused without naming a reason`);
  }
}

// A real generated organism resolves, and every field of the reference is
// checkable against what is on disk.
const presentation = resolved(
  "ds.presentation",
  GENERATED_ROOT,
  "the generated ds.presentation organism",
);

const componentFile = path.resolve(REPO_ROOT, presentation.componentFile);
if (!componentFile.startsWith(GENERATED_ROOT + path.sep)) {
  throw new Error(
    `captured component must live under src/components/**; got ${presentation.componentFile}`,
  );
}
if (!fs.existsSync(componentFile)) {
  throw new Error(
    `captured component file does not exist on disk: ${presentation.componentFile}`,
  );
}

const source = fs.readFileSync(componentFile, "utf8");
if (!source.includes("GENERATED FILE")) {
  throw new Error(
    `captured component must be the generated surface, not a hand-authored file: ${presentation.componentFile}`,
  );
}
if (!new RegExp(`export const ${presentation.export}\\b`).test(source)) {
  throw new Error(
    `captured export "${presentation.export}" is not exported by ${presentation.componentFile}`,
  );
}

// The bundle hash pins the exact bytes that were rendered.  A placeholder or a
// zeroed digest would let two different builds claim the same evidence.
if (!SHA256.test(presentation.bundleSha256)) {
  throw new Error(
    `bundleSha256 must be a 64-char sha256 digest; got ${presentation.bundleSha256}`,
  );
}
if (presentation.bundleSha256 === "0".repeat(64)) {
  throw new Error("bundleSha256 must not be a zeroed placeholder digest");
}

// Determinism is the whole guarantee: capturing the same component twice must
// yield the same reference, hash included.
const presentationAgain = resolved(
  "ds.presentation",
  GENERATED_ROOT,
  "the second capture of ds.presentation",
);
if (
  presentationAgain.componentFile !== presentation.componentFile ||
  presentationAgain.export !== presentation.export ||
  presentationAgain.bundleSha256 !== presentation.bundleSha256
) {
  throw new Error(
    "two captures of the same organism disagreed: " +
      `${JSON.stringify(presentation)} vs ${JSON.stringify(presentationAgain)}`,
  );
}

// Every audited organism must be capturable from the shipping library.
for (const contractId of [
  "ds.hero",
  "ds.coordonnees",
  "ds.sav",
  "ds.equipe",
  "ds.footer",
]) {
  const ref = resolved(contractId, GENERATED_ROOT, `the ${contractId} organism`);
  const file = path.resolve(REPO_ROOT, ref.componentFile);
  if (!file.startsWith(GENERATED_ROOT + path.sep) || !fs.existsSync(file)) {
    throw new Error(
      `${contractId} must resolve to a real file under src/components/**; got ${ref.componentFile}`,
    );
  }
}

// The capture is bounded by src/components.  A root that points anywhere else
// — the engine, the generated Figma scripts, the repository root, or a
// traversal out of the checkout — cannot be silently accepted, because
// whatever it finds there is not the shipping component.
for (const [sourceRoot, label] of [
  [path.join(REPO_ROOT, "core"), "the engine directory as a capture root"],
  [
    path.join(REPO_ROOT, "figma-sync"),
    "the generated Figma scripts as a capture root",
  ],
  [REPO_ROOT, "the repository root as a capture root"],
  [
    path.join(GENERATED_ROOT, "..", "..", ".."),
    "a root above the checkout",
  ],
  [
    path.join(GENERATED_ROOT, "..", "..", "extract"),
    "the extraction directory as a capture root",
  ],
  ["../src/components", "a relative root escaping the checkout"],
] as const) {
  expectResolutionRefused("ds.presentation", sourceRoot, label);
}

// An organism with no generated component is a missing capture, never a
// fallback: the audit must say so instead of substituting another surface.
for (const contractId of ["ds.not-a-real-organism", "ds.", ""]) {
  expectResolutionRefused(
    contractId,
    GENERATED_ROOT,
    `the unknown contract "${contractId}"`,
  );
}

// The React surface is the only authoritative one.
const authoritative = assertReactSurfaceAuthoritative(AUTHORITATIVE_SURFACE);
if (!authoritative.ok || authoritative.outcome !== null) {
  throw new Error(
    `"${AUTHORITATIVE_SURFACE}" must be authoritative and force no outcome; ` +
      `got ok=${authoritative.ok}, outcome=${String(authoritative.outcome)}`,
  );
}

// Any other surface is refused.  An `emit-html` fallback in particular is
// pinned to `not-proven`: the audit rendered that HTML itself, so it can never
// stand in for the library — and it can never be quietly downgraded into a
// pass.
for (const surface of [
  "emit-html",
  "core/emit-html",
  "html",
  "react-inline",
  "figma-script",
  "react",
  "",
]) {
  const verdict = assertReactSurfaceAuthoritative(surface);
  if (verdict.ok) {
    throw new Error(`surface "${surface}" must not be authoritative`);
  }
  if (verdict.outcome === "proved") {
    throw new Error(
      `surface "${surface}" was refused but still yielded a pass outcome`,
    );
  }
  if (verdict.reasons.length === 0) {
    throw new Error(`surface "${surface}" was refused without naming a reason`);
  }
  if (surface.includes("emit-html") && verdict.outcome !== "not-proven") {
    throw new Error(
      `an emit-html fallback must be not-proven; "${surface}" gave ${String(verdict.outcome)}`,
    );
  }
}

console.log(
  "✔ organism React capture resolves the shipping component under src/components/**, refuses out-of-bounds roots and unknown organisms, and turns any emit-html fallback into not-proven rather than a pass",
);
