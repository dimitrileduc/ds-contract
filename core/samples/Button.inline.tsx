/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/button.contract.json (ds.button v1.2.0)
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

const ICONS: Record<string, string> = {
  "arrow-left": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 20\" width=\"20\" height=\"20\" fill=\"none\"><path d=\"M19.4271 9.375H3.12861L6.87842 5.6252L5.99455 4.74133L0.73584 10L5.99455 15.2588L6.87842 14.3749L3.12854 10.625H19.4271V9.375Z\" fill=\"currentColor\"/></svg>",
  "arrow-right": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 20\" width=\"20\" height=\"20\" fill=\"none\"><path d=\"M13.4325 0L12.5487 0.883867L16.2986 4.63375H0V5.88379H16.2984L12.5487 9.63355L13.4325 10.5174L18.6913 5.25871L13.4325 0Z\" transform=\"translate(0.626 4.742)\" fill=\"currentColor\"/></svg>",
};

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
    "borderWidth": "0px",
    "textTransform": "uppercase"
  },
  "iconLeft": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "label": {},
  "iconRight": {
    "display": "inline-flex",
    "flexShrink": 0
  }
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
  /** Shows the leading icon slot (default glyph: the file's cil:arrow-left). Extracted from the BOOLEAN property « Icône gauche » added to the Figma masters on 2026-07-23; on pages the glyph is often instance-swapped (pdf, cart, phone, …) — swaps stay designer-side overrides. */
  iconLeft?: boolean;
  /** Shows the trailing icon slot (default glyph: the file's cil:arrow-right — the « → » of Link buttons). Extracted from the BOOLEAN property « Icône droite » added to the Figma masters on 2026-07-23; on pages the glyph is sometimes instance-swapped (download, chevron, …). */
  iconRight?: boolean;
}

/** Piqueray button. Six variants extracted from the Figma « Bouton » set (Default, Orange, Blanc, Outline blanc, Link, Outilne noir), bound to Piqueray primitives. The label is a reusable prop. The two nested icons are leading/trailing SLOTS: since 2026-07-23 the Figma masters bind their visibility to the BOOLEAN properties « Icône gauche »/« Icône droite » (promotion from observed usage — 21/79 page instances show a left icon, 59/79 a right one), modeled here as the iconLeft/iconRight boolean props with the file's own cil:arrow-* glyphs as default content. Page-level INSTANCE SWAPS of those glyphs (pdf, download, cart, …) stay designer-side instance overrides — an INSTANCE_SWAP slot model is deliberately deferred until the icon masters get contracts. Known extraction gap, named: propose-figma does not yet lower the dump's boolDefaults/propRefs into props, so this promotion is authored and reviewed against the 2026-07-23 dump. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'default', iconLeft = false, iconRight = false, style, children, ...rest },
  ref,
) {
  return (
    <button ref={ref} style={{ ...S.root, ...(V[`variant-${variant}:root`] ?? {}), ...style }} data-icon-left={iconLeft || undefined} data-icon-right={iconRight || undefined} {...rest}>
      {iconLeft ? (<span style={{ ...S.iconLeft }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["arrow-left"] }} />) : null}
<span style={{ ...S.label }}>{children}</span>
{iconRight ? (<span style={{ ...S.iconRight }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["arrow-right"] }} />) : null}
    </button>
  );
});
