/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/checkbox.contract.json (ds.checkbox v1.0.1)
 * Emitted by core/emit-react-inline.ts — the zero-infrastructure output:
 * every token reference was RESOLVED to its literal value from the design
 * tokens at emit time. Resolution mode: light (brand: default). To retheme,
 * re-emit against different tokens — do not edit literals by hand.
 * Fidelity: :hover/:focus-visible state tokens are not expressible as inline
 * styles and are omitted; ROOT disabled-state tokens apply via the disabled
 * prop; PART-level state overrides (Part.states, v13) are omitted — the same
 * declared limit as the hover states (state-selected descendant styling).
 */
import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';

const ICONS: Record<string, string> = {
  "check": "<svg width=\"13\" height=\"10\" viewBox=\"0 0 13 10\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M1 5.4L4.5 9L11.5 1\" stroke=\"white\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "center",
    "borderStyle": "solid",
    "borderWidth": "2px",
    "fontFamily": "Montserrat, sans-serif",
    "width": "20px",
    "height": "20px",
    "borderRadius": "0px"
  },
  "input": {
    "position": "absolute",
    "inset": 0,
    "width": "100%",
    "height": "100%",
    "margin": 0,
    "padding": 0,
    "opacity": 0,
    "cursor": "pointer"
  },
  "checkGlyph": {
    "display": "inline-flex",
    "flexShrink": 0
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "checked-non:root": {
    "backgroundColor": "#FFFFFF",
    "borderColor": "#9BA4B5"
  },
  "checked-oui:root": {
    "backgroundColor": "#143A84",
    "borderColor": "#143A84"
  }
};

export interface CheckboxProps extends HTMLAttributes<HTMLSpanElement> {
  checked?: 'non' | 'oui';
}

/** Piqueray checkbox. Extracted from the owner-validated Figma COMPONENT_SET « Checkbox » (DS · Atomes, built in spec 003), reviewed and adopted — not authored.

Accessible custom control (the demo-51 pattern, adapted): the visual box is presentational (border/fill follow the « Coche » variant), a REAL native <input type="checkbox"> sits inside for accessibility (« Canvas: not drawn » — semantics don't draw), and the custom check glyph is a sibling shown only when checked. This keeps the exact Piqueray look AND native semantics; the wrapping label is the Field molecule's job.

The check glyph is check.svg, exported from the master's real Vector node (2053:1255) — an internal glyph consumed by this contract, deliberately OUTSIDE the governed icon registry (which stays at its governed count). Modeled ONLY as the master exposes it: a Non/Oui variant, no label, no size axis, no indeterminate state, no declared event — the Field molecule owns those. */
export const Checkbox = forwardRef<HTMLSpanElement, CheckboxProps>(function Checkbox(
  { checked = 'non', style, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} style={{ ...S.root, ...(V[`checked-${checked}:root`] ?? {}), ...style }}  {...rest}>
      <input style={{ ...S.input }} type="checkbox">

</input>
{checked === 'oui' ? (<span style={{ ...S.checkGlyph }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["check"] }} />) : null}
    </span>
  );
});
