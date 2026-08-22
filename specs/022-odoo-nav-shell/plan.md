# Implementation Plan: Barre de navigation Piqueray dans Odoo (le shell)

**Branch**: `022-odoo-nav-shell` | **Date**: 2026-08-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/022-odoo-nav-shell/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Livrer la barre de navigation Piqueray comme **header système** du site Odoo, en deux temps
strictement ordonnés :

1. **Remise à niveau amont (FR-013)** — `ds.header` passe de 1.0.0 à **2.0.0** (**MAJOR**,
   décision owner 2026-08-20) : la variante **Solid — 0 usage relevé (audit 020, 9/9
   Transparent) — est retirée** (prop `fond` supprimée) et son master Figma est **supprimé du
   set** — geste canvas unique : répétition sur clone, capture complète §X, version nommée.
   L'apparence Transparent validée se porte alors par des **canaux existants**, sans toucher
   schéma ni émetteurs : encre des icônes en jeton simple (`iconsNav.tokens.color =
   {color.blanc}` — le root ne portait déjà aucun fond, rien à retirer), logo figé
   `couleur: "blanc"` (rendu : marque orange + wordmark blanc), bouton figé `variant: "blanc"` +
   `iconRight`/`iconRightGlyph` inconditionnels, libellé CTA explicite (`ComponentRef.text`),
   et correction du `repeat.sample[2].href` (`/motorisation` → `/depannage-sav` — le libellé
   « Dépannage/SAV » est porté depuis 016, `e8568440`). Le canal `propsByProp` envisagé
   initialement est **abandonné** : il n'existait que pour servir une variante morte (research
   D3). `ds.piqueray-logo` est **adopté** (draft 0.1.0 → 1.0.0). `ds.nav-item` v1.2.0 n'est pas
   modifié. Toutes les portes du dépôt restent vertes (re-pins : golden, engine.receipt,
   catalog — **aucune édition d'émetteur, donc pas de re-pin polaris** ; refresh lecture du
   snapshot parity après NOTRE geste canvas).

2. **Projection Odoo** — `ds.header` devient une **racine shell** (non posable) de l'intégration :
   sa fermeture CSS entre dans `components.pqr.css` par `npm run odoo:assets` (repin
   `inputs.lock.json`), un gabarit QWeb **système** (hors bibliothèque de blocs, patron
   `review_card`) rend la barre depuis les **données de menu natives `website.menu`** — libellés,
   cibles, ordre, imbrication restent la donnée du client, éditée par le dialogue de menu standard
   d'Odoo. L'arborescence de la maquette est **semée une fois** à la livraison. L'état actif
   (parent souligné pour un enfant de déroulant) mappe la sémantique native d'Odoo sur la classe
   `actif` de `ds.nav-item`. Le CTA réutilise le pont existant `ODOO-019-CTA-LIEN-BRIDGE`
   (`pqr_button` + `link_href`). La barre est posée sur un fond `{color.noir-bleute}` côté Odoo
   uniquement (odoo-bridge.css, adaptation enregistrée). Preuves : scénario fonctionnel de menu
   (CRUD + save/reopen/public), sujet visuel `header` (même instrument que les sections en ligne),
   déroulants + état actif, et reçu SC-006 tiré du bump réel 1.0.0 → 2.0.0 (attesté par les reçus
   amont — la barre n'est jamais en ligne au design 1.0.0).

Le mécanisme header/menu d'Odoo 19 n'a **jamais été relevé** dans ce dépôt (aucune occurrence de
`website.menu` ni `template_header` dans 018/019) : conformément à la séquence de portage du
README d'intégration (étape 3 — « prouver séparément chaque mécanisme Odoo incertain »), un
**spike mécanisme** sur l'instance épinglée précède toute écriture QWeb.

## Technical Context

**Language/Version**: TypeScript (pin dépôt `typescript@^6`), Node ≥ 20, ESM via `tsx` ; Python 3 / XML QWeb / JavaScript (addon Odoo 19, zone manuelle comptée)
**Primary Dependencies**: Zod (`@ds-contracts/schema` — **NON modifié**, aucun canal nouveau), React 19 + CSS Modules (émetteur `react`, non touché), `core/emit-html.ts` (référence visuelle + source de `components.pqr.css`), Docker + Compose (instance `odoo:19.0-20260803` épinglée), `playwright-core` + `extract/image-parity` (instrument visuel 019 réutilisé tel quel), pont figma-console pour **UN geste d'écriture canvas unique et borné** (suppression du master `Fond=Solid` sans usage — répétition sur clone, capture §X, version nommée) ; Figma en **lecture** pour tout le reste
**Storage**: JSON sur disque — `contracts/{header,piqueray-logo}.contract.json` (bump/adoption), `integrations/odoo/config/{inputs.lock.json (repin), header.authoring.json (NOUVEAU), adaptation-registry.json (+entrées)}`, données de semis `website.menu` dans l'addon, reçus sous `specs/022-odoo-nav-shell/proofs/`
**Testing**: portes constitutionnelles (build, parity, eval, plugin:check, roundtrip ×2, core-browser, tsc ×2) + suite Odoo (`odoo:inputs:check`, `odoo:authoring:check`, `odoo:assets -- --check`, `odoo:module:check`, `odoo:derivation:check`, `odoo:typecheck`, `odoo:visual:selftest`) + scénarios QA Playwright sur l'instance jetable
**Target Platform**: bibliothèque React générée + addon Odoo 19 Website (`integrations/odoo/addons/piqueray_ds`) servi par l'instance épinglée
**Project Type**: monorepo contrats→surfaces + intégration cible (addon Odoo de production)
**Performance Goals**: régénération byte-identique (roundtrip ×2, `odoo:assets --check` propre) ; aucune revendication de p95 (limite 019 reprise)
**Constraints**: zéro `node:*` dans `core/` ; déterminisme total de la chaîne de génération ; Figma : **un seul geste d'écriture** (retrait du master Solid, §X actif) — lecture pour tout le reste ; **aucun émetteur `odoo` dans `core/`** (réservé spec 025) ; le menu reste une donnée client — jamais re-semé, jamais écrasé par une régénération
**Scale/Scope**: 2 contrats touchés (`ds.header` **2.0.0**, `ds.piqueray-logo` 1.0.0), **0 modification de schéma, 0 édition d'émetteur**, 1 geste canvas (retrait du master Solid), 1 racine shell ajoutée à l'intégration (fermeture : + `ds.nav-item`, `ds.piqueray-logo` ; `ds.button` déjà dans la fermeture), 1 gabarit QWeb + semis de menu + 1 règle bridge, 1 sujet visuel + 4 scénarios QA, re-pins (golden, engine.receipt, inputs.lock, catalog — **pas de polaris**)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` (v1.2.0). Every item MUST be true, or be
justified in Complexity Tracking below.

- [x] **I. Determinism (NON-NEGOTIABLE)** — Aucun modèle dans la chaîne : schéma et émetteurs
      **intouchés** (les éditions de contrat passent par des canaux existants) ; `odoo:assets`
      est déterministe par construction (racines triées, blocs dédupliqués, zéro date/chemin
      absolu) ; le QWeb est une source manuelle comptée, pas une sortie générée. Preuves :
      roundtrip ×2, `odoo:assets --check`.
- [x] **II. Claims Rule (NON-NEGOTIABLE)** — **Aucun canal nouveau, aucune nouvelle phrase de
      capacité** (le canal `propsByProp` envisagé est abandonné avec la variante Solid — research
      D3) : pas de nouvel eval exigé ; la suite existante est re-épinglée par ses scripts et le
      `N/N` vivant fait foi.
- [x] **III. Contract is the SSoT** — L'apparence entre par les contrats (bump 2.0.0, adoption
      logo) ; la projection Odoo consomme les versions re-épinglées via `inputs.lock.json` ;
      le contenu du menu est une donnée (`website.menu`), jamais du balisage figé ; `npm run
      parity` propre exigé — le snapshot canvas est rafraîchi en **lecture** APRÈS notre geste
      (le retrait du master change l'état du fichier ; limite 017 « snapshot périmé » nommée).
- [x] **IV. No hand-edited output** — `static/src/css/generated/*` uniquement via `odoo:assets`
      (retouche = `tampered`) ; `src/components/` régénéré ; `catalog/catalog.json` régénéré par
      `npm run catalog` (piège nommé : PAS couvert par `npm run build`) ; golden/engine.receipt
      re-épinglés par leurs scripts, jamais à la main.
- [x] **V. Honesty** — Limites nommées dans les artefacts livrés : icônes inertes, sous-menu au
      style Odoo par défaut, hover/mobile/Solid/overlay-hero hors périmètre, ombre portée Solid
      différée, sémantique React (`<div>` racine) différée, placement « Motorisation » dans le
      semis marqué `inferred`, 2 portes Odoo rouges pré-existantes citées sans re-diagnostic.
- [x] **VI. Additive evolution** — Schéma **non modifié** ; `ds.header` 1.0.0 → **2.0.0**
      (**MAJOR** : retrait de la prop `fond` et de la valeur `solid` — le retrait est bruyamment
      versionné, semver strict respecté) ; `ds.piqueray-logo` 0.1.0 → **1.0.0** (adoption, API
      inchangée) ; `docs/02-contract-spec.md` **non bumpé** (aucun canal nouveau).
- [x] **VII. Engine integrity** — `core/` intouché, browser-pur (`node
      scripts/core-browser-check.mjs` le reçoit) ; le geste canvas est une suppression de nœud
      via le pont, pas une projection — aucune classe de bug d'émetteur à enseigner au mock ;
      `plugin:check` + roundtrip re-reçoivent les scripts régénérés (contrats édités).
- [x] **VIII. Source cleanliness** — La remise à niveau **commence par nettoyer la source** :
      le master `Fond=Solid` (0 usage — audit live 020 des 9 usages par POSITION) contredit la
      vérité gouvernée et est **supprimé AVANT l'édition du contrat** (répétition sur clone,
      capture §X, version nommée, re-vérification des 9 instances par POSITION après). Le reste
      promeut des faits déjà relevés (déclarations 013, dump 2026-07-27, relevé 005
      `structure-header-nav`). Exception nommée et acceptée par l'owner (décision
      `020-reference-header-20260809`) : cibles d'alias variables non certifiables (endpoint 403).
- [x] **IX. Docs-first** — auggie MCP indisponible ce jour (HTTP 402) : repli nommé = lecture
      directe. Consultés AVANT toute décision : `integrations/odoo/README.md` (les 4 frontières,
      la séquence de portage en 5 étapes), `docs/FIGMA-CAPABILITY-MATRIX.md` (pont CTA
      `ODOO-019-CTA-LIEN-BRIDGE` — la règle prior-art évite d'inventer un mécanisme de lien),
      `docs/handoff/09-testing-and-gates.md`, ROADMAP (§023 `odoo-site-shell` — écart de
      découpage nommé en recherche), reçus 013/016/017/020, constitution.
- [x] **X. Before-capture** — **ACTIF** (un geste de mutation) : AVANT la suppression du master
      `Fond=Solid`, capture de **chaque cible affectée** — le set header complet ET ses 9 usages
      (captures + dump JSON), chacune vérifiée **non vide et correctement dimensionnée** — puis
      `saveVersionHistoryAsync` (version nommée). Jamais un pilote partiel : le périmètre du geste
      est UN master, la capture couvre tout ce qu'il peut affecter.
- [x] **XI. Multi-writer bridge** — **N/A** : une seule écriture, mono-agent, aucun partitionnement requis.

**All gates green:**

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Specs executing in a git worktree run this sweep INSIDE the worktree (Constitution:
Worktree Gates F1) — `npm install` + `npx playwright install chromium` there first.

Suite cible (intégration) : `npm run odoo:inputs:check && npm run odoo:authoring:check &&
npm run odoo:assets -- --check && npm run odoo:module:check && npm run odoo:derivation:check &&
npm run odoo:typecheck && npm run odoo:visual:selftest -- --strict`.

## Project Structure

### Documentation (this feature)

```text
specs/022-odoo-nav-shell/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── header-2.0.0.delta.md        # delta exact du bump MAJOR (retrait Solid) + geste canvas
│   ├── piqueray-logo-adoption.md    # contrat d'adoption (draft → 1.0.0)
│   └── odoo-projection.md           # interface de la projection (QWeb, menu, semis, authoring, preuves)
├── proofs/              # reçus d'exécution (spike, semis, visuel, SC-006) — créés en implémentation
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# ── Phase amont : remise à niveau gouvernée (schéma et émetteurs INTOUCHÉS) ─
specs/022-odoo-nav-shell/proofs/canvas/      # geste unique : répétition-clone, captures §X avant/après, reçu du retrait Solid
parity/snapshots/figma-components.json       # refresh LECTURE après notre geste (le fichier a changé)
contracts/header.contract.json               # 1.0.0 → 2.0.0 (FR-013 — MAJOR, retrait fond/Solid)
contracts/piqueray-logo.contract.json        # 0.1.0 draft → 1.0.0 adopté
evals/golden.json                            # re-pin (script update-golden)
figma-sync/plugin/engine.receipt.json        # re-pin (plugin:check)
catalog/catalog.json                         # npm run catalog (hors build — piège nommé)
# (pas de re-pin examples/polaris : aucune édition d'émetteur)

# ── Phase cible : projection Odoo ──────────────────────────────────────────
scripts/odoo/lib/repo-data.ts                # ds.header racine SHELL (non posable) — catégorie de racine
scripts/odoo/{check-module,build-assets,check-authoring,build-derivation-report}.ts
                                             # adapter : une racine shell n'exige pas d'inscription snippet
integrations/odoo/config/inputs.lock.json    # repin explicite (header 2.0.0, nav-item 1.2.0, piqueray-logo 1.0.0)
#   ^ LIVRÉ header@2.1.0 (correction datée 2026-08-22) : un bump MINOR post-plan a suivi
#     la MAJOR — root en fill. Clôture §Limites nommées n°4.
integrations/odoo/config/header.authoring.json   # NOUVEAU — verdict par prop/part, occurrences imbriquées comprises
integrations/odoo/config/adaptation-registry.json # +ODOO-022-* (header QWeb, semis, fond sombre, actif)
integrations/odoo/addons/piqueray_ds/views/header.xml        # NOUVEAU — gabarit système + branchement website.menu
integrations/odoo/addons/piqueray_ds/{data|migrations}/…     # semis du menu (mécanisme décidé au spike)
integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css  # fond {color.noir-bleute} (Odoo seulement)
integrations/odoo/addons/piqueray_ds/static/src/css/generated/*      # régénérés (jamais à la main)
integrations/odoo/qa/visual/subjects/header.mts              # NOUVEAU sujet (clip épinglé, Transparent sur fond sombre)
integrations/odoo/qa/scenarios/header-menu.spec.mts          # CRUD menu + save/reopen/public (US2)
integrations/odoo/qa/scenarios/header-visual.mts             # capture du sujet header (US1)
integrations/odoo/qa/scenarios/header-nav.spec.mts           # déroulants + état actif (SC-004/005, US1)
integrations/odoo/qa/scenarios/header-regen.spec.mts         # reçu SC-006 (régénération complète, menu intact)
```

**Structure Decision**: monorepo existant — la phase amont vit dans les répertoires
contrats/schéma/émetteurs du dépôt (mêmes chemins que 015/016), la phase cible dans
`integrations/odoo/` + `scripts/odoo/` (propriété 019, étendus additivement). Aucun nouveau
répertoire de premier niveau. Le QWeb du header est une **zone manuelle comptée** (marqueurs
`ODOO-022-* BEGIN/END` + registre), jamais une sortie générée.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Aucune violation. Deux choix méritent d'être nommés sans être des violations :

| Choix | Pourquoi | Alternative plus simple rejetée parce que |
|---|---|---|
| **Retrait de la variante Solid à la source** (MAJOR 2.0.0 + suppression du master — geste canvas unique dans une feature sinon en lecture) | Décision owner 2026-08-20 : Solid n'a **aucun usage** (audit 020) ; la garder exigeait un canal de schéma nouveau (`propsByProp`) pour conditionner logo/bouton — un canal au service d'une variante morte. La retirer ferme le trou 013 `piqueray-logo-couleur-figee` **à la source** (§VIII) et laisse schéma/émetteurs intouchés | Canvas intouché + acquittement parity (rejeté par l'owner : laisse une divergence vivante contrat↔canvas et reporte le nettoyage) ; garder Solid + `propsByProp` (rejeté : complexité de schéma pour zéro usage) |
| `ds.header` racine **shell** distincte des racines posables | FR-001 : le header n'est pas un bloc droppable ; `check-module` exige aujourd'hui l'inscription snippet de chaque racine | Inscrire le header dans la bibliothèque de blocs violerait FR-001 (et le patron Odoo : le header est un gabarit de layout, pas un snippet) |
