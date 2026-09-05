/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carte-categorie.contract.json (ds.carte-categorie v2.2.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from '../Button';
import styles from './CarteCategorie.module.css';

const ICONS: Record<string, string> = {
  'carte-categorie-decor':
    '<svg width="100" height="131" viewBox="0 0 100 131" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M55.3672 99.0918V110.537L83.8877 94.291V82.7852L55.3672 99.0918ZM55.3672 81.6787V93.3945L83.8877 77.1084V65.377L55.3672 81.6787ZM55.3672 64.8252V75.9785L83.8877 59.7012V48.5234L55.3672 64.8252ZM43.9189 52.4229L54.8809 59.4072L83.4033 43.1172L71.6953 35.9844L43.9189 52.4229ZM99.4395 101.515L99.1875 101.658L50.2178 129.586L49.9697 129.727L49.7217 129.586L0.751953 101.658L0.5 101.515V28.7861L0.751953 28.6426L49.7217 0.716797L49.9697 0.576172L50.2178 0.716797L99.1875 28.6426L99.4395 28.7861V101.515Z" stroke="currentColor"/>\n</svg>',
  'arrow-right':
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M14.0575 4.74133L13.1737 5.6252L16.9236 9.37508H0.625V10.6251H16.9234L13.1737 14.3749L14.0575 15.2588L19.3163 10L14.0575 4.74133Z" fill="currentColor"/>\n</svg>',
};

export interface CarteCategorieProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  /**  — 2026-09-02 : le set 031 (2692:19667) ne dessine QUE `superpose` ; `empile` est conservé au contrat sur décision owner (d'autres pages l'utiliseront), sans correction de la source. L'axe VARIANT du set ne déclare donc qu'une valeur : écart de parité acquitté, pas une dérive. */
  style?: 'superpose' | 'empile';
  /** Affiche le filet décoratif du coin haut-droit. Le set 031 le DESSINE sur la carte mais les deux instances de la section le masquent (visible=false, surcharge d’instance brute, 2026-09-02) : la visibilité devient une option gouvernée que le parent passe, plutôt qu’un calque caché — §VIII. Le set n’expose aucune propriété BOOLEAN : liaison NONE, écart nommé, à corriger à la source. */
  afficherDecor?: boolean;
  /** Type de CTA gouverné de la carte empilée (Gate A, 2026-08-20). `lien` = ds.button Link à icônes pdf/download ; `bouton` = ds.button outlineNoir encadré à flèche. LIMITE NOMMÉE : le master CarteCategorie n'expose AUCUN axe VARIANT pour ce type (binding NONE, code-gouverné) — l'axe Figma est un nettoyage de source différé (autorat assumé au Gate A au-dessus d'une source incomplète). N'a d'effet que sur le style empilé. */
  ctaType?: 'lien' | 'bouton';
  /**  Défaut relevé sur le set 031 le 2026-09-02. */
  titre?: string;
  /** Corps de la carte. Type `text` (plat, non rich-text) DÉLIBÉRÉMENT : la section ds.categories-principales compose cette molécule via `repeat` sur une prop `arrayOf`, dont les champs sont plat par le schéma — un `texte` rich-text ne se transporterait pas par item. La plage forte « SupraMatic & ProMatic. » que porte ds.carte n'est donc pas reprise (limite de composition nommée, pas un choix esthétique). Défaut relevé sur le set 031 le 2026-09-02. */
  texte?: string;
  /** La ROUTE de l'image, jamais ses octets (gap A5, docs/FIGMA-CAPABILITY-MATRIX.md l.91 ; reprise verbatim de ds.carte.imageUrl). Défaut vide et il le reste ; le canevas dessine le lavis technique #D9D9D9, la photo maquette est hors contrat et préservée à la régénération par la passe de sauvetage. */
  imageUrl?: string;
  imageAlt?: string;
  /** Libellé du CTA du style empilé — contenu libre (Gate A : le texte du CTA n'est jamais l'option). Binding NONE (précédent ds.carte.ctaLabel : la propriété TEXT vit sur le Button imbriqué, pas au niveau du set). */
  ctaLabel?: string;
}

/** 2.2.0 (2026-09-05, vague 033) : la carte repond au geste. UN seul etat, `hover`, et il ne touche QUE le style superpose : un voile noir a 55 % se compose SOUS le degrade existant du voile (`contenuSuperpose`), qui n'est pas modifie. Le repos est donc inchange a l'octet sur les deux styles.

Deux faits mesures le 2026-09-05, avant d'ecrire.
(1) Le texte blanc de la carte n'a PAS de probleme de lisibilite au repos : 17,3:1 sur la description et 18,3:1 sur le titre, quand AAA commence a 7:1. Le survol est donc un signal d'INTERACTIVITE, jamais une correction de contraste — l'ecrire ici evite qu'une relecture future le justifie par l'accessibilite.
(2) Le degrade lui-meme ne peut pas varier par etat : `contenuSuperpose` est une part NON-racine, et le canal d'etats d'une part non-racine n'accepte que de la couleur (`PART_STATE_CHANNELS` : color, background-color, border-color). Accentuer les arrets du degrade au survol aurait demande d'elargir ce canal au `background-image` — modification d'emetteur touchant les 39 contrats, refusee par l'owner au profit du voile. LIMITE NOMMEE, pas un oubli.

Piqueray CarteCategorie, responsive. 2.0.0 (2026-09-02, vague 031) : le style superposé est ré-extrait du set 2692:19667 (page « 031 · Planches de validation »), qui remplace le master 2495:6770. Ce qui change : le voile occupe toute la carte au lieu du seul bas, son padding horizontal suit le token responsive spacing.card-categorie.pad-h (24 / 32), le titre monte le style responsive « Titre carte » (typography.h3.*, 20/25 SemiBold → 32/40 Medium) et la description « Description carte » (typography.card-desc.*, 16/24 → 18/27), le plan photo passe en absolu parce que la hauteur de la carte appartient à la section (quatre hauteurs par mode), et la largeur minimale dessinée 320 est mintée. Deux propriétés TEXT (Titre, Texte) ont été posées sur le set le 2026-09-02 : titre et texte sont de nouveau liés. Le style empilé est conservé tel quel (décision owner) bien que le set 031 ne le dessine plus.

Historique avant 2.0.0 :
Piqueray CarteCategorie. Extracted from the cleaned Figma COMPONENT_SET on DS · Molécules (2495:6770), reviewed at Gate A — not authored. One category card with a single Style axis: `superpose` (photo plane + gradient scrim + white overlaid title/text + arrow affordance, ds.hero pattern) and `empile` (stacked photo + title/text + a governed ds.button CTA). Shared semantics: titre, texte, image, CTA label. Image URLs stay consumer/campaign inputs (route A5), never capture defaults.

Gouvernance (Gate A, 2026-08-20): le TYPE de CTA de la carte empilée est une option gouvernée `ctaType` {lien, bouton} — `lien` = bouton Link « Contactez-nous » à icônes pdf/download (reprise de ds.carte), `bouton` = bouton encadré outlineNoir « Prendre rendez-vous » à flèche (usage Maintenance/Rdv). Le libellé reste du contenu libre (`ctaLabel`).

Limites nommées : (1) `ctaType` n'a PAS d'axe VARIANT sur le master (binding NONE, code-gouverné) — l'axe Figma est un nettoyage de source différé ; (2) le texte du style empilé perd la plage forte rich-text de ds.carte : la composition `repeat`+`arrayOf` de la section ne transporte que du texte plat (limite de composition, pas un choix esthétique) ; (3) le plan photo du style superposé est porté comme part d'anatomie absolue (A5, convention sav/devis), le master range ces pixels dans un paint IMAGE du root. Plan de document : la partie titre porte la balise h3 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau. */
export const CarteCategorie = forwardRef<HTMLDivElement, CarteCategorieProps>(
  function CarteCategorie(
    {
      style = 'superpose',
      ctaType = 'lien',
      afficherDecor = true,
      titre = 'Portes de garage',
      texte = 'Une porte de garage pour chaque goût et chaque style de maison.',
      imageUrl = '',
      imageAlt = '',
      ctaLabel = 'Contactez-nous',
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const classes = [styles.root, styles[`style-${style}`], styles[`ctaType-${ctaType}`], className]
      .filter(Boolean)
      .join(' ');
    return (
      <div ref={ref} className={classes} data-afficher-decor={afficherDecor || undefined} {...rest}>
        {style === 'superpose' ? (
          <img
            className={styles.photoSuperpose}
            src={String(imageUrl)}
            alt={String(imageAlt)}
          ></img>
        ) : null}
        {style === 'superpose' ? (
          <div className={styles.contenuSuperpose}>
            {afficherDecor ? (
              <span
                className={styles.decor}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS['carte-categorie-decor'] }}
              />
            ) : null}
            <div className={styles.inner}>
              <div className={styles.blocTexte}>
                <h3 className={styles.TitreSuperpose}>{titre}</h3>
                <span className={styles.TexteSuperpose}>{texte}</span>
              </div>
              <span
                className={styles.Fleche}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS['arrow-right'] }}
              />
            </div>
          </div>
        ) : null}
        {style === 'empile' ? (
          <img
            className={styles.categorieImage}
            src={String(imageUrl)}
            alt={String(imageAlt)}
          ></img>
        ) : null}
        {style === 'empile' ? (
          <div className={styles.texteEmpile}>
            <span className={styles.TitreCategorie}>{titre}</span>
            <span className={styles.TexteCategorie}>{texte}</span>
          </div>
        ) : null}
        {style === 'empile' ? (
          <div className={styles.Bouton}>
            {ctaType === 'lien' ? (
              <Button
                variant="link"
                iconLeft
                iconRight
                iconLeftGlyph="pdf"
                iconRightGlyph="download"
              >
                {ctaLabel}
              </Button>
            ) : null}
            {ctaType === 'bouton' ? (
              <Button variant="outlineNoir" iconRight iconRightGlyph="arrow-right">
                {ctaLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
