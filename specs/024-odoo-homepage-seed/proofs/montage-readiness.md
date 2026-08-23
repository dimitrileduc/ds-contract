# Proof — montage readiness (024, T003)

**Date**: 2026-08-23

## Owner instance

`docker ps` confirms the owner instance is up and healthy:

```
piqueray-odoo-test-odoo-1   odoo:19.0-20260803   0.0.0.0:8071->8069/tcp   Up (healthy)
piqueray-odoo-test-db-1     postgres:15                                   Up (healthy)
```

Homepage responds `HTTP 200` at `http://localhost:8071/`.

## The 7 in-scope snippet templates are present in the addon

Confirmed by reading the addon source (read-only) —
`integrations/odoo/addons/piqueray_ds/views/{components,snippets}.xml`:

| # | Section (order) | Snippet template id |
|---|-----------------|---------------------|
| 1 | Hero            | `s_pqr_hero` |
| 2 | Catégories      | `s_pqr_categories_principales` |
| 3 | Présentation    | `s_pqr_presentation` |
| 4 | SAV             | `s_pqr_sav` |
| 5 | Devis           | `s_pqr_devis` |
| 6 | Réassurances    | `s_pqr_reassurances` |
| 7 | Google Reviews  | `s_pqr_google_reviews` |

All 7 are registered both as templates (`components.xml`) and as builder snippets
(`snippets.xml`). Out-of-scope templates also present but **not** to be montaged
(FR-010): `s_pqr_coordonnees`, `s_pqr_equipe`, `s_pqr_faq`, `s_pqr_texte_seo`.

**Implication (research R1)**: no new templates are needed. The montage (US1) is a
manual editor task (drag-drop + edit texts + upload images) performed by the owner in
the Odoo website builder, on the owner instance — not a code task, and not an agent task.
