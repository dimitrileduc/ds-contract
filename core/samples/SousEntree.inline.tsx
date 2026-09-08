/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/sous-entree.contract.json (ds.sous-entree v1.0.0)
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

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "justifyContent": "center",
    "border": 0,
    "gap": "4px",
    "minHeight": "44px",
    "textDecorationLine": "none"
  },
  "texte": {
    "color": "#FFFFFF",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "18px",
    "fontWeight": 400,
    "lineHeight": "27px"
  },
  "Soulignement": {
    "backgroundColor": "#F98A0B",
    "height": "2px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "etat-actif:texte": {
    "color": "#F98A0B"
  }
};

export interface SousEntreeProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Repos (défaut) ou actif = page courante. Côté Odoo : `child._is_active()`. */
  etat?: 'repos' | 'actif';
  libelle?: string;
  /** Cible du lien — contenu, jamais dessiné (même règle que ds.nav-item). Côté Odoo la donnée vient de website.menu. */
  href?: string;
}

/** Une sous-entrée du sous-menu desktop/wide (option A retenue par l'owner le 2026-09-08). Extrait du set 031 `SousEntree` 2793:49492 (journal specs/tiny/vague-031/sous-menu.md). Un lien (`href` = contenu code-only, même règle que ds.nav-item), libellé au style « Sous-entrée menu » (typography.menu-sous-entree : 18/27 en Mobile, 16/24 dès Tablette — donc 16/24 là où ce panneau existe), rangée à la boîte tactile 44 (size.cible-tactile.min). Etat=Actif = page courante : libellé orange + Soulignement orange (hauteur size.nav-item.soulignement), comme NavItem.Actif ; côté Odoo l'état vient de website.menu._is_active(). Survol = libellé orange (canal d'états, non dessiné sur le set — pas de figmaStatePreviews) ; focus visible = anneau orange (border-width.2). Déviation nommée : sur le canevas le libellé est HUG et le Soulignement FILL ; le contrat porte align stretch sur la racine (boîte rendue identique, le soulignement prend la largeur du texte). Le dépliage du panneau est la couche comportement (Odoo), jamais le contrat. */
export const SousEntree = forwardRef<HTMLAnchorElement, SousEntreeProps>(function SousEntree(
  { etat = 'repos', libelle = 'Portes résidentielles', href = '/portes-residentielles', style, children, ...rest },
  ref,
) {
  return (
    <a ref={ref} style={{ ...S.root, ...style }}  href={String(href)} {...(({ "actif": { "aria-current": "page" } } as const)[etat as "actif"] ?? {})} {...rest}>
      <span style={{ ...S.texte, ...(V[`etat-${etat}:texte`] ?? {}) }}>{libelle}</span>
{etat === 'actif' ? (<div style={{ ...S.Soulignement }}>

</div>) : null}
    </a>
  );
});
