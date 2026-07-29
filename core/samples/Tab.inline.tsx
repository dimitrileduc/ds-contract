/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/tab.contract.json (ds.tab v2.0.0)
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
    "lineHeight": "25px",
    "textTransform": "uppercase"
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
  /** Code-only id of the panel controlled by this Tab. */
  panelId: string;
  /** Code-only id of the owning tablist. Its controller supplies the bounded arrow-key roving-focus behavior; exactly one sibling Tab is selected and has tabIndex 0. */
  tablistId: string;
}

/** Piqueray Tab. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. Panel and tablist identities are code-only semantics: every Tab belongs to an existing tablist, whose controller owns the bounded roving-focus behavior and keeps exactly one Tab selected/focusable; this contract does not invent a TabList molecule or a panel. Version 2.0.0 is breaking because panelId and tablistId are now required for an accessible Tab relationship. */
export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { etat = 'defaut', libelle = 'Onglet', panelId, tablistId, style, children, ...rest },
  ref,
) {
  return (
    <button ref={ref} style={{ ...S.root, ...(V[`etat-${etat}:root`] ?? {}), ...style }} role="tab"  type="button" data-tablist-id={String(tablistId)} {...(({ "defaut": { "aria-selected": "false", "aria-controls": String(panelId), "tabIndex": -1 }, "selectionne": { "aria-selected": "true", "aria-controls": String(panelId), "tabIndex": 0 } } as const)[etat as "defaut" | "selectionne"] ?? {})} {...rest}>
      <span style={{ ...S.libell }}>{libelle}</span>
    </button>
  );
});
