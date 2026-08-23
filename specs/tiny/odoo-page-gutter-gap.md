# TinySpec: Odoo page container — gutter horizontal + gap vertical (content-grid), non gouverné

**Branch**: `odoo-page-gutter-gap` (à créer depuis `main`)
**Date**: 2026-08-23
**Status**: done — vérifié live sur instance jetable neuve (port 8085) ; en attente de validation owner
**Complexity**: small

## What

Poser le padding horizontal (gutter 89) et l'espacement vertical (gap 128) des pages Odoo **une seule fois**, sur le page container `#wrap`, via une **content-grid CSS** (lignes nommées, pas de marge négative). Les sections restent full-width et gouvernées ; le gutter/gap vivent **uniquement dans la couche composition** — jamais dans un contrat. Les sections full-bleed (devis) sortent via `grid-column: full`.

## Context

| File | Role |
|------|------|
| `integrations/odoo/authoring/compose_page.py` | Modifié — classe `o_pqr_page` sur `#wrap` (l.169) ; handler `add_class` symétrique du `remove_class` existant (l.160) |
| `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css` | Modifié — règles content-grid `.o_pqr_page`, `> * { grid-column: content }`, `.s_pqr_bleed` (seul CSS éditable à la main ; déjà bundlé `web.assets_frontend`) |
| `integrations/odoo/authoring/pages/home.json` | Modifié — devis reçoit `"add_class": ["s_pqr_bleed"]` |
| `integrations/odoo/authoring/README.md` | Modifié — section « Layout de page » (la convention pour tout futur agent html→odoo) |
| `integrations/odoo/config/adaptation-registry.json` | Modifié — nouveau reason code `odoo-page-layout` |
| `CLAUDE.md` | Modifié — pointeur d'une ligne dans « Odoo page authoring » |

## Requirements

1. Le `#wrap` composé porte la classe `o_pqr_page`.
2. `.o_pqr_page` est une content-grid : gutters latéraux `var(--space-89)` (fallback 89px), `row-gap: var(--space-128)` (fallback 128px), enfants placés en colonne `content` par défaut. Valeurs référencées via tokens, **aucun littéral nu** (constitution §geometry-rides-tokens).
3. Un descripteur de section accepte `add_class: [...]`, appliqué au root `data-pqr-part="root"` (strict symétrique de `remove_class`).
4. devis (`home.json`) porte `add_class: ["s_pqr_bleed"]` → `grid-column: full` : pleine largeur, **gap vertical conservé** (grid, pas de marge négative).
5. Le gutter/gap ne touchent **aucun** `contracts/*.contract.json` ni token-governance : `npm run parity` et image-parity inchangés (image-parity mesure le bloc nu, full-width). Cohérent avec Figma (le 89 vit sur un frame `Container` non gouverné — cf. nœud `2496:7189`).
6. La convention est écrite dans le README authoring **et** tracée par un reason code dans `adaptation-registry.json`.

## Plan

1. `compose_page.py:169` → `<div id="wrap" class="oe_structure o_pqr_page">`.
2. `compose_page.py` (près de l.160) → ajouter, symétrique de `remove_class`, un `add_class` qui ajoute les classes au root de section.
3. `odoo-bridge.css` → poser les 3 règles content-grid (vérifier les noms exacts des vars token dans `generated/tokens.pqr.css`).
4. `home.json` → `"add_class": ["s_pqr_bleed"]` sur la section devis.
5. README authoring → section « Layout de page » : page container = gutter+gap ; sections full-width sans gutter ; **jamais le gutter dans un contrat** ; full-bleed = `add_class: ["s_pqr_bleed"]` ; non surveillé par parity/image-parity (assumé).
6. `adaptation-registry.json` → reason code `odoo-page-layout` (+ pointeur CLAUDE.md).

## Tasks

- [x] Classe `o_pqr_page` sur `#wrap` (`compose_page.py:169`)
- [x] Handler `add_class` symétrique du `remove_class` (`compose_page.py`)
- [x] Règles content-grid dans `odoo-bridge.css` (vars `--pqr-space-89` / `--pqr-space-128` vérifiées)
- [x] `add_class: ["s_pqr_bleed"]` sur devis (`home.json`)
- [x] Section « Layout de page » dans le README authoring
- [x] Reason code `odoo-page-layout` + pointeur CLAUDE.md
- [x] Recompose sur instance jetable NEUVE (projet `piqueray-odoo-gutter`, port 8085, bindée sur cette branche, addon installé sur base neuve). Vérifié : `#wrap` = `oe_structure o_pqr_page` ; devis = `s_pqr_devis devis s_pqr_bleed` ; bundle frontend sert `.o_pqr_page{grid…}` + `.s_pqr_bleed{grid-column:full}`. Capture pleine page confirme : gutter uniforme, devis seul en pleine largeur, gap vertical conservé.

## Done When

- [x] Page recomposée : gutter 89 + gap partout, devis pleine largeur avec gap vertical intact — **vérifié (capture)**
- [x] Aucun contrat/token/généré touché → `parity`/image-parity structurellement inchangés ; `odoo:module:check` 19/19 vert, `odoo:authoring:check` vert
- [x] README + registre documentent la convention (aucune règle invisible)
- [x] Jamais `piqueray-odoo-test` (8071) — non ciblé
