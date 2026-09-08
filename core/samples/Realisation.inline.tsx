/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/realisation.contract.json (ds.realisation v2.0.0)
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
    "fontFamily": "Montserrat, sans-serif"
  },
  "Image": {
    "display": "flex",
    "width": "100%",
    "minWidth": 0,
    "aspectRatio": 1,
    "objectFit": "cover"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface RealisationProps extends HTMLAttributes<HTMLDivElement> {
  /** Axe VARIANT Figma `Taille` (Grand | Petit), conserve parce qu'il existe sur le set. DEPUIS LA 2.0.0 IL NE PILOTE PLUS AUCUNE GEOMETRIE : la taille vient de la cellule de grille de la section. L'axe est donc inerte cote code — deviation nommee, pas silencieuse. Son retrait touche 99 instances vivantes sur trois pages clientes : decision owner en attente (voir specs/tiny/vague-031/realisations.md). */
  taille?: 'grand' | 'petit';
  /** Code-supplied URL for the visible IMAGE fill at either selected size. Figma stores the 27 observed photos as instance fill overrides (3 Grand and 24 Petit), not as a component property; the empty runtime default is intentional and does not substitute an image. */
  imageUrl?: string;
  /** Code-supplied text alternative paired with imageUrl for either selected size. Figma IMAGE fills expose no corresponding alt component property, so the empty runtime default is intentional. */
  imageAlt?: string;
}

/** Piqueray Realisation — la tuile photo de la section Realisations. 2.0.0 (2026-09-07, vague 035) : RUPTURE MAJEURE de geometrie. La 1.1.0 portait sa propre taille (743 ou 339,5 selon l'axe Taille) ; en v2 la tuile prend la taille de sa cellule de grille et reste carree (rapport 1:1). Defaut de source releve a l'etape 0 et corrige a la source le meme jour : le cadre enfant Image portait un aplat gris opaque de la meme taille que la tuile, qui recouvrait entierement la photo — les 27 tuiles vivantes du fichier (3 pages + les 2 masters) n'ont jamais montre leur photo. Le fill IMAGE reste une surcharge d'instance cote Figma ; src et alt sont des semantiques de code. */
export const Realisation = forwardRef<HTMLDivElement, RealisationProps>(function Realisation(
  { taille = 'grand', imageUrl = '', imageAlt = '', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <img style={{ ...S.Image }} src={String(imageUrl)} alt={String(imageAlt)}>

</img>
    </div>
  );
});
