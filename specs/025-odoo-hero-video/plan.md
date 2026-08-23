# Implementation Plan: HeroVideo gouverné côté Odoo + bascule de la home

**Branch**: `025-odoo-hero-video` | **Date**: 2026-08-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/025-odoo-hero-video/spec.md`

## Summary

La home Odoo compose `s_pqr_hero` (`ds.hero`) alors que le design Figma de l'Accueil est **HeroVideo** (`ds.hero-video`, master `2151:5552`, instance home `2170:6351`). Le contrat `ds.hero-video` v1.0.0 et ses surfaces React/HTML **existent déjà** ; les tokens Odoo (`--pqr-size-hero-video-root: 720px`, titre 44/48 Regular) sont **déjà générés** dans l'addon. Le Step 0 §VIII est **déjà exécuté et concluant** (`proofs/step0-audit.md` : source propre, contrat prouvé fidèle, zéro repair).

Le chantier restant est donc exactement la **projection Odoo** : construire le bloc gouverné `s_pqr_hero_video` selon le patron de vague établi (spec 022, phase Foundational + story), en écrivant **à la main** la zone manuelle comptée (QWeb + snippet + panneau + actions média, marqueurs `ODOO-025-HERO-VIDEO-*` + registre), en laissant la CSS du composant arriver **générée** (`ds.hero-video` ajouté à `ROOT_CONTRACT_IDS` → `npm run odoo:assets` émet `.hero-video__*` dans `components.pqr.css`), puis **basculer `home.json`** de `s_pqr_hero` vers `s_pqr_hero_video` et re-semer. La preuve visuelle passe par les deux chaînes existantes : `emit-html ↔ master Figma` (instrument `extract/figma/visual-parity`, seuil projet 2.0 % — sujet `hero-video` à ajouter, il n'existe pas) et `emit-html ↔ capture Odoo` (instrument `integrations/odoo/qa/visual`, cible 0 %, résidu déclaré avec sa raison).

## Technical Context

**Language/Version**: Python 3 / XML QWeb / JavaScript (addon Odoo 19 écrit à la main, zone manuelle comptée) ; TypeScript (pin dépôt `typescript@^6`), Node ≥ 20, ESM via `tsx` pour les instruments et portes existants.

**Primary Dependencies**: Odoo 19 épinglé (`odoo:19.0-20260803` + `postgres:15`, compose QA jetable) ; addon `integrations/odoo/addons/piqueray_ds/` (v `19.0.1.8.0` → bump) + `piqueray_ds_qa` (harness) ; `core/emit-html.ts` (référence visuelle + source de `components.pqr.css` via `scripts/odoo/build-assets.ts`) ; `playwright-core` + `pixelmatch`/`pngjs` (instruments visuels existants) ; Figma REST en **LECTURE SEULE** (`FIGMA_TOKEN` — export du poster `dfaa8d20…`) ; **AUCUNE mutation canvas** (le Step 0 a conclu « zéro repair »).

**Storage**: JSON/XML/CSS sur disque — ÉDITÉ (manuel compté) : `views/{components,snippets}.xml`, `static/src/{js,xml}/*`, `odoo-bridge.css` (si nécessaire), `__manifest__.py` ; ÉDITÉ (décision) : `integrations/odoo/config/{hero-video.authoring.json (NOUVEAU), adaptation-registry.json (+entrées), inputs.lock.json (repin explicite)}` ; ÉDITÉ (contenu) : `integrations/odoo/authoring/pages/home.json`, `integrations/odoo/authoring/assets/hero_video.png` (NOUVEAU) ; GÉNÉRÉ (jamais à la main) : `static/src/css/generated/components.pqr.css`, `derivation-report.json` ; INSTRUMENTS : `integrations/odoo/qa/visual/subjects/hero-video.mts` (NOUVEAU), `piqueray_ds_qa/views/harness.xml` (+1 page), `extract/figma/visual-parity/{subjects.ts,baseline.json}` (+1 sujet) ; **AUCUN** `contracts/*.contract.json`, **AUCUN** `tokens/*.tokens.json`, **AUCUN** `src/`, **AUCUN** schéma touché (FR-007, SC-005).

**Testing**: portes du dépôt (`npm run build`, `parity`, `eval`, `plugin:check`, roundtrip, core-browser-check, 2× tsc) + portes Odoo (`odoo:module:check`, `odoo:inputs:check`, `odoo:authoring:check`, `odoo:derivation:check`, `odoo:assets -- --check`, `odoo:typecheck`) + scénarios QA Playwright sur instance Docker **jetable** (défaut `piqueray-odoo-qa`) + parité visuelle deux chaînes.

**Target Platform**: instance Odoo 19 Docker jetable (QA) ; le livrable est l'addon + le descripteur, pas une instance.

**Project Type**: intégration Odoo d'un design system gouverné par contrats (bloc n°12 de l'addon, selon le patron de vague 019/022).

**Performance Goals**: N/A (bloc statique ; la seule cible chiffrée est la parité visuelle).

**Constraints**: parité visuelle `emit-html ↔ Figma` sous **2.0 %** (`extract/figma/visual-parity/tolerance.ts`) ; parité `Odoo ↔ emit-html` cible **0.0000 %**, tout résidu chiffré + raison déclarée (patron 019) ; gouvernance éditeur : seules parts éditables = titre, libellé CTA, image poster ; **jamais** `piqueray-odoo-test` (8071) ; bloc `ODOO-PAGE-DEBUG` (outlines DX) actif — n'affecte pas le harness `.pqr-mesure` (hors `.o_pqr_page`) mais toute capture pleine page doit le nommer dans son reçu.

**Scale/Scope**: 1 bloc QWeb nouveau + 1 config d'authoring nouvelle + bascule d'1 descripteur ; cascade de versions sur les 11 racines existantes (digest + `data-v*`) ; 2 sujets d'instrument nouveaux ; ~4–6 entrées de registre d'adaptation.

## Constitution Check

*GATE: passed pre-Phase 0; re-checked post-Phase 1 — see end of section.* (Constitution v1.2.0)

- [x] **I. Determinism** — aucun AI dans la génération : la CSS du bloc arrive par `odoo:assets` (double build comparé octet à octet à chaque exécution) ; la zone QWeb/JS est manuelle comptée (frontière 4 du modèle Odoo), comme les 11 blocs existants. Le poster est exporté par REST, pas régénéré.
- [x] **II. Claims Rule** — aucune nouvelle claim de capacité : le bloc est une projection de plus du patron déjà éprouvé (019/022) ; la mise à jour du `authoring/README.md` liste un bloc, elle ne revendique pas une capacité. Aucun nouvel eval requis ; la suite doit rester au vert.
- [x] **III. Contract is SSoT** — `ds.hero-video` v1.0.0 n'est PAS modifié ; le bloc le projette (anatomie, classes BEM, tokens). Aucune side-sync : la seule adaptation de surface (`<img>` poster au lieu de `<video>`) est une décision de projection documentée au registre (research.md D2), pas un contournement du contrat — le contrat lui-même déclare le poster comme surface déterministe.
- [x] **IV. Generated never hand-edited** — `components.pqr.css`, `tokens.pqr.css`, `derivation-report.json` ne sont touchés que par leurs générateurs ; `odoo:assets -- --check` (tampered/missing/orphan) le prouve.
- [x] **V. Honesty** — résidu visuel Odoo déclaré chiffré avec raison (`plancherDeTolerance` + `raisonDuPlancher`) ; outlines DX nommées dans tout reçu de capture pleine page ; l'absence de vidéo est nommée comme comportement voulu (poster déterministe), pas passée sous silence.
- [x] **VI. Additive evolution** — zéro changement de schéma ; zéro bump de contrat (FR-007/SC-005) ; bump mineur du manifest addon (`19.0.1.8.0` → `19.0.1.9.0`).
- [x] **VII. Engine integrity** — `core/` intouché ; pas de mock concerné.
- [x] **VIII. Source cleanliness** — **Step 0 déjà exécuté et archivé** (`proofs/step0-audit.md`, 2026-08-23) : master `2151:5552` propre (FILL, variables bound, image non purgée, poids unique, 0 variante), contrat prouvé FIDÈLE, **zéro repair**. US3 satisfaite avant le plan.
- [x] **IX. Docs-first** — docs consultées avant dérivation : `integrations/odoo/authoring/README.md` (règles bloc + Layout de page), `integrations/odoo/README.md` (4 frontières), `specs/022-odoo-production-wave-b/tasks.md` (patron canonique d'ajout de bloc), `docs/handoff/09-testing-and-gates.md`. Auggie MCP indisponible dans cette session — lecture directe des docs, notée ici plutôt que tue.
- [x] **X. Before-capture** — N/A : aucune mutation canvas Figma (lecture seule de bout en bout, conclusion du Step 0).
- [x] **XI. Multi-writer bridge** — N/A côté canvas. Côté addon : leçon 022 reprise — toutes les éditions touchent les mêmes fichiers d'addon, donc implémentation **en série**, pas de parallélisation.

**Post-Phase 1 re-check (2026-08-23)** : aucun des artefacts de design (research.md, data-model.md, contracts/, quickstart.md) n'introduit de violation — pas de nouveau schéma, pas d'édition de généré, pas de mutation canvas, adaptation `<img>` poster tracée au registre. **PASS.**

## Project Structure

### Documentation (this feature)

```text
specs/025-odoo-hero-video/
├── plan.md              # This file
├── spec.md              # Feature spec (done)
├── research.md          # Phase 0 output — décisions D1–D9
├── data-model.md        # Phase 1 output — entités & mapping des parts
├── quickstart.md        # Phase 1 output — guide de validation exécutable
├── contracts/
│   ├── s-pqr-hero-video.qweb.md      # Contrat de projection du bloc (DOM, parts, gouvernance)
│   └── authoring-decisions.md        # Décisions de la config hero-video.authoring.json
├── checklists/requirements.md        # (done, tout vert)
├── proofs/
│   └── step0-audit.md   # Step 0 §VIII (done — source propre, contrat fidèle)
└── tasks.md             # Phase 2 (/speckit-tasks — PAS créé par ce plan)
```

### Source Code (repository root)

```text
integrations/odoo/
├── addons/piqueray_ds/
│   ├── __manifest__.py                       # bump 19.0.1.8.0 → 19.0.1.9.0
│   ├── views/components.xml                  # + bloc ODOO-025-HERO-VIDEO-QWEB ; cascade data-v*/digest sur les 11 racines
│   ├── views/snippets.xml                    # + ODOO-025-HERO-VIDEO-SNIPPET (t-snippet, group="content")
│   └── static/src/
│       ├── js/authoring.js                   # + racine, parts éditables, option class, builder_options/actions
│       ├── js/media_action.js                # + ODOO-025-HERO-VIDEO-MEDIA (remplacement poster + alt)
│       ├── js/version_guard.js               # cascade versions (CONTRACT_VERSIONS, digest, module)
│       ├── xml/authoring.xml                 # + ODOO-025-HERO-VIDEO-PANEL (template OWL HeroVideoOption)
│       ├── css/odoo-bridge.css               # + ODOO-025-HERO-VIDEO-BRIDGE si nécessaire (a.button underline)
│       └── css/generated/components.pqr.css  # GÉNÉRÉ — reçoit .hero-video__* via odoo:assets
├── addons/piqueray_ds_qa/views/harness.xml   # + page /piqueray-harness/hero-video-visual
├── config/
│   ├── hero-video.authoring.json             # NOUVEAU — décisions par prop/part (fermeture ds.hero-video + ds.button)
│   ├── adaptation-registry.json              # + entrées ODOO-025-HERO-VIDEO-*
│   └── inputs.lock.json                      # repin explicite (fermeture calculée + graphDigest)
├── authoring/
│   ├── pages/home.json                       # bascule s_pqr_hero → s_pqr_hero_video
│   └── assets/hero_video.png                 # NOUVEAU — poster exporté du master (REST, lecture)
└── qa/
    ├── visual/subjects/hero-video.mts        # NOUVEAU sujet (clip épinglé)
    └── scenarios/hero-video-visual.mts       # NOUVEAU scénario + reçu

scripts/odoo/
├── lib/repo-data.ts                          # + 'ds.hero-video' dans ROOT_CONTRACT_IDS + ROOT_SELECTOR
└── scan-saved-versions.ts                    # cascade versions

extract/figma/visual-parity/
├── subjects.ts                               # + sujet hero-video (emit-html ↔ master Figma)
└── baseline.json                             # baseline du nouveau sujet
```

**Structure Decision**: intégration dans l'arborescence Odoo existante selon les 4 frontières (`integrations/odoo/README.md`) — canonique lu jamais copié, décision dans `config/`, généré par `odoo:assets`, manuel compté sous marqueurs `ODOO-025-HERO-VIDEO-*` appariés 1↔1 au registre. Aucun nouveau répertoire hors instruments (2 sujets).

## Complexity Tracking

Aucune violation constitutionnelle à justifier — tableau vide.
