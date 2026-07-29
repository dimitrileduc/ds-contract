/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/accordion-row.contract.json (ds.accordion-row v1.1.0)
 * Emitted by core/emit-react-inline.ts — the zero-infrastructure output:
 * every token reference was RESOLVED to its literal value from the design
 * tokens at emit time. Resolution mode: light (brand: default). To retheme,
 * re-emit against different tokens — do not edit literals by hand.
 * Fidelity: :hover/:focus-visible state tokens are not expressible as inline
 * styles and are omitted; ROOT disabled-state tokens apply via the disabled
 * prop; PART-level state overrides (Part.states, v13) are omitted — the same
 * declared limit as the hover states (state-selected descendant styling).
 */
import { forwardRef, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';

const ICONS: Record<string, string> = {
  "chevron-up": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M7.29302 19.293C6.90249 19.6835 6.90249 20.3166 7.29302 20.7071C7.68354 21.0976 8.31655 21.0976 8.70708 20.7071L16 13.4141L23.293 20.7071C23.6835 21.0976 24.3166 21.0976 24.7071 20.7071C25.0976 20.3166 25.0976 19.6835 24.7071 19.293L16.7071 11.293C16.3166 10.9025 15.6835 10.9025 15.293 11.293L7.29302 19.293Z\" fill=\"currentColor\"/>\n</svg>",
  "chevron-down": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M7.29302 12.7071C6.90249 12.3166 6.90249 11.6836 7.29302 11.293C7.68354 10.9025 8.31655 10.9025 8.70708 11.293L16 18.586L23.293 11.293C23.6835 10.9025 24.3166 10.9025 24.7071 11.293C25.0976 11.6836 25.0976 12.3166 24.7071 12.7071L16.7071 20.7071C16.3166 21.0976 15.6835 21.0976 15.293 20.7071L7.29302 12.7071Z\" fill=\"currentColor\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between",
    "border": 0,
    "borderBottomWidth": "1px",
    "borderColor": "#000000",
    "gap": "24px",
    "paddingBlock": "16px",
    "width": "1550px",
    "position": "relative"
  },
  "title": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between",
    "flex": "1 1 auto",
    "minWidth": 0,
    "height": "32px"
  },
  "TitreOuvert": {
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "20px",
    "fontWeight": 600,
    "letterSpacing": "0px",
    "lineHeight": "25px",
    "height": "32px"
  },
  "ChevronUp": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "Contenu": {
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": 400,
    "letterSpacing": "0px",
    "lineHeight": "24px",
    "height": "32px"
  },
  "Titre": {
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "20px",
    "fontWeight": 600,
    "letterSpacing": "0px",
    "lineHeight": "25px",
    "height": "32px"
  },
  "ChevronDown": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "trigger": {
    "appearance": "none",
    "background": "none",
    "border": "none",
    "margin": 0,
    "padding": 0,
    "font": "inherit",
    "color": "inherit",
    "textAlign": "inherit",
    "cursor": "pointer",
    "height": "64px",
    "backgroundColor": "transparent",
    "borderWidth": "0px",
    "paddingInline": "0px",
    "paddingBlock": "0px",
    "position": "absolute"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "taille-petit:root": {
    "borderColor": "#26282c52",
    "gap": "8px",
    "paddingBlock": "8px"
  },
  "taille-petit:TitreOuvert": {
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": "700",
    "lineHeight": "24px",
    "height": "24px"
  },
  "taille-petit:ChevronUp": {
    "width": "24px",
    "height": "24px"
  },
  "taille-petit:Contenu": {
    "height": "24px"
  },
  "taille-petit:Titre": {
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": "700",
    "lineHeight": "24px",
    "height": "24px"
  },
  "taille-petit:ChevronDown": {
    "width": "24px",
    "height": "24px"
  },
  "taille-petit:trigger": {
    "height": "40px"
  },
  "etat-ferme:root": {
    "gap": "24px"
  },
  "etat-ouvert:root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "justifyContent": "flex-start"
  }
};

export interface AccordionRowProps extends HTMLAttributes<HTMLDivElement> {
  taille?: 'grand' | 'petit';
  /** Controlled when supplied; otherwise toggles independently between fermé and ouvert. */
  etat?: 'ferme' | 'ouvert';
  titre: string;
  contenu: string;
  /** Activates the transparent native trigger projected over the Figma title row. */
  onToggle?: () => void;
}

/** Piqueray AccordionRow. Visual anatomy, layout, dimensions, typography, colors and visibility are adopted from the validated read-only Figma extraction. Native button, toggle and ARIA semantics are intentionally deferred to a separately proven semantic-wrapper capability. */
export const AccordionRow = forwardRef<HTMLDivElement, AccordionRowProps>(function AccordionRow(
  { taille = 'grand', etat: etatProp, titre, contenu, onToggle, style, children, ...rest },
  ref,
) {
  const [etatUncontrolled, setEtatUncontrolled] = useState<'ferme' | 'ouvert'>('ferme');
  const etat = etatProp ?? etatUncontrolled;
  const handleToggle = () => { setEtatUncontrolled(etat === 'ouvert' ? 'ferme' : 'ouvert'); onToggle?.(); };
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`taille-${taille}:root`] ?? {}), ...(V[`etat-${etat}:root`] ?? {}), ...style }}  {...rest}>
      {etat === 'ouvert' ? (<div style={{ ...S.title }}>
{etat === 'ouvert' ? (<span style={{ ...S.TitreOuvert, ...(V[`taille-${taille}:TitreOuvert`] ?? {}) }}>{titre}</span>) : null}
{etat === 'ouvert' ? (<span style={{ ...S.ChevronUp, ...(V[`taille-${taille}:ChevronUp`] ?? {}) }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["chevron-up"] }} />) : null}
</div>) : null}
{etat === 'ouvert' ? (<span style={{ ...S.Contenu, ...(V[`taille-${taille}:Contenu`] ?? {}) }}>{contenu}</span>) : null}
{etat === 'ferme' ? (<span style={{ ...S.Titre, ...(V[`taille-${taille}:Titre`] ?? {}) }}>{titre}</span>) : null}
{etat === 'ferme' ? (<span style={{ ...S.ChevronDown, ...(V[`taille-${taille}:ChevronDown`] ?? {}) }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["chevron-down"] }} />) : null}
<button style={{ ...S.trigger, ...(V[`taille-${taille}:trigger`] ?? {}), ...(taille === 'grand' ? {"left":"0px","right":"0px","top":"0px"} : {}), ...(taille === 'petit' ? {"left":"0px","right":"0px","top":"0px"} : {}) }} aria-label={String(titre)} type="button" onClick={handleToggle} aria-expanded={etat === 'ouvert'}>

</button>
    </div>
  );
});
