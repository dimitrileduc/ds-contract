/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/presentation.contract.json (ds.presentation v1.0.0)
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
import { SectionHeader } from './SectionHeader';
import { Button } from './Button';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif"
  },
  "wrapper": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch"
  },
  "Texte": {
    "color": "#37373B"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface PresentationProps extends HTMLAttributes<HTMLDivElement> {
  texte?: string;
  bouton?: boolean;
  /** Extracted from Figma "Titre" TEXT property (added by sync pass). */
  titre?: string;
}

/** Piqueray Presentation. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Presentation = forwardRef<HTMLDivElement, PresentationProps>(function Presentation(
  { bouton = false, texte = 'Depuis plus de 50 ans, la société Piqueray est une référence en Province de Liège. Aujourd’hui dirigée par Florian et Cécilia Piqueray, l’entreprise perpétue les valeurs de proximité et d’excellence technique. Dépositaire officiel Hörmann, nous allions la force d’un leader mondial à la souplesse d’une PME locale.', titre = 'Piqueray, une histoire de famille ', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} data-bouton={bouton || undefined}  {...rest}>
      <SectionHeader titre="Piqueray, une histoire de famille " accroche="Plus de 50 ans d’expérience" disposition="standard" />
<div style={{ ...S.wrapper }}>
<span style={{ ...S.Texte }}>{texte}</span>
{bouton ? (<Button>Contactez-nous</Button>) : null}
</div>
    </div>
  );
});
