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
    registry,
    DISABLED_NAMESPACE,
    closestElement,
    assertOdoo19Environment,
    excludeNativeOptionsForRoots,
    excludeUndeclaredTopActionsForRoots,
    governResizeForRoots,
    withSequence,
} from "./odoo19_compat";
import {
    AddReviewAction,
    MoveReviewDownAction,
    MoveReviewUpAction,
    RemoveReviewAction,
    SetReviewBooleanAction,
} from "./repeat_action";
import { ReplaceReviewAvatarAction, SetReviewAvatarAltAction } from "./media_action";

// ODOO-019-AUTHORING-ROOTS BEGIN
/** Les deux seules racines posables. Fermées par défaut, sans exception. */
export const PIQUERAY_ROOTS = [".s_pqr_presentation", ".s_pqr_google_reviews"];
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
/** Les zones rich-text des deux racines, réunies une fois : le fournisseur de
 *  namespace tourne à chaque changement de sélection dans l'éditeur. */
export const PIQUERAY_RICH_TEXT = `${GOOGLE_REVIEWS_RICH_TEXT}, ${PRESENTATION_RICH_TEXT}`;
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

export class PiquerayAuthoringPlugin extends Plugin {
    static id = "piquerayAuthoringPlugin";

    /** @type {import("plugins").WebsiteResources} */
    resources = {
        // Fermeture : la racine et tout son sous-arbre sortent de l'édition.
        content_not_editable_selectors: [...PIQUERAY_ROOTS],
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
        builder_options: [PiquerayRootPolicyOption, PiquerayGoogleReviewsOption, PiquerayReviewCardOption, PiquerayPresentationOption],
        builder_actions: {
            AddReviewAction,
            RemoveReviewAction,
            MoveReviewUpAction,
            MoveReviewDownAction,
            SetReviewBooleanAction,
            ReplaceReviewAvatarAction,
            SetReviewAvatarAltAction,
        },

        // Une zone `data-pqr-marks=""` est du texte simple : aucune toolbar de
        // mise en forme ne doit être exposée. Les zones rich-text sont durcies
        // à la sortie par rich_text_guard.js selon leur allowlist exacte.
        toolbar_namespace_providers: (targetedNodes) => {
            if (!targetedNodes.length) return undefined;
            const tousDans = (selecteur) =>
                targetedNodes.every((node) => closestElement(node, selecteur));
            if (tousDans(PIQUERAY_PLAIN_TEXT)) return DISABLED_NAMESPACE;
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
