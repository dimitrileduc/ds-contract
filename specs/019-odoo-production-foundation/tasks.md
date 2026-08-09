# Tasks: Fondation Odoo de production

**Input**: Design documents from `specs/019-odoo-production-foundation/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`

**Tests**: La spec exige explicitement des contrôles nommés et des preuves éditeur, persistance,
sécurité et pixels. Les tâches de test précèdent donc l'implémentation de chaque story. Les trois cas
hermétiques vivent dans `npm run eval`; les gestes Odoo/Chromium ont un `scenarioId` stable et un
reçu daté, sans être présentés comme des evals.

**Organization**: Les phases sont groupées par user story. Les deux stories P1 restent
indépendamment testables, mais `US2` passe avant `US1` car le repeat, l'image et l'état vide portent
le risque technique de la fondation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: exécutable en parallèle dans des fichiers distincts, sans dépendance non terminée
- **[Story]**: rattachement à `US1`, `US2`, `US3` ou `US4`
- Chaque tâche nomme le ou les chemins exacts qu'elle doit produire ou modifier

---

## Phase 1: Setup — produit et environnement séparés du POC

**Purpose**: Rendre le worktree autonome et poser le squelette de production sans promouvoir les
fichiers de 018 comme produit.

- [X] T001 Rendre ce worktree autonome conformément à F1 en exécutant `npm install` puis `npx playwright install chromium` depuis `/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/soapy-duckling`, et consigner versions/commandes sans claim de résultat dans `specs/019-odoo-production-foundation/proofs/setup.md`
- [X] T002 Créer le squelette de l'addon de production avec dépendance `website`, version Odoo `19.0.x.y.z`, bundles frontend/builder et uniquement des sources 019 dans `integrations/odoo/addons/piqueray_ds/__init__.py` et `integrations/odoo/addons/piqueray_ds/__manifest__.py`
- [X] T003 [P] Épingler `odoo:19.0-20260803` et PostgreSQL 15, volumes, addon path, healthchecks et variables non secrètes dans `integrations/odoo/qa/compose.yaml` et `integrations/odoo/qa/.env.example`
- [X] T004 [P] Généraliser les instruments visuels réutilisables de 018 sans copier ses verdicts ni ses subjects dans `integrations/odoo/qa/visual/render-html.mts`, `integrations/odoo/qa/visual/capture-odoo.mts`, `integrations/odoo/qa/visual/compare.mts` et `integrations/odoo/qa/visual/selftest.mts`
- [X] T005 [P] Documenter les quatre frontières canonique/décision/généré/manuel et l'interdiction d'éditer `static/src/css/generated/` dans `integrations/odoo/README.md`

**Checkpoint**: L'addon neuf, l'instance épinglée et les instruments QA existent sans dépendance
d'exécution vers `specs/018-*`.

---

## Phase 2: Foundational — portes bloquantes communes

**Purpose**: Établir le snapshot, les validateurs, les assets générés, la compatibilité Odoo et le
spike d'éditabilité avant d'authorer une section.

**⚠️ CRITICAL**: Cette phase bloque les quatre user stories. Les fixtures et cas nommés sont écrits
avant leur implémentation; leur première exécution attendue est rouge.

- [X] T006 [P] Créer les fixtures adversariales pour sortie altérée, verdict manquant, chemin imbriqué invalide et drift d'entrée dans `evals/fixtures/odoo-production/generated-output/`, `evals/fixtures/odoo-production/missing-verdict/`, `evals/fixtures/odoo-production/invalid-path/` et `evals/fixtures/odoo-production/input-drift/`
- [X] T007 Ajouter `integrations/` au scratch hermétique et enregistrer d'abord les cas rouges `odoo-production-generated-output` et `odoo-authoring-coverage-refusal` dans `evals/harness.ts` et `evals/run.ts`
- [X] T008 [P] Implémenter la sérialisation canonique, les SHA-256, les chemins relatifs et le chargement des sources repo sans timestamp dans `scripts/odoo/lib/canonical.ts` et `scripts/odoo/lib/repo-data.ts`
- [X] T009 [P] Charger et valider les cinq schémas JSON de 019 avec des erreurs adressables dans `scripts/odoo/lib/schemas.ts`
- [X] T010 Construire le lock exact des cinq contrats, tokens, registres, fontes/assets et images Docker, puis refuser tout drift sans repin dans `scripts/odoo/check-inputs.ts` et `integrations/odoo/config/inputs.lock.json`
- [X] T011 Résoudre les occurrences par `componentPath`, prop, `partPath` et wildcard de repeat, puis refuser manque, doublon, ambiguïté, type incohérent ou sélecteur non root-scoped dans `scripts/odoo/check-authoring.ts`
- [X] T012 Implémenter le build d'assets mince via `loadRepoData()` et `emitHtml()` pour les deux closures, avec ordre stable, suppression explicite du showcase chrome, préfixe `--pqr-` et mode `--check` dans `scripts/odoo/build-assets.ts`
- [X] T013 Produire uniquement par T012 les fichiers `DO NOT EDIT` dans `integrations/odoo/addons/piqueray_ds/static/src/css/generated/tokens.pqr.css`, `integrations/odoo/addons/piqueray_ds/static/src/css/generated/components.pqr.css`, `integrations/odoo/addons/piqueray_ds/static/src/css/generated/fonts.pqr.css`, `integrations/odoo/addons/piqueray_ds/static/src/fonts/` et `integrations/odoo/addons/piqueray_ds/static/src/img/`
- [X] T014 Câbler `odoo:inputs:check`, `odoo:authoring:check`, `odoo:assets`, `odoo:module:check` et la génération Odoo additive dans le build standard sans repointer la sortie historique de 018 dans `package.json`
- [X] T015 [P] Vérifier manifeste, XML, deux racines maximales, absence de `section` imbriquée, bundles et interdiction de déclarer les trois composants internes comme snippets dans `scripts/odoo/check-module.ts`
- [X] T016 [P] Créer l'orchestrateur QA avec démarrage, reset de base, installation, login rédacteur, public anonyme, collecte console/réseau et écriture de reçus conformes dans `integrations/odoo/qa/run.mts` et `integrations/odoo/qa/lib/receipt.mts`
- [X] T017 [P] Écrire avant le levier le scénario rouge qui ferme une racine et rouvre deux textes nommés dans `integrations/odoo/qa/scenarios/editability-boundary.spec.mts` et `integrations/odoo/addons/piqueray_ds_qa/views/harness.xml`; les gestes structurels initialement annoncés mais absents sont repris explicitement par T017b
- [X] T018 Isoler tous les imports internes, exclusions d'options natives, ressources d'éditabilité, toolbar et sentinelles de version Odoo 19 dans `integrations/odoo/addons/piqueray_ds/static/src/js/odoo19_compat.js`
- [X] T019 Implémenter la fermeture/réouverture root-scoped, les actions racine distinctes et l'allowlist rich-text appliquée aussi au collage/raccourci/save dans `integrations/odoo/addons/piqueray_ds/static/src/js/authoring.js` et `integrations/odoo/addons/piqueray_ds/static/src/js/rich_text_guard.js`
- [X] T020 Exécuter le spike T017 sur l'image épinglée et enregistrer le résultat factuel dans `specs/019-odoo-production-foundation/proofs/editability-boundary.json`; en cas d'échec, ajouter immédiatement le code de limite et interdire les claims FR-009/FR-010 dans `specs/019-odoo-production-foundation/proofs/limits.json`
- [X] T021 Rédiger la première version du guide agent avec ordre snapshot → décisions → spike → QWeb/authoring → preuves → delta, interdits et protocole d'exception dans `.agents/skills/odoo-component-production/SKILL.md`

### Reprise de Phase 2 — ouverte par la revue du 2026-08-08

Ces tâches sont **bloquantes pour la Phase 3**. Elles existent parce que T017 et T020 ont été
exécutées sans atteindre ce qu'elles annonçaient, et le dire vaut mieux que cocher un checkpoint.

- [X] T017b [US-toutes] Compléter d'abord le scénario de banc avec les gestes que le relevé d'`isContentEditable` ne couvre pas : **déplacement, suppression, duplication** tentés sur les quatre descendants verrouillés, plus l'**édition par frappe réelle** (et pas seulement l'attribut) sur les deux zones rouvertes, dans `integrations/odoo/qa/scenarios/editability-boundary.spec.mts`. L'addon QA rend d'abord chaque descendant sélectionnable et candidat aux gestes natifs : une absence de commande ne vaut succès qu'après activation de cette sonde hostile et sélection réelle ; une sonde indisponible reste un échec/saut, jamais un vert.
- [X] T020c [US-toutes] Compléter la frontière de compatibilité **T018** : y faire passer les classes d'options natives, `BaseOptionComponent`, l'action d'ancre, les descripteurs de resize et le namespace de toolbar, puis étendre la sentinelle aux hypothèses qui décident vraiment (présence des ressources `content_(not_)editable_selectors`), dans `integrations/odoo/addons/piqueray_ds/static/src/js/odoo19_compat.js`.
- [X] T020d [US-toutes] Implémenter dans **T019** les **actions de racine distinctes** (`move`, `duplicate`, `remove`, `save-as-custom`, `resize`, `background`) que `rootActions` déclare, et retirer aussi l'action d'ancre native hors vocabulaire, dans `integrations/odoo/addons/piqueray_ds/static/src/js/authoring.js`.
- [X] T020e [US-toutes] Durcir la garde rich-text de T019 : nettoyer aussi les attributs interdits portés par la **racine éditable** sans déplier cette racine, puis couvrir ce cas dans le scénario ciblé, dans `integrations/odoo/addons/piqueray_ds/static/src/js/rich_text_guard.js` et `integrations/odoo/qa/scenarios/editability-boundary.spec.mts`.
- [X] T020b [US-toutes] En dernier, établir la **voie d'entrée en mode édition** d'Odoo 19 et rejouer le spike complet après T017b/T020c/T020d/T020e. Le diagnostic a corrigé la prémisse : l'URL `action-website.website_preview?...&enable_editor=1` engage bien le builder ; l'ancien témoin nul venait d'un compte limité à `group_website_restricted_editor`, rôle qui n'a aucun droit d'écriture sur `website.page` par défaut. La QA provisionne désormais `group_website_designer` sans `base.group_system`, puis exige `o_builder_open`, `editor_enable`, un RPC `ir.ui.view/save` et une lecture publique. Reçu : `specs/019-odoo-production-foundation/proofs/editability-boundary.json`, limites : `proofs/limits.json`.

**Checkpoint — ATTEINT le 2026-08-08.** Le reçu ciblé porte **44/44 constats tenus**, zéro saut,
zéro échec et zéro code de limite : 2 zones rouvertes, 4 zones figées, 12 gestes intérieurs
refusés sous sonde hostile, puis move/duplicate/remove exercés sur deux instances concurrentes aux
verdicts opposés. Save-as-custom/resize/ancre et options natives sont absents selon la politique ;
la charge rich-text est nettoyée, persistée et relue en session anonyme. Cela qualifie la
**fondation et son banc** ; les deux sections réelles gardent leurs preuves propres en Phases 3 et 4.

---

## Phase 3: User Story 2 — Administrer les avis et leurs images (Priority: P1) 🎯 Spike MVP

**Goal**: Livrer Google Reviews avec collection ordonnée 0/1/N, cartes indépendantes, média + alt,
quatre combinaisons photo/initiale et panneau strict.

**Independent Test**: Insérer deux Google Reviews, partir des cinq samples, exercer 0/1/5/6,
ajouter/modifier/réordonner/supprimer une carte, remplacer son avatar, sauver, fermer, rouvrir puis
contrôler l'éditeur et le public sans fuite entre instances.

### Tests for User Story 2 — écrire et constater rouges avant l'implémentation

- [X] T022 [P] [US2] Écrire le scénario fonctionnel rouge couvrant deux instances, sample initial, 0/1/5/6 cartes, ciblage, CRUD, réordre, save/reopen et public dans `integrations/odoo/qa/scenarios/google-reviews.spec.mts`
- [X] T023 [P] [US2] Déclarer l'inventaire attendu des contrôles par racine/carte/avatar et la liste interdite des options image natives dans `integrations/odoo/qa/fixtures/google-reviews-panel.json`
- [X] T024 [P] [US2] Créer les charges hostiles de rich-text, handlers, scripts, URL exécutables, média invalide et alt vide dans `integrations/odoo/qa/fixtures/google-reviews-hostile.json`
- [X] T025 [P] [US2] Ajouter le subject visuel HTML contractuel et ses conditions épinglées de contenu, fontes, viewport, état et clip dans `integrations/odoo/qa/visual/subjects/google-reviews.mts`

### Implementation for User Story 2

- [X] T026 [US2] Remplir avec l'owner tous les verdicts props/parts/rootActions de `ds.google-reviews` et `ds.review-card`, y compris parts conditionnelles et wildcard de repeat, dans `integrations/odoo/config/google-reviews.authoring.json`
- [X] T027 [US2] Authorer `ds.review-card` comme template QWeb composable, échappé, sans `section` et avec parts/conditions adressables dans `integrations/odoo/addons/piqueray_ds/views/components.xml`
- [X] T028 [US2] Authorer `ds.google-reviews` par `t-call` vers ReviewCard, cinq samples épinglés, liste réelle et blueprint inerte utilisable depuis zéro, puis inscrire une seule racine dans `integrations/odoo/addons/piqueray_ds/views/components.xml` et `integrations/odoo/addons/piqueray_ds/views/snippets.xml`
- [X] T029 [US2] Implémenter les actions ajout/suppression/monter/descendre ciblées par instance et compatibles avec l'historique Odoo, sans état JSON parallèle, dans `integrations/odoo/addons/piqueray_ds/static/src/js/repeat_action.js`
- [X] T030 [US2] Encapsuler le dialogue média Odoo pour n'exposer que remplacement et alt, refuser/replier la photo incomplète et préserver les quatre états photo/initiale dans `integrations/odoo/addons/piqueray_ds/static/src/js/media_action.js`
- [X] T031 [US2] Déclarer le panneau Piqueray pour résumé, booléens, carte courante, repeat et média avec `selector`/`applyTo` stricts dans `integrations/odoo/addons/piqueray_ds/static/src/xml/authoring.xml`
- [X] T032 [US2] Relier les décisions Google Reviews aux selectors éditables/non éditables, exclusions natives, toolbar gras uniquement et actions ciblées dans `integrations/odoo/addons/piqueray_ds/static/src/js/authoring.js`
- [X] T033 [US2] Ajouter uniquement les adaptations de mécanique/visibilité Odoo nécessaires, sans valeur de design retapée, dans `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css`
- [X] T034 [US2] Charger templates, actions, panneau, bridge et assets générés dans les bons bundles sans exposer ReviewCard dans `integrations/odoo/addons/piqueray_ds/__manifest__.py`

### Qualification for User Story 2

- [X] T035 [US2] Faire passer T022 et produire les observations instance par instance, DOM après save, éditeur rouvert et public anonyme dans `specs/019-odoo-production-foundation/proofs/google-reviews-functional.json`
- [X] T036 [US2] Faire passer T023/T024, vérifier rôles, sanitization, quatre états avatar et panneau image minimal, puis écrire les résultats sans skip réputé pass dans `specs/019-odoo-production-foundation/proofs/google-reviews-security.json`
- [X] T037 [US2] Capturer référence HTML, Odoo et diff, exécuter aussi le smoke de page réelle, puis chiffrer/attribuer tout résidu dans `specs/019-odoo-production-foundation/proofs/google-reviews-visual.json`
- [X] T038 [US2] Déclarer l'échantillon de gestes, instrumenter plusieurs répétitions texte/booléen/ordre et consigner p95 ou `non-measured` dans `specs/019-odoo-production-foundation/proofs/google-reviews-performance.json`

**Checkpoint**: Google Reviews est indépendamment posable, éditable, sauvegardable, publiable et
mesuré. Ses mécanismes nouveaux sont des faits, pas des hypothèses de builder.

---

## Phase 4: User Story 1 — Composer une Présentation sans casser le DS (Priority: P1)

**Goal**: Livrer Presentation avec Button et SectionHeader internes, deux instances isolées,
contenus autorisés seulement et structure fermée au niveau réellement prouvé par T020.

**Independent Test**: Sur base propre, insérer deux Présentations avec textes, rich-text et CTA
opposés, sauver, rouvrir et contrôler qu'aucune valeur/options/édition intérieure ne fuit.

### Tests for User Story 1 — écrire et constater rouges avant l'implémentation

- [X] T039 [P] [US1] Écrire le scénario rouge d'insertion de deux Présentations, contenus/CTA opposés, inventaire d'options, gestes intérieurs, save/reopen et public dans `integrations/odoo/qa/scenarios/presentation.spec.mts`
- [X] T040 [P] [US1] Déclarer les contrôles/parts attendus et toutes les options Odoo interdites par cible dans `integrations/odoo/qa/fixtures/presentation-panel.json`
- [X] T041 [P] [US1] Ajouter le subject HTML contractuel avec fontes, viewport, état et clip identiques dans `integrations/odoo/qa/visual/subjects/presentation.mts`

### Implementation for User Story 1

- [X] T042 [US1] Remplir avec l'owner tous les verdicts props/parts/rootActions de `ds.presentation`, `ds.section-header` et `ds.button`, chemins d'occurrence inclus, dans `integrations/odoo/config/presentation.authoring.json`
- [X] T043 [US1] Authorer Button comme template QWeb interne paramétré, texte simple adressable et sans inscription snippet dans `integrations/odoo/addons/piqueray_ds/views/components.xml`
- [X] T044 [US1] Authorer SectionHeader par composition vers Button, avec titre/description/CTA adressables et sans `section` imbriquée, dans `integrations/odoo/addons/piqueray_ds/views/components.xml`
- [X] T045 [US1] Authorer Presentation par `t-call` vers SectionHeader et Button, puis ajouter exactement une inscription posable dans `integrations/odoo/addons/piqueray_ds/views/components.xml` et `integrations/odoo/addons/piqueray_ds/views/snippets.xml`
- [X] T046 [US1] Relier la config Presentation au panneau, checkbox CTA, selectors root-scoped, exclusions natives, texte simple sans toolbar et rich-text allowlist dans `integrations/odoo/addons/piqueray_ds/static/src/js/authoring.js` et `integrations/odoo/addons/piqueray_ds/static/src/xml/authoring.xml`
- [X] T047 [US1] Ajouter seulement les adaptations de mécanique Odoo encore nécessaires à Presentation et attribuer toute valeur résiduelle à une source/limite dans `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css`

### Qualification for User Story 1

- [X] T048 [US1] Faire passer T039/T040 et produire les preuves de deux instances, CTA opposés, gestes permis/refusés, save/reopen et public dans `specs/019-odoo-production-foundation/proofs/presentation-functional.json`
- [X] T049 [US1] Capturer HTML, Odoo, diff strict et smoke réel, puis chiffrer le résidu éventuel sans recycler le verdict 018 dans `specs/019-odoo-production-foundation/proofs/presentation-visual.json`
- [X] T050 [US1] Mesurer le même échantillon défini de gestes, vérifier le rich-text hostile et consigner p95 ou `non-measured` dans `specs/019-odoo-production-foundation/proofs/presentation-performance-security.json`

**Checkpoint**: Presentation et ses dépendances sont indépendamment qualifiées dans le module
produit; la preuve 018 ne sert que de référence historique.

---

## Phase 5: User Story 3 — Maintenir les blocs sauvegardés par version (Priority: P2)

**Goal**: Distinguer politique vivante et structure stockée, détecter tout bloc ancien, et prouver
clean install puis update sans prétendre migrer l'HTML posé.

**Independent Test**: Sauvegarder les deux sections, simuler successivement une politique plus
récente et un digest structurel ancien, mettre à jour l'addon et vérifier réapplication de la
politique, signal structurel et contenu public intact.

### Tests for User Story 3 — écrire et constater rouges avant l'implémentation

- [X] T051 [P] [US3] Ajouter la fixture structure courante/policy-stale/structure-stale/unknown et enregistrer d'abord rouge `odoo-production-version-drift` dans `evals/fixtures/odoo-production/version-drift/` et `evals/run.ts`
- [X] T052 [P] [US3] Écrire les scénarios rouges clean install, page remplie, `-u`, policy-stale, structure-stale, métadonnées absentes et public intact dans `integrations/odoo/qa/scenarios/versioning.spec.mts`

### Implementation for User Story 3

- [X] T053 [US3] Persister sur les deux racines `data-ds-contract`, versions contrat/authoring, graph digest et marqueurs Odoo `data-vcss/data-vxml/data-vjs` dans `integrations/odoo/addons/piqueray_ds/views/components.xml`
- [X] T054 [US3] Classer `current`, `policy-stale`, `structure-stale` et `unknown`, réappliquer seulement la politique et afficher une action explicite sans réécriture automatique dans `integrations/odoo/addons/piqueray_ds/static/src/js/version_guard.js`
- [X] T055 [US3] Scanner des arches ou captures HTML sauvegardées, résoudre les versions imbriquées via snapshot/digest et sérialiser un rapport stable dans `scripts/odoo/scan-saved-versions.ts`
- [X] T056 [US3] Construire et valider les reçus/manifeste sans agréger `skipped` comme succès ni `qualified` avec limites dans `scripts/odoo/qualification-manifest.ts`
- [X] T057 [US3] Automatiser base propre, installation, seed de page, snapshot de contenu, mise à jour addon et contrôles post-update dans `integrations/odoo/qa/scenarios/install-update.mts`

### Qualification for User Story 3

- [X] T058 [US3] Faire passer clean install et update avec les deux sections déjà remplies, et consigner contenu/métadonnées/public avant-après dans `specs/019-odoo-production-foundation/proofs/install-update.json`
- [X] T059 [US3] Faire passer les quatre états de version et prouver que `-u` ne revendique aucune migration structurelle dans `specs/019-odoo-production-foundation/proofs/version-policy.json`
- [X] T060 [US3] Vérifier qu'un public anonyme ne peut éditer aucune section tandis qu'un rédacteur standard le peut après update dans `specs/019-odoo-production-foundation/proofs/authorization.json`

**Checkpoint**: Les blocs portent leur origine, la politique et la structure ne sont plus
confondues, et le parcours update est qualifié sans migration implicite.

---

## Phase 6: User Story 4 — Transformer le manuel en connaissance builder (Priority: P3)

**Goal**: Mesurer automatiquement chaque adaptation et fournir à 021/022/025 une connaissance
rejouable, sans avis subjectif de l'agent.

**Independent Test**: Produire outputs et rapport ×2, puis retirer un verdict, casser un chemin,
altérer un généré et ajouter un bloc manuel non enregistré; chaque cas échoue ou est compté au bon
endroit avec sortie identique à l'octet.

### Tests for User Story 4 — écrire et constater rouges avant l'implémentation

- [X] T061 [P] [US4] Créer les fixtures registre sans bloc, bloc sans registre, marqueurs chevauchants et sérialisation non déterministe dans `evals/fixtures/odoo-production/derivation-report/`

### Implementation for User Story 4

- [X] T062 [US4] Définir les reasonCodes finis et enregistrer toutes les adaptations QWeb, builder, repeat, média, version, bridge, qualification et compatibilité dans `integrations/odoo/config/adaptation-registry.json`
- [X] T063 [US4] Encadrer chaque bloc manuel par son unique `ODOO-019-* BEGIN/END` correspondant dans `integrations/odoo/addons/piqueray_ds/views/`, `integrations/odoo/addons/piqueray_ds/static/src/js/`, `integrations/odoo/addons/piqueray_ds/static/src/xml/` et `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css`
- [X] T064 [US4] Calculer couverture, hashes attendu/réel, fichiers/blocs/lignes/octets par reasonCode et mechanism, ainsi que les trois listes `unclassified`, dans `scripts/odoo/build-derivation-report.ts`
- [X] T065 [US4] Ajouter génération et mode check du rapport au build sans laisser l'agent écrire la sortie dans `package.json` et `integrations/odoo/derivation-report.json`

### Qualification for User Story 4

- [X] T066 [US4] Exécuter le rapport ×2, les fixtures T006/T061 et le tamper d'une copie scratch, puis enregistrer digests et refus exacts dans `specs/019-odoo-production-foundation/proofs/derivation-determinism.json`
- [X] T067 [US4] Réviser le skill après son usage réel sur GoogleReviews, en ajoutant chaque catégorie oubliée et le protocole de correction/limite observé dans `.agents/skills/odoo-component-production/SKILL.md`
- [X] T068 [US4] Produire la table machine-readable des mécanismes prouvés, limites, adaptations et affectations 021/022/025 dans `specs/019-odoo-production-foundation/proofs/mechanism-handoff.json`
- [X] T069 [US4] Générer le manifeste initial `incomplete` et un rapport lisible séparant pass/fail/skipped, limites acceptées, hors contrat et non exercé dans `specs/019-odoo-production-foundation/proofs/qualification-manifest.json` et `specs/019-odoo-production-foundation/RAPPORT-QUALIFICATION.md`

**Checkpoint**: Le coût manuel est un delta calculé, le skill reflète le terrain, et le futur builder
peut être dimensionné sans relire le code ni le raisonnement de l'agent.

---

## Phase 7: Polish & Cross-Cutting Qualification

**Purpose**: Fermer les interactions entre stories, les claims et le paquet de fondation complet.

- [X] T070 Exécuter une page combinée avec deux instances de chaque section, valeurs booléennes opposées, plusieurs cartes et save/reopen/public pour détecter toute fuite inter-section dans `integrations/odoo/qa/scenarios/combined-isolation.spec.mts` et `specs/019-odoo-production-foundation/proofs/combined-isolation.json`
- [X] T071 Exécuter la self-test du differ puis les deux comparaisons strictes et le smoke public combiné, et consolider mesures/attributions dans `specs/019-odoo-production-foundation/proofs/visual-summary.json`
- [X] T072 Lancer inputs, authoring, assets check, module check, derivation check, clean install, update, sécurité, versions et tous les scénarios du quickstart, puis indexer chaque reçu dans `specs/019-odoo-production-foundation/proofs/quickstart-run.json`
- [X] T073 Vérifier le lock contre l'état courant après le travail parallèle de 020; en cas de drift repinner explicitement et rejouer seulement les reçus affectés dans `integrations/odoo/config/inputs.lock.json` et `specs/019-odoo-production-foundation/proofs/repin-impact.json`
- [X] T074 Exécuter dans ce worktree le sweep constitutionnel complet, y compris l'unique `npm run eval` sans filtre, consigner commandes/statut/N/N live sans hardcode dans `specs/019-odoo-production-foundation/proofs/final-gates.md`, puis régénérer le statut final dans `specs/019-odoo-production-foundation/proofs/qualification-manifest.json` et `specs/019-odoo-production-foundation/RAPPORT-QUALIFICATION.md`
- [X] T075 Après T074 vert uniquement, publier les claims prouvés et limites au bon endroit dans `docs/handoff/07-status-what-works.md`, `docs/handoff/08-status-what-doesnt-work.md`, `docs/handoff/09-testing-and-gates.md` et `docs/handoff/11-roadmap.md`
- [X] T076 Auditer le diff final pour exclure toute modification des contrats/Figma/core, toute retouche générée ou adaptation non classée, puis finaliser l'index de livraison dans `specs/019-odoo-production-foundation/proofs/README.md`

**Final Checkpoint**: 2/2 sections et 5/5 contrats de 019 sont qualifiés ou chaque échec/limite est
nommé sans faux succès; le paquet est directement consommable par 021, 022 et 025.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: démarre immédiatement.
- **Phase 2 — Foundational**: dépend de Phase 1 et bloque toutes les stories.
- **Phase 3 — US2 (P1)**: dépend de Phase 2; passe en premier pour réduire le risque repeat/média.
- **Phase 4 — US1 (P1)**: dépend de Phase 2 seulement sur le plan fonctionnel; l'ordre recommandé
  reste après le checkpoint US2 afin que les mécanismes partagés soient éprouvés.
- **Phase 5 — US3 (P2)**: dépend des templates sauvegardables de US1 et US2.
- **Phase 6 — US4 (P3)**: le validateur peut commencer après Phase 2, mais le rapport final dépend
  de tous les fichiers manuels et reçus US1–US3.
- **Phase 7 — Polish**: dépend des quatre stories.

### User Story Dependencies

```text
Setup → Foundation ──→ US2 GoogleReviews ──┐
                  └──→ US1 Presentation ───┼──→ US3 Versioning ──┐
                                          └──────────────────────┼──→ US4 final delta
                                                                 └──→ Polish/Gates
```

- **US2** est indépendamment testable après Foundation.
- **US1** est indépendamment testable après Foundation; elle ne dépend pas des templates US2.
- **US3** exige au moins un bloc sauvegardé de chaque racine, donc US1 + US2.
- **US4** mesure les adaptations réelles; son test de moteur peut commencer tôt, son verdict attend
  US1 + US2 + US3.

### Within Each User Story

- Les fixtures/scénarios sont écrits et observés rouges avant l'implémentation.
- La config owner-reviewed précède QWeb et authoring.
- Les templates précèdent les actions/panneaux qui les ciblent.
- Les scénarios fonctionnels passent avant les captures et les claims.
- Un résultat impossible devient `fail`, `skipped` ou limite explicite; jamais pass implicite.

## Parallel Opportunities

### Foundation

- T006, T008 et T009 peuvent avancer en parallèle; T007 attend seulement la forme des fixtures T006.
- T015 et T016 sont parallèles après le squelette T002.
- T017 peut être écrit pendant T018/T019, mais son exécution T020 attend les deux.

### User Story 2

- T022, T023, T024 et T025 sont quatre surfaces de test indépendantes.
- Après T026, T027 et T030 peuvent avancer en parallèle; T028 attend T027 et T032 attend T028–T31.
- T037 peut préparer ses références pendant T035/T036, mais la capture finale attend le rendu stable.

### User Story 1

- T039, T040 et T041 sont parallèles.
- Après T042, T043 peut avancer en parallèle de la préparation des sélecteurs T046; T044 attend T043
  et T045 attend T044.

### User Stories 1 et 2

- Après Foundation, deux agents peuvent préparer US1 et US2 en parallèle seulement si les écritures
  sont partitionnées : configs/fixtures/subjects séparés. Un seul owner fusionne ensuite les zones
  partagées `components.xml`, `authoring.js`, `authoring.xml` et `odoo-bridge.css`.

### User Story 3

- T051 et T052 sont parallèles; T054 et T055 peuvent avancer en parallèle après le modèle de
  métadonnées T053.

### User Story 4

- T061 et la revue des reasonCodes T062 sont parallèles.
- T067 et T068 peuvent avancer après les reçus US2, pendant la stabilisation du rapport T064–T066.

## Parallel Examples

### US2 — tests en parallèle

```text
T022: scénario CRUD/repeat/persistance
T023: inventaire du panneau
T024: contenus hostiles et média
T025: subject visuel contractuel
```

### US1 — tests en parallèle

```text
T039: scénario deux Présentations
T040: inventaire du panneau
T041: subject visuel contractuel
```

### US3 — tests en parallèle

```text
T051: fixture hermétique version drift
T052: scénario live install/update/version
```

### US4 — préparation en parallèle

```text
T061: fixtures adversariales du rapport
T062: reasonCodes et registre des adaptations observées
```

## Implementation Strategy

### MVP technique — GoogleReviews d'abord

1. Terminer Setup + Foundation.
2. Ne pas polir Presentation tant que T020 n'a pas tranché l'éditabilité sélective.
3. Terminer US2 jusqu'à T038 : c'est le test du workflow sur repeat, média et rich-text.
4. Corriger immédiatement le vocabulaire de config et le skill si le terrain révèle un manque.

Ce MVP technique n'est pas la clôture de 019; il tranche rapidement si les vagues 021/022 peuvent
réutiliser la fondation.

### MVP livrable de 019

1. Ajouter ensuite US1 jusqu'à T050.
2. Fermer US3 et US4.
3. Exécuter Phase 7 et ne documenter les claims qu'après T074 vert.

### Stratégie délai J1–J2

- **J1 matin**: T001–T021, avec editability spike dès que l'instance répond.
- **J1 après-midi**: T022–T034, priorité au cycle repeat + média le plus court.
- **J2 matin**: T035–T050, preuves GoogleReviews puis reproduction Presentation.
- **J2 après-midi**: T051–T076, version/update, delta mécanique, gates et handoff.

La parallélisation concerne uniquement les fichiers disjoints. Les quatre fichiers partagés Odoo
ont un seul intégrateur pour éviter les écrasements silencieux.

## Notes

- `[P]` signifie réellement sans conflit de fichiers ni dépendance inachevée.
- Les contrats, Figma, `core/` et les sorties générées ne sont jamais édités pour faire passer Odoo.
- Le POC 018 fournit des mécanismes et instruments à réexaminer, jamais des preuves de production.
- `npm run eval` ne possède pas de filtre par cas : la suite complète n'est lancée qu'aux checkpoints
  d'implémentation prévus, et son N/N vivant n'est jamais écrit comme constante dans la doc.
- Le builder Odoo générique est explicitement hors 019; toute généralisation découverte est mesurée
  dans `derivation-report.json` pour 025.
