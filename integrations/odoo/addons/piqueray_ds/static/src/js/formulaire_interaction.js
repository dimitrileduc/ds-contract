/**
 * ODOO-036-FORMULAIRE-INTERACTION — les états du formulaire de contact, côté visiteur.
 *
 * Le contrat ds.formulaire 3.0.0 gouverne l APPARENCE des états (props code-only `etat`
 * et `envoye`, parts ResumeErreurs et Succes) ; la MÉCANIQUE d envoi est celle d Odoo
 * (s_website_form, décision owner 2026-09-08, option 2). Cette interaction fait le pont :
 * elle ne valide rien, n envoie rien, n écrit rien — elle OBSERVE ce que form.js d Odoo
 * pose dans le DOM (`o_has_error` / `is-invalid` sur les champs, `#s_website_form_result`
 * en `text-success` ou `text-danger`) et bascule les classes d état du contrat.
 *
 * Même patron que faq_interaction.js : une `Interaction` publique, sans variante `.edit`
 * — dans l éditeur, rien ne bouge.
 */
import { registry } from "@web/core/registry";
import { Interaction } from "@web/public/interaction";

// ODOO-036-FORMULAIRE-INTERACTION BEGIN
export class PiquerayFormulaire extends Interaction {
    static selector = ".s_pqr_formulaire";

    setup() {
        this.form = this.el.querySelector("form.s_website_form");
        this.resume = this.el.querySelector(".formulaire__ResumeErreurs");
        this.succes = this.el.querySelector(".formulaire__Succes");
        // Champ et contrôle résolus UNE fois : le DOM public est figé, et
        // form.js d Odoo ne remplace jamais un champ, il pose des classes dessus.
        this.champs = [...this.el.querySelectorAll(".field")].map((champ) => ({
            champ,
            input: champ.querySelector(".s_website_form_input"),
        }));
    }

    start() {
        if (!this.form) return;
        this.observer = new MutationObserver(() => this.refleter());
        this.observer.observe(this.form, this.constructor.OBSERVE);
        this.registerCleanup(() => this.observer.disconnect());
    }

    static OBSERVE = { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] };

    /** Reflète l état posé par Odoo dans les classes d état du contrat. */
    refleter() {
        // Les classes posées ci-dessous vivent DANS le formulaire observé : sans
        // cette coupure, chaque passe en déclenchait une seconde, à vide.
        this.observer.disconnect();
        try {
            this.appliquer();
        } finally {
            this.observer.observe(this.form, this.constructor.OBSERVE);
        }
    }

    appliquer() {
        // `#s_website_form_result` est REMPLACÉ par Odoo à chaque statut (renderAt
        // afterend + remove) : il se relit à chaque passe, lui.
        const result = this.form.querySelector("#s_website_form_result");
        const enErreur = new Set(
            this.champs
                .filter(({ champ, input }) => champ.classList.contains("o_has_error") || (input && input.classList.contains("is-invalid")))
                .map(({ champ }) => champ),
        );
        const erreur = enErreur.size > 0;
        for (const { champ, input } of this.champs) {
            const bad = enErreur.has(champ);
            champ.classList.toggle("field--etat-erreur", bad);
            champ.classList.toggle("field--etat-normal", !bad);
            // aria-invalid : le contrat le forwarde au contrôle par `control.attributes`
            // (prop etat) ; ici c est l hôte qui porte l état, donc c est lui qui le pose.
            if (input) input.setAttribute("aria-invalid", bad ? "true" : "false");
        }
        this.el.classList.toggle("formulaire--etat-erreur", erreur);
        this.el.classList.toggle("formulaire--etat-normal", !erreur);
        if (this.resume) {
            // Chaque lien du résumé suit SON champ (href="#<id du contrôle>") : après
            // correction d un seul des deux, l autre lien reste, celui-ci disparaît.
            for (const lien of this.resume.querySelectorAll("a[href^='#']")) {
                const cible = this.form.querySelector(lien.getAttribute("href"));
                const champ = cible && cible.closest(".field");
                lien.hidden = !(champ && enErreur.has(champ));
            }
            const etaitCache = this.resume.hidden;
            this.resume.hidden = !erreur;
            // Patron GOV.UK : au retour en erreur, le focus va au résumé (une seule fois).
            if (erreur && etaitCache) this.resume.focus();
        }
        if (result && result.classList.contains("text-success")) {
            // Succès (option B) : Odoo a vidé le formulaire ; sa ligne générique cède la
            // place à la part Succes du contrat, annoncée en role=status.
            result.hidden = true;
            if (this.succes) this.succes.hidden = false;
            this.el.classList.add("formulaire--envoye");
        } else if (result && erreur) {
            // « Merci de remplir correctement le formulaire » : redondant avec le résumé
            // et les messages par champ — les nôtres disent QUOI corriger.
            result.hidden = true;
        }
        // Une erreur SERVEUR (text-danger sans champ fautif) garde le message d Odoo :
        // c est le seul cas où il dit quelque chose que le contrat ne sait pas.
    }
}

registry
    .category("public.interactions")
    .add("piqueray_ds.formulaire", PiquerayFormulaire);
// ODOO-036-FORMULAIRE-INTERACTION END
