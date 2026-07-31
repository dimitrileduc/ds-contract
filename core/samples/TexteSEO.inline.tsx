/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/texte-seo.contract.json (ds.texte-seo v2.1.0)
 * Emitted by core/emit-react-inline.ts — the zero-infrastructure output:
 * every token reference was RESOLVED to its literal value from the design
 * tokens at emit time. Resolution mode: light (brand: default). To retheme,
 * re-emit against different tokens — do not edit literals by hand.
 * Fidelity: :hover/:focus-visible state tokens are not expressible as inline
 * styles and are omitted; ROOT disabled-state tokens apply via the disabled
 * prop; PART-level state overrides (Part.states, v13) are omitted — the same
 * declared limit as the hover states (state-selected descendant styling).
 * Fidelity: repeat collections render the contract's OBSERVED sample as fixed
 * instances (the array prop is declared but not mapped on this surface) — the
 * full React surface maps the live array.
 */
import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import { SectionHeader } from './SectionHeader';
import { AccordionRow } from './AccordionRow';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "32px",
    "paddingInline": "89px",
    "alignSelf": "stretch"
  },
  "h2": {
    "display": "flex"
  },
  "p": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch"
  },
  "Paragraphe": {
    "color": "#37373B",
    "fontSize": "14px",
    "lineHeight": "24px"
  },
  "h3": {
    "display": "flex"
  },
  "SousTitre": {
    "color": "#26282C",
    "fontSize": "20px",
    "fontWeight": 600,
    "lineHeight": "25px"
  },
  "accordion": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface TexteSEOProps extends HTMLAttributes<HTMLDivElement> {
  /** Les lignes d'accordéon. `etat` est observé par entrée sur le master Figma (la 2e ligne est ouverte, les deux autres fermées) : le renseigner rend chaque ligne CONTRÔLÉE côté React — la géométrie est fidèle, mais une ligne ne se replie plus d'elle-même tant que le consommateur ne possède pas l'état (le canal `repeat` ne porte pas d'événement par entrée). Limite nommée, pas un oubli. */
  items?: Array<{ contenu: string; etat: 'ferme' | 'ouvert'; titre: string }>;
}

/** Piqueray TexteSEO. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const TexteSEO = forwardRef<HTMLDivElement, TexteSEOProps>(function TexteSEO(
  { items, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <div style={{ ...S.h2 }}>
<SectionHeader titre={[{"text":"Visitez notre "},{"text":"showroom à Pepinster","strong":true},{"text":" ou contactez-nous"}]} accroche="Plus de 50 ans d’expérience" disposition="standard" accroche2={false} emphase="compact" alignement="gauche" />
</div>
<div style={{ ...S.p }}>
<span style={{ ...S.Paragraphe }}>Rien ne vaut le toucher et la vue pour choisir ses finitions. Notre showroom situé rue Alfred Drèze à Pepinster (proche de Verviers) vous permet de découvrir en taille réelle nos portes de garage, motorisations et portes d'entrée. Vous pourrez y comparer les textures (Woodgrain, Silkgrain), les coloris et tester la robustesse des produits Hörmann. Nos conseillers sont à votre disposition pour étudier vos plans et vous orienter vers la meilleure solution technique et budgétaire.</span>
</div>
<div style={{ ...S.h3 }}>
<span style={{ ...S.SousTitre }}>Infos pratiques</span>
</div>
<div style={{ ...S.accordion }}>
<AccordionRow taille="petit" contenu="Réponse" etat="ferme" titre="Accès et parking" />
<AccordionRow taille="petit" contenu="Pour une simple visite découverte, le showroom est ouvert aux horaires indiqués. Pour une étude approfondie de projet avec un conseiller, la prise de rendez-vous est conseillée." etat="ouvert" titre="Faut-il prendre rendez-vous ?" />
<AccordionRow taille="petit" contenu="Réponse" etat="ferme" titre="Zones de déplacement pour devis" />
</div>
    </div>
  );
});
