/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/carousel-controls.contract.json (ds.carousel-controls v1.1.0)
 * Emitted by core/emit-react-inline.ts — the zero-infrastructure output:
 * every token reference was RESOLVED to its literal value from the design
 * tokens at emit time. Resolution mode: light (brand: default). To retheme,
 * re-emit against different tokens — do not edit literals by hand.
 * Fidelity: :hover/:focus-visible state tokens are not expressible as inline
 * styles and are omitted; ROOT disabled-state tokens apply via the disabled
 * prop; PART-level state overrides (Part.states, v13) are omitted — the same
 * declared limit as the hover states (state-selected descendant styling).
 */
import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import { Button } from './Button';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "flex-start",
    "border": 0,
    "gap": "8px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface CarouselControlsProps extends HTMLAttributes<HTMLElement> {

}

/** Piqueray CarouselControls. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Navigation semantics are a code decision; click callbacks remain a documented consumer boundary. 1.1.0 (2026-09-04, vague 031) : le master DS 2077:2191 était en SPACE_BETWEEN avec un itemSpacing de 0 — la dixième occurrence du défaut de source E-031-023, où l'alignement réparti annule silencieusement l'écart. Corrigé À LA SOURCE (§VIII) : alignement au début, écart 8, largeur 104 → 112 ; les quinze instances du fichier sont désormais uniformes, version nommée dans l'historique Figma. Le contrat suit la source réparée : sans cet écart les deux boutons de navigation étaient collés partout où le composant est rendu hors Figma. */
export const CarouselControls = forwardRef<HTMLElement, CarouselControlsProps>(function CarouselControls(
  { style, children, ...rest },
  ref,
) {
  return (
    <nav ref={ref} style={{ ...S.root, ...style }}  aria-label="Navigation du carrousel" {...rest}>
      <Button iconLeftGlyph="chevron-left" iconRight={false} iconLeft={false} variant="iconOnly">Précédent</Button>
<Button iconLeftGlyph="chevron-right" iconRight={false} iconLeft={false} variant="iconOnly">Suivant</Button>
    </nav>
  );
});
