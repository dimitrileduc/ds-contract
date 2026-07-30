/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/presentation.contract.json (ds.presentation v2.1.0)
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
    "alignItems": "flex-start",
    "justifyContent": "space-between",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "32px"
  },
  "wrapper": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "gap": "16px",
    "width": "627px"
  },
  "Texte": {
    "color": "#37373B",
    "fontSize": "14px",
    "lineHeight": "24px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface PresentationProps extends HTMLAttributes<HTMLDivElement> {
  texte?: Array<{ text: string; strong?: boolean }>;
  bouton?: boolean;
  /** Extracted from Figma "Titre" TEXT property (added by sync pass). */
  titre?: string;
}

/** Piqueray Presentation. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Presentation = forwardRef<HTMLDivElement, PresentationProps>(function Presentation(
  { bouton = false, titre = 'Piqueray, une histoire de famille ', texte = [{"text":"Depuis plus de 50 ans,","strong":true},{"text":" la société Piqueray est une référence en Province de Liège. Aujourd'hui dirigée par Florian et Cécilia Piqueray, l'entreprise perpétue les valeurs de "},{"text":"proximité et d'excellence technique","strong":true},{"text":". Dépositaire officiel "},{"text":"Hörmann","strong":true},{"text":", nous allions la force d'un leader mondial à "},{"text":"la souplesse d'une PME locale","strong":true},{"text":"."}], style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} data-bouton={bouton || undefined}  {...rest}>
      <SectionHeader titre={[{"text":"Piqueray, ","strong":true},{"text":"une histoire de famille "}]} accroche="Plus de 50 ans d’expérience" disposition="standard" accroche2={false} emphase="moyen" alignement="gauche" />
<div style={{ ...S.wrapper }}>
<span style={{ ...S.Texte }}>{texte.map(({ text, strong }, index) => strong ? <strong key={index} style={{ fontWeight: 700 }}>{text}</strong> : <span key={index}>{text}</span>)}</span>
{bouton ? (<Button>Contactez-nous</Button>) : null}
</div>
    </div>
  );
});
