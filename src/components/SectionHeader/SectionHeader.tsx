/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/section-header.contract.json (ds.section-header v2.1.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './SectionHeader.module.css';

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  disposition?: 'standard' | 'avecCta';
  accroche?: string;
  /** Une seule propriété TEXT Figma ("Titre"), à graisses MIXTES chez trois consommateurs : presentation dessine « Piqueray, » en Bold puis le reste en Regular (I2169:6246;2090:2387), texte-seo met « showroom à Pepinster » en Bold au milieu de la phrase (I2170:6361;2090:2387), hero met « Portes de garage » en Bold et « industrielles » en Light (I2169:6264;2090:2387). Les cinq autres consommateurs passent un segment unique. La projection canvas reste UNE valeur TEXT native : la concaténation à plat. */
  titre?: Array<{ text: string; strong?: boolean }>;
  /** Extracted from Figma "Accroche2" BOOLEAN property (added by sync pass). */
  accroche2?: boolean;
  /** LIMITE NOMMÉE — abstraction code-side sur des surcharges d'instance Figma ad hoc. Le master 2090:2385 porte 40px/50px ; les usages surchargent la typographie du Titre par instance (hero 2169:6264 : 54/68/blanc, poids 300 sur la plage NON marquée — voir ci-dessous ; presentation 2169:6246 : 32/40 ; texte-seo 2170:6361 : 24/30 ; coordonnees, faq, sav et reassurances restent à 40/50 = defaut) au lieu de la porter en variantes gouvernées. Le poids du hero : le nœud Figma a un style de BASE Bold 700 avec une surcharge Light 300 sur « industrielles » ; le modèle du contrat porte l'inverse strictement équivalent en pixels — la plage non marquée prend le poids de base (300, littéral : aucun token Light dans la fondation) et la plage marquée prend content.marks.strong (token font.weight.bold). `component.props` ne transporte que des valeurs de props, jamais une surcharge typographique de l'enfant — cet axe est donc le seul moyen de porter le fait sans retoucher la sortie générée. Le correctif de fond appartient à Figma : promouvoir ces surcharges en variantes réelles, après quoi cet axe redevient un VARIANT lié. */
  emphase?: 'standard' | 'hero' | 'moyen' | 'compact';
  /** LIMITE NOMMÉE — le master 2090:2385 centre (textAlign CENTER) mais 5 usages sur 7 le surchargent en LEFT par instance (coordonnees, presentation, sav, texte-seo, hero) quand faq et reassurances suivent le master. Cet axe code-side porte ce fait d’usage ; le correctif de fond appartient à Figma (promouvoir l’alignement en variante gouvernée du master). */
  alignement?: 'centre' | 'gauche';
}

/** Piqueray SectionHeader. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. */
export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  {
    disposition = 'standard',
    emphase = 'standard',
    alignement = 'centre',
    accroche2 = true,
    accroche = 'Plus de 50 ans d’expérience',
    titre = [{ text: 'Pourquoi choisir Piqueray ?' }],
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [
    styles.root,
    styles[`disposition-${disposition}`],
    styles[`emphase-${emphase}`],
    styles[`alignement-${alignement}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div ref={ref} className={classes} data-accroche2={accroche2 || undefined} {...rest}>
      {accroche2 ? <span className={styles.Accroche}>{accroche}</span> : null}
      <span className={styles.Titre}>
        {titre.map((segment, index) =>
          segment.strong ? (
            <strong key={index}>{segment.text}</strong>
          ) : (
            <span key={index}>{segment.text}</span>
          ),
        )}
      </span>
      {disposition === 'avecCta' ? <Button variant="outilneNoir">Voir les produits</Button> : null}
    </div>
  );
});
