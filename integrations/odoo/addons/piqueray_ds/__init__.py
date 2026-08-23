# Piqueray Design System — addon Odoo 19 de production (spec 019, étendu 022/023).
#
# Spec 023 ajoute un modèle Python : extension de `website` avec 4 champs Text
# pour le contenu rédacteur du footer (colonnes + copyright), lus par `t-field`.
from . import models  # noqa: F401
from .hooks import post_init_hook  # noqa: F401
