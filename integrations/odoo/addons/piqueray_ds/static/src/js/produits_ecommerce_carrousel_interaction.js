/**
 * ODOO-034-PRODUITS-CARROUSEL-INTERACTION — le défilement du carrousel Produits.
 *
 * Même patron que menu_mobile_interaction.js (noyau 19 : une `Interaction` de
 * `registry.category("public.interactions")`, délégation sur la racine, aucune
 * variante `.edit` → rien ne tourne dans l'éditeur, où les cartes restent
 * sélectionnables sans qu'un défilement ne se déclenche).
 *
 * Le MÉCANISME est le défilement natif du navigateur : le cadre est un conteneur
 * `overflow-x: auto` (porté par le CONTRAT, canal declared) avec un scroll-snap
 * posé dans responsive/produits-ecommerce.pqr.css (zone manuelle, CARRY-CODE-ONLY
 * par la matrice de capacités). Le glissement au doigt et la molette ne passent
 * pas par ici. Ce fichier ne fait que quatre choses :
 *   · Précédent / Suivant déplacent la piste d'UNE carte — le pas est LU dans le
 *     DOM (largeur de la première carte + écart calculé de la piste), jamais un
 *     nombre en dur : il suit les jetons par écran (260 · 322 · 326 · 363) ;
 *   · `aria-disabled` aux deux bouts, recalculé au défilement et au redimensionnement
 *     (l'apparence grisée attend un état `disabled` de ds.button — DW-034-002) ;
 *   · chaque carte reçoit son nom accessible « Titre, prix — produit n sur N »
 *     (elle RESTE un lien : aucun role), posé à l'exécution et idempotent : un
 *     HTML 2.1.0 sauvegardé n'est jamais migré, il doit fonctionner tel quel ;
 *   · au focus CLAVIER, la carte devient entière par le défilement minimal, que
 *     le snap termine (fin de piste calée à droite pour la dernière).
 * `prefers-reduced-motion: reduce` rend le déplacement instantané.
 * Les écouteurs scroll/resize/focusin portent `.noUpdate` : sans lui, colibri
 * relance `updateContent()` à chaque événement brut pour rien (aucun t-att/t-out
 * ici) — revue du 2026-09-07.
 */
import { registry } from "@web/core/registry";
import { Interaction } from "@web/public/interaction";

// ODOO-034-PRODUITS-CARROUSEL-INTERACTION BEGIN
const CADRE = '[data-pqr-part="root-carrousel"]';
const PISTE = '[data-pqr-part="root-produits"]';
const CARTE = '[data-pqr-part="produit-card"]';
const PREV = '[data-pqr-part="carousel-previous"]';
const NEXT = '[data-pqr-part="carousel-next"]';

/** Le pas d'une carte, lu dans le DOM : largeur réelle de la première carte +
 *  écart calculé de la piste. 0 si la piste est vide. */
export function pasDuCarrousel(cadre) {
    const piste = cadre.querySelector(PISTE);
    const carte = cadre.querySelector(CARTE);
    if (!piste || !carte) return 0;
    const ecart = parseFloat(getComputedStyle(piste).columnGap) || 0;
    return carte.getBoundingClientRect().width + ecart;
}

/** Nomme chaque carte « Titre, prix — produit n sur N ». La carte reste un LIEN :
 *  aucun role posé (`group` sur `a[href]` retirerait la sémantique de lien et
 *  l'aria-label remplacerait le nom — le prix disparaîtrait ; revue A3).
 *  Idempotent. */
export function nommerLesDiapositives(cadre) {
    const cartes = cadre.querySelectorAll(CARTE);
    cartes.forEach((carte, index) => {
        // Un HTML sauvegardé par une version antérieure (2.2.0 de travail) peut
        // porter role/aria-roledescription : on les retire, la carte est un lien.
        carte.removeAttribute("role");
        carte.removeAttribute("aria-roledescription");
        const titre = carte.querySelector('[data-pqr-part="produit-titre"]')?.textContent?.trim();
        const prix = carte.querySelector('[data-pqr-part="produit-prix"]')?.textContent?.trim();
        const nom = [titre, prix].filter(Boolean).join(", ");
        carte.setAttribute("aria-label", `${nom ? `${nom} — ` : ""}produit ${index + 1} sur ${cartes.length}`);
    });
}

/** Le nom de la région suit le titre éditable de la section, quand il existe ;
 *  l'aria-label statique du gabarit reste le repli. */
export function nommerLaRegion(root, cadre) {
    const titre = root.querySelector('[data-pqr-part="produits-ecommerce-title"]')?.textContent?.trim();
    if (titre) cadre.setAttribute("aria-label", titre);
}

/** Pose un attribut SEULEMENT s'il change. Appelé une fois par trame pendant tout
 *  un glissement : écrire la même valeur salit quand même le nœud pour le moteur,
 *  et la lecture de `scrollWidth` de la trame suivante doit alors purger style et
 *  layout — une boucle de reflow que ce carrousel s'infligeait à lui-même, à ~60 Hz,
 *  pour deux transitions de bout de piste par parcours. */
function poserSiChange(el, nom, valeur) {
    if (el && el.getAttribute(nom) !== valeur) el.setAttribute(nom, valeur);
}

/** Reflète les deux bouts de piste sur les boutons. Tolérance d'un pixel : un
 *  défilement lisse peut s'arrêter à une fraction. */
export function refleterLesBouts(root, cadre, prev = root.querySelector(PREV), next = root.querySelector(NEXT)) {
    const max = Math.max(0, cadre.scrollWidth - cadre.clientWidth);
    const auDebut = cadre.scrollLeft <= 1;
    const enButee = cadre.scrollLeft >= max - 1;
    poserSiChange(prev, "aria-disabled", auDebut ? "true" : "false");
    poserSiChange(next, "aria-disabled", enButee ? "true" : "false");
}

export class PiquerayProduitsCarrousel extends Interaction {
    static selector = ".s_pqr_produits_ecommerce";
    dynamicContent = {
        _root: {
            "t-on-click": this.onClick,
        },
        [CADRE]: {
            "t-on-scroll.noUpdate": this.onScroll,
        },
        [PISTE]: {
            "t-on-focusin.noUpdate": this.onFocusin,
        },
        _window: {
            "t-on-resize.noUpdate": this.onScroll,
        },
    };

    /** Cadre et boutons sont résolus UNE fois : ils ne bougent pas de la vie de
     *  l'Interaction (aucune variante `.edit`, donc un DOM public figé), et les
     *  rechercher par trame ajoutait trois `querySelector` au chemin chaud du
     *  glissement. */
    start() {
        this._cadre = this.el.querySelector(CADRE);
        this._prev = this.el.querySelector(PREV);
        this._next = this.el.querySelector(NEXT);
        if (!this._cadre) return;
        nommerLesDiapositives(this._cadre);
        nommerLaRegion(this.el, this._cadre);
        refleterLesBouts(this.el, this._cadre, this._prev, this._next);
    }

    /** @param {MouseEvent} ev */
    onClick(ev) {
        const bouton = ev.target.closest?.(`${PREV}, ${NEXT}`);
        if (!bouton || !this.el.contains(bouton)) return;
        const cadre = this._cadre;
        if (!cadre) return;
        ev.preventDefault();
        const sens = bouton.matches(NEXT) ? 1 : -1;
        const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        cadre.scrollBy({ left: sens * pasDuCarrousel(cadre), behavior: reduit ? "auto" : "smooth" });
    }

    /** Focus CLAVIER sur une carte : la rendre entière par le défilement MINIMAL,
     *  que le snap termine (début de carte, ou fin de piste pour la dernière).
     *  Chrome ne défile de lui-même que pour un élément hors champ — une carte
     *  coupée à droite (mesuré en Wide, 5e carte à 1637 sur 1728) reste coupée.
     *  `:focus-visible` seul : au clic souris, déplacer la carte sous le pointeur
     *  entre mousedown et mouseup ferait perdre le clic sur le lien.
     *  @param {FocusEvent} ev */
    onFocusin(ev) {
        const carte = ev.target.closest?.(CARTE);
        if (!carte || !this.el.contains(carte) || !carte.matches(":focus-visible")) return;
        const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        carte.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduit ? "auto" : "smooth" });
    }

    onScroll() {
        if (this._raf) return;
        this._raf = requestAnimationFrame(() => {
            this._raf = null;
            if (this._cadre) refleterLesBouts(this.el, this._cadre, this._prev, this._next);
        });
    }

    /** Défait ce que start() a posé : l'éditeur démarre puis détruit les
     *  Interactions publiques avant de sauver, et un attribut laissé là serait
     *  gelé dans le HTML sauvegardé (Odoo ne propage rien). Le gabarit garde ses
     *  attributs statiques (région, tabindex, Précédent désactivé au chargement). */
    destroy() {
        if (this._raf) cancelAnimationFrame(this._raf);
        this._raf = null;
        for (const carte of this.el.querySelectorAll(CARTE)) carte.removeAttribute("aria-label");
        this._next?.removeAttribute("aria-disabled");
        this._prev?.setAttribute("aria-disabled", "true");
        // Les trois références sont relâchées : l'éditeur détruit puis recrée les
        // Interactions publiques, et un nœud retenu ici survivrait à son DOM.
        this._cadre = null;
        this._prev = null;
        this._next = null;
    }
}

registry
    .category("public.interactions")
    .add("piqueray_ds.produits_ecommerce_carrousel", PiquerayProduitsCarrousel);
// ODOO-034-PRODUITS-CARROUSEL-INTERACTION END
