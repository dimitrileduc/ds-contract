/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/hero-video.contract.json (ds.hero-video v2.0.0)
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
    "justifyContent": "center",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "height": "746px",
    "gap": "32px",
    "paddingBlock": "64px",
    "paddingInline": "24px",
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
    "backgroundImage": "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.03) 8%, rgba(0,0,0,0.09) 15%, rgba(0,0,0,0.2) 23%, rgba(0,0,0,0.36) 31%, rgba(0,0,0,0.52) 39%, rgba(0,0,0,0.6) 48%, rgba(0,0,0,0.65) 61%, rgba(0,0,0,0.68) 70%, rgba(0,0,0,0.72) 78%, rgba(0,0,0,0.78) 90%, rgba(0,0,0,0.8) 100%)",
    "position": "absolute",
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0",
    "zIndex": "1",
    "pointerEvents": "none"
  },
  "VoileNavigation": {
    "backgroundImage": "linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0,0.02) 78%, rgba(0,0,0,0.07) 82%, rgba(0,0,0,0.17) 86%, rgba(0,0,0,0.3) 90%, rgba(0,0,0,0.41) 93%, rgba(0,0,0,0.51) 96%, rgba(0,0,0,0.59) 98%, rgba(0,0,0,0.65) 100%)",
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
    "alignItems": "center",
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
    "fontSize": "32px",
    "fontWeight": 600,
    "lineHeight": "40px",
    "textAlign": "center",
    "whiteSpace": "pre-line"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "presentation-tablette:root": {
    "paddingInline": "48px"
  },
  "presentation-desktop:root": {
    "paddingInline": "56px",
    "paddingBlock": "48px",
    "gap": "10px",
    "height": "720px",
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-end",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-desktop:VoileBas": {
    "backgroundImage": "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.015) 52.8%, rgba(0,0,0,0.057) 55.6%, rgba(0,0,0,0.119) 58.4%, rgba(0,0,0,0.194) 61.2%, rgba(0,0,0,0.275) 64%, rgba(0,0,0,0.356) 66.8%, rgba(0,0,0,0.431) 69.6%, rgba(0,0,0,0.493) 72.4%, rgba(0,0,0,0.535) 75.2%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.575) 90%, rgba(0,0,0,0.6) 100%)"
  },
  "presentation-desktop:VoileNavigation": {
    "backgroundImage": "linear-gradient(to top, rgba(0,0,0,0) 70%, rgba(0,0,0,0.022) 72.3%, rgba(0,0,0,0.078) 74.5%, rgba(0,0,0,0.158) 76.7%, rgba(0,0,0,0.25) 79%, rgba(0,0,0,0.342) 81.3%, rgba(0,0,0,0.422) 83.5%, rgba(0,0,0,0.479) 85.8%, rgba(0,0,0,0.5) 88%, rgba(0,0,0,0.54) 94%, rgba(0,0,0,0.58) 100%)"
  },
  "presentation-desktop:Text": {
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-wide:root": {
    "paddingInline": "89px",
    "paddingBlock": "48px",
    "gap": "10px",
    "height": "720px",
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-end",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-wide:VoileBas": {
    "backgroundImage": "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 44%, rgba(0,0,0,0.011) 46.3%, rgba(0,0,0,0.041) 48.7%, rgba(0,0,0,0.086) 51%, rgba(0,0,0,0.143) 53.3%, rgba(0,0,0,0.207) 55.7%, rgba(0,0,0,0.275) 58%, rgba(0,0,0,0.343) 60.3%, rgba(0,0,0,0.407) 62.7%, rgba(0,0,0,0.464) 65%, rgba(0,0,0,0.509) 67.3%, rgba(0,0,0,0.539) 69.7%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.575) 86%, rgba(0,0,0,0.6) 100%)"
  },
  "presentation-wide:VoileNavigation": {
    "backgroundImage": "linear-gradient(to top, rgba(0,0,0,0) 70%, rgba(0,0,0,0.022) 72.3%, rgba(0,0,0,0.078) 74.5%, rgba(0,0,0,0.158) 76.7%, rgba(0,0,0,0.25) 79%, rgba(0,0,0,0.342) 81.3%, rgba(0,0,0,0.422) 83.5%, rgba(0,0,0,0.479) 85.8%, rgba(0,0,0,0.5) 88%, rgba(0,0,0,0.54) 94%, rgba(0,0,0,0.58) 100%)"
  },
  "presentation-wide:Text": {
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": "0"
  }
};

export interface HeroVideoProps extends HTMLAttributes<HTMLElement> {
  /** Viewport presentation, mirroring the canvas axis Presentation. Default = mobile, the first variant of the 031 set (Figma's default) and the mobile-first base of the delivered CSS; in the delivered CSS the mode is selected by the viewport through the breakpoint tokens, never by a consumer. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Code-side poster source. On canvas, this poster is the deterministic static placeholder for the video. */
  backgroundUrl?: string;
  /** Code-side video source. Figma's native videoHash has no contract-to-code URL transport, so the canvas intentionally uses only the static poster placeholder. */
  videoUrl?: string;
  /** Alternative text for the decorative poster plane. */
  backgroundAlt?: string;
  /** HeroVideo title. RICH text (owner rule 2026-09-02: a text drawn with a line break is rich, whether or not the set exposes a TEXT property — the 031 set draws its title on the node, no property; binding NONE). The 031 set breaks after « HÖRMANN »: explicitly on Desktop/Wide (U+2028), naturally on Mobile/Tablette. The break is a governed segment fact; WHERE the editor breaks stays content. No bold. Includes the non-breaking spaces around HÖRMANN. */
  accroche?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
}

/** Piqueray HeroVideo, responsive. 2.0.0 (2026-09-02, Odoo hero pilot): re-extracted from the spec-031 set 2689:15832 (page « 031 · Planches de validation »), four `presentation` variants Mobile / Tablette / Desktop / Wide validated by the owner. Everything the canvas draws is proposed by `npm run extract:figma` and adopted as-is: layout per mode (column centered on Mobile/Tablette, row bottom-aligned on Desktop/Wide), paddings / gap / height per mode as tokensByProp on the presentation axis, the title riding the responsive text style H1 (typography.h1.* — size and line-height vary by viewport mode through tokens/modes/viewport.*). Added by hand, each named: the host element (section — not drawn), the CTA pinned to the bottom edge on Mobile/Tablette (drawn ABSOLUTE on the canvas; the dump does not carry layoutPositioning), and the CTA's right icon fixed to TRUE (the canvas shows it on Desktop/Wide only; the schema has no per-mode channel for a nested instance's prop — `propsByProp` was abandoned on 2026-08-20 — so the Odoo projection hides the glyph under the desktop breakpoint, an acknowledged deviation). The drawn widths 390/668/1200/1728 are witnesses, not tokens: the root fills its parent. Code supports a video URL and poster; Figma projects the poster as a static IMAGE placeholder. The two governed scrims belong to HeroVideo itself. Breakpoints are not in this contract: they are the token dimension `breakpoint.*` (768 / 992 / 1400), consumed by the CSS build. */
export const HeroVideo = forwardRef<HTMLElement, HeroVideoProps>(function HeroVideo(
  { presentation = 'mobile', backgroundUrl = '', videoUrl = '', backgroundAlt = '', accroche = [{"text":"Le numéro 1 des portes HÖRMANN\nen Province de Liège !"}], style, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }}  {...rest}>
      <video style={{ ...S.Background }} src={String(videoUrl)} poster={String(backgroundUrl)} aria-label={String(backgroundAlt)}>

</video>
<div style={{ ...S.VoileBas, ...(V[`presentation-${presentation}:VoileBas`] ?? {}) }}>

</div>
<div style={{ ...S.VoileNavigation, ...(V[`presentation-${presentation}:VoileNavigation`] ?? {}) }}>

</div>
<div style={{ ...S.Text, ...(V[`presentation-${presentation}:Text`] ?? {}) }}>
<span style={{ ...S.Accroche, ...(presentation === 'desktop' ? {"textAlign":"left"} : {}), ...(presentation === 'wide' ? {"textAlign":"left"} : {}) }}>{accroche.map(({ text, strong, underline }, index) => { const inner = underline ? <u>{text}</u> : text; return strong ? <strong key={index} style={{ fontWeight: 700 }}>{inner}</strong> : <span key={index}>{inner}</span>; })}</span>
</div>
<Button variant="outlineBlanc" iconLeft={false} iconRight iconRightGlyph="arrow-right">En savoir plus</Button>
    </section>
  );
});
