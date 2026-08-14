/**
 * ODOO-019-FAQ-INTERACTION — le dépliage public de la FAQ.
 *
 * Patron lu dans le noyau 19 (`website/static/src/interactions/_example.js`,
 * `ripple_effect.js`) : une `Interaction` de `registry.category("public.interactions")`
 * s'exécute chez le visiteur ; en mode édition, le service d'édition remplace
 * les interactions publiques par leurs variantes `.edit` — il n'en existe pas
 * ici, donc AUCUNE bascule sauvage pendant l'édition. Dans l'éditeur, le geste
 * équivalent passe par le panneau (PqrToggleFaqRowAction).
 *
 * Délégation sur la racine plutôt qu'un listener par rangée : les rangées sont
 * clonées/supprimées par la collection du builder, et un DOM sauvegardé ne
 * doit exiger aucun re-binding pour rester fonctionnel.
 */
import { registry } from "@web/core/registry";
import { Interaction } from "@web/public/interaction";
import { findFaqRow, toggleFaqRow } from "./faq_toggle";

// ODOO-019-FAQ-INTERACTION BEGIN
export class PiquerayFaqAccordion extends Interaction {
    static selector = ".s_pqr_faq";
    dynamicContent = {
        _root: {
            "t-on-click": this.onClick,
        },
    };

    /** @param {MouseEvent} ev */
    onClick(ev) {
        const trigger = ev.target.closest?.('[data-pqr-part="trigger"]');
        if (!trigger || !this.el.contains(trigger)) return;
        const row = findFaqRow(trigger);
        if (!row) return;
        ev.preventDefault();
        toggleFaqRow(row);
    }
}

registry
    .category("public.interactions")
    .add("piqueray_ds.faq_accordion", PiquerayFaqAccordion);
// ODOO-019-FAQ-INTERACTION END
