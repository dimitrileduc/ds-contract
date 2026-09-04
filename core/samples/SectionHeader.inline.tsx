/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/section-header.contract.json (ds.section-header v3.0.0)
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

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "8px",
    "alignSelf": "stretch",
    "textAlign": "center"
  },
  "Accroche": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontSize": "20px",
    "fontWeight": 400,
    "letterSpacing": "3px",
    "lineHeight": "25px",
    "textTransform": "uppercase"
  },
  "Titre": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontSize": "40px",
    "fontWeight": 400,
    "lineHeight": "50px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  titre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  accroche?: string;
  /** Explicit eyebrow visibility. False removes its text node from layout rather than leaving an empty line box. */
  afficherAccroche?: boolean;
  alignement?: 'centre' | 'gauche';
}

/** Piqueray SectionHeader v3. Generic section title only: a rich title, optional eyebrow and explicit alignment. CTA and specialised hierarchy belong to their owning sections: ds.hero@2.0.0, ds.presentation@3.0.0, ds.texte-seo@3.0.0 and ds.produits-ecommerce@1.0.0. */
export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  { alignement = 'centre', afficherAccroche = true, accroche = 'Plus de 50 ans d’expérience', titre = [{"text":"Pourquoi choisir Piqueray ?"}], style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(alignement === 'gauche' ? {"alignItems":"start","textAlign":"left"} : {}), ...style }} data-afficher-accroche={afficherAccroche || undefined}  {...rest}>
      {afficherAccroche ? (<span style={{ ...S.Accroche }}>{accroche}</span>) : null}
<span style={{ ...S.Titre }}>{titre.map(({ text, strong, underline }, index) => { const inner = underline ? <u>{text}</u> : text; return strong ? <strong key={index} style={{ fontWeight: 700 }}>{inner}</strong> : <span key={index}>{inner}</span>; })}</span>
    </div>
  );
});
