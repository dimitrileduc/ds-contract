/**
 * La couche de GOUVERNANCE du bloc Piqueray.
 *
 * Quatre déclarations, et chacune répond à un défaut CONSTATÉ en fonctionnement
 * sur l'instance jetable — pas à une crainte théorique :
 *
 *   1. retirer les options natives d'Odoo   — elles s'affichaient sur notre bloc
 *   2. fermer tous les textes               — le titre était éditable, à tort
 *   3. rouvrir les 3 textes voulus          — nommément, liste blanche
 *   4. le seul réglage à nous               — « Appel à l'action »
 *
 * ── Ce qui est DOCUMENTÉ, et ce qui ne l'est pas ────────────────────────────
 * DOCUMENTÉ (building_blocks.rst 19.0) : `BaseOptionComponent` et ses `selector`
 * / `exclude` / `applyTo`, le `Plugin` enregistré dans
 * `registry.category("website-plugins")`, `BuilderRow` / `BuilderCheckbox`.
 *
 * NON DOCUMENTÉ, lu dans le code d'Odoo 19 et employé par Odoo lui-même :
 *   · `content_editable_selectors` / `content_not_editable_selectors`
 *     (builder_content_editable_plugin.js) — ce sont des RESSOURCES, donc
 *     extensibles depuis un module tiers ;
 *   · `DISABLED_NAMESPACE` (toolbar_plugin.js:98), patron de inline_code.js:37 ;
 *   · le patch des classes d'option ci-dessous.
 *
 * La distinction est maintenue exprès : ce qui n'est pas documenté peut bouger
 * à la version 20 et devra être re-testé.
 */
import { BaseOptionComponent } from "@html_builder/core/utils";
import { Plugin } from "@html_editor/plugin";
import { DISABLED_NAMESPACE } from "@html_editor/main/toolbar/toolbar_plugin";
import { closestElement } from "@html_editor/utils/dom_traversal";
import { registry } from "@web/core/registry";

// Les options natives à écarter. Elles sont importées, donc si Odoo en renomme
// une, le module casse BRUYAMMENT au chargement — ce qui est exactement ce
// qu'on veut. Un échec silencieux nous rendrait un bloc non gouverné qui a
// l'air gouverné.
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

/**
 * La racine du bloc. Une seule constante — tous les sélecteurs en dérivent.
 *
 * ⚠️ LIMITE NOMMÉE, et c'est LE chiffre que cette maquette existe pour produire :
 * cette constante ne factorise QUE le bloc Présentation. Les quatre sections de
 * ce fichier sont per-bloc, sans exception — les options natives sont écartées
 * en ajoutant ROOT à l'`exclude` de huit classes d'Odoo, les textes modifiables
 * préfixent ROOT, `static selector` et `applyTo` l'enferment. Un SECOND bloc
 * n'hérite de RIEN : il re-paie les quatre sections en entier.
 *
 * Conséquence pour la décision « émetteur ou main » : ce module mesure le coût
 * du PREMIER bloc, jamais celui du second — et c'est le second qui tranche. La
 * moitié rendu (gabarits + CSS) est prouvée mécanique et dérivable des tableaux
 * de zones ; la moitié gouvernance, ci-dessous, ne l'est pas encore. Repris à
 * NON-PORTES.md et au rapport de décision.
 */
const ROOT = ".s_piqueray_presentation";

// ---------------------------------------------------------------------------
// 1. RETIRER LES OPTIONS NATIVES — chirurgicalement
// ---------------------------------------------------------------------------
/**
 * Pourquoi patcher la classe plutôt que changer la balise racine.
 *
 * Les cinq options ci-dessous se branchent toutes sur `section` (vérifié :
 * `website_background_option_plugin.js:17`, `content_width_option_plugin.js:10`,
 * `visibility_option.js:6`, `layout_option.js:8`). Deux voies existaient pour
 * s'en défaire :
 *
 *   (a) ne pas être une `<section>` — coupe tout d'un coup, mais nous ferait le
 *       PREMIER bloc de structure non-`section` sur 127, et nous coûterait
 *       l'éditabilité automatique ;
 *   (b) retirer notre sélecteur de leur `exclude` — chirurgical, nommé, réversible.
 *
 * (b) retenu. Deux faits le rendent possible, tous deux vérifiés : les classes
 * sont EXPORTÉES, et `computeContainers` relit `exclude` À CHAQUE SÉLECTION
 * (`builder_options_plugin.js:307`) — donc muter la propriété statique au
 * chargement suffit. Odoo pointe d'ailleurs lui-même vers cette voie :
 * « todo: remove that resource as we should be able to patch the class the
 * normal way » (`builder_options_plugin.js:164`).
 *
 * `patch_builder_options`, la ressource officielle, ne pouvait PAS servir ici :
 * elle retrouve sa cible par `static name`, et seules 7 options en déclarent un
 * dans tout Odoo 19 — ni Background ni Content Width n'en font partie.
 */
const OPTIONS_NATIVES_ECARTEES = [
    // Le fond est servi par QUATRE classes, pas une — trouvé en testant : après
    // avoir patché les deux plus évidentes, « Background Colors » était TOUJOURS
    // là. Celle qui matche une `section` nue est BGColorImage (son sélecteur
    // commence par `section`), plus la variante Carousel.
    WebsiteBackgroundCarouselOption,
    WebsiteBackgroundBGColorImageOption,
    WebsiteBackgroundBGColorOption,
    WebsiteBackgroundOnlyBGImageOption,
    ContentWidthOption, // largeur du contenu
    VisibilityOption, // conditions de visibilité
    LayoutOption, // mise en page + espacements
    // « Height : Auto / 50% / 100% » ne vient pas d'une option de mise en page
    // comme on pourrait le croire, mais du bouton de défilement. Identifié en
    // cherchant le gabarit qui contient ces trois libellés.
    ScrollButtonOption,
];

for (const Option of OPTIONS_NATIVES_ECARTEES) {
    Option.exclude = Option.exclude ? `${Option.exclude}, ${ROOT}` : ROOT;
}

// ---------------------------------------------------------------------------
// 2 et 3. L'ÉDITABILITÉ — fermer d'abord, rouvrir nommément
// ---------------------------------------------------------------------------
/**
 * FAIT CONTRE-INTUITIF, constaté puis expliqué. `o_not_editable` NE FERME PAS
 * l'édition de texte à l'intérieur d'un snippet : `isValidContentEditable`
 * (builder_content_editable_plugin.js) ne l'honore que si le `.o_not_editable`
 * est HORS d'un `[data-snippet]`. C'est délibéré chez Odoo — les sous-parties
 * d'un bloc doivent rester modifiables. C'est ce qui explique le titre éditable
 * qu'on a observé en vrai malgré le balisage.
 *
 * Donc : on ferme la racine, puis on rouvre les trois textes. Par défaut fermé,
 * jamais par défaut ouvert — un élément ajouté demain au gabarit sera verrouillé
 * par oubli, pas ouvert par oubli.
 */
/** Le seul texte que le contrat déclare SANS mise en forme possible. Nommé une
 *  fois : il sert et à la liste blanche ci-dessous, et à la coupure de la barre
 *  d'outils plus bas. Les deux dérivaient la même chaîne chacune de leur côté —
 *  un désaccord y aurait été SILENCIEUX, et il aurait rouvert le gras sur le
 *  libellé du bouton. */
const LIBELLE_BOUTON = `${ROOT} .button__label`;

const TEXTES_MODIFIABLES = [
    `${ROOT} .presentation__Texte`, // rich-text au contrat (marque `strong`)
    `${ROOT} .section-header__Titre`, // rich-text au contrat (marque `strong`)
    LIBELLE_BOUTON, // `text` au contrat — aucune mise en forme
];

// ---------------------------------------------------------------------------
// 4. LE RÉGLAGE DU PANNEAU — un seul, et c'est le résultat de la règle
// ---------------------------------------------------------------------------
export class PiquerayPresentationOption extends BaseOptionComponent {
    static template = "piqueray_ds.PresentationOption";
    static selector = ROOT;
    // `applyTo` fait redescendre l'action sur l'ENFANT porteur du CTA, alors que
    // la case s'affiche quand on sélectionne le BLOC. C'est le patron
    // `CardWithoutWidthOption` d'Odoo : le parent possède le réglage, l'enfant
    // le subit.
    static applyTo = ":scope .presentation__cta";
}

export class PiquerayOptionPlugin extends Plugin {
    static id = "piquerayOption";

    resources = {
        // Fermer TOUT le bloc, racine comprise — un seul sélecteur suffit, et
        // c'est vérifié : la fermeture porte sur le sous-arbre entier, donc le
        // conteneur de page et les deux colonnes sont couverts par cette ligne
        // seule. Relevé sur l'instance après enregistrement PUIS réouverture —
        // `isContentEditable` faux sur la racine, le conteneur, `colGauche` et
        // `wrapper` (proofs/us2/gestes-us2-gouverne.json, contrôle 1).
        content_not_editable_selectors: [ROOT],
        // …puis rouvrir exactement trois textes.
        content_editable_selectors: TEXTES_MODIFIABLES,

        // Aucune mise en forme sur le libellé du bouton : le contrat le porte en
        // `text`, pas en `rich-text`. Autoriser du gras ou une couleur y
        // produirait un fait qu'aucun contrat ne décrit — invisible au
        // différentiel, exactement la dérive qu'on traque côté code.
        toolbar_namespace_providers: [
            (targetedNodes) =>
                targetedNodes.length &&
                targetedNodes.every((node) => closestElement(node, LIBELLE_BOUTON))
                    ? DISABLED_NAMESPACE
                    : undefined,
        ],

        builder_options: [PiquerayPresentationOption],
    };
}

registry.category("website-plugins").add(PiquerayOptionPlugin.id, PiquerayOptionPlugin);
