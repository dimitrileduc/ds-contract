# ZONE MANUELLE (spec 022). Finalisation « une fois » du shell header.
#
# Le semis DÉCLARATIF (data/menu_seed.xml, noupdate="1") crée les 7 menus. Ce
# module pose ce que le XML NE PEUT PAS exprimer — spike S2 (proofs/spike-seed.json),
# point dur OBSERVÉ : les menus PAR SITE n'ont aucun external id, le root du site
# non plus, donc le parent_id des tops n'est pas référençable en XML :
#   1. parent_id des 4 tops → le menu racine du site (website.menu_id) ;
#   2. retrait des 2 entrées par défaut d'Odoo (Home « / », Contact us « /contactus »)
#      par (website_id, url) — JAMAIS par xml_id (les défauts n'en ont pas) ;
#   3. bascule du header : le nôtre ACTIF, celui d'Odoo INACTIF (spike S1).
#
# Garde d'idempotence : un drapeau ir.config_parameter posé une fois. Après quoi le
# menu appartient au client (FR-016) — cette finalisation ne re-tourne jamais, ni à
# l'update suivant, ni à une régénération d'assets.
#
# Un seul corps, appelé par les DEUX chemins du spike S2 :
#   · install frais            → post_init_hook (ci-dessous) ;
#   · update d'un site installé → migrations/19.0.1.6.0/post-migration.py.

FLAG = "piqueray_ds.shell_finalized"

# Les 4 racines de premier niveau, par NOTRE xml_id (data/menu_seed.xml). Leur
# parent_id est posé ici (le XML ne peut pas référencer le root du site).
TOP_MENU_XMLIDS = (
    "piqueray_ds.menu_portes_garage",
    "piqueray_ds.menu_portes_entree",
    "piqueray_ds.menu_depannage_sav",
    "piqueray_ds.menu_a_propos",
)

# Les entrées par défaut d'Odoo à retirer, par URL (spike S2 : pas d'xml_id).
DEFAULT_MENU_URLS = ("/", "/contactus")


def _finalize_shell(env):
    params = env["ir.config_parameter"].sudo()
    if params.get_param(FLAG):
        return

    for website in env["website"].sudo().search([]):
        root = website.menu_id
        if root:
            for xmlid in TOP_MENU_XMLIDS:
                menu = env.ref(xmlid, raise_if_not_found=False)
                if menu and menu.website_id.id == website.id:
                    menu.parent_id = root.id
        defaults = env["website.menu"].sudo().search([
            ("website_id", "=", website.id),
            ("url", "in", list(DEFAULT_MENU_URLS)),
        ])
        defaults.unlink()

    default_header = env.ref("website.template_header_default", raise_if_not_found=False)
    if default_header:
        default_header.active = False
    ours = env.ref("piqueray_ds.template_header_piqueray", raise_if_not_found=False)
    if ours:
        ours.active = True

    params.set_param(FLAG, "1")


# ---------------------------------------------------------------------------
# Finalisation du footer shell (spec 023).
# Même patron que le header : un corps partagé, appelé par post_init_hook
# (install frais) et par la migration 19.0.1.7.0 (update). Garde propre.
# ---------------------------------------------------------------------------

FOOTER_FLAG = "piqueray_ds.footer_finalized"


def _finalize_footer(env):
    params = env["ir.config_parameter"].sudo()
    if params.get_param(FOOTER_FLAG):
        return

    default_footer = env.ref("website.footer_custom", raise_if_not_found=False)
    if default_footer:
        default_footer.active = False
    ours = env.ref("piqueray_ds.template_footer_piqueray", raise_if_not_found=False)
    if ours:
        ours.active = True

    params.set_param(FOOTER_FLAG, "1")


def post_init_hook(env):
    """Install FRAIS : le semis noupdate a créé les menus, on les finalise."""
    _finalize_shell(env)
    _finalize_footer(env)
