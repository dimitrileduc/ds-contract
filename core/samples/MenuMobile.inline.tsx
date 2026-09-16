/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/menu-mobile.contract.json (ds.menu-mobile v1.1.0)
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
import { MenuEntree } from './MenuEntree';

const ICONS: Record<string, string> = {
  "menu-mobile-croix": "<svg width=\"15.414000511169434\" height=\"15.414000511169434\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M0 1.414L1.414 0L15.414 14L14 15.414L0 1.414ZM14 0L15.414 1.414L1.414 15.414L0 14L14 0Z\" fill=\"currentColor\"/>\n</svg>",
  "phone": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M22.3749 29.1051C24.7052 29.1051 26.2457 28.4754 27.6114 26.9486C27.7189 26.8417 27.8126 26.7211 27.92 26.6137C28.7234 25.7166 29.0983 24.8326 29.0983 23.9891C29.0983 23.0246 28.536 22.1274 27.344 21.2966L23.4469 18.5914C22.2412 17.7611 20.8349 17.6674 19.7097 18.7788L18.6789 19.8103C18.3703 20.1183 18.1029 20.132 17.7949 19.944C17.0852 19.4886 15.6252 18.2166 14.6337 17.2257C13.5892 16.1943 12.5714 15.0428 12.0492 14.1988C11.8617 13.8903 11.8886 13.636 12.1966 13.328L13.2143 12.2966C14.3394 11.172 14.2457 9.75198 13.4154 8.56055L10.6966 4.66341C9.87945 3.47084 8.98231 2.9217 8.01773 2.90855C7.1743 2.89484 6.2903 3.28341 5.39316 4.08684C5.27259 4.19427 5.16516 4.28798 5.04459 4.3817C3.53145 5.74741 2.90173 7.28798 2.90173 9.60455C2.90173 13.4354 5.25888 18.096 9.58516 22.4217C13.884 26.7211 18.5583 29.1051 22.3749 29.1051ZM22.3886 27.0423C18.9732 27.1091 14.5943 24.4846 11.1252 21.0291C7.62973 17.5468 4.88402 13.02 4.95088 9.60512C4.97773 8.13141 5.48688 6.85941 6.54516 5.94855C6.62516 5.86855 6.70516 5.80113 6.79888 5.73427C7.18745 5.3857 7.62973 5.19884 8.00459 5.19884C8.40631 5.19884 8.7543 5.3457 9.00916 5.74741L11.6074 9.64455C11.8886 10.06 11.9154 10.5291 11.5 10.944L10.3217 12.1228C9.38402 13.0468 9.46459 14.172 10.1343 15.0691C10.8972 16.1006 12.2234 17.6006 13.2412 18.6183C14.2726 19.6497 15.8926 21.096 16.924 21.8726C17.8212 22.5423 18.96 22.6097 19.884 21.6851L21.0623 20.5068C21.4777 20.0914 21.9332 20.1183 22.348 20.3863L26.2452 22.9846C26.6474 23.252 26.808 23.5868 26.808 23.9891C26.808 24.3777 26.6206 24.8063 26.2594 25.2074C26.1965 25.2955 26.1293 25.3805 26.0583 25.4623C25.1343 26.5068 23.8617 27.0154 22.3886 27.0423Z\" fill=\"currentColor\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "position": "relative",
    "fontFamily": "Montserrat, sans-serif"
  },
  "voile": {
    "backgroundColor": "#26282CB8",
    "position": "absolute",
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0"
  },
  "tiroir": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "backgroundColor": "#26282C"
  },
  "barre": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between",
    "paddingInline": "24px",
    "paddingBlock": "16px"
  },
  "actions": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "16px",
    "color": "#FFFFFF"
  },
  "fermer": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "center",
    "width": "44px",
    "height": "44px"
  },
  "croix": {
    "display": "flex",
    "width": "24px",
    "height": "24px",
    "position": "relative"
  },
  "glyphe": {
    "display": "inline-flex",
    "flexShrink": 0,
    "position": "absolute",
    "left": "4.293000221252441px",
    "top": "4.293000221252441px",
    "color": "#FFFFFF"
  },
  "nav": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "flex": "1 1 auto",
    "minWidth": 0,
    "paddingInline": "24px",
    "paddingTop": "24px"
  },
  "pied": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "paddingInline": "24px",
    "paddingTop": "24px",
    "paddingBottom": "32px",
    "gap": "24px"
  },
  "telephone": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "12px"
  },
  "icone": {
    "display": "inline-flex",
    "flexShrink": 0,
    "color": "#F98A0B"
  },
  "numero": {
    "color": "#FFFFFF",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "16px",
    "fontWeight": 500,
    "lineHeight": "16px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "presentation-tablette:root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "stretch",
    "justifyContent": "flex-end",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-tablette:tiroir": {
    "width": "420px"
  },
  "presentation-tablette:barre": {
    "paddingInline": "48px",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "flex-end"
  },
  "presentation-tablette:nav": {
    "paddingTop": "8px"
  }
};

export interface MenuMobileProps extends HTMLAttributes<HTMLDivElement> {
  /** Deux étages seulement : le menu n'existe pas en Desktop ni en Wide (la nav est dans la barre). Côté Odoo la valeur n'est jamais posée : responsive/menu-mobile.pqr.css réécrit les règles par mode en @media. */
  presentation?: 'mobile' | 'tablette';
  /** Les entrées du menu — code-only par construction (arrayOf ⇔ figma NONE). Même donnée que ds.header.items, côté Odoo la boucle sur website.menu. Limite nommée : une liste dans une liste ne se porte pas (au plus deux sous-entrées par entrée dans le dessin ; la liste réelle vient du menu du client). */
  items?: Array<{ libelle: string; href: string; chevron: boolean; sousEntree1: string; sousEntree2: string; deuxSousEntrees: boolean }>;
}

/** Le menu ouvert du header en Mobile et Tablette (vague 031, décision owner 2026-09-04 : piste A plein écran en Mobile, piste B tiroir en Tablette). Extrait du set 031 `MenuMobile` 2738:13621 (journal specs/tiny/vague-031/menu-mobile.md). Composant SÉPARÉ du header : « ouvert » n'est pas une prop de ds.header — l'ouverture est une interaction (prototype Figma, offcanvas natif côté Odoo), doctrine de la matrice §9 et des contrats de nav de l'archive. Anatomie commune aux deux variantes : root (l'écran) > voile (Tablette seule, color.noir-bleute-72) + tiroir (Mobile : toute la largeur ; Tablette : size.menu-mobile.tiroir = 420 ancré à droite) > barre (logo en Mobile, icônes compte et panier, croix 44) · nav (répétition de ds.menu-entree) · pied (téléphone + Contactez-nous, zone du pouce). La hauteur de l'écran (844 / 1194 sur le set) n'est pas portée : côté Odoo le panneau prend la hauteur de la fenêtre (fait code-only nommé). Motion, code-only : ouverture en fondu 280 ms ease-out avec montée des entrées décalées de 40 ms en Mobile, glissement depuis la droite 300 ms + fondu du voile en Tablette ; fermeture 180 / 200 ms ease-in ; opacité et transform seulement. 1.1.0 (2026-09-16, GO owner sur la planche 031 · 28, même décision que ds.header 3.1.0) : les icônes Utilisateur et Panier quittent la barre (la croix reste seule), le bouton « Contactez-nous » quitte le pied (le téléphone reste) — « Boutique » et « Contact » sont des entrées du menu comme les autres (`MenuEntree` répété, contenu depuis le menu Odoo). Ancres inchangées, aucun prop retiré : MINEUR. */
export const MenuMobile = forwardRef<HTMLDivElement, MenuMobileProps>(function MenuMobile(
  { presentation = 'mobile', items, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }}  {...rest}>
      {presentation === 'tablette' ? (<div style={{ ...S.voile }}>

</div>) : null}
<div style={{ ...S.tiroir, ...(V[`presentation-${presentation}:tiroir`] ?? {}) }}>
<div style={{ ...S.barre, ...(V[`presentation-${presentation}:barre`] ?? {}) }}>
{presentation === 'mobile' ? (<PiquerayLogo couleur="blanc" />) : null}
<div style={{ ...S.actions }}>
<div style={{ ...S.fermer }}>
<div style={{ ...S.croix }}>
<span style={{ ...S.glyphe }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["menu-mobile-croix"] }} />
</div>
</div>
</div>
</div>
<div style={{ ...S.nav, ...(V[`presentation-${presentation}:nav`] ?? {}) }}>
<MenuEntree etat="ferme" libelle="Portes de garage" href="/portes-de-garage" chevron sousEntree1="Portes résidentielles" sousEntree2="Portes industrielles" deuxSousEntrees />
<MenuEntree etat="ferme" libelle="Portes d’entrée" href="/portes-entree" chevron sousEntree1="Motorisation" sousEntree2="" />
<MenuEntree etat="ferme" libelle="Dépannage/SAV" href="/depannage-sav" sousEntree1="" sousEntree2="" />
<MenuEntree etat="ferme" libelle="À propos" href="/a-propos" sousEntree1="" sousEntree2="" />
</div>
<div style={{ ...S.pied }}>
<div style={{ ...S.telephone }}>
<span style={{ ...S.icone }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["phone"] }} />
<span style={{ ...S.numero }}>+32 (0)87 46 32 66</span>
</div>
</div>
</div>
    </div>
  );
});
