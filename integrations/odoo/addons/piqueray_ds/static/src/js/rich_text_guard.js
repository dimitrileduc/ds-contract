/**
 * ODOO-019-RICHTEXT — l'allowlist de marques riches, appliquée AUSSI au collage,
 * au raccourci clavier et à la sauvegarde. Spec 019, tâche T019.
 *
 * ── Pourquoi les trois voies, et pas seulement la barre d'outils ────────────
 * Retirer un bouton de la toolbar ne retire pas la capacité : `Ctrl+I` produit
 * un `<em>` que rien n'a proposé, et un collage depuis un traitement de texte
 * amène des `<span style>`, des classes, des liens et parfois des attributs
 * exécutables. Une allowlist qui ne garde que la toolbar garde une porte
 * ouverte et croit l'avoir fermée.
 *
 * La garde s'applique donc à la SORTIE : ce qui n'est pas déclaré par le contrat
 * est déplié avant sauvegarde, quel que soit le chemin par lequel il est entré.
 *
 * ── Provisoire, et dit comme tel ────────────────────────────────────────────
 * L'allowlist par zone vient des `allowedMarks` des configs d'authoring
 * (T032/T046). Le défaut ci-dessous n'existe que pour le spike.
 */
import { Plugin, registry } from "./odoo19_compat";

// ODOO-019-RICHTEXT-ALLOWLIST BEGIN
/** Marques du vocabulaire de contrat → balises HTML acceptées. */
export const MARK_TAGS = {
    strong: ["STRONG", "B"],
    em: ["EM", "I"],
    link: ["A"],
    "line-break": ["BR"],
};

/** Défaut du spike : gras seulement. Les vraies valeurs viennent des configs. */
export const DEFAULT_ALLOWED_MARKS = ["strong"];

/** Attributs jamais conservés, quelle que soit la balise. */
const ATTRS_INTERDITS = /^(on\w+|style|srcdoc|formaction)$/i;
/** Schémas d'URL exécutables. */
const URL_EXECUTABLE = /^\s*(javascript|data|vbscript):/i;

function sanitizeAttributes(el, retires) {
    for (const attr of [...el.attributes]) {
        const nom = attr.name;
        const valeurExecutable =
            (nom === "href" || nom === "src") && URL_EXECUTABLE.test(attr.value);
        if (ATTRS_INTERDITS.test(nom) || valeurExecutable) {
            el.removeAttribute(nom);
            retires.push(`${el.tagName.toLowerCase()}[${nom}]`);
        }
    }
}

/**
 * Déplie tout ce que l'allowlist n'autorise pas, en PRÉSERVANT le texte.
 * Déplier plutôt que supprimer : perdre le contenu d'un rédacteur parce qu'il
 * l'a mis en italique serait pire que le formatage lui-même.
 */
export function sanitizeMarks(rootEl, allowedMarks = DEFAULT_ALLOWED_MARKS) {
    const autorisees = new Set(allowedMarks.flatMap((m) => MARK_TAGS[m] ?? []));
    const retires = [];
    // La zone éditable elle-même n'est jamais dépliée : elle porte l'adresse DOM
    // du contrat. Ses attributs, en revanche, traversent les mêmes portes que
    // ceux de ses descendants. L'ancienne boucle `querySelectorAll("*")` les
    // oubliait et laissait survivre `style`/`onclick` sur la racine.
    sanitizeAttributes(rootEl, retires);
    for (const el of [...rootEl.querySelectorAll("*")]) {
        sanitizeAttributes(el, retires);
        if (el.tagName === "SCRIPT" || el.tagName === "STYLE") {
            el.remove();
            retires.push(el.tagName.toLowerCase());
            continue;
        }
        if (!autorisees.has(el.tagName)) {
            retires.push(el.tagName.toLowerCase());
            el.replaceWith(...el.childNodes);
        }
    }
    return retires;
}

export class PiquerayRichTextGuardPlugin extends Plugin {
    static id = "piquerayRichTextGuardPlugin";

    resources = {
        // La garde se branche à la sauvegarde : c'est le seul point par lequel
        // TOUTES les voies d'entrée passent — frappe, raccourci, collage.
        clean_for_save_handlers: this.cleanForSave.bind(this),
    };

    cleanForSave({ root }) {
        if (!root) return;
        const zones = [
            ...(root.matches?.(".o_pqr_editable") ? [root] : []),
            ...root.querySelectorAll(".o_pqr_editable"),
        ];
        for (const zone of zones) {
            const declaration = zone.getAttribute("data-pqr-marks");
            const marks = declaration === null
                ? DEFAULT_ALLOWED_MARKS
                : declaration.split(",").map((m) => m.trim()).filter(Boolean);
            // Attribut absent = défaut du spike. Attribut présent mais vide =
            // texte simple, donc allowlist vide — surtout pas retour au défaut.
            sanitizeMarks(zone, marks);
        }
    }
}

registry.category("website-plugins").add(PiquerayRichTextGuardPlugin.id, PiquerayRichTextGuardPlugin);
// ODOO-019-RICHTEXT-ALLOWLIST END
