/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/hero.contract.json (ds.hero v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { SectionHeader } from '../SectionHeader';
import { Button } from '../Button';
import styles from './Hero.module.css';

export interface HeroProps extends HTMLAttributes<HTMLDivElement> {}

/** Piqueray Hero. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Hero = forwardRef<HTMLDivElement, HeroProps>(function Hero(
  { className, children, ...rest },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <div className={styles.blocTexte}>
        <div className={styles.Titres}>
          <SectionHeader
            titre="Portes de garage industrielles"
            accroche="Plus de 50 ans d’expérience"
            disposition="standard"
          />
          <div className={styles.wrapper}>
            <span className={styles.sousTitre}>
              La performance sans compromis, même en usage intensif. Atelier, bâtiment industriel,
              bâtiment public ou résidence : quelle que soit votre application, nous avons la
              solution idéale.
            </span>
            <Button>Contactez-nous</Button>
          </div>
        </div>
      </div>
    </div>
  );
});
