/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/section-header.contract.json (ds.section-header v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './SectionHeader.module.css';

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  disposition?: 'standard' | 'avecCta';
  accroche?: string;
  titre?: string;
}

/** Piqueray SectionHeader. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  {
    disposition = 'standard',
    accroche = 'Plus de 50 ans d’expérience',
    titre = 'Pourquoi choisir Piqueray ?',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, styles[`disposition-${disposition}`], className]
    .filter(Boolean)
    .join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      {disposition === 'standard' ? <span className={styles.Accroche}>{accroche}</span> : null}
      <span className={styles.Titre}>{titre}</span>
      <Button>Contactez-nous</Button>
    </div>
  );
});
