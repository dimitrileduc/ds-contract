/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/presentation.contract.json (ds.presentation v4.0.0)
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
    "alignItems": "stretch",
    "justifyContent": "center",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "32px",
    "paddingBlock": "0px",
    "paddingInline": "24px"
  },
  "colGauche": {
    "display": "flex",
    "flexDirection": "column",
    "flex": "1 1 auto",
    "minWidth": 0,
    "width": "100%"
  },
  "Titre": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "24px",
    "fontWeight": 600,
    "lineHeight": "30px"
  },
  "wrapper": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start",
    "flex": "1 1 auto",
    "minWidth": 0,
    "width": "100%",
    "gap": "32px"
  },
  "Texte": {
    "color": "#37373B",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "16px",
    "fontWeight": 400,
    "lineHeight": "24px",
    "whiteSpace": "pre-line"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "presentation-tablette:root": {
    "paddingInline": "48px"
  },
  "presentation-desktop:root": {
    "paddingInline": "56px",
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-start",
    "justifyContent": "center",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-desktop:wrapper": {
    "gap": "24px"
  },
  "presentation-wide:root": {
    "paddingInline": "0px",
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-start",
    "justifyContent": "center",
    "width": "100%",
    "minWidth": "0"
  }
};

export interface PresentationProps extends HTMLAttributes<HTMLElement> {
  /** Viewport presentation mirrored from the 031 Figma axis. Mobile is the first set variant and the mobile-first CSS base; consumers do not select it at runtime. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Rich body copy. The 031 source contains paragraph breaks, therefore this content accepts strong and line-break in Odoo. Figma exposes no component property for this drawn text. */
  texte?: Array<{ text: string; strong?: boolean }>;
  /** CTA presence retained for code consumers. The 031 canvas does not expose it as a component property, so its Figma binding is NONE and Odoo fixes it by composition. */
  bouton?: boolean;
  /** Presentation-owned rich title. Its responsive H2 typography carries 24/30, 24/30, 32/40 and 40/50 across the 031 variants; Figma exposes no component property for the drawn text. */
  titre?: Array<{ text: string; strong?: boolean }>;
}

/** Piqueray Presentation responsive, adopted from the 031 component set. Mobile and tablette stack title, copy and CTA; desktop and wide use two equal columns. The wide component is authored at 1287px: this is the intentional reference width for this section, confirmed by the owner on 2026-09-02. Breakpoints remain an Odoo projection concern; the contract records the four Figma presentations and the design tokens only. */
export const Presentation = forwardRef<HTMLElement, PresentationProps>(function Presentation(
  { presentation = 'mobile', bouton = true, texte = [{"text":"Depuis plus de 50 ans,","strong":true},{"text":" PIQUERAY est dépositaire officiel de la marque "},{"text":"Hörmann","strong":true},{"text":", fabricant connu pour ses produits de qualité et ses innovations.\n\nComposée d’une équipe d’une vingtaine de personnes de la "},{"text":"région verviétoise","strong":true},{"text":" et gérée par Florian et Cécilia Piqueray (frère et sœur), l’entreprise se démarque par son caractère familial et sa proximité.\n\nQue vous soyez particulier ou une entreprise, "},{"text":"Piqueray vous accompagne de A à Z","strong":true},{"text":" dans votre projet."}], titre = [{"text":"Piqueray, votre distributeur de portes Hörmann "},{"text":"en Province de Liège","strong":true}], style, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }} data-bouton={bouton || undefined}  {...rest}>
      <div style={{ ...S.colGauche }}>
<span style={{ ...S.Titre }}>{titre.map(({ text, strong }, index) => strong ? <strong key={index} style={{ fontWeight: 700 }}>{text}</strong> : <span key={index}>{text}</span>)}</span>
</div>
<div style={{ ...S.wrapper, ...(V[`presentation-${presentation}:wrapper`] ?? {}) }}>
<span style={{ ...S.Texte }}>{texte.map(({ text, strong }, index) => strong ? <strong key={index} style={{ fontWeight: 700 }}>{text}</strong> : <span key={index}>{text}</span>)}</span>
{bouton ? (<Button variant="link" iconLeft={false} iconRight>En savoir plus</Button>) : null}
</div>
    </section>
  );
});
