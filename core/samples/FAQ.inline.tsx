/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/faq.contract.json (ds.faq v1.0.0)
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
    "fontFamily": "Montserrat, sans-serif"
  },
  "accordion": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface FAQProps extends HTMLAttributes<HTMLDivElement> {
  items?: Array<{ contenu: string; titre: string }>;
  /** Extracted from Figma "Ligne 3" BOOLEAN property (added by sync pass). */
  ligne3?: boolean;
}

/** Piqueray FAQ. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const FAQ = forwardRef<HTMLDivElement, FAQProps>(function FAQ(
  { ligne3 = true, items, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} data-ligne3={ligne3 || undefined} {...rest}>
      <SectionHeader titre="Questions fréquentes" accroche="FAQ" disposition="standard" />
<div style={{ ...S.accordion }}>
<AccordionRow taille="grand" contenu="Réponse" titre="Nos portes répondent-elles aux normes des bâtiments publics ?" />
<AccordionRow taille="grand" contenu="Nos portes sont conçues pour recevoir tout type de bardage, garantissant une intégration parfaite à votre façade. Nous travaillons notamment avec les bardages Renson, Trespa, Alubond, Bois ou Eternit." titre="Quels types de bardages peuvent être intégrés sur les portes ?" />
<AccordionRow taille="grand" contenu="Réponse" titre="Assurez-vous la maintenance après l'installation ?" />
</div>
<Button>Contactez-nous</Button>
    </div>
  );
});
