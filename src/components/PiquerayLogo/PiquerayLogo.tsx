/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/piqueray-logo.contract.json (ds.piqueray-logo v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './PiquerayLogo.module.css';

export interface PiquerayLogoProps extends HTMLAttributes<HTMLDivElement> {
  /** Color variant: default (orange mark + blue text) or white (all white for dark backgrounds). Extracted from the VARIANT property « Couleur » on the Figma master. */
  couleur?: 'default' | 'blanc';
}

/** Piqueray brand logo. Two color variants: default (orange brand mark, blue text) and white (all white) — the couleur prop switches both the mark fill and the text traces simultaneously. Extracted from the Figma COMPONENT_SET « PiquerayLogo » on DS · Atomes, reviewed and adopted — not authored.

The logo is a purely decorative brand element — no text content, no interaction, no a11y label beyond the img role. Anatomy carries the drawn structure: Marque (orange fill, bound to {color.orange}) and Texte (8 vector traces, blue fill switching to white on couleur=blanc via tokensByProp). */
export const PiquerayLogo = forwardRef<HTMLDivElement, PiquerayLogoProps>(function PiquerayLogo(
  { couleur = 'default', className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`couleur-${couleur}`], className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} role="img" {...rest}>
      <div className={styles.Marque}></div>
      <div className={styles.Texte}>
        <div className={styles.trac}></div>
        <div className={styles.trac2}></div>
        <div className={styles.trac3}></div>
        <div className={styles.trac4}></div>
        <div className={styles.trac5}></div>
        <div className={styles.trac6}></div>
        <div className={styles.trac7}></div>
        <div className={styles.trac8}></div>
      </div>
    </div>
  );
});
