# TinySpec: Page container — la colonne `content` rétrécit (minmax(0,1fr))

**Branch**: terrific-action
**Date**: 2026-08-23
**Status**: implemented (in-scope ✅ ; porte `npm run build` bloquée par un échec PRÉ-EXISTANT non lié — voir Done When)
**Complexity**: small

## What

La content-grid du page container (`o_pqr_page`) fige sa colonne centrale à ~1552px sur
fenêtre étroite et rogne les sections au lieu de les laisser rétrécir. Cause : `1fr` vaut
`minmax(auto, 1fr)`, dont le minimum `auto` se cale sur le min-content de la section la plus
large. Le remède est de passer la piste `content` en `minmax(0, 1fr)` — sans toucher au
gutter 89px ni à l'override full-bleed.

## Context

| File | Role |
|------|------|
| `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css` | Modifié — `.o_pqr_page` grid-template-columns, bloc `ODOO-PAGE-LAYOUT` |
| `integrations/odoo/authoring/README.md` | Contexte — § « Layout de page » (89 gutter / 128 gap, `s_pqr_bleed → full`) |
| `integrations/odoo/config/adaptation-registry.json` | Contexte — reason code `odoo-page-layout` |
| `specs/tiny/odoo-page-gutter-gap.md` | Contexte — tinyspec sœur qui a posé la content-grid |

## Requirements

1. La piste `content` de `.o_pqr_page` est `minmax(0, 1fr)` (le minimum `auto` implicite est neutralisé).
2. Le système inchangé : gutter 89px conservé, lignes nommées `full`/`content` conservées, override `.o_pqr_page > .s_pqr_bleed { grid-column: full }` (devis, hero) toujours pleine largeur.
3. À largeur de référence (1440px) le rendu est identique — zéro régression, zéro overflow horizontal.
4. Sur fenêtre étroite (≤768px) chaque section directe du page container rétrécit avec le viewport (categories : plus de crop).
5. Aucune valeur de design dupliquée ; couche composition, non gouvernée (hors parity/image-parity).
6. Hors périmètre (sujet à part) : les blocs à largeur racine fixe non-responsive en isolation (`google-reviews`, `header`) — traités ailleurs, éventuel `overflow` de sécurité sur le container non inclus ici.

## Plan

1. Dans `odoo-bridge.css`, bloc `ODOO-PAGE-LAYOUT`, remplacer `[content-start] 1fr [content-end]` par `[content-start] minmax(0, 1fr) [content-end]`.
2. Ajouter une ligne de commentaire à côté (pourquoi `minmax(0,…)` : neutralise le minimum `auto` de la piste `fr`).
3. Rebuild des assets de l'instance de vérif : `docker compose -f integrations/odoo/qa/compose.yaml run --rm odoo -d piqueray_qa -u piqueray_ds --stop-after-init` puis restart, page home déjà composée.
4. Mesurer overflow document à 1440 / 1024 / 768 / 500 / 375 (Chromium playwright-core) : sections directes ≤ viewport.

## Tasks

- [x] Éditer `.o_pqr_page` : `content` → `minmax(0, 1fr)` (+ commentaire)
- [x] Rebuild assets + restart sur l'instance QA 8069
- [x] Vérifier : overflow 0 à 1440 (pas de régression maquette) — contribution page-grid = 0 (seul résiduel = google-reviews, cause 2 hors périmètre)
- [x] Vérifier : sections directes (hero, categories, presentation, sav, devis, reassurances, section-header) ≤ viewport à 768/500/375 — OK sauf google-reviews (cause 2)
- [x] Vérifier : devis + hero toujours pleine largeur (`grid-column: full`) — = viewport à 1440→375

## Done When

- [x] All tasks checked off
- [ ] `npm run build` vert — **BLOQUÉ par un échec PRÉ-EXISTANT non lié** : `odoo:derivation` refuse `adaptation-registry.json` (entrée 71 `ODOO-PAGE-LAYOUT`, commit `8280f1dd`) — adaptationId hors motif, `rootContracts` vide, mechanism `page-composition` hors énum. Reproduit avec cette modif mise de côté ; ma modif ne touche que `odoo-bridge.css` (CSS non généré, aucun re-pin golden). À traiter séparément.
- [x] Overflow horizontal du page container = 0 sur toute la plage (hors blocs cause 2, hors périmètre)
