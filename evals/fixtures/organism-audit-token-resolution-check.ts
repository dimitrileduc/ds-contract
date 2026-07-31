/**
 * Adversarial contract for the audit's TOKEN RESOLUTION (013).
 *
 * The audit compares the contract leg to the pinned Figma expectation.  It used
 * to do so by raw string equality, so a contract binding `{font.size.24}`
 * against a Figma expectation of `"24px"` was counted DIVERGENT — while the
 * token resolves to exactly 24px.  The instrument therefore penalised the
 * GOVERNED path and rewarded a raw literal, which is the opposite of the
 * doctrine it exists to enforce.  38 of the campaign's expectation facts sit in
 * a token channel; the defect coloured that whole class red on principle.
 *
 * Resolving references is only safe if it is fail-closed, so this fixture pins
 * the refusals as hard as the passes:
 *
 *   - `{font.size.24}` vs `"24px"` agrees, and the receipt SAYS it resolved;
 *   - an alias chain (`{typography.titre-4.size}` → `{font.size.24}` → 24px) is
 *     followed, on the repository's real DTCG source;
 *   - a token resolving to a DIFFERENT value diverges, and the reason cites the
 *     RESOLVED value next to the reference — `{font.size.32}` alone is
 *     unreadable in a report;
 *   - an UNRESOLVABLE reference (`{font.size.999}`, `{nawak}`) is NEVER a pass,
 *     not even when both legs carry the same broken string.  It is a typed
 *     divergence that names the token.  This is the load-bearing case: an
 *     instrument that silently swallows what it cannot resolve turns every
 *     future typo into a green fact;
 *   - a cycle is a named error, never a hang and never a throw;
 *   - a string that merely LOOKS like a reference (`"{"`, `"{}"`, `"{a b}"`,
 *     `"texte {avec} accolades"`) is not a token;
 *   - `{titre}` in a `component/props` pointer is a PROP reference, not a
 *     token — the contract schema only calls `{ref}` a token inside a `tokens`
 *     map (`tokens: z.record(z.string(), TokenRefSchema)`).  Resolving it there
 *     would fabricate a red on two facts that are green today (coordonnees'
 *     SectionHeader titre/accroche);
 *   - a non-token value keeps the exact pre-existing raw comparison, reason
 *     string included — no report churn on the facts already proved.
 *
 * Read-only and pure: no Chromium, no Figma call, no writes.  The only files
 * read are the repository's own token source (frozen by SC-005) and pilot.ts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildTokenResolver,
  compareFigmaExpectation,
  isTokenChannelPointer,
} from "../../extract/figma/organism-audit/facts.js";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

const readJson = (rel: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path.join(REPO_ROOT, rel), "utf8")) as Record<
    string,
    unknown
  >;

// The REAL token source — SC-005 freezes tokens/**, so pinning against it is
// pinning against the same bytes the audit will read.
const primitives = readJson("tokens/primitives.tokens.json");
const semantic = readJson("tokens/semantic.tokens.json");
const resolve = buildTokenResolver([primitives, semantic]);

const fail = (message: string): never => {
  throw new Error(message);
};

// ---------------------------------------------------------------------------
// 1. The resolver reads the real DTCG source
// ---------------------------------------------------------------------------

const direct = resolve("{font.size.24}");
if (direct.kind !== "resolved") {
  fail(`{font.size.24} must resolve against tokens/; got ${direct.kind}`);
}
if (direct.value !== "24px") {
  fail(`{font.size.24} must resolve to "24px"; got ${JSON.stringify(direct.value)}`);
}
if (direct.reference !== "font.size.24") {
  fail(
    `a resolution must carry the reference it followed; got ${JSON.stringify(direct.reference)}`,
  );
}

// An alias whose $value is itself a reference — the chain the DTCG semantic
// layer is built on (typography.titre-4.size → {font.size.24} → 24px).
const chained = resolve("{typography.titre-4.size}");
if (chained.kind !== "resolved" || chained.value !== "24px") {
  fail(
    `an alias chain must be followed to its literal; got ${chained.kind}=${JSON.stringify(chained.value)}`,
  );
}
if (chained.hops < 2) {
  fail(`a two-hop alias must report at least 2 hops; got ${chained.hops}`);
}

// A number-valued token stays a number: no stringification on the way out, or
// 600 would stop matching a Figma expectation of 600.
const weight = resolve("{font.weight.semibold}");
if (weight.kind !== "resolved" || weight.value !== 600) {
  fail(
    `{font.weight.semibold} must resolve to the number 600; got ${JSON.stringify(weight.value)}`,
  );
}

// ---------------------------------------------------------------------------
// 2. Fail-closed: an unresolvable reference is a typed, NAMED divergence
// ---------------------------------------------------------------------------

for (const broken of ["{font.size.999}", "{nawak}", "{color.pas-une-couleur}"]) {
  const verdict = resolve(broken);
  if (verdict.kind !== "unresolved") {
    fail(
      `${broken} must be reported unresolved, never resolved or silently passed through; got ${verdict.kind}`,
    );
  }
  const inner = broken.slice(1, -1);
  if (verdict.reason === null || !verdict.reason.includes(inner)) {
    fail(
      `an unresolved reference must NAME the token; ${broken} produced ${JSON.stringify(verdict.reason)}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 3. A cycle is a named error, not a hang and not a throw
// ---------------------------------------------------------------------------

const cyclic = buildTokenResolver([
  {
    loop: {
      $type: "dimension",
      a: { $value: "{loop.b}" },
      b: { $value: "{loop.a}" },
      self: { $value: "{loop.self}" },
    },
  },
]);
for (const entry of ["{loop.a}", "{loop.self}"]) {
  const verdict = cyclic(entry);
  if (verdict.kind !== "cycle") {
    fail(`${entry} must be reported as a cycle; got ${verdict.kind}`);
  }
  if (verdict.reason === null || verdict.reason.trim() === "") {
    fail(`${entry} was refused as a cycle without naming it`);
  }
}

// A long, non-cyclic chain must still terminate — the depth bound is what stops
// a pathological token file from wedging the whole audit.
const deepTree: Record<string, unknown> = { $type: "dimension" };
for (let i = 0; i < 30; i += 1) {
  (deepTree as Record<string, unknown>)[`n${i}`] = { $value: `{deep.n${i + 1}}` };
}
(deepTree as Record<string, unknown>).n30 = { $value: "1px" };
const deep = buildTokenResolver([{ deep: deepTree }], { maxAliasDepth: 4 });
const tooDeep = deep("{deep.n0}");
if (tooDeep.kind !== "depth-exceeded") {
  fail(`a chain longer than maxAliasDepth must be refused by name; got ${tooDeep.kind}`);
}
if (tooDeep.reason === null || !tooDeep.reason.includes("4")) {
  fail(
    `the depth refusal must name the bound it hit; got ${JSON.stringify(tooDeep.reason)}`,
  );
}

// ---------------------------------------------------------------------------
// 4. Looking like a reference is not being one
// ---------------------------------------------------------------------------

const notReferences: unknown[] = [
  "24px",
  "{",
  "}",
  "{}",
  "{a b}",
  "texte {avec} accolades",
  "{font.size.24} et autre chose",
  "{{font.size.24}}",
  "",
  24,
  null,
  true,
  { $value: "{font.size.24}" },
  ["{font.size.24}"],
];
for (const value of notReferences) {
  const verdict = resolve(value);
  if (verdict.kind !== "literal") {
    fail(
      `${JSON.stringify(value)} is not a token reference; got kind=${verdict.kind}`,
    );
  }
  if (verdict.reference !== null) {
    fail(
      `${JSON.stringify(value)} must carry no reference; got ${JSON.stringify(verdict.reference)}`,
    );
  }
  if (JSON.stringify(verdict.value) !== JSON.stringify(value)) {
    fail(
      `a literal must come back untouched; ${JSON.stringify(value)} became ${JSON.stringify(verdict.value)}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 5. The channel gate — `{ref}` is a token only inside a `tokens` map
// ---------------------------------------------------------------------------

for (const pointer of [
  "/anatomy/root/tokens/font-size",
  "/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseEtiquette/tokens/font-size",
]) {
  if (!isTokenChannelPointer(pointer)) {
    fail(`${pointer} points inside a tokens map and must be a token channel`);
  }
}
for (const pointer of [
  "/anatomy/root/parts/wrapper/parts/SectionHeader/component/props/titre",
  "/anatomy/root/parts/wrapper/literals/gap",
  "/props/0/bindings/figma/kind",
  "/anatomy/root/layout/direction",
  // the map itself, not a channel inside it: there is no single value to resolve
  "/anatomy/root/tokens",
  // a part legitimately NAMED "tokens" is not a tokens map
  "/anatomy/root/parts/tokens/literals/gap",
]) {
  if (isTokenChannelPointer(pointer)) {
    fail(`${pointer} is not a token channel and must not be resolved as one`);
  }
}

// ---------------------------------------------------------------------------
// 6. The comparison the audit actually performs
// ---------------------------------------------------------------------------

const TOKEN_POINTER =
  "/anatomy/root/parts/wrapper/parts/Adresse/parts/AdresseEtiquette/tokens/font-size";

const compare = (
  contractValue: unknown,
  expectedValue: unknown,
  jsonPointer = TOKEN_POINTER,
  carried = true,
) =>
  compareFigmaExpectation({
    channel: "AdresseEtiquette.font-size",
    jsonPointer,
    carried,
    contractValue,
    expectedValue,
    resolve,
  });

// (a) the defect this fixture exists for
const governed = compare("{font.size.24}", "24px");
if (!governed.agrees) {
  fail(
    `a contract binding {font.size.24} against a Figma expectation of "24px" must AGREE; got ${governed.reasons.join("; ")}`,
  );
}
if (governed.reasons.length !== 0) {
  fail(`an agreeing fact must carry no reason; got ${governed.reasons.join("; ")}`);
}
// The receipt must say the pass came through a token, or the dossier claims a
// literal match that never happened.
if (
  !governed.notes.some(
    (note) => note.includes("font.size.24") && note.includes("24px"),
  )
) {
  fail(
    `a pass obtained by resolution must be receipted with reference AND resolved value; got ${JSON.stringify(governed.notes)}`,
  );
}

// (b) a token that resolves elsewhere is still a divergence — and readable
const wrongToken = compare("{font.size.32}", "24px");
if (wrongToken.agrees) {
  fail("{font.size.32} does not resolve to 24px and must NOT agree");
}
const wrongReason = wrongToken.reasons.join(" | ");
for (const fragment of ["font.size.32", "32px", "24px"]) {
  if (!wrongReason.includes(fragment)) {
    fail(
      `the divergence must cite ${fragment} (reference AND resolved value AND expectation); got ${wrongReason}`,
    );
  }
}

// (c) fail-closed, even when both legs carry the same broken reference
for (const [contractValue, expected] of [
  ["{font.size.999}", "24px"],
  ["{nawak}", "24px"],
  ["{font.size.999}", "{font.size.999}"],
  ["{nawak}", "{nawak}"],
] as Array<[string, string]>) {
  const verdict = compare(contractValue, expected);
  if (verdict.agrees) {
    fail(
      `an unresolvable reference must never pass, not even against an identical string: ${contractValue} vs ${expected}`,
    );
  }
  if (!verdict.reasons.join(" | ").includes(contractValue.slice(1, -1))) {
    fail(
      `the refusal must NAME the unresolved token; ${contractValue} produced ${verdict.reasons.join(" | ")}`,
    );
  }
}

// An unresolvable expectation is refused on its own leg, and says so.
const brokenExpectation = compare("{font.size.24}", "{font.size.999}");
if (brokenExpectation.agrees) {
  fail("an unresolvable Figma expectation must not be laundered into a pass");
}
if (!brokenExpectation.reasons.join(" | ").includes("font.size.999")) {
  fail(
    `the refusal must name the unresolved expectation token; got ${brokenExpectation.reasons.join(" | ")}`,
  );
}

// (d) equal-by-resolution in the other direction: an expectation written as a
// token against a contract carrying the same token stays green.
const bothTokens = compare(
  "{color.noir-bleute}",
  "{color.noir-bleute}",
  "/anatomy/root/parts/Background/tokens/background-color",
);
if (!bothTokens.agrees) {
  fail(
    `two identical token references must agree; got ${bothTokens.reasons.join("; ")}`,
  );
}

// (e) NO REGRESSION — a non-token value keeps the raw comparison, verbatim
const rawAgree = compare("16px", "16px", "/anatomy/root/parts/wrapper/literals/gap");
if (!rawAgree.agrees || rawAgree.reasons.length !== 0) {
  fail("a raw literal equal to its expectation must still agree with no reason");
}
const rawDiffer = compare(
  "row",
  "row-reverse",
  "/anatomy/root/layout/direction",
);
if (rawDiffer.agrees) fail('"row" must not agree with "row-reverse"');
if (
  !rawDiffer.reasons.some(
    (reason) =>
      reason.startsWith("contract-value-differs:") &&
      reason.includes('"row"') &&
      reason.includes('"row-reverse"'),
  )
) {
  fail(
    `the pre-existing raw divergence reason must be preserved byte-for-byte in shape; got ${rawDiffer.reasons.join("; ")}`,
  );
}

// (f) the prop-reference trap: `{titre}` is NOT a token, and resolving it would
// turn two green coordonnees facts red.
const propReference = compare(
  "{titre}",
  "{titre}",
  "/anatomy/root/parts/wrapper/parts/SectionHeader/component/props/titre",
);
if (!propReference.agrees) {
  fail(
    `{titre} in a component/props pointer is a PROP reference; treating it as a token fabricates a red: ${propReference.reasons.join("; ")}`,
  );
}

// (g) an absent contract value keeps its own typed reason — resolution must not
// convert "the contract says nothing" into "the values differ".
const absent = compare(undefined, "24px", TOKEN_POINTER, false);
if (absent.agrees) fail("an uncarried fact must never agree");
if (
  !absent.reasons.some((reason) =>
    reason.startsWith("contract-does-not-carry-figma-fact:"),
  )
) {
  fail(
    `an uncarried fact must keep its typed reason; got ${absent.reasons.join("; ")}`,
  );
}

// (h) without a resolver the comparison degrades to raw equality — named, not
// silently lenient.
const noResolver = compareFigmaExpectation({
  channel: "AdresseEtiquette.font-size",
  jsonPointer: TOKEN_POINTER,
  carried: true,
  contractValue: "{font.size.24}",
  expectedValue: "24px",
});
if (noResolver.agrees) {
  fail("with no token source supplied, the audit must not GUESS that a reference matches");
}

// ---------------------------------------------------------------------------
// 7. The wiring — the pilot must use the shared comparator
// ---------------------------------------------------------------------------

const pilotSource = fs.readFileSync(
  path.join(REPO_ROOT, "extract/figma/organism-audit/pilot.ts"),
  "utf8",
);
if (!/compareFigmaExpectation\(/.test(pilotSource)) {
  fail(
    "pilot.ts must call compareFigmaExpectation — a resolver nothing calls leaves every token-bound fact red",
  );
}
if (!/buildTokenResolver\(/.test(pilotSource)) {
  fail(
    "pilot.ts must build the token resolver from the repository's DTCG source, or the comparison has nothing to resolve against",
  );
}
// The old raw equality must be gone from the expectation branch, not merely
// shadowed by the new call.
if (
  /JSON\.stringify\(pointer\.value\)\s*===\s*JSON\.stringify\(\s*declaration\.figmaExpectation\.value/.test(
    pilotSource,
  )
) {
  fail(
    "pilot.ts still compares the contract leg to the Figma expectation by raw string equality",
  );
}

console.log(
  "✔ organism audit resolves contract token references against tokens/*.tokens.json before comparing (aliases followed, cycles and unresolvable references refused BY NAME, prop references and brace-shaped strings left alone, raw comparison unchanged)",
);
