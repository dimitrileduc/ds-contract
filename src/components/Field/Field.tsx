/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/field.contract.json (ds.field v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './Field.module.css';

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  etat?: 'normal' | 'erreur';
  label?: string;
  /** Extracted from Figma "Optionnel" BOOLEAN property (added by sync pass). */
  optionnel?: boolean;
}

/** Piqueray Field. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { etat = 'normal', optionnel = false, label = 'Libellé', className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`etat-${etat}`], className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} data-optionnel={optionnel || undefined} {...rest}>
      <div className={styles.label}>
        <span className={styles.Label}>{label}</span>
        <span className={styles.MentionOptionnelle}>(optionnel)</span>
      </div>
      <div className={styles.Saisie}>{children}</div>
      {etat === 'erreur' ? <span className={styles.messageErreur}>Message d’erreur</span> : null}
    </div>
  );
});
