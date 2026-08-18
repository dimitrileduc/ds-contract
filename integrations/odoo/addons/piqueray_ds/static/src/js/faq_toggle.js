/**
 * ODOO-019-FAQ-TOGGLE — la bascule fermé/ouvert d'une rangée FAQ, en fonctions
 * pures partagées entre le site public (faq_interaction.js) et l'éditeur
 * (PqrToggleFaqRowAction dans repeat_action.js).
 *
 * ── Pourquoi le DOM porte les DEUX plans ────────────────────────────────────
 * Le rendu de référence (`emitHtml`) omet du DOM les parts dont le visibleWhen
 * n'est pas satisfait : une rangée fermée n'y contient ni chevron haut ni
 * réponse. Un HTML sauvegardé par Odoo ne se re-rend jamais : si la réponse
 * n'était pas dans le DOM posé, ni le rédacteur ni le visiteur ne pourraient
 * jamais la voir. Le QWeb pose donc les deux plans, le plan inactif portant
 * `hidden` (résolu par `.s_pqr_faq [hidden]` dans odoo-bridge.css, car les
 * classes générées posent des `display` plus spécifiques que la règle UA).
 *
 * ── Ce que la bascule tient ensemble ────────────────────────────────────────
 * classe d'état (le layout row/column vient du CSS généré) · `hidden` des deux
 * chevrons et de la réponse · `aria-expanded` du déclencheur · `aria-label` du
 * déclencheur resynchronisé sur le titre courant (le titre est éditable, le
 * déclencheur ne l'est pas).
 */

// ODOO-019-FAQ-TOGGLE BEGIN
export const FAQ_ROOT = ".s_pqr_faq";
export const FAQ_ROW = "[data-pqr-faq-row]";
export const FAQ_LIST = "[data-pqr-faq-list]";

const OPEN_CLASS = "accordion-row--etat-ouvert";
const CLOSED_CLASS = "accordion-row--etat-ferme";

export const findFaqRoot = (element) => element?.closest?.(FAQ_ROOT) || null;
export const findFaqRow = (element) => element?.closest?.(FAQ_ROW) || null;

export function isFaqRowOpen(row) {
    return Boolean(row?.classList?.contains(OPEN_CLASS));
}

/** Applique un état complet — jamais une moitié de bascule. */
export function setFaqRowState(row, open) {
    if (!row) return;
    row.classList.toggle(OPEN_CLASS, open);
    row.classList.toggle(CLOSED_CLASS, !open);
    const chevronDown = row.querySelector('[data-pqr-part="chevron-down"]');
    const chevronUp = row.querySelector('[data-pqr-part="chevron-up"]');
    const contenu = row.querySelector('[data-pqr-part="contenu"]');
    if (chevronDown) chevronDown.hidden = open;
    if (chevronUp) chevronUp.hidden = !open;
    if (contenu) contenu.hidden = !open;
    const trigger = row.querySelector('[data-pqr-part="trigger"]');
    if (trigger) {
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
        const titre = row.querySelector('[data-pqr-part="titre"]');
        const label = titre?.textContent?.trim();
        if (label) trigger.setAttribute("aria-label", label);
    }
}

export function toggleFaqRow(row) {
    setFaqRowState(row, !isFaqRowOpen(row));
}
// ODOO-019-FAQ-TOGGLE END
