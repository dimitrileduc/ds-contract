/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/section-header.contract.json (ds.section-header v2.0.0)
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
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "8px",
    "alignSelf": "stretch"
  },
  "Accroche": {
    "color": "#26282C",
    "fontSize": "20px",
    "fontWeight": 400,
    "letterSpacing": "3px",
    "lineHeight": "25px",
    "textTransform": "uppercase"
  },
  "Titre": {
    "color": "#26282C",
    "fontSize": "40px",
    "fontWeight": 400,
    "lineHeight": "50px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "disposition-avecCta:root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between"
  },
  "disposition-avecCta:Titre": {
    "fontSize": "32px",
    "lineHeight": "40px"
  },
  "emphase-hero:Titre": {
    "color": "#FFFFFF",
    "fontSize": "54px",
    "lineHeight": "68px",
    "fontWeight": "300"
  },
  "emphase-moyen:Titre": {
    "fontSize": "32px",
    "lineHeight": "40px"
  },
  "emphase-compact:Titre": {
    "fontSize": "24px",
    "lineHeight": "30px"
  }
};

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  disposition?: 'standard' | 'avecCta';
  accroche?: string;
  /** Une seule propriété TEXT Figma ("Titre"), à graisses MIXTES chez trois consommateurs : presentation dessine « Piqueray, » en Bold puis le reste en Regular (I2169:6246;2090:2387), texte-seo met « showroom à Pepinster » en Bold au milieu de la phrase (I2170:6361;2090:2387), hero met « Portes de garage » en Bold et « industrielles » en Light (I2169:6264;2090:2387). Les cinq autres consommateurs passent un segment unique. La projection canvas reste UNE valeur TEXT native : la concaténation à plat. */
  titre?: Array<{ text: string; strong?: boolean }>;
  /** Extracted from Figma "Accroche2" BOOLEAN property (added by sync pass). */
  accroche2?: boolean;
  /** LIMITE NOMMÉE — abstraction code-side sur des surcharges d'instance Figma ad hoc. Le master 2090:2385 porte 40px/50px ; les usages surchargent la typographie du Titre par instance (hero 2169:6264 : 54/68/blanc, poids 300 sur la plage NON marquée — voir ci-dessous ; presentation 2169:6246 : 32/40 ; texte-seo 2170:6361 : 24/30 ; coordonnees, faq, sav et reassurances restent à 40/50 = defaut) au lieu de la porter en variantes gouvernées. Le poids du hero : le nœud Figma a un style de BASE Bold 700 avec une surcharge Light 300 sur « industrielles » ; le modèle du contrat porte l'inverse strictement équivalent en pixels — la plage non marquée prend le poids de base (300, littéral : aucun token Light dans la fondation) et la plage marquée prend content.marks.strong (token font.weight.bold). `component.props` ne transporte que des valeurs de props, jamais une surcharge typographique de l'enfant — cet axe est donc le seul moyen de porter le fait sans retoucher la sortie générée. Le correctif de fond appartient à Figma : promouvoir ces surcharges en variantes réelles, après quoi cet axe redevient un VARIANT lié. */
  emphase?: 'standard' | 'hero' | 'moyen' | 'compact';
  /** LIMITE NOMMÉE — le master 2090:2385 centre (textAlign CENTER) mais 5 usages sur 7 le surchargent en LEFT par instance (coordonnees, presentation, sav, texte-seo, hero) quand faq et reassurances suivent le master. Cet axe code-side porte ce fait d’usage ; le correctif de fond appartient à Figma (promouvoir l’alignement en variante gouvernée du master). */
  alignement?: 'centre' | 'gauche';
}

/** Piqueray SectionHeader. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  { disposition = 'standard', emphase = 'standard', alignement = 'centre', accroche2 = true, accroche = 'Plus de 50 ans d’expérience', titre = [{"text":"Pourquoi choisir Piqueray ?"}], style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`disposition-${disposition}:root`] ?? {}), ...(alignement === 'gauche' ? {"alignItems":"start"} : {}), ...style }} data-accroche2={accroche2 || undefined}  {...rest}>
      {accroche2 ? (<span style={{ ...S.Accroche }}>{accroche}</span>) : null}
<span style={{ ...S.Titre, ...(V[`disposition-${disposition}:Titre`] ?? {}), ...(V[`emphase-${emphase}:Titre`] ?? {}) }}>{titre.map(({ text, strong }, index) => strong ? <strong key={index} style={{ fontWeight: 700 }}>{text}</strong> : <span key={index}>{text}</span>)}</span>
{disposition === 'avecCta' ? (<Button variant="outilneNoir">Voir les produits</Button>) : null}
    </div>
  );
});
