/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/sav.contract.json (ds.sav v1.3.0)
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
import { SectionHeader } from './SectionHeader';
import { Button } from './Button';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "10px"
  },
  "section": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-start",
    "justifyContent": "center",
    "width": "1550px",
    "height": "677px",
    "position": "relative"
  },
  "background": {
    "width": "1550px",
    "height": "475px",
    "objectFit": "cover"
  },
  "row": {
    "display": "flex",
    "flexDirection": "row",
    "width": "1288px",
    "height": "561px",
    "position": "absolute",
    "alignSelf": "flex-end"
  },
  "wrapper": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-start",
    "justifyContent": "center",
    "width": "641px",
    "height": "561px",
    "paddingTop": "48px",
    "paddingLeft": "48px",
    "paddingRight": "47px",
    "position": "relative"
  },
  "WrapperBackground": {
    "backgroundColor": "#FFFFFF",
    "width": "641px",
    "height": "561px",
    "position": "absolute",
    "alignSelf": "flex-end"
  },
  "inner": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start",
    "gap": "32px",
    "width": "546px",
    "position": "relative"
  },
  "vousRencontrezUnProblmeA": {
    "color": "#37373B",
    "fontSize": "18px",
    "lineHeight": "27px",
    "height": "197px",
    "whiteSpace": "pre-line"
  },
  "imgGroup": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-end",
    "justifyContent": "flex-start",
    "width": "647px",
    "height": "561px",
    "paddingLeft": "3px",
    "position": "relative"
  },
  "ImgGroupBackground": {
    "backgroundColor": "#F4F6FA",
    "width": "647px",
    "height": "478px",
    "position": "absolute",
    "alignSelf": "flex-start"
  },
  "img": {
    "width": "563px",
    "height": "504px",
    "position": "relative",
    "objectFit": "contain"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface SAVProps extends HTMLAttributes<HTMLDivElement> {
  /** Extracted from Figma "Titre" TEXT property (added by sync pass). Forwarded live into the SectionHeader instance (`titre: "{titre}"`) so the parent property reaches the rendered surface instead of the child's literal. */
  titre?: string;
  /** Le paragraphe long de la colonne (TEXT Figma 2108:3103) en prop rich-text gouvernée — 016/T042, lot B013-4 : c'était le SEUL texte non lié du master (diagnostic vif 2026-08-05), et le lot L-B013-4 (T041) expose la propriété TEXT native « Texte » qu'elle lie. Les trois plages 700 observées voyagent en segments ; la projection Figma aplatit vers la valeur native de la propriété (concaténation, saut de ligne dur compris). */
  texte?: Array<{ text: string; strong?: boolean }>;
  /** Code-supplied URL for the full-bleed section IMAGE fill. Figma stores those pixels as a paint on the master (not as a component property) and the contract has no background-image channel; the empty runtime default is intentional and does not substitute an image. */
  backgroundUrl?: string;
  /** Code-supplied text alternative paired with backgroundUrl. Figma IMAGE fills expose no corresponding alt component property, so the empty runtime default is intentional (decorative plane). */
  backgroundAlt?: string;
  /** Code-supplied URL for the img-group photo IMAGE fill. Same provenance as backgroundUrl: a master paint, not a component property; the empty runtime default is intentional and does not substitute an image. */
  imageUrl?: string;
  /** Code-supplied text alternative paired with imageUrl. Figma IMAGE fills expose no corresponding alt component property, so the empty runtime default is intentional. */
  imageAlt?: string;
}

/** Piqueray SAV. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.

Limites nommées : les deux plans photo (`background` 2108:3094, `img` 2108:3098) portent chacun un paint IMAGE sur le master Figma. Le vocabulaire de contrat n'a AUCUN canal `background-image` (gap nommé A5, docs/FIGMA-CAPABILITY-MATRIX.md) : les `imageRef` observés sont donc CONSIGNÉS dans la description de chaque part, jamais liés. Ce qui est porté : le porteur `img` avec `src`/`alt` fournis par le code (convention realisation/carte/product-card) et le `object-fit` qui est l'orthographe CSS du `scaleMode` observé.

v1.3.0 (016/T042, lot B013-4) : le paragraphe long cesse d'être cuit en dur — prop rich-text `texte` liée à la propriété TEXT native « Texte » que le lot L-B013-4 (T041) expose sur le master ; c'était le SEUL texte non lié du master au diagnostic vif du 2026-08-05 (le titre avait déjà sa propriété « Titre », les autres textes passent par les instances). Ses trois plages 700 voyagent en segments gouvernés (content.marks.strong) et le saut de ligne dur voyage dans la valeur de la prop. */
export const SAV = forwardRef<HTMLDivElement, SAVProps>(function SAV(
  { titre = 'Dépannage / SAV', backgroundUrl = '', backgroundAlt = '', imageUrl = '', imageAlt = '', texte = [{"text":"Vous rencontrez un problème avec "},{"text":"votre installation ","strong":true},{"text":"Hörmann à Liège ? Il y a une panne de courant et "},{"text":"votre porte de garage","strong":true},{"text":" ne s’ouvre plus ? La télécommande de ma porte est cassée ? Votre porte ne se ferme plus correctement ?\nPas de panique, Piqueray, "},{"text":"votre distributeur Hörmann en province de Liège","strong":true},{"text":" est là pour vous aider !"}], style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <div style={{ ...S.section }}>
<img style={{ ...S.background }} src={String(backgroundUrl)} alt={String(backgroundAlt)}>

</img>
<div style={{ ...S.row }}>
<div style={{ ...S.wrapper }}>
<div style={{ ...S.WrapperBackground }}>

</div>
<div style={{ ...S.inner }}>
<SectionHeader titre={[{"text":"Dépannage / SAV"}]} accroche="Plus de 50 ans d’expérience" accroche2={false} disposition="standard" alignement="gauche" />
<span style={{ ...S.vousRencontrezUnProblmeA }}>{texte.map(({ text, strong }, index) => strong ? <strong key={index} style={{ fontWeight: 700 }}>{text}</strong> : <span key={index}>{text}</span>)}</span>
<Button iconRight>Demander de l’aide</Button>
</div>
</div>
<div style={{ ...S.imgGroup }}>
<div style={{ ...S.ImgGroupBackground }}>

</div>
<img style={{ ...S.img }} src={String(imageUrl)} alt={String(imageAlt)}>

</img>
</div>
</div>
</div>
    </div>
  );
});
