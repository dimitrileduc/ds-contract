/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/reassurances.contract.json (ds.reassurances v2.2.1)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Carte } from '../Carte';
import { Button } from '../Button';
import styles from './Reassurances.module.css';

export interface ReassurancesProps extends HTMLAttributes<HTMLElement> {
  /** Présentation par écran, miroir de l'axe Presentation du set 031. Défaut = mobile, première variante du set et base mobile-first du CSS livré ; dans le CSS livré c'est la fenêtre qui choisit, par les jetons de rupture, jamais un consommateur. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /**  — 2026-09-02 : le set 031 ne dessine QUE la forme à cinq cartes avec un seul bouton ; le défaut passe donc de « 4Cartes » à « 5Cartes ». Les deux autres formes sont conservées en archive (décision owner, comme Empile de ds.carte-categorie), sans axe correspondant sur le canvas : écart de parité acquitté. */
  disposition?: '4Cartes' | 'quatrecartesdeuxcta' | '5Cartes';
  /** Sur-titre de la section. Le set 031 le dessine sur le nœud, sans propriété TEXT : liaison NONE, écart nommé. */
  accroche?: string;
  /** Titre de la section. Même remarque : dessiné sur le nœud, liaison NONE. */
  titre?: string;
  /** Les cartes de réassurance, fournies par le consommateur. imageUrl alimente ds.carte.imageUrl : le master pose une peinture IMAGE distincte par carte (imageRef ab6a82d4b83b657d48c90b5e253f82459fd505bf, 8d05df2058fe88fa4b14e4472c9746f03fd100a2, d00de3d48206b57be5125a2d01e8595d3eca56de, 7bd2daf5061e3af6ff4a671f8eca2be1bc10b6fb, relevées sur I2114:3614;2063:1607 … I2114:3617;2063:1607) et Figma n'expose aucune propriété de composant pour ces pixels. Le contrat porte donc la ROUTE, jamais les octets — même convention que ds.hero.backgroundUrl et ds.sav.imageUrl, et le sample laisse imageUrl vide parce qu'un imageRef Figma n'est pas une URL. */
  items?: Array<{ texte: string; titre: string; imageUrl: string }>;
}

/** 2.2.1 (2026-09-09) : correction de SOURCE, contrat inchange dans ses faits. Le « Contactez-nous » du set 031 etait un cadre dessine a la main (« BoutonCinqCartes », texte libre sans style, 18 en dur en Wide) sur les 4 variantes ; remplace par une vraie instance de ds.button (Outline noir, fleche), rendu identique a l'octet sur les 4 exports (28 instances suivent). La marge interieure est celle du style (32) partout : le fait code-only « marge 24 sous 992 » disparait ; reste « pleine largeur sous 992, ajuste au contenu au-dessus ». CSS Odoo par ecran allege d'autant.

2.2.0 (2026-09-08, demande owner) : la grille du BUREAU passe de 3 a 4 colonnes — et d'elle seule ; Mobile, Tablette et Wide sont inchanges, verifie sur le canevas apres le geste. Le declencheur n'est pas esthetique mais arithmetique : sur les six pages qui portent le bloc, QUATRE en rendent quatre cartes (a-propos, portes-entree, portes-industrielles, portes-residentielles) et deux en rendent cinq (home, portes-de-garage). En 3 colonnes, les quatre premieres affichaient donc 3 + 1, une orpheline sur la majorite des pages. En 4 colonnes elles tiennent sur une rangee pleine ; les deux pages a cinq cartes passent de 3 + 2 a 4 + 1, arbitrage owner assume (« si 5 cartes ca reste 4 colonnes, sinon ca rend trop gros »).

LIMITE MESUREE, pas supposee : a 1200 px la carte tombe a 248 et deux libelles passent a deux lignes (« Conseil personnalise », « Service apres-vente »), ce qui porte la carte de 531 a 588 px. A 1440 px la carte fait 308 et les titres tiennent sur une ligne. Aucun debordement a aucune des deux largeurs.

2.1.1 (2026-09-07) : en WIDE, la rangee de cartes cesse d'etre une grille a nombre de colonnes FIXE pour devenir une simple ligne. Le defaut : `columns: 5` etait calcule pour le cas a cinq cartes, donc quatre cartes laissaient une piste vide et le bloc ne remplissait plus la largeur. Le nombre de cartes est du CONTENU — la collection `items`, clonee par item au montage, sans plafond — jamais une variante, et aucun composant du systeme ne compte ses items par un axe. Une ligne resout le probleme SANS rien declarer de neuf : les cartes portent deja `width: 100 %`, donc leur base de flex est egale, donc le retrait se fait au prorata et les colonnes sortent EXACTEMENT egales — 284,4 a cinq cartes, 363,5 a quatre, mesure dans le navigateur le 2026-09-07, au dixieme, identique a ce que rendait la grille. CARRY-BOTH, et c'est ce qui rend ce choix meilleur qu'une regle ecrite a la main : Figma exprime la meme chose nativement avec un auto-layout horizontal dont les enfants sont en Fill, et repartit lui aussi a parts egales. Le canevas reflue donc comme le site quand une carte de moins est posee. PORTEE : le WIDE seulement, decision owner du 2026-09-07. Le Desktop garde sa grille de TROIS colonnes en toutes circonstances — quatre cartes s'y rangent en 3 + 1, exactement comme avant. Mobile et Tablette sont en colonne, inchanges.

Piqueray section « Réassurances », responsive. 2.0.0 (2026-09-02, vague 031) : ré-extraite du set 2700:26297 (page « 031 · Planches de validation »), quatre variantes sur l'axe Presentation. La collection change de mécanique par écran — une carte par ligne sous le seuil bureau, puis une grille de 3 colonnes en Desktop et de 5 en Wide — et les marges suivent 24 / 48 / 56 / 89. Le défaut de `disposition` passe à « 5Cartes », la seule forme que le set dessine ; les deux autres restent en archive. Les vingt cartes de la source étaient des cadres libres : elles ont été remplacées par des instances du composant le 2026-09-02, à zéro pixel de différence sur les quatre vues.

L'en-tête cesse d'être une instance de ds.section-header : le set 031 le dessine à plat, il est donc modélisé dans la section (sur-titre sur typography.overline.*, titre sur le style responsive H2), ce qui lui rend ses tailles par écran — l'ancienne composition figeait le titre à 40 px sur les quatre écrans.

Historique avant 2.0.0 :
Piqueray Reassurances. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. v1.3.0 porte les variantes en grille native : 4 colonnes pour « 4 cartes » et « QuatreCartesDeuxCta », 5 pour « 5 cartes » ; les cartes remplissent leur piste. Les 285px observés à 1550px de conteneur étaient une mesure dérivée, jamais une règle de dimension. Le champ items.imageUrl est ajouté pour que les photos des cartes aient une ROUTE de projection (D10 : l'URL n'est jamais un défaut du contrat, elle entre par le consommateur). Plan de document : la partie titre porte la balise h2 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau. */
export const Reassurances = forwardRef<HTMLElement, ReassurancesProps>(function Reassurances(
  {
    presentation = 'mobile',
    disposition = '5Cartes',
    accroche = 'Plus de 50 ans d’expérience',
    titre = 'Pourquoi choisir nos portes de garage industrielles ?',
    items,
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [
    styles.root,
    styles[`presentation-${presentation}`],
    styles[`disposition-${disposition}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <section ref={ref} className={classes} {...rest}>
      <div className={styles.SectionHeader}>
        <span className={styles.Accroche}>{accroche}</span>
        <h2 className={styles.Titre}>{titre}</h2>
      </div>
      <div className={styles.items}>
        {items?.map((item, index) => (
          <Carte
            key={index}
            disposition="reassurance"
            alignement="centre"
            texte={[{ text: item.texte }]}
            titre={item.titre}
            imageUrl={item.imageUrl}
          />
        ))}
      </div>
      {disposition === '5Cartes' ? (
        <Button variant="outlineNoir" iconRight iconRightGlyph="arrow-right">
          Contactez-nous
        </Button>
      ) : null}
      {disposition === 'quatrecartesdeuxcta' ? (
        <div className={styles.Boutons}>
          {disposition === 'quatrecartesdeuxcta' ? (
            <Button
              variant="outlineNoir"
              iconLeft
              iconLeftGlyph="pdf"
              iconRight
              iconRightGlyph="download"
            >
              Motifs disponibles
            </Button>
          ) : null}
          {disposition === 'quatrecartesdeuxcta' ? (
            <Button variant="outlineNoir" iconRight iconRightGlyph="arrow-right">
              Contactez-nous
            </Button>
          ) : null}
        </div>
      ) : null}
      {disposition === '4Cartes' ? (
        <Button variant="outlineNoir" iconRight iconRightGlyph="arrow-right">
          Contactez-nous
        </Button>
      ) : null}
    </section>
  );
});
