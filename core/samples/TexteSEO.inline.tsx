/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/texte-seo.contract.json (ds.texte-seo v4.0.0)
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
import { AccordionRow } from './AccordionRow';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "32px",
    "paddingInline": "24px"
  },
  "Titre": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "24px",
    "fontWeight": 600,
    "lineHeight": "30px"
  },
  "p": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0
  },
  "Paragraphe": {
    "width": "100%",
    "minWidth": 0,
    "color": "#37373B",
    "fontSize": "16px",
    "fontWeight": 400,
    "lineHeight": "24px"
  },
  "h3": {
    "display": "flex",
    "flexDirection": "row",
    "width": "100%",
    "minWidth": 0
  },
  "SousTitre": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "20px",
    "fontWeight": 500,
    "lineHeight": "25px"
  },
  "accordion": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "width": "100%",
    "minWidth": 0
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "presentation-tablette:root": {
    "paddingInline": "48px"
  },
  "presentation-desktop:root": {
    "paddingInline": "56px"
  },
  "presentation-wide:root": {
    "paddingInline": "89px"
  }
};

export interface TexteSEOProps extends HTMLAttributes<HTMLDivElement> {
  /** Viewport presentation, mirroring the canvas axis Presentation of the candidate set. Default = mobile, the first variant (Figma's default) and the mobile-first base of the delivered CSS; in the delivered CSS the mode is selected by the viewport through the breakpoint tokens, never by a consumer. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Section title, bound to the set's TEXT property « Titre ». Kept RICH (marks.strong) as in 3.0.0 so the writer may still bold a range; the candidate draws it UNIFORM SemiBold (dump: fontStyle SemiBold on the whole node, no bold segment) so the default carries no bold segment — 3.0.0's « showroom à Pepinster » in bold came from the old master, not from the candidate. */
  titre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** The long paragraph, RICH: six bold ranges drawn on every variant of the candidate (owner rule 2026-09-02: a text with bold is rich). The candidate set exposes NO text property for it on purpose (owner decision 2026-09-02: a rich text is bound NONE, the canvas keeps its ranges by hand). 3.0.0 carried it as a static part text with no bold: it is now a governed prop so the Odoo writer edits it as rich text. The default is the candidate's own text, bold ranges as drawn — the spaces glued to the bold boundaries (« nos» + « portes de garage, motorisations » + «et» + « portes d'entrée») are the source's, reproduced as is. */
  texte?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** Sub-title above the rows, bound to the TEXT property « SousTitre » added on the candidate set (source defect n°1 of the audit, fixed on the candidate: the master had no property and the 9 instances overrode the text raw). Plain text, no bold, no line break. */
  sousTitre?: string;
  /** Les lignes d'accordéon. `etat` est observé par entrée sur le candidat (la 2e ligne est ouverte, les deux autres fermées) : le renseigner rend chaque ligne CONTRÔLÉE côté React — la géométrie est fidèle, mais une ligne ne se replie plus d'elle-même tant que le consommateur ne possède pas l'état (le canal `repeat` ne porte pas d'événement par entrée). Limite nommée, pas un oubli. */
  items?: Array<{ contenu: string; etat: 'ferme' | 'ouvert'; titre: string }>;
}

/** Piqueray TexteSEO, v2 (2026-09-07): anchored on the candidate set 2768:20428 (page 031, four variants Presentation=Mobile|Tablette|Desktop|Wide, cloned from the DS master 2108:3123 and reworked with the owner). MAJOR: the anchors leave the single COMPONENT master. What changes against 3.0.0: the viewport axis `presentation` (padding-inline 24/48/56/89 by mode, gap 32 everywhere), the title rides the DS H2 role (24/30 then 32/40 then 40/50, SemiBold — was 24/30 Regular), the paragraph rides the body role (16/24 Regular under 992, 18/27 Medium above — was 14/24 Regular) and becomes a governed rich-text prop `texte` (bold ranges kept), the sub-title rides the H4 role (20/25 then 24/30) and becomes the prop `sousTitre` bound to the new TEXT property `SousTitre`, and it wraps (FILL). The rows are ds.accordion-row 2.0.0 in Petit, unchanged. Named deviations against the dump are carried on each part's description. */
export const TexteSEO = forwardRef<HTMLDivElement, TexteSEOProps>(function TexteSEO(
  { presentation = 'mobile', sousTitre = 'Infos pratiques', titre = [{"text":"Visitez notre showroom à Pepinster ou contactez-nous"}], texte = [{"text":"Rien ne vaut le toucher et la vue pour choisir ses finitions. Notre "},{"text":"showroom","strong":true},{"text":" situé rue Alfred Drèze à "},{"text":"Pepinster","strong":true},{"text":" (proche de "},{"text":"Verviers","strong":true},{"text":") vous permet de découvrir en taille réelle nos"},{"text":" portes de garage, motorisations ","strong":true},{"text":"et"},{"text":" portes d'entrée","strong":true},{"text":". Vous pourrez y comparer les textures (Woodgrain, Silkgrain), les coloris et tester la robustesse des produits "},{"text":"Hörmann","strong":true},{"text":". Nos conseillers sont à votre disposition pour étudier vos plans et vous orienter vers la meilleure solution technique et budgétaire."}], items, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }}  {...rest}>
      <span style={{ ...S.Titre }}>{titre.map(({ text, strong, underline }, index) => { const inner = underline ? <u>{text}</u> : text; return strong ? <strong key={index} style={{ fontWeight: 700 }}>{inner}</strong> : <span key={index}>{inner}</span>; })}</span>
<div style={{ ...S.p }}>
<span style={{ ...S.Paragraphe }}>{texte.map(({ text, strong, underline }, index) => { const inner = underline ? <u>{text}</u> : text; return strong ? <strong key={index} style={{ fontWeight: 700 }}>{inner}</strong> : <span key={index}>{inner}</span>; })}</span>
</div>
<div style={{ ...S.h3 }}>
<span style={{ ...S.SousTitre }}>{sousTitre}</span>
</div>
<div style={{ ...S.accordion }}>
<AccordionRow taille="petit" contenu="Réponse" etat="ferme" titre="Accès et parking" />
<AccordionRow taille="petit" contenu="Pour une simple visite découverte, le showroom est ouvert aux horaires indiqués. Pour une étude approfondie de projet avec un conseiller, la prise de rendez-vous est conseillée." etat="ouvert" titre="Faut-il prendre rendez-vous ?" />
<AccordionRow taille="petit" contenu="Réponse" etat="ferme" titre="Zones de déplacement pour devis" />
</div>
    </div>
  );
});
