/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/section-header.contract.json (ds.section-header v1.0.0)
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
    "alignItems": "center",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif"
  },
  "Accroche": {
    "color": "#26282C"
  },
  "Titre": {
    "color": "#26282C"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "disposition-avecCta:root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between"
  }
};

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  disposition?: 'standard' | 'avecCta';
  accroche?: string;
  titre?: string;
  /** Extracted from Figma "Accroche2" BOOLEAN property (added by sync pass). */
  accroche2?: boolean;
}

/** Piqueray SectionHeader. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  { disposition = 'standard', accroche2 = true, accroche = 'Plus de 50 ans d’expérience', titre = 'Pourquoi choisir Piqueray ?', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`disposition-${disposition}:root`] ?? {}), ...style }} data-accroche2={accroche2 || undefined} {...rest}>
      {disposition === 'standard' ? (<span style={{ ...S.Accroche }}>{accroche}</span>) : null}
<span style={{ ...S.Titre }}>{titre}</span>
<Button>Contactez-nous</Button>
    </div>
  );
});
