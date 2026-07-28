/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/member-picture.contract.json (ds.member-picture v1.0.1)
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
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "width": "364px",
    "height": "364px",
    "borderRadius": "500px",
    "backgroundColor": "#D9D9D9",
    "position": "relative"
  },
  "funIa": {
    "width": "364px",
    "height": "364px",
    "borderRadius": "500px",
    "position": "absolute",
    "aspectRatio": "1"
  },
  "normal": {
    "width": "364px",
    "height": "364px",
    "borderRadius": "500px",
    "position": "absolute",
    "aspectRatio": "1",
    "transition": "opacity 300ms"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface MemberPictureProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual state: default (no overlay) or hover (overlay visible). Extracted from the VARIANT property « Etat » on the Figma master. */
  etat?: 'defaut' | 'survol';
}

/** Piqueray member picture. A circular member-photo component with two states, extracted from the Figma COMPONENT_SET « MemberPicture » on DS · Atomes, reviewed and adopted — not authored.

The etat variant stacks two 364×364 circular image planes: normal is opaque in defaut and transparent in survol, with a 300ms opacity transition. The root clips both planes at its 500px radius.

† A5 technical placeholder: the source IMAGE pixels of funIa and normal are unavailable to the contract→canvas transport. Both layers therefore use the engine's generic #D9D9D9 image-placeholder wash. This is not a Piqueray colour extracted from Figma, and this contract makes no full inner-photo pixel-parity claim. */
export const MemberPicture = forwardRef<HTMLDivElement, MemberPictureProps>(function MemberPicture(
  { etat = 'defaut', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(etat === 'defaut' ? {"overflow":"hidden"} : {}), ...(etat === 'survol' ? {"overflow":"hidden"} : {}), ...style }} {...rest}>
      <img style={{ ...S.funIa, ...(etat === 'defaut' ? {"top":"0px","right":"0px","bottom":"0px","left":"0px"} : {}), ...(etat === 'survol' ? {"top":"0px","right":"0px","bottom":"0px","left":"0px"} : {}) }} alt="">

</img>
<img style={{ ...S.normal, ...(etat === 'defaut' ? {"top":"0px","right":"0px","bottom":"0px","left":"0px","opacity":"1"} : {}), ...(etat === 'survol' ? {"top":"0px","right":"0px","bottom":"0px","left":"0px","opacity":"0"} : {}) }} alt="">

</img>
    </div>
  );
});
