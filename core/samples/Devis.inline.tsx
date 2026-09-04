/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/devis.contract.json (ds.devis v2.1.0)
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
    "justifyContent": "center",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "backgroundColor": "#000000",
    "paddingInline": "0px",
    "paddingBlock": "0px",
    "gap": "0px",
    "height": "496px",
    "position": "relative"
  },
  "Background": {
    "position": "absolute",
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0",
    "objectFit": "cover",
    "zIndex": "0"
  },
  "Voile": {
    "backgroundImage": "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.1) 4.1667%, rgba(0,0,0,0.1) 8.3333%, rgba(0,0,0,0.126) 12.5%, rgba(0,0,0,0.189) 16.6667%, rgba(0,0,0,0.278) 20.8333%, rgba(0,0,0,0.381) 25%, rgba(0,0,0,0.489) 29.1667%, rgba(0,0,0,0.589) 33.3333%, rgba(0,0,0,0.672) 37.5%, rgba(0,0,0,0.725) 41.6667%, rgba(0,0,0,0.74) 45.8333%, rgba(0,0,0,0.74) 50%, rgba(0,0,0,0.74) 54.1667%, rgba(0,0,0,0.74) 58.3333%, rgba(0,0,0,0.74) 62.5%, rgba(0,0,0,0.74) 66.6667%, rgba(0,0,0,0.74) 70.8333%, rgba(0,0,0,0.724) 75%, rgba(0,0,0,0.659) 79.1667%, rgba(0,0,0,0.561) 83.3333%, rgba(0,0,0,0.45) 87.5%, rgba(0,0,0,0.347) 91.6667%, rgba(0,0,0,0.27) 95.8333%, rgba(0,0,0,0.24) 100%)",
    "position": "absolute",
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0",
    "zIndex": "1",
    "pointerEvents": "none"
  },
  "Container": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "width": "100%",
    "minWidth": 0,
    "gap": "32px",
    "paddingInline": "24px",
    "paddingBlock": "0px",
    "position": "relative",
    "maxWidth": "900px",
    "zIndex": "2"
  },
  "Titre": {
    "width": "100%",
    "minWidth": 0,
    "color": "#FFFFFF",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "24px",
    "fontWeight": 600,
    "lineHeight": "30px",
    "textAlign": "center",
    "whiteSpace": "pre-line"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "presentation-tablette:root": {
    "height": "466px"
  },
  "presentation-tablette:Container": {
    "paddingInline": "48px"
  },
  "presentation-desktop:root": {
    "height": "358px"
  },
  "presentation-desktop:Voile": {
    "backgroundImage": "linear-gradient(to bottom, rgba(0,0,0,0.0743) 0%, rgba(0,0,0,0.0743) 4.1667%, rgba(0,0,0,0.0743) 8.3333%, rgba(0,0,0,0.0936) 12.5%, rgba(0,0,0,0.1405) 16.6667%, rgba(0,0,0,0.2066) 20.8333%, rgba(0,0,0,0.2832) 25%, rgba(0,0,0,0.3634) 29.1667%, rgba(0,0,0,0.4378) 33.3333%, rgba(0,0,0,0.4995) 37.5%, rgba(0,0,0,0.5389) 41.6667%, rgba(0,0,0,0.55) 45.8333%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.55) 54.1667%, rgba(0,0,0,0.55) 58.3333%, rgba(0,0,0,0.55) 62.5%, rgba(0,0,0,0.55) 66.6667%, rgba(0,0,0,0.55) 70.8333%, rgba(0,0,0,0.5381) 75%, rgba(0,0,0,0.4898) 79.1667%, rgba(0,0,0,0.417) 83.3333%, rgba(0,0,0,0.3345) 87.5%, rgba(0,0,0,0.2579) 91.6667%, rgba(0,0,0,0.2007) 95.8333%, rgba(0,0,0,0.1784) 100%)"
  },
  "presentation-desktop:Container": {
    "paddingInline": "0px"
  },
  "presentation-wide:root": {
    "height": "506px"
  },
  "presentation-wide:Voile": {
    "backgroundImage": "linear-gradient(to bottom, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0.07) 6%, rgba(0,0,0,0.0865) 8%, rgba(0,0,0,0.1306) 10%, rgba(0,0,0,0.1944) 12%, rgba(0,0,0,0.2702) 14%, rgba(0,0,0,0.3498) 16%, rgba(0,0,0,0.4256) 18%, rgba(0,0,0,0.4894) 20%, rgba(0,0,0,0.5335) 22%, rgba(0,0,0,0.55) 24%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.55) 76%, rgba(0,0,0,0.5341) 79%, rgba(0,0,0,0.4922) 82%, rgba(0,0,0,0.4329) 85%, rgba(0,0,0,0.365) 88%, rgba(0,0,0,0.2971) 91%, rgba(0,0,0,0.2378) 94%, rgba(0,0,0,0.1959) 97%, rgba(0,0,0,0.18) 100%)"
  },
  "presentation-wide:Container": {
    "paddingInline": "0px"
  }
};

export interface DevisProps extends HTMLAttributes<HTMLElement> {
  /** Axe de présentation du set 031. Le défaut est la première variante dessinée (Mobile) — la parité l'exige. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Titre du bandeau, texte riche. Le set 031 n'expose AUCUNE propriété TEXT (l'ancien master 2096:2524 exposait Titre) : la liaison figma est NONE — régression de source, nommée. Riche parce que le titre porte un SAUT DE LIGNE après « gratuit, » (règle owner 2026-09-02 : un saut de ligne est du texte riche, et un saut vaut pour tous les modes). Sur le canvas il n'est explicite que sur la variante Desktop (séparateur U+2028, relevé sur 2694:21563) ; Mobile et Tablette coupent naturellement ailleurs — écart de source à corriger dans Figma, comme la planche Tablette du hero l'a été. Le saut vit dans le contenu des pages ; la part déclare white-space pre-line. */
  titre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** URL fournie par le code pour le plan photo. Le set 031 range ces pixels dans une PEINTURE IMAGE du cadre Background (imageHash 7825ba2d393a21ddc6d94a7bfd05c1f3bde128aa, scaleMode FILL, sans imageTransform, identique dans les quatre variantes), jamais dans une propriété de composant : liaison NONE et défaut vide intentionnel — il ne substitue aucune image. Même provenance et même orthographe que sav.backgroundUrl. */
  backgroundUrl?: string;
  /** Alternative textuelle appariée à backgroundUrl. Une peinture IMAGE Figma n'expose aucune propriété d'alternative textuelle : le défaut vide est intentionnel (plan décoratif). */
  backgroundAlt?: string;
  /** Affiche les deux plans de fond du root (photo puis voile). Aucune propriété de composant Figma n'y correspond — les deux plans sont des CADRES ABSOLUS du master (contraintes STRETCH/STRETCH), pas une propriété : liaison NONE, défaut true (l'état du master). À false, les deux plans disparaissent et seul le background-color du root subsiste. */
  fond?: boolean;
}

/** Piqueray Devis responsive, adopté depuis le set 031 (2694:21604) — bandeau CTA pleine largeur : photo de fond, voile dégradé, titre H2 et un bouton Outline blanc, centrés. MAJEUR : les ancres Figma quittent l'ancien master 2096:2524 pour le set 031, et la prop presentation apparaît. Le set expose quatre variantes dessinées 390x496, 834x466, 1200x358 et 1728x506 ; le contrat porte ces hauteurs, le CSS Odoo en fait des min-height (Odoo force height:auto sur les sections sous 768). Les points de rupture restent une affaire de projection Odoo. Plan de document : la partie titre porte la balise h2 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau. */
export const Devis = forwardRef<HTMLElement, DevisProps>(function Devis(
  { presentation = 'mobile', fond = true, backgroundUrl = '', backgroundAlt = '', titre = [{"text":"Prenez rendez-vous pour un devis gratuit,\nnous nous déplaçons chez vous"}], style, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }} data-fond={fond || undefined}  {...rest}>
      {fond ? (<img style={{ ...S.Background }} src={String(backgroundUrl)} alt={String(backgroundAlt)}>

</img>) : null}
{fond ? (<div style={{ ...S.Voile, ...(V[`presentation-${presentation}:Voile`] ?? {}) }}>

</div>) : null}
<div style={{ ...S.Container, ...(V[`presentation-${presentation}:Container`] ?? {}) }}>
<h2 style={{ ...S.Titre }}>{titre.map(({ text, strong, underline }, index) => { const inner = underline ? <u>{text}</u> : text; return strong ? <strong key={index} style={{ fontWeight: 700 }}>{inner}</strong> : <span key={index}>{inner}</span>; })}</h2>
<Button variant="outlineBlanc" iconRight iconRightGlyph="arrow-right">Prendre rendez-vous</Button>
</div>
    </section>
  );
});
