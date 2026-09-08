/**
 * ODOO-036-HERO-VIDEO-INTERACTION — le seul refus du fond video.
 *
 * La video du hero joue PARTOUT, a toutes les largeurs : c'est une decision
 * owner du 2026-09-08, et elle est le prolongement direct du responsive — un
 * hero se comporte pareil sur tous les ecrans, l'affiche n'est qu'un repli
 * quand le navigateur ne lit pas la video.
 *
 * Une seule exception, et elle vient du visiteur lui-meme, jamais de nous :
 * `prefers-reduced-motion: reduce`, un reglage systeme (iOS, Android, Windows,
 * macOS). Les gens l'activent pour des raisons physiques — mouvement
 * vestibulaire, migraines. Une boucle infinie plein cadre est exactement ce que
 * ce reglage vise, et AUCUN mecanisme natif d'Odoo ne le respecte (mesure du
 * 2026-09-08 : la video de fond native est un iframe de plateforme, sans aucun
 * egard pour ce cas). La CSS seule ne sait pas mettre une video en pause :
 * d'ou ce script, et pas une `@media`.
 *
 * La sortie est propre : la source part, la video affiche son `poster`, et le
 * hero est visuellement identique a l'image fixe qu'il montrait avant 2.2.0.
 */
import { registry } from "@web/core/registry";
import { Interaction } from "@web/public/interaction";
import { MOUVEMENT_REDUIT, animationRefusee } from "@piqueray_ds/js/mouvement_reduit";

// ODOO-036-HERO-VIDEO-INTERACTION BEGIN
/** Coupe le film sans toucher au cadre : la source part, l'affiche reste. */
export function couperLeFilm(video) {
    if (!video || !video.getAttribute("src")) return;
    video.dataset.pqrVideoSrc = video.getAttribute("src");
    video.removeAttribute("src");
    video.removeAttribute("autoplay");
    video.load();
}

/** Rend le film si le visiteur change d'avis en cours de route. */
export function rendreLeFilm(video) {
    if (!video || video.getAttribute("src") || !video.dataset.pqrVideoSrc) return;
    video.setAttribute("src", video.dataset.pqrVideoSrc);
    video.setAttribute("autoplay", "autoplay");
    video.load();
    video.play?.().catch(() => {
        // Un refus d'autoplay n'est pas une erreur : Safari le fait en mode
        // economie d'energie, sans API pour le detecter. L'affiche prend le
        // relais, c'est exactement ce pour quoi elle existe.
    });
}

export class PiquerayHeroVideo extends Interaction {
    static selector = ".s_pqr_hero_video";

    setup() {
        this.video = this.el.querySelector(".hero-video__Background");
        this.appliquer();
    }

    appliquer() {
        if (!this.video) return;
        if (animationRefusee()) couperLeFilm(this.video);
        else rendreLeFilm(this.video);
    }

    start() {
        // La preference systeme peut changer sans rechargement. Le MEME objet
        // recoit l'abonnement et le desabonnement (voir mouvement_reduit.js).
        this.reagir = () => this.appliquer();
        MOUVEMENT_REDUIT?.addEventListener?.("change", this.reagir);
    }

    destroy() {
        if (!this.reagir) return;
        MOUVEMENT_REDUIT?.removeEventListener?.("change", this.reagir);
        this.reagir = null;
    }
}

registry.category("public.interactions").add("piqueray_ds.hero_video", PiquerayHeroVideo);
// ODOO-036-HERO-VIDEO-INTERACTION END
