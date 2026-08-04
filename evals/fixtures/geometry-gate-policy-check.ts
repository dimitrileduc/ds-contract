/**
 * Adversarial contract for the geometry gate's fail-closed policy (015,
 * FR-001; decision D7; contracts/geometry-gate.interface.md).
 *
 * `extract/geometry-gate/gate.ts` does not exist yet — this fixture is
 * written FIRST and MUST fail here (constitution §II: fixture → eval →
 * claim, in that order — the exact form already proven by
 * `measure-gate-policy-check.ts`). It is data-only: every scenario is a
 * hand-built `GeometryGateInput` (the shapes `inventoryLiterals` /
 * `contracts/named-literals.registry.json` would produce), no filesystem,
 * no real contracts.
 *
 * Reference: data-model.md §5, contracts/geometry-gate.interface.md §2-§5.
 */
import {
  evaluateGeometryGate,
  GEOMETRIC_CHANNELS,
  type GeometryGateInput,
} from "../../extract/geometry-gate/gate.js";

/** The smallest input that MUST pass with zero refusals: one geometric
 *  literal, named in the registry, byte-identical value; one geometric
 *  token binding (governed, informational); one non-geometric literal
 *  (out of population entirely — border-color is paint, not layout). */
function baseline(): GeometryGateInput {
  return {
    contractIds: ["ds.hero"],
    literalEntries: [
      { contractId: "ds.hero", pointer: "/anatomy/root/literals/background-image", value: "linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5) 100%)" },
      { contractId: "ds.hero", pointer: "/anatomy/root/literals/border-color", value: "#000000" },
    ],
    tokenBindingEntries: [
      { contractId: "ds.hero", pointer: "/anatomy/root/tokens/gap", token: "{space.16}" },
    ],
    registryEntries: [
      {
        contractId: "ds.hero",
        pointer: "/anatomy/root/literals/background-image",
        channel: "background-image",
        value: "linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5) 100%)",
        reason: "Voile GRADIENT_LINEAR du master — un token gradient à usage unique fabriquerait un faux vocabulaire.",
        decidedOn: "2026-08-04",
        receiptId: "hero-gradients-named-literal",
      },
    ],
  };
}

function expectFail(input: GeometryGateInput, code: string, description: string): void {
  const r = evaluateGeometryGate(input);
  if (r.verdict !== "fail") {
    throw new Error(`${description}: expected verdict "fail", got "${r.verdict}"`);
  }
  if (!r.refusals.some((x) => x.code === code)) {
    throw new Error(
      `${description}: expected a "${code}" refusal, got [${r.refusals.map((x) => x.code).join(", ")}]`,
    );
  }
}

// ---------------------------------------------------------------------------
// Property 0 — the baseline passes clean, and counts are live (never fixed).
// ---------------------------------------------------------------------------
{
  const r = evaluateGeometryGate(baseline());
  if (r.verdict !== "pass" || r.refusals.length !== 0) {
    throw new Error(`baseline must pass clean, got verdict="${r.verdict}" refusals=${JSON.stringify(r.refusals)}`);
  }
  // 2 literalEntries, but only 1 is geometric (background-image) — border-color
  // is a paint channel, out of population entirely (§2).
  if (r.counts.geometricEntries !== 1 || r.counts.namedLiterals !== 1 || r.counts.invisible !== 0) {
    throw new Error(`baseline population must be counted LIVE, got ${JSON.stringify(r.counts)}`);
  }
  if (r.counts.governedRefs !== 1) {
    throw new Error(`baseline's one geometric token binding must count as governedRefs, got ${r.counts.governedRefs}`);
  }
  if (r.counts.contracts !== 1) {
    throw new Error(`counts.contracts must be counted live from contractIds, got ${r.counts.contracts}`);
  }
}

// ---------------------------------------------------------------------------
// §2 — population: only the closed set of geometric channels is evaluated.
// A paint/typo channel (color, font-size, border-width…) never enters
// geometricEntries even when unregistered — it is out of scope, not a pass.
// ---------------------------------------------------------------------------
{
  const input = baseline();
  input.literalEntries = [{ contractId: "ds.hero", pointer: "/anatomy/root/literals/color", value: "#ffffff" }];
  input.registryEntries = [];
  const r = evaluateGeometryGate(input);
  if (r.verdict !== "pass" || r.counts.geometricEntries !== 0) {
    throw new Error(`a non-geometric literal must be out of population entirely, got ${JSON.stringify(r)}`);
  }
}

// ---------------------------------------------------------------------------
// invisible-literal — a geometric literal with no registry entry at its
// (contractId, pointer) — the state SC-001 puts to zero.
// ---------------------------------------------------------------------------
{
  const input = baseline();
  input.registryEntries = [];
  expectFail(input, "invisible-literal", "a geometric literal with no matching registry entry");
}
// ...and it is counted, by contract and by channel (never anonymous).
{
  const input = baseline();
  input.registryEntries = [];
  const r = evaluateGeometryGate(input);
  if (r.counts.invisible !== 1 || r.counts.byContract["ds.hero"] !== 1 || r.counts.byChannel["background-image"] !== 1) {
    throw new Error(`invisible must be counted by contract and by channel, got ${JSON.stringify(r.counts)}`);
  }
}

// ---------------------------------------------------------------------------
// registry-value-mismatch — registered, but the pinned value diverges from
// the contract's actual literal (I: a named literal is SURVEILLED, not just
// recorded — if either side changes without the other, the gate refuses).
// ---------------------------------------------------------------------------
{
  const input = baseline();
  input.registryEntries[0] = { ...input.registryEntries[0], value: "linear-gradient(to top, red, blue)" };
  expectFail(input, "registry-value-mismatch", "a registry entry whose pinned value no longer matches the contract");
}

// ---------------------------------------------------------------------------
// registry-entry-orphaned — a registry entry whose pointer no longer
// resolves to ANY literal in the contract (the exception is dead; it must
// retire, not accumulate).
// ---------------------------------------------------------------------------
{
  const input = baseline();
  input.literalEntries = []; // the pointer the registry cites no longer exists
  expectFail(input, "registry-entry-orphaned", "a registry entry whose pointer resolves nothing");
}

// ---------------------------------------------------------------------------
// registry-entry-undocumented — reason/decidedOn/receiptId are mandatory; a
// silent addition does not exist.
// ---------------------------------------------------------------------------
for (const missing of ["reason", "decidedOn", "receiptId"] as const) {
  const input = baseline();
  const entry = { ...input.registryEntries[0] };
  delete (entry as any)[missing];
  input.registryEntries = [entry];
  expectFail(input, "registry-entry-undocumented", `a registry entry missing "${missing}"`);
}

// ---------------------------------------------------------------------------
// A literal geometric channel bound via governedRefs never collides with
// invisible — a reference on a geometric channel is conforme by construction
// (no literal exists at that pointer to be invisible about).
// ---------------------------------------------------------------------------
{
  const input: GeometryGateInput = {
    contractIds: ["ds.button"],
    literalEntries: [],
    tokenBindingEntries: [{ contractId: "ds.button", pointer: "/anatomy/root/tokens/padding-inline", token: "{space.16}" }],
    registryEntries: [],
  };
  const r = evaluateGeometryGate(input);
  if (r.verdict !== "pass" || r.counts.invisible !== 0 || r.counts.governedRefs !== 1) {
    throw new Error(`a governed reference alone must pass clean, got ${JSON.stringify(r)}`);
  }
}

// ---------------------------------------------------------------------------
// §2 — the closed channel set itself, checked as data (mirrors measure-
// gate's own I-2.1 bijection discipline): border-radius/border-width and
// paint channels are NOT geometric, despite being layout-adjacent.
// ---------------------------------------------------------------------------
{
  const expected = [
    "width", "height", "min-width", "min-height", "gap",
    "padding-block", "padding-inline", "padding-top", "padding-right", "padding-bottom", "padding-left",
    "background-image",
  ].sort();
  const actual = [...GEOMETRIC_CHANNELS].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`GEOMETRIC_CHANNELS must be exactly the closed set of §2, got ${JSON.stringify(actual)}`);
  }
}

// ---------------------------------------------------------------------------
// Determinism (§5 — Claims Rule discipline) — two evaluations of the same
// input produce byte-identical JSON, order included.
// ---------------------------------------------------------------------------
{
  const input = baseline();
  const a = JSON.stringify(evaluateGeometryGate(input));
  const b = JSON.stringify(evaluateGeometryGate(input));
  if (a !== b) {
    throw new Error(`evaluateGeometryGate must be deterministic, got two different JSON outputs`);
  }
}

console.log(
  "✔ geometry-gate policy holds: the baseline passes clean; only the closed geometric channel set (§2) enters " +
    "population; invisible-literal/registry-value-mismatch/registry-entry-orphaned/registry-entry-undocumented " +
    "each refuse exactly their own scenario; counts (contracts, geometricEntries, governedRefs, namedLiterals, " +
    "invisible, byContract, byChannel) are all live; two runs of the same input are byte-identical.",
);
