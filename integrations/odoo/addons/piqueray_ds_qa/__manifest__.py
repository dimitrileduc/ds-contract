# Addon de QUALIFICATION — jamais livré au client.
#
# Il existe parce que le banc d'essai (`views/harness.xml`) était d'abord déclaré
# dans le `data` de l'addon de production, ce qui publiait une page de test sur le
# site réel. Le commentaire du manifeste affirmait pourtant l'inverse — « ce
# fichier ne fait PAS partie du produit livré ». Un commentaire ne retire rien
# d'un `data` : seule la séparation le fait. Trouvé en revue le 2026-08-08.
#
# Règle qui en découle : `piqueray_ds` ne contient AUCUNE page publique de test.
# Ce qui sert à mesurer vit ici, et n'est installé que par la QA.
{
    "name": "Piqueray Design System — banc de qualification",
    "summary": "Pages de mesure et bancs d'essai. NE JAMAIS installer en production.",
    "description": """
Addon de qualification de la spec 019.

Il déclare les pages de banc utilisées par `integrations/odoo/qa/scenarios/`.
Aucune de ces pages n'est un livrable : elles servent à mesurer la frontière
d'éditabilité et l'écart d'image, et elles seraient du bruit — voire une fuite
d'information — sur un site réel.

`integrations/odoo/qa/run.mts` installe `piqueray_ds` ET cet addon sur la base
jetable. Une installation de production n'installe que `piqueray_ds`.
""",
    "version": "19.0.1.0.0",
    "category": "Website/Website",
    "author": "Piqueray",
    "license": "LGPL-3",
    "depends": ["piqueray_ds"],
    "data": [
        "views/harness.xml",
    ],
    "assets": {
        "website.website_builder_assets": [
            "piqueray_ds_qa/static/src/js/locked_probe.js",
            "piqueray_ds_qa/static/src/xml/locked_probe.xml",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}
