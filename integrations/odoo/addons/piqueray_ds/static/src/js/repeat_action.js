/**
 * ODOO-019-GOOGLE-REVIEWS-REPEAT — collection DOM ordonnée sans état JSON.
 * Les BuilderAction sont exécutées dans l'opération Odoo; son historique ajoute
 * donc une étape après chaque mutation, et Odoo persiste le DOM lui-même.
 */
import { BuilderAction } from "./odoo19_compat";
import { isFaqRowOpen, setFaqRowState, toggleFaqRow } from "./faq_toggle";

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

// ODOO-019-EQUIPE-REPEAT BEGIN
export const MEMBER_ROOT = ".s_pqr_equipe";
export const MEMBER_CARD = "[data-pqr-member-card]";
export const MEMBER_LIST = "[data-pqr-member-list]";

export const findMemberRoot = (element) => element?.closest?.(MEMBER_ROOT) || null;
export const findMemberCard = (element) => element?.closest?.(MEMBER_CARD) || null;

export function membersOf(root) {
    return root ? [...root.querySelectorAll(`${MEMBER_LIST} > ${MEMBER_CARD}`)] : [];
}

export function normalizeMemberCards(root) {
    for (const [index, card] of membersOf(root).entries()) {
        card.dataset.pqrMemberIndex = String(index);
        if (!card.dataset.pqrMemberMarker) card.dataset.pqrMemberMarker = `member-${index + 1}`;
    }
}

function nextMemberMarker(root) {
    const used = new Set(membersOf(root).map((card) => card.dataset.pqrMemberMarker));
    let index = 1;
    while (used.has(`member-${index}`)) index += 1;
    return `member-${index}`;
}

export function addMember(root) {
    const list = root?.querySelector(MEMBER_LIST);
    const blueprint = root?.querySelector("template[data-pqr-member-blueprint]");
    const candidate = blueprint?.content?.firstElementChild;
    if (!list || !candidate) throw new Error("[piqueray_ds] blueprint MemberCard introuvable");
    const card = candidate.cloneNode(true);
    card.dataset.pqrMemberMarker = nextMemberMarker(root);
    list.append(card);
    normalizeMemberCards(root);
    return card;
}

export function removeMember(card) {
    const root = findMemberRoot(card);
    if (!root || !card?.isConnected) return false;
    card.remove();
    normalizeMemberCards(root);
    return true;
}

export function moveMember(card, direction) {
    const root = findMemberRoot(card);
    if (!root || !card?.isConnected) return false;
    if (direction === "up") {
        const previous = card.previousElementSibling;
        if (!previous?.matches(MEMBER_CARD)) return false;
        previous.before(card);
    } else {
        const next = card.nextElementSibling;
        if (!next?.matches(MEMBER_CARD)) return false;
        next.after(card);
    }
    normalizeMemberCards(root);
    return true;
}

export class AddMemberAction extends BuilderAction {
    static id = "pqrAddMember";
    apply({ editingElement }) { addMember(findMemberRoot(editingElement)); }
}

export class RemoveMemberAction extends BuilderAction {
    static id = "pqrRemoveMember";
    apply({ editingElement }) { removeMember(findMemberCard(editingElement)); }
}

export class MoveMemberUpAction extends BuilderAction {
    static id = "pqrMoveMemberUp";
    apply({ editingElement }) { moveMember(findMemberCard(editingElement), "up"); }
}

export class MoveMemberDownAction extends BuilderAction {
    static id = "pqrMoveMemberDown";
    apply({ editingElement }) { moveMember(findMemberCard(editingElement), "down"); }
}
// ODOO-019-EQUIPE-REPEAT END

// ODOO-019-FAQ-REPEAT BEGIN
export const FAQ_ROOT = ".s_pqr_faq";
export const FAQ_ROW = "[data-pqr-faq-row]";
export const FAQ_LIST = "[data-pqr-faq-list]";

export const findFaqRoot = (element) => element?.closest?.(FAQ_ROOT) || null;
export const findFaqRow = (element) => element?.closest?.(FAQ_ROW) || null;

export function faqRowsOf(root) {
    return root ? [...root.querySelectorAll(`${FAQ_LIST} > ${FAQ_ROW}`)] : [];
}

export function normalizeFaqRows(root) {
    for (const [index, row] of faqRowsOf(root).entries()) {
        row.dataset.pqrFaqIndex = String(index);
        if (!row.dataset.pqrFaqMarker) row.dataset.pqrFaqMarker = `faq-${index + 1}`;
    }
}

function nextFaqMarker(root) {
    const used = new Set(faqRowsOf(root).map((row) => row.dataset.pqrFaqMarker));
    let index = 1;
    while (used.has(`faq-${index}`)) index += 1;
    return `faq-${index}`;
}

/** Ajoute depuis le blueprint inerte, toujours en état FERMÉ. */
export function addFaqRow(root) {
    const list = root?.querySelector(FAQ_LIST);
    const blueprint = root?.querySelector("template[data-pqr-faq-blueprint]");
    const candidate = blueprint?.content?.firstElementChild;
    if (!list || !candidate) throw new Error("[piqueray_ds] blueprint AccordionRow introuvable");
    const row = candidate.cloneNode(true);
    row.dataset.pqrFaqMarker = nextFaqMarker(root);
    setFaqRowState(row, false);
    list.append(row);
    normalizeFaqRows(root);
    return row;
}

export function removeFaqRow(row) {
    const root = findFaqRoot(row);
    if (!root || !row?.isConnected) return false;
    row.remove();
    normalizeFaqRows(root);
    return true;
}

export function moveFaqRow(row, direction) {
    const root = findFaqRoot(row);
    if (!root || !row?.isConnected) return false;
    if (direction === "up") {
        const previous = row.previousElementSibling;
        if (!previous?.matches(FAQ_ROW)) return false;
        previous.before(row);
    } else {
        const next = row.nextElementSibling;
        if (!next?.matches(FAQ_ROW)) return false;
        next.after(row);
    }
    normalizeFaqRows(root);
    return true;
}

export class AddFaqRowAction extends BuilderAction {
    static id = "pqrAddFaqRow";
    apply({ editingElement }) { addFaqRow(findFaqRoot(editingElement)); }
}

export class RemoveFaqRowAction extends BuilderAction {
    static id = "pqrRemoveFaqRow";
    apply({ editingElement }) { removeFaqRow(findFaqRow(editingElement)); }
}

export class MoveFaqRowUpAction extends BuilderAction {
    static id = "pqrMoveFaqRowUp";
    apply({ editingElement }) { moveFaqRow(findFaqRow(editingElement), "up"); }
}

export class MoveFaqRowDownAction extends BuilderAction {
    static id = "pqrMoveFaqRowDown";
    apply({ editingElement }) { moveFaqRow(findFaqRow(editingElement), "down"); }
}

/** Bascule éditeur : le même geste DOM que le site public (faq_toggle.js) —
 *  l'interaction publique ne tourne pas dans l'iframe d'édition, le panneau
 *  est donc le seul chemin d'ouverture pendant l'édition. L'état affiché est
 *  celui qui sera sauvegardé : une rangée laissée ouverte se pose ouverte. */
export class ToggleFaqRowAction extends BuilderAction {
    static id = "pqrToggleFaqRow";
    isApplied({ editingElement }) {
        return isFaqRowOpen(findFaqRow(editingElement));
    }
    apply({ editingElement }) { toggleFaqRow(findFaqRow(editingElement)); }
}
// ODOO-019-FAQ-REPEAT END

// ODOO-019-TEXTE-SEO-REPEAT BEGIN
/** La mécanique d'état des rangées (classes, `hidden`, aria) est le mécanisme
 *  accordéon PARTAGÉ de l'addon, importé de `faq_toggle.js` — seule l'adresse
 *  des rangées diffère. */
export const TEXTE_SEO_ROOT = ".s_pqr_texte_seo";
export const TEXTE_SEO_ROW = "[data-pqr-accordion-row]";
export const TEXTE_SEO_LIST = "[data-pqr-accordion-list]";

export const findTexteSeoRoot = (element) => element?.closest?.(TEXTE_SEO_ROOT) || null;
export const findTexteSeoRow = (element) => element?.closest?.(TEXTE_SEO_ROW) || null;

export function texteSeoRowsOf(root) {
    return root ? [...root.querySelectorAll(`${TEXTE_SEO_LIST} > ${TEXTE_SEO_ROW}`)] : [];
}

export function normalizeTexteSeoRows(root) {
    for (const [index, row] of texteSeoRowsOf(root).entries()) {
        row.dataset.pqrSeoIndex = String(index);
        if (!row.dataset.pqrSeoMarker) row.dataset.pqrSeoMarker = `row-${index + 1}`;
    }
}

function nextTexteSeoMarker(root) {
    const used = new Set(texteSeoRowsOf(root).map((row) => row.dataset.pqrSeoMarker));
    let index = 1;
    while (used.has(`row-${index}`)) index += 1;
    return `row-${index}`;
}

/** Ajoute depuis le blueprint inerte, toujours en état FERMÉ. */
export function addTexteSeoRow(root) {
    const list = root?.querySelector(TEXTE_SEO_LIST);
    const blueprint = root?.querySelector("template[data-pqr-accordion-blueprint]");
    const candidate = blueprint?.content?.firstElementChild;
    if (!list || !candidate) throw new Error("[piqueray_ds] blueprint TexteSEO introuvable");
    const row = candidate.cloneNode(true);
    row.dataset.pqrSeoMarker = nextTexteSeoMarker(root);
    setFaqRowState(row, false);
    list.append(row);
    normalizeTexteSeoRows(root);
    return row;
}

export function removeTexteSeoRow(row) {
    const root = findTexteSeoRoot(row);
    if (!root || !row?.isConnected) return false;
    row.remove();
    normalizeTexteSeoRows(root);
    return true;
}

export function moveTexteSeoRow(row, direction) {
    const root = findTexteSeoRoot(row);
    if (!root || !row?.isConnected) return false;
    if (direction === "up") {
        const previous = row.previousElementSibling;
        if (!previous?.matches(TEXTE_SEO_ROW)) return false;
        previous.before(row);
    } else {
        const next = row.nextElementSibling;
        if (!next?.matches(TEXTE_SEO_ROW)) return false;
        next.after(row);
    }
    normalizeTexteSeoRows(root);
    return true;
}

export class AddTexteSeoRowAction extends BuilderAction {
    static id = "pqrAddTexteSeoRow";
    apply({ editingElement }) { addTexteSeoRow(findTexteSeoRoot(editingElement)); }
}

export class RemoveTexteSeoRowAction extends BuilderAction {
    static id = "pqrRemoveTexteSeoRow";
    apply({ editingElement }) { removeTexteSeoRow(findTexteSeoRow(editingElement)); }
}

export class MoveTexteSeoRowUpAction extends BuilderAction {
    static id = "pqrMoveTexteSeoRowUp";
    apply({ editingElement }) { moveTexteSeoRow(findTexteSeoRow(editingElement), "up"); }
}

export class MoveTexteSeoRowDownAction extends BuilderAction {
    static id = "pqrMoveTexteSeoRowDown";
    apply({ editingElement }) { moveTexteSeoRow(findTexteSeoRow(editingElement), "down"); }
}

/** Bascule éditeur « Ouverte au chargement » : le même geste DOM que le site
 *  public — l'état affiché est celui qui sera sauvegardé ; une rangée laissée
 *  ouverte se pose ouverte au chargement de la page publique. */
export class ToggleTexteSeoRowAction extends BuilderAction {
    static id = "pqrToggleTexteSeoRow";
    isApplied({ editingElement }) {
        return isFaqRowOpen(findTexteSeoRow(editingElement));
    }
    apply({ editingElement }) { toggleFaqRow(findTexteSeoRow(editingElement)); }
}
// ODOO-019-TEXTE-SEO-REPEAT END
