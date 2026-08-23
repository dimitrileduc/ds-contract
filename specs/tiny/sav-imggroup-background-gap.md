# TinySpec: sav-imggroup-background-gap — liseré entre carte texte et carte image

**Branch**: chlorinated-cent · **Date**: 2026-08-23 · **Status**: done — contrat + surfaces générées + propagation Odoo + fixture, **toutes portes vertes (eval 220/220)** · **Complexity**: small au cœur (1 déclaration CSS), **propagation Odoo assumée** — comme `hero-titres-deux-colonnes`, gardé en un seul document.

## Réalisé (2026-08-23)

Correctif : `"left": "0"` sur `ImgGroupBackground.declared`, bump `1.4.1`. Preuve rendu archivée sous `proofs/sav-imggroup-background-gap/` (before/after ; after re-mesuré depuis le sample régénéré : blanc `132→778`, bleu `779→1418`, zéro pixel de fond entre les deux).

**Propagation de version — plus large que prévu.** Le bump `1.4.0→1.4.1` a exigé d'aligner **quatre miroirs manuels** de la version/du graphDigest, en plus des générés : `sav.authoring.json` (52 pins), `components.xml` (`data-ds-contract-version` + `data-ds-graph-digest`), `version_guard.js` (`CONTRACT_VERSIONS` + `CURRENT_GRAPH_DIGEST`), `scripts/odoo/scan-saved-versions.ts` (`CONTRACTS` + `EXPECTED_GRAPH`), et la fixture d'eval `evals/fixtures/odoo-production/version-drift/cases.json` (cas `current` + `policy-stale` portaient l'ancien digest). Le graphDigest du lock est **global** : tout changement de contrat le fait bouger, donc les 11 blocs de `components.xml` le portent tous. Re-pins : `inputs.lock.json` (`--repin`), `evals/golden.json`, `figma-sync/plugin/engine.receipt.json`.

**Piège découvert : `npm run build` NE régénère PAS `figma-sync/*.js`** (c'est `npm run figma:plan`). Un re-pin golden fait après le seul `build` fige un `37-sav.js` périmé — le byte-invariant paraît vert alors qu'il compare du périmé à du périmé. L'eval `golden-generated-output` lance `generate-figma.ts` frais et attrape la divergence. Ordre correct : `build` → `figma:plan` → `catalog`/`emitters:check` → `golden:update`.

**Découverte hors périmètre (dérive pré-existante, non gated) :** régénérer catalog + samples a révélé que `ds.footer` (samples v1.1.0→1.2.0) et `ds.hero` (catalog v1.5.0→1.6.0, prop `sousTitre2`) étaient **déjà périmés** dans le dépôt (ni catalog ni samples ne sont regénérés par `build`, ni gated en fraîcheur — cf. finding 018 #3). Pour garder ce diff strictement SAV, **catalog et les samples footer/hero ont été restaurés à HEAD** ; la fraîcheur du catalog (SAV 1.4.1 compris) reste à traiter dans une passe dédiée couvrant toutes les dérives. `core/samples/sav.*` gardés (portent le fix + servent la preuve). `verify:catalog` reste vert (cohérence interne du catalog restauré).

## What

Le fond bleu de la colonne image de `ds.sav` (`ImgGroupBackground`, RECTANGLE Figma `2108:3097`) est un plan `position:absolute` censé couvrir toute la colonne depuis (0,0), comme le fait la part `background` de la section. Mais le contrat l'épingle avec `align-self: flex-start` — **inerte sur un abspos** — au lieu de `left: 0`. Le plan retombe alors à sa position de flux, après le `padding-left: {space.3}` de la colonne (`justify-content: flex-start`), et laisse un liseré d'~3px à gauche où ni le blanc ni le bleu ne peint : le fond derrière transparaît. Figma n'a pas ce gap (le rect est à (0,0), le décalage de 3px ne bouge que la photo). On ajoute `left: 0` au plan bleu, on régénère, on propage jusqu'à Odoo.

## Diagnostic (mesuré, rendu Chromium headless du sample `core/samples/sav.html`, fond de page rouge)

```
avant : blanc 132→778 · ROUGE 779→781 (~3px) · bleu 782→1421
après (left:0) : blanc 132→778 · bleu 779→1418 · plus de rouge, les deux cartes se touchent
```

Cause exacte : `.sav__WrapperBackground` couvre par chance (sa colonne est `justify-content:center`, le plan absolu se recentre) ; `.sav__ImgGroupBackground` ne couvre pas car sa colonne est `justify-content:flex-start` + `padding-left:3`. Angle mort : `sav` est une `section`, non couverte par `visual-parity` (12 sections exclues, gap documenté CLAUDE.md) ; `parity` ne voit pas une position brute. **Le défaut vit dans le CSS gouverné émis** (`.sav__ImgGroupBackground`) — identique dans le sample, la surface React et le `components.pqr.css` d'Odoo. Ce n'est pas un artefact Odoo.

## Context

| Fichier / nœud | Rôle |
|---|---|
| `contracts/sav.contract.json` | **Édité** — `ImgGroupBackground.declared` : ajouter `"left": "0"` (idiome déjà utilisé par la part `background` : `top/right/left: "0"`). Bump `1.4.0` → `1.4.1` + note de description. `align-self:flex-start` peut rester (inerte) ou être retiré. |
| Figma `2108:3097` (master DS·Organisms) | **Non touché** — la source est correcte (rect à (0,0)) ; défaut de modélisation côté contrat, pas de source. Aucun geste canvas. |
| `src/components/SAV/**`, `figma-sync/37-sav.js`, `integrations/odoo/.../generated/components.pqr.css`, `integrations/odoo/derivation-report.json` | **Générés par `npm run build`** — jamais à la main. `37-sav.js` probablement inchangé (l'émetteur figma positionne en x/y, pas via `left`) — à vérifier. |
| `integrations/odoo/addons/piqueray_ds/views/components.xml` | **Édité** — `data-ds-contract-version="1.4.0"` → `1.4.1` sur `s_pqr_sav` (le balisage `.sav__ImgGroupBackground` existe déjà, rien d'autre à changer). |
| `integrations/odoo/addons/piqueray_ds/static/src/js/version_guard.js` | **Édité** — `CONTRACT_VERSIONS["ds.sav"]` → `1.4.1`. Module/digest : ne bumper `CURRENT_MODULE_VERSION`/`__manifest__.py` que si `odoo:module:check` l'exige (le CSS généré change) — à vérifier, pas à supposer. |
| `catalog/catalog.json` | **Généré par `npm run catalog`** (séparé de `build`, gap connu) — refléter la 1.4.1. |
| `evals/golden.json` | Re-pin via `npm run golden:update` **si** un artefact épinglé change d'octets (vérifier avec `npm run eval`). |
| `core/samples/sav.{html,css}` | Échantillons de référence — régénérer/mettre à jour pour rester alignés sur l'émetteur (vérifier le pipeline d'échantillons ; sinon MAJ à la main). |

## Requirements

1. Dans le rendu de `ds.sav`, la carte bleue (image) couvre toute la largeur de sa colonne : **aucun pixel de fond derrière** entre le bord droit de la carte blanche et le bord gauche de la carte bleue.
2. Le correctif passe par un `declared` d'inset (`left: "0"`), cohérent avec la part `background` de la section — **pas** un nouveau littéral géométrique invisible (0 d'inset, prior art dans le même contrat ; hors périmètre named-literals).
3. La correction est présente à l'identique dans les trois surfaces émises (React `src/components/SAV`, sample `core/samples`, Odoo `components.pqr.css`) — elles proviennent du même émetteur.
4. Le contrat passe en `1.4.1` et la version est propagée partout où elle est répliquée (template Odoo, `version_guard.js`, catalog).
5. Aucune régression sur les autres parts (fond de section, carte blanche, photo, hauteurs) — le seul écart voulu est la fermeture du liseré à gauche du fond bleu.

## Plan

1. Éditer `contracts/sav.contract.json` : ajouter `"left": "0"` au `declared` de `ImgGroupBackground`, bump `1.4.1`, note de description (limite levée + renvoi au diagnostic mesuré).
2. `npm run build` (régénère React + `figma-sync` + `components.pqr.css` + derivation-report).
3. `npm run catalog` (rafraîchit `catalog.json`).
4. Propager la version Odoo : `data-ds-contract-version` dans `components.xml`, `CONTRACT_VERSIONS["ds.sav"]` dans `version_guard.js` ; bump module/manifest seulement si `odoo:module:check` l'impose.
5. Aligner `core/samples/sav.{html,css}` sur l'émetteur ; re-pin `evals/golden.json` si nécessaire.
6. Vérifier au rendu (Chromium headless, même harnais que le diagnostic) que le liseré est fermé, puis passer les portes.

## Tasks

- [x] Contrat : `left: "0"` sur `ImgGroupBackground.declared` + bump `1.4.1` + note description
- [x] `npm run build` + `npm run figma:plan` (piège : `build` ne fait pas figma-sync) puis inspection du diff des générés
- [x] Propagation version : `sav.authoring.json`, `components.xml`, `version_guard.js`, `scan-saved-versions.ts`, fixture `version-drift/cases.json` (+ graphDigest global sur les 11 blocs)
- [x] Re-pins : `inputs.lock.json` (`--repin`), `evals/golden.json`, `engine.receipt.json`
- [x] `core/samples/sav.{html,css}` réalignés (via `emitters:check`)
- [x] Preuve rendu archivée sous `proofs/` — blanc↔bleu jointifs, avant/après
- [x] Catalog + samples footer/hero restaurés à HEAD (dérive pré-existante hors périmètre)

## Done When

- [x] Toutes les tâches cochées
- [x] Preuve rendu : plus aucun pixel de fond entre les deux cartes (`779→1418` bleu continu)
- [x] Portes vertes : `build`, `parity`, `eval` **220/220**, `plugin:check`, `tsc` (src + build), `geometry:gate`, `roundtrip`, `core-browser`, `odoo:{inputs,authoring,module,derivation,assets}:check`, `verify:catalog`
- [x] (Worktree) `npm install` + `npx playwright install chromium` faits avant le sweep complet
