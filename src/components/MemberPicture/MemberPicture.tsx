/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/member-picture.contract.json (ds.member-picture v1.2.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './MemberPicture.module.css';

export interface MemberPictureProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual state: default (no overlay) or hover (overlay visible). Extracted from the VARIANT property « Etat » on the Figma master. */
  etat?: 'defaut' | 'survol';
  /** Code-side geometry selector for observed composed placements. The MemberCard instance is explicitly resized to 363.5px inside its 364px parent frame; the standalone atom keeps the 364px master geometry by default. */
  taille?: 'standard' | 'member-card';
  src?: string;
  alt?: string;
}

/** Piqueray member picture. A circular member-photo component with two states, extracted from the Figma COMPONENT_SET « MemberPicture » on DS · Atomes, reviewed and adopted — not authored.

The etat variant stacks two 364×364 circular image planes: normal is opaque in defaut and transparent in survol, with a 300ms opacity transition. The root clips both planes at its 500px radius. The visible normal plane receives its code-only src and alt scalars from its composed parent.

† A5 technical placeholder: the source IMAGE pixels of funIa are unavailable to the contract→canvas transport. That hidden-under-normal layer therefore keeps the engine's generic #D9D9D9 image-placeholder wash. This is not a Piqueray colour extracted from Figma, and the survol-only funIa plane remains outside the runtime photo API. */
export const MemberPicture = forwardRef<HTMLDivElement, MemberPictureProps>(function MemberPicture(
  { etat = 'defaut', taille = 'standard', src = '', alt = '', className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`etat-${etat}`], styles[`taille-${taille}`], className]
    .filter(Boolean)
    .join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <img className={styles.funIa} alt=""></img>
      <img className={styles.normal} src={String(src)} alt={String(alt)}></img>
    </div>
  );
});
