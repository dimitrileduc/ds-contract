/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/reassurances.contract.json (ds.reassurances v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { SectionHeader } from '../SectionHeader';
import { Carte } from '../Carte';
import { Button } from '../Button';
import styles from './Reassurances.module.css';

export interface ReassurancesProps extends HTMLAttributes<HTMLDivElement> {
  disposition?: '4Cartes' | 'quatrecartesdeuxcta' | '5Cartes';
  items?: Array<{ texte: string; titre: string }>;
}

/** Piqueray Reassurances. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Reassurances = forwardRef<HTMLDivElement, ReassurancesProps>(function Reassurances(
  { disposition = '4Cartes', items, className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`disposition-${disposition}`], className]
    .filter(Boolean)
    .join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <SectionHeader
        titre="Pourquoi choisir nos portes de garage industrielles ?"
        accroche="Plus de 50 ans d’expérience"
        disposition="standard"
      />
      <div className={styles.items}>
        {items?.map((item, index) => (
          <Carte
            key={index}
            disposition="reassurance"
            texte={[{ text: item.texte }]}
            titre={item.titre}
          />
        ))}
      </div>
      {disposition === '5Cartes' ? <Button>Contactez-nous</Button> : null}
      {disposition === 'quatrecartesdeuxcta' ? (
        <div className={styles.Boutons}>
          {disposition === 'quatrecartesdeuxcta' ? <Button>Contactez-nous</Button> : null}
          {disposition === 'quatrecartesdeuxcta' ? <Button>Contactez-nous</Button> : null}
        </div>
      ) : null}
      {disposition === '4Cartes' ? <Button>Contactez-nous</Button> : null}
    </div>
  );
});
