/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/menu-mobile.contract.json (ds.menu-mobile v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { PiquerayLogo } from '../PiquerayLogo';
import { MenuEntree } from '../MenuEntree';
import { Button } from '../Button';
import styles from './MenuMobile.module.css';

const ICONS: Record<string, string> = {
  user: '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M20.3336 7.99963C20.3334 5.60655 18.3928 3.66663 15.9996 3.66663C13.6067 3.6668 11.6668 5.60666 11.6666 7.99963C11.6666 10.3928 13.6065 12.3334 15.9996 12.3336C18.3929 12.3336 20.3336 10.3929 20.3336 7.99963ZM22.3336 7.99963C22.3336 11.4974 19.4974 14.3336 15.9996 14.3336C12.502 14.3334 9.66663 11.4973 9.66663 7.99963C9.6668 4.50209 12.5021 1.6668 15.9996 1.66663C19.4973 1.66663 22.3334 4.50198 22.3336 7.99963Z" fill="currentColor"/>\n<path d="M25.6663 23.3333C25.6663 22.1984 24.8381 20.9668 23.0521 19.9622C21.2975 18.9752 18.8062 18.3333 16.0003 18.3333C13.1942 18.3333 10.7022 18.9751 8.94756 19.9622C7.16163 20.9668 6.33331 22.1984 6.33331 23.3333C6.33331 25.0767 6.38721 26.0581 7.29815 26.8C7.79217 27.2024 8.61802 27.5949 10.0315 27.8811C11.4408 28.1664 13.368 28.3333 16.0003 28.3333C18.939 28.3332 20.9952 28.1254 22.4319 27.7786C22.9688 27.649 23.5094 27.979 23.639 28.5159C23.7685 29.0526 23.4383 29.5932 22.9017 29.7229C21.2452 30.1227 19.0105 30.3332 16.0003 30.3333C13.2994 30.3333 11.2258 30.164 9.63506 29.842C8.04875 29.5209 6.87474 29.0343 6.03545 28.3508C4.27984 26.9211 4.33331 24.9031 4.33331 23.3333C4.33331 21.1549 5.89256 19.386 7.9671 18.219C10.0731 17.0344 12.9157 16.3333 16.0003 16.3333C19.0847 16.3333 21.9266 17.0344 24.0325 18.219C26.1071 19.386 27.6663 21.1548 27.6663 23.3333C27.6663 23.5617 27.6662 23.7866 27.6644 24.0081C27.6599 24.5603 27.2078 25.0047 26.6556 25.0002C26.1034 24.9956 25.6599 24.5436 25.6644 23.9915C25.6661 23.7757 25.6663 23.5563 25.6663 23.3333Z" fill="currentColor"/>\n</svg>',
  cart: '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M12.333 26C12.333 25.7348 12.2276 25.4805 12.04 25.293C11.8525 25.1056 11.5981 25 11.333 25C11.0679 25.0001 10.8134 25.1055 10.626 25.293C10.4385 25.4805 10.333 25.7349 10.333 26C10.333 26.2652 10.4385 26.5195 10.626 26.7071C10.8134 26.8945 11.0679 27 11.333 27C11.5981 27 11.8525 26.8945 12.04 26.7071C12.2276 26.5195 12.333 26.2653 12.333 26ZM23 26C23 25.7348 22.8945 25.4805 22.707 25.293C22.5195 25.1055 22.2652 25 22 25C21.7348 25 21.4805 25.1055 21.2929 25.293C21.1054 25.4805 21 25.7348 21 26C21 26.2653 21.1054 26.5195 21.2929 26.7071C21.4805 26.8946 21.7348 27 22 27C22.2652 27 22.5195 26.8946 22.707 26.7071C22.8945 26.5195 23 26.2653 23 26ZM3.71677 3.04105C4.24623 2.88469 4.80233 3.18739 4.95896 3.71683L5.69333 6.20023H25.2324C27.61 6.20048 29.4416 8.34754 28.9101 10.6573L28.8506 10.8809L26.6455 18.3477C26.1738 19.9381 24.6832 21 23.0263 21H10.8164C9.15863 21 7.66553 19.938 7.19529 18.3477L3.04099 4.28324C2.88463 3.75378 3.18733 3.19768 3.71677 3.04105ZM9.11326 17.7803C9.32034 18.4807 10.0021 19 10.8164 19H23.0263C23.8387 19 24.5191 18.4821 24.7275 17.7793L26.9326 10.3145C27.2327 9.29964 26.4523 8.20048 25.2324 8.20023H6.28415L9.11326 17.7803ZM14.333 26C14.333 26.7955 14.0175 27.5586 13.4551 28.1211C12.8924 28.6837 12.1286 29 11.333 29C10.5374 29 9.77442 28.6837 9.21189 28.1211C8.64938 27.5585 8.33298 26.7956 8.33298 26C8.33298 25.2045 8.64938 24.4415 9.21189 23.8789C9.77442 23.3164 10.5374 23.0001 11.333 23C12.1286 23 12.8924 23.3163 13.4551 23.8789C14.0175 24.4415 14.333 25.2045 14.333 26ZM25 26C25 26.7957 24.6837 27.5585 24.1211 28.1211C23.5585 28.6837 22.7956 29 22 29C21.2043 29 20.4415 28.6837 19.8789 28.1211C19.3163 27.5585 19 26.7957 19 26C19 25.2044 19.3163 24.4416 19.8789 23.8789C20.4415 23.3163 21.2043 23 22 23C22.7956 23 23.5585 23.3163 24.1211 23.8789C24.6837 24.4415 25 25.2044 25 26Z" fill="currentColor"/>\n</svg>',
  'menu-mobile-croix':
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path fill-rule="evenodd" clip-rule="evenodd" d="M0 1.414L1.414 0L15.414 14L14 15.414L0 1.414ZM14 0L15.414 1.414L1.414 15.414L0 14L14 0Z" fill="currentColor"/>\n</svg>',
  phone:
    '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M22.3749 29.1051C24.7052 29.1051 26.2457 28.4754 27.6114 26.9486C27.7189 26.8417 27.8126 26.7211 27.92 26.6137C28.7234 25.7166 29.0983 24.8326 29.0983 23.9891C29.0983 23.0246 28.536 22.1274 27.344 21.2966L23.4469 18.5914C22.2412 17.7611 20.8349 17.6674 19.7097 18.7788L18.6789 19.8103C18.3703 20.1183 18.1029 20.132 17.7949 19.944C17.0852 19.4886 15.6252 18.2166 14.6337 17.2257C13.5892 16.1943 12.5714 15.0428 12.0492 14.1988C11.8617 13.8903 11.8886 13.636 12.1966 13.328L13.2143 12.2966C14.3394 11.172 14.2457 9.75198 13.4154 8.56055L10.6966 4.66341C9.87945 3.47084 8.98231 2.9217 8.01773 2.90855C7.1743 2.89484 6.2903 3.28341 5.39316 4.08684C5.27259 4.19427 5.16516 4.28798 5.04459 4.3817C3.53145 5.74741 2.90173 7.28798 2.90173 9.60455C2.90173 13.4354 5.25888 18.096 9.58516 22.4217C13.884 26.7211 18.5583 29.1051 22.3749 29.1051ZM22.3886 27.0423C18.9732 27.1091 14.5943 24.4846 11.1252 21.0291C7.62973 17.5468 4.88402 13.02 4.95088 9.60512C4.97773 8.13141 5.48688 6.85941 6.54516 5.94855C6.62516 5.86855 6.70516 5.80113 6.79888 5.73427C7.18745 5.3857 7.62973 5.19884 8.00459 5.19884C8.40631 5.19884 8.7543 5.3457 9.00916 5.74741L11.6074 9.64455C11.8886 10.06 11.9154 10.5291 11.5 10.944L10.3217 12.1228C9.38402 13.0468 9.46459 14.172 10.1343 15.0691C10.8972 16.1006 12.2234 17.6006 13.2412 18.6183C14.2726 19.6497 15.8926 21.096 16.924 21.8726C17.8212 22.5423 18.96 22.6097 19.884 21.6851L21.0623 20.5068C21.4777 20.0914 21.9332 20.1183 22.348 20.3863L26.2452 22.9846C26.6474 23.252 26.808 23.5868 26.808 23.9891C26.808 24.3777 26.6206 24.8063 26.2594 25.2074C26.1965 25.2955 26.1293 25.3805 26.0583 25.4623C25.1343 26.5068 23.8617 27.0154 22.3886 27.0423Z" fill="currentColor"/>\n</svg>',
};

export interface MenuMobileProps extends HTMLAttributes<HTMLDivElement> {
  /** Deux étages seulement : le menu n'existe pas en Desktop ni en Wide (la nav est dans la barre). Côté Odoo la valeur n'est jamais posée : responsive/menu-mobile.pqr.css réécrit les règles par mode en @media. */
  presentation?: 'mobile' | 'tablette';
  /** Les entrées du menu — code-only par construction (arrayOf ⇔ figma NONE). Même donnée que ds.header.items, côté Odoo la boucle sur website.menu. Limite nommée : une liste dans une liste ne se porte pas (au plus deux sous-entrées par entrée dans le dessin ; la liste réelle vient du menu du client). */
  items?: Array<{
    libelle: string;
    href: string;
    chevron: boolean;
    sousEntree1: string;
    sousEntree2: string;
    deuxSousEntrees: boolean;
  }>;
}

/** Le menu ouvert du header en Mobile et Tablette (vague 031, décision owner 2026-09-04 : piste A plein écran en Mobile, piste B tiroir en Tablette). Extrait du set 031 `MenuMobile` 2738:13621 (journal specs/tiny/vague-031/menu-mobile.md). Composant SÉPARÉ du header : « ouvert » n'est pas une prop de ds.header — l'ouverture est une interaction (prototype Figma, offcanvas natif côté Odoo), doctrine de la matrice §9 et des contrats de nav de l'archive. Anatomie commune aux deux variantes : root (l'écran) > voile (Tablette seule, color.noir-bleute-72) + tiroir (Mobile : toute la largeur ; Tablette : size.menu-mobile.tiroir = 420 ancré à droite) > barre (logo en Mobile, icônes compte et panier, croix 44) · nav (répétition de ds.menu-entree) · pied (téléphone + Contactez-nous, zone du pouce). La hauteur de l'écran (844 / 1194 sur le set) n'est pas portée : côté Odoo le panneau prend la hauteur de la fenêtre (fait code-only nommé). Motion, code-only : ouverture en fondu 280 ms ease-out avec montée des entrées décalées de 40 ms en Mobile, glissement depuis la droite 300 ms + fondu du voile en Tablette ; fermeture 180 / 200 ms ease-in ; opacité et transform seulement. */
export const MenuMobile = forwardRef<HTMLDivElement, MenuMobileProps>(function MenuMobile(
  { presentation = 'mobile', items, className, children, ...rest },
  ref,
) {
  const classes = [styles.root, styles[`presentation-${presentation}`], className]
    .filter(Boolean)
    .join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      {presentation === 'tablette' ? <div className={styles.voile}></div> : null}
      <div className={styles.tiroir}>
        <div className={styles.barre}>
          {presentation === 'mobile' ? <PiquerayLogo couleur="blanc" /> : null}
          <div className={styles.actions}>
            <span
              className={styles.User}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ICONS['user'] }}
            />
            <span
              className={styles.Cart}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ICONS['cart'] }}
            />
            <div className={styles.fermer}>
              <div className={styles.croix}>
                <span
                  className={styles.glyphe}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: ICONS['menu-mobile-croix'] }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.nav}>
          {items?.map((item, index) => (
            <MenuEntree
              key={index}
              etat="ferme"
              libelle={item.libelle}
              href={item.href}
              chevron={item.chevron}
              sousEntree1={item.sousEntree1}
              sousEntree2={item.sousEntree2}
              deuxSousEntrees={item.deuxSousEntrees}
            />
          ))}
        </div>
        <div className={styles.pied}>
          <div className={styles.telephone}>
            <span
              className={styles.icone}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: ICONS['phone'] }}
            />
            <span className={styles.numero}>+32 (0)87 46 32 66</span>
          </div>
          {presentation === 'mobile' ? (
            <Button variant="blanc" iconLeft={false} iconRight iconRightGlyph="arrow-right">
              Contactez-nous
            </Button>
          ) : null}
          {presentation === 'tablette' ? (
            <Button variant="outlineBlanc" iconLeft={false} iconRight iconRightGlyph="arrow-right">
              Contactez-nous
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
});
