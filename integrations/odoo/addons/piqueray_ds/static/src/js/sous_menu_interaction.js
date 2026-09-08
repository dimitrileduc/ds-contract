/**
 * ODOO-031-SOUS-MENU-INTERACTION — l'ouverture d'un sous-menu de la barre (desktop/wide).
 *
 * Même patron que menu_mobile_interaction.js (noyau 19 : une `Interaction` de
 * `registry.category("public.interactions")`, délégation sur la barre). Pattern
 * « disclosure » (W3C APG, Roselli) : le parent est un <button aria-expanded
 * aria-controls>, le panneau (ds.sous-menu) une liste de liens ; jamais role=menu.
 *
 * Ce que la bascule tient ensemble : `hidden` du panneau · `aria-expanded` du
 * déclencheur (la feuille sous-menu.pqr.css en dérive l'état ouvert du parent :
 * libellé orange, chevron retourné — fait code-only, ds.nav-item ne dessine pas
 * « ouvert ») · la position du panneau, MESURÉE (bas de la barre, texte des
 * sous-entrées aligné sur le libellé du parent) — aucune valeur en dur ici.
 * Ferment : Échap (focus rendu au parent), clic hors du groupe, sortie du focus
 * (Tab), ouverture d'un autre sous-menu. Un seul panneau ouvert à la fois.
 */
import { registry } from "@web/core/registry";
import { Interaction } from "@web/public/interaction";

// ODOO-031-SOUS-MENU-INTERACTION BEGIN
const TRIGGER = '[data-pqr-part="nav-item-root"][aria-controls]';
const GROUP = '[data-pqr-part="nav-item-dropdown"]';

export class PiqueraySousMenu extends Interaction {
    static selector = ".header[data-pqr-shell='header']";
    dynamicContent = {
        _root: {
            "t-on-click": this.onClick,
            "t-on-keydown": this.onKeydown,
            "t-on-focusout": this.onFocusOut,
        },
        _document: {
            "t-on-click": this.onDocumentClick,
        },
        _window: {
            "t-on-resize": this.onResize,
        },
    };

    triggers() {
        return [...this.el.querySelectorAll(TRIGGER)];
    }
    panelOf(trigger) {
        return this.el.querySelector("#" + CSS.escape(trigger.getAttribute("aria-controls")));
    }
    isOpen(trigger) {
        return trigger.getAttribute("aria-expanded") === "true";
    }

    /** Place le panneau : sous la barre, texte aligné sur le libellé du parent. Mesuré. */
    position(trigger, panel) {
        const bar = this.el.getBoundingClientRect();
        const label = trigger.querySelector('[data-pqr-part="nav-item-libelle"]') || trigger;
        const labelLeft = label.getBoundingClientRect().left - bar.left;
        panel.style.left = "0px";
        const texte = panel.querySelector('[data-pqr-part="sous-entree-texte"]');
        const retrait = texte ? texte.getBoundingClientRect().left - panel.getBoundingClientRect().left : 0;
        panel.style.left = `${Math.round(labelLeft - retrait)}px`;
        panel.style.top = `${Math.round(bar.height)}px`;
    }

    open(trigger) {
        for (const t of this.triggers()) if (t !== trigger) this.close(t);
        const panel = this.panelOf(trigger);
        if (!panel) return;
        panel.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        this.position(trigger, panel);
    }
    close(trigger, { focus = false } = {}) {
        const panel = this.panelOf(trigger);
        if (panel) panel.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        if (focus) trigger.focus();
    }
    closeAll(opts) {
        for (const t of this.triggers()) if (this.isOpen(t)) this.close(t, opts);
    }

    /** @param {MouseEvent} ev */
    onClick(ev) {
        const trigger = ev.target.closest?.(TRIGGER);
        if (!trigger || !this.el.contains(trigger)) return;
        ev.preventDefault();
        this.isOpen(trigger) ? this.close(trigger) : this.open(trigger);
    }
    /** @param {KeyboardEvent} ev */
    onKeydown(ev) {
        if (ev.key !== "Escape") return;
        const group = ev.target.closest?.(GROUP);
        const trigger = group && group.querySelector(TRIGGER);
        if (trigger && this.isOpen(trigger)) {
            ev.preventDefault();
            this.close(trigger, { focus: true });
        }
    }
    /** Sortie du focus (Tab) hors du groupe → fermeture de ce sous-menu. */
    onFocusOut(ev) {
        const group = ev.target.closest?.(GROUP);
        if (!group) return;
        const next = ev.relatedTarget;
        if (next && group.contains(next)) return;
        const trigger = group.querySelector(TRIGGER);
        if (trigger && this.isOpen(trigger)) this.close(trigger);
    }
    /** Clic hors de tout groupe → tout fermer. */
    onDocumentClick(ev) {
        if (ev.target.closest?.(GROUP)) return;
        this.closeAll();
    }
    onResize() {
        for (const t of this.triggers()) if (this.isOpen(t)) this.position(t, this.panelOf(t));
    }
}

registry
    .category("public.interactions")
    .add("piqueray_ds.sous_menu", PiqueraySousMenu);
// ODOO-031-SOUS-MENU-INTERACTION END
