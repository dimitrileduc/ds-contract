/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/footer-column.contract.json (ds.footer-column v1.1.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './FooterColumn.module.css';

export interface FooterColumnProps extends HTMLAttributes<HTMLDivElement> {
  titre?: string;
  texte?: string;
}

/** Piqueray FooterColumn. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. */
export const FooterColumn = forwardRef<HTMLDivElement, FooterColumnProps>(function FooterColumn(
  {
    titre = 'Adresse',
    texte = 'Rue Alfred Drèze 7,  4860 Pepinster',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <span className={styles.Titre}>{titre}</span>
      <span className={styles.Texte}>{texte}</span>
    </div>
  );
});
