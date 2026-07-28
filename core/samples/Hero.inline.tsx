/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/hero.contract.json (ds.hero v1.0.0)
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
import { SectionHeader } from './SectionHeader';
import { Button } from './Button';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-end",
    "justifyContent": "space-between",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif"
  },
  "blocTexte": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "flex": "1 1 auto",
    "minWidth": 0
  },
  "Titres": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch"
  },
  "wrapper": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-end",
    "justifyContent": "center"
  },
  "sousTitre": {
    "color": "#FFFFFF"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface HeroProps extends HTMLAttributes<HTMLDivElement> {

}

/** Piqueray Hero. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Hero = forwardRef<HTMLDivElement, HeroProps>(function Hero(
  { style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} {...rest}>
      <div style={{ ...S.blocTexte }}>
<div style={{ ...S.Titres }}>
<SectionHeader titre="Portes de garage industrielles" accroche="Plus de 50 ans d’expérience" disposition="standard" />
<div style={{ ...S.wrapper }}>
<span style={{ ...S.sousTitre }}>La performance sans compromis, même en usage intensif. Atelier, bâtiment industriel, bâtiment public ou résidence : quelle que soit votre application, nous avons la solution idéale.</span>
<Button>Contactez-nous</Button>
</div>
</div>
</div>
    </div>
  );
});
