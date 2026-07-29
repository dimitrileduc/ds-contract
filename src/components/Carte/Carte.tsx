/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carte.contract.json (ds.carte v2.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './Carte.module.css';

export interface CarteProps extends HTMLAttributes<HTMLDivElement> {
  disposition?: 'reassurance' | 'categorie';
  titre?: string;
  imageUrl?: string;
  imageAlt?: string;
  /** The first sentence is the strong range observed in both immutable master variants (Figma Bold/700); concatenate segments for the native Figma TEXT value. The inventory has no 700-weight token, so this bounded mark carries the observed 700 literal rather than inventing a token. */
  texte?: Array<{ text: string; strong?: boolean }>;
  /** Nested Categorie Link Button label. The source Carte component does not expose it as a top-level Figma property, so immutable occurrence values come from the nested Button TEXT property retained by the campaign census. */
  ctaLabel?: string;
  /** Nested Categorie Link Button leading glyph retained from the concrete nested Figma instance. */
  ctaIconLeftGlyph?: 'pdf';
  /** Nested Categorie Link Button trailing glyph retained from the concrete nested Figma instance. */
  ctaIconRightGlyph?: 'arrow-right' | 'download';
}

/** Piqueray Carte. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. It is one context-width card with two Figma dispositions: Reassurance (fixed-height image, centred content) and Categorie (remaining-space image and a Link Button CTA). Image URLs remain consumer/campaign inputs, never capture defaults.

Version 2.0.0 is a breaking change: `texte` is now typed rich text so the source's leading strong range is preserved without raw HTML. */
export const Carte = forwardRef<HTMLDivElement, CarteProps>(function Carte(
  {
    disposition = 'reassurance',
    ctaIconLeftGlyph = 'pdf',
    ctaIconRightGlyph = 'download',
    titre = 'Pour portes de garage',
    imageUrl = '',
    imageAlt = '',
    ctaLabel = 'Contactez-nous',
    texte = [
      { text: 'SupraMatic & ProMatic.', strong: true },
      { text: ' Ouverture ultra-rapide et verrouillage mécanique anti-intrusion breveté.' },
    ],
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [
    styles.root,
    styles[`disposition-${disposition}`],
    styles[`ctaIconLeftGlyph-${ctaIconLeftGlyph}`],
    styles[`ctaIconRightGlyph-${ctaIconRightGlyph}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      {disposition === 'reassurance' ? (
        <img
          className={styles.reassuranceImage}
          src={String(imageUrl)}
          alt={String(imageAlt)}
        ></img>
      ) : null}
      {disposition === 'categorie' ? (
        <img className={styles.categorieImage} src={String(imageUrl)} alt={String(imageAlt)}></img>
      ) : null}
      <div className={styles.text}>
        {disposition === 'reassurance' ? (
          <span className={styles.TitreReassurance}>{titre}</span>
        ) : null}
        {disposition === 'categorie' ? (
          <span className={styles.TitreCategorie}>{titre}</span>
        ) : null}
        {disposition === 'reassurance' ? (
          <span className={styles.TexteReassurance}>
            {texte.map((segment, index) =>
              segment.strong ? (
                <strong key={index}>{segment.text}</strong>
              ) : (
                <span key={index}>{segment.text}</span>
              ),
            )}
          </span>
        ) : null}
        {disposition === 'categorie' ? (
          <span className={styles.TexteCategorie}>
            {texte.map((segment, index) =>
              segment.strong ? (
                <strong key={index}>{segment.text}</strong>
              ) : (
                <span key={index}>{segment.text}</span>
              ),
            )}
          </span>
        ) : null}
      </div>
      {disposition === 'categorie' ? (
        <div className={styles.Bouton}>
          <Button
            variant="link"
            iconLeft
            iconRight
            iconLeftGlyph={ctaIconLeftGlyph}
            iconRightGlyph={ctaIconRightGlyph}
          >
            {ctaLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
});
