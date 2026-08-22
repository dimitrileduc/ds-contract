/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/categories-principales.contract.json (ds.categories-principales v1.0.0)
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
import { CarteCategorie } from './CarteCategorie';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "grid",
    "gridTemplateColumns": "repeat(2, minmax(0, 1fr))",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "gap": "64px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "colonnes-3:root": {
    "display": "grid",
    "gridTemplateColumns": "repeat(3, minmax(0, 1fr))"
  }
};

export interface CategoriesPrincipalesProps extends HTMLAttributes<HTMLDivElement> {
  /** Style des cartes, transmis à chaque carte répétée (component.props {style}). Verdict Odoo attendu : fixed-by-composition (pas un choix rédacteur cette itération). */
  style?: 'superpose' | 'empile';
  /** Nombre de colonnes de la grille — enum FERMÉ {2,3}, aucune autre valeur offrable. Porté par la section (extension E1 layoutByProp.columns sur la part grid) ; au-delà du compte de cartes, wrap natif sur la même grille. */
  colonnes?: '2' | '3';
  /** Collection de cartes-catégories. Champs `titre` et `texte` (plats — un arrayOf ne porte que text/number/boolean par le schéma). Le `sample` est relevé de la source (contenus réels des usages), jamais inventé. LIMITE : pas de champ `ctaType` par carte (voir description du contrat). */
  cartes?: Array<{ titre: string; texte: string }>;
}

/** Piqueray section « Catégories principales ». Extracted from the cleaned Figma COMPONENT_SET on DS · Organisms (2115:4277), reviewed at Gate A — not authored. A repeated collection of ds.carte-categorie in a governed grid, with a closed `colonnes` {2,3} enum. Le colonnage est un CHOIX DE DESIGN porté par la section (extension de schéma E1 `layoutByProp.columns`), jamais dérivé du nombre de cartes ; au-delà du compte, les cartes passent à la ligne sur la même grille (wrap natif). Le `style` est transmis à chaque carte répétée (composition), donc verdict Odoo `fixed-by-composition` — pas un choix rédacteur.

Nettoyage de source (Gate A/B, 2026-08-20) : l'axe menteur « Disposition » à 4 valeurs (qui mélangeait style de carte, nombre de colonnes et un contenu déguisé « Rdv ») est remplacé par deux axes orthogonaux Style × Colonnes. « Rdv » redevient une instance renseignée, plus jamais une variante.

Limite nommée : la prop `ctaType` de la carte n'est PAS transportée par item (les champs d'un `arrayOf` sont plats par le schéma) — toutes les cartes d'une section rendent le CTA par défaut de la molécule (lien). L'usage à CTA mixte (carte Maintenance à bouton encadré « Prendre rendez-vous ») est porté hors de cette composition (couche Odoo/usage) — nommé, pas contourné en silence. */
export const CategoriesPrincipales = forwardRef<HTMLDivElement, CategoriesPrincipalesProps>(function CategoriesPrincipales(
  { style = 'superpose', colonnes = '2', cartes, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`colonnes-${colonnes}:root`] ?? {}), ...style }}  {...rest}>
      <CarteCategorie style={style} titre="Pour portes de garage" texte="SupraMatic & ProMatic. Ouverture ultra-rapide et verrouillage mécanique anti-intrusion breveté." />
<CarteCategorie style={style} titre="Pour portails d'entrée" texte="RotaMatic (Battant) & LineaMatic (Coulissant). Fiabilité absolue et détection d'obstacles pour la sécurité de votre famille." />
    </div>
  );
});
