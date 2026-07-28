/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/product-card.contract.json (ds.product-card v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './ProductCard.module.css';

export interface ProductCardProps extends HTMLAttributes<HTMLDivElement> {
  titre?: string;
  prix?: string;
  imageUrl?: string;
  imageAlt?: string;
  bouton?: boolean;
}

/** Piqueray ProductCard. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Product image URL/alt are code semantics because Figma supplies IMAGE fills through instance overrides. */
export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(function ProductCard(
  {
    bouton = false,
    titre = 'Télécommande Hörmann HSE4-868BS',
    prix = '74,99€',
    imageUrl = '',
    imageAlt = '',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} data-bouton={bouton || undefined} {...rest}>
      <img className={styles.Image} src={String(imageUrl)} alt={String(imageAlt)}></img>
      <span className={styles.Titre}>{titre}</span>
      <span className={styles.Prix}>{prix}</span>
      {bouton ? (
        <Button variant="default" iconLeft iconLeftGlyph="cart">
          Ajouter au panier
        </Button>
      ) : null}
    </div>
  );
});
