/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/avantage.contract.json (ds.avantage v1.0.0)
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
import { PiquerayLogo } from './PiquerayLogo';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif"
  },
  "text": {
    "display": "flex",
    "flexDirection": "column"
  },
  "Titre": {
    "color": "#26282C"
  },
  "Texte": {
    "color": "#26282C"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface AvantageProps extends HTMLAttributes<HTMLDivElement> {
  titre?: string;
  texte?: string;
}

/** Piqueray Avantage. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const Avantage = forwardRef<HTMLDivElement, AvantageProps>(function Avantage(
  { titre = 'Conseils personnalisés', texte = 'Devis gratuits effectués sur place, nous nous déplaçons chez vous', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} {...rest}>
      <PiquerayLogo />
<div style={{ ...S.text }}>
<span style={{ ...S.Titre }}>{titre}</span>
<span style={{ ...S.Texte }}>{texte}</span>
</div>
    </div>
  );
});
