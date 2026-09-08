/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/member-card.contract.json (ds.member-card v2.1.1)
 * Emitted by core/emit-react-inline.ts — the zero-infrastructure output:
 * every token reference was RESOLVED to its literal value from the design
 * tokens at emit time. Resolution mode: light (brand: default). To retheme,
 * re-emit against different tokens — do not edit literals by hand.
 * Fidelity: :hover/:focus-visible state tokens are not expressible as inline
 * styles and are omitted; ROOT disabled-state tokens apply via the disabled
 * prop; PART-level state overrides (Part.states, v13) are omitted — the same
 * declared limit as the hover states (state-selected descendant styling).
 */
import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import { MemberPicture } from './MemberPicture';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "gap": "16px"
  },
  "text": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "center",
    "width": "100%",
    "minWidth": 0,
    "gap": "8px"
  },
  "Nom": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontSize": "20px",
    "fontWeight": 400,
    "lineHeight": "25px",
    "textAlign": "center"
  },
  "Poste": {
    "width": "100%",
    "minWidth": 0,
    "color": "#F98A0B",
    "fontSize": "14px",
    "fontWeight": 600,
    "lineHeight": "20px",
    "textAlign": "center"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface MemberCardProps extends HTMLAttributes<HTMLDivElement> {
  /** État visuel de la carte : repos ou survol. Extrait de la propriété VARIANT « Etat » du set candidat 2777:31008 (2026-09-07). La valeur est threadée telle quelle à l'instance ds.member-picture composée : au survol, le plan normal passe en opacité 0 et laisse voir le plan funIa. Le DÉCLENCHEUR du survol est code-only (le pointeur est sur la carte, pas sur la photo) — voir la description du contrat. */
  etat?: 'defaut' | 'survol';
  nom?: string;
  poste?: string;
  /** La ROUTE du portrait, jamais ses octets. Figma n'expose aucune propriete de composant pour ces pixels (trou A5, matrice ligne 91) : le contrat porte la route, la photo arrive a l'execution. Defaut vide, et il le reste. Ce contrat n'a pas de part `img` a lui — son plan photo vient de l'instance ds.member-picture qu'il compose — mais il porte bien sa propre prop d'URL, et elle obeit a la meme convention. */
  imageUrl?: string;
  imageAlt?: string;
  /** La ROUTE du portrait de SURVOL, jamais ses octets — meme convention que imageUrl, meme trou A5. Elle est threadee a la prop srcSurvol de l'instance ds.member-picture composee, qui la pose sur son plan funIa. Ouverte en 2.1.0 : avant, ce plan etait rendu sans src et le survol montrait le lavis technique a la place d'un second visage. Defaut vide. */
  imageSurvolUrl?: string;
  /** Alternative textuelle du portrait de survol, threadee a altSurvol de l'instance ds.member-picture. Vide par defaut. */
  imageSurvolAlt?: string;
}

/** Piqueray MemberCard, version 2 (2026-09-07, passe 1 du portage « Équipe v2 »). Extraite du COMPONENT_SET candidat 2777:31008 (clé 758a8b0182f344cbb005b184713fb2dc0785b728), relevé dump v1.8 du 2026-09-07 — relue et adoptée, pas écrite.

CE QUI CHANGE PAR RAPPORT À 1.4.0, ET POURQUOI LA VERSION EST MAJEURE.
(1) ANCRES : la source n'est plus le COMPONENT 2074:2072 du set 0b23b8d87dfa08866cc767b34c18fedddf39a4d8, mais un COMPONENT_SET neuf, de clé neuve. La règle A3-9 du mode d'emploi (docs/16) rend le bump MAJEUR dès que les ancres changent de set : c'est le seul motif de rupture, aucune prop ne disparaît et aucune valeur d'enum ne se resserre.
(2) AXE D'ÉTAT : le set porte désormais un axe VARIANT « Etat » à deux valeurs (Defaut, Survol). La prop `etat` est ajoutée et THREADÉE jusqu'à l'instance ds.member-picture, qui possédait déjà le même axe depuis 1.3.0 mais recevait la valeur figée defaut. Le survol de la carte fait donc apparaître le plan funIa sous le plan normal, exactement comme la variante Survol du canevas l'épingle.
(3) TYPOGRAPHIE RESPONSIVE : le nom et le poste montent les RÔLES du design system au lieu des valeurs figées de l'écran 1728. Avant, le nom rendait 32/40 et le poste 16/20 sur les QUATRE écrans — une carte de 342 de large en mobile portait un nom de 32. Deux styles de texte dédiés (« Nom membre », « Poste membre »), liés à des variables existantes, ont été créés sur le canevas le 2026-09-07 (décision owner sur planche comparative, aucune variable créée). Le nom prend le rôle h3 : 20/25 en Mobile, 24/30 en Tablette et Desktop, 32/40 en Wide. Le poste prend le rôle overline : 14/20 en Mobile et Tablette, 16/20 en Desktop, 20/25 en Wide.
(4) LARGEUR REMPLIE : le cadre `text` et ses deux textes passent en largeur REMPLIE (fillWidth au dump). Ils se replient donc quand la carte rétrécit, au lieu de pousser la boîte. Une surcharge « min-width: 200 » a été retirée de 64 instances côté canevas le 2026-09-07.

DEUX DÉVIATIONS NOMMÉES SUR LA GRAISSE, et ce sont les seules.
· Le rôle h3 fait VARIER sa graisse (SemiBold en Mobile, Medium au-dessus) ; le nom est dessiné Montserrat Regular sur les deux variantes du set. La part porte donc la graisse font.weight.regular, FIXE, et non le canal de graisse du rôle. Écart assumé : la taille et l'interligne suivent le rôle, la graisse ne le suit pas.
· Le rôle overline fait VARIER sa graisse (Regular en Mobile et Tablette, Medium au-dessus) ; le poste est dessiné Montserrat SemiBold sur les deux variantes. La part porte donc font.weight.semibold, FIXE. Même écart, même raison.

FAIT CODE-ONLY, nommé ici et dans la description de la part MemberPicture. Sur une page, le pointeur de la personne qui visite est sur la CARTE, jamais sur la photo : rien dans le schéma ne dit « quand mon ancêtre est survolé, applique telle valeur de prop à mon instance enfant ». Le déclencheur du survol vit donc dans la projection Odoo (zone ODOO-EQUIPE-V2-MEMBER-SURVOL de responsive/member-card.pqr.css), qui re-pose sous le survol de la carte le canal d'opacité que la variante Survol du contrat décrit déjà. Précédent exact : la règle (6) de la zone ODOO-023-FOOTER-BRIDGE, vague 032.

POURQUOI UN AXE DE PROP ET NON LE CANAL `states`, vérifié en lisant le schéma et le référé plutôt que supposé. Les trois molécules voisines qui portent un état (ds.product-card, ds.review-card, ds.carte-categorie) déclarent states hover parce que leur survol est une ombre ou une couleur. Ici le survol est un changement d'OPACITÉ, et il porte sur une part non-racine d'un composant IMBRIQUÉ. Deux refus, chacun par nom : le canal d'états d'une part non-racine n'accepte que color, background-color et border-color (emit-react PART_STATE_CHANNELS), et une part `component` ne porte de toute façon ni états ni faits déclarés. L'axe VARIANT du canevas est donc la seule traduction fidèle — et c'est aussi celle qui rend les deux états visibles sur les deux surfaces.

Les surcharges IMAGE du portrait restent des données photo explicites, code-only, propagées à la ds.member-picture composée sans aplatir son anatomie d'image.

VERSION 2.1.0 (2026-09-07, passe 2) — LA PHOTO DE SURVOL A ENFIN UNE ROUTE. Ajout MINEUR et purement additif de deux props, imageSurvolUrl et imageSurvolAlt, threadees telles quelles vers srcSurvol et altSurvol de l'instance ds.member-picture (1.4.0). Motif, releve et non suppose : le master empile DEUX photos, mais le plan du dessous n'avait aucun canal — le gabarit Odoo le rendait sans src, et le survol effacait le visage au lieu d'en decouvrir un second (trou nomme par la passe 1, journal specs/tiny/equipe-v2/member-card.md section 7 point 3). Rien d'autre ne change : ni anatomie, ni jetons, ni typographie, ni ancres. */
export const MemberCard = forwardRef<HTMLDivElement, MemberCardProps>(function MemberCard(
  { etat = 'defaut', nom = 'Cécilia Piqueray', poste = 'Gérante', imageUrl = '', imageAlt = '', imageSurvolUrl = '', imageSurvolAlt = '', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <MemberPicture etat={etat} taille="member-card" src={imageUrl} alt={imageAlt} srcSurvol={imageSurvolUrl} altSurvol={imageSurvolAlt} />
<div style={{ ...S.text }}>
<span style={{ ...S.Nom }}>{nom}</span>
<span style={{ ...S.Poste }}>{poste}</span>
</div>
    </div>
  );
});
