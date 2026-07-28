/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/reassurances.contract.json (ds.reassurances v1.0.0)
 * Emitted by core/emit-react-inline.ts — the zero-infrastructure output:
 * every token reference was RESOLVED to its literal value from the design
 * tokens at emit time. Resolution mode: light (brand: default). To retheme,
 * re-emit against different tokens — do not edit literals by hand.
 * Fidelity: :hover/:focus-visible state tokens are not expressible as inline
 * styles and are omitted; ROOT disabled-state tokens apply via the disabled
 * prop; PART-level state overrides (Part.states, v13) are omitted — the same
 * declared limit as the hover states (state-selected descendant styling).
 * Fidelity: repeat collections render the contract's OBSERVED sample as fixed
 * instances (the array prop is declared but not mapped on this surface) — the
 * full React surface maps the live array.
 */
import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import { SectionHeader } from './SectionHeader';
import { Carte } from './Carte';
import { Button } from './Button';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif"
  },
  "items": {
    "display": "flex",
    "flexDirection": "row",
    "justifyContent": "center"
  },
  "Boutons": {
    "display": "flex",
    "flexDirection": "row"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface ReassurancesProps extends HTMLAttributes<HTMLDivElement> {
  disposition?: '4Cartes' | 'quatrecartesdeuxcta' | '5Cartes';
  items?: Array<{ texte: string; titre: string }>;
}

/** Piqueray Reassurances. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Reassurances = forwardRef<HTMLDivElement, ReassurancesProps>(function Reassurances(
  { disposition = '4Cartes', items, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }} {...rest}>
      <SectionHeader titre="Pourquoi choisir nos portes de garage industrielles ?" accroche="Plus de 50 ans d’expérience" disposition="standard" />
<div style={{ ...S.items }}>
<Carte disposition="reassurance" texte="Respectent les normes des bâtiments publics et les réglementations pompiers." titre="Sécurité et conformité" />
<Carte disposition="reassurance" texte="Conçues pour recevoir tout type de bardage (Renson, Trespa, Alubond, Bois ou Eternit)." titre="Intégration parfaite" />
<Carte disposition="reassurance" texte="Ouverture silencieuse, fluide et ultra-rapide jusqu’à 1 m/s pour un confort optimal." titre="Moteur performant" />
<Carte disposition="reassurance" texte="Réactivité maximale garantie grâce à nos techniciens et notre important stock de pièces." titre="SAV & maintenance dédiés" />
<Carte disposition="reassurance" texte="Savoir-faire familial transmis depuis plus de 50 ans sur trois générations." titre="Expérience" />
</div>
{disposition === '5Cartes' ? (<Button>Contactez-nous</Button>) : null}
{disposition === 'quatrecartesdeuxcta' ? (<div style={{ ...S.Boutons }}>
{disposition === 'quatrecartesdeuxcta' ? (<Button>Contactez-nous</Button>) : null}
{disposition === 'quatrecartesdeuxcta' ? (<Button>Contactez-nous</Button>) : null}
</div>) : null}
{disposition === '4Cartes' ? (<Button>Contactez-nous</Button>) : null}
    </div>
  );
});
