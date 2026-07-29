/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/textarea.contract.json (ds.textarea v1.0.0)
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
import type { CSSProperties, TextareaHTMLAttributes } from 'react';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-start",
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
    "lineHeight": "24px",
    "height": "128px"
  },
  "texteDeSaisie": {}
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
}

/** Piqueray multi-line text input. Extracted from the owner-validated Figma master « Textarea » (DS · Atomes, built in spec 003), reviewed and adopted — not authored.

Same native-control bridge as Input: the « Valeur » TEXT property drives the shown text, drawn on the canvas as a text child and carried in code through defaultValue on the native <textarea>. Differs from Input only in shape: a fixed 128px height and top-aligned text (the canvas frame's counter axis is MIN, not CENTER).

Box styling binds to Piqueray primitives where a token exists; the values the token scale does not carry (12px padding, 1px border, 24px line-height, square 0 radius, 128px height) ride the honest `literals` channel, named. Atom scope only: no label, no state axes — the Field molecule owns them. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { value = 'Texte de saisie', style, children, ...rest },
  ref,
) {
  return (
    <textarea ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <span style={{ ...S.texteDeSaisie }}>{value}</span>
    </textarea>
  );
});
