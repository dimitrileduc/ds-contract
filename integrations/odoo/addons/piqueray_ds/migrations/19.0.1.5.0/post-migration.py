# ZONE MANUELLE (spec 022). Chemin UPDATE du semis « une fois » (spike S2).
#
# Un site DÉJÀ installé (19.0.1.4.0 → 19.0.1.5.0, chemin de PRODUCTION) : les
# migrations ne tournent PAS à l'install frais, d'où le double crochet
# (post_init_hook côté install). Odoo charge d'abord data/menu_seed.xml (crée les
# 7 menus), PUIS exécute cette post-migration — les menus existent donc quand on
# les finalise. Le corps est PARTAGÉ (hooks._finalize_shell) : parent des tops →
# racine du site, retrait des défauts, bascule du header ; garde d'idempotence par
# le drapeau. Après quoi le menu appartient au client (FR-016).
from odoo import api, SUPERUSER_ID
from odoo.addons.piqueray_ds.hooks import _finalize_shell


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    _finalize_shell(env)
