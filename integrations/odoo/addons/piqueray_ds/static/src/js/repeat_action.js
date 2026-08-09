/**
 * ODOO-019-GOOGLE-REVIEWS-REPEAT — collection DOM ordonnée sans état JSON.
 * Les BuilderAction sont exécutées dans l'opération Odoo; son historique ajoute
 * donc une étape après chaque mutation, et Odoo persiste le DOM lui-même.
 */
import { BuilderAction } from "./odoo19_compat";

// ODOO-019-GOOGLE-REVIEWS-REPEAT BEGIN
export const REVIEW_ROOT = ".s_pqr_google_reviews";
export const REVIEW_CARD = "[data-pqr-review-card]";
export const REVIEW_LIST = "[data-pqr-review-list]";

export const findRoot = (element) => element?.closest?.(REVIEW_ROOT) || null;
export const findCard = (element) => element?.closest?.(REVIEW_CARD) || null;

export function cardsOf(root) {
    return root ? [...root.querySelectorAll(`${REVIEW_LIST} > ${REVIEW_CARD}`)] : [];
}

export function normalizeReviewCards(root) {
    for (const [index, card] of cardsOf(root).entries()) {
        card.dataset.pqrReviewIndex = String(index);
        if (!card.dataset.pqrReviewMarker) card.dataset.pqrReviewMarker = `review-${index + 1}`;
    }
}

function nextMarker(root) {
    const used = new Set(cardsOf(root).map((card) => card.dataset.pqrReviewMarker));
    let index = 1;
    while (used.has(`review-${index}`)) index += 1;
    return `review-${index}`;
}

/** Ajoute depuis le blueprint inerte; l'état vide reste donc ajoutable. */
export function addReview(root) {
    const list = root?.querySelector(REVIEW_LIST);
    const blueprint = root?.querySelector("template[data-pqr-review-blueprint]");
    const candidate = blueprint?.content?.firstElementChild;
    if (!list || !candidate) throw new Error("[piqueray_ds] blueprint ReviewCard introuvable");
    const card = candidate.cloneNode(true);
    card.dataset.pqrReviewMarker = nextMarker(root);
    list.append(card);
    normalizeReviewCards(root);
    return card;
}

export function removeReview(card) {
    const root = findRoot(card);
    if (!root || !card?.isConnected) return false;
    card.remove();
    normalizeReviewCards(root);
    return true;
}

export function moveReview(card, direction) {
    const root = findRoot(card);
    if (!root || !card?.isConnected) return false;
    if (direction === "up") {
        const previous = card.previousElementSibling;
        if (!previous?.matches(REVIEW_CARD)) return false;
        previous.before(card);
    } else {
        const next = card.nextElementSibling;
        if (!next?.matches(REVIEW_CARD)) return false;
        next.after(card);
    }
    normalizeReviewCards(root);
    return true;
}

export class AddReviewAction extends BuilderAction {
    static id = "pqrAddReview";
    apply({ editingElement }) { addReview(findRoot(editingElement)); }
}

export class RemoveReviewAction extends BuilderAction {
    static id = "pqrRemoveReview";
    apply({ editingElement }) { removeReview(findCard(editingElement)); }
}

export class MoveReviewUpAction extends BuilderAction {
    static id = "pqrMoveReviewUp";
    apply({ editingElement }) { moveReview(findCard(editingElement), "up"); }
}

export class MoveReviewDownAction extends BuilderAction {
    static id = "pqrMoveReviewDown";
    apply({ editingElement }) { moveReview(findCard(editingElement), "down"); }
}

/** Les booléens restent indépendants : photo et initiale ne forment pas un enum. */
export class SetReviewBooleanAction extends BuilderAction {
    static id = "pqrSetReviewBoolean";
    // BuilderCheckbox consulte `isApplied` (et non `getValue`, réservé aux
    // champs de saisie) pour initialiser son état. Garder cette lecture sur la
    // carte sélectionnée évite qu'un booléen d'une autre instance colore le
    // panneau courant.
    isApplied({ editingElement, params: { mainParam } }) {
        return findCard(editingElement)?.dataset?.[mainParam] === "true";
    }
    apply({ editingElement, params: { mainParam } }) {
        const card = findCard(editingElement);
        if (!card || !["tronque", "initialeVisible", "photo", "verifie"].includes(mainParam)) return;
        // Ces contrôles sont tous des bascules. Après un remount de panneau,
        // le widget Checkbox peut encore afficher son ancien état; le DOM de
        // la carte est la source sauvegardée, donc c'est lui qui décide du
        // prochain état plutôt qu'une valeur visuelle périmée.
        const value = card.dataset[mainParam] !== "true";
        card.dataset[mainParam] = value ? "true" : "false";
        const map = {
            tronque: "[data-pqr-part='lire-la-suite']",
            initialeVisible: "[data-pqr-part='avatar-initiale']",
            verifie: "[data-pqr-part='verification']",
        };
        const target = map[mainParam];
        if (target) for (const el of card.querySelectorAll(target)) el.hidden = !value;
        if (mainParam === "photo") {
            const photo = card.querySelector("[data-pqr-part='avatar-photo']");
            const image = photo?.querySelector("img");
            // « Afficher photo » ne peut pas matérialiser une image incomplète.
            // Une carte sans source/alt reste repliée; une image complète garde
            // la bascule indépendante de l'initiale.
            const complete = Boolean(image?.getAttribute("src")) && Boolean(image?.getAttribute("alt")?.trim());
            const visible = value && complete;
            card.dataset.photo = visible ? "true" : "false";
            if (photo) photo.hidden = !visible;
        }
    }
}
// ODOO-019-GOOGLE-REVIEWS-REPEAT END
