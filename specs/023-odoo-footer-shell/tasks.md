# Tasks: Pied de page Piqueray dans Odoo (footer shell)

**Input**: Design documents from `/specs/023-odoo-footer-shell/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Scénarios QA Playwright sur l'instance jetable (pattern 022) — inclus car exigés
par les Success Criteria (SC-001…SC-006).

**Organization**: Tasks grouped by user story. US1 and US2 are both P1 but US2 depends on
the deployed template from US1. US3 (P2) is independent once the instance is deployed.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Worktree self-sufficiency + QA infrastructure

- [X] T001 [Worktree gates — F1] Make this worktree self-sufficient (Constitution,
      Development Workflow: Worktree Gates): run `npm install` inside the worktree,
      then `npx playwright install chromium` (two checks drive real Chromium). The
      FULL gate sweep — including `npm run eval` — runs in this worktree at every
      checkpoint and at closure. Run the constitutional sweep once to confirm a green
      baseline BEFORE any changes.
- [X] T002 Start Docker QA instance (images épinglées `odoo:19.0-20260803` +
      `postgres:15`): `cp integrations/odoo/qa/.env.example integrations/odoo/qa/.env`
      then `docker compose -f integrations/odoo/qa/compose.yaml --env-file
      integrations/odoo/qa/.env up -d`

---

## Phase 2: Foundational (Gate humaine + Spikes — blocks all user stories)

**Purpose**: Validate the editability perimeter with the owner AND prove the three
uncertain Odoo mechanisms BEFORE any QWeb is written.

**⚠️ CRITICAL**: No implementation can begin until the gate is validated AND the spikes
are receipted. If S2 changes a verdict, the gate returns to the owner.

- [X] T003 Gate humaine BLOQUANTE — obtain explicit owner validation of
      `specs/023-odoo-footer-shell/contracts/verdicts-editabilite.md` (100 % of
      props/parts covered). The validated table governs all subsequent authoring
      decisions. Point d'attention : verdicts CTA `fixé par composition` vs précédent
      022 `not-editable` (research D4) — owner tranches.
- [X] T004 [P] Spike S1 — zone footer de `website.layout` 19 : ancrage xpath exact,
      nom du template natif à désactiver, preuve que le gabarit hérité échappe au
      mécanisme COW. Reçu dans `specs/023-odoo-footer-shell/proofs/spike-footer.json`
      (sources fichier:ligne du code Odoo 19).
- [X] T005 [P] Spike S2 — persistance du texte libre : hôte du champ (candidat :
      `t-field` inline sur un modèle), chaîne complète edit→save→reopen→public→
      **update du module**→contenu intact. Reçu dans
      `specs/023-odoo-footer-shell/proofs/spike-persistance.json`. Si le mécanisme
      change un verdict (ex. copyright éditable seulement par panneau) → **retour à
      T003** avant le QWeb.
- [X] T006 [P] Spike S3 — champs sociaux natifs `website.social_facebook` /
      `website.social_instagram` sur Odoo 19 épinglé : présence, nom exact, édition
      via Réglages du site, comportement si champ vide. Reçu dans
      `specs/023-odoo-footer-shell/proofs/spike-social.json`. Repli si absents :
      `ir.config_parameter` dédié.

**Checkpoint**: Gate validée + 3 spikes receipted. Si S2 a changé un verdict → retour à
T003 (la table modifiée retourne à l'owner). Aucun QWeb avant ce checkpoint.

---

## Phase 3: User Story 1 — Voir le pied de page au design exact (Priority: P1) 🎯 MVP

**Goal**: Le visiteur voit le footer Piqueray complet (logo blanc, 3 colonnes, icônes
réseaux, CTA, séparateur, copyright) au design gouverné exact sur chaque page du site.

**Independent Test**: Charger plusieurs pages de l'instance, comparer le footer rendu à la
référence Figma (node 2120:4785) sous la tolérance de référence du projet (SC-001).

### Projection config (US1)

- [X] T007 [P] [US1] Add `'ds.footer'` to `SHELL_CONTRACT_IDS` in
      `scripts/odoo/lib/repo-data.ts` (catégorie shell 022 existante — vérifier
      qu'aucun script ne suppose un shell unique)
- [X] T008 [P] [US1] Repin `integrations/odoo/config/inputs.lock.json` : +3 entries
      (ds.footer 1.1.0, ds.footer-column 1.1.0, ds.copyright 1.0.0 — chemin +
      version + SHA-256). Valider : `npm run odoo:inputs:check`
- [X] T009 [US1] Regenerate CSS assets — `npm run odoo:assets` (fermeture élargie :
      + footer, footer-column, copyright) in
      `integrations/odoo/addons/piqueray_ds/static/src/css/generated/`. Valider :
      `npm run odoo:assets -- --check` (depends on T007 + T008)
- [X] T010 [P] [US1] Transcribe validated verdicts table into
      `integrations/odoo/config/footer.authoring.json` (schéma 019, un verdict par
      adresse canonique ; si un `mechanism` nouveau est requis — `native-settings` /
      `inline-field` — étendre l'enum ADDITIVEMENT, geste 022/`native-menu`).
      Valider : `npm run odoo:authoring:check`
- [X] T011 [P] [US1] Register adaptations `ODOO-023-FOOTER-QWEB`,
      `ODOO-023-CONTENUS-SEED`, `ODOO-023-LIENS-SOCIAUX` (+ `ODOO-023-FOND-LARGEUR`
      seulement si la mesure visuelle l'exige) in
      `integrations/odoo/config/adaptation-registry.json`

### QWeb + activation (US1)

- [X] T012 [US1] Write QWeb footer in
      `integrations/odoo/addons/piqueray_ds/views/footer.xml` : gabarit standalone
      `piqueray_ds.footer_bar` (composition complète de `ds.footer` — classes de
      `components.pqr.css` + `data-pqr-part` + `data-ds-contract="ds.footer"`, SVG
      gouvernés inlinés pour logo/icônes, CTA via
      `t-call="piqueray_ds.pqr_button"` link_href='/contactez-nous'
      variant='outlineBlanc', textes rendus depuis la donnée per spike S2 result) +
      gabarit d'héritage `piqueray_ds.template_footer_piqueray` (xpath per spike S1,
      `active="False"`). Zone comptée `ODOO-023-FOOTER-QWEB` BEGIN/END.
      (Depends on T004/S1, T005/S2, T009)
- [X] T013 [US1] Implement content seeding (3 column texts from contract
      `repeat.sample` + copyright default, idempotent guard via
      `ir.config_parameter`) in
      `integrations/odoo/addons/piqueray_ds/hooks.py` or `migrations/`. Zone comptée
      `ODOO-023-CONTENUS-SEED`. (Depends on T005/S2)
- [X] T014 [US1] Wire social link URLs in footer_bar — enveloppes `<a>` autour des
      icônes Facebook/Instagram, lecture des champs natifs `website.social_*` (or
      `ir.config_parameter` per spike S3 fallback). Zone comptée
      `ODOO-023-LIENS-SOCIAUX`. Seed default URLs in T013 if using
      `ir.config_parameter`. (Depends on T006/S3, T012)
- [X] T015 [US1] Bump `__manifest__.py` version + write activation migration
      (activate `template_footer_piqueray`, deactivate native footer — pattern
      `template_header_piqueray` de 022) in
      `integrations/odoo/addons/piqueray_ds/__manifest__.py` +
      `integrations/odoo/addons/piqueray_ds/migrations/`. (Depends on T012, T013)

### Verification (US1)

- [X] T016 [US1] Run Odoo integration gates on deployed instance:
      `npm run odoo:inputs:check && npm run odoo:authoring:check &&
      npm run odoo:assets -- --check && npm run odoo:module:check &&
      npm run odoo:derivation:check && npm run odoo:typecheck`.
      (Depends on T007–T015)
- [X] T017 [P] [US1] Create visual subject
      `integrations/odoo/qa/visual/subjects/footer.mts` (clip épinglé du footer,
      référence `emitHtml` de `ds.footer` — pattern 022 header subject)
- [X] T018 [US1] Create + run footer-visual scenario
      `integrations/odoo/qa/scenarios/footer-visual.mts` — capture du sujet, mesure
      vs référence sous la tolérance du projet (SC-001). Reçu dans
      `specs/023-odoo-footer-shell/proofs/footer-visual.json`.
      (Depends on T016, T017)

**Checkpoint**: Le footer rend le design exact sur l'instance — US1 complete et testable
indépendamment. Si la mesure visuelle exige une adaptation fond/largeur (root 1728px,
Background 1728×459) → créer la zone `ODOO-023-FOND-LARGEUR` et re-mesurer.

---

## Phase 4: User Story 2 — Modifier les contenus textuels autorisés (Priority: P1)

**Goal**: Le rédacteur modifie les textes autorisés (3 colonnes + copyright) via l'éditeur
Odoo sans toucher à la structure ni au design ; les éléments non éditables sont bloqués.

**Independent Test**: Dans l'éditeur Odoo, modifier un texte au verdict « éditable »,
enregistrer, rouvrir : le contenu est conservé et le design reste intact.

- [X] T019 [US2] Verify authoring enforcement on deployed instance — non-editable
      elements blocked per `footer.authoring.json` verdicts, panneaux natifs
      indésirables retirés (FR-007), `rootActions` interdites (move/duplicate/remove/
      save-as-custom : forbidden, reasonCode `shell-systeme`). If enforcement needs
      additional JS plugin code, add it in the addon per pattern 022. (Depends on
      T010, T016)
- [X] T020 [US2] Create + run footer-edit.spec.mts
      `integrations/odoo/qa/scenarios/footer-edit.spec.mts` — edit a P9 text
      (column) + P11 text (copyright) → save → reopen editor → public page :
      content conserved + design intact (SC-002/SC-003). Reçu dans
      `specs/023-odoo-footer-shell/proofs/footer-edit.json`. (Depends on T019)

**Checkpoint**: US2 complete — rédacteur peut modifier les textes autorisés, structure
protégée.

---

## Phase 5: User Story 3 — Garder l'apparence gouvernée par le contrat (Priority: P2)

**Goal**: L'apparence du footer reste gouvernée par les contrats, régénérable par
projection, et les textes du rédacteur survivent aux mises à jour.

**Independent Test**: Changer un token dans la CSS régénérée → le footer reflète le
changement à la requête suivante sans altérer le contenu du rédacteur.

- [X] T021 [US3] Create + run footer-update.spec.mts
      `integrations/odoo/qa/scenarios/footer-update.spec.mts` — edit a text, run
      `-u piqueray_ds`, verify content intact (SC-004/FR-014). Reçu dans
      `specs/023-odoo-footer-shell/proofs/footer-update.json`.
- [X] T022 [P] [US3] Create + run footer-regen.spec.mts
      `integrations/odoo/qa/scenarios/footer-regen.spec.mts` — variation de token
      dans `components.pqr.css` régénérée → visible requête suivante, textes intacts
      (SC-006). Reçu dans
      `specs/023-odoo-footer-shell/proofs/footer-regen.json`.
- [X] T023 [P] [US3] Create + run footer-pages.spec.mts
      `integrations/odoo/qa/scenarios/footer-pages.spec.mts` — footer présent sur
      chaque page ; header shell + 10 sections de contenu intacts (SC-005/FR-008).
      Reçu dans `specs/023-odoo-footer-shell/proofs/footer-pages.json`.

**Checkpoint**: US3 complete — gouvernance prouvée : CSS se propage, contenu survit aux
mises à jour, footer coexiste avec le header et les sections.

---

## Phase 6: Polish & Clôture

**Purpose**: Full sweep + closure report

- [X] T024 Full constitutional gate sweep + Odoo suite in worktree :
      `npm run build && npm run parity && npm run eval && npm run plugin:check
      && npx tsx scripts/deterministic-roundtrip.mjs
      && node scripts/core-browser-check.mjs
      && npx tsc --noEmit && npx tsc -p tsconfig.build.json` + suite Odoo
      (`odoo:inputs:check`, `odoo:authoring:check`, `odoo:assets -- --check`,
      `odoo:module:check`, `odoo:derivation:check`, `odoo:typecheck`,
      `odoo:visual:selftest -- --strict`). Attendu : vert **sans aucun re-pin**.
- [X] T025 Write `specs/023-odoo-footer-shell/proofs/RAPPORT-CLOTURE.md` — ce qui
      tient (SC-001…SC-006, reçus classés), ce qui reste ouvert (responsive mobile
      différé, icônes fixées, sémantique `<footer>` hôte layout, portes rouges
      pré-existantes citées telles quelles), limites nommées.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T002 (Docker instance for spikes). T003 (gate)
  is independent of spikes but spikes may send back to T003. **BLOCKS all user stories.**
- **US1 (Phase 3)**: Depends on Phase 2 completion (gate validated + spikes receipted)
- **US2 (Phase 4)**: Depends on US1 deployed instance (T016)
- **US3 (Phase 5)**: Depends on US1 deployed instance (T016) ; T021 should run before
  T022/T023 (module update modifies instance state)
- **Polish (Phase 6)**: Depends on all desired user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependency on other stories
- **US2 (P1)**: Depends on US1 deployed instance (the template must be rendering to test
  editing) — NOT parallelizable with US1
- **US3 (P2)**: Depends on US1 deployed instance — can overlap with US2 (independent
  scenarios on the same instance ; T021 first, T022/T023 parallel after)

### Within US1

- T007 (repo-data) and T008 (lock) can run in parallel
- T009 (CSS assets) depends on T007 + T008
- T010 (authoring.json) and T011 (adaptation-registry) can run in parallel with T007–T009
- T012 (QWeb template) depends on T009 (CSS classes) + spikes S1/S2
- T013 (seeding) depends on spike S2
- T014 (social links) depends on T012 + spike S3
- T015 (manifest/migration) depends on T012 + T013
- T016 (Odoo gates) depends on all T007–T015
- T017 (visual subject) can run in parallel with T007–T016 (file creation only)
- T018 (visual proof) depends on T016 + T017

### Parallel Opportunities

```text
# Phase 2 — three spikes in parallel
T004 (S1), T005 (S2), T006 (S3)

# Phase 3 — config tasks in parallel
T007 (repo-data), T008 (lock)           # parallel pair
T010 (authoring), T011 (registry)       # parallel pair, independent of T007–T009
T017 (visual subject)                   # parallel with all config/template work

# Phase 5 — independent QA scenarios
T022 (regen), T023 (pages)              # parallel after T021
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (worktree + Docker)
2. Complete Phase 2: Foundational (gate + spikes) — **CRITICAL GATE**
3. Complete Phase 3: US1 — footer renders at design exact
4. **STOP and VALIDATE**: Visual proof (SC-001) passes
5. The footer is visible on every page — shell complete even without editing

### Incremental Delivery

1. Setup + Foundational → gate validated, mechanisms proven
2. Add US1 → footer renders correctly → visual proof (MVP!)
3. Add US2 → editing works → edit proof
4. Add US3 → governance proven → update/regen/pages proofs
5. Each story adds verified value without breaking previous stories

### Re-pin Surface

**Zero.** No contract, token, schema, or emitter modified → no re-pin of golden.json,
engine.receipt.json, catalog, or polaris examples. The only repin is
`integrations/odoo/config/inputs.lock.json` (+3 entries). Any gate that turns red signals
a scope error, not a re-pin to do.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Gate humaine (T003) is BLOCKING — no implementation before explicit owner validation
- Three spikes (T004–T006) are BLOCKING before QWeb — they prove the mechanisms
- If S2 changes a verdict → return to T003 before any QWeb
- The template (T012) is a single zone manuelle comptée `ODOO-023-FOOTER-QWEB` — never
  generated output
- Content seeding (T013) is idempotent — never re-seeded, never overwritten by update
- Stop at any checkpoint to validate the story independently
- Commit after each task or logical group
- 2 portes Odoo rouges pré-existantes : if still red at startup, cited as-is — never
  repaired in this feature, never counted as caused by it
