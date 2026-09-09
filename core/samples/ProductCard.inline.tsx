/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/product-card.contract.json (ds.product-card v4.1.0)
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

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start",
    "borderStyle": "solid",
    "fontFamily": "Montserrat, sans-serif",
    "gap": "12px",
    "width": "220px",
    "minWidth": "220px",
    "backgroundColor": "#FFFFFF",
    "borderColor": "#F4F6FA",
    "borderWidth": "1px",
    "borderRadius": "4px",
    "paddingTop": "12px",
    "paddingRight": "12px",
    "paddingBottom": "12px",
    "paddingLeft": "12px",
    "textRendering": "geometricprecision"
  },
  "Tuile": {
    "display": "flex",
    "flexDirection": "column",
    "width": "100%",
    "minWidth": 0,
    "overflow": "hidden",
    "backgroundColor": "#F4F6FA",
    "borderRadius": "4px",
    "paddingTop": "16px",
    "paddingRight": "16px",
    "paddingBottom": "16px",
    "paddingLeft": "16px",
    "aspectRatio": "1"
  },
  "Image": {
    "display": "flex",
    "flex": "1 1 auto",
    "minWidth": 0,
    "width": "100%",
    "objectFit": "contain",
    "mixBlendMode": "multiply"
  },
  "Texte": {
    "display": "flex",
    "flexDirection": "column",
    "width": "100%",
    "minWidth": 0,
    "gap": "4px"
  },
  "Titre": {
    "color": "#26282C",
    "fontSize": "16px",
    "fontWeight": 600,
    "fontFamily": "Montserrat, sans-serif",
    "lineHeight": "20px",
    "textAlign": "left",
    "alignSelf": "stretch",
    "whiteSpace": "nowrap",
    "overflowX": "hidden",
    "overflowY": "hidden",
    "textOverflow": "ellipsis"
  },
  "Prix": {
    "color": "#143A84",
    "fontSize": "16px",
    "fontWeight": 600,
    "fontFamily": "Montserrat, sans-serif",
    "lineHeight": "20px",
    "textAlign": "left",
    "alignSelf": "stretch"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {};

export interface ProductCardProps extends HTMLAttributes<HTMLDivElement> {
  titre?: string;
  prix?: string;
  /** Code-supplied product-image URL. Figma exposes the visible value as an IMAGE fill through an instance override, not as a component property; the empty runtime default is intentional and comparison assets are injected only by the campaign. */
  imageUrl?: string;
  /** Code-supplied text alternative paired with imageUrl. Figma has no corresponding component property, so the empty runtime default is intentional. */
  imageAlt?: string;
}

/** 4.0.0 (2026-09-08, refonte carte produit — option choisie par l'owner sur la planche 031 · 23, DESSINEE DANS FIGMA AVANT d'etre contractee, §VIII). La carte cesse d'etre une photo carree de 240 flottant au milieu d'une boite de 364 sans fond, sans filet, sans rayon et sans marge : elle devient une vraie carte — fond blanc, filet cheveu, rayon 8, 12 px de marge interieure, texte aligne a gauche — et elle RETRECIT (220 · 240 · 264 · 288 au lieu de 260 · 322 · 326 · 363).

MAJEUR et non mineur : deux parts neuves s'interposent, `Tuile` autour de la photo et `Texte` autour du titre et du prix. Les proprietes ne bougent pas, mais les parts sont ADRESSABLES cote Odoo (`data-pqr-part`), donc l'imbrication casse l'adressage — c'est un retrait de vocabulaire au sens du semver du depot.

LE FAIT QUI PILOTE LE DESSIN, mesure et non suppose : ces produits sont en plastique blanc et gris pale, photographies sur fond blanc opaque. Sur une carte blanche ils se dissolvent — le bouton poussoir FIT2 etait invisible. La tuile teintee (`color.bleu-clair`) leur donne un sol. Mais les photos n'ont AUCUNE transparence : posees telles quelles sur la tuile elles y dessinent un carre blanc et annulent la teinte. D'ou `mix-blend-mode: multiply` sur la photo, canal declare leve pour l'occasion (registre DECLARED_CHANNELS, verdict 'annotate'). C'est un CONTOURNEMENT nomme : le vrai correctif est de detourer les huit photos une bonne fois. Et parce que le verdict est 'annotate', regenerer le master depuis le contrat perd le fondu — sur le canevas il vit sur la PEINTURE (`paint.blendMode`), que l'emetteur ne pose pas.

Le geste sur la source : 71 instances comptees avant et apres, AUCUNE photo perdue. La photo n'a pas ete recreee mais DEMENAGEE dans la tuile — c'est la difference avec le `remove()` + recreation qui avait detruit les surcharges d'instance en 017. La proportion carree de la tuile est posee par `lockAspectRatio()` : le setter `targetAspectRatio` est refuse par cette version de l'API, et un redimensionnement par instance ne se propage pas aux instances imbriquees (52 tuiles restaient rectangulaires), alors que le verrou, lui, traverse.

3.1.0 (2026-09-05, vague 033) : elevation au survol, ombre portee par la RACINE — donc la boite entiere, photo + titre + prix — et non la photo seule. Valeur revue le 2026-09-08 : deux couches sur un noir bleute au lieu d'une couche de noir pur a 12 %.

La LARGEUR par ecran est portee par le jeton `spacing.product-card.width` sur la racine de CETTE molecule, jamais sur la part instance de la section : un jeton pose sur une part `component` est silencieusement ignore par les emetteurs (verifie le 2026-09-04, zero regle generee). Patron d'art anterieur ds.avatar-group. `min-width` repete `width` : la carte est dans une piste flex et le retrecissement par defaut la ferait passer sous la largeur dessinee — le carrousel exige qu'elle garde sa taille et que la piste deborde. Le titre reste tronque sur une ligne (maxLines 1 / ENDING au canevas), desormais aligne a gauche : la troncature paraît voulue au lieu d'accidentelle.

Le filet du REPOS est `color.bleu-clair`, le meme que celui de la carte d'avis — assez pour poser la boite, trop leger pour la cerner (demande owner du 2026-09-08 : « si pas hover faudrait la bordure plus legere »). Il passe a `color.gris-clair` au survol : la carte se raffermit en meme temps qu'elle s'eleve, et la transition d'etat porte sur deux canaux plutot qu'un.

VERSION 4.1.0 (2026-09-09, vague « arrondis ») — les deux rayons (racine de la carte, tuile image) passent de radius.8 à radius.4 : un seul rayon dans tout le DS. Canevas : le 8 brut du master (non lié) a été lié à radius/4. Posé sur le canevas AVANT le contrat (§VIII), planches 031 · 26 et 031 · 27 validées puis supprimées, versions nommées avant/après. Ajout purement additif : MINEUR. */
export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(function ProductCard(
  { titre = 'Télécommande Hörmann HSE4-868BS', prix = '74,99€', imageUrl = '', imageAlt = '', style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...style }}  {...rest}>
      <div style={{ ...S.Tuile }}>
<img style={{ ...S.Image }} src={String(imageUrl)} alt={String(imageAlt)}>

</img>
</div>
<div style={{ ...S.Texte }}>
<span style={{ ...S.Titre }}>{titre}</span>
<span style={{ ...S.Prix }}>{prix}</span>
</div>
    </div>
  );
});
