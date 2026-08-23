/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/presentation.contract.json (ds.presentation v3.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './Presentation.module.css';

export interface PresentationProps extends HTMLAttributes<HTMLDivElement> {
  texte?: Array<{ text: string; strong?: boolean }>;
  bouton?: boolean;
  /** Presentation-owned rich title. The prior medium SectionHeader variant is replaced by direct 32/40 anatomy. */
  titre?: Array<{ text: string; strong?: boolean }>;
}

/** Piqueray Presentation. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. v2.6.0 makes the two-column composition fluid: the root, both columns and the nested SectionHeader are Fill at a 1287px authoring reference, with no max-width and no local padding. Page and site Containers own external spacing. */
export const Presentation = forwardRef<HTMLDivElement, PresentationProps>(function Presentation(
  {
    bouton = true,
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
    titre = [{ text: 'Piqueray, ', strong: true }, { text: 'une histoire de famille ' }],
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} data-bouton={bouton || undefined} {...rest}>
      <div className={styles.colGauche}>
        <span className={styles.Titre}>
          {titre.map((segment, index) =>
            segment.strong ? (
              <strong key={index}>{segment.text}</strong>
            ) : (
              <span key={index}>{segment.text}</span>
            ),
          )}
        </span>
      </div>
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
        {bouton ? (
          <Button variant="link" iconRight>
            Contactez-nous
          </Button>
        ) : null}
      </div>
    </div>
  );
});
