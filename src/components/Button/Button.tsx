/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/button.contract.json (ds.button v1.2.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

const ICONS: Record<string, string> = {
  'arrow-left':
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M19.4271 9.375H3.12861L6.87842 5.6252L5.99455 4.74133L0.73584 10L5.99455 15.2588L6.87842 14.3749L3.12854 10.625H19.4271V9.375Z" fill="currentColor"/>\n</svg>',
  'arrow-right':
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M14.0575 4.74133L13.1737 5.6252L16.9236 9.37508H0.625V10.6251H16.9234L13.1737 14.3749L14.0575 15.2588L19.3163 10L14.0575 4.74133Z" fill="currentColor"/>\n</svg>',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. */
  variant?: 'default' | 'orange' | 'blanc' | 'outlineBlanc' | 'link' | 'outilneNoir';
  /** Shows the leading icon slot (default glyph: the file's cil:arrow-left). Extracted from the BOOLEAN property « Icône gauche » added to the Figma masters on 2026-07-23; on pages the glyph is often instance-swapped (pdf, cart, phone, …) — swaps stay designer-side overrides. */
  iconLeft?: boolean;
  /** Shows the trailing icon slot (default glyph: the file's cil:arrow-right — the « → » of Link buttons). Extracted from the BOOLEAN property « Icône droite » added to the Figma masters on 2026-07-23; on pages the glyph is sometimes instance-swapped (download, chevron, …). */
  iconRight?: boolean;
}

/** Piqueray button. Six variants extracted from the Figma « Bouton » set (Default, Orange, Blanc, Outline blanc, Link, Outilne noir), bound to Piqueray primitives. The label is a reusable prop. The two nested icons are leading/trailing SLOTS: since 2026-07-23 the Figma masters bind their visibility to the BOOLEAN properties « Icône gauche »/« Icône droite » (promotion from observed usage — 21/79 page instances show a left icon, 59/79 a right one), modeled here as the iconLeft/iconRight boolean props with the file's own cil:arrow-* glyphs as default content. Page-level INSTANCE SWAPS of those glyphs (pdf, download, cart, …) stay designer-side instance overrides — an INSTANCE_SWAP slot model is deliberately deferred until the icon masters get contracts. Known extraction gap, named: propose-figma does not yet lower the dump's boolDefaults/propRefs into props, so this promotion is authored and reviewed against the 2026-07-23 dump. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'default', iconLeft = false, iconRight = false, className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`variant-${variant}`], className].filter(Boolean).join(' ');
  return (
    <button
      ref={ref}
      className={classes}
      data-icon-left={iconLeft || undefined}
      data-icon-right={iconRight || undefined}
      {...rest}
    >
      {iconLeft ? (
        <span
          className={styles.iconLeft}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: ICONS['arrow-left'] }}
        />
      ) : null}
      <span className={styles.label}>{children}</span>
      {iconRight ? (
        <span
          className={styles.iconRight}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: ICONS['arrow-right'] }}
        />
      ) : null}
    </button>
  );
});
