/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/faq.contract.json (ds.faq v1.3.0)
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
import { SectionHeader } from './SectionHeader';
import { AccordionRow } from './AccordionRow';
import { Button } from './Button';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "width": "1728px",
    "paddingLeft": "89px",
    "paddingRight": "89px",
    "gap": "48px"
  },
  "accordion": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "flex": "1 1 auto",
    "minWidth": 0,
    "alignSelf": "stretch"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface FAQProps extends HTMLAttributes<HTMLDivElement> {
  /** Les lignes de la FAQ. LIMITE NOMMÉE (inchangée depuis 010) : Figma n'a pas de propriété de composant de type tableau — la répétition n'existe sur le canevas que comme N instances sœurs compilées, d'où bindings.figma.kind NONE. Le schéma refuse aussi un default sur un prop arrayOf (« an optional array — undefined means "not provided", never a silent [] ») : le master rend trois lignes par défaut, le composant généré n'en rend aucune sans données. C'est pourquoi le cas d'audit alimente items par un override, comme ds.footer. */
  items?: Array<{ contenu: string; titre: string }>;
  /** Extracted from Figma "Ligne 3" BOOLEAN property (added by sync pass). Côté Figma cette propriété pilote la visibilité de la SEULE 3e instance, et la géométrie recalcule 448 ↔ 384px. LIMITE LEVÉE en 1.3.0 (016, journal decisions.md O-15) : un item de `repeat` ne peut toujours pas porter de visibleWhen individuel (le vocabulaire n'a pas de visibilité par index — poser `visibleWhen` sur la part répétée ferait disparaître les trois lignes là où Figma en garde deux), mais la 3e rangée est sortie du repeat en part composée séparée `AccordionRow3`, qui porte `visibleWhen: { prop: "ligne3" }` : le fait est désormais PROJETÉ (mesuré au canvas, O-15 : portes-entrée 481→409, la prop agit). */
  ligne3?: boolean;
}

/** Piqueray FAQ. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. v1.2.0 porte la géométrie relevée au census 013 sur le master 2104:2914 (version Figma pinée 2381581871281042338) : l'extraction 010 avait retenu la structure sans aucune de ses mesures (ni gap, ni padding, ni largeur) et sans aucune des valeurs d'instance du Bouton, ce qui laissait le rendu généré à 4,37 % d'écart pixel. Aucune propriété publique n'a changé. */
export const FAQ = forwardRef<HTMLDivElement, FAQProps>(function FAQ(
  { ligne3 = true, items, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} data-ligne3={ligne3 || undefined}  {...rest}>
      <SectionHeader titre={[{"text":"Questions fréquentes"}]} accroche="FAQ" accroche2 disposition="standard" />
<div style={{ ...S.accordion }}>
<AccordionRow taille="grand" contenu="Réponse" titre="Nos portes répondent-elles aux normes des bâtiments publics ?" />
<AccordionRow taille="grand" contenu="Nos portes sont conçues pour recevoir tout type de bardage, garantissant une intégration parfaite à votre façade. Nous travaillons notamment avec les bardages Renson, Trespa, Alubond, Bois ou Eternit." titre="Quels types de bardages peuvent être intégrés sur les portes ?" />
{ligne3 ? (<AccordionRow taille="grand" titre="Assurez-vous la maintenance après l'installation ?" contenu="Réponse" />) : null}
</div>
<Button variant="outlineNoir" iconRight>Contactez-nous</Button>
    </div>
  );
});
