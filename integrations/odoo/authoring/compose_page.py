# -*- coding: utf-8 -*-
# compose_page.py — composeur de page Odoo à partir d'un descripteur JSON.
#
# S'exécute DANS le conteneur via `odoo shell`. Il ne touche AUCUN code d'addon :
# il compose une PAGE (contenu) en rendant les templates GOUVERNÉS du module
# et en y injectant le contenu propre à CETTE page (variante, nombre de cartes,
# textes, images). Chaque page = son descripteur.
#
# Principe : composant = fixe/gouverné ; variante + nombre + textes + images =
# réglages d'INSTANCE, par page. Rien n'est figé dans le composant.
#
# Entrées (copiées dans le conteneur par run-compose.sh) :
#   /tmp/pqr_compose/descriptor.json   — le descripteur de la page
#   $PQR_IMG_DIR/<name>.png            — les images référencées (défaut /tmp/pqr_imgs)
#
# Usage : odoo shell -d <db> ... < compose_page.py   (PQR_DESCRIPTOR par env)

import json, base64, os, copy, mimetypes
from lxml import html as LH

DESC = json.load(open(os.environ.get("PQR_DESCRIPTOR", "/tmp/pqr_compose/descriptor.json"), encoding="utf-8"))
IMG_DIR = os.environ.get("PQR_IMG_DIR", "/tmp/pqr_imgs")
ADDON = DESC.get("addon", "piqueray_ds")
# Lu UNE fois : `write_arch` en a besoin pour chaque vue (voir sa docstring).
INSTALLED_LANGS = [lang for lang, _name in env["res.lang"].get_installed()]

# Clé conviviale du descripteur -> data-pqr-part candidats (le premier présent
# dans la carte gagne). Ajouter une nouvelle liste ne demande aucune branche :
# il suffit que ses parts soient couvertes ici.
KEY_TO_PARTS = {
    "titre": ("carte-title", "produit-titre"),
    "texte": ("carte-text", "temoignage"),
    "body": ("carte-body",),
    "auteur": ("auteur",),
    "date": ("date",),
    "initiale": ("initiale",),
    # 2026-09-04 : la collection de produits rejoint le contrat de DOM commun.
    "prix": ("produit-prix",),
    # 2026-09-07 (Equipe v2, passe 2) : la collection de membres rejoint le meme
    # contrat de DOM. Aucune branche : ses parts sont simplement couvertes ici.
    "nom": ("member-name",),
    "poste": ("member-role",),
    # 2026-09-08 (spec 037, T031) : le libelle du CTA d une carte-categorie. Le
    # gabarit lit deja `carte.ctaLabel` cote QWeb, mais `fill_list` clone le
    # blueprint DEJA rendu : sans cette entree, les trois cartes de la page
    # Motorisation sortaient toutes avec « Contactez-nous » au lieu de leurs
    # trois libelles de brochure. Aucune branche neuve : ses parts sont
    # simplement couvertes ici, comme les autres.
    "ctaLabel": ("button-label",),
}

# Les dispositions de section restent des choix de COMPOSITION, jamais un
# attribut libre du HTML sauvegardé. La homepage peut fixer 5Cartes sans ouvrir
# un sélecteur dans l'éditeur; toute autre valeur est refusée avant écriture.
COMPOSITION_DISPOSITIONS = {
    "s_pqr_reassurances": {
        "4Cartes": "reassurances--disposition-4Cartes",
        "quatrecartesdeuxcta": "reassurances--disposition-quatrecartesdeuxcta",
        "5Cartes": "reassurances--disposition-5Cartes",
    },
}

_att = {}
IMG_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")
def img_url(name):
    """Attache l'image `assets/<name>.<ext>` (jpg/jpeg/png/webp, premier trouvé)
    et rend son URL. Le type MIME suit l'extension — plus de `.png` imposé
    (2026-09-07 : un hero PNG de 5,6 Mo servi tel quel ; le JPEG à la taille du
    cadre pèse dix fois moins)."""
    if not name:
        return ""
    if name not in _att:
        path = next((os.path.join(IMG_DIR, name + ext) for ext in IMG_EXTENSIONS
                     if os.path.exists(os.path.join(IMG_DIR, name + ext))), None)
        if path is None:
            raise FileNotFoundError("image introuvable dans %s : %s(%s)" % (IMG_DIR, name, "|".join(IMG_EXTENSIONS)))
        with open(path, "rb") as f:
            data = f.read()
        att = env["ir.attachment"].create({
            "name": "pqr_" + name, "type": "binary",
            "datas": base64.b64encode(data),
            "mimetype": mimetypes.guess_type(path)[0] or "application/octet-stream", "public": True,
        })
        _att[name] = "/web/image/%d" % att.id
    return _att[name]

def render(xmlid, values=None):
    return str(env["ir.ui.view"]._render_template(ADDON + "." + xmlid, values or {}))

def parse(frag):
    return LH.fromstring('<div id="__f">' + frag + "</div>")

def inner(root):
    return (root.text or "") + "".join(LH.tostring(c, encoding="unicode") for c in root)

def part(root, name):
    r = root.xpath('.//*[@data-pqr-part="%s"]' % name)
    return r[0] if r else None

def set_html(el, html):
    if el is None:
        return
    for c in list(el):
        el.remove(c)
    sub = LH.fromstring('<span id="__s">' + (html or "") + "</span>")
    el.text = sub.text
    for c in sub:
        el.append(c)

def set_img(root, name, url):
    """Pose un media de contenu sur une partie.

    Deux formes, une regle : c'est l'element qui decide de l'attribut.
    · <img>   -> `src`    (le cas d'origine)
    · <video> -> `poster` (2026-09-08 : le hero video. Le `src` de la video est
      un asset de l'addon, gouverne, jamais du contenu de page ; seule l'affiche
      est choisie par le redacteur, exactement comme une image.)
    """
    el = part(root, name)
    if el is None:
        return
    for tag, attr in (("video", "poster"), ("img", "src")):
        node = el if el.tag == tag else next(iter(el.xpath(".//" + tag)), None)
        if node is not None:
            node.set(attr, url)
            return

def set_button(root, cta_part, label):
    el = part(root, cta_part)
    if el is None:
        return
    for node in el.iter():
        if node.text and node.text.strip():
            node.text = label
            return

def _ancre(el, pt):
    """L'ancre que le panneau d'edition adresse pour cette part.

    Deux resolutions, les MEMES que `SetCtaHrefAction` et `SetLinkHrefAction` :
    la part est elle-meme une ancre, ou elle HEBERGE un bouton gouverne dont
    l'ancre interne porte `data-pqr-part="button-root"`. Un lien pose par le
    fichier et un lien edite ensuite atterrissent donc au meme endroit — le
    panneau relit l'`href` de cette ancre-la.
    """
    if el is None:
        raise ValueError("Lien impossible : aucune part `%s` dans ce gabarit" % pt)
    if el.tag == "a":
        return el
    a = next(iter(el.xpath('.//a[@data-pqr-part="button-root"]')), None) or next(iter(el.xpath(".//a")), None)
    if a is None:
        # REFUS, jamais un silence : un `href` ecrit nulle part est le defaut le
        # plus cher a trouver — le bouton a l'air normal et ne mene nulle part.
        raise ValueError("Lien impossible : la part `%s` ne porte aucune ancre" % pt)
    return a


def set_link(root, pt, href):
    """Pose la DESTINATION d'un bouton de section. Spec 037, T019.

    C'est la SEULE addition de la spec 037 a ce composeur. Le resolveur a deja
    refuse tout ce qui sort de la grammaire fermee ; ici on ecrit, on ne juge
    plus. Une carte recoit en plus `data-pqr-cta-href`, comme `repeat_action.js`,
    pour que le geste de collection retrouve l'adresse au clonage.
    """
    a = _ancre(part(root, pt), pt)
    a.set("href", href)
    if a.get("data-pqr-carte") is not None or a.get("data-pqr-produit") is not None:
        a.set("data-pqr-cta-href", href)


def set_link_carte(card, href, pt):
    """Meme geste, a l'echelle d'UNE carte : la carte-categorie et la carte
    produit SONT des ancres (leur racine porte le lien) ; la carte d'avis, elle,
    heberge un bouton « Lire la suite »."""
    a = card if card.tag == "a" else _ancre(card, pt)
    a.set("href", href)
    if a.get("data-pqr-carte") is not None or a.get("data-pqr-produit") is not None:
        a.set("data-pqr-cta-href", href)


def fill_list(root, items, variant=""):
    """Remplit UNE collection de cartes/avis, quel que soit le composant.

    Le DOM gouverné porte partout le même contrat : un conteneur
    `data-pqr-*-list`, un gabarit inerte `template[data-pqr-*-blueprint[=variant]]`
    et des parts éditables par carte. On clone le gabarit par item (comme le geste
    éditeur `repeat_action.js`), ce qui gère un nombre ARBITRAIRE de cartes — pas
    de plafond, pas de troncature silencieuse — et supprime tout nom de template
    ou de composant codé en dur.
    """
    lst = next(iter(root.xpath(".//*[@data-pqr-carte-list or @data-pqr-review-list or @data-pqr-member-list]")), None)
    if lst is None:
        return
    blueprints = root.xpath(".//template[@data-pqr-carte-blueprint or @data-pqr-review-blueprint or @data-pqr-member-blueprint]")
    BP_ATTRS = ("data-pqr-carte-blueprint", "data-pqr-review-blueprint", "data-pqr-member-blueprint")
    def bp_key(bp):
        return next((bp.get(a) for a in BP_ATTRS if bp.get(a) is not None), "") or ""
    blueprint = next((bp for bp in blueprints if bp_key(bp) == variant), None) or next(iter(blueprints), None)
    model = blueprint.find("*") if blueprint is not None else None
    if model is None:
        return
    if variant:  # ex. catégories superposé : le style vit sur le parent
        sec = part(root, "root")
        if sec is not None:
            sec.set("data-pqr-style", variant)
    for c in list(lst):
        lst.remove(c)
    for i, item in enumerate(items):
        card = copy.deepcopy(model)
        for attr in list(card.attrib):  # data-pqr-*-marker : blueprint -> index
            if attr.endswith("-marker"):
                card.set(attr, card.get(attr).replace("blueprint", str(i)))
        for key, parts in KEY_TO_PARTS.items():
            if item.get(key) is None:
                continue
            el = next((e for p in parts for e in card.xpath('.//*[@data-pqr-part="%s"]' % p)), None)
            if el is not None:
                set_html(el, item[key])
        if item.get("image"):
            im = next(iter(card.xpath(".//img")), None)
            if im is not None:
                im.set("src", img_url(item["image"]))
        # 2026-09-07 (Equipe v2, passe 2) : une carte peut porter PLUSIEURS plans
        # photo — la carte membre en empile deux, le portrait de repos et celui que
        # le survol decouvre. La cle `image` (une seule image, la premiere du DOM)
        # reste inchangee ; `images` adresse chaque plan par son `data-pqr-part`,
        # exactement comme la cle `images` d'une section.
        for pt, name in (item.get("images") or {}).items():
            set_img(card, pt, img_url(name))
        # Destination de la carte (spec 037) : `lien` pour une carte, `lienAvis`
        # pour un avis. Absente = `href="#"` conserve — le registre des restes
        # la porte, on ne l'invente pas.
        lien = item.get("lien") or item.get("lienAvis")
        if lien:
            set_link_carte(card, lien, "lire-la-suite")
        lst.append(card)

ROW_TEMPLATES = {
    # attribut de liste → (gabarit QWeb de la rangée, nom de la valeur item, nom de l'index)
    "data-pqr-accordion-list": ("texte_seo_row", "row", "row_index"),
    "data-pqr-faq-list": ("faq_accordion_row", "question", "question_index"),
}

def fill_rows(root, rows):
    """Remplit UNE liste de rangées d'accordéon (Texte SEO, FAQ) — 2026-09-07.

    Chaque rangée est RENDUE par son gabarit QWeb (`texte_seo_row` /
    `faq_accordion_row`), exactement comme au rendu de référence : classe d'état,
    plans `hidden`, aria-expanded et aria-label sont calculés par le gabarit, une
    seule fois dans le dépôt (le JS ne fait que basculer). Index 0-based comme le
    `t-foreach` du bloc. Depuis le 2026-09-07 (FAQ v2, vague 031) `faq_accordion_row`
    lit `etat` comme `texte_seo_row` : une page FAQ peut ouvrir une rangée, et
    c'est bien le GABARIT qui a été étendu, pas ce composeur.
    """
    for attr, (xmlid, item_name, index_name) in ROW_TEMPLATES.items():
        lst = next(iter(root.xpath(".//*[@%s]" % attr)), None)
        if lst is None:
            continue
        for c in list(lst):
            lst.remove(c)
        for i, item in enumerate(rows):
            row = parse(render(xmlid, {item_name: item, index_name: i})).find("*")
            for key in ("titre", "contenu"):  # balisage riche éventuel, que t-esc a échappé
                if item.get(key) and "<" in item[key]:
                    set_html(part(row, key), item[key])
            lst.append(row)
        return

def write_arch(view, arch):
    """Pose `arch` comme source de la vue dans TOUTES les langues installées.

    `arch_db` est un champ TRADUIT (JSON par langue). Un `write` sans contexte
    n'écrit que la langue du shell (en_US) : une vue déjà traduite — c'est le cas
    dès que l'éditeur a enregistré la page une fois sous la langue du site
    (fr_BE, copie COW par site) — gardait son ancienne copie fr_BE, et le site,
    qui sert fr_BE, montrait la page d'AVANT la recomposition (trouvé le
    2026-09-07, Texte SEO). La page composée est la source partout ; ce helper est
    le seul endroit du composeur qui écrit une arch, création comprise.
    """
    for lang in INSTALLED_LANGS:
        view.with_context(lang=lang).write({"arch_db": arch})

def set_disposition(root, component, disposition):
    if disposition is None:
        return
    allowed = COMPOSITION_DISPOSITIONS.get(component, {})
    class_name = allowed.get(disposition)
    if class_name is None:
        raise ValueError("Disposition de composition non autorisée pour %s: %s" % (component, disposition))
    sec_root = part(root, "root")
    if sec_root is None:
        raise ValueError("Racine absente pour la disposition de %s" % component)
    classes = [c for c in (sec_root.get("class") or "").split() if not c.startswith("reassurances--disposition-")]
    if class_name not in classes:
        classes.append(class_name)
    sec_root.set("class", " ".join(classes))
    sec_root.set("data-pqr-disposition", disposition)

def build():
    out = []
    for sec in DESC["sections"]:
        comp = sec["component"]
        root = parse(render(comp))

        set_disposition(root, comp, sec.get("disposition"))

        items = sec.get("cards") or sec.get("reviews")
        if items:
            fill_list(root, items, sec.get("variant", ""))
        if sec.get("rows"):
            fill_rows(root, sec["rows"])
        for pt, html in sec.get("set_html", {}).items():
            set_html(part(root, pt), html)
        for pt in sec.get("set_empty", []):
            set_html(part(root, pt), "")
        for pt, name in sec.get("images", {}).items():
            set_img(root, pt, img_url(name))
        for pt, label in sec.get("set_button", {}).items():
            set_button(root, pt, label)
        for pt, href in sec.get("links", {}).items():
            set_link(root, pt, href)
        rem = sec.get("remove_class", [])
        if rem:
            sec_root = part(root, "root")
            if sec_root is not None:
                sec_root.set("class", " ".join(c for c in (sec_root.get("class") or "").split() if c not in rem))

        # Symétrique de remove_class : pose des classes de COMPOSITION sur le root
        # de section (ex. `s_pqr_bleed` pour sortir du gutter du page container).
        # Ces classes vivent hors des contrats — couche page, jamais gouvernée.
        add = sec.get("add_class", [])
        if add:
            sec_root = part(root, "root")
            if sec_root is not None:
                existing = (sec_root.get("class") or "").split()
                sec_root.set("class", " ".join(existing + [c for c in add if c not in existing]))

        out.append("<!-- %s -->\n%s" % (comp, inner(root)))
    return out

wrap = '<div id="wrap" class="oe_structure o_pqr_page">\n' + "\n".join(build()) + "\n</div>"
tname = DESC.get("view_tname", "website.homepage")
arch = '<t name="%s" t-name="%s"><t t-call="website.layout">%s</t></t>' % (DESC.get("name", "Page"), tname, wrap)

url = DESC["url"]
pages = env["website.page"].search([("url", "=", url)])
# Titre de page (WCAG 2.4.2 + referencement). Sans lui, Odoo compose
# "<nom de vue> | <nom du site>" et sert sa valeur d'usine ("Home | My Website").
# Le titre est donc GOUVERNE ici ; la LANGUE, elle, est un reglage au niveau du
# site (website.default_lang_id), pas de la page : elle reste operationnelle.
meta = {}
if DESC.get("meta_title"):
    meta["website_meta_title"] = DESC["meta_title"]
if DESC.get("meta_description"):
    meta["website_meta_description"] = DESC["meta_description"]

if pages:
    if "header_overlay" in DESC:
        pages.write({"header_overlay": bool(DESC["header_overlay"])})
    if meta:
        pages.write(meta)
    vids = sorted(set(p.view_id.id for p in pages))
    for vid in vids:
        write_arch(env["ir.ui.view"].browse(vid), arch)
else:
    view = env["ir.ui.view"].create({
        "name": DESC.get("name", "Page"), "type": "qweb",
        "key": ADDON + "." + DESC.get("key", "page"), "arch_db": arch,
    })
    write_arch(view, arch)
    env["website.page"].create({
        "url": url, "view_id": view.id, "is_published": True, "website_indexed": True,
        "header_overlay": bool(DESC.get("header_overlay", False)),
        **meta,
    })
    vids = [view.id]
env.cr.commit()
print("COMPOSE_OK", url, "views", vids, "attachments", len(_att))
