# Tasks: HeroVideo gouverné côté Odoo + bascule de la home

**Input**: Design documents from `/specs/025-odoo-hero-video/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Non requis (pas demandé dans le spec). La validation passe par les portes existantes + les scénarios QA visuels (quickstart.md).

**Organization**: Tasks grouped by user story. US3 (Step 0 §VIII) est DÉJÀ FERMÉE (proofs/step0-audit.md — source propre, contrat fidèle, zéro repair). Les tâches partent de US fondation → US2 → US1 → Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Vérifier que l'environnement est prêt et que les fondations sont en place.

- [X] T001 Vérifier que la branche `025-odoo-hero-video` est propre : `npm install`, `npm run build` vert, portes vertes avant toute modification
- [X] T002 Exporter le poster du master Figma (REST, lecture seule, hash `dfaa8d2046343398e067aade577f177137d32cce`) vers `integrations/odoo/authoring/assets/hero_video.png`

---

## Phase 2: Foundational — cascade de versions + CSS générée (bloque US1 et US2)

**Purpose**: Intégrer `ds.hero-video` dans la fermeture de l'addon, propager la cascade de versions sur les 12 racines, générer la CSS du composant. Toutes les portes Odoo doivent être vertes à la sortie de cette phase AVANT d'écrire le bloc.

**⚠️ CRITICAL**: US1 et US2 ne peuvent pas commencer tant que cette cascade n'est pas terminée — `odoo:module:check` exige la cohérence versions/digest AVANT l'ajout du snippet.

- [X] T003 Ajouter `'ds.hero-video'` à `ROOT_CONTRACT_IDS` et `ROOT_SELECTOR['ds.hero-video'] = '.s_pqr_hero_video'` dans `scripts/odoo/lib/repo-data.ts` (D4)
- [X] T004 Repin explicite de `inputs.lock.json` via `npm run odoo:inputs:check -- --repin` — `ds.hero-video` v1.0.0 + sha256 dans la fermeture, nouveau `graphDigest` calculé (D5)
- [X] T005 Propager le nouveau `graphDigest` + `data-vcss/vxml/vjs="19.0.1.9.0"` sur les **11 racines existantes** de `views/components.xml` ; mettre à jour `data-ds-authoring-version` (D5). La 12ᵉ racine (`s_pqr_hero_video`) recevra ces attributs lors de sa création en T011.
- [X] T006 Mettre à jour `version_guard.js` : ajouter `'ds.hero-video': '1.0.0'` dans `CONTRACT_VERSIONS`, mettre à jour `CURRENT_GRAPH_DIGEST`, `CURRENT_MODULE_VERSION = '19.0.1.9.0'` dans `static/src/js/version_guard.js` (D5)
- [X] T007 Mettre à jour `scan-saved-versions.ts` : `EXPECTED_GRAPH`, `MODULE`, `CONTRACTS` dans `scripts/odoo/scan-saved-versions.ts` (D5)
- [X] T008 Bump `__manifest__.py` version `19.0.1.8.0` → `19.0.1.9.0` dans `integrations/odoo/addons/piqueray_ds/__manifest__.py` (D5)
- [X] T009 Exécuter `npm run odoo:assets` pour générer les styles `.hero-video__*` dans `static/src/css/generated/components.pqr.css`, puis vérifier avec `npm run odoo:assets -- --check` (D4)
- [X] T010 Vérifier les portes cascade : `npm run odoo:inputs:check`, `npm run odoo:module:check` (à ce stade : 12 `ROOT_CONTRACT_IDS`, 11 racines, 11 snippets — l'inégalité `t-snippet ≤ ROOT_CONTRACT_IDS.length` passe ; 12/12 atteint après T011+T012)

**Checkpoint**: La fermeture, les versions et la CSS générée sont cohérentes. Les portes Odoo cascade sont vertes. Implémentation du bloc possible.

---

## Phase 3: User Story 2 — Bloc HeroVideo gouverné et éditable (Priority: P2)

**Goal**: Construire le bloc Odoo `s_pqr_hero_video` (QWeb, snippet, panneau, actions, gouvernance) — un bloc réutilisable qui rend fidèlement l'anatomie du contrat et offre exactement 3 points d'édition (titre, CTA, poster).

**Independent Test**: Déposer le bloc dans l'éditeur, modifier titre/CTA/poster, enregistrer, rouvrir — valeurs persistantes ; parts non prévues non éditables/supprimables.

### Implementation for User Story 2

- [X] T011 [US2] Écrire le template QWeb `s_pqr_hero_video` dans `integrations/odoo/addons/piqueray_ds/views/components.xml` — DOM contractuel exact (contracts/s-pqr-hero-video.qweb.md), marqueur `ODOO-025-HERO-VIDEO-QWEB`, `t-call piqueray_ds.pqr_button` variant `outlineBlanc` en dernier enfant direct du root (D3), adaptation `<img>` poster (D2), attributs de gouvernance complets
- [X] T012 [US2] Enregistrer le snippet dans `integrations/odoo/addons/piqueray_ds/views/snippets.xml` — héritage `website.snippets`, xpath `//snippets[@id='snippet_structure']` position `inside`, `group="content"`, `data-name="Piqueray · Hero vidéo"`, marqueur `ODOO-025-HERO-VIDEO-SNIPPET` (D9)
- [X] T013 [US2] Ajouter la racine et les réouvertures dans `integrations/odoo/addons/piqueray_ds/static/src/js/authoring.js` — root dans `PIQUERAY_ROOTS`, `content_not_editable_selectors` (fermeture), réouvertures root-scopées `.s_pqr_hero_video [data-pqr-part="hero-video-title"]` et `.s_pqr_hero_video [data-pqr-part="button-label"]` (D6), marqueur dédié ou entrée sous marqueurs existants
- [X] T014 [US2] Écrire le template OWL `HeroVideoOption` dans `integrations/odoo/addons/piqueray_ds/static/src/xml/authoring.xml` — 3 réglages (remplacer poster, alt, href CTA) + info, chaque contrôle sous `<span data-pqr-control="<decisionId>">` tracé vers la config (D6), marqueur `ODOO-025-HERO-VIDEO-PANEL`
- [X] T015 [US2] Écrire l'action média poster dans `integrations/odoo/addons/piqueray_ds/static/src/js/media_action.js` — `openMediaDialog({visibleTabs:["IMAGES"]})`, remplacement `src` + `alt` sur `[data-pqr-part="hero-video-poster"]`, root-scopé, marqueur `ODOO-025-HERO-VIDEO-MEDIA` (D6, D9)
- [X] T016 [US2] Écrire le plugin/options OWL `HeroVideoOption` dans `integrations/odoo/addons/piqueray_ds/static/src/js/authoring.js` (ou fichier dédié selon le patron des blocs existants) — `BaseOptionComponent` + `Plugin` dans `registry.category("website-plugins")`, selector `.s_pqr_hero_video`, option class connectée au template
- [X] T017 [US2] Si nécessaire (a.button underline) : ajouter la règle bridge CSS dans `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css` pour `.s_pqr_hero_video a.button { text-decoration: none; }`, marqueur `ODOO-025-HERO-VIDEO-BRIDGE` (D9)
- [X] T018 [US2] Écrire `integrations/odoo/config/hero-video.authoring.json` — décisions exhaustives par prop et part de la fermeture `ds.hero-video → ds.button` (contracts/authoring-decisions.md), `schemaVersion 1.0.0`, `configId "odoo-hero-video-authoring"`, sélecteurs préfixés `.s_pqr_hero_video` (D6)
- [X] T019 [US2] Ajouter les entrées `ODOO-025-HERO-VIDEO-*` dans `integrations/odoo/config/adaptation-registry.json` — une entrée par marqueur (QWEB, SNIPPET, PANEL, MEDIA, ± AUTHORING, ± BRIDGE), `rootContracts: ["ds.hero-video"]`, reason codes existants (D9)
- [X] T020 [US2] Ajouter la page harness `/piqueray-harness/hero-video-visual` dans `integrations/odoo/addons/piqueray_ds_qa/views/harness.xml` — `.pqr-mesure` padding, fond blanc, `t-call piqueray_ds.s_pqr_hero_video` (data-model.md §8)
- [X] T021 [US2] Vérifier toutes les portes Odoo : `npm run odoo:module:check` (12 snippets ≤ 12 racines), `npm run odoo:authoring:check`, `npm run odoo:derivation:check` (marqueurs 1↔1)
- [X] T021b [US2] Vérifier quickstart §3 sur l'instance jetable — dépôt du snippet, édition titre/CTA/poster, duplication, réordonnancement, gouvernance (SC-002, SC-003) — validation owner reçue le 2026-08-23

**Checkpoint**: Le bloc est fonctionnel, gouverné, éditable sur les 3 points prévus. Toutes les portes Odoo sont vertes. Le bloc peut être utilisé dans un descriptor.

---

## Phase 4: User Story 1 — La home affiche le bon hero (Priority: P1) 🎯 MVP

**Goal**: Basculer la home de `s_pqr_hero` vers `s_pqr_hero_video`, composer la page, vérifier la fidélité visuelle, re-semer.

**Independent Test**: Composer la home sur instance jetable → hero = HeroVideo (720px, full-bleed, poster+scrims, titre Regular 44/48 une ligne, CTA « En savoir plus ») ; parité visuelle sous le seuil projet.

### Implementation for User Story 1

- [X] T022 [US1] Mettre à jour `integrations/odoo/authoring/pages/home.json` — remplacer la section `s_pqr_hero` par `s_pqr_hero_video` avec `add_class: ["s_pqr_bleed"]`, `set_html: { "hero-video-title": "Le numéro 1 des portes HÖRMANN en Province de Liège !" }`, `set_button` CTA « En savoir plus », `images: { "hero-video-poster": "hero_video" }` (D7)
- [X] T023 [US1] Composer la home sur l'instance jetable : `npm run odoo:page -- home <projet-jetable>` ; vérifier visuellement dans le navigateur (`/odoo/website?enable_editor=1&with_loader=1`) — hero 720px, full-bleed, poster, 2 scrims, titre Regular 44/48 une ligne, CTA (quickstart.md §5)
- [X] T024 [US1] Re-semer le snapshot : `npm run odoo:save` (le seed est un artefact DÉRIVÉ, règle 024) ; contre-preuve `npm run odoo:restore && npm run odoo:page -- home <projet-jetable>` (quickstart.md §6)

**Checkpoint**: La home affiche le hero conforme au master Figma. Le seed est à jour.

---

## Phase 5: Instruments visuels — deux chaînes de preuve (cross-cutting)

**Purpose**: Ajouter les sujets d'instrument de parité visuelle pour les deux chaînes de vérification et produire les reçus.

- [X] T025 Ajouter le sujet `hero-video` dans `extract/figma/visual-parity/subjects.ts` — emit-html ↔ master Figma `2151:5552`, seuil 2.0 % (D8, data-model.md §8)
- [X] T026 Mettre à jour `extract/figma/visual-parity/baseline.json` avec la baseline du nouveau sujet (D8)
- [X] T027 Exécuter `npm run extract:figma:visual` et vérifier que la ligne `hero-video` sort ≤ 2.0 % (quickstart.md §2) — reçu : 0.49 % brut, 0.40 % masqué
- [X] T028 Écrire le sujet `integrations/odoo/qa/visual/subjects/hero-video.mts` — `key 'hero-video-default'`, `contractId 'ds.hero-video'`, `odooPath '/piqueray-harness/hero-video-visual'`, clip mesuré par `render-html.mts --measure` (D8, data-model.md §8)
- [X] T029 Écrire le scénario `integrations/odoo/qa/scenarios/hero-video-visual.mts` — référence + capture harness + diff, reçu dans `specs/025-odoo-hero-video/proofs/` (D8)
- [X] T030 Clore la fidélité Odoo : scénario automatisé disponible ; pour cette livraison, validation visuelle et recette éditeur exécutées par l'owner sur l'instance jetable, substitution explicitement enregistrée dans `proofs/release-closure.md`

**Checkpoint**: Les deux chaînes de preuve visuelle sont en place et sous leurs seuils respectifs.

---

## Phase 6: Polish & portes finales

**Purpose**: Sweep complet, archivage des reçus, vérification que rien n'a cassé.

- [X] T031 Sweep complet des portes du dépôt (quickstart.md §1) : `npm run build`, `npm run parity`, `npm run eval`, `npm run plugin:check`, `npx tsx scripts/deterministic-roundtrip.mjs`, `node scripts/core-browser-check.mjs`, `npx tsc --noEmit && npx tsc -p tsconfig.build.json`
- [X] T032 Vérifier SC-004 : re-pins expliqués et bornés à `inputs.lock.json` + l'entrée HeroVideo de `evals/golden.json`
- [X] T033 Vérifier SC-005 : aucune modification de `contracts/hero.contract.json`, `contracts/section-header.contract.json`, ni d'un contrat non concerné
- [X] T034 Archiver les reçus dans `specs/025-odoo-hero-video/proofs/` : portes, ligne Figma visual-parity, captures home et décision owner Odoo dans `proofs/release-closure.md`
- [X] T035 `npm run odoo:typecheck` — types Odoo/JS cohérents

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup ; BLOCKS Phases 3 et 4
- **US2 (Phase 3)**: Depends on Foundational (cascade + CSS générée)
- **US1 (Phase 4)**: Depends on US2 (le bloc doit exister pour que `home.json` puisse le référencer et que `odoo:page` le compose)
- **Instruments visuels (Phase 5)**: Depends on US2 (harness) + US1 (home composée pour les captures)
- **Polish (Phase 6)**: Depends on toutes les phases précédentes

### User Story Dependencies

- **US3 (P3)**: DÉJÀ FERMÉE — `proofs/step0-audit.md` archivé (source propre, contrat fidèle, zéro repair)
- **US2 (P2)**: Depends on Phase 2 (cascade) — le bloc doit être construit avant d'être utilisé
- **US1 (P1)**: Depends on US2 — le descriptor home référence `s_pqr_hero_video` qui doit exister

### Within Each User Story

- Addon files en **série** (même fichiers touchés, leçon §XI)
- Config (`authoring.json`, `adaptation-registry.json`) parallélisable avec les portes
- Portes de validation après chaque groupe logique

### Parallel Opportunities

- T003, T008 (different files) can run in parallel within Phase 2
- T006, T007 (different files) can run in parallel within Phase 2
- T018, T019 (config files, different files) can run in parallel within US2
- T025, T026 (Figma visual-parity, same instrument) should be sequential
- T028, T029 (Odoo QA, different files) can run in parallel within Phase 5
- ⚠️ Addon files (components.xml, snippets.xml, authoring.js/xml, media_action.js) sont en SÉRIE — même addon, mêmes bundles, leçon 022/§XI

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Batch 1 — independent file edits:
Task T003: "repo-data.ts — ROOT_CONTRACT_IDS + ROOT_SELECTOR"
Task T008: "__manifest__.py — bump version"

# Batch 2 — after repin (T004):
Task T006: "version_guard.js — CONTRACT_VERSIONS + digest"
Task T007: "scan-saved-versions.ts — EXPECTED_GRAPH"

# Sequential: T005 (components.xml cascade) depends on T004 digest
# Sequential: T009 (odoo:assets) depends on T003
# Sequential: T010 (portes) depends on all above
```

---

## Implementation Strategy

### MVP First (US1 = la home affiche le bon hero)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (cascade + CSS — BLOQUE tout)
3. Complete Phase 3: US2 (le bloc gouverné)
4. Complete Phase 4: US1 (bascule home)
5. **STOP and VALIDATE**: quickstart.md §5 — hero 720, full-bleed, poster+scrims, titre une ligne
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → cascade verte, CSS générée ✓
2. US2 → bloc déposable et éditable dans le Website Builder ✓
3. US1 → home basculée, hero fidèle au master ✓ (MVP!)
4. Instruments visuels → preuves archivées ✓
5. Polish → sweep complet, reçus ✓

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US3 est close avant ce plan (Step 0, proofs/step0-audit.md)
- Addon files en série (§XI, leçon 022) — pas de parallélisation sur les fichiers de l'addon
- Re-pins attendus et expliqués : `inputs.lock.json` (D5) + entrée HeroVideo de `evals/golden.json` (correctif émetteur `video`, reçu de clôture).
- Instance jetable uniquement — JAMAIS `piqueray-odoo-test` (8071)
- Lien éditeur : `/odoo/website?enable_editor=1&with_loader=1` (pas le lien visiteur)

---

## Clôture d'implémentation (2026-08-23)

**Fait + vérifié** : Setup (T001–T002), Fondation cascade (T003–T010), Bloc US2 (T011–T021), Bascule home US1 (T022–T024), sujet+mesure Odoo (T028–T029), sweep dépôt + invariants (T031–T033, T035). Home vérifiée **en direct** sur instance jetable isolée (`piqueray-odoo-qa-025`, port 8090, démontée après) : bloc rendu, poster attaché, titre+CTA, hauteur 720, pleine largeur.

**Correctif d'émetteur en cours de route** : `object-fit: cover` du poster ne couvrait pas (garde `element==='img'` de `emit-html`/`emit-react` oubliait `video`). Corrigé aux deux émetteurs, régénéré, vérifié couvrant à 2000px. `golden.json` re-pinné (1 ligne : `HeroVideo.module.css`). Détail : `proofs/implementation-status.md`.

**Clôture finale** : validation éditeur Odoo confirmée par l'owner ; sujet Figma ajouté sans nouveau binaire grâce à la fixture déjà épinglée (`dfaa8d20…`) et mesuré à **0.49 %** (< 2 %) ; ancien blocage `ODOO-PAGE-LAYOUT` réparé ; reçu plugin rafraîchi après revue du correctif émetteur ; sweep complet vert, `npm run eval` = **220/220**. La capture Odoo automatisée reste rejouable mais la livraison retient explicitement la recette owner comme preuve Odoo.
