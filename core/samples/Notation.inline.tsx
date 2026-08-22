/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/notation.contract.json (ds.notation v1.0.0)
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
  "star": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M10 0L12.645 6.35942L19.5106 6.90983L14.2798 11.3906L15.8779 18.0902L10 14.5L4.12215 18.0902L5.72025 11.3906L0.489435 6.90983L7.35497 6.35942L10 0Z\" fill=\"#F98A0B\"/>\n</svg>",
  "star-empty": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M10 0L12.645 6.35942L19.5106 6.90983L14.2798 11.3906L15.8779 18.0902L10 14.5L4.12215 18.0902L5.72025 11.3906L0.489435 6.90983L7.35497 6.35942L10 0Z\" fill=\"#E0E0E0\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "border": 0
  },
  "note1": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "3px"
  },
  "note1Etoile1": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note1Etoile2": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note1Etoile3": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note1Etoile4": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note1Etoile5": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note2": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "3px"
  },
  "note2Etoile1": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note2Etoile2": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note2Etoile3": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note2Etoile4": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note2Etoile5": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note3": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "3px"
  },
  "note3Etoile1": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note3Etoile2": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note3Etoile3": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note3Etoile4": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note3Etoile5": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note4": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "3px"
  },
  "note4Etoile1": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note4Etoile2": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note4Etoile3": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note4Etoile4": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note4Etoile5": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note5": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "gap": "3px"
  },
  "note5Etoile1": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note5Etoile2": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note5Etoile3": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note5Etoile4": {
    "display": "inline-flex",
    "flexShrink": 0
  },
  "note5Etoile5": {
    "display": "inline-flex",
    "flexShrink": 0
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface NotationProps extends HTMLAttributes<HTMLDivElement> {
  /** Nombre d'étoiles pleines. Entier : un avis Google porte une note entière, la moyenne fractionnaire n'existe qu'au niveau du résumé. */
  note?: '1' | '2' | '3' | '4' | '5';
}

/** Bandeau de cinq étoiles portant une note entière de 1 à 5. Créé le 2026-08-18 sur demande owner : la note d'un avis était le seul fait important non éditable (ni en code, ni dans Odoo), parce que la spec 006 avait supprimé l'axe `note` (R7) sur deux prémisses — tous les avis mesurés étaient à 5/5, et l'icône gouvernée `star` est orange intrinsèque. La première prémisse tombe (décision owner) ; la seconde tient, d'où le glyphe interne `star-empty` (même géométrie, gris) qui rend la paire pleine/vide possible.

Pourquoi CINQ bandes plutôt qu'une bande paramétrée — les trois mécanismes plus économiques ont été testés et refusés par le moteur, pas par goût : (1) `visibleWhen` ne teste qu'UNE valeur d'enum (pas de « parmi »), donc « étoile 3 visible si note ≥ 3 » est inexprimable ; (2) `meter` rend un `<div>` de largeur fractionnaire SANS enfants (core/emit-react.ts:3087), donc pas de bandeau d'étoiles à l'intérieur ; (3) `star.svg` porte `fill="#F98A0B"` en dur et ne se recolore pas par `currentColor`. Cinq bandes exclusives projettent en revanche exactement les cinq variantes du master Figma `Notation` (2480:4725).

La demi-étoile est ÉCARTÉE, pas oubliée : décision owner du 2026-08-18, la note d'un avis est un entier de 1 à 5. La barre-résumé d'`Avis Google` continue d'afficher sa moyenne « 4.8 » en texte à côté de cinq étoiles pleines — c'est un affichage de moyenne, pas une note d'avis, et il ne demande donc rien à cet atome. Rouvrir la question coûterait soit un pas de 0,5 (dix variantes), soit un remplissage partiel. */
export const Notation = forwardRef<HTMLDivElement, NotationProps>(function Notation(
  { note = '5', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      {note === '1' ? (<div style={{ ...S.note1 }}>
<span style={{ ...S.note1Etoile1 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note1Etoile2 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star-empty"] }} />
<span style={{ ...S.note1Etoile3 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star-empty"] }} />
<span style={{ ...S.note1Etoile4 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star-empty"] }} />
<span style={{ ...S.note1Etoile5 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star-empty"] }} />
</div>) : null}
{note === '2' ? (<div style={{ ...S.note2 }}>
<span style={{ ...S.note2Etoile1 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note2Etoile2 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note2Etoile3 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star-empty"] }} />
<span style={{ ...S.note2Etoile4 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star-empty"] }} />
<span style={{ ...S.note2Etoile5 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star-empty"] }} />
</div>) : null}
{note === '3' ? (<div style={{ ...S.note3 }}>
<span style={{ ...S.note3Etoile1 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note3Etoile2 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note3Etoile3 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note3Etoile4 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star-empty"] }} />
<span style={{ ...S.note3Etoile5 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star-empty"] }} />
</div>) : null}
{note === '4' ? (<div style={{ ...S.note4 }}>
<span style={{ ...S.note4Etoile1 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note4Etoile2 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note4Etoile3 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note4Etoile4 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note4Etoile5 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star-empty"] }} />
</div>) : null}
{note === '5' ? (<div style={{ ...S.note5 }}>
<span style={{ ...S.note5Etoile1 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note5Etoile2 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note5Etoile3 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note5Etoile4 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
<span style={{ ...S.note5Etoile5 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["star"] }} />
</div>) : null}
    </div>
  );
});
