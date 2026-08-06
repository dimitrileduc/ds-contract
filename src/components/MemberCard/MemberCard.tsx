/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/member-card.contract.json (ds.member-card v1.2.1)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { MemberPicture } from '../MemberPicture';
import styles from './MemberCard.module.css';

export interface MemberCardProps extends HTMLAttributes<HTMLDivElement> {
  nom?: string;
  poste?: string;
  /** La ROUTE du portrait, jamais ses octets. Figma n'expose aucune propriete de composant pour ces pixels (trou A5, matrice ligne 91) : le contrat porte la route, la photo arrive a l'execution. Defaut vide, et il le reste. Ce contrat n'a pas de part `img` a lui — son plan photo vient de l'instance ds.member-picture qu'il compose — mais il porte bien sa propre prop d'URL, et elle obeit a la meme convention. */
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
