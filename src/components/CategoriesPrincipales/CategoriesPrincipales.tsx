/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/categories-principales.contract.json (ds.categories-principales v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { CarteCategorie } from '../CarteCategorie';
import styles from './CategoriesPrincipales.module.css';

export interface CategoriesPrincipalesProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
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
export const CategoriesPrincipales = forwardRef<HTMLDivElement, CategoriesPrincipalesProps>(
  function CategoriesPrincipales(
    { style = 'superpose', colonnes = '2', cartes, className, children, ...rest },
    ref,
  ) {
    const classes = [
      styles.root,
      styles[`style-${style}`],
      styles[`colonnes-${colonnes}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
        {cartes?.map((item, index) => (
          <CarteCategorie key={index} style={style} titre={item.titre} texte={item.texte} />
        ))}
      </div>
    );
  },
);
