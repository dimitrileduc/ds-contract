/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/reassurances.contract.json (ds.reassurances v1.2.0)
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
    "fontFamily": "Montserrat, sans-serif",
    "width": "1550px",
    "gap": "48px"
  },
  "items": {
    "display": "flex",
    "flexDirection": "row",
    "justifyContent": "center",
    "gap": "32px",
    "alignSelf": "stretch"
  },
  "Boutons": {
    "display": "flex",
    "flexDirection": "row",
    "gap": "16px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface ReassurancesProps extends HTMLAttributes<HTMLDivElement> {
  disposition?: '4Cartes' | 'quatrecartesdeuxcta' | '5Cartes';
  /** Les cartes de réassurance, fournies par le consommateur. imageUrl alimente ds.carte.imageUrl : le master pose une peinture IMAGE distincte par carte (imageRef ab6a82d4b83b657d48c90b5e253f82459fd505bf, 8d05df2058fe88fa4b14e4472c9746f03fd100a2, d00de3d48206b57be5125a2d01e8595d3eca56de, 7bd2daf5061e3af6ff4a671f8eca2be1bc10b6fb, relevées sur I2114:3614;2063:1607 … I2114:3617;2063:1607) et Figma n'expose aucune propriété de composant pour ces pixels. Le contrat porte donc la ROUTE, jamais les octets — même convention que ds.hero.backgroundUrl et ds.sav.imageUrl, et le sample laisse imageUrl vide parce qu'un imageRef Figma n'est pas une URL. */
  items?: Array<{ texte: string; titre: string; imageUrl: string }>;
}

/** Piqueray Reassurances. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. v1.2.0 porte la géométrie relevée au census 013 sur la variante « Disposition=4 cartes » (node 2114:3619, version Figma pinée 2381581871281042338) : l'extraction 010 avait retenu la structure sans aucune de ses mesures — ni les deux gaps de 48px du root, ni le gap de 32px des items, ni la largeur 1550px — et le bouton du master (Outline noir, flèche droite) était rendu par le seul défaut de ds.button, donc juste par coïncidence. Le champ items.imageUrl est ajouté pour que les photos des cartes aient une ROUTE de projection (D10 : l'URL n'est jamais un défaut du contrat, elle entre par le consommateur). */
export const Reassurances = forwardRef<HTMLDivElement, ReassurancesProps>(function Reassurances(
  { disposition = '4Cartes', items, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <SectionHeader titre={[{"text":"Pourquoi choisir nos portes de garage industrielles ?"}]} accroche="Plus de 50 ans d’expérience" accroche2 disposition="standard" />
<div style={{ ...S.items }}>
<Carte disposition="reassurance" texte={[{ text: "Respectent les normes des bâtiments publics et les réglementations pompiers." }]} titre="Sécurité et conformité" imageUrl="" />
<Carte disposition="reassurance" texte={[{ text: "Conçues pour recevoir tout type de bardage (Renson, Trespa, Alubond, Bois ou Eternit)." }]} titre="Intégration parfaite" imageUrl="" />
<Carte disposition="reassurance" texte={[{ text: "Ouverture silencieuse, fluide et ultra-rapide jusqu’à 1 m/s pour un confort optimal." }]} titre="Moteur performant" imageUrl="" />
<Carte disposition="reassurance" texte={[{ text: "Réactivité maximale garantie grâce à nos techniciens et notre important stock de pièces." }]} titre="SAV & maintenance dédiés" imageUrl="" />
</div>
{disposition === '5Cartes' ? (<Button variant="outlineNoir" iconRight iconRightGlyph="arrow-right">Contactez-nous</Button>) : null}
{disposition === 'quatrecartesdeuxcta' ? (<div style={{ ...S.Boutons }}>
{disposition === 'quatrecartesdeuxcta' ? (<Button variant="outlineNoir" iconLeft iconLeftGlyph="pdf" iconRight iconRightGlyph="download">Motifs disponibles</Button>) : null}
{disposition === 'quatrecartesdeuxcta' ? (<Button variant="outlineNoir" iconRight iconRightGlyph="arrow-right">Contactez-nous</Button>) : null}
</div>) : null}
{disposition === '4Cartes' ? (<Button variant="outlineNoir" iconRight iconRightGlyph="arrow-right">Contactez-nous</Button>) : null}
    </div>
  );
});
