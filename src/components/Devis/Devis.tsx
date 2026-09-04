/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/devis.contract.json (ds.devis v2.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './Devis.module.css';

export interface DevisProps extends HTMLAttributes<HTMLElement> {
  /** Axe de présentation du set 031. Le défaut est la première variante dessinée (Mobile) — la parité l'exige. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Titre du bandeau, texte riche. Le set 031 n'expose AUCUNE propriété TEXT (l'ancien master 2096:2524 exposait Titre) : la liaison figma est NONE — régression de source, nommée. Riche parce que le titre porte un SAUT DE LIGNE après « gratuit, » (règle owner 2026-09-02 : un saut de ligne est du texte riche, et un saut vaut pour tous les modes). Sur le canvas il n'est explicite que sur la variante Desktop (séparateur U+2028, relevé sur 2694:21563) ; Mobile et Tablette coupent naturellement ailleurs — écart de source à corriger dans Figma, comme la planche Tablette du hero l'a été. Le saut vit dans le contenu des pages ; la part déclare white-space pre-line. */
  titre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** URL fournie par le code pour le plan photo. Le set 031 range ces pixels dans une PEINTURE IMAGE du cadre Background (imageHash 7825ba2d393a21ddc6d94a7bfd05c1f3bde128aa, scaleMode FILL, sans imageTransform, identique dans les quatre variantes), jamais dans une propriété de composant : liaison NONE et défaut vide intentionnel — il ne substitue aucune image. Même provenance et même orthographe que sav.backgroundUrl. */
  backgroundUrl?: string;
  /** Alternative textuelle appariée à backgroundUrl. Une peinture IMAGE Figma n'expose aucune propriété d'alternative textuelle : le défaut vide est intentionnel (plan décoratif). */
  backgroundAlt?: string;
  /** Affiche les deux plans de fond du root (photo puis voile). Aucune propriété de composant Figma n'y correspond — les deux plans sont des CADRES ABSOLUS du master (contraintes STRETCH/STRETCH), pas une propriété : liaison NONE, défaut true (l'état du master). À false, les deux plans disparaissent et seul le background-color du root subsiste. */
  fond?: boolean;
}

/** Piqueray Devis responsive, adopté depuis le set 031 (2694:21604) — bandeau CTA pleine largeur : photo de fond, voile dégradé, titre H2 et un bouton Outline blanc, centrés. MAJEUR : les ancres Figma quittent l'ancien master 2096:2524 pour le set 031, et la prop presentation apparaît. Le set expose quatre variantes dessinées 390x496, 834x466, 1200x358 et 1728x506 ; le contrat porte ces hauteurs, le CSS Odoo en fait des min-height (Odoo force height:auto sur les sections sous 768). Les points de rupture restent une affaire de projection Odoo. */
export const Devis = forwardRef<HTMLElement, DevisProps>(function Devis(
  {
    presentation = 'mobile',
    fond = true,
    backgroundUrl = '',
    backgroundAlt = '',
    titre = [{ text: 'Prenez rendez-vous pour un devis gratuit,\nnous nous déplaçons chez vous' }],
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, styles[`presentation-${presentation}`], className]
    .filter(Boolean)
    .join(' ');
  return (
    <section ref={ref} className={classes} data-fond={fond || undefined} {...rest}>
      {fond ? (
        <img
          className={styles.Background}
          src={String(backgroundUrl)}
          alt={String(backgroundAlt)}
        ></img>
      ) : null}
      {fond ? <div className={styles.Voile}></div> : null}
      <div className={styles.Container}>
        <span className={styles.Titre}>
          {titre.map((segment, index) => {
            const inner = segment.underline ? <u>{segment.text}</u> : segment.text;
            return segment.strong ? (
              <strong key={index}>{inner}</strong>
            ) : (
              <span key={index}>{inner}</span>
            );
          })}
        </span>
        <Button variant="outlineBlanc" iconRight iconRightGlyph="arrow-right">
          Prendre rendez-vous
        </Button>
      </div>
    </section>
  );
});
