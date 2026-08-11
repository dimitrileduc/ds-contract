/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/member-picture.contract.json (ds.member-picture v1.2.1)
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

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "width": "364px",
    "height": "364px",
    "borderRadius": "500px",
    "backgroundColor": "#D9D9D9",
    "position": "relative"
  },
  "funIa": {
    "width": "364px",
    "height": "364px",
    "borderRadius": "500px",
    "position": "absolute",
    "aspectRatio": "1"
  },
  "normal": {
    "width": "364px",
    "height": "364px",
    "borderRadius": "500px",
    "position": "absolute",
    "aspectRatio": "1",
    "transition": "opacity 300ms"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "taille-member-card:root": {
    "width": "363.5px",
    "height": "363.5px"
  },
  "taille-member-card:funIa": {
    "width": "363.5px",
    "height": "363.5px"
  },
  "taille-member-card:normal": {
    "width": "363.5px",
    "height": "363.5px"
  }
};

export interface MemberPictureProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual state: default (no overlay) or hover (overlay visible). Extracted from the VARIANT property « Etat » on the Figma master. */
  etat?: 'defaut' | 'survol';
  /** Code-side geometry selector for observed composed placements. The MemberCard instance is explicitly resized to 363.5px inside its 364px parent frame; the standalone atom keeps the 364px master geometry by default. */
  taille?: 'standard' | 'member-card';
  /** La ROUTE du portrait, jamais ses octets. Figma n'expose aucune propriete de composant pour ces pixels (trou A5, matrice ligne 91, colonne Bindable : image content not bindable) : le contrat porte la route, la photo arrive a l'execution. Defaut vide, et il le reste. Le root de ce composant porte deliberement un lavis technique #D9D9D9 comme base de previsualisation A5 : c'est un fait de CONTRAT, pas une frontiere image. La photo qu'un designer voit sur le canevas est une maquette, hors contrat, preservee a la regeneration par une passe de sauvetage explicite (docs/handoff/08-status-what-doesnt-work.md, §6). */
  src?: string;
  alt?: string;
}

/** Piqueray member picture. A circular member-photo component with two states, extracted from the Figma COMPONENT_SET « MemberPicture » on DS · Atomes, reviewed and adopted — not authored.

The etat variant stacks two 364×364 circular image planes: normal is opaque in defaut and transparent in survol, with a 300ms opacity transition. The root clips both planes at its 500px radius. The visible normal plane receives its code-only src and alt scalars from its composed parent.

† A5 technical placeholder: the source IMAGE pixels of funIa are unavailable to the contract→canvas transport. That hidden-under-normal layer therefore keeps the engine's generic #D9D9D9 image-placeholder wash. This is not a Piqueray colour extracted from Figma, and the survol-only funIa plane remains outside the runtime photo API. */
export const MemberPicture = forwardRef<HTMLDivElement, MemberPictureProps>(function MemberPicture(
  { etat = 'defaut', taille = 'standard', src = '', alt = '', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`taille-${taille}:root`] ?? {}), ...(etat === 'defaut' ? {"overflow":"hidden"} : {}), ...(etat === 'survol' ? {"overflow":"hidden"} : {}), ...style }}  {...rest}>
      <img style={{ ...S.funIa, ...(V[`taille-${taille}:funIa`] ?? {}), ...(etat === 'defaut' ? {"top":"0px","right":"0px","bottom":"0px","left":"0px"} : {}), ...(etat === 'survol' ? {"top":"0px","right":"0px","bottom":"0px","left":"0px"} : {}) }} alt="">

</img>
<img style={{ ...S.normal, ...(V[`taille-${taille}:normal`] ?? {}), ...(etat === 'defaut' ? {"top":"0px","right":"0px","bottom":"0px","left":"0px","opacity":"1"} : {}), ...(etat === 'survol' ? {"top":"0px","right":"0px","bottom":"0px","left":"0px","opacity":"0"} : {}) }} src={String(src)} alt={String(alt)}>

</img>
    </div>
  );
});
