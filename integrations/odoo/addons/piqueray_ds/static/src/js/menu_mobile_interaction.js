/**
 * ODOO-031-MENU-MOBILE-INTERACTION — le dépliage d'une entrée du menu mobile.
 *
 * Même patron que faq_interaction.js (noyau 19 : une `Interaction` de
 * `registry.category("public.interactions")`, délégation sur la racine). L'ouverture
 * et la fermeture du MENU lui-même sont l'offcanvas Bootstrap du noyau (burger
 * `data-bs-toggle`, croix `data-bs-dismiss`, Échap, focus) — rien ici.
 *
 * Ce que la bascule tient ensemble, comme pour la FAQ : la classe d'état du contrat
 * (`menu-entree--etat-ouvert` / `--etat-ferme`, qui pilote la couleur du libellé via
 * le CSS généré) · `hidden` des deux chevrons et de la liste des sous-entrées (les
 * deux plans sont dans le DOM) · `aria-expanded` du déclencheur.
 */
import { registry } from "@web/core/registry";
import { Interaction } from "@web/public/interaction";

// ODOO-031-MENU-MOBILE-INTERACTION BEGIN
const OPEN_CLASS = "menu-entree--etat-ouvert";
const CLOSED_CLASS = "menu-entree--etat-ferme";

export function setMenuEntreeState(row, open) {
    if (!row) return;
    row.classList.toggle(OPEN_CLASS, open);
    row.classList.toggle(CLOSED_CLASS, !open);
    const haut = row.querySelector('[data-pqr-part="menu-entree-chevron-haut"]');
    const bas = row.querySelector('[data-pqr-part="menu-entree-chevron-bas"]');
    const sous = row.querySelector('[data-pqr-part="menu-entree-sous-entrees"]');
    if (haut) haut.hidden = !open;
    if (bas) bas.hidden = open;
    if (sous) sous.hidden = !open;
    const trigger = row.querySelector('[data-pqr-part="menu-entree-tete"]');
    if (trigger) trigger.setAttribute("aria-expanded", open ? "true" : "false");
}

export class PiquerayMenuMobile extends Interaction {
    static selector = ".menu-mobile";
    dynamicContent = {
        _root: {
            "t-on-click": this.onClick,
        },
    };

    /** @param {MouseEvent} ev */
    onClick(ev) {
        const trigger = ev.target.closest?.('[data-pqr-part="menu-entree-tete"]');
        if (!trigger || !this.el.contains(trigger)) return;
        const row = trigger.closest(".menu-entree");
        if (!row || !row.querySelector('[data-pqr-part="menu-entree-sous-entrees"]')) return;
        ev.preventDefault();
        setMenuEntreeState(row, !row.classList.contains(OPEN_CLASS));
    }
}

registry
    .category("public.interactions")
    .add("piqueray_ds.menu_mobile", PiquerayMenuMobile);
// ODOO-031-MENU-MOBILE-INTERACTION END
