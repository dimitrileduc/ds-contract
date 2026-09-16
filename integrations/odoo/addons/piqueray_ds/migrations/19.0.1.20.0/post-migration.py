# ZONE MANUELLE (ds.header 3.1.0 / ds.menu-mobile 1.1.0, 2026-09-16). Chemin UPDATE
# des deux entrées de menu « Boutique » et « Contact ».
#
# Le hook `post_init_hook` couvre l'installation FRAÎCHE. Les bases déjà installées
# — dont celle du client — n'ont ni « Boutique » ni « Contact » dans leur menu : la
# barre 3.1.0 n'a plus de bouton « Contactez-nous », donc sans cette migration la
# page Contact ne serait plus joignable depuis la navigation.
#
# Le corps est partagé avec le hook, gardes comprises : si le drapeau est posé, rien
# ne bouge ; si le site mène déjà à `/shop` (website_sale) ou à `/contactez-nous`,
# l'entrée n'est pas doublée.
from odoo import api, SUPERUSER_ID

from odoo.addons.piqueray_ds.hooks import _finalize_menu_boutique_contact


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    _finalize_menu_boutique_contact(env)
