# ZONE MANUELLE (spec 037, T037). Chemin UPDATE de l'arbre du menu.
#
# ── Ce que cette migration corrige, et ce qu'elle ne touche JAMAIS ───────────
# La spec 022 avait placé « Motorisation » sous « Portes d'entrée ». Ce placement
# était INFÉRÉ et le disait : la maquette ne dessinait aucun panneau de sous-menu,
# et le chevron du master « Portes d'entrée » exigeait au moins un enfant. L'owner
# a tranché le 2026-09-08 : Motorisation appartient à « Portes de garage ».
#
# Le semis (`data/menu_seed.xml`) porte `noupdate="1"` : il crée, il n'écrase
# jamais. Il suffit donc pour une installation FRAÎCHE, et ne peut rien pour une
# base déjà installée. D'où cette migration.
#
# La GARDE est toute la question. Le menu appartient au client dès la livraison
# (FR-012) : re-ranger une entrée est une édition standard, et une migration qui
# réécrirait le rangement du client serait exactement le défaut que `noupdate`
# existe pour empêcher. Donc : on ne corrige QUE notre propre inférence — si et
# seulement si l'entrée est ENCORE sous « Portes d'entrée ». Si le client l'a
# déplacée (n'importe où, y compris à la racine), on ne fait rien, en silence
# assumé : ce n'est pas notre menu.
from odoo import api, SUPERUSER_ID


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    motorisation = env.ref("piqueray_ds.menu_motorisation", raise_if_not_found=False)
    inferé = env.ref("piqueray_ds.menu_portes_entree", raise_if_not_found=False)
    validé = env.ref("piqueray_ds.menu_portes_garage", raise_if_not_found=False)
    if not motorisation or not inferé or not validé:
        # Un des trois enregistrements a été supprimé : le menu n'est plus le
        # nôtre. Rien à corriger.
        return
    if motorisation.parent_id != inferé:
        # Déjà validé, ou rangé par le client. Dans les deux cas : on ne touche pas.
        return
    motorisation.write({"parent_id": validé.id, "sequence": 30})

    # ── L'effet de bord qu'il faut réparer dans la foulée ────────────────────
    # MESURÉ le 2026-09-08, sur une base installée puis sur une base fraîche :
    # Odoo force `url = '#'` sur une entrée de menu QUI A DES ENFANTS. Tant que
    # « Motorisation » vivait sous « Portes d'entrée », cette entrée-là avait
    # donc perdu son adresse — et une fois l'enfant parti, le « # » reste : rien
    # ne le nettoie. L'entrée mènerait nulle part, et son état actif ne pourrait
    # jamais correspondre (`website.menu._is_active` compare l'URL).
    #
    # On ne restaure QUE le « # » — c'est notre propre résidu. Une adresse que le
    # client aurait écrite n'est jamais touchée (FR-012).
    if inferé.url == "#" and not inferé.child_id:
        inferé.write({"url": "/portes-entree"})
