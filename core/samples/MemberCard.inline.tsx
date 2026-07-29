/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/member-card.contract.json (ds.member-card v1.2.0)
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
import { MemberPicture } from './MemberPicture';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "16px",
    "width": "364px"
  },
  "text": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "gap": "8px"
  },
  "Nom": {
    "color": "#26282C",
    "fontSize": "32px",
    "fontWeight": 400,
    "lineHeight": "40px"
  },
  "Poste": {
    "color": "#F98A0B",
    "fontSize": "16px",
    "fontWeight": 600,
    "lineHeight": "20px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface MemberCardProps extends HTMLAttributes<HTMLDivElement> {
  nom?: string;
  poste?: string;
  imageUrl?: string;
  imageAlt?: string;
}

/** Piqueray MemberCard. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Portrait IMAGE overrides are explicit code-only photo data, propagated to the composed MemberPicture without flattening its image anatomy. */
export const MemberCard = forwardRef<HTMLDivElement, MemberCardProps>(function MemberCard(
  { nom = 'Cécilia Piqueray', poste = 'Gérante', imageUrl = '', imageAlt = '', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <MemberPicture etat="defaut" taille="member-card" src={imageUrl} alt={imageAlt} />
<div style={{ ...S.text }}>
<span style={{ ...S.Nom }}>{nom}</span>
<span style={{ ...S.Poste }}>{poste}</span>
</div>
    </div>
  );
});
