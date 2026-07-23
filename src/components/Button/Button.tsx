/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/button.contract.json (ds.button v1.1.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

const ICONS: Record<string, string> = {
  'arrow-right':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="none"><path d="M13.4325 0L12.5487 0.883867L16.2986 4.63375H0V5.88379H16.2984L12.5487 9.63355L13.4325 10.5174L18.6913 5.25871L13.4325 0Z" transform="translate(0.626 4.742)" fill="currentColor"/></svg>',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. */
  variant?: 'default' | 'orange' | 'blanc' | 'outlineBlanc' | 'link' | 'outilneNoir';
}

/** Piqueray button. Six variants extracted from the Figma « Bouton » set (Default, Orange, Blanc, Outline blanc, Link, Outilne noir), bound to Piqueray primitives. The label is a reusable prop. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'default', className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`variant-${variant}`], className].filter(Boolean).join(' ');
  return (
    <button ref={ref} className={classes} {...rest}>
      <span className={styles.label}>{children}</span>
      {variant === 'link' ? (
        <span
          className={styles.arrow}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: ICONS['arrow-right'] }}
        />
      ) : null}
    </button>
  );
});
