/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/coordonnees.contract.json (ds.coordonnees v3.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import styles from './Coordonnees.module.css';

const ICONS: Record<string, string> = {
  facebook:
    '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M15.9889 2.80987e-06C20.0465 -0.00240035 23.9535 1.53676 26.9192 4.30601C29.8849 7.07525 31.6878 10.8678 31.9631 14.916C32.2384 18.9643 30.9654 22.9659 28.4019 26.1111C25.8384 29.2563 22.1757 31.3102 18.1551 31.8571V20.346H22.2955L22.9476 16.1196H18.1551V13.8074C18.1551 12.1492 18.6652 10.667 20.0973 10.507L20.3614 10.493H22.9876V6.80267L22.4056 6.73066C21.8455 6.67066 20.9834 6.60265 19.7053 6.60265C15.9849 6.60265 13.7487 8.51484 13.6047 12.8493L13.5967 13.3053V16.1216H9.6383V20.348H13.5987V31.8291C9.60999 31.2224 5.99756 29.1317 3.48442 25.9754C0.971278 22.8192 -0.257161 18.8302 0.0449689 14.807C0.347098 10.7837 2.15751 7.023 5.11385 4.27748C8.07019 1.53195 11.9543 0.00420512 15.9889 2.80987e-06Z" fill="currentColor"/>\n</svg>',
  instagram:
    '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M9.28 0H22.72C27.84 0 32 4.16 32 9.28V22.72C32 25.1812 31.0223 27.5416 29.282 29.282C27.5416 31.0223 25.1812 32 22.72 32H9.28C4.16 32 0 27.84 0 22.72V9.28C0 6.81879 0.977712 4.45839 2.71805 2.71805C4.45839 0.977712 6.81879 0 9.28 0ZM8.96 3.2C7.43235 3.2 5.96727 3.80686 4.88707 4.88707C3.80686 5.96727 3.2 7.43235 3.2 8.96V23.04C3.2 26.224 5.776 28.8 8.96 28.8H23.04C24.5676 28.8 26.0327 28.1931 27.1129 27.1129C28.1931 26.0327 28.8 24.5676 28.8 23.04V8.96C28.8 5.776 26.224 3.2 23.04 3.2H8.96ZM24.4 5.6C24.9304 5.6 25.4391 5.81071 25.8142 6.18579C26.1893 6.56086 26.4 7.06957 26.4 7.6C26.4 8.13043 26.1893 8.63914 25.8142 9.01421C25.4391 9.38929 24.9304 9.6 24.4 9.6C23.8696 9.6 23.3609 9.38929 22.9858 9.01421C22.6107 8.63914 22.4 8.13043 22.4 7.6C22.4 7.06957 22.6107 6.56086 22.9858 6.18579C23.3609 5.81071 23.8696 5.6 24.4 5.6ZM16 8C18.1217 8 20.1566 8.84285 21.6569 10.3431C23.1571 11.8434 24 13.8783 24 16C24 18.1217 23.1571 20.1566 21.6569 21.6569C20.1566 23.1571 18.1217 24 16 24C13.8783 24 11.8434 23.1571 10.3431 21.6569C8.84285 20.1566 8 18.1217 8 16C8 13.8783 8.84285 11.8434 10.3431 10.3431C11.8434 8.84285 13.8783 8 16 8ZM16 11.2C14.727 11.2 13.5061 11.7057 12.6059 12.6059C11.7057 13.5061 11.2 14.727 11.2 16C11.2 17.273 11.7057 18.4939 12.6059 19.3941C13.5061 20.2943 14.727 20.8 16 20.8C17.273 20.8 18.4939 20.2943 19.3941 19.3941C20.2943 18.4939 20.8 17.273 20.8 16C20.8 14.727 20.2943 13.5061 19.3941 12.6059C18.4939 11.7057 17.273 11.2 16 11.2Z" fill="currentColor"/>\n</svg>',
};

export interface CoordonneesProps extends HTMLAttributes<HTMLElement> {
  /** Présentation par écran, miroir de l'axe Presentation du set candidat 2778:34448. Défaut = mobile, première variante du set et base mobile-first du CSS livré ; dans le CSS livré c'est la fenêtre qui choisit, par les jetons de rupture, jamais un consommateur. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** URL fournie par le code pour le paint IMAGE du plan Google — LIMITE NOMMÉE A5 (docs/FIGMA-CAPABILITY-MATRIX.md) : Figma range ces pixels dans un paint du master, jamais dans une propriété de composant, et le contrat n'a aucun canal background-image ici. Le défaut vide est intentionnel et ne substitue aucune image. Le paint de l'ancien master (2104:2899, imageRef efdebf1941d13dbd5a2ab421aaeac49d352a87b2) n'est plus l'ancre ; le set candidat dessine un cadrage DIFFÉRENT par variante (relevé : entre la planche 390 et la planche 1728 le rapport d'échelle des repères vaut 3,45 alors qu'un même original recouvert donnerait 2,95 ou 3,11 selon l'axe), ce qu'aucune règle CSS d'object-fit ne reproduit depuis une source unique : écart nommé, jamais contourné. */
  mapUrl?: string;
  /** Équivalent textuel fourni par le code, apparié à mapUrl. Un paint IMAGE Figma n'expose aucune propriété de composant correspondante, donc le défaut vide est intentionnel. */
  mapAlt?: string;
  /** Sur-titre de la section, dessiné à plat depuis 3.0.0. La liaison TEXT « Accroche » est celle que portait la version 2 ; elle n'a PAS pu être revérifiée contre le set candidat 2778:34448 (aucun dump n'a été fourni à l'agent et le canevas ne lui est pas ouvert) — la question est ouverte au journal de section sous « Bloqué / à trancher ». Sur l'ancien master la propriété existait mais n'avait AUCUN effet (0 componentPropertyReferences mesuré), l'instance SectionHeader routant la valeur. */
  accroche?: string;
  /** Titre de la section, dessiné à plat depuis 3.0.0 (il passait auparavant par l'instance ds.section-header). Reste rich-text : le titre observé est UNIFORME (un seul segment) mais le type ouvre la voie aux graisses par plage sans nouveau MAJEUR. Même réserve que l'accroche sur la liaison TEXT « Titre », non revérifiée contre le set candidat. */
  titre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
}

/** Piqueray section « Nos coordonnées », responsive. 3.0.0 (2026-09-07, vague 031) : MAJEUR parce que les ancres changent de set — le contrat quittait l'ancien master 2104:2904 (page DS · Organisms) pour le set candidat 2778:34448 (page « 031 · Planches de validation », section « 031 · 20 · COORDONNEES »), quatre variantes sur le seul axe Presentation = Mobile | Tablette | Desktop | Wide.

Ce que la version 3 change, dans l'ordre où cela se voit. (1) L'en-tête cesse d'être une instance de ds.section-header : il est DESSINÉ À PLAT dans la section, exactement comme ds.reassurances 2.0.0 l'a fait dans la même vague. L'ancienne composition figeait le titre à 40 px sur les quatre écrans ; à plat, l'accroche monte le rôle overline (14/20 Regular · 14/20 Regular · 16/20 Medium · 20/25 Medium) et le titre le rôle H2 (24/30 · 24/30 · 32/40 · 40/50 SemiBold). (2) La mise en page devient responsive : EMPILÉE en Mobile et Tablette — le plan pleine largeur au rapport 16/9, le panneau dessous — et CÔTE À CÔTE en Desktop et Wide, le panneau à largeur fixe d'un tiers (400 puis 576) et le plan en remplissage sur les deux tiers restants, étiré sur la hauteur de la rangée que le panneau décide. (3) Les quatre étiquettes montent le rôle H4 (20/25 · 20/25 · 24/30 · 24/30 Medium) et les quatre valeurs le rôle body (16/24 Regular · 16/24 Regular · 18/27 Medium · 18/27 Medium) : elles étaient du texte libre sans style du DS et ne suivaient aucun écran. (4) Les informations passent à DEUX colonnes en Tablette et là seulement, parce que c'est le seul écran où le panneau est pleine largeur (738 de contenu) alors qu'il n'occupe qu'un tiers ailleurs (342 · 738 · 304 · 480 ; règle : deux colonnes au-delà de 600).

Ce que le set candidat NE dessine PLUS et que la version 2 portait : les valeurs Adresse et Contact étaient soulignées (declared text-decoration-line et textSegments underline). Le candidat ne souligne rien — vérifié au pixel sur la planche Wide (profil d'encre par ligne, aucune rangée dense sous la ligne de base, les 4 à 6 pixels résiduels étant les jambages de « info@piqueray.be »). Les soulignements sont retirés ici ; côté Odoo l'affordance de lien est reportée au survol et au focus, fait code-only nommé dans la description de la part Contact.

CINQ DÉFAUTS DE SOURCE relevés à l'étape 0 et NON contournés en silence — chacun est écrit ici et dans le journal de section (specs/tiny/vague-031/coordonnees.md, « À corriger à la source ») : (a) l'en-tête de l'ancien master était une instance de SectionHeader large de 1550 px posée dans un panneau de 480 — elle débordait ; l'aplatissement la corrige ; (b) les quatre étiquettes et les quatre valeurs étaient du texte libre, sans style du design system, donc immobiles d'un écran à l'autre ; (c) la valeur Contact porte un vrai saut de ligne (téléphone puis e-mail) — et le relevé de la planche montre que les valeurs Adresse (deux lignes) et Horaires (trois lignes) en portent aussi, sur les quatre écrans, alors que rien ne les y forcerait : la plus longue ligne mesure 220 px pour 480 px de contenu disponible en Wide ; les trois parts déclarent donc white-space pre-line ; (d) l'instance SectionHeader portait un blanc non lié à aucune variable, posé sur le fond bleu clair de la section ; (e) les deux icônes sociales sont en noir pur brut (#000000), non liées — le contrat les porte par le registre d'icônes, la couleur reste celle du glyphe.

Historique avant 3.0.0 :
Piqueray Coordonnees. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. */
export const Coordonnees = forwardRef<HTMLElement, CoordonneesProps>(function Coordonnees(
  {
    presentation = 'mobile',
    mapUrl = '',
    mapAlt = '',
    accroche = 'Contact',
    titre = [{ text: 'Nos coordonnées' }],
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
    <section ref={ref} className={classes} {...rest}>
      <img className={styles.googleMap} src={String(mapUrl)} alt={String(mapAlt)}></img>
      <div className={styles.wrapper}>
        <div className={styles.SectionHeader}>
          <span className={styles.Accroche}>{accroche}</span>
          <h2 className={styles.Titre}>
            {titre.map((segment, index) => {
              const inner = segment.underline ? <u>{segment.text}</u> : segment.text;
              return segment.strong ? (
                <strong key={index}>{inner}</strong>
              ) : (
                <span key={index}>{inner}</span>
              );
            })}
          </h2>
        </div>
        <div className={styles.infos}>
          <div className={styles.Adresse}>
            <span className={styles.AdresseEtiquette}>Adresse</span>
            <span className={styles.AdresseValeur}>{'Rue Alfred Drèze 7,\n4860 Pepinster'}</span>
          </div>
          <div className={styles.Horaires}>
            <span className={styles.HorairesEtiquette}>Horaires</span>
            <span className={styles.HorairesValeur}>
              {'Du lundi au vendredi\nde 8h00 à 12h00 et\nde 13h30 à 17h00'}
            </span>
          </div>
          <div className={styles.Contact}>
            <span className={styles.ContactEtiquette}>Contact</span>
            <span className={styles.tl32087463266EmailInfopi}>
              {'Tél : +32 (0)87 46 32 66\nEmail: info@piqueray.be'}
            </span>
          </div>
          <div className={styles.suivezNous}>
            <span className={styles.SuivezNousEtiquette}>Suivez-nous</span>
            <div className={styles.rseauxSociaux}>
              <span
                className={styles.Facebook}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS['facebook'] }}
              />
              <span
                className={styles.Instagram}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS['instagram'] }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
