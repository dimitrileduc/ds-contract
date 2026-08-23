# ZONE MANUELLE (spec 023). Chemin UPDATE du footer shell.
#
# Un site DÉJÀ installé (→ 19.0.1.7.0) : Odoo charge d'abord views/footer.xml
# (crée les templates), PUIS exécute cette post-migration — les templates existent
# quand on les active. Le corps est PARTAGÉ (hooks._finalize_footer) : bascule du
# footer (active le nôtre, désactive le natif) ; garde d'idempotence par le drapeau.
from odoo import api, SUPERUSER_ID
from odoo.addons.piqueray_ds.hooks import _finalize_footer


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    _finalize_footer(env)
