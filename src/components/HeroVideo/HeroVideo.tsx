/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/hero-video.contract.json (ds.hero-video v2.2.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './HeroVideo.module.css';

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

/** Piqueray HeroVideo, responsive. 2.2.0 (2026-09-08, MINOR additif) : le plan Background porte enfin ses attributs de lecture (autoplay, muted, loop, playsinline, preload=metadata) — la surface livree rendait jusqu'ici une video qui ne demarrait nulle part. Le fichier video reste un asset gouverne de l'addon (jamais du contenu de page) ; seule l'affiche est du contenu, choisie par le redacteur comme une image. 2.0.0 (2026-09-02, Odoo hero pilot): re-extracted from the spec-031 set 2689:15832 (page « 031 · Planches de validation »), four `presentation` variants Mobile / Tablette / Desktop / Wide validated by the owner. Everything the canvas draws is proposed by `npm run extract:figma` and adopted as-is: layout per mode (column centered on Mobile/Tablette, row bottom-aligned on Desktop/Wide), paddings / gap / height per mode as tokensByProp on the presentation axis, the title riding the responsive text style H1 (typography.h1.* — size and line-height vary by viewport mode through tokens/modes/viewport.*). Added by hand, each named: the host element (section — not drawn), the CTA pinned to the bottom edge on Mobile/Tablette (drawn ABSOLUTE on the canvas; the dump does not carry layoutPositioning), and the CTA's right icon fixed to TRUE (the canvas shows it on Desktop/Wide only; the schema has no per-mode channel for a nested instance's prop — `propsByProp` was abandoned on 2026-08-20 — so the Odoo projection hides the glyph under the desktop breakpoint, an acknowledged deviation). The drawn widths 390/668/1200/1728 are witnesses, not tokens: the root fills its parent. Code supports a video URL and poster; Figma projects the poster as a static IMAGE placeholder. The two governed scrims belong to HeroVideo itself. Breakpoints are not in this contract: they are the token dimension `breakpoint.*` (768 / 992 / 1400), consumed by the CSS build. Plan de document : la partie titre porte la balise h1 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau. */
export const HeroVideo = forwardRef<HTMLElement, HeroVideoProps>(function HeroVideo(
  {
    presentation = 'mobile',
    backgroundUrl = '',
    videoUrl = '',
    backgroundAlt = '',
    accroche = [{ text: 'Le numéro 1 des portes HÖRMANN\nen Province de Liège !' }],
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, styles[`presentation-${presentation}`], className]
    .filter(Boolean)
    .join(' ');
  return (
    <section ref={ref} className={classes} {...rest}>
      <video
        className={styles.Background}
        src={String(videoUrl)}
        poster={String(backgroundUrl)}
        aria-label={String(backgroundAlt)}
        autoPlay={true}
        muted={true}
        loop={true}
        playsInline={true}
        preload="metadata"
      ></video>
      <div className={styles.VoileBas}></div>
      <div className={styles.VoileNavigation}></div>
      <div className={styles.Text}>
        <h1 className={styles.Accroche}>
          {accroche.map((segment, index) => {
            const inner = segment.underline ? <u>{segment.text}</u> : segment.text;
            return segment.strong ? (
              <strong key={index}>{inner}</strong>
            ) : (
              <span key={index}>{inner}</span>
            );
          })}
        </h1>
      </div>
      <Button variant="outlineBlanc" iconLeft={false} iconRight iconRightGlyph="arrow-right">
        En savoir plus
      </Button>
    </section>
  );
});
