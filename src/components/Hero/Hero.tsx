/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/hero.contract.json (ds.hero v3.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './Hero.module.css';

export interface HeroProps extends HTMLAttributes<HTMLElement> {
  /** Viewport presentation, mirroring the canvas axis Presentation of the 031 candidate set. Default = mobile, the first variant of the set (Figma's default) and the mobile-first base of the delivered CSS; in the delivered CSS the mode is selected by the viewport through the breakpoint tokens, never by a consumer. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Code-only source of the Background plane's photographic IMAGE fill. The set exposes no component property for it — A5 / §a.7 means the bitmap has no contract→canvas transport, so it rides a code-side scalar and the canvas keeps the engine's placeholder. Every page instance overrides the photo on the canvas (10 usages, each with its own image). */
  backgroundUrl?: string;
  /** Alternative text for the background photo plane. Empty by default: the Figma paint is decorative — it carries no information the surrounding copy does not already state. */
  backgroundAlt?: string;
  /** Hero title, bound to the native TEXT property « Titre ». Stays rich-text (marks.strong governed) so the editor keeps bold available; the DEFAULT carries no bold segment — the 031 candidate draws the whole title uniform SemiBold (fontStyle SemiBold on the node, style H1). The 2.0.0 default (« Portes de garage » in bold) came from the old master and is dropped. */
  titre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** The hero paragraph as a governed rich-text prop bound to the native TEXT property « SousTitre » (016/T042). The two 700 ranges drawn on the candidate (« performance », « la solution idéale ») travel as segments; the Figma projection keeps one native TEXT value and reapplies the governed marks as native character ranges. */
  sousTitre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** Figma « SousTitre2 » BOOLEAN property (visibility of the sousTitre node, carried by the 031 set as on the 2026-08-22 master). Affichage du sous-titre. Masquer le retire du flux : la colonne gauche se réduit au titre. Vider le texte ne suffit pas — un TEXT vide garde sa boîte de ligne dans Figma comme dans l'éditeur Odoo (mesuré 2026-08-22). */
  sousTitre2?: boolean;
}

/** Piqueray Hero (image), responsive. 3.0.0 (2026-09-07, vague 031 suite, page « Portes de garage »): re-extracted from the candidate set 2770:20976 (page 031, section « 031 · HERO IMAGE — 4 variantes (candidat v2) »), four `presentation` variants Mobile / Tablette / Desktop / Wide validated by the owner on 2026-09-07 — the anchors move from the single COMPONENT 2111:3382 to the set, hence MAJOR. Everything the canvas draws is proposed by `npm run extract:figma` on the dump v1.8 and adopted: layout per mode (Titres column centered on Mobile/Tablette, row bottom-aligned on Desktop/Wide), paddings and gap per mode as tokensByProp on the presentation axis (64/24 · 64/48 · 96-48/56 · 96-48/89, gap 24 · 24 · 32 · 32), the title riding the responsive text style H1 (typography.h1.* — SemiBold; the 2.0.0 master drew it Bold: weight change decided by the owner), the paragraph riding typography.body.* (Regular under 992, Medium above — typography.body.weight varies by viewport mode). Veils: the 2.0.0 Titres scrim (2 stops) is REMOVED (owner decision « B »); a new full-inset `Voile` plane carries the DS token color.noir-voile-55 (55 % black) PLUS a bottom gradient (0 → 30 % transparent, 0.8 at 100 %), and `VoileNavigation` reuses the HeroVideo top veil per mode. Added by hand, each named: the host element (section — not drawn), the text alignment per mode (center / left), the CTA pinned to the bottom edge on Mobile/Tablette (drawn ABSOLUTE on the canvas; the schema has no channel on a nested instance — Odoo projection, code-only), the flattening of the `Titre direct` wrapper frame. The drawn widths 390/834/1200/1728 are witnesses, not tokens: the root fills its parent. The photo keeps the 2.0.0 model (code-side `backgroundUrl`, `Background` plane, object-fit cover). Breakpoints are the token dimension `breakpoint.*` (768 / 992 / 1400), consumed by the CSS build, never by this contract. */
export const Hero = forwardRef<HTMLElement, HeroProps>(function Hero(
  {
    presentation = 'mobile',
    sousTitre2 = true,
    backgroundUrl = '',
    backgroundAlt = '',
    titre = [{ text: 'Portes de garage industrielles' }],
    sousTitre = [
      { text: 'La ' },
      { text: 'performance', strong: true },
      {
        text: ' sans compromis, même en usage intensif. Atelier, bâtiment industriel, bâtiment public ou résidence : quelle que soit votre application, nous avons ',
      },
      { text: 'la solution idéale', strong: true },
      { text: '.' },
    ],
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
    <section ref={ref} className={classes} data-sous-titre2={sousTitre2 || undefined} {...rest}>
      <img
        className={styles.Background}
        src={String(backgroundUrl)}
        alt={String(backgroundAlt)}
      ></img>
      <div className={styles.Voile}></div>
      <div className={styles.VoileNavigation}></div>
      <div className={styles.blocTexte}>
        <div className={styles.Titres}>
          <div className={styles.colGauche}>
            <h1 className={styles.Titre}>
              {titre.map((segment, index) => {
                const inner = segment.underline ? <u>{segment.text}</u> : segment.text;
                return segment.strong ? (
                  <strong key={index}>{inner}</strong>
                ) : (
                  <span key={index}>{inner}</span>
                );
              })}
            </h1>
            {sousTitre2 ? (
              <span className={styles.sousTitre}>
                {sousTitre.map((segment, index) => {
                  const inner = segment.underline ? <u>{segment.text}</u> : segment.text;
                  return segment.strong ? (
                    <strong key={index}>{inner}</strong>
                  ) : (
                    <span key={index}>{inner}</span>
                  );
                })}
              </span>
            ) : null}
          </div>
          <Button variant="outlineBlanc" iconLeft={false} iconRight iconRightGlyph="arrow-right">
            Demander un devis gratuit
          </Button>
        </div>
      </div>
    </section>
  );
});
