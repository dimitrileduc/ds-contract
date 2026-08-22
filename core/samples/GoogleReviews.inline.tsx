/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/google-reviews.contract.json (ds.google-reviews v2.0.0)
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
import { ReviewCard } from './ReviewCard';

const ICONS: Record<string, string> = {
  "google-wordmark": "<svg width=\"74\" height=\"24\" viewBox=\"0 0 74 24\" overflow=\"visible\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<text x=\"0\" y=\"18\" font-family=\"Montserrat, sans-serif\" font-size=\"22\" font-weight=\"500\" fill=\"#4285F4\">G</text>\n<text x=\"18\" y=\"18\" font-family=\"Montserrat, sans-serif\" font-size=\"22\" font-weight=\"500\" fill=\"#EA4335\">o</text>\n<text x=\"32\" y=\"18\" font-family=\"Montserrat, sans-serif\" font-size=\"22\" font-weight=\"500\" fill=\"#FBBC05\">o</text>\n<text x=\"46\" y=\"18\" font-family=\"Montserrat, sans-serif\" font-size=\"22\" font-weight=\"500\" fill=\"#4285F4\">g</text>\n<text x=\"60\" y=\"18\" font-family=\"Montserrat, sans-serif\" font-size=\"22\" font-weight=\"500\" fill=\"#34A853\">l</text>\n<text x=\"66\" y=\"18\" font-family=\"Montserrat, sans-serif\" font-size=\"22\" font-weight=\"500\" fill=\"#EA4335\">e</text>\n</svg>",
  "star": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M10 0L12.645 6.35942L19.5106 6.90983L14.2798 11.3906L15.8779 18.0902L10 14.5L4.12215 18.0902L5.72025 11.3906L0.489435 6.90983L7.35497 6.35942L10 0Z\" fill=\"#F98A0B\"/>\n</svg>",
  "chevron-left": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M19.293 7.29302C19.6835 6.90249 20.3165 6.90249 20.707 7.29302C21.0975 7.68354 21.0975 8.31655 20.707 8.70708L13.414 16L20.707 23.293C21.0975 23.6835 21.0975 24.3166 20.707 24.7071C20.3165 25.0976 19.6835 25.0976 19.293 24.7071L11.293 16.7071C10.9024 16.3166 10.9024 15.6835 11.293 15.293L19.293 7.29302Z\" fill=\"currentColor\"/>\n</svg>",
  "chevron-right": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M11.293 7.29302C11.6835 6.90249 12.3165 6.90249 12.707 7.29302L20.707 15.293C21.0975 15.6835 21.0975 16.3166 20.707 16.7071L12.707 24.7071C12.3165 25.0976 11.6835 25.0976 11.293 24.7071C10.9024 24.3166 10.9024 23.6835 11.293 23.293L18.5859 16L11.293 8.70708C10.9024 8.31655 10.9024 7.68354 11.293 7.29302Z\" fill=\"currentColor\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "border": 0,
    "position": "relative",
    "backgroundColor": "#FFFFFF",
    "fontFamily": "Montserrat, sans-serif",
    "width": "1552px",
    "minHeight": "328px",
    "gap": "12px",
    "paddingTop": "4px",
    "paddingBottom": "8px",
    "paddingLeft": "11px",
    "paddingRight": "11px"
  },
  "resume": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between",
    "borderStyle": "solid",
    "backgroundColor": "#FFFFFF",
    "borderColor": "#F4F6FA",
    "paddingTop": "12px",
    "paddingBottom": "12px",
    "paddingLeft": "16px",
    "paddingRight": "16px",
    "borderRadius": "8px",
    "borderWidth": "1px"
  },
  "infos": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "10px"
  },
  "marque": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "qualificatifTexte": {
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": 600,
    "color": "#000000"
  },
  "notation": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "2px"
  },
  "etoile1": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "etoile2": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "etoile3": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "etoile4": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "etoile5": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "noteGlobaleTexte": {
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": 600,
    "color": "#000000"
  },
  "separateur": {
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "color": "#8A8A8A"
  },
  "volume": {
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "color": "#8A8A8A"
  },
  "ecrireAvis": {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
    "borderStyle": "solid",
    "borderColor": "#37373B",
    "paddingTop": "8px",
    "paddingBottom": "8px",
    "paddingLeft": "22px",
    "paddingRight": "22px",
    "borderWidth": "1px",
    "borderRadius": "0px"
  },
  "libelle": {
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": 600,
    "color": "#000000"
  },
  "cartes": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between",
    "position": "relative"
  },
  "flecheGauche": {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
    "position": "absolute"
  },
  "pastilleGauche": {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
    "borderStyle": "solid",
    "backgroundColor": "#FFFFFF",
    "borderColor": "#F4F6FA",
    "width": "30px",
    "height": "30px",
    "minWidth": "30px",
    "borderRadius": "15px",
    "borderWidth": "1px"
  },
  "iconeGauche": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "groupeCartes": {
    "display": "grid",
    "gridTemplateColumns": "repeat(5, minmax(0, 1fr))",
    "width": "100%",
    "minWidth": 0,
    "gap": "8px"
  },
  "flecheDroite": {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
    "position": "absolute"
  },
  "pastilleDroite": {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
    "borderStyle": "solid",
    "backgroundColor": "#FFFFFF",
    "borderColor": "#F4F6FA",
    "width": "30px",
    "height": "30px",
    "minWidth": "30px",
    "borderRadius": "15px",
    "borderWidth": "1px"
  },
  "iconeDroite": {
    "display": "inline-flex",
    "flexShrink": 0
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface GoogleReviewsProps extends HTMLAttributes<HTMLElement> {
  /** Note globale telle qu affichee par le widget — POINT decimal (4.8), pas une virgule : mesure directe sur l aplat (T040, corrige une transcription initiale fautive). */
  noteGlobale?: string;
  /** Libellé qualitatif du widget (« Excellent » mesuré sur l'aplat, T012) — texte de chrome du widget, pas un avis individuel, mais porté par propriété comme le reste du contenu réel. */
  qualificatif?: string;
  volume?: string;
  /** Flèches de carrousel — mesurées présentes aux deux bords de l'aplat (T012). */
  montrerControles?: boolean;
  /** La collection de cartes — code-only par construction (figma.kind:'NONE' obligatoire pour un arrayOf, R8). React mappe le tableau vivant ; html/react-inline/canevas rendent le `sample` du repeat (générique, jamais le contenu réel — FR-010). */
  avis?: Array<{ auteur: string; initiale: string; date: string; texte: string; avatar: 'Initiale' | 'Photo'; note: '1' | '2' | '3' | '4' | '5'; photoUrl: string; photoAlt: string }>;
}

/** Le bloc « Avis Google » — dernier aplat tiers du fichier Piqueray (widget Trustindex/Google, spec 006). Périmètre = le RECTANGLE de l'aplat seul (1552 × ~328 dessiné), PAS le GROUP entier : l'instance de Section-header voisine reste un frère intact (FR-008), jamais absorbée dans ce contrat. Le root est en hauteur Auto/Hug avec 328 px comme hauteur minimale gouvernée : le sample nominal reste identique, tandis qu'une rangée supplémentaire issue de l'authoring agrandit la section sans overflow.

Contrat d'abord, master généré (R1) : le master naît générique (`repeat.sample` porte 5 enregistrements neutres) ; le contenu réel des 8 occurrences vit en overrides de propriétés sur les instances de carte imbriquées (FR-010, via le mécanisme documenté R8 — aucune prop de section ne porte la collection côté canevas, `avis` est figma.kind:'NONE' par construction).

Interdit dur : AUCUN `component`-ref vers `ds.button` dans ce contrat (R5) — la résolution des dépendances imbriquées se fait par NOM (`findComponentByName`), le contrat dirait `Button`, le master vivant s'appelle « Bouton » : le script poussé échouerait. Les flèches de carrousel et le CTA « Écrire un avis » sont donc dessinés en parts (frame + icon.asset / texte), jamais des instances de composant. Réemploi perdu, nommé (FR-007).

Décision owner du 2026-08-12 : `groupeCartes` est une grille native de cinq colonnes égales ; chaque `Review-card` remplit sa cellule. Les flèches sont des overlays absolus ancrés aux bords et ne participent pas au calcul des colonnes.

Promotion 2.0.0 (2026-08-18). MAJEUR par ricochet de ds.review-card 2.0.0 : la collection `avis` perd trois champs (`tronque`, `initialeVisible`, `photo`) et en gagne deux (`avatar`, `note`). Le mapping d'un `repeat` se fait PAR NOM, donc la forme d'un enregistrement d'avis suit celle des props de l'enfant, sans exception. */
export const GoogleReviews = forwardRef<HTMLElement, GoogleReviewsProps>(function GoogleReviews(
  { montrerControles = true, noteGlobale = '4.8', qualificatif = 'Excellent', volume = '93 avis', avis, style, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} style={{ ...S.root, ...style }} data-montrer-controles={montrerControles || undefined}  {...rest}>
      <div style={{ ...S.resume }}>
<div style={{ ...S.infos }}>
<span style={{ ...S.marque }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["google-wordmark"] }} />
<span style={{ ...S.qualificatifTexte }}>{qualificatif}</span>
<div style={{ ...S.notation }}>
<span style={{ ...S.etoile1 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.etoile2 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.etoile3 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.etoile4 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.etoile5 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.noteGlobaleTexte }}>{noteGlobale}</span>
</div>
<span style={{ ...S.separateur }}>|</span>
<span style={{ ...S.volume }}>{volume}</span>
</div>
<div style={{ ...S.ecrireAvis }}>
<span style={{ ...S.libelle }}>Écrire un avis</span>
</div>
</div>
<div style={{ ...S.cartes }}>
{montrerControles ? (<div style={{ ...S.flecheGauche, ...(montrerControles ? {"position":"absolute","left":"-15px","top":"50%","transform":"translateY(-50%)"} : {}) }}>
<div style={{ ...S.pastilleGauche }}>
<span style={{ ...S.iconeGauche }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["chevron-left"] }} />
</div>
</div>) : null}
<div style={{ ...S.groupeCartes }}>
<ReviewCard auteur="Prénom N." initiale="P" date="il y a 2 mois" texte="Un témoignage neutre, exemple générique de contenu." avatar="Initiale" note="5" photoUrl="" photoAlt="" />
<ReviewCard auteur="Prénom N." initiale="P" date="il y a 3 mois" texte="Un témoignage neutre, exemple générique de contenu." avatar="Initiale" note="5" photoUrl="" photoAlt="" />
<ReviewCard auteur="Prénom N." initiale="P" date="il y a 4 mois" texte="Un témoignage neutre, exemple générique de contenu." avatar="Initiale" note="5" photoUrl="" photoAlt="" />
<ReviewCard auteur="Prénom N." initiale="P" date="il y a 5 mois" texte="Un témoignage neutre, exemple générique de contenu." avatar="Initiale" note="5" photoUrl="" photoAlt="" />
<ReviewCard auteur="Prénom N." initiale="P" date="il y a 6 mois" texte="Un témoignage neutre, exemple générique de contenu." avatar="Initiale" note="5" photoUrl="" photoAlt="" />
</div>
{montrerControles ? (<div style={{ ...S.flecheDroite, ...(montrerControles ? {"position":"absolute","right":"-15px","top":"50%","transform":"translateY(-50%)"} : {}) }}>
<div style={{ ...S.pastilleDroite }}>
<span style={{ ...S.iconeDroite }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["chevron-right"] }} />
</div>
</div>) : null}
</div>
    </section>
  );
});
