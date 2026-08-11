/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/section-header.contract.json (ds.section-header v2.2.0)
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
    "fontFamily": "Montserrat, sans-serif",
    "gap": "8px",
    "alignSelf": "stretch"
  },
  "Accroche": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontSize": "20px",
    "fontWeight": 400,
    "letterSpacing": "3px",
    "lineHeight": "25px",
    "textTransform": "uppercase"
  },
  "Titre": {
    "width": "100%",
    "minWidth": 0,
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
  /** Une seule propriété TEXT Figma ("Titre"), à graisses MIXTES chez trois consommateurs : presentation dessine « Piqueray, » en Bold puis le reste en Regular (I2169:6246;2090:2387), texte-seo met « showroom à Pepinster » en Bold au milieu de la phrase (I2170:6361;2090:2387), hero met « Portes de garage » en Bold et « industrielles » en Light (I2169:6264;2090:2387). Les cinq autres consommateurs passent un segment unique. La projection canvas garde UNE valeur TEXT native et applique les marques gouvernées par plages de caractères natives. */
  titre?: Array<{ text: string; strong?: boolean }>;
  /** Extracted from Figma "Accroche2" BOOLEAN property (added by sync pass). */
  accroche2?: boolean;
  /** Axe gouverné : binding VARIANT « Emphase » depuis 2.1.0 (016, journal decisions.md O-12 — le SET 2090:2397 a gagné les dimensions Emphase et Alignement, 16 variantes). LIMITE LEVÉE : jusqu'en 2.0.x cet axe était code-only (bindings.figma.kind: NONE), une abstraction au-dessus de surcharges d'instance ad hoc (hero 2169:6264 : 54/68/blanc ; presentation 2169:6246 : 32/40 ; texte-seo 2170:6361 : 24/30 ; les autres usages au défaut 40/50 du master 2090:2385) — le correctif de fond annoncé par l'ancienne limite (promouvoir ces surcharges en variantes réelles) a eu lieu côté Figma. Le modèle du poids hero est inchangé : le nœud d'origine porte un style de BASE Bold 700 avec une surcharge Light 300 sur « industrielles » ; le contrat porte l'inverse strictement équivalent en pixels — la plage non marquée prend le poids de base (300, littéral : aucun token Light dans la fondation) et la plage marquée prend content.marks.strong (token font.weight.bold). */
  emphase?: 'standard' | 'hero' | 'moyen' | 'compact';
  /** Axe gouverné : binding VARIANT « Alignement » depuis 2.1.0 (016, journal decisions.md O-12). LIMITE LEVÉE : jusqu'en 2.0.x cet axe était code-only (bindings.figma.kind: NONE) — le master 2090:2385 centrait (textAlign CENTER) et les usages le surchargeaient en LEFT par instance (census 013 : 5 usages sur 7 ; relevé vif 016 : 34 instances sur 59, specs/016-canvas-vrai/registre/defauts-source.json B013-2). Le correctif de fond annoncé par l'ancienne limite a eu lieu : l'alignement est une variante gouvernée du master. */
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
{disposition === 'avecCta' ? (<Button variant="outlineNoir">Voir les produits</Button>) : null}
    </div>
  );
});
