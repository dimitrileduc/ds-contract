/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/produits-ecommerce.contract.json (ds.produits-ecommerce v2.0.0)
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
import { Button } from './Button';
import { ProductCard } from './ProductCard';
import { CarouselControls } from './CarouselControls';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "paddingInline": "0px",
    "paddingBlock": "0px",
    "gap": "32px"
  },
  "enTete": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "paddingInline": "24px",
    "gap": "32px"
  },
  "Titre": {
    "flex": "1 1 auto",
    "minWidth": 0,
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "24px",
    "fontWeight": 600,
    "lineHeight": "30px"
  },
  "pisteEtControles": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "gap": "24px"
  },
  "carrouselProduits": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start",
    "overflow": "hidden",
    "gap": "0px",
    "paddingLeft": "24px"
  },
  "Produits": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "16px"
  },
  "controles": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "flex-end",
    "width": "100%",
    "minWidth": 0,
    "paddingInline": "24px"
  },
  "boutonConteneur": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0,
    "paddingInline": "24px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "presentation-desktop:root": {
    "gap": "48px"
  },
  "presentation-desktop:enTete": {
    "paddingInline": "48px",
    "gap": "8px",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between"
  },
  "presentation-desktop:carrouselProduits": {
    "paddingLeft": "48px"
  },
  "presentation-desktop:controles": {
    "paddingInline": "48px"
  },
  "presentation-desktop:boutonConteneur": {
    "paddingInline": "48px"
  },
  "presentation-wide:root": {
    "gap": "48px"
  },
  "presentation-wide:enTete": {
    "paddingInline": "89px",
    "gap": "8px",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "presentation-wide:carrouselProduits": {
    "paddingLeft": "89px"
  },
  "presentation-wide:Produits": {
    "gap": "24px"
  },
  "presentation-wide:controles": {
    "paddingInline": "89px"
  },
  "presentation-wide:boutonConteneur": {
    "paddingInline": "89px"
  },
  "presentation-tablette:enTete": {
    "paddingInline": "48px"
  },
  "presentation-tablette:carrouselProduits": {
    "paddingLeft": "48px"
  },
  "presentation-tablette:Produits": {
    "flexDirection": "row",
    "alignItems": "center",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-tablette:controles": {
    "paddingInline": "48px"
  },
  "presentation-tablette:boutonConteneur": {
    "paddingInline": "48px"
  },
  "presentation-mobile:Produits": {
    "flexDirection": "row",
    "alignItems": "center",
    "width": "100%",
    "minWidth": "0"
  }
};

export interface ProduitsECommerceProps extends HTMLAttributes<HTMLDivElement> {
  /** L'étage responsive (axe Presentation du set 031). Défaut = première variante du set (mobile), la parité l'exige. Côté Odoo la valeur n'est jamais posée : responsive/produits-ecommerce.pqr.css réécrit les règles par mode en @media. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Titre de section, lié à la propriété TEXT « Titre » du set. La liaison a été POSÉE À LA SOURCE le 2026-09-04 (§VIII) : le set 031 n'exposait aucune propriété TEXT, le titre n'était qu'un texte dessiné et le contrat le portait en NONE. La propriété est maintenant définie sur le set et les quatre variantes y réfèrent leur nœud Titre. */
  titre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** La collection de produits — code-only par construction (arrayOf ⇔ figma NONE). Le canevas rend le `sample` du repeat : cinq entrées, l'union des cartes dessinées (Wide en montre cinq, les autres quatre). Côté Odoo la liste vient du descripteur de page. */
  produits?: Array<{ titre: string; prix: string }>;
}

/** Piqueray ProduitsECommerce, responsive (vague 031). 2.0.0 (2026-09-04) : les ancres passent de l'ancien master DS 2116:4475 (une variante) au set 031 `ProduitsECommerce` 2694:21337, quatre variantes Presentation — la seule section de la home restée hors de la vague, ce qui figeait ses cartes à 364 px à toutes les largeurs et faisait déborder la page horizontalement. La source a été nettoyée avant extraction (journal specs/tiny/vague-031/produits-ecommerce.md) : structure unifiée sur UN arbre pour les quatre variantes, Bouton et CarouselControls re-liés en instances, écart des contrôles rétabli (SPACE_BETWEEN annulait le gap — dixième occurrence). Deux formes selon l'écran, portées par présence et par layoutByProp : Mobile et Tablette montrent le titre seul puis le bouton pleine largeur en pied, contrôles masqués ; Desktop et Wide mettent le titre et le bouton sur une ligne et affichent les contrôles sous la piste. La piste est bornée par le cadre sous 992 et libre au-delà : elle déborde volontairement du cadre rognant, c'est le carrousel. Wide dessine cinq cartes, les autres quatre. Le mécanisme du carrousel est DIFFÉRÉ (décision owner 2026-09-04) : les contrôles sont inertes, le glissement au doigt viendra plus tard. Le 2026-09-04, la propriété TEXT « Titre » a été ajoutée au set et référencée par les quatre variantes : le titre est désormais une donnée liée, pas un texte dessiné. */
export const ProduitsECommerce = forwardRef<HTMLDivElement, ProduitsECommerceProps>(function ProduitsECommerce(
  { presentation = 'mobile', titre = [{"text":"Découvrez nos produits disponibles en ligne"}], produits, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }}  {...rest}>
      <div style={{ ...S.enTete, ...(V[`presentation-${presentation}:enTete`] ?? {}) }}>
<span style={{ ...S.Titre }}>{titre.map(({ text, strong, underline }, index) => { const inner = underline ? <u>{text}</u> : text; return strong ? <strong key={index} style={{ fontWeight: 700 }}>{inner}</strong> : <span key={index}>{inner}</span>; })}</span>
{presentation === 'desktop' ? (<Button variant="outlineNoir" iconLeft={false} iconRight={false} iconLeftGlyph="arrow-left" iconRightGlyph="arrow-right">Voir les produits</Button>) : null}
{presentation === 'wide' ? (<Button variant="outlineNoir" iconLeft={false} iconRight={false} iconLeftGlyph="arrow-left" iconRightGlyph="arrow-right">Voir les produits</Button>) : null}
</div>
<div style={{ ...S.pisteEtControles }}>
<div style={{ ...S.carrouselProduits, ...(V[`presentation-${presentation}:carrouselProduits`] ?? {}) }}>
<div style={{ ...S.Produits, ...(V[`presentation-${presentation}:Produits`] ?? {}) }}>
<ProductCard titre="Télécommande Hörmann HSE4-868BS" prix="74,99€" />
<ProductCard titre="Clavier à code Hörmann FCT3-1BS" prix="139,99€" />
<ProductCard titre="Bouton poussoir Hörmann FIT2-1-868-BS" prix="89,99€" />
<ProductCard titre="Passerelle BiSecure Hörmann" prix="74,99€" />
<ProductCard titre="Télécommande Hörmann HSE4-868BS" prix="74,99€" />
</div>
</div>
<div style={{ ...S.controles, ...(V[`presentation-${presentation}:controles`] ?? {}), ...(presentation === 'mobile' ? {"display":"none"} : {}), ...(presentation === 'tablette' ? {"display":"none"} : {}) }}>
<CarouselControls />
</div>
</div>
<div style={{ ...S.boutonConteneur, ...(V[`presentation-${presentation}:boutonConteneur`] ?? {}), ...(presentation === 'desktop' ? {"display":"none"} : {}), ...(presentation === 'wide' ? {"display":"none"} : {}) }}>
<Button variant="outlineNoir" iconLeft={false} iconRight={false} iconLeftGlyph="arrow-left" iconRightGlyph="arrow-right">Voir les produits</Button>
</div>
    </div>
  );
});
