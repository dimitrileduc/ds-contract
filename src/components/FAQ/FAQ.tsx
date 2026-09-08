/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/faq.contract.json (ds.faq v2.1.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { AccordionRow } from '../AccordionRow';
import { Button } from '../Button';
import styles from './FAQ.module.css';

export interface FAQProps extends HTMLAttributes<HTMLElement> {
  /** L'axe de la vague 031 : la variante de mise en page relevée sur le set. Les quatre valeurs correspondent aux quatre variantes dessinées (390 / 834 / 1200 / 1728) ; en CSS elles deviennent les paliers 768 / 992 / 1400. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  /** Les lignes de la FAQ. LIMITE NOMMÉE (inchangée depuis 010) : Figma n'a pas de propriété de composant de type tableau — la répétition n'existe sur le canevas que comme N instances sœurs compilées, d'où bindings.figma.kind NONE. Le schéma refuse aussi un default sur un prop arrayOf (« an optional array — undefined means "not provided", never a silent [] ») : le master rend trois lignes par défaut, le composant généré n'en rend aucune sans données. C'est pourquoi le cas d'audit alimente items par un override, comme ds.footer. */
  items?: Array<{ contenu: string; titre: string }>;
}

/** Piqueray FAQ, v2 de la vague 031 — candidat responsive extrait du set FAQ 2773:27504 (page « 031 · Planches de validation », 4 variantes Presentation Mobile/Tablette/Desktop/Wide). MAJEUR pour deux raisons : les ancres changent de set (le master v1 2104:2914 n'avait qu'une largeur, 1728) et la prop `ligne3` disparaît — en v2 le nombre de questions est du CONTENU (la liste `items`), plus une bascule de visibilité sur une troisième rangée sortie du repeat. Mise en page : option B tranchée par l'owner le 2026-09-07 — en-tête aligné à gauche —, CORRIGÉE le 2026-09-08 : l'en-tête et le CTA sont CENTRÉS en Desktop et Wide, à gauche en Mobile et Tablette, comme AvisGoogle et Reassurances (l'écart assumé de la veille est levé ; le set 2773:27504 porte le geste, 14 instances avant, 14 après), rangées Taille=Grand partout, CTA pleine largeur sous 992 (fait code-only, une part `component` ne peut pas porter layoutByProp). L'en-tête n'est plus une instance de ds.section-header : aucune section v2 de la vague n'en utilise — chacune dessine son accroche et son titre avec les rôles typographiques responsive, ce qui règle au passage le défaut de source v1 (instance bridée à 50 px, titre débordant de 33 px dans le gap). */
export const FAQ = forwardRef<HTMLElement, FAQProps>(function FAQ(
  { presentation = 'mobile', items, className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`presentation-${presentation}`], className]
    .filter(Boolean)
    .join(' ');
  return (
    <section ref={ref} className={classes} {...rest}>
      <div className={styles.SectionHeader}>
        <span className={styles.Accroche}>FAQ</span>
        <h2 className={styles.Titre}>Questions fréquentes</h2>
      </div>
      <div className={styles.accordion}>
        {items?.map((item, index) => (
          <AccordionRow key={index} taille="grand" contenu={item.contenu} titre={item.titre} />
        ))}
      </div>
      <Button variant="outlineNoir" iconRight>
        Contactez-nous
      </Button>
    </section>
  );
});
