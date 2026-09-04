/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/header.contract.json (ds.header v3.0.0)
 * Emitted by core/emit-react-inline.ts — the zero-infrastructure output:
 * every token reference was RESOLVED to its literal value from the design
 * tokens at emit time. Resolution mode: light (brand: default). To retheme,
 * re-emit against different tokens — do not edit literals by hand.
 * Fidelity: :hover/:focus-visible state tokens are not expressible as inline
 * styles and are omitted; ROOT disabled-state tokens apply via the disabled
 * prop; PART-level state overrides (Part.states, v13) are omitted — the same
 * declared limit as the hover states (state-selected descendant styling).
 * Fidelity: repeat collections render the contract's OBSERVED sample as fixed
 * instances (the array prop is declared but not mapped on this surface) — the
 * full React surface maps the live array.
 */
import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import { PiquerayLogo } from './PiquerayLogo';
import { NavItem } from './NavItem';
import { Button } from './Button';

const ICONS: Record<string, string> = {
  "user": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M20.3336 7.99963C20.3334 5.60655 18.3928 3.66663 15.9996 3.66663C13.6067 3.6668 11.6668 5.60666 11.6666 7.99963C11.6666 10.3928 13.6065 12.3334 15.9996 12.3336C18.3929 12.3336 20.3336 10.3929 20.3336 7.99963ZM22.3336 7.99963C22.3336 11.4974 19.4974 14.3336 15.9996 14.3336C12.502 14.3334 9.66663 11.4973 9.66663 7.99963C9.6668 4.50209 12.5021 1.6668 15.9996 1.66663C19.4973 1.66663 22.3334 4.50198 22.3336 7.99963Z\" fill=\"currentColor\"/>\n<path d=\"M25.6663 23.3333C25.6663 22.1984 24.8381 20.9668 23.0521 19.9622C21.2975 18.9752 18.8062 18.3333 16.0003 18.3333C13.1942 18.3333 10.7022 18.9751 8.94756 19.9622C7.16163 20.9668 6.33331 22.1984 6.33331 23.3333C6.33331 25.0767 6.38721 26.0581 7.29815 26.8C7.79217 27.2024 8.61802 27.5949 10.0315 27.8811C11.4408 28.1664 13.368 28.3333 16.0003 28.3333C18.939 28.3332 20.9952 28.1254 22.4319 27.7786C22.9688 27.649 23.5094 27.979 23.639 28.5159C23.7685 29.0526 23.4383 29.5932 22.9017 29.7229C21.2452 30.1227 19.0105 30.3332 16.0003 30.3333C13.2994 30.3333 11.2258 30.164 9.63506 29.842C8.04875 29.5209 6.87474 29.0343 6.03545 28.3508C4.27984 26.9211 4.33331 24.9031 4.33331 23.3333C4.33331 21.1549 5.89256 19.386 7.9671 18.219C10.0731 17.0344 12.9157 16.3333 16.0003 16.3333C19.0847 16.3333 21.9266 17.0344 24.0325 18.219C26.1071 19.386 27.6663 21.1548 27.6663 23.3333C27.6663 23.5617 27.6662 23.7866 27.6644 24.0081C27.6599 24.5603 27.2078 25.0047 26.6556 25.0002C26.1034 24.9956 25.6599 24.5436 25.6644 23.9915C25.6661 23.7757 25.6663 23.5563 25.6663 23.3333Z\" fill=\"currentColor\"/>\n</svg>",
  "cart": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M12.333 26C12.333 25.7348 12.2276 25.4805 12.04 25.293C11.8525 25.1056 11.5981 25 11.333 25C11.0679 25.0001 10.8134 25.1055 10.626 25.293C10.4385 25.4805 10.333 25.7349 10.333 26C10.333 26.2652 10.4385 26.5195 10.626 26.7071C10.8134 26.8945 11.0679 27 11.333 27C11.5981 27 11.8525 26.8945 12.04 26.7071C12.2276 26.5195 12.333 26.2653 12.333 26ZM23 26C23 25.7348 22.8945 25.4805 22.707 25.293C22.5195 25.1055 22.2652 25 22 25C21.7348 25 21.4805 25.1055 21.2929 25.293C21.1054 25.4805 21 25.7348 21 26C21 26.2653 21.1054 26.5195 21.2929 26.7071C21.4805 26.8946 21.7348 27 22 27C22.2652 27 22.5195 26.8946 22.707 26.7071C22.8945 26.5195 23 26.2653 23 26ZM3.71677 3.04105C4.24623 2.88469 4.80233 3.18739 4.95896 3.71683L5.69333 6.20023H25.2324C27.61 6.20048 29.4416 8.34754 28.9101 10.6573L28.8506 10.8809L26.6455 18.3477C26.1738 19.9381 24.6832 21 23.0263 21H10.8164C9.15863 21 7.66553 19.938 7.19529 18.3477L3.04099 4.28324C2.88463 3.75378 3.18733 3.19768 3.71677 3.04105ZM9.11326 17.7803C9.32034 18.4807 10.0021 19 10.8164 19H23.0263C23.8387 19 24.5191 18.4821 24.7275 17.7793L26.9326 10.3145C27.2327 9.29964 26.4523 8.20048 25.2324 8.20023H6.28415L9.11326 17.7803ZM14.333 26C14.333 26.7955 14.0175 27.5586 13.4551 28.1211C12.8924 28.6837 12.1286 29 11.333 29C10.5374 29 9.77442 28.6837 9.21189 28.1211C8.64938 27.5585 8.33298 26.7956 8.33298 26C8.33298 25.2045 8.64938 24.4415 9.21189 23.8789C9.77442 23.3164 10.5374 23.0001 11.333 23C12.1286 23 12.8924 23.3163 13.4551 23.8789C14.0175 24.4415 14.333 25.2045 14.333 26ZM25 26C25 26.7957 24.6837 27.5585 24.1211 28.1211C23.5585 28.6837 22.7956 29 22 29C21.2043 29 20.4415 28.6837 19.8789 28.1211C19.3163 27.5585 19 26.7957 19 26C19 25.2044 19.3163 24.4416 19.8789 23.8789C20.4415 23.3163 21.2043 23 22 23C22.7956 23 23.5585 23.3163 24.1211 23.8789C24.6837 24.4415 25 25.2044 25 26Z\" fill=\"currentColor\"/>\n</svg>",
  "mail": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M22.0931 11.1807C22.5455 10.864 23.169 10.9743 23.4857 11.4268C23.8023 11.8791 23.6928 12.5026 23.2406 12.8194L16.5736 17.4863C16.2293 17.7273 15.7704 17.7273 15.4261 17.4863L8.76009 12.8194C8.30771 12.5027 8.19745 11.8792 8.514 11.4268C8.83067 10.9744 9.45414 10.8641 9.90658 11.1807L15.9993 15.4453L22.0931 11.1807Z\" fill=\"currentColor\"/>\n<path d=\"M28.3337 9.33368C28.3337 8.89173 28.1578 8.46751 27.8454 8.15497C27.5328 7.84241 27.1087 7.66669 26.6667 7.66669H5.33366C4.89163 7.66669 4.46751 7.84241 4.15495 8.15497C3.84238 8.46753 3.66666 8.89165 3.66666 9.33368V22.6667C3.66666 23.1087 3.84238 23.5328 4.15495 23.8454C4.46749 24.1579 4.89171 24.3337 5.33366 24.3337H26.6667C27.1087 24.3337 27.5328 24.158 27.8454 23.8454C28.1579 23.5328 28.3337 23.1087 28.3337 22.6667V9.33368ZM30.3337 22.6667C30.3337 23.6391 29.9471 24.5718 29.2594 25.2595C28.5718 25.9471 27.6391 26.3337 26.6667 26.3337H5.33366C4.36127 26.3337 3.4285 25.947 2.74088 25.2595C2.05325 24.5718 1.66666 23.6391 1.66666 22.6667V9.33368C1.66666 8.36122 2.05325 7.42854 2.74088 6.74091C3.42852 6.05327 4.3612 5.66669 5.33366 5.66669H26.6667C27.6391 5.66669 28.5718 6.05327 29.2594 6.74091C29.947 7.42852 30.3337 8.36129 30.3337 9.33368V22.6667Z\" fill=\"currentColor\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "paddingInline": "24px",
    "paddingBlock": "16px",
    "gap": "0px"
  },
  "navWrapper": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "flex-end",
    "gap": "32px"
  },
  "nav": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "center",
    "gap": "32px"
  },
  "iconsNav": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "16px",
    "color": "#FFFFFF"
  },
  "User": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "Cart": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "Mail": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "MenuBurger": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "justifyContent": "center",
    "gap": "5px",
    "width": "44px",
    "height": "44px"
  },
  "trait": {
    "backgroundColor": "#FFFFFF",
    "borderRadius": "1px",
    "width": "24px",
    "height": "2px"
  },
  "trait2": {
    "backgroundColor": "#FFFFFF",
    "borderRadius": "1px",
    "width": "24px",
    "height": "2px"
  },
  "trait3": {
    "backgroundColor": "#FFFFFF",
    "borderRadius": "1px",
    "width": "24px",
    "height": "2px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "presentation-tablette:root": {
    "paddingInline": "48px"
  },
  "presentation-desktop:root": {
    "paddingInline": "48px",
    "paddingBlock": "26px"
  },
  "presentation-wide:root": {
    "paddingInline": "89px"
  },
  "presentation-wide:navWrapper": {
    "gap": "64px"
  }
};

export interface HeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** L'étage responsive (axe Presentation du set 031). Défaut = première variante du set (mobile), la parité l'exige. Côté Odoo la valeur n'est jamais posée : la feuille responsive/header.pqr.css réécrit les règles par mode en @media sur les breakpoints des jetons. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** La collection de navigation — code-only par construction (figma.kind:'NONE' obligatoire pour un arrayOf, R8). React mappe le tableau vivant ; html/react-inline/canevas rendent le `sample` du repeat. À la différence d'un sample générique (FR-010 de ds.google-reviews), celui-ci porte les libellés et routes RÉELS de tête de la maquette (audit 013 clos par le delta 022 : `/depannage-sav`). Côté produit, ces quatre paires existent une seconde fois dans l'arbre `website.menu` semé UNE FOIS à la livraison (spec 022, data-model §2.2, avec ses enfants) ; après le semis, le menu du CLIENT fait foi — jamais re-semé, jamais écrasé (FR-016). Un renommage de route se porte donc à la main aux deux endroits, aucune porte ne les compare — dette nommée. `chevron` est saisi par entrée ici ; côté Odoo il est dérivé (l'entrée a des enfants). */
  items?: Array<{ libelle: string; href: string; chevron: boolean }>;
}

/** Piqueray Header, responsive (vague 031). 3.0.0 (2026-09-04) : les ancres passent du master DS 84:285 au set 031 `Header` 2732:12096, quatre variantes Presentation construites depuis les 4 vues home de la page 031 sans redessin (journal specs/tiny/vague-031/header.md). Mobile/Tablette : logo + burger 44×44 ; Desktop : logo + nav + icônes Utilisateur/Panier/Mail, sans bouton ; Wide : logo + nav + bouton « Contactez-nous » + icônes Utilisateur/Panier. La présence par écran de navWrapper (Desktop/Wide) et de MenuBurger (Mobile/Tablette) est portée en stylesWhen display:none (le schéma n'admet qu'une valeur par visibleWhen) ; côté canevas les variantes ne dessinent simplement pas la part absente — limite nommée du canal stylesWhen (non représenté sur le canevas). L'icône Recherche, masquée sur le canevas Wide, n'est plus portée (calque caché = défaut de source, §VIII). Largeurs minimales de la nav : Desktop 1113 px, Wide 1487 px — au-dessous, la nav chevauche le logo (fait de design, à trancher). */
export const Header = forwardRef<HTMLDivElement, HeaderProps>(function Header(
  { presentation = 'mobile', items, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }}  {...rest}>
      <PiquerayLogo couleur="blanc" />
<div style={{ ...S.navWrapper, ...(V[`presentation-${presentation}:navWrapper`] ?? {}), ...(presentation === 'mobile' ? {"display":"none"} : {}), ...(presentation === 'tablette' ? {"display":"none"} : {}) }}>
<div style={{ ...S.nav }}>
<NavItem actif={false} libelle="Portes de garage" href="/portes-de-garage" chevron />
<NavItem actif={false} libelle="Portes d’entrée" href="/portes-entree" chevron />
<NavItem actif={false} libelle="Dépannage/SAV" href="/depannage-sav" />
<NavItem actif={false} libelle="À propos" href="/a-propos" />
{presentation === 'wide' ? (<Button variant="blanc" iconLeft={false} iconRight iconRightGlyph="arrow-right">Contactez-nous</Button>) : null}
</div>
<div style={{ ...S.iconsNav }}>
<span style={{ ...S.User }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["user"] }} />
<span style={{ ...S.Cart }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["cart"] }} />
{presentation === 'desktop' ? (<span style={{ ...S.Mail }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["mail"] }} />) : null}
</div>
</div>
<div style={{ ...S.MenuBurger, ...(presentation === 'desktop' ? {"display":"none"} : {}), ...(presentation === 'wide' ? {"display":"none"} : {}) }}>
<div style={{ ...S.trait }}>

</div>
<div style={{ ...S.trait2 }}>

</div>
<div style={{ ...S.trait3 }}>

</div>
</div>
    </div>
  );
});
