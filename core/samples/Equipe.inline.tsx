/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/equipe.contract.json (ds.equipe v1.0.0)
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
import { MemberCard } from './MemberCard';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "justifyContent": "center",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif"
  },
  "grid": {
    "display": "flex",
    "flexDirection": "row",
    "flex": "1 1 auto",
    "minWidth": 0
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface EquipeProps extends HTMLAttributes<HTMLDivElement> {
  items?: Array<{ poste: string; nom: string }>;
}

/** Piqueray Equipe. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Equipe = forwardRef<HTMLDivElement, EquipeProps>(function Equipe(
  { items, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} {...rest}>
      <div style={{ ...S.grid }}>
<MemberCard poste="Gérante" nom="Cécilia Piqueray" />
<MemberCard poste="Gérant" nom="Florian Piqueray" />
<MemberCard poste="Monteur" nom="Jordan" />
<MemberCard poste="Monteur" nom="Florian" />
<MemberCard poste="Dépanneur" nom="Hervé" />
<MemberCard poste="Poste" nom="Prénom" />
<MemberCard poste="Poste" nom="Prénom" />
<MemberCard poste="Poste" nom="Prénom" />
<MemberCard poste="Collaboratrice admin & comptabilité" nom="Sandra Magermans" />
<MemberCard poste="Collaborateur admin & gestion SAV" nom="Arnaud Dahmen" />
<MemberCard poste="Peintre" nom="Ricardo" />
<MemberCard poste="Préparateur" nom="Quentin" />
<MemberCard poste="Monteur" nom="Marc" />
<MemberCard poste="Monteur" nom="André" />
<MemberCard poste="Monteur" nom="Laurent" />
<MemberCard poste="Monteur" nom="Grégory" />
</div>
    </div>
  );
});
