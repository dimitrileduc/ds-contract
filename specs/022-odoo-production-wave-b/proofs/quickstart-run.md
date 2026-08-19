# T036 — Quickstart rejoué de bout en bout (instance propre)

**Date** : 2026-08-19 · **Instance** : `odoo:19.0-20260803` + `postgres:15` (compose QA,
base jetable `piqueray_qa`), reconstruite à chaque scénario (`withInstance` = DROP +
install).

Les 6 étapes de `quickstart.md`, chacune confirmée verte :

| # | Étape | Résultat |
|---|---|---|
| 0 | **Pré-requis worktree (F1)** — `npm install` + `npx playwright install chromium` | ✅ `proofs/setup.md` — node 24.14.0, playwright 1.62.1, chromium en cache |
| 1 | **Le gate d'abord** — tables de verdicts `validated` avant toute authoring | ✅ `proofs/gate.md` — les 2 tables `status: validated`, owner 2026-08-19 |
| 2 | **Instance de qualification** — Docker up, healthcheck | ✅ `piqueray-odoo-qa-{db,odoo}` healthy ; images du lock (`odoo:19.0-20260803` + `postgres:15`) |
| 3 | **Boucle de portage** (racines+repin → authoring → spike → QWeb → assets) | ✅ lock 15→18, `odoo:inputs/authoring/derivation/assets/module` verts ; spike D9 5/5 |
| 4 | **QA d'une section** (pose fraîche) | ✅ `coordonnees.spec.mts` 15/15 · `reassurances.spec.mts` 16/16 |
| 5 | **Delta visuel contre la référence 020** | ✅ Coordonnées **0.1007 %** · Réassurances **0.4530 %** — chiffrés + attribués (SC-003) |
| 6 | **Qualification de la vague** | ✅ portes Odoo statiques vertes ; sweep dépôt (build/plugin/roundtrip/core-browser/tsc/eval) ; non-régression transversale rejouée — voir `qualification-report.md` |

## Rappels qui mordent — tenus

- **Jamais** d'édition sous `static/src/css/generated/` : les assets sont régénérés par
  `npm run odoo:assets` et `--check` reste vert.
- Un bloc posé est une **copie figée** : la QA se fait sur pose fraîche (chaque scénario
  reconstruit la base). Une mise à jour d'addon ne repropage rien (limite T035).
- Sections posées **sans src** d'images : plan Google placeholder ; photos de cartes
  entrées au montage (`/web/image`).
- **W-auto mesuré** : assertions à 1728 ET 1440 dans chaque scénario (SC-008) — 0
  débordement des deux côtés.
- Le pont figma-console n'est **pas** utilisé (Figma en lecture zéro).
