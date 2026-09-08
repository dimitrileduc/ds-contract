/**
 * ODOO-036-MOUVEMENT-REDUIT — UN seul relevé de `prefers-reduced-motion`.
 *
 * Deux Interactions publiques respectent ce réglage système (le fond vidéo du
 * hero, le défilement du carrousel Produits e-commerce). Chacune l'interrogeait
 * à sa façon — et `window.matchMedia()` rend un NOUVEL objet à chaque appel,
 * donc un `removeEventListener` sur un second appel ne désabonne jamais le
 * premier. Le `MediaQueryList` est créé ici une fois, partagé, et c'est le
 * même objet qui reçoit l'abonnement et le désabonnement.
 */

// ODOO-036-MOUVEMENT-REDUIT BEGIN
/** Le `MediaQueryList` partagé (null si le navigateur ne sait pas). */
export const MOUVEMENT_REDUIT = window.matchMedia?.("(prefers-reduced-motion: reduce)") ?? null;

/** Vrai si le visiteur a demandé moins d'animation au niveau système. */
export function animationRefusee() {
    return MOUVEMENT_REDUIT?.matches === true;
}
// ODOO-036-MOUVEMENT-REDUIT END
