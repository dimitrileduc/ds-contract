/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/sav.contract.json (ds.sav v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { SectionHeader } from '../SectionHeader';
import { Button } from '../Button';
import styles from './SAV.module.css';

export interface SAVProps extends HTMLAttributes<HTMLDivElement> {
  /** Extracted from Figma "Titre" TEXT property (added by sync pass). */
  titre?: string;
}

/** Piqueray SAV. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const SAV = forwardRef<HTMLDivElement, SAVProps>(function SAV(
  { titre = 'Dépannage / SAV', className, children, ...rest },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <div className={styles.section}>
        <div className={styles.background}></div>
        <div className={styles.row}>
          <div className={styles.wrapper}>
            <div className={styles.WrapperBackground}></div>
            <div className={styles.inner}>
              <SectionHeader
                titre="Dépannage / SAV"
                accroche="Plus de 50 ans d’expérience"
                disposition="standard"
              />
              <span className={styles.vousRencontrezUnProblmeA}>
                Vous rencontrez un problème avec votre installation Hörmann à Liège ? Il y a une
                panne de courant et votre porte de garage ne s’ouvre plus ? La télécommande de ma
                porte est cassée ? Votre porte ne se ferme plus correctement ? Pas de panique,
                Piqueray, votre distributeur Hörmann en province de Liège est là pour vous aider !
              </span>
              <Button>Contactez-nous</Button>
            </div>
          </div>
          <div className={styles.imgGroup}>
            <div className={styles.ImgGroupBackground}></div>
            <div className={styles.img}></div>
          </div>
        </div>
      </div>
    </div>
  );
});
