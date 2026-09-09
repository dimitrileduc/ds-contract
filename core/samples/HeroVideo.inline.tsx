/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/hero-video.contract.json (ds.hero-video v2.3.0)
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
    "backgroundColor": "#00000040",
    "backgroundImage": "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.033) 8%, rgba(0,0,0,0.099) 15%, rgba(0,0,0,0.22) 23%, rgba(0,0,0,0.396) 31%, rgba(0,0,0,0.572) 39%, rgba(0,0,0,0.66) 48%, rgba(0,0,0,0.715) 61%, rgba(0,0,0,0.748) 70%, rgba(0,0,0,0.792) 78%, rgba(0,0,0,0.858) 90%, rgba(0,0,0,0.88) 100%)",
    "position": "absolute",
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0",
    "zIndex": "1",
    "pointerEvents": "none"
  },
  "VoileNavigation": {
    "backgroundImage": "linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0,0.0222) 78%, rgba(0,0,0,0.0777) 82%, rgba(0,0,0,0.1887) 86%, rgba(0,0,0,0.333) 90%, rgba(0,0,0,0.4551) 93%, rgba(0,0,0,0.5661) 96%, rgba(0,0,0,0.6549) 98%, rgba(0,0,0,0.7215) 100%)",
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
    "backgroundImage": "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.0206) 43.8%, rgba(0,0,0,0.0762) 47.6%, rgba(0,0,0,0.1584) 51.4%, rgba(0,0,0,0.2581) 55.2%, rgba(0,0,0,0.3667) 59%, rgba(0,0,0,0.4752) 62.8%, rgba(0,0,0,0.5749) 66.6%, rgba(0,0,0,0.6571) 70.4%, rgba(0,0,0,0.7128) 74.2%, rgba(0,0,0,0.7333) 78%, rgba(0,0,0,0.7667) 90%, rgba(0,0,0,0.8) 100%)"
  },
  "presentation-desktop:VoileNavigation": {
    "backgroundImage": "linear-gradient(to top, rgba(0,0,0,0) 70%, rgba(0,0,0,0.0252) 72.25%, rgba(0,0,0,0.0914) 74.5%, rgba(0,0,0,0.1851) 76.75%, rgba(0,0,0,0.2925) 79%, rgba(0,0,0,0.3999) 81.25%, rgba(0,0,0,0.4936) 83.5%, rgba(0,0,0,0.5598) 85.75%, rgba(0,0,0,0.585) 88%, rgba(0,0,0,0.6318) 94%, rgba(0,0,0,0.6786) 100%)"
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
    "backgroundImage": "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,0.0144) 37.16%, rgba(0,0,0,0.0542) 40.34%, rgba(0,0,0,0.1146) 43.5%, rgba(0,0,0,0.1901) 46.66%, rgba(0,0,0,0.2759) 49.84%, rgba(0,0,0,0.3667) 53%, rgba(0,0,0,0.4574) 56.16%, rgba(0,0,0,0.5432) 59.34%, rgba(0,0,0,0.6188) 62.5%, rgba(0,0,0,0.6791) 65.66%, rgba(0,0,0,0.7189) 68.84%, rgba(0,0,0,0.7333) 72%, rgba(0,0,0,0.7667) 86%, rgba(0,0,0,0.8) 100%)"
  },
  "presentation-wide:VoileNavigation": {
    "backgroundImage": "linear-gradient(to top, rgba(0,0,0,0) 70%, rgba(0,0,0,0.0252) 72.25%, rgba(0,0,0,0.0914) 74.5%, rgba(0,0,0,0.1851) 76.75%, rgba(0,0,0,0.2925) 79%, rgba(0,0,0,0.3999) 81.25%, rgba(0,0,0,0.4936) 83.5%, rgba(0,0,0,0.5598) 85.75%, rgba(0,0,0,0.585) 88%, rgba(0,0,0,0.6318) 94%, rgba(0,0,0,0.6786) 100%)"
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

/** Piqueray HeroVideo, responsive. 2.3.0 (2026-09-08, MINOR: the two veils re-read on the canvas — a never-promoted drift carried, plus the owner's « plus foncé » decision on the Desktop and Wide bottom scrims; no anchor change, no prop touched). 2.2.0 (2026-09-08, MINOR additif) : le plan Background porte enfin ses attributs de lecture (autoplay, muted, loop, playsinline, preload=metadata) — la surface livree rendait jusqu'ici une video qui ne demarrait nulle part. Le fichier video reste un asset gouverne de l'addon (jamais du contenu de page) ; seule l'affiche est du contenu, choisie par le redacteur comme une image. 2.0.0 (2026-09-02, Odoo hero pilot): re-extracted from the spec-031 set 2689:15832 (page « 031 · Planches de validation »), four `presentation` variants Mobile / Tablette / Desktop / Wide validated by the owner. Everything the canvas draws is proposed by `npm run extract:figma` and adopted as-is: layout per mode (column centered on Mobile/Tablette, row bottom-aligned on Desktop/Wide), paddings / gap / height per mode as tokensByProp on the presentation axis, the title riding the responsive text style H1 (typography.h1.* — size and line-height vary by viewport mode through tokens/modes/viewport.*). Added by hand, each named: the host element (section — not drawn), the CTA pinned to the bottom edge on Mobile/Tablette (drawn ABSOLUTE on the canvas; the dump does not carry layoutPositioning), and the CTA's right icon fixed to TRUE (the canvas shows it on Desktop/Wide only; the schema has no per-mode channel for a nested instance's prop — `propsByProp` was abandoned on 2026-08-20 — so the Odoo projection hides the glyph under the desktop breakpoint, an acknowledged deviation). The drawn widths 390/668/1200/1728 are witnesses, not tokens: the root fills its parent. Code supports a video URL and poster; Figma projects the poster as a static IMAGE placeholder. The two governed scrims belong to HeroVideo itself. Breakpoints are not in this contract: they are the token dimension `breakpoint.*` (768 / 992 / 1600), consumed by the CSS build. Plan de document : la partie titre porte la balise h1 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau. */
export const HeroVideo = forwardRef<HTMLElement, HeroVideoProps>(function HeroVideo(
  { presentation = 'mobile', backgroundUrl = '', videoUrl = '', backgroundAlt = '', accroche = [{"text":"Le numéro 1 des portes HÖRMANN\nen Province de Liège !"}], style, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }}  {...rest}>
      <video style={{ ...S.Background }} src={String(videoUrl)} poster={String(backgroundUrl)} aria-label={String(backgroundAlt)} autoPlay={true} muted={true} loop={true} playsInline={true} preload="metadata">

</video>
<div style={{ ...S.VoileBas, ...(V[`presentation-${presentation}:VoileBas`] ?? {}) }}>

</div>
<div style={{ ...S.VoileNavigation, ...(V[`presentation-${presentation}:VoileNavigation`] ?? {}) }}>

</div>
<div style={{ ...S.Text, ...(V[`presentation-${presentation}:Text`] ?? {}) }}>
<h1 style={{ ...S.Accroche, ...(presentation === 'desktop' ? {"textAlign":"left"} : {}), ...(presentation === 'wide' ? {"textAlign":"left"} : {}) }}>{accroche.map(({ text, strong, underline }, index) => { const inner = underline ? <u>{text}</u> : text; return strong ? <strong key={index} style={{ fontWeight: 700 }}>{inner}</strong> : <span key={index}>{inner}</span>; })}</h1>
</div>
<Button variant="outlineBlanc" iconLeft={false} iconRight iconRightGlyph="arrow-right">En savoir plus</Button>
    </section>
  );
});
