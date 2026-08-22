/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/devis.contract.json (ds.devis v1.2.0)
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
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "backgroundColor": "#000000",
    "fontFamily": "Montserrat, sans-serif",
    "paddingTop": "96px",
    "paddingBottom": "96px",
    "position": "relative"
  },
  "Background": {
    "position": "absolute",
    "objectFit": "cover"
  },
  "Voile": {
    "backgroundColor": "#0000004D",
    "position": "absolute"
  },
  "Container": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "gap": "32px",
    "position": "relative"
  },
  "Titre": {
    "color": "#FFFFFF",
    "fontSize": "40px",
    "fontWeight": 400,
    "width": "900px",
    "lineHeight": "50px",
    "textAlign": "center"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface DevisProps extends HTMLAttributes<HTMLDivElement> {
  titre?: string;
  /** URL fournie par le code pour la peinture IMAGE pleine largeur du root (fills[0], scaleMode FILL, imageRef 7825ba2d393a21ddc6d94a7bfd05c1f3bde128aa). Figma range ces pixels dans une PEINTURE du master, jamais dans une propriété de composant : la liaison figma est donc NONE et le défaut vide est intentionnel — il ne substitue aucune image. Même provenance et même orthographe que sav.backgroundUrl. */
  backgroundUrl?: string;
  /** Alternative textuelle appariée à backgroundUrl. Une peinture IMAGE Figma n'expose aucune propriété d'alternative textuelle : le défaut vide est intentionnel (plan décoratif). */
  backgroundAlt?: string;
  /** Affiche les deux plans de fond du root (photo puis voile). Aucune propriété de composant Figma n'y correspond — les deux peintures vivent sur le root du master, pas sur une propriété : liaison NONE, défaut true (l'état du master). Ce booléen est AUSSI le seul porteur possible des insets des deux plans : la grammaire n'expose `top/right/bottom/left` que dans `stylesWhen` (STYLES_WHEN_ALLOWED), qui exige une prop conditionnante — précédents dans le dépôt : nav-item `Soulignement` conditionné par `actif`, member-picture (deux plans photo) conditionnés par `etat`. À false, les deux plans disparaissent et seul le `background-color` du root subsiste. */
  fond?: boolean;
}

/** Piqueray Devis. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Devis = forwardRef<HTMLDivElement, DevisProps>(function Devis(
  { fond = true, titre = 'Prenez rendez-vous pour un devis gratuit, nous nous déplaçons chez vous', backgroundUrl = '', backgroundAlt = '', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} data-fond={fond || undefined}  {...rest}>
      {fond ? (<img style={{ ...S.Background, ...(fond ? {"top":"0px","right":"0px","bottom":"0px","left":"0px"} : {}) }} src={String(backgroundUrl)} alt={String(backgroundAlt)}>

</img>) : null}
{fond ? (<div style={{ ...S.Voile, ...(fond ? {"top":"0px","right":"0px","bottom":"0px","left":"0px"} : {}) }}>

</div>) : null}
<div style={{ ...S.Container }}>
<span style={{ ...S.Titre }}>{titre}</span>
<Button variant="outlineBlanc" iconRight>Prendre rendez-vous</Button>
</div>
    </div>
  );
});
