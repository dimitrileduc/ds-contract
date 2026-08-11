/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/hero-video.contract.json (ds.hero-video v1.0.0)
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
    "flexDirection": "row",
    "alignItems": "flex-end",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "height": "720px",
    "gap": "10px",
    "paddingTop": "48px",
    "paddingRight": "89px",
    "paddingBottom": "48px",
    "paddingLeft": "89px",
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
  "VoileBas": {
    "backgroundImage": "linear-gradient(to bottom, rgba(0,0,0,0) 80%, rgba(0,0,0,0.5) 100%)",
    "position": "absolute",
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0",
    "zIndex": "1",
    "pointerEvents": "none"
  },
  "VoileNavigation": {
    "backgroundImage": "linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5) 100%)",
    "position": "absolute",
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0",
    "zIndex": "1",
    "pointerEvents": "none"
  },
  "Text": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "flex": "1 1 auto",
    "minWidth": 0,
    "width": "100%",
    "position": "relative",
    "zIndex": "2"
  },
  "Accroche": {
    "width": "100%",
    "minWidth": 0,
    "color": "#FFFFFF",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "44px",
    "fontWeight": 400,
    "lineHeight": "48px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface HeroVideoProps extends HTMLAttributes<HTMLElement> {
  /** Code-side poster source. On canvas, this poster is the deterministic static placeholder for the video. */
  backgroundUrl?: string;
  /** Code-side video source. Figma's native videoHash has no contract-to-code URL transport, so the canvas intentionally uses only the static poster placeholder. */
  videoUrl?: string;
  /** Alternative text for the decorative poster plane. */
  backgroundAlt?: string;
  /** Historical HeroVideo title, including the non-breaking spaces around HÖRMANN. Bound as one native Figma TEXT property so future instance copy remains governed. */
  accroche?: string;
}

/** Piqueray HeroVideo. Extracted from the historical in-place component 2151:5552 on Accueil, reviewed and adopted — not authored. The root is fluid at a 1728 px canvas reference and keeps the historical 720 px height. Code supports a video URL and poster; Figma deliberately projects the poster as a static IMAGE placeholder because native VideoPaint cannot be reconstructed deterministically. The two governed scrims belong to HeroVideo itself. The single 44/48 title remains direct because no existing SectionHeader emphasis is pixel-equivalent. */
export const HeroVideo = forwardRef<HTMLElement, HeroVideoProps>(function HeroVideo(
  { backgroundUrl = '', videoUrl = '', backgroundAlt = '', accroche = 'Le numéro 1 des portes HÖRMANN en Province de Liège !', style, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <video style={{ ...S.Background }} src={String(videoUrl)} poster={String(backgroundUrl)} aria-label={String(backgroundAlt)}>

</video>
<div style={{ ...S.VoileBas }}>

</div>
<div style={{ ...S.VoileNavigation }}>

</div>
<div style={{ ...S.Text }}>
<span style={{ ...S.Accroche }}>{accroche}</span>
</div>
<Button variant="outlineBlanc" iconLeft={false} iconRight={false} iconRightGlyph="arrow-right">Contactez-nous</Button>
    </section>
  );
});
