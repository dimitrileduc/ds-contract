/**
 * Adversarial contract for prop propagation inside an audited organism (D6).
 *
 * The defect this pins is real and currently shipping: `PresentationProps`
 * exposes `titre`, but `src/components/Presentation/Presentation.tsx` hands the
 * nested `SectionHeader` a hard-coded literal, so the prop reaches nothing.  A
 * TypeScript interface that *declares* the prop, or a screenshot that shows the
 * defect, are both accepted as proof by a careless audit — neither observes the
 * value actually landing in the DOM.  Only a probe value driven through the
 * public prop and read back off the rendered tree can separate "exposed" from
 * "projected".
 *
 *   evaluatePropProjection({ probeValue, observedDomValue, interfaceExposesProp,
 *                            figmaBindingKind, bindingJustified })
 *
 * Data-only: no Chromium, no Figma call, no filesystem writes.
 */
import { evaluatePropProjection } from "../../extract/figma/organism-audit/facts.js";

type ProjectionInput = Parameters<typeof evaluatePropProjection>[0];
type ProjectionResult = ReturnType<typeof evaluatePropProjection>;

/** A value no generated default can accidentally equal. */
const PROBE = "PROBE::titre::7f3c1d";
/** The literal Presentation.tsx currently passes down instead of the prop. */
const LITERAL = "Piqueray, une histoire de famille ";

const NEVER_PROVED = ["divergent", "limited", "not-proven"] as const;

function describe(input: ProjectionInput): string {
  return JSON.stringify(input);
}

function render(result: ProjectionResult): string {
  return (
    `outcome=${result.outcome}, localizedSource=${String(result.localizedSource)}, ` +
    `reasons=${result.reasons.join("; ") || "none"}`
  );
}

/**
 * Every evaluation goes through here so one shared invariant is checked on all
 * vectors: a divergence that names no source cannot be acted on, and the
 * verdict layer refuses it anyway.
 */
function evaluate(input: ProjectionInput): ProjectionResult {
  const result = evaluatePropProjection(input);
  if (result.outcome === "divergent" && !result.localizedSource) {
    throw new Error(
      `divergent projection must localize its source: ${describe(input)} -> ${render(result)}`,
    );
  }
  if (result.outcome !== "proved" && result.reasons.length === 0) {
    throw new Error(
      `a non-passing projection must name a reason: ${describe(input)} -> ${render(result)}`,
    );
  }
  return result;
}

function expect(
  label: string,
  input: ProjectionInput,
  expected: { outcome: string; localizedSource?: string | null },
): void {
  const result = evaluate(input);
  if (
    result.outcome !== expected.outcome ||
    (expected.localizedSource !== undefined &&
      result.localizedSource !== expected.localizedSource)
  ) {
    throw new Error(
      `${label}: expected outcome=${expected.outcome}` +
        (expected.localizedSource === undefined
          ? ""
          : `, localizedSource=${String(expected.localizedSource)}`) +
        `; got ${render(result)}`,
    );
  }
}

function expectNeverProved(label: string, input: ProjectionInput): void {
  const result = evaluate(input);
  if (!(NEVER_PROVED as readonly string[]).includes(result.outcome)) {
    throw new Error(
      `${label} must never be proved; got ${render(result)}`,
    );
  }
}

// The decisive case.  The interface exposes `titre`, the probe was driven
// through it, and the DOM still shows the hard-coded literal: the prop is
// exposed but not projected, and the defect is in the generated component —
// not in Figma and not in the contract.
expect(
  "a prop exposed by the interface but still rendered as a literal",
  {
    probeValue: PROBE,
    observedDomValue: LITERAL,
    interfaceExposesProp: true,
  },
  { outcome: "divergent", localizedSource: "generated" },
);

// The same shape once the generator threads the prop through.
expect(
  "a prop whose probe value reaches the DOM",
  {
    probeValue: PROBE,
    observedDomValue: PROBE,
    interfaceExposesProp: true,
  },
  { outcome: "proved" },
);

// A TypeScript interface is a declaration, not an observation.  With no DOM
// reading at all there is nothing to compare, so this can never be a pass —
// this is exactly the shortcut that would have declared Presentation correct.
expectNeverProved("an exposed prop with no DOM observation at all", {
  probeValue: PROBE,
  observedDomValue: null,
  interfaceExposesProp: true,
});

// Neither is a prop that the interface never exposed.
expectNeverProved("a prop absent from the interface, literal in the DOM", {
  probeValue: PROBE,
  observedDomValue: LITERAL,
  interfaceExposesProp: false,
});
expectNeverProved("a prop absent from the interface and unobserved", {
  probeValue: PROBE,
  observedDomValue: null,
  interfaceExposesProp: false,
});

// An empty rendering is not a match either, however the probe is spelled.
expectNeverProved("an exposed prop rendering an empty string", {
  probeValue: PROBE,
  observedDomValue: "",
  interfaceExposesProp: true,
});

// `bindings.figma.kind: "NONE"` says the collection carries no Figma binding.
// Unjustified, that is an unproven claim, not a conformance: even the most
// favourable evidence — interface exposes the prop AND the probe reaches the
// DOM — cannot promote it to a pass.
const unjustifiedNoneVectors: Array<{
  label: string;
  input: ProjectionInput;
}> = [
  {
    label: "an unjustified NONE binding with a perfect DOM match",
    input: {
      probeValue: PROBE,
      observedDomValue: PROBE,
      interfaceExposesProp: true,
      figmaBindingKind: "NONE",
      bindingJustified: false,
    },
  },
  {
    label: "an unjustified NONE binding with no justification flag supplied",
    input: {
      probeValue: PROBE,
      observedDomValue: PROBE,
      interfaceExposesProp: true,
      figmaBindingKind: "NONE",
    },
  },
  {
    label: "an unjustified NONE binding that also renders a literal",
    input: {
      probeValue: PROBE,
      observedDomValue: LITERAL,
      interfaceExposesProp: true,
      figmaBindingKind: "NONE",
      bindingJustified: false,
    },
  },
];

for (const { label, input } of unjustifiedNoneVectors) {
  const result = evaluate(input);
  if (!["limited", "not-proven", "divergent"].includes(result.outcome)) {
    throw new Error(
      `${label} must stay limited/not-proven (or divergent), never conformant by default; got ${render(result)}`,
    );
  }
}

// A NONE binding justified by anatomy, sample or occurrence is admissible: the
// rule refuses unjustified silence, not every code-only prop.
{
  const justified = evaluate({
    probeValue: PROBE,
    observedDomValue: PROBE,
    interfaceExposesProp: true,
    figmaBindingKind: "NONE",
    bindingJustified: true,
  });
  if (!["proved", "limited"].includes(justified.outcome)) {
    throw new Error(
      `a justified NONE binding with a projected probe must be admissible; got ${render(justified)}`,
    );
  }
}

// A justified binding does not excuse a broken projection.
expect(
  "a justified NONE binding whose child still receives a literal",
  {
    probeValue: PROBE,
    observedDomValue: LITERAL,
    interfaceExposesProp: true,
    figmaBindingKind: "NONE",
    bindingJustified: true,
  },
  { outcome: "divergent", localizedSource: "generated" },
);

console.log(
  "✔ prop projection localizes an exposed-but-unprojected prop to the generated surface, refuses interface-only evidence, and never treats an unjustified NONE binding as conformant",
);
