# Piqueray Design System — addon Odoo 19 de production (spec 019, étendu 022).
#
# Ce module ne déclare aucun modèle Python : il ne porte que des vues QWeb, des
# ressources statiques générées et des adaptateurs d'éditeur.
#
# Spec 022 ajoute un seul crochet Python — la finalisation « une fois » du shell
# header (parent des menus semés → racine du site, retrait des défauts d'Odoo,
# bascule du header). Aucun modèle : juste `post_init_hook` (référencé par le
# manifeste) et son jumeau de migration.
from .hooks import post_init_hook  # noqa: F401
