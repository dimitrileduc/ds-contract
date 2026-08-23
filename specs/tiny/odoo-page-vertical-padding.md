# TinySpec: Odoo page container — padding vertical (top 48, bottom 128)

**Branch**: `odoo-page-vertical-padding` (à créer depuis `main`)
**Date**: 2026-08-23
**Status**: done — vérifié live (instance jetable 8085) ; en attente de validation owner
**Complexity**: small

## What

Ajouter un padding vertical au page container `.o_pqr_page` : **48px en haut, 128px en bas**. Prolonge le layout non gouverné posé par `odoo-page-gutter-gap` (content-grid). Valeurs via tokens, aucun littéral.

## Context

| File | Role |
|------|------|
| `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css` | Modifié — ajoute `padding-block` sur `.o_pqr_page` (bloc `ODOO-PAGE-LAYOUT`) |
| `integrations/odoo/authoring/README.md` | Modifié — une ligne dans § « Layout de page » (le padding vertical fait partie de la convention) |

## Requirements

1. `.o_pqr_page` porte `padding-block: var(--pqr-space-48) var(--pqr-space-128)` (top 48, bottom 128). Tokens vérifiés présents dans `generated/tokens.pqr.css`. Aucun littéral nu (constitution §geometry-rides-tokens).
2. Le padding vertical s'applique au container, PAS par section : 48px au-dessus de la 1ʳᵉ section, 128px sous la dernière. N'affecte ni le gutter horizontal, ni le `row-gap`, ni le full-bleed de devis (`grid-column: full` reste pleine largeur).
3. Reste de la couche composition NON gouvernée : aucun `contracts/*.contract.json` ni token touché ; `parity`/image-parity inchangés.

## Plan

1. `odoo-bridge.css` → dans la règle `.o_pqr_page`, ajouter `padding-block: var(--pqr-space-48) var(--pqr-space-128);`.
2. README authoring § « Layout de page » → mentionner le padding vertical (top 48 / bottom 128) à côté du gutter et du gap.

## Tasks

- [x] `padding-block: var(--pqr-space-48) var(--pqr-space-128)` sur `.o_pqr_page`
- [x] Ligne « padding vertical top 48 / bottom 128 » dans le README authoring
- [x] Vérif live : `-u piqueray_ds` (régénère les assets) + capture — bundle sert `padding-block:var(--pqr-space-48) var(--pqr-space-128)` ; page grandit de **exactement 176px** (= 48+128), 48 sous la nav, 128 avant le footer, devis toujours pleine largeur

## Done When

- [x] `.o_pqr_page` a le padding-block ; page rendue montre 48 en haut / 128 en bas
- [x] devis toujours full-bleed, gutter + gap inchangés
- [x] Aucun contrat/token/généré touché
- [x] Jamais `piqueray-odoo-test` (8071) — instance jetable uniquement
