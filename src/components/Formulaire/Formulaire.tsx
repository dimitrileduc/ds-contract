/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/formulaire.contract.json (ds.formulaire v2.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { SectionHeader } from '../SectionHeader';
import { Avantage } from '../Avantage';
import { Button } from '../Button';
import { Field } from '../Field';
import { Textarea } from '../Textarea';
import styles from './Formulaire.module.css';

export interface FormulaireProps extends HTMLAttributes<HTMLDivElement> {
  consentement?: string;
  items?: Array<{ texte: string; titre: string }>;
  /** Extracted from Figma "Accroche" TEXT property (added by sync pass). */
  accroche?: string;
  /** Extracted from Figma "Titre" TEXT property (added by sync pass). Type rich-text since 2.0.0 because the exact parent→SectionHeader mapping must preserve the child contract's governed marks instead of flattening them. */
  titre?: Array<{ text: string; strong?: boolean }>;
}

/** Piqueray Formulaire. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. v2.0.0 makes the existing Titre/Accroche controls live on the composed SectionHeader. Titre changes from flat text to rich-text so its governed marks survive parent→child forwarding; the prop name and visible default stay unchanged, while the type change is correctly major-versioned. */
export const Formulaire = forwardRef<HTMLDivElement, FormulaireProps>(function Formulaire(
  {
    consentement = 'En cliquant sur «Envoyer», je confirme avoir lu et accepté la politique de confidentialité.',
    accroche = 'Une demande de devis ? Une réparation ?',
    titre = [{ text: 'Prenez contact avec nous dès maintenant !' }],
    items,
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <div className={styles.column}>
        <SectionHeader titre={titre} accroche={accroche} disposition="standard" />
        <div className={styles.features}>
          {items?.map((item, index) => (
            <Avantage key={index} texte={item.texte} titre={item.titre} />
          ))}
        </div>
        <div className={styles.buttons}>
          <Button>Contactez-nous</Button>
          <Button>Contactez-nous</Button>
        </div>
      </div>
      <div className={styles.form}>
        <div className={styles.row}>
          <Field label="Prénom" etat="normal" />
          <Field label="Nom" etat="normal" />
        </div>
        <div className={styles.row2}>
          <Field label="Email" etat="normal" />
          <Field label="Téléphone" etat="normal" />
        </div>
        <div className={styles.row3}>
          <Field label="Adresse" etat="normal" />
        </div>
        <div className={styles.row4}>
          <Field label="Sujet" etat="normal" />
        </div>
        <div className={styles.row5}>
          <Field label="Message" etat="normal">
            <Textarea value="Écrivez votre message ici..." />
          </Field>
        </div>
        <span className={styles.TexteConsentement}>{consentement}</span>
        <Button>Contactez-nous</Button>
      </div>
    </div>
  );
});
