/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/textarea.contract.json (ds.textarea v2.1.0)
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
import type { CSSProperties, TextareaHTMLAttributes } from 'react';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "flex-start",
    "borderStyle": "solid",
    "backgroundColor": "#FFFFFF",
    "borderColor": "#37373B",
    "borderWidth": "1px",
    "color": "#37373B",
    "fontFamily": "Montserrat, sans-serif",
    "fontSize": "16px",
    "fontWeight": 400,
    "lineHeight": "24px",
    "paddingBlock": "12px",
    "paddingInline": "12px",
    "height": "128px",
    "borderRadius": "4px"
  },
  "texteDeSaisie": {}
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Valeur saisie. Vide au repos depuis 2.0.0. */
  value?: string;
  /** Aide à la saisie, visible seulement quand la zone est vide. Code-only. */
  placeholder?: string;
  /** Nom du champ envoyé au serveur. Code-only ; posé explicitement par le formulaire. */
  name?: string;
  /** Identifiant DOM, cible du htmlFor du libellé porté par Field. Code-only, unique par champ. */
  id?: string;
  /** Jeton autocomplete HTML. Code-only. */
  autocomplete?: string;
  /** Attribut natif required. Code-only ; la marque visible est dessinée par Field. */
  required?: boolean;
  /** aria-describedby : identifiant du message d'erreur de ce champ, unique par champ. Code-only. */
  describedBy?: string;
}

/** Zone de texte Piqueray sur plusieurs lignes. Relevée sur le candidat v2 « Textarea · candidat v2 » de la planche 031·21 (2026-09-08), revue et adoptée — pas rédigée à la main.

MAJEUR 2.0.0, même passe que Input : ancres sur le candidat, bordure color.noir (3:1 exigés, 11,85:1 obtenus), texte 16 px (zoom iOS), valeur par défaut vide (1.0.0 livrait « Texte de saisie » pré-rempli), anneau de focus dessiné (color.etat.champ.anneau-focus). Ne diffère d'Input que par la forme : hauteur fixe size.textarea.root (128) et texte calé en haut (axe transversal MIN au canevas).

Les props placeholder, name, id, autocomplete, required et describedBy sont CODE-ONLY (liaison figma NONE), portés par attrs/attrsByProp sans évolution de schéma. Le redimensionnement vertical par l'utilisateur reste possible (aucune règle resize ici : ne pas bloquer une zone où l'on écrit 500 caractères). Limite nommée : trait extérieur 2 px au canevas ≈ outline décalé de 2 px en CSS.

VERSION 2.1.0 (2026-09-09, vague « arrondis ») — le littéral border-radius 0px, invisible au différentiel, devient le token radius.4 : le champ est un contrôle comme le bouton, même rayon. Canevas : le candidat v2 de la planche 031 · 21 porte radius/4 ; l'atome DS suivra avec la vague Formulaire v2. Posé sur le canevas AVANT le contrat (§VIII), planches 031 · 26 et 031 · 27 validées puis supprimées, versions nommées avant/après. Ajout purement additif : MINEUR. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { required = false, value = '', placeholder = '', name = '', id = '', autocomplete = 'off', describedBy = '', style, children, ...rest },
  ref,
) {
  return (
    <textarea ref={ref} style={{ ...S.root, ...style }} data-required={required || undefined}  name={(String(name) || undefined)} id={(String(id) || undefined)} placeholder={(String(placeholder) || undefined)} aria-describedby={(String(describedBy) || undefined)} autoComplete={(String(autocomplete) || undefined)} {...(({ "true": { "required": true } } as const)[String(required) as "true"] ?? {})} {...rest}>
      <span style={{ ...S.texteDeSaisie }}>{value}</span>
    </textarea>
  );
});
