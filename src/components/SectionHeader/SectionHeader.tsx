/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/section-header.contract.json (ds.section-header v3.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './SectionHeader.module.css';

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  titre?: Array<{ text: string; strong?: boolean }>;
  accroche?: string;
  /** Explicit eyebrow visibility. False removes its text node from layout rather than leaving an empty line box. */
  afficherAccroche?: boolean;
  alignement?: 'centre' | 'gauche';
}

/** Piqueray SectionHeader v3. Generic section title only: a rich title, optional eyebrow and explicit alignment. CTA and specialised hierarchy belong to their owning sections: ds.hero@2.0.0, ds.presentation@3.0.0, ds.texte-seo@3.0.0 and ds.produits-ecommerce@1.0.0. */
export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  {
    alignement = 'centre',
    afficherAccroche = true,
    accroche = 'Plus de 50 ans d’expérience',
    titre = [{ text: 'Pourquoi choisir Piqueray ?' }],
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, styles[`alignement-${alignement}`], className]
    .filter(Boolean)
    .join(' ');
  return (
    <div
      ref={ref}
      className={classes}
      data-afficher-accroche={afficherAccroche || undefined}
      {...rest}
    >
      {afficherAccroche ? <span className={styles.Accroche}>{accroche}</span> : null}
      <span className={styles.Titre}>
        {titre.map((segment, index) =>
          segment.strong ? (
            <strong key={index}>{segment.text}</strong>
          ) : (
            <span key={index}>{segment.text}</span>
          ),
        )}
      </span>
    </div>
  );
});
