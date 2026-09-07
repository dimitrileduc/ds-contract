/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carte-categorie.contract.json (ds.carte-categorie v3.0.1)
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
  /** Forme de la carte. 2026-09-07 : le set v2 (2692:19667) dessine de nouveau LES DEUX valeurs — la variante `Style=Empile, State=Default` (2772:24834) y a été rangée ce jour-là. L'écart de parité acquitté le 2026-09-02 (« l'axe VARIANT ne déclare qu'une valeur ») est donc résorbé à la source. Le set croise `Style` avec `State = Default | Survol` ; il n'y a PAS de variante `Empile/Survol` : le lien porte l'interaction sur la forme empilée, matrice volontairement incomplète, décision owner du 2026-09-07. */
  style?: 'superpose' | 'empile';
  /** Affiche le filet décoratif du coin haut-droit. Le set 031 le DESSINE sur la carte mais les deux instances de la section le masquent (visible=false, surcharge d’instance brute, 2026-09-02) : la visibilité devient une option gouvernée que le parent passe, plutôt qu’un calque caché — §VIII. Le set n’expose aucune propriété BOOLEAN : liaison NONE, écart nommé, à corriger à la source. */
  afficherDecor?: boolean;
  /** Type de CTA gouverné de la carte empilée (Gate A, 2026-08-20). `lien` = ds.button Link à UNE SEULE flèche droite ; `bouton` = ds.button outlineNoir encadré à flèche. 2026-09-07 : le `lien` portait jusqu'ici deux icônes, `pdf` à gauche et `download` à droite — un défaut de source de la v1 (nœuds 230:585 et 230:599), sans rapport avec un lien « Contactez-nous », corrigé sur la variante v2. LIMITE NOMMÉE : le master CarteCategorie n'expose AUCUN axe VARIANT pour ce type (binding NONE, code-gouverné) — l'axe Figma est un nettoyage de source différé (autorat assumé au Gate A au-dessus d'une source incomplète). N'a d'effet que sur le style empilé. */
  ctaType?: 'lien' | 'bouton';
  /**  Défaut relevé sur le set 031 le 2026-09-02. */
  titre?: string;
  /** Corps de la carte. Type `rich-text` depuis la 3.0.0 (2026-09-07) — RUPTURE MAJEURE. La 2.2.0 disait ce type impossible : « les champs d'un arrayOf sont plats par le schéma, un texte rich-text ne se transporterait pas par item ». C'était FAUX et vérifié dans le référé : emit-react accepte un champ `arrayOf` de type `text` contre une prop enfant `text` OU `rich-text` (la composition `repeat` de ds.categories-principales continue donc de fonctionner sans y toucher). La raison du passage est la règle owner du 2026-09-02 : un texte avec du gras est riche. Les usages réels de la page « Portes de garage résidentielles » portent une première phrase en gras (« La référence confort. », « Le classique intemporel. ») ; sans ce type le gras est déplié à l'enregistrement Odoo. La marque `strong` est gouvernée par le jeton font.weight.bold (700), la graisse Bold relevée sur les plages fortes de ds.carte. Défaut relevé sur le set 031 le 2026-09-02, porté ici en un segment unique (le défaut du set n'a pas de plage forte). */
  texte?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** La ROUTE de l'image, jamais ses octets (gap A5, docs/FIGMA-CAPABILITY-MATRIX.md l.91 ; reprise verbatim de ds.carte.imageUrl). Défaut vide et il le reste ; le canevas dessine le lavis technique #D9D9D9, la photo maquette est hors contrat et préservée à la régénération par la passe de sauvetage. */
  imageUrl?: string;
  imageAlt?: string;
  /** Libellé du CTA du style empilé — contenu libre (Gate A : le texte du CTA n'est jamais l'option). Binding NONE (précédent ds.carte.ctaLabel : la propriété TEXT vit sur le Button imbriqué, pas au niveau du set). */
  ctaLabel?: string;
}

/** 3.0.1 (2026-09-07, vague 033 — le SURVOL du style EMPILE, et ce que le contrat ne peut pas en dire) : PATCH de DESCRIPTION SEULE, aucune modification fonctionnelle. Sur le canevas, la variante `Style=Empile, State=Hover` (2773:26562, set 2692:19667) dessine QUATRE faits au survol de la carte ENTIERE (la carte est la cible du survol et du clic, comme le style superpose depuis la vague 033) : (a) la photo zoome de 10 pour cent, recadree au centre, sans que la carte bouge d'un pixel — le zoom est clippe ; (b) la fleche du CTA glisse de 4 px vers la droite (sur le canevas l'ecart du bouton passe de 10 a 14) ; (c) le libelle du CTA passe au noir pur et se souligne ; (d) le libelle passe en SemiBold. Les faits (c) et (d) appartiennent a `ds.button` 2.4.0, style link, etat hover : ils sont portes par SES propres jetons (couleur d'etat, decoration d'etat, graisse d'etat) et le contrat de la carte n'a rien a en dire.
LIMITES NOMMEES, et elles sont TROIS — verifiees par lecture du schema et du referee, pas supposees :
(1) le ZOOM de la photo demanderait `transform: scale(...)` sur `categorieImage`, une part NON-racine. Le canal d'etats d'une part non-racine n'accepte que de la couleur (emit-react PART_STATE_CHANNELS : color, background-color, border-color), et le canal `declaredStates` — le seul autre canal par etat d'une part — est borne au registre DECLARED_CHANNELS, qui ne declare NI `transform` NI aucun canal de zoom. `transform` n'existe dans le schema que dans STYLES_WHEN_ALLOWED, c'est-a-dire conditionne a une PROP, jamais a un etat. Le zoom est donc un FAIT CODE-ONLY.
(2) le GLISSEMENT de la fleche est un changement d'ECART (gap 10 vers 14) sur l'instance `ds.button`. Une part `component` ne porte NI etats NI faits declares (le referee refuse par nom : « component instance — declared facts cannot restyle it »), et `gap` n'est de toute facon pas un canal d'etat. FAIT CODE-ONLY.
(3) le REPORT des canaux du bouton : au survol de la CARTE, le pointeur n'est pas sur le bouton, donc la regle d'etat generee du bouton ne s'applique pas. Aucun canal du schema ne dit « quand mon ancetre est survole, applique l'etat hover de mon instance enfant ». FAIT CODE-ONLY, re-porte dans la projection Odoo par les VARIABLES DE JETON du bouton (jamais par une valeur litterale), precedent exact : la regle (6) de la zone ODOO-023-FOOTER-BRIDGE, vague 032.
Ces trois faits vivent donc dans `responsive/carte-categorie.pqr.css` (zone ODOO-033-CARTE-EMPILE-SURVOL), avec le cadre qui clippe le zoom, la transition de 250 ms, la clause `prefers-reduced-motion` et l'anneau de focus clavier de la carte devenue cible. Nommes ici plutot que contournes en silence. La projection Odoo fait aussi de la racine de la carte empilee une ANCRE et rend son CTA NON INTERACTIF (un lien dans un lien est du HTML invalide et un doublon de cible) : le lien est une ADAPTATION D'HOTE, `<a href>` est HOST-ONLY a la matrice de capacite, aucun contrat n'en porte la notion — `ds.button` reste un `<button>` cote React, comme depuis le 2026-08-18.

3.0.0 (2026-09-07, vague 031 — le style EMPILE passe en v2) : la variante `Style=Empile, State=Default` (2772:24834) a ete rangee dans le set v2 CarteCategorie 2692:19667 le 2026-09-07, les ancres ne bougent donc PAS (meme set, meme cle). Ce que la v2 change sur le style empile, et RIEN sur le style superpose :
(1) le titre et la description montent les ROLES du DS au lieu de jetons figes de la taille de 1728 — `typography.h3.*` (20/25 SemiBold en Mobile, 24/30 Medium en Tablette et Desktop, 32/40 Medium en Wide) et `typography.card-desc.*` (16/24 en Mobile, 18/27 au-dessus). Avant, la carte empilee rendait 32/40 et 18/27 a TOUS les ecrans : la carte de 342 de large en mobile portait un titre de 32. Decision owner « option A » du 2026-09-07 ; a 1728 le rendu est identique a l'octet a celui d'avant.
(2) le lien « Contactez-nous » retrouve UNE SEULE FLECHE A DROITE. Les deux icones `Pdf` (gauche) et `Download` (droite) de la v1 etaient un defaut de source releve a l'etape 0 (noeuds 230:585 et 230:599, sans aucun rapport avec un lien de contact) : elles disparaissent.
(3) la prop `texte` passe de `text` a `rich-text` avec `content.marks.strong` — c'est la RUPTURE MAJEURE. Les usages reels de la page « Portes de garage residentielles » portent une premiere phrase en gras (« La reference confort. S'ouvre a la verticale… ») et la regle owner du 2026-09-02 dit qu'un texte avec du gras est riche. Sans ce passage le gras est perdu a la projection Odoo. Consequence FORCEE par le referee (emit-react, « rich-text part must declare content.marks.strong ») : la part `TexteSuperpose` du style superpose recoit elle aussi la marque — c'est la SEULE modification que le style superpose subit, et elle n'ajoute qu'une regle de graisse pour d'eventuelles plages fortes : sans plage forte le rendu est inchange.
Pas d'axe de survol sur l'empile (decision owner) : le lien porte l'interaction, et une variante Survol identique au Defaut serait refusee par la porte refuse-hollow-state-previews. Le nombre de colonnes appartient a la section, jamais a la carte.
LIMITE NOMMEE, code-only : le rapport 16/9 de la RACINE ne peut pas etre conditionne par le style. VariantLayoutSchema (le canal `layoutByProp`) ne declare pas `aspectRatio`, et ni LITERAL_CHANNELS ni DECLARED_CHANNELS ne portent le rapport — le seul canal est `layout.aspectRatio`, qui est inconditionnel. La carte empilee a une hauteur AU CONTENU (375 · 582 · 482 · 595 aux quatre temoins), le rapport de la racine est donc neutralise dans la projection Odoo (responsive/carte-categorie.pqr.css) et le fait est nomme ici plutot que contourne en silence.

2.2.0 (2026-09-05, vague 033) : la carte repond au geste. UN seul etat, `hover`, et il ne touche QUE le style superpose : un voile noir a 55 % se compose SOUS le degrade existant du voile (`contenuSuperpose`), qui n'est pas modifie. Le repos est donc inchange a l'octet sur les deux styles.

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
      imageUrl = '',
      imageAlt = '',
      ctaLabel = 'Contactez-nous',
      texte = [{ text: 'Une porte de garage pour chaque goût et chaque style de maison.' }],
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
                <span className={styles.TexteSuperpose}>
                  {texte.map((segment, index) => {
                    const inner = segment.underline ? <u>{segment.text}</u> : segment.text;
                    return segment.strong ? (
                      <strong key={index}>{inner}</strong>
                    ) : (
                      <span key={index}>{inner}</span>
                    );
                  })}
                </span>
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
          </div>
        ) : null}
        {style === 'empile' ? (
          <div className={styles.Bouton}>
            {ctaType === 'lien' ? (
              <Button variant="link" iconRight iconRightGlyph="arrow-right">
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
