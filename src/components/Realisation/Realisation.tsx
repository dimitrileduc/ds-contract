/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/realisation.contract.json (ds.realisation v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './Realisation.module.css';

export interface RealisationProps extends HTMLAttributes<HTMLDivElement> {
  taille?: 'grand' | 'petit';
  imageUrl?: string;
  imageAlt?: string;
}

/** Piqueray Realisation. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. IMAGE fills are instance overrides in Figma; src/alt are explicit code semantics. */
export const Realisation = forwardRef<HTMLDivElement, RealisationProps>(function Realisation(
  { taille = 'grand', imageUrl = '', imageAlt = '', className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`taille-${taille}`], className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <img className={styles.Image} src={String(imageUrl)} alt={String(imageAlt)}></img>
    </div>
  );
});
