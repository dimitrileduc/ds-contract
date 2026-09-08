/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/sous-entree.contract.json (ds.sous-entree v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';
import styles from './SousEntree.module.css';

export interface SousEntreeProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Repos (défaut) ou actif = page courante. Côté Odoo : `child._is_active()`. */
  etat?: 'repos' | 'actif';
  libelle?: string;
  /** Cible du lien — contenu, jamais dessiné (même règle que ds.nav-item). Côté Odoo la donnée vient de website.menu. */
  href?: string;
}

/** Une sous-entrée du sous-menu desktop/wide (option A retenue par l'owner le 2026-09-08). Extrait du set 031 `SousEntree` 2793:49492 (journal specs/tiny/vague-031/sous-menu.md). Un lien (`href` = contenu code-only, même règle que ds.nav-item), libellé au style « Sous-entrée menu » (typography.menu-sous-entree : 18/27 en Mobile, 16/24 dès Tablette — donc 16/24 là où ce panneau existe), rangée à la boîte tactile 44 (size.cible-tactile.min). Etat=Actif = page courante : libellé orange + Soulignement orange (hauteur size.nav-item.soulignement), comme NavItem.Actif ; côté Odoo l'état vient de website.menu._is_active(). Survol = libellé orange (canal d'états, non dessiné sur le set — pas de figmaStatePreviews) ; focus visible = anneau orange (border-width.2). Déviation nommée : sur le canevas le libellé est HUG et le Soulignement FILL ; le contrat porte align stretch sur la racine (boîte rendue identique, le soulignement prend la largeur du texte). Le dépliage du panneau est la couche comportement (Odoo), jamais le contrat. */
export const SousEntree = forwardRef<HTMLAnchorElement, SousEntreeProps>(function SousEntree(
  {
    etat = 'repos',
    libelle = 'Portes résidentielles',
    href = '/portes-residentielles',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, styles[`etat-${etat}`], className].filter(Boolean).join(' ');
  return (
    <a
      ref={ref}
      className={classes}
      href={String(href)}
      {...(({ actif: { 'aria-current': 'page' } } as const)[etat as 'actif'] ?? {})}
      {...rest}
    >
      <span className={styles.texte}>{libelle}</span>
      {etat === 'actif' ? <div className={styles.Soulignement}></div> : null}
    </a>
  );
});
