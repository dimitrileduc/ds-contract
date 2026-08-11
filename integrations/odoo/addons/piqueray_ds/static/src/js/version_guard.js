/** ODOO-019-VERSION-GUARD BEGIN
 * Politique vivante : classer le HTML sauvegardé sans jamais le migrer.
 * Seules les classes/politiques d'authoring sont réappliquées à l'ouverture.
 */
import { Plugin, registry, withSequence } from "./odoo19_compat";
// La liste des racines a UN seul propriétaire. La réécrire ici donnerait une
// copie qui vieillit en silence : une troisième section serait gouvernée par
// `authoring.js` et invisible pour la politique de versions.
import { PIQUERAY_ROOT_SELECTOR } from "./authoring";

export const CURRENT_GRAPH_DIGEST = "9cf060ab2f36fecfcf9f54903725ef86648b1fd43cdb8f57acedc66e89d8f9f0";
export const CURRENT_AUTHORING_VERSION = "1.0.0";
export const CURRENT_MODULE_VERSION = "19.0.1.0.1";
const CONTRACT_VERSIONS = { "ds.presentation": "2.5.0", "ds.google-reviews": "1.0.0" };

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
