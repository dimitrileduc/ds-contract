# -*- coding: utf-8 -*-
# Module Odoo 19 ÉCRIT À LA MAIN — artefact de référence de la spec 018.
# Ce que cet artefact EST, et ce qu'il n'est pas : voir README.md (FR-015).
{
    "name": "Piqueray DS — réplique manuelle (spec 018)",
    "version": "19.0.1.0.0",
    "summary": "Trois composants gouvernés répliqués à la main en blocs Odoo 19 — artefact de mesure, pas un produit.",
    # `description` est EXPLICITE, et c'est un correctif, pas de la décoration.
    # Sans elle, Odoo se rabat sur le README du module et le rend comme du
    # reStructuredText. Notre README est en Markdown : ses séparateurs de tableau
    # (`|---|---|`) deviennent des substitutions RST non définies, et
    # l'installation imprime deux lignes ERROR — ce qui faisait rater SC-001
    # (« 0 erreur ») pour une raison sans aucun rapport avec le module.
    # Ce texte est volontairement du RST valide et plat.
    "description": """
Piqueray DS — réplique manuelle (spec 018)
==========================================

Artefact de MESURE, pas un produit. Trois composants gouvernés du design system
Piqueray (ds.presentation, ds.section-header, ds.button) répliqués à la main en
blocs Odoo 19, pour chiffrer ce que cette réplique coûte.

Ce module ne va sur aucun site : rien ne le compare aux contrats, donc il peut
devenir silencieusement faux sans qu'aucune porte ne s'allume.

Voir README.md et NON-PORTES.md dans le dossier du module.
""",
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
        "website.website_builder_assets": [
            "piqueray_ds/static/src/js/piqueray_option.js",
            "piqueray_ds/static/src/js/piqueray_option.xml",
        ],
    },
    # Pas d'"application": True — c'est délibéré. Ce module n'est pas une app,
    # et la voie d'installation est le CLI (`-i piqueray_ds`, qui exige `-d`),
    # jamais le filtre « Apps » de l'interface. Piège nommé : sans ce drapeau, le
    # module n'apparaît PAS sous le filtre par défaut ; il faut le mode
    # développeur, *Update Apps List*, puis le filtre « Extra ».
    "installable": True,
    "auto_install": False,
}
