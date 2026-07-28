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
    "backgroundColor": "#FFFFFF",
    "fontFamily": "Montserrat, sans-serif",
    "gap": "24px",
    "paddingBottom": "24px",
    "borderRadius": "10px"
  },
  "img": {
    "height": "364px"
  },
  "text": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "gap": "8px",
    "paddingRight": "16px",
    "paddingLeft": "16px"
  },
  "Titre": {
    "color": "#26282C",
    "fontSize": "24px",
    "fontWeight": 400,
    "lineHeight": "30px"
  },
  "Texte": {
    "color": "#37373B",
    "fontSize": "14px",
    "fontWeight": 500,
    "lineHeight": "24px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "disposition-categorie:root": {
    "backgroundColor": "transparent",
    "gap": "32px",
    "paddingBottom": "0px",
    "borderRadius": "0px"
  },
  "disposition-categorie:text": {
    "gap": "16px",
    "paddingRight": "0px",
    "paddingLeft": "0px"
  },
  "disposition-categorie:Titre": {
    "fontSize": "32px",
    "fontWeight": 500,
    "lineHeight": "40px"
  },
  "disposition-categorie:Texte": {
    "color": "#26282C",
    "fontSize": "18px",
    "fontWeight": 400,
    "lineHeight": "27px"
  }
};

export interface CarteProps extends HTMLAttributes<HTMLDivElement> {
  disposition?: 'reassurance' | 'categorie';
  titre?: string;
  imageUrl?: string;
  imageAlt?: string;
  texte?: string;
}

/** Piqueray Carte. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const Carte = forwardRef<HTMLDivElement, CarteProps>(function Carte(
  { disposition = 'reassurance', titre = 'Pour portes de garage', imageUrl = '', imageAlt = '', texte = 'SupraMatic & ProMatic. Ouverture ultra-rapide et verrouillage mécanique anti-intrusion breveté.', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`disposition-${disposition}:root`] ?? {}), ...style }} {...rest}>
      <img style={{ ...S.img }} src={String(imageUrl)} alt={String(imageAlt)}>

</img>
<div style={{ ...S.text, ...(V[`disposition-${disposition}:text`] ?? {}) }}>
<span style={{ ...S.Titre, ...(V[`disposition-${disposition}:Titre`] ?? {}) }}>{titre}</span>
<span style={{ ...S.Texte, ...(V[`disposition-${disposition}:Texte`] ?? {}) }}>{texte}</span>
</div>
{disposition === 'categorie' ? (<Button>Contactez-nous</Button>) : null}
    </div>
  );
});
