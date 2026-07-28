/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/tab.contract.json (ds.tab v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import styles from './Tab.module.css';

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  etat?: 'defaut' | 'selectionne';
  libelle?: string;
}

/** Piqueray Tab. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { etat = 'defaut', libelle = 'Onglet', className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`etat-${etat}`], className].filter(Boolean).join(' ');
  return (
    <button ref={ref} className={classes} role="tab" type="button" {...rest}>
      <span className={styles.libell}>{libelle}</span>
    </button>
  );
});
