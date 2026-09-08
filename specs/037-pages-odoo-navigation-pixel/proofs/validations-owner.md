# Validations owner — les neuf pages à l'écran (US4, T063–T065)

## Où regarder, et pourquoi PAS le pilote

Le plan prévoyait la validation sur le pilote `piqueray-odoo-pilote` (8087). **Ce n'est pas possible depuis ce
worktree, et la raison est nette** : ce conteneur est levé par un AUTRE worktree —
`…/a768cf04-…/oceanic-oak/integrations/odoo/qa/compose.yaml` — et il monte les addons **de ce worktree-là**. Le
mettre à jour ferait servir un module qui n'est pas celui de cette vague, et dérangerait une autre session en cours.

Les liens ci-dessous visent donc l'instance **jetable de la vague**, `piqueray-odoo-037` (port **8109**), qui porte
exactement le module et les neuf pages de ce commit. Jamais `piqueray-odoo-test` (8071), qui est à l'owner.

**Décision attendue de l'owner** : valider ici, ou demander que le pilote soit relevé depuis ce worktree.

## Se connecter

`editor@example.test` / `editor` — rédacteur website (jamais administrateur).

## Les neuf liens ÉDITEUR

| Page | Lien éditeur |
|---|---|
| Accueil | http://localhost:8109/odoo/website?path=%2F&enable_editor=1&with_loader=1 |
| Portes de garage | http://localhost:8109/odoo/website?path=%2Fportes-de-garage&enable_editor=1&with_loader=1 |
| Portes résidentielles | http://localhost:8109/odoo/website?path=%2Fportes-residentielles&enable_editor=1&with_loader=1 |
| Portes industrielles | http://localhost:8109/odoo/website?path=%2Fportes-industrielles&enable_editor=1&with_loader=1 |
| Portes d'entrée | http://localhost:8109/odoo/website?path=%2Fportes-entree&enable_editor=1&with_loader=1 |
| Motorisation | http://localhost:8109/odoo/website?path=%2Fmotorisation&enable_editor=1&with_loader=1 |
| Dépannage/SAV | http://localhost:8109/odoo/website?path=%2Fdepannage-sav&enable_editor=1&with_loader=1 |
| À propos | http://localhost:8109/odoo/website?path=%2Fa-propos&enable_editor=1&with_loader=1 |
| Contactez-nous | http://localhost:8109/odoo/website?path=%2Fcontactez-nous&enable_editor=1&with_loader=1 |

## Le registre des verdicts — une ligne par page, datée

Une page « validée » sans ligne ici n'existe pas (SC-008). Une page renvoyée « à corriger » repasse par la
correction du descripteur, la recomposition **puis** la mesure avant tout nouveau verdict (FR-020) — jamais l'inverse.

| Date | Page | Verdict | Demande |
|---|---|---|---|
| — | Accueil | **en attente** | — |
| — | Portes de garage | **en attente** | — |
| — | Portes résidentielles | **en attente** | — |
| — | Portes industrielles | **en attente** | — |
| — | Portes d'entrée | **en attente** | — |
| — | Motorisation | **en attente** | — |
| — | Dépannage/SAV | **en attente** | — |
| — | À propos | **en attente** | — |
| — | Contactez-nous | **en attente** | — |

**Aucune des neuf pages n'est validée à ce jour.** C'est écrit ainsi plutôt que laissé implicite : les neuf lignes
sont ouvertes, et la vague ne prétend pas le contraire.
