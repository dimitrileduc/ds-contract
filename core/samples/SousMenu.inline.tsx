/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/sous-menu.contract.json (ds.sous-menu v1.0.0)
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
import { SousEntree } from './SousEntree';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "borderStyle": "solid",
    "backgroundColor": "#26282C",
    "borderColor": "#FFFFFF24",
    "borderWidth": "1px",
    "paddingInline": "32px",
    "paddingBlock": "24px"
  },
  "sousEntrees": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "stretch",
    "gap": "22px"
  },
  "rail": {
    "backgroundColor": "#F98A0B",
    "width": "2px"
  },
  "liste": {
    "display": "flex",
    "flexDirection": "column",
    "gap": "4px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface SousMenuProps extends HTMLAttributes<HTMLDivElement> {
  /** Les sous-entrées — code-only par construction (arrayOf ⇔ figma NONE). Côté Odoo la boucle sur `submenu.child_id` ; l'état actif de chaque rangée est posé par Odoo (`_is_active()`), pas par la donnée. */
  items?: Array<{ libelle: string; href: string }>;
}

/** Le sous-menu desktop/wide d'une entrée de la barre (option A « Rail », retenue par l'owner le 2026-09-08 sur la planche 031 · 22). Extrait du set 031 `SousMenu` 2793:49493 (journal specs/tiny/vague-031/sous-menu.md). Panneau noir-bleuté, filet color.blanc-14 (border-width.1), padding 24 / 32 ; à l'intérieur un rail orange (largeur size.nav-item.soulignement) et la liste des sous-entrées (répétition de ds.sous-entree, écart space.4, retrait space.22 = le menu mobile). Trois sous-entrées dessinées ; la liste réelle vient de website.menu (`items`, code-only). Faits code-only, portés par Odoo et nommés ici : le panneau se pose SOUS la barre (position absolue, haut = bas de la barre), son texte aligné sur le libellé du parent (gauche = libellé − 56 : padding 32 + rail 2 + retrait 22) ; il s'ouvre au CLIC sur le parent (pattern disclosure : bouton aria-expanded, Échap et clic dehors ferment, pas de role=menu) ; le parent ouvert prend le libellé orange et le chevron retourné (fait code-only sur ds.nav-item, non dessiné dans ce set). Aucun axe de présentation : Desktop et Wide dessinent le même panneau ; sous 992 la barre n'a pas de nav (menu mobile). */
export const SousMenu = forwardRef<HTMLDivElement, SousMenuProps>(function SousMenu(
  { items, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <div style={{ ...S.sousEntrees }}>
<div style={{ ...S.rail }}>

</div>
<div style={{ ...S.liste }}>
<SousEntree etat="repos" libelle="Portes résidentielles" href="/portes-residentielles" />
<SousEntree etat="repos" libelle="Portes industrielles" href="/portes-industrielles" />
<SousEntree etat="repos" libelle="Motorisation" href="/motorisation" />
</div>
</div>
    </div>
  );
});
