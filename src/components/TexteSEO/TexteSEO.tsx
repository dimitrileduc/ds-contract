/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/texte-seo.contract.json (ds.texte-seo v3.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { AccordionRow } from '../AccordionRow';
import styles from './TexteSEO.module.css';

export interface TexteSEOProps extends HTMLAttributes<HTMLDivElement> {
  /** Texte SEO-owned rich title. The prior compact SectionHeader variant is replaced by direct 24/30 anatomy. */
  titre?: Array<{ text: string; strong?: boolean }>;
  /** Les lignes d'accordéon. `etat` est observé par entrée sur le master Figma (la 2e ligne est ouverte, les deux autres fermées) : le renseigner rend chaque ligne CONTRÔLÉE côté React — la géométrie est fidèle, mais une ligne ne se replie plus d'elle-même tant que le consommateur ne possède pas l'état (le canal `repeat` ne porte pas d'événement par entrée). Limite nommée, pas un oubli. */
  items?: Array<{ contenu: string; etat: 'ferme' | 'ouvert'; titre: string }>;
}

/** Piqueray TexteSEO. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const TexteSEO = forwardRef<HTMLDivElement, TexteSEOProps>(function TexteSEO(
  {
    titre = [
      { text: 'Visitez notre ' },
      { text: 'showroom à Pepinster', strong: true },
      { text: ' ou contactez-nous' },
    ],
    items,
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <span className={styles.Titre}>
        {titre.map((segment, index) =>
          segment.strong ? (
            <strong key={index}>{segment.text}</strong>
          ) : (
            <span key={index}>{segment.text}</span>
          ),
        )}
      </span>
      <div className={styles.p}>
        <span className={styles.Paragraphe}>
          Rien ne vaut le toucher et la vue pour choisir ses finitions. Notre showroom situé rue
          Alfred Drèze à Pepinster (proche de Verviers) vous permet de découvrir en taille réelle
          nos portes de garage, motorisations et portes d'entrée. Vous pourrez y comparer les
          textures (Woodgrain, Silkgrain), les coloris et tester la robustesse des produits Hörmann.
          Nos conseillers sont à votre disposition pour étudier vos plans et vous orienter vers la
          meilleure solution technique et budgétaire.
        </span>
      </div>
      <div className={styles.h3}>
        <span className={styles.SousTitre}>Infos pratiques</span>
      </div>
      <div className={styles.accordion}>
        {items?.map((item, index) => (
          <AccordionRow
            key={index}
            taille="petit"
            contenu={item.contenu}
            etat={item.etat}
            titre={item.titre}
          />
        ))}
      </div>
    </div>
  );
});
