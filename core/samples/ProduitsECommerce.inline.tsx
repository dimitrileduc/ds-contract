/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/produits-ecommerce.contract.json (ds.produits-ecommerce v1.0.0)
 * Emitted by core/emit-react-inline.ts — the zero-infrastructure output:
 * every token reference was RESOLVED to its literal value from the design
 * tokens at emit time. Resolution mode: light (brand: default). To retheme,
 * re-emit against different tokens — do not edit literals by hand.
 * Fidelity: :hover/:focus-visible state tokens are not expressible as inline
 * styles and are omitted; ROOT disabled-state tokens apply via the disabled
 * prop; PART-level state overrides (Part.states, v13) are omitted — the same
 * declared limit as the hover states (state-selected descendant styling).
 * Fidelity: repeat collections render the contract's OBSERVED sample as fixed
 * instances (the array prop is declared but not mapped on this surface) — the
 * full React surface maps the live array.
 */
import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import { Button } from './Button';
import { ProductCard } from './ProductCard';
import { CarouselControls } from './CarouselControls';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "32px"
  },
  "Titre": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontSize": "32px",
    "fontWeight": 400,
    "lineHeight": "40px"
  },
  "Produits": {
    "display": "grid",
    "gridTemplateColumns": "repeat(4, minmax(0, 1fr))",
    "width": "100%",
    "minWidth": 0
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface ProduitsECommerceProps extends HTMLAttributes<HTMLElement> {
  titre?: Array<{ text: string; strong?: boolean }>;
  /** Product cards shown by the source carousel. IMAGE overrides remain product-card runtime data; title and price are the bounded textual catalogue carried here. */
  produits?: Array<{ titre: string; prix: string }>;
}

/** Piqueray ProduitsECommerce. Canonical section promoted from the audited source master 2116:4475. It owns its 32/40 title and CTA; it never delegates a specialised hierarchy to SectionHeader. */
export const ProduitsECommerce = forwardRef<HTMLElement, ProduitsECommerceProps>(function ProduitsECommerce(
  { titre = [{"text":"Découvrez nos produits disponibles en ligne"}], produits, style, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <span style={{ ...S.Titre }}>{titre.map(({ text, strong }, index) => strong ? <strong key={index} style={{ fontWeight: 700 }}>{text}</strong> : <span key={index}>{text}</span>)}</span>
<Button variant="outlineNoir" iconLeft={false} iconRight>Voir les produits</Button>
<div style={{ ...S.Produits }}>
<ProductCard titre="Télécommande Hörmann HSE4-868BS" prix="74,99€" />
<ProductCard titre="Clavier à code Hörmann FCT3-1BS" prix="139,99€" />
<ProductCard titre="Bouton poussoir Hörmann FIT2-1-868-BS" prix="89,99€" />
<ProductCard titre="Passerelle BiSecure Hörmann" prix="74,99€" />
</div>
<CarouselControls />
    </section>
  );
});
