/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/select.contract.json (ds.select v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './Select.module.css';

const ICONS: Record<string, string> = {
  'chevron-down':
    '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M7.29302 12.7071C6.90249 12.3166 6.90249 11.6836 7.29302 11.293C7.68354 10.9025 8.31655 10.9025 8.70708 11.293L16 18.586L23.293 11.293C23.6835 10.9025 24.3166 10.9025 24.7071 11.293C25.0976 11.6836 25.0976 12.3166 24.7071 12.7071L16.7071 20.7071C16.3166 21.0976 15.6835 21.0976 15.293 20.7071L7.29302 12.7071Z" fill="currentColor"/>\n</svg>',
};

export interface SelectProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
}

/** Piqueray select. Extracted from the owner-validated Figma master « Select » (DS · Atomes, built in spec 003), reviewed and adopted — not authored.

Wrapper pattern (same spirit as Checkbox): the box is presentational, a REAL native <select> inside carries the value and the accessibility, and the Piqueray chevron is a sibling icon — a native <select> cannot hold a custom chevron, so the wrapper gives the exact look AND native semantics. The consumer (Field molecule / form) supplies the real options; the atom shows « Valeur » as the placeholder.

The chevron is the governed registry icon `chevron-down` (size 24, an instance in the master — reused, never copied). Box styling binds to Piqueray primitives where a token exists; off-scale values (12px padding, 1px border, 24px line-height, square 0 radius) ride the honest `literals` channel. Atom scope only — no label, no state axes (the Field molecule owns them). */
export const Select = forwardRef<HTMLDivElement, SelectProps>(function Select(
  { value = 'Texte de saisie', className, children, ...rest },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <select className={styles.valeur}>
        <option>{value}</option>
      </select>
      <span
        className={styles.chevron}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: ICONS['chevron-down'] }}
      />
    </div>
  );
});
