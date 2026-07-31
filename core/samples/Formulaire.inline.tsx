/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/formulaire.contract.json (ds.formulaire v1.1.0)
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
import { Avantage } from './Avantage';
import { Button } from './Button';
import { Field } from './Field';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "border": 0,
    "fontFamily": "Montserrat, sans-serif"
  },
  "column": {
    "display": "flex",
    "flexDirection": "column",
    "flex": "1 1 auto",
    "minWidth": 0
  },
  "features": {
    "display": "flex",
    "flexDirection": "column"
  },
  "buttons": {
    "display": "flex",
    "flexDirection": "row"
  },
  "form": {
    "display": "flex",
    "flexDirection": "column",
    "flex": "1 1 auto",
    "minWidth": 0,
    "backgroundColor": "#F4F6FA"
  },
  "row": {
    "display": "flex",
    "flexDirection": "row"
  },
  "row2": {
    "display": "flex",
    "flexDirection": "row"
  },
  "row3": {
    "display": "flex",
    "flexDirection": "row"
  },
  "row4": {
    "display": "flex",
    "flexDirection": "row"
  },
  "row5": {
    "display": "flex",
    "flexDirection": "row"
  },
  "TexteConsentement": {}
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface FormulaireProps extends HTMLAttributes<HTMLDivElement> {
  consentement?: string;
  items?: Array<{ texte: string; titre: string }>;
  /** Extracted from Figma "Accroche" TEXT property (added by sync pass). */
  accroche?: string;
  /** Extracted from Figma "Titre" TEXT property (added by sync pass). */
  titre?: string;
}

/** Piqueray Formulaire. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Formulaire = forwardRef<HTMLDivElement, FormulaireProps>(function Formulaire(
  { consentement = 'En cliquant sur «Envoyer», je confirme avoir lu et accepté la politique de confidentialité.', accroche = 'Une demande de devis ? Une réparation ?', titre = 'Prenez contact avec nous dès maintenant !', items, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <div style={{ ...S.column }}>
<SectionHeader titre={[{"text":"Prenez contact avec nous dès maintenant !"}]} accroche="Une demande de devis ? Une réparation ?" disposition="standard" />
<div style={{ ...S.features }}>
<Avantage texte="Devis gratuits effectués sur place, nous nous déplaçons chez vous" titre="Conseils personnalisés" />
<Avantage texte="Marque Hormann renommée, qualité allemande" titre="Produits de qualité" />
<Avantage texte="Nous mettons tout en œuvre pour vous dépanner dans les meilleur délais" titre="Dépannage et SAV" />
<Avantage texte="Nous cumulons plus de 50 ans d’expérience sur trois générations" titre="Expérience et savoir-faire" />
</div>
<div style={{ ...S.buttons }}>
<Button>Contactez-nous</Button>
<Button>Contactez-nous</Button>
</div>
</div>
<div style={{ ...S.form }}>
<div style={{ ...S.row }}>
<Field label="Prénom" etat="normal" />
<Field label="Nom" etat="normal" />
</div>
<div style={{ ...S.row2 }}>
<Field label="Email" etat="normal" />
<Field label="Téléphone" etat="normal" />
</div>
<div style={{ ...S.row3 }}>
<Field label="Adresse" etat="normal" />
</div>
<div style={{ ...S.row4 }}>
<Field label="Sujet" etat="normal" />
</div>
<div style={{ ...S.row5 }}>
<Field label="Message" etat="normal" />
</div>
<span style={{ ...S.TexteConsentement }}>{consentement}</span>
<Button>Contactez-nous</Button>
</div>
    </div>
  );
});
