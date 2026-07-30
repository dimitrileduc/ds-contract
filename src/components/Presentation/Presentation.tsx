/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/presentation.contract.json (ds.presentation v2.1.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { SectionHeader } from '../SectionHeader';
import { Button } from '../Button';
import styles from './Presentation.module.css';

export interface PresentationProps extends HTMLAttributes<HTMLDivElement> {
  texte?: Array<{ text: string; strong?: boolean }>;
  bouton?: boolean;
  /** Extracted from Figma "Titre" TEXT property (added by sync pass). */
  titre?: string;
}

/** Piqueray Presentation. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Presentation = forwardRef<HTMLDivElement, PresentationProps>(function Presentation(
  {
    bouton = false,
    titre = 'Piqueray, une histoire de famille ',
    texte = [
      { text: 'Depuis plus de 50 ans,', strong: true },
      {
        text: " la société Piqueray est une référence en Province de Liège. Aujourd'hui dirigée par Florian et Cécilia Piqueray, l'entreprise perpétue les valeurs de ",
      },
      { text: "proximité et d'excellence technique", strong: true },
      { text: '. Dépositaire officiel ' },
      { text: 'Hörmann', strong: true },
      { text: ", nous allions la force d'un leader mondial à " },
      { text: "la souplesse d'une PME locale", strong: true },
      { text: '.' },
    ],
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
        titre={[{ text: 'Piqueray, ', strong: true }, { text: 'une histoire de famille ' }]}
        accroche="Plus de 50 ans d’expérience"
        disposition="standard"
        accroche2={false}
        emphase="moyen"
        alignement="gauche"
      />
      <div className={styles.wrapper}>
        <span className={styles.Texte}>
          {texte.map((segment, index) =>
            segment.strong ? (
              <strong key={index}>{segment.text}</strong>
            ) : (
              <span key={index}>{segment.text}</span>
            ),
          )}
        </span>
        {bouton ? <Button>Contactez-nous</Button> : null}
      </div>
    </div>
  );
});
