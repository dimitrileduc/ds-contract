# ZONE MANUELLE (spec 023). Chemin UPDATE du footer CTA.
#
# Les deux nouveaux champs (x_pqr_footer_cta_label, x_pqr_footer_cta_href) ont
# un default Python, mais celui-ci ne s'applique qu'à la CREATION d'enregistrement.
# Un site existant (→ 19.0.1.8.0) a ses websites déjà créés : la colonne ajoutée
# vaut NULL. Cette migration pose les valeurs par défaut sur les enregistrements
# existants, une seule fois.
from odoo import api, SUPERUSER_ID


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    websites = env["website"].sudo().search([
        ("x_pqr_footer_cta_label", "=", False),
    ])
    if websites:
        websites.write({
            "x_pqr_footer_cta_label": "Contactez-nous",
            "x_pqr_footer_cta_href": "/contactez-nous",
        })
