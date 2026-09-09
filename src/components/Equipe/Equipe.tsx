/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/equipe.contract.json (ds.equipe v2.1.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { MemberCard } from '../MemberCard';
import styles from './Equipe.module.css';

export interface EquipeProps extends HTMLAttributes<HTMLDivElement> {
  /** Ecran de presentation de la section. Extrait de la propriete VARIANT « Presentation » du set candidat 2777:30992 (releve du 2026-09-07). Il commande la gouttiere (24 · 48 · 56 · 89) et le nombre de colonnes de la grille (2 · 3 · 4 · 5 depuis 2.1.0). Cote Odoo la valeur n'est pas choisie par le redacteur : elle est fixee par la composition et traduite en requetes @media (voir la description du contrat). */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** La collection des membres. Chaque champ nomme une prop de ds.member-card 2.1.0 et lui est passe par nom. Les quatre champs photo portent des ROUTES, jamais des octets (trou A5, matrice ligne 91) : imageUrl et imageAlt pour le portrait de repos, imageSurvolUrl et imageSurvolAlt pour celui que le survol decouvre. Liaison Figma NONE, et c'est une limite de fidelite declaree : le canevas n'a aucun type de propriete « liste d'enregistrements » — il rend l'echantillon observe (repeat.sample), le code rend le tableau vif. */
  items?: Array<{
    nom: string;
    poste: string;
    imageUrl: string;
    imageAlt: string;
    imageSurvolUrl: string;
    imageSurvolAlt: string;
  }>;
}

/** Piqueray Equipe, version 2 (2026-09-07, passe 2 du portage « Equipe v2 » ; 2.1.0 le 2026-09-09 : colonnes Desktop 3→4 et Wide 4→5). Traduite du COMPONENT_SET candidat 2777:30992 (cle e5563df1e3d6a5e6d023174576ec6d16f54f997b), releve dump v1.8 du 2026-09-07 — relue et adoptee, pas ecrite. ATTENTION : deux sets portent le nom « Equipe » sur le fichier. Celui-ci est identifie par sa CLE, jamais par son nom ; le master v1 2115:3947 reste en place et n'est plus la source.

POURQUOI LA VERSION EST MAJEURE. Regle A3-9 du mode d'emploi (docs/16) : les ancres changent de set. C'est le SEUL motif de rupture — aucune prop ne disparait, aucune valeur d'enum ne se resserre, l'axe presentation et les quatre champs photo de items seraient chacun un mineur a eux seuls.

CE QUE LA VERSION 2 APPORTE, ET D'OU CHAQUE FAIT VIENT.
(1) L'AXE PRESENTATION, quatre valeurs (Mobile, Tablette, Desktop, Wide), lie a la propriete VARIANT « Presentation » du set. La version 1.2.0 n'avait aucun axe : elle servait une grille de 4 colonnes et une gouttiere nulle aux quatre ecrans.
(2) LA GOUTTIERE PAR ECRAN, dans le contrat et non dans la page : 24 · 48 · 56 · 89, portee en tokensByProp sur padding-inline. Les quatre valeurs sont LIEES au canevas (paddingLeft et paddingRight de chaque racine de variante montent space/24, space/48, space/56, space/89 au dump) — aucune n'est tapee a la main. C'est la regle de layout de page depuis la vague 031 : le conteneur #wrap ne porte plus que l'ecart vertical, la gouttiere vit dans chaque section.
(3) LE NOMBRE DE COLONNES PAR ECRAN — 2 · 3 · 4 · 5 depuis 2.1.0 (2 · 3 · 3 · 4 en 2.0.0) — porte par layoutByProp sur la part grid. C'est le fait central de cette section, et il est CARRY-BOTH : le schema le prevoit depuis la spec 023 (VariantLayoutSchema.columns, precedent exact ds.reassurances 2.1.1 dont la part items passe de 1 a 3 colonnes). Il n'a pas ete compte a l'oeil : il se DEDUIT du canevas, largeur de grille et largeur de carte a l'appui — (342-32)/2 = 155, (738-64)/3 = 224,67, (1088-96)/4 = 248, (1550-128)/5 = 284,40, soit exactement les quatre largeurs de carte relevees (les deux premieres au dump du 2026-09-07, les deux dernieres au canevas vif apres le geste du 2026-09-09 ; en 2.0.0 : (1088-64)/3 = 341,33 et (1550-96)/4 = 363,50). MINEUR : aucune prop ne bouge, seule une valeur de layout par mode change — precedent exact ds.reassurances 2.2.0 (bureau 3→4 colonnes, 2026-09-08).
(4) LES QUATRE CHAMPS PHOTO de items (imageUrl, imageAlt, imageSurvolUrl, imageSurvolAlt), qui nomment quatre props de ds.member-card 2.1.0 et traversent donc la collection par nom. Avant, items ne portait que nom et poste : la surface React rendait seize cartes SANS aucune photo, alors que la planche en montre seize. Le champ de survol est le canal ouvert par la passe 2 (ds.member-picture 1.4.0) : le plan du dessous n'avait aucune route et le survol effacait le visage.

CE QUI EST DELIBEREMENT ABSENT.
· LES LARGEURS DE RACINE dessinees (390 · 834 · 1200 · 1728) et LES HAUTEURS DE GRILLE dessinees (2086 · 1962 · 1404 · 1574,6 apres le 2026-09-09 ; 2652 et 1891 en Desktop/Wide avant) sont des TEMOINS, pas des jetons (regle A3-2). La racine porte layout.width fill avec 1728 pour largeur de reference ; une grille dont les cartes se replient n'a pas de hauteur fixe, et lui en donner une figerait la section a la longueur des textes du jour du releve.
· LE PLAFOND maxWidth 500 releve sur chaque instance de carte n'est pas porte : il ne mord jamais (la carte la plus large mesure 363,5) et une part instance ne porte de toute facon aucun literal.
· LES ECARTS DE GRILLE gardent les jetons size.equipe.gap-colonnes et size.equipe.gap-rangees de la version 1.2.0, et c'est un choix relu : ce sont EXACTEMENT les deux variables que le canevas lie sur gridColumnGap et gridRowGap (bound au dump). L'extraction avait minte imported.equipe.grid.gap a 32 faute de vocabulaire de contrat pour ces deux canaux ; space.32 vaut la meme chose mais ne porte pas le nom que le canevas lie, et l'axe « variables du canevas contre tokens » du differ compare precisement ces noms-la. Renomme, jamais minte.

FAIT CODE-ONLY, nomme ici et dans la description de la part grid. Aucun gabarit QWeb ne pose les classes de presentation sur le DOM Odoo : la projection Odoo traduit l'axe en requetes @media dans static/src/css/responsive/equipe.pqr.css, aux memes seuils que les jetons de rupture (768 · 992 · 1600). La regle y est RECOPIEE du contrat, valeur pour valeur, jamais inventee. Precedent exact : responsive/reassurances.pqr.css, vague 031. */
export const Equipe = forwardRef<HTMLDivElement, EquipeProps>(function Equipe(
  { presentation = 'mobile', items, className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`presentation-${presentation}`], className]
    .filter(Boolean)
    .join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <div className={styles.grid}>
        {items?.map((item, index) => (
          <MemberCard
            key={index}
            nom={item.nom}
            poste={item.poste}
            imageUrl={item.imageUrl}
            imageAlt={item.imageAlt}
            imageSurvolUrl={item.imageSurvolUrl}
            imageSurvolAlt={item.imageSurvolAlt}
          />
        ))}
      </div>
    </div>
  );
});
