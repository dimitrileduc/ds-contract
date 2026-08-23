---

description: "Tâches d’implémentation des liens Figma dans l’éditeur Odoo"
---

# Tasks: Liens Figma dans l’éditeur Odoo

**Input**: Design documents from `/specs/025-odoo-figma-links/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Inclus, car la spécification exige des contrôles déterministes de couverture/refus et une qualification sur l’éditeur Odoo réel.

**Organization**: Les tâches sont regroupées par user story afin que les panneaux racines, les panneaux enfants et la gouvernance puissent être livrés et vérifiés comme incréments distincts.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut être exécutée en parallèle dans un fichier distinct, sans dépendance sur une tâche inachevée
- **[Story]**: User story couverte (`US1`, `US2`, `US3`)
- Chaque tâche indique le chemin exact du fichier concerné

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Rendre le worktree autonome et préparer les points d’entrée de la feature.

- [X] T001 Installer les dépendances du worktree avec `npm install` et Chromium avec `npx playwright install chromium`, puis consigner les commandes exécutées dans `specs/025-odoo-figma-links/proofs/setup.md`
- [X] T002 [P] Enregistrer les scripts `odoo:figma-links` et `odoo:figma-links:check` dans `package.json`
- [X] T003 [P] Créer le squelette versionné du manifeste panneau–contrat conforme à `contracts/panel-figma-map.schema.json` dans `integrations/odoo/config/figma-panels.json`
- [X] T004 [P] Créer la fixture de census revue des panneaux Piqueray racines, enfants et shell dans `integrations/odoo/qa/fixtures/figma-panels.expected.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Construire la résolution canonique, la projection déterministe et le mécanisme Odoo partagés par toutes les stories.

**⚠️ CRITICAL**: Aucune user story ne peut être terminée avant cette phase.

- [X] T005 Étendre les helpers de dépôt avec les chemins du manifeste, des contrats, du census et de la sortie générée dans `scripts/odoo/lib/repo-data.ts`
- [X] T006 Implémenter dans `scripts/odoo/build-figma-links.ts` le parsing du manifeste, la validation des identifiants/sélecteurs/componentPath et la résolution versionnée de chaque chemin vers un contrat canonique
- [X] T007 Compléter `scripts/odoo/build-figma-links.ts` avec la lecture exclusive de `anchors.figma.fileKey` et `nodeId`, les états `available|unavailable`, les raisons d’indisponibilité nommées et le refus de toute destination générique
- [X] T008 Compléter `scripts/odoo/build-figma-links.ts` avec une émission triée byte-stable et un mode `--check` vers `integrations/odoo/addons/piqueray_ds/static/src/js/generated/figma_links.js`
- [X] T009 Ajouter le module généré `figma_links.js` avant l’action manuelle dans les assets builder de `integrations/odoo/addons/piqueray_ds/__manifest__.py`
- [X] T010 Implémenter l’action générique `BuilderAction` qui construit `https://www.figma.com/design/{fileKey}?node-id={nodeId}` avec `URL` et appelle synchroniquement `window.open(url, "_blank", "noopener,noreferrer")` sans repli de navigation dans `integrations/odoo/addons/piqueray_ds/static/src/js/authoring.js`
- [X] T011 Implémenter la `BaseOptionComponent` générique, la résolution exacte de la sélection et les états disponible/indisponible sans mutation de l’éditeur dans `integrations/odoo/addons/piqueray_ds/static/src/js/authoring.js`
- [X] T012 Ajouter le contrôle partagé « Ouvrir dans Figma », l’affordance externe et l’état désactivé « Référence Figma indisponible » dans `integrations/odoo/addons/piqueray_ds/static/src/xml/authoring.xml`

**Checkpoint**: Le générateur peut produire une table déterministe et l’éditeur dispose d’un contrôle/action générique consommant cette table.

---

## Phase 3: User Story 1 — Ouvrir la section sélectionnée dans Figma (Priority: P1) 🎯 MVP

**Goal**: Chaque panneau racine ou shell Piqueray sélectionnable ouvre en une action le composant maître Figma précis, sans modifier l’éditeur.

**Independent Test**: Sur la page de qualification, sélectionner successivement les 12 sections racines, dont HeroVideo, et le footer shell, ouvrir Figma, puis vérifier fichier+nœud, nouvel onglet isolé, sélection/HTML/dirty state inchangés et destination identique entre instances d’un même type.

### Tests for User Story 1

- [X] T013 [P] [US1] Ajouter les assertions statiques des entrées racines/shell, de l’unicité des sélecteurs et des ancres précises dans `evals/run.ts`
- [X] T014 [P] [US1] Ajouter le scénario navigateur des panneaux racines couvrant nouvel onglet, absence de `window.opener`, instances répétées, popup bloquée et invariants sélection/HTML/save state dans `integrations/odoo/qa/scenarios/figma-links.mts`

### Implementation for User Story 1

- [X] T015 [US1] Renseigner les 12 panneaux de sections racines, dont HeroVideo, et le panneau footer shell avec leur `optionClass`, template, sélecteur root-scopé et `componentPath` canonique dans `integrations/odoo/config/figma-panels.json`
- [X] T016 [US1] Régénérer et vérifier les entrées racines/shell triées dans `integrations/odoo/addons/piqueray_ds/static/src/js/generated/figma_links.js`
- [ ] T017 [US1] Qualifier chaque type racine/shell sur Odoo réel et archiver les destinations ainsi que les invariants d’éditeur dans `specs/025-odoo-figma-links/proofs/us1-editor.json`

**Checkpoint**: US1 est démontrable seule sur toutes les sections racines et le footer shell couverts.

---

## Phase 4: User Story 2 — Ouvrir un enfant sélectionnable dans Figma (Priority: P2)

**Goal**: Chaque panneau enfant V1 ouvre son propre composant maître plutôt que celui de sa section parente, sans inventer de contrôle pour les composants internes.

**Independent Test**: Sélectionner une carte d’avis, une carte membre, une rangée FAQ, une rangée Texte SEO, une carte Réassurances et une carte Catégorie ; vérifier pour chacune le nœud enfant attendu, puis confirmer qu’un composant interne sans panneau n’obtient aucun accès distinct.

### Tests for User Story 2

- [X] T018 [P] [US2] Ajouter les assertions statiques des six types enfants et de leurs chemins de composition imbriqués dans `evals/run.ts`
- [X] T019 [P] [US2] Ajouter le scénario navigateur des six panneaux enfants, des collections répétées et de l’absence de contrôle sur les composants internes dans `integrations/odoo/qa/scenarios/figma-links.mts`

### Implementation for User Story 2

- [X] T020 [US2] Ajouter les panneaux enfant review-card, member-card, FAQ row, Texte SEO row, Réassurances card et Catégorie card avec leurs `componentPath` explicites dans `integrations/odoo/config/figma-panels.json`
- [X] T021 [US2] Régénérer et vérifier les entrées enfants triées dans `integrations/odoo/addons/piqueray_ds/static/src/js/generated/figma_links.js`
- [ ] T022 [US2] Qualifier les six types enfants sur Odoo réel et archiver destinations, répétitions et exclusions internes dans `specs/025-odoo-figma-links/proofs/us2-editor.json`

**Checkpoint**: US2 est démontrable seule pour les six types enfants V1 et ne fuit pas vers les éléments internes.

---

## Phase 5: User Story 3 — Garantir des liens fiables et gouvernés (Priority: P3)

**Goal**: Toute destination reste dérivée du contrat canonique et toute omission, ambiguïté, ancre invalide ou contamination tierce bloque explicitement la qualification.

**Independent Test**: Muter une référence canonique dans une fixture et constater la projection correspondante, puis exercer chaque refus nommé et vérifier que le census bidirectionnel détecte tout panneau ajouté ou toute entrée orpheline.

### Tests for User Story 3

- [X] T023 [P] [US3] Créer les fixtures de manifeste/contrats pour panneau absent ou dupliqué, contrat absent, version divergente, ancre absente/malformée, fallback générique et sélecteur tiers dans `evals/fixtures/odoo-figma-links/cases.json`
- [X] T024 [P] [US3] Ajouter les evals nommées de dérivation depuis une ancre mutée et de chaque refus déterministe dans `evals/run.ts`
- [X] T025 [P] [US3] Ajouter au scénario navigateur la non-régression des panneaux natifs/tiers, l’état indisponible non actionnable et l’absence totale d’URL de repli dans `integrations/odoo/qa/scenarios/figma-links.mts`

### Implementation for User Story 3

- [X] T026 [US3] Implémenter le census bidirectionnel entre `Piqueray*Option` enregistrées, fixture revue et manifeste, avec exclusion explicite de `RootPolicyOption`, dans `scripts/odoo/build-figma-links.ts`
- [X] T027 [US3] Faire échouer le mode `--check` pour toute entrée `unavailable`, panneau non couvert, entrée orpheline, correspondance ambiguë ou sélecteur natif/tiers dans `scripts/odoo/build-figma-links.ts`
- [X] T028 [US3] Intégrer la génération Figma-links au build et la vérification byte-current aux portes de dérivation dans `package.json`
- [X] T029 [US3] Étendre la vérification du module afin d’exiger l’ordre des assets, le marquage `DO NOT EDIT` et l’unique contrôle/action générique dans `scripts/odoo/check-module.ts`
- [X] T030 [US3] Archiver le résultat du census exhaustif, des refus nommés et de la non-contamination native/tiers dans `specs/025-odoo-figma-links/proofs/us3-governance.md`

**Checkpoint**: US3 prouve la source unique contractuelle et bloque toute couverture fausse ou incomplète.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documenter le flux, exécuter tous les gates et produire les reçus finaux sans claim non prouvée.

- [X] T031 [P] Documenter le manifeste, la génération, l’état indisponible et la procédure de qualification dans `integrations/odoo/README.md`
- [X] T032 [P] Mettre à jour le handoff des frontières d’architecture et des gates Figma-links dans `docs/handoff/09-testing-and-gates.md` (le chemin prévu `09-odoo-production.md` n’existe pas dans ce dépôt)
- [X] T033 Exécuter les commandes de build, couverture, checks Odoo et evals de `specs/025-odoo-figma-links/quickstart.md`, puis consigner leurs sorties et tout scénario sauté comme non qualifiant dans `specs/025-odoo-figma-links/proofs/static-gates.md`
- [ ] T034 Exécuter la qualification Odoo réelle complète via `integrations/odoo/qa/scenarios/figma-links.mts` et consolider les reçus racines/enfants/non-régression dans `specs/025-odoo-figma-links/proofs/editor-qualification.md`
- [X] T035 Exécuter les gates constitutionnels de fermeture et consigner les résultats de `npm run build`, `npm run parity`, `npm run eval`, `npm run plugin:check`, roundtrip, browser check et TypeScript dans `specs/025-odoo-figma-links/proofs/closure.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: démarre immédiatement ; T002, T003 et T004 sont parallélisables après T001 si les outils ne sont pas déjà présents
- **Foundational (Phase 2)**: dépend de Setup ; T005 → T006 → T007 → T008, puis T009–T012 intègrent la projection au builder
- **US1 (Phase 3)**: dépend de Foundational ; constitue le MVP
- **US2 (Phase 4)**: dépend de Foundational et peut avancer en parallèle de US1 après stabilisation du format du manifeste
- **US3 (Phase 5)**: dépend du générateur foundational et du census complet US1+US2 pour sa preuve exhaustive
- **Polish (Phase 6)**: dépend des stories retenues ; les gates finaux T033–T035 s’exécutent après documentation et implémentation complète

### User Story Dependencies

```text
Setup → Foundational → US1 (MVP)
                   ├→ US2
                   └→ US3 (finalise sa couverture après US1 + US2)
US1 + US2 + US3 → Polish / qualification finale
```

- **US1 (P1)**: aucune dépendance sur une autre story après Foundational
- **US2 (P2)**: aucune dépendance fonctionnelle sur US1 ; réutilise seulement le mécanisme partagé
- **US3 (P3)**: ses refus unitaires sont indépendants, mais sa preuve de couverture exhaustive requiert les descripteurs de US1 et US2

### Within Each User Story

- Écrire les assertions/scénarios avant l’implémentation et constater leur échec
- Ajouter les descripteurs avant de régénérer la projection
- Régénérer avant la qualification Odoo réelle
- Archiver un reçu seulement après réussite non sautée du scénario

### Parallel Opportunities

- T002, T003 et T004 touchent des fichiers distincts
- T013 et T014 peuvent être préparées en parallèle ; idem pour T018/T019 et T023/T024/T025
- Après Foundational, US1 et US2 peuvent être implémentées en parallèle dans des branches de manifeste coordonnées
- T031 et T032 sont parallélisables après stabilisation du comportement
- Les vérifications statiques sans instance Odoo peuvent être préparées pendant la mise en place de la qualification réelle

---

## Parallel Example: User Story 1

```text
Task T013: Ajouter les assertions statiques racines dans evals/run.ts
Task T014: Ajouter le scénario navigateur racines dans integrations/odoo/qa/scenarios/figma-links.mts
```

## Parallel Example: User Story 2

```text
Task T018: Ajouter les assertions statiques enfants dans evals/run.ts
Task T019: Ajouter le scénario navigateur enfants dans integrations/odoo/qa/scenarios/figma-links.mts
```

## Parallel Example: User Story 3

```text
Task T023: Créer les fixtures de refus dans evals/fixtures/odoo-figma-links/cases.json
Task T025: Ajouter la non-régression navigateur dans integrations/odoo/qa/scenarios/figma-links.mts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Terminer Setup et Foundational.
2. Écrire les tests US1 et constater leur échec.
3. Ajouter les descripteurs racines/shell, régénérer, puis qualifier US1 sur Odoo réel.
4. Arrêter et démontrer le MVP avant d’ajouter les enfants ou les gates de gouvernance complets.

### Incremental Delivery

1. **Foundation**: générateur déterministe + action/option générique.
2. **MVP US1**: toutes les sections racines et le footer shell ouvrent leur master précis.
3. **US2**: les six enfants exposés ouvrent leur propre master.
4. **US3**: census bidirectionnel, refus déterministes et protection contre les panneaux tiers.
5. **Closure**: documentation, qualification réelle et sweep constitutionnel complet.

### Validation Discipline

- Ne jamais éditer manuellement `integrations/odoo/addons/piqueray_ds/static/src/js/generated/figma_links.js` ; modifier le manifeste, les contrats ou le générateur puis régénérer.
- Ne jamais ajouter d’URL Figma complète dans un panneau Odoo ; seuls `anchors.figma.fileKey` et `nodeId` des contrats canoniques alimentent la projection.
- Un état `unavailable` peut préserver l’utilisabilité en développement, mais bloque toujours `odoo:figma-links:check` et la qualification.
- Un scénario live sauté est rapporté comme sauté et ne constitue jamais une preuve de réussite.
