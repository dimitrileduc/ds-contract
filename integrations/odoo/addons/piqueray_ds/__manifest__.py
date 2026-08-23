# Manifeste de l'addon de production Piqueray (spec 019).
#
# ZONE MANUELLE. Ce fichier n'est pas une sortie générée : il est écrit à la main
# et relu. Il ne porte pas de marqueurs ODOO-019-* BEGIN/END — le registre
# d'adaptations (T062/T063) ne couvre que views/, static/src/js/, static/src/xml/
# et static/src/css/odoo-bridge.css.
#
# INTERDIT ICI : toute référence à `specs/018-odoo-replique-manuelle/`. Le POC 018
# fournit des mécanismes à réexaminer, jamais une dépendance d'exécution.
{
    "name": "Piqueray Design System",
    "summary": "Sections gouvernées Piqueray pour Odoo Website 19",
    "description": """
Sections posables dérivées des contrats Piqueray gouvernés.

Dix racines seulement sont inscrites dans la bibliothèque de blocs :
`ds.presentation`, `ds.google-reviews`, `ds.hero`, `ds.equipe`, `ds.faq`,
`ds.devis`, `ds.sav`, `ds.texte-seo`, `ds.coordonnees` et `ds.reassurances`.
Leurs dépendances internes (`ds.section-header`, `ds.button`,
`ds.review-card`, `ds.member-card`, `ds.member-picture`, `ds.accordion-row`,
`ds.carte`) sont composées par QWeb et ne sont jamais posables séparément.

La barre de navigation Piqueray (`ds.header`) est un gabarit SHELL système
(spec 022) : elle hérite `website.layout` et remplace la zone header native —
jamais un snippet posable. Ses liens sont la donnée native `website.menu`,
éditée par le dialogue de menu standard d'Odoo.

Le pied de page Piqueray (`ds.footer`) est un gabarit SHELL système (spec 023) :
il hérite `website.layout` et remplace la zone footer native. Les textes des
colonnes et du copyright sont éditables inline via `t-field` sur des champs
`Text` du modèle `website` ; les URLs sociales passent par les champs natifs
`website.social_facebook` / `website.social_instagram`.

Les feuilles sous `static/src/css/generated/` sont produites par
`npm run odoo:assets` et ne doivent jamais être éditées à la main.
""",
    "version": "19.0.1.9.0",
    "category": "Website/Website",
    "author": "Piqueray",
    "license": "LGPL-3",
    "depends": [
        # `html_builder` arrive par transitivité de `website` — vérifié sur
        # l'image épinglée par la sentinelle de compatibilité (T018).
        "website",
    ],
    # Spec 022 : finalisation « une fois » du shell header à l'INSTALL frais
    # (parent des menus semés → racine du site, retrait des défauts d'Odoo,
    # bascule du header). Le chemin UPDATE passe par migrations/19.0.1.6.0/.
    "post_init_hook": "post_init_hook",
    # AUCUNE page de test ici. Le banc d'éditabilité vivait dans ce `data` et
    # publiait donc une page de mesure sur le site réel, pendant qu'un commentaire
    # affirmait le contraire. Il vit désormais dans l'addon `piqueray_ds_qa`,
    # installé par la QA seulement. Corrigé en revue le 2026-08-08.
    #
    # Templates du produit : composants internes, racines posables, et — spec 022 —
    # le gabarit SHELL du header (système, jamais un snippet) + le semis du menu.
    "data": [
        "views/components.xml",
        "views/snippets.xml",
        "views/header.xml",
        "views/footer.xml",
        "data/menu_seed.xml",
    ],
    "assets": {
        # Servi au visiteur ET dans l'éditeur.
        "web.assets_frontend": [
            # Sorties générées — produites par T012/T013, jamais éditées.
            "piqueray_ds/static/src/css/generated/tokens.pqr.css",
            "piqueray_ds/static/src/css/generated/fonts.pqr.css",
            "piqueray_ds/static/src/css/generated/components.pqr.css",
            # Zone manuelle — mécanique Odoo seulement (T033).
            "piqueray_ds/static/src/css/odoo-bridge.css",
            # Dépliage public de la FAQ : bascule pure + Interaction du noyau 19.
            "piqueray_ds/static/src/js/faq_toggle.js",
            "piqueray_ds/static/src/js/faq_interaction.js",
            # Dépliage public du Texte SEO : réutilise la bascule partagée.
            "piqueray_ds/static/src/js/texte_seo_interaction.js",
        ],
        # Chargé uniquement dans l'éditeur de site.
        "website.website_builder_assets": [
            # Frontière unique avec les APIs internes d'Odoo 19 (T018).
            "piqueray_ds/static/src/js/odoo19_compat.js",
            # La bascule FAQ est partagée avec le frontend : le builder vit dans
            # la fenêtre haute, son bundle doit donc porter sa propre copie.
            "piqueray_ds/static/src/js/faq_toggle.js",
            # Actions métier chargées avant le plugin qui les enregistre (T029/T030).
            "piqueray_ds/static/src/js/repeat_action.js",
            "piqueray_ds/static/src/js/media_action.js",
            # Politique d'éditabilité et garde rich-text (T019).
            # Projection Figma générée : doit précéder l'option/action qui la lit.
            "piqueray_ds/static/src/js/generated/figma_links.js",
            "piqueray_ds/static/src/js/authoring.js",
            "piqueray_ds/static/src/js/rich_text_guard.js",
            "piqueray_ds/static/src/js/version_guard.js",
            # Panneau racine minimal de la fondation ; T031 y ajoute ensuite
            # les contrôles métier dérivés des configs.
            "piqueray_ds/static/src/xml/authoring.xml",
            # T054 ajoute ici `version_guard.js`.
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}
