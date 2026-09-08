/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/select.contract.json (ds.select v2.0.0)
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
  "chevron-down": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M7.29302 12.7071C6.90249 12.3166 6.90249 11.6836 7.29302 11.293C7.68354 10.9025 8.31655 10.9025 8.70708 11.293L16 18.586L23.293 11.293C23.6835 10.9025 24.3166 10.9025 24.7071 11.293C25.0976 11.6836 25.0976 12.3166 24.7071 12.7071L16.7071 20.7071C16.3166 21.0976 15.6835 21.0976 15.293 20.7071L7.29302 12.7071Z\" fill=\"currentColor\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between",
    "borderStyle": "solid",
    "backgroundColor": "#FFFFFF",
    "borderColor": "#37373B",
    "borderWidth": "1px",
    "color": "#37373B",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "16px",
    "fontWeight": 400,
    "lineHeight": "24px",
    "paddingBlock": "12px",
    "paddingInline": "12px",
    "borderRadius": "0px"
  },
  "valeur": {},
  "chevron": {
    "display": "inline-flex",
    "flexShrink": 0
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface SelectProps extends HTMLAttributes<HTMLDivElement> {
  /** Valeur affichée (option sélectionnée). Vide au repos depuis 2.0.0. */
  value?: string;
  /** Nom du champ envoyé au serveur, posé sur le <select> réel. Code-only. */
  name?: string;
  /** Identifiant DOM du <select> réel, cible du htmlFor du libellé porté par Field. Code-only. */
  id?: string;
  /** Attribut natif required sur le <select> réel. Code-only. */
  required?: boolean;
  /** aria-describedby du <select> réel : identifiant du message d'erreur, unique par champ. Code-only. */
  describedBy?: string;
}

/** Liste déroulante Piqueray. Relevée sur le candidat v2 « Select · candidat v2 » de la planche 031·21 (2026-09-08 ; composant simple, sans axe State — l'anneau de focus étant code-only, un axe dessiné à la main serait un aperçu creux que la parité refuse), revue et adoptée — pas rédigée à la main.

Motif enveloppe conservé de 1.0.0 : la boîte est présentationnelle, un VRAI <select> natif à l'intérieur porte la valeur et l'accessibilité, le chevron gouverné (registre `chevron-down`, 24) est un frère — un <select> natif ne peut pas héberger un chevron dessiné. Le consommateur fournit les options.

MAJEUR 2.0.0, même passe qu'Input : ancres sur le candidat, bordure color.noir (3:1 exigés), texte 16 px, valeur par défaut vide, anneau de focus déclaré. LIMITE NOMMÉE : le focus se pose sur le <select> intérieur, pas sur la boîte ; le canal d'états d'une part non-racine n'accepte pas outline (color/background-color/border-color seulement), et :focus-within n'est pas un état du schéma. L'anneau du Select est donc un fait CODE-ONLY, à porter dans la feuille Odoo (`.select:focus-within`) et nommé ici. Les props name, id, required, describedBy sont code-only et se posent sur la part `valeur` (le contrôle réel). */
export const Select = forwardRef<HTMLDivElement, SelectProps>(function Select(
  { required = false, value = '', name = '', id = '', describedBy = '', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} data-required={required || undefined}  {...rest}>
      <select style={{ ...S.valeur }} name={(String(name) || undefined)} id={(String(id) || undefined)} aria-describedby={(String(describedBy) || undefined)} {...(({ "true": { "required": true } } as const)[String(required) as "true"] ?? {})}>{value}</select>
<span style={{ ...S.chevron }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["chevron-down"] }} />
    </div>
  );
});
