/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/copyright.contract.json (ds.copyright v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './Copyright.module.css';

export interface CopyrightProps extends HTMLAttributes<HTMLDivElement> {
  texte?: string;
}

/** Piqueray Copyright. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const Copyright = forwardRef<HTMLDivElement, CopyrightProps>(function Copyright(
  {
    texte = '© 2025 Piqueray - CGV - Politique de confidentialité | Création de site internet ProduWeb',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <span className={styles.Texte}>{texte}</span>
    </div>
  );
});
