/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/google-reviews.contract.json (ds.google-reviews v2.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { ReviewCard } from '../ReviewCard';
import styles from './GoogleReviews.module.css';

const ICONS: Record<string, string> = {
  'google-wordmark':
    '<svg width="74" height="24" viewBox="0 0 74 24" overflow="visible" fill="none" xmlns="http://www.w3.org/2000/svg">\n<text x="0" y="18" font-family="Montserrat, sans-serif" font-size="22" font-weight="500" fill="#4285F4">G</text>\n<text x="18" y="18" font-family="Montserrat, sans-serif" font-size="22" font-weight="500" fill="#EA4335">o</text>\n<text x="32" y="18" font-family="Montserrat, sans-serif" font-size="22" font-weight="500" fill="#FBBC05">o</text>\n<text x="46" y="18" font-family="Montserrat, sans-serif" font-size="22" font-weight="500" fill="#4285F4">g</text>\n<text x="60" y="18" font-family="Montserrat, sans-serif" font-size="22" font-weight="500" fill="#34A853">l</text>\n<text x="66" y="18" font-family="Montserrat, sans-serif" font-size="22" font-weight="500" fill="#EA4335">e</text>\n</svg>',
  star: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M10 0L12.645 6.35942L19.5106 6.90983L14.2798 11.3906L15.8779 18.0902L10 14.5L4.12215 18.0902L5.72025 11.3906L0.489435 6.90983L7.35497 6.35942L10 0Z" fill="#F98A0B"/>\n</svg>',
  'chevron-left':
    '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M19.293 7.29302C19.6835 6.90249 20.3165 6.90249 20.707 7.29302C21.0975 7.68354 21.0975 8.31655 20.707 8.70708L13.414 16L20.707 23.293C21.0975 23.6835 21.0975 24.3166 20.707 24.7071C20.3165 25.0976 19.6835 25.0976 19.293 24.7071L11.293 16.7071C10.9024 16.3166 10.9024 15.6835 11.293 15.293L19.293 7.29302Z" fill="currentColor"/>\n</svg>',
  'chevron-right':
    '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M11.293 7.29302C11.6835 6.90249 12.3165 6.90249 12.707 7.29302L20.707 15.293C21.0975 15.6835 21.0975 16.3166 20.707 16.7071L12.707 24.7071C12.3165 25.0976 11.6835 25.0976 11.293 24.7071C10.9024 24.3166 10.9024 23.6835 11.293 23.293L18.5859 16L11.293 8.70708C10.9024 8.31655 10.9024 7.68354 11.293 7.29302Z" fill="currentColor"/>\n</svg>',
};

export interface GoogleReviewsProps extends HTMLAttributes<HTMLElement> {
  /** Note globale telle qu affichee par le widget — POINT decimal (4.8), pas une virgule : mesure directe sur l aplat (T040, corrige une transcription initiale fautive). */
  noteGlobale?: string;
  /** Libellé qualitatif du widget (« Excellent » mesuré sur l'aplat, T012) — texte de chrome du widget, pas un avis individuel, mais porté par propriété comme le reste du contenu réel. */
  qualificatif?: string;
  volume?: string;
  /** Flèches de carrousel — mesurées présentes aux deux bords de l'aplat (T012). */
  montrerControles?: boolean;
  /** La collection de cartes — code-only par construction (figma.kind:'NONE' obligatoire pour un arrayOf, R8). React mappe le tableau vivant ; html/react-inline/canevas rendent le `sample` du repeat (générique, jamais le contenu réel — FR-010). */
  avis?: Array<{
    auteur: string;
    initiale: string;
    date: string;
    texte: string;
    avatar: 'Initiale' | 'Photo';
    note: '1' | '2' | '3' | '4' | '5';
    photoUrl: string;
    photoAlt: string;
  }>;
}

/** Le bloc « Avis Google » historique. Le nouveau parent public `ds.google-reviews-section` le compose avec `ds.section-header`, sans modifier sa surface Odoo authorée existante. La grille garde cinq colonnes égales et les flèches restent des overlays absolus. */
export const GoogleReviews = forwardRef<HTMLElement, GoogleReviewsProps>(function GoogleReviews(
  {
    montrerControles = true,
    noteGlobale = '4.8',
    qualificatif = 'Excellent',
    volume = '93 avis',
    avis,
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
      <div className={styles.resume}>
        <div className={styles.infos}>
          <span
            className={styles.marque}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: ICONS['google-wordmark'] }}
          />
          <span className={styles.qualificatifTexte}>{qualificatif}</span>
          <div className={styles.notation}>
            <span
              className={styles.etoile1}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ICONS['star'] }}
            />
            <span
              className={styles.etoile2}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ICONS['star'] }}
            />
            <span
              className={styles.etoile3}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ICONS['star'] }}
            />
            <span
              className={styles.etoile4}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ICONS['star'] }}
            />
            <span
              className={styles.etoile5}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ICONS['star'] }}
            />
            <span className={styles.noteGlobaleTexte}>{noteGlobale}</span>
          </div>
          <span className={styles.separateur}>|</span>
          <span className={styles.volume}>{volume}</span>
        </div>
        <div className={styles.ecrireAvis}>
          <span className={styles.libelle}>Écrire un avis</span>
        </div>
      </div>
      <div className={styles.cartes}>
        {montrerControles ? (
          <div className={styles.flecheGauche}>
            <div className={styles.pastilleGauche}>
              <span
                className={styles.iconeGauche}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS['chevron-left'] }}
              />
            </div>
          </div>
        ) : null}
        <div className={styles.groupeCartes}>
          {avis?.map((item, index) => (
            <ReviewCard
              key={index}
              auteur={item.auteur}
              initiale={item.initiale}
              date={item.date}
              texte={item.texte}
              avatar={item.avatar}
              note={item.note}
              photoUrl={item.photoUrl}
              photoAlt={item.photoAlt}
            />
          ))}
        </div>
        {montrerControles ? (
          <div className={styles.flecheDroite}>
            <div className={styles.pastilleDroite}>
              <span
                className={styles.iconeDroite}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS['chevron-right'] }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
});
