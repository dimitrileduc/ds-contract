/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/hero.contract.json (ds.hero v1.5.0)
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
    "width": "100%",
    "minWidth": 0,
    "overflow": "hidden",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "height": "640px",
    "gap": "10px",
    "backgroundColor": "transparent",
    "position": "relative"
  },
  "Background": {
    "position": "absolute",
    "objectFit": "cover",
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0",
    "zIndex": "0"
  },
  "VoileNavigation": {
    "backgroundImage": "linear-gradient(to top, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)",
    "position": "absolute",
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0",
    "zIndex": "1",
    "pointerEvents": "none"
  },
  "blocTexte": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "flex": "1 1 auto",
    "minWidth": 0,
    "width": "100%",
    "gap": "16px",
    "position": "relative",
    "zIndex": "2"
  },
  "Titres": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0,
    "gap": "16px",
    "paddingTop": "96px",
    "paddingRight": "89px",
    "paddingBottom": "48px",
    "paddingLeft": "89px",
    "backgroundImage": "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 60%)"
  },
  "wrapper": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-end",
    "justifyContent": "center",
    "width": "100%",
    "minWidth": 0,
    "gap": "32px"
  },
  "sousTitre": {
    "flex": "1 1 auto",
    "minWidth": 0,
    "width": "100%",
    "color": "#FFFFFF",
    "fontSize": "24px",
    "fontWeight": 500,
    "lineHeight": "32px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface HeroProps extends HTMLAttributes<HTMLDivElement> {
  /** Code-only source of the root's photographic IMAGE fill (fills[0], imageRef b9ae58d2e309c55241eb843c1a36d90d087c1483). The master exposes no component property for it — A5 / §a.7 means the bitmap has no contract→canvas transport, so it rides a code-side scalar and the canvas keeps the engine's placeholder. */
  backgroundUrl?: string;
  /** Alternative text for the background photo plane. Empty by default: the Figma paint is decorative — it carries no information the surrounding copy does not already state. */
  backgroundAlt?: string;
  /** The hero paragraph (layer « Sous-titre », node 2111:3380) as a governed rich-text prop — 016/T042, lot B013-4: the 2026-08-05 live diagnosis showed this was the master's ONE unbound text, and lot L-B013-4 (T041) exposes the native TEXT property « SousTitre » it binds to. The two observed 700 ranges (« performance », « la solution idéale ») travel as segments; the Figma projection keeps one native TEXT value and reapplies the governed marks as native character ranges. */
  sousTitre?: Array<{ text: string; strong?: boolean }>;
}

/** Piqueray Hero. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. The contract owns the complete Hero stack: a photographic Background plane, a mandatory VoileNavigation plane above the photo for header readability, then the content plane. The top veil is intrinsic to every Hero; it is neither a Page override nor a variant. The separate Titres scrim remains attached to the text area. The root is fluid while 1728 px remains its canvas authoring reference. SectionHeader and the rich SousTitre are parent-width Fill; the Button remains Hug. */
export const Hero = forwardRef<HTMLDivElement, HeroProps>(function Hero(
  { backgroundUrl = '', backgroundAlt = '', sousTitre = [{"text":"La "},{"text":"performance","strong":true},{"text":" sans compromis, même en usage intensif. Atelier, bâtiment industriel, bâtiment public ou résidence : quelle que soit votre application, nous avons "},{"text":"la solution idéale","strong":true},{"text":"."}], style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <img style={{ ...S.Background }} src={String(backgroundUrl)} alt={String(backgroundAlt)}>

</img>
<div style={{ ...S.VoileNavigation }}>

</div>
<div style={{ ...S.blocTexte }}>
<div style={{ ...S.Titres }}>
<SectionHeader titre={[{"text":"Portes de garage","strong":true},{"text":" industrielles"}]} accroche="Plus de 50 ans d’expérience" accroche2={false} disposition="standard" emphase="hero" alignement="gauche" />
<div style={{ ...S.wrapper }}>
<span style={{ ...S.sousTitre }}>{sousTitre.map(({ text, strong }, index) => strong ? <strong key={index} style={{ fontWeight: 700 }}>{text}</strong> : <span key={index}>{text}</span>)}</span>
<Button variant="outlineBlanc" iconRight>Demander un devis gratuit</Button>
</div>
</div>
</div>
    </div>
  );
});
