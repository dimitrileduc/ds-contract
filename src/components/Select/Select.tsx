/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/select.contract.json (ds.select v2.1.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './Select.module.css';

const ICONS: Record<string, string> = {
  'chevron-down':
    '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M7.29302 12.7071C6.90249 12.3166 6.90249 11.6836 7.29302 11.293C7.68354 10.9025 8.31655 10.9025 8.70708 11.293L16 18.586L23.293 11.293C23.6835 10.9025 24.3166 10.9025 24.7071 11.293C25.0976 11.6836 25.0976 12.3166 24.7071 12.7071L16.7071 20.7071C16.3166 21.0976 15.6835 21.0976 15.293 20.7071L7.29302 12.7071Z" fill="currentColor"/>\n</svg>',
};

export interface SelectProps extends HTMLAttributes<HTMLDivElement> {
  /** Valeur affichée (option sélectionnée). Vide au repos depuis 2.0.0. */
  value?: string;
  /** Nom du champ envoyé au serveur, posé sur le <select> réel. Code-only. */
  name?: string;
  /** Identifiant DOM du <select> réel, cible du htmlFor du libellé porté par Field. Code-only. */
  id?: string;
  /** Attribut natif required sur le <select> réel. Code-only. */
  required?: boolean;
  /** aria-describedby du <select> réel : identifiant du message d'erreur, unique par champ. Code-only. */
  describedBy?: string;
}

/** Liste déroulante Piqueray. Relevée sur le candidat v2 « Select · candidat v2 » de la planche 031·21 (2026-09-08 ; composant simple, sans axe State — l'anneau de focus étant code-only, un axe dessiné à la main serait un aperçu creux que la parité refuse), revue et adoptée — pas rédigée à la main.

Motif enveloppe conservé de 1.0.0 : la boîte est présentationnelle, un VRAI <select> natif à l'intérieur porte la valeur et l'accessibilité, le chevron gouverné (registre `chevron-down`, 24) est un frère — un <select> natif ne peut pas héberger un chevron dessiné. Le consommateur fournit les options.

MAJEUR 2.0.0, même passe qu'Input : ancres sur le candidat, bordure color.noir (3:1 exigés), texte 16 px, valeur par défaut vide, anneau de focus déclaré. LIMITE NOMMÉE : le focus se pose sur le <select> intérieur, pas sur la boîte ; le canal d'états d'une part non-racine n'accepte pas outline (color/background-color/border-color seulement), et :focus-within n'est pas un état du schéma. L'anneau du Select est donc un fait CODE-ONLY, à porter dans la feuille Odoo (`.select:focus-within`) et nommé ici. Les props name, id, required, describedBy sont code-only et se posent sur la part `valeur` (le contrôle réel).

VERSION 2.1.0 (2026-09-09, vague « arrondis ») — le littéral border-radius 0px, invisible au différentiel, devient le token radius.4 : le champ est un contrôle comme le bouton, même rayon. Canevas : le candidat v2 de la planche 031 · 21 porte radius/4 ; l'atome DS suivra avec la vague Formulaire v2. Posé sur le canevas AVANT le contrat (§VIII), planches 031 · 26 et 031 · 27 validées puis supprimées, versions nommées avant/après. Ajout purement additif : MINEUR. */
export const Select = forwardRef<HTMLDivElement, SelectProps>(function Select(
  {
    required = false,
    value = '',
    name = '',
    id = '',
    describedBy = '',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} data-required={required || undefined} {...rest}>
      <select
        className={styles.valeur}
        name={String(name) || undefined}
        id={String(id) || undefined}
        aria-describedby={String(describedBy) || undefined}
        {...(({ true: { required: true } } as const)[String(required) as 'true'] ?? {})}
      >
        <option>{value}</option>
      </select>
      <span
        className={styles.chevron}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: ICONS['chevron-down'] }}
      />
    </div>
  );
});
