/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/hero-video.contract.json (ds.hero-video v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './HeroVideo.module.css';

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
  {
    backgroundUrl = '',
    videoUrl = '',
    backgroundAlt = '',
    accroche = 'Le numéro 1 des portes HÖRMANN en Province de Liège !',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <section ref={ref} className={classes} {...rest}>
      <video
        className={styles.Background}
        src={String(videoUrl)}
        poster={String(backgroundUrl)}
        aria-label={String(backgroundAlt)}
      ></video>
      <div className={styles.VoileBas}></div>
      <div className={styles.VoileNavigation}></div>
      <div className={styles.Text}>
        <span className={styles.Accroche}>{accroche}</span>
      </div>
      <Button
        variant="outlineBlanc"
        iconLeft={false}
        iconRight={false}
        iconRightGlyph="arrow-right"
      >
        Contactez-nous
      </Button>
    </section>
  );
});
