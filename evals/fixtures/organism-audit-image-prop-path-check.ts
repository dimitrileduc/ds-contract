/**
 * Adversarial contract for IMAGE facts in the organism audit (D10).
 *
 * A pixel comparison is trivially winnable by putting the Figma bytes on the
 * screen through a back door: a campaign stylesheet, a placeholder, a runtime
 * default baked into the component, or an empty box tinted to look right.  Each
 * of those makes the generated side *resemble* the reference while proving
 * nothing about the shipping library, because none of them travels the path a
 * real consumer would use.
 *
 * The only admissible route is a declared comparison prop path carrying a
 * `{"$asset":"id"}` reference that resolves to a hashed asset of the fixture
 * manifest — the same discipline `extract/figma/visual-parity/campaign.ts`
 * already enforces for `codeProps`.
 *
 *   resolveImageInjection({ propPath, value, assetManifest, injectionKind })
 *
 * The organisms this bites are `hero`, `coordonnees` and `sav`: their Figma
 * sources carry IMAGE paints with no contractual or React projection at all —
 * `src/components/SAV/SAV.tsx` renders `<div className={styles.img}></div>`,
 * an empty box whose class has no rule in `SAV.module.css`.  Such a fact must
 * stay divergent/limited/not-proven; the runner never makes it look right.
 *
 * Data-only: no Chromium, no Figma call, no filesystem writes.
 */
import { resolveImageInjection } from "../../extract/figma/organism-audit/facts.js";

type InjectionInput = Parameters<typeof resolveImageInjection>[0];
type InjectionKind = InjectionInput["injectionKind"];
type InjectionResult = ReturnType<typeof resolveImageInjection>;

/** Real id + digest from extract/figma/visual-parity/fixture-assets/manifest.json. */
const CARTE_REASSURANCE = "carte-reassurance";
const CARTE_REASSURANCE_SHA =
  "00ac72d30d1f3a0c1d37d4f4bb3a8024e01de9aa13a7f8c76f10d1fba96213a9";

/**
 * The manifest deliberately has no `hero`, `coordonnees` or `sav` entry — that
 * is the state of the real fixture manifest, and the reason those three
 * organisms cannot be proved on their image facts today.  The unhashed entry
 * exercises the "hashed asset" half of the rule.
 */
const ASSET_MANIFEST = {
  schemaVersion: 1,
  assets: [
    { id: CARTE_REASSURANCE, sha256: CARTE_REASSURANCE_SHA },
    { id: "unhashed-asset" },
  ],
};

const DECLARED_PROP_PATH = "codeProps.imageUrl";

const NON_POSITIVE_OUTCOMES = ["divergent", "limited", "not-proven"] as const;

const REFUSED_INJECTION_KINDS: InjectionKind[] = [
  "campaign-css",
  "placeholder",
  "runtime-default",
  "empty-div",
];

function render(result: InjectionResult): string {
  return (
    `ok=${result.ok}, assetId=${String(result.assetId)}, ` +
    `outcome=${String(result.outcome)}, reasons=${result.reasons.join("; ") || "none"}`
  );
}

function resolve(input: InjectionInput): InjectionResult {
  const result = resolveImageInjection(input);
  // Honesty convention: an admitted injection must name its asset, and a
  // refused one must never leave an asset id behind for a caller to use.
  if (result.ok && !result.assetId) {
    throw new Error(
      `an admitted injection must name its asset: ${JSON.stringify(input.value)} -> ${render(result)}`,
    );
  }
  if (!result.ok && result.assetId !== null) {
    throw new Error(
      `a refused injection must not carry an asset id: ${JSON.stringify(input.value)} -> ${render(result)}`,
    );
  }
  if (!result.ok && result.reasons.length === 0) {
    throw new Error(
      `a refused injection must name a reason: ${JSON.stringify(input.value)} -> ${render(result)}`,
    );
  }
  return result;
}

function expectAdmitted(label: string, input: InjectionInput): void {
  const result = resolve(input);
  if (!result.ok || result.assetId !== CARTE_REASSURANCE) {
    throw new Error(
      `${label} must be admitted with its resolved asset; got ${render(result)}`,
    );
  }
  if (result.outcome !== null && result.outcome !== "proved") {
    throw new Error(
      `${label} was admitted but forced a negative outcome; got ${render(result)}`,
    );
  }
}

function expectRefused(label: string, input: InjectionInput): void {
  const result = resolve(input);
  if (result.ok) {
    throw new Error(`${label} must be refused; got ${render(result)}`);
  }
  if (result.outcome === "proved") {
    throw new Error(
      `${label} was refused but still yielded a pass outcome; got ${render(result)}`,
    );
  }
}

/** A refusal that must also settle the fact, not leave it undecided. */
function expectNonPositiveOutcome(label: string, input: InjectionInput): void {
  expectRefused(label, input);
  const result = resolve(input);
  if (
    result.outcome === null ||
    !(NON_POSITIVE_OUTCOMES as readonly string[]).includes(result.outcome)
  ) {
    throw new Error(
      `${label} must settle as divergent/limited/not-proven; got ${render(result)}`,
    );
  }
}

// The one admissible route: a declared comparison prop path carrying an
// `$asset` reference that resolves to a hashed manifest entry.
expectAdmitted("a declared prop path resolving a hashed manifest asset", {
  propPath: DECLARED_PROP_PATH,
  value: { $asset: CARTE_REASSURANCE },
  assetManifest: ASSET_MANIFEST,
  injectionKind: "declared-prop-path",
});

// Even on the admissible route, the reference itself has to hold up.
for (const [label, value] of [
  ["an $asset id absent from the manifest", { $asset: "missing-asset" }],
  ["an $asset entry with no sha256 in the manifest", { $asset: "unhashed-asset" }],
  [
    "an $asset reference smuggling a sibling url",
    { $asset: CARTE_REASSURANCE, url: "/escape.jpg" },
  ],
  ["a raw url instead of an $asset reference", "/images/hero.jpg"],
  ["an absolute remote url", "https://example.invalid/hero.jpg"],
  ["a data uri", "data:image/png;base64,iVBORw0KGgo="],
  ["an empty $asset id", { $asset: "" }],
  ["a non-string $asset id", { $asset: 42 }],
  ["an empty object", {}],
  ["a null value", null],
  ["an undefined value", undefined],
] as Array<[string, unknown]>) {
  expectRefused(label, {
    propPath: DECLARED_PROP_PATH,
    value,
    assetManifest: ASSET_MANIFEST,
    injectionKind: "declared-prop-path",
  });
}

// A resolving asset with no declared prop path has no route into the render.
for (const propPath of [null, "", "  "]) {
  expectRefused(`a resolving asset with propPath=${JSON.stringify(propPath)}`, {
    propPath,
    value: { $asset: CARTE_REASSURANCE },
    assetManifest: ASSET_MANIFEST,
    injectionKind: "declared-prop-path",
  });
}

// A manifest that is absent or empty resolves nothing, however good the value.
for (const [label, assetManifest] of [
  ["a null manifest", null],
  ["an empty manifest", { schemaVersion: 1, assets: [] }],
] as Array<[string, unknown]>) {
  expectRefused(`${label} cannot resolve an $asset reference`, {
    propPath: DECLARED_PROP_PATH,
    value: { $asset: CARTE_REASSURANCE },
    assetManifest,
    injectionKind: "declared-prop-path",
  });
}

// The decisive vectors: a *perfectly valid* asset reference is still refused
// when the bytes arrive by any other route.  Campaign CSS, a placeholder, a
// runtime default and an empty div all make the screenshot match while proving
// nothing about the shipping component.
for (const injectionKind of REFUSED_INJECTION_KINDS) {
  expectRefused(`a resolving asset injected via ${injectionKind}`, {
    propPath: DECLARED_PROP_PATH,
    value: { $asset: CARTE_REASSURANCE },
    assetManifest: ASSET_MANIFEST,
    injectionKind,
  });
}

// hero / coordonnees / sav: the Figma source carries an IMAGE paint that has no
// contractual and no React projection.  There is no prop path, no value, and
// nothing in the manifest — the fact must be settled as unproven, never left
// null for the runner to fill in.
for (const injectionKind of REFUSED_INJECTION_KINDS) {
  expectNonPositiveOutcome(
    `an organism image with no projection at all (${injectionKind})`,
    {
      propPath: null,
      value: undefined,
      assetManifest: ASSET_MANIFEST,
      injectionKind,
    },
  );
}
expectNonPositiveOutcome(
  "an organism image declared on a prop path that carries nothing",
  {
    propPath: DECLARED_PROP_PATH,
    value: undefined,
    assetManifest: ASSET_MANIFEST,
    injectionKind: "declared-prop-path",
  },
);

console.log(
  "✔ image facts admit bytes only through a declared prop path resolving a hashed manifest asset, refuse campaign CSS / placeholder / runtime-default / empty-div injections, and settle an unprojected organism image as divergent, limited or not-proven",
);
