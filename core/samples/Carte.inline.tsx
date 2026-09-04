/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/carte.contract.json (ds.carte v3.0.0)
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
import { Button } from './Button';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "backgroundColor": "#FFFFFF",
    "fontFamily": "Montserrat, sans-serif",
    "gap": "16px",
    "paddingBottom": "16px",
    "boxShadow": "0px 5px 10px rgba(0, 0, 0, 0.2)",
    "textRendering": "geometricprecision"
  },
  "reassuranceImage": {
    "height": "192px",
    "objectFit": "cover",
    "objectPosition": "50% 50%"
  },
  "categorieImage": {
    "display": "flex",
    "flex": "1 1 auto",
    "minWidth": 0,
    "height": "418px",
    "minHeight": "0px",
    "objectFit": "cover"
  },
  "text": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "gap": "8px",
    "paddingRight": "16px",
    "paddingLeft": "16px",
    "textRendering": "geometricprecision"
  },
  "TitreReassurance": {
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "20px",
    "fontWeight": 500,
    "lineHeight": "25px",
    "textAlign": "center"
  },
  "TitreCategorie": {
    "color": "#26282C",
    "fontSize": "32px",
    "fontWeight": 500,
    "lineHeight": "40px",
    "textAlign": "left",
    "textTransform": "uppercase"
  },
  "TexteReassurance": {
    "color": "#37373B",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "16px",
    "fontWeight": 400,
    "lineHeight": "24px",
    "textAlign": "center"
  },
  "TexteCategorie": {
    "color": "#26282C",
    "fontSize": "18px",
    "fontWeight": 400,
    "lineHeight": "27px",
    "textAlign": "left"
  },
  "Bouton": {
    "display": "flex",
    "alignItems": "flex-start",
    "alignSelf": "flex-start"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "disposition-categorie:root": {
    "width": "743px",
    "gap": "32px",
    "paddingBottom": "0px",
    "backgroundColor": "transparent"
  },
  "disposition-categorie:text": {
    "gap": "16px",
    "paddingRight": "0px",
    "paddingLeft": "0px"
  },
  "disposition-reassurance:root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": "0"
  }
};

export interface CarteProps extends HTMLAttributes<HTMLDivElement> {
  /**  — 2026-09-02 : le set 031 ne dessine QUE la réassurance ; la disposition « categorie » est une forme d'archive conservée (décision owner, cf. Empile de ds.carte-categorie), plus utilisée par aucune page. Écart de parité acquitté. */
  disposition?: 'reassurance' | 'categorie';
  /** Alignement du texte de la carte, miroir de l'axe Alignement du set 031 (2700:25961). Centré est la première variante du set, donc le défaut. La section Réassurances aligne à gauche sous le seuil bureau et centre au-dessus : une part instance n'a pas de canal par mode, cette bascule est un fait code-only de la projection Odoo, nommé dans le CSS de la section. */
  alignement?: 'centre' | 'gauche';
  /**  Défaut relevé sur le set 031 le 2026-09-02. */
  titre?: string;
  /** La ROUTE de l'image, jamais ses octets. Figma n'expose aucune propriete de composant pour ces pixels (trou A5, matrice ligne 91, colonne Bindable : image content not bindable) : le contrat porte donc la route, la photo arrive a l'execution. Defaut vide, et il le reste — un defaut non vide substituerait une image et la ferait entrer au contrat par la porte de derriere. Sur le canevas, ce cadre dessine le lavis technique #D9D9D9 ; la photo qu'un designer y voit est une maquette, hors contrat, preservee a la regeneration par une passe de sauvetage explicite (docs/handoff/08-status-what-doesnt-work.md, §6). */
  imageUrl?: string;
  imageAlt?: string;
  /** The first sentence is the strong range observed in both immutable master variants (Figma Bold/700); concatenate segments for the native Figma TEXT value. The inventory has no 700-weight token, so this bounded mark carries the observed 700 literal rather than inventing a token. Défaut relevé sur le set 031 le 2026-09-02. */
  texte?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** Nested Categorie Link Button label. The source Carte component does not expose it as a top-level Figma property, so immutable occurrence values come from the nested Button TEXT property retained by the campaign census. */
  ctaLabel?: string;
  /** Nested Categorie Link Button leading glyph retained from the concrete nested Figma instance. */
  ctaIconLeftGlyph?: 'pdf';
  /** Nested Categorie Link Button trailing glyph retained from the concrete nested Figma instance. */
  ctaIconRightGlyph?: 'arrow-right' | 'download';
}

/** Piqueray Carte, responsive. 3.0.0 (2026-09-02, vague 031) : la branche réassurance est ré-extraite du set 031 CarteReassurance (2700:25961), qui porte un axe Alignement {Centré, Gauche} et lie ses espacements aux jetons par écran. Ce qui change : écart et marge basse suivent spacing.carte-reassurance.gap et pad-bas (16 en mobile, 24 au-delà), la photo suit photo-h (192 / 240 / 364), le titre monte le style responsive H4 (20/25 → 24/30) et le texte la recette de corps (16/24 → 18/27), l'alignement devient une propriété gouvernée au lieu d'un choix figé. La largeur dessinée 341,33 est un témoin : la carte remplit sa piste. Avant cette version les vingt cartes de la section Réassurances étaient des cadres libres, sans lien au composant : elles ont été remplacées par des instances le 2026-09-02, à zéro pixel de différence sur les quatre vues. La disposition « categorie » est conservée en archive, plus utilisée par aucune page.

Historique avant 3.0.0 :
Piqueray Carte. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. It is one context-width card with two Figma dispositions: Reassurance (fixed-height image, centred content) and Categorie (remaining-space image and a Link Button CTA). Image URLs remain consumer/campaign inputs, never capture defaults.

Version 2.0.0 is a breaking change: `texte` is now typed rich text so the source's leading strong range is preserved without raw HTML. */
export const Carte = forwardRef<HTMLDivElement, CarteProps>(function Carte(
  { disposition = 'reassurance', alignement = 'centre', ctaIconLeftGlyph = 'pdf', ctaIconRightGlyph = 'download', titre = 'Sécurité et conformité', imageUrl = '', imageAlt = '', ctaLabel = 'Contactez-nous', texte = [{"text":"Respectent les normes des bâtiments publics et les réglementations pompiers."}], style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`disposition-${disposition}:root`] ?? {}), ...style }}  {...rest}>
      {disposition === 'reassurance' ? (<img style={{ ...S.reassuranceImage }} src={String(imageUrl)} alt={String(imageAlt)}>

</img>) : null}
{disposition === 'categorie' ? (<img style={{ ...S.categorieImage }} src={String(imageUrl)} alt={String(imageAlt)}>

</img>) : null}
<div style={{ ...S.text, ...(V[`disposition-${disposition}:text`] ?? {}) }}>
{disposition === 'reassurance' ? (<span style={{ ...S.TitreReassurance, ...(alignement === 'gauche' ? {"textAlign":"left"} : {}) }}>{titre}</span>) : null}
{disposition === 'categorie' ? (<span style={{ ...S.TitreCategorie }}>{titre}</span>) : null}
{disposition === 'reassurance' ? (<span style={{ ...S.TexteReassurance, ...(alignement === 'gauche' ? {"textAlign":"left"} : {}) }}>{texte.map(({ text, strong, underline }, index) => { const inner = underline ? <u>{text}</u> : text; return strong ? <strong key={index} style={{ fontWeight: "700", fontSize: "18px", lineHeight: "27px" }}>{inner}</strong> : <span key={index}>{inner}</span>; })}</span>) : null}
{disposition === 'categorie' ? (<span style={{ ...S.TexteCategorie }}>{texte.map(({ text, strong, underline }, index) => { const inner = underline ? <u>{text}</u> : text; return strong ? <strong key={index} style={{ fontWeight: "700" }}>{inner}</strong> : <span key={index}>{inner}</span>; })}</span>) : null}
</div>
{disposition === 'categorie' ? (<div style={{ ...S.Bouton }}>
<Button variant="link" iconLeft iconRight iconLeftGlyph={ctaIconLeftGlyph} iconRightGlyph={ctaIconRightGlyph}>{ctaLabel}</Button>
</div>) : null}
    </div>
  );
});
