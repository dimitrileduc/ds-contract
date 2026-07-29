/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/member-card.contract.json (ds.member-card v1.2.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { MemberPicture } from '../MemberPicture';
import styles from './MemberCard.module.css';

export interface MemberCardProps extends HTMLAttributes<HTMLDivElement> {
  nom?: string;
  poste?: string;
  imageUrl?: string;
  imageAlt?: string;
}

/** Piqueray MemberCard. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Portrait IMAGE overrides are explicit code-only photo data, propagated to the composed MemberPicture without flattening its image anatomy. */
export const MemberCard = forwardRef<HTMLDivElement, MemberCardProps>(function MemberCard(
  {
    nom = 'Cécilia Piqueray',
    poste = 'Gérante',
    imageUrl = '',
    imageAlt = '',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <MemberPicture etat="defaut" taille="member-card" src={imageUrl} alt={imageAlt} />
      <div className={styles.text}>
        <span className={styles.Nom}>{nom}</span>
        <span className={styles.Poste}>{poste}</span>
      </div>
    </div>
  );
});
