/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/google-reviews-section.contract.json (ds.google-reviews-section v1.0.0)
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
import { GoogleReviews } from './GoogleReviews';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "gap": "12px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface GoogleReviewsSectionProps extends HTMLAttributes<HTMLElement> {
  titre?: Array<{ text: string; strong?: boolean }>;
  accroche?: string;
  qualificatif?: string;
  noteGlobale?: string;
  volume?: string;
  montrerControles?: boolean;
}

/** Composition publique Avis Google. Elle réunit le titre de section et le widget ds.google-reviews, auparavant deux frères ad hoc dans les Pages Figma et dans le seed Odoo. Le root est Fill/Hug, sans largeur fixe ni padding local : le Container consommateur possède l'espacement externe. */
export const GoogleReviewsSection = forwardRef<HTMLElement, GoogleReviewsSectionProps>(function GoogleReviewsSection(
  { montrerControles = true, accroche = 'Nos avis Google vérifiés', qualificatif = 'Excellent', noteGlobale = '4.8', volume = '93 avis', titre = [{"text":"Plus de 1500 portes installées par année et autant de clients satisfaits"}], style, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} style={{ ...S.root, ...style }} data-montrer-controles={montrerControles || undefined}  {...rest}>
      <SectionHeader titre={titre} accroche={accroche} afficherAccroche alignement="centre" />
<GoogleReviews qualificatif={qualificatif} noteGlobale={noteGlobale} volume={volume} montrerControles={montrerControles} />
    </section>
  );
});
