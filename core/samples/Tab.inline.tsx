/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/tab.contract.json (ds.tab v1.0.0)
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
import type { CSSProperties, ButtonHTMLAttributes } from 'react';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "inline-flex",
    "flexDirection": "row",
    "alignItems": "center",
    "borderStyle": "solid",
    "cursor": "pointer",
    "borderColor": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "20px",
    "fontWeight": 600,
    "paddingTop": "8px",
    "paddingRight": "0px",
    "paddingBottom": "8px",
    "paddingLeft": "0px",
    "lineHeight": "25px"
  },
  "libell": {
    "color": "#26282C"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "etat-selectionne:root": {
    "borderBottomWidth": "2px"
  }
};

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  etat?: 'defaut' | 'selectionne';
  libelle?: string;
}

/** Piqueray Tab. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { etat = 'defaut', libelle = 'Onglet', style, children, ...rest },
  ref,
) {
  return (
    <button ref={ref} style={{ ...S.root, ...(V[`etat-${etat}:root`] ?? {}), ...style }} role="tab" {...rest}>
      <span style={{ ...S.libell }}>{libelle}</span>
    </button>
  );
});
