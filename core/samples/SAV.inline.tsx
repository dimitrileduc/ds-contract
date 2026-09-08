/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/sav.contract.json (ds.sav v2.2.0)
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
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "paddingInline": "24px",
    "paddingBlock": "0px",
    "gap": "0px",
    "position": "relative"
  },
  "background": {
    "position": "absolute",
    "objectFit": "cover",
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0",
    "zIndex": "0"
  },
  "row": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": 0,
    "paddingInline": "0px",
    "position": "relative",
    "zIndex": "1"
  },
  "imgGroup": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-end",
    "justifyContent": "flex-start",
    "flex": "1 1 auto",
    "minWidth": 0,
    "width": "100%",
    "paddingLeft": "24px",
    "paddingRight": "24px",
    "height": "320px",
    "position": "relative"
  },
  "ImgGroupBackground": {
    "backgroundColor": "#F4F6FA",
    "position": "absolute",
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0"
  },
  "img": {
    "display": "flex",
    "flex": "1 1 auto",
    "minWidth": 0,
    "width": "100%",
    "height": "320px",
    "position": "relative",
    "objectFit": "contain"
  },
  "wrapper": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-start",
    "justifyContent": "center",
    "flex": "1 1 auto",
    "minWidth": 0,
    "width": "100%",
    "paddingTop": "48px",
    "paddingRight": "24px",
    "paddingBottom": "24px",
    "paddingLeft": "24px",
    "position": "relative"
  },
  "WrapperBackground": {
    "backgroundColor": "#FFFFFF",
    "position": "absolute",
    "top": "0",
    "right": "0",
    "bottom": "0",
    "left": "0"
  },
  "inner": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "justifyContent": "flex-start",
    "flex": "1 1 auto",
    "minWidth": 0,
    "width": "100%",
    "gap": "32px",
    "position": "relative"
  },
  "SectionHeader": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": 0,
    "gap": "8px"
  },
  "Titre": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "24px",
    "fontWeight": 600,
    "lineHeight": "30px",
    "textAlign": "left"
  },
  "vousRencontrezUnProblmeA": {
    "width": "100%",
    "minWidth": 0,
    "color": "#37373B",
    "fontSize": "16px",
    "fontWeight": 400,
    "lineHeight": "24px",
    "paddingTop": "4px",
    "paddingBottom": "4px",
    "whiteSpace": "pre-line"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "presentation-tablette:root": {
    "paddingInline": "48px"
  },
  "presentation-desktop:root": {
    "paddingInline": "56px",
    "paddingBlock": "89px"
  },
  "presentation-desktop:row": {
    "paddingInline": "89px",
    "height": "505px",
    "flexDirection": "row-reverse",
    "alignItems": "stretch",
    "justifyContent": "flex-end",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-desktop:imgGroup": {
    "paddingLeft": "0px",
    "paddingRight": "0px",
    "height": "505px"
  },
  "presentation-desktop:img": {
    "height": "504px"
  },
  "presentation-desktop:wrapper": {
    "paddingRight": "48px",
    "paddingBottom": "48px",
    "paddingLeft": "48px",
    "height": "505px"
  },
  "presentation-desktop:inner": {
    "flexDirection": "column",
    "alignItems": "flex-start",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-wide:root": {
    "paddingInline": "89px",
    "height": "677px",
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "justifyContent": "flex-end",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-wide:row": {
    "paddingInline": "131px",
    "height": "561px",
    "flexDirection": "row-reverse",
    "alignItems": "stretch",
    "justifyContent": "flex-end",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-wide:imgGroup": {
    "paddingLeft": "3px",
    "paddingRight": "78px",
    "height": "561px"
  },
  "presentation-wide:img": {
    "height": "504px"
  },
  "presentation-wide:wrapper": {
    "paddingRight": "47px",
    "paddingBottom": "0px",
    "paddingLeft": "48px",
    "height": "561px"
  },
  "presentation-wide:inner": {
    "flexDirection": "column",
    "alignItems": "flex-start",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": "0"
  }
};

export interface SAVProps extends HTMLAttributes<HTMLElement> {
  /** Viewport presentation, mirroring the canvas axis Presentation of the 031 set. Default = mobile, the first variant (Figma's default) and the mobile-first base of the delivered CSS; in the delivered CSS the mode is selected by the viewport through the breakpoint tokens, never by a consumer. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Section title « Dépannage / SAV ». Drawn on the node in every 031 variant — the set exposes NO text property (1.4.1 bound the master's TEXT « Titre »): binding NONE, named source gap (journal: à corriger à la source). No line break, no bold: plain text. */
  titre?: string;
  /** The long paragraph, RICH: three bold ranges and one line break drawn in every 031 variant (owner rule 2026-09-02). The 031 set exposes NO text property (1.4.1 bound the master's TEXT « Texte »): binding NONE, named source gap. Espaces INSECABLES : normalises a la regle francaise le 2026-09-04 — un insecable avant chaque ? et !, une espace normale partout ailleurs. La source portait DEUX traitements : Mobile et Tablette suivaient deja la regle, Desktop et Wide collaient leurs cinq insecables a l'interieur des groupes en gras (« votre installation », « garage ne »), artefact d'edition des plages. Les deux traitements ne coupent pas les lignes au meme endroit : le contrat portait la version Desktop et la section gagnait UNE LIGNE, donc 24 px, en Mobile. Les quatre variantes du canevas sont desormais identiques (version nommee dans l'historique Figma), plages de gras realignees sur [33,52) [101,122) [252,299). */
  texte?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** Code-supplied URL for the full-bleed section IMAGE fill. Figma stores those pixels as a paint on the master (not as a component property) and the contract has no background-image channel; the empty runtime default is intentional and does not substitute an image. */
  backgroundUrl?: string;
  /** Code-supplied text alternative paired with backgroundUrl. Figma IMAGE fills expose no corresponding alt component property, so the empty runtime default is intentional (decorative plane). */
  backgroundAlt?: string;
  /** Code-supplied URL for the img-group photo IMAGE fill. Same provenance as backgroundUrl: a master paint, not a component property; the empty runtime default is intentional and does not substitute an image. */
  imageUrl?: string;
  /** Code-supplied text alternative paired with imageUrl. Figma IMAGE fills expose no corresponding alt component property, so the empty runtime default is intentional. */
  imageAlt?: string;
}

/** Piqueray SAV, responsive. 2.0.0 (2026-09-02, Odoo wave 031): re-extracted from the spec-031 set 2693:20992 (page « 031 · Planches de validation »), four `presentation` variants Mobile / Tablette / Desktop / Wide. Everything the canvas draws is proposed by `npm run extract:figma` and adopted: layout per mode (image column stacked above the text card on Mobile/Tablette, side by side on Desktop/Wide), paddings and heights per mode as tokensByProp on the presentation axis (five size.sav.* leaves minted from-dump), the title riding the responsive text style H2 and the paragraph the responsive body recipe. Named deviations, each carried in the part descriptions: (1) the Wide variant still carries the pre-031 `section` wrapper — modeled flat like the three others; (2) the set exposes no TEXT property — titre/texte bind NONE; (3) SectionHeader is a detached frame on the canvas, its collapsed eyebrow is not carried; (4) the CTA has no icon on the 031 set; (5) the Desktop/Wide column split (503/407, 651/637) is not equal on the canvas and has no hand-free spelling — the code side splits equally; (6) the background plane's horizontal inset by mode and the CTA's full width under 992 are code-only facts of the Odoo projection. Breakpoints are the token dimension breakpoint.* (768 / 992 / 1600).

History before 2.0.0:
Piqueray SAV, responsive. 2.0.0 (2026-09-02, Odoo wave 031): re-extracted from the spec-031 set 2693:20992 (page « 031 · Planches de validation »), four `presentation` variants Mobile / Tablette / Desktop / Wide. Everything the canvas draws is proposed by `npm run extract:figma` and adopted: layout per mode (image column stacked above the text card on Mobile/Tablette, side by side on Desktop/Wide), paddings and heights per mode as tokensByProp on the presentation axis (five size.sav.* leaves minted from-dump), the title riding the responsive text style H2 and the paragraph the responsive body recipe. Named deviations, each carried in the part descriptions: (1) the Wide variant still carries the pre-031 `section` wrapper — modeled flat like the three others; (2) the set exposes no TEXT property — titre/texte bind NONE; (3) SectionHeader is a detached frame on the canvas, its collapsed eyebrow is not carried; (4) the CTA has no icon on the 031 set; (5) the Desktop/Wide column split (503/407, 651/637) is not equal on the canvas and has no hand-free spelling — the code side splits equally; (6) the background plane's horizontal inset by mode and the CTA's full width under 992 are code-only facts of the Odoo projection. Breakpoints are the token dimension breakpoint.* (768 / 992 / 1400).

History before 2.0.0:
Piqueray SAV. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.

v1.4.1 : le plan bleu de la colonne image (`ImgGroupBackground`) est épinglé par `left: 0`. Il n'était pas positionné (le `align-self: flex-start` est inerte sur un abspos) et retombait après le padding-left de la colonne (token space.3, 3 px), laissant un liseré d'~3px à gauche où le fond derrière transparaissait — visible entre carte texte et carte image, absent de Figma (rect à (0,0)). Correctif de modélisation côté contrat, aucune mutation de source. Mesuré au rendu.

Limites nommées : les deux plans photo (`background` 2108:3094, `img` 2108:3098) portent chacun un paint IMAGE sur le master Figma. Le vocabulaire de contrat n'a AUCUN canal `background-image` (gap nommé A5, docs/FIGMA-CAPABILITY-MATRIX.md) : les `imageRef` observés sont donc CONSIGNÉS dans la description de chaque part, jamais liés. Ce qui est porté : le porteur `img` avec `src`/`alt` fournis par le code (convention realisation/carte/product-card) et le `object-fit` qui est l'orthographe CSS du `scaleMode` observé.

v1.4.0 : responsive desktop gouverné sans variante de largeur. Le master et la section sont Fill ; la rangée de contenu est Fill avec 131 px de padding horizontal, donc 1288 px utiles à la référence 1550 et 1000 px à 1262. Les deux colonnes partagent l'espace restant. Le paragraphe rich-text est Hug afin que ses trois plages fortes et ses retours pilotent la hauteur. L'état owner réparé du 2026-08-11 fixe le fond de section à 677 px et le fond bleu du technicien à 561 px, soit la hauteur complète de leurs porteurs.

v1.3.0 (016/T042, lot B013-4) : le paragraphe long cesse d'être cuit en dur — prop rich-text `texte` liée à la propriété TEXT native « Texte » que le lot L-B013-4 (T041) expose sur le master ; c'était le SEUL texte non lié du master au diagnostic vif du 2026-08-05 (le titre avait déjà sa propriété « Titre », les autres textes passent par les instances). Ses trois plages 700 voyagent en segments gouvernés (content.marks.strong) et le saut de ligne dur voyage dans la valeur de la prop. 2.1.0 (2026-09-04) : le saut de ligne du paragraphe devient conditionnel a l'ecran. Il n'est dessine qu'en Desktop et Wide ; le rendre partout ajoutait une ligne et 24 px de hauteur sous 992. Le photo de la variante Desktop etait recadree a la main (CROP + zoom vertical 1,356) alors que les trois autres sont en FIT : recadrage annule a la source le 2026-09-04, les quatre variantes sont de nouveau identiques. Plan de document : la partie titre porte la balise h2 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau. */
export const SAV = forwardRef<HTMLElement, SAVProps>(function SAV(
  { presentation = 'mobile', titre = 'Dépannage / SAV', backgroundUrl = '', backgroundAlt = '', imageUrl = '', imageAlt = '', texte = [{"text":"Vous rencontrez un problème avec "},{"text":"votre installation ","strong":true},{"text":"Hörmann à Liège ? Il y a une panne de courant et "},{"text":"votre porte de garage","strong":true},{"text":" ne s’ouvre plus ? La télécommande de ma porte est cassée ? Votre porte ne se ferme plus correctement ?\nPas de panique, Piqueray, "},{"text":"votre distributeur Hörmann en province de Liège","strong":true},{"text":" est là pour vous aider !"}], style, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }}  {...rest}>
      <img style={{ ...S.background }} src={String(backgroundUrl)} alt={String(backgroundAlt)}>

</img>
<div style={{ ...S.row, ...(V[`presentation-${presentation}:row`] ?? {}) }}>
<div style={{ ...S.imgGroup, ...(V[`presentation-${presentation}:imgGroup`] ?? {}) }}>
<div style={{ ...S.ImgGroupBackground }}>

</div>
<img style={{ ...S.img, ...(V[`presentation-${presentation}:img`] ?? {}) }} src={String(imageUrl)} alt={String(imageAlt)}>

</img>
</div>
<div style={{ ...S.wrapper, ...(V[`presentation-${presentation}:wrapper`] ?? {}) }}>
<div style={{ ...S.WrapperBackground }}>

</div>
<div style={{ ...S.inner, ...(V[`presentation-${presentation}:inner`] ?? {}) }}>
<div style={{ ...S.SectionHeader }}>
<h2 style={{ ...S.Titre }}>{titre}</h2>
</div>
<span style={{ ...S.vousRencontrezUnProblmeA, ...(presentation === 'mobile' ? {"whiteSpace":"normal"} : {}), ...(presentation === 'tablette' ? {"whiteSpace":"normal"} : {}) }}>{texte.map(({ text, strong, underline }, index) => { const inner = underline ? <u>{text}</u> : text; return strong ? <strong key={index} style={{ fontWeight: 700 }}>{inner}</strong> : <span key={index}>{inner}</span>; })}</span>
<Button iconRight={false}>Demander de l'aide</Button>
</div>
</div>
</div>
    </section>
  );
});
