/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/hero.contract.json (ds.hero v1.3.0)
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
    "fontFamily": "Montserrat, sans-serif",
    "height": "640px",
    "gap": "10px",
    "position": "relative"
  },
  "Background": {
    "position": "absolute",
    "objectFit": "cover"
  },
  "blocTexte": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "flex": "1 1 auto",
    "minWidth": 0,
    "gap": "16px",
    "position": "relative"
  },
  "Titres": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "gap": "16px",
    "paddingTop": "96px",
    "paddingRight": "89px",
    "paddingBottom": "48px",
    "paddingLeft": "89px"
  },
  "wrapper": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-end",
    "justifyContent": "center",
    "gap": "32px"
  },
  "sousTitre": {
    "flex": "1 1 auto",
    "minWidth": 0,
    "color": "#FFFFFF",
    "fontSize": "24px",
    "lineHeight": "32px",
    "width": "1164px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface HeroProps extends HTMLAttributes<HTMLDivElement> {
  /** Code-only source of the root's photographic IMAGE fill (fills[0], imageRef b9ae58d2e309c55241eb843c1a36d90d087c1483). The master exposes no component property for it — A5 / §a.7 means the bitmap has no contract→canvas transport, so it rides a code-side scalar and the canvas keeps the engine's placeholder. */
  backgroundUrl?: string;
  /** Alternative text for the background photo plane. Empty by default: the Figma paint is decorative — it carries no information the surrounding copy does not already state. */
  backgroundAlt?: string;
}

/** Piqueray Hero. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.

v1.2.0 carries the root's photographic IMAGE fill (fills[0], imageRef b9ae58d2e309c55241eb843c1a36d90d087c1483, scaleMode FILL) as an absolutely-positioned `img` plane painted UNDER the content block — the same superposed-planes vocabulary ds.member-picture already uses, with DOM order alone deciding the stacking (no z-index channel exists, and none is needed: two positioned siblings paint in tree order). The bitmap reaches the coded surface through code-only `backgroundUrl` / `backgroundAlt` scalars (bindings.figma NONE) because `background-image: url()` is still the OPEN A5 / §a.7 gap of docs/FIGMA-CAPABILITY-MATRIX.md: the canvas side keeps the engine's generic image placeholder while the React surface renders the real pixels — the same split spec 006 documented for ds.review-card's avatarPhoto.

TWO NAMED LIMITS REMAIN, both GRADIENT_LINEAR paints: the root's darkening overlay (fills[2] — `linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5) 100%)`) and the Titres scrim (fills[0] — `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 60%)`). Gradients are expressible in principle (§a.3: `tokens['background-image']` is parsed into a native GRADIENT_LINEAR) but that channel resolves ONLY through a DTCG token reference, and the Piqueray foundation defines no gradient token; `literals` refuses the channel by name (`background-image` is not in LITERAL_CHANNELS) and its value grammar admits no gradient syntax. The weight is measured, not guessed: the two veils darken 452 of the root's 640 px rows and account for 28.07 % of the master's pixels at the comparator's own threshold — on this organism they ARE the residual pixel gap. A single flat rgba() veil substituted over the same two bands was measured too, and bottoms out near 12 % residual, so approximating them would both invent a Figma fact and still fail.

The instance restyle of the SectionHeader child's Titre (blanc / 54 px / 68 px / 700) is no longer a limit here: it is carried by that child contract's own `emphase: "hero"` axis since section-header v1.1.0. */
export const Hero = forwardRef<HTMLDivElement, HeroProps>(function Hero(
  { backgroundUrl = '', backgroundAlt = '', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <img style={{ ...S.Background }} src={String(backgroundUrl)} alt={String(backgroundAlt)}>

</img>
<div style={{ ...S.blocTexte }}>
<div style={{ ...S.Titres }}>
<SectionHeader titre={[{"text":"Portes de garage","strong":true},{"text":" industrielles"}]} accroche="Plus de 50 ans d’expérience" accroche2={false} disposition="standard" emphase="hero" alignement="gauche" />
<div style={{ ...S.wrapper }}>
<span style={{ ...S.sousTitre }}>{"La "}<strong style={{ fontWeight: 700 }}>{"performance"}</strong>{" sans compromis, même en usage intensif. Atelier, bâtiment industriel, bâtiment public ou résidence : quelle que soit votre application, nous avons "}<strong style={{ fontWeight: 700 }}>{"la solution idéale"}</strong>{"."}</span>
<Button variant="outlineBlanc" iconRight>Demander un devis gratuit</Button>
</div>
</div>
</div>
    </div>
  );
});
