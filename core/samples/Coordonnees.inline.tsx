/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/coordonnees.contract.json (ds.coordonnees v1.0.0)
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
import { SectionHeader } from './SectionHeader';

const ICONS: Record<string, string> = {
  "facebook": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M15.9889 2.80987e-06C20.0465 -0.00240035 23.9535 1.53676 26.9192 4.30601C29.8849 7.07525 31.6878 10.8678 31.9631 14.916C32.2384 18.9643 30.9654 22.9659 28.4019 26.1111C25.8384 29.2563 22.1757 31.3102 18.1551 31.8571V20.346H22.2955L22.9476 16.1196H18.1551V13.8074C18.1551 12.1492 18.6652 10.667 20.0973 10.507L20.3614 10.493H22.9876V6.80267L22.4056 6.73066C21.8455 6.67066 20.9834 6.60265 19.7053 6.60265C15.9849 6.60265 13.7487 8.51484 13.6047 12.8493L13.5967 13.3053V16.1216H9.6383V20.348H13.5987V31.8291C9.60999 31.2224 5.99756 29.1317 3.48442 25.9754C0.971278 22.8192 -0.257161 18.8302 0.0449689 14.807C0.347098 10.7837 2.15751 7.023 5.11385 4.27748C8.07019 1.53195 11.9543 0.00420512 15.9889 2.80987e-06Z\" fill=\"currentColor\"/>\n</svg>",
  "instagram": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M9.28 0H22.72C27.84 0 32 4.16 32 9.28V22.72C32 25.1812 31.0223 27.5416 29.282 29.282C27.5416 31.0223 25.1812 32 22.72 32H9.28C4.16 32 0 27.84 0 22.72V9.28C0 6.81879 0.977712 4.45839 2.71805 2.71805C4.45839 0.977712 6.81879 0 9.28 0ZM8.96 3.2C7.43235 3.2 5.96727 3.80686 4.88707 4.88707C3.80686 5.96727 3.2 7.43235 3.2 8.96V23.04C3.2 26.224 5.776 28.8 8.96 28.8H23.04C24.5676 28.8 26.0327 28.1931 27.1129 27.1129C28.1931 26.0327 28.8 24.5676 28.8 23.04V8.96C28.8 5.776 26.224 3.2 23.04 3.2H8.96ZM24.4 5.6C24.9304 5.6 25.4391 5.81071 25.8142 6.18579C26.1893 6.56086 26.4 7.06957 26.4 7.6C26.4 8.13043 26.1893 8.63914 25.8142 9.01421C25.4391 9.38929 24.9304 9.6 24.4 9.6C23.8696 9.6 23.3609 9.38929 22.9858 9.01421C22.6107 8.63914 22.4 8.13043 22.4 7.6C22.4 7.06957 22.6107 6.56086 22.9858 6.18579C23.3609 5.81071 23.8696 5.6 24.4 5.6ZM16 8C18.1217 8 20.1566 8.84285 21.6569 10.3431C23.1571 11.8434 24 13.8783 24 16C24 18.1217 23.1571 20.1566 21.6569 21.6569C20.1566 23.1571 18.1217 24 16 24C13.8783 24 11.8434 23.1571 10.3431 21.6569C8.84285 20.1566 8 18.1217 8 16C8 13.8783 8.84285 11.8434 10.3431 10.3431C11.8434 8.84285 13.8783 8 16 8ZM16 11.2C14.727 11.2 13.5061 11.7057 12.6059 12.6059C11.7057 13.5061 11.2 14.727 11.2 16C11.2 17.273 11.7057 18.4939 12.6059 19.3941C13.5061 20.2943 14.727 20.8 16 20.8C17.273 20.8 18.4939 20.2943 19.3941 19.3941C20.2943 18.4939 20.8 17.273 20.8 16C20.8 14.727 20.2943 13.5061 19.3941 12.6059C18.4939 11.7057 17.273 11.2 16 11.2Z\" fill=\"currentColor\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "border": 0,
    "backgroundColor": "#F4F6FA",
    "fontFamily": "Montserrat, sans-serif"
  },
  "wrapper": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch"
  },
  "Adresse": {
    "display": "flex",
    "flexDirection": "column"
  },
  "AdresseEtiquette": {
    "color": "#F98A0B"
  },
  "AdresseValeur": {
    "color": "#26282C"
  },
  "Horaires": {
    "display": "flex",
    "flexDirection": "column"
  },
  "HorairesEtiquette": {
    "color": "#F98A0B"
  },
  "HorairesValeur": {
    "color": "#26282C"
  },
  "Contact": {
    "display": "flex",
    "flexDirection": "column"
  },
  "ContactEtiquette": {
    "color": "#F98A0B"
  },
  "tl32087463266EmailInfopi": {
    "color": "#26282C"
  },
  "suivezNous": {
    "display": "flex",
    "flexDirection": "column"
  },
  "SuivezNousEtiquette": {
    "color": "#F98A0B"
  },
  "rseauxSociaux": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "Facebook": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "Instagram": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "googleMap": {}
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface CoordonneesProps extends HTMLAttributes<HTMLDivElement> {
  /** Extracted from Figma "Accroche" TEXT property (added by sync pass). */
  accroche?: string;
  /** Extracted from Figma "Titre" TEXT property (added by sync pass). */
  titre?: string;
}

/** Piqueray Coordonnees. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Coordonnees = forwardRef<HTMLDivElement, CoordonneesProps>(function Coordonnees(
  { accroche = 'Contact', titre = 'Nos coordonnées', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <div style={{ ...S.wrapper }}>
<SectionHeader titre="Nos coordonnées" accroche="Contact" disposition="standard" />
<div style={{ ...S.Adresse }}>
<span style={{ ...S.AdresseEtiquette }}>Adresse</span>
<span style={{ ...S.AdresseValeur }}>Rue Alfred Drèze 7, 4860 Pepinster</span>
</div>
<div style={{ ...S.Horaires }}>
<span style={{ ...S.HorairesEtiquette }}>Horaires</span>
<span style={{ ...S.HorairesValeur }}>Du lundi au vendredi de 8h00 à 12h00 et de 13h30 à 17h00</span>
</div>
<div style={{ ...S.Contact }}>
<span style={{ ...S.ContactEtiquette }}>Contact</span>
<span style={{ ...S.tl32087463266EmailInfopi }}>Tél : +32 (0)87 46 32 66 Email: info@piqueray.be</span>
</div>
<div style={{ ...S.suivezNous }}>
<span style={{ ...S.SuivezNousEtiquette }}>Suivez-nous</span>
<div style={{ ...S.rseauxSociaux }}>
<span style={{ ...S.Facebook }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["facebook"] }} />
<span style={{ ...S.Instagram }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["instagram"] }} />
</div>
</div>
</div>
<div style={{ ...S.googleMap }}>

</div>
    </div>
  );
});
