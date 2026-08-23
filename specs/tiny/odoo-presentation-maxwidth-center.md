# TinySpec: Presentation — plafond de largeur (1287) + centrage dans sa cellule content

**Branch**: `keen-farm` (courante)
**Date**: 2026-08-23
**Status**: done
**Complexity**: small

## What

La section `ds.presentation` suit sa cellule `content` (`minmax(0,1fr)`) jusqu'au viewport : au resize large, les deux colonnes `FILL grow=1` se repartagent une largeur infinie et le vide titre/paragraphe gonfle. On **plafonne le bloc à sa largeur d'auteur Figma (referenceWidth 1287)** et on le **centre horizontalement dans sa cellule** `content`. Le page container ne change pas (il fait déjà le gutter/gap) ; le master Figma reste `FILL` ; le 50/50 interne des colonnes est **hors périmètre** (parqué → « responsive plus tard »).

## Décision de surface (à trancher avant impl — c'est LE choix)

| Option | Portée | Coût | Verdict |
|--------|--------|------|---------|
| **A — Composition Odoo** (recommandée) | Site Odoo seul | 3 lignes CSS sur `.s_pqr_presentation`, aucun contrat/token/Figma/golden | Corrige la surface que l'owner regarde ; même statut non-gouverné que le page container |
| B — Canal gouverné (contrat) | React + Odoo | Ajout additif d'un canal `justify-self`/`margin-inline` au schéma + émetteurs + re-pin `evals/golden.json` | **Upgrade full SDD** — dépasse le tinyspec ; `max-width` existe déjà (code-only) mais le centrage n'a aucun canal (§Context) |

Recommandation : **A maintenant**, B en suivant si Storybook/React doit matcher. `max-width` est déjà, **par design du schéma**, une contrainte code-only (`contract-schema.ts` canal `max-width` : « vit dans le code, le canvas dessine à taille réelle ») → **aucun geste canvas, aucun §VIII** quelle que soit l'option.

## Context

| File | Role |
|------|------|
| `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css` | **Modifié (option A)** — nouveau bloc `.s_pqr_presentation { max-width; margin-inline:auto }`, après `ODOO-019-PRESENTATION-MECHANICS` (l.34). Seul CSS éditable main, déjà bundlé `web.assets_frontend` |
| `contracts/presentation.contract.json` | Context — `root.layout.width:"fill"`, `referenceWidth:1287` ; **non modifié** en option A |
| `packages/schema/src/contract-schema.ts` | Context — canal `max-width` = code-only (l.481-484) ; `align-self` existe, mais **ni `margin-inline` ni `justify-self`** → pourquoi le centrage n'est pas gouvernable sans B |
| Figma master `2103:2824` | Context (lecture) — root FILL, colGauche/wrapper FILL grow=1, gap 32, padding 0. **Non touché** |

## Requirements

1. Sur `.s_pqr_presentation` (grid item, `grid-column: content`) : `max-width: 1287px` + `margin-inline: auto` → capé à 1287, centré dans sa cellule.
2. Sous 1287 de cellule : contrainte inerte, la section reprend toute la largeur (aucune régression maquette au ≤1287).
3. **Aucun** contrat, token, généré, ni master Figma touché → `npm run parity` et image-parity structurellement inchangés (cohérent : `max-width` est code-only par design ; la composition n'est pas surveillée, comme le page container).
4. Le full-bleed n'est pas concerné (presentation n'est pas `s_pqr_bleed`).
5. `1287` en littéral **assumé et commenté** : le schéma classe `max-width` « hors grammaire token » — donc pas de token minté (le minter cascade en re-pin golden pour une constante de composition). Commentaire citant le canal schéma + `referenceWidth`.
6. Règle scopée à la racine Piqueray (feuille dans `web.assets_frontend`) — jamais un sélecteur nu.

## Plan

1. `odoo-bridge.css` → nouveau bloc commenté `ODOO-PRESENTATION-MAXWIDTH` après la l.34, avec les 2 déclarations + justification (statut composition, littéral assumé, `margin-inline:auto` centre l'îlot capé).
2. Recomposer sur instance jetable NEUVE (jamais 8071) : `npm run odoo:page` sur un projet QA, puis capture pleine page pour confirmer bloc capé + centré au large et pleine largeur au ≤1287.
3. Vérifier au passage que le 50/50 interne (vide titre court) est **inchangé** — c'est le comportement parqué, pas une régression.

## Tasks

- [x] Bloc CSS `.s_pqr_presentation { max-width:1287px; margin-inline:auto }` commenté (`odoo-bridge.css`)
- [x] Recompose + capture sur instance jetable QA (port 8090, jamais 8071) : capé/centré au large (1920 → section 1287, marges 316.5/316.5), full-width au ≤1287 (1100 → section 1100, marges 0/0). Rule vérifiée dans le bundle servi (`web.assets_frontend.min.css`). Instance détruite (`down -v`).
- [x] `npm run odoo:module:check` (19/0/0) + `odoo:authoring:check` (toutes configs) verts
- [x] Confirmer parity/image-parity structurellement inchangés (rien de gouverné touché) — diff = 1 fichier composition (`odoo-bridge.css`), aucun contrat/token/généré/Figma

## Done When

- [x] Presentation capé à 1287 et centré au resize large — **vérifié (capture 1920 + 1100)**, page container inchangé
- [x] Aucun contrat/token/généré/Figma touché ; gates Odoo verts
- [x] Littéral 1287 commenté (aucune valeur invisible) ; option B tracée comme suite possible
- [x] Jamais `piqueray-odoo-test` (8071) — capture sur instance jetable dédiée port 8090, détruite après
