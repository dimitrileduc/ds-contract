/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/input.contract.json (ds.input v1.0.0)
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
import type { CSSProperties, InputHTMLAttributes } from 'react';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "borderStyle": "solid",
    "backgroundColor": "#FFFFFF",
    "borderColor": "#9BA4B5",
    "color": "#37373B",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": 400,
    "paddingBlock": "12px",
    "paddingInline": "12px",
    "borderWidth": "1px",
    "borderRadius": "0px",
    "lineHeight": "24px"
  },
  "texteDeSaisie": {}
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  value?: string;
}

/** Piqueray single-line text input. Extracted from the owner-validated Figma master « Input » (DS · Atomes, built in spec 003), reviewed and adopted — not authored.

The shown text binds to the « Valeur » TEXT property EXACTLY as the Button's label binds to « Libellé » — one bound text prop, drawn on the canvas, carried in code. Because the code element is a native <input> (a void element), that same value renders through defaultValue on a self-closing tag rather than as a child.

Box styling (white fill, blue-grey 1px border, square corners, 12px padding, 14px Regular Montserrat, text color noir) binds to Piqueray primitives where a token exists; the values the token scale does not carry (12px padding, 1px border, 24px line-height, square 0 radius) ride the honest `literals` channel, named rather than force-fit.

Atom scope only: no label, no help text, no required/disabled/state axes — the master exposes none (the Field molecule owns them). */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { value = 'Texte de saisie', style, children, ...rest },
  ref,
) {
  return (
    <input ref={ref} style={{ ...S.root, ...style }}  type="text" {...rest}>
      <span style={{ ...S.texteDeSaisie }}>{value}</span>
    </input>
  );
});
