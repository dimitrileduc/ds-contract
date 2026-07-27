/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/devis.contract.json (ds.devis v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './Devis.module.css';

export interface DevisProps extends HTMLAttributes<HTMLDivElement> {
  titre?: string;
}

/** Piqueray Devis. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Devis = forwardRef<HTMLDivElement, DevisProps>(function Devis(
  {
    titre = 'Prenez rendez-vous pour un devis gratuit, nous nous déplaçons chez vous',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <div className={styles.Container}>
        <span className={styles.Titre}>{titre}</span>
        <Button>Contactez-nous</Button>
      </div>
    </div>
  );
});
