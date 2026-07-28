/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/carte.contract.json (ds.carte v1.0.0)
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
    "alignItems": "stretch",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif"
  },
  "img": {},
  "text": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch"
  },
  "Titre": {
    "color": "#26282C"
  },
  "Texte": {
    "color": "#37373B"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "disposition-categorie:Texte": {
    "color": "#26282C"
  }
};

export interface CarteProps extends HTMLAttributes<HTMLDivElement> {
  disposition?: 'reassurance' | 'categorie';
  titre?: string;
  texte?: string;
}

/** Piqueray Carte. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const Carte = forwardRef<HTMLDivElement, CarteProps>(function Carte(
  { disposition = 'reassurance', titre = 'Pour portes de garage', texte = 'SupraMatic & ProMatic. Ouverture ultra-rapide et verrouillage mécanique anti-intrusion breveté.', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} {...rest}>
      <div style={{ ...S.img }}>

</div>
<div style={{ ...S.text }}>
<span style={{ ...S.Titre }}>{titre}</span>
<span style={{ ...S.Texte, ...(V[`disposition-${disposition}:Texte`] ?? {}) }}>{texte}</span>
</div>
<Button>Contactez-nous</Button>
    </div>
  );
});
