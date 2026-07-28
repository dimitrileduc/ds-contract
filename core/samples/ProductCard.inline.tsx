/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/product-card.contract.json (ds.product-card v1.0.0)
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
import { Button } from './Button';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "16px"
  },
  "Image": {
    "width": "240px",
    "height": "240px"
  },
  "Titre": {
    "color": "#26282C",
    "fontSize": "16px",
    "fontWeight": 600,
    "lineHeight": "20px",
    "textAlign": "center"
  },
  "Prix": {
    "color": "#143A84",
    "fontSize": "16px",
    "fontWeight": 600,
    "lineHeight": "20px",
    "textAlign": "center"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface ProductCardProps extends HTMLAttributes<HTMLDivElement> {
  titre?: string;
  prix?: string;
  imageUrl?: string;
  imageAlt?: string;
  bouton?: boolean;
}

/** Piqueray ProductCard. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Product image URL/alt are code semantics because Figma supplies IMAGE fills through instance overrides. */
export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(function ProductCard(
  { bouton = false, titre = 'Télécommande Hörmann HSE4-868BS', prix = '74,99€', imageUrl = '', imageAlt = '', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} data-bouton={bouton || undefined} {...rest}>
      <img style={{ ...S.Image }} src={String(imageUrl)} alt={String(imageAlt)}>

</img>
<span style={{ ...S.Titre }}>{titre}</span>
<span style={{ ...S.Prix }}>{prix}</span>
{bouton ? (<Button variant="default" iconLeft iconLeftGlyph="cart">Ajouter au panier</Button>) : null}
    </div>
  );
});
