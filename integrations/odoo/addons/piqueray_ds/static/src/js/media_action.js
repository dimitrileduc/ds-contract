/**
 * ODOO-019-GOOGLE-REVIEWS-MEDIA — unique façade du dialogue média Odoo.
 * Le dialogue choisit une image publiable; le panneau Piqueray ne publie que
 * deux décisions : remplacement et texte alternatif. Crop, filtres, lien,
 * dimensions et format restent hors de la surface déclarée.
 */
import { BuilderAction } from "./odoo19_compat";
import { findCard, findMemberCard, findCarte, PHOTO_CARTE } from "./repeat_action";

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
        // La pastille est CACHÉE tant que l'avis est en mode « initiale ». Or
        // Odoo choisit la taille de l'image en MESURANT son emplacement au
        // moment du dialogue : caché = 0 px = aucun redimensionnement, et la
        // photo partait en 1920 px pour 40 affichés (mesuré le 2026-09-16 :
        // JPEG 1920×1280, 235 Ko, par avatar). On la montre le temps du
        // dialogue ; `reconcileAvatar` re-dérive ensuite sa visibilité selon
        // qu'une photo est publiée ou non — une annulation la re-cache donc.
        const host = avatarHost(card);
        if (host) host.hidden = false;
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
    // Le dialogue média d'Odoo ne modifie pas la balise : il la REMPLACE par une
    // neuve, et tout attribut qu'il ne connaît pas disparaît. Au rendu, Odoo
    // pose ensuite `loading="lazy"` sur toute image sans consigne. Un hero
    // remplacé par le rédacteur repassait donc en différé — ~400 ms de premier
    // écran perdus, en silence (mesuré le 2026-09-16 : `loading="lazy"`, plus
    // de `fetchpriority`). On remet ici les deux consignes du gabarit
    // (components.xml, part hero-background) : cette fonction repasse déjà sur
    // l'image après chaque dialogue, c'est l'endroit prévu pour ça.
    image.setAttribute("loading", "eager");
    image.setAttribute("fetchpriority", "high");
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

// EB-029 (décision owner 2026-09-09) : la photo de SURVOL (`member-picture-underlay`,
// classe `.member-picture__funIa`) est éditable comme le portrait normal. La config la
// déclarait `controlled` depuis 2.1.1 mais aucun panneau/action ne la servait. Plan
// arrière : on NE bascule PAS `hidden` (une survol vide n'effondre rien, le normal est
// au-dessus) — sinon un plan masqué au repos deviendrait inéditable (cf. member-picture).
export function memberSurvolImage(editingElement) {
    const image = findMemberCard(editingElement)?.querySelector(".member-picture__funIa") || null;
    if (image) image.dataset.pqrPart = "member-picture-underlay";
    return image;
}

export function reconcileMemberSurvol(editingElement) {
    const image = memberSurvolImage(editingElement);
    if (!image) return false;
    const source = image.getAttribute("src") || "";
    if (!isPublishedAvatarSource(source) && !sourceEnAttenteNative(image, source)) image.removeAttribute("src");
    if (!image.hasAttribute("alt")) image.setAttribute("alt", "");
    return Boolean(image.getAttribute("src"));
}

export class ReplaceMemberSurvolAction extends BuilderAction {
    static id = "pqrReplaceMemberSurvol";
    static dependencies = ["media"];

    async load({ editingElement }) {
        const card = findMemberCard(editingElement);
        const image = memberSurvolImage(card);
        if (!card || !image) return null;
        await this.dependencies.media.openMediaDialog({
            node: image,
            visibleTabs: ["IMAGES"],
        }, this.editable);
        reconcileMemberSurvol(card);
        return null;
    }

    apply({ editingElement }) {
        reconcileMemberSurvol(editingElement);
    }
}

export class SetMemberSurvolAltAction extends BuilderAction {
    static id = "pqrSetMemberSurvolAlt";
    getValue({ editingElement }) {
        return memberSurvolImage(editingElement)?.getAttribute("alt") || "";
    }
    apply({ editingElement, value }) {
        const image = memberSurvolImage(editingElement);
        if (!image) return;
        image.setAttribute("alt", String(value || "").trim());
        reconcileMemberSurvol(editingElement);
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

// ODOO-022-REASSURANCES-MEDIA BEGIN
// Image de carte (R2c) — même façade que le portrait Équipe : dialogue média
// natif, source publiée /web/image only, cycle o_modified_image_to_save préservé.
// `carteImage` / `reconcileCarteImage` servent TOUTES les familles de cartes
// (Réassurances et Catégories) : la politique de source publiable n'a qu'une
// écriture, l'adresse est paramétrée par PHOTO_CARTE (repeat_action.js).
// Différence assumée : PAS de bascule `hidden`. La carte n'a qu'UN plan (pas
// d'underlay funIa) ; masquer l'image vide effondrerait la boîte et ferait
// diverger la mesure visuelle du contrat, qui pose une boîte vide dimensionnée.
export function carteImage(editingElement) {
    const image = findCarte(editingElement)?.querySelector(PHOTO_CARTE) || null;
    // Le dialogue média peut reconstruire le nœud et retirer l'adresse
    // d'authoring ; la classe contractuelle survit et permet de la restaurer.
    // Écriture GARDÉE : `getValue` passe ici à chaque recalcul d'état du
    // panneau, et un `setAttribute` même à valeur inchangée émet une
    // MutationRecord qui réveille le normaliseur (authoring.js).
    if (image && image.dataset.pqrPart !== "carte-image") image.dataset.pqrPart = "carte-image";
    return image;
}

export function reconcileCarteImage(editingElement) {
    const image = carteImage(editingElement);
    if (!image) return false;
    const source = image.getAttribute("src") || "";
    if (!isPublishedAvatarSource(source) && !sourceEnAttenteNative(image, source)) image.removeAttribute("src");
    if (!image.hasAttribute("alt")) image.setAttribute("alt", "");
    return Boolean(image.getAttribute("src"));
}

export class ReplaceCarteImageAction extends BuilderAction {
    static id = "pqrReplaceCarteImage";
    static dependencies = ["media"];

    async load({ editingElement }) {
        const carte = findCarte(editingElement);
        const image = carteImage(carte);
        if (!carte || !image) return null;
        // Le cycle natif conserve son data URL marquée jusqu'à ImageSavePlugin :
        // réécrire `src` dans onAttachmentChange forcerait le placeholder.
        await this.dependencies.media.openMediaDialog({
            node: image,
            visibleTabs: ["IMAGES"],
        }, this.editable);
        reconcileCarteImage(carte);
        return null;
    }

    apply({ editingElement }) {
        reconcileCarteImage(editingElement);
    }
}

// R2d — LIMITE NOMMÉE : la route `items` du contrat ne porte pas d'alt ; la
// valeur vit dans l'instance Odoo, comme l'URL (précédent SetMemberPortraitAlt).
export class SetCarteImageAltAction extends BuilderAction {
    static id = "pqrSetCarteImageAlt";
    getValue({ editingElement }) {
        return carteImage(editingElement)?.getAttribute("alt") || "";
    }
    apply({ editingElement, value }) {
        const image = carteImage(editingElement);
        if (!image) return;
        image.setAttribute("alt", String(value || "").trim());
        reconcileCarteImage(editingElement);
    }
}
// ODOO-022-REASSURANCES-MEDIA END

// ODOO-023-CATEGORIES-MEDIA BEGIN
// Image de carte-catégorie empilée (C8) — même façade que Réassurances/Équipe :
// dialogue média natif, source publiée /web/image only, cycle
// o_modified_image_to_save préservé. La carte empilée n'a qu'UN plan image ; on
// ne masque pas la boîte vide (le contrat pose une boîte dimensionnée). Action à
// identifiant PROPRE (les ids builder sont globaux).
// Les DEUX styles de carte portent une photo, sous deux classes contractuelles
// distinctes : `categorieImage` (empilé, photo au-dessus du texte) et
// `photoSuperpose` (superposé, photo pleine sous le voile). Ne chercher que la
// première rendait le bouton « Remplacer » inerte sur le style superposé —
// constaté par l'owner le 2026-08-22, à l'ouverture du réglage de type de carte.
// Les deux classes vivent dans PHOTO_CATEGORIE (repeat_action.js), agrégée dans
// PHOTO_CARTE : les gestes ci-dessous délèguent aux helpers partagés.
export class ReplaceCarteCategorieImageAction extends BuilderAction {
    static id = "pqrReplaceCarteCategorieImage";
    static dependencies = ["media"];

    async load({ editingElement }) {
        const carte = findCarte(editingElement);
        const image = carteImage(carte);
        if (!carte || !image) return null;
        await this.dependencies.media.openMediaDialog({
            node: image,
            visibleTabs: ["IMAGES"],
        }, this.editable);
        reconcileCarteImage(carte);
        return null;
    }

    apply({ editingElement }) {
        reconcileCarteImage(editingElement);
    }
}

// C9 — LIMITE NOMMÉE : la route `cartes` (arrayOf) du contrat ne porte pas d'alt ;
// la valeur vit dans l'instance Odoo, comme l'URL (précédent SetCarteImageAlt).
export class SetCarteCategorieImageAltAction extends BuilderAction {
    static id = "pqrSetCarteCategorieImageAlt";
    getValue({ editingElement }) {
        return carteImage(editingElement)?.getAttribute("alt") || "";
    }
    apply({ editingElement, value }) {
        const image = carteImage(editingElement);
        if (!image) return;
        image.setAttribute("alt", String(value || "").trim());
        reconcileCarteImage(editingElement);
    }
}
// ODOO-023-CATEGORIES-MEDIA END

// ODOO-038-REALISATIONS-MEDIA BEGIN
// EB-001 (décision owner 2026-09-09) — Photo d'une tuile Réalisations : dialogue média natif
// (la tuile porte aussi `data-pqr-native-image="1"` : le double-clic natif reste possible),
// source publiée /web/image only, alt au panneau. L'adresse d'authoring de l'image est
// `tuile-image` (contrat ds.realisation) — PAS `carte-image` : on n'emprunte pas carteImage(),
// qui réécrirait l'adresse. La classe contractuelle `.realisation__Image` survit au dialogue.
const PHOTO_REALISATION = ".realisation__Image";

export function realisationImage(editingElement) {
    const image = findCarte(editingElement)?.querySelector(PHOTO_REALISATION) || null;
    if (image && image.dataset.pqrPart !== "tuile-image") image.dataset.pqrPart = "tuile-image";
    return image;
}

export function reconcileRealisationImage(editingElement) {
    const image = realisationImage(editingElement);
    if (!image) return false;
    const source = image.getAttribute("src") || "";
    if (!isPublishedAvatarSource(source) && !sourceEnAttenteNative(image, source)) image.removeAttribute("src");
    if (!image.hasAttribute("alt")) image.setAttribute("alt", "");
    return Boolean(image.getAttribute("src"));
}

export class ReplaceRealisationImageAction extends BuilderAction {
    static id = "pqrReplaceRealisationImage";
    static dependencies = ["media"];

    async load({ editingElement }) {
        const tuile = findCarte(editingElement);
        const image = realisationImage(tuile);
        if (!tuile || !image) return null;
        await this.dependencies.media.openMediaDialog({
            node: image,
            visibleTabs: ["IMAGES"],
        }, this.editable);
        reconcileRealisationImage(tuile);
        return null;
    }

    apply({ editingElement }) {
        reconcileRealisationImage(editingElement);
    }
}

export class SetRealisationImageAltAction extends BuilderAction {
    static id = "pqrSetRealisationImageAlt";
    getValue({ editingElement }) {
        return realisationImage(editingElement)?.getAttribute("alt") || "";
    }
    apply({ editingElement, value }) {
        const image = realisationImage(editingElement);
        if (!image) return;
        image.setAttribute("alt", String(value || "").trim());
        reconcileRealisationImage(editingElement);
    }
}
// ODOO-038-REALISATIONS-MEDIA END

// ODOO-025-HERO-VIDEO-MEDIA BEGIN
function heroVideoRoot(editingElement) {
    return editingElement?.closest?.(".s_pqr_hero_video") || null;
}

/** Le plan média du HeroVideo. Depuis ds.hero-video 2.2.0 c'est une balise
 * `<video>` : le film est un asset gouverné de l'addon (`src`), l'affiche est du
 * contenu (`poster`). Le rédacteur ne remplace donc PAS une image mais une
 * affiche — même geste, autre attribut. */
export function heroVideoPosterImage(editingElement) {
    const media = heroVideoRoot(editingElement)?.querySelector(".hero-video__Background") || null;
    // Le pipeline média natif reconstruit les attributs après upload et peut
    // retirer l'adresse d'authoring. La classe contractuelle, elle, survit :
    // on restaure donc l'adresse sur le même noeud, sans état parallèle.
    if (media) media.dataset.pqrPart = "hero-video-poster";
    return media;
}

/** Le poster est le SEUL transport d'image du HeroVideo. La seule source
 * autorisée en production est une pièce jointe publiée par le dialogue média
 * Odoo : une data URL hors cycle natif est hostile et retirée. */
export function reconcileHeroVideoPoster(editingElement) {
    const media = heroVideoPosterImage(editingElement);
    if (!media) return false;
    const source = media.getAttribute("poster") || "";
    if (!isPublishedAvatarSource(source) && !sourceEnAttenteNative(media, source)) media.removeAttribute("poster");
    return Boolean(media.getAttribute("poster"));
}

export class ReplaceHeroVideoPosterAction extends BuilderAction {
    static id = "pqrReplaceHeroVideoPoster";
    static dependencies = ["media"];

    async load({ editingElement }) {
        const root = heroVideoRoot(editingElement);
        const media = heroVideoPosterImage(root);
        if (!media) return null;
        // Le dialogue média ne sait remplacer qu'un `<img>` : il REMPLACE le
        // noeud qu'on lui donne. On lui prête donc une image détachée, portant
        // l'affiche courante, puis on recopie le résultat dans `poster`.
        // Donner la `<video>` en pâture au dialogue la ferait disparaître.
        const proxy = document.createElement("img");
        proxy.className = "o_editable_media";
        const courant = media.getAttribute("poster");
        if (courant) proxy.setAttribute("src", courant);
        await this.dependencies.media.openMediaDialog({
            node: proxy,
            visibleTabs: ["IMAGES"],
        }, this.editable);
        const choisi = proxy.getAttribute("src") || "";
        if (choisi) media.setAttribute("poster", choisi);
        reconcileHeroVideoPoster(root);
        return null;
    }

    apply({ editingElement }) {
        reconcileHeroVideoPoster(editingElement);
    }
}

export class SetHeroVideoPosterAltAction extends BuilderAction {
    static id = "pqrSetHeroVideoPosterAlt";
    getValue({ editingElement }) {
        return heroVideoPosterImage(editingElement)?.getAttribute("aria-label") || "";
    }
    apply({ editingElement, value }) {
        const media = heroVideoPosterImage(editingElement);
        if (!media) return;
        // Une `<video>` n'a pas d'`alt` : le contrat porte `aria-label` sur ce
        // plan depuis 2.0.0, c'est lui qui reçoit la description.
        media.setAttribute("aria-label", String(value || "").trim());
        reconcileHeroVideoPoster(editingElement);
    }
}
// ODOO-025-HERO-VIDEO-MEDIA END
