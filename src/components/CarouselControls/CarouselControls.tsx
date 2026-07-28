/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carousel-controls.contract.json (ds.carousel-controls v1.0.2)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './CarouselControls.module.css';

export interface CarouselControlsProps extends HTMLAttributes<HTMLElement> {}

/** Piqueray CarouselControls. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Navigation semantics are a code decision; click callbacks remain a documented consumer boundary. */
export const CarouselControls = forwardRef<HTMLElement, CarouselControlsProps>(
  function CarouselControls({ className, children, ...rest }, ref) {
    const classes = [styles.root, className].filter(Boolean).join(' ');
    return (
      <nav ref={ref} className={classes} aria-label="Navigation du carrousel" {...rest}>
        <Button iconLeftGlyph="chevron-left" variant="iconOnly">
          Précédent
        </Button>
        <Button iconLeftGlyph="chevron-right" variant="iconOnly">
          Suivant
        </Button>
      </nav>
    );
  },
);
