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

/** Note de l'avis — contrôle `enum` de ds.review-card.note (décision review-note).
 *
 * Les CINQ bandes de ds.notation sont présentes dans le DOM sauvegardé ; cette
 * action ne fait que déplacer le `hidden`. Elle ne construit rien : un bloc Odoo
 * posé est une copie HTML gelée, et une action qui fabriquerait la bande
 * manquante recréerait le défaut mesuré le 2026-08-18 sur la pastille photo —
 * un panneau qui modifie la structure au lieu de la révéler.
 */
export class SetReviewNoteAction extends BuilderAction {
    static id = "pqrSetReviewNote";
    /** Un seul foyer pour la note lue ET son défaut : `isApplied` en dérive,
     * pour qu'un changement de défaut n'ait pas à être écrit deux fois. */
    getValue({ editingElement }) {
        return findCard(editingElement)?.dataset?.note ?? "5";
    }
    isApplied(arg) {
        return this.getValue(arg) === String(arg.params.mainParam);
    }
    apply({ editingElement, params: { mainParam } }) {
        const card = findCard(editingElement);
        const note = String(mainParam);
        if (!card || !["1", "2", "3", "4", "5"].includes(note)) return;
        // La note est persistée UNE fois, sur la carte : les cinq `hidden` en
        // dérivent. Un miroir sur la racine `.notation` n'avait aucun lecteur.
        card.dataset.note = note;
        // UNE traversée : les cinq bandes sont les enfants directs de la racine
        // `.notation`. Cinq `querySelectorAll` successifs re-parcouraient tout
        // le sous-arbre de la notation (~80 nœuds) une fois par valeur.
        for (const bande of card.querySelectorAll("[data-pqr-part='etoiles'] .notation > [data-pqr-part]")) {
            bande.hidden = bande.getAttribute("data-pqr-part") !== `note${note}`;
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

// ODOO-022-REASSURANCES-REPEAT BEGIN
// Collection de cartes ordonnée, sans état JSON parallèle — le DOM sauvegardé est
// la seule source (aucune liste JSON ne survit au premier save). Même patron que
// GoogleReviews/Équipe : Add depuis le blueprint inerte, Remove/Move sur le DOM,
// bornes 0..n. Les gestes NATIFS d'une carte (dupliquer/supprimer/déplacer) sont
// neutralisés par `is_unremovable_selector` sur les descendants (authoring.js).
export const REASSURANCES_ROOT = ".s_pqr_reassurances";
export const CARTE = "[data-pqr-carte]";
export const CARTE_LIST = "[data-pqr-carte-list]";
export const PHOTO_REASSURANCE = ".carte__reassuranceImage";

export const findCarte = (element) => element?.closest?.(CARTE) || null;

export function cartesOf(root) {
    return root ? [...root.querySelectorAll(`${CARTE_LIST} > ${CARTE}`)] : [];
}

export function normalizeCartes(root) {
    for (const [index, carte] of cartesOf(root).entries()) {
        carte.dataset.pqrCarteIndex = String(index);
        if (!carte.dataset.pqrCarteMarker) carte.dataset.pqrCarteMarker = `carte-${index + 1}`;
    }
}

function nextCarteMarker(root) {
    const used = new Set(cartesOf(root).map((carte) => carte.dataset.pqrCarteMarker));
    let index = 1;
    while (used.has(`carte-${index}`)) index += 1;
    return `carte-${index}`;
}

/** Ajoute depuis le blueprint inerte ; l'état vide reste donc ajoutable. */
export function addCarte(root) {
    const list = root?.querySelector(CARTE_LIST);
    const blueprint = root?.querySelector("template[data-pqr-carte-blueprint]");
    const candidate = blueprint?.content?.firstElementChild;
    if (!list || !candidate) throw new Error("[piqueray_ds] blueprint Carte introuvable");
    const carte = candidate.cloneNode(true);
    carte.dataset.pqrCarteMarker = nextCarteMarker(root);
    list.append(carte);
    normalizeCartes(root);
    return carte;
}

export function removeCarte(carte) {
    const root = findCarteRoot(carte);
    if (!root || !carte?.isConnected) return false;
    carte.remove();
    normalizeCartes(root);
    return true;
}

export function moveCarte(carte, direction) {
    const root = findCarteRoot(carte);
    if (!root || !carte?.isConnected) return false;
    if (direction === "up") {
        const previous = carte.previousElementSibling;
        if (!previous?.matches(CARTE)) return false;
        previous.before(carte);
    } else {
        const next = carte.nextElementSibling;
        if (!next?.matches(CARTE)) return false;
        next.after(carte);
    }
    normalizeCartes(root);
    return true;
}

export class AddCarteAction extends BuilderAction {
    static id = "pqrAddCarte";
    apply({ editingElement }) { addCarte(findCarteRoot(editingElement)); }
}

export class RemoveCarteAction extends BuilderAction {
    static id = "pqrRemoveCarte";
    apply({ editingElement }) { removeCarte(findCarte(editingElement)); }
}

export class MoveCarteUpAction extends BuilderAction {
    static id = "pqrMoveCarteUp";
    apply({ editingElement }) { moveCarte(findCarte(editingElement), "up"); }
}

export class MoveCarteDownAction extends BuilderAction {
    static id = "pqrMoveCarteDown";
    apply({ editingElement }) { moveCarte(findCarte(editingElement), "down"); }
}
// ODOO-022-REASSURANCES-REPEAT END

// ODOO-023-CATEGORIES-REPEAT BEGIN
// Collection de cartes-catégories ordonnée, DOM comme seule source (même patron
// que Réassurances/Équipe). La racine categories-principales EST la grille ; le
// hook data-pqr-carte-list est un wrapper display:contents, les cartes restent
// items directs de la grille. Add depuis le blueprint inerte, Remove/Move sur le
// DOM, bornes 0..n. IDENTIFIANTS PROPRES (pqr*CarteCategorie*) : les ids du
// builder sont globaux — réutiliser ceux de Réassurances ferait retomber une
// action sur la mauvaise section. Les sélecteurs génériques CARTE/CARTE_LIST et
// le localisateur findCarte sont partagés (mêmes attributs DOM).
export const CATEGORIES_ROOT = ".s_pqr_categories_principales";
export const PHOTO_CATEGORIE = ".carte-categorie__categorieImage, .carte-categorie__photoSuperpose";

/** La photo d'une carte, quelle que soit sa famille — l'UNION des classes
 *  contractuelles portant une image. Une carte vit sous exactement une section,
 *  donc l'union ne peut pas être ambiguë ; c'est la seule adresse à tenir à jour
 *  quand une famille de cartes gagne un plan image (media_action.js l'importe). */
export const PHOTO_CARTE = `${PHOTO_REASSURANCE}, ${PHOTO_CATEGORIE}`;

export const findCategoriesRoot = (element) => element?.closest?.(CATEGORIES_ROOT) || null;

/** La racine de collection d'une carte, quelle que soit sa famille. Les bornes,
 *  le retrait et le déplacement sont un SEUL geste (mêmes attributs DOM, même
 *  renumérotation) : seule la racine changeait, elle est donc paramétrée ici
 *  plutôt que recopiée par section. */
export const findCarteRoot = (element) =>
    element?.closest?.(`${REASSURANCES_ROOT}, ${CATEGORIES_ROOT}`) || null;

// La collection catégories partage EXACTEMENT le contrat DOM de Réassurances
// (data-pqr-carte / data-pqr-carte-list / clé pqrCarteMarker) : on réutilise donc
// directement cartesOf / normalizeCartes / nextCarteMarker ET les mutations
// removeCarte / moveCarte, dont la racine est paramétrée (findCarteRoot) plutôt
// que recopiée. Seul `addCarteCategorie` reste propre : il choisit son blueprint
// SELON LE STYLE de la section, ce que la version Réassurances ne fait pas. Les
// ids d'action, eux, restent distincts (les ids builder sont globaux — les
// partager ferait retomber une action sur la mauvaise section).

/** Le style COURANT de la section. Il vit sur le parent, jamais sur la carte
 *  (Q-C2 amendée le 2026-08-22) ; toute valeur hors enum retombe sur `empile`. */
export function styleCourant(root) {
    const v = root?.dataset?.pqrStyle;
    return v === "superpose" ? "superpose" : "empile";
}

/** Le blueprint inerte d'un style. Le style empilé garde la clé VIDE (sélecteur
 *  historique, partagé avec Réassurances) ; le superposé a une clé nommée. */
export function blueprintDuStyle(root, style) {
    const cle = style === "superpose" ? '[data-pqr-carte-blueprint="superpose"]' : '[data-pqr-carte-blueprint=""]';
    return root?.querySelector(`template${cle}`)?.content?.firstElementChild || null;
}

/** Ajoute depuis le blueprint inerte DU STYLE COURANT ; l'état vide (section
 *  vidée) reste ajoutable. */
export function addCarteCategorie(root) {
    const list = root?.querySelector(CARTE_LIST);
    const candidate = blueprintDuStyle(root, styleCourant(root));
    if (!list || !candidate) throw new Error("[piqueray_ds] blueprint CarteCategorie introuvable");
    const carte = candidate.cloneNode(true);
    carte.dataset.pqrCarteMarker = nextCarteMarker(root);
    list.append(carte);
    normalizeCartes(root);
    return carte;
}

export class AddCarteCategorieAction extends BuilderAction {
    static id = "pqrAddCarteCategorie";
    apply({ editingElement }) { addCarteCategorie(findCategoriesRoot(editingElement)); }
}

export class RemoveCarteCategorieAction extends BuilderAction {
    static id = "pqrRemoveCarteCategorie";
    apply({ editingElement }) { removeCarte(findCarte(editingElement)); }
}

export class MoveCarteCategorieUpAction extends BuilderAction {
    static id = "pqrMoveCarteCategorieUp";
    apply({ editingElement }) { moveCarte(findCarte(editingElement), "up"); }
}

export class MoveCarteCategorieDownAction extends BuilderAction {
    static id = "pqrMoveCarteCategorieDown";
    apply({ editingElement }) { moveCarte(findCarte(editingElement), "down"); }
}

/** ODOO-023 (amendement du 2026-08-22) — BASCULE DU STYLE DE CARTE.
 *
 *  Les deux styles ne partagent AUCUN nœud : l'empilé est photo + texte +
 *  bouton, le superposé est photo pleine + voile + flèche. Basculer n'est donc
 *  pas un changement de classe, c'est une RECONSTRUCTION de chaque carte depuis
 *  le blueprint du style visé.
 *
 *  Ce qui est reporté : titre, texte, source et texte alternatif de l'image —
 *  les quatre `data-pqr-part` que les deux styles portent sous le MÊME nom.
 *
 *  Ce qui ne peut pas l'être : le CTA, qui n'existe pas côté superposé. Plutôt
 *  que de le perdre (le risque nommé à l'owner avant sa décision), on le MET DE
 *  CÔTÉ sur la racine de la carte (`data-pqr-cta-*`), de sorte qu'un aller-retour
 *  superposé→empilé le restitue à l'identique. L'attribut ne peint rien et ne
 *  survit à rien d'autre qu'à l'instance : ce n'est pas un fait de contrat, c'est
 *  la mémoire d'un geste d'éditeur.
 */
const TEXTE_PARTS = ["carte-title", "carte-text"];

/** La photo de la carte, quel que soit son style. L'adresse d'authoring
 *  (`data-pqr-part`) peut avoir été retirée par le dialogue média qui
 *  reconstruit le nœud ; les classes contractuelles, elles, survivent — même
 *  raisonnement que `carteImage` côté media_action.js. */
function photoDeLaCarte(carte) {
    return carte.querySelector('[data-pqr-part="carte-image"]')
        || carte.querySelector(PHOTO_CATEGORIE);
}

function lireCarte(carte) {
    const etat = { parts: {}, cta: {} };
    for (const nom of TEXTE_PARTS) {
        const noeud = carte.querySelector(`[data-pqr-part="${nom}"]`);
        if (noeud) etat.parts[nom] = noeud.innerHTML;
    }
    const img = photoDeLaCarte(carte);
    if (img) {
        etat.src = img.getAttribute("src");
        etat.alt = img.getAttribute("alt");
    }
    const label = carte.querySelector('[data-pqr-part="button-label"]');
    const ancre = carte.querySelector('[data-pqr-part="button-root"]');
    etat.cta.label = label ? label.innerHTML : carte.dataset.pqrCtaLabel;
    etat.cta.href = ancre ? ancre.getAttribute("href") : carte.dataset.pqrCtaHref;
    return etat;
}

function ecrireCarte(carte, etat) {
    for (const nom of TEXTE_PARTS) {
        const noeud = carte.querySelector(`[data-pqr-part="${nom}"]`);
        if (noeud && etat.parts[nom] !== undefined) noeud.innerHTML = etat.parts[nom];
    }
    const img = photoDeLaCarte(carte);
    if (img) {
        if (etat.src) img.setAttribute("src", etat.src); else img.removeAttribute("src");
        img.setAttribute("alt", etat.alt || "");
    }
    const label = carte.querySelector('[data-pqr-part="button-label"]');
    const ancre = carte.querySelector('[data-pqr-part="button-root"]');
    if (label && etat.cta.label !== undefined && etat.cta.label !== null) label.innerHTML = etat.cta.label;
    if (ancre && etat.cta.href) ancre.setAttribute("href", etat.cta.href);
    // Mise de côté : utile quand la carte visée n'a pas de CTA (superposé).
    if (etat.cta.label !== undefined && etat.cta.label !== null) carte.dataset.pqrCtaLabel = etat.cta.label;
    if (etat.cta.href) carte.dataset.pqrCtaHref = etat.cta.href;
}

/** Bascule TOUTES les cartes de la section vers `style`. Enum FERMÉ : toute
 *  autre valeur est refusée sans toucher au DOM (dégradation au champ). */
export function setStyleCartes(root, style) {
    if (!root) return false;
    if (style !== "empile" && style !== "superpose") return false;
    if (styleCourant(root) === style) return true;
    const candidat = blueprintDuStyle(root, style);
    if (!candidat) throw new Error("[piqueray_ds] blueprint CarteCategorie introuvable pour le style " + style);
    for (const carte of cartesOf(root)) {
        const etat = lireCarte(carte);
        const neuve = candidat.cloneNode(true);
        neuve.dataset.pqrCarteMarker = carte.dataset.pqrCarteMarker || "";
        ecrireCarte(neuve, etat);
        carte.replaceWith(neuve);
    }
    root.dataset.pqrStyle = style;
    normalizeCartes(root);
    return true;
}

export class SetStyleCarteAction extends BuilderAction {
    static id = "pqrSetStyleCarte";
    getValue({ editingElement }) { return styleCourant(findCategoriesRoot(editingElement)); }
    isApplied(arg) { return this.getValue(arg) === String(arg.params.mainParam); }
    apply({ editingElement, params: { mainParam } }) {
        setStyleCartes(findCategoriesRoot(editingElement), String(mainParam));
    }
}
// ODOO-023-CATEGORIES-REPEAT END
