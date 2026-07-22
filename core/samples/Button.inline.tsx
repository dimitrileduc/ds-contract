/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/button.contract.json (ds.button v1.0.0)
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
import type { CSSProperties, ButtonHTMLAttributes } from 'react';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "borderStyle": "solid",
    "cursor": "pointer",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "16px",
    "fontWeight": 500,
    "lineHeight": "22px",
    "color": "#FFFFFF",
    "gap": "10px",
    "paddingBlock": "16px",
    "paddingInline": "32px",
    "borderWidth": "0px"
  },
  "label": {}
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "variant-default:root": {
    "backgroundColor": "#26282C"
  },
  "variant-orange:root": {
    "backgroundColor": "#F98A0B"
  },
  "variant-blanc:root": {
    "backgroundColor": "#FFFFFF",
    "color": "#26282C"
  },
  "variant-outlineBlanc:root": {
    "borderWidth": "2px",
    "borderColor": "#FFFFFF"
  },
  "variant-link:root": {
    "color": "#26282C",
    "borderRadius": "32px",
    "paddingBlock": "4px",
    "paddingInline": "0px"
  },
  "variant-outilneNoir:root": {
    "borderWidth": "2px",
    "borderColor": "#26282C",
    "color": "#26282C"
  }
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. */
  variant?: 'default' | 'orange' | 'blanc' | 'outlineBlanc' | 'link' | 'outilneNoir';
}

/** Piqueray button. Six variants extracted from the Figma « Bouton » set (Default, Orange, Blanc, Outline blanc, Link, Outilne noir), bound to Piqueray primitives. The label is a reusable prop. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'default', style, children, ...rest },
  ref,
) {
  return (
    <button ref={ref} style={{ ...S.root, ...(V[`variant-${variant}:root`] ?? {}), ...style }} {...rest}>
      <span style={{ ...S.label }}>{children}</span>
    </button>
  );
});
