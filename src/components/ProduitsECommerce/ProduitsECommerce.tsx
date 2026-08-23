/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/produits-ecommerce.contract.json (ds.produits-ecommerce v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import { ProductCard } from '../ProductCard';
import { CarouselControls } from '../CarouselControls';
import styles from './ProduitsECommerce.module.css';

export interface ProduitsECommerceProps extends HTMLAttributes<HTMLElement> {
  titre?: Array<{ text: string; strong?: boolean }>;
  /** Product cards shown by the source carousel. IMAGE overrides remain product-card runtime data; title and price are the bounded textual catalogue carried here. */
  produits?: Array<{ titre: string; prix: string }>;
}

/** Piqueray ProduitsECommerce. Canonical section promoted from the audited source master 2116:4475. It owns its 32/40 title and CTA; it never delegates a specialised hierarchy to SectionHeader. */
export const ProduitsECommerce = forwardRef<HTMLElement, ProduitsECommerceProps>(
  function ProduitsECommerce(
    {
      titre = [{ text: 'Découvrez nos produits disponibles en ligne' }],
      produits,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const classes = [styles.root, className].filter(Boolean).join(' ');
    return (
      <section ref={ref} className={classes} {...rest}>
        <span className={styles.Titre}>
          {titre.map((segment, index) =>
            segment.strong ? (
              <strong key={index}>{segment.text}</strong>
            ) : (
              <span key={index}>{segment.text}</span>
            ),
          )}
        </span>
        <Button variant="outlineNoir" iconLeft={false} iconRight>
          Voir les produits
        </Button>
        <div className={styles.Produits}>
          {produits?.map((item, index) => (
            <ProductCard key={index} titre={item.titre} prix={item.prix} />
          ))}
        </div>
        <CarouselControls />
      </section>
    );
  },
);
