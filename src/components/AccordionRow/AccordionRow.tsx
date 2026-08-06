/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/accordion-row.contract.json (ds.accordion-row v1.2.0)
 * Regenerate with: npm run generate
 */
import { forwardRef, useState, useId } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './AccordionRow.module.css';

const ICONS: Record<string, string> = {
  'chevron-up':
    '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M7.29302 19.293C6.90249 19.6835 6.90249 20.3166 7.29302 20.7071C7.68354 21.0976 8.31655 21.0976 8.70708 20.7071L16 13.4141L23.293 20.7071C23.6835 21.0976 24.3166 21.0976 24.7071 20.7071C25.0976 20.3166 25.0976 19.6835 24.7071 19.293L16.7071 11.293C16.3166 10.9025 15.6835 10.9025 15.293 11.293L7.29302 19.293Z" fill="currentColor"/>\n</svg>',
  'chevron-down':
    '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M7.29302 12.7071C6.90249 12.3166 6.90249 11.6836 7.29302 11.293C7.68354 10.9025 8.31655 10.9025 8.70708 11.293L16 18.586L23.293 11.293C23.6835 10.9025 24.3166 10.9025 24.7071 11.293C25.0976 11.6836 25.0976 12.3166 24.7071 12.7071L16.7071 20.7071C16.3166 21.0976 15.6835 21.0976 15.293 20.7071L7.29302 12.7071Z" fill="currentColor"/>\n</svg>',
};

export interface AccordionRowProps extends HTMLAttributes<HTMLDivElement> {
  taille?: 'grand' | 'petit';
  /** Controlled when supplied; otherwise toggles independently between fermé and ouvert. */
  etat?: 'ferme' | 'ouvert';
  titre: string;
  contenu: string;
  /** Activates the transparent native trigger projected over the Figma title row. */
  onToggle?: () => void;
}

/** Piqueray AccordionRow. Visual anatomy, layout, dimensions, typography, colors and visibility are adopted from the validated read-only Figma extraction. Native button, toggle and ARIA semantics are intentionally deferred to a separately proven semantic-wrapper capability. */
export const AccordionRow = forwardRef<HTMLDivElement, AccordionRowProps>(function AccordionRow(
  { taille = 'grand', etat: etatProp, titre, contenu, onToggle, className, children, ...rest },
  ref,
) {
  const toggleControlsId = useId();
  const [etatUncontrolled, setEtatUncontrolled] = useState<'ferme' | 'ouvert'>('ferme');
  const etat = etatProp ?? etatUncontrolled;
  const handleToggle = () => {
    setEtatUncontrolled(etat === 'ouvert' ? 'ferme' : 'ouvert');
    onToggle?.();
  };
  const classes = [styles.root, styles[`taille-${taille}`], styles[`etat-${etat}`], className]
    .filter(Boolean)
    .join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      {etat === 'ouvert' ? (
        <div className={styles.title}>
          {etat === 'ouvert' ? <span className={styles.TitreOuvert}>{titre}</span> : null}
          {etat === 'ouvert' ? (
            <span
              className={styles.ChevronUp}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ICONS['chevron-up'] }}
            />
          ) : null}
        </div>
      ) : null}
      {etat === 'ouvert' ? (
        <span className={styles.Contenu} id={toggleControlsId}>
          {contenu}
        </span>
      ) : null}
      {etat === 'ferme' ? <span className={styles.Titre}>{titre}</span> : null}
      {etat === 'ferme' ? (
        <span
          className={styles.ChevronDown}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: ICONS['chevron-down'] }}
        />
      ) : null}
      <button
        className={styles.trigger}
        aria-label={String(titre)}
        type="button"
        onClick={handleToggle}
        aria-expanded={etat === 'ouvert'}
        aria-controls={toggleControlsId}
      ></button>
    </div>
  );
});
