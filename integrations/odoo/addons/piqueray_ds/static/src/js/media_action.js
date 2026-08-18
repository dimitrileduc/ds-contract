/**
 * ODOO-019-GOOGLE-REVIEWS-MEDIA — unique façade du dialogue média Odoo.
 * Le dialogue choisit une image publiable; le panneau Piqueray ne publie que
 * deux décisions : remplacement et texte alternatif. Crop, filtres, lien,
 * dimensions et format restent hors de la surface déclarée.
 */
import { BuilderAction } from "./odoo19_compat";
import { findCard, findMemberCard } from "./repeat_action";

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

/**
 * Lecture SEULE de l'image d'avatar : ne matérialise ni l'hôte ni le `img`.
 *
 * `avatarImage` a un effet de bord assumé — elle crée le conteneur pour que le
 * dialogue média ait une cible. Appelée depuis un `getValue`, cet effet devient
 * un défaut visible : le panneau lit la valeur du champ « alt » à la SÉLECTION
 * de la carte, donc sélectionner une carte suffisait à insérer une pastille
 * photo vide de 40 px devant le bloc identité, qui se décalait de 52 px vers la
 * droite sous les yeux du rédacteur. Mesuré le 2026-08-18 sur l'instance de
 * qualification. Un lecteur ne modifie pas le document.
 */
export function avatarImageExistante(card) {
    return card?.querySelector("[data-pqr-part='avatar-photo'] img") ?? null;
}

/** Une source d'avatar ne vient jamais du texte libre : le sélecteur média
 * Website produit une pièce jointe publiée par Odoo. Accepter un schéma ou un
 * hôte arbitraire ferait survivre une URL exécutable ou cassée dans le DOM
 * sauvegardé, même si l'image restait masquée. */
/** Pendant le cycle natif, Odoo garde le bitmap traité en data URL marquée
 * `o_modified_image_to_save`; le before_save la remplace par une URL publiée.
 * La retirer avant cela forcerait le placeholder — leçon payée d'abord par le
 * fond du Hero, puis re-payée par l'avatar d'avis le 2026-08-18.
 *
 * DEUX faits EXTERNES vivent ici : le nom de classe du noyau et la liste MIME
 * qu'il accepte. Un seul foyer — une copie par réconciliateur ferait d'un
 * ajout (`avif`) ou d'un renommage Odoo une édition à cinq sites dont les
 * quatre oubliés continueraient de paraître corrects. */
export function sourceEnAttenteNative(image, source) {
    return Boolean(image?.classList.contains("o_modified_image_to_save"))
        && /^data:image\/(?:gif|jpe?g|png|webp);base64,/i.test(source);
}

export function isPublishedAvatarSource(source) {
    if (!source) return false;
    // Une data URL n'est JAMAIS une source publiée /web/image : la reconnaître
    // ici évite de faire parser à `new URL` le bitmap entier (100 ko à 1 Mo
    // pendant qu'un upload est en cours), pour un résultat connu d'avance.
    if (source.startsWith("data:")) return false;
    try {
        const url = new URL(source, document.baseURI);
        return url.origin === window.location.origin && /^\/web\/(image|content)\//.test(url.pathname);
    } catch {
        return false;
    }
}

/** Une image sans URL publiée ne devient jamais un avatar. L'alternative, elle,
 * est dérivée plutôt qu'exigée — voir le commentaire dans le corps. */
export function reconcileAvatar(card) {
    const host = card?.querySelector("[data-pqr-part='avatar-photo']");
    const image = host?.querySelector("img");
    const source = image?.getAttribute("src") || "";
    if (image && !isPublishedAvatarSource(source) && !sourceEnAttenteNative(image, source)) {
        image.removeAttribute("src");
    }
    // L'ALT NE BLOQUE PLUS L'AFFICHAGE — il se dérive.
    //
    // Défaut mesuré le 2026-08-18 : le rédacteur posait une photo et ne voyait
    // rien. `complete` exigeait src ET alt, or le dialogue média ne renseigne
    // l'alt que si la pièce jointe porte une description — une image uploadée
    // n'en a pas. La règle « jamais d'avatar publié sans alternative » reste
    // tenue, mais par DÉRIVATION depuis l'auteur de la carte plutôt qu'en
    // refusant la photo : une exigence d'accessibilité ne doit pas se payer
    // par une fonctionnalité qui semble cassée.
    const publiee = Boolean(image?.getAttribute("src"));
    if (publiee && !image.getAttribute("alt")?.trim()) {
        const auteur = card?.querySelector("[data-pqr-part='auteur']")?.textContent?.trim();
        image.setAttribute("alt", auteur ? `Photo de ${auteur}` : "Photo de l’auteur de l’avis");
    }
    // 2.0.0 : l'avatar est DÉRIVÉ, plus basculé. Une photo publiée donne la
    // forme Photo (son alternative est dérivée juste au-dessus), tout le reste
    // donne l'initiale. C'est la règle métier de l'owner (« si photo c'est
    // photo, sinon initiale ») ramenée à son seul fait observable, au lieu de
    // deux booléens indépendants qui autorisaient les deux états absurdes.
    if (host) host.hidden = !publiee;
    const initiale = card?.querySelector("[data-pqr-part='avatar-initiale']");
    if (initiale) initiale.hidden = publiee;
    if (card) card.dataset.avatar = publiee ? "Photo" : "Initiale";
    return publiee;
}

export class ReplaceReviewAvatarAction extends BuilderAction {
    static id = "pqrReplaceReviewAvatar";
    static dependencies = ["media"];

    async load({ editingElement }) {
        const card = findCard(editingElement);
        const image = avatarImage(card);
        if (!card || !image) return null;
        // Le dialogue remplace lui-même `node`, puis le pipeline before_save
        // finalise l'image marquée `o_modified_image_to_save`. Réécrire `src`
        // dans un `onAttachmentChange` casse ce cycle et force le placeholder :
        // mesuré le 2026-08-18 sur l'instance — l'éditeur montrait la photo,
        // la page publique servait `/html_editor/.../placeholder`. Le fond du
        // Hero avait déjà documenté ce piège ; l'avatar d'avis y était tombé.
        await this.dependencies.media.openMediaDialog({
            node: image,
            visibleTabs: ["IMAGES"],
        }, this.editable);
        reconcileAvatar(card);
        return null;
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
        return avatarImageExistante(findCard(editingElement))?.getAttribute("alt") || "";
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
    if (!isPublishedAvatarSource(source) && !sourceEnAttenteNative(image, source)) image.removeAttribute("src");
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

// ODOO-019-EQUIPE-MEDIA BEGIN
export function memberPortraitImage(editingElement) {
    const image = findMemberCard(editingElement)?.querySelector(".member-picture__normal") || null;
    // Le dialogue média peut reconstruire le noeud et retirer l'adresse
    // d'authoring. La classe contractuelle survit et permet de la restaurer.
    if (image) image.dataset.pqrPart = "member-picture-normal";
    return image;
}

export function reconcileMemberPortrait(editingElement) {
    const image = memberPortraitImage(editingElement);
    if (!image) return false;
    const source = image.getAttribute("src") || "";
    if (!isPublishedAvatarSource(source) && !sourceEnAttenteNative(image, source)) image.removeAttribute("src");
    // `alt=""` est une alternative décorative valide. Surtout, Odoo remet
    // l'alt à vide lorsqu'un rédacteur choisit une pièce jointe existante :
    // masquer alors l'image fait croire que la sélection n'a rien changé.
    // La source sûre décide donc seule de la visibilité; l'alt reste piloté
    // séparément par le contrôle métier et toujours présent dans le DOM.
    if (!image.hasAttribute("alt")) image.setAttribute("alt", "");
    const visible = Boolean(image.getAttribute("src"));
    image.hidden = !visible;
    return visible;
}

export class ReplaceMemberPortraitAction extends BuilderAction {
    static id = "pqrReplaceMemberPortrait";
    static dependencies = ["media"];

    async load({ editingElement }) {
        const card = findMemberCard(editingElement);
        const image = memberPortraitImage(card);
        if (!card || !image) return null;
        // Comme pour Hero, le cycle natif doit conserver son data URL marquée
        // jusqu'à ImageSavePlugin. Réécrire `src` dans onAttachmentChange
        // force Odoo à sauvegarder son placeholder à la place du portrait.
        await this.dependencies.media.openMediaDialog({
            node: image,
            visibleTabs: ["IMAGES"],
        }, this.editable);
        reconcileMemberPortrait(card);
        return null;
    }

    apply({ editingElement }) {
        reconcileMemberPortrait(editingElement);
    }
}

export class SetMemberPortraitAltAction extends BuilderAction {
    static id = "pqrSetMemberPortraitAlt";
    getValue({ editingElement }) {
        return memberPortraitImage(editingElement)?.getAttribute("alt") || "";
    }
    apply({ editingElement, value }) {
        const image = memberPortraitImage(editingElement);
        if (!image) return;
        image.setAttribute("alt", String(value || "").trim());
        reconcileMemberPortrait(editingElement);
    }
}
// ODOO-019-EQUIPE-MEDIA END

// ODOO-019-DEVIS-MEDIA BEGIN
function devisRoot(editingElement) {
    return editingElement?.closest?.(".s_pqr_devis") || null;
}

export function devisBackgroundImage(editingElement) {
    const image = devisRoot(editingElement)?.querySelector(".devis__Background") || null;
    // Même règle que Hero : le pipeline média natif peut reconstruire les
    // attributs du noeud ; la classe contractuelle survit et sert d'ancre pour
    // restaurer l'adresse d'authoring, sans état parallèle.
    if (image) image.dataset.pqrPart = "devis-background";
    return image;
}

/** Le contrat ne transporte pas le bitmap Figma (liaison NONE, défaut vide).
 * Le seul transport autorisé en production est une pièce jointe publiée par le
 * dialogue média Odoo — même frontière que Hero. */
export function reconcileDevisBackground(editingElement) {
    const image = devisBackgroundImage(editingElement);
    if (!image) return false;
    const source = image.getAttribute("src") || "";
    if (!isPublishedAvatarSource(source) && !sourceEnAttenteNative(image, source)) image.removeAttribute("src");
    // `alt=""` reste une alternative décorative valide (plan déclaré décoratif
    // par le contrat) ; l'alt ne décide jamais de la visibilité.
    if (!image.hasAttribute("alt")) image.setAttribute("alt", "");
    return Boolean(image.getAttribute("src"));
}

export class ReplaceDevisBackgroundAction extends BuilderAction {
    static id = "pqrReplaceDevisBackground";
    static dependencies = ["media"];

    async load({ editingElement }) {
        const root = devisRoot(editingElement);
        const image = devisBackgroundImage(root);
        if (!image) return null;
        // Le dialogue remplace lui-même `node`, puis before_save finalise toute
        // image `o_modified_image_to_save`. Réécrire `src` dans
        // onAttachmentChange forcerait Odoo à sauvegarder son placeholder.
        await this.dependencies.media.openMediaDialog({
            node: image,
            visibleTabs: ["IMAGES"],
        }, this.editable);
        reconcileDevisBackground(root);
        return null;
    }

    apply({ editingElement }) {
        reconcileDevisBackground(editingElement);
    }
}

export class SetDevisBackgroundAltAction extends BuilderAction {
    static id = "pqrSetDevisBackgroundAlt";
    getValue({ editingElement }) {
        return devisBackgroundImage(editingElement)?.getAttribute("alt") || "";
    }
    apply({ editingElement, value }) {
        const image = devisBackgroundImage(editingElement);
        if (!image) return;
        image.setAttribute("alt", String(value || "").trim());
        reconcileDevisBackground(editingElement);
    }
}
// ODOO-019-DEVIS-MEDIA END

// ODOO-019-SAV-MEDIA BEGIN
function savRoot(editingElement) {
    return editingElement?.closest?.(".s_pqr_sav") || null;
}

export function savBackgroundImage(editingElement) {
    const image = savRoot(editingElement)?.querySelector(".sav__background") || null;
    // Le pipeline média natif reconstruit les attributs de l'image après upload
    // et peut retirer l'adresse d'authoring. La classe contractuelle survit :
    // on restaure l'adresse sur le même noeud, sans état parallèle.
    if (image) image.dataset.pqrPart = "sav-background";
    return image;
}

export function savPhotoImage(editingElement) {
    const image = savRoot(editingElement)?.querySelector(".sav__img") || null;
    if (image) image.dataset.pqrPart = "sav-photo";
    return image;
}

/** Deux plans d'image sur la même racine : la réconciliation est commune, la
 * résolution du noeud reste propre à chaque plan pour qu'un remplacement ne
 * touche jamais l'autre. Comme pour Hero, le cycle natif conserve sa data URL
 * marquée `o_modified_image_to_save` jusqu'à ImageSavePlugin. Un `alt` vide
 * reste une alternative décorative valide et ne masque jamais le plan. */
function reconcileSavImage(image) {
    if (!image) return false;
    const source = image.getAttribute("src") || "";
    if (!isPublishedAvatarSource(source) && !sourceEnAttenteNative(image, source)) image.removeAttribute("src");
    if (!image.hasAttribute("alt")) image.setAttribute("alt", "");
    return Boolean(image.getAttribute("src"));
}

export const reconcileSavBackground = (editingElement) => reconcileSavImage(savBackgroundImage(editingElement));
export const reconcileSavPhoto = (editingElement) => reconcileSavImage(savPhotoImage(editingElement));

export class ReplaceSavBackgroundAction extends BuilderAction {
    static id = "pqrReplaceSavBackground";
    static dependencies = ["media"];

    async load({ editingElement }) {
        const image = savBackgroundImage(editingElement);
        if (!image) return null;
        // Le dialogue remplace lui-même `node` ; réécrire `src` dans
        // onAttachmentChange forcerait Odoo à sauvegarder son placeholder.
        await this.dependencies.media.openMediaDialog({
            node: image,
            visibleTabs: ["IMAGES"],
        }, this.editable);
        reconcileSavBackground(editingElement);
        return null;
    }

    apply({ editingElement }) {
        reconcileSavBackground(editingElement);
    }
}

export class SetSavBackgroundAltAction extends BuilderAction {
    static id = "pqrSetSavBackgroundAlt";
    getValue({ editingElement }) {
        return savBackgroundImage(editingElement)?.getAttribute("alt") || "";
    }
    apply({ editingElement, value }) {
        const image = savBackgroundImage(editingElement);
        if (!image) return;
        image.setAttribute("alt", String(value || "").trim());
        reconcileSavBackground(editingElement);
    }
}

export class ReplaceSavPhotoAction extends BuilderAction {
    static id = "pqrReplaceSavPhoto";
    static dependencies = ["media"];

    async load({ editingElement }) {
        const image = savPhotoImage(editingElement);
        if (!image) return null;
        await this.dependencies.media.openMediaDialog({
            node: image,
            visibleTabs: ["IMAGES"],
        }, this.editable);
        reconcileSavPhoto(editingElement);
        return null;
    }

    apply({ editingElement }) {
        reconcileSavPhoto(editingElement);
    }
}

export class SetSavPhotoAltAction extends BuilderAction {
    static id = "pqrSetSavPhotoAlt";
    getValue({ editingElement }) {
        return savPhotoImage(editingElement)?.getAttribute("alt") || "";
    }
    apply({ editingElement, value }) {
        const image = savPhotoImage(editingElement);
        if (!image) return;
        image.setAttribute("alt", String(value || "").trim());
        reconcileSavPhoto(editingElement);
    }
}
// ODOO-019-SAV-MEDIA END
