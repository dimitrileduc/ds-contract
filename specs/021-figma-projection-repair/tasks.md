---

description: "Tâches d'implémentation pour réparer la projection Figma"
---

# Tasks: Réparer la projection Figma

**Input**: Design documents from `specs/021-figma-projection-repair/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Obligatoires pour cette feature : FR-020 exige une vérification qui échoue sur l'ancien
comportement et réussit sur le nouveau pour chaque classe de panne.

**Organization**: Les tâches sont groupées par user story. Toutes les écritures canvas utilisent un
writer unique et restent bloquées jusqu'à la capture globale vérifiée de Phase 2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: exécutable en parallèle sur des fichiers disjoints, sans dépendance inachevée
- **[Story]**: user story couverte (`US1` à `US4`)
- Chaque tâche nomme les chemins de fichiers concernés

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Rendre le worktree autonome et établir une baseline avant toute modification produit.

- [X] T001 [Worktree gates — F1] Dans `/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/soapy-duckling/`, exécuter `npm install` puis `npx playwright install chromium`; confirmer que tous les gates suivants utiliseront les `node_modules` et Chromium de ce worktree.
- [X] T002 Exécuter le sweep constitutionnel de départ et consigner commandes, sorties, commit et état Git dans `specs/021-figma-projection-repair/proofs/setup/baseline.md` sans hardcoder le compte vivant des evals.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Construire les modèles, refus, captures et pins communs avant toute user story ou écriture canvas.

**⚠️ CRITICAL**: Aucune mutation live de US1/US2 ne commence avant T012 et son reçu de capture globale vert.

- [X] T003 Écrire d'abord la fixture adverse des schémas, sept cibles, transitions, pins et captures incomplètes dans `evals/fixtures/figma-projection-repair/campaign-gates-check.ts` à partir de `specs/021-figma-projection-repair/contracts/repair-campaign.schema.json` et `repair-receipt.schema.json`.
- [X] T004 Enregistrer `figma-projection-repair-campaign-gates` dans `evals/run.ts`, exécuter la fixture et consigner son échec pré-implémentation dans `specs/021-figma-projection-repair/proofs/foundation/campaign-gates-red.txt`.
- [X] T005 Implémenter `RepairCampaign`, `RepairTarget`, `ValidatedReference`, `AffectedSurface`, `CaptureSet`, `ImageFingerprint`, `InstanceLink`, `ProjectionDefect`, `ConsumerImpact`, `RepairOperation` et `RepairReceipt` dans `extract/figma/projection-repair/types.ts` conformément à `data-model.md`.
- [X] T006 Implémenter la validation des deux schémas, l'unicité/exhaustivité des sept cibles et les transitions/refus de campagne dans `extract/figma/projection-repair/campaign.ts`.
- [X] T007 Ajouter l'interface `projection:repair` (`--preflight`, `--capture-before`, `--dry-run`, `--apply`, `--capture-after`, `--verify`, `--capture-idempotence`, `--verify-idempotence`, `--finalize`) dans `extract/figma/projection-repair/cli.ts` et `package.json`.
- [X] T008 [P] Créer le manifeste fermé des sept cibles, références 020, surfaces attendues, champs autorisés et faits protégés dans `specs/021-figma-projection-repair/campaign/campaign.json`.
- [X] T009 [P] Implémenter les captures PNG/structure/propriétés, la validation non-vide/dimensions, les empreintes IMAGE positionnelles et les liens master→instance dans `extract/figma/projection-repair/capture.ts` en réutilisant `extract/figma/page-parity/`, `extract/figma/photo-parity/` et `extract/figma/state-photo/`.
- [X] T010 [P] Implémenter l'inventaire contractuel/Figma/Odoo des consommateurs de Button, SectionHeader et du lowering absolu dans `extract/figma/projection-repair/impact.ts` sans clé fondée sur le nom de calque.
- [X] T011 Implémenter le préflight read-only qui vérifie file key/version, node ids/types/parents, références 020, allowlist, graphe d'impact et disponibilité des sources dans `extract/figma/projection-repair/campaign.ts` et brancher sa commande dans `extract/figma/projection-repair/cli.ts`.
- [X] T012 Exécuter `--preflight` puis `--capture-before` sur les 7/7 cibles et tous leurs usages, valider l'état `ready-to-apply`, et archiver manifeste, hashes, dimensions, images, overrides et absence de mutation dans `specs/021-figma-projection-repair/proofs/before/` — pin `2385747041460798575`, 24 surfaces, 72 artefacts valides; reçu : `proofs/before/receipt.md`.

**Checkpoint**: Fondation prête — les sept cibles possèdent une preuve avant vérifiée et les user stories peuvent être implémentées headlessly; les écritures live restent sérialisées.

---

## Phase 3: User Story 1 - Restaurer les sections visuellement cassées (Priority: P1) 🎯 MVP

**Goal**: Restaurer Hero, SAV, Catégories principales et Réalisations aux références owner 020, sans modifier leur contenu, leurs images ni leurs zones protégées.

**Independent Test**: Comparer Hero/SAV/Catégories/Réalisations réparés à leurs références 020 et vérifier cadre, superpositions, trois cartes, bloc de titre, images et zones voisines.

### Tests for User Story 1

> Écrire et faire échouer ces tests avant le correctif moteur ou les opérations directes.

- [X] T013 [P] [US1] Écrire la fixture `position:absolute` couvrant insets, plan image plein parent, position statique par alignement, enfants SAV imbriqués et témoin en flux dans `evals/fixtures/figma-projection-repair/absolute-lowering-check.ts`.
- [X] T014 [P] [US1] Écrire la fixture de refus des réparations Catégories/Réalisations sur mauvais pin, mauvais node/path, changement de contenu/grille et champ hors allowlist dans `evals/fixtures/figma-projection-repair/direct-geometry-repair-check.ts`.
- [X] T015 [US1] Enregistrer les evals `absolute-lowering` et `direct-geometry-repair` dans `evals/run.ts`, prouver leur rouge pré-correctif et archiver les sorties dans `specs/021-figma-projection-repair/proofs/us1/tests-red.txt`.

### Implementation for User Story 1

- [X] T016 [P] [US1] Compiler chaque `declared.position="absolute"` en plan hors flux explicite et appliquer/refuser son placement après `appendChild` dans `core/emit-figma-script.ts`, sans cas spécial par nom Hero/SAV.
- [X] T017 [P] [US1] Enseigner au mock le recalcul du parent après `layoutPositioning="ABSOLUTE"`, les contraintes/alignements et les refus de parent non auto-layout dans `scripts/plugin-engine-mock-figma.mjs`.
- [X] T018 [P] [US1] Déclarer la restauration strictement bornée de la variante Catégories `2115:4275` (cartes 474 px, x=89/627/1165) dans `specs/021-figma-projection-repair/repairs/categories-principales.json`.
- [X] T019 [P] [US1] Déclarer la restauration strictement bornée du bloc d'en-tête de Réalisations `2117:4690` (x=204,5, largeur 1319) et protéger contenu/grille dans `specs/021-figma-projection-repair/repairs/realisations.json`.
- [X] T020 [US1] Implémenter dry-run, préconditions, allowlist, postconditions et application des opérations `generated-amend`, `resize` et `reposition` dans `extract/figma/projection-repair/apply.ts`.
- [X] T021 [US1] Exécuter `npm run figma:plan` pour régénérer depuis les sources et vérifier que `figma-sync/28-hero.js` et `figma-sync/33-sav.js` portent le nouveau lowering sans édition manuelle.
- [X] T022 [US1] Exécuter le dry-run US1 et consigner uniquement les diffs autorisés Hero/SAV/Catégories/Réalisations dans `specs/021-figma-projection-repair/proofs/us1/dry-run.json` — 10 opérations, aucun writer appelé.
- [X] T023 [US1] Avec le writer canvas unique, appliquer les scripts générés Hero/SAV puis les deux réparations directes, et consigner chaque pré/postcondition et node id dans `specs/021-figma-projection-repair/proofs/us1/apply-receipt.json`.
- [X] T024 [US1] Capturer les quatre cibles et tous leurs usages après US1, comparer aux références 020, vérifier images/overrides/instances et zones protégées, puis produire `specs/021-figma-projection-repair/proofs/us1/verdict.md`.

**Checkpoint**: Hero, SAV, Catégories et Réalisations sont restaurés et testables indépendamment; aucun résultat US2 n'est requis pour leur comparaison visuelle.

---

## Phase 4: User Story 2 - Corriger les contrôles et propriétés composées (Priority: P1)

**Goal**: Rendre les flèches réellement opposées et les propriétés Coordonnées/Formulaire réellement vivantes, puis revalider tous les consommateurs partagés.

**Independent Test**: Changer chaque propriété sur une instance témoin, observer le glyph/texte visible attendu, revenir au défaut sans changement de géométrie et obtenir un verdict pour chaque consommateur partagé.

### Tests for User Story 2

> Écrire et faire échouer ces tests avant les changements de contrat/émetteur/mock.

- [X] T025 [P] [US2] Écrire la fixture parent TEXT/rich-text→propriété TEXT enfant, propagation visible, clé suffixée et témoin littéral dans `evals/fixtures/figma-projection-repair/composed-parent-prop-forwarding-check.ts`.
- [X] T026 [P] [US2] Écrire la fixture glyph statique versus enum `INSTANCE_SWAP`, `mainComponent` vivant, valeurs préférées du registre et chevrons opposés dans `evals/fixtures/figma-projection-repair/icon-instance-swap-visible-check.ts`.
- [X] T027 [P] [US2] Écrire la fixture qui refuse un consommateur Button/SectionHeader/Odoo absent ou encore `pending` dans `evals/fixtures/figma-projection-repair/shared-consumer-impact-check.ts`.
- [X] T028 [US2] Enregistrer les trois evals US2 dans `evals/run.ts`, prouver leur rouge pré-correctif et archiver les sorties dans `specs/021-figma-projection-repair/proofs/us2/tests-red.txt`.

### Implementation for User Story 2

- [X] T029 [P] [US2] Remplacer les littéraux du SectionHeader Formulaire par `{titre}`/`{accroche}`, appliquer le bump semver justifié et documenter la cause dans `contracts/formulaire.contract.json`.
- [X] T030 [US2] Compiler les mappings exacts `{propParent}` vers des références enfant résolues par identité de propriété et relier le sous-calque visible à la clé suffixée du parent dans `core/emit-figma-script.ts`.
- [X] T031 [P] [US2] Enseigner au mock les définitions suffixées, `componentPropertyReferences`, la propagation parent→sous-calque d'instance et les changements via `setProperties` dans `scripts/plugin-engine-mock-figma.mjs`.
- [X] T032 [US2] Compiler les `icon.asset` pilotés par enum `INSTANCE_SWAP` en instances d'icônes gouvernées, créer/éditer les propriétés et relier `mainComponent` dans `core/emit-figma-script.ts` tout en laissant les icônes statiques en SVG.
- [X] T033 [US2] Charger et transmettre les `componentName`/key/nodeId de `contracts/icons.registry.json` au moteur Figma sans heuristique de nom consommateur dans `scripts/generate-figma.ts`.
- [X] T034 [P] [US2] Compléter le graphe Button/SectionHeader/absolute et les décisions de maintien/revalidation Odoo 019 dans `specs/021-figma-projection-repair/campaign/campaign.json` via `extract/figma/projection-repair/impact.ts`.
- [X] T035 [US2] Exécuter `npm run build` puis `npm run figma:plan`, vérifier les diffs générés attendus dans `src/components/Formulaire/`, `figma-sync/05-button.js`, `figma-sync/06-carouselcontrols.js`, `figma-sync/09-coordonnees.js` et `figma-sync/23-formulaire.js`, sans édition manuelle.
- [X] T036 [US2] Exécuter le dry-run puis appliquer avec le writer unique Button/CarouselControls, Coordonnées et Formulaire sur le pin capturé; archiver le reçu dans `specs/021-figma-projection-repair/proofs/us2/apply-receipt.json`.
- [X] T037 [US2] Modifier puis restaurer les propriétés témoins, capturer glyphes/textes visibles, vérifier géométrie inchangée et fermer tous les consommateurs/repins dans `specs/021-figma-projection-repair/proofs/us2/consumer-verdicts.json` et `specs/021-figma-projection-repair/proofs/us2/verdict.md`.

**Checkpoint**: Produits e-commerce montre gauche/droite, Coordonnées/Formulaire n'ont plus de propriété orpheline et chaque consommateur partagé possède un verdict.

---

## Phase 5: User Story 3 - Empêcher le retour des mêmes régressions (Priority: P2)

**Goal**: Prouver que les trois mécanismes survivent à la reconstruction et que deux reconstructions sans changement sont observablement identiques.

**Independent Test**: Reconstruire deux fois les composants concernés depuis les mêmes sources et comparer géométrie, propriétés, images, ids, liens, overrides et captures normalisées.

### Tests for User Story 3

- [X] T038 [US3] Écrire une fixture qui injecte une divergence de seconde reconstruction (géométrie, propriété, image, instance et reçu normalisé) et exige un refus dans `evals/fixtures/figma-projection-repair/reconstruction-idempotence-check.ts`.
- [X] T039 [US3] Enregistrer `reconstruction-idempotence` dans `evals/run.ts`, prouver son rouge pré-implémentation et archiver la sortie dans `specs/021-figma-projection-repair/proofs/us3/idempotence-red.txt`.

### Implementation for User Story 3

- [X] T040 [P] [US3] Implémenter la normalisation/comparaison stricte des captures après et idempotence pour géométrie, props, images, liens, overrides et statuts dans `extract/figma/projection-repair/verify.ts`.
- [X] T041 [P] [US3] Implémenter le reçu d'idempotence déterministe et les no-op attendus du second apply dans `extract/figma/projection-repair/report.ts`.
- [X] T042 [US3] Exécuter deux `npm run build` et deux `npm run figma:plan` à entrées identiques, vérifier les sorties byte-identiques et consigner les manifests dans `specs/021-figma-projection-repair/proofs/us3/headless-roundtrip.md`.
- [X] T043 [US3] Relancer deux fois le lot live inchangé avec le writer unique et capturer les no-op/opérations dans `specs/021-figma-projection-repair/proofs/us3/live-rebuilds.json`.
- [X] T044 [US3] Capturer l'état idempotence, exécuter `--verify-idempotence` et produire le verdict sans diff observable dans `specs/021-figma-projection-repair/proofs/us3/verdict.md`.

**Checkpoint**: Les classes réparées sont protégées par evals headless et par une reconstruction live ×2 identique.

---

## Phase 6: User Story 4 - Réparer sans autre dégradation (Priority: P2)

**Goal**: Fermer la campagne avec un avant/après exhaustif, zéro perte/déplacement, zéro changement inattendu et une décision owner explicite par cible.

**Independent Test**: Comparer la même matrice de surfaces avant/après, vérifier images/instances/consommateurs, injecter les cas de refus puis tenir le gate owner 7/7.

### Tests for User Story 4

- [X] T045 [US4] Écrire la fixture de reçu final qui refuse capture invalide, image permutée, lien/override changé, diff hors allowlist, consommateur ouvert, idempotence rouge ou décision owner absente dans `evals/fixtures/figma-projection-repair/repair-receipt-gates-check.ts`.
- [X] T046 [US4] Enregistrer `repair-receipt-gates` dans `evals/run.ts`, prouver son rouge pré-implémentation et archiver la sortie dans `specs/021-figma-projection-repair/proofs/us4/receipt-gates-red.txt`.

### Implementation for User Story 4

- [X] T047 [P] [US4] Implémenter la validation et génération d'un reçu conforme à `specs/021-figma-projection-repair/contracts/repair-receipt.schema.json` dans `extract/figma/projection-repair/report.ts` avec acceptation impossible si un gate reste ouvert.
- [X] T048 [P] [US4] Implémenter la classification allowlist/hors-zone, l'appariement IMAGE `(hostId, structuralPath, paintIndex)`, les liens/overrides et la fermeture des impacts dans `extract/figma/projection-repair/verify.ts`.
- [X] T049 [US4] Recapturer exactement toutes les surfaces de T012 après le lot complet et stocker PNG, structures, props, images et liens dans `specs/021-figma-projection-repair/proofs/after/`.
- [X] T050 [US4] Exécuter `--verify`, refuser tout diff inattendu et produire la matrice 7/7 changements attendus/zones inchangées/images/instances/consommateurs/limites dans `specs/021-figma-projection-repair/proofs/us4/comparison.json`.
- [X] T051 [US4] Tenir le gate owner sur les sept paquets avant/référence/après/diff et enregistrer une décision `accepted` ou `refused` par cible dans `specs/021-figma-projection-repair/campaign/owner-decisions/` sans modifier les décisions de référence 020.
- [X] T052 [US4] Exécuter `--finalize`, valider exactement sept reçus contre le schéma et générer le bilan de clôture dans `specs/021-figma-projection-repair/proofs/closure.md`.

**Checkpoint**: La campagne est terminale, chaque cible est acceptée ou refusée explicitement et aucune dégradation hors périmètre n'est masquée.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Publier uniquement les claims prouvés, rejouer le guide et fermer tous les gates du worktree.

- [X] T053 [P] Mettre à jour les lignes `position:absolute`, propriété composée et `INSTANCE_SWAP` ainsi que leurs evals nommés dans `docs/FIGMA-CAPABILITY-MATRIX.md` après les preuves vertes.
- [X] T054 [P] Mettre à jour les limites réellement fermées, sans supprimer les limites restantes du bridge/images, dans `docs/handoff/08-status-what-doesnt-work.md`.
- [X] T055 Rejouer intégralement `specs/021-figma-projection-repair/quickstart.md` et consigner chaque commande/résultat attendu dans `specs/021-figma-projection-repair/proofs/quickstart-validation.md`.
- [X] T056 Exécuter le sweep constitutionnel complet dans ce worktree et consigner les sorties vivantes dans `specs/021-figma-projection-repair/proofs/final-gates.md`.
- [X] T057 Vérifier schémas, liens de preuves, absence de `pending`, 7/7 reçus, `git diff --check` et absence d'édition manuelle des sorties générées dans `specs/021-figma-projection-repair/proofs/completeness.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: démarre immédiatement.
- **Foundational (Phase 2)**: dépend de T001-T002 et bloque toutes les mutations live; T003-T004 précèdent T005-T011; T012 dépend de T005-T011.
- **US1 (Phase 3)**: dépend de T012. T013-T015 précèdent T016-T020; T022 dépend de T016-T021; T023-T024 sont strictement séquentiels.
- **US2 (Phase 4)**: dépend de T012. Son travail headless peut avancer indépendamment de US1, mais T036-T037 sont sérialisés avec T023-T024 par le writer unique.
- **US3 (Phase 5)**: dépend des correctifs et preuves US1+US2; T038-T039 précèdent T040-T041; T042-T044 sont séquentiels.
- **US4 (Phase 6)**: dépend de US1+US2+US3 et réutilise la capture avant T012; T045-T046 précèdent T047-T048; T049-T052 sont séquentiels.
- **Polish (Phase 7)**: dépend de toutes les stories et de leurs claims verts.

### User Story Dependencies

- **US1 (P1)**: indépendante fonctionnellement après la fondation; livre le MVP visuel.
- **US2 (P1)**: indépendante fonctionnellement après la fondation; partage seulement la fenêtre d'écriture live avec US1.
- **US3 (P2)**: dépend des mécanismes livrés par US1 et US2 pour prouver leur non-régression.
- **US4 (P2)**: dépend de toutes les réparations et de l'idempotence pour produire les reçus owner finaux.

### Within Each User Story

- Les fixtures et leur enregistrement rouge précèdent toujours l'implémentation.
- Les sources (`contracts/`, `core/`, `scripts/`) précèdent toute régénération.
- `src/components/` et `figma-sync/` ne sont jamais édités, seulement régénérés.
- Dry-run et capture globale précèdent toute application live.
- Application, capture après, vérification et décision owner sont strictement ordonnées.

### Parallel Opportunities

- T008-T010 peuvent avancer en parallèle après les modèles/validateurs communs.
- US1: T013-T014, T016-T019 travaillent sur des fichiers disjoints; T020-T024 restent séquentiels.
- US2: T025-T027 sont parallèles; T029/T031/T034 peuvent avancer en parallèle; T030 et T032 restent séquentiels dans `core/emit-figma-script.ts`.
- US3: T040-T041 sont parallèles après l'eval rouge; les deux runs live restent séquentiels.
- US4: T047-T048 sont parallèles après l'eval rouge; capture, comparaison et gate owner restent séquentiels.
- T053-T054 peuvent être documentés en parallèle seulement après les preuves vertes.

---

## Parallel Example: User Story 1

```text
Task T013: fixture absolute-lowering dans evals/fixtures/figma-projection-repair/absolute-lowering-check.ts
Task T014: fixture direct-geometry dans evals/fixtures/figma-projection-repair/direct-geometry-repair-check.ts

Après T015 rouge :
Task T016: lowering générique dans core/emit-figma-script.ts
Task T017: fidélité layout dans scripts/plugin-engine-mock-figma.mjs
Task T018: opération Catégories dans specs/021-figma-projection-repair/repairs/categories-principales.json
Task T019: opération Réalisations dans specs/021-figma-projection-repair/repairs/realisations.json
```

## Parallel Example: User Story 2

```text
Task T025: fixture propriété composée dans evals/fixtures/figma-projection-repair/composed-parent-prop-forwarding-check.ts
Task T026: fixture icon swap dans evals/fixtures/figma-projection-repair/icon-instance-swap-visible-check.ts
Task T027: fixture impacts partagés dans evals/fixtures/figma-projection-repair/shared-consumer-impact-check.ts

Après T028 rouge :
Task T029: source Formulaire dans contracts/formulaire.contract.json
Task T031: mock properties dans scripts/plugin-engine-mock-figma.mjs
Task T034: graphe d'impact dans specs/021-figma-projection-repair/campaign/campaign.json
```

## Parallel Example: User Story 3

```text
Après T039 rouge :
Task T040: comparaison idempotence dans extract/figma/projection-repair/verify.ts
Task T041: reçu idempotence dans extract/figma/projection-repair/report.ts
```

## Parallel Example: User Story 4

```text
Après T046 rouge :
Task T047: validation/génération des reçus dans extract/figma/projection-repair/report.ts
Task T048: vérification hors-zone/images/impacts dans extract/figma/projection-repair/verify.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Terminer Setup et Foundational, y compris la capture globale T012.
2. Écrire et faire échouer T013-T015.
3. Implémenter T016-T021 sans mutation live prématurée.
4. Dry-run, appliquer puis vérifier T022-T024.
5. **STOP AND VALIDATE**: Hero, SAV, Catégories et Réalisations correspondent aux références 020 sans diff hors zone.

### Incremental Delivery

1. Setup + fondation → pins, captures et refus prêts.
2. US1 → sections visuelles restaurées et testées indépendamment.
3. US2 → contrôles/propriétés vivants et consommateurs revalidés.
4. US3 → mécanismes protégés et reconstruction ×2 identique.
5. US4 → comparaison globale, décisions owner et reçus 7/7.
6. Polish → claims documentés, quickstart et gates finaux.

### Parallel Team Strategy

Le code headless sur fichiers disjoints peut suivre les groupes `[P]`. Les tâches T012, T023-T024,
T036-T037, T043-T044 et T049-T052 utilisent le canvas partagé et restent toujours sous le writer
unique prévu par le plan, même si plusieurs contributeurs sont disponibles.

---

## Notes

- `[P]` signifie fichiers disjoints et aucune dépendance inachevée, jamais écriture canvas parallèle.
- Chaque story conserve son test indépendant et son checkpoint.
- Toute capture absente, mauvais pin, image déplacée, consommateur ouvert ou diff hors allowlist bloque la suite.
- Les comptes d'evals ne sont jamais figés dans la documentation vivante.
- Committer après chaque tâche ou groupe logique vérifié; ne jamais corriger un output généré à la main.
