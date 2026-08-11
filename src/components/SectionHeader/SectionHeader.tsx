/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/section-header.contract.json (ds.section-header v2.2.0)
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
  /** Axe gouverné : binding VARIANT « Emphase » depuis 2.1.0 (016, journal decisions.md O-12 — le SET 2090:2397 a gagné les dimensions Emphase et Alignement, 16 variantes). LIMITE LEVÉE : jusqu'en 2.0.x cet axe était code-only (bindings.figma.kind: NONE), une abstraction au-dessus de surcharges d'instance ad hoc (hero 2169:6264 : 54/68/blanc ; presentation 2169:6246 : 32/40 ; texte-seo 2170:6361 : 24/30 ; les autres usages au défaut 40/50 du master 2090:2385) — le correctif de fond annoncé par l'ancienne limite (promouvoir ces surcharges en variantes réelles) a eu lieu côté Figma. Le modèle du poids hero est inchangé : le nœud d'origine porte un style de BASE Bold 700 avec une surcharge Light 300 sur « industrielles » ; le contrat porte l'inverse strictement équivalent en pixels — la plage non marquée prend le poids de base (300, littéral : aucun token Light dans la fondation) et la plage marquée prend content.marks.strong (token font.weight.bold). */
  emphase?: 'standard' | 'hero' | 'moyen' | 'compact';
  /** Axe gouverné : binding VARIANT « Alignement » depuis 2.1.0 (016, journal decisions.md O-12). LIMITE LEVÉE : jusqu'en 2.0.x cet axe était code-only (bindings.figma.kind: NONE) — le master 2090:2385 centrait (textAlign CENTER) et les usages le surchargeaient en LEFT par instance (census 013 : 5 usages sur 7 ; relevé vif 016 : 34 instances sur 59, specs/016-canvas-vrai/registre/defauts-source.json B013-2). Le correctif de fond annoncé par l'ancienne limite a eu lieu : l'alignement est une variante gouvernée du master. */
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
      {disposition === 'avecCta' ? <Button variant="outlineNoir">Voir les produits</Button> : null}
    </div>
  );
});
