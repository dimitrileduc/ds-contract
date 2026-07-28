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
  "chevron-down": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M7.29302 12.7071C6.90249 12.3166 6.90249 11.6836 7.29302 11.293C7.68354 10.9025 8.31655 10.9025 8.70708 11.293L16 18.586L23.293 11.293C23.6835 10.9025 24.3166 10.9025 24.7071 11.293C25.0976 11.6836 25.0976 12.3166 24.7071 12.7071L16.7071 20.7071C16.3166 21.0976 15.6835 21.0976 15.293 20.7071L7.29302 12.7071Z\" fill=\"currentColor\"/>\n</svg>",
  "chevron-up": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M7.29302 19.293C6.90249 19.6835 6.90249 20.3166 7.29302 20.7071C7.68354 21.0976 8.31655 21.0976 8.70708 20.7071L16 13.4141L23.293 20.7071C23.6835 21.0976 24.3166 21.0976 24.7071 20.7071C25.0976 20.3166 25.0976 19.6835 24.7071 19.293L16.7071 11.293C16.3166 10.9025 15.6835 10.9025 15.293 11.293L7.29302 19.293Z\" fill=\"currentColor\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "border": 0,
    "borderBottomWidth": "1px",
    "width": "1550px",
    "borderColor": "#000000",
    "gap": "24px",
    "paddingBlock": "16px"
  },
  "trigger": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between",
    "appearance": "none",
    "background": "none",
    "border": "none",
    "margin": 0,
    "padding": 0,
    "font": "inherit",
    "color": "inherit",
    "textAlign": "inherit",
    "cursor": "pointer",
    "height": "32px",
    "backgroundColor": "transparent",
    "borderWidth": "0px",
    "paddingInline": "0px",
    "paddingBlock": "0px"
  },
  "Titre": {
    "flex": "1 1 auto",
    "minWidth": 0,
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "20px",
    "fontWeight": 600,
    "lineHeight": "25px",
    "letterSpacing": "0px"
  },
  "ChevronDown": {
    "display": "inline-flex",
    "flexShrink": 0
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
    "lineHeight": "24px",
    "letterSpacing": "0px",
    "height": "32px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "taille-petit:root": {
    "borderColor": "#26282C52",
    "gap": "8px",
    "paddingBlock": "8px"
  },
  "taille-petit:trigger": {
    "height": "24px"
  },
  "taille-petit:Titre": {
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": "700",
    "lineHeight": "24px"
  },
  "taille-petit:ChevronDown": {
    "width": "24px",
    "height": "24px"
  },
  "taille-petit:ChevronUp": {
    "width": "24px",
    "height": "24px"
  },
  "taille-petit:Contenu": {
    "height": "24px"
  },
  "etat-ferme:root": {
    "gap": "24px"
  },
  "etat-ouvert:trigger": {
    "height": "32px"
  }
};

export interface AccordionRowProps extends HTMLAttributes<HTMLDivElement> {
  taille?: 'grand' | 'petit';
  /** Controlled when supplied; otherwise each AccordionRow instance toggles independently between fermé and ouvert. */
  etat?: 'ferme' | 'ouvert';
  titre: string;
  contenu: string;
  /** Fires when the native trigger button is activated; uncontrolled rows flip independently between fermé and ouvert. */
  onToggle?: () => void;
}

/** Piqueray AccordionRow. Visual and layout facts were extracted from the live Figma COMPONENT_SET on DS · Molécules after source cleanup; native button semantics, toggle behavior and ARIA association were added in reviewed code-side semantics behind evals. The live source intentionally keeps its documented Fermé/Ouvert structural asymmetry; the semantic trigger wrapper normalizes only the generated DOM while preserving the four measured geometries. */
export const AccordionRow = forwardRef<HTMLDivElement, AccordionRowProps>(function AccordionRow(
  { taille = 'grand', etat: etatProp, titre, contenu, onToggle, style, children, ...rest },
  ref,
) {
  const [etatUncontrolled, setEtatUncontrolled] = useState<'ferme' | 'ouvert'>('ferme');
  const etat = etatProp ?? etatUncontrolled;
  const handleToggle = () => { setEtatUncontrolled(etat === 'ouvert' ? 'ferme' : 'ouvert'); onToggle?.(); };
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`taille-${taille}:root`] ?? {}), ...(V[`etat-${etat}:root`] ?? {}), ...style }} {...rest}>
      <button style={{ ...S.trigger, ...(V[`taille-${taille}:trigger`] ?? {}), ...(V[`etat-${etat}:trigger`] ?? {}) }} type="button" onClick={handleToggle} aria-expanded={etat === 'ouvert'}>
<span style={{ ...S.Titre, ...(V[`taille-${taille}:Titre`] ?? {}) }}>{titre}</span>
{etat === 'ferme' ? (<span style={{ ...S.ChevronDown, ...(V[`taille-${taille}:ChevronDown`] ?? {}) }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["chevron-down"] }} />) : null}
{etat === 'ouvert' ? (<span style={{ ...S.ChevronUp, ...(V[`taille-${taille}:ChevronUp`] ?? {}) }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["chevron-up"] }} />) : null}
</button>
{etat === 'ouvert' ? (<div style={{ ...S.Contenu, ...(V[`taille-${taille}:Contenu`] ?? {}) }}>{contenu}</div>) : null}
    </div>
  );
});
