/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/google-reviews-section.contract.json (ds.google-reviews-section v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { SectionHeader } from '../SectionHeader';
import { GoogleReviews } from '../GoogleReviews';
import styles from './GoogleReviewsSection.module.css';

export interface GoogleReviewsSectionProps extends HTMLAttributes<HTMLElement> {
  titre?: Array<{ text: string; strong?: boolean }>;
  accroche?: string;
  qualificatif?: string;
  noteGlobale?: string;
  volume?: string;
  montrerControles?: boolean;
}

/** Composition publique Avis Google. Elle réunit le titre de section et le widget ds.google-reviews, auparavant deux frères ad hoc dans les Pages Figma et dans le seed Odoo. Le root est Fill/Hug, sans largeur fixe ni padding local : le Container consommateur possède l'espacement externe. */
export const GoogleReviewsSection = forwardRef<HTMLElement, GoogleReviewsSectionProps>(
  function GoogleReviewsSection(
    {
      montrerControles = true,
      accroche = 'Nos avis Google vérifiés',
      qualificatif = 'Excellent',
      noteGlobale = '4.8',
      volume = '93 avis',
      titre = [
        { text: 'Plus de 1500 portes installées par année et autant de clients satisfaits' },
      ],
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const classes = [styles.root, className].filter(Boolean).join(' ');
    return (
      <section
        ref={ref}
        className={classes}
        data-montrer-controles={montrerControles || undefined}
        {...rest}
      >
        <SectionHeader titre={titre} accroche={accroche} afficherAccroche alignement="centre" />
        <GoogleReviews
          qualificatif={qualificatif}
          noteGlobale={noteGlobale}
          volume={volume}
          montrerControles={montrerControles}
        />
      </section>
    );
  },
);
