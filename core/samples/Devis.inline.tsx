/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/devis.contract.json (ds.devis v1.0.0)
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
    "flexDirection": "column",
    "alignItems": "center",
    "border": 0,
    "backgroundColor": "#26282C",
    "fontFamily": "Montserrat, sans-serif"
  },
  "Container": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center"
  },
  "Titre": {
    "color": "#FFFFFF"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface DevisProps extends HTMLAttributes<HTMLDivElement> {
  titre?: string;
}

/** Piqueray Devis. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Devis = forwardRef<HTMLDivElement, DevisProps>(function Devis(
  { titre = 'Prenez rendez-vous pour un devis gratuit, nous nous déplaçons chez vous', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <div style={{ ...S.Container }}>
<span style={{ ...S.Titre }}>{titre}</span>
<Button>Contactez-nous</Button>
</div>
    </div>
  );
});
