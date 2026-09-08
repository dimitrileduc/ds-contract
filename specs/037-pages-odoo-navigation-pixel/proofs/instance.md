# T002 — L'instance jetable de la vague 037

| Champ | Valeur |
|---|---|
| Projet Docker | **`piqueray-odoo-037`** |
| Port HTTP | **8109** (bus 8110) |
| Base | `piqueray_037` |
| Images | `odoo:19.0-20260803` + `postgres:15` (épinglées, `inputs.lock.json`) |
| Addons installés | `piqueray_ds` seul — **pas** `piqueray_ds_qa` (D5 : son banc pose des pages-fixtures aux URL des vraies pages) |
| Levée | `bash specs/037-pages-odoo-navigation-pixel/tools/instance-037.sh up` (2026-09-08) |
| Vérification | `GET http://localhost:8109/` → **200** |

Ports occupés au 2026-09-08 avant le choix : 8071 (owner, **interdit**), 8087 (pilote), 8093, 8085, 8075, 8099, 8105, 18069.
8109/8110 étaient libres.

**Règle de fer** : `piqueray-odoo-test` (8071) est l'instance de l'owner — jamais visée par cette vague. Le pilote 8087
ne sert qu'à la validation owner à l'écran (US4). Construction, navigation et mesure : **037 seulement**.
