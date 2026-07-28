/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/nav-item.contract.json (ds.nav-item v1.0.0)
 * Emitted by core/emit-react-inline.ts — the zero-infrastructure output:
 * every token reference was RESOLVED to its literal value from the design
 * tokens at emit time. Resolution mode: light (brand: default). To retheme,
 * re-emit against different tokens — do not edit literals by hand.
 * Fidelity: :hover/:focus-visible state tokens are not expressible as inline
 * styles and are omitted; ROOT disabled-state tokens apply via the disabled
 * prop; PART-level state overrides (Part.states, v13) are omitted — the same
 * declared limit as the hover states (state-selected descendant styling).
 */
import { forwardRef } from 'react';
import type { CSSProperties, AnchorHTMLAttributes } from 'react';

const ICONS: Record<string, string> = {
  "octicon-chevron-down12": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M8.00003 11.7666C7.73336 11.7666 7.4667 11.6333 7.33336 11.5L2.93336 7.09998C2.53336 6.69998 2.53336 6.03331 2.93336 5.63331C3.33336 5.23331 4.00003 5.23331 4.40003 5.63331L8.00003 9.23331L11.6 5.63331C12 5.23331 12.6667 5.23331 13.0667 5.63331C13.4667 6.03331 13.4667 6.69998 13.0667 7.09998L8.80003 11.3666C8.53336 11.6333 8.2667 11.7666 8.00003 11.7666Z\" fill=\"white\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "16px",
    "fontWeight": 500,
    "gap": "8px",
    "lineHeight": "16px",
    "position": "relative",
    "textTransform": "uppercase"
  },
  "libell": {
    "color": "#FFFFFF"
  },
  "OcticonChevronDown12": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "Soulignement": {
    "backgroundColor": "#FFFFFF",
    "height": "2px",
    "position": "absolute"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface NavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  libelle?: string;
  href: string;
  chevron?: boolean;
  actif?: boolean;
}

/** Piqueray NavItem. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Link destination and runtime label are explicit code semantics; the active underline remains a Figma visual fact. */
export const NavItem = forwardRef<HTMLAnchorElement, NavItemProps>(function NavItem(
  { chevron = true, actif = false, libelle = 'Portes de garage', href, style, children, ...rest },
  ref,
) {
  return (
    <a ref={ref} style={{ ...S.root, ...style }} data-chevron={chevron || undefined} data-actif={actif || undefined} {...rest}>
      <span style={{ ...S.libell }}>{libelle}</span>
{chevron ? (<span style={{ ...S.OcticonChevronDown12 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["octicon-chevron-down12"] }} />) : null}
{actif ? (<div style={{ ...S.Soulignement, ...(actif ? {"right":"0px","bottom":"0px","left":"0px"} : {}) }}>

</div>) : null}
    </a>
  );
});
