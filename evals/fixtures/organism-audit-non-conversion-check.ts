/**
 * Adversarial contract for the 013 non-conversion receipt (D12).
 *
 * 013 audits fidelity; it is explicitly forbidden from *fixing* fidelity by
 * converting an inventoried hardcoded value into a token binding, and from
 * touching the token foundation at all.  The honest way to prove that is not a
 * prose paragraph and not `git diff contracts/` — a textual diff cannot tell a
 * forbidden literal→token conversion apart from a legitimate local contract
 * correction, and forbidding every contract diff would outlaw corrections the
 * spec allows.  Only a *typed* diff over a baseline inventory can.
 *
 * This fixture is data-only: no fs, no Figma, no Chromium.  It names the small
 * pure API the baseline receipt consumes:
 *
 *   inventoryLiterals(contractsById)
 *     -> { literalInventory, tokenBindingInventory }
 *   diffBaseline(before, after)
 *     -> { literalToTokenConversions, tokenFoundationChanges, localContractCorrections }
 *   verifyNonConversion(diff)
 *     -> { ok, reasons }
 *
 * A baseline is the output of `inventoryLiterals` plus the token-foundation
 * fingerprint it was taken against:
 *
 *   { literalInventory, tokenBindingInventory, tokenFoundation }
 *
 * where `tokenFoundation` maps a repo-relative `tokens/**` path to the sha256
 * of its bytes.  `verifyNonConversion` is what `proofs/baseline/hardcoded-values.json`
 * is checked with (quickstart §3: `literalToTokenConversions == []` and
 * `tokenFoundationChanges == []`).
 */
import {
  diffBaseline,
  inventoryLiterals,
  verifyNonConversion,
} from "../../extract/figma/organism-audit/baseline.js";

/** `tokens/**` fingerprint the baseline was taken against. */
const TOKEN_FOUNDATION: Record<string, string> = {
  "tokens/modes.tokens.json": "c".repeat(64),
  "tokens/primitives.tokens.json": "a".repeat(64),
  "tokens/semantic.tokens.json": "b".repeat(64),
};

/**
 * Two synthetic contracts shaped exactly like the real ones: nested `parts`,
 * `literals`, `literalsByProp`, `tokens` holding `{dot.path}` bindings,
 * `declared` CSS, and `attrs` holding `{prop}` references.
 *
 * D12 scopes the inventory to `literals`/`literalsByProp` for hardcoded values
 * and to token bindings for the foundation side.  `declared` is a third,
 * separate category and an `attrs` `{prop}` reference is a prop binding — an
 * inventory that swept either in would over-report the protected surface.
 */
const BASE_CONTRACTS: Record<string, unknown> = {
  "ds.hero": {
    id: "ds.hero",
    name: "Hero",
    version: "1.0.0",
    props: { titre: { type: "string" } },
    anatomy: {
      root: {
        layout: { display: "flex", direction: "column" },
        literals: { gap: "24px", width: "1440px" },
        tokens: { "font-family": "{font.family.montserrat}" },
        declared: { "text-align": "center" },
        parts: {
          Titre: {
            content: { prop: "titre" },
            tokens: {
              color: "{color.noir-bleute}",
              "font-size": "{font.size.32}",
            },
            literals: { "line-height": "40px" },
          },
          Image: {
            element: "img",
            attrs: { src: "{imageUrl}", alt: "{imageAlt}" },
            literals: { height: "418px" },
            declared: { "object-fit": "cover" },
          },
        },
      },
    },
  },
  "ds.sav": {
    id: "ds.sav",
    name: "SAV",
    version: "1.0.0",
    props: { etat: { type: "enum", values: ["repos", "selectionne"] } },
    anatomy: {
      root: {
        literals: { gap: "16px" },
        tokens: { "background-color": "{color.blanc}" },
        parts: {
          Onglet: {
            literals: { "padding-bottom": "8px" },
            literalsByProp: [
              {
                prop: "etat",
                map: { selectionne: { "border-bottom-width": "2px" } },
              },
            ],
            tokens: { "border-color": "{color.noir-bleute}" },
          },
        },
      },
    },
  },
};

const EXPECTED_LITERAL_POINTERS: Record<string, string[]> = {
  "ds.hero": [
    "/anatomy/root/literals/gap",
    "/anatomy/root/literals/width",
    "/anatomy/root/parts/Image/literals/height",
    "/anatomy/root/parts/Titre/literals/line-height",
  ],
  "ds.sav": [
    "/anatomy/root/literals/gap",
    "/anatomy/root/parts/Onglet/literals/padding-bottom",
    "/anatomy/root/parts/Onglet/literalsByProp/0/map/selectionne/border-bottom-width",
  ],
};

const EXPECTED_TOKEN_POINTERS: Record<string, string[]> = {
  "ds.hero": [
    "/anatomy/root/parts/Titre/tokens/color",
    "/anatomy/root/parts/Titre/tokens/font-size",
    "/anatomy/root/tokens/font-family",
  ],
  "ds.sav": [
    "/anatomy/root/parts/Onglet/tokens/border-color",
    "/anatomy/root/tokens/background-color",
  ],
};

type InventoryEntry = { contractId: string; pointer: string };

const clone = <T>(value: T): T => structuredClone(value);

/** RFC 6901, so the fixture can prove inventoried pointers actually resolve. */
function resolvePointer(root: unknown, pointer: string): unknown {
  if (!pointer.startsWith("/")) {
    throw new Error(`inventoried pointer is not a JSON Pointer: ${pointer}`);
  }
  let cursor: unknown = root;
  for (const rawSegment of pointer.slice(1).split("/")) {
    const segment = rawSegment.replace(/~1/g, "/").replace(/~0/g, "~");
    if (cursor === null || typeof cursor !== "object") return undefined;
    cursor = Array.isArray(cursor)
      ? cursor[Number(segment)]
      : (cursor as Record<string, unknown>)[segment];
  }
  return cursor;
}

function pointersOf(entries: InventoryEntry[], contractId: string): string[] {
  return entries
    .filter((entry) => entry.contractId === contractId)
    .map((entry) => entry.pointer)
    .sort();
}

function baselineOf(
  contracts: Record<string, unknown>,
  tokenFoundation: Record<string, string> = TOKEN_FOUNDATION,
) {
  const inventory = inventoryLiterals(contracts) as {
    literalInventory: Array<InventoryEntry & { value: string }>;
    tokenBindingInventory: Array<InventoryEntry & { token: string }>;
  };
  return { ...inventory, tokenFoundation: clone(tokenFoundation) };
}

function typedDiff(after: Record<string, unknown>, tokenFoundation?: Record<string, string>) {
  return diffBaseline(baselineOf(BASE_CONTRACTS), baselineOf(after, tokenFoundation)) as {
    literalToTokenConversions: Array<Record<string, unknown>>;
    tokenFoundationChanges: Array<Record<string, unknown>>;
    localContractCorrections: Array<Record<string, unknown>>;
  };
}

function expectRefused(
  diff: ReturnType<typeof typedDiff>,
  named: string[],
  label: string,
): void {
  const receipt = verifyNonConversion(diff) as { ok: boolean; reasons: string[] };
  if (receipt.ok) {
    throw new Error(
      `${label} must be refused; verifyNonConversion accepted ${JSON.stringify(diff)}`,
    );
  }
  if (!Array.isArray(receipt.reasons) || receipt.reasons.length === 0) {
    throw new Error(`${label} must be refused with at least one named reason`);
  }
  const joined = receipt.reasons.join(" | ");
  for (const name of named) {
    if (!joined.includes(name)) {
      throw new Error(
        `${label} must be refused BY NAME: no reason mentions ${name} in ${joined}`,
      );
    }
  }
}

function expectAccepted(diff: ReturnType<typeof typedDiff>, label: string): void {
  const receipt = verifyNonConversion(diff) as { ok: boolean; reasons: string[] };
  if (!receipt.ok) {
    throw new Error(
      `${label} must stay allowed: ${(receipt.reasons ?? []).join(" | ")}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 1. The inventory is exact, resolvable and deterministic.
// ---------------------------------------------------------------------------

const baseline = baselineOf(BASE_CONTRACTS);

for (const [contractId, expected] of Object.entries(EXPECTED_LITERAL_POINTERS)) {
  const observed = pointersOf(baseline.literalInventory, contractId);
  if (JSON.stringify(observed) !== JSON.stringify(expected)) {
    throw new Error(
      `literal inventory for ${contractId} must be exactly ${JSON.stringify(expected)}, got ${JSON.stringify(observed)}`,
    );
  }
}
for (const [contractId, expected] of Object.entries(EXPECTED_TOKEN_POINTERS)) {
  const observed = pointersOf(baseline.tokenBindingInventory, contractId);
  if (JSON.stringify(observed) !== JSON.stringify(expected)) {
    throw new Error(
      `token binding inventory for ${contractId} must be exactly ${JSON.stringify(expected)}, got ${JSON.stringify(observed)}`,
    );
  }
}

// `declared` CSS and `{prop}` references in `attrs` are neither hardcoded
// values in D12's sense nor token bindings.  Counting them would inflate the
// protected surface and make the receipt unfalsifiable.
for (const entry of baseline.literalInventory) {
  if (entry.pointer.includes("/declared/") || entry.pointer.includes("/attrs/")) {
    throw new Error(
      `D12 scopes the literal inventory to literals/literalsByProp; ${entry.contractId}${entry.pointer} is out of scope`,
    );
  }
}
for (const entry of baseline.tokenBindingInventory) {
  if (entry.pointer.includes("/attrs/")) {
    throw new Error(
      `${entry.contractId}${entry.pointer} is a prop reference, not a token binding`,
    );
  }
  if (!/^\{[a-z0-9.-]+\}$/.test(entry.token)) {
    throw new Error(
      `token binding ${entry.contractId}${entry.pointer} must record a {dot.path}, got ${JSON.stringify(entry.token)}`,
    );
  }
}

// Every inventoried pointer must resolve to the value it claims — a pointer
// that does not resolve cannot localize a finding later.
for (const entry of baseline.literalInventory) {
  const resolved = resolvePointer(BASE_CONTRACTS[entry.contractId], entry.pointer);
  if (resolved !== entry.value) {
    throw new Error(
      `${entry.contractId}${entry.pointer} resolves to ${JSON.stringify(resolved)}, inventory claims ${JSON.stringify(entry.value)}`,
    );
  }
}
for (const entry of baseline.tokenBindingInventory) {
  const resolved = resolvePointer(BASE_CONTRACTS[entry.contractId], entry.pointer);
  if (resolved !== entry.token) {
    throw new Error(
      `${entry.contractId}${entry.pointer} resolves to ${JSON.stringify(resolved)}, inventory claims ${JSON.stringify(entry.token)}`,
    );
  }
}

// The receipt is committed, so the inventory must be byte-stable and ordered.
const sortedCopy = <T extends InventoryEntry>(entries: T[]): T[] =>
  [...entries].sort((a, b) =>
    a.contractId === b.contractId
      ? a.pointer.localeCompare(b.pointer)
      : a.contractId.localeCompare(b.contractId),
  );
for (const [label, entries] of [
  ["literalInventory", baseline.literalInventory],
  ["tokenBindingInventory", baseline.tokenBindingInventory],
] as const) {
  if (JSON.stringify(entries) !== JSON.stringify(sortedCopy(entries as InventoryEntry[]))) {
    throw new Error(`${label} must be ordered by (contractId, pointer) to stay byte-stable`);
  }
}
if (JSON.stringify(inventoryLiterals(BASE_CONTRACTS)) !== JSON.stringify(inventoryLiterals(BASE_CONTRACTS))) {
  throw new Error("inventoryLiterals must be deterministic across two runs");
}

// ---------------------------------------------------------------------------
// 2. The receipt shape quickstart §3 asserts with `jq -e` always exists.
// ---------------------------------------------------------------------------

const unchanged = typedDiff(clone(BASE_CONTRACTS) as Record<string, unknown>);
for (const key of [
  "literalToTokenConversions",
  "tokenFoundationChanges",
  "localContractCorrections",
] as const) {
  if (!Array.isArray(unchanged[key]) || unchanged[key].length !== 0) {
    throw new Error(
      `an unchanged baseline must publish ${key} as [], got ${JSON.stringify(unchanged[key])}`,
    );
  }
}
expectAccepted(unchanged, "an unchanged baseline");

// ---------------------------------------------------------------------------
// 3. THE decisive pair: a forbidden conversion and a legitimate local
//    correction that a textual diff cannot tell apart.
// ---------------------------------------------------------------------------

// FORBIDDEN: the inventoried literal at Titre/line-height disappears and a
// token binding appears for the same anatomy site.  That is exactly the
// conversion 013 defers.
const afterConversion = clone(BASE_CONTRACTS) as any;
delete afterConversion["ds.hero"].anatomy.root.parts.Titre.literals["line-height"];
afterConversion["ds.hero"].anatomy.root.parts.Titre.tokens["line-height"] =
  "{font.line-height.40}";

// ALLOWED: an inventoried literal disappears and a *different literal* appears
// on the same part.  Textually this is the same gesture — one literal line
// removed, one line added next to it — but nothing was converted to a token.
const afterLocalCorrection = clone(BASE_CONTRACTS) as any;
delete afterLocalCorrection["ds.hero"].anatomy.root.parts.Image.literals.height;
afterLocalCorrection["ds.hero"].anatomy.root.parts.Image.literals["min-height"] = "0px";

const conversionDiff = typedDiff(afterConversion);
const localDiff = typedDiff(afterLocalCorrection);

// A line-counting / textual view sees the identical signal in both.
for (const [label, after] of [
  ["forbidden conversion", afterConversion],
  ["local correction", afterLocalCorrection],
] as const) {
  const before = baselineOf(BASE_CONTRACTS);
  const now = baselineOf(after);
  const beforeSites = new Set(before.literalInventory.map((e) => `${e.contractId}${e.pointer}`));
  const nowSites = new Set([
    ...now.literalInventory.map((e) => `${e.contractId}${e.pointer}`),
    ...now.tokenBindingInventory.map((e) => `${e.contractId}${e.pointer}`),
  ]);
  const beforeAll = new Set([
    ...beforeSites,
    ...before.tokenBindingInventory.map((e) => `${e.contractId}${e.pointer}`),
  ]);
  const removed = [...beforeAll].filter((site) => !nowSites.has(site)).length;
  const added = [...nowSites].filter((site) => !beforeAll.has(site)).length;
  if (removed !== 1 || added !== 1) {
    throw new Error(
      `the ${label} fixture must be textually indistinguishable (1 removed, 1 added); got ${removed}/${added}`,
    );
  }
  if (JSON.stringify(BASE_CONTRACTS) === JSON.stringify(after)) {
    throw new Error(`the ${label} fixture must actually change contracts/`);
  }
}

// The typed diff separates them.
if (conversionDiff.literalToTokenConversions.length !== 1) {
  throw new Error(
    `a literal that becomes a token binding at the same site must be one literalToTokenConversions entry, got ${JSON.stringify(conversionDiff.literalToTokenConversions)}`,
  );
}
if (conversionDiff.localContractCorrections.length !== 0) {
  throw new Error(
    `a forbidden conversion must not also be reported as a local correction: ${JSON.stringify(conversionDiff.localContractCorrections)}`,
  );
}
const conversionEntry = JSON.stringify(conversionDiff.literalToTokenConversions[0]);
for (const named of [
  "ds.hero",
  "/anatomy/root/parts/Titre/literals/line-height",
  "40px",
  "{font.line-height.40}",
]) {
  if (!conversionEntry.includes(named)) {
    throw new Error(
      `the conversion entry must localize the finding by ${named}; got ${conversionEntry}`,
    );
  }
}
expectRefused(
  conversionDiff,
  ["ds.hero", "/anatomy/root/parts/Titre/literals/line-height"],
  "a literal→token conversion attributable to 013",
);

if (localDiff.literalToTokenConversions.length !== 0) {
  throw new Error(
    `a literal replaced by another literal is a local correction, not a conversion: ${JSON.stringify(localDiff.literalToTokenConversions)}`,
  );
}
if (localDiff.localContractCorrections.length === 0) {
  throw new Error("a local contract correction must still be reported, not silently dropped");
}
expectAccepted(localDiff, "a local literal-for-literal correction");

// ---------------------------------------------------------------------------
// 4. The other legitimate corrections D12 must keep allowed.
// ---------------------------------------------------------------------------

// A literal whose VALUE changes to another literal.
const afterValueChange = clone(BASE_CONTRACTS) as any;
afterValueChange["ds.hero"].anatomy.root.parts.Image.literals.height = "364px";
const valueChangeDiff = typedDiff(afterValueChange);
if (valueChangeDiff.literalToTokenConversions.length !== 0) {
  throw new Error(
    `418px → 364px is a local correction, not a conversion: ${JSON.stringify(valueChangeDiff.literalToTokenConversions)}`,
  );
}
if (valueChangeDiff.localContractCorrections.length !== 1) {
  throw new Error(
    `a changed literal value must be one localContractCorrections entry, got ${JSON.stringify(valueChangeDiff.localContractCorrections)}`,
  );
}
expectAccepted(valueChangeDiff, "a literal value corrected to another literal");

// A genuinely new prop, adding literals at pointers the baseline never held.
const afterNewProp = clone(BASE_CONTRACTS) as any;
afterNewProp["ds.sav"].props.disposition = { type: "enum", values: ["large", "compact"] };
afterNewProp["ds.sav"].anatomy.root.parts.Onglet.literalsByProp.push({
  prop: "disposition",
  map: { compact: { "padding-bottom": "4px" } },
});
const newPropDiff = typedDiff(afterNewProp);
if (newPropDiff.literalToTokenConversions.length !== 0) {
  throw new Error(
    `a new prop introducing new literals is not a conversion: ${JSON.stringify(newPropDiff.literalToTokenConversions)}`,
  );
}
if (newPropDiff.localContractCorrections.length === 0) {
  throw new Error("a new prop's literals must appear as local contract corrections");
}
expectAccepted(newPropDiff, "a genuinely new prop");

// A token binding on a site that never held an inventoried literal converts
// nothing.  Only a baseline literal at the same site makes it a conversion —
// this is the distinction a textual diff structurally cannot make.
const afterNewTokenSite = clone(BASE_CONTRACTS) as any;
afterNewTokenSite["ds.hero"].anatomy.root.parts.Image.tokens = {
  "border-radius": "{radius.8}",
};
const newTokenSiteDiff = typedDiff(afterNewTokenSite);
if (newTokenSiteDiff.literalToTokenConversions.length !== 0) {
  throw new Error(
    `a token binding on a site with no baseline literal converts nothing: ${JSON.stringify(newTokenSiteDiff.literalToTokenConversions)}`,
  );
}
expectAccepted(newTokenSiteDiff, "a token binding on a previously unbound site");

// ---------------------------------------------------------------------------
// 5. `tokens/**` is not a source 013 may modify — in any direction.
// ---------------------------------------------------------------------------

const mutatedFoundation = clone(TOKEN_FOUNDATION);
mutatedFoundation["tokens/semantic.tokens.json"] = "d".repeat(64);
const addedFoundation = clone(TOKEN_FOUNDATION);
addedFoundation["tokens/organisms.tokens.json"] = "e".repeat(64);
const removedFoundation = clone(TOKEN_FOUNDATION);
delete removedFoundation["tokens/modes.tokens.json"];

for (const [label, foundation, named] of [
  ["a changed token file", mutatedFoundation, "tokens/semantic.tokens.json"],
  ["an added token file", addedFoundation, "tokens/organisms.tokens.json"],
  ["a removed token file", removedFoundation, "tokens/modes.tokens.json"],
] as const) {
  const diff = typedDiff(clone(BASE_CONTRACTS) as Record<string, unknown>, foundation);
  if (diff.tokenFoundationChanges.length !== 1) {
    throw new Error(
      `${label} must be one tokenFoundationChanges entry, got ${JSON.stringify(diff.tokenFoundationChanges)}`,
    );
  }
  // Contracts are untouched here: the foundation change alone must refuse.
  if (diff.literalToTokenConversions.length !== 0) {
    throw new Error(`${label} must not be miscounted as a conversion`);
  }
  expectRefused(diff, [named], label);
}

// A campaign that both converts and corrects is still refused, and the honest
// local correction is still reported rather than swallowed by the refusal.
const afterBoth = clone(afterConversion) as any;
afterBoth["ds.hero"].anatomy.root.parts.Image.literals.height = "364px";
const bothDiff = typedDiff(afterBoth, mutatedFoundation);
if (bothDiff.localContractCorrections.length !== 1) {
  throw new Error(
    `a refused campaign must still report its legitimate corrections, got ${JSON.stringify(bothDiff.localContractCorrections)}`,
  );
}
expectRefused(
  bothDiff,
  ["ds.hero", "tokens/semantic.tokens.json"],
  "a campaign mixing a conversion, a foundation change and a correction",
);

console.log(
  "✔ the non-conversion receipt refuses literal→token conversions and tokens/** mutations by name, while a typed diff keeps legitimate local contract corrections allowed where git diff could not",
);
