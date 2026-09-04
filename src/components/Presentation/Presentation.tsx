/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/presentation.contract.json (ds.presentation v4.2.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './Presentation.module.css';

export interface PresentationProps extends HTMLAttributes<HTMLElement> {
  /** Viewport presentation mirrored from the 031 Figma axis. Mobile is the first set variant and the mobile-first CSS base; consumers do not select it at runtime. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Rich body copy. The 031 source contains paragraph breaks, therefore this content accepts strong and line-break in Odoo. Figma exposes no component property for this drawn text. */
  texte?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** CTA presence retained for code consumers. The 031 canvas does not expose it as a component property, so its Figma binding is NONE and Odoo fixes it by composition. */
  bouton?: boolean;
  /** Presentation-owned rich title. Its responsive H2 typography carries 24/30, 24/30, 32/40 and 40/50 across the 031 variants; Figma exposes no component property for the drawn text. */
  titre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
}

/** Piqueray Presentation responsive, adopted from the 031 component set. Mobile and tablette stack title, copy and CTA; desktop and wide use two equal columns. The wide component is authored at 1287px: this is the intentional reference width for this section, confirmed by the owner on 2026-09-02. Breakpoints remain an Odoo projection concern; the contract records the four Figma presentations and the design tokens only. 4.1.0 (2026-09-04) : « Hörmann » est SOULIGNÉ dans le paragraphe. Fait de source relevé sur les quatre variantes du set 031 (textDecoration UNDERLINE sur la plage [70,77)), que le contrat ne portait pas — le mot s'affichait en gras seul. La marque `underline` existe au schéma depuis la v19 (segment rich-text, rendue <u> par les émetteurs) : il suffisait de la poser. Plan de document : la partie titre porte la balise h2 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau. */
export const Presentation = forwardRef<HTMLElement, PresentationProps>(function Presentation(
  {
    presentation = 'mobile',
    bouton = true,
    texte = [
      { text: 'Depuis plus de 50 ans,', strong: true },
      { text: ' PIQUERAY est dépositaire officiel de la marque ' },
      { text: 'Hörmann', strong: true, underline: true },
      {
        text: ', fabricant connu pour ses produits de qualité et ses innovations.\n\nComposée d’une équipe d’une vingtaine de personnes de la ',
      },
      { text: 'région verviétoise', strong: true },
      {
        text: ' et gérée par Florian et Cécilia Piqueray (frère et sœur), l’entreprise se démarque par son caractère familial et sa proximité.\n\nQue vous soyez particulier ou une entreprise, ',
      },
      { text: 'Piqueray vous accompagne de A à Z', strong: true },
      { text: ' dans votre projet.' },
    ],
    titre = [
      { text: 'Piqueray, votre distributeur de portes Hörmann ' },
      { text: 'en Province de Liège', strong: true },
    ],
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
    <section ref={ref} className={classes} data-bouton={bouton || undefined} {...rest}>
      <div className={styles.colGauche}>
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
      <div className={styles.wrapper}>
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
        {bouton ? (
          <Button variant="link" iconLeft={false} iconRight>
            En savoir plus
          </Button>
        ) : null}
      </div>
    </section>
  );
});
