# Tasks: Vague responsive des sections

**Input**: Design documents from `/specs/031-vague-responsive-sections/`

**Prerequisites**: `plan.md` (requis), `spec.md` (requis — user stories), `research.md` (R1–R13),
`data-model.md` (entités de vague), `contracts/{gates-de-vague,dossier-campagne,registre-ecarts}.md`

**Tests**: **Aucune tâche de test.** FR-015 gèle le runner et les Assumptions consomment 030
« tel quel » : aucune fixture, aucun eval nouveau. Les portes sont celles du runner existant,
invoquées telles quelles ; les contrats FR-011 / FR-014 sont **documentaires** et ne seront
jamais présentés comme des contrôles automatiques (recherche R7, §II).

**Organization**: tâches groupées par user story. L'ordre des phases suit l'**ordre d'exécution
réel** de la vague — US2 (la proposition) précède US1 (la planche et la séance), parce que
l'*Independent Test* de US1 exige « une campagne **préparée** ».

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallélisable (fichiers différents, zones §XI disjointes, aucune dépendance ouverte)
- **[Story]**: US1, US2, US3
- Chemins exacts dans chaque description

## Path Conventions

- **Niveau vague** (une seule fois) : `specs/031-vague-responsive-sections/`
- **Niveau campagne** (écrit par le runner) : `specs/component-repairs/<cible>/run-NNN/`
- **Dépôt** : trois fichiers modifiés attendus — `parity/baseline.json`,
  `parity/snapshots/figma-components.json`, `MILESTONES.md`. Rien d'autre (SC-008).

### Règle des numéros de run — jamais un `run-NNN` supposé libre

Huit des treize cibles portent **déjà** des runs de specs antérieures, avec leurs reçus
d'application et leurs captures `before/`. Écrire dans un run occupé détruit un état-avant
archivé, irrécupérable (§X, §V). **Le numéro de run se dérive à l'exécution : premier libre,
jamais un littéral repris d'un document.** État relevé le 2026-08-27 — à re-mesurer avant
d'écrire, la vérité est le disque :

| Cible | Runs existants | 1ᵉʳ libre |
|---|---|---|
| `reassurances`, `formulaire`, `coordonnees`, `produits-ecommerce` | aucun | `run-001` |
| `hero` | aucun (`audit-2026-08-11.md` seul) | `run-001` |
| `presentation`, `devis`, `sav`, `texte-seo`, `equipe` | `run-001` | `run-002` |
| `google-reviews` | `run-001`, `run-002` | `run-003` |
| `faq` | `run-001` … `run-004` | `run-005` |
| `hero-video` | `run-001` … `run-005` | `run-006` |

**Nom de dossier de la 11ᵉ section** : la cible Figma « Section Avis Google » (`2545:5685`)
est appelée `google-reviews-section` par FR-002 ; son dossier de campagne existant est
`specs/component-repairs/google-reviews/`. **Le dossier fait foi** — ne pas en créer un
second sous un nom voisin (constat C9 de l'analyse du 2026-08-27).

**Les 13 campagnes** (R1) : `reassurances` (**existing**, 6 membres) · 11 **additives** à
2 membres — `presentation`, `devis`, `formulaire`, `coordonnees`, `faq`, `sav`, `texte-seo`,
`hero`, `equipe`, `produits-ecommerce`, `google-reviews-section` · `hero-video` (**renommage**,
0 membre, blocage nommé d'avance R3). **28 membres créés, zéro supprimé, zéro identité changée.**

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: rendre le worktree autosuffisant et poser l'arborescence de vague avant tout relevé

- [X] T001 Rendre le worktree autosuffisant (`npm install` puis `npx playwright install chromium`) depuis `/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/just-euphonium` — Worktree Gates F1
- [X] T002 [P] Créer l'arborescence de vague `specs/031-vague-responsive-sections/{decisions,inventory,boards,proofs}/` (+ `proofs/selecteurs/`) conformément à la Project Structure de `plan.md`
- [X] T003 [P] Initialiser `specs/031-vague-responsive-sections/inventory/registre-ecarts.json` en tableau vide au schéma de `contracts/registre-ecarts.md` — le registre est créé **avant** le premier écart, jamais après coup
- [X] T004 [P] Vérifier que la fiche D1–D9 est signée dans `specs/030-outillage-vague-responsive/inventory/fiche-decisions-vague.md` et en citer la référence dans `specs/031-vague-responsive-sections/inventory/prerequis-g0.md` — non signée ⇒ **STOP** (G0)
- [X] T005 Relever l'état des ports 9223-9232 via `figma_get_status` (probe `portFallbackUsed:false`), compter les canaux d'écriture sains, et consigner le compte dans `specs/031-vague-responsive-sections/inventory/prerequis-g0.md`

---

## Phase 2: Foundational — Gate G0 (Blocking Prerequisites)

**Purpose**: mesurer les prérequis au lieu de les supposer, épingler l'état-avant, calculer la
partition §XI. **Aucune campagne ne peut démarrer avant la fin de cette phase.**

**⚠️ CRITICAL**: §X et FR-007 rendent cette phase indivisible — un prérequis manquant bloque les 13.

- [X] T006 Passer le sweep de qualité complet dans le worktree (`npm run build`, `npm run parity`, `npm run eval`, `npm run plugin:check`, `npx tsx scripts/deterministic-roundtrip.mjs`, `node scripts/core-browser-check.mjs`, `npx tsc --noEmit`, `npx tsc -p tsconfig.build.json`) et archiver la sortie dans `specs/031-vague-responsive-sections/proofs/sweep-G0.md` — seul rouge toléré : la dette golden 028 préexistante, **strictement inchangée**
- [X] T007 Épingler la version Figma nommée **`031-avant-vague`** sur `Piqueray (Copy)` / `d9FYAUcqdcNtsuaMgLefvJ` via `saveVersionHistoryAsync`, et en consigner l'id dans `specs/031-vague-responsive-sections/inventory/prerequis-g0.md` (§X : état-avant complet, plus fort que des PNG échantillonnés)
- [X] T008 Relever en lecture seule le **nœud parent** de chacun des 13 masters (ids R1 : `2114:3721`, `2103:2824`, `2096:2524`, `2096:2564`, `2104:2904`, `2104:2914`, `2108:3105`, `2108:3123`, `2111:3382`, `2115:3947`, `2116:4475`, `2545:5685`, `2580:7392`) et en dériver la partition §XI dans `specs/031-vague-responsive-sections/inventory/partition-zones.json` — parents distincts ⇒ 3 writers ; parent unique ⇒ **créations de set sérialisées**, reste de la chaîne parallèle ; cas mixte ⇒ un writer par groupe de parent (R5). Y déclarer aussi la **zone de planches** consommée par T042, disjointe des 13 zones de campagne
- [X] T009 Relever le cliché vif des composants et le **comparer** à `parity/snapshots/figma-components.json` (`extractedAt` attendu `2026-08-26T19:17:16Z`, commit `7d03a860`), puis écrire le verdict « frais / à rafraîchir » avec sa preuve dans `specs/031-vague-responsive-sections/inventory/prerequis-g0.md` — R4 : le cliché est présumé frais, la **mesure** tranche
- [X] T010 **NON DÉCLENCHÉ** (T009 conclut « frais » : 64/64 composants identiques, `identical: true`) — Si et seulement si T009 conclut « à rafraîchir » : rafraîchir puis commiter `parity/snapshots/figma-components.json` **avant** toute mutation, et l'inscrire au registre d'écarts
- [X] T011 Inscrire au registre `specs/031-vague-responsive-sections/inventory/registre-ecarts.json` les trois écarts connus d'avance, **tous en famille `vague`** — `E-031-001` (set d'essai `TEST/Reassurances Responsive — Controlled`, `2563:5844`, axe `Viewport`, R11/§VIII), `E-031-002` (le renommage `HeroVideo` n'a aucun chemin runner, R3), `E-031-003` (le preflight verrous s'arrête au premier ancêtre non-COMPONENT, R13) — phase `G0`, horodatage du **constat**. Aucune ligne de famille `campagne` n'est écrite ici : elle exige un `verdict` et des `exigencesCouvertes`, inconnus à G0, et il n'en existe qu'**une** par campagne, écrite à T070
- [X] T012 Si moins de 3 writers sains (T005) : **annoncer** le repli séquentiel avec son coût (+1 h 45) dans `specs/031-vague-responsive-sections/inventory/prerequis-g0.md` — repli annoncé, jamais subi ; jamais deux agents sur la même zone
- [X] T013 Écrire `specs/031-vague-responsive-sections/proofs/gate-G0.md` au gabarit de `contracts/gates-de-vague.md` : re-citation des exigences visées (FR-002, FR-007 préparation, FR-010, SC-004), colonne « couverte / non couverte » et **chemin de preuve** par ligne — une exigence « couverte » sans preuve rend le gate **non franchi**

**Checkpoint**: G0 franchi — prérequis mesurés, état-avant épinglé, partition §XI connue. La préparation des 13 campagnes peut commencer.

---

## Phase 3: User Story 2 — Les 12 sections sont proposées, l'owner ne corrige que ce qui cloche (Priority: P1) 🎯 MVP

**Goal**: produire, pour les 13 cibles, une proposition **finie** — la version mobile dérivée de
la structure observée et des usages relevés, les défauts D1–D9 appliqués, chaque dérogation
motivée — jusqu'au dry-run vert, **avant** toute sollicitation de l'owner.

**Independent Test**: sur une section, vérifier que la proposition mobile est justifiée par des
faits relevés (structure observée + usages comptés) et non par une règle générique ; vérifier que
D1–D9 sont appliqués et que **chaque** écart porte sa ligne motivée.

**Borne d'exécution** : `--until dry-run` (R6). `audit`, `preflight` et `capture-before` sont
read-only, `dry-run` n'écrit pas — aucune garantie n'est levée, et §X/FR-007 est satisfait pour
les **13** cibles avant la première mutation.

- [X] T014 [US2] Confirmer la 1ʳᵉ section additive pilote — **`presentation`** par défaut (structure 2 colonnes, la plus documentée du dépôt) ; si `specs/031-vague-responsive-sections/inventory/partition-zones.json` la place dans la **même zone** que `reassurances`, lui substituer la première additive d'une zone distincte — et inscrire le choix et son critère dans une **ligne de registre** (famille `vague`, phase `G1`) puis dans `proofs/gate-G1.md` — **pas** dans `inventory/prerequis-g0.md`, artefact clos par T013 au gate G0
- [~] T015 [US2] **BLOQUÉ — voir `specs/component-repairs/reassurances/run-001/blocage-ajout-axe.md` et registre `E-031-011`.** Relevé read-only fait (`releve-bridge.json`, 3 membres + 6 usages par position) ; manifeste écrit à la main et **validé** ; le générateur, lui, refuse (`presentation-not-selected`) — `reassurances` — audit frais (`npm run component:repair -- --audit`, usages scannés **par position** jamais par nom, §VIII) puis manifeste généré (`npm run component:repair:manifest -- --releve <audit.json> --out specs/component-repairs/reassurances/run-001/campaign.json`) en branche **`setIdentityPolicy: "existing"`**, matrice `Presentation{Wide,Desktop,Mobile} × Disposition{4 cartes, QuatreCartesDeuxCta, 5 cartes}` = 9 membres dont **6 créés**
- [~] T016 [US2] **BLOQUÉ (E-031-011).** — `reassurances` — trancher les champs `generated.nonDeductible[]` de `specs/component-repairs/reassurances/run-001/campaign.json` contre D1–D9 : dérivation mobile depuis la structure observée + les usages relevés, `typographyOverrides` bornés (taille, interligne, alignement) chacun étiqueté `pending-responsive-text-style` avec son `decisionRef` (R12), et déclarer le nœud `2563:5844` en **lecture seule** tant que R11 n'est pas tranché. Un manifeste généré est légal, **pas prêt à poser**
- [~] T017 [US2] **BLOQUÉ (E-031-011) : le pont refuse `Responsive member cardinality drift`, fail-closed, avant tout clone — la branche `existing` n'ajoute pas d'axe.** — `node scripts/component-repair-drive.mjs --campaign specs/component-repairs/reassurances/run-001/campaign.json --capture-mode full --until dry-run` : `preflight-locks.json`, `captures/before/`, `receipts/dry-run.json`, `drive-journal.jsonl`. Chaque verrou `blocking` est corrigé **à la source** ou porté en `lockWaivers[]` avec son `decisionRef` (D8, FR-008)
- [X] T018 [US2] `presentation` (pilote additive) — audit frais + manifeste généré en branche **`additive`** dans `specs/component-repairs/presentation/run-002/campaign.json` (**`run-001` existe et porte les reçus + captures d'une spec antérieure — ne jamais y écrire**, cf. règle des numéros de run) (2 membres créés : `Desktop`, `Mobile` ; l'historique devient `Presentation=Wide`, **défaut**), avec le **nœud parent** relevé à T008 déclaré dans `writeBoundary.allowedExistingNodeIds` **et** `changedNodeIds` (R5, sinon `responsive-operation-not-allowlisted`)
- [X] T019 [US2] `presentation` — trancher les non-déductibles contre D1–D9, dériver le mobile de la structure observée (2 colonnes) et des usages relevés, `typographyOverrides` étiquetés `pending-responsive-text-style`, une ligne motivée par dérogation
- [X] T020 [US2] `presentation` — driver `--capture-mode full --until dry-run` ; traiter les verrous `blocking` (source ou `lockWaivers[]` référencée)
- [X] T021 [P] [US2] `devis` — chaîne de préparation complète en `--capture-mode light` : audit frais → manifeste `additive` (`specs/component-repairs/devis/run-002/campaign.json` — `run-001` est occupé, cf. règle des numéros de run ; nœud `2096:2524`, parent déclaré) → non-déductibles tranchés contre D1–D9 avec dérogations motivées → driver `--until dry-run` → verrous `blocking` traités
- [X] T022 [P] [US2] `formulaire` — même chaîne en `light`, nœud `2096:2564` ; la dérivation mobile part de la **structure de formulaire observée**, pas d'une règle de vague (FR-003)
- [X] T023 [P] [US2] `coordonnees` — même chaîne en `light`, nœud `2104:2904`
- [X] T024 [P] [US2] `faq` — même chaîne en `light`, nœud `2104:2914`, **`run-005`** (quatre runs occupés) ; la dérivation mobile part de la **structure de liste/accordéon observée** (FR-003)
- [X] T025 [P] [US2] `sav` — même chaîne en `light`, nœud `2108:3105`, **`run-002`**
- [X] T026 [P] [US2] `texte-seo` — même chaîne en `light`, nœud `2108:3123`, **`run-002`**
- [X] T027 [P] [US2] `hero` — même chaîne en `light`, nœud `2111:3382` ; **distinct de `HeroVideo`** (composant séparé, campagne 13)
- [X] T028 [P] [US2] `equipe` — même chaîne en `light`, nœud `2115:3947`, **`run-002`** ; la dérivation mobile part de la **grille observée** (FR-003)
- [X] T029 [P] [US2] `produits-ecommerce` — même chaîne en `light`, nœud `2116:4475`, `run-001`
- [X] T030 [P] [US2] `google-reviews-section` — même chaîne en `light`, nœud `2545:5685`, dans le dossier **existant** `specs/component-repairs/google-reviews/`, **`run-003`** (C9 : un seul dossier pour cette cible, jamais un second sous un nom voisin)
- [~] T031 [US2] **Preuve du blocage écrite** (`specs/component-repairs/hero-video/run-006/blocage-renommage.md`, registre `E-031-002`). Manifeste et capture-avant NON produits : aucune mutation n'est proposée sur cette cible, et l'état-avant est épinglé plus fortement par la version `031-avant-vague` (fichier entier). — `hero-video` (campagne 13, renommage `Presentation=Compact` → `Mobile`, nœud `2580:7392`) — audit frais + manifeste généré + **capture-avant** (§X : la 13ᵉ cible est capturée comme les autres) + **preuve du blocage R3** dans `specs/component-repairs/hero-video/run-006/blocage-renommage.md` (**`run-001` à `run-005` sont occupés — `run-004` porte notamment `before/`, `dry-run.json` et ses PNG de scénario**) : aucune branche du mécanisme `responsive-component-set` ne déclare un renommage de membre, `bridge-script.ts` l. 608 lève `Responsive component-set topology drift`, et le chemin `rename+merge` de la matrice de capacités est fermé par gouvernance (D1/FR-013), pas par capacité
- [X] T032 [US2] Vérifier, pour les **13**, que chaque capture-avant est **non vide et correctement dimensionnée** et que chaque dry-run est vert — une seule capture manquante bloque **toute** la vague (§X n'est pas divisible) ; consigner la table de contrôle dans `specs/031-vague-responsive-sections/proofs/captures-avant-13.md`
- [X] T033 [US2] Écrire `specs/031-vague-responsive-sections/proofs/gate-G1.md` : re-citation des exigences visées (FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-014), campagnes concernées, exigences couvertes / non couvertes **avec chemin de preuve**

**Checkpoint**: G1 franchi — 13 manifestes tranchés, 13 preflights, 13 captures-avant vérifiées, 13 dry-runs verts. Aucune mutation posée.

---

## Phase 4: User Story 1 — L'owner voit ce qu'il valide, et surtout ce qu'il n'aura pas (Priority: P1)

**Goal**: 13 planches au gabarit fixe qui disent en français ce que l'owner **verra** et ce qu'il
**n'aura pas**, montrent le sélecteur **avant → après**, et présentent les rendus à taille réelle
**uniquement aux largeurs où la sortie diffère** ; puis une séance, 13 décisions individuelles.

**Independent Test**: prendre une campagne préparée, générer sa planche, vérifier les 7 zones, les
mentions négatives en français et la capture du sélecteur avant→après. **Une planche dont la zone
« ce que vous n'aurez pas » est vide n'est pas présentable.**

- [ ] T034 [US1] Assembler l'inventaire d'usages **pondéré** des 13 cibles dans `specs/031-vague-responsive-sections/inventory/usages-ponderes.json` depuis les `audit.json` (usages par position) — configuration dominante d'abord, exception marquée
- [ ] T035 [US1] Produire le manifeste de témoins D9 (**6 largeurs × 2 contenus**) dans `specs/031-vague-responsive-sections/boards/witnesses.json`, en ne retenant par campagne que les largeurs où **la sortie diffère** — largeurs identiques nommées une fois, jamais dupliquées (§XII)
- [ ] T036 [P] [US1] Capturer le sélecteur de variantes **avant** (vif, read-only, `figma_capture_screenshot`) pour les 13 cibles dans `specs/031-vague-responsive-sections/proofs/selecteurs/<campagne>-avant.png` ; l'état **après** est rendu par le script de planche depuis `expectedMemberNames` du manifeste — les deux témoins alimentent la zone « sélecteur avant→après »
- [ ] T037 [P] [US1] Rédiger les 11 fiches de décision de section proposées dans `specs/031-vague-responsive-sections/decisions/031-<section>.json` (`presentation, devis, formulaire, coordonnees, faq, sav, texte-seo, hero, equipe, produits-ecommerce, google-reviews-section`) au schéma 030 : `pickerConsequence` **en français**, `acceptedFacts[]` en forme longue `{fact, nature: "visuel"|"structurel", witnessRef}` — tout fait `structurel` (topologie, sélecteur, axes, Text Styles) porte son témoin, sinon `structural-fact-unwitnessed`
- [ ] T038 [P] [US1] Rédiger `specs/031-vague-responsive-sections/decisions/031-reassurances.json` — matrice 3×3 (6 membres créés) **plus** le sort du set d'essai `TEST/Reassurances Responsive — Controlled` `2563:5844` posé en option owner (supprimer / archiver / laisser) ; aucun agent ne supprime de nœud (R11, §VIII)
- [ ] T039 [P] [US1] Rédiger `specs/031-vague-responsive-sections/decisions/031-hero-video-renommage.json` — les deux issues de R3 posées en option owner : **geste bridge manuel gouverné** (précédent 029 run-002, avec les 6 garanties perdues listées) **ou** statut **`reportée`** FR-018 avec relais au chantier suivant
- [ ] T040 [US1] Générer les planches : `npm run component:repair:board -- --decisions specs/031-vague-responsive-sections/decisions --witnesses specs/031-vague-responsive-sections/boards/witnesses.json --usages specs/031-vague-responsive-sections/inventory/usages-ponderes.json --out specs/031-vague-responsive-sections/boards/` → `board.bridge.js` + `zones.json` par campagne
- [ ] T041 [US1] Vérifier les 13 `zones.json` : **7 zones** présentes, zone « ce que vous n'aurez pas » **non vide** et en français, archive technique **référencée sans être étalée**, et **zéro** refus `structural-fact-unwitnessed` / `witness-missing-for-width` / `negative-statements-missing` — consigner dans `specs/031-vague-responsive-sections/proofs/planches-13.md`
- [ ] T041b [US1] Vérifier la **fidélité §XII** des mêmes 13 `zones.json`, que le contrôle des 7 zones ne couvre pas : (a) chaque nœud témoin porte **la largeur cible réelle** (`width` du nœud = largeur nommée, aucune mise à l'échelle), (b) deux témoins comparés côte à côte sont au **même zoom**, (c) une largeur dont la sortie est identique est **nommée une fois** et renvoyée à l'archive technique, jamais dupliquée d'une option à l'autre, (d) si une planche est exportée en PNG à une échelle ≠ 1, **l'échelle est écrite** sur l'export et les nœuds de décision restent 1:1 sur le canevas. Une planche mise à l'échelle sans mention **n'est pas présentable** — consigner le relevé dans `proofs/planches-13.md`
- [ ] T042 [US1] Exécuter les 13 `board.bridge.js` sur le pont figma-console pour matérialiser les planches (exécution vive — hors périmètre 030, dans celui de 031), sur une **zone de planches dédiée**, déclarée dans `specs/031-vague-responsive-sections/inventory/partition-zones.json` et **disjointe des 13 zones d'écriture** de T008. **C'est la seule écriture vive antérieure au GO owner** : elle crée des nœuds de présentation, elle ne touche aucun master, aucun membre historique et aucun parent de campagne — l'invariant « pas de mutation de cible avant le GO » tient. Vérifier après exécution que les ids créés n'intersectent aucune zone de campagne
- [ ] T043 [US1] Produire le sommaire de triage `specs/031-vague-responsive-sections/proofs/sommaire-seance.md` : **lot standard** vs **lot à décisions** — toute campagne dont le **sélecteur change** sort d'office vers le lot à décisions ; `reassurances` (R11) et `hero-video` (R3) y sont d'office
- [ ] T044 [US1] **Séance owner (touche 1 sur 2)** — présenter les 13 planches finies, non retouchées pendant la séance ; enregistrer **séance tenante** une décision individuelle par campagne dans `specs/031-vague-responsive-sections/decisions/` avec son `conversationEvidence` (**un mot de l'owner = exactement une décision d'une campagne**, aucun accord ne couvre un lot) ; trancher R3 et R11 ; la séance **ne se termine pas** avant les 13 décisions — un dépassement de 45 min n'autorise **aucune** approbation ni report en rafale
- [ ] T045 [US1] Écrire `specs/031-vague-responsive-sections/proofs/gate-G2.md` : re-citation des exigences visées (FR-005, FR-006, FR-012, SC-002, SC-007, SC-009), 13 décisions référencées avec leur chemin de preuve

**Checkpoint**: G2 franchi — 13 décisions individuelles enregistrées, sort du renommage et du set d'essai tranchés. Une seule touche owner consommée.

---

## Phase 5: User Story 3 — Une journée, deux touches owner, aucune dérive silencieuse (Priority: P2)

**Goal**: exécuter la vague — pilotes, lot sur zones disjointes, **un seul** cycle de vérification
global, clôture avec les reports d'abord puis l'acceptation globale.

**Independent Test**: rejouer le déroulé sur les artefacts d'une section et vérifier que chaque
gate re-cite les exigences de `spec.md` et coche celles que la campagne couvre.

### Pilotes — G3 (le seul gate qui peut annuler la journée)

- [ ] T046 [US3] Attribuer writers et ports (9223-9232, un port par writer) aux zones de `specs/031-vague-responsive-sections/inventory/partition-zones.json` → `specs/031-vague-responsive-sections/inventory/affectation-writers.json` ; parent unique ⇒ **sérialiser** les seules étapes `bridge-first`/`bridge-second`, le reste de chaque chaîne reste parallèle (R5)
- [ ] T047 [US3] **Pilote 1 — `reassurances`** (`existing`, `--capture-mode full`) : `node scripts/component-repair-drive.mjs --campaign specs/component-repairs/reassurances/run-001/campaign.json --resume` — la capacité « créations déclarées dans un set existant » construite par 029 (`ec311497`) et **jamais exercée en vif** doit tomber ici si elle doit tomber
- [ ] T048 [US3] Vérifier le **second passage sans effet** de `reassurances` dans `specs/component-repairs/reassurances/run-001/receipts/apply-second.json` : `createdNodeIds: []`, `createdNodes: []`, `changedNodeIds: []`, `pageWrites: []`, `childWrites: []` (SC-005)
- [ ] T049 [US3] **Pilote 2 — `presentation`** (1ʳᵉ additive, `--capture-mode full`) : chaîne complète par `--resume`, puis même vérification de second passage no-op — couvre la combinaison `additive + light + driver` pour les 10 sections restantes
- [ ] T050 [US3] Re-passer le sweep de qualité complet après les pilotes et l'archiver dans `specs/031-vague-responsive-sections/proofs/sweep-G3.md` — dette golden 028 **strictement inchangée**
- [ ] T051 [US3] Écrire `specs/031-vague-responsive-sections/proofs/gate-G3.md` : re-citation (FR-009, FR-013, FR-015, SC-005) et **règle d'arrêt** — tout échec ou toute dérive **arrête la vague** ; le remède est un correctif accompagné de **sa fixture**, jamais un contournement manuel

### Lot et vérification globale — G4

- [ ] T052 [P] [US3] Appliquer `devis` en `--capture-mode light` (`--resume` jusqu'à `verify` exclu), sur sa zone assignée — **l'agent d'écriture ne conduit pas sa propre vérification** (FR-010, §XI)
- [ ] T053 [P] [US3] Appliquer `formulaire` en `light` sur sa zone assignée, sans vérification propre
- [ ] T054 [P] [US3] Appliquer `coordonnees` en `light` sur sa zone assignée, sans vérification propre
- [ ] T055 [P] [US3] Appliquer `faq` en `light` sur sa zone assignée, sans vérification propre
- [ ] T056 [P] [US3] Appliquer `sav` en `light` sur sa zone assignée, sans vérification propre
- [ ] T057 [P] [US3] Appliquer `texte-seo` en `light` sur sa zone assignée, sans vérification propre
- [ ] T058 [P] [US3] Appliquer `hero` en `light` sur sa zone assignée, sans vérification propre
- [ ] T059 [P] [US3] Appliquer `equipe` en `light` sur sa zone assignée, sans vérification propre
- [ ] T060 [P] [US3] Appliquer `produits-ecommerce` en `light` sur sa zone assignée, sans vérification propre
- [ ] T061 [P] [US3] Appliquer `google-reviews-section` en `light` sur sa zone assignée, sans vérification propre
- [ ] T062 [US3] Conduire **un seul** cycle de vérification global, possédé par l'orchestrateur, sur les 10 campagnes du lot (`verify` + `comparison.json` + second passage no-op de chacune) → `specs/031-vague-responsive-sections/proofs/verification-globale-G4.md`. Y inclure le contrôle **section par section, jamais par sondage** exigé par SC-001 : pour chaque cible livrée, la matrice attendue est **énumérée** (12 sections : `Presentation{Wide,Desktop,Mobile}` = 3 membres, défaut = le membre historique ; `reassurances` : `Presentation{3} × Disposition{3}` = **9 membres**) et **chaque combinaison est commutée** une fois, avec son résultat écrit. Une matrice partiellement vérifiée n'est pas une matrice vérifiée. **Les deux pilotes y figurent aussi** : leur chaîne a été vérifiée à G3, mais SC-001 porte sur les **douze** sections — la table de ce fichier en compte douze lignes, pas dix
- [ ] T063 [US3] Traiter toute campagne cassée pendant le lot (enfant inaccessible, contenu qui déborde, verrou non prévu) : **sortie du lot** avec décision nommée, preuve du blocage et ligne de registre, sans arrêter les autres (FR-018) — jamais de bricolage
- [ ] T064 [US3] Rafraîchir `parity/snapshots/figma-components.json` après les créations (28 attendues) et le commiter. **Puis prouver SC-004 sur ce diff**, avant la clôture et non par le rejeu tardif du quickstart : comparer l'ancien cliché au nouveau et vérifier que la `componentKey` de **chaque membre historique** est inchangée, qu'aucun composant n'a disparu, et que les 28 nouveaux membres sont bien des **ajouts** — consigner dans `specs/031-vague-responsive-sections/proofs/identites-sc004.md`. Une identité changée est une régression, pas un détail de cliché
- [ ] T065 [US3] Ajouter les acquittements `figma|ahead|<Set>.Presentation` dans `parity/baseline.json` — **un par section livrée**, soit **+12 si les douze passent : total 12 → 24 entrées**, dont les entrées `.Presentation` passent de **2 à 14** (les deux existantes sont `CategoriesPrincipales.Presentation` et `HeroVideo.Presentation`, héritées de 028/029) — et **refuser par nom** le patch de promotion de `Presentation` en prop de contrat proposé par `npm run parity` (D1/FR-013) ; consigner le refus dans `specs/031-vague-responsive-sections/proofs/refus-promotion-contrat.md`
- [ ] T065b [US3] Traiter l'acquittement de la **13ᵉ campagne**, que le « +12 » ne couvre pas (FR-013 : « chaque campagne livrée, **y compris le renommage de `HeroVideo`**, porte son acquittement nommé ») : l'entrée `figma|ahead|HeroVideo.Presentation` **existe déjà** — si le renommage est appliqué, son contenu change (`Compact` → `Mobile`) et l'acquittement doit être **re-qualifié et re-daté**, pas ajouté ; si la campagne est **reportée**, l'entrée reste inchangée et la campagne prouve qu'aucune mutation n'a introduit de nouvelle dérive (FR-013, 2ᵉ phrase). Consigner le cas retenu dans `specs/031-vague-responsive-sections/proofs/refus-promotion-contrat.md`
- [ ] T066 [US3] Écrire `specs/031-vague-responsive-sections/proofs/gate-G4.md` : re-citation (FR-001, FR-010, FR-013, FR-018, SC-001, **SC-004**, SC-005, SC-006) avec chemin de preuve par ligne

### Clôture — G5 (touche 2 sur 2)

- [ ] T067 [US3] **Recueillir d'abord** chaque décision individuelle de **report** due à un blocage apparu **après** la séance (dont `hero-video` si l'owner a choisi FR-018) dans `specs/031-vague-responsive-sections/decisions/report-<campagne>.json` : cause nommée, référence de la preuve du blocage, entrée au brief du chantier suivant, mot de l'owner — elle **remplace l'autorisation d'appliquer sans effacer** la décision de design
- [ ] T068 [US3] Recueillir **ensuite** l'acceptation globale de la clôture — l'ordre est normatif (FR-012, FR-018) — et l'enregistrer dans `specs/031-vague-responsive-sections/decisions/acceptation-finale.json`
- [ ] T069 [US3] Exécuter `--finalize` sur les **13** campagnes depuis le dossier de décisions partagé `specs/031-vague-responsive-sections/decisions/` (`ownerDecisionRoot` unique — correctif E8 de 030 : une décision visant une autre cible est ignorée, le doublon interne et la décision manquante restent refusés)
- [ ] T070 [US3] Compléter `specs/031-vague-responsive-sections/inventory/registre-ecarts.json` — **13 lignes de campagne** (verdict, `exigencesCouvertes` non vide, `decisionRef`, `preuveRef`, `briefSuivant` si reporté) plus les lignes de vague constatées — puis en dériver la vue lisible `inventory/registre-ecarts.md` (dérivée, jamais l'inverse)
- [ ] T071 [US3] Produire l'inventaire de typographie mobile `specs/031-vague-responsive-sections/inventory/typographie-mobile.md` en **lisant** les `typographyOverrides` étiquetés `pending-responsive-text-style` dans les manifestes et les reçus — jamais re-saisi à la main ; c'est l'entrée de la décision d'unification ultérieure (FR-016, R12)
- [ ] T072 [US3] Épingler la version Figma nommée **`031-apres-vague`** et consigner son id dans `specs/031-vague-responsive-sections/proofs/versions-epinglees.md` avec celui de `031-avant-vague`
- [ ] T073 [US3] Passer le sweep final et vérifier que `git status --porcelain src/ figma-sync/ catalog/ contracts/ tokens/ core/ evals/` est **vide** (SC-008) ; archiver dans `specs/031-vague-responsive-sections/proofs/sweep-G5.md`
- [ ] T074 [US3] Ajouter l'entrée datée de la vague à `MILESTONES.md` (le `N/N` vivant de `npm run eval` est la seule autorité ; les chiffres n'y sont écrits que datés) et y **nommer** le trou de journal si les specs 011-016 y manquent toujours
- [ ] T075 [US3] Remplir la **table de contrôle de clôture** à 13 lignes de `contracts/dossier-campagne.md` dans `specs/031-vague-responsive-sections/proofs/table-cloture.md` : par campagne, les 4 pièces du socle, le supplément commandé par le verdict, et la colonne **« en trop »** — une case vide ou un « en trop » non vide ⇒ G5 **non franchi**
- [ ] T076 [US3] Écrire `specs/031-vague-responsive-sections/proofs/gate-G5.md` : re-citation (FR-011, FR-012, FR-014, FR-016, FR-017, FR-018, FR-019, SC-001, SC-002, SC-003, SC-008) et **bilan nommant séparément** les sections livrées sur douze, les sections reportées avec leur cause, et les campagnes « sans changement » — zéro campagne sans verdict

**Checkpoint**: les trois user stories sont livrées ; la vague est close sur des faits mesurés.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T077 [P] Rédiger le brief du chantier suivant `specs/031-vague-responsive-sections/inventory/brief-chantier-suivant.md` : campagnes reportées avec leur cause, enfants restés à traiter, `E-031-003` (limite du preflight verrous) et le renommage `HeroVideo` s'il est reporté
- [ ] T078 [P] Vérifier SC-003 campagne par campagne : chaque dossier porte **l'ensemble minimal de son verdict et rien d'autre** — aucune `spec.md`/`plan.md`/`research.md`/`data-model.md`/`quickstart.md`/`checklists/`/`contracts/` par campagne, aucun dossier `handoff/`
- [ ] T079 [P] Vérifier FR-019 : toute campagne close « sans changement » ne porte **aucun** `apply-*.json`, **aucune** capture `after` ni `idempotence` — un dossier « sans changement » qui porte un reçu d'application est un dossier faux. **Attendu d'après R1 : zéro campagne dans cet état** — aucune des 13 cibles ne porte déjà la matrice `Presentation`. Si un audit de G1 en produit une, l'inscrire d'abord au registre comme **écart de vague** (« R1 démenti par l'audit ») avec sa preuve de conformité, puis la finaliser au verdict `sans changement`
- [ ] T080 Rejouer `specs/031-vague-responsive-sections/quickstart.md` de bout en bout — étapes 1, 3, 4, 7 hors ligne, étapes 2, 5, 6 sur le pont — et consigner les écarts dans `proofs/quickstart-rejoue.md`
- [ ] T081 [P] Re-passer `specs/031-vague-responsive-sections/checklists/requirements.md` et cocher les items couverts avec leur chemin de preuve

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** : aucune dépendance.
- **Foundational / G0 (Phase 2)** : dépend de Phase 1 — **bloque les trois user stories**. §X et FR-007 la rendent indivisible.
- **US2 (Phase 3)** : dépend de G0. Produit les propositions finies jusqu'au dry-run.
- **US1 (Phase 4)** : dépend de **US2** — l'*Independent Test* de US1 exige « une campagne **préparée** ». C'est la raison pour laquelle US2 précède US1 malgré la priorité P1 partagée.
- **US3 (Phase 5)** : dépend de **US1** — **aucune écriture sur une cible de campagne** avant le GO owner (T044). Le GO garde les **mutations de cible**, pas les relevés. Une seule écriture vive précède le GO, et elle est nommée : **T042**, la matérialisation des planches, sur une **zone dédiée disjointe** des zones d'écriture de T008 — elle ne touche aucun master, aucun membre, aucun parent de campagne.
- **Polish (Phase 6)** : dépend de G5.

### User Story Dependencies

- **US2 (P1)** : démarre après G0. Livre les 13 propositions ; testable seule (une section suffit).
- **US1 (P1)** : démarre après US2. Livre les 13 planches et les 13 décisions ; testable sur une campagne préparée.
- **US3 (P2)** : démarre après US1. Livre l'exécution et la clôture ; testable en rejouant le déroulé sur une section.

### Within Each Story

- US2 : audit → manifeste généré → non-déductibles tranchés → preflight → capture-avant → dry-run. Jamais d'étape d'écriture sans son dry-run.
- US1 : usages + témoins → fiches proposées → génération de planche → vérification des 7 zones → matérialisation → triage → séance.
- US3 : pilote `existing` → pilote `additive` → lot → **un seul** cycle de vérification → reports → acceptation globale → finalisation.

### Parallel Opportunities

- **Phase 1** : T002, T003, T004 en parallèle.
- **Phase 3 (US2)** : T021–T030 (10 sections) en parallèle sur zones disjointes — la préparation est read-only, seule la partition de T008 borne le parallélisme des étapes d'écriture ultérieures. T031 (`hero-video`) est indépendant de tout.
- **Phase 4 (US1)** : T036, T037, T038, T039 en parallèle (fichiers distincts).
- **Phase 5 (US3)** : T052–T061 (10 campagnes) en parallèle, **un writer par zone, un port par writer**, aucune vérification propre. T062 est un **barrage** : le cycle de vérification global est unique et appartient à l'orchestrateur.
- **Phase 6** : T077, T078, T079, T081 en parallèle.

---

## Parallel Example: Phase 5, lot de 10

```bash
# Un writer par zone de partition-zones.json, un port par writer (9223-9232).
# Aucun agent ne conduit sa propre vérification — T062 la conduit une fois pour tous.
Task: "Appliquer devis en light sur sa zone assignée"                  # T052
Task: "Appliquer formulaire en light sur sa zone assignée"             # T053
Task: "Appliquer coordonnees en light sur sa zone assignée"            # T054
# … jusqu'à T061
# Si partition-zones.json révèle un parent UNIQUE : les étapes bridge-first /
# bridge-second se sérialisent sur ce parent ; le reste de chaque chaîne
# (captures, scénarios) reste parallèle. Coût annoncé, pas découvert (R5).
```

---

## Implementation Strategy

### MVP First (US2 seule)

1. Phase 1 : Setup.
2. Phase 2 : G0 — **bloquant**, indivisible.
3. Phase 3 : US2 — 13 propositions finies, dry-runs verts, **zéro mutation posée**.
4. **STOP et VALIDER** : sur une section, la proposition mobile est-elle dérivée de faits relevés (structure + usages) et non d'une règle générique ? Chaque écart à D1–D9 porte-t-il sa ligne motivée ?
5. À ce point la vague est entièrement réversible : rien n'a été écrit sur le canevas.

### Livraison incrémentale

1. Setup + G0 → socle mesuré, état-avant épinglé.
2. + US2 → 13 propositions finies (MVP).
3. + US1 → 13 planches, 13 décisions individuelles (1ʳᵉ touche owner).
4. + US3 → pilotes, lot, clôture (2ᵉ touche owner).

### Stratégie d'équipe parallèle

1. G0 se fait ensemble — la partition §XI en dépend.
2. Phase 3 : 3 writers se partagent T021–T030 selon `partition-zones.json`.
3. Phase 4 : la séance est **une** — elle ne se parallélise pas.
4. Phase 5 : 3 writers sur le lot, **un seul** orchestrateur sur la vérification.

---

## Notes

- **Règle anti-idle** (puits n°1 de 029, 82 min d'attente owner à vide) : un agent qui atteint un gate exécute les tâches aval **sans gate** au lieu d'attendre.
- **Un mot de l'owner = exactement une décision d'une campagne.** Aucun accord ne couvre un lot (FR-012).
- **Zéro code de dépôt modifié** (R7, SC-008). Trois fichiers attendus au diff : `parity/baseline.json`, `parity/snapshots/figma-components.json`, `MILESTONES.md`. Toute autre modification est un défaut.
- **Le runner est gelé** (FR-015) : une section exigeant une capacité nouvelle **sort de la vague**. Aucun `wave:check` n'est écrit — l'écrire exigerait fixture + eval (§II), donc du runner modifié pendant la vague.
- **Les contrats FR-011 et FR-014 sont documentaires** et ne seront jamais présentés comme des contrôles automatiques.
- **Le mode de capture est fixé au premier usage d'un run** et ne change plus (`capture-mode-mismatch`) : `full` pour les deux pilotes, `light` pour le lot (R9).
- **Aucune écriture de Page**, aucune écriture d'enfant partagé (`pageWrites: []`, `childWrites: []`, gardés par `page-write-forbidden` / `shared-child-write-forbidden`).
- **Le registre est créé au premier écart, jamais après coup** — une ligne écrite le soir pour un fait constaté le matin est une reconstruction, pas une trace.
- Commit après chaque tâche ou groupe logique ; s'arrêter à n'importe quel checkpoint pour valider.
