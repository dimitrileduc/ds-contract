# ZONE MANUELLE (spec 023). Extension du modèle website pour les champs t-field
# du footer (spike S2, proofs/spike-persistance.json).
#
# Des champs du modèle portent le contenu rédacteur des colonnes et du
# copyright. Les valeurs INITIALES sont les échantillons du contrat
# (repeat.sample + copyright default). `t-field` lit ces champs à chaque
# requête (le gabarit re-rend depuis l'arch, jamais sauvegardé en HTML) et
# l'éditeur écrit dessus via `save_embedded_field` — le module update ne
# touche donc JAMAIS le contenu du rédacteur.
#
# POURQUOI CE MÉCANISME ET PAS DU HTML EN DUR DANS LE GABARIT (spec 033) :
# le pied de page n'est pas un bloc déposé, c'est un gabarit système. Éditer
# du balisage écrit en dur dans l'arch fait sauvegarder L'ARCH DE LA VUE
# (`ir_ui_view.py:295`), et `odoo -u piqueray_ds` la recharge depuis le XML —
# l'édition du rédacteur disparaît au déploiement suivant, sans un mot. Seule
# une écriture sur le MODÈLE survit. C'est la raison d'être de ces champs.
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
    # PLUS RENDU depuis la spec 033 : la colonne « Contact » porte désormais
    # deux vrais liens, donc deux champs Html distincts (ci-dessous). Le champ
    # reste déclaré parce que le retirer effacerait le contenu d'une instance
    # déjà en ligne — son sort est un ménage à décider, pas un effet de bord.
    x_pqr_footer_col3 = fields.Text(
        string="Piqueray Footer — Colonne 3 (héritage, non rendu)",
        translate=True,
        default="Tél : +32 (0)87 46 32 66\nEmail: info@piqueray.be",
    )
    # Deux champs et non un seul : le téléphone et l'email sont deux
    # informations distinctes, chacune avec sa propre destination. Un champ
    # unique les recollerait en une seule zone éditable, où l'éditeur ne
    # saurait plus lequel des deux liens il modifie.
    # `Html` et non `Text` : `IrQwebFieldText.from_html` retire le balisage à
    # la sauvegarde (`ir_qweb_fields.py:403`) — un champ Text ne peut donc pas
    # porter d'ancre. Ce qui est permis à la sortie n'est pas décidé ici mais
    # par `data-pqr-marks` sur la zone, que lit `rich_text_guard`.
    x_pqr_footer_tel = fields.Html(
        string="Piqueray Footer — Contact, téléphone",
        translate=True,
        default='Tél : <a href="tel:+3287463266">+32 (0)87 46 32 66</a>',
    )
    x_pqr_footer_email = fields.Html(
        string="Piqueray Footer — Contact, email",
        translate=True,
        default='Email: <a href="mailto:info@piqueray.be">info@piqueray.be</a>',
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
