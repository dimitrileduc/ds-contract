/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/realisation.contract.json (ds.realisation v1.1.0)
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

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif"
  },
  "Image": {
    "width": "743px",
    "height": "743px",
    "objectFit": "cover"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "taille-petit:Image": {
    "width": "339.5px",
    "height": "339.5px"
  }
};

export interface RealisationProps extends HTMLAttributes<HTMLDivElement> {
  /** Observed Figma VARIANT `Taille`: Grand has a 743×743 image plane and Petit has a 339.5×339.5 image plane. This axis selects image geometry only; the visible IMAGE fill remains an instance override. */
  taille?: 'grand' | 'petit';
  /** Code-supplied URL for the visible IMAGE fill at either selected size. Figma stores the 27 observed photos as instance fill overrides (3 Grand and 24 Petit), not as a component property; the empty runtime default is intentional and does not substitute an image. */
  imageUrl?: string;
  /** Code-supplied text alternative paired with imageUrl for either selected size. Figma IMAGE fills expose no corresponding alt component property, so the empty runtime default is intentional. */
  imageAlt?: string;
}

/** Piqueray Realisation. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. Figma IMAGE FILL maps to object-fit: cover; IMAGE fills are instance overrides in Figma and src/alt are explicit code semantics. */
export const Realisation = forwardRef<HTMLDivElement, RealisationProps>(function Realisation(
  { taille = 'grand', imageUrl = '', imageAlt = '', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <img style={{ ...S.Image, ...(V[`taille-${taille}:Image`] ?? {}) }} src={String(imageUrl)} alt={String(imageAlt)}>

</img>
    </div>
  );
});
