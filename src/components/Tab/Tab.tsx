/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/tab.contract.json (ds.tab v2.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import styles from './Tab.module.css';

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  etat?: 'defaut' | 'selectionne';
  libelle?: string;
  /** Code-only id of the panel controlled by this Tab. */
  panelId: string;
  /** Code-only id of the owning tablist. Its controller supplies the bounded arrow-key roving-focus behavior; exactly one sibling Tab is selected and has tabIndex 0. */
  tablistId: string;
}

/** Piqueray Tab. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. Panel and tablist identities are code-only semantics: every Tab belongs to an existing tablist, whose controller owns the bounded roving-focus behavior and keeps exactly one Tab selected/focusable; this contract does not invent a TabList molecule or a panel. Version 2.0.0 is breaking because panelId and tablistId are now required for an accessible Tab relationship. */
export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { etat = 'defaut', libelle = 'Onglet', panelId, tablistId, className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`etat-${etat}`], className].filter(Boolean).join(' ');
  return (
    <button
      ref={ref}
      className={classes}
      role="tab"
      type="button"
      data-tablist-id={String(tablistId)}
      {...((
        {
          defaut: { 'aria-selected': 'false', 'aria-controls': String(panelId), tabIndex: -1 },
          selectionne: { 'aria-selected': 'true', 'aria-controls': String(panelId), tabIndex: 0 },
        } as const
      )[etat as 'defaut' | 'selectionne'] ?? {})}
      {...rest}
    >
      <span className={styles.libell}>{libelle}</span>
    </button>
  );
});
