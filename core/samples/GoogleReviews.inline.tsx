/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/google-reviews.contract.json (ds.google-reviews v3.2.0)
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
import { Notation } from './Notation';
import { Button } from './Button';
import { ReviewCard } from './ReviewCard';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "paddingInline": "24px",
    "paddingBlock": "0px",
    "gap": "32px"
  },
  "SectionHeader": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start",
    "gap": "8px"
  },
  "Accroche": {
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": 400,
    "lineHeight": "20px",
    "letterSpacing": "0.15em",
    "textAlign": "left"
  },
  "Titre": {
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "24px",
    "fontWeight": 600,
    "letterSpacing": "0px",
    "lineHeight": "30px",
    "textAlign": "left"
  },
  "avisGoogle": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "backgroundColor": "#FFFFFF",
    "gap": "12px",
    "minHeight": "328px"
  },
  "resume": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "borderStyle": "solid",
    "backgroundColor": "#FFFFFF",
    "borderColor": "#F4F6FA",
    "paddingInline": "16px",
    "paddingBlock": "24px",
    "borderRadius": "4px",
    "borderWidth": "1px",
    "gap": "8px"
  },
  "infos": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "gap": "8px"
  },
  "marque": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "logoGoogle": {
    "display": "flex"
  },
  "Vector": {
    "backgroundColor": "#ea4335"
  },
  "vector2": {
    "backgroundColor": "#fbbc05"
  },
  "vector3": {
    "backgroundColor": "#4285f4"
  },
  "vector4": {
    "backgroundColor": "#34a853"
  },
  "vector5": {
    "backgroundColor": "#ea4335"
  },
  "vector6": {
    "backgroundColor": "#4285f4"
  },
  "qualificatifTexte": {
    "color": "#000000",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": 600,
    "letterSpacing": "0px",
    "lineHeight": "20px"
  },
  "notation": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "gap": "8px"
  },
  "noteGlobaleTexte": {
    "color": "#000000",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "32px",
    "fontWeight": 600,
    "letterSpacing": "0px",
    "lineHeight": "40px"
  },
  "separateur": {
    "color": "#000000",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": 500,
    "letterSpacing": "0px",
    "lineHeight": "20px"
  },
  "volume": {
    "color": "#000000",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": 500,
    "letterSpacing": "0px",
    "lineHeight": "20px"
  },
  "groupeCartes": {
    "display": "flex",
    "flexDirection": "row",
    "gap": "16px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "presentation-tablette:root": {
    "paddingInline": "48px"
  },
  "presentation-tablette:resume": {
    "paddingInline": "24px",
    "paddingBlock": "16px",
    "gap": "16px",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between"
  },
  "presentation-tablette:infos": {
    "gap": "12px",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "presentation-tablette:notation": {
    "gap": "12px",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "presentation-tablette:groupeCartes": {
    "flexDirection": "column"
  },
  "presentation-desktop:root": {
    "paddingInline": "56px",
    "gap": "15px"
  },
  "presentation-desktop:SectionHeader": {
    "gap": "16px",
    "flexDirection": "column",
    "alignItems": "center"
  },
  "presentation-desktop:avisGoogle": {
    "paddingInline": "11px",
    "paddingTop": "4px",
    "paddingBottom": "8px"
  },
  "presentation-desktop:resume": {
    "paddingBlock": "12px",
    "gap": "0px",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between"
  },
  "presentation-desktop:infos": {
    "gap": "10px",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "presentation-desktop:notation": {
    "gap": "2px",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "presentation-desktop:groupeCartes": {
    "gap": "8px"
  },
  "presentation-wide:root": {
    "paddingInline": "89px",
    "gap": "40px"
  },
  "presentation-wide:SectionHeader": {
    "gap": "16px",
    "flexDirection": "column",
    "alignItems": "center"
  },
  "presentation-wide:avisGoogle": {
    "paddingTop": "4px",
    "paddingBottom": "8px"
  },
  "presentation-wide:resume": {
    "paddingBlock": "12px",
    "gap": "0px",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between"
  },
  "presentation-wide:infos": {
    "gap": "10px",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "presentation-wide:notation": {
    "gap": "2px",
    "flexDirection": "row",
    "alignItems": "center"
  },
  "presentation-wide:groupeCartes": {
    "gap": "8px"
  }
};

export interface GoogleReviewsProps extends HTMLAttributes<HTMLElement> {
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  accroche?: string;
  titre?: string;
  /** Libellé qualitatif du widget (« Excellent » mesuré sur l'aplat, T012) — texte de chrome du widget, pas un avis individuel, mais porté par propriété comme le reste du contenu réel. */
  qualificatif?: string;
  /** Note globale telle qu affichee par le widget — POINT decimal (4.8), pas une virgule : mesure directe sur l aplat (T040, corrige une transcription initiale fautive). */
  noteGlobale?: string;
  volume?: string;
  /** La collection de cartes — code-only par construction (figma.kind:'NONE' obligatoire pour un arrayOf, R8). React mappe le tableau vivant ; html/react-inline/canevas rendent le `sample` du repeat (générique, jamais le contenu réel — FR-010). Chaque avis porte son propre `lienAvis` : l'adresse de l'avis Google d'origine, ouverte par le bouton « Lire la suite » de sa carte. */
  avis?: Array<{ auteur: string; initiale: string; date: string; texte: string; avatar: 'Initiale' | 'Photo'; note: '1' | '2' | '3' | '4' | '5'; photoUrl: string; photoAlt: string; lienAvis: string }>;
  /** Nombre d'étoiles pleines du bloc résumé. Pilote la variante du composant gouverné ds.notation. Le composant ne connaît que des notes ENTIÈRES : une note affichée « 4.8 » se dessine avec cinq étoiles pleines, ce que fait la maquette. Réglable depuis le panneau Odoo, pas en édition directe (décision owner 2026-09-03). */
  note?: '1' | '2' | '3' | '4' | '5';
  /** Adresse du bouton « Voir tous les avis » — la fiche Google de l'établissement. Réglable depuis le panneau Odoo. Vide, le bouton ne navigue pas. */
  lienAvis?: string;
}

/** 3.1.2 (2026-09-09, decision owner, option A « lien en place ») : « Voir tous les avis » passe du style outlineNoir au style link avec fleche (iconRight), dans la barre Google — navigation, pas conversion. Source Figma posee d'abord (4 boutons du set, 40 instances suivent). Le bouton fait 30 de haut au lieu de 54 : la section raccourcit (Wide 493 → 469, Mobile 1755 → 1731).

PROPOSED contract extracted from the design canvas (extract/figma dump v1) — API, anatomy, and token bindings inverted from the drawn structure. Semantics beyond the name/axis inference table, a11y, events, and slot accepts are not canvas-recoverable; review before adoption. Correction 2026-09-04 : les cinq entrées de `sample` omettaient trois clés du type de l'élément (avatar, note, lienAvis) — le typage de l'histoire générée refusait de compiler. Complétées avec la valeur dessinée : avatar Initiale, note 5, lien vide. Plan de document : la partie titre porte la balise h2 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau.

VERSION 3.2.0 (2026-09-09, vague « arrondis ») — le bandeau de résumé (resume) passe de radius.8 à radius.4 : un seul rayon dans tout le DS, décision owner. Canevas : radius/4 lié sur les 4 variantes, versions nommées avant/après. Ajout purement additif : MINEUR. */
export const GoogleReviews = forwardRef<HTMLElement, GoogleReviewsProps>(function GoogleReviews(
  { presentation = 'mobile', note = '5', accroche = 'Nos avis Google vérifiés', titre = 'Plus de 1500 portes installées par année et autant de clients satisfaits', qualificatif = 'Excellent', noteGlobale = '4.8', volume = '93 avis', lienAvis = '', avis, style, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }}  {...rest}>
      <div style={{ ...S.SectionHeader, ...(V[`presentation-${presentation}:SectionHeader`] ?? {}) }}>
<span style={{ ...S.Accroche }}>{accroche}</span>
<h2 style={{ ...S.Titre }}>{titre}</h2>
</div>
<div style={{ ...S.avisGoogle, ...(V[`presentation-${presentation}:avisGoogle`] ?? {}) }}>
<div style={{ ...S.resume, ...(V[`presentation-${presentation}:resume`] ?? {}) }}>
<div style={{ ...S.infos, ...(V[`presentation-${presentation}:infos`] ?? {}) }}>
<div style={{ ...S.marque }}>
<div style={{ ...S.logoGoogle }}>
<div style={{ ...S.Vector }}>

</div>
<div style={{ ...S.vector2 }}>

</div>
<div style={{ ...S.vector3 }}>

</div>
<div style={{ ...S.vector4 }}>

</div>
<div style={{ ...S.vector5 }}>

</div>
<div style={{ ...S.vector6 }}>

</div>
</div>
</div>
<span style={{ ...S.qualificatifTexte }}>{qualificatif}</span>
<div style={{ ...S.notation, ...(V[`presentation-${presentation}:notation`] ?? {}) }}>
<Notation note={note} />
<span style={{ ...S.noteGlobaleTexte }}>{noteGlobale}</span>
</div>
<span style={{ ...S.separateur }}>|</span>
<span style={{ ...S.volume }}>{volume}</span>
</div>
<Button variant="link" iconRight>Voir tous les avis</Button>
</div>
<div style={{ ...S.groupeCartes, ...(V[`presentation-${presentation}:groupeCartes`] ?? {}) }}>
<ReviewCard verifie={false} photoAlt="" texte="super très pro et service après vente présent" photoUrl="" date="il y a 2 mois" initiale="P" auteur="pho syster" avatar="Initiale" note="5" lienAvis="" />
<ReviewCard verifie={false} photoAlt="" texte="Je vous envoie mon message un peu tardivement car problème de boite mail. Super ravie du travail réalisé…" photoUrl="" date="il y a 3 mois" initiale="P" auteur="Petit Nicole" avatar="Initiale" note="5" lienAvis="" />
<ReviewCard verifie={false} photoAlt="" texte="Travail propre, soigné, ouvrier expert dans son métier, super suivi par Wael (technicien installation) qui est à fait le suivi…" photoUrl="" date="il y a 4 mois" initiale="A" auteur="Aun Bukhari" avatar="Initiale" note="5" lienAvis="" />
<ReviewCard verifie={false} photoAlt="" texte="Dépannage ultra rapide et professionnel" photoUrl="" date="il y a 5 mois" initiale="T" auteur="Thierry Picard" avatar="Initiale" note="5" lienAvis="" />
<ReviewCard verifie={false} photoAlt="" texte="Je ne mais pas 5 étoiles mais 10 les 2 placeurs de mes 2 portes de garage il…" photoUrl="" date="il y a 6 mois" initiale="m" auteur="miguel martinez" avatar="Initiale" note="5" lienAvis="" />
</div>
</div>
    </section>
  );
});
