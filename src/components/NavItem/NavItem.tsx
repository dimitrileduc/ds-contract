/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/nav-item.contract.json (ds.nav-item v1.2.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';
import styles from './NavItem.module.css';

const ICONS: Record<string, string> = {
  'octicon-chevron-down12':
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M8.00003 11.7666C7.73336 11.7666 7.4667 11.6333 7.33336 11.5L2.93336 7.09998C2.53336 6.69998 2.53336 6.03331 2.93336 5.63331C3.33336 5.23331 4.00003 5.23331 4.40003 5.63331L8.00003 9.23331L11.6 5.63331C12 5.23331 12.6667 5.23331 13.0667 5.63331C13.4667 6.03331 13.4667 6.69998 13.0667 7.09998L8.80003 11.3666C8.53336 11.6333 8.2667 11.7666 8.00003 11.7666Z" fill="white"/>\n</svg>',
};

export interface NavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  libelle?: string;
  href: string;
  chevron?: boolean;
  actif?: boolean;
}

/** Piqueray NavItem. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Link destination (href) is explicit code semantics; the label binds the Figma TEXT property « Libellé » since 1.2.0 (016 — lifted limit, formerly code-only kind: NONE); chevron and active are Figma BOOLEAN facts, and the transparent white-ink composition is intended for a dark Header/photo surface. */
export const NavItem = forwardRef<HTMLAnchorElement, NavItemProps>(function NavItem(
  {
    chevron = true,
    actif = false,
    libelle = 'Portes de garage',
    href,
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <a
      ref={ref}
      className={classes}
      data-chevron={chevron || undefined}
      data-actif={actif || undefined}
      href={String(href)}
      {...(({ true: { 'aria-current': 'page' } } as const)[String(actif) as 'true'] ?? {})}
      {...rest}
    >
      <span className={styles.libell}>{libelle}</span>
      {chevron ? (
        <span
          className={styles.OcticonChevronDown12}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: ICONS['octicon-chevron-down12'] }}
        />
      ) : null}
      {actif ? <div className={styles.Soulignement}></div> : null}
    </a>
  );
});
