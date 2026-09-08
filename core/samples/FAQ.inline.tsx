/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/faq.contract.json (ds.faq v2.0.0)
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
import { AccordionRow } from './AccordionRow';
import { Button } from './Button';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "backgroundColor": "#FFFFFF",
    "fontFamily": "Montserrat, sans-serif",
    "paddingInline": "24px",
    "paddingBlock": "0px",
    "gap": "32px"
  },
  "SectionHeader": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start",
    "width": "100%",
    "minWidth": 0,
    "gap": "8px"
  },
  "Accroche": {
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "14px",
    "fontWeight": 400,
    "lineHeight": "20px",
    "textAlign": "left",
    "textTransform": "uppercase"
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
  "accordion": {
    "display": "flex",
    "flexDirection": "column",
    "flex": "1 1 auto",
    "minWidth": 0,
    "alignSelf": "stretch"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "presentation-tablette:root": {
    "paddingInline": "48px"
  },
  "presentation-desktop:root": {
    "paddingInline": "56px",
    "gap": "48px"
  },
  "presentation-desktop:SectionHeader": {
    "gap": "16px"
  },
  "presentation-wide:root": {
    "paddingInline": "89px",
    "gap": "48px"
  },
  "presentation-wide:SectionHeader": {
    "gap": "16px"
  }
};

export interface FAQProps extends HTMLAttributes<HTMLElement> {
  /** L'axe de la vague 031 : la variante de mise en page relevée sur le set. Les quatre valeurs correspondent aux quatre variantes dessinées (390 / 834 / 1200 / 1728) ; en CSS elles deviennent les paliers 768 / 992 / 1400. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Les lignes de la FAQ. LIMITE NOMMÉE (inchangée depuis 010) : Figma n'a pas de propriété de composant de type tableau — la répétition n'existe sur le canevas que comme N instances sœurs compilées, d'où bindings.figma.kind NONE. Le schéma refuse aussi un default sur un prop arrayOf (« an optional array — undefined means "not provided", never a silent [] ») : le master rend trois lignes par défaut, le composant généré n'en rend aucune sans données. C'est pourquoi le cas d'audit alimente items par un override, comme ds.footer. */
  items?: Array<{ contenu: string; titre: string }>;
}

/** Piqueray FAQ, v2 de la vague 031 — candidat responsive extrait du set FAQ 2773:27504 (page « 031 · Planches de validation », 4 variantes Presentation Mobile/Tablette/Desktop/Wide). MAJEUR pour deux raisons : les ancres changent de set (le master v1 2104:2914 n'avait qu'une largeur, 1728) et la prop `ligne3` disparaît — en v2 le nombre de questions est du CONTENU (la liste `items`), plus une bascule de visibilité sur une troisième rangée sortie du repeat. Mise en page : option B tranchée par l'owner le 2026-09-07 — en-tête aligné À GAUCHE aux quatre largeurs (les autres sections de la vague centrent au-delà de 992 ; ici l'écart est voulu et nommé), rangées Taille=Grand partout, CTA pleine largeur sous 992 (fait code-only, une part `component` ne peut pas porter layoutByProp). L'en-tête n'est plus une instance de ds.section-header : aucune section v2 de la vague n'en utilise — chacune dessine son accroche et son titre avec les rôles typographiques responsive, ce qui règle au passage le défaut de source v1 (instance bridée à 50 px, titre débordant de 33 px dans le gap). */
export const FAQ = forwardRef<HTMLElement, FAQProps>(function FAQ(
  { presentation = 'mobile', items, style, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }}  {...rest}>
      <div style={{ ...S.SectionHeader, ...(V[`presentation-${presentation}:SectionHeader`] ?? {}) }}>
<span style={{ ...S.Accroche }}>FAQ</span>
<h2 style={{ ...S.Titre }}>Questions fréquentes</h2>
</div>
<div style={{ ...S.accordion }}>
<AccordionRow taille="grand" contenu="Réponse" titre="Quelle est la différence entre une porte sectionnelle et basculante ?" />
<AccordionRow taille="grand" contenu="Oui, nos moteurs Hörmann s'adaptent à la plupart des portes existantes. Des solutions d'ouverture intelligentes et sécurisées : Wi-Fi, application, clavier à code et télécommandes, pour un confort optimal." titre="Peut-on motoriser une ancienne porte ?" />
<AccordionRow taille="grand" contenu="Réponse" titre="Assurez-vous la maintenance après l'installation ?" />
</div>
<Button variant="outlineNoir" iconRight>Contactez-nous</Button>
    </section>
  );
});
