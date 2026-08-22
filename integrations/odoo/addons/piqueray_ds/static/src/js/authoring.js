/**
 * ODOO-019-AUTHORING — la politique d'éditabilité : fermer les racines, rouvrir
 * NOMMÉMENT les seules parts autorisées. Spec 019, tâche T019.
 *
 * ── Le mécanisme, et pourquoi celui-ci ──────────────────────────────────────
 * Lu dans le noyau (voir `odoo19_compat.js`) : `section > .container` est un
 * sélecteur d'ouverture du noyau. Le montage à balisage seul de 018 posait un
 * `.container` pour rendre son texte éditable, et ouvrait donc TOUT le
 * sous-arbre. Ce n'était pas un bug d'Odoo : c'était la règle — et 018 l'a
 * ensuite corrigé avec exactement le mécanisme repris ici, mesuré 7/7.
 * Voir `specs/019-odoo-production-foundation/proofs/correction-premisse-018.md` (2026-08-08).
 *
 * Ici, aucun `.container`. Les racines sont fermées, et chaque part autorisée
 * est rouverte par son sélecteur propre, root-scopé.
 *
 * ── Prouvé une fois ailleurs, PAS ENCORE ICI ────────────────────────────────
 * Ce mécanisme a tenu 7/7 dans 018 sur un seul bloc. Il n'est donc pas candidat
 * au sens de « jamais vu marcher » — il est NON REPRODUIT dans cet addon. Tant
 * que `proofs/editability-boundary.json` (T020/T020b) n'a pas tranché sur une
 * instance réelle, aucune phrase de FR-009 / FR-010 ne peut s'appuyer dessus.
 * Si le spike échoue, la limite est écrite dans `proofs/limits.json` AVANT tout
 * claim — jamais réputée tenue.
 *
 * ── Provisoire, et dit comme tel ────────────────────────────────────────────
 * Les listes ci-dessous sont écrites à la main pour le spike. Elles seront
 * DÉRIVÉES des configs d'authoring (`integrations/odoo/config/*.authoring.json`)
 * par T032 et T046 — la config est la source des verdicts, pas ce fichier.
 * Toute divergence entre les deux est un défaut, pas une nuance.
 */
import {
    Plugin,
    BaseOptionComponent,
    BuilderAction,
    registry,
    DISABLED_NAMESPACE,
    closestElement,
    assertOdoo19Environment,
    excludeNativeImageOptionsForRoots,
    excludeNativeOptionsForRoots,
    excludeUndeclaredTopActionsForRoots,
    governResizeForRoots,
    withSequence,
} from "./odoo19_compat";
import {
    AddFaqRowAction,
    AddMemberAction,
    AddReviewAction,
    MoveFaqRowDownAction,
    MoveFaqRowUpAction,
    MoveMemberDownAction,
    MoveMemberUpAction,
    MoveReviewDownAction,
    MoveReviewUpAction,
    RemoveFaqRowAction,
    RemoveMemberAction,
    RemoveReviewAction,
    SetReviewNoteAction,
    ToggleFaqRowAction,
    AddTexteSeoRowAction,
    MoveTexteSeoRowDownAction,
    MoveTexteSeoRowUpAction,
    RemoveTexteSeoRowAction,
    ToggleTexteSeoRowAction,
    AddCarteAction,
    RemoveCarteAction,
    MoveCarteUpAction,
    MoveCarteDownAction,
    AddCarteCategorieAction,
    RemoveCarteCategorieAction,
    MoveCarteCategorieUpAction,
    MoveCarteCategorieDownAction,
    SetStyleCarteAction,
    findCategoriesRoot,
} from "./repeat_action";
import {
    ReplaceCarteImageAction,
    SetCarteImageAltAction,
    ReplaceCarteCategorieImageAction,
    SetCarteCategorieImageAltAction,
    ReplaceDevisBackgroundAction,
    ReplaceMemberPortraitAction,
    ReplaceHeroBackgroundAction,
    ReplaceReviewAvatarAction,
    SetMemberPortraitAltAction,
    SetHeroBackgroundAltAction,
    SetDevisBackgroundAltAction,
    SetReviewAvatarAltAction,
    ReplaceSavBackgroundAction,
    ReplaceSavPhotoAction,
    SetSavBackgroundAltAction,
    SetSavPhotoAltAction,
} from "./media_action";

// ODOO-019-AUTHORING-ROOTS BEGIN
/** Les seules racines posables. Fermées par défaut, sans exception.
 *  Wave B (spec 022) ajoute `.s_pqr_coordonnees` (US1) et `.s_pqr_reassurances`
 *  (US2). Spec 023 ajoute `.s_pqr_categories_principales`. */
export const PIQUERAY_ROOTS = [".s_pqr_presentation", ".s_pqr_google_reviews", ".s_pqr_hero", ".s_pqr_equipe", ".s_pqr_faq", ".s_pqr_devis", ".s_pqr_sav", ".s_pqr_texte_seo", ".s_pqr_coordonnees", ".s_pqr_reassurances", ".s_pqr_categories_principales"];
export const PIQUERAY_ROOT_SELECTOR = PIQUERAY_ROOTS.join(", ");
export const PIQUERAY_LOCKED_DESCENDANTS = PIQUERAY_ROOTS.map((root) => `${root} *`).join(", ");
export const PIQUERAY_PLAIN_TEXT = PIQUERAY_ROOTS.map(
    (root) => `${root} [data-pqr-marks=""]`,
).join(", ");

/** Décisions T026 transcrites en sélecteurs de la seule racine US2. Garder la
 * liste explicite évite qu'une nouvelle part devienne éditable par accident. */
export const GOOGLE_REVIEWS_EDITABLE_PARTS = [
    "[data-pqr-part=\"note-globale\"]",
    "[data-pqr-part=\"qualificatif\"]",
    "[data-pqr-part=\"volume\"]",
    "[data-pqr-review-card] [data-pqr-part=\"auteur\"]",
    "[data-pqr-review-card] [data-pqr-part=\"initiale\"]",
    "[data-pqr-review-card] [data-pqr-part=\"date\"]",
    "[data-pqr-review-card] [data-pqr-part=\"temoignage\"]",
].map((part) => `.s_pqr_google_reviews ${part}`);
export const GOOGLE_REVIEWS_RICH_TEXT =
    '.s_pqr_google_reviews [data-pqr-review-card] [data-pqr-part="temoignage"]';
export const PRESENTATION_EDITABLE_PARTS = [
    '[data-pqr-part="presentation-title"]',
    '[data-pqr-part="presentation-text"]',
    '[data-pqr-part="presentation-cta"] [data-pqr-part="button-label"]',
].map((part) => `.s_pqr_presentation ${part}`);
export const PRESENTATION_RICH_TEXT =
    '.s_pqr_presentation [data-pqr-part="presentation-title"], .s_pqr_presentation [data-pqr-part="presentation-text"]';
export const HERO_EDITABLE_PARTS = [
    '[data-pqr-part="hero-title"]',
    '[data-pqr-part="hero-subtitle"]',
    '[data-pqr-part="hero-cta"] [data-pqr-part="button-label"]',
].map((part) => `.s_pqr_hero ${part}`);
export const HERO_RICH_TEXT =
    '.s_pqr_hero [data-pqr-part="hero-title"], .s_pqr_hero [data-pqr-part="hero-subtitle"]';
export const EQUIPE_EDITABLE_PARTS = [
    '[data-pqr-member-card] [data-pqr-part="member-name"]',
    '[data-pqr-member-card] [data-pqr-part="member-role"]',
].map((part) => `.s_pqr_equipe ${part}`);
export const FAQ_EDITABLE_PARTS = [
    '[data-pqr-part="faq-title"]',
    '[data-pqr-faq-row] [data-pqr-part="titre"]',
    '[data-pqr-faq-row] [data-pqr-part="contenu"]',
    '[data-pqr-part="faq-cta"] [data-pqr-part="button-label"]',
].map((part) => `.s_pqr_faq ${part}`);
export const FAQ_RICH_TEXT =
    '.s_pqr_faq [data-pqr-part="faq-title"], .s_pqr_faq [data-pqr-faq-row] [data-pqr-part="contenu"]';
export const DEVIS_EDITABLE_PARTS = [
    '[data-pqr-part="devis-title"]',
    '[data-pqr-part="devis-cta"] [data-pqr-part="button-label"]',
].map((part) => `.s_pqr_devis ${part}`);
export const SAV_EDITABLE_PARTS = [
    '[data-pqr-part="sav-title"]',
    '[data-pqr-part="sav-text"]',
    '[data-pqr-part="sav-cta"] [data-pqr-part="button-label"]',
].map((part) => `.s_pqr_sav ${part}`);
export const SAV_RICH_TEXT =
    '.s_pqr_sav [data-pqr-part="sav-title"], .s_pqr_sav [data-pqr-part="sav-text"]';
export const TEXTE_SEO_EDITABLE_PARTS = [
    '[data-pqr-part="texte-seo-title"]',
    '[data-pqr-part="texte-seo-text"]',
    '[data-pqr-part="texte-seo-subtitle"]',
    '[data-pqr-accordion-row] [data-pqr-part="titre"]',
    '[data-pqr-accordion-row] [data-pqr-part="contenu"]',
].map((part) => `.s_pqr_texte_seo ${part}`);
export const TEXTE_SEO_RICH_TEXT =
    '.s_pqr_texte_seo [data-pqr-part="texte-seo-title"]';
/** ODOO-022 (US1) — Coordonnées, périmètre RESSERRÉ (retour au gate 2026-08-20,
 *  owner) : le rédacteur édite le contenu, PAS la structure. Sont éditables : le
 *  titre (rich `strong`), les VALEURS Adresse/Horaires, et le bloc Tél/Email
 *  (liens). Sont VERROUILLÉS (fixés par composition) : l'accroche « Contact » et
 *  les 4 étiquettes de champ (Adresse, Horaires, Contact, Suivez-nous) — ce sont
 *  des libellés de structure, identiques d'un site à l'autre. */
export const COORDONNEES_EDITABLE_PARTS = [
    '[data-pqr-part="coordonnees-title"]',
    '[data-pqr-part="coordonnees-address-value"]',
    '[data-pqr-part="coordonnees-hours-value"]',
    '[data-pqr-part="coordonnees-contact-block"]',
].map((part) => `.s_pqr_coordonnees ${part}`);
/** Seul le titre porte la marque `strong` (bouton Gras). */
export const COORDONNEES_RICH_TEXT =
    '.s_pqr_coordonnees [data-pqr-part="coordonnees-title"]';
/** Barre d'outils ALIGNÉE sur l'allowlist du save : ces zones n'exposent AUCUN
 *  bouton de mise en forme. Les valeurs Adresse/Horaires sont du texte simple
 *  (retour à la ligne à la touche Entrée) ; le bloc Tél/Email n'autorise que les
 *  liens — édités via le popover natif de lien, pas via une barre de formatage.
 *  Sans ça, Odoo montrait la barre native complète (gras, italique, couleurs…)
 *  alors que le garde retire tout au save — des boutons qui ne « collent » pas. */
export const COORDONNEES_NO_FORMAT = [
    '[data-pqr-part="coordonnees-address-value"]',
    '[data-pqr-part="coordonnees-hours-value"]',
    '[data-pqr-part="coordonnees-contact-block"]',
].map((part) => `.s_pqr_coordonnees ${part}`).join(", ");
/** VERROU DUR des textes de structure. Quand une VALEUR (span inline) est
 *  rouverte, Odoo rend son bloc PARENT `contenteditable` pour l'héberger — et
 *  l'étiquette voisine hérite alors de l'éditabilité. On déclare donc ces textes
 *  explicitement non-éditables (contenteditable=false), ce qui prime sur l'héritage.
 *  Scopé à Coordonnées : l'accroche « Contact » + les 4 étiquettes de champ. */
export const COORDONNEES_LOCKED_TEXT = [
    '[data-pqr-part="section-header-eyebrow"]',
    '[data-pqr-part="coordonnees-address-label"]',
    '[data-pqr-part="coordonnees-hours-label"]',
    '[data-pqr-part="coordonnees-contact-label"]',
    '[data-pqr-part="coordonnees-social-label"]',
].map((part) => `.s_pqr_coordonnees ${part}`);
/** ODOO-022 (US2) — Réassurances : SEULES les cartes s'éditent (titre simple,
 *  texte rich `strong`) + le libellé du CTA. L'en-tête est FIXÉ par composition
 *  (R3), donc absent des zones rouvertes ; les glyphes/variante du CTA aussi. Les
 *  gestes de collection (ajouter/supprimer/monter/descendre) vivent au panneau. */
export const REASSURANCES_EDITABLE_PARTS = [
    '[data-pqr-carte] [data-pqr-part="carte-title"]',
    '[data-pqr-carte] [data-pqr-part="carte-body"]',
    '[data-pqr-part="reassurances-cta"] [data-pqr-part="button-label"]',
].map((part) => `.s_pqr_reassurances ${part}`);
export const REASSURANCES_RICH_TEXT =
    '.s_pqr_reassurances [data-pqr-carte] [data-pqr-part="carte-body"]';
/** ODOO-023 — Catégories principales : SEULES les cartes s'éditent (titre + texte,
 *  texte SIMPLE — le contrat ne porte pas de plage forte sur la route `cartes`
 *  arrayOf) + le libellé du CTA lien de la carte empilée. Le style et le nombre de
 *  colonnes sont gouvernés (fixé par composition / enum au panneau) ; l'en-tête
 *  n'existe pas. AUCUNE zone rich-text (donc absente de PIQUERAY_RICH_TEXT). */
export const CATEGORIES_EDITABLE_PARTS = [
    '[data-pqr-carte] [data-pqr-part="carte-title"]',
    '[data-pqr-carte] [data-pqr-part="carte-text"]',
    '[data-pqr-carte] [data-pqr-part="carte-cta-lien"] [data-pqr-part="button-label"]',
].map((part) => `.s_pqr_categories_principales ${part}`);
/** Les zones rich-text des racines, réunies une fois : le fournisseur de
 *  namespace tourne à chaque changement de sélection dans l'éditeur. */
export const PIQUERAY_RICH_TEXT = `${GOOGLE_REVIEWS_RICH_TEXT}, ${PRESENTATION_RICH_TEXT}, ${HERO_RICH_TEXT}, ${FAQ_RICH_TEXT}, ${SAV_RICH_TEXT}, ${TEXTE_SEO_RICH_TEXT}, ${COORDONNEES_RICH_TEXT}, ${REASSURANCES_RICH_TEXT}`;
export const PIQUERAY_STRONG_NAMESPACE = "pqr-strong";

/**
 * Les parts rouvertes, root-scopées. Un sélecteur non préfixé par sa racine
 * fuirait d'une instance à l'autre : deux Présentations sur une page
 * partageraient leur texte. `check-authoring.ts` refuse un tel sélecteur.
 *
 * PROVISOIRE — banc d'essai du spike T017/T020 uniquement. Les vraies listes
 * viennent des configs (T032/T046).
 */
export const PIQUERAY_REOPENED = [
    ...PRESENTATION_EDITABLE_PARTS,
    ...GOOGLE_REVIEWS_EDITABLE_PARTS,
    ...HERO_EDITABLE_PARTS,
    ...EQUIPE_EDITABLE_PARTS,
    ...FAQ_EDITABLE_PARTS,
    ...DEVIS_EDITABLE_PARTS,
    ...SAV_EDITABLE_PARTS,
    ...TEXTE_SEO_EDITABLE_PARTS,
    ...COORDONNEES_EDITABLE_PARTS,
    ...REASSURANCES_EDITABLE_PARTS,
    ...CATEGORIES_EDITABLE_PARTS,
];
/** La liste rejointe une fois, au chargement : `normalizeEditableParts` tourne à
 *  chaque passe du normalizer (séquence 1), et y refaire le `join` reconstruisait
 *  le sélecteur deux fois par passe pour un résultat constant. */
export const PIQUERAY_REOPENED_SELECTOR = PIQUERAY_REOPENED.join(", ");

/** Les rootActions provisoires sont portées par le DOM du banc, puis seront
 * émises depuis les configs T026/T042. Elles restent séparées du verrou des
 * descendants : une section peut être déplacée/supprimée sans permettre de
 * déstructurer son anatomie interne. */
export function rootActionAllowed(root, action) {
    return (root.dataset.pqrRootActions || "")
        .split(/\s+/)
        .filter(Boolean)
        .includes(action);
}

function piquerayRootFor(el) {
    return el?.closest?.(PIQUERAY_ROOT_SELECTOR) || null;
}

function normalizeRootActions(changedRoot) {
    const roots = new Set();
    if (changedRoot?.matches?.(PIQUERAY_ROOT_SELECTOR)) roots.add(changedRoot);
    const ancestor = piquerayRootFor(changedRoot);
    if (ancestor) roots.add(ancestor);
    for (const root of changedRoot?.querySelectorAll?.(PIQUERAY_ROOT_SELECTOR) || []) roots.add(root);
    for (const root of roots) {
        // SaveSnippetPlugin consulte cette classe. La poser par normalisation
        // rend la politique vivante sur les blocs déjà sauvegardés.
        root.classList.toggle("o_no_save", !rootActionAllowed(root, "save-as-custom"));
    }
}

/** `content_editable_selectors` désigne les zones candidates, mais le prédicat
 * natif d'Odoo 19 exige aussi un ancêtre `.o_editable`. La politique matérialise
 * donc cette classe AVANT le normalizer natif (séquence 5). Le faire ici plutôt
 * que seulement dans les nouveaux QWeb garde la politique vivante sur les blocs
 * déjà sauvegardés : une réouverture décidée après leur pose prend effet à la
 * prochaine entrée dans l'éditeur, sans migration de leur HTML. */
function normalizeEditableParts(changedRoot) {
    const zones = new Set();
    if (changedRoot?.matches?.(PIQUERAY_REOPENED_SELECTOR)) zones.add(changedRoot);
    for (const zone of changedRoot?.querySelectorAll?.(PIQUERAY_REOPENED_SELECTOR) || []) {
        zones.add(zone);
    }
    for (const zone of zones) zone.classList.add("o_editable");
}

function normalizePiqueray(changedRoot) {
    normalizeEditableParts(changedRoot);
    normalizeRootActions(changedRoot);
}

excludeNativeOptionsForRoots(PIQUERAY_ROOTS);
excludeNativeImageOptionsForRoots(PIQUERAY_ROOTS);
excludeUndeclaredTopActionsForRoots(PIQUERAY_ROOTS);
governResizeForRoots(PIQUERAY_ROOTS);
// ODOO-019-AUTHORING-ROOTS END

// ODOO-019-AUTHORING-PLUGIN BEGIN
/** Une option minimale suffit à déclarer les racines comme conteneurs du
 * builder. Sans elle, Odoo ne construit aucun overlay pour notre section : les
 * décisions move/duplicate/remove seraient correctes mais inaccessibles. Les
 * contrôles métier réels seront ajoutés à ce même panneau par T031. */
export class PiquerayRootPolicyOption extends BaseOptionComponent {
    static template = "piqueray_ds.RootPolicyOption";
    static selector = PIQUERAY_ROOT_SELECTOR;
    // La racine est fermée par politique ; exiger un ancêtre éditable la
    // retirerait précisément du builder dont elle doit garder les actions.
    static editableOnly = false;
}

// Panneaux Google Reviews — inclus dans le bloc ODOO-019-AUTHORING-PLUGIN.
/** Les deux contextes évitent qu'une action de carte retombe sur une autre
 * instance : Odoo transmet l'élément sélectionné à la BuilderAction. */
export class PiquerayGoogleReviewsOption extends BaseOptionComponent {
    static template = "piqueray_ds.GoogleReviewsOption";
    static selector = ".s_pqr_google_reviews";
    static editableOnly = false;
}

export class PiquerayReviewCardOption extends BaseOptionComponent {
    static template = "piqueray_ds.ReviewCardOption";
    static selector = ".s_pqr_google_reviews [data-pqr-review-card]";
    static editableOnly = false;
}
// Fin des panneaux Google Reviews.

export class PiquerayPresentationOption extends BaseOptionComponent {
    static template = "piqueray_ds.PresentationOption";
    static selector = ".s_pqr_presentation";
    static editableOnly = false;
}

export class PiquerayHeroOption extends BaseOptionComponent {
    static template = "piqueray_ds.HeroOption";
    static selector = ".s_pqr_hero";
    static editableOnly = false;
}

export class PiquerayEquipeOption extends BaseOptionComponent {
    static template = "piqueray_ds.EquipeOption";
    static selector = ".s_pqr_equipe";
    static editableOnly = false;
}

export class PiquerayMemberCardOption extends BaseOptionComponent {
    static template = "piqueray_ds.MemberCardOption";
    static selector = ".s_pqr_equipe [data-pqr-member-card]";
    static editableOnly = false;
}

export class PiquerayDevisOption extends BaseOptionComponent {
    static template = "piqueray_ds.DevisOption";
    static selector = ".s_pqr_devis";
    static editableOnly = false;
}

export class PiquerayFaqOption extends BaseOptionComponent {
    static template = "piqueray_ds.FaqOption";
    static selector = ".s_pqr_faq";
    static editableOnly = false;
}

export class PiquerayFaqRowOption extends BaseOptionComponent {
    static template = "piqueray_ds.FaqRowOption";
    static selector = ".s_pqr_faq [data-pqr-faq-row]";
    static editableOnly = false;
}

export class PiqueraySavOption extends BaseOptionComponent {
    static template = "piqueray_ds.SavOption";
    static selector = ".s_pqr_sav";
    static editableOnly = false;
}

export class PiquerayTexteSeoOption extends BaseOptionComponent {
    static template = "piqueray_ds.TexteSeoOption";
    static selector = ".s_pqr_texte_seo";
    static editableOnly = false;
}

export class PiquerayTexteSeoRowOption extends BaseOptionComponent {
    static template = "piqueray_ds.TexteSeoRowOption";
    static selector = ".s_pqr_texte_seo [data-pqr-accordion-row]";
    static editableOnly = false;
}

// ODOO-022 (US1) — panneau Coordonnées. Le texte se modifie en ligne ; le
// panneau ne porte que les liens réseaux sociaux (Q-C2). Aucune action média :
// le plan Google est un placeholder jusqu'à l'API custom (décision gate).
export class PiquerayCoordonneesOption extends BaseOptionComponent {
    static template = "piqueray_ds.CoordonneesOption";
    static selector = ".s_pqr_coordonnees";
    static editableOnly = false;
}

// ODOO-022 (US2) — panneaux Réassurances : la racine porte la collection
// (ajouter une carte) + le CTA (libellé/lien) ; la carte porte son édition
// (titre/texte), son image et les gestes d'ordre/suppression.
export class PiquerayReassurancesOption extends BaseOptionComponent {
    static template = "piqueray_ds.ReassurancesOption";
    static selector = ".s_pqr_reassurances";
    static editableOnly = false;
}

export class PiquerayCarteOption extends BaseOptionComponent {
    static template = "piqueray_ds.CarteOption";
    static selector = ".s_pqr_reassurances [data-pqr-carte]";
    static editableOnly = false;
}

// ODOO-023 (US2) — panneaux Catégories principales : la racine porte le sélecteur
// de colonnes {2,3} + la collection (ajouter une carte) ; la carte porte son
// édition (titre/texte en ligne), son image, le lien du CTA et les gestes
// d'ordre/suppression. Le STYLE (superpose/empile) n'est PAS offert : fixé par
// composition au poser (Gate D, C1).
export class PiquerayCategoriesPrincipalesOption extends BaseOptionComponent {
    static template = "piqueray_ds.CategoriesPrincipalesOption";
    static selector = ".s_pqr_categories_principales";
    static editableOnly = false;
}

export class PiquerayCarteCategorieOption extends BaseOptionComponent {
    static template = "piqueray_ds.CarteCategorieOption";
    static selector = ".s_pqr_categories_principales [data-pqr-carte]";
    static editableOnly = false;
}

/** Le lien d'un CTA est réglé au panneau (le popover natif est inatteignable :
 * l'ancre est hors hit-testing en édition pour que son libellé reste éditable
 * — voir odoo-bridge.css, ODOO-019-CTA-LIEN-BRIDGE). Bonne pratique du noyau
 * (website.py:501 : `cta_btn_href: '/contactus'`) : l'interne se stocke en
 * RELATIF racine, l'hôte n'entre jamais dans le HTML sauvegardé.
 *
 * C'est une ADAPTATION ODOO, pas une prop de contrat : aucun contrat ne porte
 * de notion de lien et `ds.button` reste un <button> côté React. Sa
 * gouvernance vit donc au registre d'adaptations, pas dans un
 * `*.authoring.json` — décision owner du 2026-08-18. */
const CTA_HREF_AUTORISE = /^(#|\/(?!\/)|https?:\/\/|mailto:|tel:)/i;
export function normaliserCtaHref(valeur, origine) {
    const brut = String(valeur ?? "").trim();
    if (!brut) return null;
    // Un absolu MÊME ORIGINE (collé depuis la barre d'adresse) est replié en
    // chemin relatif : une URL locale ne peut pas cuire dans une sauvegarde
    // qui partira en production.
    if (brut === origine || brut.startsWith(`${origine}/`) || brut.startsWith(`${origine}#`)) {
        const repli = brut.slice(origine.length) || "/";
        return CTA_HREF_AUTORISE.test(repli) ? repli : null;
    }
    return CTA_HREF_AUTORISE.test(brut) ? brut : null;
}

/** Une seule mécanique, UNE seule action : la part qui porte le CTA arrive par
 * le canal de paramètre du builder (`actionParam` au gabarit → `params.mainParam`
 * ici), pas par une sous-classe. Une sous-classe par section coûterait trois
 * éditions à chaque nouveau CTA (la classe, l'entrée `builder_actions`, la
 * rangée XML) pour un mécanisme déjà générique, et une part mal orthographiée
 * s'y perdrait sans trace.
 *
 * Chaîne vérifiée dans le noyau 19.0 : `BuilderUrlPicker.props` reprend
 * `basicContainerBuilderComponentProps`, qui déclare `actionParam`
 * (html_builder/core/utils.js) ; `getCustomAction()` le passe par
 * `convertParamToObject`, qui emballe un scalaire en `{ mainParam }` ; et
 * `getValue` est appelé avec `{ editingElement, params: actionParam }`. */
export class SetCtaHrefAction extends BuilderAction {
    static id = "pqrSetCtaHref";
    ancre(editingElement, part) {
        return part ? editingElement.querySelector(`[data-pqr-part="${part}"] a[data-pqr-part="button-root"]`) : null;
    }
    getValue({ editingElement, params: { mainParam } = {} }) {
        return this.ancre(editingElement, mainParam)?.getAttribute("href") || "";
    }
    apply({ editingElement, value, params: { mainParam } = {} }) {
        const ancre = this.ancre(editingElement, mainParam);
        if (!ancre) return;
        const href = normaliserCtaHref(value, window.location.origin);
        // Entrée hors grammaire (javascript:, //hôte, vide…) : on REFUSE sans
        // casser le lien existant — la dégradation se voit au champ, pas au DOM.
        if (href === null) return;
        ancre.setAttribute("href", href);
    }
}

/** ODOO-022 — variante générique du lien : l'ancre PORTE elle-même l'adresse
 * `data-pqr-part` (icône sociale cliquable, Q-C2), au lieu d'être un
 * `a[data-pqr-part="button-root"]` sous une part hôte. Même grammaire, même
 * porte (repli même origine, `javascript:` refusé) que le lien CTA — une seule
 * mécanique, paramétrée par part. */
export class SetLinkHrefAction extends BuilderAction {
    static id = "pqrSetLinkHref";
    ancre(editingElement, part) {
        if (!part) return null;
        return editingElement.matches?.(`a[data-pqr-part="${part}"]`)
            ? editingElement
            : editingElement.querySelector(`a[data-pqr-part="${part}"]`);
    }
    getValue({ editingElement, params: { mainParam } = {} }) {
        return this.ancre(editingElement, mainParam)?.getAttribute("href") || "";
    }
    apply({ editingElement, value, params: { mainParam } = {} }) {
        const ancre = this.ancre(editingElement, mainParam);
        if (!ancre) return;
        const href = normaliserCtaHref(value, window.location.origin);
        if (href === null) return;
        ancre.setAttribute("href", href);
    }
}

/** ODOO-023 — sélecteur de colonnes {2,3} de la section Catégories. C'est le
 * PREMIER enum RÉDACTEUR de la couche Odoo (les variantes des autres sections
 * sont fixées au poser). Mécanique : la valeur bascule la classe modificatrice
 * `categories-principales--colonnes-3` (émise par emit-html ; la base porte 2) et
 * l'attribut miroir `data-pqr-colonnes`. Enum FERMÉ : toute valeur hors {2,3} est
 * refusée sans casser l'état courant (dégradation au champ, pas au DOM). Au-delà
 * du compte de cartes, la grille native fait passer les cartes à la ligne — aucun
 * colonnage hors {2,3} n'est jamais offert. */
export class SetColonnesAction extends BuilderAction {
    static id = "pqrSetColonnes";
    getValue({ editingElement }) {
        return findCategoriesRoot(editingElement)?.dataset?.pqrColonnes || "2";
    }
    isApplied(arg) {
        return this.getValue(arg) === String(arg.params.mainParam);
    }
    apply({ editingElement, params: { mainParam } }) {
        const section = findCategoriesRoot(editingElement);
        if (!section) return;
        const v = String(mainParam);
        if (v !== "2" && v !== "3") return; // enum fermé : refus silencieux
        section.classList.toggle("categories-principales--colonnes-3", v === "3");
        section.dataset.pqrColonnes = v;
    }
}

export class PiquerayAuthoringPlugin extends Plugin {
    static id = "piquerayAuthoringPlugin";

    /** @type {import("plugins").WebsiteResources} */
    resources = {
        // Fermeture : la racine et tout son sous-arbre sortent de l'édition.
        // + verrou dur des textes de structure de Coordonnées (l'ouverture d'une
        // valeur inline rend son bloc parent éditable et contaminerait l'étiquette).
        content_not_editable_selectors: [...PIQUERAY_ROOTS, ...COORDONNEES_LOCKED_TEXT],
        // Réouverture NOMMÉE. Elle fonctionne malgré la fermeture ci-dessus
        // parce que `isDescendantOfNotEditableNotSnippet()` ne bloque pas un
        // `.o_not_editable` situé dans un `[data-snippet]` — et nos racines en
        // portent un. C'est exactement l'hypothèse que T020 met à l'épreuve.
        content_editable_selectors: [...PIQUERAY_REOPENED],

        // Aucune action structurelle sur un descendant. `is_unremovable_selector`
        // ferme Remove ET Duplicate (ClonePlugin dérive de isRemovable), tandis
        // que le prédicat de drag ferme la poignée de déplacement.
        is_unremovable_selector: PIQUERAY_LOCKED_DESCENDANTS,
        is_draggable_handlers: (el) => {
            const root = piquerayRootFor(el);
            if (!root) return true;
            if (el !== root) return false;
            return rootActionAllowed(root, "move");
        },
        // `MovePlugin` (flèches) et `DragAndDropPlugin` (poignée) sont deux
        // mécanismes distincts dans Odoo 19. Le handler ci-dessus ne ferme que
        // le second : ces exclusions ferment aussi les deux axes du premier.
        is_movable_selector: [
            {
                selector: "",
                exclude: PIQUERAY_LOCKED_DESCENDANTS,
                direction: "vertical",
            },
            {
                selector: "",
                exclude: PIQUERAY_LOCKED_DESCENDANTS,
                direction: "horizontal",
            },
        ],

        // Les actions de RACINE suivent leur verdict propre. Les descendants
        // sont déjà retirés en amont par `is_unremovable_selector`.
        clone_disabled_reason_providers: ({ el, reasons }) => {
            if (el.matches(PIQUERAY_ROOT_SELECTOR) && !rootActionAllowed(el, "duplicate")) {
                reasons.push("Duplication interdite par la politique Piqueray.");
            }
        },
        remove_disabled_reason_providers: ({ el, reasons }) => {
            if (el.matches(PIQUERAY_ROOT_SELECTOR) && !rootActionAllowed(el, "remove")) {
                reasons.push("Suppression interdite par la politique Piqueray.");
            }
        },
        // Le normalizer natif de contentEditable est séquencé à 5. Notre classe
        // `o_editable` doit donc exister avant son passage.
        normalize_handlers: withSequence(1, normalizePiqueray),

        // Inscrit les racines dans le panneau et, par conséquent, dans les
        // overlays structurels natifs d'Odoo.
        builder_options: [PiquerayRootPolicyOption, PiquerayGoogleReviewsOption, PiquerayReviewCardOption, PiquerayPresentationOption, PiquerayHeroOption, PiquerayEquipeOption, PiquerayMemberCardOption, PiquerayFaqOption, PiquerayFaqRowOption, PiquerayDevisOption, PiqueraySavOption, PiquerayTexteSeoOption, PiquerayTexteSeoRowOption, PiquerayCoordonneesOption, PiquerayReassurancesOption, PiquerayCarteOption, PiquerayCategoriesPrincipalesOption, PiquerayCarteCategorieOption],
        builder_actions: {
            SetCtaHrefAction,
            SetLinkHrefAction,
            SetColonnesAction,
            AddCarteAction,
            RemoveCarteAction,
            MoveCarteUpAction,
            MoveCarteDownAction,
            ReplaceCarteImageAction,
            SetCarteImageAltAction,
            AddCarteCategorieAction,
            RemoveCarteCategorieAction,
            MoveCarteCategorieUpAction,
            MoveCarteCategorieDownAction,
            SetStyleCarteAction,
            ReplaceCarteCategorieImageAction,
            SetCarteCategorieImageAltAction,
            AddMemberAction,
            RemoveMemberAction,
            MoveMemberUpAction,
            MoveMemberDownAction,
            AddReviewAction,
            RemoveReviewAction,
            MoveReviewUpAction,
            MoveReviewDownAction,
            SetReviewNoteAction,
            AddFaqRowAction,
            RemoveFaqRowAction,
            MoveFaqRowUpAction,
            MoveFaqRowDownAction,
            ToggleFaqRowAction,
            AddTexteSeoRowAction,
            RemoveTexteSeoRowAction,
            MoveTexteSeoRowUpAction,
            MoveTexteSeoRowDownAction,
            ToggleTexteSeoRowAction,
            ReplaceReviewAvatarAction,
            SetReviewAvatarAltAction,
            ReplaceHeroBackgroundAction,
            SetHeroBackgroundAltAction,
            ReplaceMemberPortraitAction,
            SetMemberPortraitAltAction,
            ReplaceDevisBackgroundAction,
            SetDevisBackgroundAltAction,
            ReplaceSavBackgroundAction,
            SetSavBackgroundAltAction,
            ReplaceSavPhotoAction,
            SetSavPhotoAltAction,
        },

        // Une zone `data-pqr-marks=""` est du texte simple : aucune toolbar de
        // mise en forme ne doit être exposée. Les zones rich-text sont durcies
        // à la sortie par rich_text_guard.js selon leur allowlist exacte.
        toolbar_namespace_providers: (targetedNodes) => {
            if (!targetedNodes.length) return undefined;
            const tousDans = (selecteur) =>
                targetedNodes.every((node) => closestElement(node, selecteur));
            // Aucune barre de mise en forme : texte simple, PLUS les zones
            // Coordonnées alignées sur l'allowlist (valeurs + bloc contact). Le
            // popover natif de lien reste disponible séparément sur le bloc contact.
            if (tousDans(PIQUERAY_PLAIN_TEXT) || tousDans(COORDONNEES_NO_FORMAT)) return DISABLED_NAMESPACE;
            if (tousDans(PIQUERAY_RICH_TEXT)) return PIQUERAY_STRONG_NAMESPACE;
            return undefined;
        },
        // La namespace dédiée ne contient que le bouton gras. Les commandes
        // clavier/collage sont, elles, assainies au save par rich_text_guard.
        toolbar_groups: withSequence(10, { id: "pqr-strong" }),
        toolbar_items: withSequence(10, {
            id: "pqr-strong-bold",
            groupId: "pqr-strong",
            namespaces: [PIQUERAY_STRONG_NAMESPACE],
            commandId: "formatBold",
        }),
    };

    setup() {
        // La sentinelle parle au chargement de l'éditeur, pas à la première
        // édition ratée. Un environnement incompatible doit refuser bruyamment.
        this.piquerayEnv = assertOdoo19Environment(this);
    }
}

registry.category("website-plugins").add(PiquerayAuthoringPlugin.id, PiquerayAuthoringPlugin);
// ODOO-019-AUTHORING-PLUGIN END
