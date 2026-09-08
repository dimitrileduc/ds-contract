/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/member-picture.contract.json (ds.member-picture v1.4.1)
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
    "display": "flex",
    "width": "100%",
    "minWidth": 0,
    "aspectRatio": 1,
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "borderRadius": "500px",
    "backgroundColor": "#D9D9D9",
    "position": "relative"
  },
  "funIa": {
    "borderRadius": "500px",
    "position": "absolute"
  },
  "normal": {
    "borderRadius": "500px",
    "position": "absolute",
    "transition": "opacity 300ms"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface MemberPictureProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual state: default (no overlay) or hover (overlay visible). Extracted from the VARIANT property « Etat » on the Figma master. */
  etat?: 'defaut' | 'survol';
  /** Compatibility axis retained for existing consumers. Both values now use the same parent-owned fluid square geometry; the old 363.5px workaround belonged to the former fixed-track approximation. */
  taille?: 'standard' | 'member-card';
  /** La ROUTE du portrait, jamais ses octets. Figma n'expose aucune propriete de composant pour ces pixels (trou A5, matrice ligne 91, colonne Bindable : image content not bindable) : le contrat porte la route, la photo arrive a l'execution. Defaut vide, et il le reste. Le root de ce composant porte deliberement un lavis technique #D9D9D9 comme base de previsualisation A5 : c'est un fait de CONTRAT, pas une frontiere image. La photo qu'un designer voit sur le canevas est une maquette, hors contrat, preservee a la regeneration par une passe de sauvetage explicite (docs/handoff/08-status-what-doesnt-work.md, §6). */
  src?: string;
  alt?: string;
  /** La ROUTE du portrait du plan funIa, celui que le survol decouvre quand le plan normal passe en opacite 0. Meme convention que src, et pour la meme raison : Figma n'expose aucune propriete de composant pour des pixels (trou A5, matrice ligne 91, colonne Bindable), donc le contrat porte la route et la photo arrive a l'execution. Canal ouvert en 1.4.0 : avant, ce plan n'avait ni prop ni attribut et le survol montrait le lavis technique a la place d'un visage. Defaut vide, et il le reste. */
  srcSurvol?: string;
  /** Alternative textuelle du portrait de survol. Vide par defaut : le plan funIa reste decoratif tant qu'aucune route ne lui est donnee. */
  altSurvol?: string;
}

/** Piqueray member picture. A circular member-photo component with two states, extracted from the Figma COMPONENT_SET « MemberPicture » on DS · Atomes, reviewed and adopted — not authored.

The etat variant stacks two 364×364 circular image planes: normal is opaque in defaut and transparent in survol, with a 300ms opacity transition. The root clips both planes at its 500px radius. The visible normal plane receives its code-only src and alt scalars from its composed parent.

† A5 technical placeholder: the source IMAGE pixels of funIa are unavailable to the contract→canvas transport. That hidden-under-normal layer therefore keeps the engine's generic #D9D9D9 image-placeholder wash. This is not a Piqueray colour extracted from Figma.

VERSION 1.4.0 (2026-09-07, passe 2 du portage « Equipe v2 ») — LE PLAN DE SURVOL RECOIT ENFIN SA ROUTE, ET C'EST FIGMA QUI LE COMMANDE. Jusqu'ici seul le plan normal portait src et alt : le plan funIa, celui que le survol decouvre, n'avait AUCUN canal. Consequence mesurable, nommee par la passe 1 (journal specs/tiny/equipe-v2/member-card.md, section 7 point 3) : survoler une carte faisait DISPARAITRE le portrait pour ne montrer que le lavis technique. Or le master empile bien DEUX photos, sur les deux variantes du set. Les props srcSurvol et altSurvol ouvrent donc le meme canal code-only que src et alt, sur le plan du dessous, avec exactement la meme convention : la ROUTE, jamais les octets (trou A5, matrice ligne 91). Ajout purement additif — aucune prop ne disparait, aucune valeur ne se resserre : MINEUR. Le lavis #D9D9D9 reste la base de previsualisation quand aucune route n'est fournie. */
export const MemberPicture = forwardRef<HTMLDivElement, MemberPictureProps>(function MemberPicture(
  { etat = 'defaut', taille = 'standard', src = '', alt = '', srcSurvol = '', altSurvol = '', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(etat === 'defaut' ? {"overflow":"hidden"} : {}), ...(etat === 'survol' ? {"overflow":"hidden"} : {}), ...style }}  {...rest}>
      <img style={{ ...S.funIa, ...(etat === 'defaut' ? {"top":"0px","right":"0px","bottom":"0px","left":"0px"} : {}), ...(etat === 'survol' ? {"top":"0px","right":"0px","bottom":"0px","left":"0px"} : {}) }} src={String(srcSurvol)} alt={String(altSurvol)}>

</img>
<img style={{ ...S.normal, ...(etat === 'defaut' ? {"top":"0px","right":"0px","bottom":"0px","left":"0px","opacity":"1"} : {}), ...(etat === 'survol' ? {"top":"0px","right":"0px","bottom":"0px","left":"0px","opacity":"0"} : {}) }} src={String(src)} alt={String(alt)}>

</img>
    </div>
  );
});
