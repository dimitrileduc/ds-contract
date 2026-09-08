/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/realisations.contract.json (ds.realisations v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Realisation } from '../Realisation';
import styles from './Realisations.module.css';

export interface RealisationsProps extends HTMLAttributes<HTMLElement> {
  /** Axe de présentation responsive du DS. Pose la gouttière (24 · 48 · 56 · 89), l'écart de l'en-tête, le nombre de colonnes de la mosaïque et l'écart de grille. Fixé par la composition côté Odoo, jamais offert au rédacteur. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Forme de l'en-tête, axe VARIANT Figma `En-tete`. `accroche` : le sur-titre et le titre seuls, centrés (page « Portes d'entrée »). `presentation` : le titre à gauche et un paragraphe à droite au-dessus de 992 (pages « Portes de garage » industrielles et résidentielles). */
  enTete?: 'accroche' | 'presentation';
  /** Sur-titre en capitales, visible dans la seule forme `accroche` (la forme `presentation` masque l'accroche du SectionHeader sur le canevas). Aucune propriété Figma ne le porte au niveau de la section : la liaison est NONE, le texte vit dans l'instance de SectionHeader. */
  accroche?: string;
  /** Titre de section. TEXTE RICHE : la source porte une plage en gras (« industrielles et installations »), et la règle owner du 2026-09-02 dit qu'un texte avec du gras est riche. Trouvé par le TEST D'ÉDITION du 2026-09-07, pas par lecture : déclaré en texte plat, le gras était déplié au premier « Enregistrer » du rédacteur — la garde de saisie faisait exactement son travail sur un type faux. Aligné au centre en Mobile et Tablette, à gauche en Desktop et Wide dans la forme `presentation` — décision owner du 2026-09-07. La forme `accroche` reste centrée à toutes les largeurs, comme la source. */
  titre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** Paragraphe de la forme `presentation`, à droite du titre au-dessus de 992. TEXTE RICHE : la source porte deux plages en gras (Montserrat Bold), et la règle owner du 2026-09-02 dit qu'un texte avec du gras est riche. La marque strong est gouvernée par le jeton font.weight.bold. Sans ce type le gras serait déplié au premier enregistrement côté Odoo. */
  texte?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** La collection de photos de la mosaïque, un item par tuile. Neuf items sur les trois usages relevés ; la première occupe 2×2 cellules. Figma stocke les photos comme surcharges de fill d'instance, jamais comme propriété de composant : la liaison est NONE et l'URL vide par défaut ne substitue aucune image (limite déclarée, héritée de ds.realisation). */
  photos?: Array<{ imageUrl: string; imageAlt: string }>;
}

/** Section Realisations — la mosaïque de photos de chantiers. Contrat NEUF (vague 035, 2026-09-07) : la section n'existait ni en contrat ni en bloc Odoo, seule la tuile ds.realisation était gouvernée. Extrait du set candidat v2 de la page « 031 · Planches de validation », posé le même jour à partir du set v1 2117:4691 après nettoyage de la source (8 défauts relevés, dont l'aplat gris opaque qui cachait les 27 photos vivantes du fichier). Mosaïque : une grande tuile sur 2×2 cellules puis huit petites, 4 colonnes en Desktop et Wide, 2 en Tablette et Mobile — décision owner du 2026-09-07 (option B : deux colonnes en mobile plutôt qu'une, qui donnait 3638 px de défilement pour un seul bloc). Le rythme vertical appartient à la page (padding vertical 0), la gouttière au contrat, comme toutes les sections depuis la vague 031. */
export const Realisations = forwardRef<HTMLElement, RealisationsProps>(function Realisations(
  {
    presentation = 'mobile',
    enTete = 'accroche',
    accroche = 'Des installations de qualité',
    titre = [
      { text: 'Nos réalisations ' },
      { text: 'industrielles et installations', strong: true },
      { text: ' de qualité' },
    ],
    texte = [
      { text: 'Personnalisez votre porte industrielle grâce à ' },
      { text: 'nos solutions sur mesure', strong: true },
      {
        text: ', parfaitement intégrées à votre façade. Conçues pour recevoir tout type de bardage (Renson, Trespa, Alubond, Bois ou Eternit) ou des sections vitrées, nos portes garantissent ',
      },
      { text: 'une robustesse exceptionnelle et une très longue durée de vie', strong: true },
      { text: '.' },
    ],
    photos,
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [
    styles.root,
    styles[`presentation-${presentation}`],
    styles[`enTete-${enTete}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <section ref={ref} className={classes} {...rest}>
      <div className={styles.EnTete}>
        <div className={styles.SectionHeader}>
          {enTete === 'accroche' ? <span className={styles.Accroche}>{accroche}</span> : null}
          <h2 className={styles.Titre}>
            {titre.map((segment, index) => {
              const inner = segment.underline ? <u>{segment.text}</u> : segment.text;
              return segment.strong ? (
                <strong key={index}>{inner}</strong>
              ) : (
                <span key={index}>{inner}</span>
              );
            })}
          </h2>
        </div>
        {enTete === 'presentation' ? (
          <span className={styles.Texte}>
            {texte.map((segment, index) => {
              const inner = segment.underline ? <u>{segment.text}</u> : segment.text;
              return segment.strong ? (
                <strong key={index}>{inner}</strong>
              ) : (
                <span key={index}>{inner}</span>
              );
            })}
          </span>
        ) : null}
      </div>
      <div className={styles.Grille}>
        {photos?.map((item, index) => (
          <Realisation
            key={index}
            taille="grand"
            imageUrl={item.imageUrl}
            imageAlt={item.imageAlt}
          />
        ))}
      </div>
    </section>
  );
});
