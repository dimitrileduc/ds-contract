/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/avantage.contract.json (ds.avantage v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { PiquerayLogo } from '../PiquerayLogo';
import styles from './Avantage.module.css';

export interface AvantageProps extends HTMLAttributes<HTMLDivElement> {
  titre?: string;
  texte?: string;
}

/** Piqueray Avantage. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const Avantage = forwardRef<HTMLDivElement, AvantageProps>(function Avantage(
  {
    titre = 'Conseils personnalisés',
    texte = 'Devis gratuits effectués sur place, nous nous déplaçons chez vous',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <PiquerayLogo />
      <div className={styles.text}>
        <span className={styles.Titre}>{titre}</span>
        <span className={styles.Texte}>{texte}</span>
      </div>
    </div>
  );
});
