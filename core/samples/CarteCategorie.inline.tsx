/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/carte-categorie.contract.json (ds.carte-categorie v1.1.0)
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

const ICONS: Record<string, string> = {
  "carte-categorie-decor": "<svg width=\"100\" height=\"131\" viewBox=\"0 0 100 131\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M55.3672 99.0918V110.537L83.8877 94.291V82.7852L55.3672 99.0918ZM55.3672 81.6787V93.3945L83.8877 77.1084V65.377L55.3672 81.6787ZM55.3672 64.8252V75.9785L83.8877 59.7012V48.5234L55.3672 64.8252ZM43.9189 52.4229L54.8809 59.4072L83.4033 43.1172L71.6953 35.9844L43.9189 52.4229ZM99.4395 101.515L99.1875 101.658L50.2178 129.586L49.9697 129.727L49.7217 129.586L0.751953 101.658L0.5 101.515V28.7861L0.751953 28.6426L49.7217 0.716797L49.9697 0.576172L50.2178 0.716797L99.1875 28.6426L99.4395 28.7861V101.515Z\" stroke=\"currentColor\"/>\n</svg>",
  "arrow-right": "<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M14.0575 4.74133L13.1737 5.6252L16.9236 9.37508H0.625V10.6251H16.9234L13.1737 14.3749L14.0575 15.2588L19.3163 10L14.0575 4.74133Z\" fill=\"currentColor\"/>\n</svg>",
};

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "position": "relative"
  },
  "photoSuperpose": {
    "display": "flex",
    "width": "100%",
    "minWidth": 0,
    "aspectRatio": 1.7799043062200957,
    "objectFit": "cover",
    "zIndex": "0"
  },
  "decor": {
    "display": "inline-flex",
    "flexShrink": 0,
    "color": "#FFFFFF",
    "top": "32px",
    "right": "32px",
    "position": "absolute",
    "zIndex": "1"
  },
  "contenuSuperpose": {
    "display": "flex",
    "flexDirection": "column",
    "gap": "8px",
    "paddingTop": "32px",
    "paddingRight": "32px",
    "paddingBottom": "32px",
    "paddingLeft": "32px",
    "backgroundImage": "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%)",
    "position": "absolute",
    "left": "0",
    "right": "0",
    "bottom": "0",
    "zIndex": "2"
  },
  "inner": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-end",
    "gap": "16px"
  },
  "blocTexte": {
    "display": "flex",
    "flexDirection": "column",
    "flex": "1 1 auto",
    "minWidth": 0,
    "gap": "8px"
  },
  "TitreSuperpose": {
    "color": "#FFFFFF",
    "fontSize": "40px",
    "fontWeight": 400,
    "lineHeight": "50px",
    "textTransform": "uppercase"
  },
  "TexteSuperpose": {
    "color": "#FFFFFF",
    "fontSize": "18px",
    "fontWeight": 400,
    "lineHeight": "27px"
  },
  "Fleche": {
    "display": "inline-flex",
    "flexShrink": 0,
    "color": "#FFFFFF"
  },
  "categorieImage": {
    "display": "flex",
    "width": "100%",
    "minWidth": 0,
    "aspectRatio": 1.777511961722488,
    "objectFit": "cover"
  },
  "texteEmpile": {
    "display": "flex",
    "flexDirection": "column",
    "gap": "16px"
  },
  "TitreCategorie": {
    "color": "#26282C",
    "fontSize": "32px",
    "fontWeight": 500,
    "lineHeight": "40px",
    "textAlign": "left",
    "textTransform": "uppercase"
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
  "style-empile:root": {
    "backgroundColor": "#FFFFFF",
    "gap": "32px"
  },
  "style-superpose:root": {
    "display": "flex",
    "flexDirection": "column",
    "justifyContent": "flex-end"
  }
};

export interface CarteCategorieProps extends HTMLAttributes<HTMLDivElement> {
  style?: 'superpose' | 'empile';
  /** Type de CTA gouverné de la carte empilée (Gate A, 2026-08-20). `lien` = ds.button Link à icônes pdf/download ; `bouton` = ds.button outlineNoir encadré à flèche. LIMITE NOMMÉE : le master CarteCategorie n'expose AUCUN axe VARIANT pour ce type (binding NONE, code-gouverné) — l'axe Figma est un nettoyage de source différé (autorat assumé au Gate A au-dessus d'une source incomplète). N'a d'effet que sur le style empilé. */
  ctaType?: 'lien' | 'bouton';
  titre?: string;
  /** Corps de la carte. Type `text` (plat, non rich-text) DÉLIBÉRÉMENT : la section ds.categories-principales compose cette molécule via `repeat` sur une prop `arrayOf`, dont les champs sont plat par le schéma — un `texte` rich-text ne se transporterait pas par item. La plage forte « SupraMatic & ProMatic. » que porte ds.carte n'est donc pas reprise (limite de composition nommée, pas un choix esthétique). */
  texte?: string;
  /** La ROUTE de l'image, jamais ses octets (gap A5, docs/FIGMA-CAPABILITY-MATRIX.md l.91 ; reprise verbatim de ds.carte.imageUrl). Défaut vide et il le reste ; le canevas dessine le lavis technique #D9D9D9, la photo maquette est hors contrat et préservée à la régénération par la passe de sauvetage. */
  imageUrl?: string;
  imageAlt?: string;
  /** Libellé du CTA du style empilé — contenu libre (Gate A : le texte du CTA n'est jamais l'option). Binding NONE (précédent ds.carte.ctaLabel : la propriété TEXT vit sur le Button imbriqué, pas au niveau du set). */
  ctaLabel?: string;
}

/** Piqueray CarteCategorie. Extracted from the cleaned Figma COMPONENT_SET on DS · Molécules (2495:6770), reviewed at Gate A — not authored. One category card with a single Style axis: `superpose` (photo plane + gradient scrim + white overlaid title/text + arrow affordance, ds.hero pattern) and `empile` (stacked photo + title/text + a governed ds.button CTA). Shared semantics: titre, texte, image, CTA label. Image URLs stay consumer/campaign inputs (route A5), never capture defaults.

Gouvernance (Gate A, 2026-08-20): le TYPE de CTA de la carte empilée est une option gouvernée `ctaType` {lien, bouton} — `lien` = bouton Link « Contactez-nous » à icônes pdf/download (reprise de ds.carte), `bouton` = bouton encadré outlineNoir « Prendre rendez-vous » à flèche (usage Maintenance/Rdv). Le libellé reste du contenu libre (`ctaLabel`).

Limites nommées : (1) `ctaType` n'a PAS d'axe VARIANT sur le master (binding NONE, code-gouverné) — l'axe Figma est un nettoyage de source différé ; (2) le texte du style empilé perd la plage forte rich-text de ds.carte : la composition `repeat`+`arrayOf` de la section ne transporte que du texte plat (limite de composition, pas un choix esthétique) ; (3) le plan photo du style superposé est porté comme part d'anatomie absolue (A5, convention sav/devis), le master range ces pixels dans un paint IMAGE du root. */
export const CarteCategorie = forwardRef<HTMLDivElement, CarteCategorieProps>(function CarteCategorie(
  { style = 'superpose', ctaType = 'lien', titre = 'Pour portes de garage', texte = 'SupraMatic & ProMatic. Ouverture ultra-rapide et verrouillage mécanique anti-intrusion breveté.', imageUrl = '', imageAlt = '', ctaLabel = 'Contactez-nous', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`style-${style}:root`] ?? {}), ...style }}  {...rest}>
      {style === 'superpose' ? (<img style={{ ...S.photoSuperpose }} src={String(imageUrl)} alt={String(imageAlt)}>

</img>) : null}
{style === 'superpose' ? (<span style={{ ...S.decor }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["carte-categorie-decor"] }} />) : null}
{style === 'superpose' ? (<div style={{ ...S.contenuSuperpose }}>
<div style={{ ...S.inner }}>
<div style={{ ...S.blocTexte }}>
<span style={{ ...S.TitreSuperpose }}>{titre}</span>
<span style={{ ...S.TexteSuperpose }}>{texte}</span>
</div>
<span style={{ ...S.Fleche }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS["arrow-right"] }} />
</div>
</div>) : null}
{style === 'empile' ? (<img style={{ ...S.categorieImage }} src={String(imageUrl)} alt={String(imageAlt)}>

</img>) : null}
{style === 'empile' ? (<div style={{ ...S.texteEmpile }}>
<span style={{ ...S.TitreCategorie }}>{titre}</span>
<span style={{ ...S.TexteCategorie }}>{texte}</span>
</div>) : null}
{style === 'empile' ? (<div style={{ ...S.Bouton }}>
{ctaType === 'lien' ? (<Button variant="link" iconLeft iconRight iconLeftGlyph="pdf" iconRightGlyph="download">{ctaLabel}</Button>) : null}
{ctaType === 'bouton' ? (<Button variant="outlineNoir" iconRight iconRightGlyph="arrow-right">{ctaLabel}</Button>) : null}
</div>) : null}
    </div>
  );
});
