/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/equipe.contract.json (ds.equipe v1.2.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { MemberCard } from '../MemberCard';
import styles from './Equipe.module.css';

export interface EquipeProps extends HTMLAttributes<HTMLDivElement> {
  items?: Array<{ poste: string; nom: string }>;
}

/** Piqueray Equipe. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Equipe = forwardRef<HTMLDivElement, EquipeProps>(function Equipe(
  { items, className, children, ...rest },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <div className={styles.grid}>
        {items?.map((item, index) => (
          <MemberCard key={index} poste={item.poste} nom={item.nom} />
        ))}
      </div>
    </div>
  );
});
