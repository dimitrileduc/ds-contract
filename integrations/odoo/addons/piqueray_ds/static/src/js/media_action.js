/**
 * ODOO-019-GOOGLE-REVIEWS-MEDIA — unique façade du dialogue média Odoo.
 * Le dialogue choisit une image publiable; le panneau Piqueray ne publie que
 * deux décisions : remplacement et texte alternatif. Crop, filtres, lien,
 * dimensions et format restent hors de la surface déclarée.
 */
import { BuilderAction } from "./odoo19_compat";
import { findCard } from "./repeat_action";

// ODOO-019-GOOGLE-REVIEWS-MEDIA BEGIN
function avatarHost(card) {
    const profile = card?.querySelector(".review-card__profil");
    if (!profile) return null;
    let host = profile.querySelector("[data-pqr-part='avatar-photo']");
    if (!host) {
        host = document.createElement("div");
        host.className = "review-card__avatarPhoto";
        host.dataset.pqrPart = "avatar-photo";
        profile.insertBefore(host, profile.querySelector("[data-pqr-part='identite']"));
    }
    return host;
}

export function avatarImage(card) {
    const host = avatarHost(card);
    if (!host) return null;
    let image = host.querySelector("img");
    if (!image) {
        image = document.createElement("img");
        image.className = "o_editable_media";
        image.alt = "";
        host.append(image);
    }
    return image;
}

/** Une source d'avatar ne vient jamais du texte libre : le sélecteur média
 * Website produit une pièce jointe publiée par Odoo. Accepter un schéma ou un
 * hôte arbitraire ferait survivre une URL exécutable ou cassée dans le DOM
 * sauvegardé, même si l'image restait masquée. */
export function isPublishedAvatarSource(source) {
    if (!source) return false;
    try {
        const url = new URL(source, document.baseURI);
        return url.origin === window.location.origin && /^\/web\/(image|content)\//.test(url.pathname);
    } catch {
        return false;
    }
}

/** Une image sans URL ou sans alt ne devient jamais un avatar publié. */
export function reconcileAvatar(card) {
    const host = card?.querySelector("[data-pqr-part='avatar-photo']");
    const image = host?.querySelector("img");
    if (image && !isPublishedAvatarSource(image.getAttribute("src"))) {
        image.removeAttribute("src");
    }
    const complete = Boolean(image?.getAttribute("src")) && Boolean(image?.getAttribute("alt")?.trim());
    if (host) host.hidden = !complete;
    if (card) card.dataset.photo = complete ? "true" : "false";
    return complete;
}

export class ReplaceReviewAvatarAction extends BuilderAction {
    static id = "pqrReplaceReviewAvatar";
    static dependencies = ["media"];

    async load({ editingElement }) {
        const card = findCard(editingElement);
        const image = avatarImage(card);
        if (!card || !image) return null;
        // FileSelector émet l'attachment sur sa voie auto-sélectionnée après
        // upload. C'est la voie native qui porte `image_src` pour une image
        // nouvellement créée, donc la façade la recopie puis la réconcilie.
        return this.dependencies.media.openMediaDialog({
            node: image,
            visibleTabs: ["IMAGES"],
            onAttachmentChange: (attachment) => {
                const target = avatarImage(card);
                if (!target || !attachment) return;
                const source = attachment.image_src || attachment.url || "";
                if (source) target.setAttribute("src", source);
                target.setAttribute("alt", attachment.description || "");
                reconcileAvatar(card);
            },
        }, this.editable);
    }

    apply({ editingElement }) {
        const card = findCard(editingElement);
        if (!card) return;
        reconcileAvatar(card);
    }
}

export class SetReviewAvatarAltAction extends BuilderAction {
    static id = "pqrSetReviewAvatarAlt";
    getValue({ editingElement }) {
        return avatarImage(findCard(editingElement))?.getAttribute("alt") || "";
    }
    apply({ editingElement, value }) {
        const card = findCard(editingElement);
        const image = avatarImage(card);
        if (!card || !image) return;
        image.setAttribute("alt", String(value || "").trim());
        reconcileAvatar(card);
    }
}
// ODOO-019-GOOGLE-REVIEWS-MEDIA END

// ODOO-019-HERO-MEDIA BEGIN
function heroRoot(editingElement) {
    return editingElement?.closest?.(".s_pqr_hero") || null;
}

export function heroBackgroundImage(editingElement) {
    const image = heroRoot(editingElement)?.querySelector(".hero__Background") || null;
    // Le pipeline média natif reconstruit les attributs de l'image après upload
    // et peut retirer l'adresse d'authoring. La classe contractuelle, elle,
    // survit : on restaure donc l'adresse sur le même noeud, sans état parallèle.
    if (image) image.dataset.pqrPart = "hero-background";
    return image;
}

/** Le contrat ne transporte pas le bitmap Figma. Le seul transport autorisé en
 * production est donc une pièce jointe publiée par le dialogue média Odoo. */
export function reconcileHeroBackground(editingElement) {
    const image = heroBackgroundImage(editingElement);
    if (!image) return false;
    const source = image.getAttribute("src") || "";
    // Pendant le cycle natif, Odoo garde le bitmap traité en data URL et le
    // marque explicitement pour ImageSavePlugin. Cette exception disparaît au
    // before_save, qui produit ensuite une URL publiée /web/image. Sans la
    // classe native, une data URL reste une source hostile et est supprimée.
    const nativePending = image.classList.contains("o_modified_image_to_save") &&
        /^data:image\/(?:gif|jpe?g|png|webp);base64,/i.test(source);
    if (!isPublishedAvatarSource(source) && !nativePending) image.removeAttribute("src");
    return Boolean(image.getAttribute("src"));
}

export class ReplaceHeroBackgroundAction extends BuilderAction {
    static id = "pqrReplaceHeroBackground";
    static dependencies = ["media"];

    async load({ editingElement }) {
        const root = heroRoot(editingElement);
        const image = heroBackgroundImage(root);
        if (!image) return null;
        // Le dialogue remplace lui-même `node`, puis le pipeline before_save
        // finalise toute image `o_modified_image_to_save`. Réécrire `src` dans
        // onAttachmentChange casserait ce cycle et forcerait le placeholder.
        await this.dependencies.media.openMediaDialog({
            node: image,
            visibleTabs: ["IMAGES"],
        }, this.editable);
        reconcileHeroBackground(root);
        return null;
    }

    apply({ editingElement }) {
        reconcileHeroBackground(editingElement);
    }
}

export class SetHeroBackgroundAltAction extends BuilderAction {
    static id = "pqrSetHeroBackgroundAlt";
    getValue({ editingElement }) {
        return heroBackgroundImage(editingElement)?.getAttribute("alt") || "";
    }
    apply({ editingElement, value }) {
        const image = heroBackgroundImage(editingElement);
        if (!image) return;
        image.setAttribute("alt", String(value || "").trim());
        reconcileHeroBackground(editingElement);
    }
}
// ODOO-019-HERO-MEDIA END
