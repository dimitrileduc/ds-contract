/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/field.contract.json (ds.field v2.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef, cloneElement, isValidElement } from 'react';
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
  const slotControl0 = isValidElement<Record<string, unknown>>(children)
    ? cloneElement(children, {
        'aria-invalid': etat === 'normal' ? 'false' : etat === 'erreur' ? 'true' : undefined,
        'aria-describedby':
          etat === 'normal' ? undefined : etat === 'erreur' ? 'field-error-message' : undefined,
        style: {
          ...((children.props.style as Record<string, unknown> | undefined) ?? {}),
          width: '100%',
          borderColor:
            etat === 'normal'
              ? 'var(--color-bleu-gris)'
              : etat === 'erreur'
                ? 'var(--color-rouge)'
                : undefined,
          '--dsc-border-color':
            etat === 'normal'
              ? 'var(--color-bleu-gris)'
              : etat === 'erreur'
                ? 'var(--color-rouge)'
                : undefined,
        },
      })
    : children;
  const classes = [styles.root, styles[`etat-${etat}`], className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} data-optionnel={optionnel || undefined} {...rest}>
      <div className={styles.label}>
        <span className={styles.Label}>{label}</span>
        {optionnel ? <span className={styles.MentionOptionnelle}>(optionnel)</span> : null}
      </div>
      <div className={styles.Saisie}>{slotControl0}</div>
      {etat === 'erreur' ? (
        <span className={styles.messageErreur} id="field-error-message">
          Message d’erreur
        </span>
      ) : null}
    </div>
  );
});
