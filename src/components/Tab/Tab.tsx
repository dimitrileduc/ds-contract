/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/tab.contract.json (ds.tab v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './Tab.module.css';

export interface TabProps extends HTMLAttributes<HTMLDivElement> {
  etat?: 'defaut' | 'selectionne';
  libelle?: string;
}

/** Piqueray Tab. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const Tab = forwardRef<HTMLDivElement, TabProps>(function Tab(
  { etat = 'defaut', libelle = 'Onglet', className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`etat-${etat}`], className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <span className={styles.libell}>{libelle}</span>
    </div>
  );
});
