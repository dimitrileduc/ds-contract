/**
 * ODOO-019-TEXTE-SEO-INTERACTION — le dépliage public du Texte SEO.
 *
 * Même patron que la FAQ (`faq_interaction.js`) : une `Interaction` de
 * `registry.category("public.interactions")` s'exécute chez le visiteur ; en
 * mode édition le service d'édition ne l'active pas, le geste équivalent passe
 * par le panneau (`pqrToggleTexteSeoRow`).
 *
 * La mécanique d'état (classes `accordion-row--etat-*`, `hidden` des deux
 * plans, aria) est IMPORTÉE de `faq_toggle.js` : c'est le mécanisme accordéon
 * partagé de l'addon, écrit une fois — seule l'adresse des rangées diffère
 * (`[data-pqr-accordion-row]` ici, `[data-pqr-faq-row]` côté FAQ).
 */
import { registry } from "@web/core/registry";
import { Interaction } from "@web/public/interaction";
import { isFaqRowOpen, setFaqRowState } from "./faq_toggle";

// ODOO-019-TEXTE-SEO-INTERACTION BEGIN
export class PiquerayTexteSeoAccordion extends Interaction {
    static selector = ".s_pqr_texte_seo";
    dynamicContent = {
        _root: {
            "t-on-click": this.onClick,
        },
    };

    /** @param {MouseEvent} ev */
    onClick(ev) {
        const trigger = ev.target.closest?.('[data-pqr-part="trigger"]');
        if (!trigger || !this.el.contains(trigger)) return;
        const row = trigger.closest("[data-pqr-accordion-row]");
        if (!row) return;
        ev.preventDefault();
        setFaqRowState(row, !isFaqRowOpen(row));
    }
}

registry
    .category("public.interactions")
    .add("piqueray_ds.texte_seo_accordion", PiquerayTexteSeoAccordion);
// ODOO-019-TEXTE-SEO-INTERACTION END
