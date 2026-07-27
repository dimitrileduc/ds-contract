/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/member-picture.contract.json (ds.member-picture v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './MemberPicture.module.css';

export interface MemberPictureProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual state: default (no overlay) or hover (overlay visible). Extracted from the VARIANT property « Etat » on the Figma master. */
  etat?: 'defaut' | 'survol';
}

/** Piqueray member picture. A circular avatar placeholder with two states: default (visible) and hover (overlay shown). Extracted from the Figma COMPONENT_SET « MemberPicture » on DS · Atomes, reviewed and adopted — not authored.

The etat variant drives a visual overlay (opacity 1→0 between defaut/survol). Corner radius 500px via literals (circular crop — no token carries unitless border-radius values at this scale). Opacity transition is a Figma-internal layering technique; the contract models both states as drawn. */
export const MemberPicture = forwardRef<HTMLDivElement, MemberPictureProps>(function MemberPicture(
  { etat = 'defaut', className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`etat-${etat}`], className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <div className={styles.funIa}></div>
      <div className={styles.normal}></div>
    </div>
  );
});
