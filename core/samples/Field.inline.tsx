/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/field.contract.json (ds.field v2.0.0)
 * Emitted by core/emit-react-inline.ts — the zero-infrastructure output:
 * every token reference was RESOLVED to its literal value from the design
 * tokens at emit time. Resolution mode: light (brand: default). To retheme,
 * re-emit against different tokens — do not edit literals by hand.
 * Fidelity: :hover/:focus-visible state tokens are not expressible as inline
 * styles and are omitted; ROOT disabled-state tokens apply via the disabled
 * prop; PART-level state overrides (Part.states, v13) are omitted — the same
 * declared limit as the hover states (state-selected descendant styling).
 */
import { forwardRef, cloneElement, isValidElement } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "8px"
  },
  "label": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-start",
    "gap": "4px",
    "alignSelf": "flex-start"
  },
  "Label": {
    "color": "#9BA4B5",
    "fontSize": "20px",
    "fontWeight": 600,
    "lineHeight": "25px"
  },
  "MentionOptionnelle": {
    "color": "#9BA4B5",
    "fontSize": "14px",
    "fontWeight": 400,
    "lineHeight": "17.066px"
  },
  "Saisie": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch"
  },
  "messageErreur": {
    "fontSize": "14px",
    "fontWeight": 400,
    "color": "#D32F2F",
    "lineHeight": "17px"
  }
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
  const slotControl0 = isValidElement<Record<string, unknown>>(children) ? cloneElement(children, { "aria-invalid": etat === "normal" ? "false" : etat === "erreur" ? "true" : undefined, "aria-describedby": etat === "normal" ? undefined : etat === "erreur" ? "field-error-message" : undefined, style: { ...((children.props.style as Record<string, unknown> | undefined) ?? {}), width: '100%', "borderColor": etat === "normal" ? "#9BA4B5" : etat === "erreur" ? "#D32F2F" : undefined, "--dsc-border-color": etat === "normal" ? "#9BA4B5" : etat === "erreur" ? "#D32F2F" : undefined } }) : children;
  return (
    <div ref={ref} style={{ ...S.root, ...style }} data-optionnel={optionnel || undefined}  {...rest}>
      <div style={{ ...S.label }}>
<span style={{ ...S.Label }}>{label}</span>
{optionnel ? (<span style={{ ...S.MentionOptionnelle }}>(optionnel)</span>) : null}
</div>
<div style={{ ...S.Saisie }}>{slotControl0}</div>
{etat === 'erreur' ? (<span style={{ ...S.messageErreur }} id="field-error-message">Message d’erreur</span>) : null}
    </div>
  );
});
