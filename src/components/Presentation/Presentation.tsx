/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/presentation.contract.json (ds.presentation v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { SectionHeader } from '../SectionHeader';
import { Button } from '../Button';
import styles from './Presentation.module.css';

export interface PresentationProps extends HTMLAttributes<HTMLDivElement> {
  texte?: string;
  bouton?: boolean;
  /** Extracted from Figma "Titre" TEXT property (added by sync pass). */
  titre?: string;
}

/** Piqueray Presentation. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Presentation = forwardRef<HTMLDivElement, PresentationProps>(function Presentation(
  {
    bouton = false,
    texte = 'Depuis plus de 50 ans, la société Piqueray est une référence en Province de Liège. Aujourd’hui dirigée par Florian et Cécilia Piqueray, l’entreprise perpétue les valeurs de proximité et d’excellence technique. Dépositaire officiel Hörmann, nous allions la force d’un leader mondial à la souplesse d’une PME locale.',
    titre = 'Piqueray, une histoire de famille ',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} data-bouton={bouton || undefined} {...rest}>
      <SectionHeader
        titre="Piqueray, une histoire de famille "
        accroche="Plus de 50 ans d’expérience"
        disposition="standard"
      />
      <div className={styles.wrapper}>
        <span className={styles.Texte}>{texte}</span>
        {bouton ? <Button>Contactez-nous</Button> : null}
      </div>
    </div>
  );
});
