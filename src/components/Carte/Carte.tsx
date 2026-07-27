/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carte.contract.json (ds.carte v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './Carte.module.css';

export interface CarteProps extends HTMLAttributes<HTMLDivElement> {
  disposition?: 'reassurance' | 'categorie';
  titre?: string;
  texte?: string;
}

/** Piqueray Carte. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const Carte = forwardRef<HTMLDivElement, CarteProps>(function Carte(
  {
    disposition = 'reassurance',
    titre = 'Pour portes de garage',
    texte = 'SupraMatic & ProMatic. Ouverture ultra-rapide et verrouillage mécanique anti-intrusion breveté.',
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
      <div className={styles.img}></div>
      <div className={styles.text}>
        <span className={styles.Titre}>{titre}</span>
        <span className={styles.Texte}>{texte}</span>
      </div>
      <Button>Contactez-nous</Button>
    </div>
  );
});
