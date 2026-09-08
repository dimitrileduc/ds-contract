/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/sous-menu.contract.json (ds.sous-menu v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { SousEntree } from '../SousEntree';
import styles from './SousMenu.module.css';

export interface SousMenuProps extends HTMLAttributes<HTMLDivElement> {
  /** Les sous-entrées — code-only par construction (arrayOf ⇔ figma NONE). Côté Odoo la boucle sur `submenu.child_id` ; l'état actif de chaque rangée est posé par Odoo (`_is_active()`), pas par la donnée. */
  items?: Array<{ libelle: string; href: string }>;
}

/** Le sous-menu desktop/wide d'une entrée de la barre (option A « Rail », retenue par l'owner le 2026-09-08 sur la planche 031 · 22). Extrait du set 031 `SousMenu` 2793:49493 (journal specs/tiny/vague-031/sous-menu.md). Panneau noir-bleuté, filet color.blanc-14 (border-width.1), padding 24 / 32 ; à l'intérieur un rail orange (largeur size.nav-item.soulignement) et la liste des sous-entrées (répétition de ds.sous-entree, écart space.4, retrait space.22 = le menu mobile). Trois sous-entrées dessinées ; la liste réelle vient de website.menu (`items`, code-only). Faits code-only, portés par Odoo et nommés ici : le panneau se pose SOUS la barre (position absolue, haut = bas de la barre), son texte aligné sur le libellé du parent (gauche = libellé − 56 : padding 32 + rail 2 + retrait 22) ; il s'ouvre au CLIC sur le parent (pattern disclosure : bouton aria-expanded, Échap et clic dehors ferment, pas de role=menu) ; le parent ouvert prend le libellé orange et le chevron retourné (fait code-only sur ds.nav-item, non dessiné dans ce set). Aucun axe de présentation : Desktop et Wide dessinent le même panneau ; sous 992 la barre n'a pas de nav (menu mobile). */
export const SousMenu = forwardRef<HTMLDivElement, SousMenuProps>(function SousMenu(
  { items, className, children, ...rest },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      <div className={styles.sousEntrees}>
        <div className={styles.rail}></div>
        <div className={styles.liste}>
          {items?.map((item, index) => (
            <SousEntree key={index} etat="repos" libelle={item.libelle} href={item.href} />
          ))}
        </div>
      </div>
    </div>
  );
});
