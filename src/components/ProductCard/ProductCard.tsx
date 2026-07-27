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
  bouton?: boolean;
}

/** Piqueray ProductCard. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(function ProductCard(
  {
    bouton = false,
    titre = 'Télécommande Hörmann HSE4-868BS',
    prix = '74,99€',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} data-bouton={bouton || undefined} {...rest}>
      <div className={styles.Image}></div>
      <span className={styles.Titre}>{titre}</span>
      <span className={styles.Prix}>{prix}</span>
      <Button>Contactez-nous</Button>
    </div>
  );
});
