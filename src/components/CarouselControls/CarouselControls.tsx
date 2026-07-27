/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carousel-controls.contract.json (ds.carousel-controls v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './CarouselControls.module.css';

export interface CarouselControlsProps extends HTMLAttributes<HTMLDivElement> {}

/** Piqueray CarouselControls. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const CarouselControls = forwardRef<HTMLDivElement, CarouselControlsProps>(
  function CarouselControls({ className, children, ...rest }, ref) {
    const classes = [styles.root, className].filter(Boolean).join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
        <Button>Contactez-nous</Button>
        <Button>Contactez-nous</Button>
      </div>
    );
  },
);
