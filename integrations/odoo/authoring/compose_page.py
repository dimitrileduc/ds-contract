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

import json, base64, os, copy
from lxml import html as LH
from markupsafe import Markup

DESC = json.load(open(os.environ.get("PQR_DESCRIPTOR", "/tmp/pqr_compose/descriptor.json"), encoding="utf-8"))
IMG_DIR = os.environ.get("PQR_IMG_DIR", "/tmp/pqr_imgs")
ADDON = DESC.get("addon", "piqueray_ds")

# Clé conviviale du descripteur -> data-pqr-part candidats (le premier présent
# dans la carte gagne). Ajouter une nouvelle liste ne demande aucune branche :
# il suffit que ses parts soient couvertes ici.
KEY_TO_PARTS = {
    "titre": ("carte-title",),
    "texte": ("carte-text", "temoignage"),
    "body": ("carte-body",),
    "auteur": ("auteur",),
    "date": ("date",),
    "initiale": ("initiale",),
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
def img_url(name):
    if not name:
        return ""
    if name not in _att:
        with open(os.path.join(IMG_DIR, name + ".png"), "rb") as f:
            data = f.read()
        att = env["ir.attachment"].create({
            "name": "pqr_" + name, "type": "binary",
            "datas": base64.b64encode(data), "mimetype": "image/png", "public": True,
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
    el = part(root, name)
    if el is None:
        return
    img = el if el.tag == "img" else next(iter(el.xpath(".//img")), None)
    if img is not None:
        img.set("src", url)

def set_button(root, cta_part, label):
    el = part(root, cta_part)
    if el is None:
        return
    for node in el.iter():
        if node.text and node.text.strip():
            node.text = label
            return

def fill_list(root, items, variant=""):
    """Remplit UNE collection de cartes/avis, quel que soit le composant.

    Le DOM gouverné porte partout le même contrat : un conteneur
    `data-pqr-*-list`, un gabarit inerte `template[data-pqr-*-blueprint[=variant]]`
    et des parts éditables par carte. On clone le gabarit par item (comme le geste
    éditeur `repeat_action.js`), ce qui gère un nombre ARBITRAIRE de cartes — pas
    de plafond, pas de troncature silencieuse — et supprime tout nom de template
    ou de composant codé en dur.
    """
    lst = next(iter(root.xpath(".//*[@data-pqr-carte-list or @data-pqr-review-list]")), None)
    if lst is None:
        return
    blueprints = root.xpath(".//template[@data-pqr-carte-blueprint or @data-pqr-review-blueprint]")
    def bp_key(bp):
        return bp.get("data-pqr-carte-blueprint", bp.get("data-pqr-review-blueprint", "")) or ""
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
        lst.append(card)

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

        # section-header composé (ex: en-tête Avis Google) : rendu paramétré, pas une liste
        if comp == "pqr_section_header":
            p = {k: (Markup(v) if k in ("title_html", "eyebrow") and isinstance(v, str) else v)
                 for k, v in sec.get("params", {}).items()}
            out.append(render("pqr_section_header", p))
            continue

        root = parse(render(comp))

        set_disposition(root, comp, sec.get("disposition"))

        items = sec.get("cards") or sec.get("reviews")
        if items:
            fill_list(root, items, sec.get("variant", ""))
        for pt, html in sec.get("set_html", {}).items():
            set_html(part(root, pt), html)
        for pt in sec.get("set_empty", []):
            set_html(part(root, pt), "")
        for pt, name in sec.get("images", {}).items():
            set_img(root, pt, img_url(name))
        for pt, label in sec.get("set_button", {}).items():
            set_button(root, pt, label)
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
if pages:
    if "header_overlay" in DESC:
        pages.write({"header_overlay": bool(DESC["header_overlay"])})
    vids = sorted(set(p.view_id.id for p in pages))
    for vid in vids:
        env["ir.ui.view"].browse(vid).write({"arch_db": arch})
else:
    view = env["ir.ui.view"].create({
        "name": DESC.get("name", "Page"), "type": "qweb",
        "key": ADDON + "." + DESC.get("key", "page"), "arch_db": arch,
    })
    env["website.page"].create({
        "url": url, "view_id": view.id, "is_published": True, "website_indexed": True,
        "header_overlay": bool(DESC.get("header_overlay", False)),
    })
    vids = [view.id]
env.cr.commit()
print("COMPOSE_OK", url, "views", vids, "attachments", len(_att))
