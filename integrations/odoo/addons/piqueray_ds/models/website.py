# ZONE MANUELLE (spec 023). Extension du modèle website pour les champs t-field
# du footer (spike S2, proofs/spike-persistance.json).
#
# Quatre champs Text portent le contenu rédacteur des trois colonnes et du
# copyright. Les valeurs INITIALES sont les échantillons du contrat
# (repeat.sample + copyright default). `t-field` lit ces champs à chaque
# requête (le gabarit re-rend depuis l'arch, jamais sauvegardé en HTML) et
# l'éditeur écrit dessus via `save_embedded_field` — le module update ne
# touche donc JAMAIS le contenu du rédacteur.
from odoo import fields, models


class Website(models.Model):
    _inherit = "website"

    x_pqr_footer_col1 = fields.Text(
        string="Piqueray Footer — Colonne 1",
        translate=True,
        default="Rue Alfred Drèze 7,\n4860 Pepinster",
    )
    x_pqr_footer_col2 = fields.Text(
        string="Piqueray Footer — Colonne 2",
        translate=True,
        default="Du lundi au vendredi\nde 8h00 à 12h00 et\nde 13h30 à 17h00",
    )
    x_pqr_footer_col3 = fields.Text(
        string="Piqueray Footer — Colonne 3",
        translate=True,
        default="Tél : +32 (0)87 46 32 66\nEmail: info@piqueray.be",
    )
    x_pqr_footer_copyright = fields.Text(
        string="Piqueray Footer — Copyright",
        translate=True,
        default="© 2025 Piqueray - CGV - Politique de confidentialité | Création de site internet ProduWeb",
    )
    x_pqr_footer_cta_label = fields.Char(
        string="Piqueray Footer — CTA Label",
        translate=True,
        default="Contactez-nous",
    )
    x_pqr_footer_cta_href = fields.Char(
        string="Piqueray Footer — CTA Href",
        default="/contactez-nous",
    )
