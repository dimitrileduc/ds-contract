/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carte.contract.json (ds.carte v3.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './Carte.module.css';

export interface CarteProps extends HTMLAttributes<HTMLDivElement> {
  /**  — 2026-09-02 : le set 031 ne dessine QUE la réassurance ; la disposition « categorie » est une forme d'archive conservée (décision owner, cf. Empile de ds.carte-categorie), plus utilisée par aucune page. Écart de parité acquitté. */
  disposition?: 'reassurance' | 'categorie';
  /** Alignement du texte de la carte, miroir de l'axe Alignement du set 031 (2700:25961). Centré est la première variante du set, donc le défaut. La section Réassurances aligne à gauche sous le seuil bureau et centre au-dessus : une part instance n'a pas de canal par mode, cette bascule est un fait code-only de la projection Odoo, nommé dans le CSS de la section. */
  alignement?: 'centre' | 'gauche';
  /**  Défaut relevé sur le set 031 le 2026-09-02. */
  titre?: string;
  /** La ROUTE de l'image, jamais ses octets. Figma n'expose aucune propriete de composant pour ces pixels (trou A5, matrice ligne 91, colonne Bindable : image content not bindable) : le contrat porte donc la route, la photo arrive a l'execution. Defaut vide, et il le reste — un defaut non vide substituerait une image et la ferait entrer au contrat par la porte de derriere. Sur le canevas, ce cadre dessine le lavis technique #D9D9D9 ; la photo qu'un designer y voit est une maquette, hors contrat, preservee a la regeneration par une passe de sauvetage explicite (docs/handoff/08-status-what-doesnt-work.md, §6). */
  imageUrl?: string;
  imageAlt?: string;
  /** The first sentence is the strong range observed in both immutable master variants (Figma Bold/700); concatenate segments for the native Figma TEXT value. The inventory has no 700-weight token, so this bounded mark carries the observed 700 literal rather than inventing a token. Défaut relevé sur le set 031 le 2026-09-02. */
  texte?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** Nested Categorie Link Button label. The source Carte component does not expose it as a top-level Figma property, so immutable occurrence values come from the nested Button TEXT property retained by the campaign census. */
  ctaLabel?: string;
  /** Nested Categorie Link Button leading glyph retained from the concrete nested Figma instance. */
  ctaIconLeftGlyph?: 'pdf';
  /** Nested Categorie Link Button trailing glyph retained from the concrete nested Figma instance. */
  ctaIconRightGlyph?: 'arrow-right' | 'download';
}

/** Piqueray Carte, responsive. 3.0.0 (2026-09-02, vague 031) : la branche réassurance est ré-extraite du set 031 CarteReassurance (2700:25961), qui porte un axe Alignement {Centré, Gauche} et lie ses espacements aux jetons par écran. Ce qui change : écart et marge basse suivent spacing.carte-reassurance.gap et pad-bas (16 en mobile, 24 au-delà), la photo suit photo-h (192 / 240 / 364), le titre monte le style responsive H4 (20/25 → 24/30) et le texte la recette de corps (16/24 → 18/27), l'alignement devient une propriété gouvernée au lieu d'un choix figé. La largeur dessinée 341,33 est un témoin : la carte remplit sa piste. Avant cette version les vingt cartes de la section Réassurances étaient des cadres libres, sans lien au composant : elles ont été remplacées par des instances le 2026-09-02, à zéro pixel de différence sur les quatre vues. La disposition « categorie » est conservée en archive, plus utilisée par aucune page.

Historique avant 3.0.0 :
Piqueray Carte. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. It is one context-width card with two Figma dispositions: Reassurance (fixed-height image, centred content) and Categorie (remaining-space image and a Link Button CTA). Image URLs remain consumer/campaign inputs, never capture defaults.

Version 2.0.0 is a breaking change: `texte` is now typed rich text so the source's leading strong range is preserved without raw HTML. */
export const Carte = forwardRef<HTMLDivElement, CarteProps>(function Carte(
  {
    disposition = 'reassurance',
    alignement = 'centre',
    ctaIconLeftGlyph = 'pdf',
    ctaIconRightGlyph = 'download',
    titre = 'Sécurité et conformité',
    imageUrl = '',
    imageAlt = '',
    ctaLabel = 'Contactez-nous',
    texte = [
      { text: 'Respectent les normes des bâtiments publics et les réglementations pompiers.' },
    ],
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [
    styles.root,
    styles[`disposition-${disposition}`],
    styles[`alignement-${alignement}`],
    styles[`ctaIconLeftGlyph-${ctaIconLeftGlyph}`],
    styles[`ctaIconRightGlyph-${ctaIconRightGlyph}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      {disposition === 'reassurance' ? (
        <img
          className={styles.reassuranceImage}
          src={String(imageUrl)}
          alt={String(imageAlt)}
        ></img>
      ) : null}
      {disposition === 'categorie' ? (
        <img className={styles.categorieImage} src={String(imageUrl)} alt={String(imageAlt)}></img>
      ) : null}
      <div className={styles.text}>
        {disposition === 'reassurance' ? (
          <span className={styles.TitreReassurance}>{titre}</span>
        ) : null}
        {disposition === 'categorie' ? (
          <span className={styles.TitreCategorie}>{titre}</span>
        ) : null}
        {disposition === 'reassurance' ? (
          <span className={styles.TexteReassurance}>
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
        {disposition === 'categorie' ? (
          <span className={styles.TexteCategorie}>
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
      {disposition === 'categorie' ? (
        <div className={styles.Bouton}>
          <Button
            variant="link"
            iconLeft
            iconRight
            iconLeftGlyph={ctaIconLeftGlyph}
            iconRightGlyph={ctaIconRightGlyph}
          >
            {ctaLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
});
