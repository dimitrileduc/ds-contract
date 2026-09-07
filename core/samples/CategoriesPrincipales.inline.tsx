/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/categories-principales.contract.json (ds.categories-principales v2.1.0)
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
import { CarteCategorie } from './CarteCategorie';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "paddingInline": "24px",
    "paddingBlock": "0px",
    "gap": "16px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "presentation-tablette:root": {
    "paddingInline": "48px",
    "gap": "64px"
  },
  "presentation-desktop:root": {
    "paddingInline": "56px",
    "gap": "64px",
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "stretch",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-wide:root": {
    "paddingInline": "89px",
    "gap": "64px",
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "stretch",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": "0"
  }
};

export interface CategoriesPrincipalesProps extends HTMLAttributes<HTMLElement> {
  /** Présentation par écran, miroir de l'axe Presentation du set 031. Défaut = mobile, première variante du set et base mobile-first du CSS livré ; dans le CSS livré c'est la fenêtre qui choisit, par les jetons de rupture, jamais un consommateur. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Style des cartes de la section, transmis a toutes les cartes (composition, jamais carte par carte). `superpose` = photo pleine, voile degrade, titre et texte blancs par-dessus ; `empile` = photo, puis titre, texte et CTA en dessous, sur fond blanc. Miroir de l'axe Style du set 2693:20242 depuis le 2026-09-07. Defaut `superpose` : c'est la premiere rangee du set, l'usage de la home et des pages 1 et 2, et le comportement de la 2.0.0 — un consommateur qui ne passe rien ne voit aucun changement. */
  style?: 'superpose' | 'empile';
  /** Collection de cartes-catégories. Champs `titre` et `texte` (plats — un arrayOf ne porte que text/number/boolean par le schéma). Le `sample` est relevé de la source (contenus réels des usages), jamais inventé. LIMITE : pas de champ `ctaType` par carte (voir description du contrat). Le set 031 en dessine deux, en style superposé, dans les quatre présentations. */
  cartes?: Array<{ titre: string; texte: string }>;
}

/** 2.1.0 (2026-09-07, vague 031) : le reglage `style` REVIENT, en MINEUR additif, et il revient parce qu'une page reelle le demande. La page « Portes de garage residentielles » compose ses deux categories en style EMPILE ; la 2.0.0 avait retire le reglage au motif, exact a sa date, que le set 031 ne dessinait que du superpose. Le set en dessine maintenant les deux : il est passe de 4 a 8 variantes le 2026-09-07 (Style = Superpose | Empile croise avec Presentation, 12 instances avant le geste, 12 apres), et la carte porte sa variante empilee depuis la 3.0.0. Le style est transmis a chaque carte repetee par le canal `{style}` du schema (une prop scalaire du parent cartographiee dans l'enfant) : le verdict Odoo reste donc `fixed-by-composition`, ce n'est pas un choix redacteur carte par carte mais un choix de section. La mise en page ne change PAS avec le style : colonne en Mobile et Tablette, deux cartes en ligne en Desktop et Wide, memes gouttieres 24 / 48 / 56 / 89 et memes ecarts 16 / 64 / 64 / 64. Decision owner du 2026-09-07 : « que ca reste pareil mais propre » — la tablette garde UNE colonne comme le superpose, meme si deux cartes empilees y font 1228 px de haut contre 640. Basculer la tablette a deux colonnes reste possible plus tard : c'est une variante a rejouer, pas une rupture de contrat. FAIT CODE-ONLY, nomme et non contourne : les deux hauteurs de carte que la section impose au style superpose (418 en Mobile, 288 en Tablette) ne doivent PAS s'appliquer au style empile, dont la hauteur est au contenu (375 / 582 / 482 / 595 aux quatre temoins). Une part instance ne porte pas de canal par prop, la condition vit donc dans le CSS de la projection Odoo, accrochee a l'attribut de style que le gabarit pose deja sur la racine.

Piqueray section « Catégories principales », responsive. 2.0.0 (2026-09-02, vague 031) : ré-extraite du set 2693:20242 (page « 031 · Planches de validation »), quatre variantes sur le SEUL axe Presentation. Les deux réglages `style` et `colonnes` du contrat 1.0.0 SONT RETIRÉS (rupture majeure, décision owner 2026-09-02) : le set 031 ne les déclare plus, ses huit cartes sont toutes superposées, et le colonnage est décidé par l'écran — colonne en Mobile et Tablette, deux cartes en ligne en Desktop et Wide. La grille tombe juste au pixel : 390−48=342, 834−96=738, 1200−112−64=1024 (512 chacune), 1728−178−64=1486 (743 chacune). Deux hauteurs de carte sont mintées depuis le relevé (418 en Mobile, 288 en Tablette) ; Desktop et Wide découlent du rapport 16/9 de la carte.

Historique avant 2.0.0 :
Piqueray section « Catégories principales ». Extracted from the cleaned Figma COMPONENT_SET on DS · Organisms (2115:4277), reviewed at Gate A — not authored. A repeated collection of ds.carte-categorie in a governed grid, with a closed `colonnes` {2,3} enum. Le colonnage est un CHOIX DE DESIGN porté par la section (extension de schéma E1 `layoutByProp.columns`), jamais dérivé du nombre de cartes ; au-delà du compte, les cartes passent à la ligne sur la même grille (wrap natif). Le `style` est transmis à chaque carte répétée (composition), donc verdict Odoo `fixed-by-composition` — pas un choix rédacteur.

Nettoyage de source (Gate A/B, 2026-08-20) : l'axe menteur « Disposition » à 4 valeurs (qui mélangeait style de carte, nombre de colonnes et un contenu déguisé « Rdv ») est remplacé par deux axes orthogonaux Style × Colonnes. « Rdv » redevient une instance renseignée, plus jamais une variante.

Limite nommée : la prop `ctaType` de la carte n'est PAS transportée par item (les champs d'un `arrayOf` sont plats par le schéma) — toutes les cartes d'une section rendent le CTA par défaut de la molécule (lien). L'usage à CTA mixte (carte Maintenance à bouton encadré « Prendre rendez-vous ») est porté hors de cette composition (couche Odoo/usage) — nommé, pas contourné en silence. */
export const CategoriesPrincipales = forwardRef<HTMLElement, CategoriesPrincipalesProps>(function CategoriesPrincipales(
  { presentation = 'mobile', style = 'superpose', cartes, style, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }}  {...rest}>
      <CarteCategorie style={style} afficherDecor={false} titre="Pour portes de garage" texte={[{ text: "SupraMatic & ProMatic. Ouverture ultra-rapide et verrouillage mécanique anti-intrusion breveté." }]} />
<CarteCategorie style={style} afficherDecor={false} titre="Pour portails d'entrée" texte={[{ text: "RotaMatic (Battant) & LineaMatic (Coulissant). Fiabilité absolue et détection d'obstacles pour la sécurité de votre famille." }]} />
    </section>
  );
});
