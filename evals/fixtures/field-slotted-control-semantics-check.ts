/**
 * Field slotted-control semantics regression.
 *
 * A Field is a layout and labelling molecule; its consumer supplies the
 * actual form control through the restricted `children` slot. The control,
 * not Field's presentational slot wrapper, must therefore receive both:
 *
 *   - FILL width, so Input/Select/Textarea occupy the Field's available
 *     cross-axis width; and
 *   - state-derived ARIA attributes. An error state marks the control invalid
 *     and relates it to the rendered error message; normal removes that
 *     relationship while retaining aria-invalid="false".
 *
 * The `slot.control` extension below is intentionally fixture-local until
 * T026 gives it schema vocabulary. T027 must consume it consistently on the
 * code surfaces. Keeping the fixture parseable now means the first failure
 * names the missing emitted semantics instead of stopping at schema parsing.
 */
import { ContractSchema } from "../../scripts/contract-schema.js";
import { emitFigmaScript } from "../../core/emit-figma-script.js";
import { emitHtml } from "../../core/emit-html.js";
import {
  emitReact,
  generateCss,
  validateContract,
} from "../../core/emit-react.js";
import { emitReactInline } from "../../core/emit-react-inline.js";

type SlotControlSemantics = {
  /** The accepted control, not just its wrapper, fills Field's cross axis. */
  fill: "width";
  /** Attributes resolve from the named parent prop for every legal value. */
  attributes: Record<
    string,
    {
      prop: "etat";
      values: Record<"normal" | "erreur", string | null>;
    }
  >;
  /** Parent-owned state paint reaches the actual native control. */
  styles: Record<
    "border-color",
    {
      prop: "etat";
      values: Record<"normal" | "erreur", string | null>;
    }
  >;
};

type SlotWithControl = {
  control?: SlotControlSemantics;
};

const problems: string[] = [];
const expect = (condition: unknown, message: string) => {
  if (!condition) problems.push(message);
};
const controlTag = (html: string) =>
  [...html.matchAll(/<input\b[^>]*>/g)][0]?.[0] ?? "";

const input = ContractSchema.parse({
  id: "fixture.field-control-input",
  name: "FieldControlInput",
  version: "1.0.0",
  description: "Independent native input accepted by the Field fixture.",
  semantics: { element: "input" },
  props: [
    {
      name: "value",
      type: "text",
      default: "Example value",
      bindings: {
        figma: { kind: "TEXT", property: "Value" },
        code: { prop: "value" },
      },
    },
  ],
  states: [],
  anatomy: {
    root: {
      attrs: { type: "text" },
      // A real extracted input owns a visible text anatomy even though the
      // native <input> host is void.  This is the production shape that used
      // to make the static HTML emitter replace the control with a <div>.
      // The fixture must cover that content-model boundary, not only a
      // simplified leaf input that happens to stay native already.
      parts: {
        Value: { element: "span", content: { prop: "value" } },
      },
    },
  },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: {
      importPath: "src/components/FieldControlInput",
      export: "FieldControlInput",
    },
  },
});

const field = (id: string, name: string, defaultEtat: "normal" | "erreur") => {
  const contract = ContractSchema.parse({
    id,
    name,
    version: "1.0.0",
    description:
      "Independent Field fixture with a restricted form-control slot.",
    semantics: { element: "div" },
    props: [
      {
        name: "etat",
        type: { enum: ["normal", "erreur"] },
        default: defaultEtat,
        bindings: {
          figma: {
            kind: "VARIANT",
            property: "Etat",
            values: { normal: "Normal", erreur: "Erreur" },
          },
          code: { prop: "etat" },
        },
      },
    ],
    states: [],
    anatomy: {
      root: {
        layout: { display: "flex", direction: "column", align: "stretch" },
        parts: {
          Control: {
            // Stretch is the existing cross-surface FILL primitive. The
            // control annotation below additionally requires the React
            // surfaces to preserve that width when cloning a supplied child.
            layout: { display: "flex", direction: "column", align: "stretch" },
            slot: {
              name: "children",
              accepts: [input.id],
              defaultContent: [{ id: input.id }],
            },
          },
          ErrorMessage: {
            element: "span",
            text: "Use a valid value.",
            attrs: { id: "eval-field-error" },
            visibleWhen: { prop: "etat", equals: "erreur" },
          },
        },
      },
    },
    anchors: {
      figma: { fileKey: null, componentSetKey: null },
      code: { importPath: `src/components/${name}`, export: name },
    },
  });

  // Keep the projection under test explicit: the slot owns only its
  // state-derived control semantics, never the child contract's anatomy.
  const slot = contract.anatomy.root.parts.Control
    .slot as typeof contract.anatomy.root.parts.Control.slot & SlotWithControl;
  slot.control = {
    fill: "width",
    attributes: {
      "aria-invalid": {
        prop: "etat",
        values: { normal: "false", erreur: "true" },
      },
      "aria-describedby": {
        prop: "etat",
        values: { normal: null, erreur: "eval-field-error" },
      },
    },
    styles: {
      "border-color": {
        prop: "etat",
        values: { normal: "{color.bleu-gris}", erreur: "{color.rouge}" },
      },
    },
  };
  return contract;
};

const normal = field(
  "fixture.field-slotted-control-normal",
  "FieldSlottedControlNormal",
  "normal",
);
const error = field(
  "fixture.field-slotted-control-error",
  "FieldSlottedControlError",
  "erreur",
);
const contracts = new Map([
  [input.id, input],
  [normal.id, normal],
  [error.id, error],
]);
const codeCtx = {
  tokens: new Set<string>(),
  icons: new Map<string, string>(),
  contracts,
};
const inlineTokens = {
  primitives: {
    color: {
      "bleu-gris": { $value: "#9BA4B5", $type: "color" },
      rouge: { $value: "#D32F2F", $type: "color" },
    },
  },
  semantic: {},
  light: {},
  dark: {},
  brands: { default: {} },
};

for (const contract of [normal, error]) {
  const errors: string[] = [];
  validateContract(contract, contracts, errors, codeCtx.icons);
  expect(
    errors.length === 0,
    `${contract.name}: valid restricted Field fixture was refused: ${errors.join(" | ")}`,
  );
}

// CSS Modules: the wrapper and its Figma counterpart must stretch the actual
// default instance. React additionally needs to preserve that fill when the
// consumer supplies its own accepted child.
const react = emitReact(normal, codeCtx);
const cssErrors: string[] = [];
const css = generateCss(normal, codeCtx.tokens, cssErrors);
const controlCss = css.match(/\.Control \{[^}]*\}/)?.[0] ?? "";
expect(
  cssErrors.length === 0,
  `React CSS generation refused the Field fixture: ${cssErrors.join(" | ")}`,
);
expect(
  /display: flex/.test(controlCss) &&
    /flex-direction: column/.test(controlCss) &&
    /align-items: stretch/.test(controlCss),
  `React CSS does not make the slotted control fill Field's cross axis:\n${controlCss}`,
);
expect(
  react.tsx.includes("cloneElement"),
  "React leaves the supplied Field control unmodified instead of forwarding slotted-control semantics",
);
expect(
  /width:\s*['"]100%['"]/.test(react.tsx),
  "React does not preserve fill width on the supplied Field control",
);
expect(
  react.tsx.includes("aria-invalid"),
  "React does not forward state-derived aria-invalid to the supplied Field control",
);
expect(
  react.tsx.includes("aria-describedby"),
  "React does not forward state-derived aria-describedby to the supplied Field control",
);
expect(
  /aria-invalid[\s\S]{0,160}etat/.test(react.tsx) &&
    /aria-describedby[\s\S]{0,160}etat[\s\S]{0,160}eval-field-error/.test(
      react.tsx,
    ),
  "React does not derive the slotted control ARIA attributes from etat",
);

// React-inline has no CSS selector escape hatch: its cloned slotted control
// must carry the same width and ARIA semantics directly.
const inline = emitReactInline(normal, {
  tokens: inlineTokens,
  icons: new Map(),
  contracts,
  mode: "light",
}).tsx;
expect(
  inline.includes("cloneElement"),
  "React inline leaves the supplied Field control unmodified instead of forwarding slotted-control semantics",
);
expect(
  /width:\s*['"]100%['"]/.test(inline),
  "React inline does not preserve fill width on the supplied Field control",
);
expect(
  inline.includes("aria-invalid"),
  "React inline does not forward state-derived aria-invalid to the supplied Field control",
);
expect(
  inline.includes("aria-describedby"),
  "React inline does not forward state-derived aria-describedby to the supplied Field control",
);
expect(
  /aria-invalid[\s\S]{0,160}etat/.test(inline) &&
    /aria-describedby[\s\S]{0,160}etat[\s\S]{0,160}eval-field-error/.test(
      inline,
    ),
  "React inline does not derive the slotted control ARIA attributes from etat",
);
expect(
  inline.includes('"borderColor"') &&
    inline.includes('"#9BA4B5"') &&
    inline.includes('"#D32F2F"') &&
    inline.includes('"--dsc-border-color"'),
  "React inline does not resolve state-derived control border paint to literal values",
);
expect(
  !inline.includes("var(--"),
  "React inline leaks a CSS custom-property reference from a slotted-control style",
);

// Static HTML renders slot defaultContent, so inspect the actual native input
// rather than accepting attributes accidentally placed on the wrapper.
const normalHtml = emitHtml(normal, codeCtx).html;
const errorHtml = emitHtml(error, codeCtx).html;
const normalControl = controlTag(normalHtml);
const errorControl = controlTag(errorHtml);
expect(
  normalControl.includes('aria-invalid="false"'),
  `HTML normal control is missing aria-invalid=false:\n${normalControl}`,
);
expect(
  !normalControl.includes("aria-describedby"),
  `HTML normal control incorrectly keeps an error description:\n${normalControl}`,
);
expect(
  errorControl.includes('aria-invalid="true"'),
  `HTML error control is missing aria-invalid=true:\n${errorControl}`,
);
expect(
  errorControl.includes('aria-describedby="eval-field-error"'),
  `HTML error control is not related to the error message:\n${errorControl}`,
);
expect(
  /<span\b[^>]*\bclass="field-slotted-control-error__ErrorMessage"[^>]*\bid="eval-field-error"[^>]*>/.test(errorHtml),
  "HTML error message target is absent or does not retain its id",
);

// The Figma script has no ARIA surface, but its default slot instance must
// use the same FILL width primitive. The compiled slot spec plus runtime
// stretch branch are both required; either alone would leave Input HUG-sized.
const figma = emitFigmaScript(normal, {
  tokens: inlineTokens,
  icons: new Map(),
  contracts,
});
const controlSpec =
  figma.match(
    /"type": "slot",\s*"name": "Control",[\s\S]*?"slotProperty": "Children"/,
  )?.[0] ?? "";
expect(
  controlSpec.includes('"stretchChildren": true'),
  `Figma slot spec does not stretch the default Field control:\n${controlSpec}`,
);
expect(
  /spec\.layout && spec\.layout\.stretchChildren[\s\S]{0,220}inst\.layoutSizingHorizontal = 'FILL'/.test(
    figma,
  ),
  "Figma runtime does not turn a stretched default slot instance into horizontal FILL",
);

// The parent-owned state paint is a VISUAL fact, so unlike ARIA it must also
// reach the canvas: a designer opening the Erreur variant has to see the red
// control border, not a default grey one. It rides the same token-variable
// binding as any other stroke — a raw hex could never bind, which is why the
// contract governs the colour as {color.rouge}.
expect(
  figma.includes('"slotControlStroke": "color/rouge"'),
  "Figma slot spec drops the erreur state control border (expected slotControlStroke color/rouge)",
);
expect(
  figma.includes('"slotControlStroke": "color/bleu-gris"'),
  "Figma slot spec drops the normal state control border (expected slotControlStroke color/bleu-gris)",
);
expect(
  /spec\.slotControlStroke[\s\S]{0,200}inst\.strokes = \[boundPaint\(spec\.slotControlStroke, inst\)\]/.test(
    figma,
  ),
  "Figma runtime never applies slotControlStroke to the default slot instance",
);

if (problems.length > 0) {
  console.error(
    `✘ field-slotted-control-semantics:\n- ${problems.join("\n- ")}`,
  );
  process.exit(1);
}

console.log(
  "field-slotted-control-semantics ok: Field forwards FILL width plus state-derived aria-invalid/aria-describedby to its slotted native control on every applicable surface",
);
