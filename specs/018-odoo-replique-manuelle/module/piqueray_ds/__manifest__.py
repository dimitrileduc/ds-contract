# -*- coding: utf-8 -*-
# Module Odoo 19 ÉCRIT À LA MAIN — artefact de référence de la spec 018.
# Ce que cet artefact EST, et ce qu'il n'est pas : voir README.md (FR-015).
{
    "name": "Piqueray DS — réplique manuelle (spec 018)",
    "version": "19.0.1.0.0",
    "summary": "Trois composants gouvernés répliqués à la main en blocs Odoo 19 — artefact de mesure, pas un produit.",
    "author": "d-l.studio",
    "license": "LGPL-3",
    "category": "Website/Website",
    # `website` suffit : en 19.0, addons/website/__manifest__.py dépend de
    # `html_editor` ET `html_builder` — le système de réglages arrive donc par
    # transitivité. Vérifié sur la branche 19.0 (research.md §D10).
    "depends": ["website"],
    "data": [
        "views/templates.xml",
        "views/snippets.xml",
        "views/harness.xml",
    ],
    "assets": {
        # Page publique : ce qu'un visiteur charge. `tokens.pqr.css` est GÉNÉRÉ
        # par `npm run tokens` — jamais édité à la main.
        "web.assets_frontend": [
            "piqueray_ds/static/src/css/fonts.css",
            "piqueray_ds/static/src/css/tokens.pqr.css",
            "piqueray_ds/static/src/css/components.css",
        ],
        # Éditeur de site : les réglages du panneau (Phase 4). Bundle distinct —
        # rien de tout ceci n'est servi au visiteur.
        "website.website_builder_assets": [],
    },
    # Pas d'"application": True — c'est délibéré. Ce module n'est pas une app,
    # et la voie d'installation est le CLI (`-i piqueray_ds`, qui exige `-d`),
    # jamais le filtre « Apps » de l'interface. Piège nommé : sans ce drapeau, le
    # module n'apparaît PAS sous le filtre par défaut ; il faut le mode
    # développeur, *Update Apps List*, puis le filtre « Extra ».
    "installable": True,
    "auto_install": False,
}
