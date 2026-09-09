# ZONE MANUELLE (audit WCAG, 2026-09-09). Chemin UPDATE de la ligne de copyright.
#
# Le nouveau défaut du champ `x_pqr_footer_copyright` porte le lien « Plan du site »,
# mais un défaut ne s'applique qu'à une installation FRAÎCHE : une base déjà livrée
# garde sa valeur, donc sa ligne sans lien. D'où cette migration.
#
# LA GARDE EST TOUTE LA QUESTION, et c'est la même que celle du menu (19.0.1.17.0) :
# cette ligne appartient au rédacteur dès la livraison, il l'édite dans Odoo. On ne
# réécrit donc QUE notre propre valeur d'origine, au caractère près. Si le client a
# changé ne serait-ce qu'une virgule, on ne touche à rien — en silence assumé : ce
# n'est plus notre texte. Il pourra poser le lien lui-même, le champ étant désormais
# du HTML.
from odoo import api, SUPERUSER_ID

ANCIEN = "© 2025 Piqueray - CGV - Politique de confidentialité | Création de site internet ProduWeb"
NOUVEAU = (
    "© 2025 Piqueray - CGV - Politique de confidentialité - "
    '<a href="/pages">Plan du site</a>'
    " | Création de site internet ProduWeb"
)


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    for website in env["website"].sudo().search([]):
        actuel = website.x_pqr_footer_copyright
        if actuel is None:
            continue
        # `Html` rend un objet Markup : on compare sur la chaîne, sans rien supposer.
        if str(actuel).strip() == ANCIEN:
            website.x_pqr_footer_copyright = NOUVEAU
