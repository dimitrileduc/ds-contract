/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/texte-seo.contract.json (ds.texte-seo v4.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { AccordionRow } from '../AccordionRow';
import styles from './TexteSEO.module.css';

export interface TexteSEOProps extends HTMLAttributes<HTMLDivElement> {
  /** Viewport presentation, mirroring the canvas axis Presentation of the candidate set. Default = mobile, the first variant (Figma's default) and the mobile-first base of the delivered CSS; in the delivered CSS the mode is selected by the viewport through the breakpoint tokens, never by a consumer. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Section title, bound to the set's TEXT property « Titre ». Kept RICH (marks.strong) as in 3.0.0 so the writer may still bold a range; the candidate draws it UNIFORM SemiBold (dump: fontStyle SemiBold on the whole node, no bold segment) so the default carries no bold segment — 3.0.0's « showroom à Pepinster » in bold came from the old master, not from the candidate. */
  titre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** The long paragraph, RICH: six bold ranges drawn on every variant of the candidate (owner rule 2026-09-02: a text with bold is rich). The candidate set exposes NO text property for it on purpose (owner decision 2026-09-02: a rich text is bound NONE, the canvas keeps its ranges by hand). 3.0.0 carried it as a static part text with no bold: it is now a governed prop so the Odoo writer edits it as rich text. The default is the candidate's own text, bold ranges as drawn — the spaces glued to the bold boundaries (« nos» + « portes de garage, motorisations » + «et» + « portes d'entrée») are the source's, reproduced as is. */
  texte?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** Sub-title above the rows, bound to the TEXT property « SousTitre » added on the candidate set (source defect n°1 of the audit, fixed on the candidate: the master had no property and the 9 instances overrode the text raw). Plain text, no bold, no line break. */
  sousTitre?: string;
  /** Les lignes d'accordéon. `etat` est observé par entrée sur le candidat (la 2e ligne est ouverte, les deux autres fermées) : le renseigner rend chaque ligne CONTRÔLÉE côté React — la géométrie est fidèle, mais une ligne ne se replie plus d'elle-même tant que le consommateur ne possède pas l'état (le canal `repeat` ne porte pas d'événement par entrée). Limite nommée, pas un oubli. */
  items?: Array<{ contenu: string; etat: 'ferme' | 'ouvert'; titre: string }>;
}

/** Piqueray TexteSEO, v2 (2026-09-07): anchored on the candidate set 2768:20428 (page 031, four variants Presentation=Mobile|Tablette|Desktop|Wide, cloned from the DS master 2108:3123 and reworked with the owner). MAJOR: the anchors leave the single COMPONENT master. What changes against 3.0.0: the viewport axis `presentation` (padding-inline 24/48/56/89 by mode, gap 32 everywhere), the title rides the DS H2 role (24/30 then 32/40 then 40/50, SemiBold — was 24/30 Regular), the paragraph rides the body role (16/24 Regular under 992, 18/27 Medium above — was 14/24 Regular) and becomes a governed rich-text prop `texte` (bold ranges kept), the sub-title rides the H4 role (20/25 then 24/30) and becomes the prop `sousTitre` bound to the new TEXT property `SousTitre`, and it wraps (FILL). The rows are ds.accordion-row 2.0.0 in Petit, unchanged. Named deviations against the dump are carried on each part's description. */
export const TexteSEO = forwardRef<HTMLDivElement, TexteSEOProps>(function TexteSEO(
  {
    presentation = 'mobile',
    sousTitre = 'Infos pratiques',
    titre = [{ text: 'Visitez notre showroom à Pepinster ou contactez-nous' }],
    texte = [
      { text: 'Rien ne vaut le toucher et la vue pour choisir ses finitions. Notre ' },
      { text: 'showroom', strong: true },
      { text: ' situé rue Alfred Drèze à ' },
      { text: 'Pepinster', strong: true },
      { text: ' (proche de ' },
      { text: 'Verviers', strong: true },
      { text: ') vous permet de découvrir en taille réelle nos' },
      { text: ' portes de garage, motorisations ', strong: true },
      { text: 'et' },
      { text: " portes d'entrée", strong: true },
      {
        text: '. Vous pourrez y comparer les textures (Woodgrain, Silkgrain), les coloris et tester la robustesse des produits ',
      },
      { text: 'Hörmann', strong: true },
      {
        text: '. Nos conseillers sont à votre disposition pour étudier vos plans et vous orienter vers la meilleure solution technique et budgétaire.',
      },
    ],
    items,
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
    <div ref={ref} className={classes} {...rest}>
      <span className={styles.Titre}>
        {titre.map((segment, index) => {
          const inner = segment.underline ? <u>{segment.text}</u> : segment.text;
          return segment.strong ? (
            <strong key={index}>{inner}</strong>
          ) : (
            <span key={index}>{inner}</span>
          );
        })}
      </span>
      <div className={styles.p}>
        <span className={styles.Paragraphe}>
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
      <div className={styles.h3}>
        <span className={styles.SousTitre}>{sousTitre}</span>
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
