/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/menu-entree.contract.json (ds.menu-entree v1.0.0)
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
import type { CSSProperties, HTMLAttributes } from 'react';

const ICONS: Record<string, string> = {
  "chevron-up": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M7.29302 19.293C6.90249 19.6835 6.90249 20.3166 7.29302 20.7071C7.68354 21.0976 8.31655 21.0976 8.70708 20.7071L16 13.4141L23.293 20.7071C23.6835 21.0976 24.3166 21.0976 24.7071 20.7071C25.0976 20.3166 25.0976 19.6835 24.7071 19.293L16.7071 11.293C16.3166 10.9025 15.6835 10.9025 15.293 11.293L7.29302 19.293Z\" fill=\"currentColor\"/>\n</svg>",
  "chevron-down": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M7.29302 12.7071C6.90249 12.3166 6.90249 11.6836 7.29302 11.293C7.68354 10.9025 8.31655 10.9025 8.70708 11.293L16 18.586L23.293 11.293C23.6835 10.9025 24.3166 10.9025 24.7071 11.293C25.0976 11.6836 25.0976 12.3166 24.7071 12.7071L16.7071 20.7071C16.3166 21.0976 15.6835 21.0976 15.293 20.7071L7.29302 12.7071Z\" fill=\"currentColor\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "borderStyle": "solid",
    "fontFamily": "Montserrat, sans-serif",
    "borderBottomWidth": "1px",
    "borderColor": "#FFFFFF24"
  },
  "tete": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between",
    "paddingBlock": "12px",
    "gap": "8px",
    "minHeight": "68px"
  },
  "libelle": {
    "color": "#FFFFFF",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "24px",
    "fontWeight": 500,
    "lineHeight": "30px",
    "textTransform": "uppercase"
  },
  "chevronBox": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "center",
    "width": "44px",
    "height": "44px"
  },
  "chevronHaut": {
    "display": "inline-flex",
    "flexShrink": 0,
    "color": "#F98A0B"
  },
  "chevronBas": {
    "display": "inline-flex",
    "flexShrink": 0,
    "color": "#FFFFFF"
  },
  "sousEntrees": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "stretch",
    "gap": "22px",
    "paddingBottom": "24px"
  },
  "rail": {
    "backgroundColor": "#F98A0B",
    "width": "2px"
  },
  "liste": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "flex": "1 1 auto",
    "minWidth": 0,
    "gap": "4px"
  },
  "SousEntree1": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "minHeight": "44px"
  },
  "texte": {
    "color": "#FFFFFF",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "18px",
    "fontWeight": 400,
    "lineHeight": "27px"
  },
  "SousEntree2": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "minHeight": "44px"
  },
  "texte2": {
    "color": "#FFFFFF",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "18px",
    "fontWeight": 400,
    "lineHeight": "27px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "etat-ouvert:libelle": {
    "color": "#F98A0B"
  }
};

export interface MenuEntreeProps extends HTMLAttributes<HTMLDivElement> {
  /** Fermé (défaut) ou ouvert. Sur le canevas la première entrée du set MenuMobile est dessinée ouverte pour montrer les sous-entrées ; côté code toutes les entrées naissent fermées, l'ouverture est une interaction. */
  etat?: 'ferme' | 'ouvert';
  libelle?: string;
  /** Cible du lien — contenu, jamais dessiné (même règle que ds.nav-item). Côté Odoo la donnée vient de website.menu. */
  href?: string;
  /** L'entrée a des sous-entrées : chevron visible. Côté Odoo dérivé (l'entrée a des enfants). */
  chevron?: boolean;
  sousEntree1?: string;
  sousEntree2?: string;
  /** Deux sous-entrées dessinées (défaut) ou une seule. Limite nommée : le set dessine au plus deux sous-entrées ; côté Odoo la liste réelle vient de website.menu. */
  deuxSousEntrees?: boolean;
}

/** Une entrée du menu mobile ouvert (vague 031, décision owner 2026-09-04) : libellé en capitales, chevron sur une boîte tactile 44, et en état ouvert les sous-entrées le long d'un rail orange. Extrait du set 031 `MenuEntree` 2738:13482 (journal specs/tiny/vague-031/menu-mobile.md). L'état ouvert/fermé est une VARIANTE et une prop `etat`, sur le modèle d'AccordionRow : c'est un fait dessiné (chevron, couleur, sous-entrées visibles) ; le clic qui bascule l'état est la couche comportement (script Odoo, jamais le contrat). Typographie par typography.menu-entree et typography.menu-sous-entree (responsive : 24/30 en Mobile, 16/16 dès Tablette ; 18/27 puis 16/24). Filet bas color.blanc-14. Le lien de chaque entrée (`href`) est du contenu code-only, comme sur ds.nav-item. */
export const MenuEntree = forwardRef<HTMLDivElement, MenuEntreeProps>(function MenuEntree(
  { etat = 'ferme', chevron = true, deuxSousEntrees = true, libelle = 'Portes de garage', href = '/portes-de-garage', sousEntree1 = 'Portes résidentielles', sousEntree2 = 'Portes industrielles', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} data-chevron={chevron || undefined} data-deux-sous-entrees={deuxSousEntrees || undefined}  {...rest}>
      <div style={{ ...S.tete }}>
<span style={{ ...S.libelle, ...(V[`etat-${etat}:libelle`] ?? {}) }}>{libelle}</span>
{chevron ? (<div style={{ ...S.chevronBox }}>
{etat === 'ouvert' ? (<span style={{ ...S.chevronHaut }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["chevron-up"] }} />) : null}
{etat === 'ferme' ? (<span style={{ ...S.chevronBas }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["chevron-down"] }} />) : null}
</div>) : null}
</div>
{etat === 'ouvert' ? (<div style={{ ...S.sousEntrees }}>
<div style={{ ...S.rail }}>

</div>
<div style={{ ...S.liste }}>
<div style={{ ...S.SousEntree1 }}>
<span style={{ ...S.texte }}>{sousEntree1}</span>
</div>
{deuxSousEntrees ? (<div style={{ ...S.SousEntree2 }}>
<span style={{ ...S.texte2 }}>{sousEntree2}</span>
</div>) : null}
</div>
</div>) : null}
    </div>
  );
});
