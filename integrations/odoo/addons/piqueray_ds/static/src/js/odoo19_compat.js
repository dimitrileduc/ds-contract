/**
 * ODOO-019-COMPAT — la frontière UNIQUE avec les APIs internes d'Odoo 19.
 * Spec 019, tâche T018.
 *
 * Tout import interne, toute classe du noyau, toute ressource de plugin sur
 * laquelle nous nous appuyons passe par ici. Ailleurs dans l'addon, on importe
 * depuis CE fichier — jamais depuis `@html_builder/...` directement.
 *
 * Pourquoi : ces symboles ne sont pas une API publique. Quand ils bougeront, on
 * veut UN fichier rouge et bruyant, pas six comportements silencieusement
 * différents. La sentinelle en bas de fichier est là pour ça.
 *
 * ── Faits VÉRIFIÉS sur l'image épinglée odoo:19.0-20260803 ──────────────────
 * Lus dans
 * `addons/html_builder/static/src/core/builder_content_editable_plugin.js` :
 *
 *   content_not_editable_selectors (défauts du noyau) :
 *     "section:has(> .o_container_small, > .container, > .container-fluid)"
 *     ".o_not_editable"
 *     "[data-oe-field='arch']:empty"
 *   content_editable_selectors (défauts du noyau) :
 *     "section > .o_container_small" / "section > .container" / "section > .container-fluid"
 *     ".o_editable"
 *
 * Et `isValidContentEditable()` exige `contentEditableEl.closest(".o_editable")`.
 *
 * C'est l'explication de l'état INTERMÉDIAIRE de 018 (montage à balisage seul,
 * relevé du 2026-08-07 07 h 52) : poser un `.container` sous notre `<section>`
 * pour rendre le texte éditable ouvre, PAR LA RÈGLE DU NOYAU, tout le sous-arbre.
 *
 * ⚠ NE PAS écrire ici que 018 a mesuré « zéro levier tenu » : c'est un verdict
 * périmé. Dix heures plus tard, 018 a livré sa couche de réglages et mesuré
 * 7 attentes sur 7 tenues avec exactement ces deux ressources — sans jamais
 * réémettre ses verdicts. Voir `specs/019-odoo-production-foundation/proofs/correction-premisse-018.md` (2026-08-08).
 *
 * La voie de 019 en découle : **ne pas poser de `.container`**, et rouvrir
 * NOMMÉMENT les seules parts autorisées via `content_editable_selectors`. Elle
 * est REPRODUITE d'un précédent prouvé une fois, pas inventée — et ce qui reste
 * réellement ouvert est le verrou STRUCTUREL (déplacer/dupliquer/supprimer),
 * que 018 n'a jamais fermé.
 *
 * Nuance qui décide, tirée de `isDescendantOfNotEditableNotSnippet()` : un
 * `.o_not_editable` **situé dans un `[data-snippet]`** ne bloque PAS ses
 * descendants. Notre racine portant `data-snippet`, la fermer n'empêche donc pas
 * de rouvrir un texte à l'intérieur. C'est précisément ce que le spike vérifie.
 */
import { Plugin } from "@html_editor/plugin";
import { BaseOptionComponent } from "@html_builder/core/utils";
import { BuilderAction } from "@html_builder/core/builder_action";
import { AnchorPlugin } from "@html_builder/core/anchor/anchor_plugin";
import {
    sizingY,
    sizingX,
    sizingGrid,
} from "@html_builder/core/builder_overlay/builder_overlay";
import { DISABLED_NAMESPACE } from "@html_editor/main/toolbar/toolbar_plugin";
import { closestElement } from "@html_editor/utils/dom_traversal";
import { withSequence } from "@html_editor/utils/resource";
import { registry } from "@web/core/registry";
import { rpc } from "@web/core/network/rpc";
import {
    WebsiteBackgroundCarouselOption,
    WebsiteBackgroundBGColorImageOption,
    WebsiteBackgroundBGColorOption,
    WebsiteBackgroundOnlyBGImageOption,
} from "@website/builder/plugins/options/website_background_option_plugin";
import { ScrollButtonOption } from "@website/builder/plugins/options/scroll_button_option";
import { ContentWidthOption } from "@website/builder/plugins/content_width_option_plugin";
import { VisibilityOption } from "@website/builder/plugins/options/visibility_option";
import { LayoutOption } from "@website/builder/plugins/layout_option/layout_option";
import { ImageAndFaOption } from "@html_builder/plugins/image/image_tool_option_plugin";
import { ImageToolOption } from "@html_builder/plugins/image/image_tool_option";
import { ReplaceMediaOption } from "@html_builder/plugins/image/replace_media_option";

/** Imports internes dont l'existence est une hypothèse de compatibilité. Les
 * centraliser ici garantit qu'un renommage casse un seul module au chargement. */
const ODOO19_ROOT_NATIVE_OPTIONS = [
    WebsiteBackgroundCarouselOption,
    WebsiteBackgroundBGColorImageOption,
    WebsiteBackgroundBGColorOption,
    WebsiteBackgroundOnlyBGImageOption,
    ContentWidthOption,
    VisibilityOption,
    LayoutOption,
    ScrollButtonOption,
];
export const ODOO19_NATIVE_IMAGE_OPTIONS = [
    ReplaceMediaOption,
    ImageToolOption,
    ImageAndFaOption,
];
export const ODOO19_NATIVE_OPTIONS = [
    ...ODOO19_ROOT_NATIVE_OPTIONS,
    ...ODOO19_NATIVE_IMAGE_OPTIONS,
];
const ODOO19_BACKGROUND_OPTIONS = new Set([
    WebsiteBackgroundCarouselOption,
    WebsiteBackgroundBGColorImageOption,
    WebsiteBackgroundBGColorOption,
    WebsiteBackgroundOnlyBGImageOption,
]);

/** Écarte les options natives pour chaque racine, une fois par classe/racine.
 * `computeContainers()` relit `static exclude` à chaque sélection sur l'image
 * épinglée ; la mutation est donc volontaire, nommée et bornée ici. */
export function excludeNativeOptionsForRoots(rootSelectors) {
    for (const Option of ODOO19_ROOT_NATIVE_OPTIONS) {
        for (const rootSelector of rootSelectors) {
            // Background est une vraie rootAction : la surface native reste
            // disponible si — et seulement si — le verdict DOM l'autorise.
            // Les autres options natives ne correspondent à aucune capacité
            // déclarée de la fondation et restent exclues sans condition.
            const exclusion = ODOO19_BACKGROUND_OPTIONS.has(Option)
                ? `${rootSelector}:not([data-pqr-root-actions~="background"])`
                : rootSelector;
            const actuel = Option.exclude || "";
            const exclusions = actuel.split(",").map((value) => value.trim()).filter(Boolean);
            if (!exclusions.includes(exclusion)) {
                Option.exclude = actuel ? `${actuel}, ${exclusion}` : exclusion;
            }
        }
    }
}

/** Ferme la voie canvas des bitmaps Piqueray. Le média reste remplaçable par
 * nos actions gouvernées, mais les conteneurs natifs ReplaceMedia, ImageTool
 * (crop/filter/shape/format/transform) et alignement/style ne doivent jamais
 * s'appliquer à une image située sous une racine Piqueray. */
export function excludeNativeImageOptionsForRoots(rootSelectors) {
    for (const Option of ODOO19_NATIVE_IMAGE_OPTIONS) {
        for (const rootSelector of rootSelectors) {
            const exclusion = `${rootSelector} img`;
            const actuel = Option.exclude || "";
            const exclusions = actuel.split(",").map((value) => value.trim()).filter(Boolean);
            if (!exclusions.includes(exclusion)) {
                Option.exclude = actuel ? `${actuel}, ${exclusion}` : exclusion;
            }
        }
    }
}

/** Les actions hautes ne sont pas des `builder_options` et échappent donc aux
 * `exclude` ci-dessus. Odoo 19 ne fournit aucun prédicat d'exclusion pour
 * l'ancre : le patch reste confiné ici, sur la classe exportée, et ne change
 * rien hors de nos racines. */
const ROOTS_WITHOUT_NATIVE_TOP_ACTIONS = new Set();
let anchorPatched = false;

export function excludeUndeclaredTopActionsForRoots(rootSelectors) {
    for (const root of rootSelectors) ROOTS_WITHOUT_NATIVE_TOP_ACTIONS.add(root);
    if (anchorPatched) return;
    anchorPatched = true;
    const original = AnchorPlugin.prototype.getOptionsContainerTopButtons;
    AnchorPlugin.prototype.getOptionsContainerTopButtons = function (el) {
        // Itérer le Set directement : l'étaler allouait un tableau neuf à chaque
        // sélection d'élément, pour une lecture seule.
        for (const root of ROOTS_WITHOUT_NATIVE_TOP_ACTIONS) if (el.matches(root)) return [];
        return original.call(this, el);
    };
}

/** Le resize par poignées est encore une troisième surface, indépendante des
 * options et du drag. Les constantes sont exportées par Odoo 19 ; leur `exclude`
 * est relu à la construction de chaque overlay. Une racine ne garde les poignées
 * que si son verdict DOM contient explicitement le token `resize`. */
export function governResizeForRoots(rootSelectors) {
    for (const sizing of [sizingY, sizingX, sizingGrid]) {
        for (const root of rootSelectors) {
            const forbidden = `${root}:not([data-pqr-root-actions~="resize"])`;
            if (!sizing.exclude.includes(forbidden)) {
                sizing.exclude = sizing.exclude ? `${sizing.exclude}, ${forbidden}` : forbidden;
            }
        }
    }
}

// ODOO-019-COMPAT-SENTINEL BEGIN
/**
 * Ce que nous tenons pour vrai sur l'image épinglée. Si l'une de ces hypothèses
 * tombe, la sentinelle hurle au chargement de l'éditeur au lieu de laisser une
 * politique d'édition se dégrader en silence.
 */
export const ODOO19_ASSUMPTIONS = {
    /** Le registre où un module de site enregistre ses plugins.
     *  Vérifié : 137 fichiers du noyau l'emploient, et `website_sale` —
     *  module de la même forme que le nôtre — n'emploie que celui-ci.
     *  `builder-plugins` est la catégorie interne de `html_builder`. */
    pluginRegistry: "website-plugins",
    /** Classe du noyau qui ferme un sous-arbre. */
    notEditableClass: "o_not_editable",
    /** Classe du noyau qui rouvre — et que `isValidContentEditable` EXIGE. */
    editableClass: "o_editable",
    /** Les ressources de plugin sur lesquelles repose toute la politique. */
    resources: ["content_editable_selectors", "content_not_editable_selectors"],
};

/**
 * Vérifie que l'environnement porte encore ce que nous supposons. Appelée par
 * `authoring.js` à son `setup()`.
 *
 * Elle ne peut pas tout vérifier — la présence d'une ressource ne se lit pas
 * depuis un plugin tiers sans fouiller le noyau. Elle vérifie ce qui est
 * observable, et le DIT quand elle ne peut pas conclure, plutôt que de rendre
 * un vert qui ne vaut rien.
 */
export function assertOdoo19Environment(plugin) {
    const manquants = [];
    if (!registry.category(ODOO19_ASSUMPTIONS.pluginRegistry)) {
        manquants.push(`registre « ${ODOO19_ASSUMPTIONS.pluginRegistry} » absent`);
    }
    if (typeof Plugin !== "function") {
        manquants.push("`Plugin` de @html_editor/plugin n'est pas une classe");
    }
    if (typeof BaseOptionComponent !== "function") {
        manquants.push("`BaseOptionComponent` de @html_builder/core/utils n'est pas une classe");
    }
    if (typeof DISABLED_NAMESPACE !== "string" || !DISABLED_NAMESPACE) {
        manquants.push("namespace de toolbar désactivée absent");
    }
    for (const Option of ODOO19_NATIVE_OPTIONS) {
        if (typeof Option !== "function" || typeof Option.selector !== "string") {
            manquants.push(`classe d'option native invalide : ${Option?.name || "(inconnue)"}`);
        }
    }
    if (typeof AnchorPlugin !== "function" ||
        typeof AnchorPlugin.prototype.getOptionsContainerTopButtons !== "function") {
        manquants.push("classe d'action native AnchorPlugin invalide");
    }
    for (const [nom, sizing] of Object.entries({ sizingY, sizingX, sizingGrid })) {
        if (typeof sizing?.selector !== "string" || typeof sizing?.exclude !== "string") {
            manquants.push(`descripteur de resize natif invalide : ${nom}`);
        }
    }
    if (!plugin || typeof plugin.getResource !== "function") {
        manquants.push("API Plugin.getResource absente");
    } else {
        for (const resource of ODOO19_ASSUMPTIONS.resources) {
            let valeur;
            try {
                valeur = plugin.getResource(resource);
            } catch {
                valeur = null;
            }
            if (!Array.isArray(valeur)) {
                manquants.push(`ressource « ${resource} » absente ou non composée`);
            }
        }
    }
    if (manquants.length > 0) {
        throw new Error(
            `[piqueray_ds] Environnement Odoo incompatible — ${manquants.join(" · ")}.\n` +
                `Cet addon est qualifié sur odoo:19.0-20260803. Requalifier avant de monter de version.`,
        );
    }
    return {
        verifie: [
            "registre de plugins",
            "classes Plugin / BaseOptionComponent et getResource",
            "ressources content_(not_)editable_selectors composées",
            "11 classes d'options natives, dont 3 conteneurs image",
            "action AnchorPlugin et 3 descripteurs de resize",
            "namespace de toolbar",
        ],
        // L'application comportementale reste une preuve live, jamais une
        // conclusion tirée de la seule introspection.
        nonVerifie: ["que les ressources produisent la frontière DOM attendue"],
        prouvePar: "integrations/odoo/qa/scenarios/editability-boundary.spec.mts",
    };
}
// ODOO-019-COMPAT-SENTINEL END

// ODOO-019-COMPAT-EXPORTS BEGIN
/** Réexports : le reste de l'addon n'importe JAMAIS `@html_editor` / `@web`
 *  directement. Un seul point à corriger le jour où ces chemins changent. */
export {
    Plugin,
    BaseOptionComponent,
    BuilderAction,
    registry,
    rpc,
    DISABLED_NAMESPACE,
    closestElement,
    withSequence,
};
// ODOO-019-COMPAT-EXPORTS END
