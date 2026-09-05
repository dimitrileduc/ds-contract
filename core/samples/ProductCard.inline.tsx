/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/product-card.contract.json (ds.product-card v3.1.0)
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
    "flexDirection": "column",
    "alignItems": "center",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "16px",
    "width": "260px",
    "minWidth": "260px",
    "textRendering": "geometricprecision"
  },
  "Image": {
    "width": "240px",
    "height": "240px"
  },
  "Titre": {
    "color": "#26282C",
    "fontSize": "16px",
    "fontWeight": 600,
    "fontFamily": "Montserrat, sans-serif",
    "lineHeight": "20px",
    "textAlign": "center",
    "alignSelf": "stretch",
    "whiteSpace": "nowrap",
    "overflowX": "hidden",
    "overflowY": "hidden",
    "textOverflow": "ellipsis"
  },
  "Prix": {
    "color": "#143A84",
    "fontSize": "16px",
    "fontWeight": 600,
    "fontFamily": "Montserrat, sans-serif",
    "lineHeight": "20px",
    "textAlign": "center",
    "alignSelf": "stretch"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface ProductCardProps extends HTMLAttributes<HTMLDivElement> {
  titre?: string;
  prix?: string;
  /** Code-supplied product-image URL. Figma exposes the visible value as an IMAGE fill through an instance override, not as a component property; the empty runtime default is intentional and comparison assets are injected only by the campaign. */
  imageUrl?: string;
  /** Code-supplied text alternative paired with imageUrl. Figma has no corresponding component property, so the empty runtime default is intentional. */
  imageAlt?: string;
}

/** 3.1.0 (2026-09-05, vague 033) : elevation au survol. L'ombre est portee par la RACINE, donc elle trace la boite entiere de la carte — photo + titre + prix — et non la photo seule. La distinction n'est pas theorique : la premiere proposition faite a l'owner rendait l'ombre autour de l'image uniquement, et a ete refusee pour cela.

La carte ne porte AUCUNE ombre au repos, donc aucun octet du repos ne bouge. Valeur a 12 % et non 10 % : 10 % sur fond blanc s'est avere invisible a l'oeil, constate puis releve le 2026-09-05.

Piqueray ProductCard. 3.0.0 (2026-09-04, vague 031) : les ancres passent du master DS 2068:1972 au master 031 `ProductCard` 2693:21081, celui que le set ProduitsECommerce de la page 031 instancie réellement — décision owner, patron déjà appliqué à ReviewCard, CarteCategorie et CarteReassurance. Deux changements avec : la typographie monte le groupe de jetons `typography.titre-6` (au lieu de font.size.16 / font.weight.semibold en dur, même recette résolue) ; et la largeur devient un PLAFOND, pas une largeur fixe — dans les quatre vues la carte vaut 260 · 322 · 326 · 363 selon l'écran, posée par la section via le jeton responsive `spacing.product-card.width` (une molécule n'a pas d'axe présentation : ce qui change par écran passe par un jeton qui varie par écran). L'URL et l'alternative textuelle de l'image restent des sémantiques de code : Figma les fournit par surcharge d'instance, jamais comme propriété de composant. La LARGEUR par écran (260 · 322 · 326 · 363) est portée par le jeton `spacing.product-card.width` sur la racine de CETTE molécule, et non sur la part instance de la section : les jetons posés sur une part `component` sont silencieusement ignorés par les émetteurs (vérifié le 2026-09-04 — zéro règle générée). C'est le patron d'art antérieur du dépôt (ds.avatar-group : largeur fixe sur la racine de l'enfant), la seule route qui traverse. Le jeton résout par mode viewport, ce qu'une molécule sans axe presentation ne saurait faire elle-même. `min-width` répète `width` : la carte est dans une piste flex et le rétrécissement par défaut la ferait passer sous la largeur dessinée — le carrousel exige qu'elle garde sa taille et que la piste déborde. Canal jeton, donc gouverné des deux côtés ; `flex-shrink` n'est pas un canal `declared` du registre (refus du schéma, 2026-09-04). Le titre est tronqué sur une ligne (maxLines 1 / ENDING au canevas) : porté par les canaux declared white-space, overflow et text-overflow. */
export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(function ProductCard(
  { titre = 'Télécommande Hörmann HSE4-868BS', prix = '74,99€', imageUrl = '', imageAlt = '', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <img style={{ ...S.Image }} src={String(imageUrl)} alt={String(imageAlt)}>

</img>
<span style={{ ...S.Titre }}>{titre}</span>
<span style={{ ...S.Prix }}>{prix}</span>
    </div>
  );
});
