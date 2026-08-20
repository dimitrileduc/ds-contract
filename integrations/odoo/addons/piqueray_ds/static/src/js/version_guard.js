/** ODOO-019-VERSION-GUARD BEGIN
 * Politique vivante : classer le HTML sauvegardé sans jamais le migrer.
 * Seules les classes/politiques d'authoring sont réappliquées à l'ouverture.
 */
import { Plugin, registry, withSequence } from "./odoo19_compat";
// La liste des racines a UN seul propriétaire. La réécrire ici donnerait une
// copie qui vieillit en silence : une troisième section serait gouvernée par
// `authoring.js` et invisible pour la politique de versions.
import { PIQUERAY_ROOT_SELECTOR } from "./authoring";

export const CURRENT_GRAPH_DIGEST = "e8b7e2127b5eb8ffe626bea707b6698187412df7580900d04712ed958bdd8322";
export const CURRENT_AUTHORING_VERSION = "1.1.0";
export const CURRENT_MODULE_VERSION = "19.0.1.5.0";
const CONTRACT_VERSIONS = { "ds.google-reviews": "2.0.0", "ds.presentation": "2.6.0", "ds.hero": "1.5.0", "ds.equipe": "1.2.0", "ds.faq": "1.3.0", "ds.devis": "1.2.0", "ds.sav": "1.4.0", "ds.texte-seo": "2.1.0", "ds.coordonnees": "2.2.0", "ds.reassurances": "1.2.0" };

export function classifySavedRoot(root) {
    const id = root?.dataset?.dsContract;
    if (!id || !CONTRACT_VERSIONS[id] || !root.dataset.dsContractVersion || !root.dataset.dsGraphDigest) return "unknown";
    if (root.dataset.dsContractVersion !== CONTRACT_VERSIONS[id] || root.dataset.dsGraphDigest !== CURRENT_GRAPH_DIGEST) return "structure-stale";
    if (root.dataset.dsAuthoringVersion !== CURRENT_AUTHORING_VERSION ||
        [root.dataset.vcss, root.dataset.vxml, root.dataset.vjs].some((value) => value !== CURRENT_MODULE_VERSION)) return "policy-stale";
    return "current";
}

function applyVersionState(changedRoot) {
    const roots = new Set();
    if (changedRoot?.matches?.(PIQUERAY_ROOT_SELECTOR)) roots.add(changedRoot);
    for (const root of changedRoot?.querySelectorAll?.(PIQUERAY_ROOT_SELECTOR) || []) roots.add(root);
    for (const root of roots) {
        const state = classifySavedRoot(root);
        root.dataset.pqrVersionState = state;
        root.classList.toggle("pqr-policy-stale", state === "policy-stale");
        root.classList.toggle("pqr-structure-stale", state === "structure-stale");
        root.classList.toggle("pqr-version-unknown", state === "unknown");
        // Une politique ancienne est remise à niveau, jamais la structure.
        if (state === "policy-stale") {
            root.dataset.dsAuthoringVersion = CURRENT_AUTHORING_VERSION;
            root.dataset.vcss = CURRENT_MODULE_VERSION;
            root.dataset.vxml = CURRENT_MODULE_VERSION;
            root.dataset.vjs = CURRENT_MODULE_VERSION;
            root.dataset.pqrVersionState = "current";
            root.classList.remove("pqr-policy-stale");
        }
    }
}

export class PiquerayVersionGuardPlugin extends Plugin {
    static id = "piquerayVersionGuardPlugin";
    resources = { normalize_handlers: withSequence(2, applyVersionState) };
}

registry.category("website-plugins").add(PiquerayVersionGuardPlugin.id, PiquerayVersionGuardPlugin);
/** ODOO-019-VERSION-GUARD END */
