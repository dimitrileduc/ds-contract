/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/faq.contract.json (ds.faq v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { SectionHeader } from '../SectionHeader';
import { AccordionRow } from '../AccordionRow';
import { Button } from '../Button';
import styles from './FAQ.module.css';

export interface FAQProps extends HTMLAttributes<HTMLDivElement> {
  items?: Array<{ contenu: string; titre: string }>;
  /** Extracted from Figma "Ligne 3" BOOLEAN property (added by sync pass). */
  ligne3?: boolean;
}

/** Piqueray FAQ. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const FAQ = forwardRef<HTMLDivElement, FAQProps>(function FAQ(
  { ligne3 = true, items, className, children, ...rest },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} data-ligne3={ligne3 || undefined} {...rest}>
      <SectionHeader titre="Questions fréquentes" accroche="FAQ" disposition="standard" />
      <div className={styles.accordion}>
        {items?.map((item, index) => (
          <AccordionRow key={index} taille="grand" contenu={item.contenu} titre={item.titre} />
        ))}
      </div>
      <Button>Contactez-nous</Button>
    </div>
  );
});
