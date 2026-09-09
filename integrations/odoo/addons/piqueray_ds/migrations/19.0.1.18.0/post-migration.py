# ZONE MANUELLE (accessibilité, passe 2, 2026-09-09). Chemin UPDATE de la langue.
#
# Le hook `post_init_hook` couvre l'installation FRAÎCHE. Les bases déjà installées
# — dont celle de l'owner — restent en `en-US` sans cette migration : un lecteur
# d'écran y lit du français avec une prononciation anglaise (WCAG 3.1.1, A).
#
# Le corps est partagé avec le hook, garde comprise : si le drapeau est posé, ou si
# le client a déjà choisi sa langue, rien ne bouge.
from odoo import api, SUPERUSER_ID

from odoo.addons.piqueray_ds.hooks import _finalize_langue


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    _finalize_langue(env)
