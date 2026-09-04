/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/google-reviews.contract.json (ds.google-reviews v3.1.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Notation } from '../Notation';
import { Button } from '../Button';
import { ReviewCard } from '../ReviewCard';
import styles from './GoogleReviews.module.css';

export interface GoogleReviewsProps extends HTMLAttributes<HTMLElement> {
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  accroche?: string;
  titre?: string;
  /** Libellé qualitatif du widget (« Excellent » mesuré sur l'aplat, T012) — texte de chrome du widget, pas un avis individuel, mais porté par propriété comme le reste du contenu réel. */
  qualificatif?: string;
  /** Note globale telle qu affichee par le widget — POINT decimal (4.8), pas une virgule : mesure directe sur l aplat (T040, corrige une transcription initiale fautive). */
  noteGlobale?: string;
  volume?: string;
  /** La collection de cartes — code-only par construction (figma.kind:'NONE' obligatoire pour un arrayOf, R8). React mappe le tableau vivant ; html/react-inline/canevas rendent le `sample` du repeat (générique, jamais le contenu réel — FR-010). Chaque avis porte son propre `lienAvis` : l'adresse de l'avis Google d'origine, ouverte par le bouton « Lire la suite » de sa carte. */
  avis?: Array<{
    auteur: string;
    initiale: string;
    date: string;
    texte: string;
    avatar: 'Initiale' | 'Photo';
    note: '1' | '2' | '3' | '4' | '5';
    photoUrl: string;
    photoAlt: string;
    lienAvis: string;
  }>;
  /** Nombre d'étoiles pleines du bloc résumé. Pilote la variante du composant gouverné ds.notation. Le composant ne connaît que des notes ENTIÈRES : une note affichée « 4.8 » se dessine avec cinq étoiles pleines, ce que fait la maquette. Réglable depuis le panneau Odoo, pas en édition directe (décision owner 2026-09-03). */
  note?: '1' | '2' | '3' | '4' | '5';
  /** Adresse du bouton « Voir tous les avis » — la fiche Google de l'établissement. Réglable depuis le panneau Odoo. Vide, le bouton ne navigue pas. */
  lienAvis?: string;
}

/** PROPOSED contract extracted from the design canvas (extract/figma dump v1) — API, anatomy, and token bindings inverted from the drawn structure. Semantics beyond the name/axis inference table, a11y, events, and slot accepts are not canvas-recoverable; review before adoption. Correction 2026-09-04 : les cinq entrées de `sample` omettaient trois clés du type de l'élément (avatar, note, lienAvis) — le typage de l'histoire générée refusait de compiler. Complétées avec la valeur dessinée : avatar Initiale, note 5, lien vide. Plan de document : la partie titre porte la balise h2 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau. */
export const GoogleReviews = forwardRef<HTMLElement, GoogleReviewsProps>(function GoogleReviews(
  {
    presentation = 'mobile',
    note = '5',
    accroche = 'Nos avis Google vérifiés',
    titre = 'Plus de 1500 portes installées par année et autant de clients satisfaits',
    qualificatif = 'Excellent',
    noteGlobale = '4.8',
    volume = '93 avis',
    lienAvis = '',
    avis,
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [
    styles.root,
    styles[`presentation-${presentation}`],
    styles[`note-${note}`],
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
      <div className={styles.avisGoogle}>
        <div className={styles.resume}>
          <div className={styles.infos}>
            <div className={styles.marque}>
              <div className={styles.logoGoogle}>
                <div className={styles.Vector}></div>
                <div className={styles.vector2}></div>
                <div className={styles.vector3}></div>
                <div className={styles.vector4}></div>
                <div className={styles.vector5}></div>
                <div className={styles.vector6}></div>
              </div>
            </div>
            <span className={styles.qualificatifTexte}>{qualificatif}</span>
            <div className={styles.notation}>
              <Notation note={note} />
              <span className={styles.noteGlobaleTexte}>{noteGlobale}</span>
            </div>
            <span className={styles.separateur}>|</span>
            <span className={styles.volume}>{volume}</span>
          </div>
          <Button variant="outlineNoir">Voir tous les avis</Button>
        </div>
        <div className={styles.groupeCartes}>
          {avis?.map((item, index) => (
            <ReviewCard
              key={index}
              verifie={false}
              auteur={item.auteur}
              initiale={item.initiale}
              date={item.date}
              texte={item.texte}
              avatar={item.avatar}
              note={item.note}
              photoUrl={item.photoUrl}
              photoAlt={item.photoAlt}
              lienAvis={item.lienAvis}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
