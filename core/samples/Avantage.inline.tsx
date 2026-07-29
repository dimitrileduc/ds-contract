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

const ICONS: Record<string, string> = {
  "piqueray": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M16 1.77761L5.71429 7.98341V24.0166L16 30.2224L26.2857 24.0166V7.98341L16 1.77761ZM23.2296 20.7622L17.0287 24.4992V21.7006L23.2296 17.9497V20.7622ZM23.2296 16.9444L17.0287 20.6901V17.8307L23.2296 14.0807V16.9444ZM23.2296 13.0755L17.0287 16.8194V14.085L23.2296 10.3359V13.0755ZM23.2296 9.32891L17.0287 13.0755L14.5285 11.3906L20.5636 7.61101L23.2296 9.32891ZM28 24.0166C27.9999 24.6495 27.6754 25.2348 27.1479 25.553L16.8622 31.7588C16.3292 32.0804 15.6708 32.0804 15.1378 31.7588L4.85212 25.553C4.32461 25.2348 4.00011 24.6495 4 24.0166V7.98341C4 7.35044 4.3246 6.76529 4.85212 6.44693L15.1378 0.241136C15.6707 -0.0803787 16.3293 -0.0803785 16.8622 0.241136L27.1479 6.44693C27.6754 6.76529 28 7.35044 28 7.98341V24.0166Z\" fill=\"currentColor\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-start",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "8px",
    "width": "759px",
    "height": "75px"
  },
  "Piqueray": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "text": {
    "display": "flex",
    "flexDirection": "column",
    "gap": "8px",
    "width": "687px"
  },
  "Titre": {
    "color": "#26282C",
    "fontSize": "32px",
    "fontWeight": 400,
    "lineHeight": "40px"
  },
  "Texte": {
    "color": "#26282C",
    "fontSize": "18px",
    "fontWeight": 400,
    "lineHeight": "27px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface AvantageProps extends HTMLAttributes<HTMLDivElement> {
  titre?: string;
  texte?: string;
}

/** Piqueray Avantage. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. */
export const Avantage = forwardRef<HTMLDivElement, AvantageProps>(function Avantage(
  { titre = 'Conseils personnalisés', texte = 'Devis gratuits effectués sur place, nous nous déplaçons chez vous', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <span style={{ ...S.Piqueray }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["piqueray"] }} />
<div style={{ ...S.text }}>
<span style={{ ...S.Titre }}>{titre}</span>
<span style={{ ...S.Texte }}>{texte}</span>
</div>
    </div>
  );
});
