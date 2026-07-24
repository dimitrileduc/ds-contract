/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/checkbox.contract.json (ds.checkbox v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

const ICONS: Record<string, string> = {
  check:
    '<svg width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M1 5.4L4.5 9L11.5 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n</svg>',
};

export interface CheckboxProps extends HTMLAttributes<HTMLSpanElement> {
  checked?: 'non' | 'oui';
}

/** Piqueray checkbox. Extracted from the owner-validated Figma COMPONENT_SET « Checkbox » (DS · Atomes, built in spec 003), reviewed and adopted — not authored.

Accessible custom control (the demo-51 pattern, adapted): the visual box is presentational (border/fill follow the « Coché » variant), a REAL native <input type="checkbox"> sits inside for accessibility (« Canvas: not drawn » — semantics don't draw), and the custom check glyph is a sibling shown only when checked. This keeps the exact Piqueray look AND native semantics; the wrapping label is the Field molecule's job.

The check glyph is check.svg, exported from the master's real Vector node (2053:1255) — an internal glyph consumed by this contract, deliberately OUTSIDE the governed icon registry (which stays at its governed count). Modeled ONLY as the master exposes it: a Non/Oui variant, no label, no size axis, no indeterminate state, no declared event — the Field molecule owns those. */
export const Checkbox = forwardRef<HTMLSpanElement, CheckboxProps>(function Checkbox(
  { checked = 'non', className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`checked-${checked}`], className].filter(Boolean).join(' ');
  return (
    <span ref={ref} className={classes} {...rest}>
      <input className={styles.input} type="checkbox" defaultChecked={checked === 'oui'}></input>
      {checked === 'oui' ? (
        <span
          className={styles.checkGlyph}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: ICONS['check'] }}
        />
      ) : null}
    </span>
  );
});
