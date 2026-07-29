/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/sav.contract.json (ds.sav v1.0.0)
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
    "fontFamily": "Montserrat, sans-serif"
  },
  "section": {
    "display": "flex"
  },
  "background": {},
  "row": {
    "display": "flex",
    "flexDirection": "row"
  },
  "wrapper": {
    "display": "flex"
  },
  "WrapperBackground": {
    "backgroundColor": "#FFFFFF"
  },
  "inner": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch"
  },
  "vousRencontrezUnProblmeA": {
    "color": "#37373B"
  },
  "imgGroup": {
    "display": "flex"
  },
  "ImgGroupBackground": {
    "backgroundColor": "#F4F6FA"
  },
  "img": {}
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface SAVProps extends HTMLAttributes<HTMLDivElement> {
  /** Extracted from Figma "Titre" TEXT property (added by sync pass). */
  titre?: string;
}

/** Piqueray SAV. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const SAV = forwardRef<HTMLDivElement, SAVProps>(function SAV(
  { titre = 'Dépannage / SAV', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <div style={{ ...S.section }}>
<div style={{ ...S.background }}>

</div>
<div style={{ ...S.row }}>
<div style={{ ...S.wrapper }}>
<div style={{ ...S.WrapperBackground }}>

</div>
<div style={{ ...S.inner }}>
<SectionHeader titre="Dépannage / SAV" accroche="Plus de 50 ans d’expérience" disposition="standard" />
<span style={{ ...S.vousRencontrezUnProblmeA }}>Vous rencontrez un problème avec votre installation Hörmann à Liège ? Il y a une panne de courant et votre porte de garage ne s’ouvre plus ? La télécommande de ma porte est cassée ? Votre porte ne se ferme plus correctement ?
Pas de panique, Piqueray, votre distributeur Hörmann en province de Liège est là pour vous aider !</span>
<Button>Contactez-nous</Button>
</div>
</div>
<div style={{ ...S.imgGroup }}>
<div style={{ ...S.ImgGroupBackground }}>

</div>
<div style={{ ...S.img }}>

</div>
</div>
</div>
</div>
    </div>
  );
});
