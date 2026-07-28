/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/field.contract.json (ds.field v1.0.0)
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

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif"
  },
  "label": {
    "display": "flex",
    "flexDirection": "row"
  },
  "Label": {
    "color": "#9BA4B5"
  },
  "MentionOptionnelle": {
    "color": "#9BA4B5"
  },
  "Saisie": {
    "display": "flex"
  },
  "messageErreur": {}
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  etat?: 'normal' | 'erreur';
  label?: string;
  /** Extracted from Figma "Optionnel" BOOLEAN property (added by sync pass). */
  optionnel?: boolean;
}

/** Piqueray Field. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { etat = 'normal', optionnel = false, label = 'Libellé', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} data-optionnel={optionnel || undefined} {...rest}>
      <div style={{ ...S.label }}>
<span style={{ ...S.Label }}>{label}</span>
<span style={{ ...S.MentionOptionnelle }}>(optionnel)</span>
</div>
<div style={{ ...S.Saisie }}>{children}</div>
{etat === 'erreur' ? (<span style={{ ...S.messageErreur }}>Message d’erreur</span>) : null}
    </div>
  );
});
