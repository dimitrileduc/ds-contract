/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carousel-controls.contract.json (ds.carousel-controls v1.1.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './CarouselControls.module.css';

export interface CarouselControlsProps extends HTMLAttributes<HTMLElement> {}

/** Piqueray CarouselControls. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Navigation semantics are a code decision; click callbacks remain a documented consumer boundary. 1.1.0 (2026-09-04, vague 031) : le master DS 2077:2191 était en SPACE_BETWEEN avec un itemSpacing de 0 — la dixième occurrence du défaut de source E-031-023, où l'alignement réparti annule silencieusement l'écart. Corrigé À LA SOURCE (§VIII) : alignement au début, écart 8, largeur 104 → 112 ; les quinze instances du fichier sont désormais uniformes, version nommée dans l'historique Figma. Le contrat suit la source réparée : sans cet écart les deux boutons de navigation étaient collés partout où le composant est rendu hors Figma. */
export const CarouselControls = forwardRef<HTMLElement, CarouselControlsProps>(
  function CarouselControls({ className, children, ...rest }, ref) {
    const classes = [styles.root, className].filter(Boolean).join(' ');
    return (
      <nav ref={ref} className={classes} aria-label="Navigation du carrousel" {...rest}>
        <Button iconLeftGlyph="chevron-left" iconRight={false} iconLeft={false} variant="iconOnly">
          Précédent
        </Button>
        <Button iconLeftGlyph="chevron-right" iconRight={false} iconLeft={false} variant="iconOnly">
          Suivant
        </Button>
      </nav>
    );
  },
);
