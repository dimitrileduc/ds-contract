/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/produits-ecommerce.contract.json (ds.produits-ecommerce v2.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import { ProductCard } from '../ProductCard';
import { CarouselControls } from '../CarouselControls';
import styles from './ProduitsECommerce.module.css';

export interface ProduitsECommerceProps extends HTMLAttributes<HTMLDivElement> {
  /** L'étage responsive (axe Presentation du set 031). Défaut = première variante du set (mobile), la parité l'exige. Côté Odoo la valeur n'est jamais posée : responsive/produits-ecommerce.pqr.css réécrit les règles par mode en @media. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Titre de section, lié à la propriété TEXT « Titre » du set. La liaison a été POSÉE À LA SOURCE le 2026-09-04 (§VIII) : le set 031 n'exposait aucune propriété TEXT, le titre n'était qu'un texte dessiné et le contrat le portait en NONE. La propriété est maintenant définie sur le set et les quatre variantes y réfèrent leur nœud Titre. */
  titre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** La collection de produits — code-only par construction (arrayOf ⇔ figma NONE). Le canevas rend le `sample` du repeat : cinq entrées, l'union des cartes dessinées (Wide en montre cinq, les autres quatre). Côté Odoo la liste vient du descripteur de page. */
  produits?: Array<{ titre: string; prix: string }>;
}

/** Piqueray ProduitsECommerce, responsive (vague 031). 2.0.0 (2026-09-04) : les ancres passent de l'ancien master DS 2116:4475 (une variante) au set 031 `ProduitsECommerce` 2694:21337, quatre variantes Presentation — la seule section de la home restée hors de la vague, ce qui figeait ses cartes à 364 px à toutes les largeurs et faisait déborder la page horizontalement. La source a été nettoyée avant extraction (journal specs/tiny/vague-031/produits-ecommerce.md) : structure unifiée sur UN arbre pour les quatre variantes, Bouton et CarouselControls re-liés en instances, écart des contrôles rétabli (SPACE_BETWEEN annulait le gap — dixième occurrence). Deux formes selon l'écran, portées par présence et par layoutByProp : Mobile et Tablette montrent le titre seul puis le bouton pleine largeur en pied, contrôles masqués ; Desktop et Wide mettent le titre et le bouton sur une ligne et affichent les contrôles sous la piste. La piste est bornée par le cadre sous 992 et libre au-delà : elle déborde volontairement du cadre rognant, c'est le carrousel. Wide dessine cinq cartes, les autres quatre. Le mécanisme du carrousel est DIFFÉRÉ (décision owner 2026-09-04) : les contrôles sont inertes, le glissement au doigt viendra plus tard. Le 2026-09-04, la propriété TEXT « Titre » a été ajoutée au set et référencée par les quatre variantes : le titre est désormais une donnée liée, pas un texte dessiné. */
export const ProduitsECommerce = forwardRef<HTMLDivElement, ProduitsECommerceProps>(
  function ProduitsECommerce(
    {
      presentation = 'mobile',
      titre = [{ text: 'Découvrez nos produits disponibles en ligne' }],
      produits,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const classes = [styles.root, styles[`presentation-${presentation}`], className]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
        <div className={styles.enTete}>
          <span className={styles.Titre}>
            {titre.map((segment, index) => {
              const inner = segment.underline ? <u>{segment.text}</u> : segment.text;
              return segment.strong ? (
                <strong key={index}>{inner}</strong>
              ) : (
                <span key={index}>{inner}</span>
              );
            })}
          </span>
          {presentation === 'desktop' ? (
            <Button
              variant="outlineNoir"
              iconLeft={false}
              iconRight={false}
              iconLeftGlyph="arrow-left"
              iconRightGlyph="arrow-right"
            >
              Voir les produits
            </Button>
          ) : null}
          {presentation === 'wide' ? (
            <Button
              variant="outlineNoir"
              iconLeft={false}
              iconRight={false}
              iconLeftGlyph="arrow-left"
              iconRightGlyph="arrow-right"
            >
              Voir les produits
            </Button>
          ) : null}
        </div>
        <div className={styles.pisteEtControles}>
          <div className={styles.carrouselProduits}>
            <div className={styles.Produits}>
              {produits?.map((item, index) => (
                <ProductCard key={index} titre={item.titre} prix={item.prix} />
              ))}
            </div>
          </div>
          <div className={styles.controles}>
            <CarouselControls />
          </div>
        </div>
        <div className={styles.boutonConteneur}>
          <Button
            variant="outlineNoir"
            iconLeft={false}
            iconRight={false}
            iconLeftGlyph="arrow-left"
            iconRightGlyph="arrow-right"
          >
            Voir les produits
          </Button>
        </div>
      </div>
    );
  },
);
