/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/realisations.contract.json (ds.realisations v1.0.1)
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
import { Realisation } from './Realisation';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "backgroundColor": "#F4F6FA",
    "paddingInline": "24px",
    "gap": "48px",
    "paddingBlock": "48px"
  },
  "EnTete": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": 0,
    "gap": "16px"
  },
  "SectionHeader": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": 0,
    "gap": "8px"
  },
  "Accroche": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": 400,
    "lineHeight": "20px",
    "letterSpacing": "0.15em",
    "textAlign": "center",
    "textTransform": "uppercase"
  },
  "Titre": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "24px",
    "fontWeight": 600,
    "lineHeight": "30px",
    "textAlign": "center"
  },
  "Texte": {
    "width": "100%",
    "minWidth": 0,
    "color": "#37373B",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": 400,
    "lineHeight": "24px",
    "textAlign": "left"
  },
  "Grille": {
    "display": "grid",
    "gridTemplateColumns": "repeat(2, minmax(0, 1fr))",
    "width": "100%",
    "minWidth": 0,
    "gap": "16px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "presentation-tablette:root": {
    "paddingInline": "48px",
    "paddingBlock": "64px"
  },
  "presentation-tablette:Grille": {
    "gap": "64px"
  },
  "presentation-desktop:root": {
    "paddingInline": "56px",
    "paddingBlock": "89px"
  },
  "presentation-desktop:EnTete": {
    "gap": "64px",
    "flexDirection": "row",
    "alignItems": "flex-end",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-desktop:Grille": {
    "gap": "64px",
    "display": "grid",
    "width": "100%",
    "minWidth": "0",
    "gridTemplateColumns": "repeat(4, minmax(0, 1fr))"
  },
  "presentation-wide:root": {
    "paddingInline": "89px",
    "paddingBlock": "128px"
  },
  "presentation-wide:EnTete": {
    "gap": "64px",
    "flexDirection": "row",
    "alignItems": "flex-end",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-wide:Grille": {
    "gap": "64px",
    "display": "grid",
    "width": "100%",
    "minWidth": "0",
    "gridTemplateColumns": "repeat(4, minmax(0, 1fr))"
  }
};

export interface RealisationsProps extends HTMLAttributes<HTMLElement> {
  /** Axe de présentation responsive du DS. Pose la gouttière (24 · 48 · 56 · 89), l'écart de l'en-tête, le nombre de colonnes de la mosaïque et l'écart de grille. Fixé par la composition côté Odoo, jamais offert au rédacteur. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Forme de l'en-tête, axe VARIANT Figma `En-tete`. `accroche` : le sur-titre et le titre seuls, centrés (page « Portes d'entrée »). `presentation` : le titre à gauche et un paragraphe à droite au-dessus de 992 (pages « Portes de garage » industrielles et résidentielles). */
  enTete?: 'accroche' | 'presentation';
  /** Sur-titre en capitales, visible dans la seule forme `accroche` (la forme `presentation` masque l'accroche du SectionHeader sur le canevas). Aucune propriété Figma ne le porte au niveau de la section : la liaison est NONE, le texte vit dans l'instance de SectionHeader. */
  accroche?: string;
  /** Titre de section. TEXTE RICHE : la source porte une plage en gras (« industrielles et installations »), et la règle owner du 2026-09-02 dit qu'un texte avec du gras est riche. Trouvé par le TEST D'ÉDITION du 2026-09-07, pas par lecture : déclaré en texte plat, le gras était déplié au premier « Enregistrer » du rédacteur — la garde de saisie faisait exactement son travail sur un type faux. Aligné au centre en Mobile et Tablette, à gauche en Desktop et Wide dans la forme `presentation` — décision owner du 2026-09-07. La forme `accroche` reste centrée à toutes les largeurs, comme la source. */
  titre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** Paragraphe de la forme `presentation`, à droite du titre au-dessus de 992. TEXTE RICHE : la source porte deux plages en gras (Montserrat Bold), et la règle owner du 2026-09-02 dit qu'un texte avec du gras est riche. La marque strong est gouvernée par le jeton font.weight.bold. Sans ce type le gras serait déplié au premier enregistrement côté Odoo. */
  texte?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** La collection de photos de la mosaïque, un item par tuile. Neuf items sur les trois usages relevés ; la première occupe 2×2 cellules. Figma stocke les photos comme surcharges de fill d'instance, jamais comme propriété de composant : la liaison est NONE et l'URL vide par défaut ne substitue aucune image (limite déclarée, héritée de ds.realisation). */
  photos?: Array<{ imageUrl: string; imageAlt: string }>;
}

/** Section Realisations — la mosaïque de photos de chantiers. Contrat NEUF (vague 035, 2026-09-07) : la section n'existait ni en contrat ni en bloc Odoo, seule la tuile ds.realisation était gouvernée. Extrait du set candidat v2 de la page « 031 · Planches de validation », posé le même jour à partir du set v1 2117:4691 après nettoyage de la source (8 défauts relevés, dont l'aplat gris opaque qui cachait les 27 photos vivantes du fichier). Mosaïque : une grande tuile sur 2×2 cellules puis huit petites, 4 colonnes en Desktop et Wide, 2 en Tablette et Mobile — décision owner du 2026-09-07 (option B : deux colonnes en mobile plutôt qu'une, qui donnait 3638 px de défilement pour un seul bloc). Le rythme vertical appartient à la page (padding vertical 0), la gouttière au contrat, comme toutes les sections depuis la vague 031. */
export const Realisations = forwardRef<HTMLElement, RealisationsProps>(function Realisations(
  { presentation = 'mobile', enTete = 'accroche', accroche = 'Des installations de qualité', titre = [{"text":"Nos réalisations "},{"text":"industrielles et installations","strong":true},{"text":" de qualité"}], texte = [{"text":"Personnalisez votre porte industrielle grâce à "},{"text":"nos solutions sur mesure","strong":true},{"text":", parfaitement intégrées à votre façade. Conçues pour recevoir tout type de bardage (Renson, Trespa, Alubond, Bois ou Eternit) ou des sections vitrées, nos portes garantissent "},{"text":"une robustesse exceptionnelle et une très longue durée de vie","strong":true},{"text":"."}], photos, style, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }}  {...rest}>
      <div style={{ ...S.EnTete, ...(V[`presentation-${presentation}:EnTete`] ?? {}) }}>
<div style={{ ...S.SectionHeader }}>
{enTete === 'accroche' ? (<span style={{ ...S.Accroche }}>{accroche}</span>) : null}
<h2 style={{ ...S.Titre, ...(presentation === 'desktop' ? {"textAlign":"left"} : {}), ...(presentation === 'wide' ? {"textAlign":"left"} : {}), ...(enTete === 'accroche' ? {"textAlign":"center"} : {}) }}>{titre.map(({ text, strong, underline }, index) => { const inner = underline ? <u>{text}</u> : text; return strong ? <strong key={index} style={{ fontWeight: 700 }}>{inner}</strong> : <span key={index}>{inner}</span>; })}</h2>
</div>
{enTete === 'presentation' ? (<span style={{ ...S.Texte }}>{texte.map(({ text, strong, underline }, index) => { const inner = underline ? <u>{text}</u> : text; return strong ? <strong key={index} style={{ fontWeight: 700 }}>{inner}</strong> : <span key={index}>{inner}</span>; })}</span>) : null}
</div>
<div style={{ ...S.Grille, ...(V[`presentation-${presentation}:Grille`] ?? {}) }}>
<Realisation taille="grand" imageUrl="" imageAlt="Porte de garage sectionnelle bois sur maison à bardage gris" />
<Realisation taille="grand" imageUrl="" imageAlt="Porte de garage sectionnelle noire sur façade en briques claires" />
<Realisation taille="grand" imageUrl="" imageAlt="Porte de garage sectionnelle bois sur longère en pierre" />
<Realisation taille="grand" imageUrl="" imageAlt="Porte de garage sectionnelle noire à hublots sur mur de briques grises" />
<Realisation taille="grand" imageUrl="" imageAlt="Portail industriel noir le long d'une allée" />
<Realisation taille="grand" imageUrl="" imageAlt="Porte de garage anthracite sur maison de briques rouges" />
<Realisation taille="grand" imageUrl="" imageAlt="Porte de garage anthracite sur façade de briques rouges et blanches" />
<Realisation taille="grand" imageUrl="" imageAlt="Porte de garage bois sur bâtiment en rénovation" />
<Realisation taille="grand" imageUrl="" imageAlt="Porte de garage verte sur maison de caractère en pierre" />
</div>
    </section>
  );
});
