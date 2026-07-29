/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/product-card.contract.json (ds.product-card v1.1.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './ProductCard.module.css';

export interface ProductCardProps extends HTMLAttributes<HTMLDivElement> {
  titre?: string;
  prix?: string;
  /** Code-supplied product-image URL. Figma exposes the visible value as an IMAGE fill through an instance override, not as a component property; the empty runtime default is intentional and comparison assets are injected only by the campaign. */
  imageUrl?: string;
  /** Code-supplied text alternative paired with imageUrl. Figma has no corresponding component property, so the empty runtime default is intentional. */
  imageAlt?: string;
  /** The immutable ProductCard master observes BOOLEAN `Bouton` as false by default. */
  bouton?: boolean;
}

/** Piqueray ProductCard. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. The fixed 364px frame and full-width text planes are observed geometry; product image URL/alt are code semantics because Figma supplies IMAGE fills through instance overrides. */
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
