/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/textarea.contract.json (ds.textarea v2.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';

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

Les props placeholder, name, id, autocomplete, required et describedBy sont CODE-ONLY (liaison figma NONE), portés par attrs/attrsByProp sans évolution de schéma. Le redimensionnement vertical par l'utilisateur reste possible (aucune règle resize ici : ne pas bloquer une zone où l'on écrit 500 caractères). Limite nommée : trait extérieur 2 px au canevas ≈ outline décalé de 2 px en CSS. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    required = false,
    value = '',
    placeholder = '',
    name = '',
    id = '',
    autocomplete = 'off',
    describedBy = '',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <textarea
      ref={ref}
      className={classes}
      data-required={required || undefined}
      name={String(name) || undefined}
      id={String(id) || undefined}
      placeholder={String(placeholder) || undefined}
      aria-describedby={String(describedBy) || undefined}
      autoComplete={String(autocomplete) || undefined}
      {...(({ true: { required: true } } as const)[String(required) as 'true'] ?? {})}
      defaultValue={String(value)}
      {...rest}
    />
  );
});
