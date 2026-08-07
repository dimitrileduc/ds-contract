/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/review-card.contract.json (ds.review-card v1.0.0)
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

const ICONS: Record<string, string> = {
  "google": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z\" fill=\"#4285F4\"/>\n<path d=\"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z\" fill=\"#34A853\"/>\n<path d=\"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z\" fill=\"#FBBC05\"/>\n<path d=\"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z\" fill=\"#EA4335\"/>\n</svg>",
  "star": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M10 0L12.645 6.35942L19.5106 6.90983L14.2798 11.3906L15.8779 18.0902L10 14.5L4.12215 18.0902L5.72025 11.3906L0.489435 6.90983L7.35497 6.35942L10 0Z\" fill=\"#F98A0B\"/>\n</svg>",
  "check": "<svg width=\"13\" height=\"10\" viewBox=\"0 0 13 10\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M1 5.4L4.5 9L11.5 1\" stroke=\"white\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "borderStyle": "solid",
    "backgroundColor": "#FFFFFF",
    "borderColor": "#F4F6FA",
    "fontFamily": "Montserrat, sans-serif",
    "width": "299px",
    "minHeight": "239px",
    "paddingTop": "24px",
    "paddingBottom": "24px",
    "paddingLeft": "24px",
    "paddingRight": "24px",
    "gap": "14px",
    "borderRadius": "8px",
    "borderWidth": "1px"
  },
  "entete": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between"
  },
  "profil": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "12px"
  },
  "avatarInitiale": {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
    "backgroundColor": "#9BA4B5",
    "width": "40px",
    "height": "40px",
    "minWidth": "40px",
    "borderRadius": "20px"
  },
  "initialeTexte": {
    "fontFamily": "Montserrat, sans-serif",
    "fontWeight": 600,
    "fontSize": "18px",
    "color": "#FFFFFF",
    "lineHeight": "18px"
  },
  "avatarPhoto": {
    "width": "40px",
    "height": "40px",
    "minWidth": "40px",
    "borderRadius": "20px"
  },
  "identite": {
    "display": "flex",
    "flexDirection": "column",
    "justifyContent": "center",
    "gap": "2px"
  },
  "auteur": {
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "16px",
    "fontWeight": 600,
    "color": "#000000",
    "lineHeight": "19.2px"
  },
  "date": {
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "color": "#8A8A8A",
    "lineHeight": "16.8px"
  },
  "marque": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "notation": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "8px"
  },
  "etoiles": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "3px"
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
  "verification": {
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
    "width": "16px",
    "height": "16px",
    "minWidth": "16px",
    "borderRadius": "8px",
    "backgroundColor": "#000000"
  },
  "coche": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "temoignage": {
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "color": "#000000",
    "lineHeight": "19.6px"
  },
  "lireLaSuite": {
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "color": "#8A8A8A"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface ReviewCardProps extends HTMLAttributes<HTMLElement> {
  auteur: string;
  initiale?: string;
  date?: string;
  texte: string;
  /** Trouvaille de la convergence T040 : le widget affiche un lien « Lire la suite » sous les avis qu'il a lui-même tronqués (ellipse déjà présente dans `texte`), absent sur les avis complets (mesuré : Thierry Picard, carte 4). La troncature multi-lignes elle-même reste refusée (R10, `-webkit-line-clamp` hors registre) — ce booléen ne gouverne QUE la visibilité du lien. */
  tronque?: boolean;
  initialeVisible?: boolean;
  photo?: boolean;
  /** src côté code ; inerte sur le canevas (trou A5, R6) — une prop scalaire ne peut pas être figma.kind:'NONE'. */
  photoUrl?: string;
  photoAlt?: string;
  verifie?: boolean;
}

/** Une carte d'avis Google, mesurée sur les octets natifs de l'aplat « Avis Google » (widget tiers Trustindex/Google, dernière zone hors gouvernance du fichier Piqueray — spec 006). Contrat d'abord, master généré : aucun master dessiné à la main (première du dépôt, R1). Le master reste GÉNÉRIQUE par construction (contenu d'exemple neutre) ; le contenu réel des avis vit sur les 8 occurrences adoptées, porté par propriétés (jamais par override brut).

Limites nommées (measures/mesures-aplat.md, measures/faisabilite-canaux.md) : (1) l'exclusion pastille/photo est une CONVENTION de deux booléens indépendants, pas une contrainte de schéma — `visibleWhen` n'a pas de négation et un axe d'enum romprait la variation par item du `repeat` ; (2) la couleur de fond de la pastille-initiale est FIXE et gouvernée — les 5 avis réels portent 5 teintes différentes, non modélisables (aucun canal ne lie une couleur CSS à une valeur de texte libre par item) ; écart assumé, arbitré par l'owner (« la couleur, rien à faire ») ; (3) l'avatar photo reste un aplat gris + † sur le canevas — trou A5, non refermé (R6) ; le pixel réel est un override de fill IMAGE hors contrat, appliqué après le dernier amend ; (4) la séparation carte/fond du widget réel est une ombre douce (mesurée par balayage de bord : dégradé lisse sur ~15px) — `box-shadow` étant hors des deux registres de canaux, le repli est une bordure fine 1px, seul canal disponible. */
export const ReviewCard = forwardRef<HTMLElement, ReviewCardProps>(function ReviewCard(
  { tronque = false, initialeVisible = true, photo = false, verifie = true, auteur, initiale = 'P', date = 'il y a 2 mois', texte, photoUrl = '', photoAlt = '', style, children, ...rest },
  ref,
) {
  return (
    <article ref={ref} style={{ ...S.root, ...style }} data-tronque={tronque || undefined} data-initiale-visible={initialeVisible || undefined} data-photo={photo || undefined} data-verifie={verifie || undefined}  {...rest}>
      <div style={{ ...S.entete }}>
<div style={{ ...S.profil }}>
{initialeVisible ? (<div style={{ ...S.avatarInitiale }}>
<span style={{ ...S.initialeTexte }}>{initiale}</span>
</div>) : null}
{photo ? (<img style={{ ...S.avatarPhoto }} src={String(photoUrl)} alt={String(photoAlt)}>

</img>) : null}
<div style={{ ...S.identite }}>
<span style={{ ...S.auteur }}>{auteur}</span>
<span style={{ ...S.date }}>{date}</span>
</div>
</div>
<span style={{ ...S.marque }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["google"] }} />
</div>
<div style={{ ...S.notation }}>
<div style={{ ...S.etoiles }}>
<span style={{ ...S.etoile1 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.etoile2 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.etoile3 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.etoile4 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.etoile5 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
</div>
{verifie ? (<div style={{ ...S.verification }}>
<span style={{ ...S.coche }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["check"] }} />
</div>) : null}
</div>
<p style={{ ...S.temoignage }}>{texte}</p>
{tronque ? (<span style={{ ...S.lireLaSuite }}>Lire la suite</span>) : null}
    </article>
  );
});
