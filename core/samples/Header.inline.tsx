/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/header.contract.json (ds.header v3.1.1)
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
  "presentation-desktop:nav": {
    "gap": "24px"
  },
  "presentation-wide:root": {
    "paddingInline": "89px",
    "paddingBlock": "26px"
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

/** Piqueray Header, responsive (vague 031). 3.0.0 (2026-09-04) : les ancres passent du master DS 84:285 au set 031 `Header` 2732:12096, quatre variantes Presentation construites depuis les 4 vues home de la page 031 sans redessin (journal specs/tiny/vague-031/header.md). Mobile/Tablette : logo + burger 44×44 ; Desktop : logo + nav + icônes Utilisateur/Panier/Mail, sans bouton ; Wide : logo + nav + bouton « Contactez-nous » + icônes Utilisateur/Panier. La présence par écran de navWrapper (Desktop/Wide) et de MenuBurger (Mobile/Tablette) est portée en stylesWhen display:none (le schéma n'admet qu'une valeur par visibleWhen) ; côté canevas les variantes ne dessinent simplement pas la part absente — limite nommée du canal stylesWhen (non représenté sur le canevas). L'icône Recherche, masquée sur le canevas Wide, n'est plus portée (calque caché = défaut de source, §VIII). Largeurs minimales de la nav : Desktop 1113 px, Wide 1487 px — au-dessous, la nav chevauche le logo (fait de design, à trancher). 3.1.0 (2026-09-16, GO owner sur la planche 031 · 28) : les trois icônes (Utilisateur, Panier, Mail) et le bouton « Contactez-nous » sont retirés de la barre ; la nav gagne deux entrées, « Boutique » (lien vers la boutique Odoo) et « Contact » (lien vers /contactez-nous), soit six entrées — le contenu réel vient du menu Odoo (`items`, code-only). Deux conséquences mesurées et posées à la source : en Desktop, six entrées à l'écart 32 débordaient de 10 px sur le logo (largeur utile 1104, logo 180, nav 934) → écart nav 24 en Desktop seulement (nav 894, marge 30 px), Wide garde 32 ; en Wide, sans le bouton de 54 px, la barre retombait à 66 px → padding vertical 26 comme en Desktop, la barre reste à 86 px sur les deux écrans. Ancres inchangées (même set 2732:12096, re-relevé le 2026-09-16), aucun prop retiré : MINEUR. 3.1.1 (2026-09-16) : l'échantillon de la nav passe à six entrées (celles du set) et « Portes d'entrée » perd son chevron — il n'a plus d'enfant depuis que Motorisation est sous « Portes de garage » (spec 037) ; posé à la source d'abord (Chevron=false sur les deux variantes), l'écart de 24 px par écran relevé le même jour disparaît. PATCH : l'échantillon est un fait de rendu statique, l'API ne bouge pas. */
export const Header = forwardRef<HTMLDivElement, HeaderProps>(function Header(
  { presentation = 'mobile', items, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }}  {...rest}>
      <PiquerayLogo couleur="blanc" />
<div style={{ ...S.navWrapper, ...(V[`presentation-${presentation}:navWrapper`] ?? {}), ...(presentation === 'mobile' ? {"display":"none"} : {}), ...(presentation === 'tablette' ? {"display":"none"} : {}) }}>
<div style={{ ...S.nav, ...(V[`presentation-${presentation}:nav`] ?? {}) }}>
<NavItem actif={false} libelle="Portes de garage" href="/portes-de-garage" chevron />
<NavItem actif={false} libelle="Portes d’entrée" href="/portes-entree" />
<NavItem actif={false} libelle="Boutique" href="/shop" />
<NavItem actif={false} libelle="Dépannage/SAV" href="/depannage-sav" />
<NavItem actif={false} libelle="À propos" href="/a-propos" />
<NavItem actif={false} libelle="Contact" href="/contactez-nous" />
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
