/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/realisation.contract.json (ds.realisation v1.1.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './Realisation.module.css';

export interface RealisationProps extends HTMLAttributes<HTMLDivElement> {
  /** Observed Figma VARIANT `Taille`: Grand has a 743×743 image plane and Petit has a 339.5×339.5 image plane. This axis selects image geometry only; the visible IMAGE fill remains an instance override. */
  taille?: 'grand' | 'petit';
  /** Code-supplied URL for the visible IMAGE fill at either selected size. Figma stores the 27 observed photos as instance fill overrides (3 Grand and 24 Petit), not as a component property; the empty runtime default is intentional and does not substitute an image. */
  imageUrl?: string;
  /** Code-supplied text alternative paired with imageUrl for either selected size. Figma IMAGE fills expose no corresponding alt component property, so the empty runtime default is intentional. */
  imageAlt?: string;
}

/** Piqueray Realisation. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. Figma IMAGE FILL maps to object-fit: cover; IMAGE fills are instance overrides in Figma and src/alt are explicit code semantics. */
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
